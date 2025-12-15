
import React from 'react';
import { Trade } from './types';

interface TooltipProps {
  trade: Trade | null;
  position: { x: number; y: number };
}

export const Tooltip: React.FC<TooltipProps> = ({ trade, position }) => {
  if (!trade) return null;

  const isWin = trade.rMultiple > 0;
  const borderClass = isWin ? 'border-emerald-400' : 'border-rose-400';
  const valueClass = isWin ? 'text-emerald-300' : 'text-rose-300';

  return (
    <div
      className={`fixed z-[60] pointer-events-none bg-slate-950/95 backdrop-blur-xl border-l-4 rounded-r-xl shadow-2xl p-4 w-64 text-sm text-slate-200 ${borderClass}`}
      style={{
        left: position.x + 24,
        top: position.y - 20,
        transform: 'translateY(-50%)',
      }}
    >
      <div className="flex justify-between items-start mb-2 border-b border-slate-800 pb-2">
        <div>
          <div className="font-bold text-white text-base">
            Trade #{trade.id}
          </div>
          <span className="text-xs text-slate-500">{trade.date}</span>
        </div>
        <div
          className={`px-2 py-0.5 rounded text-xs font-bold bg-slate-900 ${valueClass}`}
        >
          {trade.rMultiple > 0 ? '+' : ''}
          {trade.rMultiple}R
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs uppercase tracking-wide text-slate-500">
          <span>{trade.pair}</span>
          <span>{trade.type}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Grade</span>
          <span className="font-semibold">{trade.grade}-Grade</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs mt-2">
          <div>
            <span className="text-slate-500 block">Entry</span>
            <span className="font-mono text-slate-200">{trade.entry}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Stop</span>
            <span className="font-mono text-slate-200">{trade.stop}</span>
          </div>
          <div>
            <span className="text-slate-500 block">MAE</span>
            <span className="font-mono text-rose-400">-{trade.mae}R</span>
          </div>
          <div>
            <span className="text-slate-500 block">MFE</span>
            <span className="font-mono text-emerald-400">+{trade.mfe}R</span>
          </div>
        </div>
      </div>
    </div>
  );
};
