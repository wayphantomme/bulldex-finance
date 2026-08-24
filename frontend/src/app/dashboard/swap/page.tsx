import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function SwapPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-base font-semibold text-ink">Swap</h1>
        <p className="mt-0.5 text-xs text-ink-secondary">Exchange tokens at the best rate.</p>
      </div>

      <div className="flex justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Swap Tokens</CardTitle>
            <Badge variant="yellow">Week 2</Badge>
          </CardHeader>

          {/* You sell */}
          <div className="rounded-xl bg-base-surface p-4 space-y-2">
            <p className="text-xs text-ink-faint">You sell</p>
            <div className="flex items-center justify-between gap-3">
              <input
                type="number"
                placeholder="0.0"
                className="flex-1 bg-transparent text-2xl font-semibold text-ink placeholder:text-ink-faint focus:outline-none"
                disabled
              />
              <button className="flex items-center gap-1.5 rounded-lg border border-base-border bg-base-elevated px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-base-card">
                <span className="h-4 w-4 rounded-full bg-brand-faint ring-1 ring-green/30" />
                BDX
                <svg className="h-3 w-3 text-ink-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Swap arrow */}
          <div className="relative flex justify-center py-2">
            <div className="absolute inset-x-0 top-1/2 h-px bg-base-border" />
            <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-base-border bg-base-card text-ink-secondary transition-colors hover:border-green/25 hover:bg-base-elevated hover:text-green">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          {/* You receive */}
          <div className="mb-4 rounded-xl bg-base-surface p-4 space-y-2">
            <p className="text-xs text-ink-faint">You receive</p>
            <div className="flex items-center justify-between gap-3">
              <span className="text-2xl font-semibold text-ink-faint">0.0</span>
              <button className="flex items-center gap-1.5 rounded-lg border border-base-border bg-base-elevated px-3 py-1.5 text-xs font-semibold text-ink-secondary transition-colors hover:bg-base-card">
                Select token
                <svg className="h-3 w-3 text-ink-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Info row */}
          <div className="mb-4 flex items-center justify-between rounded-lg bg-base-surface px-3 py-2 text-xs text-ink-faint">
            <span>Price impact</span>
            <span className="text-green">—</span>
          </div>

          <Button fullWidth disabled variant="ghost">
            Pool.sol coming in Week 2
          </Button>
        </Card>
      </div>
    </div>
  );
}
