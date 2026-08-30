import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/utils/cn';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-base-bg text-ink animate-fade-in">

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-base-border bg-base-bg/80 backdrop-blur-sm px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative h-7 w-7 overflow-hidden rounded-lg">
            <Image src="/bulldex-logo.png" alt="Bulldex" fill className="object-cover" sizes="28px" priority />
          </div>
          <span className="text-sm font-semibold tracking-tight text-ink">
            Bulldex <span className="text-ink-secondary font-normal">Finance</span>
          </span>
        </Link>
        <div className="flex items-center gap-5">
          <Link href="/docs"              className="text-xs text-ink-secondary transition-colors hover:text-ink">Docs</Link>
          <a href="https://github.com/wayphantomme/bulldex-finance" target="_blank" rel="noopener noreferrer"
            className="text-xs text-ink-secondary transition-colors hover:text-ink">GitHub</a>
          <Link href="/dashboard/analytics" className="text-xs text-ink-secondary transition-colors hover:text-ink">Analytics</Link>
          <Link href="/dashboard/swap"
            className="rounded-lg bg-brand px-3.5 py-1.5 text-xs font-semibold text-base-bg transition-all hover:bg-brand-dark active:scale-95">
            Launch App
          </Link>
        </div>
      </header>

      {/* ── HERO — full viewport ─────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-14 overflow-hidden">
        {/* Glow background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] rounded-full bg-brand/5 blur-[120px]" />
          <div className="absolute top-1/2 left-1/4 h-[300px] w-[300px] rounded-full bg-brand/3 blur-[80px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          {/* Label */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-brand">
              Live on Ethereum Sepolia
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-semibold leading-[1.1] tracking-tight text-ink lg:text-6xl xl:text-7xl">
            The Full-Stack<br />
            <span className="text-brand">DeFi Protocol</span><br />
            on Ethereum.
          </h1>
          <p className="mt-6 text-base leading-relaxed text-ink-secondary max-w-xl mx-auto">
            AMM swaps, liquidity pools, lending, staking, yield farming, and on-chain governance.
            One token. One protocol. Fully open source.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/dashboard/swap"
              className="rounded-xl bg-brand px-7 py-3 text-sm font-semibold text-base-bg transition-all hover:bg-brand-dark active:scale-[0.98]">
              Launch App
            </Link>
            <Link href="/docs"
              className="rounded-xl border border-base-border px-7 py-3 text-sm font-medium text-ink-secondary transition-colors hover:text-ink hover:border-base-border-light">
              Read Docs
            </Link>
          </div>

          {/* Live stats strip */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            {PROTOCOL_STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-lg font-semibold text-green tabular-nums">{s.value}</p>
                <p className="text-[11px] text-ink-faint">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-ink-faint animate-pulse-slow">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── TRACTION BAR ─────────────────────────────────────────────── */}
      <section className="border-y border-base-border bg-base-surface/50 backdrop-blur-sm py-4">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-brand">Live Traction — Sepolia Testnet</span>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              {TRACTION.map((t) => (
                <div key={t.label} className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-ink tabular-nums">{t.value}</span>
                  <span className="text-xs text-ink-faint">{t.label}</span>
                </div>
              ))}
              <Link href="/dashboard/analytics"
                className="text-[11px] text-brand hover:opacity-80 transition-opacity font-semibold">
                View Analytics →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 py-16 space-y-4">

        {/* ── FEATURES GRID ────────────────────────────────────────────── */}
        <div>
          <div className="text-center mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint mb-2">Protocol</p>
            <h2 className="text-2xl font-semibold text-ink tracking-tight">Everything in one protocol</h2>
            <p className="mt-2 text-sm text-ink-secondary">Seven core DeFi primitives, one token, zero fragmentation.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title}
                className={cn(
                  'rounded-2xl border p-6 flex flex-col gap-4 transition-all duration-200',
                  f.live
                    ? 'border-brand/20 bg-brand/5 hover:border-brand/30 hover:bg-brand/8'
                    : 'border-base-border bg-base-card hover:border-base-border-light',
                )}>
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl',
                  f.live ? 'bg-brand/15' : 'bg-base-elevated',
                )}>
                  <span className={f.live ? 'text-brand' : 'text-ink-secondary'}>{f.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className="text-sm font-semibold text-ink">{f.title}</p>
                    {f.live
                      ? <span className="rounded-md bg-green/10 px-1.5 py-0.5 text-[9px] font-bold text-green uppercase tracking-wide">Live</span>
                      : <span className="rounded-md bg-base-elevated px-1.5 py-0.5 text-[9px] font-bold text-ink-faint uppercase tracking-wide">{f.phase}</span>
                    }
                  </div>
                  <p className="text-xs text-ink-secondary leading-relaxed">{f.desc}</p>
                </div>
                {f.live && (
                  <Link href={f.href}
                    className="text-xs font-semibold text-brand hover:opacity-80 transition-opacity">
                    Try now →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── WHY BULLDEX ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-3">

          {/* Why — 7 cols */}
          <div className="col-span-12 lg:col-span-7 rounded-2xl border border-base-border bg-base-card p-6">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint mb-1">Value Prop</p>
            <h2 className="text-sm font-semibold text-ink mb-6">Why Bulldex?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {WHY.map((w) => (
                <div key={w.n} className="flex gap-3">
                  <span className="text-xs font-semibold text-brand shrink-0 w-5 mt-0.5">{w.n}</span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{w.title}</p>
                    <p className="text-xs text-ink-secondary leading-relaxed mt-1">{w.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech stack — 5 cols */}
          <div className="col-span-12 lg:col-span-5 rounded-2xl border border-base-border bg-base-card p-6 flex flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint mb-1">Built With</p>
            <h2 className="text-sm font-semibold text-ink mb-5">Tech Stack</h2>
            <div className="flex flex-wrap gap-1.5 mb-6">
              {STACK.map((s) => (
                <span key={s} className="rounded-lg border border-base-border bg-base-surface px-2.5 py-1 text-[11px] text-ink-secondary">
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-auto grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-base-surface p-3 text-center">
                <p className="text-2xl font-semibold text-green">111</p>
                <p className="text-[10px] text-ink-faint mt-0.5">Tests passing</p>
              </div>
              <div className="rounded-xl bg-base-surface p-3 text-center">
                <p className="text-2xl font-semibold text-green">9</p>
                <p className="text-[10px] text-ink-faint mt-0.5">Contracts</p>
              </div>
              <div className="rounded-xl bg-base-surface p-3 text-center">
                <p className="text-2xl font-semibold text-green">0%</p>
                <p className="text-[10px] text-ink-faint mt-0.5">Failures</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── TOKENOMICS ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-3">

          {/* Token stats */}
          <div className="col-span-12 lg:col-span-8 rounded-2xl border border-base-border bg-base-card p-6">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint mb-1">BDX Token</p>
            <h2 className="text-sm font-semibold text-ink mb-5">Token Economics</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mb-5">
              {TOKEN_STATS.map((s) => (
                <div key={s.label} className="rounded-xl bg-base-surface p-3">
                  <p className="text-[10px] text-ink-faint mb-1 leading-tight">{s.label}</p>
                  <p className="text-sm font-semibold text-ink truncate">{s.value}</p>
                  {s.sub && <p className="text-[10px] text-ink-faint mt-0.5">{s.sub}</p>}
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
                      <div className="h-full rounded-full bg-brand/50" style={{ width: d.pct }} />
                    </div>
                    <div className="w-8 text-right text-xs font-semibold text-ink">{d.pct}</div>
                    <div className="w-20 text-right text-[11px] text-ink-faint">{d.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vesting */}
          <div className="col-span-12 lg:col-span-4 rounded-2xl border border-base-border bg-base-card p-6 flex flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint mb-1">Tokenomics</p>
            <h2 className="text-sm font-semibold text-ink mb-4">Vesting Schedule</h2>
            <div className="flex-1 space-y-2">
              {VESTING.map((v) => (
                <div key={v.label} className="rounded-xl bg-base-surface px-4 py-3">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-xs font-semibold text-ink">{v.label}</p>
                    <p className="text-xs font-semibold text-brand">{v.pct}</p>
                  </div>
                  <p className="text-[11px] text-ink-faint">{v.schedule}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── LIVE TRACTION ────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-brand/20 bg-brand/5 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" />
                <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">Live Traction</p>
              </div>
              <p className="text-sm font-semibold text-ink">On-chain activity on Sepolia testnet</p>
              <p className="text-xs text-ink-secondary mt-0.5">All data verifiable on Etherscan. No fake numbers.</p>
            </div>
            <div className="flex flex-wrap gap-6 shrink-0">
              {TRACTION.map((t) => (
                <div key={t.label} className="text-center min-w-[60px]">
                  <p className="text-2xl font-semibold text-ink tabular-nums">{t.value}</p>
                  <p className="text-[11px] text-ink-faint">{t.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="https://sepolia.etherscan.io/address/0xfac1b95480e87ccef0e995612ceca23f3ddb0197"
              target="_blank" rel="noopener noreferrer"
              className="rounded-lg border border-base-border bg-base-card px-3 py-1.5 text-[11px] text-ink-secondary hover:text-ink transition-colors">
              BDX/MUSDC Pool ↗
            </a>
            <a href="https://sepolia.etherscan.io/address/0x3cA1cE14fd2fE5A449F67CFA63F342acfB8860e4"
              target="_blank" rel="noopener noreferrer"
              className="rounded-lg border border-base-border bg-base-card px-3 py-1.5 text-[11px] text-ink-secondary hover:text-ink transition-colors">
              BDX/WETH Pool ↗
            </a>
            <Link href="/dashboard/analytics"
              className="rounded-lg border border-brand/30 bg-brand/10 px-3 py-1.5 text-[11px] text-brand hover:opacity-80 transition-opacity font-semibold">
              View Analytics →
            </Link>
          </div>
        </div>

        {/* ── ROADMAP — horizontal ─────────────────────────────────────── */}
        <div className="rounded-2xl border border-base-border bg-base-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint mb-1">16-Week Build</p>
              <h2 className="text-sm font-semibold text-ink">Roadmap</h2>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-ink-faint">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green" />Done</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-yellow animate-pulse" />Active</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-base-border-light" />Upcoming</span>
            </div>
          </div>

          {/* Horizontal connector line + nodes */}
          <div className="relative">
            {/* Track line */}
            <div className="absolute top-3 left-0 right-0 h-px bg-base-border" />

            <div className="grid grid-cols-4 gap-3 sm:grid-cols-8 relative">
              {ROADMAP.map((item, idx) => (
                <div key={item.title} className="flex flex-col items-center gap-3">
                  {/* Node */}
                  <div className={cn(
                    'relative z-10 h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0',
                    item.status === 'done'
                      ? 'border-green bg-green/20'
                      : item.status === 'active'
                      ? 'border-yellow bg-yellow/10'
                      : 'border-base-border bg-base-bg',
                  )}>
                    {item.status === 'done' && (
                      <svg className="h-3 w-3 text-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {item.status === 'active' && (
                      <span className="h-2 w-2 rounded-full bg-yellow animate-pulse" />
                    )}
                    {item.status === 'upcoming' && (
                      <span className="text-[9px] font-bold text-ink-faint">{idx + 1}</span>
                    )}
                  </div>
                  {/* Label */}
                  <div className="text-center">
                    <p className="text-[9px] text-ink-faint uppercase tracking-wide">{item.phase}</p>
                    <p className={cn(
                      'text-[11px] font-semibold leading-tight mt-0.5',
                      item.status === 'done' ? 'text-green' :
                      item.status === 'active' ? 'text-yellow' : 'text-ink-faint',
                    )}>
                      {item.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── OPEN SOURCE CARD ──────────────────────────────────────────── */}
        <div className="rounded-2xl border border-base-border bg-base-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-base-elevated">
              <svg className="h-5 w-5 text-ink-secondary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Open Source</p>
              <p className="text-xs text-ink-secondary mt-0.5">
                111 tests passing · 9 deployed contracts · Built in public on GitHub
              </p>
            </div>
          </div>
          <a href="https://github.com/wayphantomme/bulldex-finance" target="_blank" rel="noopener noreferrer"
            className="shrink-0 rounded-xl border border-base-border px-5 py-2.5 text-sm font-medium text-ink-secondary hover:text-ink hover:border-base-border-light transition-colors">
            View on GitHub ↗
          </a>
        </div>

        {/* ── CTA FOOTER ───────────────────────────────────────────────── */}
        <div className="relative rounded-2xl border border-brand/20 bg-brand/5 overflow-hidden px-8 py-10 text-center">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[500px] rounded-full bg-brand/8 blur-[80px]" />
          </div>
          <div className="relative z-10">
            <p className="text-2xl font-semibold text-ink mb-2 tracking-tight">Ready to explore?</p>
            <p className="text-sm text-ink-secondary mb-7 max-w-md mx-auto">
              Swap, lend, stake, farm, and vest live on Sepolia. DAO governance deploying next.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/dashboard/swap"
                className="rounded-xl bg-brand px-7 py-3 text-sm font-semibold text-base-bg transition-all hover:bg-brand-dark active:scale-[0.98]">
                Launch App
              </Link>
              <Link href="/docs"
                className="rounded-xl border border-base-border px-6 py-3 text-sm font-medium text-ink-secondary transition-colors hover:text-ink">
                Docs
              </Link>
              <a href="https://github.com/wayphantomme/bulldex-finance" target="_blank" rel="noopener noreferrer"
                className="rounded-xl border border-base-border px-6 py-3 text-sm font-medium text-ink-secondary transition-colors hover:text-ink">
                GitHub
              </a>
            </div>
          </div>
        </div>

      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-base-border px-8 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-xs text-ink-faint">© 2026 Bulldex Finance · Sepolia Testnet</span>
          <div className="flex items-center gap-4">
            <a href="https://github.com/wayphantomme/bulldex-finance" target="_blank" rel="noopener noreferrer"
              aria-label="GitHub" className="text-ink-faint transition-colors hover:text-ink">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
            <a href="https://x.com/wayphantomme" target="_blank" rel="noopener noreferrer"
              aria-label="X" className="text-ink-faint transition-colors hover:text-ink">
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

const FEATURES = [
  {
    title: 'AMM Swap',
    desc: 'x*y=k formula with 0.3% fee to LPs. Real-time quotes, price impact, slippage protection.',
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" /></svg>,
    live: true, phase: 'Live', href: '/dashboard/swap',
  },
  {
    title: 'Liquidity Pools',
    desc: 'Provide liquidity to BDX/MUSDC or BDX/WETH pools. Earn 100% of swap fees as LP.',
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zm9.75-9.75c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v16.5c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 0112.75 21V3.375zm-7.5 9a1.125 1.125 0 011.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v7.5c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 016 19.875v-7.5z" /></svg>,
    live: true, phase: 'Live', href: '/dashboard/liquidity',
  },
  {
    title: 'Lending',
    desc: 'Deposit BDX as collateral, borrow MUSDC at ~5% APR. LTV 75%, health factor monitoring, liquidations.',
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>,
    live: true, phase: 'Live', href: '/dashboard/lending',
  },
  {
    title: 'Staking',
    desc: 'Stake BDX to earn BDX rewards. Optional 30/90/180-day lock for 1.2x/1.5x/2x multipliers.',
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
    live: true, phase: 'Live', href: '/dashboard/staking',
  },
  {
    title: 'Yield Farming',
    desc: 'Stake LP tokens in MasterChef pools to earn BDX emissions on top of swap fees.',
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
    live: true, phase: 'Live', href: '/dashboard/farming',
  },
  {
    title: 'Vesting',
    desc: 'Cliff + linear vesting schedules for team, ecosystem, and seed. Beneficiary-triggered release.',
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    live: true, phase: 'Live', href: '/dashboard/vesting',
  },
  {
    title: 'DAO Governance',
    desc: 'On-chain voting via BDXGovernor + Timelock. Propose and vote on protocol upgrades, treasury, and parameters.',
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></svg>,
    live: false, phase: 'Phase 3', href: '/dashboard/governance',
  },
  {
    title: 'Analytics',
    desc: 'Protocol-wide stats, swap volume, pool TVL, leaderboard, and on-chain activity via The Graph.',
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
    live: true, phase: 'Live', href: '/dashboard/analytics',
  },
];

const TOKEN_STATS = [
  { label: 'Max Total Supply',   value: '1B BDX',   sub: 'hard cap' },
  { label: 'Circulating Supply', value: '100M BDX', sub: '10% of max' },
  { label: 'Seed Price',         value: '$0.05',     sub: 'per BDX' },
  { label: 'Fully Diluted Val.', value: '$50M',      sub: 'at seed price' },
  { label: 'Seed Round Target',  value: '$1M',       sub: '20M BDX / 2%' },
  { label: 'Token Standard',     value: 'ERC-20',    sub: 'EIP-2612 + ERC20Votes' },
];

const TOKEN_DIST = [
  { label: 'Community',  pct: '40%', amount: '400M BDX' },
  { label: 'Treasury',   pct: '25%', amount: '250M BDX' },
  { label: 'Team',       pct: '15%', amount: '150M BDX' },
  { label: 'Ecosystem',  pct: '16%', amount: '160M BDX' },
  { label: 'Seed Round', pct: '4%',  amount: '40M BDX'  },
];

const PROTOCOL_STATS = [
  { label: 'Contracts deployed', value: '9' },
  { label: 'Tests passing',      value: '111 / 111' },
  { label: 'Swap fee',           value: '0.30%' },
  { label: 'Fee to LPs',         value: '100%' },
  { label: 'Pool liquidity',     value: '10M BDX' },
  { label: 'Audit status',       value: 'Pre-audit' },
];

const VESTING = [
  { label: 'Team (15%)',      pct: '150M', schedule: '12-month cliff, 36-month linear' },
  { label: 'Seed (4%)',       pct: '40M',  schedule: '6-month cliff, 18-month linear' },
  { label: 'Ecosystem (16%)', pct: '160M', schedule: '3-month cliff, 24-month linear' },
  { label: 'Treasury (25%)',  pct: '250M', schedule: 'DAO-governed release' },
  { label: 'Community (40%)', pct: '400M', schedule: 'Farming + staking rewards' },
];

const ROADMAP = [
  { phase: 'Wk 1-2',   title: 'Token + AMM',        status: 'done'     },
  { phase: 'Wk 3-4',   title: 'Liquidity UI',        status: 'done'     },
  { phase: 'Wk 5-6',   title: 'Lending',             status: 'done'     },
  { phase: 'Wk 7-8',   title: 'Staking + Farming',   status: 'done'     },
  { phase: 'Wk 9-10',  title: 'Vesting',             status: 'done'     },
  { phase: 'Wk 11-12', title: 'DAO Governance',       status: 'active'   },
  { phase: 'Wk 13-14', title: 'Gas + Router',         status: 'upcoming' },
  { phase: 'Wk 15-16', title: 'Security + Mainnet',   status: 'upcoming' },
];

const WHY = [
  { n: '01', title: 'Fully Integrated Protocol',
    desc: 'Swap, liquidity, lending, staking, farming, governance in one system. No fragmentation.' },
  { n: '02', title: 'Built from Scratch',
    desc: 'Custom AMM, not a fork. Deep DeFi math understanding. Every line reviewed and tested.' },
  { n: '03', title: 'Sustainable Fee Model',
    desc: '0.3% swap fee flows 100% to LPs. Protocol revenue from lending spreads and staking.' },
  { n: '04', title: 'Transparent Development',
    desc: 'Open source, built in public. Every problem documented on GitHub and /docs.' },
];

const TRACTION = [
  { value: '9',       label: 'Contracts' },
  { value: '111',     label: 'Tests passing' },
  { value: '2',       label: 'Active pools' },
  { value: '30M BDX', label: 'Pool liquidity' },
];

const STACK = [
  'Solidity 0.8.24', 'Foundry', 'OpenZeppelin v5',
  'Next.js 14', 'TypeScript', 'Tailwind CSS',
  'wagmi v2', 'viem', 'RainbowKit',
  'The Graph', 'Alchemy', 'Vercel', 'Sepolia',
];
