import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

type Level = {
  label: string;
  title: string;
  description: string;
};

export interface SurvivalHierarchyProps {
  levels?: Level[];
  headline?: string;
  subheadline?: string;
  className?: string;
}

const DEFAULT_LEVELS: Level[] = [
  {
    label: 'Level 1',
    title: "DON'T BLOW UP",
    description: 'Establish a solid risk foundation. Survival is the win.',
  },
  {
    label: 'Level 2',
    title: "DON'T SUFFER CATASTROPHIC DRAWDOWN",
    description: 'Control damage so storms are survivable, not terminal.',
  },
  {
    label: 'Level 3',
    title: "DON'T HAVE EXTENDED LOSING STREAKS",
    description: 'Protect psychology with disciplined execution and review.',
  },
  {
    label: 'Level 4',
    title: 'ACHIEVE CONSISTENT SMALL GAINS',
    description: 'Stack repeatable wins. Consistency precedes scaling.',
  },
  {
    label: 'Level 5',
    title: 'SCALE AND COMPOUND',
    description: 'Only expand size once the lower rungs are automatic.',
  },
];

export function SurvivalHierarchy({
  levels = DEFAULT_LEVELS,
  headline = 'The Survival Hierarchy',
  subheadline = 'Climb sequentially. Skipping rungs creates inevitable ruin.',
  className,
}: SurvivalHierarchyProps) {
  return (
    <section
      className={cn(
        'relative isolate overflow-hidden rounded-2xl border border-gray-700/50 px-5 py-6 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-shadow md:px-8 md:py-8',
        'bg-gradient-to-br from-gray-950/90 via-gray-900/85 to-black/90 dark:bg-slate-800',
        className
      )}
    >
      <div className="relative z-10 space-y-5">
        <header className="space-y-2 max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.55em] text-[var(--module-badge)]">
            Prime Directive
          </p>
          <h4 className="text-2xl font-semibold leading-tight text-gray-100 md:text-3xl">
            {headline}
          </h4>
          <p className="text-base leading-relaxed text-gray-300 opacity-90">
            {subheadline}
          </p>
        </header>
        <ol className="space-y-3">
          {levels.map((level, index) => (
            <li key={level.label} className="relative flex items-center gap-4">
              <div className="flex flex-col items-center justify-center">
                {index < levels.length - 1 && (
                  <div className="mb-1 flex flex-col items-center opacity-0 pointer-events-none">
                    <div className="h-4 w-px" />
                    <div className="h-4 w-4" />
                    <div className="h-4 w-px" />
                  </div>
                )}
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-600/50 bg-gray-800/50 text-xs font-semibold tracking-[0.2em] text-[var(--module-badge)] backdrop-blur-sm"
                  style={{
                    color: 'var(--module-badge)',
                  }}
                >
                  {level.label.replace('Level ', 'L')}
                </div>
                {index < levels.length - 1 && (
                  <div className="mt-1 flex flex-col items-center translate-y-8">
                    <div className="h-4  w-px bg-gradient-to-b from-[var(--module-badge)] via-[var(--module-badge)]/70 to-transparent" />
                    <ChevronDown
                      className="h-4 w-4 text-[var(--module-badge)] mt-0.5"
                      strokeWidth={2.5}
                    />
                    <div className="h-4 w-px bg-gradient-to-b from-transparent via-[var(--module-badge)]/70 to-[var(--module-badge)]" />
                  </div>
                )}
              </div>
              <div className="flex-1 rounded-2xl border border-gray-700/30 bg-gray-800/30 px-4 py-3 backdrop-blur-sm">
                <p className="text-lg font-semibold uppercase tracking-wide text-gray-100">
                  {level.title}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-gray-300 opacity-90">
                  {level.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
