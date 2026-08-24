import { sepolia } from 'wagmi/chains';
import { TOKEN_ABI } from './abis';

// ─── Contract Addresses ───────────────────────────────────────────────────────
// These are populated from environment variables after deployment.
// Run `make deploy-sepolia` and copy the output address to .env.local

export const CONTRACT_ADDRESSES = {
  token: (process.env.NEXT_PUBLIC_TOKEN_ADDRESS ??
    '0x0000000000000000000000000000000000000000') as `0x${string}`,
} as const;

// ─── Contract Configs (address + ABI bundles) ─────────────────────────────────
// Pass directly to wagmi hooks: useReadContract({ ...CONTRACTS.token, ... })

export const CONTRACTS = {
  token: {
    address: CONTRACT_ADDRESSES.token,
    abi: TOKEN_ABI,
    chainId: sepolia.id,
  },
} as const;

// ─── Network Config ───────────────────────────────────────────────────────────

export const SUPPORTED_CHAIN_ID = sepolia.id; // 11155111
export const BLOCK_EXPLORER = 'https://sepolia.etherscan.io';

/** Returns a Etherscan link for a given tx hash or address */
export function etherscanUrl(hashOrAddress: string, type: 'tx' | 'address' = 'tx') {
  return `${BLOCK_EXPLORER}/${type}/${hashOrAddress}`;
}
