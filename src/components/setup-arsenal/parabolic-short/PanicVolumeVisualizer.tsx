
import React from 'react';
import { motion } from 'framer-motion';

interface Step {
  label: string;
  price: number;
  vol: number;
  color: string;
  highlight?: boolean;
}

const PanicVolumeVisualizer: React.FC = () => {
  const steps: Step[] = [
    { label: 'Selling Starts', price: 80, vol: 20, color: 'bg-red-400' },
    { label: 'Acceleration', price: 60, vol: 40, color: 'bg-red-500' },
    { label: 'Panic', price: 40, vol: 60, color: 'bg-red-600' },
    {
      label: 'WASHOUT (Climax)',
      price: 20,
      vol: 100,
      color: 'bg-red-700',
      highlight: true,
    },
    { label: 'Stabilize', price: 25, vol: 30, color: 'bg-green-500' },
    { label: 'Bounce', price: 35, vol: 50, color: 'bg-green-600' },
  ];

  return (
    <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800 w-full overflow-hidden relative my-8">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-red-600 to-blue-500" />

      <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
        <h3 className="text-2xl font-bold text-white">
          Phase 3: Visualizing the Washout
        </h3>
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <span className="inline-block w-3 h-3 bg-red-500 rounded-full" />
          <span>Price Drop</span>
          <span className="inline-block w-3 h-3 bg-slate-700 ml-2 rounded-sm" />
          <span>Volume</span>
        </div>
      </div>

      {/* Visualization Area */}
      <div className="flex items-end justify-between h-80 gap-3 relative px-2">
        {steps.map((step, index) => {
          // Calculate drop distance based on price. Lower price = Lower dot visually (Higher Y value)
          // We map price 80 -> Y low, price 20 -> Y high
          const dropDistance = (100 - step.price) * 2.5;

          return (
            <div
              key={index}
              className="flex-1 flex flex-col justify-end h-full group relative z-10"
            >
              {/* Price Action Layer (Top Half - Absolute) */}
              <div className="absolute top-0 w-full flex justify-center h-full pointer-events-none">
                {/* Vertical Trail */}
                <motion.div
                  initial={{ height: 0 }}
                  whileInView={{ height: dropDistance }}
                  transition={{
                    delay: index * 0.15,
                    duration: 0.6,
                    ease: 'easeOut',
                  }}
                  className={`absolute top-0 w-0.5 rounded-full ${step.color} opacity-20`}
                />

                {/* Price Dot */}
                <motion.div
                  initial={{ opacity: 0, y: 0 }}
                  whileInView={{ opacity: 1, y: dropDistance }}
                  transition={{
                    delay: index * 0.15,
                    duration: 0.6,
                    ease: 'easeOut',
                  }}
                  className={`absolute top-0 w-4 h-4 rounded-full ${step.color} border-2 border-white z-20 shadow-[0_0_10px_rgba(255,255,255,0.3)] flex items-center justify-center`}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-8 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Price: ${step.price}
                  </div>
                </motion.div>
              </div>

              {/* Volume Bar Layer (Bottom Half) */}
              <div className="relative w-full flex flex-col justify-end h-[50%]">
                <motion.div
                  initial={{ height: 0 }}
                  whileInView={{ height: `${step.vol}%` }}
                  transition={{
                    delay: index * 0.15 + 0.2,
                    type: 'spring',
                    stiffness: 80,
                    damping: 12,
                  }}
                  className={`w-full rounded-t-lg relative group-hover:brightness-110 transition-all ${
                    step.highlight
                      ? 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.4)]'
                      : 'bg-slate-700'
                  }`}
                >
                  {step.highlight && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, y: 10 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: index * 0.15 + 0.5, type: 'spring' }}
                      className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
                    >
                      <span className="text-xs font-bold text-blue-200 bg-blue-900/80 px-2 py-1 rounded border border-blue-500/50 whitespace-nowrap backdrop-blur-sm">
                        CLIMAX
                      </span>
                      <div className="w-0.5 h-3 bg-blue-500/50"></div>
                    </motion.div>
                  )}

                  {/* Volume Value on Hover */}
                  <div className="absolute bottom-1 w-full text-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-white/70 font-mono">
                    {step.vol}k
                  </div>
                </motion.div>
              </div>

              {/* Labels */}
              <div className="text-center mt-3 h-10 flex items-start justify-center">
                <span
                  className={`text-[10px] md:text-xs uppercase font-bold leading-tight block ${
                    step.highlight ? 'text-blue-400' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend / Explanation */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-red-950/30 p-4 rounded-xl border border-red-900/30 flex items-start space-x-3 hover:bg-red-950/50 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20">
            <div className="w-2 h-2 rounded-full bg-red-500" />
          </div>
          <div>
            <h4 className="text-red-400 font-bold text-sm mb-1">
              Price Action
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Price drops rapidly (dots moving down). The vertical distance
              between dots increases during the acceleration phase, visually
              representing momentum speed.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-blue-950/30 p-4 rounded-xl border border-blue-900/30 flex items-start space-x-3 hover:bg-blue-950/50 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
            <div className="w-2 h-3 bg-blue-500 rounded-sm" />
          </div>
          <div>
            <h4 className="text-blue-400 font-bold text-sm mb-1">
              Volume Confirmation
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Volume MUST increase on the way down. The tallest bar (Climax)
              marks the capitulation point where panic sellers exit and smart
              money enters.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PanicVolumeVisualizer;
