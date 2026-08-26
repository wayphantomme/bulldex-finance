'use client';

import { useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatUnits } from 'viem';
import Image from 'next/image';
import { usePoolStats, usePoolShare } from '@/hooks/usePoolStats';
import { useAddLiquidity } from '@/hooks/useAddLiquidity';
import { useRemoveLiquidity } from '@/hooks/useRemoveLiquidity';
import { useReadContract } from 'wagmi';
import { parseAmount, applySlippage } from '@/hooks/useSwap';
import { CONTRACTS, CONTRACT_ADDRESSES, etherscanUrl } from '@/constants/contracts';
import { POOL_ABI } from '@/constants/abis';
import { formatToken, shortenHash } from '@/utils/format';
import { cn } from '@/utils/cn';

type Tab = 'add' | 'remove';
type PoolKey = 'bdx-musdc' | 'bdx-weth';

const SLIPPAGE_OPTIONS = [{ label: '0.5%', bps: 50 }, { label: '1%', bps: 100 }, { label: '2%', bps: 200 }];

const POOL_CONFIG: Record<PoolKey, {
  address: `0x${string}`;
  label: string;
  token0Symbol: string;
  token1Symbol: string;
  token0Logo: string;
  token1Logo: string;
}> = {
  'bdx-musdc': {
    address: CONTRACT_ADDRESSES.pool,
    label: 'BDX / MUSDC',
    token0Symbol: 'BDX',
    token1Symbol: 'MUSDC',
    token0Logo: '/bulldex-logo.png',
    token1Logo: '/musdc-icon.svg',
  },
  'bdx-weth': {
    address: CONTRACT_ADDRESSES.poolBdxWeth,
    label: 'BDX / WETH',
    token0Symbol: 'BDX',
    token1Symbol: 'ETH',
    token0Logo: '/bulldex-logo.png',
    token1Logo: '/eth-icon.svg',
  },
};

