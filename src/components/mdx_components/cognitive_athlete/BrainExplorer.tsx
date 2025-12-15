
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, BrainCircuit } from 'lucide-react';

type BrainType = 'reptilian' | 'limbic' | 'neocortex';

interface BrainData {
  id: BrainType;
  name: string;
  alias: string;
  age: string;
  role: string;
  motto: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

const brains: BrainData[] = [
  {
    id: 'reptilian',
    name: 'Reptilian Brain',
    alias: 'The Survivor',
    age: '500 Million Years',
    role: 'Survival, Fight/Flight/Freeze',
    motto:
      '"Better safe than sorry. Actually, forget sorry — just stay alive."',
    icon: Shield,
    color: 'text-red-500',
    bg: 'bg-red-500/10 border-red-500/30',
  },
  {
    id: 'limbic',
    name: 'Limbic Brain',
    alias: 'The Socialite',
    age: '200 Million Years',
    role: 'Emotion, Social Status, Pleasure/Pain',
    motto:
      '"If it feels good, do more. If it hurts, stop. What will people think?"',
    icon: Users,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10 border-yellow-400/30',
  },
  {
    id: 'neocortex',
    name: 'Neocortex',
    alias: 'The CEO',
    age: '2-3 Million Years',
    role: 'Logic, Planning, Probability',
    motto: '"Let\'s think this through and optimize for long-term value."',
    icon: BrainCircuit,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/30',
  },
];

export const BrainExplorer: React.FC = () => {
  const [activeBrain, setActiveBrain] = useState<BrainType>('reptilian');

  const activeData = brains.find((b) => b.id === activeBrain)!;

  return (
    <div className="my-12">
      <h3 className="text-2xl font-bold text-slate-100 mb-6 text-center">
        Interactive Model: The Three Executives
      </h3>

      {/* Selector */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {brains.map((brain) => (
          <button
            key={brain.id}
            onClick={() => setActiveBrain(brain.id)}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-full transition-all border
              ${
                activeBrain === brain.id
                  ? `${brain.bg} ${brain.color} font-bold scale-105 shadow-lg`
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
              }
            `}
          >
            <brain.icon className="w-5 h-5" />
            {brain.alias}
          </button>
        ))}
      </div>

      {/* Content Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeBrain}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`p-8 rounded-2xl border ${activeData.bg} backdrop-blur-sm relative overflow-hidden`}
        >
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className={`text-3xl font-bold mb-2 ${activeData.color}`}>
                {activeData.name}
              </h2>
              <h3 className="text-xl text-slate-300 mb-6 font-light">
                {activeData.alias}
              </h3>

              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                    Evolutionary Age
                  </span>
                  <span className="text-slate-200 font-medium">
                    {activeData.age}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                    Core Job
                  </span>
                  <span className="text-slate-200 font-medium">
                    {activeData.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-700/50">
              <span className="text-4xl absolute -top-4 -left-2 opacity-20">
                "
              </span>
              <p className={`text-lg italic font-serif ${activeData.color}`}>
                {activeData.motto}
              </p>
            </div>
          </div>

          {/* Background decoration */}
          <activeData.icon
            className={`absolute -bottom-10 -right-10 w-64 h-64 opacity-5 ${activeData.color}`}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
