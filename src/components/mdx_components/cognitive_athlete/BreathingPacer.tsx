
import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Volume2, VolumeX, Wind } from 'lucide-react';
import { BreathingMode, BreathingPhase, BreathingConfig } from './types';
import { breathingAudio } from './utils/audioContext';

const MODES: Record<BreathingMode, BreathingConfig> = {
  '4-7-8': {
    name: '4-7-8 Relax',
    description: 'Classic anxiety reduction pattern.',
    inhaleDuration: 4000,
    holdDuration: 7000,
    exhaleDuration: 8000,
  },
  'physiological-sigh': {
    name: 'Physiological Sigh',
    description: 'Double inhale to pop alveoli and offload CO2.',
    inhaleDuration: 2500,
    inhaleShortDuration: 1500, // The second short inhale
    holdDuration: 0, // No hold usually, or very short. Huberman says double inhale -> exhale.
    exhaleDuration: 6000,
  },
};

const BreathingPacer: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<BreathingMode>('4-7-8');
  const [phase, setPhase] = useState<BreathingPhase>('idle');
  const [text, setText] = useState('READY');
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Animation state refs for precise timing without re-rendering issues
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const config = MODES[mode];

  const stopBreathing = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsActive(false);
    setPhase('idle');
    setText('READY');
    if (soundEnabled) breathingAudio.stop();
  };

  const runCycle = () => {
    // Start Inhale
    setPhase('inhale');
    setText('INHALE');
    if (soundEnabled)
      breathingAudio.setPhase('inhale', config.inhaleDuration / 1000);

    // Schedule next
    timeoutRef.current = setTimeout(() => {
      if (!isActive) return;

      if (mode === 'physiological-sigh') {
        // Double Inhale
        setPhase('inhale-short');
        setText('INHALE AGAIN');
        if (soundEnabled)
          breathingAudio.setPhase(
            'inhale-short',
            (config.inhaleShortDuration || 1000) / 1000
          );

        timeoutRef.current = setTimeout(() => {
          // Exhale
          setPhase('exhale');
          setText('EXHALE');
          if (soundEnabled)
            breathingAudio.setPhase('exhale', config.exhaleDuration / 1000);

          timeoutRef.current = setTimeout(() => {
            runCycle(); // Loop
          }, config.exhaleDuration);
        }, config.inhaleShortDuration);
      } else {
        // 4-7-8 HOLD
        setPhase('hold');
        setText('HOLD');
        if (soundEnabled)
          breathingAudio.setPhase('hold', config.holdDuration / 1000);

        timeoutRef.current = setTimeout(() => {
          // Exhale
          setPhase('exhale');
          setText('EXHALE');
          if (soundEnabled)
            breathingAudio.setPhase('exhale', config.exhaleDuration / 1000);

          timeoutRef.current = setTimeout(() => {
            runCycle(); // Loop
          }, config.exhaleDuration);
        }, config.holdDuration);
      }
    }, config.inhaleDuration);
  };

  const toggleActive = () => {
    if (isActive) {
      stopBreathing();
    } else {
      setIsActive(true);
    }
  };

  // Trigger cycle start when active becomes true
  useEffect(() => {
    if (isActive) {
      if (soundEnabled) breathingAudio.start();
      runCycle();
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]); // Only react to start/stop

  // Handle mode switch resets
  useEffect(() => {
    stopBreathing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Audio Toggle
  useEffect(() => {
    if (!isActive) return;
    if (soundEnabled) breathingAudio.start();
    else breathingAudio.stop();
  }, [soundEnabled, isActive]);

  // Dynamic Styles for Animation
  const getCircleStyle = () => {
    const baseStyle =
      'w-48 h-48 rounded-full border-4 shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center justify-center transition-all ease-in-out';

    if (phase === 'idle')
      return `${baseStyle} scale-100 border-slate-600 opacity-50 duration-500`;

    // Active styles
    const activeColor =
      'border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.6)] bg-cyan-900/10';

    switch (phase) {
      case 'inhale':
        return `${baseStyle} ${activeColor} scale-125 duration-[${config.inhaleDuration}ms]`;
      case 'inhale-short':
        return `${baseStyle} ${activeColor} scale-150 duration-[${config.inhaleShortDuration}ms]`;
      case 'hold':
        return `${baseStyle} ${activeColor} scale-125 duration-300`; // Hold size same as inhale end (unless sigh)
      case 'exhale':
        return `${baseStyle} ${activeColor} scale-100 duration-[${config.exhaleDuration}ms]`;
      default:
        return baseStyle;
    }
  };

  // Helper to inject dynamic duration into style attribute because Tailwind class interpolation is tricky for dynamic values
  const getDynamicStyle = () => {
    let duration = 500;
    let scale = 1;

    if (phase === 'inhale') {
      duration = config.inhaleDuration;
      scale = 1.35;
    } else if (phase === 'inhale-short') {
      duration = config.inhaleShortDuration || 1000;
      scale = 1.5;
    } else if (phase === 'hold') {
      duration = 0; // Instant hold? or just keep style
      scale = 1.35;
    } else if (phase === 'exhale') {
      duration = config.exhaleDuration;
      scale = 1;
    }

    return {
      transitionDuration: `${duration}ms`,
      transform: `scale(${scale})`,
    };
  };

  return (
    <div className="w-full max-w-xl mx-auto my-12 relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-slate-900 ring-1 ring-slate-800 rounded-2xl p-6 md:p-8 flex flex-col items-center shadow-2xl">
        {/* Header / Mode Switcher */}
        <div className="w-full flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wind className="text-cyan-400 w-5 h-5" />
              <h3 className="font-bold text-white text-lg">
                Neuro-Intervention Tool
              </h3>
            </div>
            <p className="text-slate-400 text-xs uppercase tracking-wider">
              Use immediately upon threat detection
            </p>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-full transition-colors ${
              soundEnabled
                ? 'bg-cyan-900/50 text-cyan-400'
                : 'bg-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Audio Guide"
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-lg mb-10 w-full max-w-xs">
          {(Object.keys(MODES) as BreathingMode[]).map((m) => (
            <button
              key={m}
              onClick={() => !isActive && setMode(m)}
              disabled={isActive}
              className={`flex-1 py-1 px-3 text-sm font-medium rounded-md transition-all ${
                mode === m
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {MODES[m].name}
            </button>
          ))}
        </div>

        {/* The Visualizer */}
        <div className="relative h-64 w-full flex items-center justify-center mb-8">
          {/* Guide Ring */}
          <div className="absolute w-48 h-48 rounded-full border-2 border-slate-800 border-dashed opacity-30"></div>

          {/* Animated Ring */}
          <div
            className={`
                        w-48 h-48 rounded-full border-4 flex items-center justify-center transition-all ease-in-out
                        ${
                          phase === 'idle'
                            ? 'border-slate-700 opacity-50'
                            : 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)] bg-cyan-950/30'
                        }
                    `}
            style={getDynamicStyle()}
          >
            <div
              className="text-center transition-transform duration-0"
              style={{
                transform:
                  'scale(0.8)' /* Counter scale if needed, but here text scales with bubble */,
              }}
            >
              <span
                className={`block font-mono font-bold text-xl ${
                  phase === 'idle'
                    ? 'text-slate-500'
                    : 'text-cyan-100 drop-shadow-md'
                }`}
              >
                {text}
              </span>
            </div>
          </div>
        </div>

        {/* Description of current phase/mode */}
        <div className="text-center mb-8 h-10">
          {!isActive ? (
            <p className="text-slate-400 text-sm">{config.description}</p>
          ) : (
            <p className="text-cyan-400/80 text-sm font-mono animate-pulse">
              {phase === 'inhale' && 'Expand diaphragm...'}
              {phase === 'inhale-short' && 'Top it up...'}
              {phase === 'hold' && 'Steady...'}
              {phase === 'exhale' && 'Relax shoulders, let go...'}
            </p>
          )}
        </div>

        {/* Controls */}
        <button
          onClick={toggleActive}
          className={`
                    flex items-center gap-2 px-8 py-3 rounded-full font-bold tracking-wide transition-all transform hover:scale-105 active:scale-95
                    ${
                      isActive
                        ? 'bg-slate-800 text-slate-300 hover:bg-red-900/30 hover:text-red-400 border border-slate-700'
                        : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20'
                    }
                `}
        >
          {isActive ? (
            <>
              <Square size={18} fill="currentColor" /> STOP SESSION
            </>
          ) : (
            <>
              <Play size={18} fill="currentColor" /> START PRACTICE
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BreathingPacer;
