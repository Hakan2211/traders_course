
import React, { useState, useEffect } from 'react';
import {
  Brain,
  Users,
  ShieldAlert,
  Monitor,
  Activity,
  Lock,
  PartyPopper,
  Briefcase,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

const HierarchyBuilding: React.FC = () => {
  const [stressLevel, setStressLevel] = useState(10); // 0-100
  const [activeZone, setActiveZone] = useState<
    'neocortex' | 'limbic' | 'reptile'
  >('neocortex');

  useEffect(() => {
    if (stressLevel < 40) setActiveZone('neocortex');
    else if (stressLevel < 75) setActiveZone('limbic');
    else setActiveZone('reptile');
  }, [stressLevel]);

  // Visual helper classes based on state
  const isNeoActive = activeZone === 'neocortex';
  const isLimbicActive = activeZone === 'limbic';
  const isReptileActive = activeZone === 'reptile';

  return (
    <div className="my-12 p-1 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 opacity-30" />

      <div className="p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Building Visualization */}
          <div className="flex-1 relative mx-auto max-w-md w-full">
            {/* Roof */}
            <div className="h-4 w-3/4 mx-auto bg-slate-800 rounded-t-lg border-t border-x border-slate-700 relative -mb-1 z-10">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <div className="flex gap-1">
                  <div
                    className={`w-1 h-8 bg-slate-600 ${
                      isReptileActive ? 'animate-ping bg-red-500' : ''
                    }`}
                  ></div>
                  <div className="w-1 h-6 bg-slate-600"></div>
                </div>
              </div>
            </div>

            {/* Building Container */}
            <div className="border-4 border-slate-700 bg-slate-950 rounded-lg shadow-inner overflow-hidden flex flex-col relative">
              {/* === PENTHOUSE (Neocortex) === */}
              <div
                className={`
                  relative h-40 transition-all duration-700 border-b-4 border-slate-700
                  ${
                    isNeoActive
                      ? 'bg-blue-900/20'
                      : isLimbicActive
                      ? 'bg-slate-900/80 grayscale'
                      : 'bg-slate-950 opacity-30'
                  }
                `}
              >
                {/* Shutters for High Stress */}
                <div
                  className={`absolute inset-0 bg-slate-800 z-20 transition-transform duration-500 flex items-center justify-center border-b-4 border-slate-600 ${
                    isReptileActive ? 'translate-y-0' : '-translate-y-full'
                  }`}
                >
                  <div className="text-slate-500 font-mono text-xs border border-slate-600 p-2 rounded bg-slate-900">
                    <Lock className="w-4 h-4 inline mr-1 mb-1" /> ACCESS DENIED
                  </div>
                </div>

                <div className="absolute top-2 left-2 text-xs font-mono text-slate-400">
                  PENTHOUSE: CEO
                </div>

                {/* Interior Content */}
                <div className="h-full flex flex-col justify-end p-4 relative z-10">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col items-center gap-1">
                      <Monitor
                        className={`w-8 h-8 ${
                          isNeoActive ? 'text-blue-400' : 'text-slate-600'
                        }`}
                      />
                      <div
                        className={`h-1 w-12 rounded ${
                          isNeoActive ? 'bg-blue-500/50' : 'bg-slate-700'
                        }`}
                      ></div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`text-[10px] mb-1 font-mono ${
                          isNeoActive ? 'text-green-400' : 'text-slate-600'
                        }`}
                      >
                        {isNeoActive ? 'ANALYZING...' : 'OFFLINE'}
                      </div>
                      <Brain
                        className={`w-10 h-10 ${
                          isNeoActive ? 'text-blue-300' : 'text-slate-600'
                        }`}
                      />
                      <div
                        className={`h-8 w-1 rounded-full ${
                          isNeoActive ? 'bg-blue-400' : 'bg-slate-700'
                        } mx-auto`}
                      ></div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Briefcase
                        className={`w-8 h-8 ${
                          isNeoActive ? 'text-blue-400' : 'text-slate-600'
                        }`}
                      />
                      <div
                        className={`h-1 w-12 rounded ${
                          isNeoActive ? 'bg-blue-500/50' : 'bg-slate-700'
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Windows Effect */}
                <div
                  className={`absolute inset-0 pointer-events-none bg-[linear-gradient(90deg,transparent_19%,rgba(255,255,255,0.03)_20%,transparent_21%)] bg-[length:20px_100%]`}
                ></div>
              </div>

              {/* === MIDDLE FLOORS (Limbic) === */}
              <div
                className={`
                  relative h-40 transition-all duration-700 border-b-4 border-slate-700
                  ${
                    isLimbicActive
                      ? 'bg-yellow-600/20'
                      : isNeoActive
                      ? 'bg-slate-900/50'
                      : 'bg-slate-900/80 opacity-50'
                  }
                `}
              >
                <div className="absolute top-2 left-2 text-xs font-mono text-slate-400">
                  LEVEL 2: SOCIAL
                </div>

                {/* Interior */}
                <div className="h-full flex items-center justify-center p-4 relative z-10">
                  <div
                    className={`absolute inset-0 flex justify-around items-end pb-2 opacity-30 ${
                      isLimbicActive ? 'text-yellow-500' : 'text-slate-700'
                    }`}
                  >
                    <Users className="w-16 h-16" />
                    <Users className="w-16 h-16" />
                  </div>

                  <div className="relative text-center">
                    {isLimbicActive && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-yellow-900/80 text-yellow-200 text-xs px-2 py-1 rounded border border-yellow-700 animate-bounce">
                        "What will they think?!"
                      </div>
                    )}
                    <PartyPopper
                      className={`w-12 h-12 mx-auto mb-2 ${
                        isLimbicActive
                          ? 'text-yellow-400 animate-pulse'
                          : 'text-slate-600'
                      }`}
                    />
                    <div
                      className={`h-2 w-24 mx-auto rounded-full ${
                        isLimbicActive ? 'bg-yellow-500/30' : 'bg-slate-800'
                      }`}
                    ></div>
                  </div>
                </div>
              </div>

              {/* === BASEMENT (Reptile) === */}
              <div
                className={`
                  relative h-40 transition-all duration-200
                  ${
                    isReptileActive
                      ? 'bg-red-950 shadow-[inset_0_0_50px_rgba(220,38,38,0.3)]'
                      : 'bg-slate-950'
                  }
                `}
              >
                {/* Alarm Light Overlay */}
                {isReptileActive && (
                  <div className="absolute inset-0 bg-red-500/10 animate-pulse z-0"></div>
                )}

                <div className="absolute top-2 left-2 text-xs font-mono text-slate-500">
                  BASEMENT: SURVIVAL
                </div>

                {/* Pipes / Industrial texture */}
                <div className="absolute top-4 right-0 w-full h-4 border-t-2 border-slate-800 border-dashed opacity-30"></div>
                <div className="absolute bottom-8 left-0 w-full h-4 border-b-2 border-slate-800 border-dashed opacity-30"></div>

                <div className="h-full flex items-center justify-center p-4 relative z-10">
                  <div className="flex gap-8 items-center">
                    <div className="flex flex-col items-center">
                      <ShieldAlert
                        className={`w-14 h-14 ${
                          isReptileActive
                            ? 'text-red-500 animate-[bounce_0.2s_infinite]'
                            : 'text-slate-700'
                        }`}
                      />
                      <span
                        className={`text-[10px] font-bold mt-1 ${
                          isReptileActive ? 'text-red-500' : 'text-slate-700'
                        }`}
                      >
                        DEFENSE
                      </span>
                    </div>

                    {/* Monitor Screen in Basement */}
                    <div
                      className={`w-24 h-16 rounded border-2 ${
                        isReptileActive
                          ? 'border-red-600 bg-red-950'
                          : 'border-slate-800 bg-black'
                      } flex items-center justify-center overflow-hidden relative`}
                    >
                      {isReptileActive ? (
                        <div className="text-red-500 font-black text-xl animate-pulse tracking-tighter">
                          DANGER
                        </div>
                      ) : (
                        <div className="w-full h-[1px] bg-green-900/50 animate-pulse"></div>
                      )}
                      {/* Grid lines */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0)_1px,transparent_1px)] bg-[size:4px_4px] opacity-20"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ground */}
            <div className="h-2 w-full bg-slate-800 mt-0 rounded-b-lg mx-auto"></div>
          </div>

          {/* Controls & Legend */}
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-200">Stress Level Input</h3>
                <span
                  className={`font-mono text-sm px-2 py-1 rounded ${
                    isNeoActive
                      ? 'bg-blue-900 text-blue-300'
                      : isLimbicActive
                      ? 'bg-yellow-900 text-yellow-300'
                      : 'bg-red-900 text-red-300'
                  }`}
                >
                  {stressLevel}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={stressLevel}
                onChange={(e) => setStressLevel(parseInt(e.target.value))}
                className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />

              <div className="flex justify-between mt-2 text-xs text-slate-500 font-mono">
                <span>CALM</span>
                <span>ANXIOUS</span>
                <span>PANIC</span>
              </div>
            </div>

            <div className="space-y-4">
              <div
                className={`p-4 rounded-lg border transition-all duration-300 ${
                  isNeoActive
                    ? 'bg-blue-900/20 border-blue-500'
                    : 'bg-slate-900 border-slate-800 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Activity
                    className={isNeoActive ? 'text-blue-400' : 'text-slate-600'}
                  />
                  <div>
                    <h4
                      className={`font-bold ${
                        isNeoActive ? 'text-blue-300' : 'text-slate-500'
                      }`}
                    >
                      Neocortex (CEO)
                    </h4>
                    <p className="text-sm text-slate-400">
                      Logic, Strategy, Planning. Active when calm.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 rounded-lg border transition-all duration-300 ${
                  isLimbicActive
                    ? 'bg-yellow-900/20 border-yellow-500'
                    : 'bg-slate-900 border-slate-800 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users
                    className={
                      isLimbicActive ? 'text-yellow-400' : 'text-slate-600'
                    }
                  />
                  <div>
                    <h4
                      className={`font-bold ${
                        isLimbicActive ? 'text-yellow-300' : 'text-slate-500'
                      }`}
                    >
                      Limbic (Social)
                    </h4>
                    <p className="text-sm text-slate-400">
                      Emotion, Status, FOMO. Takes over with moderate stress.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 rounded-lg border transition-all duration-300 ${
                  isReptileActive
                    ? 'bg-red-900/20 border-red-500'
                    : 'bg-slate-900 border-slate-800 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert
                    className={
                      isReptileActive ? 'text-red-500' : 'text-slate-600'
                    }
                  />
                  <div>
                    <h4
                      className={`font-bold ${
                        isReptileActive ? 'text-red-400' : 'text-slate-500'
                      }`}
                    >
                      Reptilian (Survival)
                    </h4>
                    <p className="text-sm text-slate-400">
                      Fight, Flight, Freeze. Hijacks system under high stress.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500 italic">
          "The hierarchy inverts under threat. The basement takes over the
          building."
        </div>
      </div>
    </div>
  );
};

export default HierarchyBuilding;
