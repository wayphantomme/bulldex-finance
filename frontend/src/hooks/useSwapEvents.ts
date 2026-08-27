import { useEffect, useState } from 'react';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { sepolia } from 'wagmi/chains';
import { CONTRACT_ADDRESSES, isConfigured } from '@/constants/contracts';

// ─── Event ABIs ───────────────────────────────────────────────────────────────

const SWAP_EVENT = parseAbiItem(
  'event Swap(address indexed sender, address indexed tokenIn, uint256 amountIn, uint256 amountOut, address indexed to)',
);
const ADD_LIQ_EVENT = parseAbiItem(
  'event AddLiquidity(address indexed provider, uint256 amount0, uint256 amount1, uint256 lpMinted)',
);
const REMOVE_LIQ_EVENT = parseAbiItem(
  'event RemoveLiquidity(address indexed provider, uint256 amount0, uint256 amount1, uint256 lpBurned)',
);

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SwapEvent {
  txHash:    string;
  blockNumber: bigint;
  sender:    string;
  tokenIn:   string;
  amountIn:  bigint;
  amountOut: bigint;
  to:        string;
  pool:      'bdx-musdc' | 'bdx-weth';
  timestamp?: number;
}

export interface LiquidityEvent {
  txHash:    string;
  blockNumber: bigint;
  provider:  string;
  amount0:   bigint;
  amount1:   bigint;
  type:      'add' | 'remove';
  pool:      'bdx-musdc' | 'bdx-weth';
}

export interface WalletStats {
  address:    string;
  swapCount:  number;
  amountInTotal: bigint;   // total BDX/WETH swapped in
  lastActive: bigint;      // block number
}

export interface AnalyticsData {
  swaps:          SwapEvent[];
  liquidityEvents: LiquidityEvent[];
  totalSwaps:     number;
  uniqueWallets:  number;
  totalVolumeIn:  bigint;
  leaderboard:    WalletStats[];
  isLoading:      boolean;
  error:          string | null;
  lastUpdated:    Date | null;
  // block range read
  fromBlock:      bigint;
  toBlock:        bigint;
}

// Read last N blocks — Note: Alchemy free tier limits to 10 blocks per getLogs
// So RPC fallback is limited. Use The Graph as primary source.
// This hook is kept for local dev / paid RPC tiers only.
const BLOCKS_TO_READ = BigInt(10); // Alchemy free tier max per call

