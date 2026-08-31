import { cn } from '@/utils/cn';

// ─── Token Terminal live dot spec:
// Animated dot w-1.5 h-1.5 rounded-full
// Colors: green=#10b981, yellow=#f59e0b, blue=#3b82f6, red=#ef4444, orange=#f97316
// animate-live-pulse (custom keyframe in tailwind config)

export type LiveDotColor = 'green' | 'yellow' | 'blue' | 'red' | 'orange';

const DOT_COLORS: Record<LiveDotColor, string> = {
  green:  'bg-[#10b981]',
  yellow: 'bg-[#f59e0b]',
  blue:   'bg-[#3b82f6]',
  red:    'bg-[#ef4444]',
  orange: 'bg-[#f97316]',
};

interface LiveDotProps {
  color?:     LiveDotColor;
  size?:      'sm' | 'md';
  animated?:  boolean;
  className?: string;
  label?:     string;   // accessible label
}

export function LiveDot({
  color = 'green',
  size = 'sm',
  animated = true,
  className,
  label,
}: LiveDotProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-full shrink-0',
        size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
        DOT_COLORS[color],
        animated && 'animate-live-pulse',
        className,
      )}
      aria-label={label}
      aria-hidden={!label}
      role={label ? 'img' : undefined}
    />
  );
}

// ─── Live status indicator — dot + label ─────────────────────────────────────

interface LiveStatusProps {
  label:      string;
  color?:     LiveDotColor;
  className?: string;
}

export function LiveStatus({ label, color = 'green', className }: LiveStatusProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <LiveDot color={color} animated />
      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#10b981]">
        {label}
      </span>
    </div>
  );
}
