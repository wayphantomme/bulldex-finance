import { useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import { POOL_ABI } from '@/constants/abis';
import { CONTRACT_ADDRESSES, isConfigured } from '@/constants/contracts';

// ─── Chainlink ETH/USD on Sepolia ─────────────────────────────────────────────
const CHAINLINK_ETH_USD = '0x694AA1769357215DE4FAC081bf1f309aDC325306' as const;

const CHAINLINK_ABI = [
  {
    type: 'function',
    name: 'latestRoundData',
    inputs: [],
    outputs: [
      { name: 'roundId',         type: 'uint80'  },
      { name: 'answer',          type: 'int256'  }, // price with 8 decimals
      { name: 'startedAt',       type: 'uint256' },
      { name: 'updatedAt',       type: 'uint256' },
      { name: 'answeredInRound', type: 'uint80'  },
    ],
    stateMutability: 'view',
  },
] as const;

export interface PriceTicker {
  bdxPriceUSD:  string | null;  // e.g. "$0.000250"
  bdxPriceRaw:  number | null;  // raw float for calculations
  ethPriceUSD:  string | null;  // e.g. "$2,506"
  ethPriceRaw:  number | null;

  // TVL = BDX_reserve × bdxPriceUSD + MUSDC_reserve × 1
  tvlUSD:       string | null;

  isLoading: boolean;
}

/**
 * BDX price calculation:
 *   1. Read BDX/WETH pool reserves
 *   2. Spot price = wethReserve / bdxReserve = WETH per BDX
 *   3. BDX price USD = (WETH per BDX) × ETH/USD (Chainlink)
 *
 * Why this works:
 *   Pool seeded: 1,000,000 BDX + 0.1 WETH
 *   Spot = 0.1 / 1,000,000 = 0.0000001 WETH/BDX
 *   × $2,500 ETH/USD = $0.00025 per BDX
 *
 * Price changes when swaps happen — more BDX bought → price rises,
 * more BDX sold → price falls. Pure AMM mechanics.
 */
export function usePriceTicker(): PriceTicker {
  const wethPoolConfigured  = isConfigured(CONTRACT_ADDRESSES.poolBdxWeth);
  const musdcPoolConfigured = isConfigured(CONTRACT_ADDRESSES.pool);

  const isBdxToken0InWethPool =
    CONTRACT_ADDRESSES.token.toLowerCase() < CONTRACT_ADDRESSES.weth.toLowerCase();

  const { data, isLoading } = useReadContracts({
    contracts: [
      // BDX/WETH pool — for BDX USD price
      { address: CONTRACT_ADDRESSES.poolBdxWeth, abi: POOL_ABI, functionName: 'reserve0' },
      { address: CONTRACT_ADDRESSES.poolBdxWeth, abi: POOL_ABI, functionName: 'reserve1' },

      // BDX/MUSDC pool — for TVL
      { address: CONTRACT_ADDRESSES.pool, abi: POOL_ABI, functionName: 'reserve0' },
      { address: CONTRACT_ADDRESSES.pool, abi: POOL_ABI, functionName: 'reserve1' },

      // Chainlink ETH/USD
      { address: CHAINLINK_ETH_USD, abi: CHAINLINK_ABI, functionName: 'latestRoundData' },
    ],
    query: {
      enabled: wethPoolConfigured || musdcPoolConfigured,
      staleTime: 1000 * 30,
      refetchInterval: 1000 * 60,
    },
  });

  // ── Parse results ──────────────────────────────────────────────────────────

  const wethR0 = data?.[0].result as bigint | undefined;
  const wethR1 = data?.[1].result as bigint | undefined;
  const musdcR0 = data?.[2].result as bigint | undefined;
  const musdcR1 = data?.[3].result as bigint | undefined;
  const chainlink = data?.[4].result as readonly [bigint, bigint, bigint, bigint, bigint] | undefined;

  // ── ETH price from Chainlink ───────────────────────────────────────────────
  let ethPriceRaw: number | null = null;
  let ethPriceUSD: string | null = null;
  if (chainlink && chainlink[1] > 0n) {
    ethPriceRaw = parseFloat(formatUnits(chainlink[1], 8));
    ethPriceUSD = `$${ethPriceRaw.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }

  // ── BDX price in USD via BDX/WETH pool ────────────────────────────────────
  // BDX/WETH pool: one of token0/token1 is BDX, other is WETH
  // If BDX < WETH by address → BDX is token0 → bdxReserve=r0, wethReserve=r1
  let bdxPriceRaw: number | null = null;
  let bdxPriceUSD: string | null = null;

  if (wethR0 !== undefined && wethR1 !== undefined && wethR0 > 0n && wethR1 > 0n && ethPriceRaw) {
    const bdxReserve  = isBdxToken0InWethPool ? wethR0 : wethR1;
    const wethReserve = isBdxToken0InWethPool ? wethR1 : wethR0;

    // WETH per BDX = wethReserve / bdxReserve
    const wethPerBdx = parseFloat(formatUnits(wethReserve, 18)) / parseFloat(formatUnits(bdxReserve, 18));
    bdxPriceRaw = wethPerBdx * ethPriceRaw;

    // Format: show enough decimals to be meaningful
    if (bdxPriceRaw < 0.00001) {
      bdxPriceUSD = `$${bdxPriceRaw.toFixed(8)}`;
    } else if (bdxPriceRaw < 0.001) {
      bdxPriceUSD = `$${bdxPriceRaw.toFixed(6)}`;
    } else if (bdxPriceRaw < 1) {
      bdxPriceUSD = `$${bdxPriceRaw.toFixed(4)}`;
    } else {
      bdxPriceUSD = `$${bdxPriceRaw.toFixed(2)}`;
    }
  }

  // ── TVL = sum of both pools in USD ────────────────────────────────────────
  // BDX/MUSDC pool TVL:
  //   MUSDC side: MUSDC is pegged in pool context but NOT to USD → use BDX price
  //   Simpler: TVL = 2 × (MUSDC_reserve) if we treat MUSDC as if $1
  //   OR: TVL = 2 × (BDX_reserve × bdxPriceUSD) for BDX/MUSDC pool
  // BDX/WETH pool TVL:
  //   TVL = 2 × (wethReserve × ethPriceUSD)
  let tvlUSD: string | null = null;

  if (bdxPriceRaw && ethPriceRaw) {
    let tvl = 0;

    // BDX/MUSDC pool — use BDX price × 2 × BDX reserve (50/50 pool by value)
    if (musdcR0 !== undefined && musdcR1 !== undefined && musdcR0 > 0n) {
      const bdxResMusdc = CONTRACT_ADDRESSES.token.toLowerCase() < CONTRACT_ADDRESSES.musdc.toLowerCase()
        ? musdcR0 : musdcR1;
      tvl += 2 * parseFloat(formatUnits(bdxResMusdc, 18)) * bdxPriceRaw;
    }

    // BDX/WETH pool — 2 × WETH reserve × ETH price
    if (wethR0 !== undefined && wethR1 !== undefined && wethR0 > 0n) {
      const wethRes = isBdxToken0InWethPool ? wethR1 : wethR0;
      tvl += 2 * parseFloat(formatUnits(wethRes, 18)) * ethPriceRaw;
    }

    if (tvl > 0) {
      tvlUSD = tvl < 1000
        ? `$${tvl.toFixed(2)}`
        : `$${(tvl / 1000).toFixed(2)}K`;
    }
  }

  return {
    bdxPriceUSD,
    bdxPriceRaw,
    ethPriceUSD,
    ethPriceRaw,
    tvlUSD,
    isLoading,
  };
}
