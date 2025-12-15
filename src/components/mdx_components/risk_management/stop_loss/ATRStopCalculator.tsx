
import React, { useState, useMemo } from 'react';
``;
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Crosshair,
  RefreshCcw,
  Info,
} from 'lucide-react';
import { AssetType, CalculationResult, CalculatorState, Preset } from './types';

const PRESETS: Preset[] = [
  {
    label: 'Forex (Calm)',
    assetType: 'FOREX',
    entry: 1.1,
    atr: 0.003,
    description: 'Typical EUR/USD session',
  },
  {
    label: 'Forex (News)',
    assetType: 'FOREX',
    entry: 1.1,
    atr: 0.012,
    description: 'High impact news event',
  },
  {
    label: 'Crypto (BTC)',
    assetType: 'CRYPTO',
    entry: 65000,
    atr: 1200,
    description: 'Standard Bitcoin volatility',
  },
  {
    label: 'Stock (Tech)',
    assetType: 'STOCK',
    entry: 150.0,
    atr: 3.5,
    description: 'Volatile tech stock',
  },
];

export const ATRStopCalculator: React.FC = () => {
  // --- State ---
  const [inputs, setInputs] = useState<CalculatorState>({
    entryPrice: 1.1,
    atr: 0.006,
    multiplier: 3,
    direction: 'long',
    accountSize: 10000,
    riskPercent: 1.0,
    assetType: 'FOREX',
  });

  // --- Calculations ---
  const results: CalculationResult = useMemo(() => {
    const stopDistanceValue = inputs.atr * inputs.multiplier;

    // Calculate Stop Price
    const stopPrice =
      inputs.direction === 'long'
        ? inputs.entryPrice - stopDistanceValue
        : inputs.entryPrice + stopDistanceValue;

    // Calculate Risk Amount ($)
    const riskAmount = inputs.accountSize * (inputs.riskPercent / 100);

    // Calculate Position Size (Units)
    // Formula: Risk Amount / Distance per Unit
    // Forex: Distance is price diff. Value per pip implies standard lots usually,
    // but here we calculate raw units.
    // Profit/Loss = (Exit - Entry) * Units
    // Risk = |Entry - Stop| * Units
    // Units = Risk / |Entry - Stop|
    let positionSize = 0;
    if (stopDistanceValue > 0) {
      positionSize = riskAmount / stopDistanceValue;
    }

    // Leverage = (Position Size * Entry Price) / Account Size
    const notionalValue = positionSize * inputs.entryPrice;
    const leverage = notionalValue / inputs.accountSize;

    // Volatility Zone Logic (Simplified relative heuristic based on % of price)
    const atrPercent = (inputs.atr / inputs.entryPrice) * 100;
    let volatilityZone: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' = 'MODERATE';

    if (inputs.assetType === 'FOREX') {
      // Forex typically moves 0.5% - 1% a day.
      if (atrPercent < 0.3) volatilityZone = 'LOW';
      else if (atrPercent < 0.6) volatilityZone = 'MODERATE';
      else if (atrPercent < 1.0) volatilityZone = 'HIGH';
      else volatilityZone = 'EXTREME';
    } else if (inputs.assetType === 'CRYPTO') {
      if (atrPercent < 2) volatilityZone = 'LOW';
      else if (atrPercent < 4) volatilityZone = 'MODERATE';
      else if (atrPercent < 7) volatilityZone = 'HIGH';
      else volatilityZone = 'EXTREME';
    } else {
      if (atrPercent < 1) volatilityZone = 'LOW';
      else if (atrPercent < 2.5) volatilityZone = 'MODERATE';
      else if (atrPercent < 4) volatilityZone = 'HIGH';
      else volatilityZone = 'EXTREME';
    }

    // Safe zone check (Multiplier based)
    const isSafe = inputs.multiplier >= 2;

    return {
      stopDistance: stopDistanceValue,
      stopPrice,
      riskAmount,
      positionSize,
      leverage,
      isSafe,
      volatilityZone,
    };
  }, [inputs]);

  // --- Handlers ---
  const loadPreset = (preset: Preset) => {
    setInputs((prev) => ({
      ...prev,
      assetType: preset.assetType,
      entryPrice: preset.entry,
      atr: preset.atr,
      // Reset reasonable defaults
      multiplier: 3,
    }));
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatPrice = (price: number) => {
    if (inputs.assetType === 'FOREX') return price.toFixed(4);
    if (inputs.assetType === 'CRYPTO') return formatNumber(price, 0);
    return formatNumber(price, 2);
  };

  // Helper for displaying distance (Pips vs Points)
  const getDistanceDisplay = (dist: number) => {
    if (inputs.assetType === 'FOREX') {
      return `${(dist * 10000).toFixed(1)} pips`;
    }
    return `${formatNumber(dist, 2)}`;
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/5 my-8">
      {/* --- Top Bar: Title & Global Context --- */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            ATR Stop Calculator
          </h2>
          <p className="text-slate-400 text-xs">
            Based on 14-Period Average True Range
          </p>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => loadPreset(preset)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all border ${
                inputs.assetType === preset.assetType &&
                inputs.atr === preset.atr
                  ? 'bg-cyan-900/30 text-cyan-300 border-cyan-700/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* --- Left Column: Inputs & Controls (7 cols) --- */}
        <div className="lg:col-span-7 p-6 space-y-8 border-r border-slate-800/50">
          {/* Account & Risk Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Account Size
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  $
                </span>
                <input
                  type="number"
                  value={inputs.accountSize}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      accountSize: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 pl-6 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Risk %
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={inputs.riskPercent}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      riskPercent: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Trade Setup Section */}
          <div className="p-5 rounded-xl bg-slate-950/50 border border-slate-800/50 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-cyan-500" />
                Trade Parameters
              </h3>

              {/* Direction Toggle */}
              <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                <button
                  onClick={() => setInputs({ ...inputs, direction: 'long' })}
                  className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
                    inputs.direction === 'long'
                      ? 'bg-emerald-500/10 text-emerald-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <TrendingUp className="w-3 h-3" /> LONG
                </button>
                <button
                  onClick={() => setInputs({ ...inputs, direction: 'short' })}
                  className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
                    inputs.direction === 'short'
                      ? 'bg-rose-500/10 text-rose-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <TrendingDown className="w-3 h-3" /> SHORT
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Entry Price</label>
                <input
                  type="number"
                  step={inputs.assetType === 'FOREX' ? '0.0001' : '0.01'}
                  value={inputs.entryPrice}
                  onChange={(e) =>
                    setInputs({ ...inputs, entryPrice: Number(e.target.value) })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-cyan-500 outline-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 flex items-center justify-between">
                  14-Period ATR
                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      results.volatilityZone === 'LOW'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : results.volatilityZone === 'MODERATE'
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : results.volatilityZone === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {results.volatilityZone} VOL
                  </span>
                </label>
                <input
                  type="number"
                  step={inputs.assetType === 'FOREX' ? '0.0001' : '0.01'}
                  value={inputs.atr}
                  onChange={(e) =>
                    setInputs({ ...inputs, atr: Number(e.target.value) })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-cyan-500 outline-none font-mono"
                />
              </div>
            </div>

            {/* Multiplier Slider */}
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-end">
                <label className="text-xs font-bold text-slate-300 uppercase">
                  ATR Multiplier
                </label>
                <span
                  className={`text-xl font-mono font-bold ${
                    inputs.multiplier < 2
                      ? 'text-rose-400'
                      : inputs.multiplier > 3.5
                      ? 'text-blue-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {inputs.multiplier}x
                </span>
              </div>

              <div className="relative h-2 bg-slate-800 rounded-full">
                <div
                  className={`absolute h-full rounded-full transition-all duration-300 ${
                    inputs.multiplier < 2
                      ? 'bg-rose-500'
                      : inputs.multiplier > 3.5
                      ? 'bg-blue-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${(inputs.multiplier / 5) * 100}%` }}
                />
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={inputs.multiplier}
                  onChange={(e) =>
                    setInputs({ ...inputs, multiplier: Number(e.target.value) })
                  }
                  className="absolute w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 font-mono uppercase">
                <span className="text-rose-500">Tight (1x)</span>
                <span className="text-emerald-500 pl-4">
                  Professional (2-3x)
                </span>
                <span className="text-blue-500">Wide (4-5x)</span>
              </div>

              {!results.isSafe && (
                <div className="flex items-center gap-2 text-rose-400 bg-rose-950/30 px-3 py-2 rounded border border-rose-900/50">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <p className="text-xs">
                    Multiplier below 2x increases risk of stopping out on random
                    noise.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Visualization Bars */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Info className="w-3 h-3" />
              <span>Stop Distance Visualizer</span>
            </div>

            {/* Noise Bar */}
            <div className="relative h-8 w-full bg-slate-900 rounded overflow-hidden flex items-center px-3">
              <div
                className="absolute left-0 top-0 bottom-0 bg-slate-700/30 border-r border-slate-600/50 pattern-diagonal-lines"
                style={{ width: '30%' }} // Fixed reference for '1x ATR' visual
              ></div>
              <span className="relative z-10 text-[10px] text-slate-500 font-mono">
                1x ATR (Market Noise)
              </span>
            </div>

            {/* Stop Distance Bar */}
            <div className="relative h-8 w-full bg-slate-900 rounded overflow-hidden flex items-center px-3">
              <div
                className={`absolute left-0 top-0 bottom-0 transition-all duration-500 border-r ${
                  results.isSafe
                    ? 'bg-emerald-500/20 border-emerald-500/50'
                    : 'bg-rose-500/20 border-rose-500/50'
                }`}
                style={{ width: `${30 * inputs.multiplier}%` }} // Scales relative to the 30% base
              ></div>
              <span
                className={`relative z-10 text-[10px] font-mono ${
                  results.isSafe ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {inputs.multiplier}x ATR (Your Stop)
              </span>
            </div>
          </div>
        </div>

        {/* --- Right Column: Results Display (5 cols) --- */}
        <div className="lg:col-span-5 bg-slate-950 p-6 flex flex-col justify-between border-l border-slate-800/50">
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Calculated Architecture
            </h3>

            {/* Stop Level Display */}
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-xs mb-1">Stop Loss Level</div>
              <div
                className={`text-3xl font-mono font-bold ${
                  inputs.direction === 'long'
                    ? 'text-rose-400'
                    : 'text-emerald-400'
                }`}
              >
                {formatPrice(results.stopPrice)}
              </div>
              <div className="text-xs text-slate-500 mt-1 font-mono">
                {getDistanceDisplay(results.stopDistance)} away
              </div>
            </div>

            {/* Position Size Display */}
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
              <div className="flex justify-between items-start">
                <div className="text-slate-400 text-xs mb-1">
                  Recommended Position Size
                </div>
                <div className="text-xs font-bold bg-slate-800 text-cyan-400 px-2 py-0.5 rounded">
                  RISK: ${formatNumber(results.riskAmount, 0)}
                </div>
              </div>
              <div className="text-3xl font-mono font-bold text-white">
                {formatNumber(results.positionSize, 0)}{' '}
                <span className="text-sm font-normal text-slate-500">
                  units
                </span>
              </div>
              <div
                className={`text-xs mt-1 font-mono flex items-center gap-2 ${
                  results.leverage > 10 ? 'text-rose-400' : 'text-emerald-500'
                }`}
              >
                Effective Leverage: {formatNumber(results.leverage, 1)}x
                {results.leverage > 10 && <AlertTriangle className="w-3 h-3" />}
              </div>
            </div>
          </div>

          {/* Interactive Comparison Mini-Table */}
          <div className="mt-8 space-y-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
              <RefreshCcw className="w-3 h-3" />
              Volatility Impact Scenario
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-900/50 rounded border border-slate-800 opacity-50">
                <div className="text-slate-500 mb-1">Low Vol</div>
                <div className="font-mono text-slate-300">
                  {(results.positionSize * 2).toFixed(0)}
                </div>
              </div>

              <div className="p-2 bg-cyan-900/20 rounded border border-cyan-700/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-cyan-500/5"></div>
                <div className="relative">
                  <div className="text-cyan-400 font-bold mb-1">Current</div>
                  <div className="font-mono text-white font-bold">
                    {formatNumber(results.positionSize, 0)}
                  </div>
                </div>
              </div>

              <div className="p-2 bg-slate-900/50 rounded border border-slate-800 opacity-50">
                <div className="text-slate-500 mb-1">High Vol</div>
                <div className="font-mono text-slate-300">
                  {(results.positionSize * 0.5).toFixed(0)}
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 text-center leading-tight">
              Notice: As volatility rises, position size must decrease to keep
              risk constant at ${formatNumber(results.riskAmount, 0)}.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Decoration */}
      <div className="bg-slate-950 p-3 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-600 font-mono uppercase">
        <span>Stop Loss Architecture v2.3</span>
        <span className="flex items-center gap-1">
          <div
            className={`w-2 h-2 rounded-full ${
              results.isSafe ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          ></div>
          System Status: {results.isSafe ? 'Optimized' : 'High Risk'}
        </span>
      </div>
    </div>
  );
};
