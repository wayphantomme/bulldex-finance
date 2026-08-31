# Landing Page — Premium Animated SVG Diagrams

> **Goal:** Replace static icon placeholders in the landing page with purpose-built, fully animated inline SVG diagrams that communicate each DeFi primitive visually. No third-party animation libraries. Pure SVG + CSS `@keyframes` + Tailwind.

---

## 1. Philosophy

- **Inline SVG only.** No `<img src="...svg">`, no Lottie, no Framer Motion. Pure React JSX SVG so the animation is style-sheet driven and zero bundle overhead.
- **Dark-first.** Every diagram inherits the `#0d0d0d` / `#111111` background hierarchy. Strokes are `#262626` → `#404040` for ambient lines, `#10b981` for the active/highlight layer.
- **Purposeful motion.** Each animation communicates a concept (tokens flowing, liquidity pooling, etc.), not decorative looping. Motion must feel calm at `1–2s` cycle, never frantic.
- **No glow blobs, no gradients on chrome.** Gradients are allowed only inside the SVG `<defs>` for chart fills.
- **Accessible.** Each `<svg>` has `role="img"` and `<title>` + `<desc>`. Motion respects `prefers-reduced-motion`.

---

## 2. Where Diagrams Live on the Landing Page

Reference file: `frontend/src/app/page.tsx`

| Section | Current content | Replace with |
|---|---|---|
| Hero right panel – Panel 1 (col-span-2) | TVL stat + MiniAreaChart | Keep stat, swap chart area for `<ProtocolFlowDiagram />` |
| Hero right panel – Panel 2 | "Active Pools" count | Add `<LiquidityPoolDiagram />` as background art |
| Hero right panel – Panel 3 | "24h Volume" stat | Add `<VolumeFlowDiagram />` subtle backdrop |
| Value Props section – icon | Plain emoji / unicode glyph | Replace per-card icon with matching SVG diagram |
| Products section – each card | Tag badge only | Add 32×32px micro-diagram per product card |

---

## 3. Diagram Inventory

### 3.1 `ProtocolFlowDiagram`
**Path:** `frontend/src/components/diagrams/ProtocolFlowDiagram.tsx`  
**Concept:** Token flowing from wallet → Bulldex smart contract → multiple yield outputs.

**SVG structure:**
```
[Wallet icon] ──●──●──●──► [BDX Contract box]
                                    │
                     ┌──────────────┼──────────────┐
                     ▼              ▼               ▼
               [Pool node]    [Stake node]    [Lend node]
```

**Animations:**
- `dashFlow` — dashed stroke `stroke-dashoffset` scrolling from wallet → contract. `duration: 1.8s`, linear, infinite.
- `nodePulse` — each output node `r` scales from `1` → `1.12` → `1`. `duration: 2s`, ease-in-out, staggered by `0.4s`.
- `particleDot` — 3 small `<circle r="2" fill="#10b981">` elements travelling along the path using `animateMotion` with `<mpath>`. `duration: 1.8s`, repeat indefinitely.

**Size:** `viewBox="0 0 400 200"`, responsive via `width="100%"`.

---

### 3.2 `LiquidityPoolDiagram`
**Path:** `frontend/src/components/diagrams/LiquidityPoolDiagram.tsx`  
**Concept:** Two tokens dropping into a shared pool (AMM visual).

**SVG structure:**
```
[TokenA circle]   [TokenB circle]
       │                  │
       └──────┬───────────┘
              ▼
     [Ellipse pool — animated fill level]
              │
       [LP Token arrow out]
```

**Animations:**
- `dropA` / `dropB` — token circles translate from top → into pool. `duration: 1.5s`, ease-in, repeat.
- `poolFill` — pool ellipse `ry` grows from `8` → `18` → `8`. `duration: 3s`, ease-in-out, infinite.
- `ripple` — expanding `<circle>` at pool centre, `opacity` fading from `0.5` → `0`. `duration: 2s`, repeat.

**Colors:**
- TokenA: `fill="#3b82f6"` (blue) — represents base token.
- TokenB: `fill="#10b981"` (emerald) — BDX.
- Pool: `stroke="#10b981"`, `fill="#064e3b20"`.

**Size:** `viewBox="0 0 180 160"`.

---

### 3.3 `VolumeFlowDiagram`
**Path:** `frontend/src/components/diagrams/VolumeFlowDiagram.tsx`  
**Concept:** Horizontal bar chart bars growing — animated "bar race" style — to show trading volume accumulating.

**SVG structure:**
```
[Bar row 1] ████████░░░
[Bar row 2] ██████░░░░░
[Bar row 3] ████████████
[Bar row 4] █████░░░░░░
```

