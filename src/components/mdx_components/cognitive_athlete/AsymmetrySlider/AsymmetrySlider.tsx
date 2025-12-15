
import React, { useState, useEffect } from 'react';

const AsymmetrySlider: React.FC = () => {
  const [value, setValue] = useState(0); // Range: -1000 to 1000

  // Constants for Prospect Theory Curve
  // V(x) = x^alpha for x >= 0
  // V(x) = -lambda * (-x)^beta for x < 0
  const alpha = 0.8;
  const beta = 0.8;
  const lambda = 2.5;

  // Scale factors for visualization
  const maxInput = 1000;

  // Calculate Emotional Value directly (derived state)
  const calculateEmotionalValue = (val: number) => {
    if (val >= 0) {
      // Normalize input 0-1
      const norm = val / maxInput;
      // Diminishing returns curve
      return Math.pow(norm, alpha) * 100; // 0 to 100 units
    } else {
      const norm = Math.abs(val) / maxInput;
      // Steeper loss curve
      return -lambda * Math.pow(norm, beta) * 100; // 0 to -250 units
    }
  };

  const emotionalValue = calculateEmotionalValue(value);

  // Generate SVG Path for the curve
  const generateCurvePath = (width: number, height: number) => {
    const points = [];
    const steps = 100;
    const midX = width / 2;
    const midY = height / 2;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps; // 0 to 1
      const xInput = (t * 2 - 1) * maxInput; // -1000 to 1000

      const ev = calculateEmotionalValue(xInput);

      // Map ev (-250 to 100) to svg Y
      // SVG Y: 0 is top, Height is bottom.
      // We want Center (y=0 in logic) to be at midY
      // Max UP (Logic 100) -> midY - 100 * scale
      // Max DOWN (Logic -250) -> midY + 250 * scale
      const scale = height / 2 / 260; // Fit the -250 range

      const svgX = midX + (xInput / maxInput) * (width / 2 - 10);
      const svgY = midY - ev * scale;

      points.push(`${svgX},${svgY}`);
    }
    return `M ${points.join(' L ')}`;
  };

  const svgWidth = 300;
  const svgHeight = 250;
  const midY = svgHeight / 2;
  const scale = svgHeight / 2 / 260;
  const currentSvgX = svgWidth / 2 + (value / maxInput) * (svgWidth / 2 - 10);
  const currentSvgY = midY - emotionalValue * scale;

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-2xl my-10 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-2 h-6 bg-gradient-to-b from-emerald-400 to-rose-500 rounded-full block"></span>
          Pain/Pleasure Asymmetry Simulator
        </h3>
        <div className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-700">
          Drag the slider to feel the math
        </div>
      </div>

      <div className="grid grid-cols-[60px_1fr_80px] gap-6 h-[300px]">
        {/* LEFT: P&L Slider */}
        <div className="relative h-full flex flex-col items-center justify-center bg-slate-900/50 rounded-lg border border-slate-700 py-4">
          <div className="absolute top-1 text-emerald-400 text-xs font-mono font-bold">
            +$1k
          </div>
          <div className="absolute bottom-1 text-rose-400 text-xs font-mono font-bold">
            -$1k
          </div>

          <div className="h-full relative w-full flex justify-center">
            <input
              type="range"
              min="-1000"
              max="1000"
              step="10"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="absolute w-[240px] h-8 bg-transparent cursor-pointer appearance-none -rotate-90 origin-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 opacity-0"
            />
            {/* Custom Track Visual */}
            <div className="w-2 h-full bg-slate-700 rounded-full relative overflow-hidden pointer-events-none">
              <div
                className="absolute w-full bg-blue-500 transition-all duration-75"
                style={{
                  bottom: '50%',
                  height: value > 0 ? `${(value / 1000) * 50}%` : '0%',
                }}
              />
              <div
                className="absolute w-full bg-rose-500 transition-all duration-75"
                style={{
                  top: '50%',
                  height:
                    value < 0 ? `${(Math.abs(value) / 1000) * 50}%` : '0%',
                }}
              />
              {/* Thumb Visual */}
              <div
                className="absolute left-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-slate-300 z-20 transition-all duration-75"
                style={{
                  bottom: `${((value + 1000) / 2000) * 100}%`,
                  transform: 'translate(-50%, 50%)',
                }}
              />
            </div>
          </div>
        </div>

        {/* CENTER: Graph */}
        <div className="relative h-full bg-slate-900/30 rounded-lg border border-slate-700 flex items-center justify-center overflow-hidden">
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="overflow-visible"
          >
            {/* Grid Lines */}
            <line
              x1="0"
              y1={midY}
              x2={svgWidth}
              y2={midY}
              stroke="#475569"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <line
              x1={svgWidth / 2}
              y1="0"
              x2={svgWidth / 2}
              y2={svgHeight}
              stroke="#475569"
              strokeWidth="1"
              strokeDasharray="4 4"
            />

            {/* Reference Texts */}
            <text
              x={svgWidth - 10}
              y={midY - 10}
              textAnchor="end"
              className="text-[10px] fill-emerald-500/50 uppercase font-bold"
            >
              Gains
            </text>
            <text
              x={10}
              y={midY + 15}
              textAnchor="start"
              className="text-[10px] fill-rose-500/50 uppercase font-bold"
            >
              Losses
            </text>

            {/* The Curve */}
            <path
              d={generateCurvePath(svgWidth, svgHeight)}
              fill="none"
              stroke="url(#gradientCurve)"
              strokeWidth="3"
            />
            <defs>
              <linearGradient
                id="gradientCurve"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="50%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>

            {/* Interactive Dot */}
            <circle
              cx={currentSvgX}
              cy={currentSvgY}
              r="6"
              fill="white"
              stroke={value >= 0 ? '#10b981' : '#f43f5e'}
              strokeWidth="2"
              className="transition-all duration-75 ease-linear"
            />

            {/* Connection Line to Axis */}
            <line
              x1={currentSvgX}
              y1={midY}
              x2={currentSvgX}
              y2={currentSvgY}
              stroke={value >= 0 ? '#10b981' : '#f43f5e'}
              strokeWidth="1"
              opacity="0.5"
            />
          </svg>

          {/* Current Value Display */}
          <div className="absolute top-4 left-4 font-mono text-sm text-slate-300">
            <div className="text-xs text-slate-500 uppercase tracking-widest">
              Financial P&L
            </div>
            <div
              className={`text-xl font-bold ${
                value >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {value >= 0 ? '+' : ''}${value}
            </div>
          </div>
        </div>

        {/* RIGHT: Emotional Bar */}
        <div className="relative h-full flex flex-col items-center justify-center bg-slate-900/50 rounded-lg border border-slate-700 p-2">
          <div className="text-xs text-slate-500 font-bold uppercase mb-2 absolute top-2 w-full text-center">
            Emotional
            <br />
            Impact
          </div>

          <div className="h-[80%] w-full relative flex items-center justify-center">
            {/* Center Line */}
            <div className="absolute w-full h-[1px] bg-slate-600 z-10"></div>

            {/* The Bar */}
            <div className="w-8 relative h-full flex items-center justify-center">
              {/* Positive Bar */}
              <div
                className="absolute bottom-1/2 w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm transition-all duration-100 ease-out"
                style={{
                  height:
                    emotionalValue > 0
                      ? `${(emotionalValue / 250) * 50}%`
                      : '0px',
                }}
              >
                {emotionalValue > 0 && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-900 text-emerald-100 text-[10px] px-2 py-1 rounded whitespace-nowrap border border-emerald-500/50">
                    +{Math.round(emotionalValue)} units
                  </div>
                )}
              </div>

              {/* Negative Bar */}
              <div
                className={`absolute top-1/2 w-full bg-gradient-to-b from-rose-600 to-rose-400 rounded-b-sm transition-all duration-100 ease-out origin-top ${
                  emotionalValue < -150 ? 'shake' : ''
                }`}
                style={{
                  height:
                    emotionalValue < 0
                      ? `${(Math.abs(emotionalValue) / 250) * 50}%`
                      : '0px',
                }}
              >
                {emotionalValue < 0 && (
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-rose-900 text-rose-100 text-[10px] px-2 py-1 rounded whitespace-nowrap border border-rose-500/50">
                    {Math.round(emotionalValue)} units
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            className={`text-sm font-bold mt-auto transition-colors duration-300 ${
              emotionalValue > 50
                ? 'text-emerald-400'
                : emotionalValue < -50
                ? 'text-rose-500'
                : 'text-slate-500'
            }`}
          >
            {emotionalValue > 80
              ? 'Euphoria'
              : emotionalValue > 20
              ? 'Satisfaction'
              : emotionalValue < -150
              ? 'AGONY'
              : emotionalValue < -50
              ? 'Pain'
              : 'Neutral'}
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-500 text-center italic">
        Notice how quickly the red bar grows compared to the green bar. Losses
        accelerate emotional impact.
      </div>
    </div>
  );
};

export default AsymmetrySlider;
