/**
 * Puzzle Hint Display Component
 * Shows progressive hints for active puzzles
 */

import React, { useState, useEffect } from 'react';
import { HintLevel } from '../../systems/PuzzleHintSystem.js';

export function PuzzleHintDisplay({ onRequestHint }) {
  const [currentHint, setCurrentHint] = useState(null);
  const [hintLevel, setHintLevel] = useState(HintLevel.NONE);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleHintShown = (event) => {
      const { level, hint } = event.detail;
      setHintLevel(level);
      setCurrentHint(hint);
      setVisible(true);
    };

    const handleHintHidden = () => {
      setVisible(false);
      setCurrentHint(null);
      setHintLevel(HintLevel.NONE);
    };

    window.addEventListener('puzzleHintShown', handleHintShown);
    window.addEventListener('puzzleHintHidden', handleHintHidden);

    return () => {
      window.removeEventListener('puzzleHintShown', handleHintShown);
      window.removeEventListener('puzzleHintHidden', handleHintHidden);
    };
  }, []);

  if (!visible || !currentHint) {
    return null;
  }

  // Determine hint styling based on level
  const getLevelStyle = () => {
    switch (hintLevel) {
      case HintLevel.SUBTLE:
        return {
          border: 'border-blue-400',
          bg: 'bg-blue-900',
          text: 'text-blue-200',
          icon: '💡'
        };
      case HintLevel.MODERATE:
        return {
          border: 'border-yellow-400',
          bg: 'bg-yellow-900',
          text: 'text-yellow-200',
          icon: '💭'
        };
      case HintLevel.OBVIOUS:
        return {
          border: 'border-orange-400',
          bg: 'bg-orange-900',
          text: 'text-orange-200',
          icon: '🎯'
        };
      case HintLevel.SOLUTION:
        return {
          border: 'border-green-400',
          bg: 'bg-green-900',
          text: 'text-green-200',
          icon: '✅'
        };
      default:
        return {
          border: 'border-gray-400',
          bg: 'bg-gray-900',
          text: 'text-gray-200',
          icon: '❓'
        };
    }
  };

  const style = getLevelStyle();

  return (
    <div className="absolute top-32 left-1/2 transform -translate-x-1/2 pointer-events-auto z-50">
      <div className={`${style.bg} ${style.border} border-2 rounded-lg p-4 max-w-md shadow-2xl animate-fade-in`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{style.icon}</span>
            <span className={`${style.text} font-bold text-lg`}>
              {hintLevel === HintLevel.SOLUTION ? 'SOLUTION' : 'HINT'}
            </span>
          </div>

          {/* Hint level indicator */}
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-2 h-2 rounded-full ${
                  level <= hintLevel
                    ? style.border.replace('border-', 'bg-')
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Hint content */}
        <div className={`${style.text} text-sm leading-relaxed`}>
          {currentHint.text}
        </div>

        {/* Directional indicator if present */}
        {currentHint.direction && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xl">➜</span>
            <span className={`${style.text} text-xs uppercase`}>
              {currentHint.direction}
            </span>
          </div>
        )}

        {/* Request next hint button */}
        {hintLevel < HintLevel.SOLUTION && onRequestHint && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <button
              onClick={onRequestHint}
              className={`w-full ${style.bg} hover:opacity-80 ${style.text} text-xs font-bold py-2 px-3 rounded transition-opacity`}
            >
              Need More Help? (Press H)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PuzzleHintDisplay;
