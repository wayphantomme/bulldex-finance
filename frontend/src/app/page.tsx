'use client';

import { ComponentType, SVGProps, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronDown, ArrowRight,
  BarChart2, TrendingUp, Repeat2, Droplets, Landmark, ShieldCheck, Sprout, Timer,
} from 'lucide-react';
import { AnnouncementPill } from '@/components/ui/AnnouncementPill';
import { MiniAreaChart }    from '@/components/charts/MiniAreaChart';
import {
  SwapRouteDiagram, ProtocolFlowDiagram, VolumeFlowDiagram,
  LiquidityPoolDiagram, LendingHealthDiagram, StakingLockDiagram,
  FarmingYieldDiagram, VestingTimelineDiagram,
} from '@/components/diagrams';

type DiagramComponent = ComponentType<SVGProps<SVGSVGElement> & { width?: number; height?: number }>;

// ─── Mega dropdown ────────────────────────────────────────────────────────────

const MEGA_ITEMS = [
  { label: 'Explorer',  desc: 'Browse and compare',        href: '/dashboard',           icon: <BarChart2   className="h-4 w-4" /> },
  { label: 'Analytics', desc: 'Protocol metrics & charts', href: '/dashboard/analytics', icon: <TrendingUp  className="h-4 w-4" /> },
  { label: 'Swap',      desc: 'Trade tokens on-chain',     href: '/dashboard/swap',      icon: <Repeat2     className="h-4 w-4" /> },
  { label: 'Liquidity', desc: 'Provide & earn fees',       href: '/dashboard/liquidity', icon: <Droplets    className="h-4 w-4" /> },
  { label: 'Lending',   desc: 'Borrow against collateral', href: '/dashboard/lending',   icon: <Landmark    className="h-4 w-4" /> },
  { label: 'Staking',   desc: 'Stake BDX, earn rewards',  href: '/dashboard/staking',   icon: <ShieldCheck className="h-4 w-4" /> },
  { label: 'Farming',   desc: 'Yield on LP tokens',        href: '/dashboard/farming',   icon: <Sprout      className="h-4 w-4" /> },
  { label: 'Vesting',   desc: 'Token release schedules',   href: '/dashboard/vesting',   icon: <Timer       className="h-4 w-4" /> },
];

function LandingProductsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onMouse);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onMouse); document.removeEventListener('keydown', onKey); };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-1 text-[13px] font-medium text-ink-secondary transition-colors hover:text-ink"
      >
        Products
        <ChevronDown className={`h-3.5 w-3.5 text-ink-muted transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[520px] rounded-lg border border-[#262626] bg-[#111111] p-2 shadow-xl">
          <div className="grid grid-cols-2 gap-1">
            {MEGA_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="group flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-[#161616]"
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#262626] bg-[#161616] text-[#a3a3a3] transition-colors group-hover:border-[#2e2e2e] group-hover:text-[#f5f5f5]">
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[#f5f5f5]">{item.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#a3a3a3] opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <span className="text-[11px] text-[#525252]">{item.desc}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Rotating headline word ───────────────────────────────────────────────────

const WORDS = ['understand', 'act on', 'trust', 'verify'];

function RotatingWord() {
  const [idx, setIdx]         = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx((i) => (i + 1) % WORDS.length); setVisible(true); }, 300);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="inline-block text-brand transition-all duration-300"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(8px)' }}
    >
      {WORDS[idx]}
    </span>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const MOCK_TVL_TREND = [2.1, 2.3, 2.2, 2.5, 2.4, 2.7, 2.6, 2.8, 2.85, 2.82, 2.88, 2.9];

const VALUE_PROPS: { title: string; desc: string; DiagramComponent: DiagramComponent }[] = [
  {
    title: 'Trustless by design',
    desc:  'Non-custodial smart contracts on Ethereum. Your keys, your funds. No intermediaries, no permission needed.',
    DiagramComponent: SwapRouteDiagram,
  },
  {
    title: 'Composable DeFi primitives',
    desc:  'Swap, lend, stake, and farm with a single token. All protocols work together seamlessly.',
    DiagramComponent: ProtocolFlowDiagram,
  },
  {
    title: 'Transparent and verifiable',
    desc:  'Open source contracts, real-time analytics via The Graph. Every transaction is auditable on-chain.',
    DiagramComponent: VolumeFlowDiagram,
  },
];

const PRODUCTS: { label: string; desc: string; href: string; tag: string; DiagramComponent: DiagramComponent }[] = [
  { label: 'Swap',      desc: 'Trade tokens instantly with automated market maker. 0.3% fee, zero slippage on small trades.',  href: '/dashboard/swap',      tag: 'AMM',     DiagramComponent: SwapRouteDiagram      },
  { label: 'Liquidity', desc: 'Provide liquidity to BDX pairs and earn trading fees. LP tokens are yield-bearing assets.',      href: '/dashboard/liquidity', tag: 'Pools',   DiagramComponent: LiquidityPoolDiagram  },
  { label: 'Lending',   desc: 'Over-collateralized loans with dynamic interest rates. Deposit, borrow, and earn yield.',        href: '/dashboard/lending',   tag: 'Credit',  DiagramComponent: LendingHealthDiagram  },
  { label: 'Staking',   desc: 'Lock BDX tokens for fixed periods to earn rewards. Higher lock duration means higher APR.',      href: '/dashboard/staking',   tag: 'Rewards', DiagramComponent: StakingLockDiagram    },
  { label: 'Farming',   desc: 'Stake LP tokens to earn BDX emissions. Dual rewards from fees and token incentives.',            href: '/dashboard/farming',   tag: 'Yield',   DiagramComponent: FarmingYieldDiagram   },
  { label: 'Vesting',   desc: 'Time-locked token distribution with cliff and linear release schedules. Fully transparent.',     href: '/dashboard/vesting',   tag: 'Unlock',  DiagramComponent: VestingTimelineDiagram },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg-base text-ink">

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 h-12 border-b border-[#1a1a1a] bg-bg-base/95 backdrop-blur-sm">
        <div className="mx-auto flex h-full max-w-[1100px] items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <div className="relative h-7 w-7 overflow-hidden rounded">
              <Image src="/bulldex-logo.png" alt="Bulldex" fill className="object-cover" sizes="28px" priority />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">
              bulldex<span className="animate-cursor-blink text-brand">_</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <LandingProductsDropdown />
            <a href="https://github.com/wayphantomme/bulldex-finance" target="_blank" rel="noopener noreferrer"
              className="text-[13px] font-medium text-ink-secondary transition-colors hover:text-ink">GitHub</a>
            <Link href="/docs"                className="text-[13px] font-medium text-ink-secondary transition-colors hover:text-ink">Docs</Link>
            <Link href="/dashboard/analytics" className="text-[13px] font-medium text-ink-secondary transition-colors hover:text-ink">Analytics</Link>
          </nav>

          <Link href="/dashboard"
            className="flex h-8 items-center rounded-md bg-brand px-4 text-[13px] font-semibold text-ink-inverted transition-colors hover:bg-brand-dark">
            Launch App
          </Link>
        </div>
      </header>

      <main>

        {/* ── HERO ───────────────────────────────────────────────────── */}
        <section className="border-b border-[#1a1a1a] px-6 py-14 lg:py-20">
          <div className="mx-auto max-w-[1100px]">

            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_460px]">

              {/* Left — headline */}
              <div>
                {/* Pill sits just above the headline */}
                <div className="mb-6">
                  <AnnouncementPill badge="Live" text="Bulldex protocol now live on Ethereum Sepolia" href="/dashboard/swap" />
                </div>

                <h1 className="mb-6 text-[52px] font-bold leading-[1.05] tracking-[-0.02em] sm:text-[64px] lg:text-[80px]">
                  <span className="text-ink">DeFi</span><br />
                  <span className="text-ink">protocol</span><br />
                  <span className="text-ink-secondary">you can</span><br />
                  <RotatingWord />
                </h1>

                <p className="mb-8 max-w-xl text-[15px] leading-relaxed text-ink-secondary lg:text-[16px]">
                  Full-stack decentralized finance on Ethereum. Swap, lend, stake, and farm
                  with transparent smart contracts and real-time analytics.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Primary CTA — arrow nudges right on hover */}
                  <Link href="/dashboard"
                    className="flex h-10 items-center rounded-md bg-brand px-6 text-[13px] font-semibold text-ink-inverted transition-colors hover:bg-brand-dark">
                    Launch App
                  </Link>
                  <Link href="/dashboard/analytics"
                    className="flex h-10 items-center rounded-md border border-border px-6 text-[13px] font-medium text-ink-secondary transition-colors hover:border-border-light hover:text-ink">
                    View Analytics
                  </Link>
                </div>
              </div>

              {/* Right — stat panels */}
              <div className="grid auto-rows-[140px] grid-cols-2 gap-3">

                {/* Panel 1: TVL + ProtocolFlow ghost */}
                <div className="group relative col-span-2 row-span-1 overflow-hidden rounded-lg border border-[#1a1a1a] bg-bg-surface p-5 transition-all duration-200 hover:border-[#2e2e2e]">
                  {/* Ghost SVG — dimmed, rises on hover */}
                  <div className="pointer-events-none absolute inset-0 flex items-end opacity-[0.10] transition-opacity duration-300 group-hover:opacity-[0.26]">
                    <ProtocolFlowDiagram width={460} className="w-full" />
                  </div>
                  {/* Bottom gradient — SVG fades into surface */}
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-bg-surface to-transparent" />

                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div>
                      <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-ink-muted">Protocol TVL</p>
                      <p className="font-mono text-[40px] font-bold tabular-nums leading-none text-ink">$2.9M</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="font-mono text-[13px] font-medium text-positive">+12.4%</span>
                        <span className="text-[11px] text-ink-muted">30d</span>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-10 opacity-20 transition-opacity duration-300 group-hover:opacity-35">
                      <MiniAreaChart data={MOCK_TVL_TREND} height={40} color="green" />
                    </div>
                  </div>
                </div>

                {/* Panel 2: Pools + LiquidityPool ghost */}
                <div className="group relative overflow-hidden rounded-lg border border-[#1a1a1a] bg-bg-surface p-4 transition-all duration-200 hover:border-[#2e2e2e]">
                  <div className="pointer-events-none absolute right-0 top-0 h-full opacity-[0.07] transition-opacity duration-300 group-hover:opacity-[0.22]">
                    <LiquidityPoolDiagram height={140} />
                  </div>
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-bg-surface to-transparent" />

                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div>
                      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-ink-muted">Active Pools</p>
                      <p className="font-mono text-[36px] font-bold leading-none text-ink">2</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-positive" />
                      <span className="text-[10px] font-medium text-ink-muted">BDX/MUSDC · BDX/WETH</span>
                    </div>
                  </div>
                </div>

                {/* Panel 3: Volume + VolumeFlow ghost */}
                <div className="group relative overflow-hidden rounded-lg border border-[#1a1a1a] bg-bg-surface p-4 transition-all duration-200 hover:border-[#2e2e2e]">
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.09] transition-opacity duration-300 group-hover:opacity-[0.24]">
                    <VolumeFlowDiagram width={140} height={100} />
                  </div>
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-bg-surface to-transparent" />

                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div>
                      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-ink-muted">24h Volume</p>
                      <p className="font-mono text-[28px] font-bold leading-none text-ink">$29K</p>
                    </div>
                    <span className="font-mono text-[13px] font-medium text-positive">+15.2%</span>
                  </div>
                </div>

                {/* Panel 4: Top Yields */}
                <div className="col-span-2 row-span-1 rounded-lg border border-[#1a1a1a] bg-bg-surface p-4 transition-all duration-200 hover:border-[#2e2e2e]">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">Top Yields</p>
                    <span className="flex items-center gap-1.5 font-mono text-[10px] font-medium text-brand">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
                      Live
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="font-medium text-ink">BDX/MUSDC LP</span>
                      <span className="font-mono font-semibold text-positive">24.5% APY</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="font-medium text-ink">BDX Staking 180d</span>
                      <span className="font-mono font-semibold text-positive">22.8% APR</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ── VALUE PROPOSITIONS ─────────────────────────────────────── */}
        <section className="border-b border-[#1a1a1a] px-6 py-20">
          <div className="mx-auto max-w-[1100px]">

            <div className="mb-12 text-center">
              <h2 className="mb-3 text-[32px] font-semibold tracking-tight text-ink">A complete DeFi protocol</h2>
              <p className="mx-auto max-w-2xl text-[15px] text-ink-secondary">
                Everything you need for decentralized finance in one place. Transparent, composable, and fully on-chain.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {VALUE_PROPS.map((vp) => {
                const D = vp.DiagramComponent;
                return (
                  <div key={vp.title}
                    className="group relative overflow-hidden rounded-lg border border-[#1a1a1a] bg-bg-surface p-6 transition-all duration-200 hover:border-[#2e2e2e]">

                    {/* Ghost SVG — bottom-right corner, redup, rises on hover */}
                    <div className="pointer-events-none absolute bottom-0 right-0 opacity-[0.18] transition-opacity duration-300 group-hover:opacity-[0.42]">
                      <D width={160} height={120} />
                    </div>
                    {/* Gradient fades — SVG tenggelam ke background */}
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bg-surface to-transparent" />
                    <div className="pointer-events-none absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-bg-surface to-transparent" />

                    {/* Content */}
                    <div className="relative z-10 pb-10">
                      <h3 className="mb-2 text-[15px] font-semibold text-ink">{vp.title}</h3>
                      <p className="text-[14px] leading-relaxed text-ink-secondary">{vp.desc}</p>
                    </div>

                    {/* Subtle emerald hover tint */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#10b981]/[0.03] via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── PRODUCTS GRID ──────────────────────────────────────────── */}
        <section className="border-b border-[#1a1a1a] px-6 py-20">
          <div className="mx-auto max-w-[1100px]">

            <div className="mb-10">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-ink-muted">Protocol Products</p>
              <h2 className="mb-3 text-[32px] font-semibold tracking-tight text-ink">Six DeFi primitives, one token</h2>
              <p className="max-w-2xl text-[15px] text-ink-secondary">
                Swap, provide liquidity, lend, borrow, stake, and farm. All powered by the BDX token on Ethereum.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PRODUCTS.map((p) => (
                <Link key={p.label} href={p.href}
                  className="group flex flex-col rounded-lg border border-[#1a1a1a] bg-[#111111] p-5 transition-colors hover:border-[#262626] hover:bg-[#161616]">

                  {/* Title row — label left, arrow right (hover-only) */}
                  <div className="mb-1.5 flex items-center justify-between">
                    <h3 className="text-[14px] font-semibold text-[#f5f5f5]">{p.label}</h3>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#a3a3a3] opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>

                  {/* Tag */}
                  <span className="mb-4 self-start rounded bg-[#1e1e1e] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#525252]">
                    {p.tag}
                  </span>

                  {/* Description */}
                  <p className="text-[13px] leading-relaxed text-[#737373]">{p.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────────── */}
        <section className="py-24">
          <div className="mx-auto max-w-[1100px] px-6 text-center">
            <h2 className="mb-4 text-[40px] font-semibold tracking-tight text-ink">Start using Bulldex</h2>
            <p className="mx-auto mb-10 max-w-xl text-[15px] text-ink-secondary">
              Connect your wallet and explore the full DeFi protocol. Live on Ethereum Sepolia testnet.
            </p>
            <Link href="/dashboard"
              className="inline-flex h-10 items-center rounded-md bg-brand px-6 text-[13px] font-semibold text-ink-inverted transition-colors hover:bg-brand-dark">
              Launch App
            </Link>
          </div>
        </section>

      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-[#1a1a1a] py-8">
        <div className="mx-auto max-w-[1100px] px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative h-5 w-5 overflow-hidden rounded">
                <Image src="/bulldex-logo.png" alt="Bulldex" fill className="object-cover" sizes="20px" />
              </div>
              <span className="text-[13px] text-ink-muted">© 2026 Bulldex Finance</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="https://github.com/wayphantomme/bulldex-finance" target="_blank" rel="noopener noreferrer"
                className="text-[13px] text-ink-muted transition-colors hover:text-ink">GitHub</a>
              <Link href="/dashboard/analytics"
                className="text-[13px] text-ink-muted transition-colors hover:text-ink">Analytics</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
