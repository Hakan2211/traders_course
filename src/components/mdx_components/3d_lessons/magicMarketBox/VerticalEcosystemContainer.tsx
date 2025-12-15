
import React from 'react';
import { useCreateStore } from 'leva';
import { CanvasWrapper } from '@/components/mdx_components/canvas3d/canvasWrapper';
import VerticalEcosystem3D from './VerticalEcosystem3D';

const VerticalEcosystemContainer = () => {
  const levaStore = useCreateStore();

  return (
    <div className="w-full my-8">
      <CanvasWrapper
        enableEnvironment={false}
        enableControls={true}
        height="600px"
        cameraSettings={{
          position: [0, 1, -17],
          fov: 50,
        }}
      >
        <VerticalEcosystem3D levaStore={levaStore} />
      </CanvasWrapper>
    </div>
  );
};

export default VerticalEcosystemContainer;
