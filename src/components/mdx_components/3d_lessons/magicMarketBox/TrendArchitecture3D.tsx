
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Html, Line as DreiLine } from '@react-three/drei';
import { LevaPanel, button, useControls, useCreateStore } from 'leva';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TrendArchitecture3DProps {
  levaStore: ReturnType<typeof useCreateStore>;
}

type Polarity = 'up' | 'down';

const BOX_SIZE = 4;
const HALF_BOX = BOX_SIZE / 2;
const MIDDLE_ZONE_HEIGHT = BOX_SIZE * 0.2;
const STACK_OFFSET = BOX_SIZE * 1.2;
const GHOST_REACTIVATE_DISTANCE = 0.25;
const TRAIL_WIDTH = 2;

interface BoxState {
  id: number;
  y: number; // target Y
  x: number; // target X (for stair-step)
  visualY: number; // smoothed Y for animation
  visualX: number; // smoothed X for animation
  isActive: boolean;
  polarity: Polarity;
  memory: boolean;
  appearProgress: number; // 0..1 scale-in for new boxes
  pulse: number; // 0..1 for re-activation glow
}

// Utility colors
const colorForPolarity = (polarity: Polarity) =>
  polarity === 'up' ? '#22c55e' : '#ef4444';

// Active box particle system (logic adapted from BattleInsideBox3D, with props)
function ActiveBox({
  yOffset,
  xOffset,
  buyPressure,
  sellPressure,
  particleCount,
  particleSize,
  showNeutral,
  breakoutThreshold, // 0..1 relative to HALF_BOX
  onBreakout,
  onEquilibriumYChange,
  frozen,
  animateToEdge,
  forceEdgeDir,
}: {
  yOffset: number;
  xOffset: number;
  buyPressure: number;
  sellPressure: number;
  particleCount: number;
  particleSize: number;
  showNeutral: boolean;
  breakoutThreshold: number;
  onBreakout: (dir: Polarity) => void;
  onEquilibriumYChange?: (y: number) => void;
  frozen?: boolean;
  animateToEdge?: boolean;
  forceEdgeDir?: Polarity | null;
}) {
  type ParticleType = 0 | 1 | 2;
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

  const pointsRef = useRef<THREE.Points>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const equilibriumRef = useRef(0);
  const targetEquilibriumRef = useRef(0);
  const [equilibrium, setEquilibrium] = useState(0);
  const COLLISION_DISTANCE = 0.3;
  const OSCILLATION_SPEED = 1.5;
  const OSCILLATION_AMPLITUDE = 0.3;
  const [hasBrokenOut, setHasBrokenOut] = useState(false);

  // Shaders
  const particleVertexShader = useMemo(
    () => `
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
  `,
    []
  );
  const particleFragmentShader = useMemo(
    () => `
    varying vec3 vColor;
    varying float vOpacity;
    void main() {
      float dist = distance(gl_PointCoord, vec2(0.5));
      if (dist > 0.5) discard;
      float alpha = (1.0 - smoothstep(0.3, 0.5, dist)) * vOpacity;
      gl_FragColor = vec4(vColor, alpha);
    }
  `,
    []
  );

  // Initialize particles
  useEffect(() => {
    const newParticles: Particle[] = [];
    const buyerSellerCount = Math.floor(particleCount * 0.8);
    for (let i = 0; i < particleCount; i++) {
      const isNeutral = i >= buyerSellerCount;
      let type: ParticleType;
      let baseY = 0;
      if (isNeutral) {
        type = 0;
        baseY = (Math.random() * 2 - 1) * HALF_BOX;
      } else {
        type = Math.random() < 0.5 ? 1 : 2;
        if (type === 1) {
          baseY = HALF_BOX * (0.3 + Math.random() * 0.5);
        } else {
          baseY = -HALF_BOX * (0.3 + Math.random() * 0.5);
        }
      }
      const basePosition = new THREE.Vector3(
        (Math.random() * 2 - 1) * HALF_BOX * 0.9,
        baseY,
        (Math.random() * 2 - 1) * HALF_BOX * 0.9
      );
      newParticles.push({
        position: basePosition.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        ),
        type,
        size: particleSize,
        opacity: 1,
        basePosition,
        oscillationPhase: Math.random() * Math.PI * 2,
        isEngaging: false,
        engagementProgress: 0,
      });
    }
    setParticles(newParticles);
    setHasBrokenOut(false);
    equilibriumRef.current = 0;
    targetEquilibriumRef.current = 0;
    setEquilibrium(0);
  }, [particleCount, particleSize]);

  // Geometry
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const types = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);
    const opacities = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      types[i] = 0;
      sizes[i] = particleSize;
      // Start visible so Step 0 shows particles immediately
      opacities[i] = 1;
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
  }, [particleCount, particleSize]);

  // Material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {},
    });
  }, [particleVertexShader, particleFragmentShader]);

  // Drive equilibrium from pressures
  useEffect(() => {
    // If we are animating to edge (Step 2), drive toward thresholded edge explicitly
    if (animateToEdge && forceEdgeDir) {
      const sign = forceEdgeDir === 'up' ? 1 : -1;
      // Push the center so the middle-zone fully touches the box boundary
      const zoneHalf = MIDDLE_ZONE_HEIGHT / 2;
      const targetAtEdge = HALF_BOX - zoneHalf * 0.99;
      targetEquilibriumRef.current = sign * targetAtEdge;
    } else {
      const netForce = buyPressure - sellPressure;
      const maxEquilibrium = HALF_BOX * 0.85;
      targetEquilibriumRef.current = netForce * maxEquilibrium;
    }
  }, [
    buyPressure,
    sellPressure,
    animateToEdge,
    forceEdgeDir,
    breakoutThreshold,
  ]);

  // Animation loop
  useFrame((state, delta) => {
    if (!pointsRef.current || particles.length === 0 || frozen) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
    const typeAttr = geom.getAttribute('particleType') as THREE.BufferAttribute;
    const sizeAttr = geom.getAttribute('particleSize') as THREE.BufferAttribute;
    const opacityAttr = geom.getAttribute(
      'particleOpacity'
    ) as THREE.BufferAttribute;
    if (!posAttr || !typeAttr || !sizeAttr || !opacityAttr) return;

    const time = state.clock.getElapsedTime();
    const adjustedDelta = delta;

    // Equilibrium easing
    equilibriumRef.current = THREE.MathUtils.lerp(
      equilibriumRef.current,
      targetEquilibriumRef.current,
      0.05
    );
    setEquilibrium(equilibriumRef.current);
    onEquilibriumYChange?.(yOffset + equilibriumRef.current);

    const middleZoneCenter = equilibriumRef.current;
    const middleZoneTop = middleZoneCenter + MIDDLE_ZONE_HEIGHT / 2;
    const middleZoneBottom = middleZoneCenter - MIDDLE_ZONE_HEIGHT / 2;

    // Update particles
    setParticles((prev) => {
      const updated = [...prev];
      updated.forEach((p, idx) => {
        // Skip neutral visibility if hidden
        const visible = p.type !== 0 || showNeutral;

        // Oscillation
        const oscillationOffset = new THREE.Vector3(
          Math.sin(time * 1.5 + p.oscillationPhase) * 0.3,
          Math.cos(time * 1.5 + p.oscillationPhase) * 0.3,
          Math.sin(time * 1.05 + p.oscillationPhase) * 0.3
        );

        if (p.type !== 0) {
          // Randomly engage toward middle
          const distanceToMiddle = Math.abs(p.position.y - middleZoneCenter);
          const shouldEngage =
            distanceToMiddle > MIDDLE_ZONE_HEIGHT * 0.5 && Math.random() < 0.02;
          if (shouldEngage) {
            p.isEngaging = true;
            p.engagementProgress = 0;
          }

          if (p.isEngaging) {
            const targetY =
              middleZoneCenter +
              (Math.random() * 2 - 1) * MIDDLE_ZONE_HEIGHT * 0.3;
            const direction = new THREE.Vector3(
              (Math.random() * 2 - 1) * HALF_BOX * 0.8 - p.position.x,
              targetY - p.position.y,
              (Math.random() * 2 - 1) * HALF_BOX * 0.8 - p.position.z
            ).normalize();
            // Pressure-based speed
            let speedMultiplier = 1;
            if (p.type === 2) speedMultiplier = 0.5 + buyPressure * 1.5;
            if (p.type === 1) speedMultiplier = 0.5 + sellPressure * 1.5;
            p.velocity.lerp(
              direction.multiplyScalar(speedMultiplier),
              adjustedDelta * 2
            );
            p.position.add(p.velocity.clone().multiplyScalar(adjustedDelta));
            p.engagementProgress += adjustedDelta * 2;
            // Add jitter inside middle
            if (
              p.position.y >= middleZoneBottom &&
              p.position.y <= middleZoneTop
            ) {
              p.velocity.add(
                new THREE.Vector3(
                  (Math.random() - 0.5) * 0.5,
                  (Math.random() - 0.5) * 0.5,
                  (Math.random() - 0.5) * 0.5
                )
              );
              p.velocity.clampLength(0, 3);
            }
            // Stop engaging
            if (
              p.engagementProgress > 3 ||
              Math.abs(p.position.y - p.basePosition.y) > HALF_BOX * 1.5
            ) {
              p.isEngaging = false;
              p.engagementProgress = 0;
            }
          } else {
            const targetPos = p.basePosition.clone().add(oscillationOffset);
            p.position.lerp(targetPos, adjustedDelta * 2);
          }

          // Drift with pressure
          if (p.type === 2 && buyPressure > 0.5) {
            p.position.y += (buyPressure - 0.5) * adjustedDelta * 0.5;
          } else if (p.type === 1 && sellPressure > 0.5) {
            p.position.y -= (sellPressure - 0.5) * adjustedDelta * 0.5;
          }
        } else {
          // Neutral oscillation only
          const targetPos = p.basePosition.clone().add(oscillationOffset);
          p.position.lerp(targetPos, adjustedDelta);
        }

        // Clamp inside box
        p.position.x = THREE.MathUtils.clamp(p.position.x, -HALF_BOX, HALF_BOX);
        p.position.y = THREE.MathUtils.clamp(p.position.y, -HALF_BOX, HALF_BOX);
        p.position.z = THREE.MathUtils.clamp(p.position.z, -HALF_BOX, HALF_BOX);

        // Write attributes
        posAttr.setXYZ(
          idx,
          p.position.x + xOffset,
          p.position.y + yOffset,
          p.position.z
        );
        typeAttr.setX(idx, visible ? p.type : -1);
        // Balanced point size for visibility without overpowering visuals
        sizeAttr.setX(idx, visible ? p.size * 12 : 0);
        opacityAttr.setX(idx, visible ? p.opacity : 0);
      });

      // Collision check in middle zone (cheap, early exit)
      for (let i = 0; i < updated.length; i++) {
        const p1 = updated[i];
        if (p1.type === 0 || p1.opacity === 0) continue;
        const inMiddle =
          p1.position.y >= middleZoneBottom && p1.position.y <= middleZoneTop;
        if (!inMiddle) continue;
        for (let j = i + 1; j < updated.length; j++) {
          const p2 = updated[j];
          if (p2.type === 0 || p2.opacity === 0) continue;
          const redGreen =
            (p1.type === 1 && p2.type === 2) ||
            (p1.type === 2 && p2.type === 1);
          if (!redGreen) continue;
          const d = p1.position.distanceTo(p2.position);
          if (d < COLLISION_DISTANCE) {
            // Bounce
            const dir = p1.position.clone().sub(p2.position).normalize();
            p1.velocity.add(dir.multiplyScalar(0.3));
            p2.velocity.add(dir.multiplyScalar(-0.3));
            p1.velocity.clampLength(0, 3);
            p2.velocity.clampLength(0, 3);
            i = updated.length;
            break;
          }
        }
      }

      posAttr.needsUpdate = true;
      typeAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
      opacityAttr.needsUpdate = true;
      return updated;
    });

    // Breakout detection
    if (!hasBrokenOut) {
      // If demonstrating Step 2, trigger when middle zone touches box edge
      if (animateToEdge) {
        const zoneHalf = MIDDLE_ZONE_HEIGHT / 2;
        const touchesTop =
          equilibriumRef.current + zoneHalf >= HALF_BOX * 0.995;
        const touchesBottom =
          equilibriumRef.current - zoneHalf <= -HALF_BOX * 0.995;
        if (touchesTop) {
          setHasBrokenOut(true);
          onBreakout('up');
        } else if (touchesBottom) {
          setHasBrokenOut(true);
          onBreakout('down');
        }
      } else {
        // Otherwise, use threshold based on equilibrium only
        const limit = HALF_BOX * breakoutThreshold;
        if (equilibriumRef.current > limit) {
          setHasBrokenOut(true);
          onBreakout('up');
        } else if (equilibriumRef.current < -limit) {
          setHasBrokenOut(true);
          onBreakout('down');
        }
      }
    }
  });

  return (
    <>
      {/* Particles */}
      <points ref={pointsRef}>
        <primitive object={geometry} attach="geometry" />
        <primitive object={material} attach="material" />
      </points>
      {/* Equilibrium line (absolute Y) */}
      <group position={[0, yOffset + equilibrium, 0]}>
        <mesh>
          <boxGeometry args={[BOX_SIZE * 1.2, 0.05, 0.1]} />
          <meshStandardMaterial
            color="#4a9eff"
            emissive="#2a7fff"
            emissiveIntensity={0.8}
            transparent
            opacity={0.9}
          />
        </mesh>
      </group>
      {/* Middle zone visual */}
      <mesh position={[0, yOffset + equilibrium, 0]}>
        <boxGeometry
          args={[BOX_SIZE * 1.1, MIDDLE_ZONE_HEIGHT, BOX_SIZE * 1.1]}
        />
        <meshStandardMaterial
          color="#ffff00"
          transparent
          opacity={0.1}
          emissive="#ffff00"
          emissiveIntensity={0.1}
        />
      </mesh>
    </>
  );
}

