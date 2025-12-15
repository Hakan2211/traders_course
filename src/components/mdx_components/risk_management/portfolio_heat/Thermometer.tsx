
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeatState } from './types';
import { MAX_HEAT } from './constants';
import { AlertTriangle, Flame, ShieldCheck, Skull } from 'lucide-react';

interface ThermometerProps {
  heatState: HeatState;
}

const Thermometer: React.FC<ThermometerProps> = ({ heatState }) => {
  const percentage = Math.min((heatState.currentHeat / MAX_HEAT) * 100, 100);

  // Dynamic color based on heat value
  const getColor = (heat: number) => {
    if (heat >= 12) return '#ef4444'; // Red
    if (heat >= 8) return '#f97316'; // Orange
    if (heat >= 6) return '#eab308'; // Yellow
    return '#22c55e'; // Green
  };

  const currentColor = getColor(heatState.currentHeat);

  // Status Icon
  const getStatusIcon = () => {
    switch (heatState.status) {
      case 'SAFE':
        return <ShieldCheck className="w-8 h-8 text-emerald-500" />;
      case 'CAUTION':
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
      case 'DANGER':
        return <Flame className="w-8 h-8 text-orange-500 animate-pulse" />;
      case 'CRITICAL':
      case 'BROKEN':
        return <Skull className="w-8 h-8 text-red-600 animate-bounce" />;
    }
  };

  return (
    <div className="flex flex-col items-center h-full w-full max-w-[120px] mx-auto relative z-10">
      {/* Top readout */}
      <div className="mb-4 text-center">
        <div className="flex justify-center mb-2">{getStatusIcon()}</div>
        <div
          className="text-3xl font-black font-mono transition-colors duration-300"
          style={{ color: currentColor }}
        >
          {heatState.currentHeat.toFixed(1)}%
        </div>
        <div className="text-[10px] uppercase tracking-widest font-semibold text-slate-500">
          Portfolio Heat
        </div>
      </div>

      {/* Thermometer Body */}
      <div className="relative w-16 flex-grow bg-slate-800 rounded-full border-4 border-slate-700 p-1 overflow-hidden shadow-inner">
        {/* Background Gradients/Ticks */}
        <div className="absolute inset-0 flex flex-col justify-between py-4 px-2 opacity-30 z-0">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-full h-[1px] bg-slate-500"></div>
          ))}
        </div>

        {/* Zones (Background) */}
        <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-emerald-500/10 rounded-b-full"></div>
        <div className="absolute bottom-[40%] left-0 right-0 h-[13%] bg-yellow-500/10"></div>
        <div className="absolute bottom-[53%] left-0 right-0 h-[13%] bg-orange-500/10"></div>
        <div className="absolute top-0 left-0 right-0 bottom-[66%] bg-red-500/10 rounded-t-full"></div>

        {/* The Mercury */}
        <div className="absolute bottom-0 left-0 right-0 w-full h-full flex items-end justify-center px-3 pb-3 pt-8 z-10">
          <motion.div
            className="w-full rounded-t-lg rounded-b-xl relative"
            animate={{
              height: `${percentage}%`,
              backgroundColor: currentColor,
              filter:
                heatState.status === 'BROKEN'
                  ? 'brightness(1.5) blur(1px)'
                  : 'none',
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          >
            {/* Bubbles effect for high heat */}
            {heatState.currentHeat > 8 && (
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="w-full h-full bg-gradient-to-t from-transparent to-white/30"
                  animate={{ y: [0, -100] }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                />
              </div>
            )}
          </motion.div>
        </div>

        {/* Glass Reflection */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-full pointer-events-none z-20"></div>
      </div>

      {/* Bulb at bottom */}
      <div
        className="w-24 h-24 rounded-full -mt-8 border-4 border-slate-700 relative z-20 flex items-center justify-center shadow-lg transition-colors duration-300"
        style={{ backgroundColor: currentColor }}
      >
        <div className="w-12 h-12 bg-white/20 rounded-full blur-md absolute top-2 right-4"></div>
      </div>

      {/* Shatter Overlay */}
      <AnimatePresence>
        {heatState.status === 'BROKEN' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full absolute opacity-80 mix-blend-overlay"
            >
              <path
                d="M50 50 L10 10 M50 50 L90 10 M50 50 L50 90 M20 50 L80 60"
                stroke="white"
                strokeWidth="2"
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Thermometer;
