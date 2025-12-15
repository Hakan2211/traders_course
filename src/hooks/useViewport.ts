import { useState, useEffect } from 'react';

type Viewport = 'mobile' | 'desktop';

function useViewport(): Viewport {
  const [viewport, setViewport] = useState<Viewport>('desktop');

  useEffect(() => {
    function handleResize() {
      setViewport(window.innerWidth < 768 ? 'mobile' : 'desktop');
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial value

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}

export default useViewport;
