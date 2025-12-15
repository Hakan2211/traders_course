
import React from 'react';
import EnvironmentWrapper from '@/components/mdx_components/2d_environment/environmentWrapper';
import FalseVsFailedBreakout2D from './FalseVsFailedBreakout2D';

const FalseVsFailedBreakout2DContainer: React.FC = () => {
  return (
    <EnvironmentWrapper height="480px">
      <FalseVsFailedBreakout2D />
    </EnvironmentWrapper>
  );
};

export default FalseVsFailedBreakout2DContainer;
