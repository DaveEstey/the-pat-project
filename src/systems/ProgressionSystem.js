import { WeaponTypes } from '../types/weapons.js';

/**
 * Progression System - Manages unlocks, completion, and persistent progression
 */
export class ProgressionSystem {
  constructor() {
    this.unlockedWeapons = new Set();
    this.completedLevels = new Set();
    this.collectedKeyItems = new Set();
    this.secretRoomsFound = new Set();
    this.purchasedUpgrades = new Set(); // Permanent upgrades
    this.listeners = new Map();
    this.totalScore = 0; // Currency for upgrades

    // Load saved progression
    this.loadProgression();

    // Always start with pistol
    this.unlockedWeapons.add(WeaponTypes.PISTOL);
  }

  /**
   * Load progression from localStorage
   */
  loadProgression() {
    try {
      const saved = localStorage.getItem('game_progression');
      if (saved) {
        const data = JSON.parse(saved);

        // Load unlocked weapons
        if (data.weapons) {
          this.unlockedWeapons = new Set(data.weapons);
        }

        // Load completed levels
        if (data.levels) {
          this.completedLevels = new Set(data.levels);
        }

        // Load key items
        if (data.keyItems) {
          this.collectedKeyItems = new Set(data.keyItems);
        }

        // Load secret rooms
        if (data.secretRooms) {
          this.secretRoomsFound = new Set(data.secretRooms);
        }

        // Load purchased upgrades
        if (data.upgrades) {
          this.purchasedUpgrades = new Set(data.upgrades);
        }

        // Load total score
        if (data.totalScore !== undefined) {
          this.totalScore = data.totalScore;
        }
      }
    } catch (error) {
      console.error('❌ Failed to load progression:', error);
    }
  }

  /**
   * Save progression to localStorage
   */
  saveProgression() {
    try {
      const data = {
        weapons: Array.from(this.unlockedWeapons),
        levels: Array.from(this.completedLevels),
        keyItems: Array.from(this.collectedKeyItems),
        secretRooms: Array.from(this.secretRoomsFound),
        upgrades: Array.from(this.purchasedUpgrades),
        totalScore: this.totalScore,
        lastSaved: Date.now()
      };

      localStorage.setItem('game_progression', JSON.stringify(data));

      return true;
    } catch (error) {
      console.error('❌ Failed to save progression:', error);
      return false;
    }
  }

  /**
   * Unlock a weapon
   */
  unlockWeapon(weaponType, source = 'unknown') {
    if (this.unlockedWeapons.has(weaponType)) {
      return false;
    }

    this.unlockedWeapons.add(weaponType);
    this.saveProgression();
    this.notifyListeners('weaponUnlocked', { weaponType, source });

    return true;
  }

  /**
   * Check if weapon is unlocked
   */
  isWeaponUnlocked(weaponType) {
    return this.unlockedWeapons.has(weaponType);
  }

  /**
   * Get all unlocked weapons
   */
  getUnlockedWeapons() {
    return Array.from(this.unlockedWeapons);
  }

  /**
   * Get all locked weapons
   */
  getLockedWeapons() {
    const allWeapons = Object.values(WeaponTypes);
    return allWeapons.filter(weapon => !this.unlockedWeapons.has(weapon));
  }

  /**
   * Complete a level
   */
  completeLevel(levelNumber, stats = {}) {
    this.completedLevels.add(levelNumber);
    this.saveProgression();
    this.notifyListeners('levelCompleted', { levelNumber, stats });

    return true;
  }

  /**
   * Check if level is completed
   */
  isLevelCompleted(levelNumber) {
    return this.completedLevels.has(levelNumber);
  }

  /**
   * Check if level is unlocked (level 1 always unlocked, others require previous completion)
   */
  isLevelUnlocked(levelNumber) {
    if (levelNumber === 1) return true;
    return this.completedLevels.has(levelNumber - 1);
  }

  /**
   * Get completed level count
   */
  getCompletedLevelCount() {
    return this.completedLevels.size;
  }

  /**
   * Collect a key item
   */
  collectKeyItem(itemId, source = 'unknown') {
    if (this.collectedKeyItems.has(itemId)) {
      return false;
    }

    this.collectedKeyItems.add(itemId);
    this.saveProgression();
    this.notifyListeners('keyItemCollected', { itemId, source });

    return true;
  }

  /**
   * Check if key item is collected
   */
  hasKeyItem(itemId) {
    return this.collectedKeyItems.has(itemId);
  }

