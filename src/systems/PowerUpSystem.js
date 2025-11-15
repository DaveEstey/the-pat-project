/**
 * Power-Up System - Temporary buffs and enhancements
 *
 * Power-up types:
 * - Double Damage: 2x damage for 15 seconds
 * - Rapid Fire: 2x fire rate for 12 seconds
 * - Shield: Absorbs next 3 hits
 * - Speed Boost: 1.5x movement speed for 10 seconds
 * - Infinite Ammo: No reload for 20 seconds
 * - Multi-Shot: Fire 3 projectiles for 15 seconds
 * - Critical Boost: 50% crit chance for 12 seconds
 * - Health Regen: Heal 5 HP/sec for 10 seconds
 */

import * as THREE from 'three';

export const PowerUpTypes = {
  DOUBLE_DAMAGE: 'double_damage',
  RAPID_FIRE: 'rapid_fire',
  SHIELD: 'shield',
  SPEED_BOOST: 'speed_boost',
  INFINITE_AMMO: 'infinite_ammo',
  MULTI_SHOT: 'multi_shot',
  CRITICAL_BOOST: 'critical_boost',
  HEALTH_REGEN: 'health_regen'
};

export class PowerUpSystem {
  constructor() {
    this.activePowerUps = new Map(); // type -> {startTime, duration, stacks}
    this.powerUpConfigs = this.initializePowerUpConfigs();
  }

  /**
   * Define all power-up configurations
   */
  initializePowerUpConfigs() {
    return {
      [PowerUpTypes.DOUBLE_DAMAGE]: {
        name: 'Double Damage',
        duration: 15000, // 15 seconds
        icon: '⚔️',
        color: 0xff4444,
        description: '2x damage',
        stackable: false,
        effects: {
          damageMultiplier: 2.0
        }
      },
      [PowerUpTypes.RAPID_FIRE]: {
        name: 'Rapid Fire',
        duration: 12000,
        icon: '🔥',
        color: 0xff8800,
        description: '2x fire rate',
        stackable: false,
        effects: {
          fireRateMultiplier: 2.0
        }
      },
      [PowerUpTypes.SHIELD]: {
        name: 'Shield',
        duration: 0, // Duration-less (hit-based)
        icon: '🛡️',
        color: 0x4444ff,
        description: 'Absorbs 3 hits',
        stackable: true,
        maxStacks: 3,
        effects: {
          shieldHits: 3
        }
      },
      [PowerUpTypes.SPEED_BOOST]: {
        name: 'Speed Boost',
        duration: 10000,
        icon: '⚡',
        color: 0xffff44,
        description: '1.5x movement speed',
        stackable: false,
        effects: {
          speedMultiplier: 1.5
        }
      },
      [PowerUpTypes.INFINITE_AMMO]: {
        name: 'Infinite Ammo',
        duration: 20000,
        icon: '∞',
        color: 0x44ff44,
        description: 'No reload needed',
        stackable: false,
        effects: {
          infiniteAmmo: true
        }
      },
      [PowerUpTypes.MULTI_SHOT]: {
        name: 'Multi-Shot',
        duration: 15000,
        icon: '✦',
        color: 0xff44ff,
        description: 'Fire 3 projectiles',
        stackable: false,
        effects: {
          projectileCount: 3,
          spreadAngle: 15 // degrees
        }
      },
      [PowerUpTypes.CRITICAL_BOOST]: {
        name: 'Critical Boost',
        duration: 12000,
        icon: '★',
        color: 0xffaa00,
        description: '50% crit chance',
        stackable: false,
        effects: {
          criticalChance: 0.5
        }
      },
      [PowerUpTypes.HEALTH_REGEN]: {
        name: 'Regeneration',
        duration: 10000,
        icon: '💚',
        color: 0x00ff88,
        description: '+5 HP/sec',
        stackable: false,
        effects: {
          healthPerSecond: 5
        }
      }
    };
  }

  /**
   * Activate a power-up
   */
  activatePowerUp(type) {
    const config = this.powerUpConfigs[type];
    if (!config) {
      console.warn(`Unknown power-up type: ${type}`);
      return false;
    }

    const currentTime = Date.now();

    // Check if already active
    if (this.activePowerUps.has(type)) {
      const existing = this.activePowerUps.get(type);

      if (config.stackable && existing.stacks < (config.maxStacks || 999)) {
        // Stack the power-up
        existing.stacks += 1;
        existing.startTime = currentTime; // Refresh duration
        this.emitPowerUpEvent('powerUpStacked', { type, stacks: existing.stacks });
      } else {
        // Refresh duration
        existing.startTime = currentTime;
        this.emitPowerUpEvent('powerUpRefreshed', { type });
      }
    } else {
      // Activate new power-up
      this.activePowerUps.set(type, {
        startTime: currentTime,
        duration: config.duration,
        stacks: 1,
        config: config
      });

      this.emitPowerUpEvent('powerUpActivated', {
        type,
        name: config.name,
        duration: config.duration,
        icon: config.icon
      });
    }

    return true;
  }

