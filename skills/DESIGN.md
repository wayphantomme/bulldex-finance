# Bulldex → Jupiter-style Design Upgrade

Source reference: `jup.ag` screenshot (Perps page). Target repo: `bulldex-finance-main/frontend`.

---

## 1. What's actually going on in the Jupiter screenshot

The biggest misconception is "Jupiter = green app." It isn't. Green is a **signal color**, used
on maybe 5% of the surface area. Everything else is neutral black/gray. That's exactly the gap
between the screenshot and your current Bulldex build — your `tailwind.config.ts` currently ties
green into almost every layer (page background gradient, card borders, focus rings, shimmer,
text-secondary color), so the whole app reads as "green app" instead of "dark app with a green
accent."

### 1.1 Color usage breakdown (from the screenshot)

| Layer | What color it actually is | Where green shows up |
|---|---|---|
| Page background | Near-black (`#0A0A0B`–`#0C0C0D`), basically flat, very faint texture | nowhere — no green tint |
| Sidebar background | Same near-black as page, no visible separation/border | nowhere |
| Cards / panels (promo cards, swap card) | Dark charcoal gray, a shade lighter than the page (`#16171B`–`#1A1B1F`) | nowhere — borders are neutral gray, near-invisible |
| Body text | White / off-white (`#F5F5F5`) | — |
| Secondary/muted text (labels, "Sell", "Buy") | Mid gray (`#8A8D93`) | — |
| Primary CTA ("Connect" button) | **Solid lime-green** (`#C8F169`-ish, closer to yellow-green than emerald), black text | ✅ green |
| Active tab pill ("Market") | Same lime-green pill, black text | ✅ green |
| "Rewards" pill button | Dark gray/black pill with a small green gift icon only | icon only |
| Nav "New" badge | Small green pill, black/dark text | ✅ green |
| Ticker gainers (SOL/JUP % up) | Green text only on the number when positive; red when negative | ✅ conditional |
| "Ultra" icon + label | Small green sparkle icon; text stays white | icon only |
| Active sidebar item ("Perps") | Selected item gets a **subtle dark-gray rounded highlight**, not green — icon/text stay white/light | none |
| Everything else (icons, dividers, token dropdowns, input fields) | Neutral gray/white | none |

**Rule of thumb to take away:** green = "this is clickable / this is positive / this is active,"
never a background fill or a border color. If you removed every green pixel from the screenshot,
90% of the UI would look identical.

### 1.2 Background texture ("the dots")

The very faint dot grid you're seeing behind empty canvas space (visible around the promo
carousel / empty dashboard areas) is a **CSS dot-grid pattern**, not an image or AI-generated
texture. It's the classic "graph paper" trick:

```css
background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
background-size: 22px 22px;
```

It sits at very low opacity on top of the near-black page background, only noticeable in open
space, and disappears under cards because cards have their own opaque background. This is cheap
to add and instantly reads as "designed," not "AI slop."

### 1.3 Icons

The icons in the sidebar (Spot, Perps, Predict, Gacha, Lend, etc.) and inline UI (swap arrow,
settings sliders, chevrons) are **thin outline/line icons**, not filled, not an emoji set, not a
downloadable branded pack you can attribute to Jupiter specifically — they look like a custom
icon set drawn in the same style as open-source line-icon libraries (Tabler Icons, Lucide,
Phosphor "regular" weight). Consistent traits:

- ~18–20px box
- 1.5–1.75px stroke weight
- Rounded line caps/joins
- No fill, no drop shadow, no gradient
- Single color (inherits text color — white when active/hovered, gray when idle)

**Good news:** your repo already does this correctly. `Sidebar.tsx` and `Header.tsx` use hand-
rolled inline SVGs at `stroke-width={1.5}`, `h-[18px] w-[18px]`, `strokeLinecap="round"` — same
spec as Jupiter's icons. You don't need to "download" anything; you already have the right
technique. If you want a bigger ready-made set to draw from instead of hand-coding every icon,
**Lucide** (MIT, `npm i lucide-react`) or **Tabler Icons** (`@tabler/icons-react`, matches what
your own `BRAND.md` already specifies) are the right libraries — both ship as React components at
this exact stroke weight.

