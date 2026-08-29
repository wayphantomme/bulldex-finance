# Liquidity Pools — Feature Spec

**Status:** ✅ Live (Phase 1)
**Contract:** `contracts/src/Pool.sol`
**Frontend:** `frontend/src/app/dashboard/liquidity/page.tsx`
**Hooks:** `useAddLiquidity`, `useRemoveLiquidity`, `usePoolStats`, `usePoolShare`

---

## What It Does

Liquidity providers (LPs) deposit equal-value pairs of tokens into a pool to earn
0.3% of every swap that passes through it. In return they receive LP tokens that
represent their proportional share of the pool reserves. LP tokens can be burned
at any time to withdraw the underlying tokens.

Two pools are live:
- **BDX/MUSDC** — primary pool
- **BDX/WETH** — secondary pool

---

## Math

### LP Token Minting (First Deposit)
```
liquidity = sqrt(amount0 × amount1) - MINIMUM_LIQUIDITY
```
The square root ensures the initial price ratio is set by the depositor,
and subtracting `MINIMUM_LIQUIDITY = 1000` locks a tiny amount of LP tokens
in `address(1)` forever — this prevents the first depositor from draining
the pool to dust.

### LP Token Minting (Subsequent Deposits)
```
liquidity = min(
  amount0 × totalSupply / reserve0,
  amount1 × totalSupply / reserve1
)
```
The smaller of the two ratios is used — this rewards proportional deposits.
Any excess tokens beyond the optimal ratio are returned to the caller.

### Optimal Deposit Calculation
Given `amount0Desired` and `amount1Desired`:
```
amount1Optimal = amount0Desired × reserve1 / reserve0
```
If `amount1Optimal <= amount1Desired`: use `(amount0Desired, amount1Optimal)`
Otherwise:
```
amount0Optimal = amount1Desired × reserve0 / reserve1
```
Use `(amount0Optimal, amount1Desired)`.

### Withdrawal
```
amount0 = liquidity × reserve0 / totalSupply
amount1 = liquidity × reserve1 / totalSupply
```
Proportional share of current reserves. If a pool has earned swap fees
since the LP deposited, `reserve0` and `reserve1` are higher, so the LP
receives more tokens than they deposited (impermanent gain from fees).

### Pool Share Percentage
```
sharePct = lpBalance / totalSupply × 100
```

### Impermanent Loss (Reference)
When token prices diverge from the deposit ratio, LPs experience
impermanent loss vs simply holding:
```
IL = 2 × sqrt(priceRatio) / (1 + priceRatio) - 1
```
Where `priceRatio = currentPrice / depositPrice`.
IL is only realized upon withdrawal. Swap fees offset IL over time.

---

## Contract: Pool.sol

### Key Functions

```solidity
// Deposit tokens, receive LP tokens
function addLiquidity(
    uint256 amount0Desired,   // max token0 to deposit
    uint256 amount1Desired,   // max token1 to deposit
    uint256 amount0Min,       // slippage guard
    uint256 amount1Min,       // slippage guard
    address to                // LP token recipient
) external nonReentrant
  returns (uint256 amount0, uint256 amount1, uint256 liquidity)

// Burn LP tokens, receive underlying tokens
function removeLiquidity(
    uint256 liquidity,        // LP tokens to burn
    uint256 amount0Min,       // slippage guard
    uint256 amount1Min,       // slippage guard
    address to                // token recipient
) external nonReentrant
  returns (uint256 amount0, uint256 amount1)

// Read current reserves
function getReserves()
    external view returns (uint256 reserve0, uint256 reserve1)

// LP token total supply (inherited ERC-20)
function totalSupply() external view returns (uint256)

// LP token balance of address (inherited ERC-20)
function balanceOf(address account) external view returns (uint256)
```

### Constants
```solidity
uint256 public constant MINIMUM_LIQUIDITY = 1000;
// Locked to address(1) on first deposit — prevents price manipulation
```

### Events
```solidity
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
```

### Custom Errors
```solidity
error InsufficientLiquidity()         // reserves are zero
error InsufficientLiquidityMinted()   // would mint 0 LP tokens
error InsufficientLiquidityBurned()   // burning 0 LP or returning 0 tokens
error InsufficientOutputAmount()      // slippage exceeded on withdrawal
```

### Security
- `nonReentrant` on both `addLiquidity` and `removeLiquidity`
- `amount0Min` / `amount1Min` slippage guards on both functions
- Reserves stored separately from `balanceOf` — prevents donation attacks
- `MINIMUM_LIQUIDITY` prevents first-depositor price manipulation attack
- LP burn happens from `msg.sender` — caller must hold LP tokens

---

## Frontend: Add Liquidity Flow

### Step Machine: `useAddLiquidity`
```typescript
type AddLiqStep =
  | 'idle'
  | 'approving_bdx'   // approve BDX for pool
  | 'approving_t1'    // approve token1 (MUSDC or WETH) for pool
  | 'adding'          // addLiquidity tx
  | 'success'
  | 'error';
```

