import React from 'react';
import { BrainRegion, BrainStatus } from './types';

interface BrainVisualProps {
  region: BrainRegion;
  status: BrainStatus;
}

const BrainVisual: React.FC<BrainVisualProps> = ({ region, status }) => {
  // Determine colors based on status
  const getFillColor = (targetRegion: BrainRegion) => {
    if (region !== targetRegion && region !== 'None')
      return 'fill-slate-700 opacity-30';
    if (region === 'None') return 'fill-slate-700';

    if (region === 'PFC') {
      if (status === 'Offline') return 'fill-slate-800';
      if (status === 'Recovering') return 'fill-blue-400 animate-pulse';
      return 'fill-blue-500';
    }
    if (region === 'Amygdala') {
      if (status === 'Hijacked') return 'fill-red-600 animate-pulse';
      return 'fill-red-500';
    }
    if (region === 'Hippocampus') {
      return 'fill-purple-500';
    }
    return 'fill-slate-700';
  };

  const glowClass =
    status === 'Hijacked'
      ? 'drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]'
      : status === 'Recovering'
      ? 'drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]'
      : '';

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center transition-all duration-500 ${glowClass}`}
    >
      <svg viewBox="0 0 200 150" className="w-48 h-48 md:w-64 md:h-64">
        {/* Brain Silhouette Outline */}
        <path
          d="M60,130 C40,130 20,110 20,80 C20,40 50,10 100,10 C150,10 180,40 180,80 C180,110 160,130 140,130 L60,130 Z"
          className="fill-slate-800/50 stroke-slate-600 stroke-2"
        />

        {/* Prefrontal Cortex (Frontal Lobe - Left side in this side profile view assumption, usually PFC is front) 
            Let's assume looking from Right Side: Front is Right.
            Actually, let's keep it abstract. 
            Front/Right = PFC. 
            Bottom/Center = Amygdala.
        */}

        {/* Cortex / General Brain Mass */}
        <path
          d="M30,80 C30,45 60,20 100,20 C140,20 170,45 170,80 C170,110 140,120 100,120 C60,120 30,110 30,80"
          className="fill-slate-800"
        />

        {/* PFC Area (Front/Top Right) */}
        <path
          d="M120,25 C150,30 165,50 168,75 L130,75 L120,25 Z"
          className={`transition-colors duration-500 ${
            region === 'PFC' ? getFillColor('PFC') : 'fill-slate-700/50'
          }`}
        />

        {/* Hippocampus/Memory (Center Back) */}
        <path
          d="M50,70 C50,50 70,40 90,40 L90,80 L50,80 Z"
          className={`transition-colors duration-500 ${
            region === 'Hippocampus'
              ? getFillColor('Hippocampus')
              : 'fill-slate-700/50'
          }`}
        />

        {/* Amygdala (Deep Center/Low) */}
        <circle
          cx="100"
          cy="90"
          r="12"
          className={`transition-colors duration-300 ${
            region === 'Amygdala'
              ? getFillColor('Amygdala')
              : 'fill-slate-700/50'
          }`}
        />

        {/* Labels (Visible only when active) */}
        {region === 'PFC' && (
          <text
            x="180"
            y="50"
            className="fill-blue-400 text-[10px] font-mono font-bold"
          >
            PFC (Logic)
          </text>
        )}
        {region === 'Amygdala' && (
          <text
            x="120"
            y="110"
            className="fill-red-400 text-[10px] font-mono font-bold"
          >
            Amygdala (Fear)
          </text>
        )}
        {region === 'Hippocampus' && (
          <text
            x="10"
            y="60"
            className="fill-purple-400 text-[10px] font-mono font-bold"
          >
            Hippocampus (Memory)
          </text>
        )}
      </svg>
    </div>
  );
};

export default BrainVisual;
