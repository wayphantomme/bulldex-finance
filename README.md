# Bulldex Finance

**Trade Like a Bull. Earn Like a Beast.**

[![Smart Contract Tests](https://github.com/wayphantomme/bulldex-finance/actions/workflows/contracts-test.yml/badge.svg)](https://github.com/wayphantomme/bulldex-finance/actions/workflows/contracts-test.yml)
[![Frontend Tests](https://github.com/wayphantomme/bulldex-finance/actions/workflows/frontend-test.yml/badge.svg)](https://github.com/wayphantomme/bulldex-finance/actions/workflows/frontend-test.yml)

A full-stack DeFi protocol being built in public - combining token swaps, liquidity provision, lending, staking, yield farming, and governance on Ethereum.

- **Frontend:** https://bulldex-finance.vercel.app
- **Docs:** https://bulldex-finance.vercel.app/docs
- **Contract (Sepolia):** [0x392d29D689a5ecfe08bD12482570Ac82Ad3567C9](https://sepolia.etherscan.io/address/0x392d29D689a5ecfe08bD12482570Ac82Ad3567C9)
- **Twitter:** [@wayphantomme](https://twitter.com/wayphantomme)

---

## Status

| Week | Deliverable | Status |
|------|-------------|--------|
| 1 | BDX ERC20 Token + Frontend scaffold | ✅ Live |
| 2 | Pool.sol AMM + Swap UI | ✅ Live |
| 3–4 | Liquidity provision + LP tokens | 🔄 In progress |
| 5–6 | Lending & Borrowing | ⬜ |
| 7–8 | Staking & Farming | ⬜ |
| 9–10 | Vesting | ⬜ |
| 11–12 | Flash Loans + Governance DAO | ⬜ |
| 13–14 | Gas Optimization | ⬜ |
| 15–16 | Security Audit Prep + Production | ⬜ |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Solidity 0.8.24, Foundry, OpenZeppelin 5.1 |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Web3 | wagmi v2, viem v2, RainbowKit v2 |
| State | Zustand, TanStack Query |
| Network | Sepolia Testnet (Alchemy RPC) |
| Deployment | Vercel (frontend), Sepolia (contracts) |
| CI/CD | GitHub Actions |

---

## Project Structure

```
bulldex-finance/
├── contracts/                    # Foundry - Solidity
│   ├── src/
│   │   └── Token.sol            # BDX ERC20 (mint, burn, permit, supply cap)
│   ├── test/
│   │   └── core/Token.t.sol     # 33 unit tests + fuzz tests
│   ├── script/
│   │   └── Deploy.s.sol         # Deployment script
│   ├── foundry.toml             # Solc 0.8.24, optimizer 200 runs
│   └── Makefile                 # build / test / deploy shortcuts
│
├── frontend/                     # Next.js 14
│   └── src/
│       ├── app/                  # App router
│       │   ├── page.tsx          # Landing page
│       │   ├── layout.tsx        # Root layout + Web3Provider
│       │   └── dashboard/        # Overview, Swap, Liquidity, Lending,
│       │                         # Staking, Farming, Governance
│       ├── components/
│       │   ├── ui/               # Button, Card, Input, Badge, Skeleton
│       │   ├── layout/           # Header, Sidebar (icon-only)
│       │   ├── features/         # BalanceDisplay
│       │   └── icons/            # BullIcon
│       ├── hooks/                # useTokenBalance, useTokenInfo
│       ├── constants/            # TOKEN_ABI, contract addresses
│       ├── config/               # wagmi (Alchemy transport)
│       ├── providers/            # Web3Provider (wagmi + RainbowKit)
│       └── utils/                # cn(), formatToken(), shortenAddress()
│
├── skills/
│   └── WEB3_DEV_ROADMAP.md      # 16-phase Web3 dev learning roadmap
│
└── .github/
    └── workflows/
        ├── contracts-test.yml    # forge test + coverage on push
        ├── frontend-test.yml     # type-check + lint + build
        └── deploy.yml            # auto-deploy to Vercel
```

---

## Quick Start

### Prerequisites

- Node.js v20+
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Git

### Smart Contracts

```bash
cd contracts

# Install dependencies (first time)
forge install

# Build
forge build

# Run all tests (33 tests)
make test

# Gas report
make test-gas

# Coverage
make coverage
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy env template
cp .env.local.example .env.local
# Fill in: NEXT_PUBLIC_SEPOLIA_RPC, NEXT_PUBLIC_TOKEN_ADDRESS, NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

# Run dev server
npm run dev
# → http://localhost:3000

# Type check
npm run type-check

# Lint
npm run lint
```

### Deploy Contracts

```bash
cd contracts

# Copy env template and fill in keys
cp .env.example .env

# Deploy to Sepolia
make deploy-sepolia
# → Outputs: contract address to paste into frontend/.env.local
```

---

## Smart Contracts

### BDX Token - `contracts/src/Token.sol`

| Feature | Details |
|---------|---------|
| Standard | ERC20 + ERC20Burnable + ERC20Permit (EIP-2612) |
| Access | Ownable (owner-only mint) |
| Supply | 1,000,000,000 BDX max supply |
| Initial mint | 100,000,000 BDX to deployer |
| Errors | Custom errors: `ExceedsMaxSupply`, `MintToZeroAddress`, `MintAmountZero` |
| Network | Sepolia Testnet |
| Address | `0x392d29D689a5ecfe08bD12482570Ac82Ad3567C9` |
| Verified | ✅ [View on Etherscan](https://sepolia.etherscan.io/address/0x392d29D689a5ecfe08bD12482570Ac82Ad3567C9#code) |

### Test Coverage

```
33 tests passing (0 failing)
  ✓ Deployment (name, symbol, decimals, supply, owner)
  ✓ balanceOf
  ✓ transfer + events
  ✓ transferFrom + allowance
  ✓ mint (owner only, zero address, zero amount, supply cap)
  ✓ burn + burnFrom
  ✓ approve
  ✓ Constructor edge cases
  ✓ Fuzz: transfer, mint, burn
```

---

## Environment Variables

### `contracts/.env`

```bash
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
ETHERSCAN_KEY=YOUR_ETHERSCAN_KEY
```

### `frontend/.env.local`

```bash
NEXT_PUBLIC_SEPOLIA_RPC=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_TOKEN_ADDRESS=0x392d29D689a5ecfe08bD12482570Ac82Ad3567C9
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_WC_PROJECT_ID
```

> ⚠️ Never commit `.env` files. Both are in `.gitignore`.

---

## CI/CD

Every push to `main` triggers:

| Workflow | Trigger | What it does |
|----------|---------|-------------|
| `contracts-test.yml` | push | `forge build` + `forge test` + gas report + coverage |
| `frontend-test.yml` | push | type-check + lint + `next build` |
| `deploy.yml` | push to main | Auto-deploy to Vercel (requires secrets) |

### Setup Vercel auto-deploy

Add these secrets to GitHub repo → Settings → Secrets:

```
VERCEL_TOKEN       → vercel.com/account/tokens
VERCEL_ORG_ID      → vercel project settings
VERCEL_PROJECT_ID  → vercel project settings
```

---

## Design

Inspired by [Jupiter](https://jup.ag) - minimal dark interface with the Bulldex bull mascot color palette.

| Token | Hex | Usage |
|-------|-----|-------|
| Brand Green | `#4ADE80` | Primary accent, buttons, active states |
| Forest | `#2D4A2D` | From logo - dark surfaces |
| Cream | `#E8DFC0` | From logo horns - secondary accents |
| Page BG | `#0C0F0C` | Near-black with green tint |
| Card | `#161C16` | Dark green-tinted cards |

---

## Resources

| Document | Purpose |
|----------|---------|
| `skills/WEB3_DEV_ROADMAP.md` | 16-phase Web3 dev learning roadmap (ERC20 → Gas optimization → Security → Cross-chain) |
| `DEPLOYMENT.md` | Step-by-step deployment guide |
| `PRD.md` | Product requirements |
| `TRD.md` | Technical requirements |
| `BRAND.md` | Design system |

---

## Get Test ETH

- https://sepoliafaucet.com
- https://faucets.chain.link/sepolia

---

## License

MIT

---

**Built by [@wayphantomme](https://twitter.com/wayphantomme) - building in public**
