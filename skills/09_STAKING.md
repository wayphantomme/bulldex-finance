# Staking — Feature Spec

**Status:** 🟢 Live (Deployed Aug 2026)
**Contract:** `contracts/src/Staking.sol` ✅
**Deploy Script:** `contracts/script/DeployStaking.s.sol` ✅
**Fund Script:** `contracts/script/FundStaking.s.sol` ✅
**Frontend:** `frontend/src/app/dashboard/staking/page.tsx` ✅
**Hooks:** `useStaking`, `useStakingActions` ✅
**Contract Address (Sepolia):** `0x9215e48EEEE58a44805518A8aFBAD26A56749716`

---

## What It Does

BDX holders stake their tokens to earn BDX rewards from protocol inflation.
Stakers receive proportional rewards based on their **effective stake** (raw amount × lock multiplier).
Staking can optionally include a lock period for boosted rewards.

Uses the **Synthetix rewardPerToken accumulator** pattern for O(1) reward updates — no loops over stakers.

**Reward flow:**
1. Owner calls `notifyRewardAmount(amount)` — mints BDX and funds a reward period
2. Stakers earn proportionally to their effective stake every second
3. `effectiveStake = staked × lockMultiplier / 1e18`
4. Rewards claimable at any time without unstaking
5. Unstake requires lock period to expire (or use Emergency Exit to bypass, forfeiting rewards)

---

## Design Decisions

### Reward Source
Rewards come from **protocol inflation** — owner mints new BDX, approves staking contract, then calls `notifyRewardAmount()`. BDX is the same token for both staking and rewards (BDX → BDX).

Future: protocol fee revenue (lending spread, flash loan fees) can supplement or replace inflation.

### Reward Distribution Model
**Synthetix rewardPerToken accumulator:**
```
rewardPerTokenStored += rewardRate × elapsed × 1e18 / totalEffectiveStake
```
O(1) per user — no loops. Each user stores a `rewardPerTokenPaid` snapshot; diff × effectiveStake = earned.

### Lock Periods (Optional)
| Period | Multiplier | Effective stake boost |
|---|---|---|
| No lock | 1.0× | baseline |
| 30 days | 1.2× | +20% rewards |
| 90 days | 1.5× | +50% rewards |
| 180 days | 2.0× | +100% rewards |

Lock multiplier increases effective stake for reward calculation only — raw staked amount unchanged.
New stakes extend lock to max(currentLockEnd, newLockEnd).

---

## Contract: Staking.sol (Deployed)

### Constants
```solidity
uint256 public constant PRECISION          = 1e18;
uint256 public constant DEFAULT_DURATION   = 7 days;

uint256 public constant MULTIPLIER_NONE    = 1e18;    // 1.0×
uint256 public constant MULTIPLIER_30DAYS  = 1.2e18;  // 1.2×
uint256 public constant MULTIPLIER_90DAYS  = 1.5e18;  // 1.5×
uint256 public constant MULTIPLIER_180DAYS = 2e18;    // 2.0×
```

### State Variables
```solidity
IERC20 public immutable stakingToken;   // BDX (staked)
IERC20 public immutable rewardsToken;   // BDX (rewards — same token)

uint256 public rewardsDuration;         // default 7 days
uint256 public periodFinish;            // timestamp when current period ends
uint256 public rewardRate;              // rewards per second
uint256 public lastUpdateTime;
uint256 public rewardPerTokenStored;
uint256 public totalEffectiveStake;     // sum of all effectiveStake values

struct StakeInfo {
    uint256 amount;               // raw BDX staked
    uint256 effectiveAmount;      // amount × multiplier / 1e18
    uint256 lockEnd;              // timestamp (0 = no lock)
    uint256 lockDays;             // original lock days for display
    uint256 rewardPerTokenPaid;   // snapshot when last updated
    uint256 pendingRewards;       // unclaimed rewards
}
mapping(address => StakeInfo) public stakers;
```

### Key Functions
```solidity
// User: stake BDX with optional lock
function stake(uint256 amount, uint256 lockDays) external nonReentrant updateReward(msg.sender)
// lockDays: 0, 30, 90, or 180 — anything else reverts InvalidLockDays()

// User: unstake (reverts StillLocked if lock not expired)
function unstake(uint256 amount) external nonReentrant updateReward(msg.sender)

// User: claim BDX rewards without unstaking
function claimRewards() external nonReentrant updateReward(msg.sender)

// User: emergency — bypass lock, forfeit ALL pending rewards
function emergencyWithdraw() external nonReentrant

// Owner: mint BDX, approve, then call this to fund a new reward period
function notifyRewardAmount(uint256 reward) external onlyOwner updateReward(address(0))
// If period still active: remaining rewards roll into new rate

// Owner: change reward duration (only after current period ends)
function setRewardsDuration(uint256 duration) external onlyOwner
```

