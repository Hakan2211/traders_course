
import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import { useControls, LevaPanel, useCreateStore } from 'leva';
import * as THREE from 'three';

interface ExecutionStrategies3DProps {
  levaStore: ReturnType<typeof useCreateStore>;
}

// Visual palette
const COLOR_BUY = '#26A69A';
const COLOR_SELL = '#EF5350';
const COLOR_NEUTRAL = '#8D94A6';
const COLOR_RAIL_BID = '#26A69A';
const COLOR_RAIL_ASK = '#EF5350';
const COLOR_INFO = '#4a9eff';

// Scene sizing
const BOX_SIZE = 4.0;
const HALF_BOX = BOX_SIZE / 2;
const SPREAD_WIDTH = BOX_SIZE * 0.28;
const RAIL_THICKNESS = 0.05;
const RAIL_DEPTH = BOX_SIZE * 1.05;
const RAIL_HEIGHT = BOX_SIZE * 1.25;

// Easing helpers
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

// Point shader (shared language with other 3D lessons)
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
      vColor = vec3(0.55, 0.58, 0.65);        // neutral
    } else if (particleType < 1.5) {
      vColor = vec3(0.94, 0.33, 0.31);        // seller
    } else {
      vColor = vec3(0.15, 0.75, 0.65);        // buyer
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

type ParticleType = 0 | 1 | 2; // 0 neutral, 1 seller (red), 2 buyer (green)
interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  target: THREE.Vector3;
  type: ParticleType;
  size: number;
  opacity: number;
  phase: number;
}

// Special projectiles / effects
interface SweepProjectile {
  mesh: THREE.Mesh | null;
  active: boolean;
  progress: number; // 0..1 from right rail through spread and beyond
  speed: number;
  y: number;
  z: number;
  size: number; // controls trail length and thickness
}

interface Shockwave {
  mesh: THREE.Mesh | null;
  active: boolean;
  x: number;
  y: number;
  z: number;
  radius: number;
  life: number; // 0..1
  side: 'ask' | 'bid';
}

interface SpoofWall {
  mesh: THREE.Mesh | null;
  active: boolean;
  side: 'ask' | 'bid';
  y: number;
  z: number;
  progress: number; // 0..1 appear → present → vanish
  state: 'appearing' | 'present' | 'vanishing';
}

interface Ping {
  mesh: THREE.Mesh | null;
  active: boolean;
  side: 'ask' | 'bid';
  progress: number; // out-and-back
  speed: number;
  y: number;
  z: number;
  returning: boolean;
  hitHeavy: boolean;
}

type Scenario = 'sweep' | 'spoof' | 'absorption' | 'pinging' | 'combined';

