import { useReadContracts } from 'wagmi';
import { CONTRACTS, isConfigured } from '@/constants/contracts';

interface PoolData {
  reserve0: bigint | undefined;
  reserve1: bigint | undefined;
  token0: `0x${string}` | undefined;
  token1: `0x${string}` | undefined;
  price0: bigint | undefined; // price of token0 in token1, scaled 1e18
  price1: bigint | undefined;
  totalSupply: bigint | undefined;
  isLoading: boolean;
  isConfigured: boolean;
}

/**
 * Read pool state: reserves, token addresses, prices, LP total supply.
 * Multicall - single RPC round trip.
 */
export function usePool(): PoolData {
  const configured = isConfigured(CONTRACTS.pool.address);

  const { data, isLoading } = useReadContracts({
    contracts: [
      { ...CONTRACTS.pool, functionName: 'reserve0' },
      { ...CONTRACTS.pool, functionName: 'reserve1' },
      { ...CONTRACTS.pool, functionName: 'token0' },
      { ...CONTRACTS.pool, functionName: 'token1' },
      { ...CONTRACTS.pool, functionName: 'getPrice0' },
      { ...CONTRACTS.pool, functionName: 'getPrice1' },
      { ...CONTRACTS.pool, functionName: 'totalSupply' },
    ],
    query: {
      enabled: configured,
      staleTime: 1000 * 10,
      refetchInterval: 1000 * 15,
    },
  });

  return {
    reserve0:    data?.[0].result as bigint | undefined,
    reserve1:    data?.[1].result as bigint | undefined,
    token0:      data?.[2].result as `0x${string}` | undefined,
    token1:      data?.[3].result as `0x${string}` | undefined,
    price0:      data?.[4].result as bigint | undefined,
    price1:      data?.[5].result as bigint | undefined,
    totalSupply: data?.[6].result as bigint | undefined,
    isLoading,
    isConfigured: configured,
  };
}

/**
 * Get a quote for swapping tokenIn -> tokenOut.
 * Returns the expected output amount given amountIn.
 */
export function useSwapQuote(
  tokenIn: `0x${string}` | undefined,
  amountIn: bigint | undefined,
  reserve0: bigint | undefined,
  reserve1: bigint | undefined,
  token0: `0x${string}` | undefined,
) {
  const enabled =
    !!tokenIn &&
    !!amountIn &&
    amountIn > 0n &&
    !!reserve0 &&
    reserve0 > 0n &&
    !!reserve1 &&
    reserve1 > 0n &&
    !!token0 &&
    isConfigured(CONTRACTS.pool.address);

  const isToken0In = token0 && tokenIn ? tokenIn.toLowerCase() === token0.toLowerCase() : false;
  const reserveIn  = isToken0In ? reserve0 : reserve1;
  const reserveOut = isToken0In ? reserve1 : reserve0;

  const { data, isLoading } = useReadContracts({
    contracts: [
      {
        ...CONTRACTS.pool,
        functionName: 'getAmountOut',
        args: enabled ? [amountIn!, reserveIn!, reserveOut!] : undefined,
      },
      {
        ...CONTRACTS.pool,
        functionName: 'getPriceImpact',
        args: enabled ? [tokenIn!, amountIn!] : undefined,
      },
    ],
    query: {
      enabled,
      staleTime: 1000 * 5,
    },
  });

  return {
    amountOut:   data?.[0].result as bigint | undefined,
    priceImpact: data?.[1].result as bigint | undefined, // basis points
    isLoading,
  };
}
