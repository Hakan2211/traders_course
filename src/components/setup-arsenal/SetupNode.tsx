import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { SetupData } from './types';

interface SetupNodeProps {
  setup: SetupData;
  isSelected: boolean;
  onSelect: (setup: SetupData) => void;
}

export const SetupNode: React.FC<SetupNodeProps> = ({
  setup,
  isSelected,
  onSelect,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  // useFrame((state, delta) => {
  //   if (meshRef.current) {
  //     // Gentle rotation
  //     meshRef.current.rotation.x += delta * 0.2;
  //     meshRef.current.rotation.y += delta * 0.15;

  //     // Pulse effect if hovered or selected
  //     const scale = isSelected ? 1.5 : hovered ? 1.2 : 1;
  //     meshRef.current.scale.lerp(
  //       new THREE.Vector3(scale, scale, scale),
  //       delta * 10
  //     );
  //   }
  // });

  return (
    <group position={new THREE.Vector3(...setup.position)}>
      {/* Visual Mesh */}
      <mesh
        ref={meshRef}
        onClick={(e: React.MouseEvent<THREE.Mesh>) => {
          e.stopPropagation();
          onSelect(setup);
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
          setHover(true);
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
          setHover(false);
        }}
      >
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial
          color={setup.color}
          emissive={setup.color}
          emissiveIntensity={isSelected ? 2 : hovered ? 1 : 0.4}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Connecting Line to base (Visual Anchor) */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, 0, -setup.position[1] - 5, 0])} // Drop line to "floor"
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={setup.color} opacity={0.2} transparent />
      </line>

      {/* Label (Visible on Hover/Select) */}
      {(hovered || isSelected) && (
        <Html
          position={[0, 0.6, 0]}
          center
          distanceFactor={10}
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-black/80 backdrop-blur-md text-white px-2 py-1 rounded border border-white/20 text-xs whitespace-nowrap font-mono">
            {setup.name}
          </div>
        </Html>
      )}
    </group>
  );
};
