
import React from 'react';
import { useCreateStore } from 'leva';
import { CanvasWrapper } from '@/components/mdx_components/canvas3d/canvasWrapper';
import MarketEcosystem3D from './MarketEcosystem3D';

const MarketEcosystemContainer = () => {
  const levaStore = useCreateStore();

  return (
    <div className="w-full my-8">
      <CanvasWrapper
        enableEnvironment={false}
        enableControls={true}
        height="600px"
        cameraSettings={{
          position: [0, 2.5, -16],
          fov: 48,
        }}
      >
        <MarketEcosystem3D levaStore={levaStore} />
      </CanvasWrapper>
    </div>
  );
};

export default MarketEcosystemContainer;
