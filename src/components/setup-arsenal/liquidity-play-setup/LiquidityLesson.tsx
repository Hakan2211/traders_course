
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  BookOpen,
  AlertTriangle,
  Activity,
  Clock,
  Target,
  BarChart2,
  Zap,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Types ---

type SetupDirection = 'long' | 'short';

interface LessonData {
  title: string;
  subtitle: string;
  terminology: {
    title: string;
    content: string;
    highlight: string;
  };
  details: {
    category: string;
    timeframe: string;
    duration: string;
    entryTime: string;
    riskLevel: number; // 1-5
    successRate: number; // percentage
    riskReward: string;
    volumeProfile: string;
    catalyst: string;
  };
  timeline: Array<{
    day: string;
    title: string;
    volume: string;
    volumeLevel: 'high' | 'low' | 'squeeze';
    description: string;
  }>;
  variations: Array<{
    title: string;
    desc: string;
  }>;
  mechanics: string[];
}

// --- Data ---

const LONG_DATA: LessonData = {
  title: 'Liquidity Play',
  subtitle: 'Multi-Day Short Squeeze Pattern | Daily Timeframe Trap',
  terminology: {
    title: "Why 'Play' not 'Trap'?",
    content:
      'A true trap is unexpected and rare. This setup happens frequently and is obvious if you know the mechanics. It is a predictable play based on liquidity constraints.',
    highlight:
      'This is a PREDICTABLE PLAY based on liquidity mechanics, not a rare trap.',
  },
  details: {
    category: 'Multi-Day Short Squeeze',
    timeframe: 'Daily Chart Pattern',
    duration: '3-7 Days (Peak Day 3-4)',
    entryTime: '9:30 - 9:35 AM EST',
    riskLevel: 3,
    successRate: 75,
    riskReward: '1:6 to 1:10+',
    volumeProfile: 'Day 1: 50M+ → Days 2-3: <1M (Dry)',
    catalyst: 'Required on Day 1 (News/Earnings)',
  },
  timeline: [
    {
      day: '1',
      title: 'High Volume Day',
      volume: '50M+ Shares',
      volumeLevel: 'high',
      description:
        'Catalyst drops. Massive volume. Closes below HOD. Shorts enter confidently.',
    },
    {
      day: '2',
      title: 'Consolidation',
      volume: '500K Shares',
      volumeLevel: 'low',
      description:
        "Volume DRIES. Traders lose interest. 'Dead ticker'. Shorts get comfortable.",
    },
    {
      day: '3',
      title: 'Setup Building',
      volume: '300K Shares',
      volumeLevel: 'low',
      description:
        'Sideways action. Nobody watching. FTD (Failure to Deliver) pressure builds.',
    },
    {
      day: '3-4',
      title: 'The Squeeze',
      volume: 'Explosive',
      volumeLevel: 'squeeze',
      description:
        '9:30 AM Open. Shorts must cover. No liquidity. Price moves 30-50% in minutes.',
    },
  ],
  variations: [
    {
      title: 'Inside Bar',
      desc: "Day 2 is an inside bar within Day 1's range. The most common variation.",
    },
    {
      title: 'High Consolidation',
      desc: 'Consolidates near highs. Sign of strength. Coiling for a breakout.',
    },
    {
      title: 'Low Consolidation',
      desc: "Consolidates at lows. Traps shorts thinking it's dead, then reverses.",
    },
    {
      title: 'Extended (Cold Cycle)',
      desc: 'Consolidation lasts 5-7 days. Squeeze happens when least expected.',
    },
  ],
  mechanics: [
    'Shorts entered on Day 1 with unlimited liquidity (50M shares).',
    'On Day 3, volume is <300k. There is NO liquidity to exit large positions.',
    'T+1 Settlement forces delivery. FTDs force buy-ins.',
    'Shorts are forced to buy into a void, pushing price up vertically.',
  ],
};

