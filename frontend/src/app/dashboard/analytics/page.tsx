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

type TxFilter  = 'all' | 'swap' | 'lp' | 'lend';
type SortKey   = 'swapCount' | 'volume';

// ── Badge config ──────────────────────────────────────────────────────────────

const ACTIVITY_BADGE: Record<ActivityType, { label: string; color: string }> = {
  swap:          { label: 'SWAP',     color: 'bg-brand/10 text-brand' },
  lp_add:        { label: 'ADD LP',   color: 'bg-green/10 text-green' },
  lp_remove:     { label: 'REM LP',   color: 'bg-yellow/10 text-yellow' },
  lend_deposit:  { label: 'DEPOSIT',  color: 'bg-brand/10 text-brand' },
  lend_borrow:   { label: 'BORROW',   color: 'bg-red/10 text-red' },
  lend_repay:    { label: 'REPAY',    color: 'bg-green/10 text-green' },
  lend_withdraw: { label: 'WITHDRAW', color: 'bg-base-elevated text-ink-secondary' },
};

function txFilterMatch(type: ActivityType, f: TxFilter): boolean {
  if (f === 'all')  return true;
  if (f === 'swap') return type === 'swap';
  if (f === 'lp')   return type === 'lp_add' || type === 'lp_remove';
  if (f === 'lend') return type.startsWith('lend_');
  return true;
}

function poolName(id: string | undefined): string {
  if (!id) return '—';
  const a = id.toLowerCase();
  if (a === CONTRACT_ADDRESSES.pool.toLowerCase())        return 'BDX/MUSDC';
  if (a === CONTRACT_ADDRESSES.poolBdxWeth.toLowerCase()) return 'BDX/WETH';
  return id.slice(0, 6) + '…' + id.slice(-4);
}

