
import React, { useState, useEffect } from 'react';
import { FlaskConical, Play, Zap, Brain } from 'lucide-react';
import { FlowState, MixerConfig } from './types';

const FlowCocktailMixer: React.FC = () => {
  const [activeState, setActiveState] = useState<FlowState>('boredom');

  // Chemical Definitions
  const chemicalNames = [
    'Dopamine',
    'Norepinephrine',
    'Endorphins',
    'Anandamide',
    'Serotonin',
  ];

  // Configuration for each state
  const configs: Record<FlowState, MixerConfig> = {
    boredom: {
      chemicals: [
        { name: 'Dopamine', level: 10, color: 'bg-slate-300' },
        { name: 'Norepinephrine', level: 15, color: 'bg-slate-300' },
        { name: 'Endorphins', level: 5, color: 'bg-slate-300' },
        { name: 'Anandamide', level: 5, color: 'bg-slate-300' },
        { name: 'Serotonin', level: 20, color: 'bg-slate-300' },
      ],
      glow: false,
      description:
        'Low arousal. The brain is disengaged. Chemicals are stagnant.',
    },
    anxiety: {
      chemicals: [
        { name: 'Dopamine', level: 30, color: 'bg-slate-400' },
        { name: 'Norepinephrine', level: 95, color: 'bg-red-500' },
        { name: 'Endorphins', level: 10, color: 'bg-slate-400' },
        { name: 'Anandamide', level: 5, color: 'bg-slate-400' },
        { name: 'Serotonin', level: 10, color: 'bg-slate-400' },
      ],
      glow: false,
      description:
        'Stress overload. Norepinephrine spikes (fight-or-flight). Focus is scattered by threat response.',
    },
    flow: {
      chemicals: [
        { name: 'Dopamine', level: 85, color: 'bg-amber-400' },
        { name: 'Norepinephrine', level: 75, color: 'bg-amber-400' },
        { name: 'Endorphins', level: 80, color: 'bg-amber-400' },
        { name: 'Anandamide', level: 85, color: 'bg-amber-400' },
        { name: 'Serotonin', level: 80, color: 'bg-amber-400' },
      ],
      glow: true,
      description:
        'The Golden Ratio. High arousal + high control. A perfect chemical symphony.',
    },
  };

  const currentConfig = configs[activeState];

  return (
    <div className="w-full max-w-4xl mx-auto my-12 bg-slate-900 text-white rounded-xl overflow-hidden shadow-2xl border border-slate-700">
      {/* Header */}
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FlaskConical className="w-6 h-6 text-amber-400" />
          <h3 className="text-lg font-bold">The Flow Cocktail Mixer</h3>
        </div>
        <div className="text-xs text-slate-400 font-mono hidden sm:block">
          NEUROCHEMICAL_SIMULATION_V1.0
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Visualization Area */}
        <div className="relative h-64 md:h-80 w-full bg-slate-950 rounded-lg border border-slate-800 flex items-end justify-around px-2 pb-2 md:px-8 md:pb-8 mb-8 overflow-hidden">
          {/* Background Lines */}
          <div className="absolute inset-0 pointer-events-none opacity-20 flex flex-col justify-between py-8 px-4">
            <div className="w-full h-px bg-slate-500 border-t border-dashed"></div>
            <div className="w-full h-px bg-slate-500 border-t border-dashed"></div>
            <div className="w-full h-px bg-amber-500 border-t-2 border-dashed relative">
              <span className="absolute -top-3 right-0 text-[10px] text-amber-500 font-bold uppercase tracking-widest">
                Flow Threshold
              </span>
            </div>
            <div className="w-full h-px bg-slate-500 border-t border-dashed"></div>
          </div>

          {/* Test Tubes */}
          {currentConfig.chemicals.map((chem, idx) => (
            <div
              key={chem.name}
              className="flex flex-col items-center gap-2 group relative z-10 h-full justify-end w-1/6"
            >
              {/* The Liquid Bar */}
              <div className="w-full max-w-[40px] md:max-w-[60px] h-full bg-slate-800/50 rounded-full relative overflow-hidden border border-slate-700 backdrop-blur-sm">
                <div
                  className={`absolute bottom-0 w-full transition-all duration-1000 ease-in-out rounded-b-full ${
                    chem.color
                  } ${
                    currentConfig.glow
                      ? 'shadow-[0_0_20px_rgba(251,191,36,0.6)] brightness-110'
                      : ''
                  }`}
                  style={{ height: `${chem.level}%` }}
                >
                  {/* Bubbles effect for Flow state */}
                  {currentConfig.glow && (
                    <div className="absolute inset-0 w-full h-full opacity-50">
                      <div className="animate-pulse absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full"></div>
                      <div className="animate-bounce absolute top-1/2 right-1/4 w-2 h-2 bg-white rounded-full delay-100"></div>
                      <div className="animate-ping absolute top-3/4 left-1/2 w-1 h-1 bg-white rounded-full delay-300"></div>
                    </div>
                  )}
                </div>
              </div>
              {/* Label */}
              <span className="text-[10px] md:text-xs text-slate-400 font-medium text-center h-8 leading-tight flex items-center justify-center">
                {chem.name}
              </span>
              {/* Tooltip Value */}
              <div className="absolute -top-8 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-600">
                {chem.level}%
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex gap-2 p-1 bg-slate-800 rounded-lg border border-slate-700">
            <button
              onClick={() => setActiveState('boredom')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${
                activeState === 'boredom'
                  ? 'bg-slate-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Brain className="w-4 h-4" /> Boredom
            </button>
            <button
              onClick={() => setActiveState('anxiety')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${
                activeState === 'anxiety'
                  ? 'bg-red-900/50 text-red-200 border border-red-800 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Zap className="w-4 h-4" /> Anxiety
            </button>
            <button
              onClick={() => setActiveState('flow')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${
                activeState === 'flow'
                  ? 'bg-amber-500 text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Play className="w-4 h-4 fill-current" /> Flow State
            </button>
          </div>

          <div className="flex-1 bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 min-h-[80px] flex items-center">
            <p
              className={`text-sm ${
                activeState === 'anxiety'
                  ? 'text-red-300'
                  : activeState === 'flow'
                  ? 'text-amber-200'
                  : 'text-slate-300'
              }`}
            >
              <span className="font-bold uppercase tracking-wider text-xs block mb-1 opacity-70">
                Analysis:
              </span>
              {currentConfig.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowCocktailMixer;
