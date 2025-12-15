
import React from 'react';
import { useCreateStore } from 'leva';
import { CanvasWrapper } from '@/components/mdx_components/canvas3d/canvasWrapper';
import EnergyAndMotion3D from './EnergyAndMotion3D';

const EnergyAndMotionContainer = () => {
  // Create a scoped Leva store to pass to the 3D component
  const levaStore = useCreateStore();

  return (
    <div className="w-full my-8">
      <CanvasWrapper
        enableEnvironment={false}
        enableControls={true}
        height="600px"
        cameraSettings={{
          position: [-8, 2, -8],
          fov: 50,
        }}
      >
        <EnergyAndMotion3D levaStore={levaStore} />
      </CanvasWrapper>
    </div>
  );
};

export default EnergyAndMotionContainer;
