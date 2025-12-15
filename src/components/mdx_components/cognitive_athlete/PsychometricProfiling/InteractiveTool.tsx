
import React, { useState } from 'react';
import { ProfileData, Trait } from './types';
import { INITIAL_USER_PROFILE, STRATEGIES } from './constants';
import { ProfileRadarChart } from './ProfileRadarChart';
import { AnalysisPanel } from './AnalysisPanel';

export const InteractiveTool: React.FC = () => {
  const [userProfile, setUserProfile] =
    useState<ProfileData>(INITIAL_USER_PROFILE);
  const [selectedStrategyId, setSelectedStrategyId] = useState(
    STRATEGIES[1].id
  ); // Default to Swing to show contrast usually

  const selectedStrategy =
    STRATEGIES.find((s) => s.id === selectedStrategyId) || STRATEGIES[0];

  const handleSliderChange = (trait: Trait, value: number) => {
    setUserProfile((prev) => ({
      ...prev,
      [trait]: value,
    }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden my-12">
      {/* Tool Header */}
      <div className="bg-slate-800 p-6 border-b border-slate-700">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded bg-blue-600 text-white text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 10-2 0v2a1 1 0 102 0V9z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          The Profile Radar
        </h2>
        <p className="text-slate-400 mt-1">
          Map your personal hardware (Blue) against your chosen strategy (Gold).
          Overlapping shapes indicate flow; gaps indicate friction.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:divide-x divide-slate-700">
        {/* Left Column: Controls */}
        <div className="lg:col-span-4 p-6 bg-slate-900 space-y-8">
          {/* Strategy Selector */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Select Target Strategy (Layer 2)
            </label>
            <div className="relative">
              <select
                value={selectedStrategyId}
                onChange={(e) => setSelectedStrategyId(e.target.value)}
                className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg py-3 px-4 appearance-none focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
              >
                {STRATEGIES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-slate-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <p className="text-xs text-slate-400 italic">
              {selectedStrategy.description}
            </p>
          </div>

          <hr className="border-slate-800" />

          {/* User Profile Sliders */}
          <div className="space-y-5">
            <div className="flex justify-between items-end">
              <label className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Define Your Hardware (Layer 1)
              </label>
              <button
                onClick={() => setUserProfile(INITIAL_USER_PROFILE)}
                className="text-xs text-slate-500 hover:text-white underline"
              >
                Reset
              </button>
            </div>

            {(Object.keys(userProfile) as Trait[]).map((trait) => (
              <div key={trait} className="group">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-300 group-hover:text-blue-300 transition-colors">
                    {trait}
                  </span>
                  <span className="text-sm font-bold text-blue-500 bg-blue-500/10 px-2 rounded">
                    {userProfile[trait]}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={userProfile[trait]}
                  onChange={(e) =>
                    handleSliderChange(trait, parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Middle/Right: Chart & Analysis */}
        <div className="lg:col-span-8 bg-slate-950 flex flex-col">
          <div className="flex-1 p-6 flex flex-col">
            {/* Chart Area */}
            <div className="flex-grow flex flex-col justify-center min-h-[400px]">
              <ProfileRadarChart
                userProfile={userProfile}
                strategy={selectedStrategy}
              />
            </div>

            {/* Analysis Area */}
            <div className="mt-6">
              <AnalysisPanel
                userProfile={userProfile}
                strategy={selectedStrategy}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
