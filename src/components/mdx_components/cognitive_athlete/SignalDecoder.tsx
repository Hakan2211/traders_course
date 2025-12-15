
import React, { useState, useEffect } from 'react';
import {
  Activity,
  Volume2,
  MapPin,
  AlertTriangle,
  BrainCircuit,
  Info,
  Zap,
} from 'lucide-react';

type Speed = 'fast' | 'slow';
type Volume = 'loud' | 'quiet';
type Location = 'head' | 'gut';

const SignalDecoder = () => {
  const [speed, setSpeed] = useState<Speed | null>(null);
  const [volume, setVolume] = useState<Volume | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [result, setResult] = useState<
    'amygdala' | 'insula' | 'mixed' | 'incomplete'
  >('incomplete');

  useEffect(() => {
    if (!speed || !volume || !location) {
      setResult('incomplete');
      return;
    }

    // Amygdala Profile: Fast, Loud, Head/Chest (Head in this simplistic model)
    const isAmygdala =
      speed === 'fast' && volume === 'loud' && location === 'head';

    // Insula Profile: Slow, Quiet, Gut
    const isInsula =
      speed === 'slow' && volume === 'quiet' && location === 'gut';

    if (isAmygdala) {
      setResult('amygdala');
    } else if (isInsula) {
      setResult('insula');
    } else {
      setResult('mixed');
    }
  }, [speed, volume, location]);

  const reset = () => {
    setSpeed(null);
    setVolume(null);
    setLocation(null);
  };

  return (
    <div className="my-12 w-full max-w-2xl mx-auto">
      {/* Widget Container */}
      <div className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 p-6 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="text-blue-400" />
              The Signal Decoder
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Is it panic or intuition? Decode the signal.
            </p>
          </div>
          <button
            onClick={reset}
            className="text-xs text-gray-500 hover:text-white underline transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Controls Body */}
        <div className="p-6 space-y-8">
          {/* 1. SPEED */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Zap size={16} className="text-yellow-500" /> SPEED
              </label>
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                {speed ? speed : 'Select'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSpeed('fast')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                  speed === 'fast'
                    ? 'bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                    : 'bg-gray-950 border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                }`}
              >
                <span className="font-bold text-lg">FAST</span>
                <span className="text-xs opacity-70">Urgent, Rushing</span>
              </button>
              <button
                onClick={() => setSpeed('slow')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                  speed === 'slow'
                    ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                    : 'bg-gray-950 border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                }`}
              >
                <span className="font-bold text-lg">SLOW</span>
                <span className="text-xs opacity-70">Heavy, Paused</span>
              </button>
            </div>
          </div>

          {/* 2. VOLUME */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Volume2 size={16} className="text-yellow-500" /> VOLUME
              </label>
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                {volume ? volume : 'Select'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setVolume('loud')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                  volume === 'loud'
                    ? 'bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                    : 'bg-gray-950 border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                }`}
              >
                <span className="font-bold text-lg">LOUD</span>
                <span className="text-xs opacity-70">Screaming, Demanding</span>
              </button>
              <button
                onClick={() => setVolume('quiet')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                  volume === 'quiet'
                    ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                    : 'bg-gray-950 border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                }`}
              >
                <span className="font-bold text-lg">QUIET</span>
                <span className="text-xs opacity-70">Nagging, Whispering</span>
              </button>
            </div>
          </div>

          {/* 3. LOCATION */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <MapPin size={16} className="text-yellow-500" /> LOCATION
              </label>
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                {location ? location : 'Select'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setLocation('head')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                  location === 'head'
                    ? 'bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                    : 'bg-gray-950 border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                }`}
              >
                <span className="font-bold text-lg">HEAD/CHEST</span>
                <span className="text-xs opacity-70">
                  Racing mind, Tight chest
                </span>
              </button>
              <button
                onClick={() => setLocation('gut')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                  location === 'gut'
                    ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                    : 'bg-gray-950 border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                }`}
              >
                <span className="font-bold text-lg">DEEP GUT</span>
                <span className="text-xs opacity-70">Stomach, Hollowing</span>
              </button>
            </div>
          </div>
        </div>

        {/* Result Panel */}
        <div
          className={`p-6 border-t border-gray-800 transition-colors duration-500 ${
            result === 'amygdala'
              ? 'bg-red-950/30'
              : result === 'insula'
              ? 'bg-yellow-950/30'
              : result === 'mixed'
              ? 'bg-gray-800/50'
              : 'bg-gray-900'
          }`}
        >
          {result === 'incomplete' && (
            <div className="flex flex-col items-center justify-center text-center py-4 text-gray-500">
              <BrainCircuit size={48} className="mb-3 opacity-20" />
              <p>Select all three inputs to analyze the signal.</p>
            </div>
          )}

          {result === 'amygdala' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-2 text-red-500">
                <AlertTriangle size={24} className="animate-pulse" />
                <h4 className="text-xl font-black tracking-wide uppercase">
                  Amygdala Hijack (Panic)
                </h4>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
                <p className="text-red-200 font-medium">
                  ACTION:{' '}
                  <span className="text-red-400 font-bold">
                    IGNORE. DO NOT EXECUTE.
                  </span>
                </p>
                <p className="text-sm text-red-300/70 mt-2">
                  Your system is in fight-or-flight mode. This is fear or greed
                  masking as opportunity. Step away from the screen for 5
                  minutes.
                </p>
              </div>
            </div>
          )}

          {result === 'insula' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-2 text-yellow-400">
                <BrainCircuit size={24} />
                <h4 className="text-xl font-black tracking-wide uppercase">
                  Insula Signal (Intuition)
                </h4>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
                <p className="text-yellow-200 font-medium">
                  ACTION:{' '}
                  <span className="text-yellow-400 font-bold">
                    LISTEN. PAUSE AND ASSESS.
                  </span>
                </p>
                <p className="text-sm text-yellow-300/70 mt-2">
                  Your body is detecting a pattern based on past experience.
                  This signal is valid data. Verify your technicals again, but
                  respect the warning.
                </p>
              </div>
            </div>
          )}

          {result === 'mixed' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-2 text-gray-300">
                <Info size={24} />
                <h4 className="text-xl font-black tracking-wide uppercase">
                  Mixed Signal
                </h4>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <p className="text-gray-300 font-medium">
                  ACTION:{' '}
                  <span className="text-white font-bold">
                    WAIT FOR CLARITY.
                  </span>
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  The signals are conflicting. You might be feeling a mix of
                  excitement (Amygdala) and genuine intuition (Insula). Do not
                  trade until the feeling becomes distinct.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignalDecoder;
