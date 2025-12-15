
import React, { useState, useEffect, useRef } from 'react';
import { Brain, Activity, Clock, Zap } from 'lucide-react';

const DopamineMatcher: React.FC = () => {
  const [sliderValue, setSliderValue] = useState(50);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Visualization Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.05;
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Determine style based on slider (0 = high freq, 100 = low freq)
      // Normalize slider: 0 (left) is LOW dopamine baseline -> needs HIGH freq
      // 100 (right) is HIGH dopamine baseline -> needs LOW freq

      const normalized = sliderValue / 100;

      // Bar Configuration
      // At 0: Many bars (e.g. 50), Fast movement, Jagged height
      // At 100: Few bars (e.g. 5), Slow movement, Smooth waves

      const barCount = 40 - normalized * 35; // 40 -> 5
      const barWidth = (width / barCount) * 0.6;
      const gap = (width / barCount) * 0.4;

      // Color Interpolation
      // Left: Orange/Red (High Energy)
      // Right: Blue/Teal (Calm)
      const r = Math.round(249 - normalized * (249 - 34)); // 249 -> 34
      const g = Math.round(115 + normalized * (211 - 115)); // 115 -> 211
      const b = Math.round(22 + normalized * (238 - 22)); // 22 -> 238
      const color = `rgb(${r}, ${g}, ${b})`;

      ctx.fillStyle = color;

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + gap) + gap / 2;

        // Dynamic Height Calculation
        // Left: Noise (Math.random heavily influenced)
        // Right: Sine wave

        let barHeight;
        const noise =
          Math.sin(i * 0.5 + time * (5 - normalized * 4)) *
          Math.cos(time * 0.5 + i);
        const smooth = Math.sin((i / barCount) * Math.PI * 2 + time);

        if (normalized < 0.5) {
          // More noise
          const factor = 1 - normalized * 2; // 1 -> 0
          barHeight = noise * factor * 40 + smooth * (1 - factor) * 40;
        } else {
          // More smooth
          const factor = (normalized - 0.5) * 2; // 0 -> 1
          barHeight = smooth * factor * 50 + noise * (1 - factor) * 30;
        }

        // Add some jitter for the far left "scalper" vibe
        if (normalized < 0.2) {
          barHeight += (Math.random() - 0.5) * 20;
        }

        // Clamp height
        const h = Math.abs(barHeight) + 10;

        // Draw Rounded Bar
        ctx.beginPath();
        ctx.roundRect(x, centerY - h / 2, barWidth, h, 4);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [sliderValue]);

  // Content Logic
  const isScalper = sliderValue < 40;
  const isSwing = sliderValue > 60;
  const isHybrid = sliderValue >= 40 && sliderValue <= 60;

  return (
    <div className="my-12 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
      <div className="border-b border-slate-800 bg-slate-900 px-6 py-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-bold text-slate-100">
            The Dopamine Matcher
          </h3>
        </div>
        <p className="text-sm text-slate-400">
          Where do you fall on the neurochemical spectrum?
        </p>
      </div>

      <div className="p-6 sm:p-8">
        {/* Canvas Visualizer */}
        <div className="relative mb-8 h-48 w-full overflow-hidden rounded-xl bg-slate-950/50 shadow-inner border border-slate-800">
          <canvas
            ref={canvasRef}
            width={800}
            height={200}
            className="h-full w-full object-cover"
          />
          <div className="absolute top-4 right-4 rounded bg-slate-900/80 px-3 py-1 text-xs font-mono text-slate-300 backdrop-blur">
            SIMULATION:{' '}
            {isScalper
              ? 'HIGH FREQUENCY'
              : isSwing
              ? 'LOW FREQUENCY'
              : 'BALANCED'}
          </div>
        </div>

        {/* Slider Controls */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
            <span>Low Baseline (Bored Easily)</span>
            <span>High Baseline (Patient)</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderValue}
            onChange={(e) => setSliderValue(Number(e.target.value))}
            className="h-3 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-blue-500 outline-none hover:bg-slate-700 focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        {/* Dynamic Feedback */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div
            className={`rounded-xl border p-5 transition-colors duration-300 ${
              isScalper
                ? 'border-orange-500/50 bg-orange-950/20'
                : 'border-slate-800 bg-slate-900/50 opacity-50'
            }`}
          >
            <div className="mb-3 flex items-center gap-2">
              <Zap
                className={`h-5 w-5 ${
                  isScalper ? 'text-orange-400' : 'text-slate-500'
                }`}
              />
              <h4
                className={`font-bold ${
                  isScalper ? 'text-orange-200' : 'text-slate-400'
                }`}
              >
                Scalper / Day Trader
              </h4>
            </div>
            <p className="text-sm text-slate-300">
              Your brain craves{' '}
              <strong className="text-orange-300">dopamine hits</strong>. You
              need rapid feedback loops (minutes). Long waits create anxiety and
              destructive tinkering.
            </p>
          </div>

          <div
            className={`rounded-xl border p-5 transition-colors duration-300 ${
              isSwing
                ? 'border-cyan-500/50 bg-cyan-950/20'
                : 'border-slate-800 bg-slate-900/50 opacity-50'
            }`}
          >
            <div className="mb-3 flex items-center gap-2">
              <Clock
                className={`h-5 w-5 ${
                  isSwing ? 'text-cyan-400' : 'text-slate-500'
                }`}
              />
              <h4
                className={`font-bold ${
                  isSwing ? 'text-cyan-200' : 'text-slate-400'
                }`}
              >
                Swing / Position Trader
              </h4>
            </div>
            <p className="text-sm text-slate-300">
              Your brain has high{' '}
              <strong className="text-cyan-300">serotonin/GABA</strong>{' '}
              stability. You can delay gratification. Constant noise drains your
              energy; you thrive on big-picture clarity.
            </p>
          </div>
        </div>

        {/* Recommendation Box */}
        <div className="mt-6 rounded-lg bg-slate-800 p-4 text-center">
          <span className="text-sm font-medium text-slate-400">
            Diagnosis:{' '}
          </span>
          <span className="text-base font-bold text-white">
            {isScalper &&
              'Stop fighting for patience. Feed your brain the engagement it needs safely.'}
            {isSwing &&
              'Stop forcing speed. Your superpower is sitting on your hands.'}
            {isHybrid &&
              'You are adaptable. Structure your trading around your current energy levels.'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DopamineMatcher;
