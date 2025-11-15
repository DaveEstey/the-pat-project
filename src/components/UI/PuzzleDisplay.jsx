import React, { useState, useEffect } from 'react';

/**
 * Puzzle Display - Shows puzzle progress, timer, and instructions
 */
export function PuzzleDisplay() {
  const [puzzleActive, setPuzzleActive] = useState(false);
  const [puzzleType, setPuzzleType] = useState('');
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(30000);
  const [instruction, setInstruction] = useState('');
  const [status, setStatus] = useState('active'); // active, completed, failed

  useEffect(() => {
    // Listen for puzzle events
    const handlePuzzleStart = (event) => {
      const { type, timeLimit } = event.detail || {};
      setPuzzleActive(true);
      setPuzzleType(type);
      setTotalTime(timeLimit || 30000);
      setTimeRemaining(timeLimit || 30000);
      setProgress(0);
      setStatus('active');

      // Set instruction based on type
      switch (type) {
        case 'switch_sequence':
          setInstruction('🎯 Shoot the GLOWING GREEN switches in order: 1 → 3 → 2 → 4');
          break;
        case 'timed_targets':
          setInstruction('Shoot all targets before time runs out!');
          break;
        case 'color_match':
          setInstruction('Shoot the matching color target!');
          break;
        default:
          setInstruction('Complete the puzzle!');
      }
    };

    const handlePuzzleProgress = (event) => {
      const { progress: newProgress } = event.detail || {};
      setProgress(newProgress || 0);
    };

    const handlePuzzleComplete = () => {
      setStatus('completed');
      setTimeout(() => {
        setPuzzleActive(false);
      }, 3000);
    };

    const handlePuzzleFail = () => {
      setStatus('failed');
      setTimeout(() => {
        setPuzzleActive(false);
      }, 3000);
    };

    window.addEventListener('puzzleStarted', handlePuzzleStart);
    window.addEventListener('puzzleProgress', handlePuzzleProgress);
    window.addEventListener('puzzleCompleted', handlePuzzleComplete);
    window.addEventListener('puzzleFailed', handlePuzzleFail);

    return () => {
      window.removeEventListener('puzzleStarted', handlePuzzleStart);
      window.removeEventListener('puzzleProgress', handlePuzzleProgress);
      window.removeEventListener('puzzleCompleted', handlePuzzleComplete);
      window.removeEventListener('puzzleFailed', handlePuzzleFail);
    };
  }, []);

  if (!puzzleActive) {
    return null;
  }

  const timePercent = (timeRemaining / totalTime) * 100;
  const isLowTime = timePercent < 30;
  const progressPercent = progress * 100;

  return (
    <div className="absolute bottom-24 left-4 z-50">
      <div className="bg-black bg-opacity-80 rounded-lg p-3 min-w-[280px]">
        {/* Puzzle header - compact */}
        <div className="mb-2">
          <div className="text-yellow-400 text-sm font-bold mb-1">
            🧩 PUZZLE: Shoot 1 → 3 → 2 → 4
          </div>
        </div>

        {/* Progress bar - compact */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Progress</span>
            <span>{Math.floor(progressPercent)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Timer - compact */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Time</span>
            <span className={isLowTime ? 'text-red-500 animate-pulse' : ''}>
              {(timeRemaining / 1000).toFixed(1)}s
            </span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-100 ${
                isLowTime ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${timePercent}%` }}
            />
          </div>
        </div>

        {/* Status message - compact */}
        {status === 'completed' && (
          <div className="text-center">
            <div className="text-green-400 text-lg font-bold">
              ✓ SOLVED! +{Math.floor(timeRemaining / 100)} pts
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="text-center">
            <div className="text-red-500 text-lg font-bold">
              ✗ FAILED - Time's up!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PuzzleDisplay;
