'use client';

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <Header />
      <Sidebar />

      {/*
        Main content area:
        - pt-12: offset for fixed navbar (h-12 = 48px)
        - lg:ml-[220px]: offset for sidebar on desktop only
        - Mobile: full width, sidebar hidden, accessible via hamburger menu in header
      */}
      <main className="pt-12 lg:ml-[220px] min-h-screen">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          {children}
        </div>
      </main>
    </div>
  );
}
