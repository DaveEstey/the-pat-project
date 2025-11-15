/**
 * Weakpoint System - Manages enemy weakpoints and damage multipliers
 *
 * Features:
 * - Multiple weakpoints per enemy type
 * - Dynamic damage multipliers based on hit location
 * - Visual feedback for weakpoint hits
 * - Special weakpoint mechanics (armor breaking, stagger, etc)
 */

export class WeakpointSystem {
  constructor() {
    this.weakpointConfigs = this.initializeWeakpointConfigs();
  }

  /**
   * Define weakpoints for each enemy type
   */
  initializeWeakpointConfigs() {
    return {
      // Basic Shooter - Head is primary weakpoint
      basic: {
        weakpoints: [
          {
            name: 'head',
            hitbox: { yMin: 1.4, yMax: 2.0, radius: 0.3 },
            damageMultiplier: 2.5,
            effects: ['critical'],
            description: 'Headshot'
          },
          {
            name: 'chest',
            hitbox: { yMin: 0.6, yMax: 1.4, radius: 0.35 },
            damageMultiplier: 1.0,
            effects: [],
            description: 'Body shot'
          }
        ]
      },

      basic_shooter: {
        weakpoints: [
          {
            name: 'head',
            hitbox: { yMin: 1.4, yMax: 2.0, radius: 0.3 },
            damageMultiplier: 2.5,
            effects: ['critical'],
            description: 'Headshot'
          },
          {
            name: 'chest',
            hitbox: { yMin: 0.6, yMax: 1.4, radius: 0.35 },
            damageMultiplier: 1.0,
            effects: [],
            description: 'Body shot'
          }
        ]
      },

      // Armored Enemy - Head and exposed joints
      armored: {
        weakpoints: [
          {
            name: 'head',
            hitbox: { yMin: 1.6, yMax: 2.2, radius: 0.25 },
            damageMultiplier: 3.0, // Higher multiplier to compensate for armor
            effects: ['critical', 'armorBreak'],
            description: 'Headshot - Armor Penetration'
          },
          {
            name: 'joints',
            hitbox: { yMin: 0.8, yMax: 1.2, radius: 0.2 },
            damageMultiplier: 2.0,
            effects: ['stagger'],
            description: 'Joint Hit - Reduced armor'
          },
          {
            name: 'chest',
            hitbox: { yMin: 1.0, yMax: 1.6, radius: 0.4 },
            damageMultiplier: 0.5, // Heavily armored
            effects: [],
            description: 'Body shot - Armored'
          }
        ]
      },

      // Ninja - Small precise weakpoints
      ninja: {
        weakpoints: [
          {
            name: 'head',
            hitbox: { yMin: 1.3, yMax: 1.8, radius: 0.25 },
            damageMultiplier: 3.5, // Very high reward for precision
            effects: ['critical', 'instantKill'],
            description: 'Headshot - Instant Kill'
          },
          {
            name: 'back',
            hitbox: { yMin: 0.8, yMax: 1.5, radius: 0.3, requiresBackHit: true },
            damageMultiplier: 2.5,
            effects: ['critical', 'stagger'],
            description: 'Backstab'
          },
          {
            name: 'body',
            hitbox: { yMin: 0.5, yMax: 1.3, radius: 0.3 },
            damageMultiplier: 1.0,
            effects: [],
            description: 'Body shot'
          }
        ]
      },

      // Bomb Thrower - Explosive backpack weakpoint
      bomber: {
        weakpoints: [
          {
            name: 'backpack',
            hitbox: { yMin: 1.0, yMax: 1.8, radius: 0.4, requiresBackHit: true },
            damageMultiplier: 5.0, // Massive damage to bomb pack
            effects: ['critical', 'explosion', 'instantKill'],
            description: 'Explosive Backpack - Chain Reaction'
          },
          {
            name: 'head',
            hitbox: { yMin: 1.5, yMax: 2.0, radius: 0.28 },
            damageMultiplier: 2.0,
            effects: ['critical'],
            description: 'Headshot'
          },
          {
            name: 'body',
            hitbox: { yMin: 0.6, yMax: 1.5, radius: 0.35 },
            damageMultiplier: 1.0,
            effects: [],
            description: 'Body shot'
          }
        ]
      },

      // Fast Debuffer - Energy core weakpoint
      fast_debuffer: {
        weakpoints: [
          {
            name: 'core',
            hitbox: { yMin: 0.8, yMax: 1.2, radius: 0.25 },
            damageMultiplier: 3.0,
            effects: ['critical', 'disableAbility'],
            description: 'Energy Core - Disables Debuff'
          },
          {
            name: 'head',
            hitbox: { yMin: 1.4, yMax: 1.9, radius: 0.27 },
            damageMultiplier: 2.5,
            effects: ['critical'],
            description: 'Headshot'
          },
          {
            name: 'body',
            hitbox: { yMin: 0.5, yMax: 1.4, radius: 0.3 },
            damageMultiplier: 1.0,
            effects: [],
            description: 'Body shot'
          }
        ]
      },

      // Boss - Multiple phase-based weakpoints
      boss: {
        weakpoints: [
          {
            name: 'head',
            hitbox: { yMin: 2.5, yMax: 3.5, radius: 0.5 },
            damageMultiplier: 2.0,
            effects: ['critical'],
            description: 'Headshot',
            phases: [1, 2, 3] // Available in all phases
          },
          {
            name: 'core',
            hitbox: { yMin: 1.5, yMax: 2.5, radius: 0.6 },
            damageMultiplier: 3.0,
            effects: ['critical', 'phaseBreak'],
            description: 'Exposed Core',
            phases: [2, 3], // Only available in later phases
            requiresExposed: true
          },
          {
            name: 'body',
            hitbox: { yMin: 0.5, yMax: 2.5, radius: 0.8 },
            damageMultiplier: 0.5, // Heavy armor
            effects: [],
            description: 'Armored Body',
            phases: [1, 2, 3]
          }
        ]
      }
    };
  }

