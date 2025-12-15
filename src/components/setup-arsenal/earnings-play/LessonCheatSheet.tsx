
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Target,
  BarChart2,
  Zap,
  BookOpen,
  CheckCircle2,
  XCircle,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Shared Components ---

const RiskMeter = ({ level }: { level: 1 | 2 | 3 | 4 | 5 }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={cn(
            'w-2.5 h-2.5 rounded-full transition-all duration-500',
            i <= level
              ? 'bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]'
              : 'bg-gray-700/50'
          )}
        />
      ))}
    </div>
  );
};

const SuccessBar = ({ percent }: { percent: number }) => {
  return (
    <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden mt-2">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        className="h-full bg-gradient-to-r from-teal-500 to-emerald-400"
      />
    </div>
  );
};

const InfoCard = ({ label, value, sub, icon: Icon, color = 'teal' }: any) => (
  <motion.div
    whileHover={{ y: -2, backgroundColor: 'rgba(15, 118, 110, 0.2)' }}
    className="bg-gray-800/40 border border-gray-700/50 p-4 rounded-xl backdrop-blur-sm relative overflow-hidden group"
  >
    <div
      className={cn(
        'absolute top-0 left-0 w-1 h-full',
        color === 'teal'
          ? 'bg-teal-500'
          : color === 'yellow'
          ? 'bg-amber-500'
          : color === 'red'
          ? 'bg-rose-500'
          : 'bg-emerald-500'
      )}
    />
    <div className="flex items-start justify-between mb-2">
      <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
        {label}
      </span>
      {Icon && (
        <Icon className="w-4 h-4 text-gray-500 group-hover:text-teal-400 transition-colors" />
      )}
    </div>
    <div className="font-semibold text-gray-100 text-lg">{value}</div>
    {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
  </motion.div>
);

// --- Content Views ---

const EarningsView = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="space-y-6"
  >
    {/* Header Stats */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <InfoCard
        label="Timing"
        value="Day AFTER"
        sub="React to overnight move"
        icon={Clock}
      />
      <InfoCard
        label="Entry Window"
        value="9:30 - 10:00 AM"
        sub="Open Reaction"
        icon={Target}
      />
      <InfoCard
        label="Risk/Reward"
        value="1:2 to 1:4"
        color="emerald"
        icon={BarChart2}
      />
      <div className="bg-gray-800/40 border border-gray-700/50 p-4 rounded-xl backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
          Win Rate
        </div>
        <div className="text-emerald-400 font-bold text-lg">50-65%</div>
        <SuccessBar percent={57} />
      </div>
    </div>

    {/* Scenarios */}
    <div className="grid md:grid-cols-2 gap-6">
      {/* Short Scenario */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <TrendingDown size={80} />
        </div>
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-rose-500/20 text-rose-400 px-3 py-1 rounded-full text-xs font-bold border border-rose-500/30">
            SCENARIO 1
          </span>
          <h3 className="text-xl font-bold text-white">Beat & Gap Up</h3>
        </div>
        <div className="text-gray-300 text-sm mb-4 leading-relaxed">
          The stock beats expectations and gaps up 10-20%+. The market sentiment
          is <span className="text-rose-300">over-euphoric</span>.
        </div>
        <div className="bg-gray-950/50 rounded-xl p-4 border border-rose-500/20">
          <div className="text-rose-400 text-xs uppercase font-bold mb-2 flex items-center gap-2">
            <Zap size={12} /> The Play (Short)
          </div>
          <ul className="text-sm space-y-2 text-gray-300">
            <li className="flex gap-2">
              <ArrowRight size={14} className="mt-1 text-rose-500" /> Wait for
              9:30 AM Open
            </li>
            <li className="flex gap-2">
              <ArrowRight size={14} className="mt-1 text-rose-500" /> Short the
              overextension
            </li>
            <li className="flex gap-2">
              <ArrowRight size={14} className="mt-1 text-rose-500" /> Target:
              Partial Gap Fill
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Long Scenario */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <TrendingUp size={80} />
        </div>
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
            SCENARIO 2
          </span>
          <h3 className="text-xl font-bold text-white">Miss & Gap Down</h3>
        </div>
        <div className="text-gray-300 text-sm mb-4 leading-relaxed">
          The stock misses expectations and gaps down 10-20%+. The market
          sentiment is <span className="text-emerald-300">panic selling</span>.
        </div>
        <div className="bg-gray-950/50 rounded-xl p-4 border border-emerald-500/20">
          <div className="text-emerald-400 text-xs uppercase font-bold mb-2 flex items-center gap-2">
            <Zap size={12} /> The Play (Long)
          </div>
          <ul className="text-sm space-y-2 text-gray-300">
            <li className="flex gap-2">
              <ArrowRight size={14} className="mt-1 text-emerald-500" /> Wait
              for 9:30 AM Open
            </li>
            <li className="flex gap-2">
              <ArrowRight size={14} className="mt-1 text-emerald-500" /> Buy the
              panic dip
            </li>
            <li className="flex gap-2">
              <ArrowRight size={14} className="mt-1 text-emerald-500" /> Target:
              Partial Gap Fill
            </li>
          </ul>
        </div>
      </motion.div>
    </div>

    {/* Resources */}
    <div className="bg-amber-900/10 border border-amber-500/30 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4">
      <div className="p-3 bg-amber-500/20 rounded-full">
        <BookOpen className="text-amber-400" size={20} />
      </div>
      <div className="flex-1">
        <h4 className="text-amber-400 font-bold text-sm uppercase">
          Required Tools
        </h4>
        <div className="flex flex-wrap gap-2 mt-2">
          {[
            'NewsEdge Feed',
            'TheFly.com',
            'EarningsWhispers',
            'Twitter (X)',
          ].map((tool) => (
            <span
              key={tool}
              className="bg-gray-800 text-gray-300 px-3 py-1 rounded-md text-xs border border-gray-700"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

const EpisodicView = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="space-y-6"
  >
    {/* Header Stats */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <InfoCard
        label="Timeframe"
        value="SWING"
        sub="Weeks to Months"
        icon={Activity}
        color="teal"
      />
      <InfoCard
        label="Volume"
        value="2x - 10x"
        sub="Catalyst Day Surge"
        icon={BarChart2}
        color="teal"
      />
      <InfoCard
        label="Risk/Reward"
        value="1:5 to 1:20+"
        color="emerald"
        icon={Target}
      />
      <div className="bg-gray-800/40 border border-gray-700/50 p-4 rounded-xl backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
        <div className="flex justify-between items-start">
          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
            Difficulty
          </div>
          <div className="text-rose-400 text-xs font-bold bg-rose-900/40 px-2 py-0.5 rounded">
            ADVANCED
          </div>
        </div>
        <div className="mt-2">
          <RiskMeter level={5} />
        </div>
      </div>
    </div>

    {/* The Concept */}
    <div className="bg-teal-900/10 border border-teal-500/20 rounded-xl p-5 text-center">
      <h3 className="text-teal-400 font-bold text-lg mb-2">The Definition</h3>
      <p className="text-gray-300 text-sm max-w-2xl mx-auto">
        A significant catalyst that changes a company's trajectory (Tech
        breakthrough, FDA approval, Major contract).
        <span className="block mt-2 font-semibold text-teal-200">
          Challenge: Distinguishing REAL from FAKE pivots.
        </span>
      </p>
    </div>

    {/* 3 Outcomes */}
    <div className="grid md:grid-cols-3 gap-4">
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-gray-800/50 border border-amber-500/30 rounded-xl p-5"
      >
        <div className="text-2xl mb-2">🤷‍♂️</div>
        <h4 className="text-amber-400 font-bold mb-2">1. Consolidation</h4>
        <p className="text-xs text-gray-400 mb-3">
          Volume surge, then sideways for weeks. No follow-through.
        </p>
        <div className="text-xs bg-gray-900 p-2 rounded text-gray-300 border border-gray-700">
          <span className="font-bold text-amber-500">Action:</span> Wait for
          breakout.
        </div>
      </motion.div>

      <motion.div
        whileHover={{ y: -5 }}
        className="bg-gray-800/50 border border-rose-500/30 rounded-xl p-5"
      >
        <div className="text-2xl mb-2">📉</div>
        <h4 className="text-rose-400 font-bold mb-2">2. Failed Breakout</h4>
        <p className="text-xs text-gray-400 mb-3">
          Pushes 2-3 days then fails and fades back to pre-catalyst levels.
        </p>
        <div className="text-xs bg-gray-900 p-2 rounded text-gray-300 border border-gray-700">
          <span className="font-bold text-rose-500">Action:</span> EXIT
          immediately.
        </div>
      </motion.div>

      <motion.div
        whileHover={{ y: -5 }}
        className="bg-gray-800/50 border border-emerald-500/30 rounded-xl p-5 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
      >
        <div className="text-2xl mb-2">🚀</div>
        <h4 className="text-emerald-400 font-bold mb-2">3. The Real Deal</h4>
        <p className="text-xs text-gray-400 mb-3">
          Grinds higher slowly. Staircase pattern. Multi-month runner.
        </p>
        <div className="text-xs bg-gray-900 p-2 rounded text-gray-300 border border-gray-700">
          <span className="font-bold text-emerald-500">Action:</span> Hold &
          Trail Stops.
        </div>
      </motion.div>
    </div>

    {/* Warning */}
    <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-4 flex gap-4 items-start">
      <AlertTriangle className="text-rose-500 shrink-0 mt-1" />
      <div>
        <h4 className="text-rose-400 font-bold text-sm">Mastery Warning</h4>
        <p className="text-rose-200/70 text-xs mt-1 leading-relaxed">
          This setup made Kristjan Kullamägi millions, but it requires extensive
          trial & error. High failure rate initially.{' '}
          <span className="font-semibold text-rose-300">
            Not for beginners.
          </span>
        </p>
      </div>
    </div>
  </motion.div>
);

// --- Main Wrapper ---

const LessonCheatSheet = () => {
  const [activeTab, setActiveTab] = useState<'earnings' | 'episodic'>(
    'earnings'
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-200 bg-clip-text text-transparent drop-shadow-sm">
          Setup Cheat Sheet
        </h1>
        <p className="text-gray-400 text-lg">
          Event-Driven Catalysts & Rare Momentum Shifts
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex justify-center mb-10">
        <div className="bg-gray-900/60 p-1.5 rounded-2xl border border-gray-700/50 backdrop-blur-md flex shadow-inner">
          <button
            onClick={() => setActiveTab('earnings')}
            className={cn(
              'px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2',
              activeTab === 'earnings'
                ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(20,184,166,0.4)]'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            )}
          >
            <Zap size={16} />
            Earnings Plays
          </button>
          <button
            onClick={() => setActiveTab('episodic')}
            className={cn(
              'px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2',
              activeTab === 'episodic'
                ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(20,184,166,0.4)]'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            )}
          >
            <TrendingUp size={16} />
            Episodic Pivot
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative min-h-[500px]">
        <AnimatePresence mode="wait">
          {activeTab === 'earnings' ? (
            <EarningsView key="earnings" />
          ) : (
            <EpisodicView key="episodic" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LessonCheatSheet;
