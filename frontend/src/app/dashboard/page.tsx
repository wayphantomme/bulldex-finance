'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useTokenInfo } from '@/hooks/useTokenInfo';
import { formatToken, shortenAddress } from '@/utils/format';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { etherscanUrl, CONTRACT_ADDRESSES } from '@/constants/contracts';

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { raw: balance, isLoading: balLoading, isContractConfigured } = useTokenBalance(address);
  const { symbol, totalSupply, isLoading: infoLoading } = useTokenInfo();

  return (
    <div className="animate-fade-in space-y-6">

      {/* Page title */}
      <div>
        <h1 className="text-base font-semibold text-ink">Overview</h1>
        <p className="mt-0.5 text-xs text-ink-secondary">Your portfolio at a glance.</p>
      </div>

      {/* ── Not connected ───────────────────────────────────────────────── */}
      {!isConnected && (
        <Card className="flex flex-col items-center gap-5 py-14 text-center">
          <div className="relative">
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-2xl bg-base-elevated/50 blur-xl" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-base-border-light bg-base-elevated">
              <svg className="h-8 w-8 text-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18-3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6m18 0v3M3 6v3" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Connect your wallet</p>
            <p className="mt-1 text-xs text-ink-secondary">Connect to view your BDX balance and positions</p>
          </div>
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                onClick={openConnectModal}
                className="h-10 rounded-xl bg-brand px-6 text-sm font-semibold text-base-bg transition-opacity hover:opacity-90"
              >
                Connect Wallet
              </button>
            )}
          </ConnectButton.Custom>
        </Card>
      )}

      {/* ── Connected ──────────────────────────────────────────────────── */}
      {isConnected && address && (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

            {/* BDX Balance */}
            <Card variant="brand" className="col-span-2 lg:col-span-1">
              <p className="mb-2 text-xs text-ink-secondary">BDX Balance</p>
              {balLoading ? (
                <>
                  <Skeleton className="mb-1.5 h-7 w-28" />
                  <Skeleton className="h-3 w-12" />
                </>
              ) : !isContractConfigured ? (
                <p className="text-xs text-ink-faint">Contract not configured</p>
              ) : (
                <>
                  <p className="text-2xl font-bold text-ink">
                    {formatToken(balance, 18, 2)}
                  </p>
                  <p className="mt-0.5 text-xs text-green">{symbol ?? 'BDX'}</p>
                </>
              )}
            </Card>

            {/* Total Supply */}
            <Card>
              <p className="mb-2 text-xs text-ink-secondary">Total Supply</p>
              {infoLoading ? (
                <Skeleton className="h-7 w-24" />
              ) : (
                <>
                  <p className="text-2xl font-bold text-ink">
                    {totalSupply ? formatToken(totalSupply, 18, 0) : '-'}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-secondary">{symbol ?? 'BDX'}</p>
                </>
              )}
            </Card>

            {/* TVL placeholder */}
            <Card>
              <p className="mb-2 text-xs text-ink-secondary">TVL</p>
              <p className="text-2xl font-bold text-ink">-</p>
              <Badge variant="ghost" className="mt-1.5 text-[10px]">Week 2</Badge>
            </Card>

            {/* Volume placeholder */}
            <Card>
              <p className="mb-2 text-xs text-ink-secondary">24h Volume</p>
              <p className="text-2xl font-bold text-ink">-</p>
              <Badge variant="ghost" className="mt-1.5 text-[10px]">Week 2</Badge>
            </Card>
          </div>

          {/* Address card */}
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-faint ring-1 ring-green/20">
                  <span className="text-xs font-bold text-green">
                    {address.slice(2, 4).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-mono text-sm font-medium text-ink">
                    {shortenAddress(address, 6)}
                  </p>
                  <p className="text-[10px] text-ink-faint">Connected · Sepolia</p>
                </div>
              </div>
              <a href={etherscanUrl(address, 'address')} target="_blank" rel="noopener noreferrer">
                <Button
                  size="xs"
                  variant="ghost"
                  rightIcon={
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  }
                >
                  Etherscan
                </Button>
              </a>
            </div>
          </Card>

          {/* Quick actions */}
          <div>
            <p className="mb-3 text-xs font-medium text-ink-secondary">Quick Actions</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {ACTIONS.map((a) => (
                <Link key={a.label} href={a.href}>
                  <div className="group flex flex-col items-center gap-3 rounded-xl border border-base-border bg-base-card p-5 text-center transition-all duration-150 hover:border-base-border-light hover:bg-base-elevated cursor-pointer">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-base-elevated text-ink-secondary transition-colors group-hover:bg-base-card">
                      {a.icon}
                    </div>
                    <span className="text-xs font-medium text-ink-secondary group-hover:text-ink transition-colors">
                      {a.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </>
      )}
    </div>
  );
}

const ACTIONS = [
  {
    label: 'Swap',
    href: '/dashboard/swap',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    ),
  },
  {
    label: 'Add Liquidity',
    href: '/dashboard/liquidity',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Stake BDX',
    href: '/dashboard/staking',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    label: 'Farm Yield',
    href: '/dashboard/farming',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
];
