
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { TraderProfile } from './types';
import './SphereShader'; // Register shader

interface TraderOrbProps {
  trader: TraderProfile;
  position: [number, number, number];
  tradeIndex: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const TraderOrb: React.FC<TraderOrbProps> = ({
  trader,
  position,
  tradeIndex,
  isSelected,
  onSelect,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  // Extract current data state
  const currentBalance = trader.data.balance[tradeIndex];
  const currentDrawdown = trader.data.drawdown[tradeIndex];
  const currentStress = trader.data.stressLevel[tradeIndex];
  const isAlive = trader.data.isAlive[tradeIndex];

  // Calculate health (0 to 1)
  // Health is a factor of drawdown and aliveness.
  // 0% DD = 1.0 Health. 50% DD = 0.5 Health. Dead = 0.0.
  let health = isAlive ? Math.max(0, 1 - currentDrawdown / 80) : 0;
  if (!isAlive) health = 0;

  // Calculate Scale based on balance (relative to initial)
  // Clamp scale to avoid disappearing or taking over screen
  const scaleRatio = Math.max(
    0.4,
    Math.min(2.5, currentBalance / trader.initialBalance)
  );

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime += delta;

      // Smoothly interpolate values for visual fidelity
      materialRef.current.uHealth = THREE.MathUtils.lerp(
        materialRef.current.uHealth,
        health,
        delta * 3
      );
      materialRef.current.uStress = THREE.MathUtils.lerp(
        materialRef.current.uStress,
        currentStress,
        delta * 3
      );
      materialRef.current.uHover = THREE.MathUtils.lerp(
        materialRef.current.uHover,
        hovered || isSelected ? 1.0 : 0.0,
        delta * 10
      );
    }

    // Smooth Scale
    if (meshRef.current) {
      const targetScale = scaleRatio * 1.5; // Base size multiplier
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        delta * 4
      );

      // Idle floating rotation
      meshRef.current.rotation.y += delta * 0.2;
      meshRef.current.rotation.z += delta * 0.05;
    }
  });

  // Determine Emoji
  const getEmoji = () => {
    if (!isAlive) return '💀';
    if (currentStress > 0.7) return '😱';
    if (currentStress > 0.4) return '😰';
    if (currentBalance > trader.initialBalance * 1.5) return '🤑';
    if (currentBalance > trader.initialBalance * 1.1) return '😎';
    return '😐';
  };

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh
          ref={meshRef}
          onClick={() => onSelect(trader.id)}
          onPointerOver={() => {
            document.body.style.cursor = 'pointer';
            setHovered(true);
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
            setHovered(false);
          }}
        >
          <sphereGeometry args={[1, 64, 64]} />
          <impactMaterial ref={materialRef} transparent />
        </mesh>
      </Float>

      {/* Label */}
      <Html position={[0, -2.2, 0]} center pointerEvents="none">
        <div className="flex flex-col items-center justify-center w-48 text-center select-none">
          <span
            className={`text-sm font-bold transition-colors duration-300 ${
              isSelected ? 'text-white' : 'text-slate-400'
            }`}
          >
            {trader.name}
          </span>
          <span className="text-xs text-slate-500 mt-0.5">
            {trader.description}
          </span>
        </div>
      </Html>

      {/* Floating HTML Stats overlay (Always faces camera) */}
      <Html position={[0, 2.5, 0]} center pointerEvents="none">
        <div
          className={`flex flex-col items-center transition-opacity duration-300 ${
            isSelected || hovered ? 'opacity-100' : 'opacity-60'
          }`}
        >
          <div className="text-4xl filter drop-shadow-lg animate-bounce duration-[2000ms]">
            {getEmoji()}
          </div>
          {(isSelected || hovered) && (
            <div className="mt-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono whitespace-nowrap">
              <span
                className={
                  currentBalance >= trader.initialBalance
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }
              >
                $
                {currentBalance.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </span>
              <span className="text-slate-500 mx-1">|</span>
              <span className="text-amber-400">
                DD: {Math.round(currentDrawdown)}%
              </span>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};
