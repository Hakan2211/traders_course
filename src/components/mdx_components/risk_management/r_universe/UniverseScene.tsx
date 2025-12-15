
import React from 'react';
import { Canvas } from '@react-three/fiber';
import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
  Stars,
} from '@react-three/drei';
import { Trade } from './types';
import { TradeMesh } from './TradeMesh';

interface UniverseSceneProps {
  trades: Trade[];
  visibleTradeIds: Set<number>;
  onHover: (trade: Trade | null, x: number, y: number) => void;
}

export const UniverseScene: React.FC<UniverseSceneProps> = ({
  trades,
  visibleTradeIds,
  onHover,
}) => (
  <Canvas
    className="w-full h-full"
    dpr={[1, 2]}
    shadows
    gl={{ antialias: true }}
  >
    <PerspectiveCamera makeDefault position={[-50, 20, 30]} fov={40} />
    <color attach="background" args={['#01040a']} />
    <Stars radius={80} depth={40} count={4000} factor={3.5} fade speed={1} />

    <ambientLight intensity={0.25} />
    <pointLight position={[12, 18, 12]} intensity={1.2} castShadow />
    <pointLight position={[-10, 12, -8]} intensity={0.6} color="#60a5fa" />

    <group position={[0, -2, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -18]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial
          color="#0f172a"
          transparent
          opacity={0.4}
          roughness={0.9}
        />
      </mesh>
      <gridHelper
        args={[120, 60, 0x1d4ed8, 0x0f172a]}
        position={[0, 0.02, -18]}
      />
      <TradeMesh
        trades={trades}
        visibleTradeIds={visibleTradeIds}
        onHover={onHover}
      />
    </group>

    <OrbitControls enablePan enableZoom maxPolarAngle={Math.PI / 1.6} />
    <Environment preset="city" />
  </Canvas>
);
