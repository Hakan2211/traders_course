
import React from 'react';
import EnvironmentWrapper from '@/components/mdx_components/2d_environment/environmentWrapper';
import { DilutionImpact2D } from './DilutionImpact2D';

const DilutionImpact2DContainer = () => {
  return (
    <EnvironmentWrapper height="900px">
      <DilutionImpact2D />
      <div className="absolute top-4 left-4 max-w-sm rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-xs text-slate-100/90 backdrop-blur z-20">
        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
          Dilution impact lab
        </p>
        <p className="mt-2 text-sm">
          Drag the cash raise, offering price, or shares issued sliders to see
          how the raise immediately compresses EPS, expands share count, and
          slices your ownership percentage.
        </p>
      </div>
    </EnvironmentWrapper>
  );
};

export default DilutionImpact2DContainer;
