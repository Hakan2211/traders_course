
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { SetupData } from './types';
import { setups } from './data';
import { SetupNode } from './SetupNode';
import { MatrixGrid } from './MatrixGrid';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

interface SceneProps {
  selectedSetup: SetupData | null;
  onSelectSetup: (setup: SetupData | null) => void;
}

export const Scene: React.FC<SceneProps> = ({
  selectedSetup,
  onSelectSetup,
}) => {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[8, 3, 33]} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            maxPolarAngle={Math.PI / 1.5}
            minDistance={3}
            maxDistance={35}
            autoRotate={false}
          />

          <color attach="background" args={['#050505']} />
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />

          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight
            position={[-10, -10, -10]}
            intensity={0.5}
            color="#3b82f6"
          />

          <group onPointerMissed={() => onSelectSetup(null)}>
            <MatrixGrid />
            {setups.map((setup) => (
              <SetupNode
                key={setup.id}
                setup={setup}
                isSelected={selectedSetup?.id === setup.id}
                onSelect={onSelectSetup}
              />
            ))}
          </group>
          <EffectComposer>
            <Bloom
              luminanceThreshold={0.5}
              luminanceSmoothing={0.9}
              height={300}
              intensity={1.5}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
};
