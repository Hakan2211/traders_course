
import React, { useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { TraderOrb } from './TraderOrb';
import { UIOverlay } from './UIOverlay';
import { generateSimulationData } from './simulation';
import { SimulationConfig } from './types';

const SIMULATION_CONFIG: SimulationConfig = {
  initialBalance: 10000,
  winRate: 0.55,
  rewardRatio: 2,
  totalTrades: 100,
};

const PositionSizeImpactSphere: React.FC = () => {
  // --- State ---
  const [currentTrade, setCurrentTrade] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTraderId, setSelectedTraderId] = useState<string | null>(null);

  // --- Data ---
  // Memoize data so it doesn't regenerate on every render
  const traders = useMemo(() => generateSimulationData(SIMULATION_CONFIG), []);

  // --- Animation Loop ---
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTrade((prev) => {
          if (prev >= SIMULATION_CONFIG.totalTrades) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 150); // Speed of playback
    }

    return () => clearInterval(interval);
  }, [isPlaying]);

  // --- Handlers ---
  const handleTogglePlay = () => {
    if (currentTrade >= SIMULATION_CONFIG.totalTrades) {
      setCurrentTrade(0); // Restart if at end
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number) => {
    setCurrentTrade(value);
    setIsPlaying(false); // Pause on seek
  };

  return (
    <div className="w-full h-[900px] relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl my-8">
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 18], fov: 45 }}>
          <color attach="background" args={['#020617']} />
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />

          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight
            position={[-10, -10, -5]}
            intensity={0.5}
            color="#4f46e5"
          />

          <group position={[0, -1, 0]}>
            {traders.map((trader, i) => (
              <TraderOrb
                key={trader.id}
                trader={trader}
                position={[(i - 1) * 5, 0, 0]} // Position: Left (-6), Center (0), Right (6)
                tradeIndex={currentTrade}
                isSelected={selectedTraderId === trader.id}
                onSelect={setSelectedTraderId}
              />
            ))}
          </group>

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={10}
            maxDistance={30}
            // Limit vertical angle to prevent going under the "floor"
            maxPolarAngle={Math.PI / 1.5}
          />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <UIOverlay
        traders={traders}
        currentTrade={currentTrade}
        totalTrades={SIMULATION_CONFIG.totalTrades}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onSeek={handleSeek}
        selectedTraderId={selectedTraderId}
      />
    </div>
  );
};

export default PositionSizeImpactSphere;
