import React from 'react';

export function TerrainModifier({ puzzle, onInteraction }) {
  if (!puzzle || puzzle.type !== 'terrain_modifier') return null;

  const progress = puzzle.modifiedPositions?.length || 0;
  const maxProgress = puzzle.targetPositions?.length || 0;
  const timeRemaining = puzzle.timeRemaining || 0;

  return (
    <div className="absolute top-20 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg">
      <h3 className="text-lg font-bold text-orange-400 mb-2">Terrain Modifier Puzzle</h3>

      <div className="mb-2">
        <div className="text-sm text-gray-300">
          Targets Hit: {progress} / {maxProgress}
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
          <div
            className="bg-orange-400 h-2 rounded-full transition-all duration-300"
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
        <div>• Shoot all orange target rings</div>
        <div>• Use any weapon to modify terrain</div>
        <div>• Hit center of target for best results</div>
      </div>

      {puzzle.modifiedPositions && puzzle.modifiedPositions.length > 0 && (
        <div className="mt-2 text-sm">
          <div className="text-gray-300">Targets modified:</div>
          <div className="flex space-x-1 mt-1">
            {Array.from({ length: maxProgress }).map((_, index) => (
              <div
                key={index}
                className={`w-4 h-4 rounded-full border-2 ${
                  progress > index
                    ? 'bg-orange-400 border-orange-400'
                    : 'bg-transparent border-gray-500'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TerrainModifier;