// Wireframe box helper
function BoxFrame({
  y,
  x,
  color,
  opacity = 1,
  pulse = 0,
  scale = 1,
}: {
  y: number;
  x: number;
  color: string;
  opacity?: number;
  pulse?: number; // 0..1
  scale?: number;
}) {
  const geo = useMemo(
    () => new THREE.BoxGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE),
    []
  );
  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);
  const lineMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: Math.min(1, opacity + pulse * 0.5),
        linewidth: 1,
      }),
    [color, opacity, pulse]
  );
  const fillMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        transparent: true,
        opacity: Math.max(0, opacity * 0.08 + pulse * 0.1),
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.15 + pulse * 0.6,
        roughness: 0.8,
        metalness: 0.1,
        depthWrite: false, // don't occlude particles behind semi-transparent fill
      }),
    [color, opacity, pulse]
  );
  return (
    <group position={[x, y, 0]} scale={[scale, scale, scale]}>
      <lineSegments geometry={edgesGeo} material={lineMat} />
      <mesh geometry={geo} material={fillMat} />
    </group>
  );
}

// Trail connecting centers
function StackTrail({
  points,
  color,
}: {
  points: THREE.Vector3[];
  color: string;
}) {
  const curvePoints = useMemo(() => {
    const pts = points.map((p) => p.clone());
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
    return curve.getPoints(Math.max(10, pts.length * 16));
  }, [points]);

  return (
    <DreiLine
      points={curvePoints}
      color={color}
      transparent
      opacity={0.8}
      lineWidth={TRAIL_WIDTH}
    />
  );
}