// Simulated Short Data (Inverse of the Long setup for demonstration)
const SHORT_DATA: LessonData = {
  title: 'Liquidity Dump',
  subtitle: 'Multi-Day Long Trap | The Rug Pull',
  terminology: {
    title: "The 'Bagholder' Creation",
    content:
      'Retail traders buy the breakout on high volume, but the stock fails to hold. Smart money uses the liquidity to exit positions.',
    highlight:
      'Smart money sells into strength. They need your buy orders to fill their sell orders.',
  },
  details: {
    category: 'Trend Reversal / Exhaustion',
    timeframe: 'Daily Chart Pattern',
    duration: '2-5 Days',
    entryTime: '10:00 - 10:30 AM EST',
    riskLevel: 4,
    successRate: 65,
    riskReward: '1:4 to 1:8',
    volumeProfile: 'Day 1: Spike → Day 2: Choppy → Day 3: Dump',
    catalyst: 'Often Hype/PR without substance',
  },
  timeline: [
    {
      day: '1',
      title: 'Hype Day',
      volume: 'Extreme Vol',
      volumeLevel: 'high',
      description:
        'Stock rips on news. Retail FOMO chases at highs. Smart money selling into strength.',
    },
    {
      day: '2',
      title: 'The Hang',
      volume: 'Declining',
      volumeLevel: 'low',
      description:
        "Price refuses to go higher but holds. Retail thinks 'flagging'. Distribution occurring.",
    },
    {
      day: '3',
      title: 'The Flush',
      volume: 'Increasing',
      volumeLevel: 'squeeze',
      description:
        'Support cracks. Stop losses trigger. Panic selling ensues. The rug is pulled.',
    },
    {
      day: '4',
      title: 'Aftermath',
      volume: 'Low',
      volumeLevel: 'low',
      description: 'Stock fades into oblivion. Bagholders trapped for months.',
    },
  ],
  variations: [
    { title: 'Gap & Crap', desc: 'Gaps up on Day 2, immediately sold off.' },
    {
      title: 'Double Top',
      desc: 'Re-tests Day 1 highs on lower volume, then fails.',
    },
    {
      title: 'First Red Day',
      desc: 'Classic setup where the first close red signals trend change.',
    },
    {
      title: 'Parabolic Short',
      desc: 'Stock went up too fast, must revert to mean.',
    },
  ],
  mechanics: [
    'Retail is stuck holding heavy bags from Day 1 highs.',
    'When price drops below Day 1 lows, hope turns to fear.',
    'Stop losses trigger a chain reaction of selling.',
    'No buyers left, causing a vacuum drop.',
  ],
};

// --- Sub-Components ---

const StatCard = ({ label, value, sub, colorClass, icon: Icon }: any) => (
  <motion.div
    whileHover={{ y: -4 }}
    className={cn(
      'relative overflow-hidden rounded-xl p-4 border backdrop-blur-md',
      'bg-gray-900/40 border-gray-700/50 hover:border-opacity-100 transition-colors'
    )}
  >
    <div className={`absolute top-0 right-0 p-3 opacity-20 ${colorClass}`}>
      <Icon size={40} />
    </div>
    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
      {label}
    </p>
    <div className="text-xl font-bold text-white mb-1">{value}</div>
    {sub && (
      <div className={cn('text-xs font-semibold', colorClass)}>{sub}</div>
    )}
  </motion.div>
);

const RiskIndicator = ({ level }: { level: number }) => (
  <div className="flex gap-1.5 mt-2">
    {[1, 2, 3, 4, 5].map((dot) => (
      <motion.div
        key={dot}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: dot * 0.1 }}
        className={cn(
          'w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]',
          dot <= level
            ? 'bg-gradient-to-tr from-blue-600 via-blue-400 to-blue-200'
            : 'bg-gray-800'
        )}
      />
    ))}
  </div>
);

