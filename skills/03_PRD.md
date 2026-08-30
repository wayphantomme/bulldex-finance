# Product Requirements Document (PRD)

## Bulldex Finance - Decentralized Trading Protocol

**Version:** 1.0  
**Last Updated:** 2026-08-24  
**Status:** In Development (16-week roadmap)

---

## 1. Executive Summary

**Bulldex Finance** is a comprehensive DeFi trading platform combining token swaps, liquidity provision, lending, staking, yield farming, NFT integration, and governance—all designed for bullish traders and yield farmers.

**Tagline:** "Trade Like a Bull. Earn Like a Beast."

**Target User:** DeFi enthusiasts, traders, liquidity providers, borrowers, NFT holders  
**MVP Launch:** 4 weeks (swap + liquidity)  
**Full Launch:** 16 weeks (all features)

---

## 2. Vision & Design Philosophy

### Brand Identity

**Bulldex Finance** = Powerful, reliable, aggressive DeFi protocol  
**Mascot:** Bull (strength, market optimism)  
**Vibe:** Dark + bold, professional + playful

### Design Principles

- **Minimal & Dark:** Clean dark interface with purple/amber gradients. No clutter.
- **Fast Feedback:** Every action shows instant results (balance updates, pending states, confirmations).
- **Accessible:** One-click wallet connection. No complexity for basic swaps.
- **Transparent:** Show gas costs, slippage, time limits upfront. No surprises.
- **Responsive:** Mobile-first design. Works seamlessly on all devices.

### Core Design Aesthetic

