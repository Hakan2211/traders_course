import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useControls, LevaPanel, useCreateStore, button } from 'leva'
import * as THREE from 'three'

interface BattleInsideBox3DProps {
  levaStore: ReturnType<typeof useCreateStore>
}

// Particle types: 0 = neutral/gray (sideline), 1 = red (seller), 2 = green (buyer)
type ParticleType = 0 | 1 | 2

interface Particle {
  position: THREE.Vector3
  velocity: THREE.Vector3
  type: ParticleType
  size: number
  opacity: number
  basePosition: THREE.Vector3 // Base position for oscillation
  oscillationPhase: number // Phase for oscillation animation
  isEngaging: boolean // Whether particle is moving toward middle zone
  engagementProgress: number // 0-1 progress toward middle
}

const COLLISION_DISTANCE = 0.3
const COLLISION_FLASH_DURATION = 0.3
const BOX_SIZE = 4
const HALF_BOX = BOX_SIZE / 2
const MIDDLE_ZONE_HEIGHT = BOX_SIZE * 0.2 // Middle 20% of box
const OSCILLATION_SPEED = 1.5
const OSCILLATION_AMPLITUDE = 0.3

// Shader material for particle rendering
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
      vColor = vec3(0.6, 0.6, 0.6); // Gray (sideline)
    } else if (particleType < 1.5) {
      vColor = vec3(0.9, 0.2, 0.2); // Red (seller)
    } else {
      vColor = vec3(0.2, 0.9, 0.2); // Green (buyer)
    }
    
    vOpacity = particleOpacity;
  }
`

const particleFragmentShader = `
  varying vec3 vColor;
  varying float vOpacity;
  
  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = (1.0 - smoothstep(0.3, 0.5, dist)) * vOpacity;
    gl_FragColor = vec4(vColor, alpha);
  }
