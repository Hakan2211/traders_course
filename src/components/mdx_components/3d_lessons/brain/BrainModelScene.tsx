import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

export default function BrainModelScene() {
  const { scene } = useGLTF('/3models/scene.gltf', true)
  const modelRef = useRef<THREE.Group>(null)

  useFrame((_state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.1
    }
  })

  return (
    <primitive ref={modelRef} object={scene} scale={2} position={[0, -1, 0]} />
  )
}

useGLTF.preload('/3models/scene.gltf', true)
