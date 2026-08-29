'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useBalance, usePublicClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatUnits, parseUnits, parseEther } from 'viem';
import Link from 'next/link';
import { Wallet } from 'lucide-react';
import { CONTRACTS, CONTRACT_ADDRESSES, etherscanUrl } from '@/constants/contracts';
import { WETH_ABI } from '@/constants/abis';
import { shortenHash } from '@/utils/format';
import { cn } from '@/utils/cn';

const FAUCET_AMOUNT = parseUnits('1000', 18);
const COOLDOWN_MS   = 24 * 60 * 60 * 1000;

function getFaucetKey(address: string) {
  return `bdx_faucet_musdc_${address.toLowerCase()}`;
}
function getLastClaim(address: string): number {
  if (typeof window === 'undefined') return 0;
  const v = localStorage.getItem(getFaucetKey(address));
  return v ? parseInt(v, 10) : 0;
}
function setLastClaim(address: string) {
  localStorage.setItem(getFaucetKey(address), Date.now().toString());
}
function formatCountdown(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1_000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function FaucetPage() {
  const { address, isConnected } = useAccount();

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Faucet & Contracts</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Get testnet tokens to start trading. Add contracts to MetaMask.
        </p>
      </div>

      {/* User flow guide */}
      <div className="rounded-2xl border border-brand/20 bg-brand/5 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand mb-3">
          Getting started — 3 steps
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { n: '1', title: 'Get ETH for gas', desc: 'Free from Google faucet. Switch MetaMask to Sepolia first. ~0.5 ETH is enough.' },
            { n: '2', title: 'Claim MUSDC + wrap WETH', desc: 'Claim testnet MUSDC below. Wrap ETH to WETH if you want to use the BDX/WETH pool.' },
            { n: '3', title: 'Swap MUSDC or WETH for BDX', desc: 'BDX is needed for Liquidity and Lending. Swap on the Swap page.' },
          ].map(s => (
            <div key={s.n} className="flex gap-3 rounded-xl bg-base-card px-4 py-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-base-bg">{s.n}</span>
              <div>
                <p className="text-xs font-semibold text-ink">{s.title}</p>
                <p className="text-[11px] text-ink-faint mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-ink-faint">
          Note: MUSDC is a testnet MockToken — not real USD. BDX is the protocol token earned by trading.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ETHCard />
        <MUSDCCard address={address} isConnected={isConnected} />
        <WETHCard address={address} isConnected={isConnected} />
        <BDXCard />
      </div>

      <ContractAddresses />
    </div>
  );
}

// ─── ETH Card ─────────────────────────────────────────────────────────────────

function ETHCard() {
  return (
    <div className="rounded-2xl border border-base-border bg-base-card p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#627EEA]/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/eth-icon.svg" alt="ETH" className="h-7 w-7" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">ETH Sepolia</p>
          <p className="text-xs text-ink-faint">For gas fees</p>
        </div>
        <span className="ml-auto rounded-lg bg-base-elevated px-2 py-0.5 text-[10px] font-semibold text-ink-faint">
          NATIVE
        </span>
      </div>

      <p className="text-xs text-ink-secondary leading-relaxed mb-4">
        Required to pay transaction fees (gas). Get free testnet ETH from Google&apos;s faucet.
      </p>

      {/* Spacer — push buttons to bottom matching other cards */}
      <div className="flex-1" />

      <div className="rounded-lg bg-base-surface px-3 py-2 text-xs text-ink-faint mb-3">
        Amount: <span className="text-ink font-medium">0.5 ETH per day</span>
      </div>

      {/* Primary CTA — matches height of other cards */}
      <a
        href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-base-border bg-base-elevated py-2.5 text-sm font-medium text-ink-secondary hover:text-ink hover:border-base-border-light transition-colors"
      >
        Get ETH
        <svg className="h-3 w-3 text-ink-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  );
}

// ─── MUSDC Card ────────────────────────────────────────────────────────────────

function MUSDCCard({
  address,
  isConnected,
}: {
  address: `0x${string}` | undefined;
  isConnected: boolean;
}) {
  const [cooldownMs, setCooldownMs] = useState(0);
  const [txHash, setTxHash]         = useState<`0x${string}` | undefined>();
  const [claimed, setClaimed]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const { writeContractAsync, isPending } = useWriteContract();
  const { isSuccess: confirmed } = useWaitForTransactionReceipt({ hash: txHash, query: { enabled: !!txHash } });

  useEffect(() => {
    if (!address) return;
    const tick = () => {
      const remain = COOLDOWN_MS - (Date.now() - getLastClaim(address));
      setCooldownMs(remain > 0 ? remain : 0);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [address, claimed]);

  const canClaim = isConnected && cooldownMs === 0;

  const handleClaim = useCallback(async () => {
    if (!address || !canClaim) return;
    setError(null);
    try {
      const hash = await writeContractAsync({
        ...CONTRACTS.musdc,
        functionName: 'faucet',
        args: [FAUCET_AMOUNT],
      });
      setTxHash(hash);
      setLastClaim(address);
      setClaimed(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Transaction failed';
      setError(msg.includes('User rejected') ? 'Transaction rejected' : 'Claim failed. Try again.');
    }
  }, [address, canClaim, writeContractAsync]);

  const handleAddToMetaMask = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await (window.ethereum as any).request({
        method: 'wallet_watchAsset',
        params: { type: 'ERC20', options: { address: CONTRACT_ADDRESSES.musdc, symbol: 'MUSDC', decimals: 18 } },
      });
    } catch {}
  }, []);

  return (
    <div className="rounded-2xl border border-base-border bg-base-card p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/musdc-icon.svg" alt="MUSDC" className="h-10 w-10 object-cover" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Mock USDC</p>
          <p className="text-xs text-ink-faint">Testnet stablecoin</p>
        </div>
        <span className="ml-auto rounded-lg bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
          FAUCET
        </span>
      </div>

      <p className="text-xs text-ink-secondary leading-relaxed mb-4">
        Free testnet MUSDC to use for swaps. One claim per wallet every 24 hours.
      </p>

      <div className="rounded-lg bg-base-surface px-3 py-2 flex items-center justify-between mb-3">
        <span className="text-xs text-ink-faint">Claim amount</span>
        <span className="text-xs font-semibold text-ink">1,000 MUSDC</span>
      </div>

      {/* Countdown */}
      {isConnected && cooldownMs > 0 && (
        <div className="rounded-lg border border-yellow/20 bg-yellow/5 px-3 py-2 text-center mb-3">
          <p className="text-[10px] text-yellow font-medium">Next claim in</p>
          <p className="text-base font-bold text-yellow font-mono">{formatCountdown(cooldownMs)}</p>
        </div>
      )}

      {/* Success */}
      {confirmed && txHash && (
        <div className="rounded-lg border border-green/20 bg-green/5 px-3 py-2 text-center space-y-1 mb-3">
          <p className="text-xs font-semibold text-green">1,000 MUSDC claimed!</p>
          <a href={etherscanUrl(txHash, 'tx')} target="_blank" rel="noopener noreferrer"
            className="text-[11px] text-ink-faint hover:text-ink-secondary transition-colors block">
            {shortenHash(txHash)}
          </a>
        </div>
      )}

      {error && <p className="text-xs text-red text-center mb-3">{error}</p>}

      {/* Spacer */}
      <div className="flex-1" />

      <div className="space-y-2">
        {!isConnected ? (
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button onClick={openConnectModal}
                className="w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-base-bg hover:bg-brand-dark transition-all">
                Connect Wallet
              </button>
            )}
          </ConnectButton.Custom>
        ) : (
          <button
            onClick={handleClaim}
            disabled={!canClaim || isPending}
            className={cn(
              'w-full rounded-xl py-2.5 text-sm font-semibold transition-all',
              canClaim && !isPending
                ? 'bg-brand text-base-bg hover:bg-brand-dark'
                : 'bg-base-elevated text-ink-faint cursor-not-allowed',
            )}
          >
            {isPending ? 'Claiming...' : cooldownMs > 0 ? 'Already claimed today' : 'Claim 1,000 MUSDC'}
          </button>
        )}

        <button onClick={handleAddToMetaMask}
          className="w-full rounded-xl border border-base-border bg-base-surface py-2 text-xs font-medium text-ink-secondary hover:text-ink hover:border-base-border-light transition-colors flex items-center justify-center gap-2">
          <Wallet className="h-3.5 w-3.5" strokeWidth={1.5} />
          Add MUSDC to MetaMask
        </button>
      </div>
    </div>
  );
}

