import React, { useState, useEffect } from 'react';
import { UI_ZONES, Z_LAYERS, getUIClasses } from './UILayout.jsx';

/**
 * Low Ammo Warning - Warns player when ammunition is running low
 */
export function LowAmmoWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [ammoPercent, setAmmoPercent] = useState(100);
  const [weaponName, setWeaponName] = useState('');

  useEffect(() => {
    const handleAmmoUpdate = (event) => {
      const { currentAmmo, maxAmmo, weaponType } = event.detail || {};

      if (currentAmmo !== undefined && maxAmmo !== undefined) {
        const percent = maxAmmo > 0 ? (currentAmmo / maxAmmo) * 100 : 0;
        setAmmoPercent(percent);
        setWeaponName(weaponType || '');

        // Show warning if ammo is below 30%
        if (percent > 0 && percent <= 30) {
          setShowWarning(true);
        } else {
          setShowWarning(false);
        }
      }
    };

    window.addEventListener('ammoUpdate', handleAmmoUpdate);

    return () => {
      window.removeEventListener('ammoUpdate', handleAmmoUpdate);
    };
  }, []);

  if (!showWarning) {
    return null;
  }

  // Critical warning (below 10%)
  const isCritical = ammoPercent <= 10 && ammoPercent > 0;
  // Out of ammo (0%)
  const isEmpty = ammoPercent === 0;

  return (
    <div className={getUIClasses(UI_ZONES.BOTTOM_CENTER, Z_LAYERS.NOTIFICATIONS)}>
      <div className={`
        px-6 py-3 rounded-lg font-bold text-center
        transition-all duration-300 pointer-events-none
        ${isEmpty ?
          'bg-red-900 bg-opacity-90 text-white animate-pulse' :
          isCritical ?
          'bg-red-800 bg-opacity-80 text-yellow-300 animate-bounce' :
          'bg-yellow-800 bg-opacity-70 text-white'
        }
      `}>
        {isEmpty ? (
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="text-xl">OUT OF AMMO!</div>
              <div className="text-sm">RELOAD NOW (R)</div>
            </div>
            <span className="text-2xl">⚠️</span>
          </div>
        ) : isCritical ? (
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <div>
              <div className="text-lg">CRITICAL AMMO!</div>
              <div className="text-sm">{Math.floor(ammoPercent)}% remaining</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <div className="text-sm">
              Low Ammo: {Math.floor(ammoPercent)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LowAmmoWarning;
