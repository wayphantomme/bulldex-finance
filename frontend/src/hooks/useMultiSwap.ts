'use client';

import { useState, useCallback } from 'react';
import { useWriteContract, useReadContracts } from 'wagmi';
import { CONTRACTS, CONTRACT_ADDRESSES, isConfigured } from '@/constants/contracts';
import { POOL_ABI, WETH_ABI } from '@/constants/abis';
import type { TokenInfo } from '@/constants/contracts';

export type MultiSwapStep =
  | 'idle'
  | 'wrapping'     // ETH → WETH (only when tokenIn is ETH)
  | 'approving'    // ERC-20 approve
  | 'swapping'
  | 'success'
  | 'error';

interface UseMultiSwapResult {
  step: MultiSwapStep;
  txHash: `0x${string}` | undefined;
  error: string | null;
  needsApproval: (tokenIn: TokenInfo, amountIn: bigint, poolAddress: `0x${string}`) => boolean;
  execute: (
    tokenIn: TokenInfo,
    amountIn: bigint,
    minAmountOut: bigint,
    poolAddress: `0x${string}`,
    recipient: `0x${string}`,
  ) => Promise<void>;
  reset: () => void;
}

const MAX = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

/**
 * Handles the full swap flow for any token pair including ETH:
 *
 * For ERC-20 → ERC-20:
 *   1. Approve if needed
 *   2. Pool.swap(tokenIn, amountIn, minOut, recipient)
 *
 * For ETH → WETH → ERC-20:
 *   1. WETH.deposit{value: amountIn}()  (wrap)
 *   2. WETH.approve(pool, MAX)
 *   3. Pool.swap(weth, amountIn, minOut, recipient)
 *
 * For ERC-20 → ETH (via WETH):
 *   1. Approve ERC-20 if needed
 *   2. Pool.swap(tokenIn, amountIn, minOut, recipient)
 *   NOTE: recipient gets WETH — auto-unwrap not implemented yet (coming with router)
 */
