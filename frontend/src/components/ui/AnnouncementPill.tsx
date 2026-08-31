import Link from 'next/link';
import { cn } from '@/utils/cn';
import { ArrowRight } from 'lucide-react';

// ─── Token Terminal announcement pill spec:
// bg-[#111111] border border-[#262626] rounded-full px-4 py-2
// inline-flex items-center gap-2
// Icon + label badge + text + arrow →
// Used in hero/landing as centered top announcement

export interface AnnouncementPillProps {
  badge?:     string;     // e.g. "Announcement", "New"
  text:       string;     // e.g. "Token Terminal MCP is here"
  href?:      string;     // link destination
  onClick?:   () => void;
  icon?:      React.ReactNode;
  className?: string;
}

export function AnnouncementPill({
  badge,
  text,
  href,
  onClick,
  icon,
  className,
}: AnnouncementPillProps) {
  const content = (
    <>
      {/* Icon */}
      {icon && (
        <span className="text-[#a3a3a3] shrink-0">{icon}</span>
      )}

      {/* Badge label */}
      {badge && (
        <span className="text-[11px] font-semibold text-[#a3a3a3]">
          {badge}
        </span>
      )}

      {/* Separator */}
      {badge && <span className="text-[#262626] select-none">·</span>}

      {/* Main text */}
      <span className="text-[12px] text-[#f5f5f5]">{text}</span>

      {/* Arrow */}
      <ArrowRight className="h-3.5 w-3.5 text-[#525252] shrink-0 transition-transform group-hover:translate-x-0.5" />
    </>
  );

  const baseClass = cn(
    'group inline-flex items-center gap-2',
    'rounded-full border border-[#262626] bg-[#111111]',
    'px-4 py-2 transition-colors',
    'hover:border-[#2e2e2e] hover:bg-[#161616]',
    className,
  );

  if (href) {
    return (
      <Link href={href} className={baseClass}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={baseClass}>
        {content}
      </button>
    );
  }

  return (
    <div className={baseClass}>
      {content}
    </div>
  );
}

// ─── Banner strip — full-width top-of-page notice ────────────────────────────

export interface BannerStripProps {
  text:       string;
  href?:      string;
  onDismiss?: () => void;
  variant?:   'brand' | 'warning' | 'info';
  className?: string;
}

export function BannerStrip({
  text,
  href,
  onDismiss,
  variant = 'brand',
  className,
}: BannerStripProps) {
  const colors = {
    brand:   'bg-[#064e3b] border-[#10b981]/30 text-[#10b981]',
    warning: 'bg-[#78350f] border-[#f59e0b]/30 text-[#f59e0b]',
    info:    'bg-[#1e3a5f] border-[#3b82f6]/30 text-[#3b82f6]',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-3 border-b px-4 py-2 text-[12px]',
        colors[variant],
        className,
      )}
      role="banner"
    >
      <span className="flex-1 text-center">{text}</span>
      {href && (
        <Link href={href} className="font-semibold underline underline-offset-2 hover:no-underline shrink-0">
          Learn more →
        </Link>
      )}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss banner"
        >
          ×
        </button>
      )}
    </div>
  );
}
