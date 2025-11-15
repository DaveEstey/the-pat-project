/**
 * Destructible Manager Component
 * Spawns and manages destructible objects and cover system
 */

import React, { useEffect, useRef } from 'react';
import { getDestructiblesForRoom } from '../../data/destructibleConfigs.js';
import { initializeDestructibleSystem, getDestructibleSystem } from '../../systems/DestructibleSystem.js';
import { getProgressionSystem } from '../../systems/ProgressionSystem.js';

export function DestructibleManager({
  gameEngine,
  levelNumber,
  roomIndex,
  isPaused = false
}) {
  const destructibleSystemRef = useRef(null);
  const spawnedDestructiblesRef = useRef(new Set());

  // Initialize destructible system
  useEffect(() => {
    if (!gameEngine) return;

    try {
      // Initialize or get existing destructible system
      if (!destructibleSystemRef.current) {
        initializeDestructibleSystem(gameEngine);
        destructibleSystemRef.current = getDestructibleSystem();
      }

      console.log(`[DestructibleManager] Initialized for Level ${levelNumber} Room ${roomIndex}`);
    } catch (error) {
      console.error('[DestructibleManager] Failed to initialize:', error);
    }

    return () => {
      // Cleanup destructibles when room changes
      if (destructibleSystemRef.current) {
        spawnedDestructiblesRef.current.forEach(destructibleId => {
          try {
            destructibleSystemRef.current.removeDestructible(destructibleId);
          } catch (error) {
            console.error('[DestructibleManager] Failed to remove destructible:', error);
          }
        });
        spawnedDestructiblesRef.current.clear();
      }
    };
  }, [gameEngine, levelNumber, roomIndex]);

  // Spawn destructibles for current room
  useEffect(() => {
    if (!destructibleSystemRef.current || !gameEngine) return;

    // Clear any existing destructibles from previous room
    spawnedDestructiblesRef.current.forEach(destructibleId => {
      try {
        destructibleSystemRef.current.removeDestructible(destructibleId);
      } catch (error) {
        console.error('[DestructibleManager] Failed to remove during spawn:', error);
      }
    });
    spawnedDestructiblesRef.current.clear();

    // Get destructible configurations for this room
    const destructibleConfigs = getDestructiblesForRoom(levelNumber, roomIndex);

    if (destructibleConfigs.length === 0) {
      console.log(`[DestructibleManager] No destructibles configured for Level ${levelNumber} Room ${roomIndex}`);
      return;
    }

    // Spawn all destructibles
    destructibleConfigs.forEach(destructibleConfig => {
      try {
        const destructible = destructibleSystemRef.current.spawnDestructible(
          destructibleConfig.type,
          destructibleConfig.position,
          destructibleConfig.config || {}
        );

        if (destructible) {
          spawnedDestructiblesRef.current.add(destructible.id);
        }
      } catch (error) {
        console.error('[DestructibleManager] Failed to spawn destructible:', destructibleConfig, error);
      }
    });

    console.log(`[DestructibleManager] Spawned ${spawnedDestructiblesRef.current.size} destructibles`);

  }, [gameEngine, levelNumber, roomIndex]);

  // Listen for weapon hits on destructibles
  useEffect(() => {
    const handleWeaponHit = (event) => {
      const { position, damage } = event.detail;

      if (!destructibleSystemRef.current || !position) return;

      // Check if any destructibles are hit
      const destructibles = destructibleSystemRef.current.getActiveDestructibles();

      destructibles.forEach(destructible => {
        if (destructible.isDestroyed) return;

        const dx = destructible.position.x - position.x;
        const dy = (destructible.position.y + destructible.config.size.height / 2) - position.y;
        const dz = destructible.position.z - position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Hit detection based on destructible size
        const hitRadius = Math.max(
          destructible.config.size.width,
          destructible.config.size.height,
          destructible.config.size.depth
        ) / 2 + 0.5;

        if (distance <= hitRadius) {
          try {
            destructibleSystemRef.current.damageDestructible(destructible.id, damage);
          } catch (error) {
            console.error('[DestructibleManager] Failed to damage destructible:', error);
          }
        }
      });
    };

    window.addEventListener('weaponHit', handleWeaponHit);

    return () => {
      window.removeEventListener('weaponHit', handleWeaponHit);
    };
  }, []);

  // Listen for destructible rewards
  useEffect(() => {
    const handleReward = (event) => {
      const { type, value, position } = event.detail;

      try {
        const progressionSystem = getProgressionSystem();

        switch (type) {
          case 'health':
            progressionSystem.restoreHealth(value);
            console.log(`[DestructibleManager] Player healed ${value} HP`);
            break;

          case 'ammo':
            // Add ammo to current weapon
            const weaponSystem = getWeaponSystem();
            if (weaponSystem) {
              const currentWeapon = weaponSystem.getCurrentWeapon();
              if (currentWeapon && currentWeapon.currentAmmo !== undefined) {
                weaponSystem.addAmmo(currentWeapon.name, value);
                console.log(`[DestructibleManager] Added ${value} ammo to ${currentWeapon.name}`);
              }
            }
            break;

          case 'points':
            progressionSystem.addScore(value);
            console.log(`[DestructibleManager] Player earned ${value} points`);
            break;

          default:
            console.warn('[DestructibleManager] Unknown reward type:', type);
        }

        // Visual feedback for reward
        window.dispatchEvent(new CustomEvent('showReward', {
          detail: { type, value, position }
        }));
      } catch (error) {
        console.error('[DestructibleManager] Failed to apply reward:', error);
      }
    };

    window.addEventListener('destructibleReward', handleReward);

    return () => {
      window.removeEventListener('destructibleReward', handleReward);
    };
  }, []);

  // Listen for enemy projectiles hitting destructibles
  useEffect(() => {
    const handleEnemyProjectile = (event) => {
      const { position, damage } = event.detail;

      if (!destructibleSystemRef.current || !position) return;

      // Check if projectile hits any destructibles
      const destructibles = destructibleSystemRef.current.getActiveDestructibles();

      destructibles.forEach(destructible => {
        if (destructible.isDestroyed) return;

        const dx = destructible.position.x - position.x;
        const dy = (destructible.position.y + destructible.config.size.height / 2) - position.y;
        const dz = destructible.position.z - position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        const hitRadius = Math.max(
          destructible.config.size.width,
          destructible.config.size.height,
          destructible.config.size.depth
        ) / 2;

        if (distance <= hitRadius) {
          // Destructibles can be damaged by enemy fire too
          destructibleSystemRef.current.damageDestructible(destructible.id, damage * 0.5);
        }
      });
    };

    window.addEventListener('enemyProjectileImpact', handleEnemyProjectile);

    return () => {
      window.removeEventListener('enemyProjectileImpact', handleEnemyProjectile);
    };
  }, []);

  return null; // This component only manages logic, no visual UI
}

export default DestructibleManager;
