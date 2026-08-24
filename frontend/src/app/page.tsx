import Link from 'next/link';
import { BullIcon } from '@/components/icons/BullIcon';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-bg-page">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        {/* Background glow */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,58,237,0.15) 0%, transparent 70%)',
          }}
        />

        {/* Bull icon */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-purple/10 ring-1 ring-brand-purple/30">
          <BullIcon className="h-10 w-10 text-brand-purple" />
        </div>

        {/* Tagline */}
        <h1 className="mb-4 max-w-2xl text-h1 font-bold leading-tight text-white md:text-hero">
          Trade Like a Bull.
          <br />
          <span className="text-brand-amber">Earn Like a Beast.</span>
        </h1>

        <p className="mb-10 max-w-lg text-base text-text-secondary">
          A decentralized trading protocol combining token swaps, liquidity provision, lending,
          staking, and yield farming — all in one powerful DeFi platform.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button size="lg" variant="primary">
              Launch App
            </Button>
          </Link>
          <Link href="/dashboard/swap">
            <Button size="lg" variant="secondary">
              Start Trading
            </Button>
          </Link>
        </div>

        {/* Network note */}
        <p className="mt-8 flex items-center gap-1.5 text-xs text-text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
          Live on Sepolia Testnet
        </p>
      </section>

      {/* ── Feature cards ─────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-layout px-6 pb-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="group rounded-card border border-border bg-bg-card p-5 transition-all duration-200 hover:border-brand-purple/40 hover:shadow-glow"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded bg-brand-purple/10 text-brand-purple transition-colors group-hover:bg-brand-purple/20">
                {f.icon}
              </div>
              <h3 className="mb-1 text-sm font-semibold text-white">{f.title}</h3>
              <p className="text-xs text-text-muted">{f.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

// ── Feature data ──────────────────────────────────────────────────────────────

const FEATURES = [
  {
    title: 'Swap',
    href: '/dashboard/swap',
    description: 'Swap tokens at the best rate with minimal slippage.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    ),
  },
  {
    title: 'Liquidity',
    href: '/dashboard/liquidity',
    description: 'Add liquidity to pools and earn swap fees.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
      </svg>
    ),
  },
  {
    title: 'Lending',
    href: '/dashboard/lending',
    description: 'Deposit collateral and borrow against your assets.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Staking',
    href: '/dashboard/staking',
    description: 'Stake BDX to earn protocol rewards.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
];
