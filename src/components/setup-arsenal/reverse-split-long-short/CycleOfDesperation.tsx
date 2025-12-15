
import React, { useState } from 'react';
import {
  AlertTriangle,
  Split,
  ArrowDownToLine,
  Rocket,
  FileText,
  Activity,
  MousePointerClick,
  Info,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// --- Types ---

interface ChartPoint {
  time: string;
  price: number;
  volume: number;
}

interface PhaseData {
  id: string;
  title: string;
  dayLabel: string;
  icon: React.ElementType;
  color: string;
  visualSummary: {
    price: string;
    description: string;
  };
  boxState: {
    state: string;
    physics: string;
    description: string;
  };
  traderAction: {
    action: string;
    description: string;
    variant: 'danger' | 'warning' | 'success' | 'info' | 'neutral';
  };
  chartData: ChartPoint[];
}

// --- Data ---

const PHASES: PhaseData[] = [
  {
    id: 'threat',
    title: 'The Threat',
    dayLabel: 'Day 0',
    icon: AlertTriangle,
    color: 'text-red-500',
    visualSummary: {
      price: '$0.40',
      description:
        'Stock is non-compliant (<$1.00). Deficiency notice received.',
    },
    boxState: {
      state: 'Dead Energy',
      physics: 'Low Pressure',
      description:
        'No liquidity. No volatility. The stock is effectively dead money, but the company is desperate.',
    },
    traderAction: {
      action: 'WAIT',
      description:
        'Do not touch. The setup has not begun. Monitor SEC filings for 8-K.',
      variant: 'neutral',
    },
    chartData: [
      { time: '10:00', price: 0.42, volume: 10 },
      { time: '11:00', price: 0.41, volume: 5 },
      { time: '12:00', price: 0.4, volume: 2 },
      { time: '13:00', price: 0.4, volume: 3 },
      { time: '14:00', price: 0.39, volume: 4 },
      { time: '15:00', price: 0.4, volume: 2 },
    ],
  },
  {
    id: 'split',
    title: 'The Split',
    dayLabel: 'Day 1',
    icon: Split,
    color: 'text-blue-500',
    visualSummary: {
      price: '$4.00',
      description:
        '1-for-10 Reverse Split effective. Price artificially 10x higher.',
    },
    boxState: {
      state: 'Vacuum Created',
      physics: 'High Potential Energy',
      description:
        'Float disappears (e.g., 50M → 5M). Supply shock created. The structure for manipulation is set.',
    },
    traderAction: {
      action: 'CALCULATE',
      description:
        'Check the new float size. Is it <3M? If yes, add to prime watchlist.',
      variant: 'info',
    },
    chartData: [
      { time: 'Previous', price: 0.4, volume: 10 },
      { time: 'Open', price: 4.0, volume: 100 }, // Gap up due to split math
      { time: '10:00', price: 4.1, volume: 50 },
      { time: '12:00', price: 3.95, volume: 20 },
      { time: '14:00', price: 4.05, volume: 15 },
      { time: 'Close', price: 4.0, volume: 25 },
    ],
  },
  {
    id: 'coil',
    title: 'The Coil',
    dayLabel: 'Days 2-10',
    icon: ArrowDownToLine,
    color: 'text-yellow-500',
    visualSummary: {
      price: '$4.00 → $3.20',
      description: 'Slow drift lower on low volume. Retail loses interest.',
    },
    boxState: {
      state: 'Compression',
      physics: 'Spring Loaded',
      description:
        'Particles (sellers) are exhausted. Price is being suppressed while energy builds for the release.',
    },
    traderAction: {
      action: 'ACCUMULATE',
      description:
        'Buy the consolidation or red days. Set stop below recent lows. Anticipate.',
      variant: 'success',
    },
    chartData: [
      { time: 'Day 2', price: 4.0, volume: 30 },
      { time: 'Day 3', price: 3.85, volume: 25 },
      { time: 'Day 4', price: 3.7, volume: 20 },
      { time: 'Day 6', price: 3.5, volume: 15 },
      { time: 'Day 8', price: 3.35, volume: 10 },
      { time: 'Day 10', price: 3.2, volume: 5 }, // The lowest point usually
    ],
  },
  {
    id: 'pump',
    title: 'The Pump',
    dayLabel: 'Day 11',
    icon: Rocket,
    color: 'text-green-500',
    visualSummary: {
      price: '$3.20 → $9.50',
      description: 'Massive Green Marubozu. 200-300% move on heavy volume.',
    },
    boxState: {
      state: 'Explosion',
      physics: 'Kinetic Release',
      description:
        'The compressed spring releases. Low float means zero resistance to upside buying.',
    },
    traderAction: {
      action: 'SELL',
      description:
        'Sell into strength. Do not chase. The higher it goes, the closer the dilution is.',
      variant: 'warning',
    },
    chartData: [
      { time: '09:30', price: 3.2, volume: 50 },
      { time: '10:00', price: 4.5, volume: 500 },
      { time: '11:00', price: 6.2, volume: 1200 },
      { time: '12:00', price: 7.8, volume: 800 },
      { time: '13:00', price: 8.5, volume: 600 },
      { time: '14:00', price: 9.5, volume: 1500 }, // Peak
    ],
  },
  {
    id: 'dilution',
    title: 'The Dilution',
    dayLabel: 'Day 12+',
    icon: FileText,
    color: 'text-purple-500',
    visualSummary: {
      price: '$9.50 → $5.00',
      description: 'S-1 Filing or Direct Offering announced. Price fades.',
    },
    boxState: {
      state: 'Saturation',
      physics: 'Supply Flood',
      description:
        'The market is flooded with new shares. Supply overwhelms demand. The cycle is complete.',
    },
    traderAction: {
      action: 'SHORT',
      description:
        'Short the pops if locates are available. Ride the fade back to reality.',
      variant: 'danger',
    },
    chartData: [
      { time: 'Pre-Mkt', price: 9.2, volume: 100 },
      { time: 'News', price: 7.5, volume: 2000 }, // Gap down on news
      { time: '10:00', price: 8.0, volume: 800 }, // Failed bounce
      { time: '12:00', price: 6.5, volume: 400 },
      { time: '14:00', price: 5.8, volume: 300 },
      { time: 'Close', price: 5.0, volume: 200 },
    ],
  },
];

// --- Components ---

const CycleOfDesperation: React.FC = () => {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const activePhase = PHASES[activePhaseIndex];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden w-full transition-all duration-300">
      {/* Header Section */}
      <div className="p-6 md:p-8 border-b border-slate-800 bg-slate-900/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Activity className="w-6 h-6 text-blue-400" />
              The Cycle of Desperation
            </h2>
            <p className="text-slate-400 mt-1">
              Interactive analysis of the manufactured Reverse Split cycle.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full">
            <MousePointerClick className="w-4 h-4" />
            Click timeline nodes to explore
          </div>
        </div>
      </div>

      {/* Timeline Navigation */}
      <div className="relative px-6 py-8 md:px-12 bg-slate-900">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-8 right-8 md:left-16 md:right-16 h-1 bg-slate-800 -translate-y-1/2 rounded-full" />

        {/* Progress Line */}
        <div
          className="absolute top-1/2 left-8 md:left-16 h-1 bg-blue-500/50 -translate-y-1/2 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `calc(${
              (activePhaseIndex / (PHASES.length - 1)) * 100
            }% - 4rem)`,
          }}
        />

        {/* Nodes */}
        <div className="relative flex justify-between items-center z-10">
          {PHASES.map((phase, index) => {
            const isActive = index === activePhaseIndex;
            const isPast = index < activePhaseIndex;
            const Icon = phase.icon;

            return (
              <button
                key={phase.id}
                onClick={() => setActivePhaseIndex(index)}
                className={`group flex flex-col items-center gap-3 focus:outline-none transition-all duration-300 ${
                  isActive ? 'scale-110' : 'scale-100 hover:scale-105'
                }`}
              >
                <div
                  className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center border-4 shadow-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-slate-900 border-blue-500 shadow-blue-500/20 text-blue-400'
                      : isPast
                      ? 'bg-slate-800 border-blue-900/50 text-blue-700'
                      : 'bg-slate-800 border-slate-700 text-slate-600 hover:border-slate-600'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 md:w-8 md:h-8 ${
                      isActive ? 'animate-pulse' : ''
                    }`}
                  />
                </div>
                <div className="text-center hidden md:block">
                  <span
                    className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                      isActive ? 'text-blue-400' : 'text-slate-500'
                    }`}
                  >
                    {phase.dayLabel}
                  </span>
                  <span
                    className={`block text-sm font-semibold ${
                      isActive ? 'text-white' : 'text-slate-500'
                    }`}
                  >
                    {phase.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mobile Labels (Only active shows) */}
        <div className="mt-4 text-center md:hidden">
          <span className="block text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
            {activePhase.dayLabel}
          </span>
          <span className="text-lg font-bold text-white">
            {activePhase.title}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-t border-slate-800 min-h-[400px]">
        {/* Left: Info Panel */}
        <div className="lg:col-span-5 p-6 md:p-8 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col gap-8">
          {/* Box State Card */}
          <div className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-500 key={activePhase.id}">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider border border-slate-700">
                Phase Concept
              </span>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700/50">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">
                Box State Analysis
              </h3>
              <div className="flex items-baseline gap-3 mb-2">
                <h4 className="text-2xl font-bold text-white">
                  {activePhase.boxState.state}
                </h4>
                <span className={`text-sm font-mono ${activePhase.color}`}>
                  ({activePhase.boxState.physics})
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed text-sm">
                {activePhase.boxState.description}
              </p>
            </div>
          </div>

          {/* Action Card */}
          <div className="space-y-3 animate-in fade-in slide-in-from-left-8 duration-700 key={`action-${activePhase.id}`}">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest pl-1">
              Required Trader Action
            </h3>
            <div
              className={`
                relative overflow-hidden rounded-lg p-5 border-l-4 shadow-sm
                ${
                  activePhase.traderAction.variant === 'neutral'
                    ? 'bg-slate-800 border-slate-500'
                    : ''
                }
                ${
                  activePhase.traderAction.variant === 'info'
                    ? 'bg-blue-900/20 border-blue-500'
                    : ''
                }
                ${
                  activePhase.traderAction.variant === 'success'
                    ? 'bg-emerald-900/20 border-emerald-500'
                    : ''
                }
                ${
                  activePhase.traderAction.variant === 'warning'
                    ? 'bg-amber-900/20 border-amber-500'
                    : ''
                }
                ${
                  activePhase.traderAction.variant === 'danger'
                    ? 'bg-rose-900/20 border-rose-500'
                    : ''
                }
             `}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xl font-black uppercase tracking-tight 
                    ${
                      activePhase.traderAction.variant === 'neutral'
                        ? 'text-slate-200'
                        : ''
                    }
                    ${
                      activePhase.traderAction.variant === 'info'
                        ? 'text-blue-400'
                        : ''
                    }
                    ${
                      activePhase.traderAction.variant === 'success'
                        ? 'text-emerald-400'
                        : ''
                    }
                    ${
                      activePhase.traderAction.variant === 'warning'
                        ? 'text-amber-400'
                        : ''
                    }
                    ${
                      activePhase.traderAction.variant === 'danger'
                        ? 'text-rose-400'
                        : ''
                    }
                 `}
                >
                  {activePhase.traderAction.action}
                </span>
                <Info className="w-5 h-5 text-slate-500" />
              </div>
              <p className="text-slate-300 text-sm font-medium">
                {activePhase.traderAction.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Chart Visualization */}
        <div className="lg:col-span-7 p-6 md:p-8 bg-slate-950 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Price Action Micro-Chart
            </h3>
            <div className="text-right">
              <span className="block text-2xl font-mono font-bold text-white">
                {activePhase.visualSummary.price}
              </span>
              <span className="text-xs text-slate-500">Projected Behavior</span>
            </div>
          </div>

          <div className="flex-grow w-full h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={activePhase.chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id={`gradient-${activePhase.id}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={
                        activePhase.id === 'pump'
                          ? '#22c55e'
                          : activePhase.id === 'dilution'
                          ? '#f43f5e'
                          : '#207bd6'
                      }
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={
                        activePhase.id === 'pump'
                          ? '#22c55e'
                          : activePhase.id === 'dilution'
                          ? '#f43f5e'
                          : '#207bd6'
                      }
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  stroke="#475569"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#475569"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#f8fafc',
                  }}
                  itemStyle={{ color: '#e2e8f0' }}
                  cursor={{ stroke: '#475569', strokeWidth: 1 }}
                />
                <ReferenceLine
                  y={activePhase.chartData[0].price}
                  stroke="#334155"
                  strokeDasharray="3 3"
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={
                    activePhase.id === 'pump'
                      ? '#22c55e'
                      : activePhase.id === 'dilution'
                      ? '#f43f5e'
                      : '#207bd6'
                  }
                  fillOpacity={1}
                  fill={`url(#gradient-${activePhase.id})`}
                  strokeWidth={3}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>

            <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded text-xs max-w-[200px]">
              <span className="text-slate-400 block mb-1">Visual Note:</span>
              <span className="text-slate-200">
                {activePhase.visualSummary.description}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleOfDesperation;
