import React from 'react';
import { Target, ShieldCheck, Skull } from 'lucide-react';
import { PriceLevel } from '../types';
import { formatPrice } from '../utils';

interface HeatmapLadderProps {
  levels: PriceLevel[];
  currentPrice: number;
  supportLevel: number;
  mode: 'predator' | 'survivor';
  onLevelHover?: (level: PriceLevel) => void;
  onLevelClick?: (level: PriceLevel) => void;
  userStopPrice?: number | null;
  hoveredPrice?: number | null;
}

export const HeatmapLadder: React.FC<HeatmapLadderProps> = ({
  levels,
  currentPrice,
  supportLevel,
  mode,
  onLevelHover,
  onLevelClick,
  userStopPrice,
  hoveredPrice,
}) => {
  const maxVol = Math.max(...levels.map((level) => level.stopCount));

  return (
    <div className="flex h-[500px] w-full flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-2xl">
      <div className="flex justify-between border-b border-slate-700 bg-slate-800 p-2 text-xs font-bold uppercase tracking-wider text-slate-400">
        <span className="w-20">Price</span>
        <span className="flex-1 pr-4 text-right">Stop Volume</span>
        <span className="w-8" />
      </div>

      <div className="dom-scroll relative flex-1 overflow-y-auto">
        {levels.map((level) => {
          const isCurrent = Math.abs(level.price - currentPrice) < 1e-5;
          const isSupport = Math.abs(level.price - supportLevel) < 1e-5;
          const isUserStop =
            userStopPrice !== null &&
            userStopPrice !== undefined &&
            Math.abs(level.price - userStopPrice) < 1e-5;
          const isHovered =
            hoveredPrice !== null &&
            hoveredPrice !== undefined &&
            Math.abs(level.price - hoveredPrice) < 1e-5;

          const widthPercent = maxVol
            ? Math.min(100, (level.stopCount / maxVol) * 100)
            : 0;

          let barColor = 'bg-blue-900/30';
          if (level.stopCount > 150) barColor = 'bg-red-900/50';
          else if (level.stopCount > 50) barColor = 'bg-orange-900/40';

          return (
            <div
              key={level.price}
              className={`group relative flex h-8 cursor-pointer items-center border-b border-slate-800/50 text-sm transition-colors ${
                isHovered ? 'bg-slate-700' : ''
              } ${isCurrent ? 'bg-blue-900/20' : ''} ${
                isUserStop ? 'border border-purple-500 bg-purple-900/40' : ''
              }`}
              onMouseEnter={() => onLevelHover && onLevelHover(level)}
              onClick={() => onLevelClick && onLevelClick(level)}
            >
              <div
                className={`absolute right-0 top-0 bottom-0 transition-all duration-500 ${barColor}`}
                style={{ width: `${widthPercent}%` }}
              />

              <div
                className={`relative z-10 w-20 pl-2 font-mono ${
                  isSupport ? 'font-bold text-yellow-400' : 'text-slate-300'
                } ${isCurrent ? 'font-bold text-blue-400' : ''}`}
              >
                {formatPrice(level.price)}
              </div>

              <div className="relative z-10 flex flex-1 items-center justify-end space-x-2 pr-4">
                {isSupport && (
                  <span className="text-[10px] font-bold uppercase tracking-tight text-yellow-500">
                    Support
                  </span>
                )}
                {isCurrent && (
                  <span className="text-[10px] font-bold uppercase tracking-tight text-blue-400">
                    Current
                  </span>
                )}
                {mode === 'predator' && level.stopCount > 0 && (
                  <span className="font-mono text-xs text-slate-400">
                    {level.stopCount}
                  </span>
                )}
                {mode === 'survivor' && isUserStop && (
                  <span className="flex items-center gap-1 font-bold text-purple-300">
                    <ShieldCheck size={14} /> Your Stop
                  </span>
                )}
              </div>

              <div className="relative z-10 flex w-8 items-center justify-center">
                {level.isHunted && <Skull size={14} className="text-red-500" />}
                {mode === 'predator' && level.price < currentPrice && (
                  <Target
                    size={14}
                    className={`text-red-500 transition-opacity ${
                      isHovered
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    }`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
