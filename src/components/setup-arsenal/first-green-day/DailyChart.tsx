import React from 'react';

const DailyChart: React.FC = () => {
  return (
    <div className="w-full h-64 bg-gray-900 rounded-lg border border-gray-800 p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 z-10">
        <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">
          Daily Context
        </h3>
        <div className="text-2xl font-bold text-gray-100">
          XYZ <span className="text-red-500 text-lg">-62%</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Setup: First Green Day Potential
        </p>
      </div>

      {/* Grid Lines */}
      <div className="absolute inset-0 top-16 px-4 flex flex-col justify-between pointer-events-none opacity-20">
        <div className="w-full h-px bg-gray-600"></div>
        <div className="w-full h-px bg-gray-600"></div>
        <div className="w-full h-px bg-gray-600"></div>
        <div className="w-full h-px bg-gray-600"></div>
      </div>

      {/* Chart Drawing */}
      <svg
        className="w-full h-full mt-8"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
      >
        {/* Parabolic Run */}
        <g transform="translate(20, 0)">
          {/* Day 1 Green */}
          <rect x="0" y="160" width="15" height="20" fill="#22c55e" rx="1" />
          <line
            x1="7.5"
            y1="155"
            x2="7.5"
            y2="185"
            stroke="#22c55e"
            strokeWidth="2"
          />

          {/* Day 2 Green */}
          <rect x="25" y="140" width="15" height="30" fill="#22c55e" rx="1" />
          <line
            x1="32.5"
            y1="135"
            x2="32.5"
            y2="175"
            stroke="#22c55e"
            strokeWidth="2"
          />

          {/* Day 3 Green (Extension) */}
          <rect x="50" y="90" width="15" height="60" fill="#22c55e" rx="1" />
          <line
            x1="57.5"
            y1="80"
            x2="57.5"
            y2="155"
            stroke="#22c55e"
            strokeWidth="2"
          />

          {/* Day 4 Green (Blow off top) */}
          <rect x="75" y="30" width="15" height="70" fill="#22c55e" rx="1" />
          <line
            x1="82.5"
            y1="10"
            x2="82.5"
            y2="110"
            stroke="#22c55e"
            strokeWidth="2"
          />
        </g>

        {/* The Crash (First Red Day & Cascade) */}
        <g transform="translate(120, 0)">
          {/* Day 5 Red (FRD) */}
          <rect x="0" y="40" width="15" height="40" fill="#ef4444" rx="1" />
          <line
            x1="7.5"
            y1="30"
            x2="7.5"
            y2="90"
            stroke="#ef4444"
            strokeWidth="2"
          />

          {/* Day 6 Red */}
          <rect x="25" y="70" width="15" height="50" fill="#ef4444" rx="1" />
          <line
            x1="32.5"
            y1="65"
            x2="32.5"
            y2="130"
            stroke="#ef4444"
            strokeWidth="2"
          />

          {/* Day 7 Red (Capitulation) */}
          <rect x="50" y="110" width="15" height="60" fill="#ef4444" rx="1" />
          <line
            x1="57.5"
            y1="105"
            x2="57.5"
            y2="180"
            stroke="#ef4444"
            strokeWidth="2"
          />
        </g>

        {/* Current Day Placeholder */}
        <g transform="translate(195, 170)">
          <text x="0" y="20" fill="#9ca3af" fontSize="12" className="font-mono">
            TODAY
          </text>
          <path
            d="M 15 -10 L 15 5"
            stroke="#fbbf24"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
        </g>
      </svg>
    </div>
  );
};

export default DailyChart;
