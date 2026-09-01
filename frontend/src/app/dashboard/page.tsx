'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { formatUnits } from 'viem';
import { useReadContract } from 'wagmi';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useTokenInfo } from '@/hooks/useTokenInfo';
import { usePoolStats } from '@/hooks/usePoolStats';
import { usePriceTicker } from '@/hooks/usePriceTicker';
import { useLendingPosition, useLendingStats } from '@/hooks/useLending';
import { formatToken } from '@/utils/format';
import { Skeleton } from '@/components/ui/Skeleton';
import { CONTRACT_ADDRESSES, etherscanUrl, isConfigured } from '@/constants/contracts';
import { POOL_ABI } from '@/constants/abis';
import { cn } from '@/utils/cn';
import { ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import Image from 'next/image';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function DeltaBadge({ value, period }: { value: string; period?: string }) {
  const isPositive = value.startsWith('+');
  const isNegative = value.startsWith('-');
  const isNeutral = !isPositive && !isNegative;

  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-[11px] font-medium',
      isPositive && 'text-[#22c55e]',
      isNegative && 'text-[#ef4444]',
      isNeutral && 'text-[#525252]',
    )}>
      {isPositive && <TrendingUp className="h-3 w-3" />}
      {isNegative && <TrendingDown className="h-3 w-3" />}
      {period && <span className="text-[#525252]">{period}:</span>}
      {value}
    </span>
  );
}

function ProgressBar({ percent, color = '#10b981' }: { percent: number; color?: string }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-[#1a1a1a]">
      <div
        className="h-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%`, backgroundColor: color }}
      />
    </div>
  );
}

