
import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useControls, LevaPanel, useCreateStore, button } from 'leva';

type Phase = 'approach' | 'contact' | 'reversal' | 'breakout';
type Scenario = 'reversal' | 'breakout';

interface SupportResistanceMemory3DProps {
  levaStore: ReturnType<typeof useCreateStore>;
}

const BOX_SIZE = 1.2;
const PLANE_SIZE = 10;
const PLANE_HEIGHT = 0.15; // small thickness for thin plate
const APPROACH_END = 0.7; // fraction of progress reserved for approach

export default function SupportResistanceMemory3D({
  levaStore,
}: SupportResistanceMemory3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const planeRef = useRef<THREE.Mesh>(null);
  const boxRef = useRef<THREE.Mesh>(null);

  // Internal timeline state
  const [phase, setPhase] = useState<Phase>('approach');
  const [progress, setProgress] = useState(0);
  const phaseRef = useRef<Phase>('approach');
  const playRef = useRef(false);

  // Leva controls (local to 3D)
  const controls = useControls(
    'Support/Resistance',
    {
      scenario: {
        value: 'reversal' as Scenario,
        options: { Breakout: 'breakout', Reversal: 'reversal' },
        label: 'Scenario',
      },
      approachSpeed: {
        value: 1.0,
        min: 0.2,
        max: 3,
        step: 0.05,
        label: 'Approach Speed',
      },
      distanceToResistance: {
        value: 4.0,
        min: 1.0,
        max: 10.0,
        step: 0.1,
        label: 'Distance to Resistance',
      },
      glowIntensity: {
        value: 1.0,
        min: 0,
        max: 2,
        step: 0.05,
        label: 'Glow Intensity',
      },
      loop: {
        value: false,
        label: 'Loop Animation',
      },
      play: button(() => {
        playRef.current = true;
      }),
      pause: button(() => {
        playRef.current = false;
      }),
      reset: button(() => {
        playRef.current = false;
        setProgress(0);
        setPhase('approach');
        phaseRef.current = 'approach';
      }),
    },
    { store: levaStore }
  ) as {
    scenario: Scenario | string;
    approachSpeed: number;
    distanceToResistance: number;
    glowIntensity: number;
    loop: boolean;
    play: () => void;
    pause: () => void;
    reset: () => void;
  };

  const scenario =
    (controls.scenario as Scenario) === 'reversal' ? 'reversal' : 'breakout';
  const approachSpeed = controls.approachSpeed ?? 1.0;
  const distanceToResistance = controls.distanceToResistance ?? 4.0;
  const glowIntensity = controls.glowIntensity ?? 1.0;
  const loopEnabled = controls.loop ?? true;

  // Shader material for subtle ripple on contact
  const rippleMaterial = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uImpactStrength: { value: 0 }, // 0..1, decays after contact
      },
      vertexShader: `
        uniform float uTime;
        uniform float uImpactStrength;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          // plane is rotated to lie on XZ, so position.y is height
          // make radial ripples around center
          vec3 pos = position;
          float dist = length(pos.xz);
          float wave = sin(dist * 12.0 - uTime * 8.0) * exp(-dist * 2.0);
          pos.y += wave * 0.15 * uImpactStrength;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        void main() {
          // simple shaded color, real shading handled by scene lights below this overlay
          gl_FragColor = vec4(0.9, 0.2, 0.25, 1.0);
        }
      `,
      transparent: false,
    });
    return mat;
  }, []);

  // Secondary standard material layered under ripple shader (for emissive/glow)
  const planeBaseMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#5a1c27'),
      roughness: 0.6,
      metalness: 0.05,
      emissive: new THREE.Color('#ff2a43'),
      emissiveIntensity: 0.15,
      side: THREE.DoubleSide,
    });
    return mat;
  }, []);

  // Box material with emissive glow adjusted with proximity
  const boxMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1d8a4f'),
      roughness: 0.4,
      metalness: 0.25,
      emissive: new THREE.Color('#22ff88'),
      emissiveIntensity: 0.3,
    });
    return mat;
  }, []);

  // Ghost memory planes (deeper history)
  const ghostPlanes = useMemo(() => {
    // 3 ghost layers above and below
    const gaps = [2.5, -2.5, 5.0, -5.0];
    return gaps;
  }, []);

  // Animate time uniform and drive timeline
  useFrame((_, delta) => {
    // Timeline advancement
    if (playRef.current) {
      const speed = Number.isFinite(approachSpeed) ? approachSpeed : 1.0;
      setProgress((prev) => {
        let next = prev + delta * (speed * 0.18);
        if (phaseRef.current === 'contact') {
          next = Math.max(next, APPROACH_END + 0.02);
        }
        // Handle end of timeline
        if (next >= 1) {
          if (loopEnabled) {
            // Loop automatically
            next = 0;
            phaseRef.current = 'approach';
            setPhase('approach');
          } else {
            // Stop at end
            next = 1;
            playRef.current = false;
          }
        }
        const nextPhase =
          next < APPROACH_END
            ? 'approach'
            : next < APPROACH_END + 0.08
            ? 'contact'
            : (scenario as Phase);
        if (nextPhase !== phaseRef.current) {
          phaseRef.current = nextPhase;
          setPhase(nextPhase);
        }
        return next;
      });
    }

    if (rippleMaterial.uniforms.uTime) {
      rippleMaterial.uniforms.uTime.value += delta;
    }
    // Decay ripple after contact
    const isContacting = phase === 'contact';
    const targetStrength = isContacting
      ? 1
      : scenario === 'breakout' && phase === 'breakout'
      ? 0.35
      : 0.0;
    rippleMaterial.uniforms.uImpactStrength.value = THREE.MathUtils.lerp(
      rippleMaterial.uniforms.uImpactStrength.value,
      targetStrength,
      0.08
    );

    // Update emissive intensities based on proximity to plane (y=0)
    const box = boxRef.current;
    const plane = planeRef.current;
    if (box && plane) {
      const distance = Math.abs(box.position.y - 0);
      const proximity = THREE.MathUtils.clamp(
        1 - distance / Math.max(0.0001, distanceToResistance),
        0,
        1
      );
      const planeEmissive =
        0.15 +
        proximity * (0.6 + glowIntensity * 0.6) +
        (phase !== 'approach' ? 0.15 : 0);
      const boxEmissive = 0.3 + proximity * (0.7 + glowIntensity * 0.5);
      (plane.material as THREE.MeshStandardMaterial).emissiveIntensity =
        planeEmissive;
      (box.material as THREE.MeshStandardMaterial).emissiveIntensity =
        boxEmissive;
    }
  });

  // Compute box Y position from phase/progress
  const boxY = useMemo(() => {
    const startY = -Math.max(0.5, distanceToResistance);
    const contactY = 0; // plane at y=0
    const t = THREE.MathUtils.clamp(progress, 0, 1);
    if (phase === 'approach' || phase === 'contact') {
      const local = THREE.MathUtils.clamp(t / APPROACH_END, 0, 1);
      // ease out as it nears the plane
      const eased = 1 - Math.pow(1 - local, 3);
      return THREE.MathUtils.lerp(startY, contactY, eased);
    }
    if (phase === 'reversal') {
      // smoothly return to the initial start position (no jump/overshoot)
      const local = THREE.MathUtils.clamp(
        (t - APPROACH_END) / (1 - APPROACH_END),
        0,
        1
      );
      // use a gentle ease-out curve for a smooth retreat
      const eased = 1 - Math.pow(1 - local, 3);
      const endY = startY; // return to original starting height
      return THREE.MathUtils.lerp(contactY, endY, eased);
    }
    // breakout
    const local = THREE.MathUtils.clamp(
      (t - APPROACH_END) / (1 - APPROACH_END),
      0,
      1
    );
    const eased = Math.pow(local, 0.7);
    const targetY = 0.8 * distanceToResistance; // break above the plane
    return THREE.MathUtils.lerp(contactY, targetY, eased);
  }, [phase, progress, distanceToResistance]);

  return (
    <group ref={groupRef}>
      {/* Fog */}
      <fog attach="fog" args={[new THREE.Color('#0e1420'), 12, 38]} />
      {/* Cinematic lighting accents */}
      <hemisphereLight
        args={[new THREE.Color('#334155'), new THREE.Color('#0b1220'), 0.35]}
      />
      <spotLight
        position={[8, 10, 6]}
        intensity={0.7}
        angle={0.4}
        penumbra={0.5}
        castShadow
      />

      {/* Resistance plane - base shaded mesh (thin plate) */}
      <mesh
        ref={planeRef}
        rotation={[0, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <boxGeometry args={[PLANE_SIZE, PLANE_HEIGHT, PLANE_SIZE]} />
        <primitive object={planeBaseMaterial} attach="material" />
      </mesh>
      {/* Ripple effect mesh overlay (slightly offset to avoid z-fighting) */}
      <mesh rotation={[0, 0, 0]} position={[0, PLANE_HEIGHT * 0.5 + 0.001, 0]}>
        <boxGeometry args={[PLANE_SIZE, PLANE_HEIGHT, PLANE_SIZE]} />
        <primitive object={rippleMaterial} attach="material" />
      </mesh>

      {/* Label for the plane */}
      <Html
        position={[0, PLANE_HEIGHT * 0.5 + 0.02, 0]}
        center
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            color: 'white',
            background: 'rgba(0,0,0,0.5)',
            padding: '6px 10px',
            borderRadius: 8,
            fontSize: 12,
            border: '1px solid rgba(255,255,255,0.1)',
            whiteSpace: 'nowrap',
          }}
        >
          Old Resistance — Important Battle Zone
        </div>
      </Html>

      {/* The active box (price structure) */}
      <mesh ref={boxRef} position={[0, boxY, 0]} castShadow>
        <boxGeometry args={[BOX_SIZE, BOX_SIZE, BOX_SIZE]} />
        <primitive object={boxMaterial} attach="material" />
      </mesh>

      {/* Motion trail (simple faint tube as vertical glow behind the box) */}
      <mesh
        position={[
          0,
          (boxY - distanceToResistance) * 0.5 - distanceToResistance * 0.25,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            0.06,
            0.06,
            Math.max(0.001, Math.abs(boxY - -distanceToResistance)) + 0.1,
            16,
          ]}
        />
        <meshStandardMaterial
          color="#2ee59d"
          transparent
          opacity={0.15}
          emissive="#22ff88"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Ghost planes to hint layered memory */}
      {ghostPlanes.map((gap, idx) => (
        <mesh
          key={idx}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, gap, 0]}
          receiveShadow
        >
          <planeGeometry args={[PLANE_SIZE * 0.8, PLANE_SIZE * 0.8, 8, 8]} />
          <meshStandardMaterial
            color="#3b1a21"
            transparent
            opacity={0.18}
            roughness={0.9}
            metalness={0.05}
            side={THREE.DoubleSide}
            emissive="#b91c1c"
            emissiveIntensity={0.03}
          />
        </mesh>
      ))}

      {/* Leva overlay controls inside Canvas (top-right) */}
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
            titleBar={{ title: 'Support/Resistance Controls' }}
            collapsed={false}
          />
        </div>
      </Html>
    </group>
  );
}
