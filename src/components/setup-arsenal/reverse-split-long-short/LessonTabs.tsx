import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react';

export type TabType = 'long' | 'short' | 'cycle';

interface LessonTabsProps {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
}

export const LessonTabs: React.FC<LessonTabsProps> = ({
  activeTab,
  onChange,
}) => {
  const tabs = [
    {
      id: 'long',
      label: 'Long Setup',
      icon: TrendingUp,
      color: 'text-green-400',
    },
    {
      id: 'short',
      label: 'Short Setup',
      icon: TrendingDown,
      color: 'text-red-400',
    },
    {
      id: 'cycle',
      label: 'Mechanics & Cycle',
      icon: RefreshCcw,
      color: 'text-violet-400',
    },
  ];

  return (
    <div className="flex p-1 bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/5 mb-6 relative z-10">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id as TabType)}
            className={cn(
              'relative flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold transition-colors duration-200 z-10',
              isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-slate-800 rounded-lg shadow-sm border border-slate-700/50"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon
                size={16}
                className={cn(isActive ? tab.color : 'text-slate-500')}
              />
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
