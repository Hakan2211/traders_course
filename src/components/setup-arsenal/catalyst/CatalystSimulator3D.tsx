
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { LevaPanel, useControls, useCreateStore, button } from 'leva';
import * as THREE from 'three';

// --- Types ---
type Scenario = 'News Play (Long)' | 'Pop and Drop (Short)';
type ParticleType = 0 | 1 | 2; // 0=neutral, 1=seller(red), 2=buyer(green)

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  type: ParticleType;
  size: number;
  opacity: number;
  basePosition: THREE.Vector3;
  oscillationPhase: number;
  isEngaging: boolean;
  engagementProgress: number;
}

interface CatalystSimulator3DProps {
  levaStore: ReturnType<typeof useCreateStore>;
}

// --- Constants ---
const BOX_SIZE = 5;
const HALF_BOX = BOX_SIZE / 2;
const PARTICLE_COUNT = 4000;
const SUPPLY_WALL_Y = HALF_BOX * 0.7;

// --- Shaders ---
const particleVertexShader = `
  attribute float particleType;
  attribute float particleSize;
  attribute float particleOpacity;
  varying vec3 vColor;
  varying float vOpacity;
  
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    gl_PointSize = particleSize * (300.0 / -mvPosition.z);
    
    if (particleType < 0.5) vColor = vec3(0.5, 0.5, 0.5); // Neutral
    else if (particleType < 1.5) vColor = vec3(1.0, 0.3, 0.3); // Seller
    else vColor = vec3(0.2, 1.0, 0.4); // Buyer
    
    vOpacity = particleOpacity;
  }
`;

const particleFragmentShader = `
  varying vec3 vColor;
  varying float vOpacity;
  
  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    
    // Soft glow
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5);
    
    gl_FragColor = vec4(vColor, vOpacity * glow);
  }
`;

