/**
 * Multiphase Boss Battle System
 * Manages bosses with multiple phases, unique attacks, and special mechanics
 */

import * as THREE from 'three';

export const BossPhase = {
  INTRO: 'intro',
  PHASE_1: 'phase_1',
  PHASE_2: 'phase_2',
  PHASE_3: 'phase_3',
  FINAL_PHASE: 'final_phase',
  DEFEATED: 'defeated'
};

export const BossAttackPattern = {
  STANDARD_SHOT: 'standard_shot',
  BURST_FIRE: 'burst_fire',
  SPREAD_SHOT: 'spread_shot',
  LASER_BEAM: 'laser_beam',
  MISSILE_BARRAGE: 'missile_barrage',
  SUMMON_MINIONS: 'summon_minions',
  CHARGE_ATTACK: 'charge_attack',
  AREA_DENIAL: 'area_denial',
  SHIELD_PHASE: 'shield_phase',
  ENRAGE: 'enrage'
};

export const BossType = {
  TANK: 'tank',              // High HP, slow, heavy damage
  SPEEDSTER: 'speedster',    // Fast movement, quick attacks
  TECH: 'tech',              // Summons turrets/drones
  ELEMENTAL: 'elemental',    // Fire/Ice/Electric attacks
  NECROMANCER: 'necromancer' // Summons enemies
};

class MultiphaseBossSystem {
  constructor() {
    this.activeBosses = new Map(); // bossId -> boss data
    this.bossConfigs = new Map();  // bossType -> config template
    this.phaseTransitions = new Map(); // bossId -> transition animation

    this.initializeBossConfigs();

    console.log('[MultiphaseBossSystem] Initialized');
  }

