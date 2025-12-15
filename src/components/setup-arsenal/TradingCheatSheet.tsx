
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Activity,
  BarChart2,
  Layers,
  AlertTriangle,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { LessonData } from './types';
import RiskMeter from './ui/RiskMeter';
import ProgressBar from './ui/ProgressBar';

interface TradingCheatSheetProps {
  data: LessonData;
}

const TradingCheatSheet: React.FC<TradingCheatSheetProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'long' | 'short'>('long');

  const activeSetup = activeTab === 'long' ? data.longSetup : data.shortSetup;
  const isLong = activeTab === 'long';

  // Dynamic Theme Colors
  const theme = {
    long: {
      primary: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      glow: 'shadow-[0_0_30px_-5px_rgba(52,211,153,0.3)]',
      gradient: 'from-emerald-500 to-teal-400',
      icon: <TrendingUp className="w-5 h-5" />,
      bar: 'bg-gradient-to-r from-emerald-500 to-emerald-300',
    },
    short: {
      primary: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      glow: 'shadow-[0_0_30px_-5px_rgba(251,113,133,0.3)]',
      gradient: 'from-rose-500 to-orange-400',
      icon: <TrendingDown className="w-5 h-5" />,
      bar: 'bg-gradient-to-r from-rose-500 to-rose-300',
    },
  };

  const currentTheme = isLong ? theme.long : theme.short;

  const getIconForLabel = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('time')) return <Clock className="w-4 h-4" />;
    if (l.includes('risk')) return <AlertTriangle className="w-4 h-4" />;
    if (l.includes('success')) return <Target className="w-4 h-4" />;
    if (l.includes('volume')) return <Activity className="w-4 h-4" />;
    if (l.includes('float')) return <Layers className="w-4 h-4" />;
    if (l.includes('catalyst')) return <Zap className="w-4 h-4" />;
    return <BarChart2 className="w-4 h-4" />;
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 text-slate-100 font-sans">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-400 to-blue-200">
            {data.title}
          </span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base font-medium uppercase tracking-wider">
          {data.subtitle}
        </p>
      </motion.div>

      {/* Tab Switcher */}
      <div className="flex justify-center mb-8 relative z-10">
        <div className="p-1 bg-slate-900/80 border border-slate-800 rounded-full flex relative backdrop-blur-md">
          {/* Sliding Background */}
          <motion.div
            className={cn(
              'absolute top-1 bottom-1 rounded-full shadow-lg z-0',
              isLong ? 'bg-emerald-500/20' : 'bg-rose-500/20'
            )}
            initial={false}
            animate={{
              x: isLong ? 0 : '100%',
              width: '50%',
              backgroundColor: isLong
                ? 'rgba(16, 185, 129, 0.2)'
                : 'rgba(244, 63, 94, 0.2)',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />

          {/* Long Tab */}
          <button
            onClick={() => setActiveTab('long')}
            className={cn(
              'relative z-10 px-8 py-3 rounded-full flex items-center gap-2 transition-colors duration-300 font-bold text-sm md:text-base w-40 justify-center',
              isLong
                ? 'text-emerald-400'
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            <TrendingUp className="w-4 h-4" />
            LONG
          </button>

          {/* Short Tab */}
          <button
            onClick={() => setActiveTab('short')}
            className={cn(
              'relative z-10 px-8 py-3 rounded-full flex items-center gap-2 transition-colors duration-300 font-bold text-sm md:text-base w-40 justify-center',
              !isLong ? 'text-rose-400' : 'text-slate-500 hover:text-slate-300'
            )}
          >
            <TrendingDown className="w-4 h-4" />
            SHORT
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'relative overflow-hidden rounded-3xl p-6 md:p-10 border backdrop-blur-xl',
            'bg-gradient-to-b from-slate-900/60 to-slate-950/80',
            currentTheme.border,
            currentTheme.glow
          )}
        >
          {/* Setup Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-slate-800/60 gap-4">
            <div>
              <h2
                className={cn(
                  'text-2xl md:text-3xl font-bold flex items-center gap-3',
                  currentTheme.primary
                )}
              >
                {currentTheme.icon}
                {activeSetup.title}
              </h2>
            </div>
            <span
              className={cn(
                'px-4 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-widest',
                currentTheme.bg,
                currentTheme.border,
                currentTheme.primary
              )}
            >
              {activeSetup.badgeText}
            </span>
          </div>

          {/* Grid Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {activeSetup.details.map((detail, idx) => (
              <motion.div
                key={detail.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  'p-5 rounded-2xl border border-slate-800/50 bg-slate-900/40 hover:bg-slate-800/60 transition-colors group relative overflow-hidden',
                  detail.fullWidth ? 'md:col-span-2' : ''
                )}
              >
                {/* Accent Line */}
                <div
                  className={cn(
                    'absolute left-0 top-0 bottom-0 w-1',
                    detail.highlightColor === 'blue'
                      ? 'bg-blue-500'
                      : detail.highlightColor === 'red'
                      ? 'bg-rose-500'
                      : detail.highlightColor === 'green'
                      ? 'bg-emerald-500'
                      : detail.highlightColor === 'yellow'
                      ? 'bg-amber-400'
                      : isLong
                      ? 'bg-emerald-500'
                      : 'bg-rose-500'
                  )}
                />

                <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  {getIconForLabel(detail.label)}
                  {detail.label}
                </div>

                <div className="text-slate-100 font-semibold text-lg md:text-xl pl-1 relative z-10">
                  {detail.isRisk ? (
                    <div className="flex flex-col">
                      <span
                        className={cn(
                          detail.riskValue && detail.riskValue >= 4
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        )}
                      >
                        {detail.value}
                      </span>
                      <RiskMeter
                        level={detail.riskValue || 0}
                        colorClass={
                          detail.riskValue && detail.riskValue >= 4
                            ? 'text-rose-500'
                            : 'text-amber-500'
                        }
                      />
                    </div>
                  ) : detail.isProgress ? (
                    <div className="flex flex-col w-full">
                      <span className={currentTheme.primary}>
                        {detail.value}
                      </span>
                      <ProgressBar
                        percentage={detail.progressValue || 0}
                        colorClass={currentTheme.primary}
                        barColorClass={currentTheme.bar}
                      />
                    </div>
                  ) : (
                    <span
                      className={cn(
                        detail.highlightColor === 'green'
                          ? 'text-emerald-400'
                          : detail.highlightColor === 'red'
                          ? 'text-rose-400'
                          : detail.highlightColor === 'blue'
                          ? 'text-blue-400'
                          : detail.highlightColor === 'yellow'
                          ? 'text-amber-400'
                          : 'text-slate-100'
                      )}
                    >
                      {detail.value}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Checklist / Footer */}
          <div className="mt-8 pt-6 border-t border-slate-800/60">
            <h3
              className={cn(
                'text-lg font-bold mb-4 flex items-center gap-2',
                currentTheme.primary
              )}
            >
              <CheckCircle2 className="w-5 h-5" />
              {activeSetup.checklistTitle}
            </h3>
            <ul className="grid gap-3">
              {activeSetup.checklist.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-start gap-3 text-slate-300 text-sm md:text-base group"
                >
                  <span
                    className={cn(
                      'mt-1 w-1.5 h-1.5 rounded-full shrink-0 group-hover:scale-150 transition-transform',
                      isLong ? 'bg-emerald-500' : 'bg-rose-500'
                    )}
                  />
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TradingCheatSheet;
