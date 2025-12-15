
import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

const MoatVisualizer = () => {
  // Constants for dimensions
  const CONTAINER_HEIGHT = 400;
  const VWAP_Y = CONTAINER_HEIGHT / 2;
  const DRAG_PADDING = 30; // Prevents dragging too close to edge

  // Motion values
  const y = useMotionValue(VWAP_Y);

  // State for UI feedback
  const [distance, setDistance] = useState(0);
  const [status, setStatus] = useState<'neutral' | 'bad' | 'good'>('neutral');
  const [direction, setDirection] = useState<'long' | 'short' | 'none'>('none');

  // Reactive transforms for the tether line (performance optimized)
  // Calculate the top position of the tether line (always the smaller of y or VWAP_Y)
  const lineTop = useTransform(y, (currentY) => Math.min(currentY, VWAP_Y));
  // Calculate height (absolute distance)
  const lineHeight = useTransform(y, (currentY) => Math.abs(currentY - VWAP_Y));

  // Calculate target line position (50% retracement)
  const targetLineY = useTransform(y, (currentY) => (currentY + VWAP_Y) / 2);

  // Subscribe to changes to update React state for non-animatable things (text, colors)
  useEffect(() => {
    const unsubscribe = y.onChange((latest) => {
      const dist = Math.abs(latest - VWAP_Y);
      setDistance(dist);

      const currentDirection = latest < VWAP_Y ? 'short' : 'long'; // If price is above VWAP (y < 200), it's a pull back from high?
      // Actually in screen coords: 0 is top.
      // If Y < VWAP_Y (200), price is physically higher on screen (High Price).
      // Context: Setup is "Bounce" (Price > VWAP, pulling back to VWAP) or "Rejection" (Price < VWAP, grinding up).
      // Here we simulate the "Extreme" point.
      // If we drag UP (y < 200), price is High. Setup would be a Short back to VWAP or a Long Bounce?
      // The lesson says: "Moat = Distance between VWAP and extreme".

      setDirection(
        Math.abs(latest - VWAP_Y) < 5
          ? 'none'
          : latest < VWAP_Y
          ? 'long'
          : 'short'
      );

      if (dist < 40) setStatus('neutral');
      else if (dist < 100) setStatus('bad');
      else setStatus('good');
    });
    return () => unsubscribe();
  }, [y]);

  // Derived styles based on status
  const getStatusColor = () => {
    switch (status) {
      case 'good':
        return 'text-emerald-400 border-emerald-500/50 bg-emerald-950/30';
      case 'bad':
        return 'text-rose-400 border-rose-500/50 bg-rose-950/30';
      default:
        return 'text-blue-200 border-slate-600 bg-slate-800/50';
    }
  };

  const statusColorClasses = getStatusColor();

  return (
    <div
      className={cn(
        'flex flex-col w-full p-6 transition-colors duration-500',
        status === 'good'
          ? 'bg-emerald-950/10'
          : status === 'bad'
          ? 'bg-rose-950/10'
          : 'bg-transparent'
      )}
    >
      {/* Header Section */}
      <div className="flex justify-between items-start mb-4 z-10 relative">
        <div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            The Moat Visualizer
          </h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md">
            Drag the <span className="text-blue-400 font-bold">Price</span> away
            from VWAP. A larger "Moat" creates a higher probability reversion
            setup.
          </p>
        </div>
        <div
          className={cn(
            'px-4 py-2 rounded-lg border backdrop-blur-md flex flex-col items-end min-w-[140px]',
            statusColorClasses
          )}
        >
          <span className="text-xs uppercase font-semibold opacity-70">
            Probability
          </span>
          <span className="text-lg font-bold uppercase">
            {status === 'neutral' ? 'N/A' : status === 'good' ? 'High' : 'Low'}
          </span>
        </div>
      </div>

      {/* Visualization Area */}
      <div className="relative flex-1 w-full bg-slate-900/50 rounded-xl overflow-hidden border border-slate-700/50 shadow-inner group min-h-[400px]">
        {/* Grid Background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        ></div>

        {/* The VWAP Line (Center) */}
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-yellow-400/80 z-10 shadow-[0_0_15px_rgba(250,204,21,0.4)] flex items-center">
          <div className="absolute right-4 -top-7 text-yellow-400 text-xs font-mono font-bold bg-yellow-400/10 px-2 py-1 rounded border border-yellow-400/20">
            VWAP (Equilibrium)
          </div>
        </div>

        {/* The Tether Line (Connects Price to VWAP) */}
        <motion.div
          className={cn(
            'absolute left-1/2 w-[2px] -translate-x-1/2 z-0 transition-colors duration-300',
            status === 'good'
              ? 'bg-emerald-500/50'
              : status === 'bad'
              ? 'bg-rose-500/50'
              : 'bg-slate-500/30'
          )}
          style={{
            top: lineTop,
            height: lineHeight,
          }}
        />

        {/* 50% Retracement Target Line (Only visible when GOOD) */}
        <motion.div
          className="absolute left-0 w-full h-[1px] z-0 border-t-2 border-dashed border-emerald-500/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: status === 'good' ? 1 : 0 }}
          style={{ top: targetLineY }}
        >
          <div className="absolute left-4 -top-3 text-emerald-400 text-[10px] font-mono bg-emerald-950/80 px-1 rounded">
            TARGET (50% Retracement)
          </div>
        </motion.div>

        {/* The Draggable Price Bubble */}
        <motion.div
          drag="y"
          dragConstraints={{
            top: DRAG_PADDING,
            bottom: CONTAINER_HEIGHT - DRAG_PADDING,
          }}
          dragElastic={0.2} // Makes it feel stretchy
          dragMomentum={false} // Stops immediately when released
          style={{ y }}
          className="absolute left-1/2 z-30 touch-none"
        >
          {/* Centering wrapper since motion.div uses y for transform, we need to center the element itself */}
          <div className="-translate-x-1/2 -translate-y-1/2 relative cursor-grab active:cursor-grabbing group-active:scale-105 transition-transform">
            {/* Bubble Visual */}
            <div
              className={cn(
                'w-20 h-20 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center border-4 transition-colors duration-300',
                status === 'good'
                  ? 'bg-emerald-600 border-emerald-400'
                  : status === 'bad'
                  ? 'bg-rose-600 border-rose-400'
                  : 'bg-blue-600 border-blue-400'
              )}
            >
              <span className="text-white font-black text-xs tracking-wider">
                PRICE
              </span>
              <span className="text-white/80 text-[10px] font-mono mt-0.5">
                ${(200 - (y.get() - 200) / 5).toFixed(2)}
              </span>
            </div>

            {/* Pulsing effect when Good */}
            {status === 'good' && (
              <div className="absolute inset-0 rounded-full border-4 border-emerald-400/50 animate-ping" />
            )}
          </div>
        </motion.div>

        {/* Info Overlay (Bottom Left) */}
        <div className="absolute bottom-4 left-4 p-4 bg-slate-900/90 rounded-lg backdrop-blur-md border border-slate-700 w-72 shadow-xl z-20 pointer-events-none">
          <div className="flex justify-between text-xs text-slate-400 uppercase mb-2 border-b border-slate-700 pb-2">
            <span>Distance (Moat)</span>
            <span className="font-mono text-white">
              {Math.round(distance)} pts
            </span>
          </div>

          {status === 'neutral' && (
            <div className="text-blue-200 text-sm">
              <strong className="block mb-1 text-blue-400">
                Status: Neutral
              </strong>
              Drag price up (High) or down (Low) to create separation from VWAP.
            </div>
          )}

          {status === 'bad' && (
            <div className="text-rose-200 text-sm">
              <strong className="block mb-1 text-rose-400">
                Status: POOR SETUP (Small Moat)
              </strong>
              Price is too close to VWAP.
              <ul className="list-disc list-inside mt-1 text-xs opacity-80">
                <li>Stop loss is wide relative to target.</li>
                <li>Choppy action likely.</li>
                <li>High risk of VWAP chop.</li>
              </ul>
            </div>
          )}

          {status === 'good' && (
            <div className="text-emerald-200 text-sm">
              <strong className="block mb-1 text-emerald-400">
                Status: PRIME SETUP (Large Moat)
              </strong>
              Significant extension from equilibrium.
              <div className="mt-2 text-xs bg-emerald-950/50 p-2 rounded border border-emerald-500/20">
                <div className="flex justify-between mb-1">
                  <span>Potential Reward:</span>
                  <span className="text-emerald-400 font-mono">
                    {(distance / 2).toFixed(0)} pts
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Risk (Stop):</span>
                  <span className="text-rose-400 font-mono">Tight</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Direction Indicators */}
        <div className="absolute right-4 bottom-4 flex flex-col gap-2 text-[10px] text-slate-500 font-mono text-right pointer-events-none">
          <div
            className={cn(
              'transition-opacity',
              direction === 'long'
                ? 'opacity-100 text-emerald-400'
                : 'opacity-30'
            )}
          >
            SETUP: VWAP BOUNCE (LONG) ▲
          </div>
          <div
            className={cn(
              'transition-opacity',
              direction === 'short' ? 'opacity-100 text-rose-400' : 'opacity-30'
            )}
          >
            SETUP: VWAP REJECTION (SHORT) ▼
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoatVisualizer;
