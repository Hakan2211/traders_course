
import React, { useState, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Bar,
  ComposedChart,
  ReferenceLine,
} from 'recharts';

// --- Types ---

export interface MarketDataPoint {
  time: string; // HH:MM
  rawTime: number; // Minutes from 7:00 AM
  price: number;
  volume: number;
}

export enum SetupType {
  ORB = 'ORB',
  GAP_SHORT = 'GAP_SHORT',
}

export interface ChartConfig {
  color: string;
  volumeColor: string;
  title: string;
  description: string;
  setupType: SetupType;
}

// --- Data Generation Helpers ---

const START_HOUR = 7;
const TOTAL_MINUTES = 150; // 7:00 to 9:30 is 2.5 hours = 150 min

const formatTime = (rawMinutes: number): string => {
  const hours = Math.floor(rawMinutes / 60) + START_HOUR;
  const mins = rawMinutes % 60;
  return `${hours}:${mins.toString().padStart(2, '0')}`;
};

const generateOrbData = (): MarketDataPoint[] => {
  const data: MarketDataPoint[] = [];
  let currentPrice = 100.0;

  for (let i = 0; i <= TOTAL_MINUTES; i++) {
    let priceChange = 0;
    let volume = 0;

    // Phase 1: Initial Spike (0-30 mins)
    if (i < 30) {
      priceChange = Math.random() * 0.4 + 0.1; // Strong upward trend
      volume = 50000 + Math.random() * 50000;
    }
    // Phase 2: Consolidation (30-150 mins)
    else {
      // Choppy sideways movement
      priceChange = Math.random() * 0.2 - 0.1;
      // Volume decays significantly
      const decayFactor = Math.max(0.1, 1 - (i - 30) / 120);
      volume = (10000 + Math.random() * 10000) * decayFactor;
    }

    currentPrice += priceChange;

    data.push({
      time: formatTime(i),
      rawTime: i,
      price: Number(currentPrice.toFixed(2)),
      volume: Math.floor(volume),
    });
  }
  return data;
};

const generateGapShortData = (): MarketDataPoint[] => {
  const data: MarketDataPoint[] = [];
  let currentPrice = 100.0;

  for (let i = 0; i <= TOTAL_MINUTES; i++) {
    let priceChange = 0;
    let volume = 0;

    // Continuous grind upward without real consolidation
    // The "Stair Step" grind
    const isResting = i % 20 > 15; // Brief fake rests

    if (isResting) {
      priceChange = Math.random() * 0.1 - 0.05;
    } else {
      priceChange = Math.random() * 0.3 + 0.05;
    }

    // Volume Divergence: Price goes up, Volume goes down generally over time
    // High initial volume
    const progress = i / TOTAL_MINUTES;
    const baseVolume = 80000 * (1 - progress * 0.8); // Drops to 20% by end
    volume = baseVolume + Math.random() * 10000;

    // Occasional volume spikes to trap shorts
    if (i % 45 === 0) volume += 30000;

    currentPrice += priceChange;

    data.push({
      time: formatTime(i),
      rawTime: i,
      price: Number(currentPrice.toFixed(2)),
      volume: Math.floor(volume),
    });
  }
  return data;
};

// --- Components ---

