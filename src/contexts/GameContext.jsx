import React, { createContext, useContext, useReducer, useMemo, useEffect } from 'react';
import { GameStates, PlayerStats } from '../types/game.js';
import { getProgressionSystem } from '../systems/ProgressionSystem.js';
import { getSaveSystem } from '../systems/MultiSlotSaveSystem.js';

const GameContext = createContext();

const initialState = {
  gameState: GameStates.MENU,
  currentLevel: 1,
  player: {
    ...PlayerStats,
    position: { x: 0, y: 0, z: 0 },
    currentWeapon: 0,
    weapons: [
      { type: 'pistol', name: 'Pistol', reloading: false },
      { type: 'shotgun', name: 'Shotgun', reloading: false },
      { type: 'rapidfire', name: 'Rapid Fire', reloading: false },
      { type: 'grappling', name: 'Grappling Arm', reloading: false }
    ],
    ammo: {
      pistol: Infinity,
      shotgun: 50,
      rapidfire: 200,
      grappling: Infinity,
      bomb: 3
    },
    inventory: {
      items: [],
      keyItems: [],
      powerups: [],
      upgrades: []
    },
    activePowerups: {
      speed: null,
      damage: null,
      accuracy: null
    },
    activeDebuffs: {
      speed: null,     // Speed reduction debuff (fast_debuffer)
      damage: null,    // Damage reduction (future)
      accuracy: null   // Accuracy reduction (future)
    },
    permanentUpgrades: {
      enhanced_grip: false,
      reinforced_armor: false,
      eagle_eye: false
    }
  },
  level: {
    enemies: [],
    items: [],
    puzzles: [],
    progress: 0,
    timeRemaining: 0
  },
  rooms: {
    currentRoom: null,
    visitedRooms: [],
    roomHistory: [],
    completedRooms: [],
    unlockedSecrets: []
  },
  levelProgress: 0,
  ui: {
    showInventory: false,
    showPause: false,
    showSettings: false,
    itemNotification: null,
    showLevelResults: false,
    completedLevel: null
  },
  settings: {
    masterVolume: 0.7,
    sfxVolume: 0.8,
    musicVolume: 0.6,
    sensitivity: 1.0,
    difficulty: 'normal'
  }
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_GAME_STATE':
      return { ...state, gameState: action.payload };
      
    case 'UPDATE_PLAYER_STATS':
      return {
        ...state,
        player: { ...state.player, ...action.payload }
      };
      
    case 'UPDATE_PLAYER_POSITION':
      return {
        ...state,
        player: {
          ...state.player,
          position: { ...state.player.position, ...action.payload }
        }
      };
      
    case 'CHANGE_WEAPON':
      return {
        ...state,
        player: { ...state.player, currentWeapon: action.payload }
      };
      
    case 'SWITCH_WEAPON':
      return {
        ...state,
        player: { ...state.player, currentWeapon: action.payload.weaponIndex }
      };
      
    case 'SELECT_LEVEL':
      return {
        ...state,
        selectedLevel: action.payload,
        currentLevel: action.payload
      };
      
    case 'GO_TO_MENU':
      return {
        ...state,
        gameState: GameStates.MENU
      };
      
    case 'GO_TO_LEVEL_SELECT':
      return {
        ...state,
        gameState: GameStates.LEVEL_SELECT
      };
      
    case 'START_GAME':
      return {
        ...state,
        gameState: GameStates.PLAYING,
        currentLevel: 1
      };
      
    case 'ADD_TO_INVENTORY':
      const { type, item } = action.payload;
      return {
        ...state,
        player: {
          ...state.player,
          inventory: {
            ...state.player.inventory,
            [type]: [...state.player.inventory[type], item]
          }
        }
      };

    case 'UPDATE_AMMO':
      return {
        ...state,
        player: {
          ...state.player,
          ammo: { ...state.player.ammo, ...action.payload }
        }
      };

    case 'ACTIVATE_POWERUP':
      const { powerupType, duration } = action.payload;
      return {
        ...state,
        player: {
          ...state.player,
          activePowerups: {
            ...state.player.activePowerups,
            [powerupType]: Date.now() + duration
          }
        }
      };

    case 'DEACTIVATE_POWERUP':
      return {
        ...state,
        player: {
          ...state.player,
          activePowerups: {
            ...state.player.activePowerups,
            [action.payload]: null
          }
        }
      };

    case 'APPLY_DEBUFF':
      const { debuffType, debuffDuration } = action.payload;
      return {
        ...state,
        player: {
          ...state.player,
          activeDebuffs: {
            ...state.player.activeDebuffs,
            [debuffType]: Date.now() + debuffDuration
          }
        }
      };

    case 'REMOVE_DEBUFF':
      return {
        ...state,
        player: {
          ...state.player,
          activeDebuffs: {
            ...state.player.activeDebuffs,
            [action.payload]: null
          }
        }
      };

    case 'UNLOCK_UPGRADE':
      return {
        ...state,
        player: {
          ...state.player,
          permanentUpgrades: {
            ...state.player.permanentUpgrades,
            [action.payload]: true
          }
        }
      };

    case 'LOAD_GAME':
      const loadedData = action.payload;
      return {
        ...state,
        currentLevel: loadedData.currentLevel,
        player: {
          ...state.player,
          ...loadedData.player
        },
        rooms: {
          ...state.rooms,
          ...loadedData.rooms
        }
      };

    case 'SET_LEVEL':
      return { ...state, currentLevel: action.payload };
      
    case 'UPDATE_LEVEL_STATE':
      return {
        ...state,
        level: { ...state.level, ...action.payload }
      };
      
    case 'TOGGLE_UI':
      return {
        ...state,
        ui: { ...state.ui, [action.payload]: !state.ui[action.payload] }
      };
      
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
      
    case 'UPDATE_HEALTH':
      const newHealth = Math.max(0, Math.min(state.player.maxHealth, state.player.health + action.payload));

      return {
        ...state,
        player: { ...state.player, health: newHealth }
      };
      
    case 'ADD_SCORE':
      const newScore = state.player.score + action.payload;

      return {
        ...state,
        player: { ...state.player, score: newScore }
      };

    case 'RECORD_SHOT':
      const newShotsFired = state.player.shotsFired + 1;
      const newShotsHit = state.player.shotsHit + (action.payload.hit ? 1 : 0);
      const newAccuracy = newShotsFired > 0 ? Math.round((newShotsHit / newShotsFired) * 100) : 0;
      
      return {
        ...state,
        player: {
          ...state.player,
          shotsFired: newShotsFired,
          shotsHit: newShotsHit,
          accuracy: newAccuracy
        }
      };
      
    case 'UPDATE_ROOM_STATE':
      return {
        ...state,
        rooms: { ...state.rooms, ...action.payload }
      };
      
    case 'VISIT_ROOM':
      return {
        ...state,
        rooms: {
          ...state.rooms,
          currentRoom: action.payload.roomId,
          visitedRooms: [...new Set([...state.rooms.visitedRooms, action.payload.roomId])],
          roomHistory: [...state.rooms.roomHistory, action.payload.roomId]
        }
      };
      
    case 'COMPLETE_ROOM':
      return {
        ...state,
        rooms: {
          ...state.rooms,
          completedRooms: [...new Set([...state.rooms.completedRooms, action.payload.roomId])]
        }
      };
      
    case 'UNLOCK_SECRET':
      return {
        ...state,
        rooms: {
          ...state.rooms,
          unlockedSecrets: [...new Set([...state.rooms.unlockedSecrets, action.payload.secretId])]
        }
      };
      
    case 'RESET_GAME':
      return { ...initialState, settings: state.settings };
      
    case 'RESTART_LEVEL':
      return {
        ...state,
        player: {
          ...state.player,
          health: state.player.maxHealth, // Restore full health
          // Keep score, accuracy, shots, lives, etc.
        },
        // Reset level-specific state but keep progress
        level: {
          enemies: [],
          items: [],
          puzzles: [],
          progress: 0,
          timeRemaining: 0
        },
        rooms: {
          currentRoom: null,
          visitedRooms: [],
          roomHistory: [],
          completedRooms: [],
          unlockedSecrets: []
        }
      };

    case 'SHOW_LEVEL_RESULTS':
      return {
        ...state,
        ui: {
          ...state.ui,
          showLevelResults: true,
          completedLevel: action.payload.level
        }
      };

    case 'HIDE_LEVEL_RESULTS':
      return {
        ...state,
        ui: {
          ...state.ui,
          showLevelResults: false,
          completedLevel: null
        }
      };

    case 'ADVANCE_TO_NEXT_LEVEL':
      const nextLevel = state.currentLevel + 1;
      if (nextLevel > 12) {
        // Game completed - return to menu
        return {
          ...state,
          gameState: GameStates.MENU,
          ui: {
            ...state.ui,
            showLevelResults: false
          }
        };
      }

      return {
        ...state,
        currentLevel: nextLevel,
        gameState: GameStates.PLAYING,
        ui: {
          ...state.ui,
          showLevelResults: false
        },
        level: {
          enemies: [],
          items: [],
          puzzles: [],
          progress: 0,
          timeRemaining: 0
        },
        rooms: {
          currentRoom: null,
          visitedRooms: [],
          roomHistory: [],
          completedRooms: [],
          unlockedSecrets: []
        }
      };

    case 'COMPLETE_LEVEL':
      // Show results screen for current level
      return {
        ...state,
        gameState: GameStates.LEVEL_COMPLETE,
        ui: {
          ...state.ui,
          showLevelResults: true,
          completedLevel: state.currentLevel
        }
      };

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const actions = useMemo(() => ({
    setGameState: (state) => dispatch({ type: 'SET_GAME_STATE', payload: state }),
    updatePlayerStats: (stats) => dispatch({ type: 'UPDATE_PLAYER_STATS', payload: stats }),
    updatePlayerPosition: (position) => dispatch({ type: 'UPDATE_PLAYER_POSITION', payload: position }),
    changeWeapon: (weapon) => dispatch({ type: 'CHANGE_WEAPON', payload: weapon }),
    switchWeapon: (weaponIndex) => dispatch({ 
      type: 'SWITCH_WEAPON', 
      payload: { weaponIndex } 
    }),
    selectLevel: (levelNumber) => dispatch({ 
      type: 'SELECT_LEVEL', 
      payload: levelNumber 
    }),
    startLevel: (levelNumber) => {
      // If starting from level 1, reset progression (new game)
      if (levelNumber === 1) {
        const progressionSystem = getProgressionSystem();
        progressionSystem.resetProgression();
      }

      // Reset player health when starting any level
      dispatch({ type: 'RESTART_LEVEL' });
      dispatch({ type: 'SET_LEVEL', payload: levelNumber });
      dispatch({ type: 'SET_GAME_STATE', payload: GameStates.PLAYING });
    },
    goToMenu: () => dispatch({ 
      type: 'GO_TO_MENU'
    }),
    goToLevelSelect: () => dispatch({ 
      type: 'GO_TO_LEVEL_SELECT'
    }),
    addToInventory: (type, item) => dispatch({ type: 'ADD_TO_INVENTORY', payload: { type, item } }),
    updateAmmo: (ammo) => dispatch({ type: 'UPDATE_AMMO', payload: ammo }),
    activatePowerup: (powerupType, duration) => dispatch({
      type: 'ACTIVATE_POWERUP',
      payload: { powerupType, duration }
    }),
    deactivatePowerup: (powerupType) => dispatch({ type: 'DEACTIVATE_POWERUP', payload: powerupType }),
    applyDebuff: (debuffType, debuffDuration) => dispatch({
      type: 'APPLY_DEBUFF',
      payload: { debuffType, debuffDuration }
    }),
    removeDebuff: (debuffType) => dispatch({ type: 'REMOVE_DEBUFF', payload: debuffType }),
    unlockUpgrade: (upgradeType) => dispatch({ type: 'UNLOCK_UPGRADE', payload: upgradeType }),
    setLevel: (level) => dispatch({ type: 'SET_LEVEL', payload: level }),
    updateLevelState: (levelState) => dispatch({ type: 'UPDATE_LEVEL_STATE', payload: levelState }),
    toggleUI: (uiElement) => dispatch({ type: 'TOGGLE_UI', payload: uiElement }),
    updateSettings: (settings) => dispatch({ type: 'UPDATE_SETTINGS', payload: settings }),
    updatePlayerHealth: (healthChange) => dispatch({ type: 'UPDATE_HEALTH', payload: healthChange }),
    damagePlayer: (damage) => {
      // Calculate what the new health will be
      const currentHealth = state.player.health;
      const newHealth = Math.max(0, currentHealth - damage);

      // Apply the damage
      dispatch({ type: 'UPDATE_HEALTH', payload: -damage });

      // Check for game over based on calculated new health
      if (newHealth <= 0) {
        // Use setTimeout with minimal delay to allow health update to complete
        setTimeout(() => {
          dispatch({ type: 'SET_GAME_STATE', payload: GameStates.GAME_OVER });
        }, 50);
      }
    },
    addScore: (points) => dispatch({ type: 'ADD_SCORE', payload: points }),
    recordShot: (hit = false) => dispatch({ type: 'RECORD_SHOT', payload: { hit } }),
    updateRoomState: (roomState) => dispatch({ type: 'UPDATE_ROOM_STATE', payload: roomState }),
    visitRoom: (roomId) => dispatch({ type: 'VISIT_ROOM', payload: { roomId } }),
    completeRoom: (roomId) => dispatch({ type: 'COMPLETE_ROOM', payload: { roomId } }),
    unlockSecret: (secretId) => dispatch({ type: 'UNLOCK_SECRET', payload: { secretId } }),
    resetGame: () => dispatch({ type: 'RESET_GAME' }),
    restartLevel: () => dispatch({ type: 'RESTART_LEVEL' }),
    completeLevel: () => dispatch({ type: 'COMPLETE_LEVEL' }),
    advanceToNextLevel: () => dispatch({ type: 'ADVANCE_TO_NEXT_LEVEL' }),
    showLevelResults: (level) => dispatch({ type: 'SHOW_LEVEL_RESULTS', payload: { level } }),
    hideLevelResults: () => dispatch({ type: 'HIDE_LEVEL_RESULTS' }),
    saveGame: (slotName = 'autosave') => {
      const saveSystem = getSaveSystem();
      return saveSystem.saveGame(state, slotName);
    },
    loadGame: (slotName = 'autosave') => {
      const saveSystem = getSaveSystem();
      const loadedData = saveSystem.loadGame(slotName);
      if (loadedData) {
        dispatch({ type: 'LOAD_GAME', payload: loadedData });
        return true;
      }
      return false;
    }
  }), [state]); // Recreate when state changes for save functionality

  const contextValue = useMemo(() => ({ state, ...actions }), [state, actions]);

  // Auto-save on level completion
  useEffect(() => {
    if (state.gameState === GameStates.LEVEL_COMPLETE) {
      const saveSystem = getSaveSystem();
      saveSystem.saveGame(state, 'autosave');
    }
  }, [state.gameState]);
  
  // Expose game context globally for enemy AI system
  React.useEffect(() => {
    window.gameContext = contextValue;
    
    return () => {
      delete window.gameContext;
    };
  }, [contextValue]);

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}