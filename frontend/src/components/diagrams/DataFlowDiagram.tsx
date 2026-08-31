// Animated diagram: Blockchain → Database flow
export const DataFlowDiagram = () => {
  return (
    <svg width="280" height="180" viewBox="0 0 280 180" fill="none" className="mx-auto">
      {/* Icons on the left (blockchain nodes) */}
      <g className="animate-pulse-slow">
        <circle cx="40" cy="50" r="14" stroke="#404040" strokeWidth="2" fill="#0d0d0d" />
        <text x="40" y="56" fontSize="16" fill="#525252" textAnchor="middle">◆</text>
      </g>
      
      <g className="animate-pulse-slow" style={{ animationDelay: '0.3s' }}>
        <circle cx="40" cy="90" r="14" stroke="#404040" strokeWidth="2" fill="#0d0d0d" />
        <text x="40" y="96" fontSize="16" fill="#525252" textAnchor="middle">◆</text>
      </g>
      
      <g className="animate-pulse-slow" style={{ animationDelay: '0.6s' }}>
        <circle cx="40" cy="130" r="14" stroke="#404040" strokeWidth="2" fill="#0d0d0d" />
        <text x="40" y="136" fontSize="16" fill="#525252" textAnchor="middle">B</text>
      </g>

      {/* Animated dashed lines connecting to database */}
      <line 
        x1="54" y1="50" x2="110" y2="85" 
        stroke="#404040" 
        strokeWidth="1.5" 
        strokeDasharray="4 4"
        className="animate-dash"
      />
      <line 
        x1="54" y1="90" x2="110" y2="90" 
        stroke="#404040" 
        strokeWidth="1.5" 
        strokeDasharray="4 4"
        className="animate-dash"
        style={{ animationDelay: '0.3s' }}
      />
      <line 
        x1="54" y1="130" x2="110" y2="95" 
        stroke="#404040" 
        strokeWidth="1.5" 
        strokeDasharray="4 4"
        className="animate-dash"
        style={{ animationDelay: '0.6s' }}
      />

      {/* Database cylinder (petabyte storage) */}
      <g className="animate-float">
        <ellipse cx="150" cy="75" rx="35" ry="12" stroke="#10b981" strokeWidth="2" fill="#064e3b" fillOpacity="0.2" />
        <line x1="115" y1="75" x2="115" y2="115" stroke="#10b981" strokeWidth="2" />
        <line x1="185" y1="75" x2="185" y2="115" stroke="#10b981" strokeWidth="2" />
        <ellipse cx="150" cy="75" rx="35" ry="12" stroke="#10b981" strokeWidth="2" fill="none" />
        <ellipse cx="150" cy="115" rx="35" ry="12" stroke="#10b981" strokeWidth="2" fill="#064e3b" fillOpacity="0.2" />
        
        {/* Data lines inside */}
        <line x1="130" y1="85" x2="170" y2="85" stroke="#10b981" strokeWidth="1.5" opacity="0.4" />
        <line x1="130" y1="95" x2="165" y2="95" stroke="#10b981" strokeWidth="1.5" opacity="0.4" />
        <line x1="130" y1="105" x2="160" y2="105" stroke="#10b981" strokeWidth="1.5" opacity="0.4" />
      </g>

      {/* Arrow to output */}
      <line 
        x1="185" y1="90" x2="220" y2="90" 
        stroke="#525252" 
        strokeWidth="2" 
        markerEnd="url(#arrowhead)"
      />
      
      {/* Output indicator */}
      <rect x="220" y="80" width="40" height="20" rx="4" stroke="#404040" strokeWidth="2" fill="#111111" />
      <text x="240" y="94" fontSize="12" fill="#a3a3a3" textAnchor="middle">API</text>

      {/* Arrow marker definition */}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#525252" />
        </marker>
      </defs>
    </svg>
  );
};
