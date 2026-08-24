import { cn } from '@/utils/cn';

type BadgeVariant = 'purple' | 'amber' | 'success' | 'error' | 'warning' | 'muted';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  purple: 'bg-brand-purple/20 text-brand-purple-light border border-brand-purple/30',
  amber: 'bg-brand-amber/20 text-brand-amber border border-brand-amber/30',
  success: 'bg-success/20 text-success border border-success/30',
  error: 'bg-error/20 text-error border border-error/30',
  warning: 'bg-warning/20 text-warning border border-warning/30',
  muted: 'bg-bg-card text-text-muted border border-border',
};

const dotStyles: Record<BadgeVariant, string> = {
  purple: 'bg-brand-purple',
  amber: 'bg-brand-amber',
  success: 'bg-success',
  error: 'bg-error',
  warning: 'bg-warning',
  muted: 'bg-text-muted',
};

export function Badge({ variant = 'purple', dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-medium',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotStyles[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
