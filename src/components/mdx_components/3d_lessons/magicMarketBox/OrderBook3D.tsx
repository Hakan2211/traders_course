
import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
import { useControls, LevaPanel, useCreateStore } from 'leva';
import * as THREE from 'three';

interface OrderBook3DProps {
  levaStore: ReturnType<typeof useCreateStore>;
}

// Particle types: 0 = neutral/gray, 1 = red (ask/supply), 2 = green (bid/demand)
type ParticleType = 0 | 1 | 2;

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  basePosition: THREE.Vector3;
  targetPosition: THREE.Vector3;
  oscillationPhase: number;
  type: ParticleType;
  size: number;
  opacity: number;
}

const BOX_SIZE = 4;
const HALF_BOX = BOX_SIZE / 2;
const OSC_SPEED = 1.3;
const OSC_AMP = 0.25;

// Middle "spread" zone width as a fraction of box width along X axis
const SPREAD_WIDTH = BOX_SIZE * 0.25;
const RAIL_THICKNESS = 0.05;
const RAIL_DEPTH = BOX_SIZE * 1.05;
const RAIL_HEIGHT = BOX_SIZE * 1.2;

// Point shader (consistent with prior lessons)
const particleVertexShader = `
  attribute float particleType;
  attribute float particleSize;
  attribute float particleOpacity;
  varying vec3 vColor;
  varying float vOpacity;
  void main() {
    vec3 pos = position;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = particleSize;
    if (particleType < 0.5) {
      vColor = vec3(0.6, 0.6, 0.6);
    } else if (particleType < 1.5) {
      vColor = vec3(0.9, 0.2, 0.2);
    } else {
      vColor = vec3(0.2, 0.9, 0.2);
    }
    vOpacity = particleOpacity;
  }
`;

