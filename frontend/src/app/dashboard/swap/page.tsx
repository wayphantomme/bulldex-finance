'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatUnits } from 'viem';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, Settings2, ArrowDownUp, CheckCircle2, XCircle, Loader2, Search, X } from 'lucide-react';
import { useMultiPool } from '@/hooks/useMultiPool';
import { useMultiSwap } from '@/hooks/useMultiSwap';
import { useSwapQuote } from '@/hooks/usePool';
import { useTokenBalances, getBalanceForSymbol } from '@/hooks/useTokenBalances';
import { parseAmount, applySlippage } from '@/hooks/useSwap';
import { CONTRACT_ADDRESSES, TOKEN_LIST, type TokenInfo, etherscanUrl, isConfigured } from '@/constants/contracts';
import { formatToken, shortenHash } from '@/utils/format';
import { cn } from '@/utils/cn';

const SLIPPAGE_OPTIONS = [
  { label: '0.5%', bps: 50 },
  { label: '1.0%', bps: 100 },
  { label: '2.0%', bps: 200 },
];

export default function SwapPage() {
  const { address, isConnected } = useAccount();

  // ── Token pair state ───────────────────────────────────────────────────────
  const [tokenIn,  setTokenIn]  = useState<TokenInfo>(TOKEN_LIST[1]); // MUSDC
  const [tokenOut, setTokenOut] = useState<TokenInfo>(TOKEN_LIST[0]); // BDX
  const [showTokenInPicker,  setShowTokenInPicker]  = useState(false);
  const [showTokenOutPicker, setShowTokenOutPicker] = useState(false);
  const sellInputRef = useRef<HTMLInputElement>(null);
  const [amountInStr,  setAmountInStr]  = useState('');
  const [slippageBps,  setSlippageBps]  = useState(100); // 1% default — prevents SlippageExceeded on most swaps
  const [showSettings, setShowSettings] = useState(false);

  // ── Pool for this pair ─────────────────────────────────────────────────────
  const pool = useMultiPool(tokenIn, tokenOut);

  // ── Balances for all tokens ────────────────────────────────────────────────
  const balances = useTokenBalances(address);
  const tokenInBalance = getBalanceForSymbol(tokenIn.symbol, balances);

  // ── Quote ──────────────────────────────────────────────────────────────────
  const amountIn = useMemo(() => parseAmount(amountInStr, tokenIn.decimals), [amountInStr, tokenIn]);

  // For ETH, use WETH address as tokenIn for pool quote
  const tokenInAddrForQuote = tokenIn.symbol === 'ETH' ? CONTRACT_ADDRESSES.weth : tokenIn.address;

  const { amountOut, priceImpact, isLoading: quoteLoading } = useSwapQuote(
    tokenInAddrForQuote,
    amountIn > 0n ? amountIn : undefined,
    pool.reserve0,
    pool.reserve1,
    pool.token0,
  );

  const minAmountOut = amountOut ? applySlippage(amountOut, slippageBps) : 0n;

  // ── Swap execution ─────────────────────────────────────────────────────────
  const { step, txHash, error, needsApproval, execute, reset } = useMultiSwap(address);

  // ── Derived ────────────────────────────────────────────────────────────────
  const priceImpactNum = priceImpact ? Number(priceImpact) / 100 : 0;
  const impactColor    = priceImpactNum > 5 ? 'text-red' : priceImpactNum > 1 ? 'text-yellow' : 'text-green';
  const isInsufficient = amountIn > 0n && tokenInBalance !== undefined && amountIn > tokenInBalance;
  const poolNotReady   = !pool.isConfigured || !pool.hasLiquidity;

  const spotPrice = useMemo(() => {
    if (!pool.reserve0 || !pool.reserve1 || pool.reserve0 === 0n || !pool.token0) return null;
    const addrIn = tokenIn.symbol === 'ETH' ? CONTRACT_ADDRESSES.weth : tokenIn.address;
    const isToken0In = addrIn.toLowerCase() === pool.token0.toLowerCase();
    const price = isToken0In ? pool.price0 : pool.price1;
    if (!price) return null;
    return parseFloat(formatUnits(price, 18)).toFixed(6);
  }, [pool, tokenIn]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleFlip() {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountInStr('');
    reset();
  }

  function handleMax() {
    if (tokenInBalance === 0n) return;
    setAmountInStr(formatUnits(tokenInBalance, tokenIn.decimals));
  }

  function selectTokenIn(t: TokenInfo) {
    if (t.symbol === tokenOut.symbol) {
      setTokenOut(tokenIn);
    }
    setTokenIn(t);
    setAmountInStr('');
    setShowTokenInPicker(false);
    reset();
  }

  function selectTokenOut(t: TokenInfo) {
    if (t.symbol === tokenIn.symbol) {
      setTokenIn(tokenOut);
    }
    setTokenOut(t);
    setShowTokenOutPicker(false);
    reset();
  }

  function openInPicker()  { setShowTokenOutPicker(false); setShowTokenInPicker(true);  }
  function openOutPicker() { setShowTokenInPicker(false);  setShowTokenOutPicker(true); }
  function closeAllPickers() { setShowTokenInPicker(false); setShowTokenOutPicker(false); }

  // Close token picker on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') closeAllPickers(); }
    if (showTokenInPicker || showTokenOutPicker) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showTokenInPicker, showTokenOutPicker]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSwap() {
    if (!address || amountIn === 0n || !pool.poolAddress) return;
    await execute(tokenIn, amountIn, minAmountOut, pool.poolAddress, address);
  }

  const isBusy = step === 'wrapping' || step === 'approving' || step === 'swapping';

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">Swap</h1>
          <p className="mt-1 text-sm text-ink-secondary">Exchange tokens at the best rate. 0.3% fee.</p>
        </div>
        {pool.hasLiquidity && (
          <div className="hidden items-center gap-1.5 rounded-lg border border-base-border bg-base-card px-3 py-1.5 sm:flex">
            <span className="text-xs text-ink-faint">Liquidity:</span>
            <span className="text-xs font-medium text-ink">
              {formatToken(pool.reserve0, 18, 0)} / {formatToken(pool.reserve1, 18, 0)}
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-md space-y-2">

          {/* ── Swap card ──────────────────────────────────────────────── */}
          <div className="rounded-2xl border border-base-border bg-base-card">

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-2">
              <span className="text-sm font-semibold text-ink">Swap</span>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={cn('rounded-lg p-1.5 transition-colors hover:bg-base-elevated',
                  showSettings ? 'text-brand' : 'text-ink-faint')}
              >
                <Settings2 className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Slippage */}
            {showSettings && (
              <div className="mx-5 mb-3 rounded-xl border border-base-border bg-base-surface px-3 py-2.5">
                <p className="mb-2 text-xs text-ink-faint">Max slippage</p>
                <div className="flex gap-2">
                  {SLIPPAGE_OPTIONS.map((opt) => (
                    <button key={opt.bps} onClick={() => setSlippageBps(opt.bps)}
                      className={cn('flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors border',
                        slippageBps === opt.bps
                          ? 'bg-brand/10 text-brand border-brand/30'
                          : 'bg-base-elevated text-ink-secondary hover:text-ink border-base-border',
                      )}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sell panel */}
            <div
              className="mx-5 mb-1 rounded-2xl bg-base-surface p-4 relative border border-transparent hover:border-base-border hover:bg-base-elevated/40 transition-all duration-150 cursor-text"
              onClick={() => sellInputRef.current?.focus()}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-ink-secondary">Sell</span>
                <button onClick={(e) => { e.stopPropagation(); handleMax(); }}
                  className="text-xs text-ink-faint hover:text-brand transition-colors duration-150">
                  Balance: {formatToken(tokenInBalance, tokenIn.decimals, 4)}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <input
                  ref={sellInputRef}
                  type="number"
                  placeholder="0.0"
                  value={amountInStr}
                  onChange={(e) => { setAmountInStr(e.target.value); reset(); }}
                  className="tabular-nums min-w-0 flex-1 bg-transparent text-4xl font-normal text-ink placeholder:text-ink-faint outline-none focus:outline-none ring-0 focus:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <TokenSelector token={tokenIn} onClick={(e) => { e.stopPropagation(); openInPicker(); }} />
              </div>
            </div>

            {/* Flip button */}
            <div className="relative flex justify-center -my-1.5 z-10">
              <div className="group relative">
                <button onClick={handleFlip}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-base-border bg-base-card text-ink-secondary transition-all duration-200 ease-out hover:border-brand/40 hover:bg-brand/5 hover:text-brand active:scale-95">
                  <ArrowDownUp className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Buy panel */}
            <div className="mx-5 mt-1 rounded-2xl bg-base-surface p-4 relative border border-transparent hover:border-base-border hover:bg-base-elevated/40 transition-all duration-150">
              <p className="mb-2 text-xs text-ink-secondary">Buy</p>
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  {quoteLoading && amountInStr ? (
                    <div className="h-10 w-32 animate-pulse rounded-lg bg-base-elevated" />
                  ) : (
                    <span className={cn('tabular-nums text-4xl font-normal',
                      amountOut && amountOut > 0n ? 'text-ink' : 'text-ink-faint')}>
                      {amountOut && amountOut > 0n ? formatToken(amountOut, tokenOut.decimals, 6) : '0.0'}
                    </span>
                  )}
                </div>
                <TokenSelector token={tokenOut} onClick={(e) => { e.stopPropagation(); openOutPicker(); }} />
              </div>
            </div>

            {/* Info rows */}
            {amountOut && amountOut > 0n && (
              <div className="mx-5 mt-3 space-y-1.5 rounded-xl bg-base-surface px-4 py-3">
                {spotPrice && (
                  <InfoRow label="Rate" value={`1 ${tokenIn.symbol} = ${spotPrice} ${tokenOut.symbol}`} />
                )}
                <InfoRow label="Price impact" value={`${priceImpactNum.toFixed(2)}%`} valueClass={impactColor} />
                <InfoRow label="Min received" value={`${formatToken(minAmountOut, tokenOut.decimals, 6)} ${tokenOut.symbol}`} />
                <InfoRow label="Fee (0.3%)" value={`${formatToken((amountIn * 3n) / 1000n, tokenIn.decimals, 6)} ${tokenIn.symbol}`} />
                {tokenIn.symbol === 'ETH' && (
                  <InfoRow label="ETH wrap" value="ETH wraps to WETH before swap" valueClass="text-ink-faint" />
                )}
              </div>
            )}

            {/* Action button */}
            <div className="p-5">
              {!isConnected ? (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button onClick={openConnectModal}
                      className="w-full rounded-xl bg-brand py-3.5 text-sm font-semibold text-base-bg transition-all duration-200 hover:bg-brand-dark active:scale-[0.98] active:brightness-95">
                      Connect Wallet
                    </button>
                  )}
                </ConnectButton.Custom>
              ) : poolNotReady ? (
                <button disabled className="w-full rounded-xl bg-base-elevated py-3.5 text-sm font-medium text-ink-faint cursor-not-allowed">
                  {isConfigured(pool.poolAddress) ? 'Pool empty, add liquidity first' : 'Pool not deployed'}
                </button>
              ) : !amountInStr || amountIn === 0n ? (
                <button disabled className="w-full rounded-xl bg-base-elevated py-3.5 text-sm font-medium text-ink-faint cursor-not-allowed">
                  Enter an amount
                </button>
              ) : isInsufficient ? (
                <button disabled className="w-full rounded-xl bg-red/10 py-3.5 text-sm font-medium text-red cursor-not-allowed border border-red/20">
                  Insufficient {tokenIn.symbol} balance
                </button>
              ) : step === 'wrapping' ? (
                <button disabled className="flex w-full items-center justify-center gap-2 rounded-xl bg-base-elevated py-3.5 text-sm font-medium text-ink-secondary">
                  <Loader2 className="h-4 w-4 animate-spin" />Wrapping ETH...
                </button>
              ) : step === 'approving' ? (
                <button disabled className="flex w-full items-center justify-center gap-2 rounded-xl bg-base-elevated py-3.5 text-sm font-medium text-ink-secondary">
                  <Loader2 className="h-4 w-4 animate-spin" />Approving {tokenIn.symbol}...
                </button>
              ) : step === 'swapping' ? (
                <button disabled className="flex w-full items-center justify-center gap-2 rounded-xl bg-base-elevated py-3.5 text-sm font-medium text-ink-secondary">
                  <Loader2 className="h-4 w-4 animate-spin" />Swapping...
                </button>
              ) : step === 'success' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-green/30 bg-green/5 py-3">
                    <CheckCircle2 className="h-4 w-4 text-green" strokeWidth={1.5} />
                    <span className="text-sm font-semibold text-green">Swap complete!</span>
                  </div>
                  {txHash && (
                    <a href={etherscanUrl(txHash, 'tx')} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center text-xs text-ink-faint hover:text-ink-secondary transition-colors">
                      {shortenHash(txHash)}
                    </a>
                  )}
                  <button onClick={() => { reset(); setAmountInStr(''); }}
                    className="w-full rounded-xl border border-base-border bg-base-elevated py-2.5 text-sm font-medium text-ink-secondary hover:text-ink transition-colors">
                    New swap
                  </button>
                </div>
              ) : step === 'error' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-xl border border-red/20 bg-red/10 px-3 py-2.5">
                    <XCircle className="h-4 w-4 text-red shrink-0" strokeWidth={1.5} />
                    <span className="text-xs text-red">{error ?? 'Something went wrong'}</span>
                  </div>
                  <button onClick={reset}
                    className="w-full rounded-xl border border-base-border bg-base-elevated py-2.5 text-sm font-medium text-ink-secondary hover:text-ink transition-colors">
                    Try again
                  </button>
                </div>
              ) : needsApproval(tokenIn, amountIn, pool.poolAddress) ? (
                <button onClick={handleSwap} disabled={isBusy}
                  className="w-full rounded-xl bg-brand py-3.5 text-sm font-semibold text-base-bg transition-all duration-200 hover:bg-brand-dark active:scale-[0.98] active:brightness-95">
                  Approve {tokenIn.symbol}
                </button>
              ) : (
                <button onClick={handleSwap} disabled={isBusy}
                  className="w-full rounded-xl bg-brand py-3.5 text-sm font-semibold text-base-bg transition-all duration-200 hover:bg-brand-dark active:scale-[0.98] active:brightness-95">
                  {tokenIn.symbol === 'ETH' ? `Wrap & Swap ETH → ${tokenOut.symbol}` : `Swap ${tokenIn.symbol} → ${tokenOut.symbol}`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Token picker overlays ─────────────────────────────────────── */}
      {(showTokenInPicker || showTokenOutPicker) && (
        <>
      {/* Backdrop — click anywhere outside to close */}
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={closeAllPickers} />
          {/* Picker centered over the swap card */}
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-4">
            <TokenPicker
              tokens={TOKEN_LIST.filter((t) =>
                showTokenInPicker
                  ? t.symbol !== tokenIn.symbol
                  : t.symbol !== tokenOut.symbol
              )}
              balances={balances}
              onSelect={showTokenInPicker ? selectTokenIn : selectTokenOut}
              onClose={closeAllPickers}
            />
          </div>
        </>
      )}

      {/* Faucet hint */}
      {isConnected && (
        <div className="flex justify-center">
          <p className="text-center text-xs text-ink-faint">
            Need testnet tokens?{' '}
            <Link href="/dashboard/faucet" className="text-ink-secondary underline underline-offset-2 hover:text-ink transition-colors">
              Get from Faucet
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Token selector pill (clickable) ──────────────────────────────────────────

function TokenSelector({ token, onClick }: { token: TokenInfo; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex shrink-0 items-center gap-1.5 rounded-xl border border-base-border bg-base-elevated px-2.5 py-1.5 transition-all duration-200 ease-out hover:border-brand/50 hover:bg-brand/5 active:scale-95"
    >
      <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full">
        <Image src={token.logoSrc} alt={token.symbol} fill className="object-cover" sizes="20px" />
      </div>
      <span className="text-sm font-semibold text-ink transition-colors duration-150 group-hover:text-brand">{token.symbol}</span>
      <ChevronDown className="h-3.5 w-3.5 text-ink-faint transition-colors duration-150 group-hover:text-brand" strokeWidth={1.5} />
    </button>
  );
}

// ─── Token picker dropdown ─────────────────────────────────────────────────────

import type { TokenBalances } from '@/hooks/useTokenBalances';

function TokenPicker({
  tokens, balances, onSelect, onClose,
}: {
  tokens: TokenInfo[];
  balances: TokenBalances;
  onSelect: (t: TokenInfo) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search on open
  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = tokens.filter(t =>
    t.symbol.toLowerCase().includes(query.toLowerCase()) ||
    t.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="rounded-2xl border border-base-border bg-base-card shadow-elevated overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-base-border">
        <p className="text-sm font-semibold text-ink">Select a token</p>
        <button
          onClick={onClose}
          className="text-ink-faint hover:text-ink transition-colors p-1"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* Search */}
      <div className="px-5 pb-3">
        <div className="flex items-center gap-2.5 rounded-xl border border-base-border bg-base-surface px-3 py-2.5 focus-within:border-brand/30 transition-colors">
          <Search className="h-3.5 w-3.5 text-ink-faint shrink-0" strokeWidth={2} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by name or symbol"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs text-ink placeholder:text-ink-faint outline-none focus:outline-none ring-0 focus:ring-0"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-ink-faint hover:text-ink transition-colors">
              <X className="h-3 w-3" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center justify-between px-5 pb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Token</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Balance</span>
      </div>

      {/* Token list */}
      <div className="pb-2 max-h-64 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-xs text-ink-faint">No tokens found for &ldquo;{query}&rdquo;</p>
          </div>
        ) : (
          filtered.map((t) => {
            const bal = getBalanceForSymbol(t.symbol, balances);
            const hasBalance = bal > 0n;
            return (
              <button
                key={t.symbol}
                onClick={() => onSelect(t)}
                className="group flex w-full items-center gap-3 px-5 py-3 transition-colors duration-150 hover:bg-base-elevated active:scale-[0.99]"
              >
                {/* Token icon */}
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-base-border group-hover:ring-brand/20 transition-all">
                  <Image src={t.logoSrc} alt={t.symbol} fill className="object-cover" sizes="40px" />
                </div>

                {/* Token info */}
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold text-ink group-hover:text-brand transition-colors duration-150 truncate">
                    {t.symbol}
                  </p>
                  <p className="text-xs text-ink-faint truncate">{t.name}</p>
                </div>

                {/* Balance */}
                <div className="text-right shrink-0">
                  <p className={cn(
                    'text-sm font-semibold tabular-nums',
                    hasBalance ? 'text-ink' : 'text-ink-faint',
                  )}>
                    {formatToken(bal, t.decimals, 4)}
                  </p>
                  {hasBalance && (
                    <p className="text-[10px] text-ink-faint">
                      {t.symbol}
                    </p>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-base-border px-5 py-3">
        <p className="text-[10px] text-ink-faint text-center">
          Only tokens with active pools are listed
        </p>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-ink-faint">{label}</span>
      <span className={cn('text-xs font-medium text-ink', valueClass)}>{value}</span>
    </div>
  );
}