### Transaction Flow
```
1. approve(pool, MAX_UINT256) for BDX
   → wait for receipt
2. approve(pool, MAX_UINT256) for token1 (MUSDC or WETH)
   → wait for receipt
3. addLiquidity(amount0, amount1, min0, min1, userAddress)
   → success
```
Both approvals happen sequentially, each with `awaitTx()` before proceeding.

### Paired Amount Calculation
When user types the BDX amount, the paired amount is auto-calculated:
```
paired = amountTyped × reserve1 / reserve0
```
This keeps the deposit in the exact current ratio, minimizing unused tokens.

### Pool Config
```typescript
type PoolKey = 'bdx-musdc' | 'bdx-weth';

const POOL_CONFIG: Record<PoolKey, {
  address: `0x${string}`;
  label: string;
  token0Symbol: string;
  token1Symbol: string;
  token0Logo: string;
  token1Logo: string;
  fee: string;
}>;
```

### Slippage Application
```typescript
const min0 = applySlippage(t0Amount, slippageBps); // e.g. 50 = 0.5%
const min1 = applySlippage(t1Amount, slippageBps);
await addLiq.addLiquidity(t0Amount, t1Amount, min0, min1);
```

---

## Frontend: Remove Liquidity Flow

### Step Machine: `useRemoveLiquidity`
```typescript
type RemoveLiqStep =
  | 'idle'
  | 'removing'   // removeLiquidity tx
  | 'success'
  | 'error';
```
No approval needed — LP tokens are burned directly from `msg.sender`.
The contract does NOT need an allowance on the LP token (Pool burns its own ERC-20).

### Percentage Slider
User selects a percentage (1–100%) of their LP balance to remove:
```typescript
lpToRemove = lpBalance * BigInt(lpPct) / 100n
```
Quick select buttons: 25% / 50% / 75% / MAX

### Estimated Return
```typescript
const estimatedBack = {
  t0: (lpToRemove * reserve0) / totalSupply,
  t1: (lpToRemove * reserve1) / totalSupply,
};
```
Displayed before confirmation so user knows what they get back.

---

## Frontend: Pool Stats

### `usePoolStats(poolAddress?)`
If no address provided, defaults to `CONTRACT_ADDRESSES.pool` (BDX/MUSDC).

Returns:
```typescript
{
  reserve0: bigint;
  reserve1: bigint;
  totalSupply: bigint;
  token0: `0x${string}` | undefined;
  price0: bigint;       // token0 price in token1, scaled 1e18
  price1: bigint;       // token1 price in token0, scaled 1e18
  hasLiquidity: boolean;
  // Formatted
  bdxReserveFormatted: string;   // e.g. "12.77K"
  musdcReserveFormatted: string;
}
```

### `usePoolShare(lpBalance, totalSupply, reserve0, reserve1, isBDXToken0)`
Pure computation hook — no RPC calls:
```typescript
{
  sharePct: number;           // 0–100
  sharePctFormatted: string;  // "1.07%"
  bdxAmount: bigint;
  pairedAmount: bigint;
}
```

---

## UI Behavior

### Pool Table
- Shows both pools with TVL, fee, and user's LP position
- **Add** button — always visible, opens add modal pre-set to that pool
- **Remove** button — enabled only if `lpBalance > 0`, disabled (grey) otherwise
- Both buttons visible from start — Remove is not hidden when no position

### Action Modal
- Tabs: "Add Liquidity" / "Remove Liquidity"
- Add tab: two `PoolInput` components with HALF/MAX helpers
- Remove tab: percentage slider + quick buttons + InfoRow summary

### WETH Note
The BDX/WETH pool requires WETH (ERC-20), not native ETH.
A note in the UI links to the Faucet page where ETH can be wrapped.

---

## Pool Addresses

| Pool | Env Var |
|---|---|
| BDX/MUSDC | `NEXT_PUBLIC_POOL_BDX_MUSDC` |
| BDX/WETH | `NEXT_PUBLIC_POOL_BDX_WETH` |

---

## Known Issues / Future Improvements

| Issue | Priority | Notes |
|---|---|---|
| No fee APY display | Low | Compute as: volume24h × 0.003 / TVL × 365 |
| No LP position USD value | Low | lpShare × reserve0 × bdxPrice × 2 |
| No impermanent loss calculator | Low | Nice-to-have for users |
| `refetchBalance` before tx mines | Low | Move after `awaitTx()` in useRemoveLiquidity |
| No deadline param | Low | Add via Router (Phase 3) |

---

## Testing

Contract tests: `contracts/test/Pool.t.sol`
- `testAddLiquidityFirst` — sqrt formula, MINIMUM_LIQUIDITY locked
- `testAddLiquiditySubsequent` — proportional mint
- `testRemoveLiquidity` — proportional burn
- `testSlippageOnAdd` — InsufficientOutputAmount error
- `testSlippageOnRemove` — same
- `testLPTokenTransfer` — LP tokens are transferable ERC-20
