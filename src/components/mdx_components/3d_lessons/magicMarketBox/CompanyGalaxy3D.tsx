
import { MutableRefObject, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, Sparkles } from '@react-three/drei';
import { useControls, LevaPanel, useCreateStore } from 'leva';
import * as THREE from 'three';

type Scenario = 'idle' | 'secondary' | 'atm' | 'warrants' | 'buyback';
type ViewMode = 'objective' | 'shareholder';

interface CompanyGalaxy3DProps {
  levaStore: ReturnType<typeof useCreateStore>;
}

interface SimulationState {
  floatScale: number;
  valueScale: number;
  dispenserLevel: number;
  ghostLevel: number;
  pipelineGlow: number;
  tapGlow: number;
  floodgateOpen: number;
  buybackPull: number;
}

const scenarioTargets: Record<Scenario, SimulationState> = {
  idle: {
    floatScale: 1,
    valueScale: 1,
    dispenserLevel: 0.85,
    ghostLevel: 1,
    pipelineGlow: 0.15,
    tapGlow: 0.1,
    floodgateOpen: 0,
    buybackPull: 0,
  },
  secondary: {
    floatScale: 1.45,
    valueScale: 0.72,
    dispenserLevel: 0.2,
    ghostLevel: 1,
    pipelineGlow: 0.85,
    tapGlow: 0.2,
    floodgateOpen: 1,
    buybackPull: 0,
  },
  atm: {
    floatScale: 1.2,
    valueScale: 0.9,
    dispenserLevel: 0.55,
    ghostLevel: 1,
    pipelineGlow: 0.4,
    tapGlow: 0.85,
    floodgateOpen: 0.25,
    buybackPull: 0,
  },
  warrants: {
    floatScale: 1.35,
    valueScale: 0.82,
    dispenserLevel: 0.35,
    ghostLevel: 0.25,
    pipelineGlow: 0.35,
    tapGlow: 0.3,
    floodgateOpen: 0.15,
    buybackPull: 0,
  },
  buyback: {
    floatScale: 0.78,
    valueScale: 1.35,
    dispenserLevel: 0.95,
    ghostLevel: 0.8,
    pipelineGlow: 0.1,
    tapGlow: 0.05,
    floodgateOpen: 0,
    buybackPull: 1,
  },
};

const scenarioSequence: Scenario[] = [
  'idle',
  'secondary',
  'atm',
  'warrants',
  'buyback',
];

const BASE_ORBIT_RADIUS = 3.2;
const GHOST_SHELL_RADIUS = 5.2;
const DISPENSER_POSITION = new THREE.Vector3(5.2, 0, 0);
const FINANCING_PARTNER_POSITION = new THREE.Vector3(9.2, -0.6, -1.8);

