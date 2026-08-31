'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatUnits, parseUnits } from 'viem';
import { CheckCircle2, XCircle, Loader2, X, Zap, Lock, TrendingUp } from 'lucide-react';
import { useStakingStats, useStakingInfo, fmtCountdown, fmtApr } from '@/hooks/useStaking';
import { useStakingActions } from '@/hooks/useStakingActions';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { etherscanUrl, isConfigured, CONTRACT_ADDRESSES } from '@/constants/contracts';
import { shortenHash } from '@/utils/format';
import { cn } from '@/utils/cn';

// ─── Lock period options ──────────────────────────────────────────────────────

const LOCK_OPTIONS = [
  { days: 0,   label: 'No lock',  multiplier: '1.0×', color: 'text-[#a3a3a3]' },
  { days: 30,  label: '30 days',  multiplier: '1.2×', color: 'text-[#10b981]' },
  { days: 90,  label: '90 days',  multiplier: '1.5×', color: 'text-[#22c55e]' },
  { days: 180, label: '180 days', multiplier: '2.0×', color: 'text-[#f59e0b]' },
] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StakingPage() {
  const { address, isConnected } = useAccount();
  const stats   = useStakingStats();
  const info    = useStakingInfo(address);
  const actions = useStakingActions(address);
  const { raw: bdxBalance } = useTokenBalance(address);

  const [modal,      setModal]      = useState<'stake' | 'unstake' | null>(null);
  const [inputVal,   setInputVal]   = useState('');
  const [lockDays,   setLockDays]   = useState<0 | 30 | 90 | 180>(0);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);

  // Close modal on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') closeModal(); }
    if (modal) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal]); // eslint-disable-line react-hooks/exhaustive-deps

  function openModal(type: 'stake' | 'unstake') {
    setModal(type);
    setInputVal('');
    setLockDays(0);
    actions.reset();
  }
  function closeModal() {
    setModal(null);
    setInputVal('');
    actions.reset();
    setShowEmergencyConfirm(false);
  }

  async function handleStake() {
    if (!inputVal || parseFloat(inputVal) <= 0) return;
    const amount = parseUnits(inputVal, 18);
    await actions.stake(amount, lockDays);
    if (actions.step === 'success') setInputVal('');
  }

  async function handleUnstake() {
    if (!inputVal || parseFloat(inputVal) <= 0) return;
    const amount = parseUnits(inputVal, 18);
    await actions.unstake(amount);
  }

  const bdxBalanceNum   = parseFloat(formatUnits(bdxBalance ?? 0n, 18));
  const selectedLock    = LOCK_OPTIONS.find(o => o.days === lockDays)!;
  const hasStaked       = info.amount > 0n;
  const hasPending      = info.pendingRewards > 0n;
  const notDeployed     = !isConfigured(CONTRACT_ADDRESSES.staking);

  // ── APR for selected lock ──────────────────────────────────────────────────
  const aprMap: Record<number, number> = {
    0: stats.aprNoLock, 30: stats.apr30Days, 90: stats.apr90Days, 180: stats.apr180Days,
  };
  const selectedApr = aprMap[lockDays] ?? 0;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in space-y-6">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[28px] font-semibold text-[#f5f5f5] tracking-tight">Staking</h1>
        <p className="mt-1 text-sm text-[#a3a3a3]">
          Stake BDX to earn protocol rewards. Lock longer for boosted yield.
        </p>
      </div>

      {/* ── Not deployed banner ───────────────────────────────────── */}
      {notDeployed && (
        <div className="rounded-lg border border-[rgba(245,158,11,0.15)] bg-[rgba(245,158,11,0.05)] px-5 py-4">
          <p className="text-sm font-semibold text-[#f59e0b]">Contract not deployed yet</p>
          <p className="text-xs text-[#a3a3a3] mt-0.5">
            Set NEXT_PUBLIC_STAKING_ADDRESS in .env.local after running DeployStaking.s.sol
          </p>
        </div>
      )}

      {/* ── Stat cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-[#262626] bg-[#111111] p-5">
          <p className="text-xs text-[#525252] mb-1">Total Staked</p>
          <p className="text-[28px] font-semibold text-[#f5f5f5] tabular-nums">
            {stats.isLoading ? '...' : stats.totalEffectiveStakeFormatted}
          </p>
          <p className="mt-1 text-xs text-[#525252]">effective BDX (weighted)</p>
        </div>

        <div className="rounded-lg border border-[#262626] bg-[#111111] p-5">
          <p className="text-xs text-[#525252] mb-1">Base APR</p>
          <p className={cn('text-2xl font-semibold tabular-nums', stats.isActive ? 'text-[#22c55e]' : 'text-[#525252]')}>
            {stats.isLoading ? '...' : stats.isActive ? fmtApr(stats.aprNoLock) : '—'}
          </p>
          <p className="mt-1 text-xs text-[#525252]">
            {stats.isActive ? 'rewards active' : 'no active reward period'}
          </p>
        </div>

        <div className="rounded-lg border border-[#262626] bg-[#111111] p-5">
          <p className="text-xs text-[#525252] mb-1">Reward Period</p>
          <p className="text-[28px] font-semibold text-[#f5f5f5] tabular-nums">
            {stats.isLoading ? '...' : stats.isActive ? 'Active' : 'Ended'}
          </p>
          {stats.periodFinish > 0n && (
            <p className="mt-1 text-xs text-[#525252]">
              {stats.isActive
                ? `ends ${new Date(Number(stats.periodFinish) * 1000).toLocaleDateString()}`
                : 'waiting for next period'}
            </p>
          )}
        </div>
      </div>

      {/* ── Lock APR comparison ────────────────────────────────────── */}
      <div className="rounded-lg border border-[#262626] bg-[#111111] p-5">
        <h2 className="text-sm font-semibold text-[#f5f5f5] mb-4">Lock Period APR</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {LOCK_OPTIONS.map(opt => (
            <div key={opt.days} className="rounded-md bg-[#161616] p-4 text-center">
              <p className="text-xs text-[#525252] mb-1">{opt.label}</p>
              <p className={cn('text-xl font-semibold tabular-nums', opt.color)}>
                {stats.isLoading ? '...' : fmtApr(aprMap[opt.days] ?? 0)}
              </p>
              <p className="text-[10px] text-[#525252] mt-1">{opt.multiplier} multiplier</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── User position ─────────────────────────────────────────── */}
      {!isConnected ? (
        <div className="rounded-lg border border-[rgba(16,185,129,0.15)] bg-[rgba(16,185,129,0.04)] px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#f5f5f5]">Connect to start staking</p>
            <p className="text-xs text-[#a3a3a3] mt-0.5">Stake BDX and earn protocol rewards.</p>
          </div>
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button onClick={openConnectModal}
                className="shrink-0 rounded-md bg-[#10b981] px-5 py-2.5 text-sm font-semibold text-base-bg hover:bg-[#059669] transition-all active:scale-[0.98]">
                Connect Wallet
              </button>
            )}
          </ConnectButton.Custom>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Left: position stats + actions */}
          <div className="lg:col-span-3 rounded-lg border border-[#262626] bg-[#111111] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#262626]">
              <h2 className="text-sm font-semibold text-[#f5f5f5]">Your Position</h2>
            </div>

            <div className="p-5 space-y-4">
              {/* Staked + Pending grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-[#161616] p-3.5">
                  <p className="text-[10px] text-[#525252] uppercase tracking-wide mb-1">Staked</p>
                  <p className="text-xl font-semibold text-[#f5f5f5] tabular-nums">
                    {info.isLoading ? '...' : info.amountFormatted}
                  </p>
                  <p className="text-xs text-[#525252]">BDX</p>
                </div>
                <div className="rounded-md bg-[#161616] p-3.5">
                  <p className="text-[10px] text-[#525252] uppercase tracking-wide mb-1">Pending Rewards</p>
                  <p className={cn('text-xl font-semibold tabular-nums', hasPending ? 'text-[#22c55e]' : 'text-[#f5f5f5]')}>
                    {info.isLoading ? '...' : info.pendingRewardsFormatted}
                  </p>
                  <p className="text-xs text-[#525252]">BDX</p>
                </div>
              </div>

              {/* Lock status */}
              {hasStaked && (
                <div className="rounded-md bg-[#161616] px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className={cn('h-3.5 w-3.5', info.isLocked ? 'text-[#f59e0b]' : 'text-[#525252]')} strokeWidth={2} />
                    <div>
                      <p className="text-xs font-semibold text-[#f5f5f5]">
                        {info.isLocked ? `Locked — ${info.lockMultiplierFormatted} boost` : 'No lock'}
                      </p>
                      {info.isLocked && info.lockEndDate && (
                        <p className="text-[10px] text-[#525252]">
                          Unlocks {info.lockEndDate}
                          {info.lockTimeRemaining > 0 && ` (${fmtCountdown(info.lockTimeRemaining)} remaining)`}
                        </p>
                      )}
                    </div>
                  </div>
                  {info.isLocked && (
                    <span className="rounded-lg bg-[rgba(245,158,11,0.08)] px-2 py-0.5 text-[10px] font-bold text-[#f59e0b] uppercase">
                      {info.lockMultiplierFormatted}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="border-t border-[#262626] px-5 py-4 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => openModal('stake')}
                  disabled={notDeployed}
                  className="flex items-center justify-center gap-1.5 rounded-md bg-[#10b981] py-2.5 text-xs font-semibold text-base-bg hover:bg-[#059669] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  <TrendingUp className="h-3 w-3" strokeWidth={2.5} />
                  Stake BDX
                </button>
                <button
                  onClick={() => hasPending && actions.claimRewards()}
                  disabled={!hasPending || notDeployed || actions.step === 'claiming'}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-md py-2.5 text-xs font-semibold transition-all',
                    hasPending && !notDeployed
                      ? 'border border-[rgba(34,197,94,0.20)] bg-[#22c55e]/8 text-[#22c55e] hover:bg-[#22c55e]/15 active:scale-[0.98]'
                      : 'border border-[#262626]/40 bg-[#1e1e1e]/40 text-[#525252] cursor-not-allowed',
                  )}>
                  {actions.step === 'claiming'
                    ? <><Loader2 className="h-3 w-3 animate-spin" /> Claiming...</>
                    : <><Zap className="h-3 w-3" strokeWidth={2} /> Claim Rewards</>
                  }
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => hasStaked && !info.isLocked && openModal('unstake')}
                  disabled={!hasStaked || info.isLocked || notDeployed}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold border transition-colors',
                    hasStaked && !info.isLocked && !notDeployed
                      ? 'border-[#262626] bg-[#1e1e1e] text-[#a3a3a3] hover:text-[#f5f5f5] hover:border-[#2e2e2e]'
                      : 'border-[#262626]/40 bg-[#1e1e1e]/40 text-[#525252] cursor-not-allowed',
                  )}>
                  <Lock className="h-3 w-3" strokeWidth={2} />
                  Unstake
                  {info.isLocked && (
                    <span className="rounded bg-[rgba(245,158,11,0.10)] px-1 py-0.5 text-[9px] font-bold text-[#f59e0b]">
                      locked
                    </span>
                  )}
                </button>
                <button
                  onClick={() => hasStaked && setShowEmergencyConfirm(true)}
                  disabled={!hasStaked || notDeployed}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold border transition-colors',
                    hasStaked && !notDeployed
                      ? 'border-[rgba(239,68,68,0.15)] bg-[rgba(239,68,68,0.05)] text-[#ef4444]/70 hover:text-[#ef4444] hover:border-red/30'
                      : 'border-[#262626]/40 bg-[#1e1e1e]/40 text-[#525252] cursor-not-allowed',
                  )}>
                  Emergency Exit
                </button>
              </div>
              {info.isLocked && (
                <p className="text-[10px] text-[#525252] text-center pt-0.5">
                  Unlock date: {info.lockEndDate} · Use Emergency Exit to bypass lock (forfeits rewards)
                </p>
              )}
              {!hasStaked && (
                <p className="text-[10px] text-[#525252] text-center pt-0.5">
                  Stake BDX to start earning rewards.
                </p>
              )}
            </div>

            {/* Claim feedback */}
            {actions.step === 'success' && !modal && (
              <div className="mx-5 mb-4 flex items-center gap-2 rounded-md border border-[rgba(34,197,94,0.15)] bg-[rgba(34,197,94,0.05)] px-4 py-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#22c55e] shrink-0" strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#22c55e]">Transaction complete!</p>
                  {actions.txHash && (
                    <a href={etherscanUrl(actions.txHash, 'tx')} target="_blank" rel="noopener noreferrer"
                      className="text-[11px] text-[#525252] hover:text-[#a3a3a3]">
                      {shortenHash(actions.txHash)}
                    </a>
                  )}
                </div>
                <button onClick={actions.reset} className="text-[#525252] hover:text-[#f5f5f5] p-1">
                  <X className="h-3 w-3" strokeWidth={2} />
                </button>
              </div>
            )}
            {actions.step === 'error' && !modal && (
              <div className="mx-5 mb-4 flex items-start gap-2 rounded-md border border-[rgba(239,68,68,0.15)] bg-[rgba(239,68,68,0.05)] px-4 py-2.5">
                <XCircle className="h-4 w-4 text-[#ef4444] shrink-0 mt-0.5" strokeWidth={1.5} />
                <p className="text-xs text-[#ef4444] flex-1">{actions.error}</p>
                <button onClick={actions.reset} className="text-[#525252] hover:text-[#f5f5f5] p-1">
                  <X className="h-3 w-3" strokeWidth={2} />
                </button>
              </div>
            )}
          </div>

          {/* Right: info card */}
          <div className="lg:col-span-2 rounded-lg border border-[#262626] bg-[#111111] p-5 flex flex-col gap-4">
            <div>
              <p className="text-[10px] text-[#525252] uppercase tracking-wide mb-3">How Staking Works</p>
              <div className="space-y-3">
                {[
                  { n: '1', text: 'Approve BDX and stake any amount.' },
                  { n: '2', text: 'Choose a lock period to boost your APR multiplier.' },
                  { n: '3', text: 'Rewards accumulate every second — claim any time.' },
                  { n: '4', text: 'Unstake after lock expires. Emergency Exit bypasses the lock but forfeits rewards.' },
                ].map(s => (
                  <div key={s.n} className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1e1e1e] text-[10px] font-bold text-[#525252]">
                      {s.n}
                    </span>
                    <p className="text-xs text-[#a3a3a3] leading-relaxed">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-[#262626]" />

            <div className="rounded-md bg-[#161616] divide-y divide-[#1a1a1a] overflow-hidden">
              {[
                { label: 'Staking token', value: 'BDX' },
                { label: 'Reward token',  value: 'BDX' },
                { label: 'Max boost',     value: '2.0× (180d lock)' },
                { label: 'Reward period', value: '7 days per cycle' },
                { label: 'Claim',         value: 'Anytime, no lock' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-[#525252]">{row.label}</span>
                  <span className="text-xs font-semibold text-[#f5f5f5]">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Emergency confirm overlay ─────────────────────────────── */}
      {showEmergencyConfirm && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowEmergencyConfirm(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-4">
            <div className="rounded-lg border border-[rgba(239,68,68,0.15)] bg-[#111111]  p-6 space-y-4">
              <p className="text-sm font-semibold text-[#f5f5f5]">Emergency Exit</p>
              <p className="text-xs text-[#a3a3a3] leading-relaxed">
                This will withdraw all your staked BDX <strong className="text-[#ef4444]">immediately</strong>,
                bypassing any lock period. All pending rewards will be <strong className="text-[#ef4444]">forfeited</strong>.
              </p>
              <p className="text-xs text-[#a3a3a3]">
                Pending rewards to forfeit:{' '}
                <span className="font-semibold text-[#ef4444]">{info.pendingRewardsFormatted} BDX</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowEmergencyConfirm(false)}
                  className="rounded-md border border-[#262626] py-2.5 text-sm font-medium text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors">
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setShowEmergencyConfirm(false);
                    await actions.emergencyWithdraw();
                  }}
                  className="rounded-md bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.15)] py-2.5 text-sm font-semibold text-[#ef4444] hover:bg-[#ef4444]/20 transition-colors">
                  Confirm Exit
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Stake / Unstake Modal ─────────────────────────────────── */}
      {modal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4">
            <div className="rounded-lg border border-[#262626] bg-[#111111]  overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#262626]">
                <p className="text-sm font-semibold text-[#f5f5f5]">
                  {modal === 'stake' ? 'Stake BDX' : 'Unstake BDX'}
                </p>
                <button onClick={closeModal} className="text-[#525252] hover:text-[#f5f5f5] transition-colors p-1">
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* Context row */}
              <div className="grid grid-cols-3 divide-x divide-[#1a1a1a] border-b border-[#262626]">
                <div className="px-4 py-3 text-center">
                  <p className="text-[10px] text-[#525252]">Staked</p>
                  <p className="text-sm font-semibold text-[#f5f5f5] tabular-nums">{info.amountFormatted}</p>
                </div>
                <div className="px-4 py-3 text-center">
                  <p className="text-[10px] text-[#525252]">Balance</p>
                  <p className="text-sm font-semibold text-[#f5f5f5] tabular-nums">
                    {bdxBalanceNum.toFixed(2)}
                  </p>
                </div>
                <div className="px-4 py-3 text-center">
                  <p className="text-[10px] text-[#525252]">Pending</p>
                  <p className="text-sm font-semibold text-[#22c55e] tabular-nums">{info.pendingRewardsFormatted}</p>
                </div>
              </div>

              <div className="p-5 space-y-4">

                {/* Amount input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-[#525252]">
                      {modal === 'stake' ? 'Amount to stake' : 'Amount to unstake'}
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#525252]">
                        {modal === 'stake'
                          ? `Balance: ${bdxBalanceNum.toFixed(4)} BDX`
                          : `Staked: ${info.amountFormatted} BDX`}
                      </span>
                      <button
                        onClick={() => setInputVal(
                          modal === 'stake'
                            ? (bdxBalanceNum / 2).toFixed(6)
                            : (parseFloat(formatUnits(info.amount, 18)) / 2).toFixed(6)
                        )}
                        className="rounded-md bg-[#1e1e1e] px-2 py-0.5 text-[10px] font-semibold text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors">
                        HALF
                      </button>
                      <button
                        onClick={() => setInputVal(
                          modal === 'stake'
                            ? bdxBalanceNum.toFixed(6)
                            : formatUnits(info.amount, 18)
                        )}
                        className="rounded-md bg-[#1e1e1e] px-2 py-0.5 text-[10px] font-semibold text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors">
                        MAX
                      </button>
                    </div>
                  </div>
                  <div className="rounded-md bg-[#161616] p-4 flex items-center gap-3">
                    <input
                      type="number" placeholder="0.00" value={inputVal}
                      onChange={e => setInputVal(e.target.value)}
                      className="tabular-nums min-w-0 flex-1 bg-transparent text-2xl font-normal text-[#f5f5f5] placeholder:text-[#525252] outline-none focus:outline-none ring-0 focus:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="shrink-0 rounded-lg bg-[#1e1e1e] px-2.5 py-1.5 text-xs font-semibold text-[#f5f5f5]">
                      BDX
                    </span>
                  </div>
                </div>

                {/* Lock period (stake only) */}
                {modal === 'stake' && (
                  <div>
                    <p className="text-xs text-[#525252] mb-2">Lock period</p>
                    <div className="grid grid-cols-4 gap-2">
                      {LOCK_OPTIONS.map(opt => (
                        <button
                          key={opt.days}
                          onClick={() => setLockDays(opt.days as 0 | 30 | 90 | 180)}
                          className={cn(
                            'rounded-md py-2 text-center border transition-colors',
                            lockDays === opt.days
                              ? 'border-[#064e3b] bg-[rgba(16,185,129,0.08)] text-[#10b981]'
                              : 'border-[#262626] bg-[#1e1e1e] text-[#a3a3a3] hover:text-[#f5f5f5]',
                          )}>
                          <p className="text-[11px] font-semibold">{opt.label}</p>
                          <p className={cn('text-[10px] mt-0.5', lockDays === opt.days ? 'text-[#10b981]' : opt.color)}>
                            {opt.multiplier}
                          </p>
                        </button>
                      ))}
                    </div>
                    {lockDays > 0 && (
                      <p className="text-[11px] text-[#525252] mt-2">
                        APR with {selectedLock.multiplier} boost:{' '}
                        <span className="font-semibold text-[#22c55e]">{fmtApr(selectedApr)}</span>
                        {' '}· unlock {new Date(Date.now() + lockDays * 86_400_000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                )}

                {/* Feedback */}
                {actions.step === 'success' && (
                  <div className="flex items-center gap-2 rounded-md border border-[rgba(34,197,94,0.15)] bg-[rgba(34,197,94,0.05)] px-4 py-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#22c55e] shrink-0" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#22c55e]">Transaction complete!</p>
                      {actions.txHash && (
                        <a href={etherscanUrl(actions.txHash, 'tx')} target="_blank" rel="noopener noreferrer"
                          className="text-[11px] text-[#525252] hover:text-[#a3a3a3]">
                          {shortenHash(actions.txHash)}
                        </a>
                      )}
                    </div>
                  </div>
                )}
                {actions.step === 'error' && (
                  <div className="flex items-start gap-2 rounded-md border border-[rgba(239,68,68,0.15)] bg-[rgba(239,68,68,0.05)] px-4 py-2.5">
                    <XCircle className="h-4 w-4 text-[#ef4444] shrink-0 mt-0.5" strokeWidth={1.5} />
                    <p className="text-xs text-[#ef4444]">{actions.error}</p>
                  </div>
                )}

                {/* CTA */}
                {actions.step === 'success' ? (
                  <button onClick={closeModal}
                    className="w-full rounded-md border border-[#262626] bg-[#1e1e1e] py-2.5 text-sm font-medium text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors">
                    Done
                  </button>
                ) : actions.step === 'error' ? (
                  <button onClick={actions.reset}
                    className="w-full rounded-md border border-[#262626] bg-[#1e1e1e] py-2.5 text-sm font-medium text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors">
                    Try again
                  </button>
                ) : actions.step === 'approving' ? (
                  <button disabled className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1e1e1e] py-3.5 text-sm font-medium text-[#a3a3a3]">
                    <Loader2 className="h-4 w-4 animate-spin" />Approving BDX...
                  </button>
                ) : actions.step === 'staking' ? (
                  <button disabled className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1e1e1e] py-3.5 text-sm font-medium text-[#a3a3a3]">
                    <Loader2 className="h-4 w-4 animate-spin" />Staking...
                  </button>
                ) : actions.step === 'unstaking' ? (
                  <button disabled className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1e1e1e] py-3.5 text-sm font-medium text-[#a3a3a3]">
                    <Loader2 className="h-4 w-4 animate-spin" />Unstaking...
                  </button>
                ) : (
                  <button
                    onClick={modal === 'stake' ? handleStake : handleUnstake}
                    disabled={!inputVal || parseFloat(inputVal) <= 0}
                    className={cn(
                      'w-full rounded-md py-3.5 text-sm font-semibold transition-all',
                      !inputVal || parseFloat(inputVal) <= 0
                        ? 'bg-[#1e1e1e] text-[#525252] cursor-not-allowed'
                        : 'bg-[#10b981] text-base-bg hover:bg-[#059669] active:scale-[0.98] active:brightness-95',
                    )}>
                    {modal === 'stake' ? `Stake BDX${lockDays > 0 ? ` (${lockDays}d lock)` : ''}` : 'Unstake BDX'}
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
