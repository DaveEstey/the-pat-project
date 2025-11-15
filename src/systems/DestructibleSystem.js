/**
 * Destructible System
 * Manages interactive objects that can be destroyed and used as cover
 */

import * as THREE from 'three';

// Destructible object types
export const DestructibleTypes = {
  WOODEN_CRATE: 'wooden_crate',
  METAL_BOX: 'metal_box',
  CONCRETE_BARRIER: 'concrete_barrier',
  GLASS_PANEL: 'glass_panel',
  SANDBAG_WALL: 'sandbag_wall',
  OIL_DRUM: 'oil_drum',
  VEHICLE_WRECK: 'vehicle_wreck',
  FURNITURE: 'furniture'
};

// Singleton instance
let destructibleSystemInstance = null;

/**
 * Initialize the Destructible System
 * @param {Object} gameEngine - Game engine instance
 * @returns {DestructibleSystem}
 */
export function initializeDestructibleSystem(gameEngine) {
  if (destructibleSystemInstance) {
    console.warn('[DestructibleSystem] Already initialized, returning existing instance');
    return destructibleSystemInstance;
  }

  destructibleSystemInstance = new DestructibleSystem(gameEngine);
  console.log('[DestructibleSystem] Initialized');
  return destructibleSystemInstance;
}

/**
 * Get the Destructible System instance
 * @returns {DestructibleSystem}
 */
export function getDestructibleSystem() {
  if (!destructibleSystemInstance) {
    console.error('[DestructibleSystem] Not initialized! Call initializeDestructibleSystem() first');
    return null;
  }
  return destructibleSystemInstance;
}

