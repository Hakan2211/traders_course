
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  RotateCcw,
  TrendingDown,
  AlertTriangle,
  ShieldCheck,
  Skull,
  Activity,
  Info,
} from 'lucide-react';

interface Trade {
  result: 'W' | 'L';
  id: number;
}

interface Streak {
  length: number;
  startIndex: number;
  endIndex: number;
}

interface SimulationStats {
  wins: number;
  losses: number;
  winRate: number;
  maxStreak: number;
  streakCounts: Record<number, number>;
  streaks: Streak[];
}

const TOTAL_TRADES = 1000;
const ANIMATION_BATCH_SIZE = 25; // Trades revealed per frame

const StreakGenerator: React.FC = () => {
  const [targetWinRate, setTargetWinRate] = useState<number>(50);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [stats, setStats] = useState<SimulationStats | null>(null);
  const [selectedStreak, setSelectedStreak] = useState<Streak | null>(null);
  const [overlayOutcome, setOverlayOutcome] = useState<
    'discipline' | 'risk' | 'stop' | null
  >(null);
  const animationRef = useRef<number>(0);

  // --- Logic ---
  const generateData = useCallback(() => {
    const newTrades: Trade[] = [];
    let wins = 0;

    for (let i = 0; i < TOTAL_TRADES; i++) {
      const isWin = Math.random() * 100 < targetWinRate;
      if (isWin) wins++;
      newTrades.push({
        result: isWin ? 'W' : 'L',
        id: i,
      });
    }

    // Analyze streaks immediately
    let currentStreakLen = 0;
    let maxStreak = 0;
    const streaks: Streak[] = [];
    const streakCounts: Record<number, number> = {};

    for (let i = 0; i < newTrades.length; i++) {
      if (newTrades[i].result === 'L') {
        currentStreakLen++;
      } else {
        if (currentStreakLen >= 2) {
          // Record streak
          if (!streakCounts[currentStreakLen])
            streakCounts[currentStreakLen] = 0;
          streakCounts[currentStreakLen]++;

          streaks.push({
            length: currentStreakLen,
            startIndex: i - currentStreakLen,
            endIndex: i - 1,
          });
          if (currentStreakLen > maxStreak) maxStreak = currentStreakLen;
        }
        currentStreakLen = 0;
      }
    }

    // Check if ended on a streak
    if (currentStreakLen >= 2) {
      if (!streakCounts[currentStreakLen]) streakCounts[currentStreakLen] = 0;
      streakCounts[currentStreakLen]++;
      streaks.push({
        length: currentStreakLen,
        startIndex: TOTAL_TRADES - currentStreakLen,
        endIndex: TOTAL_TRADES - 1,
      });
      if (currentStreakLen > maxStreak) maxStreak = currentStreakLen;
    }

    setTrades(newTrades);
    setStats({
      wins,
      losses: TOTAL_TRADES - wins,
      winRate: (wins / TOTAL_TRADES) * 100,
      maxStreak,
      streakCounts,
      streaks,
    });

    // Start Animation
    setVisibleCount(0);
    setIsAnimating(true);
    setOverlayOutcome(null);
    setSelectedStreak(null);
  }, [targetWinRate]);

  useEffect(() => {
    if (isAnimating) {
      animationRef.current = requestAnimationFrame(() => {
        setVisibleCount((prev) => {
          const next = prev + ANIMATION_BATCH_SIZE;
          if (next >= TOTAL_TRADES) {
            setIsAnimating(false);
            return TOTAL_TRADES;
          }
          return next;
        });
      });
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isAnimating, visibleCount]);

  // Initial generation on mount
  useEffect(() => {
    generateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStreakClick = (index: number) => {
    if (!stats || isAnimating) return;

    // Find if this index belongs to a significant streak (>3)
    const streak = stats.streaks.find(
      (s) => index >= s.startIndex && index <= s.endIndex && s.length >= 4
    );

    if (streak) {
      setSelectedStreak(streak);
      setOverlayOutcome(null);
    }
  };

  const getCellClass = (index: number, type: 'W' | 'L') => {
    if (index >= visibleCount) return 'invisible';
    const base =
      'w-full aspect-square rounded-[1px] transition-all duration-300 ';

    if (type === 'W') {
      return base + 'bg-emerald-500/80 hover:bg-emerald-400';
    }

    // Logic for Losses
    let lossClass = base + 'bg-rose-500/80 hover:bg-rose-400 cursor-pointer ';

    // Highlight if part of a long streak during animation completion
    if (!isAnimating && stats) {
      const streak = stats.streaks.find(
        (s) => index >= s.startIndex && index <= s.endIndex
      );
      if (streak) {
        if (streak.length >= 6)
          return (
            lossClass +
            'bg-rose-600 ring-1 ring-white shadow-[0_0_8px_rgba(255,255,255,0.4)] z-10 relative'
          );
        if (streak.length === 5)
          return lossClass + 'bg-rose-600 ring-1 ring-rose-300/50';
        if (streak.length === 4) return lossClass + 'opacity-90';
      }
    }

    return lossClass + 'opacity-60';
  };

  // --- Render Helpers ---
  const renderPsychologyOverlay = () => {
    if (!selectedStreak) return null;
    const currentDrawdown = (selectedStreak.length * 1).toFixed(1); // Assuming 1% risk

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl max-w-md w-full p-6 relative">
          <button
            onClick={() => setSelectedStreak(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white"
          >
            ✕
          </button>

          {!overlayOutcome ? (
            <>
              <div className="flex items-center gap-3 mb-4 text-rose-400">
                <AlertTriangle className="w-8 h-8" />
                <h3 className="text-xl font-bold text-white">
                  The Siege is Here
                </h3>
              </div>

              <p className="text-slate-300 mb-6 leading-relaxed">
                You are currently in a{' '}
                <strong className="text-white">
                  {selectedStreak.length}-trade losing streak
                </strong>
                .
                <br />
                <br />
                If you risked 1% per trade, you are down{' '}
                <strong className="text-rose-400">-{currentDrawdown}%</strong>.
                Your brain is screaming that the system is broken. What do you
                do?
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => setOverlayOutcome('discipline')}
                  className="w-full p-4 text-left bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-emerald-500/50 rounded-lg transition-colors group"
                >
                  <span className="block font-semibold text-slate-200 group-hover:text-emerald-400">
                    1. Continue with discipline
                  </span>
                  <span className="text-sm text-slate-400">
                    Take the next A+ setup at normal risk.
                  </span>
                </button>

                <button
                  onClick={() => setOverlayOutcome('risk')}
                  className="w-full p-4 text-left bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-rose-500/50 rounded-lg transition-colors group"
                >
                  <span className="block font-semibold text-slate-200 group-hover:text-rose-400">
                    2. Increase risk to recover
                  </span>
                  <span className="text-sm text-slate-400">
                    Double size to get back to breakeven quickly.
                  </span>
                </button>

                <button
                  onClick={() => setOverlayOutcome('stop')}
                  className="w-full p-4 text-left bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-amber-500/50 rounded-lg transition-colors group"
                >
                  <span className="block font-semibold text-slate-200 group-hover:text-amber-400">
                    3. Stop trading and analyze
                  </span>
                  <span className="text-sm text-slate-400">
                    Take a break. Review execution errors.
                  </span>
                </button>
              </div>
            </>
          ) : (
            <div className="animate-in zoom-in-95 duration-200">
              {overlayOutcome === 'discipline' && (
                <div className="text-center">
                  <ShieldCheck className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-emerald-400 mb-2">
                    Excellent Choice
                  </h3>
                  <p className="text-slate-300 mb-6">
                    This streak was statistical noise. By sticking to your plan,
                    you captured the winning streak that followed immediately
                    after. Your capital is preserved.
                  </p>
                </div>
              )}

              {overlayOutcome === 'risk' && (
                <div className="text-center">
                  <Skull className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-rose-500 mb-2">
                    Fatal Error
                  </h3>
                  <p className="text-slate-300 mb-6">
                    The next trade was also a loss. Because you doubled risk,
                    you dug a hole twice as deep. You are now tilting and
                    emotional. The siege has breached the walls.
                  </p>
                </div>
              )}

              {overlayOutcome === 'stop' && (
                <div className="text-center">
                  <Activity className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-amber-500 mb-2">
                    Good Defense
                  </h3>
                  <p className="text-slate-300 mb-6">
                    Taking a step back is never wrong. You preserved your mental
                    capital. When you returned 2 days later, the market
                    conditions had improved.
                  </p>
                </div>
              )}

              <button
                onClick={() => setSelectedStreak(null)}
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg"
              >
                Return to Simulation
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="my-12 bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
      {renderPsychologyOverlay()}

      {/* Header / Controls */}
      <div className="p-6 border-b border-slate-700 bg-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="text-blue-400" />
              Monte Carlo Streak Generator
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Simulating 1,000 trades to visualize probability clusters
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-lg border border-slate-700">
            <div className="flex flex-col">
              <label className="text-xs text-slate-400 font-mono mb-1">
                WIN RATE: {targetWinRate}%
              </label>
              <input
                type="range"
                min="30"
                max="80"
                step="5"
                value={targetWinRate}
                onChange={(e) => setTargetWinRate(parseInt(e.target.value))}
                disabled={isAnimating}
                className="w-32 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-800"
              />
            </div>

            <button
              onClick={generateData}
              disabled={isAnimating}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                isAnimating
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-800 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20'
              }`}
            >
              {isAnimating ? (
                <RotateCcw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
              {isAnimating ? 'Running...' : 'Generate'}
            </button>
          </div>
        </div>
      </div>

      {/* The Grid */}
      <div className="p-6 bg-slate-900 flex justify-center overflow-hidden relative">
        <div className="grid grid-cols-[repeat(25,_minmax(0,_1fr))] sm:grid-cols-[repeat(40,_minmax(0,_1fr))] md:grid-cols-[repeat(50,_minmax(0,_1fr))] gap-[2px] w-full max-w-5xl">
          {trades.map((trade, i) => (
            <div
              key={trade.id}
              onClick={() =>
                trade.result === 'L' ? handleStreakClick(i) : undefined
              }
              className={getCellClass(i, trade.result)}
            />
          ))}
        </div>

        {/* Scan line effect during animation */}
        {isAnimating && (
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-blue-800/10 to-transparent translate-y-[100%] animate-[scan_2s_ease-in-out_infinite]" />
        )}
      </div>

      {/* Stats Panel */}
      <div className="p-6 bg-slate-800 border-t border-slate-700">
        {!stats || isAnimating ? (
          <div className="h-40 flex items-center justify-center text-slate-500 font-mono text-sm animate-pulse">
            {isAnimating
              ? 'Simulating market conditions...'
              : 'Waiting for simulation...'}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basic Stats */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  Simulation Results
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 p-4 rounded border border-slate-700/50">
                    <div className="text-slate-400 text-xs mb-1">
                      Realized Win Rate
                    </div>
                    <div className="text-2xl font-mono text-emerald-400 font-bold">
                      {stats.winRate.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded border border-slate-700/50">
                    <div className="text-slate-400 text-xs mb-1">
                      Total Losses
                    </div>
                    <div className="text-2xl font-mono text-rose-400 font-bold">
                      {stats.losses}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-4 rounded border border-rose-900/30 flex items-start gap-3">
                  <TrendingDown className="w-5 h-5 text-rose-500 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-slate-300 font-semibold">
                      Longest Streak:{' '}
                      <span className="text-white text-lg">
                        {stats.maxStreak} Losses
                      </span>
                    </div>
                    <div className="text-slate-500 text-xs mt-1">
                      At 1% risk, this is a{' '}
                      <span className="text-rose-400">-{stats.maxStreak}%</span>{' '}
                      drawdown from a single streak.
                    </div>
                  </div>
                </div>
              </div>

              {/* Streak Distribution */}
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Streak Frequency
                </h4>
                <div className="space-y-2">
                  {[3, 4, 5, 6, 7, 8].map((count) => {
                    const occurences = stats.streakCounts[count] || 0;
                    if (occurences === 0 && count > 5) return null; // Hide empty high streaks

                    const isHigh = count >= 5;

                    return (
                      <div
                        key={count}
                        className={`flex items-center justify-between p-2 rounded ${
                          isHigh
                            ? 'bg-rose-900/20 border border-rose-900/30'
                            : 'bg-slate-700/30'
                        }`}
                      >
                        <span
                          className={`text-sm ${
                            isHigh
                              ? 'text-rose-300 font-bold'
                              : 'text-slate-300'
                          }`}
                        >
                          {count} Losses in a row
                        </span>
                        <span className="font-mono text-slate-200">
                          {occurences}x
                        </span>
                      </div>
                    );
                  })}

                  {stats.maxStreak > 8 && (
                    <div className="flex items-center justify-between p-2 rounded bg-rose-900/40 border border-rose-500/50 animate-pulse">
                      <span className="text-sm text-rose-200 font-bold">
                        {stats.maxStreak} Losses in a row (MAX)
                      </span>
                      <span className="font-mono text-white">1x</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-2 text-xs text-slate-400 bg-slate-900/30 p-3 rounded">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-400" />
              <p>
                <strong>Tip:</strong> Click on the highlighted red streaks in
                the grid above to test your psychological response to these
                events.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreakGenerator;
