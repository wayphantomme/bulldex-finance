'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';
import { cn } from '@/utils/cn';
import {
  Search, Settings, Wallet, ChevronDown, ArrowRight,
  BarChart2, Layers, TrendingUp, Repeat2, Droplets,
  Landmark, ShieldCheck, Sprout, Timer, X,
} from 'lucide-react';
import { CommandPalette } from '@/components/ui/CommandPalette';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  liveDot?: 'green' | 'yellow' | 'blue' | 'orange';
}

interface MegaItem {
  label: string;
  desc: string;
  href: string;
  icon: React.ReactNode;
}

// ─── Nav config ───────────────────────────────────────────────────────────────

const PRIMARY_NAV: NavItem[] = [
  { label: 'Overview',  href: '/dashboard' },
  { label: 'Swap',      href: '/dashboard/swap' },
  { label: 'Liquidity', href: '/dashboard/liquidity' },
  { label: 'Lend',      href: '/dashboard/lending' },
  { label: 'Stake',     href: '/dashboard/staking' },
  { label: 'Farm',      href: '/dashboard/farming' },
];

const SECONDARY_NAV: NavItem[] = [
  { label: 'Analytics',  href: '/dashboard/analytics', liveDot: 'green' },
  { label: 'Vesting',    href: '/dashboard/vesting',   liveDot: 'yellow' },
  { label: 'Governance', href: '/dashboard/governance' },
];

const PRODUCTS_MEGA: MegaItem[] = [
  { label: 'Explorer',  desc: 'Browse and compare',        href: '/dashboard',           icon: <BarChart2   className="h-4 w-4" /> },
  { label: 'Analytics', desc: 'Protocol metrics & charts', href: '/dashboard/analytics', icon: <TrendingUp  className="h-4 w-4" /> },
  { label: 'Swap',      desc: 'Trade tokens on-chain',     href: '/dashboard/swap',      icon: <Repeat2     className="h-4 w-4" /> },
  { label: 'Liquidity', desc: 'Provide & earn fees',       href: '/dashboard/liquidity', icon: <Droplets    className="h-4 w-4" /> },
  { label: 'Lending',   desc: 'Borrow against collateral', href: '/dashboard/lending',   icon: <Landmark    className="h-4 w-4" /> },
  { label: 'Staking',   desc: 'Stake BDX, earn rewards',   href: '/dashboard/staking',   icon: <ShieldCheck className="h-4 w-4" /> },
  { label: 'Farming',   desc: 'Yield on LP tokens',        href: '/dashboard/farming',   icon: <Sprout      className="h-4 w-4" /> },
  { label: 'Vesting',   desc: 'Token release schedules',   href: '/dashboard/vesting',   icon: <Timer       className="h-4 w-4" /> },
];

// ─── Live dot ─────────────────────────────────────────────────────────────────

const DOT_COLORS: Record<string, string> = {
  green:  'bg-[#10b981]',
  yellow: 'bg-[#f59e0b]',
  blue:   'bg-[#3b82f6]',
  orange: 'bg-[#f97316]',
};

function LiveDot({ color }: { color: string }) {
  return (
    <span
      className={cn(
        'inline-block w-1.5 h-1.5 rounded-full ml-1 mb-0.5 shrink-0',
        DOT_COLORS[color] ?? 'bg-[#10b981]',
        'animate-live-pulse',
      )}
      aria-hidden="true"
    />
  );
}

// ─── Search bar ───────────────────────────────────────────────────────────────

function SearchBar({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="flex items-center gap-2 h-8 w-[200px] rounded-md border border-[#262626] bg-[#111111] px-3 text-[12px] text-[#525252] transition-colors hover:border-[#2e2e2e] hover:text-[#a3a3a3]"
      aria-label="Search — press ⌘K"
    >
      <Search className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1 text-left">Search...</span>
      <span className="hidden sm:flex items-center gap-0.5 rounded bg-[#1e1e1e] px-1.5 py-0.5 text-[10px] text-[#525252] font-mono">
        ⌘K
      </span>
    </button>
  );
}

// ─── Products mega dropdown ───────────────────────────────────────────────────

