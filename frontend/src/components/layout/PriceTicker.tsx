'use client';

import { usePriceTicker } from '@/hooks/usePriceTicker';

/**
 * Live price ticker strip — shown below the main header in dashboard.
 * BDX price from BDX/MUSDC pool | ETH price from Chainlink on Sepolia.
 * Mimics Jupiter's ticker row.
 */
export function PriceTicker() {
  const { bdxPriceMUSC, ethPriceUSD, isLoading } = usePriceTicker();

  return (
    <div className="fixed top-14 left-0 right-0 z-40 flex h-8 items-center gap-0 border-b border-base-border bg-base-surface/80 backdrop-blur-sm px-4 overflow-hidden">
      <div className="flex items-center gap-5 text-xs ml-16">

        {/* BDX */}
        <span className="flex items-center gap-2">
          <span className="font-medium text-ink-secondary">BDX</span>
          {isLoading ? (
            <span className="h-3 w-16 animate-pulse rounded bg-base-elevated inline-block" />
          ) : bdxPriceMUSC ? (
            <span className="font-semibold text-ink tabular-nums">{bdxPriceMUSC} MUSDC</span>
          ) : (
            <span className="text-ink-faint">—</span>
          )}
        </span>

        <span className="text-base-border">|</span>

        {/* ETH */}
        <span className="flex items-center gap-2">
          {/* ETH icon */}
          <span className="flex items-center gap-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/eth-icon.svg" alt="ETH" className="h-3.5 w-3.5" />
            <span className="font-medium text-ink-secondary">ETH</span>
          </span>
          {isLoading ? (
            <span className="h-3 w-14 animate-pulse rounded bg-base-elevated inline-block" />
          ) : ethPriceUSD ? (
            <span className="font-semibold text-ink tabular-nums">${ethPriceUSD}</span>
          ) : (
            <span className="text-ink-faint">—</span>
          )}
        </span>

        {/* Sepolia note — removed, already shown in header */}
      </div>
    </div>
  );
}
