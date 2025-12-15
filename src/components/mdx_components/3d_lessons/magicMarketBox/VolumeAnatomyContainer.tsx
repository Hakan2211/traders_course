
import React from 'react';
import { useCreateStore } from 'leva';
import { CanvasWrapper } from '@/components/mdx_components/canvas3d/canvasWrapper';
import VolumeAnatomy3D from './VolumeAnatomy3D';

const VolumeAnatomyContainer = () => {
  const levaStore = useCreateStore();

  return (
    <div className="w-full my-8">
      <CanvasWrapper
        enableEnvironment={false}
        enableControls={true}
        height="700px"
        cameraSettings={{
          position: [8, 0, -7],
          fov: 50,
        }}
      >
        <VolumeAnatomy3D levaStore={levaStore} />
      </CanvasWrapper>
    </div>
  );
};

export default VolumeAnatomyContainer;
