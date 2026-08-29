# Staking — Feature Spec

**Status:** 🔴 Phase 2 (Weeks 5–8)
**Contract:** `contracts/src/Staking.sol` (to be built)
**Frontend:** `frontend/src/app/dashboard/staking/page.tsx`
**Hooks:** `useStaking`, `useStakingActions` (to be built)

---

## What It Does

BDX holders can stake their tokens to earn protocol revenue distributed
as BDX rewards. Stakers receive proportional rewards based on their share
of the total staked pool. Staking can optionally include a lock period
for boosted rewards.

---

## Design Decisions

### Reward Source
Rewards come from:
1. **Protocol inflation** — owner mints new BDX to the staking contract at a configurable rate
2. **Protocol revenue** — lending interest and future flash loan fees can be forwarded here

### Reward Distribution Model
Use the **"rewards per token"** accumulator model (same as Synthetix SNX staking):
```
rewardPerTokenStored += rewardRate × elapsed × 1e18 / totalStaked
```
This allows O(1) reward updates per user — no loops over all stakers.

### Lock Periods (Optional)
| Period | Multiplier |
|---|---|
| No lock | 1× |
| 30 days | 1.2× |
| 90 days | 1.5× |
| 180 days | 2× |
Lock multiplier increases the user's "effective stake" for reward calculation.

---

## Contract: Staking.sol

### State Variables
```solidity
IERC20 public immutable stakingToken;      // BDX
IERC20 public immutable rewardsToken;      // BDX (same token — self-compounding optional)
address public rewardsDistributor;         // owner or MasterChef

uint256 public rewardRate;                 // rewards per second (scaled 1e18)
uint256 public lastUpdateTime;
uint256 public rewardPerTokenStored;
uint256 public periodFinish;               // timestamp when current reward period ends
uint256 public rewardsDuration;            // default 7 days

uint256 public totalStaked;

struct StakeInfo {
    uint256 amount;                        // BDX staked
    uint256 lockEnd;                       // timestamp (0 = no lock)
    uint256 lockMultiplier;                // 1e18 scaled (1.0× = 1e18)
    uint256 rewardPerTokenPaid;            // snapshot at last claim
    uint256 pendingRewards;                // unclaimed rewards
}

mapping(address => StakeInfo) public stakers;
```

### Functions to Implement
```solidity
// Stake BDX with optional lock period
function stake(uint256 amount, uint256 lockDays) external nonReentrant updateReward(msg.sender)
// lockDays: 0 = no lock, 30 / 90 / 180 for boosted

// Unstake BDX (reverts if lock not expired)
function unstake(uint256 amount) external nonReentrant updateReward(msg.sender)

// Claim accumulated BDX rewards
function claimRewards() external nonReentrant updateReward(msg.sender)

// Stake + auto-claim in one tx
function stakeAndClaim(uint256 amount, uint256 lockDays) external nonReentrant

// Emergency exit — forfeit rewards, bypass lock
function emergencyWithdraw() external nonReentrant

// Read pending rewards for a user
function pendingRewards(address user) external view returns (uint256)

// Read full stake info
function getStakeInfo(address user) external view returns (
    uint256 staked,
    uint256 lockEnd,
    uint256 multiplier,
    uint256 pending,
    bool isLocked
)

// Owner: fund rewards for a period
function notifyRewardAmount(uint256 reward) external onlyOwner updateReward(address(0))

// Owner: update reward duration
function setRewardsDuration(uint256 duration) external onlyOwner

// Owner: update lock multipliers
function setLockMultiplier(uint256 lockDays, uint256 multiplier) external onlyOwner
```

### Modifier
```solidity
modifier updateReward(address account) {
    rewardPerTokenStored = rewardPerToken();
    lastUpdateTime = lastTimeRewardApplicable();
    if (account != address(0)) {
        stakers[account].pendingRewards = earned(account);
        stakers[account].rewardPerTokenPaid = rewardPerTokenStored;
    }
    _;
}
```

