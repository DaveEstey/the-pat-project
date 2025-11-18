import React, { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext.jsx';

/**
 * Level Results Screen - Shows level completion stats and auto-progresses to next level
 */
export function LevelResultsScreen({ levelCompleted, onContinue }) {
  const { state } = useGame();
  const [timeRemaining, setTimeRemaining] = useState(5);

  useEffect(() => {
    // Auto-progress countdown
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onContinue]);

  // Calculate level stats
  const levelScore = state.player.score;
  const accuracy = Math.round(state.player.accuracy);
  const enemiesDefeated = state.level?.enemiesKilled || 0;

  // Determine star rating based on performance
  const getStarRating = () => {
    if (accuracy >= 80) return 3;
    if (accuracy >= 60) return 2;
    return 1;
  };

  const stars = getStarRating();

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50">
      <div className="bg-gray-900 border-4 border-yellow-500 rounded-lg p-8 max-w-2xl w-full mx-4">
        {/* Level Complete Title */}
        <div className="text-center mb-6">
          <div className="text-5xl font-bold text-yellow-400 mb-2 animate-pulse">
            LEVEL {levelCompleted} COMPLETE!
          </div>

          {/* Star Rating */}
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3].map(star => (
              <div
                key={star}
                className={`text-6xl ${star <= stars ? 'text-yellow-400' : 'text-gray-600'}`}
              >
                ★
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Score */}
          <div className="bg-black bg-opacity-50 p-4 rounded-lg">
            <div className="text-gray-400 text-sm mb-1">SCORE</div>
            <div className="text-4xl font-bold text-white">{levelScore.toLocaleString()}</div>
          </div>

          {/* Accuracy */}
          <div className="bg-black bg-opacity-50 p-4 rounded-lg">
            <div className="text-gray-400 text-sm mb-1">ACCURACY</div>
            <div className={`text-4xl font-bold ${
              accuracy >= 80 ? 'text-green-400' :
              accuracy >= 60 ? 'text-yellow-400' :
              'text-orange-400'
            }`}>
              {accuracy}%
            </div>
          </div>

          {/* Enemies Defeated */}
          <div className="bg-black bg-opacity-50 p-4 rounded-lg">
            <div className="text-gray-400 text-sm mb-1">ENEMIES</div>
            <div className="text-4xl font-bold text-red-400">{enemiesDefeated}</div>
          </div>

          {/* Health Remaining */}
          <div className="bg-black bg-opacity-50 p-4 rounded-lg">
            <div className="text-gray-400 text-sm mb-1">HEALTH</div>
            <div className="text-4xl font-bold text-cyan-400">
              {state.player.health}/{state.player.maxHealth}
            </div>
          </div>
        </div>

        {/* Bonus Messages */}
        {accuracy >= 90 && (
          <div className="text-center mb-4">
            <div className="text-xl font-bold text-green-400 animate-pulse">
              🎯 PERFECT ACCURACY BONUS: +1000 points!
            </div>
          </div>
        )}

        {state.player.health === state.player.maxHealth && (
          <div className="text-center mb-4">
            <div className="text-xl font-bold text-cyan-400 animate-pulse">
              💚 NO DAMAGE BONUS: +500 points!
            </div>
          </div>
        )}

        {/* Auto-progress indicator */}
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            {levelCompleted < 12
              ? `Advancing to Level ${levelCompleted + 1} in...`
              : 'Game Complete! Returning to menu in...'
            }
          </div>
          <div className="text-6xl font-bold text-white mb-4">
            {timeRemaining}
          </div>

          <button
            onClick={onContinue}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-8 rounded-lg text-xl transition-colors"
          >
            Continue Now →
          </button>

          <div className="text-sm text-gray-500 mt-2">
            Press SPACE or click to continue immediately
          </div>
        </div>
      </div>
    </div>
  );
}

export default LevelResultsScreen;