export default function TrendArchitecture3D({
  levaStore,
}: TrendArchitecture3DProps) {
  const nextIdRef = useRef(1);
  const [boxes, setBoxes] = useState<BoxState[]>([
    {
      id: nextIdRef.current++,
      y: 0,
      x: 0,
      visualY: 0,
      visualX: 0,
      isActive: true,
      polarity: 'up',
      memory: false,
      appearProgress: 1,
      pulse: 0,
    },
  ]);
  const [activeEquilibriumAbsY, setActiveEquilibriumAbsY] = useState(0);

  const controls = useControls(
    'Trend Architecture',
    {
      sequenceStep: {
        value: 0,
        min: 0,
        max: 5,
        step: 1,
        label: 'Sequence Step',
      },
      trendDirection: {
        value: 'up' as Polarity,
        options: ['up', 'down'],
        label: 'Trend Direction',
      },
      autoStack: {
        value: true,
        label: 'Auto Stack',
      },
      maxBoxes: {
        value: 4,
        min: 2,
        max: 12,
        step: 1,
        label: 'Max Boxes',
      },
      showGhosts: {
        value: true,
        label: 'Show Ghosts',
      },
      showTrail: {
        value: true,
        label: 'Show Trail',
      },
      breakoutThreshold: {
        value: 0.65,
        min: 0.5,
        max: 0.95,
        step: 0.01,
        label: 'Breakout Threshold',
      },
      particleCount: {
        value: 5000,
        min: 1000,
        max: 8000,
        step: 200,
        label: 'Particle Count',
      },
      particleSize: {
        value: 0.2,
        min: 0.05,
        max: 0.5,
        step: 0.01,
        label: 'Particle Size',
      },
      showNeutral: {
        value: true,
        label: 'Show Neutral',
      },
      reset: button(() => {
        nextIdRef.current = 1;
        setBoxes([
          {
            id: nextIdRef.current++,
            y: 0,
            x: 0,
            visualY: 0,
            visualX: 0,
            isActive: true,
            polarity: 'up',
            memory: false,
            appearProgress: 1,
            pulse: 0,
          },
        ]);
      }),
    },
    { store: levaStore }
  );

  const {
    sequenceStep,
    trendDirection,
    autoStack,
    maxBoxes,
    showGhosts,
    showTrail,
    breakoutThreshold,
    particleCount,
    particleSize,
    showNeutral,
  } = controls;

  const activeBox = boxes.find((b) => b.isActive);
  const activeIndex = boxes.findIndex((b) => b.isActive);

  // State transition helper to avoid stale closures
  const spawnFromPrev = useCallback(
    (prev: BoxState[], dir: Polarity): BoxState[] => {
      const currentActive = prev.find((b) => b.isActive);
      if (!currentActive) return prev;
      const updated = prev.map((b) =>
        b.id === currentActive.id
          ? { ...b, isActive: false, memory: true, pulse: 0 }
          : b
      );
      const offsetY = dir === 'up' ? STACK_OFFSET : -STACK_OFFSET;
      const STAIR_X_STEP = BOX_SIZE * 0.45;
      const newY = currentActive.y + offsetY;
      // Keep x movement consistent (stair-step in the same x direction even on reversal)
      const newX = currentActive.x + STAIR_X_STEP;
      const newBox: BoxState = {
        id: nextIdRef.current++,
        y: newY,
        x: newX,
        visualY: currentActive.y, // start from previous position for smooth lerp
        visualX: currentActive.x,
        isActive: true,
        polarity: dir,
        memory: false,
        appearProgress: 0,
        pulse: 0,
      };
      let next = [...updated, newBox];
      if (next.length > maxBoxes) {
        next = next.slice(next.length - maxBoxes);
      }
      return next;
    },
    [maxBoxes]
  );

  const spawnBox = useCallback(
    (dir: Polarity) => {
      setBoxes((prev) => spawnFromPrev(prev, dir));
    },
    [spawnFromPrev]
  );

  // Animate new box scale-in and ghost pulses
  useFrame((_, delta) => {
    setBoxes((prev) =>
      prev.map((b) => {
        let appear = b.appearProgress;
        if (b.isActive && appear < 1) {
          appear = Math.min(1, appear + delta * 1.5);
        }
        let pulse = b.pulse;
        if (pulse > 0) {
          pulse = Math.max(0, pulse - delta * 1.2);
        }
        // Smoothly lerp visual positions toward targets
        const lerpFactor = 1.8 * delta;
        const visualY = THREE.MathUtils.lerp(b.visualY ?? b.y, b.y, lerpFactor);
        const visualX = THREE.MathUtils.lerp(b.visualX ?? b.x, b.x, lerpFactor);
        return { ...b, appearProgress: appear, pulse, visualY, visualX };
      })
    );
  });

  // Reactivate ghosts when active equilibrium approaches memory zones
  useEffect(() => {
    if (!activeBox) return;
    setBoxes((prev) =>
      prev.map((b) => {
        if (!b.memory) return b;
        const d = Math.abs(activeEquilibriumAbsY - b.y);
        if (d < GHOST_REACTIVATE_DISTANCE) {
          return { ...b, pulse: 1 };
        }
        return b;
      })
    );
  }, [activeEquilibriumAbsY, activeBox]);

  // Derived pressures from sequence step and trend direction
  const buySell = useMemo(() => {
    // Defaults
    let buy = 0.5;
    let sell = 0.5;
    if (sequenceStep === 0) {
      buy = 0.5;
      sell = 0.5;
    } else if (sequenceStep === 1) {
      if (trendDirection === 'up') {
        buy = 0.72;
        sell = 0.35;
      } else {
        buy = 0.35;
        sell = 0.72;
      }
    } else if (sequenceStep >= 2) {
      if (trendDirection === 'up') {
        buy = 0.9;
        sell = 0.25;
      } else {
        buy = 0.25;
        sell = 0.9;
      }
    }
    return { buy, sell };
  }, [sequenceStep, trendDirection]);

  // Handle breakout from active box
  const handleBreakout = useCallback(
    (dir: Polarity) => {
      // Sequence: step 2 = breakout demo, 3/4 = stacking, 5 can reverse later
      spawnBox(dir);
    },
    [spawnBox]
  );

  // Optional reversal in step 5: when we touch any opposite-polarity ghost, flip direction
  useEffect(() => {
    if (sequenceStep !== 5 || !activeBox) return;
    const touchingOpposite = boxes.some(
      (b) =>
        b.memory &&
        b.polarity !== activeBox.polarity &&
        Math.abs(b.y - activeEquilibriumAbsY) < GHOST_REACTIVATE_DISTANCE
    );
    if (touchingOpposite) {
      // Flip future direction and also flip that ghost's polarity (polarity flip)
      const ghostIndex = boxes.findIndex(
        (b) =>
          b.memory &&
          b.polarity !== activeBox.polarity &&
          Math.abs(b.y - activeEquilibriumAbsY) < GHOST_REACTIVATE_DISTANCE
      );
      if (ghostIndex !== -1) {
        setBoxes((prev) =>
          prev.map((b, i) =>
            i === ghostIndex
              ? { ...b, polarity: activeBox.polarity, pulse: 1 }
              : b
          )
        );
      }
      // Immediately push next box in opposite direction upon next breakout
    }
  }, [sequenceStep, boxes, activeBox, activeEquilibriumAbsY]);

  // Auto stacking: gently keep pushing breakouts while step >= 3
  const autoStackTimerRef = useRef(0);
  useFrame((_, delta) => {
    if (!autoStack || sequenceStep < 3 || !activeBox) return;
    autoStackTimerRef.current += delta;
    if (autoStackTimerRef.current > 2.0) {
      autoStackTimerRef.current = 0;
      // Nudge: If equilibrium is not near threshold, we still rely on pressures to push it
      // Next breakout will trigger naturally from ActiveBox detection
    }
  });

  // Step-driven sequencing (force breakout/stack/reversal for demo reliability)
  const stepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimers = useCallback(() => {
    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = null;
    }
    if (stepTimeoutRef.current) {
      clearTimeout(stepTimeoutRef.current);
      stepTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    clearTimers();
    if (sequenceStep === 0) {
      // Reset to a single active box
      nextIdRef.current = 1;
      setBoxes([
        {
          id: nextIdRef.current++,
          y: 0,
          x: 0,
          visualY: 0,
          visualX: 0,
          isActive: true,
          polarity: 'up',
          memory: false,
          appearProgress: 1,
          pulse: 0,
        },
      ]);
      return;
    }
    // Step 2 handled by ActiveBox driving to edge and natural breakout
    if (sequenceStep === 3 || sequenceStep === 4) {
      // Step 3: stack to 3 boxes; Step 4: complete to 4 boxes (or maxBoxes cap)
      const targetCount =
        sequenceStep === 3 ? Math.min(3, maxBoxes) : Math.min(4, maxBoxes);
      stepIntervalRef.current = setInterval(() => {
        setBoxes((prev) => {
          if (prev.length >= targetCount) {
            if (stepIntervalRef.current) {
              clearInterval(stepIntervalRef.current);
              stepIntervalRef.current = null;
            }
            return prev;
          }
          return spawnFromPrev(prev, trendDirection as Polarity);
        });
      }, 800);
      return;
    }
    if (sequenceStep === 5) {
      // Demonstrate reversal: spawn opposite-direction box once
      stepTimeoutRef.current = setTimeout(() => {
        setBoxes((prev) => {
          const currentActive = prev.find((b) => b.isActive);
          if (!currentActive) return prev;
          const opposite: Polarity =
            currentActive.polarity === 'up' ? 'down' : 'up';
          // Flip the closest memory box polarity to illustrate polarity flip
          let closestIndex = -1;
          let bestDist = Infinity;
          prev.forEach((b, i) => {
            if (!b.memory) return;
            const d = Math.abs(b.y - currentActive.y);
            if (d < bestDist) {
              bestDist = d;
              closestIndex = i;
            }
          });
          let next = spawnFromPrev(prev, opposite);
          if (closestIndex !== -1 && next[closestIndex]) {
            next = next.map((b, i) =>
              i === closestIndex ? { ...b, polarity: opposite, pulse: 1 } : b
            );
          }
          return next;
        });
      }, 500);
      return;
    }
    // Cleanup on unhandled steps
    return () => clearTimers();
  }, [sequenceStep, trendDirection, maxBoxes, spawnFromPrev, clearTimers]);

  // Support/Resistance planes for memory zones
  const supportResistancePlanes = useMemo(() => {
    return boxes
      .filter((b) => b.memory)
      .map((b) => ({
        y: b.y,
        x: b.visualX ?? b.x,
        color: colorForPolarity(b.polarity),
      }));
  }, [boxes]);

  // Trail points
  const trailPoints = useMemo(() => {
    const pts = boxes.map(
      (b) => new THREE.Vector3(b.visualX ?? b.x, b.visualY ?? b.y, 0)
    );
    return pts.length >= 2 ? pts : [];
  }, [boxes]);

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
            titleBar={{ title: 'Trend & Breakout 3D' }}
            collapsed={false}
          />
        </div>
      </Html>

      {/* Memory zones: support/resistance planes */}
      {supportResistancePlanes.map((p, idx) => (
        <group key={`plane-${idx}`} position={[p.x, p.y, 0]}>
          <mesh>
            <boxGeometry args={[BOX_SIZE * 1.3, 0.04, BOX_SIZE * 1.3]} />
            <meshStandardMaterial
              color={p.color}
              transparent
              opacity={0.075}
              emissive={new THREE.Color(p.color)}
              emissiveIntensity={0.25}
            />
          </mesh>
        </group>
      ))}

      {/* Ghost box frames */}
      {boxes
        .filter((b) => b.memory && showGhosts)
        .map((b) => (
          <BoxFrame
            key={`ghost-${b.id}`}
            y={b.visualY ?? b.y}
            x={b.visualX ?? b.x}
            color={colorForPolarity(b.polarity)}
            opacity={0.28}
            pulse={b.pulse}
            scale={1}
          />
        ))}

      {/* Active box frame with scale-in */}
      {activeBox && (
        <BoxFrame
          y={activeBox.visualY ?? activeBox.y}
          x={activeBox.visualX ?? activeBox.x}
          color={colorForPolarity(activeBox.polarity)}
          opacity={0.6}
          pulse={0}
          scale={0.88 + activeBox.appearProgress * 0.12}
        />
      )}

      {/* Active box particles and dynamics */}
      {activeBox && (
        <ActiveBox
          yOffset={activeBox.visualY ?? activeBox.y}
          xOffset={activeBox.visualX ?? activeBox.x}
          buyPressure={buySell.buy}
          sellPressure={buySell.sell}
          particleCount={particleCount}
          particleSize={particleSize}
          showNeutral={showNeutral}
          breakoutThreshold={breakoutThreshold}
          animateToEdge={sequenceStep === 2}
          forceEdgeDir={
            sequenceStep === 2 ? (trendDirection as Polarity) : null
          }
          onBreakout={(dir) => {
            // In step 5, if we have recently touched an opposite ghost, invert direction
            let finalDir = dir;
            if (sequenceStep === 5) {
              const touchedOpposite = boxes.some(
                (b) =>
                  b.memory &&
                  b.polarity !== activeBox.polarity &&
                  Math.abs(b.y - activeEquilibriumAbsY) <
                    GHOST_REACTIVATE_DISTANCE
              );
              if (touchedOpposite) {
                finalDir = activeBox.polarity === 'up' ? 'down' : 'up';
              }
            }
            handleBreakout(finalDir);
          }}
          onEquilibriumYChange={(absY) => setActiveEquilibriumAbsY(absY)}
        />
      )}

      {/* Trail */}
      {showTrail && trailPoints.length >= 2 && (
        <StackTrail
          points={trailPoints}
          color={activeBox ? colorForPolarity(activeBox.polarity) : '#4a9eff'}
        />
      )}

      {/* Ground */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -HALF_BOX * 2.1, 0]}
        receiveShadow
      >
        <planeGeometry args={[BOX_SIZE * 3, BOX_SIZE * 3]} />
        <meshStandardMaterial
          color="#2a2a2a"
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>
    </>
  );
}
