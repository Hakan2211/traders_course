import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { LevaPanel, useControls, useCreateStore } from 'leva';

interface VolumeRotation3DProps {
  levaStore: ReturnType<typeof useCreateStore>;
}

type Preset = 'Risk-On' | 'Risk-Off';
type RotationMode = 'Inter-Asset' | 'Sector' | 'Intra-Sector' | 'Small-Cap';

interface AssetSpec {
  id: 'stocks' | 'crypto' | 'bonds' | 'gold';
  name: string;
  color: string;
  center: THREE.Vector3;
  radius: number;
}

interface FlowSpec {
  from: AssetSpec['id'];
  to: AssetSpec['id'];
  strength: number; // 0..1
}

export default function VolumeRotation3D({ levaStore }: VolumeRotation3DProps) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const { preset, rotationMode } = useControls(
    'Volume Rotation',
    {
      preset: {
        value: 'Risk-On',
        options: ['Risk-On', 'Risk-Off'],
      },
      rotationMode: {
        value: 'Inter-Asset',
        options: ['Inter-Asset', 'Sector', 'Intra-Sector', 'Small-Cap'],
      },
    },
    { store: levaStore }
  ) as { preset: Preset; rotationMode: RotationMode };

  // Transition progress between modes
  const [interOpacity, setInterOpacity] = useState(
    rotationMode === 'Inter-Asset' ? 1 : 0
  );
  const [sectorOpacity, setSectorOpacity] = useState(
    rotationMode === 'Sector' ? 1 : 0
  );
  const [intraOpacity, setIntraOpacity] = useState(
    rotationMode === 'Intra-Sector' ? 1 : 0
  );
  const [smallCapOpacity, setSmallCapOpacity] = useState(
    rotationMode === 'Small-Cap' ? 1 : 0
  );

  useEffect(() => {
    const targetInter = rotationMode === 'Inter-Asset' ? 1 : 0;
    const targetSector = rotationMode === 'Sector' ? 1 : 0;
    const targetIntra = rotationMode === 'Intra-Sector' ? 1 : 0;
    const targetSmallCap = rotationMode === 'Small-Cap' ? 1 : 0;

    const fromInter = interOpacity;
    const fromSector = sectorOpacity;
    const fromIntra = intraOpacity;
    const fromSmallCap = smallCapOpacity;

    if (
      fromInter === targetInter &&
      fromSector === targetSector &&
      fromIntra === targetIntra &&
      fromSmallCap === targetSmallCap
    )
      return;

    const durationMs = 1200;
    const start = performance.now();
    const easeInOutCubic = (x: number) =>
      x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    let raf = 0 as number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = easeInOutCubic(t);
      setInterOpacity(fromInter + (targetInter - fromInter) * eased);
      setSectorOpacity(fromSector + (targetSector - fromSector) * eased);
      setIntraOpacity(fromIntra + (targetIntra - fromIntra) * eased);
      setSmallCapOpacity(
        fromSmallCap + (targetSmallCap - fromSmallCap) * eased
      );
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [rotationMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Animate camera forward in sector/intra-sector/small-cap modes
  useFrame(() => {
    // Default position: [0, 0.5, 7]
    // Sector position: [0, 0.5, 3.5] (closer to see cubes better)
    // Intra-Sector position: [0, 0.5, 3.0] (even closer for 3 cubes)
    // Small-Cap position: [0, 0.5, 4.0] (medium distance for particle cubes)
    const defaultZ = 7;
    const sectorZ = 3.5;
    const intraZ = 3.0;
    const smallCapZ = 4.0;
    // Interpolate between modes
    const currentZ =
      defaultZ * interOpacity +
      sectorZ * sectorOpacity +
      intraZ * intraOpacity +
      smallCapZ * smallCapOpacity;
    camera.position.z = currentZ;
    camera.updateProjectionMatrix();
  });

  const assets = useMemo<AssetSpec[]>(() => {
    return [
      {
        id: 'stocks',
        name: 'Stocks',
        color: '#4aa3ff',
        center: new THREE.Vector3(-4, 0, 0),
        radius: 1.2,
      },
      {
        id: 'crypto',
        name: 'Crypto',
        color: '#ef476f',
        center: new THREE.Vector3(4, 0, 0),
        radius: 1.2,
      },
      {
        id: 'bonds',
        name: 'Bonds',
        color: '#ffd166',
        center: new THREE.Vector3(0, 2.6, 0),
        radius: 1.2,
      },
      {
        id: 'gold',
        name: 'Gold',
        color: '#f3b700',
        center: new THREE.Vector3(0, -2.6, 0),
        radius: 1.2,
      },
    ];
  }, []);

  const flows = useMemo<FlowSpec[]>(() => getPresetFlows(preset), [preset]);
  const glowByAsset = useMemo<Record<string, number>>(() => {
    const inbound: Record<string, number> = {};
    for (const a of assets) inbound[a.id] = 0;
    for (const f of flows) inbound[f.to] += f.strength;
    // normalize to 0..1
    const max = Math.max(0.0001, ...Object.values(inbound));
    for (const key of Object.keys(inbound)) inbound[key] = inbound[key] / max;
    return inbound;
  }, [assets, flows]);

  return (
    <>
      <OrbitControls ref={controlsRef} />
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
            titleBar={{ title: 'Volume Rotation' }}
            collapsed={false}
          />
        </div>
      </Html>

      {/* Inter-Asset Scene */}
      <group visible={interOpacity > 0.01}>
        {assets.map((asset) => (
          <ParticleSphere
            key={asset.id}
            center={asset.center}
            radius={asset.radius}
            color={asset.color}
            label={asset.name}
            glowIntensity={glowByAsset[asset.id] ?? 0}
            opacityScale={interOpacity}
            dissolveProgress={1 - interOpacity}
            showLabel={rotationMode === 'Inter-Asset'}
          />
        ))}
        <FlowSystem assets={assets} flows={flows} opacityScale={interOpacity} />
      </group>

      {/* Sector Rotation Scene */}
      <group visible={sectorOpacity > 0.01}>
        <SectorScene
          preset={preset}
          opacityScale={sectorOpacity}
          showLabels={rotationMode === 'Sector'}
        />
      </group>

      {/* Intra-Sector Scene */}
      <group visible={intraOpacity > 0.01}>
        <IntraSectorScene
          preset={preset}
          opacityScale={intraOpacity}
          showLabels={rotationMode === 'Intra-Sector'}
        />
      </group>

      {/* Small-Cap Scene */}
      <group visible={smallCapOpacity > 0.01}>
        <SmallCapScene
          preset={preset}
          opacityScale={smallCapOpacity}
          showLabels={rotationMode === 'Small-Cap'}
        />
      </group>
    </>
  );
}

function ParticleSphere({
  center,
  radius,
  color,
  label,
  glowIntensity = 0,
  opacityScale = 1,
  dissolveProgress = 0,
  showLabel = true,
}: {
  center: THREE.Vector3;
  radius: number;
  color: string;
  label: string;
  glowIntensity?: number;
  opacityScale?: number;
  dissolveProgress?: number;
  showLabel?: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 2000;
  const baseRelativePositions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      // random point on/within sphere shell
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = radius * (0.85 + Math.random() * 0.15);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      arr[i * 3 + 0] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
    return arr;
  }, [radius, particleCount]);
  const initialPositions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      arr[i * 3 + 0] = center.x + baseRelativePositions[i * 3 + 0];
      arr[i * 3 + 1] = center.y + baseRelativePositions[i * 3 + 1];
      arr[i * 3 + 2] = center.z + baseRelativePositions[i * 3 + 2];
    }
    return arr;
  }, [center, baseRelativePositions, particleCount]);
  const seeds = useMemo(() => {
    const s = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) s[i] = Math.random();
    return s;
  }, [particleCount]);

  // mild breathing + dissolve animation
  useFrame((state) => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry as THREE.BufferGeometry;
    const pos = geom.getAttribute('position') as THREE.BufferAttribute;
    const t = state.clock.getElapsedTime();
    const breathe = Math.sin(t * 0.6) * 0.002;
    const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
    const d = easeOutCubic(Math.max(0, Math.min(1, dissolveProgress)));
    for (let i = 0; i < pos.count; i++) {
      const bx = baseRelativePositions[i * 3 + 0];
      const by = baseRelativePositions[i * 3 + 1];
      const bz = baseRelativePositions[i * 3 + 2];
      const x = bx;
      const y = by;
      const z = bz;
      const len = Math.sqrt(x * x + y * y + z * z) || 1;
      const nx = x / len;
      const ny = y / len;
      const nz = z / len;
      // outward dissolve distance with per-point randomness
      const out = d * (0.5 + seeds[i] * 1.4) * radius * 1.2; // push outward
      pos.setXYZ(
        i,
        center.x + (x + nx * (breathe + out)),
        center.y + (y + ny * (breathe + out)),
        center.z + (z + nz * (breathe + out))
      );
    }
    pos.needsUpdate = true;
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={initialPositions.length / 3}
            array={initialPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color={color}
          size={0.035}
          sizeAttenuation
          transparent
          opacity={0.95 * opacityScale * (1 - dissolveProgress)}
        />
      </points>

      {/* subtle emissive glow shell, scales with inbound flow */}
      <mesh
        position={center.toArray() as [number, number, number]}
        scale={[
          1.05 +
            0.4 *
              (dissolveProgress > 0
                ? 1 - Math.pow(1 - dissolveProgress, 3)
                : 0),
          1.05 +
            0.4 *
              (dissolveProgress > 0
                ? 1 - Math.pow(1 - dissolveProgress, 3)
                : 0),
          1.05 +
            0.4 *
              (dissolveProgress > 0
                ? 1 - Math.pow(1 - dissolveProgress, 3)
                : 0),
        ]}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4 + glowIntensity * 1.2}
          transparent
          opacity={
            (0.12 + glowIntensity * 0.2) * opacityScale * (1 - dissolveProgress)
          }
        />
      </mesh>

      {showLabel && (
        <Html position={[center.x, center.y + radius + 0.6, center.z]} center>
          <div
            style={{
              color: 'white',
              background: 'rgba(0,0,0,0.6)',
              padding: '4px 8px',
              borderRadius: 6,
              fontSize: 12,
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

function FlowSystem({
  assets,
  flows,
  opacityScale = 1,
}: {
  assets: AssetSpec[];
  flows: FlowSpec[];
  opacityScale?: number;
}) {
  const assetById = useMemo(() => {
    const m: Record<string, AssetSpec> = {};
    for (const a of assets) m[a.id] = a;
    return m;
  }, [assets]);

  return (
    <group>
      {flows.map((f, idx) => {
        const from = assetById[f.from];
        const to = assetById[f.to];
        if (!from || !to) return null;
        return (
          <FlowParticles
            key={`${f.from}-${f.to}-${idx}`}
            from={from}
            to={to}
            strength={f.strength}
            color={to.color}
            opacityScale={opacityScale}
          />
        );
      })}
    </group>
  );
}

function FlowParticles({
  from,
  to,
  strength,
  color,
  opacityScale = 1,
}: {
  from: AssetSpec;
  to: AssetSpec;
  strength: number;
  color: string;
  opacityScale?: number;
}) {
  // number of moving particles scales with strength
  const particleCount = Math.max(6, Math.floor(18 * strength));
  const speed = 0.25 + strength * 0.6;
  const arcHeight =
    from.center.distanceTo(to.center) * (0.18 + 0.22 * strength);
  const seeds = useMemo(
    () => new Array(particleCount).fill(0).map(() => Math.random()),
    [particleCount]
  );
  const trailSteps = 6; // ghosts per particle
  const trailStepDt = 0.04; // time spacing between ghosts

  // compute quadratic bezier control
  const p0 = from.center.clone().add(
    to.center
      .clone()
      .sub(from.center)
      .normalize()
      .multiplyScalar(from.radius * 0.9)
  );
  const p2 = to.center.clone().add(
    from.center
      .clone()
      .sub(to.center)
      .normalize()
      .multiplyScalar(to.radius * 0.9)
  );
  const mid = p0.clone().add(p2).multiplyScalar(0.5);
  const dir = p2.clone().sub(p0).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const side = new THREE.Vector3().crossVectors(dir, up).normalize();
  const control = mid
    .clone()
    .add(up.clone().multiplyScalar(arcHeight * 0.7))
    .add(side.multiplyScalar(arcHeight * 0.15));

  const getPointOnCurve = (t: number) => {
    const u = 1 - t;
    const p = new THREE.Vector3();
    p.add(p0.clone().multiplyScalar(u * u));
    p.add(control.clone().multiplyScalar(2 * u * t));
    p.add(p2.clone().multiplyScalar(t * t));
    return p;
  };

  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    let childIndex = 0;
    for (let i = 0; i < particleCount; i++) {
      const phase = seeds[i];
      const baseT = (((t * speed + phase) % 1) + 1) % 1;
      // head + ghosts
      for (let g = 0; g <= trailSteps; g++) {
        const gt = Math.max(0, baseT - g * trailStepDt);
        const pos = getPointOnCurve(gt);
        const child = groupRef.current.children[childIndex] as THREE.Mesh;
        if (child) {
          child.position.set(pos.x, pos.y, pos.z);
          const alpha = 0.2 + (1 - g / (trailSteps + 1)) * 0.8;
          const scale = 0.08 * (1 - g / (trailSteps + 1)) + 0.02;
          child.scale.setScalar(scale);
          (child.material as THREE.MeshBasicMaterial).opacity =
            alpha * (0.6 + strength * 0.4) * opacityScale;
        }
        childIndex++;
      }
    }
  });

  // pre-create children meshes for performance (no React reflow each frame)
  const children = useMemo(() => {
    const arr: React.ReactNode[] = [];
    for (let i = 0; i < particleCount; i++) {
      for (let g = 0; g <= trailSteps; g++) {
        arr.push(
          <mesh key={`${i}-${g}`}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.8} />
          </mesh>
        );
      }
    }
    return arr;
  }, [particleCount, trailSteps, color]);

  return <group ref={groupRef}>{children}</group>;
}

function getPresetFlows(preset: Preset): FlowSpec[] {
  // Define directional flows between assets
  if (preset === 'Risk-On') {
    return [
      // Into Crypto strongest, then Stocks; lighter into Bonds/Gold
      { from: 'bonds', to: 'crypto', strength: 1.0 },
      { from: 'gold', to: 'crypto', strength: 0.9 },
      { from: 'stocks', to: 'crypto', strength: 0.7 },
      { from: 'bonds', to: 'stocks', strength: 0.55 },
      { from: 'gold', to: 'stocks', strength: 0.5 },
    ];
  }
  // Risk-Off (default)
  return [
    // Out of Stocks/Crypto into Bonds/Gold
    { from: 'stocks', to: 'bonds', strength: 1.0 },
    { from: 'crypto', to: 'bonds', strength: 0.9 },
    { from: 'stocks', to: 'gold', strength: 0.75 },
    { from: 'crypto', to: 'gold', strength: 0.7 },
  ];
}

// --- Sector Scene ---
type SectorId = 'financials' | 'technology' | 'energy' | 'utilities';
interface SectorNode {
  id: SectorId;
  name: string;
  color: string;
  center: THREE.Vector3;
}

function SectorScene({
  preset,
  opacityScale = 1,
  showLabels = false,
}: {
  preset: Preset;
  opacityScale?: number;
  showLabels?: boolean;
}) {
  // Simple positioning: 4 cubes side by side, centered at origin
  const cubeSpacing = 1.2; // Distance between cube centers
  const sectors = useMemo<SectorNode[]>(() => {
    return [
      {
        id: 'technology',
        name: 'Technology',
        color: '#4aa3ff',
        center: new THREE.Vector3(-cubeSpacing * 1.5, 0, 0),
      },
      {
        id: 'financials',
        name: 'Financials',
        color: '#ff9f1c',
        center: new THREE.Vector3(-cubeSpacing * 0.5, 0, 0),
      },
      {
        id: 'energy',
        name: 'Energy',
        color: '#2ec4b6',
        center: new THREE.Vector3(cubeSpacing * 0.5, 0, 0),
      },
      {
        id: 'utilities',
        name: 'Utilities',
        color: '#9b59b6',
        center: new THREE.Vector3(cubeSpacing * 1.5, 0, 0),
      },
    ];
  }, []);

  const sectorFlows = useMemo(
    () => getSectorFlows(preset, sectors),
    [preset, sectors]
  );

  return (
    <group>
      {/* Sector cubes - simple side by side */}
      {sectors.map((s) => (
        <CubeBox
          key={s.id}
          center={s.center}
          color={s.color}
          label={s.name}
          opacityScale={opacityScale}
          showLabel={showLabels}
        />
      ))}

      {/* Flows between sectors */}
      {sectorFlows.map((f, idx) => (
        <FlowParticles
          key={`sector-${f.from.id}-${f.to.id}-${idx}`}
          from={
            {
              id: 'stocks', // not used in FlowParticles beyond center/radius
              name: '',
              color: '',
              center: f.from.center,
              radius: 0.2, // smaller radius for cubes
            } as AssetSpec
          }
          to={
            {
              id: 'stocks',
              name: '',
              color: '',
              center: f.to.center,
              radius: 0.2, // smaller radius for cubes
            } as AssetSpec
          }
          strength={f.strength}
          color={f.to.color}
          opacityScale={opacityScale}
        />
      ))}
    </group>
  );
}

// --- Intra-Sector Scene ---
type IntraSectorId = 'megacaps' | 'semiconductors' | 'cloud';
interface IntraSectorNode {
  id: IntraSectorId;
  name: string;
  color: string;
  center: THREE.Vector3;
}

function IntraSectorScene({
  preset,
  opacityScale = 1,
  showLabels = false,
}: {
  preset: Preset;
  opacityScale?: number;
  showLabels?: boolean;
}) {
  // Simple positioning: 3 cubes side by side, centered at origin
  const cubeSpacing = 1.2; // Distance between cube centers
  const titleGap = 1.0; // Gap between title and cubes
  const intraSectors = useMemo<IntraSectorNode[]>(() => {
    return [
      {
        id: 'megacaps',
        name: 'Mega-caps',
        color: '#4aa3ff',
        center: new THREE.Vector3(-cubeSpacing, 0, 0),
      },
      {
        id: 'semiconductors',
        name: 'Semiconductors',
        color: '#2ec4b6',
        center: new THREE.Vector3(0, 0, 0),
      },
      {
        id: 'cloud',
        name: 'Cloud Computing',
        color: '#9b59b6',
        center: new THREE.Vector3(cubeSpacing, 0, 0),
      },
    ];
  }, []);

  const intraFlows = useMemo(
    () => getIntraSectorFlows(preset, intraSectors),
    [preset, intraSectors]
  );

  return (
    <group>
      {/* Technology title above cubes */}
      <Html position={[0, 0.35 + titleGap, 0]} center>
        <div
          style={{
            color: 'white',
            background: 'rgba(0,0,0,0.7)',
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.2)',
            opacity: opacityScale,
            pointerEvents: 'none',
          }}
        >
          Technology
        </div>
      </Html>

      {/* Intra-Sector cubes - simple side by side */}
      {intraSectors.map((s) => (
        <CubeBox
          key={s.id}
          center={s.center}
          color={s.color}
          label={s.name}
          opacityScale={opacityScale}
          showLabel={showLabels}
        />
      ))}

      {/* Flows between intra-sectors */}
      {intraFlows.map((f, idx) => (
        <FlowParticles
          key={`intra-${f.from.id}-${f.to.id}-${idx}`}
          from={
            {
              id: 'stocks', // not used in FlowParticles beyond center/radius
              name: '',
              color: '',
              center: f.from.center,
              radius: 0.2, // smaller radius for cubes
            } as AssetSpec
          }
          to={
            {
              id: 'stocks',
              name: '',
              color: '',
              center: f.to.center,
              radius: 0.2, // smaller radius for cubes
            } as AssetSpec
          }
          strength={f.strength}
          color={f.to.color}
          opacityScale={opacityScale}
        />
      ))}
    </group>
  );
}

// --- Small-Cap Scene ---
type SmallCapParticleType = 0 | 1 | 2; // 0 = neutral, 1 = seller (red), 2 = buyer (green)

interface SmallCapParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  type: SmallCapParticleType;
  size: number;
  opacity: number;
  basePosition: THREE.Vector3;
  homeCube: 'left' | 'right';
  isFlowing: boolean;
  flowProgress: number;
}

