import React from 'react';
import { useSettings } from '../../contexts/SettingsContext.jsx';
import { useGame } from '../../contexts/GameContext.jsx';
import { GameStates } from '../../types/game.js';

const Settings = () => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const context = useGame();
  
  // Add error checking
  if (!context) {
    console.error('Settings: GameContext not found');
    return <div className="text-white">Loading settings...</div>;
  }
  
  const { goToMenu, setGameState } = context;

  const handleGoBack = () => {
    if (typeof goToMenu === 'function') {
      goToMenu();
    } else if (typeof setGameState === 'function') {
      setGameState(GameStates.MENU);
    } else {
      console.error('goBack functions not available');
    }
  };

  const handleSliderChange = (category, key, value) => {
    updateSettings(category, { [key]: value });
  };

  const handleSelectChange = (category, key, value) => {
    updateSettings(category, { [key]: value });
  };

  const handleToggleChange = (category, key) => {
    updateSettings(category, { [key]: !settings[category][key] });
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Settings</h1>
          <button
            onClick={handleGoBack}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded transition-colors"
          >
            Back
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Graphics Settings */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Graphics</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Quality</label>
                <select
                  value={settings.graphics.quality}
                  onChange={(e) => handleSelectChange('graphics', 'quality', e.target.value)}
                  className="w-full bg-gray-700 text-white p-2 rounded"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white">Shadows</span>
                <input
                  type="checkbox"
                  checked={settings.graphics.shadows}
                  onChange={() => handleToggleChange('graphics', 'shadows')}
                  className="scale-150"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white">Particles</span>
                <input
                  type="checkbox"
                  checked={settings.graphics.particles}
                  onChange={() => handleToggleChange('graphics', 'particles')}
                  className="scale-150"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white">Anti-Aliasing</span>
                <input
                  type="checkbox"
                  checked={settings.graphics.antiAliasing}
                  onChange={() => handleToggleChange('graphics', 'antiAliasing')}
                  className="scale-150"
                />
              </div>
            </div>
          </div>

          {/* Audio Settings */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Audio</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">
                  Master Volume: {Math.round(settings.audio.masterVolume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.audio.masterVolume}
                  onChange={(e) => handleSliderChange('audio', 'masterVolume', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-white mb-2">
                  SFX Volume: {Math.round(settings.audio.sfxVolume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.audio.sfxVolume}
                  onChange={(e) => handleSliderChange('audio', 'sfxVolume', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-white mb-2">
                  Music Volume: {Math.round(settings.audio.musicVolume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.audio.musicVolume}
                  onChange={(e) => handleSliderChange('audio', 'musicVolume', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Controls Settings */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Controls</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">
                  Mouse Sensitivity: {settings.controls.mouseSensitivity.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={settings.controls.mouseSensitivity}
                  onChange={(e) => handleSliderChange('controls', 'mouseSensitivity', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white">Invert Y-Axis</span>
                <input
                  type="checkbox"
                  checked={settings.controls.invertY}
                  onChange={() => handleToggleChange('controls', 'invertY')}
                  className="scale-150"
                />
              </div>
            </div>
          </div>

          {/* Gameplay Settings */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Gameplay</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Difficulty</label>
                <select
                  value={settings.gameplay.difficulty}
                  onChange={(e) => handleSelectChange('gameplay', 'difficulty', e.target.value)}
                  className="w-full bg-gray-700 text-white p-2 rounded"
                >
                  <option value="easy">Easy</option>
                  <option value="normal">Normal</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white">Show Crosshair</span>
                <input
                  type="checkbox"
                  checked={settings.gameplay.showCrosshair}
                  onChange={() => handleToggleChange('gameplay', 'showCrosshair')}
                  className="scale-150"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white">Hit Markers</span>
                <input
                  type="checkbox"
                  checked={settings.gameplay.showHitMarkers}
                  onChange={() => handleToggleChange('gameplay', 'showHitMarkers')}
                  className="scale-150"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white">Camera Shake</span>
                <input
                  type="checkbox"
                  checked={settings.gameplay.cameraShake}
                  onChange={() => handleToggleChange('gameplay', 'cameraShake')}
                  className="scale-150"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => resetSettings()}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded transition-colors"
          >
            Reset All Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;