
import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceDot,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import {
  AlertTriangle,
  Brain,
  Flame,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { HormonalState, ChartDataPoint } from './types';

// Helper to calculate the curve value (Inverted Parabola)
// Vertex at (50, 100). Passes through (0, 25) and (100, 25).
const calculateOptimalSize = (arousal: number): number => {
  // Formula: y = 100 - 0.03 * (x - 50)^2
  const val = 100 - 0.03 * Math.pow(arousal - 50, 2);
  return Math.max(25, Math.min(100, val)); // Clamp between 25 and 100 for safety
};

const getStateFromArousal = (arousal: number): HormonalState => {
  if (arousal < 35) {
    return {
      zone: 'CORTISOL',
      label: 'High Cortisol',
      description:
        'Fear dominant. Cognitive paralysis. Danger perception is exaggerated.',
      recommendedSize: calculateOptimalSize(arousal),
      color: '#ef4444', // Red for danger
      icon: '😨',
      warning: 'Paralysis Risk',
    };
  } else if (arousal > 65) {
    return {
      zone: 'TESTOSTERONE',
      label: 'High Testosterone',
      description:
        'Ego dominant. Risk blindness. Danger perception is suppressed.',
      recommendedSize: calculateOptimalSize(arousal),
      color: '#f97316', // Orange/Red for heat/danger
      icon: '🦁',
      warning: 'Recklessness Risk',
    };
  } else {
    return {
      zone: 'OPTIMAL',
      label: 'Balanced State',
      description:
        'Cognitive peak. Objective analysis. Risk perception is accurate.',
      recommendedSize: calculateOptimalSize(arousal),
      color: '#22c55e', // Green for good
      icon: '🧠',
    };
  }
};

const PositionSizingCurve: React.FC = () => {
  const [arousalLevel, setArousalLevel] = useState<number>(50);

  // Generate static data for the curve
  const data: ChartDataPoint[] = useMemo(() => {
    const points: ChartDataPoint[] = [];
    for (let i = 0; i <= 100; i += 2) {
      points.push({
        arousal: i,
        size: calculateOptimalSize(i),
      });
    }
    return points;
  }, []);

  const currentState = getStateFromArousal(arousalLevel);
  const currentSize = calculateOptimalSize(arousalLevel);

  return (
    <div className="bg-surface border border-slate-700 rounded-2xl shadow-xl overflow-hidden my-12 w-full max-w-4xl mx-auto">
      {/* Top Section: Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-700 bg-slate-900/50">
        {/* State Indicator */}
        <div className="p-6 flex flex-col items-center justify-center text-center">
          <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2">
            Current State
          </span>
          <div className="text-4xl mb-2">{currentState.icon}</div>
          <h2
            className="text-xl font-bold"
            style={{ color: currentState.color }}
          >
            {currentState.label}
          </h2>
          {currentState.warning && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20">
              <AlertTriangle size={12} />
              {currentState.warning}
            </div>
          )}
        </div>

        {/* Dynamic Size Recommendation */}
        <div className="p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2 relative z-10">
            Recommended Size
          </span>
          <div className="text-5xl font-black tracking-tighter text-white relative z-10">
            {Math.round(currentSize)}%
          </div>
          <p className="text-sm text-slate-500 mt-2 relative z-10">
            of max allocation
          </p>
        </div>

        {/* Psychological Context */}
        <div className="p-6 flex flex-col justify-center">
          <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2">
            Psychological Effect
          </span>
          <p className="text-sm text-slate-300 leading-relaxed">
            {currentState.description}
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="p-6 md:p-8 bg-slate-950 relative">
        <div className="h-64 md:h-80 w-full select-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSize" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="35%" stopColor="#ef4444" stopOpacity={0.1} />
                  <stop offset="50%" stopColor="#22c55e" stopOpacity={0.6} />
                  <stop offset="65%" stopColor="#f97316" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                vertical={false}
              />
              <XAxis dataKey="arousal" type="number" domain={[0, 100]} hide />
              <YAxis
                domain={[0, 110]}
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                active={false}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderColor: '#334155',
                  color: '#f8fafc',
                }}
              />

              <Area
                type="monotone"
                dataKey="size"
                stroke="url(#colorSize)"
                strokeWidth={3}
                fill="url(#colorSize)"
                fillOpacity={1}
                isAnimationActive={false}
              />

              {/* Dynamic Guidelines based on zones */}
              <ReferenceLine x={35} stroke="#334155" strokeDasharray="3 3" />
              <ReferenceLine x={65} stroke="#334155" strokeDasharray="3 3" />

              {/* The User Indicator Dot */}
              <ReferenceDot
                x={arousalLevel}
                y={currentSize}
                r={8}
                fill="#facc15"
                stroke="#fff"
                strokeWidth={2}
                className="z-10"
                style={{ zIndex: 10 }}
              />

              {/* Vertical line from dot to axis */}
              <ReferenceLine
                segment={[
                  { x: arousalLevel, y: 0 },
                  { x: arousalLevel, y: currentSize },
                ]}
                stroke="#facc15"
                strokeDasharray="3 3"
                opacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* X-Axis Labels positioned manually for better control */}
        <div className="flex justify-between text-xs font-bold uppercase tracking-wider mt-2 px-2">
          <div className="text-red-400 flex flex-col items-start w-1/3">
            <span>High Cortisol</span>
            <span className="text-[10px] text-red-400/60 font-normal normal-case">
              Fear / Depression
            </span>
          </div>
          <div className="text-green-500 flex flex-col items-center w-1/3">
            <span>Optimal</span>
            <span className="text-[10px] text-green-500/60 font-normal normal-case">
              Flow State
            </span>
          </div>
          <div className="text-orange-400 flex flex-col items-end text-right w-1/3">
            <span>High Testosterone</span>
            <span className="text-[10px] text-orange-400/60 font-normal normal-case">
              Greed / Mania
            </span>
          </div>
        </div>
      </div>

      {/* Interaction Control */}
      <div className="p-6 md:p-8 bg-slate-900 border-t border-slate-700">
        <label
          htmlFor="arousal-slider"
          className="block text-center text-lg font-medium text-white mb-6"
        >
          How do you feel right now?
        </label>

        <div className="relative max-w-2xl mx-auto">
          <input
            id="arousal-slider"
            type="range"
            min="0"
            max="100"
            value={arousalLevel}
            onChange={(e) => setArousalLevel(Number(e.target.value))}
            className="w-full z-20 relative accent-blue-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
          {/* Tick marks for the slider */}
          <div className="w-full flex justify-between px-3 mt-2">
            {[0, 25, 50, 75, 100].map((tick) => (
              <div
                key={tick}
                className="h-1.5 w-0.5 bg-slate-600 rounded-full"
              />
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          <div
            className={`p-4 rounded-lg border bg-opacity-10 transition-colors duration-300 flex items-start gap-3
                ${
                  currentState.zone === 'CORTISOL'
                    ? 'bg-red-500 border-red-500/50'
                    : 'bg-slate-800 border-slate-700 opacity-50'
                }`}
          >
            <ShieldAlert
              className={
                currentState.zone === 'CORTISOL'
                  ? 'text-red-400'
                  : 'text-slate-500'
              }
              size={24}
            />
            <div>
              <h4
                className={`text-sm font-bold ${
                  currentState.zone === 'CORTISOL'
                    ? 'text-red-100'
                    : 'text-slate-400'
                }`}
              >
                High Cortisol Danger
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                If you feel hesitant, frozen, or like disaster is imminent, your
                brain is in threat-detection mode. You will miss good trades or
                exit too early.
              </p>
            </div>
          </div>

          <div
            className={`p-4 rounded-lg border bg-opacity-10 transition-colors duration-300 flex items-start gap-3
                ${
                  currentState.zone === 'TESTOSTERONE'
                    ? 'bg-orange-500 border-orange-500/50'
                    : 'bg-slate-800 border-slate-700 opacity-50'
                }`}
          >
            <Flame
              className={
                currentState.zone === 'TESTOSTERONE'
                  ? 'text-orange-400'
                  : 'text-slate-500'
              }
              size={24}
            />
            <div>
              <h4
                className={`text-sm font-bold ${
                  currentState.zone === 'TESTOSTERONE'
                    ? 'text-orange-100'
                    : 'text-slate-400'
                }`}
              >
                High Testosterone Danger
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                If you feel invincible, like you "can't lose," or want to double
                down, your brain is in dominance mode. You are blind to risk.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionSizingCurve;
