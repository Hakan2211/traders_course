
import React from 'react';
import { useCreateStore } from 'leva';
import { CanvasWrapper } from '@/components/mdx_components/canvas3d/canvasWrapper';
import MarketBox3D from './MarketBox3D';
import ChartPlane2D from '../../2d_environment/magicMarketBox/ChartPlane2D';

const IntroductionContainer = () => {
  // Create a scoped Leva store to pass to the 3D component
  const levaStore = useCreateStore();

  return (
    <div className="w-full my-8">
      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: 3D View */}
        <div className="w-full">
          <CanvasWrapper
            enableEnvironment={false}
            enableControls={false}
            height="400px"
            cameraSettings={{
              // Initial position matches default angles: -45° horizontal, 30° vertical
              // Calculated: radius=5, angleY=-45°, angleX=30°
              position: [-3.06, 2.5, 3.06],
              fov: 50,
            }}
          >
            <MarketBox3D levaStore={levaStore} />
          </CanvasWrapper>
        </div>

        {/* Right column: 2D View */}
        <div className="w-full flex flex-col">
          <ChartPlane2D />
          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              This 2D view shows the flattened perspective of the front face of
              the 3D box. Use the Perspective slider to rotate the 3D camera and
              see how the views relate to each other.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroductionContainer;
