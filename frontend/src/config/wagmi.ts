import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '';

if (!projectId && typeof window !== 'undefined') {
  console.warn(
    '[Bulldex] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. Wallet connections may be limited.',
  );
}

export const wagmiConfig = getDefaultConfig({
  appName: 'Bulldex Finance',
  appDescription: 'Trade Like a Bull. Earn Like a Beast.',
  appUrl: 'https://bulldex-finance.vercel.app',
  projectId,
  chains: [sepolia],
  ssr: true,
});
