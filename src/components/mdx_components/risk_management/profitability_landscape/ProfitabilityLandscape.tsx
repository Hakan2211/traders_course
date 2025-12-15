
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Html,
  Line,
  Sphere,
  PerspectiveCamera,
  Ring,
} from '@react-three/drei';
import * as THREE from 'three';
import { useControls, Leva } from 'leva';
import { Waypoint, MarkerData, TooltipData } from './types';

// Explicitly declare R3F elements to fix JSX.IntrinsicElements errors
declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      meshStandardMaterial: any;
      group: any;
      gridHelper: any;
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
    }
  }
}

// --- Math & Constants ---
const MIN_WR = 0.2;
const MAX_WR = 0.8;
const MIN_RR = 0.5;
const MAX_RR = 5.0;
const WR_RANGE = MAX_WR - MIN_WR;
const RR_RANGE = MAX_RR - MIN_RR;

// Dimensions of the 3D plane
const PLANE_WIDTH = 40; // X-axis (Win Rate)
const PLANE_DEPTH = 40; // Z-axis (RR)
const HEIGHT_SCALE = 15; // Y-axis (Profitability exaggeration)

// Convert data to 3D world coordinates
const dataToWorld = (wr: number, rr: number) => {
  const x = ((wr - MIN_WR) / WR_RANGE) * PLANE_WIDTH - PLANE_WIDTH / 2;
  const z = ((rr - MIN_RR) / RR_RANGE) * PLANE_DEPTH - PLANE_DEPTH / 2;

  // Expectancy Formula: (Win% * Reward) - (Loss% * Risk) assuming Risk is 1
  const expectancy = wr * rr - (1 - wr) * 1;
  const y = expectancy * HEIGHT_SCALE;

  return new THREE.Vector3(x, y, -z); // Invert Z to make positive RR go "up/away" visually if preferred, or standard logic
};

// --- Sub-Components ---

