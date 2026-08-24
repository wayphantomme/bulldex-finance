import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function LendingPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-base font-semibold text-ink">Lending</h1>
        <p className="mt-0.5 text-xs text-ink-secondary">Deposit collateral and borrow against your assets.</p>
      </div>
      <div className="flex justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Collateral Lending</CardTitle>
            <Badge variant="sage">Phase 2</Badge>
          </CardHeader>
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-faint">
              <svg className="h-6 w-6 text-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 9v1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-ink-secondary">Lending.sol coming in Phase 2 (Weeks 5–8).</p>
          </div>
          <Button fullWidth disabled variant="ghost">Coming in Phase 2</Button>
        </Card>
      </div>
    </div>
  );
}
