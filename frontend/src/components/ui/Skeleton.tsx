import { cn } from '@/utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('rounded-lg shimmer', className)}
      aria-hidden="true"
      {...props}
    />
  );
}
