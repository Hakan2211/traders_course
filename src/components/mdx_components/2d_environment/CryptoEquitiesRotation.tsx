
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface Phase {
  id: number;
  name: string;
  description: string;
  cryptoVolume: number; // 0-100
  equitiesVolume: number; // 0-100
  flowDirection: 'crypto' | 'equities' | 'neutral';
  color: string;
}

const PHASES: Phase[] = [
  {
    id: 0,
    name: 'Initial State',
    description: 'Balanced volume between crypto and equities',
    cryptoVolume: 50,
    equitiesVolume: 50,
    flowDirection: 'neutral',
    color: '#64748b',
  },
  {
    id: 1,
    name: 'Crypto Surge',
    description: 'Bitcoin and Ethereum volume spikes sharply',
    cryptoVolume: 95,
    equitiesVolume: 30,
    flowDirection: 'crypto',
    color: '#f59e0b',
  },
  {
    id: 2,
    name: 'Equities Drain',
    description: 'Risk-on equities (tech, growth) see volume drop',
    cryptoVolume: 90,
    equitiesVolume: 20,
    flowDirection: 'crypto',
    color: '#ef4444',
  },
  {
    id: 3,
    name: 'Rotation Begins',
    description: 'Capital starts flowing back to equities',
    cryptoVolume: 70,
    equitiesVolume: 40,
    flowDirection: 'equities',
    color: '#3b82f6',
  },
  {
    id: 4,
    name: 'Crypto Crash',
    description: 'Crypto crashes with high volume',
    cryptoVolume: 25,
    equitiesVolume: 85,
    flowDirection: 'equities',
    color: '#10b981',
  },
  {
    id: 5,
    name: 'Equities Recovery',
    description: 'Speculative stocks perk up as capital returns',
    cryptoVolume: 15,
    equitiesVolume: 95,
    flowDirection: 'equities',
    color: '#8b5cf6',
  },
  {
    id: 6,
    name: 'Return to Balance',
    description: 'Cycle completes, returning to equilibrium',
    cryptoVolume: 50,
    equitiesVolume: 50,
    flowDirection: 'neutral',
    color: '#64748b',
  },
];

const TOTAL_PHASES = PHASES.length;
const AUTO_PLAY_INTERVAL = 2000; // 2 seconds per phase