  /**
   * Initialize boss type configurations
   */
  initializeBossConfigs() {
    // Tank Boss Configuration
    this.bossConfigs.set(BossType.TANK, {
      name: 'Armored Juggernaut',
      maxHealth: 10000,
      phases: [
        {
          phase: BossPhase.PHASE_1,
          healthThreshold: 1.0,
          attackPatterns: [BossAttackPattern.STANDARD_SHOT, BossAttackPattern.CHARGE_ATTACK],
          attackRate: 2000,
          moveSpeed: 2,
          weakpoints: ['head'],
          immunities: [],
          specialMechanics: []
        },
        {
          phase: BossPhase.PHASE_2,
          healthThreshold: 0.66,
          attackPatterns: [BossAttackPattern.BURST_FIRE, BossAttackPattern.AREA_DENIAL],
          attackRate: 1500,
          moveSpeed: 3,
          weakpoints: ['head', 'core'],
          immunities: [],
          specialMechanics: ['armor_plates'] // Must destroy armor first
        },
        {
          phase: BossPhase.FINAL_PHASE,
          healthThreshold: 0.33,
          attackPatterns: [BossAttackPattern.MISSILE_BARRAGE, BossAttackPattern.ENRAGE],
          attackRate: 1000,
          moveSpeed: 4,
          weakpoints: ['core'],
          immunities: ['explosion'], // Immune to explosive damage
          specialMechanics: ['enrage_buff'] // Increased damage output
        }
      ],
      rewards: {
        score: 10000,
        currency: 500,
        items: ['boss_key_1', 'heavy_armor_upgrade']
      }
    });

    // Speedster Boss Configuration
    this.bossConfigs.set(BossType.SPEEDSTER, {
      name: 'Velocity Phantom',
      maxHealth: 5000,
      phases: [
        {
          phase: BossPhase.PHASE_1,
          healthThreshold: 1.0,
          attackPatterns: [BossAttackPattern.STANDARD_SHOT],
          attackRate: 1200,
          moveSpeed: 8,
          weakpoints: ['head'],
          immunities: [],
          specialMechanics: ['dash_attack']
        },
        {
          phase: BossPhase.PHASE_2,
          healthThreshold: 0.5,
          attackPatterns: [BossAttackPattern.BURST_FIRE, BossAttackPattern.SPREAD_SHOT],
          attackRate: 800,
          moveSpeed: 12,
          weakpoints: ['head'],
          immunities: [],
          specialMechanics: ['dash_attack', 'afterimage'] // Leaves decoys
        },
        {
          phase: BossPhase.FINAL_PHASE,
          healthThreshold: 0.25,
          attackPatterns: [BossAttackPattern.LASER_BEAM],
          attackRate: 500,
          moveSpeed: 15,
          weakpoints: ['core'],
          immunities: [],
          specialMechanics: ['teleport', 'time_slow'] // Slows player
        }
      ],
      rewards: {
        score: 7500,
        currency: 350,
        items: ['boss_key_2', 'speed_boost_permanent']
      }
    });

    // Tech Boss Configuration
    this.bossConfigs.set(BossType.TECH, {
      name: 'Technomancer Prime',
      maxHealth: 7500,
      phases: [
        {
          phase: BossPhase.PHASE_1,
          healthThreshold: 1.0,
          attackPatterns: [BossAttackPattern.STANDARD_SHOT],
          attackRate: 1500,
          moveSpeed: 4,
          weakpoints: ['head'],
          immunities: [],
          specialMechanics: ['shield_drones'] // 2 shield drones
        },
        {
          phase: BossPhase.PHASE_2,
          healthThreshold: 0.6,
          attackPatterns: [BossAttackPattern.SUMMON_MINIONS, BossAttackPattern.BURST_FIRE],
          attackRate: 1200,
          moveSpeed: 5,
          weakpoints: ['head', 'core'],
          immunities: [],
          specialMechanics: ['turret_summon', 'emp_field'] // Summons turrets, EMP disables grapple
        },
        {
          phase: BossPhase.FINAL_PHASE,
          healthThreshold: 0.3,
          attackPatterns: [BossAttackPattern.LASER_BEAM, BossAttackPattern.MISSILE_BARRAGE],
          attackRate: 1000,
          moveSpeed: 6,
          weakpoints: ['core'],
          immunities: ['electric'],
          specialMechanics: ['overcharge'] // All turrets attack simultaneously
        }
      ],
      rewards: {
        score: 9000,
        currency: 425,
        items: ['boss_key_3', 'tech_upgrade']
      }
    });

    // Elemental Boss Configuration
    this.bossConfigs.set(BossType.ELEMENTAL, {
      name: 'Infernal Titan',
      maxHealth: 8000,
      phases: [
        {
          phase: BossPhase.PHASE_1,
          healthThreshold: 1.0,
          attackPatterns: [BossAttackPattern.STANDARD_SHOT],
          attackRate: 1800,
          moveSpeed: 3,
          weakpoints: ['head'],
          immunities: ['fire'],
          specialMechanics: ['fire_aura'] // Burns ground around boss
        },
        {
          phase: BossPhase.PHASE_2,
          healthThreshold: 0.66,
          attackPatterns: [BossAttackPattern.AREA_DENIAL, BossAttackPattern.SPREAD_SHOT],
          attackRate: 1400,
          moveSpeed: 4,
          weakpoints: ['head', 'hands'],
          immunities: ['fire', 'ice'],
          specialMechanics: ['fire_pillars', 'ice_switch'] // Alternates fire/ice
        },
        {
          phase: BossPhase.FINAL_PHASE,
          healthThreshold: 0.33,
          attackPatterns: [BossAttackPattern.MISSILE_BARRAGE, BossAttackPattern.LASER_BEAM],
          attackRate: 1000,
          moveSpeed: 5,
          weakpoints: ['core'],
          immunities: ['fire', 'ice', 'electric'],
          specialMechanics: ['elemental_storm'] // Random element attacks
        }
      ],
      rewards: {
        score: 8500,
        currency: 400,
        items: ['boss_key_4', 'elemental_resistance']
      }
    });

    // Necromancer Boss Configuration
    this.bossConfigs.set(BossType.NECROMANCER, {
      name: 'Death Lord',
      maxHealth: 6000,
      phases: [
        {
          phase: BossPhase.PHASE_1,
          healthThreshold: 1.0,
          attackPatterns: [BossAttackPattern.STANDARD_SHOT, BossAttackPattern.SUMMON_MINIONS],
          attackRate: 2000,
          moveSpeed: 3,
          weakpoints: ['head'],
          immunities: [],
          specialMechanics: ['summon_zombies'] // Spawns 3 zombies every 10s
        },
        {
          phase: BossPhase.PHASE_2,
          healthThreshold: 0.5,
          attackPatterns: [BossAttackPattern.BURST_FIRE, BossAttackPattern.SUMMON_MINIONS],
          attackRate: 1500,
          moveSpeed: 4,
          weakpoints: ['head', 'staff'],
          immunities: [],
          specialMechanics: ['summon_elites', 'life_drain'] // Spawns elite enemies, heals from minion deaths
        },
        {
          phase: BossPhase.FINAL_PHASE,
          healthThreshold: 0.25,
          attackPatterns: [BossAttackPattern.AREA_DENIAL, BossAttackPattern.SUMMON_MINIONS],
          attackRate: 1200,
          moveSpeed: 5,
          weakpoints: ['core'],
          immunities: [],
          specialMechanics: ['resurrect', 'death_field'] // Can revive once, poison AoE
        }
      ],
      rewards: {
        score: 8000,
        currency: 375,
        items: ['boss_key_5', 'necro_amulet']
      }
    });

    console.log(`[MultiphaseBossSystem] Loaded ${this.bossConfigs.size} boss configurations`);
  }