### View Functions
```solidity
function rewardPerToken() public view returns (uint256)
function earned(address user) public view returns (uint256)
function lastTimeRewardApplicable() public view returns (uint256)
function getStakeInfo(address user) external view returns (
    uint256 amount, uint256 lockEnd, uint256 lockDays,
    uint256 lockMultiplier, uint256 pendingRewards, bool isLocked
)
function estimatedAPR(uint256 lockDays) external view returns (uint256 aprBps)
// aprBps: basis points — 10000 = 100%
```

### Internal Math
```solidity
// Reward accumulator
function rewardPerToken() public view returns (uint256) {
    if (totalEffectiveStake == 0) return rewardPerTokenStored;
    return rewardPerTokenStored + (
        (lastTimeRewardApplicable() - lastUpdateTime) * rewardRate * PRECISION
        / totalEffectiveStake
    );
}

// Per-user earnings
function earned(address user) public view returns (uint256) {
    StakeInfo storage s = stakers[user];
    return (s.effectiveAmount * (rewardPerToken() - s.rewardPerTokenPaid) / PRECISION)
           + s.pendingRewards;
}
```

### Events
```solidity
event Staked(address indexed user, uint256 amount, uint256 lockDays, uint256 lockEnd)
event Unstaked(address indexed user, uint256 amount)
event RewardsClaimed(address indexed user, uint256 amount)
event RewardAdded(uint256 reward, uint256 periodFinish)
event EmergencyWithdraw(address indexed user, uint256 amount)
event RewardsDurationUpdated(uint256 newDuration)
```

### Custom Errors
```solidity
error ZeroAmount()
error ZeroAddress()
error StillLocked(uint256 unlockTime)
error NothingStaked()
error NothingToClaim()
error PeriodNotFinished()
error InvalidLockDays()
error ZeroRewardRate()
```

### Security
- `nonReentrant` on all state-changing functions
- `emergencyWithdraw` zeroes pendingRewards before transfer — no reward griefing
- `updateReward` modifier snapshots state before function body
- `scheduleId` pattern not used — single position per wallet (simpler UX)
- After lock expires, multiplier resets to 1× on next unstake

---

## Deployment (Sepolia)

### DeployStaking.s.sol
- Deploys `Staking.sol` with BDX as both staking and rewards token
- Mints 10,000,000 BDX to deployer
- Approves staking contract and calls `notifyRewardAmount(10_000_000 ether)`
- Funds first 7-day reward period immediately on deploy

### FundStaking.s.sol
- Run after initial deploy to start a new reward period
- Mints another 10,000,000 BDX, approves, and calls `notifyRewardAmount()`
- Can be re-run each week to keep rewards flowing

### Deployment History (Sepolia)
| Run | Tx time | Action |
|---|---|---|
| DeployStaking | Aug 2026 | Deploy + initial fund (10M BDX) |
| FundStaking #1 | Aug 2026 | +10M BDX |
| FundStaking #2 | Aug 2026 | +10M BDX |
| FundStaking #3 | Aug 2026 | +10M BDX |
| **Total minted for staking** | | **40M BDX** |

---

## Inflation & APR Math

### Rate
```
rewardRate = 10,000,000 BDX / 604,800 seconds = ~16.53 BDX/second
Annual projection = 16.53 × 31,536,000 = ~521,780,000 BDX/year
```

### APR by total staked (no lock, 1×)
| Total staked | Base APR | 180-day lock APR (2×) |
|---|---|---|
| 1,000,000 BDX | ~52,178% | ~104,356% |
| 10,000,000 BDX | ~5,217% | ~10,434% |
| 100,000,000 BDX | ~521% | ~1,043% |

### Time to max supply at current rate
```
Max supply:        1,000,000,000 BDX
Already minted:       40,000,000 BDX (staking rewards to date)
Remaining:           960,000,000 BDX

At 10M BDX/week: 960M / (10M × 52) = ~1.85 years to hit max supply
```

### What happens when max supply is reached?
- `mint()` reverts with `ExceedsMaxSupply` — no new BDX can be created
- Staking rewards switch to **protocol fee revenue** (swap fees, lending spread)
- Owner funds `notifyRewardAmount()` from treasury instead of minting
- APR drops significantly but becomes **sustainable and non-dilutive**
- This is the same model as Ethereum post-merge, GMX, dYdX at maturity

### Mainnet recommendation
Current testnet rate (10M/7 days) is intentionally high for testing. Before mainnet:
| Scenario | Reward/period | Duration | Years to max supply |
|---|---|---|---|
| Conservative | 1M BDX | 30 days | ~83 years |
| Moderate | 2M BDX | 14 days | ~13 years |
| Current (testnet) | 10M BDX | 7 days | ~1.85 years |

---

## Frontend: Hooks (Implemented)

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