**Animations:**
- `barGrow-N` — each `<rect>` animates `width` from `0` → `target%`. Stagger `0.15s` per bar. `duration: 0.8s`, ease-out, plays once on mount then loops every `4s`.
- Active (highest) bar gets `fill="#10b981"`, others `fill="#262626"`.
- Tip value label `<text>` fades in after bar grows.

**Size:** `viewBox="0 0 160 100"`.

---

### 3.4 `StakingLockDiagram`
**Path:** `frontend/src/components/diagrams/StakingLockDiagram.tsx`  
**Concept:** BDX token locked inside a padlock, APR counter ticking up.

**SVG structure:**
```
      [Padlock body — rounded rect]
      [Shackle arc]
      [BDX label inside]
      [Ticker: 22.8% APR — counting up]
```

**Animations:**
- `shackleClose` — shackle arc `stroke-dashoffset` draws in. `duration: 1.2s`, ease-in-out, once then repeat after `4s` delay.
- `aprCount` — CSS `counter-reset` trick not available in SVG; instead use `<textContent>` swapped via React `useEffect` at `requestAnimationFrame` or `setInterval(16ms)` counting from `0%` → `22.8%`. Pause after reaching target.
- `glowPulse` — padlock body subtle `filter: drop-shadow(0 0 4px #10b98140)` pulsing. `duration: 2s`, alternate.

**Reduced motion fallback:** Skip `aprCount`, show static `22.8%`.

**Size:** `viewBox="0 0 120 140"`.

---

### 3.5 `LendingHealthDiagram`
**Path:** `frontend/src/components/diagrams/LendingHealthDiagram.tsx`  
**Concept:** Semi-circular health factor gauge, needle animating from safe zone to healthy.

**SVG structure:**
```
    [Semicircle arc — gradient red→yellow→green]
    [Needle line — pivoting from center]
    [Health factor label: "1.85"]
    [Zone labels: Liquidation · Caution · Healthy]
```

**Animations:**
- `needleSweep` — `<line>` or `<path>` `transform="rotate(deg, cx, cy)"` animates from `rotate(-80)` → `rotate(20)`. `duration: 1.4s`, cubic-bezier(0.34, 1.56, 0.64, 1) (spring).
- `gaugeSegments` — three `<path>` arc segments use `stroke-dashoffset` to draw in sequentially. `duration: 1s`, stagger `0.2s`.
- After reaching healthy position: needle `opacity` pulses `0.7 → 1.0`. `duration: 2s`, alternate infinite.

**Colors:**
- Red zone: `#ef4444`, Yellow: `#f59e0b`, Green: `#22c55e`.
- Needle: `stroke="#f5f5f5"`.

**Size:** `viewBox="0 0 200 120"`.

---

### 3.6 `FarmingYieldDiagram`
**Path:** `frontend/src/components/diagrams/FarmingYieldDiagram.tsx`  
**Concept:** LP tokens being planted as seeds, BDX reward tokens sprouting up.

**SVG structure:**
```
[Ground line]
[Seed circles beneath soil — hidden]
     ↓ plant animation ↓
[Stem growing up]
[BDX coin blooming at top]
[Floating +BDX reward particle]
```

**Animations:**
- `stemGrow` — `<line>` or `<rect>` height animates from `0` → `40px`. `duration: 1.2s`, ease-out.
- `bloom` — BDX coin `scale(0)` → `scale(1)` with transform-origin at stem tip. `duration: 0.4s`, spring, after `1s` delay.
- `rewardFloat` — small `+BDX` text `<text>` translates up `0` → `-30px` while `opacity` fades `1 → 0`. `duration: 1.5s`, linear, repeat every `3s`.

**Size:** `viewBox="0 0 140 160"`.

---

### 3.7 `VestingTimelineDiagram`
**Path:** `frontend/src/components/diagrams/VestingTimelineDiagram.tsx`  
**Concept:** Horizontal timeline with cliff + linear unlock milestones.

**SVG structure:**
```
[────────────── timeline bar ──────────────]
    │ cliff     │ unlock 25%  │ unlock 50%  │ 100%
    ▼           ▼             ▼             ▼
  [lock]      [unlock]     [unlock]      [full]
```

**Animations:**
- `progressFill` — timeline bar `<rect>` or `<line>` `width` animates from `0` → `current progress %`. `duration: 1.6s`, ease-out.
- `milestoneReveal` — milestone circles `opacity: 0` → `1` triggered sequentially based on `progressFill` timing.
- `cliffFlash` — cliff marker briefly glows `#f59e0b` to show "locked until here". `duration: 0.5s`, twice.