// ─── WETH Card ────────────────────────────────────────────────────────────────

function WETHCard({
  address,
  isConnected,
}: {
  address: `0x${string}` | undefined;
  isConnected: boolean;
}) {
  const [ethInput, setEthInput]   = useState('0.01');
  const [txHash, setTxHash]       = useState<`0x${string}` | undefined>();
  const [error, setError]         = useState<string | null>(null);

  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient();
  const { data: ethBalance } = useBalance({ address, query: { enabled: !!address } });
  const { isSuccess: confirmed } = useWaitForTransactionReceipt({ hash: txHash, query: { enabled: !!txHash } });

  const ethNum = parseFloat(ethInput || '0');
  const hasEnough = ethBalance ? parseEther(ethInput || '0') < ethBalance.value : false;
  const canWrap = isConnected && ethNum > 0 && hasEnough && !isPending;

  const handleWrap = useCallback(async () => {
    if (!address || !canWrap) return;
    setError(null);
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.weth,
        abi: WETH_ABI,
        functionName: 'deposit',
        value: parseEther(ethInput),
      });
      setTxHash(hash);
      // Wait for confirmation so balance updates
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Transaction failed';
      setError(msg.includes('User rejected') ? 'Transaction rejected.' : 'Wrap failed. Check ETH balance.');
    }
  }, [address, canWrap, ethInput, writeContractAsync, publicClient]);

  const handleAddToMetaMask = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await (window.ethereum as any).request({
        method: 'wallet_watchAsset',
        params: { type: 'ERC20', options: { address: CONTRACT_ADDRESSES.weth, symbol: 'WETH', decimals: 18 } },
      });
    } catch {}
  }, []);

  return (
    <div className="rounded-2xl border border-base-border bg-base-card p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#627EEA]/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/eth-icon.svg" alt="WETH" className="h-7 w-7" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Wrapped ETH</p>
          <p className="text-xs text-ink-faint">For BDX/WETH pool</p>
        </div>
        <span className="ml-auto rounded-lg bg-[#627EEA]/10 px-2 py-0.5 text-[10px] font-semibold text-[#627EEA]">
          WETH
        </span>
      </div>

      <p className="text-xs text-ink-secondary leading-relaxed mb-4">
        The BDX/WETH pool uses WETH (ERC-20), not native ETH. Wrap your Sepolia ETH here before adding liquidity.
      </p>

      {/* ETH balance */}
      {ethBalance && (
        <div className="rounded-lg bg-base-surface px-3 py-2 flex items-center justify-between mb-3">
          <span className="text-xs text-ink-faint">ETH balance</span>
          <span className="text-xs font-semibold text-ink tabular-nums">
            {parseFloat(formatUnits(ethBalance.value, 18)).toFixed(4)} ETH
          </span>
        </div>
      )}

      {/* Amount input */}
      <div className="rounded-xl bg-base-surface p-3 flex items-center gap-2 mb-3">
        <input
          type="number"
          value={ethInput}
          onChange={e => setEthInput(e.target.value)}
          min="0.001"
          step="0.01"
          placeholder="0.01"
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ink placeholder:text-ink-faint focus:outline-none tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-xs font-semibold text-ink-secondary shrink-0">ETH</span>
        <button
          onClick={() => {
            if (ethBalance) {
              // Reserve 0.01 ETH for gas
              const safe = parseFloat(formatUnits(ethBalance.value, 18)) - 0.01;
              setEthInput(Math.max(0, safe).toFixed(4));
            }
          }}
          className="rounded-md bg-base-elevated px-2 py-0.5 text-[10px] font-semibold text-ink-secondary hover:text-ink transition-colors shrink-0">
          MAX
        </button>
      </div>

      {!hasEnough && ethNum > 0 && (
        <p className="text-xs text-red mb-3">Insufficient ETH balance.</p>
      )}

      {/* Success */}
      {confirmed && txHash && (
        <div className="rounded-lg border border-green/20 bg-green/5 px-3 py-2 text-center space-y-1 mb-3">
          <p className="text-xs font-semibold text-green">Wrapped to WETH!</p>
          <a href={etherscanUrl(txHash, 'tx')} target="_blank" rel="noopener noreferrer"
            className="text-[11px] text-ink-faint hover:text-ink-secondary transition-colors block">
            {shortenHash(txHash)}
          </a>
        </div>
      )}

      {error && <p className="text-xs text-red text-center mb-3">{error}</p>}

      {/* Spacer */}
      <div className="flex-1" />

      <div className="space-y-2">
        {!isConnected ? (
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button onClick={openConnectModal}
                className="w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-base-bg hover:bg-brand-dark transition-all">
                Connect Wallet
              </button>
            )}
          </ConnectButton.Custom>
        ) : (
          <button
            onClick={handleWrap}
            disabled={!canWrap}
            className={cn(
              'w-full rounded-xl py-2.5 text-sm font-semibold transition-all',
              canWrap
                ? 'bg-brand text-base-bg hover:bg-brand-dark'
                : 'bg-base-elevated text-ink-faint cursor-not-allowed',
            )}
          >
            {isPending ? 'Wrapping...' : `Wrap ${ethNum > 0 ? ethInput : ''} ETH to WETH`}
          </button>
        )}
        <button onClick={handleAddToMetaMask}
          className="w-full rounded-xl border border-base-border bg-base-surface py-2 text-xs font-medium text-ink-secondary hover:text-ink hover:border-base-border-light transition-colors flex items-center justify-center gap-2">
          <Wallet className="h-3.5 w-3.5" strokeWidth={1.5} />
          Add WETH to MetaMask
        </button>
      </div>
    </div>
  );
}

