import React from 'react';
import { useCreateStore } from 'leva';
import { CanvasWrapper } from '@/components/mdx_components/canvas3d/canvasWrapper';
import VolumeRotation3D from './VolumeRotation3D';

const VolumeRotationContainer = () => {
  const levaStore = useCreateStore();

  return (
    <div className="w-full my-8">
      <CanvasWrapper
        enableEnvironment={false}
        enableControls={false}
        height="720px"
        cameraSettings={{
          position: [0, 0.5, 7],
          //fov: 55,
        }}
      >
        <VolumeRotation3D levaStore={levaStore} />
      </CanvasWrapper>
    </div>
  );
};

export default VolumeRotationContainer;
