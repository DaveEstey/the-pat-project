import React, { useState, useEffect } from 'react';

/**
 * Dodge Indicator - Shows dodge availability, cooldown, and stamina
 */
export function DodgeIndicator({ dodgeSystem }) {
  const [state, setState] = useState({
    isDodging: false,
    isInvulnerable: false,
    canDodge: true,
    cooldownProgress: 1.0,
    staminaPercent: 1.0,
    stamina: 100,
    maxStamina: 100
  });

  useEffect(() => {
    if (!dodgeSystem) return;

    // Update state every frame for smooth animations
    const updateInterval = setInterval(() => {
      setState(dodgeSystem.getState());
    }, 16); // ~60fps

    return () => clearInterval(updateInterval);
  }, [dodgeSystem]);

  const { isDodging, isInvulnerable, canDodge, cooldownProgress, staminaPercent, stamina, maxStamina } = state;

  return (
    <div className="fixed bottom-20 left-8 z-40">
      {/* Dodge ability display */}
      <div className="bg-gray-900 bg-opacity-90 border-2 border-gray-600 rounded-lg p-3 w-48">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-white font-bold text-sm">DODGE</span>
          <span className="text-xs text-gray-400">SPACE</span>
        </div>

        {/* Stamina Bar */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-300">Stamina</span>
            <span className="text-xs text-gray-300">{Math.floor(stamina)}/{maxStamina}</span>
          </div>
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
            <div
              className={`h-full transition-all duration-100 ${
                staminaPercent > 0.5
                  ? 'bg-gradient-to-r from-green-400 to-green-500'
                  : staminaPercent > 0.25
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                  : 'bg-gradient-to-r from-red-400 to-red-500'
              }`}
              style={{ width: `${staminaPercent * 100}%` }}
            />
          </div>
        </div>

        {/* Cooldown Bar */}
        {cooldownProgress < 1.0 && (
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-300">Cooldown</span>
              <span className="text-xs text-gray-300">{Math.ceil((1 - cooldownProgress) * 1.5)}s</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-100"
                style={{ width: `${cooldownProgress * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Status Indicator */}
        <div className="mt-2 text-center">
          {isDodging && isInvulnerable && (
            <div className="bg-blue-600 text-white text-xs font-bold py-1 rounded animate-pulse">
              ⚡ INVULNERABLE ⚡
            </div>
          )}
          {isDodging && !isInvulnerable && (
            <div className="bg-yellow-600 text-white text-xs font-bold py-1 rounded">
              DODGING...
            </div>
          )}
          {!isDodging && canDodge && (
            <div className="bg-green-600 text-white text-xs font-bold py-1 rounded">
              ✓ READY
            </div>
          )}
          {!isDodging && !canDodge && cooldownProgress < 1.0 && (
            <div className="bg-gray-700 text-gray-400 text-xs font-bold py-1 rounded">
              ON COOLDOWN
            </div>
          )}
          {!isDodging && !canDodge && cooldownProgress >= 1.0 && (
            <div className="bg-gray-700 text-gray-400 text-xs font-bold py-1 rounded">
              LOW STAMINA
            </div>
          )}
        </div>

        {/* Keybind hint */}
        <div className="mt-2 text-center text-xs text-gray-500">
          Press SPACE to dodge
        </div>
      </div>

      {/* Dodge direction indicator (shown during dodge) */}
      {isDodging && (
        <div className="absolute left-1/2 transform -translate-x-1/2 -top-16">
          <div className="bg-blue-500 bg-opacity-50 rounded-full p-2 animate-ping">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">→</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DodgeIndicator;