### 1.4 Typography

- Font family: a clean **grotesque sans-serif** — visually consistent with `Inter` / system-ui
  (`-apple-system, "Segoe UI", Roboto`). You don't need a special/paid font; `Inter` (which you
  already load via `next/font/google` in `layout.tsx`) is a correct match.
- Numbers (price ticker, the big "0.0" swap input) use **tabular/monospaced-feeling number
  rendering** — likely just `font-variant-numeric: tabular-nums` on top of Inter, not a separate
  mono font.
- Weight usage is restrained: body text is regular (400) or medium (500), headings/labels rarely
  go past semibold (600). Nothing is bold (700+) except maybe the giant "0.0" input.

Observed scale (approximate, from the screenshot proportions):

| Element | Size | Weight | Color |
|---|---|---|---|
| Big swap amount input ("0.0") | ~34–40px | 400–500 | white |
| Nav item label (sidebar) | ~14px | 500 | white (active) / gray (idle) |
| Section/card title ("Try Jupiter Gacha") | ~18–20px | 600 | white |
| Body/secondary text | ~13–14px | 400 | gray |
| Ticker symbol + price | ~13px | 500 | white, green/red for % |
| Small caption / pill text ("New", "Beta") | ~11–12px | 600 | contextual |
| Button label | ~14–15px | 600 | black (on green) / white (on dark) |

### 1.5 Spacing, sizing, radius

- **Sidebar**: fairly narrow (~230–250px), generous vertical rhythm between nav items (~10–12px
  padding top/bottom per item), section labels ("Trade", "Earn", "Manage") in small uppercase-ish
  gray caps with extra margin above.
- **Cards**: quite roomy internal padding (~20–24px), and **very rounded corners** — noticeably
  more rounded than a typical SaaS dashboard, around 16–20px radius on big cards, ~12–14px on
  smaller ones.
- **Buttons**: the primary CTA ("Connect") is a **full-width pill-ish button**, tall (~52–56px),
  radius ~16px (not fully circular, but close). Small buttons/badges ("Rewards", ticker chips) are
  fully pill-shaped (`border-radius: 9999px`).
- **Gaps**: consistent ~12–16px gaps between sibling cards/widgets, ~24px between major sections.
- **Borders**: hairline, 1px, low-contrast gray — closer to "barely there" than a visible line.
  Separation between surfaces comes from *background shade difference*, not from borders.

---

## 2. Gap analysis: current Bulldex tokens vs. this target

Looking at your `frontend/src/app/globals.css` and `tailwind.config.ts` today:

| Token | Current Bulldex | Problem | Target (Jupiter-style) |
|---|---|---|---|
| `base.bg` | `#0C0F0C` (green-tinted black) | tints the *entire* page green | neutral near-black `#0A0A0B` |
| `base.card` / `base.elevated` | `#161C16` / `#1D261D` (green-tinted gray) | every card looks olive | neutral charcoal `#17181C` / `#1E1F24` |
| `base.border` | `#243024` (green-tinted) | borders read green even at low opacity | neutral `#26272C` |
| `ink.secondary` | `#8FA88F` (green-gray) | *all* muted text has a green cast | neutral gray `#9A9DA6` |
| Page background image | `radial-gradient(... rgba(74,222,128,0.07) ...)` | green glow wash over whole page | remove, or replace with the neutral dot-grid from §1.2 |
| Primary button | `bg-gradient-brand` (green→green gradient fill) | correct idea, but should be **solid**, not gradient, to match Jupiter's flat CTA | solid `bg-brand` (single lime-green), no gradient |
| `shadow.glow*` | green glow shadows used broadly | overuses the accent as ambient lighting | keep only on the primary CTA hover, not on cards |
| Focus ring | `ring-green/50` everywhere | fine, low-impact | keep |
| Icons | custom inline SVG, 1.5px stroke, 18px | ✅ already correct, no change needed | keep |
| Font | Inter via `next/font/google` | ✅ already correct | keep, add `tabular-nums` for numeric fields |
| Radius | `DEFAULT: 8px`, `lg: 12px` | too tight vs. the roomier Jupiter feel | bump: `DEFAULT: 10px`, `lg: 16px`, `xl: 20px` |