export default function CatalystSimulator3D({
  levaStore,
}: CatalystSimulator3DProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const wallRef = useRef<THREE.Mesh>(null);
  const priceLineRef = useRef<THREE.Group>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Simulation State
  const [isPlaying, setIsPlaying] = useState(false);
  const progressRef = useRef(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [phaseLabel, setPhaseLabel] = useState('Pre-Market');
  const phaseLabelRef = useRef('Pre-Market'); // Sync ref to avoid frequent state updates

  // Leva Controls
  const { scenario, simulationSpeed } = useControls(
    'Simulation Control',
    {
      scenario: {
        value: 'News Play (Long)' as Scenario,
        options: ['News Play (Long)', 'Pop and Drop (Short)'],
        label: 'Scenario',
      },
      simulationSpeed: {
        value: 0.5,
        min: 0.1,
        max: 2.0,
        step: 0.1,
        label: 'Speed',
      },
      togglePlay: button(() => setIsPlaying((p) => !p)),
      reset: button(() => {
        setIsPlaying(false);
        progressRef.current = 0;
        initParticles();
      }),
    },
    { store: levaStore }
  );

  // Initialize Particles Logic
  const initParticles = () => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = (Math.random() - 0.5) * BOX_SIZE;
      const y = (Math.random() - 0.5) * BOX_SIZE;
      const z = (Math.random() - 0.5) * BOX_SIZE;

      const basePos = new THREE.Vector3(x, y, z);

      newParticles.push({
        position: basePos.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        type: 0,
        size: Math.random() * 0.1 + 0.05,
        opacity: 0.2,
        basePosition: basePos,
        oscillationPhase: Math.random() * Math.PI * 2,
        isEngaging: false,
        engagementProgress: 0,
      });
    }
    setParticles(newParticles);
  };

  // Initial load
  useEffect(() => {
    initParticles();
  }, []); // Run once on mount

  // Geometry
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const types = new Float32Array(PARTICLE_COUNT);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const opacities = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      types[i] = 0;
      sizes[i] = 0.1;
      opacities[i] = 0;
    }

    geom.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geom.setAttribute(
      'particleType',
      new THREE.Float32BufferAttribute(types, 1)
    );
    geom.setAttribute(
      'particleSize',
      new THREE.Float32BufferAttribute(sizes, 1)
    );
    geom.setAttribute(
      'particleOpacity',
      new THREE.Float32BufferAttribute(opacities, 1)
    );

    return geom;
  }, []);

  // Frame Loop
  useFrame((state, delta) => {
    if (isPlaying) {
      progressRef.current = Math.min(
        progressRef.current + delta * 0.1 * simulationSpeed,
        1
      );
    }

    const progress = progressRef.current;
    const time = state.clock.elapsedTime;

    // Safety check
    if (!pointsRef.current || particles.length === 0) return;

    const geom = pointsRef.current.geometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
    const typeAttr = geom.getAttribute('particleType') as THREE.BufferAttribute;
    const sizeAttr = geom.getAttribute('particleSize') as THREE.BufferAttribute;
    const opAttr = geom.getAttribute(
      'particleOpacity'
    ) as THREE.BufferAttribute;

    // Logic Constants
    const NEWS_DROP_TIME = 0.15;
    const REACTION_TIME = 0.4;
    const RESOLUTION_TIME = 0.65;

    // Phase Logic
    const isPreMarket = progress < NEWS_DROP_TIME;
    const isNewsDrop = progress >= NEWS_DROP_TIME && progress < REACTION_TIME;
    const isReaction = progress >= REACTION_TIME && progress < RESOLUTION_TIME;
    const isResolution = progress >= RESOLUTION_TIME;

    // UI Updates
    let currentLabel = 'Pre-Market';
    if (isResolution) currentLabel = 'Resolution';
    else if (isReaction) currentLabel = 'Reaction';
    else if (isNewsDrop) currentLabel = 'News Drop';

    // Only update state if label changes (performance)
    if (currentLabel !== phaseLabelRef.current) {
      phaseLabelRef.current = currentLabel;
      setPhaseLabel(currentLabel);
    }

    // Direct DOM update for smooth progress bar
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${progress * 100}%`;
    }

    // Stats for Price Line
    let currentAvgY = 0;
    let activeCount = 0;

    // Update Particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];

      // --- BEHAVIOR LOGIC ---

      if (isPreMarket) {
        // Idle / Neutral
        p.type = 0;
        p.opacity = 0.2;

        // Gentle oscillation around base
        const osc = Math.sin(time + p.oscillationPhase) * 0.1;
        p.velocity.x += (p.basePosition.x - p.position.x) * 0.05 * delta;
        p.velocity.y += (p.basePosition.y - 1.0 - p.position.y) * 0.05 * delta; // Sit lower
        p.velocity.z += (p.basePosition.z - p.position.z) * 0.05 * delta;

        // Random jitter
        p.velocity.addScalar((Math.random() - 0.5) * 0.01);
      } else if (isNewsDrop) {
        // Explosion of Buyers
        p.type = 2; // Green
        p.opacity = 1.0;

        // Rush upwards
        p.velocity.y += 8.0 * delta; // Strong impulse
        p.velocity.x += (Math.random() - 0.5) * 2.0 * delta; // Spread

        // Wall resistance check
        if (p.position.y > SUPPLY_WALL_Y) {
          p.position.y = SUPPLY_WALL_Y;
          p.velocity.y *= -0.5; // Bounce down
          p.velocity.x += (Math.random() - 0.5) * 5.0 * delta; // Scatter sideways
        }
      } else if (isReaction) {
        // Testing the wall
        // Upward pressure continues but weaker
        p.velocity.y += 2.0 * delta;

        // Supply Wall interaction
        if (p.position.y > SUPPLY_WALL_Y) {
          p.position.y = SUPPLY_WALL_Y + Math.random() * 0.2; // Leaking through slightly
          p.velocity.y *= -0.2; // Damping
        }

        if (scenario === 'Pop and Drop (Short)') {
          // Losing momentum
          p.velocity.y -= 1.0 * delta; // Gravity kicks in
          if (Math.random() < 0.02) p.type = 0; // Turning neutral
        }
      } else if (isResolution) {
        if (scenario === 'News Play (Long)') {
          // Breakout!
          p.type = 2;
          p.velocity.y += 5.0 * delta; // Fly

          // If they fly too high, recycle to bottom with RANDOMNESS to break the block effect
          if (p.position.y > BOX_SIZE) {
            p.position.y = -HALF_BOX - Math.random() * 4.0; // Reset deep below
            p.position.x = (Math.random() - 0.5) * BOX_SIZE; // Scatter X
            p.position.z = (Math.random() - 0.5) * BOX_SIZE; // Scatter Z
            p.velocity.y = 2.0 + Math.random() * 2.0; // Varied speed
            p.velocity.x = (Math.random() - 0.5) * 0.5;
            p.velocity.z = (Math.random() - 0.5) * 0.5;
          }
        } else {
          // Pop and Drop Fade
          if (Math.random() < 0.05) p.type = 1; // Turn Red
          p.velocity.y -= 4.0 * delta; // Heavy gravity

          // Bounce off floor
          if (p.position.y < -HALF_BOX) {
            p.position.y = -HALF_BOX;
            p.velocity.y *= -0.4;
          }
        }
      }

      // Apply Velocity
      p.position.add(p.velocity.clone().multiplyScalar(delta));

      // Damping
      p.velocity.multiplyScalar(0.95);

      // Boundaries (Sides)
      if (p.position.x > HALF_BOX) {
        p.position.x = HALF_BOX;
        p.velocity.x *= -1;
      }
      if (p.position.x < -HALF_BOX) {
        p.position.x = -HALF_BOX;
        p.velocity.x *= -1;
      }
      if (p.position.z > HALF_BOX) {
        p.position.z = HALF_BOX;
        p.velocity.z *= -1;
      }
      if (p.position.z < -HALF_BOX) {
        p.position.z = -HALF_BOX;
        p.velocity.z *= -1;
      }

      // Floor (General)
      if (p.position.y < -HALF_BOX) {
        p.position.y = -HALF_BOX;
        p.velocity.y *= -0.5;
      }

      // Stats accumulation
      currentAvgY += p.position.y;
      activeCount++;

      // Update Attributes
      posAttr.setXYZ(i, p.position.x, p.position.y, p.position.z);
      typeAttr.setX(i, p.type);
      sizeAttr.setX(i, p.size);
      opAttr.setX(i, p.opacity);
    }

    posAttr.needsUpdate = true;
    typeAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
    opAttr.needsUpdate = true;

    // Update Price Line Ref
    if (activeCount > 0) {
      const targetY = currentAvgY / activeCount;
      // Smooth lerp
      if (priceLineRef.current) {
        priceLineRef.current.position.y = THREE.MathUtils.lerp(
          priceLineRef.current.position.y,
          targetY,
          0.1
        );
      }
    }

    // Update Wall Visuals
    if (wallRef.current) {
      const mat = wallRef.current.material as THREE.MeshStandardMaterial;

      if (scenario === 'News Play (Long)') {
        if (isResolution) {
          // Breakout - Wall fades/disappears
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0, 0.05);
          mat.visible = mat.opacity > 0.01;
        } else {
          mat.opacity = 0.3;
          mat.visible = true;
          mat.color.setHex(0xffffff);
        }
      } else {
        // Pop and Drop - Wall gets stronger/Red
        if (isReaction || isResolution) {
          mat.color.setHex(0xff0000);
          mat.emissive.setHex(0xaa0000);
          mat.emissiveIntensity =
            (Math.sin(time * 10) * 0.5 + 0.5) * (isReaction ? 1 : 0.2);
          mat.opacity = 0.5;
          mat.visible = true;
        } else {
          mat.color.setHex(0xffffff);
          mat.emissive.setHex(0x000000);
          mat.opacity = 0.3;
          mat.visible = true;
        }
      }
    }
  });

  return (
    <>
      <Html fullscreen style={{ pointerEvents: 'none' }}>
        <div className="absolute top-4 left-4 z-10 p-4 pointer-events-auto">
          <LevaPanel store={levaStore} fill flat titleBar={false} />
          <div className="mt-4 bg-black/80 backdrop-blur border border-white/10 p-4 rounded-lg w-64 text-sm text-gray-300">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-white">Status</span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold ${
                  isPlaying
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}
              >
                {isPlaying ? 'LIVE' : 'PAUSED'}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Phase</span>
                <span className="text-white">{phaseLabel}</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div
                  ref={progressBarRef}
                  className="h-full bg-blue-500 transition-none"
                  style={{ width: '0%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </Html>

      {/* Particles System */}
      <points ref={pointsRef}>
        <primitive object={geometry} attach="geometry" />
        <shaderMaterial
          vertexShader={particleVertexShader}
          fragmentShader={particleFragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Resistance Wall */}
      <mesh
        ref={wallRef}
        position={[0, SUPPLY_WALL_Y, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[BOX_SIZE, BOX_SIZE]} />
        <meshStandardMaterial
          color="white"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Resistance Label */}
      <group position={[HALF_BOX + 0.5, SUPPLY_WALL_Y, 0]}>
        <Html center transform rotation={[0, -Math.PI / 2, 0]} scale={0.5}>
          <div className="bg-red-900/80 text-red-200 px-2 py-1 rounded border border-red-500/50 text-xs font-mono">
            SUPPLY WALL
          </div>
        </Html>
      </group>

      {/* Price Line (Equilibrium) */}
      <group ref={priceLineRef}>
        <mesh>
          <boxGeometry args={[BOX_SIZE + 0.5, 0.05, BOX_SIZE + 0.5]} />
          <meshBasicMaterial
            color="#fbbf24"
            transparent
            opacity={0.3}
            wireframe
          />
        </mesh>
        <mesh>
          <boxGeometry args={[BOX_SIZE, 0.02, BOX_SIZE]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.1} />
        </mesh>
        <Html position={[BOX_SIZE / 2 + 0.5, 0, 0]}>
          <div className="bg-amber-500/90 text-black px-2 py-0.5 rounded text-xs font-bold font-mono -translate-x-1/2 -translate-y-1/2">
            PRICE
          </div>
        </Html>
      </group>

      {/* Environment */}
      <gridHelper
        args={[20, 20, 0x333333, 0x111111]}
        position={[0, -HALF_BOX - 0.1, 0]}
      />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#4a9eff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff4444" />
    </>
  );
}
