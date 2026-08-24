'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { BullIcon } from '@/components/icons/BullIcon';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg-page/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-layout items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <BullIcon className="h-8 w-8 text-brand-purple" />
          <span className="text-base font-bold tracking-tight text-white">
            Bulldex<span className="text-brand-amber">.</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          <NavLink href="/dashboard/swap">Swap</NavLink>
          <NavLink href="/dashboard/liquidity">Liquidity</NavLink>
          <NavLink href="/dashboard/staking">Stake</NavLink>
          <NavLink href="/dashboard/farming">Farm</NavLink>
        </nav>

        {/* Wallet */}
        <div className="flex items-center gap-3">
          <ConnectButton
            accountStatus="avatar"
            chainStatus="icon"
            showBalance={{ smallScreen: false, largeScreen: true }}
          />
        </div>
      </div>
    </header>
  );
}

// ── NavLink ────────────────────────────────────────────────────────────────────

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

function NavLink({ href, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="rounded px-3 py-2 text-sm font-medium text-text-secondary transition-colors duration-150 hover:bg-bg-card hover:text-white"
    >
      {children}
    </Link>
  );
}
