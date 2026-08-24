import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-base-bg">
      <Header />
      <Sidebar />

      {/* Main content — offset for fixed header (h-14) and sidebar (w-16) */}
      <main className="ml-16 pt-14">
        <div className="mx-auto max-w-layout px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
