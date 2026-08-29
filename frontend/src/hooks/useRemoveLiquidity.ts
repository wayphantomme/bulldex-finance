'use client';

import { useState, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { CONTRACTS, CONTRACT_ADDRESSES, isConfigured } from '@/constants/contracts';
import type { PoolKey } from './useAddLiquidity';

export type RemoveLiqStep = 'idle' | 'removing' | 'success' | 'error';

interface UseRemoveLiquidityResult {
  step: RemoveLiqStep;
  txHash: `0x${string}` | undefined;
  error: string | null;
  lpBalance: bigint | undefined;
  removeLiquidity: (lpAmount: bigint, min0: bigint, min1: bigint) => Promise<void>;
  reset: () => void;
}

/**
 * Pool-aware remove liquidity hook.
 * Pool.removeLiquidity calls _burn(msg.sender) directly — no LP approval needed.
 *
 * poolKey determines which pool contract to call:
 *   bdx-musdc -> CONTRACTS.pool
 *   bdx-weth  -> CONTRACTS.poolBdxWeth
 */
export function useRemoveLiquidity(
  userAddress: `0x${string}` | undefined,
  poolKey: PoolKey = 'bdx-musdc',
): UseRemoveLiquidityResult {
  const [step, setStep]           = useState<RemoveLiqStep>('idle');
  const [error, setError]         = useState<string | null>(null);
  const [pendingTx, setPendingTx] = useState<`0x${string}` | undefined>(undefined);

  const poolContract = poolKey === 'bdx-weth' ? CONTRACTS.poolBdxWeth : CONTRACTS.pool;
  const configured   = isConfigured(poolContract.address);

  // LP balance for this pool
  const { data: lpBalance, refetch: refetchBalance } = useReadContract({
    ...poolContract,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress && configured,
      staleTime: 10_000,
    },
  });

  const { writeContractAsync } = useWriteContract();
  useWaitForTransactionReceipt({ hash: pendingTx, query: { enabled: !!pendingTx } });

  const handleError = (e: unknown) => {
    const msg = e instanceof Error ? e.message : 'Transaction failed';
    setError(msg.includes('User rejected') ? 'Transaction rejected' : msg.slice(0, 160));
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
        ...poolContract,
        functionName: 'removeLiquidity',
        args: [lpAmount, min0, min1, userAddress],
      });
      setPendingTx(h);
      await refetchBalance();
      setStep('success');
    } catch (e) {
      handleError(e);
    }
  }, [userAddress, poolContract, writeContractAsync, refetchBalance]);

  const reset = useCallback(() => {
    setStep('idle');
    setError(null);
    setPendingTx(undefined);
  }, []);

  return { step, txHash: pendingTx, error, lpBalance: lpBalance as bigint | undefined, removeLiquidity, reset };
}
