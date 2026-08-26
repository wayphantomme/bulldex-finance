'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseUnits } from 'viem';
import { CONTRACTS, CONTRACT_ADDRESSES, etherscanUrl } from '@/constants/contracts';
import { shortenHash } from '@/utils/format';
import { cn } from '@/utils/cn';

const FAUCET_AMOUNT = parseUnits('1000', 18); // 1000 MUSDC
const COOLDOWN_MS   = 24 * 60 * 60 * 1000;   // 24 hours

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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function FaucetPage() {
  const { address, isConnected } = useAccount();

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-base font-semibold text-ink">Faucet & Contracts</h1>
        <p className="mt-0.5 text-xs text-ink-secondary">
          Get testnet tokens to start trading. Add contracts to MetaMask.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {/* ETH Sepolia */}
        <ETHCard />

        {/* MUSDC faucet */}
        <MUSDCCard address={address} isConnected={isConnected} />

        {/* BDX */}
        <BDXCard address={address} isConnected={isConnected} />

      </div>

      {/* Contract addresses */}
      <ContractAddresses />
    </div>
  );
}

// ─── ETH Card ─────────────────────────────────────────────────────────────────

function ETHCard() {
  return (
    <div className="rounded-2xl border border-base-border bg-base-card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-base-elevated">
          {/* ETH diamond icon */}
          <svg className="h-5 w-5 text-ink-secondary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.37 4.35h.001zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">ETH Sepolia</p>
          <p className="text-xs text-ink-faint">For gas fees</p>
        </div>
        <span className="ml-auto rounded-lg bg-base-elevated px-2 py-0.5 text-[10px] font-semibold text-ink-faint">
          NATIVE
        </span>
      </div>

      <p className="text-xs text-ink-secondary leading-relaxed">
        Required to pay transaction fees (gas). Get free testnet ETH from Google&apos;s faucet.
      </p>

      <div className="mt-auto space-y-2">
        <div className="rounded-lg bg-base-surface px-3 py-2 text-xs text-ink-faint">
          Amount: <span className="text-ink font-medium">0.5 ETH per day</span>
        </div>
        <a
          href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-base-border bg-base-elevated py-2.5 text-sm font-medium text-ink transition-colors hover:border-base-border-light hover:text-ink-secondary"
        >
          Get ETH
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </a>
      </div>
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
  const [cooldownMs, setCooldownMs]   = useState(0);
  const [txHash, setTxHash]           = useState<`0x${string}` | undefined>();
  const [claimed, setClaimed]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const { writeContractAsync, isPending } = useWriteContract();
  const { isSuccess: confirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  });

  // Tick countdown
  useEffect(() => {
    if (!address) return;
    const tick = () => {
      const last    = getLastClaim(address);
      const elapsed = Date.now() - last;
      const remain  = COOLDOWN_MS - elapsed;
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
        params: {
          type: 'ERC20',
          options: {
            address: CONTRACT_ADDRESSES.musdc,
            symbol: 'MUSDC',
            decimals: 18,
            image: `${typeof window !== 'undefined' ? window.location.origin : ''}/musdc-icon.svg`,
          },
        },
      });
    } catch {}
  }, []);

  return (
    <div className="rounded-2xl border border-base-border bg-base-card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-blue-500/20 flex items-center justify-center">
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

      <p className="text-xs text-ink-secondary leading-relaxed">
        Free testnet MUSDC to use for swaps. One claim per wallet every 24 hours.
      </p>

      <div className="rounded-lg bg-base-surface px-3 py-2 flex items-center justify-between">
        <span className="text-xs text-ink-faint">Claim amount</span>
        <span className="text-xs font-semibold text-ink">1,000 MUSDC</span>
      </div>

      {/* Countdown */}
      {isConnected && cooldownMs > 0 && (
        <div className="rounded-lg border border-yellow/20 bg-yellow/5 px-3 py-2 text-center">
          <p className="text-[10px] text-yellow font-medium">Next claim in</p>
          <p className="text-lg font-bold text-yellow font-mono">{formatCountdown(cooldownMs)}</p>
        </div>
      )}

      {/* Success */}
      {confirmed && txHash && (
        <div className="rounded-lg border border-green/20 bg-green/5 px-3 py-2 text-center space-y-1">
          <p className="text-xs font-semibold text-green">1,000 MUSDC claimed!</p>
          <a
            href={etherscanUrl(txHash, 'tx')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-ink-faint hover:text-ink-secondary transition-colors"
          >
            {shortenHash(txHash)} →
          </a>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red text-center">{error}</p>
      )}

      <div className="mt-auto space-y-2">
        {!isConnected ? (
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                onClick={openConnectModal}
                className="w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-base-bg hover:opacity-90 transition-opacity"
              >
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

        <button
          onClick={handleAddToMetaMask}
          className="w-full rounded-xl border border-base-border bg-base-surface py-2 text-xs font-medium text-ink-secondary hover:text-ink hover:border-base-border-light transition-colors flex items-center justify-center gap-1.5"
        >
          <MetaMaskIcon />
          Add MUSDC to MetaMask
        </button>
      </div>
    </div>
  );
}

// ─── BDX Card ─────────────────────────────────────────────────────────────────

function BDXCard({
  address,
  isConnected,
}: {
  address: `0x${string}` | undefined;
  isConnected: boolean;
}) {
  const handleAddToMetaMask = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await (window.ethereum as any).request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: CONTRACT_ADDRESSES.token,
            symbol: 'BDX',
            decimals: 18,
            image: `${typeof window !== 'undefined' ? window.location.origin : ''}/bulldex-logo.png`,
          },
        },
      });
    } catch {}
  }, []);

  return (
    <div className="rounded-2xl border border-base-border bg-base-card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/bulldex-logo.png" alt="BDX" className="h-10 w-10 object-cover" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Bulldex Token</p>
          <p className="text-xs text-ink-faint">Governance & utility</p>
        </div>
        <span className="ml-auto rounded-lg bg-green/10 px-2 py-0.5 text-[10px] font-semibold text-green">
          BDX
        </span>
      </div>

      <p className="text-xs text-ink-secondary leading-relaxed">
        BDX is the protocol token. Earn BDX through swaps and liquidity provision on Sepolia testnet.
      </p>

      <div className="rounded-lg bg-base-surface px-3 py-2 space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-ink-faint">Max supply</span>
          <span className="text-ink font-medium">1,000,000,000 BDX</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-ink-faint">Network</span>
          <span className="text-ink font-medium">Sepolia</span>
        </div>
      </div>

      <div className="mt-auto space-y-2">
        <a
          href="https://app.uniswap.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-base-elevated border border-base-border py-2.5 text-sm font-medium text-ink-secondary hover:text-ink hover:border-base-border-light transition-colors"
        >
          Get BDX via Swap
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </a>

        <button
          onClick={handleAddToMetaMask}
          className="w-full rounded-xl border border-base-border bg-base-surface py-2 text-xs font-medium text-ink-secondary hover:text-ink hover:border-base-border-light transition-colors flex items-center justify-center gap-1.5"
        >
          <MetaMaskIcon />
          Add BDX to MetaMask
        </button>
      </div>
    </div>
  );
}

