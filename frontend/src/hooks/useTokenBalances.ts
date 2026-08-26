'use client';

import { useReadContracts, useBalance } from 'wagmi';
import { CONTRACTS, CONTRACT_ADDRESSES, isConfigured } from '@/constants/contracts';

export interface TokenBalances {
  bdx:   bigint;
  musdc: bigint;
  weth:  bigint;
  eth:   bigint;   // native ETH
  isLoading: boolean;
}

/**
 * Read BDX + MUSDC + WETH balanceOf + native ETH balance
 * in a single multicall round-trip.
 */
export function useTokenBalances(
  address: `0x${string}` | undefined,
): TokenBalances {
  const enabled = !!address && isConfigured(CONTRACTS.token.address);

  // ERC-20 balances via multicall
  const { data, isLoading: erc20Loading } = useReadContracts({
    contracts: [
      { ...CONTRACTS.token, functionName: 'balanceOf', args: address ? [address] : undefined },
      { ...CONTRACTS.musdc, functionName: 'balanceOf', args: address ? [address] : undefined },
      { ...CONTRACTS.weth,  functionName: 'balanceOf', args: address ? [address] : undefined },
    ],
    query: {
      enabled,
      staleTime: 1000 * 10,
      refetchInterval: 1000 * 15,
    },
  });

  // Native ETH balance
  const { data: ethData, isLoading: ethLoading } = useBalance({
    address,
    query: {
      enabled: !!address,
      staleTime: 1000 * 10,
      refetchInterval: 1000 * 15,
    },
  });

  return {
    bdx:       (data?.[0].result as bigint | undefined) ?? 0n,
    musdc:     (data?.[1].result as bigint | undefined) ?? 0n,
    weth:      (data?.[2].result as bigint | undefined) ?? 0n,
    eth:       ethData?.value ?? 0n,
    isLoading: erc20Loading || ethLoading,
  };
}

/**
 * Get balance for a specific token symbol from the balances object.
 */
export function getBalanceForSymbol(
  symbol: string,
  balances: TokenBalances,
): bigint {
  switch (symbol) {
    case 'BDX':   return balances.bdx;
    case 'MUSDC': return balances.musdc;
    case 'WETH':  return balances.weth;
    case 'ETH':   return balances.eth;
    default:      return 0n;
  }
}

/**
 * Get the WETH address to use for pool operations.
 * ETH display token maps to WETH contract for swaps.
 */
export function getSwapAddress(symbol: string): `0x${string}` {
  if (symbol === 'ETH') return CONTRACT_ADDRESSES.weth;
  return '0x0000000000000000000000000000000000000000';
}
