
import React from 'react';
import { useCreateStore } from 'leva';
import { CanvasWrapper } from '@/components/mdx_components/canvas3d/canvasWrapper';
import ParticleModel3D from './ParticleModel3D';

const ParticleModelContainer = () => {
  // Create a scoped Leva store to pass to the 3D component
  const levaStore = useCreateStore();

  return (
    <div className="w-full my-8">
      <CanvasWrapper
        enableEnvironment={false}
        enableControls={true}
        height="600px"
        cameraSettings={{
          position: [-6, 1.5, 6],
          fov: 50,
        }}
      >
        <ParticleModel3D levaStore={levaStore} />
      </CanvasWrapper>
    </div>
  );
};

export default ParticleModelContainer;
