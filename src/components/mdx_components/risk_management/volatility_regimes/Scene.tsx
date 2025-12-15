
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Terrain from './Terrain';
import { PortfolioSpheres } from './Spheres';
import Atmosphere from './Atmosphere';
import { MarketState } from './types';

interface SceneProps {
  marketState: MarketState;
}

const Scene: React.FC<SceneProps> = ({ marketState }) => {
  return (
    <div className="w-full h-[800px] rounded-2xl overflow-hidden shadow-2xl relative bg-black">
      <Canvas camera={{ position: [30, 8, 35], fov: 45 }}>
        <Atmosphere regime={marketState.regime} />

        <Terrain
          atrMultiplier={marketState.atrMultiplier}
          regime={marketState.regime}
        />
        <PortfolioSpheres
          atrMultiplier={marketState.atrMultiplier}
          regime={marketState.regime}
        />

        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />

        <OrbitControls
          enableZoom={true}
          maxPolarAngle={Math.PI / 2 - 0.1} // Prevent going under the ground
          minDistance={5}
          maxDistance={30}
        />

        {/* Simple grid to give scale context, fades out in chaos */}
        <gridHelper
          args={[60, 60, 0xffffff, 0x222222]}
          position={[0, -2.1, 0]}
        />
      </Canvas>

      {/* Overlay Text for PnL simulation */}
      <div className="absolute bottom-6 left-6 pointer-events-none">
        <div className="flex gap-4">
          <div className="bg-black/50 backdrop-blur border border-red-500/30 p-4 rounded-lg">
            <h4 className="text-xs text-red-300 uppercase font-bold mb-1">
              Non-Adaptive P&L
            </h4>
            <div className="text-2xl font-mono text-red-500">
              {marketState.atrMultiplier > 1.5
                ? `-${Math.min(99, marketState.atrMultiplier * 15).toFixed(1)}%`
                : `+${(5 - marketState.atrMultiplier).toFixed(1)}%`}
            </div>
            <div className="text-[10px] text-red-400/70 mt-1">
              High Volatility = Destruction
            </div>
          </div>
          <div className="bg-black/50 backdrop-blur border border-green-500/30 p-4 rounded-lg">
            <h4 className="text-xs text-green-300 uppercase font-bold mb-1">
              Adaptive P&L
            </h4>
            <div className="text-2xl font-mono text-green-500">
              {marketState.atrMultiplier > 3
                ? `-2.5%`
                : `+${(4 - marketState.atrMultiplier * 0.5).toFixed(1)}%`}
            </div>
            <div className="text-[10px] text-green-400/70 mt-1">
              Consistent Risk Control
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scene;
