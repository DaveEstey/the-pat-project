/**
 * Tutorial Settings Component
 * Allows players to manage tutorial preferences
 */

import React, { useState, useEffect } from 'react';
import { getTutorialSystem } from '../../systems/TutorialSystem.js';

export function TutorialSettings() {
  const [tutorialSystem, setTutorialSystem] = useState(null);
  const [enabled, setEnabled] = useState(true);
  const [skipAll, setSkipAll] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [allTutorials, setAllTutorials] = useState([]);

  useEffect(() => {
    try {
      const system = getTutorialSystem();
      setTutorialSystem(system);
      setEnabled(system.isEnabled());
      setSkipAll(system.skipAllTutorials);
      setStatistics(system.getStatistics());
      setAllTutorials(system.getAllTutorials());
    } catch (error) {
      console.error('[TutorialSettings] Failed to load tutorial system:', error);
    }
  }, []);

  const handleToggleEnabled = () => {
    if (!tutorialSystem) return;
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    tutorialSystem.setEnabled(newEnabled);
    setStatistics(tutorialSystem.getStatistics());
  };

  const handleToggleSkipAll = () => {
    if (!tutorialSystem) return;
    const newSkipAll = !skipAll;
    setSkipAll(newSkipAll);
    tutorialSystem.setSkipAll(newSkipAll);
    setStatistics(tutorialSystem.getStatistics());
  };

  const handleResetAll = () => {
    if (!tutorialSystem) return;
    if (confirm('Are you sure you want to reset all tutorials? This will allow you to see them again.')) {
      tutorialSystem.resetAllTutorials();
      setAllTutorials(tutorialSystem.getAllTutorials());
      setStatistics(tutorialSystem.getStatistics());
    }
  };

  const handleResetTutorial = (stepId) => {
    if (!tutorialSystem) return;
    tutorialSystem.resetTutorial(stepId);
    setAllTutorials(tutorialSystem.getAllTutorials());
    setStatistics(tutorialSystem.getStatistics());
  };

  if (!tutorialSystem || !statistics) {
    return (
      <div className="text-white text-center py-8">
        Loading tutorial settings...
      </div>
    );
  }

  return (
    <div className="text-white p-6 max-h-screen overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Tutorial Settings</h2>
        <p className="text-gray-300">
          Manage your tutorial preferences and view progress
        </p>
      </div>

      {/* Statistics */}
      <div className="bg-blue-900 bg-opacity-50 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{statistics.completed}</div>
            <div className="text-sm text-gray-300">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">{statistics.remaining}</div>
            <div className="text-sm text-gray-300">Remaining</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{statistics.total}</div>
            <div className="text-sm text-gray-300">Total</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">{statistics.percentage}%</div>
            <div className="text-sm text-gray-300">Progress</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-500 h-full transition-all duration-500"
            style={{ width: `${statistics.percentage}%` }}
          />
        </div>
      </div>

      {/* Settings */}
      <div className="bg-purple-900 bg-opacity-50 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">Settings</h3>

        {/* Enable/Disable Tutorials */}
        <div className="flex items-center justify-between mb-4 p-4 bg-black bg-opacity-30 rounded">
          <div>
            <div className="font-semibold">Enable Tutorials</div>
            <div className="text-sm text-gray-300">
              Show tutorial tips during gameplay
            </div>
          </div>
          <button
            onClick={handleToggleEnabled}
            className={`px-4 py-2 rounded font-bold transition-colors ${
              enabled
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {enabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {/* Skip All Tutorials */}
        <div className="flex items-center justify-between mb-4 p-4 bg-black bg-opacity-30 rounded">
          <div>
            <div className="font-semibold">Skip All Tutorials</div>
            <div className="text-sm text-gray-300">
              Don't show any tutorials (for experienced players)
            </div>
          </div>
          <button
            onClick={handleToggleSkipAll}
            className={`px-4 py-2 rounded font-bold transition-colors ${
              skipAll
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {skipAll ? 'Skipping All' : 'Normal'}
          </button>
        </div>

        {/* Reset All */}
        <div className="flex items-center justify-between p-4 bg-black bg-opacity-30 rounded">
          <div>
            <div className="font-semibold">Reset All Tutorials</div>
            <div className="text-sm text-gray-300">
              Mark all tutorials as not completed
            </div>
          </div>
          <button
            onClick={handleResetAll}
            className="px-4 py-2 rounded font-bold bg-orange-600 hover:bg-orange-700 transition-colors"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Tutorial List */}
      <div className="bg-indigo-900 bg-opacity-50 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">All Tutorials</h3>
        <div className="space-y-2">
          {allTutorials.map((tutorial) => (
            <div
              key={tutorial.id}
              className={`flex items-center justify-between p-3 rounded transition-colors ${
                tutorial.completed
                  ? 'bg-green-900 bg-opacity-30'
                  : 'bg-gray-800 bg-opacity-30'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl">{tutorial.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold flex items-center gap-2">
                    {tutorial.title}
                    {tutorial.completed && (
                      <span className="text-green-400 text-sm">✓ Completed</span>
                    )}
                    {tutorial.active && (
                      <span className="text-yellow-400 text-sm">● Active</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-300">
                    {tutorial.description}
                  </div>
                </div>
              </div>
              {tutorial.completed && (
                <button
                  onClick={() => handleResetTutorial(tutorial.id)}
                  className="px-3 py-1 text-sm rounded bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TutorialSettings;
