'use client';

import { cn } from '@/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';

// ─── Token Terminal KPI Strip spec:
// Horizontal row of metric stats, border-b border-[#262626] py-4
// Each stat: label (text-[11px] text-[#525252]) + value (font-mono 20-28px) + delta badge
// Positive delta: bg-[#022c22] text-[#22c55e]
// Negative delta: bg-[#2c0202] text-[#ef4444]
// Dividers: border-r border-[#262626] between stats
// Optional sub-lines: 30d/90d change

// ─── Types ────────────────────────────────────────────────────────────────────

export interface KPIMetric {
  label:       string;
  value:       string;             // pre-formatted: "$44.7B", "3.4M", "17.92M"
  delta?:      number;             // raw % change (e.g. 0.7 = +0.7%)
  deltaLabel?: string;             // e.g. "30d" — replaces default label
  subLines?:   { label: string; value: string; delta?: number }[];
  tooltip?:    string;
}

export interface KPIStripProps {
  metrics:      KPIMetric[];
  isLoading?:   boolean;
  className?:   string;
  compact?:     boolean;           // smaller values for tighter layouts
}

// ─── Delta badge inline ───────────────────────────────────────────────────────

function InlineDelta({
  value,
  label,
  className,
}: {
  value: number;
  label?: string;
  className?: string;
}) {
  const isPos = value >= 0;
  const sign  = isPos ? '+' : '';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-mono font-medium tabular-nums',
        isPos
          ? 'bg-[rgba(34,197,94,0.08)] text-[#22c55e]'
          : 'bg-[rgba(239,68,68,0.08)] text-[#ef4444]',
        className,
      )}
      aria-label={`${label ? label + ' ' : ''}${isPos ? 'up' : 'down'} ${Math.abs(value).toFixed(1)} percent`}
    >
      {isPos ? '↑' : '↓'}
      {label && <span className="text-[10px] opacity-70 mr-0.5">{label}</span>}
      {sign}{Math.abs(value).toFixed(1)}%
    </span>
  );
}

// ─── Single KPI stat ──────────────────────────────────────────────────────────

function KPIStat({
  metric,
  compact,
  isLast,
  isLoading,
}: {
  metric: KPIMetric;
  compact?: boolean;
  isLast: boolean;
  isLoading?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 px-4 first:pl-0',
        !isLast && 'border-r border-[#262626] pr-4',
      )}
    >
      {/* Label */}
      <span className="text-[11px] text-[#525252] whitespace-nowrap">
        {metric.label}
      </span>

      {/* Value + delta */}
      <div className="flex items-baseline gap-2 flex-wrap">
        {isLoading ? (
          <Skeleton className="h-6 w-20 rounded" />
        ) : (
          <span
            className={cn(
              'font-mono font-semibold text-[#f5f5f5] tabular-nums leading-none',
              compact ? 'text-[18px]' : 'text-[22px]',
            )}
          >
            {metric.value}
          </span>
        )}
        {!isLoading && metric.delta !== undefined && (
          <InlineDelta
            value={metric.delta}
            label={metric.deltaLabel}
          />
        )}
      </div>

      {/* Sub-lines (30d / 90d change) */}
      {metric.subLines && !isLoading && (
        <div className="flex flex-col gap-0.5 mt-0.5">
          {metric.subLines.map((sub, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#525252] w-8 shrink-0">{sub.label}:</span>
              <span className={cn(
                'text-[10px] font-mono tabular-nums',
                sub.delta !== undefined
                  ? sub.delta >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'
                  : 'text-[#a3a3a3]',
              )}>
                {sub.delta !== undefined
                  ? `${sub.delta >= 0 ? '+' : ''}${sub.delta.toFixed(1)}%`
                  : sub.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── KPIStrip ─────────────────────────────────────────────────────────────────

export function KPIStrip({
  metrics,
  isLoading,
  className,
  compact,
}: KPIStripProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-0 border-b border-[#262626] py-3 overflow-x-auto no-scrollbar',
        className,
      )}
      role="region"
      aria-label="Key metrics"
    >
      {metrics.map((metric, i) => (
        <KPIStat
          key={metric.label}
          metric={metric}
          compact={compact}
          isLast={i === metrics.length - 1}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}

// ─── Compact stat card — for 2×2 corner grid (Agentic payments style) ────────

export interface StatGridItem {
  label: string;
  value: string;
}

export function StatGrid({
  stats,
  cols = 2,
  isLoading,
  className,
}: {
  stats: StatGridItem[];
  cols?: 2 | 4;
  isLoading?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid gap-3',
        cols === 2 ? 'grid-cols-2' : 'grid-cols-4',
        className,
      )}
    >
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col gap-0.5">
          <span className="text-[11px] text-[#525252] whitespace-nowrap">{stat.label}</span>
          {isLoading ? (
            <Skeleton className="h-5 w-16 rounded" />
          ) : (
            <span className="font-mono text-[15px] font-semibold text-[#f5f5f5] tabular-nums">
              {stat.value}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