function ProductsDropdown({ open }: { open: boolean }) {
  if (!open) return null;
  return (
    <div className="absolute top-full left-0 mt-1 w-[560px] rounded-lg border border-[#262626] bg-[#111111] shadow-xl z-50 p-2">
      <div className="grid grid-cols-2 gap-1">
        {PRODUCTS_MEGA.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="group flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-[#161616]"
          >
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#262626] bg-[#161616] text-[#a3a3a3] group-hover:border-[#2e2e2e] group-hover:text-[#f5f5f5] transition-colors">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
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
  );
}

// ─── Wallet connector icon ────────────────────────────────────────────────────

function WalletIcon({ connectorName }: { connectorName?: string }) {
  const name = connectorName?.toLowerCase() ?? '';
  if (name.includes('metamask')) {
    return (
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 35 33" fill="none">
        <path d="M32.96 1L19.38 10.9l2.44-5.73L32.96 1z" fill="#E2761B" stroke="#E2761B" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2.04 1l13.46 9.99-2.32-5.82L2.04 1zM27.32 23.94l-3.53 5.4 7.55 2.08 2.18-7.36-6.2-.12zM1.06 24.06l2.16 7.36 7.55-2.08-3.52-5.4-6.19.12z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10.24 14.39l-2.1 3.17 7.5.34-.25-8.07-5.15 4.56zM24.76 14.39l-5.2-4.63-.17 8.14 7.5-.34-2.13-3.17zM10.77 29.34l4.5-2.19-3.88-3.03-.62 5.22zM19.73 27.15l4.51 2.19-.63-5.22-3.88 3.03z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M24.24 29.34l-4.51-2.19.36 2.95-.04 1.23 4.19-2zM10.77 29.34l4.18 1.99-.03-1.23.34-2.95-4.49 2.19z" fill="#D7C1B3" stroke="#D7C1B3" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 22.03l-3.72-1.1 2.63-1.2L15 22.03zM20 22.03l1.09-2.33 2.65 1.2L20 22.03z" fill="#233447" stroke="#233447" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10.77 29.34l.65-5.4-4.17.12 3.52 5.28zM23.59 23.94l.65 5.4 3.53-5.28-4.18-.12zM26.89 17.56l-7.5.34.7 3.87 1.09-2.33 2.65 1.2 3.06-3.08zM11.28 20.93l2.63-1.2 1.08 2.33.7-3.87-7.5-.34 3.09 3.08z" fill="#CD6116" stroke="#CD6116" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.14 17.56l3.18 6.2-.11-3.12-3.07-3.08zM23.77 20.93l-.13 3.08 3.18-6.2-3.05 3.12zM15.69 17.9l-.7 3.87.87 4.5.2-5.93-.37-2.44zM19.39 17.9l-.36 2.43.16 5.94.89-4.5-.69-3.87z" fill="#E4751F" stroke="#E4751F" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20.09 22.03l-.89 4.5.64.45 3.88-3.03.13-3.08-3.76 1.16zM11.28 20.93l.11 3.08 3.88 3.03.64-.45-.87-4.5-3.76-1.16z" fill="#F6851B" stroke="#F6851B" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20.15 31.33l.04-1.23-.33-.29h-4.72l-.3.29.03 1.23-4.18-1.99 1.46 1.2 2.96 2.05h4.8l2.97-2.05 1.46-1.2-4.19 1.99z" fill="#C0AD9E" stroke="#C0AD9E" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19.73 27.15l-.64-.45h-3.18l-.64.45-.34 2.95.3-.29h4.72l.33.29-.55-2.95z" fill="#161616" stroke="#161616" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M33.52 11.51l1.14-5.47L32.96 1 19.73 10.4l4.96 4.2 7.01 2.04 1.55-1.8-.67-.49 1.07-1-.82-.63 1.07-.82-.7-.54zM1 6.04l1.15 5.47-.72.54 1.08.82-.82.63 1.07 1-.67.49 1.54 1.8 7.01-2.04 4.96-4.2L2.04 1 1 6.04z" fill="#763D16" stroke="#763D16" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M32.03 16.64l-7.01-2.04 2.13 3.17-3.18 6.2 4.18-.05h6.24l-2.36-7.28zM10.24 14.39l-7.01 2.04-2.32 7.28h6.19l4.18.05-3.18-6.2 2.14-3.17zM19.39 17.9l.45-7.76 2.03-5.48h-8.74l2 5.48.47 7.76.16 2.45.01 5.92h3.18l.02-5.92.42-2.45z" fill="#F6851B" stroke="#F6851B" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (name.includes('coinbase')) {
    return (
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#0052FF"/>
        <path d="M16 6C10.477 6 6 10.477 6 16s4.477 10 10 10 10-4.477 10-10S21.523 6 16 6zm0 15.5c-3.038 0-5.5-2.462-5.5-5.5s2.462-5.5 5.5-5.5 5.5 2.462 5.5 5.5-2.462 5.5-5.5 5.5z" fill="white"/>
        <path d="M14 13.5h4v5h-4z" fill="white"/>
      </svg>
    );
  }
  if (name.includes('wallet')) {
    return (
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
      </svg>
    );
  }
  return <Wallet className="h-4 w-4 shrink-0" strokeWidth={2} />;
}

// ─── Mobile menu ─────────────────────────────────────────────────────────────

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const allNav = [...PRIMARY_NAV, ...SECONDARY_NAV];

  return (
    <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      {/* Panel */}
      <div className="absolute top-0 right-0 h-full w-80 sm:w-72 bg-[#111111] border-l border-[#262626] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-4 h-12 border-b border-[#262626]">
          <span className="text-[13px] font-medium text-[#f5f5f5]">Menu</span>
          <button onClick={onClose} aria-label="Close menu" className="p-1.5 text-[#525252] hover:text-[#f5f5f5] rounded-md hover:bg-[#1e1e1e] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-3" aria-label="Mobile navigation">
          {allNav.map((item) => {
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-2 h-11 rounded-md px-4 text-[14px] font-medium transition-colors mb-1',
                  isActive
                    ? 'bg-[#1a1a1a] text-[#f5f5f5]'
                    : 'text-[#a3a3a3] hover:bg-[#161616] hover:text-[#f5f5f5]',
                )}
              >
                {item.label}
                {item.liveDot && <LiveDot color={item.liveDot} />}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-[#262626]">
          <Link href="/docs" onClick={onClose}
            className="flex items-center gap-2 h-11 rounded-md px-4 text-[14px] font-medium text-[#a3a3a3] hover:bg-[#161616] hover:text-[#f5f5f5] transition-colors">
            Docs
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

export function Header() {
  const pathname = usePathname();
  const { connector } = useAccount();

  const [productsOpen, setProductsOpen] = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);

  // Inside the dashboard the sidebar handles all navigation — hide center nav
  const isDashboard = pathname.startsWith('/dashboard');

  const productsRef = useRef<HTMLDivElement>(null);

  // Close products dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (productsRef.current && !productsRef.current.contains(e.target as Node)) {
        setProductsOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setProductsOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setProductsOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  const isNavActive = useCallback((href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }, [pathname]);

  return (
    <>
      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <header
        role="banner"
        className="fixed top-0 left-0 right-0 z-50 h-12 border-b border-[#262626] bg-[#0d0d0d]"
      >
        <div className="flex h-full items-center justify-between px-4 gap-2">

          {/* Left: Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 transition-opacity hover:opacity-80"
            aria-label="Bulldex Finance — home"
          >
            <div className="relative h-7 w-7 overflow-hidden rounded-md">
              <Image
                src="/bdx-token.png"
                alt=""
                fill
                className="object-cover"
                sizes="28px"
                priority
              />
            </div>
            <span className="hidden sm:flex items-center text-[15px] font-semibold tracking-tight text-[#f5f5f5]">
              bulldex
              <span className="animate-cursor-blink text-[#10b981]">_</span>
            </span>
          </Link>

          {/* Center: Primary nav + separator + secondary nav
              Hidden inside /dashboard — sidebar handles all app navigation */}
          {!isDashboard && <nav
            className="hidden md:flex items-center gap-0.5 flex-1 px-4"
            aria-label="Main navigation"
          >
            {/* Products mega */}
            <div ref={productsRef} className="relative">
              <button
                onClick={() => setProductsOpen((v) => !v)}
                className={cn(
                  'flex items-center gap-1 h-8 rounded-md px-3 text-[14px] font-medium transition-colors',
                  productsOpen
                    ? 'bg-[#161616] text-[#f5f5f5]'
                    : 'text-[#a3a3a3] hover:text-[#f5f5f5]',
                )}
                aria-haspopup="true"
                aria-expanded={productsOpen}
              >
                Products
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 text-[#525252] transition-transform duration-150',
                    productsOpen && 'rotate-180',
                  )}
                />
              </button>
              <ProductsDropdown open={productsOpen} />
            </div>

            {/* Primary nav items */}
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'h-8 flex items-center rounded-md px-3 text-[14px] font-medium transition-colors',
                  isNavActive(item.href)
                    ? 'text-[#f5f5f5]'
                    : 'text-[#a3a3a3] hover:text-[#f5f5f5]',
                )}
                aria-current={isNavActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}

            {/* Separator */}
            <div className="mx-2 h-4 w-px bg-[#262626] shrink-0" aria-hidden="true" />

            {/* Secondary nav items with live dots */}
            {SECONDARY_NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'h-8 flex items-center gap-1 rounded-md px-3 text-[14px] font-medium transition-colors',
                  isNavActive(item.href)
                    ? 'text-[#f5f5f5]'
                    : 'text-[#a3a3a3] hover:text-[#f5f5f5]',
                )}
                aria-current={isNavActive(item.href) ? 'page' : undefined}
              >
                {item.label}
                {item.liveDot && <LiveDot color={item.liveDot} />}
              </Link>
            ))}
          </nav>}

          {/* Right: Search + wallet */}
          <div className="flex items-center gap-3 shrink-0">

            {/* Search */}
            <div className="hidden sm:block">
              <SearchBar onOpen={() => setSearchOpen(true)} />
            </div>

            {/* Wallet connect */}
            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
                const connected = mounted && account && chain;

                return (
                  <div className="flex items-center gap-2">
                    {connected ? (
                      <>
                        {/* Network pill */}
                        <button
                          onClick={openChainModal}
                          className="hidden sm:flex items-center gap-2 h-9 rounded-md border border-[#262626] bg-[#111111] px-3 text-[13px] text-[#a3a3a3] transition-colors hover:border-[#2e2e2e] hover:text-[#f5f5f5]"
                          aria-label={`Connected to ${chain.name ?? 'Unknown network'}`}
                        >
                          <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" aria-hidden="true" />
                          <span className="max-w-[100px] truncate font-medium">{chain.name ?? 'Unknown'}</span>
                        </button>

                        {/* Account button */}
                        <button
                          onClick={openAccountModal}
                          className="flex items-center gap-2.5 h-9 rounded-md border border-[#262626] bg-[#111111] px-3.5 text-[13px] font-medium text-[#f5f5f5] transition-colors hover:border-[#2e2e2e] hover:bg-[#161616]"
                          aria-label={`Account: ${account.displayName}`}
                        >
                          {account.ensAvatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={account.ensAvatar}
                              alt=""
                              className="h-5 w-5 rounded-full"
                            />
                          ) : (
                            <WalletIcon connectorName={connector?.name} />
                          )}
                          <span className="hidden sm:inline max-w-[110px] truncate">
                            {account.displayName}
                          </span>
                          <span className="sm:hidden font-mono text-[12px]">
                            {account.displayName.slice(0, 6)}
                          </span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={openConnectModal}
                        className="flex items-center h-9 rounded-md bg-[#10b981] px-5 text-[13px] font-semibold text-[#0d0d0d] transition-all hover:bg-[#059669] active:scale-[0.98]"
                      >
                        Connect Wallet
                      </button>
                    )}
                  </div>
                );
              }}
            </ConnectButton.Custom>

            {/* Settings */}
            {/* Token Terminal doesn't have settings in navbar — removed */}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="flex md:hidden h-9 w-9 items-center justify-center rounded-md border border-[#262626] text-[#525252] transition-colors hover:border-[#2e2e2e] hover:text-[#a3a3a3]"
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
            >
              <Layers className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile menu ─────────────────────────────────────────────────── */}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* ── Command Palette (⌘K) ─────────────────────────────────────── */}
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
