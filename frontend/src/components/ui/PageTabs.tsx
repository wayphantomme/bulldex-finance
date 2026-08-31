'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';

// ─── Token Terminal sub-navigation tabs spec:
// h-10 border-b border-[#262626]
// Active: border-b-2 border-[#f5f5f5] text-[#f5f5f5]
// Inactive: text-[#525252] hover:text-[#a3a3a3]
// Scrollable horizontal, no wrap
// Optional "New" badge per tab

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TabItem {
  label:    string;
  value?:   string;    // for controlled (non-link) tabs
  href?:    string;    // for link-based tabs
  badge?:   string;    // e.g. "New"
  disabled?: boolean;
}

// ─── Link-based tabs (uses router pathname) ───────────────────────────────────

export interface PageTabsLinkProps {
  tabs:      TabItem[];
  className?: string;
}

export function PageTabsLink({ tabs, className }: PageTabsLinkProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'flex items-end gap-0 border-b border-[#262626] overflow-x-auto no-scrollbar',
        className,
      )}
      aria-label="Page navigation"
    >
      {tabs.map((tab) => {
        if (!tab.href) return null;
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');

        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={cn(
              'relative flex items-center gap-1.5 h-10 px-4 text-[13px] whitespace-nowrap transition-colors shrink-0',
              'border-b-2',
              isActive
                ? 'border-[#f5f5f5] text-[#f5f5f5]'
                : 'border-transparent text-[#525252] hover:text-[#a3a3a3]',
              tab.disabled && 'pointer-events-none opacity-40',
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {tab.label}
            {tab.badge && (
              <span className="rounded bg-[#064e3b] px-1 py-0.5 text-[10px] font-medium text-[#10b981] leading-none">
                {tab.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

// ─── Controlled tabs (value-based, no routing) ───────────────────────────────

export interface PageTabsProps {
  tabs:       TabItem[];
  value:      string;
  onChange:   (value: string) => void;
  className?: string;
}

export function PageTabs({ tabs, value, onChange, className }: PageTabsProps) {
  return (
    <div
      className={cn(
        'flex items-end gap-0 border-b border-[#262626] overflow-x-auto no-scrollbar',
        className,
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const tabVal  = tab.value ?? tab.label.toLowerCase();
        const isActive = value === tabVal;

        return (
          <button
            key={tab.label}
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tabVal)}
            className={cn(
              'relative flex items-center gap-1.5 h-10 px-4 text-[13px] whitespace-nowrap transition-colors shrink-0',
              'border-b-2',
              isActive
                ? 'border-[#f5f5f5] text-[#f5f5f5]'
                : 'border-transparent text-[#525252] hover:text-[#a3a3a3]',
              tab.disabled && 'opacity-40 cursor-not-allowed',
            )}
          >
            {tab.label}
            {tab.badge && (
              <span className="rounded bg-[#064e3b] px-1 py-0.5 text-[10px] font-medium text-[#10b981] leading-none">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Compact tabs (smaller, for within-card navigation) ──────────────────────

export interface CompactTabsProps {
  tabs:       { label: string; value: string }[];
  value:      string;
  onChange:   (value: string) => void;
  className?: string;
}

export function CompactTabs({ tabs, value, onChange, className }: CompactTabsProps) {
  return (
    <div
      className={cn('flex items-center gap-0.5 rounded-md bg-[#1e1e1e] p-0.5', className)}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = value === tab.value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(
              'h-6 px-2.5 rounded-sm text-[11px] font-medium transition-colors',
              isActive
                ? 'bg-[#111111] text-[#f5f5f5]'
                : 'text-[#525252] hover:text-[#a3a3a3]',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
