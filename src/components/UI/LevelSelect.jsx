import React, { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext.jsx';
import { getProgressionSystem } from '../../systems/ProgressionSystem.js';

const LevelSelect = () => {
  const context = useGame();
  const [progressionSummary, setProgressionSummary] = useState(null);

  // Add error checking
  if (!context) {
    console.error('LevelSelect: GameContext not found');
    return <div className="text-white">Loading levels...</div>;
  }

  const { state, selectLevel, startLevel, goToMenu } = context;

  // Load progression data
  useEffect(() => {
    const progressionSystem = getProgressionSystem();
    const summary = progressionSystem.getProgressionSummary();
    setProgressionSummary(summary);
  }, []);

  const levels = [
    { id: 1, name: 'Urban Assault', theme: 'urban', description: 'City streets under siege' },
    { id: 2, name: 'Industrial Complex', theme: 'urban', description: 'Factory floor combat' },
    { id: 3, name: 'Underground Fortress', theme: 'urban', description: 'Final showdown' },
    { id: 4, name: 'Jungle Hunt', theme: 'jungle', description: 'Dense vegetation' },
    { id: 5, name: 'Space Station Alpha', theme: 'space', description: 'Zero gravity' },
    { id: 6, name: 'Haunted Manor', theme: 'haunted', description: 'Supernatural threats' },
    { id: 7, name: 'Western Showdown', theme: 'western', description: 'Desert gunfight' },
    { id: 8, name: 'Arctic Base', theme: 'arctic', description: 'Frozen fortress' },
    { id: 9, name: 'Volcanic Caverns', theme: 'volcanic', description: 'Lava flows' },
    { id: 10, name: 'Underwater Station', theme: 'underwater', description: 'Deep sea' },
    { id: 11, name: 'Sky Fortress', theme: 'sky', description: 'Airborne combat' },
    { id: 12, name: 'Final Stand', theme: 'mixed', description: 'Ultimate battle' }
  ];

  const getThemeColor = (theme) => {
    switch (theme) {
      case 'urban': return 'from-gray-600 to-gray-800';
      case 'jungle': return 'from-green-600 to-green-800';
      case 'space': return 'from-purple-600 to-blue-800';
      case 'haunted': return 'from-purple-800 to-black';
      case 'western': return 'from-orange-600 to-red-800';
      case 'arctic': return 'from-cyan-600 to-blue-800';
      case 'volcanic': return 'from-red-600 to-orange-800';
      case 'underwater': return 'from-blue-600 to-teal-800';
      case 'sky': return 'from-blue-400 to-indigo-600';
      case 'mixed': return 'from-yellow-600 to-red-600';
      default: return 'from-gray-600 to-gray-800';
    }
  };

  const isLevelUnlocked = (levelId) => {
    if (!progressionSummary) return levelId === 1; // Default: only level 1 unlocked

    const progressionSystem = getProgressionSystem();
    return progressionSystem.isLevelUnlocked(levelId);
  };

  const isLevelCompleted = (levelId) => {
    if (!progressionSummary) return false;

    const progressionSystem = getProgressionSystem();
    return progressionSystem.isLevelCompleted(levelId);
  };

  const handleLevelSelect = (levelId) => {
    if (!isLevelUnlocked(levelId)) {
      return;
    }

    if (typeof startLevel === 'function') {
      startLevel(levelId);
    } else {
      console.error('startLevel function not available');
    }
  };

  const handleBackToMenu = () => {
    if (typeof goToMenu === 'function') {
      goToMenu();
    } else {
      console.error('goToMenu function not available');
    }
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Level Select</h1>
            {progressionSummary && (
              <p className="text-gray-400 mt-2">
                Levels Completed: {progressionSummary.levels.count} / {progressionSummary.levels.total}
              </p>
            )}
          </div>
          <button
            onClick={handleBackToMenu}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded transition-colors"
          >
            Back
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {levels.map((level) => {
            const unlocked = isLevelUnlocked(level.id);
            const completed = isLevelCompleted(level.id);

            return (
              <div
                key={level.id}
                onClick={() => handleLevelSelect(level.id)}
                className={`
                  relative p-6 rounded-lg cursor-pointer transition-all duration-300 transform
                  ${unlocked
                    ? `bg-gradient-to-br ${getThemeColor(level.theme)} hover:scale-105 hover:shadow-2xl`
                    : 'bg-gray-700 opacity-50 cursor-not-allowed'
                  }
                  ${completed ? 'border-2 border-green-500' : ''}
                `}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">
                    Level {level.id}
                  </div>
                  <div className="text-lg text-white mb-2">
                    {level.name}
                  </div>
                  <div className="text-xs text-gray-300 mb-2">
                    {level.description}
                  </div>
                  <div className="text-xs text-gray-400 capitalize">
                    {level.theme} Theme
                  </div>

                  {/* Completion badge */}
                  {completed && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                      ✓ COMPLETED
                    </div>
                  )}

                  {/* Current level indicator */}
                  {level.id === state.currentLevel && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                      CURRENT
                    </div>
                  )}

                  {/* Locked overlay */}
                  {!unlocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 rounded-lg">
                      <div className="text-white font-bold text-xl mb-2">🔒 LOCKED</div>
                      <div className="text-gray-300 text-sm">
                        Complete Level {level.id - 1}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progression Summary */}
        {progressionSummary && (
          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Your Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 rounded p-4">
                <div className="text-gray-400 text-sm">Levels Completed</div>
                <div className="text-white text-3xl font-bold">
                  {progressionSummary.levels.count} / {progressionSummary.levels.total}
                </div>
              </div>
              <div className="bg-gray-700 rounded p-4">
                <div className="text-gray-400 text-sm">Weapons Unlocked</div>
                <div className="text-white text-3xl font-bold">
                  {progressionSummary.weapons.unlocked.length} / {progressionSummary.weapons.total}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {progressionSummary.weapons.unlocked.join(', ')}
                </div>
              </div>
              <div className="bg-gray-700 rounded p-4">
                <div className="text-gray-400 text-sm">Secret Rooms Found</div>
                <div className="text-white text-3xl font-bold">
                  {progressionSummary.secretRooms.count}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Complete levels to unlock new areas and discover weapons
          </p>
        </div>
      </div>
    </div>
  );
};

export default LevelSelect;
