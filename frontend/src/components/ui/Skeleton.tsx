import { cn } from '@/utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-gradient-to-r from-bg-card via-bg-elevated to-bg-card bg-[length:200%_100%]',
        'animate-shimmer',
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
}
