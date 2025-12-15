
import React from 'react';
import EnvironmentWrapper from '@/components/mdx_components/2d_environment/environmentWrapper';
import TapeReading2D from './TapeReading2D';

const TapeReading2DContainer: React.FC = () => {
  return (
    <div className="relative w-full my-8">
      <EnvironmentWrapper height="800px">
        <TapeReading2D />
      </EnvironmentWrapper>
    </div>
  );
};

export default TapeReading2DContainer;
