
import React from 'react';
import { Trade } from './types';

interface ScatterTooltipProps {
  active?: boolean;
  payload?: any[];
}

export const ScatterTooltip: React.FC<ScatterTooltipProps> = ({
  active,
  payload,
}) => {
  if (active && payload && payload.length) {
    // The data is nested in payload[0].payload for Scatter charts in Recharts
    const data = payload[0].payload as Trade;
    const missedR = data.mfe - data.rMultiple;
    const leftOnTable = missedR > 0.5 && data.rMultiple > 0;

    return (
      <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg shadow-xl max-w-xs z-50 relative">
        <div className="flex justify-between items-center mb-2 border-b border-slate-700 pb-2">
          <span className="font-bold text-slate-200">{data.id}</span>
          <span
            className={`text-xs font-mono px-2 py-1 rounded ${
              data.rMultiple > 0
                ? 'bg-green-900/50 text-green-400'
                : 'bg-red-900/50 text-red-400'
            }`}
          >
            {data.rMultiple > 0 ? '+' : ''}
            {data.rMultiple}R
          </span>
        </div>

        <div className="space-y-1 text-sm text-slate-400">
          <div className="flex justify-between">
            <span>Pair:</span>
            <span className="text-slate-200">
              {data.pair} ({data.direction})
            </span>
          </div>
          <div className="flex justify-between">
            <span>Grade:</span>
            <span className="text-yellow-400 font-bold">{data.grade}</span>
          </div>
          <div className="flex justify-between">
            <span>MAE:</span>
            <span className="text-red-300">-{data.mae}R</span>
          </div>
          <div className="flex justify-between">
            <span>MFE:</span>
            <span className="text-green-300">+{data.mfe}R</span>
          </div>
        </div>

        {leftOnTable && (
          <div className="mt-3 bg-yellow-900/30 border border-yellow-700/50 p-2 rounded text-xs text-yellow-200">
            ⚠️ Exited at {data.rMultiple}R but price reached {data.mfe}R.
            <br />
            Left <strong>{missedR.toFixed(2)}R</strong> on the table.
          </div>
        )}
      </div>
    );
  }

  return null;
};
