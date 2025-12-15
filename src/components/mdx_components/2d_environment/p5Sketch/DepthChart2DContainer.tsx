
import React from 'react';
import EnvironmentWrapper from '@/components/mdx_components/2d_environment/environmentWrapper';
import DepthChart2D from './DepthChart2D';

const DepthChart2DContainer: React.FC = () => {
  return (
    <div className="relative w-full my-8">
      <EnvironmentWrapper height="560px">
        <DepthChart2D />
      </EnvironmentWrapper>
    </div>
  );
};

export default DepthChart2DContainer;
