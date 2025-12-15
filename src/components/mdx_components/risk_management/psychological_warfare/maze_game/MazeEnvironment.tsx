
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Color, BackSide, MeshStandardMaterial } from 'three';
import { Stars, Text, Float, Grid } from '@react-three/drei';
import { RoomData, GameStatus } from './types';

// Augment JSX namespace to recognize Three.js intrinsic elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      fog: any;
      ambientLight: any;
      pointLight: any;
      planeGeometry: any;
      meshStandardMaterial: any;
      boxGeometry: any;
    }
  }
}

interface MazeEnvironmentProps {
  room: RoomData;
  gameStatus: GameStatus;
  choiceResult: boolean | null;
}

export const MazeEnvironment: React.FC<MazeEnvironmentProps> = ({
  room,
  gameStatus,
  choiceResult,
}) => {
  const meshRef = useRef<Mesh>(null);
  const leftWallRef = useRef<Mesh>(null);
  const rightWallRef = useRef<Mesh>(null);
  const floorRef = useRef<Mesh>(null);
  const ceilingRef = useRef<Mesh>(null);

  // Dynamic color for the environment based on the room theme
  const themeColor = useMemo(
    () => new Color(room.colorTheme),
    [room.colorTheme]
  );

  useFrame((state, delta) => {
    // Animation Logic based on Trap Type and Status

    // 1. Loss Aversion: Walls Closing
    if (room.visualTrap === 'walls-closing') {
      if (leftWallRef.current && rightWallRef.current) {
        if (gameStatus === 'PLAYING') {
          // Slowly close walls
          const speed = 0.5;
          // Start closer for "Narrow Corridor" feel
          if (leftWallRef.current.position.x < -2.5) {
            leftWallRef.current.position.x += delta * speed;
          }
          if (rightWallRef.current.position.x > 2.5) {
            rightWallRef.current.position.x -= delta * speed;
          }
        } else if (gameStatus === 'FEEDBACK') {
          if (choiceResult === false) {
            // CRUSH
            if (leftWallRef.current.position.x < -0.5)
              leftWallRef.current.position.x += delta * 8;
            if (rightWallRef.current.position.x > 0.5)
              rightWallRef.current.position.x -= delta * 8;
          } else {
            // Reset / Open up
            if (leftWallRef.current.position.x > -6)
              leftWallRef.current.position.x -= delta * 4;
            if (rightWallRef.current.position.x < 6)
              rightWallRef.current.position.x += delta * 4;
          }
        } else {
          // Reset positions for new room (Intro/Game Over)
          leftWallRef.current.position.x = -6;
          rightWallRef.current.position.x = 6;
        }
      }
    } else {
      // For non-wall rooms, keep them wide but visible
      // We animate them out to a fixed wide position if they were close
      const targetX = 10; // Wide corridor
      const speed = 5;

      if (leftWallRef.current) {
        // Lerp to target
        if (leftWallRef.current.position.x > -targetX)
          leftWallRef.current.position.x -= delta * speed;
        else leftWallRef.current.position.x = -targetX;
      }
      if (rightWallRef.current) {
        if (rightWallRef.current.position.x < targetX)
          rightWallRef.current.position.x += delta * speed;
        else rightWallRef.current.position.x = targetX;
      }
    }

    // 2. Overconfidence: Pit
    if (room.visualTrap === 'pit' && floorRef.current) {
      if (gameStatus === 'FEEDBACK' && choiceResult === false) {
        floorRef.current.position.y -= delta * 10; // Fall fast
      } else {
        floorRef.current.position.y = -2; // Reset
      }
    }

    // 3. Sunk Cost: Quicksand (Camera sinking handled in parent, visual handled here)
    if (room.visualTrap === 'quicksand' && floorRef.current) {
      // Pulse the floor opacity/color
      const material = floorRef.current.material as MeshStandardMaterial;
      if (material) {
        material.opacity = 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
        material.transparent = true;
      }
    }
  });

  return (
    <group>
      {/* Dynamic Fog - adjusted for better visibility */}
      <fog
        attach="fog"
        args={[
          room.colorTheme,
          5, // Near
          gameStatus === 'FEEDBACK' && !choiceResult
            ? 10 // Very dense if failed
            : 40, // Far visibility
        ]}
      />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight
        position={[0, 4, 0]}
        intensity={2}
        color={themeColor}
        distance={20}
        decay={2}
      />
      <pointLight position={[0, 2, 5]} intensity={1} color="white" />

      {/* Rim light for walls to make them pop */}
      <pointLight
        position={[0, 0, -20]}
        intensity={5}
        color={themeColor}
        distance={30}
      />

      {/* Environment Group with Float for 3D feel */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        {/* Floor with Grid for perspective */}
        <group position={[0, -2.01, 0]}>
          <Grid
            position={[0, 0, 0]}
            args={[50, 200]}
            cellSize={2}
            cellThickness={1}
            cellColor={new Color(room.colorTheme).multiplyScalar(2)}
            sectionSize={10}
            sectionThickness={1.5}
            sectionColor={new Color(room.colorTheme)}
            fadeDistance={50}
            infiniteGrid
          />
        </group>

        <mesh
          ref={floorRef}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -2.1, 0]} // Slightly below grid
        >
          <planeGeometry args={[100, 200]} />
          <meshStandardMaterial
            color={
              room.visualTrap === 'pit'
                ? '#b45309' // Gold-ish brown
                : room.visualTrap === 'quicksand'
                ? '#3f2e21'
                : '#050505' // Very dark floor normally to let grid shine
            }
            roughness={room.visualTrap === 'mirrors' ? 0.05 : 0.8}
            metalness={room.visualTrap === 'mirrors' ? 0.95 : 0.2}
          />
        </mesh>

        {/* Ceiling */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 8, 0]}>
          <planeGeometry args={[50, 200]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>

        {/* Left Wall */}
        <mesh ref={leftWallRef} position={[-6, 3, 0]}>
          <boxGeometry args={[1, 12, 200]} />
          <meshStandardMaterial
            color={new Color(room.colorTheme).multiplyScalar(0.2)} // Tint walls slightly with room theme
            metalness={room.visualTrap === 'mirrors' ? 0.9 : 0.6}
            roughness={room.visualTrap === 'mirrors' ? 0.1 : 0.4}
          />
          {/* Add a glowing stripe to the wall */}
          <mesh position={[0.51, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[200, 0.5]} />
            <meshStandardMaterial
              color={room.colorTheme}
              emissive={room.colorTheme}
              emissiveIntensity={2}
            />
          </mesh>
        </mesh>

        {/* Right Wall */}
        <mesh ref={rightWallRef} position={[6, 3, 0]}>
          <boxGeometry args={[1, 12, 200]} />
          <meshStandardMaterial
            color={new Color(room.colorTheme).multiplyScalar(0.2)}
            metalness={room.visualTrap === 'mirrors' ? 0.9 : 0.6}
            roughness={room.visualTrap === 'mirrors' ? 0.1 : 0.4}
          />
          {/* Add a glowing stripe to the wall */}
          <mesh position={[-0.51, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[200, 0.5]} />
            <meshStandardMaterial
              color={room.colorTheme}
              emissive={room.colorTheme}
              emissiveIntensity={2}
            />
          </mesh>
        </mesh>

        {/* Pillars for depth perception */}
        {[-20, -40, -60, -80].map((z) => (
          <group key={z} position={[0, 0, z]}>
            {/* Left Pillar */}
            <mesh position={[-6, 3, 0]}>
              <boxGeometry args={[2, 12, 2]} />
              <meshStandardMaterial color="#111" />
            </mesh>
            {/* Right Pillar */}
            <mesh position={[6, 3, 0]}>
              <boxGeometry args={[2, 12, 2]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          </group>
        ))}

        {/* 3D Text for Room Title floating in distance */}
        <group position={[0, 1, -15]}>
          <Text
            color={themeColor}
            fontSize={2}
            maxWidth={8} // Reduced width to prevent clipping
            lineHeight={1}
            letterSpacing={0.05}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="#000"
          >
            {room.biasName}
          </Text>
        </group>
      </Float>

      {/* Floating Particles/Stars for movement effect */}
      <Stars
        radius={40}
        depth={60}
        count={5000}
        factor={4}
        saturation={0.5}
        fade
        speed={1}
      />
    </group>
  );
};
