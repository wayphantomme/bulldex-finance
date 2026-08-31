'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { Skeleton, SkeletonRow } from '@/components/ui/Skeleton';

// ─── Token Terminal DataTable spec:
// Row height h-9 (36px), dense
// Header: text-[11px] text-[#525252] font-medium sticky top
// Row border-b border-[#1a1a1a], hover bg-[#161616]
// Number cells: right-aligned font-mono
// Positive: text-[#22c55e], Negative: text-[#ef4444]
// Sticky first column (#  + logo+name)
// Sortable headers with ↑↓ indicator
// Sparkline inline 60×24px

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortDir = 'asc' | 'desc' | null;

export interface ColumnDef<T = Record<string, unknown>> {
  id:         string;
  header:     string;
  accessor?:  keyof T | ((row: T) => unknown);
  cell?:      (value: unknown, row: T, idx: number) => React.ReactNode;
  sortable?:  boolean;
  align?:     'left' | 'right' | 'center';
  width?:     string;      // e.g. "120px", "10%"
  minWidth?:  string;
  sticky?:    boolean;     // sticky left (first col)
  hidden?:    boolean;
}

export interface DataTableProps<T = Record<string, unknown>> {
  columns:       ColumnDef<T>[];
  data:          T[];
  isLoading?:    boolean;
  skeletonRows?: number;
  keyExtractor?: (row: T, idx: number) => string;
  onRowClick?:   (row: T) => void;
  // Pagination / infinite scroll
  hasMore?:      boolean;
  onLoadMore?:   () => void;
  isLoadingMore?:boolean;
  // Empty state
  emptyTitle?:   string;
  emptyDesc?:    string;
  // Styling
  className?:    string;
  rowClassName?: (row: T, idx: number) => string | undefined;
  // Controlled sort
  sortKey?:      string;
  sortDir?:      SortDir;
  onSort?:       (key: string, dir: SortDir) => void;
  // Row numbering
  showRowNumbers?: boolean;
}

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ dir }: { dir: SortDir }) {
  return (
    <span className="inline-flex flex-col gap-[1px] ml-1 shrink-0" aria-hidden="true">
      <span className={cn('block w-0 h-0 border-x-[3px] border-x-transparent border-b-[4px]',
        dir === 'asc' ? 'border-b-[#f5f5f5]' : 'border-b-[#404040]')} />
      <span className={cn('block w-0 h-0 border-x-[3px] border-x-transparent border-t-[4px]',
        dir === 'desc' ? 'border-t-[#f5f5f5]' : 'border-t-[#404040]')} />
    </span>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ title = 'No data', desc }: { title?: string; desc?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-2">
      <svg className="h-8 w-8 text-[#262626]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
      </svg>
      <p className="text-[13px] text-[#a3a3a3]">{title}</p>
      {desc && <p className="text-[12px] text-[#525252]">{desc}</p>}
    </div>
  );
}

// ─── Load more sentinel ───────────────────────────────────────────────────────

function LoadMoreRow({ isLoading, onLoadMore }: { isLoading: boolean; onLoadMore?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onLoadMore) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !isLoading) onLoadMore(); },
      { rootMargin: '100px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onLoadMore, isLoading]);

  return (
    <div ref={ref} className="flex items-center justify-center py-4 gap-2">
      {isLoading && (
        <>
          <svg className="h-3.5 w-3.5 animate-spin text-[#525252]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-[12px] text-[#525252]">Loading more assets...</span>
        </>
      )}
    </div>
  );
}

// ─── DataTable ────────────────────────────────────────────────────────────────

