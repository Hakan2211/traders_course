export interface TraderProfile {
  id: string;
  name: string;
  description: string;
  riskType: 'conservative' | 'aggressive' | 'emotional';
  initialBalance: number;
  data: {
    balance: number[];
    drawdown: number[];
    isAlive: boolean[];
    stressLevel: number[];
  };
}

export interface SimulationConfig {
  initialBalance: number;
  winRate: number;
  rewardRatio: number;
  totalTrades: number;
}

