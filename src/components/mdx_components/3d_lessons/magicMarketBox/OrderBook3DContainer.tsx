
import React from 'react';
import { useCreateStore } from 'leva';
import { CanvasWrapper } from '@/components/mdx_components/canvas3d/canvasWrapper';
import OrderBook3D from './OrderBook3D';

const OrderBook3DContainer = () => {
  const levaStore = useCreateStore();

  return (
    <div className="w-full my-8">
      <CanvasWrapper
        enableEnvironment={false}
        enableControls={true}
        height="680px"
        cameraSettings={{
          position: [8, 5, -16],
          fov: 50,
        }}
      >
        <OrderBook3D levaStore={levaStore} />
      </CanvasWrapper>
    </div>
  );
};

export default OrderBook3DContainer;
