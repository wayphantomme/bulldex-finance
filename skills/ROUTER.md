# Router + Multi-Hop Swap — Feature Spec

**Status:** 🔴 Phase 3 (Weeks 9–12)
**Contract:** `contracts/src/BulldexRouter.sol` (to be built)
**Frontend:** Updates to `useMultiSwap`, `swap/page.tsx`
**Hooks:** Updates to `useMultiSwap`, new `useRouterQuote`

---

## What It Does

The Router contract adds:
1. **Transaction deadline** — auto-reverts stale transactions stuck in mempool
2. **Multi-hop swaps** — route through intermediate tokens (e.g. MUSDC → BDX → WETH)
3. **Exact output swaps** — specify how much you want to receive
4. **Add/remove liquidity via Router** — cleaner UX with deadline
5. **ETH handling** — native ETH in/out without manual wrap/unwrap

Currently users interact with Pool.sol directly — no deadline protection exists.

---

## Math

### Multi-Hop Amount Out
For path `[tokenA, tokenB, tokenC]`:
```
amountAB = getAmountOut(amountA, reserveA_in_poolAB, reserveB_in_poolAB)
amountBC = getAmountOut(amountAB, reserveB_in_poolBC, reserveC_in_poolBC)
```
Each hop applies the 0.3% fee. Three-hop path loses ~0.9% to fees.

### Exact Output (Reverse Calculation)
For path `[tokenA, tokenB, tokenC]` to get `amountC`:
```
amountB = getAmountIn(amountC, reserveB_in_poolBC, reserveC_in_poolBC)
amountA = getAmountIn(amountB, reserveA_in_poolAB, reserveB_in_poolAB)
```

---

## Contract: BulldexRouter.sol

### Dependencies
```solidity
import "./PoolFactory.sol";   // to find pool addresses
import "./WETH.sol";          // for ETH wrapping
```

### State Variables
```solidity
PoolFactory public immutable factory;
WETH        public immutable weth;
```

### Functions to Implement

```solidity
// ─── Swap ─────────────────────────────────────────────────────────────────

// Swap exact input, receive as much output as possible
function swapExactTokensForTokens(
    uint256 amountIn,
    uint256 amountOutMin,       // slippage guard
    address[] calldata path,    // [tokenIn, ..., tokenOut]
    address to,
    uint256 deadline            // unix timestamp — revert if expired
) external returns (uint256[] memory amounts)

// Swap as little as needed to receive exact output
function swapTokensForExactTokens(
    uint256 amountOut,          // exact amount to receive
    uint256 amountInMax,        // slippage guard
    address[] calldata path,
    address to,
    uint256 deadline
) external returns (uint256[] memory amounts)

// ETH → tokens (auto-wraps ETH)
function swapExactETHForTokens(
    uint256 amountOutMin,
    address[] calldata path,    // must start with WETH address
    address to,
    uint256 deadline
) external payable returns (uint256[] memory amounts)

// Tokens → ETH (auto-unwraps WETH)
function swapTokensForExactETH(
    uint256 amountOut,
    uint256 amountInMax,
    address[] calldata path,    // must end with WETH address
    address to,
    uint256 deadline
) external returns (uint256[] memory amounts)

function swapExactTokensForETH(
    uint256 amountIn,
    uint256 amountOutMin,
    address[] calldata path,    // must end with WETH address
    address to,
    uint256 deadline
) external returns (uint256[] memory amounts)


// ─── Liquidity ────────────────────────────────────────────────────────────

function addLiquidity(
    address tokenA,
    address tokenB,
    uint256 amountADesired,
    uint256 amountBDesired,
    uint256 amountAMin,
    uint256 amountBMin,
    address to,
    uint256 deadline
) external returns (uint256 amountA, uint256 amountB, uint256 liquidity)

function addLiquidityETH(
    address token,
    uint256 amountTokenDesired,
    uint256 amountTokenMin,
    uint256 amountETHMin,
    address to,
    uint256 deadline
) external payable returns (uint256 amountToken, uint256 amountETH, uint256 liquidity)

function removeLiquidity(
    address tokenA,
    address tokenB,
    uint256 liquidity,
    uint256 amountAMin,
    uint256 amountBMin,
    address to,
    uint256 deadline
) external returns (uint256 amountA, uint256 amountB)

function removeLiquidityETH(
    address token,
    uint256 liquidity,
    uint256 amountTokenMin,
    uint256 amountETHMin,
    address to,
    uint256 deadline
) external returns (uint256 amountToken, uint256 amountETH)


// ─── Quote Helpers (pure/view) ────────────────────────────────────────────

// Compute output amounts for each hop in path
function getAmountsOut(uint256 amountIn, address[] calldata path)
    external view returns (uint256[] memory amounts)

// Compute input amounts needed for each hop to achieve desired output
function getAmountsIn(uint256 amountOut, address[] calldata path)
    external view returns (uint256[] memory amounts)

// Quote token amount given reserves (no fee)
function quote(uint256 amountA, uint256 reserveA, uint256 reserveB)
    external pure returns (uint256 amountB)
```

