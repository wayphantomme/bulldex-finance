// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title  Pool — Bulldex Finance AMM (x * y = k)
/// @author Phantom (@wayphantomme)
/// @notice Uniswap v2-style constant-product AMM.
///         LP tokens represent proportional share of pool reserves.
///         0.3% fee on every swap, distributed to LPs.
contract Pool is ERC20, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── Constants ────────────────────────────────────────────────────────────

    /// @notice Minimum LP tokens locked forever on first mint (prevents price manipulation)
    uint256 public constant MINIMUM_LIQUIDITY = 1000;

    /// @notice Swap fee numerator — 997/1000 = 0.3% fee
    uint256 public constant FEE_NUMERATOR = 997;
    uint256 public constant FEE_DENOMINATOR = 1000;

    // ─── State ────────────────────────────────────────────────────────────────

    /// @notice The two tokens in this pool (token0 < token1 by address sort)
    IERC20 public immutable token0;
    IERC20 public immutable token1;

    /// @notice Tracked reserves (NOT balanceOf — prevents flash loan manipulation)
    uint256 public reserve0;
    uint256 public reserve1;

    // ─── Events ───────────────────────────────────────────────────────────────

    event Swap(
        address indexed sender,
        address indexed tokenIn,
        uint256 amountIn,
        uint256 amountOut,
        address indexed to
    );

    event AddLiquidity(
        address indexed provider,
        uint256 amount0,
        uint256 amount1,
        uint256 lpMinted
    );

    event RemoveLiquidity(
        address indexed provider,
        uint256 amount0,
        uint256 amount1,
        uint256 lpBurned
    );

    event Sync(uint256 reserve0, uint256 reserve1);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error InsufficientLiquidity();
    error InsufficientInputAmount();
    error InsufficientOutputAmount();
    error InsufficientLiquidityMinted();
    error InsufficientLiquidityBurned();
    error InvalidToken();
    error SlippageExceeded(uint256 amountOut, uint256 minAmountOut);
    error ZeroAddress();

    // ─── Constructor ──────────────────────────────────────────────────────────

    /// @param _token0 First token address (lower address)
    /// @param _token1 Second token address (higher address)
    /// @param name_   LP token name  e.g. "Bulldex BDX/MUSDC LP"
    /// @param symbol_ LP token symbol e.g. "BDX-MUSDC-LP"
    constructor(
        address _token0,
        address _token1,
        string memory name_,
        string memory symbol_
    ) ERC20(name_, symbol_) {
        if (_token0 == address(0) || _token1 == address(0)) revert ZeroAddress();
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
    }

    // ─── Core: Add Liquidity ──────────────────────────────────────────────────

    /// @notice Deposit token0 + token1 to receive LP tokens.
    ///         First depositor sets the initial price ratio.
    ///         Subsequent depositors must match existing ratio (unused amounts returned).
    ///
    /// @param amount0Desired  Max token0 to deposit
    /// @param amount1Desired  Max token1 to deposit
    /// @param amount0Min      Min token0 acceptable (slippage guard)
    /// @param amount1Min      Min token1 acceptable (slippage guard)
    /// @param to              Recipient of LP tokens
    /// @return amount0        Actual token0 deposited
    /// @return amount1        Actual token1 deposited
    /// @return liquidity      LP tokens minted
    function addLiquidity(
        uint256 amount0Desired,
        uint256 amount1Desired,
        uint256 amount0Min,
        uint256 amount1Min,
        address to
    )
        external
        nonReentrant
        returns (uint256 amount0, uint256 amount1, uint256 liquidity)
    {
        (amount0, amount1) = _calculateOptimalAmounts(
            amount0Desired,
            amount1Desired,
            amount0Min,
            amount1Min
        );

        // Transfer tokens from caller
        token0.safeTransferFrom(msg.sender, address(this), amount0);
        token1.safeTransferFrom(msg.sender, address(this), amount1);

        // Mint LP tokens
        liquidity = _mintLP(to, amount0, amount1);

        _updateReserves();

        emit AddLiquidity(to, amount0, amount1, liquidity);
    }

    // ─── Core: Remove Liquidity ───────────────────────────────────────────────

    /// @notice Burn LP tokens to receive proportional share of reserves.
    ///
    /// @param liquidity   Amount of LP tokens to burn
    /// @param amount0Min  Min token0 to receive (slippage guard)
    /// @param amount1Min  Min token1 to receive (slippage guard)
    /// @param to          Recipient of tokens
    /// @return amount0    token0 returned
    /// @return amount1    token1 returned
    function removeLiquidity(
        uint256 liquidity,
        uint256 amount0Min,
        uint256 amount1Min,
        address to
    ) external nonReentrant returns (uint256 amount0, uint256 amount1) {
        if (liquidity == 0) revert InsufficientLiquidityBurned();

        uint256 totalLP = totalSupply();
        // Proportional share of reserves
        amount0 = (liquidity * reserve0) / totalLP;
        amount1 = (liquidity * reserve1) / totalLP;

        if (amount0 == 0 || amount1 == 0) revert InsufficientLiquidityBurned();
        if (amount0 < amount0Min || amount1 < amount1Min) {
            revert InsufficientOutputAmount();
        }

        // Burn LP tokens from caller
        _burn(msg.sender, liquidity);

        // Return tokens
        token0.safeTransfer(to, amount0);
        token1.safeTransfer(to, amount1);

        _updateReserves();

        emit RemoveLiquidity(msg.sender, amount0, amount1, liquidity);
    }

    // ─── Core: Swap ───────────────────────────────────────────────────────────

    /// @notice Swap an exact amount of one token for as much as possible of the other.
    ///
    /// @param tokenIn    Address of the token being sold
    /// @param amountIn   Exact amount of tokenIn to sell
    /// @param minAmountOut Minimum acceptable output (slippage guard)
    /// @param to          Recipient of output tokens
    /// @return amountOut  Actual output tokens received
    function swap(
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut,
        address to
    ) external nonReentrant returns (uint256 amountOut) {
        if (amountIn == 0) revert InsufficientInputAmount();
        if (to == address(0)) revert ZeroAddress();
        if (tokenIn != address(token0) && tokenIn != address(token1)) revert InvalidToken();

        bool isToken0In = (tokenIn == address(token0));

        (uint256 reserveIn, uint256 reserveOut) = isToken0In
            ? (reserve0, reserve1)
            : (reserve1, reserve0);

        if (reserveIn == 0 || reserveOut == 0) revert InsufficientLiquidity();

        // Calculate output with 0.3% fee: amountOut = (amountIn*997*reserveOut) / (reserveIn*1000 + amountIn*997)
        amountOut = getAmountOut(amountIn, reserveIn, reserveOut);

        if (amountOut == 0) revert InsufficientOutputAmount();
        if (amountOut < minAmountOut) revert SlippageExceeded(amountOut, minAmountOut);

        // Transfer input token from sender
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // Transfer output token to recipient
        IERC20(isToken0In ? address(token1) : address(token0)).safeTransfer(to, amountOut);

        _updateReserves();

        emit Swap(msg.sender, tokenIn, amountIn, amountOut, to);
    }

    // ─── View: Price & Quote ──────────────────────────────────────────────────

    /// @notice Calculate output amount given input, using x*y=k with 0.3% fee.
    /// @param amountIn  Input token amount
    /// @param reserveIn  Reserve of input token
    /// @param reserveOut Reserve of output token
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut)
        public
        pure
        returns (uint256 amountOut)
    {
        if (amountIn == 0) revert InsufficientInputAmount();
        if (reserveIn == 0 || reserveOut == 0) revert InsufficientLiquidity();

        uint256 amountInWithFee = amountIn * FEE_NUMERATOR;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * FEE_DENOMINATOR) + amountInWithFee;
        amountOut = numerator / denominator;
    }

    /// @notice Quote how much tokenIn is needed to get an exact amountOut.
    /// @param amountOut Desired output
    /// @param reserveIn Reserve of input token
    /// @param reserveOut Reserve of output token
    function getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut)
        public
        pure
        returns (uint256 amountIn)
    {
        if (amountOut == 0) revert InsufficientOutputAmount();
        if (reserveIn == 0 || reserveOut == 0) revert InsufficientLiquidity();

        uint256 numerator = reserveIn * amountOut * FEE_DENOMINATOR;
        uint256 denominator = (reserveOut - amountOut) * FEE_NUMERATOR;
        amountIn = (numerator / denominator) + 1;
    }

    /// @notice Spot price of token0 denominated in token1 (scaled by 1e18)
    function getPrice0() external view returns (uint256) {
        if (reserve0 == 0) return 0;
        return (reserve1 * 1e18) / reserve0;
    }

    /// @notice Spot price of token1 denominated in token0 (scaled by 1e18)
    function getPrice1() external view returns (uint256) {
        if (reserve1 == 0) return 0;
        return (reserve0 * 1e18) / reserve1;
    }

    /// @notice Returns current reserves
    function getReserves() external view returns (uint256 _reserve0, uint256 _reserve1) {
        _reserve0 = reserve0;
        _reserve1 = reserve1;
    }

    /// @notice Calculate price impact of a swap as basis points (1 bp = 0.01%)
    /// @param tokenIn  Input token address
    /// @param amountIn Amount being swapped
    function getPriceImpact(address tokenIn, uint256 amountIn)
        external
        view
        returns (uint256 impactBps)
    {
        bool isToken0In = (tokenIn == address(token0));
        (uint256 reserveIn, uint256 reserveOut) = isToken0In
            ? (reserve0, reserve1)
            : (reserve1, reserve0);

        if (reserveIn == 0 || reserveOut == 0) return 0;

        uint256 amountOut = getAmountOut(amountIn, reserveIn, reserveOut);
        // Mid price without fee
        uint256 midPrice = (amountIn * reserveOut) / reserveIn;
        if (midPrice == 0) return 0;

        // Impact = (midPrice - amountOut) / midPrice * 10000
        if (midPrice > amountOut) {
            impactBps = ((midPrice - amountOut) * 10000) / midPrice;
        }
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    /// @dev Calculate optimal deposit amounts based on current reserves.
    ///      First deposit accepts any ratio. Subsequent deposits must match.
    function _calculateOptimalAmounts(
        uint256 amount0Desired,
        uint256 amount1Desired,
        uint256 amount0Min,
        uint256 amount1Min
    ) internal view returns (uint256 amount0, uint256 amount1) {
        if (reserve0 == 0 && reserve1 == 0) {
            // First liquidity — use exactly what's provided
            return (amount0Desired, amount1Desired);
        }

        // Calculate optimal amount1 given amount0Desired
        uint256 amount1Optimal = (amount0Desired * reserve1) / reserve0;

        if (amount1Optimal <= amount1Desired) {
            if (amount1Optimal < amount1Min) revert InsufficientOutputAmount();
            return (amount0Desired, amount1Optimal);
        }

        // Otherwise calculate optimal amount0 given amount1Desired
        uint256 amount0Optimal = (amount1Desired * reserve0) / reserve1;
        if (amount0Optimal < amount0Min) revert InsufficientOutputAmount();
        return (amount0Optimal, amount1Desired);
    }

    /// @dev Mint LP tokens to `to`. Uses sqrt formula for first deposit.
    function _mintLP(address to, uint256 amount0, uint256 amount1)
        internal
        returns (uint256 liquidity)
    {
        uint256 totalLP = totalSupply();

        if (totalLP == 0) {
            // First deposit: liquidity = sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY
            liquidity = _sqrt(amount0 * amount1);
            if (liquidity <= MINIMUM_LIQUIDITY) revert InsufficientLiquidityMinted();
            liquidity -= MINIMUM_LIQUIDITY;
            // Lock minimum liquidity forever by minting to address(1)
            _mint(address(1), MINIMUM_LIQUIDITY);
        } else {
            // Subsequent: proportional to existing reserves
            uint256 liq0 = (amount0 * totalLP) / reserve0;
            uint256 liq1 = (amount1 * totalLP) / reserve1;
            liquidity = liq0 < liq1 ? liq0 : liq1;
        }

        if (liquidity == 0) revert InsufficientLiquidityMinted();
        _mint(to, liquidity);
    }

    /// @dev Sync reserves to actual token balances
    function _updateReserves() internal {
        reserve0 = token0.balanceOf(address(this));
        reserve1 = token1.balanceOf(address(this));
        emit Sync(reserve0, reserve1);
    }

    /// @dev Integer square root (Babylonian method)
    function _sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
