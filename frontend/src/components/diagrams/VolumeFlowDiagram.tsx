'use client';

/**
 * VolumeFlowDiagram
 * Concept: Horizontal bar chart bars growing — "bar race" style — showing volume.
 * Animations: bars grow from 0 with stagger, highest bar highlighted in emerald.
 */

import { SVGProps, useEffect, useRef } from 'react';
import { useReducedMotion } from './utils/reducedMotion';

interface Props extends SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
}

const BARS = [
  { label: '24h',  pct: 72, value: '$29K',  active: false },
  { label: '7d',   pct: 88, value: '$198K', active: true  },
  { label: '30d',  pct: 60, value: '$820K', active: false },
  { label: '90d',  pct: 100, value: '$2.9M', active: false },
];

const MAX_W = 108; // px — max bar width inside viewBox
const BAR_H = 12;
const BAR_GAP = 20;
const START_Y = 18;
const LABEL_X = 22;
const BAR_START_X = 28;

export function VolumeFlowDiagram({ width, height, className = '', ...props }: Props) {
  const reduced = useReducedMotion();
  const svgRef  = useRef<SVGSVGElement>(null);

  // On mount (and every 4s), restart bar animations by toggling a key
  useEffect(() => {
    if (reduced) return;
    // Animations are CSS keyframes — reset by cloning node trick isn't needed;
    // SVG animate elements handle their own looping via begin/dur.
  }, [reduced]);

  return (
    <svg
      ref={svgRef}
      role="img"
      viewBox="0 0 160 100"
      width={width}
      height={height}
      fill="none"
      className={className}
      aria-labelledby="vf-title vf-desc"
      {...props}
    >
      <title id="vf-title">Volume Flow Diagram</title>
      <desc id="vf-desc">
        Animated bar chart showing trading volume accumulating over different time periods.
      </desc>

      {BARS.map((bar, i) => {
        const y       = START_Y + i * BAR_GAP;
        const barW    = (bar.pct / 100) * MAX_W;
        const color   = bar.active ? '#10b981' : '#262626';
        const textCol = bar.active ? '#10b981' : '#525252';
        const delay   = `${i * 0.15}s`;

        return (
          <g key={bar.label}>
            {/* Row label */}
            <text
              x={LABEL_X - 2} y={y + BAR_H - 2}
              textAnchor="end"
              fontSize="8"
              fontFamily="'JetBrains Mono', monospace"
              fill="#525252"
            >
              {bar.label}
            </text>

            {/* Background track */}
            <rect
              x={BAR_START_X} y={y}
              width={MAX_W} height={BAR_H}
              rx="3" fill="#1a1a1a"
            />

            {/* Animated bar */}
            <rect
              x={BAR_START_X} y={y}
              height={BAR_H} rx="3"
              fill={color}
              style={{ opacity: reduced ? 1 : undefined }}
            >
              {!reduced && (
                <animate
                  attributeName="width"
                  from="0"
                  to={barW}
                  dur="0.8s"
                  begin={delay}
                  fill="freeze"
                  calcMode="spline"
                  keySplines="0.25 0.1 0.25 1"
                  keyTimes="0;1"
                  repeatCount="1"
                />
              )}
              {reduced && (
                <animate
                  attributeName="width"
                  from={barW}
                  to={barW}
                  dur="0s"
                  fill="freeze"
                />
              )}
            </rect>
            {/* Active bar shimmer line */}
            {bar.active && (
              <rect
                x={BAR_START_X} y={y + BAR_H - 2}
                height="2" rx="1"
                fill="#34d399"
                opacity="0.6"
              >
                {!reduced && (
                  <animate
                    attributeName="width"
                    from="0"
                    to={barW}
                    dur="0.8s"
                    begin={delay}
                    fill="freeze"
                  />
                )}
              </rect>
            )}

            {/* Value label — fades in after bar */}
            <text
              x={BAR_START_X + barW + 4}
              y={y + BAR_H - 2}
              fontSize="8"
              fontFamily="'JetBrains Mono', monospace"
              fill={textCol}
              style={{ opacity: reduced ? 1 : 0 }}
            >
              {bar.value}
              {!reduced && (
                <animate
                  attributeName="opacity"
                  from="0" to="1"
                  dur="0.3s"
                  begin={`${i * 0.15 + 0.7}s`}
                  fill="freeze"
                />
              )}
            </text>
          </g>
        );
      })}

      {/* Axis line */}
      <line
        x1={BAR_START_X} y1={START_Y - 4}
        x2={BAR_START_X} y2={START_Y + BARS.length * BAR_GAP - 4}
        stroke="#262626" strokeWidth="1"
      />
    </svg>
  );
}
