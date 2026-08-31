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
  title: 'Bulldex Finance | Trade Like a Bull. Earn Like a Beast.',
  description: 'Decentralized trading protocol combining token swaps, liquidity provision, lending, staking, yield farming, and governance.',
  keywords: ['DeFi', 'DEX', 'swap', 'liquidity', 'staking', 'yield farming', 'Bulldex'],
  icons: {
    icon: '/bdx-token.png',
    apple: '/bdx-token.png',
    shortcut: '/bdx-token.png',
  },
  openGraph: {
    title: 'Bulldex Finance',
    description: 'Trade Like a Bull. Earn Like a Beast.',
    type: 'website',
    images: ['/bdx-token.png'],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@wayphantomme',
    title: 'Bulldex Finance',
    description: 'Trade Like a Bull. Earn Like a Beast.',
    images: ['/bdx-token.png'],
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
                background: '#1a1a1a',
                border: '1px solid #262626',
                color: '#f5f5f5',
                borderRadius: '8px',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
              },
            }}
          />
        </Web3Provider>
      </body>
    </html>
  );
}
