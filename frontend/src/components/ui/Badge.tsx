import { cn } from '@/utils/cn';

type Variant = 'green' | 'cream' | 'sage' | 'red' | 'yellow' | 'ghost';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  dot?:     boolean;
}

const variants: Record<Variant, string> = {
  green:  'bg-green/10 text-green border border-green/20',
  cream:  'bg-cream/10 text-cream border border-cream/20',
  sage:   'bg-brand-sage/20 text-brand-cream border border-brand-sage/30',
  red:    'bg-red/10 text-red border border-red/20',
  yellow: 'bg-yellow/10 text-yellow border border-yellow/20',
  ghost:  'bg-base-elevated text-ink-secondary border border-base-border',
};

const dots: Record<Variant, string> = {
  green:  'bg-green',
  cream:  'bg-cream',
  sage:   'bg-brand-sage',
  red:    'bg-red',
  yellow: 'bg-yellow',
  ghost:  'bg-ink-faint',
};

export function Badge({ variant = 'green', dot, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dots[variant])} aria-hidden />}
      {children}
    </span>
  );
}
