# Bulldex Finance

**Trade Like a Bull. Earn Like a Beast.**

[![Smart Contract Tests](https://github.com/wayphantomme/bulldex-finance/actions/workflows/contracts-test.yml/badge.svg)](https://github.com/wayphantomme/bulldex-finance/actions/workflows/contracts-test.yml)
[![Frontend Tests](https://github.com/wayphantomme/bulldex-finance/actions/workflows/frontend-test.yml/badge.svg)](https://github.com/wayphantomme/bulldex-finance/actions/workflows/frontend-test.yml)

A full-stack DeFi protocol built in public — AMM swaps, liquidity provision, lending, staking, yield farming, vesting, and on-chain DAO governance on Ethereum.

- **App:** https://bulldex-finance.vercel.app
- **Docs:** https://bulldex-finance.vercel.app/docs
- **X:** [@wayphantomme](https://x.com/wayphantomme)
- **GitHub:** [wayphantomme/bulldex-finance](https://github.com/wayphantomme/bulldex-finance)

---

## Status

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 1–2 | BDX Token + AMM Swap + Pool Factory | ✅ Live |
| 3–4 | Liquidity UI + BDX/WETH pool + Faucet + Design system | ✅ Live |
| 5–6 | Lending & Borrowing (BDX → MUSDC) | ✅ Live |
| 7–8 | Staking (lock tiers) + Yield Farming (MasterChef) | ✅ Live |
| 9–10 | Token Vesting (cliff + linear schedules) | ✅ Live |
| 11–12 | DAO Governance (BDXGovernor + Timelock) | 🔄 In Progress |
| 13–14 | Gas Optimization + Router contract | ⬜ Planned |
| 15–16 | Security Audit Prep + Mainnet | ⬜ Planned |

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
| Token Standard | ERC-20 + EIP-2612 Permit + ERC20Votes |

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
| WETH | [`0xEbFe8d5E0b674925599af1E970975Ae4fd2A4b62`](https://sepolia.etherscan.io/address/0xEbFe8d5E0b674925599af1E970975Ae4fd2A4b62) |
| PoolFactory | [`0x90e1189242272ad1700a5ad0e1c5001676a23984`](https://sepolia.etherscan.io/address/0x90e1189242272ad1700a5ad0e1c5001676a23984) |
| BDX/MUSDC Pool | [`0xfac1b95480e87ccef0e995612ceca23f3ddb0197`](https://sepolia.etherscan.io/address/0xfac1b95480e87ccef0e995612ceca23f3ddb0197) |
| BDX/WETH Pool | [`0x3cA1cE14fd2fE5A449F67CFA63F342acfB8860e4`](https://sepolia.etherscan.io/address/0x3cA1cE14fd2fE5A449F67CFA63F342acfB8860e4) |
| Lending | [`0x13aCAB0d760E54Fb9Ab73ff0bF39CAc7D74FD5cF`](https://sepolia.etherscan.io/address/0x13aCAB0d760E54Fb9Ab73ff0bF39CAc7D74FD5cF) |
| Staking | [`0x9215e48EEEE58a44805518A8aFBAD26A56749716`](https://sepolia.etherscan.io/address/0x9215e48EEEE58a44805518A8aFBAD26A56749716) |
| MasterChef (Farming) | [`0xC12EDE9e4d564f5941201b0A90313832745981cC`](https://sepolia.etherscan.io/address/0xC12EDE9e4d564f5941201b0A90313832745981cC) |
| TokenVesting | [`0x81Ef8b50180f8d06EC9F9B5B1f12d814b11DEe33`](https://sepolia.etherscan.io/address/0x81Ef8b50180f8d06EC9F9B5B1f12d814b11DEe33) |
| BDXGovernor | — pending deployment |
| TimelockController | — pending deployment |

**Initial liquidity:**
- BDX/MUSDC: 10M BDX + 20M MUSDC (1 BDX = 2 MUSDC)
- BDX/WETH: 1M BDX + 0.1 WETH (1 WETH = 10,000,000 BDX)

> **Why custom WETH?** We deploy our own WETH9-identical contract for full testnet control. For production, swap `NEXT_PUBLIC_WETH_ADDRESS` to the canonical Sepolia WETH (`0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14`) without changing any pool logic.

---

## Features

### AMM Swap
Uniswap v2-style constant product (`x * y = k`) AMM with 0.3% fee. Supports BDX/MUSDC and BDX/WETH pairs with multi-hop routing.

### Liquidity Provision
Add/remove liquidity to any pool and earn LP tokens representing your share. First depositor sets the price.

### Lending & Borrowing
Over-collateralized lending — deposit BDX, borrow MUSDC. LTV 75%, liquidation threshold 80%, liquidation bonus 5%, ~5% APR.

### Staking
Stake BDX to earn protocol rewards. Optional lock periods (30 / 90 / 180 days) give 1.2× / 1.5× / 2.0× reward multipliers via the Synthetix rewardPerToken accumulator pattern.

### Yield Farming
Deposit LP tokens into MasterChef pools to earn BDX emissions. Standard MasterChef v1 pattern with configurable `bdxPerBlock` and per-pool `allocPoint` weights.

### Token Vesting
Cliff + linear vesting schedules for team, ecosystem, and seed allocations. Owner-created schedules, beneficiary-triggered release, and revocable before cliff.

### DAO Governance (Phase 3)
On-chain governance via OpenZeppelin Governor suite. BDX holders propose, vote, and execute protocol changes through a 2-day timelock.

| Parameter | Value |
|-----------|-------|
| Proposal threshold | 10,000 BDX |
| Voting delay | ~1 day (7,200 blocks) |
| Voting period | ~1 week (50,400 blocks) |
| Quorum | 4% of total supply |
| Timelock delay | 2 days |

Voting power requires **delegation** — holders must call `bdxToken.delegate(address)` to activate votes.

---

## Tests

```
73 tests passing (0 failing)

Token.t.sol (33 tests) — deployment, mint, burn, transfer, permit, fuzz
Pool.t.sol  (40 tests) — factory, addLiquidity, removeLiquidity, swap,
                          getAmountOut/In, pricing, k-invariant, fuzz
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Solidity 0.8.24, Foundry, OpenZeppelin v5.1 |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Web3 | wagmi v2, viem v2, RainbowKit v2 |
| Network | Ethereum Sepolia Testnet (Alchemy RPC) |
| Analytics | The Graph Studio (subgraph) |
| Hosting | Vercel |
| CI/CD | GitHub Actions |

---

## Project Structure

```
bulldex-finance/
├── contracts/
│   ├── src/
│   │   ├── Token.sol           # BDX ERC-20 + ERC20Votes (governance)
│   │   ├── Pool.sol            # AMM x*y=k, 0.3% fee, LP token
│   │   ├── PoolFactory.sol     # Permissionless pool deployment
│   │   ├── Lending.sol         # Over-collateralized BDX → MUSDC lending
│   │   ├── Staking.sol         # BDX staking with lock-tier multipliers
│   │   ├── MasterChef.sol      # LP farming with bdxPerBlock rewards
│   │   ├── TokenVesting.sol    # Cliff + linear vesting schedules
│   │   ├── BDXGovernor.sol     # On-chain DAO governor (OZ Governor)
│   │   ├── WETH.sol            # Custom WETH9 for testnet
│   │   └── MockToken.sol       # Open-mint ERC-20 (MUSDC) for testnet
│   ├── test/
│   │   ├── Token.t.sol         # 33 tests
│   │   └── Pool.t.sol          # 40 tests
│   └── script/
│       ├── Deploy.s.sol        # Phase 1: Token + AMM + Pools
│       ├── DeployWETHPool.s.sol
│       ├── DeployLending.s.sol
│       ├── DeployStaking.s.sol
│       ├── DeployMasterChef.s.sol
│       ├── DeployVesting.s.sol
│       └── DeployGovernance.s.sol  # Phase 3: Token(v2) + Timelock + Governor
│
├── frontend/src/
│   ├── app/dashboard/
│   │   ├── swap/               # Multi-hop AMM swap
│   │   ├── liquidity/          # Add + remove liquidity
│   │   ├── lending/            # Borrow + repay + liquidate
│   │   ├── staking/            # Stake BDX + claim rewards
│   │   ├── farming/            # LP farming pools
│   │   ├── vesting/            # Vesting schedule + release
│   │   ├── governance/         # DAO proposals + voting (Phase 3)
│   │   ├── analytics/          # Protocol stats + leaderboard
│   │   └── faucet/             # Testnet token faucet
│   ├── hooks/
│   │   ├── useMultiSwap.ts     # Multi-pool swap routing
│   │   ├── useLending.ts       # Lending stats + position
│   │   ├── useStaking.ts       # Staking stats + user info
│   │   ├── useStakingActions.ts
│   │   ├── useFarming.ts       # Farming pool data
│   │   ├── useFarmingActions.ts
│   │   ├── useVesting.ts       # Vesting schedule
│   │   ├── useVestingActions.ts
│   │   ├── useGovernance.ts    # Proposals + voting power (Phase 3)
│   │   └── useGovernanceActions.ts
│   └── constants/
│       ├── abis.ts             # All contract ABIs
│       └── contracts.ts        # Addresses + contract configs
│
└── skills/                     # Protocol documentation + specs
    ├── 12_GOVERNANCE.md        # DAO governance spec
    └── ...
```

---

## Quick Start

```bash
# Contracts
cd contracts
forge install
make test

# Frontend
cd frontend
npm install
cp .env.local.example .env.local  # fill in your addresses
npm run dev

# Deploy governance (Phase 3)
cd contracts
forge script script/DeployGovernance.s.sol \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast --verify -vvvv
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
NEXT_PUBLIC_TOKEN_ADDRESS=
NEXT_PUBLIC_MUSDC_ADDRESS=
NEXT_PUBLIC_WETH_ADDRESS=
NEXT_PUBLIC_FACTORY_ADDRESS=
NEXT_PUBLIC_POOL_BDX_MUSDC=
NEXT_PUBLIC_POOL_BDX_WETH=
NEXT_PUBLIC_LENDING_ADDRESS=
NEXT_PUBLIC_STAKING_ADDRESS=
NEXT_PUBLIC_MASTERCHEF_ADDRESS=
NEXT_PUBLIC_VESTING_ADDRESS=
NEXT_PUBLIC_GOVERNOR_ADDRESS=   # Phase 3
NEXT_PUBLIC_TIMELOCK_ADDRESS=   # Phase 3
NEXT_PUBLIC_SUBGRAPH_URL=
```

---

## License

MIT — **Built by [@wayphantomme](https://x.com/wayphantomme)**
