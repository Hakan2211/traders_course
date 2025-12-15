
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  Target,
  BarChart2,
  Activity,
  Layers,
  Info,
  Zap,
  CheckCircle2,
  XCircle,
  Timer,
  AlertOctagon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import VisualPattern from './VisualPattern';

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
        (colorClass.includes('emerald')
          ? 'border-l-emerald-500'
          : colorClass.includes('rose')
          ? 'border-l-rose-500'
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

// --- Main Component ---

const TradingLesson = () => {
  const [activeTab, setActiveTab] = useState<'breakout' | 'fade'>('breakout');

  const isBreakout = activeTab === 'breakout';
  const themeColor = isBreakout ? 'text-emerald-400' : 'text-rose-400';
  const bgTheme = isBreakout ? 'bg-emerald-500' : 'bg-rose-500';
  const borderTheme = isBreakout
    ? 'border-emerald-500/30'
    : 'border-rose-500/30';

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
          <span>LESSON 4.3</span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span className="text-slate-300">EST: 12:00 PM - 4:00 PM</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-slate-300 to-slate-500"
        >
          Afternoon{' '}
          <span
            className={
              isBreakout
                ? 'text-emerald-400'
                : 'text-slate-500 transition-colors'
            }
          >
            Breakout
          </span>{' '}
          &{' '}
          <span
            className={
              !isBreakout ? 'text-rose-400' : 'text-slate-500 transition-colors'
            }
          >
            Fade
          </span>
        </motion.h1>
        <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto">
          Mastering the "Power Hour" structure versus midday deterioration.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex justify-center mb-10 sticky top-2 z-50">
        <div className="bg-slate-950/90 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-800/50 flex gap-2 shadow-2xl ring-1 ring-white/5">
          <button
            onClick={() => setActiveTab('breakout')}
            className={cn(
              'relative px-6 py-2.5 rounded-xl font-bold text-sm md:text-base flex items-center gap-2 transition-all duration-300 min-w-[160px] justify-center',
              activeTab === 'breakout'
                ? 'text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            {activeTab === 'breakout' && (
              <motion.div
                layoutId="tab-bg"
                className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl shadow-[0_0_20px_rgba(52,211,153,0.4)]"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <TrendingUp size={18} /> Breakout
            </span>
          </button>

          <button
            onClick={() => setActiveTab('fade')}
            className={cn(
              'relative px-6 py-2.5 rounded-xl font-bold text-sm md:text-base flex items-center gap-2 transition-all duration-300 min-w-[160px] justify-center',
              activeTab === 'fade'
                ? 'text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            {activeTab === 'fade' && (
              <motion.div
                layoutId="tab-bg"
                className="absolute inset-0 bg-gradient-to-r from-rose-500 to-rose-600 rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.4)]"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <TrendingDown size={18} /> Fade
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
              isBreakout
                ? 'bg-slate-900/60 border-emerald-500/20'
                : 'bg-slate-900/60 border-rose-500/20'
            )}
          >
            {/* Decorative Gradient Background */}
            <div
              className={cn(
                'absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.07] pointer-events-none -mt-40 -mr-40',
                isBreakout ? 'bg-emerald-500' : 'bg-rose-500'
              )}
            />

            {/* Top Header inside Card */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/50 pb-6">
              <div>
                <div
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2 border',
                    isBreakout
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  )}
                >
                  {isBreakout ? 'Bullish Strategy' : 'Bearish Strategy'}
                </div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  {isBreakout ? 'Afternoon Breakout' : 'Afternoon Fade'}
                  {isBreakout ? (
                    <TrendingUp className="text-emerald-500" />
                  ) : (
                    <TrendingDown className="text-rose-500" />
                  )}
                </h2>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">
                  Success Rate
                </div>
                <div className={cn('text-3xl font-black', themeColor)}>
                  {isBreakout ? '55-70%' : '60-75%'}
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
                        isBreakout ? 'text-amber-400' : 'text-rose-400'
                      )}
                    >
                      {isBreakout ? 'Medium' : 'Med-High'}
                    </span>
                    <RiskIndicator
                      level={isBreakout ? 3 : 4}
                      colorClass={isBreakout ? 'bg-amber-400' : 'bg-rose-500'}
                    />
                  </div>
                }
                colorClass="text-slate-200"
              />
              <DetailCard
                label="Risk/Reward"
                icon={Target}
                value={isBreakout ? '1:3 - 1:5+' : '1:2 - 1:4'}
                colorClass="text-slate-200"
                highlight
              />
              <DetailCard
                label="Ideal Entry"
                icon={Clock}
                value="15 min"
                subtext="Chart Timeframe"
                colorClass="text-amber-400"
              />
              <DetailCard
                label="Float Pref"
                icon={Layers}
                value={isBreakout ? '< 5M' : '5M - 50M'}
                subtext={isBreakout ? 'Low Float Best' : 'Mid Float OK'}
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
                      {isBreakout
                        ? 'First day of high RelVol. Surge on breakout is crucial.'
                        : 'Declining bounces. Surge on breakdown is critical.'}
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
                      {isBreakout
                        ? 'Preferred. Pre-market news + 3-5h consolidation above VWAP.'
                        : 'Variable. No consolidation post-open. Lower highs.'}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-950/30 rounded-xl p-5 border border-slate-800">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <CheckCircle2 size={16} /> Key Criteria
                </h3>
                <ul className="space-y-2">
                  {isBreakout
                    ? [
                        'Pre-market catalyst ideal',
                        '3-5 hour consolidation ABOVE VWAP',
                        'Must hold above 20EMA',
                        'Clean pullback after first leg',
                      ].map((item, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-slate-300"
                        >
                          <CheckCircle2
                            size={14}
                            className="text-emerald-500 shrink-0"
                          />{' '}
                          {item}
                        </li>
                      ))
                    : [
                        'NO consolidation post-open',
                        'Lower highs pattern (bouncing ball)',
                        'Gap between price and VWAP',
                        "Break of 'floor' (VWAP/20EMA)",
                      ].map((item, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-slate-300"
                        >
                          <CheckCircle2
                            size={14}
                            className="text-rose-500 shrink-0"
                          />{' '}
                          {item}
                        </li>
                      ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Side - Visuals & Timeline */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Visual Pattern Component */}
            <VisualPattern
              type={isBreakout ? 'long' : 'short'}
              title={isBreakout ? 'The Squeeze' : 'The Deterioration'}
              description={
                isBreakout
                  ? 'First leg → Pullback → Long consolidation ABOVE VWAP → Afternoon explosion'
                  : 'Push higher → Lower highs (bouncing ball) → Gap from VWAP → Floor break'
              }
            />

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
                    12:00 PM - 2:00 PM
                  </div>
                  <div className="text-sm font-bold text-slate-200">
                    Launch Window
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {isBreakout
                      ? 'Early afternoon squeeze begins.'
                      : 'Lower highs forming, weakness showing.'}
                  </div>
                </div>

                <div className="relative pl-6">
                  <div
                    className={cn(
                      'absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 shadow-[0_0_10px_currentColor]',
                      isBreakout
                        ? 'bg-emerald-500 border-emerald-400 text-emerald-500'
                        : 'bg-rose-500 border-rose-400 text-rose-500'
                    )}
                  />
                  <div
                    className={cn('text-xs font-mono font-bold', themeColor)}
                  >
                    2:00 PM - 3:30 PM
                  </div>
                  <div className="text-sm font-bold text-white">Power Hour</div>
                  <div className="text-xs text-slate-300 mt-1">
                    {isBreakout
                      ? 'Main move window. Max Volume.'
                      : 'Floor breaks, cascade begins.'}
                  </div>
                </div>

                <div className="relative pl-6 opacity-60">
                  <div className="absolute left-0 top-1.5 w-3.5 h-3.5 bg-slate-800 rounded-full border-2 border-red-900" />
                  <div className="text-xs font-mono text-red-400">
                    3:30 PM - 4:00 PM
                  </div>
                  <div className="text-sm font-bold text-red-300">
                    Close Trap Zone
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
                    After Hours Risk
                  </h4>
                  <p className="text-xs text-red-300/80 leading-relaxed">
                    {isBreakout
                      ? 'No halts in AH. Low volume + no halts = black swan potential. If holding past 4pm, use tight stops.'
                      : 'Continued bleeding possible, but short squeezes in AH can be violent due to illiquidity.'}
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

export default TradingLesson;
