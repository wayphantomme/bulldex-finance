import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function GovernancePage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-base font-semibold text-ink">Governance</h1>
        <p className="mt-0.5 text-xs text-ink-secondary">Vote on proposals and shape the protocol.</p>
      </div>
      <div className="flex justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>BDX DAO</CardTitle>
            <Badge variant="cream">Phase 3</Badge>
          </CardHeader>
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-faint">
              <svg className="h-6 w-6 text-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
              </svg>
            </div>
            <p className="text-sm text-ink-secondary">Governance.sol coming in Phase 3 (Weeks 9–12).</p>
          </div>
          <Button fullWidth disabled variant="ghost">Coming in Phase 3</Button>
        </Card>
      </div>
    </div>
  );
}
