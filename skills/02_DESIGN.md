# Bulldex Design System

Source reference: `jup.ag` (Jupiter) + `app.uniswap.org` (Uniswap). Green theme, dark neutral base.

---

## Core Principles

1. **No decorative noise.** Every element earns its place. No glows on cards, no gradient backgrounds behind text, no animated dots unless they convey status.
2. **Spacing is the design.** Generous padding inside cards (`p-5` to `p-6`). Consistent horizontal margin on page content. Cards breathe.
3. **Green is a signal, not a background.** Green (`#C6F135` brand, `#4ADE80` semantic) appears only on: primary CTA fills, active tab indicators, positive price numbers, status badges. Never as a card background, border color on neutral cards, or text color for non-positive content.
4. **Consistent card alignment.** Labels always left-aligned (`text-left`). Values left- or right-aligned consistently within the same column. Never mix alignment within a table column.
5. **No em-dashes anywhere** (neither `--` nor `--` in copy, UI labels, or comments written for the user). Use a plain dash, colon, or rewrite the sentence.
6. **Real data only.** Never show placeholder numbers or mock values in UI. If data is loading, show a skeleton. If data is unavailable, show a neutral fallback state (`--` or `0`), not a fabricated number.
7. **Type scale is restrained.** Page title: `text-base font-semibold`. Section title: `text-sm font-semibold`. Body: `text-sm text-ink-secondary`. Caption/label: `text-xs text-ink-faint`. No `text-2xl font-bold` for page headers.

---

## Color Tokens

```ts
brand: {
  DEFAULT: '#C6F135',          // lime-green CTA only
  dark:    '#A8D629',          // hover
  faint:   'rgba(198,241,53,0.10)',
  border:  'rgba(198,241,53,0.25)',
}
base: {
  bg:       '#0A0A0B',         // page background
  surface:  '#111114',         // sidebar / header
  card:     '#17181C',         // cards, panels
  elevated: '#1E1F24',         // hover / raised
  border:   '#26272C',         // hairline borders
  'border-light': '#333339',
}
ink: {
  DEFAULT:   '#F2F2F3',        // primary text
  secondary: '#9A9DA6',        // muted text
  faint:     '#55565D',        // dimmed / placeholder
}
green:  '#4ADE80'              // semantic positive only
red:    '#F87171'              // semantic negative
yellow: '#FCD34D'              // warnings
cream:  '#E8DFC0'              // logo accent
```

---

## Spacing and Layout

- Page content max-width: `max-w-6xl` with `px-6`
- Gap between cards in a grid: `gap-3`
- Card internal padding: `p-5` (compact) or `p-6` (roomy)
- Table rows: `px-5 py-4`
- Table header: `px-5 py-3`
- Section spacing: `space-y-6`
- Modal max-width: `max-w-sm` centered via `left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`

---

## Border Radius

| Token | Value | Use |
|---|---|---|
| default | `10px` | small elements |
| `lg` | `16px` | inputs, small cards |
| `xl` | `20px` | buttons |
| `2xl` | `24px` | card containers |
| `pill` | `9999px` | badges, status chips |

---

## Typography

| Element | Class |
|---|---|
| Page title | `text-base font-semibold text-ink` |
| Page subtitle | `text-xs text-ink-secondary` |
| Section label (uppercase) | `text-[11px] font-semibold uppercase tracking-wider text-ink-faint` |
| Card title | `text-sm font-semibold text-ink` |
| Table header | `text-[11px] font-semibold uppercase tracking-wider text-ink-faint` |
| Body | `text-sm text-ink-secondary` |
| Caption | `text-xs text-ink-faint` |
| Number (large) | `text-2xl font-semibold tabular-nums text-ink` |
| Number (small) | `text-sm font-semibold tabular-nums text-ink` |
| Swap input | `text-4xl font-normal tabular-nums text-ink` |

---

## Button Variants

| Variant | Use |
|---|---|
| `primary` | Solid `bg-brand text-base-bg`. Main CTA only. One per page section. |
| `ghost` | `bg-base-card border border-base-border text-ink-secondary`. Secondary actions. |
| `outline` | Brand border, no fill. Tertiary actions. |
| `danger` | Red tint. Destructive only. |

Sizes: `xs` (h-7), `sm` (h-8), `md` (h-10, default), `lg` (h-14, main CTA).

All interactive states use the `<Button>` component. No raw `<button className="...">` for primary/secondary actions.

---

## Card Consistency Rules

- Every card in a grid row shares the same padding (`p-5` or `p-6`, never mixed).
- Stat cards: label top (`text-xs text-ink-secondary mb-1`), value below (`text-xl font-semibold text-ink`), optional sub-label at bottom (`text-xs text-ink-faint mt-0.5`).
- Table cards: outer container `rounded-2xl border border-base-border bg-base-card overflow-hidden`. Header row `bg-base-surface`. Data rows `hover:bg-base-elevated`.
- Modals: `fixed inset-0 z-40 bg-black/60 backdrop-blur-sm` overlay, `fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-4` container.

---

## What Not To Do

- No green card borders on neutral market/table rows
- No `font-bold` (weight 700+) for page titles. Use `font-semibold` (600).
- No `text-2xl font-bold` for stats that are not the primary focus of a page
- No gradient overlays or glows on card hover
- No `text-green` on header nav active items (use `text-ink` on neutral `bg-base-elevated` pill)
- No mock/hardcoded data shown in production UI (`"~5%"` approximations are acceptable only where contract values are not readable on-chain; document the reason inline)
- No em-dashes in any user-facing text or code comments directed at the user

---

## Component Reference

### Shared Modal Pattern

```tsx
{/* Overlay */}
<div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />

{/* Modal card */}
<div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-4">
  <div className="rounded-2xl border border-base-border bg-base-card shadow-elevated overflow-hidden">
    {children}
  </div>
</div>
```

### Stat Card Pattern

```tsx
<Card>
  <p className="text-xs text-ink-secondary mb-1">{label}</p>
  <p className="text-xl font-semibold text-ink tabular-nums">{value}</p>
  <p className="text-xs text-ink-faint mt-0.5">{subLabel}</p>
</Card>
```

### Table Header Row

```tsx
<div className="grid grid-cols-N gap-4 px-5 py-3 border-b border-base-border bg-base-surface text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
  {columns}
</div>
```

---

## Phase Implementation Log

- Phase 1 (tokens): tailwind.config.ts + globals.css updated. Neutral dark base, lime-green accent, dot-grid body background.
- Phase 2 (components): Button.tsx solid primary, Card.tsx rounded-2xl, Sidebar.tsx neutral active state.
- Phase 3 (pages): Swap, Liquidity, Lending, Overview, Landing styled consistently.
- Phase 4 (polish): No em-dashes. Consistent card padding. No decorative noise. Real data only. Consistent table alignment.