export class DestructibleSystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.activeDestructibles = new Map(); // id -> destructible data
    this.destructibleMeshes = new Map(); // id -> Three.js mesh
    this.destructibleConfigs = this.initializeDestructibleConfigs();

    // Cover system
    this.coverAreas = new Map(); // id -> cover area data

    console.log('[DestructibleSystem] System initialized with', Object.keys(this.destructibleConfigs).length, 'types');
  }

  initializeDestructibleConfigs() {
    return {
      [DestructibleTypes.WOODEN_CRATE]: {
        name: 'Wooden Crate',
        health: 40,
        coverValue: 0.3, // Blocks 30% of damage
        size: { width: 1.5, height: 1.5, depth: 1.5 },
        color: 0x8B4513,
        rewards: [
          { type: 'health', value: 10, chance: 0.3 },
          { type: 'ammo', value: 20, chance: 0.5 },
          { type: 'points', value: 25, chance: 1.0 }
        ],
        fragmentCount: 8,
        mass: 1.0
      },

      [DestructibleTypes.METAL_BOX]: {
        name: 'Metal Box',
        health: 100,
        coverValue: 0.6, // Blocks 60% of damage
        size: { width: 2, height: 2, depth: 2 },
        color: 0x708090,
        rewards: [
          { type: 'health', value: 20, chance: 0.2 },
          { type: 'ammo', value: 50, chance: 0.6 },
          { type: 'points', value: 50, chance: 1.0 }
        ],
        fragmentCount: 12,
        mass: 3.0
      },

      [DestructibleTypes.CONCRETE_BARRIER]: {
        name: 'Concrete Barrier',
        health: 200,
        coverValue: 0.8, // Blocks 80% of damage
        size: { width: 3, height: 1.2, depth: 0.6 },
        color: 0x808080,
        rewards: [
          { type: 'points', value: 75, chance: 1.0 }
        ],
        fragmentCount: 15,
        mass: 5.0
      },

      [DestructibleTypes.GLASS_PANEL]: {
        name: 'Glass Panel',
        health: 20,
        coverValue: 0.1, // Blocks 10% of damage (minimal)
        size: { width: 2, height: 2.5, depth: 0.1 },
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.3,
        rewards: [
          { type: 'points', value: 10, chance: 1.0 }
        ],
        fragmentCount: 20, // Shatters into many pieces
        mass: 0.5
      },

      [DestructibleTypes.SANDBAG_WALL]: {
        name: 'Sandbag Wall',
        health: 150,
        coverValue: 0.7, // Blocks 70% of damage
        size: { width: 2.5, height: 1.5, depth: 0.8 },
        color: 0xD2B48C,
        rewards: [
          { type: 'health', value: 15, chance: 0.4 },
          { type: 'points', value: 40, chance: 1.0 }
        ],
        fragmentCount: 10,
        mass: 4.0
      },

      [DestructibleTypes.OIL_DRUM]: {
        name: 'Oil Drum',
        health: 60,
        coverValue: 0.4, // Blocks 40% of damage
        size: { width: 1.2, height: 1.8, depth: 1.2 },
        color: 0x2F4F4F,
        rewards: [
          { type: 'points', value: 30, chance: 1.0 }
        ],
        fragmentCount: 8,
        mass: 2.0,
        flammable: true // Can ignite and cause small explosion
      },

      [DestructibleTypes.VEHICLE_WRECK]: {
        name: 'Vehicle Wreck',
        health: 250,
        coverValue: 0.85, // Blocks 85% of damage
        size: { width: 4, height: 2, depth: 2.5 },
        color: 0x4A4A4A,
        rewards: [
          { type: 'health', value: 25, chance: 0.15 },
          { type: 'ammo', value: 75, chance: 0.5 },
          { type: 'points', value: 100, chance: 1.0 }
        ],
        fragmentCount: 20,
        mass: 8.0
      },

      [DestructibleTypes.FURNITURE]: {
        name: 'Furniture',
        health: 50,
        coverValue: 0.35, // Blocks 35% of damage
        size: { width: 1.8, height: 1.2, depth: 1.8 },
        color: 0x654321,
        rewards: [
          { type: 'health', value: 5, chance: 0.2 },
          { type: 'points', value: 15, chance: 1.0 }
        ],
        fragmentCount: 6,
        mass: 1.5
      }
    };
  }

  /**
   * Spawn a destructible object
   */
  spawnDestructible(type, position, options = {}) {
    const config = this.destructibleConfigs[type];
    if (!config) {
      console.error('[DestructibleSystem] Unknown destructible type:', type);
      return null;
    }

    const destructibleId = `destructible_${type}_${Date.now()}_${Math.random()}`;

    const destructible = {
      id: destructibleId,
      type,
      position: { ...position },
      config: { ...config, ...options },
      health: config.health,
      maxHealth: config.health,
      isDestroyed: false,
      providingCover: false,
      entitiesBehindCover: new Set(),
      lastDamageTime: 0
    };

    this.activeDestructibles.set(destructibleId, destructible);

    // Create visual mesh
    const mesh = this.createDestructibleMesh(destructible);
    if (mesh) {
      this.destructibleMeshes.set(destructibleId, mesh);
      this.gameEngine.getScene().add(mesh);
    }

    // Register as cover area
    this.registerCoverArea(destructible);

    console.log(`[DestructibleSystem] Spawned ${config.name} at`, position);
    return destructible;
  }

  /**
   * Create 3D mesh for destructible
   */
  createDestructibleMesh(destructible) {
    const config = destructible.config;
    const geometry = new THREE.BoxGeometry(
      config.size.width,
      config.size.height,
      config.size.depth
    );

    const materialOptions = {
      color: config.color
    };

    if (config.transparent) {
      materialOptions.transparent = true;
      materialOptions.opacity = config.opacity || 0.5;
    }

    const material = new THREE.MeshStandardMaterial(materialOptions);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(
      destructible.position.x,
      destructible.position.y + config.size.height / 2,
      destructible.position.z
    );

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.destructibleId = destructible.id;
    mesh.userData.type = 'destructible';

    return mesh;
  }

  /**
   * Register object as cover area
   */
  registerCoverArea(destructible) {
    const config = destructible.config;

    const coverArea = {
      id: destructible.id,
      position: destructible.position,
      bounds: {
        minX: destructible.position.x - config.size.width / 2,
        maxX: destructible.position.x + config.size.width / 2,
        minY: destructible.position.y,
        maxY: destructible.position.y + config.size.height,
        minZ: destructible.position.z - config.size.depth / 2,
        maxZ: destructible.position.z + config.size.depth / 2
      },
      coverValue: config.coverValue,
      active: true
    };

    this.coverAreas.set(destructible.id, coverArea);
  }

  /**
   * Damage a destructible object
   */
  damageDestructible(destructibleId, damage) {
    const destructible = this.activeDestructibles.get(destructibleId);
    if (!destructible || destructible.isDestroyed) {
      return false;
    }

    destructible.health -= damage;
    destructible.lastDamageTime = Date.now();

    // Update visual damage state
    this.updateDestructibleVisuals(destructible);

    // Emit damage event
    window.dispatchEvent(new CustomEvent('destructibleDamaged', {
      detail: {
        destructibleId,
        damage,
        remainingHealth: destructible.health,
        maxHealth: destructible.maxHealth,
        position: destructible.position
      }
    }));

    if (destructible.health <= 0) {
      this.destroyDestructible(destructibleId);
    }

    return true;
  }

  /**
   * Update visuals based on damage
   */
  updateDestructibleVisuals(destructible) {
    const mesh = this.destructibleMeshes.get(destructible.id);
    if (!mesh) return;

    const healthPercent = destructible.health / destructible.maxHealth;

    // Darken color as health decreases
    const baseColor = new THREE.Color(destructible.config.color);
    const damageColor = baseColor.clone().multiplyScalar(0.5 + healthPercent * 0.5);
    mesh.material.color = damageColor;

    // Add damage shake/wobble
    if (destructible.lastDamageTime > Date.now() - 200) {
      const wobble = (Math.random() - 0.5) * 0.1;
      mesh.rotation.z += wobble;
    }
  }

  /**
   * Destroy a destructible object
   */
  destroyDestructible(destructibleId) {
    const destructible = this.activeDestructibles.get(destructibleId);
    if (!destructible || destructible.isDestroyed) {
      return;
    }

    destructible.isDestroyed = true;

    // Create destruction effects
    this.createDestructionEffect(destructible);

    // Award rewards
    this.awardRewards(destructible);

    // Handle special destruction (oil drum fire, etc.)
    if (destructible.config.flammable) {
      this.createFireExplosion(destructible.position);
    }

    // Remove mesh
    const mesh = this.destructibleMeshes.get(destructibleId);
    if (mesh) {
      this.gameEngine.getScene().remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
      this.destructibleMeshes.delete(destructibleId);
    }

    // Remove cover area
    const coverArea = this.coverAreas.get(destructibleId);
    if (coverArea) {
      coverArea.active = false;
      this.coverAreas.delete(destructibleId);
    }

    // Clean up after delay
    setTimeout(() => {
      this.activeDestructibles.delete(destructibleId);
    }, 5000);

    // Emit destruction event
    window.dispatchEvent(new CustomEvent('destructibleDestroyed', {
      detail: {
        destructibleId,
        type: destructible.type,
        position: destructible.position
      }
    }));

    console.log(`[DestructibleSystem] Destroyed ${destructible.config.name}`);
  }

  /**
   * Create visual destruction effect with fragments
   */
  createDestructionEffect(destructible) {
    const config = destructible.config;
    const fragmentCount = config.fragmentCount || 10;

    for (let i = 0; i < fragmentCount; i++) {
      const fragmentSize = Math.max(config.size.width, config.size.height, config.size.depth) / 4;
      const geometry = new THREE.BoxGeometry(
        fragmentSize * Math.random(),
        fragmentSize * Math.random(),
        fragmentSize * Math.random()
      );

      const material = new THREE.MeshStandardMaterial({
        color: config.color,
        opacity: 0.8,
        transparent: true
      });

      const fragment = new THREE.Mesh(geometry, material);
      fragment.position.set(
        destructible.position.x + (Math.random() - 0.5) * config.size.width,
        destructible.position.y + (Math.random() - 0.5) * config.size.height,
        destructible.position.z + (Math.random() - 0.5) * config.size.depth
      );

      // Random rotation
      fragment.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      this.gameEngine.getScene().add(fragment);

      // Animate fragment falling and fading
      const velocity = {
        x: (Math.random() - 0.5) * 2,
        y: Math.random() * 2 + 1,
        z: (Math.random() - 0.5) * 2
      };

      const rotationVelocity = {
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.1,
        z: (Math.random() - 0.5) * 0.1
      };

      const animateFragment = () => {
        fragment.position.x += velocity.x * 0.016;
        fragment.position.y += velocity.y * 0.016;
        fragment.position.z += velocity.z * 0.016;

        velocity.y -= 9.8 * 0.016; // Gravity

        fragment.rotation.x += rotationVelocity.x;
        fragment.rotation.y += rotationVelocity.y;
        fragment.rotation.z += rotationVelocity.z;

        material.opacity -= 0.01;

        if (material.opacity > 0 && fragment.position.y > -5) {
          requestAnimationFrame(animateFragment);
        } else {
          this.gameEngine.getScene().remove(fragment);
          geometry.dispose();
          material.dispose();
        }
      };

      animateFragment();
    }
  }

  /**
   * Award rewards for destroying object
   */
  awardRewards(destructible) {
    const rewards = destructible.config.rewards || [];

    rewards.forEach(reward => {
      if (Math.random() <= reward.chance) {
        window.dispatchEvent(new CustomEvent('destructibleReward', {
          detail: {
            type: reward.type,
            value: reward.value,
            position: destructible.position
          }
        }));
      }
    });
  }

  /**
   * Create fire explosion for flammable objects
   */
  createFireExplosion(position) {
    // Small fire effect
    window.dispatchEvent(new CustomEvent('hazardExplosion', {
      detail: {
        position,
        radius: 4,
        damage: 20
      }
    }));
  }

  /**
   * Check if position is behind cover
   */
  isPositionInCover(position, fromPosition) {
    for (const [id, coverArea] of this.coverAreas) {
      if (!coverArea.active) continue;

      // Check if position is within cover bounds
      const inBounds =
        position.x >= coverArea.bounds.minX &&
        position.x <= coverArea.bounds.maxX &&
        position.y >= coverArea.bounds.minY &&
        position.y <= coverArea.bounds.maxY &&
        position.z >= coverArea.bounds.minZ &&
        position.z <= coverArea.bounds.maxZ;

      if (inBounds) {
        return {
          inCover: true,
          coverValue: coverArea.coverValue,
          coverId: id
        };
      }

      // Check if cover is between position and fromPosition
      const isBetween = this.isCoverBetweenPositions(position, fromPosition, coverArea);
      if (isBetween) {
        return {
          inCover: true,
          coverValue: coverArea.coverValue,
          coverId: id
        };
      }
    }

    return { inCover: false, coverValue: 0, coverId: null };
  }

  /**
   * Check if cover is between two positions (line-of-sight blocking)
   */
  isCoverBetweenPositions(pos1, pos2, coverArea) {
    // Simple line-AABB intersection check
    const direction = {
      x: pos2.x - pos1.x,
      y: pos2.y - pos1.y,
      z: pos2.z - pos1.z
    };

    const length = Math.sqrt(
      direction.x * direction.x +
      direction.y * direction.y +
      direction.z * direction.z
    );

    if (length === 0) return false;

    direction.x /= length;
    direction.y /= length;
    direction.z /= length;

    // Check intersection with cover AABB
    const tMin = {
      x: (coverArea.bounds.minX - pos1.x) / direction.x,
      y: (coverArea.bounds.minY - pos1.y) / direction.y,
      z: (coverArea.bounds.minZ - pos1.z) / direction.z
    };

    const tMax = {
      x: (coverArea.bounds.maxX - pos1.x) / direction.x,
      y: (coverArea.bounds.maxY - pos1.y) / direction.y,
      z: (coverArea.bounds.maxZ - pos1.z) / direction.z
    };

    const tMinMax = Math.max(
      Math.min(tMin.x, tMax.x),
      Math.min(tMin.y, tMax.y),
      Math.min(tMin.z, tMax.z)
    );

    const tMaxMin = Math.min(
      Math.max(tMin.x, tMax.x),
      Math.max(tMin.y, tMax.y),
      Math.max(tMin.z, tMax.z)
    );

    return tMinMax <= tMaxMin && tMaxMin >= 0 && tMinMax <= length;
  }

  /**
   * Get all active destructibles
   */
  getActiveDestructibles() {
    return Array.from(this.activeDestructibles.values());
  }

  /**
   * Remove a destructible
   */
  removeDestructible(destructibleId) {
    const destructible = this.activeDestructibles.get(destructibleId);
    if (!destructible) return;

    const mesh = this.destructibleMeshes.get(destructibleId);
    if (mesh) {
      this.gameEngine.getScene().remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
      this.destructibleMeshes.delete(destructibleId);
    }

    this.coverAreas.delete(destructibleId);
    this.activeDestructibles.delete(destructibleId);
  }

  /**
   * Clear all destructibles
   */
  clearAll() {
    this.activeDestructibles.forEach((_, id) => {
      this.removeDestructible(id);
    });
  }
}
