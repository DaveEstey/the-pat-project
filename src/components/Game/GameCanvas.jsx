import React, { useRef, useEffect, useState } from 'react';
import { GameEngine } from '../../systems/GameEngine.js';
import { EnemyProjectileSystem } from '../../systems/EnemyProjectileSystem.js';
import { ItemSystem } from '../../systems/ItemSystem.js';
import { useGame } from '../../contexts/GameContext.jsx';
import { useAudio } from '../../contexts/AudioContext.jsx';
import { useSettings } from '../../contexts/SettingsContext.jsx';
import { getLevelRooms } from '../../data/levelRooms.js';
import UnifiedRoomManager from './UnifiedRoomManager.jsx';
import UnifiedCombatSystem from './UnifiedCombatSystem.jsx';
import UnifiedMovementController from './UnifiedMovementController.jsx';
import LevelManager from './LevelManager.jsx';
import ProjectileSystemBridge from './ProjectileSystemBridge.jsx';
import PuzzleManager from './PuzzleManager.jsx';
import DamageIndicator from '../UI/DamageIndicator.jsx';
import GameOverScreen from '../UI/GameOverScreen.jsx';
import WeaponController from './WeaponController.jsx';
import VisualFeedbackSystem from './VisualFeedbackSystem.jsx';
import InteractivePuzzle from './InteractivePuzzle.jsx';
import WeaponEffects from './WeaponEffects.jsx';
import WeaponPickup from './WeaponPickup.jsx';
import SoundManager from './SoundManager.jsx';
import Inventory from '../UI/Inventory.jsx';
import MobileControls from '../UI/MobileControls.jsx';
import EnemyWarningIndicator from '../UI/EnemyWarningIndicator.jsx';
import { getProgressionSystem } from '../../systems/ProgressionSystem.js';
import { getPuzzleForLevel } from '../../data/puzzleConfigs.js';

