
import React, { useState } from 'react';
import { Chronotype } from './types';
import { CHRONOTYPES, TIMEZONES } from './constants';
import SunDial from './SunDial';
import { Settings2 } from 'lucide-react';

export const ChronotypeOptimizer: React.FC = () => {
  // Chronotype State
  const [selectedChronotype, setSelectedChronotype] = useState<Chronotype>(
    Chronotype.LION
  );
  const [timezoneOffset, setTimezoneOffset] = useState<number>(
    TIMEZONES[1].offset
  ); // Default to EST

  return (
    <div className="w-full max-w-6xl mx-auto bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden my-12">
      <div className="bg-slate-800 p-6 border-b border-slate-700">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded bg-yellow-500 text-slate-900 text-sm">
            <Settings2 className="w-5 h-5" />
          </span>
          Chronotype Optimizer
        </h2>
        <p className="text-slate-400 mt-1">
          Align your biological clock with market sessions.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:divide-x divide-slate-700">
        {/* Controls Side */}
        <div className="lg:col-span-4 p-6 bg-slate-900 space-y-8">
          <div className="flex items-center gap-2 mb-6 text-yellow-400">
            <Settings2 className="w-5 h-5" />
            <h3 className="text-lg font-bold">Chronotype Settings</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Select Your Chronotype
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(Chronotype).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedChronotype(type)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all ${
                      selectedChronotype === type
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Your Timezone
              </label>
              <select
                value={timezoneOffset}
                onChange={(e) => setTimezoneOffset(Number(e.target.value))}
                className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg py-3 px-4 appearance-none focus:ring-2 focus:ring-yellow-500 focus:outline-none"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.label} value={tz.offset}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3">
            <h4 className="text-white font-semibold">
              {CHRONOTYPES[selectedChronotype].name}
            </h4>
            <p className="text-sm text-slate-400">
              {CHRONOTYPES[selectedChronotype].description}
            </p>
            <div className="pt-2 border-t border-slate-700/50">
              <p className="text-sm font-medium text-yellow-400">Advice:</p>
              <p className="text-sm text-slate-300 italic mt-1">
                "{CHRONOTYPES[selectedChronotype].advice}"
              </p>
            </div>
          </div>
        </div>

        {/* Visualization Side */}
        <div className="lg:col-span-8 bg-slate-950 flex flex-col items-center justify-center p-8 min-h-[500px]">
          <div className="mb-8 text-center space-y-2">
            <h3 className="text-xl font-bold text-white">
              Your Biological Trading Clock
            </h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Green zones are your peak cognitive windows. Colored arcs are
              major market sessions. Align them to find your edge.
            </p>
          </div>
          <SunDial
            chronotype={selectedChronotype}
            timezoneOffset={timezoneOffset}
          />
        </div>
      </div>
    </div>
  );
};
