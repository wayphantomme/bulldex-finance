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
            Bulldex <span className="text-ink-secondary font-normal">Finance</span>
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
                    ? 'text-green'
                    : 'text-ink-secondary hover:text-ink',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right — custom ConnectButton, no purple */}
        <div className="flex items-center gap-2">
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
                  })}
                  className="flex items-center gap-2"
                >
                  {!connected ? (
                    <button
                      onClick={openConnectModal}
                      className="h-8 rounded-lg bg-green px-3 text-xs font-semibold text-base-bg transition-opacity hover:opacity-90 active:opacity-80"
                    >
                      Connect Wallet
                    </button>
                  ) : (
                    <>
                      {/* Network pill */}
                      <button
                        onClick={openChainModal}
                        className="hidden items-center gap-1.5 rounded-lg border border-base-border bg-base-card px-2.5 py-1.5 text-xs text-ink-secondary transition-colors hover:border-base-border-light hover:text-ink sm:flex"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" />
                        {chain.name ?? 'Unknown'}
                      </button>

                      {/* Account button */}
                      <button
                        onClick={openAccountModal}
                        className="flex items-center gap-2 rounded-lg border border-base-border bg-base-card px-2.5 py-1.5 text-xs font-medium text-ink transition-colors hover:border-base-border-light hover:bg-base-elevated"
                      >
                        {account.ensAvatar ? (
                          <img
                            src={account.ensAvatar}
                            alt={account.displayName}
                            className="h-4 w-4 rounded-full"
                          />
                        ) : (
                          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-faint text-[9px] font-bold text-green">
                            {account.displayName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span>{account.displayName}</span>
                      </button>
                    </>
                  )}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </header>
  );
}
