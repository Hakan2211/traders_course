
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { button, LevaPanel, useControls, useCreateStore } from 'leva';
import * as THREE from 'three';

const PRICE_LEVELS = 14;
const COLLISION_DISTANCE = 0.22;
const COLLISION_COOLDOWN = 0.4;
const VALUE_FORCE = 0.55;
const SPEED_DAMPING = 0.985;

interface VolumeAtPrice3DProps {
  levaStore: ReturnType<typeof useCreateStore>;
}

type ParticleType = 1 | 2;

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  type: ParticleType;
  size: number;
  opacity: number;
  lastCollisionTime: number;
}

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

    if (particleType < 1.5) {
      vColor = vec3(0.95, 0.32, 0.32);
    } else {
      vColor = vec3(0.2, 0.86, 0.4);
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

const createParticles = (
  count: number,
  halfExtent: number,
  particleSize: number
): Particle[] => {
  const newParticles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    newParticles.push({
      position: new THREE.Vector3(
        (Math.random() * 2 - 1) * halfExtent * 0.95,
        (Math.random() * 2 - 1) * halfExtent * 0.95,
        (Math.random() * 2 - 1) * halfExtent * 0.95
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.6,
        (Math.random() - 0.5) * 0.6,
        (Math.random() - 0.5) * 0.6
      ),
      type: Math.random() > 0.5 ? 1 : 2,
      size: particleSize,
      opacity: 1,
      lastCollisionTime: -10,
    });
  }

  return newParticles;
};

