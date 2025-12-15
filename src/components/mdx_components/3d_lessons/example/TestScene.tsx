import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshWobbleMaterial, Box } from '@react-three/drei';
import * as THREE from 'three';

export function MyCoolModelScene() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state: any, delta: number) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <Box
      ref={meshRef}
      args={[1, 1, 1]}
      castShadow
      receiveShadow
      position={[0, 0.5, 0]}
    >
      {/* Example using a fun material */}
      <MeshWobbleMaterial color="#f56c42" speed={1} factor={0.6} />
      {/* Or a standard material */}
      {/* <meshStandardMaterial color="orange" roughness={0.5} metalness={0.5} /> */}
    </Box>
  );
}

// Default export is often convenient for next/dynamic
export default MyCoolModelScene;
