'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Subgraph endpoint ────────────────────────────────────────────────────────

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL ??
  'https://api.studio.thegraph.com/query/1758303/bulldex-finance/version/latest';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SubgraphSwap {
  id:          string;
  sender:      string;
  tokenIn:     string;
  amountIn:    string;
  amountOut:   string;
  blockNumber: string;
  timestamp:   string;
  txHash:      string;
  pool: { id: string };
}

export interface SubgraphLPEvent {
  id:          string;
  user:        string;
  amount0:     string;
  amount1:     string;
  liquidity:   string;
  blockNumber: string;
  timestamp:   string;
  txHash:      string;
  pool:        { id: string };
  type:        'add' | 'remove';
}

export interface SubgraphUser {
  id:            string;
  swapCount:     number;
  totalAmountIn: string;
  firstSeenAt:   string;
  lastSeenAt:    string;
}

export interface SubgraphPool {
  id:                string;
  totalSwaps:        number;
  totalVolumeToken0: string;
  txCount:           number;
}

export interface SubgraphProtocol {
  totalSwaps:        number;
  totalUniqueUsers:  number;
  totalPools:        number;
  totalVolumeToken0: string;
  updatedAt:         string;
}

export interface SubgraphLendingProtocol {
  totalDeposits:        number;
  totalBorrows:         number;
  totalRepays:          number;
  totalWithdraws:       number;
  totalLiquidations:    number;
  totalVolumeDeposited: string;
  totalVolumeBorrowed:  string;
}

export type LendingEventType = 'deposit' | 'borrow' | 'repay' | 'withdraw';

export interface SubgraphLendingEvent {
  id:          string;
  user:        string;
  amount:      string;
  blockNumber: string;
  timestamp:   string;
  txHash:      string;
  type:        LendingEventType;
}

// Unified activity feed event
export type ActivityType = 'swap' | 'lp_add' | 'lp_remove' | 'lend_deposit' | 'lend_borrow' | 'lend_repay' | 'lend_withdraw';

export interface ActivityEvent {
  id:          string;
  type:        ActivityType;
  user:        string;
  amount:      string;
  amount2?:    string;   // second token for LP events
  token:       string;
  token2?:     string;
  blockNumber: number;
  timestamp:   string;
  txHash:      string;
  pool?:       string;
}

export interface SubgraphData {
  protocol:        SubgraphProtocol | null;
  lendingProtocol: SubgraphLendingProtocol | null;
  recentSwaps:     SubgraphSwap[];
  recentLending:   SubgraphLendingEvent[];
  recentLP:        SubgraphLPEvent[];
  allActivity:     ActivityEvent[];   // unified feed, sorted by block desc
  leaderboard:     SubgraphUser[];
  pools:           SubgraphPool[];
  isLoading:       boolean;
  error:           string | null;
  isSynced:        boolean;
  // pagination
  hasMoreSwaps:    boolean;
  hasMoreActivity: boolean;
  loadMoreSwaps:   () => void;
  loadMoreActivity: () => void;
  refresh:         () => void;
}

// ─── GraphQL queries ──────────────────────────────────────────────────────────

function buildMainQuery(swapSkip = 0, swapFirst = 20) {
  return `{
    protocols(first: 1) {
      id totalSwaps totalUniqueUsers totalPools totalVolumeToken0 updatedAt
    }
    swaps(first: ${swapFirst}, skip: ${swapSkip}, orderBy: blockNumber, orderDirection: desc) {
      id sender tokenIn amountIn amountOut blockNumber timestamp txHash
      pool { id }
    }
    users(first: 20, orderBy: swapCount, orderDirection: desc) {
      id swapCount totalAmountIn firstSeenAt lastSeenAt
    }
    pools(first: 10) {
      id totalSwaps totalVolumeToken0 txCount
    }
    liquidityAdds: liquidityEvents(
      first: 20, orderBy: blockNumber, orderDirection: desc,
      where: { type: "add" }
    ) {
      id user amount0 amount1 liquidity blockNumber timestamp txHash
      pool { id }
    }
    liquidityRemoves: liquidityEvents(
      first: 20, orderBy: blockNumber, orderDirection: desc,
      where: { type: "remove" }
    ) {
      id user amount0 amount1 liquidity blockNumber timestamp txHash
      pool { id }
    }
  }`;
}

