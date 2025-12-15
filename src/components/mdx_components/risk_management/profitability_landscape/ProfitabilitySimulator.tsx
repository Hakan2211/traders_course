
import React, { useState, useEffect, useMemo } from 'react';
import { runSimulation, runMonteCarlo } from './services/simulator';
import { SimulationConfig, SimulationResult, Preset } from './types';
import { Slider } from './ui/Slider';
import { EquityCanvas } from './EquityCanvas';
import { MetricsPanel } from './MetricsPanel';

const PRESETS: Preset[] = [
  {
    id: 'scalper',
    name: 'The Scalper',
    winRate: 0.6,
    rrRatio: 1.0,
    description:
      'High win rate, low RR. Mentally rewarding but hard to sustain.',
  },
  {
    id: 'daytrader',
    name: 'Day Trader',
    winRate: 0.5,
    rrRatio: 1.5,
    description: 'Balanced approach. The standard for intraday.',
  },
  {
    id: 'swinger',
    name: 'Swing Trader',
    winRate: 0.4,
    rrRatio: 2.5,
    description: 'Lower win rate, bigger winners. Professional sweet spot.',
  },
  {
    id: 'trend',
    name: 'Trend Follower',
    winRate: 0.3,
    rrRatio: 4.0,
    description: 'Hard psychology. Many losses, massive occasional wins.',
  },
];

export const ProfitabilitySimulator: React.FC = () => {
  const [winRate, setWinRate] = useState(0.45);
  const [rrRatio, setRrRatio] = useState(2.0);
  const [mode, setMode] = useState<'single' | 'montecarlo'>('single');
  const [showStreaks, setShowStreaks] = useState(false);

  const [singleResult, setSingleResult] = useState<SimulationResult>(() =>
    runSimulation({
      winRate: 0.45,
      rrRatio: 2.0,
      numTrades: 1000,
      startingCapital: 10000,
      riskPerTradePct: 0.01,
    })
  );
  const [monteCarloResults, setMonteCarloResults] = useState<
    SimulationResult[]
  >([]);

  const config: SimulationConfig = useMemo(
    () => ({
      winRate,
      rrRatio,
      numTrades: 1000,
      startingCapital: 10000,
      riskPerTradePct: 0.01,
    }),
    [winRate, rrRatio]
  );

  useEffect(() => {
    if (mode === 'single') {
      setSingleResult(runSimulation(config));
    } else {
      setMonteCarloResults(runMonteCarlo(config, 50));
    }
  }, [config, mode]);

  const handlePresetClick = (preset: Preset) => {
    setWinRate(preset.winRate);
    setRrRatio(preset.rrRatio);
  };

  const regenerate = () => {
    if (mode === 'single') {
      setSingleResult(runSimulation(config));
    } else {
      setMonteCarloResults(runMonteCarlo(config, 50));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-slate-950 text-slate-200 font-sans rounded-3xl border border-slate-900 shadow-2xl my-12">
      <div className="mb-8 border-b border-slate-800 pb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
          Profitability Spectrum Simulator
        </h2>
        <p className="text-slate-400 max-w-2xl">
          Visualize how <span className="text-blue-400">Win Rate</span> and{' '}
          <span className="text-blue-400">Risk-Reward</span> interact over 1,000
          trades. See why professionals prioritize asymmetry over being
          &ldquo;right&rdquo;.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 shadow-lg">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">
              Simulation Parameters
            </h3>

            <Slider
              label="Win Rate"
              value={winRate}
              min={0.1}
              max={0.9}
              step={0.01}
              onChange={setWinRate}
              formatValue={(v) => `${(v * 100).toFixed(0)}%`}
            />

            <Slider
              label="Risk-Reward Ratio"
              value={rrRatio}
              min={0.5}
              max={10.0}
              step={0.1}
              onChange={setRrRatio}
              formatValue={(v) => `1:${v.toFixed(1)}`}
            />

            <div className="mt-6 pt-6 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Breakeven Win Rate:</span>
                <span className="text-slate-200 font-mono">
                  {(100 / (1 + rrRatio)).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Theoretical Edge:</span>
                <span
                  className={`${
                    winRate * rrRatio - (1 - winRate) > 0
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  } font-mono`}
                >
                  {(winRate * rrRatio - (1 - winRate)).toFixed(2)}R
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Load Archetype
            </h3>
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetClick(preset)}
                className={`w-full text-left p-3 rounded-lg text-sm border transition-all ${
                  winRate === preset.winRate && rrRatio === preset.rrRatio
                    ? 'bg-blue-900/20 border-blue-500 text-blue-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                <div className="flex justify-between">
                  <span className="font-semibold">{preset.name}</span>
                  <span className="font-mono opacity-75">
                    {(preset.winRate * 100).toFixed(0)}% · 1:{preset.rrRatio}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {preset.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
              <button
                onClick={() => setMode('single')}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  mode === 'single'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Single Run
              </button>
              <button
                onClick={() => setMode('montecarlo')}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  mode === 'montecarlo'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Monte Carlo (x50)
              </button>
            </div>

            <div className="flex gap-2">
              {mode === 'single' && (
                <button
                  onClick={() => setShowStreaks((prev) => !prev)}
                  className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                    showStreaks
                      ? 'bg-rose-900/20 border-rose-500/50 text-rose-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {showStreaks ? 'Hide Pain' : 'Show Pain (Losing Streaks)'}
                </button>
              )}
              <button
                onClick={regenerate}
                className="px-3 py-1.5 text-xs font-medium rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Re-Simulate
              </button>
            </div>
          </div>

          <div className="aspect-[2/1] w-full">
            <EquityCanvas
              data={mode === 'single' ? singleResult : monteCarloResults}
              isMonteCarlo={mode === 'montecarlo'}
              highlightStreaks={showStreaks}
              width={800}
              height={400}
            />
          </div>

          {mode === 'single' && (
            <MetricsPanel result={singleResult} config={config} />
          )}

          {mode === 'montecarlo' && monteCarloResults.length > 0 && (
            <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-800 text-sm text-slate-400">
              <p className="mb-2">
                <strong className="text-slate-200">Monte Carlo Insight:</strong>{' '}
                These are 50 different parallel universes with your exact
                strategy settings.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  Highest Result:{' '}
                  <span className="text-emerald-400">
                    +
                    {Math.max(
                      ...monteCarloResults.map((r) => r.netProfitPct)
                    ).toFixed(0)}
                    %
                  </span>
                </li>
                <li>
                  Lowest Result:{' '}
                  <span className="text-rose-400">
                    {(() => {
                      const min = Math.min(
                        ...monteCarloResults.map((r) => r.netProfitPct)
                      );
                      return `${min > 0 ? '+' : ''}${min.toFixed(0)}%`;
                    })()}
                  </span>
                </li>
                <li>
                  Profitable Runs:{' '}
                  <span className="text-blue-400">
                    {monteCarloResults.filter((r) => r.netProfitPct > 0).length}
                    /50
                  </span>
                </li>
              </ul>
            </div>
          )}

          {mode === 'single' && singleResult.longestLosingStreak >= 8 && (
            <div className="mt-6 border-l-4 border-rose-500 bg-rose-500/10 p-4 rounded-r-lg">
              <h4 className="text-rose-400 font-bold text-sm mb-1 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Psychological Danger Zone
              </h4>
              <p className="text-slate-300 text-sm">
                This run hit{' '}
                <strong className="text-white">
                  {singleResult.longestLosingStreak} consecutive losses
                </strong>
                . Statistically normal for this strategy, but psychologically
                devastating. Most traders abandon a profitable system after 5-6
                losses.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfitabilitySimulator;
