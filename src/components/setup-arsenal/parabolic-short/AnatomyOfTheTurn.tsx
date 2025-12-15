
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, TrendingDown, TrendingUp, Volume2 } from 'lucide-react';

type Mode = 'short' | 'long';

const AnatomyOfTheTurn: React.FC = () => {
  const [mode, setMode] = useState<Mode>('short');

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl overflow-hidden my-8">
      {/* Header / Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Anatomy of the Turn
            <span className="text-xs px-2 py-0.5 rounded border border-gray-700 text-gray-400 font-mono uppercase">
              Live Simulation
            </span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Watch the{' '}
            <span
              className={
                mode === 'short' ? 'text-rose-400' : 'text-emerald-400'
              }
            >
              {mode === 'short' ? 'Exhaustion Wick' : 'Washout Candle'}
            </span>{' '}
            formation loop.
          </p>
        </div>

        <div className="flex bg-gray-950 rounded-lg p-1 border border-gray-800">
          <button
            onClick={() => setMode('short')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
              mode === 'short'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <TrendingDown size={16} />
            Parabolic Short
          </button>
          <button
            onClick={() => setMode('long')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
              mode === 'long'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <TrendingUp size={16} />
            Panic Dip Buy
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative h-[400px] bg-[#0a0f1c] rounded-xl border border-gray-800/60 overflow-hidden mb-6 group">
        {/* Chart Grid Background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        ></div>

        <AnimatePresence mode="wait">
          {mode === 'short' ? (
            <ShortSetup key="short" />
          ) : (
            <LongSetup key="long" />
          )}
        </AnimatePresence>
      </div>

      {/* Insight Footer */}
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-lg border-l-4 ${
          mode === 'short'
            ? 'bg-rose-950/20 border-rose-500/50'
            : 'bg-emerald-950/20 border-emerald-500/50'
        }`}
      >
        <h4
          className={`font-bold uppercase text-xs mb-1 flex items-center gap-2 ${
            mode === 'short' ? 'text-rose-400' : 'text-emerald-400'
          }`}
        >
          <AlertCircle size={14} />
          Key Insight
        </h4>
        <p className="text-gray-300 text-sm leading-relaxed">
          {mode === 'short' ? (
            <span>
              Wait for the <span className="text-rose-400 font-bold">wick</span>{' '}
              to form. Novice traders short while the green candle is still
              expanding. The entry is ONLY valid when price rejects the high and
              breaks below the wick body.
            </span>
          ) : (
            <span>
              Volume is the lie detector. Notice the{' '}
              <span className="text-blue-400 font-bold">Volume Spike</span> at
              the bottom. Without massive volume, a long lower wick is just a
              pause, not a reversal. Wait for the green close.
            </span>
          )}
        </p>
      </motion.div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Short Setup Component
// ---------------------------------------------------------------------------

const ShortSetup: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-end justify-center pb-12 gap-6"
    >
      {/* Context Candle 1 */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 80, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-10 bg-emerald-500/40 rounded-sm relative"
      >
        <div className="absolute -top-4 left-1/2 w-[1px] h-24 bg-emerald-500/40 -translate-x-1/2" />
      </motion.div>

      {/* Context Candle 2 */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 140, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-10 bg-emerald-500/60 rounded-sm relative"
      >
        <div className="absolute -top-6 left-1/2 w-[1px] h-44 bg-emerald-500/60 -translate-x-1/2" />
      </motion.div>

      {/* THE TRIGGER CANDLE */}
      <div className="relative w-14 h-[300px] flex items-end justify-center mx-4">
        {/* Wick Animation (The Rejection) */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 80, opacity: 1 }}
          transition={{
            duration: 0.4,
            delay: 1.5, // Appears after the pump
            repeat: Infinity,
            repeatDelay: 5,
            ease: 'easeOut',
          }}
          className="w-[2px] bg-rose-500 absolute top-0 z-0 origin-bottom"
        />

        {/* Body Animation (The Pump & Dump) */}
        <motion.div
          initial={{ height: 0, backgroundColor: '#10b981' }} // Emerald-500
          animate={{
            height: [0, 260, 180, 180],
            backgroundColor: ['#10b981', '#10b981', '#f43f5e', '#f43f5e'],
          }}
          transition={{
            duration: 3,
            times: [0, 0.4, 0.6, 1],
            ease: ['easeIn', 'circIn', 'backOut', 'linear'],
          }}
          className="w-full rounded-sm z-10 relative"
        >
          {/* Label indicating live price action */}
          <motion.div
            animate={{
              opacity: [0, 1, 0],
              y: [0, -25, -25],
            }}
            transition={{ duration: 1.5, times: [0, 0.3, 1], delay: 0.5 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[10px] font-bold px-1 rounded whitespace-nowrap"
          >
            PARABOLIC!
          </motion.div>
        </motion.div>

        {/* Annotation Popup */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{
            opacity: [0, 1, 0],
            x: [20, 50, 20],
          }}
          transition={{ duration: 0.9, delay: 1.8, times: [0, 0.7, 1] }}
          className="absolute top-20 right-0 transform translate-x-full w-48 z-20"
        >
          <div className="bg-gray-800 p-3 rounded-lg border border-rose-500 text-xs text-rose-100 shadow-2xl relative">
            <strong className="text-rose-400 block mb-1">
              Exhaustion Wick
            </strong>
            Buyers trapped at the top. Momentum lost.
            <div className="absolute top-4 -left-2 w-2 h-2 bg-gray-800 border-l border-b border-rose-500 transform rotate-45"></div>
            <div className="h-px w-8 bg-rose-500 absolute top-5 -left-10"></div>
          </div>
        </motion.div>

        {/* Entry Point Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0],
          }}
          transition={{ duration: 0.4, delay: 2.2, times: [0, 0.5, 1] }}
          className="absolute bottom-[170px] w-[180%] border-b border-dashed border-blue-400 text-right pr-2 pt-1"
        >
          <span className="text-[10px] font-bold text-blue-400 bg-blue-900/30 px-1 rounded">
            ENTRY
          </span>
        </motion.div>
      </div>

      {/* Confirmation Candle (The Drop) */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: [0, 60, 60],
          opacity: [0, 1, 1],
        }}
        transition={{ duration: 0.4, delay: 2.3, times: [0, 1, 1] }}
        className="w-10 bg-rose-500 rounded-sm relative"
      >
        <div className="absolute bottom-0 left-1/2 w-[1px] h-20 bg-rose-500 -translate-x-1/2" />
      </motion.div>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Long Setup Component
// ---------------------------------------------------------------------------

const LongSetup: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col justify-between"
    >
      {/* Chart Area */}
      <div className="flex-1 flex items-start justify-center pt-12 gap-6 relative">
        {/* Context Candle 1 */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 60, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-10 bg-rose-500/40 rounded-sm relative"
        >
          <div className="absolute -bottom-4 left-1/2 w-[1px] h-20 bg-rose-500/40 -translate-x-1/2" />
        </motion.div>

        {/* Context Candle 2 */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 100, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-10 bg-rose-500/60 rounded-sm relative"
        >
          <div className="absolute -bottom-6 left-1/2 w-[1px] h-32 bg-rose-500/60 -translate-x-1/2" />
        </motion.div>

        {/* THE WASHOUT CANDLE */}
        <div className="relative w-14 h-[300px] flex items-start justify-center mx-4">
          {/* Body Animation (The Crash & Reclaim) */}
          <motion.div
            initial={{ height: 0, backgroundColor: '#f43f5e' }} // Rose-500
            animate={{
              height: [0, 240, 120, 120],
              backgroundColor: ['#f43f5e', '#f43f5e', '#f43f5e', '#f43f5e'],
            }}
            transition={{
              duration: 3,
              times: [0, 0.4, 0.6, 1],
              ease: ['easeIn', 'circIn', 'backOut', 'linear'],
            }}
            className="w-full rounded-sm z-10 relative"
          >
            {/* Panic Label */}
            <motion.div
              animate={{
                opacity: [0, 1, 0],
                y: [0, 25, 25],
              }}
              transition={{ duration: 1.5, times: [0, 0.3, 1], delay: 0.6 }}
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-rose-500 text-[10px] font-bold whitespace-nowrap"
            >
              PANIC!
            </motion.div>
          </motion.div>

          {/* Wick Animation (The Tail) */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 120, opacity: 1 }}
            transition={{
              duration: 0.4,
              delay: 1.5,
              repeat: Infinity,
              repeatDelay: 5,
              ease: 'easeOut',
            }}
            className="w-[2px] bg-rose-500 absolute top-[120px] z-0 origin-top"
          />

          {/* Annotation Popup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{
              opacity: [0, 1, 0],
              x: [20, 50, 20],
            }}
            transition={{ duration: 0.9, delay: 1.8, times: [0, 0.7, 1] }}
            className="absolute bottom-20 right-0 transform translate-x-full w-48 z-20"
          >
            <div className="bg-gray-800 p-3 rounded-lg border border-emerald-500 text-xs text-emerald-100 shadow-2xl relative">
              <strong className="text-emerald-400 block mb-1">
                Rejection of Lows
              </strong>
              Sellers exhausted. Smart money stepping in.
              <div className="absolute bottom-4 -left-2 w-2 h-2 bg-gray-800 border-l border-b border-emerald-500 transform rotate-45"></div>
              <div className="h-px w-8 bg-emerald-500 absolute bottom-5 -left-10"></div>
            </div>
          </motion.div>
        </div>

        {/* Reversal Candle (The Bounce) */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: [0, 50, 50],
            opacity: [0, 1, 1],
          }}
          transition={{ duration: 0.4, delay: 2.3, times: [0, 1, 1] }}
          // Align visual top with bottom of washout body
          className="w-10 bg-emerald-500 rounded-sm mt-[120px]"
        />
      </div>

      {/* Volume Section at Bottom */}
      <div className="h-16 border-t border-gray-800 bg-gray-900/50 flex items-end justify-center gap-6 pb-0 relative">
        <div className="absolute top-2 left-2 flex items-center gap-1 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
          <Volume2 size={12} /> Volume
        </div>

        {/* Vol 1 */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: '30%' }}
          transition={{ duration: 0.5 }}
          className="w-10 bg-gray-700/50 rounded-t-sm"
        />

        {/* Vol 2 */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: '45%' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-10 bg-gray-700/50 rounded-t-sm"
        />

        {/* CLIMAX VOL */}
        <div className="w-14 relative h-full flex items-end justify-center mx-4">
          <motion.div
            initial={{ height: 0 }}
            animate={{
              height: ['0%', '100%', '100%'],
            }}
            transition={{
              duration: 0.4,
              delay: 0.7,
              ease: 'easeOut',
              times: [0, 1, 1],
            }}
            className="w-full bg-blue-500/80 rounded-t-sm shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          />
        </div>

        {/* Vol 4 */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: '20%' }}
          transition={{ duration: 0.5, delay: 2.4 }}
          className="w-10 bg-gray-700/50 rounded-t-sm"
        />
      </div>
    </motion.div>
  );
};

export default AnatomyOfTheTurn;
