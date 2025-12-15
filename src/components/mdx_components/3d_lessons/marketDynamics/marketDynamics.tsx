import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Mesh, ShaderMaterial } from 'three';
import { LevaPanel, useControls, useCreateStore } from 'leva';

interface MarketDynamicsData {
  name: string;
  color: string;
  volatilityScore: number; // 1 (low) - 5 (high)
  liquidityDensity: number; // 1 (sparse) - 5 (dense)
  liquiditySpeed: number; // 1 (slow) - 5 (fast)
}

const markets: MarketDynamicsData[] = [
  {
    name: 'Equities',
    color: '#4287f5',
    volatilityScore: 3,
    liquidityDensity: 3,
    liquiditySpeed: 3,
  },
  {
    name: 'Bonds',
    color: '#42f5a7',
    volatilityScore: 1.2,
    liquidityDensity: 4,
    liquiditySpeed: 1.4,
  },
  {
    name: 'Forex',
    color: '#f542b3',
    volatilityScore: 2,
    liquidityDensity: 5,
    liquiditySpeed: 4.5,
  },
  {
    name: 'Derivatives',
    color: '#f5d242',
    volatilityScore: 4.5,
    liquidityDensity: 3,
    liquiditySpeed: 3.5,
  },
  {
    name: 'Commodities',
    color: '#8142f5',
    volatilityScore: 4,
    liquidityDensity: 2,
    liquiditySpeed: 2,
  },
  {
    name: 'Crypto',
    color: '#f54242',
    volatilityScore: 5,
    liquidityDensity: 3,
    liquiditySpeed: 3.8,
  },
];

type VolatilityUniforms = {
  uTime: { value: number };
  uAmplitude: { value: number };
  uFrequency: { value: number };
  uWaveSpeed: { value: number };
  uColor: { value: THREE.Color };
};

function createVolatilityMaterial(
  color: string,
  amplitude: number,
  frequency: number,
  waveSpeed: number
): ShaderMaterial {
  const uniforms: VolatilityUniforms = {
    uTime: { value: 0 },
    uAmplitude: { value: amplitude },
    uFrequency: { value: frequency },
    uWaveSpeed: { value: waveSpeed },
    uColor: { value: new THREE.Color(color) },
  };

  const vertexShader = `
    uniform float uTime;
    uniform float uAmplitude;
    uniform float uFrequency;
    uniform float uWaveSpeed;
    varying vec3 vNormalW;
    varying vec3 vWorldPos;

    void main() {
      vec3 transformed = position;
      float wave = sin((position.x + position.y * 1.3 + position.z * 0.7) * uFrequency + uTime * uWaveSpeed);
      transformed += normal * wave * uAmplitude;
      vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);
      vWorldPos = worldPosition.xyz;
      vNormalW = normalize(mat3(modelMatrix) * normal);
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `;

  const fragmentShader = `
    precision highp float;
    varying vec3 vNormalW;
    varying vec3 vWorldPos;
    uniform vec3 uColor;

    void main() {
      vec3 lightDir = normalize(vec3(0.5, 1.0, 0.8));
      float diffuse = max(dot(normalize(vNormalW), lightDir), 0.0);
      float rim = pow(1.0 - max(dot(normalize(vNormalW), normalize(-vWorldPos)), 0.0), 2.0);
      vec3 base = uColor;
      vec3 color = base * (0.25 + 0.75 * diffuse) + rim * 0.2;
      gl_FragColor = vec4(color, 0.95);
    }
  `;

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
  });
  return material;
}

interface VolatilityBoxProps {
  position: [number, number, number];
  color: string;
  volatilityScore: number;
  showWaves: boolean;
  amplitudeScale: number;
  frequency: number;
  waveSpeed: number;
  showLabel: boolean;
  label: string;
}

