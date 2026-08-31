'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';

// ─── Token Terminal FilterBar spec:
// Horizontal filter pill row: [Group by Asset ▾] [Asset ▾] [Issuer ▾] [Chain ▾] [Add filter ⚡]
// Filter pills: border border-[#262626] bg-[#111111] text-[12px] rounded-md px-2.5 py-1
// Active filter: bg-[#064e3b] border-[#10b981] text-[#10b981]
// Dropdown menu: bg-[#161616] border-[#262626] rounded-lg shadow-xl
// Right side: checkbox toggles (Include bridged, Exclude micro caps)

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FilterOption {
  value:    string;
  label:    string;
  count?:   number;
}

export interface FilterConfig {
  id:          string;
  label:       string;
  options:     FilterOption[];
  value?:      string | string[];
  multi?:      boolean;
  onChange?:   (value: string | string[]) => void;
}

export interface ToggleConfig {
  id:       string;
  label:    string;
  value:    boolean;
  onChange: (v: boolean) => void;
}

export interface FilterBarProps {
  filters:    FilterConfig[];
  toggles?:   ToggleConfig[];
  onAddFilter?: () => void;
  className?: string;
}

// ─── Filter dropdown ──────────────────────────────────────────────────────────

function FilterDropdown({
  config,
  isOpen,
  onClose,
}: {
  config: FilterConfig;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');

  const filtered = config.options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );

  const selected = Array.isArray(config.value)
    ? config.value
    : config.value ? [config.value] : [];

  function toggle(val: string) {
    if (!config.onChange) return;
    if (config.multi) {
      const arr = Array.isArray(config.value) ? [...config.value] : config.value ? [config.value] : [];
      const next = arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
      config.onChange(next);
    } else {
      config.onChange(selected.includes(val) ? '' : val);
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 mt-1 z-50 min-w-[180px] rounded-lg border border-[#262626] bg-[#161616] shadow-xl">
      {/* Search */}
      {config.options.length > 6 && (
        <div className="border-b border-[#262626] px-3 py-2">
          <input
            autoFocus
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full bg-transparent text-[12px] text-[#f5f5f5] placeholder:text-[#525252] outline-none"
          />
        </div>
      )}
      {/* Options */}
      <div className="max-h-[240px] overflow-y-auto py-1">
        {filtered.length === 0 ? (
          <p className="px-3 py-2 text-[12px] text-[#525252]">No results</p>
        ) : (
          filtered.map((opt) => {
            const isSelected = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggle(opt.value)}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-1.5 text-[12px] transition-colors',
                  isSelected
                    ? 'text-[#f5f5f5] bg-[#1e1e1e]'
                    : 'text-[#a3a3a3] hover:bg-[#1e1e1e] hover:text-[#f5f5f5]',
                )}
              >
                <span className="flex items-center gap-2">
                  {config.multi && (
                    <span className={cn(
                      'h-3.5 w-3.5 rounded-sm border flex-shrink-0 flex items-center justify-center',
                      isSelected ? 'bg-[#10b981] border-[#10b981]' : 'border-[#404040]',
                    )}>
                      {isSelected && (
                        <svg className="h-2.5 w-2.5 text-[#0d0d0d]" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                          <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                  )}
                  {!config.multi && isSelected && (
                    <span className="text-[#10b981]">✓</span>
                  )}
                  {opt.label}
                </span>
                {opt.count !== undefined && (
                  <span className="text-[10px] text-[#525252] tabular-nums">{opt.count}</span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Filter pill button ───────────────────────────────────────────────────────

function FilterPill({ config }: { config: FilterConfig }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = Array.isArray(config.value)
    ? config.value
    : config.value ? [config.value] : [];
  const isActive = selected.length > 0;

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const displayLabel = isActive && selected.length === 1
    ? config.options.find((o) => o.value === selected[0])?.label ?? config.label
    : isActive && selected.length > 1
    ? `${config.label} (${selected.length})`
    : config.label;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1.5 h-7 rounded-md px-2.5 text-[12px] transition-colors border',
          isActive
            ? 'bg-[#064e3b] border-[#10b981] text-[#10b981]'
            : 'bg-[#111111] border-[#262626] text-[#a3a3a3] hover:border-[#2e2e2e] hover:text-[#f5f5f5]',
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {displayLabel}
        {isActive ? (
          <span
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              config.onChange?.('');
            }}
            className="text-[#10b981] hover:text-[#34d399]"
            aria-label={`Clear ${config.label} filter`}
          >
            <X className="h-3 w-3" />
          </span>
        ) : (
          <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
        )}
      </button>
      <FilterDropdown config={config} isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}

// ─── Toggle pill ──────────────────────────────────────────────────────────────

function TogglePill({ toggle }: { toggle: ToggleConfig }) {
  return (
    <label className="flex items-center gap-1.5 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={toggle.value}
        onChange={(e) => toggle.onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        className={cn(
          'flex h-4 w-4 items-center justify-center rounded-sm border transition-colors',
          toggle.value
            ? 'bg-[#10b981] border-[#10b981]'
            : 'border-[#404040] bg-transparent',
        )}
        aria-hidden="true"
      >
        {toggle.value && (
          <svg className="h-2.5 w-2.5 text-[#0d0d0d]" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      <span className="text-[12px] text-[#a3a3a3]">{toggle.label}</span>
    </label>
  );
}

// ─── FilterBar ────────────────────────────────────────────────────────────────

export function FilterBar({
  filters,
  toggles,
  onAddFilter,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 flex-wrap',
        className,
      )}
      role="toolbar"
      aria-label="Data filters"
    >
      {/* Filter pills */}
      {filters.map((filter) => (
        <FilterPill key={filter.id} config={filter} />
      ))}

      {/* Add filter */}
      {onAddFilter && (
        <button
          onClick={onAddFilter}
          className="flex items-center gap-1.5 h-7 rounded-md border border-[#262626] bg-[#111111] px-2.5 text-[12px] text-[#a3a3a3] hover:border-[#2e2e2e] hover:text-[#f5f5f5] transition-colors"
          aria-label="Add filter"
        >
          <SlidersHorizontal className="h-3 w-3" />
          Add filter
        </button>
      )}

      {/* Spacer */}
      {toggles && toggles.length > 0 && (
        <div className="flex-1" />
      )}

      {/* Toggle checkboxes — right aligned */}
      {toggles?.map((toggle) => (
        <TogglePill key={toggle.id} toggle={toggle} />
      ))}
    </div>
  );
}
