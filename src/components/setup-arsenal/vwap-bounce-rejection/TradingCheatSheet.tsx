
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  Target,
  BarChart2,
  Zap,
  ShieldCheck,
  Crosshair,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Types ---
type SetupType = 'long' | 'short';

interface SetupData {
  title: string;
  subtitle: string;
  color: string; // Tailwind color name like 'cyan' or 'orange'
  gradient: string;
  badge: string;
  details: {
    category: string;
    complementary: string;
    time: string;
    timeframe: string;
    risk: 'Low' | 'Medium' | 'High';
    successRate: number;
    rr: string;
    volume: string;
    catalyst: string;
  };
  visual: {
    path: string; // SVG Path data
    entryPoint: { cx: number; cy: number };
    moatLabel: string;
    arrowIcon: React.ReactNode;
    arrowPos: { top?: string; bottom?: string; left: string };
    description: string;
  };
  scenarios: {
    title: string;
    desc: string;
    tag: string;
  }[];
}

// --- Data Constants ---
const DATA: Record<SetupType, SetupData> = {
  long: {
    title: 'VWAP Bounce',
    subtitle: 'Technical Scalp / Support',
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-600',
    badge: 'LONG ↗',
    details: {
      category: 'Technical Scalp/Support',
      complementary: 'VWAP Rejection (Short)',
      time: '9:45 - 11:00 AM EST',
      timeframe: 'Entry: 1-5min | Exit: 5-15min',
      risk: 'Low',
      successRate: 85,
      rr: '1:1.5 to 1:3',
      volume: 'High Pre-Market Volume',
      catalyst: 'Fresh Catalyst + ORB Complete',
    },
    visual: {
      // Curve coming down from top left to bottom middle, then bouncing up
      path: 'M 0,50 Q 150,180 300,200 L 350,170 Q 400,130 450,140 L 480,135', // Reusing logic but flipping visually via scaleY in component
      entryPoint: { cx: 450, cy: 140 }, // Adjusted visually in component
      moatLabel: 'Distance from Highs',
      arrowIcon: <TrendingUp size={48} />,
      arrowPos: { bottom: '40%', left: '60%' },
      description:
        'ORB completes → Price pulls back to VWAP → First test = ENTRY',
    },
    scenarios: [
      {
        title: 'First Touch Entry',
        desc: 'Price pulls back and touches VWAP for the first time. Enter immediately on touch or first bounce candle.',
        tag: 'Highest R/R',
      },
      {
        title: 'Quick Reclaim',
        desc: 'Price wicks below VWAP but immediately reclaims. Enter on the green candle close back above VWAP.',
        tag: 'Defensive',
      },
      {
        title: 'Double Bottom',
        desc: 'Tests VWAP twice and holds both times. Enter on second test confirmation.',
        tag: 'High Win Rate',
      },
    ],
  },
  short: {
    title: 'VWAP Rejection',
    subtitle: 'Technical Scalp / Resistance',
    color: 'orange',
    gradient: 'from-orange-500 to-red-600',
    badge: 'SHORT ↘',
    details: {
      category: 'Technical Scalp/Resistance',
      complementary: 'VWAP Bounce (Long)',
      time: '10:00 AM - 3:00 PM EST',
      timeframe: 'Entry: 1-5min | Exit: 5-15min',
      risk: 'Low',
      successRate: 78,
      rr: '1:1.5 to 1:3',
      volume: 'Declining / Buyers Exhausted',
      catalyst: 'Failed Move / Below VWAP',
    },
    visual: {
      // Curve coming up from bottom left to top middle, then rejecting down
      path: 'M 0,250 Q 150,50 300,20 L 350,60 Q 400,120 450,150 L 480,160',
      entryPoint: { cx: 450, cy: 140 },
      moatLabel: 'Distance from Lows',
      arrowIcon: <TrendingDown size={48} />,
      arrowPos: { top: '45%', left: '60%' },
      description:
        'Price below VWAP → Grinds back to VWAP → Test or clearout = ENTRY',
    },
    scenarios: [
      {
        title: 'Direct Rejection',
        desc: 'Price grinds to VWAP, touches it, and immediately rejects. Short on the red rejection candle.',
        tag: 'Standard',
      },
      {
        title: 'Clearout Short',
        desc: 'Price breaks ABOVE VWAP briefly to trap longs, then fails. Short on the reclaim back BELOW VWAP.',
        tag: 'Preferred',
      },
      {
        title: 'Failed Reclaim',
        desc: 'Multiple attempts to break above VWAP fail. Short after 2nd or 3rd failed attempt.',
        tag: 'Exhaustion',
      },
    ],
  },
};

// --- Sub-Components ---

const StatCard = ({
  label,
  value,
  icon,
  colorClass,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
}) => (
  <div className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-xl flex items-start gap-3 backdrop-blur-sm hover:bg-slate-800/50 transition-colors">
    <div className={cn('p-2 rounded-lg bg-slate-800', colorClass)}>{icon}</div>
    <div>
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-slate-100 font-semibold text-sm leading-tight">
        {value}
      </p>
    </div>
  </div>
);

