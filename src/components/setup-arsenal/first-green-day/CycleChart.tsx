
import React, { useRef, useEffect, useState } from 'react';
import p5 from 'p5';

// Type definition for the data points used in the visualization
interface CandleData {
  day: number;
  type: 'green' | 'red' | 'frd' | 'fgd';
  o: number; // open
  c: number; // close
  h: number; // high
  l: number; // low
  vol: number; // volume
  ma: number; // moving average value for this day
  note?: string; // narrative note
}

const CYCLE_DATA: CandleData[] = [
  {
    day: 1,
    type: 'green',
    o: 10,
    c: 12,
    h: 13,
    l: 9,
    vol: 20,
    ma: 10,
    note: 'Day 1: Catalyst triggers initial buying. Attention builds.',
  },
  {
    day: 2,
    type: 'green',
    o: 12,
    c: 15,
    h: 16,
    l: 11,
    vol: 35,
    ma: 11,
    note: 'Day 2: Continuation. Volume increases.',
  },
  {
    day: 3,
    type: 'green',
    o: 15,
    c: 20,
    h: 22,
    l: 14,
    vol: 60,
    ma: 13,
    note: 'Day 3: Acceleration. FOMO kicks in.',
  },
  {
    day: 4,
    type: 'green',
    o: 20,
    c: 30,
    h: 32,
    l: 19,
    vol: 100,
    ma: 17,
    note: 'Day 4: PARABOLIC! Climax Run. Extreme extension from MA.',
  },
  {
    day: 5,
    type: 'frd',
    o: 33,
    c: 28,
    h: 35,
    l: 27,
    vol: 90,
    ma: 21,
    note: 'Day 5: FIRST RED DAY. Gap up trapped longs. Reversal confirmed.',
  },
  {
    day: 6,
    type: 'red',
    o: 28,
    c: 22,
    h: 29,
    l: 21,
    vol: 50,
    ma: 23,
    note: 'Day 6: The Cascade. Profit taking overwhelms buyers.',
  },
  {
    day: 7,
    type: 'red',
    o: 22,
    c: 16,
    h: 23,
    l: 15,
    vol: 40,
    ma: 22,
    note: 'Day 7: Continued selling. Sentiment turns bearish.',
  },
  {
    day: 8,
    type: 'red',
    o: 16,
    c: 11,
    h: 17,
    l: 10,
    vol: 120,
    ma: 20,
    note: 'Day 8: CAPITULATION. Panic selling volume spike.',
  },
  {
    day: 9,
    type: 'fgd',
    o: 11,
    c: 15,
    h: 16,
    l: 10,
    vol: 70,
    ma: 18,
    note: 'Day 9: FIRST GREEN DAY. Oversold bounce initiated.',
  },
];

