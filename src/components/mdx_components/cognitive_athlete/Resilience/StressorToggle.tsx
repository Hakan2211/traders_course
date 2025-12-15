
import React from 'react';
import { Stressor } from './types';
import { Check } from 'lucide-react';

interface StressorToggleProps {
  stressor: Stressor;
  isActive: boolean;
  onToggle: (id: string) => void;
  disabled?: boolean;
}

export const StressorToggle: React.FC<StressorToggleProps> = ({
  stressor,
  isActive,
  onToggle,
  disabled,
}) => {
  const Icon = stressor.icon;

  return (
    <button
      onClick={() => onToggle(stressor.id)}
      disabled={disabled}
      className={`
        relative group flex items-center p-4 rounded-xl border-2 transition-all duration-300 w-full text-left
        ${
          isActive
            ? 'border-indigo-500 bg-indigo-500/10 shadow-md translate-x-1'
            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div
        className={`
        p-3 rounded-lg mr-4 transition-colors
        ${
          isActive
            ? 'bg-indigo-500 text-white'
            : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600'
        }
      `}
      >
        <Icon className="w-6 h-6" />
      </div>

      <div className="flex-grow">
        <div className="flex justify-between items-center mb-1">
          <h3
            className={`font-bold ${
              isActive ? 'text-indigo-300' : 'text-slate-200'
            }`}
          >
            {stressor.label}
          </h3>
          <span
            className={`text-xs font-mono font-bold px-2 py-1 rounded ${
              isActive
                ? 'bg-indigo-500/20 text-indigo-300'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            +{stressor.value}%
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-tight">
          {stressor.description}
        </p>
      </div>

      {isActive && (
        <div className="absolute -top-2 -right-2 bg-indigo-500 text-white rounded-full p-1 shadow-sm">
          <Check className="w-3 h-3" />
        </div>
      )}
    </button>
  );
};
