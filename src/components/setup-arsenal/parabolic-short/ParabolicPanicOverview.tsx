
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import InfoGrid from './InfoGrid';
import CandleVisual from './CandleVisual';

const ParabolicPanicOverview: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'short' | 'long'>('short');

  return (
    <div className="my-12 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-200 bg-clip-text text-transparent drop-shadow-sm">
          Setup Cheat Sheet
        </h1>
        <p className="text-gray-400 text-lg">
          Extreme Momentum Reversals — Account Makers & Account Breakers
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex bg-slate-900/60 rounded-lg p-1 border border-slate-700/50">
          <button
            onClick={() => setActiveMode('short')}
            className={cn(
              'px-6 py-2 rounded-md font-semibold text-sm transition-all duration-200',
              activeMode === 'short'
                ? 'bg-red-500/20 text-red-400 shadow-lg shadow-red-500/20'
                : 'text-slate-400 hover:text-slate-300'
            )}
          >
            Parabolic Short
          </button>
          <button
            onClick={() => setActiveMode('long')}
            className={cn(
              'px-6 py-2 rounded-md font-semibold text-sm transition-all duration-200',
              activeMode === 'long'
                ? 'bg-green-500/20 text-green-400 shadow-lg shadow-green-500/20'
                : 'text-slate-400 hover:text-slate-300'
            )}
          >
            Panic Dip Buy
          </button>
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={activeMode}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Info Grid */}
        <InfoGrid mode={activeMode} />

        {/* Candle Visual */}
        <CandleVisual type={activeMode} />
      </motion.div>
    </div>
  );
};

export default ParabolicPanicOverview;