const CryptoEquitiesRotation: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playRef = useRef(isPlaying);
  const phaseRef = useRef(currentPhase);

  useEffect(() => {
    playRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    phaseRef.current = currentPhase;
  }, [currentPhase]);

  // Auto-play loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (!playRef.current) return;
      setCurrentPhase((prev) => {
        const next = prev + 1;
        if (next >= TOTAL_PHASES) {
          return 0; // Loop back to start
        }
        return next;
      });
    }, AUTO_PLAY_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const currentPhaseData = PHASES[currentPhase];

  const handleSliderChange = (value: number[]) => {
    setCurrentPhase(value[0]);
    setIsPlaying(false); // Pause when manually scrubbing
  };

  const resetToStart = () => {
    setCurrentPhase(0);
    setIsPlaying(false);
  };

  return (
    <div className="w-full h-full flex flex-col p-6 gap-4">
      {/* Header */}
      <div className="text-center mb-2">
        <h3 className="text-lg font-semibold text-white mb-1">
          Crypto ↔ Equities Rotation
        </h3>
        <p className="text-xs text-muted-foreground">
          Watch how speculative capital flows between crypto and equities
        </p>
      </div>

      {/* Main Visualization Area */}
      <div className="flex-1 relative flex items-center justify-center gap-8">
        {/* Crypto Side */}
        <div className="flex-1 flex flex-col items-center gap-4">
          <div className="text-center">
            <h4 className="text-sm font-medium text-white mb-1">Crypto</h4>
            <p className="text-xs text-muted-foreground">BTC & ETH</p>
          </div>

          {/* Volume Bar */}
          <div className="w-full max-w-[200px] h-[300px] relative bg-gray-800/50 rounded-lg p-4 flex flex-col justify-end">
            <motion.div
              className="w-full rounded-t-lg relative overflow-hidden"
              style={{
                backgroundColor: currentPhaseData.color,
                opacity: 0.8,
              }}
              initial={false}
              animate={{
                height: `${currentPhaseData.cryptoVolume}%`,
              }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
                animate={{
                  opacity:
                    currentPhaseData.flowDirection === 'crypto' ? 0.6 : 0.2,
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>

            {/* Volume Label */}
            <motion.div
              className="absolute top-2 left-1/2 -translate-x-1/2 text-white font-bold text-lg"
              key={currentPhaseData.cryptoVolume}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {Math.round(currentPhaseData.cryptoVolume)}%
            </motion.div>
          </div>

          {/* Crypto Icons */}
          <div className="flex gap-3">
            <motion.div
              className="w-12 h-12 rounded-full bg-orange-500/20 border-2 flex items-center justify-center"
              style={{ borderColor: currentPhaseData.color }}
              animate={{
                scale: currentPhaseData.flowDirection === 'crypto' ? 1.1 : 1,
                boxShadow:
                  currentPhaseData.flowDirection === 'crypto'
                    ? `0 0 20px ${currentPhaseData.color}`
                    : '0 0 0px transparent',
              }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-xl">₿</span>
            </motion.div>
            <motion.div
              className="w-12 h-12 rounded-full bg-blue-500/20 border-2 flex items-center justify-center"
              style={{ borderColor: currentPhaseData.color }}
              animate={{
                scale: currentPhaseData.flowDirection === 'crypto' ? 1.1 : 1,
                boxShadow:
                  currentPhaseData.flowDirection === 'crypto'
                    ? `0 0 20px ${currentPhaseData.color}`
                    : '0 0 0px transparent',
              }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-xs font-bold">Ξ</span>
            </motion.div>
          </div>
        </div>

        {/* Flow Arrow */}
        <div className="flex flex-col items-center gap-2">
          <motion.div
            className="text-4xl"
            animate={{
              rotate: currentPhaseData.flowDirection === 'crypto' ? 0 : 180,
            }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            {currentPhaseData.flowDirection === 'neutral' ? (
              <span className="text-gray-500">⇄</span>
            ) : (
              <span
                style={{ color: currentPhaseData.color }}
                className="font-bold"
              >
                →
              </span>
            )}
          </motion.div>

          {/* Flow Particles */}
          <AnimatePresence mode="wait">
            {currentPhaseData.flowDirection !== 'neutral' && (
              <motion.div
                key={currentPhaseData.flowDirection}
                className="flex gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: currentPhaseData.color }}
                    animate={{
                      x:
                        currentPhaseData.flowDirection === 'crypto'
                          ? [0, 20, 0]
                          : [0, -20, 0],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Equities Side */}
        <div className="flex-1 flex flex-col items-center gap-4">
          <div className="text-center">
            <h4 className="text-sm font-medium text-white mb-1">Equities</h4>
            <p className="text-xs text-muted-foreground">Tech & Growth</p>
          </div>

          {/* Volume Bar */}
          <div className="w-full max-w-[200px] h-[300px] relative bg-gray-800/50 rounded-lg p-4 flex flex-col justify-end">
            <motion.div
              className="w-full rounded-t-lg relative overflow-hidden"
              style={{
                backgroundColor:
                  currentPhaseData.flowDirection === 'equities'
                    ? currentPhaseData.color
                    : '#64748b',
                opacity: 0.8,
              }}
              initial={false}
              animate={{
                height: `${currentPhaseData.equitiesVolume}%`,
              }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
                animate={{
                  opacity:
                    currentPhaseData.flowDirection === 'equities' ? 0.6 : 0.2,
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>

            {/* Volume Label */}
            <motion.div
              className="absolute top-2 left-1/2 -translate-x-1/2 text-white font-bold text-lg"
              key={currentPhaseData.equitiesVolume}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {Math.round(currentPhaseData.equitiesVolume)}%
            </motion.div>
          </div>

          {/* Equities Icons */}
          <div className="flex gap-3">
            <motion.div
              className="w-12 h-12 rounded-full bg-blue-500/20 border-2 flex items-center justify-center"
              style={{
                borderColor:
                  currentPhaseData.flowDirection === 'equities'
                    ? currentPhaseData.color
                    : '#64748b',
              }}
              animate={{
                scale: currentPhaseData.flowDirection === 'equities' ? 1.1 : 1,
                boxShadow:
                  currentPhaseData.flowDirection === 'equities'
                    ? `0 0 20px ${currentPhaseData.color}`
                    : '0 0 0px transparent',
              }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-xs font-bold">📈</span>
            </motion.div>
            <motion.div
              className="w-12 h-12 rounded-full bg-green-500/20 border-2 flex items-center justify-center"
              style={{
                borderColor:
                  currentPhaseData.flowDirection === 'equities'
                    ? currentPhaseData.color
                    : '#64748b',
              }}
              animate={{
                scale: currentPhaseData.flowDirection === 'equities' ? 1.1 : 1,
                boxShadow:
                  currentPhaseData.flowDirection === 'equities'
                    ? `0 0 20px ${currentPhaseData.color}`
                    : '0 0 0px transparent',
              }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-xs font-bold">💹</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Phase Info */}
      <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="text-sm font-semibold text-white">
              {currentPhaseData.name}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {currentPhaseData.description}
            </p>
          </div>
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: currentPhaseData.color }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            variant={isPlaying ? 'default' : 'secondary'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Play
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setCurrentPhase((prev) => Math.max(0, prev - 1));
              setIsPlaying(false);
            }}
            disabled={currentPhase === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Step Back
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setCurrentPhase((prev) => Math.min(TOTAL_PHASES - 1, prev + 1));
              setIsPlaying(false);
            }}
            disabled={currentPhase === TOTAL_PHASES - 1}
          >
            Step Forward
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          <Button size="sm" variant="outline" onClick={resetToStart}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <div className="flex-1" />
          <span className="text-xs text-muted-foreground tabular-nums">
            Phase {currentPhase + 1} / {TOTAL_PHASES}
          </span>
        </div>

        {/* Timeline Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-muted-foreground">
              Timeline Scrubber
            </Label>
            <span className="text-xs text-muted-foreground tabular-nums">
              {currentPhase + 1} / {TOTAL_PHASES}
            </span>
          </div>
          <Slider
            value={[currentPhase]}
            min={0}
            max={TOTAL_PHASES - 1}
            step={1}
            onValueChange={handleSliderChange}
            className="w-full"
          />
          {/* Phase Labels */}
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            {PHASES.map((phase, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center cursor-pointer"
                onClick={() => {
                  setCurrentPhase(idx);
                  setIsPlaying(false);
                }}
              >
                <div
                  className={`w-1 h-1 rounded-full mb-1 ${
                    idx === currentPhase ? 'w-2 h-2' : ''
                  }`}
                  style={{
                    backgroundColor:
                      idx === currentPhase ? currentPhaseData.color : '#64748b',
                  }}
                />
                <span className="hidden sm:block text-center max-w-[60px] truncate">
                  {phase.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoEquitiesRotation;
