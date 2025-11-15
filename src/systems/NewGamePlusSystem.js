/**
 * New Game Plus System
 * Harder difficulty mode with increased rewards
 */

let ngPlusSystemInstance = null;

export function initializeNewGamePlus() {
  if (ngPlusSystemInstance) {
    return ngPlusSystemInstance;
  }
  ngPlusSystemInstance = new NewGamePlusSystem();
  return ngPlusSystemInstance;
}

export function getNewGamePlus() {
  return ngPlusSystemInstance;
}

export class NewGamePlusSystem {
  constructor() {
    this.isNGPlus = false;
    this.ngPlusLevel = 0; // 0 = normal, 1 = NG+, 2 = NG++, etc.
    this.maxNGPlusLevel = 5;

    this.loadNGPlusState();
  }

  /**
   * Start New Game Plus
   */
  startNewGamePlus(level = 1) {
    if (level < 1 || level > this.maxNGPlusLevel) {
      console.error('[NGPlus] Invalid NG+ level:', level);
      return false;
    }

    this.isNGPlus = true;
    this.ngPlusLevel = level;
    this.saveNGPlusState();

    console.log(`[NGPlus] Started NG+ Level ${level}`);
    return true;
  }

  /**
   * Exit New Game Plus (return to normal)
   */
  exitNewGamePlus() {
    this.isNGPlus = false;
    this.ngPlusLevel = 0;
    this.saveNGPlusState();
  }

  /**
   * Get enemy stat multipliers
   */
  getEnemyMultipliers() {
    if (!this.isNGPlus) {
      return { health: 1.0, damage: 1.0, speed: 1.0, count: 1.0 };
    }

    const baseMultiplier = 1 + (this.ngPlusLevel * 0.3); // 30% per level

    return {
      health: baseMultiplier * 1.5,      // 1.5x, 1.95x, 2.4x, etc.
      damage: baseMultiplier * 1.2,      // 1.2x, 1.56x, 1.92x, etc.
      speed: 1 + (this.ngPlusLevel * 0.1), // 10% faster per level
      count: 1 + (this.ngPlusLevel * 0.2)  // 20% more enemies
    };
  }

  /**
   * Get reward multipliers
   */
  getRewardMultipliers() {
    if (!this.isNGPlus) {
      return { score: 1.0, currency: 1.0, drops: 1.0 };
    }

    const multiplier = 1 + (this.ngPlusLevel * 0.5); // 50% per level

    return {
      score: multiplier * 2,        // 2x, 3x, 4x, etc.
      currency: multiplier * 1.5,   // 1.5x, 2.25x, 3x, etc.
      drops: 1 + (this.ngPlusLevel * 0.15) // Better drop rates
    };
  }

  /**
   * Get player starting bonuses
   */
  getPlayerBonuses() {
    if (!this.isNGPlus) {
      return { health: 0, damage: 0, currency: 0 };
    }

    return {
      health: this.ngPlusLevel * 25,      // +25 HP per level
      damage: this.ngPlusLevel * 0.1,     // +10% damage per level
      currency: this.ngPlusLevel * 500    // +500 starting currency
    };
  }

  /**
   * Check if NG+ is unlocked
   */
  isUnlocked() {
    try {
      const saved = localStorage.getItem('gameCompletion');
      if (saved) {
        const data = JSON.parse(saved);
        return data.campaignCompleted === true;
      }
    } catch (error) {
      return false;
    }
    return false;
  }

  /**
   * Unlock next NG+ level
   */
  unlockNextLevel() {
    if (!this.isNGPlus) return false;

    if (this.ngPlusLevel < this.maxNGPlusLevel) {
      // Unlock next level (doesn't activate it)
      try {
        const saved = localStorage.getItem('ngPlusUnlocks') || '{"maxLevel": 0}';
        const data = JSON.parse(saved);
        data.maxLevel = Math.max(data.maxLevel, this.ngPlusLevel + 1);
        localStorage.setItem('ngPlusUnlocks', JSON.stringify(data));
        return true;
      } catch (error) {
        return false;
      }
    }

    return false;
  }

  /**
   * Get max unlocked NG+ level
   */
  getMaxUnlockedLevel() {
    try {
      const saved = localStorage.getItem('ngPlusUnlocks');
      if (saved) {
        const data = JSON.parse(saved);
        return data.maxLevel || 1;
      }
    } catch (error) {
      return 1;
    }
    return 1;
  }

  /**
   * Get special enemy variants for NG+
   */
  shouldSpawnEliteEnemy() {
    if (!this.isNGPlus) return false;

    const eliteChance = this.ngPlusLevel * 0.1; // 10% per level
    return Math.random() < eliteChance;
  }

  /**
   * Get elite enemy multipliers
   */
  getEliteMultipliers() {
    return {
      health: 2.0,
      damage: 1.5,
      speed: 1.2,
      scoreValue: 3.0
    };
  }

  /**
   * Get current NG+ level
   */
  getCurrentLevel() {
    return this.ngPlusLevel;
  }

  /**
   * Check if in NG+ mode
   */
  isActive() {
    return this.isNGPlus;
  }

  /**
   * Get NG+ display name
   */
  getModeName() {
    if (!this.isNGPlus) return 'Normal';

    const names = [
      'Normal',
      'New Game+',
      'New Game++',
      'New Game+++',
      'Nightmare',
      'Hell Mode'
    ];

    return names[this.ngPlusLevel] || `NG+${this.ngPlusLevel}`;
  }

  /**
   * Get difficulty description
   */
  getDifficultyDescription() {
    if (!this.isNGPlus) {
      return 'Standard difficulty';
    }

    const mult = this.getEnemyMultipliers();
    const rewards = this.getRewardMultipliers();

    return `Enemies: ${(mult.health * 100).toFixed(0)}% HP, ${(mult.damage * 100).toFixed(0)}% DMG | Rewards: ${(rewards.score * 100).toFixed(0)}% Score`;
  }

  /**
   * Save NG+ state
   */
  saveNGPlusState() {
    try {
      const state = {
        isNGPlus: this.isNGPlus,
        ngPlusLevel: this.ngPlusLevel
      };
      localStorage.setItem('ngPlusState', JSON.stringify(state));
    } catch (error) {
      console.error('[NGPlus] Failed to save state:', error);
    }
  }

  /**
   * Load NG+ state
   */
  loadNGPlusState() {
    try {
      const saved = localStorage.getItem('ngPlusState');
      if (saved) {
        const state = JSON.parse(saved);
        this.isNGPlus = state.isNGPlus || false;
        this.ngPlusLevel = state.ngPlusLevel || 0;
      }
    } catch (error) {
      console.error('[NGPlus] Failed to load state:', error);
    }
  }

  /**
   * Reset to normal mode
   */
  reset() {
    this.exitNewGamePlus();
  }
}
