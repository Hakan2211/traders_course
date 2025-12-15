
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Coin } from './Coin';
import { GameState, CONSTANTS } from './types';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      cylinderGeometry: any;
      primitive: any;
      meshStandardMaterial: any;
      ambientLight: any;
      spotLight: any;
      planeGeometry: any;
      boxGeometry: any;
    }
  }
}

interface GameSceneProps {
  gameState: GameState;
  currentResult: any;
}

const VelvetTable = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
    <planeGeometry args={[50, 50]} />
    <meshStandardMaterial color="#4a0404" roughness={0.8} metalness={0.1} />
  </mesh>
);

const BarChart = ({
  capital,
  startCapital,
}: {
  capital: number;
  startCapital: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      // Animate height
      const targetHeight = (capital / startCapital) * 3; // Scale factor
      meshRef.current.scale.y = THREE.MathUtils.lerp(
        meshRef.current.scale.y,
        Math.max(0.1, targetHeight),
        0.1
      );
      meshRef.current.position.y = meshRef.current.scale.y / 2;
    }
  });

  const isProfitable = capital >= startCapital;
  const color = isProfitable ? '#10b981' : '#ef4444';

  return (
    <group position={[-3, 0, -2]}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.8}
          emissive={color}
          emissiveIntensity={0.4}
        />
      </mesh>
      <Text
        position={[-1, 3, 1]}
        rotation={[0, 0, 0]}
        fontSize={0.25}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        CAPITAL
      </Text>
    </group>
  );
};

export const GameScene: React.FC<GameSceneProps> = ({
  gameState,
  currentResult,
}) => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <spotLight
        position={[5, 10, 5]}
        angle={0.4}
        penumbra={0.5}
        intensity={1}
        castShadow
      />
      <Environment preset="studio" />

      <group position={[0, -1, 0]}>
        <VelvetTable />
        <ContactShadows
          position={[0, 0.01, 0]}
          resolution={1024}
          scale={20}
          blur={2}
          opacity={0.5}
          far={10}
          color="#000000"
        />

        <Coin
          isFlipping={gameState.isFlipping}
          result={currentResult ? currentResult.side : null}
        />

        <BarChart
          capital={gameState.capital}
          startCapital={CONSTANTS.STARTING_CAPITAL}
        />
      </group>
    </>
  );
};
