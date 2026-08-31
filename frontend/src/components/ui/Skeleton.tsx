import { cn } from '@/utils/cn';

// ─── Token Terminal skeleton spec:
// bg-[#1e1e1e] animate-pulse rounded
// No shimmer gradient — just solid pulse

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?:  string | number;
  height?: string | number;
}

export function Skeleton({ className, width, height, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded bg-[#1e1e1e]', className)}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...props}
    />
  );
}

// ─── Skeleton row — for table rows ───────────────────────────────────────────

export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-3 h-9 px-3 border-b border-[#1a1a1a]">
      <Skeleton className="h-4 w-4 rounded-full shrink-0" />
      <Skeleton className="h-3 w-24 rounded" />
      {Array.from({ length: cols - 2 }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3 rounded ml-auto"
          style={{ width: `${Math.random() * 40 + 40}px` }}
        />
      ))}
    </div>
  );
}

// ─── Skeleton card — for data cards ──────────────────────────────────────────

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-lg bg-[#111111] border border-[#1e1e1e] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-24 rounded" />
        <Skeleton className="h-3.5 w-12 rounded" />
      </div>
      <Skeleton className="h-7 w-32 rounded" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <Skeleton key={i} className="h-3 rounded" style={{ width: `${80 - i * 15}%` }} />
      ))}
    </div>
  );
}

// ─── Skeleton chart ───────────────────────────────────────────────────────────

export function SkeletonChart({ height = 200 }: { height?: number }) {
  return (
    <div
      className="rounded-lg bg-[#111111] border border-[#1e1e1e] p-4"
      style={{ height: height + 32 }}
    >
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-3.5 w-28 rounded" />
        <Skeleton className="h-3.5 w-16 rounded" />
      </div>
      <Skeleton className="w-full rounded" style={{ height }} />
    </div>
  );
}
