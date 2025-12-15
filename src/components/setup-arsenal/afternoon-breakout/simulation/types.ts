export type SimulationMode = 'breakout' | 'fade';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: any; // p5.Color
}
