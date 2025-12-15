
import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
import { useControls, LevaPanel, useCreateStore, button } from 'leva';
import * as THREE from 'three';

interface LiquidityHunt3DProps {
  levaStore: ReturnType<typeof useCreateStore>;
}

type ParticleType = 0 | 1 | 2; // 0 = neutral, 1 = red (seller), 2 = green (buyer)
type HuntPhase =
  | 'equilibrium'
  | 'ascent'
  | 'penetration'
  | 'absorption'
  | 'reversal';

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

interface CloudParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  basePosition: THREE.Vector3;
  oscillationPhase: number;
  opacity: number;
  isAbsorbing: boolean;
  absorbed: boolean;
  absorptionProgress: number; // 0..1
}

const BOX_SIZE = 4;
const HALF_BOX = BOX_SIZE / 2;
const BASE_MIDDLE_ZONE_HEIGHT = BOX_SIZE * 0.28;
const OSCILLATION_SPEED = 1.4;
const OSCILLATION_AMPLITUDE = 0.28;

// Cloud configuration
const CLOUD_Y = HALF_BOX + 1.6; // above top of box
const CLOUD_RADIUS_XZ = 1.8;
const CLOUD_HEIGHT = 0.9;
const CLOUD_OSC_AMPLITUDE = 0.18;
const ABSORB_CONVERT_THRESHOLD = 0.35; // convert earlier to make flow obvious
const MAX_ABSORB_RATIO = 0.85; // majority of cloud converts

// Shaders (reuse particle shader from VolumeAnatomy-style)
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
      vColor = vec3(0.92, 0.25, 0.2);
    } else {
      vColor = vec3(0.2, 0.9, 0.25);
    }
    vOpacity = particleOpacity;
  }
`;

const particleFragmentShader = `
  varying vec3 vColor;
  varying float vOpacity;
  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    if (d > 0.5) discard;
    float alpha = (1.0 - smoothstep(0.3, 0.5, d)) * vOpacity;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

// Cloud shader (soft bluish/golden glow)
const cloudVertexShader = `
  attribute float particleSize;
  attribute float particleOpacity;
  attribute float tintMix;
  varying float vOpacity;
  varying float vTintMix;
  void main() {
    vec3 pos = position;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = particleSize;
    vOpacity = particleOpacity;
    vTintMix = tintMix;
  }
`;

const cloudFragmentShader = `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vOpacity;
  varying float vTintMix;
  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    if (d > 0.5) discard;
    float core = 1.0 - smoothstep(0.0, 0.5, d);
    float alpha = core * vOpacity;
    vec3 color = mix(uColorA, uColorB, clamp(vTintMix, 0.0, 1.0));
    gl_FragColor = vec4(color, alpha);
  }
`;

