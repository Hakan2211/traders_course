
import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  formatValue?: (val: number) => string;
  disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue = (v) => v.toString(),
  disabled = false,
}) => {
  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-slate-300 uppercase tracking-wider">
          {label}
        </label>
        <span className="text-sm font-bold text-blue-400 font-mono bg-blue-500/10 px-2 py-1 rounded">
          {formatValue(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      />
      <div className="flex justify-between mt-1 text-xs text-slate-500 font-mono">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
};
