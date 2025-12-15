
import React, { useRef, useMemo, useState, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { GraveData, TraderArchetype } from './types';

interface GravesProps {
  count: number;
  filter: string;
  onHover: (data: GraveData | null) => void;
}

const CAUSES_OF_DEATH = [
  'Risked 20% per trade',
  'Averaged down on loser',
  'Revenge traded',
  'No Stop Loss',
  '100:1 Leverage',
  'Emotional spiral',
  'Ignored correlation',
  'Martingale strategy',
  'Panic sold bottom',
  'FOMO bought top',
];

const ARCHETYPES = Object.values(TraderArchetype);

export const Graves: React.FC<GravesProps> = ({ count, filter, onHover }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // Generate static data for graves once
  const gravesData = useMemo(() => {
    const temp: GraveData[] = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 150; // Wide spread
      const z = (Math.random() - 0.5) * 150 - 20; // Deep spread
      const scaleY = 0.5 + Math.random() * 0.5;

      temp.push({
        id: i,
        position: [x, 0, z],
        rotation: [0, (Math.random() - 0.5) * 0.5, 0], // Slight random rotation
        causeOfDeath:
          CAUSES_OF_DEATH[Math.floor(Math.random() * CAUSES_OF_DEATH.length)],
        archetype: ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)],
        daysSurvived: Math.floor(Math.random() * 30) + 1, // Most die fast
        lossAmount: `$${(Math.random() * 5000 + 500).toFixed(2)}`,
      });
    }
    return temp.sort((a, b) => b.position[2] - a.position[2]); // Sort back to front for painter alg if needed, mostly for logic
  }, [count]);

  // Color helper
  const color = useMemo(() => new THREE.Color(), []);
  const tempObject = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!meshRef.current) return;

    // Initialize instance colors - brighter base colors
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      colors[i * 3] = 0.4;
      colors[i * 3 + 1] = 0.4;
      colors[i * 3 + 2] = 0.47;
    }
    meshRef.current.geometry.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(colors, 3)
    );

    gravesData.forEach((grave, i) => {
      tempObject.position.set(grave.position[0], 0.4, grave.position[2]);
      tempObject.rotation.set(
        grave.rotation[0],
        grave.rotation[1],
        grave.rotation[2]
      );
      tempObject.scale.set(0.4, 0.8, 0.15); // Tombstone shape
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [gravesData, tempObject, count]);

  // Update colors based on filter and hover state
  useFrame(() => {
    if (!meshRef.current) return;

    gravesData.forEach((grave, i) => {
      let isVisible = filter === 'All' || grave.archetype === filter;

      // Base color
      if (isVisible) {
        if (i === hoveredId) {
          color.setHex(0xffaa00); // Glowing Orange for hover
          color.multiplyScalar(2); // Bloom effect
        } else {
          // Specific colors for archetypes if filtered, otherwise stone grey
          switch (grave.archetype) {
            case TraderArchetype.SCALPER:
              color.setHex(0x886666);
              break; // Reddish
            case TraderArchetype.GAMBLER:
              color.setHex(0x668866);
              break; // Greenish
            default:
              color.setHex(0x666677); // Grey/Blue - brighter for visibility
          }
        }
      } else {
        color.setHex(0x111111); // Fade into background
      }

      meshRef.current.setColorAt(i, color);
    });

    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const instanceId = e.instanceId;
    if (instanceId !== undefined && instanceId !== hoveredId) {
      setHoveredId(instanceId);
      onHover(gravesData[instanceId]);
      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerOut = () => {
    setHoveredId(null);
    onHover(null);
    document.body.style.cursor = 'auto';
  };

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        roughness={0.9}
        metalness={0.1}
        vertexColors={true}
      />
    </instancedMesh>
  );
};