**Size:** `viewBox="0 0 320 80"`.

---

### 3.8 `SwapRouteDiagram`
**Path:** `frontend/src/components/diagrams/SwapRouteDiagram.tsx`  
**Concept:** Token swap route — TokenA → AMM Pool → TokenB.

**SVG structure:**
```
[TokenA coin] ──────► [Pool hexagon] ──────► [TokenB coin]
                            │
                     [Fee badge: 0.3%]
```

**Animations:**
- `tokenTravel` — `<animateMotion>` moves a small coin icon along the path. `duration: 1.2s`, repeat.
- `poolRotate` — pool hexagon slowly `rotate(0)` → `rotate(360)`. `duration: 8s`, linear, infinite.
- `feePopIn` — fee badge `scale(0)` → `scale(1)` on load. `duration: 0.3s`, spring.

**Size:** `viewBox="0 0 280 100"`.

---

## 4. Shared Utilities

### `frontend/src/components/diagrams/utils/motionTokens.ts`
```ts
// Shared animation timing constants for SVG diagrams
export const MOTION = {
  dash:    '1.8s linear infinite',
  pulse:   '2s ease-in-out infinite',
  grow:    '0.8s ease-out forwards',
  spring:  'cubic-bezier(0.34, 1.56, 0.64, 1)',
  float:   '3s ease-in-out infinite alternate',
  fadeIn:  '0.4s ease-out forwards',
  stagger: (n: number) => `${n * 0.15}s`,
};
```

### `frontend/src/components/diagrams/utils/reducedMotion.ts`
```ts
// Hook: reads prefers-reduced-motion
import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}
```

### `frontend/src/components/diagrams/utils/animatedPath.ts`
Helper to compute `stroke-dasharray` and initial `stroke-dashoffset` for draw-on animations from a `<path>` element ref.

```ts
import { RefObject, useEffect } from 'react';

export function useDrawOnReveal(pathRef: RefObject<SVGPathElement>) {
  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray  = `${len}`;
    el.style.strokeDashoffset = `${len}`;
    // trigger reflow
    el.getBoundingClientRect();
    el.style.transition = 'stroke-dashoffset 1.2s ease-out';
    el.style.strokeDashoffset = '0';
  }, [pathRef]);
}
```

---

## 5. `globals.css` Additions

Add to `frontend/src/app/globals.css`:

```css
/* ── SVG Diagram Animations ───────────────────────────── */

/* Dashed line flow (token travel) */
@keyframes dashFlow {
  to { stroke-dashoffset: -24; }
}
.animate-dash-flow {
  animation: dashFlow 1.8s linear infinite;
}

/* Node pulse (scale) */
@keyframes nodePulse {
  0%, 100% { transform: scale(1);    opacity: 0.9; }
  50%       { transform: scale(1.12); opacity: 1;   }
}
.animate-node-pulse {
  animation: nodePulse 2s ease-in-out infinite;
}

/* Bar grow (width from 0) — use with CSS custom properties */
@keyframes barGrow {
  from { width: 0; }
  to   { width: var(--bar-target, 100%); }
}
.animate-bar-grow {
  animation: barGrow 0.8s ease-out forwards;
}

/* Ripple (pool surface) */
@keyframes ripple {
  0%   { r: 4;  opacity: 0.6; }
  100% { r: 24; opacity: 0;   }
}
.animate-ripple {
  animation: ripple 2s ease-out infinite;
}

/* Float (subtle up/down) */
@keyframes floatUpDown {
  0%, 100% { transform: translateY(0);   }
  50%       { transform: translateY(-6px); }
}
.animate-float {
  animation: floatUpDown 3s ease-in-out infinite alternate;
}

/* Particle travel (reward token rising) */
@keyframes particleRise {
  0%   { transform: translateY(0);    opacity: 1; }
  100% { transform: translateY(-32px); opacity: 0; }
}
.animate-particle-rise {
  animation: particleRise 1.5s linear infinite;
}

/* Glow pulse (padlock, CTA) */
@keyframes glowPulse {
  0%, 100% { filter: drop-shadow(0 0 0px #10b98100); }
  50%       { filter: drop-shadow(0 0 6px #10b98160); }
}
.animate-glow-pulse {
  animation: glowPulse 2s ease-in-out infinite;
}

/* Slow spin (hexagon pool) */
@keyframes slowSpin {
  to { transform: rotate(360deg); }
}
.animate-slow-spin {
  animation: slowSpin 8s linear infinite;
  transform-origin: center;
  transform-box: fill-box;
}

/* Reduced motion override */
@media (prefers-reduced-motion: reduce) {
  .animate-dash-flow,
  .animate-node-pulse,
  .animate-bar-grow,
  .animate-ripple,
  .animate-float,
  .animate-particle-rise,
  .animate-glow-pulse,
  .animate-slow-spin {
    animation: none;
  }
}
```

