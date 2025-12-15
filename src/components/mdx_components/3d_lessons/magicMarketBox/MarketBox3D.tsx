
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Decal, useTexture, Html } from '@react-three/drei';
import { Mesh, BufferGeometry, LineSegments, LineBasicMaterial } from 'three';
import * as THREE from 'three';
import { useControls, LevaPanel, useCreateStore } from 'leva';

interface MarketBox3DProps {
  levaStore: ReturnType<typeof useCreateStore>;
}

export function MarketBox3D({ levaStore }: MarketBox3DProps) {
  const meshRef = useRef<Mesh>(null);

  // Load the texture for the decal
  const texture = useTexture('/textures/earth_texture.jpg');

  // Leva controls for camera rotation
  const { cameraAngleY, cameraAngleX } = useControls(
    'Perspective Control',
    {
      cameraAngleY: {
        value: -45,
        min: -45,
        max: 45,
        step: 1,
        label: 'Horizontal Perspective',
      },
      cameraAngleX: {
        value: 30,
        min: -30,
        max: 60,
        step: 1,
        label: 'Vertical Perspective',
      },
    },
    { store: levaStore }
  );

  // Smooth camera rotation - initialize to default values
  const currentAngleY = useRef((-45 * Math.PI) / 180); // -45 degrees in radians
  const currentAngleX = useRef((30 * Math.PI) / 180); // 30 degrees in radians

  // Create line segments object for front face edges only
  const frontFaceEdges = useMemo(() => {
    const geometry = new BufferGeometry();
    const size = 1; // Half of box size (box is 2x2x2)
    const z = size + 0.01; // Slightly offset to avoid z-fighting

    // Four edges of the front face (positive Z)
    const vertices = new Float32Array([
      // Top edge
      -size,
      size,
      z,
      size,
      size,
      z,
      // Right edge
      size,
      size,
      z,
      size,
      -size,
      z,
      // Bottom edge
      size,
      -size,
      z,
      -size,
      -size,
      z,
      // Left edge
      -size,
      -size,
      z,
      -size,
      size,
      z,
    ]);

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const material = new LineBasicMaterial({ color: '#00d4ff' });
    return new LineSegments(geometry, material);
  }, []);

  useFrame(({ camera }) => {
    // Convert angles to radians and interpolate smoothly
    const targetAngleYRad = (cameraAngleY * Math.PI) / 180;
    const targetAngleXRad = (cameraAngleX * Math.PI) / 180;
    const lerpFactor = 0.05; // Smooth interpolation factor

    currentAngleY.current +=
      (targetAngleYRad - currentAngleY.current) * lerpFactor;
    currentAngleX.current +=
      (targetAngleXRad - currentAngleX.current) * lerpFactor;

    // Calculate camera position using spherical coordinates
    // Horizontal angle (azimuth) and vertical angle (elevation)
    const radius = 5;
    const horizontalRadius = radius * Math.cos(currentAngleX.current);
    const cameraX = Math.sin(currentAngleY.current) * horizontalRadius;
    const cameraZ = Math.cos(currentAngleY.current) * horizontalRadius;
    const cameraY = radius * Math.sin(currentAngleX.current);

    // Update camera position
    camera.position.set(cameraX, cameraY, cameraZ);
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      {/* Leva Panel inside the canvas */}
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
            titleBar={{ title: 'Perspective Control' }}
            collapsed={true}
          />
        </div>
      </Html>

      {/* The main box */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.4} metalness={0.3} />

        {/* Decal on the front face (positive Z) */}
        <Decal
          position={[0, 0, 1.01]} // Slightly offset to avoid z-fighting
          rotation={[0, 0, 0]}
          scale={[1.8, 1.8, 1.8]}
          map={texture}
        />
      </mesh>

      {/* Highlighted edges for front face only */}
      <primitive object={frontFaceEdges} />

      {/* Plane under the box */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial
          color="#e7e5e4"
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>
    </>
  );
}

export default MarketBox3D;
