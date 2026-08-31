'use client';

import { useMemo } from 'react';

interface MiniAreaChartProps {
  data: number[];
  height?: number;
  color?: 'green' | 'red' | 'blue' | 'purple';
  className?: string;
}

export function MiniAreaChart({ 
  data, 
  height = 80, 
  color = 'green',
  className = '' 
}: MiniAreaChartProps) {
  const { path, max, min } = useMemo(() => {
    if (!data || data.length === 0) return { path: '', max: 0, min: 0 };

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const step = 100 / (data.length - 1 || 1);

    // Create smooth curve path
    const points = data.map((value, i) => ({
      x: i * step,
      y: 100 - ((value - min) / range) * 100,
    }));

    // Build SVG path with curves
    let path = `M ${points[0].x},${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const xMid = (curr.x + next.x) / 2;
      // Smooth cubic bezier curve
      path += ` Q ${curr.x},${curr.y} ${xMid},${(curr.y + next.y) / 2}`;
    }
    
    // End at last point
    const last = points[points.length - 1];
    path += ` T ${last.x},${last.y}`;
    
    // Close path to create filled area
    path += ` L 100,100 L 0,100 Z`;

    return { path, max, min };
  }, [data]);

  const colorMap = {
    green: { fill: '#10b981', stroke: '#10b981' },
    red: { fill: '#ef4444', stroke: '#ef4444' },
    blue: { fill: '#3b82f6', stroke: '#3b82f6' },
    purple: { fill: '#8b5cf6', stroke: '#8b5cf6' },
  };

  const colors = colorMap[color];

  if (!data || data.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center text-xs text-ink-muted ${className}`}
        style={{ height: `${height}px` }}
      >
        No data
      </div>
    );
  }

  return (
    <div className={className} style={{ height: `${height}px` }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.fill} stopOpacity="0.3" />
            <stop offset="100%" stopColor={colors.fill} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Area fill */}
        <path
          d={path}
          fill={`url(#gradient-${color})`}
          className="transition-opacity duration-300"
        />
        
        {/* Stroke line */}
        <path
          d={path.split('L')[0]} // Only the curve part, not the closing
          fill="none"
          stroke={colors.stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />
      </svg>
    </div>
  );
}
