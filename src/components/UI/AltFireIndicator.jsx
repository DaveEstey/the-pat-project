import React, { useState, useEffect } from 'react';

/**
 * Alt-Fire Indicator - Shows alt-fire mode status and charge level
 */
export function AltFireIndicator({ weaponSystem }) {
  const [altFireActive, setAltFireActive] = useState(false);
  const [chargeLevel, setChargeLevel] = useState(0);
  const [currentWeapon, setCurrentWeapon] = useState('pistol');

  useEffect(() => {
    if (!weaponSystem) return;

    const updateInterval = setInterval(() => {
      setAltFireActive(weaponSystem.altFireMode);
      setChargeLevel(weaponSystem.getChargeLevel ? weaponSystem.getChargeLevel() : 0);
      setCurrentWeapon(weaponSystem.currentWeapon || 'pistol');
    }, 50); // Update every 50ms for smooth charge animation

    return () => clearInterval(updateInterval);
  }, [weaponSystem]);

  // Get alt-fire mode description for current weapon
  const getAltFireDescription = () => {
    switch (currentWeapon) {
      case 'pistol':
        return 'Charged Shot';
      case 'shotgun':
        return 'Tight Choke';
      case 'rapidfire':
        return 'Burst Fire';
      case 'grappling':
        return 'Slam';
      default:
        return 'Alt-Fire';
    }
  };

  if (!altFireActive && chargeLevel === 0) {
    // Show subtle hint that alt-fire is available
    return (
      <div className="fixed bottom-32 right-8 text-gray-500 text-sm">
        Press [ALT] for Alt-Fire
      </div>
    );
  }

  return (
    <div className="fixed bottom-32 right-8 z-40">
      {/* Alt-fire mode indicator */}
      {altFireActive && (
        <div className="bg-blue-900 bg-opacity-90 border-2 border-blue-400 rounded-lg p-4 mb-2">
          <div className="text-blue-300 font-bold text-center text-lg mb-1">
            ALT-FIRE ACTIVE
          </div>
          <div className="text-blue-200 text-center text-sm">
            {getAltFireDescription()}
          </div>
        </div>
      )}

      {/* Charge indicator for pistol */}
      {currentWeapon === 'pistol' && altFireActive && chargeLevel > 0 && (
        <div className="bg-gray-900 bg-opacity-90 border-2 border-yellow-400 rounded-lg p-4">
          <div className="text-yellow-300 font-bold text-center mb-2">
            CHARGING
          </div>

          {/* Charge bar */}
          <div className="w-48 h-6 bg-gray-700 rounded-full overflow-hidden border-2 border-gray-600">
            <div
              className={`h-full transition-all duration-100 ${
                chargeLevel >= 1.0
                  ? 'bg-gradient-to-r from-green-400 to-green-600'
                  : chargeLevel >= 0.5
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                  : 'bg-gradient-to-r from-red-400 to-red-600'
              }`}
              style={{ width: `${chargeLevel * 100}%` }}
            />
          </div>

          {/* Charge percentage */}
          <div className="text-center mt-2">
            <span className={`font-bold text-lg ${
              chargeLevel >= 1.0
                ? 'text-green-400'
                : chargeLevel >= 0.5
                ? 'text-yellow-400'
                : 'text-red-400'
            }`}>
              {Math.floor(chargeLevel * 100)}%
            </span>
          </div>

          {/* Charge level description */}
          <div className="text-center mt-1">
            {chargeLevel >= 1.0 && (
              <span className="text-green-300 text-sm font-bold">MAX CHARGE!</span>
            )}
            {chargeLevel >= 0.5 && chargeLevel < 1.0 && (
              <span className="text-yellow-300 text-sm">Ready to fire</span>
            )}
            {chargeLevel < 0.5 && (
              <span className="text-red-300 text-sm">Keep charging...</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AltFireIndicator;
