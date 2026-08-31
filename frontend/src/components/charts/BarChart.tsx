'use client';

import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { cn } from '@/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';
import { CHART_COLORS } from './AreaChart';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BarChartProps {
  data:         Record<string, unknown>[];
  series:       { key: string; label: string; color?: string }[];
  xKey:         string;
  height?:      number;
  isLoading?:   boolean;
  stacked?:     boolean;
  horizontal?:  boolean;
  showGrid?:    boolean;
  showLegend?:  boolean;
  showTooltip?: boolean;
  formatX?:     (v: unknown) => string;
  formatY?:     (v: number) => string;
  formatTooltipValue?: (v: number, key: string) => string;
  barSize?:     number;
  className?:   string;
  watermark?:   string;
  // Single series: color cells by positive/negative value
  colorByValue?: boolean;
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
            <span className="h-2 w-2 rounded-sm shrink-0" style={{ background: entry.color }} />
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

// ─── BarChart ─────────────────────────────────────────────────────────────────

export function BarChart({
  data,
  series,
  xKey,
  height = 200,
  isLoading,
  stacked,
  horizontal,
  showGrid = true,
  showLegend,
  showTooltip = true,
  formatX,
  formatY,
  formatTooltipValue,
  barSize = 8,
  className,
  watermark = 'bulldex_',
  colorByValue,
}: BarChartProps) {
  if (isLoading) {
    return <Skeleton className="w-full rounded-lg" style={{ height }} />;
  }

  const layout = horizontal ? 'vertical' : 'horizontal';

  return (
    <div className={cn('relative w-full', className)} style={{ height }}>
      <div className="chart-watermark" aria-hidden="true">{watermark}</div>

      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart
          data={data}
          layout={layout}
          margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          barCategoryGap="20%"
          barGap={2}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="0"
              stroke="#1e1e1e"
              vertical={false}
            />
          )}
          {layout === 'horizontal' ? (
            <>
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
            </>
          ) : (
            <>
              <XAxis
                type="number"
                tickFormatter={formatY}
                tick={{ fontSize: 11, fill: '#525252', fontFamily: 'Inter, sans-serif' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey={xKey}
                tick={{ fontSize: 11, fill: '#525252', fontFamily: 'Inter, sans-serif' }}
                tickLine={false}
                axisLine={false}
                width={80}
              />
            </>
          )}
          {showTooltip && (
            <Tooltip
              content={<CustomTooltip formatValue={formatTooltipValue} formatLabel={formatX} />}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
          )}
          {showLegend && (
            <Legend
              iconType="square"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', color: '#a3a3a3', paddingTop: '8px' }}
            />
          )}
          {series.map((s, i) => {
            const color = s.color ?? CHART_COLORS[i % CHART_COLORS.length];
            return (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label}
                fill={color}
                stackId={stacked ? 'stack' : undefined}
                radius={stacked ? [0, 0, 0, 0] : [2, 2, 0, 0]}
                maxBarSize={barSize * 6}
                barSize={barSize}
              >
                {colorByValue && series.length === 1 &&
                  data.map((entry, idx) => {
                    const val = Number(entry[s.key]);
                    return (
                      <Cell
                        key={idx}
                        fill={val >= 0 ? '#22c55e' : '#ef4444'}
                      />
                    );
                  })
                }
              </Bar>
            );
          })}
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}
