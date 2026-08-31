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
  { label: 'Community',  pct: 40, amount: '400M', color: 'bg-[#10b981]',            desc: 'Farming + staking rewards' },
  { label: 'Treasury',   pct: 25, amount: '250M', color: 'bg-[#22c55e]',            desc: 'DAO-governed release' },
  { label: 'Ecosystem',  pct: 16, amount: '160M', color: 'bg-blue-400',         desc: '3mo cliff, 24mo linear' },
  { label: 'Team',       pct: 15, amount: '150M', color: 'bg-[#f59e0b]',           desc: '12mo cliff, 36mo linear' },
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
        <h1 className="text-[28px] font-semibold text-[#f5f5f5] tracking-tight">Vesting</h1>
        <p className="mt-1 text-sm text-[#a3a3a3]">
          Token allocations unlock gradually over time to align long-term incentives.
        </p>
      </div>

      {/* ── Not deployed ─────────────────────────────────────────── */}
      {notDeployed && (
        <div className="rounded-lg border border-[rgba(245,158,11,0.15)] bg-[rgba(245,158,11,0.05)] px-5 py-4">
          <p className="text-sm font-semibold text-[#f59e0b]">Contract not deployed yet</p>
          <p className="text-xs text-[#a3a3a3] mt-0.5">
            Set NEXT_PUBLIC_VESTING_ADDRESS in .env.local after running DeployVesting.s.sol
          </p>
        </div>
      )}

      {/* ── Stat cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-[#262626] bg-[#111111] p-5">
          <p className="text-xs text-[#525252] mb-1">Total Locked</p>
          <p className="text-[28px] font-semibold text-[#f5f5f5] tabular-nums">
            {stats.isLoading ? '...' : stats.totalLockedFormatted}
          </p>
          <p className="mt-1 text-xs text-[#525252]">BDX in vesting contracts</p>
        </div>
        <div className="rounded-lg border border-[#262626] bg-[#111111] p-5">
          <p className="text-xs text-[#525252] mb-1">Beneficiaries</p>
          <p className="text-[28px] font-semibold text-[#f5f5f5] tabular-nums">
            {stats.isLoading ? '...' : stats.beneficiaryCount}
          </p>
          <p className="mt-1 text-xs text-[#525252]">active vesting schedules</p>
        </div>
        <div className="rounded-lg border border-[#262626] bg-[#111111] p-5">
          <p className="text-xs text-[#525252] mb-1">Total Supply</p>
          <p className="text-[28px] font-semibold text-[#f5f5f5] tabular-nums">1B BDX</p>
          <p className="mt-1 text-xs text-[#525252]">hard cap — never exceeds</p>
        </div>
      </div>

      {/* ── Main 2-col layout ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* ── Left: user schedule (3 cols) ─────────────────────── */}
        <div className="lg:col-span-3">
          {!isConnected ? (
            <div className="rounded-lg border border-[rgba(16,185,129,0.15)] bg-[rgba(16,185,129,0.04)] px-5 py-8 flex flex-col items-center gap-4 text-center">
              <Lock className="h-8 w-8 text-[#10b981]" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold text-[#f5f5f5]">Connect to view your schedule</p>
                <p className="text-xs text-[#a3a3a3] mt-1">
                  Check if your wallet has an active vesting schedule.
                </p>
              </div>
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button onClick={openConnectModal}
                    className="rounded-md bg-[#10b981] px-6 py-2.5 text-sm font-semibold text-base-bg hover:bg-[#059669] transition-all active:scale-[0.98]">
                    Connect Wallet
                  </button>
                )}
              </ConnectButton.Custom>
            </div>
          ) : schedule.isLoading ? (
            <div className="rounded-lg border border-[#262626] bg-[#111111] p-8 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-[#525252] animate-spin" />
            </div>
          ) : !hasSchedule ? (
            <div className="rounded-lg border border-[#262626] bg-[#111111] p-8 flex flex-col items-center gap-3 text-center">
              <Lock className="h-8 w-8 text-[#525252]" strokeWidth={1.5} />
              <p className="text-sm font-semibold text-[#f5f5f5]">No vesting schedule</p>
              <p className="text-xs text-[#a3a3a3] max-w-xs">
                Your wallet does not have an active vesting schedule.
                Vesting is assigned to specific team, seed, and ecosystem addresses.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-[#262626] bg-[#111111] overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#262626]">
                <h2 className="text-sm font-semibold text-[#f5f5f5]">Your Vesting Schedule</h2>
                {schedule.isRevoked && (
                  <span className="rounded-lg bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.15)] px-2.5 py-1 text-[11px] font-semibold text-[#ef4444]">
                    Revoked
                  </span>
                )}
              </div>

              <div className="p-5 space-y-5">

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-[#525252] uppercase tracking-wide">Vesting Progress</p>
                    <p className="text-xs font-semibold text-[#f5f5f5] tabular-nums">
                      {schedule.progressPct.toFixed(1)}%
                    </p>
                  </div>
                  <div className="h-3 w-full rounded-full bg-[#1e1e1e] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#10b981] transition-all duration-700"
                      style={{ width: `${Math.min(100, schedule.progressPct)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5 text-[10px] text-[#525252]">
                    <span>0%</span>
                    <span className="text-[#10b981] font-medium">{schedule.vestedFormatted} BDX vested</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md bg-[#161616] p-3.5">
                    <p className="text-[10px] text-[#525252] uppercase tracking-wide mb-1">Total Allocated</p>
                    <p className="text-lg font-semibold text-[#f5f5f5] tabular-nums">{schedule.totalAmountFormatted}</p>
                    <p className="text-xs text-[#525252]">BDX</p>
                  </div>
                  <div className="rounded-md bg-[#161616] p-3.5">
                    <p className="text-[10px] text-[#525252] uppercase tracking-wide mb-1">Already Claimed</p>
                    <p className="text-lg font-semibold text-[#f5f5f5] tabular-nums">{schedule.releasedFormatted}</p>
                    <p className="text-xs text-[#525252]">BDX</p>
                  </div>
                  <div className="rounded-md bg-[#161616] p-3.5">
                    <p className="text-[10px] text-[#525252] uppercase tracking-wide mb-1">Still Locked</p>
                    <p className="text-lg font-semibold text-[#f5f5f5] tabular-nums">{schedule.unvestedFormatted}</p>
                    <p className="text-xs text-[#525252]">BDX</p>
                  </div>
                  <div className={cn(
                    'rounded-md p-3.5',
                    canClaim ? 'bg-[#22c55e]/8 border border-[rgba(34,197,94,0.15)]' : 'bg-[#161616]',
                  )}>
                    <p className="text-[10px] text-[#525252] uppercase tracking-wide mb-1">Claimable Now</p>
                    <p className={cn('text-lg font-semibold tabular-nums', canClaim ? 'text-[#22c55e]' : 'text-[#f5f5f5]')}>
                      {schedule.releasableFormatted}
                    </p>
                    <p className="text-xs text-[#525252]">BDX</p>
                  </div>
                </div>

                {/* Cliff / vest timeline */}
                <div className="rounded-md bg-[#161616] px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className={cn('h-3.5 w-3.5', schedule.cliffPassed ? 'text-[#22c55e]' : 'text-[#f59e0b]')} strokeWidth={2} />
                      <p className="text-xs font-medium text-[#f5f5f5]">Cliff</p>
                    </div>
                    <div className="text-right">
                      {schedule.cliffPassed ? (
                        <p className="text-xs text-[#22c55e] font-semibold">Passed</p>
                      ) : (
                        <>
                          <p className="text-xs font-semibold text-[#f59e0b]">{schedule.cliffCountdown}</p>
                          <p className="text-[10px] text-[#525252]">{schedule.cliffEndDate}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="h-px bg-[#262626]" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 text-[#525252]" strokeWidth={2} />
                      <p className="text-xs font-medium text-[#f5f5f5]">Fully vested</p>
                    </div>
                    <p className="text-xs text-[#525252]">{schedule.vestEndDate}</p>
                  </div>
                </div>

                {/* Feedback */}
                {actions.step === 'success' && (
                  <div className="flex items-center gap-2 rounded-md border border-[rgba(34,197,94,0.15)] bg-[rgba(34,197,94,0.05)] px-4 py-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#22c55e] shrink-0" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#22c55e]">Tokens claimed successfully!</p>
                      {actions.txHash && (
                        <a href={etherscanUrl(actions.txHash, 'tx')} target="_blank" rel="noopener noreferrer"
                          className="text-[11px] text-[#525252] hover:text-[#a3a3a3]">
                          {shortenHash(actions.txHash)}
                        </a>
                      )}
                    </div>
                    <button onClick={actions.reset} className="text-[#525252] hover:text-[#f5f5f5] p-1 text-xs">✕</button>
                  </div>
                )}
                {actions.step === 'error' && (
                  <div className="flex items-start gap-2 rounded-md border border-[rgba(239,68,68,0.15)] bg-[rgba(239,68,68,0.05)] px-4 py-2.5">
                    <XCircle className="h-4 w-4 text-[#ef4444] shrink-0 mt-0.5" strokeWidth={1.5} />
                    <p className="text-xs text-[#ef4444] flex-1">{actions.error}</p>
                    <button onClick={actions.reset} className="text-[#525252] hover:text-[#f5f5f5] p-1 text-xs">✕</button>
                  </div>
                )}

                {/* Claim button */}
                {actions.step === 'releasing' ? (
                  <button disabled className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1e1e1e] py-3.5 text-sm font-medium text-[#a3a3a3]">
                    <Loader2 className="h-4 w-4 animate-spin" />Claiming...
                  </button>
                ) : actions.step === 'success' ? (
                  <button onClick={actions.reset}
                    className="w-full rounded-md border border-[#262626] bg-[#1e1e1e] py-2.5 text-sm font-medium text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors">
                    Done
                  </button>
                ) : (
                  <button
                    onClick={() => address && actions.release(address)}
                    disabled={!canClaim || !!schedule.isRevoked || notDeployed}
                    className={cn(
                      'w-full rounded-md py-3.5 text-sm font-semibold transition-all',
                      canClaim && !schedule.isRevoked && !notDeployed
                        ? 'bg-[#10b981] text-base-bg hover:bg-[#059669] active:scale-[0.98] active:brightness-95'
                        : 'bg-[#1e1e1e] text-[#525252] cursor-not-allowed',
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
          <div className="rounded-lg border border-[#262626] bg-[#111111] p-5">
            <h2 className="text-sm font-semibold text-[#f5f5f5] mb-4">Token Distribution</h2>

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
                      <p className="text-xs font-semibold text-[#f5f5f5]">{t.label}</p>
                      <p className="text-[10px] text-[#525252]">{t.desc}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-[#f5f5f5]">{t.amount} BDX</p>
                    <p className="text-[10px] text-[#525252]">{t.pct}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How vesting works */}
          <div className="rounded-lg border border-[#262626] bg-[#111111] p-5">
            <h2 className="text-sm font-semibold text-[#f5f5f5] mb-4">How Vesting Works</h2>
            <div className="space-y-3">
              {[
                { n: '1', text: 'Tokens are allocated but locked in the smart contract.' },
                { n: '2', text: 'Nothing can be claimed during the cliff period.' },
                { n: '3', text: 'After the cliff, tokens unlock linearly every second.' },
                { n: '4', text: 'Claim at any time — unclaimed tokens keep accumulating.' },
                { n: '5', text: 'Owner can revoke unvested tokens (emergency only).' },
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

        </div>
      </div>
    </div>
  );
}
