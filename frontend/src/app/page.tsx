import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-base-bg text-ink">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="flex h-14 items-center justify-between border-b border-base-border px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative h-7 w-7 overflow-hidden rounded-lg">
            <Image src="/bulldex-logo.png" alt="Bulldex" fill className="object-cover" sizes="28px" priority />
          </div>
          <span className="text-sm font-semibold tracking-tight text-ink">
            Bulldex <span className="text-green">Finance</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/docs" className="text-xs text-ink-secondary transition-colors hover:text-ink">Docs</Link>
          <Link href="/dashboard/swap" className="rounded-lg bg-green px-3.5 py-1.5 text-xs font-semibold text-base-bg transition-opacity hover:opacity-90">
            Launch App
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16 space-y-3">

        {/* ── Row 1: Hero + Protocol Stats ───────────────────────────────── */}
        <div className="grid grid-cols-12 gap-3">

          {/* Hero — 7 cols */}
          <div className="col-span-12 md:col-span-7 rounded-2xl border border-base-border bg-base-card px-8 py-10 flex flex-col justify-between min-h-[280px]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-green mb-4">
                DeFi Protocol &nbsp;·&nbsp; Building in Public
              </p>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-ink lg:text-5xl">
                The Full-Stack<br />
                <span className="text-green">DeFi Protocol</span><br />
                on Ethereum.
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-ink-secondary max-w-sm">
                AMM swaps, liquidity pools, lending, staking, yield farming,
                and on-chain governance — one token, one protocol.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-2.5">
              <Link href="/dashboard/swap" className="rounded-xl bg-green px-5 py-2.5 text-sm font-semibold text-base-bg transition-opacity hover:opacity-90">
                Launch App
              </Link>
              <Link href="/docs" className="rounded-xl border border-base-border px-5 py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:text-ink">
                Read Docs
              </Link>
            </div>
          </div>

          {/* Protocol stats — 5 cols */}
          <div className="col-span-12 md:col-span-5 rounded-2xl border border-base-border bg-base-card p-6 flex flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint mb-1">Protocol</p>
            <p className="text-base font-bold text-ink mb-4">By the Numbers</p>
            <div className="flex-1 grid grid-cols-2 gap-2">
              {PROTOCOL_STATS.map((s) => (
                <div key={s.label} className="rounded-xl bg-base-surface px-3 py-2.5">
                  <p className="text-[10px] text-ink-faint">{s.label}</p>
                  <p className="text-sm font-bold text-green mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>
            <a
              href="https://github.com/wayphantomme/bulldex-finance"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-between rounded-xl border border-green/20 bg-green/5 px-4 py-3"
            >
              <div>
                <p className="text-xs font-semibold text-green">Open Source</p>
                <p className="text-[11px] text-ink-faint mt-0.5">73 tests · verified contracts · GitHub</p>
              </div>
              <svg className="h-4 w-4 text-green shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </a>
          </div>
        </div>

        {/* ── Row 2: Token Economics ──────────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-3">

          {/* Token stats — 8 cols */}
          <div className="col-span-12 md:col-span-8 rounded-2xl border border-base-border bg-base-card p-6">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint mb-1">BDX Token</p>
            <p className="text-base font-bold text-ink mb-5">Token Economics</p>
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              {TOKEN_STATS.map((s) => (
                <div key={s.label} className="rounded-xl bg-base-surface p-4">
                  <p className="text-[10px] text-ink-faint mb-1">{s.label}</p>
                  <p className="text-lg font-bold text-ink">{s.value}</p>
                  {s.sub && <p className="text-[11px] text-ink-faint mt-0.5">{s.sub}</p>}
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-base-surface p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint mb-3">
                Token Distribution
              </p>
              <div className="space-y-2.5">
                {TOKEN_DIST.map((d) => (
                  <div key={d.label} className="flex items-center gap-3">
                    <div className="w-24 shrink-0 text-xs text-ink-secondary">{d.label}</div>
                    <div className="flex-1 h-1.5 rounded-full bg-base-elevated overflow-hidden">
                      <div className="h-full rounded-full bg-green/60" style={{ width: d.pct }} />
                    </div>
                    <div className="w-8 text-right text-xs font-semibold text-ink">{d.pct}</div>
                    <div className="w-20 text-right text-[11px] text-ink-faint">{d.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vesting — 4 cols */}
          <div className="col-span-12 md:col-span-4 rounded-2xl border border-base-border bg-base-card p-6 flex flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint mb-1">Tokenomics</p>
            <p className="text-base font-bold text-ink mb-4">Vesting Schedule</p>
            <div className="flex-1 space-y-2">
              {VESTING.map((v) => (
                <div key={v.label} className="rounded-xl bg-base-surface px-4 py-3">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-xs font-semibold text-ink">{v.label}</p>
                    <p className="text-xs font-bold text-green">{v.pct}</p>
                  </div>
                  <p className="text-[11px] text-ink-faint">{v.schedule}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 3: Roadmap ──────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-base-border bg-base-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint mb-1">16-Week Build</p>
              <p className="text-base font-bold text-ink">Roadmap</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-ink-faint">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green" />Done</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-yellow" />Active</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-base-elevated border border-base-border" />Upcoming</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
            {ROADMAP.map((item) => (
              <div
                key={item.title}
                className={`rounded-xl p-3.5 border ${
                  item.status === 'done'
                    ? 'border-green/25 bg-green/5'
                    : item.status === 'active'
                    ? 'border-base-border-light bg-base-elevated'
                    : 'border-base-border bg-base-surface opacity-50'
                }`}
              >
                <p className="text-[10px] font-semibold text-ink-faint mb-2">{item.phase}</p>
                <p className="text-xs font-semibold text-ink leading-snug">{item.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Row 4: AMM Live + Why + Stack ──────────────────────────────── */}
        <div className="grid grid-cols-12 gap-3">

          {/* AMM live — 3 cols */}
          <div className="col-span-12 md:col-span-3 rounded-2xl border border-green/20 bg-green/5 p-6 flex flex-col justify-between">
            <div>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-green/15 text-green">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" />
                <span className="text-[11px] font-semibold text-green uppercase tracking-wider">Live Now</span>
              </div>
              <p className="text-base font-bold text-ink mb-2">AMM Swap</p>
              <p className="text-xs text-ink-secondary leading-relaxed">
                x*y=k formula. 0.3% fee to LPs. Real-time quotes, price impact, slippage protection.
              </p>
            </div>
            <Link
              href="/dashboard/swap"
              className="mt-6 block text-center rounded-xl bg-green py-2.5 text-xs font-semibold text-base-bg transition-opacity hover:opacity-90"
            >
              Try Swap
            </Link>
          </div>

          {/* Why Bulldex — 5 cols */}
          <div className="col-span-12 md:col-span-5 rounded-2xl border border-base-border bg-base-card p-6">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint mb-1">Value Prop</p>
            <p className="text-base font-bold text-ink mb-5">Why Bulldex?</p>
            <div className="space-y-4">
              {WHY.map((w) => (
                <div key={w.n} className="flex gap-3">
                  <span className="text-xs font-bold text-green/60 shrink-0 w-5">{w.n}</span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{w.title}</p>
                    <p className="text-xs text-ink-secondary leading-relaxed mt-0.5">{w.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech stack — 4 cols */}
          <div className="col-span-12 md:col-span-4 rounded-2xl border border-base-border bg-base-card p-6 flex flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint mb-1">Built With</p>
            <p className="text-base font-bold text-ink mb-5">Tech Stack</p>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {STACK.map((s) => (
                <span key={s} className="rounded-lg border border-base-border bg-base-surface px-2.5 py-1 text-[11px] text-ink-secondary">
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-auto grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-base-surface p-3 text-center">
                <p className="text-xl font-bold text-green">73</p>
                <p className="text-[10px] text-ink-faint mt-0.5">Tests</p>
              </div>
              <div className="rounded-xl bg-base-surface p-3 text-center">
                <p className="text-xl font-bold text-green">4</p>
                <p className="text-[10px] text-ink-faint mt-0.5">Contracts</p>
              </div>
              <div className="rounded-xl bg-base-surface p-3 text-center">
                <p className="text-xl font-bold text-green">0%</p>
                <p className="text-[10px] text-ink-faint mt-0.5">Failures</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 5: CTA banner ───────────────────────────────────────────── */}
        <div className="rounded-2xl border border-base-border bg-base-card px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-lg font-bold text-ink">Ready to explore?</p>
            <p className="text-sm text-ink-secondary mt-1 max-w-lg">
              Swap live on Sepolia. Liquidity, lending, staking, and farming ship in the next phases.
              Follow the build on GitHub and X.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/dashboard/swap" className="rounded-xl bg-green px-5 py-2.5 text-sm font-semibold text-base-bg transition-opacity hover:opacity-90">
              Launch App
            </Link>
            <Link href="/docs" className="rounded-xl border border-base-border px-5 py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:text-ink">
              Docs
            </Link>
            <a
              href="https://github.com/wayphantomme/bulldex-finance"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-base-border px-5 py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
            >
              GitHub
            </a>
          </div>
        </div>

      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-base-border px-8 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-xs text-ink-faint">© 2026 Bulldex Finance</span>
          <div className="flex items-center gap-4">
            <a href="https://github.com/wayphantomme/bulldex-finance" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-ink-faint transition-colors hover:text-ink">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
            <a href="https://x.com/wayphantomme" target="_blank" rel="noopener noreferrer" aria-label="X" className="text-ink-faint transition-colors hover:text-ink">
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
  { label: 'Max Total Supply',   value: '1,000,000,000', sub: 'BDX' },
  { label: 'Circulating Supply', value: '100,000,000',   sub: '10% of max' },
  { label: 'Seed Price Target',  value: '$0.002',        sub: 'per BDX' },
  { label: 'Fully Diluted Val.', value: '$2,000,000',    sub: 'at seed price' },
  { label: 'Circ. Market Cap',   value: '$200,000',      sub: 'at seed price' },
  { label: 'Token Standard',     value: 'ERC-20',        sub: 'EIP-2612 permit' },
];

const TOKEN_DIST = [
  { label: 'Community',   pct: '40%', amount: '400M BDX' },
  { label: 'Treasury',    pct: '25%', amount: '250M BDX' },
  { label: 'Team',        pct: '15%', amount: '150M BDX' },
  { label: 'Ecosystem',   pct: '12%', amount: '120M BDX' },
  { label: 'Seed Round',  pct: '8%',  amount: '80M BDX'  },
];

const PROTOCOL_STATS = [
  { label: 'Contracts Deployed', value: '4' },
  { label: 'Tests Passing',      value: '73 / 73' },
  { label: 'Swap Fee',           value: '0.30%' },
  { label: 'Fee to LPs',         value: '100%' },
  { label: 'Init. Pool Liq.',    value: '10M BDX' },
  { label: 'Audit Status',       value: 'Pre-audit' },
];

const VESTING = [
  { label: 'Team (15%)',      pct: '150M', schedule: '12-month cliff, 36-month linear' },
  { label: 'Seed (8%)',       pct: '80M',  schedule: '6-month cliff, 18-month linear' },
  { label: 'Ecosystem (12%)', pct: '120M', schedule: '3-month cliff, 24-month linear' },
  { label: 'Treasury (25%)',  pct: '250M', schedule: 'DAO-governed release' },
  { label: 'Community (40%)', pct: '400M', schedule: 'Farming + staking rewards' },
];

const ROADMAP = [
  { phase: 'Wk 1-2',  title: 'Token + AMM',          status: 'done' },
  { phase: 'Wk 3-4',  title: 'Liquidity UI',          status: 'active' },
  { phase: 'Wk 5-6',  title: 'Lending',               status: 'upcoming' },
  { phase: 'Wk 7-8',  title: 'Staking + Farming',     status: 'upcoming' },
  { phase: 'Wk 9-10', title: 'Vesting',               status: 'upcoming' },
  { phase: 'Wk 11-12', title: 'Flash + DAO',          status: 'upcoming' },
  { phase: 'Wk 13-14', title: 'Gas Optimization',     status: 'upcoming' },
  { phase: 'Wk 15-16', title: 'Security + Mainnet',   status: 'upcoming' },
];

const WHY = [
  {
    n: '01',
    title: 'Fully Integrated Protocol',
    desc: 'Swap, liquidity, lending, staking, farming, governance in one system. No fragmentation.',
  },
  {
    n: '02',
    title: 'Built from Scratch',
    desc: 'Custom AMM, not a fork. Deep DeFi math understanding. Every line reviewed and tested.',
  },
  {
    n: '03',
    title: 'Sustainable Fee Model',
    desc: '0.3% swap fee flows to LPs. Protocol revenue from lending spreads and staking.',
  },
  {
    n: '04',
    title: 'Transparent Development',
    desc: 'Open source, built in public. Every problem documented on GitHub and /docs.',
  },
];

const STACK = [
  'Solidity 0.8.24', 'Foundry', 'OpenZeppelin v5',
  'Next.js 14', 'TypeScript', 'Tailwind CSS',
  'wagmi v2', 'viem', 'RainbowKit',
  'Alchemy', 'Vercel', 'Sepolia',
];
