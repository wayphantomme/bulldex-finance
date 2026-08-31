import { cn } from '@/utils/cn';

// ─── Token Terminal card spec:
// bg-[#111111], border border-[#1e1e1e], rounded-lg (8px), p-4
// hover: border-[#2e2e2e]
// NO box-shadow, NO glass, NO gradient

type Variant = 'default' | 'elevated' | 'ghost' | 'brand';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:  Variant;
  noPadding?: boolean;
  hoverable?: boolean;
}

const variants: Record<Variant, string> = {
  // Default — standard TT data card
  default:  'bg-[#111111] border border-[#1e1e1e]',
  // Elevated — slightly lighter, for nested cards
  elevated: 'bg-[#161616] border border-[#262626]',
  // Ghost — border only, transparent bg
  ghost:    'bg-transparent border border-[#262626]',
  // Brand — active/selected state card
  brand:    'bg-[#111111] border border-[#064e3b]',
};

export function Card({
  variant = 'default',
  noPadding,
  hoverable,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg transition-colors duration-100',
        variants[variant],
        !noPadding && 'p-4',
        hoverable && 'hover:border-[#2e2e2e] cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mb-3 flex items-center justify-between gap-2', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-[13px] font-medium text-[#f5f5f5]', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardSubtitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-[11px] text-[#525252]', className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardBody({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-4 flex items-center justify-between gap-2', className)}
      {...props}
    >
      {children}
    </div>
  );
}
