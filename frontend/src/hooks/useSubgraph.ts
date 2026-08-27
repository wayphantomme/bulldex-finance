'use client';

import { useState, useEffect } from 'react';

// ─── Subgraph endpoint ────────────────────────────────────────────────────────

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL ??
  'https://api.studio.thegraph.com/query/1758303/bulldex-finance/version/latest';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SubgraphSwap {
  id:          string;
  sender:      string;
  tokenIn:     string;
  amountIn:    string;  // BigDecimal string
  amountOut:   string;
  blockNumber: string;
  timestamp:   string;
  txHash:      string;
  pool: { id: string };
}

export interface SubgraphUser {
  id:              string;   // wallet address
  swapCount:       number;
  totalAmountIn:   string;   // BigDecimal string
  firstSeenAt:     string;
  lastSeenAt:      string;
}

export interface SubgraphPool {
  id:                  string;
  totalSwaps:          number;
  totalVolumeToken0:   string;
  txCount:             number;
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
  totalLiquidations:    number;
  totalVolumeDeposited: string;
  totalVolumeBorrowed:  string;
}

export interface SubgraphLendingEvent {
  id:          string;
  user:        string;
  amount:      string;
  blockNumber: string;
  timestamp:   string;
  txHash:      string;
  type:        'deposit' | 'borrow';
}

export interface SubgraphData {
  protocol:          SubgraphProtocol | null;
  lendingProtocol:   SubgraphLendingProtocol | null;
  recentSwaps:       SubgraphSwap[];
  recentLending:     SubgraphLendingEvent[];
  leaderboard:       SubgraphUser[];
  pools:             SubgraphPool[];
  isLoading:         boolean;
  error:             string | null;
  isSynced:          boolean;
}

// ─── GraphQL queries ──────────────────────────────────────────────────────────

const ANALYTICS_QUERY = `{
  protocols(first: 1) {
    id
    totalSwaps
    totalUniqueUsers
    totalPools
    totalVolumeToken0
    updatedAt
  }
  swaps(first: 20, orderBy: blockNumber, orderDirection: desc) {
    id
    sender
    tokenIn
    amountIn
    amountOut
    blockNumber
    timestamp
    txHash
    pool { id }
  }
  users(first: 10, orderBy: swapCount, orderDirection: desc) {
    id
    swapCount
    totalAmountIn
    firstSeenAt
    lastSeenAt
  }
  pools(first: 10) {
    id
    totalSwaps
    totalVolumeToken0
    txCount
  }
  lendingProtocols: lendingProtocols(first: 1) {
    id
    totalDeposits
    totalBorrows
    totalRepays
    totalLiquidations
    totalVolumeDeposited
    totalVolumeBorrowed
    updatedAt
  }
  lendingDeposits(first: 10, orderBy: blockNumber, orderDirection: desc) {
    id
    user
    amount
    blockNumber
    timestamp
    txHash
  }
  lendingBorrows(first: 10, orderBy: blockNumber, orderDirection: desc) {
    id
    user
    amount
    blockNumber
    timestamp
    txHash
  }
}`;

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Fetch analytics data from The Graph subgraph.
 * Falls back gracefully if subgraph is not yet synced or URL not configured.
 */
export function useSubgraph(): SubgraphData {
  const [data, setData] = useState<SubgraphData>({
    protocol: null,
    lendingProtocol: null,
    recentSwaps: [],
    recentLending: [],
    leaderboard: [],
    pools: [],
    isLoading: true,
    error: null,
    isSynced: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setData(d => ({ ...d, isLoading: true, error: null }));
      try {
        const res = await window.fetch(SUBGRAPH_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: ANALYTICS_QUERY }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        if (json.errors) throw new Error(json.errors[0]?.message ?? 'GraphQL error');

        const d = json.data;
        if (cancelled) return;

        // Merge lending events
        const deposits = (d.lendingDeposits ?? []).map((e: { id: string; user: string; amount: string; blockNumber: string; timestamp: string; txHash: string }) => ({ ...e, type: 'deposit' as const }));
        const borrows  = (d.lendingBorrows  ?? []).map((e: { id: string; user: string; amount: string; blockNumber: string; timestamp: string; txHash: string }) => ({ ...e, type: 'borrow'  as const }));
        const recentLending = [...deposits, ...borrows]
          .sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber))
          .slice(0, 15);

        setData({
          protocol:        d.protocols?.[0] ?? null,
          lendingProtocol: d.lendingProtocols?.[0] ?? null,
          recentSwaps:     d.swaps ?? [],
          recentLending,
          leaderboard:     d.users ?? [],
          pools:           d.pools ?? [],
          isLoading:       false,
          error:           null,
          isSynced:        true,
        });
      } catch (e) {
        if (!cancelled) {
          setData(d => ({
            ...d,
            isLoading: false,
            error: e instanceof Error ? e.message : 'Subgraph query failed',
            isSynced: false,
          }));
        }
      }
    }

    fetch();
    // Refresh every 60s
    const interval = setInterval(fetch, 60_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return data;
}
