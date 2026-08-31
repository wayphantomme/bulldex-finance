'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { cn } from '@/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';
import { CHART_COLORS } from './AreaChart';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DonutSlice {
  name:    string;
  value:   number;
  color?:  string;
}

export interface DonutChartProps {
  data:            DonutSlice[];
  height?:         number;
  isLoading?:      boolean;
  // Center label
  centerLabel?:    string;
  centerValue?:    string;
  // Legend (right side table, Token Terminal style)
  showLegend?:     boolean;
  showTooltip?:    boolean;
  formatValue?:    (v: number, name: string) => string;
  innerRadius?:    number;  // as % of smallest dimension
  outerRadius?:    number;
  className?:      string;
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
  formatValue,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: DonutSlice }[];
  formatValue?: (v: number, name: string) => string;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg border border-[#262626] bg-[#1a1a1a] p-3 text-[12px] shadow-xl">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ background: entry.payload.color ?? '#10b981' }}
        />
        <span className="text-[#a3a3a3]">{entry.name}</span>
      </div>
      <p className="font-mono font-semibold text-[#f5f5f5] mt-1 tabular-nums">
        {formatValue ? formatValue(entry.value, entry.name) : entry.value}
      </p>
    </div>
  );
}

// ─── Legend table (right side) ────────────────────────────────────────────────

function LegendTable({
  data,
  total,
  formatValue,
}: {
  data: DonutSlice[];
  total: number;
  formatValue?: (v: number, name: string) => string;
}) {
  return (
    <div className="flex flex-col gap-1 min-w-[120px]">
      {data.slice(0, 10).map((entry, i) => {
        const color  = entry.color ?? CHART_COLORS[i % CHART_COLORS.length];
        const pct    = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0.0';
        const label  = formatValue ? formatValue(entry.value, entry.name) : String(entry.value);
        return (
          <div key={entry.name} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ background: color }}
                aria-hidden="true"
              />
              <span className="text-[11px] text-[#a3a3a3] truncate">{entry.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-mono text-[#f5f5f5] tabular-nums">{label}</span>
              <span className="text-[10px] text-[#525252] w-8 text-right tabular-nums">{pct}%</span>
            </div>
          </div>
        );
      })}
      {data.length > 10 && (
        <p className="text-[10px] text-[#525252] mt-1">+{data.length - 10} more</p>
      )}
    </div>
  );
}

// ─── DonutChart ───────────────────────────────────────────────────────────────

export function DonutChart({
  data,
  height = 200,
  isLoading,
  centerLabel,
  centerValue,
  showLegend = true,
  showTooltip = true,
  formatValue,
  innerRadius = 55,
  outerRadius = 80,
  className,
}: DonutChartProps) {
  if (isLoading) {
    return <Skeleton className="w-full rounded-lg" style={{ height }} />;
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const enriched = data.map((d, i) => ({
    ...d,
    color: d.color ?? CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <div
      className={cn('flex items-center gap-6', className)}
      style={{ height }}
    >
      {/* Donut */}
      <div className="relative shrink-0" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {showTooltip && (
              <Tooltip
                content={<CustomTooltip formatValue={formatValue} />}
              />
            )}
            <Pie
              data={enriched}
              cx="50%"
              cy="50%"
              innerRadius={`${innerRadius}%`}
              outerRadius={`${outerRadius}%`}
              dataKey="value"
              strokeWidth={0}
              paddingAngle={0.5}
            >
              {enriched.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            {centerValue && (
              <span className="font-mono text-[15px] font-semibold text-[#f5f5f5] tabular-nums leading-tight">
                {centerValue}
              </span>
            )}
            {centerLabel && (
              <span className="text-[10px] text-[#525252] mt-0.5 text-center px-2">
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Legend table */}
      {showLegend && (
        <div className="flex-1 overflow-hidden">
          <LegendTable data={enriched} total={total} formatValue={formatValue} />
        </div>
      )}
    </div>
  );
}
