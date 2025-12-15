
import React from 'react';
import { useCreateStore } from 'leva';
import { CanvasWrapper } from '@/components/mdx_components/canvas3d/canvasWrapper';
import ExecutionStrategies3D from './ExecutionStrategies3D';

const ExecutionStrategiesContainer: React.FC = () => {
  const levaStore = useCreateStore();
  return (
    <div className="w-full my-8">
      <CanvasWrapper
        enableEnvironment={false}
        enableControls={true}
        height="700px"
        cameraSettings={{
          position: [0, 2.6, 10],
          fov: 45,
        }}
      >
        <ExecutionStrategies3D levaStore={levaStore} />
      </CanvasWrapper>
    </div>
  );
};

export default ExecutionStrategiesContainer;
