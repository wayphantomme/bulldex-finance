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
  Timer,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  href:    string;
  label:   string;
  icon:    React.ReactNode;
  soon?:   boolean;
  liveDot?: 'green' | 'yellow' | 'blue';
  external?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// ─── Config ───────────────────────────────────────────────────────────────────

const ICON_CLS = 'h-4 w-4 shrink-0';

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Trade',
    items: [
      { href: '/dashboard',           label: 'Overview',  icon: <LayoutDashboard className={ICON_CLS} strokeWidth={1.5} /> },
      { href: '/dashboard/swap',      label: 'Swap',      icon: <ArrowLeftRight  className={ICON_CLS} strokeWidth={1.5} /> },
      { href: '/dashboard/liquidity', label: 'Liquidity', icon: <Droplets        className={ICON_CLS} strokeWidth={1.5} /> },
    ],
  },
  {
    label: 'Earn',
    items: [
      { href: '/dashboard/lending',  label: 'Lend',    icon: <Landmark    className={ICON_CLS} strokeWidth={1.5} /> },
      { href: '/dashboard/staking',  label: 'Stake',   icon: <ShieldCheck className={ICON_CLS} strokeWidth={1.5} /> },
      { href: '/dashboard/farming',  label: 'Farm',    icon: <Sprout      className={ICON_CLS} strokeWidth={1.5} /> },
    ],
  },
  {
    label: 'Manage',
    items: [
      { href: '/dashboard/vesting',    label: 'Vesting',    icon: <Timer     className={ICON_CLS} strokeWidth={1.5} />, liveDot: 'yellow' },
      { href: '/dashboard/analytics',  label: 'Analytics',  icon: <BarChart2 className={ICON_CLS} strokeWidth={1.5} />, liveDot: 'green' },
      { href: '/dashboard/governance', label: 'Governance', icon: <Vote      className={ICON_CLS} strokeWidth={1.5} />, soon: true },
      { href: '/dashboard/faucet',     label: 'Faucet',     icon: <Droplet   className={ICON_CLS} strokeWidth={1.5} /> },
    ],
  },
];

const BOTTOM_ITEMS: NavItem[] = [
  { href: '/docs', label: 'Docs', icon: <BookOpen className={ICON_CLS} strokeWidth={1.5} /> },
];

// ─── Live dot ─────────────────────────────────────────────────────────────────

const LIVE_DOT_COLORS: Record<string, string> = {
  green:  'bg-[#10b981]',
  yellow: 'bg-[#f59e0b]',
  blue:   'bg-[#3b82f6]',
};

// ─── Nav link ─────────────────────────────────────────────────────────────────

function NavLink({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: boolean;
}) {
  const content = (
    <>
      {/* Icon */}
      <span
        className={cn(
          'shrink-0 transition-colors',
          isActive ? 'text-[#f5f5f5]' : 'text-[#525252] group-hover:text-[#a3a3a3]',
        )}
      >
        {item.icon}
      </span>

      {/* Label */}
      <span
        className={cn(
          'flex-1 truncate text-[13px] transition-colors',
          isActive ? 'text-[#f5f5f5]' : 'text-[#a3a3a3] group-hover:text-[#f5f5f5]',
        )}
      >
        {item.label}
      </span>

      {/* Right-side badges */}
      <span className="flex items-center gap-1 shrink-0">
        {item.soon && (
          <span className="rounded bg-[#1e1e1e] px-1.5 py-0.5 text-[10px] font-medium text-[#525252]">
            soon
          </span>
        )}
        {item.liveDot && !item.soon && (
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              LIVE_DOT_COLORS[item.liveDot],
              'animate-live-pulse',
            )}
            aria-hidden="true"
          />
        )}
        {item.external && (
          <ExternalLink className="h-3 w-3 text-[#525252]" />
        )}
      </span>
    </>
  );

  const cls = cn(
    'group relative flex h-8 w-full items-center gap-2.5 rounded-md px-3 transition-colors duration-100',
    isActive
      ? 'bg-[#1a1a1a] text-[#f5f5f5]'
      : 'hover:bg-[#161616]',
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
        aria-label={`${item.label} (opens in new tab)`}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      className={cls}
      aria-current={isActive ? 'page' : undefined}
    >
      {content}
    </Link>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();

  function isActive(item: NavItem): boolean {
    if (item.href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(item.href);
  }

  return (
    <aside
      className={cn(
        // Hidden on mobile, visible on desktop
        'hidden lg:flex',
        // Token Terminal: fixed left sidebar, full-width with labels
        'fixed left-0 top-12 bottom-0 z-40',
        'w-[220px] flex-col',
        'border-r border-[#262626] bg-[#111111]',
      )}
      role="navigation"
      aria-label="Sidebar navigation"
    >
      {/* Scrollable nav area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 no-scrollbar">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label} className={cn(gi > 0 && 'mt-4')}>
            {/* Group header */}
            <div className="mb-1 px-3">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#525252] select-none">
                {group.label}
              </span>
            </div>
            {/* Group items */}
            <div className="px-2 space-y-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} isActive={isActive(item)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom section — docs + version */}
      <div className="shrink-0 border-t border-[#262626] py-2 px-2">
        {BOTTOM_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} isActive={isActive(item)} />
        ))}
        <div className="mt-2 px-3">
          <span className="text-[10px] text-[#525252] select-none font-mono">
            v0.1 · Sepolia
          </span>
        </div>
      </div>
    </aside>
  );
}
