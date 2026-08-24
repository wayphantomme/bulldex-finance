import { useReadContracts } from 'wagmi';
import { CONTRACTS } from '@/constants/contracts';

interface TokenInfo {
  name: string | undefined;
  symbol: string | undefined;
  decimals: number | undefined;
  totalSupply: bigint | undefined;
  maxSupply: bigint | undefined;
}

/**
 * Fetch static BDX token metadata in a single multicall.
 */
export function useTokenInfo(): TokenInfo & { isLoading: boolean } {
  const contract = CONTRACTS.token;

  const { data, isLoading } = useReadContracts({
    contracts: [
      { ...contract, functionName: 'name' },
      { ...contract, functionName: 'symbol' },
      { ...contract, functionName: 'decimals' },
      { ...contract, functionName: 'totalSupply' },
      { ...contract, functionName: 'MAX_SUPPLY' },
    ],
    query: {
      enabled: contract.address !== '0x0000000000000000000000000000000000000000',
      staleTime: 1000 * 60 * 5, // 5 min — static data
    },
  });

  return {
    name: data?.[0].result as string | undefined,
    symbol: data?.[1].result as string | undefined,
    decimals: data?.[2].result as number | undefined,
    totalSupply: data?.[3].result as bigint | undefined,
    maxSupply: data?.[4].result as bigint | undefined,
    isLoading,
  };
}
