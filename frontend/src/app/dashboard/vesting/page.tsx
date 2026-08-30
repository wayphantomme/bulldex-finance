'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CheckCircle2, XCircle, Loader2, Lock, Clock, TrendingUp } from 'lucide-react';
import { useVestingStats, useVestingSchedule } from '@/hooks/useVesting';
import { useVestingActions } from '@/hooks/useVestingActions';
import { etherscanUrl, isConfigured, CONTRACT_ADDRESSES } from '@/constants/contracts';
import { shortenHash } from '@/utils/format';
import { cn } from '@/utils/cn';

// ─── Tokenomics reference data (matches VESTING.md / tokenomics) ─────────────

const TOKENOMICS = [
  { label: 'Community',  pct: 40, amount: '400M', color: 'bg-brand',            desc: 'Farming + staking rewards' },
  { label: 'Treasury',   pct: 25, amount: '250M', color: 'bg-green',            desc: 'DAO-governed release' },
  { label: 'Ecosystem',  pct: 16, amount: '160M', color: 'bg-blue-400',         desc: '3mo cliff, 24mo linear' },
  { label: 'Team',       pct: 15, amount: '150M', color: 'bg-yellow',           desc: '12mo cliff, 36mo linear' },
  { label: 'Seed Round', pct:  4, amount: '40M',  color: 'bg-ink-secondary',    desc: '6mo cliff, 18mo linear' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VestingPage() {
  const { address, isConnected } = useAccount();
  const stats    = useVestingStats();
  const schedule = useVestingSchedule(address);
  const actions  = useVestingActions(address);

  const notDeployed  = !isConfigured(CONTRACT_ADDRESSES.vesting);
  const hasSchedule  = schedule.exists && !schedule.isLoading;
  const canClaim     = schedule.releasable > 0n;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in space-y-6">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Vesting</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Token allocations unlock gradually over time to align long-term incentives.
        </p>
      </div>

      {/* ── Not deployed ─────────────────────────────────────────── */}
      {notDeployed && (
        <div className="rounded-2xl border border-yellow/20 bg-yellow/5 px-5 py-4">
          <p className="text-sm font-semibold text-yellow">Contract not deployed yet</p>
          <p className="text-xs text-ink-secondary mt-0.5">
            Set NEXT_PUBLIC_VESTING_ADDRESS in .env.local after running DeployVesting.s.sol
          </p>
        </div>
      )}

      {/* ── Stat cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-base-border bg-base-card p-5">
          <p className="text-xs text-ink-faint mb-1">Total Locked</p>
          <p className="text-2xl font-semibold text-ink tabular-nums">
            {stats.isLoading ? '...' : stats.totalLockedFormatted}
          </p>
          <p className="mt-1 text-xs text-ink-faint">BDX in vesting contracts</p>
        </div>
        <div className="rounded-2xl border border-base-border bg-base-card p-5">
          <p className="text-xs text-ink-faint mb-1">Beneficiaries</p>
          <p className="text-2xl font-semibold text-ink tabular-nums">
            {stats.isLoading ? '...' : stats.beneficiaryCount}
          </p>
          <p className="mt-1 text-xs text-ink-faint">active vesting schedules</p>
        </div>
        <div className="rounded-2xl border border-base-border bg-base-card p-5">
          <p className="text-xs text-ink-faint mb-1">Total Supply</p>
          <p className="text-2xl font-semibold text-ink tabular-nums">1B BDX</p>
          <p className="mt-1 text-xs text-ink-faint">hard cap — never exceeds</p>
        </div>
      </div>

      {/* ── Main 2-col layout ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* ── Left: user schedule (3 cols) ─────────────────────── */}
        <div className="lg:col-span-3">
          {!isConnected ? (
            <div className="rounded-2xl border border-brand/20 bg-brand/5 px-5 py-8 flex flex-col items-center gap-4 text-center">
              <Lock className="h-8 w-8 text-brand" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold text-ink">Connect to view your schedule</p>
                <p className="text-xs text-ink-secondary mt-1">
                  Check if your wallet has an active vesting schedule.
                </p>
              </div>
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button onClick={openConnectModal}
                    className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-base-bg hover:bg-brand-dark transition-all active:scale-[0.98]">
                    Connect Wallet
                  </button>
                )}
              </ConnectButton.Custom>
            </div>
          ) : schedule.isLoading ? (
            <div className="rounded-2xl border border-base-border bg-base-card p-8 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-ink-faint animate-spin" />
            </div>
          ) : !hasSchedule ? (
            <div className="rounded-2xl border border-base-border bg-base-card p-8 flex flex-col items-center gap-3 text-center">
              <Lock className="h-8 w-8 text-ink-faint" strokeWidth={1.5} />
              <p className="text-sm font-semibold text-ink">No vesting schedule</p>
              <p className="text-xs text-ink-secondary max-w-xs">
                Your wallet does not have an active vesting schedule.
                Vesting is assigned to specific team, seed, and ecosystem addresses.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-base-border bg-base-card overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-base-border">
                <h2 className="text-sm font-semibold text-ink">Your Vesting Schedule</h2>
                {schedule.isRevoked && (
                  <span className="rounded-lg bg-red/10 border border-red/20 px-2.5 py-1 text-[11px] font-semibold text-red">
                    Revoked
                  </span>
                )}
              </div>

              <div className="p-5 space-y-5">

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-ink-faint uppercase tracking-wide">Vesting Progress</p>
                    <p className="text-xs font-semibold text-ink tabular-nums">
                      {schedule.progressPct.toFixed(1)}%
                    </p>
                  </div>
                  <div className="h-3 w-full rounded-full bg-base-elevated overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand transition-all duration-700"
                      style={{ width: `${Math.min(100, schedule.progressPct)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5 text-[10px] text-ink-faint">
                    <span>0%</span>
                    <span className="text-brand font-medium">{schedule.vestedFormatted} BDX vested</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-base-surface p-3.5">
                    <p className="text-[10px] text-ink-faint uppercase tracking-wide mb-1">Total Allocated</p>
                    <p className="text-lg font-semibold text-ink tabular-nums">{schedule.totalAmountFormatted}</p>
                    <p className="text-xs text-ink-faint">BDX</p>
                  </div>
                  <div className="rounded-xl bg-base-surface p-3.5">
                    <p className="text-[10px] text-ink-faint uppercase tracking-wide mb-1">Already Claimed</p>
                    <p className="text-lg font-semibold text-ink tabular-nums">{schedule.releasedFormatted}</p>
                    <p className="text-xs text-ink-faint">BDX</p>
                  </div>
                  <div className="rounded-xl bg-base-surface p-3.5">
                    <p className="text-[10px] text-ink-faint uppercase tracking-wide mb-1">Still Locked</p>
                    <p className="text-lg font-semibold text-ink tabular-nums">{schedule.unvestedFormatted}</p>
                    <p className="text-xs text-ink-faint">BDX</p>
                  </div>
                  <div className={cn(
                    'rounded-xl p-3.5',
                    canClaim ? 'bg-green/8 border border-green/20' : 'bg-base-surface',
                  )}>
                    <p className="text-[10px] text-ink-faint uppercase tracking-wide mb-1">Claimable Now</p>
                    <p className={cn('text-lg font-semibold tabular-nums', canClaim ? 'text-green' : 'text-ink')}>
                      {schedule.releasableFormatted}
                    </p>
                    <p className="text-xs text-ink-faint">BDX</p>
                  </div>
                </div>

                {/* Cliff / vest timeline */}
                <div className="rounded-xl bg-base-surface px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className={cn('h-3.5 w-3.5', schedule.cliffPassed ? 'text-green' : 'text-yellow')} strokeWidth={2} />
                      <p className="text-xs font-medium text-ink">Cliff</p>
                    </div>
                    <div className="text-right">
                      {schedule.cliffPassed ? (
                        <p className="text-xs text-green font-semibold">Passed</p>
                      ) : (
                        <>
                          <p className="text-xs font-semibold text-yellow">{schedule.cliffCountdown}</p>
                          <p className="text-[10px] text-ink-faint">{schedule.cliffEndDate}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="h-px bg-base-border" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 text-ink-faint" strokeWidth={2} />
                      <p className="text-xs font-medium text-ink">Fully vested</p>
                    </div>
                    <p className="text-xs text-ink-faint">{schedule.vestEndDate}</p>
                  </div>
                </div>

                {/* Feedback */}
                {actions.step === 'success' && (
                  <div className="flex items-center gap-2 rounded-xl border border-green/20 bg-green/5 px-4 py-2.5">
                    <CheckCircle2 className="h-4 w-4 text-green shrink-0" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-green">Tokens claimed successfully!</p>
                      {actions.txHash && (
                        <a href={etherscanUrl(actions.txHash, 'tx')} target="_blank" rel="noopener noreferrer"
                          className="text-[11px] text-ink-faint hover:text-ink-secondary">
                          {shortenHash(actions.txHash)}
                        </a>
                      )}
                    </div>
                    <button onClick={actions.reset} className="text-ink-faint hover:text-ink p-1 text-xs">✕</button>
                  </div>
                )}
                {actions.step === 'error' && (
                  <div className="flex items-start gap-2 rounded-xl border border-red/20 bg-red/5 px-4 py-2.5">
                    <XCircle className="h-4 w-4 text-red shrink-0 mt-0.5" strokeWidth={1.5} />
                    <p className="text-xs text-red flex-1">{actions.error}</p>
                    <button onClick={actions.reset} className="text-ink-faint hover:text-ink p-1 text-xs">✕</button>
                  </div>
                )}

                {/* Claim button */}
                {actions.step === 'releasing' ? (
                  <button disabled className="flex w-full items-center justify-center gap-2 rounded-xl bg-base-elevated py-3.5 text-sm font-medium text-ink-secondary">
                    <Loader2 className="h-4 w-4 animate-spin" />Claiming...
                  </button>
                ) : actions.step === 'success' ? (
                  <button onClick={actions.reset}
                    className="w-full rounded-xl border border-base-border bg-base-elevated py-2.5 text-sm font-medium text-ink-secondary hover:text-ink transition-colors">
                    Done
                  </button>
                ) : (
                  <button
                    onClick={() => address && actions.release(address)}
                    disabled={!canClaim || !!schedule.isRevoked || notDeployed}
                    className={cn(
                      'w-full rounded-xl py-3.5 text-sm font-semibold transition-all',
                      canClaim && !schedule.isRevoked && !notDeployed
                        ? 'bg-brand text-base-bg hover:bg-brand-dark active:scale-[0.98] active:brightness-95'
                        : 'bg-base-elevated text-ink-faint cursor-not-allowed',
                    )}>
                    {schedule.isRevoked
                      ? 'Schedule revoked'
                      : !schedule.cliffPassed
                      ? `Cliff not reached yet · ${schedule.cliffCountdown ?? ''}`
                      : canClaim
                      ? `Claim ${schedule.releasableFormatted} BDX`
                      : 'Nothing to claim yet'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: tokenomics (2 cols) ────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Distribution donut-style bar */}
          <div className="rounded-2xl border border-base-border bg-base-card p-5">
            <h2 className="text-sm font-semibold text-ink mb-4">Token Distribution</h2>

            {/* Stacked bar */}
            <div className="flex h-3 w-full rounded-full overflow-hidden mb-4">
              {TOKENOMICS.map(t => (
                <div
                  key={t.label}
                  className={cn('h-full transition-all', t.color)}
                  style={{ width: `${t.pct}%` }}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="space-y-2.5">
              {TOKENOMICS.map(t => (
                <div key={t.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', t.color)} />
                    <div>
                      <p className="text-xs font-semibold text-ink">{t.label}</p>
                      <p className="text-[10px] text-ink-faint">{t.desc}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-ink">{t.amount} BDX</p>
                    <p className="text-[10px] text-ink-faint">{t.pct}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How vesting works */}
          <div className="rounded-2xl border border-base-border bg-base-card p-5">
            <h2 className="text-sm font-semibold text-ink mb-4">How Vesting Works</h2>
            <div className="space-y-3">
              {[
                { n: '1', text: 'Tokens are allocated but locked in the smart contract.' },
                { n: '2', text: 'Nothing can be claimed during the cliff period.' },
                { n: '3', text: 'After the cliff, tokens unlock linearly every second.' },
                { n: '4', text: 'Claim at any time — unclaimed tokens keep accumulating.' },
                { n: '5', text: 'Owner can revoke unvested tokens (emergency only).' },
              ].map(s => (
                <div key={s.n} className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-base-elevated text-[10px] font-bold text-ink-faint">
                    {s.n}
                  </span>
                  <p className="text-xs text-ink-secondary leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
