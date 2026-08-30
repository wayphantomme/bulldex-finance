# Technical Requirements Document (TRD)

## Bulldex Finance - Decentralized Trading Protocol

**Version:** 1.0  
**Last Updated:** 2026-08-24  
**Target Audience:** Developers, DevOps, Security

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     User Browser (Web)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Frontend (Next.js + React + TypeScript)             │   │
│  │  - Wallet connection (Privy, Rainbow Kit)            │   │
│  │  - Contract interactions (wagmi + viem)              │   │
│  │  - State management (Zustand or Redux)               │   │
│  │  - UI components (Tailwind CSS)                      │   │
│  └────────────┬─────────────────────────────────────────┘   │
└───────────────┼──────────────────────────────────────────────┘
                │ HTTP/HTTPS
                ↓
        ┌───────────────┐
        │  RPC Provider │
        │ (Alchemy/Lava)│
        └───────────────┘
                │
        ┌───────↓────────┐
        │  Blockchain    │
        │  (Sepolia/ETH) │
        │                │
        │  ┌──────────┐  │
        │  │ Contracts│  │
        │  │ (Solidity)   │
        │  └──────────┘  │
        └────────────────┘
        
        ┌──────────────┐
        │ The Graph    │
        │ (Subgraph)   │
        └──────────────┘
```

---

## 2. Technology Stack

### Smart Contracts (Backend)

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Foundry | Latest | Testing, deployment, verification |
| **Language** | Solidity | ^0.8.20 | Smart contract development |
| **Standards** | OpenZeppelin | ^5.0 | ERC20, ERC721, AccessControl |
| **Math** | solmate | Latest | Optimized math libraries |
| **Indexing** | The Graph | Latest | Event indexing + querying |

### Frontend (UI)

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js | ^14.0 | React SSR + routing |
| **Language** | TypeScript | ^5.0 | Type-safe frontend |
| **Styling** | Tailwind CSS | ^3.0 | Utility-first CSS |
| **Web3 Lib** | wagmi | ^2.0 | React hooks for Ethereum |
| **Signing** | viem | ^2.0 | Lightweight Ethereum utils |
| **Wallet** | Privy / Rainbow Kit | Latest | Multi-wallet support |
| **State** | Zustand | ^4.0 | Global state management |
| **Data Fetch** | TanStack Query | ^5.0 | Server state management |
| **Components** | Headless UI | Latest | Accessible primitives |
| **Icons** | Lucide React | Latest | Clean SVG icons |
| **Notifications** | Sonner | Latest | Toast notifications |

### Infrastructure

| Service | Provider | Purpose |
|---------|----------|---------|
| **Hosting** | Vercel | Frontend deployment |
| **RPC** | Alchemy / Lava | Blockchain interaction |
| **Indexing** | The Graph / Subgraph | Event querying |
| **Domain** | Vercel/Netlify DNS | Custom domain |
| **Monitoring** | Sentry | Error tracking |
| **Analytics** | Vercel Analytics | Page performance |

### Development Tools

| Tool | Purpose |
|------|---------|
| Git | Version control |
| GitHub | Repository hosting |
| GitHub Actions | CI/CD automation |
| VS Code | IDE |
| Prettier | Code formatting |
| ESLint | Code linting |

---

## 3. Smart Contract Architecture

### Contract Hierarchy

```
┌─────────────────────────────────────┐
│         Base Contracts              │
│  (AccessControl, Upgradeable)       │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│      Core Contracts                 │
├─────────────────────────────────────┤
│  • Token.sol (ERC20)                │
│  • Pool.sol (AMM)                   │
│  • Lending.sol (Collateral)         │
│  • Staking.sol (Rewards)            │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│     Advanced Contracts              │
├─────────────────────────────────────┤
│  • FlashLoan.sol                    │
│  • MasterChef.sol (Farming)         │
│  • NFT.sol (ERC721)                 │
│  • Governance.sol (DAO)             │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│      Proxy Contracts                │
│  (UUPS Upgrade Pattern)             │
└─────────────────────────────────────┘
```

### Key Contract Interfaces

```solidity
// IPool.sol
interface IPool {
    function swap(address tokenIn, uint256 amountIn) external returns (uint256 amountOut);
    function addLiquidity(uint256 amount0, uint256 amount1) external returns (uint256 liquidity);
    function removeLiquidity(uint256 liquidity) external returns (uint256 amount0, uint256 amount1);
}

