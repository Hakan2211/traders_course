
import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Html, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { Position, Correlation } from './types';
import { ASSET_COLORS } from './constants';

interface GraphProps {
  positions: Position[];
  correlations: Correlation[];
  crisisMode: boolean;
}

// Helper for 3D force layout
const useForceLayout = (
  positions: Position[],
  correlations: Correlation[],
  crisisMode: boolean
) => {
  // Store positions in a ref to avoid re-renders on every frame
  const nodePositions = useRef<Map<string, THREE.Vector3>>(new Map());
  const velocities = useRef<Map<string, THREE.Vector3>>(new Map());

  // Initialize positions
  useEffect(() => {
    // Add new nodes
    positions.forEach((pos) => {
      if (!nodePositions.current.has(pos.id)) {
        nodePositions.current.set(
          pos.id,
          new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
          )
        );
        velocities.current.set(pos.id, new THREE.Vector3(0, 0, 0));
      }
    });

    // Cleanup old nodes
    const currentIds = new Set(positions.map((p) => p.id));
    for (const id of nodePositions.current.keys()) {
      if (!currentIds.has(id)) {
        nodePositions.current.delete(id);
        velocities.current.delete(id);
      }
    }
  }, [positions]);

  useFrame(() => {
    const nodes = positions;
    const links = correlations;
    const dt = 0.016; // Fixed delta roughly 60fps

    // Physics parameters
    const repulsion = 15;
    const springLen = crisisMode ? 0.5 : 4; // Snaps together in crisis
    const springStrength = crisisMode ? 5.0 : 0.5;
    const gravity = 0.05;
    const drag = 0.95; // Damping

    // 1. Repulsion (Coulomb-like)
    nodes.forEach((nodeA) => {
      const posA = nodePositions.current.get(nodeA.id);
      const velA = velocities.current.get(nodeA.id);

      if (!posA || !velA) return;

      nodes.forEach((nodeB) => {
        if (nodeA.id === nodeB.id) return;
        const posB = nodePositions.current.get(nodeB.id);
        if (!posB) return;

        const diff = new THREE.Vector3().subVectors(posA, posB);
        const distSq = diff.lengthSq();

        // Avoid singularity
        if (distSq < 0.1) diff.set(Math.random(), Math.random(), Math.random());

        const force = diff
          .normalize()
          .multiplyScalar(repulsion / (distSq + 0.1));
        velA.add(force.multiplyScalar(dt));
      });

      // 2. Center Gravity
      const centerForce = posA
        .clone()
        .negate()
        .multiplyScalar(gravity * dt);
      velA.add(centerForce);
    });

    // 3. Attraction (Hooke's Law for correlations)
    links.forEach((link) => {
      const posA = nodePositions.current.get(link.source);
      const posB = nodePositions.current.get(link.target);

      if (posA && posB) {
        const velA = velocities.current.get(link.source);
        const velB = velocities.current.get(link.target);

        if (velA && velB) {
          const diff = new THREE.Vector3().subVectors(posB, posA);
          const dist = diff.length();

          // Correlation strength affects pull
          // High correlation = Stronger pull, tighter spring
          // Crisis mode overrides to max
          const val = crisisMode ? 1.0 : Math.abs(link.value);
          const strength = springStrength * (val * 2); // Amplify correlation effect

          const targetLen = springLen * (1 - val * 0.5); // Highly correlated = closer
          const force = diff
            .normalize()
            .multiplyScalar((dist - targetLen) * strength * dt);

          velA.add(force);
          velB.sub(force); // Newton's 3rd law
        }
      }
    });

    // 4. Update Positions
    nodes.forEach((node) => {
      const pos = nodePositions.current.get(node.id);
      const vel = velocities.current.get(node.id);

      if (pos && vel) {
        vel.multiplyScalar(drag); // Friction
        pos.add(vel.clone().multiplyScalar(dt));
      }
    });
  });

  return nodePositions;
};

