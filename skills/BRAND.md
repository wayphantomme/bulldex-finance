# Bulldex Finance - Brand Guidelines

**"Trade Like a Bull. Earn Like a Beast."**

---

## 1. Brand Overview

**Bulldex Finance** is a decentralized trading protocol for bullish traders and yield farmers. The brand represents strength, reliability, and aggressive growth in the DeFi space.

### Brand Pillars
1. **Powerful** - Advanced DeFi features
2. **Reliable** - Security and transparency first
3. **Bullish** - Optimistic market sentiment
4. **Accessible** - Simple, intuitive UI for all

---

## 2. Color Palette

> This section reflects the actual `tailwind.config.ts` as of Aug 2026.
> Source of truth: `frontend/tailwind.config.ts` — not this file. Keep in sync.

### Brand Accent (CTA color)

| Token | Hex | Usage |
|-------|-----|-------|
| `brand` | `#C6F135` | Primary CTA fill (buttons, active tab pill, "New" badge) |
| `brand-dark` | `#A8D629` | Hover/pressed state of brand CTA |
| `brand-faint` | `rgba(198,241,53,0.10)` | Subtle brand tint on surfaces |
| `brand-border` | `rgba(198,241,53,0.25)` | Brand-tinted border |

**Rule:** `brand` (lime-green) is for *clickable / active / CTA* only — never a background fill on non-interactive surfaces, never a border color on static elements.

### Base Surfaces (neutral — no green tint)

| Token | Hex | Usage |
|-------|-----|-------|
| `base-bg` | `#0A0A0B` | Page background — neutral near-black |
| `base-surface` | `#111114` | Sidebar, header background |
| `base-card` | `#17181C` | Cards, panels |
| `base-elevated` | `#1E1F24` | Hover state, raised surface |
| `base-border` | `#26272C` | Hairline borders |
| `base-border-light` | `#333339` | Slightly more visible border (hover, active) |

### Text (neutral gray — no green cast)

| Token | Hex | Usage |
|-------|-----|-------|
| `ink` | `#F2F2F3` | Primary text |
| `ink-secondary` | `#9A9DA6` | Muted/secondary labels |
| `ink-faint` | `#55565D` | Placeholder, disabled, captions |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `green` | `#4ADE80` | Positive price, gains, success state — NOT used for CTAs |
| `red` | `#F87171` | Negative price, losses, errors |
| `yellow` | `#FCD34D` | Warnings, "soon" badges |
| `cream` | `#E8DFC0` | From logo horns — secondary accent |

### `brand` vs `green` — two distinct tokens

