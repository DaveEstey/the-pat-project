import React from 'react';
import { useGame } from '../../contexts/GameContext.jsx';
import { getItemTypeInfo } from '../../data/levelItems.js';

const Inventory = ({ isOpen, onClose }) => {
  const { state } = useGame();
  const { player } = state;

  if (!isOpen) return null;

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Inactive';
    const remaining = Math.max(0, timestamp - Date.now());
    return `${Math.ceil(remaining / 1000)}s`;
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 p-8 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border-4 border-purple-500">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold text-white drop-shadow-lg">Inventory</h2>
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Close (Tab)
          </button>
        </div>

        {/* Ammo Section */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-yellow-400 mb-3">Ammunition</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 p-4 rounded border-2 border-gray-600">
              <div className="text-gray-300 text-sm">Pistol</div>
              <div className="text-white text-2xl font-bold">∞</div>
            </div>
            <div className="bg-gray-700 p-4 rounded border-2 border-orange-500">
              <div className="text-gray-300 text-sm">Shotgun</div>
              <div className="text-white text-2xl font-bold">{player.ammo.shotgun}</div>
            </div>
            <div className="bg-gray-700 p-4 rounded border-2 border-red-500">
              <div className="text-gray-300 text-sm">Rapid Fire</div>
              <div className="text-white text-2xl font-bold">{player.ammo.rapidfire}</div>
            </div>
            <div className="bg-gray-700 p-4 rounded border-2 border-gray-500">
              <div className="text-gray-300 text-sm">Bombs</div>
              <div className="text-white text-2xl font-bold">{player.ammo.bomb}</div>
            </div>
          </div>
        </div>

        {/* Active Powerups Section */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-cyan-400 mb-3">Active Powerups</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Speed Powerup */}
            <div className={`p-4 rounded border-2 ${
              player.activePowerups.speed
                ? 'bg-cyan-900 border-cyan-400'
                : 'bg-gray-700 border-gray-600 opacity-50'
            }`}>
              <div className="flex justify-between items-center">
                <div className="text-cyan-300 font-bold">Speed Boost</div>
                <div className={`text-sm ${
                  player.activePowerups.speed ? 'text-cyan-200' : 'text-gray-400'
                }`}>
                  {formatTime(player.activePowerups.speed)}
                </div>
              </div>
              <div className="text-gray-300 text-xs mt-1">+25% Movement & Reload</div>
            </div>

            {/* Damage Powerup */}
            <div className={`p-4 rounded border-2 ${
              player.activePowerups.damage
                ? 'bg-red-900 border-red-400'
                : 'bg-gray-700 border-gray-600 opacity-50'
            }`}>
              <div className="flex justify-between items-center">
                <div className="text-red-300 font-bold">Damage Boost</div>
                <div className={`text-sm ${
                  player.activePowerups.damage ? 'text-red-200' : 'text-gray-400'
                }`}>
                  {formatTime(player.activePowerups.damage)}
                </div>
              </div>
              <div className="text-gray-300 text-xs mt-1">+50% Damage</div>
            </div>

            {/* Accuracy Powerup */}
            <div className={`p-4 rounded border-2 ${
              player.activePowerups.accuracy
                ? 'bg-purple-900 border-purple-400'
                : 'bg-gray-700 border-gray-600 opacity-50'
            }`}>
              <div className="flex justify-between items-center">
                <div className="text-purple-300 font-bold">Precision Boost</div>
                <div className={`text-sm ${
                  player.activePowerups.accuracy ? 'text-purple-200' : 'text-gray-400'
                }`}>
                  {formatTime(player.activePowerups.accuracy)}
                </div>
              </div>
              <div className="text-gray-300 text-xs mt-1">Improved Accuracy</div>
            </div>
          </div>
        </div>

        {/* Permanent Upgrades Section */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-pink-400 mb-3">Permanent Upgrades</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded border-2 ${
              player.permanentUpgrades.enhanced_grip
                ? 'bg-pink-900 border-pink-400'
                : 'bg-gray-700 border-gray-600 opacity-50'
            }`}>
              <div className="text-pink-300 font-bold">Enhanced Grip</div>
              <div className="text-gray-300 text-xs mt-1">+10% Faster Reload</div>
              {player.permanentUpgrades.enhanced_grip && (
                <div className="text-green-400 text-xs mt-2">✓ UNLOCKED</div>
              )}
            </div>

            <div className={`p-4 rounded border-2 ${
              player.permanentUpgrades.reinforced_armor
                ? 'bg-pink-900 border-pink-400'
                : 'bg-gray-700 border-gray-600 opacity-50'
            }`}>
              <div className="text-pink-300 font-bold">Reinforced Armor</div>
              <div className="text-gray-300 text-xs mt-1">+5% Damage Reduction</div>
              {player.permanentUpgrades.reinforced_armor && (
                <div className="text-green-400 text-xs mt-2">✓ UNLOCKED</div>
              )}
            </div>

            <div className={`p-4 rounded border-2 ${
              player.permanentUpgrades.eagle_eye
                ? 'bg-pink-900 border-pink-400'
                : 'bg-gray-700 border-gray-600 opacity-50'
            }`}>
              <div className="text-pink-300 font-bold">Eagle Eye</div>
              <div className="text-gray-300 text-xs mt-1">Larger Weak Spots</div>
              {player.permanentUpgrades.eagle_eye && (
                <div className="text-green-400 text-xs mt-2">✓ UNLOCKED</div>
              )}
            </div>
          </div>
        </div>

        {/* Key Items Section */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-yellow-400 mb-3">Key Items</h3>
          {player.inventory.keyItems && player.inventory.keyItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {player.inventory.keyItems.map((item, index) => {
                const info = getItemTypeInfo('key_item', item.subType);
                return (
                  <div
                    key={index}
                    className="bg-yellow-900 p-4 rounded border-2 border-yellow-400"
                  >
                    <div className="text-yellow-300 font-bold">{info.name}</div>
                    <div className="text-gray-300 text-sm mt-1">{info.description}</div>
                    {item.unlocks && item.unlocks.length > 0 && (
                      <div className="text-green-400 text-xs mt-2">
                        Unlocks: {item.unlocks.join(', ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-gray-400 italic p-4 bg-gray-700 rounded">
              No key items collected yet. Find them in levels to unlock new paths!
            </div>
          )}
        </div>

        {/* Player Stats */}
        <div className="border-t-2 border-gray-600 pt-4">
          <h3 className="text-2xl font-bold text-white mb-3">Player Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 p-3 rounded">
              <div className="text-gray-400 text-xs">Score</div>
              <div className="text-white text-xl font-bold">{player.score}</div>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <div className="text-gray-400 text-xs">Accuracy</div>
              <div className="text-white text-xl font-bold">{player.accuracy}%</div>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <div className="text-gray-400 text-xs">Lives</div>
              <div className="text-white text-xl font-bold">{player.lives}</div>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <div className="text-gray-400 text-xs">Level</div>
              <div className="text-white text-xl font-bold">{state.currentLevel}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
