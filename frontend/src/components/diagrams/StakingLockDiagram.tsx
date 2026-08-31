'use client';

/**
 * StakingLockDiagram
 * Concept: BDX token locked inside a padlock, APR counter ticking up.
 * Animations: shackle draw-on, APR counter, glow pulse on padlock body.
 */

import { SVGProps, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './utils/reducedMotion';

interface Props extends SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  /** Target APR displayed. Defaults to 22.8 */
  apr?: number;
}

export function StakingLockDiagram({ width, height, apr = 22.8, className = '', ...props }: Props) {
  const reduced = useReducedMotion();
  const [displayed, setDisplayed] = useState(reduced ? apr : 0);
  const rafRef  = useRef<number>(0);
  const startTs = useRef<number>(0);
  const DURATION = 1800; // ms

  useEffect(() => {
    if (reduced) {
      setDisplayed(apr);
      return;
    }

    // Delay start so shackle draws first
    const timeout = setTimeout(() => {
      startTs.current = performance.now();
      const tick = (now: number) => {
        const elapsed = now - startTs.current;
        const progress = Math.min(elapsed / DURATION, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayed(parseFloat((eased * apr).toFixed(1)));
        if (progress < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }, 400);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [apr, reduced]);

  // Padlock geometry
  const bodyX = 30; const bodyY = 58;
  const bodyW = 60; const bodyH = 50;
  const cx = bodyX + bodyW / 2; // 60
  const shackleR = 20;

  return (
    <svg
      role="img"
      viewBox="0 0 120 140"
      width={width}
      height={height}
      fill="none"
      className={className}
      aria-labelledby="sl-title sl-desc"
      {...props}
    >
      <title id="sl-title">Staking Lock Diagram</title>
      <desc id="sl-desc">
        Animated padlock diagram showing BDX tokens locked for staking with an APR counter.
      </desc>

      <defs>
        {/* Shackle draw-on path — arc from left shoulder to right shoulder */}
        <path
          id="sl-shackle-path"
          d={`M ${cx - shackleR},${bodyY}
              A ${shackleR},${shackleR} 0 0 1 ${cx + shackleR},${bodyY}`}
        />
      </defs>

      {/* ── Lock period badge ─────────────────────── */}
      <g style={{ animation: reduced ? 'none' : 'bloomIn 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.2s both', transformOrigin: '60px 14px', transformBox: 'fill-box' }}>
        <rect x="26" y="6" width="68" height="16" rx="8"
          fill="#064e3b" stroke="#10b981" strokeWidth="1" strokeOpacity="0.5" />
        <text x="60" y="17.5" textAnchor="middle" fontSize="8" fontWeight="600"
          fontFamily="'JetBrains Mono', monospace" fill="#10b981" letterSpacing="0.3">
          180d LOCK
        </text>
      </g>

      {/* ── Shackle (arc) — draws on ─────────────── */}
      <path
        d={`M ${cx - shackleR},${bodyY} A ${shackleR},${shackleR} 0 0 1 ${cx + shackleR},${bodyY}`}
        stroke="#10b981"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        style={reduced ? {} : {
          strokeDasharray: 70,
          strokeDashoffset: 70,
          animation: 'progressFill 1.2s ease-in-out 0.1s forwards',
          // reuse progressFill keyframe but for stroke-dashoffset
        }}
      >
        {!reduced && (
          <animate
            attributeName="stroke-dashoffset"
            from="70" to="0"
            dur="1.2s"
            begin="0.1s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.42 0 0.58 1"
            keyTimes="0;1"
          />
        )}
      </path>

      {/* Shackle bottom anchors */}
      <rect x={cx - shackleR - 3} y={bodyY - 4} width="6" height="12" rx="2"
        fill="#161616" stroke="#10b981" strokeWidth="1.5" />
      <rect x={cx + shackleR - 3} y={bodyY - 4} width="6" height="12" rx="2"
        fill="#161616" stroke="#10b981" strokeWidth="1.5" />

      {/* ── Padlock body (glow pulsing) ──────────── */}
      <rect
        x={bodyX} y={bodyY}
        width={bodyW} height={bodyH}
        rx="8"
        fill="#111111"
        stroke="#10b981"
        strokeWidth="1.5"
        className={reduced ? '' : 'animate-glow-pulse'}
      />

      {/* Inner key hole */}
      <circle cx={cx} cy={bodyY + 20} r="7" fill="#1a1a1a" stroke="#262626" strokeWidth="1" />
      <rect x={cx - 3} y={bodyY + 20} width="6" height="10" rx="2" fill="#1a1a1a" stroke="#262626" strokeWidth="1" />

      {/* BDX label inside body */}
      <text x={cx} y={bodyY + 42} textAnchor="middle" fontSize="9" fontWeight="700"
        fontFamily="'JetBrains Mono', monospace" fill="#525252" letterSpacing="0.5">BDX</text>

      {/* ── APR counter ──────────────────────────── */}
      <text
        x={cx} y={122}
        textAnchor="middle"
        fontSize="14"
        fontWeight="700"
        fontFamily="'JetBrains Mono', monospace"
        fill="#10b981"
      >
        {displayed.toFixed(1)}%
      </text>
      <text x={cx} y={135} textAnchor="middle" fontSize="8" fontFamily="'JetBrains Mono', monospace" fill="#525252">
        APR
      </text>
    </svg>
  );
}
