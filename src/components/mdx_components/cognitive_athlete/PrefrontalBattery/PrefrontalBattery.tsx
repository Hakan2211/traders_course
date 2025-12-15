
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  Html,
} from '@react-three/drei';
import * as THREE from 'three';
import { BatteryState } from './types';

// Augment JSX.IntrinsicElements to include Three.js elements used in R3F.
// This resolves TypeScript errors when R3F global types are not correctly picked up.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      sphereGeometry: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      capsuleGeometry: any;
      meshPhysicalMaterial: any;
      cylinderGeometry: any;
      ambientLight: any;
      pointLight: any;
      spotLight: any;
    }
  }
}

interface SceneProps {
  batteryState: BatteryState;
}

const BatteryMesh = ({ batteryState }: { batteryState: BatteryState }) => {
  const groupRef = useRef<THREE.Group>(null);
  const liquidRef = useRef<THREE.Mesh>(null);

  // Animation logic
  useFrame((state) => {
    if (!groupRef.current) return;

    // Gentle floating
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    groupRef.current.rotation.z =
      Math.cos(state.clock.elapsedTime * 0.15) * 0.05;

    // Glitch effect when low battery
    if (batteryState.isGlitching) {
      const glitchIntensity = 0.05;
      groupRef.current.position.x = (Math.random() - 0.5) * glitchIntensity;
      groupRef.current.position.y = (Math.random() - 0.5) * glitchIntensity;
    } else {
      // Reset position
      groupRef.current.position.lerp(new THREE.Vector3(0, 0, 0), 0.1);
    }

    // Liquid Level Animation (Lerp to target)
    if (liquidRef.current) {
      // Map 0-100 level to physical height logic
      const targetScaleY = Math.max(0.01, batteryState.level / 100);
      liquidRef.current.scale.y = THREE.MathUtils.lerp(
        liquidRef.current.scale.y,
        targetScaleY,
        0.1
      );

      // Adjust position so it shrinks from top down (pivot at bottom)
      // Bottom of cylinder part is at -0.25
      // Center = Bottom + (Height * Scale / 2)
      // Center = -0.25 + (0.5 * Scale / 2) = -0.25 + 0.25 * Scale
      liquidRef.current.position.y = THREE.MathUtils.lerp(
        liquidRef.current.position.y,
        -0.25 + 0.25 * targetScaleY,
        0.1
      );
    }
  });

  return (
    <group ref={groupRef}>
      {/* The Battery Container - Centered and Scaled Up */}
      <group scale={2.5}>
        {/* Glass Shell */}
        <mesh>
          <capsuleGeometry args={[0.25, 0.5, 4, 8]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.9}
            opacity={0.3}
            transparent
            roughness={0.1}
            thickness={0.1}
          />
        </mesh>

        {/* The Liquid (Fuel) */}
        <mesh ref={liquidRef} position={[0, 0, 0]}>
          {/* Cylinder simulating liquid inside capsule */}
          <cylinderGeometry args={[0.2, 0.2, 0.5, 16]} />
          <meshStandardMaterial
            color={batteryState.color}
            emissive={batteryState.color}
            emissiveIntensity={batteryState.isGlitching ? 1 : 2}
            toneMapped={false}
          />
        </mesh>

        {/* Label floating above */}
        <Html position={[0, 0.6, 0]} center>
          <div
            className={`text-xs font-mono px-2 py-1 rounded bg-black/80 backdrop-blur border border-white/10 whitespace-nowrap transition-colors duration-300 ${
              batteryState.isGlitching
                ? 'text-red-500 animate-pulse'
                : 'text-slate-300'
            }`}
          >
            PFC BATTERY: {Math.round(batteryState.level)}%
          </div>
        </Html>
      </group>
    </group>
  );
};

export const PrefrontalBattery: React.FC<SceneProps> = ({ batteryState }) => {
  return (
    <div className="w-full h-96 relative rounded-xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 border border-slate-700 shadow-2xl">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 4]} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />

        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight
          position={[-10, 0, 10]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          color={batteryState.color}
        />

        <BatteryMesh batteryState={batteryState} />

        <Environment preset="city" />
      </Canvas>

      {/* Overlay Title */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <h3 className="text-slate-400 text-sm font-bold tracking-wider uppercase">
          Biological Fuel Gauge
        </h3>
        <p className="text-slate-500 text-xs">
          Prefrontal Cortex Visualization
        </p>
      </div>
    </div>
  );
};
