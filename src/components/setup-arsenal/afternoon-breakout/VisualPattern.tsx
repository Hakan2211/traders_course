
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VisualPatternProps {
  type: 'long' | 'short';
  title: string;
  description: string;
}

const VisualPattern: React.FC<VisualPatternProps> = ({
  type,
  title,
  description,
}) => {
  // Heights representing the pattern logic
  // Long: First leg, pullback, consolidation near VWAP, breakout
  const longPattern = [70, 45, 50, 52, 48, 50, 51, 85, 95];

  // Short: Push high, lower highs, gap from VWAP, breakdown
  const shortPattern = [75, 85, 70, 60, 55, 45, 35, 25, 15];

  const data = type === 'long' ? longPattern : shortPattern;
  const isLong = type === 'long';

  return (
    <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-6 relative overflow-hidden group hover:border-slate-600/50 transition-colors">
      <div className="flex justify-between items-center mb-4">
        <h4
          className={cn(
            'font-bold text-lg',
            isLong ? 'text-emerald-400' : 'text-rose-400'
          )}
        >
          {title}
        </h4>
        <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">
          Visual Pattern
        </span>
      </div>

      <div className="relative h-40 w-full flex items-end justify-around gap-2 mb-4 border-b-2 border-slate-700">
        {/* VWAP Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-blue-500/50 border-t border-dashed border-blue-400 z-10 flex items-center">
          <span className="ml-auto mr-2 -mt-6 text-xs font-bold text-blue-400 bg-slate-900/80 px-1 rounded">
            VWAP
          </span>
        </div>

        {data.map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: `${h}%`, opacity: 1 }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
            className={cn(
              'w-full rounded-t-sm relative z-0',
              isLong
                ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                : 'bg-gradient-to-t from-rose-600 to-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.3)]'
            )}
          />
        ))}
      </div>

      <p className="text-center text-slate-400 text-sm font-medium leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default VisualPattern;
