
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Stars,
  BakeShadows,
  Html,
} from '@react-three/drei';
import { useControls, LevaPanel, useCreateStore } from 'leva';
import { Graves } from './Graves';
import { GraveData, TraderArchetype } from './types';

interface SceneProps {
  onGraveHover: (data: GraveData | null) => void;
  levaStore: ReturnType<typeof useCreateStore>;
}

export const GraveyardScene: React.FC<SceneProps> = ({
  onGraveHover,
  levaStore,
}) => {
  const { fogDensity, graveCount, filter, ambientIntensity } = useControls(
    'Graveyard Controls',
    {
      fogDensity: {
        value: 0.18,
        min: 0,
        max: 0.2,
        step: 0.01,
        label: 'Fog Density',
      },
      graveCount: {
        value: 3000,
        min: 100,
        max: 5000,
        step: 100,
        label: 'Grave Count',
      },
      ambientIntensity: {
        value: 2.0,
        min: 0,
        max: 3,
        step: 0.1,
        label: 'Moonlight',
      },
      filter: {
        value: 'All',
        options: ['All', ...Object.values(TraderArchetype)],
        label: 'Show Archetype',
      },
    },
    { store: levaStore }
  );

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative bg-slate-950">
      <Canvas shadows camera={{ position: [0, 2, 12], fov: 60 }} dpr={[1, 2]}>
        <color attach="background" args={['#020617']} />
        {fogDensity > 0 && (
          <fog
            attach="fog"
            args={[
              '#020617',
              5,
              5 + ((0.2 - fogDensity) / 0.2) * 45, // Range: 5 (heavy fog) to 50 (light fog)
            ]}
          />
        )}

        <Suspense fallback={null}>
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
                titleBar={{ title: 'Graveyard Controls' }}
                collapsed={false}
              />
            </div>
          </Html>

          <ambientLight intensity={ambientIntensity} color="#a5f3fc" />
          <directionalLight
            position={[10, 20, 5]}
            intensity={ambientIntensity * 0.5}
            color="#a5f3fc"
            castShadow
          />
          <pointLight
            position={[10, 10, 10]}
            intensity={ambientIntensity * 0.3}
            castShadow
          />

          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />

          <Graves count={graveCount} filter={filter} onHover={onGraveHover} />

          {/* Ground */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.01, 0]}
            receiveShadow
          >
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial
              color="#0f172a"
              roughness={0.8}
              metalness={0.2}
            />
          </mesh>

          <ContactShadows
            resolution={512}
            scale={50}
            blur={2}
            opacity={0.5}
            far={10}
            color="#000000"
          />

          <spotLight
            position={[0, 15, 0]}
            angle={0.5}
            penumbra={1}
            intensity={ambientIntensity * 0.4}
            color="#4a5568"
            castShadow
          />
          <OrbitControls
            maxPolarAngle={Math.PI / 2 - 0.05}
            minPolarAngle={Math.PI / 3}
            enableZoom={false}
            autoRotate={true}
            autoRotateSpeed={0.5}
            enablePan={false}
            maxDistance={20}
            minDistance={5}
          />
          <BakeShadows />
        </Suspense>
      </Canvas>

      <div className="absolute bottom-4 left-4 text-slate-500 text-xs pointer-events-none z-10">
        <p>Interactive 3D • Drag to look around • Use controls to clear fog</p>
      </div>
    </div>
  );
};