// Particle shader code (from VolumeAnatomy3D)
const smallCapParticleVertexShader = `
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

const smallCapParticleFragmentShader = `
  varying vec3 vColor;
  varying float vOpacity;
  
  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = (1.0 - smoothstep(0.3, 0.5, dist)) * vOpacity;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

function SmallCapScene({
  preset,
  opacityScale = 1,
  showLabels = false,
}: {
  preset: Preset;
  opacityScale?: number;
  showLabels?: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const leftMiddleZoneRef = useRef<THREE.Mesh>(null);
  const rightMiddleZoneRef = useRef<THREE.Mesh>(null);
  const [particles, setParticles] = useState<SmallCapParticle[]>([]);

  const cubeSpacing = 1.8; // Reduced to bring cubes closer together
  const cubeSize = 0.8;
  const HALF_CUBE = cubeSize / 2;
  const particleCount = 4000;
  const flowParticleCount = 1500; // Particles that flow between cubes (all green)

  const leftCubeCenter = new THREE.Vector3(-cubeSpacing, 0, 0);
  const rightCubeCenter = new THREE.Vector3(cubeSpacing, 0, 0);
  const middleZoneHeight = cubeSize * 0.2; // Middle zone height inside each cube (reduced)

  // Animation state for middle zones
  const leftMiddleZoneYRef = useRef(0);
  const rightMiddleZoneYRef = useRef(0);

  // Initialize particles
  useEffect(() => {
    const newParticles: SmallCapParticle[] = [];
    const cubeParticleCount = (particleCount - flowParticleCount) / 2;

    // Left cube particles
    for (let i = 0; i < cubeParticleCount; i++) {
      let type: SmallCapParticleType;
      let baseY: number;

      // Determine type first, then position based on type (like VolumeAnatomy3D)
      if (Math.random() < 0.3) {
        type = 0; // neutral - mixed throughout
        baseY = (Math.random() * 2 - 1) * HALF_CUBE;
      } else if (Math.random() < 0.5) {
        type = 1; // seller (red) - at the top
        baseY = HALF_CUBE * (0.3 + Math.random() * 0.5);
      } else {
        type = 2; // buyer (green) - at the bottom
        baseY = -HALF_CUBE * (0.3 + Math.random() * 0.5);
      }

      const basePosition = new THREE.Vector3(
        leftCubeCenter.x + (Math.random() - 0.5) * cubeSize * 0.9,
        leftCubeCenter.y + baseY,
        leftCubeCenter.z + (Math.random() - 0.5) * cubeSize * 0.9
      );

      newParticles.push({
        position: basePosition.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05
        ),
        type,
        size: 0.12,
        opacity: 0.8,
        basePosition,
        homeCube: 'left',
        isFlowing: false,
        flowProgress: 0,
      });
    }

    // Right cube particles
    for (let i = 0; i < cubeParticleCount; i++) {
      let type: SmallCapParticleType;
      let baseY: number;

      // Determine type first, then position based on type (like VolumeAnatomy3D)
      if (Math.random() < 0.3) {
        type = 0; // neutral - mixed throughout
        baseY = (Math.random() * 2 - 1) * HALF_CUBE;
      } else if (Math.random() < 0.5) {
        type = 1; // seller (red) - at the top
        baseY = HALF_CUBE * (0.3 + Math.random() * 0.5);
      } else {
        type = 2; // buyer (green) - at the bottom
        baseY = -HALF_CUBE * (0.3 + Math.random() * 0.5);
      }

      const basePosition = new THREE.Vector3(
        rightCubeCenter.x + (Math.random() - 0.5) * cubeSize * 0.9,
        rightCubeCenter.y + baseY,
        rightCubeCenter.z + (Math.random() - 0.5) * cubeSize * 0.9
      );

      newParticles.push({
        position: basePosition.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05
        ),
        type,
        size: 0.12,
        opacity: 0.8,
        basePosition,
        homeCube: 'right',
        isFlowing: false,
        flowProgress: 0,
      });
    }

    // Flow particles (start flowing) - all green
    for (let i = 0; i < flowParticleCount; i++) {
      const isRiskOn = preset === 'Risk-On';
      const sourceCube = isRiskOn ? leftCubeCenter : rightCubeCenter;
      const basePosition = new THREE.Vector3(
        sourceCube.x + (Math.random() - 0.5) * cubeSize * 0.5,
        sourceCube.y + (Math.random() - 0.5) * cubeSize * 0.5,
        sourceCube.z + (Math.random() - 0.5) * cubeSize * 0.5
      );

      // All flow particles are green (buyer type)
      const type: SmallCapParticleType = 2;

      newParticles.push({
        position: basePosition.clone(),
        velocity: new THREE.Vector3(0, 0, 0),
        type,
        size: 0.25, // Bigger size for flow particles
        opacity: 0.95,
        basePosition,
        homeCube: isRiskOn ? 'left' : 'right',
        isFlowing: true,
        flowProgress: Math.random(),
      });
    }

    setParticles(newParticles);
  }, [preset, cubeSpacing, cubeSize]);

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
      sizes[i] = 0.12;
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
  }, [particleCount]);

  // Create material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: smallCapParticleVertexShader,
      fragmentShader: smallCapParticleFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
  }, []);

  // Main animation loop
  useFrame((state, delta) => {
    // Animate middle zones: left moves down continuously, right moves up continuously
    const animationSpeed = 0.15;
    const maxOffset = HALF_CUBE * 0.4; // Maximum offset from center
    const time = state.clock.elapsedTime;

    // Left middle zone: starts high, moves down continuously, then resets
    const leftProgress = (time * animationSpeed) % 1; // 0 to 1, loops
    leftMiddleZoneYRef.current = maxOffset - leftProgress * 2 * maxOffset; // Starts at maxOffset, moves down to -maxOffset

    if (leftMiddleZoneRef.current) {
      leftMiddleZoneRef.current.position.y =
        leftCubeCenter.y + leftMiddleZoneYRef.current;
    }

    // Right middle zone: starts low, moves up continuously, then resets
    const rightProgress = (time * animationSpeed) % 1; // 0 to 1, loops
    rightMiddleZoneYRef.current = -maxOffset + rightProgress * 2 * maxOffset; // Starts at -maxOffset, moves up to maxOffset

    if (rightMiddleZoneRef.current) {
      rightMiddleZoneRef.current.position.y =
        rightCubeCenter.y + rightMiddleZoneYRef.current;
    }

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

    const speed = 0.4;
    const isRiskOn = preset === 'Risk-On';
    const sourceCube = isRiskOn ? leftCubeCenter : rightCubeCenter;
    const targetCube = isRiskOn ? rightCubeCenter : leftCubeCenter;

    setParticles((prevParticles) => {
      const updatedParticles = [...prevParticles];

      updatedParticles.forEach((particle, idx) => {
        if (particle.isFlowing) {
          // Flow particles: move between cubes through middle zone
          particle.flowProgress += delta * speed;
          if (particle.flowProgress > 1) {
            particle.flowProgress = 0;
            // Reset to source cube
            particle.position
              .copy(sourceCube)
              .add(
                new THREE.Vector3(
                  (Math.random() - 0.5) * cubeSize * 0.5,
                  (Math.random() - 0.5) * cubeSize * 0.5,
                  (Math.random() - 0.5) * cubeSize * 0.5
                )
              );
          }

          // Interpolate position, lifting through middle zone
          const t = particle.flowProgress;
          const basePos = sourceCube.clone().lerp(targetCube, t);
          const arcHeight = Math.sin(t * Math.PI) * 0.5; // Arc height for flow

          particle.position.set(basePos.x, basePos.y + arcHeight, basePos.z);
        } else {
          // Cube particles: oscillate around base position
          const oscillation = new THREE.Vector3(
            Math.sin(state.clock.elapsedTime * 0.8 + idx * 0.01) * 0.02,
            Math.cos(state.clock.elapsedTime * 0.6 + idx * 0.01) * 0.02,
            Math.sin(state.clock.elapsedTime * 0.7 + idx * 0.01) * 0.02
          );

          particle.position.copy(particle.basePosition).add(oscillation);
          particle.position.add(
            particle.velocity.clone().multiplyScalar(delta)
          );
          particle.velocity.multiplyScalar(0.95); // Damping

          // Keep within cube bounds
          const cubeCenter =
            particle.homeCube === 'left' ? leftCubeCenter : rightCubeCenter;
          particle.position.x = THREE.MathUtils.clamp(
            particle.position.x,
            cubeCenter.x - HALF_CUBE,
            cubeCenter.x + HALF_CUBE
          );
          particle.position.y = THREE.MathUtils.clamp(
            particle.position.y,
            cubeCenter.y - HALF_CUBE,
            cubeCenter.y + HALF_CUBE
          );
          particle.position.z = THREE.MathUtils.clamp(
            particle.position.z,
            cubeCenter.z - HALF_CUBE,
            cubeCenter.z + HALF_CUBE
          );
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
        opacityAttr.setX(idx, particle.opacity * opacityScale);
      });

      posAttr.needsUpdate = true;
      typeAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
      opacityAttr.needsUpdate = true;

      return updatedParticles;
    });
  });

  return (
    <group>
      {/* Particles */}
      <points ref={pointsRef}>
        <primitive object={geometry} attach="geometry" />
        <primitive object={material} attach="material" />
      </points>

      {/* Middle zone visualization inside left cube */}
      <mesh
        ref={leftMiddleZoneRef}
        position={[leftCubeCenter.x, leftCubeCenter.y, leftCubeCenter.z]}
      >
        <boxGeometry
          args={[cubeSize * 1.1, middleZoneHeight, cubeSize * 1.1]}
        />
        <meshStandardMaterial
          color="#ffff00"
          transparent
          opacity={0.1 * opacityScale}
          emissive="#ffff00"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Middle zone visualization inside right cube */}
      <mesh
        ref={rightMiddleZoneRef}
        position={[rightCubeCenter.x, rightCubeCenter.y, rightCubeCenter.z]}
      >
        <boxGeometry
          args={[cubeSize * 1.1, middleZoneHeight, cubeSize * 1.1]}
        />
        <meshStandardMaterial
          color="#ffff00"
          transparent
          opacity={0.1 * opacityScale}
          emissive="#ffff00"
          emissiveIntensity={0.1}
        />
      </mesh>
    </group>
  );
}

