import React, { useEffect, useRef } from 'react';
import { ParticleSystem } from '../../systems/ParticleSystem.js';
import * as THREE from 'three';

/**
 * VisualFeedbackSystem - Manages all visual effects and feedback in the game
 */
export function VisualFeedbackSystem({ gameEngine }) {
  const particleSystemRef = useRef(null);
  const lastUpdateTime = useRef(performance.now());

  useEffect(() => {
    if (!gameEngine || !gameEngine.getScene) return;

    // Initialize particle system
    const scene = gameEngine.getScene();
    particleSystemRef.current = new ParticleSystem(scene);

    // Make particle system globally available
    window.visualFeedback = {
      createHitEffect: (position, color, intensity) => {
        particleSystemRef.current?.createHitEffect(position, color, intensity);
      },
      createExplosion: (position, size) => {
        particleSystemRef.current?.createExplosion(position, size);
      },
      createMuzzleFlash: (position, weaponType) => {
        particleSystemRef.current?.createMuzzleFlash(position, weaponType);
      },
      createDamageNumber: (position, damage, isCritical) => {
        particleSystemRef.current?.createDamageNumber(position, damage, isCritical);
      },
      createProjectileTrail: (startPos, endPos, weaponType) => {
        particleSystemRef.current?.createProjectileTrail(startPos, endPos, weaponType);
      },
      createReloadEffect: (position) => {
        particleSystemRef.current?.createReloadEffect(position);
      }
    };

    // Animation loop for particle updates
    const updateLoop = () => {
      const currentTime = performance.now();
      const deltaTime = (currentTime - lastUpdateTime.current) / 1000;
      lastUpdateTime.current = currentTime;

      if (particleSystemRef.current) {
        particleSystemRef.current.update(deltaTime);
      }

      requestAnimationFrame(updateLoop);
    };

    updateLoop();

    return () => {
      if (particleSystemRef.current) {
        particleSystemRef.current.cleanup();
        particleSystemRef.current = null;
      }
      window.visualFeedback = null;
    };
  }, [gameEngine]);

  // Listen for game events to trigger effects
  useEffect(() => {
    if (!particleSystemRef.current) return;

    // Listen for enemy damage events
    const handleEnemyDamaged = (event) => {
      if (event.detail && particleSystemRef.current) {
        const { position, damage, isCritical, enemyType } = event.detail;

        // Create hit effect
        const hitColor = isCritical ? 0xffff00 : 0xff4444;
        const intensity = isCritical ? 'critical' : 'normal';
        particleSystemRef.current.createHitEffect(position, hitColor, intensity);

        // Create damage number
        particleSystemRef.current.createDamageNumber(position, damage, isCritical);
      }
    };

    // Listen for enemy death events
    const handleEnemyDied = (event) => {
      if (event.detail && particleSystemRef.current) {
        const { position, enemyType } = event.detail;
        const size = enemyType === 'boss' ? 'boss' : 'normal';
        particleSystemRef.current.createExplosion(position, size);
      }
    };

    // Listen for weapon fire events
    const handleWeaponFired = (event) => {
      if (event.detail && particleSystemRef.current) {
        const { position, targetPosition, weaponType } = event.detail;

        // Create muzzle flash at weapon position
        particleSystemRef.current.createMuzzleFlash(position, weaponType);

        // Create projectile trail if target was hit
        if (targetPosition) {
          particleSystemRef.current.createProjectileTrail(position, targetPosition, weaponType);
        }
      }
    };

    // Listen for weapon reload events
    const handleWeaponReload = (event) => {
      if (event.detail && particleSystemRef.current) {
        const { position } = event.detail;
        particleSystemRef.current.createReloadEffect(position);
      }
    };

    // Add event listeners
    window.addEventListener('enemyDamaged', handleEnemyDamaged);
    window.addEventListener('enemyDied', handleEnemyDied);
    window.addEventListener('weaponFired', handleWeaponFired);
    window.addEventListener('weaponReload', handleWeaponReload);

    return () => {
      window.removeEventListener('enemyDamaged', handleEnemyDamaged);
      window.removeEventListener('enemyDied', handleEnemyDied);
      window.removeEventListener('weaponFired', handleWeaponFired);
      window.removeEventListener('weaponReload', handleWeaponReload);
    };
  }, []);

  return (
    <div className="absolute top-4 left-4 bg-black bg-opacity-80 text-white p-3 rounded text-sm font-mono z-40">
      <div className="text-blue-400">EFFECTS</div>
      <div className="text-xs">
        {particleSystemRef.current ?
          `Active: ${particleSystemRef.current.activeEffects?.length || 0}` :
          'Initializing...'
        }
      </div>
    </div>
  );
}

export default VisualFeedbackSystem;