  /**
   * Check if a hit point is within a weakpoint hitbox
   */
  checkWeakpointHit(enemyType, hitPoint, enemyPosition, enemyFacing = { x: 0, z: 1 }, bossPhase = 1) {
    const config = this.weakpointConfigs[enemyType];
    if (!config) return null;

    // Calculate relative hit position
    const relativeY = hitPoint.y - enemyPosition.y;
    const relativeX = hitPoint.x - enemyPosition.x;
    const relativeZ = hitPoint.z - enemyPosition.z;
    const horizontalDistance = Math.sqrt(relativeX * relativeX + relativeZ * relativeZ);

    // Check if hit is from behind
    const hitAngle = Math.atan2(relativeZ, relativeX);
    const enemyAngle = Math.atan2(enemyFacing.z, enemyFacing.x);
    const angleDiff = Math.abs(hitAngle - enemyAngle);
    const isBackHit = angleDiff > Math.PI / 2 && angleDiff < (3 * Math.PI) / 2;

    // Check each weakpoint
    for (const weakpoint of config.weakpoints) {
      const hitbox = weakpoint.hitbox;

      // Check phase requirement for bosses
      if (weakpoint.phases && !weakpoint.phases.includes(bossPhase)) {
        continue;
      }

      // Check back hit requirement
      if (weakpoint.hitbox.requiresBackHit && !isBackHit) {
        continue;
      }

      // Check vertical bounds
      if (relativeY < hitbox.yMin || relativeY > hitbox.yMax) {
        continue;
      }

      // Check horizontal radius
      if (horizontalDistance > hitbox.radius) {
        continue;
      }

      // Hit confirmed!
      return {
        weakpoint: weakpoint.name,
        multiplier: weakpoint.damageMultiplier,
        effects: weakpoint.effects,
        description: weakpoint.description,
        isBackHit: isBackHit
      };
    }

    return null; // No weakpoint hit
  }

  /**
   * Calculate damage with weakpoint multipliers
   */
  calculateWeakpointDamage(baseDamage, weakpointHit) {
    if (!weakpointHit) return baseDamage;

    let finalDamage = baseDamage * weakpointHit.multiplier;

    // Instant kill effect
    if (weakpointHit.effects.includes('instantKill')) {
      finalDamage = 999999; // Effectively instant kill
    }

    return Math.floor(finalDamage);
  }

  /**
   * Get visual feedback color for weakpoint hit
   */
  getWeakpointColor(weakpointHit) {
    if (!weakpointHit) return 0xff0000; // Red for normal hit

    // Special colors for different weakpoints
    if (weakpointHit.effects.includes('instantKill')) {
      return 0xff00ff; // Magenta for instant kill
    }
    if (weakpointHit.effects.includes('critical')) {
      return 0xffff00; // Yellow for critical
    }
    if (weakpointHit.effects.includes('explosion')) {
      return 0xff8800; // Orange for explosive
    }
    if (weakpointHit.effects.includes('armorBreak')) {
      return 0x00ffff; // Cyan for armor break
    }

    return 0xff6600; // Orange for generic weakpoint
  }

  /**
   * Get damage text size multiplier for visual feedback
   */
  getDamageTextScale(weakpointHit) {
    if (!weakpointHit) return 1.0;

    if (weakpointHit.effects.includes('instantKill')) {
      return 2.5;
    }
    if (weakpointHit.effects.includes('critical')) {
      return 1.8;
    }
    if (weakpointHit.multiplier >= 2.0) {
      return 1.5;
    }

    return 1.2;
  }

  /**
   * Get all weakpoint info for an enemy type (for UI/tutorial)
   */
  getWeakpointInfo(enemyType) {
    const config = this.weakpointConfigs[enemyType];
    if (!config) return null;

    return {
      enemyType,
      weakpoints: config.weakpoints.map(wp => ({
        name: wp.name,
        description: wp.description,
        multiplier: wp.multiplier,
        effects: wp.effects
      }))
    };
  }
}

// Singleton instance
let weakpointSystemInstance = null;

export function getWeakpointSystem() {
  if (!weakpointSystemInstance) {
    weakpointSystemInstance = new WeakpointSystem();
  }
  return weakpointSystemInstance;
}

export default WeakpointSystem;