// Mock chart data (replace with real data later)
const mockChartData = [
  { value: 18200 },
  { value: 19100 },
  { value: 18800 },
  { value: 20400 },
  { value: 21200 },
  { value: 22800 },
  { value: 24100 },
  { value: 23600 },
  { value: 25200 },
  { value: 26400 },
  { value: 27800 },
  { value: 29091 },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { raw: balance, isLoading: balLoading } = useTokenBalance(address);
  const { symbol } = useTokenInfo();
  const pool = usePoolStats();
  const { bdxPriceUSD, bdxPriceRaw, tvlUSD } = usePriceTicker();
  const lendPos = useLendingPosition(address);
  const lendStats = useLendingStats();

  // LP balance
  const { data: lpBalanceRaw } = useReadContract({
    address: CONTRACT_ADDRESSES.pool,
    abi: POOL_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && isConfigured(CONTRACT_ADDRESSES.pool), staleTime: 15_000 },
  });
  const lpBalance = lpBalanceRaw as bigint | undefined;

  const bdxNum = balance ? parseFloat(formatUnits(balance, 18)) : 0;
  const portfolioUSD = bdxPriceRaw && bdxNum > 0 ? bdxNum * bdxPriceRaw : null;

  const hasLP = lpBalance && lpBalance > 0n;
  const hasLend = lendPos.collateral > 0n;

  // Mock data for demo (replace with real subgraph data)
  const topPools = [
    { name: 'BDX/MUSDC', tvl: '$2.1M', apr: '12.4%', volume24h: '$180K', change: '+8.2%' },
    { name: 'BDX/WETH', tvl: '$820K', apr: '18.7%', volume24h: '$64K', change: '+15.3%' },
  ];

  const recentActivity = [
    { type: 'Swap', amount: '500 BDX → 245 MUSDC', time: '2m ago', user: '0x1234...5678' },
    { type: 'Add LP', amount: '1,000 BDX + 490 MUSDC', time: '8m ago', user: '0xabcd...ef12' },
    { type: 'Borrow', amount: '300 MUSDC', time: '15m ago', user: '0x9876...4321' },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-semibold text-[#f5f5f5] tracking-tight">
            Overview
          </h1>
          <p className="mt-1 text-[13px] text-[#737373]">
            Your live positions on Sepolia testnet.
          </p>
        </div>

      </div>

      {/* ── Main Content Grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Your Portfolio Card with Chart — HERO */}
          {isConnected && (
            <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] overflow-hidden">
              {/* Header */}
              <div className="p-6 pb-4 flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-[15px] font-semibold text-[#f5f5f5] mb-1">Your Portfolio</h2>
                  <p className="text-[11px] text-[#525252]">Latest</p>
                </div>
                
                {/* Token Logos (right side) */}
                <div className="flex items-center">
                  {/* BDX logo */}
                  <div className="relative h-8 w-8 rounded-full border border-[#1a1a1a] bg-[#111111] overflow-hidden flex items-center justify-center">
                    <Image
                      src="/bulldex-logo.png"
                      alt="BDX"
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                  
                  {/* USDC icon */}
                  <div className="relative h-8 w-8 rounded-full border border-[#1a1a1a] bg-[#2775CA] overflow-hidden flex items-center justify-center -ml-2">
                    <svg className="h-5 w-5" viewBox="0 0 32 32" fill="none">
                      <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#2775CA"/>
                      <path d="M20.5 18.1429C20.5 15.7429 19.05 14.9429 16.15 14.5429C14.1 14.2429 13.75 13.7429 13.75 12.8429C13.75 11.9429 14.35 11.3429 15.55 11.3429C16.65 11.3429 17.35 11.7429 17.65 12.6429C17.7 12.7429 17.8 12.8429 17.95 12.8429H18.9C19.1 12.8429 19.25 12.6429 19.25 12.4429V12.3929C18.95 10.9429 17.75 9.84286 16.25 9.64286V7.99286C16.25 7.84286 16.15 7.69286 15.95 7.64286H14.9C14.75 7.64286 14.6 7.74286 14.55 7.94286V9.59286C12.7 9.84286 11.45 11.0929 11.45 12.8929C11.45 15.1929 12.85 16.0429 15.75 16.4429C17.6 16.7429 18.15 17.1429 18.15 18.1429C18.15 19.1429 17.3 19.9429 16.05 19.9429C14.45 19.9429 13.85 19.3429 13.65 18.4429C13.6 18.2929 13.5 18.1929 13.3 18.1929H12.3C12.1 18.1929 11.95 18.3429 11.95 18.5429V18.5929C12.2 20.2429 13.3 21.3929 14.55 21.6429V23.2929C14.55 23.4429 14.65 23.5929 14.85 23.6429H15.9C16.05 23.6429 16.2 23.5429 16.25 23.3429V21.6929C18.15 21.3929 19.45 20.0929 19.45 18.2429L20.5 18.1429Z" fill="white"/>
                    </svg>
                  </div>
                  
                  {/* ETH icon */}
                  <div className="relative h-8 w-8 rounded-full border border-[#1a1a1a] bg-[#627EEA] overflow-hidden flex items-center justify-center -ml-2">
                    <svg className="h-5 w-5" viewBox="0 0 32 32" fill="none">
                      <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#627EEA"/>
                      <path d="M16.498 4V12.87L23.995 16.22L16.498 4Z" fill="white" fillOpacity="0.602"/>
                      <path d="M16.498 4L9 16.22L16.498 12.87V4Z" fill="white"/>
                      <path d="M16.498 21.968V27.995L24 17.616L16.498 21.968Z" fill="white" fillOpacity="0.602"/>
                      <path d="M16.498 27.995V21.967L9 17.616L16.498 27.995Z" fill="white"/>
                      <path d="M16.498 20.573L23.995 16.22L16.498 12.872V20.573Z" fill="white" fillOpacity="0.2"/>
                      <path d="M9 16.22L16.498 20.573V12.872L9 16.22Z" fill="white" fillOpacity="0.602"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Portfolio Value */}
              <div className="px-6 pb-4">
                {portfolioUSD ? (
                  <>
                    <p className="font-mono text-[32px] font-semibold text-[#f5f5f5] leading-none mb-1">
                      ${portfolioUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <DeltaBadge value="+18.4%" period="30d" />
                  </>
                ) : (
                  <p className="font-mono text-[32px] font-semibold text-[#525252] leading-none">
                    $0.00
                  </p>
                )}
              </div>

              {/* Chart */}
              <div className="h-[120px] px-6 pb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockChartData}>
                    <defs>
                      <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <YAxis domain={['dataMin', 'dataMax']} hide />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#portfolioGradient)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Positions Grid */}
              <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#1a1a1a] pt-6">
                {/* BDX Balance */}
                <div>
                  <p className="text-[11px] text-[#525252] mb-2">BDX Balance</p>
                  {balLoading ? (
                    <Skeleton className="h-6 w-24" />
                  ) : (
                    <>
                      <p className="font-mono text-[18px] font-semibold text-[#f5f5f5] leading-none mb-1">
                        {formatToken(balance, 18, 2)}
                      </p>
                      {portfolioUSD && (
                        <p className="text-[11px] text-[#525252]">
                          ${portfolioUSD.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* LP Position */}
                <div>
                  <p className="text-[11px] text-[#525252] mb-2">LP Tokens</p>
                  <p className="font-mono text-[18px] font-semibold text-[#f5f5f5] leading-none mb-1">
                    {hasLP ? formatToken(lpBalance, 18, 4) : '0.00'}
                  </p>
                  <p className="text-[11px] text-[#525252]">BDX/MUSDC</p>
                </div>

                {/* Lending Position */}
                <div>
                  <p className="text-[11px] text-[#525252] mb-2">Collateral</p>
                  <p className="font-mono text-[18px] font-semibold text-[#f5f5f5] leading-none mb-1">
                    {hasLend ? formatToken(lendPos.collateral, 18, 2) : '0.00'}
                  </p>
                  <p className="text-[11px] text-[#525252]">BDX deposited</p>
                </div>
              </div>
            </div>
          )}

          {/* Protocol Stats (smaller, secondary) ─────────────────────── */}
          <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-5">
            <h2 className="text-[13px] font-semibold text-[#f5f5f5] mb-4">Protocol Stats</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Protocol TVL */}
              <div>
                <p className="text-[10px] text-[#525252] mb-1">Protocol TVL</p>
                <p className="font-mono text-[16px] font-semibold text-[#f5f5f5] leading-none mb-0.5">
                  {tvlUSD ?? '$2.9M'}
                </p>
                <DeltaBadge value="+12.4%" period="30d" />
              </div>

              {/* BDX Price */}
              <div>
                <p className="text-[10px] text-[#525252] mb-1">BDX Price</p>
                <p className="font-mono text-[16px] font-semibold text-[#f5f5f5] leading-none mb-0.5">
                  {bdxPriceUSD ?? '$0.49'}
                </p>
                <DeltaBadge value="+5.2%" period="30d" />
              </div>

              {/* 24h Volume */}
              <div>
                <p className="text-[10px] text-[#525252] mb-1">Volume (24h)</p>
                <p className="font-mono text-[16px] font-semibold text-[#f5f5f5] leading-none mb-0.5">
                  $244K
                </p>
                <DeltaBadge value="+8.9%" period="30d" />
              </div>

              {/* Total Borrowed */}
              <div>
                <p className="text-[10px] text-[#525252] mb-1">Total Borrowed</p>
                <p className="font-mono text-[16px] font-semibold text-[#f5f5f5] leading-none mb-0.5">
                  $180K
                </p>
                <DeltaBadge value="+15.3%" period="30d" />
              </div>
            </div>
          </div>

          {/* Top Pools Leaderboard */}
          <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-[#f5f5f5]">Top Pools</h2>
                <p className="mt-0.5 text-[11px] text-[#525252]">Latest (30d change)</p>
              </div>
              <Link
                href="/dashboard/liquidity"
                className="flex items-center gap-1 text-[12px] text-[#10b981] hover:text-[#34d399] transition-colors"
              >
                View all
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {topPools.map((p, i) => (
                <div key={p.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#525252] w-4">{i + 1}</span>
                      <span className="text-[13px] font-medium text-[#f5f5f5]">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[13px] text-[#f5f5f5]">{p.tvl}</span>
                      <DeltaBadge value={p.change} />
                    </div>
                  </div>
                  <ProgressBar
                    percent={i === 0 ? 100 : 40}
                    color={i === 0 ? '#10b981' : '#3b82f6'}
                  />
                  <div className="mt-1 flex items-center justify-between text-[11px] text-[#525252]">
                    <span>APR: {p.apr}</span>
                    <span>24h: {p.volume24h}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-6">
            <h2 className="text-[15px] font-semibold text-[#f5f5f5] mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'Swap', href: '/dashboard/swap', desc: '0.3% fee' },
                { label: 'Add Liquidity', href: '/dashboard/liquidity', desc: 'Earn fees' },
                { label: 'Lend', href: '/dashboard/lending', desc: 'Borrow MUSDC' },
                { label: 'Stake', href: '/dashboard/staking', desc: 'Earn rewards' },
              ].map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className="flex items-center justify-between rounded-lg border border-[#1a1a1a] bg-[#111111] px-4 py-3 transition-colors hover:border-[#262626] hover:bg-[#161616]"
                >
                  <div>
                    <p className="text-[13px] font-medium text-[#f5f5f5]">{a.label}</p>
                    <p className="text-[11px] text-[#525252]">{a.desc}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-[#525252]" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-[#f5f5f5]">Recent Activity</h2>
              <span className="text-[11px] text-[#525252]">Live</span>
            </div>
            <div className="space-y-3">
              {recentActivity.map((a, i) => (
                <div key={i} className="pb-3 border-b border-[#1a1a1a] last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-[12px] font-medium text-[#f5f5f5]">{a.type}</span>
                    <span className="text-[10px] text-[#525252]">{a.time}</span>
                  </div>
                  <p className="text-[11px] text-[#737373] mb-1">{a.amount}</p>
                  <p className="text-[10px] font-mono text-[#525252]">{a.user}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
