
import React from 'react';
import { useCreateStore } from 'leva';
import { CanvasWrapper } from '@/components/mdx_components/canvas3d/canvasWrapper';
import CatalystSimulator3D from './CatalystSimulator3D';

const CatalystSimulatorContainer = () => {
  const levaStore = useCreateStore();

  return (
    <div className="w-full my-8">
      <CanvasWrapper
        enableEnvironment={false}
        enableControls={true}
        height="600px"
        cameraSettings={{
          position: [0, 2, 12],
          fov: 50,
        }}
      >
        <CatalystSimulator3D levaStore={levaStore} />
      </CanvasWrapper>
    </div>
  );
};

export default CatalystSimulatorContainer;
