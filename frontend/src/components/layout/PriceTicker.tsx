'use client';

import { usePriceTicker } from '@/hooks/usePriceTicker';

/**
 * Live price ticker strip below header.
 *
 * BDX price: derived from BDX/WETH pool spot price × Chainlink ETH/USD
 *   Formula: bdxPriceUSD = (wethReserve / bdxReserve) × ethPriceUSD
 *
 * ETH price: Chainlink ETH/USD feed on Sepolia (0x694AA1769357215DE4FAC081bf1f309aDC325306)
 */
export function PriceTicker() {
  const { bdxPriceUSD, ethPriceUSD, tvlUSD, isLoading } = usePriceTicker();

  return (
    <div className="fixed top-14 left-0 right-0 z-40 flex h-8 items-center border-b border-base-border bg-base-surface/80 backdrop-blur-sm px-4 overflow-hidden">
      <div className="flex items-center gap-5 text-xs ml-16">

        {/* BDX */}
        <span className="flex items-center gap-1.5">
          {/* BDX logo */}
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
        </span>

        {/* TVL — only show if we have data */}
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
