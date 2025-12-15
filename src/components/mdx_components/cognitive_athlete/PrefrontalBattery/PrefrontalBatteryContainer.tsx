
import React, { useState } from 'react';
import { PrefrontalBattery } from './PrefrontalBattery';
import { BatteryState } from './types';
import { Slider } from '@/components/ui/slider';
import { Clock, AlertTriangle, Zap, Skull } from 'lucide-react';

const TIME_POINTS = [
  {
    hour: 6,
    level: 100,
    color: '#10b981',
    label: 'Waking Up',
    desc: 'Full capacity',
  },
  {
    hour: 9.5,
    level: 85,
    color: '#10b981',
    label: 'Market Open',
    desc: 'Peak performance',
  },
  {
    hour: 11,
    level: 65,
    color: '#eab308',
    label: 'Mid-Morning',
    desc: 'Subtle decline',
  },
  {
    hour: 12.5,
    level: 45,
    color: '#f59e0b',
    label: 'Lunch Gap',
    desc: 'Insulin spike risk',
  },
  {
    hour: 13.5,
    level: 30,
    color: '#f97316',
    label: 'The Danger Zone',
    desc: 'Impulse control fails',
  },
  {
    hour: 15,
    level: 15,
    color: '#ef4444',
    label: 'Afternoon Slump',
    desc: 'Cognitive fumes',
  },
  {
    hour: 16,
    level: 5,
    color: '#dc2626',
    label: 'Market Close',
    desc: 'Zombie mode',
  },
];

export const PrefrontalBatteryContainer: React.FC = () => {
  const [hour, setHour] = useState(6);

  // Interpolate state based on hour
  const getCurrentState = (currentHour: number): BatteryState => {
    // Find surrounding points
    const nextIndex = TIME_POINTS.findIndex((p) => p.hour >= currentHour);
    const prevIndex = nextIndex > 0 ? nextIndex - 1 : 0;

    const prev = TIME_POINTS[prevIndex];
    const next =
      TIME_POINTS[nextIndex === -1 ? TIME_POINTS.length - 1 : nextIndex];

    if (prev.hour === next.hour) {
      return {
        hour: currentHour,
        level: prev.level,
        color: prev.color,
        label: prev.label,
        isGlitching: prev.level < 10,
      };
    }

    const progress = (currentHour - prev.hour) / (next.hour - prev.hour);
    const level = prev.level - (prev.level - next.level) * progress;

    // Color interpolation could be better but sticking to nearest/thresholds for simplicity or simple switch
    let color = prev.color;
    if (progress > 0.5) color = next.color;

    return {
      hour: currentHour,
      level,
      color,
      label: progress < 0.5 ? prev.label : next.label,
      isGlitching: level < 15,
    };
  };

  const currentState = getCurrentState(hour);
  const currentPoint =
    TIME_POINTS.find((p) => Math.abs(p.hour - hour) < 0.5) ||
    TIME_POINTS.reduce((prev, curr) =>
      Math.abs(curr.hour - hour) < Math.abs(prev.hour - hour) ? curr : prev
    );

  const formatTime = (h: number) => {
    const whole = Math.floor(h);
    const minutes = Math.floor((h - whole) * 60);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h > 12 ? h - 12 : h;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto p-6 bg-slate-950 rounded-2xl border border-slate-800">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* 3D Visualization */}
        <div className="w-full md:w-1/2">
          <PrefrontalBattery batteryState={currentState} />
        </div>

        {/* Controls */}
        <div className="w-full md:w-1/2 space-y-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Clock className="text-blue-400" />
              {formatTime(hour)}
            </h3>
            <p className="text-slate-400 text-lg">{currentState.label}</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-xs text-slate-500 uppercase tracking-wider">
              <span>Morning</span>
              <span>Noon</span>
              <span>Close</span>
            </div>
            <Slider
              defaultValue={[6]}
              min={6}
              max={17}
              step={0.1}
              value={[hour]}
              onValueChange={(v) => setHour(v[0])}
              className="w-full"
            />
          </div>

          <div
            className={`p-4 rounded-xl border ${
              currentState.level < 20
                ? 'bg-red-950/30 border-red-500/50'
                : 'bg-slate-900 border-slate-800'
            } transition-colors duration-300`}
          >
            <div className="flex items-start gap-3">
              {currentState.level > 50 ? (
                <Zap className="text-yellow-400 shrink-0" />
              ) : currentState.level > 20 ? (
                <AlertTriangle className="text-orange-400 shrink-0" />
              ) : (
                <Skull className="text-red-500 shrink-0 animate-pulse" />
              )}

              <div>
                <h4
                  className={`font-bold mb-1 ${
                    currentState.level < 20 ? 'text-red-400' : 'text-slate-200'
                  }`}
                >
                  Cognitive Status: {Math.round(currentState.level)}%
                </h4>
                <p className="text-sm text-slate-400">{currentPoint.desc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