export function useSwapEvents(): AnalyticsData {
  const [data, setData] = useState<AnalyticsData>({
    swaps: [], liquidityEvents: [], totalSwaps: 0, uniqueWallets: 0,
    totalVolumeIn: 0n, leaderboard: [], isLoading: true, error: null,
    lastUpdated: null, fromBlock: 0n, toBlock: 0n,
  });

  const rpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC;
  const poolConfigured = isConfigured(CONTRACT_ADDRESSES.pool) ||
                         isConfigured(CONTRACT_ADDRESSES.poolBdxWeth);

  useEffect(() => {
    if (!poolConfigured || !rpcUrl) {
      setData(d => ({ ...d, isLoading: false, error: 'Pool or RPC not configured' }));
      return;
    }

    let cancelled = false;

    async function fetchEvents() {
      setData(d => ({ ...d, isLoading: true, error: null }));

      try {
        const client = createPublicClient({
          chain: sepolia,
          transport: http(rpcUrl),
        });

        const latestBlock = await client.getBlockNumber();
        const fromBlock = latestBlock > BLOCKS_TO_READ
          ? latestBlock - BLOCKS_TO_READ
          : 0n;

        // ── Fetch from both pools in parallel ──────────────────────────────
        const pools: { address: `0x${string}`; key: 'bdx-musdc' | 'bdx-weth' }[] = [];
        if (isConfigured(CONTRACT_ADDRESSES.pool))
          pools.push({ address: CONTRACT_ADDRESSES.pool, key: 'bdx-musdc' });
        if (isConfigured(CONTRACT_ADDRESSES.poolBdxWeth))
          pools.push({ address: CONTRACT_ADDRESSES.poolBdxWeth, key: 'bdx-weth' });

        const allSwaps: SwapEvent[] = [];
        const allLiq: LiquidityEvent[] = [];

        await Promise.all(pools.map(async (p) => {
          try {
            // Swap events
            const swapLogs = await client.getLogs({
              address: p.address,
              event: SWAP_EVENT,
              fromBlock,
              toBlock: latestBlock,
            });

            for (const log of swapLogs) {
              if (!log.args) continue;
              allSwaps.push({
                txHash:      log.transactionHash ?? '',
                blockNumber: log.blockNumber ?? 0n,
                sender:      (log.args.sender as string)?.toLowerCase() ?? '',
                tokenIn:     (log.args.tokenIn as string)?.toLowerCase() ?? '',
                amountIn:    (log.args.amountIn as bigint) ?? 0n,
                amountOut:   (log.args.amountOut as bigint) ?? 0n,
                to:          (log.args.to as string)?.toLowerCase() ?? '',
                pool:        p.key,
              });
            }

            // AddLiquidity events
            const addLogs = await client.getLogs({
              address: p.address,
              event: ADD_LIQ_EVENT,
              fromBlock,
              toBlock: latestBlock,
            });
            for (const log of addLogs) {
              if (!log.args) continue;
              allLiq.push({
                txHash: log.transactionHash ?? '',
                blockNumber: log.blockNumber ?? 0n,
                provider: (log.args.provider as string)?.toLowerCase() ?? '',
                amount0:  (log.args.amount0 as bigint) ?? 0n,
                amount1:  (log.args.amount1 as bigint) ?? 0n,
                type: 'add',
                pool: p.key,
              });
            }

            // RemoveLiquidity events
            const removeLogs = await client.getLogs({
              address: p.address,
              event: REMOVE_LIQ_EVENT,
              fromBlock,
              toBlock: latestBlock,
            });
            for (const log of removeLogs) {
              if (!log.args) continue;
              allLiq.push({
                txHash: log.transactionHash ?? '',
                blockNumber: log.blockNumber ?? 0n,
                provider: (log.args.provider as string)?.toLowerCase() ?? '',
                amount0:  (log.args.amount0 as bigint) ?? 0n,
                amount1:  (log.args.amount1 as bigint) ?? 0n,
                type: 'remove',
                pool: p.key,
              });
            }
          } catch {
            // Pool may not have events yet
          }
        }));

        if (cancelled) return;

        // ── Aggregate ────────────────────────────────────────────────────────
        // Sort by block desc
        allSwaps.sort((a, b) => Number(b.blockNumber - a.blockNumber));

        // Unique wallets = all unique senders
        const walletMap = new Map<string, WalletStats>();
        let totalVolumeIn = 0n;

        for (const s of allSwaps) {
          totalVolumeIn += s.amountIn;
          const existing = walletMap.get(s.sender);
          if (existing) {
            existing.swapCount++;
            existing.amountInTotal += s.amountIn;
            if (s.blockNumber > existing.lastActive) existing.lastActive = s.blockNumber;
          } else {
            walletMap.set(s.sender, {
              address:       s.sender,
              swapCount:     1,
              amountInTotal: s.amountIn,
              lastActive:    s.blockNumber,
            });
          }
        }

        // Also count LP providers as unique wallets
        for (const l of allLiq) {
          if (!walletMap.has(l.provider)) {
            walletMap.set(l.provider, {
              address:       l.provider,
              swapCount:     0,
              amountInTotal: 0n,
              lastActive:    l.blockNumber,
            });
          }
        }

        const leaderboard = Array.from(walletMap.values())
          .sort((a, b) => b.swapCount - a.swapCount || Number(b.amountInTotal - a.amountInTotal))
          .slice(0, 10);

        setData({
          swaps:          allSwaps,
          liquidityEvents: allLiq,
          totalSwaps:     allSwaps.length,
          uniqueWallets:  walletMap.size,
          totalVolumeIn,
          leaderboard,
          isLoading:      false,
          error:          null,
          lastUpdated:    new Date(),
          fromBlock,
          toBlock:        latestBlock,
        });

      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Failed to fetch events';
          const display = msg.includes('block range') || msg.includes('Free tier')
            ? 'Alchemy free tier limits RPC getLogs to 10 blocks. Use The Graph for full history.'
            : msg;
          setData(d => ({ ...d, isLoading: false, error: display }));
        }
      }
    }

    fetchEvents();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolConfigured]);

  return data;
}
