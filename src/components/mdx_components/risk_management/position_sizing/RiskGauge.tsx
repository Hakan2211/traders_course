import React from 'react';

interface RiskGaugeProps {
  riskPercent: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ riskPercent }) => {
  // Gauge range: 0% to 10%
  // Angle range: -90deg to 90deg
  const maxRisk = 10;
  const clampedRisk = Math.min(Math.max(riskPercent, 0), maxRisk);
  const rotation = (clampedRisk / maxRisk) * 180 - 90;

  let statusColor = '#22c55e'; // Green
  let statusText = 'SAFE';

  if (riskPercent > 2 && riskPercent <= 5) {
    statusColor = '#eab308'; // Yellow
    statusText = 'CAUTION';
  } else if (riskPercent > 5) {
    statusColor = '#ef4444'; // Red
    statusText = 'DANGER';
  }

  return (
    <div className="flex flex-col items-center justify-center py-4 relative">
      <svg width="200" height="110" viewBox="0 0 200 110">
        {/* Background Arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#374151"
          strokeWidth="20"
          strokeLinecap="round"
        />

        {/* Color Zones */}
        {/* Safe 0-2% (20% of arc) */}
        <path
          d="M 20 100 A 80 80 0 0 1 53 28"
          fill="none"
          stroke="#22c55e"
          strokeWidth="20"
          opacity="0.3"
        />
        {/* Caution 2-5% (30% of arc) */}
        <path
          d="M 53 28 A 80 80 0 0 1 100 20"
          fill="none"
          stroke="#eab308"
          strokeWidth="20"
          opacity="0.3"
        />
        {/* Danger 5-10% (50% of arc) */}
        <path
          d="M 100 20 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#ef4444"
          strokeWidth="20"
          opacity="0.3"
        />

        {/* Needle */}
        <g transform={`translate(100, 100) rotate(${rotation})`}>
          <path d="M -4 0 L 0 -75 L 4 0 Z" fill={statusColor} />
          <circle cx="0" cy="0" r="6" fill="#e2e8f0" />
        </g>

        {/* Labels */}
        <text x="20" y="120" fill="#9ca3af" fontSize="10" textAnchor="middle">
          0%
        </text>
        <text x="53" y="15" fill="#9ca3af" fontSize="10" textAnchor="middle">
          2%
        </text>
        <text x="180" y="120" fill="#9ca3af" fontSize="10" textAnchor="middle">
          10%
        </text>
      </svg>

      <div className="text-center mt-[-10px]">
        <div className="text-2xl font-bold" style={{ color: statusColor }}>
          {riskPercent.toFixed(2)}%
        </div>
        <div className="text-xs font-bold tracking-widest text-gray-400">
          {statusText}
        </div>
      </div>
    </div>
  );
};
