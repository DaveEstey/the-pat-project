import React from 'react';

export function SwitchSequence({ puzzle, onInteraction }) {
  if (!puzzle || puzzle.type !== 'switch_sequence') return null;

  const progress = puzzle.currentSequence?.length || 0;
  const maxProgress = puzzle.targetSequence?.length || 0;
  const timeRemaining = puzzle.timeRemaining || 0;

  return (
    <div className="absolute top-20 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg">
      <h3 className="text-lg font-bold text-yellow-400 mb-2">Switch Sequence Puzzle</h3>

      <div className="mb-2">
        <div className="text-sm text-gray-300">
          Progress: {progress} / {maxProgress}
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
          <div
            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${maxProgress > 0 ? (progress / maxProgress) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="mb-2">
        <div className="text-sm text-gray-300">
          Time: {Math.ceil(timeRemaining / 1000)}s
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              timeRemaining < 5000 ? 'bg-red-500' :
              timeRemaining < 10000 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${(timeRemaining / (puzzle.timeLimit || 30000)) * 100}%` }}
          />
        </div>
      </div>

      <div className="text-xs text-gray-400">
        <div>• Shoot switches in the correct sequence</div>
        <div>• Numbers are displayed above each switch</div>
        <div>• Wrong sequence resets progress</div>
      </div>

      {puzzle.currentSequence && puzzle.currentSequence.length > 0 && (
        <div className="mt-2 text-sm">
          <div className="text-gray-300">Current sequence:</div>
          <div className="text-yellow-400 font-mono">
            [{puzzle.currentSequence.join(', ')}]
          </div>
        </div>
      )}
    </div>
  );
}

export default SwitchSequence;