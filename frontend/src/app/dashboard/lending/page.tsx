'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatUnits } from 'viem';
import { CheckCircle2, XCircle, Loader2, X, AlertTriangle } from 'lucide-react';
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
type TabType    = 'markets' | 'positions';

export default function LendingPage() {
  const { address, isConnected } = useAccount();
  const [tab, setTab]             = useState<TabType>('markets');
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [inputVal, setInputVal]   = useState('');

  const stats    = useLendingStats();
  const position = useLendingPosition(address);
  const actions  = useLendingActions(address);
  const balances = useTokenBalances(address);

  const amount = parseTokenAmount(inputVal);

  // Escape key closes modal
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') closeAction(); }
    if (actionType) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [actionType]); // eslint-disable-line react-hooks/exhaustive-deps

  // Health factor display
  const hfDisplay = !position.collateral || position.collateral === 0n
    ? '--'
    : position.healthFactorNum === Infinity ? '∞'
    : position.healthFactorNum > 999 ? '>999'
    : position.healthFactorNum.toFixed(2);

  const hfColor = position.healthFactorNum < 1.1 ? 'text-red'
    : position.healthFactorNum < 1.5 ? 'text-yellow'
    : 'text-green';

  // Utilization = borrowed / (borrowed + reserve)
  const utilPct = stats.totalBorrowed > 0n && (stats.reserveBalance + stats.totalBorrowed) > 0n
    ? Math.min(100, (Number(stats.totalBorrowed) / Number(stats.reserveBalance + stats.totalBorrowed)) * 100)
    : 0;

  const bdxPriceNum = stats.bdxPrice > 0n ? parseFloat(formatUnits(stats.bdxPrice, 18)) : 0;
  const collateralUSD = position.collateral > 0n && bdxPriceNum > 0
    ? (parseFloat(formatUnits(position.collateral, 18)) * bdxPriceNum).toFixed(2)
    : null;

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
    if (!isConnected || !address || !actionType) return;
    switch (actionType) {
      case 'deposit':  if (amount === 0n) return; await actions.depositCollateral(amount); break;
      case 'borrow':   if (amount === 0n) return; await actions.borrow(amount); break;
      case 'repay':    if (amount === 0n) return; await actions.repay(amount); break;
      case 'withdraw': if (amount === 0n) return; await actions.withdrawCollateral(amount); break;
    }
    if (actions.step === 'success') setInputVal('');
  }

  const isBusy = ['approving', 'depositing', 'withdrawing', 'borrowing', 'repaying'].includes(actions.step);

  // HALF / MAX helpers
  function setHalf() {
    if (!actionType) return;
    if (actionType === 'deposit')  setInputVal((parseFloat(formatUnits(balances.bdx, 18)) / 2).toFixed(6));
    if (actionType === 'borrow')   setInputVal((Math.max(0, parseFloat(formatUnits(position.maxBorrowable, 18)) - parseFloat(formatUnits(position.borrowed + position.interest, 18))) / 2).toFixed(6));
    if (actionType === 'repay')    setInputVal((parseFloat(formatUnits(position.borrowed + position.interest, 18)) / 2).toFixed(6));
    if (actionType === 'withdraw') setInputVal((parseFloat(formatUnits(position.collateral, 18)) / 2).toFixed(6));
  }
  function setMax() {
    if (!actionType) return;
    if (actionType === 'deposit')  setInputVal(parseFloat(formatUnits(balances.bdx, 18)).toFixed(6));
    if (actionType === 'borrow')   setInputVal((Math.max(0, (parseFloat(formatUnits(position.maxBorrowable, 18)) - parseFloat(formatUnits(position.borrowed + position.interest, 18))) * 0.99)).toFixed(6));
    if (actionType === 'repay')    setInputVal(parseFloat(formatUnits(position.borrowed + position.interest, 18)).toFixed(6));
    if (actionType === 'withdraw') setInputVal(parseFloat(formatUnits(position.collateral, 18)).toFixed(6));
  }
  function getBalanceLabel(): string {
    if (actionType === 'deposit')  return `Balance: ${parseFloat(formatUnits(balances.bdx, 18)).toFixed(4)} BDX`;
    if (actionType === 'borrow')   return `Available: ${fmtBig(position.maxBorrowable)} MUSDC`;
    if (actionType === 'repay')    return `Debt: ${fmtBig(position.borrowed + position.interest)} MUSDC`;
    if (actionType === 'withdraw') return `Deposited: ${fmtBig(position.collateral)} BDX`;
    return '';
  }

  const hasPosition = position.collateral > 0n || position.borrowed > 0n;

  return (
    <div className="animate-fade-in space-y-6">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">Lending Markets</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Deposit BDX as collateral or borrow MUSDC against it.
          </p>
        </div>
        {/* Tab toggle */}
        <div className="flex items-center rounded-xl border border-base-border bg-base-card p-1 shrink-0">
          <button
            onClick={() => setTab('markets')}
            className={cn(
              'rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors',
              tab === 'markets' ? 'bg-base-elevated text-ink' : 'text-ink-secondary hover:text-ink',
            )}>
            All Markets
          </button>
          <button
            onClick={() => setTab('positions')}
            className={cn(
              'rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors',
              tab === 'positions' ? 'bg-base-elevated text-ink' : 'text-ink-secondary hover:text-ink',
            )}>
            My Positions
          </button>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Total Supplied */}
        <div className="rounded-2xl border border-base-border bg-base-card p-5">
          <p className="text-xs text-ink-faint mb-1">Total Supplied</p>
          <p className="text-2xl font-semibold text-ink tabular-nums">
            {fmtBig(stats.totalCollateral)} BDX
          </p>
          <p className="mt-1 text-xs text-ink-faint">collateral deposited</p>
        </div>

        {/* Total Borrowed */}
        <div className="rounded-2xl border border-base-border bg-base-card p-5">
          <p className="text-xs text-ink-faint mb-1">Total Borrowed</p>
          <p className="text-2xl font-semibold text-ink tabular-nums">
            {fmtBig(stats.totalBorrowed)} MUSDC
          </p>
          <p className="mt-1 text-xs text-green text-xs">~5% APR</p>
        </div>

        {/* Borrow Limit Used */}
        <div className="rounded-2xl border border-base-border bg-base-card p-5">
          <div className="flex items-start justify-between mb-1">
            <p className="text-xs text-ink-faint">Borrow Limit Used</p>
            <p className="text-xs text-ink-faint">
              Limit: {fmtBig(stats.reserveBalance + stats.totalBorrowed)} MUSDC
            </p>
          </div>
          <p className="text-2xl font-semibold text-ink tabular-nums mb-3">
            {utilPct.toFixed(1)}%
          </p>
          <div className="h-2 w-full rounded-full bg-base-elevated overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500',
                utilPct > 80 ? 'bg-red' : utilPct > 60 ? 'bg-yellow' : 'bg-green'
              )}
              style={{ width: `${utilPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── All Markets tab ──────────────────────────────────────────── */}
      {tab === 'markets' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

          {/* Supply Markets */}
          <div className="rounded-2xl border border-base-border bg-base-card overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-base-border">
              <svg className="h-4 w-4 text-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
              </svg>
              <h2 className="text-sm font-semibold text-ink">Supply Markets</h2>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-10 gap-2 px-5 py-2.5 border-b border-base-border bg-base-surface text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
              <div className="col-span-4">Asset</div>
              <div className="col-span-2 text-right">APY</div>
              <div className="col-span-2 text-right">Total Supplied</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            {/* BDX row */}
            <div className="grid grid-cols-10 gap-2 px-5 py-4 items-center hover:bg-base-elevated/40 transition-colors">
              <div className="col-span-4 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/bdx-token.png" alt="BDX" className="h-9 w-9 rounded-full object-cover shrink-0" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-ink">BDX</p>
                    <span className="rounded bg-brand/15 px-1.5 py-0.5 text-[9px] font-bold text-brand uppercase tracking-wide">Native</span>
                  </div>
                  <p className="text-[11px] text-ink-faint">Bulldex Token</p>
                </div>
              </div>
              <div className="col-span-2 text-right">
                <p className="text-sm font-semibold text-ink-secondary">--</p>
                <p className="text-[10px] text-ink-faint">Collateral only</p>
              </div>
              <div className="col-span-2 text-right">
                <p className="text-sm font-semibold text-ink tabular-nums">{fmtBig(stats.totalCollateral)}</p>
                <p className="text-[11px] text-ink-faint">BDX</p>
              </div>
              <div className="col-span-2 flex justify-end">
                <button
                  onClick={() => openAction('deposit')}
                  className="rounded-xl border border-brand/40 bg-brand/10 px-4 py-1.5 text-xs font-semibold text-brand hover:bg-brand/20 transition-colors">
                  Supply
                </button>
              </div>
            </div>
          </div>

          {/* Borrow Markets */}
          <div className="rounded-2xl border border-base-border bg-base-card overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-base-border">
              <svg className="h-4 w-4 text-ink-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>
              <h2 className="text-sm font-semibold text-ink">Borrow Markets</h2>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-10 gap-2 px-5 py-2.5 border-b border-base-border bg-base-surface text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
              <div className="col-span-4">Asset</div>
              <div className="col-span-2 text-right">Borrow APY</div>
              <div className="col-span-2 text-right">Available Liq.</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            {/* MUSDC row */}
            <div className="grid grid-cols-10 gap-2 px-5 py-4 items-center hover:bg-base-elevated/40 transition-colors">
              <div className="col-span-4 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/musdc-icon.svg" alt="MUSDC" className="h-9 w-9 rounded-full object-cover shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-ink">MUSDC</p>
                  <p className="text-[11px] text-ink-faint">Mock USDC</p>
                </div>
              </div>
              <div className="col-span-2 text-right">
                <p className="text-sm font-semibold text-green tabular-nums">~5.00%</p>
                <p className="text-[10px] text-ink-faint">APR</p>
              </div>
              <div className="col-span-2 text-right">
                <p className="text-sm font-semibold text-ink tabular-nums">{fmtBig(stats.reserveBalance)}</p>
                <p className="text-[11px] text-ink-faint">MUSDC</p>
              </div>
              <div className="col-span-2 flex justify-end">
                <button
                  onClick={() => openAction('borrow')}
                  disabled={!isConnected || position.collateral === 0n}
                  className={cn(
                    'rounded-xl px-4 py-1.5 text-xs font-semibold transition-colors',
                    !isConnected || position.collateral === 0n
                      ? 'bg-base-elevated text-ink-faint cursor-not-allowed'
                      : 'border border-base-border bg-base-elevated text-ink-secondary hover:text-ink hover:border-base-border-light',
                  )}>
                  Borrow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── My Positions tab ─────────────────────────────────────────── */}
      {tab === 'positions' && (
        <>
          {!isConnected ? (
            <div className="rounded-2xl border border-base-border bg-base-card p-10 flex flex-col items-center gap-4 text-center">
              <p className="text-sm font-semibold text-ink">Connect your wallet</p>
              <p className="text-xs text-ink-secondary">View and manage your lending position</p>
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button onClick={openConnectModal}
                    className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-base-bg hover:bg-brand-dark transition-all">
                    Connect Wallet
                  </button>
                )}
              </ConnectButton.Custom>
            </div>
          ) : !hasPosition ? (
            <div className="rounded-2xl border border-base-border bg-base-card p-10 flex flex-col items-center gap-4 text-center">
              <p className="text-sm font-semibold text-ink">No active position</p>
              <p className="text-xs text-ink-secondary">Deposit BDX as collateral to get started</p>
              <button
                onClick={() => { setTab('markets'); openAction('deposit'); }}
                className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-base-bg hover:bg-brand-dark transition-all">
                Deposit BDX
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Position header */}
              <div className="rounded-2xl border border-base-border bg-base-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-base-border">
                  <h2 className="text-sm font-semibold text-ink">Your Position</h2>
                  {position.isLiquidatable && (
                    <div className="flex items-center gap-1.5 rounded-lg border border-red/20 bg-red/5 px-2.5 py-1">
                      <AlertTriangle className="h-3 w-3 text-red" strokeWidth={1.5} />
                      <span className="text-[11px] text-red font-medium">At risk of liquidation</span>
                    </div>
                  )}
                </div>

                {/* 4 position stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 divide-x-0 sm:divide-x divide-base-border">
                  <div className="p-5">
                    <p className="text-[11px] text-ink-faint mb-1">Collateral</p>
                    <p className="text-lg font-semibold text-ink tabular-nums">{fmtBig(position.collateral)} BDX</p>
                    {collateralUSD && <p className="text-xs text-ink-faint mt-0.5">${collateralUSD}</p>}
                  </div>
                  <div className="p-5">
                    <p className="text-[11px] text-ink-faint mb-1">Borrowed</p>
                    <p className="text-lg font-semibold text-ink tabular-nums">{fmtBig(position.borrowed)} MUSDC</p>
                    <p className="text-xs text-ink-faint mt-0.5">+ {fmtBig(position.interest)} interest</p>
                  </div>
                  <div className="p-5">
                    <p className="text-[11px] text-ink-faint mb-1">Borrow Capacity</p>
                    <p className="text-lg font-semibold text-ink tabular-nums">{fmtBig(position.maxBorrowable)} MUSDC</p>
                    <p className="text-xs text-ink-faint mt-0.5">75% LTV</p>
                  </div>
                  <div className="p-5">
                    <p className="text-[11px] text-ink-faint mb-1">Health Factor</p>
                    <p className={cn('text-lg font-semibold tabular-nums', hfColor)}>{hfDisplay}</p>
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
                  <button onClick={() => openAction('deposit')}
                    className="rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-base-bg hover:bg-brand-dark transition-all">
                    Deposit BDX
                  </button>
                  <button onClick={() => openAction('borrow')} disabled={position.collateral === 0n}
                    className="rounded-xl border border-base-border bg-base-elevated px-4 py-2 text-xs font-semibold text-ink-secondary hover:text-ink hover:border-base-border-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    Borrow MUSDC
                  </button>
                  <button onClick={() => openAction('repay')} disabled={position.borrowed === 0n && position.interest === 0n}
                    className="rounded-xl border border-base-border bg-base-elevated px-4 py-2 text-xs font-semibold text-ink-secondary hover:text-ink hover:border-base-border-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    Repay
                  </button>
                  <button onClick={() => openAction('withdraw')} disabled={position.collateral === 0n}
                    className="rounded-xl border border-base-border bg-base-elevated px-4 py-2 text-xs font-semibold text-ink-secondary hover:text-ink hover:border-base-border-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    Withdraw
                  </button>
                </div>
              </div>

              {/* Market details */}
              <div className="rounded-2xl border border-base-border bg-base-card p-5">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-faint">Market Details</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Collateral', value: 'BDX' },
                    { label: 'Borrow asset', value: 'MUSDC' },
                    { label: 'Max LTV', value: '75%' },
                    { label: 'Liq. threshold', value: '80%' },
                    { label: 'Liq. bonus', value: '5%' },
                    { label: 'Interest rate', value: '~5% APR' },
                    { label: 'Oracle', value: 'BDX/MUSDC pool' },
                    {
                      label: 'Contract',
                      value: (
                        <a href={etherscanUrl('0x13aCAB0d760E54Fb9Ab73ff0bF39CAc7D74FD5cF', 'address')}
                          target="_blank" rel="noopener noreferrer"
                          className="text-brand hover:opacity-70 transition-opacity">
                          View
                        </a>
                      ),
                    },
                  ].map((item, i) => (
                    <div key={i} className="rounded-xl bg-base-surface px-3 py-2.5">
                      <p className="text-[10px] text-ink-faint">{item.label}</p>
                      <p className="text-sm font-semibold text-ink mt-0.5">{item.value as React.ReactNode}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Quick deposit CTA shown on markets tab when no position */}
      {tab === 'markets' && isConnected && !hasPosition && (
        <div className="rounded-2xl border border-brand/20 bg-brand/5 px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-ink">Start by depositing BDX</p>
            <p className="text-xs text-ink-secondary mt-0.5">Deposit BDX as collateral to unlock MUSDC borrowing.</p>
          </div>
          <button onClick={() => openAction('deposit')}
            className="shrink-0 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-base-bg hover:bg-brand-dark transition-all">
            Deposit BDX
          </button>
        </div>
      )}

      {/* Connect CTA on markets tab when not connected */}
      {tab === 'markets' && !isConnected && (
        <div className="rounded-2xl border border-base-border bg-base-card p-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-ink">Connect wallet to interact</p>
            <p className="text-xs text-ink-secondary mt-0.5">View and manage your BDX lending position.</p>
          </div>
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button onClick={openConnectModal}
                className="shrink-0 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-base-bg hover:bg-brand-dark transition-all">
                Connect Wallet
              </button>
            )}
          </ConnectButton.Custom>
        </div>
      )}

      {/* ── Action modal ─────────────────────────────────────────────── */}
      {actionType && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={closeAction} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-4">
            <div className="rounded-2xl border border-base-border bg-base-card shadow-elevated overflow-hidden">

              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-base-border">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={actionType === 'borrow' || actionType === 'repay' ? '/musdc-icon.svg' : '/bdx-token.png'}
                    alt={actionType === 'borrow' || actionType === 'repay' ? 'MUSDC' : 'BDX'}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {actionType === 'deposit'  ? 'Deposit BDX' :
                       actionType === 'borrow'   ? 'Borrow MUSDC' :
                       actionType === 'repay'    ? 'Repay MUSDC' :
                                                   'Withdraw BDX'}
                    </p>
                    <p className="text-[11px] text-ink-faint">BDX Market</p>
                  </div>
                </div>
                <button onClick={closeAction} className="text-ink-faint hover:text-ink transition-colors p-1">
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* Position context row */}
              <div className="grid grid-cols-3 divide-x divide-base-border border-b border-base-border">
                <div className="px-4 py-3 text-center">
                  <p className="text-[10px] text-ink-faint">Collateral</p>
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
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-ink-faint">
                      {actionType === 'deposit' ? 'Deposit BDX' : actionType === 'borrow' ? 'Borrow MUSDC' : actionType === 'repay' ? 'Repay MUSDC' : 'Withdraw BDX'}
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-ink-faint">{getBalanceLabel()}</span>
                      <button onClick={setHalf} className="rounded-md bg-base-elevated px-2 py-0.5 text-[10px] font-semibold text-ink-secondary hover:text-ink transition-colors">HALF</button>
                      <button onClick={setMax}  className="rounded-md bg-base-elevated px-2 py-0.5 text-[10px] font-semibold text-ink-secondary hover:text-ink transition-colors">MAX</button>
                    </div>
                  </div>
                  <div className="rounded-xl bg-base-surface p-4 flex items-center gap-3">
                    <input
                      type="number" placeholder="0.00" value={inputVal}
                      onChange={e => setInputVal(e.target.value)}
                      className="tabular-nums min-w-0 flex-1 bg-transparent text-2xl font-normal text-ink placeholder:text-ink-faint focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="shrink-0 rounded-lg bg-base-elevated px-2.5 py-1.5 text-xs font-semibold text-ink">
                      {actionType === 'borrow' || actionType === 'repay' ? 'MUSDC' : 'BDX'}
                    </span>
                  </div>

                  {actionType === 'repay' && (position.borrowed > 0n || position.interest > 0n) && (
                    <div className="mt-2 rounded-xl bg-base-surface px-3 py-2.5 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-ink-faint">Principal</span>
                        <span className="text-ink tabular-nums">{fmtBig(position.borrowed)} MUSDC</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-ink-faint">Accrued interest</span>
                        <span className="text-ink tabular-nums">{fmtBig(position.interest)} MUSDC</span>
                      </div>
                      <div className="flex justify-between text-xs border-t border-base-border pt-1.5">
                        <span className="text-ink-faint">Total debt</span>
                        <span className="text-ink font-semibold tabular-nums">{fmtBig(position.borrowed + position.interest)} MUSDC</span>
                      </div>
                    </div>
                  )}

                  {actionType === 'borrow' && amount > 0n && (
                    <p className="mt-2 text-xs text-ink-faint">
                      Est. yearly interest: {(parseFloat(formatUnits(amount, 18)) * 0.05).toFixed(2)} MUSDC
                    </p>
                  )}
                </div>

                {/* Feedback */}
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

                {/* CTA */}
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
                  <button onClick={handleSubmit} disabled={amount === 0n}
                    className={cn(
                      'w-full rounded-xl py-3 text-sm font-semibold transition-all',
                      amount === 0n ? 'bg-base-elevated text-ink-faint cursor-not-allowed' : 'bg-brand text-base-bg hover:bg-brand-dark',
                    )}>
                    {actionType === 'deposit' ? 'Deposit BDX' : actionType === 'borrow' ? 'Borrow MUSDC' : actionType === 'repay' ? 'Repay MUSDC' : 'Withdraw BDX'}
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtBig(v: bigint | undefined): string {
  if (v === undefined || v === null) return '0';
  const n = parseFloat(formatUnits(v, 18));
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(2)}K`;
  return n.toFixed(2);
}
