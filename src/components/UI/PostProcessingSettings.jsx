/**
 * Post-Processing Settings Component
 * UI for adjusting visual post-processing effects
 */

import React, { useState, useEffect } from 'react';
import { getPostProcessingSystem } from '../../systems/PostProcessingSystem.js';

export function PostProcessingSettings() {
  const [postProcessing, setPostProcessing] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    try {
      const system = getPostProcessingSystem();
      if (system) {
        setPostProcessing(system);
        setSettings(system.getAllSettings());
      }
    } catch (error) {
      console.error('[PostProcessingSettings] Failed to load system:', error);
    }
  }, []);

  const handleBloomToggle = () => {
    if (!postProcessing) return;
    const newEnabled = !settings.bloom.enabled;
    postProcessing.updateSettings('bloom', { enabled: newEnabled });
    setSettings(postProcessing.getAllSettings());
  };

  const handleBloomStrength = (value) => {
    if (!postProcessing) return;
    postProcessing.updateSettings('bloom', { strength: parseFloat(value) });
    setSettings(postProcessing.getAllSettings());
  };

  const handleBloomRadius = (value) => {
    if (!postProcessing) return;
    postProcessing.updateSettings('bloom', { radius: parseFloat(value) });
    setSettings(postProcessing.getAllSettings());
  };

  const handleBloomThreshold = (value) => {
    if (!postProcessing) return;
    postProcessing.updateSettings('bloom', { threshold: parseFloat(value) });
    setSettings(postProcessing.getAllSettings());
  };

  const handleVignetteToggle = () => {
    if (!postProcessing) return;
    const newEnabled = !settings.vignette.enabled;
    postProcessing.updateSettings('vignette', { enabled: newEnabled });
    setSettings(postProcessing.getAllSettings());
  };

  const handleVignetteDarkness = (value) => {
    if (!postProcessing) return;
    postProcessing.updateSettings('vignette', { darkness: parseFloat(value) });
    setSettings(postProcessing.getAllSettings());
  };

  const handleVignetteOffset = (value) => {
    if (!postProcessing) return;
    postProcessing.updateSettings('vignette', { offset: parseFloat(value) });
    setSettings(postProcessing.getAllSettings());
  };

  const handleMotionBlurToggle = () => {
    if (!postProcessing) return;
    const newEnabled = !settings.motionBlur.enabled;
    postProcessing.updateSettings('motionBlur', { enabled: newEnabled });
    setSettings(postProcessing.getAllSettings());
  };

  const handleMotionBlurAmount = (value) => {
    if (!postProcessing) return;
    postProcessing.updateSettings('motionBlur', { amount: parseFloat(value) });
    setSettings(postProcessing.getAllSettings());
  };

  const handleChromaticToggle = () => {
    if (!postProcessing) return;
    const newEnabled = !settings.chromaticAberration.enabled;
    postProcessing.updateSettings('chromaticAberration', { enabled: newEnabled });
    setSettings(postProcessing.getAllSettings());
  };

  const handleChromaticAmount = (value) => {
    if (!postProcessing) return;
    postProcessing.updateSettings('chromaticAberration', { amount: parseFloat(value) });
    setSettings(postProcessing.getAllSettings());
  };

  const handleResetDefaults = () => {
    if (!postProcessing) return;
    if (confirm('Reset all post-processing settings to defaults?')) {
      postProcessing.resetToDefaults();
      setSettings(postProcessing.getAllSettings());
    }
  };

  if (!postProcessing || !settings) {
    return (
      <div className="text-white text-center py-8">
        Post-processing not available
      </div>
    );
  }

  return (
    <div className="text-white p-6 max-h-screen overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Post-Processing Effects</h2>
        <p className="text-gray-300">
          Adjust visual effects for enhanced graphics
        </p>
      </div>

      {/* Bloom Settings */}
      <div className="bg-blue-900 bg-opacity-50 rounded-lg p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Bloom</h3>
          <button
            onClick={handleBloomToggle}
            className={`px-4 py-2 rounded font-bold transition-colors ${
              settings.bloom.enabled
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {settings.bloom.enabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {settings.bloom.enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">
                Strength: {settings.bloom.strength.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={settings.bloom.strength}
                onChange={(e) => handleBloomStrength(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">
                Radius: {settings.bloom.radius.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.bloom.radius}
                onChange={(e) => handleBloomRadius(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">
                Threshold: {settings.bloom.threshold.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.bloom.threshold}
                onChange={(e) => handleBloomThreshold(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        )}

        <p className="text-sm text-gray-400 mt-4">
          Creates a glowing effect around bright areas
        </p>
      </div>

      {/* Vignette Settings */}
      <div className="bg-purple-900 bg-opacity-50 rounded-lg p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Vignette</h3>
          <button
            onClick={handleVignetteToggle}
            className={`px-4 py-2 rounded font-bold transition-colors ${
              settings.vignette.enabled
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {settings.vignette.enabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {settings.vignette.enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">
                Darkness: {settings.vignette.darkness.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={settings.vignette.darkness}
                onChange={(e) => handleVignetteDarkness(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">
                Offset: {settings.vignette.offset.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.vignette.offset}
                onChange={(e) => handleVignetteOffset(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        )}

        <p className="text-sm text-gray-400 mt-4">
          Darkens the edges of the screen for focus
        </p>
      </div>

      {/* Motion Blur Settings */}
      <div className="bg-indigo-900 bg-opacity-50 rounded-lg p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Motion Blur</h3>
          <button
            onClick={handleMotionBlurToggle}
            className={`px-4 py-2 rounded font-bold transition-colors ${
              settings.motionBlur.enabled
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {settings.motionBlur.enabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {settings.motionBlur.enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">
                Amount: {settings.motionBlur.amount.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="0.9"
                step="0.05"
                value={settings.motionBlur.amount}
                onChange={(e) => handleMotionBlurAmount(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        )}

        <p className="text-sm text-gray-400 mt-4">
          Adds blur during fast camera movement (may impact performance)
        </p>
      </div>

      {/* Chromatic Aberration Settings */}
      <div className="bg-pink-900 bg-opacity-50 rounded-lg p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Chromatic Aberration</h3>
          <button
            onClick={handleChromaticToggle}
            className={`px-4 py-2 rounded font-bold transition-colors ${
              settings.chromaticAberration.enabled
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {settings.chromaticAberration.enabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {settings.chromaticAberration.enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">
                Amount: {settings.chromaticAberration.amount.toFixed(4)}
              </label>
              <input
                type="range"
                min="0"
                max="0.02"
                step="0.001"
                value={settings.chromaticAberration.amount}
                onChange={(e) => handleChromaticAmount(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        )}

        <p className="text-sm text-gray-400 mt-4">
          Separates RGB colors at screen edges for a lens distortion effect
        </p>
      </div>

      {/* Reset Button */}
      <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
        <button
          onClick={handleResetDefaults}
          className="w-full px-4 py-3 rounded font-bold bg-orange-600 hover:bg-orange-700 transition-colors"
        >
          Reset to Defaults
        </button>
      </div>

      {/* Performance Warning */}
      <div className="mt-4 p-4 bg-yellow-900 bg-opacity-30 rounded border border-yellow-600">
        <p className="text-sm text-yellow-200">
          <strong>Note:</strong> Some effects (especially motion blur) may impact performance on lower-end devices.
        </p>
      </div>
    </div>
  );
}

export default PostProcessingSettings;
