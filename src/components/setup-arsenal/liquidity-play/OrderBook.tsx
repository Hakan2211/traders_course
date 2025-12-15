
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrderRow } from './types';

interface OrderBookProps {
  asks: OrderRow[];
  currentPrice: number;
  isSimulating: boolean;
}

export const OrderBook: React.FC<OrderBookProps> = ({
  asks,
  currentPrice,
  isSimulating,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to keep the action near the bottom/middle
  useEffect(() => {
    if (isSimulating && scrollRef.current) {
      // Find the first unfilled order
      const firstUnfilled = asks.find((a) => !a.filled);
      if (firstUnfilled) {
        // Logic to keep view centered could go here,
        // but for this simple list, standard rendering is usually enough
      }
    }
  }, [asks, isSimulating]);

  return (
    <div className="flex flex-col h-full bg-slate-950 border-x border-slate-800 font-mono text-xs md:text-sm select-none">
      {/* Header */}
      <div className="flex justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
        <span>Price</span>
        <span>Shares</span>
      </div>

      {/* Rows Container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto relative p-2 space-y-0.5"
      >
        <AnimatePresence>
          {[...asks].reverse().map((ask) => {
            const isFilled = ask.filled;
            const isPartial = ask.partialFill && ask.partialFill > 0;

            return (
              <motion.div
                key={ask.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{
                  opacity: isFilled ? 0.3 : 1,
                  x: 0,
                  backgroundColor: isFilled
                    ? 'rgba(239, 68, 68, 0.1)' // Faint red when filled (eaten)
                    : isPartial
                    ? 'rgba(234, 179, 8, 0.2)' // Yellow tint for partial
                    : 'transparent',
                }}
                className={`
                  flex justify-between items-center px-3 py-1.5 rounded cursor-default transition-colors
                  ${isFilled ? 'line-through text-slate-600' : 'text-slate-200'}
                  hover:bg-slate-800/50
                `}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`${
                      isFilled ? 'text-slate-600' : 'text-red-400'
                    } font-bold w-16`}
                  >
                    ${ask.price.toFixed(2)}
                  </span>
                  {/* Visual bar for volume */}
                  {!isFilled && (
                    <div
                      className="h-1.5 bg-red-500/30 rounded-sm"
                      style={{ width: `${Math.min(ask.shares / 50, 100)}px` }}
                    />
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {isPartial && !isFilled && (
                    <span className="text-[10px] text-yellow-500 font-bold">
                      PARTIAL
                    </span>
                  )}
                  <span
                    className={isFilled ? 'text-slate-600' : 'text-slate-300'}
                  >
                    {ask.shares.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Spread / Current Price Indicator */}
        <div className="sticky bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-700 p-3 flex justify-between items-center z-10">
          <span className="text-xs text-slate-400 uppercase">
            Current Price
          </span>
          <motion.span
            key={currentPrice}
            initial={{ scale: 1.2, color: '#fff' }}
            animate={{ scale: 1, color: '#22c55e' }}
            className="text-xl font-bold font-mono text-green-400"
          >
            ${currentPrice.toFixed(2)}
          </motion.span>
        </div>
      </div>
    </div>
  );
};
