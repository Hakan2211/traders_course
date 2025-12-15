import React from 'react';
import { cn } from '../../../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'long' | 'short' | 'neutral' | 'warning' | 'purple';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className,
}) => {
  const variants = {
    long: 'bg-green-500/20 text-green-400 border-green-500/30',
    short: 'bg-red-500/20 text-red-400 border-red-500/30',
    neutral: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    purple: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  };

  return (
    <span
      className={cn(
        'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
