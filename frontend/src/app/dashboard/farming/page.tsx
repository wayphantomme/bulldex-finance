import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function FarmingPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Yield Farming</h1>
        <p className="mt-1 text-sm text-ink-secondary">Stake LP tokens and farm BDX rewards.</p>
      </div>
      <div className="flex justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Farm Yield</CardTitle>
            <Badge variant="sage">Phase 2</Badge>
          </CardHeader>
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-faint">
              <svg className="h-6 w-6 text-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <p className="text-sm text-ink-secondary">MasterChef.sol coming in Phase 2 (Weeks 5–8).</p>
          </div>
          <Button fullWidth disabled variant="ghost">Coming in Phase 2</Button>
        </Card>
      </div>
    </div>
  );
}
