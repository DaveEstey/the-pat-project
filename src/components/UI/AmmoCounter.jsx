import React, { useState, useEffect } from 'react';

/**
 * Ammo Counter - Shows current weapon ammo and reload status
 */
export function AmmoCounter() {
  const [weaponInfo, setWeaponInfo] = useState({
    type: 'pistol',
    ammo: 30,
    maxAmmo: 30,
    totalAmmo: 0,
    reloading: false,
    reloadProgress: 0,
    overheat: 0,
    isOverheated: false
  });

  useEffect(() => {
    // Update weapon info from global weapon system
    const updateWeaponInfo = () => {
      if (window.weaponSystem && window.weaponSystem.getWeaponInfo) {
        const info = window.weaponSystem.getWeaponInfo();
        setWeaponInfo(info);
      }
    };

    // Update every 100ms
    const interval = setInterval(updateWeaponInfo, 100);
    updateWeaponInfo(); // Initial update

    return () => clearInterval(interval);
  }, []);

  const ammoPercent = weaponInfo.maxAmmo > 0 ? (weaponInfo.ammo / weaponInfo.maxAmmo) * 100 : 0;
  const isLowAmmo = ammoPercent < 30;
  const isOutOfAmmo = weaponInfo.ammo === 0;

  // Get weapon display name
  const weaponNames = {
    pistol: 'Pistol',
    shotgun: 'Shotgun',
    rapidfire: 'Rapid Fire',
    grappling: 'Grappling Arm',
    bomb: 'Bomb'
  };

  const weaponName = weaponNames[weaponInfo.type] || weaponInfo.type;

  // Determine ammo color
  let ammoColor = '#00ff00'; // Green
  if (isOutOfAmmo) {
    ammoColor = '#ff0000'; // Red
  } else if (isLowAmmo) {
    ammoColor = '#ffaa00'; // Orange
  }

  return (
    <div className="absolute bottom-4 right-4 z-50 select-none">
      {/* Main ammo display */}
      <div className="bg-black bg-opacity-80 rounded-lg p-4 min-w-[200px]">
        {/* Weapon name */}
        <div className="text-white text-sm font-bold mb-2 uppercase tracking-wide">
          {weaponName}
        </div>

        {/* Ammo count */}
        <div className="flex items-baseline gap-2 mb-2">
          <div
            className="text-5xl font-bold transition-colors duration-200"
            style={{
              color: ammoColor,
              textShadow: `0 0 10px ${ammoColor}80`
            }}
          >
            {weaponInfo.ammo}
          </div>
          <div className="text-2xl text-gray-400">/</div>
          <div className="text-2xl text-gray-400">{weaponInfo.maxAmmo}</div>
        </div>

        {/* Reserve ammo (if applicable) */}
        {weaponInfo.totalAmmo !== undefined && weaponInfo.totalAmmo > 0 && (
          <div className="text-sm text-gray-400 mb-2">
            Reserve: {weaponInfo.totalAmmo}
          </div>
        )}

        {/* Reload status */}
        {weaponInfo.reloading && (
          <div className="mb-2">
            <div className="text-yellow-400 text-sm font-bold mb-1 animate-pulse">
              RELOADING...
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 transition-all duration-100"
                style={{ width: `${weaponInfo.reloadProgress * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Out of ammo warning */}
        {isOutOfAmmo && !weaponInfo.reloading && (
          <div className="text-red-500 text-sm font-bold animate-pulse">
            {weaponInfo.totalAmmo > 0 ? 'PRESS R TO RELOAD' : 'OUT OF AMMO'}
          </div>
        )}

        {/* Low ammo warning */}
        {isLowAmmo && !isOutOfAmmo && !weaponInfo.reloading && (
          <div className="text-orange-400 text-xs font-bold">
            LOW AMMO
          </div>
        )}

        {/* Overheat indicator (for rapid fire) */}
        {weaponInfo.type === 'rapidfire' && weaponInfo.overheat > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Heat</span>
              <span>{Math.floor(weaponInfo.overheat * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-100"
                style={{
                  width: `${weaponInfo.overheat * 100}%`,
                  backgroundColor: weaponInfo.isOverheated ? '#ff0000' :
                                   weaponInfo.overheat > 0.7 ? '#ff8800' :
                                   '#00ff00'
                }}
              />
            </div>
            {weaponInfo.isOverheated && (
              <div className="text-red-500 text-xs font-bold mt-1 animate-pulse">
                OVERHEATED!
              </div>
            )}
          </div>
        )}

        {/* Infinite ammo indicator */}
        {weaponInfo.maxAmmo === Infinity && (
          <div className="text-cyan-400 text-xs font-bold">
            ∞ INFINITE
          </div>
        )}
      </div>

      {/* Reload hint */}
      {!weaponInfo.reloading && weaponInfo.ammo < weaponInfo.maxAmmo && weaponInfo.totalAmmo > 0 && (
        <div className="text-center mt-2 text-gray-400 text-xs">
          Press R to reload
        </div>
      )}
    </div>
  );
}

export default AmmoCounter;
