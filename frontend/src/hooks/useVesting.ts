'use client';

import { useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import { CONTRACTS, CONTRACT_ADDRESSES, isConfigured } from '@/constants/contracts';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VestingScheduleInfo {
  exists:       boolean;
  totalAmount:  bigint;
  released:     bigint;
  releasable:   bigint;
  vested:       bigint;
  unvested:     bigint;
  cliffEnd:     bigint;   // unix timestamp
  vestEnd:      bigint;   // unix timestamp
  isRevoked:    boolean;
  cliffPassed:  boolean;
  progressBps:  bigint;   // vested / total * 10000
  progressPct:  number;   // 0–100
  // Formatted
  totalAmountFormatted:  string;
  releasableFormatted:   string;
  vestedFormatted:       string;
  unvestedFormatted:     string;
  releasedFormatted:     string;
  cliffEndDate:          string | null;
  vestEndDate:           string | null;
  cliffCountdown:        string | null;   // "in X days" if cliff not passed
  isLoading:             boolean;
}

export interface VestingProtocolStats {
  totalLocked:          bigint;
  totalLockedFormatted: string;
  beneficiaryCount:     number;
  isConfigured:         boolean;
  isLoading:            boolean;
}

// ─── Protocol stats ───────────────────────────────────────────────────────────

export function useVestingStats(): VestingProtocolStats {
  const configured = isConfigured(CONTRACT_ADDRESSES.vesting);

  const { data, isLoading } = useReadContracts({
    contracts: [
      { ...CONTRACTS.vesting, functionName: 'totalLocked' },
      { ...CONTRACTS.vesting, functionName: 'beneficiaryCount' },
    ],
    query: { enabled: configured, staleTime: 30_000, refetchInterval: 60_000 },
  });

  const totalLocked       = (data?.[0].result as bigint | undefined) ?? 0n;
  const beneficiaryCount  = Number((data?.[1].result as bigint | undefined) ?? 0n);

  return {
    totalLocked,
    totalLockedFormatted: fmtToken(totalLocked),
    beneficiaryCount,
    isConfigured: configured,
    isLoading,
  };
}

// ─── User schedule hook ───────────────────────────────────────────────────────

export function useVestingSchedule(
  address: `0x${string}` | undefined,
): VestingScheduleInfo {
  const configured = isConfigured(CONTRACT_ADDRESSES.vesting);

  const { data, isLoading } = useReadContracts({
    contracts: [
      {
        ...CONTRACTS.vesting,
        functionName: 'getScheduleInfo',
        args: address ? [address] : undefined,
      },
      {
        ...CONTRACTS.vesting,
        functionName: 'schedules',
        args: address ? [address] : undefined,
      },
    ],
    query: {
      enabled: !!address && configured,
      staleTime: 15_000,
      refetchInterval: 30_000,
    },
  });

  type ScheduleInfoTuple = readonly [
    bigint, bigint, bigint, bigint, bigint,
    bigint, bigint, boolean, boolean, bigint
  ];
  type ScheduleTuple = readonly [
    `0x${string}`, bigint, bigint, bigint,
    bigint, bigint, boolean, boolean
  ];

  const info    = data?.[0].result as ScheduleInfoTuple | undefined;
  const raw     = data?.[1].result as ScheduleTuple    | undefined;

  const exists      = raw?.[7] ?? false;
  const totalAmount = info?.[0] ?? 0n;
  const released    = info?.[1] ?? 0n;
  const releasable  = info?.[2] ?? 0n;
  const vested      = info?.[3] ?? 0n;
  const unvested    = info?.[4] ?? 0n;
  const cliffEnd    = info?.[5] ?? 0n;
  const vestEnd     = info?.[6] ?? 0n;
  const isRevoked   = info?.[7] ?? false;
  const cliffPassed = info?.[8] ?? false;
  const progressBps = info?.[9] ?? 0n;

  const progressPct = Number(progressBps) / 100;
  const nowSec      = Math.floor(Date.now() / 1000);
  const cliffEndNum = Number(cliffEnd);
  const vestEndNum  = Number(vestEnd);

  const cliffCountdown = !cliffPassed && cliffEndNum > nowSec
    ? fmtCountdown(cliffEndNum - nowSec)
    : null;

  return {
    exists,
    totalAmount,
    released,
    releasable,
    vested,
    unvested,
    cliffEnd,
    vestEnd,
    isRevoked,
    cliffPassed,
    progressBps,
    progressPct,
    totalAmountFormatted: fmtToken(totalAmount),
    releasableFormatted:  fmtToken(releasable),
    vestedFormatted:      fmtToken(vested),
    unvestedFormatted:    fmtToken(unvested),
    releasedFormatted:    fmtToken(released),
    cliffEndDate: cliffEndNum > 0
      ? new Date(cliffEndNum * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : null,
    vestEndDate: vestEndNum > 0
      ? new Date(vestEndNum * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : null,
    cliffCountdown,
    isLoading,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtToken(v: bigint): string {
  const n = parseFloat(formatUnits(v, 18));
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(2)}K`;
  return n.toFixed(2);
}

function fmtCountdown(seconds: number): string {
  const d = Math.floor(seconds / 86_400);
  const h = Math.floor((seconds % 86_400) / 3_600);
  if (d > 30)  return `in ~${Math.round(d / 30)} months`;
  if (d > 0)   return `in ${d}d ${h}h`;
  return `in ${h}h`;
}
