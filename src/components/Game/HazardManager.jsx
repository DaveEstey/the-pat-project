/**
 * Hazard Manager Component
 * Spawns and manages environmental hazards in rooms
 */

import React, { useEffect, useRef, useState } from 'react';
import { getHazardsForRoom } from '../../data/hazardConfigs.js';
import { initializeHazardSystem, getHazardSystem, HazardTypes } from '../../systems/HazardSystem.js';
import { useGame } from '../../contexts/GameContext.jsx';

export function HazardManager({
  gameEngine,
  levelNumber,
  roomIndex,
  playerPosition,
  isPaused = false
}) {
  const { damagePlayer } = useGame();
  const hazardSystemRef = useRef(null);
  const spawnedHazardsRef = useRef(new Set());
  const lastUpdateTimeRef = useRef(Date.now());
  const animationFrameRef = useRef(null);
  const [hazardCount, setHazardCount] = useState(0);

  // Initialize hazard system
  useEffect(() => {
    if (!gameEngine) return;

    try {
      // Initialize or get existing hazard system
      if (!hazardSystemRef.current) {
        initializeHazardSystem(gameEngine);
        hazardSystemRef.current = getHazardSystem();
      }

      console.log(`[HazardManager] Initialized for Level ${levelNumber} Room ${roomIndex}`);
    } catch (error) {
      console.error('[HazardManager] Failed to initialize hazard system:', error);
    }

    return () => {
      // Cleanup hazards when room changes
      if (hazardSystemRef.current) {
        spawnedHazardsRef.current.forEach(hazardId => {
          try {
            hazardSystemRef.current.removeHazard(hazardId);
          } catch (error) {
            console.error('[HazardManager] Failed to remove hazard:', error);
          }
        });
        spawnedHazardsRef.current.clear();
      }
    };
  }, [gameEngine, levelNumber, roomIndex]);

  // Spawn hazards for current room
  useEffect(() => {
    if (!hazardSystemRef.current || !gameEngine) return;

    // Clear any existing hazards from previous room
    spawnedHazardsRef.current.forEach(hazardId => {
      try {
        hazardSystemRef.current.removeHazard(hazardId);
      } catch (error) {
        console.error('[HazardManager] Failed to remove hazard during spawn:', error);
      }
    });
    spawnedHazardsRef.current.clear();

    // Get hazard configurations for this room
    const hazardConfigs = getHazardsForRoom(levelNumber, roomIndex);

    if (hazardConfigs.length === 0) {
      console.log(`[HazardManager] No hazards configured for Level ${levelNumber} Room ${roomIndex}`);
      setHazardCount(0);
      return;
    }

    // Spawn all hazards
    hazardConfigs.forEach(hazardConfig => {
      try {
        const hazard = hazardSystemRef.current.spawnHazard(
          hazardConfig.type,
          hazardConfig.position,
          hazardConfig.config || {}
        );

        if (hazard) {
          spawnedHazardsRef.current.add(hazard.id);
        }
      } catch (error) {
        console.error('[HazardManager] Failed to spawn hazard:', hazardConfig, error);
      }
    });

    setHazardCount(spawnedHazardsRef.current.size);
    console.log(`[HazardManager] Spawned ${spawnedHazardsRef.current.size} hazards for Level ${levelNumber} Room ${roomIndex}`);

  }, [gameEngine, levelNumber, roomIndex]);

  // Listen for hazard damage events and apply to player
  useEffect(() => {
    const handleHazardDamage = (event) => {
      const { targetId, damage, hazardType, position } = event.detail;

      // Check if the player is the target (player ID is typically 'player')
      if (targetId === 'player' || !targetId) {
        try {
          // Use GameContext's damagePlayer method
          if (damagePlayer) {
            damagePlayer(damage);
          }

          console.log(`[HazardManager] Player took ${damage} damage from ${hazardType}`);

          // Visual feedback - screen shake or damage flash
          if (gameEngine && gameEngine.addScreenShake) {
            gameEngine.addScreenShake(0.3, 200);
          }

          // Dispatch damage event for UI updates
          window.dispatchEvent(new CustomEvent('playerDamaged', {
            detail: {
              damage,
              source: 'hazard',
              hazardType,
              position
            }
          }));
        } catch (error) {
          console.error('[HazardManager] Failed to apply hazard damage:', error);
        }
      }
    };

    const handleHazardExplosion = (event) => {
      const { position, radius, damage } = event.detail;

      console.log(`[HazardManager] Explosion at`, position, `with radius ${radius}`);

      // Check if player is in explosion radius
      if (playerPosition) {
        const dx = playerPosition.x - position.x;
        const dy = playerPosition.y - position.y;
        const dz = playerPosition.z - position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance <= radius) {
          // Apply explosion damage based on distance (full damage at center, 0 at edge)
          const damageMultiplier = 1 - (distance / radius);
          const finalDamage = Math.floor(damage * damageMultiplier);

          if (finalDamage > 0) {
            try {
              // Use GameContext's damagePlayer method
              if (damagePlayer) {
                damagePlayer(finalDamage);
              }

              console.log(`[HazardManager] Player took ${finalDamage} explosion damage (${distance.toFixed(1)}m from center)`);

              // Screen shake for explosions
              if (gameEngine && gameEngine.addScreenShake) {
                const shakeIntensity = 0.5 * damageMultiplier;
                gameEngine.addScreenShake(shakeIntensity, 400);
              }

              window.dispatchEvent(new CustomEvent('playerDamaged', {
                detail: {
                  damage: finalDamage,
                  source: 'explosion',
                  position
                }
              }));
            } catch (error) {
              console.error('[HazardManager] Failed to apply explosion damage:', error);
            }
          }
        }
      }
    };

    window.addEventListener('hazardDamage', handleHazardDamage);
    window.addEventListener('hazardExplosion', handleHazardExplosion);

    return () => {
      window.removeEventListener('hazardDamage', handleHazardDamage);
      window.removeEventListener('hazardExplosion', handleHazardExplosion);
    };
  }, [gameEngine, playerPosition, damagePlayer]);

  // Update loop for hazard system
  useEffect(() => {
    if (!hazardSystemRef.current || isPaused) {
      return;
    }

    let lastTime = Date.now();

    const updateLoop = () => {
      if (isPaused) {
        animationFrameRef.current = requestAnimationFrame(updateLoop);
        return;
      }

      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;

      try {
        // Update hazard system with player position
        hazardSystemRef.current.update(deltaTime, playerPosition);
      } catch (error) {
        console.error('[HazardManager] Update loop error:', error);
      }

      animationFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animationFrameRef.current = requestAnimationFrame(updateLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPaused, playerPosition]);

  // Listen for weapon hits on explosive barrels
  useEffect(() => {
    const handleWeaponHit = (event) => {
      const { position, damage } = event.detail;

      if (!hazardSystemRef.current || !position) return;

      // Check if any explosive barrels are hit
      const hazards = hazardSystemRef.current.getActiveHazards();

      hazards.forEach(hazard => {
        if (hazard.type === HazardTypes.EXPLOSIVE_BARREL) {
          const dx = hazard.position.x - position.x;
          const dy = hazard.position.y - position.y;
          const dz = hazard.position.z - position.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          // Hit detection radius (barrel size ~1 unit)
          if (distance <= 2) {
            try {
              hazardSystemRef.current.damageHazard(hazard.id, damage);
              console.log(`[HazardManager] Hit barrel ${hazard.id} for ${damage} damage`);
            } catch (error) {
              console.error('[HazardManager] Failed to damage barrel:', error);
            }
          }
        }
      });
    };

    window.addEventListener('weaponHit', handleWeaponHit);

    return () => {
      window.removeEventListener('weaponHit', handleWeaponHit);
    };
  }, []);

  // Render hazard indicator UI
  return (
    <div className="absolute top-32 right-4 bg-black bg-opacity-70 text-white p-2 rounded text-xs z-40">
      <div className="font-bold text-yellow-400 mb-1">⚠️ HAZARDS</div>
      <div className="text-gray-300">Active: {hazardCount}</div>
      {hazardCount > 0 && (
        <div className="mt-1 text-red-400 text-xs animate-pulse">
          Watch your step!
        </div>
      )}
    </div>
  );
}

export default HazardManager;
