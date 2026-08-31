// Animated diagram 1: Blockchain → Database flow (Trustless by design)
export const DataFlowDiagram = () => {
  return (
    <svg width="260" height="160" viewBox="0 0 260 160" fill="none" className="mx-auto">
      {/* Blockchain nodes on the left */}
      <g style={{ animation: 'pulse 2s ease-in-out infinite' }}>
        <circle cx="30" cy="45" r="12" stroke="#404040" strokeWidth="2" fill="#0d0d0d" />
        <path d="M30 40 L33 45 L30 50 L27 45 Z" fill="#525252" />
      </g>
      
      <g style={{ animation: 'pulse 2s ease-in-out infinite 0.3s' }}>
        <circle cx="30" cy="80" r="12" stroke="#404040" strokeWidth="2" fill="#0d0d0d" />
        <circle cx="30" cy="80" r="4" fill="#525252" />
      </g>
      
      <g style={{ animation: 'pulse 2s ease-in-out infinite 0.6s' }}>
        <circle cx="30" cy="115" r="12" stroke="#404040" strokeWidth="2" fill="#0d0d0d" />
        <rect x="25" y="110" width="10" height="10" fill="#525252" />
      </g>

      {/* Animated dashed lines */}
      <line 
        x1="42" y1="45" x2="95" y2="70" 
        stroke="#404040" 
        strokeWidth="1.5" 
        strokeDasharray="3 3"
        style={{ animation: 'dash 1.5s linear infinite' }}
      />
      <line 
        x1="42" y1="80" x2="95" y2="80" 
        stroke="#404040" 
        strokeWidth="1.5" 
        strokeDasharray="3 3"
        style={{ animation: 'dash 1.5s linear infinite 0.3s' }}
      />
      <line 
        x1="42" y1="115" x2="95" y2="90" 
        stroke="#404040" 
        strokeWidth="1.5" 
        strokeDasharray="3 3"
        style={{ animation: 'dash 1.5s linear infinite 0.6s' }}
      />

      {/* Database cylinder with glow */}
      <g style={{ animation: 'float 3s ease-in-out infinite' }}>
        <ellipse cx="135" cy="65" rx="32" ry="10" stroke="#10b981" strokeWidth="2" fill="#064e3b" fillOpacity="0.15" />
        <line x1="103" y1="65" x2="103" y2="95" stroke="#10b981" strokeWidth="2" />
        <line x1="167" y1="65" x2="167" y2="95" stroke="#10b981" strokeWidth="2" />
        <ellipse cx="135" cy="95" rx="32" ry="10" stroke="#10b981" strokeWidth="2" fill="#064e3b" fillOpacity="0.15" />
        
        {/* Data flow lines inside */}
        <line x1="115" y1="72" x2="155" y2="72" stroke="#10b981" strokeWidth="1.5" opacity="0.3">
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />
        </line>
        <line x1="115" y1="80" x2="150" y2="80" stroke="#10b981" strokeWidth="1.5" opacity="0.3">
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" begin="0.3s" repeatCount="indefinite" />
        </line>
        <line x1="115" y1="88" x2="145" y2="88" stroke="#10b981" strokeWidth="1.5" opacity="0.3">
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" begin="0.6s" repeatCount="indefinite" />
        </line>
      </g>

      {/* Arrow flow */}
      <path d="M167 80 L200 80" stroke="#525252" strokeWidth="2" markerEnd="url(#arrow1)" />
      
      {/* Smart Contract box */}
      <rect x="200" y="70" width="50" height="20" rx="3" stroke="#404040" strokeWidth="2" fill="#111111" />
      <text x="225" y="83" fontSize="10" fill="#a3a3a3" textAnchor="middle" fontFamily="monospace">Contract</text>

      <defs>
        <marker id="arrow1" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#525252" />
        </marker>
      </defs>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes dash {
          to { stroke-dashoffset: -20; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </svg>
  );
};

// Animated diagram 2: Protocol standardization (Composable DeFi)
export const StandardizedDiagram = () => {
  return (
    <svg width="260" height="160" viewBox="0 0 260 160" fill="none" className="mx-auto">
      {/* Input protocols (left side) */}
      <g>
        <rect x="20" y="30" width="50" height="18" rx="3" stroke="#404040" strokeWidth="1.5" fill="#111111" />
        <text x="45" y="42" fontSize="9" fill="#525252" textAnchor="middle">Uniswap</text>
      </g>
      <g>
        <rect x="20" y="58" width="50" height="18" rx="3" stroke="#404040" strokeWidth="1.5" fill="#111111" />
        <text x="45" y="70" fontSize="9" fill="#525252" textAnchor="middle">Aave</text>
      </g>
      <g>
        <rect x="20" y="86" width="50" height="18" rx="3" stroke="#404040" strokeWidth="1.5" fill="#111111" />
        <text x="45" y="98" fontSize="9" fill="#525252" textAnchor="middle">Compound</text>
      </g>
      <g>
        <rect x="20" y="114" width="50" height="18" rx="3" stroke="#404040" strokeWidth="1.5" fill="#111111" />
        <text x="45" y="126" fontSize="9" fill="#525252" textAnchor="middle">Curve</text>
      </g>

      {/* Animated arrows to processor */}
      {[39, 67, 95, 123].map((y, i) => (
        <g key={i}>
          <path 
            d={`M70 ${y} L100 80`} 
            stroke="#10b981" 
            strokeWidth="1.5" 
            opacity="0.5"
            style={{ animation: `flowIn 2s ease-in-out infinite ${i * 0.2}s` }}
          />
        </g>
      ))}

      {/* Central processor (normalization engine) */}
      <g style={{ animation: 'glow 2s ease-in-out infinite' }}>
        <circle cx="130" cy="80" r="28" stroke="#10b981" strokeWidth="2" fill="#064e3b" fillOpacity="0.2" />
        <path d="M120 75 L125 80 L120 85" stroke="#10b981" strokeWidth="2" fill="none" />
        <path d="M130 75 L135 80 L130 85" stroke="#10b981" strokeWidth="2" fill="none" />
        <path d="M140 75 L145 80 L140 85" stroke="#10b981" strokeWidth="2" fill="none" />
      </g>

      {/* Output standardized metrics (right side) */}
      {[30, 65, 100, 135].map((y, i) => (
        <g key={i}>
          <path 
            d={`M158 80 L180 ${y + 8}`} 
            stroke="#10b981" 
            strokeWidth="1.5" 
            opacity="0.5"
            style={{ animation: `flowOut 2s ease-in-out infinite ${i * 0.2 + 0.5}s` }}
          />
          <rect x="180" y={y} width="60" height="16" rx="3" stroke="#10b981" strokeWidth="1.5" fill="#064e3b" fillOpacity="0.1" />
          <text x="210" y={y + 11} fontSize="8" fill="#10b981" textAnchor="middle" fontFamily="monospace">
            {['TVL', 'Volume', 'Fees', 'Users'][i]}
          </text>
        </g>
      ))}

      <style>{`
        @keyframes flowIn {
          0% { opacity: 0.2; stroke-dasharray: 60; stroke-dashoffset: 60; }
          50% { opacity: 0.8; }
          100% { opacity: 0.2; stroke-dashoffset: 0; }
        }
        @keyframes flowOut {
          0% { opacity: 0.2; stroke-dasharray: 40; stroke-dashoffset: 40; }
          50% { opacity: 0.8; }
          100% { opacity: 0.2; stroke-dashoffset: 0; }
        }
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(16, 185, 129, 0.3)); }
          50% { filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.6)); }
        }
      `}</style>
    </svg>
  );
};

// Animated diagram 3: Dashboard interface (Transparent and verifiable)
export const DashboardDiagram = () => {
  return (
    <svg width="260" height="160" viewBox="0 0 260 160" fill="none" className="mx-auto">
      {/* Browser window frame */}
      <rect x="20" y="20" width="220" height="120" rx="6" stroke="#404040" strokeWidth="2" fill="#111111" />
      
      {/* Browser chrome */}
      <rect x="20" y="20" width="220" height="20" rx="6" fill="#1a1a1a" />
      <circle cx="32" cy="30" r="3" fill="#ef4444" opacity="0.6" />
      <circle cx="42" cy="30" r="3" fill="#f59e0b" opacity="0.6" />
      <circle cx="52" cy="30" r="3" fill="#10b981" opacity="0.6" />

      {/* Sidebar navigation */}
      <rect x="30" y="50" width="40" height="8" rx="2" fill="#1a1a1a" />
      <rect x="30" y="63" width="35" height="6" rx="2" fill="#1a1a1a" opacity="0.5" />
      <rect x="30" y="73" width="38" height="6" rx="2" fill="#1a1a1a" opacity="0.5" />
      <rect x="30" y="83" width="32" height="6" rx="2" fill="#1a1a1a" opacity="0.5" />

      {/* Main content area with animated chart */}
      <g>
        {/* Chart bars */}
        {[85, 100, 115, 130, 145, 160, 175, 190, 205].map((x, i) => {
          const heights = [25, 35, 28, 42, 38, 50, 45, 48, 52];
          return (
            <rect
              key={i}
              x={x}
              y={120 - heights[i]}
              width="12"
              height={heights[i]}
              rx="2"
              fill="#10b981"
              opacity="0.6"
              style={{ 
                animation: `barGrow 1.5s ease-out ${i * 0.1}s backwards`,
                transformOrigin: `${x + 6}px 120px`
              }}
            />
          );
        })}

        {/* Animated line chart overlay */}
        <polyline
          points="91,95 106,85 121,92 136,78 151,82 166,70 181,75 196,72 211,68"
          stroke="#3b82f6"
          strokeWidth="2"
          fill="none"
          opacity="0.8"
          style={{ 
            strokeDasharray: 200,
            strokeDashoffset: 200,
            animation: 'drawLine 2s ease-out 0.5s forwards'
          }}
        />
        
        {/* Data points */}
        {[91, 106, 121, 136, 151, 166, 181, 196, 211].map((x, i) => {
          const yPoints = [95, 85, 92, 78, 82, 70, 75, 72, 68];
          return (
            <circle
              key={i}
              cx={x}
              cy={yPoints[i]}
              r="3"
              fill="#3b82f6"
              style={{ animation: `dotAppear 0.3s ease-out ${1.5 + i * 0.1}s backwards` }}
            />
          );
        })}
      </g>

      {/* Stats cards at top */}
      <rect x="85" y="50" width="45" height="18" rx="3" fill="#1a1a1a" />
      <text x="92" y="57" fontSize="7" fill="#525252">TVL</text>
      <text x="92" y="65" fontSize="9" fill="#10b981" fontFamily="monospace">$2.9M</text>

      <rect x="140" y="50" width="45" height="18" rx="3" fill="#1a1a1a" />
      <text x="147" y="57" fontSize="7" fill="#525252">Volume</text>
      <text x="147" y="65" fontSize="9" fill="#10b981" fontFamily="monospace">$29K</text>

      <rect x="195" y="50" width="35" height="18" rx="3" fill="#1a1a1a" />
      <text x="202" y="57" fontSize="7" fill="#525252">APY</text>
      <text x="202" y="65" fontSize="9" fill="#10b981" fontFamily="monospace">24%</text>

      <style>{`
        @keyframes barGrow {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
        @keyframes dotAppear {
          from { opacity: 0; transform: scale(0); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </svg>
  );
};
