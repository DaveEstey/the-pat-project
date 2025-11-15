import React, { useEffect, useCallback, useRef, useState } from 'react';
import { WeaponSystem } from '../../systems/WeaponSystem.js';
import { WeaponTypes } from '../../types/weapons.js';

// Weapon Controller - Handles weapon switching and UI display
export function WeaponController({ gameEngine }) {
  const weaponSystemRef = useRef(null);
  const [weaponStatus, setWeaponStatus] = useState(null);
  const [unlockedWeapons, setUnlockedWeapons] = useState([WeaponTypes.PISTOL]);
  const [isVisible, setIsVisible] = useState(true);

  // Initialize weapon system
  useEffect(() => {
    if (gameEngine && !weaponSystemRef.current) {
      weaponSystemRef.current = new WeaponSystem(gameEngine);

      // Make weapon system globally available
      window.weaponSystem = weaponSystemRef.current;

      // Update initial status
      updateWeaponStatus();
    }

    return () => {
      if (weaponSystemRef.current) {
        weaponSystemRef.current.cleanup();
        weaponSystemRef.current = null;
        window.weaponSystem = null;
      }
    };
  }, [gameEngine]);

  // Update weapon status for UI
  const updateWeaponStatus = useCallback(() => {
    if (weaponSystemRef.current) {
      const status = weaponSystemRef.current.getWeaponInfo();
      setWeaponStatus(status);

      // Update unlocked weapons list
      const allWeapons = weaponSystemRef.current.getAllWeaponsInfo();
      const unlocked = allWeapons.filter(w => w.unlocked).map(w => w.type);
      setUnlockedWeapons(unlocked);
    }
  }, []);

  // Handle keyboard input for weapon switching
  const handleKeyPress = useCallback((event) => {
    if (!weaponSystemRef.current) return;

    const key = event.key;
    let weaponType = null;

    // Map number keys to weapons
    switch (key) {
      case '1':
        weaponType = WeaponTypes.PISTOL;
        break;
      case '2':
        weaponType = WeaponTypes.SHOTGUN;
        break;
      case '3':
        weaponType = WeaponTypes.RAPIDFIRE;
        break;
      case '4':
        weaponType = WeaponTypes.GRAPPLING;
        break;
      case 'r':
      case 'R':
        // Reload current weapon
        const reloaded = weaponSystemRef.current.reload();
        if (reloaded) {

          // Trigger reload visual effect - approximate position near camera
          window.dispatchEvent(new CustomEvent('weaponReload', {
            detail: {
              position: { x: 0.5, y: -0.5, z: -1 } // Position relative to camera
            }
          }));
        }
        updateWeaponStatus();
        return;
      case 'h':
      case 'H':
        // Toggle UI visibility
        setIsVisible(prev => !prev);
        return;
    }

    if (weaponType && weaponSystemRef.current.switchWeapon(weaponType)) {
      updateWeaponStatus();
    }
  }, [updateWeaponStatus]);

  // Set up keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Update weapon status periodically to reflect changes from combat
  useEffect(() => {
    const interval = setInterval(updateWeaponStatus, 500);
    return () => clearInterval(interval);
  }, [updateWeaponStatus]);

  // Listen for weapon unlock events to update UI immediately
  useEffect(() => {
    const handleWeaponUnlock = () => {
      updateWeaponStatus();
    };

    window.addEventListener('showNotification', handleWeaponUnlock);
    return () => {
      window.removeEventListener('showNotification', handleWeaponUnlock);
    };
  }, [updateWeaponStatus]);

  if (!isVisible || !weaponStatus) {
    return null;
  }

  // Get weapon display info
  const getWeaponDisplayName = (type) => {
    switch (type) {
      case WeaponTypes.PISTOL: return 'Pistol';
      case WeaponTypes.SHOTGUN: return 'Shotgun';
      case WeaponTypes.RAPIDFIRE: return 'Rapid Fire';
      case WeaponTypes.GRAPPLING: return 'Grappling Arm';
      default: return 'Unknown';
    }
  };

  const getAmmoDisplay = () => {
    if (weaponStatus.maxAmmo === Infinity) {
      return '∞';
    }
    return `${weaponStatus.ammo}/${weaponStatus.maxAmmo}`;
  };

  const getWeaponColor = () => {
    if (weaponStatus.reloading) return 'text-yellow-400';
    if (weaponStatus.isOverheated) return 'text-red-400';
    if (weaponStatus.ammo <= 0 && weaponStatus.maxAmmo !== Infinity) return 'text-red-400';
    return 'text-green-400';
  };

  return (
    <div className="absolute top-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg font-mono z-50">
      {/* Current Weapon Display */}
      <div className={`text-lg font-bold ${getWeaponColor()}`}>
        {getWeaponDisplayName(weaponStatus.type)}
      </div>

      {/* Ammo Display */}
      <div className="text-sm mt-1">
        Ammo: {getAmmoDisplay()}
      </div>

      {/* Weapon Status */}
      {weaponStatus.reloading && (
        <div className="text-yellow-400 text-sm mt-1 animate-pulse">
          Reloading...
        </div>
      )}

      {weaponStatus.isOverheated && (
        <div className="text-red-400 text-sm mt-1 animate-pulse">
          OVERHEATED!
        </div>
      )}

      {/* Overheat Bar for Rapid Fire */}
      {weaponStatus.type === WeaponTypes.RAPIDFIRE && weaponStatus.overheat > 0 && (
        <div className="mt-2">
          <div className="text-xs text-gray-400 mb-1">Heat:</div>
          <div className="w-24 h-2 bg-gray-700 rounded">
            <div
              className={`h-full rounded transition-all duration-200 ${
                weaponStatus.overheat > 0.8
                  ? 'bg-red-500'
                  : weaponStatus.overheat > 0.5
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${weaponStatus.overheat * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Weapon Selection Guide */}
      <div className="mt-3 text-xs text-gray-400">
        <div className="border-t border-gray-600 pt-2">
          {unlockedWeapons.includes(WeaponTypes.PISTOL) && <div>1 - Pistol (∞)</div>}
          {unlockedWeapons.includes(WeaponTypes.SHOTGUN) ? (
            <div className="text-green-400">2 - Shotgun ✓</div>
          ) : (
            <div className="text-gray-600">2 - Shotgun 🔒</div>
          )}
          {unlockedWeapons.includes(WeaponTypes.RAPIDFIRE) ? (
            <div className="text-green-400">3 - Rapid Fire ✓</div>
          ) : (
            <div className="text-gray-600">3 - Rapid Fire 🔒</div>
          )}
          {unlockedWeapons.includes(WeaponTypes.GRAPPLING) ? (
            <div className="text-green-400">4 - Grappling Arm ✓</div>
          ) : (
            <div className="text-gray-600">4 - Grappling Arm 🔒</div>
          )}
          <div className="mt-1 text-yellow-400">R - Reload</div>
          <div className="text-blue-400">H - Hide UI</div>
        </div>
      </div>
    </div>
  );
}

export default WeaponController;