
import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useControls, LevaPanel, useCreateStore } from 'leva';
import * as THREE from 'three';

interface VolumeAnatomy3DProps {
  levaStore: ReturnType<typeof useCreateStore>;
}

// Particle types: 0 = neutral/gray (sideline), 1 = red (seller), 2 = green (buyer)
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

type VolumeState = 'equilibrium' | 'moderate' | 'high' | 'extreme';

const COLLISION_DISTANCE = 0.3;
const BOX_SIZE = 4;
const HALF_BOX = BOX_SIZE / 2;
const BASE_MIDDLE_ZONE_HEIGHT = BOX_SIZE * 0.2; // Base height for equilibrium
const OSCILLATION_SPEED = 1.5;
const OSCILLATION_AMPLITUDE = 0.3;

// Volume bar configuration
const VOLUME_BAR_COUNT = 4;
const VOLUME_BAR_WIDTH = 0.4;
const VOLUME_BAR_SPACING = 1.2;
const VOLUME_BAR_MAX_HEIGHT = 2.5;
const VOLUME_BAR_PLANE_Y = -HALF_BOX * 1.8;
const VOLUME_BAR_START_X = (-(VOLUME_BAR_COUNT - 1) * VOLUME_BAR_SPACING) / 2;

const volumeBarLabels = [
  'Equilibrium',
  'Moderate Activity',
  'High Volume',
  'Extreme Surge',
];

// Shader material for particle rendering
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

// Volume state configurations
const volumeStateConfig: Record<
  VolumeState,
  {
    particleSpeed: number;
    engagementRate: number;
    collisionFrequency: number;
    particleDensity: number;
    targetVolume: number; // 0-1 for bar height
    middleZoneHeight: number; // Multiplier for middle zone height (lower = tighter spread)
  }
> = {
  equilibrium: {
    particleSpeed: 0.5,
    engagementRate: 0.005,
    collisionFrequency: 0.1,
    particleDensity: 0.3,
    targetVolume: 0.15,
    middleZoneHeight: 1.0, // Full height - wide spread
  },
  moderate: {
    particleSpeed: 1.0,
    engagementRate: 0.015,
    collisionFrequency: 0.3,
    particleDensity: 0.5,
    targetVolume: 0.45,
    middleZoneHeight: 0.75, // 75% height - moderate spread
  },
  high: {
    particleSpeed: 1.8,
    engagementRate: 0.03,
    collisionFrequency: 0.6,
    particleDensity: 0.75,
    targetVolume: 0.75,
    middleZoneHeight: 0.5, // 50% height - tight spread
  },
  extreme: {
    particleSpeed: 2.5,
    engagementRate: 0.05,
    collisionFrequency: 1.0,
    particleDensity: 1.0,
    targetVolume: 1.0,
    middleZoneHeight: 0.3, // 30% height - very tight spread
  },
};

