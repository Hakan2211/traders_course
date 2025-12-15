import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Activity,
  BarChart2,
  AlertTriangle,
  Layers,
  Zap,
} from 'lucide-react';
import { SetupData } from './types';
import { cn } from '../../../lib/utils';

interface SetupCardProps {
  data: SetupData;
}

const DetailRow: React.FC<{
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}> = ({ label, children, icon, fullWidth }) => (
  <div
    className={cn(
      'bg-slate-900/40 border border-slate-700/30 p-4 rounded-xl backdrop-blur-sm hover:bg-slate-800/40 transition-colors duration-300',
      fullWidth ? 'col-span-1 md:col-span-2' : 'col-span-1'
    )}
  >
    <div className="flex items-center gap-2 mb-2">
      {icon && <span className="text-slate-400">{icon}</span>}
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
    </div>
    <div className="text-slate-100 font-medium text-lg leading-relaxed">
      {children}
    </div>
  </div>
);

const RiskMeter: React.FC<{ level: number; type: 'long' | 'short' }> = ({
  level,
  type,
}) => {
  const dots = [1, 2, 3, 4, 5];
  const activeColor =
    type === 'long'
      ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
      : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]';

  return (
    <div className="flex gap-1.5 mt-1">
      {dots.map((dot) => (
        <div
          key={dot}
          className={cn(
            'w-2.5 h-2.5 rounded-full transition-all duration-500',
            dot <= level ? activeColor : 'bg-slate-700'
          )}
        />
      ))}
    </div>
  );
};

export const SetupCard: React.FC<SetupCardProps> = ({ data }) => {
  const isLong = data.type === 'long';
  const themeColor = isLong ? 'text-emerald-400' : 'text-rose-400';
  const borderColor = isLong ? 'border-emerald-500/20' : 'border-rose-500/20';
  const badgeBg = isLong
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    : 'bg-rose-500/10 text-rose-400 border-rose-500/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'w-full h-full p-6 md:p-8 rounded-3xl border bg-slate-900/20 backdrop-blur-md overflow-y-auto custom-scrollbar',
        borderColor
      )}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-slate-700/50 pb-6 gap-4">
        <div>
          <h2
            className={cn(
              'text-3xl md:text-4xl font-bold tracking-tight mb-2',
              themeColor
            )}
          >
            {data.title}
          </h2>
          <p className="text-slate-400 font-medium flex items-center gap-2">
            {data.category}
          </p>
        </div>
        <div
          className={cn(
            'px-4 py-2 rounded-lg border font-bold text-sm uppercase tracking-widest flex items-center gap-2 w-fit',
            badgeBg
          )}
        >
          {isLong ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          {isLong ? 'Long Strategy' : 'Short Strategy'}
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
        <DetailRow label="Time of Day" icon={<Clock size={14} />}>
          {data.timeOfDay}
        </DetailRow>

        <DetailRow label="Ideal Timeframe" icon={<Layers size={14} />}>
          <div className="flex gap-4">
            <div>
              <span className="text-xs text-slate-500 block">Entry</span>
              <span className={isLong ? 'text-emerald-400' : 'text-amber-400'}>
                {data.idealTimeframe.entry}
              </span>
            </div>
            <div className="w-px bg-slate-700/50 h-full mx-2"></div>
            <div>
              <span className="text-xs text-slate-500 block">Exit</span>
              <span className={isLong ? 'text-amber-400' : 'text-rose-400'}>
                {data.idealTimeframe.exit}
              </span>
            </div>
          </div>
        </DetailRow>

        <DetailRow label="Risk Profile" icon={<AlertTriangle size={14} />}>
          <div className="flex items-center justify-between">
            <span
              className={cn(
                'font-bold',
                isLong ? 'text-emerald-400' : 'text-rose-400'
              )}
            >
              {data.riskLevel.label}
            </span>
            <RiskMeter level={data.riskLevel.level} type={data.type} />
          </div>
        </DetailRow>

        <DetailRow label="Success Rate" icon={<Activity size={14} />}>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-baseline">
              <span
                className={cn(
                  'text-xl font-bold',
                  isLong ? 'text-emerald-400' : 'text-amber-400'
                )}
              >
                {data.successRate.range}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.successRate.percentage}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className={cn(
                  'h-full rounded-full',
                  isLong
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                    : 'bg-gradient-to-r from-amber-600 to-amber-400'
                )}
              />
            </div>
          </div>
        </DetailRow>

        <DetailRow label="Risk / Reward" icon={<BarChart2 size={14} />}>
          <span className={isLong ? 'text-emerald-400' : 'text-amber-400'}>
            {data.riskReward}
          </span>
        </DetailRow>

        <DetailRow label="Float Preference" icon={<Activity size={14} />}>
          <div>
            {data.floatPref}{' '}
            <span className="text-slate-500 text-sm">
              | {data.floatPrefSub}
            </span>
          </div>
        </DetailRow>

        <DetailRow
          label="Volume Requirement"
          fullWidth
          icon={<Activity size={14} />}
        >
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
            <span className="font-semibold text-white">{data.volumeReq}</span>
            <span className="text-slate-400 text-sm italic">
              {data.volumeReqSub}
            </span>
          </div>
        </DetailRow>

        <DetailRow
          label="Required Catalyst & Criteria"
          fullWidth
          icon={<Zap size={14} />}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'px-2 py-0.5 rounded text-xs font-bold',
                  data.catalyst.required
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-700 text-slate-300'
                )}
              >
                {data.catalyst.required ? 'YES REQUIRED' : 'OPTIONAL'}
              </div>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.catalyst.points.map((point, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-slate-300 text-sm"
                >
                  <span
                    className={cn(
                      'mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0',
                      isLong ? 'bg-emerald-500' : 'bg-rose-500'
                    )}
                  ></span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </DetailRow>
      </div>
    </motion.div>
  );
};
