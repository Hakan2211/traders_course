
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Clock,
  Activity,
  Box,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import {
  SETUPS,
  TIME_SEGMENTS,
  START_OF_DAY,
  END_OF_DAY,
  timeToMin,
} from './constants';
import { Setup } from './types';

const formatTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  const displayM = m < 10 ? `0${m}` : m;
  return `${displayH}:${displayM} ${ampm}`;
};

export const TimelineScrubber: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<number>(timeToMin('09:15'));
  const [isPlaying, setIsPlaying] = useState(false);

  // Refs to manage animation loop and timeouts securely
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestRef = useRef<number | null>(null);

  // Clean up function to stop all animation immediately
  const stopAnimation = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  useEffect(() => {
    const animate = () => {
      setCurrentTime((prev) => {
        const next = prev + 1;
        if (next >= END_OF_DAY) {
          setIsPlaying(false);
          return START_OF_DAY;
        }
        return next;
      });

      // Recursive loop with delay for readable speed
      timeoutRef.current = setTimeout(() => {
        requestRef.current = requestAnimationFrame(animate);
      }, 50); // 50ms delay
    };

    if (isPlaying) {
      animate();
    } else {
      stopAnimation();
    }

    return () => stopAnimation();
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  // Separate interaction start to ensure clean state transition
  const handleInteractionStart = () => {
    setIsPlaying(false);
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseInt(e.target.value, 10);
    if (!isNaN(newVal)) {
      setCurrentTime(newVal);
    }
  };

  // Filter active setups
  const activeSetups = useMemo(() => {
    return SETUPS.filter(
      (setup) => currentTime >= setup.startTime && currentTime <= setup.endTime
    ).sort((a, b) => a.type.localeCompare(b.type));
  }, [currentTime]);

  const totalMinutes = END_OF_DAY - START_OF_DAY;
  const currentPercentage = ((currentTime - START_OF_DAY) / totalMinutes) * 100;

  return (
    <div className="w-full bg-trade-card border border-trade-border rounded-xl overflow-hidden shadow-2xl mt-8 mb-12">
      {/* Header */}
      <div className="p-6 border-b border-trade-border flex justify-between items-center bg-gradient-to-r from-trade-bg to-trade-card">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-trade-accent" />
            Active Setup Scrubber
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Drag the timeline to see which setups are active right now.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-gray-400 uppercase tracking-wider">
              Market Time
            </div>
            <div className="text-2xl font-mono font-bold text-trade-warning tabular-nums">
              {formatTime(currentTime)}
            </div>
          </div>
          <button
            onClick={togglePlay}
            className={`p-3 rounded-full transition-all ${
              isPlaying
                ? 'bg-trade-danger text-white'
                : 'bg-trade-success text-black hover:scale-105'
            }`}
            title={isPlaying ? 'Pause Timeline' : 'Play Timeline'}
          >
            {isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" />
            )}
          </button>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="relative h-24 bg-[#0a0a0a] w-full select-none group">
        {/* Time Segments Backgrounds */}
        <div className="absolute inset-0 flex h-full w-full pointer-events-none">
          {TIME_SEGMENTS.map((segment) => {
            const widthPct =
              ((segment.end - segment.start) / totalMinutes) * 100;
            const leftPct =
              ((segment.start - START_OF_DAY) / totalMinutes) * 100;
            return (
              <div
                key={segment.name}
                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                className={`absolute h-full border-r ${segment.color} flex flex-col justify-end pb-2 items-center transition-colors hover:bg-opacity-50`}
              >
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest bg-black/40 px-1 rounded">
                  {segment.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Setups Overlay Bars */}
        <div className="absolute top-2 left-0 w-full h-8 opacity-20 pointer-events-none">
          {SETUPS.map((setup) => {
            const startPct =
              ((setup.startTime - START_OF_DAY) / totalMinutes) * 100;
            const widthPct =
              ((setup.endTime - setup.startTime) / totalMinutes) * 100;
            const color =
              setup.type === 'Long'
                ? 'bg-green-500'
                : setup.type === 'Short'
                ? 'bg-red-500'
                : 'bg-blue-500';
            return (
              <div
                key={setup.id}
                className={`absolute h-1 rounded-full ${color} mb-[1px]`}
                style={{
                  left: `${startPct}%`,
                  width: `${widthPct}%`,
                  top: `${(setup.id % 5) * 4}px`,
                }}
              />
            );
          })}
        </div>

        {/* Playhead Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-20 shadow-[0_0_10px_rgba(250,204,21,0.5)] pointer-events-none transition-transform duration-75"
          style={{ left: `${currentPercentage}%` }}
        >
          <div className="absolute -top-1 -translate-x-1/2 w-3 h-3 bg-yellow-400 rotate-45 transform rounded-sm"></div>
          <div className="absolute -bottom-1 -translate-x-1/2 w-3 h-3 bg-yellow-400 rotate-45 transform rounded-sm"></div>
        </div>

        {/* Interaction Layer (Input Range) */}
        <input
          type="range"
          min={START_OF_DAY}
          max={END_OF_DAY}
          step={1}
          value={currentTime}
          onMouseDown={handleInteractionStart}
          onTouchStart={handleInteractionStart}
          onChange={handleScrubberChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 focus:outline-none"
        />
      </div>

      {/* Active Setups Grid */}
      <div className="p-6 bg-trade-bg min-h-[300px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                activeSetups.length > 0
                  ? 'bg-green-500 animate-pulse'
                  : 'bg-gray-600'
              }`}
            ></span>
            Available Setups ({activeSetups.length})
          </h3>
        </div>

        {activeSetups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500 border border-dashed border-gray-700 rounded-lg bg-trade-bg/50">
            <Clock className="w-10 h-10 mb-2 opacity-50" />
            <p>
              No high-probability setups active at {formatTime(currentTime)}
            </p>
            <p className="text-xs mt-1">
              Drag the scrubber to find setup windows.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSetups.map((setup) => (
              <SetupCard key={setup.id} setup={setup} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SetupCard: React.FC<{ setup: Setup }> = ({ setup }) => {
  const isLong = setup.type === 'Long';
  const isShort = setup.type === 'Short';

  const borderColor = isLong
    ? 'border-green-500/30 hover:border-green-500'
    : isShort
    ? 'border-red-500/30 hover:border-red-500'
    : 'border-blue-500/30 hover:border-blue-500';

  const iconColor = isLong
    ? 'text-green-500'
    : isShort
    ? 'text-red-500'
    : 'text-blue-500';
  const BgColor = isLong
    ? 'bg-green-500/5'
    : isShort
    ? 'bg-red-500/5'
    : 'bg-blue-500/5';

  return (
    <div
      className={`border ${borderColor} ${BgColor} p-4 rounded-lg transition-all duration-300 animate-in fade-in zoom-in-95`}
    >
      <div className="flex justify-between items-start mb-2">
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-current ${iconColor}`}
        >
          {setup.type}
        </span>
        <span
          className={`text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700`}
        >
          {setup.risk} Risk
        </span>
      </div>

      <h4 className="font-bold text-gray-100 flex items-center gap-2 mb-1">
        {isLong ? (
          <TrendingUp size={16} className="text-green-500" />
        ) : isShort ? (
          <TrendingDown size={16} className="text-red-500" />
        ) : (
          <Box size={16} className="text-blue-500" />
        )}
        {setup.name}
      </h4>

      <p className="text-xs text-gray-400 leading-relaxed mb-3 h-8 overflow-hidden line-clamp-2">
        {setup.description}
      </p>

      <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-700/50 pt-2 mt-auto">
        <span className="truncate max-w-[50%]">{setup.category}</span>
        <span className="font-mono text-[10px]">
          {formatTime(setup.startTime)} - {formatTime(setup.endTime)}
        </span>
      </div>
    </div>
  );
};
