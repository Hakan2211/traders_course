import React from 'react';

interface GaugeProps {
  score: number;
  maxScore: number;
}

const Gauge: React.FC<GaugeProps> = ({ score, maxScore }) => {
  // SVG Configuration
  const radius = 80;
  const stroke = 12;
  const normalizedScore = Math.min(score, maxScore);

  // Calculate needle angle
  // Map 0 -> -90deg, 9 -> 90deg
  const percentage = normalizedScore / maxScore;
  const angle = -90 + percentage * 180;

  // Helper to create arc path
  const createArc = (startAngle: number, endAngle: number, color: string) => {
    const startRad = (startAngle - 180) * (Math.PI / 180);
    const endRad = (endAngle - 180) * (Math.PI / 180);

    const x1 = 100 + radius * Math.cos(startRad);
    const y1 = 100 + radius * Math.sin(startRad);
    const x2 = 100 + radius * Math.cos(endRad);
    const y2 = 100 + radius * Math.sin(endRad);

    return (
      <path
        d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="butt"
      />
    );
  };

  // Zones:
  // 0-2 (Green): ~22% of arc -> -90 to -50
  // 3-5 (Yellow): ~33% of arc -> -50 to 10
  // 6-9 (Red): ~45% of arc -> 10 to 90

  return (
    <div className="relative w-92 h-32 overflow-hidden mx-auto mb-4">
      <svg viewBox="0 0 200 110" className="w-full h-full">
        {/* Background Track */}
        {createArc(0, 180, '#1e293b')}

        {/* Zone 1: Process Mode (Green) - roughly 0 to 2.5 units */}
        {createArc(0, 45, '#22c55e')}

        {/* Zone 2: Tolerance (Yellow) - roughly 2.5 to 5.5 units */}
        {createArc(45, 105, '#eab308')}

        {/* Zone 3: Casino Mode (Red) - roughly 5.5 to 9 units */}
        {createArc(105, 180, '#ef4444')}

        {/* Needle Center Pivot */}
        <circle cx="100" cy="100" r="6" fill="#f8fafc" />

        {/* Needle */}
        <g
          transform={`translate(100, 100) rotate(${angle})`}
          className="transition-transform duration-700 ease-out"
        >
          <path d="M -12 0 L 0 -75 L 12 0 Z" fill="#f8fafc" />
          <circle cx="0" cy="0" r="3" fill="#0f172a" />
        </g>

        {/* Text Labels */}
        <text x="-40" y="90" fill="#22c55e" fontSize="10" fontWeight="bold">
          PROCESS
        </text>
        <text
          x="100"
          y="50"
          fill="#eab308"
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
        >
          TOLERANCE
        </text>
        <text
          x="230"
          y="90"
          fill="#ef4444"
          textAnchor="end"
          fontSize="10"
          fontWeight="bold"
        >
          CASINO
        </text>
      </svg>
    </div>
  );
};

export default Gauge;
