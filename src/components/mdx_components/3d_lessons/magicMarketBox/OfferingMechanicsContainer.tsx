
import React from 'react';
import { useCreateStore } from 'leva';
import { CanvasWrapper } from '@/components/mdx_components/canvas3d/canvasWrapper';
import OfferingMechanics3D from './OfferingMechanics3D';

const OfferingMechanicsContainer = () => {
  const levaStore = useCreateStore();

  return (
    <div className="w-full my-8">
      <CanvasWrapper
        enableEnvironment={false}
        enableControls={true}
        height="640px"
        cameraSettings={{
          position: [11, 6, 11],
          fov: 45,
        }}
      >
        <OfferingMechanics3D levaStore={levaStore} />
      </CanvasWrapper>
    </div>
  );
};

export default OfferingMechanicsContainer;
