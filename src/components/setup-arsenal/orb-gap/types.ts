export interface SetupData {
  id: string;
  title: string;
  type: 'long' | 'short';
  category: string;
  complementary: string;
  timeOfDay: string;
  idealTimeframe: {
    entry: string;
    exit: string;
  };
  riskLevel: {
    label: string;
    level: 1 | 2 | 3 | 4 | 5; // 1 = low, 5 = extreme
  };
  successRate: {
    range: string;
    percentage: number;
  };
  riskReward: string;
  volumeReq: string;
  volumeReqSub: string;
  floatPref: string;
  floatPrefSub: string;
  catalyst: {
    required: boolean;
    points: string[];
  };
}

export interface TimelineEvent {
  time: string;
  longAction: {
    title: string;
    desc: string;
  };
  shortAction: {
    title: string;
    desc: string;
  };
}

export interface ComparisonPoint {
  long: string;
  short: string;
  category?: string; // e.g. "Consolidation", "Volume"
}
