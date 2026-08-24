import { BalanceDisplay } from '@/components/features/BalanceDisplay';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-h2 font-bold text-white">Overview</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Your portfolio and protocol stats at a glance.
        </p>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Balance card — full width on mobile, 1 col on desktop */}
        <div className="lg:col-span-1">
          <BalanceDisplay />
        </div>

        {/* Stats cards */}
        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard
              label="Total Value Locked"
              value="—"
              hint="Deploy contracts to see TVL"
              badge={<Badge variant="muted">Coming soon</Badge>}
            />
            <StatCard
              label="24h Volume"
              value="—"
              hint="No swaps yet"
              badge={<Badge variant="muted">Coming soon</Badge>}
            />
            <StatCard
              label="BDX Price"
              value="—"
              hint="Oracle not configured"
              badge={<Badge variant="muted">Coming soon</Badge>}
            />
            <StatCard
              label="Your Positions"
              value="0"
              hint="No active positions"
              badge={<Badge variant="purple">Week 1</Badge>}
            />
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {QUICK_ACTIONS.map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-2 rounded-card border border-border bg-bg-elevated p-4 text-center transition-colors hover:border-brand-purple/40 hover:bg-bg-card"
              >
                <span className="text-brand-purple">{action.icon}</span>
                <span className="text-xs font-medium text-text-secondary">{action.label}</span>
              </a>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  badge?: React.ReactNode;
}

function StatCard({ label, value, hint, badge }: StatCardProps) {
  return (
    <Card variant="default">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-text-muted">{label}</p>
          <p className="mt-1 text-h3 font-bold text-white">{value}</p>
          {hint && <p className="mt-0.5 text-xs text-text-muted">{hint}</p>}
        </div>
        {badge && <div>{badge}</div>}
      </div>
    </Card>
  );
}

// ── Quick Actions ─────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  {
    label: 'Swap',
    href: '/dashboard/swap',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    ),
  },
  {
    label: 'Add Liquidity',
    href: '/dashboard/liquidity',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Stake BDX',
    href: '/dashboard/staking',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    label: 'Farm Yield',
    href: '/dashboard/farming',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
];
