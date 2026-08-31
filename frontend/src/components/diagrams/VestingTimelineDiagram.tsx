'use client';

/**
 * VestingTimelineDiagram
 * Concept: Horizontal timeline with cliff + 3 linear unlock milestones.
 * Animations: progress bar fills left→right, milestones reveal in sequence, cliff flashes amber.
 */

import { SVGProps } from 'react';
import { useReducedMotion } from './utils/reducedMotion';

interface Props extends SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  /** Current progress 0-100. Defaults to 65 */
  progress?: number;
}

const MILESTONES = [
  { pct: 0,   label: 'Cliff', sublabel: 'Locked', icon: '🔒', color: '#f59e0b', y: 55 },
  { pct: 33,  label: '25%',   sublabel: 'Unlock', icon: '↑',  color: '#10b981', y: 55 },
  { pct: 66,  label: '50%',   sublabel: 'Unlock', icon: '↑',  color: '#10b981', y: 55 },
  { pct: 100, label: '100%',  sublabel: 'Full',   icon: '✓',  color: '#22c55e', y: 55 },
];

export function VestingTimelineDiagram({ width, height, progress = 65, className = '', ...props }: Props) {
  const reduced = useReducedMotion();

  const trackX = 16;
  const trackY = 36;
  const trackW = 288;
  const trackH = 6;
  const progressW = (progress / 100) * trackW;

  return (
    <svg
      role="img"
      viewBox="0 0 320 80"
      width={width ?? '100%'}
      height={height}
      fill="none"
      className={className}
      aria-labelledby="vt-title vt-desc"
      {...props}
    >
      <title id="vt-title">Vesting Timeline Diagram</title>
      <desc id="vt-desc">
        Animated timeline showing a vesting schedule with cliff period and linear unlock milestones at 25%, 50%, and 100%.
      </desc>

      {/* ── Background track ─────────────────────── */}
      <rect x={trackX} y={trackY} width={trackW} height={trackH} rx="3" fill="#1a1a1a" />

      {/* ── Progress fill ────────────────────────── */}
      <rect x={trackX} y={trackY} height={trackH} rx="3" fill="#10b981">
        {!reduced ? (
          <animate
            attributeName="width"
            from="0"
            to={progressW}
            dur="1.6s"
            begin="0.2s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.25 0.1 0.25 1"
            keyTimes="0;1"
          />
        ) : (
          <animate attributeName="width" from={progressW} to={progressW} dur="0s" fill="freeze" />
        )}
      </rect>

      {/* ── Milestone markers ────────────────────── */}
      {MILESTONES.map(({ pct, label, sublabel, color }, i) => {
        const mx        = trackX + (pct / 100) * trackW;
        const isPast    = pct <= progress;
        const delay     = `${0.4 + i * 0.3}s`;
        const revealAt  = isPast ? delay : `${2}s`; // past milestones reveal during fill

        return (
          <g key={label}>
            {/* Tick line */}
            <line x1={mx} y1={trackY - 2} x2={mx} y2={trackY + trackH + 2}
              stroke={color} strokeWidth="1.5" strokeOpacity="0.6"
              style={reduced ? {} : { opacity: 0 }}
            >
              {!reduced && (
                <animate attributeName="opacity" from="0" to="1"
                  dur="0.3s" begin={revealAt} fill="freeze" />
              )}
            </line>

            {/* Milestone circle */}
            <circle cx={mx} cy={trackY + trackH / 2} r="5"
              fill={isPast ? color : '#1a1a1a'}
              stroke={color}
              strokeWidth="1.5"
              style={reduced ? {} : { opacity: 0 }}
            >
              {!reduced && (
                <animate attributeName="opacity" from="0" to="1"
                  dur="0.3s" begin={revealAt} fill="freeze" />
              )}
            </circle>

            {/* Label above */}
            <text
              x={mx} y={trackY - 8}
              textAnchor="middle"
              fontSize="7.5"
              fontWeight="600"
              fontFamily="'JetBrains Mono', monospace"
              fill={color}
              style={reduced ? {} : { opacity: 0 }}
            >
              {label}
              {!reduced && (
                <animate attributeName="opacity" from="0" to="1"
                  dur="0.3s" begin={revealAt} fill="freeze" />
              )}
            </text>

            {/* Sub-label below */}
            <text
              x={mx} y={trackY + trackH + 14}
              textAnchor="middle"
              fontSize="7"
              fontFamily="'JetBrains Mono', monospace"
              fill="#525252"
              style={reduced ? {} : { opacity: 0 }}
            >
              {sublabel}
              {!reduced && (
                <animate attributeName="opacity" from="0" to="1"
                  dur="0.3s" begin={revealAt} fill="freeze" />
              )}
            </text>
          </g>
        );
      })}

      {/* ── Cliff flash (amber glow) ──────────────── */}
      {!reduced && (
        <circle cx={trackX} cy={trackY + trackH / 2} r="8"
          fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0">
          <animate attributeName="opacity" values="0;0.8;0;0.8;0"
            dur="1s" begin="0.4s" fill="freeze" />
          <animate attributeName="r" values="5;12;5;12;5"
            dur="1s" begin="0.4s" fill="freeze" />
        </circle>
      )}

      {/* ── Progress percentage label ─────────────── */}
      <text
        x={trackX + progressW - 2}
        y={trackY - 14}
        textAnchor="end"
        fontSize="8"
        fontWeight="700"
        fontFamily="'JetBrains Mono', monospace"
        fill="#10b981"
        style={reduced ? {} : { opacity: 0 }}
      >
        {progress}%
        {!reduced && (
          <animate attributeName="opacity" from="0" to="1"
            dur="0.3s" begin="1.7s" fill="freeze" />
        )}
      </text>

      {/* ── Vested label ─────────────────────────── */}
      <text x={trackX} y={trackY - 20} fontSize="8"
        fontFamily="'JetBrains Mono', monospace" fill="#525252">
        VESTED
      </text>
      <text x={trackX + trackW} y={trackY - 20} textAnchor="end" fontSize="8"
        fontFamily="'JetBrains Mono', monospace" fill="#525252">
        TOTAL
      </text>
    </svg>
  );
}
