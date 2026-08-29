'use client';

import { useState, useMemo } from 'react';
import { useSubgraph, type ActivityEvent, type ActivityType } from '@/hooks/useSubgraph';
import { useSwapEvents } from '@/hooks/useSwapEvents';
import { usePriceTicker } from '@/hooks/usePriceTicker';
import { useLendingStats } from '@/hooks/useLending';
import { formatUnits } from 'viem';
import { etherscanUrl, CONTRACT_ADDRESSES } from '@/constants/contracts';
import { shortenAddress } from '@/utils/format';
import { cn } from '@/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';
import { RefreshCw } from 'lucide-react';

type TabType = 'overview' | 'transactions' | 'pools' | 'leaderboard';
type SortKey = 'swapCount' | 'volume';
type TxFilter = 'all' | 'swap' | 'lp' | 'lend';

// ── Badge config ─────────────────────────────────────────────────────────────

const ACTIVITY_BADGE: Record<ActivityType, { label: string; color: string }> = {
  swap:          { label: 'SWAP',     color: 'bg-brand/10 text-brand' },
  lp_add:        { label: 'ADD LP',   color: 'bg-green/10 text-green' },
  lp_remove:     { label: 'REM LP',   color: 'bg-yellow/10 text-yellow' },
  lend_deposit:  { label: 'DEPOSIT',  color: 'bg-brand/10 text-brand' },
  lend_borrow:   { label: 'BORROW',   color: 'bg-red/10 text-red' },
  lend_repay:    { label: 'REPAY',    color: 'bg-green/10 text-green' },
  lend_withdraw: { label: 'WITHDRAW', color: 'bg-ink-faint/10 text-ink-secondary' },
};

function txFilterMatch(type: ActivityType, filter: TxFilter): boolean {
  if (filter === 'all')  return true;
  if (filter === 'swap') return type === 'swap';
  if (filter === 'lp')   return type === 'lp_add' || type === 'lp_remove';
  if (filter === 'lend') return type.startsWith('lend_');
  return true;
}

// ── Pool address → name ───────────────────────────────────────────────────────

function poolName(id: string | undefined): string {
  if (!id) return '—';
  const addr = id.toLowerCase();
  if (addr === CONTRACT_ADDRESSES.pool.toLowerCase())        return 'BDX/MUSDC';
  if (addr === CONTRACT_ADDRESSES.poolBdxWeth.toLowerCase()) return 'BDX/WETH';
  return id.slice(0, 6) + '…' + id.slice(-4);
}

// ── Relative time ─────────────────────────────────────────────────────────────

