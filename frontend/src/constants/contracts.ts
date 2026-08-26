import { sepolia } from 'wagmi/chains';
import { TOKEN_ABI, MOCK_TOKEN_ABI, POOL_ABI, FACTORY_ABI } from './abis';

// ─── Contract Addresses ───────────────────────────────────────────────────────
// Populated from environment variables after running: make deploy-sepolia

export const CONTRACT_ADDRESSES = {
  token:   (process.env.NEXT_PUBLIC_TOKEN_ADDRESS   ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
  musdc:   (process.env.NEXT_PUBLIC_MUSDC_ADDRESS   ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
  factory: (process.env.NEXT_PUBLIC_FACTORY_ADDRESS ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
  pool:    (process.env.NEXT_PUBLIC_POOL_BDX_MUSDC  ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
} as const;

// ─── Token Metadata ───────────────────────────────────────────────────────────

export interface TokenInfo {
  address: `0x${string}`;
  symbol: string;
  name: string;
  decimals: number;
  logoColor: string;
  logoSrc: string; // path to icon in /public
}

export const TOKENS: Record<'BDX' | 'MUSDC', TokenInfo> = {
  BDX: {
    address: CONTRACT_ADDRESSES.token,
    symbol: 'BDX',
    name: 'Bulldex Finance',
    decimals: 18,
    logoColor: 'bg-green/20 text-green',
    logoSrc: '/bulldex-logo.png',
  },
  MUSDC: {
    address: CONTRACT_ADDRESSES.musdc,
    symbol: 'MUSDC',
    name: 'Mock USDC',
    decimals: 18,
    logoColor: 'bg-blue-500/20 text-blue-400',
    logoSrc: '/musdc-icon.svg',
  },
} as const;

export const TOKEN_LIST = Object.values(TOKENS);

// ─── Contract Configs (address + ABI) ─────────────────────────────────────────

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
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const SUPPORTED_CHAIN_ID = sepolia.id; // 11155111
export const BLOCK_EXPLORER = 'https://sepolia.etherscan.io';

export function etherscanUrl(hashOrAddress: string, type: 'tx' | 'address' = 'tx') {
  return `${BLOCK_EXPLORER}/${type}/${hashOrAddress}`;
}

export function isConfigured(address: `0x${string}`) {
  return address !== '0x0000000000000000000000000000000000000000';
}