interface ScrubberProps {
  progress: number; // 0 to 150
  max: number;
  onChange: (value: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
}

const Scrubber: React.FC<ScrubberProps> = ({
  progress,
  max,
  onChange,
  isPlaying,
  onTogglePlay,
  onReset,
}) => {
  // Format the current time based on progress (raw minutes from 7:00)
  const currentHour = Math.floor(progress / 60) + 7;
  const currentMinute = progress % 60;
  const timeString = `${currentHour}:${currentMinute
    .toString()
    .padStart(2, '0')} AM`;

  return (
    <div className="bg-gray-900 border-t border-gray-800 p-6 shadow-2xl z-20 sticky bottom-0 rounded-b-xl">
      <div className="max-w-6xl mx-auto flex flex-col gap-4">
        {/* Time Display & Message */}
        <div className="flex justify-between items-end mb-2">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Pre-Market Time
            </span>
            <span className="text-3xl font-mono font-bold text-white tabular-nums">
              {timeString}
            </span>
          </div>
          <div className="text-right pb-1">
            <span
              className={`text-sm font-medium px-3 py-1 rounded-full ${
                progress === max
                  ? 'bg-blue-600 text-white animate-pulse'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {progress === 0
                ? 'Market Closed (7:00 AM)'
                : progress === max
                ? 'MARKET OPEN (9:30 AM)'
                : 'Pre-Market Session'}
            </span>
          </div>
        </div>

        {/* Controls Container */}
        <div className="flex items-center gap-4">
          <button
            onClick={onTogglePlay}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors focus:ring-2 focus:ring-blue-400 focus:outline-none"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" className="ml-1" />
            )}
          </button>
          <button
            onClick={onReset}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors focus:outline-none"
            aria-label="Reset"
          >
            <RotateCcw size={18} />
          </button>
          <div className="relative flex-1 h-12 flex items-center group">
            {/* Custom Range Slider Track Background */}
            <div className="absolute w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-900 to-blue-500 transition-all duration-75 ease-linear"
                style={{ width: `${(progress / max) * 100}%` }}
              />
            </div>

            {/* The Actual Input */}
            <input
              type="range"
              min="0"
              max={max}
              value={progress}
              onChange={(e) => onChange(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30 m-0"
              step="1"
            />

            {/* Custom Thumb (Visual Only - follows progress) */}
            <div
              className="absolute h-6 w-6 bg-white rounded-full shadow-lg border-2 border-blue-500 pointer-events-none transition-all duration-75 ease-linear z-20"
              style={{ left: `calc(${(progress / max) * 100}% - 12px)` }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Drag to scrub
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-500 font-mono mt-[-8px] px-1">
          <span>7:00 AM</span>
          <span>8:15 AM</span>
          <span>9:30 AM</span>
        </div>
      </div>
    </div>
  );
};

interface MarketChartProps {
  data: MarketDataPoint[];
  fullDomainY: [number, number]; // [min, max] to keep axis stable
  maxVolume: number;
  type: SetupType;
  isActive: boolean;
  isComplete: boolean;
}

const MarketChart: React.FC<MarketChartProps> = ({
  data,
  fullDomainY,
  maxVolume,
  type,
  isActive,
  isComplete,
}) => {
  const isOrb = type === SetupType.ORB;
  const mainColor = isOrb ? '#10b981' : '#ef4444'; // Emerald vs Red
  const gradientId = `colorGradient-${type}`;

  return (
    <div
      className={`relative h-full w-full flex flex-col rounded-xl border transition-all duration-300 ${
        isActive
          ? 'border-gray-700 bg-gray-900 shadow-lg'
          : 'border-gray-800 bg-gray-950 opacity-60'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <div>
          <h3
            className={`font-bold text-lg ${
              isOrb ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {isOrb ? 'The ORB Structure' : 'The Gap Up Short'}
          </h3>
          <p className="text-xs text-gray-400">
            {isOrb ? 'Compression & Structure' : 'Parabolic & Divergence'}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-gray-500">Current Price</span>
          <div className="font-mono font-bold text-white">
            ${data.length > 0 ? data[data.length - 1].price.toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 min-h-[300px] p-2 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={mainColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={mainColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              stroke="#6b7280"
              fontSize={10}
              tickMargin={10}
              interval={15}
            />
            {/* Price Y Axis (Left) */}
            <YAxis yAxisId="left" domain={fullDomainY} hide />
            {/* Volume Y Axis (Right) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, maxVolume * 3]} // Scale volume down visually
              hide
            />

            <Area
              yAxisId="left"
              type="monotone"
              dataKey="price"
              stroke={mainColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              isAnimationActive={false} // Crucial for smooth scrubbing
            />

            <Bar
              yAxisId="right"
              dataKey="volume"
              fill={isOrb ? '#34d399' : '#f87171'}
              opacity={0.4}
              isAnimationActive={false}
              barSize={3}
            />

            {/* Reference Line for 9:30 AM if close */}
            {data.length > 0 && data[data.length - 1].rawTime >= 148 && (
              <ReferenceLine
                x="9:30"
                stroke="#fbbf24"
                strokeDasharray="3 3"
                label="OPEN"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>

        {/* Overlay Message when Complete */}
        {isComplete && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg transition-opacity duration-500 z-10">
            <div
              className={`p-6 rounded-xl border-2 shadow-2xl transform scale-100 animate-in fade-in zoom-in duration-300 ${
                isOrb
                  ? 'border-emerald-500 bg-emerald-950/80'
                  : 'border-red-500 bg-red-950/80'
              }`}
            >
              <h4
                className={`text-xl font-bold mb-2 ${
                  isOrb ? 'text-emerald-300' : 'text-red-300'
                }`}
              >
                {isOrb ? 'Structure Built' : 'Structure Loose'}
              </h4>
              <p className="text-sm text-gray-200 leading-relaxed max-w-[200px]">
                {isOrb
                  ? 'Price rested. Volume dried up. Energy is compressed and ready for expansion.'
                  : 'Parabolic move. Volume faded while price rose (divergence). Setup is exhausted.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Container ---

export const OrbGapSimulator: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Generate stable data once on mount
  const orbFullData = useMemo(() => generateOrbData(), []);
  const gapFullData = useMemo(() => generateGapShortData(), []);

  // Calculate domains for stable axis
  const orbYDomain = useMemo(() => {
    const prices = orbFullData.map((d) => d.price);
    return [Math.min(...prices) * 0.99, Math.max(...prices) * 1.01] as [
      number,
      number
    ];
  }, [orbFullData]);

  const gapYDomain = useMemo(() => {
    const prices = gapFullData.map((d) => d.price);
    return [Math.min(...prices) * 0.99, Math.max(...prices) * 1.01] as [
      number,
      number
    ];
  }, [gapFullData]);

  const maxVolume = useMemo(() => {
    const allVols = [...orbFullData, ...gapFullData].map((d) => d.volume);
    return Math.max(...allVols);
  }, [orbFullData, gapFullData]);

  // Sliced data based on progress
  const currentOrbData = useMemo(
    () => orbFullData.slice(0, progress + 1),
    [orbFullData, progress]
  );
  const currentGapData = useMemo(
    () => gapFullData.slice(0, progress + 1),
    [gapFullData, progress]
  );

  // Better loop with speed control
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= TOTAL_MINUTES) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 50); // 50ms per minute step = 7.5 seconds for full 150 mins
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="w-full bg-gray-950 rounded-xl overflow-hidden border border-gray-800 my-8">
      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MarketChart
          data={currentOrbData}
          fullDomainY={orbYDomain}
          maxVolume={maxVolume}
          type={SetupType.ORB}
          isActive={true}
          isComplete={progress === TOTAL_MINUTES}
        />

        <MarketChart
          data={currentGapData}
          fullDomainY={gapYDomain}
          maxVolume={maxVolume}
          type={SetupType.GAP_SHORT}
          isActive={true}
          isComplete={progress === TOTAL_MINUTES}
        />
      </div>

      <Scrubber
        progress={progress}
        max={TOTAL_MINUTES}
        onChange={(val) => {
          setIsPlaying(false);
          setProgress(val);
        }}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onReset={() => {
          setIsPlaying(false);
          setProgress(0);
        }}
      />
    </div>
  );
};

export default OrbGapSimulator;
