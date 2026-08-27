'use client';

import { useState, useEffect, useRef } from 'react';
import { usePriceTicker } from '@/hooks/usePriceTicker';
import { cn } from '@/utils/cn';

/**
 * Live price ticker with % change.
 * % change is computed by comparing current price to the price
 * recorded 60 seconds ago (snapshot stored in a ref).
 * This is fully on-chain — no external price API needed.
 */
export function PriceTicker() {
  const { bdxPriceRaw, bdxPriceUSD, ethPriceRaw, ethPriceUSD, tvlUSD, isLoading } = usePriceTicker();

  // Snapshots: price 60s ago
  const bdxSnapshot = useRef<number | null>(null);
  const ethSnapshot = useRef<number | null>(null);
  const snapshotTime = useRef<number>(0);

  const [bdxChange, setBdxChange] = useState<number | null>(null);
  const [ethChange, setEthChange] = useState<number | null>(null);

  useEffect(() => {
    if (!bdxPriceRaw || !ethPriceRaw) return;
    const now = Date.now();

    // First load — record snapshot
    if (bdxSnapshot.current === null) {
      bdxSnapshot.current = bdxPriceRaw;
      ethSnapshot.current = ethPriceRaw;
      snapshotTime.current = now;
      return;
    }

    // After 60s, compute change from snapshot and reset
    if (now - snapshotTime.current >= 60_000) {
      if (bdxSnapshot.current > 0) {
        setBdxChange(((bdxPriceRaw - bdxSnapshot.current) / bdxSnapshot.current) * 100);
      }
      if (ethSnapshot.current && ethSnapshot.current > 0) {
        setEthChange(((ethPriceRaw - ethSnapshot.current) / ethSnapshot.current) * 100);
      }
      bdxSnapshot.current = bdxPriceRaw;
      ethSnapshot.current = ethPriceRaw;
      snapshotTime.current = now;
    }
  }, [bdxPriceRaw, ethPriceRaw]);

  function fmtPct(pct: number | null): string | null {
    if (pct === null) return null;
    const sign = pct >= 0 ? '+' : '';
    return `${sign}${pct.toFixed(2)}%`;
  }

  return (
    <div className="fixed top-14 left-0 right-0 z-40 flex h-8 items-center border-b border-base-border bg-base-surface/80 backdrop-blur-sm px-4 overflow-hidden">
      <div className="flex items-center gap-5 text-xs ml-16">

        {/* BDX */}
        <span className="flex items-center gap-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/bulldex-logo.png" alt="BDX" className="h-3.5 w-3.5 rounded-full object-cover" />
          <span className="font-medium text-ink-secondary">BDX</span>
          {isLoading ? (
            <span className="h-3 w-14 animate-pulse rounded bg-base-elevated inline-block" />
          ) : bdxPriceUSD ? (
            <span className="font-semibold text-ink tabular-nums">{bdxPriceUSD}</span>
          ) : (
            <span className="text-ink-faint text-[10px]">no pool</span>
          )}
          {fmtPct(bdxChange) && (
            <span className={cn(
              'text-[10px] font-semibold tabular-nums',
              bdxChange! >= 0 ? 'text-green' : 'text-red',
            )}>
              {fmtPct(bdxChange)}
            </span>
          )}
        </span>

        <span className="text-base-border">·</span>

        {/* ETH */}
        <span className="flex items-center gap-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/eth-icon.svg" alt="ETH" className="h-3.5 w-3.5" />
          <span className="font-medium text-ink-secondary">ETH</span>
          {isLoading ? (
            <span className="h-3 w-14 animate-pulse rounded bg-base-elevated inline-block" />
          ) : ethPriceUSD ? (
            <span className="font-semibold text-ink tabular-nums">{ethPriceUSD}</span>
          ) : (
            <span className="text-ink-faint text-[10px]">no feed</span>
          )}
          {fmtPct(ethChange) && (
            <span className={cn(
              'text-[10px] font-semibold tabular-nums',
              ethChange! >= 0 ? 'text-green' : 'text-red',
            )}>
              {fmtPct(ethChange)}
            </span>
          )}
        </span>

        {/* TVL */}
        {tvlUSD && (
          <>
            <span className="text-base-border">·</span>
            <span className="flex items-center gap-1.5">
              <span className="text-ink-faint">TVL</span>
              <span className="font-semibold text-ink tabular-nums">{tvlUSD}</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
