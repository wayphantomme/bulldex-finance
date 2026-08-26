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
        // ── Brand accent — lime-green CTA (Jupiter "Connect" button style) ──
        brand: {
          DEFAULT: '#C6F135',   // primary lime-green accent
          dark:    '#A8D629',   // hover/pressed
          faint:   'rgba(198,241,53,0.10)',
          border:  'rgba(198,241,53,0.25)',
        },

        // ── Neutral dark surfaces — NO green tint ──────────────────────────
        base: {
          bg:       '#0A0A0B',  // page background — neutral near-black
          surface:  '#111114',  // sidebar / header background
          card:     '#17181C',  // cards, panels
          elevated: '#1E1F24',  // hover / raised state
          border:   '#26272C',  // hairline borders
          'border-light': '#333339',
        },

        // ── Text — neutral gray, NOT green-gray ───────────────────────────
        ink: {
          DEFAULT:   '#F2F2F3', // primary text
          secondary: '#9A9DA6', // muted/secondary — neutral gray
          faint:     '#55565D',
        },

        // ── Semantic colors ───────────────────────────────────────────────
        green:  '#4ADE80',   // semantic "positive" (price up, gains)
        red:    '#F87171',   // semantic "negative"
        yellow: '#FCD34D',
        cream:  '#E8DFC0',   // from logo horns
      },

      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },

      borderRadius: {
        DEFAULT: '10px',
        lg:      '16px',
        xl:      '20px',
        '2xl':   '24px',
        pill:    '9999px',
      },

      boxShadow: {
        card:       '0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)',
        elevated:   '0 4px 20px rgba(0,0,0,0.6)',
        glow:       '0 0 28px rgba(198,241,53,0.20)',
        'glow-sm':  '0 0 14px rgba(198,241,53,0.14)',
        'glow-lg':  '0 0 48px rgba(198,241,53,0.28)',
        inner:      'inset 0 1px 0 rgba(255,255,255,0.03)',
      },

      backgroundImage: {
        // Neutral dot-grid — used in globals.css body, replaces green radial
        'gradient-page':   'none',
        'gradient-card':   'linear-gradient(135deg, #17181C 0%, #141517 100%)',
        'gradient-brand':  'linear-gradient(135deg, #A8D629 0%, #C6F135 100%)',
        'gradient-forest': 'linear-gradient(135deg, #2D4A2D 0%, #4A6741 100%)',
        'glass':           'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        'shimmer':         'linear-gradient(90deg, #17181C 0%, #1E1F24 40%, #17181C 80%)',
      },

      backdropBlur: {
        xs: '4px',
        sm: '8px',
        md: '12px',
      },

      animation: {
        'fade-in':    'fadeIn 0.2s ease',
        'slide-up':   'slideUp 0.25s ease',
        'shimmer':    'shimmer 1.6s infinite linear',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float':      'float 4s ease-in-out infinite',
      },

      keyframes: {
        fadeIn:  { from: { opacity: '0' },                                   to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(10px)' },    to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' },                  '100%': { backgroundPosition: '200% 0' } },
        float:   { '0%,100%': { transform: 'translateY(0)' },                '50%': { transform: 'translateY(-8px)' } },
      },

      maxWidth: { layout: '1440px' },
    },
  },
  plugins: [],
};

export default config;
