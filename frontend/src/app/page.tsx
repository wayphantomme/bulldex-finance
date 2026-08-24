import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-base-bg">

      {/* ── Minimal top bar ────────────────────────────────────────────── */}
      <header className="flex h-14 items-center justify-between border-b border-base-border px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative h-7 w-7 overflow-hidden rounded-lg">
            <Image src="/bulldex-logo.png" alt="Bulldex" fill className="object-cover" sizes="28px" priority />
          </div>
          <span className="text-sm font-semibold tracking-tight text-ink">
            Bulldex<span className="text-gradient-green">.</span>
          </span>
        </Link>
        <Link href="/dashboard">
          <Button size="sm" variant="ghost">Launch App</Button>
        </Link>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-28 text-center">

        {/* Ambient blobs */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-green/5 blur-3xl" />
          <div className="absolute left-1/4 bottom-1/4 h-64 w-64 rounded-full bg-brand-sage/10 blur-3xl" />
          <div className="absolute right-1/4 top-1/3 h-48 w-48 rounded-full bg-cream/5 blur-3xl" />
        </div>

        {/* Live badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-pill border border-green/20 bg-green/8 px-4 py-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green" />
          <span className="text-xs font-medium text-green">Live on Sepolia Testnet</span>
        </div>

        {/* Logo hero */}
        <div className="mb-8 animate-float">
          <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-3xl shadow-glow-lg ring-1 ring-green/20">
            <Image src="/bulldex-logo.png" alt="Bulldex" fill className="object-cover" sizes="96px" priority />
          </div>
        </div>

        {/* Headline */}
        <h1 className="mb-5 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-ink md:text-6xl">
          Trade Like a Bull.
          <br />
          <span className="text-gradient-green">Earn Like a Beast.</span>
        </h1>

        <p className="mb-10 max-w-md text-sm leading-relaxed text-ink-secondary">
          Decentralized swaps, liquidity, lending, staking, and yield farming — 
          all in one powerful DeFi protocol built on Ethereum.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/dashboard/swap">
            <Button size="lg">Start Trading</Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="ghost">View Dashboard</Button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-xl font-bold text-ink">{s.value}</p>
              <p className="text-xs text-ink-secondary">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature tiles ──────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-4xl px-6 pb-24">
        <p className="mb-5 text-center text-xs font-medium uppercase tracking-widest text-ink-faint">
          Everything you need
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="group relative overflow-hidden rounded-xl border border-base-border bg-base-card p-5 transition-all duration-200 hover:border-green/25 hover:bg-base-elevated hover:shadow-glow-sm"
            >
              {/* Icon */}
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-faint text-green transition-colors group-hover:bg-green/15">
                {f.icon}
              </div>
              <p className="mb-1 text-sm font-semibold text-ink">{f.title}</p>
              <p className="text-xs leading-relaxed text-ink-secondary">{f.desc}</p>

              {/* Arrow */}
              <div className="absolute right-4 top-4 text-ink-faint opacity-0 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0.5">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-base-border px-6 py-5">
        <div className="mx-auto flex max-w-4xl items-center justify-between text-xs text-ink-faint">
          <span>© 2026 Bulldex Finance</span>
          <a
            href="https://twitter.com/wayphantomme"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-secondary transition-colors hover:text-green"
          >
            @wayphantomme
          </a>
        </div>
      </footer>
    </div>
  );
}

const STATS = [
  { value: '100M',   label: 'BDX Minted' },
  { value: 'Sepolia', label: 'Network' },
  { value: '33/33',  label: 'Tests Passing' },
  { value: 'v0.1',   label: 'Version' },
];

const FEATURES = [
  {
    title: 'Swap',
    href: '/dashboard/swap',
    desc: 'Exchange tokens at the best rate with minimal slippage.',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    ),
  },
  {
    title: 'Liquidity',
    href: '/dashboard/liquidity',
    desc: 'Deposit into pools and earn swap fees passively.',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" /><path d="M8 12h8M12 8v8" />
      </svg>
    ),
  },
  {
    title: 'Lending',
    href: '/dashboard/lending',
    desc: 'Deposit collateral and borrow against your assets.',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 9v1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Staking',
    href: '/dashboard/staking',
    desc: 'Stake BDX tokens and earn protocol rewards.',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];