// ILending.sol
interface ILending {
    function deposit(address token, uint256 amount) external;
    function borrow(address token, uint256 amount) external;
    function repay(address token, uint256 amount) external;
}

// IStaking.sol
interface IStaking {
    function stake(uint256 amount) external;
    function unstake(uint256 amount) external;
    function claimRewards() external returns (uint256);
}
```

---

## 4. Frontend Architecture

### Directory Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js 14 app router
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page
│   │   ├── dashboard/
│   │   │   ├── swap/
│   │   │   ├── liquidity/
│   │   │   ├── lending/
│   │   │   ├── staking/
│   │   │   ├── farming/
│   │   │   ├── nfts/
│   │   │   └── governance/
│   │   └── layout.tsx            # Dashboard layout
│   ├── components/               # Reusable UI components
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── features/
│   │   │   ├── SwapCard.tsx
│   │   │   ├── PoolCard.tsx
│   │   │   ├── LendingCard.tsx
│   │   │   └── StakingCard.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       └── Toast.tsx
│   ├── hooks/                    # Custom React hooks
│   │   ├── useContract.ts        # Contract interactions
│   │   ├── useBalance.ts         # Balance fetching
│   │   ├── useSwap.ts            # Swap logic
│   │   ├── usePool.ts            # Liquidity logic
│   │   ├── useLending.ts         # Lending logic
│   │   └── useWeb3.ts            # Web3 utilities
│   ├── constants/                # Constants & ABIs
│   │   ├── addresses.ts          # Contract addresses
│   │   ├── abi.ts                # Contract ABIs (auto-imported from foundry)
│   │   └── config.ts             # App configuration
│   ├── context/                  # React Context
│   │   ├── Web3Context.tsx       # Wallet + provider state
│   │   └── AppContext.tsx        # App-wide state
│   ├── store/                    # Zustand stores
│   │   ├── uiStore.ts            # UI state
│   │   └── dataStore.ts          # Contract data cache
│   ├── utils/                    # Utility functions
│   │   ├── format.ts             # Number/address formatting
│   │   ├── contract.ts           # Contract helpers
│   │   └── errors.ts             # Error handling
│   ├── types/                    # TypeScript types
│   │   ├── contract.ts
│   │   ├── transaction.ts
│   │   └── index.ts
│   └── styles/
│       ├── globals.css           # Tailwind + custom CSS
│       └── themes.css            # Dark mode
├── public/
│   └── assets/                   # Images, logos
├── next.config.js
├── tsconfig.json
├── tailwind.config.js
└── package.json
```

### Component Example (Swap)

```typescript
// src/components/features/SwapCard.tsx
import { useState } from 'react';
import { useSwap } from '@/hooks/useSwap';
import { Button } from '@/components/ui/Button';

export function SwapCard() {
  const [tokenIn, setTokenIn] = useState('');
  const [tokenOut, setTokenOut] = useState('');
  const [amountIn, setAmountIn] = useState('');
  const { swap, isLoading, error } = useSwap();

  const handleSwap = async () => {
    await swap(tokenIn, tokenOut, amountIn);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Swap</h2>
      
      {/* Input Token */}
      <div className="mb-4">
        <label className="text-sm text-slate-400 mb-2 block">You sell</label>
        <input
          value={amountIn}
          onChange={(e) => setAmountIn(e.target.value)}
          placeholder="0.0"
          className="w-full bg-slate-800 rounded-lg px-4 py-3 text-white"
        />
      </div>

      {/* Output Token */}
      <div className="mb-6">
        <label className="text-sm text-slate-400 mb-2 block">You receive</label>
        <div className="w-full bg-slate-800 rounded-lg px-4 py-3 text-white">
          {/* Show estimated output */}
        </div>
      </div>

      {/* Gas + Slippage Info */}
      <div className="bg-slate-700 rounded-lg p-3 mb-6 text-sm text-slate-300">
        <div className="flex justify-between">
          <span>Gas Fee:</span>
          <span>~0.005 ETH</span>
        </div>
        <div className="flex justify-between">
          <span>Slippage:</span>
          <span>0.5%</span>
        </div>
      </div>

      <Button onClick={handleSwap} disabled={isLoading}>
        {isLoading ? 'Swapping...' : 'Swap'}
      </Button>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
```

