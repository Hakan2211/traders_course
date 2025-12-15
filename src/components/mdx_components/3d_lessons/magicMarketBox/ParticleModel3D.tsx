
import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useControls, LevaPanel, useCreateStore } from 'leva';
import * as THREE from 'three';

interface ParticleModel3DProps {
  levaStore: ReturnType<typeof useCreateStore>;
}

// Shader material for particle coloring (point rendering)
// Note: particleSize will be passed as a uniform
const particleVertexShader = `
  attribute float particleColor;
  uniform float uParticleSize;
  varying vec3 vColor;
  
  void main() {
    vec3 pos = position;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Point size from uniform
    gl_PointSize = uParticleSize;
    
    // Color based on particleColor (0 = neutral, 1 = red, 2 = green)
    if (particleColor < 0.5) {
      vColor = vec3(0.7, 0.7, 0.7); // Neutral gray
    } else if (particleColor < 1.5) {
      vColor = vec3(0.9, 0.2, 0.2); // Red
    } else {
      vColor = vec3(0.2, 0.9, 0.2); // Green
    }
  }
`;

const particleFragmentShader = `
  varying vec3 vColor;
  
  void main() {
    // Create circular point shape
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;
    
    // Smooth edge
    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
    gl_FragColor = vec4(vColor, alpha);
  }
`;

