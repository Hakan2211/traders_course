
import React from 'react';
import { MarketState, Regime } from './types';

interface ControlPanelProps {
  state: MarketState;
  onUpdate: (newState: Partial<MarketState>) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ state, onUpdate }) => {
  const getRegimeColor = (r: Regime) => {
    switch (r) {
      case Regime.CALM:
        return 'text-sky-500';
      case Regime.NORMAL:
        return 'text-green-500';
      case Regime.VOLATILE:
        return 'text-orange-500';
      case Regime.CRISIS:
        return 'text-red-600 font-bold animate-pulse';
    }
  };

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const scenario = e.target.value;
    let updates: Partial<MarketState> = { scenarioName: scenario };

    switch (scenario) {
      case 'Summer 2017':
        updates = {
          ...updates,
          atrMultiplier: 0.6,
          vix: 9,
          regime: Regime.CALM,
        };
        break;
      case 'Standard Market':
        updates = {
          ...updates,
          atrMultiplier: 1.0,
          vix: 18,
          regime: Regime.NORMAL,
        };
        break;
      case 'Oct 2018 Correction':
        updates = {
          ...updates,
          atrMultiplier: 1.8,
          vix: 28,
          regime: Regime.VOLATILE,
        };
        break;
      case 'COVID Crash 2020':
        updates = {
          ...updates,
          atrMultiplier: 4.5,
          vix: 82,
          regime: Regime.CRISIS,
        };
        break;
      case '2008 Financial Crisis':
        updates = {
          ...updates,
          atrMultiplier: 5.0,
          vix: 89,
          regime: Regime.CRISIS,
        };
        break;
      default:
        break;
    }
    onUpdate(updates);
  };

  const updateFromSliders = (key: 'atrMultiplier' | 'vix', value: number) => {
    const newState = { ...state, [key]: value, scenarioName: 'Custom' };

    // Determine regime based on new values (Hybrid logic)
    // Simple logic based on lesson thresholds
    let newRegime: Regime = Regime.NORMAL;
    const atr = newState.atrMultiplier;
    const vix = newState.vix;

    if (atr < 0.7 && vix < 15) newRegime = Regime.CALM;
    else if (atr > 2.0 || vix > 40) newRegime = Regime.CRISIS;
    else if (atr > 1.3 || vix > 25) newRegime = Regime.VOLATILE;

    onUpdate({ ...newState, regime: newRegime });
  };

  return (
    <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-2xl w-64 text-white z-10">
      <h2 className="text-base font-bold mb-3 flex items-center gap-2">
        <span className="text-lg">⚡</span> Storm Control
      </h2>

      {/* Scenario Selector */}
      <div className="mb-4">
        <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1.5">
          Historical Event
        </label>
        <select
          value={state.scenarioName}
          onChange={handleScenarioChange}
          className="w-full bg-slate-800 border border-slate-600 rounded-md p-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="Summer 2017">Summer 2017 (Calm)</option>
          <option value="Standard Market">Standard Market (Normal)</option>
          <option value="Oct 2018 Correction">Oct 2018 (Volatile)</option>
          <option value="COVID Crash 2020">COVID Crash (Crisis)</option>
          <option value="2008 Financial Crisis">2008 Crisis (Extreme)</option>
          <option value="Custom">Custom Manual Control</option>
        </select>
      </div>

      {/* Sliders */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-medium">ATR Multiplier</label>
            <span className="text-xs font-mono text-blue-400">
              {state.atrMultiplier.toFixed(1)}x
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="5.0"
            step="0.1"
            value={state.atrMultiplier}
            onChange={(e) =>
              updateFromSliders('atrMultiplier', parseFloat(e.target.value))
            }
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Low (0.5x)</span>
            <span>Extreme (5x)</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-medium">VIX Index</label>
            <span className="text-xs font-mono text-purple-400">
              {state.vix.toFixed(0)}
            </span>
          </div>
          <input
            type="range"
            min="9"
            max="90"
            step="1"
            value={state.vix}
            onChange={(e) =>
              updateFromSliders('vix', parseFloat(e.target.value))
            }
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Calm (9)</span>
            <span>Panic (90)</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-700">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Current Regime</span>
          <span
            className={`text-sm font-black tracking-wider ${getRegimeColor(
              state.regime
            )}`}
          >
            {state.regime}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