`

export function BattleInsideBox3D({ levaStore }: BattleInsideBox3DProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const [particles, setParticles] = useState<Particle[]>([])
  const [collisionFlashState, setCollisionFlashState] = useState<{
    position: THREE.Vector3
    intensity: number
  } | null>(null)
  const [equilibrium, setEquilibrium] = useState(0) // Y position of equilibrium line
  const equilibriumRef = useRef(0)
  const targetEquilibriumRef = useRef(0)
  const [resetTrigger, setResetTrigger] = useState(0)
  const setResetTriggerRef = useRef(setResetTrigger)

  // Update ref when setter changes
  useEffect(() => {
    setResetTriggerRef.current = setResetTrigger
  }, [setResetTrigger])

  // State tracking
  const buyerCountRef = useRef(0)
  const sellerCountRef = useRef(0)
  const neutralCountRef = useRef(0)

  // Default values for reset
  const defaultValues = {
    buyPressure: 0.5,
    sellPressure: 0.5,
    marketSpeed: 1,
    collisionFlash: true,
    showNeutral: true,
    particleCount: 5000,
    particleSize: 0.2,
  }

  // Leva controls
  const controls = useControls(
    'Battle Inside the Box',
    {
      buyPressure: {
        value: defaultValues.buyPressure,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Buy Pressure',
      },
      sellPressure: {
        value: defaultValues.sellPressure,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Sell Pressure',
      },
      marketSpeed: {
        value: defaultValues.marketSpeed,
        min: 0.1,
        max: 2,
        step: 0.1,
        label: 'Market Speed',
      },
      collisionFlash: {
        value: defaultValues.collisionFlash,
        label: 'Collision Flash',
      },
      showNeutral: {
        value: defaultValues.showNeutral,
        label: 'Show Neutral',
      },
      particleCount: {
        value: defaultValues.particleCount,
        min: 500,
        max: 10000,
        step: 100,
        label: 'Particle Count',
      },
      particleSize: {
        value: defaultValues.particleSize,
        min: 0.05,
        max: 0.5,
        step: 0.01,
        label: 'Particle Size',
      },
      resetMarket: button(() => {
        // Reset Leva controls to default values (batch)
        const resetData: Record<string, any> = {}
        Object.keys(defaultValues).forEach((key) => {
          resetData[`Battle Inside the Box.${key}`] =
            defaultValues[key as keyof typeof defaultValues]
        })
        // Cast to any to support the batch-set signature used by Leva's store
        ;(levaStore as any).set(resetData)

        // Reset internal state
        setResetTriggerRef.current((prev) => prev + 1)
      }),
    },
    { store: levaStore },
  )

  const {
    buyPressure,
    sellPressure,
    marketSpeed,
    collisionFlash,
    showNeutral,
    particleCount,
    particleSize,
  } = controls

  // Initialize particles
  useEffect(() => {
    const newParticles: Particle[] = []
    const buyerSellerCount = Math.floor(particleCount * 0.8) // 80% buyers/sellers
    const neutralCount = particleCount - buyerSellerCount // 20% neutral

    for (let i = 0; i < particleCount; i++) {
      const isNeutral = i >= buyerSellerCount
      let type: ParticleType
      let baseY: number

      if (isNeutral) {
        type = 0 // Gray
        // Neutral particles positioned outside box (sideline)
        baseY = (Math.random() * 2 - 1) * HALF_BOX
      } else {
        // Randomly assign buyer or seller
        type = Math.random() < 0.5 ? 1 : 2
        if (type === 1) {
          // Sellers at top
          baseY = HALF_BOX * (0.3 + Math.random() * 0.5)
        } else {
          // Buyers at bottom
          baseY = -HALF_BOX * (0.3 + Math.random() * 0.5)
        }
      }

      const basePosition = new THREE.Vector3(
        (Math.random() * 2 - 1) * HALF_BOX * 0.9,
        baseY,
        (Math.random() * 2 - 1) * HALF_BOX * 0.9,
      )

      newParticles.push({
        position: basePosition.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
        ),
        type,
        size: particleSize,
        opacity: 1.0,
        basePosition,
        oscillationPhase: Math.random() * Math.PI * 2,
        isEngaging: false,
        engagementProgress: 0,
      })
    }

    setParticles(newParticles)
  }, [particleCount, particleSize])

  // Handle reset trigger
  useEffect(() => {
    if (resetTrigger > 0) {
      setParticles((prev) => {
        return prev.map((p) => {
          const buyerSellerCount = Math.floor(prev.length * 0.8)
          const isNeutral = prev.indexOf(p) >= buyerSellerCount

          let newType: ParticleType = p.type
          let newBaseY = p.basePosition.y

          if (!isNeutral) {
            newType = Math.random() < 0.5 ? 1 : 2
            if (newType === 1) {
              newBaseY = HALF_BOX * (0.3 + Math.random() * 0.5)
            } else {
              newBaseY = -HALF_BOX * (0.3 + Math.random() * 0.5)
            }
          }

          const newBasePosition = new THREE.Vector3(
            p.basePosition.x,
            newBaseY,
            p.basePosition.z,
          )

          return {
            ...p,
            type: newType,
            position: newBasePosition.clone(),
            basePosition: newBasePosition,
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 0.2,
              (Math.random() - 0.5) * 0.2,
              (Math.random() - 0.5) * 0.2,
            ),
            isEngaging: false,
            engagementProgress: 0,
          }
        })
      })
      setEquilibrium(0)
      equilibriumRef.current = 0
      targetEquilibriumRef.current = 0
      setCollisionFlashState(null)
    }
  }, [resetTrigger])

  // Create geometry
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const types = new Float32Array(particleCount)
    const sizes = new Float32Array(particleCount)
    const opacities = new Float32Array(particleCount)

    // Initialize with default values
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 0
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = 0
      types[i] = 0
      sizes[i] = particleSize
      opacities[i] = 0 // Start invisible until particles are initialized
    }

    geom.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3),
    )
    geom.setAttribute(
      'particleType',
      new THREE.Float32BufferAttribute(types, 1),
    )
    geom.setAttribute(
      'particleSize',
      new THREE.Float32BufferAttribute(sizes, 1),
    )
    geom.setAttribute(
      'particleOpacity',
      new THREE.Float32BufferAttribute(opacities, 1),
    )

    return geom
  }, [particleCount, particleSize])

  // Create material
  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {}, // Explicitly define empty uniforms object
    })
    return mat
  }, [])

  // Calculate equilibrium based on buy/sell pressure
  useEffect(() => {
    const netForce = buyPressure - sellPressure
    const maxEquilibrium = HALF_BOX * 0.8 // Limit movement
    targetEquilibriumRef.current = netForce * maxEquilibrium
  }, [buyPressure, sellPressure])

  // Update particles and handle collisions
  useFrame((state, delta) => {
    if (particles.length === 0 || !pointsRef.current) return

    const geom = pointsRef.current.geometry
    if (!geom) return

    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute
    const typeAttr = geom.getAttribute('particleType') as THREE.BufferAttribute
    const sizeAttr = geom.getAttribute('particleSize') as THREE.BufferAttribute
    const opacityAttr = geom.getAttribute(
      'particleOpacity',
    ) as THREE.BufferAttribute

    if (!posAttr || !typeAttr || !sizeAttr || !opacityAttr) return

    const adjustedDelta = delta * marketSpeed
    const time = state.clock.elapsedTime

    // Update equilibrium with easing
    equilibriumRef.current = THREE.MathUtils.lerp(
      equilibriumRef.current,
      targetEquilibriumRef.current,
      0.05,
    )
    setEquilibrium(equilibriumRef.current)

    // Count particles
    let buyerCount = 0
    let sellerCount = 0
    let neutralCount = 0

    setParticles((prevParticles) => {
      const updatedParticles = [...prevParticles]
      const middleZoneCenter = equilibriumRef.current
      const middleZoneTop = middleZoneCenter + MIDDLE_ZONE_HEIGHT / 2
      const middleZoneBottom = middleZoneCenter - MIDDLE_ZONE_HEIGHT / 2

      updatedParticles.forEach((particle, idx) => {
        // Count particles
        if (particle.type === 0) neutralCount++
        else if (particle.type === 1) sellerCount++
        else if (particle.type === 2) buyerCount++

        // Skip neutral particles if not showing
        if (particle.type === 0 && !showNeutral) {
          return
        }

        // Oscillation around base position
        const oscillationOffset = new THREE.Vector3(
          Math.sin(time * OSCILLATION_SPEED + particle.oscillationPhase) *
            OSCILLATION_AMPLITUDE,
          Math.cos(time * OSCILLATION_SPEED + particle.oscillationPhase) *
            OSCILLATION_AMPLITUDE,
          Math.sin(time * OSCILLATION_SPEED * 0.7 + particle.oscillationPhase) *
            OSCILLATION_AMPLITUDE,
        )

        // Determine if particle should engage (move toward middle)
        if (particle.type !== 0) {
          const distanceToMiddle = Math.abs(
            particle.position.y - middleZoneCenter,
          )
          const shouldEngage =
            distanceToMiddle > MIDDLE_ZONE_HEIGHT * 0.5 &&
            Math.random() < 0.02 * marketSpeed // Random chance to engage

          if (shouldEngage) {
            particle.isEngaging = true
            particle.engagementProgress = 0
          }

          if (particle.isEngaging) {
            // Move toward middle zone
            const targetY =
              middleZoneCenter +
              (Math.random() * 2 - 1) * MIDDLE_ZONE_HEIGHT * 0.3
            const direction = new THREE.Vector3(
              (Math.random() * 2 - 1) * HALF_BOX * 0.8 - particle.position.x,
              targetY - particle.position.y,
              (Math.random() * 2 - 1) * HALF_BOX * 0.8 - particle.position.z,
            ).normalize()

            // Apply pressure-based velocity
            let speedMultiplier = 1
            if (particle.type === 2) {
              // Buyers - stronger when buy pressure is high
              speedMultiplier = 0.5 + buyPressure * 1.5
            } else if (particle.type === 1) {
              // Sellers - stronger when sell pressure is high
              speedMultiplier = 0.5 + sellPressure * 1.5
            }

            particle.velocity.lerp(
              direction.multiplyScalar(speedMultiplier),
              adjustedDelta * 2,
            )
            particle.position.add(
              particle.velocity.clone().multiplyScalar(adjustedDelta),
            )
            particle.engagementProgress += adjustedDelta * 2

            // Check if reached middle zone
            if (
              particle.position.y >= middleZoneBottom &&
              particle.position.y <= middleZoneTop
            ) {
              // In middle zone - add random movement for collisions
              particle.velocity.add(
                new THREE.Vector3(
                  (Math.random() - 0.5) * 0.5,
                  (Math.random() - 0.5) * 0.5,
                  (Math.random() - 0.5) * 0.5,
                ),
              )
              particle.velocity.clampLength(0, 3)
            }

            // Stop engaging after some time or if too far
            if (
              particle.engagementProgress > 3 ||
              Math.abs(particle.position.y - particle.basePosition.y) >
                HALF_BOX * 1.5
            ) {
              particle.isEngaging = false
              particle.engagementProgress = 0
            }
          } else {
            // Normal oscillation around base position
            const targetPos = particle.basePosition
              .clone()
              .add(oscillationOffset)
            particle.position.lerp(targetPos, adjustedDelta * 2)
          }

          // Apply pressure-based drift
          if (particle.type === 2 && buyPressure > 0.5) {
            // Buyers drift upward when buy pressure is high
            particle.position.y += (buyPressure - 0.5) * adjustedDelta * 0.5
          } else if (particle.type === 1 && sellPressure > 0.5) {
            // Sellers drift downward when sell pressure is high
            particle.position.y -= (sellPressure - 0.5) * adjustedDelta * 0.5
          }

          // Keep particles within bounds
          particle.position.x = THREE.MathUtils.clamp(
            particle.position.x,
            -HALF_BOX,
            HALF_BOX,
          )
          particle.position.y = THREE.MathUtils.clamp(
            particle.position.y,
            -HALF_BOX,
            HALF_BOX,
          )
          particle.position.z = THREE.MathUtils.clamp(
            particle.position.z,
            -HALF_BOX,
            HALF_BOX,
          )

          // Return to base if not engaging and far from base
          if (
            !particle.isEngaging &&
            particle.position.distanceTo(particle.basePosition) > HALF_BOX * 0.5
          ) {
            particle.position.lerp(particle.basePosition, adjustedDelta * 1)
          }
        } else {
          // Neutral particles just oscillate
          const targetPos = particle.basePosition.clone().add(oscillationOffset)
          particle.position.lerp(targetPos, adjustedDelta * 1)
        }

        // Update geometry attributes
        const visible = particle.type !== 0 || showNeutral
        posAttr.setXYZ(
          idx,
          particle.position.x,
          particle.position.y,
          particle.position.z,
        )
        typeAttr.setX(idx, visible ? particle.type : -1)
        sizeAttr.setX(idx, visible ? particle.size * 10 : 0)
        opacityAttr.setX(idx, visible ? particle.opacity : 0)
      })

      // Detect collisions in middle zone (stop after first hit to reduce cost)
      for (let i = 0; i < updatedParticles.length; i++) {
        const p1 = updatedParticles[i]
        if (p1.type === 0 || p1.opacity === 0) continue

        const inMiddleZone =
          p1.position.y >= middleZoneBottom && p1.position.y <= middleZoneTop

        if (!inMiddleZone) continue

        for (let j = i + 1; j < updatedParticles.length; j++) {
          const p2 = updatedParticles[j]
          if (p2.type === 0 || p2.opacity === 0) continue

          // Check for red-green collision
          const isRedGreenCollision =
            (p1.type === 1 && p2.type === 2) || (p1.type === 2 && p2.type === 1)

          if (isRedGreenCollision) {
            const distance = p1.position.distanceTo(p2.position)
            if (distance < COLLISION_DISTANCE) {
              if (collisionFlash) {
                const collisionPoint = p1.position
                  .clone()
                  .add(p2.position)
                  .multiplyScalar(0.5)
                setCollisionFlashState({
                  position: collisionPoint,
                  intensity: 1.0,
                })
              }

              // Optional: ownership swap (random chance)
              if (Math.random() < 0.3) {
                // Swap ownership
                const tempType = p1.type
                p1.type = p2.type
                p2.type = tempType

                // Update base positions
                if (p1.type === 1) {
                  p1.basePosition.y = HALF_BOX * (0.3 + Math.random() * 0.5)
                } else if (p1.type === 2) {
                  p1.basePosition.y = -HALF_BOX * (0.3 + Math.random() * 0.5)
                }

                if (p2.type === 1) {
                  p2.basePosition.y = HALF_BOX * (0.3 + Math.random() * 0.5)
                } else if (p2.type === 2) {
                  p2.basePosition.y = -HALF_BOX * (0.3 + Math.random() * 0.5)
                }

                // Add bounce velocity
                const direction = p1.position
                  .clone()
                  .sub(p2.position)
                  .normalize()
                p1.velocity.add(direction.multiplyScalar(0.5))
                p2.velocity.add(direction.multiplyScalar(-0.5))
              } else {
                // Bounce off each other
                const direction = p1.position
                  .clone()
                  .sub(p2.position)
                  .normalize()
                p1.velocity.add(direction.multiplyScalar(0.3))
                p2.velocity.add(direction.multiplyScalar(-0.3))
              }

              // Limit velocities
              p1.velocity.clampLength(0, 3)
              p2.velocity.clampLength(0, 3)
              // Break out after first collision found
              i = updatedParticles.length
              break
            }
          }
        }
      }

      posAttr.needsUpdate = true
      typeAttr.needsUpdate = true
      sizeAttr.needsUpdate = true
      opacityAttr.needsUpdate = true

      return updatedParticles
    })

    // Decay single flash intensity
    if (collisionFlashState) {
      setCollisionFlashState((prev) => {
        if (!prev) return null
        const newIntensity = Math.max(
          0,
          prev.intensity - adjustedDelta * (1 / COLLISION_FLASH_DURATION),
        )
        return newIntensity > 0 ? { ...prev, intensity: newIntensity } : null
      })
    }

    // Update refs
    buyerCountRef.current = buyerCount
    sellerCountRef.current = sellerCount
    neutralCountRef.current = neutralCount
  })

  // Calculate scene color tint based on pressure
  const sceneTint = useMemo(() => {
    const netForce = buyPressure - sellPressure
    if (netForce > 0.1) {
      // Green tint (buyers winning)
      return new THREE.Color(0.1, 0.15, 0.1)
    } else if (netForce < -0.1) {
      // Red tint (sellers winning)
      return new THREE.Color(0.15, 0.1, 0.1)
    }
    return new THREE.Color(0.1, 0.1, 0.1) // Neutral
  }, [buyPressure, sellPressure])

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
            titleBar={{ title: 'Battle Inside the Box' }}
            collapsed={false}
          />
        </div>
      </Html>

      {/* Main particles */}
      <points ref={pointsRef}>
        <primitive object={geometry} attach="geometry" />
        <primitive object={material} attach="material" />
      </points>

      {/* Collision flash (single, decaying) */}
      {collisionFlashState && (
        <mesh position={collisionFlashState.position}>
          <sphereGeometry args={[0.25, 12, 12]} />
          <meshBasicMaterial
            color="#ffffaa"
            transparent
            opacity={collisionFlashState.intensity}
          />
        </mesh>
      )}

      {/* Equilibrium line (price marker) */}
      <group position={[0, equilibrium, 0]}>
        <mesh>
          <boxGeometry args={[BOX_SIZE * 1.2, 0.05, 0.1]} />
          <meshStandardMaterial
            color="#4a9eff"
            emissive="#2a7fff"
            emissiveIntensity={0.8}
            transparent
            opacity={0.9}
          />
        </mesh>
        {/* Glow effect */}
        <mesh>
          <boxGeometry args={[BOX_SIZE * 1.3, 0.15, 0.2]} />
          <meshStandardMaterial
            color="#4a9eff"
            transparent
            opacity={0.2}
            emissive="#2a7fff"
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* Label */}
        <Html
          position={[BOX_SIZE * 0.7, 0, 0]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              color: 'white',
              background: 'rgba(0, 0, 0, 0.7)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              textAlign: 'center',
            }}
          >
            Price
          </div>
        </Html>
      </group>

      {/* Middle zone visualization */}
      <mesh position={[0, equilibrium, 0]}>
        <boxGeometry
          args={[BOX_SIZE * 1.1, MIDDLE_ZONE_HEIGHT, BOX_SIZE * 1.1]}
        />
        <meshStandardMaterial
          color="#ffff00"
          transparent
          opacity={0.1}
          emissive="#ffff00"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Ground plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -HALF_BOX * 1.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[BOX_SIZE * 3, BOX_SIZE * 3]} />
        <meshStandardMaterial
          color="#a6a09b"
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>
    </>
  )
}

export default BattleInsideBox3D