export default function LiquidityPage() {
  const { address, isConnected } = useAccount();
  const [selectedPool, setSelectedPool] = useState<PoolKey>('bdx-musdc');
  const [tab, setTab]             = useState<Tab>('add');
  const [slippageBps, setSlippageBps] = useState(50);
  const [showSettings, setShowSettings] = useState(false);

  const poolConfig = POOL_CONFIG[selectedPool];

  // ── Pool stats — reads from selected pool ──────────────────────────────────
  const pool = usePoolStats();  // TODO: make usePoolStats accept pool address param
  // For BDX/WETH pool we use CONTRACTS.poolBdxWeth
  // Temporary: useReadContracts directly for the selected pool
  const poolAddress = poolConfig.address;

  const isBDXToken0 = useMemo(
    () => pool.token0?.toLowerCase() === CONTRACTS.token.address.toLowerCase(),
    [pool.token0],
  );

  // ── User LP balance for selected pool ─────────────────────────────────────
  const { data: lpBalance } = useReadContract({
    address: poolAddress,
    abi: POOL_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && poolAddress !== '0x0000000000000000000000000000000000000000', staleTime: 10_000, refetchInterval: 15_000 },
  });

  const share = usePoolShare(
    lpBalance as bigint | undefined,
    pool.totalSupply,
    pool.reserve0,
    pool.reserve1,
    isBDXToken0,
  );

  // ── Add liquidity state ────────────────────────────────────────────────────
  const [bdxInput,   setBdxInput]   = useState('');
  const [musdcInput, setMusdcInput] = useState('');

  const bdxAmount   = useMemo(() => parseAmount(bdxInput),   [bdxInput]);
  const musdcAmount = useMemo(() => parseAmount(musdcInput), [musdcInput]);

  // Auto-fill the paired amount based on current pool ratio
  function handleBdxInput(val: string) {
    setBdxInput(val);
    if (!pool.hasLiquidity || !pool.bdxReserve || !pool.musdcReserve) return;
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0) {
      const paired = (n * Number(formatUnits(pool.musdcReserve, 18))) /
                         Number(formatUnits(pool.bdxReserve, 18));
      setMusdcInput(paired.toFixed(6));
    } else {
      setMusdcInput('');
    }
  }

  function handleMusdcInput(val: string) {
    setMusdcInput(val);
    if (!pool.hasLiquidity || !pool.bdxReserve || !pool.musdcReserve) return;
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0) {
      const paired = (n * Number(formatUnits(pool.bdxReserve, 18))) /
                         Number(formatUnits(pool.musdcReserve, 18));
      setBdxInput(paired.toFixed(6));
    } else {
      setBdxInput('');
    }
  }

  const addLiq = useAddLiquidity(address);

  async function handleAddLiquidity() {
    if (!address || bdxAmount === 0n || musdcAmount === 0n) return;
    const bdxMin   = applySlippage(bdxAmount,   slippageBps);
    const musdcMin = applySlippage(musdcAmount, slippageBps);
    await addLiq.addLiquidity(bdxAmount, musdcAmount, bdxMin, musdcMin);
    if (addLiq.step === 'success') { setBdxInput(''); setMusdcInput(''); }
  }

  // Estimated LP tokens to receive
  const estimatedLP = useMemo(() => {
    if (!pool.totalSupply || !pool.bdxReserve || bdxAmount === 0n) return 0n;
    if (!pool.hasLiquidity) return 0n;
    return (bdxAmount * pool.totalSupply) / pool.bdxReserve;
  }, [bdxAmount, pool.totalSupply, pool.bdxReserve, pool.hasLiquidity]);

  // ── Remove liquidity state ─────────────────────────────────────────────────
  const [lpPct, setLpPct] = useState(50);
  const removeLiq = useRemoveLiquidity(address);

  const lpToRemove = useMemo(() => {
    if (!lpBalance) return 0n;
    return ((lpBalance as bigint) * BigInt(lpPct)) / 100n;
  }, [lpBalance, lpPct]);

  // Estimated tokens back
  const estimatedBack = useMemo(() => {
    if (!lpToRemove || lpToRemove === 0n || !pool.totalSupply || !pool.bdxReserve || !pool.musdcReserve) {
      return { bdx: 0n, musdc: 0n };
    }
    const bdxBack   = isBDXToken0
      ? (lpToRemove * pool.bdxReserve)   / pool.totalSupply
      : (lpToRemove * pool.musdcReserve) / pool.totalSupply;
    const musdcBack = isBDXToken0
      ? (lpToRemove * pool.musdcReserve) / pool.totalSupply
      : (lpToRemove * pool.bdxReserve)   / pool.totalSupply;
    return { bdx: bdxBack, musdc: musdcBack };
  }, [lpToRemove, pool, isBDXToken0]);

  async function handleRemoveLiquidity() {
    if (!address || lpToRemove === 0n) return;
    const bdxMin   = applySlippage(estimatedBack.bdx,   slippageBps);
    const musdcMin = applySlippage(estimatedBack.musdc, slippageBps);
    const min0 = isBDXToken0 ? bdxMin   : musdcMin;
    const min1 = isBDXToken0 ? musdcMin : bdxMin;
    await removeLiq.removeLiquidity(lpToRemove, min0, min1);
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in space-y-6">

      {/* Page header + Pool selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-base font-semibold text-ink">Liquidity</h1>
          <p className="mt-0.5 text-xs text-ink-secondary">
            Provide liquidity to earn 0.3% of every swap fee.
          </p>
        </div>

        {/* Pool selector tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-base-border bg-base-card p-1">
          {(Object.entries(POOL_CONFIG) as [PoolKey, typeof POOL_CONFIG[PoolKey]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => { setSelectedPool(key); setBdxInput(''); setMusdcInput(''); addLiq.reset(); removeLiq.reset(); }}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                selectedPool === key
                  ? 'bg-base-elevated text-ink'
                  : 'text-ink-faint hover:text-ink-secondary',
              )}
            >
              <div className="relative h-4 w-4 overflow-hidden rounded-full">
                <Image src={cfg.token0Logo} alt={cfg.token0Symbol} fill className="object-cover" sizes="16px" />
              </div>
              <div className="relative h-4 w-4 overflow-hidden rounded-full -ml-1.5">
                <Image src={cfg.token1Logo} alt={cfg.token1Symbol} fill className="object-cover" sizes="16px" />
              </div>
              <span>{cfg.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* ── Left: Pool stats ──────────────────────────────────────────── */}
        <div className="space-y-3 lg:col-span-1">

          {/* Pool info card */}
          <div className="rounded-xl border border-base-border bg-base-card p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-faint">
              {poolConfig.label} Pool
            </p>
            {pool.isLoading ? (
              <div className="space-y-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-8 animate-pulse rounded-lg bg-base-elevated" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <StatRow label={`${poolConfig.token0Symbol} Reserve`}  value={`${pool.bdxReserveFormatted} ${poolConfig.token0Symbol}`} />
                <StatRow label={`${poolConfig.token1Symbol} Reserve`}  value={`${pool.musdcReserveFormatted} ${poolConfig.token1Symbol}`} />
                <StatRow label={`${poolConfig.token0Symbol} Price`}    value={`${pool.bdxPriceFormatted} ${poolConfig.token1Symbol}`} />
                <StatRow label={`${poolConfig.token1Symbol} Price`}    value={`${pool.musdcPriceFormatted} ${poolConfig.token0Symbol}`} />
                <StatRow label="Total LP"      value={pool.totalSupplyFormatted} />
                <StatRow label="Swap Fee"      value="0.30%" highlight />
              </div>
            )}
          </div>

          {/* Your position card */}
          {isConnected && (
            <div className="rounded-xl border border-base-border bg-base-card p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-faint">
                Your Position
              </p>
              {!lpBalance || (lpBalance as bigint) === 0n ? (
                <p className="text-xs text-ink-faint">No position yet. Add liquidity to start earning fees.</p>
              ) : (
                <div className="space-y-2">
                  <StatRow label="LP Balance" value={formatToken(lpBalance as bigint, 18, 6)} highlight />
                  <StatRow label="Pool Share" value={`${share.sharePctFormatted}%`} />
                  <StatRow label={poolConfig.token0Symbol} value={`${formatToken(share.bdxAmount, 18, 4)} ${poolConfig.token0Symbol}`} />
                  <StatRow label={poolConfig.token1Symbol} value={`${formatToken(share.musdcAmount, 18, 4)} ${poolConfig.token1Symbol}`} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right: Action card ────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-base-border bg-base-card">

            {/* Tab header */}
            <div className="flex border-b border-base-border">
              {(['add', 'remove'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    'flex-1 py-3 text-sm font-medium transition-colors',
                    tab === t
                      ? 'border-b-2 border-brand text-brand'
                      : 'text-ink-secondary hover:text-ink',
                  )}
                >
                  {t === 'add' ? 'Add Liquidity' : 'Remove Liquidity'}
                </button>
              ))}
              {/* Settings */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={cn('px-4 text-ink-faint transition-colors hover:text-ink', showSettings && 'text-brand')}
                aria-label="Settings"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
              </button>
            </div>

            {/* Slippage settings */}
            {showSettings && (
              <div className="mx-5 mt-4 rounded-lg border border-base-border bg-base-surface px-4 py-3">
                <p className="mb-2 text-xs text-ink-faint">Max slippage</p>
                <div className="flex gap-2">
                  {SLIPPAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.bps}
                      onClick={() => setSlippageBps(opt.bps)}
                      className={cn(
                        'flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors border',
                        slippageBps === opt.bps
                          ? 'bg-brand/10 text-brand border-green/30'
                          : 'bg-base-elevated text-ink-secondary border-base-border hover:text-ink',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-5">
              {tab === 'add' ? (
                <AddTab
                  pool={pool}
                  poolConfig={poolConfig}
                  bdxInput={bdxInput}
                  musdcInput={musdcInput}
                  onBdxChange={handleBdxInput}
                  onMusdcChange={handleMusdcInput}
                  estimatedLP={estimatedLP}
                  addLiq={addLiq}
                  onSubmit={handleAddLiquidity}
                  onReset={() => { addLiq.reset(); setBdxInput(''); setMusdcInput(''); }}
                  isConnected={isConnected}
                />
              ) : (
                <RemoveTab
                  pool={pool}
                  poolConfig={poolConfig}
                  lpBalance={lpBalance as bigint | undefined}
                  lpPct={lpPct}
                  onPctChange={setLpPct}
                  lpToRemove={lpToRemove}
                  estimatedBack={estimatedBack}
                  removeLiq={removeLiq}
                  onSubmit={handleRemoveLiquidity}
                  onReset={removeLiq.reset}
                  isConnected={isConnected}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Add Liquidity Tab ────────────────────────────────────────────────────────

function AddTab({
  pool, poolConfig, bdxInput, musdcInput, onBdxChange, onMusdcChange,
  estimatedLP, addLiq, onSubmit, onReset, isConnected,
}: {
  pool: ReturnType<typeof usePoolStats>;
  poolConfig: typeof POOL_CONFIG[PoolKey];
  bdxInput: string; musdcInput: string;
  onBdxChange: (v: string) => void;
  onMusdcChange: (v: string) => void;
  estimatedLP: bigint;
  addLiq: ReturnType<typeof useAddLiquidity>;
  onSubmit: () => void;
  onReset: () => void;
  isConnected: boolean;
}) {
  const isFirstDeposit = !pool.hasLiquidity;
  const isEmpty = bdxInput === '' || musdcInput === '' ||
    parseFloat(bdxInput) === 0 || parseFloat(musdcInput) === 0;

  return (
    <div className="space-y-3">
      {isFirstDeposit && (
        <div className="rounded-lg border border-yellow/20 bg-yellow/5 px-3 py-2.5 text-xs text-yellow">
          First deposit sets the initial price ratio. Enter any amounts.
        </div>
      )}

      {/* BDX input */}
      <TokenInput label={`${poolConfig.token0Symbol} amount`} symbol={poolConfig.token0Symbol} logoSrc={poolConfig.token0Logo} value={bdxInput} onChange={onBdxChange} />

      <div className="flex justify-center">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-base-border bg-base-elevated text-ink-faint">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m0 0l-4-4m4 4l4-4" />
          </svg>
        </div>
      </div>

      {/* Paired token input */}
      <TokenInput label={`${poolConfig.token1Symbol} amount`} symbol={poolConfig.token1Symbol} logoSrc={poolConfig.token1Logo} value={musdcInput} onChange={onMusdcChange} />

      {/* Preview */}
      {!isEmpty && estimatedLP > 0n && (
        <div className="rounded-lg bg-base-surface px-4 py-3 space-y-1.5">
          <InfoRow label="Estimated LP tokens" value={formatToken(estimatedLP, 18, 6)} />
          <InfoRow label="Share of pool"
            value={
              pool.totalSupply && pool.totalSupply > 0n
                ? `${(Number(estimatedLP * 10000n / (pool.totalSupply + estimatedLP)) / 100).toFixed(3)}%`
                : '100%'
            }
          />
        </div>
      )}

      {/* Action button */}
      <ActionButton
        step={addLiq.step as string}
        error={addLiq.error}
        txHash={addLiq.txHash}
        isConnected={isConnected}
        isEmpty={isEmpty}
        poolNotReady={!pool.isConfigured}
        onSubmit={onSubmit}
        onReset={onReset}
        labels={{
          needsApprove: 'Approve BDX',
          action: 'Add Liquidity',
          approving: 'Approving...',
          actioning: 'Adding Liquidity...',
          success: 'Liquidity added!',
          emptyMsg: 'Enter amounts',
        }}
        stepApproving={addLiq.step === 'approving_bdx' || addLiq.step === 'approving_musdc'}
        stepActioning={addLiq.step === 'adding'}
        stepSuccess={addLiq.step === 'success'}
        stepError={addLiq.step === 'error'}
        needsApproval={false}
      />
    </div>
  );
}

// ─── Remove Liquidity Tab ─────────────────────────────────────────────────────

function RemoveTab({
  pool, poolConfig, lpBalance, lpPct, onPctChange, lpToRemove, estimatedBack,
  removeLiq, onSubmit, onReset, isConnected,
}: {
  pool: ReturnType<typeof usePoolStats>;
  poolConfig: typeof POOL_CONFIG[PoolKey];
  lpBalance: bigint | undefined;
  lpPct: number;
  onPctChange: (n: number) => void;
  lpToRemove: bigint;
  estimatedBack: { bdx: bigint; musdc: bigint };
  removeLiq: ReturnType<typeof useRemoveLiquidity>;
  onSubmit: () => void;
  onReset: () => void;
  isConnected: boolean;
}) {
  const hasPosition = !!lpBalance && (lpBalance as bigint) > 0n;

  if (!isConnected) {
    return (
      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <button onClick={openConnectModal}
            className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-base-bg hover:opacity-90 transition-opacity">
            Connect Wallet
          </button>
        )}
      </ConnectButton.Custom>
    );
  }

  if (!hasPosition) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-ink-secondary">You have no liquidity position.</p>
        <p className="mt-1 text-xs text-ink-faint">Add liquidity first to be able to remove it.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Amount slider */}
      <div className="rounded-xl bg-base-surface p-5">
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-xs text-ink-faint">Amount to remove</span>
          <span className="text-3xl font-bold text-ink">{lpPct}%</span>
        </div>
        <input
          type="range"
          min={1} max={100} value={lpPct}
          onChange={(e) => onPctChange(Number(e.target.value))}
          className="w-full accent-green cursor-pointer"
        />
        {/* Quick pct buttons */}
        <div className="mt-3 flex gap-2">
          {[25, 50, 75, 100].map((p) => (
            <button
              key={p}
              onClick={() => onPctChange(p)}
              className={cn(
                'flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors border',
                lpPct === p
                  ? 'border-green/30 bg-brand/10 text-brand'
                  : 'border-base-border bg-base-elevated text-ink-secondary hover:text-ink',
              )}
            >
              {p === 100 ? 'MAX' : `${p}%`}
            </button>
          ))}
        </div>
      </div>

      {/* LP to burn */}
      <div className="rounded-lg bg-base-surface px-4 py-3 space-y-1.5">
        <InfoRow label="LP tokens to burn"                          value={formatToken(lpToRemove, 18, 6)} />
        <InfoRow label={`You receive (${poolConfig.token0Symbol})`} value={`${formatToken(estimatedBack.bdx,   18, 4)} ${poolConfig.token0Symbol}`} />
        <InfoRow label={`You receive (${poolConfig.token1Symbol})`} value={`${formatToken(estimatedBack.musdc, 18, 4)} ${poolConfig.token1Symbol}`} />
      </div>

      <ActionButton
        step={removeLiq.step as string}
        error={removeLiq.error}
        txHash={removeLiq.txHash}
        isConnected={isConnected}
        isEmpty={lpToRemove === 0n}
        poolNotReady={!pool.isConfigured}
        onSubmit={onSubmit}
        onReset={onReset}
        labels={{
          needsApprove: 'Remove Liquidity',
          action: 'Remove Liquidity',
          approving: 'Approving LP...',
          actioning: 'Removing...',
          success: 'Liquidity removed!',
          emptyMsg: 'Select amount',
        }}
        stepApproving={removeLiq.step === 'approving_lp'}
        stepActioning={removeLiq.step === 'removing'}
        stepSuccess={removeLiq.step === 'success'}
        stepError={removeLiq.step === 'error'}
        needsApproval={false}
      />
    </div>
  );
}

// ─── Reusable sub-components ──────────────────────────────────────────────────

function TokenInput({
  label, symbol, logoSrc, value, onChange,
}: {
  label: string; symbol: string; logoSrc: string;
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-xl bg-base-surface p-4">
      <p className="mb-2 text-xs text-ink-faint">{label}</p>
      <div className="flex items-center gap-3">
        <input
          type="number"
          placeholder="0.0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-2xl font-semibold text-ink placeholder:text-ink-faint focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <div className="flex shrink-0 items-center gap-2 rounded-xl border border-base-border bg-base-elevated px-3 py-2">
          <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full">
            <Image src={logoSrc} alt={symbol} fill className="object-cover" sizes="24px" />
          </div>
          <span className="text-sm font-semibold text-ink">{symbol}</span>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-base-surface px-3 py-2">
      <span className="text-xs text-ink-faint">{label}</span>
      <span className={cn('text-xs font-semibold', highlight ? 'text-green' : 'text-ink')}>{value}</span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-ink-faint">{label}</span>
      <span className="text-xs font-medium text-ink">{value}</span>
    </div>
  );
}

function ActionButton({
  step, error, txHash, isConnected, isEmpty, poolNotReady,
  onSubmit, onReset, labels, stepApproving, stepActioning,
  stepSuccess, stepError, needsApproval,
}: {
  step: string; error: string | null; txHash: `0x${string}` | undefined;
  isConnected: boolean; isEmpty: boolean; poolNotReady: boolean;
  onSubmit: () => void; onReset: () => void;
  labels: { needsApprove: string; action: string; approving: string; actioning: string; success: string; emptyMsg: string };
  stepApproving: boolean; stepActioning: boolean; stepSuccess: boolean; stepError: boolean;
  needsApproval: boolean;
}) {
  if (!isConnected) {
    return (
      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <button onClick={openConnectModal}
            className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-base-bg hover:opacity-90 transition-opacity">
            Connect Wallet
          </button>
        )}
      </ConnectButton.Custom>
    );
  }

  if (poolNotReady) return (
    <button disabled className="w-full rounded-xl bg-base-elevated py-3 text-sm font-medium text-ink-faint cursor-not-allowed">
      Pool not deployed
    </button>
  );

  if (isEmpty) return (
    <button disabled className="w-full rounded-xl bg-base-elevated py-3 text-sm font-medium text-ink-faint cursor-not-allowed">
      {labels.emptyMsg}
    </button>
  );

  if (stepApproving) return (
    <button disabled className="flex w-full items-center justify-center gap-2 rounded-xl bg-base-elevated py-3 text-sm font-medium text-ink-secondary">
      <Spinner />{labels.approving}
    </button>
  );

  if (stepActioning) return (
    <button disabled className="flex w-full items-center justify-center gap-2 rounded-xl bg-base-elevated py-3 text-sm font-medium text-ink-secondary">
      <Spinner />{labels.actioning}
    </button>
  );

  if (stepSuccess) return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-2 rounded-xl border border-green/20 bg-green/5 py-3">
        <svg className="h-4 w-4 text-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm font-semibold text-green">{labels.success}</span>
      </div>
      {txHash && (
        <a href={etherscanUrl(txHash, 'tx')} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 text-xs text-ink-faint hover:text-ink-secondary transition-colors">
          {shortenHash(txHash)} →
        </a>
      )}
      <button onClick={onReset}
        className="w-full rounded-xl border border-base-border bg-base-elevated py-2.5 text-sm font-medium text-ink-secondary hover:text-ink transition-colors">
        Done
      </button>
    </div>
  );

  if (stepError) return (
    <div className="space-y-2">
      <div className="rounded-xl border border-red/20 bg-red/10 px-3 py-2.5 text-xs text-red">
        {error ?? 'Something went wrong'}
      </div>
      <button onClick={onReset}
        className="w-full rounded-xl border border-base-border bg-base-elevated py-2.5 text-sm font-medium text-ink-secondary hover:text-ink transition-colors">
        Try again
      </button>
    </div>
  );

  return (
    <button onClick={onSubmit}
      className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-base-bg hover:opacity-90 transition-opacity">
      {needsApproval ? labels.needsApprove : labels.action}
    </button>
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
