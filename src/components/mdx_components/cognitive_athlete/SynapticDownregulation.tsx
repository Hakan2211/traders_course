
import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Brain, Activity } from 'lucide-react';

// --- Interactive Simulation Component ---

const SynapticDownregulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frequency, setFrequency] = useState(20);
  const [receptorHealth, setReceptorHealth] = useState(100);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulation State
  const simulation = useRef({
    particles: [] as {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      id: number;
    }[],
    receptors: [] as {
      x: number;
      y: number;
      active: boolean;
      cooldown: number;
      health: number;
    }[],
    sparks: [] as { x: number; y: number; life: number; color: string }[],
    lastSpawn: 0,
    time: 0,
    overloadAccumulator: 0,
    signalStrength: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      if (containerRef.current && canvas) {
        const { width } = containerRef.current.getBoundingClientRect();
        // Set actual canvas size to match display size for sharpness
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = 500 * dpr;

        // Scale context to ensure drawing operations use logical coordinates
        ctx.scale(dpr, dpr);

        // Logical size for calculations
        const logicalWidth = width;
        const logicalHeight = 500;

        canvas.style.width = `${width}px`;
        canvas.style.height = `500px`;

        initReceptors(logicalWidth, logicalHeight);
      }
    };

    const initReceptors = (width: number, height: number) => {
      const count = Math.floor(width / 60);
      const spacing = width / (count + 1);
      const receptors = [];
      for (let i = 0; i < count; i++) {
        receptors.push({
          x: spacing * (i + 1),
          y: height - 60,
          active: true,
          cooldown: 0,
          health: 1.0, // 1.0 is full health, 0.0 is dead/downregulated
        });
      }
      simulation.current.receptors = receptors;
    };

    const update = (dt: number, width: number, height: number) => {
      const sim = simulation.current;
      sim.time += dt;

      // Adjust spawn rate based on slider
      // Slider 0-100.
      const spawnInterval = 1000 / (1 + frequency * 2.5);

      if (sim.time - sim.lastSpawn > spawnInterval) {
        sim.lastSpawn = sim.time;
        // Spawn particle
        sim.particles.push({
          x: width / 2 + (Math.random() - 0.5) * 150,
          y: 60,
          vx: (Math.random() - 0.5) * 3,
          vy: 2 + Math.random() * 3,
          life: 1.0,
          id: Math.random(),
        });
      }

      // Update Receptors Health logic
      // If frequency is high (>60), global health decays
      // If frequency is low (<40), global health recovers
      let drain = 0;
      if (frequency > 60) {
        drain = (frequency - 60) * 0.0008; // Decay speed
      } else if (frequency < 40) {
        drain = -(40 - frequency) * 0.0005; // Recovery speed
      }

      // Apply health changes individually with some noise
      sim.receptors.forEach((r) => {
        r.health = Math.max(0, Math.min(1, r.health - drain));
        // Cooldown recovery
        if (r.cooldown > 0) r.cooldown -= dt * 0.005;
      });

      // Calculate average health for UI
      const avgHealth =
        sim.receptors.reduce((a, b) => a + b.health, 0) / sim.receptors.length;
      setReceptorHealth(avgHealth * 100);

      // Update Particles
      for (let i = sim.particles.length - 1; i >= 0; i--) {
        const p = sim.particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Simple gravity/terminal velocity feel
        p.vy = Math.min(p.vy + 0.1, 8);

        // Collision with receptors
        let hit = false;
        for (let r of sim.receptors) {
          const dx = p.x - r.x;
          const dy = p.y - r.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Hitbox logic
          if (dist < 30 && p.y < r.y + 15 && p.y > r.y - 20) {
            // Hit logic
            if (r.health > 0.2 && r.cooldown <= 0) {
              // Successful reception
              hit = true;
              r.cooldown = 1.0; // Flash cooldown
              // Create spark
              for (let k = 0; k < 8; k++) {
                sim.sparks.push({
                  x: r.x,
                  y: r.y,
                  life: 1.0,
                  color: '#fbbf24', // Gold spark on success
                });
              }
            } else {
              // Bounce off dead/cooldown receptor
              p.vy = -p.vy * 0.6;
              p.vx = (Math.random() - 0.5) * 8;
            }
          }
        }

        // Remove if off screen or absorbed
        if (hit) {
          sim.particles.splice(i, 1);
        } else if (p.y > height + 50) {
          sim.particles.splice(i, 1);
        }
      }

      // Update Sparks
      for (let i = sim.sparks.length - 1; i >= 0; i--) {
        const s = sim.sparks[i];
        s.life -= 0.05;
        s.y -= 2;
        s.x += Math.random() - 0.5;
        if (s.life <= 0) sim.sparks.splice(i, 1);
      }
    };

    const draw = (width: number, height: number) => {
      // Clear
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#0f172a'; // Slate 900
      ctx.fillRect(0, 0, width, height);

      // Draw Dendrite (Bottom Surface)
      const dendriteHeight = 60;
      ctx.fillStyle = '#1e293b'; // Slate 800
      ctx.fillRect(0, height - dendriteHeight, width, dendriteHeight);

      // Dendrite Glow
      const gradient = ctx.createLinearGradient(
        0,
        height - dendriteHeight,
        0,
        height
      );
      gradient.addColorStop(0, 'rgba(30, 41, 59, 1)');
      gradient.addColorStop(1, 'rgba(15, 23, 42, 1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, height - dendriteHeight, width, dendriteHeight);

      // Draw Receptors
      const sim = simulation.current;
      sim.receptors.forEach((r) => {
        // Receptor base
        const size = 20 * r.health; // Shrink if dying
        const alpha = 0.3 + r.health * 0.7;

        if (r.health > 0.05) {
          ctx.beginPath();
          // Cup shape
          ctx.arc(r.x, r.y, 22, 0, Math.PI, true);
          ctx.fillStyle = '#334155';
          ctx.fill();

          // Inner active part
          ctx.beginPath();
          ctx.arc(r.x, r.y, size, 0, Math.PI, true);

          // Color based on activity
          if (r.cooldown > 0.5) {
            ctx.fillStyle = '#fbbf24'; // Flash Gold
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#fbbf24';
          } else {
            ctx.fillStyle = `rgba(94, 234, 212, ${alpha})`; // Teal/Blue-ish idle
            ctx.shadowBlur = 0;
          }
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          // Ghost of a dead receptor
          ctx.beginPath();
          ctx.arc(r.x, r.y, 10, 0, Math.PI, true);
          ctx.fillStyle = 'rgba(51, 65, 85, 0.3)';
          ctx.fill();
        }
      });

      // Draw Particles (Dopamine)
      sim.particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        // Green color for Dopamine as requested
        ctx.fillStyle = '#4ade80';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#4ade80';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Sparks
      sim.sparks.forEach((s) => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${s.life})`;
        ctx.fill();
      });

      // Draw Axon Terminal (Top)
      ctx.beginPath();
      // Organic shape for the terminal button
      ctx.moveTo(width * 0.2, -50);
      ctx.bezierCurveTo(width * 0.2, 120, width * 0.8, 120, width * 0.8, -50);

      ctx.fillStyle = '#334155';
      ctx.fill();

      // Axon Glow pulse
      ctx.beginPath();
      ctx.moveTo(width * 0.2, -50);
      ctx.bezierCurveTo(width * 0.2, 120, width * 0.8, 120, width * 0.8, -50);
      ctx.strokeStyle = `rgba(74, 222, 128, ${0.1 + frequency / 200})`; // Green glow
      ctx.lineWidth = 6;
      ctx.stroke();

      // Text Labels in Canvas
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = 'rgba(74, 222, 128, 0.8)';
      ctx.fillText('AXON TERMINAL (Sending)', width / 2 - 70, 40);

      ctx.fillStyle = 'rgba(94, 234, 212, 0.8)';
      ctx.fillText('DENDRITE (Receiving)', width / 2 - 60, height - 20);
    };

    let lastTime = 0;
    const loop = (timestamp: number) => {
      const dt = timestamp - lastTime;
      lastTime = timestamp;

      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        // Use logical height of 500
        update(dt, width, 500);
        draw(width, 500);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener('resize', resize);
    animationFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [frequency]);

  return (
    <div
      className="w-full max-w-4xl mx-auto bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl"
      ref={containerRef}
    >
      {/* Header Controls */}
      <div className="p-6 border-b border-slate-700 bg-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-green-400" />
            The Dopamine Casino
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Synaptic Downregulation Simulator
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 w-full md:w-auto">
          <div className="flex justify-between w-full md:w-64 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            <span>Signal Strength</span>
            <span>{Math.round((frequency / 100) * receptorHealth)}%</span>
          </div>
          <div className="h-3 w-full md:w-64 bg-slate-700 rounded-full overflow-hidden relative">
            {/* Background markers */}
            <div className="absolute left-1/4 top-0 bottom-0 w-px bg-slate-600"></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-600"></div>
            <div className="absolute left-3/4 top-0 bottom-0 w-px bg-slate-600"></div>

            <div
              className={`h-full transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
                receptorHealth > 70
                  ? 'bg-green-500 shadow-green-500/50'
                  : receptorHealth > 30
                  ? 'bg-yellow-500 shadow-yellow-500/50'
                  : 'bg-red-500 shadow-red-500/50'
              }`}
              style={{
                width: `${Math.min(100, (frequency / 100) * receptorHealth)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Canvas Layer */}
      <div className="relative bg-[#0f172a]">
        <canvas ref={canvasRef} className="w-full h-[500px] block" />

        {/* Floating Labels */}
        <div className="absolute top-8 left-8 pointer-events-none animate-pulse">
          <div className="bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-md text-xs font-mono text-green-400 border border-green-500/30 shadow-lg">
            ● Dopamine (Green Particles)
          </div>
        </div>

        <div className="absolute bottom-8 left-8 pointer-events-none">
          <div
            className={`backdrop-blur px-4 py-2 rounded-lg text-sm font-mono border shadow-xl transition-all duration-500 ${
              receptorHealth < 40
                ? 'bg-red-900/90 text-red-200 border-red-500'
                : 'bg-slate-800/90 text-teal-200 border-teal-500/30'
            }`}
          >
            Receptor Count: {Math.round(receptorHealth)}%
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="p-8 bg-slate-800 border-t border-slate-700">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex justify-between items-end">
            <label className="text-slate-300 font-medium">
              Trading Frequency
            </label>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                frequency > 80
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                  : frequency > 40
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                  : 'bg-green-500/20 text-green-400 border border-green-500/50'
              }`}
            >
              {frequency > 80
                ? 'OBSESSIVE (Casino Mode)'
                : frequency > 40
                ? 'ACTIVE TRADING'
                : 'DISCIPLINED (Process Mode)'}
            </span>
          </div>

          <div className="relative h-12 flex items-center">
            <input
              type="range"
              min="10"
              max="100"
              value={frequency}
              onChange={(e) => setFrequency(parseInt(e.target.value))}
              className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400 transition-all"
            />
          </div>

          <div className="flex justify-between text-xs text-slate-500 font-mono">
            <span>Low Dopamine (Sustainable)</span>
            <span>High Dopamine (Addictive)</span>
          </div>
        </div>

        {/* Dynamic Feedback Box */}
        <div
          className={`p-6 rounded-xl transition-all duration-500 border flex gap-4 ${
            receptorHealth < 50
              ? 'bg-red-950/40 border-red-500/50'
              : 'bg-slate-900/50 border-slate-700'
          }`}
        >
          <div
            className={`p-3 rounded-full h-fit ${
              receptorHealth < 50 ? 'bg-red-500/20' : 'bg-blue-500/20'
            }`}
          >
            {receptorHealth < 50 ? (
              <AlertTriangle className="w-6 h-6 text-red-500" />
            ) : (
              <Brain className="w-6 h-6 text-blue-400" />
            )}
          </div>
          <div>
            <h4
              className={`font-bold text-lg mb-2 ${
                receptorHealth < 50 ? 'text-red-200' : 'text-slate-200'
              }`}
            >
              {receptorHealth < 50
                ? 'BIOLOGICAL TOLERANCE DETECTED'
                : 'NEUROCHEMICAL HOMEOSTASIS'}
            </h4>
            <p className="text-slate-400 leading-relaxed">
              {receptorHealth < 50
                ? "Your receptors are burning out due to the flood of dopamine. The signal strength is dropping despite the high volume. To get the 'hit' now, you will need to increase position size or risk."
                : 'Receptors are healthy and sensitive. Small wins create meaningful satisfaction signals. You can maintain this level of activity indefinitely without building tolerance.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SynapticDownregulation;