export default function GameCanvas() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const itemSystemRef = useRef(null);
  const projectileSystemRef = useRef(null);
  const animationFrameRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [useMultiRoom] = useState(true); // Enable multi-room progression
  const [currentRoom, setCurrentRoom] = useState(0);
  const [showInventory, setShowInventory] = useState(false);

  const { state, updatePlayerPosition, setGameState, switchWeapon, updatePlayerHealth, addScore, visitRoom, completeRoom, startLevel, updateAmmo, activatePowerup, unlockUpgrade, addToInventory } = useGame();
  const { playSound } = useAudio();
  const { settings } = useSettings();

  useEffect(() => {
    if (!canvasRef.current || isInitialized) return;

    const initializeGame = async () => {
      // Initialize game engine
      engineRef.current = new GameEngine();
      
      try {
        engineRef.current.initialize(canvasRef.current);

        // Initialize game systems
        itemSystemRef.current = new ItemSystem(engineRef.current);

        // Initialize projectile system
        projectileSystemRef.current = new EnemyProjectileSystem(engineRef.current);

      // Set up event listeners
      engineRef.current.on('positionUpdate', (data) => {
        updatePlayerPosition(data.position);
      });

      // Enemy combat events
      engineRef.current.on('enemyKilled', (data) => {
        addScore(data.points);
        playSound('enemy', 'death');
      });

      engineRef.current.on('enemyHit', (data) => {
        playSound('enemy', 'hit');
      });

      engineRef.current.on('enemyAttack', (data) => {
        updatePlayerHealth(-data.damage);
        playSound('player', 'hit');
      });

      // Weapon events
      engineRef.current.on('weaponFired', (data) => {
        playSound('weapon', data.weapon);
      });

      // Item events
      engineRef.current.on('itemCollected', (data) => {
        playSound('item', 'collect');
      });

      engineRef.current.on('itemEffect', (data) => {
        // Apply item effects to player
        if (data.healthRestore) {
          updatePlayerHealth(data.healthRestore);
        }
        if (data.points) {
          addScore(data.points);
        }
        if (data.ammo) {
          updateAmmo(data.ammo);
        }
        if (data.duration && (data.speedMultiplier || data.damageMultiplier || data.accuracyBonus)) {
          // Activate powerup
          const powerupType = data.speedMultiplier ? 'speed' :
                             data.damageMultiplier ? 'damage' : 'accuracy';
          activatePowerup(powerupType, data.duration);
        }
        if (data.permanent && data.upgradeType) {
          unlockUpgrade(data.upgradeType);
        }
        if (data.type === 'key_item') {
          addToInventory('keyItems', data);
        }
      });

      // Start game loop
      const gameLoop = () => {
        if (engineRef.current && itemSystemRef.current) {
          const deltaTime = engineRef.current.deltaTime;
          const totalTime = engineRef.current.totalTime;

          engineRef.current.update();

          // Update projectile system
          if (projectileSystemRef.current) {
            projectileSystemRef.current.update(deltaTime);
          }

          itemSystemRef.current.update(deltaTime, totalTime);
          engineRef.current.render();
        }
        animationFrameRef.current = requestAnimationFrame(gameLoop);
      };
      gameLoop();

      setIsInitialized(true);
      
    } catch (error) {
      console.error('Failed to initialize game engine:', error);
      setIsInitialized(true); // Continue even if initialization fails
    }
  };

  // Call the async initialization function
  initializeGame();

  return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (itemSystemRef.current && typeof itemSystemRef.current.clearAllItems === 'function') {
        itemSystemRef.current.clearAllItems();
      }
      if (projectileSystemRef.current && typeof projectileSystemRef.current.cleanup === 'function') {
        projectileSystemRef.current.cleanup();
      }
      if (engineRef.current && typeof engineRef.current.cleanup === 'function') {
        engineRef.current.cleanup();
      }
    };
  }, []);

  // Handle mouse movement for aiming
  const handleMouseMove = (event) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    mouseRef.current = { x, y };
    
    // Update crosshair position
    const crosshair = document.querySelector('.crosshair');
    if (crosshair) {
      crosshair.style.left = `${event.clientX - rect.left}px`;
      crosshair.style.top = `${event.clientY - rect.top}px`;
    }
  };

  // Handle mouse click - combat is handled by UnifiedCombatSystem
  const handleMouseClick = (event) => {
    // Combat handled by UnifiedCombatSystem component
  };

  // Handle keyboard input
  const handleKeyDown = (event) => {
    const { code } = event;

    // Weapon switching and controls handled by WeaponController component
    switch (code) {
      case 'Escape':
        setGameState(state.gameState === 'paused' ? 'playing' : 'paused');
        break;
      case 'Tab':
        event.preventDefault();
        setShowInventory(!showInventory);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    // Add event listeners
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('click', handleMouseClick);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('click', handleMouseClick);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [state.gameState, state.player.currentWeapon]);

  // Update engine settings when settings change
  useEffect(() => {
    if (engineRef.current && settings.graphics) {
      const renderer = engineRef.current.getRenderer();
      if (renderer) {
        // Apply graphics settings
        renderer.shadowMap.enabled = settings.graphics.shadows;
        renderer.setPixelRatio(
          settings.graphics.quality === 'high' ? window.devicePixelRatio :
          settings.graphics.quality === 'medium' ? Math.min(window.devicePixelRatio, 2) :
          1
        );
      }
    }
  }, [settings.graphics]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-none"
        style={{ display: 'block' }}
      />
      
      {/* Crosshair */}
      <div className="crosshair">
        <div className="absolute w-1 h-8 bg-red-500 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-8 h-1 bg-red-500 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-3 h-3 border-2 border-red-500 rounded-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* UNIFIED SYSTEM - Single-state architecture */}
        <>
          {/* Sound Manager - Global sound effect handler */}
          <SoundManager />

          {/* Projectile System Bridge - Make projectile system available globally */}
          <ProjectileSystemBridge projectileSystem={projectileSystemRef.current} />
          
          {useMultiRoom ? (
            /* MULTI-ROOM SYSTEM - Level progression through multiple rooms */
            <>
              {/* Level Manager - Controls multi-room progression */}
              <LevelManager
                levelNumber={state.currentLevel || 1}
                gameEngine={engineRef.current}
                onRoomChange={(roomIndex) => setCurrentRoom(roomIndex)}
                onLevelComplete={(nextLevel) => {
                  if (nextLevel <= 12) {
                    // Auto-progress to next level (continuous campaign)
                    if (startLevel) {
                      startLevel(nextLevel);
                    } else {
                      console.error('startLevel not available, falling back to setGameState');
                      setGameState('level_complete');
                    }
                  } else {
                    // All 12 levels complete - show victory screen
                    setGameState('level_complete');
                  }
                }}
              />

              {/* Unified Combat System - Single handler for all shooting */}
              <UnifiedCombatSystem
                gameEngine={engineRef.current}
              />

              {/* Weapon Controller - Weapon switching and UI display */}
              <WeaponController
                gameEngine={engineRef.current}
              />

              {/* Weapon Effects - Muzzle flash and weapon-specific effects */}
              <WeaponEffects
                gameEngine={engineRef.current}
              />

              {/* Visual Feedback System - Particle effects and visual feedback */}
              <VisualFeedbackSystem
                gameEngine={engineRef.current}
              />

              {/* Interactive Puzzles - Dynamically rendered based on level config */}
              {(() => {
                const puzzleConfig = getPuzzleForLevel(state.currentLevel);

                if (puzzleConfig && puzzleConfig.room === currentRoom) {
                  return (
                    <InteractivePuzzle
                      key={`puzzle_${state.currentLevel}_${currentRoom}`}
                      gameEngine={engineRef.current}
                      type={puzzleConfig.type}
                      timeLimit={puzzleConfig.timeLimit}
                      onComplete={(data) => {
                        const bonusPoints = Math.floor(data.bonusPoints * puzzleConfig.bonusMultiplier);
                        addScore(bonusPoints);
                      }}
                      onFail={() => {
                      }}
                    />
                  );
                }
                return null;
              })()}

              {/* Weapon Pickups - Render weapon pickups for current room */}
              {(() => {
                const levelRooms = getLevelRooms(state.currentLevel || 1);
                const roomConfig = levelRooms[currentRoom];

                if (roomConfig && roomConfig.weaponPickups) {
                  const progressionSystem = getProgressionSystem();

                  // Filter out already-collected weapons to prevent duplicate renders
                  const uncollectedPickups = roomConfig.weaponPickups.filter(pickup =>
                    !progressionSystem.isWeaponUnlocked(pickup.weaponType)
                  );

                  return uncollectedPickups.map((pickup, index) => (
                    <WeaponPickup
                      key={`weapon_${pickup.weaponType}_${currentRoom}_${index}`}
                      gameEngine={engineRef.current}
                      weaponType={pickup.weaponType}
                      position={pickup.position}
                      onCollected={(weaponType) => {
                      }}
                    />
                  ));
                }
                return null;
              })()}

              {/* Unified Movement Controller - Movement based on unified enemy state */}
              <UnifiedMovementController />
            </>
          ) : (
            /* SINGLE-ROOM SYSTEM - Original unified system */
            <>
              {/* Unified Room Manager - Single source of truth for enemy state */}
              <UnifiedRoomManager
                gameEngine={engineRef.current}
                onRoomComplete={(result) => {
                  if (result === 'cleared') {
                    setGameState('level_complete');
                  }
                }}
              />

              {/* Unified Combat System - Single handler for all shooting */}
              <UnifiedCombatSystem
                gameEngine={engineRef.current}
              />

              {/* Weapon Controller - Weapon switching and UI display */}
              <WeaponController
                gameEngine={engineRef.current}
              />

              {/* Visual Feedback System - Particle effects and visual feedback */}
              <VisualFeedbackSystem
                gameEngine={engineRef.current}
              />

              {/* Unified Movement Controller - Movement based on unified enemy state */}
              <UnifiedMovementController />

              {/* Puzzle Manager - Time-sensitive interactive puzzles */}
              <PuzzleManager
                gameEngine={engineRef.current}
                levelNumber={state.currentLevel || 1}
                roomIndex={currentRoom}
                onPuzzleComplete={(result) => {
                  if (result.success && result.bonusPoints > 0) {
                    addScore(result.bonusPoints);
                  }
                }}
              />
            </>
          )}
        </>

      {/* Loading overlay */}
      {!isInitialized && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4 mx-auto"></div>
            <p className="text-xl">Initializing Game...</p>
          </div>
        </div>
      )}
      
      {/* Damage Indicator - Shows visual feedback when player takes damage */}
      <DamageIndicator />

      {/* Game Over Screen - Shows when player dies */}
      <GameOverScreen />

      {/* Inventory - Toggle with Tab key */}
      <Inventory isOpen={showInventory} onClose={() => setShowInventory(false)} />

      {/* Enemy Attack Warning Indicators */}
      <EnemyWarningIndicator />

      {/* Mobile Touch Controls */}
      <MobileControls
        onShoot={(x, y) => {
          // Handle mobile shoot - trigger click event on canvas
          if (canvasRef.current) {
            const event = new MouseEvent('click', {
              clientX: x,
              clientY: y,
              bubbles: true
            });
            canvasRef.current.dispatchEvent(event);
          }
        }}
        onWeaponSwitch={(delta) => {
          // Handle weapon switch
          const weapons = state.player.weapons;
          const currentIndex = state.player.currentWeapon;
          let newIndex = (currentIndex + delta) % weapons.length;
          if (newIndex < 0) newIndex = weapons.length - 1;
          switchWeapon(newIndex);
        }}
      />

    </div>
  );
}