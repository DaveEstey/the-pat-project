/**
 * Boss Arena System
 * Creates dynamic boss arenas with interactive elements and hazards
 */

import * as THREE from 'three';

export const ArenaType = {
  COLISEUM: 'coliseum',      // Circular arena with pillars
  TECH_CHAMBER: 'tech_chamber', // High-tech room with platforms
  VOLCANIC: 'volcanic',       // Lava flows and platforms
  ICE_PALACE: 'ice_palace',   // Slippery floor with ice pillars
  GRAVEYARD: 'graveyard'      // Tombstones and fog
};

export const ArenaElement = {
  PLATFORM: 'platform',       // Movable platforms
  PILLAR: 'pillar',           // Cover pillars that can be destroyed
  HAZARD_ZONE: 'hazard_zone', // Periodic damage zones
  BUFF_ZONE: 'buff_zone',     // Power-up zones
  SPAWNER: 'spawner',         // Minion spawn points
  SHIELD_GENERATOR: 'shield_generator', // Boss shields
  TURRET: 'turret',           // Automated turrets
  INTERACTIVE_SWITCH: 'interactive_switch' // Activate to change arena
};

class BossArenaSystem {
  constructor() {
    this.activeArenas = new Map(); // arenaId -> arena data
    this.arenaConfigs = new Map(); // arenaType -> config
    this.arenaElements = new Map(); // arenaId -> Set of element meshes

    this.initializeArenaConfigs();

    console.log('[BossArenaSystem] Initialized');
  }

