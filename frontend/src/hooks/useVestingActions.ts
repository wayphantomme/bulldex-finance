'use client';

import { useState, useCallback } from 'react';
import { useWriteContract, usePublicClient } from 'wagmi';
import { CONTRACTS } from '@/constants/contracts';

// ─── Types ────────────────────────────────────────────────────────────────────

export type VestingStep =
  | 'idle'
  | 'releasing'
  | 'success'
  | 'error';

export interface UseVestingActionsResult {
  step:    VestingStep;
  txHash:  `0x${string}` | undefined;
  error:   string | null;
  release: (beneficiary: `0x${string}`) => Promise<void>;
  reset:   () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useVestingActions(
  address: `0x${string}` | undefined,
): UseVestingActionsResult {
  const [step,   setStep]   = useState<VestingStep>('idle');
  const [error,  setError]  = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  function handleError(e: unknown) {
    const msg = e instanceof Error ? e.message : 'Transaction failed';
    let display = msg.slice(0, 200);

    if (msg.includes('NothingToRelease'))
      display = 'No tokens are available to claim yet. The cliff may not have passed.';
    else if (msg.includes('ScheduleNotFound'))
      display = 'No vesting schedule found for this address.';
    else if (msg.includes('ScheduleAlreadyRevoked'))
      display = 'This vesting schedule has been revoked.';
    else if (msg.includes('User rejected') || msg.includes('user rejected'))
      display = 'Transaction rejected.';

    setError(display);
    setStep('error');
  }

  const release = useCallback(async (beneficiary: `0x${string}`) => {
    if (!address) return;
    setError(null);
    try {
      setStep('releasing');
      const tx = await writeContractAsync({
        ...CONTRACTS.vesting,
        functionName: 'release',
        args: [beneficiary],
      });
      setTxHash(tx);
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: tx, confirmations: 1 });
      }
      setStep('success');
    } catch (e) { handleError(e); }
  }, [address, writeContractAsync, publicClient]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = useCallback(() => {
    setStep('idle');
    setError(null);
    setTxHash(undefined);
  }, []);

  return { step, txHash, error, release, reset };
}
