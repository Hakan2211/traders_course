
import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useControls, LevaPanel, button, useCreateStore } from 'leva';
import * as THREE from 'three';

interface DilutionBuyback3DProps {
  levaStore: ReturnType<typeof useCreateStore>;
}

type PoolType = 'float' | 'shelf' | 'treasury';

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

const FLOAT_CENTER = new THREE.Vector3(0, 0, 0);
const SHELF_CENTER = new THREE.Vector3(BOX_SPACING, 0, 0);
const TREASURY_CENTER = new THREE.Vector3(-BOX_SPACING, 0, 0);

const poolToCode = (pool: PoolType) => {
  switch (pool) {
    case 'float':
      return 0;
    case 'shelf':
      return 1;
    default:
      return 2;
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
      vColor = vec3(0.23, 0.65, 1.0); // Float (active shares)
    } else if (poolType < 1.5) {
      vColor = vec3(0.8, 0.82, 0.9); // Shelf (authorized)
    } else {
      vColor = vec3(0.99, 0.78, 0.35); // Treasury
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

export function DilutionBuyback3D({ levaStore }: DilutionBuyback3DProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const floatBoxRef = useRef<THREE.Mesh>(null);
  const flowHighlightRef = useRef<THREE.Mesh>(null);

  const [particles, setParticles] = useState<Particle[]>([]);
  const [displayCounts, setDisplayCounts] = useState({
    float: 0,
    shelf: 0,
    treasury: 0,
  });
  const countsRef = useRef(displayCounts);

  const floatTargetSizeRef = useRef(FLOAT_BASE_SIZE);
  const floatVisualSizeRef = useRef(FLOAT_BASE_SIZE);

  const floatCountRef = useRef(0);
  const shelfCountRef = useRef(0);
  const treasuryCountRef = useRef(0);

  const [lastAction, setLastAction] = useState<'dilution' | 'buyback' | null>(
    null
  );

  const { particleCount, particleSize, flowSpeed, batchSize } = useControls(
    'Dilution vs Buybacks',
    {
      particleCount: {
        value: 2400,
        min: 600,
        max: 6000,
        step: 200,
        label: 'Particle Count',
      },
      particleSize: {
        value: 0.18,
        min: 0.08,
        max: 0.4,
        step: 0.01,
        label: 'Particle Size',
      },
      flowSpeed: {
        value: 1.2,
        min: 0.4,
        max: 2.4,
        step: 0.1,
        label: 'Flow Speed',
      },
      batchSize: {
        value: 250,
        min: 50,
        max: 800,
        step: 50,
        label: 'Shares per Action',
      },
      Dilute: button(() => handleDilute()),
      Buyback: button(() => handleBuyback()),
      Reset: button(() => regenerateParticles()),
    },
    { store: levaStore }
  );

  const updateFloatTarget = useCallback((floatCount: number, total: number) => {
    const ratio = total > 0 ? floatCount / total : 0;
    const nextSize = FLOAT_BASE_SIZE + ratio * 2.2;
    floatTargetSizeRef.current = nextSize;
  }, []);

  const regenerateParticles = useCallback(() => {
    const floatCount = Math.floor(particleCount * 0.5);
    const shelfCount = Math.floor(particleCount * 0.3);
    const treasuryCount = Math.max(0, particleCount - floatCount - shelfCount);

    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      let pool: PoolType = 'float';
      if (i < floatCount) pool = 'float';
      else if (i < floatCount + shelfCount) pool = 'shelf';
      else pool = 'treasury';

      const center =
        pool === 'float'
          ? FLOAT_CENTER
          : pool === 'shelf'
          ? SHELF_CENTER
          : TREASURY_CENTER;
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
    shelfCountRef.current = shelfCount;
    treasuryCountRef.current = treasuryCount;
    updateFloatTarget(floatCount, particleCount);
    floatVisualSizeRef.current = FLOAT_BASE_SIZE;

    countsRef.current = {
      float: floatCount,
      shelf: shelfCount,
      treasury: treasuryCount,
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

  const assignNewTarget = useCallback((particle: Particle, pool: PoolType) => {
    const center =
      pool === 'float'
        ? FLOAT_CENTER
        : pool === 'shelf'
        ? SHELF_CENTER
        : TREASURY_CENTER;
    const size = pool === 'float' ? floatTargetSizeRef.current : SIDE_BOX_SIZE;
    particle.pool = pool;
    particle.targetPosition = randomPointInBox(center, size);
    particle.flowing = true;
    particle.velocity = particle.targetPosition
      .clone()
      .sub(particle.position)
      .normalize()
      .multiplyScalar(1.2);
  }, []);

  const handleDilute = useCallback(() => {
    setParticles((prev) => {
      const shelfIndices: number[] = [];
      prev.forEach((p, idx) => {
        if (p.pool === 'shelf') shelfIndices.push(idx);
      });

      const moveCount = Math.min(batchSize, shelfIndices.length);
      if (moveCount === 0) {
        return prev;
      }

      const updated = [...prev];
      for (let i = 0; i < moveCount; i++) {
        const idx = shelfIndices[i];
        assignNewTarget(updated[idx], 'float');
      }

      floatCountRef.current += moveCount;
      shelfCountRef.current -= moveCount;
      updateFloatTarget(floatCountRef.current, prev.length);
      setLastAction('dilution');
      return updated;
    });
  }, [assignNewTarget, batchSize, updateFloatTarget]);

  const handleBuyback = useCallback(() => {
    setParticles((prev) => {
      const floatIndices: number[] = [];
      prev.forEach((p, idx) => {
        if (p.pool === 'float') floatIndices.push(idx);
      });

      const moveCount = Math.min(batchSize, floatIndices.length);
      if (moveCount === 0) {
        return prev;
      }

      const updated = [...prev];
      for (let i = 0; i < moveCount; i++) {
        const idx = floatIndices[i];
        assignNewTarget(updated[idx], 'treasury');
      }

      floatCountRef.current -= moveCount;
      treasuryCountRef.current += moveCount;
      updateFloatTarget(floatCountRef.current, prev.length);
      setLastAction('buyback');
      return updated;
    });
  }, [assignNewTarget, batchSize, updateFloatTarget]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;

    const geom = pointsRef.current.geometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
    const poolAttr = geom.getAttribute('poolType') as THREE.BufferAttribute;
    const sizeAttr = geom.getAttribute('particleSize') as THREE.BufferAttribute;

    setParticles((prev) => {
      const updated = [...prev];
      const floatHalf = floatVisualSizeRef.current * 0.5;

      let floatCount = 0;
      let shelfCount = 0;
      let treasuryCount = 0;

      for (let i = 0; i < updated.length; i++) {
        const particle = updated[i];

        const center =
          particle.pool === 'float'
            ? FLOAT_CENTER
            : particle.pool === 'shelf'
            ? SHELF_CENTER
            : TREASURY_CENTER;
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
          particle.position.distanceTo(particle.targetPosition) < 0.05 &&
          particle.flowing
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
        else if (particle.pool === 'shelf') shelfCount++;
        else treasuryCount++;
      }

      posAttr.needsUpdate = true;
      poolAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;

      const nextCounts = {
        float: floatCount,
        shelf: shelfCount,
        treasury: treasuryCount,
      };
      if (
        nextCounts.float !== countsRef.current.float ||
        nextCounts.shelf !== countsRef.current.shelf ||
        nextCounts.treasury !== countsRef.current.treasury
      ) {
        countsRef.current = nextCounts;
        setDisplayCounts(nextCounts);
      }

      return updated;
    });

    floatVisualSizeRef.current = THREE.MathUtils.lerp(
      floatVisualSizeRef.current,
      floatTargetSizeRef.current,
      delta * 2
    );

    if (floatBoxRef.current) {
      const scaleRatio = floatVisualSizeRef.current / FLOAT_BASE_SIZE;
      floatBoxRef.current.scale.set(scaleRatio, scaleRatio, scaleRatio);
    }

    if (flowHighlightRef.current) {
      const targetOpacity =
        lastAction === 'dilution' ? 0.35 : lastAction === 'buyback' ? 0.35 : 0;
      const material = flowHighlightRef.current
        .material as THREE.MeshStandardMaterial;
      material.opacity = THREE.MathUtils.lerp(
        material.opacity,
        targetOpacity,
        delta * 2
      );
      if (lastAction === 'dilution') {
        flowHighlightRef.current.position.set(BOX_SPACING * 0.5, 0, 0);
        material.color.set('#4da1ff');
      } else if (lastAction === 'buyback') {
        flowHighlightRef.current.position.set(-BOX_SPACING * 0.5, 0, 0);
        material.color.set('#f5b642');
      }
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
            titleBar={{ title: 'Dilution vs Buybacks' }}
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
            minWidth: '180px',
            fontSize: '14px',
            lineHeight: '1.5',
            color: 'white',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>
            Share Distribution
          </div>
          <div>Float: {displayCounts.float.toLocaleString()}</div>
          <div>On Shelf: {displayCounts.shelf.toLocaleString()}</div>
          <div>Treasury: {displayCounts.treasury.toLocaleString()}</div>
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
          color="#666a75"
          transparent
          opacity={0.15}
          emissive="#9498a3"
          emissiveIntensity={0.1}
        />
      </mesh>

      <mesh position={[-BOX_SPACING, 0, 0]}>
        <boxGeometry args={[SIDE_BOX_SIZE, SIDE_BOX_SIZE, SIDE_BOX_SIZE]} />
        <meshStandardMaterial
          color="#8a6212"
          transparent
          opacity={0.18}
          emissive="#f2c15a"
          emissiveIntensity={0.15}
        />
      </mesh>

      <mesh ref={flowHighlightRef} position={[0, 0, 0]}>
        <boxGeometry
          args={[BOX_SPACING, SIDE_BOX_SIZE * 0.8, SIDE_BOX_SIZE * 0.8]}
        />
        <meshStandardMaterial
          color="#4da1ff"
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
          Shelf (registered supply)
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
          Treasury (retired shares)
        </div>
      </Html>
    </>
  );
}

export default DilutionBuyback3D;
