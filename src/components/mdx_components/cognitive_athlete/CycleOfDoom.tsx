
import React, { useState, useEffect } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import { RotateCcw, ChevronRight, Activity } from 'lucide-react';

interface DataPoint {
  name: string;
  testosterone: number;
  cortisol: number;
  balance: number;
  annotation?: string;
}

// Full dataset representing the cycle
const fullData: DataPoint[] = [
  { name: 'Start', testosterone: 50, cortisol: 30, balance: 1000 },
  { name: 'Trade 1', testosterone: 55, cortisol: 28, balance: 1050 },
  { name: 'Trade 2', testosterone: 65, cortisol: 25, balance: 1150 },
  { name: 'Streak', testosterone: 75, cortisol: 20, balance: 1300 },
  { name: 'Heat', testosterone: 85, cortisol: 20, balance: 1500 },
  {
    name: 'GOD MODE',
    testosterone: 98,
    cortisol: 15,
    balance: 1800,
    annotation: 'Max Size',
  },
  { name: 'Top', testosterone: 95, cortisol: 25, balance: 1750 },
  {
    name: 'The Loss',
    testosterone: 60,
    cortisol: 80,
    balance: 1200,
    annotation: 'Panic',
  },
  {
    name: 'Crash',
    testosterone: 30,
    cortisol: 90,
    balance: 850,
    annotation: 'Despair',
  },
  { name: 'Aftermath', testosterone: 25, cortisol: 85, balance: 850 },
];

const steps = [
  {
    title: 'The Baseline',
    description:
      'You start fresh. Hormones are balanced. Risk management is logical.',
    endIndex: 1,
  },
  {
    title: 'The Winning Streak',
    description:
      'Wins accumulate. Testosterone (Green) rises. You feel sharp. Cortisol (Red) is low.',
    endIndex: 4,
  },
  {
    title: 'God Mode',
    description:
      'Testosterone peaks. You feel invincible. Position sizing (Risk) doubles unknowingly.',
    endIndex: 6,
  },
  {
    title: 'The Turning Point',
    description:
      'A single loss occurs. Because of oversized position, the drawdown is severe.',
    endIndex: 8,
  },
  {
    title: 'The Crash (Cycle of Doom)',
    description:
      'Testosterone plummets below baseline (Loser Effect). Cortisol spikes vertically. Account is wrecked.',
    endIndex: 10,
  },
];

export const CycleOfDoom: React.FC = () => {
  const [step, setStep] = useState(0);
  const [displayedData, setDisplayedData] = useState<DataPoint[]>([]);

  useEffect(() => {
    // Animate data slicing based on step
    const targetData = fullData.slice(0, steps[step].endIndex);
    setDisplayedData(targetData);
  }, [step]);

  const handleNext = () => {
    if (step < steps.length - 1) setStep((prev) => prev + 1);
  };

  const handleReset = () => {
    setStep(0);
  };

  const currentInfo = steps[step];

  return (
    <div className="my-12 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-slate-800 bg-slate-900/50">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="text-blue-400" />
          The Cycle of Doom Simulation
        </h3>
        <p className="text-slate-400 text-sm mt-1">
          Interactive Timeline: {currentInfo.title}
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 p-6">
        {/* Chart Area */}
        <div className="lg:col-span-3 h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={displayedData}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f8fafc" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f8fafc" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                opacity={0.5}
              />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                stroke="#94a3b8"
                fontSize={12}
                domain={[0, 100]}
                tick={false}
                label={{
                  value: 'Hormone Level',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#64748b',
                  fontSize: 10,
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[500, 2000]}
                stroke="#94a3b8"
                tick={false}
                label={{
                  value: 'Account Balance',
                  angle: 90,
                  position: 'insideRight',
                  fill: '#64748b',
                  fontSize: 10,
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderColor: '#334155',
                  color: '#fff',
                }}
                itemStyle={{ fontSize: 12 }}
              />

              {/* Account Balance Area */}
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="balance"
                stroke="#f8fafc"
                fillOpacity={1}
                fill="url(#colorBalance)"
                strokeWidth={2}
                name="Account Balance"
              />

              {/* Testosterone Line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="testosterone"
                stroke="#4ade80"
                strokeWidth={3}
                dot={{ r: 4, fill: '#4ade80' }}
                name="Testosterone"
                animationDuration={1000}
              />

              {/* Cortisol Line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="cortisol"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4, fill: '#ef4444' }}
                name="Cortisol"
                animationDuration={1000}
              />

              {step >= 2 && (
                <ReferenceArea
                  yAxisId="left"
                  x1="Streak"
                  x2="Top"
                  strokeOpacity={0.3}
                  fill="#facc15"
                  fillOpacity={0.1}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Controls & Legend */}
        <div className="flex flex-col justify-between h-full space-y-4">
          <div className="space-y-4">
            <div className="bg-slate-800 p-4 rounded-lg">
              <h4 className="text-sm font-bold text-slate-300 mb-2 border-b border-slate-700 pb-2">
                Hormonal State
              </h4>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-green-400">Testosterone</span>
                <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{
                      width: `${
                        displayedData[displayedData.length - 1]?.testosterone
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-red-400">Cortisol</span>
                <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all duration-500"
                    style={{
                      width: `${
                        displayedData[displayedData.length - 1]?.cortisol
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-800 p-4 rounded-lg">
              <p className="text-sm text-slate-300 italic leading-relaxed">
                "{currentInfo.description}"
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-auto">
            {step < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                Next Step <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                Replay <RotateCcw size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