export const CycleChart: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  // Use a ref to store the current step for p5 to read synchronously
  const stepRef = useRef(0);
  const [currentStep, setCurrentStep] = useState(0);

  // Function to update the step
  const handleStepChange = (val: number) => {
    setCurrentStep(val);
    stepRef.current = val;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      const canvasWidth = 800;
      const canvasHeight = 450;

      // Layout constants
      const candleWidth = 20;
      const spacing = (canvasWidth - 100) / 9; // Distribute across width
      const startX = 60;
      const chartTop = 40;
      const chartBottom = canvasHeight - 100; // Leave room for volume

      // Helper to map price to Y coordinate
      const getPriceY = (price: number) => {
        // Price range roughly 0 to 40
        return p.map(price, 0, 40, chartBottom, chartTop);
      };

      p.setup = () => {
        const canvas = p.createCanvas(canvasWidth, canvasHeight);
        canvas.parent(containerRef.current!);
        // Ensure the canvas is responsive via CSS, but p5 internal resolution is fixed
        canvas.style('width', '100%');
        canvas.style('height', 'auto');

        // Initial render settings
        p.textFont('sans-serif');
      };

      p.draw = () => {
        // Read the current step from the Ref (always up-to-date)
        const step = stepRef.current;

        p.background(17, 24, 39); // Tailwind gray-900 match

        // --- Draw Grid & Axes ---
        p.stroke(55, 65, 81); // gray-700
        p.strokeWeight(1);
        // Horizontal grid lines
        for (let i = 0; i <= 40; i += 10) {
          const y = getPriceY(i);
          p.line(40, y, p.width - 20, y);
          p.noStroke();
          p.fill(107, 114, 128); // gray-500
          p.textSize(10);
          p.textAlign(p.RIGHT, p.CENTER);
          p.text(`$${i}`, 35, y);
          p.stroke(55, 65, 81); // restore stroke
        }

        // Volume separator line
        p.stroke(75, 85, 99);
        p.line(40, chartBottom + 10, p.width - 20, chartBottom + 10);

        // --- Draw Moving Average ---
        p.noFill();
        p.stroke(250, 204, 21); // Tailwind yellow-400
        p.strokeWeight(2);
        p.beginShape();
        for (let i = 0; i <= step; i++) {
          const d = CYCLE_DATA[i];
          const x = startX + i * spacing;
          const y = getPriceY(d.ma);
          p.curveVertex(x, y);
          // Duplicate start/end points for catmull-rom spline control
          if (i === 0) p.curveVertex(x, y);
          if (i === step) p.curveVertex(x, y);
        }
        p.endShape();

        // Label MA
        if (step >= 0) {
          const lastData = CYCLE_DATA[step];
          const maX = startX + step * spacing;
          const maY = getPriceY(lastData.ma);
          p.noStroke();
          p.fill(250, 204, 21);
          p.textSize(10);
          p.textAlign(p.LEFT, p.BOTTOM);
          p.text('20 EMA', maX + 5, maY - 5);
        }

        // --- Draw Candles & Volume ---
        for (let i = 0; i <= step; i++) {
          const d = CYCLE_DATA[i];
          const x = startX + i * spacing;

          const openY = getPriceY(d.o);
          const closeY = getPriceY(d.c);
          const highY = getPriceY(d.h);
          const lowY = getPriceY(d.l);

          const isUp = d.c >= d.o;
          const color = isUp ? p.color(34, 197, 94) : p.color(239, 68, 68); // green-500 : red-500

          p.stroke(color);
          p.strokeWeight(1.5);

          // Wick
          p.line(x, highY, x, lowY);

          // Body
          p.rectMode(p.CORNERS);
          p.fill(color);
          // Ensure min height for doji
          const bodyTop = Math.min(openY, closeY);
          const bodyBot =
            Math.max(openY, closeY) === bodyTop
              ? bodyTop + 1
              : Math.max(openY, closeY);
          p.rect(x - candleWidth / 2, bodyTop, x + candleWidth / 2, bodyBot);

          // Volume
          // Map volume 0-150 to a height of about 80px
          const volMaxHeight = 80;
          const volHeight = p.map(d.vol, 0, 150, 0, volMaxHeight);

          p.noStroke();
          // Highlight volume on climax days
          if (i === 3 || i === 7) {
            p.fill(253, 224, 71); // yellow-300 for climax
          } else {
            p.fill(color);
            // Make volume slightly transparent
            const c = p.color(isUp ? '#22c55e' : '#ef4444');
            c.setAlpha(150);
            p.fill(c);
          }

          p.rectMode(p.CORNER);
          const volY = canvasHeight - 10;
          p.rect(x - candleWidth / 2, volY, candleWidth, -volHeight);

          // Labels
          p.fill(156, 163, 175); // gray-400
          p.textAlign(p.CENTER, p.TOP);
          p.textSize(11);
          p.text(`Day ${d.day}`, x, volY + 5);
        }

        // --- Annotations (Dynamic overlays) ---
        const currentData = CYCLE_DATA[step];
        const cx = startX + step * spacing;

        // Entry markers
        if (currentData.type === 'frd') {
          const highY = getPriceY(currentData.h);
          p.fill(239, 68, 68);
          p.noStroke();
          p.triangle(cx, highY - 10, cx - 6, highY - 20, cx + 6, highY - 20);
          p.textAlign(p.CENTER, p.BOTTOM);
          p.textSize(12);
          p.textStyle(p.BOLD);
          p.text('SHORT ENTRY', cx, highY - 22);
        }

        if (currentData.type === 'fgd') {
          const lowY = getPriceY(currentData.l);
          p.fill(34, 197, 94);
          p.noStroke();
          p.triangle(cx, lowY + 10, cx - 6, lowY + 20, cx + 6, lowY + 20);
          p.textAlign(p.CENTER, p.TOP);
          p.textSize(12);
          p.textStyle(p.BOLD);
          p.text('LONG ENTRY', cx, lowY + 22);
        }
      };
    };

    // Create p5 instance
    const myP5 = new p5(sketch);
    p5InstanceRef.current = myP5;

    // Cleanup
    return () => {
      myP5.remove();
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Chart Container */}
      <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-inner border border-gray-700">
        <div
          ref={containerRef}
          className="w-full h-full flex justify-center items-center"
        />

        {/* Overlay Badge for Phase */}
        <div className="absolute top-4 right-4 bg-gray-800/90 border border-gray-600 px-4 py-2 rounded-lg shadow-lg pointer-events-none">
          <span className="text-gray-400 text-xs uppercase tracking-wider block">
            Current Phase
          </span>
          <span
            className={`font-bold text-lg ${
              CYCLE_DATA[currentStep].type === 'frd'
                ? 'text-red-400'
                : CYCLE_DATA[currentStep].type === 'fgd'
                ? 'text-green-400'
                : 'text-white'
            }`}
          >
            {CYCLE_DATA[currentStep].type === 'frd'
              ? 'First Red Day'
              : CYCLE_DATA[currentStep].type === 'fgd'
              ? 'First Green Day'
              : CYCLE_DATA[currentStep].day <= 4
              ? 'The Runner'
              : 'The Cascade'}
          </span>
        </div>
      </div>

      {/* Controls Area */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center text-white font-medium">
            <span>Day {CYCLE_DATA[currentStep].day}</span>
            <span className="text-gray-400 text-sm">{currentStep + 1} / 9</span>
          </div>

          {/* Slider */}
          <div className="relative h-6 w-full flex items-center">
            <input
              type="range"
              min="0"
              max="8"
              value={currentStep}
              onChange={(e) => handleStepChange(parseInt(e.target.value))}
              className="z-10 w-full"
            />
            {/* Tick marks */}
            <div className="absolute w-full flex justify-between px-1 pointer-events-none opacity-30">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-0.5 ${
                    i === 4 || i === 8 ? 'bg-yellow-400 h-3' : 'bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Narrative Text */}
          <div className="min-h-[60px] flex items-center justify-center text-center">
            <p className="text-lg md:text-xl font-light text-gray-200 animate-pulse-short">
              {CYCLE_DATA[currentStep].note}
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-2">
            <button
              onClick={() => handleStepChange(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
            >
              Previous Day
            </button>
            <button
              onClick={() => handleStepChange(Math.min(8, currentStep + 1))}
              disabled={currentStep === 8}
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors shadow-lg shadow-blue-900/20"
            >
              Next Day
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
          <span>Buying Pressure</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
          <span>Selling Pressure</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
          <span>20 EMA (Moving Avg)</span>
        </div>
      </div>
    </div>
  );
};
