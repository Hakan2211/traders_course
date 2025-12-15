
import React, { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import {
  Zap,
  Brain,
  Play,
  RotateCcw,
  AlertTriangle,
  Check,
  TrendingDown,
} from 'lucide-react';

export const RaceAnimation: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'running' | 'finished'>('idle');
  const [reptileDone, setReptileDone] = useState(false);

  const reptileControls = useAnimation();
  const cortexControls = useAnimation();

  // 1:25 ratio roughly preserved (0.4s vs 8s) for dramatic effect in demo
  const REPTILE_DURATION = 0.4;
  const CORTEX_DURATION = 8.0;

  const handleStart = async () => {
    if (status === 'running') return;

    // Reset state
    setStatus('running');
    setReptileDone(false);
    reptileControls.set({ left: '0%' });
    cortexControls.set({ left: '0%' });

    // Start Reptile (Fast & Explosive)
    const reptileAnim = reptileControls.start({
      left: 'calc(100% - 3rem)', // 3rem = w-12 (48px)
      transition: { duration: REPTILE_DURATION, ease: 'circOut' },
    });

    // Start Neocortex (Slow & Linear)
    const cortexAnim = cortexControls.start({
      left: 'calc(100% - 3rem)',
      transition: { duration: CORTEX_DURATION, ease: 'linear' },
    });

    await reptileAnim;
    setReptileDone(true);

    await cortexAnim;
    setStatus('finished');
  };

  const handleReset = () => {
    setStatus('idle');
    setReptileDone(false);
    reptileControls.set({ left: '0%' });
    cortexControls.set({ left: '0%' });
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-16 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-sans relative group">
      {/* Glow Effects */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/30 transition-colors duration-1000" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-red-500/20 transition-colors duration-1000" />

      {/* Header */}
      <div className="bg-slate-800/50 p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-700/50 backdrop-blur-sm relative z-10">
        <div>
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
              <TrendingDown className="text-red-500 w-5 h-5" />
            </div>
            Neural Race Simulation
          </h3>
          <p className="text-slate-400 text-sm mt-1 ml-1">
            Visualizing the 480ms "Gap of Regret" between instinct and logic.
          </p>
        </div>

        <button
          onClick={status === 'finished' ? handleReset : handleStart}
          disabled={status === 'running'}
          className={`
                    px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg min-w-[180px] justify-center
                    ${
                      status === 'running'
                        ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        : status === 'finished'
                        ? 'bg-blue-700 hover:bg-blue-600 text-white shadow-indigo-500/20'
                        : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 hover:scale-105 active:scale-95'
                    }
                `}
        >
          {status === 'running' ? (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" />{' '}
              Processing...
            </span>
          ) : status === 'finished' ? (
            <span className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Reset Simulation
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Play className="w-4 h-4 fill-current" /> Trigger Market Crash
            </span>
          )}
        </button>
      </div>

      {/* Tracks Container */}
      <div className="p-8 pb-12 relative min-h-[420px] flex flex-col justify-center gap-14 bg-slate-950/80 backdrop-blur-sm">
        {/* Background Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* REPTILE TRACK */}
        <div className="relative z-10">
          <div className="flex justify-between mb-3 items-end px-1">
            <span className="text-red-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4" /> Reptilian Brain (20ms)
            </span>
            {reptileDone && (
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 font-black text-xs uppercase tracking-widest bg-red-950/30 px-3 py-1 rounded border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                Reaction Complete
              </motion.span>
            )}
          </div>

          {/* Track Rail */}
          <div className="h-14 bg-slate-900/50 rounded-full border border-slate-800 relative flex items-center shadow-inner overflow-hidden">
            {/* Progress Line */}
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-slate-700 -translate-y-1/2" />
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-red-500/30 -translate-y-1/2" />

            {/* Finish Line Marker */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-[2px] h-8 bg-slate-700" />

            {/* Runner */}
            <motion.div
              className="absolute left-0 top-1 bottom-1 w-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-[0_0_20px_rgba(220,38,38,0.6)] flex items-center justify-center border border-red-400 z-20"
              animate={reptileControls}
            >
              <Zap className="text-white w-5 h-5 fill-white" />
            </motion.div>

            {/* Finish Line Effect */}
            {reptileDone && (
              <motion.div
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="absolute right-16 top-1/2 -translate-y-1/2 flex items-center gap-3"
              >
                <div className="h-px w-12 bg-red-500/50 hidden md:block" />
                <div className="text-red-500 font-black text-lg md:text-2xl leading-none tracking-tighter text-right drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                  PANIC
                  <br />
                  SOLD
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* NEOCORTEX TRACK */}
        <div className="relative z-10">
          <div className="flex justify-between mb-3 items-end px-1">
            <span className="text-blue-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <Brain className="w-4 h-4" /> Neocortex (500ms)
            </span>
            <motion.span
              animate={{ opacity: status === 'running' ? [0.5, 1, 0.5] : 1 }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-slate-500 text-xs font-medium"
            >
              {status === 'running'
                ? 'Processing Logic...'
                : status === 'finished'
                ? 'Processing Complete'
                : 'Waiting for input...'}
            </motion.span>
          </div>

          {/* Track Rail */}
          <div className="h-14 bg-slate-900/50 rounded-full border border-slate-800 relative flex items-center shadow-inner overflow-hidden">
            {/* Checkpoints */}
            <div className="absolute inset-0 flex items-center justify-between px-[15%] md:px-[20%] text-[9px] md:text-[10px] font-bold text-slate-600 uppercase tracking-wider pointer-events-none z-0">
              {['Context', 'Analysis', 'Strategy'].map((label, i) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-3 relative"
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
                      status === 'finished'
                        ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                        : 'bg-slate-700'
                    }`}
                  />
                  <span className="absolute top-4">{label}</span>
                </div>
              ))}
            </div>

            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-slate-700 -translate-y-1/2" />

            {/* Finish Line Marker */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-[2px] h-8 bg-slate-700" />

            {/* Runner */}
            <motion.div
              className="absolute left-0 top-1 bottom-1 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center border border-blue-400 z-20"
              animate={cortexControls}
            >
              <Brain className="text-white w-5 h-5" />
            </motion.div>

            {/* Finish Line Effect */}
            {status === 'finished' && (
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="absolute right-16 top-1/2 -translate-y-1/2 flex items-center gap-3"
              >
                <div className="h-px w-12 bg-blue-500/50 hidden md:block" />
                <div className="text-blue-400 font-bold text-lg leading-none text-right flex flex-col items-end">
                  <span className="text-xs text-blue-500/70 uppercase">
                    Logic
                  </span>
                  <span>EXECUTED</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* THE GAP VISUALIZATION */}
        <motion.div
          className="absolute top-0 bottom-0 left-[6rem] right-[6rem] z-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: reptileDone && status !== 'finished' ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-full w-full relative flex flex-col justify-center items-center">
            {/* The Bracket/Zone */}
            <motion.div
              initial={{ height: '0%' }}
              animate={{ height: '70%' }}
              className="absolute w-full border-x-2 border-dashed border-red-500/20 bg-red-500/5 rounded-xl backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/90 border border-red-500 p-6 rounded-xl shadow-[0_0_50px_rgba(220,38,38,0.2)] text-center max-w-sm relative z-30"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 px-2 text-red-500">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>
              <h2 className="text-2xl font-black text-red-500 tracking-tight mb-2">
                THE GAP OF REGRET
              </h2>
              <div className="space-y-2 text-sm">
                <p className="text-slate-300">
                  <span className="text-red-400 font-bold">Panic Sell</span>{' '}
                  happened at 20ms.
                </p>
                <div className="h-px bg-slate-700 w-full" />
                <p className="text-slate-400">
                  Your{' '}
                  <span className="text-blue-400 font-bold">
                    Rational Brain
                  </span>{' '}
                  is still loading...
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Footer Info */}
      <div className="bg-slate-950/50 p-4 border-t border-slate-800 flex justify-center text-xs text-slate-500">
        * Simulation speed slowed 25x for visual demonstration
      </div>
    </div>
  );
};
