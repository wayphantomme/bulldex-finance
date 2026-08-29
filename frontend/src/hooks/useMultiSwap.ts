'use client';

import { useState, useCallback } from 'react';
import { useWriteContract, useReadContracts, usePublicClient } from 'wagmi';
import { CONTRACTS, CONTRACT_ADDRESSES, isConfigured } from '@/constants/contracts';
import { POOL_ABI, WETH_ABI } from '@/constants/abis';
import type { TokenInfo } from '@/constants/contracts';

export type MultiSwapStep =
  | 'idle'
  | 'wrapping'     // ETH wrap
  | 'approving'
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

export function useMultiSwap(userAddress: `0x${string}` | undefined): UseMultiSwapResult {
  const [step, setStep]           = useState<MultiSwapStep>('idle');
  const [error, setError]         = useState<string | null>(null);
  const [pendingTx, setPendingTx] = useState<`0x${string}` | undefined>(undefined);

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  // Read allowances for all swappable ERC-20s across both pools
  const { data: allowances, refetch: refetchAllowances } = useReadContracts({
    contracts: [
      { ...CONTRACTS.token, functionName: 'allowance', args: userAddress ? [userAddress, CONTRACT_ADDRESSES.pool] : undefined },
      { ...CONTRACTS.musdc, functionName: 'allowance', args: userAddress ? [userAddress, CONTRACT_ADDRESSES.pool] : undefined },
      { ...CONTRACTS.token, functionName: 'allowance', args: userAddress ? [userAddress, CONTRACT_ADDRESSES.poolBdxWeth] : undefined },
      { ...CONTRACTS.weth,  functionName: 'allowance', args: userAddress ? [userAddress, CONTRACT_ADDRESSES.poolBdxWeth] : undefined },
    ],
    query: {
      enabled: !!userAddress && isConfigured(CONTRACTS.token.address),
      staleTime: 10_000,
    },
  });

  // Wait for a tx to be mined — required before the next dependent tx
  async function awaitTx(hash: `0x${string}`) {
    if (publicClient) {
      await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 });
    } else {
      await new Promise((r) => setTimeout(r, 4000));
    }
  }

  function getAllowance(tokenIn: TokenInfo, poolAddress: `0x${string}`): bigint {
    const pool     = poolAddress.toLowerCase();
    const bdxMusdc = CONTRACT_ADDRESSES.pool.toLowerCase();
    const bdxWeth  = CONTRACT_ADDRESSES.poolBdxWeth.toLowerCase();

    if (pool === bdxMusdc) {
      if (tokenIn.symbol === 'BDX')   return (allowances?.[0].result as bigint | undefined) ?? 0n;
      if (tokenIn.symbol === 'MUSDC') return (allowances?.[1].result as bigint | undefined) ?? 0n;
    }
    if (pool === bdxWeth) {
      if (tokenIn.symbol === 'BDX')                           return (allowances?.[2].result as bigint | undefined) ?? 0n;
      if (tokenIn.symbol === 'WETH' || tokenIn.symbol === 'ETH') return (allowances?.[3].result as bigint | undefined) ?? 0n;
    }
    return 0n;
  }

  const needsApproval = useCallback(
    (tokenIn: TokenInfo, amountIn: bigint, poolAddress: `0x${string}`) => {
      if (tokenIn.symbol === 'ETH') return false; // ETH wraps first, approval checked separately
      return getAllowance(tokenIn, poolAddress) < amountIn;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allowances],
  );

  const handleError = (e: unknown) => {
    const msg = e instanceof Error ? e.message : 'Transaction failed';
    let display = msg.slice(0, 200);
    if (msg.includes('0xfb8f41b2') || msg.includes('ERC20InsufficientAllowance')) {
      display = 'Approval did not confirm in time. Please try again.';
    } else if (msg.includes('SlippageExceeded') || msg.includes('0x') || msg.toLowerCase().includes('slippage')) {
      display = 'Price moved too much. Try increasing slippage tolerance in settings.';
    } else if (msg.includes('InsufficientInputAmount') || msg.includes('InsufficientOutputAmount')) {
      display = 'Amount too small. Try a larger amount.';
    } else if (msg.includes('User rejected') || msg.includes('user rejected')) {
      display = 'Transaction rejected.';
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
      // ── ETH path: wrap then approve then swap ─────────────────────────────
      if (tokenIn.symbol === 'ETH') {
        // 1. Wrap ETH -> WETH
        setStep('wrapping');
        const wrapHash = await writeContractAsync({
          address: CONTRACT_ADDRESSES.weth,
          abi: WETH_ABI,
          functionName: 'deposit',
          value: amountIn,
        });
        setPendingTx(wrapHash);
        await awaitTx(wrapHash); // wait for wrap to mine before approving

        // 2. Approve WETH for pool
        setStep('approving');
        const approveHash = await writeContractAsync({
          address: CONTRACT_ADDRESSES.weth,
          abi: WETH_ABI,
          functionName: 'approve',
          args: [poolAddress, MAX],
        });
        setPendingTx(approveHash);
        await awaitTx(approveHash); // wait for approval to mine before swapping
        await refetchAllowances();

        // 3. Swap WETH -> token
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

      // 1. Approve if needed
      if (needsApproval(tokenIn, amountIn, poolAddress)) {
        setStep('approving');
        const tokenContract = tokenIn.symbol === 'BDX'   ? CONTRACTS.token
                            : tokenIn.symbol === 'MUSDC'  ? CONTRACTS.musdc
                            :                               CONTRACTS.weth;

        const approveHash = await writeContractAsync({
          address: tokenContract.address,
          abi:     tokenContract.abi,
          functionName: 'approve',
          args: [poolAddress, MAX],
        });
        setPendingTx(approveHash);
        await awaitTx(approveHash); // wait for approval before swapping
        await refetchAllowances();
      }

      // 2. Swap
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
  }, [userAddress, needsApproval, writeContractAsync, refetchAllowances]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = useCallback(() => {
    setStep('idle');
    setError(null);
    setPendingTx(undefined);
  }, []);

  return { step, txHash: pendingTx, error, needsApproval, execute, reset };
}
