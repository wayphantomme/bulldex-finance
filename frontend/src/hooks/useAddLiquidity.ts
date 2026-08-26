'use client';

import { useState, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
import { CONTRACTS, isConfigured } from '@/constants/contracts';

export type AddLiqStep =
  | 'idle'
  | 'approving_bdx'
  | 'approving_musdc'
  | 'adding'
  | 'success'
  | 'error';

interface UseAddLiquidityResult {
  step: AddLiqStep;
  txHash: `0x${string}` | undefined;
  error: string | null;
  allowanceBDX: bigint | undefined;
  allowanceMUSC: bigint | undefined;
  needsApproveBDX: (amount: bigint) => boolean;
  needsApproveMUSC: (amount: bigint) => boolean;
  addLiquidity: (
    bdxAmount: bigint,
    musdcAmount: bigint,
    bdxMin: bigint,
    musdcMin: bigint,
  ) => Promise<void>;
  reset: () => void;
}

/**
 * Manages the full Add Liquidity flow:
 * 1. Check BDX allowance
 * 2. Approve BDX if needed
 * 3. Check MUSDC allowance
 * 4. Approve MUSDC if needed
 * 5. Call Pool.addLiquidity
 */
export function useAddLiquidity(
  userAddress: `0x${string}` | undefined,
): UseAddLiquidityResult {
  const [step, setStep]     = useState<AddLiqStep>('idle');
  const [error, setError]   = useState<string | null>(null);
  const [pendingTx, setPendingTx] = useState<`0x${string}` | undefined>(undefined);

  const configured = isConfigured(CONTRACTS.pool.address);

  // ── Read both allowances in one multicall ──────────────────────────────────
  const { data: allowances, refetch: refetchAllowances } = useReadContracts({
    contracts: [
      {
        ...CONTRACTS.token,
        functionName: 'allowance',
        args: userAddress && configured ? [userAddress, CONTRACTS.pool.address] : undefined,
      },
      {
        ...CONTRACTS.musdc,
        functionName: 'allowance',
        args: userAddress && configured ? [userAddress, CONTRACTS.pool.address] : undefined,
      },
    ],
    query: {
      enabled: !!userAddress && configured,
      staleTime: 1000 * 10,
    },
  });

  const allowanceBDX  = allowances?.[0].result as bigint | undefined;
  const allowanceMUSC = allowances?.[1].result as bigint | undefined;

  const { writeContractAsync } = useWriteContract();

  useWaitForTransactionReceipt({ hash: pendingTx, query: { enabled: !!pendingTx } });

  // ── Helpers ────────────────────────────────────────────────────────────────

  const needsApproveBDX  = useCallback((amt: bigint) => !allowanceBDX  || allowanceBDX  < amt, [allowanceBDX]);
  const needsApproveMUSC = useCallback((amt: bigint) => !allowanceMUSC || allowanceMUSC < amt, [allowanceMUSC]);

  const MAX = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

  const handleError = (e: unknown) => {
    const msg = e instanceof Error ? e.message : 'Transaction failed';
    setError(msg.includes('User rejected') ? 'Transaction rejected' : msg.slice(0, 120));
    setStep('error');
  };

  // ── Main action ────────────────────────────────────────────────────────────

  const addLiquidity = useCallback(async (
    bdxAmount: bigint,
    musdcAmount: bigint,
    bdxMin: bigint,
    musdcMin: bigint,
  ) => {
    if (!userAddress) return;
    setError(null);

    try {
      // Step 1: approve BDX if needed
      if (needsApproveBDX(bdxAmount)) {
        setStep('approving_bdx');
        const h = await writeContractAsync({
          ...CONTRACTS.token,
          functionName: 'approve',
          args: [CONTRACTS.pool.address, MAX],
        });
        setPendingTx(h);
        await new Promise((r) => setTimeout(r, 2500));
        await refetchAllowances();
      }

      // Step 2: approve MUSDC if needed
      if (needsApproveMUSC(musdcAmount)) {
        setStep('approving_musdc');
        const h = await writeContractAsync({
          ...CONTRACTS.musdc,
          functionName: 'approve',
          args: [CONTRACTS.pool.address, MAX],
        });
        setPendingTx(h);
        await new Promise((r) => setTimeout(r, 2500));
        await refetchAllowances();
      }

      // Step 3: add liquidity
      // Pool sorts tokens internally — pass BDX as amount0Desired if BDX < MUSDC by address
      const bdxIsToken0 =
        CONTRACTS.token.address.toLowerCase() < CONTRACTS.musdc.address.toLowerCase();

      const amount0Desired = bdxIsToken0 ? bdxAmount   : musdcAmount;
      const amount1Desired = bdxIsToken0 ? musdcAmount : bdxAmount;
      const amount0Min     = bdxIsToken0 ? bdxMin      : musdcMin;
      const amount1Min     = bdxIsToken0 ? musdcMin    : bdxMin;

      setStep('adding');
      const h = await writeContractAsync({
        ...CONTRACTS.pool,
        functionName: 'addLiquidity',
        args: [amount0Desired, amount1Desired, amount0Min, amount1Min, userAddress],
      });
      setPendingTx(h);
      setStep('success');
    } catch (e) {
      handleError(e);
    }
  }, [userAddress, needsApproveBDX, needsApproveMUSC, writeContractAsync, refetchAllowances, MAX]);

  const reset = useCallback(() => {
    setStep('idle');
    setError(null);
    setPendingTx(undefined);
  }, []);

  return {
    step,
    txHash: pendingTx,
    error,
    allowanceBDX,
    allowanceMUSC,
    needsApproveBDX,
    needsApproveMUSC,
    addLiquidity,
    reset,
  };
}
