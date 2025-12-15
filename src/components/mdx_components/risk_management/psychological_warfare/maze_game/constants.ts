import { RoomData } from './types';

export const INITIAL_SCORE = 50;
export const MAX_SCORE = 100;

export const ROOMS: RoomData[] = [
  {
    id: 1,
    title: 'The Narrow Corridor',
    biasName: 'LOSS AVERSION',
    description:
      'The walls are slowly closing in. You feel the pressure to act immediately.',
    scenario:
      'You are in a trade that is currently down -0.5%. Your stop loss is approaching, but you feel a strong urge to avoid taking the loss.',
    colorTheme: '#ef4444', // Red
    fogDensity: 0.05,
    visualTrap: 'walls-closing',
    choices: [
      {
        id: 'A',
        text: 'Move stop further away to give it room to breathe.',
        isCorrect: false,
        feedback:
          'The walls crushed you. By moving your stop, a small manageable loss turned into a catastrophic -3% hit.',
        disciplineImpact: -50,
      },
      {
        id: 'B',
        text: 'Accept the loss if it hits your stop. Preserve capital.',
        isCorrect: true,
        feedback:
          'The walls recede. You took a small -1R hit, but your capital is safe to fight another day.',
        disciplineImpact: 20,
      },
    ],
  },
  {
    id: 2,
    title: 'The Golden Chamber',
    biasName: 'OVERCONFIDENCE',
    description:
      'A room filled with blinding golden light. You feel invincible.',
    scenario:
      "You've won 5 trades in a row. You feel like you can't lose. A B-grade setup appears. It doesn't quite meet all your criteria, but you're 'on fire'.",
    colorTheme: '#fbbf24', // Gold
    fogDensity: 0.02,
    visualTrap: 'pit',
    choices: [
      {
        id: 'A',
        text: "Take the trade! I'm seeing the market clearly today.",
        isCorrect: false,
        feedback:
          'The floor collapses beneath you. Overconfidence blinded you to the risks. The streak ends with a massive drawdown.',
        disciplineImpact: -40,
      },
      {
        id: 'B',
        text: 'Skip it. Stick to A-grade setups only.',
        isCorrect: true,
        feedback:
          'A bridge appears. You realized your streak was variance, not godhood. Discipline preserved.',
        disciplineImpact: 30,
      },
    ],
  },
  {
    id: 3,
    title: 'The Muddy Swamp',
    biasName: 'SUNK COST FALLACY',
    description: 'The floor is thick mud. You are slowly sinking.',
    scenario:
      'You are down -$500 on a position. If you buy more now at a lower price, you can lower your average entry and break even sooner.',
    colorTheme: '#78350f', // Brown
    fogDensity: 0.08,
    visualTrap: 'quicksand',
    choices: [
      {
        id: 'A',
        text: 'Add to the position to lower average entry.',
        isCorrect: false,
        feedback:
          'You sink deeper. You doubled your risk on a losing trade. The market kept dropping, destroying your account.',
        disciplineImpact: -60,
      },
      {
        id: 'B',
        text: 'Close the position immediately. The money is already gone.',
        isCorrect: true,
        feedback:
          'A rope pulls you out. You accepted the reality of the loss instead of digging a deeper hole.',
        disciplineImpact: 30,
      },
    ],
  },
  {
    id: 4,
    title: 'The Hall of Mirrors',
    biasName: 'ANCHORING BIAS',
    description: 'Reflections surround you, distorting value.',
    scenario:
      "You bought a stock at $180. It is now trading at $160. It feels 'cheap' because you are anchored to your entry price.",
    colorTheme: '#0ea5e9', // Blue/Cyan
    fogDensity: 0.04,
    visualTrap: 'mirrors',
    choices: [
      {
        id: 'A',
        text: 'Hold. It HAS to go back to $180.',
        isCorrect: false,
        feedback:
          "The mirrors shatter. The market doesn't care about your entry price. You held a losing bag based on a past number.",
        disciplineImpact: -40,
      },
      {
        id: 'B',
        text: 'Evaluate $160 objectively. Would I buy here today?',
        isCorrect: true,
        feedback:
          'The path clears. You broke the anchor and made a decision based on current reality.',
        disciplineImpact: 25,
      },
    ],
  },
  {
    id: 5,
    title: 'The Foggy Bridge',
    biasName: 'CONFIRMATION BIAS',
    description:
      'Thick fog obscures the path. You can only see what you want to see.',
    scenario:
      'You are long. Bearish news is breaking, but you find one obscure blog post that supports your bullish thesis.',
    colorTheme: '#64748b', // Slate/Grey
    fogDensity: 0.15,
    visualTrap: 'fog',
    choices: [
      {
        id: 'A',
        text: 'Focus on the blog post. The bears are wrong.',
        isCorrect: false,
        feedback:
          "The fog consumes you. You ignored the warning signs because they didn't fit your narrative.",
        disciplineImpact: -50,
      },
      {
        id: 'B',
        text: 'Actively look for reasons why the trade might fail.',
        isCorrect: true,
        feedback:
          'The fog lifts. Seeking disconfirming evidence saved you from a blindside.',
        disciplineImpact: 40,
      },
    ],
  },
];
