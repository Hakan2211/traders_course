
import React from 'react';
import { motion } from 'framer-motion';

const RiskIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <span className="text-red-500 font-bold text-sm tracking-wider">
        EXTREME
      </span>
      <div className="flex gap-1.5">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
            animate={{
              opacity: [1, 0.4, 1],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default RiskIndicator;
