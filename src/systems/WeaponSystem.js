import * as THREE from 'three';
import { WeaponTypes } from '../types/weapons.js';
import { GameConfig } from '../data/gameConfig.js';
import { GameUtils } from '../utils/gameUtils.js';
import { getProgressionSystem } from './ProgressionSystem.js';
import { getWeakpointSystem } from './WeakpointSystem.js';
import { getPowerUpSystem } from './PowerUpSystem.js';
import { getComboSystem } from './ComboSystem.js';

export class WeaponSystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.currentWeapon = WeaponTypes.PISTOL;
    this.weapons = {};
    this.crosshair = null;
    this.muzzleFlash = null;
    this.hitEffects = [];
    this.progressionSystem = getProgressionSystem();
    this.weakpointSystem = getWeakpointSystem();
    this.powerUpSystem = getPowerUpSystem();
    this.comboSystem = getComboSystem();

    // Alt-fire system
    this.altFireMode = false;
    this.chargeStartTime = 0;
    this.isCharging = false;
    this.maxChargeTime = 2000; // 2 seconds max charge

    // Initialize weapons
    this.initializeWeapons();

    // Create crosshair
    this.createCrosshair();
  }

  initializeWeapons() {
    // Get weapon configs from game config
    const weaponConfigs = GameConfig.weapons;
    
    Object.keys(weaponConfigs).forEach(weaponType => {
      this.weapons[weaponType] = {
        ...weaponConfigs[weaponType],
        currentAmmo: weaponConfigs[weaponType].ammo === Infinity ? 30 : weaponConfigs[weaponType].ammo,
        maxAmmo: weaponConfigs[weaponType].ammo === Infinity ? 30 : weaponConfigs[weaponType].ammo,
        lastShot: 0,
        reloading: false,
        reloadStartTime: 0,
        overheatLevel: 0,
        isOverheated: false
      };
    });

    // Set starting ammo for non-infinite weapons
    if (this.weapons.shotgun) {
      this.weapons.shotgun.currentAmmo = 24; // Starting shotgun ammo
      this.weapons.shotgun.totalAmmo = 24;
    }
    
    if (this.weapons.rapidfire) {
      this.weapons.rapidfire.currentAmmo = 120; // Starting rapid fire ammo
      this.weapons.rapidfire.totalAmmo = 120;
    }
  }

  createCrosshair() {
    // Create crosshair geometry
    const crosshairGeometry = new THREE.BufferGeometry();
    const crosshairMaterial = new THREE.LineBasicMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });
    
    // Create crosshair lines
    const size = 0.02;
    const gap = 0.005;
    
    const vertices = [
      // Horizontal line (left)
      -size - gap, 0, -1,
      -gap, 0, -1,
      // Horizontal line (right)
      gap, 0, -1,
      size + gap, 0, -1,
      // Vertical line (top)
      0, size + gap, -1,
      0, gap, -1,
      // Vertical line (bottom)
      0, -gap, -1,
      0, -size - gap, -1
    ];
    
    crosshairGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    this.crosshair = new THREE.LineSegments(crosshairGeometry, crosshairMaterial);
    
    // Add crosshair to camera (so it follows the view)
    const camera = this.gameEngine.getCamera();
    if (camera) {
      camera.add(this.crosshair);
    }
  }

  // Switch weapons
  switchWeapon(weaponType) {
    if (!this.weapons[weaponType]) {
      console.warn(`Unknown weapon type: ${weaponType}`);
      return false;
    }

    // Check if weapon is unlocked
    if (!this.progressionSystem.isWeaponUnlocked(weaponType)) {
      console.warn(`Weapon ${weaponType} is locked`);
      this.gameEngine.emit('weaponLocked', { weapon: weaponType });
      return false;
    }

    // Check if weapon has ammo (except infinite ammo weapons)
    const weapon = this.weapons[weaponType];
    if (weapon.ammo !== Infinity && weapon.currentAmmo <= 0 && !weapon.reloading) {
      return false; // No ammo
    }

    this.currentWeapon = weaponType;
    this.gameEngine.emit('weaponChanged', {
      weapon: weaponType,
      ammo: weapon.currentAmmo,
      maxAmmo: weapon.maxAmmo
    });

    return true;
  }

  // Get current weapon
  getCurrentWeapon() {
    return this.weapons[this.currentWeapon];
  }

  // Check if weapon can fire
  canFire() {
    const weapon = this.getCurrentWeapon();
    const now = Date.now();

    // Check fire rate (apply power-up fire rate multiplier)
    const timeSinceLastShot = now - weapon.lastShot;
    const fireRateMultiplier = this.powerUpSystem.getFireRateMultiplier();
    const minTimeBetweenShots = 1000 / (weapon.fireRate * fireRateMultiplier);

    if (timeSinceLastShot < minTimeBetweenShots) {
      return false;
    }
    
    // Check reloading
    if (weapon.reloading) {
      return false;
    }
    
    // Check overheating
    if (weapon.isOverheated) {
      return false;
    }
    
    // Check ammo (infinite ammo power-up bypasses ammo check)
    if (!this.powerUpSystem.hasInfiniteAmmo()) {
      if (weapon.ammo !== Infinity && weapon.currentAmmo <= 0) {
        return false;
      }
    }

    return true;
  }

  // Get enemy source that works with both EnemySpawnSystem and fallback objects
  getEnemySource(enemySpawnSystem) {
    try {
      // If we have a proper EnemySpawnSystem with getEnemies method
      if (enemySpawnSystem && typeof enemySpawnSystem.getEnemies === 'function') {
        return {
          getEnemies: () => enemySpawnSystem.getEnemies(),
          getEnemyAtPosition: (x, y, camera) => enemySpawnSystem.getEnemyAtPosition ? enemySpawnSystem.getEnemyAtPosition(x, y, camera) : null
        };
      }
      
      // If we have a fallback object with getEnemyAtPosition method
      if (enemySpawnSystem && typeof enemySpawnSystem.getEnemyAtPosition === 'function') {
        return {
          getEnemies: () => window.gameEnemies || [],
          getEnemyAtPosition: enemySpawnSystem.getEnemyAtPosition
        };
      }
      
      // Ultimate fallback - use global enemies array
      return {
        getEnemies: () => window.gameEnemies || [],
        getEnemyAtPosition: (x, y, camera) => {
          // Basic hit detection for global enemies
          const enemies = window.gameEnemies || [];
          return enemies.length > 0 ? {
            enemy: enemies[0],
            point: { x: 0, y: 0, z: -5 },
            distance: 10
          } : null;
        }
      };
    } catch (error) {
      console.error('Error getting enemy source:', error);
      // Return safe fallback
      return {
        getEnemies: () => [],
        getEnemyAtPosition: () => null
      };
    }
  }

  // Fire weapon
  fire(screenX, screenY, enemySpawnSystem) {
    if (!this.canFire()) {
      return false;
    }
    
    const weapon = this.getCurrentWeapon();
    const camera = this.gameEngine.getCamera();
    
    // Create raycaster for hit detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    // Convert screen coordinates to normalized device coordinates
    mouse.x = (screenX / window.innerWidth) * 2 - 1;
    mouse.y = -(screenY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    // Get enemy source - handle both EnemySpawnSystem and fallback objects
    const enemySource = this.getEnemySource(enemySpawnSystem);
    
    // Fire weapon based on type and alt-fire mode
    let hitResult = null;

    if (this.altFireMode) {
      // Alt-fire modes
      switch (this.currentWeapon) {
        case WeaponTypes.PISTOL:
          hitResult = this.fireChargedPistol(raycaster, enemySource);
          this.stopCharging(); // Reset charge after firing
          break;
        case WeaponTypes.SHOTGUN:
          hitResult = this.fireTightChokeShotgun(raycaster, enemySource, mouse);
          break;
        case WeaponTypes.RAPIDFIRE:
          hitResult = this.fireBurstRapidFire(raycaster, enemySource);
          break;
        case WeaponTypes.GRAPPLING:
          hitResult = this.fireSlamGrappling(raycaster, enemySource);
          break;
      }
    } else {
      // Normal fire modes
      switch (this.currentWeapon) {
        case WeaponTypes.PISTOL:
          hitResult = this.firePistol(raycaster, enemySource);
          break;
        case WeaponTypes.SHOTGUN:
          hitResult = this.fireShotgun(raycaster, enemySource, mouse);
          break;
        case WeaponTypes.RAPIDFIRE:
          hitResult = this.fireRapidFire(raycaster, enemySource);
          break;
        case WeaponTypes.GRAPPLING:
          hitResult = this.fireGrapplingArm(raycaster, enemySource);
          break;
      }
    }
    
    // Update weapon state
    weapon.lastShot = Date.now();

    // Consume ammo (unless infinite ammo power-up is active)
    if (!this.powerUpSystem.hasInfiniteAmmo()) {
      if (weapon.ammo !== Infinity) {
        weapon.currentAmmo = Math.max(0, weapon.currentAmmo - 1);
      }
    }
    
    // Handle overheating for rapid fire
    if (this.currentWeapon === WeaponTypes.RAPIDFIRE && weapon.overheat) {
      weapon.overheatLevel += 0.15;
      if (weapon.overheatLevel >= 1.0) {
        weapon.isOverheated = true;
        weapon.overheatLevel = 1.0;
        setTimeout(() => {
          weapon.isOverheated = false;
          weapon.overheatLevel = 0;
        }, weapon.overheatTime * 1000);
      }
    }
    
    // Show muzzle flash
    this.showMuzzleFlash();
    
    // Update crosshair for hit feedback
    if (hitResult && hitResult.hit) {
      this.showHitFeedback();
    }
    
    // Emit weapon fired event
    this.gameEngine.emit('weaponFired', {
      weapon: this.currentWeapon,
      ammo: weapon.currentAmmo,
      hit: hitResult && hitResult.hit,
      damage: hitResult ? hitResult.damage : 0
    });
    
    return hitResult;
  }

  firePistol(raycaster, enemySource) {
    const weapon = this.getCurrentWeapon();

    try {
      // Check for enemy hit using the enemy source
      const enemies = enemySource.getEnemies();
      const enemyMeshes = enemies.map(enemy => enemy.mesh).filter(mesh => mesh);

      const intersects = raycaster.intersectObjects(enemyMeshes);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const enemy = enemies.find(e => e.mesh === hitMesh);

        if (enemy) {
          const hitPoint = intersects[0].point;

          // Use weakpoint system to determine damage
          const weakpointHit = this.weakpointSystem.checkWeakpointHit(
            enemy.type,
            hitPoint,
            enemy.position,
            enemy.facing || { x: 0, z: 1 },
            enemy.bossPhase || 1
          );

          // Apply power-up and combo damage multipliers
          let baseDamage = weapon.damage * this.powerUpSystem.getDamageMultiplier() * this.comboSystem.getDamageMultiplier();
          const finalDamage = this.weakpointSystem.calculateWeakpointDamage(baseDamage, weakpointHit);
          const isHeadshot = weakpointHit && weakpointHit.weakpoint === 'head';
          
          // Try to damage enemy using different methods
          if (enemy.takeDamage && typeof enemy.takeDamage === 'function') {
            enemy.takeDamage(finalDamage);
          } else if (window.gameEnemies) {
            // Find enemy in global array and damage it
            const globalEnemy = window.gameEnemies.find(e => e.id === enemy.id);
            if (globalEnemy && globalEnemy.takeDamage) {
              globalEnemy.takeDamage(finalDamage);
            }
          }

        // Create hit effect with weakpoint-specific color
        const hitColor = this.weakpointSystem.getWeakpointColor(weakpointHit);
        this.createHitEffect(intersects[0].point, hitColor);

        // Emit weakpoint hit event for UI feedback
        if (weakpointHit) {
          this.gameEngine.emit('weakpointHit', {
            weakpoint: weakpointHit,
            damage: finalDamage,
            position: hitPoint
          });
        }

          // Emit weapon hit event for hazard damage
          window.dispatchEvent(new CustomEvent('weaponHit', {
            detail: {
              position: intersects[0].point,
              damage: finalDamage,
              weaponType: this.currentWeapon
            }
          }));

          return {
            hit: true,
            enemy,
            damage: finalDamage,
            point: intersects[0].point,
            isHeadshot,
            weakpointHit
          };
        }
      }
    } catch (error) {
      console.error('Error in firePistol:', error);
    }
    
    return { hit: false };
  }

  fireShotgun(raycaster, enemySource, centerMouse) {
    const weapon = this.getCurrentWeapon();
    const spreadAngle = weapon.spread || 15; // degrees
    const pelletCount = weapon.pellets || 8;
    
    let totalDamage = 0;
    let hitEnemies = new Set();
    let hitResults = [];
    
    // Fire multiple pellets in a spread pattern
    for (let i = 0; i < pelletCount; i++) {
      // Calculate spread offset
      const angle = (Math.random() - 0.5) * spreadAngle * (Math.PI / 180);
      const spreadRadius = Math.random() * 0.1;
      
      const offsetMouse = new THREE.Vector2(
        centerMouse.x + Math.cos(angle) * spreadRadius,
        centerMouse.y + Math.sin(angle) * spreadRadius
      );
      
      // Create raycaster for this pellet
      const pelletRaycaster = new THREE.Raycaster();
      pelletRaycaster.setFromCamera(offsetMouse, this.gameEngine.getCamera());
      
      // Check for hits
      const enemies = enemySource.getEnemies();
      const enemyMeshes = enemies.map(enemy => enemy.mesh).filter(mesh => mesh);
      const intersects = pelletRaycaster.intersectObjects(enemyMeshes);
      
      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const enemy = enemies.find(e => e.mesh === hitMesh);
        
        if (enemy && !hitEnemies.has(enemy.id)) {
          // Calculate damage based on distance
          const distance = intersects[0].distance;
          const damageReduction = Math.min(distance / weapon.range, 1);
          const damage = weapon.damage * (1 - damageReduction * 0.7); // 30% damage at max range
          
          // Try to damage enemy using different methods
          if (enemy.takeDamage && typeof enemy.takeDamage === 'function') {
            enemy.takeDamage(damage);
          } else if (window.gameEnemies) {
            const globalEnemy = window.gameEnemies.find(e => e.id === enemy.id);
            if (globalEnemy && globalEnemy.takeDamage) {
              globalEnemy.takeDamage(damage);
            }
          }
          
          hitEnemies.add(enemy.id);
          totalDamage += damage;
          
          this.createHitEffect(intersects[0].point);
          
          hitResults.push({
            enemy,
            damage,
            point: intersects[0].point
          });
        }
      }
    }
    
    return { 
      hit: hitResults.length > 0,
      hits: hitResults,
      totalDamage
    };
  }

  fireRapidFire(raycaster, enemySource) {
    const weapon = this.getCurrentWeapon();
    
    // Add slight accuracy reduction due to rapid fire
    const accuracy = weapon.accuracy * (1 - weapon.overheatLevel * 0.3);
    const spread = (1 - accuracy) * 0.1; // Convert to radians
    
    // Apply spread to raycaster
    const direction = raycaster.ray.direction.clone();
    direction.x += (Math.random() - 0.5) * spread;
    direction.y += (Math.random() - 0.5) * spread;
    direction.normalize();
    
    const spreadRaycaster = new THREE.Raycaster(raycaster.ray.origin, direction);
    
    // Check for enemy hit (similar to pistol but with reduced damage)
    const enemies = enemySource.getEnemies();
    const enemyMeshes = enemies.map(enemy => enemy.mesh).filter(mesh => mesh);
    
    const intersects = spreadRaycaster.intersectObjects(enemyMeshes);
    
    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const enemy = enemies.find(e => e.mesh === hitMesh);
      
      if (enemy) {
        // Try to damage enemy using different methods
        if (enemy.takeDamage && typeof enemy.takeDamage === 'function') {
          enemy.takeDamage(weapon.damage);
        } else if (window.gameEnemies) {
          const globalEnemy = window.gameEnemies.find(e => e.id === enemy.id);
          if (globalEnemy && globalEnemy.takeDamage) {
            globalEnemy.takeDamage(weapon.damage);
          }
        }
        this.createHitEffect(intersects[0].point);
        
        return { 
          hit: true, 
          enemy, 
          damage: weapon.damage, 
          point: intersects[0].point 
        };
      }
    }
    
    return { hit: false };
  }

  fireGrapplingArm(raycaster, enemySource) {
    // This will be a projectile weapon, not hitscan
    // For now, implement as hitscan with special effects
    const weapon = this.getCurrentWeapon();
    
    const enemies = enemySource.getEnemies();
    const enemyMeshes = enemies.map(enemy => enemy.mesh).filter(mesh => mesh);
    
    const intersects = raycaster.intersectObjects(enemyMeshes);
    
    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const enemy = enemies.find(e => e.mesh === hitMesh);
      
      if (enemy) {
        // Grappling arm can pull smaller enemies
        if (enemy.type !== 'boss' && enemy.stats.health < 100) {
          // Pull enemy closer
          const playerPos = GameUtils.ensureVector3(this.gameEngine.getCurrentPosition());
          const pullDirection = playerPos.clone().sub(enemy.position).normalize();
          enemy.position.add(pullDirection.multiplyScalar(5));
          enemy.mesh.position.copy(enemy.position);
        }
        
        // Try to damage enemy using different methods
        if (enemy.takeDamage && typeof enemy.takeDamage === 'function') {
          enemy.takeDamage(weapon.damage);
        } else if (window.gameEnemies) {
          const globalEnemy = window.gameEnemies.find(e => e.id === enemy.id);
          if (globalEnemy && globalEnemy.takeDamage) {
            globalEnemy.takeDamage(weapon.damage);
          }
        }
        this.createGrappleEffect(enemy.position, GameUtils.ensureVector3(this.gameEngine.getCurrentPosition()));
        
        return { 
          hit: true, 
          enemy, 
          damage: weapon.damage,
          pulled: true
        };
      }
    }

    return { hit: false };
  }

  // Alt-fire system methods
  startCharging() {
    if (this.currentWeapon === WeaponTypes.PISTOL) {
      this.isCharging = true;
      this.chargeStartTime = Date.now();
    }
  }

  stopCharging() {
    this.isCharging = false;
    this.chargeStartTime = 0;
  }

  getChargeLevel() {
    if (!this.isCharging) return 0;
    const chargeTime = Date.now() - this.chargeStartTime;
    return Math.min(chargeTime / this.maxChargeTime, 1.0); // 0.0 to 1.0
  }

  toggleAltFire() {
    this.altFireMode = !this.altFireMode;
    this.gameEngine.emit('altFireToggled', { active: this.altFireMode });
    return this.altFireMode;
  }

  // Alt-fire weapon methods
  fireChargedPistol(raycaster, enemySource) {
    const chargeLevel = this.getChargeLevel();
    const weapon = this.getCurrentWeapon();

    // Must be at least 50% charged
    if (chargeLevel < 0.5) {
      return { hit: false };
    }

    // Charged shot: 2x-3x damage based on charge level
    const damageMultiplier = 2.0 + chargeLevel;
    const baseDamage = weapon.damage;
    const chargedDamage = Math.floor(baseDamage * damageMultiplier);

    try {
      const enemies = enemySource.getEnemies();
      const enemyMeshes = enemies.map(enemy => enemy.mesh).filter(mesh => mesh);
      const intersects = raycaster.intersectObjects(enemyMeshes);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const enemy = enemies.find(e => e.mesh === hitMesh);

        if (enemy && enemy.takeDamage) {
          enemy.takeDamage(chargedDamage);
          return {
            hit: true,
            enemy: enemy,
            damage: chargedDamage,
            isCharged: true,
            chargeLevel: chargeLevel
          };
        }
      }
    } catch (error) {
      console.error('Error in charged pistol shot:', error);
    }

    return { hit: false };
  }

  fireTightChokeShotgun(raycaster, enemySource, centerMouse) {
    const weapon = this.getCurrentWeapon();

    // Tight choke: Less spread (5 degrees vs 15), more damage per pellet
    const tightSpread = 5;
    const pellets = 8;
    const damagePerPellet = Math.floor(weapon.damage * 0.15); // +20% damage per pellet

    let hits = [];

    try {
      const enemies = enemySource.getEnemies();
      const enemyMeshes = enemies.map(enemy => enemy.mesh).filter(mesh => mesh);

      // Fire pellets in tight spread
      for (let i = 0; i < pellets; i++) {
        const spreadX = (Math.random() - 0.5) * (tightSpread / 180) * Math.PI;
        const spreadY = (Math.random() - 0.5) * (tightSpread / 180) * Math.PI;

        const pelletRaycaster = raycaster.clone();
        const direction = raycaster.ray.direction.clone();
        direction.x += spreadX;
        direction.y += spreadY;
        direction.normalize();
        pelletRaycaster.ray.direction.copy(direction);

        const intersects = pelletRaycaster.intersectObjects(enemyMeshes);

        if (intersects.length > 0) {
          const hitMesh = intersects[0].object;
          const enemy = enemies.find(e => e.mesh === hitMesh);

          if (enemy) {
            hits.push({ enemy, damage: damagePerPellet });
          }
        }
      }

      // Apply damage to hit enemies
      const damageMap = new Map();
      hits.forEach(hit => {
        const current = damageMap.get(hit.enemy) || 0;
        damageMap.set(hit.enemy, current + hit.damage);
      });

      damageMap.forEach((damage, enemy) => {
        if (enemy.takeDamage) {
          enemy.takeDamage(damage);
        }
      });

      return {
        hit: hits.length > 0,
        hits: hits.length,
        totalDamage: Array.from(damageMap.values()).reduce((sum, d) => sum + d, 0),
        isTightChoke: true
      };
    } catch (error) {
      console.error('Error in tight choke shotgun:', error);
    }

    return { hit: false };
  }

  fireBurstRapidFire(raycaster, enemySource) {
    const weapon = this.getCurrentWeapon();

    // Burst mode: 3 rounds with improved accuracy
    const burstCount = 3;
    const burstDamage = weapon.damage;
    const burstDelay = 50; // 50ms between burst shots

    let hitCount = 0;
    let totalDamage = 0;

    try {
      const enemies = enemySource.getEnemies();
      const enemyMeshes = enemies.map(enemy => enemy.mesh).filter(mesh => mesh);

      // Fire burst
      for (let i = 0; i < burstCount; i++) {
        // Slight spread for burst
        const burstRaycaster = raycaster.clone();
        const spreadX = (Math.random() - 0.5) * 0.02; // Very tight spread
        const spreadY = (Math.random() - 0.5) * 0.02;

        const direction = raycaster.ray.direction.clone();
        direction.x += spreadX;
        direction.y += spreadY;
        direction.normalize();
        burstRaycaster.ray.direction.copy(direction);

        const intersects = burstRaycaster.intersectObjects(enemyMeshes);

        if (intersects.length > 0) {
          const hitMesh = intersects[0].object;
          const enemy = enemies.find(e => e.mesh === hitMesh);

          if (enemy && enemy.takeDamage) {
            enemy.takeDamage(burstDamage);
            hitCount++;
            totalDamage += burstDamage;
          }
        }
      }

      // Consume 3 ammo for burst
      if (weapon.ammo !== Infinity) {
        weapon.currentAmmo = Math.max(0, weapon.currentAmmo - 2); // Already consumed 1 in main fire
      }

      return {
        hit: hitCount > 0,
        hits: hitCount,
        totalDamage: totalDamage,
        isBurst: true
      };
    } catch (error) {
      console.error('Error in burst rapid fire:', error);
    }

    return { hit: false };
  }

  fireSlamGrappling(raycaster, enemySource) {
    const weapon = this.getCurrentWeapon();

    try {
      const enemies = enemySource.getEnemies();
      const enemyMeshes = enemies.map(enemy => enemy.mesh).filter(mesh => mesh);
      const intersects = raycaster.intersectObjects(enemyMeshes);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const primaryEnemy = enemies.find(e => e.mesh === hitMesh);

        if (primaryEnemy && primaryEnemy.takeDamage && primaryEnemy.position) {
          // Pull and slam primary target
          const slamDamage = weapon.damage * 2; // 2x damage
          primaryEnemy.takeDamage(slamDamage);

          // Area damage to nearby enemies
          const slamRadius = 5;
          let areaHits = 0;

          enemies.forEach(enemy => {
            if (enemy !== primaryEnemy && enemy.position && enemy.takeDamage) {
              const dx = enemy.position.x - primaryEnemy.position.x;
              const dy = enemy.position.y - primaryEnemy.position.y;
              const dz = enemy.position.z - primaryEnemy.position.z;
              const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);

              if (distance <= slamRadius) {
                const areaDamage = Math.floor(weapon.damage * 0.5 * (1 - distance / slamRadius));
                enemy.takeDamage(areaDamage);
                areaHits++;
              }
            }
          });

          return {
            hit: true,
            enemy: primaryEnemy,
            damage: slamDamage,
            areaHits: areaHits,
            isSlam: true
          };
        }
      }
    } catch (error) {
      console.error('Error in slam grappling:', error);
    }

    return { hit: false };
  }

  // Reload current weapon
  reload() {
    const weapon = this.getCurrentWeapon();

    if (weapon.reloading || weapon.ammo === Infinity || weapon.currentAmmo === weapon.maxAmmo) {
      return false;
    }

    // Check if we have ammo in reserve
    if (weapon.totalAmmo !== undefined && weapon.totalAmmo <= 0) {
      return false;
    }

    weapon.reloading = true;
    weapon.reloadStartTime = Date.now();

    this.gameEngine.emit('weaponReloading', {
      weapon: this.currentWeapon,
      reloadTime: weapon.reloadTime
    });

    setTimeout(() => {
      // Calculate how many rounds to reload
      const neededAmmo = weapon.maxAmmo - weapon.currentAmmo;

      if (weapon.totalAmmo !== undefined) {
        // Use ammo from reserve
        const ammoToReload = Math.min(neededAmmo, weapon.totalAmmo);
        weapon.currentAmmo += ammoToReload;
        weapon.totalAmmo -= ammoToReload;
      } else {
        // Infinite reserve (default behavior)
        weapon.currentAmmo = weapon.maxAmmo;
      }

      weapon.reloading = false;

      this.gameEngine.emit('weaponReloaded', {
        weapon: this.currentWeapon,
        ammo: weapon.currentAmmo
      });
    }, weapon.reloadTime * 1000);

    return true;
  }

  // Consume ammo for current weapon
  consumeAmmo() {
    const weapon = this.getCurrentWeapon();

    // Don't consume ammo for infinite ammo weapons
    if (weapon.ammo === Infinity) {
      return true;
    }

    // Check if we have ammo
    if (weapon.currentAmmo <= 0) {
      return false;
    }

    // Consume one round
    weapon.currentAmmo = Math.max(0, weapon.currentAmmo - 1);
    weapon.lastShot = Date.now();

    // Handle overheating for rapid fire
    if (this.currentWeapon === WeaponTypes.RAPIDFIRE && weapon.overheat) {
      weapon.overheatLevel += 0.15;
      if (weapon.overheatLevel >= 1.0) {
        weapon.isOverheated = true;
        weapon.overheatLevel = 1.0;
        setTimeout(() => {
          weapon.isOverheated = false;
          weapon.overheatLevel = 0;
        }, weapon.overheatTime * 1000);
      }
    }

    // Show muzzle flash
    this.showMuzzleFlash();

    return true;
  }

  // Visual effects
  showMuzzleFlash() {
    if (!this.muzzleFlash) {
      const geometry = new THREE.SphereGeometry(0.2, 8, 6);
      const material = new THREE.MeshBasicMaterial({ 
        color: 0xffff88,
        transparent: true,
        opacity: 0.8
      });
      this.muzzleFlash = new THREE.Mesh(geometry, material);
    }
    
    // Position muzzle flash in front of camera
    const camera = this.gameEngine.getCamera();
    const flashPosition = new THREE.Vector3(0, -0.3, -2);
    camera.localToWorld(flashPosition);
    this.muzzleFlash.position.copy(flashPosition);
    
    this.gameEngine.getScene().add(this.muzzleFlash);
    
    // Remove after short duration
    setTimeout(() => {
      this.gameEngine.getScene().remove(this.muzzleFlash);
    }, 100);
  }

  showHitFeedback() {
    if (!this.crosshair) return;
    
    // Change crosshair color briefly
    this.crosshair.material.color.setHex(0xff0000);
    
    setTimeout(() => {
      this.crosshair.material.color.setHex(0xffffff);
    }, 200);
  }

  createHitEffect(position, color = 0xffaaaa) {
    // Create spark effect at hit point with custom color
    const sparkGeometry = new THREE.SphereGeometry(0.1, 6, 4);
    const sparkMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 1.0
    });

    const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
    spark.position.copy(position);
    
    this.gameEngine.getScene().add(spark);
    
    // Animate and remove
    const startTime = Date.now();
    const duration = 300;
    
    const animateSpark = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;
      
      if (progress >= 1) {
        this.gameEngine.getScene().remove(spark);
        return;
      }
      
      spark.material.opacity = 1 - progress;
      spark.scale.setScalar(1 + progress * 2);
      
      requestAnimationFrame(animateSpark);
    };
    
    animateSpark();
  }

  createGrappleEffect(enemyPos, playerPos) {
    // Create grapple line effect
    const geometry = new THREE.BufferGeometry().setFromPoints([
      playerPos,
      enemyPos
    ]);
    
    const material = new THREE.LineBasicMaterial({ 
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8
    });
    
    const grapplingLine = new THREE.Line(geometry, material);
    this.gameEngine.getScene().add(grapplingLine);
    
    // Remove after duration
    setTimeout(() => {
      this.gameEngine.getScene().remove(grapplingLine);
    }, 500);
  }

  // Update system
  update(deltaTime) {
    // Cool down rapid fire overheat
    if (this.currentWeapon === WeaponTypes.RAPIDFIRE) {
      const weapon = this.getCurrentWeapon();
      if (weapon.overheatLevel > 0 && !weapon.isOverheated) {
        weapon.overheatLevel = Math.max(0, weapon.overheatLevel - deltaTime * 0.5);
      }
    }
    
    // Update hit effects
    this.hitEffects = this.hitEffects.filter(effect => {
      effect.life -= deltaTime;
      if (effect.life <= 0) {
        this.gameEngine.getScene().remove(effect.mesh);
        return false;
      }
      return true;
    });
  }

  // Get weapon info for UI
  getWeaponInfo() {
    const weapon = this.getCurrentWeapon();
    return {
      type: this.currentWeapon,
      ammo: weapon.currentAmmo,
      maxAmmo: weapon.maxAmmo,
      totalAmmo: weapon.totalAmmo || 0,
      reloading: weapon.reloading,
      reloadProgress: weapon.reloading ? (Date.now() - weapon.reloadStartTime) / (weapon.reloadTime * 1000) : 0,
      overheat: weapon.overheatLevel || 0,
      isOverheated: weapon.isOverheated || false
    };
  }

  // Get all weapons with unlock status
  getAllWeaponsInfo() {
    const allWeapons = Object.keys(this.weapons).map(weaponType => {
      const weapon = this.weapons[weaponType];
      const isUnlocked = this.progressionSystem.isWeaponUnlocked(weaponType);

      return {
        type: weaponType,
        unlocked: isUnlocked,
        ammo: weapon.currentAmmo,
        maxAmmo: weapon.maxAmmo,
        totalAmmo: weapon.totalAmmo || 0
      };
    });

    return allWeapons;
  }

  // Unlock weapon (called from progression rewards)
  unlockWeapon(weaponType, source = 'unknown') {
    return this.progressionSystem.unlockWeapon(weaponType, source);
  }

  // Check if weapon is unlocked
  isWeaponUnlocked(weaponType) {
    return this.progressionSystem.isWeaponUnlocked(weaponType);
  }

  // Add ammo to weapon (from pickups)
  addAmmo(weaponType, amount) {
    const weapon = this.weapons[weaponType];
    if (!weapon) {
      console.warn(`Unknown weapon type: ${weaponType}`);
      return false;
    }

    // Don't add ammo to infinite ammo weapons
    if (weapon.ammo === Infinity) {
      return false;
    }

    // Add to total ammo pool
    if (weapon.totalAmmo === undefined) {
      weapon.totalAmmo = weapon.currentAmmo;
    }

    weapon.totalAmmo += amount;

    // If weapon is empty and not reloading, auto-reload
    if (weapon.currentAmmo === 0 && !weapon.reloading) {
      this.reload();
    }

    return true;
  }

  // Clean up
  cleanup() {
    if (this.crosshair && this.crosshair.parent) {
      this.crosshair.parent.remove(this.crosshair);
    }
    
    if (this.muzzleFlash && this.muzzleFlash.parent) {
      this.muzzleFlash.parent.remove(this.muzzleFlash);
    }
    
    this.hitEffects.forEach(effect => {
      this.gameEngine.getScene().remove(effect.mesh);
    });
    
    this.hitEffects = [];
  }
}