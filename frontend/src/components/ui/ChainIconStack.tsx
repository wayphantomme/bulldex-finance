import { cn } from '@/utils/cn';

// ─── Token Terminal chain icon stack spec:
// Multiple chain icons overlap: ml-[-6px] per icon after first
// Max visible: 3, overflow: "+N" text badge
// Size: w-4 h-4 (16px) in table, w-5 h-5 in larger contexts

// ─── Chain metadata ───────────────────────────────────────────────────────────

export interface ChainInfo {
  id:     string;
  name:   string;
  logo?:  string;
  color?: string;  // fallback bg color
}

// Common chain colors for fallback
const CHAIN_COLORS: Record<string, string> = {
  ethereum:  '#627EEA',
  base:      '#0052FF',
  arbitrum:  '#12AAFF',
  optimism:  '#FF0420',
  polygon:   '#8247E5',
  bnb:       '#F3BA2F',
  avalanche: '#E84142',
  solana:    '#9945FF',
  sepolia:   '#627EEA',
};

// ─── Single chain icon ────────────────────────────────────────────────────────

function ChainIcon({
  chain,
  size,
  overlap,
}: {
  chain: ChainInfo;
  size: number;
  overlap: boolean;
}) {
  const bgColor = chain.color ?? CHAIN_COLORS[chain.id.toLowerCase()] ?? '#262626';

  return (
    <div
      className={cn(
        'rounded-full overflow-hidden border-2 border-[#0d0d0d] shrink-0',
        overlap && 'ml-[-6px]',
      )}
      style={{ width: size, height: size, backgroundColor: bgColor }}
      title={chain.name}
      aria-label={chain.name}
    >
      {chain.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={chain.logo}
          alt={chain.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center text-white font-bold"
          style={{ fontSize: size * 0.4 }}
          aria-hidden="true"
        >
          {chain.name.slice(0, 1).toUpperCase()}
        </span>
      )}
    </div>
  );
}

// ─── ChainIconStack ───────────────────────────────────────────────────────────

export interface ChainIconStackProps {
  chains:      ChainInfo[];
  maxVisible?: number;
  size?:       number;      // px, default 16
  className?:  string;
}

export function ChainIconStack({
  chains,
  maxVisible = 3,
  size = 16,
  className,
}: ChainIconStackProps) {
  const visible  = chains.slice(0, maxVisible);
  const overflow = chains.length - maxVisible;

  if (chains.length === 0) {
    return <span className="text-[11px] text-[#525252]">—</span>;
  }

  return (
    <div
      className={cn('flex items-center', className)}
      role="img"
      aria-label={`Chains: ${chains.map((c) => c.name).join(', ')}`}
    >
      {visible.map((chain, i) => (
        <ChainIcon
          key={chain.id}
          chain={chain}
          size={size}
          overlap={i > 0}
        />
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            'ml-[-6px] flex items-center justify-center rounded-full border-2 border-[#0d0d0d] bg-[#1e1e1e] shrink-0',
          )}
          style={{ width: size, height: size }}
          aria-hidden="true"
        >
          <span
            className="font-mono text-[#a3a3a3]"
            style={{ fontSize: size * 0.38 }}
          >
            +{overflow}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Helper: build ChainInfo from chain name/id ───────────────────────────────

export function chainInfo(id: string, name?: string, logo?: string): ChainInfo {
  return { id, name: name ?? id, logo, color: CHAIN_COLORS[id.toLowerCase()] };
}
