
import React from 'react';
import { Task, TaskCost } from './types';
import { Plus, Check } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  isSelected: boolean;
  onToggle: (task: Task) => void;
  disabled: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isSelected,
  onToggle,
  disabled,
}) => {
  const isZeroCost = task.cost === TaskCost.ZERO;
  let borderColor = 'border-slate-700';
  let bgColor = 'bg-slate-800/50';

  if (isSelected) {
    if (isZeroCost) {
      borderColor = 'border-emerald-500';
      bgColor = 'bg-emerald-900/20';
    } else {
      borderColor = 'border-rose-500';
      bgColor = 'bg-rose-900/20';
    }
  }

  return (
    <button
      onClick={() => onToggle(task)}
      disabled={disabled && !isSelected}
      className={`
        relative group flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-200 w-full text-left
        ${borderColor} ${bgColor}
        ${
          !disabled
            ? 'hover:scale-[1.02] hover:bg-slate-800'
            : 'opacity-50 cursor-not-allowed'
        }
      `}
    >
      <div className="flex justify-between w-full mb-2">
        <div
          className={`p-2 rounded-lg ${
            isSelected
              ? isZeroCost
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/20 text-rose-400'
              : 'bg-slate-700 text-slate-400'
          }`}
        >
          <task.icon size={20} />
        </div>
        <div
          className={`text-xs font-bold px-2 py-1 rounded-full flex items-center ${
            isZeroCost
              ? 'text-emerald-400 bg-emerald-950'
              : 'text-rose-400 bg-rose-950'
          }`}
        >
          {isZeroCost ? 'FREE' : `-${task.cost}%`}
        </div>
      </div>

      <h3 className="font-semibold text-slate-200 text-sm mb-1">{task.name}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">
        {task.description}
      </p>
      {/* Selection Indicator Overlay */}
      <div
        className={`absolute top-2 right-2 transition-opacity duration-200 ${
          isSelected ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className={`rounded-full p-1 ${
            isZeroCost ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        >
          <Check size={12} className="text-white" />
        </div>
      </div>
    </button>
  );
};

export default TaskCard;
