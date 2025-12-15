
import React from 'react';
import { useCreateStore } from 'leva';
import { CanvasWrapper } from '@/components/mdx_components/canvas3d/canvasWrapper';
import TrendArchitecture3D from './TrendArchitecture3D';

const TrendArchitectureContainer = () => {
  const levaStore = useCreateStore();
  return (
    <div className="w-full my-8">
      <CanvasWrapper
        enableEnvironment={false}
        enableControls={true}
        height="700px"
        cameraSettings={{
          position: [7, 1, 20],
          fov: 50,
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <TrendArchitecture3D levaStore={levaStore} />
      </CanvasWrapper>
    </div>
  );
};

export default TrendArchitectureContainer;