### Hook Example (useSwap)

```typescript
// src/hooks/useSwap.ts
import { useState } from 'react';
import { useContractWrite } from 'wagmi';
import { POOL_ADDRESS, POOL_ABI } from '@/constants/abi';

export function useSwap() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const swap = async (tokenIn: string, tokenOut: string, amount: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Call contract
      // Handle response
      // Update state
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return { swap, isLoading, error };
}
```

---

## 5. Data Flow

### Swap Transaction Flow

```
User Input
    ↓
Validate Input (amount, tokens)
    ↓
Calculate Output (x*y=k formula)
    ↓
Fetch Gas Price (from RPC)
    ↓
Show Preview (slippage, gas cost)
    ↓
User Confirms
    ↓
Connect Wallet (if needed)
    ↓
Sign Transaction (wallet dialog)
    ↓
Send to Blockchain
    ↓
Wait for Confirmation (block inclusion)
    ↓
Update Balance (from blockchain)
    ↓
Show Success (transaction hash + link to Etherscan)
```

### State Management Pattern

```typescript
// Zustand store pattern
import create from 'zustand';

interface SwapState {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  setTokenIn: (token: string) => void;
  setTokenOut: (token: string) => void;
  setAmountIn: (amount: string) => void;
  // ... more actions
}

export const useSwapStore = create<SwapState>((set) => ({
  tokenIn: '',
  tokenOut: '',
  amountIn: '',
  amountOut: '',
  setTokenIn: (token) => set({ tokenIn: token }),
  // ...
}));
```

---

## 6. Testing Strategy

### Smart Contract Testing (Foundry)

```makefile
# contracts/Makefile
.PHONY: test test-gas test-coverage

test:
	forge test -vvv

test-gas:
	forge test --gas-report

test-coverage:
	forge coverage

test-fuzz:
	forge test --fuzz-runs 10000
```

### Test Coverage Goals

| Component | Target Coverage |
|-----------|-----------------|
| Token.sol | 95%+ |
| Pool.sol | 90%+ |
| Lending.sol | 95%+ |
| Staking.sol | 90%+ |
| Overall | 90%+ |

### Test Structure

```
contracts/test/
├── core/
│   ├── Token.t.sol           # ERC20 tests
│   ├── Pool.t.sol            # AMM tests
│   ├── Lending.t.sol         # Collateral tests
│   └── Staking.t.sol         # Reward tests
├── advanced/
│   ├── FlashLoan.t.sol       # Flash loan tests
│   ├── MasterChef.t.sol      # Farming tests
│   └── Governance.t.sol      # DAO tests
├── integration/
│   ├── SwapAndStake.t.sol    # Multi-contract scenarios
│   └── BorrowAndFarm.t.sol   # Complex flows
└── fuzz/
    ├── Pool.fuzz.t.sol       # Property-based testing
    └── Lending.fuzz.t.sol
```

### Frontend Testing

```bash
npm run test              # Jest + React Testing Library
npm run test:coverage    # Coverage report
npm run type-check       # TypeScript check
npm run lint             # ESLint + Prettier
```

---

## 7. Security Requirements

### Smart Contract Security Checklist

