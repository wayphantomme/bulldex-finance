'use client';

/**
 * SwapRouteDiagram
 * Concept: TokenA → AMM Pool hexagon → TokenB
 * Animations: particle travel along route, slow pool spin, fee badge pop-in
 */

import { SVGProps } from 'react';

interface Props extends SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
}

// Hexagon points helper (flat-top, centered at cx,cy, radius r)
function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30);
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');
}

export function SwapRouteDiagram({ width, height, className = '', ...props }: Props) {
  // Path: TokenA (40,50) → Pool center (140,50) → TokenB (240,50)
  const routeLeft  = 'M 60,50 L 116,50';
  const routeRight = 'M 164,50 L 220,50';

  return (
    <svg
      role="img"
      viewBox="0 0 280 100"
      width={width}
      height={height}
      fill="none"
      className={className}
      aria-labelledby="swap-title swap-desc"
      {...props}
    >
      <title id="swap-title">Swap Route Diagram</title>
      <desc id="swap-desc">
        Animated diagram showing a token swap: TokenA flows through an AMM pool to become TokenB with a 0.3% fee.
      </desc>

      <defs>
        {/* Arrow markers */}
        <marker id="sr-arrow-l" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#404040" />
        </marker>
        <marker id="sr-arrow-r" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#10b981" />
        </marker>
        {/* Radial glow for pool */}
        <radialGradient id="sr-pool-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#10b981" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0"    />
        </radialGradient>
      </defs>

      {/* ── Route lines ──────────────────────────── */}
      <path
        d={routeLeft}
        stroke="#404040"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        markerEnd="url(#sr-arrow-l)"
        className="animate-dash-flow"
      />
      <path
        d={routeRight}
        stroke="#10b981"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        markerEnd="url(#sr-arrow-r)"
        className="animate-dash-flow"
        style={{ animationDelay: '0.9s' }}
      />

      {/* ── Pool glow background ─────────────────── */}
      <circle cx="140" cy="50" r="30" fill="url(#sr-pool-glow)" />

      {/* ── Pool hexagon (spinning) ──────────────── */}
      <g style={{ transformOrigin: '140px 50px', transformBox: 'fill-box' }} className="animate-slow-spin">
        <polygon
          points={hexPoints(140, 50, 22)}
          stroke="#10b981"
          strokeWidth="1.5"
          fill="#064e3b"
          fillOpacity="0.3"
        />
        <polygon
          points={hexPoints(140, 50, 15)}
          stroke="#10b981"
          strokeWidth="1"
          strokeOpacity="0.4"
          fill="none"
        />
      </g>

      {/* Pool label */}
      <text
        x="140" y="53"
        textAnchor="middle"
        fontSize="9"
        fontWeight="600"
        fontFamily="'JetBrains Mono', monospace"
        fill="#10b981"
        letterSpacing="0.5"
      >
        AMM
      </text>

      {/* ── Fee badge (pops in) ───────────────────── */}
      <g style={{ animation: 'bloomIn 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.6s both', transformOrigin: '140px 80px', transformBox: 'fill-box' }}>
        <rect x="118" y="74" width="44" height="14" rx="4" fill="#1a1a1a" stroke="#262626" strokeWidth="1" />
        <text
          x="140" y="84"
          textAnchor="middle"
          fontSize="9"
          fontFamily="'JetBrains Mono', monospace"
          fill="#a3a3a3"
        >
          fee 0.3%
        </text>
      </g>

      {/* ── TokenA coin ──────────────────────────── */}
      <circle cx="40" cy="50" r="18" fill="#1a1a1a" stroke="#3b82f6" strokeWidth="1.5" />
      <text
        x="40" y="54"
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fontFamily="'JetBrains Mono', monospace"
        fill="#3b82f6"
      >
        A
      </text>

      {/* ── TokenB coin ──────────────────────────── */}
      <circle cx="240" cy="50" r="18" fill="#1a1a1a" stroke="#10b981" strokeWidth="1.5" />
      <text
        x="240" y="54"
        textAnchor="middle"
        fontSize="8"
        fontWeight="700"
        fontFamily="'JetBrains Mono', monospace"
        fill="#10b981"
      >
        BDX
      </text>

      {/* ── Travelling particle (left side) ─────── */}
      <circle r="2.5" fill="#3b82f6" opacity="0.9">
        <animateMotion dur="1.8s" repeatCount="indefinite" path={routeLeft} />
      </circle>

      {/* ── Travelling particle (right side) ────── */}
      <circle r="2.5" fill="#10b981" opacity="0.9">
        <animateMotion dur="1.8s" begin="0.9s" repeatCount="indefinite" path={routeRight} />
      </circle>
    </svg>
  );
}
