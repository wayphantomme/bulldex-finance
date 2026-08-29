'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import {
  Search,
  LayoutDashboard,
  ChevronDown,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

// ─── Nav structure ─────────────────────────────────────────────────────────

const NAV = [
  {
    label: 'Getting Started',
    items: [
      { id: 'introduction', label: 'Introduction' },
      { id: 'quickstart',   label: 'Quick Start' },
      { id: 'stack',        label: 'Tech Stack' },
    ],
  },
  {
    label: 'Phase 1 — Live',
    items: [
      { id: 'swap',         label: 'AMM Swap' },
      { id: 'liquidity',    label: 'Liquidity Pools' },
      { id: 'lending',      label: 'Lending Markets' },
      { id: 'token',        label: 'Token (BDX)' },
      { id: 'contracts',    label: 'Contracts Reference' },
    ],
  },
  {
    label: 'Phase 2 — Building',
    items: [
      { id: 'staking',   label: 'Staking' },
      { id: 'farming',   label: 'Yield Farming' },
      { id: 'vesting',   label: 'Vesting' },
    ],
  },
  {
    label: 'Phase 3 — Planned',
    items: [
      { id: 'governance', label: 'Governance (DAO)' },
      { id: 'router',     label: 'Router & Multi-Hop' },
      { id: 'flashloan',  label: 'Flash Loans' },
    ],
  },
  {
    label: 'System Design',
    items: [
      { id: 'architecture', label: 'Architecture' },
      { id: 'hooks',        label: 'Hooks Reference' },
      { id: 'decisions',    label: 'Technical Decisions' },
    ],
  },
  {
    label: 'Dev Log',
    items: [
      { id: 'week4', label: 'Week 4 — Design Upgrade' },
      { id: 'week3', label: 'Week 3 — Liquidity UI' },
      { id: 'week2', label: 'Week 2 — AMM Swap' },
      { id: 'week1', label: 'Week 1 — Foundation' },
    ],
  },
];

// "On This Page" TOC per section id
const TOC: Record<string, { id: string; label: string }[]> = {
  introduction: [
    { id: 'intro-overview', label: "What's inside" },
    { id: 'intro-links',    label: 'Links' },
  ],
  quickstart: [
    { id: 'qs-prereq',    label: 'Prerequisites' },
    { id: 'qs-contracts', label: 'Smart Contracts' },
    { id: 'qs-frontend',  label: 'Frontend' },
  ],
  // Phase 1 features
  swap: [
    { id: 'swap-overview',   label: 'Overview' },
    { id: 'swap-math',       label: 'AMM Math' },
    { id: 'swap-functions',  label: 'Contract Functions' },
    { id: 'swap-flow',       label: 'Frontend Flow' },
    { id: 'swap-eth',        label: 'ETH → Token' },
  ],
  liquidity: [
    { id: 'liq-overview',   label: 'Overview' },
    { id: 'liq-math',       label: 'LP Math' },
    { id: 'liq-functions',  label: 'Contract Functions' },
    { id: 'liq-add',        label: 'Add Liquidity Flow' },
    { id: 'liq-remove',     label: 'Remove Liquidity Flow' },
  ],
  lending: [
    { id: 'lend-overview',   label: 'Overview' },
    { id: 'lend-params',     label: 'Parameters' },
    { id: 'lend-math',       label: 'Health Factor Math' },
    { id: 'lend-functions',  label: 'Contract Functions' },
    { id: 'lend-actions',    label: 'Action Flows' },
  ],
  token: [
    { id: 'token-params',    label: 'Key Parameters' },
    { id: 'token-functions', label: 'Functions' },
    { id: 'token-errors',    label: 'Custom Errors' },
  ],
  contracts: [
    { id: 'ct-pool',         label: 'Pool (AMM)' },
    { id: 'ct-factory',      label: 'PoolFactory' },
    { id: 'ct-mocktoken',    label: 'MockToken' },
    { id: 'ct-weth',         label: 'WETH' },
    { id: 'ct-price',        label: 'How Price Moves' },
  ],
  // Phase 2
  staking: [
    { id: 'staking-overview',  label: 'Overview' },
    { id: 'staking-math',      label: 'Reward Math' },
    { id: 'staking-functions', label: 'Contract Functions' },
    { id: 'staking-frontend',  label: 'Frontend Hooks' },
  ],
  farming: [
    { id: 'farming-overview',  label: 'Overview' },
    { id: 'farming-math',      label: 'MasterChef Math' },
    { id: 'farming-functions', label: 'Contract Functions' },
    { id: 'farming-pools',     label: 'Initial Pools' },
  ],
  vesting: [
    { id: 'vesting-overview',  label: 'Overview' },
    { id: 'vesting-schedule',  label: 'Vesting Schedule' },
    { id: 'vesting-functions', label: 'Contract Functions' },
  ],
  // Phase 3
  governance: [
    { id: 'gov-overview',    label: 'Overview' },
    { id: 'gov-flow',        label: 'Proposal Flow' },
    { id: 'gov-params',      label: 'Parameters' },
    { id: 'gov-delegation',  label: 'Delegation' },
    { id: 'gov-token',       label: 'Token Upgrade Required' },
  ],
  router: [
    { id: 'router-overview',  label: 'Overview' },
    { id: 'router-paths',     label: 'Supported Paths' },
    { id: 'router-functions', label: 'Functions' },
    { id: 'router-deadline',  label: 'Deadline Protection' },
  ],
  flashloan: [
    { id: 'flash-overview',   label: 'Overview' },
    { id: 'flash-interface',  label: 'Receiver Interface' },
    { id: 'flash-fee',        label: 'Fee Structure' },
  ],
  // System Design
  architecture: [
    { id: 'arch-contracts', label: 'Contract Layer' },
    { id: 'arch-frontend',  label: 'Frontend Layer' },
    { id: 'arch-data',      label: 'Data Layer' },
  ],
  hooks: [
    { id: 'hooks-read',   label: 'Read Hooks' },
    { id: 'hooks-write',  label: 'Write Hooks' },
    { id: 'hooks-pattern', label: 'State Machine Pattern' },
  ],
  decisions: [
    { id: 'dec-list', label: 'All Decisions' },
  ],
  // Dev Log
  week4: [
    { id: 'w4-built',    label: 'What was built' },
    { id: 'w4-problems', label: 'Problems & Solutions' },
  ],
  week3: [
    { id: 'w3-built',    label: 'What was built' },
    { id: 'w3-problems', label: 'Problems & Solutions' },
  ],
  week2: [
    { id: 'w2-built',    label: 'What was built' },
    { id: 'w2-problems', label: 'Problems & Solutions' },
    { id: 'w2-gas',      label: 'Gas Report' },
  ],
  week1: [
    { id: 'w1-built',    label: 'What was built' },
    { id: 'w1-problems', label: 'Problems & Solutions' },
    { id: 'w1-gas',      label: 'Gas Report' },
  ],
};

