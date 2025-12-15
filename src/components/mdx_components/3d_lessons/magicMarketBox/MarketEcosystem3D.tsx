
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useControls, LevaPanel, useCreateStore } from 'leva';
import * as THREE from 'three';

interface MarketEcosystem3DProps {
  levaStore: ReturnType<typeof useCreateStore>;
}

type ParticleKind =
  | 'buyerSmall'
  | 'buyerLarge'
  | 'sellerSmall'
  | 'sellerLarge'
  | 'marketMaker'
  | 'algo';

type Sentiment = 'neutral' | 'optimistic' | 'fearful';

interface Particle {
  id: number;
  kind: ParticleKind;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  targetPosition: THREE.Vector3;
  size: number;
  color: THREE.Color;
  groupIndex: number;
  orbitAngle?: number;
  orbitRadius?: number;
}

interface ParticleConfig {
  count: number;
  size: number;
  color: string;
  baseSpeed: number;
}

const BOX_SIZE = 8;
const HALF_BOX = BOX_SIZE * 0.5;
const SPREAD_HALF_HEIGHT = BOX_SIZE * 0.18;
const BASE_COLLISION_DISTANCE = 0.45;

const PARTICLE_CONFIG: Record<ParticleKind, ParticleConfig> = {
  buyerSmall: {
    count: 260,
    size: 0.14,
    color: '#6bff9c',
    baseSpeed: 0.85,
  },
  buyerLarge: {
    count: 90,
    size: 0.65,
    color: '#25a060',
    baseSpeed: 0.45,
  },
  sellerSmall: {
    count: 260,
    size: 0.14,
    color: '#ff7b8a',
    baseSpeed: 0.85,
  },
  sellerLarge: {
    count: 90,
    size: 0.65,
    color: '#c7363b',
    baseSpeed: 0.45,
  },
  marketMaker: {
    count: 180,
    size: 0.26,
    color: '#ffe066',
    baseSpeed: 1.2,
  },
  algo: {
    count: 140,
    size: 0.14,
    color: '#5ec5ff',
    baseSpeed: 1.8,
  },
};

const SENTIMENT_PRESETS: Record<
  Sentiment,
  {
    movementMultiplier: number;
    collisionRadiusMultiplier: number;
    collisionImpulse: number;
    glowColor: string;
    glowIntensity: number;
    flashColor: string;
  }
> = {
  neutral: {
    movementMultiplier: 1,
    collisionRadiusMultiplier: 1,
    collisionImpulse: 1,
    glowColor: '#8b8b8b',
    glowIntensity: 0.18,
    flashColor: '#ffffff',
  },
  optimistic: {
    movementMultiplier: 1.35,
    collisionRadiusMultiplier: 1.25,
    collisionImpulse: 1.3,
    glowColor: '#5cf29b',
    glowIntensity: 0.35,
    flashColor: '#83ffbf',
  },
  fearful: {
    movementMultiplier: 0.65,
    collisionRadiusMultiplier: 0.8,
    collisionImpulse: 0.7,
    glowColor: '#ff5f5f',
    glowIntensity: 0.35,
    flashColor: '#ff9999',
  },
};

