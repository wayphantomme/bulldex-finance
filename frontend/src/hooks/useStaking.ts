'use client';

import { useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import { CONTRACTS, CONTRACT_ADDRESSES, isConfigured } from '@/constants/contracts';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StakingProtocolStats {
  totalEffectiveStake: bigint;
  rewardRate:          bigint;   // rewards per second
  periodFinish:        bigint;   // unix timestamp
  rewardsDuration:     bigint;
  isActive:            boolean;  // current period still running
  // Formatted
  totalEffectiveStakeFormatted: string;
  // APR estimates in basis points (100 = 1%)
  aprNoLock:   number;
  apr30Days:   number;
  apr90Days:   number;
  apr180Days:  number;
  isLoading:   boolean;
  isConfigured: boolean;
}

export interface StakingUserInfo {
  amount:          bigint;    // raw BDX staked
  lockEnd:         bigint;    // unlock timestamp (0 = no lock)
  lockDays:        bigint;    // original lock period
  lockMultiplier:  bigint;    // 1e18 scaled (1e18 = 1×)
  pendingRewards:  bigint;    // claimable BDX
  isLocked:        boolean;
  lockTimeRemaining: number;  // seconds until unlock (0 if unlocked)
  // Formatted
  amountFormatted:         string;
  pendingRewardsFormatted: string;
  lockMultiplierFormatted: string;  // e.g. "1.50×"
  lockEndDate:             string | null;
  isLoading: boolean;
}

// ─── Protocol stats hook ──────────────────────────────────────────────────────

export function useStakingStats(): StakingProtocolStats {
  const configured = isConfigured(CONTRACT_ADDRESSES.staking);

  const { data, isLoading } = useReadContracts({
    contracts: [
      { ...CONTRACTS.staking, functionName: 'totalEffectiveStake' },
      { ...CONTRACTS.staking, functionName: 'rewardRate' },
      { ...CONTRACTS.staking, functionName: 'periodFinish' },
      { ...CONTRACTS.staking, functionName: 'rewardsDuration' },
      { ...CONTRACTS.staking, functionName: 'estimatedAPR', args: [0n]   },
      { ...CONTRACTS.staking, functionName: 'estimatedAPR', args: [30n]  },
      { ...CONTRACTS.staking, functionName: 'estimatedAPR', args: [90n]  },
      { ...CONTRACTS.staking, functionName: 'estimatedAPR', args: [180n] },
    ],
    query: { enabled: configured, staleTime: 15_000, refetchInterval: 30_000 },
  });

  const totalEffectiveStake = (data?.[0].result as bigint | undefined) ?? 0n;
  const rewardRate          = (data?.[1].result as bigint | undefined) ?? 0n;
  const periodFinish        = (data?.[2].result as bigint | undefined) ?? 0n;
  const rewardsDuration     = (data?.[3].result as bigint | undefined) ?? BigInt(7 * 24 * 3600);
  const aprNoLock           = Number((data?.[4].result as bigint | undefined) ?? 0n);
  const apr30Days           = Number((data?.[5].result as bigint | undefined) ?? 0n);
  const apr90Days           = Number((data?.[6].result as bigint | undefined) ?? 0n);
  const apr180Days          = Number((data?.[7].result as bigint | undefined) ?? 0n);

  const isActive = periodFinish > BigInt(Math.floor(Date.now() / 1000));

  return {
    totalEffectiveStake,
    rewardRate,
    periodFinish,
    rewardsDuration,
    isActive,
    totalEffectiveStakeFormatted: fmtBig(totalEffectiveStake),
    aprNoLock,
    apr30Days,
    apr90Days,
    apr180Days,
    isLoading,
    isConfigured: configured,
  };
}

// ─── User position hook ───────────────────────────────────────────────────────

export function useStakingInfo(
  address: `0x${string}` | undefined,
): StakingUserInfo {
  const configured = isConfigured(CONTRACT_ADDRESSES.staking);

  const { data, isLoading } = useReadContracts({
    contracts: [
      {
        ...CONTRACTS.staking,
        functionName: 'getStakeInfo',
        args: address ? [address] : undefined,
      },
    ],
    query: {
      enabled: !!address && configured,
      staleTime: 10_000,
      refetchInterval: 15_000,
    },
  });

  type StakeInfoTuple = readonly [bigint, bigint, bigint, bigint, bigint, boolean];
  const raw = data?.[0].result as StakeInfoTuple | undefined;

  const amount         = raw?.[0] ?? 0n;
  const lockEnd        = raw?.[1] ?? 0n;
  const lockDays       = raw?.[2] ?? 0n;
  const lockMultiplier = raw?.[3] ?? BigInt(1e18);
  const pendingRewards = raw?.[4] ?? 0n;
  const isLocked       = raw?.[5] ?? false;

  const nowSec              = Math.floor(Date.now() / 1000);
  const lockTimeRemaining   = isLocked ? Math.max(0, Number(lockEnd) - nowSec) : 0;
  const multiplierFloat     = parseFloat(formatUnits(lockMultiplier, 18));

  return {
    amount,
    lockEnd,
    lockDays,
    lockMultiplier,
    pendingRewards,
    isLocked,
    lockTimeRemaining,
    amountFormatted:         fmtBig(amount),
    pendingRewardsFormatted: fmtBig(pendingRewards),
    lockMultiplierFormatted: `${multiplierFloat.toFixed(2)}×`,
    lockEndDate: lockEnd > 0n
      ? new Date(Number(lockEnd) * 1000).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
        })
      : null,
    isLoading,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtBig(v: bigint): string {
  const n = parseFloat(formatUnits(v, 18));
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(2)}K`;
  return n.toFixed(2);
}

export function fmtCountdown(seconds: number): string {
  const d = Math.floor(seconds / 86_400);
  const h = Math.floor((seconds % 86_400) / 3_600);
  const m = Math.floor((seconds % 3_600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function fmtApr(bps: number): string {
  return `${(bps / 100).toFixed(1)}%`;
}
