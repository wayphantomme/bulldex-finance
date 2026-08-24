import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-base-bg text-ink">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="flex h-14 items-center justify-between border-b border-base-border px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative h-7 w-7 overflow-hidden rounded-lg">
            <Image src="/bulldex-logo.png" alt="Bulldex" fill className="object-cover" sizes="28px" priority />
          </div>
          <span className="text-sm font-semibold tracking-tight text-ink">
            Bulldex <span className="text-green">Finance</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/docs" className="text-xs text-ink-secondary transition-colors hover:text-ink">Docs</Link>
          <Link
            href="/dashboard/swap"
            className="rounded-lg bg-green px-3.5 py-1.5 text-xs font-semibold text-base-bg transition-opacity hover:opacity-90"
          >
            Launch App
          </Link>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-6 py-12">

        {/* ── Hero text ─────────────────────────────────────────────────── */}
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-green">
            DeFi Protocol | Building in Public
          </p>
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-ink md:text-6xl">
            The Full-Stack
            <br />
            <span className="text-green">DeFi Protocol</span>
            <br />
            on Ethereum.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink-secondary">
            Bulldex Finance is a vertically integrated DeFi protocol combining AMM swaps,
            liquidity provision, lending, staking, yield farming, and governance
            under one unified interface and token economy.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/dashboard/swap"
              className="rounded-xl bg-green px-6 py-3 text-sm font-semibold text-base-bg transition-opacity hover:opacity-90"
            >
              Launch App
            </Link>
            <Link
              href="/docs"
              className="rounded-xl border border-base-border bg-base-card px-6 py-3 text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
            >
              Read Docs
            </Link>
          </div>
        </div>

        {/* ── Bento grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">

          {/* Token economics — wide */}
          <div className="md:col-span-8 rounded-2xl border border-base-border bg-base-card p-6">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink-faint">BDX Token</p>
            <h2 className="mb-5 text-lg font-bold text-ink">Token Economics</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {TOKEN_STATS.map((s) => (
                <div key={s.label} className="rounded-xl bg-base-surface p-4">
                  <p className="text-[11px] text-ink-faint mb-1">{s.label}</p>
                  <p className="text-xl font-bold text-ink">{s.value}</p>
                  {s.sub && <p className="mt-0.5 text-[11px] text-ink-faint">{s.sub}</p>}
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-base-surface p-4">
              <p className="mb-3 text-xs font-semibold text-ink-faint uppercase tracking-wider">Token Distribution</p>
              <div className="space-y-2">
                {TOKEN_DIST.map((d) => (
                  <div key={d.label} className="flex items-center gap-3">
                    <div className="w-28 shrink-0 text-xs text-ink-secondary">{d.label}</div>
                    <div className="flex-1 h-2 rounded-full bg-base-elevated overflow-hidden">
                      <div
                        className="h-full rounded-full bg-green/70"
                        style={{ width: d.pct }}
                      />
                    </div>
                    <div className="w-10 text-right text-xs font-semibold text-ink">{d.pct}</div>
                    <div className="w-20 text-right text-xs text-ink-faint">{d.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Protocol stats — tall right */}
          <div className="md:col-span-4 rounded-2xl border border-base-border bg-base-card p-6 flex flex-col">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink-faint">Protocol</p>
            <h2 className="mb-5 text-lg font-bold text-ink">By the Numbers</h2>
            <div className="flex-1 space-y-3">
              {PROTOCOL_STATS.map((s) => (
                <div key={s.label} className="flex items-center justify-between rounded-xl bg-base-surface px-4 py-3">
                  <span className="text-xs text-ink-secondary">{s.label}</span>
                  <span className="text-sm font-bold text-green">{s.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-green/20 bg-green/5 p-4">
              <p className="text-xs text-green font-semibold mb-1">Open Source</p>
              <p className="text-xs text-ink-secondary leading-relaxed">
                All contracts verified. Full test suite. Building in public on GitHub.
              </p>
              <a
                href="https://github.com/wayphantomme/bulldex-finance"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-green hover:opacity-70 transition-opacity"
              >
                View on GitHub
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </a>
            </div>
          </div>

          {/* AMM feature */}
          <div className="md:col-span-4 rounded-2xl border border-base-border bg-base-card p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-green/10 text-green">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-green mb-1">Live Now</p>
            <h3 className="text-base font-bold text-ink mb-2">AMM Swap</h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Constant product x*y=k formula. 0.3% fee distributed to LPs.
              Slippage protection, price impact indicator, real-time quotes.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" />
              <span className="text-xs text-green font-medium">Deployed on Sepolia</span>
            </div>
          </div>

          {/* Roadmap */}
          <div className="md:col-span-8 rounded-2xl border border-base-border bg-base-card p-6">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink-faint">16-Week Build</p>
            <h2 className="mb-5 text-lg font-bold text-ink">Roadmap</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {ROADMAP.map((item) => (
                <div
                  key={item.title}
                  className={`rounded-xl p-3 border ${
                    item.status === 'done'
                      ? 'border-green/20 bg-green/5'
                      : item.status === 'active'
                      ? 'border-base-border-light bg-base-elevated'
                      : 'border-base-border bg-base-surface opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">{item.phase}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                      item.status === 'done' ? 'bg-green/15 text-green' :
                      item.status === 'active' ? 'bg-yellow/15 text-yellow' :
                      'bg-base-elevated text-ink-faint'
                    }`}>
                      {item.status === 'done' ? 'Done' : item.status === 'active' ? 'Active' : 'Upcoming'}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-ink">{item.title}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Why Bulldex */}
          <div className="md:col-span-5 rounded-2xl border border-base-border bg-base-card p-6">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink-faint">Value Proposition</p>
            <h2 className="mb-5 text-lg font-bold text-ink">Why Bulldex?</h2>
            <ul className="space-y-3">
              {WHY.map((w) => (
                <li key={w.title} className="flex gap-3">
                  <span className="mt-0.5 text-green text-sm font-bold shrink-0">{w.n}</span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{w.title}</p>
                    <p className="text-xs text-ink-secondary leading-relaxed">{w.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Vesting */}
          <div className="md:col-span-3 rounded-2xl border border-base-border bg-base-card p-6">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink-faint">Vesting</p>
            <h2 className="mb-4 text-lg font-bold text-ink">Token Lockup</h2>
            <div className="space-y-3">
              {VESTING.map((v) => (
                <div key={v.label} className="rounded-xl bg-base-surface p-3">
                  <p className="text-xs font-semibold text-ink">{v.label}</p>
                  <p className="text-[11px] text-ink-faint mt-0.5">{v.schedule}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tech stack */}
          <div className="md:col-span-4 rounded-2xl border border-base-border bg-base-card p-6">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink-faint">Built With</p>
            <h2 className="mb-5 text-lg font-bold text-ink">Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {STACK.map((s) => (
                <span
                  key={s}
                  className="rounded-lg border border-base-border bg-base-surface px-2.5 py-1 text-xs text-ink-secondary"
                >
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-base-surface p-3 text-center">
                <p className="text-lg font-bold text-green">73</p>
                <p className="text-[11px] text-ink-faint">Tests Passing</p>
              </div>
              <div className="rounded-xl bg-base-surface p-3 text-center">
                <p className="text-lg font-bold text-green">100%</p>
                <p className="text-[11px] text-ink-faint">Open Source</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="md:col-span-12 rounded-2xl border border-green/20 bg-green/5 p-8 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold text-ink mb-2">Ready to explore?</h2>
            <p className="text-sm text-ink-secondary mb-6 max-w-md">
              Swap is live on Sepolia. Liquidity, lending, staking, and farming coming in the next phases.
              Follow the build journey on GitHub and X.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/dashboard/swap"
                className="rounded-xl bg-green px-6 py-3 text-sm font-semibold text-base-bg transition-opacity hover:opacity-90"
              >
                Launch App
              </Link>
              <Link
                href="/docs"
                className="rounded-xl border border-base-border bg-base-bg px-6 py-3 text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
              >
                View Docs
              </Link>
              <a
                href="https://github.com/wayphantomme/bulldex-finance"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-base-border bg-base-bg px-6 py-3 text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
              >
                GitHub
              </a>
            </div>
          </div>

        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-base-border px-6 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-xs text-ink-faint">© 2026 Bulldex Finance</span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/wayphantomme/bulldex-finance"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-ink-faint transition-colors hover:text-ink"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
            <a
              href="https://x.com/wayphantomme"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="text-ink-faint transition-colors hover:text-ink"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TOKEN_STATS = [
  { label: 'Max Total Supply', value: '1,000,000,000', sub: 'BDX' },
  { label: 'Circulating Supply', value: '100,000,000', sub: '10% of max' },
  { label: 'Initial Price', value: '$0.002', sub: 'seed round target' },
  { label: 'Fully Diluted Val.', value: '$2,000,000', sub: 'at seed price' },
  { label: 'Circ. Market Cap', value: '$200,000', sub: 'at seed price' },
  { label: 'Token Standard', value: 'ERC-20', sub: 'EIP-2612 permit' },
];

const TOKEN_DIST = [
  { label: 'Community',    pct: '40%', amount: '400M BDX' },
  { label: 'Treasury',     pct: '25%', amount: '250M BDX' },
  { label: 'Team',         pct: '15%', amount: '150M BDX' },
  { label: 'Ecosystem',    pct: '12%', amount: '120M BDX' },
  { label: 'Seed Round',   pct: '8%',  amount: '80M BDX' },
];

const PROTOCOL_STATS = [
  { label: 'Contracts Deployed', value: '4' },
  { label: 'Test Coverage', value: '73 tests' },
  { label: 'Swap Fee', value: '0.30%' },
  { label: 'LP Fee Share', value: '100%' },
  { label: 'Initial Pool Liquidity', value: '10M BDX' },
  { label: 'Token Holders', value: '1 (deployer)' },
  { label: 'Network', value: 'Ethereum' },
  { label: 'Audit Status', value: 'Pre-audit' },
];

const ROADMAP = [
  { phase: 'Week 1-2',  title: 'Foundation + AMM',        desc: 'Token, swap, pool, 73 tests', status: 'done' },
  { phase: 'Week 3-4',  title: 'Liquidity UI',            desc: 'Add/remove LP, pool analytics', status: 'active' },
  { phase: 'Week 5-6',  title: 'Lending & Borrowing',     desc: 'Collateral, health factor, liquidation', status: 'upcoming' },
  { phase: 'Week 7-8',  title: 'Staking & Farming',       desc: 'BDX staking, yield farming, APY', status: 'upcoming' },
  { phase: 'Week 9-10', title: 'Vesting',                 desc: 'Linear/cliff schedules, team lockup', status: 'upcoming' },
  { phase: 'Week 11-12', title: 'Flash Loans + DAO',      desc: 'Governance, proposals, on-chain voting', status: 'upcoming' },
  { phase: 'Week 13-14', title: 'Gas Optimization',       desc: 'Storage packing, unchecked math', status: 'upcoming' },
  { phase: 'Week 15-16', title: 'Security + Mainnet',     desc: 'Audit prep, Slither, fuzz 10k runs', status: 'upcoming' },
];

const WHY = [
  {
    n: '01',
    title: 'Fully Integrated Protocol',
    desc: 'Swap, liquidity, lending, staking, farming, and governance in one unified system. No fragmentation across separate protocols.',
  },
  {
    n: '02',
    title: 'Built from Scratch',
    desc: 'Custom AMM implementation demonstrating deep understanding of DeFi math. Not a fork. Every line reviewed and tested.',
  },
  {
    n: '03',
    title: 'Sustainable Fee Model',
    desc: '0.3% swap fee flows entirely to LPs. Protocol revenue from lending spreads and staking. Treasury funded by ecosystem allocation.',
  },
  {
    n: '04',
    title: 'Transparent Development',
    desc: 'Open source, built in public. Every problem documented, every decision reasoned. Full audit trail on GitHub.',
  },
];

const VESTING = [
  { label: 'Team (15%)',    schedule: '12-month cliff, 36-month linear' },
  { label: 'Seed (8%)',     schedule: '6-month cliff, 18-month linear' },
  { label: 'Ecosystem (12%)', schedule: '3-month cliff, 24-month linear' },
  { label: 'Treasury (25%)', schedule: 'DAO-governed release' },
  { label: 'Community (40%)', schedule: 'Farming + staking rewards' },
];

const STACK = [
  'Solidity 0.8.24', 'Foundry', 'OpenZeppelin', 'Next.js 14',
  'TypeScript', 'wagmi v2', 'viem', 'RainbowKit',
  'Tailwind CSS', 'Alchemy', 'Vercel', 'Sepolia',
];