function relTime(ts: string): string {
  const sec = Math.floor(Date.now() / 1000) - Number(ts);
  if (sec < 60)    return `${sec}s ago`;
  if (sec < 3600)  return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const subgraph  = useSubgraph();
  const rpc       = useSwapEvents(subgraph.isSynced && !subgraph.error);
  const { bdxPriceRaw } = usePriceTicker();
  const lendStats = useLendingStats();

  const [txFilter, setTxFilter] = useState<TxFilter>('all');
  const [sortKey,  setSortKey]  = useState<SortKey>('swapCount');

  const useSubgraphData = subgraph.isSynced && !subgraph.error;
  const isLoading = useSubgraphData ? subgraph.isLoading : rpc.isLoading;

  // ── Formatters ────────────────────────────────────────────────────────────
  function fmtVol(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
    return n.toFixed(2);
  }
  function fmtUSD(n: number): string | null {
    if (!bdxPriceRaw || bdxPriceRaw === 0) return null;
    const usd = n * bdxPriceRaw;
    if (usd >= 1_000) return `$${(usd / 1_000).toFixed(2)}K`;
    return `$${usd.toFixed(2)}`;
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalSwaps    = useSubgraphData ? (subgraph.protocol?.totalSwaps ?? 0)       : rpc.totalSwaps;
  const uniqueWallets = useSubgraphData ? (subgraph.protocol?.totalUniqueUsers ?? 0) : rpc.uniqueWallets;
  const volumeNum     = parseFloat(
    useSubgraphData
      ? (subgraph.protocol?.totalVolumeToken0 ?? '0')
      : formatUnits(rpc.totalVolumeIn, 18),
  );
  const lpAdds    = subgraph.recentLP.filter(e => e.type === 'add').length;
  const lpRemoves = subgraph.recentLP.filter(e => e.type === 'remove').length;

  // ── Filtered activity ─────────────────────────────────────────────────────
  const filteredActivity = useMemo(() =>
    subgraph.allActivity.filter(e => txFilterMatch(e.type, txFilter)),
    [subgraph.allActivity, txFilter],
  );

  // ── Sorted leaderboard ────────────────────────────────────────────────────
  const sortedLeaderboard = useMemo(() => {
    const lb = useSubgraphData
      ? subgraph.leaderboard.map(u => ({
          address:   u.id,
          swapCount: u.swapCount,
          volume:    parseFloat(u.totalAmountIn),
          volumeStr: fmtVol(parseFloat(u.totalAmountIn)),
        }))
      : rpc.leaderboard.map(w => ({
          address:   w.address,
          swapCount: w.swapCount,
          volume:    parseFloat(formatUnits(w.amountInTotal, 18)),
          volumeStr: fmtVol(parseFloat(formatUnits(w.amountInTotal, 18))),
        }));
    return [...lb].sort((a, b) =>
      sortKey === 'swapCount' ? b.swapCount - a.swapCount : b.volume - a.volume
    );
  }, [useSubgraphData, subgraph.leaderboard, rpc.leaderboard, sortKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in space-y-4">

      {/* ── Header ────────────────────────────────────────────────────── */}
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

      {/* ── ROW 1: Stat chips + Transaction feed ──────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* ── Left: Compact stats ─────────────────────────────────────── */}
        <div className="flex flex-col gap-3">

          {/* Swap + Liquidity stats */}
          <div className="rounded-2xl border border-base-border bg-base-card p-5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint mb-3">Protocol Activity</p>
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="Total Swaps"    value={isLoading ? null : totalSwaps.toString()}    />
              <MiniStat label="Unique Wallets" value={isLoading ? null : uniqueWallets.toString()} />
              <MiniStat label="Swap Volume"    value={isLoading ? null : fmtVol(volumeNum)}        sub={fmtUSD(volumeNum) ?? undefined} />
              <MiniStat label="Active Pools"   value={isLoading ? null : (useSubgraphData ? subgraph.pools.length.toString() : '2')} />
            </div>

            {useSubgraphData && (
              <>
                <div className="my-3 h-px bg-base-border" />
                <div className="grid grid-cols-3 gap-2">
                  <MiniStat label="LP Adds"    value={lpAdds.toString()} small />
                  <MiniStat label="LP Removes" value={lpRemoves.toString()} small />
                  <MiniStat label="LP Events"  value={(lpAdds + lpRemoves).toString()} small />
                </div>
              </>
            )}
          </div>

          {/* Lending stats */}
          <div className="rounded-2xl border border-base-border bg-base-card p-5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint mb-3">Lending</p>
            {useSubgraphData && subgraph.lendingProtocol ? (
              <div className="grid grid-cols-2 gap-3">
                <MiniStat label="Deposits"    value={subgraph.lendingProtocol.totalDeposits.toString()} />
                <MiniStat label="Borrows"     value={subgraph.lendingProtocol.totalBorrows.toString()} />
                <MiniStat label="Repays"      value={subgraph.lendingProtocol.totalRepays.toString()} />
                <MiniStat label="Liquidations" value={subgraph.lendingProtocol.totalLiquidations.toString()} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <MiniStat label="Total Supplied" value={`${parseFloat(formatUnits(lendStats.totalCollateral, 18)).toFixed(2)}`} sub="BDX" />
                <MiniStat label="Total Borrowed" value={`${parseFloat(formatUnits(lendStats.totalBorrowed, 18)).toFixed(2)}`}   sub="MUSDC" />
                <MiniStat label="Available Liq." value={`${parseFloat(formatUnits(lendStats.reserveBalance, 18)).toFixed(0)}`}  sub="MUSDC" />
                <MiniStat label="Borrow Rate"    value="~5% APR" />
              </div>
            )}
          </div>

          {/* Pool cards */}
          {useSubgraphData && subgraph.pools.length > 0 && (
            <div className="rounded-2xl border border-base-border bg-base-card p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint mb-3">Pools</p>
              <div className="space-y-2">
                {subgraph.pools.map(p => (
                  <div key={p.id} className="rounded-xl bg-base-surface px-3 py-2.5 flex items-center justify-between hover:bg-base-elevated/40 transition-colors">
                    <div>
                      <p className="text-xs font-semibold text-ink">{poolName(p.id)}</p>
                      <p className="text-[10px] text-ink-faint font-mono">{p.id.slice(0, 8)}…{p.id.slice(-4)}</p>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <p className="text-xs font-semibold text-ink tabular-nums">{fmtVol(parseFloat(p.totalVolumeToken0))}</p>
                        <p className="text-[10px] text-ink-faint">vol</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-ink tabular-nums">{p.totalSwaps}</p>
                        <p className="text-[10px] text-ink-faint">swaps</p>
                      </div>
                      <a href={etherscanUrl(p.id, 'address')} target="_blank" rel="noopener noreferrer"
                        className="text-[11px] text-brand hover:opacity-70 transition-opacity">↗</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Transaction feed (2 cols) ────────────────────────── */}
        <div className="lg:col-span-2 rounded-2xl border border-base-border bg-base-card overflow-hidden flex flex-col">

          {/* Feed header + filter chips */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-base-border flex-wrap">
            <h2 className="text-sm font-semibold text-ink">Transaction History</h2>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['all', 'swap', 'lp', 'lend'] as TxFilter[]).map(f => (
                <button key={f}
                  onClick={() => setTxFilter(f)}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition-colors',
                    txFilter === f
                      ? 'border-brand/30 bg-brand/10 text-brand'
                      : 'border-base-border bg-base-elevated text-ink-secondary hover:text-ink',
                  )}>
                  {f === 'all' ? 'All' : f === 'lp' ? 'Liquidity' : f === 'lend' ? 'Lending' : 'Swaps'}
                </button>
              ))}
              <span className="text-[10px] text-ink-faint ml-1">{filteredActivity.length} events</span>
            </div>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-12 gap-2 px-5 py-2 border-b border-base-border bg-base-surface text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
            <div className="col-span-2">Type</div>
            <div className="col-span-3">Wallet</div>
            <div className="col-span-2">Pool</div>
            <div className="col-span-3 text-right">Amount</div>
            <div className="col-span-2 text-right">Time</div>
          </div>

          {/* Rows */}
          <div className="flex-1 overflow-y-auto divide-y divide-base-border">
            {isLoading && filteredActivity.length === 0 ? (
              <div className="p-4 space-y-2">
                {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : filteredActivity.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-ink-secondary">No activity yet.</p>
                <p className="text-xs text-ink-faint mt-1">Transactions will appear here as they happen.</p>
              </div>
            ) : (
              filteredActivity.map(e => <ActivityRow key={e.id} event={e} fmtVol={fmtVol} />)
            )}
          </div>

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

      {/* ── ROW 2: Leaderboard ────────────────────────────────────────── */}
      <div className="rounded-2xl border border-base-border bg-base-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-base-border flex-wrap gap-2">
          <h2 className="text-sm font-semibold text-ink">Leaderboard</h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-ink-faint">Sort by:</span>
            {(['swapCount', 'volume'] as SortKey[]).map(k => (
              <button key={k}
                onClick={() => setSortKey(k)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition-colors',
                  sortKey === k
                    ? 'border-brand/30 bg-brand/10 text-brand'
                    : 'border-base-border bg-base-elevated text-ink-secondary hover:text-ink',
                )}>
                {k === 'swapCount' ? 'Swap Count' : 'Volume'}
              </button>
            ))}
          </div>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-12 gap-2 px-5 py-2 border-b border-base-border bg-base-surface text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
          <div className="col-span-1">#</div>
          <div className="col-span-6">Wallet</div>
          <div className="col-span-2 text-right">Swaps</div>
          <div className="col-span-3 text-right">Volume</div>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : sortedLeaderboard.length === 0 ? (
          <div className="py-10 text-center">
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
                  )}>{i + 1}</span>
                </div>
                <div className="col-span-6">
                  <a href={etherscanUrl(w.address, 'address')} target="_blank" rel="noopener noreferrer"
                    className="font-mono text-xs text-ink hover:text-brand transition-colors">
                    {shortenAddress(w.address, 8)}
                  </a>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-xs font-semibold text-ink tabular-nums">{w.swapCount}</p>
                </div>
                <div className="col-span-3 text-right">
                  <p className="text-xs font-semibold text-ink tabular-nums">{w.volumeStr}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {subgraph.hasMoreSwaps && !isLoading && (
          <div className="border-t border-base-border px-5 py-3 flex justify-center">
            <button onClick={subgraph.loadMoreSwaps}
              className="text-xs font-semibold text-brand hover:opacity-80 transition-opacity">
              Load more
            </button>
          </div>
        )}
      </div>

      {/* ── Footer ────────────────────────────────────────────────────── */}
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

function MiniStat({ label, value, sub, small }: {
  label: string; value: string | null; sub?: string; small?: boolean;
}) {
  return (
    <div className="rounded-xl bg-base-surface px-3 py-2.5">
      <p className="text-[10px] text-ink-faint mb-1">{label}</p>
      {value === null
        ? <Skeleton className="h-5 w-16" />
        : <p className={cn('font-semibold text-ink tabular-nums', small ? 'text-sm' : 'text-lg')}>{value}</p>
      }
      {sub && <p className="text-[10px] text-ink-faint mt-0.5">{sub}</p>}
    </div>
  );
}

function ActivityRow({ event, fmtVol }: { event: ActivityEvent; fmtVol: (n: number) => string }) {
  const badge  = ACTIVITY_BADGE[event.type];
  const amt    = parseFloat(event.amount);
  const amt2   = event.amount2 ? parseFloat(event.amount2) : null;
  const amtStr = isNaN(amt) ? '—' : fmtVol(amt);
  const amt2Str = amt2 !== null && !isNaN(amt2) && amt2 > 0 ? fmtVol(amt2) : null;
  const isSwap = event.type === 'swap';

  return (
    <div className="grid grid-cols-12 gap-2 px-5 py-3 items-center hover:bg-base-elevated/40 transition-colors duration-150">
      <div className="col-span-2">
        <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap', badge.color)}>
          {badge.label}
        </span>
      </div>
      <div className="col-span-3 min-w-0">
        <a href={etherscanUrl(event.user, 'address')} target="_blank" rel="noopener noreferrer"
          className="font-mono text-xs text-ink-secondary hover:text-brand transition-colors truncate block">
          {shortenAddress(event.user, 4)}
        </a>
      </div>
      <div className="col-span-2 min-w-0">
        <p className="text-xs text-ink-faint truncate">{poolName(event.pool)}</p>
      </div>
      <div className="col-span-3 text-right">
        <a href={etherscanUrl(event.txHash, 'tx')} target="_blank" rel="noopener noreferrer"
          className="hover:text-brand transition-colors">
          {isSwap && amt2Str ? (
            /* Swap: show "10 BDX → 500 MUSDC" */
            <p className="text-xs font-semibold text-ink tabular-nums">
              {amtStr} {event.token} → {amt2Str} {event.token2}
            </p>
          ) : (
            <p className="text-xs font-semibold text-ink tabular-nums">
              {amtStr} {event.token}
            </p>
          )}
          {/* LP paired amount */}
          {!isSwap && amt2Str && (
            <p className="text-[10px] text-ink-faint">{amt2Str} {event.token2}</p>
          )}
        </a>
      </div>
      <div className="col-span-2 text-right">
        <p className="text-[10px] text-ink-faint tabular-nums">{relTime(event.timestamp)}</p>
      </div>
    </div>
  );
}