// ─── BDX Card ─────────────────────────────────────────────────────────────────

function BDXCard() {
  const handleAddToMetaMask = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await (window.ethereum as any).request({
        method: 'wallet_watchAsset',
        params: { type: 'ERC20', options: { address: CONTRACT_ADDRESSES.token, symbol: 'BDX', decimals: 18 } },
      });
    } catch {}
  }, []);

  return (
    <div className="rounded-2xl border border-base-border bg-base-card p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/bdx-token.png" alt="BDX" className="h-10 w-10 object-cover" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Bulldex Token</p>
          <p className="text-xs text-ink-faint">Governance & utility</p>
        </div>
        <span className="ml-auto rounded-lg bg-green/10 px-2 py-0.5 text-[10px] font-semibold text-green">
          BDX
        </span>
      </div>

      <p className="text-xs text-ink-secondary leading-relaxed mb-4">
        BDX is the protocol token. Earn BDX through swaps and liquidity provision on Sepolia testnet.
      </p>

      <div className="rounded-lg bg-base-surface px-3 py-2 space-y-1.5 mb-3">
        <div className="flex justify-between text-xs">
          <span className="text-ink-faint">Max supply</span>
          <span className="text-ink font-medium">1,000,000,000 BDX</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-ink-faint">Network</span>
          <span className="text-ink font-medium">Sepolia</span>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      <div className="space-y-2">
        {/* Internal link — no external icon */}
        <Link href="/dashboard/swap"
          className="flex w-full items-center justify-center rounded-xl bg-base-elevated border border-base-border py-2.5 text-sm font-medium text-ink-secondary hover:text-ink hover:border-base-border-light transition-colors">
          Swap MUSDC → BDX
        </Link>

        <button onClick={handleAddToMetaMask}
          className="w-full rounded-xl border border-base-border bg-base-surface py-2 text-xs font-medium text-ink-secondary hover:text-ink hover:border-base-border-light transition-colors flex items-center justify-center gap-2">
          <Wallet className="h-3.5 w-3.5" strokeWidth={1.5} />
          Add BDX to MetaMask
        </button>
      </div>
    </div>
  );
}

