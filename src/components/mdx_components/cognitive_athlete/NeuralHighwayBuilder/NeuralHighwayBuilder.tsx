
import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

// --- Constants ---
const OLD_PATH_COLOR = '#ef4444'; // Red
const NEW_PATH_COLOR = '#06b6d4'; // Cyan
const DIRT_COLOR = '#57534e'; // Stone-ish brown

// --- Helper Components ---

// Represents a Neural Signal (Traffic)
const Signal = ({
  curve,
  speed,
  color,
  offset,
  active,
}: {
  curve: THREE.CatmullRomCurve3;
  speed: number;
  color: string;
  offset: number;
  active: boolean;
}) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current || !active) return;
    const t = (state.clock.getElapsedTime() * speed + offset) % 1;
    const position = curve.getPointAt(t);
    ref.current.position.copy(position);
  });

  if (!active) return null;

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
      />
      <pointLight distance={1.5} intensity={2} color={color} />
    </mesh>
  );
};

// Represents the Vegetation (Overgrowth)
const Vegetation = ({
  count,
  areaBounds,
  visible,
}: {
  count: number;
  areaBounds: { x: number; z: number };
  visible: number;
}) => {
  const instances = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * areaBounds.x;
      const z = (Math.random() - 0.5) * areaBounds.z;
      // Keep away from center slightly
      if (Math.abs(x) < 1) continue;
      const scale = Math.random() * 0.3 + 0.1;
      temp.push({ position: [x, 0, z], scale });
    }
    return temp;
  }, [count, areaBounds]);

  if (visible <= 0.1) return null;

  return (
    <group>
      {instances.map((data, i) => (
        <mesh
          key={i}
          position={data.position as [number, number, number]}
          scale={[
            data.scale * visible,
            data.scale * visible,
            data.scale * visible,
          ]}
        >
          <coneGeometry args={[0.5, 1.5, 4]} />
          <meshStandardMaterial color="#3f6212" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
};

// Represents a Neural Pathway
const Pathway = ({
  curve,
  width,
  color,
  opacity,
  trafficCount,
  trafficSpeed,
  roughness,
  label,
}: {
  curve: THREE.CatmullRomCurve3;
  width: number;
  color: string;
  opacity: number;
  trafficCount: number;
  trafficSpeed: number;
  roughness: number;
  label: string;
}) => {
  const tubeGeo = useMemo(
    () => new THREE.TubeGeometry(curve, 64, 1, 8, false),
    [curve]
  );

  // Create traffic signals
  const signals = useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => ({
      offset: i * 0.1,
    }));
  }, []);

  return (
    <group>
      {/* Label */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <Text
          position={[curve.getPointAt(0.1).x, 2.5, curve.getPointAt(0.1).z]}
          fontSize={0.4}
          color={color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {label}
        </Text>
      </Float>

      {/* The Road Mesh */}
      <mesh geometry={tubeGeo} scale={[width, width, width]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={opacity * 2} // Glow intensity based on strength
          transparent
          opacity={0.9}
          roughness={roughness}
        />
      </mesh>

      {/* Traffic */}
      {signals.map((sig, i) => (
        <Signal
          key={i}
          curve={curve}
          speed={trafficSpeed}
          color="#ffffff"
          offset={sig.offset}
          active={i < trafficCount}
        />
      ))}
    </group>
  );
};

export const NeuralHighwayBuilder: React.FC = () => {
  const [reps, setReps] = useState(0);

  // --- Derived State for Visuals ---
  const normalizedReps = reps / 1000;

  // OLD HABIT: Starts strong (wide, fast, glowing), ends weak (thin, slow, dim)
  const oldPathWidth = Math.max(0.05, 1.2 - normalizedReps * 1.15);
  const oldPathTrafficCount = Math.floor(10 * (1 - normalizedReps));
  const oldPathSpeed = 0.5 * (1 - normalizedReps);
  const oldPathColor = normalizedReps > 0.8 ? '#44403c' : OLD_PATH_COLOR; // Turns to stone/dead at end
  const oldPathOpacity = Math.max(0, 1 - normalizedReps);

  // NEW HABIT: Starts weak (thin, dirt), ends strong (wide, neon)
  const newPathWidth = Math.max(0.1, 0.1 + normalizedReps * 1.1);
  const newPathTrafficCount = Math.floor(10 * normalizedReps);
  const newPathSpeed = 0.1 + normalizedReps * 0.8;
  const newPathColor = normalizedReps < 0.2 ? DIRT_COLOR : NEW_PATH_COLOR;
  const newPathOpacity = Math.max(0.1, normalizedReps);
  const vegetationVisibility = Math.max(0, 1 - normalizedReps * 2); // Disappears quickly as we build

  // --- Curves ---
  const oldPathCurve = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      points.push(
        new THREE.Vector3(-3 + Math.sin(t * Math.PI) * 2, 0, (t - 0.5) * 15)
      );
    }
    return new THREE.CatmullRomCurve3(points);
  }, []);

  const newPathCurve = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      points.push(
        new THREE.Vector3(3 - Math.sin(t * Math.PI) * 2, 0, (t - 0.5) * 15)
      );
    }
    return new THREE.CatmullRomCurve3(points);
  }, []);

  return (
    <div className="w-full h-[600px] relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl my-8">
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 8, 12], fov: 45 }}>
        <color attach="background" args={['#020617']} />
        <fog attach="fog" args={['#020617', 5, 30]} />

        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />

        <group position={[0, -1, 0]}>
          {/* Ground Plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
            <planeGeometry args={[50, 50, 32, 32]} />
            <meshStandardMaterial
              color="#1e293b"
              wireframe
              transparent
              opacity={0.1}
            />
          </mesh>

          {/* Old Habit Path */}
          <Pathway
            label="Old Habit"
            curve={oldPathCurve}
            width={oldPathWidth}
            color={oldPathColor}
            opacity={oldPathOpacity}
            trafficCount={oldPathTrafficCount}
            trafficSpeed={oldPathSpeed}
            roughness={normalizedReps > 0.5 ? 0.9 : 0.2}
          />

          {/* New Habit Path */}
          <Pathway
            label="New Habit"
            curve={newPathCurve}
            width={newPathWidth}
            color={newPathColor}
            opacity={newPathOpacity}
            trafficCount={newPathTrafficCount}
            trafficSpeed={newPathSpeed}
            roughness={normalizedReps < 0.3 ? 1 : 0.2}
          />

          {/* Overgrowth around new path initially */}
          <Vegetation
            count={60}
            areaBounds={{ x: 6, z: 12 }}
            visible={vegetationVisibility}
          />
        </group>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2 - 0.1}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h3 className="text-white text-lg font-bold">
                Neural Highway Builder
              </h3>
              <p className="text-slate-400 text-sm">
                Drag to simulate repetitions over time
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-mono font-bold text-cyan-400">
                {reps}
              </span>
              <span className="text-slate-500 text-sm ml-2">REPS</span>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="1000"
            step="10"
            value={reps}
            onChange={(e) => setReps(parseInt(e.target.value))}
            className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all"
          />

          <div className="flex justify-between mt-2 text-xs text-slate-500 font-mono">
            <span>Day 1 (Dirt Path)</span>
            <span>Day 66 (Paved)</span>
            <span>Day 365 (Superhighway)</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-slate-900/50 p-3 rounded border border-red-900/30">
              <div className="text-red-400 text-xs font-bold uppercase mb-1">
                Old Habit (Cutting Winners)
              </div>
              <div className="text-slate-300 text-sm">
                Status:{' '}
                <span style={{ opacity: 0.5 + (1 - normalizedReps) * 0.5 }}>
                  {normalizedReps > 0.8
                    ? 'Atrophied'
                    : normalizedReps > 0.4
                    ? 'Weakening'
                    : 'Dominant'}
                </span>
              </div>
            </div>
            <div className="bg-slate-900/50 p-3 rounded border border-cyan-900/30">
              <div className="text-cyan-400 text-xs font-bold uppercase mb-1">
                New Habit (Holding to Target)
              </div>
              <div className="text-slate-300 text-sm">
                Status:{' '}
                <span style={{ opacity: 0.5 + normalizedReps * 0.5 }}>
                  {normalizedReps < 0.2
                    ? 'Hard/Resistant'
                    : normalizedReps < 0.7
                    ? 'Building'
                    : 'Automatic'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
