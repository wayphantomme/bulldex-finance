'use client';

/**
 * ProtocolFlowDiagram
 * Concept: Wallet → Bulldex contract → Pool / Stake / Lend outputs
 * Used as background art in the hero TVL panel.
 * Animations: dashed line flow, node pulse, particles along paths.
 */

import { SVGProps } from 'react';

interface Props extends SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
}

export function ProtocolFlowDiagram({ width, height, className = '', ...props }: Props) {
  // Key coordinates
  const walletX = 50;
  const contractX = 180;
  const cy = 100;
  const outputY = [55, 100, 145];
  const outputX = 330;

  // Paths from contract to outputs
  const pathTop    = `M ${contractX + 28},${cy} L ${contractX + 28},${outputY[0]} L ${outputX - 24},${outputY[0]}`;
  const pathMid    = `M ${contractX + 28},${cy} L ${outputX - 24},${outputY[1]}`;
  const pathBottom = `M ${contractX + 28},${cy} L ${contractX + 28},${outputY[2]} L ${outputX - 24},${outputY[2]}`;
  const pathMain   = `M ${walletX + 22},${cy} L ${contractX - 28},${cy}`;

  const outputNodes = [
    { y: outputY[0], label: 'POOL',  color: '#3b82f6', delay: '0s'    },
    { y: outputY[1], label: 'STAKE', color: '#10b981', delay: '0.4s'  },
    { y: outputY[2], label: 'LEND',  color: '#8b5cf6', delay: '0.8s'  },
  ];

  return (
    <svg
      role="img"
      viewBox="0 0 400 200"
      width={width ?? '100%'}
      height={height}
      fill="none"
      className={className}
      aria-labelledby="pf-title pf-desc"
      {...props}
    >
      <title id="pf-title">Protocol Flow Diagram</title>
      <desc id="pf-desc">
        Animated diagram showing tokens flowing from a wallet into the Bulldex smart contract, then distributing to Pool, Stake, and Lend outputs.
      </desc>

      <defs>
        <marker id="pf-arrow" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
          <polygon points="0 0, 7 2.5, 0 5" fill="#404040" />
        </marker>
        <marker id="pf-arrow-green" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
          <polygon points="0 0, 7 2.5, 0 5" fill="#10b981" />
        </marker>
      </defs>

      {/* ── Main flow line (wallet → contract) ──── */}
      <path
        d={pathMain}
        stroke="#404040"
        strokeWidth="1.5"
        strokeDasharray="5 4"
        markerEnd="url(#pf-arrow)"
        className="animate-dash-flow"
      />

      {/* ── Wallet icon ──────────────────────────── */}
      <g>
        <rect x={walletX - 20} y={cy - 18} width="40" height="36" rx="6"
          fill="#161616" stroke="#404040" strokeWidth="1.5" />
        {/* Wallet slot */}
        <rect x={walletX - 12} y={cy - 6} width="24" height="12" rx="3"
          fill="#262626" stroke="#404040" strokeWidth="1" />
        <circle cx={walletX + 6} cy={cy} r="3" fill="#525252" />
        <text x={walletX} y={cy + 28}
          textAnchor="middle" fontSize="8" fill="#525252"
          fontFamily="'JetBrains Mono', monospace">WALLET</text>
      </g>

      {/* ── Contract box ─────────────────────────── */}
      <g>
        <rect x={contractX - 28} y={cy - 24} width="56" height="48" rx="6"
          fill="#0d0d0d" stroke="#10b981" strokeWidth="1.5"
          className="animate-glow-pulse" />
        {/* Inner grid lines */}
        <line x1={contractX - 16} y1={cy - 10} x2={contractX + 16} y2={cy - 10}
          stroke="#10b981" strokeWidth="1" strokeOpacity="0.4" />
        <line x1={contractX - 16} y1={cy} x2={contractX + 16} y2={cy}
          stroke="#10b981" strokeWidth="1" strokeOpacity="0.4" />
        <line x1={contractX - 16} y1={cy + 10} x2={contractX + 16} y2={cy + 10}
          stroke="#10b981" strokeWidth="1" strokeOpacity="0.4" />
        <text x={contractX} y={cy + 38}
          textAnchor="middle" fontSize="8" fill="#10b981"
          fontFamily="'JetBrains Mono', monospace" letterSpacing="0.3">BDX</text>
      </g>

      {/* ── Branch lines to outputs ──────────────── */}
      {[pathTop, pathMid, pathBottom].map((d, i) => (
        <path
          key={i}
          d={d}
          stroke="#262626"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          markerEnd="url(#pf-arrow-green)"
          className="animate-dash-flow"
          style={{ animationDelay: `${0.3 * i}s` }}
        />
      ))}

      {/* ── Output nodes ─────────────────────────── */}
      {outputNodes.map(({ y, label, color, delay }) => (
        <g key={label} style={{ animation: `nodePulse 2s ease-in-out ${delay} infinite`, transformOrigin: `${outputX}px ${y}px`, transformBox: 'fill-box' }}>
          <circle cx={outputX} cy={y} r="20"
            fill="#111111" stroke={color} strokeWidth="1.5" />
          <text x={outputX} y={y + 4}
            textAnchor="middle" fontSize="8" fontWeight="700"
            fontFamily="'JetBrains Mono', monospace" fill={color}>
            {label}
          </text>
        </g>
      ))}

      {/* ── Travelling particles (main line) ─────── */}
      <circle r="3" fill="#10b981" opacity="0.9">
        <animateMotion dur="1.8s" repeatCount="indefinite" path={pathMain} />
      </circle>

      {/* ── Travelling particles (branch lines) ──── */}
      {[pathTop, pathMid, pathBottom].map((d, i) => (
        <circle key={i} r="2" opacity="0.85" fill={outputNodes[i].color}>
          <animateMotion
            dur="1.6s"
            begin={`${i * 0.5}s`}
            repeatCount="indefinite"
            path={d}
          />
        </circle>
      ))}
    </svg>
  );
}
