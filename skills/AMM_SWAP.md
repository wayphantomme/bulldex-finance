# AMM Swap — Feature Spec

**Status:** ✅ Live (Phase 1)
**Contract:** `contracts/src/Pool.sol`
**Frontend:** `frontend/src/app/dashboard/swap/page.tsx`
**Hooks:** `useMultiSwap`, `useMultiPool`, `useSwapQuote`, `useTokenBalances`

---

## What It Does

The AMM swap feature lets users exchange tokens at a market rate determined by the
constant-product formula `x * y = k`. A 0.3% fee is charged on every swap and
distributed entirely to liquidity providers (LPs) — no protocol treasury cut.

Two pools exist:
- **BDX/MUSDC** — primary pool
- **BDX/WETH** — secondary pool (requires WETH, not native ETH)

ETH users are handled via an automatic wrap: ETH → WETH → swap.

---

## Math

### Constant Product Formula
```
x * y = k
```
Where `x` and `y` are the reserves of token0 and token1 respectively.
After a swap, `(x + Δx) * (y - Δy) = k`, so the pool curve never reaches zero.

### Amount Out (with 0.3% fee)
```
amountOut = (amountIn × 997 × reserveOut) / (reserveIn × 1000 + amountIn × 997)
```
The fee is applied to `amountIn`: only 99.7% of the input (`× 997 / 1000`) participates in the swap.
The fee stays in the pool, increasing both reserves and therefore LP token value over time.

### Amount In (exact output)
```
amountIn = (reserveIn × amountOut × 1000) / ((reserveOut - amountOut) × 997) + 1
```
The `+1` prevents off-by-one rounding errors (rounds up in favor of the pool).

### Price Impact (basis points)
```
midPrice = amountIn × reserveOut / reserveIn      (no-fee hypothetical)
impactBps = (midPrice - amountOut) / midPrice × 10000
```
- 0–50 bps (0–0.5%): green
- 50–500 bps (0.5–5%): yellow
- >500 bps (>5%): red

### Spot Price
```
price0 = reserve1 × 1e18 / reserve0   // token0 denominated in token1, scaled 1e18
price1 = reserve0 × 1e18 / reserve1   // token1 denominated in token0, scaled 1e18
```

---

## Contract: Pool.sol

### Key Functions

```solidity
// Swap exact input for as much output as possible
function swap(
    address tokenIn,
    uint256 amountIn,
    uint256 minAmountOut,  // slippage guard
    address to             // recipient
) external nonReentrant returns (uint256 amountOut)

// Pure math — compute output for a given input
function getAmountOut(
    uint256 amountIn,
    uint256 reserveIn,
    uint256 reserveOut
) public pure returns (uint256 amountOut)

// Pure math — compute input needed for a desired output
function getAmountIn(
    uint256 amountOut,
    uint256 reserveIn,
    uint256 reserveOut
) public pure returns (uint256 amountIn)

// Current reserves
function getReserves()
    external view returns (uint256 reserve0, uint256 reserve1)

// Spot prices (scaled 1e18)
function getPrice0() external view returns (uint256)
function getPrice1() external view returns (uint256)

// Price impact in basis points
function getPriceImpact(address tokenIn, uint256 amountIn)
    external view returns (uint256 impactBps)
```

### Constants
```solidity
uint256 public constant FEE_NUMERATOR   = 997;
uint256 public constant FEE_DENOMINATOR = 1000;
// 0.3% swap fee — 100% goes to LPs
```

### Events
```solidity
event Swap(
    address indexed sender,
    address indexed tokenIn,
    uint256 amountIn,
    uint256 amountOut,
    address indexed to
);
```

### Custom Errors
```solidity
error InsufficientInputAmount()    // amountIn == 0
error InsufficientOutputAmount()   // amountOut == 0 or < minAmountOut
error InsufficientLiquidity()      // reserves are zero
error InvalidToken()               // tokenIn not in this pool
error SlippageExceeded(uint256 amountOut, uint256 minAmountOut)
error ZeroAddress()                // to == address(0)
```

