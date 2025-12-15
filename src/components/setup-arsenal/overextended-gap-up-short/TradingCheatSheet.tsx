
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Clock,
  BarChart2,
  Target,
  Zap,
  Activity,
  ArrowRightLeft,
  Info,
  CheckCircle2,
  Timer,
  AlertOctagon,
  Layers,
} from 'lucide-react';
import VisualChart from './VisualChart';
import { cn } from '@/lib/utils';

// --- Reusable Small Components ---

interface DetailCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
  colorClass: string;
  highlight?: boolean;
  subtext?: string;
}

const DetailCard: React.FC<DetailCardProps> = ({
  label,
  value,
  icon: Icon,
  colorClass,
  highlight = false,
  subtext,
}) => (
  <div
    className={cn(
      'bg-slate-900/40 p-4 rounded-xl border border-slate-800 backdrop-blur-sm transition-all duration-300 hover:bg-slate-800/60 group',
      highlight && 'border-l-2',
      highlight &&
        (colorClass.includes('orange')
          ? 'border-l-orange-500'
          : colorClass.includes('lime')
          ? 'border-l-lime-500'
          : 'border-l-amber-500')
    )}
  >
    <div className="flex items-center gap-2 mb-2 text-slate-400 group-hover:text-slate-300 transition-colors">
      {Icon && <Icon size={14} />}
      <span className="text-[10px] uppercase tracking-widest font-bold">
        {label}
      </span>
    </div>
    <div className={cn('text-lg font-bold flex flex-col', colorClass)}>
      {value}
      {subtext && (
        <span className="text-xs font-normal text-slate-500 mt-1">
          {subtext}
        </span>
      )}
    </div>
  </div>
);

const RiskIndicator = ({
  level,
  colorClass,
}: {
  level: number;
  colorClass: string;
}) => {
  return (
    <div className="flex gap-1.5 mt-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={cn(
            'w-full h-1.5 rounded-full transition-all duration-500',
            i <= level ? colorClass : 'bg-slate-800'
          )}
        />
      ))}
    </div>
  );
};

