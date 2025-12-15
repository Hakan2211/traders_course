
import React from 'react';
import { GameState, RoomData, Choice } from './types';
import {
  Shield,
  Brain,
  AlertTriangle,
  ArrowRight,
  RefreshCcw,
} from 'lucide-react';
import { MAX_SCORE } from './constants';

interface HUDProps {
  gameState: GameState;
  currentRoom: RoomData;
  onChoice: (choice: Choice) => void;
  onNext: () => void;
  onRestart: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  gameState,
  currentRoom,
  onChoice,
  onNext,
  onRestart,
}) => {
  const { status, disciplineScore, lastChoiceResult } = gameState;

  // Intro Screen
  if (status === 'INTRO') {
    return (
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-white p-6">
        <div className="max-w-2xl w-full text-center space-y-8 animate-fade-in">
          <div className="flex justify-center mb-6">
            <Brain className="w-24 h-24 text-blue-500 animate-pulse" />
          </div>
          <h1 className="text-5xl font-bold tracking-tighter bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            3D MIND MAZE
          </h1>
          <p className="text-xl text-gray-300">
            Psychological Warfare Simulator
          </p>
          <div className="bg-gray-900/80 p-6 rounded-lg border border-gray-700 text-left space-y-4">
            <p className="text-gray-400">MISSION BRIEFING:</p>
            <p>
              You will navigate 5 chambers, each representing a dangerous
              trading bias.
            </p>
            <p>Your goal: Survive with your Discipline Score intact.</p>
            <ul className="list-disc list-inside text-sm text-gray-400 space-y-2">
              <li>Start with {gameState.disciplineScore} Discipline Points</li>
              <li>Correct choices increase discipline (+points)</li>
              <li>Traps destroy discipline (-points)</li>
              <li>If Discipline hits 0, you wash out.</li>
            </ul>
          </div>
          <button
            onClick={onNext}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all transform hover:scale-105 shadow-lg shadow-blue-900/50 flex items-center gap-2 mx-auto"
          >
            ENTER THE MAZE <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Victory Screen
  if (status === 'VICTORY') {
    return (
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-green-950/90 backdrop-blur-md text-white p-6">
        <div className="text-center space-y-6 animate-fade-in">
          <Shield className="w-32 h-32 text-green-400 mx-auto" />
          <h1 className="text-5xl font-bold text-green-400">
            MENTAL FORTRESS BUILT
          </h1>
          <p className="text-2xl">
            Final Discipline Score: {disciplineScore} / {MAX_SCORE}
          </p>
          <p className="text-gray-300 max-w-lg mx-auto">
            You have successfully identified and countered the enemy inside the
            walls. Your mind is now your greatest asset.
          </p>
          <button
            onClick={onRestart}
            className="px-8 py-3 bg-green-600 hover:bg-green-500 rounded-full font-bold transition-all flex items-center gap-2 mx-auto"
          >
            <RefreshCcw className="w-5 h-5" /> RESTART SIMULATION
          </button>
        </div>
      </div>
    );
  }

  // Game Over Screen
  if (status === 'GAME_OVER') {
    return (
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-red-950/90 backdrop-blur-md text-white p-6">
        <div className="text-center space-y-6 animate-fade-in">
          <AlertTriangle className="w-32 h-32 text-red-500 mx-auto" />
          <h1 className="text-5xl font-bold text-red-500">
            PSYCHOLOGICAL BREAKDOWN
          </h1>
          <p className="text-xl">Your discipline reached 0.</p>
          <p className="text-gray-300 max-w-lg mx-auto">
            The market found your weakness and exploited it. Review the biases
            and try again.
          </p>
          <button
            onClick={onRestart}
            className="px-8 py-3 bg-red-600 hover:bg-red-500 rounded-full font-bold transition-all flex items-center gap-2 mx-auto"
          >
            <RefreshCcw className="w-5 h-5" /> TRY AGAIN
          </button>
        </div>
      </div>
    );
  }

  // Main HUD (Playing & Feedback)
  return (
    <div className="absolute inset-0 z-10 flex flex-col pointer-events-none">
      {/* Top Bar: Stats */}
      <div className="flex justify-between items-center p-6 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-800 border-2 border-blue-500 flex items-center justify-center font-mono text-xl text-blue-400 font-bold">
            {currentRoom.id}
          </div>
          <div>
            <h2 className="text-gray-400 text-xs uppercase tracking-widest">
              CHAMBER
            </h2>
            <p className="text-white font-bold">{currentRoom.biasName}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <h2 className="text-gray-400 text-xs uppercase tracking-widest">
              DISCIPLINE
            </h2>
            <div className="w-48 h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
              <div
                className={`h-full transition-all duration-500 ${
                  disciplineScore < 30 ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    (disciplineScore / MAX_SCORE) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
          <div
            className={`text-2xl font-mono font-bold ${
              disciplineScore < 30 ? 'text-red-500' : 'text-blue-400'
            }`}
          >
            {disciplineScore}
          </div>
        </div>
      </div>

      {/* Middle: Visual Feedback Text (Floating) */}
      <div className="flex-1 flex items-center justify-center p-8">
        {status === 'FEEDBACK' && lastChoiceResult && (
          <div
            className={`
            max-w-2xl bg-black/90 border-2 p-8 rounded-xl backdrop-blur-md shadow-2xl transform transition-all animate-bounce-in pointer-events-auto
            ${
              lastChoiceResult.correct
                ? 'border-green-500 text-green-100'
                : 'border-red-500 text-red-100'
            }
          `}
          >
            <h3
              className={`text-3xl font-bold mb-4 ${
                lastChoiceResult.correct ? 'text-green-400' : 'text-red-500'
              }`}
            >
              {lastChoiceResult.correct
                ? 'DISCIPLINE MAINTAINED'
                : 'BIAS DETECTED'}
            </h3>
            <p className="text-lg mb-6 leading-relaxed border-l-4 pl-4 border-current opacity-90">
              {lastChoiceResult.feedback}
            </p>
            <div className="flex justify-between items-center">
              <span
                className={`text-xl font-bold ${
                  lastChoiceResult.impact > 0
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}
              >
                {lastChoiceResult.impact > 0 ? '+' : ''}
                {lastChoiceResult.impact} Points
              </span>
              <button
                onClick={onNext}
                className={`px-6 py-2 rounded-lg font-bold text-black flex items-center gap-2 hover:opacity-90 transition-opacity
                    ${lastChoiceResult.correct ? 'bg-green-500' : 'bg-red-500'}
                  `}
              >
                CONTINUE <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom: Scenario & Choices */}
      {status === 'PLAYING' && (
        <div className="p-6 pb-12 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-auto">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-6 mb-6 backdrop-blur-sm">
              <h3 className="text-blue-400 font-bold mb-2 uppercase text-sm tracking-wider">
                Scenario
              </h3>
              <p className="text-xl text-white font-medium leading-relaxed">
                {currentRoom.scenario}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentRoom.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => onChoice(choice)}
                  className="group relative overflow-hidden bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-blue-500 p-6 rounded-xl text-left transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/20"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gray-600 group-hover:bg-blue-500 transition-colors" />
                  <span className="block text-xs text-gray-400 mb-1 group-hover:text-blue-400 uppercase tracking-widest">
                    Option {choice.id}
                  </span>
                  <span className="text-lg font-semibold text-gray-100 group-hover:text-white">
                    {choice.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
