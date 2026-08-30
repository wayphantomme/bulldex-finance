'use client';

import { useState, useCallback } from 'react';
import { useWriteContract, usePublicClient } from 'wagmi';
import { maxUint256 } from 'viem';
import { CONTRACTS, CONTRACT_ADDRESSES } from '@/constants/contracts';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FarmingStep =
  | 'idle'
  | 'approving'    // waiting for LP token approval tx
  | 'depositing'   // waiting for deposit tx
  | 'withdrawing'  // waiting for withdraw tx
  | 'harvesting'   // waiting for harvest / harvestAll tx
  | 'success'
  | 'error';

export interface UseFarmingActionsResult {
  step:    FarmingStep;
  txHash:  `0x${string}` | undefined;
  error:   string | null;
  deposit:          (pid: number, amount: bigint, lpToken: `0x${string}`) => Promise<void>;
  withdraw:         (pid: number, amount: bigint) => Promise<void>;
  harvest:          (pid: number) => Promise<void>;
  harvestAll:       () => Promise<void>;
  emergencyWithdraw: (pid: number) => Promise<void>;
  reset:            () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFarmingActions(
  address: `0x${string}` | undefined,
): UseFarmingActionsResult {
  const [step,   setStep]   = useState<FarmingStep>('idle');
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

    if (msg.includes('ZeroAmount'))
      display = 'Amount must be greater than 0.';
    else if (msg.includes('InvalidPool'))
      display = 'Invalid farming pool.';
    else if (msg.includes('DuplicatePool'))
      display = 'This LP token is already registered.';
    else if (msg.includes('insufficient balance'))
      display = 'Insufficient LP balance in farm.';
    else if (msg.includes('ERC20InsufficientAllowance'))
      display = 'Approval failed. Please try again.';
    else if (msg.includes('User rejected') || msg.includes('user rejected'))
      display = 'Transaction rejected.';

    setError(display);
    setStep('error');
  }

  // ── deposit ────────────────────────────────────────────────────────────────

  const deposit = useCallback(async (
    pid: number,
    amount: bigint,
    lpToken: `0x${string}`,
  ) => {
    if (!address) return;
    setError(null);
    try {
      // Approve LP token for MasterChef
      setStep('approving');
      const approveTx = await writeContractAsync({
        address:      lpToken,
        abi: [
          {
            type: 'function' as const,
            name: 'approve' as const,
            inputs:  [{ name: 'spender', type: 'address' as const }, { name: 'value', type: 'uint256' as const }],
            outputs: [{ type: 'bool' as const }],
            stateMutability: 'nonpayable' as const,
          },
        ],
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.masterChef, maxUint256],
      });
      setTxHash(approveTx);
      await awaitTx(approveTx);

      // Deposit LP
      setStep('depositing');
      const tx = await writeContractAsync({
        ...CONTRACTS.masterChef,
        functionName: 'deposit',
        args: [BigInt(pid), amount],
      });
      setTxHash(tx);
      await awaitTx(tx);
      setStep('success');
    } catch (e) { handleError(e); }
  }, [address, writeContractAsync]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── withdraw ───────────────────────────────────────────────────────────────

  const withdraw = useCallback(async (pid: number, amount: bigint) => {
    if (!address) return;
    setError(null);
    try {
      setStep('withdrawing');
      const tx = await writeContractAsync({
        ...CONTRACTS.masterChef,
        functionName: 'withdraw',
        args: [BigInt(pid), amount],
      });
      setTxHash(tx);
      await awaitTx(tx);
      setStep('success');
    } catch (e) { handleError(e); }
  }, [address, writeContractAsync]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── harvest ────────────────────────────────────────────────────────────────

  const harvest = useCallback(async (pid: number) => {
    if (!address) return;
    setError(null);
    try {
      setStep('harvesting');
      const tx = await writeContractAsync({
        ...CONTRACTS.masterChef,
        functionName: 'harvest',
        args: [BigInt(pid)],
      });
      setTxHash(tx);
      await awaitTx(tx);
      setStep('success');
    } catch (e) { handleError(e); }
  }, [address, writeContractAsync]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── harvestAll ─────────────────────────────────────────────────────────────

  const harvestAll = useCallback(async () => {
    if (!address) return;
    setError(null);
    try {
      setStep('harvesting');
      const tx = await writeContractAsync({
        ...CONTRACTS.masterChef,
        functionName: 'harvestAll',
      });
      setTxHash(tx);
      await awaitTx(tx);
      setStep('success');
    } catch (e) { handleError(e); }
  }, [address, writeContractAsync]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── emergencyWithdraw ──────────────────────────────────────────────────────

  const emergencyWithdraw = useCallback(async (pid: number) => {
    if (!address) return;
    setError(null);
    try {
      setStep('withdrawing');
      const tx = await writeContractAsync({
        ...CONTRACTS.masterChef,
        functionName: 'emergencyWithdraw',
        args: [BigInt(pid)],
      });
      setTxHash(tx);
      await awaitTx(tx);
      setStep('success');
    } catch (e) { handleError(e); }
  }, [address, writeContractAsync]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── reset ──────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setStep('idle');
    setError(null);
    setTxHash(undefined);
  }, []);

  return {
    step,
    txHash,
    error,
    deposit,
    withdraw,
    harvest,
    harvestAll,
    emergencyWithdraw,
    reset,
  };
}
