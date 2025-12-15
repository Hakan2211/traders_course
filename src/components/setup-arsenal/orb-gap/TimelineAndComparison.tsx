import React from 'react';
import { motion } from 'framer-motion';
import { TimelineEvent, ComparisonPoint } from './types';
import { cn } from '../../../lib/utils';
import { ArrowRight, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface TimelineAndComparisonProps {
  timelineEvents: TimelineEvent[];
  comparisonPoints: ComparisonPoint[];
}

const TimelineItem: React.FC<{ event: TimelineEvent; index: number }> = ({
  event,
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative grid grid-cols-[1fr_auto_1fr] gap-4 md:gap-8 items-stretch mb-12 last:mb-0 group"
    >
      {/* Long Side (Left) */}
      <div className="text-right p-4 rounded-xl bg-slate-900/40 border border-emerald-900/30 hover:bg-slate-800/60 transition-colors">
        <h4 className="text-emerald-400 font-bold mb-1 text-sm md:text-base">
          {event.longAction.title}
        </h4>
        <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
          {event.longAction.desc}
        </p>
      </div>

      {/* Center Line & Dot */}
      <div className="relative flex flex-col items-center">
        <div className="w-px h-full bg-gradient-to-b from-slate-800 via-slate-600 to-slate-800 group-last:bg-gradient-to-b group-last:from-slate-800 group-last:to-transparent absolute top-0" />
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-900 border-2 border-slate-600 flex items-center justify-center z-10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <span className="text-[10px] md:text-xs font-bold text-slate-200 text-center leading-tight px-1">
            {event.time}
          </span>
        </div>
      </div>

      {/* Short Side (Right) */}
      <div className="text-left p-4 rounded-xl bg-slate-900/40 border border-rose-900/30 hover:bg-slate-800/60 transition-colors">
        <h4 className="text-rose-400 font-bold mb-1 text-sm md:text-base">
          {event.shortAction.title}
        </h4>
        <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
          {event.shortAction.desc}
        </p>
      </div>
    </motion.div>
  );
};

export const TimelineAndComparison: React.FC<TimelineAndComparisonProps> = ({
  timelineEvents,
  comparisonPoints,
}) => {
  return (
    <div className="h-full overflow-y-auto custom-scrollbar px-2">
      {/* Timeline Section */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <h3 className="text-2xl font-bold text-slate-200 inline-flex items-center gap-2">
            <Clock className="text-blue-400" />
            Execution Timeline
          </h3>
          <p className="text-slate-400 text-sm mt-2">
            The evolution of both setups from pre-market to open
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {timelineEvents.map((event, index) => (
            <TimelineItem key={index} event={event} index={index} />
          ))}
        </div>
      </div>

      {/* Comparison Section */}
      <div className="max-w-5xl mx-auto bg-slate-900/30 rounded-3xl p-6 md:p-10 border border-slate-700/30 backdrop-blur-sm mb-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-slate-200">
            Structure vs. Exhaustion
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Key distinguishing factors
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-12 relative">
          {/* Divider for Desktop */}
          <div className="hidden md:flex absolute left-1/2 top-0 bottom-0 w-px bg-slate-700/50 -translate-x-1/2 items-center justify-center">
            <div className="bg-slate-800 text-slate-400 font-black text-xs py-1 px-2 rounded border border-slate-700 uppercase">
              VS
            </div>
          </div>

          {/* Long Column */}
          <div className="space-y-4">
            <h4 className="text-emerald-400 font-bold text-lg border-b border-emerald-500/20 pb-2 mb-4">
              Opening Range Breakout
            </h4>
            {comparisonPoints.map((point, i) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-emerald-950/20 transition-colors"
              >
                <CheckCircle2
                  size={18}
                  className="text-emerald-500 mt-0.5 shrink-0"
                />
                <span className="text-slate-300 text-sm">{point.long}</span>
              </motion.div>
            ))}
          </div>

          {/* Mobile Divider */}
          <div className="md:hidden flex items-center justify-center my-6">
            <div className="h-px bg-slate-700 w-full"></div>
            <span className="mx-4 text-slate-500 font-bold text-sm">VS</span>
            <div className="h-px bg-slate-700 w-full"></div>
          </div>

          {/* Short Column */}
          <div className="space-y-4">
            <h4 className="text-rose-400 font-bold text-lg border-b border-rose-500/20 pb-2 mb-4 text-left md:text-right">
              Gap Up Short
            </h4>
            {comparisonPoints.map((point, i) => (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                key={i}
                className="flex flex-row md:flex-row-reverse items-start gap-3 p-3 rounded-lg hover:bg-rose-950/20 transition-colors text-left md:text-right"
              >
                <CheckCircle2
                  size={18}
                  className="text-rose-500 mt-0.5 shrink-0"
                />
                <span className="text-slate-300 text-sm">{point.short}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
