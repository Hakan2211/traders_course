
import React from 'react';
import {
  Shield,
  AlertTriangle,
  Activity,
  Zap,
  Info,
  RotateCcw,
} from 'lucide-react';
import { Position, Correlation } from './types';
import { SCENARIOS, calculatePortfolioStats as calcStats } from './data';

interface UIProps {
  positions: Position[];
  correlations: Correlation[];
  crisisMode: boolean;
  setCrisisMode: (v: boolean) => void;
  loadScenario: (id: string) => void;
  currentScenarioId: string;
}

export const UI: React.FC<UIProps> = ({
  positions,
  correlations,
  crisisMode,
  setCrisisMode,
  loadScenario,
  currentScenarioId,
}) => {
  const stats = calcStats(positions, correlations);

  const heatColor =
    stats.totalHeat > 10
      ? 'text-red-500'
      : stats.totalHeat > 6
      ? 'text-yellow-500'
      : 'text-green-500';
  const corrColor =
    stats.maxCorrelation > 0.7
      ? 'text-red-500'
      : stats.maxCorrelation > 0.4
      ? 'text-yellow-500'
      : 'text-green-500';

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 z-10">
      {/* Header / Stats Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 pointer-events-auto">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-lg p-4 w-full md:w-80 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-blue-400" />
            <h1 className="text-lg font-bold font-mono tracking-wider text-slate-100 uppercase">
              Fortress Command
            </h1>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-700/50">
              <span className="text-sm text-slate-400">Portfolio Heat</span>
              <div className="text-right">
                <span className={`text-xl font-bold font-mono ${heatColor}`}>
                  {stats.totalHeat.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-500 block">Max 8-10%</span>
              </div>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-700/50">
              <span className="text-sm text-slate-400">Max Correlation</span>
              <div className="text-right">
                <span className={`text-xl font-bold font-mono ${corrColor}`}>
                  {stats.maxCorrelation.toFixed(2)}
                </span>
                <span className="text-xs text-slate-500 block">
                  Target &lt; 0.4
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Positions</span>
              <span className="font-mono font-bold text-slate-200">
                {positions.length}
              </span>
            </div>
          </div>
        </div>

        {/* Warning Banner (Conditional) */}
        {(stats.totalHeat > 10 || stats.maxCorrelation > 0.8 || crisisMode) && (
          <div
            className={`
            px-6 py-3 rounded-lg border flex items-center gap-3 shadow-lg animate-pulse
            ${
              crisisMode
                ? 'bg-red-950/80 border-red-600 text-red-200'
                : 'bg-yellow-950/80 border-yellow-600 text-yellow-200'
            }
          `}
          >
            <AlertTriangle className="w-6 h-6" />
            <div>
              <p className="font-bold uppercase tracking-widest">
                {crisisMode
                  ? 'CRITICAL FAILURE IMMINENT'
                  : 'FORTRESS BREACH WARNING'}
              </p>
              <p className="text-xs opacity-80">
                {crisisMode
                  ? 'CORRELATION SPIKE DETECTED. ALL ASSETS FAILING.'
                  : stats.totalHeat > 10
                  ? 'PORTFOLIO HEAT EXCEEDS SAFETY LIMITS.'
                  : 'HIGH CONCENTRATION RISK DETECTED.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Controls */}
      <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-4 pointer-events-auto">
        {/* Scenarios */}
        <div className="flex flex-wrap gap-2">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => loadScenario(s.id)}
              className={`
                px-4 py-2 rounded border text-sm font-medium transition-all
                ${
                  currentScenarioId === s.id
                    ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]'
                    : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                }
              `}
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-md p-2 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2 px-2 border-r border-slate-700">
            <Info className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-400 hidden sm:block">
              Drag to Rotate • Scroll to Zoom
            </span>
          </div>

          <button
            onClick={() => setCrisisMode(!crisisMode)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded font-bold text-sm transition-all
              ${
                crisisMode
                  ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.6)] animate-pulse'
                  : 'bg-slate-800 text-slate-300 hover:bg-red-900/50 hover:text-red-200'
              }
            `}
          >
            <Zap className={`w-4 h-4 ${crisisMode ? 'fill-white' : ''}`} />
            {crisisMode ? 'CRISIS ACTIVE' : 'SIMULATE CRASH'}
          </button>
        </div>
      </div>
    </div>
  );
};
