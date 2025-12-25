import React, { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Graph } from './Graph'
import { UI } from './UI'
import { SCENARIOS } from './data'
import { Position, Correlation } from './types'

const SceneContent = ({
  positions,
  correlations,
  crisisMode,
}: {
  positions: Position[]
  correlations: Correlation[]
  crisisMode: boolean
}) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      <Graph
        positions={positions}
        correlations={correlations}
        crisisMode={crisisMode}
      />

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={5}
        maxDistance={30}
        autoRotate={!crisisMode}
        autoRotateSpeed={0.5}
      />

      {/* Background Atmosphere */}
      <Environment preset="city" blur={0.8} background={false} />
    </>
  )
}

export const RiskConstellation: React.FC = () => {
  const [currentScenarioId, setCurrentScenarioId] = useState('mike_disaster')
  const [positions, setPositions] = useState<Position[]>([])
  const [correlations, setCorrelations] = useState<Correlation[]>([])
  const [crisisMode, setCrisisMode] = useState(false)

  // Load Scenario Logic
  const loadScenario = (id: string) => {
    const scenario = SCENARIOS.find((s) => s.id === id)
    if (scenario) {
      setPositions([...scenario.positions])
      setCorrelations([...scenario.correlations])
      setCurrentScenarioId(id)
      setCrisisMode(false) // Reset crisis mode on change
    }
  }

  // Initial Load
  useEffect(() => {
    loadScenario('mike_disaster')
  }, [])

  return (
    <div className="relative w-full h-[600px] bg-slate-950 overflow-hidden rounded-xl border border-slate-800 shadow-2xl my-8">
      {/* Grid Overlay for "Holo" feel */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950/50 to-slate-950" />
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* 3D Canvas */}
      <div className="absolute inset-0 z-1">
        <Canvas camera={{ position: [0, 0, 20], fov: 45 }}>
          <SceneContent
            positions={positions}
            correlations={correlations}
            crisisMode={crisisMode}
          />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <UI
        positions={positions}
        correlations={correlations}
        crisisMode={crisisMode}
        setCrisisMode={setCrisisMode}
        loadScenario={loadScenario}
        currentScenarioId={currentScenarioId}
      />
    </div>
  )
}
