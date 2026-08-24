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
        // ── Bulldex Brand Colors ──────────────────────────────────────────────
        brand: {
          purple: '#7C3AED',
          'purple-dark': '#6D28D9',
          'purple-light': '#A855F7',
          amber: '#F59E0B',
          'amber-dark': '#D97706',
          'amber-light': '#FBBF24',
        },
        // ── Dark Mode Surfaces ────────────────────────────────────────────────
        bg: {
          page: '#0F172A',
          card: '#1E293B',
          elevated: '#253347',
          input: '#0F172A',
        },
        // ── Border ────────────────────────────────────────────────────────────
        border: {
          DEFAULT: '#334155',
          focus: '#7C3AED',
          error: '#EF4444',
        },
        // ── Text ──────────────────────────────────────────────────────────────
        text: {
          primary: '#FFFFFF',
          secondary: '#CBD5E1',
          muted: '#64748B',
          placeholder: '#475569',
        },
        // ── Semantic ──────────────────────────────────────────────────────────
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'sans-serif',
        ],
        mono: ['"Courier New"', 'monospace'],
      },
      fontSize: {
        hero: ['48px', { lineHeight: '1.2', fontWeight: '700' }],
        h1: ['36px', { lineHeight: '1.2', fontWeight: '700' }],
        h2: ['28px', { lineHeight: '1.3', fontWeight: '600' }],
        h3: ['22px', { lineHeight: '1.4', fontWeight: '600' }],
        h4: ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['15px', { lineHeight: '1.6', fontWeight: '400' }],
        sm: ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        xs: ['12px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      borderRadius: {
        DEFAULT: '8px',
        card: '12px',
        pill: '9999px',
      },
      boxShadow: {
        card: '0 4px 6px rgba(0,0,0,0.1)',
        'card-hover': '0 8px 16px rgba(0,0,0,0.2)',
        elevated: '0 4px 12px rgba(0,0,0,0.15)',
        glow: '0 0 20px rgba(124, 58, 237, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'page-gradient': 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        'card-gradient': 'linear-gradient(135deg, #1E293B 0%, #253347 100%)',
        'purple-gradient': 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
        'amber-gradient': 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
      },
      maxWidth: {
        layout: '1280px',
      },
    },
  },
  plugins: [],
};

export default config;
