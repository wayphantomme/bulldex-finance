import { useMemo } from 'react';
import { formatUnits } from 'viem';
import { useReadContracts } from 'wagmi';
import { CONTRACTS, isConfigured } from '@/constants/contracts';

export interface PoolStats {
  // Raw reserves
  reserve0: bigint | undefined; // token0 (lower addr)
  reserve1: bigint | undefined; // token1 (higher addr)
  // Sorted by display order: BDX first, MUSDC second
  bdxReserve: bigint | undefined;
  musdcReserve: bigint | undefined;
  // Token addresses
  token0: `0x${string}` | undefined;
  token1: `0x${string}` | undefined;
  // Prices (scaled 1e18)
  price0: bigint | undefined;
  price1: bigint | undefined;
  // LP supply
  totalSupply: bigint | undefined;
  // Formatted for display
  bdxReserveFormatted: string;
  musdcReserveFormatted: string;
  bdxPriceFormatted: string;    // MUSDC per BDX
  musdcPriceFormatted: string;  // BDX per MUSDC
  totalSupplyFormatted: string;
  // Status
  isLoading: boolean;
  isConfigured: boolean;
  hasLiquidity: boolean;
}

/**
 * Reads all pool stats in a single multicall.
 * Refreshes every 15s.
 * Defaults to BDX/MUSDC pool. Pass a poolAddress to read any pool.
 */
export function usePoolStats(poolAddress?: `0x${string}`): PoolStats {
  const addr = poolAddress ?? CONTRACTS.pool.address;
  const configured = isConfigured(addr);

  const { data, isLoading } = useReadContracts({
    contracts: [
      { address: addr, abi: CONTRACTS.pool.abi, functionName: 'reserve0' },
      { address: addr, abi: CONTRACTS.pool.abi, functionName: 'reserve1' },
      { address: addr, abi: CONTRACTS.pool.abi, functionName: 'token0' },
      { address: addr, abi: CONTRACTS.pool.abi, functionName: 'token1' },
      { address: addr, abi: CONTRACTS.pool.abi, functionName: 'getPrice0' },
      { address: addr, abi: CONTRACTS.pool.abi, functionName: 'getPrice1' },
      { address: addr, abi: CONTRACTS.pool.abi, functionName: 'totalSupply' },
    ],
    query: {
      enabled: configured,
      staleTime: 1000 * 10,
      refetchInterval: 1000 * 15,
    },
  });

  const reserve0    = data?.[0].result as bigint | undefined;
  const reserve1    = data?.[1].result as bigint | undefined;
  const token0      = data?.[2].result as `0x${string}` | undefined;
  const token1      = data?.[3].result as `0x${string}` | undefined;
  const price0      = data?.[4].result as bigint | undefined;
  const price1      = data?.[5].result as bigint | undefined;
  const totalSupply = data?.[6].result as bigint | undefined;

  // Determine which token is BDX (token0 or token1) by comparing addresses
  const isBDXToken0 = useMemo(() => {
    if (!token0) return true;
    return token0.toLowerCase() === CONTRACTS.token.address.toLowerCase();
  }, [token0]);

  const bdxReserve   = isBDXToken0 ? reserve0 : reserve1;
  const musdcReserve = isBDXToken0 ? reserve1 : reserve0;

  // Price: how much MUSDC per 1 BDX
  // If BDX is token0, price0 = reserve1/reserve0 = MUSDC per BDX
  const bdxPrice   = isBDXToken0 ? price0 : price1;
  const musdcPrice = isBDXToken0 ? price1 : price0;

  const hasLiquidity = !!reserve0 && reserve0 > 0n && !!reserve1 && reserve1 > 0n;

  return {
    reserve0,
    reserve1,
    bdxReserve,
    musdcReserve,
    token0,
    token1,
    price0,
    price1,
    totalSupply,
    bdxReserveFormatted:  bdxReserve   ? formatTokenAmount(bdxReserve, 18)   : '0',
    musdcReserveFormatted: musdcReserve ? formatTokenAmount(musdcReserve, 18) : '0',
    bdxPriceFormatted:    bdxPrice     ? parseFloat(formatUnits(bdxPrice, 18)).toFixed(4)   : '0',
    musdcPriceFormatted:  musdcPrice   ? parseFloat(formatUnits(musdcPrice, 18)).toFixed(6) : '0',
    totalSupplyFormatted: totalSupply  ? formatTokenAmount(totalSupply, 18)  : '0',
    isLoading,
    isConfigured: configured,
    hasLiquidity,
  };
}

/**
 * Calculate a user's pool share given their LP balance.
 */
export function usePoolShare(
  lpBalance: bigint | undefined,
  totalSupply: bigint | undefined,
  reserve0: bigint | undefined,
  reserve1: bigint | undefined,
  isBDXToken0: boolean,
) {
  return useMemo(() => {
    if (!lpBalance || !totalSupply || totalSupply === 0n || !reserve0 || !reserve1) {
      return { sharePct: 0, bdxAmount: 0n, musdcAmount: 0n, sharePctFormatted: '0.000' };
    }
    const bdxRes   = isBDXToken0 ? reserve0 : reserve1;
    const musdcRes = isBDXToken0 ? reserve1 : reserve0;

    const bdxAmount   = (lpBalance * bdxRes)   / totalSupply;
    const musdcAmount = (lpBalance * musdcRes) / totalSupply;
    const sharePct    = Number((lpBalance * 10000n) / totalSupply) / 100;

    return {
      sharePct,
      bdxAmount,
      musdcAmount,
      sharePctFormatted: sharePct.toFixed(3),
    };
  }, [lpBalance, totalSupply, reserve0, reserve1, isBDXToken0]);
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatTokenAmount(amount: bigint, decimals: number): string {
  const n = parseFloat(formatUnits(amount, decimals));
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(2)}K`;
  return n.toFixed(4);
}
