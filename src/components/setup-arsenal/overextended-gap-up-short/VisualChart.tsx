
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VisualChartProps {
  type: 'short' | 'long';
}

const VisualChart: React.FC<VisualChartProps> = ({ type }) => {
  const isShort = type === 'short';

  // Configuration for bars
  const bars = isShort
    ? [35, 55, 75, 90] // Growing green bars for Short setup (Gap Up)
    : [90, 70, 50, 35]; // Shrinking red bars for Long setup (Gap Down)

  const gapHeight = 100; // The gap bar height percentage
  const gapColor = isShort
    ? 'from-orange-400 to-orange-600 border-orange-400'
    : 'from-lime-400 to-lime-600 border-lime-400';

  const gapShadow = isShort
    ? 'shadow-[0_0_20px_rgba(249,115,22,0.5)]'
    : 'shadow-[0_0_20px_rgba(132,204,22,0.5)]';

  const normalBarColor = isShort
    ? 'from-lime-500 to-lime-700'
    : 'from-red-500 to-red-700';

  const arrowColor = isShort ? 'text-orange-500' : 'text-lime-500';
  const prevCloseY = isShort ? '10%' : '65%'; // CSS top %
  const prevCloseColor = 'bg-amber-400';

  return (
    <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-6 relative overflow-hidden group hover:border-slate-600/50 transition-colors">
      <div className="flex justify-between items-center mb-4">
        <h4
          className={cn(
            'font-bold text-lg',
            isShort ? 'text-orange-400' : 'text-lime-400'
          )}
        >
          {isShort
            ? '📈 Multi-Day Run + Gap Up'
            : '📉 Multi-Day Selloff + Gap Down'}
        </h4>
        <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">
          Visual Pattern
        </span>
      </div>

      <div className="relative h-40 w-full flex items-end justify-around gap-2 mb-4 border-b-2 border-slate-700 px-2">
        {/* Previous Close Line */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '100%', opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className={`absolute h-0.5 ${prevCloseColor} z-10`}
          style={{ top: prevCloseY, left: 0 }}
        />
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute right-4 text-xs font-bold text-amber-400 z-10 bg-slate-900/80 px-1 rounded"
          style={{ top: `calc(${prevCloseY} - 20px)` }}
        >
          Prev Close
        </motion.span>

        {/* Regular Days */}
        {bars.map((height, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-end h-full flex-1 relative"
          >
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: `${height}%`, opacity: 1 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
              className={cn(
                'w-full rounded-t-sm relative z-0',
                `bg-gradient-to-t ${normalBarColor}`,
                isShort
                  ? 'shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                  : 'shadow-[0_0_10px_rgba(239,68,68,0.3)]'
              )}
            />
            <span className="text-xs text-slate-500 mt-2 absolute -bottom-6 whitespace-nowrap">
              Day {i + 1}
            </span>
          </div>
        ))}

        {/* Gap Day */}
        <div className="flex flex-col items-center justify-end h-full flex-1 relative">
          {/* Gap Arrow */}
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: isShort ? -10 : 10 }}
            transition={{
              delay: 2,
              duration: 0.8,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className={`absolute ${arrowColor} z-20`}
            style={{
              bottom: isShort ? '105%' : '35%',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            {isShort ? (
              <ArrowUp size={24} strokeWidth={3} />
            ) : (
              <ArrowDown size={24} strokeWidth={3} />
            )}
          </motion.div>

          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: isShort ? '100%' : '25%', opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2, type: 'spring' }}
            className={cn(
              'w-full rounded-t-sm border-2 relative z-0',
              `bg-gradient-to-t ${gapColor}`,
              gapShadow
            )}
          >
            {/* Internal Label for the gap bar */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-black/70 rotate-90 whitespace-nowrap">
                {isShort ? 'GAP UP' : 'GAP DOWN'}
              </span>
            </div>
          </motion.div>
          <div className="absolute -bottom-6 flex flex-col items-center">
            <span
              className={cn(
                'text-xs font-bold',
                isShort ? 'text-orange-500' : 'text-lime-500'
              )}
            >
              Day 5
            </span>
          </div>
        </div>
      </div>

      <p className="text-center text-slate-400 text-sm font-medium leading-relaxed">
        {isShort ? (
          <>
            Emotions extreme →{' '}
            <span className="text-orange-400 font-semibold">
              Watch for washout
            </span>{' '}
            → Then fade.
            <br />
            If closes below Prev Close = Converts to{' '}
            <span className="text-red-400 font-bold">First Red Day</span>.
          </>
        ) : (
          <>
            Panic selling →{' '}
            <span className="text-lime-400 font-semibold">
              Anticipate reversal
            </span>{' '}
            + gap fill.
            <br />
            If closes above Prev Close = Converts to{' '}
            <span className="text-green-400 font-bold">First Green Day</span>.
          </>
        )}
      </p>
    </div>
  );
};

export default VisualChart;
