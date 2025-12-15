
import React from 'react';
import EnvironmentWrapper from '@/components/mdx_components/2d_environment/environmentWrapper';
import { OwnershipDilution2D } from './OwnershipDilution2D';

const OwnershipDilution2DContainer = () => {
  return (
    <EnvironmentWrapper height="830px">
      <OwnershipDilution2D />
      <div className="absolute top-4 left-4 max-w-xs rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-xs text-slate-100/90 backdrop-blur">
        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
          Dilution visual
        </p>
        <p className="mt-2 text-sm">
          Watch how one slice out of eight shrinks toward eight percent as
          management keeps slicing the pie. Bars on the right track ownership %,
          value per share, and total share count.
        </p>
      </div>
    </EnvironmentWrapper>
  );
};

export default OwnershipDilution2DContainer;
