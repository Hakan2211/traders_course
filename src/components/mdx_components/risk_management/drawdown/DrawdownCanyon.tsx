
import React, { useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  PerspectiveCamera,
  Float,
  Line,
  OrbitControls,
  Environment,
} from '@react-three/drei';
import * as THREE from 'three';
import { EquityPoint } from './types';
import { Eye, MousePointer2 } from 'lucide-react';

// --- Data Generation ---
const generateEquityCurve = (): EquityPoint[] => {
  const points: EquityPoint[] = [];
  const peak = 12000;

  // Scenario: Peak -> Slow Bleed -> Crash -> Recovery
  const scenario = [
    { label: 'PEAK', val: 12000, mood: 'Confidence', desc: 'Top of the world' },
    {
      label: 'Week 1',
      val: 11640,
      mood: 'Neutral',
      desc: 'Small pullback (-3%)',
    },
    {
      label: 'Week 2',
      val: 11400,
      mood: 'Neutral',
      desc: 'Choppy market (-5%)',
    },
    {
      label: 'Week 3',
      val: 11040,
      mood: 'Concern',
      desc: 'Losses mounting (-8%)',
    },
    {
      label: 'Week 5',
      val: 10500,
      mood: 'Worry',
      desc: 'Strategy failing? (-12.5%)',
    },
    {
      label: 'Week 6',
      val: 10200,
      mood: 'Fear',
      desc: 'Fortress breaching (-15%)',
    },
    {
      label: 'Week 8',
      val: 9600,
      mood: 'Panic',
      desc: 'Emergency Protocol (-20%)',
    },
    { label: 'Week 10', val: 9360, mood: 'Despair', desc: 'The Abyss (-22%)' },
    { label: 'Recovery', val: 9800, mood: 'Hope', desc: 'Stabilizing...' },
    {
      label: 'Return',
      val: 10500,
      mood: 'Discipline',
      desc: 'Slow climb back',
    },
    { label: 'Safety', val: 11200, mood: 'Wisdom', desc: 'Lessons learned' },
  ];

  scenario.forEach((step) => {
    const drawdown = ((peak - step.val) / peak) * 100;
    points.push({
      date: step.label,
      value: step.val,
      drawdown: drawdown,
      emotionalState: step.mood,
      description: step.desc,
    });
  });

  return points;
};

// --- 3D Components ---

