
import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { GameState, Choice } from './types';
import { ROOMS, INITIAL_SCORE } from './constants';
import { MazeEnvironment } from './MazeEnvironment';
import { HUD } from './HUD';
import { CameraShake, PerspectiveCamera } from '@react-three/drei';

export const MazeGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentRoomIndex: 0,
    disciplineScore: INITIAL_SCORE,
    status: 'INTRO',
    lastChoiceResult: null,
  });

  const currentRoom = ROOMS[gameState.currentRoomIndex];

  const handleStart = () => {
    setGameState((prev) => ({ ...prev, status: 'PLAYING' }));
  };

  const handleChoice = useCallback(
    (choice: Choice) => {
      const newScore = gameState.disciplineScore + choice.disciplineImpact;

      setGameState((prev) => ({
        ...prev,
        disciplineScore: Math.max(0, newScore),
        status: 'FEEDBACK',
        lastChoiceResult: {
          correct: choice.isCorrect,
          feedback: choice.feedback,
          impact: choice.disciplineImpact,
        },
      }));
    },
    [gameState.disciplineScore]
  );

  const handleNext = useCallback(() => {
    if (gameState.disciplineScore <= 0) {
      setGameState((prev) => ({ ...prev, status: 'GAME_OVER' }));
      return;
    }

    if (gameState.currentRoomIndex >= ROOMS.length - 1) {
      setGameState((prev) => ({ ...prev, status: 'VICTORY' }));
      return;
    }

    setGameState((prev) => ({
      ...prev,
      currentRoomIndex: prev.currentRoomIndex + 1,
      status: 'PLAYING',
      lastChoiceResult: null,
    }));
  }, [gameState.disciplineScore, gameState.currentRoomIndex]);

  const handleRestart = () => {
    setGameState({
      currentRoomIndex: 0,
      disciplineScore: INITIAL_SCORE,
      status: 'PLAYING',
      lastChoiceResult: null,
    });
  };

  // Camera Shake Config
  const shakeConfig = {
    maxYaw: 0.05, // Max amount camera can yaw in either direction
    maxPitch: 0.05, // Max amount camera can pitch in either direction
    maxRoll: 0.05, // Max amount camera can roll in either direction
    yawFrequency: 0.5, // Frequency of the yaw shake
    pitchFrequency: 0.5, // Frequency of the pitch shake
    rollFrequency: 0.5, // Frequency of the roll shake
    intensity:
      gameState.status === 'FEEDBACK' &&
      gameState.lastChoiceResult?.correct === false
        ? 1
        : 0.2, // increased shake on bad choice
    decay: false, // if true, the shake will decay over time
    decayRate: 0.65, // rate at which the shake decays
  };

  return (
    <div className="w-full h-[950px] relative bg-black overflow-hidden rounded-xl border border-gray-800">
      {/* 3D Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />

          <MazeEnvironment
            room={currentRoom}
            gameStatus={gameState.status}
            choiceResult={gameState.lastChoiceResult?.correct ?? null}
          />
          <CameraShake {...shakeConfig} />
        </Canvas>
      </div>

      {/* UI Layer */}
      <HUD
        gameState={gameState}
        currentRoom={currentRoom}
        onChoice={handleChoice}
        onNext={gameState.status === 'INTRO' ? handleStart : handleNext}
        onRestart={handleRestart}
      />
    </div>
  );
};
