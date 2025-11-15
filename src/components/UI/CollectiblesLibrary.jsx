/**
 * Collectibles Library Component
 * Displays all collectible items and their lore
 */

import React, { useState, useEffect, useMemo } from 'react';
import { getCollectibleSystem, CollectibleTypes, CollectibleRarity } from '../../systems/CollectibleSystem.js';

export function CollectiblesLibrary() {
  const [collectibleSystem, setCollectibleSystem] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCollectible, setSelectedCollectible] = useState(null);
  const [showOnlyCollected, setShowOnlyCollected] = useState(false);

  useEffect(() => {
    const system = getCollectibleSystem();
    setCollectibleSystem(system);
    if (system) {
      setStats(system.getCollectionStats());
    }
  }, []);

  const getTypeIcon = (type) => {
    switch (type) {
      case CollectibleTypes.AUDIO_LOG: return '🎙️';
      case CollectibleTypes.DOCUMENT: return '📄';
      case CollectibleTypes.PHOTO: return '📷';
      case CollectibleTypes.ARTIFACT: return '🏺';
      default: return '📦';
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case CollectibleRarity.COMMON: return 'text-gray-300';
      case CollectibleRarity.UNCOMMON: return 'text-green-400';
      case CollectibleRarity.RARE: return 'text-blue-400';
      case CollectibleRarity.LEGENDARY: return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getRarityBorder = (rarity) => {
    switch (rarity) {
      case CollectibleRarity.COMMON: return 'border-gray-500';
      case CollectibleRarity.UNCOMMON: return 'border-green-500';
      case CollectibleRarity.RARE: return 'border-blue-500';
      case CollectibleRarity.LEGENDARY: return 'border-purple-500';
      default: return 'border-gray-600';
    }
  };

  // Memoize filtered collectibles for performance
  const filteredCollectibles = useMemo(() => {
    if (!collectibleSystem) return [];

    let items = collectibleSystem.getAllCollectibles();

    if (selectedType !== 'all') {
      items = items.filter(c => c.type === selectedType);
    }

    if (showOnlyCollected) {
      items = items.filter(c => collectibleSystem.isCollected(c.id));
    }

    return items;
  }, [collectibleSystem, selectedType, showOnlyCollected]);

  if (!collectibleSystem || !stats) {
    return (
      <div className="text-white text-center py-8">
        Loading collectibles library...
      </div>
    );
  }

  return (
    <div className="text-white p-6 max-h-screen overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Collectibles Library</h2>
        <p className="text-gray-300">
          Discover the story through collectible items
        </p>
      </div>

      {/* Overall Stats */}
      <div className="bg-blue-900 bg-opacity-50 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">Collection Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{stats.collected}</div>
            <div className="text-sm text-gray-300">Collected</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">{stats.total - stats.collected}</div>
            <div className="text-sm text-gray-300">Remaining</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{stats.total}</div>
            <div className="text-sm text-gray-300">Total</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">{stats.percentage}%</div>
            <div className="text-sm text-gray-300">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
      </div>

      {/* Type Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(stats.byType).map(([type, data]) => (
          <div key={type} className="bg-purple-900 bg-opacity-50 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">{getTypeIcon(type)}</div>
            <div className="font-bold capitalize">{type.replace('_', ' ')}</div>
            <div className="text-sm text-gray-300">
              {data.collected}/{data.total} ({data.percentage}%)
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded font-bold transition-colors ${
                selectedType === 'all'
                  ? 'bg-blue-600'
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              All
            </button>
            {Object.values(CollectibleTypes).map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded font-bold transition-colors ${
                  selectedType === type
                    ? 'bg-blue-600'
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {getTypeIcon(type)}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyCollected}
              onChange={(e) => setShowOnlyCollected(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Show only collected</span>
          </label>
        </div>
      </div>

      {/* Collectibles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filteredCollectibles.map(collectible => {
          const isCollected = collectibleSystem.isCollected(collectible.id);
          const isNew = collectibleSystem.isNewlyCollected(collectible.id);

          return (
            <div
              key={collectible.id}
              onClick={() => isCollected && setSelectedCollectible(collectible)}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                isCollected
                  ? `${getRarityBorder(collectible.rarity)} bg-opacity-50 hover:bg-opacity-70`
                  : 'border-gray-700 bg-gray-900 bg-opacity-30 opacity-50'
              } ${isNew ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{getTypeIcon(collectible.type)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold">
                      {isCollected ? collectible.title : '???'}
                    </div>
                    {isNew && (
                      <span className="text-xs bg-yellow-600 px-2 py-1 rounded">NEW</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {isCollected ? collectible.description : 'Not yet discovered'}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs font-bold capitalize ${getRarityColor(collectible.rarity)}`}>
                      {collectible.rarity}
                    </span>
                    <span className="text-xs text-gray-500">
                      Level {collectible.levelFound}
                      {collectible.hidden && ' 🔒'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Collectible Detail Modal */}
      {selectedCollectible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCollectible(null)}
        >
          <div
            className={`max-w-2xl w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border-2 ${getRarityBorder(selectedCollectible.rarity)} p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="text-5xl">{getTypeIcon(selectedCollectible.type)}</div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{selectedCollectible.title}</h2>
                <p className="text-gray-400 mb-2">{selectedCollectible.description}</p>
                <div className="flex gap-4 text-sm">
                  <span className={`font-bold capitalize ${getRarityColor(selectedCollectible.rarity)}`}>
                    {selectedCollectible.rarity}
                  </span>
                  <span className="text-gray-500">
                    Found in Level {selectedCollectible.levelFound}
                  </span>
                  {selectedCollectible.hidden && (
                    <span className="text-yellow-500">Hidden Collectible</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-black bg-opacity-50 rounded p-4 mb-4">
              <div className="text-gray-300 whitespace-pre-line leading-relaxed">
                {selectedCollectible.content}
              </div>
            </div>

            <button
              onClick={() => setSelectedCollectible(null)}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CollectiblesLibrary;
