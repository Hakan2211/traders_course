
import React, { useEffect, useState } from 'react';
import { ArrowLeftRight, RotateCcw, Trophy } from 'lucide-react';
import { PredatorMode } from './components/PredatorMode';
import { SurvivorMode } from './components/SurvivorMode';
import {
  CURRENT_PRICE,
  GameHistoryItem,
  GameState,
  Mode,
  PriceLevel,
  SUPPORT_LEVEL,
} from './types';
import { generateMarketData } from './utils';

const StopHuntingSimulator: React.FC = () => {
  const [mode, setMode] = useState<Mode>('predator');
  const [gameState, setGameState] = useState<GameState>({
    capital: 50000,
    score: 0,
    round: 1,
    history: [],
  });
  const [levels, setLevels] = useState<PriceLevel[]>([]);
  const [showFeedback, setShowFeedback] = useState<GameHistoryItem | null>(
    null
  );

  useEffect(() => {
    setLevels(generateMarketData(SUPPORT_LEVEL));
  }, [gameState.round]);

  const handlePredatorComplete = (
    profit: number,
    historyItem: GameHistoryItem
  ) => {
    setGameState((prev) => ({
      ...prev,
      capital: Math.max(0, prev.capital + profit),
      history: [historyItem, ...prev.history].slice(0, 15),
    }));

    if (historyItem.targetPrice !== undefined) {
      const target = historyItem.targetPrice;
      setLevels((prev) =>
        prev.map((level) =>
          level.price <= CURRENT_PRICE && level.price >= target
            ? { ...level, isHunted: true }
            : level
        )
      );
    }

    setShowFeedback(historyItem);
  };

  const handleSurvivorComplete = (
    survived: boolean,
    stopPrice: number,
    historyItem: GameHistoryItem
  ) => {
    setGameState((prev) => ({
      ...prev,
      score: prev.score + historyItem.profit,
      history: [historyItem, ...prev.history].slice(0, 15),
    }));
    setShowFeedback(historyItem);
  };

  const nextRound = () => {
    setShowFeedback(null);
    setGameState((prev) => ({ ...prev, round: prev.round + 1 }));
  };

  const renderResultTitle = () => {
    if (!showFeedback) return '';
    switch (showFeedback.result) {
      case 'win':
        return 'Profit Secured';
      case 'loss':
        return 'Failed Liquidity Raid';
      case 'survived':
        return 'Survived the Hunt';
      case 'hunted':
        return 'Stop Ambushed';
      default:
        return 'Outcome';
    }
  };

  return (
    <div className="mx-auto my-10 w-full max-w-6xl rounded-3xl border border-slate-800 bg-slate-950 p-4 text-slate-200 shadow-2xl md:p-8">
      <header className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-slate-800 pb-6 text-left md:flex-row md:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Module 2 · Lesson 2.3
          </p>
          <h1 className="text-3xl font-black text-white md:text-4xl">
            Stop Hunting Simulator
          </h1>
          <p className="text-sm text-slate-400">
            Toggle between predator (market maker) and survivor (retail) roles
            to see how liquidity hunts unfold.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-center">
            <span className="text-xs uppercase tracking-wide text-slate-500">
              Round
            </span>
            <div className="font-mono text-2xl font-bold text-white">
              {gameState.round}
            </div>
          </div>
          <button
            onClick={() =>
              setMode((prev) => (prev === 'predator' ? 'survivor' : 'predator'))
            }
            className="flex items-center rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 font-semibold text-white transition hover:bg-slate-700"
          >
            <ArrowLeftRight size={16} className="mr-2" />
            Switch to {mode === 'predator' ? 'Survivor' : 'Predator'}
          </button>
        </div>
      </header>

      <div className="relative min-h-[600px]">
        {showFeedback && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/95 p-6 backdrop-blur">
            <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">
              <div className="mb-6 flex justify-center">
                {showFeedback.result === 'win' ||
                showFeedback.result === 'survived' ? (
                  <div className="rounded-full bg-green-500/20 p-4">
                    <Trophy size={48} className="text-green-400" />
                  </div>
                ) : (
                  <div className="rounded-full bg-red-500/20 p-4">
                    <RotateCcw size={48} className="text-red-400" />
                  </div>
                )}
              </div>
              <h2
                className={`mb-3 text-center text-2xl font-bold ${
                  showFeedback.result === 'win' ||
                  showFeedback.result === 'survived'
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}
              >
                {renderResultTitle()}
              </h2>
              <p className="mb-6 text-center text-slate-300">
                {showFeedback.description}
              </p>

              <div className="mb-6 rounded-lg border-l-4 border-blue-500 bg-slate-900 p-4">
                <h3 className="text-xs font-bold uppercase text-blue-400">
                  Key Takeaway
                </h3>
                <p className="text-sm text-slate-300">
                  {showFeedback.mode === 'predator'
                    ? 'Market makers attack dense clusters when the payout eclipses the cost of forcing price.'
                    : 'Stop placements survive when they sit beyond obvious liquidity pools and honor volatility.'}
                </p>
              </div>

              <button
                onClick={nextRound}
                className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-500"
              >
                Next Round
              </button>
            </div>
          </div>
        )}

        {mode === 'predator' ? (
          <PredatorMode
            levels={levels}
            currentPrice={CURRENT_PRICE}
            supportLevel={SUPPORT_LEVEL}
            gameState={gameState}
            onHuntComplete={handlePredatorComplete}
          />
        ) : (
          <SurvivorMode
            levels={levels}
            currentPrice={CURRENT_PRICE}
            supportLevel={SUPPORT_LEVEL}
            gameState={gameState}
            onSurvivalAttempt={handleSurvivorComplete}
          />
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <h3 className="mb-3 text-xs font-bold uppercase text-slate-400">
            Session History
          </h3>
          <div className="dom-scroll max-h-44 space-y-2 overflow-y-auto pr-1">
            {gameState.history.length === 0 && (
              <span className="text-xs italic text-slate-600">
                No raids or defenses yet.
              </span>
            )}
            {gameState.history.map((entry, idx) => (
              <div
                key={`${entry.round}-${idx}-${entry.mode}`}
                className="flex items-center justify-between border-b border-slate-800 pb-1 text-xs"
              >
                <span className="text-slate-500">
                  R{entry.round} · {entry.mode.toUpperCase()}
                </span>
                <span
                  className={
                    entry.profit > 0
                      ? 'text-green-400'
                      : entry.profit < 0
                      ? 'text-red-400'
                      : 'text-slate-300'
                  }
                >
                  {entry.profit > 0 ? '+' : ''}
                  {entry.profit}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <h3 className="mb-3 text-xs font-bold uppercase text-slate-400">
            Simulation Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500">
                Market Maker Capital
              </span>
              <div className="font-mono text-2xl font-bold text-emerald-400">
                ${gameState.capital.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500">
                Survivor Score
              </span>
              <div className="font-mono text-2xl font-bold text-blue-400">
                {gameState.score.toLocaleString()} pts
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StopHuntingSimulator;