function relTime(ts: string): string {
  const sec = Math.floor(Date.now() / 1000) - Number(ts);
  if (sec < 60)    return `${sec}s ago`;
  if (sec < 3600)  return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const subgraph     = useSubgraph();
  const rpc          = useSwapEvents();
  const { bdxPriceRaw } = usePriceTicker();
  const lendStats    = useLendingStats();

  const [tab,       setTab]       = useState<TabType>('overview');
  const [txFilter,  setTxFilter]  = useState<TxFilter>('all');
  const [sortKey,   setSortKey]   = useState<SortKey>('swapCount');

  const useSubgraphData = subgraph.isSynced && !subgraph.error;

  // ── Numeric helpers ───────────────────────────────────────────────────────
  function fmtVol(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
    return n.toFixed(2);
  }
  function fmtUSD(n: number): string | null {
    if (!bdxPriceRaw || bdxPriceRaw === 0) return null;
    const usd = n * bdxPriceRaw;
    if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(2)}M`;
    if (usd >= 1_000)     return `$${(usd / 1_000).toFixed(2)}K`;
    return `$${usd.toFixed(2)}`;
  }

  const isLoading = useSubgraphData ? subgraph.isLoading : rpc.isLoading;

  // ── Overview stats ────────────────────────────────────────────────────────
  const totalSwaps   = useSubgraphData ? (subgraph.protocol?.totalSwaps ?? 0) : rpc.totalSwaps;
  const uniqueWallets = useSubgraphData ? (subgraph.protocol?.totalUniqueUsers ?? 0) : rpc.uniqueWallets;
  const volumeNum    = parseFloat(
    useSubgraphData
      ? (subgraph.protocol?.totalVolumeToken0 ?? '0')
      : formatUnits(rpc.totalVolumeIn, 18),
  );

  // ── Filtered activity ─────────────────────────────────────────────────────
  const filteredActivity = useMemo(() =>
    subgraph.allActivity.filter(e => txFilterMatch(e.type, txFilter)),
    [subgraph.allActivity, txFilter],
  );

  // ── Sorted leaderboard ────────────────────────────────────────────────────
  const sortedLeaderboard = useMemo(() => {
    const lb = useSubgraphData
      ? subgraph.leaderboard.map(u => ({
          address:      u.id,
          swapCount:    u.swapCount,
          volume:       parseFloat(u.totalAmountIn),
          volumeStr:    fmtVol(parseFloat(u.totalAmountIn)),
          firstSeenAt:  u.firstSeenAt,
        }))
      : rpc.leaderboard.map(w => ({
          address:      w.address,
          swapCount:    w.swapCount,
          volume:       parseFloat(formatUnits(w.amountInTotal, 18)),
          volumeStr:    fmtVol(parseFloat(formatUnits(w.amountInTotal, 18))),
          firstSeenAt:  '',
        }));
    return [...lb].sort((a, b) =>
      sortKey === 'swapCount' ? b.swapCount - a.swapCount : b.volume - a.volume
    );
  }, [useSubgraphData, subgraph.leaderboard, rpc.leaderboard, sortKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in space-y-6">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            {useSubgraphData
              ? 'Full historical index via The Graph subgraph.'
              : 'The Graph unavailable — showing RPC fallback data.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={subgraph.refresh}
            className="flex items-center gap-1.5 rounded-lg border border-base-border bg-base-card px-2.5 py-1.5 text-[11px] text-ink-faint hover:text-ink transition-colors">
            <RefreshCw className="h-3 w-3" strokeWidth={2} />
            Refresh
          </button>
          <span className={cn(
            'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold',
            useSubgraphData
              ? 'border-brand/30 bg-brand/10 text-brand'
              : 'border-base-border bg-base-elevated text-ink-faint',
          )}>
            <span className={cn('h-1.5 w-1.5 rounded-full', useSubgraphData ? 'bg-brand animate-pulse' : 'bg-yellow')} />
            {useSubgraphData ? 'The Graph' : 'RPC Fallback'}
          </span>
        </div>
      </div>

      {/* ── Tab nav ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 rounded-xl border border-base-border bg-base-card p-1 w-fit">
        {(['overview', 'transactions', 'pools', 'leaderboard'] as TabType[]).map(t => (
          <button key={t}
            onClick={() => setTab(t)}
            className={cn(
              'rounded-lg px-4 py-1.5 text-xs font-semibold capitalize transition-colors',
              tab === t ? 'bg-base-elevated text-ink' : 'text-ink-secondary hover:text-ink',
            )}>
            {t}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          OVERVIEW TAB
      ══════════════════════════════════════════════════════════════ */}
      {tab === 'overview' && (
        <div className="space-y-4">

          {/* Swap stats */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint mb-2 px-0.5">Swap Activity</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Total Swaps"    value={isLoading ? null : totalSwaps.toString()}    sub="all pools" />
              <StatCard label="Unique Wallets" value={isLoading ? null : uniqueWallets.toString()} sub="traders + LPs" />
              <StatCard label="Swap Volume"    value={isLoading ? null : fmtVol(volumeNum)}        sub={fmtUSD(volumeNum) ?? 'price loading'} />
              <StatCard
                label="Active Pools"
                value={isLoading ? null : (useSubgraphData ? subgraph.pools.length.toString() : '2')}
                sub="BDX/MUSDC + BDX/WETH"
              />
            </div>
          </div>

          {/* LP stats */}
          {useSubgraphData && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint mb-2 px-0.5">Liquidity</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="LP Adds"    value={subgraph.recentLP.filter(e => e.type === 'add').length.toString()}    sub="add liquidity events" />
                <StatCard label="LP Removes" value={subgraph.recentLP.filter(e => e.type === 'remove').length.toString()}  sub="remove liquidity events" />
                <StatCard label="LP Events"  value={subgraph.recentLP.length.toString()} sub="total LP activity" />
                <StatCard label="Pools"      value={subgraph.pools.length.toString()}    sub="active trading pairs" />
              </div>
            </div>
          )}

          {/* Lending stats */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint mb-2 px-0.5">Lending</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {useSubgraphData && subgraph.lendingProtocol ? (
                <>
                  <StatCard label="Deposits"     value={subgraph.lendingProtocol.totalDeposits.toString()}     sub="BDX collateral deposits" />
                  <StatCard label="Borrows"       value={subgraph.lendingProtocol.totalBorrows.toString()}      sub="MUSDC borrow events" />
                  <StatCard label="Repays"        value={subgraph.lendingProtocol.totalRepays.toString()}       sub="debt repaid" />
                  <StatCard label="Liquidations"  value={subgraph.lendingProtocol.totalLiquidations.toString()} sub="positions liquidated" />
                </>
              ) : (
                <>
                  <StatCard label="Total Supplied" value={isLoading ? null : undefined} sub="BDX collateral" liveValue={`${parseFloat(formatUnits(lendStats.totalCollateral, 18)).toFixed(2)} BDX`} />
                  <StatCard label="Total Borrowed" value={isLoading ? null : undefined} sub="MUSDC borrowed"  liveValue={`${parseFloat(formatUnits(lendStats.totalBorrowed, 18)).toFixed(2)} MUSDC`} />
                  <StatCard label="Available Liq." value={isLoading ? null : undefined} sub="MUSDC reserve"   liveValue={`${parseFloat(formatUnits(lendStats.reserveBalance, 18)).toFixed(2)} MUSDC`} />
                  <StatCard label="Interest Rate"  value="~5% APR" sub="fixed borrow rate" />
                </>
              )}
            </div>
          </div>

          {/* Pool overview cards */}
          {useSubgraphData && subgraph.pools.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint mb-2 px-0.5">Pool Overview</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {subgraph.pools.map(p => (
                  <div key={p.id} className="rounded-2xl border border-base-border bg-base-card p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-ink">{poolName(p.id)}</p>
                      <p className="text-[11px] text-ink-faint font-mono mt-0.5">{p.id.slice(0, 10)}…{p.id.slice(-6)}</p>
                    </div>
                    <div className="flex items-center gap-4 text-right shrink-0">
                      <div>
                        <p className="text-xs font-semibold text-ink tabular-nums">{fmtVol(parseFloat(p.totalVolumeToken0))}</p>
                        <p className="text-[10px] text-ink-faint">volume</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-ink tabular-nums">{p.totalSwaps}</p>
                        <p className="text-[10px] text-ink-faint">swaps</p>
                      </div>
                      <a href={etherscanUrl(p.id, 'address')} target="_blank" rel="noopener noreferrer"
                        className="text-[11px] text-brand hover:opacity-70 transition-opacity shrink-0">
                        Etherscan
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TRANSACTIONS TAB
      ══════════════════════════════════════════════════════════════ */}
      {tab === 'transactions' && (
        <div className="space-y-4">

          {/* Filter chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {(['all', 'swap', 'lp', 'lend'] as TxFilter[]).map(f => (
              <button key={f}
                onClick={() => setTxFilter(f)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors',
                  txFilter === f
                    ? 'border-brand/30 bg-brand/10 text-brand'
                    : 'border-base-border bg-base-elevated text-ink-secondary hover:text-ink',
                )}>
                {f === 'all' ? 'All Activity' : f === 'lp' ? 'Liquidity' : f === 'lend' ? 'Lending' : 'Swaps'}
              </button>
            ))}
            <span className="text-[11px] text-ink-faint ml-auto">
              {filteredActivity.length} events
            </span>
          </div>

          {/* Activity feed */}
          <div className="rounded-2xl border border-base-border bg-base-card overflow-hidden">
            {/* Column headers */}
            <div className="grid grid-cols-12 gap-2 px-5 py-2.5 border-b border-base-border bg-base-surface text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
              <div className="col-span-2">Type</div>
              <div className="col-span-3">Wallet</div>
              <div className="col-span-2">Pool</div>
              <div className="col-span-3 text-right">Amount</div>
              <div className="col-span-2 text-right">Time</div>
            </div>

            {isLoading && filteredActivity.length === 0 ? (
              <div className="p-4 space-y-2">
                {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : filteredActivity.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-ink-secondary">No {txFilter === 'all' ? '' : txFilter} activity yet.</p>
                <p className="text-xs text-ink-faint mt-1">Transactions will appear here as they happen.</p>
              </div>
            ) : (
              <div className="divide-y divide-base-border">
                {filteredActivity.map(e => (
                  <ActivityRow key={e.id} event={e} fmtVol={fmtVol} />
                ))}
              </div>
            )}

            {/* Load more */}
            {subgraph.hasMoreActivity && !isLoading && (
              <div className="border-t border-base-border px-5 py-3 flex justify-center">
                <button
                  onClick={subgraph.loadMoreActivity}
                  className="text-xs font-semibold text-brand hover:opacity-80 transition-opacity">
                  Load more
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          POOLS TAB
      ══════════════════════════════════════════════════════════════ */}
      {tab === 'pools' && (
        <div className="space-y-4">

          {!useSubgraphData ? (
            <div className="rounded-2xl border border-base-border bg-base-card p-10 text-center">
              <p className="text-sm text-ink-secondary">Pool stats require The Graph subgraph.</p>
              <p className="text-xs text-ink-faint mt-1">The subgraph is not synced — RPC fallback has limited pool data.</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {[1,2].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
            </div>
          ) : (
            subgraph.pools.map(p => (
              <div key={p.id} className="rounded-2xl border border-base-border bg-base-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-base-border">
                  <div>
                    <h2 className="text-sm font-semibold text-ink">{poolName(p.id)}</h2>
                    <p className="text-[11px] text-ink-faint font-mono mt-0.5">{p.id}</p>
                  </div>
                  <a href={etherscanUrl(p.id, 'address')} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-brand hover:opacity-70 transition-opacity">
                    View on Etherscan ↗
                  </a>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-base-border">
                  <PoolStat label="Total Swaps"  value={p.totalSwaps.toString()} />
                  <PoolStat label="Volume (BDX)" value={fmtVol(parseFloat(p.totalVolumeToken0))} />
                  <PoolStat label="Volume (USD)"  value={fmtUSD(parseFloat(p.totalVolumeToken0)) ?? '—'} />
                  <PoolStat label="Fee Earned"   value={fmtUSD(parseFloat(p.totalVolumeToken0) * 0.003) ?? `${fmtVol(parseFloat(p.totalVolumeToken0) * 0.003)} BDX`} />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          LEADERBOARD TAB
      ══════════════════════════════════════════════════════════════ */}
      {tab === 'leaderboard' && (
        <div className="space-y-4">

          {/* Sort controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-faint">Sort by:</span>
            {(['swapCount', 'volume'] as SortKey[]).map(k => (
              <button key={k}
                onClick={() => setSortKey(k)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors',
                  sortKey === k
                    ? 'border-brand/30 bg-brand/10 text-brand'
                    : 'border-base-border bg-base-elevated text-ink-secondary hover:text-ink',
                )}>
                {k === 'swapCount' ? 'Swap Count' : 'Volume'}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-base-border bg-base-card overflow-hidden">
            {/* Column headers */}
            <div className="grid grid-cols-12 gap-2 px-5 py-2.5 border-b border-base-border bg-base-surface text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Wallet</div>
              <div className="col-span-3 text-right">Swaps</div>
              <div className="col-span-3 text-right">Volume</div>
            </div>

            {isLoading ? (
              <div className="p-4 space-y-2">
                {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : sortedLeaderboard.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-ink-secondary">No traders yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-base-border">
                {sortedLeaderboard.map((w, i) => (
                  <div key={w.address} className="grid grid-cols-12 gap-2 px-5 py-3 items-center hover:bg-base-elevated/40 transition-colors duration-150">
                    <div className="col-span-1">
                      <span className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                        i === 0 ? 'bg-yellow/20 text-yellow' :
                        i === 1 ? 'bg-[#C0C0C0]/20 text-[#C0C0C0]' :
                        i === 2 ? 'bg-[#CD7F32]/20 text-[#CD7F32]' :
                        'bg-base-elevated text-ink-faint',
                      )}>
                        {i + 1}
                      </span>
                    </div>
                    <div className="col-span-5">
                      <a href={etherscanUrl(w.address, 'address')} target="_blank" rel="noopener noreferrer"
                        className="font-mono text-xs text-ink hover:text-brand transition-colors">
                        {shortenAddress(w.address, 6)}
                      </a>
                    </div>
                    <div className="col-span-3 text-right">
                      <p className="text-xs font-semibold text-ink tabular-nums">{w.swapCount}</p>
                    </div>
                    <div className="col-span-3 text-right">
                      <p className="text-xs font-semibold text-ink tabular-nums">{w.volumeStr}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load more */}
            {subgraph.hasMoreSwaps && !isLoading && tab === 'leaderboard' && (
              <div className="border-t border-base-border px-5 py-3 flex justify-center">
                <button
                  onClick={subgraph.loadMoreSwaps}
                  className="text-xs font-semibold text-brand hover:opacity-80 transition-opacity">
                  Load more
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ── Data source footer ────────────────────────────────────── */}
      <div className="rounded-2xl border border-base-border bg-base-surface px-5 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-[11px] text-ink-faint">
            {useSubgraphData
              ? 'The Graph Subgraph v0.1.0 · Historical index from block 11556913 · Auto-refreshes every 30s'
              : 'RPC fallback · Last 50,000 blocks via Alchemy · Limited historical data'}
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <a href="https://thegraph.com/studio/subgraph/bulldex-finance" target="_blank" rel="noopener noreferrer"
              className="text-[11px] text-brand hover:opacity-70 transition-opacity">Graph Studio</a>
            <span className="text-base-border">·</span>
            <a href="https://api.studio.thegraph.com/query/1758303/bulldex-finance/version/latest"
              target="_blank" rel="noopener noreferrer"
              className="text-[11px] text-ink-faint hover:text-ink-secondary transition-colors">GraphQL Playground</a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub, liveValue }: {
  label: string; value: string | null | undefined; sub?: string; liveValue?: string;
}) {
  return (
    <div className="rounded-2xl border border-base-border bg-base-card p-5">
      <p className="text-xs text-ink-faint mb-1">{label}</p>
      {value === null ? (
        <Skeleton className="h-7 w-24 mb-1" />
      ) : (
        <p className="text-2xl font-semibold text-ink tabular-nums">{liveValue ?? value}</p>
      )}
      {sub && <p className="text-[11px] text-ink-faint mt-1">{sub}</p>}
    </div>
  );
}

function PoolStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4">
      <p className="text-[10px] text-ink-faint mb-1">{label}</p>
      <p className="text-sm font-semibold text-ink tabular-nums">{value}</p>
    </div>
  );
}

function ActivityRow({ event, fmtVol }: { event: ActivityEvent; fmtVol: (n: number) => string }) {
  const badge = ACTIVITY_BADGE[event.type];
  const amt = parseFloat(event.amount);
  const amtStr = isNaN(amt) ? '—' : fmtVol(amt);

  return (
    <div className="grid grid-cols-12 gap-2 px-5 py-3 items-center hover:bg-base-elevated/40 transition-colors duration-150">
      {/* Type badge */}
      <div className="col-span-2">
        <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap', badge.color)}>
          {badge.label}
        </span>
      </div>

      {/* Wallet */}
      <div className="col-span-3 min-w-0">
        <a href={etherscanUrl(event.user, 'address')} target="_blank" rel="noopener noreferrer"
          className="font-mono text-xs text-ink-secondary hover:text-brand transition-colors truncate block">
          {shortenAddress(event.user, 4)}
        </a>
      </div>

      {/* Pool */}
      <div className="col-span-2 min-w-0">
        <p className="text-xs text-ink-faint truncate">{poolName(event.pool)}</p>
      </div>

      {/* Amount */}
      <div className="col-span-3 text-right">
        <a href={etherscanUrl(event.txHash, 'tx')} target="_blank" rel="noopener noreferrer"
          className="text-xs font-semibold text-ink tabular-nums hover:text-brand transition-colors">
          {amtStr} {event.token}
        </a>
        {event.amount2 && parseFloat(event.amount2) > 0 && (
          <p className="text-[10px] text-ink-faint">{fmtVol(parseFloat(event.amount2))} {event.token2}</p>
        )}
      </div>

      {/* Time */}
      <div className="col-span-2 text-right">
        <p className="text-[10px] text-ink-faint tabular-nums">{relTime(event.timestamp)}</p>
      </div>
    </div>
  );
}
