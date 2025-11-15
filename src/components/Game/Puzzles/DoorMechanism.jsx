import React from 'react';

export function DoorMechanism({ puzzle, onInteraction }) {
  if (!puzzle || puzzle.type !== 'door_mechanism') return null;

  const progress = puzzle.collectedKeys || 0;
  const maxProgress = puzzle.requiredKeys || 0;
  const timeRemaining = puzzle.timeRemaining || 0;

  return (
    <div className="absolute top-20 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg">
      <h3 className="text-lg font-bold text-yellow-400 mb-2">Door Mechanism Puzzle</h3>

      <div className="mb-2">
        <div className="text-sm text-gray-300">
          Keys Collected: {progress} / {maxProgress}
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
        <div>• Collect all golden keys by shooting them</div>
        <div>• Keys float and rotate for visibility</div>
        <div>• Door unlocks when all keys collected</div>
      </div>

      <div className="mt-2">
        <div className="text-sm text-gray-300">Key Status:</div>
        <div className="flex space-x-2 mt-1">
          {Array.from({ length: maxProgress }).map((_, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs font-bold ${
                  progress > index
                    ? 'bg-yellow-400 text-black'
                    : 'bg-gray-600 text-gray-300'
                }`}
              >
                🗝️
              </div>
              <div className="text-xs mt-1">
                {progress > index ? 'GOT' : 'FIND'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {progress >= maxProgress && (
        <div className="mt-2 text-sm text-green-400 font-bold">
          🚪 Door Unlocked! Path is clear!
        </div>
      )}
    </div>
  );
}

export default DoorMechanism;