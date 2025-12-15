
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimelineAndComparison } from './TimelineAndComparison';
import { SetupCard } from './SetupCard';
import { SetupData, TimelineEvent, ComparisonPoint } from './types';
import { cn } from '../../../lib/utils';
import { LayoutDashboard, TrendingUp, TrendingDown } from 'lucide-react';

const OrbGapCheatSheet: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'long' | 'short'>(
    'timeline'
  );

  const longData: SetupData = {
    id: 'orb-long',
    title: 'Opening Range Breakout',
    type: 'long',
    category: 'Breakout / Structure',
    complementary: 'Gap Up Short',
    timeOfDay: '9:30 AM - 10:00 AM EST',
    idealTimeframe: {
      entry: '5-minute',
      exit: '5-15 minute',
    },
    riskLevel: {
      label: 'Low-Medium',
      level: 2,
    },
    successRate: {
      range: '65-75%',
      percentage: 70,
    },
    riskReward: '1:2 to 1:4',
    volumeReq: 'Explosive on Breakout',
    volumeReqSub: 'Must be low during pre-market consolidation',
    floatPref: '1M - 20M shares',
    floatPrefSub: 'Ideal under 10M',
    catalyst: {
      required: true,
      points: [
        'Pre-market news or event',
        'Clean consolidation pattern (30-90m)',
        'Volume drops during consolidation',
        'Defined range with clear high/low',
      ],
    },
  };

  const shortData: SetupData = {
    id: 'gap-up-short',
    title: 'Gap Up Short',
    type: 'short',
    category: 'Reversal / Exhaustion',
    complementary: 'Opening Range Breakout',
    timeOfDay: '9:30 AM - 10:30 AM EST',
    idealTimeframe: {
      entry: '5-minute',
      exit: '5-30 minute',
    },
    riskLevel: {
      label: 'High',
      level: 4,
    },
    successRate: {
      range: '60-70%',
      percentage: 65,
    },
    riskReward: '1:1.5 to 1:3',
    volumeReq: 'Declining on new highs',
    volumeReqSub: 'Divergence is key signal',
    floatPref: '1M - 10M shares',
    floatPrefSub: 'Lower float = Squeeze Risk',
    catalyst: {
      required: true,
      points: [
        'Ideally weak or "fluffy" news',
        'Parabolic move with NO consolidation',
        'Opens at or near pre-market highs',
        'Exhaustion signals (shooting star)',
      ],
    },
  };

  const timelineEvents: TimelineEvent[] = [
    {
      time: '7:00 AM',
      longAction: {
        title: 'Initial Momentum',
        desc: 'News drops, price spikes with high volume. First leg up established.',
      },
      shortAction: {
        title: 'Parabolic Launch',
        desc: 'News drops, price rips vertically. No pullback, aggressive chasing.',
      },
    },
    {
      time: '8:30 AM',
      longAction: {
        title: 'Consolidation Phase',
        desc: 'Price goes sideways. Volume dries up significantly. Structure forms.',
      },
      shortAction: {
        title: 'Extension Phase',
        desc: 'Price keeps grinding higher but volume is fading. Divergence begins.',
      },
    },
    {
      time: '9:30 AM',
      longAction: {
        title: 'The Breakout',
        desc: 'Market opens. Price breaks PM high with explosive volume. Entry trigger.',
      },
      shortAction: {
        title: 'The Trap / Open',
        desc: 'Opens at highs. Buyers exhausted. MMs might hold price artificially.',
      },
    },
    {
      time: '10:00 AM',
      longAction: {
        title: 'Profit Taking',
        desc: 'First target hit. Momentum slows. Lock in gains or trail tight.',
      },
      shortAction: {
        title: 'The Fade',
        desc: 'Support breaks. Late longs bail. Price cascades down. Short entry.',
      },
    },
  ];

  const comparisonPoints: ComparisonPoint[] = [
    {
      category: 'Structure',
      long: 'Requires clean, low-volume consolidation',
      short: 'Thrives on parabolic, unstructured chaos',
    },
    {
      category: 'Volume',
      long: 'Volume expands on the move up',
      short: 'Volume declines while price goes up',
    },
    {
      category: 'VWAP',
      long: 'Consolidates ABOVE or AT VWAP',
      short: 'Extended FAR ABOVE VWAP (Rubber Band)',
    },
    {
      category: 'Catalyst',
      long: 'Material news (real value)',
      short: 'Fluff / PR stunts (hype)',
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 font-sans">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight text-slate-100">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-400 to-blue-200">
            Setup Cheat Sheet
          </span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base font-medium uppercase tracking-wider">
          ORB Long vs. Gap Up Short
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-900/80 p-1 rounded-xl flex gap-1 border border-slate-800 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('timeline')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all',
              activeTab === 'timeline'
                ? 'bg-slate-700 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <LayoutDashboard size={16} />
            <span className="hidden sm:inline">Timeline & VS</span>
          </button>
          <button
            onClick={() => setActiveTab('long')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all',
              activeTab === 'long'
                ? 'bg-emerald-500/20 text-emerald-400 shadow-lg border border-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <TrendingUp size={16} />
            <span className="hidden sm:inline">ORB Long</span>
          </button>
          <button
            onClick={() => setActiveTab('short')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all',
              activeTab === 'short'
                ? 'bg-rose-500/20 text-rose-400 shadow-lg border border-rose-500/20'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <TrendingDown size={16} />
            <span className="hidden sm:inline">Gap Up Short</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[600px]">
        <AnimatePresence mode="wait">
          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <TimelineAndComparison
                timelineEvents={timelineEvents}
                comparisonPoints={comparisonPoints}
              />
            </motion.div>
          )}

          {activeTab === 'long' && (
            <motion.div
              key="long"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <SetupCard data={longData} />
            </motion.div>
          )}

          {activeTab === 'short' && (
            <motion.div
              key="short"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <SetupCard data={shortData} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrbGapCheatSheet;
