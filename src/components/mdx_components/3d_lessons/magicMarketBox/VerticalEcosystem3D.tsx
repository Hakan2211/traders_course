
import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useControls, LevaPanel, useCreateStore } from 'leva';
import * as THREE from 'three';

interface VerticalEcosystem3DProps {
  levaStore: ReturnType<typeof useCreateStore>;
}

// Particle types:
// 0 = blue (algorithms/HFT), 1 = red (seller), 2 = green (buyer), 3 = green bag (aggregated), 4 = yellow (market maker)
type ParticleType = 0 | 1 | 2 | 3 | 4;

type Layer = 'retail' | 'marketMakers' | 'institutions' | 'algorithms';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  targetPosition: THREE.Vector3;
  type: ParticleType;
  size: number;
  opacity: number;
  bagCount: number;
  dissolving: boolean;
  dissolveProgress: number;
  layer: Layer;
}

// Shaders
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
      vColor = vec3(0.2, 0.6, 1.0); // Blue (algorithms/HFT)
    } else if (particleType < 1.5) {
      vColor = vec3(0.9, 0.2, 0.2); // Red (seller)
    } else if (particleType < 2.5) {
      vColor = vec3(0.2, 0.9, 0.2); // Green (buyer)
    } else if (particleType < 3.5) {
      vColor = vec3(0.1, 0.8, 0.1); // Darker green (bag)
    } else if (particleType < 4.5) {
      vColor = vec3(1.0, 1.0, 0.0); // Yellow (market makers)
    } else {
      vColor = vec3(0.6, 0.6, 0.6); // Fallback gray
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

// Helpers
function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function VerticalEcosystem3D({ levaStore }: VerticalEcosystem3DProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const [particles, setParticles] = useState<Particle[]>([]);
  const [fadeInQuote, setFadeInQuote] = useState(0);

  // Leva controls
  const {
    step,
    particleCount,
    particleSize,
    timeframeScale,
    flowIntensity,
    showLayers,
    showFlow,
    showLabels,
    showRetail,
    showMarketMakers,
    showInstitutions,
    showAlgorithms,
    flowLineCount,
  } = useControls(
    'Market Ecosystem',
    {
      step: { value: 0, min: 0, max: 3, step: 1, label: 'Step' },
      particleCount: {
        value: 4000,
        min: 500,
        max: 12000,
        step: 100,
        label: 'Particles',
      },
      particleSize: {
        value: 0.2,
        min: 0.05,
        max: 0.6,
        step: 0.01,
        label: 'Particle Size',
      },
      timeframeScale: {
        value: 1.0,
        min: 0.1,
        max: 5,
        step: 0.1,
        label: 'Timeframe Multiplier',
      },
      flowIntensity: {
        value: 1.0,
        min: 0,
        max: 2,
        step: 0.1,
        label: 'Flow Intensity',
      },
      showLayers: { value: true, label: 'Show Layer Boxes' },
      showFlow: { value: true, label: 'Show Flow Streams' },
      showLabels: { value: true, label: 'Show Labels' },
      showRetail: { value: true, label: 'Retail' },
      showMarketMakers: { value: true, label: 'Market Makers' },
      showInstitutions: { value: true, label: 'Institutions' },
      showAlgorithms: { value: true, label: 'Algorithms/HFT' },
      flowLineCount: {
        value: 120,
        min: 0,
        max: 400,
        step: 10,
        label: 'Flow Lines',
      },
    },
    { store: levaStore }
  );

  // Box size scales with population
  const boxSize = useMemo(() => {
    const baseSize = 2;
    const scaleFactor = Math.pow(particleCount / 200, 1 / 3);
    return baseSize * scaleFactor;
  }, [particleCount]);
  const halfSize = useMemo(() => boxSize * 0.8, [boxSize]);

  // Layer vertical ranges (with gaps)
  const layerYRanges = useMemo(() => {
    return {
      // Increased gaps between layers:
      // Retail stays lower; market makers band narrows near 0; institutions start higher
      retail: { minY: -halfSize, maxY: -halfSize * 0.45 },
      marketMakers: { minY: -halfSize * 0.12, maxY: halfSize * 0.12 },
      institutions: { minY: halfSize * 0.45, maxY: halfSize },
      algorithms: { minY: -halfSize, maxY: halfSize },
    } as const;
  }, [halfSize]);

  // Geometry and attributes
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

  // Flow geometry: two segments per path (retail->MM and MM->Inst)
  const flowGeometry = useMemo(() => {
    const verticesPerPath = 4; // two segments => 4 vertices
    const positionArray = new Float32Array(flowLineCount * verticesPerPath * 3);
    return new THREE.BufferGeometry().setAttribute(
      'position',
      new THREE.BufferAttribute(positionArray, 3)
    );
  }, [flowLineCount]);

  const flowMaterial = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#ffff88'),
      transparent: true,
      opacity: 0.25,
    });
    return mat;
  }, []);

  const algoNetworkGeometry = useMemo(() => {
    const lineCount = Math.floor(flowLineCount * 0.6);
    const verticesPerLine = 2;
    const positionArray = new Float32Array(lineCount * verticesPerLine * 3);
    return new THREE.BufferGeometry().setAttribute(
      'position',
      new THREE.BufferAttribute(positionArray, 3)
    );
  }, [flowLineCount]);

  const algoNetworkMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: new THREE.Color('#4aa3ff'),
      transparent: true,
      opacity: 0.18,
    });
  }, []);

  // Initialize particles
  useEffect(() => {
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      let layer: Layer;
      if (i < particleCount * 0.4) layer = 'retail';
      else if (i < particleCount * 0.6) layer = 'marketMakers';
      else if (i < particleCount * 0.7) layer = 'institutions';
      else layer = 'algorithms';

      const range =
        layer === 'algorithms'
          ? layerYRanges.algorithms
          : layer === 'retail'
          ? layerYRanges.retail
          : layer === 'marketMakers'
          ? layerYRanges.marketMakers
          : layerYRanges.institutions;

      const position = new THREE.Vector3(
        randomInRange(-halfSize, halfSize),
        randomInRange(range.minY, range.maxY),
        randomInRange(-halfSize, halfSize)
      );

      let type: ParticleType;
      if (layer === 'retail' || layer === 'institutions') {
        type = Math.random() < 0.5 ? 1 : 2;
      } else if (layer === 'marketMakers') {
        type = 4;
      } else {
        type = 0;
      }

      const baseVel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5
      );
      const velocityScale =
        layer === 'algorithms'
          ? 5
          : layer === 'retail'
          ? 2
          : layer === 'marketMakers'
          ? 0.8
          : 0.2;

      const particle: Particle = {
        position,
        velocity: baseVel.multiplyScalar(velocityScale),
        targetPosition: position.clone(),
        type,
        size: layer === 'institutions' ? particleSize * 8 : particleSize,
        opacity: 1.0,
        bagCount: 1,
        dissolving: false,
        dissolveProgress: 0,
        layer,
      };
      newParticles.push(particle);
    }

    setParticles(newParticles);
    setFadeInQuote(0);
  }, [particleCount, particleSize, halfSize, layerYRanges]);

  // Handle step transitions (snap to layers, activate flows, fade-in quote)
  useEffect(() => {
    if (step === 0) {
      // Scatter randomly
      setParticles((prev) =>
        prev.map((p) => {
          const pos = new THREE.Vector3(
            randomInRange(-halfSize, halfSize),
            randomInRange(-halfSize, halfSize),
            randomInRange(-halfSize, halfSize)
          );
          return {
            ...p,
            position: pos.clone(),
            targetPosition: pos,
          };
        })
      );
      setFadeInQuote(0);
    } else if (step >= 1) {
      // Snap into layer ranges with gentle spread
      setParticles((prev) =>
        prev.map((p) => {
          const range = layerYRanges[p.layer];
          const newTarget = new THREE.Vector3(
            randomInRange(-halfSize * 0.9, halfSize * 0.9),
            randomInRange(range.minY, range.maxY),
            randomInRange(-halfSize * 0.9, halfSize * 0.9)
          );
          // reset velocities per layer profile
          const speed =
            p.layer === 'algorithms'
              ? 5
              : p.layer === 'retail'
              ? 2
              : p.layer === 'marketMakers'
              ? 0.8
              : 0.2;
          const newVel = newTarget
            .clone()
            .sub(p.position)
            .normalize()
            .multiplyScalar(speed);
          return {
            ...p,
            position: newTarget.clone(),
            targetPosition: newTarget,
            velocity: newVel,
          };
        })
      );
      if (step >= 2) setFadeInQuote(0); // will animate in useFrame
    }
  }, [step, halfSize, layerYRanges]);

  // Precompute flow anchors (static, then wavy animation in frame loop)
  const flowAnchorsRef = useRef<
    Array<{ a: THREE.Vector3; b: THREE.Vector3; c: THREE.Vector3 }>
  >([]);

  useEffect(() => {
    const anchors: Array<{
      a: THREE.Vector3;
      b: THREE.Vector3;
      c: THREE.Vector3;
    }> = [];
    for (let i = 0; i < flowLineCount; i++) {
      const a = new THREE.Vector3(
        randomInRange(-halfSize, halfSize),
        randomInRange(layerYRanges.retail.minY, layerYRanges.retail.maxY),
        randomInRange(-halfSize, halfSize)
      );
      const b = new THREE.Vector3(
        randomInRange(-halfSize, halfSize),
        randomInRange(
          layerYRanges.marketMakers.minY,
          layerYRanges.marketMakers.maxY
        ),
        randomInRange(-halfSize, halfSize)
      );
      const c = new THREE.Vector3(
        randomInRange(-halfSize, halfSize),
        randomInRange(
          layerYRanges.institutions.minY,
          layerYRanges.institutions.maxY
        ),
        randomInRange(-halfSize, halfSize)
      );
      anchors.push({ a, b, c });
    }
    flowAnchorsRef.current = anchors;
  }, [flowLineCount, halfSize, layerYRanges]);

  // Algo network anchors (blue)
  const algoAnchorsRef = useRef<
    Array<{ p1: THREE.Vector3; p2: THREE.Vector3 }>
  >([]);
  useEffect(() => {
    const count = Math.floor(flowLineCount * 0.6);
    const anchors: Array<{ p1: THREE.Vector3; p2: THREE.Vector3 }> = [];
    for (let i = 0; i < count; i++) {
      anchors.push({
        p1: new THREE.Vector3(
          randomInRange(-halfSize, halfSize),
          randomInRange(
            layerYRanges.algorithms.minY,
            layerYRanges.algorithms.maxY
          ),
          randomInRange(-halfSize, halfSize)
        ),
        p2: new THREE.Vector3(
          randomInRange(-halfSize, halfSize),
          randomInRange(
            layerYRanges.algorithms.minY,
            layerYRanges.algorithms.maxY
          ),
          randomInRange(-halfSize, halfSize)
        ),
      });
    }
    algoAnchorsRef.current = anchors;
  }, [flowLineCount, halfSize, layerYRanges]);

  // Frame update
  useFrame((state, delta) => {
    if (!pointsRef.current || particles.length === 0) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
    const typeAttr = geom.getAttribute('particleType') as THREE.BufferAttribute;
    const sizeAttr = geom.getAttribute('particleSize') as THREE.BufferAttribute;
    const opacityAttr = geom.getAttribute(
      'particleOpacity'
    ) as THREE.BufferAttribute;

    // Update particles
    setParticles((prev) => {
      const updated = [...prev];
      for (let i = 0; i < updated.length; i++) {
        const p = updated[i];

        // Base per-layer speed multiplier, scaled by timeframeScale (higher timeframe => slower)
        const baseSpeed =
          p.layer === 'algorithms'
            ? 5
            : p.layer === 'retail'
            ? 2
            : p.layer === 'marketMakers'
            ? 0.8
            : 0.2; // institutions
        const tfScale =
          p.layer === 'institutions'
            ? 1 / Math.max(0.2, timeframeScale) // slower as timeframeScale increases
            : p.layer === 'retail' || p.layer === 'algorithms'
            ? Math.max(0.2, timeframeScale) // faster with timeframeScale
            : 1; // market makers moderate
        const speed = baseSpeed * tfScale;

        // Motion rules by step
        if (step === 0) {
          // Chaotic drift
          p.position.add(p.velocity.clone().multiplyScalar(delta * 0.6));
        } else {
          // Keep within layer bounds and drift around
          const range = layerYRanges[p.layer];
          const toTarget = p.targetPosition.clone().sub(p.position);
          // Smoothly follow target with slight jitter
          p.position.add(toTarget.multiplyScalar(delta * 0.5 * speed));
          p.position.add(
            new THREE.Vector3(
              (Math.random() - 0.5) * delta * 0.5 * speed,
              (Math.random() - 0.5) * delta * 0.2 * speed,
              (Math.random() - 0.5) * delta * 0.5 * speed
            )
          );
          // Constrain to layer band
          p.position.y = Math.max(
            range.minY,
            Math.min(range.maxY, p.position.y)
          );
          p.position.x = Math.max(-halfSize, Math.min(halfSize, p.position.x));
          p.position.z = Math.max(-halfSize, Math.min(halfSize, p.position.z));

          // In step 2+, bias slight upward circulation to visualize flow
          if (step >= 2) {
            const upwardBias =
              p.layer === 'retail'
                ? 0.2
                : p.layer === 'marketMakers'
                ? 0.1
                : p.layer === 'institutions'
                ? 0.02
                : 0.3;
            p.position.y += delta * flowIntensity * upwardBias;
            p.position.y = Math.max(
              range.minY,
              Math.min(range.maxY, p.position.y)
            );
          }
        }

        // Update attributes
        const visibleByLayer =
          (p.layer === 'retail' && showRetail) ||
          (p.layer === 'marketMakers' && showMarketMakers) ||
          (p.layer === 'institutions' && showInstitutions) ||
          (p.layer === 'algorithms' && showAlgorithms);
        posAttr.setXYZ(i, p.position.x, p.position.y, p.position.z);
        typeAttr.setX(i, visibleByLayer ? p.type : -1);
        sizeAttr.setX(
          i,
          (visibleByLayer ? p.size : 0) * (p.type === 3 ? 1.8 : 1.0) * 10
        );
        opacityAttr.setX(i, visibleByLayer ? p.opacity : 0);
      }
      posAttr.needsUpdate = true;
      typeAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
      opacityAttr.needsUpdate = true;
      return updated;
    });

    // Animate flow streams (wavy, subtle upward motion)
    if (showFlow && step >= 2) {
      const pos = flowGeometry.getAttribute(
        'position'
      ) as THREE.BufferAttribute;
      const anchors = flowAnchorsRef.current;
      const t = state.clock.elapsedTime;
      let v = 0;
      for (let i = 0; i < anchors.length; i++) {
        const { a, b, c } = anchors[i];
        const wave = Math.sin(t * 1.2 + i) * 0.15 * flowIntensity;
        const up = 0.18 * flowIntensity * delta;
        // Segment 1: a -> b
        pos.setXYZ(v++, a.x + wave, a.y + up * t, a.z - wave);
        pos.setXYZ(v++, b.x - wave, b.y + up * t * 0.7, b.z + wave);
        // Segment 2: b -> c
        pos.setXYZ(v++, b.x + wave, b.y + up * t * 0.7, b.z - wave);
        pos.setXYZ(v++, c.x - wave, c.y + up * t * 0.4, c.z + wave);
      }
      pos.needsUpdate = true;
      flowMaterial.opacity =
        0.15 + 0.1 * Math.abs(Math.sin(state.clock.elapsedTime * 1.5));
    }

    // Animate blue algo network slight flicker
    {
      const pos = algoNetworkGeometry.getAttribute(
        'position'
      ) as THREE.BufferAttribute;
      const anchors = algoAnchorsRef.current;
      let v = 0;
      const flicker =
        0.2 + 0.2 * Math.abs(Math.sin(state.clock.elapsedTime * 6));
      for (let i = 0; i < anchors.length; i++) {
        const { p1, p2 } = anchors[i];
        pos.setXYZ(v++, p1.x, p1.y, p1.z);
        pos.setXYZ(
          v++,
          p2.x + Math.sin(i + state.clock.elapsedTime) * 0.1,
          p2.y,
          p2.z
        );
      }
      pos.needsUpdate = true;
      algoNetworkMaterial.opacity = showAlgorithms ? 0.12 + 0.08 * flicker : 0;
    }

    // Step 3: philosophical text fade-in
    if (step >= 2 && fadeInQuote < 1) {
      setFadeInQuote((prev) => Math.min(1, prev + delta * 0.5));
    }
  });

  // Layer box positions (spread out more to reflect bigger gaps)
  const layerBoxPositions = useMemo(() => {
    const gap = boxSize * 0.48;
    return [-gap, 0, gap];
  }, [boxSize]);

  // Label side X position (place labels on the left side of the box)
  const labelSideX = useMemo(() => boxSize * 1.35, [boxSize]);
  // Label Y positions centered in each layer band
  const labelYPositions = useMemo(() => {
    return {
      retail: (layerYRanges.retail.minY + layerYRanges.retail.maxY) * 0.5,
      marketMakers:
        (layerYRanges.marketMakers.minY + layerYRanges.marketMakers.maxY) * 0.5,
      institutions:
        (layerYRanges.institutions.minY + layerYRanges.institutions.maxY) * 0.5,
    };
  }, [layerYRanges]);
  // Lower the HFT label below the market makers label to avoid overlap
  const hftLabelY = useMemo(() => {
    const mmCenter =
      (layerYRanges.marketMakers.minY + layerYRanges.marketMakers.maxY) * 0.5;
    return mmCenter - boxSize * 0.2;
  }, [layerYRanges, boxSize]);

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
            titleBar={{ title: 'Market Ecosystem Layers' }}
            collapsed={false}
          />
        </div>
      </Html>

      {/* Points */}
      <points ref={pointsRef}>
        <primitive object={geometry} attach="geometry" />
        <primitive object={material} attach="material" />
      </points>

      {/* Flow streams */}
      {showFlow && step >= 2 && (
        <lineSegments geometry={flowGeometry}>
          <primitive object={flowMaterial} attach="material" />
        </lineSegments>
      )}

      {/* Algo network blue lines */}
      {showAlgorithms && (
        <lineSegments geometry={algoNetworkGeometry}>
          <primitive object={algoNetworkMaterial} attach="material" />
        </lineSegments>
      )}

      {/* Translucent layer boxes */}
      {showLayers &&
        layerBoxPositions.map((y, idx) => (
          <mesh key={`layer-box-${idx}`} position={[0, y, 0]}>
            <boxGeometry args={[boxSize, boxSize / 3, boxSize]} />
            <meshBasicMaterial
              wireframe
              color="#ffffff"
              transparent
              opacity={0.15}
            />
          </mesh>
        ))}

      {/* Labels */}
      {showLabels && (
        <>
          <Html
            transform
            sprite
            position={[labelSideX, labelYPositions.retail, 0]}
            style={{ pointerEvents: 'none' }}
          >
            <div
              style={{
                color: 'white',
                background: 'rgba(0,0,0,0.45)',
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.3)',
                fontWeight: 700,
                fontSize: `${Math.max(14, boxSize * 4)}px`,
                whiteSpace: 'nowrap',
                textAlign: 'left',
              }}
            >
              Bottom Layer: Retail Traders
            </div>
          </Html>
          <Html
            transform
            sprite
            position={[labelSideX, labelYPositions.marketMakers, 0]}
            style={{ pointerEvents: 'none' }}
          >
            <div
              style={{
                color: 'yellow',
                background: 'rgba(0,0,0,0.45)',
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid rgba(255,255,0,0.4)',
                fontWeight: 700,
                fontSize: `${Math.max(14, boxSize * 4)}px`,
                whiteSpace: 'nowrap',
                textAlign: 'left',
              }}
            >
              Middle Layer: Market Makers
            </div>
          </Html>
          <Html
            transform
            sprite
            position={[labelSideX, labelYPositions.institutions, 0]}
            style={{ pointerEvents: 'none' }}
          >
            <div
              style={{
                color: 'white',
                background: 'rgba(0,0,0,0.45)',
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.3)',
                fontWeight: 700,
                fontSize: `${Math.max(14, boxSize * 4)}px`,
                whiteSpace: 'nowrap',
                textAlign: 'left',
              }}
            >
              Top Layer: Institutions
            </div>
          </Html>
          <Html
            transform
            sprite
            position={[labelSideX, hftLabelY, 0]}
            style={{ pointerEvents: 'none' }}
          >
            <div
              style={{
                color: '#4aa3ff',
                background: 'rgba(0,0,0,0.45)',
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid rgba(74,163,255,0.4)',
                fontWeight: 700,
                fontSize: `${Math.max(12, boxSize * 3)}px`,
                whiteSpace: 'nowrap',
                textAlign: 'left',
              }}
            >
              Algorithms & HFT (Woven Throughout)
            </div>
          </Html>
        </>
      )}

      {/* Philosophical anchor */}
      {step >= 2 && (
        <Html
          transform
          sprite
          position={[0, boxSize / 2 + 2.0, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              color: 'white',
              background: 'rgba(0, 0, 0, 0.6)',
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.35)',
              fontWeight: 800,
              fontSize: `${Math.max(14, boxSize * 4)}px`,
              whiteSpace: 'nowrap',
              textAlign: 'center',
              opacity: fadeInQuote,
            }}
          >
            "This is not chaos — it's ecology."
          </div>
        </Html>
      )}

      {/* Ground plane for depth perception */}
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

export default VerticalEcosystem3D;