- **Color Palette:**
  - Primary: Purple (#7C3AED to #A855F7)
  - Secondary: Amber/Gold (#F59E0B) - Bull strength
  - Background: Deep Navy (#0F172A)
  - Cards: Subtle gradient surfaces (#1E293B)
  - Accent: Green (success), Red (error), Amber (warning/alert)

- **Typography:**
  - Headings: Bold, clean sans-serif (Geist, Inter)
  - Body: Readable 14-16px line-height 1.6
  - Mono: Code snippets only
  - Tagline Font: Strong, bullish energy

- **Components:**
  - Card-based layouts (no modal chaos)
  - Smooth transitions (no jarring reloads)
  - Skeleton loaders for data fetching
  - Bull icon accent in key areas
  - Toast notifications for user feedback

- **Logo/Branding:**
  - Bull head logo (stylized, modern)
  - Color: Purple primary + amber accent
  - Usage: Top-left corner + social media

---

## 3. Core Features by Phase

### Phase 1: Token Swap & Liquidity (Weeks 1-4)

**3.1 Token Swap**
- Search/select input and output tokens
- Display exchange rate, slippage, and gas cost before confirming
- Real-time price fetching from Oracle
- Support both simple swap and advanced settings
- Transaction history with timestamps

**3.2 Add Liquidity**
- Input two tokens (auto-calculate LP ratio)
- Show pool share before depositing
- LP token minting confirmation
- Remove liquidity (reverse operation)

**3.3 Wallet Integration**
- Connect via MetaMask, Rainbow Kit, or Privy
- Display connected account + balance
- Show recent transactions
- Disconnect option

---

### Phase 2: Lending & Yield (Weeks 5-8)

**3.4 Lending Protocol (Collateralized Borrowing)**
- Deposit collateral (any ERC20)
- Borrow up to X% of collateral value
- See interest accrual in real-time
- Repay loan with interest
- Risk indicator (health factor)

**3.5 Staking Rewards**
- Stake tokens to earn APY
- Dashboard showing staked amount + claimable rewards
- Claim rewards at any time
- Unstake with lockup periods (if applicable)

**3.6 Yield Farming**
- Connect LP tokens to farm
- Show reward emission rates
- Claim farmed tokens
- Pool APY calculator

**3.7 NFT Collateral**
- View owned NFTs
- Use NFT as loan collateral
- Liquidation warning if value drops
- NFT marketplace integration (optional)

---

### Phase 3: Advanced Features (Weeks 9-12)

**3.8 Flash Loans**
- Educational dashboard showing flash loan mechanics
- Demo contract interaction
- Show arbitrage example

**3.9 Governance Dashboard (BDX DAO)**
- View active proposals
- Vote on governance decisions
- See voting power breakdown
- Propose new features (if eligible)

**3.10 Gas Optimization & Analytics**
- Show per-transaction gas cost estimate
- Historical gas price chart
- Batch operations (swap + stake in one tx)
- Gas optimization tips

---

### Phase 4: Production Features (Weeks 13-16)

**3.11 Transaction History & Analytics**
- All-in-one transaction log (swaps, deposits, claims)
- Filter by type, asset, date
- Export transaction history
- Tax reporting helper (CSV download)

**3.12 Governance Upgrades**
- Multi-sig wallet integration
- Upgrade history with timestamps
- Rollback capability notifications

---

## 4. User Stories

### User Story 1: Bullish Trader (Swap)
```
As a: Bullish trader
I want to: Swap USDC for emerging tokens fast
So that: I can capitalize on market moves instantly

Acceptance Criteria:
- Connect wallet in 1 click
- Search for tokens by name/symbol
- See live price + estimated gas
- Confirm swap in 1 action
- See confirmation within 3 seconds
- Track transaction on Etherscan
```

### User Story 2: Liquidity Provider (LP)
```
As a: Active liquidity provider
I want to: Add liquidity and earn swap fees
So that: I can generate passive income on my assets

Acceptance Criteria:
- Input both tokens (auto-calculated ratio)
- See LP ratio and share percentage
- Get LP token balance confirmation
- Track my earnings in dashboard
- Remove liquidity anytime
```

### User Story 3: Yield Farmer (Power User)
```
As a: Yield farmer
I want to: Deposit LP tokens and farm rewards
So that: I can maximize returns on my capital

Acceptance Criteria:
- Connect LP token holder
- See APY % clearly
- Claim rewards without unstaking
- Track historical rewards earned
- Compare APY across pools
```

### User Story 4: Borrower (Leverage)
```
As a: Leverage-seeking trader
I want to: Deposit collateral and borrow stablecoins
So that: I can amplify my trading power without selling

Acceptance Criteria:
- Deposit NFT or ERC20 as collateral
- See max borrowable amount
- Monitor health factor in real-time
- Get liquidation warning at 110% LTV
- Repay loan partially or fully
```

---

## 5. Success Metrics

### User Engagement
- [ ] 100+ transactions in first week
- [ ] 50+ daily active users by week 4
- [ ] Average session duration > 5 minutes
- [ ] 30%+ return user rate

### Technical
- [ ] 95%+ test coverage
- [ ] Gas optimized (swap < 150k gas)
- [ ] <2s page load time
- [ ] 0 security vulnerabilities (audit passed)

### Content & Community
- [ ] 16 weekly Twitter posts (build in public)
- [ ] 2k+ Twitter followers
- [ ] 500+ Discord members (future)
- [ ] 1 viral demo video (>1k views)
- [ ] Featured on major DeFi aggregators

---

## 6. Brand Assets

### Color Codes
```
Primary Purple: #7C3AED
Accent Amber: #F59E0B
Dark Background: #0F172A
Card Surface: #1E293B
Success Green: #10B981
Error Red: #EF4444
Warning Amber: #F59E0B
Muted: #64748B
```

### Font Stack
```
Headings: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif
Body: Same as above
Mono: "Courier New", monospace
```

### Logo Usage
```
Primary: Bull head (purple + amber)
Favicon: Bull emoji or icon
Social: Full logo with "Bulldex Finance" text
```

---

## 7. Out of Scope (MVP)

- ❌ Decentralized exchange aggregation (v2 feature)
- ❌ Advanced charting (TradingView integration can wait)
- ❌ On-ramp/Off-ramp (Stripe/Paypal not in v1)
- ❌ Cross-chain bridges (single chain MVP)
- ❌ Mobile app (web responsive only)
- ❌ AI trading bots (future enhancement)

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Smart contract bugs | Loss of funds | Comprehensive testing + audit + bug bounty |
| Poor UX = low adoption | Platform fails | User testing + Jupiter-inspired design |
| Slow transaction confirm | Bad UX | Optimize gas + show pending state clearly |
| Slippage shocks users | Lost confidence | Slippage warning + price impact display |
| Liquidation confusion | Support burden | Health factor explanation + warning zone |
| Security vulnerability | Platform shutdown | Security-first mindset + fuzz testing |

---

## 9. Success Criteria (Hireable Portfolio)

By week 16, hiring managers should see:

✅ **Fully functional DeFi protocol** with all features working  
✅ **Production-quality code** with tests + documentation  
✅ **Live deployment** on Sepolia + Vercel  
✅ **Professional branding** (Bulldex Finance identity)  
✅ **Strong UI** inspired by Jupiter (polished appearance)  
✅ **Build-in-public presence** (Twitter/LinkedIn updates)  
✅ **Security-first approach** (audit checklist, gas optimization)  
✅ **Full documentation** (PRD, TRD, DEPLOYMENT, architecture)  

---

## Appendix A: Design Reference

**Jupiter Aggregator** inspiration points (with Bulldex twist):
- Minimal dark interface with purple + amber accents (bullish theme)
- Card-based component system
- Smooth loading states (skeleton loaders)
- Clear transaction confirmations
- Real-time balance updates
- Zero clutter approach

**Color codes to steal:**
```
Primary Purple: #7C3AED
Accent Amber: #F59E0B
Dark Background: #0F172A
Card Surface: #1E293B
Success Green: #10B981
Error Red: #EF4444
Warning Amber: #F59E0B
```

---

## Appendix B: Deployment & Launch

**For detailed deployment instructions:**
- Smart Contracts → See DEPLOYMENT.md (Foundry to Sepolia)
- Frontend → See DEPLOYMENT.md (Next.js to Vercel)
- CI/CD → See DEPLOYMENT.md (GitHub Actions automation)

**Quick flow:**
```
Week 1:
  1. Deploy Token.sol to Sepolia testnet
  2. Build Next.js frontend + wagmi integration
  3. Deploy to Vercel
  4. Connect wallet + view balance live
  5. Tweet progress + get feedback

Weeks 2-4:
  1. Deploy remaining contracts (Pool, Lending, Staking)
  2. Build feature pages (Swap, Liquidity, Lending, Farming)
  3. Add transaction history + portfolio dashboard
  4. Iterate based on feedback
  5. Polish + finalize branding
  
Weeks 5-16:
  1. Roll out advanced features
  2. Deploy governance + farming
  3. Community building
  4. Final audit + optimization
```

---

**Next:** See TRD.md for technical implementation details. See DEPLOYMENT.md for step-by-step setup.


---