export default function ExecutionStrategies3D({
  levaStore,
}: ExecutionStrategies3DProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const rootRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  // Particle field (shared ambient)
  const [particles, setParticles] = useState<Particle[]>([]);

  // Scene controls (developer)
  const {
    scenario,
    particleCount,
    particleSize,
    sweepStrength,
    pingFrequency,
    spoofIntensity,
    autoPlay,
    cameraAutoFocus,
    showHUD,
  } = useControls(
    'Execution Strategies (dev)',
    {
      scenario: {
        value: 'sweep' as Scenario,
        options: ['sweep', 'spoof', 'absorption', 'pinging', 'combined'],
        label: 'Scenario',
      },
      particleCount: { value: 5200, min: 1500, max: 15000, step: 500 },
      particleSize: { value: 0.18, min: 0.06, max: 0.4, step: 0.01 },
      sweepStrength: { value: 0.7, min: 0.1, max: 1.0, step: 0.05 },
      pingFrequency: { value: 0.8, min: 0.1, max: 2.5, step: 0.1 },
      spoofIntensity: { value: 0.6, min: 0.2, max: 1.0, step: 0.05 },
      autoPlay: { value: true },
      cameraAutoFocus: { value: false },
      showHUD: { value: true },
    },
    { store: levaStore }
  ) as {
    scenario: Scenario;
    particleCount: number;
    particleSize: number;
    sweepStrength: number;
    pingFrequency: number;
    spoofIntensity: number;
    autoPlay: boolean;
    cameraAutoFocus: boolean;
    showHUD: boolean;
  };

  // Learner controls
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1); // 0.25..2x
  const [caption, setCaption] = useState(''); // bottom-center narration
  const [stepIdx, setStepIdx] = useState(0);
  const [time, setTime] = useState(0); // scenario-local time (seconds)
  const [timeline, setTimeline] = useState(0); // 0..1 scrubber

  // HUD metrics (simple running approximations)
  const printsRef = useRef(0);
  const lastPrintsTRef = useRef(0);
  const [printsPerSec, setPrintsPerSec] = useState(0);
  const [deltaCVD, setDeltaCVD] = useState(0);
  const [flags, setFlags] = useState<{
    iceberg: boolean;
    spoof: boolean;
    sweep: boolean;
  }>({ iceberg: false, spoof: false, sweep: false });

  // Geometry (ambient particles)
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

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
  }, []);

  // Initialize ambient particles
  useEffect(() => {
    const arr: Particle[] = [];
    const half = HALF_BOX * 0.95;
    for (let i = 0; i < particleCount; i++) {
      const pos = new THREE.Vector3(
        (Math.random() * 2 - 1) * half,
        (Math.random() * 2 - 1) * half,
        (Math.random() * 2 - 1) * half
      );
      const t: ParticleType = 0;
      arr.push({
        position: pos.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        ),
        target: pos.clone(),
        type: t,
        size: particleSize,
        opacity: 1.0,
        phase: Math.random() * Math.PI * 2,
      });
    }
    setParticles(arr);
  }, [particleCount, particleSize]);

  // Special effect pools
  const sweepPoolRef = useRef<SweepProjectile[]>([]);
  const sweepMeshesRef = useRef<THREE.Mesh[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const shockwaveMeshesRef = useRef<THREE.Mesh[]>([]);
  const spoofWallsRef = useRef<SpoofWall[]>([]);
  const spoofWallMeshesRef = useRef<THREE.Mesh[]>([]);
  const pingsRef = useRef<Ping[]>([]);
  const pingMeshesRef = useRef<THREE.Mesh[]>([]);

  // Rails flash intensities
  const askRailFlashRef = useRef(0);
  const bidRailFlashRef = useRef(0);

  // Camera targets
  const camFromRef = useRef(new THREE.Vector3(0, 1.6, 7));
  const camToRef = useRef(new THREE.Vector3(0, 1.6, 7));
  const camLerpRef = useRef(1);
  const lookAtRef = useRef(new THREE.Vector3(0, 0, 0));

  function queueCameraMove(targetPos: THREE.Vector3, lookAt?: THREE.Vector3) {
    camFromRef.current.copy(camera.position as THREE.Vector3);
    camToRef.current.copy(targetPos);
    camLerpRef.current = 0;
    if (lookAt) lookAtRef.current.copy(lookAt);
  }

  // Build effect meshes pools on mount
  useEffect(() => {
    // Sweep pool
    const sweepCount = 50;
    sweepPoolRef.current = new Array(sweepCount).fill(null).map(() => ({
      mesh: null,
      active: false,
      progress: 0,
      speed: 0.8,
      y: 0,
      z: 0,
      size: 1,
    }));
    // Shockwaves
    const shockCount = 16;
    shockwavesRef.current = new Array(shockCount).fill(null).map(() => ({
      mesh: null,
      active: false,
      x: 0,
      y: 0,
      z: 0,
      radius: 0,
      life: 0,
      side: 'ask',
    }));
    // Spoof walls
    const wallCount = 8;
    spoofWallsRef.current = new Array(wallCount).fill(null).map(() => ({
      mesh: null,
      active: false,
      side: Math.random() < 0.5 ? 'ask' : 'bid',
      y: 0,
      z: 0,
      progress: 0,
      state: 'appearing',
    }));
    // Pings
    const pingCount = 24;
    pingsRef.current = new Array(pingCount).fill(null).map(() => ({
      mesh: null,
      active: false,
      side: Math.random() < 0.5 ? 'ask' : 'bid',
      progress: 0,
      speed: 1.0,
      y: 0,
      z: 0,
      returning: false,
      hitHeavy: false,
    }));
  }, []);

  // Scenario script state
  const scenarioTitle = {
    sweep: 'Sweeping the Book — Massive Market Order',
    spoof: 'Layering / Spoofing — The Theatrics',
    absorption: 'Absorption — Predator Defense',
    pinging: 'Pinging — Probing for Liquidity',
    combined: 'Combined Hunt Replay — Full Story',
  }[scenario];

  // Helper spawners
  function spawnSweepBurst(strength: number) {
    const count = Math.floor(10 + strength * 40);
    let spawned = 0;
    for (let i = 0; i < sweepPoolRef.current.length && spawned < count; i++) {
      const s = sweepPoolRef.current[i];
      if (!s.active) {
        s.active = true;
        s.progress = 0;
        s.speed = 0.9 + Math.random() * 0.6;
        s.y = (Math.random() * 2 - 1) * HALF_BOX * 0.7;
        s.z = (Math.random() * 2 - 1) * HALF_BOX * 0.7;
        s.size = 0.6 + Math.random() * 1.6;
        spawned++;
      }
    }
    // Flag + metric
    setFlags((f) => ({ ...f, sweep: true }));
  }

  function spawnSpoofWalls(intensity: number) {
    const count = Math.max(1, Math.floor(intensity * 6));
    let spawned = 0;
    for (let i = 0; i < spoofWallsRef.current.length && spawned < count; i++) {
      const w = spoofWallsRef.current[i];
      if (!w.active) {
        w.active = true;
        w.side = Math.random() < 0.5 ? 'ask' : 'bid';
        w.y = (Math.random() * 2 - 1) * HALF_BOX * 0.7;
        w.z = (Math.random() * 2 - 1) * HALF_BOX * 0.7;
        w.progress = 0;
        w.state = 'appearing';
        spawned++;
      }
    }
    setFlags((f) => ({ ...f, spoof: true }));
  }

  function spawnPingBurst(freq: number) {
    const count = Math.max(1, Math.floor(freq * 8));
    let spawned = 0;
    for (let i = 0; i < pingsRef.current.length && spawned < count; i++) {
      const p = pingsRef.current[i];
      if (!p.active) {
        p.active = true;
        p.side = Math.random() < 0.5 ? 'ask' : 'bid';
        p.progress = 0;
        p.returning = false;
        p.hitHeavy = Math.random() < 0.55; // 55% chance we mark "heavy"
        p.speed = 1.2 + Math.random() * 0.8;
        p.y = (Math.random() * 2 - 1) * HALF_BOX * 0.4;
        p.z = (Math.random() * 2 - 1) * HALF_BOX * 0.4;
        spawned++;
      }
    }
  }

  function shockwaveAt(x: number, y: number, z: number, side: 'ask' | 'bid') {
    for (let i = 0; i < shockwavesRef.current.length; i++) {
      const sw = shockwavesRef.current[i];
      if (!sw.active) {
        sw.active = true;
        sw.x = x;
        sw.y = y;
        sw.z = z;
        sw.radius = 0.1;
        sw.life = 0;
        sw.side = side;
        break;
      }
    }
  }

  // Ambient + scenario update loop
  useFrame((state, delta) => {
    const dt = (playing ? delta : 0) * THREE.MathUtils.clamp(speed, 0.1, 2.5);

    // Camera interpolation
    if (camLerpRef.current < 1) {
      camLerpRef.current = Math.min(1, camLerpRef.current + dt * 1.5);
      const t = easeInOutCubic(camLerpRef.current);
      camera.position.lerpVectors(camFromRef.current, camToRef.current, t);
      camera.lookAt(lookAtRef.current);
    }

    // Rail flash decay
    askRailFlashRef.current = Math.max(0, askRailFlashRef.current - dt * 1.8);
    bidRailFlashRef.current = Math.max(0, bidRailFlashRef.current - dt * 1.8);

    // Ambient particle movement
    if (pointsRef.current) {
      const geom = pointsRef.current.geometry;
      const pos = geom.getAttribute('position') as THREE.BufferAttribute;
      const typ = geom.getAttribute('particleType') as THREE.BufferAttribute;
      const siz = geom.getAttribute('particleSize') as THREE.BufferAttribute;
      const opa = geom.getAttribute('particleOpacity') as THREE.BufferAttribute;
      if (pos && typ && siz && opa) {
        setParticles((prev) => {
          const updated = [...prev];
          for (let i = 0; i < updated.length; i++) {
            const p = updated[i];
            // Soft drift toward target with small oscillation
            const osc = new THREE.Vector3(
              Math.sin(state.clock.elapsedTime * 1.3 + p.phase) * 0.22,
              Math.cos(state.clock.elapsedTime * 1.1 + p.phase) * 0.22,
              Math.sin(state.clock.elapsedTime * 0.9 + p.phase) * 0.22
            );
            p.position.lerp(p.target.clone().add(osc), 0.06);
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
            pos.setXYZ(i, p.position.x, p.position.y, p.position.z);
            typ.setX(i, p.type);
            siz.setX(i, p.size * 10);
            opa.setX(i, p.opacity);
          }
          pos.needsUpdate = true;
          typ.needsUpdate = true;
          siz.needsUpdate = true;
          opa.needsUpdate = true;
          return updated;
        });
      }
    }

    // Scenario time keeping
    if (autoPlay) {
      setTime((t) => t + dt);
    }
    // Update prints/s (approx)
    const tNow = state.clock.elapsedTime;
    if (tNow - lastPrintsTRef.current >= 1) {
      setPrintsPerSec(printsRef.current);
      printsRef.current = 0;
      lastPrintsTRef.current = tNow;
    }

    // Scenario logic
    if (scenario === 'sweep' || scenario === 'combined') {
      // Staging camera focus to the ask side at launch
      if (cameraAutoFocus && time < 2.5 && camLerpRef.current >= 1) {
        queueCameraMove(
          new THREE.Vector3(2.6, 0.9, 3.2),
          new THREE.Vector3(0, 0, 0)
        );
      }
      // Launch a burst between 2.8..4.2s
      if (time > 2.8 && time < 4.2) {
        if (Math.random() < dt * 2.5) spawnSweepBurst(sweepStrength);
        setCaption(
          'Sweep in progress — levels will break if liquidity is thin.'
        );
      }
    }

    if (scenario === 'spoof' || scenario === 'combined') {
      // Periodically spawn spoof walls
      if (Math.random() < dt * (1.0 + spoofIntensity)) {
        spawnSpoofWalls(spoofIntensity);
      }
    }

    if (scenario === 'pinging' || scenario === 'combined') {
      if (Math.random() < dt * (1.2 * pingFrequency)) {
        spawnPingBurst(pingFrequency);
        setCaption('Probing for liquidity — pings map how heavy each side is.');
      }
    }

    if (scenario === 'absorption' || scenario === 'combined') {
      // Show iceberg flag
      setFlags((f) => ({ ...f, iceberg: true }));
      if (cameraAutoFocus && time > 6 && time < 7 && camLerpRef.current >= 1) {
        queueCameraMove(
          new THREE.Vector3(-2.6, 1.2, 3.2),
          new THREE.Vector3(0, 0, 0)
        );
      }
      if (time > 6.0 && time < 8.0) {
        setCaption('Absorption at defended level — heavy sells, price holds.');
      }
      if (time > 8.0 && time < 9.4) {
        setCaption('Reversal — predator flips to the attack.');
      }
    }

    // Update sweep projectiles
    sweepPoolRef.current.forEach((s, i) => {
      const mesh = sweepMeshesRef.current[i];
      if (!mesh) return;
      if (!s.active) {
        mesh.visible = false;
        return;
      }
      s.progress += dt * (0.6 + s.speed);
      const xStart = SPREAD_WIDTH / 2 + 0.6;
      const xEnd = -SPREAD_WIDTH / 2 - 0.4;
      const x = THREE.MathUtils.lerp(xStart, xEnd, Math.min(1, s.progress));
      mesh.visible = true;
      mesh.position.set(x, s.y, s.z);
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.opacity =
        0.6 + Math.sin((1 - Math.min(1, s.progress)) * Math.PI) * 0.2;
      // On crossing the spread edge, trigger shockwave + rail flash + metrics
      if (Math.abs(x) < 0.02) {
        askRailFlashRef.current = 1.0; // ask side flash (sweep originates toward ask)
        shockwaveAt(0, s.y, s.z, 'ask');
        printsRef.current += 12;
        setDeltaCVD((v) => v + 50);
      }
      if (s.progress >= 1) {
        s.active = false;
        mesh.visible = false;
      }
    });

    // Update shockwaves
    shockwavesRef.current.forEach((sw, i) => {
      const mesh = shockwaveMeshesRef.current[i];
      if (!mesh) return;
      if (!sw.active) {
        mesh.visible = false;
        return;
      }
      sw.life += dt * 1.8;
      sw.radius += dt * 1.6;
      const alpha = Math.max(0, 1 - sw.life);
      mesh.visible = true;
      mesh.position.set(sw.x, sw.y, sw.z);
      mesh.scale.setScalar(1 + sw.radius);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.45 * alpha;
      if (sw.life >= 1) {
        sw.active = false;
        mesh.visible = false;
      }
    });

    // Update spoof walls
    spoofWallsRef.current.forEach((w, i) => {
      const mesh = spoofWallMeshesRef.current[i];
      if (!mesh) return;
      if (!w.active) {
        mesh.visible = false;
        return;
      }
      mesh.visible = true;
      // State machine: appear -> present -> vanish
      if (w.state === 'appearing') {
        w.progress += dt / 0.45; // ~450ms
        const t = easeOutCubic(Math.min(1, w.progress));
        mesh.scale.set(1, t, 1);
        mesh.position.set(
          w.side === 'bid' ? -SPREAD_WIDTH / 2 - 0.2 : SPREAD_WIDTH / 2 + 0.2,
          w.y,
          w.z
        );
        if (w.progress >= 1) {
          w.state = 'present';
          w.progress = 0;
        }
      } else if (w.state === 'present') {
        w.progress += dt; // stay ~0.8–1.2s
        if (w.progress >= 0.8 + Math.random() * 0.4) {
          w.state = 'vanishing';
          w.progress = 0;
        }
      } else {
        // vanish
        w.progress += dt / 0.2; // 200ms
        const t = easeOutQuart(Math.min(1, w.progress));
        mesh.scale.set(1, 1 - t, 1);
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.opacity = 0.5 * (1 - t);
        if (w.progress >= 1) {
          w.active = false;
          mesh.visible = false;
        }
      }
    });

    // Update pings
    pingsRef.current.forEach((p, i) => {
      const mesh = pingMeshesRef.current[i];
      if (!mesh) return;
      if (!p.active) {
        mesh.visible = false;
        return;
      }
      mesh.visible = true;
      const dir = p.side === 'ask' ? 1 : -1;
      const edge = (SPREAD_WIDTH / 2) * dir;
      if (!p.returning) {
        p.progress += (dt * p.speed) / 0.18; // out
        const x = THREE.MathUtils.lerp(0, edge, Math.min(1, p.progress));
        mesh.position.set(x, p.y, p.z);
        if (p.progress >= 1) {
          // Hit the rail
          if (p.side === 'ask') askRailFlashRef.current = 0.6;
          else bidRailFlashRef.current = 0.6;
          printsRef.current += 1;
          // Heavy → absorbed (fade), Thin → bounce (return with stronger pulse)
          if (p.hitHeavy) {
            // fade out quickly
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mat.opacity = Math.max(0, mat.opacity - dt * 4);
            if (mat.opacity <= 0.05) {
              p.active = false;
              mesh.visible = false;
            }
          } else {
            p.returning = true;
            p.progress = 0;
          }
        }
      } else {
        // returning
        p.progress += (dt * (p.speed * 1.1)) / 0.18;
        const x = THREE.MathUtils.lerp(edge, 0, Math.min(1, p.progress));
        mesh.position.set(x, p.y, p.z);
        if (p.progress >= 1) {
          p.active = false;
          mesh.visible = false;
          // nudge metrics
          setDeltaCVD((v) => v + (p.side === 'bid' ? 2 : -2));
        }
      }
    });
  });

  // Reset scene state on scenario change or manual step change
  useEffect(() => {
    setTime(0);
    setTimeline(0);
    setStepIdx(0);
    setCaption('');
    setFlags({ iceberg: false, spoof: false, sweep: false });
  }, [scenario]);

  // HUD details
  const shortDescription = {
    sweep:
      'A single massive order sweeps the ask, breaking levels when liquidity is thin.',
    spoof:
      'Large walls appear to influence behavior, then vanish before fills — spoofing.',
    absorption:
      'Heavy sells are absorbed at a defended level; price refuses to break.',
    pinging:
      'Small probes test depth; results inform whether to strike now or wait.',
    combined:
      'Integrated hunt: strike, cascade, absorption, reversal — a full cause-effect chain.',
  }[scenario];

  // Step handlers
  function handlePrevStep() {
    setStepIdx((s) => Math.max(0, s - 1));
    setTime(0);
  }
  function handleNextStep() {
    setStepIdx((s) => s + 1);
    setTime(0);
  }
  function handleScrub(val: number) {
    const v = THREE.MathUtils.clamp(val, 0, 1);
    setTimeline(v);
    // Optionally map into time windows based on scenario
    setTime(v * 12);
  }

  return (
    <>
      {/* Leva (dev) */}
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
            titleBar={{ title: 'Execution Strategies (dev)' }}
            collapsed={false}
          />
        </div>
      </Html>

      {/* Learner HUD */}
      {showHUD && (
        <Html fullscreen prepend zIndexRange={[95, 0]}>
          {/* Pointer-events routing wrapper: none at root, auto only on interactive blocks */}
          <div style={{ pointerEvents: 'none' }}>
            {/* Top-left HUD (non-interactive) */}
            <div
              style={{
                position: 'absolute',
                top: 14,
                left: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                color: 'white',
              }}
            >
              {/* Compact HUD panel */}
              <div
                style={{
                  background: 'rgba(12,14,22,0.76)',
                  border: '1px solid rgba(80,120,255,0.35)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  minWidth: 320,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
                  backdropFilter: 'blur(6px)',
                }}
              >
                <div style={{ fontWeight: 800, marginBottom: 6 }}>
                  {scenarioTitle}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'rgba(240,240,255,0.9)',
                    marginBottom: 8,
                  }}
                >
                  {shortDescription}
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    fontSize: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    Prints/s:{' '}
                    <span style={{ color: '#b7ffda' }}>{printsPerSec}</span>
                  </div>
                  <div>
                    Aggression Δ (CVD):{' '}
                    <span
                      style={{
                        color: deltaCVD >= 0 ? '#00ff9a' : '#ff6b6b',
                        fontWeight: 700,
                      }}
                    >
                      {deltaCVD >= 0 ? '+' : ''}
                      {deltaCVD}
                    </span>
                  </div>
                  <div>
                    Flags:{' '}
                    <span
                      style={{ color: flags.sweep ? '#ffd166' : '#9aa0a6' }}
                    >
                      Sweep
                    </span>{' '}
                    ·{' '}
                    <span
                      style={{ color: flags.iceberg ? '#64ffda' : '#9aa0a6' }}
                    >
                      Iceberg
                    </span>{' '}
                    ·{' '}
                    <span
                      style={{ color: flags.spoof ? '#fca5a5' : '#9aa0a6' }}
                    >
                      Spoof
                    </span>
                  </div>
                </div>
              </div>
              {/* Legend */}
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  fontSize: 12,
                  background: 'rgba(12,14,22,0.6)',
                  border: '1px solid rgba(130,130,150,0.35)',
                  borderRadius: 8,
                  padding: '6px 10px',
                  width: 'fit-content',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 10,
                      background: COLOR_BUY,
                      marginRight: 6,
                    }}
                  />
                  Buyer
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 10,
                      background: COLOR_SELL,
                      marginRight: 6,
                    }}
                  />
                  Seller
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 10,
                      background: COLOR_NEUTRAL,
                      marginRight: 6,
                    }}
                  />
                  Neutral
                </span>
              </div>
            </div>

            {/* Bottom center caption only */}
            {caption && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.75)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.15)',
                  padding: '6px 10px',
                  borderRadius: 8,
                  fontSize: 13,
                  maxWidth: 760,
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                {caption}
              </div>
            )}
          </div>
        </Html>
      )}

      {/* Ambient Points */}
      <points ref={pointsRef}>
        <primitive object={geometry} attach="geometry" />
        <primitive object={material} attach="material" />
      </points>

      {/* Outer glass box */}
      <mesh>
        <boxGeometry args={[BOX_SIZE * 1.1, BOX_SIZE * 1.1, BOX_SIZE * 1.1]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.05}
          metalness={0.2}
          roughness={0.85}
        />
      </mesh>

      {/* Spread translucent slab */}
      <mesh>
        <boxGeometry args={[SPREAD_WIDTH, BOX_SIZE * 1.05, BOX_SIZE * 1.05]} />
        <meshStandardMaterial
          color="#ffff00"
          transparent
          opacity={0.06}
          emissive="#ffff00"
          emissiveIntensity={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Edge rails */}
      <mesh position={[-SPREAD_WIDTH / 2, 0, 0]}>
        <boxGeometry args={[RAIL_THICKNESS, RAIL_HEIGHT, RAIL_DEPTH]} />
        <meshStandardMaterial
          color={COLOR_RAIL_BID}
          emissive={COLOR_RAIL_BID}
          emissiveIntensity={0.5 + bidRailFlashRef.current * 1.2}
          transparent
          opacity={0.95}
        />
      </mesh>
      <mesh position={[SPREAD_WIDTH / 2, 0, 0]}>
        <boxGeometry args={[RAIL_THICKNESS, RAIL_HEIGHT, RAIL_DEPTH]} />
        <meshStandardMaterial
          color={COLOR_RAIL_ASK}
          emissive={COLOR_RAIL_ASK}
          emissiveIntensity={0.5 + askRailFlashRef.current * 1.2}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Iceberg block (absorption visual) */}
      {(scenario === 'absorption' || scenario === 'combined') && (
        <mesh position={[-SPREAD_WIDTH / 2 - 0.4, -0.2, 0]}>
          <boxGeometry args={[0.35, 1.2, BOX_SIZE * 0.7]} />
          <meshStandardMaterial
            color="#1fa8a0"
            transparent
            opacity={0.28}
            emissive="#26A69A"
            emissiveIntensity={0.25}
            metalness={0.15}
            roughness={0.2}
          />
        </mesh>
      )}

      {/* Sweep projectiles (elongated glowing) */}
      {new Array(sweepPoolRef.current.length).fill(null).map((_, i) => (
        <mesh
          key={`sweep-${i}`}
          ref={(el) => {
            if (el) sweepMeshesRef.current[i] = el;
          }}
          visible={false}
        >
          <boxGeometry args={[0.35, 0.08, 0.08]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={1.8}
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      {/* Shockwave rings */}
      {new Array(shockwavesRef.current.length).fill(null).map((_, i) => (
        <mesh
          key={`shock-${i}`}
          ref={(el) => {
            if (el) shockwaveMeshesRef.current[i] = el;
          }}
          visible={false}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.08, 0.12, 32]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Spoof walls (glossy panes) */}
      {new Array(spoofWallsRef.current.length).fill(null).map((_, i) => (
        <mesh
          key={`spoof-${i}`}
          ref={(el) => {
            if (el) spoofWallMeshesRef.current[i] = el;
          }}
          visible={false}
          scale={[1, 0, 1]}
        >
          <boxGeometry args={[0.18, 1.1, BOX_SIZE * 0.8]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.5}
            metalness={0.6}
            roughness={0.2}
            emissive="#ffffff"
            emissiveIntensity={0.08}
            envMapIntensity={0.6}
          />
        </mesh>
      ))}

      {/* Pings (crisp small spheres) */}
      {new Array(pingsRef.current.length).fill(null).map((_, i) => (
        <mesh
          key={`ping-${i}`}
          ref={(el) => {
            if (el) pingMeshesRef.current[i] = el;
          }}
          visible={false}
        >
          <sphereGeometry args={[0.06, 14, 14]} />
          <meshStandardMaterial
            color="#e5ffff"
            emissive="#aefcff"
            emissiveIntensity={1.0}
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -BOX_SIZE * 1.1, 0]}>
        <planeGeometry args={[BOX_SIZE * 3, BOX_SIZE * 2]} />
        <meshStandardMaterial
          color="#1f2025"
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>
    </>
  );
}
