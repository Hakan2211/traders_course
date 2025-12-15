
import React, { useCallback } from 'react'; // Import useCallback
import EnvironmentWrapper from '@/components/mdx_components/2d_environment/environmentWrapper';
import P5Sketch from '@/components/mdx_components/2d_environment/p5Sketch/p5SketchContainer'; // Import the helper
import type p5 from 'p5'; // Import type for sketch function signature

// Define a React functional component
const P5Example = () => {
  // Move useCallback inside the component
  // Define the sketch logic. Note: It receives the parent element now.
  // Using useCallback ensures the function identity is stable across re-renders,
  // preventing unnecessary p5 sketch recreation by P5Sketch component.
  const myCoolSketch = useCallback((p: p5, parentEl: HTMLDivElement) => {
    let diameter = 50;
    let x: number, y: number;

    p.setup = () => {
      // Use parent element's size for the canvas
      const canvas = p.createCanvas(
        parentEl.clientWidth,
        parentEl.clientHeight
      );
      canvas.mousePressed(() => {
        // Example interaction
        diameter = p.random(20, 80);
      });
      x = p.width / 2;
      y = p.height / 2;
      p.noStroke();
    };

    p.draw = () => {
      //p.background(200, 220, 255); // Light blue background within p5

      // Simple animation
      x += p.random(-2, 2);
      y += p.random(-2, 2);
      x = p.constrain(x, diameter / 2, p.width - diameter / 2);
      y = p.constrain(y, diameter / 2, p.height - diameter / 2);

      p.fill(255, 0, 0); // Red circle
      p.ellipse(x, y, diameter, diameter);
    };

    // Optional: Handle window resizing within the p5 sketch
    p.windowResized = () => {
      p.resizeCanvas(parentEl.clientWidth, parentEl.clientHeight);
      // Re-center or adjust sketch elements if needed after resize
      x = p.width / 2;
      y = p.height / 2;
    };
  }, []); // Empty dependency array for useCallback as it doesn't depend on external state

  // Return the JSX from the component
  return <P5Sketch sketch={myCoolSketch} />;
};

// Export the component
export default P5Example;
