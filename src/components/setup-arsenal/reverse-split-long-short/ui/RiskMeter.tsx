import React from 'react';
import { motion } from 'framer-motion';

interface RiskMeterProps {
  level: 1 | 2 | 3 | 4 | 5; // 1 = Low, 5 = Extreme
  label?: string;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({
  level,
  label = 'Risk Level',
}) => {
  const getRiskDetails = (l: number) => {
    switch (l) {
      case 1:
        return { text: 'LOW', color: 'text-blue-400', bg: '#60a5fa' };
      case 2:
        return { text: 'MODERATE', color: 'text-green-400', bg: '#4ade80' };
      case 3:
        return { text: 'HIGH', color: 'text-amber-400', bg: '#fbbf24' };
      case 4:
        return { text: 'VERY HIGH', color: 'text-orange-400', bg: '#fb923c' };
      case 5:
        return { text: 'EXTREME', color: 'text-red-400', bg: '#ef4444' };
      default:
        return { text: 'UNKNOWN', color: 'text-slate-400', bg: '#94a3b8' };
    }
  };

  const details = getRiskDetails(level);

  return (
    <div className="flex items-center gap-3">
      {label && (
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </span>
      )}
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.3, scale: 0.8 }}
            animate={{
              opacity: i <= level ? 1 : 0.2,
              scale: i <= level ? 1 : 0.8,
              backgroundColor: i <= level ? details.bg : '#334155',
              boxShadow: i <= level ? `0 0 8px ${details.bg}99` : 'none',
            }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="w-2.5 h-2.5 rounded-full"
          />
        ))}
      </div>
      <motion.span
        key={details.text}
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        className={`font-bold text-sm ml-1 ${details.color}`}
      >
        {details.text}
      </motion.span>
    </div>
  );
};