export default function LiquidityHunt3D({ levaStore }: LiquidityHunt3DProps) {
  const boxPointsRef = useRef<THREE.Points>(null);
  const cloudPointsRef = useRef<THREE.Points>(null);

  const [particles, setParticles] = useState<Particle[]>([]);
  const [cloudParticles, setCloudParticles] = useState<CloudParticle[]>([]);

  const [equilibrium, setEquilibrium] = useState(0);
  const equilibriumRef = useRef(0);
  const targetEquilibriumRef = useRef(0);

  const middleZoneHeightRef = useRef(BASE_MIDDLE_ZONE_HEIGHT);
  const [middleZoneHeight, setMiddleZoneHeight] = useState(
    BASE_MIDDLE_ZONE_HEIGHT
  );
  const [boxYOffset, setBoxYOffset] = useState(0);
  const boxYOffsetRef = useRef(0);
  const pressedToEdgeRef = useRef(false);
  const TOP_MARGIN = 0.04;

  // Pools/mapping for converting cloud -> red box particles
  const neutralPoolRef = useRef<number[]>([]);
  const cloudToBoxIndexRef = useRef<Map<number, number>>(new Map());
  const convertedSupplyCountRef = useRef(0);

  // Phase timeline controls
  const phases: HuntPhase[] = [
    'equilibrium',
    'ascent',
    'penetration',
    'absorption',
    'reversal',
  ];
  const phaseIndexRef = useRef(0);
  const [phase, setPhase] = useState<HuntPhase>('equilibrium');
  const phaseTimeRef = useRef(0);

  // Reset the entire cycle to initial conditions
  const resetCycle = () => {
    // Reset refs/state for positions and offsets
    targetEquilibriumRef.current = 0;
    equilibriumRef.current = 0;
    setEquilibrium(0);
    boxYOffsetRef.current = 0;
    setBoxYOffset(0);
    pressedToEdgeRef.current = false;

    // Clear conversion bookkeeping
    cloudToBoxIndexRef.current.clear();
    convertedSupplyCountRef.current = 0;

    // Rebuild box particles
    const list: Particle[] = [];
    const buyerSellerCount = Math.floor(particleCount * 0.8);
    for (let i = 0; i < particleCount; i++) {
      const isNeutral = i >= buyerSellerCount;
      let type: ParticleType;
      let baseY: number;
      if (isNeutral) {
        type = 0;
        baseY = (Math.random() * 2 - 1) * HALF_BOX;
      } else {
        type = Math.random() < 0.5 ? 1 : 2;
        baseY =
          type === 1
            ? HALF_BOX * (0.25 + Math.random() * 0.5)
            : -HALF_BOX * (0.25 + Math.random() * 0.5);
      }
      const basePosition = new THREE.Vector3(
        (Math.random() * 2 - 1) * HALF_BOX * 0.9,
        baseY,
        (Math.random() * 2 - 1) * HALF_BOX * 0.9
      );
      list.push({
        position: basePosition.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        ),
        type,
        size: particleSize,
        opacity: 1.0,
        basePosition,
        oscillationPhase: Math.random() * Math.PI * 2,
        isEngaging: false,
        engagementProgress: 0,
      });
    }
    setParticles(list);

    // Write to geometry immediately for no flicker
    if (boxPointsRef.current) {
      const geom = boxPointsRef.current.geometry;
      const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
      const typeAttr = geom.getAttribute(
        'particleType'
      ) as THREE.BufferAttribute;
      const sizeAttr = geom.getAttribute(
        'particleSize'
      ) as THREE.BufferAttribute;
      const opacityAttr = geom.getAttribute(
        'particleOpacity'
      ) as THREE.BufferAttribute;
      if (posAttr && typeAttr && sizeAttr && opacityAttr) {
        for (let i = 0; i < list.length; i++) {
          posAttr.setXYZ(
            i,
            list[i].position.x,
            list[i].position.y,
            list[i].position.z
          );
          typeAttr.setX(i, list[i].type);
          sizeAttr.setX(i, list[i].size * 10);
          opacityAttr.setX(i, 1.0);
        }
        posAttr.needsUpdate = true;
        typeAttr.needsUpdate = true;
        sizeAttr.needsUpdate = true;
        opacityAttr.needsUpdate = true;
      }
    }

    // Rebuild neutral pool
    const neutrals: number[] = [];
    for (let i = 0; i < list.length; i++) {
      if (list[i].type === 0) neutrals.push(i);
    }
    neutralPoolRef.current = neutrals;

    // Rebuild cloud particles
    const cList: CloudParticle[] = [];
    for (let i = 0; i < cloudCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = CLOUD_RADIUS_XZ * Math.sqrt(Math.random());
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = CLOUD_Y + (Math.random() * 2 - 1) * CLOUD_HEIGHT * 0.5;
      const base = new THREE.Vector3(x, y, z);
      cList.push({
        position: base.clone(),
        velocity: new THREE.Vector3(0, 0, 0),
        basePosition: base,
        oscillationPhase: Math.random() * Math.PI * 2,
        opacity: 0.9,
        isAbsorbing: false,
        absorbed: false,
        absorptionProgress: 0,
      });
    }
    setCloudParticles(cList);

    if (cloudPointsRef.current) {
      const geom = cloudPointsRef.current.geometry;
      const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
      const sizeAttr = geom.getAttribute(
        'particleSize'
      ) as THREE.BufferAttribute;
      const opacityAttr = geom.getAttribute(
        'particleOpacity'
      ) as THREE.BufferAttribute;
      const tintAttr = geom.getAttribute('tintMix') as THREE.BufferAttribute;
      if (posAttr && sizeAttr && opacityAttr && tintAttr) {
        for (let i = 0; i < cList.length; i++) {
          posAttr.setXYZ(
            i,
            cList[i].position.x,
            cList[i].position.y,
            cList[i].position.z
          );
          sizeAttr.setX(i, Math.max(1.2, particleSize * 10 * 0.9));
          opacityAttr.setX(i, 0.9);
          tintAttr.setX(i, 0);
        }
        posAttr.needsUpdate = true;
        sizeAttr.needsUpdate = true;
        opacityAttr.needsUpdate = true;
        tintAttr.needsUpdate = true;
      }
    }

    // Reset phase timeline
    phaseIndexRef.current = 0;
    setPhase('equilibrium');
    phaseTimeRef.current = 0;
  };
  const controls = useControls(
    'Liquidity Hunt',
    {
      autoPlay: { value: false, label: 'Auto Play' },
      phase: {
        value: 'equilibrium' as HuntPhase,
        options: phases,
        label: 'Phase (Manual)',
      },
      playbackSpeed: {
        value: 1,
        min: 0.5,
        max: 2.0,
        step: 0.1,
        label: 'Playback Speed',
      },
      particleCount: {
        value: 3500,
        min: 1000,
        max: 8000,
        step: 500,
        label: 'Box Particles',
      },
      cloudCount: {
        value: 1200,
        min: 200,
        max: 3000,
        step: 100,
        label: 'Cloud Particles',
      },
      particleSize: {
        value: 0.18,
        min: 0.06,
        max: 0.4,
        step: 0.01,
        label: 'Particle Size',
      },
      cloudTint: {
        value: 'blue',
        options: ['blue', 'gold'],
        label: 'Cloud Tint',
      },
      Reset: button(() => resetCycle()),
      absorbRatio: {
        value: 0.85,
        min: 0.5,
        max: 1.0,
        step: 0.05,
        label: 'Absorb Ratio',
      },
    },
    { store: levaStore }
  );

  const {
    autoPlay,
    playbackSpeed,
    particleCount,
    cloudCount,
    particleSize,
    cloudTint,
    absorbRatio,
  } = controls;
  const manualPhase = controls.phase as HuntPhase;

  // Box particle geometry/material
  const boxGeometry = useMemo(() => {
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
  }, [particleCount, particleSize]);

  const boxMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {},
    });
  }, []);

  // Cloud geometry/material
  const cloudGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(cloudCount * 3);
    const sizes = new Float32Array(cloudCount);
    const opacities = new Float32Array(cloudCount);
    const tintMix = new Float32Array(cloudCount);
    for (let i = 0; i < cloudCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      sizes[i] = Math.max(0.12, particleSize * 0.8);
      opacities[i] = 0;
      tintMix[i] = 0;
    }
    geom.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geom.setAttribute(
      'particleSize',
      new THREE.Float32BufferAttribute(sizes, 1)
    );
    geom.setAttribute(
      'particleOpacity',
      new THREE.Float32BufferAttribute(opacities, 1)
    );
    geom.setAttribute('tintMix', new THREE.Float32BufferAttribute(tintMix, 1));
    return geom;
  }, [cloudCount, particleSize]);

  const cloudMaterial = useMemo(() => {
    const colorA =
      cloudTint === 'gold'
        ? new THREE.Color('#ffd166')
        : new THREE.Color('#6fb6ff');
    const colorB = new THREE.Color('#ef5350'); // red
    return new THREE.ShaderMaterial({
      vertexShader: cloudVertexShader,
      fragmentShader: cloudFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColorA: { value: colorA },
        uColorB: { value: colorB },
      },
    });
  }, [cloudTint]);

  // Initialize box particles
  useEffect(() => {
    const list: Particle[] = [];
    const buyerSellerCount = Math.floor(particleCount * 0.8);
    for (let i = 0; i < particleCount; i++) {
      const isNeutral = i >= buyerSellerCount;
      let type: ParticleType;
      let baseY: number;
      if (isNeutral) {
        type = 0;
        baseY = (Math.random() * 2 - 1) * HALF_BOX;
      } else {
        type = Math.random() < 0.5 ? 1 : 2;
        baseY =
          type === 1
            ? HALF_BOX * (0.25 + Math.random() * 0.5)
            : -HALF_BOX * (0.25 + Math.random() * 0.5);
      }
      const basePosition = new THREE.Vector3(
        (Math.random() * 2 - 1) * HALF_BOX * 0.9,
        baseY,
        (Math.random() * 2 - 1) * HALF_BOX * 0.9
      );
      list.push({
        position: basePosition.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        ),
        type,
        size: particleSize,
        opacity: 1.0,
        basePosition,
        oscillationPhase: Math.random() * Math.PI * 2,
        isEngaging: false,
        engagementProgress: 0,
      });
    }
    setParticles(list);

    // Build initial neutral index pool for spawning new red supply
    const neutrals: number[] = [];
    for (let i = 0; i < list.length; i++) {
      if (list[i].type === 0) neutrals.push(i);
    }
    neutralPoolRef.current = neutrals;
  }, [particleCount, particleSize]);

  // Initialize cloud particles
  useEffect(() => {
    const list: CloudParticle[] = [];
    for (let i = 0; i < cloudCount; i++) {
      // Random ellipsoid distribution
      const angle = Math.random() * Math.PI * 2;
      const r = CLOUD_RADIUS_XZ * Math.sqrt(Math.random());
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = CLOUD_Y + (Math.random() * 2 - 1) * CLOUD_HEIGHT * 0.5;
      const base = new THREE.Vector3(x, y, z);
      list.push({
        position: base.clone(),
        velocity: new THREE.Vector3(0, 0, 0),
        basePosition: base,
        oscillationPhase: Math.random() * Math.PI * 2,
        opacity: 1.0,
        isAbsorbing: false,
        absorbed: false,
        absorptionProgress: 0,
      });
    }
    setCloudParticles(list);
  }, [cloudCount]);

  // Reset to equilibrium initially
  useEffect(() => {
    targetEquilibriumRef.current = 0;
    equilibriumRef.current = 0;
    setEquilibrium(0);
    phaseIndexRef.current = 0;
    setPhase('equilibrium');
    phaseTimeRef.current = 0;
  }, []);

  // Phase durations (in seconds)
  const phaseDurationsRef = useRef<Record<HuntPhase, number>>({
    equilibrium: 4,
    ascent: 3,
    penetration: 2,
    absorption: 4,
    reversal: 2,
  });

  // Main animation
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const speed = playbackSpeed;

    // Handle phase timeline
    let currentPhase: HuntPhase = phase;
    if (autoPlay) {
      currentPhase = phases[phaseIndexRef.current];
      setPhase(currentPhase);
    } else {
      currentPhase = manualPhase;
      if (phase !== manualPhase) {
        setPhase(manualPhase);
        phaseTimeRef.current = 0;
      }
    }

    phaseTimeRef.current += delta * speed;
    const duration = phaseDurationsRef.current[currentPhase];
    const t = THREE.MathUtils.clamp(phaseTimeRef.current / duration, 0, 1);

    // Define target middle zone (local) and group offset by phase
    const zoneHalf = middleZoneHeightRef.current * 0.5;
    const topPressY = HALF_BOX - zoneHalf - TOP_MARGIN; // local Y for zone center when pressed to the "ceiling"

    let targetZoneY = equilibriumRef.current;
    let targetBoxYOffset = boxYOffsetRef.current;

    if (currentPhase === 'equilibrium') {
      targetZoneY = 0;
      targetBoxYOffset = 0;
      pressedToEdgeRef.current = false;
    } else if (currentPhase === 'ascent') {
      // Press zone up toward the top of the box
      targetZoneY = THREE.MathUtils.lerp(equilibriumRef.current, topPressY, t);
      if (topPressY - targetZoneY < 0.02) {
        pressedToEdgeRef.current = true;
      }
    } else if (currentPhase === 'penetration') {
      // Keep zone pressed at top while lifting the entire box group toward the cloud
      targetZoneY = topPressY;
      const cloudBottom = CLOUD_Y - CLOUD_HEIGHT * 0.5;
      const desiredYOffset = cloudBottom - (targetZoneY + zoneHalf) + 0.02; // slight separation
      targetBoxYOffset = THREE.MathUtils.lerp(
        boxYOffsetRef.current,
        desiredYOffset,
        0.25
      );
    } else if (currentPhase === 'absorption') {
      // Hold contact at the cloud for absorption
      targetZoneY = topPressY;
      const cloudBottom = CLOUD_Y - CLOUD_HEIGHT * 0.5;
      const desiredYOffset = cloudBottom - (targetZoneY + zoneHalf) + 0.0; // touch
      targetBoxYOffset = THREE.MathUtils.lerp(
        boxYOffsetRef.current,
        desiredYOffset,
        0.1
      );
      targetBoxYOffset += Math.sin(time * 1.2) * 0.03; // subtle wobble
    } else if (currentPhase === 'reversal') {
      // New supply pushes down; return group to origin
      const overCorrect = THREE.MathUtils.lerp(
        topPressY,
        -BASE_MIDDLE_ZONE_HEIGHT * 0.3,
        Math.min(t * 2, 1)
      );
      targetZoneY = THREE.MathUtils.lerp(
        equilibriumRef.current,
        t < 0.5 ? overCorrect : 0,
        0.2
      );
      targetBoxYOffset = THREE.MathUtils.lerp(boxYOffsetRef.current, 0, 0.15);
    }

    targetEquilibriumRef.current = targetZoneY;

    // Smooth equilibrium center
    equilibriumRef.current = THREE.MathUtils.lerp(
      equilibriumRef.current,
      targetEquilibriumRef.current,
      0.08
    );
    setEquilibrium(equilibriumRef.current);

    // Smooth group offset
    boxYOffsetRef.current = THREE.MathUtils.lerp(
      boxYOffsetRef.current,
      targetBoxYOffset,
      0.12
    );
    setBoxYOffset(boxYOffsetRef.current);

    // Middle zone height subtle change per phase
    const targetHeightMultiplier =
      currentPhase === 'equilibrium'
        ? 1.0
        : currentPhase === 'ascent'
        ? 0.9
        : currentPhase === 'penetration'
        ? 0.8
        : currentPhase === 'absorption'
        ? 0.75
        : 0.9;
    middleZoneHeightRef.current = THREE.MathUtils.lerp(
      middleZoneHeightRef.current,
      BASE_MIDDLE_ZONE_HEIGHT * targetHeightMultiplier,
      0.06
    );
    setMiddleZoneHeight(middleZoneHeightRef.current);

    // Transition to next phase when time completes (auto mode)
    if (t >= 1 && currentPhase === 'reversal') {
      // Completed one full cycle → reset
      resetCycle();
      return;
    } else if (autoPlay && t >= 1) {
      phaseTimeRef.current = 0;
      phaseIndexRef.current = (phaseIndexRef.current + 1) % phases.length;
    }

    // Update BOX particles
    if (particles.length > 0 && boxPointsRef.current) {
      const geom = boxPointsRef.current.geometry;
      const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
      const typeAttr = geom.getAttribute(
        'particleType'
      ) as THREE.BufferAttribute;
      const sizeAttr = geom.getAttribute(
        'particleSize'
      ) as THREE.BufferAttribute;
      const opacityAttr = geom.getAttribute(
        'particleOpacity'
      ) as THREE.BufferAttribute;
      if (posAttr && typeAttr && sizeAttr && opacityAttr) {
        const updated = [...particles];
        const midY = equilibriumRef.current;
        const zoneHalf = middleZoneHeightRef.current * 0.5;
        const zoneTop = midY + zoneHalf;
        const zoneBot = midY - zoneHalf;

        // Measure live pressure near the zone: greens pushing up, reds resisting
        let greenAbove = 0;
        let redAbove = 0;

        for (let i = 0; i < updated.length; i++) {
          const p = updated[i];

          // Oscillation
          const osc = new THREE.Vector3(
            Math.sin(time * OSCILLATION_SPEED + p.oscillationPhase) *
              OSCILLATION_AMPLITUDE,
            Math.cos(time * OSCILLATION_SPEED + p.oscillationPhase) *
              OSCILLATION_AMPLITUDE,
            Math.sin(time * OSCILLATION_SPEED * 0.7 + p.oscillationPhase) *
              OSCILLATION_AMPLITUDE
          );

          // Engagement toward middle zone during active phases
          const activeFlow =
            currentPhase === 'ascent' ||
            currentPhase === 'penetration' ||
            currentPhase === 'absorption';
          if (p.type !== 0 && activeFlow) {
            const dirY =
              midY +
              (Math.random() * 2 - 1) * middleZoneHeightRef.current * 0.25 -
              p.position.y;
            p.velocity.y = THREE.MathUtils.lerp(
              p.velocity.y,
              dirY,
              0.04 * speed
            );

            // Show directional force: buyers push up, sellers get pushed down
            if (p.type === 2) {
              // Buyers: stronger upward bias, especially near top half of zone
              const inUpperHalf = p.position.y >= midY;
              const force = inUpperHalf ? 0.08 : 0.05;
              p.velocity.y += force * speed;
              // Pull green targets slightly toward upper band of zone
              const targetGreenY = midY + zoneHalf * 0.35;
              const toward = THREE.MathUtils.clamp(
                (targetGreenY - p.position.y) * 0.02,
                -0.15,
                0.15
              );
              p.velocity.y += toward;
              if (p.position.y > midY) greenAbove++;
            } else if (p.type === 1) {
              // Sellers now also get pushed upward (weaker than greens)
              const inUpperHalf = p.position.y >= midY;
              const force = inUpperHalf ? 0.05 : 0.035;
              p.velocity.y += force * speed;
              // Nudge reds toward upper band of zone (accumulating near the press point)
              const targetRedY = midY + zoneHalf * 0.25;
              const toward = THREE.MathUtils.clamp(
                (targetRedY - p.position.y) * 0.02,
                -0.12,
                0.12
              );
              p.velocity.y += toward;
              if (p.position.y > midY) redAbove++;
            }
          } else if (currentPhase === 'reversal') {
            // Snap effect on reversal
            p.velocity.y = THREE.MathUtils.lerp(
              p.velocity.y,
              (p.basePosition.y - p.position.y) * 0.6,
              0.2 * speed
            );
            // Additional downward bias influenced by added supply
            const supplyFactor =
              convertedSupplyCountRef.current / Math.max(1, updated.length);
            p.velocity.y -= 0.25 * supplyFactor * speed;
          } else {
            p.velocity.multiplyScalar(0.96);
          }

          // Apply velocity and oscillation pullback
          const target = p.basePosition.clone().add(osc);
          // Slightly bias towards the current mid zone center for active phases
          if (activeFlow && p.type !== 0) {
            target.y = THREE.MathUtils.lerp(target.y, midY, 0.25);
          }
          p.position.add(p.velocity.clone().multiplyScalar(delta));
          p.position.lerp(target, 0.06);

          // Bounds
          p.position.x = THREE.MathUtils.clamp(
            p.position.x,
            -HALF_BOX,
            HALF_BOX
          );
          p.position.y = THREE.MathUtils.clamp(
            p.position.y,
            -HALF_BOX,
            HALF_BOX
          );
          p.position.z = THREE.MathUtils.clamp(
            p.position.z,
            -HALF_BOX,
            HALF_BOX
          );

          // Geometry attributes
          posAttr.setXYZ(i, p.position.x, p.position.y, p.position.z);
          typeAttr.setX(i, p.type);
          sizeAttr.setX(i, p.size * 10);
          // Fade neutrals slightly during active phases to focus on battle
          const targetOpacity = p.type === 0 ? (activeFlow ? 0.55 : 0.8) : 1.0;
          p.opacity = THREE.MathUtils.lerp(p.opacity, targetOpacity, 0.08);
          opacityAttr.setX(i, p.opacity);
        }

        (
          boxPointsRef.current.geometry as THREE.BufferGeometry
        ).attributes.position.needsUpdate = true;
        typeAttr.needsUpdate = true;
        sizeAttr.needsUpdate = true;
        opacityAttr.needsUpdate = true;
        setParticles(updated);

        // Use measured pressure to nudge the zone target slightly this frame
        const pressure =
          (greenAbove - redAbove) / Math.max(1, updated.length * 0.2);
        // Clamp and apply as a subtle offset
        const pressureOffset = THREE.MathUtils.clamp(pressure, -1, 1) * 0.08;
        targetEquilibriumRef.current += pressureOffset;
      }
    }

    // Update CLOUD particles
    if (cloudParticles.length > 0 && cloudPointsRef.current) {
      const geom = cloudPointsRef.current.geometry;
      const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
      const sizeAttr = geom.getAttribute(
        'particleSize'
      ) as THREE.BufferAttribute;
      const opacityAttr = geom.getAttribute(
        'particleOpacity'
      ) as THREE.BufferAttribute;
      const tintAttr = geom.getAttribute('tintMix') as THREE.BufferAttribute;
      if (posAttr && sizeAttr && opacityAttr && tintAttr) {
        const updated = [...cloudParticles];
        const midY = equilibriumRef.current;

        // Determine how many particles start absorbing over time
        let targetAbsorbRatio = 0;
        if (phase === 'absorption') {
          targetAbsorbRatio = Math.min(absorbRatio, MAX_ABSORB_RATIO);
        } else if (phase === 'penetration') {
          targetAbsorbRatio = Math.min(absorbRatio * 0.5, 0.35);
        }
        const absorbCount = Math.floor(updated.length * targetAbsorbRatio);

        for (let i = 0; i < updated.length; i++) {
          const cp = updated[i];
          const osc = new THREE.Vector3(
            Math.sin(time * (1.1 + i * 0.0003) + cp.oscillationPhase) *
              CLOUD_OSC_AMPLITUDE,
            Math.cos(time * (0.9 + i * 0.0002) + cp.oscillationPhase) *
              (CLOUD_OSC_AMPLITUDE * 0.4),
            Math.sin(time * (0.7 + i * 0.0004) + cp.oscillationPhase) *
              CLOUD_OSC_AMPLITUDE
          );

          // Trigger absorption gradually
          if (
            (phase === 'penetration' || phase === 'absorption') &&
            i < absorbCount &&
            !cp.absorbed
          ) {
            cp.isAbsorbing = true;
          }

          if (cp.isAbsorbing && !cp.absorbed) {
            cp.absorptionProgress = Math.min(
              cp.absorptionProgress + delta * 0.28 * speed,
              1
            );
            // Move toward the middle zone center
            const target = new THREE.Vector3(
              0,
              midY +
                (Math.random() * 2 - 1) * middleZoneHeightRef.current * 0.35,
              0
            );
            const dir = target.clone().sub(cp.position).normalize();
            cp.velocity.lerp(dir.multiplyScalar(0.8), 0.1);
            cp.position.add(cp.velocity.clone().multiplyScalar(delta * 2.2));
            // Color shift (blue -> red) and visibility while absorbing
            const tint = cp.absorptionProgress;
            tintAttr.setX(i, tint);
            // Keep visible, then fade toward the end
            const targetOpacity = tint < 0.9 ? 1.0 - tint * 0.35 : 0.3;
            cp.opacity = THREE.MathUtils.lerp(cp.opacity, targetOpacity, 0.08);

            // When sufficiently absorbed, convert this cloud particle into a red box particle
            if (
              cp.absorptionProgress >= ABSORB_CONVERT_THRESHOLD &&
              !cloudToBoxIndexRef.current.has(i)
            ) {
              let boxIdx: number | undefined = undefined;
              const pool = neutralPoolRef.current;
              if (pool.length > 0) {
                boxIdx = pool.pop() as number;
              } else {
                // Fallback: convert a green to red if no neutral slots left
                for (let j = 0; j < particles.length; j++) {
                  if (particles[j].type === 2) {
                    boxIdx = j;
                    break;
                  }
                }
              }
              if (boxIdx !== undefined && boxPointsRef.current) {
                cloudToBoxIndexRef.current.set(i, boxIdx);
                convertedSupplyCountRef.current += 1;

                // Update particles array to reflect new red supply
                if (particles[boxIdx]) {
                  particles[boxIdx].type = 1; // red (supply)
                  // Spawn clearly inside the upper "red area" band
                  const spawn = new THREE.Vector3(
                    THREE.MathUtils.clamp(
                      cp.position.x * 0.6,
                      -HALF_BOX * 0.6,
                      HALF_BOX * 0.6
                    ),
                    midY + middleZoneHeightRef.current * 0.25,
                    THREE.MathUtils.clamp(
                      cp.position.z * 0.6,
                      -HALF_BOX * 0.6,
                      HALF_BOX * 0.6
                    )
                  );
                  particles[boxIdx].position.copy(spawn);
                  particles[boxIdx].basePosition.copy(
                    new THREE.Vector3(
                      spawn.x,
                      midY + middleZoneHeightRef.current * 0.1,
                      spawn.z
                    )
                  );
                  particles[boxIdx].opacity = 1.0;
                  particles[boxIdx].size = Math.max(
                    particles[boxIdx].size,
                    particleSize * 1.15
                  );
                }

                // Also push into geometry immediately for visible "turn red" effect
                const boxGeom = boxPointsRef.current.geometry;
                const posAttrBox = boxGeom.getAttribute(
                  'position'
                ) as THREE.BufferAttribute;
                const typeAttrBox = boxGeom.getAttribute(
                  'particleType'
                ) as THREE.BufferAttribute;
                const sizeAttrBox = boxGeom.getAttribute(
                  'particleSize'
                ) as THREE.BufferAttribute;
                const opacityAttrBox = boxGeom.getAttribute(
                  'particleOpacity'
                ) as THREE.BufferAttribute;
                if (
                  posAttrBox &&
                  typeAttrBox &&
                  opacityAttrBox &&
                  sizeAttrBox
                ) {
                  posAttrBox.setXYZ(
                    boxIdx!,
                    particles[boxIdx!].position.x,
                    particles[boxIdx!].position.y,
                    particles[boxIdx!].position.z
                  );
                  typeAttrBox.setX(boxIdx!, 1); // red
                  sizeAttrBox.setX(boxIdx!, particles[boxIdx!].size * 10);
                  opacityAttrBox.setX(boxIdx!, 1.0);
                  posAttrBox.needsUpdate = true;
                  typeAttrBox.needsUpdate = true;
                  sizeAttrBox.needsUpdate = true;
                  opacityAttrBox.needsUpdate = true;
                }
              }
            }

            if (
              cp.absorptionProgress >= 1 ||
              cp.position.y <= midY + middleZoneHeightRef.current * 0.5
            ) {
              cp.absorbed = true;
              cp.isAbsorbing = false;
            }
          } else {
            // Idle cloud shimmer; shake during penetration
            const shake =
              phase === 'penetration'
                ? (Math.sin(time * 8 + i * 0.01) +
                    Math.cos(time * 6.5 + i * 0.013)) *
                  0.04
                : 0;
            const baseTarget = cp.basePosition.clone().add(osc);
            baseTarget.y += shake;
            cp.position.lerp(baseTarget, 0.06);
            cp.opacity = THREE.MathUtils.lerp(cp.opacity, 0.9, 0.05);
            tintAttr.setX(i, 0);
          }

          posAttr.setXYZ(i, cp.position.x, cp.position.y, cp.position.z);
          const baseSize = Math.max(1.2, particleSize * 10 * 0.9);
          const tint = cp.isAbsorbing ? cp.absorptionProgress : 0;
          sizeAttr.setX(i, baseSize * (1.0 + 1.2 * tint));
          opacityAttr.setX(i, cp.opacity);
        }

        posAttr.needsUpdate = true;
        sizeAttr.needsUpdate = true;
        opacityAttr.needsUpdate = true;
        tintAttr.needsUpdate = true;
        setCloudParticles(updated);
      }
    }
  });

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
            titleBar={{ title: 'Liquidity Hunt' }}
            collapsed={false}
          />
        </div>
      </Html>

      {/* BOX system (particles + middle zone) moves as a group via boxYOffset */}
      <group position={[0, boxYOffset, 0]}>
        {/* BOX particles */}
        <points ref={boxPointsRef}>
          <primitive object={boxGeometry} attach="geometry" />
          <primitive object={boxMaterial} attach="material" />
        </points>

        {/* Equilibrium line */}
        <group position={[0, equilibrium, 0]}>
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

        {/* Middle zone */}
        <mesh position={[0, equilibrium, 0]}>
          <boxGeometry
            args={[BOX_SIZE * 1.08, middleZoneHeight, BOX_SIZE * 1.08]}
          />
          <meshStandardMaterial
            color="#ffff00"
            transparent
            opacity={0.1}
            emissive="#ffff00"
            emissiveIntensity={0.12}
          />
        </mesh>
      </group>

      {/* Liquidity Cloud */}
      <group position={[0, 0, 0]}>
        <points ref={cloudPointsRef}>
          <primitive object={cloudGeometry} attach="geometry" />
          <primitive object={cloudMaterial} attach="material" />
        </points>
        {/* Cloud label */}
        <Html position={[0, CLOUD_Y + CLOUD_HEIGHT * 0.8, 0]} center>
          <div
            style={{
              color: 'white',
              background: 'rgba(0, 0, 0, 0.6)',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              border: '1px solid rgba(135, 206, 250, 0.6)',
              boxShadow: '0 0 12px rgba(135,206,250,0.25)',
              whiteSpace: 'nowrap',
            }}
          >
            Liquidity Pool
          </div>
        </Html>
      </group>

      {/* Ground plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -HALF_BOX * 1.8 - 0.3, 0]}
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
