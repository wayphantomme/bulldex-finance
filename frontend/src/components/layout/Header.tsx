'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';

const NAV = [
  { label: 'Swap',      href: '/dashboard/swap' },
  { label: 'Liquidity', href: '/dashboard/liquidity' },
  { label: 'Stake',     href: '/dashboard/staking' },
  { label: 'Farm',      href: '/dashboard/farming' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-base-border bg-base-bg/90 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-5">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <div className="relative h-7 w-7 overflow-hidden rounded-lg">
            <Image
              src="/bulldex-logo.png"
              alt="Bulldex Finance"
              fill
              className="object-cover"
              sizes="28px"
              priority
            />
          </div>
          <span className="text-sm font-semibold tracking-tight text-ink">
            Bulldex <span className="text-gradient-green">Finance</span>
          </span>
        </Link>

        {/* Center nav */}
        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main navigation">
          {NAV.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-brand-faint text-green'
                    : 'text-ink-secondary hover:bg-base-card hover:text-ink',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Sepolia pill */}
          <div className="hidden items-center gap-1.5 rounded-lg border border-base-border bg-base-card px-2.5 py-1.5 sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green" />
            <span className="text-xs text-ink-secondary">Sepolia</span>
          </div>

          <ConnectButton
            accountStatus="avatar"
            chainStatus="none"
            showBalance={false}
          />
        </div>
      </div>
    </header>
  );
}
