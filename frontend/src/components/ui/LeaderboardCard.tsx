'use client';

import Link from 'next/link';
import { cn } from '@/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';
import { SparklineInline } from '@/components/charts/SparklineInline';

// ─── Token Terminal LeaderboardCard spec:
// 3 cards dalam satu baris, gap-4
// Card: bg-[#111111] border border-[#1e1e1e] rounded-lg p-4
// Header: category title + "View all →" link + big stat + sparkline
// Two sub-sections: "Market leaders" (30d) + "Weekly movers" (7d)
// Rank number: text-[#525252] w-5
// Protocol logo: circle 16px
// Name + ticker, value right, delta color-coded

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank:      number;
  name:      string;
  ticker?:   string;
  logo?:     string;
  value:     string;   // pre-formatted: "$438.6M"
  delta?:    number;   // raw % change
  trend?:    'up' | 'down' | 'neutral';
}

export interface LeaderboardSection {
  title:     string;          // e.g. "Market leaders"
  subLabel:  string;          // e.g. "Latest (30d change)"
  entries:   LeaderboardEntry[];
}

export interface LeaderboardCardProps {
  category:    string;         // e.g. "Fees", "Total value locked"
  viewAllHref?: string;
  bigValue?:   string;         // e.g. "1.54 B"
  bigDelta?:   number;
  bigLabel?:   string;         // e.g. "30d sum"
  sparkline?:  number[];
  sections:    LeaderboardSection[];
  isLoading?:  boolean;
  className?:  string;
}

// ─── Protocol logo ────────────────────────────────────────────────────────────

function ProtocolLogo({ logo, name }: { logo?: string; name: string }) {
  return (
    <div className="h-4 w-4 shrink-0 rounded-full overflow-hidden bg-[#1e1e1e] flex items-center justify-center">
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="text-[8px] font-bold text-[#525252] leading-none">
          {name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
}

// ─── Leaderboard row ──────────────────────────────────────────────────────────

function LeaderRow({ entry }: { entry: LeaderboardEntry }) {
  const isPos = (entry.delta ?? 0) >= 0;

  return (
    <div className="flex items-center gap-2 py-1">
      {/* Rank */}
      <span className="w-4 shrink-0 text-[11px] text-[#525252] tabular-nums text-right">
        {entry.rank}
      </span>

      {/* Logo */}
      <ProtocolLogo logo={entry.logo} name={entry.name} />

      {/* Name */}
      <div className="flex-1 min-w-0">
        <span className="text-[12px] text-[#f5f5f5] truncate block">
          {entry.name}
          {entry.ticker && (
            <span className="ml-1 text-[10px] text-[#525252]">{entry.ticker}</span>
          )}
        </span>
      </div>

      {/* Value */}
      <span className="text-[12px] font-mono text-[#f5f5f5] tabular-nums shrink-0">
        {entry.value}
      </span>

      {/* Delta */}
      {entry.delta !== undefined && (
        <span
          className={cn(
            'text-[11px] font-mono tabular-nums shrink-0 w-12 text-right',
            isPos ? 'text-[#22c55e]' : 'text-[#ef4444]',
          )}
        >
          {isPos ? '+' : ''}{entry.delta.toFixed(1)}%
        </span>
      )}
    </div>
  );
}

// ─── LeaderboardCard ──────────────────────────────────────────────────────────

export function LeaderboardCard({
  category,
  viewAllHref,
  bigValue,
  bigDelta,
  bigLabel,
  sparkline,
  sections,
  isLoading,
  className,
}: LeaderboardCardProps) {
  const isPos = (bigDelta ?? 0) >= 0;

  return (
    <div
      className={cn(
        'rounded-lg bg-[#111111] border border-[#1e1e1e] p-4 flex flex-col gap-3',
        className,
      )}
    >
      {/* Card header */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-[#f5f5f5]">{category}</span>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-[11px] text-[#10b981] hover:text-[#34d399] transition-colors whitespace-nowrap"
          >
            View all →
          </Link>
        )}
      </div>

      {/* Big stat */}
      {(bigValue || isLoading) && (
        <div>
          <div className="flex items-baseline gap-2">
            {isLoading ? (
              <Skeleton className="h-7 w-24 rounded" />
            ) : (
              <span className="font-mono text-[24px] font-semibold text-[#f5f5f5] tabular-nums leading-none">
                {bigValue}
              </span>
            )}
            {!isLoading && bigDelta !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-mono font-medium tabular-nums',
                  isPos
                    ? 'bg-[rgba(34,197,94,0.08)] text-[#22c55e]'
                    : 'bg-[rgba(239,68,68,0.08)] text-[#ef4444]',
                )}
              >
                {isPos ? '↑' : '↓'}{Math.abs(bigDelta).toFixed(1)}%
              </span>
            )}
          </div>
          {bigLabel && (
            <p className="text-[11px] text-[#525252] mt-0.5">{bigLabel}</p>
          )}
          {/* Sparkline */}
          {sparkline && sparkline.length > 1 && !isLoading && (
            <div className="mt-2">
              <SparklineInline
                data={sparkline}
                width="100%"
                height={32}
                positive={isPos}
                className="w-full"
              />
            </div>
          )}
        </div>
      )}

      {/* Sections */}
      {sections.map((section, si) => (
        <div key={si}>
          {/* Section header */}
          <div className="flex items-center justify-between mb-1 border-t border-[#1a1a1a] pt-2">
            <span className="text-[11px] text-[#525252]">{section.title}</span>
            <span className="text-[10px] text-[#525252]">{section.subLabel}</span>
          </div>

          {/* Entries */}
          <div className="flex flex-col">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 py-1">
                    <Skeleton className="h-3 w-3 rounded" />
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 flex-1 rounded" />
                    <Skeleton className="h-3 w-14 rounded" />
                    <Skeleton className="h-3 w-10 rounded" />
                  </div>
                ))
              : section.entries.map((entry) => (
                  <LeaderRow key={entry.rank} entry={entry} />
                ))
            }
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── LeaderboardGrid — 3-col layout ──────────────────────────────────────────

export function LeaderboardGrid({
  cards,
  isLoading,
}: {
  cards: LeaderboardCardProps[];
  isLoading?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, i) => (
        <LeaderboardCard key={i} {...card} isLoading={isLoading} />
      ))}
    </div>
  );
}
