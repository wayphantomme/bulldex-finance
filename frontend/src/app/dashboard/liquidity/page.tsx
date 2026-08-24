import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function LiquidityPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-base font-semibold text-ink">Liquidity</h1>
        <p className="mt-0.5 text-xs text-ink-secondary">Add liquidity and earn swap fees.</p>
      </div>
      <div className="flex justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Add Liquidity</CardTitle>
            <Badge variant="yellow">Week 2</Badge>
          </CardHeader>
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-faint">
              <svg className="h-6 w-6 text-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-ink-secondary">Pool.sol AMM coming in Week 2.</p>
          </div>
          <Button fullWidth disabled variant="ghost">Coming in Week 2</Button>
        </Card>
      </div>
    </div>
  );
}
