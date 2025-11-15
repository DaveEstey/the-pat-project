import * as THREE from 'three';
import { EnemyTypes, EnemyStats } from '../types/enemies.js';

/**
 * Enemy AI System - Handles enemy movement, behavior, and tactics
 *
 * Each enemy type has unique movement patterns:
 * - Basic Shooter: Side-to-side strafing, occasional advance/retreat
 * - Armored: Slow advance with cover-seeking
 * - Ninja: Fast zigzag rushes, tries to get close
 * - Bomb Thrower: Keeps distance, backs away if player gets close
 * - Fast Debuffer: Erratic circular patterns, never stops moving
 * - Boss: Complex multi-phase movement patterns
 */

export class EnemyAISystem {
  constructor() {
    this.enemyBehaviors = new Map(); // Track behavior state per enemy
    this.lastUpdateTime = 0;
    this.coverPoints = []; // Available cover positions in the level
    this.flankingPositions = []; // Positions for flanking maneuvers
  }

  /**
   * Initialize cover points for the current room
   */
  initializeCoverPoints(roomBounds = { minX: -20, maxX: 20, minZ: -30, maxZ: 30 }) {
    this.coverPoints = [];

    // Generate cover points in a grid pattern
    const coverSpacing = 8;
    for (let x = roomBounds.minX; x <= roomBounds.maxX; x += coverSpacing) {
      for (let z = roomBounds.minZ + 10; z <= roomBounds.maxZ - 10; z += coverSpacing) {
        this.coverPoints.push({
          position: { x, y: 0, z },
          occupied: false,
          occupiedBy: null,
          quality: Math.random() // Cover quality 0-1
        });
      }
    }
  }

  /**
   * Find nearest cover point for an enemy
   */
  findNearestCover(enemyPosition, minDistance = 5) {
    let bestCover = null;
    let bestScore = -Infinity;

    this.coverPoints.forEach(cover => {
      if (cover.occupied) return;

      const distance = Math.sqrt(
        Math.pow(cover.position.x - enemyPosition.x, 2) +
        Math.pow(cover.position.z - enemyPosition.z, 2)
      );

      // Score based on distance and cover quality
      if (distance >= minDistance) {
        const score = cover.quality - (distance * 0.1);
        if (score > bestScore) {
          bestScore = score;
          bestCover = cover;
        }
      }
    });

    return bestCover;
  }

  /**
   * Find flanking position relative to player
   */
  findFlankingPosition(enemyPosition, playerPosition) {
    // Calculate positions to the left and right of player
    const flankDistance = 15;
    const angleToPlayer = Math.atan2(
      playerPosition.z - enemyPosition.z,
      playerPosition.x - enemyPosition.x
    );

    // Try left flank
    const leftFlank = {
      x: playerPosition.x + Math.cos(angleToPlayer + Math.PI / 2) * flankDistance,
      y: 0,
      z: playerPosition.z + Math.sin(angleToPlayer + Math.PI / 2) * flankDistance
    };

    // Try right flank
    const rightFlank = {
      x: playerPosition.x + Math.cos(angleToPlayer - Math.PI / 2) * flankDistance,
      y: 0,
      z: playerPosition.z + Math.sin(angleToPlayer - Math.PI / 2) * flankDistance
    };

    // Choose closer flank position
    const distToLeft = Math.sqrt(
      Math.pow(leftFlank.x - enemyPosition.x, 2) +
      Math.pow(leftFlank.z - enemyPosition.z, 2)
    );
    const distToRight = Math.sqrt(
      Math.pow(rightFlank.x - enemyPosition.x, 2) +
      Math.pow(rightFlank.z - enemyPosition.z, 2)
    );

    return distToLeft < distToRight ? leftFlank : rightFlank;
  }

