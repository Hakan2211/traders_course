
import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Crosshair,
  DollarSign,
  TrendingDown,
} from 'lucide-react';
import { calculateHuntEconomics } from '../utils';
import { GameHistoryItem, GameState, PriceLevel } from '../types';
import { HeatmapLadder } from './HeatmapLadder';

interface PredatorModeProps {
  levels: PriceLevel[];
  currentPrice: number;
  supportLevel: number;
  gameState: GameState;
  onHuntComplete: (profit: number, historyItem: GameHistoryItem) => void;
}

export const PredatorMode: React.FC<PredatorModeProps> = ({
  levels,
  currentPrice,
  supportLevel,
  gameState,
  onHuntComplete,
}) => {
  const [hoveredLevel, setHoveredLevel] = useState<PriceLevel | null>(null);
  const [isHunting, setIsHunting] = useState(false);

  const hoveredEconomics = useMemo(() => {
    if (!hoveredLevel || hoveredLevel.price >= currentPrice) return null;
    return calculateHuntEconomics(hoveredLevel.price, currentPrice, levels);
  }, [hoveredLevel, currentPrice, levels]);

  const executeHunt = (targetLevel: PriceLevel) => {
    if (isHunting || targetLevel.price >= currentPrice) return;
    const economics = calculateHuntEconomics(
      targetLevel.price,
      currentPrice,
      levels
    );
    setIsHunting(true);
    setTimeout(() => {
      onHuntComplete(economics.totalProfit, {
        round: gameState.round,
        mode: 'predator',
        result: economics.totalProfit > 0 ? 'win' : 'loss',
        profit: economics.totalProfit,
        description:
          economics.totalProfit > 0
            ? `Hunted down to ${targetLevel.price.toFixed(4)}. Triggered ${
                economics.capturedStops
              } clustered stops.`
            : `Failed raid toward ${targetLevel.price.toFixed(
                4
              )}. Liquidity cost outweighed payout.`,
        targetPrice: targetLevel.price,
      });
      setIsHunting(false);
    }, 1500);
  };

  return (
    <div className="grid h-full grid-cols-1 gap-6 md:grid-cols-12">
      <div className="flex flex-col space-y-4 md:col-span-5">
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-lg">
          <h2 className="mb-4 flex items-center text-xl font-bold text-red-400">
            <Crosshair className="mr-2" /> Market Maker Terminal
          </h2>
          <p className="mb-6 text-sm text-slate-400">
            Scan the ladder for dense retail stops stacked below support. Only
            execute the hunt if the captured liquidity payout beats the cost of
            forcing price lower.
          </p>

          <div className="space-y-4">
            <div className="rounded border border-slate-700 bg-slate-900 p-4">
              <span className="text-xs uppercase tracking-wider text-slate-500">
                Current Capital
              </span>
              <div className="font-mono text-2xl font-bold text-green-400">
                ${gameState.capital.toLocaleString()}
              </div>
            </div>

            <div
              className={`rounded border p-4 transition-all duration-300 ${
                hoveredEconomics
                  ? hoveredEconomics.isProfitable
                    ? 'border-green-700 bg-green-900/20'
                    : 'border-red-700 bg-red-900/20'
                  : 'border-slate-700 bg-slate-800 opacity-60'
              }`}
            >
              <h3 className="mb-3 border-b border-slate-600 pb-2 text-sm font-bold text-slate-300">
                Hunt Analysis{' '}
                {hoveredLevel
                  ? `@ ${hoveredLevel.price.toFixed(4)}`
                  : '(hover ladder)'}
              </h3>

              {hoveredEconomics ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Push Cost</span>
                    <span className="font-mono text-red-400">
                      -${hoveredEconomics.cost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Stops Triggered</span>
                    <span className="font-mono text-blue-300">
                      {hoveredEconomics.capturedStops}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Revenue</span>
                    <span className="font-mono text-green-400">
                      +${hoveredEconomics.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Buyback Discount</span>
                    <span className="font-mono text-emerald-300">
                      +$
                      {Math.floor(
                        hoveredEconomics.revenue * 0.2
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="my-2 flex justify-between border-t border-slate-600 pt-2 text-lg font-bold">
                    <span>Net Profit</span>
                    <span
                      className={
                        hoveredEconomics.isProfitable
                          ? 'text-green-400'
                          : 'text-red-400'
                      }
                    >
                      {hoveredEconomics.totalProfit > 0 ? '+' : ''}
                      {hoveredEconomics.totalProfit.toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-slate-500">
                  Hover over a price below current market to assess the hunt.
                </div>
              )}
            </div>

            <button
              onClick={() => hoveredLevel && executeHunt(hoveredLevel)}
              disabled={!hoveredEconomics || isHunting}
              className={`flex w-full items-center justify-center rounded py-4 text-lg font-bold shadow-lg transition-all ${
                isHunting
                  ? 'cursor-wait bg-slate-700'
                  : !hoveredEconomics
                  ? 'cursor-not-allowed bg-slate-700 text-slate-500'
                  : hoveredEconomics.isProfitable
                  ? 'animate-pulse bg-red-600 text-white hover:bg-red-500'
                  : 'bg-orange-700 text-white hover:bg-orange-600'
              }`}
            >
              {isHunting ? (
                <span className="flex items-center gap-2">
                  <TrendingDown size={18} />
                  Executing Raid...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <DollarSign size={18} />
                  {hoveredEconomics ? 'Execute Hunt' : 'Select Target'}
                </span>
              )}
            </button>
            {hoveredEconomics && !hoveredEconomics.isProfitable && (
              <div className="flex items-center justify-center text-xs text-orange-400">
                <AlertTriangle size={12} className="mr-1" />
                Warning: unprofitable target.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="md:col-span-7">
        <HeatmapLadder
          levels={levels}
          currentPrice={currentPrice}
          supportLevel={supportLevel}
          mode="predator"
          onLevelHover={setHoveredLevel}
          onLevelClick={(level) => {
            if (level.price < currentPrice) {
              executeHunt(level);
            }
          }}
          hoveredPrice={hoveredLevel?.price ?? null}
        />
      </div>
    </div>
  );
};
