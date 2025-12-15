
import React from 'react';
import { useCreateStore } from 'leva';
import EnvironmentWrapper from '@/components/mdx_components/2d_environment/environmentWrapper';
import { VolumeAnatomy2D } from './VolumeAnatomy2D';
import { LevaPanel } from 'leva';

const VolumeAnatomy2DContainer = () => {
  const levaStore = useCreateStore();

  return (
    <div className="relative w-full my-8">
      <EnvironmentWrapper height="700px">
        <VolumeAnatomy2D levaStore={levaStore} />
      </EnvironmentWrapper>

      {/* Leva Panel - outside wrapper to avoid clipping */}
      <div
        className="absolute top-4 right-4 pointer-events-auto"
        style={{
          zIndex: 9999,
          transform: 'scale(0.9)',
          transformOrigin: 'top right',
        }}
      >
        <LevaPanel
          store={levaStore}
          fill={false}
          titleBar={{ title: 'Volume Anatomy 2D' }}
          collapsed={false}
        />
      </div>
    </div>
  );
};

export default VolumeAnatomy2DContainer;