  /**
   * Initialize or update behavior state for an enemy
   */
  initializeEnemyBehavior(enemy) {
    if (!this.enemyBehaviors.has(enemy.id)) {
      this.enemyBehaviors.set(enemy.id, {
        currentState: 'idle',
        targetPosition: null,
        movementTimer: 0,
        behaviorChangeTimer: 0,
        movementDirection: new THREE.Vector3(0, 0, 0),
        strafeDirection: 1, // 1 = right, -1 = left
        originalPosition: { ...enemy.position },
        rushTarget: null,
        circlingAngle: Math.random() * Math.PI * 2,
        advanceProgress: 0, // How far enemy has advanced toward player

        // Cover system
        inCover: false,
        currentCover: null,
        coverTimer: 0,
        takingDamageCount: 0,
        lastDamagedTime: 0,

        // Flanking system
        flankingActive: false,
        flankTarget: null,
        flankTimer: 0
      });
    }
    return this.enemyBehaviors.get(enemy.id);
  }

  /**
   * Notify AI system that an enemy took damage (for cover seeking behavior)
   */
  notifyEnemyDamaged(enemyId) {
    const behavior = this.enemyBehaviors.get(enemyId);
    if (behavior) {
      behavior.takingDamageCount += 1;
      behavior.lastDamagedTime = performance.now();
    }
  }

  /**
   * Update all enemy AI behaviors
   */
  updateEnemyAI(enemies, deltaTime, playerPosition = { x: 0, y: 0, z: 0 }) {
    const currentTime = performance.now();
    const dt = Math.min(deltaTime / 1000, 0.1); // Cap delta time to prevent huge jumps

    enemies.forEach(enemy => {
      // Skip dead or spawning enemies
      if (enemy.health <= 0 || enemy.spawning) {
        return;
      }

      // Initialize behavior if needed
      const behavior = this.initializeEnemyBehavior(enemy);

      // Update movement based on enemy type
      switch (enemy.type) {
        case 'basic':
        case 'basic_shooter':
          this.updateBasicShooterAI(enemy, behavior, dt, playerPosition);
          break;
        case 'armored':
          this.updateArmoredAI(enemy, behavior, dt, playerPosition);
          break;
        case 'ninja':
          this.updateNinjaAI(enemy, behavior, dt, playerPosition);
          break;
        case 'bomb_thrower':
          this.updateBombThrowerAI(enemy, behavior, dt, playerPosition);
          break;
        case 'fast_debuffer':
          this.updateFastDebufferAI(enemy, behavior, dt, playerPosition);
          break;
        case 'boss':
          this.updateBossAI(enemy, behavior, dt, playerPosition);
          break;
        default:
          this.updateBasicShooterAI(enemy, behavior, dt, playerPosition);
      }

      // Apply movement limits to keep enemies in reasonable bounds
      this.applyMovementBounds(enemy, behavior);
    });

    this.lastUpdateTime = currentTime;
  }