  /**
   * Spawn a boss
   */
  spawnBoss(bossType, position, levelNumber = 1) {
    const config = this.bossConfigs.get(bossType);
    if (!config) {
      console.error(`[MultiphaseBossSystem] Unknown boss type: ${bossType}`);
      return null;
    }

    const bossId = `boss_${bossType}_${Date.now()}`;

    // Scale health based on level
    const levelScaling = 1 + (levelNumber - 1) * 0.2; // +20% per level
    const maxHealth = Math.floor(config.maxHealth * levelScaling);

    const boss = {
      id: bossId,
      type: bossType,
      name: config.name,
      position: { ...position },
      health: maxHealth,
      maxHealth: maxHealth,
      currentPhase: BossPhase.INTRO,
      phaseData: null,
      attackCooldown: 0,
      lastAttackTime: 0,
      defeated: false,
      levelNumber,
      rewards: config.rewards,
      summonedMinions: [],
      specialMechanicStates: new Map()
    };

    // Set to first phase
    this.transitionToPhase(boss, BossPhase.PHASE_1);

    this.activeBosses.set(bossId, boss);

    // Emit boss spawn event
    window.dispatchEvent(new CustomEvent('bossSpawned', {
      detail: {
        bossId,
        bossType,
        name: config.name,
        maxHealth
      }
    }));

    console.log(`[MultiphaseBossSystem] Spawned ${config.name} (${bossType}) at level ${levelNumber}`);

    return boss;
  }

  /**
   * Transition boss to next phase
   */
  transitionToPhase(boss, newPhase) {
    const config = this.bossConfigs.get(boss.type);
    const phaseConfig = config.phases.find(p => p.phase === newPhase);

    if (!phaseConfig) {
      console.error(`[MultiphaseBossSystem] Invalid phase: ${newPhase}`);
      return;
    }

    boss.currentPhase = newPhase;
    boss.phaseData = phaseConfig;

    // Emit phase transition event
    window.dispatchEvent(new CustomEvent('bossPhaseTransition', {
      detail: {
        bossId: boss.id,
        phase: newPhase,
        healthPercent: boss.health / boss.maxHealth
      }
    }));

    console.log(`[MultiphaseBossSystem] ${boss.name} transitioned to ${newPhase}`);
  }

  /**
   * Damage boss and check for phase transitions
   */
  damageBoss(bossId, damage, damageType = 'normal') {
    const boss = this.activeBosses.get(bossId);
    if (!boss || boss.defeated) return false;

    // Check immunities
    if (boss.phaseData.immunities.includes(damageType)) {
      console.log(`[MultiphaseBossSystem] ${boss.name} is immune to ${damageType} damage`);
      return false;
    }

    // Apply damage
    boss.health = Math.max(0, boss.health - damage);

    const healthPercent = boss.health / boss.maxHealth;

    // Emit damage event
    window.dispatchEvent(new CustomEvent('bossDamaged', {
      detail: {
        bossId,
        damage,
        health: boss.health,
        maxHealth: boss.maxHealth,
        healthPercent
      }
    }));

    // Check for phase transitions
    const config = this.bossConfigs.get(boss.type);
    const nextPhase = config.phases.find(p =>
      p.healthThreshold <= healthPercent &&
      p.phase !== boss.currentPhase &&
      this.getPhaseOrder(p.phase) > this.getPhaseOrder(boss.currentPhase)
    );

    if (nextPhase) {
      this.transitionToPhase(boss, nextPhase.phase);
    }

    // Check for defeat
    if (boss.health <= 0) {
      this.defeatBoss(bossId);
    }

    return true;
  }

