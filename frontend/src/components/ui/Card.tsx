import { cn } from '@/utils/cn';

type Variant = 'default' | 'glass' | 'elevated' | 'ghost' | 'brand';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:  Variant;
  noPadding?: boolean;
}

const variants: Record<Variant, string> = {
  default:  'bg-base-card border border-base-border',
  glass:    'glass',
  elevated: 'bg-base-card border border-base-border shadow-elevated',
  ghost:    'bg-transparent border border-base-border',
  brand:    'bg-base-card border border-brand-border shadow-glow-sm',
};

export function Card({ variant = 'default', noPadding, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-200',
        variants[variant],
        !noPadding && 'p-5',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 flex items-center justify-between', className)} {...props}>{children}</div>;
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-sm font-semibold text-ink', className)} {...props}>{children}</h2>;
}

export function CardBody({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-3', className)} {...props}>{children}</div>;
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-5 flex items-center justify-between gap-3', className)} {...props}>{children}</div>;
}