### Deadline Modifier
```solidity
modifier ensure(uint256 deadline) {
    require(block.timestamp <= deadline, 'BulldexRouter: EXPIRED');
    _;
}
```

### Internal: Get Pool Address
```solidity
function _pairFor(address tokenA, address tokenB)
    internal view returns (address pool)
{
    pool = factory.poolFor(tokenA, tokenB);
    require(pool != address(0), 'BulldexRouter: POOL_NOT_FOUND');
}
```

### Internal: Swap Through Path
```solidity
function _swap(
    uint256[] memory amounts,
    address[] memory path,
    address _to
) internal {
    for (uint256 i; i < path.length - 1; i++) {
        (address input, address output) = (path[i], path[i + 1]);
        address pool = _pairFor(input, output);
        uint256 amountOut = amounts[i + 1];
        // Last hop sends to _to, intermediate hops send to next pool
        address to = i < path.length - 2 ? _pairFor(output, path[i + 2]) : _to;
        Pool(pool).swap(input, amounts[i], amountOut, to);
    }
}
```

### Custom Errors
```solidity
error Expired(uint256 deadline, uint256 current)
error InsufficientOutputAmount()
error ExcessiveInputAmount()
error InvalidPath()
error PoolNotFound(address tokenA, address tokenB)
```

### Security
- `ensure(deadline)` modifier on all user-facing swap/liquidity functions
- Path validation: length >= 2, no repeated addresses
- Exact output: `amountInMax` guard prevents spending too much
- ETH refund: if ETH swap uses less than `msg.value`, excess is returned
- `nonReentrant` on all payable functions

---

## Frontend: Hook Updates

### `useRouterQuote(tokenIn, tokenOut, amountIn, path?)`
```typescript
export interface UseRouterQuoteResult {
  amountOut: bigint;
  priceImpact: number;         // basis points
  route: string[];             // symbol path e.g. ['MUSDC', 'BDX', 'WETH']
  isMultiHop: boolean;
  isLoading: boolean;
}
```
Auto-selects best route if no path given.

### Updated `useMultiSwap`
- Replace direct `Pool.swap()` calls with `Router.swapExactTokensForTokens()`
- Add deadline calculation: `Math.floor(Date.now() / 1000) + 20 * 60` (20 min)
- Support multi-hop paths via `getAmountsOut`

### Deadline Setting (UI)
New setting in the slippage panel:
```
Transaction deadline: [20] minutes
```

---

## Supported Paths (After Router)

| From | To | Path | Hops |
|---|---|---|---|
| MUSDC | BDX | MUSDC → BDX | 1 |
| BDX | MUSDC | BDX → MUSDC | 1 |
| BDX | WETH | BDX → WETH | 1 |
| WETH | BDX | WETH → BDX | 1 |
| MUSDC | WETH | MUSDC → BDX → WETH | 2 |
| WETH | MUSDC | WETH → BDX → MUSDC | 2 |
| ETH | MUSDC | ETH → WETH → BDX → MUSDC | wrap + 2 |
| ETH | BDX | ETH → WETH → BDX | wrap + 1 |

---

## ENV Variables Needed
```
NEXT_PUBLIC_ROUTER_ADDRESS=
```

---

## Migration Notes

When Router is deployed:
1. Update `useMultiSwap` to use Router for all swaps
2. Update `useAddLiquidity` / `useRemoveLiquidity` to use Router
3. Deprecate direct Pool interaction in UI (Pool still works — just less safe without deadline)
4. Add "Transaction deadline" setting in swap settings panel

---

## Testing Plan

- `testSwapExactTokensForTokens` — single hop
- `testSwapExactTokensForTokens_multiHop` — MUSDC → BDX → WETH
- `testDeadlineExpired` — expired transaction reverts
- `testSlippageGuard` — `amountOutMin` enforced
- `testSwapExactETHForTokens` — ETH auto-wrapped
- `testSwapTokensForExactETH` — WETH auto-unwrapped, ETH refund
- `testAddLiquidityETH` — ETH + token to pool
- `testRemoveLiquidityETH` — receive ETH + token
- `testGetAmountsOut` — matches manual calculation
- `testGetAmountsIn` — matches manual calculation
- `testInvalidPath` — revert on path.length < 2