  /**
   * Basic Shooter AI - Strafes side to side, uses cover, occasionally flanks
   */
  updateBasicShooterAI(enemy, behavior, dt, playerPosition) {
    const stats = EnemyStats.basic_shooter;
    behavior.movementTimer += dt;
    behavior.behaviorChangeTimer += dt;

    // Check if taking damage recently (implement cover seeking)
    const timeSinceLastDamage = performance.now() - behavior.lastDamagedTime;
    const shouldSeekCover = behavior.takingDamageCount > 2 && timeSinceLastDamage < 3000;

    // Decide AI behavior state
    if (shouldSeekCover && !behavior.inCover && this.coverPoints.length > 0) {
      // Seek cover
      const nearestCover = this.findNearestCover(enemy.position);
      if (nearestCover) {
        behavior.currentCover = nearestCover;
        nearestCover.occupied = true;
        nearestCover.occupiedBy = enemy.id;
        behavior.inCover = true;
        behavior.coverTimer = 0;
        behavior.takingDamageCount = 0; // Reset damage counter
      }
    }

    // If in cover, stay there for a while
    if (behavior.inCover && behavior.currentCover) {
      behavior.coverTimer += dt;

      // Move toward cover position
      const dx = behavior.currentCover.position.x - enemy.position.x;
      const dz = behavior.currentCover.position.z - enemy.position.z;
      const distToCover = Math.sqrt(dx * dx + dz * dz);

      if (distToCover > 0.5) {
        // Still moving to cover
        const moveSpeed = stats.speed * 1.5; // Move faster to cover
        enemy.position.x += (dx / distToCover) * moveSpeed * dt;
        enemy.position.z += (dz / distToCover) * moveSpeed * dt;
      } else {
        // At cover, peek out occasionally
        const peekAmount = Math.sin(performance.now() * 0.003) * 0.3;
        enemy.position.x = behavior.currentCover.position.x + peekAmount;
      }

      // Leave cover after 4-6 seconds
      if (behavior.coverTimer > 4 + Math.random() * 2) {
        behavior.inCover = false;
        if (behavior.currentCover) {
          behavior.currentCover.occupied = false;
          behavior.currentCover.occupiedBy = null;
        }
        behavior.currentCover = null;
      }

      // Bob up and down slightly
      const bobAmount = Math.sin(performance.now() * 0.002) * 0.1;
      enemy.position.y = behavior.originalPosition.y + bobAmount;

      return; // Skip normal movement while in cover
    }

    // Check for flanking opportunity (30% chance every 10 seconds)
    if (!behavior.flankingActive && behavior.behaviorChangeTimer > 10) {
      if (Math.random() < 0.3) {
        const flankPos = this.findFlankingPosition(enemy.position, playerPosition);
        behavior.flankTarget = flankPos;
        behavior.flankingActive = true;
        behavior.flankTimer = 0;
      }
      behavior.behaviorChangeTimer = 0;
    }

    // Execute flanking maneuver
    if (behavior.flankingActive && behavior.flankTarget) {
      behavior.flankTimer += dt;

      // Move toward flank position
      const dx = behavior.flankTarget.x - enemy.position.x;
      const dz = behavior.flankTarget.z - enemy.position.z;
      const distToFlank = Math.sqrt(dx * dx + dz * dz);

      if (distToFlank > 1.0) {
        // Still moving to flank position
        const moveSpeed = stats.speed * 1.2;
        enemy.position.x += (dx / distToFlank) * moveSpeed * dt;
        enemy.position.z += (dz / distToFlank) * moveSpeed * dt;
      } else {
        // Reached flank position, stop flanking
        behavior.flankingActive = false;
        behavior.flankTarget = null;
      }

      // Timeout flanking after 5 seconds
      if (behavior.flankTimer > 5) {
        behavior.flankingActive = false;
        behavior.flankTarget = null;
      }

      // Bob up and down slightly
      const bobAmount = Math.sin(performance.now() * 0.002) * 0.1;
      enemy.position.y = behavior.originalPosition.y + bobAmount;

      return; // Skip normal movement while flanking
    }

    // Normal behavior - strafe and advance
    // Change direction every 2-4 seconds
    if (behavior.movementTimer > 2 + Math.random() * 2) {
      behavior.strafeDirection *= -1;
      behavior.movementTimer = 0;

      // 30% chance to advance slightly toward player
      if (Math.random() < 0.3) {
        behavior.advanceProgress += 0.5;
      }
    }

    // Strafe movement
    const strafeSpeed = stats.speed * 0.75;
    enemy.position.x += behavior.strafeDirection * strafeSpeed * dt;

    // Slight advance toward player
    enemy.position.z += behavior.advanceProgress * stats.speed * dt * 0.1;

    // Bob up and down slightly
    const bobAmount = Math.sin(performance.now() * 0.002) * 0.1;
    enemy.position.y = behavior.originalPosition.y + bobAmount;
  }

  /**
   * Armored AI - Slow methodical advance, takes cover behind objects
   */
  updateArmoredAI(enemy, behavior, dt, playerPosition) {
    const stats = EnemyStats.armored;
    behavior.movementTimer += dt;

    // Move forward slowly and steadily
    const advanceSpeed = stats.speed * 0.8;
    enemy.position.z += advanceSpeed * dt;

    // Heavy footstep effect - bob with weight
    const heavyBob = Math.sin(performance.now() * 0.0008) * 0.05;
    enemy.position.y = behavior.originalPosition.y + heavyBob;

    // Slight side-to-side sway as if heavy
    const sway = Math.sin(performance.now() * 0.0006) * 0.15;
    enemy.position.x = behavior.originalPosition.x + sway;
  }

