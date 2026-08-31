'use client';

import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import { CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';

// ─── Token Terminal transaction status toast spec:
// Pending: amber spinner + "Transaction pending..."
// Confirmed: green checkmark + tx hash link
// Failed: red X + error message
// Fixed bottom-right via Sonner

// ─── Toast helpers ────────────────────────────────────────────────────────────

export interface TxToastOptions {
  txHash?:      string;
  chainId?:     number;
  description?: string;
}

function getTxUrl(hash: string, chainId?: number): string {
  if (chainId === 11155111) return `https://sepolia.etherscan.io/tx/${hash}`;
  if (chainId === 1)        return `https://etherscan.io/tx/${hash}`;
  if (chainId === 8453)     return `https://basescan.org/tx/${hash}`;
  if (chainId === 42161)    return `https://arbiscan.io/tx/${hash}`;
  return `https://etherscan.io/tx/${hash}`;
}

function shortenHash(hash: string): string {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

// ─── Toast content components ─────────────────────────────────────────────────

function TxLink({ hash, chainId }: { hash: string; chainId?: number }) {
  return (
    <a
      href={getTxUrl(hash, chainId)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-mono text-[11px] text-[#10b981] hover:text-[#34d399] transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      {shortenHash(hash)}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Show a "Transaction pending..." toast. Returns toast id. */
export function txPending(description?: string): string | number {
  return toast.loading(
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-[#f59e0b] shrink-0" />
      <div>
        <p className="text-[13px] font-medium text-[#f5f5f5]">Transaction pending</p>
        {description && (
          <p className="text-[11px] text-[#a3a3a3] mt-0.5">{description}</p>
        )}
      </div>
    </div>,
    {
      duration: Infinity,
      style: {
        background: '#1a1a1a',
        border: '1px solid #262626',
        borderLeft: '3px solid #f59e0b',
        borderRadius: '8px',
        padding: '12px 16px',
      },
    },
  );
}

/** Show a "Transaction confirmed" toast, dismisses a pending toast if id given. */
export function txSuccess(opts: TxToastOptions & { pendingId?: string | number } = {}): void {
  const { txHash, chainId, description, pendingId } = opts;

  if (pendingId) toast.dismiss(pendingId);

  toast.custom(
    () => (
      <div className="flex items-start gap-3 rounded-lg border border-[#262626] bg-[#1a1a1a] px-4 py-3 shadow-lg"
        style={{ borderLeft: '3px solid #22c55e' }}>
        <CheckCircle className="h-4 w-4 text-[#22c55e] shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[#f5f5f5]">
            {description ?? 'Transaction confirmed'}
          </p>
          {txHash && (
            <div className="mt-1">
              <TxLink hash={txHash} chainId={chainId} />
            </div>
          )}
        </div>
      </div>
    ),
    { duration: 5000 },
  );
}

/** Show a "Transaction failed" toast, dismisses a pending toast if id given. */
export function txError(error?: string, opts: { pendingId?: string | number } = {}): void {
  if (opts.pendingId) toast.dismiss(opts.pendingId);

  toast.custom(
    () => (
      <div className="flex items-start gap-3 rounded-lg border border-[#262626] bg-[#1a1a1a] px-4 py-3 shadow-lg"
        style={{ borderLeft: '3px solid #ef4444' }}>
        <XCircle className="h-4 w-4 text-[#ef4444] shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[#f5f5f5]">Transaction failed</p>
          {error && (
            <p className="text-[11px] text-[#a3a3a3] mt-0.5 truncate">{error}</p>
          )}
        </div>
      </div>
    ),
    { duration: 8000 },
  );
}

/** Generic info toast */
export function txInfo(message: string, description?: string): void {
  toast.custom(
    () => (
      <div className="flex items-start gap-3 rounded-lg border border-[#262626] bg-[#1a1a1a] px-4 py-3 shadow-lg"
        style={{ borderLeft: '3px solid #3b82f6' }}>
        <div className="h-4 w-4 rounded-full bg-[#3b82f6] flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-white text-[10px] font-bold">i</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[#f5f5f5]">{message}</p>
          {description && (
            <p className="text-[11px] text-[#a3a3a3] mt-0.5">{description}</p>
          )}
        </div>
      </div>
    ),
    { duration: 4000 },
  );
}

// ─── Inline transaction status badge (for within-card display) ────────────────

export type TxStatus = 'pending' | 'confirmed' | 'failed';

interface TxStatusBadgeProps {
  status:   TxStatus;
  txHash?:  string;
  chainId?: number;
  className?: string;
}

export function TxStatusBadge({ status, txHash, chainId, className }: TxStatusBadgeProps) {
  const configs = {
    pending: {
      icon: <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
        <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>,
      label: 'Pending',
      color: 'text-[#f59e0b] bg-[rgba(245,158,11,0.08)] border-[rgba(245,158,11,0.2)]',
    },
    confirmed: {
      icon: <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />,
      label: 'Confirmed',
      color: 'text-[#22c55e] bg-[rgba(34,197,94,0.08)] border-[rgba(34,197,94,0.2)]',
    },
    failed: {
      icon: <XCircle className="h-3.5 w-3.5" aria-hidden="true" />,
      label: 'Failed',
      color: 'text-[#ef4444] bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.2)]',
    },
  };

  const cfg = configs[status];

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[12px] font-medium',
      cfg.color,
      className,
    )}>
      {cfg.icon}
      {cfg.label}
      {txHash && status === 'confirmed' && (
        <a
          href={getTxUrl(txHash, chainId)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[10px] underline underline-offset-2 hover:no-underline"
          onClick={(e) => e.stopPropagation()}
        >
          {shortenHash(txHash)}
        </a>
      )}
    </span>
  );
}