// 1. The Colorful Surface
const SurfaceMesh = ({
  setTooltip,
}: {
  setTooltip: (data: TooltipData) => void;
}) => {
  const { wireframe, opacity } = useControls('Surface', {
    wireframe: false,
    opacity: { value: 0.9, min: 0.1, max: 1.0 },
  });

  const geometry = useMemo(() => {
    const segmentsW = 80;
    const segmentsH = 80;
    const geo = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const indices = [];

    // Generate Vertices and Colors
    for (let i = 0; i <= segmentsH; i++) {
      const v = i / segmentsH;
      const rr = MIN_RR + v * RR_RANGE; // Z axis logical
      for (let j = 0; j <= segmentsW; j++) {
        const u = j / segmentsW;
        const wr = MIN_WR + u * WR_RANGE; // X axis logical
        const pos = dataToWorld(wr, rr);
        vertices.push(pos.x, pos.y, pos.z);

        // Color Logic: Red (negative) -> Grey (0) -> Green (positive)
        const expectancy = wr * rr - (1 - wr) * 1;
        const color = new THREE.Color();

        if (expectancy < 0) {
          // Deep red to light red
          const t = Math.max(0, 1 + expectancy / 1.5); // Clamp
          color.setHSL(0.0, 0.9, 0.2 + t * 0.3);
        } else {
          // Light green to neon green
          const t = Math.min(1, expectancy / 3);
          color.setHSL(0.33, 0.9, 0.2 + t * 0.4);
        }

        colors.push(color.r, color.g, color.b);
      }
    }

    // Generate Indices
    for (let i = 0; i < segmentsH; i++) {
      for (let j = 0; j < segmentsW; j++) {
        const a = i * (segmentsW + 1) + j;
        const b = i * (segmentsW + 1) + j + 1;
        const c = (i + 1) * (segmentsW + 1) + j;
        const d = (i + 1) * (segmentsW + 1) + j + 1;

        indices.push(a, b, d);
        indices.push(a, d, c);
      }
    }

    geo.setIndex(indices);
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh
      geometry={geometry}
      onPointerMove={(e: any) => {
        e.stopPropagation();
        // Calculate relative position within the container if possible,
        // but the simpler fix for "too far away" is often just offsetting correctly from the mouse event
        // relative to the container.
        // We will handle the calculation in the parent component's render for the tooltip.
        // Here we just pass the raw clientX/Y.

        // Reverse calculate generic position to data
        const localPoint = e.point; // approximation
        // Simple mapping based on bounds
        const xPct = (localPoint.x + PLANE_WIDTH / 2) / PLANE_WIDTH;
        const zPct = (-localPoint.z + PLANE_DEPTH / 2) / PLANE_DEPTH;

        const wr = MIN_WR + xPct * WR_RANGE;
        const rr = MIN_RR + zPct * RR_RANGE;
        const exp = wr * rr - (1 - wr) * 1;

        setTooltip({
          x: e.clientX,
          y: e.clientY,
          wr: Math.max(MIN_WR, Math.min(MAX_WR, wr)),
          rr: Math.max(MIN_RR, Math.min(MAX_RR, rr)),
          expectancy: exp,
        });
      }}
      onPointerOut={() => setTooltip(null)}
    >
      <meshStandardMaterial
        vertexColors
        side={THREE.DoubleSide}
        wireframe={wireframe}
        transparent
        opacity={opacity}
        roughness={0.4}
        metalness={0.1}
      />
    </mesh>
  );
};

// 2. The Breakeven Line (Visual Guide)
const BreakevenLine = () => {
  const points = useMemo(() => {
    const pts = [];
    // Breakeven: WR = 1 / (1 + RR) => RR = (1/WR) - 1
    // Iterate through RR from min to max
    for (let rr = MIN_RR; rr <= MAX_RR; rr += 0.05) {
      const wr = 1 / (1 + rr);
      if (wr >= MIN_WR && wr <= MAX_WR) {
        // Lift slightly above surface to avoid z-fighting
        const pos = dataToWorld(wr, rr);
        pos.y += 0.2;
        pts.push(pos);
      }
    }
    return pts;
  }, []);

  return <Line points={points} color="white" lineWidth={3} dashed={false} />;
};

// 3. Coordinate Labels & Grid
const GridSystem = () => {
  const breakevenPos = dataToWorld(0.33, 2).add(new THREE.Vector3(0, 3, 0));

  return (
    <group>
      <gridHelper
        args={[PLANE_WIDTH, 10, '#334155', '#1e293b']}
        position={[0, -10, 0]}
      />
      {/* X Axis Labels (Win Rate) */}
      <Html
        position={[-PLANE_WIDTH / 2, -5, PLANE_DEPTH / 2 + 2]}
        center
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            color: '#94a3b8',
            fontSize: '24px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}
        >
          20%
        </div>
      </Html>
      <Html
        position={[0, -5, PLANE_DEPTH / 2 + 2]}
        center
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            color: '#94a3b8',
            fontSize: '24px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}
        >
          50%
        </div>
      </Html>
      <Html
        position={[PLANE_WIDTH / 2, -5, PLANE_DEPTH / 2 + 2]}
        center
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            color: '#94a3b8',
            fontSize: '24px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}
        >
          80%
        </div>
      </Html>
      <Html
        position={[0, -8, PLANE_DEPTH / 2 + 2]}
        center
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            color: '#cbd5e1',
            fontSize: '32px',
            fontWeight: 800,
            whiteSpace: 'nowrap',
          }}
        >
          WIN RATE
        </div>
      </Html>

      {/* Z Axis Labels (RR) - positioned on the side */}
      <group
        position={[PLANE_WIDTH / 2 + 4, -5, PLANE_DEPTH / 2]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
      >
        <Html center style={{ pointerEvents: 'none' }}>
          <div
            style={{
              color: '#94a3b8',
              fontSize: '24px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
          >
            0.5
          </div>
        </Html>
      </group>
      <group
        position={[PLANE_WIDTH / 2 + 4, -5, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
      >
        <Html center style={{ pointerEvents: 'none' }}>
          <div
            style={{
              color: '#94a3b8',
              fontSize: '24px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
          >
            2.75
          </div>
        </Html>
      </group>
      <group
        position={[PLANE_WIDTH / 2 + 4, -5, -PLANE_DEPTH / 2]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
      >
        <Html center style={{ pointerEvents: 'none' }}>
          <div
            style={{
              color: '#94a3b8',
              fontSize: '24px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
          >
            5.0
          </div>
        </Html>
      </group>
      <group
        position={[PLANE_WIDTH / 2 + 8, -5, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
      >
        <Html center style={{ pointerEvents: 'none' }}>
          <div
            style={{
              color: '#cbd5e1',
              fontSize: '32px',
              fontWeight: 800,
              whiteSpace: 'nowrap',
            }}
          >
            RISK:REWARD RATIO
          </div>
        </Html>
      </group>

      {/* Breakeven Label */}
      <Html
        position={[breakevenPos.x, breakevenPos.y, breakevenPos.z]}
        center
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            color: 'white',
            fontSize: '16px',
            fontWeight: 500,
            textShadow: '0 0 4px black, 0 0 4px black, 0 0 4px black',
            whiteSpace: 'nowrap',
          }}
        >
          Breakeven Line
        </div>
      </Html>
    </group>
  );
};

// 4. Markers
const Marker = ({ data }: { data: MarkerData }) => {
  const pos = dataToWorld(data.wr, data.rr);

  return (
    <group position={pos}>
      <Sphere args={[0.5, 16, 16]} position={[0, 0.5, 0]}>
        <meshStandardMaterial
          color={data.color}
          emissive={data.color}
          emissiveIntensity={2}
        />
      </Sphere>
      <Line
        points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 8, 0)]}
        color={data.color}
        lineWidth={1}
      />
      <Html position={[0, 9, 0]} center>
        <div className="bg-slate-900/90 text-white text-xs p-2 rounded border border-slate-700 whitespace-nowrap backdrop-blur-md shadow-xl">
          <div className="font-bold text-yellow-400">{data.label}</div>
          <div>
            WR: {(data.wr * 100).toFixed(0)}% | RR: 1:{data.rr}
          </div>
        </div>
      </Html>
    </group>
  );
};

// New component to highlight current waypoint target area
const WaypointHighlight = ({
  target,
}: {
  target: [number, number, number];
}) => {
  const ref = useRef<any>();
  useFrame((state) => {
    if (ref.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      ref.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={[target[0], target[1], target[2]]}>
      {/* Pulsating Ring */}
      <Ring args={[1, 1.2, 32]} rotation={[-Math.PI / 2, 0, 0]} ref={ref}>
        <meshBasicMaterial
          color="#fbbf24"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </Ring>
      {/* Vertical Line Indicator */}
      <Line
        points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 20, 0)]}
        color="#fbbf24"
        lineWidth={2}
        transparent
        opacity={0.5}
        dashed
      />
    </group>
  );
};

// 5. Camera Controller for Tour
const CameraController = ({
  currentWaypoint,
  isPlaying,
}: {
  currentWaypoint: Waypoint;
  isPlaying: boolean;
}) => {
  const { camera, controls } = useThree();
  const vec = new THREE.Vector3();
  const targetVec = new THREE.Vector3();

  useFrame((state, delta) => {
    if (isPlaying && controls) {
      // Smoothly interpolate camera position
      vec.set(...currentWaypoint.cameraPos);
      camera.position.lerp(vec, 2 * delta);

      // Smoothly interpolate controls target
      targetVec.set(...currentWaypoint.target);
      // @ts-ignore - orbit controls has target
      (controls as any).target.lerp(targetVec, 2 * delta);
      // @ts-ignore
      (controls as any).update();
    }
  });

  return null;
};

// --- Main Component ---
const ProfitabilityLandscape = () => {
  const [tooltip, setTooltip] = useState<TooltipData>(null);
  const [tourIndex, setTourIndex] = useState(0);
  const [isTourActive, setIsTourActive] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Waypoints definition
  const waypoints: Waypoint[] = useMemo(
    () => [
      {
        id: 0,
        title: 'The Valley of Ruin',
        description:
          'Low Win Rate + Low Risk-Reward. This is where accounts die slowly.',
        cameraPos: [0, 20, 45],
        target: [
          dataToWorld(0.3, 0.5).x,
          dataToWorld(0.3, 0.5).y,
          dataToWorld(0.3, 0.5).z,
        ] as [number, number, number],
        stats: '30% WR × 1:0.5 RR = -35% Expectancy',
        warning: true,
      },
      {
        id: 1,
        title: 'The Breakeven Ridge',
        description:
          'The fine line between profit and loss. Notice the curve: Higher RR needs lower WR.',
        cameraPos: [30, 30, 0],
        target: [0, 0, 0],
        formula: 'WR = 1 / (1 + RR)',
      },
      {
        id: 2,
        title: "The Amateur's Plateau",
        description:
          'High Win Rate but Low RR. You feel like a winner, but profits are small and fragile.',
        cameraPos: [-20, 20, 30],
        target: [
          dataToWorld(0.65, 1).x,
          dataToWorld(0.65, 1).y,
          dataToWorld(0.65, 1).z,
        ] as [number, number, number],
        stats: '65% WR × 1:1 RR = +30% Expectancy',
      },
      {
        id: 3,
        title: "The Professional's Peak",
        description:
          'The Sweet Spot. Moderate Win Rate, High Asymmetry. Sustainable wealth.',
        cameraPos: [-35, 40, -20],
        target: [
          dataToWorld(0.45, 3).x,
          dataToWorld(0.45, 3).y,
          dataToWorld(0.45, 3).z,
        ] as [number, number, number],
        stats: '45% WR × 1:3 RR = +80% Expectancy',
      },
      {
        id: 4,
        title: 'The Unrealistic Summit',
        description:
          'Extreme RR. Mathematically superior, but psychologically impossible due to losing streaks.',
        cameraPos: [0, 50, -40],
        target: [
          dataToWorld(0.25, 5).x,
          dataToWorld(0.25, 5).y,
          dataToWorld(0.25, 5).z,
        ] as [number, number, number],
        warning: true,
      },
    ],
    []
  );

  const nextStop = () => {
    setTourIndex((prev) => (prev + 1) % waypoints.length);
    setIsTourActive(true);
  };

  const prevStop = () => {
    setTourIndex((prev) => (prev - 1 + waypoints.length) % waypoints.length);
    setIsTourActive(true);
  };

  const currentWp = waypoints[tourIndex];

  // Tooltip positioning logic
  const getTooltipStyle = () => {
    if (!tooltip || !containerRef.current) return { display: 'none' };

    const rect = containerRef.current.getBoundingClientRect();
    // Calculate relative position
    const x = tooltip.x - rect.left;
    const y = tooltip.y - rect.top;

    return {
      top: y + 15, // Slight offset
      left: x + 15,
    };
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[900px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl my-8"
    >
      <div className="absolute top-0 left-0 z-10 p-4 pointer-events-none">
        <h2 className="text-xl font-bold text-yellow-400 tracking-wider">
          PROFITABILITY LANDSCAPE
        </h2>
        <div className="flex gap-2 mt-2 pointer-events-auto">
          <button
            onClick={() => setIsTourActive(!isTourActive)}
            className={`px-3 py-1 text-xs rounded border transition-colors ${
              isTourActive
                ? 'bg-yellow-500 text-black border-yellow-500 hover:bg-yellow-400'
                : 'bg-transparent text-slate-400 border-slate-600 hover:text-white hover:border-white'
            }`}
          >
            {isTourActive ? 'Pause Tour (Free Roam)' : 'Resume Tour'}
          </button>
        </div>
      </div>

      {/* Leva controls hidden for clean look, but initialized */}
      <div className="hidden">
        <Leva />
      </div>
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[40, 20, 130]} fov={50} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 - 0.1} // Prevent going under the plane
          enabled={!isTourActive} // Disable controls during tour to prevent fighting
          onStart={() => setIsTourActive(false)} // User interaction pauses tour
        />

        <ambientLight intensity={0.5} color="#cbd5e1" />
        <directionalLight position={[50, 50, 20]} intensity={1.5} castShadow />
        <pointLight position={[-20, 20, -20]} intensity={0.8} color="#4ade80" />
        <pointLight position={[20, -10, 20]} intensity={0.5} color="#f87171" />

        <SurfaceMesh setTooltip={setTooltip} />
        <BreakevenLine />
        <GridSystem />

        {/* Dynamic Markers */}
        <Marker
          data={{ label: 'Avg Beginner', wr: 0.55, rr: 0.8, color: '#f87171' }}
        />
        <Marker
          data={{ label: 'Professional', wr: 0.45, rr: 2.5, color: '#4ade80' }}
        />

        {/* Waypoint Highlight */}
        {isTourActive && <WaypointHighlight target={currentWp.target} />}

        {/* Tour Controller */}
        <CameraController
          currentWaypoint={currentWp}
          isPlaying={isTourActive}
        />
      </Canvas>

      {/* UI Overlays */}

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-20 pointer-events-none bg-black/80 backdrop-blur text-white p-3 rounded-lg border border-slate-600 text-sm shadow-xl"
          style={getTooltipStyle()}
        >
          <div className="font-semibold text-slate-300 mb-1">Coordinates</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span>Win Rate:</span>{' '}
            <span className="text-right text-blue-300">
              {(tooltip.wr * 100).toFixed(1)}%
            </span>
            <span>RR Ratio:</span>{' '}
            <span className="text-right text-purple-300">
              1:{tooltip.rr.toFixed(2)}
            </span>
            <span>Expectancy:</span>{' '}
            <span
              className={`text-right font-bold ${
                tooltip.expectancy > 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {tooltip.expectancy > 0 ? '+' : ''}
              {(tooltip.expectancy * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* Tour Panel */}
      <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl p-6 shadow-2xl transition-all duration-500 z-30">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
            Waypoint {tourIndex + 1}/{waypoints.length}
          </span>
          {currentWp.warning && (
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
              WARNING
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-white mb-2">{currentWp.title}</h3>
        <p className="text-slate-300 text-sm leading-relaxed mb-4">
          {currentWp.description}
        </p>

        {currentWp.stats && (
          <div className="bg-slate-800/50 rounded p-2 mb-4 font-mono text-xs text-green-300 border-l-2 border-green-500">
            {currentWp.stats}
          </div>
        )}

        {currentWp.formula && (
          <div className="bg-slate-800/50 rounded p-2 mb-4 font-mono text-xs text-blue-300 border-l-2 border-blue-500">
            {currentWp.formula}
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={prevStop}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="flex gap-1">
            {waypoints.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  i === tourIndex ? 'bg-yellow-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
          <button
            onClick={nextStop}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-slate-900/50 backdrop-blur rounded p-2 text-xs border border-slate-800 pointer-events-none">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>{' '}
          <span>Profit Zone</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full border border-white bg-transparent"></div>{' '}
          <span>Breakeven</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>{' '}
          <span>Loss Zone</span>
        </div>
      </div>
    </div>
  );
};

export default ProfitabilityLandscape;