const TimelineCard = ({
  data,
  index,
  isLast,
}: {
  data: any;
  index: number;
  isLast: boolean;
}) => {
  const isHigh = data.volumeLevel === 'high';
  const isSqueeze = data.volumeLevel === 'squeeze';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
      className="relative flex-1 min-w-0 basis-0"
    >
      <div
        className={cn(
          'h-full p-5 rounded-xl border flex flex-col items-center text-center transition-all duration-300 w-full max-w-full',
          isHigh
            ? 'bg-red-950/20 border-red-500/30'
            : isSqueeze
            ? 'bg-emerald-950/30 border-emerald-400/50 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
            : 'bg-gray-900/40 border-gray-700/50'
        )}
      >
        <div className="text-3xl font-black mb-2 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
          {data.day}
        </div>
        <div className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">
          {data.title}
        </div>

        <div
          className={cn(
            'w-full py-1.5 rounded text-xs font-bold mb-4',
            isHigh
              ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
              : isSqueeze
              ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white animate-pulse'
              : 'bg-gray-800 text-gray-400'
          )}
        >
          {data.volume}
        </div>

        <p className="text-sm text-gray-300 leading-relaxed break-words overflow-wrap-anywhere">
          {data.description}
        </p>
      </div>

      {!isLast && (
        <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 text-gray-600 pointer-events-none">
          <Zap size={16} className="transform rotate-[-90deg]" />
        </div>
      )}
    </motion.div>
  );
};

// --- Main Component ---

