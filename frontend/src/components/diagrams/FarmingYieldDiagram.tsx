'use client';

/**
 * FarmingYieldDiagram
 * Concept: LP token planted as seed, stem grows, BDX coin blooms, reward floats up.
 * Animations: stem grow, bloom scale-in, reward particle rise loop.
 */

import { SVGProps } from 'react';
import { useReducedMotion } from './utils/reducedMotion';

interface Props extends SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
}

export function FarmingYieldDiagram({ width, height, className = '', ...props }: Props) {
  const reduced = useReducedMotion();

  const groundY  = 110;
  const stemTopY = groundY - 48;
  const cx       = 70;

  return (
    <svg
      role="img"
      viewBox="0 0 140 160"
      width={width}
      height={height}
      fill="none"
      className={className}
      aria-labelledby="fy-title fy-desc"
      {...props}
    >
      <title id="fy-title">Farming Yield Diagram</title>
      <desc id="fy-desc">
        Animated diagram showing LP tokens being staked as seeds that grow into a BDX reward plant.
      </desc>

      {/* ── Soil / ground ────────────────────────── */}
      <rect x="10" y={groundY} width="120" height="18" rx="4" fill="#1a1a1a" stroke="#262626" strokeWidth="1" />
      <text x={cx} y={groundY + 12} textAnchor="middle" fontSize="8"
        fontFamily="'JetBrains Mono', monospace" fill="#525252">STAKE LP</text>

      {/* ── Seed (LP token pill) ─────────────────── */}
      <g style={reduced ? { opacity: 1 } : {
        animation: 'particleRise 1s ease-out 0.1s both',
        animationDirection: 'reverse',
        animationFillMode: 'both',
        transformOrigin: `${cx}px ${groundY - 8}px`,
        transformBox: 'fill-box',
      }}>
        <rect x={cx - 14} y={groundY - 14} width="28" height="12" rx="6"
          fill="#064e3b" stroke="#10b981" strokeWidth="1" />
        <text x={cx} y={groundY - 5} textAnchor="middle" fontSize="7" fontWeight="600"
          fontFamily="'JetBrains Mono', monospace" fill="#10b981">LP</text>
      </g>

      {/* ── Stem (grows upward) ──────────────────── */}
      {/* Use rect growing from groundY up */}
      <rect
        x={cx - 2}
        y={stemTopY}
        width="4"
        rx="2"
        fill="#10b981"
        opacity="0.8"
      >
        {!reduced && (
          <>
            <animate attributeName="height" from="0" to={groundY - stemTopY}
              dur="1.2s" begin="0.2s" fill="freeze"
              calcMode="spline" keySplines="0.25 0.1 0.25 1" keyTimes="0;1" />
            <animate attributeName="y" from={groundY} to={stemTopY}
              dur="1.2s" begin="0.2s" fill="freeze"
              calcMode="spline" keySplines="0.25 0.1 0.25 1" keyTimes="0;1" />
          </>
        )}
        {reduced && (
          <>
            <animate attributeName="height" from={groundY - stemTopY} to={groundY - stemTopY} dur="0s" fill="freeze" />
            <animate attributeName="y" from={stemTopY} to={stemTopY} dur="0s" fill="freeze" />
          </>
        )}
      </rect>

      {/* Leaf left */}
      <ellipse cx={cx - 12} cy={stemTopY + 22} rx="10" ry="5"
        fill="#064e3b" stroke="#10b981" strokeWidth="1" strokeOpacity="0.6"
        style={reduced ? {} : {
          opacity: 0,
          animation: 'milestoneReveal 0.4s ease-out 1.1s forwards',
        }}
        transform="rotate(-20, 58, 132)"
      />
      {/* Leaf right */}
      <ellipse cx={cx + 12} cy={stemTopY + 22} rx="10" ry="5"
        fill="#064e3b" stroke="#10b981" strokeWidth="1" strokeOpacity="0.6"
        style={reduced ? {} : {
          opacity: 0,
          animation: 'milestoneReveal 0.4s ease-out 1.2s forwards',
        }}
        transform="rotate(20, 82, 132)"
      />

      {/* ── BDX coin (blooms at stem tip) ────────── */}
      <g style={reduced ? {} : {
        transformOrigin: `${cx}px ${stemTopY}px`,
        transformBox: 'fill-box',
        opacity: 0,
        animation: 'bloomIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 1.3s both',
      }}>
        <circle cx={cx} cy={stemTopY} r="18"
          fill="#111111" stroke="#10b981" strokeWidth="2"
          className={reduced ? '' : 'animate-glow-pulse'} />
        <text x={cx} y={stemTopY + 4} textAnchor="middle" fontSize="9" fontWeight="700"
          fontFamily="'JetBrains Mono', monospace" fill="#10b981">BDX</text>
      </g>

      {/* ── Floating reward particles ─────────────── */}
      {/* Particle 1 */}
      <text
        x={cx + 14} y={stemTopY - 8}
        fontSize="8" fontFamily="'JetBrains Mono', monospace" fill="#10b981" fontWeight="600"
        style={reduced ? { opacity: 0 } : {
          animation: 'particleRise 2s linear 2s infinite',
          transformOrigin: `${cx + 14}px ${stemTopY - 8}px`,
          transformBox: 'fill-box',
        }}
      >
        +BDX
      </text>

      {/* Particle 2 (staggered) */}
      <text
        x={cx - 22} y={stemTopY - 4}
        fontSize="7" fontFamily="'JetBrains Mono', monospace" fill="#34d399" fontWeight="500"
        style={reduced ? { opacity: 0 } : {
          animation: 'particleRise 2s linear 3s infinite',
          transformOrigin: `${cx - 22}px ${stemTopY - 4}px`,
          transformBox: 'fill-box',
        }}
      >
        +BDX
      </text>

      {/* APR badge */}
      <g style={reduced ? {} : {
        opacity: 0,
        animation: 'milestoneReveal 0.4s ease-out 1.8s forwards',
      }}>
        <rect x="90" y="10" width="40" height="16" rx="4"
          fill="#064e3b" stroke="#10b981" strokeWidth="1" strokeOpacity="0.5" />
        <text x="110" y="21" textAnchor="middle" fontSize="8" fontWeight="600"
          fontFamily="'JetBrains Mono', monospace" fill="#10b981">24.5% APR</text>
      </g>
    </svg>
  );
}
