import React, { useState, useEffect } from 'react';

/**
 * Power-Up Indicator - Shows active power-ups with timers and effects
 */
export function PowerUpIndicator({ powerUpSystem }) {
  const [activePowerUps, setActivePowerUps] = useState([]);

  useEffect(() => {
    if (!powerUpSystem) return;

    // Update active power-ups every frame for smooth animations
    const updateInterval = setInterval(() => {
      setActivePowerUps(powerUpSystem.getActivePowerUps());
    }, 50); // 20fps for UI updates

    return () => clearInterval(updateInterval);
  }, [powerUpSystem]);

  if (activePowerUps.length === 0) return null;

  return (
    <div className="fixed top-20 right-8 z-40 space-y-2">
      {activePowerUps.map((powerUp) => {
        const progressPercent = powerUp.duration > 0
          ? (1 - powerUp.progress) * 100
          : 100;

        return (
          <div
            key={powerUp.type}
            className="bg-gray-900 bg-opacity-90 border-2 rounded-lg p-2 w-56"
            style={{ borderColor: `#${powerUp.color.toString(16).padStart(6, '0')}` }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{powerUp.icon}</span>
                <span className="text-white font-bold text-sm">{powerUp.name}</span>
              </div>
              {powerUp.stacks > 1 && (
                <span className="text-xs bg-white bg-opacity-20 text-white px-2 py-1 rounded font-bold">
                  ×{powerUp.stacks}
                </span>
              )}
            </div>

            {/* Duration bar (if timed power-up) */}
            {powerUp.duration > 0 && (
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                <div
                  className="h-full transition-all duration-100"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: `#${powerUp.color.toString(16).padStart(6, '0')}`
                  }}
                />
              </div>
            )}

            {/* Time remaining */}
            {powerUp.duration > 0 && (
              <div className="text-xs text-gray-300 text-center mt-1">
                {(powerUp.remainingTime / 1000).toFixed(1)}s
              </div>
            )}

            {/* Hit-based indicator (for Shield) */}
            {powerUp.duration === 0 && powerUp.stacks > 0 && (
              <div className="flex justify-center gap-1 mt-1">
                {Array.from({ length: powerUp.stacks }).map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: `#${powerUp.color.toString(16).padStart(6, '0')}`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PowerUpIndicator;
