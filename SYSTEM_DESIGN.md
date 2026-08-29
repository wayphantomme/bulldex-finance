# Bulldex Finance — System Design

## Overview

Bulldex Finance is a full-stack DeFi protocol built on Ethereum (Sepolia testnet).
It implements six core primitives: AMM swap, liquidity provision, lending/borrowing,
staking, yield farming, and on-chain governance — all backed by a single token (BDX).

---

## Architecture

```
contracts/
├── src/
│   ├── Token.sol          — BDX ERC-20 governance + utility token
│   ├── Pool.sol           — x*y=k AMM + LP token (ERC-20)
│   ├── PoolFactory.sol    — deploys and tracks Pool instances
│   ├── Lending.sol        — over-collateralized lending (BDX→MUSDC)
│   ├── WETH.sol           — custom WETH9 wrapper for testnet
│   ├── MockToken.sol      — open-mint ERC-20 for testnet (MUSDC)
│   ├── Staking.sol        — [Phase 2] BDX staking with rewards
│   ├── MasterChef.sol     — [Phase 2] LP token farming
│   ├── TokenVesting.sol   — [Phase 2] vesting schedules
│   └── BDXGovernor.sol    — [Phase 3] on-chain DAO governance
│
frontend/src/
├── constants/
│   ├── contracts.ts       — addresses, ABIs, token metadata, helpers
│   └── abis.ts            — full ABI definitions as const
├── hooks/
│   ├── useMultiSwap.ts    — multi-pool swap execution
│   ├── useMultiPool.ts    — dynamic pool routing by token pair
│   ├── usePool.ts         — single pool quote (legacy, BDX/MUSDC only)
│   ├── usePoolStats.ts    — reserve + price + TVL data
│   ├── useAddLiquidity.ts — add liquidity flow (approve+add, 2-pool)
│   ├── useRemoveLiquidity.ts — remove liquidity flow
│   ├── useLending.ts      — lending stats, position, actions
│   ├── useTokenBalance.ts — single token balance
│   ├── useTokenBalances.ts — multicall balances for all tokens
│   ├── usePriceTicker.ts  — BDX/ETH price + TVL for header
│   ├── useSubgraph.ts     — The Graph analytics queries
│   ├── useSwapEvents.ts   — RPC getLogs fallback for analytics
│   └── useSwap.ts         — [legacy] single-pool swap hook
└── app/
    ├── page.tsx           — landing page (static, no wallet required)
    ├── dashboard/         — app routes (require wallet context)
    └── docs/              — documentation
```

---

## Contracts: Design Decisions

### Token.sol
- ERC-20 + ERC20Burnable + ERC20Permit (EIP-2612)
- `MAX_SUPPLY = 1_000_000_000 ether` — hard cap
- `mint()` is `onlyOwner` — owner = deployer wallet
- Constructor mints initial supply to deployer

### Pool.sol
- Uniswap v2-style constant product: `x * y = k`
- Fee: 0.3% (`FEE_NUMERATOR = 997 / FEE_DENOMINATOR = 1000`)
- `MINIMUM_LIQUIDITY = 1000` locked to `address(1)` on first deposit
- Reserves tracked independently from `balanceOf` (prevents flash loan manipulation)
- LP token is the Pool contract itself (inherits ERC-20)
- **No Router** — users interact with Pool directly. A Router contract is planned for Phase 3.
- **No deadline** — slippage-only protection. Router will add deadline.
- Tokens are sorted: `token0 < token1` by address (canonical order)

### PoolFactory.sol
- Permissionless — anyone can deploy a pool for any pair
- Each pair can only have one pool
- Bidirectional lookup: `getPool[t0][t1]` and `getPool[t1][t0]`

### Lending.sol
- Aave-style over-collateralized lending
- Single collateral/borrow pair: BDX → MUSDC
- LTV: 75% (borrow up to 75% of collateral value)
- Liquidation threshold: 80%
- Liquidation bonus: 5%
- Interest rate: ~5% APR (19 / 1_000_000_000 per block)
- Price oracle: BDX/MUSDC pool spot price — **testnet only**
  - Production: replace with Chainlink price feed
- `healthFactor = (collateralUSD × 80%) / totalDebt`
- `healthFactor < 1e18` = liquidatable
- Liquidation is partial (max 50% of debt per call)
- Interest accumulates on write (not view) — `_accrueInterest()` called on borrow/repay/liquidate

---

## Frontend: Patterns and Conventions

