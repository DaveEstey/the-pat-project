import React from 'react';

export function PathSelector({ puzzle, onInteraction }) {
  if (!puzzle || puzzle.type !== 'path_selector') return null;

  const selectedPath = puzzle.selectedPath;
  const paths = puzzle.paths || [];
  const timeRemaining = puzzle.timeRemaining || 0;

  return (
    <div className="absolute top-20 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg">
      <h3 className="text-lg font-bold text-blue-400 mb-2">Path Selector Puzzle</h3>

      <div className="mb-2">
        <div className="text-sm text-gray-300">
          Selection: {selectedPath ? selectedPath : 'None'}
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
          <div
            className="bg-blue-400 h-2 rounded-full transition-all duration-300"
            style={{ width: selectedPath ? '100%' : '0%' }}
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
        <div>• Shoot an arrow to choose your path</div>
        <div>• Different paths lead to different areas</div>
        <div>• Choose wisely - some paths are better</div>
      </div>

      <div className="mt-2">
        <div className="text-sm text-gray-300">Available Paths:</div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {paths.map((path, index) => (
            <div
              key={path.id}
              className={`text-center p-2 rounded border-2 ${
                selectedPath === path.id
                  ? path.correct
                    ? 'border-green-400 bg-green-900 text-green-200'
                    : 'border-red-400 bg-red-900 text-red-200'
                  : 'border-gray-600 bg-gray-800 text-gray-300'
              }`}
            >
              <div className="text-xl mb-1">
                {path.id === 'left' ? '⬅️' :
                 path.id === 'center' ? '⬆️' :
                 path.id === 'right' ? '➡️' : '🔄'}
              </div>
              <div className="text-xs font-bold">
                {path.id.toUpperCase()}
              </div>
              {selectedPath === path.id && (
                <div className="text-xs mt-1">
                  {path.correct ? '✓ GOOD CHOICE' : '⚠️ TRY AGAIN'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedPath && (
        <div className="mt-2 text-sm">
          {paths.find(p => p.id === selectedPath)?.correct ? (
            <div className="text-green-400 font-bold">
              🎯 Correct path selected! Moving forward...
            </div>
          ) : (
            <div className="text-yellow-400">
              🤔 Think again... you can still choose a different path.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PathSelector;