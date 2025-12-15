
import React, { useState, useCallback, useRef } from 'react';
import P5Sketch from '@/components/mdx_components/2d_environment/p5Sketch/p5SketchContainer';
import { Button } from '@/components/ui/button';
import type p5 from 'p5';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'seller' | 'buyer';
  radius: number;
  state: 'in_zone' | 'in_spread';
}

interface CollisionFlash {
  x: number;
  y: number;
  life: number;
  maxLife: number;
}

export const CompressionExpansion = () => {
  // React state for spread height (0.1 to 0.5, initial 0.3)
  const [spreadHeight, setSpreadHeight] = useState(0.3);
  const [isAnimating, setIsAnimating] = useState(false);
  const spreadHeightRef = useRef(0.3);
  const isAnimatingRef = useRef(false);
  const resetTriggerRef = useRef(0);
  const collisionFlashesRef = useRef<CollisionFlash[]>([]);

  // Update refs when state changes
  React.useEffect(() => {
    spreadHeightRef.current = spreadHeight;
  }, [spreadHeight]);

  React.useEffect(() => {
    isAnimatingRef.current = isAnimating;
  }, [isAnimating]);

  const handleStartAnimation = () => {
    setIsAnimating(true);
  };

  const handleCompress = () => {
    setSpreadHeight((prev) => Math.max(0.1, prev - 0.05));
  };

  const handleExpand = () => {
    setSpreadHeight((prev) => Math.min(0.5, prev + 0.05));
  };

  const handleReset = () => {
    setSpreadHeight(0.3);
    setIsAnimating(false);
    resetTriggerRef.current += 1; // Trigger particle reinitialization
  };

  // Define the p5 sketch
  const compressionSketch = useCallback(
    (p: p5, parentEl: HTMLDivElement) => {
      let particles: Particle[] = [];
      let collisionFlashes: CollisionFlash[] = [];
      let lastSpreadHeight = spreadHeightRef.current;
      let lastResetTrigger = resetTriggerRef.current;

      // Initialize particles with density gradients
      const initParticles = () => {
        particles = [];
        const canvasHeight = p.height;
        const currentSpreadHeight = spreadHeightRef.current;

        // Calculate zone boundaries
        const spreadHeightPixels = canvasHeight * currentSpreadHeight;
        const spreadTop = (canvasHeight - spreadHeightPixels) / 2;
        const spreadBottom = spreadTop + spreadHeightPixels;
        const supplyZoneHeight = spreadTop;
        const demandZoneHeight = canvasHeight - spreadBottom;

        // Create sellers (red particles) - more at top of supply zone
        for (let i = 0; i < 100; i++) {
          // Use power function to bias towards top (lower Y values)
          const r = p.random(0, 1);
          const weighted = Math.pow(r, 3); // Cube for stronger bias
          const y = weighted * supplyZoneHeight;

          particles.push({
            x: p.random(0, p.width),
            y: y,
            vx: p.random(-0.5, 0.5), // Brownian motion
            vy: 0.05, // Constant downward drift
            type: 'seller',
            radius: p.random(4, 6),
            state: 'in_zone',
          });
        }

        // Create buyers (green particles) - more at bottom of demand zone
        for (let i = 0; i < 100; i++) {
          // Use power function to bias towards bottom (higher Y values)
          const r = p.random(0, 1);
          const weighted = 1 - Math.pow(1 - r, 3); // Inverted cube for bias towards bottom
          const y = spreadBottom + weighted * demandZoneHeight;

          particles.push({
            x: p.random(0, p.width),
            y: y,
            vx: p.random(-0.5, 0.5), // Brownian motion
            vy: -0.05, // Constant upward drift
            type: 'buyer',
            radius: p.random(4, 6),
            state: 'in_zone',
          });
        }
      };

      p.setup = () => {
        p.createCanvas(parentEl.clientWidth, parentEl.clientHeight);
        initParticles();
        collisionFlashes = [];
      };

      p.draw = () => {
        // Dark background
        p.background(20, 20, 30);

        const canvasWidth = p.width;
        const canvasHeight = p.height;
        const currentSpreadHeight = spreadHeightRef.current;

        // Reinitialize particles on reset
        if (resetTriggerRef.current !== lastResetTrigger) {
          initParticles();
          collisionFlashes = [];
          lastResetTrigger = resetTriggerRef.current;
          lastSpreadHeight = currentSpreadHeight;
        }

        // Reinitialize particles if spread height changed significantly
        if (Math.abs(currentSpreadHeight - lastSpreadHeight) > 0.01) {
          // Adjust existing particles to stay in valid zones
          particles.forEach((particle) => {
            const spreadHeightPixels = canvasHeight * currentSpreadHeight;
            const spreadTop = (canvasHeight - spreadHeightPixels) / 2;
            const spreadBottom = spreadTop + spreadHeightPixels;

            if (particle.type === 'seller' && particle.y > spreadTop) {
              // Reset seller to supply zone
              const r = p.random(0, 1);
              const weighted = Math.pow(r, 3);
              particle.y = weighted * spreadTop;
              particle.state = 'in_zone';
            } else if (particle.type === 'buyer' && particle.y < spreadBottom) {
              // Reset buyer to demand zone
              const r = p.random(0, 1);
              const weighted = 1 - Math.pow(1 - r, 3);
              particle.y =
                spreadBottom + weighted * (canvasHeight - spreadBottom);
              particle.state = 'in_zone';
            }
          });
          lastSpreadHeight = currentSpreadHeight;
        }

        // Calculate zone boundaries based on spreadHeight
        const spreadHeightPixels = canvasHeight * currentSpreadHeight;
        const spreadTop = (canvasHeight - spreadHeightPixels) / 2;
        const spreadBottom = spreadTop + spreadHeightPixels;

        // Determine if compressed (spreadHeight < 0.2)
        const isCompressed = currentSpreadHeight < 0.2;
        const velocityMultiplier = isCompressed ? 1.5 : 1.0; // Higher velocity when compressed

        // Draw Supply Zone (top, red)
        p.fill(255, 0, 0, 13); // rgba(255, 0, 0, 0.05) ≈ 13/255
        p.noStroke();
        p.rect(0, 0, canvasWidth, spreadTop);

        // Draw Demand Zone (bottom, green)
        p.fill(0, 255, 0, 13); // rgba(0, 255, 0, 0.05) ≈ 13/255
        p.rect(0, spreadBottom, canvasWidth, canvasHeight - spreadBottom);

        // Draw Spread Area (middle, highlighted)
        p.fill(100, 100, 120, 60); // Neutral, slightly brighter
        p.rect(0, spreadTop, canvasWidth, spreadHeightPixels);

        // Draw spread border
        p.stroke(255, 255, 100, 150);
        p.strokeWeight(2);
        p.noFill();
        p.rect(0, spreadTop, canvasWidth, spreadHeightPixels);

        // Update and draw particles
        const animationActive = isAnimatingRef.current;

        particles.forEach((particle) => {
          if (animationActive) {
            // Update position only when animation is active
            particle.x += particle.vx * velocityMultiplier;
            particle.y += particle.vy * velocityMultiplier;

            // Add Brownian motion
            particle.vx += p.random(-0.1, 0.1);
            particle.vy += p.random(-0.1, 0.1);

            // Apply directional drift
            if (particle.type === 'seller') {
              particle.vy += 0.05 * velocityMultiplier; // Downward drift
            } else {
              particle.vy -= 0.05 * velocityMultiplier; // Upward drift
            }
          } else {
            // When animation is stopped, keep particles in their zones
            // Still allow minimal Brownian motion for visual interest
            particle.vx += p.random(-0.05, 0.05);
            particle.vy += p.random(-0.05, 0.05);

            // Dampen movement more when stopped
            particle.vx *= 0.9;
            particle.vy *= 0.9;
          }

          // Check if particle entered spread area (only relevant when animating)
          if (
            animationActive &&
            particle.y >= spreadTop &&
            particle.y <= spreadBottom
          ) {
            particle.state = 'in_spread';
          } else {
            particle.state = 'in_zone';
          }

          // Boundary conditions - bounce off walls
          if (particle.type === 'seller') {
            // Sellers bounce off top and sides
            if (particle.y < 0) {
              particle.y = 0;
              particle.vy *= -0.7;
            }
            // When animation is active, can enter spread; otherwise stay in supply zone
            if (animationActive) {
              // Can enter spread, but bounce if goes too far into demand zone
              if (particle.y > spreadBottom + 50) {
                particle.y = spreadBottom;
                particle.vy *= -0.7;
              }
            } else {
              // Keep sellers in supply zone when animation is stopped
              if (particle.y > spreadTop) {
                particle.y = spreadTop;
                particle.vy *= -0.7;
              }
            }
          } else {
            // Buyers bounce off bottom and sides
            if (particle.y > canvasHeight) {
              particle.y = canvasHeight;
              particle.vy *= -0.7;
            }
            // When animation is active, can enter spread; otherwise stay in demand zone
            if (animationActive) {
              // Can enter spread, but bounce if goes too far into supply zone
              if (particle.y < spreadTop - 50) {
                particle.y = spreadTop;
                particle.vy *= -0.7;
              }
            } else {
              // Keep buyers in demand zone when animation is stopped
              if (particle.y < spreadBottom) {
                particle.y = spreadBottom;
                particle.vy *= -0.7;
              }
            }
          }

          // Side boundaries
          if (particle.x < 0 || particle.x > canvasWidth) {
            particle.vx *= -0.7;
            particle.x = p.constrain(particle.x, 0, canvasWidth);
          }

          // Damping
          particle.vx *= 0.95;
          particle.vy *= 0.95;

          // Draw particle
          if (particle.type === 'seller') {
            p.fill(255, 100, 100);
          } else {
            p.fill(100, 255, 100);
          }
          p.noStroke();
          p.ellipse(
            particle.x,
            particle.y,
            particle.radius * 2,
            particle.radius * 2
          );
        });

        // Collision detection in spread area (only when animating)
        const sellersInSpread = animationActive
          ? particles.filter(
              (p) => p.type === 'seller' && p.state === 'in_spread'
            )
          : [];
        const buyersInSpread = animationActive
          ? particles.filter(
              (p) => p.type === 'buyer' && p.state === 'in_spread'
            )
          : [];

        sellersInSpread.forEach((seller) => {
          buyersInSpread.forEach((buyer) => {
            const dist = p.dist(seller.x, seller.y, buyer.x, buyer.y);
            const combinedRadius = seller.radius + buyer.radius;

            if (dist < combinedRadius) {
              // Collision occurred - create flash
              collisionFlashes.push({
                x: (seller.x + buyer.x) / 2,
                y: (seller.y + buyer.y) / 2,
                life: 30,
                maxLife: 30,
              });

              // Reset particles to their zones
              if (seller.type === 'seller') {
                // Reset seller to random position in supply zone
                const r = p.random(0, 1);
                const weighted = Math.pow(r, 3);
                seller.y = weighted * spreadTop;
                seller.x = p.random(0, canvasWidth);
                seller.vx = p.random(-0.5, 0.5);
                seller.vy = 0.05;
                seller.state = 'in_zone';
              }

              if (buyer.type === 'buyer') {
                // Reset buyer to random position in demand zone
                const r = p.random(0, 1);
                const weighted = 1 - Math.pow(1 - r, 3);
                buyer.y =
                  spreadBottom + weighted * (canvasHeight - spreadBottom);
                buyer.x = p.random(0, canvasWidth);
                buyer.vx = p.random(-0.5, 0.5);
                buyer.vy = -0.05;
                buyer.state = 'in_zone';
              }
            }
          });
        });

        // Update and draw collision flashes
        collisionFlashes = collisionFlashes.filter((flash) => {
          flash.life--;
          const alpha = (flash.life / flash.maxLife) * 255;
          const size = (1 - flash.life / flash.maxLife) * 50;

          // Draw flash
          p.stroke(255, 255, 255, alpha);
          p.strokeWeight(2);
          p.noFill();
          p.ellipse(flash.x, flash.y, size, size);

          // Draw bright center
          p.fill(255, 255, 100, alpha * 0.5);
          p.noStroke();
          p.ellipse(flash.x, flash.y, size * 0.5, size * 0.5);

          return flash.life > 0;
        });

        // Draw labels
        p.fill(255);
        p.textSize(14);
        p.textAlign(p.LEFT, p.TOP);
        p.text('Supply Zone', 10, 10);
        p.textAlign(p.LEFT, p.BOTTOM);
        p.text('Demand Zone', 10, canvasHeight - 10);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(
          'Spread (Trades)',
          canvasWidth / 2,
          (spreadTop + spreadBottom) / 2
        );
      };

      p.windowResized = () => {
        p.resizeCanvas(parentEl.clientWidth, parentEl.clientHeight);
        // Reinitialize particles with new canvas size
        initParticles();
      };
    },
    [] // Empty dependency - spreadHeight is accessed via ref
  );

  return (
    <div className="flex w-full h-full">
      {/* Left Side: p5 Sketch */}
      <div className="flex-1 h-full">
        <P5Sketch sketch={compressionSketch} />
      </div>

      {/* Right Side: Controls */}
      <div className="w-64 p-4 border-l border-gray-700 overflow-y-auto bg-gray-900/50 flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-white mb-2">Controls</h3>
        <p className="text-sm text-gray-400 mb-4">
          Control the spread height to see how compression builds energy and
          expansion releases it. Watch particles collide in the spread area!
        </p>
        <div className="space-y-2">
          {!isAnimating ? (
            <Button
              onClick={handleStartAnimation}
              className="w-full"
              variant="default"
            >
              Start Animation
            </Button>
          ) : (
            <>
              <Button
                onClick={handleCompress}
                disabled={spreadHeight <= 0.1}
                className="w-full"
                variant="destructive"
              >
                Compress (-0.05)
              </Button>
              <Button
                onClick={handleExpand}
                disabled={spreadHeight >= 0.5}
                className="w-full"
                variant="secondary"
              >
                Expand (+0.05)
              </Button>
            </>
          )}
          <Button onClick={handleReset} className="w-full" variant="outline">
            Reset
          </Button>
        </div>
        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
          <p className="text-xs text-gray-400 mb-2">Status:</p>
          <p className="text-sm text-white font-semibold mb-2">
            {isAnimating ? '▶️ Animating' : '⏸️ Paused'}
          </p>
          <p className="text-xs text-gray-400 mb-2">Spread Height:</p>
          <p className="text-sm text-white font-mono">
            {(spreadHeight * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {spreadHeight < 0.2 ? '⚡ Compressed - High Energy!' : 'Normal'}
          </p>
        </div>
      </div>
    </div>
  );
};
