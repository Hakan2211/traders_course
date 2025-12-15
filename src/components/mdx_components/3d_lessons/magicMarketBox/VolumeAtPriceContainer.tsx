
import React from 'react';
import { useCreateStore } from 'leva';
import { CanvasWrapper } from '@/components/mdx_components/canvas3d/canvasWrapper';
import VolumeAtPrice3D from './VolumeAtPrice3D';

const VolumeAtPriceContainer = () => {
  const levaStore = useCreateStore();

  return (
    <div className="w-full my-8">
      <CanvasWrapper
        enableEnvironment={false}
        enableControls={true}
        height="640px"
        cameraSettings={{
          position: [0, 0, -13],
          fov: 45,
        }}
      >
        <VolumeAtPrice3D levaStore={levaStore} />
      </CanvasWrapper>
    </div>
  );
};

export default VolumeAtPriceContainer;
