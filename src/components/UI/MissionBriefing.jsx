/**
 * Mission Briefing Component
 * Displays mission information, objectives, and story context
 */

import React, { useState, useEffect } from 'react';
import { getMissionBriefingSystem } from '../../systems/MissionBriefingSystem.js';

export function MissionBriefing({ missionId, onStart, onCancel }) {
  const [briefingSystem, setBriefingSystem] = useState(null);
  const [mission, setMission] = useState(null);
  const [stats, setStats] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const system = getMissionBriefingSystem();
    setBriefingSystem(system);

    if (system && missionId) {
      const missionData = system.getMission(missionId);
      setMission(missionData);
      setStats(system.getMissionStats(missionId));
      setIsCompleted(system.isMissionCompleted(missionId));
    }
  }, [missionId]);

  const handleStart = () => {
    if (briefingSystem && mission) {
      briefingSystem.startMission(mission.id);
      if (onStart) onStart(mission);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-orange-400';
      case 'extreme': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-600';
      case 'medium': return 'bg-yellow-600';
      case 'hard': return 'bg-orange-600';
      case 'extreme': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  if (!mission) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-white text-xl">Loading mission briefing...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="max-w-4xl w-full bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg shadow-2xl border-2 border-blue-400 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-800 bg-opacity-70 p-6 border-b-2 border-blue-600">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-white">{mission.title}</h1>
                {isCompleted && (
                  <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold">
                    ✓ Completed
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-lg">
                <span className="text-blue-300">📍 {mission.location}</span>
                <span className={`font-bold ${getDifficultyColor(mission.difficulty)}`}>
                  {mission.difficulty.toUpperCase()}
                </span>
                <span className="text-gray-300">⏱️ {mission.estimatedTime}</span>
              </div>
            </div>
            <span className={`px-4 py-2 rounded ${getDifficultyBadge(mission.difficulty)} text-white font-bold text-lg`}>
              Mission {mission.id}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Story Context */}
          <div className="bg-black bg-opacity-40 rounded-lg p-6 border border-blue-700">
            <h2 className="text-2xl font-bold text-blue-300 mb-3">📖 Story Context</h2>
            <p className="text-white text-lg leading-relaxed italic">
              "{mission.storyContext}"
            </p>
          </div>

          {/* Mission Briefing */}
          <div className="bg-black bg-opacity-40 rounded-lg p-6 border border-purple-700">
            <h2 className="text-2xl font-bold text-purple-300 mb-3">📋 Mission Briefing</h2>
            <p className="text-white text-lg leading-relaxed">
              {mission.briefing}
            </p>
          </div>

          {/* Objectives */}
          <div className="bg-black bg-opacity-40 rounded-lg p-6 border border-green-700">
            <h2 className="text-2xl font-bold text-green-300 mb-4">🎯 Objectives</h2>
            <ul className="space-y-2">
              {mission.objectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-3 text-white text-lg">
                  <span className="text-green-400 font-bold mt-1">▸</span>
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Enemy Intel */}
          <div className="bg-black bg-opacity-40 rounded-lg p-6 border border-red-700">
            <h2 className="text-2xl font-bold text-red-300 mb-4">⚠️ Enemy Intel</h2>
            <div className="flex flex-wrap gap-2">
              {mission.enemyTypes.map((enemy, index) => (
                <span key={index} className="px-4 py-2 bg-red-900 bg-opacity-50 rounded-full text-white border border-red-600">
                  {enemy}
                </span>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-black bg-opacity-40 rounded-lg p-6 border border-yellow-700">
            <h2 className="text-2xl font-bold text-yellow-300 mb-4">💡 Mission Tips</h2>
            <ul className="space-y-2">
              {mission.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3 text-white">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Rewards */}
          <div className="bg-black bg-opacity-40 rounded-lg p-6 border border-yellow-600">
            <h2 className="text-2xl font-bold text-yellow-300 mb-4">🏆 Rewards</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-yellow-900 bg-opacity-30 rounded">
                <div className="text-3xl mb-2">💰</div>
                <div className="text-2xl font-bold text-yellow-400">{mission.rewards.credits}</div>
                <div className="text-sm text-gray-300">Credits</div>
              </div>
              <div className="text-center p-4 bg-blue-900 bg-opacity-30 rounded">
                <div className="text-3xl mb-2">💎</div>
                <div className="text-2xl font-bold text-blue-400">{mission.rewards.gems}</div>
                <div className="text-sm text-gray-300">Gems</div>
              </div>
              <div className="text-center p-4 bg-gray-900 bg-opacity-30 rounded">
                <div className="text-3xl mb-2">🔩</div>
                <div className="text-2xl font-bold text-gray-400">{mission.rewards.scrap}</div>
                <div className="text-sm text-gray-300">Scrap</div>
              </div>
            </div>
            {mission.rewards.multiplier && (
              <p className="text-center text-gray-300 mt-3 text-sm">
                * Rewards {mission.rewards.multiplier}
              </p>
            )}
          </div>

          {/* Mission Statistics (if completed before) */}
          {stats && stats.attempts > 0 && (
            <div className="bg-black bg-opacity-40 rounded-lg p-6 border border-cyan-700">
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">📊 Your Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{stats.attempts}</div>
                  <div className="text-sm text-gray-300">Attempts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{stats.completions}</div>
                  <div className="text-sm text-gray-300">Completions</div>
                </div>
                {stats.bestTime && (
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">
                      {Math.floor(stats.bestTime / 60)}:{(stats.bestTime % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-sm text-gray-300">Best Time</div>
                  </div>
                )}
                <div>
                  <div className="text-2xl font-bold text-purple-400">{stats.bestScore.toLocaleString()}</div>
                  <div className="text-sm text-gray-300">Best Score</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-blue-800 bg-opacity-70 p-6 border-t-2 border-blue-600 flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-4 bg-gray-600 hover:bg-gray-700 text-white text-xl font-bold rounded-lg transition-colors"
          >
            Back to Menu
          </button>
          <button
            onClick={handleStart}
            className="flex-1 px-6 py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-lg transition-colors transform hover:scale-105 shadow-lg"
          >
            {isCompleted ? 'Replay Mission' : 'Start Mission'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MissionBriefing;
