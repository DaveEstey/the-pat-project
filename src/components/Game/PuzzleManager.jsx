import React, { useState, useEffect, useRef } from 'react';
import { PuzzleSystem } from '../../systems/PuzzleSystem.js';
import SwitchSequence from './Puzzles/SwitchSequence.jsx';
import TerrainModifier from './Puzzles/TerrainModifier.jsx';
import DoorMechanism from './Puzzles/DoorMechanism.jsx';
import PathSelector from './Puzzles/PathSelector.jsx';

export function PuzzleManager({ gameEngine, levelNumber = 1, roomIndex = 0, onPuzzleComplete }) {
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [puzzleTimer, setPuzzleTimer] = useState({ remaining: 0, maxTime: 0 });
  const puzzleSystemRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Initialize puzzle system
  useEffect(() => {
    if (!gameEngine || isInitializedRef.current) return;

    puzzleSystemRef.current = new PuzzleSystem(gameEngine);
    isInitializedRef.current = true;

    // Listen for puzzle events
    gameEngine.on('puzzleStarted', handlePuzzleStarted);
    gameEngine.on('puzzleCompleted', handlePuzzleCompleted);
    gameEngine.on('puzzleFailed', handlePuzzleFailed);
    gameEngine.on('puzzleTimerUpdate', handlePuzzleTimerUpdate);

    // Start puzzle based on level and room
    const puzzleConfig = getPuzzleConfig(levelNumber, roomIndex);
    if (puzzleConfig) {
      setTimeout(() => {
        startPuzzle(puzzleConfig);
      }, 2000); // 2 second delay after room starts
    }

    return () => {
      // Clean up event listeners
      if (gameEngine) {
        gameEngine.off('puzzleStarted', handlePuzzleStarted);
        gameEngine.off('puzzleCompleted', handlePuzzleCompleted);
        gameEngine.off('puzzleFailed', handlePuzzleFailed);
        gameEngine.off('puzzleTimerUpdate', handlePuzzleTimerUpdate);
      }

      // Clean up puzzle system
      if (puzzleSystemRef.current) {
        puzzleSystemRef.current.cleanup();
        puzzleSystemRef.current = null;
      }

      isInitializedRef.current = false;
    };
  }, [gameEngine, levelNumber, roomIndex]);

  // Handle puzzle click events
  useEffect(() => {
    const handleCanvasClick = (event) => {
      if (!puzzleSystemRef.current || !currentPuzzle) return;

      const canvas = gameEngine?.renderer?.domElement;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const screenX = event.clientX - rect.left;
      const screenY = event.clientY - rect.top;
      const camera = gameEngine.getCamera();

      if (camera) {
        const handled = puzzleSystemRef.current.handleInteraction(screenX, screenY, camera);
        if (handled) {
        }
      }
    };

    // Add click listener to game canvas
    const canvas = gameEngine?.renderer?.domElement;
    if (canvas && currentPuzzle) {
      canvas.addEventListener('click', handleCanvasClick);

      return () => {
        canvas.removeEventListener('click', handleCanvasClick);
      };
    }
  }, [gameEngine, currentPuzzle]);

  const handlePuzzleStarted = (event) => {
    setCurrentPuzzle(event.puzzle);
    setPuzzleTimer({
      remaining: event.timeLimit,
      maxTime: event.timeLimit
    });
  };

  const handlePuzzleCompleted = (event) => {

    // Give player points for completing puzzle
    const bonusPoints = Math.max(100, Math.floor((event.timeLimit - event.timeUsed) / 100));

    // Notify game that puzzle is complete
    if (onPuzzleComplete) {
      onPuzzleComplete({
        type: event.puzzle.type,
        success: true,
        bonusPoints: bonusPoints,
        timeUsed: event.timeUsed
      });
    }

    // Clear puzzle after delay
    setTimeout(() => {
      setCurrentPuzzle(null);
      setPuzzleTimer({ remaining: 0, maxTime: 0 });
    }, 3000);
  };

  const handlePuzzleFailed = (event) => {

    // Notify game that puzzle failed (but no damage as per specs)
    if (onPuzzleComplete) {
      onPuzzleComplete({
        type: event.puzzle.type,
        success: false,
        reason: event.reason,
        bonusPoints: 0
      });
    }

    // Clear puzzle after delay
    setTimeout(() => {
      setCurrentPuzzle(null);
      setPuzzleTimer({ remaining: 0, maxTime: 0 });
    }, 2000);
  };

  const handlePuzzleTimerUpdate = (event) => {
    setPuzzleTimer({
      remaining: event.timeRemaining,
      maxTime: event.timeLimit
    });

    // Update puzzle state
    if (currentPuzzle) {
      setCurrentPuzzle(prev => ({
        ...prev,
        timeRemaining: event.timeRemaining,
        progress: event.progress,
        maxProgress: event.maxProgress
      }));
    }
  };

  const startPuzzle = (config) => {
    if (!puzzleSystemRef.current) return;

    puzzleSystemRef.current.initializePuzzle(config);
  };

  const getPuzzleConfig = (level, room) => {
    // Define puzzles for different levels and rooms
    const puzzleConfigs = {
      // Level 1 - Tutorial puzzles
      1: {
        0: {
          type: 'switch_sequence',
          sequence: [1, 2, 3],
          timeLimit: 20000,
          positions: [
            { x: -3, y: 1, z: -8 },
            { x: 0, y: 1, z: -8 },
            { x: 3, y: 1, z: -8 }
          ]
        },
        1: {
          type: 'terrain_modifier',
          timeLimit: 25000,
          targets: [
            { x: -2, y: 0, z: -10 },
            { x: 2, y: 0, z: -10 }
          ]
        },
        2: {
          type: 'door_mechanism',
          timeLimit: 30000,
          doorPosition: { x: 0, y: 2, z: -12 },
          keyPositions: [
            { x: -4, y: 1, z: -10 },
            { x: 4, y: 1, z: -10 }
          ]
        }
      },
      // Level 2 - More complex puzzles
      2: {
        0: {
          type: 'switch_sequence',
          sequence: [2, 1, 4, 3],
          timeLimit: 18000,
          positions: [
            { x: -4, y: 1, z: -8 },
            { x: -2, y: 1, z: -8 },
            { x: 2, y: 1, z: -8 },
            { x: 4, y: 1, z: -8 }
          ]
        },
        1: {
          type: 'path_selector',
          timeLimit: 15000,
          paths: [
            { id: 'left', position: { x: -3, y: 0, z: -15 }, correct: false },
            { id: 'center', position: { x: 0, y: 0, z: -15 }, correct: true },
            { id: 'right', position: { x: 3, y: 0, z: -15 }, correct: false }
          ]
        },
        2: {
          type: 'terrain_modifier',
          timeLimit: 22000,
          targets: [
            { x: -3, y: 0, z: -10 },
            { x: 0, y: 0, z: -8 },
            { x: 3, y: 0, z: -10 }
          ]
        }
      },
      // Level 3 - Advanced puzzles
      3: {
        0: {
          type: 'door_mechanism',
          timeLimit: 35000,
          doorPosition: { x: 0, y: 2, z: -15 },
          keyPositions: [
            { x: -5, y: 1, z: -12 },
            { x: 5, y: 1, z: -12 },
            { x: 0, y: 3, z: -10 }
          ]
        },
        1: {
          type: 'switch_sequence',
          sequence: [3, 1, 4, 2, 3],
          timeLimit: 16000,
          positions: [
            { x: -3, y: 1, z: -8 },
            { x: -1, y: 1, z: -8 },
            { x: 1, y: 1, z: -8 },
            { x: 3, y: 1, z: -8 }
          ]
        },
        2: {
          type: 'path_selector',
          timeLimit: 12000,
          paths: [
            { id: 'left', position: { x: -4, y: 0, z: -15 }, correct: false },
            { id: 'center_left', position: { x: -2, y: 0, z: -15 }, correct: true },
            { id: 'center_right', position: { x: 2, y: 0, z: -15 }, correct: false },
            { id: 'right', position: { x: 4, y: 0, z: -15 }, correct: false }
          ]
        }
      }
    };

    return puzzleConfigs[level]?.[room] || null;
  };

  // Update puzzle system
  useEffect(() => {
    if (!puzzleSystemRef.current) return;

    const gameLoop = () => {
      if (puzzleSystemRef.current) {
        puzzleSystemRef.current.update(0.016); // ~60fps
      }
    };

    const interval = setInterval(gameLoop, 16);

    return () => clearInterval(interval);
  }, []);

  // Render appropriate puzzle UI component
  const renderPuzzleUI = () => {
    if (!currentPuzzle) return null;

    const commonProps = {
      puzzle: currentPuzzle,
      onInteraction: (data) => {
      }
    };

    switch (currentPuzzle.type) {
      case 'switch_sequence':
        return <SwitchSequence {...commonProps} />;
      case 'terrain_modifier':
        return <TerrainModifier {...commonProps} />;
      case 'door_mechanism':
        return <DoorMechanism {...commonProps} />;
      case 'path_selector':
        return <PathSelector {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <>
      {renderPuzzleUI()}

      {/* Puzzle completion feedback */}
      {currentPuzzle?.state === 'completed' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-green-900 bg-opacity-90 text-white p-6 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">🎉 Puzzle Completed!</div>
            <div className="text-lg">
              Time used: {Math.ceil((Date.now() - currentPuzzle.startTime) / 1000)}s
            </div>
            <div className="text-sm text-gray-300 mt-2">
              Bonus points awarded for quick completion!
            </div>
          </div>
        </div>
      )}

      {/* Puzzle failure feedback */}
      {currentPuzzle?.state === 'failed' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-yellow-900 bg-opacity-90 text-white p-6 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-2">⏱️ Time's Up!</div>
            <div className="text-lg">Puzzle timed out</div>
            <div className="text-sm text-gray-300 mt-2">
              No penalties - keep moving forward!
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PuzzleManager;