---

## 6. Landing Page Integration Plan

### 6.1 Hero Panel: replace MiniAreaChart → ProtocolFlowDiagram

In `frontend/src/app/page.tsx`, Panel 1 (col-span-2):

```tsx
// Before
<MiniAreaChart data={MOCK_TVL_TREND} height={56} color="green" />

// After
<ProtocolFlowDiagram className="absolute inset-0 opacity-15 group-hover:opacity-25 transition-opacity" />
```

Keep the stat text on top with `relative z-10`.

---

### 6.2 Value Props: replace emoji icon → per-card SVG

Map each VALUE_PROP to its diagram:

| Title | Diagram |
|---|---|
| Trustless by design | `<SwapRouteDiagram />` — smart contract routing |
| Composable DeFi primitives | `<ProtocolFlowDiagram />` |
| Transparent and verifiable | `<VolumeFlowDiagram />` |

Replace the `<div>` emoji block:
```tsx
// Before
<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-bg-elevated text-[24px]">
  {vp.icon}
</div>

// After
<div className="mb-4 h-14 w-14">
  <vp.DiagramComponent width={56} height={56} />
</div>
```

Add `DiagramComponent` field to `VALUE_PROPS` array.

---

### 6.3 Products Grid: add micro-diagram per card

Map each PRODUCT to a diagram:

| Product | Diagram |
|---|---|
| Swap | `<SwapRouteDiagram />` |
| Liquidity | `<LiquidityPoolDiagram />` |
| Lending | `<LendingHealthDiagram />` |
| Staking | `<StakingLockDiagram />` |
| Farming | `<FarmingYieldDiagram />` |
| Vesting | `<VestingTimelineDiagram />` |

Each card gets a 48×48px diagram in the header row:
```tsx
<div className="mb-4 flex items-center justify-between">
  <h3 className="...">{p.label}</h3>
  <div className="h-12 w-12 shrink-0">
    <p.DiagramComponent />
  </div>
</div>
```

---

## 7. File Structure After Implementation

```
frontend/src/components/diagrams/
├── DataFlowDiagram.tsx         (existing, keep)
├── ProtocolFlowDiagram.tsx     (new — P0)
├── LiquidityPoolDiagram.tsx    (new — P0)
├── VolumeFlowDiagram.tsx       (new — P0)
├── StakingLockDiagram.tsx      (new — P1)
├── LendingHealthDiagram.tsx    (new — P1)
├── FarmingYieldDiagram.tsx     (new — P1)
├── VestingTimelineDiagram.tsx  (new — P1)
├── SwapRouteDiagram.tsx        (new — P0)
├── index.ts                    (barrel export — new)
└── utils/
    ├── motionTokens.ts         (new)
    ├── reducedMotion.ts        (new)
    └── animatedPath.ts         (new)
```

---

## 8. Quality Checklist

Before marking each diagram done:

- [ ] SVG has `role="img"`, `<title>`, `<desc>` for screen readers
- [ ] All animations stop when `prefers-reduced-motion: reduce` is set
- [ ] No animation `duration` shorter than `300ms` (prevents seizure risk)
- [ ] Stroke widths minimum `1.5px` for visibility
- [ ] Text elements use `fill="currentColor"` or explicit hex — never inheriting from broken CSS cascade
- [ ] Works correctly inside a `<div className="overflow-hidden rounded-lg">` container
- [ ] Tested at 360px mobile width — no clipping or overflow
- [ ] Dark background: all elements visible on `#0d0d0d` and `#111111`
- [ ] No `!important`, no inline `style` beyond SVG-specific attributes

---

## 9. Implementation Order

1. `globals.css` — add all keyframes (Section 5)
2. `utils/motionTokens.ts`, `reducedMotion.ts`, `animatedPath.ts`
3. `SwapRouteDiagram.tsx` (simplest, good warmup)
4. `LiquidityPoolDiagram.tsx`
5. `ProtocolFlowDiagram.tsx` (hero — most visible)
6. `VolumeFlowDiagram.tsx`
7. `StakingLockDiagram.tsx`
8. `LendingHealthDiagram.tsx`
9. `FarmingYieldDiagram.tsx`
10. `VestingTimelineDiagram.tsx`
11. Update `page.tsx` — integrate all diagrams
12. Barrel `index.ts`

---

*Last updated: Aug 31, 2026. Source of truth for all SVG diagram work on the Bulldex landing page.*
