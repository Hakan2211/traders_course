
import React from 'react';
import { motion } from 'framer-motion';

export const ChartVisualizer: React.FC = () => {
  const candles = [
    { day: 1, type: 'green', height: '35%', label: '' },
    { day: 2, type: 'green', height: '55%', label: '' },
    { day: 3, type: 'green', height: '75%', label: '' },
    { day: 4, type: 'green', height: '90%', label: 'Runner' },
    {
      day: 5,
      type: 'red',
      height: '75%',
      label: 'First Red Day',
      special: true,
    },
    { day: 6, type: 'red', height: '55%', label: '' },
    { day: 7, type: 'red', height: '40%', label: '' },
    { day: 8, type: 'red', height: '30%', label: '' },
    {
      day: 9,
      type: 'green',
      height: '45%',
      label: 'First Green Day',
      special: true,
    },
  ];

  return (
    <div className="w-full bg-slate-900/50 rounded-xl border border-slate-700/50 p-6 relative overflow-hidden group">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-slate-400 font-semibold text-sm uppercase tracking-wider">
          Multi-Day Cycle Visualization
        </h3>
        <div className="flex gap-4 text-xs font-mono text-slate-500">
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
            Long Trend
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-rose-500 mr-2"></span>Short
            Trend
          </span>
        </div>
      </div>

      <div className="h-64 flex items-end justify-around relative px-2 sm:px-8 border-b border-slate-700/50">
        {candles.map((candle, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-end h-full w-full mx-1 relative group/candle"
          >
            {/* Tooltip/Label */}
            {candle.special && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                className={`absolute -top-12 z-20 whitespace-nowrap px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border backdrop-blur-md shadow-lg
                    ${
                      candle.type === 'red'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    }`}
              >
                {candle.label}
                <div
                  className={`absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2 h-2 border-r border-b rotate-45 bg-inherit border-inherit`}
                ></div>
              </motion.div>
            )}

            {/* Candle Body */}
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              whileInView={{ height: candle.height, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                delay: index * 0.15,
                type: 'spring',
                stiffness: 100,
              }}
              className={`w-full max-w-[40px] rounded-t-sm relative cursor-pointer hover:opacity-90 transition-opacity
                ${
                  candle.type === 'green'
                    ? 'bg-gradient-to-t from-emerald-900 to-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-gradient-to-t from-rose-900 to-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                }
                ${
                  candle.special
                    ? candle.type === 'red'
                      ? 'ring-2 ring-rose-400 ring-offset-2 ring-offset-slate-900'
                      : 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900'
                    : ''
                }
              `}
            >
              {/* Wick (Visual flair) */}
              <div
                className={`absolute -top-4 left-1/2 -translate-x-1/2 w-[1px] h-4 ${
                  candle.type === 'green' ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              ></div>
            </motion.div>

            {/* Day Label */}
            <div className="absolute -bottom-8 text-[10px] text-slate-500 font-mono">
              D{candle.day}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center text-xs text-slate-400 bg-slate-800/50 py-3 rounded-lg border border-slate-700/30 mx-auto max-w-2xl">
        <span className="text-emerald-400 font-bold">Days 1-4:</span> Runner
        Building &rarr; <span className="text-rose-400 font-bold">Day 5:</span>{' '}
        The Short Entry (FRD) &rarr;{' '}
        <span className="text-emerald-400 font-bold">Day 9:</span> The Bounce
        Entry (FGD)
      </div>
    </div>
  );
};
