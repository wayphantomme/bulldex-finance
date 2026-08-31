'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { ChevronDown } from 'lucide-react';

// ─── Token Terminal timeframe spec:
// Tab variant: [1D] [1W] [1M] [3M] [6M] [1Y] [3Y] [All]
// Active: bg-[#1e1e1e] text-[#f5f5f5]
// Inactive: text-[#525252] hover:text-[#a3a3a3]
// Dropdown variant: [90d ▾] — compact, for chart header

// ─── Types ────────────────────────────────────────────────────────────────────

export type Timeframe =
  | '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '3Y' | 'All'
  | '7d' | '14d' | '30d' | '60d' | '90d' | '180d' | '365d';

export const TIMEFRAME_OPTIONS: { value: Timeframe; label: string }[] = [
  { value: '1D',   label: '1D'   },
  { value: '1W',   label: '1W'   },
  { value: '1M',   label: '1M'   },
  { value: '3M',   label: '3M'   },
  { value: '6M',   label: '6M'   },
  { value: '1Y',   label: '1Y'   },
  { value: '3Y',   label: '3Y'   },
  { value: 'All',  label: 'All'  },
];

export const TIMEFRAME_DROPDOWN_OPTIONS: { value: Timeframe; label: string }[] = [
  { value: '7d',   label: '7d'   },
  { value: '30d',  label: '30d'  },
  { value: '60d',  label: '60d'  },
  { value: '90d',  label: '90d'  },
  { value: '180d', label: '180d' },
  { value: '365d', label: '1y'   },
];

// ─── Tab-style timeframe selector ─────────────────────────────────────────────

export interface TimeframeSelectorProps {
  value:      Timeframe;
  onChange:   (v: Timeframe) => void;
  options?:   { value: Timeframe; label: string }[];
  className?: string;
}

export function TimeframeSelector({
  value,
  onChange,
  options = TIMEFRAME_OPTIONS,
  className,
}: TimeframeSelectorProps) {
  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      role="group"
      aria-label="Select timeframe"
    >
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'h-7 px-2.5 rounded-md text-[12px] font-medium transition-colors',
              isActive
                ? 'bg-[#1e1e1e] text-[#f5f5f5]'
                : 'text-[#525252] hover:text-[#a3a3a3]',
            )}
            aria-pressed={isActive}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Dropdown-style timeframe selector ───────────────────────────────────────

export interface TimeframeDropdownProps {
  value:      Timeframe;
  onChange:   (v: Timeframe) => void;
  options?:   { value: Timeframe; label: string }[];
  className?: string;
}

export function TimeframeDropdown({
  value,
  onChange,
  options = TIMEFRAME_DROPDOWN_OPTIONS,
  className,
}: TimeframeDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref  = useRef<HTMLDivElement>(null);

  const current = options.find((o) => o.value === value);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1 h-7 rounded-md border border-[#262626] bg-[#111111]',
          'px-2.5 text-[12px] text-[#a3a3a3] transition-colors',
          'hover:border-[#2e2e2e] hover:text-[#f5f5f5]',
          open && 'border-[#2e2e2e] text-[#f5f5f5]',
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Timeframe: ${current?.label ?? value}`}
      >
        {current?.label ?? value}
        <ChevronDown
          className={cn('h-3 w-3 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 z-50 min-w-[80px] rounded-lg border border-[#262626] bg-[#161616] shadow-xl py-1">
          {options.map((opt) => {
            const isActive = value === opt.value;
            return (
              <button
                key={opt.value}
                role="option"
                aria-selected={isActive}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={cn(
                  'flex w-full items-center px-3 py-1.5 text-[12px] transition-colors',
                  isActive
                    ? 'text-[#f5f5f5] bg-[#1e1e1e]'
                    : 'text-[#a3a3a3] hover:bg-[#1e1e1e] hover:text-[#f5f5f5]',
                )}
              >
                {isActive && (
                  <span className="text-[#10b981] mr-1.5">✓</span>
                )}
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Chart control row — combines timeframe + granularity + top N ─────────────
// Matches Token Terminal: [90d ▾] [Day ▾] [Top 10 ▾]

export interface ChartControlsProps {
  timeframe:        Timeframe;
  onTimeframeChange:(v: Timeframe) => void;
  granularity?:     string;
  onGranularityChange?: (v: string) => void;
  topN?:            number;
  onTopNChange?:    (v: number) => void;
  className?:       string;
}

const GRANULARITY_OPTIONS = ['Day', 'Week', 'Month'];
const TOP_N_OPTIONS = [5, 10, 25, 50];

export function ChartControls({
  timeframe,
  onTimeframeChange,
  granularity,
  onGranularityChange,
  topN,
  onTopNChange,
  className,
}: ChartControlsProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <TimeframeDropdown value={timeframe} onChange={onTimeframeChange} />
      {granularity !== undefined && onGranularityChange && (
        <SimpleDropdown
          value={granularity}
          options={GRANULARITY_OPTIONS}
          onChange={onGranularityChange}
        />
      )}
      {topN !== undefined && onTopNChange && (
        <SimpleDropdown
          value={`Top ${topN}`}
          options={TOP_N_OPTIONS.map(String)}
          onChange={(v) => onTopNChange(Number(v))}
          displayMap={(v) => `Top ${v}`}
        />
      )}
    </div>
  );
}

// ─── Simple string dropdown (internal) ───────────────────────────────────────

function SimpleDropdown({
  value,
  options,
  onChange,
  displayMap,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  displayMap?: (v: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const ref  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 h-7 rounded-md border border-[#262626] bg-[#111111] px-2.5 text-[12px] text-[#a3a3a3] hover:border-[#2e2e2e] hover:text-[#f5f5f5] transition-colors"
      >
        {displayMap ? displayMap(value) : value}
        <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 z-50 min-w-[80px] rounded-lg border border-[#262626] bg-[#161616] shadow-xl py-1">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={cn(
                'flex w-full items-center px-3 py-1.5 text-[12px] transition-colors',
                value === opt || (displayMap && displayMap(value) === displayMap(opt))
                  ? 'text-[#f5f5f5] bg-[#1e1e1e]'
                  : 'text-[#a3a3a3] hover:bg-[#1e1e1e] hover:text-[#f5f5f5]',
              )}
            >
              {displayMap ? displayMap(opt) : opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
