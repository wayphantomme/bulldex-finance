'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { X, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

const STORAGE_KEY = 'bdx_tour_';

// Tour steps — each tied to a specific element via data-tour attribute
// or positioned absolutely near a known UI element
const TOUR_STEPS = [
  {
    id: 'faucet',
    title: 'Step 1 — Get testnet tokens',
    body: 'You need ETH for gas and MUSDC to trade. Claim free tokens from the Faucet page.',
    cta: 'Go to Faucet',
    href: '/dashboard/faucet',
    // position: bottom-right of sidebar faucet icon area
    anchor: 'sidebar-faucet',
  },
  {
    id: 'swap',
    title: 'Step 2 — Make your first swap',
    body: 'Swap MUSDC → BDX. Select your token pair, enter amount, and click Swap.',
    cta: 'Try Swap',
    href: '/dashboard/swap',
    anchor: 'sidebar-swap',
  },
  {
    id: 'liquidity',
    title: 'Step 3 — Earn swap fees',
    body: 'Add BDX + MUSDC liquidity to earn 0.3% of every swap in the pool.',
    cta: 'Add Liquidity',
    href: '/dashboard/liquidity',
    anchor: 'sidebar-liquidity',
  },
];

export function OnboardingModal() {
  const { address, isConnected } = useAccount();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [anchorPos, setAnchorPos] = useState<{ top: number; left: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isConnected || !address) return;
    const key = STORAGE_KEY + address.toLowerCase();
    if (!localStorage.getItem(key)) {
      const t = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(t);
    }
  }, [isConnected, address]);

  // Find anchor element position
  useEffect(() => {
    if (!visible) return;
    const current = TOUR_STEPS[step];
    const el = document.querySelector(`[data-tour="${current.anchor}"]`);
    if (el) {
      const rect = el.getBoundingClientRect();
      setAnchorPos({
        top:  rect.top + rect.height / 2,
        left: rect.right + 12,
      });
    } else {
      // Fallback: left sidebar middle
      setAnchorPos({ top: 260 + step * 80, left: 72 });
    }
  }, [step, visible]);

  function dismiss() {
    if (address) localStorage.setItem(STORAGE_KEY + address.toLowerCase(), '1');
    setVisible(false);
  }

  function next() {
    if (step < TOUR_STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      dismiss();
    }
  }

  if (!visible || !anchorPos) return null;

  const current = TOUR_STEPS[step];

  return (
    <>
      {/* Subtle backdrop — not full block, just dim */}
      <div
        className="fixed inset-0 z-40"
        onClick={dismiss}
        aria-hidden
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={{ top: anchorPos.top, left: anchorPos.left }}
        className="fixed z-50 w-64 -translate-y-1/2"
      >
        {/* Arrow pointing left */}
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 h-3 w-3 rotate-45 border-l border-b border-base-border bg-base-card" />

        <div className="rounded-2xl border border-base-border bg-base-card shadow-elevated p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-base-bg">
                {step + 1}
              </span>
              <p className="text-sm font-semibold text-ink leading-tight">{current.title}</p>
            </div>
            <button onClick={dismiss} className="shrink-0 text-ink-faint hover:text-ink transition-colors mt-0.5">
              <X className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Body */}
          <p className="text-xs text-ink-secondary leading-relaxed mb-3">{current.body}</p>

          {/* Progress dots */}
          <div className="flex items-center gap-1 mb-3">
            {TOUR_STEPS.map((_, i) => (
              <span key={i} className={cn(
                'h-1.5 w-1.5 rounded-full transition-all',
                i === step ? 'bg-brand w-3' : i < step ? 'bg-green' : 'bg-base-elevated',
              )} />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href={current.href}
              onClick={next}
              className="flex-1 rounded-xl bg-brand py-2 text-center text-xs font-semibold text-base-bg hover:bg-brand-dark transition-all"
            >
              {current.cta}
            </Link>
            <button
              onClick={next}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-base-border bg-base-elevated text-ink-secondary hover:text-ink transition-colors"
              title={step < TOUR_STEPS.length - 1 ? 'Next' : 'Done'}
            >
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>

          <button onClick={dismiss} className="mt-2 w-full text-center text-[11px] text-ink-faint hover:text-ink-secondary transition-colors">
            Skip tour
          </button>
        </div>
      </div>
    </>
  );
}
