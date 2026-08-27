'use client';

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { PriceTicker } from '@/components/layout/PriceTicker';
import { OnboardingModal } from '@/components/layout/OnboardingModal';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-base-bg">
      <Header />
      <PriceTicker />
      <Sidebar />
      <OnboardingModal />

      {/* Main content — offset for header (h-14) + ticker (h-8) + sidebar (w-16) */}
      <main className="ml-16 pt-[88px]">
        <div className="mx-auto max-w-layout px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
