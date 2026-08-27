'use client';

import { useState, useCallback } from 'react';
import { useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits, maxUint256 } from 'viem';
import { CONTRACTS, CONTRACT_ADDRESSES, isConfigured } from '@/constants/contracts';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LendingPosition {
  collateral:         bigint;
  borrowed:           bigint;
  interest:           bigint;
  healthFactor:       bigint;      // scaled 1e18
  collateralValueUSD: bigint;      // MUSDC value of collateral
  maxBorrowable:      bigint;      // max MUSDC that can be borrowed
  // Formatted
  collateralFormatted:     string;
  borrowedFormatted:       string;
  interestFormatted:       string;
  healthFactorFormatted:   string;
  healthFactorNum:         number;
  maxBorrowableFormatted:  string;
  utilizationPct:          number; // borrowed / maxBorrowable * 100
  isLiquidatable:          boolean;
}

export interface LendingProtocolStats {
  totalCollateral:   bigint;
  totalBorrowed:     bigint;
  reserveBalance:    bigint;
  bdxPrice:          bigint;       // MUSDC per BDX (1e18 scaled)
  bdxPriceFormatted: string;
  isLoading:         boolean;
  isConfigured:      boolean;
}

export type LendingStep =
  | 'idle'
  | 'approving'
  | 'depositing'
  | 'withdrawing'
  | 'borrowing'
  | 'repaying'
  | 'success'
  | 'error';

// ─── Protocol stats ───────────────────────────────────────────────────────────

export function useLendingStats(): LendingProtocolStats {
  const configured = isConfigured(CONTRACT_ADDRESSES.lending);

  const { data, isLoading } = useReadContracts({
    contracts: [
      { ...CONTRACTS.lending, functionName: 'totalCollateral' },
      { ...CONTRACTS.lending, functionName: 'totalBorrowed' },
      { ...CONTRACTS.lending, functionName: 'reserveBalance' },
      { ...CONTRACTS.lending, functionName: 'getBdxPrice' },
    ],
    query: { enabled: configured, staleTime: 15_000, refetchInterval: 30_000 },
  });

  const bdxPrice = (data?.[3].result as bigint | undefined) ?? 0n;

  return {
    totalCollateral:   (data?.[0].result as bigint | undefined) ?? 0n,
    totalBorrowed:     (data?.[1].result as bigint | undefined) ?? 0n,
    reserveBalance:    (data?.[2].result as bigint | undefined) ?? 0n,
    bdxPrice,
    bdxPriceFormatted: bdxPrice > 0n
      ? `${parseFloat(formatUnits(bdxPrice, 18)).toFixed(4)} MUSDC`
      : '—',
    isLoading,
    isConfigured: configured,
  };
}

// ─── User position ────────────────────────────────────────────────────────────

export function useLendingPosition(
  address: `0x${string}` | undefined,
): LendingPosition & { isLoading: boolean } {
  const configured = isConfigured(CONTRACT_ADDRESSES.lending);

  const { data, isLoading } = useReadContracts({
    contracts: [
      {
        ...CONTRACTS.lending,
        functionName: 'getPosition',
        args: address ? [address] : undefined,
      },
    ],
    query: {
      enabled: !!address && configured,
      staleTime: 10_000,
      refetchInterval: 15_000,
    },
  });

  const raw = data?.[0].result as
    | readonly [bigint, bigint, bigint, bigint, bigint, bigint]
    | undefined;

  const collateral         = raw?.[0] ?? 0n;
  const borrowed           = raw?.[1] ?? 0n;
  const interest           = raw?.[2] ?? 0n;
  const hf                 = raw?.[3] !== undefined ? raw[3] : maxUint256;
  const collateralValueUSD = raw?.[4] ?? 0n;
  const maxBorrowable      = raw?.[5] ?? 0n;

  const hfNum = hf === maxUint256 ? Infinity : parseFloat(formatUnits(hf, 18));
  const utilPct = maxBorrowable > 0n
    ? Math.min(100, (Number(borrowed + interest) / Number(maxBorrowable)) * 100)
    : 0;

  return {
    collateral,
    borrowed,
    interest,
    healthFactor:         hf,
    collateralValueUSD,
    maxBorrowable,
    collateralFormatted:    fmt(collateral),
    borrowedFormatted:      fmt(borrowed),
    interestFormatted:      fmt(interest),
    healthFactorFormatted:  hf === maxUint256 ? '∞' : hfNum.toFixed(3),
    healthFactorNum:        hfNum,
    maxBorrowableFormatted: fmt(maxBorrowable),
    utilizationPct:         utilPct,
    isLiquidatable:         hf < 1_000_000_000_000_000_000n && hf !== 0n,
    isLoading,
  };
}

