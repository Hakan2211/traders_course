
import React, { useState } from 'react';
import { Scene } from './Scene';
import { Overlay } from './Overlay';
import { SetupData } from './types';

export const SetupArsenalRenderer: React.FC = () => {
  const [selectedSetup, setSelectedSetup] = useState<SetupData | null>(null);

  return (
    <div className="relative w-full h-screen">
      <Scene selectedSetup={selectedSetup} onSelectSetup={setSelectedSetup} />
      <Overlay
        selectedSetup={selectedSetup}
        onClose={() => setSelectedSetup(null)}
      />
    </div>
  );
};

export default SetupArsenalRenderer;
