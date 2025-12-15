
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as SliderPrimitive from '@radix-ui/react-slider';
import {
  Flame,
  Wind,
  Snowflake,
  Brain,
  Activity,
  AlertTriangle,
  Zap,
  Anchor,
  CloudFog,
  Eye,
  HeartPulse,
  ThermometerSun,
  ThermometerSnowflake,
  Scale,
} from 'lucide-react';

export const WindowOfTolerance = () => {
  const [arousalLevel, setArousalLevel] = useState(50);

  const getZone = (level: number) => {
    if (level > 70) return 'hyper';
    if (level < 30) return 'hypo';
    return 'optimal';
  };

  const currentZone = getZone(arousalLevel);

  const zones = {
    hyper: {
      title: 'HYPERAROUSAL',
      subtitle: 'Fight or Flight',
      color: 'text-rose-500',
      bgColor: 'bg-rose-500',
      borderColor: 'border-rose-500/50',
      gradient: 'from-rose-500/20 to-transparent',
      icon: <Flame className="w-6 h-6" />,
      symptoms: [
        'Anxiety & Panic',
        'Hypervigilance',
        'Racing Thoughts',
        'Emotional Reactivity',
        'Impulsive Decisions',
      ],
      description:
        'Your nervous system is flooded with energy. You perceive threats everywhere and react instinctively rather than strategically.',
      biology:
        'Sympathetic Nervous System Activation (High Cortisol & Adrenaline)',
    },
    optimal: {
      title: 'OPTIMAL ZONE',
      subtitle: 'Window of Tolerance',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400',
      borderColor: 'border-emerald-400/50',
      gradient: 'from-emerald-400/20 to-transparent',
      icon: <Scale className="w-6 h-6" />,
      symptoms: [
        'Clear Thinking',
        'Emotional Regulation',
        'Good Decision Making',
        'Learning Capacity',
        'Connectedness',
      ],
      description:
        'You are grounded and present. You can process information effectively and handle market stress without losing control.',
      biology: 'Ventral Vagal State (Social Engagement System active)',
    },
    hypo: {
      title: 'HYPOAROUSAL',
      subtitle: 'Shutdown / Freeze',
      color: 'text-blue-400',
      bgColor: 'bg-blue-400',
      borderColor: 'border-blue-400/50',
      gradient: 'from-blue-400/20 to-transparent',
      icon: <Snowflake className="w-6 h-6" />,
      symptoms: [
        'Numbness & Disconnection',
        'Brain Fog',
        'Apathy / Depression',
        'Inability to Act',
        'Fatigue',
      ],
      description:
        'Your system is overwhelmed and has shut down to conserve energy. You feel frozen and unable to engage with the market.',
      biology: 'Dorsal Vagal Shutdown (Parasympathetic over-activation)',
    },
  };

  const activeZone = zones[currentZone];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-900/50 rounded-3xl border border-slate-800 backdrop-blur-sm shadow-xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-emerald-400" />
          The Nervous System Thermometer
        </h2>
        <p className="text-slate-400 mt-2 text-sm">
          Adjust the slider to explore the different states of arousal
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Thermometer Control */}
        <div className="md:col-span-4 flex flex-row md:flex-col items-center justify-center gap-4 relative h-[400px] bg-slate-950/50 rounded-2xl p-6 border border-slate-800">
          {/* Background Zones Indicator */}
          <div className="absolute inset-y-6 left-1/2 -translate-x-1/2 w-4 md:w-16 h-[350px] rounded-full overflow-hidden flex flex-col opacity-20 pointer-events-none">
            <div className="flex-1 bg-rose-500" />
            <div className="flex-1 bg-emerald-400" />
            <div className="flex-1 bg-blue-500" />
          </div>

          {/* Radix Slider */}
          <SliderPrimitive.Root
            className="relative flex flex-col items-center select-none touch-none h-full w-24"
            orientation="vertical"
            min={0}
            max={100}
            step={1}
            value={[arousalLevel]}
            onValueChange={(vals) => setArousalLevel(vals[0])}
          >
            <SliderPrimitive.Track className="relative h-full w-2 bg-slate-800 rounded-full overflow-hidden">
              {/* Animated Fill */}
              <motion.div
                className={`w-full absolute bottom-0 ${
                  currentZone === 'hyper'
                    ? 'bg-rose-500'
                    : currentZone === 'hypo'
                    ? 'bg-blue-500'
                    : 'bg-emerald-400'
                }`}
                style={{ height: `${arousalLevel}%` }}
                animate={{
                  backgroundColor:
                    currentZone === 'hyper'
                      ? '#f43f5e'
                      : currentZone === 'hypo'
                      ? '#3b82f6'
                      : '#34d399',
                }}
              />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb className="w-12 h-12 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] border-4 border-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-grab active:cursor-grabbing flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-20">
              {currentZone === 'hyper' && (
                <ThermometerSun className="w-5 h-5 text-rose-500" />
              )}
              {currentZone === 'optimal' && (
                <Activity className="w-5 h-5 text-emerald-500" />
              )}
              {currentZone === 'hypo' && (
                <ThermometerSnowflake className="w-5 h-5 text-blue-500" />
              )}
            </SliderPrimitive.Thumb>
          </SliderPrimitive.Root>

          {/* Labels */}
          <div className="absolute right-4 top-4 text-xs font-mono text-rose-500">
            MAX
          </div>
          <div className="absolute right-4 bottom-4 text-xs font-mono text-blue-500">
            MIN
          </div>
        </div>

        {/* Info Panel */}
        <div className="md:col-span-8 relative min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentZone}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <div
                className={`h-full p-8 rounded-2xl border ${activeZone.borderColor} bg-slate-900 relative overflow-hidden`}
              >
                {/* Background Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${activeZone.gradient} opacity-20`}
                />

                {/* Content */}
                <div className="relative z-10 space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3
                        className={`text-3xl font-bold ${activeZone.color} tracking-tight`}
                      >
                        {activeZone.title}
                      </h3>
                      <p className="text-lg text-slate-400 font-medium">
                        {activeZone.subtitle}
                      </p>
                    </div>
                    <div
                      className={`p-4 rounded-2xl ${activeZone.bgColor} bg-opacity-10 border ${activeZone.borderColor}`}
                    >
                      {activeZone.icon}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                    <p className="text-slate-300 leading-relaxed">
                      {activeZone.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-mono uppercase text-slate-500 tracking-wider">
                      Symptoms & Signs
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeZone.symptoms.map((symptom, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50"
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${activeZone.bgColor}`}
                          />
                          <span className="text-sm text-slate-300">
                            {symptom}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                      <Activity className="w-4 h-4" />
                      <span>BIOLOGICAL STATE:</span>
                    </div>
                    <p
                      className={`mt-1 text-sm ${activeZone.color} font-medium`}
                    >
                      {activeZone.biology}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default WindowOfTolerance;
