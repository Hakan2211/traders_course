
import React, { useState } from 'react';
import { useCreateStore } from 'leva';
import { GraveyardScene } from './GraveyardScene';
import { Overlay } from './Overlay';
import { GraveData } from './types';

const TraderGraveyard = () => {
  const [hoveredGrave, setHoveredGrave] = useState<GraveData | null>(null);
  const levaStore = useCreateStore();

  return (
    <div className="relative">
      <GraveyardScene onGraveHover={setHoveredGrave} levaStore={levaStore} />
      <Overlay hoveredGrave={hoveredGrave} />
    </div>
  );
};

export default TraderGraveyard;
