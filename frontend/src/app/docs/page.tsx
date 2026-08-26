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
    label: 'Smart Contracts',
    items: [
      { id: 'token',     label: 'Token (BDX)' },
      { id: 'pool',      label: 'Pool (AMM)' },
      { id: 'factory',   label: 'PoolFactory' },
      { id: 'mocktoken', label: 'MockToken' },
    ],
  },
  {
    label: 'Frontend',
    items: [
      { id: 'architecture', label: 'Architecture' },
      { id: 'hooks',        label: 'Hooks' },
      { id: 'swap-flow',    label: 'Swap Flow' },
    ],
  },
  {
    label: 'Dev Log',
    items: [
      { id: 'week4', label: 'Week 3-4 | Liquidity + Design' },
      { id: 'week2', label: 'Week 2 | AMM Swap' },
      { id: 'week1', label: 'Week 1 | Foundation' },
    ],
  },
  {
    label: 'Decisions',
    items: [
      { id: 'decisions', label: 'Technical Decisions' },
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
  token: [
    { id: 'token-params',    label: 'Key Parameters' },
    { id: 'token-functions', label: 'Functions' },
    { id: 'token-errors',    label: 'Custom Errors' },
  ],
  pool: [
    { id: 'pool-formula',    label: 'Formula' },
    { id: 'pool-functions',  label: 'Functions' },
    { id: 'pool-security',   label: 'Security' },
  ],
  week4: [
    { id: 'w4-built',     label: 'What was built' },
    { id: 'w4-problems',  label: 'Problems & Solutions' },
  ],
  week2: [
    { id: 'w2-built',     label: 'What was built' },
    { id: 'w2-problems',  label: 'Problems & Solutions' },
    { id: 'w2-gas',       label: 'Gas Report' },
  ],
  week1: [
    { id: 'w1-built',     label: 'What was built' },
    { id: 'w1-problems',  label: 'Problems & Solutions' },
    { id: 'w1-gas',       label: 'Gas Report' },
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
                  <span className="text-[11px] font-medium uppercase tracking-widest text-[#55565D]">
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
    case 'token':        return <TokenDoc />;
    case 'pool':         return <PoolDoc />;
    case 'factory':      return <FactoryDoc />;
    case 'mocktoken':    return <MockTokenDoc />;
    case 'architecture': return <ArchitectureDoc />;
    case 'hooks':        return <HooksDoc />;
    case 'swap-flow':    return <SwapFlowDoc />;
    case 'week4':        return <Week4Log />;
    case 'week2':        return <Week2Log />;
    case 'week1':        return <Week1Log />;
    case 'decisions':    return <Decisions />;
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
          ['Network',   'Sepolia Testnet (chain 11155111)'],
          ['Tests',     '73 passing (33 Token + 40 Pool)'],
          ['Contracts', 'Token, MockToken, Pool, PoolFactory'],
          ['Frontend',  'Next.js 14, wagmi v2, RainbowKit v2'],
          ['Status',    'Week 3-4 complete — Liquidity UI live'],
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
        <li>• LP token name auto-generated: "Bulldex BDX/MUSDC LP"</li>
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
      <P>Built full liquidity UI, faucet page, and Jupiter-style design upgrade.</P>

      <H2 id="w4-built">What was built</H2>
      <Built items={[
        'usePoolStats.ts — multicall 7 reads, isBDXToken0 detection, formatted reserves/prices, K/M formatting',
        'useAddLiquidity.ts — sequential approve BDX then MUSDC then addLiquidity, MAX approval, token sort by address',
        'useRemoveLiquidity.ts — no LP approval needed, slider-based % removal',
        'usePoolShare — calculates share%, bdxAmount, musdcAmount from LP balance',
        'Liquidity page — Add tab (auto-paired amounts) + Remove tab (% slider with quick buttons)',
        'Pool stats sidebar — live reserves, prices, fee, total LP',
        'Faucet page — ETH external link, MUSDC faucet() with 24h localStorage cooldown + countdown, Add to MetaMask',
        'Design upgrade (Phase 1-4) — neutral base colors, dot-grid background, lime brand accent, Lucide icons sidebar',
        'Token distribution progress bars, roadmap status dots, bento landing page',
      ]} />

      <H2 id="w4-problems">Problems & Solutions</H2>
      {WEEK4_PROBLEMS.map((p, i) => <Problem key={i} {...p} />)}
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
