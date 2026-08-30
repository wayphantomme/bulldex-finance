'use client';

import { useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import { CONTRACTS, CONTRACT_ADDRESSES, isConfigured } from '@/constants/contracts';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FarmPool {
  pid:          number;
  lpToken:      `0x${string}`;
  lpSymbol:     string;        // e.g. "BDX/MUSDC LP"
  allocPoint:   number;
  totalStaked:  bigint;        // total LP tokens deposited in this pool
  bdxPerBlock:  bigint;        // this pool's share of bdxPerBlock
  aprPct:       number;        // estimated APR in % (0 if price data unavailable)
  // User-specific (0 when not connected)
  deposited:    bigint;        // user's LP tokens in this pool
  pending:      bigint;        // claimable BDX rewards
}

export interface FarmGlobals {
  bdxPerBlock:     bigint;
  totalAllocPoint: bigint;
  rewardBalance:   bigint;
  poolCount:       number;
}

export interface UseFarmingResult {
  pools:      FarmPool[];
  globals:    FarmGlobals;
  isLoading:  boolean;
  isConfigured: boolean;
}

// ─── Pool metadata ────────────────────────────────────────────────────────────
// Keyed by LP token address (lowercase) → display symbol
const LP_SYMBOLS: Record<string, string> = {
  [CONTRACT_ADDRESSES.pool.toLowerCase()]:        'BDX/MUSDC',
  [CONTRACT_ADDRESSES.poolBdxWeth.toLowerCase()]: 'BDX/ETH',
};

function lpSymbol(lpToken: string): string {
  return LP_SYMBOLS[lpToken.toLowerCase()] ?? 'Unknown LP';
}

// ─── Hardcoded pool PIDs ──────────────────────────────────────────────────────
// Must match the order pools were added via MasterChef.add()
const POOL_PIDS = [0, 1] as const;

// ─── Blocks per year (Sepolia ~12s/block) ────────────────────────────────────
const BLOCKS_PER_YEAR = BigInt(Math.round((365 * 24 * 3600) / 12));

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFarming(
  address: `0x${string}` | undefined,
): UseFarmingResult {
  const configured = isConfigured(CONTRACT_ADDRESSES.masterChef);

  // ── Global reads: bdxPerBlock, totalAllocPoint, rewardBalance, poolLength ──
  const { data: globalData, isLoading: globalLoading } = useReadContracts({
    contracts: [
      { ...CONTRACTS.masterChef, functionName: 'bdxPerBlock' },
      { ...CONTRACTS.masterChef, functionName: 'totalAllocPoint' },
      { ...CONTRACTS.masterChef, functionName: 'rewardBalance' },
      { ...CONTRACTS.masterChef, functionName: 'poolLength' },
    ],
    query: { enabled: configured, staleTime: 20_000, refetchInterval: 30_000 },
  });

  const bdxPerBlock     = (globalData?.[0].result as bigint | undefined) ?? 0n;
  const totalAllocPoint = (globalData?.[1].result as bigint | undefined) ?? 0n;
  const rewardBalance   = (globalData?.[2].result as bigint | undefined) ?? 0n;
  const poolCount       = Number((globalData?.[3].result as bigint | undefined) ?? 0n);

  // ── Per-pool reads: poolInfo + LP balance of MasterChef ────────────────────
  const poolContracts = POOL_PIDS.flatMap((pid) => [
    { ...CONTRACTS.masterChef, functionName: 'poolInfo' as const, args: [BigInt(pid)] as const },
  ]);

  const { data: poolData, isLoading: poolLoading } = useReadContracts({
    contracts: poolContracts,
    query: { enabled: configured, staleTime: 20_000, refetchInterval: 30_000 },
  });

  // ── Per-pool per-user reads: userInfo + pendingBDX ─────────────────────────
  const userContracts = address
    ? POOL_PIDS.flatMap((pid) => [
        {
          ...CONTRACTS.masterChef,
          functionName: 'userInfo' as const,
          args: [BigInt(pid), address] as const,
        },
        {
          ...CONTRACTS.masterChef,
          functionName: 'pendingBDX' as const,
          args: [BigInt(pid), address] as const,
        },
      ])
    : [];

  const { data: userData, isLoading: userLoading } = useReadContracts({
    contracts: userContracts,
    query: {
      enabled: !!address && configured,
      staleTime: 10_000,
      refetchInterval: 15_000,
    },
  });

  // ── LP token balance reads for each pool (total staked = MasterChef balance)
  // poolInfo already returns lpToken address; we read balanceOf(masterChef) via POOL_ABI
  // Instead, we compute totalStaked from poolInfo — MasterChef tracks it implicitly
  // via lpToken.balanceOf(address(this)) inside the contract. We call it via TOKEN_ABI
  // (balanceOf is standard ERC-20 on all LP tokens).
  const lpBalanceContracts = POOL_PIDS.map((pid) => {
    type PoolInfoTuple = readonly [`0x${string}`, bigint, bigint, bigint];
    const raw = poolData?.[pid]?.result as PoolInfoTuple | undefined;
    const lpToken = raw?.[0];
    return lpToken && lpToken !== '0x0000000000000000000000000000000000000000'
      ? {
          address: lpToken,
          abi: [
            {
              type: 'function' as const,
              name: 'balanceOf' as const,
              inputs: [{ name: 'account', type: 'address' as const }],
              outputs: [{ type: 'uint256' as const }],
              stateMutability: 'view' as const,
            },
          ],
          functionName: 'balanceOf' as const,
          args: [CONTRACT_ADDRESSES.masterChef] as const,
          chainId: 11155111,
        }
      : null;
  }).filter(Boolean);

  const { data: lpBalData, isLoading: lpLoading } = useReadContracts({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contracts: lpBalanceContracts as any[],
    query: {
      enabled: configured && !!poolData,
      staleTime: 20_000,
      refetchInterval: 30_000,
    },
  });

  // ── Assemble FarmPool[] ────────────────────────────────────────────────────

  const pools: FarmPool[] = POOL_PIDS.map((pid) => {
    type PoolInfoTuple = readonly [`0x${string}`, bigint, bigint, bigint];
    const poolRaw  = poolData?.[pid]?.result as PoolInfoTuple | undefined;
    const lpToken  = (poolRaw?.[0] ?? '0x0000000000000000000000000000000000000000') as `0x${string}`;
    const allocPoint = poolRaw?.[1] ?? 0n;

    // Total LP staked (from lpToken.balanceOf(masterChef))
    const totalStaked = (lpBalData?.[pid]?.result as bigint | undefined) ?? 0n;

    // Pool's share of bdxPerBlock
    const poolBdxPerBlock = totalAllocPoint > 0n
      ? bdxPerBlock * allocPoint / totalAllocPoint
      : 0n;

    // Estimated APR: (poolBdxPerBlock × blocksPerYear) / totalStaked × 100
    // Uses raw bigint ratio (no USD price — pure token APR)
    let aprPct = 0;
    if (totalStaked > 0n && poolBdxPerBlock > 0n) {
      const bdxPerYear = poolBdxPerBlock * BLOCKS_PER_YEAR;
      // APR % = bdxPerYear / totalStaked × 100 (both in same 18-decimal token)
      aprPct = parseFloat(formatUnits(bdxPerYear * 10000n / totalStaked, 2));
    }

    // User data — userInfo and pendingBDX are interleaved: [userInfo_0, pending_0, userInfo_1, ...]
    const userIdx   = pid * 2;
    type UserInfoTuple = readonly [bigint, bigint];
    const userRaw   = userData?.[userIdx]?.result as UserInfoTuple | undefined;
    const deposited = userRaw?.[0] ?? 0n;
    const pending   = (userData?.[userIdx + 1]?.result as bigint | undefined) ?? 0n;

    return {
      pid,
      lpToken,
      lpSymbol:    lpSymbol(lpToken),
      allocPoint:  Number(allocPoint),
      totalStaked,
      bdxPerBlock: poolBdxPerBlock,
      aprPct,
      deposited,
      pending,
    };
  });

  const isLoading = globalLoading || poolLoading || userLoading || lpLoading;

  return {
    pools,
    globals: {
      bdxPerBlock,
      totalAllocPoint,
      rewardBalance,
      poolCount,
    },
    isLoading,
    isConfigured: configured,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function fmtLp(v: bigint): string {
  const n = parseFloat(formatUnits(v, 18));
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(2)}K`;
  return n.toFixed(4);
}

export function fmtBdx(v: bigint): string {
  const n = parseFloat(formatUnits(v, 18));
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(2)}K`;
  return n.toFixed(4);
}

export function fmtApr(pct: number): string {
  if (pct === 0) return '—';
  if (pct >= 10_000) return `${(pct / 100).toFixed(0)}%`;
  return `${pct.toFixed(1)}%`;
}