### Internal Math
```solidity
function rewardPerToken() public view returns (uint256) {
    if (totalStaked == 0) return rewardPerTokenStored;
    return rewardPerTokenStored + (
        (lastTimeRewardApplicable() - lastUpdateTime) * rewardRate * 1e18 / totalStaked
    );
}

function earned(address user) public view returns (uint256) {
    StakeInfo storage s = stakers[user];
    uint256 effectiveStake = s.amount * s.lockMultiplier / 1e18;
    return effectiveStake * (rewardPerToken() - s.rewardPerTokenPaid) / 1e18
           + s.pendingRewards;
}

function lastTimeRewardApplicable() public view returns (uint256) {
    return block.timestamp < periodFinish ? block.timestamp : periodFinish;
}
```

### Events
```solidity
event Staked(address indexed user, uint256 amount, uint256 lockDays)
event Unstaked(address indexed user, uint256 amount)
event RewardsClaimed(address indexed user, uint256 amount)
event RewardAdded(uint256 reward)
event EmergencyWithdraw(address indexed user, uint256 amount)
```

### Custom Errors
```solidity
error ZeroAmount()
error StillLocked(uint256 unlockTime)
error NothingToUnstake()
error NothingToClaim()
error RewardsPeriodNotFinished()
error ZeroAddress()
```

### Security
- `nonReentrant` on all state-changing functions
- `emergencyWithdraw` skips reward claim — prevents griefing via reward manipulation
- Lock end check on `unstake` — `block.timestamp >= lockEnd`
- `updateReward` modifier snapshots state before any function body executes

---

## Frontend: Staking Hook

### `useStaking(address)`
```typescript
export interface UseStakingResult {
  staked: bigint;
  lockEnd: bigint;             // unix timestamp
  lockMultiplier: bigint;      // 1e18 scaled
  pendingRewards: bigint;
  isLocked: boolean;
  lockTimeRemaining: number;   // seconds
  // Protocol-wide
  totalStaked: bigint;
  rewardRate: bigint;
  aprPct: number;              // estimated APR
  // Meta
  isLoading: boolean;
}
```

### `useStakingActions(address)`
```typescript
type StakingStep =
  | 'idle'
  | 'approving'
  | 'staking'
  | 'unstaking'
  | 'claiming'
  | 'success'
  | 'error';

export interface UseStakingActionsResult {
  step: StakingStep;
  txHash: `0x${string}` | undefined;
  error: string | null;
  stake: (amount: bigint, lockDays: number) => Promise<void>;
  unstake: (amount: bigint) => Promise<void>;
  claimRewards: () => Promise<void>;
  emergencyWithdraw: () => Promise<void>;
  reset: () => void;
}
```

### APR Calculation
```typescript
const aprPct = totalStaked > 0n
  ? parseFloat(formatUnits(rewardRate * 365n * 24n * 3600n * 10000n / totalStaked, 4))
  : 0;
// Result is a percentage — e.g. 1250 = 12.50% APR
```

---

## Frontend: UI

### Stake Card
- Token input with HALF/MAX buttons
- Lock period selector (None / 30d / 90d / 180d) with multiplier badge
- APR display: shows boosted APR for selected lock
- "Stake BDX" primary button

### Position Card (when staked)
- Staked amount + lock status
- Lock timer countdown (if locked)
- Pending rewards with "Claim" button
- Unstake input (enabled when lock expired or no lock)

### Protocol Stats
- Total BDX staked
- Current APR (base + boost)
- Your share of pool (%)

---

## ENV Variables Needed
```
NEXT_PUBLIC_STAKING_ADDRESS=
```

---

## Testing Plan

- `testStakeNoLock` — stake, earn, unstake
- `testStakeWithLock` — lock, attempt early unstake (reverts), wait, unstake
- `testLockMultiplier` — locked user earns more than equal unstaked user
- `testClaimRewards` — claim without unstaking
- `testEmergencyWithdraw` — forfeit rewards, withdraw immediately
- `testRewardPeriodExpiry` — no rewards after `periodFinish`
- `testNotifyRewardAmount` — owner funds new period correctly
