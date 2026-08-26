'use client';

import { useState, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { CONTRACTS, isConfigured } from '@/constants/contracts';

export type RemoveLiqStep = 'idle' | 'approving_lp' | 'removing' | 'success' | 'error';

interface UseRemoveLiquidityResult {
  step: RemoveLiqStep;
  txHash: `0x${string}` | undefined;
  error: string | null;
  lpAllowance: bigint | undefined;
  lpBalance: bigint | undefined;
  needsApproveLP: (amount: bigint) => boolean;
  removeLiquidity: (lpAmount: bigint, min0: bigint, min1: bigint) => Promise<void>;
  reset: () => void;
}

/**
 * Manages the full Remove Liquidity flow:
 * 1. Check LP token allowance for pool
 * 2. Approve LP token if needed
 * 3. Call Pool.removeLiquidity
 */
export function useRemoveLiquidity(
  userAddress: `0x${string}` | undefined,
): UseRemoveLiquidityResult {
  const [step, setStep]           = useState<RemoveLiqStep>('idle');
  const [error, setError]         = useState<string | null>(null);
  const [pendingTx, setPendingTx] = useState<`0x${string}` | undefined>(undefined);

  const configured = isConfigured(CONTRACTS.pool.address);

  // ── LP balance ─────────────────────────────────────────────────────────────
  const { data: lpBalance, refetch: refetchBalance } = useReadContract({
    ...CONTRACTS.pool,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress && configured,
      staleTime: 1000 * 10,
    },
  });

  // Pool.removeLiquidity calls _burn(msg.sender) directly — no LP approval needed.
  const lpAllowance = undefined;
  const refetchAllowance = async () => {};

  const { writeContractAsync } = useWriteContract();
  useWaitForTransactionReceipt({ hash: pendingTx, query: { enabled: !!pendingTx } });

  const needsApproveLP = useCallback(
    (_amt: bigint) => false, // _burn(msg.sender) — no approval needed
    [],
  );

  const handleError = (e: unknown) => {
    const msg = e instanceof Error ? e.message : 'Transaction failed';
    setError(msg.includes('User rejected') ? 'Transaction rejected' : msg.slice(0, 120));
    setStep('error');
  };

  const removeLiquidity = useCallback(async (
    lpAmount: bigint,
    min0: bigint,
    min1: bigint,
  ) => {
    if (!userAddress) return;
    setError(null);

    try {
      setStep('removing');
      const h = await writeContractAsync({
        ...CONTRACTS.pool,
        functionName: 'removeLiquidity',
        args: [lpAmount, min0, min1, userAddress],
      });
      setPendingTx(h);
      await refetchBalance();
      setStep('success');
    } catch (e) {
      handleError(e);
    }
  }, [userAddress, writeContractAsync, refetchBalance]);

  const reset = useCallback(() => {
    setStep('idle');
    setError(null);
    setPendingTx(undefined);
  }, []);

  return {
    step,
    txHash: pendingTx,
    error,
    lpAllowance: lpAllowance as bigint | undefined,
    lpBalance:   lpBalance   as bigint | undefined,
    needsApproveLP,
    removeLiquidity,
    reset,
  };
}