  /**
   * Update power-ups (remove expired ones)
   */
  update(deltaTime) {
    const currentTime = Date.now();

    // Check for expired power-ups
    const expired = [];
    this.activePowerUps.forEach((powerUp, type) => {
      if (powerUp.duration > 0) {
        const elapsed = currentTime - powerUp.startTime;
        if (elapsed >= powerUp.duration) {
          expired.push(type);
        }
      }
    });

    // Remove expired power-ups
    expired.forEach(type => {
      this.deactivatePowerUp(type);
    });

    // Apply health regen if active
    if (this.isActive(PowerUpTypes.HEALTH_REGEN)) {
      const regenRate = this.getEffect(PowerUpTypes.HEALTH_REGEN, 'healthPerSecond', 0);
      const healthGain = (regenRate * deltaTime) / 1000;

      this.emitPowerUpEvent('healthRegen', { amount: healthGain });
    }
  }

  /**
   * Deactivate a power-up
   */
  deactivatePowerUp(type) {
    const powerUp = this.activePowerUps.get(type);
    if (powerUp) {
      this.activePowerUps.delete(type);
      this.emitPowerUpEvent('powerUpExpired', {
        type,
        name: powerUp.config.name
      });
    }
  }

  /**
   * Check if a power-up is active
   */
  isActive(type) {
    return this.activePowerUps.has(type);
  }

  /**
   * Get remaining time for a power-up (in ms)
   */
  getRemainingTime(type) {
    const powerUp = this.activePowerUps.get(type);
    if (!powerUp || powerUp.duration === 0) return 0;

    const elapsed = Date.now() - powerUp.startTime;
    return Math.max(0, powerUp.duration - elapsed);
  }

  /**
   * Get progress (0.0 to 1.0) for a power-up
   */
  getProgress(type) {
    const powerUp = this.activePowerUps.get(type);
    if (!powerUp || powerUp.duration === 0) return 0;

    const elapsed = Date.now() - powerUp.startTime;
    return Math.min(elapsed / powerUp.duration, 1.0);
  }

  /**
   * Get a specific effect value from a power-up
   */
  getEffect(type, effectKey, defaultValue = 0) {
    const powerUp = this.activePowerUps.get(type);
    if (!powerUp) return defaultValue;

    const value = powerUp.config.effects[effectKey];
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Get number of stacks for a power-up
   */
  getStacks(type) {
    const powerUp = this.activePowerUps.get(type);
    return powerUp ? powerUp.stacks : 0;
  }

  /**
   * Consume one shield stack (for Shield power-up)
   */
  consumeShieldStack() {
    if (!this.isActive(PowerUpTypes.SHIELD)) return false;

    const shield = this.activePowerUps.get(PowerUpTypes.SHIELD);
    shield.stacks -= 1;

    this.emitPowerUpEvent('shieldHit', { remainingStacks: shield.stacks });

    if (shield.stacks <= 0) {
      this.deactivatePowerUp(PowerUpTypes.SHIELD);
    }

    return true;
  }

  /**
   * Get all active power-ups
   */
  getActivePowerUps() {
    const active = [];
    this.activePowerUps.forEach((powerUp, type) => {
      active.push({
        type,
        name: powerUp.config.name,
        icon: powerUp.config.icon,
        color: powerUp.config.color,
        duration: powerUp.duration,
        remainingTime: this.getRemainingTime(type),
        progress: this.getProgress(type),
        stacks: powerUp.stacks
      });
    });
    return active;
  }

  /**
   * Get combined damage multiplier from all active power-ups
   */
  getDamageMultiplier() {
    let multiplier = 1.0;
    if (this.isActive(PowerUpTypes.DOUBLE_DAMAGE)) {
      multiplier *= this.getEffect(PowerUpTypes.DOUBLE_DAMAGE, 'damageMultiplier', 1.0);
    }
    return multiplier;
  }

  /**
   * Get combined fire rate multiplier
   */
  getFireRateMultiplier() {
    let multiplier = 1.0;
    if (this.isActive(PowerUpTypes.RAPID_FIRE)) {
      multiplier *= this.getEffect(PowerUpTypes.RAPID_FIRE, 'fireRateMultiplier', 1.0);
    }
    return multiplier;
  }

  /**
   * Get combined speed multiplier
   */
  getSpeedMultiplier() {
    let multiplier = 1.0;
    if (this.isActive(PowerUpTypes.SPEED_BOOST)) {
      multiplier *= this.getEffect(PowerUpTypes.SPEED_BOOST, 'speedMultiplier', 1.0);
    }
    return multiplier;
  }

  /**
   * Check if player has infinite ammo
   */
  hasInfiniteAmmo() {
    return this.isActive(PowerUpTypes.INFINITE_AMMO);
  }

  /**
   * Check if player has shield protection
   */
  hasShield() {
    return this.isActive(PowerUpTypes.SHIELD) && this.getStacks(PowerUpTypes.SHIELD) > 0;
  }

  /**
   * Clear all active power-ups
   */
  clearAll() {
    const types = Array.from(this.activePowerUps.keys());
    types.forEach(type => this.deactivatePowerUp(type));
  }

  /**
   * Emit power-up events
   */
  emitPowerUpEvent(eventName, data) {
    window.dispatchEvent(new CustomEvent(eventName, {
      detail: data
    }));
  }
}

// Singleton instance
let powerUpSystemInstance = null;

export function getPowerUpSystem() {
  if (!powerUpSystemInstance) {
    powerUpSystemInstance = new PowerUpSystem();
  }
  return powerUpSystemInstance;
}

export default PowerUpSystem;
