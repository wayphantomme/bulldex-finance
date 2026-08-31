'use client';

/**
 * LendingHealthDiagram
 * Concept: Semi-circular health factor gauge, needle sweeping from danger → healthy.
 * Animations: gauge arc draw-on, needle spring sweep, needle idle pulse.
 */

import { SVGProps } from 'react';
import { useReducedMotion } from './utils/reducedMotion';

interface Props extends SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  /** Health factor value to display. Defaults to 1.85 */
  healthFactor?: number;
}

// Helpers to build SVG arc paths for a semi-circle gauge
// startDeg/endDeg in degrees, 0 = right, CCW
function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  return `M ${x1},${y1} A ${r},${r} 0 ${large} 1 ${x2},${y2}`;
}

export function LendingHealthDiagram({ width, height, healthFactor = 1.85, className = '', ...props }: Props) {
  const reduced = useReducedMotion();

  const cx = 100; const cy = 88;
  const r  = 60;

  // Gauge spans -180° → 0° (left to right across top)
  // Red: -180° → -120°, Yellow: -120° → -60°, Green: -60° → 0°
  const segments = [
    { start: -180, end: -120, color: '#ef4444', label: 'Liq.',  lx: cx - 66, ly: cy + 18 },
    { start: -120, end:  -60, color: '#f59e0b', label: 'Risk',  lx: cx - 10, ly: cy - 68 },
    { start:  -60, end:    0, color: '#22c55e', label: 'Safe',  lx: cx + 52, ly: cy + 18 },
  ];

  // Map healthFactor → needle angle
  // HF 1.0 (liquidation) = -180°, HF 1.5 = -90° (mid), HF 2.5+ = 0°
  const needleAngle = Math.min(0, Math.max(-180, -180 + ((healthFactor - 1) / 1.5) * 180));

  // Needle endpoint
  const toRad = (d: number) => (d * Math.PI) / 180;
  const needleTip = {
    x: cx + (r - 12) * Math.cos(toRad(needleAngle)),
    y: cy + (r - 12) * Math.sin(toRad(needleAngle)),
  };

  // Arc lengths for draw-on (each segment spans 60°)
  const segLen = Math.PI * r * (60 / 180); // ~62.8px each

  return (
    <svg
      role="img"
      viewBox="0 0 200 120"
      width={width}
      height={height}
      fill="none"
      className={className}
      aria-labelledby="lh-title lh-desc"
      {...props}
    >
      <title id="lh-title">Lending Health Factor Gauge</title>
      <desc id="lh-desc">
        Semi-circular gauge showing a health factor of {healthFactor}, sweeping from liquidation risk through caution to healthy zone.
      </desc>

      {/* ── Track (background arc) ───────────────── */}
      <path
        d={describeArc(cx, cy, r, -180, 0)}
        stroke="#1e1e1e"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── Colored gauge segments (draw on) ─────── */}
      {segments.map(({ start, end, color }, i) => (
        <path
          key={i}
          d={describeArc(cx, cy, r, start, end)}
          stroke={color}
          strokeWidth="8"
          strokeLinecap={i === 0 ? 'round' : i === 2 ? 'round' : 'butt'}
          strokeOpacity="0.85"
          fill="none"
          style={reduced ? {} : {
            strokeDasharray: segLen,
            strokeDashoffset: segLen,
          }}
        >
          {!reduced && (
            <animate
              attributeName="stroke-dashoffset"
              from={segLen}
              to={0}
              dur="0.8s"
              begin={`${i * 0.25}s`}
              fill="freeze"
              calcMode="spline"
              keySplines="0.42 0 0.58 1"
              keyTimes="0;1"
            />
          )}
        </path>
      ))}

      {/* ── Zone labels ──────────────────────────── */}
      {segments.map(({ lx, ly, label, color }) => (
        <text key={label} x={lx} y={ly} textAnchor="middle" fontSize="7.5"
          fontFamily="'JetBrains Mono', monospace" fill={color} opacity="0.7">
          {label}
        </text>
      ))}

      {/* ── Needle ───────────────────────────────── */}
      <g style={reduced ? {} : {
        transformOrigin: `${cx}px ${cy}px`,
        transformBox: 'fill-box',
        animation: `needleSweep 1.4s cubic-bezier(0.34,1.56,0.64,1) 0.8s both`,
      }}>
        {/* Override keyframe values via CSS custom property not possible in SVG;
            use SMIL animate for needle rotation instead */}
        <line
          x1={cx} y1={cy}
          x2={needleTip.x} y2={needleTip.y}
          stroke="#f5f5f5"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={reduced ? {} : { opacity: 0 }}
        >
          {!reduced && (
            <>
              <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="0.8s" fill="freeze" />
              <animate
                attributeName="x2"
                from={cx + (r - 12) * Math.cos(toRad(-180))}
                to={needleTip.x}
                dur="1.4s"
                begin="0.8s"
                fill="freeze"
                calcMode="spline"
                keySplines="0.34 1.56 0.64 1"
                keyTimes="0;1"
              />
              <animate
                attributeName="y2"
                from={cy + (r - 12) * Math.sin(toRad(-180))}
                to={needleTip.y}
                dur="1.4s"
                begin="0.8s"
                fill="freeze"
                calcMode="spline"
                keySplines="0.34 1.56 0.64 1"
                keyTimes="0;1"
              />
            </>
          )}
        </line>
        {reduced && (
          <line
            x1={cx} y1={cy}
            x2={needleTip.x} y2={needleTip.y}
            stroke="#f5f5f5"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}
      </g>

      {/* Needle pivot */}
      <circle cx={cx} cy={cy} r="4" fill="#f5f5f5" />
      <circle cx={cx} cy={cy} r="2" fill="#0d0d0d" />

      {/* ── Health factor label ───────────────────── */}
      <text x={cx} y={cy + 20} textAnchor="middle" fontSize="16" fontWeight="700"
        fontFamily="'JetBrains Mono', monospace" fill="#f5f5f5">
        {healthFactor.toFixed(2)}
      </text>
      <text x={cx} y={cy + 32} textAnchor="middle" fontSize="8"
        fontFamily="'JetBrains Mono', monospace" fill="#525252">
        health factor
      </text>
    </svg>
  );
}
