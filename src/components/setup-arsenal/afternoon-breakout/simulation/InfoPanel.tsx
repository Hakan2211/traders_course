import React from 'react';
import { SimulationMode } from './types';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Zap,
  BatteryLow,
} from 'lucide-react';

interface InfoPanelProps {
  mode: SimulationMode;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ mode }) => {
  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
      {/* Description Card */}
      <div
        className={`p-6 rounded-xl border ${
          mode === 'breakout'
            ? 'bg-blue-900/10 border-blue-800'
            : 'bg-red-900/10 border-red-800'
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`p-2 rounded-lg ${
              mode === 'breakout'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {mode === 'breakout' ? (
              <TrendingUp size={24} />
            ) : (
              <TrendingDown size={24} />
            )}
          </div>
          <h3 className="text-lg font-bold text-white">
            {mode === 'breakout'
              ? 'Scenario A: The Pressure Cooker'
              : 'Scenario B: The Deflating Balloon'}
          </h3>
        </div>
        <p className="text-slate-300 leading-relaxed mb-4">
          {mode === 'breakout'
            ? "This visualizes the 'Box State' during a consolidation. Buyers are holding the floor (VWAP), while the range tightens. Notice how the particles (price action) get hotter and faster as the space compresses. This represents volume and volatility building before the inevitable release."
            : 'This visualizes the exhaustion of a fade. The particles start with high energy (the morning pop), but gravity (selling pressure) weighs them down. Each bounce off the floor is weaker (coefficient of restitution < 1). Eventually, the floor can no longer hold the dead weight.'}
        </p>
        <div className="flex items-center gap-2 text-sm font-mono text-slate-400">
          {mode === 'breakout' ? (
            <Zap size={14} className="text-yellow-400" />
          ) : (
            <BatteryLow size={14} className="text-red-400" />
          )}
          <span>
            {mode === 'breakout'
              ? 'Physics: Increasing Kinetic Energy'
              : 'Physics: Damping / Entropy Loss'}
          </span>
        </div>
      </div>

      {/* Key Stats / Indicators */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col justify-center">
        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
          What to watch for
        </h4>

        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <span
              className={`mt-1 w-1.5 h-1.5 rounded-full ${
                mode === 'breakout' ? 'bg-blue-400' : 'bg-red-400'
              }`}
            />
            <div>
              <span className="block text-slate-200 font-medium">
                {mode === 'breakout' ? 'The Compression' : 'The Bouncing Ball'}
              </span>
              <span className="text-slate-400 text-sm">
                {mode === 'breakout'
                  ? 'Ceiling lowers while floor holds. This wedge pattern forces a decision.'
                  : 'Each bounce is lower than the last. Energy is leaving the system.'}
              </span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span
              className={`mt-1 w-1.5 h-1.5 rounded-full ${
                mode === 'breakout' ? 'bg-yellow-400' : 'bg-orange-400'
              }`}
            />
            <div>
              <span className="block text-slate-200 font-medium">
                {mode === 'breakout' ? 'The Breakout Point' : 'The Floor Break'}
              </span>
              <span className="text-slate-400 text-sm">
                {mode === 'breakout'
                  ? 'When the particle hits the critical pressure point, the ceiling vanishes (Stop losses triggered).'
                  : 'When momentum hits zero, the floor gives way (Support buyers capitulate).'}
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default InfoPanel;
