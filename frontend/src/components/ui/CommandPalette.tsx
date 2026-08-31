'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';
import { Search, ArrowRight, BarChart2, Repeat2, Droplets, Landmark, ShieldCheck, Sprout, Timer, TrendingUp } from 'lucide-react';

// ─── Token Terminal CommandPalette spec:
// Triggered by ⌘K or Ctrl+K
// Modal: w-[600px] bg-[#111111] border border-[#262626] rounded-xl
// Input: text-[14px] placeholder text-[#525252]
// Popular searches: chip row below input
// Result item: logo/icon 20px + name + category + metric preview
// ESC to close

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaletteResult {
  id:       string;
  label:    string;
  sublabel?: string;
  category: string;
  href:     string;
  icon?:    React.ReactNode;
  shortcut?: string;
}

export interface CommandPaletteProps {
  open:     boolean;
  onClose:  () => void;
  /** Additional results to search over (e.g. from live data) */
  extraResults?: PaletteResult[];
}

// ─── Static navigation results ────────────────────────────────────────────────

const STATIC_RESULTS: PaletteResult[] = [
  { id: 'overview',   label: 'Overview',    sublabel: 'Dashboard home',      category: 'Pages',    href: '/dashboard',            icon: <BarChart2 className="h-4 w-4" /> },
  { id: 'swap',       label: 'Swap',        sublabel: 'Trade tokens',        category: 'Pages',    href: '/dashboard/swap',       icon: <Repeat2 className="h-4 w-4" /> },
  { id: 'liquidity',  label: 'Liquidity',   sublabel: 'Provide & earn',      category: 'Pages',    href: '/dashboard/liquidity',  icon: <Droplets className="h-4 w-4" /> },
  { id: 'lending',    label: 'Lend',        sublabel: 'Borrow & supply',     category: 'Pages',    href: '/dashboard/lending',    icon: <Landmark className="h-4 w-4" /> },
  { id: 'staking',    label: 'Stake',       sublabel: 'Earn BDX rewards',    category: 'Pages',    href: '/dashboard/staking',    icon: <ShieldCheck className="h-4 w-4" /> },
  { id: 'farming',    label: 'Farm',        sublabel: 'Yield on LP tokens',  category: 'Pages',    href: '/dashboard/farming',    icon: <Sprout className="h-4 w-4" /> },
  { id: 'vesting',    label: 'Vesting',     sublabel: 'Token schedules',     category: 'Pages',    href: '/dashboard/vesting',    icon: <Timer className="h-4 w-4" /> },
  { id: 'analytics',  label: 'Analytics',   sublabel: 'Protocol metrics',    category: 'Pages',    href: '/dashboard/analytics',  icon: <TrendingUp className="h-4 w-4" /> },
];

const POPULAR = ['BDX/MUSDC pool', 'Staking APR', 'Total TVL', 'Swap volume', 'Lending rates'];

// ─── CommandPalette ───────────────────────────────────────────────────────────

export function CommandPalette({ open, onClose, extraResults = [] }: CommandPaletteProps) {
  const router   = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query,       setQuery]       = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const allResults = [...STATIC_RESULTS, ...extraResults];

  // Filter results
  const results: PaletteResult[] = query.trim() === ''
    ? STATIC_RESULTS.slice(0, 6)
    : allResults.filter((r) =>
        r.label.toLowerCase().includes(query.toLowerCase()) ||
        r.sublabel?.toLowerCase().includes(query.toLowerCase()) ||
        r.category.toLowerCase().includes(query.toLowerCase()),
      ).slice(0, 8);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      router.push(results[activeIndex].href);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [results, activeIndex, router, onClose]);

  if (!open) return null;

  // Group results by category
  const grouped = results.reduce<Record<string, PaletteResult[]>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {});

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center pt-[15vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0d0d0d]/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-[600px] rounded-xl border border-[#262626] bg-[#111111] shadow-xl overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Input row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#262626]">
          <Search className="h-4 w-4 text-[#525252] shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
            placeholder="Search pages, pools, metrics..."
            className="flex-1 bg-transparent text-[14px] text-[#f5f5f5] placeholder:text-[#525252] outline-none"
            aria-label="Search"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="palette-results"
            aria-activedescendant={results[activeIndex] ? `palette-item-${results[activeIndex].id}` : undefined}
          />
          <button
            onClick={onClose}
            className="rounded bg-[#1e1e1e] px-1.5 py-0.5 text-[11px] text-[#525252] font-mono hover:text-[#a3a3a3] transition-colors"
            aria-label="Close"
          >
            ESC
          </button>
        </div>

        {/* Popular searches (when query is empty) */}
        {query === '' && (
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1a1a1a] overflow-x-auto no-scrollbar">
            <span className="text-[11px] text-[#525252] shrink-0">Popular:</span>
            {POPULAR.map((q) => (
              <button
                key={q}
                onClick={() => setQuery(q)}
                className="shrink-0 rounded-full border border-[#262626] px-2.5 py-0.5 text-[11px] text-[#a3a3a3] hover:border-[#2e2e2e] hover:text-[#f5f5f5] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        <div
          id="palette-results"
          role="listbox"
          className="max-h-[360px] overflow-y-auto"
        >
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Search className="h-6 w-6 text-[#262626]" aria-hidden="true" />
              <p className="text-[13px] text-[#525252]">No results for &ldquo;{query}&rdquo;</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                {/* Category label */}
                <div className="px-4 py-1.5 border-t border-[#1a1a1a] first:border-0">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[#525252]">
                    {category}
                  </span>
                </div>
                {/* Items */}
                {items.map((item) => {
                  const flatIdx = results.indexOf(item);
                  const isActive = flatIdx === activeIndex;
                  return (
                    <button
                      key={item.id}
                      id={`palette-item-${item.id}`}
                      role="option"
                      aria-selected={isActive}
                      onClick={() => { router.push(item.href); onClose(); }}
                      onMouseEnter={() => setActiveIndex(flatIdx)}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        isActive ? 'bg-[#161616]' : 'hover:bg-[#161616]',
                      )}
                    >
                      {/* Icon */}
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#262626] bg-[#1e1e1e] text-[#a3a3a3]">
                        {item.icon ?? <ArrowRight className="h-4 w-4" />}
                      </div>
                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[#f5f5f5] truncate">{item.label}</p>
                        {item.sublabel && (
                          <p className="text-[11px] text-[#525252] truncate">{item.sublabel}</p>
                        )}
                      </div>
                      {/* Shortcut */}
                      {item.shortcut && (
                        <span className="text-[10px] text-[#525252] font-mono shrink-0">{item.shortcut}</span>
                      )}
                      {isActive && (
                        <ArrowRight className="h-3.5 w-3.5 text-[#525252] shrink-0" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 border-t border-[#1a1a1a] px-4 py-2">
          <span className="flex items-center gap-1 text-[10px] text-[#525252]">
            <kbd className="rounded bg-[#1e1e1e] px-1 py-0.5 font-mono text-[#525252]">↑↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1 text-[10px] text-[#525252]">
            <kbd className="rounded bg-[#1e1e1e] px-1 py-0.5 font-mono text-[#525252]">↵</kbd>
            open
          </span>
          <span className="flex items-center gap-1 text-[10px] text-[#525252]">
            <kbd className="rounded bg-[#1e1e1e] px-1 py-0.5 font-mono text-[#525252]">ESC</kbd>
            close
          </span>
        </div>
      </div>
    </div>
  );
}