// ─── Contract Addresses ───────────────────────────────────────────────────────

function ContractAddresses() {
  const contracts = [
    {
      name: 'BDX Token',
      symbol: 'BDX',
      address: CONTRACT_ADDRESSES.token,
      desc: 'Governance & utility ERC-20 token',
    },
    {
      name: 'Mock USDC',
      symbol: 'MUSDC',
      address: CONTRACT_ADDRESSES.musdc,
      desc: 'Testnet stablecoin with faucet',
    },
    {
      name: 'Pool Factory',
      symbol: 'FACTORY',
      address: CONTRACT_ADDRESSES.factory,
      desc: 'Deploys and tracks AMM pools',
    },
    {
      name: 'BDX/MUSDC Pool',
      symbol: 'POOL',
      address: CONTRACT_ADDRESSES.pool,
      desc: 'x*y=k AMM + LP token',
    },
  ];

  return (
    <div className="rounded-2xl border border-base-border bg-base-card p-5">
      <p className="mb-4 text-sm font-semibold text-ink">Contract Addresses</p>
      <div className="space-y-2">
        {contracts.map((c) => (
          <ContractRow key={c.symbol} {...c} />
        ))}
      </div>
      <p className="mt-4 text-[11px] text-ink-faint">
        Network: Sepolia Testnet (chainId 11155111)
      </p>
    </div>
  );
}

function ContractRow({
  name, symbol, address, desc,
}: {
  name: string; symbol: string; address: string; desc: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isZero = address === '0x0000000000000000000000000000000000000000';

  return (
    <div className="flex items-center gap-3 rounded-xl bg-base-surface px-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-semibold text-ink">{name}</span>
          <span className="rounded bg-base-elevated px-1.5 py-0.5 text-[10px] text-ink-faint font-mono">{symbol}</span>
        </div>
        <p className="font-mono text-[11px] text-ink-faint truncate">
          {isZero ? 'Not deployed — set NEXT_PUBLIC env var' : address}
        </p>
      </div>
      {!isZero && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={copy}
            className={cn(
              'rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors',
              copied
                ? 'bg-green/15 text-green'
                : 'bg-base-elevated text-ink-secondary hover:text-ink',
            )}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <a
            href={etherscanUrl(address, 'address')}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-base-elevated px-2.5 py-1.5 text-[11px] font-medium text-ink-secondary transition-colors hover:text-ink"
          >
            View
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetaMaskIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.315 2L13.41 7.892l1.467-3.424L21.315 2z" fill="#E2761B"/>
      <path d="M2.685 2l7.837 5.95-1.396-3.482L2.685 2z" fill="#E4761B"/>
      <path d="M18.394 15.61l-2.104 3.22 4.503 1.24 1.293-4.387-3.692-.073zM1.92 15.683l1.285 4.387 4.503-1.24-2.104-3.22-3.684.073z" fill="#E4761B"/>
    </svg>
  );
}
