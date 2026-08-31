'use client';

import {
  AreaChart as ReAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { cn } from '@/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';

// ─── Token Terminal chart palette ─────────────────────────────────────────────
export const CHART_COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#a78bfa', // purple-light
  '#34d399', // emerald-light
];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChartSeries {
  key:    string;
  label:  string;
  color?: string;
}

export interface AreaChartProps {
  data:        Record<string, unknown>[];
  series:      ChartSeries[];
  xKey:        string;
  height?:     number;
  isLoading?:  boolean;
  stacked?:    boolean;
  showGrid?:   boolean;
  showLegend?: boolean;
  showTooltip?:boolean;
  formatX?:    (v: unknown) => string;
  formatY?:    (v: number) => string;
  formatTooltipValue?: (v: number, key: string) => string;
  className?:  string;
  watermark?:  string;
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
  label,
  formatValue,
  formatLabel,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  formatValue?: (v: number, key: string) => string;
  formatLabel?: (v: unknown) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#262626] bg-[#1a1a1a] p-3 text-[12px] shadow-xl min-w-[140px]">
      <p className="text-[#525252] mb-2 text-[11px]">
        {formatLabel ? formatLabel(label) : label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: entry.color }} />
            <span className="text-[#a3a3a3]">{entry.name}</span>
          </div>
          <span className="font-mono font-medium text-[#f5f5f5] tabular-nums">
            {formatValue ? formatValue(entry.value, entry.name) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── AreaChart ────────────────────────────────────────────────────────────────

export function AreaChart({
  data,
  series,
  xKey,
  height = 200,
  isLoading,
  stacked,
  showGrid = true,
  showLegend,
  showTooltip = true,
  formatX,
  formatY,
  formatTooltipValue,
  className,
  watermark = 'bulldex_',
}: AreaChartProps) {
  if (isLoading) {
    return <Skeleton className="w-full rounded-lg" style={{ height }} />;
  }

  return (
    <div className={cn('relative w-full', className)} style={{ height }}>
      {/* Watermark */}
      <div className="chart-watermark" aria-hidden="true">{watermark}</div>

      <ResponsiveContainer width="100%" height="100%">
        <ReAreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="0"
              stroke="#1e1e1e"
              vertical={false}
            />
          )}
          <XAxis
            dataKey={xKey}
            tickFormatter={formatX}
            tick={{ fontSize: 11, fill: '#525252', fontFamily: 'Inter, sans-serif' }}
            tickLine={false}
            axisLine={false}
            dy={6}
          />
          <YAxis
            tickFormatter={formatY ?? ((v) => {
              if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
              if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
              if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
              return String(v);
            })}
            tick={{ fontSize: 11, fill: '#525252', fontFamily: 'Inter, sans-serif' }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          {showTooltip && (
            <Tooltip
              content={<CustomTooltip formatValue={formatTooltipValue} formatLabel={formatX} />}
              cursor={{ stroke: '#262626', strokeWidth: 1 }}
            />
          )}
          {showLegend && (
            <Legend
              iconType="circle"
              iconSize={6}
              wrapperStyle={{ fontSize: '11px', color: '#a3a3a3', paddingTop: '8px' }}
            />
          )}
          {series.map((s, i) => {
            const color = s.color ?? CHART_COLORS[i % CHART_COLORS.length];
            return (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={color}
                strokeWidth={1.5}
                fill={color}
                fillOpacity={stacked ? 0.7 : 0.1}
                stackId={stacked ? 'stack' : undefined}
                dot={false}
                activeDot={{ r: 3, strokeWidth: 0, fill: color }}
              />
            );
          })}
        </ReAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
