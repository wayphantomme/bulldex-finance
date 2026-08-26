import { sepolia } from 'wagmi/chains';
import { TOKEN_ABI, MOCK_TOKEN_ABI, POOL_ABI, FACTORY_ABI, WETH_ABI } from './abis';

// ─── Contract Addresses ───────────────────────────────────────────────────────

export const CONTRACT_ADDRESSES = {
  token:       (process.env.NEXT_PUBLIC_TOKEN_ADDRESS   ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
  musdc:       (process.env.NEXT_PUBLIC_MUSDC_ADDRESS   ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
  weth:        (process.env.NEXT_PUBLIC_WETH_ADDRESS    ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
  factory:     (process.env.NEXT_PUBLIC_FACTORY_ADDRESS ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
  pool:        (process.env.NEXT_PUBLIC_POOL_BDX_MUSDC  ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
  poolBdxWeth: (process.env.NEXT_PUBLIC_POOL_BDX_WETH   ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
} as const;

// ─── Token Metadata ───────────────────────────────────────────────────────────

export interface TokenInfo {
  address: `0x${string}`;
  symbol: string;
  name: string;
  decimals: number;
  logoColor: string;
  logoSrc: string;
  isNative?: boolean; // true for ETH display (backed by WETH wrap)
}

export const TOKENS: Record<'BDX' | 'MUSDC' | 'ETH', TokenInfo> = {
  BDX: {
    address:  CONTRACT_ADDRESSES.token,
    symbol:   'BDX',
    name:     'Bulldex Finance',
    decimals: 18,
    logoColor: 'bg-green/20 text-green',
    logoSrc:  '/bulldex-logo.png',
  },
  MUSDC: {
    address:  CONTRACT_ADDRESSES.musdc,
    symbol:   'MUSDC',
    name:     'Mock USDC',
    decimals: 18,
    logoColor: 'bg-blue-500/20 text-blue-400',
    logoSrc:  '/musdc-icon.svg',
  },
  ETH: {
    address:  CONTRACT_ADDRESSES.weth, // WETH address — used for pool lookups
    symbol:   'ETH',
    name:     'Ether',
    decimals: 18,
    logoColor: 'bg-[#627EEA]/20 text-[#627EEA]',
    logoSrc:  '/eth-icon.svg',
    isNative: true,
  },
} as const;

export const TOKEN_LIST = Object.values(TOKENS);

// ─── Pool routing — which pool to use for a given pair ────────────────────────

export function getPoolAddress(
  tokenA: `0x${string}`,
  tokenB: `0x${string}`,
): `0x${string}` {
  const a = tokenA.toLowerCase();
  const b = tokenB.toLowerCase();
  const bdx   = CONTRACT_ADDRESSES.token.toLowerCase();
  const musdc  = CONTRACT_ADDRESSES.musdc.toLowerCase();
  const weth   = CONTRACT_ADDRESSES.weth.toLowerCase();

  if ((a === bdx && b === musdc) || (a === musdc && b === bdx)) return CONTRACT_ADDRESSES.pool;
  if ((a === bdx && b === weth)  || (a === weth  && b === bdx)) return CONTRACT_ADDRESSES.poolBdxWeth;
  return '0x0000000000000000000000000000000000000000';
}

// ─── Contract Configs ─────────────────────────────────────────────────────────

export const CONTRACTS = {
  token: {
    address: CONTRACT_ADDRESSES.token,
    abi: TOKEN_ABI,
    chainId: sepolia.id,
  },
  musdc: {
    address: CONTRACT_ADDRESSES.musdc,
    abi: MOCK_TOKEN_ABI,
    chainId: sepolia.id,
  },
  weth: {
    address: CONTRACT_ADDRESSES.weth,
    abi: WETH_ABI,
    chainId: sepolia.id,
  },
  factory: {
    address: CONTRACT_ADDRESSES.factory,
    abi: FACTORY_ABI,
    chainId: sepolia.id,
  },
  pool: {
    address: CONTRACT_ADDRESSES.pool,
    abi: POOL_ABI,
    chainId: sepolia.id,
  },
  poolBdxWeth: {
    address: CONTRACT_ADDRESSES.poolBdxWeth,
    abi: POOL_ABI,
    chainId: sepolia.id,
  },
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const SUPPORTED_CHAIN_ID = sepolia.id;
export const BLOCK_EXPLORER = 'https://sepolia.etherscan.io';

export function etherscanUrl(hashOrAddress: string, type: 'tx' | 'address' = 'tx') {
  return `${BLOCK_EXPLORER}/${type}/${hashOrAddress}`;
}

export function isConfigured(address: `0x${string}`) {
  return address !== '0x0000000000000000000000000000000000000000';
}
