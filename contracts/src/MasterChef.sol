// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title  MasterChef — Bulldex Finance Yield Farming
/// @author Phantom (@wayphantomme)
/// @notice MasterChef v1 pattern (Sushi/PancakeSwap style).
///         LP token holders deposit into pools to earn BDX rewards.
///         Each pool has an allocation point that determines its share
///         of the total BDX emissions per block.
///
///         Reward math:
///         - poolBdxPerBlock = bdxPerBlock × pool.allocPoint / totalAllocPoint
///         - accBDXPerShare += poolBdxPerBlock × blocks × 1e12 / lpSupply
///         - pending = user.amount × accBDXPerShare / 1e12 − user.rewardDebt
///
///         Scaled by 1e12 (not 1e18) — follows MasterChef v1 convention
///         to avoid overflow with large LP token supplies.
///
///         BDX rewards are sourced from a pre-minted budget transferred to
///         this contract by the owner (Option A — no minter role needed on Token).
contract MasterChef is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // ─── Types ────────────────────────────────────────────────────────────────

    struct PoolInfo {
        IERC20  lpToken;            // LP token this pool accepts
        uint256 allocPoint;         // weight vs other pools
        uint256 lastRewardBlock;    // last block rewards were distributed
        uint256 accBDXPerShare;     // accumulated BDX per LP share (× 1e12)
    }

    struct UserInfo {
        uint256 amount;             // LP tokens deposited
        uint256 rewardDebt;         // already-accounted BDX (prevents double-claim)
    }

    // ─── Constants ────────────────────────────────────────────────────────────

    uint256 public constant ACC_PRECISION = 1e12;

    // ─── State ────────────────────────────────────────────────────────────────

    /// @notice BDX reward token
    IERC20 public immutable bdx;

    /// @notice BDX emitted per block across all pools
    uint256 public bdxPerBlock;

    /// @notice Block number farming starts (no rewards before this)
    uint256 public startBlock;

    /// @notice Sum of all pool allocation points
    uint256 public totalAllocPoint;

    /// @notice All registered farming pools
    PoolInfo[] public poolInfo;

    /// @notice Per-pool per-user state: userInfo[pid][user]
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;

    /// @notice Tracks LP tokens already added to prevent duplicate pools
    mapping(address => bool) private _lpAdded;

    // ─── Events ───────────────────────────────────────────────────────────────

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event Harvest(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event PoolAdded(uint256 indexed pid, address indexed lpToken, uint256 allocPoint);
    event PoolUpdated(uint256 indexed pid, uint256 allocPoint);
    event BdxPerBlockUpdated(uint256 oldRate, uint256 newRate);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error ZeroAmount();
    error ZeroAddress();
    error InvalidPool(uint256 pid);
    error DuplicatePool(address lpToken);
    error FarmNotStarted();

    // ─── Constructor ──────────────────────────────────────────────────────────

    /// @param _bdx        BDX token address (reward token)
    /// @param _bdxPerBlock BDX emitted per block across all pools
    /// @param _startBlock  Block number when farming begins
    /// @param _owner       Protocol owner
    constructor(
        address _bdx,
        uint256 _bdxPerBlock,
        uint256 _startBlock,
        address _owner
    ) Ownable(_owner) {
        if (_bdx == address(0) || _owner == address(0)) revert ZeroAddress();
        bdx          = IERC20(_bdx);
        bdxPerBlock  = _bdxPerBlock;
        startBlock   = _startBlock;
    }

    // ─── External: Owner ──────────────────────────────────────────────────────

    /// @notice Add a new LP pool. Owner only.
    /// @param allocPoint  Weight of this pool relative to others
    /// @param lpToken     LP token contract to accept
    /// @param withUpdate  If true, update all pools before adding (recommended)
    function add(
        uint256 allocPoint,
        IERC20 lpToken,
        bool withUpdate
    ) external onlyOwner {
        if (address(lpToken) == address(0)) revert ZeroAddress();
        if (_lpAdded[address(lpToken)]) revert DuplicatePool(address(lpToken));

        if (withUpdate) _massUpdatePools();

        uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;
        totalAllocPoint += allocPoint;
        _lpAdded[address(lpToken)] = true;

        poolInfo.push(PoolInfo({
            lpToken:         lpToken,
            allocPoint:      allocPoint,
            lastRewardBlock: lastRewardBlock,
            accBDXPerShare:  0
        }));

        emit PoolAdded(poolInfo.length - 1, address(lpToken), allocPoint);
    }

    /// @notice Update allocation points for an existing pool. Owner only.
    /// @param pid         Pool index
    /// @param allocPoint  New allocation weight
    /// @param withUpdate  If true, update all pools first
    function set(
        uint256 pid,
        uint256 allocPoint,
        bool withUpdate
    ) external onlyOwner {
        _validatePid(pid);
        if (withUpdate) _massUpdatePools();

        totalAllocPoint = totalAllocPoint - poolInfo[pid].allocPoint + allocPoint;
        poolInfo[pid].allocPoint = allocPoint;

        emit PoolUpdated(pid, allocPoint);
    }

    /// @notice Update BDX emission rate. Owner only.
    ///         Always calls massUpdatePools first to lock in old rate.
    /// @param _bdxPerBlock New emission rate (BDX per block)
    /// @param withUpdate   If true, update all pools before changing rate
    function setBdxPerBlock(uint256 _bdxPerBlock, bool withUpdate) external onlyOwner {
        if (withUpdate) _massUpdatePools();
        emit BdxPerBlockUpdated(bdxPerBlock, _bdxPerBlock);
        bdxPerBlock = _bdxPerBlock;
    }

    // ─── External: Public ─────────────────────────────────────────────────────

    /// @notice Update reward variables for all pools. Gas-intensive — use sparingly.
    function massUpdatePools() external {
        _massUpdatePools();
    }

    /// @notice Update reward accumulator for a single pool.
    function updatePool(uint256 pid) external {
        _validatePid(pid);
        _updatePool(pid);
    }

    // ─── External: User ───────────────────────────────────────────────────────

    /// @notice Deposit LP tokens to earn BDX. Harvests any pending rewards first.
    /// @param pid    Pool index
    /// @param amount LP token amount to deposit
    function deposit(uint256 pid, uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        _validatePid(pid);

        _updatePool(pid);

        PoolInfo storage pool = poolInfo[pid];
        UserInfo storage user = userInfo[pid][msg.sender];

        // Harvest pending rewards before updating position
        if (user.amount > 0) {
            uint256 pending = _pendingBDX(pool, user);
            if (pending > 0) {
                _safeBDXTransfer(msg.sender, pending);
                emit Harvest(msg.sender, pid, pending);
            }
        }

        pool.lpToken.safeTransferFrom(msg.sender, address(this), amount);
        user.amount    += amount;
        user.rewardDebt = user.amount * pool.accBDXPerShare / ACC_PRECISION;

        emit Deposit(msg.sender, pid, amount);
    }

    /// @notice Withdraw LP tokens. Harvests any pending rewards first.
    /// @param pid    Pool index
    /// @param amount LP token amount to withdraw
    function withdraw(uint256 pid, uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        _validatePid(pid);

        PoolInfo storage pool = poolInfo[pid];
        UserInfo storage user = userInfo[pid][msg.sender];
        require(user.amount >= amount, "MasterChef: insufficient balance");

        _updatePool(pid);

        // Harvest pending rewards before reducing position
        uint256 pending = _pendingBDX(pool, user);
        if (pending > 0) {
            _safeBDXTransfer(msg.sender, pending);
            emit Harvest(msg.sender, pid, pending);
        }

        user.amount    -= amount;
        user.rewardDebt = user.amount * pool.accBDXPerShare / ACC_PRECISION;
        pool.lpToken.safeTransfer(msg.sender, amount);

        emit Withdraw(msg.sender, pid, amount);
    }

    /// @notice Harvest BDX rewards without withdrawing LP tokens.
    /// @param pid Pool index
    function harvest(uint256 pid) external nonReentrant {
        _validatePid(pid);
        _updatePool(pid);

        PoolInfo storage pool = poolInfo[pid];
        UserInfo storage user = userInfo[pid][msg.sender];

        uint256 pending = _pendingBDX(pool, user);
        if (pending == 0) return;

        user.rewardDebt = user.amount * pool.accBDXPerShare / ACC_PRECISION;
        _safeBDXTransfer(msg.sender, pending);

        emit Harvest(msg.sender, pid, pending);
    }

    /// @notice Harvest BDX rewards from all pools in one transaction.
    function harvestAll() external nonReentrant {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            _updatePool(pid);

            PoolInfo storage pool = poolInfo[pid];
            UserInfo storage user = userInfo[pid][msg.sender];

            if (user.amount == 0) continue;

            uint256 pending = _pendingBDX(pool, user);
            if (pending == 0) continue;

            user.rewardDebt = user.amount * pool.accBDXPerShare / ACC_PRECISION;
            _safeBDXTransfer(msg.sender, pending);

            emit Harvest(msg.sender, pid, pending);
        }
    }

    /// @notice Emergency withdraw LP tokens without claiming rewards.
    ///         Use only if normal withdraw fails. Forfeits all pending BDX.
    /// @param pid Pool index
    function emergencyWithdraw(uint256 pid) external nonReentrant {
        _validatePid(pid);

        PoolInfo storage pool = poolInfo[pid];
        UserInfo storage user = userInfo[pid][msg.sender];

        uint256 amount = user.amount;
        if (amount == 0) revert ZeroAmount();

        user.amount     = 0;
        user.rewardDebt = 0;
        pool.lpToken.safeTransfer(msg.sender, amount);

        emit EmergencyWithdraw(msg.sender, pid, amount);
    }

    // ─── External: View ───────────────────────────────────────────────────────

    /// @notice Returns pending BDX reward for a user in a specific pool.
    function pendingBDX(uint256 pid, address _user) external view returns (uint256) {
        _validatePid(pid);

        PoolInfo storage pool = poolInfo[pid];
        UserInfo storage user = userInfo[pid][_user];

        uint256 accBDXPerShare = pool.accBDXPerShare;
        uint256 lpSupply       = pool.lpToken.balanceOf(address(this));

        if (block.number > pool.lastRewardBlock && lpSupply > 0 && totalAllocPoint > 0) {
            uint256 blocks    = block.number - pool.lastRewardBlock;
            uint256 bdxReward = blocks * bdxPerBlock * pool.allocPoint / totalAllocPoint;
            accBDXPerShare   += bdxReward * ACC_PRECISION / lpSupply;
        }

        return user.amount * accBDXPerShare / ACC_PRECISION - user.rewardDebt;
    }

    /// @notice Returns total number of pools.
    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    /// @notice Returns BDX balance held by MasterChef (farming budget remaining).
    function rewardBalance() external view returns (uint256) {
        return bdx.balanceOf(address(this));
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    /// @dev Update accBDXPerShare for a single pool.
    function _updatePool(uint256 pid) internal {
        PoolInfo storage pool = poolInfo[pid];
        if (block.number <= pool.lastRewardBlock) return;

        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (lpSupply == 0 || pool.allocPoint == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }

        uint256 blocks    = block.number - pool.lastRewardBlock;
        uint256 bdxReward = blocks * bdxPerBlock * pool.allocPoint / totalAllocPoint;

        // Only distribute if we have enough budget
        uint256 available = bdx.balanceOf(address(this));
        if (bdxReward > available) bdxReward = available;

        pool.accBDXPerShare  += bdxReward * ACC_PRECISION / lpSupply;
        pool.lastRewardBlock  = block.number;
    }

    /// @dev Update all pools. O(n) — call sparingly.
    function _massUpdatePools() internal {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            _updatePool(pid);
        }
    }

    /// @dev Calculate pending BDX for a user given current pool state.
    function _pendingBDX(
        PoolInfo storage pool,
        UserInfo storage user
    ) internal view returns (uint256) {
        return user.amount * pool.accBDXPerShare / ACC_PRECISION - user.rewardDebt;
    }

    /// @dev Transfer BDX, capped at contract balance to avoid revert on low budget.
    function _safeBDXTransfer(address to, uint256 amount) internal {
        uint256 bal = bdx.balanceOf(address(this));
        bdx.safeTransfer(to, amount > bal ? bal : amount);
    }

    /// @dev Revert if pid is out of bounds.
    function _validatePid(uint256 pid) internal view {
        if (pid >= poolInfo.length) revert InvalidPool(pid);
    }
}
