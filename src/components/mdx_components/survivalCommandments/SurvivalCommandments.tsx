import React from 'react';
import { cn } from '@/lib/utils';

type Commandment = {
  number: number;
  title: string;
  description: string;
};

export interface SurvivalCommandmentsProps {
  commandments?: Commandment[];
  className?: string;
}

const DEFAULT_COMMANDMENTS: Commandment[] = [
  {
    number: 1,
    title: 'THOU SHALL NEVER RISK MORE THAN 1–2% PER TRADE',
    description:
      'No exceptions. Not for "perfect setups." Not to "recover losses." Never.',
  },
  {
    number: 2,
    title: 'THOU SHALL ALWAYS USE A STOP LOSS',
    description: 'Every trade. Every time. Placed at entry. Non-negotiable.',
  },
  {
    number: 3,
    title: 'THOU SHALL KNOW THY RISK OF RUIN',
    description: "If you can't calculate it, you can't trade safely.",
  },
  {
    number: 4,
    title: 'THOU SHALL LIMIT TOTAL PORTFOLIO EXPOSURE',
    description:
      'Never have more than 6–10% of capital at risk across all positions.',
  },
  {
    number: 5,
    title: 'THOU SHALL RESPECT LEVERAGE AS A WEAPON, NOT A TOOL',
    description: 'High leverage can kill you. Use the minimum necessary.',
  },
  {
    number: 6,
    title: 'THOU SHALL HAVE DAILY AND WEEKLY LOSS LIMITS',
    description: 'Hit your limit? Stop trading. No exceptions.',
  },
  {
    number: 7,
    title: 'THOU SHALL TRADE SMALL UNTIL PROVEN CONSISTENT',
    description: 'Micro lots exist for a reason. Use them.',
  },
  {
    number: 8,
    title: 'THOU SHALL ACCEPT THAT LOSING IS PART OF WINNING',
    description:
      'Losing trades are business expenses. Expected. Normal. Acceptable.',
  },
  {
    number: 9,
    title: 'THOU SHALL KEEP EMOTIONS OUT OF POSITION SIZING',
    description: 'Your position size is determined by math, not feelings.',
  },
  {
    number: 10,
    title: 'THOU SHALL SURVIVE FIRST, PROFIT SECOND',
    description: 'Always. Forever. Without exception.',
  },
];

export function SurvivalCommandments({
  commandments = DEFAULT_COMMANDMENTS,
  className,
}: SurvivalCommandmentsProps) {
  return (
    <section
      className={cn(
        'relative isolate overflow-hidden rounded-2xl border border-gray-700/50 px-6 py-8 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-shadow md:px-10 md:py-12',
        'bg-gradient-to-br from-gray-950/90 via-gray-900/85 to-black/90 dark:bg-slate-800',
        className
      )}
    >
      <div className="relative z-10 space-y-6">
        <header className="space-y-2">
          <h3 className="text-2xl font-semibold leading-tight text-gray-100 md:text-3xl">
            THE SURVIVAL COMMANDMENTS
          </h3>
          <p className="text-sm text-gray-300 opacity-80">
            Commit these principles to memory. They are non-negotiable.
          </p>
        </header>
        <ol className="space-y-4">
          {commandments.map((commandment) => (
            <li
              key={commandment.number}
              className="relative flex gap-4 rounded-xl border border-gray-700/30 bg-gray-800/30 p-4 backdrop-blur-sm transition-all hover:border-gray-600/50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-600/50 bg-gray-800/50 text-sm font-bold text-[var(--module-badge)] backdrop-blur-sm">
                {commandment.number}
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-base font-semibold uppercase tracking-wide text-gray-100 md:text-lg">
                  {commandment.title}
                </h4>
                <p className="text-sm leading-relaxed text-gray-300 opacity-90">
                  → {commandment.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
