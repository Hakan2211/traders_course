
import React from 'react';
import { useCreateStore } from 'leva';
import { CanvasWrapper } from '@/components/mdx_components/canvas3d/canvasWrapper';
import EquilibriumAndPressure3D from './EquilibriumAndPressure3D';

const EquilibriumAndPressureContainer = () => {
  // Create a scoped Leva store to pass to the 3D component
  const levaStore = useCreateStore();

  return (
    <div className="w-full my-8">
      <CanvasWrapper
        enableEnvironment={false}
        enableControls={true}
        height="600px"
        cameraSettings={{
          position: [0, 1, -20],
          fov: 50,
        }}
      >
        <EquilibriumAndPressure3D levaStore={levaStore} />
      </CanvasWrapper>
    </div>
  );
};

export default EquilibriumAndPressureContainer;