  /**
   * Ninja AI - Fast zigzag rushes, dash attacks with telegraph
   */
  updateNinjaAI(enemy, behavior, dt, playerPosition) {
    const stats = EnemyStats.ninja;
    behavior.movementTimer += dt;
    behavior.behaviorChangeTimer += dt;

    // Initialize dash state if not exists
    if (!behavior.dashState) {
      behavior.dashState = 'idle';
      behavior.dashCooldown = 0;
      behavior.dashChargeTime = 0;
      behavior.dashStartPos = null;
    }

    // Handle dash attack state machine
    if (behavior.dashState === 'idle') {
      // Normal movement - zigzag pattern
      const zigzagSpeed = stats.speed * 0.8;
      enemy.position.x += behavior.strafeDirection * zigzagSpeed * dt;
      enemy.position.z += stats.speed * dt * 0.3;

      // Quick direction changes
      if (behavior.movementTimer > 0.3) {
        behavior.strafeDirection *= -1;
        behavior.movementTimer = 0;
      }

      // Update dash cooldown
      behavior.dashCooldown -= dt;

      // Trigger dash attack when ready and player is in range
      const distanceToPlayer = Math.abs(enemy.position.z - playerPosition.z);
      if (behavior.dashCooldown <= 0 && distanceToPlayer < 25 && distanceToPlayer > 5) {
        behavior.dashState = 'charging';
        behavior.dashChargeTime = 0;

        // Visual telegraph - make enemy glow red (if mesh exists)
        if (enemy.mesh && enemy.mesh.material) {
          enemy.mesh.material.emissive = new THREE.Color(0xff0000);
          enemy.mesh.material.emissiveIntensity = 0.5;
        }
      }

    } else if (behavior.dashState === 'charging') {
      // Charge up dash (0.5 second telegraph)
      behavior.dashChargeTime += dt;

      // Stop moving during charge
      // Pulse emissive intensity
      if (enemy.mesh && enemy.mesh.material) {
        const pulseFactor = 0.5 + Math.sin(performance.now() * 0.02) * 0.5;
        enemy.mesh.material.emissiveIntensity = pulseFactor;
      }

      if (behavior.dashChargeTime >= 0.5) {
        // Execute dash
        behavior.dashState = 'dashing';
        behavior.dashStartPos = { ...enemy.position };
        behavior.dashProgress = 0;
      }

    } else if (behavior.dashState === 'dashing') {
      // Fast dash toward player (10 units forward)
      const dashDistance = 10;
      const dashSpeed = dashDistance / 0.3; // Dash takes 0.3 seconds

      behavior.dashProgress += dt;
      enemy.position.z += dashSpeed * dt;

      // Check for player collision during dash
      const distToPlayer = Math.sqrt(
        Math.pow(enemy.position.x - playerPosition.x, 2) +
        Math.pow(enemy.position.z - playerPosition.z, 2)
      );

      if (distToPlayer < 2) {
        // Hit player!
        if (window.gameContext && window.gameContext.damagePlayer) {
          window.gameContext.damagePlayer(35); // Ninja dash damage
        }

        // Emit dash hit event for visual feedback
        window.dispatchEvent(new CustomEvent('ninjaD ashHit', {
          detail: { position: enemy.position, damage: 35 }
        }));

        // End dash early
        behavior.dashState = 'recovering';
        behavior.dashRecoverTime = 0;
      } else if (behavior.dashProgress >= 0.3) {
        // Dash complete
        behavior.dashState = 'recovering';
        behavior.dashRecoverTime = 0;
      }

    } else if (behavior.dashState === 'recovering') {
      // Brief recovery after dash (0.5 seconds)
      behavior.dashRecoverTime += dt;

      // Reset visual effect
      if (enemy.mesh && enemy.mesh.material && behavior.dashRecoverTime < 0.1) {
        enemy.mesh.material.emissive = new THREE.Color(0x000000);
        enemy.mesh.material.emissiveIntensity = 0;
      }

      if (behavior.dashRecoverTime >= 0.5) {
        // Return to idle state
        behavior.dashState = 'idle';
        behavior.dashCooldown = 3 + Math.random() * 2; // 3-5 second cooldown
      }
    }

    // Fast erratic bobbing
    const fastBob = Math.sin(performance.now() * 0.006) * 0.15;
    enemy.position.y = behavior.originalPosition.y + fastBob;
  }

