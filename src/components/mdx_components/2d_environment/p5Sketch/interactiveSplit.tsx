
import React, { useState, useCallback } from 'react';
import EnvironmentWrapper from '@/components/mdx_components/2d_environment/environmentWrapper';
import P5Sketch from '@/components/mdx_components/2d_environment/p5Sketch/p5SketchContainer';
import { Button } from '@/components/ui/button';
import type p5 from 'p5';

export const InteractiveDemo = () => {
  const [shapeColor, setShapeColor] = useState({ r: 255, g: 0, b: 0 }); // Initial red color
  const [shapeSize, setShapeSize] = useState(50);

  // Define the p5 sketch. It needs access to the state variables.
  // We pass state via refs or include it in the closure. Passing via closure
  // requires careful handling with useCallback dependencies.
  const interactiveSketch = useCallback(
    (p: p5, parentEl: HTMLDivElement) => {
      let x: number, y: number;

      p.setup = () => {
        p.createCanvas(parentEl.clientWidth, parentEl.clientHeight);
        x = p.width / 2;
        y = p.height / 2;
        p.noStroke();
      };

      p.draw = () => {
        p.background(50); // Dark background for the sketch area

        // Use the state variables directly inside draw
        p.fill(shapeColor.r, shapeColor.g, shapeColor.b);
        p.ellipse(x, y, shapeSize, shapeSize);
      };

      p.windowResized = () => {
        p.resizeCanvas(parentEl.clientWidth, parentEl.clientHeight);
        x = p.width / 2;
        y = p.height / 2;
      };
      // IMPORTANT: Include state variables in the dependency array of useCallback
      // so the sketch function is redefined when they change, allowing p5 to
      // access the latest values. This will cause the P5Sketch component to
      // potentially re-initialize the sketch. A more advanced approach might
      // use refs or a dedicated state management solution passed into the sketch's setup.
      // For this example, re-initialization on state change is simpler to implement.
    },
    [shapeColor, shapeSize]
  );

  return (
    <div className="flex w-full h-full">
      {/* Left Side: Explanation and Controls */}
      <div className="w-1/3 p-4 border-r border-border overflow-y-auto bg-white dark:bg-black">
        <h3 className="text-lg font-semibold mb-2">Controls</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Click the buttons to change the p5 sketch on the right.
        </p>
        <div className="space-y-2">
          <Button onClick={() => setShapeColor({ r: 0, g: 0, b: 255 })}>
            Blue
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShapeColor({ r: 0, g: 255, b: 0 })}
          >
            Green
          </Button>
          <Button
            variant="outline"
            onClick={() => setShapeSize((prev) => Math.max(20, prev - 10))}
          >
            Smaller
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShapeSize((prev) => Math.min(150, prev + 10))}
          >
            Larger
          </Button>
        </div>
        <p className="mt-4 text-sm">Current Size: {shapeSize}</p>
        <p className="text-sm">
          Current Color: rgb({shapeColor.r}, {shapeColor.g}, {shapeColor.b})
        </p>
      </div>

      {/* Right Side: p5 Sketch */}
      <div className="w-2/3 h-full">
        {/* The P5Sketch component takes the full height/width of this container */}
        <P5Sketch sketch={interactiveSketch} />
      </div>
    </div>
  );
};
