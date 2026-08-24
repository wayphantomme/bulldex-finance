import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Web3Provider } from '@/providers/Web3Provider';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Bulldex Finance — Trade Like a Bull. Earn Like a Beast.',
  description: 'Decentralized trading protocol combining token swaps, liquidity provision, lending, staking, yield farming, and governance.',
  keywords: ['DeFi', 'DEX', 'swap', 'liquidity', 'staking', 'yield farming', 'Bulldex'],
  openGraph: {
    title: 'Bulldex Finance',
    description: 'Trade Like a Bull. Earn Like a Beast.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@wayphantomme',
    title: 'Bulldex Finance',
    description: 'Trade Like a Bull. Earn Like a Beast.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <Web3Provider>
          {children}
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: {
                background: '#1C1A28',
                border: '1px solid #2A2640',
                color: '#E8E6F0',
                borderRadius: '12px',
                fontSize: '13px',
              },
            }}
          />
        </Web3Provider>
      </body>
    </html>
  );
}