const ProgressBar = ({ value, color }: { value: number; color: string }) => (
  <div className="h-2 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 1, delay: 0.2 }}
      className={cn(
        'h-full rounded-full',
        color === 'cyan' ? 'bg-cyan-400' : 'bg-orange-500'
      )}
    />
  </div>
);

const ChartVisual = ({
  type,
  data,
}: {
  type: SetupType;
  data: SetupData['visual'];
}) => {
  const isLong = type === 'long';
  const lineColor = isLong ? '#22d3ee' : '#f97316';

  return (
    <div className="relative w-full h-[300px] bg-slate-900/60 rounded-2xl border border-slate-700/50 overflow-hidden flex items-center justify-center">
      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(${lineColor} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* VWAP Line */}
      <div className="absolute w-full h-[2px] bg-white/20 left-0 top-1/2 shadow-[0_0_15px_rgba(255,255,255,0.3)] z-10">
        <span className="absolute right-4 -top-8 text-white/50 text-xs font-bold tracking-widest bg-slate-900 px-2 py-1 rounded border border-white/10">
          VWAP
        </span>
      </div>

      {/* Dynamic Price Path */}
      <svg
        className="w-full h-full absolute inset-0 z-20 pointer-events-none"
        viewBox="0 0 600 300"
        preserveAspectRatio="none"
      >
        <motion.path
          d={
            isLong
              ? 'M 0,20 Q 150,50 300,150 L 320,155 Q 380,140 450,90' // Custom path for bounce
              : 'M 0,280 Q 150,250 300,150 L 320,145 Q 380,160 450,210' // Custom path for rejection
          }
          fill="none"
          stroke={lineColor}
          strokeWidth="4"
          strokeDasharray="8 8"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />

        {/* Entry Point Marker */}
        <motion.circle
          cx={isLong ? 320 : 320}
          cy={isLong ? 155 : 145}
          r="8"
          fill="#fbbf24"
          stroke="white"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.2, type: 'spring' }}
        />
      </svg>

      {/* Entry Label */}
      <motion.div
        className="absolute text-amber-400 font-bold text-xs bg-amber-900/30 px-2 py-1 rounded border border-amber-500/30"
        style={{
          left: '52%',
          top: isLong ? '58%' : '38%',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
      >
        ENTRY
      </motion.div>

      {/* Moat Indicator */}
      <div
        className={cn(
          'absolute right-8 p-3 rounded-lg border backdrop-blur-md',
          isLong
            ? 'top-8 border-cyan-500/30 bg-cyan-950/30'
            : 'bottom-8 border-orange-500/30 bg-orange-950/30'
        )}
      >
        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
          Moat Size
        </div>
        <div
          className={cn(
            'text-lg font-bold flex items-center gap-2',
            isLong ? 'text-cyan-400' : 'text-orange-400'
          )}
        >
          Large Gap <span className="text-xl">↕</span>
        </div>
      </div>

      {/* Arrow Animation */}
      <motion.div
        className={cn(
          'absolute opacity-80',
          isLong ? 'text-cyan-400' : 'text-orange-400'
        )}
        style={{ top: isLong ? '35%' : '55%', left: '60%' }}
        animate={{
          y: isLong ? [-5, 5, -5] : [5, -5, 5],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        {data.arrowIcon}
      </motion.div>
    </div>
  );
};

// --- Main Component ---

const TradingCheatSheet: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SetupType>('long');
  const data = DATA[activeTab];

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 text-slate-100 font-sans">
      {/* Header Section */}
      <div className="text-center mb-10 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 text-transparent bg-clip-text mb-2">
            VWAP Mastery
          </h1>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-cyan-500 to-orange-500 rounded-full" />
        </motion.div>

        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          High-probability technical scalps. Fast resolution.{' '}
          <span className="text-white font-semibold">The Moat</span> is key.
        </p>

        {/* Global Stats Badge */}
        <div className="flex justify-center gap-4 mt-4">
          <div className="bg-slate-900/80 px-4 py-2 rounded-full border border-slate-700/50 flex items-center gap-2 text-sm text-cyan-300">
            <Clock size={16} /> 2-15 min hold
          </div>
          <div className="bg-slate-900/80 px-4 py-2 rounded-full border border-slate-700/50 flex items-center gap-2 text-sm text-emerald-300">
            <Target size={16} /> 1:3 Target
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-900/80 p-1 rounded-xl border border-slate-800 backdrop-blur-md flex gap-2 relative">
          {(['long', 'short'] as SetupType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative px-8 py-3 rounded-lg font-bold transition-colors duration-300 flex items-center gap-2"
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className={cn(
                    'absolute inset-0 rounded-lg shadow-lg z-0',
                    tab === 'long' ? 'bg-cyan-400' : 'bg-orange-400'
                  )}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span
                className={cn(
                  'relative z-10 flex items-center gap-2',
                  activeTab === tab
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {tab === 'long' ? (
                  <TrendingUp size={18} />
                ) : (
                  <TrendingDown size={18} />
                )}
                {tab === 'long' ? 'VWAP Bounce' : 'VWAP Rejection'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Top Grid: Key Stats & Visual */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col: Details */}
            <div className="lg:col-span-5 space-y-4">
              <div
                className={cn(
                  'p-6 rounded-2xl border bg-gradient-to-b backdrop-blur-sm',
                  activeTab === 'long'
                    ? 'from-cyan-950/20 to-slate-900/40 border-cyan-500/20'
                    : 'from-orange-950/20 to-slate-900/40 border-orange-500/20'
                )}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2
                    className={cn(
                      'text-2xl font-bold',
                      activeTab === 'long' ? 'text-cyan-400' : 'text-orange-400'
                    )}
                  >
                    {data.title}
                  </h2>
                  <span
                    className={cn(
                      'px-3 py-1 rounded-md text-xs font-bold border',
                      activeTab === 'long'
                        ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300'
                        : 'bg-orange-500/10 border-orange-500/50 text-orange-300'
                    )}
                  >
                    {data.badge}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <StatCard
                    label="Best Time"
                    value={data.details.time}
                    icon={<Clock size={18} className="text-white" />}
                    colorClass={
                      activeTab === 'long' ? 'bg-cyan-600' : 'bg-orange-600'
                    }
                  />
                  <StatCard
                    label="Risk Profile"
                    value={data.details.risk}
                    icon={<ShieldCheck size={18} className="text-white" />}
                    colorClass={
                      activeTab === 'long' ? 'bg-cyan-600' : 'bg-orange-600'
                    }
                  />
                  <div className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-xl">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-slate-400 text-xs font-medium uppercase">
                        Success Rate
                      </span>
                      <span
                        className={cn(
                          'text-lg font-bold',
                          activeTab === 'long'
                            ? 'text-cyan-400'
                            : 'text-orange-400'
                        )}
                      >
                        {data.details.successRate}%
                      </span>
                    </div>
                    <ProgressBar
                      value={data.details.successRate}
                      color={data.color}
                    />
                  </div>
                  <StatCard
                    label="Required Catalyst"
                    value={data.details.catalyst}
                    icon={<Zap size={18} className="text-white" />}
                    colorClass={
                      activeTab === 'long' ? 'bg-cyan-600' : 'bg-orange-600'
                    }
                  />
                </div>
              </div>
            </div>

            {/* Right Col: Visual Chart */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <ChartVisual type={activeTab} data={data.visual} />

              <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl text-center">
                <p className="text-slate-300 font-medium flex items-center justify-center gap-2">
                  <Info
                    size={16}
                    className={
                      activeTab === 'long' ? 'text-cyan-400' : 'text-orange-400'
                    }
                  />
                  {data.visual.description}
                </p>
              </div>

              {/* Moat Concept Box (Shared) */}
              <div className="bg-amber-900/10 border border-amber-500/20 p-5 rounded-xl flex items-start gap-4">
                <div className="bg-amber-500/10 p-2 rounded-lg text-amber-500 shrink-0 mt-1">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="text-amber-400 font-bold text-sm mb-1 uppercase tracking-wide">
                    The Critical "Moat" Concept
                  </h4>
                  <p className="text-amber-100/80 text-sm leading-relaxed">
                    The larger the distance between VWAP and the{' '}
                    {activeTab === 'long' ? 'High' : 'Low'} of Day, the higher
                    the probability. Do not take this setup if price is hugging
                    VWAP tightly without a significant extension first.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Entry Scenarios */}
          <div>
            <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Crosshair
                size={20}
                className={
                  activeTab === 'long' ? 'text-cyan-400' : 'text-orange-400'
                }
              />
              Entry Strategies
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.scenarios.map((scenario, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="group bg-slate-900/40 border border-slate-700/50 hover:border-slate-500 p-5 rounded-xl transition-all duration-300 hover:bg-slate-800/60 hover:-translate-y-1 relative overflow-hidden"
                >
                  <div
                    className={cn(
                      'absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-[10px] font-bold uppercase tracking-wider',
                      activeTab === 'long'
                        ? 'bg-cyan-900/50 text-cyan-400'
                        : 'bg-orange-900/50 text-orange-400'
                    )}
                  >
                    {scenario.tag}
                  </div>
                  <h4
                    className={cn(
                      'font-bold text-lg mb-2 group-hover:text-white transition-colors',
                      activeTab === 'long' ? 'text-cyan-100' : 'text-orange-100'
                    )}
                  >
                    {scenario.title}
                  </h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {scenario.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TradingCheatSheet;