interface TransitParticle {
  progress: number;
  speed: number;
  start: THREE.Vector3;
  angle: number;
  elevation: number;
  wobble: number;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const createOrbitGeometry = (
  count: number,
  radiusMultiplier: number,
  verticalSpread = 0.4
) => {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const baseColor = new THREE.Color('#8fd3ff');
  const accentColor = new THREE.Color('#fff6f2');
  const temp = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI * verticalSpread;
    const radius =
      radiusMultiplier *
      (0.7 + Math.random() * 0.3) *
      (BASE_ORBIT_RADIUS * 0.3);

    const x = Math.cos(theta) * Math.cos(phi) * radius;
    const y = Math.sin(phi) * radius * 0.8;
    const z = Math.sin(theta) * Math.cos(phi) * radius;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    temp.copy(baseColor).lerp(accentColor, Math.random() * 0.4 + 0.1);
    colors[i * 3] = temp.r;
    colors[i * 3 + 1] = temp.g;
    colors[i * 3 + 2] = temp.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
};

const createDormantGrid = (columns = 5, rows = 4, layers = 3) => {
  const positions = new Float32Array(columns * rows * layers * 3);
  let i = 0;
  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      for (let z = 0; z < layers; z++) {
        positions[i++] = (x - columns / 2) * 0.35;
        positions[i++] = (y - rows / 2) * 0.35;
        positions[i++] = (z - layers / 2) * 0.35;
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return geometry;
};

export default function CompanyGalaxy3D({ levaStore }: CompanyGalaxy3DProps) {
  const [scenario, setScenario] = useState<Scenario>('idle');
  const [viewMode, setViewMode] = useState<ViewMode>('objective');

  const orbitGroupRef = useRef<THREE.Group>(null);
  const valueCrystalRef = useRef<THREE.Mesh>(null);
  const followerRef = useRef<THREE.Mesh>(null);
  const dispenserFillRef = useRef<THREE.Mesh>(null);
  const ghostShellRef = useRef<THREE.Mesh>(null);
  const pipelineMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const tapMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const floodgateRef = useRef<THREE.Mesh>(null);
  const financingMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  const floodgateFlowRef = useRef<THREE.InstancedMesh>(null);
  const tapFlowRef = useRef<THREE.InstancedMesh>(null);
  const warrantFlowRef = useRef<THREE.InstancedMesh>(null);

  const floodgateParticlesRef = useRef<TransitParticle[]>([]);
  const tapParticlesRef = useRef<TransitParticle[]>([]);
  const warrantParticlesRef = useRef<TransitParticle[]>([]);

  const dummyObject = useMemo(() => new THREE.Object3D(), []);
  const tempVecA = useMemo(() => new THREE.Vector3(), []);
  const tempVecB = useMemo(() => new THREE.Vector3(), []);

  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const stateRef = useRef<SimulationState>({ ...scenarioTargets.idle });
  const targetRef = useRef<SimulationState>({ ...scenarioTargets.idle });

  const [floatGeometry] = useState(() => createOrbitGeometry(1400, 1, 0.7));
  const [ghostGeometry] = useState(() => createOrbitGeometry(650, 1.35, 1));
  const [dormantGeometry] = useState(() => createDormantGrid());

  const floodgateGeo = useMemo(
    () => new THREE.SphereGeometry(0.12, 10, 10),
    []
  );
  const floodgateMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#7dfffc',
        emissive: '#7dfffc',
        emissiveIntensity: 0.8,
      }),
    []
  );
  const tapGeo = useMemo(() => new THREE.SphereGeometry(0.08, 10, 10), []);
  const tapMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#3effd0',
        emissive: '#3effd0',
        emissiveIntensity: 0.7,
      }),
    []
  );
  const warrantGeo = useMemo(() => new THREE.SphereGeometry(0.1, 10, 10), []);
  const warrantMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#e1b5ff',
        emissive: '#d38bff',
        emissiveIntensity: 0.6,
      }),
    []
  );

  const { floatSpeed, heartbeat, sparkles, autoCycle, cycleSeconds } =
    useControls(
      'Company Galaxy Controls',
      {
        floatSpeed: {
          value: 0.35,
          min: 0.1,
          max: 1,
          step: 0.05,
          label: 'Orbit Speed',
        },
        heartbeat: {
          value: 1,
          min: 0.4,
          max: 1.6,
          step: 0.05,
          label: 'Crystal Pulse',
        },
        sparkles: {
          value: 1,
          min: 0.4,
          max: 2,
          step: 0.1,
          label: 'Sparkle Density',
        },
        autoCycle: { value: false, label: 'Auto Cycle Scenarios' },
        cycleSeconds: {
          value: 9,
          min: 4,
          max: 20,
          step: 1,
          label: 'Seconds per Scene',
        },
      },
      { store: levaStore }
    );

  const timelineRef = useRef(0);
  const cycleIndexRef = useRef(0);
  const atmTimerRef = useRef(0);

  useEffect(() => {
    targetRef.current = { ...scenarioTargets[scenario] };
    if (scenario === 'secondary') {
      spawnFloodgateWave(90);
    }
    if (scenario === 'warrants') {
      spawnWarrantFlow(70);
    }
  }, [scenario]);

  useEffect(() => {
    camera.position.set(8, 4.5, 15);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useEffect(() => {
    if (viewMode === 'objective') {
      controlsRef.current?.enableDamping &&
        (controlsRef.current.enableDamping = true);
      controlsRef.current?.enabled && (controlsRef.current.enabled = true);
      camera.position.set(8, 4.5, 15);
      camera.lookAt(0, 0, 0);
    } else {
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }
    }
  }, [viewMode, camera]);

  const spawnFloodgateWave = (count: number) => {
    for (
      let i = 0;
      i < count && floodgateParticlesRef.current.length < 160;
      i++
    ) {
      floodgateParticlesRef.current.push({
        progress: Math.random() * 0.2,
        speed: 0.3 + Math.random() * 0.25,
        start: new THREE.Vector3(
          DISPENSER_POSITION.x - 0.3 + Math.random() * 0.4,
          -0.8 + Math.random() * 1.6,
          (Math.random() - 0.5) * 1.2
        ),
        angle: Math.random() * Math.PI * 2,
        elevation: 0.4 + Math.random() * 0.6,
        wobble: (Math.random() - 0.5) * 0.6,
      });
    }
  };

  const spawnTapDroplets = (count: number) => {
    for (let i = 0; i < count && tapParticlesRef.current.length < 80; i++) {
      tapParticlesRef.current.push({
        progress: 0,
        speed: 0.25 + Math.random() * 0.2,
        start: new THREE.Vector3(
          DISPENSER_POSITION.x + 1.1,
          -0.35 + Math.random() * 0.2,
          0.4 + (Math.random() - 0.5) * 0.4
        ),
        angle: Math.random() * Math.PI * 2,
        elevation: 0.2 + Math.random() * 0.3,
        wobble: (Math.random() - 0.5) * 0.8,
      });
    }
  };

  const spawnWarrantFlow = (count: number) => {
    for (
      let i = 0;
      i < count && warrantParticlesRef.current.length < 100;
      i++
    ) {
      warrantParticlesRef.current.push({
        progress: Math.random() * 0.3,
        speed: 0.3 + Math.random() * 0.25,
        start: new THREE.Vector3(
          (Math.random() * 2 - 1) * GHOST_SHELL_RADIUS * 0.95,
          (Math.random() * 2 - 1) * GHOST_SHELL_RADIUS * 0.45,
          (Math.random() * 2 - 1) * GHOST_SHELL_RADIUS * 0.95
        ),
        angle: Math.random() * Math.PI * 2,
        elevation: 0.6 + Math.random() * 0.6,
        wobble: (Math.random() - 0.5) * 1,
      });
    }
  };

  const updateInstancedFlow = (
    mesh: THREE.InstancedMesh | null,
    store: MutableRefObject<TransitParticle[]>,
    cap: number,
    delta: number,
    scale: number,
    type: 'floodgate' | 'tap' | 'warrant'
  ) => {
    if (!mesh) return;
    const particles = store.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].progress += delta * particles[i].speed;
      if (particles[i].progress >= 1) {
        particles.splice(i, 1);
      }
    }

    const orbitRadius = BASE_ORBIT_RADIUS * stateRef.current.floatScale;

    for (let i = 0; i < cap; i++) {
      const particle = particles[i];
      if (!particle) {
        dummyObject.position.set(9999, 9999, 9999);
        dummyObject.scale.set(0, 0, 0);
        dummyObject.updateMatrix();
        mesh.setMatrixAt(i, dummyObject.matrix);
        continue;
      }
      const t = easeOutCubic(THREE.MathUtils.clamp(particle.progress, 0, 1));
      tempVecA.copy(particle.start);
      if (type === 'warrant') {
        tempVecB.set(
          Math.cos(particle.angle) * orbitRadius * 0.9,
          Math.sin(particle.angle * 0.6) * 0.8,
          Math.sin(particle.angle) * orbitRadius * 0.9
        );
      } else {
        tempVecB.set(
          Math.cos(particle.angle) * orbitRadius,
          Math.sin(particle.angle * 0.4) * 0.65,
          Math.sin(particle.angle) * orbitRadius
        );
      }
      const eased = tempVecA.lerp(tempVecB, t);
      eased.y += Math.sin(t * Math.PI) * particle.elevation;
      eased.z += particle.wobble * (1 - t);

      dummyObject.position.copy(eased);
      dummyObject.scale.setScalar(scale);
      dummyObject.updateMatrix();
      mesh.setMatrixAt(i, dummyObject.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };

  useFrame((state, delta) => {
    const current = stateRef.current;
    const target = targetRef.current;
    const keys = Object.keys(current) as (keyof SimulationState)[];
    const damping = 1 - Math.pow(0.001, delta * 60);
    keys.forEach((key) => {
      current[key] += (target[key] - current[key]) * damping;
    });

    if (autoCycle) {
      timelineRef.current += delta;
      if (timelineRef.current >= cycleSeconds) {
        timelineRef.current = 0;
        cycleIndexRef.current =
          (cycleIndexRef.current + 1) % scenarioSequence.length;
        setScenario(scenarioSequence[cycleIndexRef.current]);
      }
    } else {
      timelineRef.current = 0;
    }

    if (scenario === 'atm') {
      atmTimerRef.current += delta;
      if (atmTimerRef.current > 0.7) {
        atmTimerRef.current = 0;
        spawnTapDroplets(5);
      }
    } else {
      atmTimerRef.current = 0;
    }

    if (orbitGroupRef.current) {
      orbitGroupRef.current.scale.setScalar(current.floatScale);
      orbitGroupRef.current.rotation.y +=
        delta * floatSpeed * (1 + current.buybackPull * 0.35);
    }

    if (valueCrystalRef.current) {
      const baseScale =
        1.1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.06 * heartbeat;
      valueCrystalRef.current.scale.setScalar(baseScale * current.valueScale);
      const material = valueCrystalRef.current
        .material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 1.4 * current.valueScale;
    }

    if (dispenserFillRef.current) {
      dispenserFillRef.current.scale.y = current.dispenserLevel * 1.2;
      dispenserFillRef.current.position.y = -0.7 + current.dispenserLevel * 0.6;
      const mat = dispenserFillRef.current
        .material as THREE.MeshStandardMaterial;
      mat.opacity = 0.35 + current.dispenserLevel * 0.4;
    }

    if (ghostShellRef.current) {
      const mat = ghostShellRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.2 + current.ghostLevel * 0.35;
      ghostShellRef.current.scale.setScalar(
        0.95 + (1 - current.ghostLevel) * 0.08
      );
    }

    if (pipelineMaterialRef.current) {
      pipelineMaterialRef.current.emissiveIntensity =
        0.3 + current.pipelineGlow * 0.9;
    }

    if (tapMaterialRef.current) {
      tapMaterialRef.current.emissiveIntensity = 0.2 + current.tapGlow * 1.2;
    }

    if (floodgateRef.current) {
      floodgateRef.current.rotation.z = (-Math.PI / 2) * current.floodgateOpen;
    }

    if (financingMaterialRef.current) {
      financingMaterialRef.current.emissiveIntensity =
        0.4 + current.pipelineGlow * 0.6;
    }

    updateInstancedFlow(
      floodgateFlowRef.current,
      floodgateParticlesRef,
      160,
      delta,
      0.18,
      'floodgate'
    );
    updateInstancedFlow(
      tapFlowRef.current,
      tapParticlesRef,
      80,
      delta,
      0.13,
      'tap'
    );
    updateInstancedFlow(
      warrantFlowRef.current,
      warrantParticlesRef,
      100,
      delta,
      0.15,
      'warrant'
    );

    if (viewMode === 'shareholder' && followerRef.current) {
      const targetPosition = new THREE.Vector3();
      followerRef.current.getWorldPosition(targetPosition);
      const cameraTarget = targetPosition
        .clone()
        .add(new THREE.Vector3(0.4, 0.3, 0.8));
      camera.position.lerp(cameraTarget, 0.08);
      camera.lookAt(0, 0, 0);
    }
  });

  const renderLabel = (
    text: string,
    position: [number, number, number],
    align: 'left' | 'right' | 'center' = 'center'
  ) => (
    <Html position={position} center style={{ pointerEvents: 'none' }}>
      <div
        style={{
          background: 'rgba(6, 8, 15, 0.8)',
          color: '#dce9ff',
          padding: '6px 10px',
          borderRadius: 6,
          border: '1px solid rgba(126,180,255,0.4)',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          textAlign: align,
        }}
      >
        {text}
      </div>
    </Html>
  );

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enabled={viewMode === 'objective'}
        enablePan
        enableZoom
      />

      <Html fullscreen prepend zIndexRange={[50, 0]}>
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            width: '320px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              background: 'rgba(7, 10, 18, 0.85)',
              border: '1px solid rgba(90,130,255,0.4)',
              borderRadius: 12,
              padding: '12px',
              color: 'white',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                opacity: 0.7,
              }}
            >
              Company Galaxy
            </div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 600,
                marginBottom: '10px',
              }}
            >
              {scenario === 'idle'
                ? 'Equilibrium'
                : scenario === 'secondary'
                ? 'Secondary Offering'
                : scenario === 'atm'
                ? 'ATM Program'
                : scenario === 'warrants'
                ? 'Warrants Exercised'
                : 'Share Buyback'}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '6px',
              }}
            >
              <button
                onClick={() => setScenario('secondary')}
                style={{
                  padding: '8px',
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.2)',
                  background:
                    scenario === 'secondary'
                      ? 'linear-gradient(135deg,#ff8aa6,#ff5555)'
                      : 'rgba(255,85,85,0.15)',
                  color: 'white',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Launch Secondary
              </button>
              <button
                onClick={() => setScenario('atm')}
                style={{
                  padding: '8px',
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.2)',
                  background:
                    scenario === 'atm'
                      ? 'linear-gradient(135deg,#63ffd9,#24b3ff)'
                      : 'rgba(48,174,255,0.15)',
                  color: 'white',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Activate ATM Tap
              </button>
              <button
                onClick={() => setScenario('warrants')}
                style={{
                  padding: '8px',
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.2)',
                  background:
                    scenario === 'warrants'
                      ? 'linear-gradient(135deg,#d69bff,#944bff)'
                      : 'rgba(209,121,255,0.18)',
                  color: 'white',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Exercise Warrants
              </button>
              <button
                onClick={() => setScenario('buyback')}
                style={{
                  padding: '8px',
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.2)',
                  background:
                    scenario === 'buyback'
                      ? 'linear-gradient(135deg,#8bff7a,#05c96b)'
                      : 'rgba(31,203,143,0.18)',
                  color: 'white',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Initiate Buyback
              </button>
            </div>
            <div style={{ marginTop: '10px', display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setViewMode('objective')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.2)',
                  background:
                    viewMode === 'objective'
                      ? 'rgba(118,168,255,0.4)'
                      : 'transparent',
                  color: 'white',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Objective View
              </button>
              <button
                onClick={() => setViewMode('shareholder')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.2)',
                  background:
                    viewMode === 'shareholder'
                      ? 'rgba(255,214,120,0.35)'
                      : 'transparent',
                  color: 'white',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Shareholder View
              </button>
            </div>
          </div>
        </div>
      </Html>

      <Html
        fullscreen
        zIndexRange={[1000, 0]}
        prepend
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            transform: 'scale(0.95)',
            transformOrigin: 'top right',
            pointerEvents: 'none',
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
          <div style={{ pointerEvents: 'auto', display: 'inline-block' }}>
            <LevaPanel
              store={levaStore}
              titleBar={{ title: 'Galaxy Parameters' }}
              fill={false}
              collapsed={false}
            />
          </div>
        </div>
      </Html>

      <group>
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -2, 0]}
          receiveShadow
        >
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#0c0f17" roughness={1} />
        </mesh>
      </group>

      <group ref={orbitGroupRef}>
        <points geometry={floatGeometry}>
          <pointsMaterial
            size={0.12}
            sizeAttenuation
            transparent
            opacity={0.85}
            depthWrite={false}
            vertexColors
            blending={THREE.AdditiveBlending}
          />
        </points>
        <mesh
          ref={followerRef}
          position={[BASE_ORBIT_RADIUS, 0.2, 0]}
          castShadow
        >
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshStandardMaterial
            color="#f9fbff"
            emissive="#8ab0ff"
            emissiveIntensity={1.6}
          />
        </mesh>
      </group>

      <mesh ref={valueCrystalRef} castShadow>
        <icosahedronGeometry args={[1.1, 0]} />
        <meshStandardMaterial
          color="#77c9ff"
          emissive="#4ec0ff"
          emissiveIntensity={1.2}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>

      {sparkles > 0 && (
        <Sparkles
          count={Math.floor(120 * sparkles)}
          scale={[4, 4, 4]}
          size={2}
          speed={0.3}
          color="#a7f5ff"
        />
      )}

      <group position={[DISPENSER_POSITION.x, 0, 0]}>
        <mesh position={[0, 0, 0]} scale={[2.2, 1.8, 1.4]}>
          <boxGeometry />
          <meshBasicMaterial
            wireframe
            color="#6fe4ff"
            transparent
            opacity={0.4}
          />
        </mesh>
        <mesh ref={dispenserFillRef} position={[0, -0.7, 0]}>
          <boxGeometry args={[2.1, 1.2, 1.3]} />
          <meshStandardMaterial color="#9ab3c9" transparent opacity={0.6} />
        </mesh>
        <points geometry={dormantGeometry}>
          <pointsMaterial
            size={0.08}
            color="#cfd8e6"
            opacity={0.9}
            transparent
          />
        </points>
        <mesh
          ref={floodgateRef}
          position={[-1.1, -0.3, 0]}
          rotation={[0, 0, 0]}
        >
          <boxGeometry args={[0.2, 1.4, 1.3]} />
          <meshStandardMaterial
            color="#53d8ff"
            emissive="#53d8ff"
            emissiveIntensity={0.6}
          />
        </mesh>
        <mesh position={[1.2, -0.4, 0.4]}>
          <cylinderGeometry args={[0.15, 0.15, 0.5, 16]} />
          <meshStandardMaterial
            color="#3ec0ff"
            emissive="#51d6ff"
            emissiveIntensity={0.3}
          />
        </mesh>
        <mesh position={[1.5, -0.5, 0.4]}>
          <torusGeometry args={[0.2, 0.08, 16, 32, Math.PI]} />
          <meshStandardMaterial
            ref={tapMaterialRef}
            color="#54ffe9"
            emissive="#54ffe9"
            emissiveIntensity={0.5}
          />
        </mesh>
        {renderLabel('Share Dispenser (Shelf)', [0, 1.4, 0])}
      </group>

      <group>
        <mesh ref={ghostShellRef} scale={[1, 1, 1]}>
          <sphereGeometry args={[GHOST_SHELL_RADIUS, 42, 42]} />
          <meshBasicMaterial
            color="#b997ff"
            wireframe
            transparent
            opacity={0.3}
          />
        </mesh>
        <points geometry={ghostGeometry}>
          <pointsMaterial
            size={0.08}
            color="#e6cffb"
            transparent
            opacity={0.4}
            depthWrite={false}
          />
        </points>
        {renderLabel('Ghost Shell (Warrants & Convertibles)', [
          0,
          GHOST_SHELL_RADIUS + 0.7,
          0,
        ])}
      </group>

      <mesh
        position={[
          FINANCING_PARTNER_POSITION.x,
          FINANCING_PARTNER_POSITION.y,
          FINANCING_PARTNER_POSITION.z,
        ]}
        castShadow
      >
        <dodecahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial
          ref={financingMaterialRef}
          color="#ff9d7f"
          emissive="#ff6f61"
          emissiveIntensity={0.6}
        />
      </mesh>
      {renderLabel('Financing Partner / PIPE Desk', [
        FINANCING_PARTNER_POSITION.x,
        FINANCING_PARTNER_POSITION.y + 1.1,
        FINANCING_PARTNER_POSITION.z,
      ])}

      {/* Pipeline removed per request */}

      <instancedMesh
        ref={floodgateFlowRef}
        args={[floodgateGeo, floodgateMat, 160]}
      />

      <instancedMesh ref={tapFlowRef} args={[tapGeo, tapMat, 80]} />

      <instancedMesh
        ref={warrantFlowRef}
        args={[warrantGeo, warrantMat, 100]}
      />
    </>
  );
}
