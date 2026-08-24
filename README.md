# Bulldex Finance

**Trade Like a Bull. Earn Like a Beast.**

[![Smart Contract Tests](https://github.com/wayphantomme/bulldex-finance/actions/workflows/contracts-test.yml/badge.svg)](https://github.com/wayphantomme/bulldex-finance/actions/workflows/contracts-test.yml)
[![Frontend Tests](https://github.com/wayphantomme/bulldex-finance/actions/workflows/frontend-test.yml/badge.svg)](https://github.com/wayphantomme/bulldex-finance/actions/workflows/frontend-test.yml)

A full-stack DeFi protocol built in public — AMM swaps, liquidity provision, lending, staking, yield farming, and governance on Ethereum.

- **App:** https://bulldex-finance.vercel.app
- **Docs:** https://bulldex-finance.vercel.app/docs
- **X:** [@wayphantomme](https://x.com/wayphantomme)
- **GitHub:** [wayphantomme/bulldex-finance](https://github.com/wayphantomme/bulldex-finance)

---

## Status

| Week | Deliverable | Status |
|------|-------------|--------|
| 1-2 | BDX Token + AMM Swap + Pool | ✅ Live |
| 3-4 | Liquidity UI + LP analytics | 🔄 Active |
| 5-6 | Lending & Borrowing | ⬜ |
| 7-8 | Staking & Farming | ⬜ |
| 9-10 | Vesting | ⬜ |
| 11-12 | Flash Loans + Governance DAO | ⬜ |
| 13-14 | Gas Optimization | ⬜ |
| 15-16 | Security Audit Prep + Mainnet | ⬜ |

---

## Token Economics (BDX)

| Parameter | Value |
|-----------|-------|
| Max Supply | 1,000,000,000 BDX |
| Circulating Supply | 100,000,000 BDX (10%) |
| Seed Price | $0.05 per BDX |
| Seed Allocation | 20,000,000 BDX (2% supply) |
| Seed Raise Target | $1,000,000 |
| Fully Diluted Valuation | $50,000,000 |
| Token Standard | ERC-20 + EIP-2612 Permit |

### Distribution

| Allocation | % | Amount | Vesting |
|------------|---|--------|---------|
| Community | 40% | 400M BDX | Farming + staking rewards |
| Treasury | 25% | 250M BDX | DAO-governed release |
| Team | 15% | 150M BDX | 12-month cliff, 36-month linear |
| Ecosystem | 16% | 160M BDX | 3-month cliff, 24-month linear |
| Seed Round | 4% | 40M BDX | 6-month cliff, 18-month linear |

---

## Deployed Contracts (Sepolia)

| Contract | Address |
|----------|---------|
| BDX Token | [`0x193d18048b343983971bfc50893a720e97322ae5`](https://sepolia.etherscan.io/address/0x193d18048b343983971bfc50893a720e97322ae5) |
| MockToken (MUSDC) | [`0x91a39c49defe004dd8627223b752212ba944ceb1`](https://sepolia.etherscan.io/address/0x91a39c49defe004dd8627223b752212ba944ceb1) |
| PoolFactory | [`0x90e1189242272ad1700a5ad0e1c5001676a23984`](https://sepolia.etherscan.io/address/0x90e1189242272ad1700a5ad0e1c5001676a23984) |
| BDX/MUSDC Pool | [`0xfac1b95480e87ccef0e995612ceca23f3ddb0197`](https://sepolia.etherscan.io/address/0xfac1b95480e87ccef0e995612ceca23f3ddb0197) |

Initial pool seeded: **10M BDX + 20M MUSDC** (price: 1 BDX = 2 MUSDC)

---

## Tests

```
73 tests passing (0 failing)

Token.t.sol (33 tests) - deployment, mint, burn, transfer, approve, fuzz
Pool.t.sol  (40 tests) - factory, addLiquidity, removeLiquidity, swap,
                         getAmountOut/In, pricing, k-invariant, fuzz
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Solidity 0.8.24, Foundry, OpenZeppelin v5.1 |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Web3 | wagmi v2, viem v2, RainbowKit v2 |
| Network | Sepolia Testnet (Alchemy RPC) |
| Hosting | Vercel |
| CI/CD | GitHub Actions |

---

## Project Structure

```
bulldex-finance/
├── contracts/
│   ├── src/
│   │   ├── Token.sol          # BDX ERC-20 (mint, burn, permit, cap)
│   │   ├── Pool.sol           # AMM x*y=k (swap, LP, 0.3% fee)
│   │   ├── PoolFactory.sol    # Deploy + track pools
│   │   └── MockToken.sol      # Open-mint ERC-20 for testnet
│   ├── test/core/
│   │   ├── Token.t.sol        # 33 tests
│   │   └── Pool.t.sol         # 40 tests
│   └── script/Deploy.s.sol    # Full deployment script
│
├── frontend/src/
│   ├── app/
│   │   ├── page.tsx           # Landing page (bento grid, VC-focused)
│   │   ├── dashboard/         # Swap (live), Liquidity, Lending, Staking, Farming
│   │   └── docs/              # Technical docs + dev log
│   ├── hooks/
│   │   ├── usePool.ts         # Reserves, prices, quotes (multicall)
│   │   └── useSwap.ts         # Approve + swap state machine
│   └── constants/
│       ├── abis.ts            # TOKEN_ABI, POOL_ABI, FACTORY_ABI
│       └── contracts.ts       # Addresses, TOKENS registry
│
└── skills/
    ├── WEB3_DEV_ROADMAP.md    # 16-phase Web3 dev learning roadmap
    └── DEFI_TOKENOMICS.md     # DeFi economics + revenue model guide
```

---

## Quick Start

```bash
# Contracts
cd contracts && forge install && make test

# Frontend
cd frontend && npm install && cp .env.local.example .env.local && npm run dev

# Deploy
cd contracts && make deploy-sepolia
```

---

## Environment Variables

```bash
# contracts/.env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
ETHERSCAN_KEY=YOUR_ETHERSCAN_KEY

# frontend/.env.local
NEXT_PUBLIC_SEPOLIA_RPC=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_WC_PROJECT_ID
NEXT_PUBLIC_TOKEN_ADDRESS=0x193d18048b343983971bfc50893a720e97322ae5
NEXT_PUBLIC_MUSDC_ADDRESS=0x91a39c49defe004dd8627223b752212ba944ceb1
NEXT_PUBLIC_FACTORY_ADDRESS=0x90e1189242272ad1700a5ad0e1c5001676a23984
NEXT_PUBLIC_POOL_BDX_MUSDC=0xfac1b95480e87ccef0e995612ceca23f3ddb0197
```

---

## License

MIT — **Built by [@wayphantomme](https://x.com/wayphantomme)**
