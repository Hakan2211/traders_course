import { useState, useEffect } from 'react';

interface WindowSize {
  width: number | undefined;
  height: number | undefined;
}

function useWindowSize(): WindowSize {
  // Initialize state with undefined width/height so server and client renders match
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return windowSize;
}

export default useWindowSize;
