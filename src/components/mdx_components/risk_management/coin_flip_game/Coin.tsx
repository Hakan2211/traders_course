import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { CoinSide } from './types'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any
      mesh: any
      cylinderGeometry: any
      primitive: any
      meshStandardMaterial: any
      ambientLight: any
      spotLight: any
      planeGeometry: any
      boxGeometry: any
    }
  }
}

interface CoinProps {
  isFlipping: boolean
  result: CoinSide | null
  onLand?: () => void
}

export const Coin: React.FC<CoinProps> = ({ isFlipping, result, onLand }) => {
  const groupRef = useRef<THREE.Group>(null)
  const timeRef = useRef(0)
  const startY = 1.0 // Hover slightly above table
  const flipHeight = 4

  // Materials
  const goldParams = {
    color: '#FFD700',
    metalness: 1,
    roughness: 0.3,
    envMapIntensity: 1.5,
  }

  const edgeParams = {
    color: '#B8860B',
    metalness: 1,
    roughness: 0.5,
  }

  const textMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#8B4513',
        metalness: 0.5,
        roughness: 0.8,
      }),
    [],
  )

  useFrame((state, delta) => {
    if (!groupRef.current) return

    if (isFlipping) {
      timeRef.current += delta * 1.5 // Speed of flip animation

      const t = timeRef.current

      // Vertical Motion (Parabola)
      // Simple physics sim: up and down
      const y = startY + Math.sin(t * Math.PI) * flipHeight

      // Rotation (Spin)
      // Spin fast on X axis
      const rotX = t * Math.PI * 10

      // Wobble slightly on Z
      const rotZ = Math.sin(t * 10) * 0.2

      groupRef.current.position.y = Math.max(startY, y)
      groupRef.current.rotation.x = rotX
      groupRef.current.rotation.z = rotZ
    } else if (result) {
      // Landing animation / Settle
      const baseTarget = result === CoinSide.HEADS ? 0 : Math.PI

      // Smoothly interpolate to landing position
      // Reset position to table
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        startY,
        0.1,
      )

      // Smart rotation settling: find the closest multiple of 2PI to the current rotation
      // that matches the target orientation (0 or PI)
      const currentX = groupRef.current.rotation.x
      const k = Math.round((currentX - baseTarget) / (Math.PI * 2))
      const finalTarget = baseTarget + k * (Math.PI * 2)

      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        currentX,
        finalTarget,
        0.1,
      )

      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        0,
        0.1,
      )

      // Reset time for next flip
      timeRef.current = 0
    }
  })

  return (
    <group ref={groupRef} position={[0, startY, 0]}>
      {/* Coin Cylinder */}
      <mesh>
        <cylinderGeometry args={[1.2, 1.2, 0.15, 64]} />
        <meshStandardMaterial attach="material-0" {...edgeParams} />{' '}
        {/* Side */}
        <meshStandardMaterial attach="material-1" {...goldParams} /> {/* Top */}
        <meshStandardMaterial attach="material-2" {...goldParams} />{' '}
        {/* Bottom */}
      </mesh>

      {/* Heads Side Text */}
      <group position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.35}
          anchorX="center"
          anchorY="middle"
          material={textMaterial}
        >
          WIN +50%
        </Text>
        <Text
          position={[0, -0.3, 0]}
          fontSize={0.2}
          anchorX="center"
          anchorY="middle"
          material={textMaterial}
        >
          HEADS
        </Text>
      </group>

      {/* Tails Side Text */}
      <group position={[0, -0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.35}
          anchorX="center"
          anchorY="middle"
          material={textMaterial}
        >
          LOSE -40%
        </Text>
        <Text
          position={[0, -0.3, 0]}
          fontSize={0.2}
          anchorX="center"
          anchorY="middle"
          material={textMaterial}
        >
          TAILS
        </Text>
      </group>
    </group>
  )
}
