
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TimerPhase } from './types';
import {
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const TOTAL_SECONDS = 180;
const PEAK_START = 45;
const RESOLVE_START = 90;

export const UrgeSurfTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [phase, setPhase] = useState<TimerPhase>(TimerPhase.Idle);
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<any[]>([]);
  const gainNodesRef = useRef<GainNode[]>([]);

  // -- Audio Logic --
  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
  };

  const playTone = useCallback(
    (phaseInput: TimerPhase) => {
      if (isMuted || !audioContextRef.current) return;

      // Stop previous
      oscillatorsRef.current.forEach((osc) => {
        try {
          osc.stop();
        } catch (e) {}
      });
      oscillatorsRef.current = [];
      gainNodesRef.current = [];

      const ctx = audioContextRef.current;

      // Setup based on phase
      if (phaseInput === TimerPhase.Rise) {
        // Dissonant, rising tension
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(100, ctx.currentTime);
        osc1.frequency.linearRampToValueAtTime(300, ctx.currentTime + 45); // Rising pitch

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(103, ctx.currentTime); // Slight detune for tension
        osc2.frequency.linearRampToValueAtTime(308, ctx.currentTime + 45);

        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 45);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();
        oscillatorsRef.current = [osc1, osc2];
        gainNodesRef.current = [gain];
      } else if (phaseInput === TimerPhase.Crest) {
        // High steady tension, pulsing slightly
        const osc1 = ctx.createOscillator();
        const gain = ctx.createGain();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(300, ctx.currentTime);

        lfo.frequency.value = 4; // 4Hz pulse
        lfoGain.gain.value = 0.02;

        gain.gain.setValueAtTime(0.1, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);

        osc1.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        lfo.start();
        oscillatorsRef.current = [osc1, lfo];
        gainNodesRef.current = [gain, lfoGain];
      } else if (phaseInput === TimerPhase.Crash) {
        // Harmonic resolve, sine waves
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator(); // Harmony
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(220, ctx.currentTime); // A3

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(329.63, ctx.currentTime); // E4 (Major 5th approx)

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 90); // Fade out slowly

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();
        oscillatorsRef.current = [osc1, osc2];
        gainNodesRef.current = [gain];
      }
    },
    [isMuted]
  );

  const stopAudio = useCallback(() => {
    oscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {}
    });
    oscillatorsRef.current = [];
  }, []);

  // -- Timer Logic --
  useEffect(() => {
    let interval: any;
    if (phase !== TimerPhase.Idle && phase !== TimerPhase.Complete) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const next = prev + 1;

          // Phase Transitions
          if (prev < PEAK_START && next >= PEAK_START) {
            setPhase(TimerPhase.Crest);
            playTone(TimerPhase.Crest);
          } else if (prev < RESOLVE_START && next >= RESOLVE_START) {
            setPhase(TimerPhase.Crash);
            playTone(TimerPhase.Crash);
          } else if (next >= TOTAL_SECONDS) {
            setPhase(TimerPhase.Complete);
            stopAudio();
            return TOTAL_SECONDS;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phase, playTone, stopAudio]);

  // -- Helper Handlers --
  const handleStart = () => {
    initAudio();
    setTimeLeft(0);
    setPhase(TimerPhase.Rise);
    playTone(TimerPhase.Rise);
  };

  const handleReset = () => {
    stopAudio();
    setPhase(TimerPhase.Idle);
    setTimeLeft(0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) stopAudio();
    else if (phase !== TimerPhase.Idle && phase !== TimerPhase.Complete)
      playTone(phase);
  };

  // -- Visualizer Logic (Canvas-ish via SVG) --
  // We generate a noisy circle path based on time and phase
  const generateWavePath = () => {
    const points = 100;
    const radius = 100;
    const center = 150;
    let d = `M `;

    const now = Date.now() / 1000;

    // Intensity factor based on phase
    let intensity = 0.05;
    let color = '#3b82f6'; // Blue

    if (phase === TimerPhase.Rise) {
      // Ramp intensity from 0.1 to 1.0
      const progress = timeLeft / PEAK_START;
      intensity = 0.1 + progress * 0.9;
      // Color transition Blue -> Red
      color = '#ef4444';
    } else if (phase === TimerPhase.Crest) {
      intensity = 1.2 + Math.sin(now * 10) * 0.2; // Pulsing heavy
      color = '#ef4444'; // Red
    } else if (phase === TimerPhase.Crash) {
      // Ramp down
      const progress =
        (timeLeft - RESOLVE_START) / (TOTAL_SECONDS - RESOLVE_START);
      intensity = 1.0 - progress;
      color = '#10b981'; // Greenish/Teal
    } else if (phase === TimerPhase.Idle) {
      intensity = 0.1;
    }

    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      // Simple noise simulation using multiple sines
      const noise =
        Math.sin(angle * 10 + now * 5) * Math.cos(angle * 5 - now * 2);
      const r = radius + noise * 20 * intensity;

      const x = center + Math.cos(angle) * r;
      const y = center + Math.sin(angle) * r;

      d += `${x},${y} `;
    }
    d += 'Z';
    return { d, color };
  };

  const [wavePath, setWavePath] = useState(generateWavePath());

  useEffect(() => {
    let animationId: number;
    const animate = () => {
      setWavePath(generateWavePath());
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationId);
  }, [phase, timeLeft]);

  // -- Render Helper --
  const getPhaseText = () => {
    switch (phase) {
      case TimerPhase.Rise:
        return 'THE CHEMICAL PEAK RISING';
      case TimerPhase.Crest:
        return 'HOLD STEADY. RIDING THE WAVE.';
      case TimerPhase.Crash:
        return 'THE URGE IS FADING...';
      case TimerPhase.Complete:
        return 'SURF COMPLETE';
      default:
        return 'READY TO SURF THE URGE?';
    }
  };

  const getSubText = () => {
    switch (phase) {
      case TimerPhase.Rise:
        return 'Anxiety and adrenaline are spiking. This is biological. Wait it out.';
      case TimerPhase.Crest:
        return 'This is the hardest part. Just 45 seconds. Breathe.';
      case TimerPhase.Crash:
        return 'Your Prefrontal Cortex is coming back online.';
      case TimerPhase.Complete:
        return 'You have rewired your brain.';
      default:
        return 'Click below when you feel the urge to break your rules.';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-12 bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div
        className={`absolute inset-0 opacity-20 pointer-events-none transition-colors duration-1000 ${
          phase === TimerPhase.Rise || phase === TimerPhase.Crest
            ? 'bg-red-900'
            : 'bg-blue-900'
        }`}
      ></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Header */}
        <div className="flex justify-between w-full items-start mb-4">
          <div>
            <h3 className="text-xl font-mono font-bold text-white">
              URGE SURF TIMER
            </h3>
            <p className="text-slate-400 text-xs uppercase tracking-widest">
              Neuroplasticity Tool v1.0
            </p>
          </div>
          <button
            onClick={toggleMute}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>

        {/* Visualizer */}
        <div className="relative w-72 h-72 flex items-center justify-center mb-6">
          <svg
            className="w-full h-full absolute inset-0 overflow-visible"
            viewBox="0 0 300 300"
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d={wavePath.d}
              fill="none"
              stroke={wavePath.color}
              strokeWidth="4"
              filter="url(#glow)"
              className="transition-colors duration-300"
            />
            {/* Inner fill opacity */}
            <path
              d={wavePath.d}
              fill={wavePath.color}
              fillOpacity="0.1"
              stroke="none"
              className="transition-colors duration-300"
            />
          </svg>

          {/* Time Display */}
          <div className="z-10 text-center">
            <div className="text-5xl font-mono font-bold text-white tracking-tighter">
              {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-xs font-mono text-slate-400 mt-1">
              {phase === TimerPhase.Idle ? '03:00' : 'TARGET'}
            </div>
          </div>
        </div>

        {/* Text Status */}
        <div className="text-center mb-8 h-24">
          <h2
            className={`text-xl font-bold mb-2 transition-colors duration-500 ${
              phase === TimerPhase.Rise || phase === TimerPhase.Crest
                ? 'text-red-400'
                : 'text-cyan-400'
            }`}
          >
            {getPhaseText()}
          </h2>
          <p className="text-slate-300 max-w-md mx-auto leading-relaxed">
            {getSubText()}
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          {phase === TimerPhase.Idle && (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-red-900/50"
            >
              <Play size={20} fill="currentColor" />I FEEL THE URGE
            </button>
          )}

          {(phase === TimerPhase.Rise ||
            phase === TimerPhase.Crest ||
            phase === TimerPhase.Crash) && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-3 rounded-full font-medium transition-all"
            >
              <RotateCcw size={18} />
              Reset
            </button>
          )}

          {phase === TimerPhase.Complete && (
            <div className="flex flex-col items-center animate-fade-in">
              <p className="mb-4 font-bold text-white">
                Do you still want to exit the trade?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold transition-colors"
                >
                  <CheckCircle size={18} />
                  No, I'll Hold
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-400 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  <XCircle size={18} />
                  Yes, Exit
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-800 mt-8 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${
              phase === TimerPhase.Rise
                ? 'bg-red-500'
                : phase === TimerPhase.Crest
                ? 'bg-orange-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${(timeLeft / TOTAL_SECONDS) * 100}%` }}
          ></div>
        </div>

        {/* Phase Markers */}
        <div className="w-full flex justify-between text-[10px] text-slate-600 font-mono mt-2 uppercase">
          <span>Start</span>
          <span>Peak (45s)</span>
          <span>Resolve (90s)</span>
          <span>Rewire (180s)</span>
        </div>
      </div>
    </div>
  );
};