const VolumeAtPrice3D = ({ levaStore }: VolumeAtPrice3DProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  const valueBandRef = useRef<THREE.Mesh>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [volumeVersion, setVolumeVersion] = useState(0);
  const [highlightLevel, setHighlightLevel] = useState<number | null>(null);

  const volumeProfileRef = useRef<number[]>([]);
  if (volumeProfileRef.current.length === 0) {
    volumeProfileRef.current = new Array(PRICE_LEVELS).fill(0);
  }
  const maxVolumeRef = useRef(1);
  const collisionsThisFrameRef = useRef(0);

  const resetVolumeProfile = useCallback(() => {
    volumeProfileRef.current = new Array(PRICE_LEVELS).fill(0);
    maxVolumeRef.current = 1;
    setVolumeVersion((value) => value + 1);
    setHighlightLevel(null);
  }, []);

  const {
    particleCount,
    particleSize,
    collisionIntensity,
    enableCollisions,
    bandSpeed,
    bandAmplitude,
  } = useControls(
    'Volume Profile Sandbox',
    {
      particleCount: {
        value: 700,
        min: 200,
        max: 1500,
        step: 50,
        label: 'Particle Count',
      },
      particleSize: {
        value: 0.18,
        min: 0.08,
        max: 0.4,
        step: 0.01,
        label: 'Particle Size',
      },
      collisionIntensity: {
        value: 0.6,
        min: 0.1,
        max: 2,
        step: 0.05,
        label: 'Collision Push',
      },
      enableCollisions: {
        value: true,
        label: 'Count Collisions',
      },
      bandSpeed: {
        value: 0.35,
        min: 0.1,
        max: 1.5,
        step: 0.05,
        label: 'Value Migration Speed',
      },
      bandAmplitude: {
        value: 0.75,
        min: 0.2,
        max: 1.2,
        step: 0.05,
        label: 'Value Migration Range',
      },
      resetProfile: button(() => resetVolumeProfile()),
    },
    { store: levaStore }
  );

  const boxExtent = useMemo(() => {
    const baseSize = 2.4;
    const scale = Math.pow(particleCount / 500, 1 / 3);
    return baseSize * scale;
  }, [particleCount]);
  const halfExtent = boxExtent * 0.7;
  const levelHeight = (halfExtent * 2) / PRICE_LEVELS;

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

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useEffect(() => {
    setParticles(createParticles(particleCount, halfExtent, particleSize));
    resetVolumeProfile();
  }, [particleCount, particleSize, halfExtent, resetVolumeProfile]);

  useEffect(() => {
    if (highlightLevel === null) return;
    const timeout = window.setTimeout(() => setHighlightLevel(null), 1400);
    return () => window.clearTimeout(timeout);
  }, [highlightLevel]);

  const profileStats = useMemo(() => {
    const profile = volumeProfileRef.current;
    let pocIndex = 0;
    let pocValue = 0;
    profile.forEach((value, idx) => {
      if (value > pocValue) {
        pocValue = value;
        pocIndex = idx;
      }
    });

    const total = profile.reduce((sum, value) => sum + value, 0);
    console.log(
      'profileStats recalculated, total:',
      total,
      'volumeVersion:',
      volumeVersion
    );

    if (total === 0) {
      return {
        pocIndex,
        pocValue,
        totalVolume: 0,
        valueAreaLow: 0,
        valueAreaHigh: 0,
      };
    }

    const orderedLevels = profile
      .map((value, idx) => ({ idx, value }))
      .sort((a, b) => b.value - a.value);

    const included = new Set<number>();
    let running = 0;
    for (const level of orderedLevels) {
      included.add(level.idx);
      running += level.value;
      if (running / total >= 0.682) break;
    }
    const range = Array.from(included).sort((a, b) => a - b);

    return {
      pocIndex,
      pocValue,
      totalVolume: total,
      valueAreaLow: range[0] ?? 0,
      valueAreaHigh: range[range.length - 1] ?? 0,
    };
  }, [volumeVersion]);

  const swirlVector = useMemo(() => new THREE.Vector3(), []);
  const separationVector = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    if (!pointsRef.current || particles.length === 0) return;

    const geom = pointsRef.current.geometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
    const typeAttr = geom.getAttribute('particleType') as THREE.BufferAttribute;
    const sizeAttr = geom.getAttribute('particleSize') as THREE.BufferAttribute;
    const opacityAttr = geom.getAttribute(
      'particleOpacity'
    ) as THREE.BufferAttribute;

    const range = halfExtent * Math.min(1, bandAmplitude);
    const bandTargetY =
      Math.sin(state.clock.elapsedTime * bandSpeed * 0.8) * range;

    if (valueBandRef.current) {
      valueBandRef.current.position.y = bandTargetY;
    }

    collisionsThisFrameRef.current = 0;

    setParticles((prevParticles) => {
      const updatedParticles = [...prevParticles];

      updatedParticles.forEach((particle, idx) => {
        particle.velocity.y +=
          (bandTargetY - particle.position.y) * VALUE_FORCE * delta;
        particle.velocity.x += (Math.random() - 0.5) * 0.02;
        particle.velocity.z += (Math.random() - 0.5) * 0.02;

        swirlVector.set(-particle.position.z, 0, particle.position.x);
        if (swirlVector.lengthSq() > 0.0001) {
          swirlVector.normalize();
          particle.velocity.addScaledVector(
            swirlVector,
            delta * 0.4 * collisionIntensity
          );
        }

        particle.velocity.multiplyScalar(SPEED_DAMPING);
        particle.position.addScaledVector(particle.velocity, delta * 2.4);

        if (Math.abs(particle.position.x) > halfExtent) {
          particle.position.x = Math.sign(particle.position.x) * halfExtent;
          particle.velocity.x *= -0.75;
        }
        if (Math.abs(particle.position.y) > halfExtent) {
          particle.position.y = Math.sign(particle.position.y) * halfExtent;
          particle.velocity.y *= -0.6;
        }
        if (Math.abs(particle.position.z) > halfExtent) {
          particle.position.z = Math.sign(particle.position.z) * halfExtent;
          particle.velocity.z *= -0.75;
        }

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

      if (enableCollisions) {
        for (let i = 0; i < updatedParticles.length; i++) {
          const particleA = updatedParticles[i];

          for (let j = i + 1; j < updatedParticles.length; j++) {
            const particleB = updatedParticles[j];
            if (particleA.type === particleB.type) continue;

            const distance = particleA.position.distanceTo(particleB.position);
            if (distance > COLLISION_DISTANCE) continue;

            const now = state.clock.elapsedTime;
            if (
              now - particleA.lastCollisionTime < COLLISION_COOLDOWN ||
              now - particleB.lastCollisionTime < COLLISION_COOLDOWN
            ) {
              continue;
            }

            particleA.lastCollisionTime = now;
            particleB.lastCollisionTime = now;

            const collisionY =
              (particleA.position.y + particleB.position.y) * 0.5;
            const normalized = THREE.MathUtils.clamp(
              (collisionY + halfExtent) / (halfExtent * 2),
              0,
              0.9999
            );
            const levelIndex = Math.floor(normalized * PRICE_LEVELS);
            volumeProfileRef.current[levelIndex] += 1;
            maxVolumeRef.current = Math.max(
              maxVolumeRef.current,
              volumeProfileRef.current[levelIndex]
            );
            collisionsThisFrameRef.current += 1;
            console.log(
              'Collision detected! Level:',
              levelIndex,
              'New value:',
              volumeProfileRef.current[levelIndex]
            );
            setHighlightLevel(levelIndex);
            setVolumeVersion((value) => value + 1);

            separationVector
              .subVectors(particleA.position, particleB.position)
              .normalize()
              .multiplyScalar(collisionIntensity * 0.3);
            particleA.velocity.add(separationVector);
            particleB.velocity.addScaledVector(separationVector, -1);
          }
        }
      }

      posAttr.needsUpdate = true;
      typeAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
      opacityAttr.needsUpdate = true;

      return updatedParticles;
    });
  });

  const volumeBoardOffset = halfExtent + boxExtent * 0.35;
  const volumeBoardDepth = -boxExtent * 0.35;
  const maxVolume = Math.max(maxVolumeRef.current, 1);
  const profile = volumeProfileRef.current;

  return (
    <>
      <Html fullscreen prepend zIndexRange={[100, 0]}>
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            pointerEvents: 'auto',
            transform: 'scale(0.94)',
            transformOrigin: 'top right',
          }}
        >
          <style>{`
            div[class^="leva-"][data-theme],
            div[class*=" leva-"][data-theme],
            .leva__root,
            .leva-root,
            .leva-panel {
              position: relative !important;
            }
          `}</style>
          <LevaPanel
            store={levaStore}
            fill={false}
            titleBar={{ title: 'Volume Profile Sandbox' }}
            collapsed={false}
          />
        </div>
      </Html>

      <ambientLight intensity={0.7} />
      <directionalLight position={[6, 8, -4]} intensity={0.8} />
      <pointLight position={[-6, 4, 6]} intensity={0.6} color="#7dd3fc" />

      <group>
        <points ref={pointsRef}>
          <primitive object={geometry} attach="geometry" />
          <primitive object={material} attach="material" />
        </points>

        <mesh
          scale={[boxExtent, halfExtent * 2, boxExtent]}
          position={[0, 0, 0]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#0d0f18"
            transparent
            opacity={0.08}
            roughness={0.6}
            metalness={0.05}
          />
        </mesh>

        <lineSegments>
          <edgesGeometry
            attach="geometry"
            args={[new THREE.BoxGeometry(boxExtent, halfExtent * 2, boxExtent)]}
          />
          <lineBasicMaterial color="#1f2433" linewidth={1} />
        </lineSegments>

        <mesh
          ref={valueBandRef}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
        >
          <planeGeometry args={[boxExtent * 0.95, boxExtent * 0.95]} />
          <meshBasicMaterial color="#fde047" transparent opacity={0.18} />
        </mesh>

        <Html position={[0, halfExtent + 2, 0]} center>
          <div
            style={{
              background: 'rgba(5, 7, 18, 0.75)',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#e2e8ff',
              textAlign: 'center',
              minWidth: '180px',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 2 }}>
              Volume at Price Counter
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>
              {profileStats.totalVolume.toLocaleString()} hits
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              Collisions aggregated by height
            </div>
          </div>
        </Html>
      </group>

      <group position={[volumeBoardOffset, 0, volumeBoardDepth]}>
        <mesh position={[0.02, 0, 0]}>
          <boxGeometry args={[0.04, halfExtent * 2.2, 0.28]} />
          <meshStandardMaterial
            color="#05070f"
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>

        {profileStats.totalVolume > 0 && (
          <mesh
            position={[
              0.05,
              -halfExtent +
                levelHeight * profileStats.valueAreaLow +
                levelHeight *
                  (profileStats.valueAreaHigh - profileStats.valueAreaLow + 1) *
                  0.5,
              -0.03,
            ]}
          >
            <boxGeometry
              args={[
                0.08,
                levelHeight *
                  (profileStats.valueAreaHigh - profileStats.valueAreaLow + 1) *
                  0.92,
                0.18,
              ]}
            />
            <meshBasicMaterial color="#facc15" transparent opacity={0.18} />
          </mesh>
        )}

        {profile.map((value, idx) => {
          const normalized = value / maxVolume;
          const width = THREE.MathUtils.lerp(0.05, boxExtent * 1.2, normalized);
          const y = -halfExtent + levelHeight * idx + levelHeight * 0.5;
          const isPOC =
            profileStats.totalVolume > 0 && idx === profileStats.pocIndex;
          const insideVA =
            profileStats.totalVolume > 0 &&
            idx >= profileStats.valueAreaLow &&
            idx <= profileStats.valueAreaHigh;
          const isHighlighted = highlightLevel === idx;

          const color = isPOC ? '#f97316' : insideVA ? '#9bec00' : '#4a9eff';
          const emissive = isPOC ? '#b45309' : insideVA ? '#3d6b00' : '#203bff';

          return (
            <group key={`volume-bar-${idx}`} position={[0, y, 0]}>
              <mesh position={[width / 2, 0, 0]}>
                <boxGeometry
                  args={[Math.max(width, 0.05), levelHeight * 0.72, 0.25]}
                />
                <meshStandardMaterial
                  color={color}
                  emissive={emissive}
                  emissiveIntensity={isHighlighted ? 0.9 : 0.35}
                  metalness={0.25}
                  roughness={0.35}
                />
              </mesh>
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.04, levelHeight * 0.78, 0.3]} />
                <meshStandardMaterial color="#0f1320" roughness={1} />
              </mesh>
              {value > 0 && (
                <Html
                  position={[Math.max(width, 0.05) + 0.15, 0, 0]}
                  style={{
                    color: '#cfd8ff',
                    fontSize: '11px',
                    background: 'rgba(5, 7, 18, 0.8)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {value.toLocaleString()}
                </Html>
              )}
              {isPOC && (
                <Html
                  position={[
                    Math.max(width, 0.05) + 0.15,
                    levelHeight * 0.45,
                    0,
                  ]}
                  style={{
                    color: '#f97316',
                    fontSize: '10px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    background: 'rgba(31, 17, 4, 0.9)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  POC
                </Html>
              )}
            </group>
          );
        })}

        <Html position={[boxExtent * 1.2, halfExtent + 2.0, 0]}>
          <div
            style={{
              color: '#9bb4ff',
              fontSize: '12px',
              background: 'rgba(8, 10, 18, 0.85)',
              padding: '6px 10px',
              borderRadius: '6px',
              textAlign: 'center',
              minWidth: '220px',
              maxWidth: '260px',
            }}
          >
            Width = Volume traded at that price level
            <br />
            Highlighted bar = latest collision cluster
          </div>
        </Html>
      </group>
    </>
  );
};

export default VolumeAtPrice3D;