const CanyonGeometry: React.FC<{ data: EquityPoint[] }> = ({ data }) => {
  const points = useMemo(() => {
    return data.map((d, i) => {
      // X = Time, Y = Equity (scaled), Z = 0
      // Scale equity: 12000 -> 5, 9000 -> -5
      const y = ((d.value - 10680) / 1000) * 4;
      const x = (i - data.length / 2) * 4;
      return new THREE.Vector3(x, y, 0);
    });
  }, [data]);

  return (
    <group>
      {/* The Equity Line */}
      <Line
        points={points}
        color="#3b82f6"
        lineWidth={4}
        opacity={0.8}
        transparent
      />

      {/* Markers */}
      {points.map((pt, i) => (
        <group key={i} position={pt}>
          <mesh>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial
              color={
                data[i].drawdown > 15
                  ? '#ef4444'
                  : data[i].drawdown > 8
                  ? '#f59e0b'
                  : '#22c55e'
              }
              emissive={data[i].drawdown > 15 ? '#7f1d1d' : '#000'}
              emissiveIntensity={2}
            />
          </mesh>
          {/* Vertical line to "ground" */}
          <Line
            points={[pt, new THREE.Vector3(pt.x, -10, pt.z)]}
            color="#334155"
            lineWidth={1}
            dashed
            dashScale={2}
          />
        </group>
      ))}

      {/* Stylized Canyon Walls (Abstract Bars) */}
      {points.map((pt, i) => {
        // Height of wall represents the "Gap" from peak
        const peakY = ((12000 - 10680) / 1000) * 4;
        const currentY = pt.y;
        const drawdownHeight = peakY - currentY;

        if (drawdownHeight < 0.1) return null; // Skip peak

        return (
          <group
            key={`wall-${i}`}
            position={[pt.x, peakY - drawdownHeight / 2, 0]}
          >
            {/* Left Wall Block */}
            <mesh position={[0, 0, -3]}>
              <boxGeometry args={[1, drawdownHeight, 2]} />
              <meshStandardMaterial color="#1e293b" opacity={0.6} transparent />
            </mesh>
            {/* Right Wall Block */}
            <mesh position={[0, 0, 3]}>
              <boxGeometry args={[1, drawdownHeight, 2]} />
              <meshStandardMaterial color="#1e293b" opacity={0.6} transparent />
            </mesh>
            {/* Red "Loss" Fill between */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.8, drawdownHeight, 5.8]} />
              <meshStandardMaterial
                color="#ef4444"
                opacity={0.1}
                transparent
                wireframe
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

const CameraController: React.FC<{
  data: EquityPoint[];
  progress: number;
  setHudData: (d: EquityPoint) => void;
  mode: 'pov' | 'free';
}> = ({ data, progress, setHudData, mode }) => {
  const vec = new THREE.Vector3();

  useFrame((state) => {
    // Calculate current index based on progress (0 to 1)
    const totalPoints = data.length - 1;
    const exactIndex = progress * totalPoints;
    const lowerIndex = Math.floor(exactIndex);
    const upperIndex = Math.min(lowerIndex + 1, totalPoints);
    const alpha = exactIndex - lowerIndex;

    // Interpolate Data for HUD
    if (alpha < 0.5) setHudData(data[lowerIndex]);
    else setHudData(data[upperIndex]);

    // Only control camera in POV mode
    if (mode === 'pov') {
      // Calculate position
      const getPos = (idx: number) => {
        const val = data[idx].value;
        const y = ((val - 10680) / 1000) * 4;
        const x = (idx - data.length / 2) * 4;
        return new THREE.Vector3(x, y, 0);
      };

      const posA = getPos(lowerIndex);
      const posB = getPos(upperIndex);

      // Lerp Camera Target
      const targetX = THREE.MathUtils.lerp(posA.x, posB.x, alpha);
      const targetY = THREE.MathUtils.lerp(posA.y, posB.y, alpha);

      // Bird's Eye / Chase Cam
      // Position: Behind (X-), Above (Y+), Centered (Z=0)
      // This creates a view looking down the canyon
      state.camera.position.lerp(vec.set(targetX - 12, targetY + 8, 0), 0.1);
      state.camera.lookAt(targetX + 10, targetY, 0);
    }

    // Dynamic Fog based on depth (Drawdown)
    const drawdown = data[lowerIndex].drawdown;
    const fogDensity = 0.02 + (drawdown / 100) * 0.15;
    if (state.scene.fog) {
      // Direct property manipulation for performance
      // @ts-ignore
      state.scene.fog.density = THREE.MathUtils.lerp(
        // @ts-ignore
        state.scene.fog.density,
        fogDensity,
        0.05
      );
    }
  });

  return null;
};

// --- Main Export ---

export const DrawdownCanyon = () => {
  const equityData = useMemo(() => generateEquityCurve(), []);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hudData, setHudData] = useState<EquityPoint>(equityData[0]);
  const [cameraMode, setCameraMode] = useState<'pov' | 'free'>('pov');

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          setIsPlaying(false);
          return 1;
        }
        return prev + 0.003;
      });
    }, 16);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgress(parseFloat(e.target.value));
    setIsPlaying(false);
    // If user interacts with slider, maybe stay in POV? Or let them slide in free mode?
    // Let's keep current mode.
  };

  const getStatusColor = (dd: number) => {
    if (dd > 20) return 'text-red-500';
    if (dd > 10) return 'text-amber-500';
    return 'text-green-500';
  };

  return (
    <div className="relative w-full h-[800px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl my-10 group">
      {/* 3D Canvas */}
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 65]} fov={50} />
        <color attach="background" args={['#020617']} />
        <fogExp2 attach="fog" args={['#020617', 0.05]} />

        {/* Enhanced Lighting */}
        <ambientLight intensity={0.5} />
        <hemisphereLight
          args={['#3b82f6', '#ef4444', 0.5]}
          groundColor="#000000"
        />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#3b82f6" />
        <pointLight
          position={[-10, -10, -10]}
          intensity={1}
          color="#ef4444"
          distance={20}
        />

        {/* Components */}
        <CanyonGeometry data={equityData} />
        <CameraController
          data={equityData}
          progress={progress}
          setHudData={setHudData}
          mode={cameraMode}
        />

        {cameraMode === 'free' && (
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.05}
            minDistance={5}
            maxDistance={50}
            maxPolarAngle={Math.PI / 1.5}
          />
        )}

        <gridHelper
          args={[100, 50, '#1e293b', '#0f172a']}
          position={[0, -10, 0]}
        />
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          {/* Particles or Floating debris could go here */}
        </Float>
      </Canvas>

      {/* Mode Toggle Button */}
      <div className="absolute top-6 right-6 z-20 flex gap-2">
        <button
          onClick={() => {
            setCameraMode('pov');
            setIsPlaying(false); // Stop playing when switching modes to avoid conflict
          }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors ${
            cameraMode === 'pov'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <Eye size={16} /> POV
        </button>
        <button
          onClick={() => {
            setCameraMode('free');
            setIsPlaying(false);
          }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors ${
            cameraMode === 'free'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <MousePointer2 size={16} /> Free Look
        </button>
      </div>

      {/* HUD Overlay */}
      <div className="absolute top-6 left-6 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-6 rounded-lg shadow-xl w-80">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Simulation Status
          </span>
          <div
            className={`w-3 h-3 rounded-full ${
              isPlaying ? 'bg-green-500 animate-pulse' : 'bg-slate-500'
            }`}
          ></div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-sm text-slate-400">Current Equity</div>
            <div className="text-3xl font-mono font-bold text-white">
              ${hudData.value.toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-400 mb-1">Drawdown</div>
              <div
                className={`text-xl font-bold font-mono ${getStatusColor(
                  hudData.drawdown
                )}`}
              >
                -{hudData.drawdown.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">State</div>
              <div className="text-sm font-semibold text-blue-300 bg-blue-900/30 px-2 py-1 rounded border border-blue-800/50 inline-block">
                {hudData.emotionalState}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <div className="text-xs italic text-slate-400">
              "{hudData.description}"
            </div>
            {hudData.drawdown > 0 && (
              <div className="mt-2 text-xs text-slate-500">
                Recovery Needed:{' '}
                <span className="text-amber-400 font-mono">
                  +
                  {(
                    (100 * hudData.drawdown) /
                    (100 - hudData.drawdown)
                  ).toFixed(1)}
                  %
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 to-transparent p-6 pt-20 flex flex-col items-center">
        <div className="w-full max-w-2xl flex items-center gap-4 bg-slate-900/80 p-4 rounded-full border border-slate-700 backdrop-blur">
          <button
            onClick={() => {
              if (cameraMode === 'free') setCameraMode('pov'); // Auto switch to POV if playing
              setIsPlaying(!isPlaying);
            }}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg flex-shrink-0"
          >
            {isPlaying ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={progress}
            onChange={handleSliderChange}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <span className="text-xs font-mono text-slate-400 min-w-[60px] text-right">
            {Math.round(progress * 100)}%
          </span>
        </div>
        <p className="text-slate-500 text-xs mt-2 font-mono">
          Drag slider or press Play to experience the siege
        </p>
      </div>

      {/* Title Overlay (Only show if not in free mode to avoid clutter?) - keeping it for now */}
      <div className="absolute top-20 right-6 text-right pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
        <h3 className="text-2xl font-bold text-white tracking-tighter">
          THE CANYON
        </h3>
        <p className="text-sm text-slate-400">Visualizing Equity Decay</p>
      </div>
    </div>
  );
};
