import { cn } from '@/utils/cn';

// ─── Token Terminal badge spec:
// text-[11px] font-medium px-2 py-0.5 rounded-sm
// variants: positive (green), negative (red), warning (amber), brand (emerald),
//           ghost (neutral), new (emerald bright), featured (neutral outlined)

type Variant =
  | 'positive'   // price up, gain
  | 'negative'   // price down, loss
  | 'warning'    // caution, pending
  | 'info'       // informational
  | 'brand'      // brand/active
  | 'ghost'      // neutral/inactive
  | 'new'        // "New" feature highlight
  | 'featured'   // "Featured" content label
  | 'live'       // "Live" status
  | 'soon';      // "Coming soon"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  dot?:     boolean;
  size?:    'sm' | 'md';
}

const variants: Record<Variant, string> = {
  positive: 'bg-[rgba(34,197,94,0.08)]  text-[#22c55e]  border border-[rgba(34,197,94,0.15)]',
  negative: 'bg-[rgba(239,68,68,0.08)]  text-[#ef4444]  border border-[rgba(239,68,68,0.15)]',
  warning:  'bg-[rgba(245,158,11,0.08)] text-[#f59e0b]  border border-[rgba(245,158,11,0.15)]',
  info:     'bg-[rgba(59,130,246,0.08)] text-[#3b82f6]  border border-[rgba(59,130,246,0.15)]',
  brand:    'bg-[#064e3b]               text-[#10b981]  border border-[rgba(16,185,129,0.20)]',
  ghost:    'bg-[#1e1e1e]               text-[#a3a3a3]  border border-[#262626]',
  new:      'bg-[#064e3b]               text-[#10b981]  border-0',
  featured: 'bg-[#1e1e1e]               text-[#a3a3a3]  border border-[#2e2e2e] uppercase tracking-wider',
  live:     'bg-[rgba(34,197,94,0.08)]  text-[#22c55e]  border border-[rgba(34,197,94,0.15)] uppercase tracking-wider',
  soon:     'bg-[#1e1e1e]               text-[#525252]  border border-[#262626]',
};

const dotColors: Record<Variant, string> = {
  positive: 'bg-[#22c55e]',
  negative: 'bg-[#ef4444]',
  warning:  'bg-[#f59e0b]',
  info:     'bg-[#3b82f6]',
  brand:    'bg-[#10b981]',
  ghost:    'bg-[#525252]',
  new:      'bg-[#10b981]',
  featured: 'bg-[#a3a3a3]',
  live:     'bg-[#22c55e]',
  soon:     'bg-[#525252]',
};

export function Badge({
  variant = 'ghost',
  dot,
  size = 'sm',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm font-medium leading-none',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-[11px]',
        variants[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotColors[variant])}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}

// ─── Delta badge — for % change inline with numbers ─────────────────────────

interface DeltaBadgeProps {
  value: number;
  formatted?: string;
  className?: string;
}

export function DeltaBadge({ value, formatted, className }: DeltaBadgeProps) {
  const isPositive = value >= 0;
  const sign       = isPositive ? '+' : '';
  const display    = formatted ?? `${sign}${value.toFixed(2)}%`;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded px-1.5 py-0.5',
        'text-[11px] font-mono font-medium tabular-nums',
        isPositive
          ? 'bg-[rgba(34,197,94,0.08)] text-[#22c55e]'
          : 'bg-[rgba(239,68,68,0.08)] text-[#ef4444]',
        className,
      )}
      aria-label={`${isPositive ? 'Up' : 'Down'} ${Math.abs(value).toFixed(2)} percent`}
    >
      {isPositive ? '↑' : '↓'}
      {display}
    </span>
  );
}
