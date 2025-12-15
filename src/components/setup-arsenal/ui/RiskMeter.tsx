import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

interface RiskMeterProps {
  level: number; // 1-5
  colorClass: string;
}

const RiskMeter: React.FC<RiskMeterProps> = ({ level, colorClass }) => {
  return (
    <div className="flex gap-1.5 items-center mt-1">
      {[1, 2, 3, 4, 5].map((dot) => (
        <motion.div
          key={dot}
          initial={{ opacity: 0.3, scale: 0.8 }}
          animate={{
            opacity: dot <= level ? 1 : 0.2,
            scale: dot <= level ? 1 : 0.8,
            backgroundColor: dot <= level ? 'currentColor' : '#334155',
          }}
          transition={{ duration: 0.4, delay: dot * 0.1 }}
          className={cn(
            'w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]',
            dot <= level ? colorClass : 'bg-slate-700 shadow-none'
          )}
        />
      ))}
    </div>
  );
};

export default RiskMeter;
