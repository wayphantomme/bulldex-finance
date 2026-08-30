# Deployment Guide: Bulldex Finance

**Project:** Bulldex Finance - Decentralized Trading Protocol  
**Last Updated:** 2026-08-24  
**Status:** Complete walkthrough for Week 1

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Smart Contract Deployment (Foundry → Sepolia)](#smart-contract-deployment)
3. [Verify Contract on Etherscan](#verify-contract-on-etherscan)
4. [Extract ABI for Frontend](#extract-abi-for-frontend)
5. [Frontend Setup (Next.js + wagmi)](#frontend-setup)
6. [Environment Variables](#environment-variables)
7. [Deploy Frontend to Vercel](#deploy-frontend-to-vercel)
8. [GitHub Actions CI/CD](#github-actions-cicd)
9. [Testing Before Production](#testing-before-production)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Accounts You Need

```
1. GitHub Account
   → https://github.com/signup
   → For version control + Vercel integration

2. Alchemy Account (Free RPC)
   → https://www.alchemy.com/
   → Gives you Sepolia RPC endpoint
   → Sign up → Create app → Get API key

3. MetaMask Wallet
   → https://metamask.io/
   → Browser extension for signing transactions
   → Store private key safely (NEVER share)

4. Vercel Account
   → https://vercel.com/signup
   → Sign with GitHub (easier)
   → One-click deployment

5. Etherscan Account (Optional)
   → https://etherscan.io/apis
   → Get API key for contract verification
```

### Software Installed

```bash
# Node.js (v18+)
node --version  # v18.0.0 or higher

# Git
git --version   # v2.30+

# Foundry (Solidity compiler + testing)
curl -L https://foundry.paradigm.xyz | bash
source $HOME/.bashrc
foundryup
forge --version  # foundry 0.2.0 or higher
```

---

## Smart Contract Deployment

### Step 1: Setup Sepolia Testnet in MetaMask

```
1. Open MetaMask
2. Network dropdown → "Add Network"
3. Fill in:
   - Network name: Sepolia
   - RPC URL: https://eth-sepolia.g.alchemy.com/v2/demo
   - Chain ID: 11155111
   - Currency symbol: ETH
4. Save
5. Get test ETH: https://sepoliafaucet.com/
   - Paste your address
   - Click faucet
   - Wait ~30 seconds
   - 0.5 test ETH appears ✅
```

### Step 2: Export Private Key from MetaMask

⚠️ **CRITICAL: NEVER SHARE PRIVATE KEY. ONLY FOR TESTNET.**

```
1. MetaMask Settings → Account Details
2. Click "Export Private Key"
3. Confirm password
4. Copy private key (starts with 0x)
5. Save to .env file (NEVER commit to GitHub)
```

### Step 3: Get Alchemy RPC URL

```
1. Go to https://www.alchemy.com/
2. Sign up (free)
3. Create new app:
   - Name: "DeFi App"
   - Chain: Ethereum
   - Network: Sepolia
4. Dashboard → "API Key"
5. Copy full URL (like https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY)
```

### Step 4: Create contracts/.env

```bash
cd defi-app/contracts

cat > .env << 'EOF'
# Sepolia testnet RPC
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Your private key (NEVER commit this file)
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_FROM_METAMASK

# Etherscan API key (for verification)
ETHERSCAN_KEY=YOUR_ETHERSCAN_API_KEY
EOF

# IMPORTANT: Add to .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

### Step 5: Deploy Smart Contract

```bash
cd contracts

# Option A: Using Foundry script
forge script script/Deploy.s.sol \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast

# Output:
# ============================================================
# Chain 11155111
# Estimated gas price: 2 gwei
# Deploying Token...
# ✓ Token deployed at: 0x1234abcdef...
# ✓ Transaction hash: 0x5678...
# ============================================================
```

**Save this output:**
```
Contract Address: 0x1234abcdef...    ← Copy this!
Transaction Hash: 0x5678...
Block: 5000000
```

### Step 6: Verify Transaction on Sepolia Etherscan

```
1. Go to https://sepolia.etherscan.io/
2. Search for your contract address (0x1234abcdef...)
3. Should show:
   - Contract creator address
   - Creation transaction
   - ETH balance (should be 0)
   - Token balance (should show totalSupply)
4. Click "Contract" tab
   - Shows bytecode (deployed contract)
   - Read/Write functions available
```

---

## Verify Contract on Etherscan

### Why Verify?

✅ Makes contract code publicly readable  
✅ People can audit your contract  
✅ Shows source code on Etherscan  
✅ Hireable portfolio signal  

### Automated Verification

```bash
# Add to foundry.toml
[profile.default]
verifier = "etherscan"
verifier_url = "https://api-sepolia.etherscan.io/api"

# Deploy with auto-verify
forge script script/Deploy.s.sol \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_KEY \
  -vvv
```

### Manual Verification (If needed)

```
1. Go to https://sepolia.etherscan.io/
2. Search for your contract
3. Click "Contract" tab
4. Click "Verify and Publish"
5. Fill in:
   - Contract Address: 0x1234abcdef...
   - Compiler Version: 0.8.20 (match your pragma)
   - License: MIT
   - Code: Paste your Token.sol
6. Click "Verify and Publish"
7. Wait ~1 minute
8. ✅ Contract verified!
```

---

## Extract ABI for Frontend

### What is ABI?

ABI (Application Binary Interface) = "instruction manual" for contract functions  
Tells frontend: "This contract has transfer(), balanceOf() functions, call them like this"

### Auto-Extract from Foundry

```bash
# After forge build, ABI is here:
cat contracts/out/Token.sol/Token.json

# Extract just the ABI (clean JSON)
cat contracts/out/Token.sol/Token.json | jq '.abi' > frontend/src/constants/tokenAbi.json

# Or copy the full JSON to frontend
cp contracts/out/Token.sol/Token.json frontend/src/constants/Token.json
```

### Example ABI (What you get)

```json
[
  {
    "type": "function",
    "name": "transfer",
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "value", "type": "uint256" }
    ],
    "outputs": [{ "type": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [{ "name": "account", "type": "address" }],
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view"
  }
]
```

---

## Frontend Setup

### Step 1: Init Next.js Project

```bash
cd defi-app

npx create-next-app@latest frontend \
  --typescript \
  --tailwind \
  --no-git \
  --no-eslint

cd frontend
```

### Step 2: Install Web3 Dependencies

```bash
npm install wagmi viem @wagmi/core ethers
npm install @rainbow-me/rainbowkit  # wallet UI
npm install @tanstack/react-query   # data fetching
npm install zustand                  # state management
```

### Step 3: Setup wagmi Configuration

```typescript
// frontend/src/config/wagmi.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Bulldex Finance',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Get from https://cloud.walletconnect.com/
  chains: [sepolia],
  ssr: true, // Enable for Next.js SSR
});
```

### Step 4: Wrap App with Providers

```typescript
// frontend/src/app/layout.tsx
'use client';

import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { config } from '@/config/wagmi';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider config={config}>
          <RainbowKitProvider>
            {children}
          </RainbowKitProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
```

### Step 5: Create Constants File

```typescript
// frontend/src/constants/contracts.ts
import tokenAbi from './tokenAbi.json';

export const CONTRACTS = {
  token: {
    address: '0x1234abcdef...' as const, // Your deployed contract
    abi: tokenAbi,
  },
} as const;

// Chain config
export const SEPOLIA_RPC = 'https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY';
```

### Step 6: Create Custom Hook for Contract

```typescript
// frontend/src/hooks/useTokenBalance.ts
import { useContractRead } from 'wagmi';
import { CONTRACTS } from '@/constants/contracts';

export function useTokenBalance(address?: string) {
  const { data: balance, isLoading, error } = useContractRead({
    address: CONTRACTS.token.address,
    abi: CONTRACTS.token.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  return {
    balance: balance as bigint | undefined,
    isLoading,
    error,
  };
}
```

### Step 7: Create Balance Display Component

```typescript
// frontend/src/components/BalanceDisplay.tsx
'use client';

import { useAccount } from 'wagmi';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function BalanceDisplay() {
  const { address, isConnected } = useAccount();
  const { balance, isLoading } = useTokenBalance(address);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white">
      <div className="mb-4">
        <ConnectButton />
      </div>

      {isConnected ? (
        <div>
          <p className="text-sm text-slate-400 mb-2">Your Balance</p>
          {isLoading ? (
            <p className="text-2xl font-bold animate-pulse">Loading...</p>
          ) : (
            <p className="text-2xl font-bold">
              {balance ? (balance / BigInt(10 ** 18)).toString() : '0'} MYT
            </p>
          )}
        </div>
      ) : (
        <p className="text-slate-400">Connect wallet to see balance</p>
      )}
    </div>
  );
}
```

### Step 8: Update Home Page

```typescript
// frontend/src/app/page.tsx
import { BalanceDisplay } from '@/components/BalanceDisplay';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">DeFi App</h1>
        <BalanceDisplay />
      </div>
    </main>
  );
}
```

---

## Environment Variables

### Frontend (.env.local)

```bash
# frontend/.env.local
NEXT_PUBLIC_SEPOLIA_RPC=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
NEXT_PUBLIC_TOKEN_ADDRESS=0x1234abcdef...
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_WALLETCONNECT_ID
```

**Note:** `NEXT_PUBLIC_` prefix = visible in browser (that's OK for public data)  
**Never use NEXT_PUBLIC_ for private keys or secrets**

### Smart Contracts (.env)

```bash
# contracts/.env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
ETHERSCAN_KEY=YOUR_ETHERSCAN_API_KEY
```

**Add to .gitignore (CRITICAL):**
```bash
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
git rm --cached .env  # If you accidentally committed it
```

---

## Deploy Frontend to Vercel

### Step 1: Push to GitHub

```bash
cd frontend

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial frontend commit"

# Create repo on GitHub
# → https://github.com/new
# → Repository name: defi-app
# → Private or public (public for portfolio)

# Connect local to GitHub
git remote add origin https://github.com/YOUR_USERNAME/defi-app.git
git branch -M main
git push -u origin main
```

### Step 2: Create Vercel Project

```
1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Select "defi-app" repository
4. Framework: Next.js (auto-detected)
5. Environment Variables:
   - Name: NEXT_PUBLIC_SEPOLIA_RPC
   - Value: https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
   - Add another:
     - Name: NEXT_PUBLIC_TOKEN_ADDRESS
     - Value: 0x1234abcdef...
6. Click "Deploy"
7. Wait ~2 minutes ✅
8. Get URL: https://defi-app.vercel.app
```

### Step 3: Set Custom Domain (Optional)

```
1. Vercel dashboard → Settings → Domains
2. Add custom domain (if you own one)
3. Update DNS records with Vercel's instructions
```

### Step 4: Setup Automatic Deployments

```
Vercel auto-deploys when you push to main:

Local:
  $ git push origin main

GitHub:
  → Webhook triggers

Vercel:
  → Auto-build + deploy
  → URL: defi-app.vercel.app
```

---

## GitHub Actions CI/CD

### Create Test Workflow

```yaml
# .github/workflows/test.yml
name: Smart Contract Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Foundry
        uses: foundry-rs/foundry-toolchain@v1
      
      - name: Run tests
        run: cd contracts && forge test -vvv
      
      - name: Generate gas report
        run: cd contracts && forge test --gas-report
      
      - name: Run coverage
        run: cd contracts && forge coverage
```

### Create Frontend Test Workflow

```yaml
# .github/workflows/frontend-test.yml
name: Frontend Tests

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd frontend && npm install
      
      - name: Type check
        run: cd frontend && npm run type-check
      
      - name: Lint
        run: cd frontend && npm run lint
```

### Create Automatic Deploy Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Get Vercel Secrets for GitHub Actions

```
1. Vercel dashboard → Settings → Tokens
2. Create new token (copy it)
3. GitHub repo → Settings → Secrets and variables
4. Add secrets:
   - VERCEL_TOKEN: (paste token)
   - VERCEL_ORG_ID: (from Vercel dashboard → Settings)
   - VERCEL_PROJECT_ID: (from Project Settings)
```

---

## Testing Before Production

### Local Testing

```bash
# Smart contracts
cd contracts
forge test
forge test --gas-report
forge coverage

# Frontend
cd frontend
npm run type-check
npm run lint
npm run build
```

### Testnet Testing

```bash
# 1. Deploy contract to Sepolia (if not already done)
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast

# 2. Update .env.local with testnet contract address

# 3. Run app locally
npm run dev
# Visit http://localhost:3000

# 4. Connect MetaMask to Sepolia
# 5. Get test ETH: https://sepoliafaucet.com/

# 6. Test functionality:
#    - Connect wallet
#    - See balance
#    - Try transactions
```

### Pre-Production Checklist

```
☐ All tests passing
☐ Gas report reviewed
☐ Contract verified on Etherscan
☐ .env files in .gitignore
☐ Environment variables set in Vercel
☐ Frontend builds without errors
☐ Wallet connection working
☐ Balance display working
☐ No console errors
☐ Mobile responsive
☐ Dark mode working
```

---

## Troubleshooting

### Deploy Issues

#### Problem: "Private key rejected"
```bash
# Solution: Check format
# Should start with 0x
# Should be 64 hex characters

# Test in .env:
PRIVATE_KEY=0x1234abcd...  ✅
PRIVATE_KEY=1234abcd...    ❌
```

#### Problem: "RPC rate limited"
```bash
# Solution: Create your own Alchemy key
# Don't use demo key from docs
# https://www.alchemy.com/ → Create app → Get key
```

#### Problem: "Insufficient gas fee"
```bash
# Solution: Need more test ETH
# https://sepoliafaucet.com/
# Paste your address
# Get more ETH
```

#### Problem: "Contract already exists at address"
```bash
# Solution: Deploy to different address
# Or use CREATE2 for predictable addresses
# For now, use new private key / different account
```

### Frontend Issues

#### Problem: "Cannot find module 'wagmi'"
```bash
npm install wagmi viem @wagmi/core
```

#### Problem: "Contract address not found"
```typescript
// Check constants/contracts.ts
// Make sure TOKEN_ADDRESS is correct from Etherscan

// Test address format:
0x1234abcdef... ✅  // 42 characters (including 0x)
1234abcdef...   ❌  // Missing 0x
0x1234          ❌  // Too short
```

#### Problem: "Balance shows as 0"
```typescript
// Issue: Need to divide by decimals

// Wrong:
balance = 1000000000000000000  // Raw Wei

// Right:
balance / BigInt(10 ** 18) = 1  // Readable
```

#### Problem: "Wallet not connecting"
```
1. Check MetaMask is on Sepolia network
2. Check WalletConnect project ID is set
3. Check NEXT_PUBLIC_ env vars exist
4. Restart browser + MetaMask
```

### Vercel Issues

#### Problem: "NEXT_PUBLIC_ variables not showing"
```
Solution: Rebuild + redeploy on Vercel
Vercel → Settings → Git
Redeploy Production
(Takes 2-3 minutes)
```

#### Problem: "Blank page in production"
```bash
# Check build logs:
Vercel → Deployments → Click deployment
→ Build Logs tab
→ See error

# Usually:
npm run build fails locally?
npm install missing deps?
```

---

## Deployment Checklist

### Week 1 (MVP)

```
Smart Contracts:
☐ Token.sol written
☐ 3 unit tests passing
☐ Deployed to Sepolia
☐ Verified on Etherscan
☐ Contract address saved

Frontend:
☐ Next.js project created
☐ wagmi + RainbowKit installed
☐ Wallet connection working
☐ Balance display working
☐ Deployed to Vercel
☐ Live at: defi-app.vercel.app

GitHub:
☐ All code committed
☐ .env in .gitignore
☐ README updated with links
☐ Twitter/LinkedIn post sent
```

### Week 2-4

```
Smart Contracts:
☐ Pool.sol deployed
☐ Lending.sol deployed
☐ Staking.sol deployed
☐ All verified on Etherscan

Frontend:
☐ Swap page working
☐ Liquidity page working
☐ Lending page working
☐ Staking page working

GitHub Actions:
☐ Automatic tests passing
☐ Automatic deployment working
☐ Coverage reports generated
```

---

## Production Readiness

### Before Going Mainnet

```
Security:
☐ External audit completed
☐ All security warnings fixed
☐ No hardcoded addresses
☐ Private keys secured (use secret manager)

Testing:
☐ 95%+ test coverage
☐ Fuzz testing passed
☐ Mainnet fork testing done
☐ Gas optimization reviewed

Operations:
☐ Monitoring setup (Sentry)
☐ Error alerts configured
☐ Incident response plan
☐ Upgrade strategy documented
```

**For now: Stay on Sepolia testnet. Don't deploy to mainnet until production-ready.**

---

## Quick Commands Reference

```bash
# Smart contracts
cd contracts

# Compile
forge build

# Test
forge test -vvv

# Deploy to Sepolia
forge script script/Deploy.s.sol \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast

# Verify on Etherscan
forge verify-contract <ADDRESS> Token --chain-id 11155111

# Frontend
cd frontend

# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build

# Type check
npm run type-check

# Deploy to Vercel (if setup with GitHub)
git push origin main
# Vercel auto-deploys
```

---

## Resources

**Testnet Faucets:**
- https://sepoliafaucet.com/
- https://faucet.paradigm.xyz/

**Explorers:**
- https://sepolia.etherscan.io/ (Sepolia)
- https://etherscan.io/ (Mainnet reference)

**Documentation:**
- Foundry: https://book.getfoundry.sh/
- wagmi: https://wagmi.sh/
- Next.js: https://nextjs.org/docs
- Vercel: https://vercel.com/docs

**Safety:**
- Never share private keys
- Never commit .env files
- Use testnet first
- Audit before mainnet

---

**Next Step:** Follow Week 1 checklist above. Start with Step 1 (MetaMask setup).
