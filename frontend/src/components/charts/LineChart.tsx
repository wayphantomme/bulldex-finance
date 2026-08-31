'use client';

import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { cn } from '@/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';
import { CHART_COLORS } from './AreaChart';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LineChartProps {
  data:          Record<string, unknown>[];
  series:        { key: string; label: string; color?: string; dashed?: boolean }[];
  xKey:          string;
  height?:       number;
  isLoading?:    boolean;
  showGrid?:     boolean;
  showLegend?:   boolean;
  showTooltip?:  boolean;
  formatX?:      (v: unknown) => string;
  formatY?:      (v: number) => string;
  formatTooltipValue?: (v: number, key: string) => string;
  referenceLines?: { y: number; label?: string; color?: string }[];
  className?:    string;
  watermark?:    string;
  dot?:          boolean;
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
  payload?: { name: string; value: number; color: string; strokeDasharray?: string }[];
  label?: string;
  formatValue?: (v: number, key: string) => string;
  formatLabel?: (v: unknown) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#262626] bg-[#1a1a1a] p-3 text-[12px] shadow-xl min-w-[150px]">
      <p className="text-[#525252] mb-2 text-[11px]">
        {formatLabel ? formatLabel(label) : label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: entry.color }} />
            <span className="text-[#a3a3a3] truncate max-w-[100px]">{entry.name}</span>
          </div>
          <span className="font-mono font-medium text-[#f5f5f5] tabular-nums ml-2">
            {formatValue ? formatValue(entry.value, entry.name) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── LineChart ────────────────────────────────────────────────────────────────

export function LineChart({
  data,
  series,
  xKey,
  height = 200,
  isLoading,
  showGrid = true,
  showLegend,
  showTooltip = true,
  formatX,
  formatY,
  formatTooltipValue,
  referenceLines,
  className,
  watermark = 'bulldex_',
  dot = false,
}: LineChartProps) {
  if (isLoading) {
    return <Skeleton className="w-full rounded-lg" style={{ height }} />;
  }

  return (
    <div className={cn('relative w-full', className)} style={{ height }}>
      <div className="chart-watermark" aria-hidden="true">{watermark}</div>

      <ResponsiveContainer width="100%" height="100%">
        <ReLineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
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
              if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
              if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
              return `${v}%`;
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
          {referenceLines?.map((rl, i) => (
            <ReferenceLine
              key={i}
              y={rl.y}
              stroke={rl.color ?? '#262626'}
              strokeDasharray="3 3"
              label={rl.label ? { value: rl.label, fontSize: 10, fill: '#525252' } : undefined}
            />
          ))}
          {series.map((s, i) => {
            const color = s.color ?? CHART_COLORS[i % CHART_COLORS.length];
            return (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={color}
                strokeWidth={1.5}
                strokeDasharray={s.dashed ? '4 2' : undefined}
                dot={dot ? { r: 2, fill: color, strokeWidth: 0 } : false}
                activeDot={{ r: 3, strokeWidth: 0, fill: color }}
              />
            );
          })}
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
}
