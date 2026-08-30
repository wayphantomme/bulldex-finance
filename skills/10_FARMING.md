# Yield Farming — Feature Spec

**Status:** 🔴 Phase 2 (Weeks 5–8)
**Contract:** `contracts/src/MasterChef.sol` (to be built)
**Frontend:** `frontend/src/app/dashboard/farming/page.tsx`
**Hooks:** `useFarming`, `useFarmingActions` (to be built)

---

## What It Does

Liquidity providers can deposit their LP tokens into farming pools to earn
BDX rewards on top of the 0.3% swap fees they already receive.
Each pool has an allocation point that determines its share of the total
BDX emissions per block.

---

## Design

Based on the **MasterChef v1** pattern (Sushi/PancakeSwap style):
- Owner defines `bdxPerBlock` — total BDX minted per block across all farms
- Each pool has an `allocPoint` — its share of total emissions
- Pool's share: `allocPoint / totalAllocPoint × bdxPerBlock`
- Per-pool accumulator: `accBDXPerShare` tracks cumulative BDX per LP token share

---

## Math

### BDX Per Block for a Pool
```
poolBdxPerBlock = bdxPerBlock × pool.allocPoint / totalAllocPoint
```

### Accumulator Update
```
accBDXPerShare += poolBdxPerBlock × blocksSinceLastReward × 1e12 / lpSupply
```
(Scaled by `1e12` not `1e18` — matches MasterChef v1 convention to avoid overflow with large LP supplies.)

### User Pending Rewards
```
pending = user.amount × accBDXPerShare / 1e12 - user.rewardDebt
```

### rewardDebt
Set on deposit/withdraw to mark "already paid" amount:
```
user.rewardDebt = user.amount × accBDXPerShare / 1e12
```

---

## Contract: MasterChef.sol

### State Variables
```solidity
IERC20  public immutable bdx;         // BDX token (rewards)
address public devAddress;            // dev fund (optional % of emissions)
uint256 public bdxPerBlock;           // total BDX emitted per block
uint256 public startBlock;            // farming starts at this block
uint256 public totalAllocPoint;

struct PoolInfo {
    IERC20   lpToken;           // LP token this pool accepts
    uint256  allocPoint;        // weight vs other pools
    uint256  lastRewardBlock;   // last block rewards were distributed
    uint256  accBDXPerShare;    // accumulated BDX per share (× 1e12)
}

struct UserInfo {
    uint256 amount;             // LP tokens deposited
    uint256 rewardDebt;         // already-accounted rewards
}

PoolInfo[] public poolInfo;
mapping(uint256 => mapping(address => UserInfo)) public userInfo;
```

### Functions to Implement
```solidity
// Add a new LP pool (owner only)
function add(
    uint256 allocPoint,
    IERC20 lpToken,
    bool withUpdate          // update all pools first if true
) external onlyOwner

// Update allocation for existing pool (owner only)
function set(
    uint256 pid,
    uint256 allocPoint,
    bool withUpdate
) external onlyOwner

// Update reward variables for all pools (gas expensive — use sparingly)
function massUpdatePools() external

// Update reward variables for one pool
function updatePool(uint256 pid) external

// Read pending BDX for a user in a pool
function pendingBDX(uint256 pid, address user) external view returns (uint256)

// Deposit LP tokens to earn BDX
function deposit(uint256 pid, uint256 amount)
    external nonReentrant

// Withdraw LP tokens (also harvests pending rewards)
function withdraw(uint256 pid, uint256 amount)
    external nonReentrant

// Harvest rewards without withdrawing LP
function harvest(uint256 pid)
    external nonReentrant

// Emergency withdraw LP tokens — forfeits pending rewards
function emergencyWithdraw(uint256 pid)
    external nonReentrant

// Owner: set BDX per block (updates all pools first)
function setBdxPerBlock(uint256 _bdxPerBlock, bool withUpdate) external onlyOwner

// Owner: update dev address
function setDevAddress(address _devAddress) external onlyOwner

// Read number of pools
function poolLength() external view returns (uint256)
```

### Internal: Update Pool
```solidity
function _updatePool(uint256 pid) internal {
    PoolInfo storage pool = poolInfo[pid];
    if (block.number <= pool.lastRewardBlock) return;

    uint256 lpSupply = pool.lpToken.balanceOf(address(this));
    if (lpSupply == 0 || pool.allocPoint == 0) {
        pool.lastRewardBlock = block.number;
        return;
    }

    uint256 blocks = block.number - pool.lastRewardBlock;
    uint256 bdxReward = blocks * bdxPerBlock * pool.allocPoint / totalAllocPoint;

    // Mint BDX to MasterChef (and optionally to dev)
    bdx.mint(address(this), bdxReward);
    // Optional: bdx.mint(devAddress, bdxReward / 10); // 10% to dev

    pool.accBDXPerShare += bdxReward * 1e12 / lpSupply;
    pool.lastRewardBlock = block.number;
}
```

