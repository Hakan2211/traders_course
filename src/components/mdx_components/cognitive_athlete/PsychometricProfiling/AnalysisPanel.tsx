import React from 'react';
import { ProfileData, Strategy, Trait } from './types';

interface AnalysisPanelProps {
  userProfile: ProfileData;
  strategy: Strategy;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  userProfile,
  strategy,
}) => {
  const mismatches: { trait: Trait; diff: number; message: string }[] = [];

  (Object.keys(userProfile) as Trait[]).forEach((trait) => {
    const userVal = userProfile[trait];
    const stratVal = strategy.profile[trait];
    const diff = userVal - stratVal;

    // Threshold for reporting a mismatch
    if (Math.abs(diff) >= 3) {
      let message = '';
      if (diff < 0) {
        // User is lower than strategy needs
        message = `Your ${trait} (${userVal}) is too low for ${strategy.name} (needs ${stratVal}).`;
      } else {
        // User is higher than strategy needs
        message = `Your ${trait} (${userVal}) is higher than ${strategy.name} typically utilizes.`;
        if (trait === 'Speed' && strategy.id === 'swing') {
          message = `CRITICAL: Your high need for Speed conflicts with Swing Trading's slow pace.`;
        }
        if (trait === 'Creativity' && strategy.id === 'systematic') {
          message = `CRITICAL: High Creativity often leads to rule-breaking in Systematic trading.`;
        }
        if (trait === 'Patience' && strategy.id === 'scalping') {
          message = `High Patience might cause hesitation in fast Scalping environments.`;
        }
      }

      mismatches.push({ trait, diff, message });
    }
  });

  const criticalCount = mismatches.filter((m) => Math.abs(m.diff) >= 4).length;
  const isMatch = mismatches.length === 0;

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 h-full">
      <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
        Compatibility Analysis
      </h3>

      {isMatch ? (
        <div className="flex flex-col items-center justify-center h-48 space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center border-2 border-green-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-green-400 font-medium text-lg text-center">
            Excellent Fit!
          </p>
          <p className="text-slate-400 text-center text-sm">
            Your hardware is naturally aligned with this strategy.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div
            className={`p-4 rounded-md border ${
              criticalCount > 0
                ? 'bg-red-900/20 border-red-500/50'
                : 'bg-yellow-900/20 border-yellow-500/50'
            }`}
          >
            <h4
              className={`font-bold ${
                criticalCount > 0 ? 'text-red-400' : 'text-yellow-400'
              }`}
            >
              {criticalCount > 0
                ? 'Major Mismatches Detected'
                : 'Minor Alignments Needed'}
            </h4>
            <p className="text-sm text-slate-300 mt-1">
              {criticalCount > 0
                ? 'You are fighting your biology. Significant adjustments or a strategy switch required.'
                : 'Some friction exists, but can be managed with discipline and awareness.'}
            </p>
          </div>

          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
            {mismatches.map((m) => (
              <div
                key={m.trait}
                className="flex items-start gap-3 p-3 bg-slate-900/50 rounded border border-slate-700/50"
              >
                {Math.abs(m.diff) >= 4 ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-red-500 shrink-0 mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span className="text-sm text-slate-300">{m.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
