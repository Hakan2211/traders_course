
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, AlertTriangle, ShieldCheck, Skull } from 'lucide-react';
import { TraderProfile } from './types';

interface UIOverlayProps {
  traders: TraderProfile[];
  currentTrade: number;
  totalTrades: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (value: number) => void;
  selectedTraderId: string | null;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({
  traders,
  currentTrade,
  totalTrades,
  isPlaying,
  onTogglePlay,
  onSeek,
  selectedTraderId,
}) => {
  const selectedTrader = traders.find((t) => t.id === selectedTraderId);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
      {/* Header */}
      <header className="pointer-events-auto">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-sm">
          Position Size Impact
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-md">
          Visualize how position sizing determines survival. Scrub through the
          timeline to see the outcome of 100 identical trades with different
          sizing strategies.
        </p>
      </header>

      {/* Main Stats Panel (Bottom Left) */}
      <div className="pointer-events-auto flex gap-6 items-end">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-xl p-5 shadow-2xl w-full max-w-2xl">
          {/* Timeline Controls */}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onTogglePlay}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 transition-colors"
            >
              {isPlaying ? (
                <Pause size={20} fill="currentColor" />
              ) : (
                <Play size={20} fill="currentColor" className="ml-0.5" />
              )}
            </button>
            <div className="flex-1">
              <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono uppercase tracking-wider">
                <span>Start</span>
                <span className="text-white font-bold">
                  Trade {currentTrade} / {totalTrades}
                </span>
                <span>End</span>
              </div>
              <input
                type="range"
                min="0"
                max={totalTrades}
                value={currentTrade}
                onChange={(e) => onSeek(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
              />
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            {traders.map((t) => {
              const isActive = selectedTraderId === t.id;
              const balance = t.data.balance[currentTrade];
              const start = t.initialBalance;
              const gain = ((balance - start) / start) * 100;
              const isDead = !t.data.isAlive[currentTrade];

              return (
                <div
                  key={t.id}
                  className={`rounded-lg p-3 border transition-colors ${
                    isActive
                      ? 'bg-slate-800 border-slate-600'
                      : 'bg-transparent border-transparent opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        t.riskType === 'conservative'
                          ? 'bg-emerald-400'
                          : t.riskType === 'aggressive'
                          ? 'bg-amber-400'
                          : 'bg-red-400'
                      }`}
                    />
                    <span className="text-xs font-bold text-slate-300">
                      {t.name}
                    </span>
                  </div>
                  <div className="font-mono text-lg font-bold">
                    {isDead ? (
                      <span className="text-slate-500">BUSTED</span>
                    ) : (
                      <span
                        className={
                          gain >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }
                      >
                        {gain > 0 ? '+' : ''}
                        {gain.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    Max DD:{' '}
                    {Math.max(
                      ...t.data.drawdown.slice(0, currentTrade + 1)
                    ).toFixed(1)}
                    %
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Context Panel (Right Side - Only shows if a trader is selected) */}
      <AnimatePresence>
        {selectedTrader && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="absolute right-6 top-6 bottom-6 w-80 bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-xl p-6 shadow-2xl overflow-y-auto pointer-events-auto"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-slate-800 rounded-lg">
                {selectedTrader.riskType === 'conservative' && (
                  <ShieldCheck className="text-emerald-400" size={24} />
                )}
                {selectedTrader.riskType === 'aggressive' && (
                  <AlertTriangle className="text-amber-400" size={24} />
                )}
                {selectedTrader.riskType === 'emotional' && (
                  <Skull className="text-red-400" size={24} />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {selectedTrader.name}
                </h2>
                <span className="text-xs text-slate-400 uppercase tracking-widest">
                  {selectedTrader.riskType} Strategy
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">
                  Current Status
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-800 p-3 rounded text-center">
                    <div className="text-xs text-slate-400">Equity</div>
                    <div
                      className={`font-mono font-bold ${
                        selectedTrader.data.balance[currentTrade] >
                        selectedTrader.initialBalance
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      $
                      {Math.round(
                        selectedTrader.data.balance[currentTrade]
                      ).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-slate-800 p-3 rounded text-center">
                    <div className="text-xs text-slate-400">
                      Current Drawdown
                    </div>
                    <div className="font-mono font-bold text-amber-400">
                      {selectedTrader.data.drawdown[currentTrade].toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">
                  Analysis
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {selectedTrader.riskType === 'conservative' &&
                    'By risking only 1%, this trader acts as a fortress. Even during losing streaks, the equity curve remains smooth. The psychological impact of losses is minimal, allowing for disciplined execution.'}
                  {selectedTrader.riskType === 'aggressive' &&
                    'Risking 5% creates massive volatility. While gains can be explosive, the drawdowns are deep and painful. A bad losing streak here cuts capital by 40-50%, requiring mathematically improbable gains to recover.'}
                  {selectedTrader.riskType === 'emotional' &&
                    "Variable position sizing based on emotion is the fastest path to ruin. 'Revenge trading' (increasing size after losses) accelerates the destruction of capital during inevitable market downturns."}
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="text-xs text-slate-400 mb-1">Lesson</div>
                <div className="text-sm font-medium text-emerald-300 italic">
                  {selectedTrader.riskType === 'conservative'
                    ? '"Your position size is your shield."'
                    : '"Get it wrong, and you\'ll be dead before you learn to fight."'}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