  /**
   * Bomb Thrower AI - Keeps distance, retreats if player gets close
   */
  updateBombThrowerAI(enemy, behavior, dt, playerPosition) {
    const stats = EnemyStats.bomb_thrower;

    // Calculate distance to player
    const distanceToPlayer = Math.abs(enemy.position.z - playerPosition.z);

    // If player is too close (within 15 units), back away
    if (distanceToPlayer < 15) {
      const retreatSpeed = stats.speed * 1.2;
      enemy.position.z -= retreatSpeed * dt; // Move back
    } else if (distanceToPlayer > 25) {
      // If too far, advance a bit
      const advanceSpeed = stats.speed * 0.5;
      enemy.position.z += advanceSpeed * dt;
    }

    // Slow side-to-side adjustment for aiming
    behavior.movementTimer += dt;
    if (behavior.movementTimer > 3) {
      behavior.strafeDirection *= -1;
      behavior.movementTimer = 0;
    }

    const aimAdjustSpeed = stats.speed * 0.5;
    enemy.position.x += behavior.strafeDirection * aimAdjustSpeed * dt;

    // Steady aiming stance
    const steadyBob = Math.sin(performance.now() * 0.001) * 0.03;
    enemy.position.y = behavior.originalPosition.y + steadyBob;
  }

  /**
   * Fast Debuffer AI - Constant erratic circular/figure-8 movement
   */
  updateFastDebufferAI(enemy, behavior, dt, playerPosition) {
    const stats = EnemyStats.fast_debuffer;

    // Increment circling angle for continuous movement (reduced speed)
    behavior.circlingAngle += stats.speed * dt * 0.25;

    // Figure-8 pattern using Lissajous curves (smaller radius)
    const radiusX = 1.5;
    const radiusZ = 1.0;
    const speedFactor = 1.5;

    enemy.position.x = behavior.originalPosition.x +
      Math.sin(behavior.circlingAngle * speedFactor) * radiusX;
    enemy.position.z = behavior.originalPosition.z +
      Math.sin(behavior.circlingAngle * speedFactor * 2) * radiusZ;

    // Rapid oscillating height
    const rapidBob = Math.sin(performance.now() * 0.008) * 0.2;
    enemy.position.y = behavior.originalPosition.y + rapidBob;

    // Gradually advance toward player
    behavior.advanceProgress += dt * 0.3;
    enemy.position.z += behavior.advanceProgress * 0.1;
  }

