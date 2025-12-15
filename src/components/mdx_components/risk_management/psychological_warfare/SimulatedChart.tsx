
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface SimulatedChartProps {
  phase: string;
  stressLevel: number;
}

const SimulatedChart: React.FC<SimulatedChartProps> = ({
  phase,
  stressLevel,
}) => {
  // Generate initial random walk data
  const generateInitialData = () => {
    const points = [];
    let price = 1.1;
    for (let i = 0; i < 50; i++) {
      price += (Math.random() - 0.5) * 0.001;
      points.push(price);
    }
    return points;
  };

  const [data, setData] = useState<number[]>(generateInitialData());
  const containerRef = useRef<HTMLDivElement>(null);

  // Effect to simulate live price movement based on phase
  useEffect(() => {
    let interval: any;

    const tick = () => {
      setData((prev) => {
        const last = prev[prev.length - 1];
        let change = (Math.random() - 0.5) * 0.0005;

        // Bias the price movement based on phase to ensure losses in simulation
        if (phase.includes('TRADE') || phase.includes('SPIRAL')) {
          // Simulate market moving against user violently
          change = -Math.abs(change) * 1.5;
          if (stressLevel > 50) change *= 3; // Crash faster in rage mode
        }

        const newPrice = last + change;
        // Keep array size constant
        const newData = [...prev.slice(1), newPrice];
        return newData;
      });
    };

    if (phase === 'SPIRAL_ACTIVE') {
      interval = setInterval(tick, 100); // Fast crash
    } else if (phase.includes('TRADE')) {
      interval = setInterval(tick, 500); // Normal trade speed
    } else {
      interval = setInterval(tick, 1000); // Idle market
    }

    return () => clearInterval(interval);
  }, [phase, stressLevel]);

  // SVG Calculation
  const width = containerRef.current?.clientWidth || 600;
  const height = 300;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 0.001;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d - min) / range) * (height - 40) - 20; // Padding
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `${points} ${width},${height} 0,${height}`;

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-zinc-900/50 rounded-lg border border-zinc-800"
    >
      {/* Grid Lines */}
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 pointer-events-none opacity-20">
        {[...Array(6)].map((_, i) => (
          <div key={`v-${i}`} className="border-r border-zinc-600 h-full" />
        ))}
        {[...Array(4)].map((_, i) => (
          <div key={`h-${i}`} className="border-b border-zinc-600 w-full" />
        ))}
      </div>

      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
            <stop
              offset="0%"
              stopColor={stressLevel > 50 ? '#ef4444' : '#3b82f6'}
              stopOpacity="0.3"
            />
            <stop
              offset="100%"
              stopColor={stressLevel > 50 ? '#ef4444' : '#3b82f6'}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <motion.path
          d={`M ${areaPoints} Z`}
          fill="url(#gradient)"
          stroke="none"
        />

        {/* Line */}
        <motion.polyline
          fill="none"
          stroke={stressLevel > 50 ? '#ef4444' : '#3b82f6'}
          strokeWidth="2"
          points={points}
          initial={false}
          animate={{ d: `M ${points}` }}
          transition={{ type: 'tween', ease: 'linear', duration: 0.1 }}
        />
      </svg>

      {/* Current Price Tag */}
      <div className="absolute right-2 top-2 font-mono text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-300">
        {data[data.length - 1].toFixed(5)}
      </div>

      {/* Stress Overlay on Chart */}
      {stressLevel > 60 && (
        <motion.div
          className="absolute inset-0 bg-red-900/20 mix-blend-overlay"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </div>
  );
};

export default SimulatedChart;