  /**
   * Initialize arena configurations
   */
  initializeArenaConfigs() {
    // Coliseum Arena - Classic boss fight
    this.arenaConfigs.set(ArenaType.COLISEUM, {
      name: 'Ancient Coliseum',
      size: { width: 40, depth: 40, height: 20 },
      shape: 'circular',
      elements: [
        {
          type: ArenaElement.PILLAR,
          count: 8,
          health: 500,
          placement: 'circle', // Arranged in circle
          radius: 15,
          size: { width: 2, height: 5, depth: 2 }
        },
        {
          type: ArenaElement.HAZARD_ZONE,
          count: 3,
          damage: 10,
          activationPattern: 'sequential', // One at a time
          activeDuration: 3000,
          cooldownDuration: 2000,
          placement: 'floor',
          radius: 4
        }
      ],
      boundaryType: 'wall', // Solid walls
      lighting: {
        ambient: 0.3,
        directional: { intensity: 0.8, color: 0xffaa66 }
      },
      mechanics: [
        'destructible_pillars', // Pillars provide cover
        'periodic_hazards'      // Floor hazards activate periodically
      ]
    });

    // Tech Chamber - High-tech boss fight
    this.arenaConfigs.set(ArenaType.TECH_CHAMBER, {
      name: 'Technomancer Chamber',
      size: { width: 50, depth: 50, height: 30 },
      shape: 'rectangular',
      elements: [
        {
          type: ArenaElement.PLATFORM,
          count: 6,
          movementPattern: 'vertical', // Move up/down
          moveSpeed: 2,
          moveRange: 5,
          size: { width: 6, depth: 6, height: 1 }
        },
        {
          type: ArenaElement.TURRET,
          count: 4,
          health: 200,
          attackRate: 2000,
          damage: 15,
          placement: 'corners'
        },
        {
          type: ArenaElement.SHIELD_GENERATOR,
          count: 2,
          health: 500,
          shieldAmount: 1000,
          regenRate: 50, // Shield regen per second
          placement: 'sides'
        },
        {
          type: ArenaElement.BUFF_ZONE,
          count: 2,
          buffType: 'damage_boost',
          buffDuration: 10000,
          placement: 'center_sides'
        }
      ],
      boundaryType: 'energy_field', // Electric boundary
      lighting: {
        ambient: 0.4,
        directional: { intensity: 1.0, color: 0x00ffff }
      },
      mechanics: [
        'moving_platforms',      // Platforms move vertically
        'turret_defense',        // Turrets attack player
        'shield_generators',     // Must destroy to damage boss
        'buff_zones'             // Power-up zones
      ]
    });

    // Volcanic Arena - Lava and heat
    this.arenaConfigs.set(ArenaType.VOLCANIC, {
      name: 'Infernal Caldera',
      size: { width: 45, depth: 45, height: 25 },
      shape: 'irregular',
      elements: [
        {
          type: ArenaElement.PLATFORM,
          count: 10,
          movementPattern: 'sinking', // Sink into lava
          sinkTime: 5000,
          respawnTime: 3000,
          size: { width: 4, depth: 4, height: 1 }
        },
        {
          type: ArenaElement.HAZARD_ZONE,
          count: 5,
          damage: 20,
          damageType: 'fire',
          activationPattern: 'random',
          activeDuration: 4000,
          cooldownDuration: 1000,
          placement: 'lava_pools',
          radius: 5
        },
        {
          type: ArenaElement.PILLAR,
          count: 6,
          health: 300,
          placement: 'scattered',
          size: { width: 3, height: 8, depth: 3 },
          destructible: true
        }
      ],
      boundaryType: 'lava', // Lava boundary (instant death)
      lighting: {
        ambient: 0.5,
        directional: { intensity: 0.9, color: 0xff4400 }
      },
      mechanics: [
        'sinking_platforms',   // Platforms sink into lava
        'lava_hazards',        // Lava eruptions
        'heat_damage'          // Passive damage over time
      ]
    });

    // Ice Palace - Slippery and cold
    this.arenaConfigs.set(ArenaType.ICE_PALACE, {
      name: 'Frozen Throne Room',
      size: { width: 42, depth: 42, height: 22 },
      shape: 'circular',
      elements: [
        {
          type: ArenaElement.PILLAR,
          count: 12,
          health: 400,
          placement: 'circle',
          radius: 12,
          size: { width: 2, height: 6, depth: 2 },
          material: 'ice', // Can slide off
          destructible: true
        },
        {
          type: ArenaElement.HAZARD_ZONE,
          count: 4,
          damage: 15,
          damageType: 'ice',
          debuff: 'slow', // Slows player
          activationPattern: 'wave', // Activates in waves
          activeDuration: 3500,
          cooldownDuration: 1500,
          placement: 'quadrants',
          radius: 6
        },
        {
          type: ArenaElement.INTERACTIVE_SWITCH,
          count: 3,
          effect: 'disable_hazards',
          effectDuration: 8000,
          cooldown: 12000,
          placement: 'outer_ring'
        }
      ],
      boundaryType: 'ice_wall',
      lighting: {
        ambient: 0.6,
        directional: { intensity: 1.0, color: 0xaaddff }
      },
      mechanics: [
        'slippery_floor',      // Reduced traction
        'freezing_hazards',    // Ice damage zones
        'ice_pillars',         // Destructible cover
        'hazard_switches'      // Disable hazards temporarily
      ]
    });

    // Graveyard Arena - Undead boss fight
    this.arenaConfigs.set(ArenaType.GRAVEYARD, {
      name: 'Necropolis Arena',
      size: { width: 48, depth: 48, height: 20 },
      shape: 'rectangular',
      elements: [
        {
          type: ArenaElement.SPAWNER,
          count: 6,
          spawnType: 'zombie',
          spawnRate: 8000,
          maxSpawns: 3, // Max 3 at a time per spawner
          placement: 'perimeter'
        },
        {
          type: ArenaElement.PILLAR,
          count: 15,
          health: 250,
          placement: 'scattered',
          size: { width: 1.5, height: 4, depth: 1.5 },
          material: 'tombstone',
          destructible: false // Indestructible tombstones
        },
        {
          type: ArenaElement.HAZARD_ZONE,
          count: 3,
          damage: 12,
          damageType: 'poison',
          debuff: 'poison_dot', // Damage over time
          activationPattern: 'persistent',
          placement: 'center_pools',
          radius: 5
        },
        {
          type: ArenaElement.BUFF_ZONE,
          count: 1,
          buffType: 'health_regen',
          buffDuration: 15000,
          placement: 'center',
          radius: 3
        }
      ],
      boundaryType: 'fog', // Dense fog boundary (blocks vision)
      lighting: {
        ambient: 0.2,
        directional: { intensity: 0.5, color: 0x66ff66 }
      },
      mechanics: [
        'minion_spawners',     // Continuously spawn enemies
        'poison_pools',        // Persistent poison damage
        'tombstone_cover',     // Indestructible cover
        'health_shrine'        // Healing zone
      ]
    });

    console.log(`[BossArenaSystem] Loaded ${this.arenaConfigs.size} arena configurations`);
  }

