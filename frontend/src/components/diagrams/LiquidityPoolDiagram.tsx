'use client';

/**
 * LiquidityPoolDiagram
 * Concept: Two tokens drop into a shared AMM pool, LP token exits below.
 * Animations: token drop, pool fill pulse, ripple, LP arrow.
 */

import { SVGProps } from 'react';

interface Props extends SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
}

export function LiquidityPoolDiagram({ width, height, className = '', ...props }: Props) {
  return (
    <svg
      role="img"
      viewBox="0 0 180 160"
      width={width}
      height={height}
      fill="none"
      className={className}
      aria-labelledby="lp-title lp-desc"
      {...props}
    >
      <title id="lp-title">Liquidity Pool Diagram</title>
      <desc id="lp-desc">
        Animated diagram showing two tokens being deposited into a liquidity pool, producing LP tokens.
      </desc>

      <defs>
        <radialGradient id="lp-pool-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#10b981" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
        </radialGradient>
        <marker id="lp-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#10b981" />
        </marker>
      </defs>

      {/* ── Drop lines ───────────────────────────── */}
      {/* TokenA drop */}
      <line x1="55" y1="32" x2="55" y2="74" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 3"
        opacity="0.5" />
      {/* TokenB drop */}
      <line x1="125" y1="32" x2="125" y2="74" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3"
        opacity="0.5" />

      {/* ── TokenA (dropping) ────────────────────── */}
      <g style={{ animation: 'particleRise 1.5s ease-in infinite', animationDirection: 'reverse', transformOrigin: '55px 20px', transformBox: 'fill-box' }}>
        <circle cx="55" cy="20" r="14" fill="#1e1e1e" stroke="#3b82f6" strokeWidth="1.5" />
        <text x="55" y="24" textAnchor="middle" fontSize="10" fontWeight="700"
          fontFamily="'JetBrains Mono', monospace" fill="#3b82f6">A</text>
      </g>

      {/* ── TokenB (dropping, staggered) ─────────── */}
      <g style={{ animation: 'particleRise 1.5s ease-in 0.5s infinite', animationDirection: 'reverse', transformOrigin: '125px 20px', transformBox: 'fill-box' }}>
        <circle cx="125" cy="20" r="14" fill="#1e1e1e" stroke="#10b981" strokeWidth="1.5" />
        <text x="125" y="24" textAnchor="middle" fontSize="8" fontWeight="700"
          fontFamily="'JetBrains Mono', monospace" fill="#10b981">BDX</text>
      </g>

      {/* ── Pool body ────────────────────────────── */}
      {/* Pool walls */}
      <path d="M 30,78 L 30,118 Q 30,128 40,128 L 140,128 Q 150,128 150,118 L 150,78" stroke="#10b981" strokeWidth="1.5" fill="none" />

      {/* Animated fill level */}
      <clipPath id="lp-pool-clip">
        <rect x="30" y="78" width="120" height="50" rx="0" />
      </clipPath>
      <g clipPath="url(#lp-pool-clip)">
        <ellipse cx="90" cy="103"
          fill="url(#lp-pool-fill)"
          style={{ animation: 'nodePulse 3s ease-in-out infinite', transformOrigin: '90px 103px', transformBox: 'fill-box' }}
        >
          <animate attributeName="rx" values="45;55;45" dur="3s" repeatCount="indefinite" />
          <animate attributeName="ry" values="12;20;12" dur="3s" repeatCount="indefinite" />
        </ellipse>
      </g>

      {/* Pool top opening */}
      <ellipse cx="90" cy="78" rx="60" ry="10" stroke="#10b981" strokeWidth="1.5" fill="#064e3b" fillOpacity="0.2" />

      {/* Ripple on pool surface */}
      <circle cx="90" cy="78" fill="none" stroke="#10b981" strokeWidth="1">
        <animate attributeName="r"       values="4;28;4"   dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Pool label */}
      <text x="90" y="106" textAnchor="middle" fontSize="9" fontWeight="600"
        fontFamily="'JetBrains Mono', monospace" fill="#10b981" letterSpacing="0.5">POOL</text>

      {/* ── LP Token output ──────────────────────── */}
      <line x1="90" y1="128" x2="90" y2="148" stroke="#10b981" strokeWidth="1.5"
        markerEnd="url(#lp-arrow)" strokeDasharray="3 2"
        className="animate-dash-flow" style={{ animationDelay: '1s' }} />

      {/* LP token label */}
      <g style={{ animation: 'bloomIn 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.8s both', transformOrigin: '90px 152px', transformBox: 'fill-box' }}>
        <rect x="65" y="148" width="50" height="14" rx="4" fill="#064e3b" stroke="#10b981" strokeWidth="1" strokeOpacity="0.5" />
        <text x="90" y="158" textAnchor="middle" fontSize="9" fontWeight="600"
          fontFamily="'JetBrains Mono', monospace" fill="#10b981">LP Token</text>
      </g>
    </svg>
  );
}
