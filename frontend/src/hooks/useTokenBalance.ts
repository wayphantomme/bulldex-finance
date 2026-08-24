import { useReadContract } from 'wagmi';
import { CONTRACTS } from '@/constants/contracts';

interface UseTokenBalanceResult {
  /** Raw balance in wei */
  raw: bigint | undefined;
  /** Whether the address has a zero address (placeholder) set */
  isContractConfigured: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetch the BDX token balance for a given address.
 *
 * @param address  Wallet address to query. Pass undefined to skip the call.
 * @returns raw bigint balance + loading/error states
 *
 * @example
 * const { raw, isLoading } = useTokenBalance(address);
 * const display = formatToken(raw); // from utils/format.ts
 */
export function useTokenBalance(address: `0x${string}` | undefined): UseTokenBalanceResult {
  const isContractConfigured =
    CONTRACTS.token.address !== '0x0000000000000000000000000000000000000000';

  const { data, isLoading, isFetching, isError, error, refetch } = useReadContract({
    ...CONTRACTS.token,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isContractConfigured,
      staleTime: 1000 * 15, // 15s
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
