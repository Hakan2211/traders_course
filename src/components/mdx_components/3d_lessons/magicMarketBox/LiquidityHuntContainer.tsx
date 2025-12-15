
import React from 'react';
import { useCreateStore } from 'leva';
import { CanvasWrapper } from '@/components/mdx_components/canvas3d/canvasWrapper';
import LiquidityHunt3D from './LiquidityHunt3D';

const LiquidityHuntContainer = () => {
  const levaStore = useCreateStore();

  return (
    <div className="w-full my-8">
      <CanvasWrapper
        enableEnvironment={false}
        enableControls={true}
        height="700px"
        cameraSettings={{
          position: [8, 1.2, -7],
          fov: 50,
        }}
      >
        <LiquidityHunt3D levaStore={levaStore} />
      </CanvasWrapper>
    </div>
  );
};

export default LiquidityHuntContainer;
