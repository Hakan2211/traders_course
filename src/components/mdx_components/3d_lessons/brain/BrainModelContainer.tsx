
import React from 'react';
import { CanvasWrapper } from '@/components/mdx_components/canvas3d/canvasWrapper';
import BrainModelScene from './BrainModelScene';

const BrainModelContainer = () => {
  return (
    <CanvasWrapper
      height="500px"
      cameraSettings={{
        position: [2, 0, 10],
        fov: 45,
      }}
    >
      <BrainModelScene />
    </CanvasWrapper>
  );
};

export default BrainModelContainer;
