import React, { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext.jsx';
import { UI_ZONES, Z_LAYERS, getUIClasses } from './UILayout.jsx';
import HealthBar from './HealthBar.jsx';
import ScoreDisplay from './ScoreDisplay.jsx';
import ComboDisplay from './ComboDisplay.jsx';
import AmmoCounter from './AmmoCounter.jsx';
import PuzzleDisplay from './PuzzleDisplay.jsx';
import HitMarker from './HitMarker.jsx';
import NotificationDisplay from './NotificationDisplay.jsx';
import BossHealthBar from './BossHealthBar.jsx';
import LowAmmoWarning from './LowAmmoWarning.jsx';

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
      {/* Boss Health Bar - Top Center */}
      {bossData && bossData.health > 0 && (
        <div className={getUIClasses(UI_ZONES.BOSS_HEALTH, Z_LAYERS.HUD_BASE)}>
          <BossHealthBar
            bossName={bossData.name || 'Boss'}
            currentHealth={bossData.health}
            maxHealth={bossData.maxHealth}
            phase={bossData.phase || 1}
          />
        </div>
      )}

      {/* Top Left: Health Bar */}
      <div className={getUIClasses(UI_ZONES.TOP_LEFT, Z_LAYERS.HUD_BASE, 'pointer-events-auto')}>
        <HealthBar health={state.player.health} maxHealth={state.player.maxHealth} />
      </div>

      {/* Top Right Stack: Score + Combo (prevents overlap) */}
      <div className={getUIClasses(UI_ZONES.TOP_RIGHT_STACK, Z_LAYERS.HUD_BASE)}>
        <div className="pointer-events-auto">
          <ScoreDisplay
            score={state.player.score}
            accuracy={state.player.accuracy}
            level={state.currentLevel}
          />
        </div>
        {/* Combo Display will render here when active */}
        <ComboDisplay />
      </div>

      {/* Middle Left: Puzzle Display (moved from bottom to avoid overlap) */}
      <PuzzleDisplay />

      {/* Bottom Right: Ammo Counter */}
      <AmmoCounter />

      {/* Center: Crosshair */}
      <div className={getUIClasses(UI_ZONES.CENTER, Z_LAYERS.HUD_BASE)}>
        <div className="w-6 h-6 border-2 border-white rounded-full opacity-75">
          <div className="absolute top-1/2 left-1/2 w-2 h-0.5 bg-white transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-0.5 h-2 bg-white transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>

      {/* Bottom Center: Level Progress */}
      <div className={getUIClasses(UI_ZONES.BOTTOM_CENTER, Z_LAYERS.HUD_BASE)}>
        <div className="bg-black bg-opacity-50 text-white p-2 rounded pointer-events-auto">
          <div className="text-sm">Progress</div>
          <div className="w-32 h-2 bg-gray-600 rounded overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${state.levelProgress || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Hit Marker */}
      <HitMarker />

      {/* Low Ammo Warning */}
      <LowAmmoWarning />

      {/* Notifications - Above center (doesn't block crosshair) */}
      <NotificationDisplay />

      {/* Item notification overlay */}
      {state.ui.itemNotification && (
        <div className={getUIClasses(UI_ZONES.NOTIFICATION_STACK, Z_LAYERS.NOTIFICATIONS)}>
          <div className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-bold text-xl animate-pulse">
            {state.ui.itemNotification}
          </div>
        </div>
      )}
    </div>
  );
};

export default HUD;