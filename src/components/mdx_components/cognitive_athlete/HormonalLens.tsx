
import React, { useState } from 'react';
import {
  AlertTriangle,
  Rocket,
  Skull,
  TrendingUp,
  Eye,
  Zap,
  AlertOctagon,
  Brain,
} from 'lucide-react';
import CandlestickChart from './CandlestickChart';
import { CandleData } from './types';

// Mock Data Generation
const generateData = (): CandleData[] => {
  let price = 100;
  const data: CandleData[] = [];
  for (let i = 0; i < 20; i++) {
    const move = (Math.random() - 0.5) * 4;
    const open = price;
    const close = price + move;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;
    data.push({ id: i, open, close, high, low });
    price = close;
  }
  return data;
};

const CHART_DATA = generateData();
const SUPPORT_LEVEL = 95;
const RESISTANCE_LEVEL = 105;

const HormonalLens: React.FC = () => {
  // 0 = Max Cortisol, 50 = Neutral, 100 = Max Testosterone
  const [hormoneLevel, setHormoneLevel] = useState(50);

  // Derived styling values
  const cortisolOpacity = hormoneLevel < 50 ? (50 - hormoneLevel) / 50 : 0;
  const testosteroneOpacity = hormoneLevel > 50 ? (hormoneLevel - 50) / 50 : 0;

  // Calculate blur and saturation
  // Cortisol: High Blur, Low Saturation
  // Testosterone: No Blur, High Saturation, High Contrast
  const blurAmount = hormoneLevel < 50 ? (50 - hormoneLevel) / 10 : 0;
  const saturation =
    hormoneLevel < 50
      ? 1 - cortisolOpacity * 0.8
      : 1 + testosteroneOpacity * 1.5;
  const contrast = hormoneLevel > 50 ? 1 + testosteroneOpacity * 0.3 : 1;

  // Vignette effect for Cortisol (Tunnel Vision)
  const vignetteOpacity = cortisolOpacity * 0.8;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHormoneLevel(Number(e.target.value));
  };

  return (
    <div className="my-12 w-full max-w-4xl mx-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-slate-200">
              The Hormonal Lens Simulator
            </h3>
          </div>
          <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">
            Module 3: Biological Filters
          </div>
        </div>

        {/* Viewport */}
        <div className="relative h-[400px] w-full bg-slate-950 overflow-hidden group">
          {/* Base Chart Layer - Always Rendered */}
          <div
            className="absolute inset-0 p-8 transition-all duration-100 ease-out"
            style={{
              filter: `blur(${blurAmount}px) saturate(${saturation}) contrast(${contrast})`,
            }}
          >
            <CandlestickChart
              data={CHART_DATA}
              supportLevel={SUPPORT_LEVEL}
              resistanceLevel={RESISTANCE_LEVEL}
            />
          </div>

          {/* CORTISOL OVERLAY (Left Side Logic) */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{ opacity: cortisolOpacity }}
          >
            {/* Tunnel Vision Vignette */}
            <div
              className="absolute inset-0 z-10"
              style={{
                background: `radial-gradient(circle, transparent 40%, rgba(0,0,0,${
                  vignetteOpacity * 0.9
                }) 90%)`,
              }}
            />

            {/* Dashed Weak Support Lines */}
            <div className="absolute top-[65%] left-0 w-full h-[2px] border-b-2 border-red-500/50 border-dashed animate-pulse" />

            {/* Fear Annotations */}
            <div className="absolute top-[68%] left-[10%] text-red-500 font-bold text-sm bg-black/80 px-2 py-1 rounded flex items-center gap-1 border border-red-900/50">
              <Skull className="w-4 h-4" /> Support Failing?
            </div>
            <div className="absolute top-[30%] right-[20%] text-red-400 text-xs bg-black/80 px-2 py-1 rounded border border-red-900/50 opacity-80">
              <AlertOctagon className="w-3 h-3 inline mr-1" />
              Volume Suspicious
            </div>
            <div className="absolute bottom-[10%] left-[40%] text-red-500 font-mono text-lg font-bold tracking-widest uppercase animate-pulse">
              Warning: High Risk
            </div>
          </div>

          {/* TESTOSTERONE OVERLAY (Right Side Logic) */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{ opacity: testosteroneOpacity }}
          >
            {/* Bloom / Glow Effect */}
            <div className="absolute inset-0 bg-green-500/5 mix-blend-overlay" />

            {/* "Invisible" Resistance (or clearly broken) */}
            <div className="absolute top-[35%] left-0 w-full h-[1px] bg-green-500/30" />

            {/* Greed Annotations */}
            <div className="absolute top-[28%] right-[10%] text-green-400 font-bold text-sm bg-black/60 px-2 py-1 rounded flex items-center gap-1 border border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.4)]">
              <Rocket className="w-4 h-4" /> Blue Sky Breakout!
            </div>
            <div className="absolute bottom-[40%] left-[20%] text-green-300 text-xs bg-black/60 px-2 py-1 rounded border border-green-500/30">
              <Zap className="w-3 h-3 inline mr-1" />
              Momentum Building
            </div>
            <div className="absolute top-[10%] left-[50%] -translate-x-1/2 text-green-400 font-mono text-lg font-bold tracking-widest uppercase animate-pulse shadow-green-500 drop-shadow-lg">
              Alpha Signal Detected
            </div>
          </div>

          {/* Neutral Overlay (Optional guide lines that fade out) */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              opacity: 1 - Math.max(cortisolOpacity, testosteroneOpacity),
            }}
          >
            <div className="absolute top-[65%] left-0 w-full h-[1px] bg-slate-600" />
            <div className="absolute top-[65%] right-4 text-slate-500 text-xs">
              Major Support
            </div>

            <div className="absolute top-[35%] left-0 w-full h-[1px] bg-slate-600" />
            <div className="absolute top-[35%] right-4 text-slate-500 text-xs">
              Key Resistance
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 bg-slate-900 border-t border-slate-700">
          <div className="flex justify-between mb-2 text-sm font-bold uppercase tracking-wider">
            <span
              className={`${
                hormoneLevel < 40
                  ? 'text-red-500 animate-pulse'
                  : 'text-slate-500'
              }`}
            >
              <AlertTriangle className="inline w-4 h-4 mr-1 mb-1" />
              High Cortisol
            </span>
            <span className="text-slate-400">Balanced</span>
            <span
              className={`${
                hormoneLevel > 60
                  ? 'text-green-500 animate-pulse'
                  : 'text-slate-500'
              }`}
            >
              High Testosterone
              <TrendingUp className="inline w-4 h-4 ml-1 mb-1" />
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={hormoneLevel}
            onChange={handleSliderChange}
            className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            style={{
              background: `linear-gradient(to right, #ef4444 0%, #64748b 50%, #22c55e 100%)`,
            }}
          />

          <div className="mt-4 text-center min-h-[3rem]">
            {hormoneLevel < 30 && (
              <p className="text-red-400 text-sm">
                <span className="font-bold block">The Cortisol Filter:</span>
                "Tunnel vision. Threat detection amplified. Every dip looks like
                a crash. You hesitate."
              </p>
            )}
            {hormoneLevel > 70 && (
              <p className="text-green-400 text-sm">
                <span className="font-bold block">
                  The Testosterone Filter:
                </span>
                "Invincibility. Risk blindness. Resistance lines are invisible.
                You double down."
              </p>
            )}
            {hormoneLevel >= 30 && hormoneLevel <= 70 && (
              <p className="text-slate-400 text-sm">
                <span className="font-bold block">Balanced State:</span>
                "Objective reality. You see price action for what it
                is—probabilities, not promises or threats."
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HormonalLens;