export function VolumeAnatomy3D({ levaStore }: VolumeAnatomy3DProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [equilibrium, setEquilibrium] = useState(0);
  const equilibriumRef = useRef(0);
  const targetEquilibriumRef = useRef(0);

  // Volume tracking
  const collisionCountRef = useRef(0);
  const volumeIntensityRef = useRef(0); // 0-1
  const [volumeIntensity, setVolumeIntensity] = useState(0);
  const [volumeBarHeights, setVolumeBarHeights] = useState<number[]>([
    0, 0, 0, 0,
  ]);
  const volumeBarHeightsRef = useRef<number[]>([0, 0, 0, 0]);

  // Dynamic middle zone height tracking
  const middleZoneHeightRef = useRef(BASE_MIDDLE_ZONE_HEIGHT);
  const [middleZoneHeight, setMiddleZoneHeight] = useState(
    BASE_MIDDLE_ZONE_HEIGHT
  );

  // Leva controls
  const controls = useControls(
    'Volume Anatomy',
    {
      volumeState: {
        value: 'equilibrium' as VolumeState,
        options: ['equilibrium', 'moderate', 'high', 'extreme'],
        label: 'Volume State',
      },
      particleCount: {
        value: 5000,
        min: 1000,
        max: 10000,
        step: 500,
        label: 'Particle Count',
      },
      particleSize: {
        value: 0.2,
        min: 0.05,
        max: 0.5,
        step: 0.01,
        label: 'Particle Size',
      },
    },
    { store: levaStore }
  );

  const { volumeState, particleCount, particleSize } = controls;
  const currentConfig = volumeStateConfig[volumeState as VolumeState];

  // Initialize particles
  useEffect(() => {
    const newParticles: Particle[] = [];
    const buyerSellerCount = Math.floor(particleCount * 0.8);
    const neutralCount = particleCount - buyerSellerCount;

    for (let i = 0; i < particleCount; i++) {
      const isNeutral = i >= buyerSellerCount;
      let type: ParticleType;
      let baseY: number;

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
        opacity: 1.0,
        basePosition,
        oscillationPhase: Math.random() * Math.PI * 2,
        isEngaging: false,
        engagementProgress: 0,
      });
    }

    setParticles(newParticles);
  }, [particleCount, particleSize]);

  // Create geometry
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

  // Create material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {},
    });
  }, []);

  // Update equilibrium
  useEffect(() => {
    targetEquilibriumRef.current = 0;
  }, []);

  // Main animation loop
  useFrame((state, delta) => {
    if (particles.length === 0 || !pointsRef.current) return;

    const geom = pointsRef.current.geometry;
    if (!geom) return;

    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
    const typeAttr = geom.getAttribute('particleType') as THREE.BufferAttribute;
    const sizeAttr = geom.getAttribute('particleSize') as THREE.BufferAttribute;
    const opacityAttr = geom.getAttribute(
      'particleOpacity'
    ) as THREE.BufferAttribute;

    if (!posAttr || !typeAttr || !sizeAttr || !opacityAttr) return;

    const time = state.clock.elapsedTime;
    const speedMultiplier = currentConfig.particleSpeed;
    const adjustedDelta = delta * speedMultiplier;

    // Update equilibrium with easing
    equilibriumRef.current = THREE.MathUtils.lerp(
      equilibriumRef.current,
      targetEquilibriumRef.current,
      0.05
    );
    setEquilibrium(equilibriumRef.current);

    // Update middle zone height based on volume state (smooth transition)
    const targetMiddleZoneHeight =
      BASE_MIDDLE_ZONE_HEIGHT * currentConfig.middleZoneHeight;
    middleZoneHeightRef.current = THREE.MathUtils.lerp(
      middleZoneHeightRef.current,
      targetMiddleZoneHeight,
      0.08
    );
    setMiddleZoneHeight(middleZoneHeightRef.current);

    // Reset collision count for this frame
    let frameCollisions = 0;
    const middleZoneCenter = equilibriumRef.current;
    const currentMiddleZoneHeight = middleZoneHeightRef.current;
    const middleZoneTop = middleZoneCenter + currentMiddleZoneHeight / 2;
    const middleZoneBottom = middleZoneCenter - currentMiddleZoneHeight / 2;

    setParticles((prevParticles) => {
      const updatedParticles = [...prevParticles];

      updatedParticles.forEach((particle, idx) => {
        // Oscillation around base position
        const oscillationOffset = new THREE.Vector3(
          Math.sin(time * OSCILLATION_SPEED + particle.oscillationPhase) *
            OSCILLATION_AMPLITUDE,
          Math.cos(time * OSCILLATION_SPEED + particle.oscillationPhase) *
            OSCILLATION_AMPLITUDE,
          Math.sin(time * OSCILLATION_SPEED * 0.7 + particle.oscillationPhase) *
            OSCILLATION_AMPLITUDE
        );

        // Determine if particle should engage
        if (particle.type !== 0) {
          const distanceToMiddle = Math.abs(
            particle.position.y - middleZoneCenter
          );
          const currentMiddleZoneHeight = middleZoneHeightRef.current;
          const shouldEngage =
            distanceToMiddle > currentMiddleZoneHeight * 0.5 &&
            Math.random() < currentConfig.engagementRate * speedMultiplier;

          if (shouldEngage) {
            particle.isEngaging = true;
            particle.engagementProgress = 0;
          }

          if (particle.isEngaging) {
            // Move toward middle zone
            const currentMiddleZoneHeight = middleZoneHeightRef.current;
            const targetY =
              middleZoneCenter +
              (Math.random() * 2 - 1) * currentMiddleZoneHeight * 0.3;
            const direction = new THREE.Vector3(
              (Math.random() * 2 - 1) * HALF_BOX * 0.8 - particle.position.x,
              targetY - particle.position.y,
              (Math.random() * 2 - 1) * HALF_BOX * 0.8 - particle.position.z
            ).normalize();

            particle.velocity.lerp(
              direction.multiplyScalar(speedMultiplier),
              adjustedDelta * 2
            );
            particle.position.add(
              particle.velocity.clone().multiplyScalar(adjustedDelta)
            );
            particle.engagementProgress += adjustedDelta * 2;

            // In middle zone - add random movement for collisions
            if (
              particle.position.y >= middleZoneBottom &&
              particle.position.y <= middleZoneTop
            ) {
              particle.velocity.add(
                new THREE.Vector3(
                  (Math.random() - 0.5) * 0.5 * speedMultiplier,
                  (Math.random() - 0.5) * 0.5 * speedMultiplier,
                  (Math.random() - 0.5) * 0.5 * speedMultiplier
                )
              );
              particle.velocity.clampLength(0, 3 * speedMultiplier);
            }

            // Stop engaging after some time
            if (
              particle.engagementProgress > 3 ||
              Math.abs(particle.position.y - particle.basePosition.y) >
                HALF_BOX * 1.5
            ) {
              particle.isEngaging = false;
              particle.engagementProgress = 0;
            }
          } else {
            // Normal oscillation
            const targetPos = particle.basePosition
              .clone()
              .add(oscillationOffset);
            particle.position.lerp(targetPos, adjustedDelta * 2);
          }

          // Keep particles within bounds
          particle.position.x = THREE.MathUtils.clamp(
            particle.position.x,
            -HALF_BOX,
            HALF_BOX
          );
          particle.position.y = THREE.MathUtils.clamp(
            particle.position.y,
            -HALF_BOX,
            HALF_BOX
          );
          particle.position.z = THREE.MathUtils.clamp(
            particle.position.z,
            -HALF_BOX,
            HALF_BOX
          );

          // Return to base if not engaging
          if (
            !particle.isEngaging &&
            particle.position.distanceTo(particle.basePosition) > HALF_BOX * 0.5
          ) {
            particle.position.lerp(particle.basePosition, adjustedDelta * 1);
          }
        } else {
          // Neutral particles just oscillate
          const targetPos = particle.basePosition
            .clone()
            .add(oscillationOffset);
          particle.position.lerp(targetPos, adjustedDelta * 1);
        }

        // Update geometry attributes
        posAttr.setXYZ(
          idx,
          particle.position.x,
          particle.position.y,
          particle.position.z
        );
        typeAttr.setX(idx, particle.type);
        sizeAttr.setX(idx, particle.size * 10);
        opacityAttr.setX(idx, particle.opacity);
      });

      // Detect collisions in middle zone
      for (let i = 0; i < updatedParticles.length; i++) {
        const p1 = updatedParticles[i];
        if (p1.type === 0) continue;

        const inMiddleZone =
          p1.position.y >= middleZoneBottom && p1.position.y <= middleZoneTop;
        if (!inMiddleZone) continue;

        for (let j = i + 1; j < updatedParticles.length; j++) {
          const p2 = updatedParticles[j];
          if (p2.type === 0) continue;

          const isRedGreenCollision =
            (p1.type === 1 && p2.type === 2) ||
            (p1.type === 2 && p2.type === 1);

          if (isRedGreenCollision) {
            const distance = p1.position.distanceTo(p2.position);
            if (distance < COLLISION_DISTANCE) {
              frameCollisions++;

              // Bounce off each other
              const direction = p1.position
                .clone()
                .sub(p2.position)
                .normalize();
              p1.velocity.add(direction.multiplyScalar(0.3 * speedMultiplier));
              p2.velocity.add(direction.multiplyScalar(-0.3 * speedMultiplier));

              p1.velocity.clampLength(0, 3 * speedMultiplier);
              p2.velocity.clampLength(0, 3 * speedMultiplier);

              break;
            }
          }
        }
      }

      posAttr.needsUpdate = true;
      typeAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
      opacityAttr.needsUpdate = true;

      return updatedParticles;
    });

    // Update volume intensity based on collisions
    collisionCountRef.current = frameCollisions;
    const collisionRate = Math.min(frameCollisions / 10, 1); // Normalize to 0-1

    // Smooth volume intensity - this represents the "heartbeat" of the market
    volumeIntensityRef.current = THREE.MathUtils.lerp(
      volumeIntensityRef.current,
      collisionRate * currentConfig.collisionFrequency,
      0.15
    );
    setVolumeIntensity(volumeIntensityRef.current);

    // Update volume bar heights - animate toward target based on state and real-time intensity
    const stateIndex = ['equilibrium', 'moderate', 'high', 'extreme'].indexOf(
      volumeState
    );
    const newHeights = volumeBarHeightsRef.current.map(
      (currentHeight, index) => {
        let targetHeight = 0;

        if (index === stateIndex) {
          // Active bar: combine state target with real-time collision intensity
          // The bar grows as collisions increase in the middle zone
          const baseHeight = currentConfig.targetVolume;
          const intensityBoost = volumeIntensityRef.current * 0.4; // Add up to 40% based on real-time collisions
          targetHeight = Math.min(baseHeight + intensityBoost, 1.0);
        } else {
          // Inactive bars fade out
          targetHeight = 0;
        }

        // Smooth animation toward target
        return THREE.MathUtils.lerp(currentHeight, targetHeight, 0.12);
      }
    );

    volumeBarHeightsRef.current = newHeights;
    setVolumeBarHeights([...newHeights]);
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
            titleBar={{ title: 'Volume Anatomy' }}
            collapsed={false}
          />
        </div>
      </Html>

      {/* Main particles */}
      <points ref={pointsRef}>
        <primitive object={geometry} attach="geometry" />
        <primitive object={material} attach="material" />
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

      {/* Middle zone visualization */}
      <mesh position={[0, equilibrium, 0]}>
        <boxGeometry
          args={[BOX_SIZE * 1.1, middleZoneHeight, BOX_SIZE * 1.1]}
        />
        <meshStandardMaterial
          color="#ffff00"
          transparent
          opacity={0.1}
          emissive="#ffff00"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Volume Bars */}
      <VolumeBarsGroup
        volumeBarHeights={volumeBarHeights}
        volumeState={volumeState as VolumeState}
        volumeIntensity={volumeIntensity}
      />

      {/* Ground plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, VOLUME_BAR_PLANE_Y - 0.3, 0]}
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

// Volume Bars Component with pulsing effect
function VolumeBarsGroup({
  volumeBarHeights,
  volumeState,
  volumeIntensity,
}: {
  volumeBarHeights: number[];
  volumeState: VolumeState;
  volumeIntensity: number;
}) {
  const pulseRef = useRef(0);

  useFrame((state) => {
    // Pulse effect based on volume intensity - faster pulse when volume is higher
    const pulseSpeed = 2 + volumeIntensity * 3;
    pulseRef.current =
      Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.5 + 0.5;
  });

  return (
    <>
      {volumeBarHeights.map((height, index) => {
        const x = VOLUME_BAR_START_X + index * VOLUME_BAR_SPACING;
        const stateIndex = [
          'equilibrium',
          'moderate',
          'high',
          'extreme',
        ].indexOf(volumeState);
        const isActive = index === stateIndex;
        const barHeight = height * VOLUME_BAR_MAX_HEIGHT;

        // Color gradient based on volume level
        let barColor = '#4a9eff';
        if (index === 1) barColor = '#6bcf7f';
        else if (index === 2) barColor = '#ffa726';
        else if (index === 3) barColor = '#ef5350';

        // Pulsing glow intensity for active bar
        const pulseIntensity = isActive ? 0.5 + pulseRef.current * 0.5 : 0.3;
        const glowOpacity = isActive ? 0.2 + pulseRef.current * 0.3 : 0.1;

        return (
          <group key={index} position={[x, VOLUME_BAR_PLANE_Y, 0]}>
            {/* Volume bar */}
            <mesh position={[0, barHeight / 2, 0]}>
              <boxGeometry
                args={[VOLUME_BAR_WIDTH, barHeight, VOLUME_BAR_WIDTH]}
              />
              <meshStandardMaterial
                color={barColor}
                emissive={barColor}
                emissiveIntensity={
                  isActive ? 0.6 + pulseRef.current * 0.4 : 0.3
                }
                transparent
                opacity={0.9}
              />
            </mesh>

            {/* Glow effect for active bar */}
            {isActive && barHeight > 0.1 && (
              <mesh position={[0, barHeight / 2, 0]}>
                <boxGeometry
                  args={[
                    VOLUME_BAR_WIDTH * 1.4,
                    barHeight * 1.15,
                    VOLUME_BAR_WIDTH * 1.4,
                  ]}
                />
                <meshStandardMaterial
                  color={barColor}
                  transparent
                  opacity={glowOpacity}
                  emissive={barColor}
                  emissiveIntensity={pulseIntensity}
                />
              </mesh>
            )}

            {/* Base platform */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry
                args={[VOLUME_BAR_WIDTH * 1.2, 0.1, VOLUME_BAR_WIDTH * 1.2]}
              />
              <meshStandardMaterial
                color="#666666"
                roughness={0.8}
                metalness={0.2}
              />
            </mesh>

            {/* Label */}
            <Html
              position={[0, -0.5, 0]}
              center
              style={{ pointerEvents: 'none' }}
            >
              <div
                style={{
                  color: 'white',
                  background: isActive
                    ? 'rgba(74, 158, 255, 0.8)'
                    : 'rgba(0, 0, 0, 0.7)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: isActive ? 'bold' : 'normal',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                  minWidth: '100px',
                  border: isActive ? '2px solid #4a9eff' : 'none',
                  boxShadow: isActive ? `0 0 10px ${barColor}40` : 'none',
                }}
              >
                {volumeBarLabels[index]}
              </div>
            </Html>
          </group>
        );
      })}
    </>
  );
}

export default VolumeAnatomy3D;
