
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraveData } from './types';
import { Skull } from 'lucide-react';

interface OverlayProps {
  hoveredGrave: GraveData | null;
}

export const Overlay: React.FC<OverlayProps> = ({ hoveredGrave }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
      <AnimatePresence>
        {hoveredGrave && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-900/90 backdrop-blur-md border border-red-900/50 p-6 rounded-lg shadow-2xl max-w-xs text-center"
          >
            <div className="flex justify-center mb-2">
              <div className="p-3 bg-red-950/50 rounded-full">
                <Skull className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <h3 className="text-red-400 font-serif text-lg font-bold mb-1">
              R.I.P. Trader #{hoveredGrave.id}
            </h3>
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-4">
              {hoveredGrave.archetype}
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-500">Survived:</span>
                <span className="text-slate-200 font-mono">
                  {hoveredGrave.daysSurvived} Days
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-500">Capital Lost:</span>
                <span className="text-red-400 font-mono">
                  {hoveredGrave.lossAmount}
                </span>
              </div>
            </div>
            <div className="mt-4 bg-red-950/20 p-2 rounded border border-red-900/30">
              <p className="text-xs text-red-300 font-bold uppercase mb-1">
                Cause of Death
              </p>
              <p className="text-slate-200 italic">
                "{hoveredGrave.causeOfDeath}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
