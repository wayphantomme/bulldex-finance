import { useReadContract } from 'wagmi';
import { CONTRACTS } from '@/constants/contracts';

interface UseTokenBalanceResult {
  raw: bigint | undefined;
  isContractConfigured: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTokenBalance(address: `0x${string}` | undefined): UseTokenBalanceResult {
  const isContractConfigured =
    CONTRACTS.token.address !== '0x0000000000000000000000000000000000000000';

  const { data, isLoading, isFetching, isError, error, refetch } = useReadContract({
    ...CONTRACTS.token,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isContractConfigured,
      staleTime: 1000 * 10,        // 10s
      refetchInterval: 1000 * 15,  // auto-refresh every 15s
    },
  });

  return {
    raw: data as bigint | undefined,
    isContractConfigured,
    isLoading,
    isFetching,
    isError,
    error: error as Error | null,
    refetch,
  };
}
