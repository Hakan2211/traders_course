
import React, { useState, useEffect } from 'react';
import { BrainCircuit, Info } from 'lucide-react';

const PredictionErrorSimulator: React.FC = () => {
  const [expectation, setExpectation] = useState<number>(0);
  const [actual, setActual] = useState<number>(100);
  const [rpe, setRpe] = useState<number>(0);
  const [animatedRpe, setAnimatedRpe] = useState<number>(0);

  useEffect(() => {
    // Basic RPE Model: RPE = Reward - Prediction
    const newRpe = actual - expectation;
    setRpe(newRpe);

    // Smooth animation target
    const timer = setTimeout(() => {
      setAnimatedRpe(newRpe);
    }, 50);

    return () => clearTimeout(timer);
  }, [expectation, actual]);

  // Visual scaling: We want to show +/- 1000 range visually within a constrained height
  // Max diff is 1000, Min diff is -1000.
  const maxRange = 1000;

  // Calculate bar height as a percentage of half-height (origin is center)
  const barHeightPercentage = Math.min(
    (Math.abs(animatedRpe) / maxRange) * 100,
    100
  );

  // Determine text feedback
  const getFeedback = () => {
    if (rpe > 200)
      return {
        text: 'MASSIVE DOPAMINE SPIKE!',
        color: 'text-green-400',
        sub: 'Brain learns: DO THIS AGAIN!',
      };
    if (rpe > 0)
      return {
        text: 'Positive Prediction Error',
        color: 'text-green-300',
        sub: 'Small dopamine release.',
      };
    if (rpe === 0)
      return {
        text: 'No Prediction Error',
        color: 'text-slate-400',
        sub: 'Baseline activity. No learning signal.',
      };
    if (rpe > -200)
      return {
        text: 'Negative Prediction Error',
        color: 'text-red-300',
        sub: 'Dopamine dip. Slight disappointment.',
      };
    return {
      text: 'DOPAMINE CRASH',
      color: 'text-red-500',
      sub: 'Visceral pain. Brain learns: AVOID THIS.',
    };
  };

  const feedback = getFeedback();

  return (
    <div className="w-full max-w-4xl mx-auto my-12 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
      <div className="bg-slate-800/80 p-4 border-b border-slate-700 flex items-center gap-3">
        <div className="p-2 bg-yellow-500/20 rounded-lg">
          <BrainCircuit className="w-6 h-6 text-yellow-400" />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg">
            Interactive Simulator: The Prediction Error Graph
          </h3>
          <p className="text-slate-400 text-xs">
            Prove that "Better Than Expected" &gt; "Good"
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Controls Section */}
        <div className="p-6 md:w-1/2 flex flex-col justify-center space-y-8 border-b md:border-b-0 md:border-r border-slate-700 bg-slate-800/30">
          {/* Slider A */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-yellow-300 uppercase tracking-wider">
                Expectation
              </label>
              <span className="text-xl font-mono text-white bg-slate-700 px-2 py-1 rounded">
                ${expectation}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1000"
              step="50"
              value={expectation}
              onChange={(e) => setExpectation(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500 hover:accent-yellow-400 transition-all"
            />
            <p className="text-xs text-slate-500">
              What your brain predicts you will get.
            </p>
          </div>

          {/* Slider B */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-blue-300 uppercase tracking-wider">
                Actual Result
              </label>
              <span className="text-xl font-mono text-white bg-slate-700 px-2 py-1 rounded">
                ${actual}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1000"
              step="50"
              value={actual}
              onChange={(e) => setActual(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
            />
            <p className="text-xs text-slate-500">
              What actually happened in the trade.
            </p>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 text-sm text-slate-400">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <p>
                Try setting Expectation to $1000 and Result to $1000. Notice the
                lack of dopamine compared to Expectation $0 and Result $100.
              </p>
            </div>
          </div>
        </div>

        {/* Visualization Section */}
        <div className="p-8 md:w-1/2 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 relative min-h-[400px]">
          {/* Chart Container */}
          <div className="relative w-full h-64 flex items-center justify-center">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between opacity-20 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full h-px bg-slate-500"></div>
              ))}
            </div>
            {/* Center Zero Line */}
            <div className="absolute w-full h-px bg-slate-400/50 z-10"></div>

            {/* The Bar */}
            <div className="relative w-24 h-full flex items-center justify-center z-20">
              {/* Positive Bar */}
              <div
                className="absolute bottom-1/2 w-full bg-gradient-to-t from-green-500 to-green-300 rounded-t-sm shadow-[0_0_20px_rgba(34,197,94,0.5)] transition-all duration-300 ease-out"
                style={{
                  height:
                    animatedRpe > 0 ? `${barHeightPercentage / 2}%` : '0%',
                  opacity: animatedRpe > 0 ? 1 : 0,
                }}
              ></div>

              {/* Negative Bar */}
              <div
                className="absolute top-1/2 w-full bg-gradient-to-b from-red-500 to-red-300 rounded-b-sm shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all duration-300 ease-out"
                style={{
                  height:
                    animatedRpe < 0 ? `${barHeightPercentage / 2}%` : '0%',
                  opacity: animatedRpe < 0 ? 1 : 0,
                }}
              ></div>

              {/* Neutral Marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-slate-500 transition-all duration-300"
                style={{
                  width: animatedRpe === 0 ? '100%' : '0%',
                  opacity: animatedRpe === 0 ? 1 : 0,
                }}
              ></div>
            </div>
          </div>

          {/* Feedback Text */}
          <div className="mt-8 text-center space-y-2 h-20">
            <div
              className={`text-2xl font-black uppercase tracking-tight ${feedback.color} drop-shadow-lg transition-colors duration-300`}
            >
              {feedback.text}
            </div>
            <div className="text-slate-400 font-medium transition-all duration-300">
              {feedback.sub}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionErrorSimulator;