### Hook Naming
```
use[Feature]           — read-only data hook (stats, position, balance)
use[Feature]Actions    — write hook (transactions, state machine)
use[Feature]Stats      — protocol-level aggregates
use[Feature]Position   — per-user state
```

### State Machine Pattern
All write hooks use a `step` state machine:
```typescript
type SomeStep =
  | 'idle'
  | 'approving'    // waiting for ERC-20 approve tx
  | 'pending_name' // waiting for the main tx
  | 'success'
  | 'error';
```
The UI reflects each step with distinct button states and labels.

### Transaction Flow Pattern
Every multi-step tx flow:
1. Set step to `'approving'`
2. `writeContractAsync({ functionName: 'approve', args: [spender, MAX_UINT256] })`
3. `await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 })`
4. Set step to main action
5. `writeContractAsync({ functionName: 'mainAction', args: [...] })`
6. On success: `setStep('success')`, `setTxHash(hash)`
7. On any error: `handleError(e)`

### Error Handling Standard
```typescript
function handleError(e: unknown) {
  const msg = e instanceof Error ? e.message : 'Transaction failed';
  let display = msg.slice(0, 200);

  // Check specific revert reasons BEFORE generic checks
  if (msg.includes('ContractErrorName'))    display = 'User-friendly message.';
  else if (msg.includes('User rejected'))   display = 'Transaction rejected.';
  else /* fallthrough */                    display = msg.slice(0, 200);

  setError(display);
  setStep('error');
}
```
**Rule**: never use `msg.includes('0x')` as a match pattern — it is too broad and will match any hex in any error message.

### MAX_UINT256
Use viem's exported constant — do not redefine:
```typescript
import { maxUint256 } from 'viem';
// NOT: const MAX = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
```

### Shared Formatting Utilities
All number formatting belongs in `frontend/src/utils/format.ts`:
```typescript
export function formatToken(amount: bigint, decimals: number, precision: number): string
export function shortenAddress(address: string, chars?: number): string
export function shortenHash(hash: string): string
export function fmtBig(v: bigint | undefined): string  // K/M/B suffix
```
Do NOT copy these into individual hook files.

---

## Type Standards

### Contract Address Type
Always use `` `0x${string}` `` — never `string` for addresses:
```typescript
address: `0x${string}`;
```

### bigint for on-chain values
All token amounts, prices, and reserves are `bigint`.
Never use `number` for on-chain values — use `parseFloat(formatUnits(v, 18))` only for display.

### Pool Key Type
Defined once in `constants/contracts.ts`:
```typescript
export type PoolKey = 'bdx-musdc' | 'bdx-weth';
```

### Token Decimals
Always read decimals from the `TokenInfo` type — never hardcode `18` in hooks:
```typescript
const tokenInfo: TokenInfo = TOKENS[symbol];
parseAmount(input, tokenInfo.decimals);
```

### Hook Return Interface
Every hook must export its return type:
```typescript
export interface UseFeatureResult {
  // data
  // actions
  // meta: isLoading, error
}
export function useFeature(...): UseFeatureResult { ... }
```

---

## ENV Variables

All contract addresses come from `.env.local` — never hardcode deployed addresses in source code:

```
NEXT_PUBLIC_TOKEN_ADDRESS=
NEXT_PUBLIC_MUSDC_ADDRESS=
NEXT_PUBLIC_WETH_ADDRESS=
NEXT_PUBLIC_FACTORY_ADDRESS=
NEXT_PUBLIC_POOL_BDX_MUSDC=
NEXT_PUBLIC_POOL_BDX_WETH=
NEXT_PUBLIC_LENDING_ADDRESS=
NEXT_PUBLIC_STAKING_ADDRESS=       # Phase 2
NEXT_PUBLIC_MASTERCHEF_ADDRESS=    # Phase 2
NEXT_PUBLIC_VESTING_ADDRESS=       # Phase 2
NEXT_PUBLIC_GOVERNOR_ADDRESS=      # Phase 3
NEXT_PUBLIC_TIMELOCK_ADDRESS=      # Phase 3
NEXT_PUBLIC_SUBGRAPH_URL=
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_ALCHEMY_RPC_URL=
```

**Rule**: New contracts MUST add their address env var to:
1. `contracts/.env.example`
2. `frontend/.env.local` (local deployment)
3. `frontend/src/constants/contracts.ts` (CONTRACT_ADDRESSES)

---

## Security Invariants

### Contracts

