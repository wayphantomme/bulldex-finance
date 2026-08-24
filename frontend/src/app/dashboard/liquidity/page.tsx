import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function LiquidityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 font-bold text-white">Liquidity</h1>
        <p className="mt-1 text-sm text-text-secondary">Add liquidity and earn swap fees.</p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Add Liquidity</CardTitle>
          <Badge variant="amber">Week 2</Badge>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-text-muted">
            Liquidity provision (Pool.sol) is coming in Week 2.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