- [ ] No reentrancy vulnerabilities (use checks-effects-interactions pattern)
- [ ] No integer overflow/underflow (use SafeMath or ^0.8.0)
- [ ] Proper access control (onlyOwner, role-based)
- [ ] No flash loan attacks (check balance at end, not start)
- [ ] No front-running vectors (use commit-reveal if needed)
- [ ] Input validation (check amounts > 0, addresses != 0)
- [ ] Event emissions for audit trail
- [ ] No hardcoded addresses (use constructor/initialization)

### Static Analysis

```bash
# Run Slither (static analysis)
slither contracts/src/

# Run Mythril (if available)
mythril analyze contracts/src/Token.sol
```

### Audit Checklist

```markdown
## Pre-Audit Checklist
- [ ] 95%+ test coverage
- [ ] All functions documented
- [ ] Gas optimization passed
- [ ] Slither warnings < 5
- [ ] No hardcoded values
- [ ] Access control verified
- [ ] Events logged properly
- [ ] Interfaces in separate files
```

---


**→ See `05_DEPLOYMENT.md` for the complete step-by-step deployment guide.**

Covers: Foundry → Sepolia deployment, contract verification, ABI extraction, Vercel setup, GitHub Actions CI/CD, environment variables, and production checklist.

## 9. Performance & Scalability

### Gas Optimization Targets

| Operation | Current | Target |
|-----------|---------|--------|
| Swap | 200k gas | <150k gas |
| Add Liquidity | 180k gas | <130k gas |
| Borrow | 220k gas | <160k gas |
| Claim Rewards | 150k gas | <100k gas |

### Frontend Performance

- [ ] Code splitting (lazy load pages)
- [ ] Image optimization (next/image)
- [ ] CSS-in-JS optimization (Tailwind purge)
- [ ] Bundle size < 200kb (gzipped)
- [ ] LCP < 2.5s
- [ ] CLS < 0.1

---

## 10. API Documentation

### Contract ABI Export

```typescript
// src/constants/abi.ts
export const TOKEN_ABI = require('@/contracts/out/Token.sol/Token.json').abi;
export const POOL_ABI = require('@/contracts/out/Pool.sol/Pool.json').abi;
export const LENDING_ABI = require('@/contracts/out/Lending.sol/Lending.json').abi;

export const CONTRACT_ADDRESSES = {
  token: process.env.NEXT_PUBLIC_TOKEN_ADDRESS!,
  pool: process.env.NEXT_PUBLIC_POOL_ADDRESS!,
  lending: process.env.NEXT_PUBLIC_LENDING_ADDRESS!,
} as const;
```

### Subgraph Queries

```graphql
# Fetch user swaps
query GetUserSwaps($userAddress: String!) {
  swaps(where: { user: $userAddress }, orderBy: timestamp, orderDirection: desc) {
    id
    tokenIn
    tokenOut
    amountIn
    amountOut
    timestamp
  }
}

# Fetch pool data
query GetPoolInfo($poolAddress: String!) {
  pool(id: $poolAddress) {
    reserve0
    reserve1
    totalSupply
  }
}
```

---

## 11. Known Limitations (MVP)

- ❌ Only Sepolia testnet (no mainnet yet)
- ❌ Single chain (no cross-chain bridges)
- ❌ No slippage protection middleware
- ❌ No transaction batching
- ❌ Manual gas price setting only
- ❌ No advanced charting

---

## Appendix: Key Formulas

### Constant Product Formula (Uniswap v2)
```
x * y = k
amountOut = (amountIn * 997 / 1000) * reserveOut / (reserveIn + (amountIn * 997 / 1000))
```

### Collateralization Ratio
```
healthFactor = (collateralValue * 0.8) / borrowedValue
if healthFactor < 1.0: LIQUIDATE
```

### APY Calculation
```
APY = (rewardPerBlock * blocksPerYear / totalStaked) * 100
```

---

**Next Steps:** Implement Phase 1 following this TRD. First commit: ERC20 Token + tests by end of week 1.
