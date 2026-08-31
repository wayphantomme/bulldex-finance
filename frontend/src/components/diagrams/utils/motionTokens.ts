// Shared animation timing constants for SVG diagrams
export const MOTION = {
  dash:   '1.8s linear infinite',
  pulse:  '2s ease-in-out infinite',
  grow:   '0.8s ease-out forwards',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  float:  '3s ease-in-out infinite alternate',
  fadeIn: '0.4s ease-out forwards',
  stagger: (n: number) => `${n * 0.15}s`,
} as const;

// Chart palette (Token Terminal series colors)
export const CHART_COLORS = {
  emerald:  '#10b981',
  blue:     '#3b82f6',
  violet:   '#8b5cf6',
  amber:    '#f59e0b',
  pink:     '#ec4899',
  cyan:     '#06b6d4',
  red:      '#ef4444',
  positive: '#22c55e',
} as const;

// Stroke palette
export const STROKES = {
  ambient:  '#262626',
  elevated: '#404040',
  accent:   '#10b981',
  muted:    '#525252',
  ink:      '#f5f5f5',
  surface:  '#111111',
  base:     '#0d0d0d',
} as const;
