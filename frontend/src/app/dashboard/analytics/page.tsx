'use client';

import { useSubgraph } from '@/hooks/useSubgraph';
import { useSwapEvents } from '@/hooks/useSwapEvents';
import { usePriceTicker } from '@/hooks/usePriceTicker';
import { formatUnits } from 'viem';
import { etherscanUrl } from '@/constants/contracts';
import { shortenAddress, shortenHash } from '@/utils/format';
import { cn } from '@/utils/cn';

export default function AnalyticsPage() {
  const subgraph = useSubgraph();
  const rpc      = useSwapEvents();       // fallback
  const { bdxPriceRaw } = usePriceTicker();

  // Use subgraph when synced, otherwise fall back to RPC getLogs
  const useSubgraphData = subgraph.isSynced && !subgraph.error;

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalSwaps    = useSubgraphData
    ? (subgraph.protocol?.totalSwaps ?? 0)
    : rpc.totalSwaps;

  const uniqueWallets = useSubgraphData
    ? (subgraph.protocol?.totalUniqueUsers ?? 0)
    : rpc.uniqueWallets;

  const volumeStr = useSubgraphData
    ? subgraph.protocol?.totalVolumeToken0 ?? '0'
    : formatUnits(rpc.totalVolumeIn, 18);

  const volumeNum = parseFloat(volumeStr);

  function fmtVol(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
    return n.toFixed(0);
  }
  function fmtVolUSD(n: number): string | null {
    if (!bdxPriceRaw) return null;
    const usd = n * bdxPriceRaw;
    return usd >= 1_000 ? `$${(usd / 1_000).toFixed(2)}K` : `$${usd.toFixed(2)}`;
  }

  const isLoading = useSubgraphData ? subgraph.isLoading : rpc.isLoading;

  // ── Leaderboard ────────────────────────────────────────────────────────────
  const leaderboard = useSubgraphData
    ? subgraph.leaderboard.map(u => ({
        address:       u.id,
        swapCount:     u.swapCount,
        volumeDisplay: fmtVol(parseFloat(u.totalAmountIn)),
      }))
    : rpc.leaderboard.map(w => ({
        address:       w.address,
        swapCount:     w.swapCount,
        volumeDisplay: fmtVol(parseFloat(formatUnits(w.amountInTotal, 18))),
      }));

  // ── Recent swaps ───────────────────────────────────────────────────────────
  const recentSwaps = useSubgraphData
    ? subgraph.recentSwaps.map(s => ({
        txHash:  s.txHash,
        sender:  s.sender,
        isBuy:   s.tokenIn.toLowerCase() !== '0x193d18048b343983971bfc50893a720e97322ae5',
        amount:  fmtVol(parseFloat(s.amountIn)),
        pool:    s.pool.id.slice(0, 6) + '...',
      }))
    : rpc.swaps.slice(0, 20).map(s => ({
        txHash:  s.txHash,
        sender:  s.sender,
        isBuy:   s.tokenIn !== '0x193d18048b343983971bfc50893a720e97322ae5',
        amount:  fmtVol(parseFloat(formatUnits(s.amountIn, 18))),
        pool:    s.pool,
      }));

  return (
    <div className="animate-fade-in space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-base font-semibold text-ink">Analytics</h1>
          <p className="mt-0.5 text-xs text-ink-secondary">
            {useSubgraphData
              ? 'Data from The Graph subgraph — full historical index.'
              : 'Data from Alchemy RPC getLogs — last 50,000 blocks.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Source badge */}
          <span className={cn(
            'flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-semibold',
            useSubgraphData
              ? 'border-brand/30 bg-brand/10 text-brand'
              : 'border-base-border bg-base-elevated text-ink-faint',
          )}>
            <span className={cn('h-1.5 w-1.5 rounded-full', useSubgraphData ? 'bg-brand animate-pulse' : 'bg-yellow')} />
            {useSubgraphData ? 'The Graph' : 'RPC Fallback'}
          </span>
          {subgraph.error && !useSubgraphData && (
            <span className="text-[10px] text-yellow">Subgraph: {subgraph.error.slice(0, 40)}</span>
          )}
        </div>
      </div>

      {/* ── Stats row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Swaps"    value={isLoading ? '...' : totalSwaps.toString()}          sub="all pools" />
        <StatCard label="Unique Wallets" value={isLoading ? '...' : uniqueWallets.toString()}        sub="traders + LPs" />
        <StatCard label="Swap Volume"    value={isLoading ? '...' : fmtVol(volumeNum)}              sub={fmtVolUSD(volumeNum) ?? 'price loading'} />
        <StatCard
          label="Active Pools"
          value={isLoading ? '...' : (useSubgraphData ? (subgraph.pools.length.toString()) : '2')}
          sub="BDX/MUSDC + BDX/WETH"
        />
      </div>

      {/* ── Lending stats ────────────────────────────────────────────── */}
      {useSubgraphData && subgraph.lendingProtocol && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Lending Deposits" value={subgraph.lendingProtocol.totalDeposits.toString()} sub="total collateral deposits" />
          <StatCard label="Borrows" value={subgraph.lendingProtocol.totalBorrows.toString()} sub="total borrow events" />
          <StatCard label="Repays" value={subgraph.lendingProtocol.totalRepays.toString()} sub="total repay events" />
          <StatCard label="Liquidations" value={subgraph.lendingProtocol.totalLiquidations.toString()} sub="positions liquidated" />
        </div>
      )}

      {/* ── Main grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Leaderboard */}
        <div className="rounded-2xl border border-base-border bg-base-card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-ink">Leaderboard</p>
            <span className="text-[10px] text-ink-faint uppercase tracking-wider">by swap count</span>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => <div key={i} className="h-10 animate-pulse rounded-lg bg-base-elevated" />)}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-ink-secondary">No swaps found yet.</p>
              <p className="text-xs text-ink-faint mt-1">Be the first to swap on Bulldex!</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {leaderboard.map((w, i) => (
                <div key={w.address} className="flex items-center gap-3 rounded-xl bg-base-surface px-3 py-2.5">
                  <span className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                    i === 0 ? 'bg-yellow/20 text-yellow' :
                    i === 1 ? 'bg-[#C0C0C0]/20 text-[#C0C0C0]' :
                    i === 2 ? 'bg-[#CD7F32]/20 text-[#CD7F32]' :
                    'bg-base-elevated text-ink-faint',
                  )}>
                    {i + 1}
                  </span>
                  <a href={etherscanUrl(w.address, 'address')} target="_blank" rel="noopener noreferrer"
                    className="flex-1 min-w-0 font-mono text-xs text-ink hover:text-brand transition-colors">
                    {shortenAddress(w.address, 4)}
                  </a>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-ink">{w.swapCount} swaps</p>
                    <p className="text-[10px] text-ink-faint">{w.volumeDisplay} vol</p>
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

          {isLoading ? (
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => <div key={i} className="h-10 animate-pulse rounded-lg bg-base-elevated" />)}
            </div>
          ) : recentSwaps.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-ink-secondary">No swaps found yet.</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-80 overflow-y-auto no-scrollbar">
              {recentSwaps.map((s) => (
                <div key={s.txHash} className="flex items-center gap-3 rounded-xl bg-base-surface px-3 py-2.5">
                  <span className={cn(
                    'shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                    s.isBuy ? 'bg-green/10 text-green' : 'bg-red/10 text-red',
                  )}>
                    {s.isBuy ? 'BUY' : 'SELL'}
                  </span>
                  <a href={etherscanUrl(s.txHash, 'tx')} target="_blank" rel="noopener noreferrer"
                    className="flex-1 min-w-0 font-mono text-xs text-ink-secondary hover:text-ink transition-colors truncate">
                    {shortenAddress(s.sender, 4)}
                  </a>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-ink tabular-nums">{s.amount} BDX</p>
                    <p className="text-[10px] text-ink-faint">{s.pool}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pool stats (from subgraph) */}
      {useSubgraphData && subgraph.pools.length > 0 && (
        <div className="rounded-2xl border border-base-border bg-base-card p-5">
          <p className="mb-4 text-sm font-semibold text-ink">Pool Stats</p>
          <div className="space-y-2">
            {subgraph.pools.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl bg-base-surface px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-ink truncate">{p.id}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0 text-xs text-ink-secondary">
                  <span>{p.totalSwaps} swaps</span>
                  <span className="text-ink font-semibold tabular-nums">{fmtVol(parseFloat(p.totalVolumeToken0))} vol</span>
                </div>
                <a href={etherscanUrl(p.id, 'address')} target="_blank" rel="noopener noreferrer"
                  className="text-[11px] text-brand hover:opacity-70 transition-opacity shrink-0">
                  Etherscan
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lending events */}
      {useSubgraphData && subgraph.recentLending.length > 0 && (
        <div className="rounded-2xl border border-base-border bg-base-card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-ink">Recent Lending Events</p>
            <span className="text-[10px] text-ink-faint uppercase tracking-wider">latest first</span>
          </div>
          <div className="space-y-1.5 max-h-60 overflow-y-auto no-scrollbar">
            {subgraph.recentLending.map((e) => (
              <div key={e.id} className="flex items-center gap-3 rounded-xl bg-base-surface px-3 py-2.5">
                <span className={cn(
                  'shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                  e.type === 'deposit' ? 'bg-brand/10 text-brand' : 'bg-blue-500/10 text-blue-400',
                )}>
                  {e.type === 'deposit' ? 'DEPOSIT' : 'BORROW'}
                </span>
                <a href={etherscanUrl(e.txHash, 'tx')} target="_blank" rel="noopener noreferrer"
                  className="flex-1 font-mono text-xs text-ink-secondary hover:text-ink transition-colors truncate">
                  {shortenAddress(e.user, 4)}
                </a>
                <span className="text-xs font-semibold text-ink tabular-nums">
                  {fmtVol(parseFloat(e.amount))} {e.type === 'deposit' ? 'BDX' : 'MUSDC'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data source info */}
      <div className="rounded-2xl border border-base-border bg-base-surface px-5 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-ink">
              {useSubgraphData ? 'The Graph Subgraph — v0.1.0' : 'Falling back to RPC getLogs'}
            </p>
            <p className="text-[11px] text-ink-faint mt-0.5">
              {useSubgraphData
                ? 'Full historical index from block 11556913. Auto-refreshes every 60s.'
                : 'Reading last 50,000 blocks via Alchemy. Deploy key: 1758303/bulldex-finance.'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a href="https://thegraph.com/studio/subgraph/bulldex-finance" target="_blank" rel="noopener noreferrer"
              className="text-[11px] text-brand hover:opacity-70 transition-opacity">
              Graph Studio
            </a>
            <span className="text-base-border">·</span>
            <a href="https://api.studio.thegraph.com/query/1758303/bulldex-finance/version/latest"
              target="_blank" rel="noopener noreferrer"
              className="text-[11px] text-ink-faint hover:text-ink-secondary transition-colors">
              GraphQL Playground
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-base-border bg-base-card p-4">
      <p className="text-xs text-ink-secondary mb-1">{label}</p>
      <p className="text-2xl font-bold text-ink tabular-nums">{value}</p>
      {sub && <p className="text-[11px] text-ink-faint mt-0.5">{sub}</p>}
    </div>
  );
}
