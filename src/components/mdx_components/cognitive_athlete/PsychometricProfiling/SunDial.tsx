
import React, { useState, useEffect } from 'react';
import { Chronotype } from './types';
import { CHRONOTYPES, MARKETS } from './constants';

interface SunDialProps {
  chronotype: Chronotype;
  timezoneOffset: number;
}

const SunDial: React.FC<SunDialProps> = ({ chronotype, timezoneOffset }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const size = 400; // SVG size
  const cx = size / 2;
  const cy = size / 2;
  const radius = 120;
  const strokeWidth = 25;
  const innerRadius = radius - strokeWidth;
  const outerRadius = radius + strokeWidth + 10;

  // Helper to convert time (0-24) to angle (degrees)
  // Midnight (0/24) is at BOTTOM (180deg).
  // Noon (12) is at TOP (0deg).
  // 06:00 is LEFT (270deg/-90deg).
  // 18:00 is RIGHT (90deg).
  // Formula: (Hour - 12) * 15 = Angle from Top.
  // Example: 12 -> 0. 18 -> 90. 0 -> 180. 6 -> -90 (270).
  const timeToAngle = (hour: number) => {
    return (hour - 12) * 15;
  };

  const describeSector = (
    x: number,
    y: number,
    rInner: number,
    rOuter: number,
    startAngle: number,
    endAngle: number
  ) => {
    // Adjust standard angle (0 is right) to clock angle (0 is top)
    const startRad = (startAngle - 90) * (Math.PI / 180.0);
    const endRad = (endAngle - 90) * (Math.PI / 180.0);

    const x1 = x + rOuter * Math.cos(startRad);
    const y1 = y + rOuter * Math.sin(startRad);
    const x2 = x + rOuter * Math.cos(endRad);
    const y2 = y + rOuter * Math.sin(endRad);

    const x3 = x + rInner * Math.cos(endRad);
    const y3 = y + rInner * Math.sin(endRad);
    const x4 = x + rInner * Math.cos(startRad);
    const y4 = y + rInner * Math.sin(startRad);

    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    return [
      `M ${x1} ${y1}`,
      `A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      `Z`,
    ].join(' ');
  };

  // 1. Render Background Dial (Hour marks)
  const renderDialMarks = () => {
    const marks = [];
    for (let i = 0; i < 24; i++) {
      const angle = timeToAngle(i);
      const rad = (angle - 90) * (Math.PI / 180);
      const x1 = cx + (radius - 5) * Math.cos(rad);
      const y1 = cy + (radius - 5) * Math.sin(rad);
      const x2 = cx + (radius + 5) * Math.cos(rad);
      const y2 = cy + (radius + 5) * Math.sin(rad);

      const isMajor = i % 6 === 0; // 0, 6, 12, 18

      marks.push(
        <line
          key={`tick-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={isMajor ? '#94a3b8' : '#475569'}
          strokeWidth={isMajor ? 2 : 1}
        />
      );

      // Numbers
      if (i % 3 === 0) {
        const textR = radius - 20;
        const tx = cx + textR * Math.cos(rad);
        const ty = cy + textR * Math.sin(rad);
        marks.push(
          <text
            key={`text-${i}`}
            x={tx}
            y={ty}
            textAnchor="middle"
            alignmentBaseline="middle"
            fill="#cbd5e1"
            fontSize="10"
            fontWeight={isMajor ? 'bold' : 'normal'}
          >
            {i === 0 ? '24' : i}
          </text>
        );
      }
    }
    return marks;
  };

  // 2. Render Chronotype Peak Windows (Inner Ring - Green)
  const renderPeakWindows = () => {
    const profile = CHRONOTYPES[chronotype];
    return profile.peakWindows.map((win, idx) => {
      let start = win.start;
      let end = win.end;
      if (end < start) end += 24; // Handle wrapping

      const startAngle = timeToAngle(start);
      const endAngle = timeToAngle(end);

      return (
        <path
          key={`peak-${idx}`}
          d={describeSector(
            cx,
            cy,
            innerRadius - 20,
            innerRadius,
            startAngle,
            endAngle
          )}
          fill="#22c55e" // Green-500
          fillOpacity={0.6}
          stroke="#22c55e"
          strokeWidth={1}
        />
      );
    });
  };

  // 3. Render Market Sessions (Outer Ring - varies by timezone)
  const renderMarketSessions = () => {
    return MARKETS.map((market, idx) => {
      // Convert UTC market hours to Local Time based on selected offset
      let localStart = market.utcStart + timezoneOffset;
      let localEnd = market.utcEnd + timezoneOffset;

      // Normalize to 0-24
      while (localStart < 0) localStart += 24;
      while (localStart >= 24) localStart -= 24;
      while (localEnd < 0) localEnd += 24;
      while (localEnd >= 24) localEnd -= 24;

      // Handle crossing midnight for arc drawing
      let startAngle = timeToAngle(localStart);
      let endAngle = timeToAngle(localEnd);

      // If the session wraps around the visual circle (e.g. 23:00 to 02:00)
      // We need to ensure endAngle > startAngle for the math to work or handle 360 wrap
      if (endAngle < startAngle) endAngle += 360;

      return (
        <g key={`market-${idx}`}>
          <path
            d={describeSector(
              cx,
              cy,
              outerRadius,
              outerRadius + 15,
              startAngle,
              endAngle
            )}
            fill={market.color}
            fillOpacity={0.8}
          />
          {/* Market Label */}
          {/* Simplified label placement logic - maybe just a tooltip or legend, but lets try a text path or simple radial text */}
        </g>
      );
    });
  };

  // 4. Current Time Hand
  const renderCurrentTime = () => {
    const now = new Date();
    // Need a way to get 'local' time of the selected timezone for the hand?
    // Or does the user expect the dial to show their *actual* local time?
    // Usually, a tool like this helps you visualize *your* day.
    // So we use the browser's local time, but we assume the user selected the timezone that matches their location.
    // Ideally, we'd use the selected timezone offset to drive a "simulated" clock,
    // but for simplicity, let's just use the hour of the day derived from the offset if we treat "00:00" as local midnight.

    // Actually, standard UI: The dial is fixed 0-24. The user tells us their offset.
    // We highlight markets relative to that offset.
    // So the hand should just be the current time *shifted* to that timezone?
    // Or just standard system time if they selected their own TZ.
    // Let's assume the user selects their *own* timezone.
    // We can get the current UTC hour and add the offset.

    const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
    let localHours = utcHours + timezoneOffset;
    if (localHours < 0) localHours += 24;
    if (localHours >= 24) localHours -= 24;

    const angle = timeToAngle(localHours);
    const rad = (angle - 90) * (Math.PI / 180);

    return (
      <g>
        <line
          x1={cx}
          y1={cy}
          x2={cx + (radius - 10) * Math.cos(rad)}
          y2={cy + (radius - 10) * Math.sin(rad)}
          stroke="#f8fafc"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={4} fill="#f8fafc" />
      </g>
    );
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-2xl"
      >
        {/* Gradients */}
        <defs>
          <radialGradient id="dialGradient" cx="0.5" cy="0.5" r="0.5">
            <stop offset="80%" stopColor="#1e293b" stopOpacity="1" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
          </radialGradient>
        </defs>

        {/* Dial Background */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="url(#dialGradient)"
          stroke="#334155"
          strokeWidth="2"
        />

        {/* Layers */}
        {renderPeakWindows()}
        {renderDialMarks()}
        {renderMarketSessions()}
        {renderCurrentTime()}

        {/* Labels for quadrants */}
        <text
          x={cx}
          y={cy - radius + 25}
          textAnchor="middle"
          fill="#64748b"
          fontSize="10"
          fontWeight="bold"
        >
          NOON
        </text>
        <text
          x={cx}
          y={cy + radius - 15}
          textAnchor="middle"
          fill="#64748b"
          fontSize="10"
          fontWeight="bold"
        >
          MIDNIGHT
        </text>
      </svg>

      {/* Legend for Dial */}
      <div className="flex gap-4 mt-2 text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500/60 rounded-full"></div>
          <span>Your Peak</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>London</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>NY</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span>Tokyo</span>
        </div>
      </div>
    </div>
  );
};

export default SunDial;