// ─── Contract Addresses ───────────────────────────────────────────────────────

function ContractAddresses() {
  const contracts = [
    { name: 'BDX Token',      symbol: 'BDX',      address: CONTRACT_ADDRESSES.token,       desc: 'Governance & utility ERC-20' },
    { name: 'Mock USDC',      symbol: 'MUSDC',     address: CONTRACT_ADDRESSES.musdc,       desc: 'Testnet stablecoin with faucet' },
    { name: 'WETH',           symbol: 'WETH',      address: CONTRACT_ADDRESSES.weth,        desc: 'Wrapped Ether for BDX/ETH pool' },
    { name: 'Pool Factory',   symbol: 'FACTORY',   address: CONTRACT_ADDRESSES.factory,     desc: 'Deploys and tracks AMM pools' },
    { name: 'BDX/MUSDC Pool', symbol: 'POOL',      address: CONTRACT_ADDRESSES.pool,        desc: 'x*y=k AMM + LP token' },
    { name: 'BDX/WETH Pool',  symbol: 'ETH-POOL',  address: CONTRACT_ADDRESSES.poolBdxWeth, desc: 'BDX/WETH x*y=k AMM + LP token' },
  ];

  return (
    <div className="rounded-2xl border border-base-border bg-base-card p-5">
      <p className="mb-4 text-sm font-semibold text-ink">Contract Addresses</p>
      <div className="space-y-2">
        {contracts.map((c) => <ContractRow key={c.symbol} {...c} />)}
      </div>
      <p className="mt-4 text-[11px] text-ink-faint">Network: Sepolia Testnet (chainId 11155111)</p>
    </div>
  );
}

function ContractRow({ name, symbol, address, desc }: { name: string; symbol: string; address: string; desc: string }) {
  const [copied, setCopied] = useState(false);
  const isZero = address === '0x0000000000000000000000000000000000000000';

  return (
    <div className="flex items-center gap-3 rounded-xl bg-base-surface px-4 py-3 hover:bg-base-elevated/40 transition-colors duration-150">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-semibold text-ink">{name}</span>
          <span className="rounded bg-base-elevated px-1.5 py-0.5 text-[10px] text-ink-faint font-mono">{symbol}</span>
        </div>
        <p className="font-mono text-[11px] text-ink-faint truncate">
          {isZero ? 'Not configured — set env var' : address}
        </p>
      </div>
      {!isZero && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={async () => { await navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className={cn('rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors',
              copied ? 'bg-green/15 text-green' : 'bg-base-elevated text-ink-secondary hover:text-ink'
            )}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <a href={etherscanUrl(address, 'address')} target="_blank" rel="noopener noreferrer"
            className="rounded-lg bg-base-elevated px-2.5 py-1.5 text-[11px] font-medium text-ink-secondary transition-colors hover:text-ink">
            View
          </a>
        </div>
      )}
    </div>
  );
}
