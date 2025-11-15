import React, { useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { getLevelRooms } from '../../data/levelRooms.js';
import { useGame } from '../../contexts/GameContext.jsx';
import { getProgressionSystem } from '../../systems/ProgressionSystem.js';
import { EnvironmentSystem } from '../../systems/EnvironmentSystem.js';
import { getWeaponUpgradeSystem } from '../../systems/WeaponUpgradeSystem.js';
import UnifiedRoomManager from './UnifiedRoomManager.jsx';
import { SequencePuzzleManager } from './SequencePuzzleManager.jsx';
import { SecretRoomManager } from './SecretRoomManager.jsx';
import { BossIntroSequence } from './BossIntroSequence.jsx';
import { RoomTransition } from './RoomTransition.jsx';
import { WeaponUpgradeShop } from '../UI/WeaponUpgradeShop.jsx';
import { HazardManager } from './HazardManager.jsx';
import { DestructibleManager } from './DestructibleManager.jsx';
import { getTargetPuzzleConfig } from '../../data/puzzleConfigs.js';
import { getSecretRoomConfig } from '../../data/secretRoomConfigs.js';
import { getBossForRoom } from '../../data/bossConfigs.js';

// Level Manager - Controls progression through multiple rooms per level
export function LevelManager({ levelNumber, gameEngine, onLevelComplete, onRoomChange }) {
  const { state, goToMenu, restartLevel } = useGame();
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [levelState, setLevelState] = useState('active');
  const [isMoving, setIsMoving] = useState(false);
  const [movementProgress, setMovementProgress] = useState(0);
  const [levelStartTime, setLevelStartTime] = useState(Date.now());
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(5); // 5 second countdown
  const [puzzleCompleted, setPuzzleCompleted] = useState(false);
  const [puzzleActive, setPuzzleActive] = useState(false);
  const [puzzleConfig, setPuzzleConfig] = useState(null);
  const [secretRoomUnlocked, setSecretRoomUnlocked] = useState(false);
  const [secretRoomConfig, setSecretRoomConfig] = useState(null);
  const [bossIntroActive, setBossIntroActive] = useState(false);
  const [bossData, setBossData] = useState(null);
  const [bossIntroShown, setBossIntroShown] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  
  // CRITICAL: Don't recreate room on every render - use stable reference
  const levelRooms = React.useMemo(() => getLevelRooms(levelNumber), [levelNumber]);
  const currentRoomConfig = React.useMemo(() => {
    // Safety check: prevent accessing rooms beyond available range
    if (currentRoomIndex >= levelRooms.length) {
      console.error(`Room index ${currentRoomIndex} out of bounds, using last room`);
      return levelRooms[levelRooms.length - 1];
    }

    return levelRooms[currentRoomIndex];
  }, [levelRooms, currentRoomIndex, levelNumber]); // Only change when room actually changes

  // Initialize puzzle for current level/room
  useEffect(() => {
    const targetPuzzle = getTargetPuzzleConfig(levelNumber);

    if (targetPuzzle && currentRoomIndex === 1) {
      // Activate puzzle in room 2 (index 1) if available
      setPuzzleConfig(targetPuzzle);
      setPuzzleActive(true);
      setPuzzleCompleted(false);
    } else {
      setPuzzleConfig(null);
      setPuzzleActive(false);
    }
  }, [levelNumber, currentRoomIndex]);

  // Initialize secret room configuration
  useEffect(() => {
    const secretRoom = getSecretRoomConfig(levelNumber);

    if (secretRoom && currentRoomIndex === 1) {
      // Load secret room config for room 2
      setSecretRoomConfig(secretRoom);
      setSecretRoomUnlocked(false); // Reset unlock state
    } else {
      setSecretRoomConfig(null);
    }
  }, [levelNumber, currentRoomIndex]);

  // Listen for secret room unlock event
  useEffect(() => {
    const handleSecretRoomUnlock = (event) => {
      if (event.detail && event.detail.levelNumber === levelNumber) {
        setSecretRoomUnlocked(true);
      }
    };

    window.addEventListener('secretRoomUnlocked', handleSecretRoomUnlock);

    return () => {
      window.removeEventListener('secretRoomUnlocked', handleSecretRoomUnlock);
    };
  }, [levelNumber]);

  // Check for boss in current room and trigger intro
  useEffect(() => {
    const boss = getBossForRoom(levelNumber, currentRoomIndex);

    if (boss && boss.introEnabled && !bossIntroShown) {
      // Trigger boss intro after short delay
      setTimeout(() => {
        setBossData(boss);
        setBossIntroActive(true);
      }, 1000); // 1 second delay after room entry
    }
  }, [levelNumber, currentRoomIndex, bossIntroShown]);

  // Handle boss intro completion
  const handleBossIntroComplete = () => {
    setBossIntroActive(false);
    setBossIntroShown(true);
    // Resume normal gameplay
  };
  
  // Calculate level completion stats
  const calculateLevelStats = useCallback(() => {
    const levelEndTime = Date.now();
    const timeElapsedMs = levelEndTime - levelStartTime;
    const minutes = Math.floor(timeElapsedMs / 60000);
    const seconds = Math.floor((timeElapsedMs % 60000) / 1000);
    const timeElapsedString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const expectedEnemyCount = levelRooms.reduce((total, room) => total + (room.enemyCount || 3), 0);

    return {
      finalScore: state.player.score,
      enemiesDefeated: expectedEnemyCount, // All enemies must be defeated to complete level
      timeElapsed: timeElapsedString,
      accuracy: `${state.player.accuracy}%`,
      healthRemaining: state.player.health
    };
  }, [levelStartTime, levelRooms, state.player]);

  // Handle puzzle completion
  const handlePuzzleComplete = useCallback(() => {
    setPuzzleCompleted(true);
    setPuzzleActive(false);

    // Award bonus points from puzzle reward
    if (puzzleConfig && puzzleConfig.reward && puzzleConfig.reward.points) {
      const progressionSystem = getProgressionSystem();
      progressionSystem.addScore(puzzleConfig.reward.points);
    }
  }, [puzzleConfig]);

  // Handle puzzle failure (optional - puzzle can be failed without penalty)
  const handlePuzzleFailed = useCallback(() => {
    setPuzzleActive(false);
    // No penalty for failing - just removes puzzle from room
  }, []);

  // Handle room completion and progression
  const handleRoomCleared = useCallback(() => {
    // Prevent multiple calls during movement transition or if level is already complete
    if (isMoving || levelState !== 'active') {
      return;
    }

    const levelRooms = getLevelRooms(levelNumber);

    if (currentRoomIndex < levelRooms.length - 1) {
      // More rooms in this level
      setIsMoving(true);
      setMovementProgress(0);

      // Movement transition animation (3 seconds)
      const startTime = Date.now();
      const duration = 3000;

      const animateMovement = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        setMovementProgress(progress);

        if (progress >= 1) {
          // Movement complete - ensure we don't exceed room bounds
          let newRoomIndex = 0;
          setCurrentRoomIndex(prev => {
            const newIndex = prev + 1;
            const maxIndex = levelRooms.length - 1;
            const safeIndex = Math.min(newIndex, maxIndex);
            newRoomIndex = safeIndex;
            return safeIndex;
          });

          // Notify parent of room change AFTER state update to avoid setState during render
          if (onRoomChange) {
            setTimeout(() => onRoomChange(newRoomIndex), 0);
          }

          setIsMoving(false);
          setMovementProgress(0);
        } else {
          requestAnimationFrame(animateMovement);
        }
      };

      animateMovement();

    } else {
      // Level complete
      setLevelState('complete');

      // Save level completion to progression system
      const progressionSystem = getProgressionSystem();
      const stats = calculateLevelStats();
      progressionSystem.completeLevel(levelNumber, stats);

      // Award currency for level completion (base 100 + 50 per level)
      const upgradeSystem = getWeaponUpgradeSystem();
      const levelBonus = 100 + (levelNumber * 50);
      upgradeSystem.addCurrency(levelBonus);
    }
  }, [currentRoomIndex, levelNumber, onLevelComplete, isMoving, calculateLevelStats, levelState]);
  
  // Handle replay level
  const handleReplay = useCallback(() => {
    setLevelStartTime(Date.now());
    restartLevel();
    setCurrentRoomIndex(0);
    setLevelState('active');
    setIsMoving(false);
    setMovementProgress(0);
  }, [restartLevel]);
  
  // Reset when level changes and create environment
  useEffect(() => {
    setCurrentRoomIndex(0);
    setLevelState('active');
    setIsMoving(false);
    setMovementProgress(0);
    setLevelStartTime(Date.now());

    // Create themed environment for this level
    if (gameEngine && gameEngine.setEnvironment) {
      const theme = EnvironmentSystem.getThemeForLevel(levelNumber);
      gameEngine.setEnvironment(theme, levelNumber);
    }
  }, [levelNumber, levelRooms, gameEngine]);
  
  // Expose room clearing handler globally for other components
  useEffect(() => {
    window.levelManager = {
      handleRoomCleared: handleRoomCleared,
      currentRoomIndex: currentRoomIndex,
      levelNumber: levelNumber,
      isMoving: isMoving
    };
    
    return () => {
      delete window.levelManager;
    };
  }, [handleRoomCleared, currentRoomIndex, levelNumber, isMoving]);
  
  // Auto-advance countdown when level is complete
  useEffect(() => {
    if (levelState === 'complete' && levelNumber < 12) {
      // Reset timer when level completes
      setAutoAdvanceTimer(5);

      // Countdown timer
      const countdown = setInterval(() => {
        setAutoAdvanceTimer(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            // Auto-advance to next level
            if (onLevelComplete) {
              onLevelComplete(levelNumber + 1);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [levelState, levelNumber, onLevelComplete]);

  // Debug: Track both global and local states
  React.useEffect(() => {
  }, [state.gameState, levelState]);

  return (
    <>
      {/* Debug overlay */}
      <div className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded text-xs z-50">
        <div>Global: {state.gameState}</div>
        <div>Local: {levelState}</div>
      </div>
      
      {/* Room number indicator */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded z-50">
        <div className="font-bold text-center">
          LEVEL {levelNumber} - ROOM {currentRoomIndex + 1}/{levelRooms.length}
        </div>
      </div>
      
      {isMoving ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
          <div className="text-white text-center">
            <div className="text-4xl mb-4">Moving to Next Room...</div>
            <div className="w-64 h-4 bg-gray-700 rounded-full overflow-hidden mx-auto">
              <div
                className="h-full bg-blue-500 transition-all duration-100"
                style={{ width: `${movementProgress * 100}%` }}
              />
            </div>
          </div>
        </div>
      ) : null}

      {currentRoomConfig ? (
        <>
          <UnifiedRoomManager
            key={`level_${levelNumber}_room_${currentRoomIndex}`}
            gameEngine={gameEngine}
            roomIndex={currentRoomIndex}
            levelNumber={levelNumber}
            roomConfig={currentRoomConfig}
            isPaused={shopOpen || levelState === 'complete'}
            onRoomComplete={(result) => {
              if (result === 'cleared') {
                handleRoomCleared();
              }
            }}
          />
          {/* Render puzzle if active in this room */}
          {puzzleActive && puzzleConfig && (
            <SequencePuzzleManager
              key={`puzzle_${levelNumber}_room_${currentRoomIndex}`}
              gameEngine={gameEngine}
              puzzleConfig={puzzleConfig}
              onPuzzleComplete={handlePuzzleComplete}
              onPuzzleFailed={handlePuzzleFailed}
              roomPosition={{ x: 0, y: 0, z: 0 }}
            />
          )}
          {/* Render secret room if configured */}
          {secretRoomConfig && (
            <SecretRoomManager
              key={`secret_${levelNumber}_room_${currentRoomIndex}`}
              gameEngine={gameEngine}
              secretRoomConfig={secretRoomConfig}
              isUnlocked={secretRoomUnlocked}
              onEnterSecretRoom={(config) => {
                // Handle entering secret room - award rewards
                if (config.rewards) {
                  const progressionSystem = getProgressionSystem();
                  config.rewards.forEach(reward => {
                    if (reward.type === 'points') {
                      progressionSystem.addScore(reward.value);
                    } else if (reward.type === 'health') {
                      progressionSystem.restoreHealth(reward.value);
                    }
                    // Additional reward types can be handled here
                  });
                }
              }}
              playerPosition={state.player?.position || { x: 0, y: 0, z: 0 }}
            />
          )}
          {/* Render boss intro sequence if active */}
          {bossIntroActive && bossData && gameEngine && gameEngine.getCamera && (
            <BossIntroSequence
              key={`boss_intro_${levelNumber}_room_${currentRoomIndex}`}
              gameEngine={gameEngine}
              bossData={bossData}
              playerCamera={gameEngine.getCamera()}
              onIntroComplete={handleBossIntroComplete}
            />
          )}
          {/* Render environmental hazards */}
          <HazardManager
            key={`hazards_${levelNumber}_room_${currentRoomIndex}`}
            gameEngine={gameEngine}
            levelNumber={levelNumber}
            roomIndex={currentRoomIndex}
            playerPosition={state.player?.position || { x: 0, y: 0, z: 0 }}
            isPaused={shopOpen || levelState === 'complete' || bossIntroActive || isMoving}
          />
          {/* Render destructible objects and cover */}
          <DestructibleManager
            key={`destructibles_${levelNumber}_room_${currentRoomIndex}`}
            gameEngine={gameEngine}
            levelNumber={levelNumber}
            roomIndex={currentRoomIndex}
            isPaused={shopOpen || levelState === 'complete' || bossIntroActive || isMoving}
          />
        </>
      ) : null}

      {levelState === 'complete' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50">
          <div className="bg-gray-800 p-8 rounded-lg text-white text-center max-w-md">
            <h2 className="text-4xl font-bold mb-4">Level {levelNumber} Complete!</h2>
            <div className="mb-6 space-y-2">
              <div className="text-2xl font-bold text-green-400">Score: {calculateLevelStats().finalScore}</div>
              <div className="text-lg">Time: {calculateLevelStats().timeElapsed}</div>
              <div className="text-lg">Accuracy: {calculateLevelStats().accuracy}</div>
            </div>

            {levelNumber < 12 ? (
              <>
                <div className="mb-4 p-4 bg-blue-900 bg-opacity-50 rounded">
                  <div className="text-xl font-bold text-blue-300">Next: Level {levelNumber + 1}</div>
                  <div className="text-sm text-gray-400 mt-2">Auto-advancing in {autoAdvanceTimer}s...</div>
                </div>
                <div className="space-y-3">
                  <button
                    className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded font-bold animate-pulse"
                    onClick={() => {
                      if (onLevelComplete) {
                        onLevelComplete(levelNumber + 1);
                      }
                    }}
                  >
                    Continue Now →
                  </button>
                  <button
                    className="w-full bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded font-bold"
                    onClick={() => setShopOpen(true)}
                  >
                    🛠️ Weapon Shop
                  </button>
                  <button
                    className="w-full bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded"
                    onClick={() => {
                      handleReplay();
                    }}
                  >
                    Replay Level
                  </button>
                  <button
                    className="w-full bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded"
                    onClick={() => {
                      goToMenu();
                    }}
                  >
                    Main Menu
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4 p-4 bg-green-900 bg-opacity-50 rounded">
                  <div className="text-2xl font-bold text-green-300">🎉 Campaign Complete! 🎉</div>
                  <div className="text-sm text-gray-400 mt-2">All 12 levels conquered!</div>
                </div>
                <div className="space-y-3">
                  <button
                    className="w-full bg-green-600 hover:bg-green-700 px-6 py-3 rounded font-bold"
                    onClick={() => {
                      handleReplay();
                    }}
                  >
                    Replay Level 12
                  </button>
                  <button
                    className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded"
                    onClick={() => {
                      goToMenu();
                    }}
                  >
                    Main Menu
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Weapon Upgrade Shop */}
      {shopOpen && (
        <WeaponUpgradeShop onClose={() => setShopOpen(false)} />
      )}
    </>
  );
}

export default LevelManager;