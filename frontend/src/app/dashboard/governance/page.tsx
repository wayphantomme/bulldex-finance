import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function GovernancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 font-bold text-white">Governance</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Vote on proposals and shape the protocol.
        </p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>BDX DAO</CardTitle>
          <Badge variant="purple">Week 9–12</Badge>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-text-muted">
            Governance.sol is coming in Phase 3 (Weeks 9–12).
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