  /**
   * Discover a secret room
   */
  discoverSecretRoom(roomId, source = 'unknown') {
    if (this.secretRoomsFound.has(roomId)) {
      return false;
    }

    this.secretRoomsFound.add(roomId);
    this.saveProgression();
    this.notifyListeners('secretRoomDiscovered', { roomId, source });

    return true;
  }

  /**
   * Check if secret room is discovered
   */
  isSecretRoomDiscovered(roomId) {
    return this.secretRoomsFound.has(roomId);
  }

  /**
   * Reset all progression (for testing or new game)
   */
  resetProgression() {
    this.unlockedWeapons.clear();
    this.completedLevels.clear();
    this.collectedKeyItems.clear();
    this.secretRoomsFound.clear();

    // Always start with pistol
    this.unlockedWeapons.add(WeaponTypes.PISTOL);

    this.saveProgression();
    this.notifyListeners('progressionReset', {});
  }

  /**
   * Get progression summary for UI
   */
  getProgressionSummary() {
    return {
      weapons: {
        unlocked: Array.from(this.unlockedWeapons),
        locked: this.getLockedWeapons(),
        total: Object.values(WeaponTypes).length
      },
      levels: {
        completed: Array.from(this.completedLevels),
        count: this.completedLevels.size,
        total: 12 // Total levels in game
      },
      keyItems: {
        collected: Array.from(this.collectedKeyItems),
        count: this.collectedKeyItems.size
      },
      secretRooms: {
        found: Array.from(this.secretRoomsFound),
        count: this.secretRoomsFound.size
      }
    };
  }

  /**
   * Event listener system
   */
  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);
  }

  off(eventName, callback) {
    if (this.listeners.has(eventName)) {
      const callbacks = this.listeners.get(eventName);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  notifyListeners(eventName, data) {
    if (this.listeners.has(eventName)) {
      this.listeners.get(eventName).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${eventName} listener:`, error);
        }
      });
    }
  }

  /**
   * Add score to total (for upgrade currency)
   */
  addScore(points) {
    this.totalScore += points;
    this.saveProgression();
  }

  /**
   * Get current total score
   */
  getTotalScore() {
    return this.totalScore;
  }

  /**
   * Purchase an upgrade
   */
  purchaseUpgrade(upgradeId, cost) {
    if (this.purchasedUpgrades.has(upgradeId)) {
      return { success: false, reason: 'already_purchased' };
    }

    if (this.totalScore < cost) {
      return { success: false, reason: 'insufficient_funds' };
    }

    this.purchasedUpgrades.add(upgradeId);
    this.totalScore -= cost;
    this.saveProgression();
    this.notifyListeners('upgradePurchased', { upgradeId, cost });

    return { success: true };
  }

  /**
   * Check if upgrade is purchased
   */
  hasUpgrade(upgradeId) {
    return this.purchasedUpgrades.has(upgradeId);
  }

  /**
   * Get all purchased upgrades
   */
  getPurchasedUpgrades() {
    return Array.from(this.purchasedUpgrades);
  }

  /**
   * Get available upgrades (not yet purchased)
   */
  getAvailableUpgrades() {
    const allUpgrades = [
      {
        id: 'damage_boost',
        name: 'Damage Boost',
        description: 'Increase all weapon damage by 25%',
        cost: 5000,
        effect: { type: 'damage', value: 1.25 }
      },
      {
        id: 'health_upgrade',
        name: 'Reinforced Armor',
        description: 'Increase maximum health by 50',
        cost: 4000,
        effect: { type: 'maxHealth', value: 50 }
      },
      {
        id: 'reload_speed',
        name: 'Quick Reload',
        description: 'Reduce reload time by 40%',
        cost: 3000,
        effect: { type: 'reloadSpeed', value: 0.6 }
      },
      {
        id: 'ammo_capacity',
        name: 'Extended Magazines',
        description: 'Increase ammo capacity by 50%',
        cost: 3500,
        effect: { type: 'ammoCapacity', value: 1.5 }
      },
      {
        id: 'critical_chance',
        name: 'Eagle Eye',
        description: 'Increase critical hit chance by 15%',
        cost: 6000,
        effect: { type: 'criticalChance', value: 0.15 }
      }
    ];

    return allUpgrades.filter(upgrade => !this.purchasedUpgrades.has(upgrade.id));
  }
}

// Create global progression system instance
let progressionSystemInstance = null;

export function getProgressionSystem() {
  if (!progressionSystemInstance) {
    progressionSystemInstance = new ProgressionSystem();
  }
  return progressionSystemInstance;
}

export default ProgressionSystem;
