
import React from 'react';

type Step = {
  id: string;
  title: string;
  subtitle?: string;
  fill: string;
  textColor: string;
  stroke?: string;
};

const steps: Step[] = [
  {
    id: 'institutional-decision',
    title: 'Institutional Decision',
    subtitle: '(Dark Pools)',
    fill: '#10b981', // emerald-500
    textColor: '#ffffff',
  },
  {
    id: 'algo-execution',
    title: 'Algo Execution',
    subtitle: '(Sliced Orders)',
    fill: '#f3f4f6', // gray-100
    textColor: '#111827', // gray-900
    stroke: '#d1d5db', // gray-300
  },
  {
    id: 'mm-rebalance',
    title: 'MM Rebalance',
    subtitle: '(Spread Adjust)',
    fill: '#f3f4f6',
    textColor: '#111827',
    stroke: '#d1d5db',
  },
  {
    id: 'retail-chase',
    title: 'Retail Chase',
    subtitle: '(FOMO Entry)',
    fill: '#ef4444', // red-500
    textColor: '#ffffff',
  },
  {
    id: 'distribution',
    title: 'Distribution',
    subtitle: '(Exit Liquidity)',
    fill: '#f3f4f6',
    textColor: '#111827',
    stroke: '#d1d5db',
  },
  {
    id: 'stop-cascade',
    title: 'Stop Cascade',
    subtitle: '(Panic Sell)',
    fill: '#f3f4f6',
    textColor: '#111827',
    stroke: '#d1d5db',
  },
  {
    id: 'reaccumulation',
    title: 'Re-accumulation',
    subtitle: '(Dark Pools)',
    fill: '#10b981',
    textColor: '#ffffff',
  },
];

export default function CompressedCycle2D() {
  // Layout
  const width = 820;
  const boxW = 360;
  const boxH = 78;
  const x = (width - boxW) / 2;
  const vGap = 40;
  const topY = 96;
  const height = topY + steps.length * boxH + (steps.length - 1) * vGap + 120; // padding for loop

  // Helpers
  const boxY = (idx: number) => topY + idx * (boxH + vGap);
  const centerX = x + boxW / 2;

  return (
    <div className="w-full p-5 md:p-6 rounded-2xl border border-gray-700/50 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] bg-gradient-to-br from-gray-950/90 via-gray-900/85 to-black/90">
      <div className="mb-2 text-lg font-semibold leading-tight md:text-xl">
        The Compressed Cycle
      </div>
      <div className="mb-4 text-xs text-muted-foreground md:text-sm">
        Visual: One candle = full ecosystem
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-labelledby="compressed-cycle-title"
      >
        <title id="compressed-cycle-title">The Compressed Cycle Diagram</title>
        <defs>
          <marker
            id="arrow"
            markerWidth="10"
            markerHeight="10"
            refX="10"
            refY="5"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="#9ca3af" />
          </marker>
          <marker
            id="arrow-strong"
            markerWidth="25"
            markerHeight="25"
            refX="9"
            refY="9"
            orient="auto"
            viewBox="0 0 18 18"
            markerUnits="userSpaceOnUse"
          >
            <path d="M9,0 L18,9 L9,18 z" fill="#10b981" />
          </marker>
          <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="0"
              dy="1"
              stdDeviation="2"
              floodColor="#000000"
              floodOpacity="0.12"
            />
          </filter>
        </defs>

        {/* outer rounded container look */}
        <rect
          x="12"
          y="12"
          width={width - 24}
          height={height - 24}
          rx="14"
          fill="none"
          stroke="#374151"
          strokeOpacity="0.5"
          strokeWidth="1"
        />

        {/* vertical connectors */}
        {steps.slice(0, -1).map((_, i) => {
          const y1 = boxY(i) + boxH;
          const y2 = boxY(i + 1) - 6;
          return (
            <path
              key={`v-${i}`}
              d={`M ${centerX} ${y1} L ${centerX} ${y2}`}
              stroke="#9ca3af"
              strokeWidth="2"
              markerEnd="url(#arrow)"
              fill="none"
            />
          );
        })}

        {/* steps */}
        {steps.map((s, i) => {
          const y = boxY(i);
          const withStroke = Boolean(s.stroke);
          return (
            <g key={s.id} filter="url(#softShadow)">
              <rect
                x={x}
                y={y}
                width={boxW}
                height={boxH}
                rx="12"
                fill={s.fill}
                stroke={withStroke ? s.stroke : 'none'}
                strokeWidth={withStroke ? 1 : 0}
              />
              <text
                x={x + boxW / 2}
                y={y + boxH / 2 - (s.subtitle ? 6 : 0)}
                textAnchor="middle"
                dominantBaseline="central"
                fontWeight="700"
                fontSize="16"
                fill={s.textColor}
              >
                {s.title}
              </text>
              {s.subtitle && (
                <text
                  x={x + boxW / 2}
                  y={y + boxH / 2 + 14}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="13"
                  fill={s.textColor}
                  opacity="0.9"
                >
                  {s.subtitle}
                </text>
              )}
            </g>
          );
        })}

        {/* loop from last -> first along the right side (drawn after steps so arrow sits on top) */}
        {(() => {
          const arrowOffset = 12; // place arrow just outside the right edge
          const startX = x + boxW; // right edge
          const endX = x + boxW + arrowOffset; // anchor base outside the box
          const startY = boxY(steps.length - 1) + boxH / 2;
          const endY = boxY(0) + boxH / 2;
          const rightX = endX + 140;
          const path = `
            M ${startX} ${startY}
            C ${rightX} ${startY}, ${rightX} ${endY}, ${endX} ${endY}
          `;
          return (
            <path
              d={path}
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              markerEnd="url(#arrow-strong)"
              fill="none"
              opacity="0.9"
            />
          );
        })()}
      </svg>
    </div>
  );
}
