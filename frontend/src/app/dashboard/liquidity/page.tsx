'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatUnits } from 'viem';
import Image from 'next/image';
import { X, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { usePoolStats, usePoolShare } from '@/hooks/usePoolStats';
import { useAddLiquidity, type PoolKey } from '@/hooks/useAddLiquidity';
import { useRemoveLiquidity } from '@/hooks/useRemoveLiquidity';
import { useReadContract } from 'wagmi';
import { parseAmount, applySlippage } from '@/hooks/useSwap';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { usePriceTicker } from '@/hooks/usePriceTicker';
import { CONTRACTS, CONTRACT_ADDRESSES, isConfigured, etherscanUrl } from '@/constants/contracts';
import { POOL_ABI } from '@/constants/abis';
import { formatToken, shortenHash } from '@/utils/format';
import { cn } from '@/utils/cn';

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
    address:      CONTRACT_ADDRESSES.pool,
    label:        'BDX / MUSDC',
    token0Symbol: 'BDX',
    token1Symbol: 'MUSDC',
    token0Logo:   '/bulldex-logo.png',
    token1Logo:   '/musdc-icon.svg',
    fee:          '0.30%',
  },
  'bdx-weth': {
    address:      CONTRACT_ADDRESSES.poolBdxWeth,
    label:        'BDX / WETH',
    token0Symbol: 'BDX',
    token1Symbol: 'WETH',
    token0Logo:   '/bulldex-logo.png',
    token1Logo:   '/eth-icon.svg',
    fee:          '0.30%',
  },
};

