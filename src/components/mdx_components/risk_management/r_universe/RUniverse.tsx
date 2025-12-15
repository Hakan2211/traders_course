
import React, { useMemo, useState, useCallback } from 'react';
import { Controls } from './Controls';
import { Tooltip } from './Tooltip';
import { UniverseScene } from './UniverseScene';
import { FilterState, Trade } from './types';
import { calculateStats, generateTrades } from './data';

const initialFilter: FilterState = {
  grades: ['A', 'B', 'C'],
  showOutliers: false,
  minR: null,
  maxR: null,
};

export const RUniverse: React.FC = () => {
  const [trades] = useState<Trade[]>(() => generateTrades(520));
  const [filter, setFilter] = useState<FilterState>(initialFilter);
  const [hoveredTrade, setHoveredTrade] = useState<Trade | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const visibleTrades = useMemo(() => {
    return trades.filter((trade) => {
      if (!filter.grades.includes(trade.grade)) return false;
      if (
        filter.showOutliers &&
        !(trade.rMultiple >= 3 || trade.rMultiple <= -1.5)
      ) {
        return false;
      }
      if (filter.minR !== null && trade.rMultiple < filter.minR) return false;
      if (filter.maxR !== null && trade.rMultiple > filter.maxR) return false;
      return true;
    });
  }, [trades, filter]);

  const visibleTradeIds = useMemo(
    () => new Set(visibleTrades.map((trade) => trade.id)),
    [visibleTrades]
  );
  const stats = useMemo(() => calculateStats(visibleTrades), [visibleTrades]);

  const handleHover = useCallback(
    (trade: Trade | null, x: number, y: number) => {
      setHoveredTrade(trade);
      setTooltipPosition({ x, y });
    },
    []
  );

  return (
    <>
      <div className="w-full rounded-[32px] border border-slate-900 bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden h-[720px] shadow-2xl">
        <UniverseScene
          trades={trades}
          visibleTradeIds={visibleTradeIds}
          onHover={handleHover}
        />

        <div className="pointer-events-none absolute top-6 left-6 max-w-lg space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            Lesson 2.5 • Expectancy Lab
          </p>
          <h3 className="text-3xl font-semibold text-white">
            R-Multiple Universe
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Each column is a trade from a simulated journal. Height encodes the
            final R-multiple, color encodes quality, and the grid lets you scan
            for edge, leaks, and outliers instantly.
          </p>
        </div>

        <div className="pointer-events-none absolute bottom-6 left-6 flex flex-wrap gap-4 text-xs uppercase tracking-wide text-slate-300">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#fbbf24]" />
            +5R Legendary
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#10b981]" />
            +3R Winner
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#22c55e]" />
            +1R Base Hit
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#f87171]" />
            -0.5R Scratch
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
            -1R Controlled
          </span>
        </div>

        <Controls filter={filter} setFilter={setFilter} stats={stats} />
      </div>

      <Tooltip trade={hoveredTrade} position={tooltipPosition} />
    </>
  );
};
