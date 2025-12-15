
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gem,
  Weight,
  AlertTriangle,
  Calculator,
  ArrowRight,
  Info,
} from 'lucide-react';

export type CalculatorState = 'idle' | 'prime' | 'caution' | 'avoid';

export const FloatCalculator: React.FC = () => {
  const [currentFloat, setCurrentFloat] = useState<string>('');
  const [splitRatio, setSplitRatio] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const [status, setStatus] = useState<CalculatorState>('idle');

  // Format number helper (e.g., 2,500,000)
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(num);
  };

  useEffect(() => {
    // Reset if inputs are empty
    if (!currentFloat || !splitRatio) {
      setResult(null);
      setStatus('idle');
      return;
    }

    // Parse inputs (remove commas from float string)
    const floatNum = parseFloat(currentFloat.replace(/,/g, ''));
    const ratioNum = parseFloat(splitRatio);

    // Validate inputs
    if (isNaN(floatNum) || isNaN(ratioNum) || ratioNum === 0) {
      setResult(null);
      setStatus('idle');
      return;
    }

    // Calculate Post-Split Float
    const calculatedFloat = floatNum / ratioNum;
    setResult(calculatedFloat);

    // Determine Status based on rules
    // < 3M: Prime
    // 3M - 5M: Caution
    // > 5M: Avoid
    if (calculatedFloat < 3000000) {
      setStatus('prime');
    } else if (calculatedFloat >= 3000000 && calculatedFloat <= 5000000) {
      setStatus('caution');
    } else {
      setStatus('avoid');
    }
  }, [currentFloat, splitRatio]);

  // Framer Motion Variants for the Card Container
  const cardVariants = {
    idle: {
      scale: 1,
      x: 0,
      borderColor: '#334155', // slate-700
      boxShadow: '0 0 0 rgba(0,0,0,0)',
    },
    prime: {
      scale: 1.05,
      x: 0,
      borderColor: '#22c55e', // green-500
      boxShadow: '0 0 25px rgba(34, 197, 94, 0.25)',
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
    caution: {
      scale: 1,
      x: 0,
      borderColor: '#eab308', // yellow-500
      boxShadow: '0 0 15px rgba(234, 179, 8, 0.2)',
    },
    avoid: {
      scale: 1,
      x: [0, -10, 10, -10, 10, 0], // Shake animation
      borderColor: '#ef4444', // red-500
      boxShadow: '0 0 25px rgba(239, 68, 68, 0.3)',
      transition: {
        x: { duration: 0.4, ease: 'easeInOut' },
        // Ensure scale transition is separate so it doesn't conflict with shake
        scale: { duration: 0.2 },
      },
    },
  };

  return (
    <motion.div
      className="w-full max-w-md mx-auto bg-slate-800 rounded-2xl border-2 p-6 md:p-8 relative overflow-hidden shadow-2xl"
      variants={cardVariants}
      animate={status}
      initial="idle"
    >
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8 relative z-10">
        <div className="p-2.5 bg-slate-700/50 rounded-xl backdrop-blur-sm border border-slate-600/50">
          <Calculator className="w-5 h-5 text-slate-300" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100 leading-tight">
            Post-Split Float
          </h2>
          <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">
            Setup Validator
          </p>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        {/* Input Group 1: Current Float */}
        <div className="space-y-2">
          <label
            htmlFor="float"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-400"
          >
            Current Float (Shares)
          </label>
          <div className="relative group">
            <input
              type="text"
              id="float"
              value={currentFloat}
              onChange={(e) => {
                // Allow only numbers and commas
                const val = e.target.value.replace(/[^0-9]/g, '');
                setCurrentFloat(val ? Number(val).toLocaleString('en-US') : '');
              }}
              placeholder="e.g. 50,000,000"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3.5 text-lg text-slate-100 
                         focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 
                         placeholder-slate-600 font-mono transition-all group-hover:border-slate-500"
            />
          </div>
        </div>

        {/* Input Group 2: Split Ratio */}
        <div className="space-y-2">
          <label
            htmlFor="ratio"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-400"
          >
            Split Ratio (1-for-X)
          </label>
          <div className="relative flex items-center group">
            <div className="absolute left-0 top-0 bottom-0 bg-slate-700/50 px-3.5 rounded-l-lg border-r border-slate-600 flex items-center justify-center">
              <span className="text-slate-300 font-mono font-bold text-sm">
                1 :
              </span>
            </div>
            <input
              type="number"
              id="ratio"
              value={splitRatio}
              onChange={(e) => setSplitRatio(e.target.value)}
              placeholder="20"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-16 pr-4 py-3.5 text-lg text-slate-100 
                         focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 
                         placeholder-slate-600 font-mono transition-all group-hover:border-slate-500"
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Enter the denominator. For a 1-for-10 split, enter 10.
          </p>
        </div>

        {/* Divider */}
        <div className="flex justify-center items-center py-2 opacity-50">
          <div className="h-px bg-slate-600 flex-1"></div>
          <div className="mx-4 text-slate-500">
            <ArrowRight className="w-4 h-4" />
          </div>
          <div className="h-px bg-slate-600 flex-1"></div>
        </div>

        {/* Result & Feedback Area */}
        <div className="min-h-[180px] flex flex-col justify-center bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-center text-slate-500"
              >
                <Info className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">
                  Enter values above to calculate the post-split float.
                </p>
              </motion.div>
            )}

            {status === 'prime' && (
              <motion.div
                key="prime"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center"
              >
                <div className="flex justify-center mb-3">
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
                    className="p-3 bg-green-500/10 rounded-full ring-1 ring-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                  >
                    <Gem className="w-8 h-8 text-green-400" />
                  </motion.div>
                </div>
                <h3 className="text-2xl font-bold text-green-400 font-mono mb-1 tracking-tight">
                  {result !== null ? formatNumber(result) : '-'}
                </h3>
                <p className="text-green-300 font-bold text-sm tracking-wider uppercase mb-2">
                  Prime Setup
                </p>
                <p className="text-green-400/70 text-xs leading-relaxed">
                  The float is light enough for effortless manipulation. <br />
                  <span className="text-green-300 font-medium">
                    Add to Watchlist.
                  </span>
                </p>
              </motion.div>
            )}

            {status === 'caution' && (
              <motion.div
                key="caution"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-center"
              >
                <div className="flex justify-center mb-3">
                  <motion.div
                    initial={{ rotate: -10 }}
                    animate={{ rotate: 10 }}
                    transition={{
                      repeat: Infinity,
                      repeatType: 'reverse',
                      duration: 0.8,
                    }}
                    className="p-3 bg-yellow-500/10 rounded-full ring-1 ring-yellow-500/50"
                  >
                    <AlertTriangle className="w-8 h-8 text-yellow-400" />
                  </motion.div>
                </div>
                <h3 className="text-2xl font-bold text-yellow-400 font-mono mb-1 tracking-tight">
                  {result !== null ? formatNumber(result) : '-'}
                </h3>
                <p className="text-yellow-300 font-bold text-sm tracking-wider uppercase mb-2">
                  Caution
                </p>
                <p className="text-yellow-400/70 text-xs leading-relaxed">
                  Tradeable, but requires significant volume. <br />
                  <span className="text-yellow-200 font-medium">
                    Reduce Position Size.
                  </span>
                </p>
              </motion.div>
            )}

            {status === 'avoid' && (
              <motion.div
                key="avoid"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center"
              >
                <div className="flex justify-center mb-3">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: 'easeInOut',
                    }}
                    className="p-3 bg-red-500/10 rounded-full ring-1 ring-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  >
                    <Weight className="w-8 h-8 text-red-400" />
                  </motion.div>
                </div>
                <h3 className="text-2xl font-bold text-red-400 font-mono mb-1 tracking-tight">
                  {result !== null ? formatNumber(result) : '-'}
                </h3>
                <p className="text-red-300 font-bold text-sm tracking-wider uppercase mb-2">
                  Float Too Heavy
                </p>
                <p className="text-red-400/70 text-xs leading-relaxed">
                  Too much capital needed to pump this boat. <br />
                  <span className="text-red-300 font-bold">AVOID / SKIP</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Visual background flourishes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>
    </motion.div>
  );
};