| | `brand` (#C6F135 lime) | `green` (#4ADE80 emerald) |
|--|--|--|
| **Use for** | CTA buttons, active state, "New" badge | +3.2% price display, success checkmark, Live dot |
| **Text on top** | `text-base-bg` (dark) | `text-base-bg` (dark) |
| **Background** | Yes — CTA fills | No — text/icon only |
| **Tailwind class** | `bg-brand`, `text-brand` | `text-green`, `bg-green/5` (semantic tint only) |

### Background Texture

The page body has a subtle dot-grid pattern:
```css
background-image: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px);
background-size: 24px 24px;
```
Visible in empty canvas space. Disappears under cards (cards have opaque background). No color — purely neutral.

---

## 3. UI Components

### Buttons

**Primary Button** (Main CTA — "Connect Wallet", "Swap", "Add Liquidity")
```
Background:    #C6F135 (brand)
Text:          #0A0A0B (base-bg — dark text on lime)
Height:        h-10 (md) / h-14 (lg — full-width CTA)
Radius:        rounded-xl (20px)
Hover:         bg-brand-dark (#A8D629) + shadow-glow-sm
Active:        opacity-90
Disabled:      opacity-40, no shadow
Shadow:        none by default — glow only on hover
```

**Ghost Button** (Secondary actions)
```
Background:    base-card
Text:          ink-secondary
Border:        1px base-border
Hover:         bg-base-elevated, text-ink, border-base-border-light
```

**Outline Button** (Tertiary)
```
Background:    transparent
Text:          brand
Border:        brand-border
Hover:         bg-brand-faint, border-brand
```

**Danger Button**
```
Background:    red/10
Text:          red
Border:        red/20
Hover:         bg-red/20
```

### Cards

```
Background:    base-card (#17181C)
Border:        1px base-border (#26272C)
Radius:        rounded-2xl (24px) — noticeably roomy
Padding:       p-5 (20px)
Shadow:        none by default (separation by shade, not shadow)
Hover:         bg-base-elevated (shade shift, no border color change to green)
```

### Input Fields

```
Background:    base-surface
Border:        1px base-border
Radius:        rounded-xl
Padding:       px-4 py-3
Font-size:     text-sm (labels) / text-4xl (swap amount)
Number fields: font-variant-numeric: tabular-nums (.tabular-nums class)
Focus:         border-base-border-light, no glow (glow reserved for CTAs)
```

### Token Selector Pill

```
Background:    base-elevated
Border:        1px base-border
Radius:        rounded-xl
Contents:      token icon (24px circle) + symbol text
Hover:         border-base-border-light
```

### Badge / Pill

| Variant | Bg | Text |
|---------|-----|------|
| `brand` / "New" | `bg-brand` | `text-base-bg` |
| `green` / positive | `bg-green/10` | `text-green` |
| `yellow` / soon | `bg-yellow/15` | `text-yellow` |
| `ghost` | `bg-base-elevated` | `text-ink-secondary` |

---

## 4. Layout & Spacing

### Sidebar
- Width: `w-16` (icon-only) — 64px
- Background: `base-surface`
- No visible border separation from page (same shade)
- Nav grouped by section: **Trade**, **Earn**, **Manage**
- Section labels: `text-[9px] font-semibold uppercase tracking-widest text-ink-faint`
- Active item: `bg-base-elevated text-ink` (neutral highlight — NOT brand fill)
- Active indicator: small `bg-brand` dot at top-right of active icon
- "Soon" items: small `bg-yellow` dot

### Spacing Scale
```
xs: 4px   | sm: 8px   | md: 16px
lg: 24px  | xl: 32px  | 2xl: 48px
```

### Border Radius
```
DEFAULT: 10px  | lg: 16px  | xl: 20px  | 2xl: 24px  | pill: 9999px
```

Cards use `rounded-2xl` (24px). Buttons use `rounded-xl` (20px). Chips/badges use `rounded-pill`.

### Gaps
- Between cards: `gap-3` (12px) or `gap-4` (16px)
- Inside cards: `p-5` (20px)
- Between major sections: `space-y-6` (24px)

---

## 5. Dark Mode Only

Bulldex Finance is **dark mode only**.

```
Page BG:       #0A0A0B  (neutral near-black, NOT green-tinted)
Card:          #17181C  (neutral charcoal)
Text primary:  #F2F2F3  (near-white, NOT green-white)
Text muted:    #9A9DA6  (neutral gray, NOT green-gray)
Border:        #26272C  (hairline, barely visible)
```

**Why dark mode only?**
- Bullish, modern aesthetic aligned with Jupiter/Uniswap
- Better for crypto/trading interfaces
- Neutral base makes accent colors pop more

---

## 6. Icons

**Icon Library:** Inline SVG (hand-coded) — same spec as Tabler Icons "Regular"

**Spec:**
```
Size:          18-20px viewBox
Stroke-width:  1.5px
Line caps:     round (strokeLinecap="round")
Joins:         round (strokeLinejoin="round")
Fill:          none (outline only)
Color:         inherits currentColor
Active:        text-ink (white)
Idle:          text-ink-faint (gray)
```

**No download needed** — inline SVGs already match this spec. If adding new icons, source from Lucide or Tabler Icons "regular" weight.

---

## 7. Typography

**Font:** Inter (loaded via `next/font/google`) — system-ui fallback

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Swap input amount | `text-4xl` (36px) | 400 normal | `text-ink` |
| Page title / Card title | `text-base` / `text-lg` | 600 semibold | `text-ink` |
| Nav item | `text-sm` (14px) | 500 medium | `text-ink` / `text-ink-faint` |
| Body copy | `text-sm` (14px) | 400 | `text-ink-secondary` |
| Captions / labels | `text-xs` (12px) | 500 medium | `text-ink-faint` |
| Button label | `text-sm` (14px) | 600 semibold | `text-base-bg` (on primary) |
| Price / numbers | any | any | + `.tabular-nums` class |

---

## 8. Writing Style (Tone of Voice)

**Bullish** — "Trade Like a Bull. Earn Like a Beast."
**Accessible** — explain concepts simply, guide step-by-step
**Direct** — no marketing fluff, active voice, short sentences

| Component | Copy | Tone |
|-----------|------|------|
| Hero | "Trade Like a Bull. Earn Like a Beast." | Bullish |
| CTA | "Start Trading" / "Add Liquidity" | Action |
| Error | "Insufficient balance." | Clear |
| Success | "Swap complete! View on Etherscan →" | Positive |
| Empty | "No position yet. Add liquidity to start earning." | Encouraging |

---

## 9. What Green Means at a Glance

> Green is a **signal color**, not a background fill. It occupies ~5% of surface area.

**`brand` (#C6F135 lime)** — use on:
- Primary CTA button fill
- Active tab/nav indicator dot
- "New" / live badge

**`green` (#4ADE80 emerald)** — use on:
- Positive price numbers (+3.2%)
- Success checkmark icon
- "Live" pulse dot
- "Done" roadmap indicators

**Everything else** — use neutral `base-*` and `ink-*` tokens.

---

## 10. Checklist for New Designs

Before shipping any UI:

- [ ] Page background is neutral black (`base-bg #0A0A0B`), not green-tinted
- [ ] Cards are neutral charcoal (`base-card #17181C`), not olive
- [ ] Green only on: CTA fill (`brand`), active indicator, price positive (`green`), success state — nowhere else
- [ ] Muted text is neutral gray (`ink-secondary #9A9DA6`), not green-gray
- [ ] Dot-grid background visible in empty space, invisible under cards
- [ ] Icons: thin outline, 18-20px, 1.5px stroke, single color (no fill, no glow)
- [ ] Font: Inter, numeric fields use `.tabular-nums`
- [ ] Card corners: `rounded-2xl` (24px) — noticeably roomy
- [ ] Main CTA: `bg-brand` solid, `text-base-bg`, `hover:bg-brand-dark`
- [ ] No green shadows (`shadow-glow`) on static cards — glow on hover only
- [ ] Responsive layout tested on mobile

---

## 11. Resources

- **App:** https://bulldex-finance.vercel.app
- **Docs:** https://bulldex-finance.vercel.app/docs
- **GitHub:** https://github.com/wayphantomme/bulldex-finance
- **Config:** `frontend/tailwind.config.ts` — canonical color/radius tokens
- **Globals:** `frontend/src/app/globals.css` — body bg, shimmer, RainbowKit overrides
- **Icon source:** Lucide / Tabler Icons (regular weight)
- **Design reference:** `skills/DESIGN.md` — Jupiter-style analysis + implementation plan

---

**Last Updated:** 2026-08-26 (Phase 1-4 Jupiter-style upgrade)
**Maintained by:** Phantom (@wayphantomme)

---

**Trade Like a Bull. Earn Like a Beast.**
