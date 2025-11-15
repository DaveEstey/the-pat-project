/**
 * Path Choice UI Component
 * Displays branching path options and selection interface
 */

import React, { useState, useEffect } from 'react';

export function PathChoiceUI() {
  const [choiceActive, setChoiceActive] = useState(false);
  const [paths, setPaths] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timeLimit, setTimeLimit] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handlePathChoiceActivated = (event) => {
      const { paths: pathOptions, timeLimit: limit } = event.detail;
      setPaths(pathOptions);
      setTimeLimit(limit);
      setTimeRemaining(limit);
      setChoiceActive(true);
      setSelectedIndex(0);
    };

    const handlePathSelected = () => {
      setChoiceActive(false);
    };

    window.addEventListener('pathChoiceActivated', handlePathChoiceActivated);
    window.addEventListener('pathSelected', handlePathSelected);

    return () => {
      window.removeEventListener('pathChoiceActivated', handlePathChoiceActivated);
      window.removeEventListener('pathSelected', handlePathSelected);
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!choiceActive) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [choiceActive]);

  // Keyboard controls
  useEffect(() => {
    if (!choiceActive) return;

    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setSelectedIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setSelectedIndex(prev => Math.min(paths.length - 1, prev + 1));
      } else if (e.key === 'Enter' || e.key === ' ') {
        selectPath(selectedIndex);
      } else if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        if (index < paths.length) {
          selectPath(index);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [choiceActive, paths, selectedIndex]);

  const selectPath = (index) => {
    if (!choiceActive || index < 0 || index >= paths.length) return;

    const selectedPath = paths[index];
    window.dispatchEvent(new CustomEvent('playerPathChoice', {
      detail: { pathType: selectedPath.type }
    }));
  };

  const getTimeColor = () => {
    const percent = timeRemaining / timeLimit;
    if (percent > 0.5) return 'text-green-400';
    if (percent > 0.25) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'text-green-400',
      medium: 'text-yellow-400',
      hard: 'text-orange-400',
      extreme: 'text-red-400',
      nightmare: 'text-purple-400'
    };
    return colors[difficulty] || 'text-white';
  };

  if (!choiceActive) return null;

  const timePercent = (timeRemaining / timeLimit) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 border-4 border-blue-500 rounded-lg p-8 max-w-4xl w-full mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-white mb-2">CHOOSE YOUR PATH</h2>
          <div className="flex items-center justify-center gap-4">
            <div className={`text-2xl font-bold ${getTimeColor()}`}>
              {(timeRemaining / 1000).toFixed(1)}s
            </div>
            <div className="w-64 h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ${
                  timePercent > 50 ? 'bg-green-500' : timePercent > 25 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${timePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Path Options */}
        <div className={`grid ${paths.length === 2 ? 'grid-cols-2' : paths.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-4 mb-6`}>
          {paths.map((path, index) => (
            <div
              key={index}
              className={`
                border-4 rounded-lg p-6 cursor-pointer transition-all
                ${selectedIndex === index
                  ? 'border-yellow-400 bg-yellow-900 bg-opacity-30 scale-105'
                  : 'border-gray-600 bg-gray-800 hover:border-gray-400'
                }
              `}
              onClick={() => {
                setSelectedIndex(index);
                selectPath(index);
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {/* Path Number */}
              <div className="text-center mb-3">
                <span className="inline-block bg-blue-600 text-white font-bold px-3 py-1 rounded-full text-lg">
                  {index + 1}
                </span>
              </div>

              {/* Path Label */}
              <h3 className="text-2xl font-bold text-center text-white mb-2">
                {path.label}
              </h3>

              {/* Difficulty */}
              <div className="text-center mb-3">
                <span className={`font-bold text-sm uppercase ${getDifficultyColor(path.difficulty)}`}>
                  {path.difficulty}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-300 text-center text-sm mb-4">
                {path.description}
              </p>

              {/* Rewards Preview */}
              {path.rewards && (
                <div className="border-t border-gray-600 pt-3 mt-3">
                  <div className="text-xs text-gray-400 space-y-1">
                    {path.rewards.enemyCount && (
                      <div>
                        Enemies: <span className={path.rewards.enemyCount > 0 ? 'text-red-400' : 'text-green-400'}>
                          {path.rewards.enemyCount > 0 ? '+' : ''}{path.rewards.enemyCount}
                        </span>
                      </div>
                    )}
                    {path.rewards.scoreBonus && (
                      <div>
                        Score Bonus: <span className="text-yellow-400">+{path.rewards.scoreBonus}</span>
                      </div>
                    )}
                    {path.rewards.ammoBonus && (
                      <div>
                        Ammo: <span className={path.rewards.ammoBonus > 0 ? 'text-green-400' : 'text-red-400'}>
                          {path.rewards.ammoBonus > 0 ? '+' : ''}{path.rewards.ammoBonus}
                        </span>
                      </div>
                    )}
                    {path.rewards.healthBonus && (
                      <div>
                        Health: <span className="text-green-400">+{path.rewards.healthBonus}</span>
                      </div>
                    )}
                    {path.rewards.secretChance && (
                      <div>
                        Secret Chance: <span className="text-purple-400">
                          {(path.rewards.secretChance * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                    {path.rewards.bossEncounter && (
                      <div className="text-red-400 font-bold">
                        ⚠️ Boss Fight
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Selection Indicator */}
              {selectedIndex === index && (
                <div className="mt-4 text-center">
                  <div className="text-yellow-400 font-bold animate-pulse">
                    ► PRESS ENTER TO SELECT ◄
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Controls Help */}
        <div className="text-center text-gray-400 text-sm">
          <div className="mb-2">
            <span className="font-bold">Controls:</span> Arrow Keys / A-D to navigate • Enter/Space to select • 1-{paths.length} for quick select
          </div>
          <div className="text-xs text-gray-500">
            Auto-select if time runs out
          </div>
        </div>
      </div>
    </div>
  );
}

export default PathChoiceUI;