const LENDING_QUERY = `{
  lendingProtocols(first: 1) {
    id totalDeposits totalBorrows totalRepays totalWithdraws totalLiquidations
    totalVolumeDeposited totalVolumeBorrowed updatedAt
  }
  lendingDeposits(first: 20, orderBy: blockNumber, orderDirection: desc) {
    id user amount blockNumber timestamp txHash
  }
  lendingBorrows(first: 20, orderBy: blockNumber, orderDirection: desc) {
    id user amount blockNumber timestamp txHash
  }
  lendingRepays(first: 20, orderBy: blockNumber, orderDirection: desc) {
    id user amount blockNumber timestamp txHash
  }
  lendingWithdraws(first: 20, orderBy: blockNumber, orderDirection: desc) {
    id user amount blockNumber timestamp txHash
  }
}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function gql(query: string) {
  const res = await window.fetch(SUBGRAPH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? 'GraphQL error');
  return json.data;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSubgraph(): SubgraphData {
  const [swapPage, setSwapPage]     = useState(0);
  const [actPage,  setActPage]      = useState(0);
  const [tick,     setTick]         = useState(0); // manual refresh trigger

  const [data, setData] = useState<Omit<SubgraphData,
    'loadMoreSwaps' | 'loadMoreActivity' | 'refresh'>>({
    protocol:        null,
    lendingProtocol: null,
    recentSwaps:     [],
    recentLending:   [],
    recentLP:        [],
    allActivity:     [],
    leaderboard:     [],
    pools:           [],
    isLoading:       true,
    error:           null,
    isSynced:        false,
    hasMoreSwaps:    false,
    hasMoreActivity: false,
  });

  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      setData(d => ({ ...d, isLoading: true, error: null }));
      try {
        // ── Main query ────────────────────────────────────────────────────────
        const main = await gql(buildMainQuery(swapPage * 20, 21));
        if (cancelled) return;

        const swaps: SubgraphSwap[] = (main.swaps ?? []).slice(0, 20);
        const hasMoreSwaps = (main.swaps ?? []).length > 20;

        // LP events (gracefully handle if not in schema yet)
        const lpAdds:    SubgraphLPEvent[] = ((main.liquidityAdds    ?? []) as any[]).map(
          (e: any) => ({ ...e, type: 'add'    as const })
        );
        const lpRemoves: SubgraphLPEvent[] = ((main.liquidityRemoves ?? []) as any[]).map(
          (e: any) => ({ ...e, type: 'remove' as const })
        );

        // ── Lending query ─────────────────────────────────────────────────────
        let lendingData: any = {};
        try {
          lendingData = await gql(LENDING_QUERY);
        } catch {
          // Lending entities not yet deployed — silent fallback
        }
        if (cancelled) return;

        const deposits  = ((lendingData.lendingDeposits  ?? []) as any[]).map((e: any) => ({ ...e, type: 'deposit'  as LendingEventType }));
        const borrows   = ((lendingData.lendingBorrows   ?? []) as any[]).map((e: any) => ({ ...e, type: 'borrow'   as LendingEventType }));
        const repays    = ((lendingData.lendingRepays    ?? []) as any[]).map((e: any) => ({ ...e, type: 'repay'    as LendingEventType }));
        const withdraws = ((lendingData.lendingWithdraws ?? []) as any[]).map((e: any) => ({ ...e, type: 'withdraw' as LendingEventType }));

        const recentLending: SubgraphLendingEvent[] = [...deposits, ...borrows, ...repays, ...withdraws]
          .sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber))
          .slice(0, 30);

        // ── Unified activity feed ─────────────────────────────────────────────
        const activityEvents: ActivityEvent[] = [
          ...swaps.map((s): ActivityEvent => ({
            id:          s.id,
            type:        'swap',
            user:        s.sender,
            amount:      s.amountIn,
            token:       s.tokenIn,
            blockNumber: Number(s.blockNumber),
            timestamp:   s.timestamp,
            txHash:      s.txHash,
            pool:        s.pool?.id,
          })),
          ...lpAdds.map((e): ActivityEvent => ({
            id:          e.id,
            type:        'lp_add',
            user:        e.user,
            amount:      e.amount0,
            amount2:     e.amount1,
            token:       'BDX',
            token2:      'paired',
            blockNumber: Number(e.blockNumber),
            timestamp:   e.timestamp,
            txHash:      e.txHash,
            pool:        e.pool?.id,
          })),
          ...lpRemoves.map((e): ActivityEvent => ({
            id:          e.id,
            type:        'lp_remove',
            user:        e.user,
            amount:      e.amount0,
            amount2:     e.amount1,
            token:       'BDX',
            token2:      'paired',
            blockNumber: Number(e.blockNumber),
            timestamp:   e.timestamp,
            txHash:      e.txHash,
            pool:        e.pool?.id,
          })),
          ...deposits.map((e: any): ActivityEvent => ({
            id: e.id, type: 'lend_deposit', user: e.user, amount: e.amount,
            token: 'BDX', blockNumber: Number(e.blockNumber), timestamp: e.timestamp, txHash: e.txHash,
          })),
          ...borrows.map((e: any): ActivityEvent => ({
            id: e.id, type: 'lend_borrow', user: e.user, amount: e.amount,
            token: 'MUSDC', blockNumber: Number(e.blockNumber), timestamp: e.timestamp, txHash: e.txHash,
          })),
          ...repays.map((e: any): ActivityEvent => ({
            id: e.id, type: 'lend_repay', user: e.user, amount: e.amount,
            token: 'MUSDC', blockNumber: Number(e.blockNumber), timestamp: e.timestamp, txHash: e.txHash,
          })),
          ...withdraws.map((e: any): ActivityEvent => ({
            id: e.id, type: 'lend_withdraw', user: e.user, amount: e.amount,
            token: 'BDX', blockNumber: Number(e.blockNumber), timestamp: e.timestamp, txHash: e.txHash,
          })),
        ].sort((a, b) => b.blockNumber - a.blockNumber);

        const PAGE_SIZE = 20;
        const pagedActivity = activityEvents.slice(0, (actPage + 1) * PAGE_SIZE);
        const hasMoreActivity = activityEvents.length > (actPage + 1) * PAGE_SIZE;

        setData({
          protocol:        main.protocols?.[0] ?? null,
          lendingProtocol: lendingData.lendingProtocols?.[0] ?? null,
          recentSwaps:     swaps,
          recentLending,
          recentLP:        [...lpAdds, ...lpRemoves].sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber)),
          allActivity:     pagedActivity,
          leaderboard:     main.users ?? [],
          pools:           main.pools ?? [],
          isLoading:       false,
          error:           null,
          isSynced:        true,
          hasMoreSwaps,
          hasMoreActivity,
        });
      } catch (e) {
        if (!cancelled) {
          setData(d => ({
            ...d,
            isLoading: false,
            error:     e instanceof Error ? e.message : 'Subgraph query failed',
            isSynced:  false,
          }));
        }
      }
    }

    fetchAll();
    // Auto-refresh every 30s
    const interval = setInterval(fetchAll, 30_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [swapPage, actPage, tick]);

  return {
    ...data,
    loadMoreSwaps:    () => setSwapPage(p => p + 1),
    loadMoreActivity: () => setActPage(p => p + 1),
    refresh,
  };
}
