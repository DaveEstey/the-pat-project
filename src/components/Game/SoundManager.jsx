import { useEffect } from 'react';
import { playSound, playMusic } from '../../utils/audioUtils.js';

/**
 * Sound Manager - Central hub for all game sound effects
 * Listens to game events and triggers appropriate sounds
 */
export function SoundManager() {
  useEffect(() => {
    // Weapon sounds
    const handleWeaponFired = (event) => {
      const { weapon } = event.detail || {};
      playSound(`weapon_${weapon || 'pistol'}`, 0.7);
    };

    const handleWeaponReload = () => {
      playSound('weapon_reload', 0.5);
    };

    const handleWeaponUnlock = (event) => {
      const { weaponType } = event.detail || {};
      playSound('ui_unlock', 1.0);
    };

    // Enemy sounds
    const handleEnemyHit = () => {
      playSound('enemy_hit', 0.6);
    };

    const handleEnemyKilled = () => {
      playSound('enemy_death', 0.8);
    };

    // Player sounds
    const handlePlayerHit = () => {
      playSound('player_hit', 0.8);
    };

    // Item sounds
    const handleItemCollect = (event) => {
      const { itemType } = event.detail || {};
      if (itemType === 'coin') {
        playSound('item_coin', 0.5);
      } else if (itemType === 'powerup') {
        playSound('item_powerup', 0.7);
      } else {
        playSound('item_collect', 0.6);
      }
    };

    // Puzzle sounds
    const handlePuzzleTargetHit = () => {
      playSound('puzzle_activate', 0.6);
    };

    const handlePuzzleComplete = () => {
      playSound('puzzle_complete', 1.0);
    };

    const handlePuzzleFailed = () => {
      playSound('puzzle_fail', 0.8);
    };

    // UI sounds
    const handleLevelComplete = () => {
      playSound('ui_levelup', 1.0);
    };

    const handleComboMilestone = (event) => {
      const { combo } = event.detail || {};
      if (combo >= 10) {
        playSound('combo_milestone', 0.7);
      }
    };

    // Register all event listeners
    window.addEventListener('weaponFired', handleWeaponFired);
    window.addEventListener('weaponReload', handleWeaponReload);
    window.addEventListener('weaponPickupCollected', handleWeaponUnlock);
    window.addEventListener('enemyHit', handleEnemyHit);
    window.addEventListener('enemyKilled', handleEnemyKilled);
    window.addEventListener('playerHit', handlePlayerHit);
    window.addEventListener('itemCollected', handleItemCollect);
    window.addEventListener('puzzleTargetHit', handlePuzzleTargetHit);
    window.addEventListener('puzzleCompleted', handlePuzzleComplete);
    window.addEventListener('puzzleFailed', handlePuzzleFailed);
    window.addEventListener('levelComplete', handleLevelComplete);
    window.addEventListener('comboMilestone', handleComboMilestone);

    // Cleanup
    return () => {
      window.removeEventListener('weaponFired', handleWeaponFired);
      window.removeEventListener('weaponReload', handleWeaponReload);
      window.removeEventListener('weaponPickupCollected', handleWeaponUnlock);
      window.removeEventListener('enemyHit', handleEnemyHit);
      window.removeEventListener('enemyKilled', handleEnemyKilled);
      window.removeEventListener('playerHit', handlePlayerHit);
      window.removeEventListener('itemCollected', handleItemCollect);
      window.removeEventListener('puzzleTargetHit', handlePuzzleTargetHit);
      window.removeEventListener('puzzleCompleted', handlePuzzleComplete);
      window.removeEventListener('puzzleFailed', handlePuzzleFailed);
      window.removeEventListener('levelComplete', handleLevelComplete);
      window.removeEventListener('comboMilestone', handleComboMilestone);
    };
  }, []);

  return null; // No UI rendering
}

export default SoundManager;
