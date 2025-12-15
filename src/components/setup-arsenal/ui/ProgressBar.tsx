import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

interface ProgressBarProps {
  percentage: number;
  colorClass: string; // Tailwind text color class, e.g., 'text-emerald-400'
  barColorClass: string; // Tailwind bg color class
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  colorClass,
  barColorClass,
}) => {
  return (
    <div className="w-full mt-2">
      <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/30">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          className={cn('h-full rounded-full', barColorClass)}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
