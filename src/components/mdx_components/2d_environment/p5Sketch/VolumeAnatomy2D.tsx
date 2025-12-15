
import React, { useState, useCallback, useRef, useEffect } from 'react';
import P5Sketch from '@/components/mdx_components/2d_environment/p5Sketch/p5SketchContainer';
import { useControls, LevaPanel, useCreateStore, button } from 'leva';
import type p5 from 'p5';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'seller' | 'buyer' | 'neutral';
  radius: number;
  baseY: number;
  oscillationPhase: number;
  isEngaging: boolean;
  engagementProgress: number;
  prevX: number;
  prevY: number;
  wasInZone: boolean;
  trailLife: number;
}

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

interface CollisionFlash {
  x: number;
  y: number;
  life: number;
  maxLife: number;
}

interface VolumeAnatomy2DProps {
  levaStore: ReturnType<typeof useCreateStore>;
}

export const VolumeAnatomy2D = ({ levaStore }: VolumeAnatomy2DProps) => {
  // Refs for p5.js to access React state
  const demandPressureRef = useRef(0.5);
  const supplyPressureRef = useRef(0.5);
  const equilibriumRef = useRef(0.5); // 0-1, where 0.5 is center
  const volumeIntensityRef = useRef(0.5); // 0-1
  const particleCountRef = useRef(200);

  // Price and volume tracking
  const currentPriceRef = useRef(50); // Starting price
  const candlesRef = useRef<Candle[]>([]);
  const maxCandles = 50;
  const candleTimeRef = useRef(0);
  const candleInterval = 60; // frames per candle

  // Collision tracking (accumulated over candle interval)
  const collisionCountRef = useRef(0);
  const upwardCollisionsRef = useRef(0);
  const downwardCollisionsRef = useRef(0);
  const accumulatedCollisionsRef = useRef(0);
  const accumulatedUpwardRef = useRef(0);
  const accumulatedDownwardRef = useRef(0);

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const isAnimatingRef = useRef(false);

  // Update ref when state changes
  useEffect(() => {
    isAnimatingRef.current = isAnimating;
  }, [isAnimating]);

  // Leva controls
  const controls = useControls(
    'Volume Anatomy 2D',
    {
      demandPressure: {
        value: 0.5,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Demand Pressure',
      },
      supplyPressure: {
        value: 0.5,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Supply Pressure',
      },
      volumeIntensity: {
        value: 0.5,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Volume Intensity',
      },
      particleCount: {
        value: 200,
        min: 50,
        max: 500,
        step: 50,
        label: 'Particle Count',
      },
      resetPrice: button(() => {
        currentPriceRef.current = 50;
        candlesRef.current = [];
        candleTimeRef.current = 0;
      }),
      startAnimation: button(() => {
        setIsAnimating(true);
      }),
      stopAnimation: button(() => {
        setIsAnimating(false);
      }),
    },
    { store: levaStore }
  );

  // Update refs when controls change
  useEffect(() => {
    demandPressureRef.current = controls.demandPressure;
    supplyPressureRef.current = controls.supplyPressure;
    volumeIntensityRef.current = controls.volumeIntensity;
    particleCountRef.current = controls.particleCount;

    // Note: resetPrice and startAnimation are button handlers, not values
    // They're handled directly in the button callbacks above
  }, [controls]);

  // Define the p5 sketch
  const volumeAnatomySketch = useCallback(
    (p: p5, parentEl: HTMLDivElement) => {
      let particles: Particle[] = [];
      let collisionFlashes: CollisionFlash[] = [];
      let lastParticleCount = particleCountRef.current;
      let frameCount = 0;
      let lastEquilibrium = equilibriumRef.current;
      let lastCandleBodyPx = 0;
      let lastCandleWasAbsorption = false;

      // Split canvas: left 60% for particles, right 40% for chart
      const getLeftWidth = () => Math.floor(parentEl.clientWidth * 0.6);
      const getRightWidth = () => parentEl.clientWidth - getLeftWidth();
      const chartPadding = 40;
      const chartAreaWidth = getRightWidth() - chartPadding * 2;
      const chartAreaHeight = parentEl.clientHeight - chartPadding * 2;

      // Initialize particles
      const initParticles = () => {
        particles = [];
        const leftWidth = getLeftWidth();
        const canvasHeight = parentEl.clientHeight;
        const count = particleCountRef.current;

        // 80% buyers/sellers, 20% neutral
        const activeCount = Math.floor(count * 0.8);
        const neutralCount = count - activeCount;

        for (let i = 0; i < count; i++) {
          const isNeutral = i >= activeCount;
          let type: 'seller' | 'buyer' | 'neutral';
          let baseY: number;

          if (isNeutral) {
            type = 'neutral';
            baseY = p.random(0, canvasHeight);
          } else {
            type = p.random() < 0.5 ? 'seller' : 'buyer';
            if (type === 'seller') {
              baseY = p.random(0, canvasHeight * 0.3);
            } else {
              baseY = p.random(canvasHeight * 0.7, canvasHeight);
            }
          }

          particles.push({
            x: p.random(0, leftWidth),
            y: baseY,
            vx: p.random(-0.5, 0.5),
            vy: p.random(-0.5, 0.5),
            type,
            radius: p.random(3, 6),
            baseY,
            oscillationPhase: p.random(0, p.TWO_PI),
            isEngaging: false,
            engagementProgress: 0,
            prevX: 0,
            prevY: 0,
            wasInZone: false,
            trailLife: 0,
          });
        }
      };

      p.setup = () => {
        p.createCanvas(parentEl.clientWidth, parentEl.clientHeight);
        initParticles();
        collisionFlashes = [];
        frameCount = 0;
      };

      p.draw = () => {
        // Dark background
        p.background(20, 20, 30);

        const leftWidth = getLeftWidth();
        const canvasHeight = p.height;
        const currentVolumeIntensity = volumeIntensityRef.current;
        const currentDemandPressure = demandPressureRef.current;
        const currentSupplyPressure = supplyPressureRef.current;
        // Tie particle speed to volume intensity
        const particleSpeed = 0.6 + currentVolumeIntensity * 1.4;

        // Dynamic equilibrium based on pressure imbalance
        // Inverted: high demand moves equilibrium UP (toward sellers), high supply moves it DOWN (toward buyers)
        const computedEquilibrium = p.constrain(
          0.5 - (currentDemandPressure - currentSupplyPressure) * 0.25,
          0.05,
          0.95
        );
        equilibriumRef.current = computedEquilibrium;
        const currentEquilibrium = computedEquilibrium;

        // Reinitialize particles if count changed
        if (particleCountRef.current !== lastParticleCount) {
          initParticles();
          lastParticleCount = particleCountRef.current;
        }

        // Calculate middle zone (equilibrium area) - dynamic with imbalance and volume
        const middleZoneCenter = canvasHeight * currentEquilibrium;
        const imbalance = Math.abs(
          currentDemandPressure - currentSupplyPressure
        );
        const baseHeight =
          canvasHeight * (0.08 + (1 - currentVolumeIntensity) * 0.12);
        const dynamicHeight = baseHeight * (1 + imbalance * 0.8);
        const maxZoneHeight = canvasHeight * 0.5;
        const middleZoneHeight = p.constrain(
          dynamicHeight,
          canvasHeight * 0.05,
          maxZoneHeight
        );
        const middleZoneTop = middleZoneCenter - middleZoneHeight / 2;
        const middleZoneBottom = middleZoneCenter + middleZoneHeight / 2;
        const zoneTightness = p.constrain(
          1 - middleZoneHeight / maxZoneHeight,
          0,
          1
        );

        // Draw zones
        // Supply zone (top)
        p.fill(255, 0, 0, 20);
        p.noStroke();
        p.rect(0, 0, leftWidth, middleZoneTop);

        // Demand zone (bottom)
        p.fill(0, 255, 0, 20);
        p.rect(0, middleZoneBottom, leftWidth, canvasHeight - middleZoneBottom);

        // Middle zone (equilibrium/trading zone)
        p.fill(255, 255, 100, 30);
        p.stroke(255, 255, 100, 150);
        p.strokeWeight(2);
        p.rect(0, middleZoneTop, leftWidth, middleZoneHeight);

        // Equilibrium line
        const equilibriumBias = currentDemandPressure - currentSupplyPressure;
        if (equilibriumBias > 0.02) {
          p.stroke(100, 255, 100, 180);
        } else if (equilibriumBias < -0.02) {
          p.stroke(255, 100, 100, 180);
        } else {
          p.stroke(74, 158, 255, 200);
        }
        p.strokeWeight(2);
        p.line(0, middleZoneCenter, leftWidth, middleZoneCenter);

        // Reset collision counters
        let frameCollisions = 0;
        let frameUpwardCollisions = 0;
        let frameDownwardCollisions = 0;

        // Update and draw particles
        particles.forEach((particle) => {
          // Cache previous position and zone state for streaks/labels
          particle.prevX = particle.x;
          particle.prevY = particle.y;
          const wasInZone =
            particle.y >= middleZoneTop && particle.y <= middleZoneBottom;

          // Oscillation around base position
          const oscillationOffset =
            p.sin(p.frameCount * 0.05 + particle.oscillationPhase) * 5;

          // Determine if particle should engage based on pressure
          if (particle.type !== 'neutral') {
            const animationActive = isAnimatingRef.current;

            // Only allow engagement when animation is active
            if (animationActive) {
              const distanceToMiddle = Math.abs(particle.y - middleZoneCenter);
              const baseEngagementRate = 0.1; // 10% chance per frame
              const pressureMultiplier =
                particle.type === 'buyer'
                  ? currentDemandPressure
                  : currentSupplyPressure;
              const engagementRate =
                baseEngagementRate + pressureMultiplier * 0.2; // 0.1 to 0.3

              // Check if particle should start engaging
              if (
                !particle.isEngaging &&
                distanceToMiddle > middleZoneHeight * 0.2 &&
                p.random() < engagementRate
              ) {
                particle.isEngaging = true;
                particle.engagementProgress = 0;
              }
            } else {
              // Stop engaging when animation is paused
              if (particle.isEngaging) {
                particle.isEngaging = false;
                particle.engagementProgress = 0;
              }
            }

            if (particle.isEngaging && isAnimatingRef.current) {
              // Move toward middle zone with stronger force
              const targetY =
                middleZoneCenter +
                (p.random() * 2 - 1) * middleZoneHeight * 0.35;
              const targetX = p.random(leftWidth * 0.2, leftWidth * 0.8);

              const dx = targetX - particle.x;
              const dy = targetY - particle.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist > 0.5) {
                // Attraction increases with volume (clustering near equilibrium)
                const force =
                  (0.22 + currentVolumeIntensity * 0.18) * particleSpeed;
                particle.vx += (dx / dist) * force;
                particle.vy += (dy / dist) * force;
              }

              // Update position
              particle.x += particle.vx * particleSpeed;
              particle.y += particle.vy * particleSpeed;
              particle.engagementProgress += 0.016 * particleSpeed; // Increment by frame time

              // Add random movement in middle zone to increase collision chances
              if (
                particle.y >= middleZoneTop &&
                particle.y <= middleZoneBottom
              ) {
                // Slight random jitter, smaller when zone is tight (crowding)
                const jitter = (0.3 - zoneTightness * 0.2) * particleSpeed;
                particle.vx += p.random(-jitter, jitter);
                particle.vy += p.random(-jitter, jitter);
              }

              // Limit velocity
              const maxVel = 4 * particleSpeed;
              particle.vx = p.constrain(particle.vx, -maxVel, maxVel);
              particle.vy = p.constrain(particle.vy, -maxVel, maxVel);

              // Stop engaging after reaching middle zone or timeout
              const inMiddleZone =
                particle.y >= middleZoneTop && particle.y <= middleZoneBottom;
              if (
                (inMiddleZone && particle.engagementProgress > 1.0) ||
                particle.engagementProgress > 5.0
              ) {
                if (!inMiddleZone || particle.engagementProgress > 3.0) {
                  particle.isEngaging = false;
                  particle.engagementProgress = 0;
                }
              }
            } else {
              // Return to base position with oscillation (slower when not engaging)
              const targetY = particle.baseY + oscillationOffset;
              particle.y = p.lerp(particle.y, targetY, 0.02);
              // Keep X position relatively stable with slight drift
              particle.x += p.random(-0.1, 0.1);
              // Reset velocity when not engaging
              particle.vx *= 0.9;
              particle.vy *= 0.9;
            }
          } else {
            // Neutral particles just oscillate
            particle.y = particle.baseY + oscillationOffset;
            particle.x += p.random(-0.5, 0.5);
            particle.vx *= 0.95;
            particle.vy *= 0.95;
          }

          // Boundary conditions
          particle.x = p.constrain(particle.x, 0, leftWidth);
          particle.y = p.constrain(particle.y, 0, canvasHeight);

          // Damping only when not actively engaging (to preserve momentum)
          if (!particle.isEngaging || particle.type === 'neutral') {
            particle.vx *= 0.98;
            particle.vy *= 0.98;
          }

          // Detect exits from zone to start a subtle streak
          const nowInZone =
            particle.y >= middleZoneTop && particle.y <= middleZoneBottom;
          if (wasInZone && !nowInZone) {
            particle.trailLife = 12; // short-lived streak
          } else if (particle.trailLife > 0) {
            particle.trailLife -= 1;
          }
          particle.wasInZone = nowInZone;

          // Draw momentum streak
          if (particle.trailLife > 0) {
            const alpha = (particle.trailLife / 12) * 120;
            p.stroke(255, 255, 255, alpha);
            p.strokeWeight(1);
            p.line(particle.prevX, particle.prevY, particle.x, particle.y);
          }

          // Draw particle
          if (particle.type === 'seller') {
            p.fill(255, 100, 100);
          } else if (particle.type === 'buyer') {
            p.fill(100, 255, 100);
          } else {
            p.fill(150, 150, 150);
          }
          p.noStroke();
          p.ellipse(
            particle.x,
            particle.y,
            particle.radius * 2,
            particle.radius * 2
          );
        });

        // Collision detection in middle zone (only when animating)
        const animationActive = isAnimatingRef.current;
        const sellersInZone = animationActive
          ? particles.filter(
              (p) =>
                p.type === 'seller' &&
                p.y >= middleZoneTop &&
                p.y <= middleZoneBottom
            )
          : [];
        const buyersInZone = animationActive
          ? particles.filter(
              (p) =>
                p.type === 'buyer' &&
                p.y >= middleZoneTop &&
                p.y <= middleZoneBottom
            )
          : [];

        // Slight repulsion between same-side participants to reduce overlap
        const applyRepulsion = (group: Particle[]) => {
          const repulsionRadius = 12;
          const repulsionStrength = 0.02 + currentVolumeIntensity * 0.05;
          group.forEach((p1) => {
            for (let n = 0; n < 3 && group.length > 1; n++) {
              const p2 = group[Math.floor(p.random(group.length))];
              if (p1 === p2) continue;
              const dx = p1.x - p2.x;
              const dy = p1.y - p2.y;
              const d2 = dx * dx + dy * dy;
              if (d2 > 0 && d2 < repulsionRadius * repulsionRadius) {
                const d = Math.sqrt(d2);
                const f =
                  (repulsionStrength * (repulsionRadius - d)) / repulsionRadius;
                p1.vx += (dx / d) * f;
                p1.vy += (dy / d) * f;
              }
            }
          });
        };
        if (animationActive) {
          applyRepulsion(sellersInZone);
          applyRepulsion(buyersInZone);
        }

        sellersInZone.forEach((seller) => {
          buyersInZone.forEach((buyer) => {
            const dist = p.dist(seller.x, seller.y, buyer.x, buyer.y);
            const combinedRadius = seller.radius + buyer.radius;

            if (dist < combinedRadius) {
              frameCollisions++;

              // Determine collision direction relative to equilibrium
              const collisionY = (seller.y + buyer.y) / 2;
              if (collisionY < middleZoneCenter) {
                frameUpwardCollisions++; // Collision above center = upward pressure
              } else {
                frameDownwardCollisions++; // Collision below center = downward pressure
              }

              // Create flash
              collisionFlashes.push({
                x: (seller.x + buyer.x) / 2,
                y: collisionY,
                life: 20,
                maxLife: 20,
              });

              // Bounce particles apart
              const angle = p.atan2(buyer.y - seller.y, buyer.x - seller.x);
              const force = 1.0 * particleSpeed;
              seller.vx -= p.cos(angle) * force;
              seller.vy -= p.sin(angle) * force;
              buyer.vx += p.cos(angle) * force;
              buyer.vy += p.sin(angle) * force;

              // Don't immediately reset - let them bounce around a bit more
              // Only reset if they're far from middle zone
              if (seller.type === 'seller' && seller.y < middleZoneTop - 20) {
                seller.isEngaging = false;
                seller.engagementProgress = 0;
              }
              if (buyer.type === 'buyer' && buyer.y > middleZoneBottom + 20) {
                buyer.isEngaging = false;
                buyer.engagementProgress = 0;
              }
            }
          });
        });

        // Accumulate collisions over candle interval
        accumulatedCollisionsRef.current += frameCollisions;
        accumulatedUpwardRef.current += frameUpwardCollisions;
        accumulatedDownwardRef.current += frameDownwardCollisions;

        // Update frame-level tracking for display
        collisionCountRef.current = frameCollisions;
        upwardCollisionsRef.current = frameUpwardCollisions;
        downwardCollisionsRef.current = frameDownwardCollisions;

        // Update and draw collision flashes
        collisionFlashes = collisionFlashes.filter((flash) => {
          flash.life--;
          const alpha = (flash.life / flash.maxLife) * 255;
          const size = (1 - flash.life / flash.maxLife) * 30;

          p.stroke(255, 255, 255, alpha);
          p.strokeWeight(2);
          p.noFill();
          p.ellipse(flash.x, flash.y, size, size);

          p.fill(255, 255, 100, alpha * 0.5);
          p.noStroke();
          p.ellipse(flash.x, flash.y, size * 0.5, size * 0.5);

          return flash.life > 0;
        });

        // Draw labels
        p.fill(255);
        p.textSize(12);
        p.textAlign(p.LEFT, p.TOP);
        p.text('Supply Zone', 10, 10);

        // Animation status indicator (reuse animationActive from above)
        p.fill(animationActive ? 100 : 255, animationActive ? 255 : 100, 100);
        p.textSize(14);
        p.text(animationActive ? '▶ ANIMATING' : '⏸ PAUSED', 10, 30);

        p.fill(255);
        p.textSize(12);
        p.textAlign(p.LEFT, p.BOTTOM);
        p.text('Demand Zone', 10, canvasHeight - 10);
        p.textAlign(p.CENTER, p.CENTER);
        p.text('Trading Zone', leftWidth / 2, middleZoneCenter);

        // ========== RIGHT SIDE: PRICE CHART ==========
        const chartStartX = leftWidth + chartPadding;
        const chartStartY = chartPadding;
        const chartEndX = chartStartX + chartAreaWidth;
        const chartEndY = chartStartY + chartAreaHeight;

        // Update price based on controls and collisions (only when animating)
        frameCount++;
        if (animationActive && frameCount % candleInterval === 0) {
          const currentPrice = currentPriceRef.current;

          // Step 1: Calculate pressure imbalance from controls (primary driver)
          const pressureImbalance =
            currentDemandPressure - currentSupplyPressure; // -1 to +1

          // Step 2: Get collision-based pressure (secondary input)
          const collisionNetPressure =
            (accumulatedUpwardRef.current - accumulatedDownwardRef.current) /
            Math.max(accumulatedCollisionsRef.current, 1); // Normalize to -1 to +1

          // Step 3: Combine control pressure (70%) with collision pressure (30%)
          const combinedPressure =
            pressureImbalance * 0.7 + collisionNetPressure * 0.3;

          // Step 4: Calculate volume intensity from collisions and control setting
          const collisionVolume = Math.min(
            accumulatedCollisionsRef.current / candleInterval,
            1.0
          ); // Normalize collision count
          const effectiveVolumeIntensity =
            currentVolumeIntensity * 0.6 + collisionVolume * 0.4; // Blend both

          // Step 5: Calculate price change with Effort vs Result (tight zone -> smaller candles)
          const baseVolatility = 0.8; // Base move size multiplier
          const basePriceChange =
            combinedPressure * effectiveVolumeIntensity * baseVolatility;
          const candleHeightFactor = 1 - zoneTightness * 0.7;
          const priceChange = basePriceChange * candleHeightFactor;

          // Step 6: Add organic noise scaled by equilibrium shift (uncertainty)
          const eqShift = Math.abs(equilibriumRef.current - lastEquilibrium);
          const uncertaintyFactor = p.constrain(eqShift * 3, 0, 1);
          const noise =
            (p.random() - 0.5) *
            (0.02 + 0.02 * uncertaintyFactor) *
            effectiveVolumeIntensity;
          const finalPriceChange = priceChange + noise;

          // Step 7: Apply mean reversion (small pull toward equilibrium price ~50)
          const equilibriumPrice = 50;
          const meanReversionStrength = 0.05; // How much to pull back
          const meanReversionPull =
            (equilibriumPrice - currentPrice) * meanReversionStrength * 0.1;

          // Step 8: Calculate new price with smoothing
          const rawNewPrice =
            currentPrice + finalPriceChange + meanReversionPull;
          const newPrice = p.constrain(rawNewPrice, 10, 90);

          // Step 9: Calculate candle high/low based on volume intensity
          const priceMove = Math.abs(newPrice - currentPrice);
          const baseWickSize = effectiveVolumeIntensity * 0.8 + 0.2; // 0.2 to 1.0
          // Wicks represent uncertainty more when equilibrium shifts fast
          const wickUncertainty =
            0.3 + p.random() * (0.4 + 0.3 * uncertaintyFactor);
          const upperWick = priceMove * baseWickSize * wickUncertainty;
          const lowerWick = priceMove * baseWickSize * wickUncertainty;

          const high = p.constrain(
            p.max(currentPrice, newPrice) + upperWick,
            10,
            90
          );
          const low = p.constrain(
            p.min(currentPrice, newPrice) - lowerWick,
            10,
            90
          );

          // Step 10: Create candle with volume-proportional size
          const candle: Candle = {
            open: currentPrice,
            high: high,
            low: low,
            close: newPrice,
            volume: accumulatedCollisionsRef.current * effectiveVolumeIntensity,
            timestamp: candleTimeRef.current++,
          };

          candlesRef.current.push(candle);
          if (candlesRef.current.length > maxCandles) {
            candlesRef.current.shift();
          }

          // Step 11: Smooth price update (lerp for organic feel)
          currentPriceRef.current = p.lerp(
            currentPriceRef.current,
            newPrice,
            0.8
          ); // 80% toward new price for smooth transition

          // Track equilibrium and rough last candle body (for teaching labels)
          lastEquilibrium = equilibriumRef.current;
          lastCandleBodyPx = Math.abs(newPrice - currentPrice);

          // Reset accumulated values for next candle
          accumulatedCollisionsRef.current = 0;
          accumulatedUpwardRef.current = 0;
          accumulatedDownwardRef.current = 0;
        }

        // Draw chart background
        p.fill(30, 30, 40);
        p.noStroke();
        p.rect(chartStartX, chartStartY, chartAreaWidth, chartAreaHeight);

        // Draw grid lines
        p.stroke(60, 60, 70);
        p.strokeWeight(1);
        for (let i = 0; i <= 5; i++) {
          const y = chartStartY + (chartAreaHeight / 5) * i;
          p.line(chartStartX, y, chartEndX, y);
        }

        // Calculate price range
        if (candlesRef.current.length > 0) {
          let minPrice = Infinity;
          let maxPrice = -Infinity;
          let maxVolume = 0;

          candlesRef.current.forEach((candle) => {
            minPrice = p.min(minPrice, candle.low);
            maxPrice = p.max(maxPrice, candle.high);
            maxVolume = p.max(maxVolume, candle.volume);
          });

          const priceRange = maxPrice - minPrice || 1;
          const pricePadding = priceRange * 0.1;

          // Draw volume bars (bottom half)
          const volumeAreaHeight = chartAreaHeight * 0.3;
          const volumeStartY = chartEndY - volumeAreaHeight;
          const candleWidth = chartAreaWidth / maxCandles;

          candlesRef.current.forEach((candle, index) => {
            const x = chartStartX + index * candleWidth;
            const volumeHeight =
              (candle.volume / maxVolume) * volumeAreaHeight || 0;

            // Color based on price direction
            const isUp = candle.close >= candle.open;
            p.fill(isUp ? 100 : 255, isUp ? 255 : 100, 100, 150);
            p.noStroke();
            p.rect(
              x,
              volumeStartY + volumeAreaHeight - volumeHeight,
              candleWidth * 0.8,
              volumeHeight
            );
          });

          // Draw price candles (top 70%)
          const priceAreaHeight = chartAreaHeight * 0.7;
          const priceStartY = chartStartY;

          candlesRef.current.forEach((candle, index) => {
            const x = chartStartX + index * candleWidth + candleWidth / 2;
            const isUp = candle.close >= candle.open;

            // Convert price to Y coordinate
            const highY =
              priceStartY +
              ((maxPrice + pricePadding - candle.high) /
                (priceRange + pricePadding * 2)) *
                priceAreaHeight;
            const lowY =
              priceStartY +
              ((maxPrice + pricePadding - candle.low) /
                (priceRange + pricePadding * 2)) *
                priceAreaHeight;
            const openY =
              priceStartY +
              ((maxPrice + pricePadding - candle.open) /
                (priceRange + pricePadding * 2)) *
                priceAreaHeight;
            const closeY =
              priceStartY +
              ((maxPrice + pricePadding - candle.close) /
                (priceRange + pricePadding * 2)) *
                priceAreaHeight;

            // Calculate body boundaries
            const bodyTop = p.min(openY, closeY);
            const bodyBottom = p.max(openY, closeY);
            const bodyHeight = Math.max(bodyBottom - bodyTop, 2); // Minimum 2px height

            // Body width scales with volume intensity (bigger volume = wider body)
            const volumeRatio = candle.volume / maxVolume || 0;
            const bodyWidth = candleWidth * (0.5 + volumeRatio * 0.3); // 0.5 to 0.8 of candle width
            const bodyHalfWidth = bodyWidth / 2;

            // Draw upper wick (from high to top of body)
            if (highY < bodyTop) {
              p.stroke(isUp ? 100 : 255, isUp ? 255 : 100, 100);
              p.strokeWeight(1.5);
              p.line(x, highY, x, bodyTop);
            }

            // Draw lower wick (from bottom of body to low)
            if (lowY > bodyBottom) {
              p.stroke(isUp ? 100 : 255, isUp ? 255 : 100, 100);
              p.strokeWeight(1.5);
              p.line(x, bodyBottom, x, lowY);
            }

            // Draw body - filled rectangle; highlight absorption (high volume, small body)
            const highlightAbsorption = volumeRatio > 0.6 && bodyHeight < 6;
            const colorIntensity = 100 + volumeRatio * 155; // 100 to 255
            p.fill(
              isUp ? 100 : colorIntensity,
              isUp ? colorIntensity : 100,
              100
            );
            if (highlightAbsorption) {
              p.stroke(255, 255, 100);
              p.strokeWeight(2);
            } else {
              p.noStroke();
            }
            p.rect(x - bodyHalfWidth, bodyTop, bodyWidth, bodyHeight);

            if (index === candlesRef.current.length - 1) {
              lastCandleWasAbsorption = highlightAbsorption;
            }
          });

          // Draw current price line
          const currentPriceY =
            priceStartY +
            ((maxPrice + pricePadding - currentPriceRef.current) /
              (priceRange + pricePadding * 2)) *
              priceAreaHeight;
          p.stroke(74, 158, 255);
          p.strokeWeight(2);
          p.line(chartStartX, currentPriceY, chartEndX, currentPriceY);

          // Draw price labels
          p.fill(200);
          p.textSize(10);
          p.textAlign(p.RIGHT, p.CENTER);
          for (let i = 0; i <= 5; i++) {
            const price =
              maxPrice +
              pricePadding -
              (priceRange + pricePadding * 2) * (i / 5);
            const y = priceStartY + (priceAreaHeight / 5) * i;
            p.text(price.toFixed(1), chartStartX - 5, y);
          }
        }

        // Chart title
        p.fill(255);
        p.textSize(14);
        p.textAlign(p.CENTER, p.TOP);
        p.text(
          'Price & Volume',
          chartStartX + chartAreaWidth / 2,
          chartStartY - 20
        );

        // Teaching labels: absorption/breakout/equilibrium bias
        p.textAlign(p.LEFT, p.TOP);
        p.textSize(12);
        const collisionIntensity = Math.min(
          accumulatedCollisionsRef.current /
            Math.max(frameCount % candleInterval || 1, 1),
          1
        );
        if (
          zoneTightness > 0.6 &&
          collisionIntensity > 0.6 &&
          lastCandleWasAbsorption
        ) {
          p.fill(255, 255, 100);
          p.text('Absorption Zone', 10, 52);
        } else if (zoneTightness < 0.3 && Math.abs(equilibriumBias) > 0.4) {
          p.fill(150, 220, 255);
          p.text('Breakout Zone', 10, 52);
        }
        if (equilibriumBias > 0.05) {
          p.fill(100, 255, 100);
          p.text('Equilibrium shifting up (Demand > Supply)', 10, 68);
        } else if (equilibriumBias < -0.05) {
          p.fill(255, 100, 100);
          p.text('Equilibrium shifting down (Supply > Demand)', 10, 68);
        } else {
          p.fill(180, 200, 255);
          p.text('Equilibrium in balance', 10, 68);
        }
      };

      p.windowResized = () => {
        p.resizeCanvas(parentEl.clientWidth, parentEl.clientHeight);
        initParticles();
      };
    },
    [] // Empty dependency - all state accessed via refs
  );

  return (
    <div className="relative w-full h-full">
      {/* P5 Sketch */}
      <P5Sketch sketch={volumeAnatomySketch} />
    </div>
  );
};
