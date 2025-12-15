
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CandleVisualProps {
  type: 'short' | 'long';
}

const CandleVisual: React.FC<CandleVisualProps> = ({ type }) => {
  const isShort = type === 'short';

  // Configuration for the candles based on type
  // Short: Green up -> Exhaustion -> Red down
  // Long: Red down -> Washout -> Green up
  const candles = isShort
    ? [
        { height: '40%', color: 'green', label: '' },
        { height: '55%', color: 'green', label: '' },
        { height: '75%', color: 'green', label: 'Acceleration' },
        { height: '90%', color: 'green', label: '' },
        { height: '100%', color: 'exhaustion', label: '⚠️ EXHAUSTION' },
        { height: '70%', color: 'red', label: 'Entry Zone' },
        { height: '50%', color: 'red', label: 'Reversion' },
      ]
    : [
        { height: '100%', color: 'red', label: 'Panic Selling' },
        { height: '85%', color: 'red', label: '' },
        { height: '75%', color: 'red', label: '' },
        { height: '95%', color: 'exhaustion', label: '💥 CLIMAX VOL' },
        { height: '60%', color: 'green', label: 'Entry' },
        { height: '75%', color: 'green', label: 'Bounce' },
        { height: '80%', color: 'green', label: '' },
      ];

  const getGradient = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-gradient-to-b from-green-400 to-green-600';
      case 'red':
        return 'bg-gradient-to-b from-red-400 to-red-600';
      case 'exhaustion':
        return isShort
          ? 'bg-gradient-to-b from-amber-300 to-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.4)]'
          : 'bg-gradient-to-b from-red-500 to-red-700 shadow-[0_0_20px_rgba(239,68,68,0.4)] border-2 border-white/20';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="relative bg-slate-900/50 rounded-xl border border-slate-700/50 p-6 mt-6 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

      <h3
        className={cn(
          'text-center font-bold mb-8 text-lg uppercase tracking-widest',
          isShort ? 'text-red-400' : 'text-green-400'
        )}
      >
        {isShort ? 'Parabolic Move Anatomy' : 'Panic Selloff Anatomy'}
      </h3>

      <div className="h-48 flex items-end justify-around px-4 relative border-b-2 border-slate-700">
        {candles.map((candle, i) => (
          <div
            key={i}
            className="relative flex flex-col items-center justify-end h-full w-8 mx-1 group"
          >
            {/* Annotation Label */}
            {candle.label && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className={cn(
                  'absolute text-[10px] font-bold text-center w-24 whitespace-nowrap z-10',
                  isShort && i === 4 ? '-top-12 text-amber-400' : '',
                  !isShort && i === 3 ? '-top-12 text-amber-400' : '',
                  (isShort && i !== 4) || (!isShort && i !== 3)
                    ? 'bottom-[-40px] text-slate-400'
                    : ''
                )}
              >
                {candle.label}
              </motion.div>
            )}

            {/* Wick */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: '100%' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cn(
                'absolute w-[2px] bg-opacity-30',
                candle.color === 'green'
                  ? 'bg-green-400'
                  : candle.color === 'exhaustion'
                  ? 'bg-amber-400'
                  : 'bg-red-400'
              )}
              style={{
                height: `calc(${candle.height} + 20px)`,
                bottom: '-10px',
              }}
            />

            {/* Body */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: candle.height }}
              transition={{
                duration: 0.6,
                delay: i * 0.15,
                type: 'spring',
                stiffness: 100,
              }}
              className={cn(
                'w-full rounded-sm relative z-0',
                getGradient(candle.color)
              )}
            />
          </div>
        ))}
      </div>

      <div className="mt-12 text-center text-sm text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
        {isShort ? (
          <>
            <strong className="text-red-400">DO NOT</strong> short green candles
            • <strong className="text-amber-400">WAIT</strong> for exhaustion •{' '}
            <strong className="text-green-400">ENTER</strong> on break of low
          </>
        ) : (
          <>
            <strong className="text-red-400">DO NOT</strong> buy the falling
            knife • <strong className="text-amber-400">WAIT</strong> for climax
            volume • <strong className="text-green-400">ENTER</strong> on first
            reversal
          </>
        )}
      </div>
    </div>
  );
};

export default CandleVisual;
