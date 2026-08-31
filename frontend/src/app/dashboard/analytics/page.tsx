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

type TxFilter = 'all' | 'swap' | 'lp' | 'lend';
type SortKey  = 'swapCount' | 'volume';

// ── Activity badge config ─────────────────────────────────────────────────────

const ACTIVITY_BADGE: Record<ActivityType, { label: string; color: string }> = {
  swap:          { label: 'SWAP',     color: 'bg-[rgba(16,185,129,0.1)] text-[#10b981]' },
  lp_add:        { label: 'ADD LP',   color: 'bg-[rgba(34,197,94,0.08)] text-[#22c55e]' },
  lp_remove:     { label: 'REM LP',   color: 'bg-[rgba(245,158,11,0.08)] text-[#f59e0b]' },
  lend_deposit:  { label: 'DEPOSIT',  color: 'bg-[rgba(16,185,129,0.1)] text-[#10b981]' },
  lend_borrow:   { label: 'BORROW',   color: 'bg-[rgba(239,68,68,0.08)] text-[#ef4444]' },
  lend_repay:    { label: 'REPAY',    color: 'bg-[rgba(34,197,94,0.08)] text-[#22c55e]' },
  lend_withdraw: { label: 'WITHDRAW', color: 'bg-[#1e1e1e] text-[#a3a3a3]' },
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

  const totalSwaps    = useSubgraphData ? (subgraph.protocol?.totalSwaps ?? 0)       : rpc.totalSwaps;
  const uniqueWallets = useSubgraphData ? (subgraph.protocol?.totalUniqueUsers ?? 0) : rpc.uniqueWallets;
  const volumeNum     = parseFloat(
    useSubgraphData
      ? (subgraph.protocol?.totalVolumeToken0 ?? '0')
      : formatUnits(rpc.totalVolumeIn, 18),
  );
  const lpAdds    = subgraph.recentLP.filter(e => e.type === 'add').length;
  const lpRemoves = subgraph.recentLP.filter(e => e.type === 'remove').length;

  const filteredActivity = useMemo(() =>
    subgraph.allActivity.filter(e => txFilterMatch(e.type, txFilter)),
    [subgraph.allActivity, txFilter],
  );

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
    <div className="animate-fade-in space-y-5">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[28px] font-semibold text-[#f5f5f5] tracking-tight">Analytics</h1>
          <p className="mt-0.5 text-[13px] text-[#a3a3a3]">
            {useSubgraphData
              ? 'Full historical index via The Graph subgraph.'
              : 'The Graph unavailable — showing RPC fallback data.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={subgraph.refresh}
            className="flex items-center gap-1.5 h-7 rounded-md border border-[#262626] bg-[#111111] px-2.5 text-[12px] text-[#a3a3a3] hover:border-[#2e2e2e] hover:text-[#f5f5f5] transition-colors">
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
          <span className={cn(
            'flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium h-7',
            useSubgraphData
              ? 'border-[#064e3b] bg-[rgba(16,185,129,0.08)] text-[#10b981]'
              : 'border-[#262626] bg-[#1e1e1e] text-[#525252]',
          )}>
            <span className={cn('h-1.5 w-1.5 rounded-full', useSubgraphData ? 'bg-[#10b981] animate-pulse' : 'bg-[#f59e0b]')} />
            {useSubgraphData ? 'The Graph' : 'RPC Fallback'}
          </span>
        </div>
      </div>

      {/* ── KPI strip ─────────────────────────────────────────────────── */}
      <div className="flex items-start gap-0 border-b border-[#262626] pb-4 overflow-x-auto no-scrollbar">
        {[
          { label: 'Total Swaps',    value: isLoading ? null : totalSwaps.toString()    },
          { label: 'Unique Wallets', value: isLoading ? null : uniqueWallets.toString() },
          { label: 'Swap Volume',    value: isLoading ? null : fmtVol(volumeNum), sub: fmtUSD(volumeNum) ?? undefined },
          { label: 'LP Adds',        value: isLoading ? null : lpAdds.toString()        },
          { label: 'LP Removes',     value: isLoading ? null : lpRemoves.toString()     },
          { label: 'Active Pools',   value: isLoading ? null : (useSubgraphData ? subgraph.pools.length.toString() : '2') },
        ].map((m, i, arr) => (
          <div key={m.label} className={cn(
            'flex flex-col gap-1 px-4 first:pl-0 shrink-0',
            i < arr.length - 1 && 'border-r border-[#262626] pr-4',
          )}>
            <span className="text-[11px] text-[#525252] whitespace-nowrap">{m.label}</span>
            {m.value === null
              ? <Skeleton className="h-6 w-14 rounded" />
              : <span className="font-mono text-[20px] font-semibold text-[#f5f5f5] tabular-nums leading-none">{m.value}</span>
            }
            {m.sub && <span className="text-[10px] text-[#525252]">{m.sub}</span>}
          </div>
        ))}
      </div>

      {/* ── Main grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* ── Left: Stats cards ───────────────────────────────────────── */}
        <div className="flex flex-col gap-3">

          {/* Protocol activity */}
          <div className="rounded-lg border border-[#1e1e1e] bg-[#111111] p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#525252] mb-3">Protocol Activity</p>
            <div className="grid grid-cols-2 gap-2">
              <StatCell label="Total Swaps"    value={isLoading ? null : totalSwaps.toString()} />
              <StatCell label="Unique Wallets" value={isLoading ? null : uniqueWallets.toString()} />
              <StatCell label="Swap Volume"    value={isLoading ? null : fmtVol(volumeNum)} sub={fmtUSD(volumeNum) ?? undefined} />
              <StatCell label="Active Pools"   value={isLoading ? null : (useSubgraphData ? subgraph.pools.length.toString() : '2')} />
            </div>
            {useSubgraphData && (
              <>
                <div className="my-3 h-px bg-[#1a1a1a]" />
                <div className="grid grid-cols-3 gap-2">
                  <StatCell label="LP Adds"    value={lpAdds.toString()} small />
                  <StatCell label="LP Removes" value={lpRemoves.toString()} small />
                  <StatCell label="LP Events"  value={(lpAdds + lpRemoves).toString()} small />
                </div>
              </>
            )}
          </div>

          {/* Lending */}
          <div className="rounded-lg border border-[#1e1e1e] bg-[#111111] p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#525252] mb-3">Lending</p>
            {useSubgraphData && subgraph.lendingProtocol ? (
              <div className="grid grid-cols-2 gap-2">
                <StatCell label="Deposits"     value={subgraph.lendingProtocol.totalDeposits.toString()} />
                <StatCell label="Borrows"      value={subgraph.lendingProtocol.totalBorrows.toString()} />
                <StatCell label="Repays"       value={subgraph.lendingProtocol.totalRepays.toString()} />
                <StatCell label="Liquidations" value={subgraph.lendingProtocol.totalLiquidations.toString()} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <StatCell label="Total Supplied" value={`${parseFloat(formatUnits(lendStats.totalCollateral, 18)).toFixed(2)}`} sub="BDX" />
                <StatCell label="Total Borrowed" value={`${parseFloat(formatUnits(lendStats.totalBorrowed, 18)).toFixed(2)}`}   sub="MUSDC" />
                <StatCell label="Available Liq." value={`${parseFloat(formatUnits(lendStats.reserveBalance, 18)).toFixed(0)}`}  sub="MUSDC" />
                <StatCell label="Borrow Rate"    value="~5% APR" />
              </div>
            )}
          </div>

          {/* Pools */}
          {useSubgraphData && subgraph.pools.length > 0 && (
            <div className="rounded-lg border border-[#1e1e1e] bg-[#111111] p-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#525252] mb-3">Pools</p>
              <div className="space-y-1.5">
                {subgraph.pools.map(p => (
                  <div key={p.id} className="rounded-md bg-[#161616] px-3 py-2 flex items-center justify-between hover:bg-[#1e1e1e] transition-colors">
                    <div>
                      <p className="text-[12px] font-medium text-[#f5f5f5]">{poolName(p.id)}</p>
                      <p className="text-[10px] text-[#525252] font-mono">{p.id.slice(0, 8)}…{p.id.slice(-4)}</p>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <p className="text-[12px] font-semibold font-mono text-[#f5f5f5] tabular-nums">{fmtVol(parseFloat(p.totalVolumeToken0))}</p>
                        <p className="text-[10px] text-[#525252]">vol</p>
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold font-mono text-[#f5f5f5] tabular-nums">{p.totalSwaps}</p>
                        <p className="text-[10px] text-[#525252]">swaps</p>
                      </div>
                      <a href={etherscanUrl(p.id, 'address')} target="_blank" rel="noopener noreferrer"
                        className="text-[11px] text-[#10b981] hover:text-[#34d399] transition-colors">↗</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Transaction feed ──────────────────────────────────── */}
        <div className="lg:col-span-2 rounded-lg border border-[#1e1e1e] bg-[#111111] overflow-hidden flex flex-col">

          {/* Header + filters */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#1a1a1a] flex-wrap">
            <span className="text-[13px] font-medium text-[#f5f5f5]">Transaction History</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['all', 'swap', 'lp', 'lend'] as TxFilter[]).map(f => (
                <button key={f}
                  onClick={() => setTxFilter(f)}
                  className={cn(
                    'h-6 rounded-md px-2.5 text-[11px] font-medium border transition-colors',
                    txFilter === f
                      ? 'border-[#064e3b] bg-[rgba(16,185,129,0.08)] text-[#10b981]'
                      : 'border-[#262626] bg-[#111111] text-[#a3a3a3] hover:text-[#f5f5f5]',
                  )}>
                  {f === 'all' ? 'All' : f === 'lp' ? 'Liquidity' : f === 'lend' ? 'Lending' : 'Swaps'}
                </button>
              ))}
              <span className="text-[10px] text-[#525252] ml-1">{filteredActivity.length} events</span>
            </div>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-[#1a1a1a] text-[11px] font-medium text-[#525252]">
            <div className="col-span-2">Type</div>
            <div className="col-span-3">Wallet</div>
            <div className="col-span-2">Pool</div>
            <div className="col-span-3 text-right">Amount</div>
            <div className="col-span-2 text-right">Time</div>
          </div>

          {/* Rows */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#1a1a1a]">
            {isLoading && filteredActivity.length === 0 ? (
              <div className="p-3 space-y-1.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full rounded" />
                ))}
              </div>
            ) : filteredActivity.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-[13px] text-[#a3a3a3]">No activity yet.</p>
                <p className="text-[12px] text-[#525252] mt-1">Transactions will appear here as they happen.</p>
              </div>
            ) : (
              filteredActivity.map(e => <ActivityRow key={e.id} event={e} fmtVol={fmtVol} />)
            )}
          </div>

          {subgraph.hasMoreActivity && !isLoading && (
            <div className="border-t border-[#1a1a1a] px-4 py-2.5 flex justify-center">
              <button onClick={subgraph.loadMoreActivity}
                className="text-[12px] font-medium text-[#10b981] hover:text-[#34d399] transition-colors">
                Loading more assets...
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Leaderboard ─────────────────────────────────────────────── */}
      <div className="rounded-lg border border-[#1e1e1e] bg-[#111111] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a] flex-wrap gap-2">
          <span className="text-[13px] font-medium text-[#f5f5f5]">Leaderboard</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#525252]">Sort:</span>
            {(['swapCount', 'volume'] as SortKey[]).map(k => (
              <button key={k} onClick={() => setSortKey(k)}
                className={cn(
                  'h-6 rounded-md px-2.5 text-[11px] font-medium border transition-colors',
                  sortKey === k
                    ? 'border-[#064e3b] bg-[rgba(16,185,129,0.08)] text-[#10b981]'
                    : 'border-[#262626] bg-[#111111] text-[#a3a3a3] hover:text-[#f5f5f5]',
                )}>
                {k === 'swapCount' ? 'Swap Count' : 'Volume'}
              </button>
            ))}
          </div>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-[#1a1a1a] text-[11px] font-medium text-[#525252]">
          <div className="col-span-1">#</div>
          <div className="col-span-7">Wallet</div>
          <div className="col-span-2 text-right">Swaps</div>
          <div className="col-span-2 text-right">Volume</div>
        </div>

        {isLoading ? (
          <div className="p-3 space-y-1.5">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9 w-full rounded" />)}
          </div>
        ) : sortedLeaderboard.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-[13px] text-[#a3a3a3]">No traders yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1a1a1a]">
            {sortedLeaderboard.map((w, i) => (
              <div key={w.address} className="grid grid-cols-12 gap-2 px-4 h-9 items-center hover:bg-[#161616] transition-colors">
                <div className="col-span-1">
                  <span className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                    i === 0 ? 'bg-[rgba(245,158,11,0.15)] text-[#f59e0b]' :
                    i === 1 ? 'bg-[rgba(160,160,160,0.15)] text-[#a3a3a3]' :
                    i === 2 ? 'bg-[rgba(205,127,50,0.15)] text-[#cd7f32]' :
                    'bg-[#1e1e1e] text-[#525252]',
                  )}>{i + 1}</span>
                </div>
                <div className="col-span-7">
                  <a href={etherscanUrl(w.address, 'address')} target="_blank" rel="noopener noreferrer"
                    className="font-mono text-[12px] text-[#a3a3a3] hover:text-[#10b981] transition-colors">
                    {shortenAddress(w.address, 8)}
                  </a>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-[12px] font-mono font-medium text-[#f5f5f5] tabular-nums">{w.swapCount}</span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-[12px] font-mono font-medium text-[#f5f5f5] tabular-nums">{w.volumeStr}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {subgraph.hasMoreSwaps && !isLoading && (
          <div className="border-t border-[#1a1a1a] px-4 py-2.5 flex justify-center">
            <button onClick={subgraph.loadMoreSwaps}
              className="text-[12px] font-medium text-[#10b981] hover:text-[#34d399] transition-colors">
              Load more
            </button>
          </div>
        )}
      </div>

      {/* ── Footer / data source ─────────────────────────────────────── */}
      <div className="rounded-lg border border-[#1e1e1e] bg-[#111111] px-4 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-[11px] text-[#525252]">
            {useSubgraphData
              ? 'The Graph Subgraph v0.1.0 · Historical index from block 11556913 · Auto-refreshes every 30s'
              : 'RPC fallback · Last 50,000 blocks via Alchemy · Limited historical data'}
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <a href="https://thegraph.com/studio/subgraph/bulldex-finance" target="_blank" rel="noopener noreferrer"
              className="text-[11px] text-[#10b981] hover:text-[#34d399] transition-colors">Graph Studio ↗</a>
            <span className="text-[#262626]">·</span>
            <a href="https://api.studio.thegraph.com/query/1758303/bulldex-finance/version/latest" target="_blank" rel="noopener noreferrer"
              className="text-[11px] text-[#525252] hover:text-[#a3a3a3] transition-colors">GraphQL Playground ↗</a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCell({ label, value, sub, small }: {
  label: string; value: string | null; sub?: string; small?: boolean;
}) {
  return (
    <div className="rounded-md bg-[#161616] px-3 py-2">
      <p className="text-[10px] text-[#525252] mb-0.5">{label}</p>
      {value === null
        ? <Skeleton className="h-5 w-14 rounded" />
        : <p className={cn('font-mono font-semibold text-[#f5f5f5] tabular-nums', small ? 'text-[13px]' : 'text-[16px]')}>{value}</p>
      }
      {sub && <p className="text-[10px] text-[#525252] mt-0.5">{sub}</p>}
    </div>
  );
}

function ActivityRow({ event, fmtVol }: { event: ActivityEvent; fmtVol: (n: number) => string }) {
  const badge   = ACTIVITY_BADGE[event.type];
  const amt     = parseFloat(event.amount);
  const amt2    = event.amount2 ? parseFloat(event.amount2) : null;
  const amtStr  = isNaN(amt) ? '—' : fmtVol(amt);
  const amt2Str = amt2 !== null && !isNaN(amt2) && amt2 > 0 ? fmtVol(amt2) : null;
  const isSwap  = event.type === 'swap';

  return (
    <div className="grid grid-cols-12 gap-2 px-4 h-9 items-center hover:bg-[#161616] transition-colors">
      <div className="col-span-2">
        <span className={cn('rounded-sm px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap', badge.color)}>
          {badge.label}
        </span>
      </div>
      <div className="col-span-3 min-w-0">
        <a href={etherscanUrl(event.user, 'address')} target="_blank" rel="noopener noreferrer"
          className="font-mono text-[11px] text-[#a3a3a3] hover:text-[#10b981] transition-colors truncate block">
          {shortenAddress(event.user, 4)}
        </a>
      </div>
      <div className="col-span-2 min-w-0">
        <p className="text-[11px] text-[#525252] truncate">{poolName(event.pool)}</p>
      </div>
      <div className="col-span-3 text-right">
        <a href={etherscanUrl(event.txHash, 'tx')} target="_blank" rel="noopener noreferrer"
          className="hover:text-[#10b981] transition-colors">
          {isSwap && amt2Str ? (
            <p className="text-[12px] font-mono font-medium text-[#f5f5f5] tabular-nums">
              {amtStr} → {amt2Str}
            </p>
          ) : (
            <p className="text-[12px] font-mono font-medium text-[#f5f5f5] tabular-nums">
              {amtStr} {event.token}
            </p>
          )}
          {!isSwap && amt2Str && (
            <p className="text-[10px] text-[#525252]">{amt2Str} {event.token2}</p>
          )}
        </a>
      </div>
      <div className="col-span-2 text-right">
        <p className="text-[10px] text-[#525252] tabular-nums">{relTime(event.timestamp)}</p>
      </div>
    </div>
  );
}
