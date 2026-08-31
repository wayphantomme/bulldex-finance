import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Background layers — Token Terminal dark hierarchy ──────────────
        'bg-base':     '#0d0d0d',   // body / page background
        'bg-surface':  '#111111',   // card, panel, sidebar
        'bg-elevated': '#161616',   // hover state, dropdown
        'bg-overlay':  '#1a1a1a',   // modal, popover, tooltip
        'bg-subtle':   '#1e1e1e',   // input, table row hover

        // ── Borders ────────────────────────────────────────────────────────
        'border-base':  '#262626',  // default border
        'border-light': '#2e2e2e',  // hover border
        'border-focus': '#404040',  // focus ring

        // ── Text / Ink ────────────────────────────────────────────────────
        ink: {
          DEFAULT:   '#f5f5f5',  // primary text, headings
          secondary: '#a3a3a3',  // label, nav item, subtitle
          muted:     '#525252',  // placeholder, disabled, timestamp
          inverted:  '#0d0d0d',  // text on top of brand accent
        },

        // ── Brand / Accent — Token Terminal emerald ───────────────────────
        brand: {
          DEFAULT: '#10b981',   // primary CTA, active states (emerald-500)
          dark:    '#059669',   // hover/pressed (emerald-600)
          subtle:  '#064e3b',   // badge bg, subtle highlight (emerald-950)
          dim:     'rgba(16,185,129,0.12)',  // glow ring, faint bg
        },

        // ── Semantic — price/data colors ──────────────────────────────────
        positive: '#22c55e',   // profit, gain, price up
        negative: '#ef4444',   // loss, price down
        warning:  '#f59e0b',   // caution, pending
        info:     '#3b82f6',   // informational

        // ── Legacy aliases — keep for backward compat during migration ─────
        // Components still using old tokens will still compile.
        // Gradually remove these as components are migrated.
        'base-bg':           '#0d0d0d',
        'base-surface':      '#111111',
        'base-card':         '#111111',
        'base-elevated':     '#161616',
        'base-border':       '#262626',
        'base-border-light': '#2e2e2e',
        green:               '#22c55e',
        red:                 '#ef4444',
        yellow:              '#f59e0b',
        cream:               '#e8dfc0',  // keep for now, remove after migration
      },

      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', '"Roboto Mono"', 'monospace'],
      },

      fontSize: {
        // Token Terminal scale — larger, more readable
        '2xs': ['10px', { lineHeight: '1.4', letterSpacing: '0.01em' }],
        'xs':  ['11px', { lineHeight: '1.45', letterSpacing: '0.005em' }],
        'sm':  ['13px', { lineHeight: '1.5' }],   // table cells, labels
        'base':['14px', { lineHeight: '1.55' }],  // ← TT default body (was 13px)
        'md':  ['15px', { lineHeight: '1.6' }],
        'lg':  ['17px', { lineHeight: '1.6' }],
        'xl':  ['20px', { lineHeight: '1.5' }],
        '2xl': ['24px', { lineHeight: '1.3' }],
        '3xl': ['32px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        '4xl': ['40px', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        '5xl': ['56px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        '6xl': ['72px', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        'display': ['96px', { lineHeight: '1.02', letterSpacing: '-0.03em', fontWeight: '800' }],
        // Mono scales for values (tabular numbers via global CSS)
        'mono-sm': ['13px', { lineHeight: '1.4' }],
        'mono-md': ['16px', { lineHeight: '1.4' }],
        'mono-lg': ['22px', { lineHeight: '1.2' }],
        'mono-xl': ['32px', { lineHeight: '1.1' }],
      },

      borderRadius: {
        DEFAULT: '6px',   // button, input — Token Terminal default
        sm:      '4px',   // badge, tag, chip
        md:      '6px',   // button, input
        lg:      '8px',   // card, dropdown  ← TT card radius
        xl:      '12px',  // modal, large panel
        '2xl':   '16px',  // hero cards only
        full:    '9999px', // pill, avatar
        pill:    '9999px',
      },

      boxShadow: {
        // Token Terminal has minimal/no shadows — dark surfaces only
        sm:        '0 1px 2px rgba(0,0,0,0.4)',
        DEFAULT:   '0 2px 8px rgba(0,0,0,0.5)',
        lg:        '0 8px 24px rgba(0,0,0,0.6)',
        xl:        '0 16px 40px rgba(0,0,0,0.7)',
        // Keep glow-sm for wallet connect button only
        'glow-sm': '0 0 12px rgba(16,185,129,0.20)',
        'glow':    '0 0 24px rgba(16,185,129,0.18)',
        inner:     'inset 0 1px 0 rgba(255,255,255,0.03)',
        // Legacy — will be removed after migration
        card:      '0 1px 3px rgba(0,0,0,0.5)',
        elevated:  '0 4px 20px rgba(0,0,0,0.6)',
      },

      keyframes: {
        fadeIn:      { from: { opacity: '0' },                                to: { opacity: '1' } },
        slideUp:     { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown:   { from: { opacity: '0', transform: 'translateY(-4px)' },to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer:     { '0%': { backgroundPosition: '-200% 0' },              '100%': { backgroundPosition: '200% 0' } },
        // Cursor blink — for logo "bulldex_" terminal aesthetic
        cursorBlink: { '0%,100%': { opacity: '1' },                          '50%': { opacity: '0' } },
        // Live dot pulse — for navbar badges
        livePulse:   { '0%,100%': { opacity: '1', transform: 'scale(1)' },   '50%': { opacity: '0.5', transform: 'scale(0.85)' } },
      },

      animation: {
        'fade-in':      'fadeIn 0.15s ease',
        'slide-up':     'slideUp 0.2s ease',
        'slide-down':   'slideDown 0.2s ease',
        'shimmer':      'shimmer 1.6s infinite linear',
        'cursor-blink': 'cursorBlink 1s step-end infinite',
        'live-pulse':   'livePulse 2s ease-in-out infinite',
        'pulse-slow':   'pulse 3s ease-in-out infinite',
        'spin':         'spin 0.8s linear infinite',
      },

      maxWidth: {
        layout: '1440px',
        content: '1200px',
      },

      spacing: {
        // Named sidebar/navbar dimensions for layout
        sidebar: '220px',
        'sidebar-collapsed': '0px',
        navbar: '48px',
      },
    },
  },
  plugins: [],
};

export default config;