### Events
```solidity
event Deposit(address indexed user, uint256 indexed pid, uint256 amount)
event Withdraw(address indexed user, uint256 indexed pid, uint256 amount)
event Harvest(address indexed user, uint256 indexed pid, uint256 amount)
event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount)
event PoolAdded(uint256 indexed pid, address lpToken, uint256 allocPoint)
event PoolUpdated(uint256 indexed pid, uint256 allocPoint)
event BdxPerBlockUpdated(uint256 oldRate, uint256 newRate)
```

### Custom Errors
```solidity
error ZeroAmount()
error InvalidPool(uint256 pid)
error DuplicatePool(address lpToken)
error ZeroAddress()
```

### Security
- `nonReentrant` on all state-changing user functions
- `DuplicatePool` check — prevents adding same LP token twice (tracked via mapping)
- `emergencyWithdraw` skips harvest — safe exit without reward dependency
- `bdxPerBlock` changes only update future rewards — retroactive change protected by `_updatePool`
- BDX minting gated by `bdx.mint()` — MasterChef must be authorized as a minter

---

## Minter Authorization

Before MasterChef can distribute rewards, Token.sol must grant it minting rights:
```solidity
// Token.sol needs to support multiple minters OR
// owner pre-mints a budget to MasterChef
bdxToken.mint(masterChefAddress, FARMING_BUDGET);
```

**Option A (Recommended for Phase 2):** Owner pre-mints a fixed budget (e.g. 10M BDX) to MasterChef.
**Option B (Phase 3):** Add a `minters` mapping to Token.sol and grant MasterChef minting rights.

---

## Frontend: Farming Hooks

### `useFarming(address, pid?)`
```typescript
export interface FarmPool {
  pid: number;
  lpToken: `0x${string}`;
  lpSymbol: string;          // e.g. "BDX/MUSDC LP"
  allocPoint: number;
  totalStaked: bigint;       // total LP in this farm
  bdxPerBlock: bigint;       // this pool's share
  aprPct: number;            // estimated APR
  // User-specific
  deposited: bigint;         // user's LP in this pool
  pending: bigint;           // claimable BDX
  depositedUSD: number;      // estimated USD value
}

export interface UseFarmingResult {
  pools: FarmPool[];
  isLoading: boolean;
}
```

### `useFarmingActions(address)`
```typescript
type FarmingStep =
  | 'idle'
  | 'approving'   // approve LP token for MasterChef
  | 'depositing'
  | 'withdrawing'
  | 'harvesting'
  | 'success'
  | 'error';

export interface UseFarmingActionsResult {
  step: FarmingStep;
  txHash: `0x${string}` | undefined;
  error: string | null;
  deposit: (pid: number, amount: bigint) => Promise<void>;
  withdraw: (pid: number, amount: bigint) => Promise<void>;
  harvest: (pid: number) => Promise<void>;
  harvestAll: () => Promise<void>;
  emergencyWithdraw: (pid: number) => Promise<void>;
  reset: () => void;
}
```

### APR Calculation
```typescript
// For a pool:
const poolBdxPerBlock = bdxPerBlock * BigInt(pool.allocPoint) / BigInt(totalAllocPoint);
const poolBdxPerYear = poolBdxPerBlock * 2_102_400n; // ~2.1M blocks/year at 15s/block
const poolBdxPerYearUSD = parseFloat(formatUnits(poolBdxPerYear, 18)) * bdxPriceUSD;
const tvlUSD = parseFloat(formatUnits(pool.totalStaked, 18)) * lpPriceUSD;
const aprPct = tvlUSD > 0 ? (poolBdxPerYearUSD / tvlUSD) * 100 : 0;
```

---

## Frontend: UI

### Farm List Page
- Pool cards with: LP pair name + logos, APR, TVL, "Your stake"
- Each card has Deposit / Withdraw / Harvest actions
- "Harvest All" button to claim rewards from all pools in one pass

### Deposit Modal
- LP token balance + HALF/MAX buttons
- Approval step if needed
- Estimated APR for the deposit amount

### Position Summary
- For each pool where user has LP deposited: amount, pending BDX, entry APR

---

## Initial Farm Pools

| PID | LP Token | Alloc Points | Notes |
|---|---|---|---|
| 0 | BDX/MUSDC LP | 100 | Primary pool — highest weight |
| 1 | BDX/WETH LP | 60 | Secondary pool |

---

## ENV Variables Needed
```
NEXT_PUBLIC_MASTERCHEF_ADDRESS=
```

---

## Testing Plan

- `testDepositAndPendingRewards` — deposit, advance blocks, check pending
- `testHarvest` — harvest without withdrawing LP
- `testWithdraw` — withdraw LP, harvest included
- `testEmergencyWithdraw` — no rewards, just LP back
- `testMultiplePools` — rewards split by allocPoint
- `testMassUpdatePools` — gas usage within acceptable range
- `testSetBdxPerBlock` — existing rewards unaffected
- `testDuplicatePool` — DuplicatePool error
