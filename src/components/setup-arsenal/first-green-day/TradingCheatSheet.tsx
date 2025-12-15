
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartVisualizer } from './ChartVisualizer';
import {
  TrendingDown,
  TrendingUp,
  Clock,
  BarChart2,
  AlertTriangle,
  Target,
  Zap,
  Info,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

type Tab = 'short' | 'long';

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 20 : -20,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 20 : -20,
    opacity: 0,
  }),
};

export const TradingCheatSheet: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('short');
  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection: number, tab: Tab) => {
    setPage([page + newDirection, newDirection]);
    setActiveTab(tab);
  };

  const isShort = activeTab === 'short';

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8  pb-20">
      {/* Header Section */}
      <div className="text-center mb-10 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400 text-xs font-mono uppercase tracking-widest"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          Cycle Turning Points
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-lg">
          <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Setup Cheat Sheet
          </span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
          Mastering the{' '}
          <span className="text-rose-400 font-semibold">First Red Day</span> &{' '}
          <span className="text-emerald-400 font-semibold">
            First Green Day
          </span>{' '}
          reversals on the daily timeframe.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-12">
        <div className="p-1.5 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 flex gap-2 shadow-2xl relative">
          {/* Tab: Short */}
          <button
            onClick={() => paginate(-1, 'short')}
            className={`relative px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-300 z-10 flex items-center gap-2 ${
              isShort ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {isShort && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-br from-rose-600 to-rose-700 rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.5)]"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              <TrendingDown
                className={`w-4 h-4 ${isShort ? 'text-white' : ''}`}
              />
              First Red Day
            </span>
          </button>

          {/* Tab: Long */}
          <button
            onClick={() => paginate(1, 'long')}
            className={`relative px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-300 z-10 flex items-center gap-2 ${
              !isShort ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {!isShort && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              <TrendingUp
                className={`w-4 h-4 ${!isShort ? 'text-white' : ''}`}
              />
              First Green Day
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <AnimatePresence initial={false} mode="wait" custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="w-full"
        >
          {/* Top Grid: Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={
                <Clock
                  className={isShort ? 'text-rose-400' : 'text-emerald-400'}
                />
              }
              label="Time of Day"
              value={isShort ? '9:30 - 10:00 AM' : '9:30 - 9:35 AM'}
              subValue={
                isShort ? 'Wait for open or PM gap' : 'First 5-min candle'
              }
              theme={isShort ? 'red' : 'green'}
            />
            <StatCard
              icon={
                <Target
                  className={isShort ? 'text-rose-400' : 'text-emerald-400'}
                />
              }
              label="Success Rate"
              value={isShort ? '60-75%' : '55-70%'}
              subValue={
                isShort ? 'Higher Probability' : 'Strict Risk Management'
              }
              theme={isShort ? 'red' : 'green'}
            />
            <StatCard
              icon={
                <BarChart2
                  className={isShort ? 'text-rose-400' : 'text-emerald-400'}
                />
              }
              label="Risk / Reward"
              value={isShort ? '1:2 to 1:4' : '1:3 to 1:5'}
              subValue={
                isShort ? 'Target Prev Close' : 'Target VWAP/Resistance'
              }
              theme={isShort ? 'red' : 'green'}
            />
            <StatCard
              icon={
                <AlertTriangle
                  className={isShort ? 'text-rose-400' : 'text-emerald-400'}
                />
              }
              label="Risk Level"
              value={isShort ? 'High' : 'Medium-High'}
              subValue="Counter-trend reversal"
              theme={isShort ? 'red' : 'green'}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Details & Scenarios */}
            <div className="lg:col-span-2 space-y-8">
              {/* Visualizer */}
              <ChartVisualizer />

              {/* Scenarios */}
              <div
                className={`rounded-2xl border backdrop-blur-xl p-6 md:p-8 ${
                  isShort
                    ? 'bg-rose-950/20 border-rose-500/20'
                    : 'bg-emerald-950/20 border-emerald-500/20'
                }`}
              >
                <h3
                  className={`text-2xl font-bold mb-6 flex items-center gap-3 ${
                    isShort ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  <Zap className="w-6 h-6 fill-current" />
                  Entry Scenarios
                </h3>

                <div className="grid gap-4">
                  {isShort ? (
                    <>
                      <ScenarioCard
                        title="Gap Up Entry"
                        desc="Stock gaps up in PM after 3-5 day run. Short at open (9:30) anticipating profit taking."
                        theme="red"
                      />
                      <ScenarioCard
                        title="Break of Prev Close"
                        desc="Gaps down or flat open. Wait for break and hold below previous day's close (Resistance)."
                        theme="red"
                      />
                      <ScenarioCard
                        title="Gap Down + Retest"
                        desc="Gaps down, rallies to retest previous close, rejects. Short the rejection."
                        theme="red"
                      />
                    </>
                  ) : (
                    <>
                      <ScenarioCard
                        title="First 5-Min Candle"
                        desc="After 2-4 red days. If first 5-min candle is GREEN, enter on close or high break."
                        theme="green"
                      />
                      <ScenarioCard
                        title="The Tight Risk"
                        desc="Stop loss goes immediately below the low of the first 5-min candle. Excellent R/R."
                        theme="green"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Context & Logic */}
            <div className="space-y-6">
              {/* Context Box */}
              <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
                <h4 className="text-slate-300 font-bold flex items-center gap-2 mb-4">
                  <Info className="w-4 h-4 text-blue-400" />
                  Required Catalyst
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {isShort
                    ? 'Context Dependent. Requires a 3-5 day multi-day run where the stock is overextended on the daily chart. Previous close acts as key pivot level.'
                    : 'Context Dependent. Requires 2-4 days of red (post-FRD) where stock is down 40-70% from highs. We are looking for a short-term relief bounce.'}
                </p>
              </div>

              {/* Key Differences List */}
              <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
                <h4 className="text-slate-300 font-bold mb-4">
                  Why this works
                </h4>
                <ul className="space-y-4">
                  {isShort ? (
                    <>
                      <ListItem
                        theme="red"
                        text="Longs are taking profits (exhaustion)"
                      />
                      <ListItem
                        theme="red"
                        text="Shorts attacking for mean reversion"
                      />
                      <ListItem
                        theme="red"
                        text="Volume spike signals distribution"
                      />
                      <ListItem
                        theme="red"
                        text="High probability of multi-day fade"
                      />
                    </>
                  ) : (
                    <>
                      <ListItem
                        theme="green"
                        text="Shorts covering profitable positions"
                      />
                      <ListItem
                        theme="green"
                        text="Relief buyers stepping in for bounce"
                      />
                      <ListItem
                        theme="green"
                        text="Oversold conditions (RSI < 30 often)"
                      />
                      <ListItem theme="green" text="Momentum shift at open" />
                    </>
                  )}
                </ul>
              </div>

              {/* Warning */}
              <div className="bg-orange-900/20 border border-orange-500/20 rounded-xl p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-orange-400 font-bold text-sm mb-1">
                    Risk Warning
                  </h5>
                  <p className="text-orange-300/70 text-xs">
                    {isShort
                      ? 'If wrong, stock can squeeze higher. Respect stops at High of Day (HOD).'
                      : 'If wrong, stock continues to dump (Dead Cat Bounce failure). Keep stops tight.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// --- Sub Components ---

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue: string;
  theme: 'red' | 'green';
}> = ({ icon, label, value, subValue, theme }) => (
  <div
    className={`p-5 rounded-2xl border backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg group ${
      theme === 'red'
        ? 'bg-rose-950/10 border-rose-900/20 hover:border-rose-500/30 shadow-rose-900/5'
        : 'bg-emerald-950/10 border-emerald-900/20 hover:border-emerald-500/30 shadow-emerald-900/5'
    }`}
  >
    <div className="flex items-start justify-between mb-2">
      <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
        {label}
      </span>
      <div
        className={`p-2 rounded-lg ${
          theme === 'red' ? 'bg-rose-500/10' : 'bg-emerald-500/10'
        }`}
      >
        {icon}
      </div>
    </div>
    <div className="text-xl font-bold text-slate-100 group-hover:text-white transition-colors">
      {value}
    </div>
    <div className="text-xs text-slate-500 mt-1">{subValue}</div>
  </div>
);

const ScenarioCard: React.FC<{
  title: string;
  desc: string;
  theme: 'red' | 'green';
}> = ({ title, desc, theme }) => (
  <div
    className={`p-4 rounded-xl border transition-all hover:bg-opacity-50 ${
      theme === 'red'
        ? 'bg-rose-950/40 border-rose-500/10 hover:border-rose-500/30'
        : 'bg-emerald-950/40 border-emerald-500/10 hover:border-emerald-500/30'
    }`}
  >
    <h4
      className={`font-bold mb-2 flex items-center gap-2 ${
        theme === 'red' ? 'text-rose-200' : 'text-emerald-200'
      }`}
    >
      {theme === 'red' ? (
        <XCircle className="w-4 h-4" />
      ) : (
        <CheckCircle2 className="w-4 h-4" />
      )}
      {title}
    </h4>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const ListItem: React.FC<{ text: string; theme: 'red' | 'green' }> = ({
  text,
  theme,
}) => (
  <li className="flex items-start gap-3 text-sm text-slate-400">
    <div
      className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
        theme === 'red' ? 'bg-rose-500' : 'bg-emerald-500'
      }`}
    />
    {text}
  </li>
);
