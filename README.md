# Bulldex Finance

**Trade Like a Bull. Earn Like a Beast.**

Bulldex Finance is a decentralized trading protocol combining token swaps, liquidity provision, lending, staking, yield farming, NFT collateral, and governance—all in one powerful DeFi platform.

[![Smart Contract Tests](https://github.com/YOUR_USERNAME/bulldex-finance/actions/workflows/contracts-test.yml/badge.svg)](https://github.com/YOUR_USERNAME/bulldex-finance/actions/workflows/contracts-test.yml)
[![Frontend Tests](https://github.com/YOUR_USERNAME/bulldex-finance/actions/workflows/frontend-test.yml/badge.svg)](https://github.com/YOUR_USERNAME/bulldex-finance/actions/workflows/frontend-test.yml)

---

## Status: Week 1 Complete ✅

**Live:** https://bulldex-finance.vercel.app  
**Contracts:** Sepolia Testnet  
**Explorer:** https://sepolia.etherscan.io

### Week 1 Deliverables

| Item | Status |
|------|--------|
| BDX Token (ERC20) | ✅ Deployed to Sepolia |
| Token verified on Etherscan | ✅ |
| 30+ unit tests | ✅ Passing |
| Next.js 14 frontend | ✅ Live on Vercel |
| Wallet connect (RainbowKit) | ✅ |
| BDX balance display | ✅ |
| GitHub Actions CI/CD | ✅ Auto-deploys on push |

---

## Quick Start

### Prerequisites
- Node.js v20+
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Git
- MetaMask wallet

### Setup

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/bulldex-finance.git
cd bulldex-finance

# Smart contracts
cd contracts
cp .env.example .env       # Fill in your keys
forge install              # Install OZ + forge-std
forge build                # Compile
forge test                 # Run 30+ tests

# Frontend
cd ../frontend
npm install
cp .env.local.example .env.local   # Fill in contract address
npm run dev                        # http://localhost:3000
```

---

## Project Structure

```
bulldex-finance/
├── contracts/                    # Foundry — Solidity
│   ├── src/
│   │   └── Token.sol            # ✅ BDX ERC20 token
│   ├── test/
│   │   └── core/Token.t.sol     # ✅ 30+ unit tests
│   ├── script/
│   │   └── Deploy.s.sol         # ✅ Deployment script
│   ├── foundry.toml
│   ├── Makefile
│   └── .env.example
│
├── frontend/                     # Next.js 14 + React
│   └── src/
│       ├── app/                  # App router pages
│       │   ├── layout.tsx        # Root layout + providers
│       │   ├── page.tsx          # Landing hero
│       │   └── dashboard/        # Dashboard + feature pages
│       ├── components/
│       │   ├── ui/               # Button, Card, Input, Badge, Skeleton
│       │   ├── layout/           # Header, Sidebar
│       │   ├── features/         # BalanceDisplay
│       │   └── icons/            # BullIcon
│       ├── hooks/                # useTokenBalance, useTokenInfo
│       ├── constants/            # ABI, contract addresses
│       ├── providers/            # Web3Provider (wagmi + RainbowKit)
│       ├── config/               # wagmi config (Sepolia)
│       └── utils/                # cn(), formatToken(), shortenAddress()
│
├── .github/
│   └── workflows/
│       ├── contracts-test.yml    # forge test on push
│       ├── frontend-test.yml     # type-check + lint + build
│       └── deploy.yml            # auto-deploy to Vercel on main push
│
├── PRD.md                        # Product Requirements
├── TRD.md                        # Technical Requirements
├── DEPLOYMENT.md                 # Step-by-step deployment guide
└── BRAND.md                      # Design system & brand guidelines
```

---

## 16-Week Roadmap

### Phase 1 — Core DeFi (Weeks 1–4)
- ✅ **Week 1:** BDX Token + frontend scaffold + Vercel deploy
- 🔄 **Week 2:** Pool.sol (AMM x\*y=k) + Swap UI
- 🔄 **Week 3:** Liquidity provision + LP tokens
- 🔄 **Week 4:** Transaction history + portfolio dashboard

### Phase 2 — Lending & Yield (Weeks 5–8)
- 🔲 Lending.sol (collateralized borrowing, health factor)
- 🔲 Staking.sol (BDX staking rewards)
- 🔲 MasterChef.sol (yield farming)
- 🔲 NFT.sol (ERC721 collateral)

### Phase 3 — Advanced (Weeks 9–12)
- 🔲 FlashLoan.sol
- 🔲 Governance.sol (BDX DAO)
- 🔲 Gas analytics dashboard
- 🔲 Security audit prep

### Phase 4 — Production (Weeks 13–16)
- 🔲 Transaction history + CSV export
- 🔲 Portfolio analytics (P&L)
- 🔲 Sentry error monitoring
- 🔲 Final audit + mainnet readiness

---

## Smart Contracts

### Deploy to Sepolia

```bash
cd contracts
cp .env.example .env
# Fill in SEPOLIA_RPC_URL, PRIVATE_KEY, ETHERSCAN_KEY

make deploy-sepolia
# Output: BDX Token deployed at 0x...

# Then update frontend/.env.local:
# NEXT_PUBLIC_TOKEN_ADDRESS=0x...
```

### Run Tests

```bash
cd contracts

make test          # forge test -vvv
make test-gas      # gas report
make coverage      # coverage summary
make test-fuzz     # 10k fuzz runs (CI profile)
```

### Contract Addresses (Sepolia)

| Contract | Address |
|----------|---------|
| BDX Token | `0x` — deploy and update here |

---

## Frontend

### Development

```bash
cd frontend
npm install
cp .env.local.example .env.local   # Add your keys
npm run dev                         # http://localhost:3000
```

### Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run type-check   # TypeScript check
npm run lint         # ESLint
npm run format       # Prettier format
```

### Environment Variables

```bash
# frontend/.env.local
NEXT_PUBLIC_SEPOLIA_RPC=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_TOKEN_ADDRESS=0x...   # From deploy output
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...   # cloud.walletconnect.com
```

---

## Design System

### Brand Colors
```
Primary Purple:  #7C3AED   (buttons, links, active states)
Accent Amber:    #F59E0B   (bull strength, highlights)
Dark Background: #0F172A   (page background)
Card Surface:    #1E293B   (cards, elevated surfaces)
Success Green:   #10B981
Error Red:       #EF4444
```

Full guidelines: see `BRAND.md`

### Tech Stack

| Layer | Tech |
|-------|------|
| Smart Contracts | Solidity 0.8.24, Foundry, OpenZeppelin 5 |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Web3 | wagmi v2, viem v2, RainbowKit v2 |
| State | Zustand, TanStack Query |
| Deployment | Vercel (frontend), Sepolia (contracts) |
| CI/CD | GitHub Actions |

---

## CI/CD

Every push triggers:

| Trigger | Action |
|---------|--------|
| Push to `contracts/**` | `forge test` + lint check |
| Push to `frontend/**` | type-check + lint + build |
| Push to `main` (frontend) | Auto-deploy to Vercel |

**Setup required secrets in GitHub → Settings → Secrets:**
- `VERCEL_TOKEN` — from Vercel dashboard
- `VERCEL_ORG_ID` — from Vercel Settings
- `VERCEL_PROJECT_ID` — from project Settings

---

## Get Test ETH

- https://sepoliafaucet.com/
- https://faucet.paradigm.xyz/

---

## Documentation

| File | Purpose |
|------|---------|
| `PRD.md` | Product vision, features, user stories |
| `TRD.md` | Technical stack, architecture, data flows |
| `DEPLOYMENT.md` | Step-by-step setup guide |
| `BRAND.md` | Color palette, typography, component specs |

---

## Security

- ✅ No private keys committed (`.env` in `.gitignore`)
- ✅ OpenZeppelin contracts for battle-tested standards
- ✅ Custom errors (gas-efficient)
- ✅ Supply cap enforced on every mint
- 🔲 External audit — before mainnet

---

## Contributing

1. Fork + create feature branch
2. `make test` — all tests must pass
3. `npm run type-check && npm run lint` — no errors
4. Push + open PR — CI auto-runs

---

## License

MIT — fork and build freely.

---

**Built by:** Phantom ([@wayphantomme](https://twitter.com/wayphantomme))  
**Last Updated:** 2026-08-24  
**Status:** 🚀 Week 1 Complete

**Trade Like a Bull. Earn Like a Beast. 💪📈**
