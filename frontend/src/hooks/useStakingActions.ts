'use client';

import { useState, useCallback } from 'react';
import { useWriteContract, usePublicClient } from 'wagmi';
import { maxUint256 } from 'viem';
import { CONTRACTS, CONTRACT_ADDRESSES } from '@/constants/contracts';

// ─── Types ────────────────────────────────────────────────────────────────────

export type StakingStep =
  | 'idle'
  | 'approving'
  | 'staking'
  | 'unstaking'
  | 'claiming'
  | 'success'
  | 'error';

export interface UseStakingActionsResult {
  step:    StakingStep;
  txHash:  `0x${string}` | undefined;
  error:   string | null;
  stake:             (amount: bigint, lockDays: number) => Promise<void>;
  unstake:           (amount: bigint) => Promise<void>;
  claimRewards:      () => Promise<void>;
  emergencyWithdraw: () => Promise<void>;
  reset:             () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStakingActions(
  address: `0x${string}` | undefined,
): UseStakingActionsResult {
  const [step,   setStep]   = useState<StakingStep>('idle');
  const [error,  setError]  = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  // ── Helpers ────────────────────────────────────────────────────────────────

  async function awaitTx(hash: `0x${string}`) {
    if (publicClient) {
      await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 });
    } else {
      await new Promise((r) => setTimeout(r, 4000));
    }
  }

  function handleError(e: unknown) {
    const msg = e instanceof Error ? e.message : 'Transaction failed';
    let display = msg.slice(0, 200);

    if (msg.includes('StillLocked'))
      display = 'Tokens are still locked. Wait until the lock period expires.';
    else if (msg.includes('NothingStaked'))
      display = 'You have no staked tokens.';
    else if (msg.includes('NothingToClaim'))
      display = 'No rewards to claim yet.';
    else if (msg.includes('InvalidLockDays'))
      display = 'Invalid lock period. Choose 0, 30, 90, or 180 days.';
    else if (msg.includes('ZeroAmount'))
      display = 'Amount must be greater than 0.';
    else if (msg.includes('PeriodNotFinished'))
      display = 'Reward period is still active.';
    else if (msg.includes('User rejected') || msg.includes('user rejected'))
      display = 'Transaction rejected.';
    else if (msg.includes('ERC20InsufficientAllowance'))
      display = 'Approval failed. Please try again.';

    setError(display);
    setStep('error');
  }

  // ── stake ──────────────────────────────────────────────────────────────────

  const stake = useCallback(async (amount: bigint, lockDays: number) => {
    if (!address) return;
    setError(null);
    try {
      // Approve BDX for staking contract
      setStep('approving');
      const approveTx = await writeContractAsync({
        ...CONTRACTS.token,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.staking, maxUint256],
      });
      setTxHash(approveTx);
      await awaitTx(approveTx);

      // Stake
      setStep('staking');
      const tx = await writeContractAsync({
        ...CONTRACTS.staking,
        functionName: 'stake',
        args: [amount, BigInt(lockDays)],
      });
      setTxHash(tx);
      setStep('success');
    } catch (e) { handleError(e); }
  }, [address, writeContractAsync]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── unstake ────────────────────────────────────────────────────────────────

  const unstake = useCallback(async (amount: bigint) => {
    if (!address) return;
    setError(null);
    try {
      setStep('unstaking');
      const tx = await writeContractAsync({
        ...CONTRACTS.staking,
        functionName: 'unstake',
        args: [amount],
      });
      setTxHash(tx);
      setStep('success');
    } catch (e) { handleError(e); }
  }, [address, writeContractAsync]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── claimRewards ───────────────────────────────────────────────────────────

  const claimRewards = useCallback(async () => {
    if (!address) return;
    setError(null);
    try {
      setStep('claiming');
      const tx = await writeContractAsync({
        ...CONTRACTS.staking,
        functionName: 'claimRewards',
      });
      setTxHash(tx);
      setStep('success');
    } catch (e) { handleError(e); }
  }, [address, writeContractAsync]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── emergencyWithdraw ──────────────────────────────────────────────────────

  const emergencyWithdraw = useCallback(async () => {
    if (!address) return;
    setError(null);
    try {
      setStep('unstaking');
      const tx = await writeContractAsync({
        ...CONTRACTS.staking,
        functionName: 'emergencyWithdraw',
      });
      setTxHash(tx);
      setStep('success');
    } catch (e) { handleError(e); }
  }, [address, writeContractAsync]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── reset ──────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setStep('idle');
    setError(null);
    setTxHash(undefined);
  }, []);

  return { step, txHash, error, stake, unstake, claimRewards, emergencyWithdraw, reset };
}
