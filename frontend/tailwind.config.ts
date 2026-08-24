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
        // ── Bulldex Brand — from logo ──────────────────────────────────────
        // Logo colors: dark forest green #2D4A2D, sage #4A6741, cream #E8DFC0
        brand: {
          // Primary greens — from logo body
          DEFAULT:    '#4ADE80',   // bright accent green (Jupiter-style)
          dark:       '#22C55E',
          forest:     '#2D4A2D',   // logo dark body
          sage:       '#4A6741',   // logo mid green
          // Muted sage for surfaces
          surface:    '#1A2E1A',   // very dark green-tinted surface
          // Cream from horns
          cream:      '#E8DFC0',
          // Glow
          faint:      'rgba(74,222,128,0.10)',
          border:     'rgba(74,222,128,0.20)',
          'border-lg':'rgba(74,222,128,0.35)',
        },

        // ── Jupiter-style dark surfaces (green-tinted) ────────────────────
        base: {
          bg:       '#0C0F0C',   // near-black with slight green tint
          surface:  '#111411',   // slightly lighter
          card:     '#161C16',   // card bg — dark green tint
          elevated: '#1D261D',   // hover state
          border:   '#243024',   // border — green-tinted dark
          'border-light': '#2E3E2E',
        },

        // ── Text ──────────────────────────────────────────────────────────
        ink: {
          DEFAULT:   '#E8F0E8',   // primary — slightly green-white
          secondary: '#8FA88F',   // muted green-gray
          faint:     '#4A5E4A',   // very muted
        },

        // ── Semantic ──────────────────────────────────────────────────────
        green:  '#4ADE80',   // bright green — primary accent like Jupiter
        red:    '#F87171',
        yellow: '#FCD34D',
        cream:  '#E8DFC0',   // from logo horns
      },

      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },

      borderRadius: {
        DEFAULT: '8px',
        lg:      '12px',
        xl:      '16px',
        '2xl':   '20px',
        pill:    '9999px',
      },

      boxShadow: {
        card:       '0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)',
        elevated:   '0 4px 20px rgba(0,0,0,0.6)',
        glow:       '0 0 28px rgba(74,222,128,0.18)',
        'glow-sm':  '0 0 14px rgba(74,222,128,0.12)',
        'glow-lg':  '0 0 48px rgba(74,222,128,0.25)',
        inner:      'inset 0 1px 0 rgba(255,255,255,0.03)',
      },

      backgroundImage: {
        // Page bg — subtle green radial glow like Jupiter
        'gradient-page':   'radial-gradient(ellipse 70% 40% at 50% -10%, rgba(74,222,128,0.07) 0%, transparent 60%)',
        'gradient-card':   'linear-gradient(135deg, #161C16 0%, #131813 100%)',
        'gradient-brand':  'linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)',
        'gradient-forest': 'linear-gradient(135deg, #2D4A2D 0%, #4A6741 100%)',
        'glass':           'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        'shimmer':         'linear-gradient(90deg, #161C16 0%, #1D261D 40%, #161C16 80%)',
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
