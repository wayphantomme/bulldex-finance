'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { formatUnits } from 'viem';
import { useReadContract } from 'wagmi';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useTokenInfo } from '@/hooks/useTokenInfo';
import { usePoolStats } from '@/hooks/usePoolStats';
import { usePriceTicker } from '@/hooks/usePriceTicker';
import { useLendingPosition, useLendingStats } from '@/hooks/useLending';
import { formatToken } from '@/utils/format';
import { Skeleton } from '@/components/ui/Skeleton';
import { CONTRACT_ADDRESSES, etherscanUrl, isConfigured } from '@/constants/contracts';
import { POOL_ABI } from '@/constants/abis';
import { cn } from '@/utils/cn';

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { raw: balance, isLoading: balLoading, isContractConfigured } = useTokenBalance(address);
  const { symbol } = useTokenInfo();
  const pool        = usePoolStats();
  const { bdxPriceUSD, bdxPriceRaw, tvlUSD } = usePriceTicker();
  const lendPos     = useLendingPosition(address);
  const lendStats   = useLendingStats();

  // LP balance in BDX/MUSDC pool
  const { data: lpBalanceRaw } = useReadContract({
    address: CONTRACT_ADDRESSES.pool,
    abi: POOL_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && isConfigured(CONTRACT_ADDRESSES.pool), staleTime: 15_000 },
  });
  const lpBalance = lpBalanceRaw as bigint | undefined;

  // Portfolio value: BDX balance × BDX price in USD
  const bdxNum = balance ? parseFloat(formatUnits(balance, 18)) : 0;
  const portfolioUSD = bdxPriceRaw && bdxNum > 0
    ? bdxNum * bdxPriceRaw
    : null;
  const portfolioDisplay = portfolioUSD
    ? portfolioUSD < 1
      ? `$${portfolioUSD.toFixed(4)}`
      : `$${portfolioUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : null;

  const hasLPPosition    = lpBalance && lpBalance > 0n;
  const hasLendPosition  = lendPos.collateral > 0n;

  return (
    <div className="animate-fade-in space-y-5">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-base font-semibold text-ink">Portfolio Overview</h1>
          <p className="mt-0.5 text-xs text-ink-secondary">
            {isConnected ? 'Your live positions on Sepolia testnet.' : 'Connect wallet to view your portfolio.'}
          </p>
        </div>
        {isConnected && address && (
          <a href={etherscanUrl(address, 'address')} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-base-border bg-base-card px-3 py-1.5 text-[11px] text-ink-secondary hover:text-ink hover:border-base-border-light transition-colors">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Etherscan
          </a>
        )}
      </div>

      {/* ── Not connected ───────────────────────────────────────────── */}
      {!isConnected && (
        <div className="rounded-2xl border border-base-border bg-base-card p-10 flex flex-col items-center gap-5 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-base-border bg-base-elevated">
            <svg className="h-6 w-6 text-ink-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18-3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6m18 0v3M3 6v3" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Connect your wallet</p>
            <p className="mt-1 text-xs text-ink-secondary">View your BDX balance, LP positions and lending activity.</p>
          </div>
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button onClick={openConnectModal}
                className="h-10 rounded-xl bg-brand px-6 text-sm font-semibold text-base-bg transition-all hover:bg-brand-dark">
                Connect Wallet
              </button>
            )}
          </ConnectButton.Custom>

          {/* Protocol stats — visible even disconnected */}
          <div className="w-full border-t border-base-border pt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 text-left">
            <MiniStat label="Protocol TVL" value={tvlUSD ?? '--'} />
            <MiniStat label="BDX Price" value={bdxPriceUSD ?? '--'} />
            <MiniStat label="Active Pools" value="2" />
            <MiniStat label="Swap Fee" value="0.30%" />
          </div>
        </div>
      )}

      {/* ── Connected layout ────────────────────────────────────────── */}
      {isConnected && address && (
        <>
          {/* Row 1: Portfolio value + Positions */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

            {/* ── Total Net Worth ─────────────────────────────────── */}
            <div className="lg:col-span-2 rounded-2xl border border-base-border bg-base-card p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs text-ink-faint mb-1">Total Net Worth</p>
                {balLoading ? (
                  <Skeleton className="h-9 w-40 mb-1" />
                ) : portfolioDisplay ? (
                  <p className="text-3xl font-semibold text-ink tabular-nums">{portfolioDisplay}</p>
                ) : (
                  <p className="text-3xl font-semibold text-ink">--</p>
                )}
                <p className="text-xs text-ink-faint mt-1">
                  {bdxNum > 0 ? `${formatToken(balance, 18, 2)} ${symbol ?? 'BDX'} in wallet` : 'No BDX in wallet yet'}
                </p>
              </div>

              {/* Protocol stat strip */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-base-border pt-4">
                <StatCell
                  label="BDX Price"
                  value={bdxPriceUSD ?? '--'}
                  sub="via WETH pool"
                  loading={pool.isLoading}
                />
                <StatCell
                  label="Protocol TVL"
                  value={tvlUSD ?? '--'}
                  sub="both pools"
                  loading={pool.isLoading}
                />
                <StatCell
                  label="BDX/MUSDC Reserve"
                  value={pool.bdxReserveFormatted ? `${pool.bdxReserveFormatted} BDX` : '--'}
                  sub={pool.musdcReserveFormatted ? `${pool.musdcReserveFormatted} MUSDC` : ''}
                  loading={pool.isLoading}
                />
                <StatCell
                  label="Lending Available"
                  value={lendStats.reserveBalance > 0n
                    ? `${parseFloat(formatUnits(lendStats.reserveBalance, 18)).toFixed(0)} MUSDC`
                    : '--'}
                  sub="to borrow"
                  loading={lendStats.isLoading}
                />
              </div>
            </div>

            {/* ── Your Positions ──────────────────────────────────── */}
            <div className="rounded-2xl border border-base-border bg-base-card p-5 flex flex-col">
              <p className="text-xs font-semibold text-ink-secondary mb-4">Your Positions</p>

              <div className="space-y-3 flex-1">
                {/* BDX wallet balance */}
                <PositionRow
                  icon={<img src="/bulldex-logo.png" alt="BDX" className="h-8 w-8 rounded-full object-cover" />}
                  label="BDX Wallet"
                  sub="Spot balance"
                  value={isContractConfigured ? `${formatToken(balance, 18, 2)} BDX` : '--'}
                  valueUSD={portfolioDisplay ?? undefined}
                  loading={balLoading}
                  status="active"
                />

                {/* LP position */}
                <PositionRow
                  icon={
                    <div className="relative w-8 h-8 shrink-0">
                      <img src="/bulldex-logo.png" alt="BDX" className="absolute left-0 top-0 h-6 w-6 rounded-full object-cover ring-2 ring-base-card" />
                      <img src="/musdc-icon.svg" alt="MUSDC" className="absolute left-2.5 top-2 h-5 w-5 rounded-full object-cover ring-2 ring-base-card" />
                    </div>
                  }
                  label="BDX/MUSDC LP"
                  sub="Liquidity position"
                  value={hasLPPosition ? `${formatToken(lpBalance!, 18, 4)} LP` : 'No position'}
                  loading={false}
                  status={hasLPPosition ? 'active' : 'empty'}
                  actionHref="/dashboard/liquidity"
                  actionLabel={hasLPPosition ? 'Manage' : 'Add'}
                />

                {/* Lending position */}
                <PositionRow
                  icon={
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-base-elevated">
                      <svg className="h-4 w-4 text-ink-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21" />
                      </svg>
                    </div>
                  }
                  label="BDX Collateral"
                  sub={hasLendPosition ? `Health: ${lendPos.healthFactorNum > 999 ? '>999' : lendPos.healthFactorNum.toFixed(2)}` : 'Lending position'}
                  value={hasLendPosition ? `${parseFloat(formatUnits(lendPos.collateral, 18)).toFixed(2)} BDX` : 'No position'}
                  loading={lendPos.isLoading}
                  status={hasLendPosition ? (lendPos.isLiquidatable ? 'danger' : 'active') : 'empty'}
                  actionHref="/dashboard/lending"
                  actionLabel={hasLendPosition ? 'Manage' : 'Deposit'}
                />
              </div>
            </div>
          </div>

          {/* Row 2: Quick Actions + Protocol Stats */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

            {/* ── Quick Actions ────────────────────────────────────── */}
            <div className="lg:col-span-2 rounded-2xl border border-base-border bg-base-card p-5">
              <p className="text-xs font-semibold text-ink-secondary mb-4">Quick Actions</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {ACTIONS.map((a) => (
                  <Link key={a.label} href={a.href}>
                    <div className={cn(
                      'group flex flex-col items-center gap-3 rounded-xl border p-4 text-center transition-all duration-150 cursor-pointer',
                      a.primary
                        ? 'border-brand/30 bg-brand/5 hover:bg-brand/10'
                        : 'border-base-border bg-base-elevated hover:border-base-border-light hover:bg-base-card',
                    )}>
                      <div className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
                        a.primary ? 'bg-brand/15 text-brand' : 'bg-base-card text-ink-secondary group-hover:bg-base-elevated',
                      )}>
                        {a.icon}
                      </div>
                      <div>
                        <p className={cn(
                          'text-xs font-semibold transition-colors',
                          a.primary ? 'text-brand' : 'text-ink-secondary group-hover:text-ink',
                        )}>
                          {a.label}
                        </p>
                        {a.sub && (
                          <p className="text-[10px] text-ink-faint mt-0.5">{a.sub}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Market Overview ──────────────────────────────────── */}
            <div className="rounded-2xl border border-base-border bg-base-card p-5">
              <p className="text-xs font-semibold text-ink-secondary mb-4">Market</p>
              <div className="space-y-3">
                <MarketRow
                  logo="/bulldex-logo.png"
                  name="BDX"
                  sub="Bulldex Token"
                  price={bdxPriceUSD}
                  loading={pool.isLoading}
                />
                <MarketRow
                  logo="/eth-icon.svg"
                  name="ETH"
                  sub="Sepolia"
                  price={null}
                  priceFallback="Chainlink"
                  loading={false}
                />
                <MarketRow
                  logo="/musdc-icon.svg"
                  name="MUSDC"
                  sub="Mock USDC"
                  price={null}
                  priceFallback="Testnet"
                  loading={false}
                />
              </div>

              <div className="mt-4 border-t border-base-border pt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-ink-faint">Active Pools</span>
                  <span className="text-ink font-semibold">2</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-ink-faint">Swap Fee</span>
                  <span className="text-ink font-semibold">0.30%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-ink-faint">Borrow APR</span>
                  <span className="text-ink font-semibold">~5%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-ink-faint">Max LTV</span>
                  <span className="text-ink font-semibold">75%</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCell({ label, value, sub, loading }: {
  label: string; value: string; sub?: string; loading?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] text-ink-faint mb-0.5">{label}</p>
      {loading ? (
        <Skeleton className="h-4 w-16" />
      ) : (
        <p className="text-sm font-semibold text-ink tabular-nums">{value}</p>
      )}
      {sub && <p className="text-[10px] text-ink-faint mt-0.5">{sub}</p>}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-base-surface px-3 py-2.5">
      <p className="text-[10px] text-ink-faint">{label}</p>
      <p className="text-sm font-semibold text-ink mt-0.5 tabular-nums">{value}</p>
    </div>
  );
}

function PositionRow({ icon, label, sub, value, valueUSD, loading, status, actionHref, actionLabel }: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  value: string;
  valueUSD?: string;
  loading: boolean;
  status: 'active' | 'empty' | 'danger';
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-base-surface px-3 py-2.5">
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-semibold text-ink truncate">{label}</p>
          {status === 'active' && <span className="h-1.5 w-1.5 rounded-full bg-green shrink-0" />}
          {status === 'danger' && <span className="h-1.5 w-1.5 rounded-full bg-red animate-pulse shrink-0" />}
        </div>
        <p className="text-[10px] text-ink-faint">{sub}</p>
      </div>
      <div className="text-right shrink-0">
        {loading ? (
          <Skeleton className="h-4 w-16" />
        ) : (
          <>
            <p className={cn(
              'text-xs font-semibold tabular-nums',
              status === 'empty' ? 'text-ink-faint' : 'text-ink',
            )}>
              {value}
            </p>
            {valueUSD && <p className="text-[10px] text-ink-faint">{valueUSD}</p>}
          </>
        )}
        {status === 'empty' && actionHref && (
          <Link href={actionHref}
            className="text-[10px] text-brand hover:text-brand-dark transition-colors">
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

function MarketRow({ logo, name, sub, price, priceFallback, loading }: {
  logo: string; name: string; sub: string;
  price: string | null; priceFallback?: string; loading: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo} alt={name} className="h-8 w-8 rounded-full object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-ink">{name}</p>
        <p className="text-[10px] text-ink-faint">{sub}</p>
      </div>
      <div className="text-right">
        {loading ? (
          <Skeleton className="h-4 w-14" />
        ) : price ? (
          <p className="text-xs font-semibold text-ink tabular-nums">{price}</p>
        ) : (
          <p className="text-xs text-ink-faint">{priceFallback}</p>
        )}
      </div>
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const ACTIONS = [
  {
    label: 'Quick Swap',
    sub: '0.3% fee',
    href: '/dashboard/swap',
    primary: true,
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    ),
  },
  {
    label: 'Add Liquidity',
    sub: 'Earn swap fees',
    href: '/dashboard/liquidity',
    primary: false,
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Lend BDX',
    sub: 'Borrow MUSDC',
    href: '/dashboard/lending',
    primary: false,
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21" />
      </svg>
    ),
  },
  {
    label: 'Get Tokens',
    sub: 'Faucet + wrap ETH',
    href: '/dashboard/faucet',
    primary: false,
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        <path d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
      </svg>
    ),
  },
];
