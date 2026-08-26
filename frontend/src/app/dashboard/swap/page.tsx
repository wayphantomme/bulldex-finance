'use client';

import { useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatUnits } from 'viem';
import Image from 'next/image';
import { usePool, useSwapQuote } from '@/hooks/usePool';
import { useSwap, parseAmount, applySlippage } from '@/hooks/useSwap';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { CONTRACTS, TOKEN_LIST, type TokenInfo, etherscanUrl } from '@/constants/contracts';
import { formatToken, shortenHash } from '@/utils/format';
import { cn } from '@/utils/cn';

// ─── Slippage options ─────────────────────────────────────────────────────────
const SLIPPAGE_OPTIONS = [
  { label: '0.1%', bps: 10 },
  { label: '0.5%', bps: 50 },
  { label: '1.0%', bps: 100 },
];

export default function SwapPage() {
  const { address, isConnected } = useAccount();

  // ── Token selection state ──────────────────────────────────────────────────
  const [tokenIn, setTokenIn]   = useState<TokenInfo>(TOKEN_LIST[0]);  // BDX
  const [tokenOut, setTokenOut] = useState<TokenInfo>(TOKEN_LIST[1]);  // MUSDC
  const [amountInStr, setAmountInStr] = useState('');
  const [slippageBps, setSlippageBps] = useState(50); // 0.5% default
  const [showSettings, setShowSettings] = useState(false);

  // ── Pool data ──────────────────────────────────────────────────────────────
  const pool = usePool();

  // ── Parsed amount ──────────────────────────────────────────────────────────
  const amountIn = useMemo(() => parseAmount(amountInStr, tokenIn.decimals), [amountInStr, tokenIn]);

  // ── Quote ──────────────────────────────────────────────────────────────────
  const { amountOut, priceImpact, isLoading: quoteLoading } = useSwapQuote(
    tokenIn.address,
    amountIn > 0n ? amountIn : undefined,
    pool.reserve0,
    pool.reserve1,
    pool.token0,
  );

  const minAmountOut = amountOut ? applySlippage(amountOut, slippageBps) : 0n;

  // ── Balances ───────────────────────────────────────────────────────────────
  const { raw: balanceIn }  = useTokenBalance(address);
  const { raw: balanceMUSC } = useTokenBalance(address);
  // Determine which balance to show based on selected tokenIn
  const tokenInBalance  = tokenIn.address === CONTRACTS.token.address ? balanceIn : balanceMUSC;

  // ── Swap flow ──────────────────────────────────────────────────────────────
  const { step, txHash, error, needsApproval, approve, swap, reset } = useSwap(
    tokenIn.address,
    address,
  );

  // ── Derived UI state ───────────────────────────────────────────────────────
  const priceImpactNum  = priceImpact ? Number(priceImpact) / 100 : 0;
  const impactColor     = priceImpactNum > 5 ? 'text-red' : priceImpactNum > 1 ? 'text-yellow' : 'text-green';
  const isInsufficient  = amountIn > 0n && tokenInBalance !== undefined && amountIn > tokenInBalance;
  const poolNotSeeded   = !pool.isConfigured || pool.reserve0 === 0n || pool.reserve1 === 0n;

  // Spot price: how much tokenOut per 1 tokenIn
  const spotPrice = useMemo(() => {
    if (!pool.reserve0 || !pool.reserve1 || pool.reserve0 === 0n) return null;
    const isToken0In = tokenIn.address.toLowerCase() === pool.token0?.toLowerCase();
    const price = isToken0In ? pool.price0 : pool.price1;
    if (!price) return null;
    return formatUnits(price, 18);
  }, [pool, tokenIn]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleFlip() {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountInStr('');
    reset();
  }

  function handleMax() {
    if (!tokenInBalance) return;
    setAmountInStr(formatUnits(tokenInBalance, tokenIn.decimals));
  }

  async function handleSwap() {
    if (!address || amountIn === 0n) return;
    if (needsApproval(amountIn)) {
      await approve(tokenIn.address, amountIn);
    }
    await swap(tokenIn.address, amountIn, minAmountOut);
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-ink">Swap</h1>
          <p className="mt-0.5 text-xs text-ink-secondary">
            Exchange tokens at the best rate - 0.3% fee.
          </p>
        </div>
        {pool.isConfigured && pool.reserve0 && pool.reserve0 > 0n && (
          <div className="hidden items-center gap-1.5 rounded-lg border border-base-border bg-base-card px-3 py-1.5 sm:flex">
            <span className="text-xs text-ink-faint">Pool liquidity:</span>
            <span className="text-xs font-medium text-ink">
              {formatToken(pool.reserve0, 18, 0)} BDX / {formatToken(pool.reserve1, 18, 0)} MUSDC
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-sm space-y-2">

          {/* ── Swap card ─────────────────────────────────────────────────── */}
          <div className="rounded-xl border border-base-border bg-base-card">

            {/* Card header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <span className="text-sm font-semibold text-ink">Swap</span>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={cn(
                  'rounded-lg p-1.5 transition-colors hover:bg-base-elevated',
                  showSettings ? 'text-green' : 'text-ink-faint',
                )}
                aria-label="Settings"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
              </button>
            </div>

            {/* Slippage settings */}
            {showSettings && (
              <div className="mx-4 mb-3 rounded-lg border border-base-border bg-base-surface px-3 py-2.5">
                <p className="mb-2 text-xs text-ink-faint">Max slippage</p>
                <div className="flex gap-2">
                  {SLIPPAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.bps}
                      onClick={() => setSlippageBps(opt.bps)}
                      className={cn(
                        'flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors',
                        slippageBps === opt.bps
                          ? 'bg-green/15 text-green border border-green/30'
                          : 'bg-base-elevated text-ink-secondary hover:text-ink border border-base-border',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* You sell */}
            <div className="mx-4 mb-1 rounded-xl bg-base-surface p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-ink-faint">You sell</span>
                {isConnected && tokenInBalance !== undefined && (
                  <button
                    onClick={handleMax}
                    className="text-xs text-ink-faint transition-colors hover:text-green"
                  >
                    Balance: {formatToken(tokenInBalance, tokenIn.decimals, 4)}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="0.0"
                  value={amountInStr}
                  onChange={(e) => {
                    setAmountInStr(e.target.value);
                    reset();
                  }}
                  className="min-w-0 flex-1 bg-transparent text-2xl font-semibold text-ink placeholder:text-ink-faint focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <TokenPill token={tokenIn} />
              </div>
            </div>

            {/* Flip button */}
            <div className="relative flex justify-center py-1">
              <div className="absolute inset-x-4 top-1/2 h-px bg-base-border" />
              <button
                onClick={handleFlip}
                className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-base-border bg-base-card text-ink-secondary transition-all duration-150 hover:border-green/30 hover:bg-base-elevated hover:text-green hover:rotate-180"
              >
                <svg className="h-4 w-4 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
            </div>

            {/* You receive */}
            <div className="mx-4 mt-1 rounded-xl bg-base-surface p-3">
              <p className="mb-2 text-xs text-ink-faint">You receive</p>
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  {quoteLoading && amountInStr ? (
                    <div className="h-8 w-28 animate-pulse rounded-lg bg-base-elevated" />
                  ) : (
                    <span className={cn(
                      'text-2xl font-semibold',
                      amountOut && amountOut > 0n ? 'text-ink' : 'text-ink-faint',
                    )}>
                      {amountOut && amountOut > 0n
                        ? formatToken(amountOut, tokenOut.decimals, 6)
                        : '0.0'}
                    </span>
                  )}
                </div>
                <TokenPill token={tokenOut} />
              </div>
            </div>

            {/* Info rows */}
            {amountOut && amountOut > 0n && (
              <div className="mx-4 mt-3 space-y-1.5 rounded-lg bg-base-surface px-3 py-2.5">
                {spotPrice && (
                  <InfoRow
                    label="Rate"
                    value={`1 ${tokenIn.symbol} = ${parseFloat(spotPrice).toFixed(4)} ${tokenOut.symbol}`}
                  />
                )}
                <InfoRow
                  label="Price impact"
                  value={`${priceImpactNum.toFixed(2)}%`}
                  valueClass={impactColor}
                />
                <InfoRow
                  label="Min received"
                  value={`${formatToken(minAmountOut, tokenOut.decimals, 6)} ${tokenOut.symbol}`}
                />
                <InfoRow
                  label="Fee (0.3%)"
                  value={`${formatToken((amountIn * 3n) / 1000n, tokenIn.decimals, 6)} ${tokenIn.symbol}`}
                />
              </div>
            )}

            {/* Action button */}
            <div className="p-4">
              {!isConnected ? (
                <div className="flex justify-center">
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <button
                        onClick={openConnectModal}
                        className="w-full rounded-xl bg-green py-3 text-sm font-semibold text-base-bg transition-opacity hover:opacity-90"
                      >
                        Connect Wallet
                      </button>
                    )}
                  </ConnectButton.Custom>
                </div>
              ) : poolNotSeeded ? (
                <button disabled className="w-full rounded-xl bg-base-elevated py-3 text-sm font-medium text-ink-faint cursor-not-allowed">
                  Pool not deployed yet
                </button>
              ) : !amountInStr || amountIn === 0n ? (
                <button disabled className="w-full rounded-xl bg-base-elevated py-3 text-sm font-medium text-ink-faint cursor-not-allowed">
                  Enter an amount
                </button>
              ) : isInsufficient ? (
                <button disabled className="w-full rounded-xl bg-red/10 py-3 text-sm font-medium text-red cursor-not-allowed border border-red/20">
                  Insufficient {tokenIn.symbol} balance
                </button>
              ) : step === 'approving' ? (
                <button disabled className="flex w-full items-center justify-center gap-2 rounded-xl bg-base-elevated py-3 text-sm font-medium text-ink-secondary">
                  <Spinner />
                  Approving {tokenIn.symbol}...
                </button>
              ) : step === 'swapping' ? (
                <button disabled className="flex w-full items-center justify-center gap-2 rounded-xl bg-base-elevated py-3 text-sm font-medium text-ink-secondary">
                  <Spinner />
                  Swapping...
                </button>
              ) : step === 'success' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-green/30 bg-green/10 py-3">
                    <svg className="h-4 w-4 text-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-semibold text-green">Swap complete!</span>
                  </div>
                  {txHash && (
                    <a
                      href={etherscanUrl(txHash, 'tx')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 text-xs text-ink-faint transition-colors hover:text-green"
                    >
                      {shortenHash(txHash)} →
                    </a>
                  )}
                  <button
                    onClick={() => { reset(); setAmountInStr(''); }}
                    className="w-full rounded-xl border border-base-border bg-base-elevated py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
                  >
                    New swap
                  </button>
                </div>
              ) : step === 'error' ? (
                <div className="space-y-2">
                  <div className="rounded-xl border border-red/20 bg-red/10 px-3 py-2.5 text-xs text-red">
                    {error ?? 'Something went wrong'}
                  </div>
                  <button
                    onClick={reset}
                    className="w-full rounded-xl border border-base-border bg-base-elevated py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
                  >
                    Try again
                  </button>
                </div>
              ) : needsApproval(amountIn) ? (
                <button
                  onClick={handleSwap}
                  className="w-full rounded-xl bg-green py-3 text-sm font-semibold text-base-bg transition-opacity hover:opacity-90"
                >
                  Approve {tokenIn.symbol}
                </button>
              ) : (
                <button
                  onClick={handleSwap}
                  className="w-full rounded-xl bg-green py-3 text-sm font-semibold text-base-bg transition-opacity hover:opacity-90"
                >
                  Swap {tokenIn.symbol} → {tokenOut.symbol}
                </button>
              )}
            </div>
          </div>

          {/* Faucet hint */}
          {isConnected && pool.isConfigured && (
            <p className="text-center text-xs text-ink-faint">
              Need testnet tokens?{' '}
              <a
                href={etherscanUrl(CONTRACTS.musdc.address, 'address')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green transition-opacity hover:opacity-70"
              >
                Call faucet() on MUSDC contract →
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TokenPill({ token }: { token: TokenInfo }) {
  return (
    <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-base-border bg-base-elevated px-2.5 py-1.5">
      <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full">
        <Image src={token.logoSrc} alt={token.symbol} fill className="object-cover" sizes="20px" />
      </div>
      <span className="text-sm font-semibold text-ink">{token.symbol}</span>
    </div>
  );
}

function InfoRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-ink-faint">{label}</span>
      <span className={cn('text-xs font-medium text-ink', valueClass)}>{value}</span>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
