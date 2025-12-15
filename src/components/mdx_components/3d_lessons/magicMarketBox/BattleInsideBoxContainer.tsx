
import React from 'react';
import { useCreateStore } from 'leva';
import { CanvasWrapper } from '@/components/mdx_components/canvas3d/canvasWrapper';
import BattleInsideBox3D from './BattleInsideBox3D';

const BattleInsideBoxContainer = () => {
  // Create a scoped Leva store to pass to the 3D component
  const levaStore = useCreateStore();

  return (
    <div className="w-full my-8">
      <CanvasWrapper
        enableEnvironment={false}
        enableControls={true}
        height="600px"
        cameraSettings={{
          position: [5, 0, -5],
          fov: 50,
        }}
      >
        <BattleInsideBox3D levaStore={levaStore} />
      </CanvasWrapper>
    </div>
  );
};

export default BattleInsideBoxContainer;
