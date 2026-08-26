'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';

interface NavItem {
  href:  string;
  label: string;
  icon:  React.ReactNode;
  soon?: boolean;
}

const NAV: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: '/dashboard/swap',
    label: 'Swap',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
        <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    ),
  },
  {
    href: '/dashboard/liquidity',
    label: 'Liquidity',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
        <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" />
        <path d="M8 12h8M12 8v8" />
      </svg>
    ),
  },
  {
    href: '/dashboard/lending',
    label: 'Lending',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 9v1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    soon: true,
  },
  {
    href: '/dashboard/staking',
    label: 'Staking',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    soon: true,
  },
  {
    href: '/dashboard/farming',
    label: 'Farm',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
        <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    soon: true,
  },
  {
    href: '/dashboard/governance',
    label: 'Governance',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
      </svg>
    ),
    soon: true,
  },
  {
    href: '/dashboard/faucet',
    label: 'Faucet',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
        <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
      </svg>
    ),
  },
  {
    href: '/docs',
    label: 'Docs',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
        <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-14 bottom-0 z-40 flex w-16 flex-col items-center border-r border-base-border bg-base-bg pt-3 pb-4 gap-0.5">
      {NAV.map((item) => {
        const isActive =
          item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href);

        return (
          <div key={item.href} className="tooltip-trigger relative flex w-full justify-center">
            <Link
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150',
                isActive
                  ? 'bg-brand-faint text-green shadow-glow-sm'
                  : 'text-ink-faint hover:bg-base-card hover:text-ink-secondary',
              )}
            >
              {item.icon}

              {/* Active dot */}
              {isActive && (
                <span className="absolute -right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-green shadow-glow-sm" />
              )}

              {/* Soon dot */}
              {item.soon && !isActive && (
                <span className="absolute -right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-yellow/70" />
              )}
            </Link>

            {/* Tooltip */}
            <span className="tooltip">
              {item.label}
              {item.soon && (
                <span className="ml-1.5 rounded-full bg-yellow/15 px-1.5 py-0.5 text-[10px] font-medium text-yellow">
                  soon
                </span>
              )}
            </span>
          </div>
        );
      })}

      {/* Bottom spacer + version */}
      <div className="mt-auto flex flex-col items-center gap-1">
        <div className="h-px w-8 bg-base-border" />
        <span className="text-[9px] text-ink-faint">v0.1</span>
      </div>
    </aside>
  );
}