export function ParticleModel3D({ levaStore }: ParticleModel3DProps) {
  const instancedMeshRef = useRef<THREE.Points>(null);
  const currentPositionsRef = useRef<Float32Array>(new Float32Array(0));
  const velocitiesRef = useRef<Float32Array>(new Float32Array(0));
  const [tooltipParticles, setTooltipParticles] = useState<{
    red: number | null;
    green: number | null;
  }>({ red: null, green: null });

  // Leva controls
  const {
    particleCount,
    particleSize,
    showColors,
    enableMotion,
    showTooltips,
  } = useControls(
    'Particle Model',
    {
      particleCount: {
        value: 5000,
        min: 100,
        max: 100000,
        step: 100,
        label: 'Particle Count',
      },
      particleSize: {
        value: 4.0,
        min: 1.0,
        max: 20.0,
        step: 0.5,
        label: 'Particle Size',
      },
      showColors: {
        value: false,
        label: 'Show Red/Green Colors',
      },
      enableMotion: {
        value: false,
        label: 'Enable Brownian Motion',
      },
      showTooltips: {
        value: false,
        label: 'Show Tooltips',
      },
    },
    { store: levaStore }
  );

  // Calculate box size based on particle count (cubic root scaling)
  const boxSize = useMemo(() => {
    // Scale box size based on particle count
    // More particles = bigger box
    const baseSize = 1;
    const scaleFactor = Math.pow(particleCount / 1000, 1 / 3);
    return baseSize * scaleFactor;
  }, [particleCount]);

  // Generate particle positions on box surface
  const { positions, colors, velocities } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount);
    const vel = new Float32Array(particleCount * 3);
    const halfSize = boxSize;

    // Distribute particles throughout the box volume (not just surface)
    for (let i = 0; i < particleCount; i++) {
      // Random position inside the box volume
      const x = (Math.random() * 2 - 1) * halfSize; // -halfSize to halfSize
      const y = (Math.random() * 2 - 1) * halfSize; // -halfSize to halfSize
      const z = (Math.random() * 2 - 1) * halfSize; // -halfSize to halfSize

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Color: 0 = neutral, 1 = red, 2 = green
      if (showColors) {
        // Randomly assign red or green
        col[i] = Math.random() < 0.5 ? 1 : 2;
      } else {
        col[i] = 0; // Neutral gray
      }

      // Initial velocity for brownian motion (subtle)
      vel[i * 3] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }

    // Store in refs for useFrame
    currentPositionsRef.current = new Float32Array(pos);
    velocitiesRef.current = new Float32Array(vel);

    // Select one red and one green particle for tooltips
    let redIndex: number | null = null;
    let greenIndex: number | null = null;

    if (showColors) {
      // Find first red particle
      for (let i = 0; i < particleCount; i++) {
        if (col[i] === 1 && redIndex === null) {
          redIndex = i;
        }
        if (col[i] === 2 && greenIndex === null) {
          greenIndex = i;
        }
        if (redIndex !== null && greenIndex !== null) break;
      }
    }

    setTooltipParticles({ red: redIndex, green: greenIndex });

    return { positions: pos, colors: col, velocities: vel };
  }, [particleCount, boxSize, showColors]);

  // Update particle color attribute when colors change
  useEffect(() => {
    if (instancedMeshRef.current && instancedMeshRef.current.geometry) {
      const geom = instancedMeshRef.current.geometry;
      const colorAttr = geom.getAttribute(
        'particleColor'
      ) as THREE.BufferAttribute;
      if (colorAttr && colorAttr.array.length === colors.length) {
        for (let i = 0; i < colors.length; i++) {
          colorAttr.setX(i, colors[i]);
        }
        colorAttr.needsUpdate = true;
      }
    }
  }, [colors, particleCount]);

  // Create base geometry with all positions for point rendering
  const baseGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    // Set all positions in the geometry
    geom.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );
    // Set particle colors as regular attribute (not instanced)
    geom.setAttribute(
      'particleColor',
      new THREE.Float32BufferAttribute(colors, 1)
    );
    return geom;
  }, [positions, colors]);

  // Create material for point rendering
  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: true,
      blending: THREE.NormalBlending,
      uniforms: {
        uParticleSize: { value: particleSize },
      },
    });
    return mat;
  }, [particleSize]);

  // Update positions and handle motion
  useFrame((state, delta) => {
    if (!instancedMeshRef.current || !instancedMeshRef.current.geometry) return;

    const points = instancedMeshRef.current;
    const geom = points.geometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
    const currentPositions = currentPositionsRef.current;
    const currentVelocities = velocitiesRef.current;

    // Update positions if motion is enabled
    if (enableMotion && currentPositions.length > 0) {
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        currentPositions[idx] += currentVelocities[idx] * delta * 5;
        currentPositions[idx + 1] += currentVelocities[idx + 1] * delta * 5;
        currentPositions[idx + 2] += currentVelocities[idx + 2] * delta * 5;

        // Add subtle random brownian motion
        currentPositions[idx] += (Math.random() - 0.5) * 0.0003;
        currentPositions[idx + 1] += (Math.random() - 0.5) * 0.0003;
        currentPositions[idx + 2] += (Math.random() - 0.5) * 0.0003;

        // Keep particles within box bounds (soft boundary)
        const halfSize = boxSize * 1.2; // Slightly larger boundary
        currentPositions[idx] = Math.max(
          -halfSize,
          Math.min(halfSize, currentPositions[idx])
        );
        currentPositions[idx + 1] = Math.max(
          -halfSize,
          Math.min(halfSize, currentPositions[idx + 1])
        );
        currentPositions[idx + 2] = Math.max(
          -halfSize,
          Math.min(halfSize, currentPositions[idx + 2])
        );
      }

      // Update geometry positions
      const pos = currentPositions;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        posAttr.setXYZ(i, pos[idx], pos[idx + 1], pos[idx + 2]);
      }
      posAttr.needsUpdate = true;
    }
  });

  // Update particle size uniform when it changes
  useEffect(() => {
    if (material && material.uniforms) {
      material.uniforms.uParticleSize.value = particleSize;
    }
  }, [particleSize, material]);

  return (
    <>
      {/* Leva Panel */}
      <Html fullscreen prepend zIndexRange={[100, 0]}>
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            transform: 'scale(0.95)',
            transformOrigin: 'top right',
            pointerEvents: 'auto',
            zIndex: 1000,
          }}
        >
          <style>{`
            div[class^="leva-"][data-theme],
            div[class*=" leva-"][data-theme],
            .leva__root,
            .leva-root,
            .leva-panel {
              position: relative !important;
              top: auto !important;
              right: auto !important;
              bottom: auto !important;
              left: auto !important;
            }
          `}</style>
          <LevaPanel
            store={levaStore}
            fill={false}
            titleBar={{ title: 'Particle Model' }}
            collapsed={false}
          />
        </div>
      </Html>

      {/* Instanced particles - using Points for point rendering */}
      <points ref={instancedMeshRef as any}>
        <primitive object={baseGeometry} attach="geometry" />
        <primitive object={material} attach="material" />
      </points>

      {/* Tooltips - rendered separately to track positions */}
      {showTooltips && showColors && tooltipParticles.red !== null && (
        <TooltipRenderer
          particleIndex={tooltipParticles.red}
          positionsRef={
            enableMotion ? currentPositionsRef : { current: positions }
          }
          label="Jack (Seller)"
          description="Owns a particle but wants to sell it"
          borderColor="#e63946"
        />
      )}
      {showTooltips && showColors && tooltipParticles.green !== null && (
        <TooltipRenderer
          particleIndex={tooltipParticles.green}
          positionsRef={
            enableMotion ? currentPositionsRef : { current: positions }
          }
          label="Laura (Buyer)"
          description="Owns a particle but wants to buy more"
          borderColor="#2a9d8f"
        />
      )}

      {/* Ground plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -boxSize * 1.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial
          color="#a6a09b"
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>
    </>
  );
}

// Tooltip component that updates position each frame
function TooltipRenderer({
  particleIndex,
  positionsRef,
  label,
  description,
  borderColor,
}: {
  particleIndex: number;
  positionsRef: { current: Float32Array };
  label: string;
  description: string;
  borderColor: string;
}) {
  const [position, setPosition] = useState<[number, number, number] | null>(
    null
  );

  useFrame(() => {
    const positions = positionsRef.current;
    if (!positions || positions.length === 0) {
      setPosition(null);
      return;
    }
    const idx = particleIndex * 3;
    if (idx >= positions.length) {
      setPosition(null);
      return;
    }
    setPosition([positions[idx], positions[idx + 1], positions[idx + 2]]);
  });

  if (!position) return null;

  return (
    <Html position={position} center style={{ pointerEvents: 'none' }}>
      <div
        style={{
          color: 'white',
          background: 'rgba(0, 0, 0, 0.9)',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          border: `2px solid ${borderColor}`,
          maxWidth: '200px',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '11px', opacity: 0.9 }}>{description}</div>
      </div>
    </Html>
  );
}

export default ParticleModel3D;
