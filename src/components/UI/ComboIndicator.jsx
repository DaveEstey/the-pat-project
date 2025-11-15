import React, { useState, useEffect } from 'react';

/**
 * Combo Indicator - Shows kill streak, multipliers, and combo timer
 */
export function ComboIndicator({ comboSystem }) {
  const [state, setState] = useState({
    combo: 0,
    maxCombo: 0,
    scoreMultiplier: 1.0,
    damageMultiplier: 1.0,
    isActive: false,
    tierName: null,
    tierColor: 0xffffff,
    timeRemaining: 0,
    timerProgress: 0
  });

  const [milestoneFlash, setMilestoneFlash] = useState(null);

  useEffect(() => {
    if (!comboSystem) return;

    // Update state every frame for smooth animations
    const updateInterval = setInterval(() => {
      setState(comboSystem.getComboState());
    }, 16); // ~60fps

    // Listen for milestone events
    const handleMilestone = (event) => {
      const { name, color } = event.detail;
      setMilestoneFlash({ name, color });

      // Clear milestone flash after 2 seconds
      setTimeout(() => {
        setMilestoneFlash(null);
      }, 2000);
    };

    window.addEventListener('comboMilestone', handleMilestone);

    return () => {
      clearInterval(updateInterval);
      window.removeEventListener('comboMilestone', handleMilestone);
    };
  }, [comboSystem]);

  if (!state.isActive && !milestoneFlash) return null;

  const tierColorHex = `#${state.tierColor.toString(16).padStart(6, '0')}`;

  return (
    <div className="fixed top-32 right-8 z-40">
      {/* Main combo display */}
      <div
        className="bg-gray-900 bg-opacity-90 border-4 rounded-lg p-4 min-w-56 text-center"
        style={{ borderColor: tierColorHex }}
      >
        {/* Tier name */}
        {state.tierName && (
          <div
            className="text-2xl font-bold mb-2 animate-pulse"
            style={{ color: tierColorHex }}
          >
            {state.tierName}
          </div>
        )}

        {/* Combo counter */}
        <div className="mb-2">
          <div className="text-sm text-gray-400">COMBO</div>
          <div
            className="text-6xl font-bold"
            style={{ color: tierColorHex }}
          >
            {state.combo}
          </div>
        </div>

        {/* Multipliers */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-gray-800 rounded p-2">
            <div className="text-xs text-gray-400">DAMAGE</div>
            <div className="text-lg font-bold text-red-400">
              ×{state.damageMultiplier.toFixed(2)}
            </div>
          </div>
          <div className="bg-gray-800 rounded p-2">
            <div className="text-xs text-gray-400">SCORE</div>
            <div className="text-lg font-bold text-yellow-400">
              ×{state.scoreMultiplier.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Timer bar */}
        {state.timeRemaining > 0 && (
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
            <div
              className="h-full transition-all duration-100"
              style={{
                width: `${state.timerProgress * 100}%`,
                backgroundColor: state.timerProgress > 0.5
                  ? tierColorHex
                  : state.timerProgress > 0.25
                  ? '#ff8800'
                  : '#ff0000'
              }}
            />
          </div>
        )}

        {/* Time remaining text */}
        {state.timeRemaining > 0 && (
          <div className="text-xs text-gray-400 mt-1">
            {(state.timeRemaining / 1000).toFixed(1)}s
          </div>
        )}

        {/* Max combo */}
        {state.maxCombo > state.combo && (
          <div className="mt-2 text-xs text-gray-500">
            Best: {state.maxCombo}
          </div>
        )}
      </div>

      {/* Milestone flash animation */}
      {milestoneFlash && (
        <div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-4"
          style={{
            animation: 'fadeSlideUp 2s ease-out'
          }}
        >
          <div
            className="text-4xl font-bold px-6 py-3 rounded-lg bg-black bg-opacity-80 border-4 whitespace-nowrap"
            style={{
              borderColor: `#${milestoneFlash.color.toString(16).padStart(6, '0')}`,
              color: `#${milestoneFlash.color.toString(16).padStart(6, '0')}`
            }}
          >
            {milestoneFlash.name}
          </div>
        </div>
      )}

      {/* CSS for animation */}
      <style>{`
        @keyframes fadeSlideUp {
          0% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-100px);
          }
        }
      `}</style>
    </div>
  );
}

export default ComboIndicator;
