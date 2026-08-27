'use client';

import { useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatUnits } from 'viem';
import Image from 'next/image';
import { X, CheckCircle2, XCircle, Loader2, ChevronRight } from 'lucide-react';
import { usePoolStats, usePoolShare } from '@/hooks/usePoolStats';
import { useAddLiquidity } from '@/hooks/useAddLiquidity';
import { useRemoveLiquidity } from '@/hooks/useRemoveLiquidity';
import { useReadContract } from 'wagmi';
import { parseAmount, applySlippage } from '@/hooks/useSwap';
import { CONTRACTS, CONTRACT_ADDRESSES, isConfigured, etherscanUrl } from '@/constants/contracts';
import { POOL_ABI } from '@/constants/abis';
import { formatToken, shortenHash } from '@/utils/format';
import { cn } from '@/utils/cn';

type PoolKey = 'bdx-musdc' | 'bdx-weth';
type ActionType = 'add' | 'remove';

const POOL_CONFIG: Record<PoolKey, {
  address: `0x${string}`;
  label: string;
  token0Symbol: string;
  token1Symbol: string;
  token0Logo: string;
  token1Logo: string;
  fee: string;
}> = {
  'bdx-musdc': {
    address: CONTRACT_ADDRESSES.pool,
    label: 'BDX / MUSDC',
    token0Symbol: 'BDX',
    token1Symbol: 'MUSDC',
    token0Logo: '/bulldex-logo.png',
    token1Logo: '/musdc-icon.svg',
    fee: '0.30%',
  },
  'bdx-weth': {
    address: CONTRACT_ADDRESSES.poolBdxWeth,
    label: 'BDX / WETH',
    token0Symbol: 'BDX',
    token1Symbol: 'ETH',
    token0Logo: '/bulldex-logo.png',
    token1Logo: '/eth-icon.svg',
    fee: '0.30%',
  },
};

