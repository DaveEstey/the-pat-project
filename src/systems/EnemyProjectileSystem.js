import * as THREE from 'three';
import { GameUtils } from '../utils/gameUtils.js';

export class EnemyProjectileSystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.projectiles = [];
    this.projectilePool = [];
    this.maxPoolSize = 50;
    this.projectileIdCounter = 0;

    // Initialize projectile pool
    this.initializeProjectilePool();

    // Listen to enemy attack events
    this.gameEngine.on('enemyAttack', this.handleEnemyAttack.bind(this));

    // Make system globally available for deflection
    window.enemyProjectileSystem = this;
  }

  initializeProjectilePool() {
    // Pre-create projectile objects for performance
    for (let i = 0; i < this.maxPoolSize; i++) {
      const projectile = this.createProjectileObject();
      this.projectilePool.push(projectile);
    }
  }

  createProjectileObject() {
    // Create different projectile types based on enemy
    // Increased size for better visibility (0.1 → 0.2)
    const geometry = new THREE.SphereGeometry(0.2, 8, 6);
    const material = new THREE.MeshLambertMaterial({
      color: 0xff4444,
      transparent: true,
      opacity: 0.9, // Increased opacity
      emissive: 0xff2222, // Brighter glow
      emissiveIntensity: 0.5
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;

    return {
      mesh,
      velocity: new THREE.Vector3(),
      damage: 0,
      speed: 0,
      maxDistance: 0,
      distanceTraveled: 0,
      enemyType: null,
      active: false,
      createdTime: 0,
      maxLifetime: 10000, // 10 seconds max lifetime
      // Arc trajectory properties (for bomb_thrower)
      hasGravity: false,
      verticalVelocity: 0,
      gravity: -15.0 // Gravity constant for arc physics
    };
  }

  handleEnemyAttack({ enemy, damage, position }) {
    // Create projectile from enemy toward player
    this.fireProjectile(enemy, damage, position);
  }

  fireProjectile(enemy, damage, startPosition) {
    // Get or create projectile from pool
    let projectile = this.projectilePool.pop();
    if (!projectile) {
      projectile = this.createProjectileObject();
    }

    // Generate unique ID for this projectile
    const projectileId = `proj_${this.projectileIdCounter++}_${Date.now()}`;
    projectile.id = projectileId;

    // Get player position
    const playerPosition = this.getPlayerPosition();

    // Calculate direction to player FIRST
    const direction = playerPosition.clone().sub(startPosition).normalize();

    // Adjust start position to be at enemy's "weapon/muzzle" position
    // Offset upward (Y) and forward (along direction toward player)
    const muzzleOffset = new THREE.Vector3(
      direction.x * 0.8,  // 0.8 units forward toward player
      0.5,                 // 0.5 units up (weapon height)
      direction.z * 0.8    // 0.8 units forward in Z direction
    );

    const adjustedStartPos = startPosition.clone().add(muzzleOffset);

    // Configure projectile based on enemy type
    this.configureProjectileForEnemyType(projectile, enemy, damage, direction);

    // Set projectile position and velocity (doubled speed for reliability)
    projectile.mesh.position.copy(adjustedStartPos);
    projectile.velocity.copy(direction).multiplyScalar(projectile.speed * 2.0); // 100% faster for reliable hits
    projectile.distanceTraveled = 0;
    projectile.active = true;
    projectile.createdTime = Date.now();
    projectile.deflected = false;

    // Mark mesh with userData for raycasting detection
    projectile.mesh.userData.isProjectile = true;
    projectile.mesh.userData.projectileId = projectileId;

    // Add to scene and track
    this.gameEngine.getScene().add(projectile.mesh);
    this.projectiles.push(projectile);
  }

  configureProjectileForEnemyType(projectile, enemy, damage, direction) {
    projectile.damage = damage;
    projectile.enemyType = enemy.type;
    
    switch (enemy.type) {
      case 'basic_shooter':
      case 'basic': // Fallback name
        projectile.speed = 4.5; // Slowed from 8.0
        projectile.maxDistance = 40;
        projectile.mesh.material.color.setHex(0xff4444);
        projectile.mesh.scale.setScalar(1.0);
        break;

      case 'armored':
        projectile.speed = 3.5; // Slowed from 6.0
        projectile.maxDistance = 35;
        projectile.mesh.material.color.setHex(0x888844);
        projectile.mesh.scale.setScalar(1.2);
        break;
        
      case 'ninja':
        projectile.speed = 12.0;
        projectile.maxDistance = 30;
        projectile.mesh.material.color.setHex(0x444444);
        projectile.mesh.scale.setScalar(0.8);
        // Add some stealth effect
        projectile.mesh.material.opacity = 0.6;
        break;
        
      case 'bomb_thrower':
        projectile.speed = 5.0;
        projectile.maxDistance = 45;
        projectile.mesh.material.color.setHex(0xff6600);
        projectile.mesh.scale.setScalar(1.5);
        // Add area effect properties
        projectile.areaEffect = true;
        projectile.explosionRadius = 3.0;
        // Enable arc trajectory with gravity
        projectile.hasGravity = true;
        // Calculate initial upward velocity for arc trajectory
        // This creates a parabolic arc that peaks mid-flight
        const distanceToPlayer = direction.length() * projectile.maxDistance * 0.5;
        const timeToTarget = distanceToPlayer / projectile.speed;
        projectile.verticalVelocity = 8.0; // Initial upward velocity for nice arc
        break;
        
      case 'fast_debuffer':
        projectile.speed = 10.0;
        projectile.maxDistance = 25;
        projectile.mesh.material.color.setHex(0xff88ff);
        projectile.mesh.scale.setScalar(0.9);
        // Add energy effect
        projectile.mesh.material.emissive.setHex(0x442244);
        projectile.debuffEffect = true;
        break;
        
      case 'boss':
        projectile.speed = 7.0;
        projectile.maxDistance = 50;
        projectile.mesh.material.color.setHex(0xaa0000);
        projectile.mesh.scale.setScalar(1.8);
        projectile.mesh.material.emissive.setHex(0x440000);
        break;
        
      default:
        projectile.speed = 8.0;
        projectile.maxDistance = 40;
        projectile.mesh.material.color.setHex(0xff4444);
    }
  }

  getPlayerPosition() {
    // Try to get player position from game engine
    const currentPos = this.gameEngine.getCurrentPosition();
    if (currentPos && typeof currentPos.x === 'number') {
      return GameUtils.ensureVector3(currentPos);
    }
    
    // Fallback to camera position (since player is at camera in room-based combat)
    const camera = this.gameEngine.getCamera();
    if (camera && camera.position) {
      return camera.position.clone();
    }
    
    // Ultimate fallback
    return new THREE.Vector3(0, 0, 0);
  }

  update(deltaTime) {
    // Update all active projectiles
    this.projectiles = this.projectiles.filter(projectile => {
      if (!projectile.active) return false;

      // Check lifetime
      if (Date.now() - projectile.createdTime > projectile.maxLifetime) {
        this.removeProjectile(projectile);
        return false;
      }

      // Apply gravity to arc projectiles (bombs)
      if (projectile.hasGravity) {
        // Update vertical velocity with gravity
        projectile.verticalVelocity += projectile.gravity * deltaTime;

        // Apply horizontal movement (constant)
        const horizontalMovement = projectile.velocity.clone().multiplyScalar(deltaTime);
        projectile.mesh.position.x += horizontalMovement.x;
        projectile.mesh.position.z += horizontalMovement.z;

        // Apply vertical movement (affected by gravity)
        projectile.mesh.position.y += projectile.verticalVelocity * deltaTime;

        // Track distance traveled (horizontal only for arc projectiles)
        const horizontalDistance = Math.sqrt(
          horizontalMovement.x * horizontalMovement.x +
          horizontalMovement.z * horizontalMovement.z
        );
        projectile.distanceTraveled += horizontalDistance;

        // Remove if projectile hits ground (y <= 0)
        if (projectile.mesh.position.y <= 0) {
          // Create explosion effect at ground impact
          if (projectile.areaEffect) {
            this.createExplosionEffect(projectile.mesh.position.clone());
          }
          this.removeProjectile(projectile);
          return false;
        }
      } else {
        // Standard straight-line movement for non-arc projectiles
        const movement = projectile.velocity.clone().multiplyScalar(deltaTime);
        projectile.mesh.position.add(movement);
        projectile.distanceTraveled += movement.length();
      }

      // Check if projectile has traveled max distance
      if (projectile.distanceTraveled >= projectile.maxDistance) {
        this.removeProjectile(projectile);
        return false;
      }

      // Check collision with player
      if (this.checkPlayerCollision(projectile)) {
        this.handlePlayerHit(projectile);
        this.removeProjectile(projectile);
        return false;
      }

      // Optional: Add some visual effects
      this.updateProjectileEffects(projectile, deltaTime);

      return true;
    });
  }

  checkPlayerCollision(projectile) {
    const playerPosition = this.getPlayerPosition();
    const distance = projectile.mesh.position.distanceTo(playerPosition);
    
    // Base collision radius
    let collisionRadius = 1.5;
    
    // Area effect projectiles have larger collision radius
    if (projectile.areaEffect) {
      collisionRadius = projectile.explosionRadius || 3.0;
    }
    
    return distance <= collisionRadius;
  }

  handlePlayerHit(projectile) {
    // Get player position for effects
    const playerPosition = this.getPlayerPosition();
    
    // Create hit effect at impact point
    this.createHitEffect(projectile.mesh.position.clone(), projectile.enemyType);
    
    // Area effect explosion
    if (projectile.areaEffect) {
      this.createExplosionEffect(projectile.mesh.position.clone());
    }
    
    // Apply damage to player through game context
    if (window.gameContext && window.gameContext.damagePlayer) {
      window.gameContext.damagePlayer(projectile.damage);
    } else {
      console.warn('Could not find game context to apply player damage');
    }
    
    // Apply debuff effects
    if (projectile.debuffEffect) {
      this.applyDebuffEffect(projectile.enemyType);
    }
    
    // Emit hit event for other systems
    this.gameEngine.emit('playerHitByProjectile', {
      projectile,
      damage: projectile.damage,
      position: playerPosition,
      enemyType: projectile.enemyType
    });
  }

  createHitEffect(position, enemyType) {
    // Create impact effect based on enemy type
    let effectColor = 0xff4444;
    let effectSize = 1.0;
    
    switch (enemyType) {
      case 'ninja':
        effectColor = 0x444444;
        effectSize = 0.8;
        break;
      case 'bomb_thrower':
        effectColor = 0xff6600;
        effectSize = 1.5;
        break;
      case 'fast_debuffer':
        effectColor = 0xff88ff;
        effectSize = 1.2;
        break;
      case 'armored':
        effectColor = 0x888844;
        effectSize = 1.1;
        break;
      case 'boss':
        effectColor = 0xaa0000;
        effectSize = 2.0;
        break;
    }
    
    // Create impact spark effect
    const impactGeometry = new THREE.SphereGeometry(0.3 * effectSize, 8, 6);
    const impactMaterial = new THREE.MeshLambertMaterial({
      color: effectColor,
      transparent: true,
      opacity: 0.8,
      emissive: effectColor
    });
    
    const impact = new THREE.Mesh(impactGeometry, impactMaterial);
    impact.position.copy(position);
    this.gameEngine.getScene().add(impact);
    
    // Animate impact effect
    this.animateImpactEffect(impact);
  }

  createExplosionEffect(position) {
    // Create explosion effect for area damage projectiles
    const explosionGeometry = new THREE.SphereGeometry(2.0, 12, 8);
    const explosionMaterial = new THREE.MeshLambertMaterial({
      color: 0xff4400,
      transparent: true,
      opacity: 0.6,
      emissive: 0x442200
    });
    
    const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
    explosion.position.copy(position);
    explosion.scale.setScalar(0.1);
    
    this.gameEngine.getScene().add(explosion);
    this.animateExplosionEffect(explosion);
  }

  animateImpactEffect(impact) {
    const startTime = Date.now();
    const duration = 400;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (progress >= 1) {
        this.gameEngine.getScene().remove(impact);
        return;
      }
      
      impact.material.opacity = 0.8 * (1 - progress);
      impact.scale.setScalar(1 + progress * 2);
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }

  animateExplosionEffect(explosion) {
    const startTime = Date.now();
    const duration = 600;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (progress >= 1) {
        this.gameEngine.getScene().remove(explosion);
        return;
      }
      
      explosion.scale.setScalar(0.1 + progress * 2);
      explosion.material.opacity = 0.6 * (1 - progress);
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }

  applyDebuffEffect(enemyType) {
    // Apply temporary debuffs based on enemy type
    if (enemyType === 'fast_debuffer') {
      // Apply speed debuff through game context
      if (window.gameContext && window.gameContext.applyDebuff) {
        window.gameContext.applyDebuff('speed', 5000); // 5 second debuff
      }

      // Emit event for visual feedback
      this.gameEngine.emit('playerDebuffApplied', {
        type: 'speed',
        duration: 5000,
        intensity: 0.5
      });
    }
  }

  updateProjectileEffects(projectile, deltaTime) {
    // Add visual effects to projectiles while in flight
    switch (projectile.enemyType) {
      case 'ninja':
        // Stealth shimmer effect
        projectile.mesh.material.opacity = 0.4 + Math.sin(Date.now() * 0.01) * 0.2;
        break;
        
      case 'fast_debuffer':
        // Energy pulse effect
        const pulseIntensity = Math.sin(Date.now() * 0.02) * 0.3 + 0.7;
        projectile.mesh.material.emissive.setRGB(
          0.27 * pulseIntensity, 
          0.13 * pulseIntensity, 
          0.27 * pulseIntensity
        );
        break;
        
      case 'boss':
        // Dark energy effect
        const darkPulse = Math.sin(Date.now() * 0.015) * 0.2 + 0.8;
        projectile.mesh.material.emissive.setRGB(
          0.27 * darkPulse,
          0,
          0
        );
        break;
    }
  }

  removeProjectile(projectile) {
    // Remove from scene
    this.gameEngine.getScene().remove(projectile.mesh);
    
    // Reset projectile properties
    projectile.active = false;
    projectile.distanceTraveled = 0;
    projectile.velocity.set(0, 0, 0);
    projectile.mesh.position.set(0, 0, 0);
    projectile.mesh.material.opacity = 0.8;
    projectile.mesh.scale.setScalar(1.0);
    projectile.mesh.material.color.setHex(0xff4444);
    projectile.mesh.material.emissive.setHex(0x221111);
    
    // Return to pool if there's space
    if (this.projectilePool.length < this.maxPoolSize) {
      this.projectilePool.push(projectile);
    }
  }

  // Get all active projectiles (for debugging/UI)
  getActiveProjectiles() {
    return this.projectiles.filter(p => p.active);
  }

  // Deflect a projectile when shot by player
  deflectProjectile(projectileId, hitPosition) {
    const projectile = this.projectiles.find(p => p.id === projectileId);
    if (!projectile || !projectile.active) {
      console.warn(`Could not find active projectile: ${projectileId}`);
      return;
    }

    // Mark as deflected
    projectile.deflected = true;

    // Change visual appearance (with null checks)
    if (projectile.mesh && projectile.mesh.material) {
      if (projectile.mesh.material.color) {
        projectile.mesh.material.color.setHex(0x44ff44); // Green = deflected
      }
      if (projectile.mesh.material.emissive) {
        projectile.mesh.material.emissive.setHex(0x228822);
      }
    }

    if (projectile.mesh && projectile.mesh.scale) {
      projectile.mesh.scale.multiplyScalar(1.3); // Slightly bigger
    }

    // Scatter the bullet in a random direction away from player
    const randomAngle = Math.random() * Math.PI * 2;
    const randomElevation = (Math.random() - 0.5) * Math.PI * 0.5;

    const newDirection = new THREE.Vector3(
      Math.cos(randomAngle) * Math.cos(randomElevation),
      Math.sin(randomElevation),
      Math.sin(randomAngle) * Math.cos(randomElevation)
    );

    // Reduce speed slightly
    projectile.speed *= 0.7;
    projectile.velocity = newDirection.multiplyScalar(projectile.speed);

    // Reduce lifetime - deflected bullets disappear quickly
    projectile.maxLifetime = 2000; // 2 seconds
    projectile.createdTime = Date.now();

    // Create deflection particle effect
    this.createDeflectionEffect(hitPosition);
  }

  createDeflectionEffect(position) {
    // Create spark effect at deflection point
    const sparkGeometry = new THREE.SphereGeometry(0.2, 8, 6);
    const sparkMaterial = new THREE.MeshLambertMaterial({
      color: 0x44ff44,
      transparent: true,
      opacity: 1.0,
      emissive: 0x228822
    });

    const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
    spark.position.copy(position);
    this.gameEngine.getScene().add(spark);

    // Animate spark
    const startTime = Date.now();
    const duration = 300;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (progress >= 1) {
        this.gameEngine.getScene().remove(spark);
        return;
      }

      spark.material.opacity = 1.0 * (1 - progress);
      spark.scale.setScalar(1 + progress * 3);

      requestAnimationFrame(animate);
    };

    animate();
  }

  // Clear all projectiles
  clearAllProjectiles() {
    this.projectiles.forEach(projectile => {
      this.gameEngine.getScene().remove(projectile.mesh);
    });
    
    this.projectiles = [];
    
    // Return all projectiles to pool
    while (this.projectilePool.length < this.maxPoolSize) {
      const projectile = this.createProjectileObject();
      this.projectilePool.push(projectile);
    }
  }

  // Clean up system
  cleanup() {
    this.clearAllProjectiles();
    
    // Clean up pool
    this.projectilePool.forEach(projectile => {
      if (projectile.mesh.parent) {
        projectile.mesh.parent.remove(projectile.mesh);
      }
    });
    
    this.projectilePool = [];
  }
}