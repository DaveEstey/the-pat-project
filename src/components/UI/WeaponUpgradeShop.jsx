import React, { useState, useEffect } from 'react';
import { getWeaponUpgradeSystem } from '../../systems/WeaponUpgradeSystem.js';

/**
 * Weapon Upgrade Shop - UI for upgrading weapons between levels
 */
export function WeaponUpgradeShop({ onClose }) {
  const [upgradeSystem] = useState(() => getWeaponUpgradeSystem());
  const [currency, setCurrency] = useState(0);
  const [selectedWeapon, setSelectedWeapon] = useState('pistol');
  const [upgradeProgress, setUpgradeProgress] = useState(null);

  const weapons = [
    { id: 'pistol', name: 'Pistol', description: 'Reliable sidearm with infinite ammo' },
    { id: 'shotgun', name: 'Shotgun', description: 'Close-range powerhouse' },
    { id: 'rapidfire', name: 'Rapid Fire', description: 'High rate of fire weapon' },
    { id: 'grappling', name: 'Grappling Arm', description: 'Utility and crowd control' }
  ];

  // Load initial data
  useEffect(() => {
    setCurrency(upgradeSystem.getCurrency());
    setUpgradeProgress(upgradeSystem.getUpgradeProgress(selectedWeapon));

    const handleCurrencyChange = (event) => {
      setCurrency(event.detail.currency);
    };

    const handleWeaponUpgrade = () => {
      setUpgradeProgress(upgradeSystem.getUpgradeProgress(selectedWeapon));
      setCurrency(upgradeSystem.getCurrency());
    };

    window.addEventListener('currencyChanged', handleCurrencyChange);
    window.addEventListener('weaponUpgraded', handleWeaponUpgrade);

    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange);
      window.removeEventListener('weaponUpgraded', handleWeaponUpgrade);
    };
  }, [upgradeSystem, selectedWeapon]);

  // Update progress when weapon changes
  useEffect(() => {
    setUpgradeProgress(upgradeSystem.getUpgradeProgress(selectedWeapon));
  }, [selectedWeapon, upgradeSystem]);

  const handleUpgrade = (type) => {
    let success = false;

    switch (type) {
      case 'damage':
        success = upgradeSystem.upgradeDamage(selectedWeapon);
        break;
      case 'fireRate':
        success = upgradeSystem.upgradeFireRate(selectedWeapon);
        break;
      case 'magazine':
        success = upgradeSystem.upgradeMagazine(selectedWeapon);
        break;
    }

    if (success) {
      setUpgradeProgress(upgradeSystem.getUpgradeProgress(selectedWeapon));
      setCurrency(upgradeSystem.getCurrency());
    }
  };

  if (!upgradeProgress) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold text-white">Weapon Upgrades</h2>
          <div className="text-right">
            <div className="text-sm text-gray-400">Currency</div>
            <div className="text-3xl font-bold text-yellow-400">{currency}</div>
          </div>
        </div>

        {/* Weapon Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {weapons.map(weapon => (
            <button
              key={weapon.id}
              onClick={() => setSelectedWeapon(weapon.id)}
              className={`p-4 rounded-lg transition-all ${
                selectedWeapon === weapon.id
                  ? 'bg-blue-600 border-2 border-blue-400'
                  : 'bg-gray-700 hover:bg-gray-600 border-2 border-transparent'
              }`}
            >
              <div className="text-lg font-bold text-white">{weapon.name}</div>
              <div className="text-xs text-gray-300 mt-1">{weapon.description}</div>
            </button>
          ))}
        </div>

        {/* Upgrade Options */}
        <div className="space-y-4">
          {/* Damage Upgrade */}
          <UpgradeCard
            title="Damage"
            description="+15% damage per level"
            progress={upgradeProgress.damage}
            onUpgrade={() => handleUpgrade('damage')}
          />

          {/* Fire Rate Upgrade */}
          <UpgradeCard
            title="Fire Rate"
            description="-10% delay between shots per level"
            progress={upgradeProgress.fireRate}
            onUpgrade={() => handleUpgrade('fireRate')}
          />

          {/* Magazine Upgrade */}
          <UpgradeCard
            title="Magazine Size"
            description="+20% ammo capacity per level"
            progress={upgradeProgress.magazine}
            onUpgrade={() => handleUpgrade('magazine')}
          />
        </div>

        {/* Close Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-500 text-white px-8 py-3 rounded-lg font-bold text-lg"
          >
            Close Shop
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Individual Upgrade Card
 */
function UpgradeCard({ title, description, progress, onUpgrade }) {
  return (
    <div className="bg-gray-700 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          <p className="text-sm text-gray-300">{description}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Level</div>
          <div className="text-2xl font-bold text-blue-400">
            {progress.current} / {progress.max}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-800 rounded-full h-4 mb-4">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-300"
          style={{ width: `${(progress.current / progress.max) * 100}%` }}
        />
      </div>

      {/* Upgrade Button */}
      {progress.maxed ? (
        <div className="bg-green-600 text-white text-center py-3 rounded-lg font-bold">
          MAX LEVEL
        </div>
      ) : (
        <button
          onClick={onUpgrade}
          disabled={!progress.canAfford}
          className={`w-full py-3 rounded-lg font-bold transition-all ${
            progress.canAfford
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {progress.canAfford
            ? `Upgrade - ${progress.cost} Currency`
            : `Need ${progress.cost} Currency`}
        </button>
      )}
    </div>
  );
}

export default WeaponUpgradeShop;