const VolatilityBox: React.FC<VolatilityBoxProps> = ({
  position,
  color,
  volatilityScore,
  showWaves,
  amplitudeScale,
  frequency,
  waveSpeed,
  showLabel,
  label,
}) => {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);

  const boxSize: [number, number, number] = [0.9, 0.9, 0.9];

  const material = useMemo(() => {
    const amp = (volatilityScore / 5) * amplitudeScale;
    const mat = createVolatilityMaterial(color, amp, frequency, waveSpeed);
    materialRef.current = mat;
    return mat;
  }, [color, volatilityScore, amplitudeScale, frequency, waveSpeed]);

  useFrame((state) => {
    if (!materialRef.current) return;
    const t = state.clock.getElapsedTime();
    (materialRef.current.uniforms as VolatilityUniforms).uTime.value = t;
    if (meshRef.current) {
      const wobble = 0.02 * Math.sin(t * 0.8);
      meshRef.current.rotation.y = t * 0.2 + wobble;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[boxSize[0], boxSize[1], boxSize[2], 32, 32, 32]} />
        {showWaves ? (
          <primitive object={material} attach="material" />
        ) : (
          <meshStandardMaterial
            color={color}
            roughness={0.35}
            metalness={0.3}
            transparent
            opacity={0.95}
          />
        )}
      </mesh>
      {showLabel && (
        <Html position={[0, boxSize[1] * 1.3, 0]} center>
          <div
            style={{
              color: 'white',
              textAlign: 'center',
              background: 'rgba(0, 0, 0, 0.75)',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              pointerEvents: 'none',
              border: `2px solid ${color}`,
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  );
};

interface LiquidityParticlesProps {
  center: THREE.Vector3;
  color: string;
  densityScore: number; // 1 - 5
  speedScore: number; // 1 - 5
  baseCount: number;
  radius: number;
  size: number;
  globalSpeedScale: number;
  show: boolean;
}

const LiquidityParticles: React.FC<LiquidityParticlesProps> = ({
  center,
  color,
  densityScore,
  speedScore,
  baseCount,
  radius,
  size,
  globalSpeedScale,
  show,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const positionsRef = useRef<Float32Array>();
  const velocitiesRef = useRef<Float32Array>();

  const densityMultiplier = useMemo(() => {
    const normalized = Math.max(0, Math.min(1, densityScore / 5));
    const curved = Math.pow(normalized, 1.35);
    return 0.35 + curved * 3.15; // ~0.35x for sparse markets up to 3.5x for dense ones
  }, [densityScore]);

  const particleCount = useMemo(
    () => Math.max(10, Math.floor(baseCount * densityMultiplier)),
    [baseCount, densityMultiplier]
  );

  const speedProfile = useMemo(() => {
    const normalized = Math.max(0, Math.min(1, speedScore / 5));
    const curved = Math.pow(normalized, 1.4);
    return {
      xy: 0.15 + curved * 1.5, // rotational velocity baseline
      randomness: 0.4 + curved * 0.8, // spread of speeds
      vertical: 0.04 + curved * 0.3, // vertical jitter
    };
  }, [speedScore]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      // Random point in sphere
      const r = radius * Math.cbrt(Math.random());
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = 2 * Math.PI * Math.random();
      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.cos(theta);
      const z = r * Math.sin(theta) * Math.sin(phi);
      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Velocity - swirl around Y with more pronounced differences
      const angle = Math.atan2(z, x) + (Math.random() - 0.5) * 0.35;
      const speed =
        speedProfile.xy * (0.4 + Math.random() * speedProfile.randomness);
      velocities[i * 3 + 0] = -Math.sin(angle) * speed;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * speedProfile.vertical;
      velocities[i * 3 + 2] = Math.cos(angle) * speed;
    }
    positionsRef.current = positions;
    velocitiesRef.current = velocities;
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [particleCount, radius, speedProfile]);

  const material = useMemo(() => {
    const mat = new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });
    return mat;
  }, [color, size]);

  useFrame((_, delta) => {
    if (!pointsRef.current || !positionsRef.current || !velocitiesRef.current)
      return;
    const positions = positionsRef.current;
    const velocities = velocitiesRef.current;
    const posAttr = (
      pointsRef.current.geometry as THREE.BufferGeometry
    ).getAttribute('position') as THREE.BufferAttribute;
    const effRad = radius;
    const speedScale = globalSpeedScale;
    for (let i = 0; i < particleCount; i++) {
      const ix = i * 3;
      // Integrate
      positions[ix + 0] += velocities[ix + 0] * delta * speedScale;
      positions[ix + 1] += velocities[ix + 1] * delta * speedScale;
      positions[ix + 2] += velocities[ix + 2] * delta * speedScale;
      // Keep within sphere via gentle pullback
      const x = positions[ix + 0];
      const y = positions[ix + 1];
      const z = positions[ix + 2];
      const dist = Math.sqrt(x * x + y * y + z * z);
      if (dist > effRad) {
        const factor = effRad / dist;
        positions[ix + 0] *= factor;
        positions[ix + 1] *= factor;
        positions[ix + 2] *= factor;
        // Slightly randomize direction when clamped
        velocities[ix + 0] *= -0.9;
        velocities[ix + 1] *= -0.9;
        velocities[ix + 2] *= -0.9;
      }
    }
    posAttr.needsUpdate = true;
  });

  if (!show) return null;

  return (
    <points ref={pointsRef} position={center.toArray()}>
      <primitive attach="geometry" object={geometry} />
      <primitive attach="material" object={material} />
    </points>
  );
};

interface MarketDynamicsProps {
  showLabels?: boolean;
}

const MarketDynamics: React.FC<MarketDynamicsProps> = ({
  showLabels: initialShowLabels = true,
}) => {
  const levaStore = useCreateStore();

  const {
    showVolatility,
    showLiquidity,
    volatilityAmplitude,
    volatilityFrequency,
    volatilitySpeed,
    particleBaseCount,
    particleSize,
    particleRadius,
    particleSpeedScale,
    showLabels,
  } = useControls(
    'Market Dynamics',
    {
      showVolatility: { value: true, label: 'Show Volatility Waves' },
      showLiquidity: { value: true, label: 'Show Liquidity Particles' },
      volatilityAmplitude: { value: 0.15, min: 0, max: 0.5, step: 0.01 },
      volatilityFrequency: { value: 1.2, min: 0.2, max: 3, step: 0.1 },
      volatilitySpeed: { value: 0.9, min: 0.2, max: 2, step: 0.05 },
      particleBaseCount: { value: 140, min: 20, max: 400, step: 10 },
      particleSize: { value: 0.045, min: 0.01, max: 0.08, step: 0.002 },
      particleRadius: { value: 1.2, min: 0.6, max: 2.5, step: 0.05 },
      particleSpeedScale: { value: 1.0, min: 0.2, max: 3, step: 0.05 },
      showLabels: { value: initialShowLabels, label: 'Show Labels' },
    },
    { store: levaStore }
  );

  const spacing = 2.6;
  const startX = -(markets.length - 1) * spacing * 0.5;

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
              top: auto !important;
              right: auto !important;
              bottom: auto !important;
              left: auto !important;
            }
          `}</style>
          <LevaPanel
            store={levaStore}
            fill={false}
            titleBar={{ title: 'Market Dynamics' }}
            collapsed={true}
          />
        </div>
      </Html>

      {markets.map((m, i) => {
        const x = startX + i * spacing;
        const label = `${m.name} • V ${m.volatilityScore.toFixed(1)}/5 • L ${
          m.liquidityDensity
        }/5`;
        return (
          <group key={m.name} position={[x, 0, 0]}>
            <VolatilityBox
              position={[0, 0.5, 0]}
              color={m.color}
              volatilityScore={m.volatilityScore}
              showWaves={showVolatility}
              amplitudeScale={volatilityAmplitude}
              frequency={volatilityFrequency}
              waveSpeed={volatilitySpeed}
              showLabel={showLabels}
              label={label}
            />
            <LiquidityParticles
              center={new THREE.Vector3(0, 2.5, 0)}
              color={m.color}
              densityScore={m.liquidityDensity}
              speedScore={m.liquiditySpeed}
              baseCount={particleBaseCount}
              radius={particleRadius}
              size={particleSize}
              globalSpeedScale={particleSpeedScale}
              show={showLiquidity}
            />
          </group>
        );
      })}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-1.5, 0, 0]}
        scale={[-1.5, 1, 1]}
        receiveShadow
      >
        <planeGeometry args={[15, 5]} />
        <meshStandardMaterial
          color="#e7e5e4"
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>
    </>
  );
};

export default MarketDynamics;
