import { useMemo } from 'react';
import { useReadContracts } from 'wagmi';
import { POOL_ABI } from '@/constants/abis';
import { CONTRACT_ADDRESSES, getPoolAddress, isConfigured } from '@/constants/contracts';
import type { TokenInfo } from '@/constants/contracts';

export interface PoolState {
  poolAddress: `0x${string}`;
  reserve0:    bigint | undefined;
  reserve1:    bigint | undefined;
  token0:      `0x${string}` | undefined;
  token1:      `0x${string}` | undefined;
  price0:      bigint | undefined;
  price1:      bigint | undefined;
  totalSupply: bigint | undefined;
  isLoading:   boolean;
  isConfigured: boolean;
  hasLiquidity: boolean;
}

/**
 * Read pool state for any token pair dynamically.
 * Routes to the correct pool contract based on the two tokens.
 *
 * Supports:
 *   BDX <-> MUSDC  → CONTRACT_ADDRESSES.pool
 *   BDX <-> ETH    → CONTRACT_ADDRESSES.poolBdxWeth (WETH under the hood)
 */
export function useMultiPool(tokenIn: TokenInfo, tokenOut: TokenInfo): PoolState {
  // Map ETH display token → WETH address for pool lookup
  const addrIn  = tokenIn.symbol  === 'ETH' ? CONTRACT_ADDRESSES.weth : tokenIn.address;
  const addrOut = tokenOut.symbol === 'ETH' ? CONTRACT_ADDRESSES.weth : tokenOut.address;

  const poolAddress = useMemo(
    () => getPoolAddress(addrIn, addrOut),
    [addrIn, addrOut],
  );

  const configured = isConfigured(poolAddress);

  const { data, isLoading } = useReadContracts({
    contracts: [
      { address: poolAddress, abi: POOL_ABI, functionName: 'reserve0' },
      { address: poolAddress, abi: POOL_ABI, functionName: 'reserve1' },
      { address: poolAddress, abi: POOL_ABI, functionName: 'token0' },
      { address: poolAddress, abi: POOL_ABI, functionName: 'token1' },
      { address: poolAddress, abi: POOL_ABI, functionName: 'getPrice0' },
      { address: poolAddress, abi: POOL_ABI, functionName: 'getPrice1' },
      { address: poolAddress, abi: POOL_ABI, functionName: 'totalSupply' },
    ],
    query: {
      enabled: configured,
      staleTime: 1000 * 10,
      refetchInterval: 1000 * 15,
    },
  });

  const reserve0    = data?.[0].result as bigint | undefined;
  const reserve1    = data?.[1].result as bigint | undefined;

  return {
    poolAddress,
    reserve0,
    reserve1,
    token0:      data?.[2].result as `0x${string}` | undefined,
    token1:      data?.[3].result as `0x${string}` | undefined,
    price0:      data?.[4].result as bigint | undefined,
    price1:      data?.[5].result as bigint | undefined,
    totalSupply: data?.[6].result as bigint | undefined,
    isLoading,
    isConfigured: configured,
    hasLiquidity: !!reserve0 && reserve0 > 0n && !!reserve1 && reserve1 > 0n,
  };
}
