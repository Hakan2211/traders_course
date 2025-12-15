
import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useControls, LevaPanel, button, useCreateStore } from 'leva';
import * as THREE from 'three';

interface OfferingMechanics3DProps {
  levaStore: ReturnType<typeof useCreateStore>;
}

type PoolType = 'float' | 'secondary' | 'atm' | 'warrants';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  targetPosition: THREE.Vector3;
  pool: PoolType;
  size: number;
  flowing: boolean;
}

const FLOAT_BASE_SIZE = 2.4;
const SIDE_BOX_SIZE = 2;
const BOX_SPACING = 5.2;
const BRIDGE_MARGIN = 0.15;

const FLOAT_CENTER = new THREE.Vector3(0, 0, 0);
const SECONDARY_CENTER = new THREE.Vector3(BOX_SPACING, 0, 0);
const ATM_CENTER = new THREE.Vector3(-BOX_SPACING, 0, 0);
const WARRANT_CENTER = new THREE.Vector3(0, 0, BOX_SPACING);

const FLOW_HIGHLIGHTS = {
  secondary: {
    position: new THREE.Vector3(BOX_SPACING * 0.5, 0, 0),
    scale: [BOX_SPACING, SIDE_BOX_SIZE * 0.6, SIDE_BOX_SIZE * 0.6] as [
      number,
      number,
      number
    ],
    color: '#ff6b6b',
  },
  atm: {
    position: new THREE.Vector3(-BOX_SPACING * 0.5, 0, 0),
    scale: [BOX_SPACING, SIDE_BOX_SIZE * 0.6, SIDE_BOX_SIZE * 0.6] as [
      number,
      number,
      number
    ],
    color: '#32d296',
  },
  warrants: {
    position: new THREE.Vector3(0, 0, BOX_SPACING * 0.5),
    scale: [SIDE_BOX_SIZE * 0.6, SIDE_BOX_SIZE * 0.6, BOX_SPACING] as [
      number,
      number,
      number
    ],
    color: '#b18aff',
  },
};

const poolToCode = (pool: PoolType) => {
  switch (pool) {
    case 'float':
      return 0;
    case 'secondary':
      return 1;
    case 'atm':
      return 2;
    default:
      return 3;
  }
};

const getPoolCenter = (pool: PoolType) => {
  switch (pool) {
    case 'float':
      return FLOAT_CENTER;
    case 'secondary':
      return SECONDARY_CENTER;
    case 'atm':
      return ATM_CENTER;
    default:
      return WARRANT_CENTER;
  }
};

const particleVertexShader = `
  attribute float poolType;
  attribute float particleSize;
  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    vec3 pos = position;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = particleSize;

    if (poolType < 0.5) {
      vColor = vec3(0.23, 0.65, 1.0);
    } else if (poolType < 1.5) {
      vColor = vec3(1.0, 0.42, 0.35);
    } else if (poolType < 2.5) {
      vColor = vec3(0.32, 0.82, 0.58);
    } else {
      vColor = vec3(0.74, 0.64, 0.97);
    }
    vOpacity = 1.0;
  }
`;

