
import React from 'react';
import { SimulationResult } from './types';

interface MetricsPanelProps {
  result: SimulationResult | null;
  config: { winRate: number; rrRatio: number };
}

// Format large numbers to prevent overflow
const formatLargeNumber = (value: number, decimals: number = 2): string => {
  const absValue = Math.abs(value);

  if (absValue >= 1e12) {
    return `${(value / 1e12).toFixed(decimals)}T`;
  } else if (absValue >= 1e9) {
    return `${(value / 1e9).toFixed(decimals)}B`;
  } else if (absValue >= 1e6) {
    return `${(value / 1e6).toFixed(decimals)}M`;
  } else if (absValue >= 1e3) {
    return `${(value / 1e3).toFixed(decimals)}K`;
  }

  return value.toFixed(decimals);
};

// Format percentage with smart abbreviation
const formatPercentage = (value: number): string => {
  const absValue = Math.abs(value);

  if (absValue >= 1000000) {
    return `${formatLargeNumber(value, 1)}%`;
  } else if (absValue >= 1000) {
    return `${formatLargeNumber(value, 1)}%`;
  } else if (absValue >= 100) {
    return `${value.toFixed(1)}%`;
  }

  return `${value.toFixed(2)}%`;
};

// Get responsive font size class based on number length
const getFontSizeClass = (value: number): string => {
  const absValue = Math.abs(value);
  const str = absValue.toFixed(2);

  if (absValue >= 1e9 || str.length > 12) {
    return 'text-lg';
  } else if (absValue >= 1e6 || str.length > 9) {
    return 'text-xl';
  } else if (absValue >= 1e3 || str.length > 6) {
    return 'text-xl';
  }

  return 'text-2xl';
};

export const MetricsPanel: React.FC<MetricsPanelProps> = ({
  result,
  config,
}) => {
  if (!result) return null;

  const isProfitable = result.netProfitPct > 0;
  const breakevenRate = 1 / (1 + config.rrRatio);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 overflow-hidden">
        <div className="text-slate-500 text-xs uppercase mb-1">Net Profit</div>
        <div
          className={`${getFontSizeClass(
            result.netProfitPct
          )} font-bold font-mono break-words ${
            isProfitable ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {result.netProfitPct > 0 ? '+' : ''}
          {formatPercentage(result.netProfitPct)}
        </div>
        <div
          className="text-xs text-slate-600 mt-1 truncate"
          title={`$${result.finalCapital.toLocaleString()}`}
        >
          ${formatLargeNumber(result.finalCapital, 0)}
        </div>
      </div>

      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 overflow-hidden">
        <div className="text-slate-500 text-xs uppercase mb-1">
          Max Drawdown
        </div>
        <div
          className={`${getFontSizeClass(
            result.maxDrawdownPct
          )} font-bold font-mono text-rose-400 break-words`}
        >
          -{formatPercentage(result.maxDrawdownPct)}
        </div>
        <div className="text-xs text-slate-600 mt-1">Worst peak-to-valley</div>
      </div>

      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 overflow-hidden">
        <div className="text-slate-500 text-xs uppercase mb-1">Expectancy</div>
        <div
          className={`${getFontSizeClass(
            result.expectancy
          )} font-bold font-mono text-blue-400 break-words`}
        >
          {formatLargeNumber(result.expectancy, 2)}R
        </div>
        <div className="text-xs text-slate-600 mt-1">
          BE Win Rate: {(breakevenRate * 100).toFixed(1)}%
        </div>
      </div>

      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 overflow-hidden">
        <div className="text-slate-500 text-xs uppercase mb-1">Psychology</div>
        <div className="text-xl font-bold font-mono text-amber-400 break-words">
          {result.longestLosingStreak} Losses
        </div>
        <div className="text-xs text-slate-600 mt-1">Longest streak in row</div>
      </div>

      <div className="col-span-2 md:col-span-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400 border-t border-slate-800 pt-4 mt-2">
        <span>
          Trades:{' '}
          <strong className="text-slate-200">{result.trades.length}</strong>
        </span>
        <span>
          Wins: <strong className="text-emerald-400">{result.winCount}</strong>{' '}
          ({((result.winCount / result.trades.length) * 100).toFixed(1)}%)
        </span>
        <span>
          Losses: <strong className="text-rose-400">{result.lossCount}</strong>{' '}
          ({((result.lossCount / result.trades.length) * 100).toFixed(1)}%)
        </span>
        <span>
          Profit Factor:{' '}
          <strong className="text-slate-200">
            {result.profitFactor.toFixed(2)}
          </strong>
        </span>
      </div>
    </div>
  );
};
