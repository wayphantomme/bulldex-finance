'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';

interface ChartCardProps {
  title: string;
  value?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  href?: string;
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  watermark?: boolean;
}

export function ChartCard({
  title,
  value,
  change,
  changeType = 'neutral',
  subtitle,
  href,
  children,
  className = '',
  interactive = true,
  watermark = true,
}: ChartCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const content = (
    <div
      className={`
        group relative rounded-lg bg-bg-surface border border-[#1e1e1e] 
        transition-all duration-150
        ${interactive ? 'hover:border-[#2e2e2e] hover:shadow-sm cursor-pointer' : ''}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#1a1a1a] px-5 py-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-medium text-ink">{title}</h3>
            {change && (
              <span
                className={`
                  text-xs font-mono font-medium px-1.5 py-0.5 rounded
                  ${changeType === 'positive' ? 'text-positive bg-positive/8' : ''}
                  ${changeType === 'negative' ? 'text-negative bg-negative/8' : ''}
                  ${changeType === 'neutral' ? 'text-ink-secondary bg-bg-subtle' : ''}
                `}
              >
                {change}
              </span>
            )}
          </div>
          {value && (
            <p className="text-mono-lg font-semibold text-ink tabular-nums">{value}</p>
          )}
          {subtitle && (
            <p className="text-xs text-ink-muted mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Expand icon on hover */}
        {interactive && href && (
          <button
            className={`
              shrink-0 h-7 w-7 rounded-md border border-border-base 
              flex items-center justify-center text-ink-secondary
              transition-all duration-150
              ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}
              hover:bg-bg-elevated hover:text-ink
            `}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        )}
      </div>

      {/* Chart area */}
      <div className="relative p-5">
        {watermark && (
          <div className="chart-watermark">
            bulldex_
          </div>
        )}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
