import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { http } from 'wagmi';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '';
const alchemyRpc = process.env.NEXT_PUBLIC_SEPOLIA_RPC ?? '';

if (!projectId && typeof window !== 'undefined') {
  console.warn('[Bulldex] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set.');
}
if (!alchemyRpc && typeof window !== 'undefined') {
  console.warn('[Bulldex] NEXT_PUBLIC_SEPOLIA_RPC is not set - falling back to public RPC.');
}

export const wagmiConfig = getDefaultConfig({
  appName: 'Bulldex Finance',
  appDescription: 'Trade Like a Bull. Earn Like a Beast.',
  appUrl: 'https://bulldex-finance.vercel.app',
  projectId,
  chains: [sepolia],
  ssr: true,
  // Use Alchemy as primary, public RPC as fallback
  transports: {
    [sepolia.id]: http(alchemyRpc || 'https://rpc.sepolia.org'),
  },
});
