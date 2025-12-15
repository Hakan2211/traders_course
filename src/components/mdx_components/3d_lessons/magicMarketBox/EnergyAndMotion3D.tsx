
import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useControls, LevaPanel, useCreateStore } from 'leva';
import * as THREE from 'three';

interface EnergyAndMotion3DProps {
  levaStore: ReturnType<typeof useCreateStore>;
}

// Particle types: 0 = neutral, 1 = red (seller), 2 = green (buyer), 3 = green bag (has 2+ particles)
type ParticleType = 0 | 1 | 2 | 3;

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  type: ParticleType;
  size: number;
  opacity: number;
  bagCount: number; // Number of particles in the bag (for green bags)
  dissolving: boolean; // For red particles that are dissolving
  dissolveProgress: number; // 0 to 1, for dissolve animation
}

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
    
    // Point size from attribute
    gl_PointSize = particleSize;
    
    // Color based on particleType
    if (particleType < 0.5) {
      vColor = vec3(0.7, 0.7, 0.7); // Neutral gray
    } else if (particleType < 1.5) {
      vColor = vec3(0.9, 0.2, 0.2); // Red
    } else if (particleType < 2.5) {
      vColor = vec3(0.2, 0.9, 0.2); // Green
    } else {
      vColor = vec3(0.1, 0.8, 0.1); // Darker green for bag
    }
    
    vOpacity = particleOpacity;
  }
