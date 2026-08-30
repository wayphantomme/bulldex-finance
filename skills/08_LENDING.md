# Lending Markets — Feature Spec

**Status:** ✅ Live (Phase 1)
**Contract:** `contracts/src/Lending.sol`
**Frontend:** `frontend/src/app/dashboard/lending/page.tsx`
**Hooks:** `useLendingStats`, `useLendingPosition`, `useLendingActions`

---

## What It Does

Over-collateralized lending protocol. Users deposit BDX as collateral and
borrow MUSDC against it. Interest accrues per block. If a position becomes
undercollateralized (health factor < 1.0), any address can liquidate it
and receive a 5% bonus on the collateral seized.

---

## Parameters

| Parameter | Value | Notes |
|---|---|---|
| Collateral token | BDX | Deposit to borrow against |
| Borrow token | MUSDC | What you receive when borrowing |
| Max LTV | 75% | Borrow up to 75% of collateral USD value |
| Liquidation threshold | 80% | Position liquidatable below this |
| Liquidation bonus | 5% | Liquidator receives collateral + 5% |
| Interest rate | ~5% APR | Simple interest, accrues per block |
| Price oracle | BDX/MUSDC pool | Spot price — testnet only |

---

## Math

### Health Factor
```
healthFactor = (collateralUSD × liquidationThreshold) / totalDebt
             = (collateralUSD × 0.80) / (borrowed + interest)
```
Scaled by `1e18`. Result interpretation:
- `= type(uint256).max` — no debt, fully healthy
- `>= 1e18 (1.0)` — safe
- `< 1e18 (1.0)` — liquidatable

### Collateral Value (USD)
```
collateralUSD = collateral × bdxPrice / 1e18
```
Where `bdxPrice` is MUSDC per BDX from the pool oracle (scaled 1e18).

### Max Borrowable
```
maxBorrowable = collateralUSD × LTV_NUMERATOR / LTV_DENOMINATOR
              = collateralUSD × 75 / 100
```

### Interest Accrual (Simple, Per Block)
```
newInterest = borrowed × INTEREST_RATE_PER_BLOCK × blocksElapsed / INTEREST_DENOMINATOR
            = borrowed × 19 × blocksElapsed / 1_000_000_000
```
~5% APR at 7200 blocks/day:
`19 × 7200 × 365 / 1_000_000_000 ≈ 0.0499 ≈ 5% APR`

Interest is paid first before principal during repayment.
Interest goes to `reserveBalance` (protocol revenue).

### Collateral to Seize on Liquidation
```
collateralToSeize = (debtCovered × 1e18 × LIQ_BONUS_NUMERATOR) /
                    (bdxPrice × LIQ_BONUS_DENOMINATOR)
                  = debtCovered / bdxPrice × 1.05
```
Partial liquidation: max 50% of debt per call.

### Price Oracle
BDX/MUSDC pool spot price:
```
bdxPrice = musdcReserve × 1e18 / bdxReserve
```
Fallback: `1e18` (1:1 parity) if oracle fails or pool is empty.
**Production requires Chainlink TWAP — spot price is manipulable.**

---

## Contract: Lending.sol

### Key Functions

```solidity
// Deposit BDX as collateral
function depositCollateral(uint256 amount) external nonReentrant

// Withdraw BDX collateral (reverts if would breach LTV)
function withdrawCollateral(uint256 amount) external nonReentrant

// Borrow MUSDC against deposited BDX
function borrow(uint256 amount) external nonReentrant

// Repay borrowed MUSDC + interest
// Pass type(uint256).max to repay full debt
function repay(uint256 amount) external nonReentrant

// Liquidate undercollateralized position
function liquidate(address borrower, uint256 debtToCover) external nonReentrant

// Read health factor (1e18 scaled)
function healthFactor(address user) public view returns (uint256)

// Read max borrow and current debt
function borrowLimit(address user)
    external view returns (uint256 maxBorrow, uint256 currentDebt)

// Full position summary (used by frontend)
function getPosition(address user) external view returns (
    uint256 collateral,
    uint256 borrowed,
    uint256 interest,
    uint256 hf,
    uint256 collateralValueUSD,
    uint256 maxBorrowable
)

// BDX price from pool oracle (MUSDC per BDX, 1e18 scaled)
function getBdxPrice() public view returns (uint256)
```

### Owner-Only Functions
```solidity
function setPriceOracle(address _oracle) external onlyOwner
function fundReserve(uint256 amount) external onlyOwner    // add MUSDC to lend out
function withdrawReserve(uint256 amount, address to) external onlyOwner
```

### Storage
```solidity
struct Position {
    uint256 collateral;       // BDX deposited (wei)
    uint256 borrowed;         // MUSDC borrowed (wei)
    uint256 borrowBlock;      // block of last interest accrual
    uint256 interestAccrued;  // accumulated interest (MUSDC wei)
}

mapping(address => Position) public positions;
uint256 public totalCollateral;
uint256 public totalBorrowed;
uint256 public reserveBalance;  // interest + liquidation proceeds
```

### Events
```solidity
event CollateralDeposited(address indexed user, uint256 amount)
event CollateralWithdrawn(address indexed user, uint256 amount)
event Borrowed(address indexed user, uint256 amount)
event Repaid(address indexed user, uint256 principal, uint256 interest)
event Liquidated(
    address indexed liquidator,
    address indexed borrower,
    uint256 debtRepaid,
    uint256 collateralSeized
)
event PriceOracleUpdated(address newOracle)
```

