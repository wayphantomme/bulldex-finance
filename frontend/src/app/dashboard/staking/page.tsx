import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function StakingPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-base font-semibold text-ink">Staking</h1>
        <p className="mt-0.5 text-xs text-ink-secondary">Stake BDX and earn protocol rewards.</p>
      </div>
      <div className="flex justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Stake BDX</CardTitle>
            <Badge variant="sage">Phase 2</Badge>
          </CardHeader>
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-faint">
              <svg className="h-6 w-6 text-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p className="text-sm text-ink-secondary">Staking.sol coming in Phase 2 (Weeks 5–8).</p>
          </div>
          <Button fullWidth disabled variant="ghost">Coming in Phase 2</Button>
        </Card>
      </div>
    </div>
  );
}
