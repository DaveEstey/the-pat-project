import React, { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext.jsx';
import { GameStates } from '../../types/game.js';
import { getSaveSystem } from '../../systems/MultiSlotSaveSystem.js';

const MainMenu = () => {
  const context = useGame();
  const [hasSave, setHasSave] = useState(false);

  // Add error checking
  if (!context) {
    console.error('MainMenu: GameContext not found');
    return <div className="text-white">Loading...</div>;
  }

  const { goToLevelSelect, startLevel, setGameState, loadGame } = context;

  // Check for autosave on mount
  useEffect(() => {
    try {
      const saveSystem = getSaveSystem();
      if (saveSystem) {
        setHasSave(saveSystem.hasSave('autosave'));
      }
    } catch (error) {
      console.warn('[MainMenu] Save system not available:', error);
      setHasSave(false);
    }
  }, []);

  const handleStartGame = () => {
    if (typeof startLevel === 'function') {
      startLevel(1); // Start directly with level 1, skip level select
    } else {
      console.error('startLevel function not available');
    }
  };

  const handleLevelSelect = () => {
    if (typeof goToLevelSelect === 'function') {
      goToLevelSelect();
    } else if (typeof setGameState === 'function') {
      setGameState(GameStates.LEVEL_SELECT);
    } else {
      console.error('level select functions not available');
    }
  };

  const handleSettings = () => {
    if (typeof setGameState === 'function') {
      setGameState(GameStates.SETTINGS);
    } else {
      console.error('setGameState function not available');
    }
  };

  const handleContinueGame = () => {
    if (typeof loadGame === 'function') {
      const success = loadGame('autosave');
      if (success) {
        setGameState(GameStates.PLAYING);
      } else {
        console.error('Failed to load save game');
      }
    } else {
      console.error('loadGame function not available');
    }
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-purple-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-8 drop-shadow-lg">
          ON-RAILS SHOOTER
        </h1>
        <div className="space-y-4">
          {hasSave && (
            <button
              onClick={handleContinueGame}
              className="block w-64 mx-auto bg-yellow-600 hover:bg-yellow-700 text-white text-xl font-bold py-4 px-8 rounded-lg transition-colors duration-200 transform hover:scale-105"
            >
              Continue Game
            </button>
          )}
          <button
            onClick={handleStartGame}
            className="block w-64 mx-auto bg-green-600 hover:bg-green-700 text-white text-xl font-bold py-4 px-8 rounded-lg transition-colors duration-200 transform hover:scale-105"
          >
            New Game
          </button>
          <button
            onClick={handleLevelSelect}
            className="block w-64 mx-auto bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-4 px-8 rounded-lg transition-colors duration-200 transform hover:scale-105"
          >
            Level Select
          </button>
          <button
            onClick={handleSettings}
            className="block w-64 mx-auto bg-purple-600 hover:bg-purple-700 text-white text-xl font-bold py-4 px-8 rounded-lg transition-colors duration-200 transform hover:scale-105"
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;