  /**
   * Get phase order for comparison
   */
  getPhaseOrder(phase) {
    const order = {
      [BossPhase.INTRO]: 0,
      [BossPhase.PHASE_1]: 1,
      [BossPhase.PHASE_2]: 2,
      [BossPhase.PHASE_3]: 3,
      [BossPhase.FINAL_PHASE]: 4,
      [BossPhase.DEFEATED]: 5
    };
    return order[phase] || 0;
  }

  /**
   * Handle boss defeat
   */
  defeatBoss(bossId) {
    const boss = this.activeBosses.get(bossId);
    if (!boss) return;

    boss.defeated = true;
    boss.currentPhase = BossPhase.DEFEATED;

    // Emit defeat event with rewards
    window.dispatchEvent(new CustomEvent('bossDefeated', {
      detail: {
        bossId,
        bossType: boss.type,
        name: boss.name,
        rewards: boss.rewards,
        levelNumber: boss.levelNumber
      }
    }));

    console.log(`[MultiphaseBossSystem] ${boss.name} defeated!`);

    // Clean up after delay
    setTimeout(() => {
      this.removeBoss(bossId);
    }, 3000);
  }

  /**
   * Remove boss from active list
   */
  removeBoss(bossId) {
    this.activeBosses.delete(bossId);
    console.log(`[MultiphaseBossSystem] Removed boss: ${bossId}`);
  }

  /**
   * Get boss data
   */
  getBoss(bossId) {
    return this.activeBosses.get(bossId);
  }

  /**
   * Get all active bosses
   */
  getActiveBosses() {
    return Array.from(this.activeBosses.values());
  }

  /**
   * Update boss AI and attacks
   */
  update(deltaTime) {
    const currentTime = Date.now();

    this.activeBosses.forEach(boss => {
      if (boss.defeated || boss.currentPhase === BossPhase.INTRO) return;

      // Check if boss can attack
      if (currentTime - boss.lastAttackTime >= boss.phaseData.attackRate) {
        this.performBossAttack(boss);
        boss.lastAttackTime = currentTime;
      }

      // Update special mechanics
      this.updateSpecialMechanics(boss, deltaTime);
    });
  }

  /**
   * Perform boss attack
   */
  performBossAttack(boss) {
    const patterns = boss.phaseData.attackPatterns;
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];

    // Emit attack event for the game to handle
    window.dispatchEvent(new CustomEvent('bossAttack', {
      detail: {
        bossId: boss.id,
        attackPattern: pattern,
        position: boss.position,
        phase: boss.currentPhase
      }
    }));

    console.log(`[MultiphaseBossSystem] ${boss.name} used ${pattern}`);
  }

  /**
   * Update special mechanics per phase
   */
  updateSpecialMechanics(boss, deltaTime) {
    boss.phaseData.specialMechanics.forEach(mechanic => {
      // Handle different special mechanics
      switch (mechanic) {
        case 'summon_zombies':
        case 'summon_elites':
        case 'turret_summon':
          // Emit summon event
          if (Math.random() < 0.01) { // 1% chance per frame
            window.dispatchEvent(new CustomEvent('bossSummonMinions', {
              detail: {
                bossId: boss.id,
                minionType: mechanic,
                position: boss.position
              }
            }));
          }
          break;

        case 'enrage_buff':
          // Boss gets stronger over time
          break;

        case 'fire_aura':
        case 'death_field':
          // Persistent damage fields
          window.dispatchEvent(new CustomEvent('bossAuraActive', {
            detail: {
              bossId: boss.id,
              auraType: mechanic,
              position: boss.position,
              radius: 5
            }
          }));
          break;
      }
    });
  }

  /**
   * Clean up all bosses
   */
  cleanup() {
    this.activeBosses.clear();
    this.phaseTransitions.clear();
    console.log('[MultiphaseBossSystem] Cleaned up');
  }
}

// Singleton instance
let bossSystemInstance = null;

export function initializeMultiphaseBossSystem() {
  if (bossSystemInstance) {
    console.warn('[MultiphaseBossSystem] Already initialized');
    return bossSystemInstance;
  }

  bossSystemInstance = new MultiphaseBossSystem();
  return bossSystemInstance;
}

export function getMultiphaseBossSystem() {
  if (!bossSystemInstance) {
    console.warn('[MultiphaseBossSystem] Not initialized, creating new instance');
    return initializeMultiphaseBossSystem();
  }
  return bossSystemInstance;
}

export default MultiphaseBossSystem;