const particleFragmentShader = `
  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = (1.0 - smoothstep(0.25, 0.5, dist)) * vOpacity;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

const randomPointInBox = (center: THREE.Vector3, size: number) => {
  const half = size * 0.5;
  return new THREE.Vector3(
    center.x + (Math.random() * 2 - 1) * half,
    center.y + (Math.random() * 2 - 1) * half,
    center.z + (Math.random() * 2 - 1) * half
  );
};

export function OfferingMechanics3D({ levaStore }: OfferingMechanics3DProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const floatBoxRef = useRef<THREE.Mesh>(null);
  const flowHighlightRef = useRef<THREE.Mesh>(null);

  const [particles, setParticles] = useState<Particle[]>([]);
  const [displayCounts, setDisplayCounts] = useState({
    float: 0,
    secondary: 0,
    atm: 0,
    warrants: 0,
  });
  const countsRef = useRef(displayCounts);

  const floatTargetSizeRef = useRef(FLOAT_BASE_SIZE);
  const floatVisualSizeRef = useRef(FLOAT_BASE_SIZE);

  const floatCountRef = useRef(0);
  const secondaryCountRef = useRef(0);
  const atmCountRef = useRef(0);
  const warrantCountRef = useRef(0);

  const [lastAction, setLastAction] = useState<
    'secondary' | 'atm' | 'warrants' | null
  >(null);

  const atmDripTimerRef = useRef(0);
  const atmDripActiveRef = useRef(false);
  const [atmDripActive, setAtmDripActive] = useState(false);

  const [warrantPulseMessage, setWarrantPulseMessage] = useState<string | null>(
    null
  );
  const warrantPulseTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const {
    particleCount,
    particleSize,
    flowSpeed,
    secondaryAcceleration,
    atmDripSize,
    atmDripInterval,
    warrantBatch,
    warrantStrike,
    marketPrice,
  } = useControls(
    'Offering Mechanics',
    {
      particleCount: {
        value: 2600,
        min: 800,
        max: 6000,
        step: 200,
        label: 'Particle Count',
      },
      particleSize: {
        value: 0.16,
        min: 0.08,
        max: 0.35,
        step: 0.01,
        label: 'Particle Size',
      },
      flowSpeed: {
        value: 1.2,
        min: 0.4,
        max: 2.5,
        step: 0.1,
        label: 'Float Orbit Speed',
      },
      secondaryAcceleration: {
        value: 2.2,
        min: 1.2,
        max: 3.5,
        step: 0.1,
        label: 'Secondary Burst Speed',
      },
      atmDripSize: {
        value: 60,
        min: 20,
        max: 200,
        step: 10,
        label: 'ATM Shares per Drip',
      },
      atmDripInterval: {
        value: 1.1,
        min: 0.4,
        max: 2.5,
        step: 0.1,
        label: 'ATM Drip Interval (s)',
      },
      warrantBatch: {
        value: 140,
        min: 40,
        max: 400,
        step: 20,
        label: 'Warrants per Exercise',
      },
      warrantStrike: {
        value: 12,
        min: 4,
        max: 25,
        step: 0.5,
        label: 'Warrant Strike ($)',
      },
      marketPrice: {
        value: 10,
        min: 2,
        max: 30,
        step: 0.25,
        label: 'Stock Price ($)',
      },
      LaunchSecondaryOffering: button(() => handleSecondaryBurst()),
      ToggleATMDrip: button(() => handleToggleAtmDrip()),
      ExerciseWarrants: button(() => handleExerciseWarrants()),
      Reset: button(() => regenerateParticles()),
    },
    { store: levaStore }
  );

  const canExercise = useMemo(
    () => marketPrice >= warrantStrike,
    [marketPrice, warrantStrike]
  );

  // Refs for latest control values to avoid stale closures in button callbacks
  const marketPriceRef = useRef(marketPrice);
  const warrantStrikeRef = useRef(warrantStrike);
  const warrantBatchRef = useRef(warrantBatch);
  useEffect(() => {
    marketPriceRef.current = marketPrice;
  }, [marketPrice]);
  useEffect(() => {
    warrantStrikeRef.current = warrantStrike;
  }, [warrantStrike]);
  useEffect(() => {
    warrantBatchRef.current = warrantBatch;
  }, [warrantBatch]);

  const baseWarrantMessage = canExercise
    ? `Strike cleared: $${marketPrice.toFixed(2)} ≥ $${warrantStrike.toFixed(
        2
      )}`
    : `Locked: need $${warrantStrike.toFixed(
        2
      )}, current $${marketPrice.toFixed(2)}`;

  const triggerWarrantPulse = useCallback(
    (message: string, duration = 1600) => {
      if (warrantPulseTimeout.current) {
        clearTimeout(warrantPulseTimeout.current);
      }
      setWarrantPulseMessage(message);
      if (duration > 0) {
        warrantPulseTimeout.current = setTimeout(() => {
          setWarrantPulseMessage(null);
        }, duration);
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      if (warrantPulseTimeout.current) {
        clearTimeout(warrantPulseTimeout.current);
      }
    };
  }, []);

  // Ensure label updates immediately when price moves above strike,
  // clearing any stale negative pulse message.
  useEffect(() => {
    if (canExercise && warrantPulseMessage) {
      setWarrantPulseMessage(null);
    }
  }, [canExercise, warrantPulseMessage]);

  const updateFloatTarget = useCallback((floatCount: number, total: number) => {
    const ratio = total > 0 ? floatCount / total : 0;
    const nextSize = FLOAT_BASE_SIZE + ratio * 2.2;
    floatTargetSizeRef.current = nextSize;
  }, []);

  const regenerateParticles = useCallback(() => {
    const floatCount = Math.floor(particleCount * 0.4);
    const secondaryCount = Math.floor(particleCount * 0.25);
    const atmCount = Math.floor(particleCount * 0.2);
    const warrantsCount = Math.max(
      0,
      particleCount - floatCount - secondaryCount - atmCount
    );

    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      let pool: PoolType = 'float';
      if (i < floatCount) pool = 'float';
      else if (i < floatCount + secondaryCount) pool = 'secondary';
      else if (i < floatCount + secondaryCount + atmCount) pool = 'atm';
      else pool = 'warrants';

      const center = getPoolCenter(pool);
      const size = pool === 'float' ? FLOAT_BASE_SIZE : SIDE_BOX_SIZE;
      const position = randomPointInBox(center, size);

      newParticles.push({
        position,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        ),
        targetPosition: position.clone(),
        pool,
        size: particleSize,
        flowing: false,
      });
    }

    floatCountRef.current = floatCount;
    secondaryCountRef.current = secondaryCount;
    atmCountRef.current = atmCount;
    warrantCountRef.current = warrantsCount;
    updateFloatTarget(floatCount, particleCount);
    floatVisualSizeRef.current = FLOAT_BASE_SIZE;
    atmDripActiveRef.current = false;
    setAtmDripActive(false);
    atmDripTimerRef.current = 0;

    countsRef.current = {
      float: floatCount,
      secondary: secondaryCount,
      atm: atmCount,
      warrants: warrantsCount,
    };
    setDisplayCounts(countsRef.current);
    setParticles(newParticles);
    setLastAction(null);
  }, [particleCount, particleSize, updateFloatTarget]);

  useEffect(() => {
    regenerateParticles();
  }, [regenerateParticles]);

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const poolTypes = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);

    geom.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geom.setAttribute(
      'poolType',
      new THREE.Float32BufferAttribute(poolTypes, 1)
    );
    geom.setAttribute(
      'particleSize',
      new THREE.Float32BufferAttribute(sizes, 1)
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
        blending: THREE.NormalBlending,
      }),
    []
  );

  const assignNewTarget = useCallback(
    (particle: Particle, pool: PoolType, speedMultiplier = 1.2) => {
      const center = getPoolCenter(pool);
      const size =
        pool === 'float' ? floatTargetSizeRef.current : SIDE_BOX_SIZE;
      particle.pool = pool;
      particle.targetPosition = randomPointInBox(center, size);
      particle.flowing = true;
      particle.velocity = particle.targetPosition
        .clone()
        .sub(particle.position)
        .normalize()
        .multiplyScalar(1.2 * speedMultiplier);
    },
    []
  );

  const handleSecondaryBurst = useCallback(() => {
    setParticles((prev) => {
      const secondaryIndices: number[] = [];
      prev.forEach((p, idx) => {
        if (p.pool === 'secondary') secondaryIndices.push(idx);
      });

      if (!secondaryIndices.length) {
        return prev;
      }

      const updated = [...prev];
      secondaryIndices.forEach((idx) =>
        assignNewTarget(updated[idx], 'float', secondaryAcceleration)
      );

      floatCountRef.current += secondaryIndices.length;
      secondaryCountRef.current = 0;
      updateFloatTarget(floatCountRef.current, prev.length);
      setLastAction('secondary');
      return updated;
    });
  }, [assignNewTarget, secondaryAcceleration, updateFloatTarget]);

  const handleToggleAtmDrip = useCallback(() => {
    atmDripActiveRef.current = !atmDripActiveRef.current;
    setAtmDripActive(atmDripActiveRef.current);
    if (!atmDripActiveRef.current) {
      atmDripTimerRef.current = 0;
    }
  }, []);

  const handleExerciseWarrants = useCallback(() => {
    setParticles((prev) => {
      const warrantIndices: number[] = [];
      prev.forEach((p, idx) => {
        if (p.pool === 'warrants') warrantIndices.push(idx);
      });

      if (!warrantIndices.length) {
        triggerWarrantPulse('No warrants remaining', 1500);
        return prev;
      }

      if (marketPriceRef.current < warrantStrikeRef.current) {
        triggerWarrantPulse('Price below strike — cannot exercise', 1800);
        return prev;
      }

      const moveCount = Math.min(
        Math.max(0, Math.floor(warrantBatchRef.current)),
        warrantIndices.length
      );
      const updated = [...prev];
      for (let i = 0; i < moveCount; i++) {
        const idx = warrantIndices[i];
        assignNewTarget(updated[idx], 'float', 0.9);
      }

      floatCountRef.current += moveCount;
      warrantCountRef.current -= moveCount;
      updateFloatTarget(floatCountRef.current, prev.length);
      setLastAction('warrants');
      triggerWarrantPulse('Warrants exercised into the float', 2000);
      return updated;
    });
  }, [assignNewTarget, updateFloatTarget, triggerWarrantPulse]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;

    if (atmDripActiveRef.current) {
      atmDripTimerRef.current += delta;
    }

    const shouldDrip =
      atmDripActiveRef.current &&
      atmCountRef.current > 0 &&
      atmDripTimerRef.current >= atmDripInterval;
    const atmDripTrigger = shouldDrip
      ? Math.min(atmDripSize, atmCountRef.current)
      : 0;
    if (shouldDrip) {
      atmDripTimerRef.current = 0;
    }

    const geom = pointsRef.current.geometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
    const poolAttr = geom.getAttribute('poolType') as THREE.BufferAttribute;
    const sizeAttr = geom.getAttribute('particleSize') as THREE.BufferAttribute;

    setParticles((prev) => {
      const updated = [...prev];

      if (atmDripTrigger > 0) {
        const atmIndices: number[] = [];
        for (let i = 0; i < updated.length; i++) {
          if (updated[i].pool === 'atm') {
            atmIndices.push(i);
            if (atmIndices.length === atmDripTrigger) break;
          }
        }

        atmIndices.forEach((idx) =>
          assignNewTarget(updated[idx], 'float', 0.65)
        );
        floatCountRef.current += atmIndices.length;
        atmCountRef.current -= atmIndices.length;
        updateFloatTarget(floatCountRef.current, updated.length);
        setLastAction('atm');
      }

      const floatHalf = floatVisualSizeRef.current * 0.5;

      let floatCount = 0;
      let secondaryCount = 0;
      let atmCount = 0;
      let warrantsCount = 0;

      for (let i = 0; i < updated.length; i++) {
        const particle = updated[i];
        const center = getPoolCenter(particle.pool);
        const limit =
          particle.pool === 'float' ? floatHalf : SIDE_BOX_SIZE * 0.5;
        const lerpFactor = particle.flowing
          ? Math.min(1, flowSpeed * delta)
          : 0.2 * delta;

        particle.position.lerp(particle.targetPosition, lerpFactor);

        if (!particle.flowing) {
          particle.position.add(
            particle.velocity.clone().multiplyScalar(delta * 0.2)
          );
          particle.velocity.add(
            new THREE.Vector3(
              (Math.random() - 0.5) * 0.02,
              (Math.random() - 0.5) * 0.02,
              (Math.random() - 0.5) * 0.02
            )
          );
          particle.velocity.clampLength(0, 0.4);
        }

        if (
          particle.flowing &&
          particle.position.distanceTo(particle.targetPosition) < 0.05
        ) {
          particle.flowing = false;
          particle.targetPosition = randomPointInBox(
            center,
            particle.pool === 'float'
              ? floatTargetSizeRef.current
              : SIDE_BOX_SIZE
          );
        }

        particle.position.x = THREE.MathUtils.clamp(
          particle.position.x,
          center.x - limit,
          center.x + limit
        );
        particle.position.y = THREE.MathUtils.clamp(
          particle.position.y,
          center.y - limit,
          center.y + limit
        );
        particle.position.z = THREE.MathUtils.clamp(
          particle.position.z,
          center.z - limit,
          center.z + limit
        );

        posAttr.setXYZ(
          i,
          particle.position.x,
          particle.position.y,
          particle.position.z
        );
        poolAttr.setX(i, poolToCode(particle.pool));
        sizeAttr.setX(i, particle.size * 10);

        if (particle.pool === 'float') floatCount++;
        else if (particle.pool === 'secondary') secondaryCount++;
        else if (particle.pool === 'atm') atmCount++;
        else warrantsCount++;
      }

      posAttr.needsUpdate = true;
      poolAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;

      const nextCounts = {
        float: floatCount,
        secondary: secondaryCount,
        atm: atmCount,
        warrants: warrantsCount,
      };

      if (
        nextCounts.float !== countsRef.current.float ||
        nextCounts.secondary !== countsRef.current.secondary ||
        nextCounts.atm !== countsRef.current.atm ||
        nextCounts.warrants !== countsRef.current.warrants
      ) {
        countsRef.current = nextCounts;
        setDisplayCounts(nextCounts);
      }

      floatCountRef.current = floatCount;
      secondaryCountRef.current = secondaryCount;
      atmCountRef.current = atmCount;
      warrantCountRef.current = warrantsCount;

      return updated;
    });

    floatVisualSizeRef.current = THREE.MathUtils.lerp(
      floatVisualSizeRef.current,
      floatTargetSizeRef.current,
      delta * 2
    );

    if (floatBoxRef.current) {
      const ratio = floatVisualSizeRef.current / FLOAT_BASE_SIZE;
      floatBoxRef.current.scale.set(ratio, ratio, ratio);
    }

    if (flowHighlightRef.current && lastAction) {
      const config = FLOW_HIGHLIGHTS[lastAction];

      // Compute dynamic bridge spanning only from source face to float face
      const floatHalf = floatVisualSizeRef.current * 0.5;
      const sideHalf = SIDE_BOX_SIZE * 0.5;

      let centerX = 0;
      let centerZ = 0;
      let length = 0;
      let rotY = 0;

      if (lastAction === 'secondary') {
        // From secondary (right) toward float (center)
        const start = floatHalf + BRIDGE_MARGIN;
        const end = BOX_SPACING - sideHalf - BRIDGE_MARGIN;
        length = Math.max(0, end - start);
        centerX = (start + end) * 0.5;
        centerZ = 0;
        rotY = 0;
      } else if (lastAction === 'atm') {
        // From ATM (left) toward float (center)
        const start = -floatHalf - BRIDGE_MARGIN;
        const end = -BOX_SPACING + sideHalf + BRIDGE_MARGIN;
        length = Math.max(0, Math.abs(end - start));
        centerX = (start + end) * 0.5;
        centerZ = 0;
        rotY = 0;
      } else if (lastAction === 'warrants') {
        // From warrants (front, +z) toward float (center) along Z
        const start = floatHalf + BRIDGE_MARGIN;
        const end = BOX_SPACING - sideHalf - BRIDGE_MARGIN;
        length = Math.max(0, end - start);
        centerX = 0;
        centerZ = (start + end) * 0.5;
        rotY = Math.PI * 0.5;
      }

      flowHighlightRef.current.position.set(centerX, 0, centerZ);
      flowHighlightRef.current.rotation.set(0, rotY, 0);

      // Base geometry length is BOX_SPACING along local X axis; scale proportionally
      const xScale = BOX_SPACING > 0 ? Math.max(0, length) / BOX_SPACING : 1;
      flowHighlightRef.current.scale.set(xScale, 1, 1);

      const material = flowHighlightRef.current
        .material as THREE.MeshStandardMaterial;
      material.color.set(config.color);
      const targetOpacity = 0.35;
      material.opacity = THREE.MathUtils.lerp(
        material.opacity,
        targetOpacity,
        delta * 3
      );
    } else if (flowHighlightRef.current) {
      const material = flowHighlightRef.current
        .material as THREE.MeshStandardMaterial;
      material.opacity = THREE.MathUtils.lerp(material.opacity, 0, delta * 2);
    }
  });

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
            }
          `}</style>
          <LevaPanel
            store={levaStore}
            fill={false}
            titleBar={{ title: 'Offering Mechanics Lab' }}
            collapsed={false}
          />
        </div>
      </Html>

      <Html position={[-6, 4.5, 0]} style={{ pointerEvents: 'none' }}>
        <div
          style={{
            background: 'rgba(0,0,0,0.65)',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
            minWidth: '220px',
            fontSize: '14px',
            lineHeight: '1.5',
            color: 'white',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>
            Share Distribution
          </div>
          <div>Float: {displayCounts.float.toLocaleString()}</div>
          <div>
            Secondary Chamber: {displayCounts.secondary.toLocaleString()}
          </div>
          <div>ATM Shelf: {displayCounts.atm.toLocaleString()}</div>
          <div>Warrant Halo: {displayCounts.warrants.toLocaleString()}</div>
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
            ATM Tap: {atmDripActive ? 'Running' : 'Paused'}
          </div>
        </div>
      </Html>

      <Html position={[0, 4.6, BOX_SPACING]} style={{ pointerEvents: 'none' }}>
        <div
          style={{
            background: 'rgba(0,0,0,0.7)',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.12)',
            minWidth: '210px',
            color: 'white',
            fontSize: '13px',
            lineHeight: 1.4,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            Warrants Strike Gate
          </div>
          <div>Strike: ${warrantStrike.toFixed(2)}</div>
          <div>Price: ${marketPrice.toFixed(2)}</div>
          <div
            style={{
              marginTop: 4,
              color: marketPrice >= warrantStrike ? '#6bffb0' : '#ffb347',
            }}
          >
            {warrantPulseMessage ?? baseWarrantMessage}
          </div>
        </div>
      </Html>

      <points ref={pointsRef}>
        <primitive object={geometry} attach="geometry" />
        <primitive object={material} attach="material" />
      </points>

      <mesh ref={floatBoxRef} position={[0, 0, 0]}>
        <boxGeometry
          args={[FLOAT_BASE_SIZE, FLOAT_BASE_SIZE, FLOAT_BASE_SIZE]}
        />
        <meshStandardMaterial
          color="#114b8b"
          transparent
          opacity={0.18}
          emissive="#1b74d1"
          emissiveIntensity={0.2}
        />
      </mesh>

      <mesh position={[BOX_SPACING, 0, 0]}>
        <boxGeometry args={[SIDE_BOX_SIZE, SIDE_BOX_SIZE, SIDE_BOX_SIZE]} />
        <meshStandardMaterial
          color="#7a1f19"
          transparent
          opacity={0.18}
          emissive="#ff6b6b"
          emissiveIntensity={0.15}
        />
      </mesh>

      <mesh position={[-BOX_SPACING, 0, 0]}>
        <boxGeometry args={[SIDE_BOX_SIZE, SIDE_BOX_SIZE, SIDE_BOX_SIZE]} />
        <meshStandardMaterial
          color="#1c5b42"
          transparent
          opacity={0.18}
          emissive="#3bd0a0"
          emissiveIntensity={0.15}
        />
      </mesh>

      <mesh position={[0, 0, BOX_SPACING]}>
        <boxGeometry args={[SIDE_BOX_SIZE, SIDE_BOX_SIZE, SIDE_BOX_SIZE]} />
        <meshStandardMaterial
          color="#3b2a69"
          transparent
          opacity={0.18}
          emissive="#b08bff"
          emissiveIntensity={0.18}
        />
      </mesh>

      <mesh ref={flowHighlightRef} position={[0, 0, 0]}>
        <boxGeometry args={[BOX_SPACING, SIDE_BOX_SIZE * 0.8, 0.6]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0}
          emissiveIntensity={0.2}
        />
      </mesh>

      <Html position={[0, -FLOAT_BASE_SIZE * 0.65, 0]} center>
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.65)',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '13px',
            color: 'white',
            whiteSpace: 'nowrap',
          }}
        >
          Float (active tradable shares)
        </div>
      </Html>

      <Html position={[BOX_SPACING, -SIDE_BOX_SIZE * 0.6, 0]} center>
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.65)',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '13px',
            color: 'white',
            whiteSpace: 'nowrap',
          }}
        >
          Secondary Offering Chamber
        </div>
      </Html>

      <Html position={[-BOX_SPACING, -SIDE_BOX_SIZE * 0.6, 0]} center>
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.65)',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '13px',
            color: 'white',
            whiteSpace: 'nowrap',
          }}
        >
          ATM Tap (slow drip)
        </div>
      </Html>

      <Html position={[0, -SIDE_BOX_SIZE * 0.6, BOX_SPACING]} center>
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.65)',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '13px',
            color: 'white',
            whiteSpace: 'nowrap',
          }}
        >
          Warrants (ghost supply)
        </div>
      </Html>
    </>
  );
}

export default OfferingMechanics3D;
