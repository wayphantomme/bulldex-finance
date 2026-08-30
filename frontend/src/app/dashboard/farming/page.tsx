'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseUnits, formatUnits } from 'viem';
import { CheckCircle2, XCircle, Loader2, X, Sprout, Zap, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { useReadContract } from 'wagmi';
import { useFarming, fmtLp, fmtBdx, fmtApr, type FarmPool } from '@/hooks/useFarming';
import { useFarmingActions } from '@/hooks/useFarmingActions';
import { etherscanUrl, isConfigured, CONTRACT_ADDRESSES } from '@/constants/contracts';
import { shortenHash } from '@/utils/format';
import { cn } from '@/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

type ModalMode = 'deposit' | 'withdraw';

interface ModalState {
  mode:    ModalMode;
  pool:    FarmPool;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FarmingPage() {
  const { address, isConnected } = useAccount();
  const { pools, globals, isLoading } = useFarming(address);
  const actions = useFarmingActions(address);

  // LP token balance (we need balance for the currently selected LP token in modal)
  const [modal,    setModal]    = useState<ModalState | null>(null);
  const [inputVal, setInputVal] = useState('');

  // Get LP balance for the currently open modal's LP token
  const { data: lpBalanceData } = useReadContract({
    address: modal?.pool.lpToken,
    abi: [
      {
        type: 'function' as const,
        name: 'balanceOf' as const,
        inputs:  [{ name: 'account', type: 'address' as const }],
        outputs: [{ type: 'uint256' as const }],
        stateMutability: 'view' as const,
      },
    ],
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!modal?.pool.lpToken,
      staleTime: 10_000,
      refetchInterval: 15_000,
    },
  });
  const lpBalance = lpBalanceData as bigint | undefined;

  // Close modal on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') closeModal(); }
    if (modal) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal]); // eslint-disable-line react-hooks/exhaustive-deps

  function openModal(mode: ModalMode, pool: FarmPool) {
    setModal({ mode, pool });
    setInputVal('');
    actions.reset();
  }

  function closeModal() {
    setModal(null);
    setInputVal('');
    actions.reset();
  }

  async function handleDeposit() {
    if (!modal || !inputVal || parseFloat(inputVal) <= 0) return;
    const amount = parseUnits(inputVal, 18);
    await actions.deposit(modal.pool.pid, amount, modal.pool.lpToken);
  }

  async function handleWithdraw() {
    if (!modal || !inputVal || parseFloat(inputVal) <= 0) return;
    const amount = parseUnits(inputVal, 18);
    await actions.withdraw(modal.pool.pid, amount);
  }

  const notDeployed = !isConfigured(CONTRACT_ADDRESSES.masterChef);

  // Total pending across all pools
  const totalPending = pools.reduce((acc, p) => acc + p.pending, 0n);
  const hasPending   = totalPending > 0n;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Yield Farming</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Deposit LP tokens and earn BDX rewards on top of your swap fees.
        </p>
      </div>

      {/* ── Not deployed banner ─────────────────────────────────────────── */}
      {notDeployed && (
        <div className="rounded-2xl border border-yellow/20 bg-yellow/5 px-5 py-4">
          <p className="text-sm font-semibold text-yellow">Contract not deployed yet</p>
          <p className="text-xs text-ink-secondary mt-0.5">
            Run DeployMasterChef.s.sol and set NEXT_PUBLIC_MASTERCHEF_ADDRESS in .env.local
          </p>
        </div>
      )}

      {/* ── Global stats ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-base-border bg-base-card p-5">
          <p className="text-xs text-ink-faint mb-1">Active Pools</p>
          <p className="text-2xl font-semibold text-ink tabular-nums">
            {isLoading ? '...' : globals.poolCount}
          </p>
          <p className="mt-1 text-xs text-ink-faint">LP token farms</p>
        </div>

        <div className="rounded-2xl border border-base-border bg-base-card p-5">
          <p className="text-xs text-ink-faint mb-1">BDX per Block</p>
          <p className="text-2xl font-semibold text-green tabular-nums">
            {isLoading ? '...' : fmtBdx(globals.bdxPerBlock)}
          </p>
          <p className="mt-1 text-xs text-ink-faint">across all pools</p>
        </div>

        <div className="rounded-2xl border border-base-border bg-base-card p-5">
          <p className="text-xs text-ink-faint mb-1">Reward Budget</p>
          <p className="text-2xl font-semibold text-ink tabular-nums">
            {isLoading ? '...' : fmtBdx(globals.rewardBalance)}
          </p>
          <p className="mt-1 text-xs text-ink-faint">BDX remaining</p>
        </div>
      </div>

      {/* ── Connect prompt ───────────────────────────────────────────────── */}
      {!isConnected && (
        <div className="rounded-2xl border border-brand/20 bg-brand/5 px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-ink">Connect to start farming</p>
            <p className="text-xs text-ink-secondary mt-0.5">
              Add liquidity first, then deposit your LP tokens here to earn BDX.
            </p>
          </div>
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                onClick={openConnectModal}
                className="shrink-0 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-base-bg hover:bg-brand-dark transition-all active:scale-[0.98]">
                Connect Wallet
              </button>
            )}
          </ConnectButton.Custom>
        </div>
      )}

      {/* ── Harvest All row ───────────────────────────────────────────────── */}
      {isConnected && hasPending && (
        <div className="rounded-2xl border border-green/20 bg-green/5 px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-green">
              {fmtBdx(totalPending)} BDX ready to claim
            </p>
            <p className="text-xs text-ink-secondary mt-0.5">Pending rewards across all farms.</p>
          </div>
          <button
            onClick={() => actions.harvestAll()}
            disabled={actions.step === 'harvesting' || notDeployed}
            className="shrink-0 flex items-center gap-1.5 rounded-xl bg-green/15 border border-green/25 px-4 py-2 text-sm font-semibold text-green hover:bg-green/25 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {actions.step === 'harvesting'
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Claiming...</>
              : <><Zap className="h-3.5 w-3.5" /> Harvest All</>
            }
          </button>
        </div>
      )}

      {/* ── Pool cards ───────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl border border-base-border bg-base-card animate-pulse" />
            ))
          : pools.map(pool => (
              <PoolCard
                key={pool.pid}
                pool={pool}
                isConnected={isConnected}
                notDeployed={notDeployed}
                actions={actions}
                onDeposit={() => openModal('deposit', pool)}
                onWithdraw={() => openModal('withdraw', pool)}
                onHarvest={() => actions.harvest(pool.pid)}
              />
            ))
        }
      </div>

      {/* ── Global action feedback ───────────────────────────────────────── */}
      {actions.step === 'success' && !modal && (
        <div className="flex items-center gap-2 rounded-2xl border border-green/20 bg-green/5 px-5 py-3.5">
          <CheckCircle2 className="h-4 w-4 text-green shrink-0" strokeWidth={1.5} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-green">Transaction complete!</p>
            {actions.txHash && (
              <a
                href={etherscanUrl(actions.txHash, 'tx')}
                target="_blank" rel="noopener noreferrer"
                className="text-[11px] text-ink-faint hover:text-ink-secondary">
                {shortenHash(actions.txHash)}
              </a>
            )}
          </div>
          <button onClick={actions.reset} className="text-ink-faint hover:text-ink p-1">
            <X className="h-3 w-3" strokeWidth={2} />
          </button>
        </div>
      )}
      {actions.step === 'error' && !modal && (
        <div className="flex items-start gap-2 rounded-2xl border border-red/20 bg-red/5 px-5 py-3.5">
          <XCircle className="h-4 w-4 text-red shrink-0 mt-0.5" strokeWidth={1.5} />
          <p className="text-xs text-red flex-1">{actions.error}</p>
          <button onClick={actions.reset} className="text-ink-faint hover:text-ink p-1">
            <X className="h-3 w-3" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* ── Deposit / Withdraw Modal ─────────────────────────────────────── */}
      {modal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4">
            <div className="rounded-2xl border border-base-border bg-base-card shadow-elevated overflow-hidden">

              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-base-border">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {modal.mode === 'deposit' ? 'Deposit LP' : 'Withdraw LP'}
                  </p>
                  <p className="text-xs text-ink-faint mt-0.5">{modal.pool.lpSymbol} LP</p>
                </div>
                <button onClick={closeModal} className="text-ink-faint hover:text-ink transition-colors p-1">
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* Context row */}
              <div className="grid grid-cols-3 divide-x divide-base-border border-b border-base-border">
                <div className="px-4 py-3 text-center">
                  <p className="text-[10px] text-ink-faint">In Farm</p>
                  <p className="text-sm font-semibold text-ink tabular-nums">
                    {fmtLp(modal.pool.deposited)}
                  </p>
                </div>
                <div className="px-4 py-3 text-center">
                  <p className="text-[10px] text-ink-faint">Wallet</p>
                  <p className="text-sm font-semibold text-ink tabular-nums">
                    {fmtLp(lpBalance ?? 0n)}
                  </p>
                </div>
                <div className="px-4 py-3 text-center">
                  <p className="text-[10px] text-ink-faint">Pending</p>
                  <p className="text-sm font-semibold text-green tabular-nums">
                    {fmtBdx(modal.pool.pending)}
                  </p>
                </div>
              </div>

              <div className="p-5 space-y-4">

                {/* Amount input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-ink-faint">
                      {modal.mode === 'deposit' ? 'LP amount to deposit' : 'LP amount to withdraw'}
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-ink-faint">
                        {modal.mode === 'deposit'
                          ? `Wallet: ${fmtLp(lpBalance ?? 0n)}`
                          : `In Farm: ${fmtLp(modal.pool.deposited)}`}
                      </span>
                      <button
                        onClick={() => {
                          const max = modal.mode === 'deposit'
                            ? lpBalance ?? 0n
                            : modal.pool.deposited;
                          setInputVal(formatUnits(max / 2n, 18));
                        }}
                        className="rounded-md bg-base-elevated px-2 py-0.5 text-[10px] font-semibold text-ink-secondary hover:text-ink transition-colors">
                        HALF
                      </button>
                      <button
                        onClick={() => {
                          const max = modal.mode === 'deposit'
                            ? lpBalance ?? 0n
                            : modal.pool.deposited;
                          setInputVal(formatUnits(max, 18));
                        }}
                        className="rounded-md bg-base-elevated px-2 py-0.5 text-[10px] font-semibold text-ink-secondary hover:text-ink transition-colors">
                        MAX
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl bg-base-surface p-4 flex items-center gap-3">
                    <input
                      type="number"
                      placeholder="0.0000"
                      value={inputVal}
                      onChange={e => setInputVal(e.target.value)}
                      className="tabular-nums min-w-0 flex-1 bg-transparent text-2xl font-normal text-ink placeholder:text-ink-faint outline-none focus:outline-none ring-0 focus:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="shrink-0 rounded-lg bg-base-elevated px-2.5 py-1.5 text-xs font-semibold text-ink">
                      LP
                    </span>
                  </div>
                </div>

                {/* Deposit note */}
                {modal.mode === 'deposit' && (
                  <p className="text-[11px] text-ink-faint leading-relaxed">
                    Depositing LP tokens will also harvest any pending BDX rewards.
                  </p>
                )}
                {modal.mode === 'withdraw' && (
                  <p className="text-[11px] text-ink-faint leading-relaxed">
                    Withdrawing LP tokens will automatically harvest your pending{' '}
                    <span className="text-green font-medium">{fmtBdx(modal.pool.pending)} BDX</span>.
                  </p>
                )}

                {/* Feedback */}
                {actions.step === 'success' && (
                  <div className="flex items-center gap-2 rounded-xl border border-green/20 bg-green/5 px-4 py-2.5">
                    <CheckCircle2 className="h-4 w-4 text-green shrink-0" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-green">Transaction complete!</p>
                      {actions.txHash && (
                        <a
                          href={etherscanUrl(actions.txHash, 'tx')}
                          target="_blank" rel="noopener noreferrer"
                          className="text-[11px] text-ink-faint hover:text-ink-secondary">
                          {shortenHash(actions.txHash)}
                        </a>
                      )}
                    </div>
                  </div>
                )}
                {actions.step === 'error' && (
                  <div className="flex items-start gap-2 rounded-xl border border-red/20 bg-red/5 px-4 py-2.5">
                    <XCircle className="h-4 w-4 text-red shrink-0 mt-0.5" strokeWidth={1.5} />
                    <p className="text-xs text-red">{actions.error}</p>
                  </div>
                )}

                {/* CTA */}
                {actions.step === 'success' ? (
                  <button
                    onClick={closeModal}
                    className="w-full rounded-xl border border-base-border bg-base-elevated py-2.5 text-sm font-medium text-ink-secondary hover:text-ink transition-colors">
                    Done
                  </button>
                ) : actions.step === 'error' ? (
                  <button
                    onClick={actions.reset}
                    className="w-full rounded-xl border border-base-border bg-base-elevated py-2.5 text-sm font-medium text-ink-secondary hover:text-ink transition-colors">
                    Try again
                  </button>
                ) : actions.step === 'approving' ? (
                  <button disabled className="flex w-full items-center justify-center gap-2 rounded-xl bg-base-elevated py-3.5 text-sm font-medium text-ink-secondary">
                    <Loader2 className="h-4 w-4 animate-spin" /> Approving LP...
                  </button>
                ) : actions.step === 'depositing' ? (
                  <button disabled className="flex w-full items-center justify-center gap-2 rounded-xl bg-base-elevated py-3.5 text-sm font-medium text-ink-secondary">
                    <Loader2 className="h-4 w-4 animate-spin" /> Depositing...
                  </button>
                ) : actions.step === 'withdrawing' ? (
                  <button disabled className="flex w-full items-center justify-center gap-2 rounded-xl bg-base-elevated py-3.5 text-sm font-medium text-ink-secondary">
                    <Loader2 className="h-4 w-4 animate-spin" /> Withdrawing...
                  </button>
                ) : (
                  <button
                    onClick={modal.mode === 'deposit' ? handleDeposit : handleWithdraw}
                    disabled={!inputVal || parseFloat(inputVal) <= 0}
                    className={cn(
                      'w-full rounded-xl py-3.5 text-sm font-semibold transition-all',
                      !inputVal || parseFloat(inputVal) <= 0
                        ? 'bg-base-elevated text-ink-faint cursor-not-allowed'
                        : 'bg-brand text-base-bg hover:bg-brand-dark active:scale-[0.98] active:brightness-95',
                    )}>
                    {modal.mode === 'deposit' ? 'Deposit LP' : 'Withdraw LP'}
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

// ─── Pool Card ────────────────────────────────────────────────────────────────

interface PoolCardProps {
  pool:        FarmPool;
  isConnected: boolean;
  notDeployed: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actions:     any;
  onDeposit:   () => void;
  onWithdraw:  () => void;
  onHarvest:   () => void;
}

function PoolCard({
  pool,
  isConnected,
  notDeployed,
  actions,
  onDeposit,
  onWithdraw,
  onHarvest,
}: PoolCardProps) {
  const hasDeposited = pool.deposited > 0n;
  const hasPending   = pool.pending > 0n;
  const isHarvesting = actions.step === 'harvesting';

  return (
    <div className="rounded-2xl border border-base-border bg-base-card overflow-hidden">

      {/* Pool header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-base-border">
        <div className="flex items-center gap-3">
          {/* Pair icon */}
          <div className="flex -space-x-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green/20 ring-2 ring-base-card z-10">
              <Sprout className="h-4 w-4 text-green" strokeWidth={1.5} />
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/20 ring-2 ring-base-card">
              <span className="text-[9px] font-bold text-brand">LP</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{pool.lpSymbol}</p>
            <p className="text-[11px] text-ink-faint">PID {pool.pid} · {pool.allocPoint} alloc pts</p>
          </div>
        </div>
        {/* APR badge */}
        <div className="text-right">
          <p className="text-[10px] text-ink-faint">APR</p>
          <p className={cn('text-lg font-bold tabular-nums', pool.aprPct > 0 ? 'text-green' : 'text-ink-faint')}>
            {fmtApr(pool.aprPct)}
          </p>
        </div>
      </div>

      {/* Pool stats */}
      <div className="grid grid-cols-3 divide-x divide-base-border border-b border-base-border">
        <div className="px-4 py-3 text-center">
          <p className="text-[10px] text-ink-faint">Total Staked</p>
          <p className="text-sm font-semibold text-ink tabular-nums">{fmtLp(pool.totalStaked)}</p>
          <p className="text-[10px] text-ink-faint">LP</p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className="text-[10px] text-ink-faint">Your Deposit</p>
          <p className={cn('text-sm font-semibold tabular-nums', hasDeposited ? 'text-ink' : 'text-ink-faint')}>
            {hasDeposited ? fmtLp(pool.deposited) : '—'}
          </p>
          <p className="text-[10px] text-ink-faint">LP</p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className="text-[10px] text-ink-faint">Pending</p>
          <p className={cn('text-sm font-semibold tabular-nums', hasPending ? 'text-green' : 'text-ink-faint')}>
            {hasPending ? fmtBdx(pool.pending) : '—'}
          </p>
          <p className="text-[10px] text-ink-faint">BDX</p>
        </div>
      </div>

      {/* Actions */}
      {isConnected && (
        <div className="px-5 py-3.5 flex items-center gap-2">
          <button
            onClick={onDeposit}
            disabled={notDeployed}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand py-2 text-xs font-semibold text-base-bg hover:bg-brand-dark active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            <ArrowDownToLine className="h-3.5 w-3.5" strokeWidth={2} />
            Deposit
          </button>
          <button
            onClick={onWithdraw}
            disabled={!hasDeposited || notDeployed}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold border transition-all',
              hasDeposited && !notDeployed
                ? 'border-base-border bg-base-elevated text-ink-secondary hover:text-ink hover:border-base-border-light active:scale-[0.98]'
                : 'border-base-border/40 bg-base-elevated/40 text-ink-faint cursor-not-allowed',
            )}>
            <ArrowUpFromLine className="h-3.5 w-3.5" strokeWidth={2} />
            Withdraw
          </button>
          <button
            onClick={onHarvest}
            disabled={!hasPending || isHarvesting || notDeployed}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold border transition-all',
              hasPending && !notDeployed
                ? 'border-green/25 bg-green/10 text-green hover:bg-green/20 active:scale-[0.98]'
                : 'border-base-border/40 bg-base-elevated/40 text-ink-faint cursor-not-allowed',
            )}>
            {isHarvesting
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <><Zap className="h-3.5 w-3.5" strokeWidth={2} /> Harvest</>
            }
          </button>
        </div>
      )}
    </div>
  );
}