  /**
   * Create arena for boss fight
   */
  createArena(arenaType, position, bossId) {
    const config = this.arenaConfigs.get(arenaType);
    if (!config) {
      console.error(`[BossArenaSystem] Unknown arena type: ${arenaType}`);
      return null;
    }

    const arenaId = `arena_${bossId}_${Date.now()}`;

    const arena = {
      id: arenaId,
      type: arenaType,
      name: config.name,
      bossId,
      position: { ...position },
      config,
      activeElements: [],
      elementStates: new Map(), // Track state of interactive elements
      active: true,
      createdTime: Date.now()
    };

    this.activeArenas.set(arenaId, arena);

    // Emit arena created event
    window.dispatchEvent(new CustomEvent('bossArenaCreated', {
      detail: {
        arenaId,
        arenaType,
        name: config.name,
        bossId,
        position
      }
    }));

    console.log(`[BossArenaSystem] Created ${config.name} for boss ${bossId}`);

    return arena;
  }

  /**
   * Activate arena element
   */
  activateElement(arenaId, elementType, elementIndex = 0) {
    const arena = this.activeArenas.get(arenaId);
    if (!arena) return;

    window.dispatchEvent(new CustomEvent('arenaElementActivated', {
      detail: {
        arenaId,
        elementType,
        elementIndex
      }
    }));

    console.log(`[BossArenaSystem] Activated ${elementType} #${elementIndex} in ${arena.name}`);
  }

  /**
   * Deactivate arena element
   */
  deactivateElement(arenaId, elementType, elementIndex = 0) {
    const arena = this.activeArenas.get(arenaId);
    if (!arena) return;

    window.dispatchEvent(new CustomEvent('arenaElementDeactivated', {
      detail: {
        arenaId,
        elementType,
        elementIndex
      }
    }));

    console.log(`[BossArenaSystem] Deactivated ${elementType} #${elementIndex} in ${arena.name}`);
  }

  /**
   * Damage arena element
   */
  damageElement(arenaId, elementType, elementIndex, damage) {
    const arena = this.activeArenas.get(arenaId);
    if (!arena) return;

    const elementConfig = arena.config.elements.find(e => e.type === elementType);
    if (!elementConfig || !elementConfig.health) return;

    // Track element health
    const stateKey = `${elementType}_${elementIndex}`;
    if (!arena.elementStates.has(stateKey)) {
      arena.elementStates.set(stateKey, {
        health: elementConfig.health,
        maxHealth: elementConfig.health,
        destroyed: false
      });
    }

    const state = arena.elementStates.get(stateKey);
    if (state.destroyed) return;

    state.health = Math.max(0, state.health - damage);

    if (state.health <= 0) {
      state.destroyed = true;

      window.dispatchEvent(new CustomEvent('arenaElementDestroyed', {
        detail: {
          arenaId,
          elementType,
          elementIndex
        }
      }));

      console.log(`[BossArenaSystem] Destroyed ${elementType} #${elementIndex}`);
    }
  }

