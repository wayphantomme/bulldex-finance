# Bulldex Finance — Complete Guide

**Tagline:** Trade Like a Bull. Earn Like a Beast.

**Status:** MVP on Sepolia Testnet

---

## Table of Contents

1. [What is Bulldex Finance?](#what-is-bulldex-finance)
2. [Tokenomics & Allocation](#tokenomics--allocation)
3. [How Liquidity Pools Work](#how-liquidity-pools-work)
4. [User Flow: How Others Swap](#user-flow-how-others-swap)
5. [Getting Testnet Tokens](#getting-testnet-tokens)
6. [Contract Addresses](#contract-addresses)
7. [Setup Instructions](#setup-instructions)
8. [FAQ](#faq)

---

## What is Bulldex Finance?

Bulldex is an **AMM (Automated Market Maker)** built on Ethereum with Solidity smart contracts and a Next.js frontend. Instead of order books, it uses the **x*y=k formula** (Uniswap v2-style) to automatically price swaps based on pool reserves.

### Key Features

- **0.3% swap fee** — distributed to liquidity providers
- **No order book** — automatic pricing via constant product formula
- **Permissionless** — anyone can provide liquidity, anyone can trade
- **Testnet MVP** — deployed on Sepolia for testing

### Architecture

```
Frontend (Next.js)
    ↓
wagmi (Web3 hooks)
    ↓
Sepolia Testnet Contracts
├─ BDX Token (ERC20)
├─ MUSDC Token (ERC20)
├─ Pool (x*y=k AMM)
└─ PoolFactory (create pools)
```

---

## Tokenomics & Allocation

**Total Supply:** 1 Billion BDX (capped)

**Current Allocation (100M in active use):**

| Allocation | Amount | Purpose | Timeline |
|-----------|--------|---------|----------|
| **Liquidity Pool** | 10M BDX | Bootstrap trading (locked) | Day 1 |
| **Airdrop + Faucet** | 30M BDX | Early users & community | Week 1-4 |
| **Yield Farming** | 20M BDX | Incentivize LP providers | Month 1-6 |
| **Treasury** | 20M BDX | DAO governance | Ongoing |
| **Team Allocation** | 10M BDX | Founder allocation | Vesting |
| **Buffer/Future** | 10M BDX | Ecosystem grants | As needed |

**MUSDC (Mock USDC):**
- Testnet only
- Unlimited faucet (1000 per user, one-time)
- No real value

---

## How Liquidity Pools Work

### The Concept

Unlike centralized exchanges (CEX), Bulldex doesn't match buyers and sellers. Instead:

1. **Liquidity Providers (LPs)** deposit equal value of two tokens → receive LP tokens
2. **The Pool** holds reserves of both tokens
3. **Traders** swap against the pool reserves using the formula
4. **Fee** (0.3%) goes to all LP holders proportionally

### The Formula: x*y=k

```
Pool state:
  reserve0 (BDX) = 10,000,000
  reserve1 (MUSDC) = 20,000,000
  
User swaps 1 BDX:
  amountOut = (1 * 997 * 20,000,000) / (10,000,000 * 1000 + 1 * 997)
  amountOut ≈ 1.98 MUSDC (after 0.3% fee)
  
Pool updates:
  reserve0 = 10,000,001
  reserve1 = 19,999,998.02
  
Price moved slightly (slippage)
```

### Why This Works

- **Simple:** No order book complexity
- **Instant:** Trades execute immediately
- **Transparent:** Price determined by math, not manipulation
- **Scalable:** Works for any token pair

---

## User Flow: How Others Swap

### Step 1: Connect Wallet

User clicks "Connect Wallet" → RainbowKit modal → Select MetaMask/Phantom/etc → Sign with private key → Connected ✅

```tsx
// Frontend
<ConnectButton.Custom>
  {({ openConnectModal }) => (
    <button onClick={openConnectModal}>Connect Wallet</button>
  )}
</ConnectButton.Custom>
```

### Step 2: Check Balance & Get Quote

Once connected, the frontend reads balances and calculates output real-time.

```tsx
// useTokenBalance hook
const { raw: balance } = useTokenBalance(address);

// useSwapQuote hook  
const { amountOut, priceImpact } = useSwapQuote(
  tokenIn, amountIn, pool.reserve0, pool.reserve1
);
```

User sees:
- Your balance: 100 MUSDC
- You sell: 1 MUSDC
- You receive: ~0.495 BDX
- Price impact: -0.15%
- Fee: 0.003 MUSDC

### Step 3: Approve Token (if needed)

Before swapping, the pool contract needs permission to transfer tokens.

```solidity
// User calls: Token.approve(poolAddress, MAX_UINT256)
// Frontend shows: "Approving MUSDC..."
// User signs the tx
```

**One-time per pool per token.** After approval, no need to approve again.

### Step 4: Execute Swap

User clicks "Swap" → Frontend sends tx to pool contract.

```solidity
// Pool.sol
function swap(
  address tokenIn,      // 0xMUSDA...
  uint256 amountIn,     // 1000000000000000000 (1 MUSDC)
  uint256 minAmountOut, // 490000000000000000 (slippage tolerance)
  address to            // User's wallet
) external {
  // Calculate output
  uint256 amountOut = getAmountOut(amountIn, reserveIn, reserveOut);
  
  // Check slippage
  if (amountOut < minAmountOut) revert SlippageExceeded();
  
  // Transfer tokens
  IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
  IERC20(outputToken).safeTransfer(to, amountOut);
  
  // Update reserves & emit event
  _updateReserves();
  emit Swap(msg.sender, tokenIn, amountIn, amountOut, to);
}
```

### Step 5: Transaction Confirmed

Frontend waits for block confirmation → Shows "Swap complete!" with Etherscan link.

**User's wallet state after:**
- MUSDC balance: -1 MUSDC
- BDX balance: +0.495 BDX
- Pool reserves updated
- Fee collected (0.003 MUSDC)

---

## Getting Testnet Tokens

You need **3 tokens** to start trading on Sepolia:

### 1. ETH (for gas fees)

**Source:** [Sepolia Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)

**Steps:**
1. Go to Google's Sepolia faucet
2. Enter your wallet address
3. Get 1 ETH (enough for many transactions)

**Used for:** Paying transaction fees (gas)

### 2. MUSDC (Mock USDC)

**Source:** Bulldex MUSDC faucet (in-app)

**Steps:**
1. Connect wallet
2. Go to "Contracts & Faucets" page
3. Click "Claim MUSDC"
4. Receive 1000 MUSDC

**Limit:** 1000 per wallet, one-time claim

**Used for:** One side of the swap (e.g., swap MUSDC → BDX)

### 3. BDX (Bulldex Token)

**Source:** Airdrop claim (if eligible) or earned from yield farming

**Steps:**
1. Go to "Contracts & Faucets" page
2. Click "Claim BDX" (if eligible)
3. Receive 100-1000 BDX depending on allocation

**Eligibility:** Early users, BlockDev Bali community, Superteam contributors, hackathon participants

**Used for:** The other side of the swap (e.g., swap MUSDC → BDX)

---

## Contract Addresses

**Network:** Sepolia Testnet (11155111)

**Contracts:**

| Name | Symbol | Address | Purpose |
|------|--------|---------|---------|
| BDX Token | BDX | `NEXT_PUBLIC_TOKEN_ADDRESS` | Governance & utility token (ERC20) |
| Mock USDC | MUSDC | `NEXT_PUBLIC_MUSDC_ADDRESS` | Testnet stablecoin for trading |
| Pool Factory | — | `NEXT_PUBLIC_FACTORY_ADDRESS` | Creates new trading pools |
| BDX/MUSDC Pool | — | `NEXT_PUBLIC_POOL_BDX_MUSDC` | Main liquidity pool (x*y=k) |

**To find addresses:**
1. Go to "Contracts & Faucets" page in Bulldex
2. All addresses displayed with copy buttons
3. Click "View" to see on Etherscan
4. Click "Add MM" to add to MetaMask

**For developers:** Check `.env.local` after deployment:
```
NEXT_PUBLIC_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_MUSDC_ADDRESS=0x...
NEXT_PUBLIC_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_POOL_BDX_MUSDC=0x...
```

---

## Setup Instructions

### For Users

**Goal:** Get 3 tokens and make your first swap.

**Time:** ~5 minutes

**Steps:**

1. **Install MetaMask**
   - Download from [metamask.io](https://metamask.io)
   - Create wallet (or import existing)
   - Add Sepolia network (usually auto-detected)

2. **Get ETH from faucet**
   - Go to [Sepolia faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
   - Enter wallet address
   - Receive 1 ETH

3. **Open Bulldex**
   - Go to [Bulldex app](https://bulldex-finance.vercel.app)
   - Click "Connect Wallet"
   - Select MetaMask
   - Approve connection in MetaMask

4. **Get MUSDC**
   - Go to "Contracts & Faucets" page
   - Click "Claim MUSDC"
   - Sign tx in MetaMask
   - Receive 1000 MUSDC

5. **Get BDX (if eligible)**
   - Go to "Contracts & Faucets" page
   - Click "Claim BDX"
   - Sign tx
   - Receive 100-1000 BDX
   - **Not eligible yet?** Ask in Discord #bulldex-testnet

6. **Add tokens to MetaMask** (optional but recommended)
   - Go to "Contracts & Faucets" page
   - Click "Add MM" on BDX and MUSDC cards
   - Approve in MetaMask
   - Balances now show in wallet

7. **Go to Swap page**
   - Click "Swap" in navigation
   - Select pair (BDX ↔ MUSDC)
   - Enter amount
   - Click "Swap BDX → MUSDC"
   - Confirm in MetaMask
   - Done! ✅

### For Developers

**Goal:** Deploy contracts and run frontend locally.

**Prerequisite:** Node.js 18+, Foundry

**Steps:**

1. **Clone repository**
   ```bash
   git clone https://github.com/wayphantomme/bulldex-finance.git
   cd bulldex-finance
   ```

2. **Deploy smart contracts**
   ```bash
   cd contracts
   make deploy-sepolia
   ```
   
   Output:
   ```
   BDX Token deployed: 0x...
   MockToken (MUSDC) deployed: 0x...
   PoolFactory deployed: 0x...
   BDX/MUSDC Pool created: 0x...
   ```

3. **Copy addresses to frontend**
   ```bash
   cd ../frontend
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```
   NEXT_PUBLIC_TOKEN_ADDRESS=0x...
   NEXT_PUBLIC_MUSDC_ADDRESS=0x...
   NEXT_PUBLIC_FACTORY_ADDRESS=0x...
   NEXT_PUBLIC_POOL_BDX_MUSDC=0x...
   ```

4. **Install and run frontend**
   ```bash
   npm install
   npm run dev
   ```
   
   Open [localhost:3000](http://localhost:3000)

5. **Connect wallet & test**
   - MetaMask → Sepolia
   - Get testnet tokens (follow user steps above)
   - Test swap on /dashboard/swap

---

## FAQ

### Q: Why do I need 3 tokens?

**A:** 
- **ETH:** Pays gas fees (transaction cost). Like paying a fee to use the network.
- **MUSDC:** One side of the swap (e.g., what you're selling).
- **BDX:** The other side of the swap (e.g., what you're buying).

Example: "Sell 100 MUSDC → Buy ~50 BDX" requires all three.

### Q: What's slippage?

**A:** The difference between your expected price and actual execution price. For large trades in small pools, slippage is high.

Example:
- You want to swap 1000 MUSDC
- Expected output: 400 BDX
- Actual output: 395 BDX
- Slippage: 5 BDX (1.25%)

You can set "Max slippage" (default 0.5%) to reject trades if price moves too much.

### Q: What's price impact?

**A:** How much your trade moves the price. Large trades in small pools have high impact.

Formula: `impactBps = ((midPrice - actualPrice) / midPrice) * 10000`

In Bulldex UI: Shows as percentage in red (>5%), yellow (>1%), or green (<1%).

### Q: Can I provide liquidity?

**A:** Yes! But the feature is not in Week 1. Coming Week 2.

**How it works:**
1. Deposit equal value of BDX + MUSDC
2. Receive LP tokens (proof of your share)
3. Earn 0.3% from all swaps in that pool
4. Burn LP tokens to withdraw (get your coins + fees)

### Q: How do I know the contract is safe?

**A:** Bulldex contracts are:
- Open source on GitHub
- Follow Uniswap v2 pattern (battle-tested)
- Use OpenZeppelin libraries (audited)

**Not audited yet** (testnet MVP), so don't put real money in.

### Q: What happens if the pool runs out of one token?

**A:** Can't happen! The formula x*y=k means:
- As one reserve gets smaller, price goes up
- As price goes up, fewer people want to trade at that price
- Equilibrium reached

Example: If everyone swaps MUSDC → BDX:
- MUSDC reserve ↑ (huge supply)
- BDX reserve ↓ (rare supply)
- BDX price ↑↑ (expensive)
- People stop swapping (too expensive)
- Stopped before zero

### Q: Is this real money?

**A:** No! Sepolia is testnet only.
- BDX, MUSDC, ETH = fake tokens
- No real value
- Used for testing
- Data resets periodically

### Q: Can I use this on mainnet?

**A:** Not yet. Bullde is MVP on testnet. Mainnet deployment planned after:
- Community testing
- Security audit
- Governance vote

---

## Next Steps

### For Traders

1. Get tokens (follow setup guide)
2. Go to Swap page
3. Make your first swap
4. Check transaction on [Etherscan](https://sepolia.etherscan.io)
5. Join Discord for updates

### For Liquidity Providers

- Check back in **Week 2** for liquidity pool feature
- Join Discord #lp-providers for early access

### For Developers

- Clone repo and run locally
- Read contract code in `contracts/src/`
- Submit PRs or issues
- Build a new pool type (e.g., concentrated liquidity)

### For Community

- Join [Superteam Indonesia](https://discord.gg/superteam)
- Join [Solana Bali Builders](https://discord.gg/solanabali)
- Follow [@wayphantomme](https://x.com/wayphantomme) on X

---

## Resources

- **Website:** https://bulldex-finance.vercel.app
- **GitHub:** https://github.com/wayphantomme/bulldex-finance
- **Testnet Faucets:**
  - ETH: https://cloud.google.com/application/web3/faucet/ethereum/sepolia
  - MUSDC: In-app (Contracts & Faucets page)
- **Sepolia Etherscan:** https://sepolia.etherscan.io
- **Uniswap v2 Docs:** https://docs.uniswap.org/contracts/v2/overview

---

## Summary

**Bulldex Finance is an AMM that lets anyone trade tokens without order books.**

- Pool holds reserves
- Traders swap against reserves using x*y=k formula
- Fee (0.3%) goes to liquidity providers
- Anyone can provide liquidity and earn fees
- Testnet MVP on Sepolia (fake tokens, no real value)

**To start:**
1. Get ETH (gas), MUSDC (faucet), BDX (airdrop)
2. Go to Swap page
3. Pick pair, enter amount, click Swap
4. Confirm in MetaMask
5. Done!

**Questions?** Ask in Discord or check [GitHub Issues](https://github.com/wayphantomme/bulldex-finance/issues).

---

Last updated: Week 1 MVP
Status: Swap ✅ | Liquidity Pools 🔄 (Week 2) | Farming 🔄 (Month 1)


---

## Phase 3-4 Updates (Aug 2026)

### New Contracts Deployed
- **WETH.sol** - WETH9-style wrapper. `deposit()` ETH -> WETH, `withdraw()` WETH -> ETH
- **BDX/WETH Pool** `0x3cA1cE14fd2fE5A449F67CFA63F342acfB8860e4` - 1M BDX + 0.1 WETH

### New Frontend Hooks
- **useTokenBalances** - multicall semua token balance sekaligus (BDX + MUSDC + WETH + native ETH)
- **useMultiPool** - dynamic pool routing berdasarkan token pair yang dipilih
- **useMultiSwap** - wrap ETH + approve + swap dalam satu state machine

### Swap UI Improvements
- Token picker dropdown dengan balance per token
- ETH auto-wraps ke WETH sebelum swap
- Multi-pool routing: BDX/MUSDC atau BDX/WETH otomatis
- Balance display fix - sebelumnya selalu baca BDX balance dua kali

### Key Lessons
- Selalu baca SEMUA token balances via multicall - jangan reuse hook yang sama
- ETH di DeFi selalu butuh WETH wrapper - design dari awal
- Stack too deep di Solidity script - extract ke helper functions (max ~7 local vars per function)
- MINIMUM_LIQUIDITY menyebabkan rounding - test dengan assertApproxEqRel bukan exact equality


---

## Deployer vs User — Cara Kerja Dapp

### Siapa Deployer?
Deployer adalah wallet yang menjalankan `make deploy-sepolia`. Wallet ini:
- Deploy semua contracts (Token, MockToken, Pool, PoolFactory, Lending)
- Mint initial BDX supply (100M BDX ke wallet deployer)
- Seed liquidity pool (deposit BDX + MUSDC ke pool)
- Fund lending reserve (transfer MUSDC ke Lending contract)

**Deployer Bulldex:** `0x1Daa1EFD9Adf43eC16fE2bBE7671cCD3E329A215`

### Siapa User?
User adalah wallet siapapun yang membuka dapp. User TIDAK punya token saat pertama connect.

**Flow user baru:**
```
Connect wallet (wallet kosong)
  ↓
Step 1: Get ETH Sepolia (gas)
  → https://cloud.google.com/application/web3/faucet/ethereum/sepolia
  → Receive 0.5 ETH
  ↓
Step 2: Claim MUSDC dari Faucet page
  → Call MockToken.faucet() → receive 1,000 MUSDC
  → Cooldown 24 jam per wallet
  ↓
Step 3: Swap MUSDC → BDX di Swap page
  → 1,000 MUSDC → ~499 BDX (setelah fee 0.3%)
  → User sekarang punya BDX
  ↓
Step 4: Bisa add liquidity atau deposit ke lending
  → Add Liquidity: butuh BDX + MUSDC
  → Lending: butuh BDX sebagai collateral
```

### Kenapa User Tidak Bisa Langsung Punya BDX?
- BDX adalah "protocol token" — nilainya dari usage
- User harus beli/swap untuk mendapatkan
- Ini mendukung price discovery dan demand BDX
- Di production: user beli BDX dari DEX
- Di testnet: user dapat MUSDC gratis, lalu swap ke BDX

### MINIMUM_LIQUIDITY — Kenapa Tidak Bisa Ubah Harga?
Ketika pool pertama kali di-seed, 1000 wei LP token di-lock ke `address(1)` selamanya.
Ini berarti 1000 wei dari initial seed PERMANENT dan menentukan "baseline ratio" pool.

```
Initial seed: 10M BDX + 20M MUSDC → locked 1000 wei LP at 2:1
Setelah remove semua LP → pool masih ada 125 BDX + 250 MUSDC (dari 1000 wei locked LP)
Add liquidity baru harus mengikuti rasio existing: 2:1

→ Tidak bisa mengubah pool price melalui addLiquidity
→ Hanya bisa mengubah price melalui swap (price impact)
```

**Kesimpulan:** Pool price bisa diubah via swap saja, tidak via liquidity provision.

### Prevent Re-deploy
```bash
# JANGAN jalankan ini sembarangan:
make deploy-sepolia  # → deploy contract BARU dengan address BARU

# Gunakan ini untuk operasi spesifik:
make deploy-lending    # deploy Lending saja
make deploy-weth-pool  # deploy WETH + BDX/WETH pool saja
make reseed-pool       # reseed existing pool
```

Setiap `make deploy-sepolia` = address baru = app harus update semua env vars.
Di Ethereum tidak ada "update" contract — deploy = baru.
