
import React, { useState } from 'react';
import { Info, Shield, TrendingUp } from 'lucide-react';
import { getHuntProbability } from '../utils';
import { GameHistoryItem, GameState, PIP_VALUE, PriceLevel } from '../types';
import { HeatmapLadder } from './HeatmapLadder';

interface SurvivorModeProps {
  levels: PriceLevel[];
  currentPrice: number;
  supportLevel: number;
  gameState: GameState;
  onSurvivalAttempt: (
    survived: boolean,
    stopPrice: number,
    historyItem: GameHistoryItem
  ) => void;
}

export const SurvivorMode: React.FC<SurvivorModeProps> = ({
  levels,
  currentPrice,
  supportLevel,
  gameState,
  onSurvivalAttempt,
}) => {
  const [selectedStop, setSelectedStop] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const simulateHunt = (): number => {
    const r = Math.random();
    let dipPips = 0;

    if (r < 0.4) dipPips = 5 + Math.random() * 5;
    else if (r < 0.7) dipPips = 10 + Math.random() * 10;
    else if (r < 0.9) dipPips = 20 + Math.random() * 10;
    else dipPips = Math.random() * 5;

    return parseFloat((supportLevel - dipPips * PIP_VALUE).toFixed(4));
  };

  const handlePlaceOrder = () => {
    if (selectedStop === null || isProcessing) return;

    setIsProcessing(true);
    const huntPrice = simulateHunt();

    setTimeout(() => {
      const survived = selectedStop < huntPrice;
      const pipsAway = Math.round((supportLevel - selectedStop) / PIP_VALUE);
      const scoreChange = survived ? 1000 - pipsAway * 10 : -500;

      onSurvivalAttempt(survived, selectedStop, {
        round: gameState.round,
        mode: 'survivor',
        result: survived ? 'survived' : 'hunted',
        profit: scoreChange,
        description: survived
          ? `Survived! Hunt bottomed at ${huntPrice.toFixed(
              4
            )}. Stop at ${selectedStop.toFixed(4)} held firm.`
          : `Hunted! Liquidity raid swept to ${huntPrice.toFixed(
              4
            )} and tagged your stop.`,
        stopPrice: selectedStop,
        huntLow: huntPrice,
      });

      setIsProcessing(false);
      setSelectedStop(null);
    }, 1500);
  };

  const riskAnalysis =
    selectedStop !== null
      ? getHuntProbability(selectedStop, supportLevel)
      : null;

  return (
    <div className="grid h-full grid-cols-1 gap-6 md:grid-cols-12">
      <div className="flex flex-col space-y-4 md:col-span-5">
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-lg">
          <h2 className="mb-4 flex items-center text-xl font-bold text-blue-400">
            <Shield className="mr-2" /> Retail Defense
          </h2>
          <p className="mb-6 text-sm text-slate-400">
            You're taking a long at support. Place your stop in a low-liquidity
            pocket that survives the most common liquidity hunts.
          </p>

          <div className="space-y-6">
            <div className="rounded border border-slate-700 bg-slate-900 p-4">
              <span className="text-xs uppercase tracking-wider text-slate-500">
                Survivor Score
              </span>
              <div className="font-mono text-2xl font-bold text-blue-400">
                {gameState.score.toLocaleString()} pts
              </div>
            </div>

            <div className="rounded border border-slate-600 bg-slate-800 p-4">
              <label className="mb-2 block text-xs font-bold uppercase text-slate-400">
                Selected Stop Level
              </label>
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl text-white">
                  {selectedStop !== null ? selectedStop.toFixed(4) : '---'}
                </span>
                {selectedStop !== null && (
                  <span className="text-sm text-slate-400">
                    {Math.round((supportLevel - selectedStop) / PIP_VALUE)} pips
                  </span>
                )}
              </div>

              {selectedStop !== null && riskAnalysis && (
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-slate-400">Hunt Probability</span>
                    <span className={`font-bold ${riskAnalysis.color}`}>
                      {riskAnalysis.label}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
                    <div
                      className={`h-full transition-all duration-500 ${
                        riskAnalysis.percent > 70
                          ? 'bg-red-500'
                          : riskAnalysis.percent > 40
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${riskAnalysis.percent}%` }}
                    />
                  </div>
                  <p className="mt-2 flex items-start text-xs text-slate-500">
                    <Info size={12} className="mr-1 mt-0.5 flex-shrink-0" />
                    {riskAnalysis.percent > 80
                      ? 'Too close to support—prime hunting ground.'
                      : riskAnalysis.percent < 20
                      ? 'Safe but wide stop. Remember to cut position size.'
                      : 'Balanced risk zone. Watch position sizing.'}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={selectedStop === null || isProcessing}
              className={`flex w-full items-center justify-center rounded py-4 text-lg font-bold shadow-lg transition-all ${
                isProcessing
                  ? 'cursor-wait bg-slate-700'
                  : selectedStop === null
                  ? 'cursor-not-allowed bg-slate-700 text-slate-500'
                  : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <TrendingUp size={18} />
                  Market Moving...
                </span>
              ) : (
                'Place Stop & Enter'
              )}
            </button>
            {selectedStop === null && (
              <p className="text-center text-xs text-slate-500">
                Tap a price level below entry to arm your stop.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="md:col-span-7">
        <HeatmapLadder
          levels={levels}
          currentPrice={currentPrice}
          supportLevel={supportLevel}
          mode="survivor"
          userStopPrice={selectedStop}
          onLevelClick={(level) => {
            if (level.price < currentPrice) {
              setSelectedStop(level.price);
            }
          }}
        />
      </div>
    </div>
  );
};