Also flag: `skills/BRAND.md` still documents **purple (#7C3AED) + amber (#F59E0B)** as the brand
colors, but the actual `tailwind.config.ts` has already moved to green. The brand doc is stale —
update it as part of this work so design and docs don't drift again (§5).

---

## 3. New design tokens (concrete values to implement)

### 3.1 Color (replace the `colors` block in `tailwind.config.ts`)

```ts
colors: {
  brand: {
    DEFAULT: '#C6F135',   // primary lime-green accent (CTAs, active states, gains)
    dark:    '#A8D629',   // hover/pressed state of the above
    faint:   'rgba(198,241,53,0.10)',
    border:  'rgba(198,241,53,0.25)',
  },
  base: {
    bg:       '#0A0A0B',  // page background — neutral near-black
    surface:  '#111114',  // sidebar / header background
    card:     '#17181C',  // cards, panels
    elevated: '#1E1F24',  // hover / raised state
    border:   '#26272C',  // hairline borders
    'border-light': '#333339',
  },
  ink: {
    DEFAULT:   '#F2F2F3', // primary text
    secondary: '#9A9DA6', // muted/secondary text — neutral gray, NOT green-gray
    faint:     '#55565D',
  },
  green:  '#4ADE80',      // keep as semantic "positive" (price up), separate from brand accent
  red:    '#F87171',      // semantic "negative"
  yellow: '#FCD34D',
}
```

> Note: `brand` (lime-green CTA accent) and `green` (semantic positive/gain color) are now two
> different tokens. Jupiter does the same — the "Connect" button green and a "+3.2%" green are
> visually similar but conceptually separate, so keep them separable in code even if the hex is
> close.

### 3.2 Background — remove the green wash, add the dot grid

Replace the `body` background in `globals.css`:

```css
body {
  @apply bg-base-bg text-ink font-sans;
  background-image: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 24px 24px;
  background-attachment: fixed;
  min-height: 100vh;
}
```

Drop the `backgroundImage.gradient-page` green radial entirely (or keep it, but reduce to
`rgba(255,255,255,0.02)` neutral — no color).

### 3.3 Radius

```ts
borderRadius: {
  DEFAULT: '10px',
  lg:      '16px',
  xl:      '20px',
  '2xl':   '24px',
  pill:    '9999px',
},
```

### 3.4 Typography additions

```css
/* globals.css, in @layer base */
.tabular-nums, input[type="text"].amount-input {
  font-variant-numeric: tabular-nums;
}
```

Type scale to standardize across components (add as reference, not necessarily new Tailwind
tokens since default `text-*` utilities already cover most of this):

| Use | Class |
|---|---|
| Big swap amount | `text-4xl` (36px) `font-normal` |
| Nav label | `text-sm` (14px) `font-medium` |
| Card title | `text-lg` (18px) `font-semibold` |
| Body/secondary | `text-sm` `text-ink-secondary` |
| Ticker / caption | `text-xs` (12px) `font-medium` |
| Button label | `text-sm` `font-semibold` |

---

## 4. Component-level changes

### 4.1 `components/ui/Button.tsx`
- `primary`: change `bg-gradient-brand` → `bg-brand` (solid fill), `text-base-bg` stays (black
  text on green — matches Jupiter's Connect button). Drop `shadow-glow-sm` default; only apply
  glow on `:hover`.
- Bump default height/radius via the new `sizes` map: `lg` → `h-14 rounded-xl` to get the tall
  pill-ish CTA look for the main "Connect"/"Swap" button.

### 4.2 `components/ui/Card.tsx`
- `default` variant: swap `border-base-border` stays, but with the new neutral `base.card`/
  `base.border` values this stops reading green automatically — no code change needed here beyond
  the token swap in §3.1.
- Bump default radius: `rounded-xl` → `rounded-2xl` for the outer card wrapper to match Jupiter's
  roomier corners.

### 4.3 `components/ui/Badge.tsx`
- No structural change — once `brand`/`green` tokens are neutral-adjacent-with-accent, badges
  (`"New"`, `"Beta"`) will automatically look right.

### 4.4 `components/layout/Sidebar.tsx`
- Active item: currently likely uses a green-tinted highlight (check the `cn(...)` active class).
  Change the **active state background** to a neutral `bg-base-elevated` pill behind the item
  (like Jupiter's "Perps" selected state), and keep icon/text white — **do not** fill the active
  item background with green. Reserve green only for the small "New" badge dot.
- Add section labels ("Trade", "Earn", "Manage") in `text-xs font-medium text-ink-faint uppercase
  tracking-wide` above each nav group, matching Jupiter's grouped sidebar.

### 4.5 `components/layout/Header.tsx`
- Keep as-is structurally; just inherits the new neutral tokens. Optional: add a live-ish price
  ticker strip under the header (SOL/JUP-style) using `green`/`red` semantic tokens only on the
  percentage number, matching §1.1.

### 4.6 Swap page (`app/dashboard/swap/page.tsx`)
- "Sell"/"Buy" panel containers: `bg-base-card rounded-2xl p-5`, label in
  `text-sm text-ink-secondary`.
- Big amount input: `text-4xl font-normal tabular-nums`, placeholder `text-ink-faint`.
- Token selector pill: `rounded-full bg-base-elevated` chip with token icon + symbol + chevron —
  matches the "USDC ▾" / "SOL ▾" pills in the screenshot.
- Swap-direction toggle (the ↑↓ icon between panels): circular button,
  `h-9 w-9 rounded-full bg-base-elevated border border-base-border`, centered on the seam between
  the two panels (use `-mt-4 -mb-4` overlap or `relative` + negative margin, like Jupiter).
- Primary action button: full-width, `size="lg"`, `variant="primary"` (now solid lime-green).

---

## 5. Also fix: `skills/BRAND.md` is out of date

Your brand doc still specifies purple/amber as primary colors, but the codebase has already moved
to a green accent system. Recommend updating `BRAND.md` section 2 ("Color Palette") to match the
tokens in §3.1 of this doc, so future contributors (or future-you) don't reintroduce purple by
following the written brand guide. Icon library note in `BRAND.md` (Tabler Icons) is fine to keep
— it already matches the direction in §1.3.

---

## 6. Phased implementation plan

**Phase 1 — Tokens only (~30–60 min, low risk)**
1. Update `tailwind.config.ts` colors, radius per §3.1/§3.3.
2. Update `globals.css` body background per §3.2, remove green-tinted `gradient-page`.
3. Ship this alone first and just look at the app — most of the "too green" feeling will already
   be gone, since almost every component consumes these tokens rather than hardcoding colors.

**Phase 2 — Core components (~1–2 hrs)**
4. `Button.tsx`: solid primary fill, updated sizes/radius (§4.1).
5. `Card.tsx`: radius bump (§4.2).
6. `Sidebar.tsx`: neutral active-state background + section group labels (§4.4).

**Phase 3 — Page-level polish (~2–4 hrs)**
7. Swap page panel/input/token-selector styling (§4.6).
8. Header price-ticker strip (optional, §4.5).
9. Sweep other dashboard pages (`liquidity`, `staking`, `farming`) for any hardcoded green
   (`text-green`, `border-green`, `bg-green`) that should instead reference the new neutral
   `base.*`/`ink.*` tokens — grep for `green` and `brand` usage outside of CTAs/badges/positive
   numbers.

**Phase 4 — Docs**
10. Update `skills/BRAND.md` color section to match (§5), so brand doc and code stay in sync.

---

## 7. Quick checklist before calling it done

- [ ] Page background is neutral black, not green-tinted
- [ ] Cards are neutral charcoal, not olive/green-gray
- [ ] Green only appears on: primary CTA fill, active tab pill, positive price numbers, "New"
      badges, a couple of small icons — nowhere else
- [ ] Muted/secondary text is neutral gray, not green-gray
- [ ] Dot-grid background visible in empty canvas space, invisible under cards
- [ ] Icons stay thin-outline, 18–20px, 1.5px stroke, single color (no change needed, already correct)
- [ ] Font stays Inter, numeric fields use `tabular-nums`
- [ ] Card/button corners noticeably rounder than before (16–24px on cards, pill-ish on main CTA)
- [ ] `BRAND.md` matches the actual palette in code