const particleVertexShader = `
  attribute vec3 particleColor;
  attribute float particleSize;
  attribute float particleOpacity;
  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    vColor = particleColor;
    vOpacity = particleOpacity;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = particleSize;
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

const randBetween = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const createParticles = (): Particle[] => {
  const particles: Particle[] = [];
  let idCounter = 0;

  (Object.keys(PARTICLE_CONFIG) as ParticleKind[]).forEach((kind) => {
    const cfg = PARTICLE_CONFIG[kind];
    for (let i = 0; i < cfg.count; i++) {
      const position = new THREE.Vector3(
        randBetween(-HALF_BOX * 0.5, HALF_BOX * 0.5),
        randBetween(-HALF_BOX * 0.5, HALF_BOX * 0.5),
        randBetween(-HALF_BOX * 0.5, HALF_BOX * 0.5)
      );

      particles.push({
        id: idCounter++,
        kind,
        groupIndex: i,
        position,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3
        ),
        targetPosition: position.clone(),
        size: cfg.size,
        color: new THREE.Color(cfg.color),
        orbitAngle: kind === 'algo' ? Math.random() * Math.PI * 2 : undefined,
        orbitRadius:
          kind === 'algo' ? BOX_SIZE * (1.1 + Math.random() * 0.5) : undefined,
      });
    }
  });

  return particles;
};

const getTargetPosition = (particle: Particle, step: number) => {
  if (step === 0) {
    return new THREE.Vector3(
      randBetween(-HALF_BOX * 0.6, HALF_BOX * 0.6),
      randBetween(-HALF_BOX * 0.6, HALF_BOX * 0.6),
      randBetween(-HALF_BOX * 0.6, HALF_BOX * 0.6)
    );
  }

  const horizontalSpread = HALF_BOX * 0.75;
  if (particle.kind === 'buyerSmall' || particle.kind === 'buyerLarge') {
    return new THREE.Vector3(
      randBetween(-horizontalSpread, horizontalSpread),
      randBetween(-HALF_BOX, -HALF_BOX * 0.25),
      randBetween(-horizontalSpread, horizontalSpread)
    );
  }

  if (particle.kind === 'sellerSmall' || particle.kind === 'sellerLarge') {
    return new THREE.Vector3(
      randBetween(-horizontalSpread, horizontalSpread),
      randBetween(HALF_BOX * 0.25, HALF_BOX),
      randBetween(-horizontalSpread, horizontalSpread)
    );
  }

  if (particle.kind === 'marketMaker') {
    const lane = particle.groupIndex % 3;
    const yOffset =
      lane === 0
        ? 0
        : lane === 1
        ? SPREAD_HALF_HEIGHT * 0.8
        : -SPREAD_HALF_HEIGHT * 0.8;
    return new THREE.Vector3(
      randBetween(-horizontalSpread * 0.4, horizontalSpread * 0.4),
      yOffset +
        randBetween(-SPREAD_HALF_HEIGHT * 0.2, SPREAD_HALF_HEIGHT * 0.2),
      randBetween(-horizontalSpread * 0.4, horizontalSpread * 0.4)
    );
  }

  // algo particles target a loose orbit shell
  const angle = particle.orbitAngle ?? Math.random() * Math.PI * 2;
  const radius = particle.orbitRadius ?? BOX_SIZE * 1.25;
  return new THREE.Vector3(
    Math.cos(angle) * radius,
    randBetween(-HALF_BOX * 0.3, HALF_BOX * 0.3),
    Math.sin(angle) * radius
  );
};

const clampToBox = (vec: THREE.Vector3, margin = 0.9) => {
  const limit = HALF_BOX * margin;
  vec.set(
    THREE.MathUtils.clamp(vec.x, -limit, limit),
    THREE.MathUtils.clamp(vec.y, -limit, limit),
    THREE.MathUtils.clamp(vec.z, -limit, limit)
  );
};

const MarketEcosystem3D = ({ levaStore }: MarketEcosystem3DProps) => {
  const particlesRef = useRef<Particle[]>(createParticles());
  const pointsRef = useRef<THREE.Points>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [collisionFlash, setCollisionFlash] = useState<{
    position: THREE.Vector3;
    intensity: number;
    color: string;
  } | null>(null);

  const {
    step,
    sentiment,
    retailSpeed,
    institutionSpeed,
    marketMakerSpeed,
    algoSpeed,
  } = useControls(
    'Market Ecosystem',
    {
      step: {
        value: 1,
        min: 1,
        max: 2,
        step: 1,
        label: 'Step',
      },
      retailSpeed: {
        value: 0.8,
        min: 0.2,
        max: 3,
        step: 0.1,
        label: 'Retail Flow Speed',
      },
      institutionSpeed: {
        value: 0.5,
        min: 0.1,
        max: 2,
        step: 0.1,
        label: 'Institution Flow Speed',
      },
      marketMakerSpeed: {
        value: 1.1,
        min: 0.2,
        max: 3,
        step: 0.1,
        label: 'Market Maker Speed',
      },
      algoSpeed: {
        value: 1.9,
        min: 0.5,
        max: 4,
        step: 0.1,
        label: 'Algorithm Speed',
      },
      sentiment: {
        value: 'neutral',
        options: {
          Neutral: 'neutral',
          Optimistic: 'optimistic',
          Fearful: 'fearful',
        },
      },
    },
    { store: levaStore }
  );

  const activeSentiment: Sentiment = sentiment as Sentiment;
  const sentimentPreset = SENTIMENT_PRESETS[activeSentiment];

  const totalParticles = useMemo(() => {
    let total = 0;
    Object.values(PARTICLE_CONFIG).forEach((cfg) => {
      total += cfg.count;
    });
    return total;
  }, []);

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(totalParticles * 3);
    const colors = new Float32Array(totalParticles * 3);
    const sizes = new Float32Array(totalParticles);
    const opacities = new Float32Array(totalParticles);

    geom.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geom.setAttribute(
      'particleColor',
      new THREE.Float32BufferAttribute(colors, 3)
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
  }, [totalParticles]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  // Assign base attributes once
  useEffect(() => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const colorAttr = geom.getAttribute(
      'particleColor'
    ) as THREE.BufferAttribute;
    const sizeAttr = geom.getAttribute('particleSize') as THREE.BufferAttribute;
    const opacityAttr = geom.getAttribute(
      'particleOpacity'
    ) as THREE.BufferAttribute;

    particlesRef.current.forEach((particle, idx) => {
      colorAttr.setXYZ(
        idx,
        particle.color.r,
        particle.color.g,
        particle.color.b
      );
      sizeAttr.setX(idx, particle.size * 30);
      opacityAttr.setX(idx, 1);
    });

    colorAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
    opacityAttr.needsUpdate = true;
  }, []);

  // Write initial positions to the GPU immediately so particles are visible without refresh
  useEffect(() => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
    if (!posAttr) return;
    particlesRef.current.forEach((p, idx) => {
      posAttr.setXYZ(idx, p.position.x, p.position.y, p.position.z);
    });
    posAttr.needsUpdate = true;
  }, []);

  useEffect(() => {
    particlesRef.current.forEach((particle) => {
      particle.targetPosition.copy(getTargetPosition(particle, step));
    });
  }, [step]);

  useFrame((state, delta) => {
    const points = pointsRef.current;
    if (!points) return;

    const geom = points.geometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;

    const buyers: number[] = [];
    const sellers: number[] = [];
    const particles = particlesRef.current;

    const movementBoost = sentimentPreset.movementMultiplier;

    particles.forEach((particle, idx) => {
      const cfg = PARTICLE_CONFIG[particle.kind];
      let speedControl = cfg.baseSpeed;

      if (particle.kind === 'buyerSmall' || particle.kind === 'sellerSmall') {
        speedControl = cfg.baseSpeed * retailSpeed;
      } else if (
        particle.kind === 'buyerLarge' ||
        particle.kind === 'sellerLarge'
      ) {
        speedControl = cfg.baseSpeed * institutionSpeed;
      } else if (particle.kind === 'marketMaker') {
        speedControl = cfg.baseSpeed * marketMakerSpeed;
      } else if (particle.kind === 'algo') {
        speedControl = cfg.baseSpeed * algoSpeed;
      }

      if (particle.kind === 'algo') {
        particle.orbitAngle =
          (particle.orbitAngle ?? 0) + delta * speedControl * movementBoost;
        const radius = particle.orbitRadius ?? BOX_SIZE * 1.2;
        const angle = particle.orbitAngle;
        particle.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle * 2) * BOX_SIZE * 0.3,
          Math.sin(angle) * radius
        );
      } else {
        const lerpStrength =
          delta * (0.8 + Math.random() * 0.3) * speedControl * movementBoost;
        particle.position.lerp(particle.targetPosition, lerpStrength);

        // Add subtle drift
        const driftScale =
          delta *
          speedControl *
          movementBoost *
          (particle.kind === 'marketMaker' ? 0.8 : 0.4);
        particle.position.add(
          new THREE.Vector3(
            (Math.random() - 0.5) * driftScale * 3,
            (Math.random() - 0.5) * driftScale,
            (Math.random() - 0.5) * driftScale * 3
          )
        );
      }

      clampToBox(particle.position, particle.kind === 'algo' ? 1.6 : 0.95);

      if (particle.kind === 'buyerSmall' || particle.kind === 'buyerLarge') {
        buyers.push(idx);
      } else if (
        particle.kind === 'sellerSmall' ||
        particle.kind === 'sellerLarge'
      ) {
        sellers.push(idx);
      }

      posAttr.setXYZ(
        idx,
        particle.position.x,
        particle.position.y,
        particle.position.z
      );
    });

    posAttr.needsUpdate = true;

    if (step >= 1) {
      const detectionRadius =
        BASE_COLLISION_DISTANCE * sentimentPreset.collisionRadiusMultiplier;
      const impulseStrength = 0.08 * sentimentPreset.collisionImpulse;
      let flashQueued: { position: THREE.Vector3; color: string } | null = null;

      for (let i = 0; i < buyers.length; i += 2) {
        const buyer = particles[buyers[i]];
        if (!buyer || Math.abs(buyer.position.y) > SPREAD_HALF_HEIGHT) continue;

        for (let j = 0; j < sellers.length; j += 2) {
          const seller = particles[sellers[j]];
          if (!seller || Math.abs(seller.position.y) > SPREAD_HALF_HEIGHT)
            continue;

          const distance = buyer.position.distanceTo(seller.position);
          if (distance < detectionRadius) {
            const dir = buyer.position.clone().sub(seller.position).normalize();
            const buyerMass = buyer.kind === 'buyerLarge' ? 1.6 : 1;
            const sellerMass = seller.kind === 'sellerLarge' ? 1.6 : 1;

            buyer.position.add(
              dir.clone().multiplyScalar(impulseStrength / buyerMass)
            );
            seller.position.add(
              dir.clone().multiplyScalar(-impulseStrength / sellerMass)
            );

            if (!flashQueued) {
              flashQueued = {
                position: buyer.position
                  .clone()
                  .add(seller.position)
                  .multiplyScalar(0.5),
                color: sentimentPreset.flashColor,
              };
            }

            break;
          }
        }
      }

      if (flashQueued) {
        setCollisionFlash({
          position: flashQueued.position,
          intensity: 1,
          color: flashQueued.color,
        });
      }
    }
  });

  useFrame((_, delta) => {
    if (!collisionFlash) return;
    setCollisionFlash((prev) => {
      if (!prev) return null;
      const intensity = Math.max(0, prev.intensity - delta * 3);
      if (intensity <= 0) return null;
      return { ...prev, intensity };
    });
  });

  useEffect(() => {
    if (!glowRef.current) return;
    const material = glowRef.current.material as THREE.MeshStandardMaterial;
    material.color.set(sentimentPreset.glowColor);
    material.emissive.set(sentimentPreset.glowColor);
    material.emissiveIntensity = sentimentPreset.glowIntensity;
  }, [sentimentPreset]);

  return (
    <>
      <Html fullscreen prepend zIndexRange={[100, 0]}>
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            transform: 'scale(0.95)',
            transformOrigin: 'top right',
            pointerEvents: 'auto',
            zIndex: 10,
          }}
        >
          <LevaPanel
            store={levaStore}
            fill={false}
            titleBar={{ title: 'Market Ecosystem' }}
            collapsed={false}
          />
        </div>
      </Html>

      {/* Box glow */}
      <mesh
        ref={glowRef}
        scale={[BOX_SIZE * 1.1, BOX_SIZE * 1.1, BOX_SIZE * 1.1]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          transparent
          opacity={0.15}
          color={sentimentPreset.glowColor}
          emissive={sentimentPreset.glowColor}
          emissiveIntensity={sentimentPreset.glowIntensity}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Spread zone */}
      {step >= 1 && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry
            args={[BOX_SIZE * 1.4, SPREAD_HALF_HEIGHT * 2, BOX_SIZE * 1.4]}
          />
          <meshStandardMaterial
            color="#f4f1bb"
            transparent
            opacity={0.12}
            emissive="#f4f1bb"
            emissiveIntensity={0.1}
            depthWrite={false}
            depthTest={false}
          />
        </mesh>
      )}

      <points ref={pointsRef} renderOrder={10}>
        <primitive object={geometry} attach="geometry" />
        <primitive object={material} attach="material" />
      </points>

      {collisionFlash && (
        <mesh position={collisionFlash.position}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshBasicMaterial
            color={collisionFlash.color}
            transparent
            opacity={collisionFlash.intensity * 0.8}
          />
        </mesh>
      )}

      {step >= 2 && (
        <Html position={[0, HALF_BOX * 1.15, 0]} center>
          <div
            style={{
              padding: '8px 16px',
              borderRadius: '999px',
              background:
                activeSentiment === 'optimistic'
                  ? 'rgba(92, 242, 155, 0.15)'
                  : activeSentiment === 'fearful'
                  ? 'rgba(255, 95, 95, 0.15)'
                  : 'rgba(255, 255, 255, 0.08)',
              border: `1px solid ${sentimentPreset.glowColor}`,
              color: '#fff',
              fontSize: '14px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Sentiment: {activeSentiment}
          </div>
        </Html>
      )}

      {/* Ground plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -BOX_SIZE * 0.7, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0c0c0c" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Layer labels */}
      {step >= 1 && (
        <>
          <Html
            position={[0, HALF_BOX * 0.95, 0]}
            center
            style={{ pointerEvents: 'none' }}
          >
            <div
              style={{
                color: '#ff8e8e',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontSize: '18px',
              }}
            >
              Supply: Institutions + Retail
            </div>
          </Html>
          <Html
            position={[0, -HALF_BOX * 0.95, 0]}
            center
            style={{ pointerEvents: 'none' }}
          >
            <div
              style={{
                color: '#8bffc4',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontSize: '18px',
              }}
            >
              Demand: Institutions + Retail
            </div>
          </Html>
          <Html
            position={[0, 0, BOX_SIZE * 0.95]}
            center
            style={{ pointerEvents: 'none' }}
          >
            <div
              style={{
                color: '#ffe066',
                fontWeight: 600,
                letterSpacing: '0.08em',
                fontSize: '16px',
              }}
            >
              Yellow = Market Makers
            </div>
          </Html>
          <Html
            position={[0, 0, -BOX_SIZE * 0.95]}
            center
            style={{ pointerEvents: 'none' }}
          >
            <div
              style={{
                color: '#5ec5ff',
                fontWeight: 600,
                letterSpacing: '0.08em',
                fontSize: '16px',
              }}
            >
              Blue = HFT / Algos
            </div>
          </Html>
        </>
      )}
    </>
  );
};

export default MarketEcosystem3D;
