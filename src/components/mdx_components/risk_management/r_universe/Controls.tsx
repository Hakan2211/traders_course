
import React from 'react';
import { Check, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { FilterState, Grade, Stats } from './types';

interface ControlsProps {
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  stats: Stats;
}

const gradeStyles: Record<Grade, string> = {
  A: 'border-emerald-400 text-emerald-300 bg-emerald-400/10',
  B: 'border-sky-400 text-sky-300 bg-sky-400/10',
  C: 'border-amber-400 text-amber-300 bg-amber-400/10',
  D: 'border-rose-400 text-rose-300 bg-rose-400/10',
};

export const Controls: React.FC<ControlsProps> = ({
  filter,
  setFilter,
  stats,
}) => {
  const toggleGrade = (grade: Grade) => {
    setFilter((prev) => ({
      ...prev,
      grades: prev.grades.includes(grade)
        ? prev.grades.filter((g) => g !== grade)
        : [...prev.grades, grade],
    }));
  };

  return (
    <div className="absolute inset-4 pointer-events-none flex flex-col gap-4 items-end">
      <div className="pointer-events-auto bg-slate-950/80 border border-slate-800 rounded-xl p-4 w-72 shadow-xl">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-amber-300" /> R-Universe Stats
        </h3>
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-slate-200">
          <div>
            <span className="text-slate-500 text-xs">Total R</span>
            <div
              className={`font-mono text-lg font-bold ${
                stats.totalR >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {stats.totalR > 0 ? '+' : ''}
              {stats.totalR}R
            </div>
          </div>
          <div>
            <span className="text-slate-500 text-xs">Expectancy</span>
            <div
              className={`font-mono text-lg font-bold ${
                stats.expectancy >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {stats.expectancy > 0 ? '+' : ''}
              {stats.expectancy}R
            </div>
          </div>
          <div>
            <span className="text-slate-500 text-xs">Win Rate</span>
            <div className="font-mono text-lg font-semibold">
              {stats.winRate}%
            </div>
          </div>
          <div>
            <span className="text-slate-500 text-xs">Trades</span>
            <div className="font-mono text-lg font-semibold">
              {stats.totalTrades}
            </div>
          </div>
          <div className="col-span-2 h-px bg-slate-800" />
          <div>
            <span className="text-slate-500 text-xs flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" /> Avg Win
            </span>
            <div className="font-mono text-emerald-400">+{stats.avgWin}R</div>
          </div>
          <div>
            <span className="text-slate-500 text-xs flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-rose-400" /> Avg Loss
            </span>
            <div className="font-mono text-rose-400">{stats.avgLoss}R</div>
          </div>
        </div>
      </div>

      <div className="pointer-events-auto bg-slate-950/80 border border-slate-800 rounded-xl p-4 w-72 shadow-xl">
        <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-[0.2em]">
          Grade Filter
        </h4>
        <div className="flex gap-2">
          {(Object.keys(gradeStyles) as Grade[]).map((grade) => {
            const active = filter.grades.includes(grade);
            return (
              <button
                key={grade}
                onClick={() => toggleGrade(grade)}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded border text-sm font-bold transition-all ${
                  active
                    ? gradeStyles[grade]
                    : 'border-slate-700 text-slate-500'
                }`}
              >
                {active && <Check className="w-3 h-3" />}
                {grade}
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800">
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={filter.showOutliers}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  showOutliers: e.target.checked,
                }))
              }
              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-sky-400 focus:ring-sky-400"
            />
            Show Outliers Only (&gt; +3R or &lt; -1.5R)
          </label>
        </div>
      </div>
    </div>
  );
};
