import { Box, Shield, Brain, Crosshair, Mic, Globe } from 'lucide-react';

export const BRAND_COLORS = {
  primary: '#0E131B',
  secondary: '#0B1532',
  accent: '#B0811C',
  success: '#0C311B',
  danger: '#590D0D',
  text: '#F1F5F9',
};

export const MODULES = [
  {
    id: 1,
    title: 'The Market Magic Box',
    subtitle: 'From Chaos to Clarity',
    icon: Box,
    description:
      "Step into The Market Magic Box and discover how markets truly work. This immersive journey transforms you from curious beginner to market decoder, revealing the DNA behind every price tick. Through stunning visualizations, you'll build a living market—particle by particle. Master volume analysis, uncover liquidity hunts, decode the four-layer ecosystem, and learn what separates the 5% who profit from the 95% who don't.",
    features: [
      'The Trading Universe and the Arena',
      'The Layers of Trading',
      'Share Structure & The IPO Process',
      'The Market Magic Box',
      'The Particle Model',
      'Energy and Motion',
      'Equilibrium and Pressure',
      'The Battle Inside the Box',
      'Volume Anatomy',
      'Volume at Price and VWAP',
      'Volume Rotation',
      'The Architecture of Trends',
      "The Predator's Playbook",
      'Liquidity Hunts and False Breakouts',
      'Order Flow Mechanics',
      'The Shadow Float — Profiting From the Fall',
      'The Market Ecosystem: Participants & Intentions',
      'Fundamentals and Dilution',
    ],
  },
  {
    id: 2,
    title: 'Fortress Risk Mastery',
    subtitle: 'The Foundation of Survival',
    icon: Shield,
    description:
      'Master the art of survival in trading. This comprehensive module teaches you the risk management systems that separate the 10% who thrive from the 90% who fail. Learn position sizing, stop-loss architecture, risk-reward optimization, expectancy tracking, drawdown management, portfolio heat control, volatility adaptation, and psychological discipline. Build your personalized, style-specific risk management plan that will protect your capital through any market condition. No matter how good your strategy, without fortress-level risk management, you will not survive. This is the most critical module in your trading education — the foundation upon which everything else is built. Complete with interactive tools, real-world examples, and a 30-day challenge to prove your fortress under fire.',
    features: [
      'The Prime Directive: Survival and Risk of Ruin',
      'Position Sizing Mastery: Your Fortress Foundation',
      'Stop Loss Architecture: Designing The Escape Hatches',
      'Risk-Reward Mastery: Asymmetric Warfare',
      'Expectancy and R-Multiples: The Language Of Commanders',
      'Drawdown Management: The Fortress Under Siege',
      'Portfolio Heat and Correlation: The Fortress Walls',
      'Volatility Regimes and Tail Risk: Weathering the Storms',
      'Psychological Warfare: The Enemy Inside the Walls',
      'Build Your Personal Fortress: Style-Specific Risk Plans',
    ],
  },
  {
    id: 3,
    title: 'The Cognitive Athlete',
    subtitle: 'Neuroscience & Psychology',
    icon: Brain,
    description:
      "Master the 80% of trading that has nothing to do with charts. Learn the hard neuroscience behind why smart traders make dumb decisions, and discover the exact protocols elite performers use to manage fear, greed, stress, and decision fatigue. This isn't motivational fluff. It's evidence-based cognitive science that transforms your brain's operating system. You cannot fight your biology, but you can hack it.",
    features: [
      'The Triune Brain: Your Three Trading Minds',
      'The Amygdala Hijack: When You Lose Control',
      'The Insula and Embodied Cognition: Why Losses Hurt Physically',
      'The Dopamine Casino: Why Trading Is Chemically Addictive',
      'Cortisol and Testosterone: The Chemical Warfare Inside You',
      'Decision Fatigue and the Cognitive Battery',
      'Cognitive Biases: The Fatal Four',
      'Neuroplasticity: Rewiring Your Trading Brain',
      'Trader Psychometric Profiling: Know Your Hardware',
      "Flow State and the Biohacker's Edge",
      'Building Psychological Resilience',
      'The Anatomy of a Trade: Integration & Mastery',
    ],
  },
  {
    id: 4,
    title: 'The Setup Arsenal',
    subtitle: 'Complete Trading Playbook',
    icon: Crosshair,
    description:
      "Module 4 is your complete trading playbook — a systematic collection of 15+ setups covering every timeframe from 5-minute scalps to multi-month swings. You'll master high-frequency patterns like VWAP Bounces and Opening Range Breakouts, multi-day cycles like First Red Day and Liquidity Plays, manipulation setups like Reverse Splits, and rare home-run trades like Episodic Pivots. Each setup includes detailed qualification criteria, multiple entry methods, position management frameworks, and risk parameters. Unlike other courses that teach isolated patterns, every setup here connects back to the Market Magic Box framework from Module 1, showing you WHY they work at a mechanical level. You'll learn not just WHAT to trade, but HOW to recognize setups forming in real-time, WHEN to enter with precision, and HOW to manage positions for maximum profit with controlled risk.",
    features: [
      'The Setup Arsenal Introduction — Your Complete Trading Playbook',
      'News Plays and Momentum vs Pop and Drop',
      'Open Range Breakout vs Gap Up Short',
      'Afternoon Breakout vs Afternoon Fade',
      'Parabolic Short vs Panic Dip Buy',
      'First Green Day vs First Red Day',
      'Overextended Gap Up Short vs Overextended Gap Down Long',
      'Reverse Split Long vs Reverse Split Short',
      'VWAP Bounce vs VWAP Rejection',
      'Liquidity (Trap) Play Setup',
      'Earnings Play, Episodic Pivots and Chart Patterns',
    ],
  },
  {
    id: 5,
    title: 'Trader Interviews',
    subtitle: 'Real Stories, Real Wisdom',
    icon: Mic,
    description:
      'Real conversations with real traders—from seasoned veterans to rising talents. Discover the personalities, struggles, and life experiences that shape successful traders beyond the charts and strategies.',
    features: [
      'Veteran Market Navigators',
      'Rising Talent Stories',
      'Overcoming Blowups',
      'Psychological Breakthroughs',
      'Diverse Perspectives',
    ],
  },
  {
    id: 6,
    title: 'Your Platform',
    subtitle: 'Build Your Digital Home',
    icon: Globe,
    description:
      'Launch your own professional website and blog—completely free. No coding experience required. Share your journey, document your growth, and build your personal brand with a custom platform.',
    features: [
      'Zero-Cost Hosting Setup',
      'Custom Admin Panel',
      'No Coding Required',
      'Personal Brand Building',
      'Journaling Your Journey',
    ],
  },
];