const particleFragmentShader = `
  varying vec3 vColor;
  varying float vOpacity;
  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = (1.0 - smoothstep(0.3, 0.5, dist)) * vOpacity;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

type Step = 0 | 1 | 2 | 3;

export function OrderBook3D({ levaStore }: OrderBook3DProps) {
  const rootGroupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);

  const [particles, setParticles] = useState<Particle[]>([]);
  const rotationYRef = useRef(0);

  // Rails flash intensities (briefly flash when "orders" hit them)
  const leftRailFlashRef = useRef(0);
  const rightRailFlashRef = useRef(0);

  // Simple animated "order pulses"
  type PulseSide = 'left' | 'right';
  interface OrderPulse {
    mesh: THREE.Mesh | null;
    side: PulseSide;
    progress: number; // 0 -> 1
    speed: number;
    y: number;
    z: number;
    active: boolean;
  }
  const pulsesRef = useRef<OrderPulse[]>([]);

  // Leva controls
  const { step, particleCount, particleSize, pulseRate, rotationYDeg } =
    useControls(
      'Order Book 3D',
      {
        step: {
          value: 0,
          min: 0,
          max: 3,
          step: 1,
          label: 'Step',
        },
        particleCount: {
          value: 4000,
          min: 1000,
          max: 12000,
          step: 500,
          label: 'Particle Count',
        },
        particleSize: {
          value: 0.18,
          min: 0.06,
          max: 0.5,
          step: 0.01,
          label: 'Particle Size',
        },
        pulseRate: {
          value: 0.7,
          min: 0.0,
          max: 2.0,
          step: 0.1,
          label: 'Market Order Pulse Rate',
        },
        rotationYDeg: {
          value: 150,
          min: -180,
          max: 180,
          step: 1,
          label: 'Rotation Y (deg)',
        },
      },
      { store: levaStore }
    ) as {
      step: Step;
      particleCount: number;
      particleSize: number;
      pulseRate: number;
      rotationYDeg: number;
    };

  // Geometry
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const types = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);
    const opacities = new Float32Array(particleCount);
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
  }, [particleCount]);

  // Material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
  }, []);

  // Initialize particles
  useEffect(() => {
    const newParticles: Particle[] = [];
    const half = HALF_BOX * 0.9;
    for (let i = 0; i < particleCount; i++) {
      const type: ParticleType = 0;
      const pos = new THREE.Vector3(
        (Math.random() * 2 - 1) * half,
        (Math.random() * 2 - 1) * half,
        (Math.random() * 2 - 1) * half
      );
      newParticles.push({
        position: pos.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        ),
        basePosition: pos.clone(),
        targetPosition: pos.clone(),
        oscillationPhase: Math.random() * Math.PI * 2,
        type,
        size: particleSize,
        opacity: 1.0,
      });
    }
    setParticles(newParticles);
  }, [particleCount, particleSize]);

  // Re-target particles per step
  useEffect(() => {
    setParticles((prev) => {
      const updated = [...prev];
      const half = HALF_BOX * 0.9;
      const leftXMin = -half;
      const leftXMax = -SPREAD_WIDTH * 0.6;
      const rightXMin = SPREAD_WIDTH * 0.6;
      const rightXMax = half;
      updated.forEach((p, idx) => {
        if (step === 0) {
          p.type = 0;
          const rand = new THREE.Vector3(
            (Math.random() * 2 - 1) * half,
            (Math.random() * 2 - 1) * half,
            (Math.random() * 2 - 1) * half
          );
          p.targetPosition.copy(rand);
        } else {
          // Step 1+ split into demand (green, left/local -X) and supply (red, right/local +X)
          const isLeft = idx % 2 === 0;
          if (isLeft) {
            // Green on local left (negative X)
            p.type = 2;
            const x = leftXMin + Math.random() * (leftXMax - leftXMin);
            p.targetPosition.set(
              x,
              (Math.random() * 2 - 1) * half,
              (Math.random() * 2 - 1) * half
            );
          } else {
            // Red on local right (positive X)
            const x = rightXMin + Math.random() * (rightXMax - rightXMin);
            p.type = 1;
            p.targetPosition.set(
              x,
              (Math.random() * 2 - 1) * half,
              (Math.random() * 2 - 1) * half
            );
          }
        }
        p.opacity = 1.0;
      });
      return updated;
    });
  }, [step]);

  // Pulses setup (fixed small pool)
  const pulseMeshesRef = useRef<THREE.Mesh[]>([]);
  useEffect(() => {
    // Initialize a pool of pulses
    const poolSize = 16;
    pulsesRef.current = new Array(poolSize).fill(null).map((_, i) => ({
      mesh: null,
      side: i % 2 === 0 ? 'right' : 'left', // alternate buy/sell
      progress: Math.random(),
      speed: 0.25 + Math.random() * 0.35,
      y: (Math.random() * 2 - 1) * HALF_BOX * 0.7,
      z: (Math.random() * 2 - 1) * HALF_BOX * 0.7,
      active: false,
    }));
  }, []);

  // Frame loop
  useFrame((state, delta) => {
    // Smoothly rotate scene based on step (use Leva-controlled yaw)
    const targetRotY = step >= 1 ? THREE.MathUtils.degToRad(rotationYDeg) : 0;
    rotationYRef.current = THREE.MathUtils.lerp(
      rotationYRef.current,
      targetRotY,
      0.08
    );
    if (rootGroupRef.current) {
      rootGroupRef.current.rotation.y = rotationYRef.current;
    }

    // Flash decay on rails
    leftRailFlashRef.current = Math.max(
      0,
      leftRailFlashRef.current - delta * 1.5
    );
    rightRailFlashRef.current = Math.max(
      0,
      rightRailFlashRef.current - delta * 1.5
    );

    // Animate particles
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
    const typeAttr = geom.getAttribute('particleType') as THREE.BufferAttribute;
    const sizeAttr = geom.getAttribute('particleSize') as THREE.BufferAttribute;
    const opacityAttr = geom.getAttribute(
      'particleOpacity'
    ) as THREE.BufferAttribute;
    if (!posAttr || !typeAttr || !sizeAttr || !opacityAttr) return;

    const time = state.clock.elapsedTime;
    setParticles((prev) => {
      const updated = [...prev];
      const lerpToTarget = step >= 0 ? 0.08 : 0.04;
      updated.forEach((p, idx) => {
        // Oscillation around target for "alive" feel
        const osc = new THREE.Vector3(
          Math.sin(time * OSC_SPEED + p.oscillationPhase) * OSC_AMP,
          Math.cos(time * OSC_SPEED + p.oscillationPhase) * OSC_AMP,
          Math.sin(time * OSC_SPEED * 0.7 + p.oscillationPhase) * OSC_AMP
        );
        // Move toward target
        p.position.lerp(p.targetPosition.clone().add(osc), lerpToTarget);
        // Clamp within box
        p.position.x = THREE.MathUtils.clamp(p.position.x, -HALF_BOX, HALF_BOX);
        p.position.y = THREE.MathUtils.clamp(p.position.y, -HALF_BOX, HALF_BOX);
        p.position.z = THREE.MathUtils.clamp(p.position.z, -HALF_BOX, HALF_BOX);
        // Update attributes
        posAttr.setXYZ(idx, p.position.x, p.position.y, p.position.z);
        typeAttr.setX(idx, p.type);
        sizeAttr.setX(idx, p.size * 10);
        opacityAttr.setX(idx, p.opacity);
      });
      posAttr.needsUpdate = true;
      typeAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
      opacityAttr.needsUpdate = true;
      return updated;
    });

    // Animate pulses only on step 3
    if (step === 3 && pulseMeshesRef.current.length > 0) {
      const spawnChance = pulseRate * delta; // approx pulses per second scaling
      // Randomly activate some inactive pulses
      pulsesRef.current.forEach((pulse, i) => {
        if (!pulse.active && Math.random() < spawnChance * 0.6) {
          pulse.active = true;
          pulse.progress = 0;
          pulse.y = (Math.random() * 2 - 1) * HALF_BOX * 0.6;
          pulse.z = (Math.random() * 2 - 1) * HALF_BOX * 0.6;
          pulse.side = Math.random() < 0.5 ? 'right' : 'left';
          pulse.speed = 0.3 + Math.random() * 0.35;
        }
      });
      // Update active pulses
      pulsesRef.current.forEach((pulse, i) => {
        const mesh = pulseMeshesRef.current[i];
        if (!mesh) return;
        if (!pulse.active) {
          mesh.visible = false;
          return;
        }
        mesh.visible = true;
        pulse.progress += delta * pulse.speed;
        // Start at x=0 (spread center) toward rail
        const startX = 0;
        const endX =
          pulse.side === 'left' ? -SPREAD_WIDTH / 2 : SPREAD_WIDTH / 2;
        const x = THREE.MathUtils.lerp(
          startX,
          endX,
          Math.min(pulse.progress, 1)
        );
        mesh.position.set(x, pulse.y, pulse.z);
        // Fade as it approaches the wall
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.opacity = 0.9 - Math.min(0.8, pulse.progress * 0.9);
        if (pulse.progress >= 1) {
          // Hit the rail — flash that rail
          if (pulse.side === 'left') {
            leftRailFlashRef.current = 1.0;
          } else {
            rightRailFlashRef.current = 1.0;
          }
          pulse.active = false;
          mesh.visible = false;
        }
      });
    } else {
      // Hide pulses when not on step 3
      pulseMeshesRef.current.forEach((m) => {
        if (m) m.visible = false;
      });
      pulsesRef.current.forEach((p) => (p.active = false));
    }
  });

  // Render
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
            titleBar={{ title: 'Order Book 3D' }}
            collapsed={false}
          />
        </div>
      </Html>

      {/* Title overlay */}
      <Html fullscreen prepend zIndexRange={[90, 0]}>
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            color: 'white',
            background: 'rgba(0,0,0,0.5)',
            padding: '10px 12px',
            borderRadius: 8,
            fontWeight: 700,
            border: '1px solid #2a7fff',
          }}
        >
          Order Book 3D — Visualizing Book, Flow & Edge Mechanics
        </div>
      </Html>

      <group ref={rootGroupRef}>
        {/* Particles */}
        <points ref={pointsRef}>
          <primitive object={geometry} attach="geometry" />
          <primitive object={material} attach="material" />
        </points>

        {/* Outer box frame (subtle) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry
            args={[BOX_SIZE * 1.1, BOX_SIZE * 1.1, BOX_SIZE * 1.1]}
          />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.04}
            metalness={0.1}
            roughness={0.9}
          />
        </mesh>

        {/* Middle spread zone (subtle) */}
        {step >= 1 && (
          <mesh position={[0, 0, 0]}>
            <boxGeometry
              args={[SPREAD_WIDTH, BOX_SIZE * 1.05, BOX_SIZE * 1.05]}
            />
            <meshStandardMaterial
              color="#ffff00"
              transparent
              opacity={step >= 2 ? 0.08 : 0.04}
              emissive="#ffff00"
              emissiveIntensity={step >= 2 ? 0.15 : 0.05}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Rails at spread edges */}
        {step >= 2 && (
          <>
            {/* Left (Bid edge) */}
            <mesh position={[-SPREAD_WIDTH / 2, 0, 0]}>
              <boxGeometry args={[RAIL_THICKNESS, RAIL_HEIGHT, RAIL_DEPTH]} />
              <meshStandardMaterial
                color="#4a9eff"
                emissive="#2a7fff"
                emissiveIntensity={0.6 + leftRailFlashRef.current * 1.4}
                transparent
                opacity={0.9}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Right (Ask edge) */}
            <mesh position={[SPREAD_WIDTH / 2, 0, 0]}>
              <boxGeometry args={[RAIL_THICKNESS, RAIL_HEIGHT, RAIL_DEPTH]} />
              <meshStandardMaterial
                color="#ef5350"
                emissive="#ef5350"
                emissiveIntensity={0.6 + rightRailFlashRef.current * 1.4}
                transparent
                opacity={0.9}
                side={THREE.DoubleSide}
              />
            </mesh>
          </>
        )}

        {/* Labels and callouts */}
        {step >= 3 && (
          <>
            {/* Bid label (left) */}
            <Html
              position={[-SPREAD_WIDTH / 2 - 0.8, RAIL_HEIGHT * 0.35, 0]}
              center
            >
              <div
                style={{
                  color: '#4a9eff',
                  background: 'rgba(0,0,0,0.7)',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '2px solid #4a9eff',
                  fontWeight: 700,
                }}
              >
                Bid (Left)
              </div>
            </Html>
            {/* Ask label (right) */}
            <Html
              position={[SPREAD_WIDTH / 2 + 0.8, RAIL_HEIGHT * 0.35, 0]}
              center
            >
              <div
                style={{
                  color: '#ef5350',
                  background: 'rgba(0,0,0,0.7)',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '2px solid #ef5350',
                  fontWeight: 700,
                }}
              >
                Ask (Right)
              </div>
            </Html>
            {/* Callouts */}
            <Html
              position={[-SPREAD_WIDTH / 2 - 0.8, -RAIL_HEIGHT * 0.35, 0]}
              center
            >
              <div
                style={{
                  color: '#4a9eff',
                  background: 'rgba(0,0,0,0.85)',
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: '1px solid #4a9eff',
                  fontSize: 12,
                }}
              >
                Market Sell → hits Bid wall (absorption)
              </div>
            </Html>
            <Html
              position={[SPREAD_WIDTH / 2 + 0.8, -RAIL_HEIGHT * 0.35, 0]}
              center
            >
              <div
                style={{
                  color: '#ef5350',
                  background: 'rgba(0,0,0,0.85)',
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: '1px solid #ef5350',
                  fontSize: 12,
                }}
              >
                Market Buy → hits Ask wall (absorption)
              </div>
            </Html>
          </>
        )}

        {/* Pulses (market orders) */}
        {new Array(16).fill(null).map((_, i) => (
          <mesh
            key={`pulse-${i}`}
            ref={(el) => {
              if (el) pulseMeshesRef.current[i] = el;
            }}
            visible={false}
          >
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={1.2}
              transparent
              opacity={0.9}
            />
          </mesh>
        ))}
      </group>

      {/* Ground plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -BOX_SIZE * 1.1, 0]}
        receiveShadow
      >
        <planeGeometry args={[BOX_SIZE * 3, BOX_SIZE * 2]} />
        <meshStandardMaterial
          color="#2a2a2a"
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>
    </>
  );
}

export default OrderBook3D;