function CubeBox({
  center,
  color,
  label,
  opacityScale = 1,
  showLabel = false,
}: {
  center: THREE.Vector3;
  color: string;
  label: string;
  opacityScale?: number;
  showLabel?: boolean;
}) {
  const easeOutBack = (x: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  };
  const s = 0.72 + 0.28 * easeOutBack(Math.max(0, Math.min(1, opacityScale)));
  return (
    <group
      position={center.toArray() as [number, number, number]}
      scale={[s, s, s]}
    >
      <mesh>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.9 * opacityScale}
        />
      </mesh>
      <mesh scale={[1.06, 1.06, 1.06]}>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshBasicMaterial
          color="#ffffff"
          wireframe
          transparent
          opacity={0.25 * opacityScale}
        />
      </mesh>
      {showLabel && (
        <Html position={[0, 0.35, 0]} center>
          <div
            style={{
              color: 'white',
              background: 'rgba(0,0,0,0.6)',
              padding: '4px 8px',
              borderRadius: 6,
              fontSize: 11,
              border: '1px solid rgba(255,255,255,0.12)',
              transform: 'translateY(-6px)',
            }}
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

function getSectorFlows(preset: Preset, sectors: SectorNode[]) {
  const byId: Record<SectorId, SectorNode> = {
    financials: sectors.find((s) => s.id === 'financials')!,
    technology: sectors.find((s) => s.id === 'technology')!,
    energy: sectors.find((s) => s.id === 'energy')!,
    utilities: sectors.find((s) => s.id === 'utilities')!,
  };

  if (preset === 'Risk-On') {
    // Risk-On: utilities -> energy -> financials -> technology
    return [
      { from: byId.utilities, to: byId.energy, strength: 0.9 },
      { from: byId.energy, to: byId.financials, strength: 0.85 },
      { from: byId.financials, to: byId.technology, strength: 0.95 },
    ];
  }
  // Risk-Off: tech -> financials -> energy -> utilities
  return [
    { from: byId.technology, to: byId.financials, strength: 0.9 },
    { from: byId.financials, to: byId.energy, strength: 0.85 },
    { from: byId.energy, to: byId.utilities, strength: 0.95 },
  ];
}

function getIntraSectorFlows(preset: Preset, intraSectors: IntraSectorNode[]) {
  const byId: Record<IntraSectorId, IntraSectorNode> = {
    megacaps: intraSectors.find((s) => s.id === 'megacaps')!,
    semiconductors: intraSectors.find((s) => s.id === 'semiconductors')!,
    cloud: intraSectors.find((s) => s.id === 'cloud')!,
  };

  if (preset === 'Risk-On') {
    // Risk-On: left to right - Mega-caps -> Semiconductors -> Cloud Computing
    return [
      { from: byId.megacaps, to: byId.semiconductors, strength: 0.9 },
      { from: byId.semiconductors, to: byId.cloud, strength: 0.95 },
    ];
  }
  // Risk-Off: right to left - Cloud Computing -> Semiconductors -> Mega-caps
  return [
    { from: byId.cloud, to: byId.semiconductors, strength: 0.9 },
    { from: byId.semiconductors, to: byId.megacaps, strength: 0.95 },
  ];
}
