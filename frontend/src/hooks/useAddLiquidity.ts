'use client';

import { useState, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
import { CONTRACTS, CONTRACT_ADDRESSES, isConfigured } from '@/constants/contracts';

export type PoolKey = 'bdx-musdc' | 'bdx-weth';

export type AddLiqStep =
  | 'idle'
  | 'approving_bdx'
  | 'approving_t1'     // second token: MUSDC or WETH
  | 'adding'
  | 'success'
  | 'error';

interface UseAddLiquidityResult {
  step: AddLiqStep;
  txHash: `0x${string}` | undefined;
  error: string | null;
  addLiquidity: (
    token0Amount: bigint,
    token1Amount: bigint,
    token0Min: bigint,
    token1Min: bigint,
  ) => Promise<void>;
  reset: () => void;
}

/**
 * Per-pool add liquidity hook.
 *
 * poolKey determines which pool contract and which second token to use:
 *   bdx-musdc -> CONTRACTS.pool,       second token = MUSDC
 *   bdx-weth  -> CONTRACTS.poolBdxWeth, second token = WETH
 *
 * Token ordering (token0 < token1 by address) is determined per pool.
 * The caller always passes (bdxAmount, secondTokenAmount) — this hook
 * maps them to (amount0, amount1) in the correct on-chain order.
 *
 * Flow:
 *   1. Approve BDX if allowance < bdxAmount
 *   2. Approve second token if allowance < secondTokenAmount
 *   3. Call poolContract.addLiquidity(amount0, amount1, min0, min1, to)
 */
export function useAddLiquidity(
  userAddress: `0x${string}` | undefined,
  poolKey: PoolKey = 'bdx-musdc',
): UseAddLiquidityResult {
  const [step, setStep]         = useState<AddLiqStep>('idle');
  const [error, setError]       = useState<string | null>(null);
  const [pendingTx, setPendingTx] = useState<`0x${string}` | undefined>(undefined);

  // ── Derive pool-specific constants ────────────────────────────────────────
  const isBdxWeth = poolKey === 'bdx-weth';

  const poolContract  = isBdxWeth ? CONTRACTS.poolBdxWeth : CONTRACTS.pool;
  const t1Contract    = isBdxWeth ? CONTRACTS.weth        : CONTRACTS.musdc;

  // Address of second token in this pool (WETH or MUSDC)
  const t1Address = isBdxWeth
    ? CONTRACT_ADDRESSES.weth
    : CONTRACT_ADDRESSES.musdc;

  // Determine on-chain token ordering: the pool stores token0 < token1 by address
  const bdxAddress = CONTRACT_ADDRESSES.token.toLowerCase();
  const t1AddressLower = t1Address.toLowerCase();
  const bdxIsToken0 = bdxAddress < t1AddressLower;

  const poolConfigured = isConfigured(poolContract.address);

  // ── Read both allowances in one multicall ─────────────────────────────────
  const { data: allowances, refetch: refetchAllowances } = useReadContracts({
    contracts: [
      {
        ...CONTRACTS.token,
        functionName: 'allowance',
        args: userAddress && poolConfigured
          ? [userAddress, poolContract.address]
          : undefined,
      },
      {
        ...t1Contract,
        functionName: 'allowance',
        args: userAddress && poolConfigured
          ? [userAddress, poolContract.address]
          : undefined,
      },
    ],
    query: {
      enabled: !!userAddress && poolConfigured,
      staleTime: 10_000,
    },
  });

  const allowanceBDX = allowances?.[0].result as bigint | undefined;
  const allowanceT1  = allowances?.[1].result as bigint | undefined;

  const { writeContractAsync } = useWriteContract();
  useWaitForTransactionReceipt({ hash: pendingTx, query: { enabled: !!pendingTx } });

  const MAX = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

  const handleError = (e: unknown) => {
    const msg = e instanceof Error ? e.message : 'Transaction failed';
    setError(msg.includes('User rejected') ? 'Transaction rejected' : msg.slice(0, 160));
    setStep('error');
  };

  // ── Main action ───────────────────────────────────────────────────────────
  // Caller passes (bdxAmount, t1Amount, bdxMin, t1Min).
  // This hook maps to on-chain (amount0, amount1) order.
  const addLiquidity = useCallback(async (
    bdxAmount:  bigint,
    t1Amount:   bigint,
    bdxMin:     bigint,
    t1Min:      bigint,
  ) => {
    if (!userAddress) return;
    setError(null);

    try {
      // Step 1: approve BDX if needed
      if (!allowanceBDX || allowanceBDX < bdxAmount) {
        setStep('approving_bdx');
        const h = await writeContractAsync({
          ...CONTRACTS.token,
          functionName: 'approve',
          args: [poolContract.address, MAX],
        });
        setPendingTx(h);
        await new Promise((r) => setTimeout(r, 2500));
        await refetchAllowances();
      }

      // Step 2: approve second token if needed
      if (!allowanceT1 || allowanceT1 < t1Amount) {
        setStep('approving_t1');
        const h = await writeContractAsync({
          address:      t1Contract.address,
          abi:          t1Contract.abi,
          functionName: 'approve',
          args: [poolContract.address, MAX],
        });
        setPendingTx(h);
        await new Promise((r) => setTimeout(r, 2500));
        await refetchAllowances();
      }

      // Step 3: map to on-chain token0/token1 order
      const amount0Desired = bdxIsToken0 ? bdxAmount : t1Amount;
      const amount1Desired = bdxIsToken0 ? t1Amount  : bdxAmount;
      const amount0Min     = bdxIsToken0 ? bdxMin    : t1Min;
      const amount1Min     = bdxIsToken0 ? t1Min     : bdxMin;

      setStep('adding');
      const h = await writeContractAsync({
        ...poolContract,
        functionName: 'addLiquidity',
        args: [amount0Desired, amount1Desired, amount0Min, amount1Min, userAddress],
      });
      setPendingTx(h);
      setStep('success');
    } catch (e) {
      handleError(e);
    }
  }, [
    userAddress,
    allowanceBDX,
    allowanceT1,
    bdxIsToken0,
    poolContract,
    t1Contract,
    writeContractAsync,
    refetchAllowances,
    MAX,
  ]);

  const reset = useCallback(() => {
    setStep('idle');
    setError(null);
    setPendingTx(undefined);
  }, []);

  return { step, txHash: pendingTx, error, addLiquidity, reset };
}