export function useMultiSwap(userAddress: `0x${string}` | undefined): UseMultiSwapResult {
  const [step, setStep]       = useState<MultiSwapStep>('idle');
  const [error, setError]     = useState<string | null>(null);
  const [pendingTx, setPendingTx] = useState<`0x${string}` | undefined>(undefined);

  const { writeContractAsync } = useWriteContract();

  // Read allowances for all swappable ERC-20s
  const { data: allowances, refetch: refetchAllowances } = useReadContracts({
    contracts: [
      // BDX allowance for BDX/MUSDC pool
      { ...CONTRACTS.token, functionName: 'allowance', args: userAddress ? [userAddress, CONTRACT_ADDRESSES.pool] : undefined },
      // MUSDC allowance for BDX/MUSDC pool
      { ...CONTRACTS.musdc, functionName: 'allowance', args: userAddress ? [userAddress, CONTRACT_ADDRESSES.pool] : undefined },
      // BDX allowance for BDX/WETH pool
      { ...CONTRACTS.token, functionName: 'allowance', args: userAddress ? [userAddress, CONTRACT_ADDRESSES.poolBdxWeth] : undefined },
      // WETH allowance for BDX/WETH pool
      { ...CONTRACTS.weth,  functionName: 'allowance', args: userAddress ? [userAddress, CONTRACT_ADDRESSES.poolBdxWeth] : undefined },
    ],
    query: {
      enabled: !!userAddress && isConfigured(CONTRACTS.token.address),
      staleTime: 1000 * 10,
    },
  });

  function getAllowance(tokenIn: TokenInfo, poolAddress: `0x${string}`): bigint {
    const pool = poolAddress.toLowerCase();
    const bdxMusdc = CONTRACT_ADDRESSES.pool.toLowerCase();
    const bdxWeth  = CONTRACT_ADDRESSES.poolBdxWeth.toLowerCase();

    if (pool === bdxMusdc) {
      if (tokenIn.symbol === 'BDX')   return (allowances?.[0].result as bigint | undefined) ?? 0n;
      if (tokenIn.symbol === 'MUSDC') return (allowances?.[1].result as bigint | undefined) ?? 0n;
    }
    if (pool === bdxWeth) {
      if (tokenIn.symbol === 'BDX')  return (allowances?.[2].result as bigint | undefined) ?? 0n;
      if (tokenIn.symbol === 'WETH') return (allowances?.[3].result as bigint | undefined) ?? 0n;
      if (tokenIn.symbol === 'ETH')  return (allowances?.[3].result as bigint | undefined) ?? 0n;
    }
    return 0n;
  }

  const needsApproval = useCallback(
    (tokenIn: TokenInfo, amountIn: bigint, poolAddress: `0x${string}`) => {
      if (tokenIn.symbol === 'ETH') return false; // ETH wraps first, no separate approval check
      return getAllowance(tokenIn, poolAddress) < amountIn;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allowances],
  );

  const handleError = (e: unknown) => {
    const msg = e instanceof Error ? e.message : 'Transaction failed';
    let display = msg;
    if (msg.includes('0xfb8f41b2') || msg.toLowerCase().includes('slippage')) {
      display = 'Slippage exceeded — price moved too much. Try increasing slippage tolerance in settings.';
    } else if (msg.includes('User rejected')) {
      display = 'Transaction rejected';
    } else {
      display = msg.slice(0, 140);
    }
    setError(display);
    setStep('error');
  };

  const execute = useCallback(async (
    tokenIn: TokenInfo,
    amountIn: bigint,
    minAmountOut: bigint,
    poolAddress: `0x${string}`,
    recipient: `0x${string}`,
  ) => {
    if (!userAddress) return;
    setError(null);

    try {
      // ── ETH path: wrap first ──────────────────────────────────────────────
      if (tokenIn.symbol === 'ETH') {
        // Step 1: wrap ETH → WETH
        setStep('wrapping');
        const wrapHash = await writeContractAsync({
          address: CONTRACT_ADDRESSES.weth,
          abi: WETH_ABI,
          functionName: 'deposit',
          value: amountIn,
        });
        setPendingTx(wrapHash);
        await new Promise((r) => setTimeout(r, 3000)); // wait for wrap

        // Step 2: approve WETH for pool
        setStep('approving');
        const approveHash = await writeContractAsync({
          address: CONTRACT_ADDRESSES.weth,
          abi: WETH_ABI,
          functionName: 'approve',
          args: [poolAddress, MAX],
        });
        setPendingTx(approveHash);
        await new Promise((r) => setTimeout(r, 2500));
        await refetchAllowances();

        // Step 3: swap WETH → BDX
        setStep('swapping');
        const swapHash = await writeContractAsync({
          address: poolAddress,
          abi: POOL_ABI,
          functionName: 'swap',
          args: [CONTRACT_ADDRESSES.weth, amountIn, minAmountOut, recipient],
        });
        setPendingTx(swapHash);
        setStep('success');
        return;
      }

      // ── ERC-20 path ───────────────────────────────────────────────────────

      // Step 1: approve if needed
      if (needsApproval(tokenIn, amountIn, poolAddress)) {
        setStep('approving');
        const tokenContract = tokenIn.symbol === 'BDX' ? CONTRACTS.token
          : tokenIn.symbol === 'MUSDC' ? CONTRACTS.musdc
          : CONTRACTS.weth;

        const approveHash = await writeContractAsync({
          address: tokenContract.address,
          abi: tokenContract.abi,
          functionName: 'approve',
          args: [poolAddress, MAX],
        });
        setPendingTx(approveHash);
        await new Promise((r) => setTimeout(r, 2500));
        await refetchAllowances();
      }

      // Step 2: swap
      setStep('swapping');
      const swapHash = await writeContractAsync({
        address: poolAddress,
        abi: POOL_ABI,
        functionName: 'swap',
        args: [tokenIn.address, amountIn, minAmountOut, recipient],
      });
      setPendingTx(swapHash);
      setStep('success');

    } catch (e) {
      handleError(e);
    }
  }, [userAddress, needsApproval, writeContractAsync, refetchAllowances]);

  const reset = useCallback(() => {
    setStep('idle');
    setError(null);
    setPendingTx(undefined);
  }, []);

  return { step, txHash: pendingTx, error, needsApproval, execute, reset };
}
