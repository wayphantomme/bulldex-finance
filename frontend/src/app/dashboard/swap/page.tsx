import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function SwapPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 font-bold text-white">Swap</h1>
        <p className="mt-1 text-sm text-text-secondary">Exchange tokens at the best rate.</p>
      </div>

      <div className="flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Swap Tokens</CardTitle>
            <Badge variant="amber">Week 2</Badge>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-text-muted">
              Pool.sol (AMM) is being built in Week 2. Come back soon!
            </p>
            <div className="mt-4 rounded-card border border-dashed border-border bg-bg-elevated p-6 text-center">
              <p className="text-xs text-text-muted">
                Token swap interface — coming in Week 2
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
