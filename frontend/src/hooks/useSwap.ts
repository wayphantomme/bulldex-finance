'use client';

import { useState, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits } from 'viem';
import { CONTRACTS, isConfigured } from '@/constants/contracts';

export type SwapStep = 'idle' | 'approving' | 'approved' | 'swapping' | 'success' | 'error';

interface UseSwapResult {
  step: SwapStep;
  txHash: `0x${string}` | undefined;
  error: string | null;
  allowance: bigint | undefined;
  needsApproval: (amountIn: bigint) => boolean;
  approve: (tokenIn: `0x${string}`, amountIn: bigint) => Promise<void>;
  swap: (tokenIn: `0x${string}`, amountIn: bigint, minAmountOut: bigint) => Promise<void>;
  reset: () => void;
}

/**
 * Hook managing the full swap flow:
 * 1. Check allowance
 * 2. Approve token spend (if needed)
 * 3. Execute swap
 * 4. Wait for confirmation
 */
export function useSwap(
  tokenIn: `0x${string}` | undefined,
  userAddress: `0x${string}` | undefined,
): UseSwapResult {
  const [step, setStep] = useState<SwapStep>('idle');
  const [error, setError] = useState<string | null>(null);

  const poolConfigured = isConfigured(CONTRACTS.pool.address);

  // ── Read current allowance - separate hooks per token ─────────────────────
  const isBDX = tokenIn === CONTRACTS.token.address;

  const { data: allowanceBDX, refetch: refetchBDX } = useReadContract({
    ...CONTRACTS.token,
    functionName: 'allowance',
    args: userAddress && poolConfigured ? [userAddress, CONTRACTS.pool.address] : undefined,
    query: {
      enabled: !!userAddress && isBDX && poolConfigured,
      staleTime: 1000 * 10,
    },
  });

  const { data: allowanceMUSC, refetch: refetchMUSC } = useReadContract({
    ...CONTRACTS.musdc,
    functionName: 'allowance',
    args: userAddress && poolConfigured ? [userAddress, CONTRACTS.pool.address] : undefined,
    query: {
      enabled: !!userAddress && !isBDX && poolConfigured,
      staleTime: 1000 * 10,
    },
  });

  const allowance = isBDX ? allowanceBDX : allowanceMUSC;
  const refetchAllowance = isBDX ? refetchBDX : refetchMUSC;

  // ── Write: approve ──────────────────────────────────────────────────────────
  const { writeContractAsync: writeApprove } = useWriteContract();

  // ── Write: swap ─────────────────────────────────────────────────────────────
  const { writeContractAsync: writeSwap } = useWriteContract();

  // ── Track tx confirmation ────────────────────────────────────────────────────
  const [pendingTx, setPendingTx] = useState<`0x${string}` | undefined>(undefined);

  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({
    hash: pendingTx,
    query: { enabled: !!pendingTx },
  });

  // ── Actions ─────────────────────────────────────────────────────────────────

  const needsApproval = useCallback(
    (amountIn: bigint) => {
      if (!allowance) return true;
      return (allowance as bigint) < amountIn;
    },
    [allowance],
  );

  const approve = useCallback(
    async (token: `0x${string}`, amountIn: bigint) => {
      setError(null);
      setStep('approving');
      try {
        const MAX = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
        const isBDXToken = token === CONTRACTS.token.address;
        const hash = await writeApprove({
          address: token,
          abi: isBDXToken ? CONTRACTS.token.abi : CONTRACTS.musdc.abi,
          functionName: 'approve',
          args: [CONTRACTS.pool.address, MAX],
        });
        setPendingTx(hash);
        // Wait briefly then refetch allowance
        await new Promise((r) => setTimeout(r, 2000));
        await refetchAllowance();
        setStep('approved');
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Approval failed';
        setError(msg.includes('User rejected') ? 'Transaction rejected' : msg);
        setStep('error');
      }
    },
    [writeApprove, refetchAllowance],
  );

  const swap = useCallback(
    async (token: `0x${string}`, amountIn: bigint, minAmountOut: bigint) => {
      if (!userAddress) return;
      setError(null);
      setStep('swapping');
      try {
        const hash = await writeSwap({
          ...CONTRACTS.pool,
          functionName: 'swap',
          args: [token, amountIn, minAmountOut, userAddress],
        });
        setPendingTx(hash);
        setStep('success');
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Swap failed';
        setError(msg.includes('User rejected') ? 'Transaction rejected' : msg);
        setStep('error');
      }
    },
    [writeSwap, userAddress],
  );

  const reset = useCallback(() => {
    setStep('idle');
    setError(null);
    setPendingTx(undefined);
  }, []);

  return {
    step,
    txHash: pendingTx,
    error,
    allowance: allowance as bigint | undefined,
    needsApproval,
    approve,
    swap,
    reset,
  };
}

/**
 * Parse a user-entered amount string to bigint (18 decimals).
 * Returns 0n on invalid input.
 */
export function parseAmount(value: string, decimals = 18): bigint {
  try {
    if (!value || value === '.' || value === '0.' || parseFloat(value) === 0) return 0n;
    return parseUnits(value, decimals);
  } catch {
    return 0n;
  }
}

/**
 * Apply slippage tolerance to a minAmountOut.
 * @param amount    Expected output
 * @param slippageBps Slippage in basis points (50 = 0.5%)
 */
export function applySlippage(amount: bigint, slippageBps: number): bigint {
  return (amount * BigInt(10000 - slippageBps)) / 10000n;
}
