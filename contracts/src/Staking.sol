// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title  Staking — Bulldex Finance BDX Staking Rewards
/// @author Phantom (@wayphantomme)
/// @notice BDX holders stake tokens to earn BDX rewards from protocol inflation.
///         Uses the Synthetix rewardPerToken accumulator pattern for O(1) updates.
///         Optional lock periods (30 / 90 / 180 days) give boosted reward multipliers.
///
///         Reward flow:
///         1. Owner calls notifyRewardAmount(amount) to fund a reward period
///         2. Stakers earn proportionally to their effective stake
///         3. effectiveStake = staked × lockMultiplier / 1e18
///         4. Rewards claimable at any time; unstake requires lock to expire
contract Staking is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // ─── Constants ────────────────────────────────────────────────────────────

    uint256 public constant PRECISION          = 1e18;
    uint256 public constant DEFAULT_DURATION   = 7 days;

    // Lock multipliers (1e18 = 1×)
    uint256 public constant MULTIPLIER_NONE    = 1e18;        // 1.0×  no lock
    uint256 public constant MULTIPLIER_30DAYS  = 1.2e18;     // 1.2×  30-day lock
    uint256 public constant MULTIPLIER_90DAYS  = 1.5e18;     // 1.5×  90-day lock
    uint256 public constant MULTIPLIER_180DAYS = 2e18;       // 2.0×  180-day lock

    // ─── State ────────────────────────────────────────────────────────────────

    IERC20 public immutable stakingToken;   // BDX staked
    IERC20 public immutable rewardsToken;   // BDX rewards (same token)

    uint256 public rewardsDuration  = DEFAULT_DURATION;
    uint256 public periodFinish;            // timestamp when current period ends
    uint256 public rewardRate;              // rewards per second
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;

    uint256 public totalEffectiveStake;     // sum of all effectiveStake values

    struct StakeInfo {
        uint256 amount;                 // raw BDX staked
        uint256 effectiveAmount;        // amount × multiplier / 1e18
        uint256 lockEnd;                // timestamp (0 = no lock)
        uint256 lockDays;               // original lock days (for display)
        uint256 rewardPerTokenPaid;     // snapshot when last updated
        uint256 pendingRewards;         // unclaimed rewards
    }

    mapping(address => StakeInfo) public stakers;

    // ─── Events ───────────────────────────────────────────────────────────────

    event Staked(address indexed user, uint256 amount, uint256 lockDays, uint256 lockEnd);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardAdded(uint256 reward, uint256 periodFinish);
    event EmergencyWithdraw(address indexed user, uint256 amount);
    event RewardsDurationUpdated(uint256 newDuration);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error ZeroAmount();
    error ZeroAddress();
    error StillLocked(uint256 unlockTime);
    error NothingStaked();
    error NothingToClaim();
    error PeriodNotFinished();
    error InvalidLockDays();
    error ZeroRewardRate();

    // ─── Constructor ──────────────────────────────────────────────────────────

    /// @param _stakingToken BDX token address (token to stake)
    /// @param _rewardsToken BDX token address (reward token — same as staking)
    /// @param _owner        Protocol owner (can fund rewards, update duration)
    constructor(address _stakingToken, address _rewardsToken, address _owner)
        Ownable(_owner)
    {
        if (_stakingToken == address(0) || _rewardsToken == address(0)) revert ZeroAddress();
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardsToken);
    }

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime       = lastTimeRewardApplicable();
        if (account != address(0)) {
            stakers[account].pendingRewards    = earned(account);
            stakers[account].rewardPerTokenPaid = rewardPerTokenStored;
        }
        _;
    }

    // ─── External: User ───────────────────────────────────────────────────────

    /// @notice Stake BDX with an optional lock period for boosted rewards.
    /// @param amount   Amount of BDX to stake
    /// @param lockDays Lock duration: 0 (no lock), 30, 90, or 180 days
    function stake(uint256 amount, uint256 lockDays)
        external
        nonReentrant
        updateReward(msg.sender)
    {
        if (amount == 0) revert ZeroAmount();

        uint256 multiplier = _multiplierForDays(lockDays);
        StakeInfo storage s = stakers[msg.sender];

        // If already staked with active lock, enforce new lock >= remaining
        // (simplification: new stake extends lock to max of current vs new)
        uint256 newLockEnd = lockDays > 0
            ? block.timestamp + (lockDays * 1 days)
            : 0;

        if (s.lockEnd > block.timestamp && newLockEnd < s.lockEnd) {
            // Maintain longer existing lock
            newLockEnd = s.lockEnd;
        }

        // Update effective stake: remove old, add new
        totalEffectiveStake -= s.effectiveAmount;

        s.amount          += amount;
        s.lockEnd          = newLockEnd;
        s.lockDays         = lockDays;
        s.effectiveAmount  = (s.amount * multiplier) / PRECISION;

        totalEffectiveStake += s.effectiveAmount;

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        emit Staked(msg.sender, amount, lockDays, newLockEnd);
    }

    /// @notice Unstake BDX. Reverts if lock period has not expired.
    /// @param amount Amount of BDX to unstake
    function unstake(uint256 amount)
        external
        nonReentrant
        updateReward(msg.sender)
    {
        if (amount == 0) revert ZeroAmount();
        StakeInfo storage s = stakers[msg.sender];
        if (s.amount == 0) revert NothingStaked();
        if (s.lockEnd > block.timestamp) revert StillLocked(s.lockEnd);
        if (amount > s.amount) amount = s.amount; // cap at balance

        totalEffectiveStake -= s.effectiveAmount;

        s.amount -= amount;
        // Recalculate effective amount (lock expired, multiplier = 1×)
        s.effectiveAmount  = s.amount; // 1× multiplier after lock expires
        s.lockEnd          = 0;
        s.lockDays         = 0;

        totalEffectiveStake += s.effectiveAmount;

        stakingToken.safeTransfer(msg.sender, amount);

        emit Unstaked(msg.sender, amount);
    }

    /// @notice Claim accumulated BDX rewards without unstaking.
    function claimRewards()
        external
        nonReentrant
        updateReward(msg.sender)
    {
        StakeInfo storage s = stakers[msg.sender];
        uint256 reward = s.pendingRewards;
        if (reward == 0) revert NothingToClaim();

        s.pendingRewards = 0;
        rewardsToken.safeTransfer(msg.sender, reward);

        emit RewardsClaimed(msg.sender, reward);
    }

    /// @notice Emergency withdrawal — bypass lock, forfeit all pending rewards.
    function emergencyWithdraw() external nonReentrant {
        StakeInfo storage s = stakers[msg.sender];
        if (s.amount == 0) revert NothingStaked();

        uint256 amount = s.amount;

        totalEffectiveStake -= s.effectiveAmount;

        s.amount          = 0;
        s.effectiveAmount  = 0;
        s.lockEnd          = 0;
        s.lockDays         = 0;
        s.pendingRewards   = 0;
        s.rewardPerTokenPaid = rewardPerTokenStored;

        stakingToken.safeTransfer(msg.sender, amount);

        emit EmergencyWithdraw(msg.sender, amount);
    }

    // ─── External: Owner ──────────────────────────────────────────────────────

    /// @notice Fund a new reward period. Transfers `reward` BDX to this contract.
    ///         If a period is still active, remaining rewards roll into the new rate.
    /// @param reward Total BDX to distribute over `rewardsDuration`
    function notifyRewardAmount(uint256 reward)
        external
        onlyOwner
        updateReward(address(0))
    {
        if (reward == 0) revert ZeroAmount();

        if (block.timestamp >= periodFinish) {
            rewardRate = reward / rewardsDuration;
        } else {
            uint256 remaining = periodFinish - block.timestamp;
            uint256 leftover  = remaining * rewardRate;
            rewardRate        = (reward + leftover) / rewardsDuration;
        }

        if (rewardRate == 0) revert ZeroRewardRate();

        lastUpdateTime = block.timestamp;
        periodFinish   = block.timestamp + rewardsDuration;

        rewardsToken.safeTransferFrom(msg.sender, address(this), reward);

        emit RewardAdded(reward, periodFinish);
    }

    /// @notice Update rewards distribution duration.
    ///         Only callable after current period has finished.
    /// @param duration New duration in seconds
    function setRewardsDuration(uint256 duration) external onlyOwner {
        if (block.timestamp < periodFinish) revert PeriodNotFinished();
        rewardsDuration = duration;
        emit RewardsDurationUpdated(duration);
    }

    // ─── View ─────────────────────────────────────────────────────────────────

    /// @notice Current reward per token (1e18 precision)
    function rewardPerToken() public view returns (uint256) {
        if (totalEffectiveStake == 0) return rewardPerTokenStored;
        return rewardPerTokenStored + (
            (lastTimeRewardApplicable() - lastUpdateTime)
            * rewardRate
            * PRECISION
            / totalEffectiveStake
        );
    }

    /// @notice Claimable rewards for `user`
    function earned(address user) public view returns (uint256) {
        StakeInfo storage s = stakers[user];
        return (s.effectiveAmount * (rewardPerToken() - s.rewardPerTokenPaid) / PRECISION)
               + s.pendingRewards;
    }

    /// @notice Effective end of current reward period
    function lastTimeRewardApplicable() public view returns (uint256) {
        return block.timestamp < periodFinish ? block.timestamp : periodFinish;
    }

    /// @notice Full stake info for a user
    function getStakeInfo(address user) external view returns (
        uint256 amount,
        uint256 lockEnd,
        uint256 lockDays,
        uint256 lockMultiplier,
        uint256 pendingRewards,
        bool    isLocked
    ) {
        StakeInfo storage s = stakers[user];
        amount         = s.amount;
        lockEnd        = s.lockEnd;
        lockDays       = s.lockDays;
        lockMultiplier = s.amount > 0
            ? (s.effectiveAmount * PRECISION) / s.amount
            : PRECISION;
        pendingRewards = earned(user);
        isLocked       = s.lockEnd > block.timestamp;
    }

    /// @notice Estimated APR in basis points (100 = 1%) for a given lock
    /// @param lockDays  0 / 30 / 90 / 180
    function estimatedAPR(uint256 lockDays) external view returns (uint256 aprBps) {
        if (totalEffectiveStake == 0 || rewardRate == 0) return 0;
        uint256 multiplier   = _multiplierForDays(lockDays);
        uint256 annualReward = rewardRate * 365 days * multiplier / PRECISION;
        aprBps               = annualReward * 10_000 / totalEffectiveStake;
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    function _multiplierForDays(uint256 lockDays) internal pure returns (uint256) {
        if (lockDays == 0)   return MULTIPLIER_NONE;
        if (lockDays == 30)  return MULTIPLIER_30DAYS;
        if (lockDays == 90)  return MULTIPLIER_90DAYS;
        if (lockDays == 180) return MULTIPLIER_180DAYS;
        revert InvalidLockDays();
    }
}
