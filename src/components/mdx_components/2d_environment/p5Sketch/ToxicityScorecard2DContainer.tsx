
import React from 'react';
import EnvironmentWrapper from '@/components/mdx_components/2d_environment/environmentWrapper';
import { ToxicityScorecard2D } from './ToxicityScorecard2D';

const ToxicityScorecard2DContainer = () => {
  return (
    <EnvironmentWrapper height="900px">
      <ToxicityScorecard2D />
      <div className="absolute top-4 left-4 max-w-sm md:max-w-md rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-xs text-slate-100/90 backdrop-blur z-20">
        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
          Toxicity dashboard
        </p>
        <p className="mt-2 text-sm">
          Drag the value cards to manipulate warrant overhang, offering
          discounts, and cash runway. Watch each gauge respond and see the
          weighted toxicity score climb or fall in real time.
        </p>
      </div>
    </EnvironmentWrapper>
  );
};

export default ToxicityScorecard2DContainer;
