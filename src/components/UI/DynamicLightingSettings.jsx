/**
 * Dynamic Lighting Settings Component
 * UI for managing dynamic lighting preferences
 */

import React, { useState, useEffect } from 'react';
import { getDynamicLightingSystem } from '../../systems/DynamicLightingSystem.js';

export function DynamicLightingSettings() {
  const [lightingSystem, setLightingSystem] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    try {
      const system = getDynamicLightingSystem();
      if (system) {
        setLightingSystem(system);
        setSettings(system.getSettings());
      }
    } catch (error) {
      console.error('[DynamicLightingSettings] Failed to load system:', error);
    }
  }, []);

  // Update settings display periodically
  useEffect(() => {
    if (!lightingSystem) return;

    const interval = setInterval(() => {
      setSettings(lightingSystem.getSettings());
    }, 1000);

    return () => clearInterval(interval);
  }, [lightingSystem]);

  const handleToggle = () => {
    if (!lightingSystem) return;
    const newEnabled = !settings.enabled;
    lightingSystem.setEnabled(newEnabled);
    setSettings(lightingSystem.getSettings());
  };

  const handleIntensity = (value) => {
    if (!lightingSystem) return;
    lightingSystem.setIntensity(parseFloat(value));
    setSettings(lightingSystem.getSettings());
  };

  if (!lightingSystem || !settings) {
    return (
      <div className="text-white text-center py-8">
        Dynamic lighting not available
      </div>
    );
  }

  return (
    <div className="text-white p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Dynamic Lighting</h2>
        <p className="text-gray-300">
          Control dynamic lights for muzzle flashes, explosions, and effects
        </p>
      </div>

      {/* Enable/Disable */}
      <div className="bg-blue-900 bg-opacity-50 rounded-lg p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold">Dynamic Lighting</h3>
            <p className="text-sm text-gray-300 mt-1">
              Enable dynamic lights for weapons and explosions
            </p>
          </div>
          <button
            onClick={handleToggle}
            className={`px-4 py-2 rounded font-bold transition-colors ${
              settings.enabled
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {settings.enabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {/* Statistics */}
        {settings.enabled && (
          <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-black bg-opacity-30 rounded">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {settings.activeLightCount}
              </div>
              <div className="text-sm text-gray-400">Active Lights</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {settings.maxLights}
              </div>
              <div className="text-sm text-gray-400">Max Lights</div>
            </div>
          </div>
        )}
      </div>

      {/* Intensity Slider */}
      {settings.enabled && (
        <div className="bg-purple-900 bg-opacity-50 rounded-lg p-6 mb-4">
          <h3 className="text-xl font-bold mb-4">Light Intensity</h3>
          <div>
            <label className="block text-sm mb-2">
              Intensity Multiplier: {settings.intensity.toFixed(2)}x
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.intensity}
              onChange={(e) => handleIntensity(e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0x (Off)</span>
              <span>1x (Normal)</span>
              <span>2x (Bright)</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Adjust the brightness of all dynamic lights
          </p>
        </div>
      )}

      {/* Effect Types */}
      {settings.enabled && (
        <div className="bg-indigo-900 bg-opacity-50 rounded-lg p-6 mb-4">
          <h3 className="text-xl font-bold mb-4">Light Effects</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-black bg-opacity-30 rounded">
              <div className="w-4 h-4 rounded-full bg-yellow-300 shadow-lg shadow-yellow-500"></div>
              <div className="flex-1">
                <div className="font-semibold">Muzzle Flash</div>
                <div className="text-sm text-gray-400">Brief bright light when weapons fire</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-black bg-opacity-30 rounded">
              <div className="w-4 h-4 rounded-full bg-orange-500 shadow-lg shadow-orange-600"></div>
              <div className="flex-1">
                <div className="font-semibold">Explosions</div>
                <div className="text-sm text-gray-400">Large flickering light for explosions</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-black bg-opacity-30 rounded">
              <div className="w-4 h-4 rounded-full bg-red-500 shadow-lg shadow-red-600"></div>
              <div className="flex-1">
                <div className="font-semibold">Fire</div>
                <div className="text-sm text-gray-400">Flickering light for fire effects</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-black bg-opacity-30 rounded">
              <div className="w-4 h-4 rounded-full bg-blue-400 shadow-lg shadow-blue-500"></div>
              <div className="flex-1">
                <div className="font-semibold">Sparks</div>
                <div className="text-sm text-gray-400">Small rapid flickering for metal impacts</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-black bg-opacity-30 rounded">
              <div className="w-4 h-4 rounded-full bg-green-400 shadow-lg shadow-green-500"></div>
              <div className="flex-1">
                <div className="font-semibold">Power-Ups & Heals</div>
                <div className="text-sm text-gray-400">Colored lights for pickups and healing</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Info */}
      <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-3">Performance</h3>
        <p className="text-sm text-gray-300 mb-3">
          Dynamic lighting can impact performance on lower-end devices. If you experience frame rate issues, try:
        </p>
        <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
          <li>Reducing light intensity</li>
          <li>Disabling dynamic lighting entirely</li>
          <li>Lowering other graphics settings</li>
        </ul>
        {settings.enabled && settings.activeLightCount > 15 && (
          <div className="mt-4 p-3 bg-yellow-900 bg-opacity-30 rounded border border-yellow-600">
            <p className="text-sm text-yellow-200">
              <strong>Warning:</strong> High number of active lights ({settings.activeLightCount})
              may impact performance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DynamicLightingSettings;