export const TERMINAL_DATA = [
  {
    user: 'Student_7482',
    action: 'Completed Module 1',
    result: '+18R this month',
    type: 'success',
  },
  {
    user: 'Student_3391',
    action: 'Built Risk Plan',
    result: 'Survived 15% drawdown',
    type: 'warning',
  },
  {
    user: 'Student_8823',
    action: 'VWAP Bounce Setup',
    result: '7 consecutive winners',
    type: 'success',
  },
  {
    user: 'Student_2047',
    action: 'Episodic Pivot',
    result: '+142% in 3 days',
    type: 'success',
  },
  {
    user: 'System',
    action: 'Market Scan',
    result: 'Institutional Activity Detected',
    type: 'info',
  },
];

export const FAQ_ITEMS = [
  {
    question: 'Is this course suitable for complete beginners?',
    answer:
      'Yes. Module 1 starts from first principles, teaching you the physics of the market before moving to complex strategies. We build the foundation together.',
  },
  {
    question: 'Do I need special software?',
    answer:
      'No. The concepts apply to any charting platform. For Module 6 (Website), we provide a complete setup guide using free tools.',
  },
  {
    question: 'How long do I have access to the course?',
    answer:
      'You have lifetime access to all modules, including future updates. You can learn at your own pace.',
  },
  {
    question: 'What is the 30-Day Fortress Challenge?',
    answer:
      'It is a capstone project in Module 2 where you trade (live or paper) adhering strictly to your new risk management plan to earn your badge of discipline.',
  },
];
