import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  AlertTriangle,
  Zap,
  DollarSign,
  Activity,
} from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export const CycleDiagram: React.FC = () => {
  return (
    <div className="space-y-6">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="bg-slate-900/50 border border-violet-500/20 rounded-2xl p-6 backdrop-blur-sm"
      >
        <h3 className="text-xl font-bold text-violet-400 mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          The Corporate Survival Cycle
        </h3>

        {/* Phase 1 */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center mb-8 relative">
          {/* Step 1 */}
          <motion.div
            variants={item}
            className="md:col-span-2 bg-red-950/30 border border-red-500/30 p-4 rounded-xl text-center relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors duration-500"></div>
            <div className="relative z-10">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <h4 className="font-bold text-red-200">Desperation Phase</h4>
              <p className="text-xs text-red-300/70 mt-1">
                Stock &lt; $1.00
                <br />
                Delisting Risk
              </p>
            </div>
          </motion.div>

          {/* Arrow */}
          <div className="hidden md:flex justify-center text-slate-600">
            <ArrowRight size={24} />
          </div>

          {/* Step 2 */}
          <motion.div
            variants={item}
            className="md:col-span-2 bg-violet-950/30 border border-violet-500/30 p-4 rounded-xl text-center relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-violet-500/5 group-hover:bg-violet-500/10 transition-colors duration-500"></div>
            <div className="relative z-10">
              <Zap className="w-8 h-8 text-violet-400 mx-auto mb-2" />
              <h4 className="font-bold text-violet-200">Reverse Split</h4>
              <p className="text-xs text-violet-300/70 mt-1">
                Float Reduced
                <br />
                Price Artificially Up
              </p>
            </div>
          </motion.div>

          {/* Arrow */}
          <div className="hidden md:flex justify-center text-slate-600">
            <ArrowRight size={24} />
          </div>

          {/* Step 3 */}
          <motion.div
            variants={item}
            className="md:col-span-1 bg-green-950/30 border border-green-500/30 p-4 rounded-xl text-center relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors duration-500"></div>
            <div className="relative z-10">
              <h4 className="font-bold text-green-400 text-lg">PUMP</h4>
              <div className="text-[10px] font-bold uppercase tracking-widest text-green-500/70 mt-1">
                Long Here
              </div>
            </div>
          </motion.div>
        </div>

        {/* Phase 2 */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
          {/* Step 4 */}
          <motion.div
            variants={item}
            className="md:col-span-2 md:col-start-1 bg-green-900/20 border border-green-500/20 p-4 rounded-xl text-center"
          >
            <h4 className="font-bold text-green-100">Price Inflated</h4>
            <p className="text-xs text-green-300/70 mt-1">Metrics Improved</p>
          </motion.div>

          {/* Arrow */}
          <div className="hidden md:flex justify-center text-slate-600">
            <ArrowRight size={24} />
          </div>

          {/* Step 5 */}
          <motion.div
            variants={item}
            className="md:col-span-2 bg-amber-950/30 border border-amber-500/30 p-4 rounded-xl text-center relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors duration-500"></div>
            <div className="relative z-10">
              <DollarSign className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <h4 className="font-bold text-amber-200">Dilution / Offering</h4>
              <p className="text-xs text-amber-300/70 mt-1">
                Company Raises Cash
                <br />
                At inflated prices
              </p>
            </div>
          </motion.div>

          {/* Arrow */}
          <div className="hidden md:flex justify-center text-slate-600">
            <ArrowRight size={24} />
          </div>

          {/* Step 6 */}
          <motion.div
            variants={item}
            className="md:col-span-1 bg-red-950/30 border border-red-500/30 p-4 rounded-xl text-center relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors duration-500"></div>
            <div className="relative z-10">
              <h4 className="font-bold text-red-400 text-lg">FADE</h4>
              <div className="text-[10px] font-bold uppercase tracking-widest text-red-500/70 mt-1">
                Short Here
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
