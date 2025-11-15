/**
 * Hazard System - Environmental hazards like explosive barrels, traps, lasers, etc.
 *
 * Features:
 * - Explosive barrels that damage enemies and player
 * - Laser grids with timed patterns
 * - Floor spikes that activate periodically
 * - Toxic gas clouds
 * - Flame jets
 * - Electrified floors
 * - Falling debris
 */

import * as THREE from 'three';

export const HazardTypes = {
  EXPLOSIVE_BARREL: 'explosive_barrel',
  LASER_GRID: 'laser_grid',
  FLOOR_SPIKES: 'floor_spikes',
  TOXIC_GAS: 'toxic_gas',
  FLAME_JET: 'flame_jet',
  ELECTRIC_FLOOR: 'electric_floor',
  FALLING_DEBRIS: 'falling_debris'
};

export class HazardSystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.activeHazards = new Map(); // id -> hazard data
    this.hazardMeshes = new Map(); // id -> Three.js mesh
    this.hazardConfigs = this.initializeHazardConfigs();
  }

  /**
   * Initialize hazard type configurations
   */
  initializeHazardConfigs() {
    return {
      [HazardTypes.EXPLOSIVE_BARREL]: {
        name: 'Explosive Barrel',
        health: 30,
        explosionRadius: 5,
        explosionDamage: 80,
        color: 0xff4400,
        glowColor: 0xff6600
      },
      [HazardTypes.LASER_GRID]: {
        name: 'Laser Grid',
        damage: 20,
        damageInterval: 500, // 0.5s damage tick
        activeTime: 3000, // 3s active
        inactiveTime: 2000, // 2s inactive
        color: 0xff0000,
        glowColor: 0xff4444
      },
      [HazardTypes.FLOOR_SPIKES]: {
        name: 'Floor Spikes',
        damage: 40,
        activeTime: 1500, // 1.5s active
        inactiveTime: 3000, // 3s inactive
        warningTime: 500, // 0.5s warning before activation
        color: 0x888888,
        glowColor: 0xff0000
      },
      [HazardTypes.TOXIC_GAS]: {
        name: 'Toxic Gas Cloud',
        damage: 15,
        damageInterval: 1000, // 1s damage tick
        radius: 3,
        duration: 10000, // 10s duration
        color: 0x00ff00,
        opacity: 0.5
      },
      [HazardTypes.FLAME_JET]: {
        name: 'Flame Jet',
        damage: 50,
        damageInterval: 200, // 0.2s damage tick
        activeTime: 2000, // 2s active
        inactiveTime: 4000, // 4s inactive
        warningTime: 800, // 0.8s warning
        color: 0xff4400,
        glowColor: 0xffaa00
      },
      [HazardTypes.ELECTRIC_FLOOR]: {
        name: 'Electrified Floor',
        damage: 25,
        damageInterval: 300, // 0.3s damage tick
        activeTime: 2500, // 2.5s active
        inactiveTime: 3500, // 3.5s inactive
        color: 0x4444ff,
        glowColor: 0x8888ff
      },
      [HazardTypes.FALLING_DEBRIS]: {
        name: 'Falling Debris',
        damage: 100,
        warningTime: 1500, // 1.5s warning
        fallDuration: 500, // 0.5s fall time
        radius: 2,
        color: 0x666666
      }
    };
  }

  /**
   * Spawn a hazard at a position
   */
  spawnHazard(type, position, options = {}) {
    const config = this.hazardConfigs[type];
    if (!config) {
      console.warn(`Unknown hazard type: ${type}`);
      return null;
    }

    const hazardId = `hazard_${type}_${Date.now()}_${Math.random()}`;

    const hazard = {
      id: hazardId,
      type,
      position: { ...position },
      config: { ...config, ...options },
      state: 'inactive',
      health: config.health || Infinity,
      lastActivation: 0,
      lastDamage: 0,
      cycleStartTime: Date.now(),
      affectedEntities: new Set()
    };

    this.activeHazards.set(hazardId, hazard);

    // Create visual representation
    const mesh = this.createHazardMesh(hazard);
    if (mesh) {
      this.hazardMeshes.set(hazardId, mesh);
      this.gameEngine.getScene().add(mesh);
    }

    // Start hazard behavior
    this.initializeHazardBehavior(hazard);

    this.emitHazardEvent('hazardSpawned', { hazard });

    return hazard;
  }

  /**
   * Create visual mesh for hazard
   */
  createHazardMesh(hazard) {
    const { type, position, config } = hazard;

    switch (type) {
      case HazardTypes.EXPLOSIVE_BARREL:
        return this.createExplosiveBarrelMesh(position, config);
      case HazardTypes.LASER_GRID:
        return this.createLaserGridMesh(position, config);
      case HazardTypes.FLOOR_SPIKES:
        return this.createFloorSpikesMesh(position, config);
      case HazardTypes.TOXIC_GAS:
        return this.createToxicGasMesh(position, config);
      case HazardTypes.FLAME_JET:
        return this.createFlameJetMesh(position, config);
      case HazardTypes.ELECTRIC_FLOOR:
        return this.createElectricFloorMesh(position, config);
      case HazardTypes.FALLING_DEBRIS:
        return this.createFallingDebrisMesh(position, config);
      default:
        return null;
    }
  }

  createExplosiveBarrelMesh(position, config) {
    const group = new THREE.Group();

    // Barrel body
    const barrelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.2, 12);
    const barrelMaterial = new THREE.MeshLambertMaterial({
      color: config.color,
      emissive: config.glowColor,
      emissiveIntensity: 0.3
    });
    const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
    barrel.position.y = 0.6;
    barrel.userData = { hazardType: 'explosive_barrel', destructible: true };
    group.add(barrel);

    // Warning stripes
    const stripeGeometry = new THREE.RingGeometry(0.45, 0.55, 32);
    const stripeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      side: THREE.DoubleSide
    });
    for (let i = 0; i < 3; i++) {
      const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
      stripe.rotation.x = Math.PI / 2;
      stripe.position.y = 0.3 + i * 0.3;
      group.add(stripe);
    }

    group.position.set(position.x, position.y, position.z);
    return group;
  }

  createLaserGridMesh(position, config) {
    const group = new THREE.Group();

    // Laser emitters
    const emitterGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const emitterMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });

    const emitter1 = new THREE.Mesh(emitterGeometry, emitterMaterial);
    emitter1.position.set(-2, 1, 0);
    group.add(emitter1);

    const emitter2 = new THREE.Mesh(emitterGeometry, emitterMaterial);
    emitter2.position.set(2, 1, 0);
    group.add(emitter2);

    // Laser beam (starts inactive)
    const beamGeometry = new THREE.BoxGeometry(4, 0.05, 0.05);
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: 0
    });
    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    beam.position.set(0, 1, 0);
    beam.userData = { isLaserBeam: true };
    group.add(beam);

    group.position.set(position.x, position.y, position.z);
    group.userData = { hazardType: 'laser_grid' };
    return group;
  }

  createFloorSpikesMesh(position, config) {
    const group = new THREE.Group();

    // Base plate
    const plateGeometry = new THREE.BoxGeometry(2, 0.1, 2);
    const plateMaterial = new THREE.MeshLambertMaterial({ color: config.color });
    const plate = new THREE.Mesh(plateGeometry, plateMaterial);
    group.add(plate);

    // Spikes (retracted initially)
    for (let x = -0.7; x <= 0.7; x += 0.7) {
      for (let z = -0.7; z <= 0.7; z += 0.7) {
        const spikeGeometry = new THREE.ConeGeometry(0.15, 0.8, 4);
        const spikeMaterial = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
        const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
        spike.position.set(x, -0.3, z); // Retracted
        spike.userData = { isSpike: true, retractedY: -0.3, extendedY: 0.5 };
        group.add(spike);
      }
    }

    group.position.set(position.x, position.y, position.z);
    group.userData = { hazardType: 'floor_spikes' };
    return group;
  }

  createToxicGasMesh(position, config) {
    const gasGeometry = new THREE.SphereGeometry(config.radius, 16, 16);
    const gasMaterial = new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: 0
    });
    const gas = new THREE.Mesh(gasGeometry, gasMaterial);
    gas.position.set(position.x, position.y + config.radius, position.z);
    gas.userData = { hazardType: 'toxic_gas' };
    return gas;
  }

  createFlameJetMesh(position, config) {
    const group = new THREE.Group();

    // Nozzle
    const nozzleGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.5, 8);
    const nozzleMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const nozzle = new THREE.Mesh(nozzleGeometry, nozzleMaterial);
    nozzle.rotation.x = Math.PI / 2;
    group.add(nozzle);

    // Flame (invisible when inactive)
    const flameGeometry = new THREE.ConeGeometry(0.5, 2, 8);
    const flameMaterial = new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: 0
    });
    const flame = new THREE.Mesh(flameGeometry, flameMaterial);
    flame.position.z = 1;
    flame.rotation.x = -Math.PI / 2;
    flame.userData = { isFlame: true };
    group.add(flame);

    group.position.set(position.x, position.y + 0.25, position.z);
    group.userData = { hazardType: 'flame_jet' };
    return group;
  }

  createElectricFloorMesh(position, config) {
    const plateGeometry = new THREE.BoxGeometry(3, 0.05, 3);
    const plateMaterial = new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: 0.3
    });
    const plate = new THREE.Mesh(plateGeometry, plateMaterial);
    plate.position.set(position.x, position.y, position.z);
    plate.userData = { hazardType: 'electric_floor' };
    return plate;
  }

  createFallingDebrisMesh(position, config) {
    // Warning indicator on ground
    const indicatorGeometry = new THREE.RingGeometry(config.radius * 0.8, config.radius, 32);
    const indicatorMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0
    });
    const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
    indicator.rotation.x = -Math.PI / 2;
    indicator.position.set(position.x, position.y + 0.01, position.z);
    indicator.userData = { hazardType: 'falling_debris', isIndicator: true };
    return indicator;
  }

  /**
   * Initialize hazard behavior patterns
   */
  initializeHazardBehavior(hazard) {
    switch (hazard.type) {
      case HazardTypes.LASER_GRID:
      case HazardTypes.FLOOR_SPIKES:
      case HazardTypes.FLAME_JET:
      case HazardTypes.ELECTRIC_FLOOR:
        // Periodic activation
        hazard.state = 'inactive';
        break;
      case HazardTypes.EXPLOSIVE_BARREL:
        // Reactive (explodes when shot)
        hazard.state = 'armed';
        break;
      case HazardTypes.TOXIC_GAS:
        // Continuous damage
        hazard.state = 'active';
        this.activateToxicGas(hazard);
        break;
      case HazardTypes.FALLING_DEBRIS:
        // Triggered once
        hazard.state = 'warning';
        this.triggerFallingDebris(hazard);
        break;
    }
  }

  /**
   * Update hazards
   */
  update(deltaTime, playerPosition) {
    this.activeHazards.forEach(hazard => {
      switch (hazard.type) {
        case HazardTypes.LASER_GRID:
          this.updateLaserGrid(hazard, deltaTime, playerPosition);
          break;
        case HazardTypes.FLOOR_SPIKES:
          this.updateFloorSpikes(hazard, deltaTime, playerPosition);
          break;
        case HazardTypes.FLAME_JET:
          this.updateFlameJet(hazard, deltaTime, playerPosition);
          break;
        case HazardTypes.ELECTRIC_FLOOR:
          this.updateElectricFloor(hazard, deltaTime, playerPosition);
          break;
        case HazardTypes.TOXIC_GAS:
          this.updateToxicGas(hazard, deltaTime, playerPosition);
          break;
      }
    });
  }

  updateLaserGrid(hazard, deltaTime, playerPosition) {
    const { config } = hazard;
    const currentTime = Date.now();
    const cycleTime = currentTime - hazard.cycleStartTime;
    const totalCycleTime = config.activeTime + config.inactiveTime;
    const cycleProgress = cycleTime % totalCycleTime;

    const mesh = this.hazardMeshes.get(hazard.id);
    if (!mesh) return;

    const beam = mesh.children.find(child => child.userData.isLaserBeam);
    if (!beam) return;

    if (cycleProgress < config.activeTime) {
      // Active
      hazard.state = 'active';
      beam.material.opacity = 0.8;
      this.checkLaserHit(hazard, beam, playerPosition);
    } else {
      // Inactive
      hazard.state = 'inactive';
      beam.material.opacity = 0;
      hazard.affectedEntities.clear();
    }
  }

  updateFloorSpikes(hazard, deltaTime, playerPosition) {
    const { config } = hazard;
    const currentTime = Date.now();
    const cycleTime = currentTime - hazard.cycleStartTime;
    const totalCycleTime = config.activeTime + config.inactiveTime + config.warningTime;
    const cycleProgress = cycleTime % totalCycleTime;

    const mesh = this.hazardMeshes.get(hazard.id);
    if (!mesh) return;

    const spikes = mesh.children.filter(child => child.userData.isSpike);

    if (cycleProgress < config.warningTime) {
      // Warning
      hazard.state = 'warning';
      // Flash warning
      spikes.forEach(spike => {
        spike.material.emissive = new THREE.Color(0xff0000);
        spike.material.emissiveIntensity = Math.sin(currentTime * 0.01) * 0.5 + 0.5;
      });
    } else if (cycleProgress < config.warningTime + config.activeTime) {
      // Active
      if (hazard.state !== 'active') {
        hazard.state = 'active';
        // Extend spikes
        spikes.forEach(spike => {
          spike.position.y = spike.userData.extendedY;
          spike.material.emissive = new THREE.Color(0x000000);
        });
      }
      this.checkSpikeDamage(hazard, playerPosition);
    } else {
      // Inactive
      if (hazard.state !== 'inactive') {
        hazard.state = 'inactive';
        // Retract spikes
        spikes.forEach(spike => {
          spike.position.y = spike.userData.retractedY;
          spike.material.emissive = new THREE.Color(0x000000);
        });
        hazard.affectedEntities.clear();
      }
    }
  }

  updateFlameJet(hazard, deltaTime, playerPosition) {
    const { config } = hazard;
    const currentTime = Date.now();
    const cycleTime = currentTime - hazard.cycleStartTime;
    const totalCycleTime = config.activeTime + config.inactiveTime + config.warningTime;
    const cycleProgress = cycleTime % totalCycleTime;

    const mesh = this.hazardMeshes.get(hazard.id);
    if (!mesh) return;

    const flame = mesh.children.find(child => child.userData.isFlame);
    if (!flame) return;

    if (cycleProgress < config.warningTime) {
      // Warning
      hazard.state = 'warning';
      flame.material.opacity = Math.sin(currentTime * 0.02) * 0.3;
    } else if (cycleProgress < config.warningTime + config.activeTime) {
      // Active
      hazard.state = 'active';
      flame.material.opacity = 0.8 + Math.sin(currentTime * 0.02) * 0.2;
      this.checkFlameDamage(hazard, playerPosition);
    } else {
      // Inactive
      hazard.state = 'inactive';
      flame.material.opacity = 0;
      hazard.affectedEntities.clear();
    }
  }

  updateElectricFloor(hazard, deltaTime, playerPosition) {
    const { config } = hazard;
    const currentTime = Date.now();
    const cycleTime = currentTime - hazard.cycleStartTime;
    const totalCycleTime = config.activeTime + config.inactiveTime;
    const cycleProgress = cycleTime % totalCycleTime;

    const mesh = this.hazardMeshes.get(hazard.id);
    if (!mesh) return;

    if (cycleProgress < config.activeTime) {
      // Active
      hazard.state = 'active';
      mesh.material.opacity = 0.7 + Math.sin(currentTime * 0.02) * 0.2;
      mesh.material.emissive = new THREE.Color(config.glowColor);
      mesh.material.emissiveIntensity = 0.5;
      this.checkElectricDamage(hazard, playerPosition);
    } else {
      // Inactive
      hazard.state = 'inactive';
      mesh.material.opacity = 0.3;
      mesh.material.emissive = new THREE.Color(0x000000);
      hazard.affectedEntities.clear();
    }
  }

  updateToxicGas(hazard, deltaTime, playerPosition) {
    const currentTime = Date.now();
    const elapsed = currentTime - hazard.cycleStartTime;

    if (elapsed > hazard.config.duration) {
      this.removeHazard(hazard.id);
      return;
    }

    const mesh = this.hazardMeshes.get(hazard.id);
    if (mesh) {
      // Pulse opacity
      mesh.material.opacity = hazard.config.opacity + Math.sin(currentTime * 0.003) * 0.2;
    }

    this.checkGasDamage(hazard, playerPosition);
  }

  activateToxicGas(hazard) {
    const mesh = this.hazardMeshes.get(hazard.id);
    if (mesh) {
      mesh.material.opacity = hazard.config.opacity;
    }
  }

  triggerFallingDebris(hazard) {
    const mesh = this.hazardMeshes.get(hazard.id);
    if (!mesh) return;

    // Show warning indicator
    mesh.material.opacity = 0.6;

    setTimeout(() => {
      // Drop debris
      hazard.state = 'falling';
      this.checkDebrisDamage(hazard);

      setTimeout(() => {
        this.removeHazard(hazard.id);
      }, hazard.config.fallDuration);
    }, hazard.config.warningTime);
  }

  /**
   * Damage check methods
   */
  checkLaserHit(hazard, beam, playerPosition) {
    if (!playerPosition) return;

    const currentTime = Date.now();
    if (currentTime - hazard.lastDamage < hazard.config.damageInterval) return;

    // Check if player is within laser beam area (4 units wide, centered at hazard position)
    const dx = Math.abs(playerPosition.x - hazard.position.x);
    const dz = Math.abs(playerPosition.z - hazard.position.z);
    const dy = Math.abs(playerPosition.y - (hazard.position.y + 1)); // Laser at y+1

    // Laser beam is 4 units wide horizontally, 0.5 unit thick vertically
    if (dx <= 2 && dy <= 0.5 && dz <= 3) {
      hazard.lastDamage = currentTime;
      this.emitHazardEvent('hazardDamage', {
        hazardId: hazard.id,
        type: hazard.type,
        damage: hazard.config.damage,
        position: hazard.position
      });
    }
  }

  checkSpikeDamage(hazard, playerPosition) {
    if (!playerPosition) return;

    const currentTime = Date.now();
    if (currentTime - hazard.lastDamage < 1000) return; // 1s cooldown

    // Check if player is within spike area (2x2 platform)
    const dx = Math.abs(playerPosition.x - hazard.position.x);
    const dz = Math.abs(playerPosition.z - hazard.position.z);
    const dy = Math.abs(playerPosition.y - hazard.position.y);

    // Spikes are on a 2x2 platform, check if player is standing on it
    if (dx <= 1 && dz <= 1 && dy <= 1) {
      hazard.lastDamage = currentTime;
      this.emitHazardEvent('hazardDamage', {
        hazardId: hazard.id,
        type: hazard.type,
        damage: hazard.config.damage,
        position: hazard.position
      });
    }
  }

  checkFlameDamage(hazard, playerPosition) {
    if (!playerPosition) return;

    const currentTime = Date.now();
    if (currentTime - hazard.lastDamage < hazard.config.damageInterval) return;

    // Check if player is in flame jet path (2 unit cone extending forward)
    const dx = playerPosition.x - hazard.position.x;
    const dz = playerPosition.z - hazard.position.z;
    const dy = Math.abs(playerPosition.y - hazard.position.y);

    // Flame extends 2 units in the configured direction
    const direction = hazard.config.direction || { x: 0, y: 0, z: 1 };
    const distance = Math.sqrt(dx * dx + dz * dz);

    // Check if player is within flame cone (2 unit range, 1 unit radius)
    if (distance <= 2 && dy <= 1) {
      // Simple directional check - if direction is set, verify player is in that direction
      const dot = dx * direction.x + dz * direction.z;
      if (dot > 0 || distance <= 1) { // Either in correct direction or very close to nozzle
        hazard.lastDamage = currentTime;
        this.emitHazardEvent('hazardDamage', {
          hazardId: hazard.id,
          type: hazard.type,
          damage: hazard.config.damage,
          position: hazard.position
        });
      }
    }
  }

  checkElectricDamage(hazard, playerPosition) {
    if (!playerPosition) return;

    const currentTime = Date.now();
    if (currentTime - hazard.lastDamage < hazard.config.damageInterval) return;

    // Check if player is standing on electric floor (3x3 platform)
    const dx = Math.abs(playerPosition.x - hazard.position.x);
    const dz = Math.abs(playerPosition.z - hazard.position.z);
    const dy = Math.abs(playerPosition.y - hazard.position.y);

    // Electric floor is 3x3, check if player is on it
    if (dx <= 1.5 && dz <= 1.5 && dy <= 1) {
      hazard.lastDamage = currentTime;
      this.emitHazardEvent('hazardDamage', {
        hazardId: hazard.id,
        type: hazard.type,
        damage: hazard.config.damage,
        position: hazard.position
      });
    }
  }

  checkGasDamage(hazard, playerPosition) {
    if (!playerPosition) return;

    const currentTime = Date.now();
    if (currentTime - hazard.lastDamage < hazard.config.damageInterval) return;

    // Check if player is within toxic gas radius
    const dx = playerPosition.x - hazard.position.x;
    const dy = playerPosition.y - (hazard.position.y + hazard.config.radius); // Gas cloud center
    const dz = playerPosition.z - hazard.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (distance <= hazard.config.radius) {
      hazard.lastDamage = currentTime;
      this.emitHazardEvent('hazardDamage', {
        hazardId: hazard.id,
        type: hazard.type,
        damage: hazard.config.damage,
        position: hazard.position,
        radius: hazard.config.radius
      });
    }
  }

  checkDebrisDamage(hazard, playerPosition) {
    // Note: Debris damage is checked once when it falls, handled by explosion logic in HazardManager
    // This emits the event but the actual player hit detection happens in HazardManager via explosion radius
    this.emitHazardEvent('hazardDamage', {
      hazardId: hazard.id,
      type: hazard.type,
      damage: hazard.config.damage,
      position: hazard.position,
      radius: hazard.config.radius
    });
  }

  /**
   * Damage a hazard (for explosive barrels)
   */
  damageHazard(hazardId, damage) {
    const hazard = this.activeHazards.get(hazardId);
    if (!hazard || hazard.health === Infinity) return;

    hazard.health -= damage;

    if (hazard.health <= 0) {
      if (hazard.type === HazardTypes.EXPLOSIVE_BARREL) {
        this.explodeBarrel(hazard);
      }
      this.removeHazard(hazardId);
    }
  }

  explodeBarrel(hazard) {
    // Create explosion effect
    this.emitHazardEvent('hazardExplosion', {
      position: hazard.position,
      radius: hazard.config.explosionRadius,
      damage: hazard.config.explosionDamage
    });

    // Visual explosion effect handled by game engine
  }

  /**
   * Remove a hazard
   */
  removeHazard(hazardId) {
    const hazard = this.activeHazards.get(hazardId);
    if (!hazard) return;

    const mesh = this.hazardMeshes.get(hazardId);
    if (mesh) {
      this.gameEngine.getScene().remove(mesh);
      this.hazardMeshes.delete(hazardId);
    }

    this.activeHazards.delete(hazardId);

    this.emitHazardEvent('hazardRemoved', { hazardId });
  }

  /**
   * Get hazards in radius
   */
  getHazardsInRadius(position, radius) {
    const hazards = [];
    this.activeHazards.forEach(hazard => {
      const distance = Math.sqrt(
        Math.pow(hazard.position.x - position.x, 2) +
        Math.pow(hazard.position.z - position.z, 2)
      );
      if (distance <= radius) {
        hazards.push(hazard);
      }
    });
    return hazards;
  }

  /**
   * Get all active hazards
   */
  getActiveHazards() {
    return Array.from(this.activeHazards.values());
  }

  /**
   * Emit hazard events
   */
  emitHazardEvent(eventName, data) {
    window.dispatchEvent(new CustomEvent(eventName, {
      detail: data
    }));
  }

  /**
   * Cleanup
   */
  cleanup() {
    this.activeHazards.forEach((hazard, id) => {
      this.removeHazard(id);
    });
    this.activeHazards.clear();
    this.hazardMeshes.clear();
  }
}

// Singleton instance
let hazardSystemInstance = null;

export function getHazardSystem() {
  if (!hazardSystemInstance) {
    // Hazard system requires game engine, so it can't be created without it
    return null;
  }
  return hazardSystemInstance;
}

export function initializeHazardSystem(gameEngine) {
  if (!hazardSystemInstance) {
    hazardSystemInstance = new HazardSystem(gameEngine);
  }
  return hazardSystemInstance;
}

export default HazardSystem;
