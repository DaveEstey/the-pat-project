/**
 * Boss Health Bar Component
 * Displays boss health with phase indicators and animations
 * Integrated with MultiphaseBossSystem
 */

import React, { useState, useEffect } from 'react';
import { BossPhase } from '../../systems/MultiphaseBossSystem.js';

export function BossHealthBar() {
  const [bossData, setBossData] = useState(null);
  const [phaseTransition, setPhaseTransition] = useState(false);

  useEffect(() => {
    const handleBossSpawned = (event) => {
      const { bossId, bossType, name, maxHealth } = event.detail;
      setBossData({
        bossId,
        bossType,
        name,
        health: maxHealth,
        maxHealth,
        healthPercent: 100,
        phase: BossPhase.PHASE_1
      });
    };

    const handleBossDamaged = (event) => {
      const { health, maxHealth, healthPercent } = event.detail;
      setBossData(prev => ({
        ...prev,
        health,
        maxHealth,
        healthPercent: healthPercent * 100
      }));
    };

    const handlePhaseTransition = (event) => {
      const { phase } = event.detail;
      setBossData(prev => ({
        ...prev,
        phase
      }));

      // Show transition animation
      setPhaseTransition(true);
      setTimeout(() => setPhaseTransition(false), 2000);
    };

    const handleBossDefeated = () => {
      // Animate health bar disappearing
      setTimeout(() => {
        setBossData(null);
      }, 3000);
    };

    window.addEventListener('bossSpawned', handleBossSpawned);
    window.addEventListener('bossDamaged', handleBossDamaged);
    window.addEventListener('bossPhaseTransition', handlePhaseTransition);
    window.addEventListener('bossDefeated', handleBossDefeated);

    return () => {
      window.removeEventListener('bossSpawned', handleBossSpawned);
      window.removeEventListener('bossDamaged', handleBossDamaged);
      window.removeEventListener('bossPhaseTransition', handlePhaseTransition);
      window.removeEventListener('bossDefeated', handleBossDefeated);
    };
  }, []);

  if (!bossData) return null;

  // Determine phase color
  const getPhaseColor = () => {
    switch (bossData.phase) {
      case BossPhase.PHASE_1:
        return { bg: 'bg-green-600', border: 'border-green-400', glow: 'shadow-green-500' };
      case BossPhase.PHASE_2:
        return { bg: 'bg-yellow-600', border: 'border-yellow-400', glow: 'shadow-yellow-500' };
      case BossPhase.PHASE_3:
        return { bg: 'bg-orange-600', border: 'border-orange-400', glow: 'shadow-orange-500' };
      case BossPhase.FINAL_PHASE:
        return { bg: 'bg-red-600', border: 'border-red-400', glow: 'shadow-red-500' };
      default:
        return { bg: 'bg-gray-600', border: 'border-gray-400', glow: 'shadow-gray-500' };
    }
  };

  const phaseColor = getPhaseColor();

  // Get phase name
  const getPhaseName = () => {
    switch (bossData.phase) {
      case BossPhase.PHASE_1:
        return 'PHASE 1';
      case BossPhase.PHASE_2:
        return 'PHASE 2';
      case BossPhase.PHASE_3:
        return 'PHASE 3';
      case BossPhase.FINAL_PHASE:
        return 'FINAL PHASE';
      default:
        return 'BOSS';
    }
  };

  return (
    <>
      {/* Boss Health Bar */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-2/3 max-w-3xl pointer-events-auto z-40">
        <div className={`bg-black bg-opacity-90 rounded-lg p-4 border-2 ${phaseColor.border} shadow-2xl ${phaseColor.glow}/50`}>
          {/* Boss Name and Phase */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3">
              <span className="text-red-500 text-2xl">💀</span>
              <span className="text-white font-bold text-xl">{bossData.name}</span>
            </div>

            <div className={`${phaseColor.bg} px-3 py-1 rounded text-white font-bold text-sm ${phaseTransition ? 'animate-pulse scale-110' : ''}`}>
              {getPhaseName()}
            </div>
          </div>

          {/* Health Bar Container */}
          <div className="relative w-full h-8 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700">
            {/* Health Fill */}
            <div
              className={`absolute top-0 left-0 h-full ${phaseColor.bg} transition-all duration-300 ease-out`}
              style={{ width: `${bossData.healthPercent}%` }}
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer"></div>
            </div>

            {/* Phase Markers */}
            <div className="absolute inset-0 flex">
              {[66, 33].map((threshold, index) => (
                <div
                  key={index}
                  className="absolute h-full border-r-2 border-gray-900"
                  style={{ left: `${threshold}%` }}
                >
                  <div className="absolute top-0 left-0 transform -translate-x-1/2 w-1 h-full bg-gray-900"></div>
                </div>
              ))}
            </div>

            {/* Health Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-sm drop-shadow-lg">
                {Math.ceil(bossData.health)} / {bossData.maxHealth}
              </span>
            </div>
          </div>

          {/* Phase Transition Warning */}
          {phaseTransition && (
            <div className="mt-2 text-center">
              <span className="text-red-500 font-bold text-lg animate-pulse">
                ⚠️ PHASE SHIFT ⚠️
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Phase Transition Full Screen Effect */}
      {phaseTransition && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 animate-fade-in">
          <div className="bg-black bg-opacity-70 absolute inset-0"></div>
          <div className="relative">
            <h1 className={`text-6xl font-bold ${phaseColor.border.replace('border-', 'text-')} animate-pulse drop-shadow-2xl`}>
              {getPhaseName()}
            </h1>
            <p className="text-white text-2xl text-center mt-4">
              {bossData.name} enters a new phase!
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default BossHealthBar;
