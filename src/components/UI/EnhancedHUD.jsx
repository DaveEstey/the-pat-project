/**
 * Enhanced HUD Component
 * Minimap, objective tracker, and comprehensive game info
 */

import React, { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext.jsx';

export function EnhancedHUD({ levelNumber, roomIndex, enemiesRemaining, objectives = [] }) {
  const { state } = useGame();
  const [minimapData, setMinimapData] = useState({ enemies: [], player: { x: 0, z: 0 }, hazards: [] });
  const [currentObjective, setCurrentObjective] = useState(null);

  // Update minimap data
  useEffect(() => {
    const updateMinimap = () => {
      // Get enemy positions from global state
      const enemies = window.gameEnemies || [];
      const enemyPositions = enemies
        .filter(e => e.health > 0)
        .map(e => ({
          x: e.mesh?.position.x || 0,
          z: e.mesh?.position.z || 0,
          type: e.type
        }));

      setMinimapData({
        enemies: enemyPositions,
        player: state.player?.position || { x: 0, z: 0 },
        hazards: []
      });
    };

    const interval = setInterval(updateMinimap, 200);
    return () => clearInterval(interval);
  }, [state.player]);

  // Update objectives
  useEffect(() => {
    if (objectives.length > 0) {
      const active = objectives.find(obj => !obj.completed);
      setCurrentObjective(active);
    } else {
      // Default objective
      setCurrentObjective({
        text: enemiesRemaining > 0 ? 'Clear all enemies' : 'Proceed to next room',
        completed: enemiesRemaining === 0
      });
    }
  }, [objectives, enemiesRemaining]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Top Bar - Level and Room Info */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <div className="bg-black bg-opacity-80 px-6 py-2 rounded-lg border-2 border-blue-500">
          <div className="text-white font-bold text-center">
            LEVEL {levelNumber} - ROOM {roomIndex + 1}
          </div>
        </div>
      </div>

      {/* Minimap - Top Right */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <div className="bg-black bg-opacity-90 p-3 rounded-lg border-2 border-green-500">
          <div className="text-green-400 text-xs font-bold mb-2 text-center">RADAR</div>
          <div className="relative w-32 h-32 bg-gray-900 rounded border border-green-700">
            {/* Grid lines */}
            <div className="absolute inset-0">
              <div className="absolute top-1/2 left-0 w-full h-px bg-green-900"></div>
              <div className="absolute top-0 left-1/2 w-px h-full bg-green-900"></div>
            </div>

            {/* Player (center) */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>

            {/* Enemies */}
            {minimapData.enemies.map((enemy, index) => {
              const relX = (enemy.x - minimapData.player.x) * 2;
              const relZ = (enemy.z - minimapData.player.z) * 2;

              // Clamp to minimap bounds
              const x = Math.max(-60, Math.min(60, relX));
              const z = Math.max(-60, Math.min(60, relZ));

              return (
                <div
                  key={index}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    marginLeft: `${x}px`,
                    marginTop: `${z}px`
                  }}
                >
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                </div>
              );
            })}

            {/* Enemy count */}
            <div className="absolute bottom-1 left-1 text-red-400 text-xs font-bold">
              {minimapData.enemies.length}
            </div>
          </div>
        </div>
      </div>

      {/* Objective Tracker - Top Left */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <div className="bg-black bg-opacity-90 p-4 rounded-lg border-2 border-yellow-500 min-w-64">
          <div className="text-yellow-400 text-xs font-bold mb-2">OBJECTIVE</div>
          {currentObjective && (
            <div className="flex items-start gap-2">
              <div className={`mt-1 w-3 h-3 rounded border-2 ${
                currentObjective.completed
                  ? 'bg-green-500 border-green-500'
                  : 'border-yellow-500'
              }`}>
                {currentObjective.completed && (
                  <div className="text-white text-xs leading-none">✓</div>
                )}
              </div>
              <div className={`text-sm ${
                currentObjective.completed ? 'text-green-400 line-through' : 'text-white'
              }`}>
                {currentObjective.text}
              </div>
            </div>
          )}

          {/* Sub-objectives */}
          {objectives.slice(1).map((obj, index) => (
            <div key={index} className="flex items-start gap-2 mt-2 ml-4">
              <div className={`mt-1 w-2 h-2 rounded border ${
                obj.completed
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-500'
              }`}></div>
              <div className={`text-xs ${
                obj.completed ? 'text-green-400 line-through' : 'text-gray-400'
              }`}>
                {obj.text}
              </div>
            </div>
          ))}

          {/* Enemy counter */}
          {enemiesRemaining > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Enemies:</span>
                <span className="text-red-400 font-bold">{enemiesRemaining}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Display - Bottom Left */}
      <div className="absolute bottom-4 left-4 pointer-events-auto">
        <div className="bg-black bg-opacity-80 p-3 rounded-lg border border-gray-700 space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">Score:</span>
            <span className="text-yellow-400 font-bold">{state.player.score?.toLocaleString() || 0}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">Accuracy:</span>
            <span className="text-blue-400 font-bold">{state.player.accuracy || 0}%</span>
          </div>
          {state.player.combo > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400">Combo:</span>
              <span className="text-orange-400 font-bold">{state.player.combo}x</span>
            </div>
          )}
        </div>
      </div>

      {/* Warning Indicators - Center */}
      {enemiesRemaining === 0 && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
          <div className="bg-green-600 bg-opacity-90 px-6 py-3 rounded-lg border-2 border-green-400 animate-pulse">
            <div className="text-white font-bold text-center">
              ✓ ROOM CLEAR - PROCEED
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnhancedHUD;
