
import React, { useState, useMemo } from 'react';
import { RefreshCcw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import BatteryMeter from './BatteryMeter';
import TaskCard from './TaskCard';
import {
  AVAILABLE_TASKS,
  INITIAL_BATTERY,
  STATUS_THRESHOLDS,
} from './constants';
import { Task } from './types';

export const DecisionBattery: React.FC = () => {
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  const currentLevel = useMemo(() => {
    const totalCost = selectedTaskIds.reduce((acc, id) => {
      const task = AVAILABLE_TASKS.find((t) => t.id === id);
      return acc + (task ? task.cost : 0);
    }, 0);
    return Math.max(0, INITIAL_BATTERY - totalCost);
  }, [selectedTaskIds]);

  const handleToggleTask = (task: Task) => {
    setSelectedTaskIds((prev) => {
      if (prev.includes(task.id)) {
        return prev.filter((id) => id !== task.id);
      }
      // Check if we have enough battery?
      // Or just allow going to 0.
      // The current logic allows going to 0.
      // If we want to prevent adding tasks that would drop below 0:
      // if (currentLevel - task.cost < 0) return prev;

      // Let's allow selecting as long as battery > 0,
      // and clamp to 0 in calculation if it goes negative (though UI might show negative if we don't clamp).
      // The memo clamps to 0.
      return [...prev, task.id];
    });
  };

  const handleReset = () => {
    setSelectedTaskIds([]);
  };

  // Determine status message
  let statusMessage = 'Optimal Performance State';
  let statusColor = 'text-emerald-400';

  if (currentLevel < STATUS_THRESHOLDS.WARNING) {
    statusMessage = 'Performance Degrading - Caution';
    statusColor = 'text-yellow-400';
  }
  if (currentLevel <= STATUS_THRESHOLDS.CRITICAL) {
    // 0 or less
    // Actually threshold is 0 for critical, but typically we want a range for warning.
    // If < 50 warning. If 0 critical.
  }
  if (currentLevel <= 20) {
    statusMessage = 'CRITICAL DEPLETION - STOP TRADING';
    statusColor = 'text-red-500 font-bold animate-pulse';
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-slate-900 border-slate-800">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl text-white">
              Cognitive Battery Simulator
            </CardTitle>
            <CardDescription className="text-slate-400">
              Select tasks to see how daily decisions drain your trading
              performance
            </CardDescription>
          </div>
          <button
            onClick={handleReset}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors text-slate-300"
            title="Reset Battery"
          >
            <RefreshCcw size={20} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column: Battery Meter */}
          <div className="w-full md:w-1/3 flex flex-col items-center">
            <BatteryMeter level={currentLevel} />
            <div className={`mt-4 text-center ${statusColor}`}>
              {statusMessage}
            </div>

            <div className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-sm text-slate-400">
              <p>
                <strong>Pro Tip:</strong> Notice how "cheap" tasks add up
                quickly. By the time you start trading, you might already be at
                60%.
              </p>
            </div>
          </div>

          {/* Right Column: Tasks Grid */}
          <div className="w-full md:w-2/3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_TASKS.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isSelected={selectedTaskIds.includes(task.id)}
                  onToggle={handleToggleTask}
                  disabled={
                    currentLevel <= 0 && !selectedTaskIds.includes(task.id)
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DecisionBattery;