| Invariant | Where enforced |
|---|---|
| No reentrancy | `nonReentrant` modifier on all state-changing functions |
| No zero-address tokens | `ZeroAddress` custom error in constructors |
| No zero amounts | `ZeroAmount` custom error on all input validation |
| Supply cap | `ExceedsMaxSupply` check in Token._mintChecked |
| Slippage protection | `minAmountOut` / `amount0Min` / `amount1Min` on every swap/liq |
| Ownership | `Ownable` from OZ v5 on Token + Lending |
| SafeERC-20 | All token transfers use `safeTransfer` / `safeTransferFrom` |

### Frontend

| Invariant | Where enforced |
|---|---|
| Always check `isConfigured(address)` before reading a contract | hooks with `query: { enabled: isConfigured(...) }` |
| Never send tx without wallet connection | `if (!address) return;` at top of action functions |
| Approval before write | Multi-step flow with `awaitTx` between approve and action |
| Slippage applied | `applySlippage(amount, slippageBps)` before every swap/liq call |

---

## Known Issues (Technical Debt)

| Issue | Severity | Location | Fix |
|---|---|---|---|
| Spot price oracle | HIGH (prod) | Lending.sol | Replace with Chainlink before mainnet |
| WETH `transfer()` 2300 gas | MEDIUM | WETH.sol | Replace with `.call{value:}("")` |
| MAX_UINT256 duplicated | LOW | 4 hooks | Import `maxUint256` from viem |
| `fmt()` duplicated | LOW | 3 hooks | Extract to `utils/format.ts` |
| `PoolKey` in hook file | LOW | useAddLiquidity.ts | Move to `constants/contracts.ts` |
| `msg.includes('0x')` too broad | MEDIUM | useMultiSwap.ts | Match specific error selectors |
| No error state in useTokenBalances | LOW | useTokenBalances.ts | Add `isError` return |
| `any` typing in useSubgraph.ts | MEDIUM | useSubgraph.ts | Add GraphQL response types |
| `useSwap.ts` 2s delay for allowance | LOW | useSwap.ts | Replace with `waitForTransactionReceipt` |
| No deadline in Pool.sol | LOW (design) | Pool.sol | Add via Router in Phase 3 |
| Lending reserveBalance drift | LOW | Lending.sol | Track via events or add sync function |
| Private key in contracts/.env | CRITICAL | contracts/.env | Rotate + add to .gitignore |

---

## Gas Optimization Notes

- Use `immutable` for addresses set once in constructor (Pool.sol, Lending.sol) ✅
- Use custom errors (`revert CustomError()`) not `require(condition, "string")` ✅
- Pool reserves are `uint256` — could pack to `uint112` like Uniswap v2 for slot packing (future optimization)
- `_mintLP` uses square root on first deposit — no optimization needed, called once per pool
- Lending interest is simple (not compound) — one multiplication per interaction, cheap

---

## Chain Configuration

| Setting | Value |
|---|---|
| Network | Ethereum Sepolia Testnet |
| Chain ID | 11155111 |
| Block time | ~12 seconds |
| Block explorer | https://sepolia.etherscan.io |
| RPC | Alchemy (via NEXT_PUBLIC_ALCHEMY_RPC_URL) |
| WETH | Custom (not canonical Sepolia WETH) |
| Subgraph | The Graph Studio v0.1.0 |

---

## Adding a New Feature — Checklist

When adding a new contract (e.g., Staking.sol):

**Contract side:**
- [ ] Use `pragma solidity ^0.8.24`
- [ ] Import OZ contracts (ReentrancyGuard, Ownable, SafeERC20)
- [ ] Define all custom errors (not `require` strings)
- [ ] Define all events with `indexed` on addresses
- [ ] Add `nonReentrant` to all state-changing functions
- [ ] Document all functions with NatSpec
- [ ] Write Foundry tests (target 100% branch coverage)
- [ ] Add deploy script in `contracts/script/`
- [ ] Update `.env.example` with new address var

**Frontend side:**
- [ ] Add address to `CONTRACT_ADDRESSES` in `contracts.ts`
- [ ] Add ABI to `constants/abis.ts`
- [ ] Add contract config to `CONTRACTS` object
- [ ] Create `use[Feature].ts` hook(s) following state machine pattern
- [ ] Export hook return interface
- [ ] Create page at `app/dashboard/[feature]/page.tsx`
- [ ] Add route to sidebar navigation
- [ ] Add to `CONTRACT_ADDRESSES` env var list
- [ ] Update `skills/[FEATURE].md` documentation
- [ ] Update `app/docs/page.tsx`