const Node = ({
  position,
  data,
  isCrisis,
}: {
  position: [number, number, number];
  data: Position;
  isCrisis: boolean;
}) => {
  const [hovered, setHovered] = useState(false);

  const visuals = ASSET_COLORS[data.type];
  const color = isCrisis ? '#ef4444' : visuals.color;
  const emissive = isCrisis ? '#7f1d1d' : visuals.emissive;

  // Size based on risk (0.5% - 3.0%) -> 0.3 - 0.8
  const size = 0.3 + data.risk / 5;

  return (
    <group position={position}>
      {/* Label on Hover */}
      <Billboard>
        <Html
          position={[0, size + 0.2, 0]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div
            className={`
            transition-opacity duration-200 
            ${hovered ? 'opacity-100' : 'opacity-0'}
            bg-slate-900/90 border border-slate-700 
            px-3 py-1.5 rounded-lg text-xs whitespace-nowrap backdrop-blur-md
            flex flex-col items-center gap-0.5 shadow-xl
          `}
          >
            <span className="font-bold text-white">{data.name}</span>
            <span className="text-slate-400">
              {data.type} • Risk: {data.risk}%
            </span>
          </div>
        </Html>
      </Billboard>

      {/* The Sphere */}
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshPhysicalMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={hovered || isCrisis ? 2 : 0.5}
          roughness={0.2}
          metalness={0.8}
          transmission={0.2}
          thickness={1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Outer Ring for selection/hover */}
      {hovered && (
        <mesh>
          <ringGeometry args={[size + 0.1, size + 0.15, 32]} />
          <meshBasicMaterial
            color="white"
            side={THREE.DoubleSide}
            transparent
            opacity={0.5}
          />
        </mesh>
      )}
    </group>
  );
};

const Connection = ({
  start,
  end,
  value,
  isCrisis,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  value: number;
  isCrisis: boolean;
}) => {
  const absValue = Math.abs(value);

  // Don't render very weak correlations to reduce clutter, unless in crisis
  if (absValue < 0.2 && !isCrisis) return null;

  // Color Mapping
  let color = '#4ade80'; // Green
  if (isCrisis) color = '#ef4444'; // Red
  else if (value > 0.7) color = '#ef4444'; // Red
  else if (value > 0.4) color = '#facc15'; // Yellow
  else if (value < -0.4) color = '#22d3ee'; // Cyan (Inverse)

  const width = isCrisis ? 3 : Math.max(0.5, absValue * 3);
  const opacity = isCrisis ? 0.8 : Math.max(0.1, absValue * 0.6);

  return (
    <Line
      points={[start, end]}
      color={color}
      lineWidth={width}
      transparent
      opacity={opacity}
      depthWrite={false}
    />
  );
};

export const Graph = (props: GraphProps) => {
  const nodePositionsRef = useForceLayout(
    props.positions,
    props.correlations,
    props.crisisMode
  );
  // Trigger re-render for animation loop, though useFrame handles position updates, React needs to know to re-render lines?
  // Actually, useFrame updates refs, but the Line component from Drei might need prop updates if points change?
  // Drei Line takes points array. If points array is new reference, it updates.
  // We need to force update React component to pass new positions to Line.
  const [frameTick, setFrameTick] = useState(0);

  useFrame(() => {
    setFrameTick((prev) => (prev + 1) % 2);
  });

  return (
    <group>
      {props.positions.map((pos) => {
        const vec =
          nodePositionsRef.current.get(pos.id) || new THREE.Vector3(0, 0, 0);
        return (
          <Node
            key={pos.id}
            position={[vec.x, vec.y, vec.z]}
            data={pos}
            isCrisis={props.crisisMode}
          />
        );
      })}

      {props.correlations.map((link, idx) => {
        const start = nodePositionsRef.current.get(link.source);
        const end = nodePositionsRef.current.get(link.target);

        if (!start || !end) return null;

        return (
          <Connection
            key={`${link.source}-${link.target}-${idx}`}
            start={start}
            end={end}
            value={link.value}
            isCrisis={props.crisisMode}
          />
        );
      })}
    </group>
  );
};
