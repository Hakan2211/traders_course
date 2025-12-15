
import React, { useRef, useEffect } from 'react';
import type p5 from 'p5';
import { cn } from '@/lib/utils';

type SketchFunction = (p: p5, parentEl: HTMLDivElement) => void;

interface P5SketchProps {
  sketch: SketchFunction;
  className?: string;
}

const P5Sketch: React.FC<P5SketchProps> = ({ sketch, className }) => {
  const sketchRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  useEffect(() => {
    let p5Import: typeof import('p5');

    import('p5')
      .then((p5Module) => {
        p5Import = p5Module.default;
        const p5 = p5Import;

        if (sketchRef.current && !p5InstanceRef.current) {
          const sketchWrapper = (p: p5) => {
            sketch(p, sketchRef.current!);
          };

          p5InstanceRef.current = new p5(sketchWrapper, sketchRef.current);
        }
      })
      .catch((error) => {
        console.error('Failed to load p5.js:', error);
      });

    return () => {
      if (p5InstanceRef.current) {
        console.log('Removing p5 instance');
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
    // IMPORTANT: Use an empty dependency array `[]` if the `sketch` function's
    // definition is stable (e.g., defined outside the component or memoized).
    // If `sketch` is defined inline within the parent component rendering P5Sketch,
    // it might change on every render, causing unnecessary p5 recreation.
    // In that case, memoize it with `useCallback` in the parent.
    // For simplicity here, we assume it's stable or memoized.
  }, [sketch]); // Re-run effect if the sketch function identity changes

  return <div ref={sketchRef} className={cn('w-full h-full', className)} />;
};

export default P5Sketch;
