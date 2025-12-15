
import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import {
  EffectComposer,
  Vignette,
  ChromaticAberration,
  Noise,
  Bloom,
} from '@react-three/postprocessing';
import * as THREE from 'three';
import { BlendFunction } from 'postprocessing';

// --- Textures & Materials ---

function ChartTexture({
  type,
  panicLevel,
}: {
  type: 'center' | 'side';
  panicLevel: number;
}) {
  const canvas = useMemo(() => {
    if (typeof document === 'undefined') return null; // SSR safety

    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 256;
    const ctx = c.getContext('2d')!;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 256);

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i < 512; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.stroke();
    }
    for (let i = 0; i < 256; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }

    if (type === 'center') {
      // Big falling candles
      let y = 50;
      for (let x = 50; x < 450; x += 20) {
        const move = Math.random() > 0.3 ? 15 : -5;
        const color = move > 0 ? '#ef4444' : '#22c55e';
        const h = Math.abs(move) * 2;

        ctx.fillStyle = color;
        // Thicker candles
        ctx.fillRect(x, y, 16, h);
        ctx.strokeStyle = color;
        // Thicker wicks
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 8, y - 5);
        ctx.lineTo(x + 8, y + h + 5);
        ctx.stroke();

        y += move;
        if (y > 200) y = 200;
        if (y < 20) y = 20;
      }

      // Text - Larger and bolder
      ctx.fillStyle = '#ef4444';
      ctx.font = '900 60px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('- $51,347', 300, 100); // Centered horizontally
    } else {
      // Side monitor clutter - Larger blocks
      ctx.fillStyle = '#334155';
      for (let i = 0; i < 8; i++) {
        ctx.fillRect(30, 30 + i * 25, 450, 15);
        ctx.fillStyle = Math.random() > 0.5 ? '#334155' : '#475569';
      }
    }
    return c;
  }, [type]);

  if (!canvas) return null;
  return <canvasTexture attach="map" image={canvas} />;
}

// --- Scene Components ---

const Monitor = ({ position, rotation, type, panicLevel }: any) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Frame */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[2.2, 1.3, 0.1]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[2.1, 1.2]} />
        <meshBasicMaterial toneMapped={false}>
          <ChartTexture type={type} panicLevel={panicLevel} />
        </meshBasicMaterial>
      </mesh>
      {/* Stand */}
      <mesh position={[0, -0.8, -0.2]}>
        <cylinderGeometry args={[0.05, 0.1, 0.8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
};

const Desk = () => (
  <mesh position={[0, -2, 0]} rotation={[-0.1, 0, 0]}>
    <boxGeometry args={[6, 0.2, 3]} />
    <meshStandardMaterial color="#0f172a" />
  </mesh>
);

const CameraRig = ({ panicLevel }: { panicLevel: number }) => {
  const cam = useRef<THREE.PerspectiveCamera>(null);

  useFrame((state) => {
    if (!cam.current) return;

    // Heartbeat Effect: Rhythmic Zoom/Pulse
    const t = state.clock.getElapsedTime();
    // Heart rate increases with panicLevel (60bpm base -> 160bpm max)
    const bpm = 60 + panicLevel * 100;
    const freq = bpm / 60;

    const pulse = Math.sin(t * freq * Math.PI * 2) * (0.05 * panicLevel);

    // Camera Shake
    const shakeX = (Math.random() - 0.5) * 0.1 * panicLevel;
    const shakeY = (Math.random() - 0.5) * 0.1 * panicLevel;
    // Vertigo Effect (Zolly-ish)
    // As panic increases, FOV narrows (tunnel) but camera pulls back slightly, or vice versa
    const baseFov = 50;
    // Tunnel vision implies narrowing of focus
    cam.current.fov = baseFov - panicLevel * 35 + pulse * 5;
    cam.current.updateProjectionMatrix();
    cam.current.position.x = shakeX;
    cam.current.position.y = shakeY;
    cam.current.position.z = 8 - panicLevel * 0.5 + pulse;

    cam.current.lookAt(0, 0, 0);
  });
  return <PerspectiveCamera makeDefault ref={cam} position={[0, 0, 4]} />;
};

const SceneContent = ({ panicLevel }: { panicLevel: number }) => {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight
        position={[0, 3, 2]}
        intensity={1}
        color={panicLevel > 0.8 ? '#ffcccc' : '#ffffff'}
      />

      <Monitor
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        type="center"
        panicLevel={panicLevel}
      />
      <Monitor
        position={[-2.3, 0, 0.5]}
        rotation={[0, 0.5, 0]}
        type="side"
        panicLevel={panicLevel}
      />
      <Monitor
        position={[2.3, 0, 0.5]}
        rotation={[0, -0.5, 0]}
        type="side"
        panicLevel={panicLevel}
      />

      <Desk />

      <CameraRig panicLevel={panicLevel} />
      <EffectComposer disableNormalPass>
        {/* Vignette: Simulates Tunnel Vision */}
        <Vignette
          eskil={false}
          offset={0.1}
          darkness={0.4 + panicLevel * 0.6} // Gets very dark at edges
        />
        {/* Chromatic Aberration: Simulates disorientation/dizziness */}
        <ChromaticAberration
          offset={new THREE.Vector2(panicLevel * 0.02, panicLevel * 0.002)}
          radialModulation={true}
          modulationOffset={0.5}
        />
        {/* Noise: Visual static/stress */}
        <Noise
          opacity={panicLevel * 0.5}
          blendFunction={BlendFunction.OVERLAY}
        />
        {/* Bloom: Makes the red numbers glare */}
        <Bloom luminanceThreshold={0.5} intensity={0.5 + panicLevel * 1} />
      </EffectComposer>
    </>
  );
};

export const TunnelVisionSimulation = () => {
  const [panicLevel, setPanicLevel] = useState(0); // 0 to 1
  const getBPM = (level: number) => Math.round(70 + level * 80);

  return (
    <div className="w-full h-[800px] bg-black rounded-xl overflow-hidden relative border border-slate-700 shadow-2xl my-8">
      <div className="absolute top-0 left-0 w-full z-10 p-6 bg-gradient-to-b from-black/80 to-transparent">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          Simulation: The Amygdala Hijack
        </h3>
        <p className="text-slate-300 text-sm mb-4 max-w-lg">
          Use the slider to simulate the physiological effects on your vision
          and focus as stress increases.
        </p>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Baseline</span>
              <span>Hijack (100%)</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={panicLevel}
              onChange={(e) => setPanicLevel(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
          </div>
          <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded text-center min-w-[100px]">
            <div className="text-xs text-slate-400">Heart Rate</div>
            <div
              className={`text-xl font-mono font-bold ${
                panicLevel > 0.6
                  ? 'text-red-500 animate-pulse'
                  : 'text-green-400'
              }`}
            >
              {getBPM(panicLevel)} <span className="text-xs">BPM</span>
            </div>
          </div>
        </div>
      </div>
      <Canvas>
        <SceneContent panicLevel={panicLevel} />
      </Canvas>
      {/* Overlay warnings at high panic */}
      {panicLevel > 0.8 && (
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
          <div className="text-red-600/20 font-black text-9xl uppercase tracking-tighter animate-pulse select-none">
            FIGHT
            <br />
            OR
            <br />
            FLIGHT
          </div>
        </div>
      )}
    </div>
  );
};