const LiquidityLesson: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SetupDirection>('long');
  const data = activeTab === 'long' ? LONG_DATA : SHORT_DATA;
  const themeColor = activeTab === 'long' ? 'text-fuchsia-400' : 'text-red-400';
  const gradientBtn =
    activeTab === 'long'
      ? 'from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500'
      : 'from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500';

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-8 font-sans text-gray-100 pb-20 overflow-x-clip">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900 border border-gray-700 text-xs font-medium text-gray-400 mb-2">
          <BookOpen size={14} /> Lesson 04: The Setup Arsenal
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
          <span
            className={cn(
              'bg-clip-text text-transparent bg-gradient-to-r',
              activeTab === 'long'
                ? 'from-blue-400 via-blue-200 to-white'
                : 'from-red-400 via-orange-400 to-white'
            )}
          >
            {data.title} Setup
          </span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          {data.subtitle}
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex justify-center mb-10">
        <div className="bg-gray-900/80 p-1.5 rounded-xl border border-gray-700/50 flex gap-2 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('long')}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300',
              activeTab === 'long'
                ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg shadow-blue-900/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            <TrendingUp size={16} /> LONG SETUP
          </button>
          <button
            onClick={() => setActiveTab('short')}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300',
              activeTab === 'short'
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-900/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            <TrendingDown size={16} /> SHORT SETUP
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* Terminology Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-700 bg-gray-900/30 p-6 md:p-8">
            <div
              className={cn(
                'absolute inset-0 opacity-10 bg-gradient-to-br',
                activeTab === 'long'
                  ? 'from-blue-500 to-blue-900'
                  : 'from-red-500 to-orange-900'
              )}
            />
            <div className="relative z-10">
              <h3
                className={cn(
                  'text-lg font-bold flex items-center gap-2 mb-3',
                  themeColor
                )}
              >
                <BookOpen size={20} /> {data.terminology.title}
              </h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                {data.terminology.content}
              </p>
              <div
                className={cn(
                  'p-3 rounded-lg border border-opacity-20 bg-opacity-10 text-sm font-semibold',
                  activeTab === 'long'
                    ? 'bg-yellow-500 border-yellow-400 text-yellow-200'
                    : 'bg-blue-500 border-blue-400 text-blue-200'
                )}
              >
                💡 {data.terminology.highlight}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <StatCard
              label="Setup Duration"
              value={data.details.duration}
              icon={Clock}
              colorClass={themeColor}
            />
            <StatCard
              label="Entry Window"
              value={data.details.entryTime}
              icon={Target}
              colorClass={themeColor}
            />
            <motion.div
              whileHover={{ y: -4 }}
              className="relative overflow-hidden rounded-xl p-4 border backdrop-blur-md bg-gray-900/40 border-gray-700/50 col-span-1"
            >
              <div
                className={`absolute top-0 right-0 p-3 opacity-20 ${themeColor}`}
              >
                <AlertTriangle size={40} />
              </div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                Risk Level
              </p>
              <RiskIndicator level={data.details.riskLevel} />
              <div className="mt-2 text-xs text-gray-400">Moderate Risk</div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="relative overflow-hidden rounded-xl p-4 border backdrop-blur-md bg-gray-900/40 border-gray-700/50 col-span-1"
            >
              <div
                className={`absolute top-0 right-0 p-3 opacity-20 ${themeColor}`}
              >
                <Activity size={40} />
              </div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                Success Rate
              </p>
              <div className="flex items-end gap-2">
                <span
                  className={cn(
                    'text-2xl font-bold',
                    activeTab === 'long'
                      ? 'text-emerald-400'
                      : 'text-emerald-400'
                  )}
                >
                  {data.details.successRate}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-700 rounded-full mt-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${data.details.successRate}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={cn(
                    'h-full rounded-full',
                    activeTab === 'long' ? 'bg-emerald-500' : 'bg-emerald-500'
                  )}
                />
              </div>
            </motion.div>
          </div>

          {/* Setup Details Card */}
          <div className="grid md:grid-cols-2 gap-4 w-full">
            <div className="bg-gray-950/50 p-6 rounded-2xl border border-gray-800">
              <h4 className="text-gray-400 uppercase text-xs font-bold tracking-widest mb-4">
                Core Requirements
              </h4>
              <ul className="space-y-4">
                <li className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <span className="text-gray-400 text-sm">Volume Pattern</span>
                  <span
                    className={cn(
                      'font-medium text-sm text-right',
                      activeTab === 'long' ? 'text-red-400' : 'text-fuchsia-400'
                    )}
                  >
                    {data.details.volumeProfile}
                  </span>
                </li>
                <li className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <span className="text-gray-400 text-sm">Risk/Reward</span>
                  <span className="font-medium text-white text-sm">
                    {data.details.riskReward}
                  </span>
                </li>
                <li className="flex justify-between items-center pb-2">
                  <span className="text-gray-400 text-sm">Catalyst</span>
                  <span className="font-medium text-white text-sm text-right max-w-[50%]">
                    {data.details.catalyst}
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-950/50 p-6 rounded-2xl border border-gray-800">
              <h4 className="text-gray-400 uppercase text-xs font-bold tracking-widest mb-4">
                Why It Works (Mechanics)
              </h4>
              <div className="space-y-3">
                {data.mechanics.map((mech, i) => (
                  <div key={i} className="flex gap-3 text-sm text-gray-300">
                    <div className={cn('mt-1 min-w-[16px]', themeColor)}>
                      <CheckCircle2 size={16} />
                    </div>
                    <p>{mech}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline Visual */}
          <div className="py-6 w-full overflow-x-clip">
            <div className="flex items-center gap-2 mb-6">
              <BarChart2 className={themeColor} size={24} />
              <h3 className="text-xl font-bold">Volume & Time Sequence</h3>
            </div>

            <div className="flex flex-col md:flex-row gap-4 md:gap-2 w-full">
              {data.timeline.map((item, idx) => (
                <TimelineCard
                  key={idx}
                  data={item}
                  index={idx}
                  isLast={idx === data.timeline.length - 1}
                />
              ))}
            </div>
          </div>

          {/* Variations */}
          <div className="bg-gradient-to-b from-gray-900/50 to-gray-950/80 rounded-2xl border border-gray-800 p-6 md:p-8 w-full">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Lock size={20} className={themeColor} /> Pattern Variations
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {data.variations.map((v, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-900 border border-gray-700/50 p-4 rounded-xl hover:border-gray-500 transition-colors"
                >
                  <h5 className={cn('font-bold mb-2 text-sm', themeColor)}>
                    {v.title}
                  </h5>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {v.desc}
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

export default LiquidityLesson;
