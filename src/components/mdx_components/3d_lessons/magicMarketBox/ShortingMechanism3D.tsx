
import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import { useControls, LevaPanel, useCreateStore } from 'leva';
import * as THREE from 'three';

type Phase = 'idle' | 'borrow' | 'short' | 'cover' | 'equilibrium';

interface ShortingMechanism3DProps {
  levaStore: ReturnType<typeof useCreateStore>;
  showLabels?: boolean;
  onComplete?: () => void;
}

// Particle types: 0 = neutral/gray (sideline), 1 = red (seller), 2 = green (buyer), 3 = green bag (has 2+ particles)
type ParticleType = 0 | 1 | 2 | 3;

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  targetPosition: THREE.Vector3;
  type: ParticleType;
  size: number;
  opacity: number;
  bagCount: number;
  dissolving: boolean;
  dissolveProgress: number;
  isSideline: boolean;
}

// Shader material (Equilibrium-based) with tint and globalOpacity uniforms for the shadow float
const particleVertexShader = `
  uniform float tint;
  uniform float globalOpacity;
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
    } else if (particleType < 2.5) {
      vColor = vec3(0.2, 0.9, 0.2);
    } else {
      vColor = vec3(0.1, 0.8, 0.1);
    }
    // Desaturate toward gray for shadow float
    vColor = mix(vec3(0.55, 0.55, 0.55), vColor, tint);
    vOpacity = particleOpacity * globalOpacity;
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

const COLLISION_DISTANCE = 0.25;
const DISSOLVE_DURATION = 0.5;
const BAG_SCALE = 1.8;
// No sideline particles in this simulation variant

function calculateTargetPosition(
  particle: Particle,
  step: number,
  boxSize: number,
  particleIndex: number,
  totalParticles: number
): THREE.Vector3 {
  const halfSize = boxSize * 0.8;

  if (step === 0) {
    return new THREE.Vector3(
      (Math.random() * 2 - 1) * halfSize,
      (Math.random() * 2 - 1) * halfSize,
      (Math.random() * 2 - 1) * halfSize
    );
  }

  if (particle.type === 1) {
    const middleZoneThreshold = 0.05;
    const seed = (particleIndex * 7919 + 1013) % 10000;
    const isInMiddle = seed / 10000 < middleZoneThreshold;
    let y: number;
    if (isInMiddle) {
      y = (Math.random() * 2 - 1) * halfSize * 0.2;
    } else {
      y = halfSize * (0.3 + Math.random() * 0.7);
      const density = (y - halfSize * 0.3) / (halfSize * 0.7);
      const yVariation = (1 - density) * halfSize * 0.3;
      y += (Math.random() - 0.5) * yVariation;
    }
    return new THREE.Vector3(
      (Math.random() * 2 - 1) * halfSize * 0.8,
      y,
      (Math.random() * 2 - 1) * halfSize * 0.8
    );
  } else if (particle.type === 2 || particle.type === 3) {
    const middleZoneThreshold = 0.05;
    const seed = (particleIndex * 7919 + 1013) % 10000;
    const isInMiddle = seed / 10000 < middleZoneThreshold;
    let y: number;
    if (isInMiddle) {
      y = (Math.random() * 2 - 1) * halfSize * 0.2;
    } else {
      y = -halfSize * (0.3 + Math.random() * 0.7);
      const density = Math.abs((y + halfSize * 0.3) / (halfSize * 0.7));
      const yVariation = (1 - density) * halfSize * 0.3;
      y -= (Math.random() - 0.5) * yVariation;
    }
    return new THREE.Vector3(
      (Math.random() * 2 - 1) * halfSize * 0.8,
      y,
      (Math.random() * 2 - 1) * halfSize * 0.8
    );
  }

  return new THREE.Vector3(
    (Math.random() * 2 - 1) * halfSize,
    (Math.random() * 2 - 1) * halfSize,
    (Math.random() * 2 - 1) * halfSize
  );
}

export default function ShortingMechanism3D({
  levaStore,
  showLabels = true,
  onComplete,
}: ShortingMechanism3DProps) {
  // Controls (keep Equilibrium controls; add phases)
  const { step, particleCount, particleSize, collisionIntensity } = useControls(
    'Shorting Mechanism Simulation',
    {
      step: { value: 3, min: 0, max: 3, step: 1, label: 'Step' },
      particleCount: {
        value: 3000,
        min: 100,
        max: 8000,
        step: 100,
        label: 'Particle Count',
      },
      particleSize: {
        value: 0.2,
        min: 0.05,
        max: 0.5,
        step: 0.01,
        label: 'Particle Size',
      },
      collisionIntensity: {
        value: 0.3,
        min: 0.1,
        max: 2.0,
        step: 0.1,
        label: 'Collision Intensity',
      },
    },
    { store: levaStore, collapsed: true }
  );

  const {
    autoPlay,
    phase: phaseControl,
    speed,
    beamCount,
  } = useControls(
    'Shorting Phases',
    {
      autoPlay: { value: false, label: 'Auto Play' },
      phase: {
        value: 'idle' as Phase,
        options: ['idle', 'borrow', 'short', 'cover', 'equilibrium'] as Phase[],
        label: 'Phase',
      },
      speed: { value: 1.0, min: 0.25, max: 3.0, step: 0.05, label: 'Speed' },
      beamCount: {
        value: 40,
        min: 5,
        max: 200,
        step: 1,
        label: 'Borrow Beams',
      },
    },
    { store: levaStore }
  );

  // Layout controls (spacing and x-offset, expressed as multipliers of boxSize)
  const { spacingMultiplier, sceneOffsetMultiplier } = useControls(
    'Layout',
    {
      spacingMultiplier: {
        value: 2.4,
        min: 1.5,
        max: 5.0,
        step: 0.1,
        label: 'Box Spacing (×boxSize)',
      },
      sceneOffsetMultiplier: {
        value: 1.3, // positive = move right; negative = move left
        min: -3.0,
        max: 3.0,
        step: 0.1,
        label: 'Scene Offset X (×boxSize)',
      },
    },
    { store: levaStore }
  );

  // Sizing
  const boxSize = useMemo(() => {
    const baseSize = 2;
    const scaleFactor = Math.pow(particleCount / 200, 1 / 3);
    return baseSize * scaleFactor;
  }, [particleCount]);
  const BOX_SPACING = useMemo(
    () => boxSize * spacingMultiplier,
    [boxSize, spacingMultiplier]
  );
  const spreadZoneHeight = boxSize * 0.8 * 0.2;
  // Shift whole scene left to avoid overlap with Leva panel
  const SCENE_OFFSET_X = useMemo(
    () => boxSize * sceneOffsetMultiplier,
    [boxSize, sceneOffsetMultiplier]
  );
  // Horizontal offset to push labels away from the midline
  const LABEL_OFFSET_X = useMemo(() => boxSize * 0.9, [boxSize]);

  // Group A (Main float) state
  const pointsRefA = useRef<THREE.Points>(null);
  const [particlesA, setParticlesA] = useState<Particle[]>([]);
  const [priceLevelA, setPriceLevelA] = useState(0);
  const [spreadZoneOffsetA, setSpreadZoneOffsetA] = useState(0);
  const spreadZoneOffsetARef = useRef(0);
  const [priceBarYA, setPriceBarYA] = useState(0);
  // Targets for shadow-to-main flow during 'short' phase
  const transferTargetsBRef = useRef<THREE.Vector3[] | null>(null);
  // Targets for main-to-shadow return during 'cover' phase
  const returnTargetsBRef = useRef<THREE.Vector3[] | null>(null);
  // Snapshot of B local positions when entering 'short' (for cover return)
  const bStartPositionsOnShortRef = useRef<THREE.Vector3[] | null>(null);
  const geometryA = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(new Float32Array(particleCount * 3), 3)
    );
    geom.setAttribute(
      'particleType',
      new THREE.Float32BufferAttribute(new Float32Array(particleCount), 1)
    );
    geom.setAttribute(
      'particleSize',
      new THREE.Float32BufferAttribute(new Float32Array(particleCount), 1)
    );
    geom.setAttribute(
      'particleOpacity',
      new THREE.Float32BufferAttribute(new Float32Array(particleCount), 1)
    );
    return geom;
  }, [particleCount]);
  const materialA = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        tint: { value: 1.0 },
        globalOpacity: { value: 1.0 },
      },
    });
  }, []);

  // Group B (Shadow float) state
  const pointsRefB = useRef<THREE.Points>(null);
  const [particlesB, setParticlesB] = useState<Particle[]>([]);
  const [spreadZoneOffsetB, setSpreadZoneOffsetB] = useState(0);
  const spreadZoneOffsetBRef = useRef(0);
  const geometryB = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    // Performance note: we "copy" structure from A; data will be updated per-frame
    geom.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(new Float32Array(particleCount * 3), 3)
    );
    geom.setAttribute(
      'particleType',
      new THREE.Float32BufferAttribute(new Float32Array(particleCount), 1)
    );
    geom.setAttribute(
      'particleSize',
      new THREE.Float32BufferAttribute(new Float32Array(particleCount), 1)
    );
    geom.setAttribute(
      'particleOpacity',
      new THREE.Float32BufferAttribute(new Float32Array(particleCount), 1)
    );
    return geom;
  }, [particleCount]);
  const materialB = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        tint: { value: 0.7 }, // desaturate
        globalOpacity: { value: 0.8 }, // lower opacity
      },
    });
  }, []);

  // Beam indices
  const [beamIndices, setBeamIndices] = useState<number[]>([]);
  useEffect(() => {
    const idxs = new Set<number>();
    const maxCount = Math.min(beamCount, particleCount);
    while (idxs.size < maxCount)
      idxs.add(Math.floor(Math.random() * particleCount));
    setBeamIndices(Array.from(idxs));
  }, [beamCount, particleCount]);

  // Init particles (clone baseline into both groups)
  useEffect(() => {
    const halfSize = boxSize * 0.8;
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      let position: THREE.Vector3;
      let type: ParticleType;
      position = new THREE.Vector3(
        (Math.random() * 2 - 1) * halfSize,
        (Math.random() * 2 - 1) * halfSize,
        (Math.random() * 2 - 1) * halfSize
      );
      type = Math.random() < 0.5 ? 1 : 2;
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5
      );
      newParticles.push({
        position,
        velocity,
        targetPosition: position.clone(),
        type,
        size: particleSize,
        opacity: 1.0,
        bagCount: 1,
        dissolving: false,
        dissolveProgress: 0,
        isSideline: false,
      });
    }
    // Deep clone for B
    const clonedB: Particle[] = newParticles.map((p) => ({
      position: p.position.clone(),
      velocity: p.velocity.clone(),
      targetPosition: p.targetPosition.clone(),
      type: 1,
      size: p.size,
      opacity: p.opacity,
      bagCount: p.bagCount,
      dissolving: p.dissolving,
      dissolveProgress: p.dissolveProgress,
      isSideline: false,
    }));
    setParticlesA(newParticles);
    setParticlesB(clonedB);
    setSpreadZoneOffsetA(0);
    setSpreadZoneOffsetB(0);
    setPriceBarYA(0);
  }, [particleCount, boxSize, particleSize]);

  // Step changes (apply to both groups)
  useEffect(() => {
    const applyStep = (
      prevParticles: Particle[],
      setFn: (v: Particle[]) => void,
      forceRed: boolean
    ) => {
      const updated = prevParticles.map((particle, idx, arr) => {
        let newTarget: THREE.Vector3;
        if (forceRed) {
          // Shadow float: uniformly distribute reds across entire box
          const halfSize = boxSize * 0.8;
          newTarget = new THREE.Vector3(
            (Math.random() * 2 - 1) * halfSize,
            (Math.random() * 2 - 1) * halfSize,
            (Math.random() * 2 - 1) * halfSize
          );
        } else {
          newTarget = calculateTargetPosition(
            particle,
            step,
            boxSize,
            idx,
            prevParticles.length
          );
        }
        const resetType: ParticleType = particle.type === 3 ? 2 : particle.type;
        return {
          ...particle,
          type: forceRed ? 1 : resetType,
          position: newTarget.clone(),
          targetPosition: newTarget,
          bagCount: particle.type === 3 ? particle.bagCount : 1,
          dissolving: false,
          dissolveProgress: 0,
          opacity: 1.0,
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5
          ),
        };
      });
      setFn(updated);
    };
    setSpreadZoneOffsetA(0);
    setSpreadZoneOffsetB(0);
    setPriceBarYA(0);
    setParticlesA((prev) => {
      const clone = [...prev];
      applyStep(clone, (v) => clone.splice(0, clone.length, ...v), false);
      return clone;
    });
    setParticlesB((prev) => {
      const clone = [...prev];
      applyStep(clone, (v) => clone.splice(0, clone.length, ...v), true);
      return clone;
    });
  }, [step, boxSize]);

  // Spread offset refs sync
  useEffect(() => {
    spreadZoneOffsetARef.current = spreadZoneOffsetA;
    spreadZoneOffsetBRef.current = spreadZoneOffsetB;
    if (step >= 2) {
      setPriceBarYA(spreadZoneOffsetA);
    }
  }, [spreadZoneOffsetA, spreadZoneOffsetB, step]);

  // Phases (moved above effects that depend on `phase`)
  const [phase, setPhase] = useState<Phase>('idle');
  const [phaseTime, setPhaseTime] = useState(0);
  useEffect(() => {
    if (!autoPlay) {
      setPhase(phaseControl);
      setPhaseTime(0);
    }
  }, [autoPlay, phaseControl]);

  useFrame((_, delta) => {
    const dt = delta * speed;
    setPhaseTime((t) => t + dt);
    if (!autoPlay) return;
    const PHASE_DUR: Record<Phase, number> = {
      idle: 2.0,
      borrow: 3.0,
      short: 4.0,
      cover: 3.0,
      equilibrium: 3.0,
    };
    setPhase((current) => {
      const dur = PHASE_DUR[current];
      if (phaseTime + dt < dur) return current;
      if (current === 'idle') return 'borrow';
      if (current === 'borrow') return 'short';
      if (current === 'short') return 'cover';
      if (current === 'cover') return 'equilibrium';
      if (current === 'equilibrium') {
        onComplete?.();
        return 'idle';
      }
      return current;
    });
    // reset timer at boundaries
    if (
      (phase === 'idle' && phaseTime + dt >= 2.0) ||
      (phase === 'borrow' && phaseTime + dt >= 3.0) ||
      (phase === 'short' && phaseTime + dt >= 4.0) ||
      (phase === 'cover' && phaseTime + dt >= 3.0) ||
      (phase === 'equilibrium' && phaseTime + dt >= 3.0)
    ) {
      setPhaseTime(0);
    }
  });

  // Sideline logic removed
  // Compute transfer (short) and return (cover) targets for shadow float
  useEffect(() => {
    if (phase === 'short') {
      // Snapshot start positions for cover return (only once per short)
      if (!bStartPositionsOnShortRef.current) {
        bStartPositionsOnShortRef.current = particlesB.map((p) =>
          p.position.clone()
        );
      }
      const targets: THREE.Vector3[] = new Array(particleCount);
      // Build list of red indices in main float
      const redIndices: number[] = [];
      particlesA.forEach((p, i) => {
        if (p.type === 1) redIndices.push(i);
      });
      const posAttrA = geometryA.getAttribute(
        'position'
      ) as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        const ri =
          redIndices.length > 0
            ? redIndices[i % redIndices.length]
            : i % particleCount;
        // Compute B-local target corresponding to A-local position in world space
        const aLocalX = posAttrA.getX(ri);
        const aLocalY = posAttrA.getY(ri);
        const aLocalZ = posAttrA.getZ(ri);
        // World(A) = aLocalX - BOX_SPACING/2; B-local = World(A) - (+BOX_SPACING/2) = aLocalX - BOX_SPACING
        const targetLocalB = new THREE.Vector3(
          aLocalX - BOX_SPACING,
          Math.max(aLocalY, 0),
          aLocalZ
        );
        // Bias to top area (supply)
        const halfSize = boxSize * 0.8;
        targetLocalB.y = Math.max(targetLocalB.y, halfSize * 0.4);
        targets[i] = targetLocalB;
      }
      transferTargetsBRef.current = targets;
      returnTargetsBRef.current = null;
      // Push spread down
      setSpreadZoneOffsetA(() => -boxSize * 0.8 * 0.35);
    } else if (phase === 'cover') {
      // Return to saved starting positions, or random fill if missing
      const halfSize = boxSize * 0.8;
      const targets: THREE.Vector3[] =
        bStartPositionsOnShortRef.current?.map((v) => v.clone()) ||
        Array.from({ length: particleCount }, () => {
          return new THREE.Vector3(
            (Math.random() * 2 - 1) * halfSize,
            (Math.random() * 2 - 1) * halfSize,
            (Math.random() * 2 - 1) * halfSize
          );
        });
      returnTargetsBRef.current = targets;
      transferTargetsBRef.current = null;
    } else if (phase === 'equilibrium') {
      transferTargetsBRef.current = null;
      returnTargetsBRef.current = null;
      bStartPositionsOnShortRef.current = null;
    } else {
      transferTargetsBRef.current = null;
      returnTargetsBRef.current = null;
    }
  }, [
    phase,
    particlesA,
    particlesB,
    particleCount,
    geometryA,
    BOX_SPACING,
    boxSize,
  ]);

  // Phases (removed duplicate block after reordering)

  // Phase effects (opacity/tint)
  useEffect(() => {
    if ((materialB.uniforms as any)?.globalOpacity) {
      if (phase === 'short') {
        (materialB.uniforms as any).globalOpacity.value = 0.7;
        (materialB.uniforms as any).tint.value = 0.65;
      } else if (phase === 'cover') {
        (materialB.uniforms as any).globalOpacity.value = 0.6;
        (materialB.uniforms as any).tint.value = 0.6;
      } else if (phase === 'borrow') {
        (materialB.uniforms as any).globalOpacity.value = 0.8;
        (materialB.uniforms as any).tint.value = 0.7;
      } else {
        (materialB.uniforms as any).globalOpacity.value = 0.8;
        (materialB.uniforms as any).tint.value = 0.7;
      }
    }
    if (phase === 'equilibrium') {
      // Reset dissolve
      setParticlesB((prev) =>
        prev.map((p) => ({
          ...p,
          dissolving: false,
          dissolveProgress: 0,
          opacity: 1.0,
        }))
      );
      setSpreadZoneOffsetA(0);
      setSpreadZoneOffsetB(0);
      setPriceBarYA(0);
    }
  }, [phase, materialB.uniforms]);

  // Update Group A
  useFrame((state, delta) => {
    if (!pointsRefA.current || particlesA.length === 0) return;
    // Push spread zone center down during 'short', otherwise relax to 0
    const halfSizeA = boxSize * 0.8;
    const targetSpread = phase === 'short' ? -halfSizeA * 0.35 : 0;
    setSpreadZoneOffsetA((s) => s + (targetSpread - s) * delta * 2.0);
    const geom = pointsRefA.current.geometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
    const typeAttr = geom.getAttribute('particleType') as THREE.BufferAttribute;
    const sizeAttr = geom.getAttribute('particleSize') as THREE.BufferAttribute;
    const opacityAttr = geom.getAttribute(
      'particleOpacity'
    ) as THREE.BufferAttribute;
    setParticlesA((prev) => {
      const updated = [...prev];
      const halfSize = boxSize * 0.8;
      let greenYSum = 0;
      let greenCount = 0;
      updated.forEach((particle, idx) => {
        if (particle.dissolving) {
          particle.dissolveProgress += delta / DISSOLVE_DURATION;
          particle.opacity = Math.max(0, 1 - particle.dissolveProgress);
          particle.size *= 0.95;
          if (particle.dissolveProgress >= 1) particle.opacity = 0;
        } else {
          if (step >= 1 && step < 3) {
            const lerpFactor = 0.05;
            particle.position.lerp(particle.targetPosition, lerpFactor);
          } else if (step === 0) {
            particle.position.add(
              particle.velocity.clone().multiplyScalar(delta * 0.3)
            );
          }
          if (step === 3) {
            const spreadCenter = spreadZoneOffsetARef.current;
            const zoneH = halfSize * 0.2;
            if (Math.abs(particle.position.y - spreadCenter) <= zoneH) {
              particle.position.add(
                particle.velocity
                  .clone()
                  .multiplyScalar(delta * collisionIntensity * 2)
              );
              particle.position.add(
                new THREE.Vector3(
                  (Math.random() - 0.5) * delta * 0.1,
                  (Math.random() - 0.5) * delta * 0.1,
                  (Math.random() - 0.5) * delta * 0.1
                )
              );
              const dist = particle.position.distanceTo(
                particle.targetPosition
              );
              if (dist < 0.2) {
                particle.velocity.add(
                  new THREE.Vector3(
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1
                  )
                );
                particle.velocity.clampLength(0, 2);
              }
            } else {
              const lerpFactor = 0.05;
              particle.position.lerp(particle.targetPosition, lerpFactor);
            }
          }
          // Phase: in 'short', dip A's price a bit by biasing buyers slightly downward
          if (
            phase === 'short' &&
            (particle.type === 2 || particle.type === 3)
          ) {
            particle.position.y -= delta * 0.2;
          }
          // Keep in bounds
          if (Math.abs(particle.position.x) > halfSize) {
            particle.velocity.x *= -0.8;
            particle.position.x = Math.sign(particle.position.x) * halfSize;
          }
          if (Math.abs(particle.position.y) > halfSize) {
            particle.velocity.y *= -0.8;
            particle.position.y = Math.sign(particle.position.y) * halfSize;
          }
          if (Math.abs(particle.position.z) > halfSize) {
            particle.velocity.z *= -0.8;
            particle.position.z = Math.sign(particle.position.z) * halfSize;
          }
          if (particle.type === 2 || particle.type === 3) {
            greenYSum += particle.position.y;
            greenCount++;
          }
        }
        posAttr.setXYZ(
          idx,
          particle.position.x,
          particle.position.y,
          particle.position.z
        );
        typeAttr.setX(idx, particle.type);
        sizeAttr.setX(
          idx,
          particle.size * (particle.type === 3 ? BAG_SCALE : 1.0) * 10
        );
        opacityAttr.setX(idx, particle.opacity);
      });
      // Update price level
      if (greenCount > 0) {
        const avgGreenY = greenYSum / greenCount;
        setPriceLevelA(avgGreenY / halfSize);
      }
      // Update price bar within spread zone
      if (step >= 2) {
        const spreadCenter = spreadZoneOffsetARef.current;
        const zoneH = halfSize * 0.2;
        const top = spreadCenter + zoneH / 2;
        const bottom = spreadCenter - zoneH / 2;
        const fluctuation = Math.sin(state.clock.elapsedTime * 1.5) * 0.6;
        const baseTarget =
          spreadCenter + priceLevelA * zoneH * 0.35 + fluctuation * zoneH * 0.4;
        // Stronger downward bias during short
        const phaseDip = phase === 'short' ? -zoneH * 0.6 : 0;
        const targetY = baseTarget + phaseDip;
        setPriceBarYA((y) =>
          Math.max(bottom, Math.min(top, y + (targetY - y) * delta * 3))
        );
      }
      posAttr.needsUpdate = true;
      typeAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
      opacityAttr.needsUpdate = true;
      return updated;
    });
  });

  // Update Group B
  useFrame((state, delta) => {
    if (!pointsRefB.current || particlesB.length === 0) return;
    const geom = pointsRefB.current.geometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
    const typeAttr = geom.getAttribute('particleType') as THREE.BufferAttribute;
    const sizeAttr = geom.getAttribute('particleSize') as THREE.BufferAttribute;
    const opacityAttr = geom.getAttribute(
      'particleOpacity'
    ) as THREE.BufferAttribute;
    setParticlesB((prev) => {
      const updated = [...prev];
      const halfSize = boxSize * 0.8;
      updated.forEach((particle, idx) => {
        if (particle.dissolving) {
          particle.dissolveProgress += delta / DISSOLVE_DURATION;
          particle.opacity = Math.max(0, 1 - particle.dissolveProgress);
          particle.size *= 0.95;
          if (particle.dissolveProgress >= 1) particle.opacity = 0;
        } else {
          if (step >= 1 && step < 3) {
            const lerpFactor = 0.05;
            particle.position.lerp(particle.targetPosition, lerpFactor);
          } else if (step === 0) {
            particle.position.add(
              particle.velocity.clone().multiplyScalar(delta * 0.3)
            );
          }
          // Shorting phase: flow toward main float red supply area
          if (phase === 'short' && transferTargetsBRef.current) {
            const target = transferTargetsBRef.current[idx];
            if (target) {
              const lerpFactor =
                0.18 * Math.max(0.5, Math.min(2.5, collisionIntensity * 2));
              particle.position.lerp(target, lerpFactor);
            }
          } else if (phase === 'cover' && returnTargetsBRef.current) {
            // Return flow back into shadow float box
            const target = returnTargetsBRef.current[idx];
            if (target) {
              const lerpFactor =
                0.14 * Math.max(0.5, Math.min(2.5, collisionIntensity * 2));
              particle.position.lerp(target, lerpFactor);
            }
          }
          // Keep in bounds (when not fully transferred)
          // Do not clamp X so particles can cross the gap fully
          if (Math.abs(particle.position.y) > halfSize) {
            particle.velocity.y *= -0.8;
            particle.position.y = Math.sign(particle.position.y) * halfSize;
          }
          if (Math.abs(particle.position.z) > halfSize) {
            particle.velocity.z *= -0.8;
            particle.position.z = Math.sign(particle.position.z) * halfSize;
          }
        }
        posAttr.setXYZ(
          idx,
          particle.position.x,
          particle.position.y,
          particle.position.z
        );
        typeAttr.setX(idx, 1);
        sizeAttr.setX(
          idx,
          particle.size * (particle.type === 3 ? BAG_SCALE : 1.0) * 10
        );
        opacityAttr.setX(idx, particle.opacity);
      });
      posAttr.needsUpdate = true;
      typeAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
      opacityAttr.needsUpdate = true;
      return updated;
    });
  });

  // Utility: world-space beam endpoints
  const getPosA = (idx: number): THREE.Vector3 => {
    const posAttr = geometryA.getAttribute('position') as THREE.BufferAttribute;
    return new THREE.Vector3(
      posAttr.getX(idx),
      posAttr.getY(idx),
      posAttr.getZ(idx)
    ).add(new THREE.Vector3(-BOX_SPACING * 0.5 + SCENE_OFFSET_X, 0, 0));
  };
  const getPosB = (idx: number): THREE.Vector3 => {
    const posAttr = geometryB.getAttribute('position') as THREE.BufferAttribute;
    return new THREE.Vector3(
      posAttr.getX(idx),
      posAttr.getY(idx),
      posAttr.getZ(idx)
    ).add(new THREE.Vector3(BOX_SPACING * 0.5 + SCENE_OFFSET_X, 0, 0));
  };

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
            titleBar={{ title: 'Shorting Mechanism Simulation' }}
            collapsed={false}
          />
        </div>
      </Html>

      {/* Title */}
      <Html
        position={[0, boxSize * 2, 0]}
        center
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            color: 'white',
            background: 'rgba(0,0,0,0.7)',
            padding: '10px 14px',
            borderRadius: 8,
            border: '2px solid #999',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
          }}
        >
          Shorting Mechanism: Borrow → Sell → Cover
        </div>
      </Html>

      {/* Group A: Main Float (left) */}
      <group position={[-BOX_SPACING * 0.5 + SCENE_OFFSET_X, 0, 0]}>
        <mesh>
          <boxGeometry args={[boxSize * 1.6, boxSize * 1.6, boxSize * 1.6]} />
          <meshBasicMaterial
            color="#6cf79a"
            wireframe
            transparent
            opacity={0.25}
          />
        </mesh>
        {step >= 2 && (
          <mesh position={[0, spreadZoneOffsetA, 0]}>
            <boxGeometry
              args={[boxSize * 1.6, spreadZoneHeight, boxSize * 1.6]}
            />
            <meshStandardMaterial
              color="#ffff00"
              transparent
              opacity={0.12}
              emissive="#ffff00"
              emissiveIntensity={0.2}
            />
          </mesh>
        )}
        <points ref={pointsRefA}>
          <primitive object={geometryA} attach="geometry" />
          <primitive object={materialA} attach="material" />
        </points>
        {showLabels && (
          <Html
            position={[-LABEL_OFFSET_X, boxSize * 1.2, 0]}
            center
            style={{ pointerEvents: 'none' }}
          >
            <div
              style={{
                color: 'white',
                background: 'rgba(0, 0, 0, 0.6)',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '2px solid #888',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
              }}
            >
              Main Float (Real Shares)
            </div>
          </Html>
        )}
        {step >= 2 && (
          <group position={[boxSize * 0.8, priceBarYA, -boxSize * 0.8]}>
            <mesh>
              <boxGeometry args={[2.0, 0.1, 0.4]} />
              <meshStandardMaterial
                color="#4a9eff"
                emissive="#2a7fff"
                emissiveIntensity={0.5}
              />
            </mesh>
            <Html position={[0, 0, 0]} center style={{ pointerEvents: 'none' }}>
              <div
                style={{
                  color: 'white',
                  background: 'rgba(0, 0, 0, 0.7)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                  marginTop: '-20px',
                }}
              >
                Price
              </div>
            </Html>
          </group>
        )}
        {/* Shorting pressure label now on main float during short */}
        {phase === 'short' && (
          <Html
            position={[0, boxSize * 0.9, 0]}
            center
            style={{ pointerEvents: 'none' }}
          >
            <div
              style={{
                color: '#ff6060',
                background: 'rgba(0, 0, 0, 0.8)',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                border: '3px solid #ff6060',
                whiteSpace: 'nowrap',
                textAlign: 'center',
              }}
            >
              ⬇️ Shorting Pressure
            </div>
          </Html>
        )}
      </group>

      {/* Group B: Shadow Float (right) */}
      <group position={[BOX_SPACING * 0.5 + SCENE_OFFSET_X, 0, 0]}>
        <mesh>
          <boxGeometry args={[boxSize * 1.6, boxSize * 1.6, boxSize * 1.6]} />
          <meshBasicMaterial
            color="#ff8f8f"
            wireframe
            transparent
            opacity={0.2}
          />
        </mesh>
        <points ref={pointsRefB}>
          <primitive object={geometryB} attach="geometry" />
          <primitive object={materialB} attach="material" />
        </points>
        {showLabels && (
          <Html
            position={[LABEL_OFFSET_X, boxSize * 1.2, 0]}
            center
            style={{ pointerEvents: 'none' }}
          >
            <div
              style={{
                color: 'white',
                background: 'rgba(0, 0, 0, 0.6)',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '2px solid #888',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
              }}
            >
              Shadow Float (Borrowed Shares)
            </div>
          </Html>
        )}
      </group>

      {/* Borrowing beams between groups (only during borrow, connect to red in main float) */}
      {phase === 'borrow' &&
        beamIndices.map((idx) => {
          const aP = particlesA[idx];
          const bP = particlesB[idx];
          if (!aP || !bP) return null;
          const a = getPosA(idx);
          const b = getPosB(idx);
          const isBuyer = aP.type === 2 || aP.type === 3;
          const beamColor = isBuyer ? '#9bffb5' : '#ff8f8f';
          return (
            <Line
              key={`beam-${idx}`}
              points={[a, b]}
              color={beamColor}
              lineWidth={1.5}
              transparent
              opacity={0.85}
            />
          );
        })}

      {/* Ground plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -boxSize * 1.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial
          color="#2b2b2b"
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
    </>
  );
}
