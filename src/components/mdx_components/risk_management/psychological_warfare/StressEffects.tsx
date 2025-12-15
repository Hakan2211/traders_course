
import React from 'react';
import { motion } from 'framer-motion';

interface StressEffectsProps {
  level: number; // 0-100
}

const StressEffects: React.FC<StressEffectsProps> = ({ level }) => {
  if (level === 0) return null;

  const opacity = Math.min(level / 100, 0.8);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Red Vignette - Tunnel Vision */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(220,38,38,0.4)_100%)]"
        style={{ opacity: opacity }}
      />

      {/* Heartbeat / Pulsing red borders */}
      <motion.div
        className="absolute inset-0 border-[20px] border-red-500/20"
        animate={{
          opacity: [0, opacity * 0.5, 0],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: Math.max(0.3, 1 - level / 100), // Faster heartbeat as stress rises
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Grain / Noise for confusion */}
      {level > 50 && (
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")`,
          }}
        />
      )}

      {/* Scanlines for CRT effect in extreme stress */}
      {level > 80 && <div className="absolute inset-0 crt-lines opacity-20" />}
    </div>
  );
};

export default StressEffects;
