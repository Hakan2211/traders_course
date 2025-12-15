
import React from 'react';
import { useCreateStore } from 'leva';
import { CanvasWrapper } from '@/components/mdx_components/canvas3d/canvasWrapper';
import ShortingMechanism3D from './ShortingMechanism3D';

const ShortingMechanismContainer = () => {
  const levaStore = useCreateStore();

  return (
    <div className="w-full my-8">
      <CanvasWrapper
        enableEnvironment={false}
        enableControls={true}
        height="600px"
        cameraSettings={{
          position: [0, 6, -36],
          fov: 50,
        }}
      >
        <ShortingMechanism3D levaStore={levaStore} />
      </CanvasWrapper>
    </div>
  );
};

export default ShortingMechanismContainer;
