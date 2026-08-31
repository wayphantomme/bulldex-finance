'use client';

import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { cn } from '@/utils/cn';

// ─── Token Terminal sparkline spec:
// Inline 60×24px trend chart in table cells
// Green if trend up, red if trend down
// No axes, no grid, no tooltip
// strokeWidth 1.5

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SparklineProps {
  data:       number[];
  width?:     number | string;
  height?:    number | string;
  positive?:  boolean;   // override color: true=green, false=red, undefined=auto-detect
  className?: string;
}

// ─── SparklineInline ──────────────────────────────────────────────────────────

export function SparklineInline({
  data,
  width = 60,
  height = 24,
  positive,
  className,
}: SparklineProps) {
  if (!data || data.length < 2) {
    return (
      <div
        className={cn('inline-flex items-center', className)}
        style={{ width, height }}
        aria-hidden="true"
      />
    );
  }

  // Auto-detect trend if not provided
  const isPositive = positive !== undefined
    ? positive
    : data[data.length - 1] >= data[0];

  const color = isPositive ? '#22c55e' : '#ef4444';

  const chartData = data.map((v, i) => ({ i, v }));

  return (
    <div
      className={cn('inline-flex items-center shrink-0', className)}
      style={{ width, height }}
      aria-hidden="true"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── ChartCard wrapper — Token Terminal chart card container ─────────────────

export interface ChartCardProps {
  title:        string;
  value?:       string;
  delta?:       number;
  subtitle?:    string;
  children:     React.ReactNode;
  controls?:    React.ReactNode;
  isLoading?:   boolean;
  className?:   string;
  onExpand?:    () => void;
}

export function ChartCard({
  title,
  value,
  delta,
  subtitle,
  children,
  controls,
  className,
  onExpand,
}: ChartCardProps) {
  const isPositive = (delta ?? 0) >= 0;

  return (
    <div
      className={cn(
        'rounded-lg bg-[#111111] border border-[#1e1e1e] p-4',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[13px] font-medium text-[#f5f5f5]">{title}</span>
            {value && (
              <span className="font-mono text-[13px] font-semibold text-[#f5f5f5] tabular-nums">
                {value}
              </span>
            )}
            {delta !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-mono font-medium tabular-nums',
                  isPositive
                    ? 'bg-[rgba(34,197,94,0.08)] text-[#22c55e]'
                    : 'bg-[rgba(239,68,68,0.08)] text-[#ef4444]',
                )}
              >
                {isPositive ? '↑' : '↓'}{Math.abs(delta).toFixed(1)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] text-[#525252] mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-1 shrink-0">
          {controls}
          {onExpand && (
            <button
              onClick={onExpand}
              className="flex h-6 w-6 items-center justify-center rounded border border-[#262626] text-[#525252] hover:border-[#2e2e2e] hover:text-[#a3a3a3] transition-colors"
              aria-label="Expand chart"
            >
              <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 2H2v2M14 2h2v2M4 14H2v-2M14 14h2v-2"/>
              </svg>
            </button>
          )}
          <button
            className="flex h-6 w-6 items-center justify-center rounded border border-[#262626] text-[#525252] hover:border-[#2e2e2e] hover:text-[#a3a3a3] transition-colors"
            aria-label="Chart settings"
          >
            <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="8" cy="8" r="1.5"/>
              <path strokeLinecap="round" d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.76 3.76l1.06 1.06M11.18 11.18l1.06 1.06M3.76 12.24l1.06-1.06M11.18 4.82l1.06-1.06"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Chart content */}
      {children}
    </div>
  );
}
