import Link from 'next/link';
import Image from 'next/image';
import { AnnouncementPill } from '@/components/ui/AnnouncementPill';
import { MiniAreaChart } from '@/components/charts/MiniAreaChart';

// ─── Static data ──────────────────────────────────────────────────────────────

// Mock chart data for hero panels
const MOCK_TVL_TREND = [2.1, 2.3, 2.2, 2.5, 2.4, 2.7, 2.6, 2.8, 2.85, 2.82, 2.88, 2.9];

const VALUE_PROPS = [
  {
    icon: '◆',
    title: 'Trustless by design',
    desc: 'Non-custodial smart contracts on Ethereum. Your keys, your funds. No intermediaries, no permission needed.',
  },
  {
    icon: '⚡',
    title: 'Composable DeFi primitives',
    desc: 'Swap, lend, stake, and farm with a single token. All protocols work together seamlessly.',
  },
  {
    icon: '◉',
    title: 'Transparent and verifiable',
    desc: 'Open source contracts, real-time analytics via The Graph. Every transaction is auditable on-chain.',
  },
];

const PRODUCTS = [
  {
    label: 'Swap',
    desc: 'Trade tokens instantly with automated market maker. 0.3% fee, zero slippage on small trades.',
    href: '/dashboard/swap',
    tag: 'AMM',
  },
  {
    label: 'Liquidity',
    desc: 'Provide liquidity to BDX pairs and earn trading fees. LP tokens are yield-bearing assets.',
    href: '/dashboard/liquidity',
    tag: 'Pools',
  },
  {
    label: 'Lending',
    desc: 'Over-collateralized loans with dynamic interest rates. Deposit, borrow, and earn yield.',
    href: '/dashboard/lending',
    tag: 'Credit',
  },
  {
    label: 'Staking',
    desc: 'Lock BDX tokens for fixed periods to earn rewards. Higher lock duration means higher APR.',
    href: '/dashboard/staking',
    tag: 'Rewards',
  },
  {
    label: 'Farming',
    desc: 'Stake LP tokens to earn BDX emissions. Dual rewards from fees and token incentives.',
    href: '/dashboard/farming',
    tag: 'Yield',
  },
  {
    label: 'Vesting',
    desc: 'Time-locked token distribution with cliff and linear release schedules. Fully transparent.',
    href: '/dashboard/vesting',
    tag: 'Unlock',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg-base text-ink">

      {/* ── Navbar ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 h-12 border-b border-[#1a1a1a] bg-bg-base/95 backdrop-blur-sm">
        <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <div className="relative h-7 w-7 overflow-hidden rounded">
              <Image src="/bulldex-logo.png" alt="Bulldex" fill className="object-cover" sizes="28px" priority />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">
              bulldex<span className="text-brand animate-cursor-blink">_</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/dashboard/analytics" className="text-[13px] text-ink-secondary transition-colors hover:text-ink font-medium">
              Analytics
            </Link>
            <a
              href="https://github.com/wayphantomme/bulldex-finance"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-ink-secondary transition-colors hover:text-ink font-medium"
            >
              GitHub
            </a>
          </nav>

          <Link
            href="/dashboard/swap"
            className="h-8 rounded-md bg-brand px-4 text-[13px] font-semibold text-ink-inverted transition-all hover:bg-brand-dark flex items-center"
          >
            Go to Explorer
          </Link>
        </div>
      </header>

      <main className="pb-0">

        {/* ── HERO SECTION ───────────────────────────────────────────── */}
        <section className="relative border-b border-[#1a1a1a] px-6 py-20 lg:py-32">
          <div className="mx-auto max-w-[1400px]">

            {/* Announcement pill */}
            <div className="mb-16 flex justify-center">
              <AnnouncementPill
                badge="Live"
                text="Bulldex protocol now live on Ethereum Sepolia"
                href="/dashboard/swap"
              />
            </div>

            {/* Hero grid — asymmetric layout (Token Terminal style) */}
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_580px] items-start">

              {/* Left — massive display text */}
              <div>
                <h1 className="text-[52px] sm:text-[64px] lg:text-[80px] font-bold leading-[1.05] tracking-[-0.02em] mb-6">
                  <span className="text-ink">DeFi</span><br />
                  <span className="text-ink">protocol</span><br />
                  <span className="text-ink-secondary">you can</span><br />
                  <span className="text-ink">understand</span>
                </h1>

                <p className="text-[15px] lg:text-[16px] text-ink-secondary leading-relaxed max-w-xl mb-8">
                  Full-stack decentralized finance on Ethereum. Swap, lend, stake, and farm with transparent smart contracts and real-time analytics.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/dashboard/swap"
                    className="h-10 rounded-md bg-brand px-6 text-[13px] font-semibold text-ink-inverted transition-colors hover:bg-brand-dark flex items-center"
                  >
                    Go to Explorer →
                  </Link>
                  <Link
                    href="/dashboard/analytics"
                    className="h-10 rounded-md border border-border px-6 text-[13px] font-medium text-ink-secondary transition-colors hover:border-border-light hover:text-ink flex items-center"
                  >
                    View Analytics
                  </Link>
                </div>
              </div>

              {/* Right — masonry grid panels */}
              <div className="grid grid-cols-2 gap-3 auto-rows-[140px]">
                
                {/* Panel 1: TVL big stat with trend (col-span-2) */}
                <div className="col-span-2 row-span-1 rounded-lg bg-bg-surface border border-[#1a1a1a] p-5 flex flex-col justify-between overflow-hidden relative group hover:border-border transition-all">
                  <div className="relative z-10">
                    <p className="text-[11px] text-ink-muted mb-2 uppercase tracking-wider font-medium">Protocol TVL</p>
                    <p className="font-mono text-[40px] font-bold text-ink tabular-nums leading-none mb-2">
                      $2.9M
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-positive font-mono font-medium">+12.4%</span>
                      <span className="text-[11px] text-ink-muted">30d</span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-14 opacity-20 group-hover:opacity-30 transition-opacity">
                    <MiniAreaChart data={MOCK_TVL_TREND} height={56} color="green" />
                  </div>
                </div>

                {/* Panel 2: Pool stats */}
                <div className="rounded-lg bg-bg-surface border border-[#1a1a1a] p-4 flex flex-col justify-between group hover:border-border transition-all">
                  <div>
                    <p className="text-[10px] text-ink-muted mb-2 uppercase tracking-wider font-medium">Active Pools</p>
                    <p className="font-mono text-[36px] font-bold text-ink leading-none">2</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse" />
                    <span className="text-[10px] text-ink-muted font-medium">BDX/MUSDC · BDX/WETH</span>
                  </div>
                </div>

                {/* Panel 3: 24h Volume */}
                <div className="rounded-lg bg-bg-surface border border-[#1a1a1a] p-4 flex flex-col justify-between group hover:border-border transition-all">
                  <div>
                    <p className="text-[10px] text-ink-muted mb-2 uppercase tracking-wider font-medium">24h Volume</p>
                    <p className="font-mono text-[28px] font-bold text-ink leading-none">$29K</p>
                  </div>
                  <span className="text-[13px] text-positive font-mono font-medium mt-2">+15.2%</span>
                </div>

                {/* Panel 4: Top pool APY (col-span-2) */}
                <div className="col-span-2 row-span-1 rounded-lg bg-bg-surface border border-[#1a1a1a] p-4 group hover:border-border transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] text-ink-muted uppercase tracking-wider font-medium">Top Yields</p>
                    <span className="text-[10px] text-brand font-mono font-medium">Live</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-ink font-medium">BDX/MUSDC LP</span>
                      <span className="text-positive font-mono font-semibold">24.5% APY</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-ink font-medium">BDX Staking 180d</span>
                      <span className="text-positive font-mono font-semibold">22.8% APR</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ── VALUE PROPOSITIONS (3-column feature cards) ────────── */}
        <section className="border-b border-[#1a1a1a] px-6 py-20">
          <div className="mx-auto max-w-[1400px]">
            
            <div className="mb-12 text-center">
              <h2 className="text-[32px] font-semibold text-ink tracking-tight mb-3">
                A complete DeFi protocol
              </h2>
              <p className="text-[15px] text-ink-secondary max-w-2xl mx-auto">
                Everything you need for decentralized finance in one place. Transparent, composable, and fully on-chain.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {VALUE_PROPS.map((vp) => (
                <div
                  key={vp.title}
                  className="rounded-lg border border-[#1a1a1a] bg-bg-surface p-6 hover:border-border transition-all"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-bg-elevated text-[24px]">
                    {vp.icon}
                  </div>
                  <h3 className="text-[15px] font-semibold text-ink mb-2">
                    {vp.title}
                  </h3>
                  <p className="text-[14px] text-ink-secondary leading-relaxed">
                    {vp.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRODUCTS GRID (2×3 Token Terminal style) ─────────────── */}
        <section className="border-b border-[#1a1a1a] px-6 py-20">
          <div className="mx-auto max-w-[1400px]">

            <div className="mb-10">
              <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted mb-3">Protocol Products</p>
              <h2 className="text-[32px] font-semibold text-ink tracking-tight mb-3">
                Six DeFi primitives, one token
              </h2>
              <p className="text-[15px] text-ink-secondary max-w-2xl">
                Swap, provide liquidity, lend, borrow, stake, and farm. All powered by the BDX token on Ethereum.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PRODUCTS.map((p) => (
                <Link
                  key={p.label}
                  href={p.href}
                  className="group rounded-lg border border-[#1a1a1a] bg-bg-surface p-5 hover:border-border transition-all"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-[15px] font-semibold text-ink group-hover:text-brand transition-colors">
                      {p.label}
                    </h3>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-ink-muted bg-bg-elevated px-2 py-1 rounded">
                      {p.tag}
                    </span>
                  </div>
                  <p className="text-[13px] text-ink-secondary leading-relaxed">
                    {p.desc}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA SECTION ─────────────────────────────────────────── */}
        <section className="py-24">
          <div className="mx-auto max-w-[1400px] px-6 text-center">
            <h2 className="text-[40px] font-semibold text-ink tracking-tight mb-4">
              Start using Bulldex
            </h2>
            <p className="text-[15px] text-ink-secondary mb-10 max-w-xl mx-auto">
              Connect your wallet and explore the full DeFi protocol. Live on Ethereum Sepolia testnet.
            </p>
            <Link
              href="/dashboard/swap"
              className="inline-flex h-10 items-center rounded-md bg-brand px-6 text-[13px] font-semibold text-ink-inverted transition-colors hover:bg-brand-dark"
            >
              Go to Explorer →
            </Link>
          </div>
        </section>
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="border-t border-[#1a1a1a] py-8">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative h-5 w-5 overflow-hidden rounded">
                <Image src="/bulldex-logo.png" alt="Bulldex" fill className="object-cover" sizes="20px" />
              </div>
              <span className="text-[13px] text-ink-muted">
                © 2026 Bulldex Finance
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/wayphantomme/bulldex-finance"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-ink-muted hover:text-ink transition-colors"
              >
                GitHub
              </a>
              <Link
                href="/dashboard/analytics"
                className="text-[13px] text-ink-muted hover:text-ink transition-colors"
              >
                Analytics
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
