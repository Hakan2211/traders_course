import React from 'react';
import { Symptom } from '../types';
import { Check, AlertCircle } from 'lucide-react';

interface ChecklistProps {
  symptoms: Symptom[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  disabled?: boolean;
}

const Checklist: React.FC<ChecklistProps> = ({
  symptoms,
  selectedIds,
  onToggle,
  disabled,
}) => {
  return (
    <div className="grid grid-cols-1 gap-2">
      {symptoms.map((symptom) => {
        const isSelected = selectedIds.includes(symptom.id);

        return (
          <div
            key={symptom.id}
            onClick={() => !disabled && onToggle(symptom.id)}
            className={`
              relative px-3 py-2 rounded border cursor-pointer transition-all duration-200 group flex items-center gap-3
              ${
                isSelected
                  ? 'bg-slate-800 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                  : 'bg-slate-900/30 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
              }
            `}
          >
            <div
              className={`
                w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors
                ${
                  isSelected
                    ? 'bg-red-500 border-red-500'
                    : 'bg-transparent border-slate-600 group-hover:border-slate-400'
                }
              `}
            >
              {isSelected && <Check className="w-3 h-3 text-white" />}
            </div>

            <div className="flex-1">
              <h3
                className={`font-medium text-xs ${
                  isSelected ? 'text-red-100' : 'text-slate-200'
                }`}
              >
                {symptom.title}
              </h3>
              {isSelected && (
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight hidden sm:block">
                  {symptom.description}
                </p>
              )}
            </div>

            {isSelected && (
              <AlertCircle className="w-4 h-4 text-red-500 opacity-40" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Checklist;
