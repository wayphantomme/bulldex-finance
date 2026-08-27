'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Droplets,
  Landmark,
  ShieldCheck,
  Sprout,
  Vote,
  Droplet,
  BookOpen,
  BarChart2,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface NavItem {
  href:  string;
  label: string;
  icon:  React.ReactNode;
  soon?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const ICON = 'h-[18px] w-[18px]';

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Trade',
    items: [
      { href: '/dashboard',           label: 'Overview',    icon: <LayoutDashboard className={ICON} strokeWidth={1.5} /> },
      { href: '/dashboard/swap',      label: 'Swap',        icon: <ArrowLeftRight  className={ICON} strokeWidth={1.5} /> },
      { href: '/dashboard/liquidity', label: 'Liquidity',   icon: <Droplets        className={ICON} strokeWidth={1.5} /> },
    ],
  },
  {
    label: 'Earn',
    items: [
      { href: '/dashboard/lending',  label: 'Lend',  icon: <Landmark    className={ICON} strokeWidth={1.5} /> },
      { href: '/dashboard/staking',  label: 'Stake', icon: <ShieldCheck className={ICON} strokeWidth={1.5} />, soon: true },
      { href: '/dashboard/farming',  label: 'Farm',  icon: <Sprout      className={ICON} strokeWidth={1.5} />, soon: true },
    ],
  },
  {
    label: 'Manage',
    items: [
      { href: '/dashboard/governance', label: 'Governance', icon: <Vote      className={ICON} strokeWidth={1.5} />, soon: true },
      { href: '/dashboard/analytics',  label: 'Analytics',  icon: <BarChart2 className={ICON} strokeWidth={1.5} /> },
      { href: '/dashboard/faucet',     label: 'Faucet',     icon: <Droplet   className={ICON} strokeWidth={1.5} /> },
    ],
  },
];

// Docs pinned standalone at bottom — like Jupiter's "Get Help"
const DOCS_ITEM: NavItem = {
  href: '/docs',
  label: 'Docs',
  icon: <BookOpen className={ICON} strokeWidth={1.5} />,
};

export function Sidebar() {
  const pathname = usePathname();

  function NavLink({ item }: { item: NavItem }) {
    const isActive =
      item.href === '/dashboard'
        ? pathname === '/dashboard'
        : pathname.startsWith(item.href);

    const tourId = item.href === '/dashboard/faucet'    ? 'sidebar-faucet'
                 : item.href === '/dashboard/swap'      ? 'sidebar-swap'
                 : item.href === '/dashboard/liquidity' ? 'sidebar-liquidity'
                 : undefined;

    return (
      <div className="tooltip-trigger relative flex w-full justify-center">
        <Link
          href={item.href}
          aria-label={item.label}
          aria-current={isActive ? 'page' : undefined}
          data-tour={tourId}
          className={cn(
            'relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150',
            isActive
              ? 'bg-base-elevated text-ink'
              : 'text-ink-faint hover:bg-base-card hover:text-ink-secondary',
          )}
        >
          {item.icon}
          {isActive && (
            <span className="absolute -right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-brand" />
          )}
          {item.soon && !isActive && (
            <span className="absolute -right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-yellow/70" />
          )}
        </Link>
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
  }

  return (
    <aside className="fixed left-0 top-14 bottom-0 z-40 flex w-16 flex-col items-center border-r border-base-border bg-base-surface pt-4 pb-4">

      {/* Nav groups */}
      {NAV_GROUPS.map((group, gi) => (
        <div key={group.label} className={cn('flex w-full flex-col items-center gap-0.5', gi > 0 && 'mt-3')}>
          <div className="mb-1 flex w-full justify-center">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-ink-faint select-none">
              {group.label}
            </span>
          </div>
          {group.items.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Docs — pinned at bottom, separated by divider */}
      <div className="flex w-full flex-col items-center gap-1 pt-2">
        <div className="h-px w-8 bg-base-border mb-2" />
        <NavLink item={DOCS_ITEM} />
        <span className="text-[9px] text-ink-faint mt-1">v0.1</span>
      </div>
    </aside>
  );
}