// ─── Actions hook ─────────────────────────────────────────────────────────────

export function useLendingActions(address: `0x${string}` | undefined) {
  const [step, setStep]       = useState<LendingStep>('idle');
  const [error, setError]     = useState<string | null>(null);
  const [txHash, setTxHash]   = useState<`0x${string}` | undefined>(undefined);

  const { writeContractAsync } = useWriteContract();
  useWaitForTransactionReceipt({ hash: txHash, query: { enabled: !!txHash } });

  const MAX = maxUint256;

  const handleError = (e: unknown) => {
    const msg = e instanceof Error ? e.message : 'Transaction failed';
    let display = msg.slice(0, 160);
    if (msg.includes('ExceedsBorrowLimit') || msg.includes('0x3a23d825')) {
      display = 'Exceeds borrow limit — reduce amount or add more collateral.';
    } else if (msg.includes('InsufficientCollateral')) {
      display = 'Insufficient collateral deposited.';
    } else if (msg.includes('InsufficientReserve')) {
      display = 'Not enough MUSDC in reserve. Try a smaller amount.';
    } else if (msg.includes('PositionHealthy')) {
      display = 'Position is healthy — cannot be liquidated.';
    } else if (msg.includes('User rejected')) {
      display = 'Transaction rejected.';
    } else if (msg.includes('Cannot convert undefined')) {
      display = 'Loading position data — please wait and try again.';
    }
    setError(display);
    setStep('error');
  };

  const depositCollateral = useCallback(async (amount: bigint) => {
    if (!address) return;
    setError(null);
    try {
      // Approve BDX first
      setStep('approving');
      const approveTx = await writeContractAsync({
        ...CONTRACTS.token,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.lending, MAX],
      });
      setTxHash(approveTx);
      await new Promise(r => setTimeout(r, 2500));

      // Deposit
      setStep('depositing');
      const tx = await writeContractAsync({
        ...CONTRACTS.lending,
        functionName: 'depositCollateral',
        args: [amount],
      });
      setTxHash(tx);
      setStep('success');
    } catch (e) { handleError(e); }
  }, [address, writeContractAsync, MAX]);

  const withdrawCollateral = useCallback(async (amount: bigint) => {
    if (!address) return;
    setError(null);
    try {
      setStep('withdrawing');
      const tx = await writeContractAsync({
        ...CONTRACTS.lending,
        functionName: 'withdrawCollateral',
        args: [amount],
      });
      setTxHash(tx);
      setStep('success');
    } catch (e) { handleError(e); }
  }, [address, writeContractAsync]);

  const borrow = useCallback(async (amount: bigint) => {
    if (!address) return;
    setError(null);
    try {
      setStep('borrowing');
      const tx = await writeContractAsync({
        ...CONTRACTS.lending,
        functionName: 'borrow',
        args: [amount],
      });
      setTxHash(tx);
      setStep('success');
    } catch (e) { handleError(e); }
  }, [address, writeContractAsync]);

  const repay = useCallback(async (amount: bigint) => {
    if (!address) return;
    setError(null);
    try {
      // Approve MUSDC
      setStep('approving');
      const approveTx = await writeContractAsync({
        ...CONTRACTS.musdc,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.lending, MAX],
      });
      setTxHash(approveTx);
      await new Promise(r => setTimeout(r, 2500));

      setStep('repaying');
      const tx = await writeContractAsync({
        ...CONTRACTS.lending,
        functionName: 'repay',
        args: [amount],
      });
      setTxHash(tx);
      setStep('success');
    } catch (e) { handleError(e); }
  }, [address, writeContractAsync, MAX]);

  const repayAll = useCallback(async () => {
    await repay(MAX);
  }, [repay, MAX]);

  const reset = useCallback(() => {
    setStep('idle');
    setError(null);
    setTxHash(undefined);
  }, []);

  return { step, txHash, error, depositCollateral, withdrawCollateral, borrow, repay, repayAll, reset };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(v: bigint, dp = 4): string {
  const n = parseFloat(formatUnits(v, 18));
  if (n === 0) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(2)}K`;
  return n.toFixed(dp);
}

export function parseTokenAmount(val: string, decimals = 18): bigint {
  try {
    if (!val || val === '0.' || parseFloat(val) === 0) return 0n;
    return parseUnits(val, decimals);
  } catch { return 0n; }
}
