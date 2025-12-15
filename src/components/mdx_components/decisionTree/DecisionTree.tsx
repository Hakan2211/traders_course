import React from 'react';
import { cn } from '@/lib/utils';

export interface DecisionNode {
  question: string;
  yes?: DecisionNode | string;
  no?: DecisionNode | string;
}

interface DecisionTreeProps {
  root: DecisionNode;
  className?: string;
}

const DecisionTree: React.FC<DecisionTreeProps> = ({ root, className }) => {
  const renderNode = (
    node: DecisionNode | string,
    isYes: boolean,
    depth: number = 0,
    isLast: boolean = false
  ): React.ReactNode => {
    if (typeof node === 'string') {
      return (
        <div
          className={cn(
            'relative pl-8 pt-3 pb-2 group animate-in fade-in slide-in-from-left-2 duration-500',
            'transition-all duration-300 ease-out'
          )}
          style={{ animationDelay: `${depth * 100}ms` }}
        >
          <div
            className={cn(
              'absolute left-0 top-0 bottom-0 w-[2px] rounded-full transition-all duration-300',
              isYes
                ? 'bg-gradient-to-b from-emerald-500/60 to-emerald-500/10 group-hover:from-emerald-400 group-hover:to-emerald-400/20'
                : 'bg-gradient-to-b from-gray-500/60 to-gray-500/10 group-hover:from-gray-400 group-hover:to-gray-400/20'
            )}
          />
          <div
            className={cn(
              'relative px-4 py-3 rounded-lg backdrop-blur-sm transition-all duration-300 ease-out',
              'shadow-md hover:shadow-lg transform hover:scale-[1.02] hover:-translate-y-0.5',
              isYes
                ? 'bg-gradient-to-br from-emerald-900/40 to-emerald-950/30 border border-emerald-700/40 hover:border-emerald-600/50'
                : 'bg-gradient-to-br from-gray-800/40 to-gray-900/30 border border-gray-600/40 hover:border-gray-500/50'
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex-shrink-0 w-1.5 h-1.5 rounded-full transition-all duration-300',
                  isYes
                    ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)] group-hover:shadow-[0_0_14px_rgba(52,211,153,0.8)]'
                    : 'bg-gray-400 shadow-[0_0_10px_rgba(156,163,175,0.5)] group-hover:shadow-[0_0_14px_rgba(156,163,175,0.7)]'
                )}
              />
              <span
                className={cn(
                  'text-sm font-medium leading-relaxed transition-colors duration-300',
                  isYes ? 'text-emerald-200' : 'text-gray-200'
                )}
              >
                {node}
              </span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn(
          'relative animate-in fade-in slide-in-from-top-2 duration-500',
          depth > 0 && 'ml-6 mt-3'
        )}
        style={{ animationDelay: `${depth * 100}ms` }}
      >
        <div
          className={cn(
            'relative group px-5 py-4 rounded-xl transition-all duration-300 ease-out',
            'bg-gradient-to-br from-gray-800/60 via-gray-800/50 to-gray-900/60',
            'border border-gray-600/40',
            'shadow-lg shadow-black/40 hover:shadow-xl hover:shadow-black/50',
            'backdrop-blur-sm transform hover:scale-[1.01] hover:-translate-y-0.5',
            depth === 0 && 'shadow-xl border-gray-600/50'
          )}
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-gray-100 leading-relaxed">
                {node.question}
              </p>
            </div>
          </div>
        </div>

        <div className="relative mt-4 space-y-3">
          {node.yes && (
            <div className="relative">
              <div className="flex items-center gap-2 mb-2 ml-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-sm shadow-emerald-500/30 transition-all duration-300 hover:shadow-md hover:shadow-emerald-500/40 hover:scale-105">
                  <svg
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-xs font-bold text-white uppercase tracking-wide">
                    Yes
                  </span>
                </div>
              </div>
              {renderNode(node.yes, true, depth + 1, !node.no)}
            </div>
          )}
          {node.no && (
            <div className="relative">
              <div className="flex items-center gap-2 mb-2 ml-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-slate-500 to-slate-600 shadow-sm shadow-slate-500/30 transition-all duration-300 hover:shadow-md hover:shadow-slate-500/40 hover:scale-105">
                  <svg
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span className="text-xs font-bold text-white uppercase tracking-wide">
                    No
                  </span>
                </div>
              </div>
              {renderNode(node.no, false, depth + 1, true)}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        'my-10 p-8 rounded-2xl transition-all duration-500',
        'bg-gradient-to-br from-gray-950/90 via-gray-900/85 to-black/90',
        'border border-gray-700/50',
        'shadow-[0_10px_40px_rgba(0,0,0,0.6)]',
        'backdrop-blur-2xl',
        'hover:shadow-[0_15px_50px_rgba(0,0,0,0.7)]',
        className
      )}
    >
      <div className="relative">
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl" />
        <div className="relative">{renderNode(root, false, 0)}</div>
      </div>
    </div>
  );
};

export default DecisionTree;