  /**
   * Interact with arena switch
   */
  interactWithSwitch(arenaId, switchIndex) {
    const arena = this.activeArenas.get(arenaId);
    if (!arena) return;

    const switchConfig = arena.config.elements.find(e => e.type === ArenaElement.INTERACTIVE_SWITCH);
    if (!switchConfig) return;

    window.dispatchEvent(new CustomEvent('arenaSwitchActivated', {
      detail: {
        arenaId,
        switchIndex,
        effect: switchConfig.effect,
        duration: switchConfig.effectDuration
      }
    }));

    console.log(`[BossArenaSystem] Activated switch #${switchIndex}: ${switchConfig.effect}`);
  }

  /**
   * Update arena (handle periodic effects, moving platforms, etc.)
   */
  update(deltaTime) {
    this.activeArenas.forEach(arena => {
      if (!arena.active) return;

      // Update hazard zones
      const hazardElements = arena.config.elements.filter(e => e.type === ArenaElement.HAZARD_ZONE);
      hazardElements.forEach((hazard, index) => {
        if (hazard.activationPattern === 'sequential' || hazard.activationPattern === 'random') {
          // Emit hazard activation events based on timing
          if (Math.random() < 0.01) { // 1% chance per frame
            window.dispatchEvent(new CustomEvent('arenaHazardActivated', {
              detail: {
                arenaId: arena.id,
                hazardIndex: index,
                damage: hazard.damage,
                damageType: hazard.damageType || 'normal',
                radius: hazard.radius
              }
            }));
          }
        }
      });

      // Update spawners
      const spawnerElements = arena.config.elements.filter(e => e.type === ArenaElement.SPAWNER);
      spawnerElements.forEach((spawner, index) => {
        const stateKey = `spawner_${index}`;
        if (!arena.elementStates.has(stateKey)) {
          arena.elementStates.set(stateKey, {
            lastSpawn: 0,
            activeCount: 0
          });
        }

        const state = arena.elementStates.get(stateKey);
        const now = Date.now();

        if (now - state.lastSpawn >= spawner.spawnRate && state.activeCount < spawner.maxSpawns) {
          window.dispatchEvent(new CustomEvent('arenaSpawnerTriggered', {
            detail: {
              arenaId: arena.id,
              spawnerIndex: index,
              spawnType: spawner.spawnType
            }
          }));

          state.lastSpawn = now;
          state.activeCount++;
        }
      });
    });
  }

  /**
   * Destroy arena when boss is defeated
   */
  destroyArena(arenaId) {
    const arena = this.activeArenas.get(arenaId);
    if (!arena) return;

    arena.active = false;

    window.dispatchEvent(new CustomEvent('bossArenaDestroyed', {
      detail: { arenaId }
    }));

    console.log(`[BossArenaSystem] Destroyed arena: ${arena.name}`);

    // Clean up after delay
    setTimeout(() => {
      this.activeArenas.delete(arenaId);
      this.arenaElements.delete(arenaId);
    }, 2000);
  }

  /**
   * Get arena data
   */
  getArena(arenaId) {
    return this.activeArenas.get(arenaId);
  }

  /**
   * Get all active arenas
   */
  getActiveArenas() {
    return Array.from(this.activeArenas.values()).filter(a => a.active);
  }

  /**
   * Clean up all arenas
   */
  cleanup() {
    this.activeArenas.clear();
    this.arenaElements.clear();
    console.log('[BossArenaSystem] Cleaned up');
  }
}

// Singleton instance
let arenaSystemInstance = null;

export function initializeBossArenaSystem() {
  if (arenaSystemInstance) {
    console.warn('[BossArenaSystem] Already initialized');
    return arenaSystemInstance;
  }

  arenaSystemInstance = new BossArenaSystem();
  return arenaSystemInstance;
}

export function getBossArenaSystem() {
  if (!arenaSystemInstance) {
    console.warn('[BossArenaSystem] Not initialized, creating new instance');
    return initializeBossArenaSystem();
  }
  return arenaSystemInstance;
}

export default BossArenaSystem;
