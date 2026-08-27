'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Wallet } from 'lucide-react';
import { cn } from '@/utils/cn';

const NAV = [
  { label: 'Swap',       href: '/dashboard/swap' },
  { label: 'Liquidity',  href: '/dashboard/liquidity' },
  { label: 'Stake',      href: '/dashboard/staking' },
  { label: 'Farm',       href: '/dashboard/farming' },
  { label: 'Analytics',  href: '/dashboard/analytics' },
  { label: 'Faucet',     href: '/dashboard/faucet' },
  { label: 'Docs',       href: '/docs' },
];

// ─── Wallet connector icons ───────────────────────────────────────────────────

function WalletIcon({ connectorName }: { connectorName?: string }) {
  const name = connectorName?.toLowerCase() ?? '';

  if (name.includes('metamask')) {
    return (
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 40 40" fill="none">
        <path d="M36.3 3L22.1 13.6l2.6-6.1L36.3 3z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.7 3l14.1 10.7-2.5-6.1L3.7 3z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M31.1 27.6l-3.8 5.8 8.1 2.2 2.3-7.9-6.6-.1zM2.4 27.7l2.3 7.9 8.1-2.2-3.8-5.8-6.6.1z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.3 18.6L10 22.3l7.9.4-.3-8.5-5.3 4.4zM27.7 18.6l-5.4-4.5-.2 8.6 7.9-.4-2.3-3.7z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.8 33.4l4.8-2.3-4.1-3.2-.7 5.5zM22.4 31.1l4.8 2.3-.7-5.5-4.1 3.2z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M27.2 33.4l-4.8-2.3.4 3.3-.1 2.9 4.5-5.9zM12.8 33.4l4.5 5.9-.1-2.9.4-3.3-4.8 2.3z" fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17.3 24.9l-4-1.2 2.8-1.3 1.2 2.5zM22.7 24.9l1.2-2.5 2.8 1.3-4 1.2z" fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.8 33.4l.7-5.8-4.5.1 3.8 5.7zM26.5 27.6l.7 5.8 3.8-5.7-4.5-.1zM30.0 22.3l-7.9.4.7 4.2 1.2-2.5 2.8 1.3 3.2-3.4zM17.3 24.9l2.8-1.3 1.2 2.5.7-4.2-7.9-.4 3.2 3.4z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 22.3l3.3 6.5-.1-3.2L10 22.3zM26.8 25.6l-.1 3.2 3.3-6.5-3.2 3.3zM17.9 22.7l-.7 4.2.9 4.6.2-6.1-.4-2.7zM22.1 22.7l-.4 2.7.2 6.1.9-4.6-.7-4.2z" fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22.7 24.9l-.9 4.6.6.4 4.1-3.2.1-3.2-4 1.4zM17.3 24.9l-4 1.2.1 3.2 4.1 3.2.6-.4-.8-4.6-.0-.6z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22.7 39.3l.1-2.9-.3-.3h-5l-.3.3.1 2.9-4.5-5.9 1.6 1.3 3.2 2.2h3.9l3.2-2.2 1.6-1.3-3.6 5.9z" fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22.4 31.1l-.6-.4h-3.6l-.6.4-.4 3.3.3-.3h5l.3.3-.4-3.3z" fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M37 14.1l1.2-5.8-1.9-5.3-14.9 11 5.4 4.5 7.7 2.2 1.7-2-0.7-.5 1.1-1-0.9-.7 1.1-.8-.8-1.3zM1.8 8.3L3 14.1l-.9 1.3 1.1.8-.8.7 1.1 1-.7.5 1.7 2 7.7-2.2 5.4-4.5L3.7 3 1.8 8.3z" fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M35.5 20.5l-7.7-2.2 2.3 3.7-3.3 6.5 4.4-.1h6.6l-2.3-7.9zM12.3 18.3L4.6 20.5l-2.2 7.9h6.6l4.4.1-3.3-6.5 1.9-3.7zM22.0 22.7l.5-8.6-2.5-6.8h-4l-2.5 6.8.5 8.6.2 2.7v6.1h3.6l.1-6.1.1-2.7z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }

  if (name.includes('rainbow')) {
    return (
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="20" fill="url(#rbow)"/>
        <defs>
          <radialGradient id="rbow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF6B6B"/>
            <stop offset="33%" stopColor="#FFD93D"/>
            <stop offset="66%" stopColor="#6BCB77"/>
            <stop offset="100%" stopColor="#4D96FF"/>
          </radialGradient>
        </defs>
      </svg>
    );
  }

  if (name.includes('coinbase')) {
    return (
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="20" fill="#0052FF"/>
        <path d="M20 8C13.4 8 8 13.4 8 20s5.4 12 12 12 12-5.4 12-12S26.6 8 20 8zm0 18.5c-3.6 0-6.5-2.9-6.5-6.5s2.9-6.5 6.5-6.5 6.5 2.9 6.5 6.5-2.9 6.5-6.5 6.5z" fill="white"/>
        <path d="M17.5 17.5h5v5h-5z" fill="white"/>
      </svg>
    );
  }

  if (name.includes('walletconnect') || name.includes('wallet connect')) {
    return (
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="20" fill="#3B99FC"/>
        <path d="M12.5 16.2c4.1-4.1 10.9-4.1 15 0l.5.5c.2.2.2.5 0 .7l-1.8 1.8c-.1.1-.3.1-.4 0l-.7-.7c-2.9-2.9-7.5-2.9-10.4 0l-.7.7c-.1.1-.3.1-.4 0l-1.8-1.8c-.2-.2-.2-.5 0-.7l.7-.5zM30 19.6l1.6 1.6c.2.2.2.5 0 .7l-7.2 7.2c-.2.2-.5.2-.7 0l-5.1-5.1c-.1-.1-.2-.1-.2 0l-5.1 5.1c-.2.2-.5.2-.7 0L5.4 21.9c-.2-.2-.2-.5 0-.7l1.6-1.6c.2-.2.5-.2.7 0l5.1 5.1c.1.1.2.1.2 0l5.1-5.1c.2-.2.5-.2.7 0l5.1 5.1c.1.1.2.1.2 0l5.1-5.1c.2-.2.6-.2.8 0z" fill="white"/>
      </svg>
    );
  }

  // Fallback
  return <Wallet className="h-4 w-4 shrink-0" strokeWidth={1.5} />;
}

// ─── Header ───────────────────────────────────────────────────────────────────

export function Header() {
  const pathname = usePathname();
  const { connector } = useAccount(); // get current connector name

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-base-border bg-base-bg/90 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-5">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <div className="relative h-7 w-7 overflow-hidden rounded-lg">
            <Image src="/bulldex-logo.png" alt="Bulldex Finance" fill className="object-cover" sizes="28px" priority />
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
              <Link key={item.label} href={item.href}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-150',
                  isActive ? 'text-green' : 'text-ink-secondary hover:text-ink',
                )}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right — ConnectButton with wallet icon */}
        <div className="flex items-center gap-2">
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              return (
                <div
                  {...(!ready && { 'aria-hidden': true, style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' } })}
                  className="flex items-center gap-2"
                >
                  {!connected ? (
                    <button onClick={openConnectModal}
                      className="h-8 rounded-lg bg-brand px-3 text-xs font-semibold text-base-bg transition-all hover:bg-brand-dark hover:shadow-glow-sm">
                      Connect Wallet
                    </button>
                  ) : (
                    <>
                      {/* Network pill */}
                      <button onClick={openChainModal}
                        className="hidden items-center gap-1.5 rounded-lg border border-base-border bg-base-card px-2.5 py-1.5 text-xs text-ink-secondary transition-colors hover:border-base-border-light hover:text-ink sm:flex">
                        <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" />
                        {chain.name ?? 'Unknown'}
                      </button>

                      {/* Account button — shows wallet connector icon */}
                      <button onClick={openAccountModal}
                        className="flex items-center gap-2 rounded-lg border border-base-border bg-base-card px-2.5 py-1.5 text-xs font-medium text-ink transition-colors hover:border-base-border-light hover:bg-base-elevated">
                        {account.ensAvatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={account.ensAvatar} alt={account.displayName} className="h-4 w-4 rounded-full" />
                        ) : (
                          <WalletIcon connectorName={connector?.name} />
                        )}
                        <span className="hidden sm:inline">{account.displayName}</span>
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
