
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';

const data = [
  {
    day: 0,
    effort: 85,
    phase: 'Start',
    note: 'Excitement mixed with high friction',
  },
  {
    day: 5,
    effort: 70,
    phase: 'Honeymoon',
    note: 'Initial motivation carries you',
  },
  {
    day: 10,
    effort: 65,
    phase: 'Honeymoon Ends',
    note: 'Motivation fades, reality sets in',
  },
  { day: 11, effort: 85, phase: 'The Dip Begins', note: 'Sudden resistance' },
  {
    day: 15,
    effort: 95,
    phase: 'The Dip Peak',
    note: 'Maximum resistance. Most quit here.',
  },
  {
    day: 20,
    effort: 90,
    phase: 'The Dip',
    note: "Still hard, but you're pushing",
  },
  {
    day: 25,
    effort: 80,
    phase: 'The Dip Ends',
    note: 'Resistance starts to break',
  },
  {
    day: 35,
    effort: 65,
    phase: 'The Slope',
    note: 'Connections strengthening',
  },
  { day: 45, effort: 50, phase: 'The Slope', note: 'Feeling more natural' },
  {
    day: 55,
    effort: 35,
    phase: 'The Slope',
    note: 'Requires little conscious thought',
  },
  { day: 66, effort: 15, phase: 'Automaticity', note: 'The tipping point' },
  { day: 75, effort: 10, phase: 'Maintenance', note: 'New normal' },
  { day: 90, effort: 5, phase: 'Mastery', note: 'Identity shift complete' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    return (
      <div className="bg-slate-800 border border-slate-600 p-3 rounded-lg shadow-xl max-w-xs z-50">
        <p className="text-accent font-bold mb-1">
          Day {label}: {dataPoint.phase}
        </p>
        <p className="text-slate-300 text-sm mb-2">
          Effort Level: {dataPoint.effort}%
        </p>
        <p className="text-xs text-slate-400 italic border-t border-slate-700 pt-2">
          "{dataPoint.note}"
        </p>
      </div>
    );
  }
  return null;
};

const RealityCurve: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 my-10 shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-accent">●</span> The 66-Day Reality Curve
        </h3>
        <p className="text-slate-400 text-sm">
          Effort required to execute the new behavior over time.
        </p>
      </div>

      <div className="h-[500px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 40, right: 30, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorEffort" x1="0" y1="0" x2="1" y2="0">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="25%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="60%" stopColor="#facc15" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.8} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="day"
              stroke="#64748b"
              label={{
                value: 'Days',
                position: 'insideBottom',
                offset: -10,
                fill: '#64748b',
              }}
            />
            <YAxis
              stroke="#64748b"
              label={{
                value: 'Effort Required',
                angle: -90,
                position: 'insideLeft',
                fill: '#64748b',
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* The Dip Highlight Area */}
            <ReferenceArea x1={11} x2={25} fill="#7f1d1d" fillOpacity={0.3} />
            <ReferenceLine
              x={66}
              stroke="#10b981"
              strokeDasharray="3 3"
              label={{
                value: 'Automaticity Point',
                fill: '#10b981',
                position: 'top',
              }}
            />

            <Area
              type="monotone"
              dataKey="effort"
              stroke="url(#colorEffort)"
              fill="url(#colorEffort)"
              fillOpacity={0.2}
              strokeWidth={3}
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-xs text-slate-500">
        <div className="p-2 border border-red-900/50 bg-red-900/10 rounded">
          <strong className="text-red-400 block mb-1">
            Days 11-25: The Dip
          </strong>
          High failure rate. Effort feels pointless.
        </div>
        <div className="p-2 border border-yellow-900/50 bg-yellow-900/10 rounded">
          <strong className="text-yellow-400 block mb-1">
            Days 26-65: The Slope
          </strong>
          Gradual strengthening. Easier daily.
        </div>
        <div className="p-2 border border-emerald-900/50 bg-emerald-900/10 rounded">
          <strong className="text-emerald-400 block mb-1">
            Day 66+: Automaticity
          </strong>
          New default behavior established.
        </div>
      </div>
    </div>
  );
};

export default RealityCurve;