### Custom Errors
```solidity
error InsufficientCollateral()      // no collateral or too little
error InsufficientBorrowBalance()   // no debt to repay
error ExceedsBorrowLimit()          // borrow or withdraw would breach 75% LTV
error PositionHealthy()             // cannot liquidate healthy position
error ZeroAmount()                  // input is 0
error InsufficientReserve()         // not enough MUSDC in reserve
error ZeroAddress()                 // constructor address check
```

### Security
- `nonReentrant` on all state-changing functions
- SafeERC20 for all token transfers
- Interest accrues on write, not on reads — prevents gas griefing on view calls
- Collateral check on `withdrawCollateral` — simulates post-withdrawal LTV
- Partial liquidation cap (50%) — prevents griefing via total liquidation in one tx
- `try/catch` on oracle call — falls back to 1:1 if pool reverts

---

## Frontend: Action Flows

### Step Machine: `useLendingActions`
```typescript
type LendingStep =
  | 'idle'
  | 'approving'    // ERC-20 approve
  | 'depositing'   // depositCollateral
  | 'withdrawing'  // withdrawCollateral
  | 'borrowing'    // borrow
  | 'repaying'     // repay
  | 'success'
  | 'error';
```

### Deposit BDX Flow
```
1. approve(lending, MAX_UINT256) on BDX token
   → wait for receipt
2. depositCollateral(amount)
   → success
```

### Borrow MUSDC Flow
```
1. borrow(amount) — no approval needed (contract sends MUSDC to user)
   → success
```

### Repay MUSDC Flow
```
1. approve(lending, MAX_UINT256) on MUSDC token
   → wait for receipt
2. repay(amount) — or repay(MAX_UINT256) for full debt
   → success
```

### Withdraw BDX Flow
```
1. withdrawCollateral(amount) — no approval needed
   → success (reverts if LTV would be breached)
```

---

## Frontend: Data Hooks

### `useLendingStats()`
Reads protocol-wide aggregates via multicall:
```typescript
{
  totalCollateral: bigint;     // total BDX deposited
  totalBorrowed: bigint;       // total MUSDC borrowed
  reserveBalance: bigint;      // MUSDC available to borrow
  bdxPrice: bigint;            // 1e18 scaled MUSDC per BDX
  bdxPriceFormatted: string;
  isLoading: boolean;
  isConfigured: boolean;
}
```
Refreshes every 30 seconds.

### `useLendingPosition(address)`
Reads user-specific position via single `getPosition(user)` call:
```typescript
{
  collateral: bigint;
  borrowed: bigint;
  interest: bigint;
  healthFactor: bigint;           // 1e18 scaled
  healthFactorNum: number;        // float for display
  collateralValueUSD: bigint;
  maxBorrowable: bigint;
  utilizationPct: number;         // borrowed / maxBorrowable × 100
  isLiquidatable: boolean;        // hf < 1e18
  // Formatted strings
  collateralFormatted: string;
  borrowedFormatted: string;
  interestFormatted: string;
  healthFactorFormatted: string;
  maxBorrowableFormatted: string;
  isLoading: boolean;
}
```
Refreshes every 15 seconds.

---

## Frontend: UI Layout

### My Positions Tab — 2-Column Layout
- **Left col (3/5 width):** Your Position card
  - Collateral + Borrowed mini-cards (2-up grid)
  - Borrow capacity progress bar (colored by utilization)
  - Action buttons: Deposit BDX (primary), Borrow MUSDC (brand outline)
  - Secondary row: Repay Debt (with debt badge), Withdraw BDX
  - Contextual hint text when debt = 0 or collateral = 0
- **Right col (2/5 width):**
  - Health Factor card with `text-4xl` number + colored badge
  - Segmented progress bar (Danger/Warning/Safe zones)
  - Market Details card (compact list)

### Health Badge
```typescript
function HealthBadge({ hf }: { hf: number }) // rendered next to health number
```
- `>= 1.5` → green "SAFE"
- `1.2–1.5` → yellow "WARNING"
- `1.0–1.2` → red "AT RISK"
- `< 1.0` → red pulsing "DANGER"

### Action Modal
Opens as a centered overlay with backdrop blur:
- Header: token icon + action name + "BDX Market" subtitle
- Context row: Collateral | Max Borrow | Health (3 columns)
- Input field with HALF/MAX buttons
- Repay shows breakdown: Principal + Interest = Total Debt
- CTA button follows step machine state

---

## Known Issues / Future Improvements

| Issue | Priority | Notes |
|---|---|---|
| Spot price oracle | HIGH (prod) | Replace with Chainlink before mainnet |
| reserveBalance drift | LOW | Owner-funded; tracks accounting, not actual balance |
| Interest not compound | LOW | Simple interest is fine for testnet |
| No liquidation UI | MEDIUM | Any user can call liquidate — no frontend yet |
| Number precision loss | LOW | `Number(bigint)` for utilPct — fine for testnet amounts |
| Error hex selectors hardcoded | LOW | Use ABI decoding instead |

---

## Testing

Contract tests: `contracts/test/Lending.t.sol`
- `testDepositCollateral` — basic deposit
- `testWithdrawCollateral` — withdraw, LTV check
- `testBorrow` — borrow up to limit
- `testBorrowExceedsLimit` — ExceedsBorrowLimit error
- `testRepay` — full and partial repay
- `testRepayAll` — MAX repay
- `testInterestAccrual` — interest accrues correctly over blocks
- `testLiquidation` — unhealthy position is liquidated
- `testLiquidationHealthy` — PositionHealthy error
- `testHealthFactor` — math verification

---

## Deployment

Contract deployed at: `NEXT_PUBLIC_LENDING_ADDRESS`
Reserve funded by owner with MUSDC via `fundReserve(amount)`.
