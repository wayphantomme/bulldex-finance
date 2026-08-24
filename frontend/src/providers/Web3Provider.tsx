'use client';

import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import { wagmiConfig } from '@/config/wagmi';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30s - blockchain data refreshes often
      retry: 2,
    },
  },
});

/**
 * RainbowKit dark theme - matches Jupiter-style dark green aesthetic.
 * Lime green accent, no purple.
 */
const bulldexTheme = darkTheme({
  accentColor: '#4ADE80',        // lime green - matches brand
  accentColorForeground: '#0C0F0C', // dark text on green button
  borderRadius: 'medium',
  fontStack: 'system',
  overlayBlur: 'small',
});

interface Web3ProviderProps {
  children: React.ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={bulldexTheme} modalSize="compact" locale="en-US">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
