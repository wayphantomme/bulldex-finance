'use client';

import { useSwapEvents } from '@/hooks/useSwapEvents';
import { usePriceTicker } from '@/hooks/usePriceTicker';
import { formatUnits } from 'viem';
import { CONTRACT_ADDRESSES, etherscanUrl } from '@/constants/contracts';
import { shortenAddress } from '@/utils/format';
import { cn } from '@/utils/cn';

export default function AnalyticsPage() {
  const analytics = useSwapEvents();
  const { bdxPriceRaw } = usePriceTicker();

  function formatVolume(raw: bigint): string {
    const n = parseFloat(formatUnits(raw, 18));
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
    return n.toFixed(0);
  }

  function formatVolumeUSD(raw: bigint): string | null {
    if (!bdxPriceRaw) return null;
    const n = parseFloat(formatUnits(raw, 18)) * bdxPriceRaw;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
    return `$${n.toFixed(2)}`;
  }

  const blockRange = analytics.toBlock > 0n
    ? `Block ${analytics.fromBlock.toString()} → ${analytics.toBlock.toString()}`
    : null;

  return (
    <div className="animate-fade-in space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-ink">Analytics</h1>
          <p className="mt-0.5 text-xs text-ink-secondary">
            On-chain data read directly from Sepolia via Alchemy RPC.
          </p>
        </div>
        {analytics.lastUpdated && (
          <p className="text-[11px] text-ink-faint hidden sm:block">
            Updated {analytics.lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Error */}
      {analytics.error && (
        <div className="rounded-xl border border-red/20 bg-red/5 px-4 py-3 text-xs text-red">
          {analytics.error}
        </div>
      )}

      {/* ── Stats row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total Swaps"
          value={analytics.isLoading ? '...' : analytics.totalSwaps.toString()}
          sub="all pools"
        />
        <StatCard
          label="Unique Wallets"
          value={analytics.isLoading ? '...' : analytics.uniqueWallets.toString()}
          sub="traders + LPs"
        />
        <StatCard
          label="Volume (BDX)"
          value={analytics.isLoading ? '...' : formatVolume(analytics.totalVolumeIn)}
          sub={formatVolumeUSD(analytics.totalVolumeIn) ?? 'loading price...'}
        />
        <StatCard
          label="LP Events"
          value={analytics.isLoading ? '...' : analytics.liquidityEvents.length.toString()}
          sub={`${analytics.liquidityEvents.filter(e => e.type === 'add').length} add · ${analytics.liquidityEvents.filter(e => e.type === 'remove').length} remove`}
        />
      </div>

      {blockRange && (
        <p className="text-[11px] text-ink-faint">
          Data source: last 50,000 blocks · {blockRange}
        </p>
      )}

      {/* ── Main grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Leaderboard */}
        <div className="rounded-2xl border border-base-border bg-base-card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-ink">Leaderboard</p>
            <span className="text-[10px] text-ink-faint uppercase tracking-wider">by swap count</span>
          </div>

          {analytics.isLoading ? (
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-base-elevated" />
              ))}
            </div>
          ) : analytics.leaderboard.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-ink-secondary">No swaps found yet.</p>
              <p className="text-xs text-ink-faint mt-1">Be the first to swap on Bulldex!</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {analytics.leaderboard.map((w, i) => (
                <div key={w.address} className="flex items-center gap-3 rounded-xl bg-base-surface px-3 py-2.5">
                  {/* Rank */}
                  <span className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                    i === 0 ? 'bg-yellow/20 text-yellow' :
                    i === 1 ? 'bg-[#C0C0C0]/20 text-[#C0C0C0]' :
                    i === 2 ? 'bg-[#CD7F32]/20 text-[#CD7F32]' :
                    'bg-base-elevated text-ink-faint',
                  )}>
                    {i + 1}
                  </span>

                  {/* Address */}
                  <div className="flex-1 min-w-0">
                    <a
                      href={etherscanUrl(w.address, 'address')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-ink hover:text-brand transition-colors"
                    >
                      {shortenAddress(w.address, 4)}
                    </a>
                  </div>

                  {/* Stats */}
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-ink">{w.swapCount} swaps</p>
                    <p className="text-[10px] text-ink-faint">{formatVolume(w.amountInTotal)} vol</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent swaps */}
        <div className="rounded-2xl border border-base-border bg-base-card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-ink">Recent Swaps</p>
            <span className="text-[10px] text-ink-faint uppercase tracking-wider">latest first</span>
          </div>

          {analytics.isLoading ? (
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-base-elevated" />
              ))}
            </div>
          ) : analytics.swaps.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-ink-secondary">No swaps found yet.</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-80 overflow-y-auto no-scrollbar">
              {analytics.swaps.slice(0, 20).map((s) => {
                const isBdxIn = s.tokenIn.toLowerCase() === CONTRACT_ADDRESSES.token.toLowerCase();
                return (
                  <div key={s.txHash} className="flex items-center gap-3 rounded-xl bg-base-surface px-3 py-2.5">
                    {/* Direction badge */}
                    <span className={cn(
                      'shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                      isBdxIn ? 'bg-red/10 text-red' : 'bg-green/10 text-green',
                    )}>
                      {isBdxIn ? 'SELL' : 'BUY'}
                    </span>

                    {/* Address */}
                    <a
                      href={etherscanUrl(s.txHash, 'tx')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-0 font-mono text-xs text-ink-secondary hover:text-ink transition-colors truncate"
                    >
                      {shortenAddress(s.sender, 4)}
                    </a>

                    {/* Amount */}
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-ink tabular-nums">
                        {formatVolume(s.amountIn)} {isBdxIn ? 'BDX' : 'MUSDC'}
                      </p>
                      <p className="text-[10px] text-ink-faint">{s.pool}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* LP events */}
      {analytics.liquidityEvents.length > 0 && (
        <div className="rounded-2xl border border-base-border bg-base-card p-5">
          <p className="mb-4 text-sm font-semibold text-ink">Liquidity Events</p>
          <div className="space-y-1.5 max-h-60 overflow-y-auto no-scrollbar">
            {analytics.liquidityEvents.slice(0, 10).map((e) => (
              <div key={e.txHash} className="flex items-center gap-3 rounded-xl bg-base-surface px-3 py-2.5">
                <span className={cn(
                  'shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                  e.type === 'add' ? 'bg-brand/10 text-brand' : 'bg-yellow/10 text-yellow',
                )}>
                  {e.type === 'add' ? 'ADD LP' : 'REMOVE'}
                </span>
                <a href={etherscanUrl(e.txHash, 'tx')} target="_blank" rel="noopener noreferrer"
                  className="flex-1 font-mono text-xs text-ink-secondary hover:text-ink transition-colors truncate">
                  {shortenAddress(e.provider, 4)}
                </a>
                <span className="text-xs text-ink-faint">{e.pool}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* The Graph coming soon */}
      <div className="rounded-2xl border border-base-border bg-base-surface px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-ink">The Graph integration coming soon</p>
          <p className="text-[11px] text-ink-faint mt-0.5">Full historical data, faster queries, unlimited range via GraphQL subgraph.</p>
        </div>
        <a href="https://thegraph.com/studio" target="_blank" rel="noopener noreferrer"
          className="shrink-0 text-[11px] text-brand hover:opacity-70 transition-opacity ml-4">
          Learn more
        </a>
      </div>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-base-border bg-base-card p-4">
      <p className="text-xs text-ink-secondary mb-1">{label}</p>
      <p className="text-2xl font-bold text-ink tabular-nums">{value}</p>
      {sub && <p className="text-[11px] text-ink-faint mt-0.5">{sub}</p>}
    </div>
  );
}