export default function LiquidityPage() {
  const { address, isConnected } = useAccount();
  const [selectedPool, setSelectedPool] = useState<PoolKey | null>(null);
  const [actionType, setActionType]     = useState<ActionType>('add');
  const [slippageBps, setSlippageBps]   = useState(50);

  // BDX/MUSDC pool stats
  const musdcPool = usePoolStats();
  // BDX/WETH LP balance (read from poolBdxWeth contract)
  const { data: wethLPBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.poolBdxWeth,
    abi: POOL_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && isConfigured(CONTRACT_ADDRESSES.poolBdxWeth), staleTime: 15_000 },
  });

  const pool = selectedPool ? POOL_CONFIG[selectedPool] : null;

  // Selected pool stats
  const selectedPoolStats = usePoolStats(); // only BDX/MUSDC supported fully for now

  // ── Add liquidity ─────────────────────────────────────────────────
  const [t0Input, setT0Input] = useState('');
  const [t1Input, setT1Input] = useState('');
  const t0Amount = useMemo(() => parseAmount(t0Input), [t0Input]);
  const t1Amount = useMemo(() => parseAmount(t1Input), [t1Input]);

  function handleT0Change(val: string) {
    setT0Input(val);
    if (!musdcPool.hasLiquidity || !musdcPool.bdxReserve || !musdcPool.musdcReserve) return;
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0 && selectedPool === 'bdx-musdc') {
      const paired = (n * Number(formatUnits(musdcPool.musdcReserve, 18))) /
                         Number(formatUnits(musdcPool.bdxReserve, 18));
      setT1Input(paired.toFixed(6));
    } else {
      setT1Input('');
    }
  }

  const addLiq    = useAddLiquidity(address);
  const removeLiq = useRemoveLiquidity(address);
  const [lpPct, setLpPct] = useState(50);

  const { data: lpBalance } = useReadContract({
    address: selectedPool ? POOL_CONFIG[selectedPool].address : CONTRACT_ADDRESSES.pool,
    abi: POOL_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!selectedPool, staleTime: 15_000, refetchInterval: 15_000 },
  });

  const lpToRemove = useMemo(() => {
    if (!lpBalance) return 0n;
    return ((lpBalance as bigint) * BigInt(lpPct)) / 100n;
  }, [lpBalance, lpPct]);

  const isBDXToken0 = musdcPool.token0?.toLowerCase() === CONTRACTS.token.address.toLowerCase();

  const poolShare = usePoolShare(
    lpBalance as bigint | undefined,
    musdcPool.totalSupply,
    musdcPool.reserve0,
    musdcPool.reserve1,
    isBDXToken0,
  );

  const estimatedBack = useMemo(() => {
    if (!lpToRemove || lpToRemove === 0n || !musdcPool.totalSupply || !musdcPool.bdxReserve || !musdcPool.musdcReserve) {
      return { t0: 0n, t1: 0n };
    }
    const t0 = isBDXToken0
      ? (lpToRemove * musdcPool.bdxReserve)   / musdcPool.totalSupply
      : (lpToRemove * musdcPool.musdcReserve) / musdcPool.totalSupply;
    const t1 = isBDXToken0
      ? (lpToRemove * musdcPool.musdcReserve) / musdcPool.totalSupply
      : (lpToRemove * musdcPool.bdxReserve)   / musdcPool.totalSupply;
    return { t0, t1 };
  }, [lpToRemove, musdcPool, isBDXToken0]);

  async function handleAddLiquidity() {
    if (!address || t0Amount === 0n || t1Amount === 0n) return;
    const min0 = applySlippage(t0Amount, slippageBps);
    const min1 = applySlippage(t1Amount, slippageBps);
    await addLiq.addLiquidity(t0Amount, t1Amount, min0, min1);
  }

  async function handleRemoveLiquidity() {
    if (!address || lpToRemove === 0n) return;
    const min0 = applySlippage(estimatedBack.t0, slippageBps);
    const min1 = applySlippage(estimatedBack.t1, slippageBps);
    const m0 = isBDXToken0 ? min0 : min1;
    const m1 = isBDXToken0 ? min1 : min0;
    await removeLiq.removeLiquidity(lpToRemove, m0, m1);
  }

  // Protocol totals
  const totalTvl = musdcPool.hasLiquidity && musdcPool.bdxReserve && musdcPool.musdcReserve
    ? `${formatToken(musdcPool.bdxReserve, 18, 0)} BDX + ${formatToken(musdcPool.musdcReserve, 18, 0)} MUSDC`
    : '—';

  const myPositionCount = [
    lpBalance && (lpBalance as bigint) > 0n,
    wethLPBalance && (wethLPBalance as bigint) > 0n,
  ].filter(Boolean).length;

  return (
    <div className="animate-fade-in space-y-6">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">BDX Pools</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Provide liquidity to earn 0.3% of every swap fee.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-6 text-right">
          <div>
            <p className="text-xs text-ink-faint">Total Liquidity</p>
            <p className="text-sm font-bold text-ink">{totalTvl}</p>
          </div>
          <div>
            <p className="text-xs text-ink-faint">Active Pools</p>
            <p className="text-lg font-bold text-ink">2</p>
          </div>
          {myPositionCount > 0 && (
            <div>
              <p className="text-xs text-ink-faint">My Positions</p>
              <p className="text-lg font-bold text-brand">{myPositionCount}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Pool table ───────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-base-border bg-base-card overflow-hidden">

        {/* Table header */}
        <div className="grid grid-cols-6 gap-4 px-5 py-3 border-b border-base-border bg-base-surface text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
          <div className="col-span-2">Pool</div>
          <div className="text-right">Fee</div>
          <div className="text-right">TVL</div>
          <div className="text-right">My Liquidity</div>
          <div className="text-right" />
        </div>

        {(Object.entries(POOL_CONFIG) as [PoolKey, typeof POOL_CONFIG[PoolKey]][]).map(([key, cfg]) => {
          const isMUSCD = key === 'bdx-musdc';
          const reserve0Fmt = isMUSCD && musdcPool.bdxReserveFormatted ? musdcPool.bdxReserveFormatted : '—';
          const reserve1Fmt = isMUSCD && musdcPool.musdcReserveFormatted ? musdcPool.musdcReserveFormatted : '0.1';
          const myLPBal = isMUSCD
            ? (lpBalance as bigint | undefined)
            : (wethLPBalance as bigint | undefined);
          const hasPosition = myLPBal && myLPBal > 0n;

          return (
            <div key={key}
              className="grid grid-cols-6 gap-4 px-5 py-4 border-b border-base-border last:border-0 hover:bg-base-elevated transition-colors items-center">

              {/* Pool name */}
              <div className="col-span-2 flex items-center gap-2.5">
                {/* Overlapping token logos */}
                <div className="relative w-10 h-7 shrink-0">
                  <div className="absolute left-0 top-0 h-7 w-7 rounded-full overflow-hidden ring-2 ring-base-card">
                    <Image src={cfg.token0Logo} alt={cfg.token0Symbol} fill className="object-cover" sizes="28px" />
                  </div>
                  <div className="absolute left-4 top-0 h-7 w-7 rounded-full overflow-hidden ring-2 ring-base-card">
                    <Image src={cfg.token1Logo} alt={cfg.token1Symbol} fill className="object-cover" sizes="28px" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{cfg.label}</p>
                  <p className="text-[11px] text-ink-faint">{key === 'bdx-musdc' ? 'BDX/MUSDC' : 'BDX/WETH'}</p>
                </div>
              </div>

              {/* Fee */}
              <div className="text-right">
                <span className="rounded-lg bg-base-elevated px-2 py-0.5 text-[11px] font-semibold text-ink-secondary">{cfg.fee}</span>
              </div>

              {/* TVL */}
              <div className="text-right">
                <p className="text-sm font-semibold text-ink tabular-nums">{reserve0Fmt} {cfg.token0Symbol}</p>
                <p className="text-[11px] text-ink-faint">{reserve1Fmt} {cfg.token1Symbol}</p>
              </div>

              {/* My liquidity */}
              <div className="text-right">
                {hasPosition ? (
                  <>
                    <p className="text-sm font-semibold text-green tabular-nums">{formatToken(myLPBal!, 18, 4)} LP</p>
                    {isMUSCD && (
                      <p className="text-[11px] text-ink-faint">{poolShare.sharePctFormatted}% share</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-ink-faint">—</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => { setSelectedPool(key); setActionType('add'); addLiq.reset(); setT0Input(''); setT1Input(''); }}
                  className="flex items-center gap-1 rounded-xl bg-brand px-3 py-1.5 text-xs font-semibold text-base-bg hover:bg-brand-dark transition-all">
                  Add
                  <ChevronRight className="h-3 w-3" strokeWidth={2} />
                </button>
                {hasPosition && (
                  <button
                    onClick={() => { setSelectedPool(key); setActionType('remove'); removeLiq.reset(); }}
                    className="rounded-xl border border-base-border bg-base-elevated px-3 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink hover:border-base-border-light transition-colors">
                    Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Action modal ─────────────────────────────────────────────── */}
      {selectedPool && pool && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedPool(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-4">
            <div className="rounded-2xl border border-base-border bg-base-card shadow-elevated overflow-hidden">

              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-base-border">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-7 shrink-0">
                    <div className="absolute left-0 top-0 h-7 w-7 rounded-full overflow-hidden ring-2 ring-base-card">
                      <Image src={pool.token0Logo} alt={pool.token0Symbol} fill className="object-cover" sizes="28px" />
                    </div>
                    <div className="absolute left-4 top-0 h-7 w-7 rounded-full overflow-hidden ring-2 ring-base-card">
                      <Image src={pool.token1Logo} alt={pool.token1Symbol} fill className="object-cover" sizes="28px" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{pool.label}</p>
                    <p className="text-[11px] text-ink-faint">{pool.fee} fee</p>
                  </div>
                </div>
                <button onClick={() => setSelectedPool(null)} className="text-ink-faint hover:text-ink transition-colors">
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* Add / Remove tabs */}
              <div className="flex border-b border-base-border">
                {(['add', 'remove'] as ActionType[]).map(t => (
                  <button key={t} onClick={() => setActionType(t)}
                    className={cn('flex-1 py-2.5 text-xs font-semibold capitalize transition-colors',
                      actionType === t ? 'border-b-2 border-brand text-brand' : 'text-ink-secondary hover:text-ink',
                    )}>
                    {t === 'add' ? 'Add Liquidity' : 'Remove Liquidity'}
                  </button>
                ))}
              </div>

              <div className="p-5 space-y-3">

                {actionType === 'add' ? (
                  <>
                    {/* Slippage */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-ink-faint">Max slippage</span>
                      <div className="flex gap-1">
                        {[{ l: '0.5%', v: 50 }, { l: '1%', v: 100 }, { l: '2%', v: 200 }].map(o => (
                          <button key={o.v} onClick={() => setSlippageBps(o.v)}
                            className={cn('rounded-lg px-2 py-0.5 text-[10px] font-semibold transition-colors border',
                              slippageBps === o.v ? 'border-brand/30 bg-brand/10 text-brand' : 'border-base-border bg-base-elevated text-ink-secondary hover:text-ink')}>
                            {o.l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Token 0 input */}
                    <PoolInput symbol={pool.token0Symbol} logo={pool.token0Logo}
                      value={t0Input} onChange={handleT0Change} />

                    <div className="flex justify-center">
                      <div className="h-6 w-6 rounded-full border border-base-border bg-base-elevated flex items-center justify-center text-ink-faint text-[10px]">+</div>
                    </div>

                    {/* Token 1 input */}
                    <PoolInput symbol={pool.token1Symbol} logo={pool.token1Logo}
                      value={t1Input} onChange={setT1Input} />

                    {/* Success/error */}
                    {addLiq.step === 'success' && (
                      <SuccessMsg txHash={addLiq.txHash} msg="Liquidity added!" onClose={addLiq.reset} />
                    )}
                    {addLiq.step === 'error' && (
                      <ErrorMsg error={addLiq.error} onReset={addLiq.reset} />
                    )}

                    {/* CTA */}
                    {!isConnected ? (
                      <ConnectWalletBtn />
                    ) : ['approving_bdx','approving_musdc','adding'].includes(addLiq.step) ? (
                      <BusyBtn label={addLiq.step === 'adding' ? 'Adding...' : 'Approving...'} />
                    ) : addLiq.step === 'success' ? (
                      <DoneBtn onClick={() => { addLiq.reset(); setT0Input(''); setT1Input(''); }} />
                    ) : addLiq.step === 'error' ? null : (
                      <button onClick={handleAddLiquidity}
                        disabled={t0Amount === 0n || t1Amount === 0n}
                        className={cn('w-full rounded-xl py-3 text-sm font-semibold transition-all',
                          t0Amount === 0n || t1Amount === 0n
                            ? 'bg-base-elevated text-ink-faint cursor-not-allowed'
                            : 'bg-brand text-base-bg hover:bg-brand-dark')}>
                        Add Liquidity
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {/* Remove — slider */}
                    <div className="rounded-xl bg-base-surface p-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-ink-faint">Amount to remove</span>
                        <span className="text-xl font-bold text-ink">{lpPct}%</span>
                      </div>
                      <input type="range" min={1} max={100} value={lpPct}
                        onChange={e => setLpPct(Number(e.target.value))}
                        className="w-full accent-brand cursor-pointer" />
                      <div className="flex gap-2 mt-3">
                        {[25, 50, 75, 100].map(p => (
                          <button key={p} onClick={() => setLpPct(p)}
                            className={cn('flex-1 rounded-lg py-1 text-[10px] font-semibold border transition-colors',
                              lpPct === p ? 'border-brand/30 bg-brand/10 text-brand' : 'border-base-border bg-base-elevated text-ink-secondary hover:text-ink')}>
                            {p === 100 ? 'MAX' : `${p}%`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl bg-base-surface px-4 py-3 space-y-1.5">
                      <InfoRow label="LP to burn" value={formatToken(lpToRemove, 18, 6)} />
                      <InfoRow label={`${pool.token0Symbol} back`} value={`${formatToken(estimatedBack.t0, 18, 4)} ${pool.token0Symbol}`} />
                      <InfoRow label={`${pool.token1Symbol} back`} value={`${formatToken(estimatedBack.t1, 18, 4)} ${pool.token1Symbol}`} />
                    </div>

                    {removeLiq.step === 'success' && <SuccessMsg txHash={removeLiq.txHash} msg="Liquidity removed!" onClose={removeLiq.reset} />}
                    {removeLiq.step === 'error' && <ErrorMsg error={removeLiq.error} onReset={removeLiq.reset} />}

                    {!isConnected ? <ConnectWalletBtn />
                     : removeLiq.step === 'removing' ? <BusyBtn label="Removing..." />
                     : removeLiq.step === 'success' ? <DoneBtn onClick={removeLiq.reset} />
                     : removeLiq.step === 'error' ? null : (
                      <button onClick={handleRemoveLiquidity} disabled={lpToRemove === 0n}
                        className={cn('w-full rounded-xl py-3 text-sm font-semibold transition-all',
                          lpToRemove === 0n ? 'bg-base-elevated text-ink-faint cursor-not-allowed' : 'bg-brand text-base-bg hover:bg-brand-dark')}>
                        Remove Liquidity
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function PoolInput({ symbol, logo, value, onChange }: {
  symbol: string; logo: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-xl bg-base-surface p-4 flex items-center gap-3">
      <input type="number" placeholder="0.0" value={value} onChange={e => onChange(e.target.value)}
        className="tabular-nums min-w-0 flex-1 bg-transparent text-2xl font-normal text-ink placeholder:text-ink-faint focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
      <div className="flex shrink-0 items-center gap-2 rounded-xl border border-base-border bg-base-elevated px-2.5 py-1.5">
        <div className="relative h-5 w-5 overflow-hidden rounded-full">
          <Image src={logo} alt={symbol} fill className="object-cover" sizes="20px" />
        </div>
        <span className="text-sm font-semibold text-ink">{symbol}</span>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-ink-faint">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

function SuccessMsg({ txHash, msg, onClose }: { txHash?: `0x${string}`; msg: string; onClose: () => void }) {
  const { etherscanUrl: url } = require('@/constants/contracts');
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-xl border border-green/20 bg-green/5 px-4 py-2.5">
        <CheckCircle2 className="h-4 w-4 text-green shrink-0" strokeWidth={1.5} />
        <div>
          <p className="text-xs font-semibold text-green">{msg}</p>
          {txHash && (
            <a href={etherscanUrl(txHash, 'tx')} target="_blank" rel="noopener noreferrer"
              className="text-[11px] text-ink-faint hover:text-ink-secondary">{shortenHash(txHash)}</a>
          )}
        </div>
      </div>
      <button onClick={onClose} className="w-full rounded-xl border border-base-border bg-base-elevated py-2 text-sm font-medium text-ink-secondary hover:text-ink transition-colors">Done</button>
    </div>
  );
}

function ErrorMsg({ error, onReset }: { error: string | null; onReset: () => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2 rounded-xl border border-red/20 bg-red/5 px-4 py-2.5">
        <XCircle className="h-4 w-4 text-red shrink-0 mt-0.5" strokeWidth={1.5} />
        <p className="text-xs text-red">{error ?? 'Something went wrong'}</p>
      </div>
      <button onClick={onReset} className="w-full rounded-xl border border-base-border bg-base-elevated py-2 text-sm font-medium text-ink-secondary hover:text-ink transition-colors">Try again</button>
    </div>
  );
}

function BusyBtn({ label }: { label: string }) {
  return (
    <button disabled className="flex w-full items-center justify-center gap-2 rounded-xl bg-base-elevated py-3 text-sm font-medium text-ink-secondary">
      <Loader2 className="h-4 w-4 animate-spin" />{label}
    </button>
  );
}

function DoneBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full rounded-xl border border-base-border bg-base-elevated py-2.5 text-sm font-medium text-ink-secondary hover:text-ink transition-colors">
      Done
    </button>
  );
}

function ConnectWalletBtn() {
  return (
    <ConnectButton.Custom>
      {({ openConnectModal }) => (
        <button onClick={openConnectModal} className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-base-bg hover:bg-brand-dark transition-all">
          Connect Wallet
        </button>
      )}
    </ConnectButton.Custom>
  );
}