// ─── Page ──────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('introduction');
  const [searchQuery, setSearchQuery]     = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(NAV.map((g) => [g.label, true]))
  );
  const contentRef = useRef<HTMLDivElement>(null);

  const allItems = NAV.flatMap((g) => g.items);
  const filteredNav = searchQuery.trim()
    ? NAV.map((g) => ({
        ...g,
        items: g.items.filter((i) => i.label.toLowerCase().includes(searchQuery.toLowerCase())),
      })).filter((g) => g.items.length > 0)
    : NAV;

  function navigate(id: string) {
    setActiveSection(id);
    setMobileNavOpen(false);
    if (contentRef.current) contentRef.current.scrollTo({ top: 0 });
  }

  const currentToc = TOC[activeSection] ?? [];
  const currentLabel = allItems.find((i) => i.id === activeSection)?.label ?? '';

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0A0A0B] text-[#F2F2F3]">

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#26272C] px-4">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="lg:hidden text-[#55565D] hover:text-[#F2F2F3] transition-colors"
          >
            {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          {/* Back to app */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-semibold text-[#F2F2F3] hover:opacity-80 transition-opacity"
          >
            <LayoutDashboard className="h-4 w-4 text-[#C6F135]" />
            Bulldex Finance
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#55565D]" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-56 rounded-lg border border-[#26272C] bg-[#17181C] pl-8 pr-10 text-xs text-[#F2F2F3] placeholder:text-[#55565D] focus:outline-none focus:border-[#333339]"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-[#26272C] bg-[#1E1F24] px-1 py-0.5 font-mono text-[10px] text-[#55565D]">
              ⌘K
            </kbd>
          </div>

          {/* GitHub */}
          <a
            href="https://github.com/wayphantomme/bulldex-finance"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center h-8 w-8 rounded-lg border border-[#26272C] bg-[#17181C] text-[#9A9DA6] hover:text-[#F2F2F3] transition-colors"
            aria-label="GitHub"
          >
            <GithubIcon className="h-4 w-4" />
          </a>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left sidebar ──────────────────────────────────────────────── */}
        <aside className={cn(
          'shrink-0 border-r border-[#26272C] bg-[#0A0A0B] overflow-y-auto',
          'fixed inset-y-12 left-0 z-20 w-56 transition-transform duration-200 lg:static lg:translate-x-0',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full',
        )}>
          <nav className="py-5 px-3 space-y-5">
            {filteredNav.map((group) => (
              <div key={group.label}>
                <button
                  onClick={() => setExpandedGroups((p) => ({ ...p, [group.label]: !p[group.label] }))}
                  className="flex w-full items-center justify-between px-2.5 mb-1"
                >
                  <span className="text-[11px] font-medium uppercase tracking-widest text-[#55565D] flex items-center gap-1.5">
                    {group.label.includes('Live') && <span className="h-1.5 w-1.5 rounded-full bg-green-400 shrink-0" />}
                    {group.label.includes('Building') && <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 shrink-0" />}
                    {group.label.includes('Planned') && <span className="h-1.5 w-1.5 rounded-full bg-[#55565D] shrink-0" />}
                    {group.label}
                  </span>
                  <ChevronDown className={cn(
                    'h-3 w-3 text-[#55565D] transition-transform duration-150',
                    !expandedGroups[group.label] && '-rotate-90',
                  )} />
                </button>

                {expandedGroups[group.label] && (
                    <ul className="space-y-0.5">
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => navigate(item.id)}
                          className={cn(
                            'w-full py-1 text-left text-[13px] transition-colors pl-3 border-l-2',
                            activeSection === item.id
                              ? 'border-[#C6F135] text-[#F2F2F3] font-medium'
                              : 'border-transparent text-[#9A9DA6] hover:text-[#F2F2F3] hover:border-[#333339]',
                          )}
                        >
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Mobile overlay */}
        {mobileNavOpen && (
          <div
            className="fixed inset-0 z-10 bg-black/50 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        {/* ── Main content ────────────────────────────────────────────── */}
        <main ref={contentRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-8 py-10 xl:max-w-3xl">

            {/* Breadcrumb */}
            <p className="mb-2 text-xs text-[#55565D]">{NAV.find((g) => g.items.some((i) => i.id === activeSection))?.label}</p>
            <h1 className="text-3xl font-bold text-[#F2F2F3] mb-6">{currentLabel || 'Introduction'}</h1>

            <ContentArea section={activeSection} />

            {/* Prev / Next nav */}
            <PrevNext current={activeSection} items={allItems} onNavigate={navigate} />

            <p className="mt-8 text-[11px] text-[#55565D]">
              Last updated: Aug 2026
            </p>
          </div>
        </main>

        {/* ── Right TOC ────────────────────────────────────────────────── */}
        {currentToc.length > 0 && (
          <aside className="hidden xl:block w-48 shrink-0 border-l border-[#26272C] overflow-y-auto">
            <div className="sticky top-0 px-4 py-6">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#55565D]">
                On This Page
              </p>
              <ul className="space-y-1.5">
                {currentToc.map((t) => (
                  <li key={t.id}>
                    <a
                      href={`#${t.id}`}
                      className="block text-xs text-[#9A9DA6] hover:text-[#F2F2F3] transition-colors"
                    >
                      {t.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-6 space-y-2 border-t border-[#26272C] pt-4">
                <a
                  href="https://github.com/wayphantomme/bulldex-finance/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-[#9A9DA6] hover:text-[#F2F2F3] transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  Report an issue
                </a>
                <a
                  href="https://github.com/wayphantomme/bulldex-finance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-[#9A9DA6] hover:text-[#F2F2F3] transition-colors"
                >
                  <GithubIcon className="h-3 w-3" />
                  View on GitHub
                </a>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

// ─── Prev / Next ───────────────────────────────────────────────────────────

function PrevNext({
  current, items, onNavigate,
}: {
  current: string;
  items: { id: string; label: string }[];
  onNavigate: (id: string) => void;
}) {
  const idx  = items.findIndex((i) => i.id === current);
  const prev = idx > 0 ? items[idx - 1] : null;
  const next = idx < items.length - 1 ? items[idx + 1] : null;
  if (!prev && !next) return null;

  return (
    <div className="mt-12 flex items-center justify-between border-t border-[#26272C] pt-6">
      {prev ? (
        <button
          onClick={() => onNavigate(prev.id)}
          className="flex flex-col items-start text-xs text-[#9A9DA6] hover:text-[#F2F2F3] transition-colors"
        >
          <span className="text-[10px] text-[#55565D]">Previous</span>
          <span className="mt-0.5 font-medium">{prev.label}</span>
        </button>
      ) : <div />}
      {next && (
        <button
          onClick={() => onNavigate(next.id)}
          className="flex flex-col items-end text-xs text-[#9A9DA6] hover:text-[#F2F2F3] transition-colors"
        >
          <span className="text-[10px] text-[#55565D]">Next</span>
          <span className="mt-0.5 font-medium">{next.label}</span>
        </button>
      )}
    </div>
  );
}

// ─── Content area ──────────────────────────────────────────────────────────

function ContentArea({ section }: { section: string }) {
  switch (section) {
    case 'introduction': return <Introduction />;
    case 'quickstart':   return <QuickStart />;
    case 'stack':        return <TechStack />;
    // Phase 1
    case 'swap':         return <SwapDoc />;
    case 'liquidity':    return <LiquidityDoc />;
    case 'lending':      return <LendingDoc />;
    case 'token':        return <TokenDoc />;
    case 'contracts':    return <ContractsDoc />;
    // Phase 2
    case 'staking':      return <StakingDoc />;
    case 'farming':      return <FarmingDoc />;
    case 'vesting':      return <VestingDoc />;
    // Phase 3
    case 'governance':   return <GovernanceDoc />;
    case 'router':       return <RouterDoc />;
    case 'flashloan':    return <FlashLoanDoc />;
    // System Design
    case 'architecture': return <ArchitectureDoc />;
    case 'hooks':        return <HooksDoc />;
    case 'decisions':    return <Decisions />;
    // Dev Log
    case 'week4':        return <Week4Log />;
    case 'week3':        return <Week3Log />;
    case 'week2':        return <Week2Log />;
    case 'week1':        return <Week1Log />;
    default: return <Introduction />;
  }
}

// ─── Sub-components ────────────────────────────────────────────────────────

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[#9A9DA6] leading-relaxed mb-4">{children}</p>;
}
function H2({ id, children }: { id?: string; children: React.ReactNode }) {
  return <h2 id={id} className="text-xl font-semibold text-[#F2F2F3] mt-8 mb-3 scroll-mt-6">{children}</h2>;
}
function H3({ id, children }: { id?: string; children: React.ReactNode }) {
  return <h3 id={id} className="text-base font-semibold text-[#F2F2F3] mt-6 mb-2 scroll-mt-6">{children}</h3>;
}
function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-[#26272C] bg-[#111114] p-4 font-mono text-xs leading-relaxed text-[#9A9DA6] mb-4">
      <code>{children}</code>
    </pre>
  );
}
function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#26272C] mb-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#26272C] bg-[#111114]">
            {headers.map((h) => (
              <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[#55565D]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[#26272C] last:border-0 hover:bg-[#111114] transition-colors">
              {row.map((cell, j) => (
                <td key={j} className={cn('px-4 py-2.5 text-xs', j === 0 ? 'font-medium text-[#F2F2F3]' : 'text-[#9A9DA6]')}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function FnList({ items }: { items: { sig: string; mod: string; desc: string }[] }) {
  return (
    <div className="space-y-2 mb-4">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-[#26272C] bg-[#17181C] px-4 py-3">
          <code className="text-xs text-[#C6F135]">{item.sig}</code>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded bg-[#1E1F24] px-1.5 py-0.5 text-[10px] font-mono text-[#55565D]">{item.mod}</span>
            <span className="text-xs text-[#9A9DA6]">{item.desc}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
function Problem({ problem, solution }: { problem: string; solution: string }) {
  return (
    <div className="rounded-xl border border-[#26272C] bg-[#17181C] p-4 mb-3 space-y-2">
      <div className="flex gap-2">
        <span className="shrink-0 text-xs font-semibold text-[#F87171]">Problem</span>
        <p className="text-xs text-[#F2F2F3]">{problem}</p>
      </div>
      <div className="flex gap-2">
        <span className="shrink-0 text-xs font-semibold text-[#4ADE80]">Solution</span>
        <p className="text-xs text-[#9A9DA6]">{solution}</p>
      </div>
    </div>
  );
}
function Callout({ type, children }: { type: 'warning' | 'info'; children: React.ReactNode }) {
  return (
    <div className={cn(
      'flex gap-2 rounded-xl border px-4 py-3 text-sm mb-4',
      type === 'warning' ? 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400' : 'border-[#C6F135]/20 bg-[#C6F135]/5 text-[#C6F135]',
    )}>
      <span>{type === 'warning' ? '⚠' : 'ℹ'}</span>
      <span>{children}</span>
    </div>
  );
}
function Pill({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-[#26272C] bg-[#17181C] px-3 py-1.5 text-xs text-[#9A9DA6] transition-colors hover:border-[#333339] hover:text-[#F2F2F3] mr-2 mb-2">
      <ExternalLink className="h-3 w-3" />
      {label}
    </a>
  );
}
function Built({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 mb-4">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-xs text-[#9A9DA6]">
          <span className="text-[#4ADE80] shrink-0">+</span>{item}
        </li>
      ))}
    </ul>
  );
}

// ─── Section content ───────────────────────────────────────────────────────

// ─── Phase 1 feature wrappers ──────────────────────────────────────────────

function SwapDoc() {
  return (
    <div>
      <H2 id="swap-overview">AMM Swap</H2>
      <P>Exchange tokens at a market rate determined by the constant-product formula x * y = k. A 0.3% fee is charged on every swap and goes entirely to liquidity providers — no protocol cut.</P>
      <P>Two pools are live: <strong>BDX/MUSDC</strong> (primary) and <strong>BDX/WETH</strong> (secondary). ETH is automatically wrapped to WETH before swapping.</P>

      <H2 id="swap-math">Formula</H2>
      <Code>{`amountOut = (amountIn × 997 × reserveOut) / (reserveIn × 1000 + amountIn × 997)

// Price impact (basis points):
midPrice = amountIn × reserveOut / reserveIn
impactBps = (midPrice - amountOut) / midPrice × 10000`}</Code>

      <H2 id="swap-functions">Contract Functions</H2>
      <FnList items={[
        { sig: 'swap(address tokenIn, uint256 amountIn, uint256 minAmountOut, address to)', mod: 'external nonReentrant', desc: 'Swap exact input for as much output as possible. Reverts if output < minAmountOut.' },
        { sig: 'getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut)', mod: 'public pure', desc: 'Compute output amount given input. Includes 0.3% fee.' },
        { sig: 'getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut)', mod: 'public pure', desc: 'Compute input needed for a desired output.' },
        { sig: 'getPriceImpact(address tokenIn, uint256 amountIn)', mod: 'external view', desc: 'Price impact in basis points (100 = 1%).' },
        { sig: 'getReserves()', mod: 'external view', desc: 'Returns (reserve0, reserve1) — current pool reserves.' },
      ]} />

      <H2 id="swap-flow">Frontend Flow: ERC-20</H2>
      <Code>{`1. [if not approved] approve(pool, MAX_UINT256)
   → wait for receipt
2. swap(tokenIn, amountIn, minAmountOut, recipient)
   → success`}</Code>

      <H2 id="swap-eth">Frontend Flow: ETH to Token</H2>
      <Code>{`1. deposit() on WETH contract  { value: amountIn }
   → wait for receipt
2. approve(pool, MAX_UINT256) on WETH
   → wait for receipt
3. swap(WETH, amountIn, minAmountOut, recipient)
   → success`}</Code>

      <Table headers={['Slippage Option', 'Basis Points']} rows={[
        ['0.5%', '50'],
        ['1.0% (default)', '100'],
        ['2.0%', '200'],
      ]} />
    </div>
  );
}

function LiquidityDoc() {
  return (
    <div>
      <H2 id="liq-overview">Liquidity Pools</H2>
      <P>Deposit equal-value pairs of tokens to earn 0.3% of every swap. Receive LP tokens representing your share. Burn LP tokens at any time to withdraw.</P>
      <P>Two pools: BDX/MUSDC and BDX/WETH. The BDX/WETH pool requires WETH (ERC-20), not native ETH — wrap on the Faucet page first.</P>

      <H2 id="liq-math">LP Math</H2>
      <Code>{`// First deposit:
liquidity = sqrt(amount0 × amount1) - MINIMUM_LIQUIDITY

// Subsequent deposits:
liquidity = min(amount0 × totalSupply / reserve0,
                amount1 × totalSupply / reserve1)

// Withdrawal:
amount0 = lpBurned × reserve0 / totalSupply
amount1 = lpBurned × reserve1 / totalSupply`}</Code>

      <H2 id="liq-functions">Contract Functions</H2>
      <FnList items={[
        { sig: 'addLiquidity(uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address to)', mod: 'external nonReentrant', desc: 'Deposit tokens, receive LP tokens. Unused tokens returned to caller.' },
        { sig: 'removeLiquidity(uint256 liquidity, uint256 amount0Min, uint256 amount1Min, address to)', mod: 'external nonReentrant', desc: 'Burn LP tokens, receive proportional reserves.' },
        { sig: 'balanceOf(address account)', mod: 'external view', desc: 'LP token balance of an address.' },
        { sig: 'totalSupply()', mod: 'external view', desc: 'Total LP tokens in circulation.' },
      ]} />

      <H2 id="liq-add">Add Liquidity Flow</H2>
      <Code>{`1. approve(pool, MAX_UINT256) for BDX → wait
2. approve(pool, MAX_UINT256) for MUSDC/WETH → wait
3. addLiquidity(amount0, amount1, min0, min1, userAddress)
   → LP tokens minted to user`}</Code>

      <H2 id="liq-remove">Remove Liquidity Flow</H2>
      <P>No approval needed — LP tokens are burned directly from the caller. Use the percentage slider (25% / 50% / 75% / MAX) to select how much to remove.</P>
      <Code>{`removeLiquidity(lpToRemove, min0, min1, userAddress)
→ tokens returned proportionally`}</Code>
    </div>
  );
}

function LendingDoc() {
  return (
    <div>
      <H2 id="lend-overview">Lending Markets</H2>
      <P>Over-collateralized lending. Deposit BDX as collateral, borrow MUSDC against it. If your health factor drops below 1.0, your position can be liquidated.</P>

      <H2 id="lend-params">Parameters</H2>
      <Table headers={['Parameter', 'Value']} rows={[
        ['Collateral', 'BDX'],
        ['Borrow asset', 'MUSDC'],
        ['Max LTV', '75% — borrow up to 75% of collateral value'],
        ['Liquidation threshold', '80% — position liquidatable below this'],
        ['Liquidation bonus', '5% — liquidator receives collateral + 5%'],
        ['Interest rate', '~5% APR (simple, per block)'],
        ['Price oracle', 'BDX/MUSDC pool spot price (testnet)'],
      ]} />

      <H2 id="lend-math">Health Factor</H2>
      <Code>{`healthFactor = (collateralUSD × 0.80) / (borrowed + interest)

// Scaled by 1e18:
// >= 1e18 → safe
// <  1e18 → liquidatable
// = MAX_UINT256 → no debt`}</Code>

      <H2 id="lend-functions">Contract Functions</H2>
      <FnList items={[
        { sig: 'depositCollateral(uint256 amount)', mod: 'external nonReentrant', desc: 'Deposit BDX as collateral.' },
        { sig: 'withdrawCollateral(uint256 amount)', mod: 'external nonReentrant', desc: 'Withdraw BDX. Reverts if withdrawal would breach 75% LTV.' },
        { sig: 'borrow(uint256 amount)', mod: 'external nonReentrant', desc: 'Borrow MUSDC up to your 75% LTV limit.' },
        { sig: 'repay(uint256 amount)', mod: 'external nonReentrant', desc: 'Repay MUSDC debt + interest. Pass MAX_UINT256 to repay all.' },
        { sig: 'liquidate(address borrower, uint256 debtToCover)', mod: 'external nonReentrant', desc: 'Liquidate undercollateralized position. Liquidator repays debt, receives collateral + 5%.' },
        { sig: 'getPosition(address user)', mod: 'external view', desc: 'Returns (collateral, borrowed, interest, healthFactor, collateralUSD, maxBorrowable).' },
        { sig: 'healthFactor(address user)', mod: 'public view', desc: 'Current health factor, 1e18 scaled.' },
      ]} />

      <H2 id="lend-actions">Action Flows</H2>
      <Code>{`Deposit:  approve(lending, MAX) on BDX → depositCollateral(amount)
Borrow:   borrow(amount)  [no approval — contract sends MUSDC]
Repay:    approve(lending, MAX) on MUSDC → repay(amount)
Withdraw: withdrawCollateral(amount)  [no approval]`}</Code>

      <Callout type="warning">The price oracle uses spot price from the BDX/MUSDC pool. This is acceptable for testnet but requires Chainlink TWAP before mainnet deployment.</Callout>
    </div>
  );
}

function ContractsDoc() {
  return (
    <div>
      <H2 id="ct-pool">Pool (AMM)</H2>
      <PoolDoc />
      <H2 id="ct-factory">PoolFactory</H2>
      <FactoryDoc />
      <H2 id="ct-mocktoken">MockToken (MUSDC)</H2>
      <MockTokenDoc />
      <H2 id="ct-weth">WETH</H2>
      <WETHDoc />
      <H2 id="ct-price">How Price Moves</H2>
      <PriceMechanicsDoc />
    </div>
  );
}

function Introduction() {
  return (
    <div>
      <P>Full-stack DeFi protocol built in public - combining token swaps, liquidity provision, lending, staking, yield farming, and governance on Ethereum.</P>
      <P>Built as a portfolio project demonstrating end-to-end ownership: Solidity contracts, Foundry testing, Next.js frontend, wagmi integration, and Vercel deployment.</P>

      <div className="mb-6" id="intro-links">
        <Pill href="https://bulldex-finance.vercel.app" label="Live App" />
        <Pill href="https://github.com/wayphantomme/bulldex-finance" label="GitHub" />
        <Pill href="https://sepolia.etherscan.io/address/0x193d18048b343983971bfc50893a720e97322ae5" label="Contract" />
        <Pill href="https://x.com/wayphantomme" label="@wayphantomme" />
      </div>

      <H2 id="intro-overview">{"What's inside"}</H2>
      <Table
        headers={['Item', 'Detail']}
        rows={[
          ['Network',    'Sepolia Testnet (chain 11155111)'],
          ['Tests',      '111 passing'],
          ['Contracts',  'Token, MockToken, WETH, Pool, PoolFactory, Lending'],
          ['Frontend',   'Next.js 14, wagmi v2, RainbowKit v2'],
          ['Status',     'Phase 1 complete — Swap, Liquidity, Lending live'],
        ]}
      />
    </div>
  );
}

function QuickStart() {
  return (
    <div>
      <P>Clone, install, and run locally in under 5 minutes.</P>
      <H3 id="qs-prereq">Prerequisites</H3>
      <ul className="space-y-1 text-sm text-[#9A9DA6] mb-4">
        <li>• Node.js v20+</li>
        <li>• <a href="https://book.getfoundry.sh" className="text-[#C6F135] hover:opacity-70">Foundry</a> - Solidity compiler + testing</li>
        <li>• Git</li>
      </ul>
      <H3 id="qs-contracts">Smart Contracts</H3>
      <Code>{`git clone https://github.com/wayphantomme/bulldex-finance.git
cd bulldex-finance/contracts
forge install
make test            # 73 tests
make deploy-sepolia  # deploy all 4 contracts`}</Code>
      <H3 id="qs-frontend">Frontend</H3>
      <Code>{`cd frontend
npm install
cp .env.local.example .env.local
# Fill in from deploy output:
# NEXT_PUBLIC_SEPOLIA_RPC
# NEXT_PUBLIC_TOKEN_ADDRESS
# NEXT_PUBLIC_MUSDC_ADDRESS
# NEXT_PUBLIC_FACTORY_ADDRESS
# NEXT_PUBLIC_POOL_BDX_MUSDC
# NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
npm run dev   # http://localhost:3000`}</Code>
    </div>
  );
}

function TechStack() {
  return (
    <div>
      <Table
        headers={['Layer', 'Technology', 'Version', 'Purpose']}
        rows={[
          ['Contracts', 'Solidity',      '0.8.24',     'Smart contract language'],
          ['Contracts', 'Foundry',        'nightly',    'Compile, test, deploy, verify'],
          ['Contracts', 'OpenZeppelin',   'v5.1.0',     'ERC20, ReentrancyGuard, SafeERC20'],
          ['Frontend',  'Next.js',        '14.2.5',     'React SSR framework'],
          ['Frontend',  'TypeScript',     '^5',         'Type-safe frontend'],
          ['Frontend',  'Tailwind CSS',   '^3.4',       'Utility-first CSS, brand tokens'],
          ['Frontend',  'wagmi',          'v2.12.7',    'React hooks for Ethereum'],
          ['Frontend',  'viem',           'v2.21.1',    'TypeScript Ethereum utils'],
          ['Frontend',  'RainbowKit',     'v2.1.7',     'Wallet connect UI'],
          ['Frontend',  'Lucide React',   '^0.468',     'Icon library (outline, 1.5px stroke)'],
          ['Infra',     'Alchemy',        '-',          'Sepolia RPC endpoint'],
          ['Infra',     'Vercel',         '-',          'Frontend hosting, auto-deploy'],
          ['Infra',     'Sepolia',        '11155111',   'Ethereum testnet'],
          ['Infra',     'GitHub Actions', '-',          'CI/CD — test + deploy on push'],
        ]}
      />
    </div>
  );
}

function TokenDoc() {
  return (
    <div>
      <P>ERC20 governance and utility token for Bulldex Finance.</P>
      <Code>{`Token is ERC20, ERC20Burnable, ERC20Permit, Ownable`}</Code>
      <H3 id="token-params">Key Parameters</H3>
      <Table
        headers={['Parameter', 'Value']}
        rows={[
          ['Name',            'Bulldex Finance'],
          ['Symbol',          'BDX'],
          ['Decimals',        '18'],
          ['Max Supply',      '1,000,000,000 BDX'],
          ['Initial Supply',  '100,000,000 BDX (to deployer)'],
          ['Sepolia Address', '0x193d18048b343983971bfc50893a720e97322ae5'],
        ]}
      />
      <H3 id="token-functions">Functions</H3>
      <FnList items={[
        { sig: 'mint(address to, uint256 amount)',         mod: 'onlyOwner', desc: 'Mint new BDX up to MAX_SUPPLY' },
        { sig: 'burn(uint256 value)',                       mod: 'public',    desc: "Burn caller's tokens" },
        { sig: 'burnFrom(address account, uint256 value)', mod: 'public',    desc: 'Burn with allowance' },
        { sig: 'permit(...)',                               mod: 'public',    desc: 'EIP-2612 gasless approval via signature' },
        { sig: 'remainingMintable()',                       mod: 'view',      desc: 'Returns MAX_SUPPLY - totalSupply()' },
      ]} />
      <H3 id="token-errors">Custom Errors</H3>
      <Code>{`error ExceedsMaxSupply(uint256 requested, uint256 available);
error MintToZeroAddress();
error MintAmountZero();`}</Code>
    </div>
  );
}

function PoolDoc() {
  return (
    <div>
      <P>Constant product AMM (x*y=k). The Pool contract itself is the LP token (ERC20). Modeled after Uniswap v2 with 0.3% swap fee.</P>
      <H3 id="pool-formula">Formula</H3>
      <Code>{`// Output with 0.3% fee
amountOut = (amountIn * 997 * reserveOut)
          / (reserveIn * 1000 + amountIn * 997)

// First LP mint
lpMinted = sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY

// Subsequent LP mint
lpMinted = min(
  amount0 * totalLP / reserve0,
  amount1 * totalLP / reserve1
)`}</Code>
      <Table
        headers={['Constant', 'Value', 'Purpose']}
        rows={[
          ['MINIMUM_LIQUIDITY', '1000', 'Locked on first mint, prevents price manipulation'],
          ['FEE_NUMERATOR',     '997',  '0.3% swap fee (997/1000)'],
        ]}
      />
      <H3 id="pool-functions">Functions</H3>
      <FnList items={[
        { sig: 'swap(tokenIn, amountIn, minAmountOut, to)',                         mod: 'nonpayable', desc: 'Swap exact input, revert if output < minAmountOut' },
        { sig: 'addLiquidity(amount0Desired, amount1Desired, min0, min1, to)',       mod: 'nonpayable', desc: 'Deposit tokens, receive LP tokens' },
        { sig: 'removeLiquidity(liquidity, min0, min1, to)',                         mod: 'nonpayable', desc: 'Burn LP tokens, receive proportional reserves' },
        { sig: 'getAmountOut(amountIn, reserveIn, reserveOut)',                      mod: 'pure',       desc: 'x*y=k output formula with 0.3% fee' },
        { sig: 'getAmountIn(amountOut, reserveIn, reserveOut)',                      mod: 'pure',       desc: 'Reverse quote' },
        { sig: 'getPrice0() / getPrice1()',                                          mod: 'view',       desc: 'Spot price scaled by 1e18' },
        { sig: 'getPriceImpact(tokenIn, amountIn)',                                  mod: 'view',       desc: 'Price impact in basis points' },
      ]} />
      <H3 id="pool-security">Security</H3>
      <ul className="space-y-1 text-sm text-[#9A9DA6] mb-4">
        <li>• <strong className="text-[#F2F2F3]">ReentrancyGuard</strong> on all state-changing functions</li>
        <li>• <strong className="text-[#F2F2F3]">SafeERC20</strong> for all token transfers</li>
        <li>• <strong className="text-[#F2F2F3]">SlippageExceeded</strong> error for MEV protection</li>
        <li>• Reserves tracked in storage, not balanceOf - prevents flash loan manipulation</li>
      </ul>
    </div>
  );
}

function FactoryDoc() {
  return (
    <div>
      <P>Deploys and tracks all Bulldex AMM pools. One pool per token pair, enforced on-chain.</P>
      <FnList items={[
        { sig: 'createPool(tokenA, tokenB)', mod: 'nonpayable', desc: 'Deploy Pool, register in bidirectional mapping, auto LP name from symbols' },
        { sig: 'poolFor(tokenA, tokenB)',     mod: 'view',       desc: 'Lookup pool for any token order (A,B or B,A)' },
        { sig: 'allPoolsLength()',             mod: 'view',       desc: 'Total number of deployed pools' },
      ]} />
      <ul className="space-y-1 text-sm text-[#9A9DA6]">
        <li>• Tokens are sorted (lower address = token0) for canonical ordering</li>
        <li>• Reverts with PoolExists if pair already deployed</li>
        <li>• LP token name auto-generated: &quot;Bulldex BDX/MUSDC LP&quot;</li>
      </ul>
    </div>
  );
}

function MockTokenDoc() {
  return (
    <div>
      <Callout type="warning">Testnet only. Never deploy to mainnet.</Callout>
      <P>Open-mint ERC20 used as the second token (MUSDC) in the BDX/MUSDC pool. Anyone can mint on testnet for testing swaps. The frontend Faucet page calls faucet() to give users 1,000 MUSDC with a 24-hour cooldown enforced via localStorage.</P>
      <FnList items={[
        { sig: 'mint(address to, uint256 amount)', mod: 'public', desc: 'Mint tokens to any address' },
        { sig: 'faucet(uint256 amount)',            mod: 'public', desc: 'Mint tokens to msg.sender' },
      ]} />
    </div>
  );
}

function WETHDoc() {
  return (
    <div>
      <P>Wrapped Ether (WETH9-style). Required because Pool.sol uses IERC20.transferFrom — cannot accept native ETH directly.</P>
      <Callout type="info">Sepolia has a canonical WETH at 0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14 but we deployed our own to have full control during development. Logic is identical.</Callout>
      <H3>Deployed</H3>
      <Table headers={['Contract', 'Address']} rows={[
        ['WETH',         '0xEbFe8d5E0b674925599af1E970975Ae4fd2A4b62'],
        ['BDX/WETH Pool','0x3cA1cE14fd2fE5A449F67CFA63F342acfB8860e4'],
      ]} />
      <H3>Frontend ETH swap flow</H3>
      <Code>{`// User picks ETH in swap UI
// useMultiSwap detects isNative = true → 3 steps:
1. WETH.deposit{value: amountIn}()  // wrap ETH → WETH
2. WETH.approve(pool, MAX_UINT256)  // approve pool
3. Pool.swap(WETH, amountIn, minOut, user) // swap`}</Code>
      <H3>Functions</H3>
      <FnList items={[
        { sig: 'deposit()',           mod: 'payable', desc: 'Wrap ETH — send ETH, receive equal WETH' },
        { sig: 'withdraw(uint256)',   mod: 'nonpayable', desc: 'Unwrap WETH back to ETH' },
        { sig: 'balanceOf(address)', mod: 'view',     desc: 'WETH ERC-20 balance' },
        { sig: 'approve(address, uint256)', mod: 'nonpayable', desc: 'Standard ERC-20 approval' },
      ]} />
    </div>
  );
}

function PriceMechanicsDoc() {
  return (
    <div>
      <P>How price is determined in AMM pools — what makes BDX price go up or down.</P>

      <H2>The Core Formula: x * y = k</H2>
      <P>Price in AMM is NOT set by order books. It is determined by the <strong>ratio of two token reserves</strong> in the pool.</P>
      <Code>{`Pool BDX/WETH:
  x = BDX reserve  = 1,000,000
  y = WETH reserve = 0.1
  k = x * y        = 100,000

Spot price BDX = y / x
              = 0.1 / 1,000,000
              = 0.0000001 WETH per BDX`}</Code>

      <H2>What Makes Price Go Up?</H2>
      <P>When someone <strong>buys BDX</strong> (swaps WETH → BDX), BDX leaves the pool and WETH enters. BDX becomes more scarce in the pool, so the price rises.</P>
      <Code>{`User swaps: 0.001 WETH → BDX

Pool before: 1,000,000 BDX + 0.1 WETH
amountOut   = (0.001 × 997 × 1,000,000) / (0.1 × 1000 + 0.001 × 997)
            ≈ 9,070 BDX

Pool after:  990,930 BDX + 0.101 WETH
New price   = 0.101 / 990,930 = 0.0000001019 WETH/BDX

Price increase: +1.9%`}</Code>

      <H2>What Makes Price Go Down?</H2>
      <P>When someone <strong>sells BDX</strong> (swaps BDX → WETH), BDX floods into the pool and WETH leaves. BDX becomes more abundant, price falls.</P>
      <Code>{`User swaps: 100,000 BDX → WETH

Pool before: 1,000,000 BDX + 0.1 WETH
Pool after:  1,100,000 BDX + 0.0909 WETH (approx)

New price   = 0.0909 / 1,100,000 = 0.0000000826 WETH/BDX

Price decrease: -17.4%`}</Code>

      <H2>Price Impact vs Slippage</H2>
      <Table headers={['Term', 'Definition']} rows={[
        ['Spot price',   'Current price from reserve ratio y/x'],
        ['Price impact', '% price change caused by your swap'],
        ['Slippage',     'Difference between expected and actual price'],
        ['Mid price',    'Ideal price without fee: y/x'],
      ]} />
      <P>The smaller the pool (low TVL) → the bigger the price impact for the same swap size. A $1,000 swap in a $10,000 pool moves price much more than in a $10,000,000 pool.</P>

      <H2>Why BDX Pool Price ≠ Seed Price $0.05</H2>
      <P>The $0.05 target is from <strong>tokenomics design</strong> — what we want to sell at. The pool price is set by <strong>how much liquidity we seed</strong>.</P>
      <Code>{`We seeded: 1,000,000 BDX + 0.1 WETH

ETH price  = $2,500 (Chainlink)
WETH value = 0.1 × $2,500 = $250

BDX price  = $250 (WETH side) / 1,000,000 BDX
           = $0.00025 per BDX

To price at $0.05, need:
  Seed with: 1,000,000 BDX + 20 WETH ($50,000)
  OR seed fewer BDX: 5,000 BDX + 0.1 WETH
     → $250 / 5,000 = $0.05 ✓`}</Code>

      <H2>How BDX Price USD is Calculated</H2>
      <P>There is no Chainlink BDX/USD feed since BDX is a new token. We derive it from two on-chain sources:</P>
      <Code>{`Step 1: Get spot price from BDX/WETH pool
  wethPerBdx = wethReserve / bdxReserve
             = 0.1 / 1,000,000
             = 0.0000001 WETH

Step 2: Multiply by ETH/USD from Chainlink
  bdxUSD = wethPerBdx × ethPriceUSD
         = 0.0000001 × $2,500
         = $0.00025

Sources:
  BDX/WETH pool  → on-chain, real-time
  Chainlink ETH/USD → decentralized oracle, updated every 0.5% deviation`}</Code>

      <H2>What is Arbitrage?</H2>
      <P>On mainnet, if BDX is cheaper on Bulldex than elsewhere, arbitrageurs will buy it here and sell on other platforms, pushing prices back into alignment. On testnet, there are no arbitrageurs — prices can diverge freely.</P>

      <H2>Chainlink Price Feed</H2>
      <Table headers={['Feed', 'Address', 'Network', 'Decimals']} rows={[
        ['ETH/USD', '0x694AA1769357215DE4FAC081bf1f309aDC325306', 'Sepolia', '8'],
      ]} />
      <Code>{`// Read ETH price in Solidity
AggregatorV3Interface feed = AggregatorV3Interface(0x694AA...);
(, int256 answer, , , ) = feed.latestRoundData();
uint256 ethUSD = uint256(answer) / 1e8; // 8 decimals → divide by 1e8`}</Code>
    </div>
  );
}

function ArchitectureDoc() {
  return (
    <div>
      <Code>{`frontend/src/
├── app/
│   ├── page.tsx          # Landing page (bento grid, VC-focused)
│   ├── layout.tsx        # Root layout + Web3Provider
│   ├── dashboard/
│   │   ├── page.tsx      # Overview
│   │   ├── swap/         # Live — AMM swap UI
│   │   ├── liquidity/    # Live — add/remove LP
│   │   ├── faucet/       # Live — MUSDC faucet + Add to MM
│   │   ├── lending/      # Phase 2
│   │   ├── staking/      # Phase 2
│   │   └── farming/      # Phase 2
│   └── docs/             # This page
├── components/
│   ├── ui/               # Button, Card, Badge, Input, Skeleton
│   └── layout/           # Header (wagmi ConnectButton), Sidebar (Lucide icons)
├── hooks/
│   ├── usePool.ts        # Reserves, prices, quotes (multicall)
│   ├── useSwap.ts        # Approve + swap state machine
│   ├── usePoolStats.ts   # TVL, reserves, pool share
│   ├── useAddLiquidity.ts     # Sequential approve + addLiquidity
│   └── useRemoveLiquidity.ts  # removeLiquidity (no LP approval needed)
└── constants/
    ├── abis.ts           # TOKEN_ABI, POOL_ABI, FACTORY_ABI
    └── contracts.ts      # Addresses, TOKENS registry, isConfigured()`}</Code>
    </div>
  );
}

function HooksDoc() {
  return (
    <div>
      <H3>usePool()</H3>
      <P>Reads pool state via multicall. Auto-refreshes every 15 seconds.</P>
      <Code>{`const { reserve0, reserve1, token0, token1,
        price0, price1, totalSupply,
        isLoading, isConfigured } = usePool();`}</Code>

      <H3>useSwapQuote()</H3>
      <P>Calls getAmountOut + getPriceImpact in a single multicall.</P>
      <Code>{`const { amountOut, priceImpact, isLoading } =
  useSwapQuote(tokenIn, amountIn, reserve0, reserve1, token0);`}</Code>

      <H3>useSwap()</H3>
      <P>Full approve-swap state machine.</P>
      <Code>{`const { step, txHash, error,
        needsApproval, approve, swap, reset } =
  useSwap(tokenIn, address);
// step: 'idle' | 'approving' | 'approved' | 'swapping' | 'success' | 'error'`}</Code>

      <H3>useAddLiquidity()</H3>
      <Code>{`const { step, addLiquidity, reset } = useAddLiquidity(address);
// Sequence: approve BDX -> approve MUSDC -> addLiquidity
// MAX approval so user only approves once per token`}</Code>

      <H3>useRemoveLiquidity()</H3>
      <Code>{`const { step, lpBalance, removeLiquidity, reset } =
  useRemoveLiquidity(address);
// No LP approval needed — Pool._burn(msg.sender) directly`}</Code>
    </div>
  );
}

function SwapFlowDoc() {
  return (
    <div>
      <P>Step-by-step of what happens when a user swaps.</P>
      <div className="space-y-2 mb-4">
        {[
          { n: '1', title: 'Enter amount',      detail: 'parseAmount() converts string to bigint via viem parseUnits' },
          { n: '2', title: 'Get quote',          detail: 'useSwapQuote calls getAmountOut(amountIn, reserveIn, reserveOut)' },
          { n: '3', title: 'Show price impact',  detail: 'getPriceImpact() returns bps. Green <1%, yellow 1-5%, red >5%' },
          { n: '4', title: 'Apply slippage',     detail: 'minAmountOut = amountOut * (10000 - slippageBps) / 10000' },
          { n: '5', title: 'Check allowance',    detail: 'useReadContract allowance then needsApproval(amountIn)' },
          { n: '6', title: 'Approve if needed',  detail: 'approve(pool, MAX_UINT256) — approves once, no repeat' },
          { n: '7', title: 'Execute swap',        detail: 'Pool.swap(tokenIn, amountIn, minAmountOut, user)' },
          { n: '8', title: 'Confirm on-chain',   detail: 'useWaitForTransactionReceipt then show Etherscan link' },
        ].map((s) => (
          <div key={s.n} className="flex gap-3 rounded-xl border border-[#26272C] bg-[#17181C] px-4 py-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C6F135]/15 text-[10px] font-bold text-[#C6F135]">{s.n}</span>
            <div>
              <p className="text-sm font-medium text-[#F2F2F3]">{s.title}</p>
              <p className="text-xs text-[#55565D]">{s.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Week4Log() {
  return (
    <div>
      <P>Jupiter-style design upgrade, mobile responsive fixes, price ticker, wallet icons, and WETH/ETH pool.</P>

      <H2 id="w4-built">What was built</H2>
      <Built items={[
        'Jupiter-style design (Phase 1-4) — neutral base colors, dot-grid bg, lime brand #C6F135, separate from semantic green',
        'Lucide React icons — replaced all custom SVGs in sidebar (LayoutDashboard, ArrowLeftRight, Droplets, etc)',
        'Price ticker — BDX price from pool + ETH price from Chainlink (Sepolia: 0x694AA1769357215DE4FAC081bf1f309aDC325306)',
        'Wallet icon per connector — MetaMask fox, Rainbow, Coinbase, WalletConnect in header',
        'Docs pinned at sidebar bottom — standalone below Manage group like Jupiter Get Help',
        'WETH.sol — WETH9-style wrapper, deploy + BDX/WETH pool seeded (1M BDX + 0.1 WETH)',
        'ETH in swap — auto-wrap ETH to WETH before swap via useMultiSwap',
        'Token picker dropdown — shows all tokens + balance per token',
        'Multi-pool routing — getPoolAddress() routes BDX/MUSDC vs BDX/WETH automatically',
        'useTokenBalances multicall — fixed swap showing 0 balance (was reading BDX twice)',
        'Mobile fixes — token stats 2-col on mobile, M/B suffix for large numbers, CTA whitespace-nowrap',
        'Faucet card alignment — flex-1 spacer so all 3 cards have buttons at same height',
      ]} />

      <H2 id="w4-problems">Problems & Solutions</H2>
      {WEEK4_PROBLEMS.map((p, i) => <Problem key={i} {...p} />)}
    </div>
  );
}

function Week3Log() {
  return (
    <div>
      <P>Full liquidity provision UI — add/remove LP with real-time pool stats, pool share calculator, and approve flow.</P>

      <H2 id="w3-built">What was built</H2>
      <Built items={[
        'usePoolStats.ts — multicall 7 reads, isBDXToken0 detection, formatted reserves/prices, K/M formatting',
        'useAddLiquidity.ts — sequential approve BDX then MUSDC then addLiquidity, MAX approval, token sort by address',
        'useRemoveLiquidity.ts — no LP approval needed (_burn(msg.sender)), slider-based % removal',
        'usePoolShare — calculates share%, bdxAmount, musdcAmount from LP balance',
        'Liquidity page — Add tab (auto-paired amounts from pool ratio) + Remove tab (% slider with 25/50/75/MAX)',
        'Pool stats sidebar — live reserves, prices, fee, total LP',
        'Your position card — LP balance, pool share %, estimated token amounts',
        'Faucet page — ETH external link, MUSDC faucet() with 24h localStorage cooldown, Add to MetaMask',
      ]} />

      <H2 id="w3-problems">Problems & Solutions</H2>
      {WEEK3_PROBLEMS.map((p, i) => <Problem key={i} {...p} />)}
    </div>
  );
}

function Week2Log() {
  return (
    <div>
      <P>Built full Uniswap v2-style AMM from scratch. 40 tests, complete swap UI with approve-swap flow.</P>

      <H2 id="w2-built">What was built</H2>
      <Built items={[
        'Pool.sol — x*y=k AMM, LP tokens, 0.3% fee, slippage protection, price impact',
        'MockToken.sol — open-mint ERC20 for testnet (MUSDC), faucet() function',
        'PoolFactory.sol — deploy + track pools, bidirectional lookup, auto LP token naming',
        '40 unit + fuzz tests — 100% of core AMM paths covered',
        'Swap UI — live quotes, price impact, slippage settings, approve-swap state machine',
        'usePool + useSwap hooks — multicall reads, step-based write flow',
      ]} />

      <H2 id="w2-problems">Problems & Solutions</H2>
      {WEEK2_PROBLEMS.map((p, i) => <Problem key={i} {...p} />)}

      <H2 id="w2-gas">Gas Report</H2>
      <Table
        headers={['Function', 'Gas']}
        rows={[
          ['Pool.addLiquidity (first deposit)', '~380k'],
          ['Pool.addLiquidity (subsequent)',     '~85k'],
          ['Pool.swap',                          '~79k'],
          ['Pool.removeLiquidity',               '~76k'],
          ['PoolFactory.createPool',             '~1.4M (deploys Pool contract)'],
        ]}
      />
    </div>
  );
}

function Week1Log() {
  return (
    <div>
      <P>BDX ERC20 deployed to Sepolia, full Next.js frontend scaffold with wallet connect, live balance display, Vercel CI/CD — all in 7 days.</P>

      <H2 id="w1-built">What was built</H2>
      <Built items={[
        'Token.sol — ERC20 + ERC20Burnable + ERC20Permit + Ownable, 1B supply cap',
        '33 unit + fuzz tests — mint, burn, transfer, approve, edge cases',
        'Deploy.s.sol — Foundry deployment script with gas estimates',
        'Next.js 14 frontend — TypeScript, Tailwind CSS, app router',
        'wagmi v2 + RainbowKit — custom Alchemy transport, en-US locale',
        'GitHub Actions CI/CD + Vercel auto-deploy',
        'Jupiter-inspired dark UI — #0A0A0B bg, #C6F135 lime accent, icon-only sidebar',
      ]} />

      <H2 id="w1-problems">Problems & Solutions</H2>
      {WEEK1_PROBLEMS.map((p, i) => <Problem key={i} {...p} />)}

      <H2 id="w1-gas">Gas Report</H2>
      <Table
        headers={['Function', 'Gas']}
        rows={[
          ['Token deployment', '~1.2M'],
          ['Token.mint',       '~48k'],
          ['Token.transfer',   '~43k'],
          ['Token.burn',       '~25k'],
        ]}
      />
    </div>
  );
}

function Decisions() {
  return (
    <div>
      {DECISION_LIST.map((d, i) => (
        <div key={i} className="rounded-xl border border-[#26272C] bg-[#17181C] p-5 mb-4">
          <p className="text-sm font-semibold text-[#F2F2F3] mb-3">{d.title}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#55565D] mb-1">Decision</p>
          <p className="text-sm text-[#9A9DA6] mb-3">{d.decision}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#55565D] mb-1">Rationale</p>
          <p className="text-sm text-[#9A9DA6]">{d.rationale}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Data ──────────────────────────────────────────────────────────────────

const WEEK3_PROBLEMS = [
  {
    problem: 'Pool ABI missing allowance — useRemoveLiquidity tried to read LP allowance',
    solution: 'Pool.removeLiquidity calls _burn(msg.sender) directly, no allowance needed. Removed the read entirely.',
  },
  {
    problem: 'Token sort order mismatch — addLiquidity passed BDX/MUSDC in wrong order',
    solution: 'Pool sorts tokens canonically (lower address = token0). Added isBDXToken0 check then swap amount args accordingly.',
  },
  {
    problem: 'Auto-paired input broken on first deposit — division by zero on empty pool',
    solution: 'Added pool.hasLiquidity guard before calculating ratio. First deposit both inputs are independent.',
  },
];

const WEEK4_PROBLEMS = [
  {
    problem: 'Pool ABI missing allowance function — useRemoveLiquidity tried to read LP allowance',
    solution: 'Pool.removeLiquidity calls _burn(msg.sender) directly, no allowance needed. Removed the allowance read entirely.',
  },
  {
    problem: 'Token sort order mismatch — addLiquidity passing BDX/MUSDC in wrong order to pool',
    solution: 'Pool sorts tokens canonically (lower address = token0). Added isBDXToken0 check by comparing contract addresses, then swap amount0/amount1 args accordingly.',
  },
  {
    problem: 'Auto-paired input broken on first deposit — division by zero when reserves are empty',
    solution: 'Added pool.hasLiquidity guard before calculating ratio. On first deposit, both inputs are independent.',
  },
  {
    problem: 'TypeScript BigInt literal error TS2737 — target lower than ES2020',
    solution: 'Updated tsconfig.json: target ES2017 -> ES2020, lib esnext -> ES2020. BigInt literals (0n) require ES2020 minimum.',
  },
  {
    problem: 'bg-green (emerald) used everywhere — whole app looked "too green", not like Jupiter',
    solution: 'Split brand into two tokens: brand (#C6F135 lime) for CTAs, green (#4ADE80 emerald) for semantic positive. Swept all files replacing bg-green CTA -> bg-brand. Added neutral base-* colors removing green tint from cards and backgrounds.',
  },
  {
    problem: 'Sidebar icons looked custom/AI-generated, inconsistent quality',
    solution: 'Installed lucide-react. Replaced all inline SVGs with Lucide icons: LayoutDashboard, ArrowLeftRight, Droplets, Landmark, ShieldCheck, Sprout, Vote, Droplet, BookOpen — all strokeWidth={1.5}.',
  },
  {
    problem: 'Vercel build failed — react/no-unescaped-entities for " in JSX',
    solution: 'Replaced raw double quotes inside JSX text with HTML entity &quot;. JSX does not allow raw " in text nodes.',
  },
];

const WEEK2_PROBLEMS = [
  {
    problem: 'IERC20Metadata interface conflict in PoolFactory.sol — "Identifier already declared"',
    solution: "Removed inline interface. Imported OZ's IERC20Metadata via @openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol.",
  },
  {
    problem: 'assertLt(address, address) not found in forge-std — no overload for address type',
    solution: 'Cast both addresses to uint160: assertLt(uint160(t0), uint160(t1)). Foundry assertLt only supports uint256/int256.',
  },
  {
    problem: 'test_PriceImpact_SmallSwapIsLow failing — expected < 10 bps but got 30 bps',
    solution: '0.3% fee adds baseline impact even for tiny swaps. Adjusted threshold to < 50 bps which accurately reflects real behavior.',
  },
  {
    problem: 'useSwap allowance hook ABI type mismatch — dynamic ABI selection caused TS inference failure',
    solution: 'Split into two separate useReadContract hooks (one per token) with boolean flag. TS can now infer correct ABI type per hook.',
  },
];

const WEEK1_PROBLEMS = [
  {
    problem: 'forge install failed — "not a git repository"',
    solution: 'git init was never run. forge install requires git to add submodules. Fixed by running git init at repo root first.',
  },
  {
    problem: 'OpenZeppelin v5.7.0 crash — "Unknown evm version: osaka"',
    solution: 'Foundry 0.3.0 does not support osaka EVM version. Pinned OZ to v5.1.0 which is compatible.',
  },
  {
    problem: 'vm.prank cannot overwrite a prank — GitHub Actions Foundry nightly breaking change',
    solution: 'Removed vm.prank from setUp(). Token constructor takes initialOwner as param — no prank needed.',
  },
  {
    problem: 'Contract verification failing — Etherscan V1 API deprecated',
    solution: 'Updated foundry.toml to V2 API. Still failed via CLI. Verified manually: forge flatten | pbcopy then paste into Etherscan web UI.',
  },
  {
    problem: 'Vercel 404 after successful build — Next.js not found',
    solution: "Next.js is in frontend/ subfolder. Fixed by setting Root Directory = frontend in Vercel project settings.",
  },
  {
    problem: '"Hubungkan Dompet" — RainbowKit showing Indonesian',
    solution: 'RainbowKit auto-detects browser locale. Fixed by passing locale="en-US" to RainbowKitProvider.',
  },
];

const DECISION_LIST = [
  {
    title: 'Build AMM from scratch vs. fork Uniswap',
    decision: 'Built Pool.sol from scratch using the same x*y=k formula.',
    rationale: 'Portfolio goal is to demonstrate deep understanding of AMM math. Forking Uniswap hides the complexity. Building from scratch required implementing every edge case: sqrt LP mint, MINIMUM_LIQUIDITY, fee calculation, slippage protection.',
  },
  {
    title: 'OpenZeppelin v5.1.0 vs latest (v5.7.0)',
    decision: 'Pinned to OpenZeppelin v5.1.0.',
    rationale: 'OZ v5.7.0 introduced osaka EVM version which is not supported by Foundry 0.3.0. v5.1.0 gives stability while still providing all needed features.',
  },
  {
    title: 'wagmi v2 + RainbowKit vs Privy or ConnectKit',
    decision: 'Used wagmi v2 + RainbowKit v2.',
    rationale: 'wagmi is the industry standard with best TypeScript support and viem integration. RainbowKit provides polished wallet UI out of the box. Privy adds unnecessary auth layer complexity.',
  },
  {
    title: 'Neutral base colors vs green-tinted surfaces',
    decision: 'Switched from green-tinted base (#0C0F0C, #161C16) to neutral base (#0A0A0B, #17181C).',
    rationale: 'Green as a surface color made the entire app feel olive/tinted — too different from Jupiter. Per DESIGN.md: green is a signal color (5% of surface area), not a background fill. Neutral bases make the lime brand CTA pop correctly.',
  },
  {
    title: '24h MUSDC faucet limit — on-chain vs frontend',
    decision: 'Frontend-only limit using localStorage timestamp.',
    rationale: 'MockToken.faucet() is intentionally open for testnet. Adding on-chain cooldown would require modifying the contract and redeploying. localStorage is sufficient for UX — not a security boundary since this is testnet.',
  },
  {
    title: 'Max approval vs exact approval on swap',
    decision: 'Approve MAX_UINT256 on first approval.',
    rationale: 'Better UX — user only approves once per token. Acceptable security tradeoff for testnet. For mainnet production, would use permit() (EIP-2612) for gasless approvals.',
  },
];

// ─── Phase 2 / Phase 3 doc components ────────────────────────────────────

function ComingSoonBanner({ phase, timeline }: { phase: string; timeline: string }) {
  return (
    <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 mb-6 flex items-center gap-3">
      <div className="h-2 w-2 rounded-full bg-yellow-400 shrink-0" />
      <div>
        <p className="text-xs font-semibold text-yellow-400">{phase} — Coming Soon</p>
        <p className="text-xs text-[#9A9DA6] mt-0.5">{timeline}</p>
      </div>
    </div>
  );
}

function StakingDoc() {
  return (
    <div>
      <ComingSoonBanner phase="Phase 2" timeline="Weeks 5–8 of the 16-week build" />
      <P>BDX holders stake their tokens to earn protocol revenue distributed as BDX rewards. Stakers receive proportional rewards based on their share of the total staked pool. Optional lock periods provide boosted rewards.</P>

      <H2 id="staking-overview">Overview</H2>
      <Table headers={['Parameter', 'Value']} rows={[
        ['Staking token', 'BDX'],
        ['Reward token', 'BDX (self-compounding)'],
        ['Reward source', 'Protocol inflation + lending interest'],
        ['Lock options', 'None / 30d (1.2×) / 90d (1.5×) / 180d (2×)'],
        ['Distribution model', 'Synthetix rewardPerToken accumulator'],
      ]} />

      <H2 id="staking-math">Reward Math</H2>
      <P>Uses the &ldquo;rewards per token stored&rdquo; pattern for O(1) per-user updates:</P>
      <Code>{`rewardPerTokenStored += rewardRate × elapsed × 1e18 / totalStaked

earned(user) = effectiveStake × (rewardPerToken - rewardPerTokenPaid) / 1e18
             + pendingRewards

effectiveStake = staked × lockMultiplier / 1e18`}</Code>

      <H2 id="staking-functions">Contract Functions</H2>
      <FnList items={[
        { sig: 'stake(uint256 amount, uint256 lockDays)', mod: 'external nonReentrant', desc: 'Stake BDX with optional lock. lockDays: 0, 30, 90, or 180.' },
        { sig: 'unstake(uint256 amount)', mod: 'external nonReentrant', desc: 'Unstake BDX. Reverts if lock has not expired.' },
        { sig: 'claimRewards()', mod: 'external nonReentrant', desc: 'Claim accumulated BDX rewards without unstaking.' },
        { sig: 'emergencyWithdraw()', mod: 'external nonReentrant', desc: 'Withdraw all BDX immediately, forfeiting pending rewards.' },
        { sig: 'pendingRewards(address user)', mod: 'external view', desc: 'Read claimable rewards for an address.' },
        { sig: 'getStakeInfo(address user)', mod: 'external view', desc: 'Read staked amount, lock end, multiplier, pending rewards.' },
        { sig: 'notifyRewardAmount(uint256 reward)', mod: 'external onlyOwner', desc: 'Fund a new reward period.' },
      ]} />

      <H2 id="staking-frontend">Frontend Hooks</H2>
      <Code>{`useStaking(address)    → { staked, lockEnd, pending, aprPct, isLocked, ... }
useStakingActions(address) → { stake, unstake, claimRewards, emergencyWithdraw, step, ... }`}</Code>

      <Callout type="info">Staking.sol contract will be deployed at NEXT_PUBLIC_STAKING_ADDRESS once Phase 2 begins.</Callout>
    </div>
  );
}

function FarmingDoc() {
  return (
    <div>
      <ComingSoonBanner phase="Phase 2" timeline="Weeks 5–8 of the 16-week build" />
      <P>Liquidity providers stake LP tokens in farming pools to earn BDX rewards on top of the 0.3% swap fees they already receive. Based on the MasterChef v1 pattern (Sushi/PancakeSwap style).</P>

      <H2 id="farming-overview">Overview</H2>
      <Table headers={['Parameter', 'Value']} rows={[
        ['Staking token', 'LP tokens (BDX/MUSDC or BDX/WETH)'],
        ['Reward token', 'BDX'],
        ['Distribution', 'bdxPerBlock shared proportionally by allocPoint'],
        ['Initial pools', 'BDX/MUSDC (100 pts), BDX/WETH (60 pts)'],
      ]} />

      <H2 id="farming-math">MasterChef Math</H2>
      <Code>{`// BDX awarded to a pool per block:
poolBdxPerBlock = bdxPerBlock × pool.allocPoint / totalAllocPoint

// Accumulator updated on each interaction:
accBDXPerShare += poolBdxPerBlock × blocksSinceLastReward × 1e12 / lpSupply

// User pending rewards:
pending = user.amount × accBDXPerShare / 1e12 - user.rewardDebt`}</Code>

      <H2 id="farming-functions">Contract Functions</H2>
      <FnList items={[
        { sig: 'deposit(uint256 pid, uint256 amount)', mod: 'external nonReentrant', desc: 'Deposit LP tokens to earn BDX. Also harvests pending rewards.' },
        { sig: 'withdraw(uint256 pid, uint256 amount)', mod: 'external nonReentrant', desc: 'Withdraw LP tokens. Also harvests pending rewards.' },
        { sig: 'harvest(uint256 pid)', mod: 'external nonReentrant', desc: 'Claim BDX rewards without withdrawing LP tokens.' },
        { sig: 'emergencyWithdraw(uint256 pid)', mod: 'external nonReentrant', desc: 'Withdraw LP immediately, forfeiting pending rewards.' },
        { sig: 'pendingBDX(uint256 pid, address user)', mod: 'external view', desc: 'Read pending BDX for a user in a specific pool.' },
        { sig: 'add(uint256 allocPoint, IERC20 lpToken, bool withUpdate)', mod: 'external onlyOwner', desc: 'Add a new LP pool.' },
        { sig: 'set(uint256 pid, uint256 allocPoint, bool withUpdate)', mod: 'external onlyOwner', desc: 'Update allocation points for a pool.' },
      ]} />

      <H2 id="farming-pools">Initial Farm Pools</H2>
      <Table headers={['PID', 'LP Token', 'Alloc Points', 'Notes']} rows={[
        ['0', 'BDX/MUSDC LP', '100', 'Primary pool — highest weight'],
        ['1', 'BDX/WETH LP', '60', 'Secondary pool'],
      ]} />

      <Callout type="info">MasterChef.sol will be deployed at NEXT_PUBLIC_MASTERCHEF_ADDRESS once Phase 2 begins.</Callout>
    </div>
  );
}

function VestingDoc() {
  return (
    <div>
      <ComingSoonBanner phase="Phase 2" timeline="Weeks 7–8 of the 16-week build" />
      <P>Token vesting schedules for team, seed investors, and ecosystem allocations. Beneficiaries can claim linearly vested BDX after the cliff period.</P>

      <H2 id="vesting-overview">Overview</H2>
      <P>Uses a cliff + linear vesting model. Tokens are locked until the cliff expires, then vest linearly over the duration period.</P>

      <H2 id="vesting-schedule">Vesting Schedule</H2>
      <Table headers={['Allocation', 'Amount', 'Cliff', 'Duration']} rows={[
        ['Team (15%)', '150M BDX', '12 months', '36 months linear'],
        ['Seed (4%)', '40M BDX', '6 months', '18 months linear'],
        ['Ecosystem (16%)', '160M BDX', '3 months', '24 months linear'],
        ['Treasury (25%)', '250M BDX', 'None', 'DAO-governed release'],
        ['Community (40%)', '400M BDX', 'None', 'Farming + staking rewards'],
      ]} />

      <H2 id="vesting-functions">Contract Functions</H2>
      <FnList items={[
        { sig: 'createVestingSchedule(address beneficiary, uint256 start, uint256 cliff, uint256 duration, uint256 amount)', mod: 'external onlyOwner', desc: 'Create a vesting schedule for a beneficiary.' },
        { sig: 'release(address beneficiary)', mod: 'external', desc: 'Release vested tokens to the beneficiary.' },
        { sig: 'revoke(address beneficiary)', mod: 'external onlyOwner', desc: 'Revoke unvested tokens (returns to owner).' },
        { sig: 'computeReleasableAmount(address beneficiary)', mod: 'external view', desc: 'Read how many tokens are claimable right now.' },
        { sig: 'getVestingSchedule(address beneficiary)', mod: 'external view', desc: 'Read full vesting schedule details.' },
      ]} />
    </div>
  );
}

function GovernanceDoc() {
  return (
    <div>
      <ComingSoonBanner phase="Phase 3" timeline="Weeks 9–12 of the 16-week build" />
      <P>On-chain governance using the OpenZeppelin Governor framework. BDX holders propose, vote on, and execute protocol changes via a time-locked DAO. Requires Token.sol upgrade to add ERC20Votes support.</P>

      <H2 id="gov-overview">Overview</H2>
      <Table headers={['Parameter', 'Value']} rows={[
        ['Voting delay', '7200 blocks (~1 day)'],
        ['Voting period', '50400 blocks (~1 week)'],
        ['Proposal threshold', '10,000 BDX to propose'],
        ['Quorum', '4% of total supply'],
        ['Timelock delay', '172800 seconds (2 days)'],
      ]} />

      <H2 id="gov-flow">Proposal Flow</H2>
      <Code>{`1. propose()        → Pending (voting delay)
2. castVote()       → Active  (voting period)
3. queue()          → Queued  (timelock delay: 2 days)
4. execute()        → Executed

Vote options: 0 = Against, 1 = For, 2 = Abstain`}</Code>

      <H2 id="gov-params">Key Functions</H2>
      <FnList items={[
        { sig: 'propose(address[] targets, uint256[] values, bytes[] calldatas, string description)', mod: 'external', desc: 'Create a new proposal. Requires ≥ 10,000 BDX.' },
        { sig: 'castVote(uint256 proposalId, uint8 support)', mod: 'external', desc: 'Cast a vote. support: 0=Against, 1=For, 2=Abstain.' },
        { sig: 'castVoteWithReason(uint256 proposalId, uint8 support, string reason)', mod: 'external', desc: 'Cast vote with an on-chain reason string.' },
        { sig: 'queue(...)', mod: 'external', desc: 'Queue a Succeeded proposal into the Timelock.' },
        { sig: 'execute(...)', mod: 'external', desc: 'Execute a Queued proposal after timelock expires.' },
        { sig: 'state(uint256 proposalId)', mod: 'external view', desc: 'Read ProposalState enum for a proposal.' },
        { sig: 'proposalVotes(uint256 proposalId)', mod: 'external view', desc: 'Read against/for/abstain vote counts.' },
      ]} />

      <H2 id="gov-delegation">Delegation Required</H2>
      <P>BDX voting power must be delegated before it counts toward votes. Token holders who have not delegated have zero voting power even if they hold BDX.</P>
      <Code>{`// Self-delegate (most users do this once)
bdxToken.delegate(msg.sender);

// Delegate to another address
bdxToken.delegate(delegateeAddress);`}</Code>

      <H2 id="gov-token">Token.sol Upgrade Required</H2>
      <Callout type="warning">
        Governance requires Token.sol to be redeployed with ERC20Votes extension.
        This is a breaking change. A migration path (old BDX → new BDX 1:1) will be needed.
      </Callout>
    </div>
  );
}

function RouterDoc() {
  return (
    <div>
      <ComingSoonBanner phase="Phase 3" timeline="Weeks 9–12 of the 16-week build" />
      <P>The Router contract adds transaction deadlines, multi-hop swap routing (e.g. MUSDC → BDX → WETH), and native ETH handling. Currently users interact with Pool.sol directly — the Router provides a safer, more feature-rich interface.</P>

      <H2 id="router-overview">What Changes</H2>
      <Table headers={['Feature', 'Direct Pool', 'With Router']} rows={[
        ['Deadline protection', '❌ None', '✅ Reverts if expired'],
        ['Multi-hop swaps', '❌ Manual', '✅ path[] parameter'],
        ['Native ETH input', '❌ Must wrap manually', '✅ Auto-wrapped'],
        ['Exact output swaps', '❌ Not supported', '✅ swapTokensForExactTokens'],
      ]} />

      <H2 id="router-paths">Supported Swap Paths (After Router)</H2>
      <Table headers={['From', 'To', 'Path', 'Hops']} rows={[
        ['MUSDC', 'BDX', 'MUSDC → BDX', '1'],
        ['BDX', 'MUSDC', 'BDX → MUSDC', '1'],
        ['MUSDC', 'WETH', 'MUSDC → BDX → WETH', '2'],
        ['ETH', 'BDX', 'ETH → WETH → BDX', 'wrap + 1'],
        ['ETH', 'MUSDC', 'ETH → WETH → BDX → MUSDC', 'wrap + 2'],
      ]} />

      <H2 id="router-functions">Key Functions</H2>
      <FnList items={[
        { sig: 'swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline)', mod: 'external', desc: 'Swap exact input through a path of pools.' },
        { sig: 'swapTokensForExactTokens(uint amountOut, uint amountInMax, address[] path, address to, uint deadline)', mod: 'external', desc: 'Spend as little as needed to receive exact output.' },
        { sig: 'swapExactETHForTokens(uint amountOutMin, address[] path, address to, uint deadline)', mod: 'external payable', desc: 'Auto-wrap ETH and swap.' },
        { sig: 'addLiquidity(address tokenA, address tokenB, ...amounts, address to, uint deadline)', mod: 'external', desc: 'Add liquidity with deadline protection.' },
        { sig: 'getAmountsOut(uint amountIn, address[] path)', mod: 'external view', desc: 'Simulate multi-hop output amounts.' },
      ]} />

      <H2 id="router-deadline">Deadline Protection</H2>
      <Code>{`// All swap/liquidity functions include:
modifier ensure(uint256 deadline) {
    require(block.timestamp <= deadline, 'EXPIRED');
    _;
}

// Frontend sets 20-minute deadline by default:
const deadline = Math.floor(Date.now() / 1000) + 20 * 60;`}</Code>
    </div>
  );
}

function FlashLoanDoc() {
  return (
    <div>
      <ComingSoonBanner phase="Phase 3" timeline="Weeks 11–12 of the 16-week build" />
      <P>Flash loans allow borrowing any amount of tokens within a single transaction, with no collateral required. The borrowed amount plus fee must be repaid before the transaction ends or it reverts entirely.</P>

      <H2 id="flash-overview">Use Cases</H2>
      <Table headers={['Use Case', 'Description']} rows={[
        ['Arbitrage', 'Exploit price differences between pools without capital'],
        ['Liquidations', 'Liquidate undercollateralized Lending positions atomically'],
        ['Collateral swap', 'Replace one type of collateral with another in one tx'],
      ]} />

      <H2 id="flash-interface">Receiver Interface</H2>
      <P>To use a flash loan, the caller must implement the IFlashLoanReceiver interface:</P>
      <Code>{`interface IFlashLoanReceiver {
    function executeOperation(
        address token,
        uint256 amount,
        uint256 fee,       // amount to repay above borrowed
        bytes calldata data
    ) external returns (bool);
}

// Usage:
pool.flashLoan(
    receiverAddress,
    tokenAddress,
    amount,
    abi.encode(myData)  // arbitrary bytes passed to executeOperation
);`}</Code>

      <H2 id="flash-fee">Fee Structure</H2>
      <Table headers={['Parameter', 'Value']} rows={[
        ['Flash loan fee', '0.09%'],
        ['Fee destination', 'Protocol reserve (reserveBalance)'],
        ['Repayment', 'Must repay amount + fee in same transaction'],
        ['Failure behavior', 'Entire transaction reverts if repayment fails'],
      ]} />
    </div>
  );
}