  /**
   * Boss AI - Complex multi-phase behavior with special attacks
   */
  updateBossAI(enemy, behavior, dt, playerPosition) {
    const stats = EnemyStats.boss;
    behavior.movementTimer += dt;
    behavior.behaviorChangeTimer += dt;

    // Initialize boss-specific state
    if (!behavior.currentPhase) {
      behavior.currentPhase = 1;
      behavior.specialAttackTimer = 0;
      behavior.phaseTransitioned = false;
    }

    // Update special attack timer
    behavior.specialAttackTimer += dt;

    // Determine phase based on health
    const healthPercent = enemy.health / enemy.maxHealth;
    let newPhase = 1;
    if (healthPercent <= 0.33) newPhase = 3;
    else if (healthPercent <= 0.66) newPhase = 2;

    // Detect phase transition
    if (newPhase !== behavior.currentPhase) {
      behavior.currentPhase = newPhase;
      behavior.phaseTransitioned = true;
      behavior.specialAttackTimer = 0;

      // Trigger phase transition visual effect
      if (enemy.mesh && enemy.mesh.material) {
        enemy.mesh.material.emissive = new THREE.Color(0xff0000);
        enemy.mesh.material.emissiveIntensity = 1.0;

        // Flash effect
        setTimeout(() => {
          if (enemy.mesh && enemy.mesh.material) {
            enemy.mesh.material.emissive = new THREE.Color(0x440000);
            enemy.mesh.material.emissiveIntensity = 0.3;
          }
        }, 500);
      }

      // Emit phase change event
      if (window.gameContext) {
        window.dispatchEvent(new CustomEvent('bossPhaseChange', {
          detail: { phase: newPhase, boss: enemy }
        }));
      }
    }

    // Phase-specific behavior and special attacks
    if (behavior.currentPhase === 1) {
      // Phase 1: Slow intimidating approach with side swaying
      const advanceSpeed = stats.speed * 0.6;
      enemy.position.z += advanceSpeed * dt;

      const wideSway = Math.sin(performance.now() * 0.0005) * 0.3;
      enemy.position.x = behavior.originalPosition.x + wideSway;

      // Trigger laser barrage every 8 seconds
      if (behavior.specialAttackTimer > 8) {
        this.triggerBossSpecialAttack(enemy, 'laser_barrage', playerPosition);
        behavior.specialAttackTimer = 0;
      }

    } else if (behavior.currentPhase === 2) {
      // Phase 2: More aggressive, faster movement with charges
      if (behavior.behaviorChangeTimer > 4) {
        behavior.currentState = behavior.currentState === 'charge' ? 'strafe' : 'charge';
        behavior.behaviorChangeTimer = 0;
        behavior.strafeDirection = Math.random() < 0.5 ? -1 : 1;
      }

      if (behavior.currentState === 'charge') {
        const chargeSpeed = stats.speed * 1.5;
        enemy.position.z += chargeSpeed * dt;
      } else {
        const strafeSpeed = stats.speed * 1.2;
        enemy.position.x += behavior.strafeDirection * strafeSpeed * dt;
      }

      // Trigger missile swarm every 6 seconds
      if (behavior.specialAttackTimer > 6) {
        this.triggerBossSpecialAttack(enemy, 'missile_swarm', playerPosition);
        behavior.specialAttackTimer = 0;
      }

    } else {
      // Phase 3: Desperate, erratic movement with frequent attacks
      const erraticSpeed = stats.speed * 1.8;

      if (behavior.movementTimer > 1) {
        behavior.strafeDirection *= -1;
        behavior.movementTimer = 0;
      }

      enemy.position.x += behavior.strafeDirection * erraticSpeed * dt;
      enemy.position.z += stats.speed * dt * 1.2;

      // Erratic bobbing
      const erraticBob = Math.sin(performance.now() * 0.004) * 0.15;
      enemy.position.y = behavior.originalPosition.y + erraticBob;

      // Rapid special attacks - alternate between teleport and ground slam every 4 seconds
      if (behavior.specialAttackTimer > 4) {
        const attackType = Math.random() < 0.5 ? 'teleport_strike' : 'ground_slam';
        this.triggerBossSpecialAttack(enemy, attackType, playerPosition);
        behavior.specialAttackTimer = 0;
      }
    }

    // Boss always has imposing presence
    const bossBob = Math.sin(performance.now() * 0.0003) * 0.1;
    enemy.position.y = behavior.originalPosition.y + bossBob;
  }

  /**
   * Trigger boss special attack (if boss attack system is available)
   */
  triggerBossSpecialAttack(enemy, attackType, playerPosition) {
    // Emit event for boss attack system to handle
    if (window.gameEngine) {
      window.gameEngine.emit('bossSpecialAttack', {
        boss: enemy,
        attackType: attackType,
        playerPosition: playerPosition
      });
    }
  }

  /**
   * Keep enemies within reasonable bounds
   */
  applyMovementBounds(enemy, behavior) {
    // Horizontal bounds
    const maxX = 8;
    if (Math.abs(enemy.position.x) > maxX) {
      enemy.position.x = Math.sign(enemy.position.x) * maxX;
      behavior.strafeDirection *= -1; // Bounce back
    }

    // Vertical bounds (prevent floating away or sinking)
    const minY = -0.5;
    const maxY = 5;
    enemy.position.y = Math.max(minY, Math.min(maxY, enemy.position.y));

    // Don't let enemies advance past the player (z > 0)
    if (enemy.position.z > -2) {
      enemy.position.z = -2;
    }

    // Don't let enemies go too far back
    if (enemy.position.z < behavior.originalPosition.z - 3) {
      enemy.position.z = behavior.originalPosition.z - 3;
    }
  }

  /**
   * Clean up behavior data for removed enemy
   */
  removeEnemy(enemyId) {
    this.enemyBehaviors.delete(enemyId);
  }

  /**
   * Reset all behaviors (useful for level restart)
   */
  reset() {
    this.enemyBehaviors.clear();
    this.lastUpdateTime = 0;
  }
}

export default EnemyAISystem;