`;

const particleFragmentShader = `
  varying vec3 vColor;
  varying float vOpacity;
  
  void main() {
    // Create circular point shape
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;
    
    // Smooth edge
    float alpha = (1.0 - smoothstep(0.3, 0.5, dist)) * vOpacity;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

const COLLISION_DISTANCE = 0.15; // Distance threshold for collision detection
const DISSOLVE_DURATION = 0.5; // Seconds for dissolve animation
const BAG_SCALE = 1.8; // How much bigger the bag is than a regular particle
const VOLUME_BAR_TARGET_COLLISIONS = 1500; // Approx collisions to fill the bar

export function EnergyAndMotion3D({ levaStore }: EnergyAndMotion3DProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const collisionFlashRef = useRef<THREE.Mesh>(null);
  const volumeBarRef = useRef<THREE.Mesh>(null);
  const [collisionFlash, setCollisionFlash] = useState<{
    position: THREE.Vector3;
    intensity: number;
  } | null>(null);
  const [collisionCount, setCollisionCount] = useState(0);

  // Leva controls
  const { particleCount, particleSize, collisionIntensity, enableCollisions } =
    useControls(
      'Energy and Motion',
      {
        particleCount: {
          value: 1000,
          min: 50,
          max: 2000,
          step: 50,
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
          max: 5.0,
          step: 0.1,
          label: 'Collision Intensity',
        },
        enableCollisions: {
          value: false,
          label: 'Enable Collisions',
        },
      },
      { store: levaStore }
    );

  // Calculate box size
  const boxSize = useMemo(() => {
    const baseSize = 2;
    const scaleFactor = Math.pow(particleCount / 200, 1 / 3);
    return baseSize * scaleFactor;
  }, [particleCount]);

  // Initialize particles
  useEffect(() => {
    const newParticles: Particle[] = [];
    const halfSize = boxSize * 0.8;

    for (let i = 0; i < particleCount; i++) {
      // Random position inside box
      const position = new THREE.Vector3(
        (Math.random() * 2 - 1) * halfSize,
        (Math.random() * 2 - 1) * halfSize,
        (Math.random() * 2 - 1) * halfSize
      );

      // Random velocity
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5
      );

      // Randomly assign red or green (50/50 split)
      const type: ParticleType = Math.random() < 0.5 ? 1 : 2;

      newParticles.push({
        position,
        velocity,
        type,
        size: particleSize,
        opacity: 1.0,
        bagCount: 1,
        dissolving: false,
        dissolveProgress: 0,
      });
    }

    setParticles(newParticles);
  }, [particleCount, boxSize, particleSize]);

  // Create geometry once
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

  // Create material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
  }, []);

  // Store bag particle positions for rendering
  const bagParticlePositionsRef = useRef<Map<number, THREE.Vector3[]>>(
    new Map()
  );

  // Update particles, detect collisions, and update geometry
  useFrame((state, delta) => {
    if (particles.length === 0 || !pointsRef.current) return;

    const geom = pointsRef.current.geometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
    const typeAttr = geom.getAttribute('particleType') as THREE.BufferAttribute;
    const sizeAttr = geom.getAttribute('particleSize') as THREE.BufferAttribute;
    const opacityAttr = geom.getAttribute(
      'particleOpacity'
    ) as THREE.BufferAttribute;

    setParticles((prevParticles) => {
      const updatedParticles = [...prevParticles];
      const halfSize = boxSize * 0.8;
      const speedMultiplier = enableCollisions ? collisionIntensity : 0.3;

      // Update positions and handle boundaries
      updatedParticles.forEach((particle, idx) => {
        if (particle.dissolving) {
          // Update dissolve animation
          particle.dissolveProgress += delta / DISSOLVE_DURATION;
          particle.opacity = Math.max(0, 1 - particle.dissolveProgress);
          particle.size *= 0.95; // Shrink while dissolving

          // Remove particle if fully dissolved
          if (particle.dissolveProgress >= 1) {
            particle.opacity = 0;
          }
        } else {
          // Update position
          particle.position.add(
            particle.velocity.clone().multiplyScalar(delta * speedMultiplier)
          );

          // Bounce off walls
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
        }

        // Update geometry attributes
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

        // Update bag particle positions
        if (particle.type === 3 && particle.opacity > 0) {
          const bagPositions: THREE.Vector3[] = [];
          for (let i = 0; i < particle.bagCount; i++) {
            const angle = (i / particle.bagCount) * Math.PI * 2;
            const radius = particle.size * 0.3;
            const offset = new THREE.Vector3(
              Math.cos(angle) * radius,
              Math.sin(angle) * radius,
              Math.sin(angle * 2) * radius * 0.3
            );
            bagPositions.push(particle.position.clone().add(offset));
          }
          bagParticlePositionsRef.current.set(idx, bagPositions);
        } else {
          bagParticlePositionsRef.current.delete(idx);
        }
      });

      // Detect collisions between red and green particles
      if (enableCollisions) {
        for (let i = 0; i < updatedParticles.length; i++) {
          const particle1 = updatedParticles[i];
          if (particle1.dissolving || particle1.opacity === 0) continue;

          for (let j = i + 1; j < updatedParticles.length; j++) {
            const particle2 = updatedParticles[j];
            if (particle2.dissolving || particle2.opacity === 0) continue;

            // Check if one is red (seller) and one is green (buyer or bag)
            const isRedGreenCollision =
              (particle1.type === 1 &&
                (particle2.type === 2 || particle2.type === 3)) ||
              ((particle1.type === 2 || particle1.type === 3) &&
                particle2.type === 1);

            if (isRedGreenCollision) {
              const distance = particle1.position.distanceTo(
                particle2.position
              );

              if (distance < COLLISION_DISTANCE) {
                // Determine which is red and which is green
                const redParticle =
                  particle1.type === 1 ? particle1 : particle2;
                const greenParticle =
                  particle1.type === 1 ? particle2 : particle1;

                // Only process if red particle is not already dissolving
                if (!redParticle.dissolving) {
                  // Increment collision count
                  setCollisionCount((prev) => prev + 1);

                  // Start dissolving red particle
                  redParticle.dissolving = true;
                  redParticle.dissolveProgress = 0;

                  // Convert green particle to bag (or increase bag count)
                  if (greenParticle.type === 2) {
                    greenParticle.type = 3; // Convert to bag
                    greenParticle.bagCount = 2;
                  } else if (greenParticle.type === 3) {
                    greenParticle.bagCount += 1;
                  }

                  // Flash effect at collision point
                  const collisionPoint = redParticle.position
                    .clone()
                    .add(greenParticle.position)
                    .multiplyScalar(0.5);
                  setCollisionFlash({
                    position: collisionPoint,
                    intensity: 1.0,
                  });

                  // Add some velocity change to green particle (recoil)
                  const direction = greenParticle.position
                    .clone()
                    .sub(redParticle.position)
                    .normalize();
                  greenParticle.velocity.add(direction.multiplyScalar(0.3));

                  // Break after processing this collision
                  break;
                }
              }
            }
          }
        }
      }

      // Update geometry attributes
      posAttr.needsUpdate = true;
      typeAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
      opacityAttr.needsUpdate = true;

      return updatedParticles;
    });
  });

  // Update collision flash animation and volume bar
  useFrame((state, delta) => {
    if (collisionFlash) {
      setCollisionFlash((prev) => {
        if (!prev) return null;
        const newIntensity = Math.max(0, prev.intensity - delta * 3);
        return newIntensity > 0 ? { ...prev, intensity: newIntensity } : null;
      });
    }

    // Update volume bar height based on collision count (sublinear growth)
    if (volumeBarRef.current) {
      const groundY = -boxSize * 1.5;
      const target = Math.max(VOLUME_BAR_TARGET_COLLISIONS, 1);
      const normalized = Math.sqrt(collisionCount / target);
      const eased = 1 - Math.pow(1 - Math.min(normalized, 1), 2); // ease-out
      const barHeight = Math.max(0.2, eased * (boxSize * 1.5));

      volumeBarRef.current.scale.y = barHeight;
      volumeBarRef.current.position.y = groundY + barHeight / 2;
    }
  });

  // Get bag particles for rendering
  const bagParticles = useMemo(() => {
    const bags: Array<{
      particleIdx: number;
      positions: THREE.Vector3[];
      opacity: number;
    }> = [];
    bagParticlePositionsRef.current.forEach((positions, particleIdx) => {
      const particle = particles[particleIdx];
      if (particle && particle.type === 3 && particle.opacity > 0) {
        bags.push({
          particleIdx,
          positions,
          opacity: particle.opacity,
        });
      }
    });
    return bags;
  }, [particles]);

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
            titleBar={{ title: 'Energy and Motion' }}
            collapsed={false}
          />
        </div>
      </Html>

      {/* Main particles */}
      <points ref={pointsRef}>
        <primitive object={geometry} attach="geometry" />
        <primitive object={material} attach="material" />
      </points>

      {/* Bag particles - smaller particles inside green bags */}
      {bagParticles.map((bagData) =>
        bagData.positions.map((pos, particleIdx) => (
          <mesh
            key={`bag-${bagData.particleIdx}-particle-${particleIdx}`}
            position={pos}
            scale={particleSize * 0.4}
          >
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial
              color="#2a9d8f"
              transparent
              opacity={bagData.opacity}
            />
          </mesh>
        ))
      )}

      {/* Collision flash effect */}
      {collisionFlash && (
        <mesh ref={collisionFlashRef} position={collisionFlash.position}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={collisionFlash.intensity * 0.8}
          />
        </mesh>
      )}

      {/* Volume Bar */}
      <group position={[boxSize * 0.8, 0, -boxSize * 0.8]}>
        <mesh ref={volumeBarRef} position={[0, -boxSize * 1.5, 0]}>
          <boxGeometry args={[0.3, 1, 0.3]} />
          <meshStandardMaterial
            color="#4a9eff"
            emissive="#2a7fff"
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* Volume Bar Label */}
        <Html
          position={[0, -boxSize * 1.5, 0]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              color: 'white',
              background: 'rgba(0, 0, 0, 0.7)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              marginTop: '-30px',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
              Volume Bar
            </div>
            <div
              style={{ fontSize: '14px', fontWeight: 'bold', color: '#4a9eff' }}
            >
              {collisionCount} collisions
            </div>
          </div>
        </Html>
      </group>

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

export default EnergyAndMotion3D;
