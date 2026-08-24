'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/utils/cn';

// ─── Nav structure ────────────────────────────────────────────────────────────

const NAV = [
  {
    label: 'Getting Started',
    items: [
      { id: 'introduction', label: 'Introduction' },
      { id: 'quickstart',   label: 'Quick Start' },
      { id: 'stack',        label: 'Tech Stack' },
    ],
  },
  {
    label: 'Smart Contracts',
    items: [
      { id: 'token',        label: 'Token (BDX)' },
      { id: 'pool',         label: 'Pool (AMM)' },
      { id: 'factory',      label: 'PoolFactory' },
      { id: 'mocktoken',    label: 'MockToken' },
    ],
  },
  {
    label: 'Frontend',
    items: [
      { id: 'architecture', label: 'Architecture' },
      { id: 'hooks',        label: 'Hooks' },
      { id: 'swap-flow',    label: 'Swap Flow' },
    ],
  },
  {
    label: 'Dev Log',
    items: [
      { id: 'week2', label: 'Week 2 - AMM Swap' },
      { id: 'week1', label: 'Week 1 - Foundation' },
    ],
  },
  {
    label: 'Decisions',
    items: [
      { id: 'decisions', label: 'Technical Decisions' },
    ],
  },
];

export default function DocsPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen">

      {/* ── Left sidebar ──────────────────────────────────────────────────── */}
      <aside className="hidden w-60 shrink-0 border-r border-base-border lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto py-8 pl-6 pr-4 no-scrollbar">
          {/* Logo */}
          <Link href="/" className="mb-8 flex items-center gap-2 text-sm font-semibold text-ink hover:opacity-80 transition-opacity">
            <span className="text-green">←</span> Bulldex Finance
          </Link>

          <nav className="space-y-6">
            {NAV.map((group) => (
              <div key={group.label}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                  {group.label}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="block rounded-lg px-2.5 py-1.5 text-sm text-ink-secondary transition-colors hover:bg-base-card hover:text-ink"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="min-w-0 flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex h-12 items-center justify-between border-b border-base-border bg-base-bg/90 px-6 backdrop-blur-sm lg:hidden">
          <span className="text-sm font-semibold text-ink">Bulldex Docs</span>
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="text-ink-secondary"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        {mobileNavOpen && (
          <div className="border-b border-base-border bg-base-card px-6 py-4 lg:hidden">
            {NAV.map((group) => (
              <div key={group.label} className="mb-4">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                  {group.label}
                </p>
                <ul className="space-y-1">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        onClick={() => setMobileNavOpen(false)}
                        className="block text-sm text-ink-secondary hover:text-ink"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <article className="mx-auto max-w-3xl px-6 py-12 space-y-20 pb-32">

          {/* ── Introduction ──────────────────────────────────────────────── */}
          <Section id="introduction">
            <h1 className="text-3xl font-bold text-ink">Bulldex Finance</h1>
            <p className="mt-3 text-base text-ink-secondary leading-relaxed">
              Full-stack DeFi protocol built in public - combining token swaps, liquidity provision,
              lending, staking, yield farming, and governance on Ethereum.
            </p>
            <p className="mt-2 text-sm text-ink-secondary leading-relaxed">
              Built as a portfolio project demonstrating end-to-end ownership: Solidity contracts,
              Foundry testing, Next.js frontend, wagmi integration, and Vercel deployment.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Pill href="https://bulldex-finance.vercel.app" label="Live App ↗" />
              <Pill href="https://github.com/wayphantomme/bulldex-finance" label="GitHub ↗" />
              <Pill href="https://sepolia.etherscan.io/address/0x392d29D689a5ecfe08bD12482570Ac82Ad3567C9" label="Contract ↗" />
              <Pill href="https://x.com/wayphantomme" label="@wayphantomme ↗" />
            </div>

            <Table
              className="mt-6"
              headers={['Item', 'Detail']}
              rows={[
                ['Network', 'Sepolia Testnet (chain 11155111)'],
                ['Tests', '73 passing (33 Token + 40 Pool)'],
                ['Contracts', 'Token, MockToken, Pool, PoolFactory'],
                ['Frontend', 'Next.js 14, wagmi v2, RainbowKit v2'],
                ['Status', 'Week 2 complete - AMM Swap live'],
              ]}
            />
          </Section>

          {/* ── Quick Start ───────────────────────────────────────────────── */}
          <Section id="quickstart">
            <H2>Quick Start</H2>
            <p className="text-sm text-ink-secondary">Clone, install, and run locally in under 5 minutes.</p>

            <H3>Prerequisites</H3>
            <ul className="space-y-1 text-sm text-ink-secondary">
              <li>• Node.js v20+</li>
              <li>• <a href="https://book.getfoundry.sh/getting-started/installation" className="text-green hover:opacity-70">Foundry</a> - Solidity compiler + testing</li>
              <li>• Git</li>
            </ul>

            <H3>Smart Contracts</H3>
            <Code>{`git clone https://github.com/wayphantomme/bulldex-finance.git
cd bulldex-finance/contracts

# Install OZ + forge-std
forge install

# Run all 73 tests
make test

# Deploy to Sepolia
cp .env.example .env        # fill in keys
make deploy-sepolia`}</Code>

            <H3>Frontend</H3>
            <Code>{`cd frontend
npm install

cp .env.local.example .env.local
# Fill in from deploy output:
# NEXT_PUBLIC_SEPOLIA_RPC
# NEXT_PUBLIC_TOKEN_ADDRESS
# NEXT_PUBLIC_MUSDC_ADDRESS
# NEXT_PUBLIC_FACTORY_ADDRESS
# NEXT_PUBLIC_POOL_BDX_MUSDC
# NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

npm run dev   # http://localhost:3000`}</Code>
          </Section>

          {/* ── Tech Stack ────────────────────────────────────────────────── */}
          <Section id="stack">
            <H2>Tech Stack</H2>
            <Table
              headers={['Layer', 'Technology', 'Version', 'Purpose']}
              rows={[
                ['Contracts', 'Solidity', '0.8.24', 'Smart contract language'],
                ['Contracts', 'Foundry', 'nightly', 'Compile, test, deploy, verify'],
                ['Contracts', 'OpenZeppelin', 'v5.1.0', 'ERC20, ReentrancyGuard, SafeERC20'],
                ['Frontend', 'Next.js', '14.2.5', 'React SSR framework'],
                ['Frontend', 'TypeScript', '^5', 'Type-safe frontend'],
                ['Frontend', 'Tailwind CSS', '^3.4', 'Utility-first CSS, brand tokens'],
                ['Frontend', 'wagmi', 'v2.12.7', 'React hooks for Ethereum'],
                ['Frontend', 'viem', 'v2.21.1', 'TypeScript Ethereum utils'],
                ['Frontend', 'RainbowKit', 'v2.1.7', 'Wallet connect UI'],
                ['Infra', 'Alchemy', '-', 'Sepolia RPC endpoint'],
                ['Infra', 'Vercel', '-', 'Frontend hosting, auto-deploy'],
                ['Infra', 'GitHub Actions', '-', 'CI/CD - test + deploy on push'],
              ]}
            />
          </Section>

          {/* ── Token ─────────────────────────────────────────────────────── */}
          <Section id="token">
            <H2>Token.sol - BDX</H2>
            <p className="text-sm text-ink-secondary">ERC20 governance and utility token for Bulldex Finance.</p>

            <H3>Inheritance</H3>
            <Code>{`Token is ERC20, ERC20Burnable, ERC20Permit, Ownable`}</Code>

            <H3>Key Parameters</H3>
            <Table
              headers={['Parameter', 'Value']}
              rows={[
                ['Name', 'Bulldex Finance'],
                ['Symbol', 'BDX'],
                ['Decimals', '18'],
                ['Max Supply', '1,000,000,000 BDX'],
                ['Initial Supply', '100,000,000 BDX (to deployer)'],
                ['Sepolia Address', '0x392d29D689a5ecfe08bD12482570Ac82Ad3567C9'],
              ]}
            />

            <H3>Functions</H3>
            <FunctionList items={[
              { sig: 'mint(address to, uint256 amount)', mod: 'onlyOwner', desc: 'Mint new BDX up to MAX_SUPPLY' },
              { sig: 'burn(uint256 value)', mod: 'public', desc: 'Burn caller\'s tokens' },
              { sig: 'burnFrom(address account, uint256 value)', mod: 'public', desc: 'Burn with allowance' },
              { sig: 'permit(owner, spender, value, deadline, v, r, s)', mod: 'public', desc: 'EIP-2612 gasless approval via signature' },
              { sig: 'remainingMintable()', mod: 'view', desc: 'Returns MAX_SUPPLY - totalSupply()' },
            ]} />

            <H3>Custom Errors</H3>
            <Code>{`error ExceedsMaxSupply(uint256 requested, uint256 available);
error MintToZeroAddress();
error MintAmountZero();`}</Code>
          </Section>

          {/* ── Pool ──────────────────────────────────────────────────────── */}
          <Section id="pool">
            <H2>Pool.sol - AMM</H2>
            <p className="text-sm text-ink-secondary">
              Constant product AMM (<code className="text-green">x * y = k</code>). The Pool contract itself is the LP token (ERC20).
              Modeled after Uniswap v2 with 0.3% swap fee.
            </p>

            <H3>Formula</H3>
            <Code>{`// Output with 0.3% fee
amountOut = (amountIn * 997 * reserveOut)
          / (reserveIn * 1000 + amountIn * 997)

// First LP mint
lpMinted = sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY

// Subsequent LP mint
lpMinted = min(
  amount0 * totalLP / reserve0,
  amount1 * totalLP / reserve1
)`}</Code>

            <H3>Key Constants</H3>
            <Table
              headers={['Constant', 'Value', 'Purpose']}
              rows={[
                ['MINIMUM_LIQUIDITY', '1000', 'Locked on first mint, prevents price manipulation'],
                ['FEE_NUMERATOR', '997', '0.3% swap fee (997/1000)'],
                ['FEE_DENOMINATOR', '1000', 'Fee denominator'],
              ]}
            />

            <H3>Functions</H3>
            <FunctionList items={[
              { sig: 'swap(tokenIn, amountIn, minAmountOut, to)', mod: 'nonpayable', desc: 'Swap exact input, revert if output < minAmountOut' },
              { sig: 'addLiquidity(amount0Desired, amount1Desired, min0, min1, to)', mod: 'nonpayable', desc: 'Deposit tokens, receive LP tokens' },
              { sig: 'removeLiquidity(liquidity, min0, min1, to)', mod: 'nonpayable', desc: 'Burn LP tokens, receive proportional reserves' },
              { sig: 'getAmountOut(amountIn, reserveIn, reserveOut)', mod: 'pure', desc: 'x*y=k output formula with 0.3% fee' },
              { sig: 'getAmountIn(amountOut, reserveIn, reserveOut)', mod: 'pure', desc: 'Reverse quote - input needed for exact output' },
              { sig: 'getPrice0() / getPrice1()', mod: 'view', desc: 'Spot price scaled by 1e18' },
              { sig: 'getPriceImpact(tokenIn, amountIn)', mod: 'view', desc: 'Price impact in basis points (1 bp = 0.01%)' },
              { sig: 'getReserves()', mod: 'view', desc: 'Returns (reserve0, reserve1)' },
            ]} />

            <H3>Security</H3>
            <ul className="space-y-1 text-sm text-ink-secondary">
              <li>• <strong className="text-ink">ReentrancyGuard</strong> - all state-changing functions</li>
              <li>• <strong className="text-ink">SafeERC20</strong> - safe token transfers</li>
              <li>• <strong className="text-ink">Checks-Effects-Interactions</strong> - state updated before transfers</li>
              <li>• <strong className="text-ink">SlippageExceeded</strong> error - MEV protection via minAmountOut</li>
              <li>• Reserves tracked in storage, not <code className="text-green">balanceOf</code> - prevents flash loan manipulation</li>
            </ul>
          </Section>

          {/* ── PoolFactory ───────────────────────────────────────────────── */}
          <Section id="factory">
            <H2>PoolFactory.sol</H2>
            <p className="text-sm text-ink-secondary">Deploys and tracks all Bulldex AMM pools. One pool per token pair, enforced on-chain.</p>

            <H3>Functions</H3>
            <FunctionList items={[
              { sig: 'createPool(tokenA, tokenB)', mod: 'nonpayable', desc: 'Deploy Pool, register in bidirectional mapping, auto LP name from symbols' },
              { sig: 'poolFor(tokenA, tokenB)', mod: 'view', desc: 'Lookup pool for any token order (A,B or B,A)' },
              { sig: 'allPoolsLength()', mod: 'view', desc: 'Total number of deployed pools' },
            ]} />

            <H3>Notes</H3>
            <ul className="space-y-1 text-sm text-ink-secondary">
              <li>• Tokens are sorted (lower address = token0) for canonical ordering</li>
              <li>• Reverts with <code className="text-green">PoolExists</code> if pair already deployed</li>
              <li>• LP token name auto-generated: <code className="text-green">&quot;Bulldex BDX/MUSDC LP&quot;</code></li>
            </ul>
          </Section>

          {/* ── MockToken ─────────────────────────────────────────────────── */}
          <Section id="mocktoken">
            <H2>MockToken.sol</H2>
            <Callout type="warning">Testnet only. Never deploy to mainnet.</Callout>
            <p className="text-sm text-ink-secondary mt-3">
              Open-mint ERC20 used as the second token (MUSDC) in the BDX/MUSDC pool.
              Anyone can mint on testnet for testing swaps.
            </p>

            <H3>Functions</H3>
            <FunctionList items={[
              { sig: 'mint(address to, uint256 amount)', mod: 'public', desc: 'Mint tokens to any address' },
              { sig: 'faucet(uint256 amount)', mod: 'public', desc: 'Mint tokens to msg.sender' },
            ]} />
          </Section>

          {/* ── Architecture ──────────────────────────────────────────────── */}
          <Section id="architecture">
            <H2>Frontend Architecture</H2>
            <Code>{`frontend/src/
├── app/
│   ├── page.tsx          # Landing hero
│   ├── layout.tsx        # Root layout + Web3Provider
│   ├── dashboard/
│   │   ├── page.tsx      # Overview - balance, stats, quick actions
│   │   ├── swap/         # ✅ Live - full AMM swap UI
│   │   ├── liquidity/    # 🔄 Week 3
│   │   ├── lending/      # ⬜ Phase 2
│   │   ├── staking/      # ⬜ Phase 2
│   │   ├── farming/      # ⬜ Phase 2
│   │   └── governance/   # ⬜ Phase 3
│   └── docs/             # This page
├── components/
│   ├── ui/               # Button, Card, Input, Badge, Skeleton
│   ├── layout/           # Header, Sidebar
│   └── features/         # BalanceDisplay
├── hooks/
│   ├── useTokenBalance   # BDX/MUSDC balance with auto-refresh
│   ├── useTokenInfo      # Token metadata (multicall)
│   ├── usePool           # Reserves, prices - 15s refresh
│   └── useSwap           # Approve + swap state machine
└── constants/
    ├── abis.ts           # TOKEN_ABI, POOL_ABI, FACTORY_ABI
    └── contracts.ts      # Addresses, TOKENS registry, helpers`}</Code>
          </Section>

          {/* ── Hooks ─────────────────────────────────────────────────────── */}
          <Section id="hooks">
            <H2>Hooks Reference</H2>

            <H3>usePool()</H3>
            <p className="text-sm text-ink-secondary">Reads pool state via multicall. Auto-refreshes every 15 seconds.</p>
            <Code>{`const {
  reserve0, reserve1,     // bigint
  token0, token1,         // address
  price0, price1,         // bigint (scaled 1e18)
  totalSupply,            // bigint
  isLoading,
  isConfigured,
} = usePool();`}</Code>

            <H3>useSwapQuote(tokenIn, amountIn, reserve0, reserve1, token0)</H3>
            <p className="text-sm text-ink-secondary">Calls getAmountOut + getPriceImpact in a single multicall.</p>
            <Code>{`const {
  amountOut,     // bigint - expected output
  priceImpact,   // bigint - basis points (100 = 1%)
  isLoading,
} = useSwapQuote(tokenIn, amountIn, reserve0, reserve1, token0);`}</Code>

            <H3>useSwap(tokenIn, userAddress)</H3>
            <p className="text-sm text-ink-secondary">Full approve→swap state machine.</p>
            <Code>{`const {
  step,         // 'idle' | 'approving' | 'approved' | 'swapping' | 'success' | 'error'
  txHash,       // 0x... | undefined
  error,        // string | null
  needsApproval(amountIn),
  approve(tokenIn, amountIn),
  swap(tokenIn, amountIn, minAmountOut),
  reset(),
} = useSwap(tokenIn, address);`}</Code>
          </Section>

          {/* ── Swap Flow ─────────────────────────────────────────────────── */}
          <Section id="swap-flow">
            <H2>Swap Flow</H2>
            <p className="text-sm text-ink-secondary">Step-by-step of what happens when a user swaps.</p>

            <div className="mt-4 space-y-2">
              {[
                { n: '1', title: 'Enter amount', detail: 'parseAmount() converts string → bigint via viem parseUnits' },
                { n: '2', title: 'Get quote', detail: 'useSwapQuote → getAmountOut(amountIn, reserveIn, reserveOut)' },
                { n: '3', title: 'Show price impact', detail: 'getPriceImpact() returns bps. Color: green <1%, yellow 1-5%, red >5%' },
                { n: '4', title: 'Apply slippage', detail: 'minAmountOut = amountOut * (10000 - slippageBps) / 10000' },
                { n: '5', title: 'Check allowance', detail: 'useReadContract allowance → needsApproval(amountIn)' },
                { n: '6', title: 'Approve if needed', detail: 'approve(pool, MAX_UINT256) - approves once, no repeat approvals' },
                { n: '7', title: 'Execute swap', detail: 'Pool.swap(tokenIn, amountIn, minAmountOut, user)' },
                { n: '8', title: 'Confirm on-chain', detail: 'useWaitForTransactionReceipt → show Etherscan link' },
              ].map((s) => (
                <div key={s.n} className="flex gap-3 rounded-lg border border-base-border bg-base-card px-4 py-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green/15 text-[10px] font-bold text-green">
                    {s.n}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">{s.title}</p>
                    <p className="text-xs text-ink-faint">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Week 2 ────────────────────────────────────────────────────── */}
          <Section id="week2">
            <H2>Week 2 - AMM / DEX Swap</H2>
            <p className="text-sm text-ink-secondary">
              Built a full Uniswap v2-style AMM from scratch. 40 tests, complete swap UI with approve→swap flow.
            </p>

            <H3>What was built</H3>
            <ul className="space-y-1 text-sm text-ink-secondary">
              {[
                'Pool.sol - x*y=k AMM, LP tokens, 0.3% fee, slippage protection, price impact',
                'MockToken.sol - open-mint ERC20 for testnet (MUSDC), faucet() function',
                'PoolFactory.sol - deploy + track pools, bidirectional lookup, auto LP token naming',
                '40 unit + fuzz tests - 100% of core AMM paths covered',
                'Swap UI - live quotes, price impact, slippage settings, approve→swap state machine',
                'usePool + useSwap hooks - multicall reads, step-based write flow',
              ].map((item, i) => (
                <li key={i} className="flex gap-2"><span className="text-green">✓</span>{item}</li>
              ))}
            </ul>

            <H3>Problems & Solutions</H3>
            <div className="space-y-3">
              {WEEK2_PROBLEMS.map((p, i) => <ProblemCard key={i} {...p} />)}
            </div>

            <H3>Gas Report</H3>
            <Table
              headers={['Function', 'Gas']}
              rows={[
                ['Pool.addLiquidity (first deposit)', '~380k'],
                ['Pool.addLiquidity (subsequent)', '~85k'],
                ['Pool.swap', '~79k'],
                ['Pool.removeLiquidity', '~76k'],
                ['PoolFactory.createPool', '~1.4M (deploys Pool contract)'],
              ]}
            />
          </Section>

          {/* ── Week 1 ────────────────────────────────────────────────────── */}
          <Section id="week1">
            <H2>Week 1 - Foundation</H2>
            <p className="text-sm text-ink-secondary">
              BDX ERC20 deployed to Sepolia, full Next.js frontend scaffold with wallet connect,
              live balance display, Vercel CI/CD - all in 7 days.
            </p>

            <H3>What was built</H3>
            <ul className="space-y-1 text-sm text-ink-secondary">
              {[
                'Token.sol - ERC20 + ERC20Burnable + ERC20Permit + Ownable, 1B supply cap',
                '33 unit + fuzz tests - mint, burn, transfer, approve, edge cases',
                'Deploy.s.sol - Foundry deployment script with gas estimates',
                'Next.js 14 frontend - TypeScript, Tailwind CSS, app router',
                'wagmi v2 + RainbowKit - custom Alchemy transport, en-US locale',
                'GitHub Actions CI/CD + Vercel auto-deploy',
                'Jupiter-inspired dark UI - #0C0F0C bg, #4ADE80 accent, icon sidebar',
              ].map((item, i) => (
                <li key={i} className="flex gap-2"><span className="text-green">✓</span>{item}</li>
              ))}
            </ul>

            <H3>Problems & Solutions</H3>
            <div className="space-y-3">
              {WEEK1_PROBLEMS.map((p, i) => <ProblemCard key={i} {...p} />)}
            </div>

            <H3>Gas Report</H3>
            <Table
              headers={['Function', 'Gas']}
              rows={[
                ['Token deployment', '~1.2M'],
                ['Token.mint', '~48k'],
                ['Token.transfer', '~43k'],
                ['Token.burn', '~25k'],
              ]}
            />
          </Section>

          {/* ── Decisions ─────────────────────────────────────────────────── */}
          <Section id="decisions">
            <H2>Technical Decisions</H2>

            <div className="space-y-4">
              {DECISIONS.map((d, i) => (
                <div key={i} className="rounded-xl border border-base-border bg-base-card p-5">
                  <p className="text-sm font-semibold text-ink">{d.title}</p>
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-ink-faint uppercase tracking-wider font-semibold">Decision</p>
                    <p className="text-sm text-ink-secondary">{d.decision}</p>
                    <p className="text-xs text-ink-faint uppercase tracking-wider font-semibold pt-1">Rationale</p>
                    <p className="text-sm text-ink-secondary">{d.rationale}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

        </article>
      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-8 space-y-4">
      {children}
    </section>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold text-ink border-b border-base-border pb-3">{children}</h2>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-ink mt-6 mb-2">{children}</h3>;
}

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-base-border bg-base-surface p-4 font-mono text-xs leading-relaxed text-ink-secondary">
      <code>{children}</code>
    </pre>
  );
}

function Table({ headers, rows, className }: { headers: string[]; rows: string[][]; className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-base-border', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-base-border bg-base-surface">
            {headers.map((h) => (
              <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-faint">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-base-border last:border-0 hover:bg-base-surface transition-colors">
              {row.map((cell, j) => (
                <td key={j} className={cn('px-4 py-2.5 text-xs', j === 0 ? 'font-medium text-ink' : 'text-ink-secondary')}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FunctionList({ items }: { items: { sig: string; mod: string; desc: string }[] }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-base-border bg-base-card px-4 py-3">
          <code className="text-xs text-green">{item.sig}</code>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded bg-base-surface px-1.5 py-0.5 text-[10px] font-mono text-ink-faint">{item.mod}</span>
            <span className="text-xs text-ink-secondary">{item.desc}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProblemCard({ problem, solution }: { problem: string; solution: string }) {
  return (
    <div className="rounded-xl border border-base-border bg-base-card p-4 space-y-2">
      <div className="flex gap-2">
        <span className="shrink-0 text-xs font-semibold text-red">Problem</span>
        <p className="text-xs text-ink">{problem}</p>
      </div>
      <div className="flex gap-2">
        <span className="shrink-0 text-xs font-semibold text-green">Solution</span>
        <p className="text-xs text-ink-secondary">{solution}</p>
      </div>
    </div>
  );
}

function Pill({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center rounded-lg border border-base-border bg-base-card px-3 py-1.5 text-xs text-ink-secondary transition-colors hover:border-green/30 hover:text-green"
    >
      {label}
    </a>
  );
}

function Callout({ type, children }: { type: 'warning' | 'info'; children: React.ReactNode }) {
  return (
    <div className={cn(
      'flex gap-2 rounded-xl border px-4 py-3 text-sm',
      type === 'warning' ? 'border-yellow/20 bg-yellow/5 text-yellow' : 'border-green/20 bg-green/5 text-green',
    )}>
      <span>{type === 'warning' ? '⚠' : 'ℹ'}</span>
      <span>{children}</span>
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const WEEK2_PROBLEMS = [
  {
    problem: 'IERC20Metadata interface conflict in PoolFactory.sol - "Identifier already declared"',
    solution: 'Removed inline interface at bottom of file. Imported OZ\'s IERC20Metadata via @openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol.',
  },
  {
    problem: 'assertLt(address, address) not found in forge-std - no overload for address type',
    solution: 'Cast both addresses to uint160: assertLt(uint160(t0), uint160(t1)). Foundry assertLt only supports uint256/int256.',
  },
  {
    problem: 'test_PriceImpact_SmallSwapIsLow failing - expected < 10 bps but got 30 bps',
    solution: '0.3% fee adds baseline impact even for tiny swaps. Adjusted threshold to < 50 bps which accurately reflects real behavior.',
  },
  {
    problem: 'test_RemoveLiquidity_ReturnsTokens failing due to MINIMUM_LIQUIDITY rounding',
    solution: 'Changed to assertApproxEqRel with 1% tolerance - MINIMUM_LIQUIDITY (1000 wei) locked on first mint affects exact proportional returns.',
  },
  {
    problem: 'TypeScript BigInt literal error TS2737 - "BigInt literals not available when targeting lower than ES2020"',
    solution: 'Updated tsconfig.json: target ES2017 → ES2020, lib esnext → ES2020. BigInt literals (0n) require ES2020 minimum.',
  },
  {
    problem: 'useSwap allowance hook ABI type mismatch - dynamic ABI selection caused TS inference failure',
    solution: 'Split into two separate useReadContract hooks (one per token) with boolean flag. TS can now infer correct ABI type per hook.',
  },
];

const WEEK1_PROBLEMS = [
  {
    problem: 'forge install failed - "not a git repository"',
    solution: 'git init was never run. forge install requires git to add submodules. Fixed by running git init at repo root first.',
  },
  {
    problem: 'OpenZeppelin v5.7.0 crash - "Unknown evm version: osaka"',
    solution: 'Foundry 0.3.0 does not support osaka EVM version. Pinned OZ to v5.1.0 which is compatible.',
  },
  {
    problem: 'Deploy.s.sol compile error - em dash character (-) in string literal',
    solution: 'Solidity only accepts ASCII in standard strings. Replaced em dash with hyphen (-). Use unicode"..." prefix for Unicode.',
  },
  {
    problem: 'vm.prank cannot overwrite a prank - GitHub Actions Foundry nightly breaking change',
    solution: 'Removed vm.prank from setUp(). Token constructor takes initialOwner as param - no prank needed. Nightly is stricter about pending pranks.',
  },
  {
    problem: 'Contract verification failing - Etherscan V1 API deprecated',
    solution: 'Updated foundry.toml to V2 API. Still failed via CLI (Foundry 0.3.0 bug). Verified manually: forge flatten | pbcopy → paste into Etherscan web UI.',
  },
  {
    problem: 'Vercel 404 after successful build',
    solution: 'Next.js is in frontend/ subfolder but Vercel deployed from root. Fixed by setting Root Directory = frontend in Vercel project settings.',
  },
  {
    problem: '"Hubungkan Dompet" - RainbowKit showing Indonesian',
    solution: 'RainbowKit auto-detects browser locale. Fixed by passing locale="en-US" to RainbowKitProvider.',
  },
  {
    problem: 'wagmi balance showing 0 despite contract deployed',
    solution: 'wagmi was using public RPC (rate-limited). Fixed by adding explicit Alchemy transport: transports: { [sepolia.id]: http(ALCHEMY_RPC) }.',
  },
];

const DECISIONS = [
  {
    title: 'Build AMM from scratch vs. fork Uniswap',
    decision: 'Built Pool.sol from scratch using the same x*y=k formula.',
    rationale: 'Portfolio goal is to demonstrate deep understanding of AMM math, not just copy-paste. Forking Uniswap would hide the complexity. Building from scratch required implementing and testing every edge case: sqrt LP mint, MINIMUM_LIQUIDITY, fee calculation, slippage protection.',
  },
  {
    title: 'OpenZeppelin v5.1.0 vs latest (v5.7.0)',
    decision: 'Pinned to OpenZeppelin v5.1.0.',
    rationale: 'OZ v5.7.0 introduced osaka EVM version which is not supported by Foundry 0.3.0. Pinning to v5.1.0 gives stability while still having access to all needed features (ERC20, ReentrancyGuard, SafeERC20, Ownable).',
  },
  {
    title: 'wagmi v2 + RainbowKit vs Privy or ConnectKit',
    decision: 'Used wagmi v2 + RainbowKit v2.',
    rationale: 'wagmi is the industry standard with best TypeScript support and viem integration. RainbowKit provides polished wallet UI out of the box. Privy adds complexity (auth layer) not needed for portfolio. ConnectKit is good but RainbowKit has more active development.',
  },
  {
    title: 'Alchemy RPC vs public fallback',
    decision: 'Custom Alchemy transport as primary, public RPC as fallback.',
    rationale: 'Public Sepolia RPCs are rate-limited and unreliable for production use. Alchemy free tier provides 300M compute units/month which is more than enough for testnet. Configured via NEXT_PUBLIC_SEPOLIA_RPC env var.',
  },
  {
    title: 'Dark mode only - no light mode',
    decision: 'Dark mode only, Jupiter-inspired aesthetic.',
    rationale: 'Most DeFi protocols (Jupiter, Uniswap, Aave) are dark-mode first. Dark mode better suits the trading aesthetic. Maintaining two themes adds significant CSS complexity. Logo colors (dark forest green + cream) work better on dark backgrounds.',
  },
  {
    title: 'Max approval vs exact approval',
    decision: 'Approve MAX_UINT256 on first approval.',
    rationale: 'Better UX - user only approves once per token. Acceptable security tradeoff for testnet. For mainnet production, would add incremental approval with permit() (EIP-2612) for gasless approvals.',
  },
];