export function DataTable<T = Record<string, unknown>>({
  columns,
  data,
  isLoading,
  skeletonRows = 10,
  keyExtractor,
  onRowClick,
  hasMore,
  onLoadMore,
  isLoadingMore,
  emptyTitle,
  emptyDesc,
  className,
  rowClassName,
  sortKey: controlledSortKey,
  sortDir: controlledSortDir,
  onSort,
  showRowNumbers = true,
}: DataTableProps<T>) {
  // Internal sort state (uncontrolled mode)
  const [internalSortKey, setInternalSortKey] = useState<string | null>(null);
  const [internalSortDir, setInternalSortDir] = useState<SortDir>(null);

  const sortKey = controlledSortKey ?? internalSortKey;
  const sortDir = controlledSortDir !== undefined ? controlledSortDir : internalSortDir;

  const visibleColumns = columns.filter((c) => !c.hidden);

  // Handle sort click
  const handleSort = useCallback((colId: string) => {
    let nextDir: SortDir = 'desc';
    if (sortKey === colId) {
      nextDir = sortDir === 'desc' ? 'asc' : sortDir === 'asc' ? null : 'desc';
    }
    if (onSort) {
      onSort(colId, nextDir);
    } else {
      setInternalSortKey(nextDir === null ? null : colId);
      setInternalSortDir(nextDir);
    }
  }, [sortKey, sortDir, onSort]);

  // Internal client-side sort (when no onSort provided)
  const sortedData = useMemo(() => {
    if (onSort || !sortKey || !sortDir) return data;
    const col = columns.find((c) => c.id === sortKey);
    if (!col) return data;
    return [...data].sort((a, b) => {
      const va = col.accessor
        ? typeof col.accessor === 'function' ? col.accessor(a) : a[col.accessor]
        : null;
      const vb = col.accessor
        ? typeof col.accessor === 'function' ? col.accessor(b) : b[col.accessor]
        : null;
      if (va === null || va === undefined) return 1;
      if (vb === null || vb === undefined) return -1;
      const cmp = typeof va === 'number' && typeof vb === 'number'
        ? va - vb
        : String(va).localeCompare(String(vb));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir, onSort, columns]);

  // Get cell value
  function getCellValue(col: ColumnDef<T>, row: T): unknown {
    if (!col.accessor) return undefined;
    if (typeof col.accessor === 'function') return col.accessor(row);
    return row[col.accessor];
  }

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table
        className="w-full border-collapse"
        role="table"
        aria-busy={isLoading}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <thead>
          <tr className="border-b border-[#1e1e1e]">
            {showRowNumbers && (
              <th
                scope="col"
                className="sticky left-0 z-10 w-10 bg-[#0d0d0d] px-3 py-2 text-left text-[11px] font-medium text-[#525252] select-none"
              >
                #
              </th>
            )}
            {visibleColumns.map((col) => (
              <th
                key={col.id}
                scope="col"
                style={{ width: col.width, minWidth: col.minWidth }}
                className={cn(
                  'px-3 py-2 text-[11px] font-medium text-[#525252] select-none whitespace-nowrap',
                  col.align === 'right'  ? 'text-right'  : '',
                  col.align === 'center' ? 'text-center' : 'text-left',
                  col.sortable && 'cursor-pointer hover:text-[#a3a3a3] transition-colors',
                  col.sticky && 'sticky left-10 z-10 bg-[#0d0d0d]',
                )}
                onClick={col.sortable ? () => handleSort(col.id) : undefined}
                aria-sort={
                  sortKey === col.id
                    ? sortDir === 'asc' ? 'ascending' : 'descending'
                    : col.sortable ? 'none' : undefined
                }
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && (
                    <SortIcon dir={sortKey === col.id ? sortDir : null} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <tbody>
          {isLoading
            ? Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={i} className="border-b border-[#1a1a1a]">
                  {showRowNumbers && (
                    <td className="sticky left-0 z-10 bg-[#0d0d0d] px-3 py-0 h-9">
                      <Skeleton className="h-3 w-4 rounded" />
                    </td>
                  )}
                  {visibleColumns.map((col) => (
                    <td key={col.id} className="px-3 py-0 h-9">
                      <Skeleton
                        className="h-3 rounded"
                        style={{ width: col.align === 'right' ? '60px' : '80%', marginLeft: col.align === 'right' ? 'auto' : undefined }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            : sortedData.length === 0
            ? (
                <tr>
                  <td colSpan={visibleColumns.length + (showRowNumbers ? 1 : 0)}>
                    <EmptyState title={emptyTitle} desc={emptyDesc} />
                  </td>
                </tr>
              )
            : sortedData.map((row, idx) => {
                const key = keyExtractor ? keyExtractor(row, idx) : String(idx);
                const extraCls = rowClassName?.(row, idx);
                return (
                  <tr
                    key={key}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      'border-b border-[#1a1a1a] transition-colors duration-75',
                      'hover:bg-[#161616]',
                      onRowClick && 'cursor-pointer',
                      extraCls,
                    )}
                  >
                    {/* Row number */}
                    {showRowNumbers && (
                      <td className="sticky left-0 z-10 bg-[#0d0d0d] px-3 h-9 text-[12px] text-[#525252] tabular-nums group-hover:bg-[#161616]">
                        {idx + 1}
                      </td>
                    )}
                    {/* Data cells */}
                    {visibleColumns.map((col) => {
                      const value = getCellValue(col, row);
                      return (
                        <td
                          key={col.id}
                          className={cn(
                            'px-3 h-9 text-[13px] text-[#f5f5f5] whitespace-nowrap',
                            col.align === 'right'  ? 'text-right'  : '',
                            col.align === 'center' ? 'text-center' : '',
                            col.sticky && 'sticky left-10 z-10 bg-[#0d0d0d]',
                          )}
                        >
                          {col.cell
                            ? col.cell(value, row, idx)
                            : (value as React.ReactNode) ?? '—'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
          }
        </tbody>
      </table>

      {/* ── Load more ────────────────────────────────────────────────────── */}
      {hasMore && (
        <LoadMoreRow isLoading={!!isLoadingMore} onLoadMore={onLoadMore} />
      )}
    </div>
  );
}

// ─── Cell renderers — reusable ────────────────────────────────────────────────

/** Protocol logo + name + ticker */
export function ProtocolCell({
  logo,
  name,
  ticker,
  verified,
}: {
  logo?: string;
  name: string;
  ticker?: string;
  verified?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      {/* Logo */}
      <div className="h-5 w-5 shrink-0 rounded-full overflow-hidden bg-[#1e1e1e] flex items-center justify-center">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-[9px] font-bold text-[#525252]">
            {name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      {/* Name + ticker */}
      <span className="truncate">
        <span className="text-[13px] font-medium text-[#f5f5f5]">{name}</span>
        {ticker && (
          <span className="ml-1 text-[11px] text-[#525252]">{ticker}</span>
        )}
        {verified && (
          <svg className="inline-block ml-1 h-3 w-3 text-[#10b981]" viewBox="0 0 16 16" fill="currentColor" aria-label="Verified">
            <path d="M8 1l1.94 2.26L12.5 2l.5 2.62L16 6l-1.26 2L16 10l-3 1.38L12.5 14l-2.56-1.26L8 15l-1.94-2.26L3.5 14l-.5-2.62L0 10l1.26-2L0 6l3-1.38L3.5 2l2.56 1.26L8 1z"/>
            <path d="M5.5 8l1.5 1.5 3.5-3.5" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
    </div>
  );
}

/** Delta % cell with color coding */
export function DeltaCell({ value, decimals = 2 }: { value: number | null | undefined; decimals?: number }) {
  if (value === null || value === undefined) return <span className="text-[#525252]">—</span>;
  const isPos = value >= 0;
  return (
    <span className={cn(
      'font-mono text-[12px] tabular-nums',
      isPos ? 'text-[#22c55e]' : 'text-[#ef4444]',
    )}>
      {isPos ? '+' : ''}{value.toFixed(decimals)}%
    </span>
  );
}

/** USD value cell */
export function USDCell({ value, decimals = 1 }: { value: number | null | undefined; decimals?: number }) {
  if (value === null || value === undefined) return <span className="text-[#525252]">—</span>;
  let formatted: string;
  const abs = Math.abs(value);
  if (abs >= 1e9)      formatted = `$${(value / 1e9).toFixed(decimals)}B`;
  else if (abs >= 1e6) formatted = `$${(value / 1e6).toFixed(decimals)}M`;
  else if (abs >= 1e3) formatted = `$${(value / 1e3).toFixed(decimals)}K`;
  else                 formatted = `$${value.toFixed(2)}`;
  return (
    <span className="font-mono text-[13px] text-[#f5f5f5] tabular-nums">{formatted}</span>
  );
}
