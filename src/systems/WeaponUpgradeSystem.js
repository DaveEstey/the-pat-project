/**
 * Weapon Upgrade System
 * Manages weapon upgrades, modifications, and progression
 */

import { getProgressionSystem } from './ProgressionSystem.js';

export class WeaponUpgradeSystem {
  constructor() {
    this.upgrades = new Map();
    this.progressionSystem = getProgressionSystem();
    this.loadUpgrades();
  }

  /**
   * Load saved upgrades from localStorage
   */
  loadUpgrades() {
    try {
      const saved = localStorage.getItem('weaponUpgrades');
      if (saved) {
        const data = JSON.parse(saved);
        this.upgrades = new Map(data.upgrades || []);
      } else {
        this.initializeDefaults();
      }
    } catch (error) {
      console.error('Failed to load weapon upgrades:', error);
      this.initializeDefaults();
    }
  }

  /**
   * Initialize default upgrade levels
   */
  initializeDefaults() {
    const weapons = ['pistol', 'shotgun', 'rapidfire', 'grappling'];
    weapons.forEach(weapon => {
      this.upgrades.set(weapon, {
        damageLevel: 0,
        fireRateLevel: 0,
        magazineLevel: 0,
        accuracyLevel: 0,
        specialLevel: 0
      });
    });
    this.saveUpgrades();
  }

  /**
   * Save upgrades to localStorage
   */
  saveUpgrades() {
    try {
      const data = {
        upgrades: Array.from(this.upgrades.entries())
      };
      localStorage.setItem('weaponUpgrades', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save weapon upgrades:', error);
    }
  }

  /**
   * Add currency (now delegates to ProgressionSystem)
   */
  addCurrency(amount) {
    this.progressionSystem.addScore(amount);

    window.dispatchEvent(new CustomEvent('currencyChanged', {
      detail: { currency: this.getCurrency(), change: amount }
    }));
  }

  /**
   * Get current currency (from ProgressionSystem)
   */
  getCurrency() {
    return this.progressionSystem.getTotalScore();
  }

  /**
   * Get upgrade levels for a weapon
   */
  getUpgrades(weaponType) {
    return this.upgrades.get(weaponType) || this.getDefaultUpgrades();
  }

  /**
   * Get default upgrade values
   */
  getDefaultUpgrades() {
    return {
      damageLevel: 0,
      fireRateLevel: 0,
      magazineLevel: 0,
      accuracyLevel: 0,
      specialLevel: 0
    };
  }

  /**
   * Calculate upgrade cost
   */
  getUpgradeCost(currentLevel) {
    const baseCost = 100;
    return Math.floor(baseCost * Math.pow(1.5, currentLevel));
  }

  /**
   * Upgrade weapon damage
   */
  upgradeDamage(weaponType) {
    const current = this.getUpgrades(weaponType);
    const cost = this.getUpgradeCost(current.damageLevel);

    if (this.getCurrency() >= cost && current.damageLevel < 5) {
      this.progressionSystem.addScore(-cost); // Deduct cost
      current.damageLevel += 1;
      this.upgrades.set(weaponType, current);
      this.saveUpgrades();

      window.dispatchEvent(new CustomEvent('weaponUpgraded', {
        detail: { weapon: weaponType, type: 'damage', level: current.damageLevel }
      }));

      window.dispatchEvent(new CustomEvent('currencyChanged', {
        detail: { currency: this.getCurrency(), change: -cost }
      }));

      return true;
    }
    return false;
  }

  /**
   * Upgrade weapon fire rate
   */
  upgradeFireRate(weaponType) {
    const current = this.getUpgrades(weaponType);
    const cost = this.getUpgradeCost(current.fireRateLevel);

    if (this.getCurrency() >= cost && current.fireRateLevel < 5) {
      this.progressionSystem.addScore(-cost); // Deduct cost
      current.fireRateLevel += 1;
      this.upgrades.set(weaponType, current);
      this.saveUpgrades();

      window.dispatchEvent(new CustomEvent('weaponUpgraded', {
        detail: { weapon: weaponType, type: 'fireRate', level: current.fireRateLevel }
      }));

      window.dispatchEvent(new CustomEvent('currencyChanged', {
        detail: { currency: this.getCurrency(), change: -cost }
      }));

      return true;
    }
    return false;
  }

  /**
   * Upgrade magazine size
   */
  upgradeMagazine(weaponType) {
    const current = this.getUpgrades(weaponType);
    const cost = this.getUpgradeCost(current.magazineLevel);

    if (this.getCurrency() >= cost && current.magazineLevel < 5) {
      this.progressionSystem.addScore(-cost); // Deduct cost
      current.magazineLevel += 1;
      this.upgrades.set(weaponType, current);
      this.saveUpgrades();

      window.dispatchEvent(new CustomEvent('weaponUpgraded', {
        detail: { weapon: weaponType, type: 'magazine', level: current.magazineLevel }
      }));

      window.dispatchEvent(new CustomEvent('currencyChanged', {
        detail: { currency: this.getCurrency(), change: -cost }
      }));

      return true;
    }
    return false;
  }

  /**
   * Get modified weapon stats with upgrades applied
   */
  getModifiedStats(weaponType, baseStats) {
    const upgrades = this.getUpgrades(weaponType);

    return {
      damage: baseStats.damage * (1 + upgrades.damageLevel * 0.15), // +15% per level
      fireRate: baseStats.fireRate / (1 + upgrades.fireRateLevel * 0.1), // -10% delay per level
      magazineSize: Math.floor(baseStats.magazineSize * (1 + upgrades.magazineLevel * 0.2)), // +20% per level
      accuracy: Math.min(1, baseStats.accuracy + upgrades.accuracyLevel * 0.05), // +5% per level
      specialPower: upgrades.specialLevel
    };
  }

  /**
   * Reset all upgrades (for New Game)
   */
  resetUpgrades() {
    this.initializeDefaults();
    this.saveUpgrades();
  }

  /**
   * Get upgrade progress for UI
   */
  getUpgradeProgress(weaponType) {
    const upgrades = this.getUpgrades(weaponType);
    const maxLevel = 5;

    return {
      damage: {
        current: upgrades.damageLevel,
        max: maxLevel,
        cost: this.getUpgradeCost(upgrades.damageLevel),
        canAfford: this.currency >= this.getUpgradeCost(upgrades.damageLevel),
        maxed: upgrades.damageLevel >= maxLevel
      },
      fireRate: {
        current: upgrades.fireRateLevel,
        max: maxLevel,
        cost: this.getUpgradeCost(upgrades.fireRateLevel),
        canAfford: this.currency >= this.getUpgradeCost(upgrades.fireRateLevel),
        maxed: upgrades.fireRateLevel >= maxLevel
      },
      magazine: {
        current: upgrades.magazineLevel,
        max: maxLevel,
        cost: this.getUpgradeCost(upgrades.magazineLevel),
        canAfford: this.currency >= this.getUpgradeCost(upgrades.magazineLevel),
        maxed: upgrades.magazineLevel >= maxLevel
      }
    };
  }
}

// Singleton instance
let upgradeSystemInstance = null;

export function getWeaponUpgradeSystem() {
  if (!upgradeSystemInstance) {
    upgradeSystemInstance = new WeaponUpgradeSystem();
  }
  return upgradeSystemInstance;
}

export default getWeaponUpgradeSystem;
