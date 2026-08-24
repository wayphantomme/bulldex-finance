import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function FarmingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 font-bold text-white">Yield Farming</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Stake LP tokens and farm BDX rewards.
        </p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Farm Yield</CardTitle>
          <Badge variant="purple">Week 5–8</Badge>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-text-muted">
            MasterChef.sol is coming in Phase 2 (Weeks 5–8).
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
