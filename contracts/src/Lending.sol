// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title  Lending — Bulldex Finance Lending & Borrowing Protocol
/// @author Phantom (@wayphantomme)
/// @notice Aave-style over-collateralized lending.
///         Users deposit BDX as collateral, borrow MUSDC against it.
///         Health factor = collateralValueUSD * LTV / borrowedValueUSD
///         If healthFactor < 1.0 (1e18), position can be liquidated.
///
/// @dev    Price oracle is simplified for testnet:
///         BDX price is read from the BDX/MUSDC pool as spot price.
///         Production would use Chainlink.
contract Lending is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // ─── Constants ────────────────────────────────────────────────────────────

    /// @dev Loan-To-Value: max 75% of collateral value can be borrowed
    uint256 public constant LTV_NUMERATOR   = 75;
    uint256 public constant LTV_DENOMINATOR = 100;

    /// @dev Liquidation threshold: position liquidatable below 80% health
    uint256 public constant LIQ_THRESHOLD_NUMERATOR   = 80;
    uint256 public constant LIQ_THRESHOLD_DENOMINATOR = 100;

    /// @dev Liquidation bonus: liquidator receives 5% bonus
    uint256 public constant LIQ_BONUS_NUMERATOR   = 105;
    uint256 public constant LIQ_BONUS_DENOMINATOR = 100;

    /// @dev Interest rate: simple 5% annual, charged per borrow block (~12s/block)
    /// Approx: 5% / 365 days / 7200 blocks per day = ~0.0000019% per block
    uint256 public constant INTEREST_RATE_PER_BLOCK = 19; // 19 / 1_000_000_000 per block ≈ 5% APR
    uint256 public constant INTEREST_DENOMINATOR    = 1_000_000_000;

    uint256 constant PRECISION = 1e18;

    // ─── State ────────────────────────────────────────────────────────────────

    IERC20 public immutable collateralToken; // BDX
    IERC20 public immutable borrowToken;     // MUSDC
    address public          priceOracle;     // BDX/MUSDC pool address for price

    struct Position {
        uint256 collateral;       // BDX deposited (in wei)
        uint256 borrowed;         // MUSDC borrowed (in wei)
        uint256 borrowBlock;      // block when borrow started (for interest)
        uint256 interestAccrued;  // accumulated interest in MUSDC wei
    }

    mapping(address => Position) public positions;

    uint256 public totalCollateral;   // total BDX deposited
    uint256 public totalBorrowed;     // total MUSDC borrowed
    uint256 public reserveBalance;    // MUSDC in reserve (from interest + liquidations)

    // ─── Events ───────────────────────────────────────────────────────────────

    event CollateralDeposited(address indexed user, uint256 amount);
    event CollateralWithdrawn(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 amount);
    event Repaid(address indexed user, uint256 principal, uint256 interest);
    event Liquidated(
        address indexed liquidator,
        address indexed borrower,
        uint256 debtRepaid,
        uint256 collateralSeized
    );
    event PriceOracleUpdated(address newOracle);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error InsufficientCollateral();
    error InsufficientBorrowBalance();
    error ExceedsBorrowLimit();
    error PositionHealthy();
    error ZeroAmount();
    error InsufficientReserve();
    error ZeroAddress();

    // ─── Constructor ──────────────────────────────────────────────────────────

    /// @param _collateralToken BDX token address
    /// @param _borrowToken     MUSDC token address
    /// @param _priceOracle     BDX/MUSDC pool address (used as price oracle)
    /// @param _owner           Protocol owner (can update oracle, withdraw reserves)
    constructor(
        address _collateralToken,
        address _borrowToken,
        address _priceOracle,
        address _owner
    ) Ownable(_owner) {
        if (_collateralToken == address(0) || _borrowToken == address(0)) revert ZeroAddress();
        collateralToken = IERC20(_collateralToken);
        borrowToken     = IERC20(_borrowToken);
        priceOracle     = _priceOracle;
    }

    // ─── Collateral Management ────────────────────────────────────────────────

    /// @notice Deposit BDX as collateral.
    /// @param amount Amount of BDX to deposit
    function depositCollateral(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        collateralToken.safeTransferFrom(msg.sender, address(this), amount);
        positions[msg.sender].collateral += amount;
        totalCollateral += amount;
        emit CollateralDeposited(msg.sender, amount);
    }

    /// @notice Withdraw BDX collateral.
    ///         Reverts if withdrawal would make health factor < 1.
    /// @param amount Amount of BDX to withdraw
    function withdrawCollateral(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        Position storage pos = positions[msg.sender];
        if (pos.collateral < amount) revert InsufficientCollateral();

        // Check health factor after withdrawal
        uint256 newCollateral = pos.collateral - amount;
        uint256 totalDebt     = _totalDebt(msg.sender);
        if (totalDebt > 0) {
            uint256 bdxPrice  = getBdxPrice();
            uint256 newCollateralValueUSD = (newCollateral * bdxPrice) / PRECISION;
            uint256 maxBorrow = (newCollateralValueUSD * LTV_NUMERATOR) / LTV_DENOMINATOR;
            if (totalDebt > maxBorrow) revert ExceedsBorrowLimit();
        }

        pos.collateral  -= amount;
        totalCollateral -= amount;
        collateralToken.safeTransfer(msg.sender, amount);
        emit CollateralWithdrawn(msg.sender, amount);
    }

    // ─── Borrowing ────────────────────────────────────────────────────────────

    /// @notice Borrow MUSDC against deposited BDX collateral.
    ///         Max borrow = collateral value USD * 75% LTV.
    /// @param amount Amount of MUSDC to borrow
    function borrow(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        Position storage pos = positions[msg.sender];
        if (pos.collateral == 0) revert InsufficientCollateral();

        // Accrue interest before modifying borrow
        _accrueInterest(msg.sender);

        uint256 bdxPrice          = getBdxPrice();
        uint256 collateralValueUSD = (pos.collateral * bdxPrice) / PRECISION;
        uint256 maxBorrow          = (collateralValueUSD * LTV_NUMERATOR) / LTV_DENOMINATOR;
        uint256 totalDebt          = pos.borrowed + pos.interestAccrued;

        if (totalDebt + amount > maxBorrow) revert ExceedsBorrowLimit();

        // Check reserve has enough MUSDC
        if (borrowToken.balanceOf(address(this)) < amount) revert InsufficientReserve();

        pos.borrowed     += amount;
        pos.borrowBlock   = block.number;
        totalBorrowed    += amount;

        borrowToken.safeTransfer(msg.sender, amount);
        emit Borrowed(msg.sender, amount);
    }

    /// @notice Repay borrowed MUSDC + accrued interest.
    ///         Pass type(uint256).max to repay full debt.
    /// @param amount Amount of MUSDC to repay (principal + interest)
    function repay(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        Position storage pos = positions[msg.sender];
        if (pos.borrowed == 0 && pos.interestAccrued == 0) revert InsufficientBorrowBalance();

        // Accrue interest
        _accrueInterest(msg.sender);

        uint256 totalDebt = pos.borrowed + pos.interestAccrued;
        uint256 repayAmt  = amount > totalDebt ? totalDebt : amount;

        // Pay interest first, then principal
        uint256 interestPaid;
        uint256 principalPaid;
        if (repayAmt >= pos.interestAccrued) {
            interestPaid  = pos.interestAccrued;
            principalPaid = repayAmt - pos.interestAccrued;
        } else {
            interestPaid  = repayAmt;
            principalPaid = 0;
        }

        pos.interestAccrued -= interestPaid;
        pos.borrowed        -= principalPaid;
        totalBorrowed       -= principalPaid;
        reserveBalance      += interestPaid; // interest goes to protocol reserve

        borrowToken.safeTransferFrom(msg.sender, address(this), repayAmt);
        emit Repaid(msg.sender, principalPaid, interestPaid);
    }

    // ─── Liquidation ─────────────────────────────────────────────────────────

    /// @notice Liquidate an undercollateralized position.
    ///         Health factor must be < 1.0 (1e18).
    ///         Liquidator repays debt, receives collateral + 5% bonus.
    ///
    /// @param borrower Address of position to liquidate
    /// @param debtToCover Amount of MUSDC debt to repay
    function liquidate(address borrower, uint256 debtToCover) external nonReentrant {
        if (debtToCover == 0) revert ZeroAmount();

        // Accrue interest for borrower
        _accrueInterest(borrower);

        uint256 hf = healthFactor(borrower);
        if (hf >= PRECISION) revert PositionHealthy();

        Position storage pos = positions[borrower];
        uint256 totalDebt    = pos.borrowed + pos.interestAccrued;

        // Cap debt to cover at 50% of total (partial liquidation)
        uint256 maxCover = totalDebt / 2;
        if (totalDebt <= 1) maxCover = totalDebt;
        uint256 actualDebt = debtToCover > maxCover ? maxCover : debtToCover;

        // Calculate collateral to seize (debt value * 1.05 bonus)
        uint256 bdxPrice          = getBdxPrice();
        // debtInBDX = actualDebt / bdxPrice
        uint256 collateralToSeize = (actualDebt * PRECISION * LIQ_BONUS_NUMERATOR)
                                    / (bdxPrice * LIQ_BONUS_DENOMINATOR);

        if (collateralToSeize > pos.collateral) {
            collateralToSeize = pos.collateral;
        }

        // Update state
        uint256 interestCovered   = actualDebt > pos.interestAccrued ? pos.interestAccrued : actualDebt;
        uint256 principalCovered  = actualDebt - interestCovered;

        pos.interestAccrued -= interestCovered;
        pos.borrowed        -= principalCovered;
        pos.collateral      -= collateralToSeize;
        totalBorrowed       -= principalCovered;
        totalCollateral     -= collateralToSeize;
        reserveBalance      += interestCovered;

        // Liquidator pays debt, receives collateral
        borrowToken.safeTransferFrom(msg.sender, address(this), actualDebt);
        collateralToken.safeTransfer(msg.sender, collateralToSeize);

        emit Liquidated(msg.sender, borrower, actualDebt, collateralToSeize);
    }

    // ─── View: Health Factor ──────────────────────────────────────────────────

    /// @notice Calculate health factor for a user.
    ///         Returns PRECISION (1e18) scaled value.
    ///         < 1e18 = liquidatable
    ///         = type(uint256).max = no debt (fully healthy)
    function healthFactor(address user) public view returns (uint256) {
        Position storage pos = positions[user];
        uint256 totalDebt = _totalDebtView(user);
        if (totalDebt == 0) return type(uint256).max;

        uint256 bdxPrice           = getBdxPrice();
        uint256 collateralValueUSD = (pos.collateral * bdxPrice) / PRECISION;
        // Liquidation threshold = 80%
        uint256 thresholdValue = (collateralValueUSD * LIQ_THRESHOLD_NUMERATOR) / LIQ_THRESHOLD_DENOMINATOR;

        return (thresholdValue * PRECISION) / totalDebt;
    }

    /// @notice Max amount user can still borrow given current collateral
    function borrowLimit(address user) external view returns (uint256 maxBorrow, uint256 currentDebt) {
        Position storage pos = positions[user];
        uint256 bdxPrice          = getBdxPrice();
        uint256 collateralValueUSD = (pos.collateral * bdxPrice) / PRECISION;
        maxBorrow   = (collateralValueUSD * LTV_NUMERATOR) / LTV_DENOMINATOR;
        currentDebt = _totalDebtView(user);
    }

    /// @notice Full position summary for a user
    function getPosition(address user) external view returns (
        uint256 collateral,
        uint256 borrowed,
        uint256 interest,
        uint256 hf,
        uint256 collateralValueUSD,
        uint256 maxBorrowable
    ) {
        Position storage pos = positions[user];
        uint256 bdxPrice     = getBdxPrice();
        collateral          = pos.collateral;
        borrowed            = pos.borrowed;
        interest            = _accruedInterestView(user);
        hf                  = healthFactor(user);
        collateralValueUSD  = (pos.collateral * bdxPrice) / PRECISION;
        maxBorrowable       = (collateralValueUSD * LTV_NUMERATOR) / LTV_DENOMINATOR;
    }

    // ─── Price Oracle ─────────────────────────────────────────────────────────

    /// @notice Get BDX price in MUSDC from the pool oracle.
    ///         Returns price scaled by 1e18 (MUSDC per BDX).
    ///         If oracle not set or pool empty, returns 1 MUSDC = 1 BDX (1e18).
    function getBdxPrice() public view returns (uint256) {
        if (priceOracle == address(0)) return PRECISION; // fallback 1:1

        // Read reserves from pool
        try IPool(priceOracle).getReserves() returns (uint256 r0, uint256 r1) {
            if (r0 == 0 || r1 == 0) return PRECISION;

            // Determine which reserve is BDX
            address token0 = IPool(priceOracle).token0();
            uint256 bdxReserve   = (token0 == address(collateralToken)) ? r0 : r1;
            uint256 musdcReserve = (token0 == address(collateralToken)) ? r1 : r0;

            if (bdxReserve == 0) return PRECISION;
            // price = musdcReserve / bdxReserve (scaled by 1e18)
            return (musdcReserve * PRECISION) / bdxReserve;
        } catch {
            return PRECISION;
        }
    }

    /// @notice Update price oracle (owner only)
    function setPriceOracle(address _oracle) external onlyOwner {
        priceOracle = _oracle;
        emit PriceOracleUpdated(_oracle);
    }

    /// @notice Owner can add MUSDC to reserve for borrowing
    function fundReserve(uint256 amount) external onlyOwner {
        borrowToken.safeTransferFrom(msg.sender, address(this), amount);
        reserveBalance += amount;
    }

    /// @notice Owner can withdraw protocol revenue (interest collected)
    function withdrawReserve(uint256 amount, address to) external onlyOwner {
        if (amount > reserveBalance) revert InsufficientReserve();
        reserveBalance -= amount;
        borrowToken.safeTransfer(to, amount);
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    /// @dev Accrue interest and update position state
    function _accrueInterest(address user) internal {
        Position storage pos = positions[user];
        if (pos.borrowed == 0) return;

        uint256 blocksElapsed = block.number - pos.borrowBlock;
        if (blocksElapsed == 0) return;

        uint256 newInterest = (pos.borrowed * INTEREST_RATE_PER_BLOCK * blocksElapsed)
                              / INTEREST_DENOMINATOR;

        pos.interestAccrued += newInterest;
        pos.borrowBlock      = block.number;
    }

    /// @dev View-only interest accrual (does not write state)
    function _accruedInterestView(address user) internal view returns (uint256) {
        Position storage pos = positions[user];
        if (pos.borrowed == 0) return pos.interestAccrued;

        uint256 blocksElapsed = block.number - pos.borrowBlock;
        uint256 newInterest   = (pos.borrowed * INTEREST_RATE_PER_BLOCK * blocksElapsed)
                                / INTEREST_DENOMINATOR;
        return pos.interestAccrued + newInterest;
    }

    /// @dev Total debt including accrued interest (writes state)
    function _totalDebt(address user) internal returns (uint256) {
        _accrueInterest(user);
        Position storage pos = positions[user];
        return pos.borrowed + pos.interestAccrued;
    }

    /// @dev Total debt including accrued interest (view only)
    function _totalDebtView(address user) internal view returns (uint256) {
        Position storage pos = positions[user];
        return pos.borrowed + _accruedInterestView(user);
    }
}

// ─── Interface for pool price oracle ─────────────────────────────────────────

interface IPool {
    function getReserves() external view returns (uint256 reserve0, uint256 reserve1);
    function token0() external view returns (address);
}
