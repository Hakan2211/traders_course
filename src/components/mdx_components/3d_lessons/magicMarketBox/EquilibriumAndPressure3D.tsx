
import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
import { useControls, LevaPanel, useCreateStore } from 'leva';
import * as THREE from 'three';

interface EquilibriumAndPressure3DProps {
  levaStore: ReturnType<typeof useCreateStore>;
}

// Particle types: 0 = neutral/gray (sideline), 1 = red (seller), 2 = green (buyer), 3 = green bag (has 2+ particles)
type ParticleType = 0 | 1 | 2 | 3;

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  targetPosition: THREE.Vector3; // Target position for step-based movement
  type: ParticleType;
  size: number;
  opacity: number;
  bagCount: number;
  dissolving: boolean;
  dissolveProgress: number;
  isSideline: boolean; // Whether particle is outside the box
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
    
    gl_PointSize = particleSize;
    
    // Color based on particleType
    if (particleType < 0.5) {
      vColor = vec3(0.6, 0.6, 0.6); // Gray (sideline)
    } else if (particleType < 1.5) {
      vColor = vec3(0.9, 0.2, 0.2); // Red (seller)
    } else if (particleType < 2.5) {
      vColor = vec3(0.2, 0.9, 0.2); // Green (buyer)
    } else {
      vColor = vec3(0.1, 0.8, 0.1); // Darker green (bag)
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

const COLLISION_DISTANCE = 0.25; // Increased collision distance for better detection
const DISSOLVE_DURATION = 0.5;
const BAG_SCALE = 1.8;
const SIDELINE_DISTANCE = 1.5; // Distance outside box for sideline particles

// Helper function to calculate target position based on step and particle type
function calculateTargetPosition(
  particle: Particle,
  step: number,
  boxSize: number,
  particleIndex: number,
  totalParticles: number
): THREE.Vector3 {
  const halfSize = boxSize * 0.8;

  if (step === 0) {
    // Step 0: Random positions
    return new THREE.Vector3(
      (Math.random() * 2 - 1) * halfSize,
      (Math.random() * 2 - 1) * halfSize,
      (Math.random() * 2 - 1) * halfSize
    );
  }

  if (particle.isSideline) {
    // Sideline particles stay outside the box in cube formation to the left (negative x-axis) and offset on z-axis
    const redGreenCount = Math.floor(totalParticles * 0.8);
    const sidelineCount = totalParticles - redGreenCount;
    const sidelineIndex = particleIndex - redGreenCount;
    const cubeSize = Math.ceil(Math.cbrt(sidelineCount));
    const x = (sidelineIndex % cubeSize) - cubeSize / 2;
    const y = Math.floor((sidelineIndex / cubeSize) % cubeSize) - cubeSize / 2;
    const z = Math.floor(sidelineIndex / (cubeSize * cubeSize)) - cubeSize / 2;
    const spacing = boxSize * 0.3;
    const xOffset = -boxSize * SIDELINE_DISTANCE * 1.5; // Position further to the left (negative x-axis)
    const zOffset = boxSize * SIDELINE_DISTANCE * 0.3; // Smaller offset on z-axis

    return new THREE.Vector3(
      xOffset + x * spacing, // Positioned further to the left (negative x)
      y * spacing, // Centered on y-axis
      zOffset + z * spacing // Small offset on z-axis
    );
  }

  if (particle.type === 1) {
    // Red particles (sellers) - 5% in middle, rest at top
    // Use a deterministic approach based on particleIndex to ensure 5% distribution
    const middleZoneThreshold = 0.05; // 5% go to middle
    // Create a pseudo-random but deterministic value from particleIndex
    const seed = (particleIndex * 7919 + 1013) % 10000; // Prime numbers for better distribution
    const isInMiddle = seed / 10000 < middleZoneThreshold;

    let y: number;
    if (isInMiddle) {
      // Place in middle area (spread zone) - middle 20% of box height
      y = (Math.random() * 2 - 1) * halfSize * 0.2;
    } else {
      // Place in top area - more at top, less toward middle
      y = halfSize * (0.3 + Math.random() * 0.7); // Top 70% of box, weighted toward top
      const density = (y - halfSize * 0.3) / (halfSize * 0.7); // Higher density at top
      const yVariation = (1 - density) * halfSize * 0.3; // Less variation at top
      y += (Math.random() - 0.5) * yVariation;
    }

    return new THREE.Vector3(
      (Math.random() * 2 - 1) * halfSize * 0.8,
      y,
      (Math.random() * 2 - 1) * halfSize * 0.8
    );
  } else if (particle.type === 2 || particle.type === 3) {
    // Green particles (buyers) - 5% in middle, rest at bottom
    // Use a deterministic approach based on particleIndex to ensure 5% distribution
    const middleZoneThreshold = 0.05; // 5% go to middle
    // Create a pseudo-random but deterministic value from particleIndex
    const seed = (particleIndex * 7919 + 1013) % 10000; // Prime numbers for better distribution
    const isInMiddle = seed / 10000 < middleZoneThreshold;

    let y: number;
    if (isInMiddle) {
      // Place in middle area (spread zone) - middle 20% of box height
      y = (Math.random() * 2 - 1) * halfSize * 0.2;
    } else {
      // Place in bottom area - more at bottom, less toward middle
      y = -halfSize * (0.3 + Math.random() * 0.7); // Bottom 70% of box, weighted toward bottom
      const density = Math.abs((y + halfSize * 0.3) / (halfSize * 0.7)); // Higher density at bottom
      const yVariation = (1 - density) * halfSize * 0.3; // Less variation at bottom
      y -= (Math.random() - 0.5) * yVariation;
    }

    return new THREE.Vector3(
      (Math.random() * 2 - 1) * halfSize * 0.8,
      y,
      (Math.random() * 2 - 1) * halfSize * 0.8
    );
  }

  // Default: random position
  return new THREE.Vector3(
    (Math.random() * 2 - 1) * halfSize,
    (Math.random() * 2 - 1) * halfSize,
    (Math.random() * 2 - 1) * halfSize
  );
}

export function EquilibriumAndPressure3D({
  levaStore,
}: EquilibriumAndPressure3DProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [collisionFlash, setCollisionFlash] = useState<{
    position: THREE.Vector3;
    intensity: number;
  } | null>(null);
  const [collisionCount, setCollisionCount] = useState(0);
  const [priceLevel, setPriceLevel] = useState(0); // Price level (0 = middle)
  const [spreadZoneOffset, setSpreadZoneOffset] = useState(0); // How much the spread zone has moved up
  const spreadZoneOffsetRef = useRef(0); // Ref for synchronous access
  const [priceBarY, setPriceBarY] = useState(0); // Current Y position of price bar for smooth movement

  // Leva controls
  const {
    particleCount,
    particleSize,
    step,
    showSidelineParticles,
    enableSidelineEntry,
    collisionIntensity,
  } = useControls(
    'Equilibrium and Pressure',
    {
      step: {
        value: 0,
        min: 0,
        max: 3,
        step: 1,
        label: 'Step',
      },
      particleCount: {
        value: 5000,
        min: 100,
        max: 10000,
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
      showSidelineParticles: {
        value: false,
        label: 'Show Sideline Particles',
      },
      enableSidelineEntry: {
        value: false,
        label: 'Sideline Enters as Buyers',
      },
      collisionIntensity: {
        value: 0.3,
        min: 0.1,
        max: 2.0,
        step: 0.1,
        label: 'Collision Intensity',
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
    const redGreenCount = Math.floor(particleCount * 0.8); // 80% red/green
    const sidelineCount = particleCount - redGreenCount; // 20% sideline

    for (let i = 0; i < particleCount; i++) {
      const isSideline = i >= redGreenCount;

      let position: THREE.Vector3;
      let type: ParticleType;

      if (isSideline) {
        // Sideline particles arranged in a cube formation to the left (negative x-axis) and offset on z-axis
        const sidelineIndex = i - redGreenCount;
        const cubeSize = Math.ceil(Math.cbrt(sidelineCount)); // Cube root to get dimensions
        const x = (sidelineIndex % cubeSize) - cubeSize / 2;
        const y =
          Math.floor((sidelineIndex / cubeSize) % cubeSize) - cubeSize / 2;
        const z =
          Math.floor(sidelineIndex / (cubeSize * cubeSize)) - cubeSize / 2;
        const spacing = boxSize * 0.3; // Spacing between particles
        const xOffset = -boxSize * SIDELINE_DISTANCE * 1.5; // Position further to the left (negative x-axis)
        const zOffset = boxSize * SIDELINE_DISTANCE * 0.3; // Smaller offset on z-axis

        position = new THREE.Vector3(
          xOffset + x * spacing, // Positioned further to the left (negative x)
          y * spacing, // Centered on y-axis
          zOffset + z * spacing // Small offset on z-axis
        );
        type = 0; // Gray
      } else {
        // Random position inside box
        position = new THREE.Vector3(
          (Math.random() * 2 - 1) * halfSize,
          (Math.random() * 2 - 1) * halfSize,
          (Math.random() * 2 - 1) * halfSize
        );
        // Randomly assign red or green (50/50 split)
        type = Math.random() < 0.5 ? 1 : 2;
      }

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
        isSideline,
      });
    }

    setParticles(newParticles);
  }, [particleCount, boxSize, particleSize]);

  // Update target positions when step changes
  useEffect(() => {
    // Reset spread zone offset when step changes
    if (step < 2) {
      setSpreadZoneOffset(0);
      spreadZoneOffsetRef.current = 0;
      setPriceBarY(0); // Reset price bar position
    }

    // Reset collision count when step changes
    if (step !== 3) {
      setCollisionCount(0);
    }

    // Initialize price bar position when step 2 is reached
    if (step >= 2) {
      setPriceBarY(spreadZoneOffsetRef.current);
    }

    if (step >= 1) {
      setParticles((prevParticles) => {
        const redGreenCount = Math.floor(prevParticles.length * 0.8);

        return prevParticles.map((particle, idx) => {
          const shouldBeSideline = idx >= redGreenCount;

          // Reset sideline particles if step goes back
          if (shouldBeSideline && !particle.isSideline && step < 2) {
            const sidelineCount = prevParticles.length - redGreenCount;
            const sidelineIndex = idx - redGreenCount;
            const cubeSize = Math.ceil(Math.cbrt(sidelineCount));
            const x = (sidelineIndex % cubeSize) - cubeSize / 2;
            const y =
              Math.floor((sidelineIndex / cubeSize) % cubeSize) - cubeSize / 2;
            const z =
              Math.floor(sidelineIndex / (cubeSize * cubeSize)) - cubeSize / 2;
            const spacing = boxSize * 0.3;
            const xOffset = -boxSize * SIDELINE_DISTANCE * 1.5; // Position further to the left (negative x-axis)
            const zOffset = boxSize * SIDELINE_DISTANCE * 0.3; // Smaller offset on z-axis
            const sidelinePosition = new THREE.Vector3(
              xOffset + x * spacing, // Positioned further to the left (negative x)
              y * spacing, // Centered on y-axis
              zOffset + z * spacing // Small offset on z-axis
            );
            return {
              ...particle,
              type: 0,
              isSideline: true,
              position: sidelinePosition.clone(),
              targetPosition: sidelinePosition,
              bagCount: 1,
              dissolving: false,
              dissolveProgress: 0,
              opacity: 1.0,
            };
          }

          if (particle.isSideline) {
            return particle; // Sideline particles don't move in step 1-3
          }

          const newTarget = calculateTargetPosition(
            particle,
            step,
            boxSize,
            idx,
            prevParticles.length
          );

          // Reset bag particles when step changes
          const resetType: ParticleType =
            particle.type === 3 ? 2 : particle.type;

          return {
            ...particle,
            type: resetType,
            position: newTarget.clone(), // Immediately reset position when step changes
            targetPosition: newTarget,
            bagCount: particle.type === 3 ? particle.bagCount : 1,
            dissolving: false,
            dissolveProgress: 0,
            opacity: 1.0,
            // Reset velocity for fresh movement in step 3
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 0.5,
              (Math.random() - 0.5) * 0.5,
              (Math.random() - 0.5) * 0.5
            ),
          };
        });
      });
    } else {
      // Step 0: Reset to random positions
      setParticles((prevParticles) => {
        const redGreenCount = Math.floor(prevParticles.length * 0.8);
        const sidelineCount = prevParticles.length - redGreenCount;
        const halfSize = boxSize * 0.8;

        return prevParticles.map((particle, idx) => {
          const shouldBeSideline = idx >= redGreenCount;

          if (shouldBeSideline) {
            const sidelineIndex = idx - redGreenCount;
            const cubeSize = Math.ceil(Math.cbrt(sidelineCount));
            const x = (sidelineIndex % cubeSize) - cubeSize / 2;
            const y =
              Math.floor((sidelineIndex / cubeSize) % cubeSize) - cubeSize / 2;
            const z =
              Math.floor(sidelineIndex / (cubeSize * cubeSize)) - cubeSize / 2;
            const spacing = boxSize * 0.3;
            const xOffset = -boxSize * SIDELINE_DISTANCE * 1.5; // Position further to the left (negative x-axis)
            const zOffset = boxSize * SIDELINE_DISTANCE * 0.3; // Smaller offset on z-axis
            const sidelinePosition = new THREE.Vector3(
              xOffset + x * spacing, // Positioned further to the left (negative x)
              y * spacing, // Centered on y-axis
              zOffset + z * spacing // Small offset on z-axis
            );
            return {
              ...particle,
              type: 0,
              isSideline: true,
              position: sidelinePosition.clone(),
              targetPosition: sidelinePosition,
              bagCount: 1,
              dissolving: false,
              dissolveProgress: 0,
              opacity: 1.0,
            };
          } else {
            const randomPosition = new THREE.Vector3(
              (Math.random() * 2 - 1) * halfSize,
              (Math.random() * 2 - 1) * halfSize,
              (Math.random() * 2 - 1) * halfSize
            );
            const resetType: ParticleType =
              particle.type === 3 ? 2 : particle.type;
            return {
              ...particle,
              type: resetType,
              position: randomPosition.clone(),
              targetPosition: randomPosition,
              bagCount: particle.type === 3 ? particle.bagCount : 1,
              dissolving: false,
              dissolveProgress: 0,
              opacity: 1.0,
            };
          }
        });
      });
    }
  }, [step, boxSize]);

  // Sync ref with state
  useEffect(() => {
    spreadZoneOffsetRef.current = spreadZoneOffset;
    // Update price bar position when spread zone moves
    if (step >= 2) {
      setPriceBarY(spreadZoneOffset);
    }
  }, [spreadZoneOffset, step]);

  // Handle sideline entry
  useEffect(() => {
    if (enableSidelineEntry && step >= 2) {
      setParticles((prevParticles) => {
        const updated = [...prevParticles];
        const sidelineParticles = updated
          .map((p, idx) => ({ particle: p, idx }))
          .filter(({ particle }) => particle.isSideline && particle.type === 0);

        // Convert many sideline particles to green buyers (more dramatic effect)
        const entryCount = Math.min(500, sidelineParticles.length); // Convert up to 500
        const halfSize = boxSize * 0.8;
        const currentSpreadCenter = spreadZoneOffsetRef.current; // Use ref for current value

        sidelineParticles
          .slice(0, entryCount)
          .forEach(({ particle, idx }, entryIdx) => {
            // Calculate entry position in spread zone with staggered timing
            const entryProgress = entryIdx / entryCount; // 0 to 1
            const spreadZoneHeight = halfSize * 0.2;

            // Create a smooth flow path: start from sideline position, flow into spread zone
            // Use entryProgress to stagger the entry for visual flow effect
            const targetX = (Math.random() * 2 - 1) * halfSize * 0.8;
            const targetY =
              currentSpreadCenter +
              (Math.random() * 2 - 1) * spreadZoneHeight * 0.4;
            const targetZ = (Math.random() * 2 - 1) * halfSize * 0.8;

            updated[idx] = {
              ...particle,
              type: 2, // Green buyer
              isSideline: false,
              // Keep current position initially, will lerp to target smoothly
              targetPosition: new THREE.Vector3(targetX, targetY, targetZ),
              // Add entry delay based on position for flow effect
              velocity: new THREE.Vector3(
                (targetX - particle.position.x) * 0.5,
                (targetY - particle.position.y) * 0.5,
                (targetZ - particle.position.z) * 0.5
              )
                .normalize()
                .multiplyScalar(2), // Direction toward target
            };
          });

        // Calculate new spread zone offset (push it much higher - more dramatic)
        const newSpreadOffset = currentSpreadCenter + halfSize * 0.6; // Move spread zone up significantly
        setSpreadZoneOffset(newSpreadOffset);

        // Shift ALL particles upward, but green more than red (more dramatic shift)
        updated.forEach((particle, idx) => {
          if (!particle.isSideline) {
            let newY = particle.targetPosition.y;

            if (particle.type === 1) {
              // Red particles: shift up moderately
              newY += halfSize * 0.3;
            } else if (particle.type === 2 || particle.type === 3) {
              // Green particles: shift up much more (push demand zone higher)
              newY += halfSize * 0.5;
            }

            // Keep particles within bounds
            newY = Math.max(-halfSize, Math.min(halfSize, newY));

            particle.targetPosition = new THREE.Vector3(
              particle.targetPosition.x,
              newY,
              particle.targetPosition.z
            );
          }
        });

        return updated;
      });
    } else if (!enableSidelineEntry && step >= 2) {
      // Reset when toggle is turned off
      setSpreadZoneOffset(0);
      spreadZoneOffsetRef.current = 0;
      setParticles((prevParticles) => {
        const redGreenCount = Math.floor(prevParticles.length * 0.8);
        const sidelineCount = prevParticles.length - redGreenCount;
        const halfSize = boxSize * 0.8;

        return prevParticles.map((particle, idx) => {
          const shouldBeSideline = idx >= redGreenCount;

          // If this particle should be sideline, restore it to sideline state
          if (shouldBeSideline) {
            const sidelineIndex = idx - redGreenCount;
            const cubeSize = Math.ceil(Math.cbrt(sidelineCount));
            const x = (sidelineIndex % cubeSize) - cubeSize / 2;
            const y =
              Math.floor((sidelineIndex / cubeSize) % cubeSize) - cubeSize / 2;
            const z =
              Math.floor(sidelineIndex / (cubeSize * cubeSize)) - cubeSize / 2;
            const spacing = boxSize * 0.3;
            const xOffset = -boxSize * SIDELINE_DISTANCE * 1.5; // Position further to the left (negative x-axis)
            const zOffset = boxSize * SIDELINE_DISTANCE * 0.3; // Smaller offset on z-axis
            const sidelinePosition = new THREE.Vector3(
              xOffset + x * spacing, // Positioned further to the left (negative x)
              y * spacing, // Centered on y-axis
              zOffset + z * spacing // Small offset on z-axis
            );
            return {
              ...particle,
              type: 0, // Gray
              isSideline: true,
              position: sidelinePosition.clone(), // Immediately reset position
              targetPosition: sidelinePosition,
              bagCount: 1, // Reset bag count
              dissolving: false, // Reset dissolving state
              dissolveProgress: 0,
              opacity: 1.0, // Reset opacity
            };
          } else {
            // Reset non-sideline particles to their step-based positions
            const newTarget = calculateTargetPosition(
              particle,
              step,
              boxSize,
              idx,
              prevParticles.length
            );
            // Reset bag particles (type 3) back to green (type 2)
            const resetType: ParticleType =
              particle.type === 3 ? 2 : particle.type;
            return {
              ...particle,
              type: resetType,
              position: newTarget.clone(), // Immediately reset position
              targetPosition: newTarget,
              bagCount: particle.type === 3 ? particle.bagCount : 1, // Reset bag count if not a bag
              dissolving: false, // Reset dissolving state
              dissolveProgress: 0,
              opacity: 1.0, // Reset opacity
            };
          }
        });
      });
    }
  }, [enableSidelineEntry, step, boxSize]);

  // Create geometry
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

  // Store bag particle positions
  const bagParticlePositionsRef = useRef<Map<number, THREE.Vector3[]>>(
    new Map()
  );

  // Update particles
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
      let greenYSum = 0;
      let greenCount = 0;

      updatedParticles.forEach((particle, idx) => {
        if (particle.dissolving) {
          particle.dissolveProgress += delta / DISSOLVE_DURATION;
          particle.opacity = Math.max(0, 1 - particle.dissolveProgress);
          particle.size *= 0.95;
          if (particle.dissolveProgress >= 1) {
            particle.opacity = 0;
          }
        } else {
          // Move toward target position (smooth interpolation)
          if (step >= 1 && step < 3 && !particle.isSideline) {
            const lerpFactor = 0.05; // Smooth movement speed
            particle.position.lerp(particle.targetPosition, lerpFactor);
          } else if (step === 0) {
            // Random motion in step 0
            particle.position.add(
              particle.velocity.clone().multiplyScalar(delta * 0.3)
            );
          }

          // Handle sideline particles entering the box (when converted) - smooth flow animation
          if (!particle.isSideline && step >= 2 && enableSidelineEntry) {
            // Check if particle is far from box (was sideline, now entering)
            const distanceFromTarget = particle.position.distanceTo(
              particle.targetPosition
            );
            const distanceFromBox = Math.sqrt(
              Math.abs(particle.position.x) ** 2 +
                Math.abs(particle.position.z) ** 2
            ); // Distance from box center on x and z axes

            if (distanceFromBox > boxSize * 0.6) {
              // Still far from box - use velocity-based movement for visible flow
              // Smooth easing: faster at start, slower as it approaches
              const speedMultiplier =
                Math.min(1, distanceFromBox / (boxSize * 0.8)) * 4;
              particle.position.add(
                particle.velocity
                  .clone()
                  .multiplyScalar(delta * speedMultiplier)
              );

              // Update velocity to point toward target with smooth easing
              const direction = particle.targetPosition
                .clone()
                .sub(particle.position)
                .normalize();
              const targetSpeed = Math.min(3, distanceFromTarget * 0.5); // Speed based on distance
              particle.velocity.lerp(
                direction.multiplyScalar(targetSpeed),
                delta * 3
              );
            } else if (distanceFromBox > boxSize * 0.3) {
              // Approaching box - smooth transition
              const lerpFactor = 0.12;
              particle.position.lerp(particle.targetPosition, lerpFactor);
              // Update velocity for smooth deceleration
              const direction = particle.targetPosition
                .clone()
                .sub(particle.position)
                .normalize();
              particle.velocity.lerp(direction.multiplyScalar(1), delta * 4);
            } else {
              // Close to box - smooth lerp to target
              const lerpFactor = 0.1;
              particle.position.lerp(particle.targetPosition, lerpFactor);
            }
          }

          // In step 3, add active movement for collisions
          if (step === 3 && !particle.isSideline) {
            const spreadZoneCenter = spreadZoneOffsetRef.current;
            const spreadZoneHeight = halfSize * 0.2;

            // If particle is in spread zone, add active movement
            if (
              Math.abs(particle.position.y - spreadZoneCenter) <=
              spreadZoneHeight
            ) {
              // Add velocity-based movement for active collisions
              particle.position.add(
                particle.velocity
                  .clone()
                  .multiplyScalar(delta * collisionIntensity * 2)
              );

              // Add some random movement to increase collision chances
              particle.position.add(
                new THREE.Vector3(
                  (Math.random() - 0.5) * delta * 0.1,
                  (Math.random() - 0.5) * delta * 0.1,
                  (Math.random() - 0.5) * delta * 0.1
                )
              );

              // Keep particles moving around in spread zone
              const distanceFromTarget = particle.position.distanceTo(
                particle.targetPosition
              );
              if (distanceFromTarget < 0.2) {
                // Add slight random velocity change to keep moving
                particle.velocity.add(
                  new THREE.Vector3(
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1
                  )
                );
                // Limit velocity
                particle.velocity.clampLength(0, 2);
              }
            } else {
              // Outside spread zone, move toward target
              const lerpFactor = 0.05;
              particle.position.lerp(particle.targetPosition, lerpFactor);
            }
          }

          // Keep particles within bounds (or outside for sideline)
          if (particle.isSideline) {
            // Sideline particles stay in cube formation - keep them in place
            // They'll move when converted to buyers
          } else {
            // Keep inside box
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

          // Track green particle positions for price calculation
          if (
            (particle.type === 2 || particle.type === 3) &&
            !particle.isSideline
          ) {
            greenYSum += particle.position.y;
            greenCount++;
          }
        }

        // Update geometry attributes
        const visible = !particle.isSideline || showSidelineParticles;
        posAttr.setXYZ(
          idx,
          particle.position.x,
          particle.position.y,
          particle.position.z
        );
        typeAttr.setX(idx, visible ? particle.type : -1); // Hide if not showing sideline
        sizeAttr.setX(
          idx,
          (visible ? particle.size : 0) *
            (particle.type === 3 ? BAG_SCALE : 1.0) *
            10
        );
        opacityAttr.setX(idx, visible ? particle.opacity : 0);

        // Update bag positions
        if (
          particle.type === 3 &&
          particle.opacity > 0 &&
          !particle.isSideline
        ) {
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

      // Calculate average green position (price level)
      if (greenCount > 0) {
        const avgGreenY = greenYSum / greenCount;
        setPriceLevel(avgGreenY / halfSize); // Normalize to -1 to 1
      }

      // Update price bar position to fluctuate within spread zone (only in step 3 when collisions start)
      if (step === 3) {
        const spreadZoneCenter = spreadZoneOffsetRef.current;
        const spreadZoneHeight = halfSize * 0.2; // Middle 20% of box
        const spreadZoneTop = spreadZoneCenter + spreadZoneHeight / 2;
        const spreadZoneBottom = spreadZoneCenter - spreadZoneHeight / 2;

        // Use priceLevel to determine position within spread zone
        // priceLevel ranges from -1 to 1, map it to spread zone bounds
        // Add larger fluctuation for more visible movement
        const fluctuation = Math.sin(state.clock.elapsedTime * 1.5) * 0.8; // Larger sine wave for visible movement
        const targetY =
          spreadZoneCenter +
          priceLevel * spreadZoneHeight * 0.4 +
          fluctuation * spreadZoneHeight * 0.5;

        // Smooth interpolation for price bar movement
        setPriceBarY((currentY) => {
          const newY = currentY + (targetY - currentY) * delta * 3; // Smooth movement
          // Clamp to spread zone bounds
          return Math.max(spreadZoneBottom, Math.min(spreadZoneTop, newY));
        });
      }

      // Detect collisions (only in step 3, and only in middle area)
      if (step === 3) {
        const spreadZoneHeight = halfSize * 0.2; // Middle 20% of box
        const spreadZoneCenter = spreadZoneOffsetRef.current; // Current spread zone center

        for (let i = 0; i < updatedParticles.length; i++) {
          const particle1 = updatedParticles[i];
          if (
            particle1.dissolving ||
            particle1.opacity === 0 ||
            particle1.isSideline ||
            Math.abs(particle1.position.y - spreadZoneCenter) > spreadZoneHeight
          )
            continue;

          for (let j = i + 1; j < updatedParticles.length; j++) {
            const particle2 = updatedParticles[j];
            if (
              particle2.dissolving ||
              particle2.opacity === 0 ||
              particle2.isSideline ||
              Math.abs(particle2.position.y - spreadZoneCenter) >
                spreadZoneHeight
            )
              continue;

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
                const redParticle =
                  particle1.type === 1 ? particle1 : particle2;
                const greenParticle =
                  particle1.type === 1 ? particle2 : particle1;

                if (!redParticle.dissolving) {
                  setCollisionCount((prev) => prev + 1);

                  redParticle.dissolving = true;
                  redParticle.dissolveProgress = 0;

                  if (greenParticle.type === 2) {
                    greenParticle.type = 3;
                    greenParticle.bagCount = 2;
                  } else if (greenParticle.type === 3) {
                    greenParticle.bagCount += 1;
                  }

                  const collisionPoint = redParticle.position
                    .clone()
                    .add(greenParticle.position)
                    .multiplyScalar(0.5);
                  setCollisionFlash({
                    position: collisionPoint,
                    intensity: 1.0,
                  });

                  const direction = greenParticle.position
                    .clone()
                    .sub(redParticle.position)
                    .normalize();
                  greenParticle.velocity.add(direction.multiplyScalar(0.3));

                  break;
                }
              }
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
  });

  // Update collision flash animation
  useFrame((state, delta) => {
    if (collisionFlash) {
      setCollisionFlash((prev) => {
        if (!prev) return null;
        const newIntensity = Math.max(0, prev.intensity - delta * 3);
        return newIntensity > 0 ? { ...prev, intensity: newIntensity } : null;
      });
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
      if (
        particle &&
        particle.type === 3 &&
        particle.opacity > 0 &&
        !particle.isSideline
      ) {
        bags.push({
          particleIdx,
          positions,
          opacity: particle.opacity,
        });
      }
    });
    return bags;
  }, [particles]);

  // Calculate spread zone bounds
  const spreadZoneHeight = boxSize * 0.8 * 0.2; // Middle 20% of box

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
            @keyframes pulse {
              0%, 100% {
                opacity: 1;
                transform: scale(1);
              }
              50% {
                opacity: 0.8;
                transform: scale(1.05);
              }
            }
          `}</style>
          <LevaPanel
            store={levaStore}
            fill={false}
            titleBar={{ title: 'Equilibrium and Pressure' }}
            collapsed={false}
          />
        </div>
      </Html>

      {/* Main particles */}
      <points ref={pointsRef}>
        <primitive object={geometry} attach="geometry" />
        <primitive object={material} attach="material" />
      </points>

      {/* Bag particles */}
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
        <mesh position={collisionFlash.position}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={collisionFlash.intensity * 0.8}
          />
        </mesh>
      )}

      {/* Spread zone visualization (Step 2+) */}
      {step >= 2 && (
        <mesh position={[0, spreadZoneOffset, 0]}>
          <boxGeometry
            args={[boxSize * 1.6, spreadZoneHeight, boxSize * 1.6]}
          />
          <meshStandardMaterial
            color="#ffff00"
            transparent
            opacity={0.15}
            emissive="#ffff00"
            emissiveIntensity={0.2}
          />
        </mesh>
      )}

      {/* Spread zone label (Step 2+) */}
      {step >= 2 && (
        <Html
          position={[boxSize * 0.9, spreadZoneOffset, 0]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              color: 'white',
              background: 'rgba(255, 255, 0, 0.3)',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              border: '2px solid #ffff00',
              whiteSpace: 'nowrap',
            }}
          >
            Spread Area
          </div>
        </Html>
      )}

      {/* Upwards Pressure Arrow and Text (when sideline entry is enabled) */}
      {enableSidelineEntry && step >= 2 && (
        <group position={[0, spreadZoneOffset, boxSize * 0.9]}>
          {/* Arrow pointing up */}
          <mesh position={[0, boxSize * 0.3, 0]} rotation={[0, 0, 0]}>
            <coneGeometry args={[0.3, 0.8, 8]} />
            <meshStandardMaterial
              color="#00ff00"
              emissive="#00ff00"
              emissiveIntensity={0.5}
            />
          </mesh>
          {/* Arrow shaft */}
          <mesh position={[0, boxSize * 0.1, 0]}>
            <cylinderGeometry args={[0.08, 0.08, boxSize * 0.4, 8]} />
            <meshStandardMaterial
              color="#00ff00"
              emissive="#00ff00"
              emissiveIntensity={0.5}
            />
          </mesh>
          {/* Text label */}
          <Html
            position={[0, boxSize * 0.7, 0]}
            center
            style={{ pointerEvents: 'none' }}
          >
            <div
              style={{
                color: '#00ff00',
                background: 'rgba(0, 0, 0, 0.8)',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                border: '3px solid #00ff00',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                boxShadow: '0 0 20px rgba(0, 255, 0, 0.5)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            >
              ⬆️ Upwards Pressure!
            </div>
          </Html>
        </group>
      )}

      {/* Sideline Liquidity Label */}
      {showSidelineParticles && (
        <Html
          position={[
            -boxSize * SIDELINE_DISTANCE * 1.5,
            0,
            boxSize * SIDELINE_DISTANCE * 0.3,
          ]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              color: 'white',
              background: 'rgba(100, 100, 100, 0.8)',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              border: '2px solid #999999',
              whiteSpace: 'nowrap',
            }}
          >
            Sideline Liquidity
          </div>
        </Html>
      )}

      {/* Price bar - positioned at spread zone center, fluctuates within spread zone */}
      {step >= 2 && (
        <group position={[boxSize * 0.45, priceBarY, -boxSize * 0.8]}>
          <mesh>
            <boxGeometry args={[boxSize * 1.2, 0.08, 0.2]} />
            <meshStandardMaterial
              color="#4a9eff"
              emissive="#2a7fff"
              emissiveIntensity={0.8}
              transparent
              opacity={0.95}
            />
          </mesh>
          <mesh>
            <boxGeometry args={[boxSize * 1.35, 0.18, 0.3]} />
            <meshStandardMaterial
              color="#4a9eff"
              transparent
              opacity={0.25}
              emissive="#2a7fff"
              emissiveIntensity={0.35}
            />
          </mesh>
          {/* Price label */}
          <Html
            position={[boxSize * 0.65, 0, 0]}
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
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                textAlign: 'center',
              }}
            >
              Price
            </div>
          </Html>
        </group>
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

export default EquilibriumAndPressure3D;
