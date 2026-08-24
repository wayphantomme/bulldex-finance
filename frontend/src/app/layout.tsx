import type { Metadata } from 'next';
import { Web3Provider } from '@/providers/Web3Provider';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bulldex Finance — Trade Like a Bull. Earn Like a Beast.',
  description:
    'Decentralized trading protocol combining token swaps, liquidity provision, lending, staking, yield farming, and governance.',
  keywords: ['DeFi', 'DEX', 'swap', 'liquidity', 'staking', 'yield farming', 'Bulldex'],
  openGraph: {
    title: 'Bulldex Finance',
    description: 'Trade Like a Bull. Earn Like a Beast.',
    type: 'website',
    url: 'https://bulldex-finance.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@wayphantomme',
    title: 'Bulldex Finance',
    description: 'Trade Like a Bull. Earn Like a Beast.',
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="dark">
      <body>
        <Web3Provider>
          {children}
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: {
                background: '#1E293B',
                border: '1px solid #334155',
                color: '#FFFFFF',
              },
            }}
          />
        </Web3Provider>
      </body>
    </html>
  );
}