const SuccessBar = ({
  percent,
  colorClass,
}: {
  percent: number;
  colorClass: string;
}) => (
  <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${percent}%` }}
      transition={{ duration: 1, delay: 0.2, ease: 'circOut' }}
      className={cn(
        'h-full rounded-full shadow-[0_0_10px_currentColor]',
        colorClass
      )}
    />
  </div>
);

// --- Data Definitions ---

const SHORT_DATA = {
  title: 'Overextended Gap Up Short',
  badge: 'SHORT ↘',
  theme: 'orange',
  details: [
    {
      label: 'Category',
      value: 'Gap Reversal/Exhaustion',
      highlight: 'text-orange-400',
    },
    {
      label: 'Complementary',
      value: 'Overextended Gap Down Long',
      highlight: 'text-lime-400',
    },
    {
      label: 'Time of Day',
      value: '9:30 - 11:00 AM EST',
      sub: 'Watch for washout first',
    },
    {
      label: 'Timeframe',
      value: 'Daily Context',
      sub: 'Entry: 5-15min',
      highlight: 'text-orange-400',
    },
    { label: 'Risk Level', value: 'High', dots: 4, color: 'bg-red-500' },
    {
      label: 'Win Rate',
      value: '55-70%',
      progress: 62,
      color: 'bg-gradient-to-r from-orange-500 to-red-600',
    },
    { label: 'Risk/Reward', value: '1:2 to 1:4', highlight: 'text-yellow-400' },
    {
      label: 'Volume',
      value: 'Extremely High',
      sub: 'Emotional spike at open',
    },
    {
      label: 'Catalyst',
      value: 'MULTI-DAY RUN + GAP UP',
      fullWidth: true,
      sub: '3-5 day run (FRD context). Must gap above prev close. Extreme retail emotions.',
      highlight: 'text-orange-400',
    },
  ],
  scenarios: [
    {
      title: 'Immediate Fade',
      desc: 'Gaps up, opens, immediately breaks support. Target gap fill.',
    },
    {
      title: 'Washout Then Fade',
      desc: 'Shakes out early shorts with false strength, then volume dies and fades.',
    },
    {
      title: 'Rally & Fail',
      desc: 'Pushes higher above gap, traps late longs, then fails hard. Short the break of gap open.',
    },
    {
      title: 'Prev Close Test',
      desc: 'Fades to prev close. If it breaks below, it confirms First Red Day conversion.',
    },
  ],
  conversion: {
    title: 'Conversion → First Red Day',
    items: [
      'Gaps up above prev close',
      'Opens with extreme emotions',
      'Closes BELOW prev close',
      'Converts to First Red Day',
    ],
  },
};

const LONG_DATA = {
  title: 'Overextended Gap Down Long',
  badge: 'LONG ↗',
  theme: 'lime',
  details: [
    {
      label: 'Category',
      value: 'Gap Reversal/Relief',
      highlight: 'text-lime-400',
    },
    {
      label: 'Complementary',
      value: 'Overextended Gap Up Short',
      highlight: 'text-orange-400',
    },
    {
      label: 'Time of Day',
      value: '9:30 - 10:30 AM EST',
      sub: 'Gap fill potential',
    },
    {
      label: 'Timeframe',
      value: 'Daily Context',
      sub: 'Entry: 5min',
      highlight: 'text-lime-400',
    },
    {
      label: 'Risk Level',
      value: 'Medium-High',
      dots: 3,
      color: 'bg-orange-500',
    },
    {
      label: 'Win Rate',
      value: '50-65%',
      progress: 57,
      color: 'bg-gradient-to-r from-lime-500 to-green-600',
    },
    { label: 'Risk/Reward', value: '1:3 to 1:5', highlight: 'text-lime-400' },
    { label: 'Volume', value: 'High Panic Volume', sub: 'Then reversal surge' },
    {
      label: 'Catalyst',
      value: 'MULTI-DAY SELLOFF + GAP DOWN',
      fullWidth: true,
      sub: '2-4 red days (FGD context). Must gap down below prev close. Anticipate relief.',
      highlight: 'text-lime-400',
    },
  ],
  scenarios: [
    {
      title: 'Immediate Reversal',
      desc: 'Gaps down, immediately finds buyers. Entry on first 5m green candle.',
    },
    {
      title: 'Double Bottom',
      desc: 'Makes a low, retests it, holds. Entry on the rip from the second bottom.',
    },
    {
      title: 'Slow Grind',
      desc: 'Slowly grinds back toward prev close. Add on higher highs.',
    },
    {
      title: 'Failed Breakdown',
      desc: 'Tries to break lower, fails, reclaims gap open. Shorts trapped.',
    },
  ],
  conversion: {
    title: 'Conversion → First Green Day',
    items: [
      'Gaps down below prev close',
      'Opens with panic selling',
      'Closes ABOVE prev close',
      'Converts to First Green Day',
    ],
  },
};

const TradingCheatSheet: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'short' | 'long'>('short');
  const data = activeTab === 'short' ? SHORT_DATA : LONG_DATA;
  const isShort = activeTab === 'short';

  const themeColor = isShort ? 'text-orange-400' : 'text-lime-400';
  const bgTheme = isShort ? 'bg-orange-500' : 'bg-lime-500';
  const borderTheme = isShort ? 'border-orange-500/30' : 'border-lime-500/30';

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 pb-20 font-sans text-slate-200">
      {/* Header */}
      <div className="text-center mb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-slate-400 text-xs font-mono mb-4 shadow-lg"
        >
          <Clock size={12} className={themeColor} />
          <span>LESSON 4.6</span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span className="text-slate-300">EST: 9:30 AM - 11:00 AM</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-slate-300 to-slate-500"
        >
          Overextended{' '}
          <span
            className={
              isShort ? 'text-orange-400' : 'text-slate-500 transition-colors'
            }
          >
            Gap Up Short
          </span>{' '}
          &{' '}
          <span
            className={
              !isShort ? 'text-lime-400' : 'text-slate-500 transition-colors'
            }
          >
            Gap Down Long
          </span>
        </motion.h1>
        <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto">
          Daily overextension with gap psychology | Advanced FRD/FGD variations.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex justify-center mb-10 sticky top-2 z-50">
        <div className="bg-slate-950/90 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-800/50 flex gap-2 shadow-2xl ring-1 ring-white/5">
          <button
            onClick={() => setActiveTab('short')}
            className={cn(
              'relative px-6 py-2.5 rounded-xl font-bold text-sm md:text-base flex items-center gap-2 transition-all duration-300 min-w-[160px] justify-center',
              activeTab === 'short'
                ? 'text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            {activeTab === 'short' && (
              <motion.div
                layoutId="tab-bg"
                className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <TrendingDown size={18} /> Gap Up Short
            </span>
          </button>

          <button
            onClick={() => setActiveTab('long')}
            className={cn(
              'relative px-6 py-2.5 rounded-xl font-bold text-sm md:text-base flex items-center gap-2 transition-all duration-300 min-w-[160px] justify-center',
              activeTab === 'long'
                ? 'text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            {activeTab === 'long' && (
              <motion.div
                layoutId="tab-bg"
                className="absolute inset-0 bg-gradient-to-r from-lime-500 to-lime-600 rounded-xl shadow-[0_0_20px_rgba(132,204,22,0.4)]"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <TrendingUp size={18} /> Gap Down Long
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Primary Details Card */}
          <div
            className={cn(
              'lg:col-span-8 rounded-3xl p-6 md:p-8 border relative overflow-hidden flex flex-col gap-8 shadow-2xl',
              isShort
                ? 'bg-slate-900/60 border-orange-500/20'
                : 'bg-slate-900/60 border-lime-500/20'
            )}
          >
            {/* Decorative Gradient Background */}
            <div
              className={cn(
                'absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.07] pointer-events-none -mt-40 -mr-40',
                isShort ? 'bg-orange-500' : 'bg-lime-500'
              )}
            />

            {/* Top Header inside Card */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/50 pb-6">
              <div>
                <div
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2 border',
                    isShort
                      ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                      : 'bg-lime-500/10 text-lime-400 border-lime-500/20'
                  )}
                >
                  {isShort ? 'Bearish Strategy' : 'Bullish Strategy'}
                </div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  {data.title}
                  {isShort ? (
                    <TrendingDown className="text-orange-500" />
                  ) : (
                    <TrendingUp className="text-lime-500" />
                  )}
                </h2>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">
                  Success Rate
                </div>
                <div className={cn('text-3xl font-black', themeColor)}>
                  {isShort ? '55-70%' : '50-65%'}
                </div>
              </div>
            </div>

            {/* Grid of Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <DetailCard
                label="Risk Level"
                icon={AlertOctagon}
                value={
                  <div className="mt-1">
                    <span
                      className={cn(
                        'text-sm',
                        isShort ? 'text-red-400' : 'text-orange-400'
                      )}
                    >
                      {isShort ? 'High' : 'Med-High'}
                    </span>
                    <RiskIndicator
                      level={isShort ? 4 : 3}
                      colorClass={isShort ? 'bg-red-500' : 'bg-orange-500'}
                    />
                  </div>
                }
                colorClass="text-slate-200"
              />
              <DetailCard
                label="Risk/Reward"
                icon={Target}
                value={isShort ? '1:2 - 1:4' : '1:3 - 1:5'}
                colorClass="text-slate-200"
                highlight
              />
              <DetailCard
                label="Ideal Entry"
                icon={Clock}
                value={isShort ? '5-15 min' : '5 min'}
                subtext="Chart Timeframe"
                colorClass="text-amber-400"
              />
              <DetailCard
                label="Float Pref"
                icon={Layers}
                value="Any"
                subtext="All float sizes"
                colorClass="text-slate-200"
              />
            </div>

            {/* Deep Dive Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-950/30 rounded-xl p-5 border border-slate-800">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Activity size={16} /> Volume & Catalyst
                </h3>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-sm text-slate-300">
                    <div
                      className={cn(
                        'mt-1 w-1.5 h-1.5 rounded-full shrink-0',
                        bgTheme
                      )}
                    />
                    <span>
                      <strong className="text-white block">
                        Volume Profile
                      </strong>
                      {isShort
                        ? 'Extremely high at open (emotional spike). Watch for volume decline after washout.'
                        : 'High panic volume, then reversal surge. Gap fill attracts buyers.'}
                    </span>
                  </li>
                  <li className="flex gap-3 text-sm text-slate-300">
                    <div
                      className={cn(
                        'mt-1 w-1.5 h-1.5 rounded-full shrink-0',
                        bgTheme
                      )}
                    />
                    <span>
                      <strong className="text-white block">Catalyst Req</strong>
                      {isShort
                        ? 'Multi-day run (3-5 days) + gap up above previous close. Extreme retail emotions.'
                        : 'Multi-day selloff (2-4 red days) + gap down below previous close. Anticipate relief.'}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-950/30 rounded-xl p-5 border border-slate-800">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <CheckCircle2 size={16} /> Key Criteria
                </h3>
                <ul className="space-y-2">
                  {isShort
                    ? [
                        '3-5 consecutive green days',
                        'Gaps up ABOVE previous close',
                        'Extreme attention/emotions',
                        'Wait for washout before entry',
                      ].map((item, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-slate-300"
                        >
                          <CheckCircle2
                            size={14}
                            className="text-orange-500 shrink-0"
                          />{' '}
                          {item}
                        </li>
                      ))
                    : [
                        '2-4 red days after FRD',
                        'Gaps down BELOW previous close',
                        'Oversold conditions (RSI < 30)',
                        'Gap fill becomes magnet',
                      ].map((item, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-slate-300"
                        >
                          <CheckCircle2
                            size={14}
                            className="text-lime-500 shrink-0"
                          />{' '}
                          {item}
                        </li>
                      ))}
                </ul>
              </div>
            </div>

            {/* Visual Chart */}
            <div className="mt-4">
              <VisualChart type={activeTab} />
            </div>

            {/* Scenarios Section */}
            <div className="bg-slate-950/30 rounded-xl p-5 border border-slate-800">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Target size={16} /> Entry Scenarios
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.scenarios.map((scenario, i) => (
                  <div
                    key={i}
                    className="bg-slate-900/40 p-4 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <h4
                      className={cn(
                        'font-bold mb-2 text-sm',
                        isShort ? 'text-orange-300' : 'text-lime-300'
                      )}
                    >
                      {scenario.title}
                    </h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {scenario.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Visuals & Timeline */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Conversion Logic Card */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ArrowRightLeft size={14} /> Conversion Logic
              </h3>
              <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80 relative overflow-hidden">
                <div
                  className={cn(
                    'absolute top-0 left-0 w-1 h-full',
                    isShort ? 'bg-orange-500' : 'bg-lime-500'
                  )}
                />
                <h4 className="text-slate-200 font-bold mb-3 text-sm">
                  {data.conversion.title}
                </h4>
                <ul className="space-y-2">
                  {data.conversion.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-slate-400"
                    >
                      <span
                        className={cn(
                          'mt-1 w-1.5 h-1.5 rounded-full shrink-0',
                          isShort ? 'bg-orange-500' : 'bg-lime-500'
                        )}
                      ></span>
                      {item}
                    </li>
                  ))}
                </ul>

                {/* Emotion Blurb */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={14} className="text-yellow-400" />
                    <span className="text-yellow-400 font-bold text-[10px] uppercase">
                      Emotional Context
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs italic">
                    "The Gap creates opportunity AND danger. Wait for the
                    emotion to subside before executing."
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline Mini-Widget */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Timer size={14} /> Critical Timeline
              </h3>
              <div className="space-y-4 relative">
                {/* Vertical Line */}
                <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-slate-800" />

                <div className="relative pl-6">
                  <div className="absolute left-0 top-1.5 w-3.5 h-3.5 bg-slate-800 rounded-full border-2 border-slate-600" />
                  <div className="text-xs font-mono text-slate-500">
                    9:30 AM - 9:45 AM
                  </div>
                  <div className="text-sm font-bold text-slate-200">
                    Gap Open Window
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {isShort
                      ? 'Watch for washout games. Do NOT rush to short.'
                      : 'First 5-min candle critical. Green = potential entry.'}
                  </div>
                </div>

                <div className="relative pl-6">
                  <div
                    className={cn(
                      'absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 shadow-[0_0_10px_currentColor]',
                      isShort
                        ? 'bg-orange-500 border-orange-400 text-orange-500'
                        : 'bg-lime-500 border-lime-400 text-lime-500'
                    )}
                  />
                  <div
                    className={cn('text-xs font-mono font-bold', themeColor)}
                  >
                    9:45 AM - 10:30 AM
                  </div>
                  <div className="text-sm font-bold text-white">
                    Entry Window
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    {isShort
                      ? 'After washout completes, short on reversal down.'
                      : 'Double bottom or slow grind confirmation.'}
                  </div>
                </div>

                <div className="relative pl-6 opacity-60">
                  <div className="absolute left-0 top-1.5 w-3.5 h-3.5 bg-slate-800 rounded-full border-2 border-red-900" />
                  <div className="text-xs font-mono text-red-400">
                    10:30 AM - 11:00 AM
                  </div>
                  <div className="text-sm font-bold text-red-300">
                    Resolution Zone
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {isShort
                      ? 'Watch for previous close test. FRD conversion possible.'
                      : 'Gap fill target. FGD conversion if closes above prev close.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Warning Box */}
            <div className="bg-red-950/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className="text-red-500 shrink-0 mt-0.5"
                  size={18}
                />
                <div>
                  <h4 className="text-red-400 text-sm font-bold uppercase mb-1">
                    Gap Psychology Risk
                  </h4>
                  <p className="text-xs text-red-300/80 leading-relaxed">
                    {isShort
                      ? 'Gaps create maximum FOMO. Early shorts get washed out. Wait for the trap to complete before entering. If it reclaims gap levels with volume, cover immediately.'
                      : 'Gap downs create panic. Dead cat bounces are common. Take profits at gap fill. If breaks gap low, exit immediately.'}
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

export default TradingCheatSheet;
