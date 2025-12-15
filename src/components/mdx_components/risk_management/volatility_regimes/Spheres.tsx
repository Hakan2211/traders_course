
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Regime } from './types';
import { Text } from '@react-three/drei';

interface SpheresProps {
  atrMultiplier: number;
  regime: Regime;
}

export const PortfolioSpheres: React.FC<SpheresProps> = ({
  atrMultiplier,
  regime,
}) => {
  const adaptiveRef = useRef<THREE.Mesh>(null);
  const nonAdaptiveRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    // --- Non-Adaptive Trader (Left) ---
    // Does not change size. Gets tossed around violently.
    if (nonAdaptiveRef.current) {
      const shake = atrMultiplier > 1.2 ? (atrMultiplier - 1) * 0.2 : 0;
      nonAdaptiveRef.current.position.y =
        Math.sin(time * 3) * 0.5 + (Math.random() - 0.5) * shake;
      nonAdaptiveRef.current.position.x = -4 + (Math.random() - 0.5) * shake;

      // Color turns redder in crisis
      const material = nonAdaptiveRef.current
        .material as THREE.MeshStandardMaterial;
      if (regime === Regime.CRISIS) {
        material.color.lerp(new THREE.Color('#ef4444'), 0.1);
        material.emissive.lerp(new THREE.Color('#7f1d1d'), 0.1);
      } else {
        material.color.lerp(new THREE.Color('#ef4444'), 0.1);
        material.emissive.lerp(new THREE.Color('#000000'), 0.1);
      }
    }

    // --- Adaptive Trader (Right) ---
    // Shrinks (reduces size) as volatility rises. Floats higher (stays safe).
    if (adaptiveRef.current) {
      // Size reduction formula: Size = Base / Volatility
      const targetScale = Math.max(0.3, 1 / (atrMultiplier * 0.8));

      adaptiveRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );

      // Float higher as volatility increases (safe distance)
      const targetY = atrMultiplier * 1.5;
      adaptiveRef.current.position.y = THREE.MathUtils.lerp(
        adaptiveRef.current.position.y,
        targetY,
        0.05
      );

      // Gentle Bobbing
      adaptiveRef.current.position.y += Math.sin(time * 2) * 0.02;

      const material = adaptiveRef.current
        .material as THREE.MeshStandardMaterial;
      material.color.set('#22c55e');
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Non-Adaptive */}
      <mesh ref={nonAdaptiveRef} position={[-4, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#ef4444" roughness={0.4} metalness={0.6} />
      </mesh>
      <Text
        position={[-4, 2.5, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Non-Adaptive
      </Text>
      <Text
        position={[-4, 2.0, 0]}
        fontSize={0.3}
        color="#fca5a5"
        anchorX="center"
        anchorY="middle"
      >
        Fixed Size (High Risk)
      </Text>

      {/* Adaptive */}
      <mesh ref={adaptiveRef} position={[4, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#22c55e" roughness={0.4} metalness={0.3} />
      </mesh>
      <Text
        position={[4, 3.5, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Adaptive
      </Text>
      <Text
        position={[4, 3.0, 0]}
        fontSize={0.3}
        color="#86efac"
        anchorX="center"
        anchorY="middle"
      >
        Reduces Size (Constant Risk)
      </Text>
    </group>
  );
};
