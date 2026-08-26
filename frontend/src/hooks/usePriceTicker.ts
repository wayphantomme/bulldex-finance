import { useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import { CONTRACTS, CONTRACT_ADDRESSES, isConfigured } from '@/constants/contracts';
import { POOL_ABI } from '@/constants/abis';

// Chainlink ETH/USD price feed on Sepolia
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
  // BDX price in MUSDC (from BDX/MUSDC pool)
  bdxPriceMUSC:    string | null;  // e.g. "0.0000050"
  bdxChange:       number | null;  // % — null for now (no historical)

  // ETH price in USD (from Chainlink)
  ethPriceUSD:     string | null;  // e.g. "2,847"
  ethChange:       number | null;

  isLoading: boolean;
}

export function usePriceTicker(): PriceTicker {
  const poolConfigured = isConfigured(CONTRACT_ADDRESSES.pool);

  const { data, isLoading } = useReadContracts({
    contracts: [
      // BDX/MUSDC pool reserves
      {
        address: CONTRACT_ADDRESSES.pool,
        abi: POOL_ABI,
        functionName: 'getPrice0', // price of token0 in token1 (scaled 1e18)
      },
      {
        address: CONTRACT_ADDRESSES.pool,
        abi: POOL_ABI,
        functionName: 'token0',
      },
      // Chainlink ETH/USD
      {
        address: CHAINLINK_ETH_USD,
        abi: CHAINLINK_ABI,
        functionName: 'latestRoundData',
      },
    ],
    query: {
      enabled: poolConfigured,
      staleTime: 1000 * 30,
      refetchInterval: 1000 * 60, // every 60s
    },
  });

  const price0    = data?.[0].result as bigint | undefined;
  const token0    = data?.[1].result as `0x${string}` | undefined;
  const chainlink = data?.[2].result as readonly [bigint, bigint, bigint, bigint, bigint] | undefined;

  // BDX price: depends on which token is token0
  // If token0 = BDX → price0 = MUSDC per BDX
  // If token0 = MUSDC → price0 = BDX per MUSDC → invert
  let bdxPriceMUSC: string | null = null;
  if (price0 !== undefined && token0) {
    const isBDXToken0 = token0.toLowerCase() === CONTRACTS.token.address.toLowerCase();
    const raw = isBDXToken0 ? price0 : (price0 > 0n ? (BigInt(1e18) * BigInt(1e18)) / price0 : 0n);
    const num = parseFloat(formatUnits(raw, 18));
    if (num > 0) {
      bdxPriceMUSC = num < 0.001
        ? num.toFixed(8)
        : num.toFixed(4);
    }
  }

  // ETH price from Chainlink (8 decimals)
  let ethPriceUSD: string | null = null;
  if (chainlink) {
    const answer = chainlink[1]; // int256 answer
    if (answer > 0n) {
      const usd = parseFloat(formatUnits(answer, 8));
      ethPriceUSD = usd.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }
  }

  return {
    bdxPriceMUSC,
    bdxChange:   null, // historical data not available on-chain without events
    ethPriceUSD,
    ethChange:   null,
    isLoading,
  };
}
