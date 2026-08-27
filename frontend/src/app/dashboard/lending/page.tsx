'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatUnits } from 'viem';
import { CheckCircle2, XCircle, Loader2, X, AlertTriangle, ChevronRight } from 'lucide-react';
import {
  useLendingStats,
  useLendingPosition,
  useLendingActions,
  parseTokenAmount,
} from '@/hooks/useLending';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { etherscanUrl } from '@/constants/contracts';
import { shortenHash } from '@/utils/format';
import { cn } from '@/utils/cn';

type ActionType = 'deposit' | 'borrow' | 'repay' | 'withdraw';

export default function LendingPage() {
  const { address, isConnected } = useAccount();
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [inputVal, setInputVal] = useState('');

  const stats    = useLendingStats();
  const position = useLendingPosition(address);
  const actions  = useLendingActions(address);
  const balances = useTokenBalances(address); // real wallet balances

  const amount = parseTokenAmount(inputVal);

  // Escape key to close modal
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') closeAction(); }
    if (actionType) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [actionType]); // eslint-disable-line react-hooks/exhaustive-deps

  // Safe health factor display — guard against max uint256 scientific notation
  const hfDisplay = !position.collateral || position.collateral === 0n
    ? '—'
    : position.healthFactorNum === Infinity
    ? '∞'
    : position.healthFactorNum > 999
    ? '>999'
    : position.healthFactorNum.toFixed(2);

  const hfColor = position.healthFactorNum < 1.1 ? 'text-red'
    : position.healthFactorNum < 1.5 ? 'text-yellow'
    : 'text-green';

  const utilization = stats.totalCollateral > 0n && stats.totalBorrowed > 0n
    ? Math.min(100, (Number(stats.totalBorrowed) / Number(stats.reserveBalance + stats.totalBorrowed)) * 100)
    : 0;

  function openAction(type: ActionType) {
    setActionType(type);
    setInputVal('');
    actions.reset();
  }

  function closeAction() {
    setActionType(null);
    setInputVal('');
    actions.reset();
  }

  async function handleSubmit() {
    if (!isConnected || !address) return;
    if (!actionType) return;

    switch (actionType) {
      case 'deposit':
        if (amount === 0n) return;
        await actions.depositCollateral(amount);
        break;
      case 'borrow':
        if (amount === 0n) return;
        await actions.borrow(amount);
        break;
      case 'repay':
        await actions.repayAll();
        break;
      case 'withdraw':
        if (amount === 0n) return;
        await actions.withdrawCollateral(amount);
        break;
    }
    if (actions.step === 'success') {
      setInputVal('');
    }
  }

  const isBusy = ['approving', 'depositing', 'withdrawing', 'borrowing', 'repaying'].includes(actions.step);

  const bdxPriceNum = stats.bdxPrice > 0n
    ? parseFloat(formatUnits(stats.bdxPrice, 18))
    : 0;

  const collateralUSD = position.collateral > 0n && bdxPriceNum > 0
    ? (parseFloat(formatUnits(position.collateral, 18)) * bdxPriceNum).toFixed(2)
    : null;

  // Quick % buttons using real wallet balances
  function setHalf() {
    if (!actionType) return;
    if (actionType === 'deposit') {
      const bal = parseFloat(formatUnits(balances.bdx, 18));
      setInputVal((bal / 2).toFixed(6));
    } else if (actionType === 'borrow') {
      const max  = parseFloat(formatUnits(position.maxBorrowable, 18));
      const debt = parseFloat(formatUnits(position.borrowed + position.interest, 18));
      setInputVal((Math.max(0, max - debt) / 2).toFixed(6));
    } else if (actionType === 'withdraw') {
      setInputVal((parseFloat(formatUnits(position.collateral, 18)) / 2).toFixed(6));
    }
  }

  function setMax() {
    if (!actionType) return;
    if (actionType === 'deposit') {
      // Leave a tiny buffer for gas — show full BDX balance
      const bal = parseFloat(formatUnits(balances.bdx, 18));
      setInputVal(bal.toFixed(6));
    } else if (actionType === 'borrow') {
      const max  = parseFloat(formatUnits(position.maxBorrowable, 18));
      const debt = parseFloat(formatUnits(position.borrowed + position.interest, 18));
      setInputVal((Math.max(0, (max - debt) * 0.99)).toFixed(6));
    } else if (actionType === 'withdraw') {
      setInputVal(parseFloat(formatUnits(position.collateral, 18)).toFixed(6));
    }
  }

  // Balance label for current action input
  function getBalanceLabel(): string {
    if (actionType === 'deposit')  return `Balance: ${parseFloat(formatUnits(balances.bdx, 18)).toFixed(4)} BDX`;
    if (actionType === 'borrow')   return `Available: ${fmtBig(position.maxBorrowable)} MUSDC`;
    if (actionType === 'withdraw') return `Deposited: ${fmtBig(position.collateral)} BDX`;
    return '';
  }

  return (
    <div className="animate-fade-in space-y-6">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold text-ink">BDX Market</h1>
          <p className="mt-0.5 text-xs text-ink-secondary">
            Deposit BDX as collateral and borrow MUSDC.
          </p>
        </div>
        {/* Protocol-level stats */}
        <div className="flex flex-wrap items-center gap-5">
          <div className="text-right">
            <p className="text-xs text-ink-faint">Total Supply</p>
            <p className="text-sm font-semibold text-ink tabular-nums">{fmtBig(stats.totalCollateral)} BDX</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-ink-faint">Total Borrow</p>
            <p className="text-sm font-semibold text-ink tabular-nums">{fmtBig(stats.totalBorrowed)} MUSDC</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-ink-faint">Available</p>
            <p className="text-sm font-semibold text-ink tabular-nums">{fmtBig(stats.reserveBalance)} MUSDC</p>
          </div>
        </div>
      </div>

      {/* ── Market table ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-base-border bg-base-card overflow-hidden">

        {/* Table header */}
        <div className="grid grid-cols-7 gap-4 px-5 py-3 border-b border-base-border bg-base-surface text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
          <div className="col-span-2">Asset</div>
          <div className="text-right">LTV</div>
          <div className="text-right">Supply APY</div>
          <div className="text-right">Available</div>
          <div className="text-right">Borrow APY</div>
          <div className="text-right">Utilization</div>
        </div>

        {/* BDX row */}
        <button
          onClick={() => openAction('deposit')}
          className="grid grid-cols-7 gap-4 w-full px-5 py-4 hover:bg-base-elevated transition-colors text-left"
        >
          {/* Asset */}
          <div className="col-span-2 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/bulldex-logo.png" alt="BDX" className="h-9 w-9 rounded-full object-cover shrink-0" />
            <div>
              <p className="text-sm font-semibold text-ink">Bulldex Finance</p>
              <p className="text-xs text-ink-faint">BDX</p>
            </div>
          </div>
          {/* LTV */}
          <div className="text-right self-center">
            <p className="text-sm font-semibold text-ink">75.00%</p>
          </div>
          {/* Supply APY */}
          <div className="text-right self-center">
            <p className="text-sm font-semibold text-green">—</p>
            <p className="text-[11px] text-ink-faint">Collateral only</p>
          </div>
          {/* Available */}
          <div className="text-right self-center">
            <p className="text-sm font-semibold text-ink tabular-nums">{fmtBig(stats.reserveBalance)}</p>
            <p className="text-[11px] text-ink-faint">MUSDC</p>
          </div>
          {/* Borrow APY */}
          <div className="text-right self-center">
            <p className="text-sm font-semibold text-ink">~5%</p>
            <p className="text-[11px] text-ink-faint">APR</p>
          </div>
          {/* Utilization */}
          <div className="text-right self-center flex items-center justify-end gap-2">
            <UtilRing pct={utilization} />
            <span className="text-sm font-semibold text-ink tabular-nums">{utilization.toFixed(2)}%</span>
          </div>
        </button>
      </div>

      {/* ── Your position ────────────────────────────────────────────── */}
      {isConnected && (
        <div className="rounded-2xl border border-base-border bg-base-card">
          <div className="px-5 py-4 border-b border-base-border flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">Your Position</p>
            {position.isLiquidatable && (
              <div className="flex items-center gap-1.5 rounded-lg border border-red/20 bg-red/5 px-2.5 py-1">
                <AlertTriangle className="h-3 w-3 text-red" strokeWidth={1.5} />
                <span className="text-[11px] text-red font-medium">At risk of liquidation</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-base-border">
            <PositionCell label="Collateral" value={`${fmtBig(position.collateral)} BDX`} sub={collateralUSD ? `$${collateralUSD}` : undefined} />
            <PositionCell label="Borrowed" value={`${fmtBig(position.borrowed)} MUSDC`} />
            <PositionCell label="Interest" value={`${fmtBig(position.interest)} MUSDC`} />
            <div className="p-4">
              <p className="text-xs text-ink-faint mb-1">Health Factor</p>
              <p className={cn('text-xl font-semibold tabular-nums', hfColor)}>{hfDisplay}</p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-base-elevated overflow-hidden">
                <div className={cn('h-full rounded-full transition-all',
                  position.healthFactorNum < 1.1 ? 'bg-red' :
                  position.healthFactorNum < 1.5 ? 'bg-yellow' : 'bg-green'
                )} style={{ width: `${Math.min(100, Math.max(0, ((position.healthFactorNum - 1) / 3) * 100))}%` }} />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-5 py-4 border-t border-base-border flex flex-wrap gap-2">
            <ActionBtn label="Deposit BDX" onClick={() => openAction('deposit')} primary />
            <ActionBtn label="Borrow MUSDC" onClick={() => openAction('borrow')} disabled={position.collateral === 0n} />
            <ActionBtn label="Repay" onClick={() => openAction('repay')} disabled={position.borrowed === 0n && position.interest === 0n} />
            <ActionBtn label="Withdraw" onClick={() => openAction('withdraw')} disabled={position.collateral === 0n} />
          </div>
        </div>
      )}

      {/* ── Market params ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-base-border bg-base-card p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-faint">Market Details</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Collateral asset', value: 'BDX' },
            { label: 'Borrow asset', value: 'MUSDC' },
            { label: 'LTV ratio', value: '75%' },
            { label: 'Liq. threshold', value: '80%' },
            { label: 'Liq. bonus', value: '5%' },
            { label: 'Interest rate', value: '~5% APR' },
            { label: 'Oracle', value: 'BDX/MUSDC pool' },
            { label: 'Contract',
              value: (
                <a href={etherscanUrl('0x13aCAB0d760E54Fb9Ab73ff0bF39CAc7D74FD5cF', 'address')}
                  target="_blank" rel="noopener noreferrer"
                  className="text-brand hover:opacity-70 transition-opacity"
                  onClick={e => e.stopPropagation()}>
                  View
                </a>
              )
            },
          ].map((item, i) => (
            <div key={i} className="rounded-xl bg-base-surface px-3 py-2.5">
              <p className="text-[10px] text-ink-faint">{item.label}</p>
              <p className="text-sm font-semibold text-ink mt-0.5">{item.value as React.ReactNode}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Connect prompt ───────────────────────────────────────────── */}
      {!isConnected && (
        <div className="rounded-2xl border border-base-border bg-base-card p-8 text-center">
          <p className="text-sm font-semibold text-ink mb-1">Connect wallet to manage your position</p>
          <p className="text-xs text-ink-secondary mb-5">Deposit BDX collateral and borrow MUSDC</p>
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button onClick={openConnectModal}
                className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-base-bg hover:bg-brand-dark transition-all">
                Connect Wallet
              </button>
            )}
          </ConnectButton.Custom>
        </div>
      )}

      {/* ── Action panel (modal) ─────────────────────────────────────── */}
      {actionType && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={closeAction} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-4">
            <div className="rounded-2xl border border-base-border bg-base-card shadow-elevated overflow-hidden">

              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-base-border">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/bulldex-logo.png" alt="BDX" className="h-7 w-7 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-ink capitalize">{actionType} BDX</p>
                    <p className="text-[11px] text-ink-faint">BDX Market</p>
                  </div>
                </div>
                <button onClick={closeAction} className="text-ink-faint hover:text-ink transition-colors">
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 divide-x divide-base-border border-b border-base-border">
                <div className="px-4 py-3 text-center">
                  <p className="text-[10px] text-ink-faint">Your Collateral</p>
                  <p className="text-sm font-semibold text-ink tabular-nums">{fmtBig(position.collateral)} BDX</p>
                </div>
                <div className="px-4 py-3 text-center">
                  <p className="text-[10px] text-ink-faint">Max Borrow</p>
                  <p className="text-sm font-semibold text-ink tabular-nums">{fmtBig(position.maxBorrowable)} MUSDC</p>
                </div>
                <div className="px-4 py-3 text-center">
                  <p className="text-[10px] text-ink-faint">Health</p>
                  <p className={cn('text-sm font-semibold tabular-nums', hfColor)}>{hfDisplay}</p>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Input */}
                {actionType !== 'repay' ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-ink-faint capitalize">
                        {actionType} {actionType === 'borrow' ? 'MUSDC' : 'BDX'}
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-ink-faint">{getBalanceLabel()}</span>
                        <button onClick={setHalf} className="rounded-md bg-base-elevated px-2 py-0.5 text-[10px] font-semibold text-ink-secondary hover:text-ink transition-colors">HALF</button>
                        <button onClick={setMax}  className="rounded-md bg-base-elevated px-2 py-0.5 text-[10px] font-semibold text-ink-secondary hover:text-ink transition-colors">MAX</button>
                      </div>
                    </div>
                    <div className="rounded-xl bg-base-surface p-4 flex items-center gap-3">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={inputVal}
                        onChange={e => setInputVal(e.target.value)}
                        className="tabular-nums min-w-0 flex-1 bg-transparent text-2xl font-normal text-ink placeholder:text-ink-faint focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="shrink-0 rounded-lg bg-base-elevated px-2.5 py-1.5 text-xs font-semibold text-ink">
                        {actionType === 'borrow' ? 'MUSDC' : 'BDX'}
                      </span>
                    </div>
                    {/* Est. yearly earnings for borrow */}
                    {actionType === 'borrow' && amount > 0n && (
                      <p className="mt-2 text-xs text-ink-faint">
                        Est. yearly interest: {(parseFloat(formatUnits(amount, 18)) * 0.05).toFixed(2)} MUSDC
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl bg-base-surface px-4 py-3 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-ink-faint">Principal</span>
                      <span className="text-ink font-semibold">{fmtBig(position.borrowed)} MUSDC</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-ink-faint">Accrued interest</span>
                      <span className="text-ink font-semibold">{fmtBig(position.interest)} MUSDC</span>
                    </div>
                    <div className="flex justify-between text-xs border-t border-base-border pt-2">
                      <span className="text-ink-faint font-semibold">Total to repay</span>
                      <span className="text-ink font-semibold">{fmtBig(position.borrowed + position.interest)} MUSDC</span>
                    </div>
                  </div>
                )}

                {/* State feedback */}
                {actions.step === 'success' && (
                  <div className="flex items-center gap-2 rounded-xl border border-green/20 bg-green/5 px-4 py-2.5">
                    <CheckCircle2 className="h-4 w-4 text-green shrink-0" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-green">Transaction complete!</p>
                      {actions.txHash && (
                        <a href={etherscanUrl(actions.txHash, 'tx')} target="_blank" rel="noopener noreferrer"
                          className="text-[11px] text-ink-faint hover:text-ink-secondary transition-colors">
                          {shortenHash(actions.txHash)}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {actions.step === 'error' && (
                  <div className="flex items-start gap-2 rounded-xl border border-red/20 bg-red/5 px-4 py-2.5">
                    <XCircle className="h-4 w-4 text-red shrink-0 mt-0.5" strokeWidth={1.5} />
                    <p className="text-xs text-red leading-relaxed">{actions.error}</p>
                  </div>
                )}

                {/* Action button */}
                {!isConnected ? (
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <button onClick={openConnectModal}
                        className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-base-bg hover:bg-brand-dark transition-all">
                        Connect Wallet
                      </button>
                    )}
                  </ConnectButton.Custom>
                ) : isBusy ? (
                  <button disabled className="flex w-full items-center justify-center gap-2 rounded-xl bg-base-elevated py-3 text-sm font-medium text-ink-secondary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {actions.step === 'approving' ? 'Approving...' :
                     actions.step === 'depositing' ? 'Depositing...' :
                     actions.step === 'borrowing' ? 'Borrowing...' :
                     actions.step === 'repaying' ? 'Repaying...' : 'Withdrawing...'}
                  </button>
                ) : actions.step === 'success' ? (
                  <button onClick={closeAction}
                    className="w-full rounded-xl border border-base-border bg-base-elevated py-2.5 text-sm font-medium text-ink-secondary hover:text-ink transition-colors">
                    Done
                  </button>
                ) : actions.step === 'error' ? (
                  <button onClick={actions.reset}
                    className="w-full rounded-xl border border-base-border bg-base-elevated py-2.5 text-sm font-medium text-ink-secondary hover:text-ink transition-colors">
                    Try again
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={actionType !== 'repay' && amount === 0n}
                    className={cn(
                      'w-full rounded-xl py-3 text-sm font-semibold transition-all',
                      actionType !== 'repay' && amount === 0n
                        ? 'bg-base-elevated text-ink-faint cursor-not-allowed'
                        : 'bg-brand text-base-bg hover:bg-brand-dark',
                    )}>
                    {actionType === 'deposit'  ? 'Deposit BDX' :
                     actionType === 'borrow'   ? 'Borrow MUSDC' :
                     actionType === 'repay'    ? 'Repay Full Debt' :
                                                  'Withdraw BDX'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function UtilRing({ pct }: { pct: number }) {
  const r = 10;
  const circ = 2 * Math.PI * r;
  const fill = (pct / 100) * circ;
  // Use token values: red=#F87171, yellow=#FCD34D, green=#4ADE80
  const color = pct > 80 ? 'var(--color-red, #F87171)' : pct > 50 ? 'var(--color-yellow, #FCD34D)' : 'var(--color-green, #4ADE80)';
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" className="shrink-0">
      <circle cx="14" cy="14" r={r} fill="none" stroke="#1E1F24" strokeWidth="4" />
      <circle cx="14" cy="14" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${fill} ${circ - fill}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        transform="rotate(-90 14 14)"
      />
    </svg>
  );
}

function PositionCell({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="p-4">
      <p className="text-xs text-ink-faint mb-1">{label}</p>
      <p className="text-sm font-semibold text-ink tabular-nums">{value}</p>
      {sub && <p className="text-[11px] text-ink-faint mt-0.5">{sub}</p>}
    </div>
  );
}

function ActionBtn({ label, onClick, primary, disabled }: {
  label: string; onClick: () => void; primary?: boolean; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all',
        disabled ? 'opacity-30 cursor-not-allowed bg-base-elevated text-ink-faint' :
        primary ? 'bg-brand text-base-bg hover:bg-brand-dark' :
        'border border-base-border bg-base-elevated text-ink-secondary hover:text-ink hover:border-base-border-light',
      )}>
      {label}
      {!disabled && <ChevronRight className="h-3 w-3" strokeWidth={1.5} />}
    </button>
  );
}

function fmtBig(v: bigint | undefined): string {
  if (v === undefined || v === null) return '0';
  const n = parseFloat(formatUnits(v, 18));
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(2)}K`;
  return n.toFixed(2);
}
