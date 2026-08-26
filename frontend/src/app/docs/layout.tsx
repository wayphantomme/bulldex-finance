import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Docs | Bulldex Finance',
  description: 'Technical documentation and dev log for Bulldex Finance DeFi protocol.',
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