### Security
- `nonReentrant` on `swap()` — prevents reentrancy during token callbacks
- Reserves tracked as state (not `balanceOf`) — prevents flash loan price manipulation
- `minAmountOut` slippage guard — reverts if price moved beyond tolerance
- `tokenIn` validated against pool's `token0` / `token1` — prevents arbitrary token injection

---

## Frontend: Swap Flow

### Supported Paths
| From | To | Pool | Extra step |
|---|---|---|---|
| MUSDC | BDX | BDX/MUSDC | — |
| BDX | MUSDC | BDX/MUSDC | — |
| BDX | WETH | BDX/WETH | — |
| WETH | BDX | BDX/WETH | — |
| ETH | BDX | BDX/WETH | Auto-wrap ETH→WETH |

### Step Machine: `useMultiSwap`
```typescript
type MultiSwapStep =
  | 'idle'
  | 'wrapping'   // ETH only: wrapping ETH to WETH
  | 'approving'  // ERC-20 approve
  | 'swapping'   // main swap tx
  | 'success'
  | 'error';
```

### ETH → Token Flow (3 steps)
```
1. deposit() on WETH contract (value = amountIn)
   → wait for receipt
2. approve(poolBdxWeth, MAX_UINT256) on WETH
   → wait for receipt
3. swap(WETH, amountIn, minAmountOut, recipient) on pool
   → success
```

### ERC-20 → Token Flow
```
1. [if not approved] approve(pool, MAX_UINT256) on tokenIn
   → wait for receipt
2. swap(tokenIn, amountIn, minAmountOut, recipient) on pool
   → success
```

### Approval Check
```typescript
// Returns true if current allowance < amountIn
needsApproval(tokenIn: TokenInfo, amountIn: bigint, poolAddress: `0x${string}`): boolean
```
Allowances for all 4 combinations (BDX/MUSDC for both pools) are pre-fetched via multicall.

### Slippage Options
| Label | Basis Points |
|---|---|
| 0.5% | 50 |
| 1.0% | 100 (default) |
| 2.0% | 200 |

### Min Amount Out Calculation
```typescript
function applySlippage(amountOut: bigint, slippageBps: number): bigint {
  return (amountOut * BigInt(10000 - slippageBps)) / 10000n;
}
```

---

## Frontend: Hooks

### `useSwapQuote(tokenIn, amountIn, reserve0, reserve1, token0)`
- Reads reserves from `useMultiPool`
- Calls `Pool.getAmountOut()` via read contract
- Returns `{ amountOut, priceImpact, isLoading }`
- `priceImpact` is in basis points × 100 (i.e., `500` = 5.00%)

### `useMultiPool(tokenIn, tokenOut)`
- Calls `getPoolAddress(tokenIn.address, tokenOut.address)` from `contracts.ts`
- Reads `reserve0`, `reserve1`, `token0` from the correct pool
- Returns `{ poolAddress, reserve0, reserve1, token0, price0, price1, hasLiquidity, isConfigured }`

### `useTokenBalances(address)`
- Multicall to read BDX, MUSDC, WETH, and native ETH balances in one request
- Returns `{ bdx, musdc, weth, eth }` all as `bigint`

---

## Known Issues / Future Improvements

| Issue | Priority | Notes |
|---|---|---|
| No multi-hop routing | Medium | Need Router contract (Phase 3) |
| No transaction deadline | Low | Router will add this |
| `msg.includes('0x')` too broad in handleError | Medium | Fix to use specific error selectors |
| No price chart | Low | Add 7d chart from subgraph data |
| WETH auto-unwrap on output | Low | When swap output is WETH, offer to unwrap |

---

## Testing

Contract tests: `contracts/test/Pool.t.sol`
- `testSwapExactInput` — basic swap
- `testSlippageReverts` — SlippageExceeded custom error
- `testFeeCalculation` — verify 0.3% fee math
- `testInvalidToken` — InvalidToken error
- `testSwapZeroAmount` — InsufficientInputAmount error
- `testConstantProductInvariant` — `k` does not decrease after swap

---

## Deployment

Contract deployed at: `NEXT_PUBLIC_POOL_BDX_MUSDC` and `NEXT_PUBLIC_POOL_BDX_WETH`
Network: Sepolia Testnet (chainId 11155111)
