import { cn } from '@/utils/cn';

type CardVariant = 'default' | 'elevated' | 'bordered';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-bg-card border border-border hover:shadow-card transition-shadow duration-200',
  elevated: 'bg-bg-card shadow-elevated hover:shadow-card-hover transition-shadow duration-200',
  bordered: 'bg-transparent border border-border',
};

export function Card({ variant = 'default', className, children, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-card p-6', variantStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn('mb-4 flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  );
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h2 className={cn('text-h4 text-white', className)} {...props}>
      {children}
    </h2>
  );
}

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardBody({ className, children, ...props }: CardBodyProps) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div className={cn('mt-6 flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  );
}
