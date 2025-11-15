import React, { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext.jsx';
import HealthBar from './HealthBar.jsx';
import ScoreDisplay from './ScoreDisplay.jsx';
import ComboDisplay from './ComboDisplay.jsx';
import AmmoCounter from './AmmoCounter.jsx';
import PuzzleDisplay from './PuzzleDisplay.jsx';
import HitMarker from './HitMarker.jsx';
import NotificationDisplay from './NotificationDisplay.jsx';
import BossHealthBar from './BossHealthBar.jsx';

const HUD = () => {
  const { state } = useGame();
  const [bossData, setBossData] = useState(null);

  // Listen for boss health updates
  useEffect(() => {
    const handleBossUpdate = (event) => {
      setBossData(event.detail);
    };

    window.addEventListener('bossHealthUpdate', handleBossUpdate);
    return () => window.removeEventListener('bossHealthUpdate', handleBossUpdate);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Boss Health Bar */}
      {bossData && bossData.health > 0 && (
        <BossHealthBar
          bossName={bossData.name || 'Boss'}
          currentHealth={bossData.health}
          maxHealth={bossData.maxHealth}
          phase={bossData.phase || 1}
        />
      )}

      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        <div className="pointer-events-auto">
          <HealthBar health={state.player.health} maxHealth={state.player.maxHealth} />
        </div>
        <div className="pointer-events-auto">
          <ScoreDisplay
            score={state.player.score}
            accuracy={state.player.accuracy}
            level={state.currentLevel}
          />
        </div>
      </div>

      {/* Combo Display */}
      <ComboDisplay />

      {/* Ammo Counter */}
      <AmmoCounter />

      {/* Puzzle Display */}
      <PuzzleDisplay />

      {/* Hit Marker */}
      <HitMarker />

      {/* Notification Display */}
      <NotificationDisplay />

      {/* Bottom HUD */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
        {/* Weapon info now handled by WeaponController in GameCanvas */}

        {/* Crosshair */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            <div className="w-6 h-6 border-2 border-white rounded-full opacity-75">
              <div className="absolute top-1/2 left-1/2 w-2 h-0.5 bg-white transform -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-1/2 w-0.5 h-2 bg-white transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>
        </div>

        {/* Level progress */}
        <div className="bg-black bg-opacity-50 text-white p-2 rounded">
          <div className="text-sm">Progress</div>
          <div className="w-32 h-2 bg-gray-600 rounded overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${state.levelProgress || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Item notification overlay */}
      {state.ui.itemNotification && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-bold text-xl animate-pulse">
            {state.ui.itemNotification}
          </div>
        </div>
      )}
    </div>
  );
};

export default HUD;