export default function LiquidityPage() {
  const { address, isConnected } = useAccount();
  const [selectedPool, setSelectedPool] = useState<PoolKey | null>(null);
  const [actionType, setActionType]     = useState<ActionType>('add');
  const [slippageBps, setSlippageBps]   = useState(50);

  const balances  = useTokenBalances(address);
  const { tvlUSD } = usePriceTicker();

  // Close modal on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') closeModal(); }
    if (selectedPool) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedPool]); // eslint-disable-line react-hooks/exhaustive-deps

  function closeModal() {
    setSelectedPool(null);
    setT0Input('');
    setT1Input('');
  }

  const musdcPool = usePoolStats();
  const wethPool  = usePoolStats(CONTRACT_ADDRESSES.poolBdxWeth);
  const isBdxToken0InWethPool = CONTRACT_ADDRESSES.token.toLowerCase() < CONTRACT_ADDRESSES.weth.toLowerCase();

  // BDX/WETH LP balance
  const { data: wethLPBalanceRaw } = useReadContract({
    address: CONTRACT_ADDRESSES.poolBdxWeth,
    abi: POOL_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && isConfigured(CONTRACT_ADDRESSES.poolBdxWeth), staleTime: 15_000 },
  });
  const wethLPBalance = wethLPBalanceRaw as bigint | undefined;

  const poolKeyForHook = selectedPool ?? 'bdx-musdc';
  const addLiq    = useAddLiquidity(address, poolKeyForHook);
  const removeLiq = useRemoveLiquidity(address, poolKeyForHook);

  // ── Input state ──────────────────────────────────────────────────────────
  const [t0Input, setT0Input] = useState('');
  const [t1Input, setT1Input] = useState('');
  const t0Amount = useMemo(() => parseAmount(t0Input), [t0Input]);
  const t1Amount = useMemo(() => parseAmount(t1Input), [t1Input]);

  function handleT0Change(val: string) {
    setT0Input(val);
    const n = parseFloat(val);
    if (isNaN(n) || n <= 0) { setT1Input(''); return; }

    if (selectedPool === 'bdx-musdc') {
      if (!musdcPool.hasLiquidity || !musdcPool.bdxReserve || !musdcPool.musdcReserve) return;
      const paired = (n * Number(formatUnits(musdcPool.musdcReserve, 18)))
                       / Number(formatUnits(musdcPool.bdxReserve, 18));
      setT1Input(paired.toFixed(6));
      return;
    }
    if (selectedPool === 'bdx-weth') {
      if (!wethPool.hasLiquidity || !wethPool.reserve0 || !wethPool.reserve1) return;
      const bdxRes  = isBdxToken0InWethPool ? wethPool.reserve0 : wethPool.reserve1;
      const wethRes = isBdxToken0InWethPool ? wethPool.reserve1 : wethPool.reserve0;
      const paired = (n * Number(formatUnits(wethRes, 18)))
                       / Number(formatUnits(bdxRes, 18));
      setT1Input(paired.toFixed(6));
    }
  }

  // ── Remove liquidity state ───────────────────────────────────────────────
  const [lpPct, setLpPct] = useState(50);

  const { data: lpBalanceRaw } = useReadContract({
    address: selectedPool ? POOL_CONFIG[selectedPool].address : CONTRACT_ADDRESSES.pool,
    abi: POOL_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!selectedPool, staleTime: 15_000, refetchInterval: 15_000 },
  });
  const lpBalance = lpBalanceRaw as bigint | undefined;

  const lpToRemove = useMemo(() => {
    if (!lpBalance) return 0n;
    return (lpBalance * BigInt(lpPct)) / 100n;
  }, [lpBalance, lpPct]);

  const isBDXToken0 = musdcPool.token0?.toLowerCase() === CONTRACTS.token.address.toLowerCase();

  const poolShare = usePoolShare(
    lpBalance,
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

  function openPool(key: PoolKey, action: ActionType) {
    setSelectedPool(key);
    setActionType(action);
    setT0Input('');
    setT1Input('');
    setLpPct(50);
    addLiq.reset();
    removeLiq.reset();
  }

  // ── Derived ──────────────────────────────────────────────────────────────

  const myPositionCount = [
    lpBalance && lpBalance > 0n,
    wethLPBalance && wethLPBalance > 0n,
  ].filter(Boolean).length;

  const pool        = selectedPool ? POOL_CONFIG[selectedPool] : null;
  const t1Balance   = selectedPool === 'bdx-weth' ? balances.weth : balances.musdc;

  const addBusyLabel = addLiq.step === 'adding'
    ? 'Adding...'
    : addLiq.step === 'approving_t1'
    ? `Approving ${pool?.token1Symbol ?? ''}...`
    : 'Approving BDX...';
  const addIsBusy = ['approving_bdx', 'approving_t1', 'adding'].includes(addLiq.step);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in space-y-6">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">Liquidity Pools</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Provide liquidity to earn trading fees on every swap.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => openPool('bdx-musdc', 'add')}
            className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-base-bg hover:bg-brand-dark transition-all">
            + Add Liquidity
          </button>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* TVL */}
        <div className="rounded-2xl border border-base-border bg-base-card p-5">
          <p className="text-xs text-ink-faint mb-1">Total Value Locked</p>
          <p className="text-2xl font-semibold text-ink tabular-nums">
            {tvlUSD ?? '--'}
          </p>
          <p className="text-xs text-ink-faint mt-1">across both pools</p>
        </div>

        {/* Active pools */}
        <div className="rounded-2xl border border-base-border bg-base-card p-5">
          <p className="text-xs text-ink-faint mb-1">Active Pools</p>
          <p className="text-2xl font-semibold text-ink">2</p>
          <p className="text-xs text-ink-faint mt-1">0.30% fee per swap</p>
        </div>

        {/* My liquidity */}
        <div className="rounded-2xl border border-base-border bg-base-card p-5">
          <p className="text-xs text-ink-faint mb-1">My Positions</p>
          {!isConnected ? (
            <>
              <p className="text-2xl font-semibold text-ink">--</p>
              <p className="text-xs text-ink-faint mt-1">Connect wallet to view</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-semibold text-ink tabular-nums">{myPositionCount}</p>
              <p className="text-xs text-ink-faint mt-1">
                {myPositionCount === 0 ? 'No active positions' : `Active LP position${myPositionCount > 1 ? 's' : ''}`}
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── Pool table ──────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-base-border bg-base-card overflow-hidden">

        {/* Table header label */}
        <div className="px-5 py-4 border-b border-base-border">
          <h2 className="text-sm font-semibold text-ink">Active Pools</h2>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-12 gap-3 px-5 py-2.5 border-b border-base-border bg-base-surface text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
          <div className="col-span-4">Pool</div>
          <div className="col-span-3 text-right">TVL</div>
          <div className="col-span-2 text-right">Fee</div>
          <div className="col-span-2 text-right">My Liquidity</div>
          <div className="col-span-1" />
        </div>

        {(Object.entries(POOL_CONFIG) as [PoolKey, typeof POOL_CONFIG[PoolKey]][]).map(([key, cfg]) => {
          const isMUSCD     = key === 'bdx-musdc';
          const poolData    = isMUSCD ? musdcPool : wethPool;

          // TVL display — show both token reserves
          const tvlLine1 = poolData.hasLiquidity && poolData.reserve0 && poolData.reserve1
            ? isMUSCD
              ? `${musdcPool.bdxReserveFormatted} BDX`
              : isBdxToken0InWethPool
                ? `${wethPool.bdxReserveFormatted} BDX`
                : `${wethPool.musdcReserveFormatted} BDX`
            : '--';
          const tvlLine2 = poolData.hasLiquidity && poolData.reserve0 && poolData.reserve1
            ? isMUSCD
              ? `${musdcPool.musdcReserveFormatted} MUSDC`
              : isBdxToken0InWethPool
                ? `${wethPool.musdcReserveFormatted} WETH`
                : `${wethPool.bdxReserveFormatted} WETH`
            : null;

          const myLPBal     = isMUSCD ? lpBalance : wethLPBalance;
          const hasPosition = myLPBal && myLPBal > 0n;

          return (
            <div key={key}
              className="grid grid-cols-12 gap-3 px-5 py-4 border-b border-base-border last:border-0 hover:bg-base-elevated/40 transition-colors items-center">

              {/* Pool name — 4 cols */}
              <div className="col-span-4 flex items-center gap-3">
                <div className="relative w-9 h-6 shrink-0">
                  <div className="absolute left-0 top-0 h-6 w-6 rounded-full overflow-hidden ring-2 ring-base-card">
                    <Image src={cfg.token0Logo} alt={cfg.token0Symbol} fill className="object-cover" sizes="24px" />
                  </div>
                  <div className="absolute left-3.5 top-0 h-6 w-6 rounded-full overflow-hidden ring-2 ring-base-card">
                    <Image src={cfg.token1Logo} alt={cfg.token1Symbol} fill className="object-cover" sizes="24px" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{cfg.label}</p>
                  <span className="inline-block mt-0.5 rounded-md bg-base-elevated px-1.5 py-0.5 text-[10px] font-semibold text-ink-faint">
                    {cfg.fee} fee
                  </span>
                </div>
              </div>

              {/* TVL — 3 cols */}
              <div className="col-span-3 text-right">
                <p className="text-sm font-semibold text-ink tabular-nums">{tvlLine1}</p>
                {tvlLine2 && <p className="text-[11px] text-ink-faint">{tvlLine2}</p>}
              </div>

              {/* Fee — 2 cols */}
              <div className="col-span-2 text-right">
                <span className="text-sm font-semibold text-ink">{cfg.fee}</span>
              </div>

              {/* My liquidity — 2 cols */}
              <div className="col-span-2 text-right">
                {!isConnected ? (
                  <p className="text-xs text-ink-faint">--</p>
                ) : hasPosition ? (
                  <>
                    <p className="text-sm font-semibold text-green tabular-nums">{formatToken(myLPBal!, 18, 4)} LP</p>
                    {isMUSCD && (
                      <p className="text-[11px] text-ink-faint">{poolShare.sharePctFormatted}% share</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-ink-faint">--</p>
                )}
              </div>

              {/* Actions — 1 col */}
              <div className="col-span-1 flex items-center justify-end gap-1.5">
                <button
                  onClick={() => openPool(key, 'add')}
                  className="rounded-xl bg-brand px-3 py-1.5 text-xs font-semibold text-base-bg hover:bg-brand-dark transition-all whitespace-nowrap">
                  Add
                </button>
                {hasPosition && (
                  <button
                    onClick={() => openPool(key, 'remove')}
                    className="rounded-xl border border-base-border bg-base-elevated px-3 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink hover:border-base-border-light transition-colors whitespace-nowrap">
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
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-4">
            <div className="rounded-2xl border border-base-border bg-base-card shadow-elevated overflow-hidden">

              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-base-border">
                <div className="flex items-center gap-3">
                  <div className="relative w-9 h-6 shrink-0">
                    <div className="absolute left-0 top-0 h-6 w-6 rounded-full overflow-hidden ring-2 ring-base-card">
                      <Image src={pool.token0Logo} alt={pool.token0Symbol} fill className="object-cover" sizes="24px" />
                    </div>
                    <div className="absolute left-3.5 top-0 h-6 w-6 rounded-full overflow-hidden ring-2 ring-base-card">
                      <Image src={pool.token1Logo} alt={pool.token1Symbol} fill className="object-cover" sizes="24px" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{pool.label}</p>
                    <p className="text-[11px] text-ink-faint">{pool.fee} fee</p>
                  </div>
                </div>
                <button onClick={closeModal} className="text-ink-faint hover:text-ink transition-colors p-1">
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-base-border">
                {(['add', 'remove'] as ActionType[]).map(t => (
                  <button key={t}
                    onClick={() => { setActionType(t); addLiq.reset(); removeLiq.reset(); }}
                    className={cn(
                      'flex-1 py-2.5 text-xs font-semibold transition-colors',
                      actionType === t
                        ? 'border-b-2 border-brand text-brand'
                        : 'text-ink-secondary hover:text-ink',
                    )}>
                    {t === 'add' ? 'Add Liquidity' : 'Remove Liquidity'}
                  </button>
                ))}
              </div>

              <div className="p-5 space-y-3">

                {/* ── ADD ─────────────────────────────────────────────── */}
                {actionType === 'add' && (
                  <>
                    {/* Slippage */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-ink-faint">Max slippage</span>
                      <div className="flex gap-1">
                        {[{ l: '0.5%', v: 50 }, { l: '1%', v: 100 }, { l: '2%', v: 200 }].map(o => (
                          <button key={o.v} onClick={() => setSlippageBps(o.v)}
                            className={cn(
                              'rounded-lg px-2 py-0.5 text-[10px] font-semibold border transition-colors',
                              slippageBps === o.v
                                ? 'border-brand/30 bg-brand/10 text-brand'
                                : 'border-base-border bg-base-elevated text-ink-secondary hover:text-ink',
                            )}>
                            {o.l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* WETH note */}
                    {selectedPool === 'bdx-weth' && (
                      <div className="rounded-xl border border-base-border bg-base-surface px-3 py-2">
                        <p className="text-[11px] text-ink-faint">
                          Requires WETH (ERC-20).{' '}
                          <a href="/dashboard/faucet" className="text-brand hover:opacity-80 transition-opacity">Wrap ETH on the Faucet page.</a>
                        </p>
                      </div>
                    )}

                    {/* BDX input */}
                    <PoolInput
                      symbol={pool.token0Symbol}
                      logo={pool.token0Logo}
                      value={t0Input}
                      onChange={handleT0Change}
                      balance={`${parseFloat(formatUnits(balances.bdx, 18)).toFixed(4)} BDX`}
                      onHalf={() => handleT0Change((parseFloat(formatUnits(balances.bdx, 18)) / 2).toFixed(6))}
                      onMax={() => handleT0Change(parseFloat(formatUnits(balances.bdx, 18)).toFixed(6))}
                    />

                    <div className="flex justify-center">
                      <div className="h-6 w-6 rounded-full border border-base-border bg-base-elevated flex items-center justify-center text-ink-faint text-[10px]">+</div>
                    </div>

                    <PoolInput
                      symbol={pool.token1Symbol}
                      logo={pool.token1Logo}
                      value={t1Input}
                      onChange={setT1Input}
                      balance={`${parseFloat(formatUnits(t1Balance, 18)).toFixed(4)} ${pool.token1Symbol}`}
                      onHalf={() => setT1Input((parseFloat(formatUnits(t1Balance, 18)) / 2).toFixed(6))}
                      onMax={() => setT1Input(parseFloat(formatUnits(t1Balance, 18)).toFixed(6))}
                    />

                    {addLiq.step === 'success' && (
                      <SuccessMsg txHash={addLiq.txHash} msg="Liquidity added!" onClose={() => { addLiq.reset(); setT0Input(''); setT1Input(''); }} />
                    )}
                    {addLiq.step === 'error' && (
                      <ErrorMsg error={addLiq.error} onReset={addLiq.reset} />
                    )}

                    {!isConnected ? (
                      <ConnectWalletBtn />
                    ) : addIsBusy ? (
                      <BusyBtn label={addBusyLabel} />
                    ) : addLiq.step === 'success' || addLiq.step === 'error' ? null : (
                      <button
                        onClick={handleAddLiquidity}
                        disabled={t0Amount === 0n || t1Amount === 0n}
                        className={cn(
                          'w-full rounded-xl py-3 text-sm font-semibold transition-all',
                          t0Amount === 0n || t1Amount === 0n
                            ? 'bg-base-elevated text-ink-faint cursor-not-allowed'
                            : 'bg-brand text-base-bg hover:bg-brand-dark',
                        )}>
                        Add Liquidity
                      </button>
                    )}
                  </>
                )}

                {/* ── REMOVE ──────────────────────────────────────────── */}
                {actionType === 'remove' && (
                  <>
                    <div className="rounded-xl bg-base-surface p-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-ink-faint">Amount to remove</span>
                        <span className="text-xl font-semibold text-ink">{lpPct}%</span>
                      </div>
                      <input
                        type="range" min={1} max={100} value={lpPct}
                        onChange={e => setLpPct(Number(e.target.value))}
                        className="w-full accent-brand cursor-pointer"
                      />
                      <div className="flex gap-2 mt-3">
                        {[25, 50, 75, 100].map(p => (
                          <button key={p} onClick={() => setLpPct(p)}
                            className={cn(
                              'flex-1 rounded-lg py-1 text-[10px] font-semibold border transition-colors',
                              lpPct === p
                                ? 'border-brand/30 bg-brand/10 text-brand'
                                : 'border-base-border bg-base-elevated text-ink-secondary hover:text-ink',
                            )}>
                            {p === 100 ? 'MAX' : `${p}%`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedPool === 'bdx-musdc' && (
                      <div className="rounded-xl bg-base-surface px-4 py-3 space-y-1.5">
                        <InfoRow label="LP to burn" value={formatToken(lpToRemove, 18, 6)} />
                        <InfoRow label="BDX back"   value={`${formatToken(estimatedBack.t0, 18, 4)} BDX`} />
                        <InfoRow label="MUSDC back" value={`${formatToken(estimatedBack.t1, 18, 4)} MUSDC`} />
                      </div>
                    )}
                    {selectedPool === 'bdx-weth' && (
                      <div className="rounded-xl bg-base-surface px-4 py-3">
                        <InfoRow label="LP to burn" value={formatToken(lpToRemove, 18, 6)} />
                      </div>
                    )}

                    {removeLiq.step === 'success' && (
                      <SuccessMsg txHash={removeLiq.txHash} msg="Liquidity removed!" onClose={removeLiq.reset} />
                    )}
                    {removeLiq.step === 'error' && (
                      <ErrorMsg error={removeLiq.error} onReset={removeLiq.reset} />
                    )}

                    {!isConnected ? (
                      <ConnectWalletBtn />
                    ) : removeLiq.step === 'removing' ? (
                      <BusyBtn label="Removing..." />
                    ) : removeLiq.step === 'idle' ? (
                      <button
                        onClick={handleRemoveLiquidity}
                        disabled={lpToRemove === 0n}
                        className={cn(
                          'w-full rounded-xl py-3 text-sm font-semibold transition-all',
                          lpToRemove === 0n
                            ? 'bg-base-elevated text-ink-faint cursor-not-allowed'
                            : 'bg-brand text-base-bg hover:bg-brand-dark',
                        )}>
                        Remove Liquidity
                      </button>
                    ) : null}
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function PoolInput({
  symbol, logo, value, onChange, balance, onHalf, onMax,
}: {
  symbol: string; logo: string; value: string; onChange: (v: string) => void;
  balance?: string; onHalf?: () => void; onMax?: () => void;
}) {
  return (
    <div className="rounded-xl bg-base-surface p-4">
      {(balance || onHalf || onMax) && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-ink-faint">{balance ?? ''}</span>
          <div className="flex gap-1">
            {onHalf && (
              <button onClick={onHalf} className="rounded-md bg-base-elevated px-2 py-0.5 text-[10px] font-semibold text-ink-secondary hover:text-ink transition-colors">
                HALF
              </button>
            )}
            {onMax && (
              <button onClick={onMax} className="rounded-md bg-base-elevated px-2 py-0.5 text-[10px] font-semibold text-ink-secondary hover:text-ink transition-colors">
                MAX
              </button>
            )}
          </div>
        </div>
      )}
      <div className="flex items-center gap-3">
        <input
          type="number" placeholder="0.0" value={value} onChange={e => onChange(e.target.value)}
          className="tabular-nums min-w-0 flex-1 bg-transparent text-2xl font-normal text-ink placeholder:text-ink-faint focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        <div className="flex shrink-0 items-center gap-2 rounded-xl border border-base-border bg-base-elevated px-2.5 py-1.5">
          <div className="relative h-5 w-5 overflow-hidden rounded-full">
            <Image src={logo} alt={symbol} fill className="object-cover" sizes="20px" />
          </div>
          <span className="text-sm font-semibold text-ink">{symbol}</span>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-ink-faint">{label}</span>
      <span className="font-medium text-ink tabular-nums">{value}</span>
    </div>
  );
}

function SuccessMsg({ txHash, msg, onClose }: { txHash?: `0x${string}`; msg: string; onClose: () => void }) {
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
      <button onClick={onClose} className="w-full rounded-xl border border-base-border bg-base-elevated py-2 text-sm font-medium text-ink-secondary hover:text-ink transition-colors">
        Done
      </button>
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
      <button onClick={onReset} className="w-full rounded-xl border border-base-border bg-base-elevated py-2 text-sm font-medium text-ink-secondary hover:text-ink transition-colors">
        Try again
      </button>
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
