export interface Choice {
  id: 'A' | 'B';
  text: string;
  isCorrect: boolean;
  feedback: string;
  disciplineImpact: number;
}

export interface RoomData {
  id: number;
  title: string;
  biasName: string;
  description: string;
  scenario: string;
  colorTheme: string; // Hex color for lighting
  fogDensity: number;
  choices: [Choice, Choice];
  visualTrap: 'walls-closing' | 'pit' | 'quicksand' | 'mirrors' | 'fog';
}

export type GameStatus =
  | 'INTRO'
  | 'PLAYING'
  | 'FEEDBACK'
  | 'GAME_OVER'
  | 'VICTORY';

export interface GameState {
  currentRoomIndex: number;
  disciplineScore: number;
  status: GameStatus;
  lastChoiceResult: {
    correct: boolean;
    feedback: string;
    impact: number;
  } | null;
}
