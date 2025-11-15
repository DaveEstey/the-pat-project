import * as THREE from 'three';

/**
 * Boss Attack System - Handles special boss attack patterns
 *
 * Special Attacks:
 * - laser_barrage: Sweeping laser beams across the arena
 * - missile_swarm: Multiple homing projectiles
 * - teleport_strike: Teleports and does melee attack
 * - ground_slam: Area of effect ground attack
 * - energy_shield: Temporary invulnerability with reflection
 */

export class BossAttackSystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.activeAttacks = [];
    this.lastAttackTime = 0;
    this.attackCooldown = 5000; // 5 seconds between special attacks
  }

  /**
   * Trigger a special attack based on boss phase and health
   */
  triggerSpecialAttack(boss, attackType, playerPosition = { x: 0, y: 0, z: 0 }) {
    const currentTime = Date.now();

    // Check cooldown
    if (currentTime - this.lastAttackTime < this.attackCooldown) {
      return false;
    }
    this.lastAttackTime = currentTime;

    switch (attackType) {
      case 'laser_barrage':
        this.laserBarrage(boss, playerPosition);
        break;
      case 'missile_swarm':
        this.missileSwarm(boss, playerPosition);
        break;
      case 'teleport_strike':
        this.teleportStrike(boss, playerPosition);
        break;
      case 'ground_slam':
        this.groundSlam(boss);
        break;
      case 'energy_shield':
        this.energyShield(boss);
        break;
      default:
        console.warn(`Unknown attack type: ${attackType}`);
    }

    return true;
  }

  /**
   * Laser Barrage - Sweeping laser beams
   */
  laserBarrage(boss, playerPosition) {
    const scene = this.gameEngine.getScene();
    const laserCount = 3;
    const duration = 3000;
    const startTime = Date.now();

    for (let i = 0; i < laserCount; i++) {
      setTimeout(() => {
        // Create laser beam
        const laserGeometry = new THREE.CylinderGeometry(0.2, 0.2, 20, 8);
        const laserMaterial = new THREE.MeshBasicMaterial({
          color: 0xff0000,
          emissive: 0xff0000,
          transparent: true,
          opacity: 0.8
        });
        const laser = new THREE.Mesh(laserGeometry, laserMaterial);

        // Position laser from boss
        laser.position.set(boss.position.x, boss.position.y, boss.position.z - 10);
        laser.rotation.x = Math.PI / 2;

        // Sweep across arena
        const sweepSpeed = 0.05;
        const direction = i % 2 === 0 ? 1 : -1;

        scene.add(laser);

        const animate = () => {
          const elapsed = Date.now() - startTime;
          if (elapsed > duration) {
            scene.remove(laser);
            return;
          }

          laser.position.x += direction * sweepSpeed;
          laserMaterial.opacity = 0.8 - (elapsed / duration) * 0.5;

          // Check collision with player
          const distance = Math.sqrt(
            Math.pow(laser.position.x - playerPosition.x, 2) +
            Math.pow(laser.position.z - playerPosition.z, 2)
          );

          if (distance < 1.5) {
            // Emit damage event
            this.gameEngine.emit('bossAttackHit', {
              type: 'laser_barrage',
              damage: 30
            });
          }

          requestAnimationFrame(animate);
        };

        animate();
      }, i * 1000);
    }

    this.activeAttacks.push({
      type: 'laser_barrage',
      startTime: Date.now(),
      duration: duration + (laserCount * 1000)
    });
  }

  /**
   * Missile Swarm - Multiple homing projectiles
   */
  missileSwarm(boss, playerPosition) {
    const scene = this.gameEngine.getScene();
    const missileCount = 8;

    for (let i = 0; i < missileCount; i++) {
      setTimeout(() => {
        // Create missile
        const missileGeometry = new THREE.ConeGeometry(0.2, 0.8, 8);
        const missileMaterial = new THREE.MeshLambertMaterial({
          color: 0xff8800,
          emissive: 0xff4400
        });
        const missile = new THREE.Mesh(missileGeometry, missileMaterial);

        // Start position around boss
        const angle = (i / missileCount) * Math.PI * 2;
        missile.position.set(
          boss.position.x + Math.cos(angle) * 3,
          boss.position.y + 2,
          boss.position.z + Math.sin(angle) * 3
        );

        // Add smoke trail
        const trailGeometry = new THREE.SphereGeometry(0.1);
        const trailMaterial = new THREE.MeshBasicMaterial({
          color: 0x666666,
          transparent: true,
          opacity: 0.5
        });
        const trail = new THREE.Mesh(trailGeometry, trailMaterial);
        missile.add(trail);

        scene.add(missile);

        const speed = 0.15;
        const startTime = Date.now();
        const lifetime = 4000;

        const animate = () => {
          const elapsed = Date.now() - startTime;
          if (elapsed > lifetime) {
            scene.remove(missile);
            return;
          }

          // Home towards player
          const dx = playerPosition.x - missile.position.x;
          const dy = playerPosition.y - missile.position.y;
          const dz = playerPosition.z - missile.position.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance > 0.5) {
            missile.position.x += (dx / distance) * speed;
            missile.position.y += (dy / distance) * speed;
            missile.position.z += (dz / distance) * speed;

            // Point missile towards movement direction
            missile.lookAt(playerPosition.x, playerPosition.y, playerPosition.z);
          } else {
            // Hit player!
            this.gameEngine.emit('bossAttackHit', {
              type: 'missile_swarm',
              damage: 25
            });
            scene.remove(missile);
            return;
          }

          requestAnimationFrame(animate);
        };

        animate();
      }, i * 300);
    }
  }

  /**
   * Teleport Strike - Boss teleports behind player
   */
  teleportStrike(boss, playerPosition) {
    const scene = this.gameEngine.getScene();

    // Teleport effect at current position
    const flashGeometry = new THREE.SphereGeometry(2);
    const flashMaterial = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      transparent: true,
      opacity: 1
    });
    const flash = new THREE.Mesh(flashGeometry, flashMaterial);
    flash.position.copy(boss.position);
    scene.add(flash);

    // Fade out flash
    const fadeFlash = () => {
      flashMaterial.opacity -= 0.05;
      if (flashMaterial.opacity > 0) {
        requestAnimationFrame(fadeFlash);
      } else {
        scene.remove(flash);
      }
    };
    fadeFlash();

    // Teleport boss behind player
    setTimeout(() => {
      boss.position.x = playerPosition.x;
      boss.position.z = playerPosition.z + 3; // Behind player

      // Appear effect
      const appearFlash = new THREE.Mesh(flashGeometry, flashMaterial.clone());
      appearFlash.material.opacity = 1;
      appearFlash.position.copy(boss.position);
      scene.add(appearFlash);

      const fadeAppear = () => {
        appearFlash.material.opacity -= 0.05;
        if (appearFlash.material.opacity > 0) {
          requestAnimationFrame(fadeAppear);
        } else {
          scene.remove(appearFlash);
        }
      };
      fadeAppear();

      // Deal damage
      this.gameEngine.emit('bossAttackHit', {
        type: 'teleport_strike',
        damage: 40
      });
    }, 500);
  }

  /**
   * Ground Slam - Area damage attack
   */
  groundSlam(boss) {
    const scene = this.gameEngine.getScene();

    // Boss jumps
    const originalY = boss.position.y;
    const jumpHeight = 5;
    const jumpDuration = 1000;
    const startTime = Date.now();

    const jump = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / jumpDuration, 1);

      if (progress < 0.5) {
        // Jump up
        boss.position.y = originalY + (jumpHeight * (progress * 2));
      } else {
        // Fall down
        boss.position.y = originalY + jumpHeight - (jumpHeight * ((progress - 0.5) * 2));
      }

      if (progress < 1) {
        requestAnimationFrame(jump);
      } else {
        // Impact!
        boss.position.y = originalY;

        // Create shockwave
        const shockwaveGeometry = new THREE.RingGeometry(0.5, 10, 32);
        const shockwaveMaterial = new THREE.MeshBasicMaterial({
          color: 0xffaa00,
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide
        });
        const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
        shockwave.rotation.x = -Math.PI / 2;
        shockwave.position.set(boss.position.x, 0.1, boss.position.z);
        scene.add(shockwave);

        const expandShockwave = () => {
          shockwave.scale.x += 0.1;
          shockwave.scale.y += 0.1;
          shockwaveMaterial.opacity -= 0.02;

          if (shockwaveMaterial.opacity > 0) {
            requestAnimationFrame(expandShockwave);
          } else {
            scene.remove(shockwave);
          }
        };
        expandShockwave();

        // Damage in radius
        this.gameEngine.emit('bossAttackHit', {
          type: 'ground_slam',
          damage: 35,
          radius: 8
        });
      }
    };

    jump();
  }

  /**
   * Energy Shield - Temporary invulnerability
   */
  energyShield(boss) {
    const scene = this.gameEngine.getScene();
    const duration = 3000;

    // Create shield visual
    const shieldGeometry = new THREE.SphereGeometry(2.5, 16, 16);
    const shieldMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    });
    const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
    shield.position.copy(boss.position);
    boss.add(shield);

    // Shield active flag
    boss.userData.shieldActive = true;

    // Pulse animation
    const startTime = Date.now();
    const pulse = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        boss.remove(shield);
        boss.userData.shieldActive = false;
        return;
      }

      const scale = 1 + Math.sin(elapsed * 0.01) * 0.1;
      shield.scale.set(scale, scale, scale);
      shieldMaterial.opacity = 0.3 + Math.sin(elapsed * 0.01) * 0.2;

      requestAnimationFrame(pulse);
    };
    pulse();
  }

  /**
   * Update active attacks
   */
  update(deltaTime) {
    // Clean up expired attacks
    this.activeAttacks = this.activeAttacks.filter(attack => {
      const elapsed = Date.now() - attack.startTime;
      return elapsed < attack.duration;
    });
  }

  /**
   * Check if boss should use special attack based on health
   */
  shouldUseSpecialAttack(boss, playerPosition) {
    if (!boss || !boss.health || !boss.maxHealth) return null;

    const healthPercent = boss.health / boss.maxHealth;
    const timeSinceLastAttack = Date.now() - this.lastAttackTime;

    // Can't attack if on cooldown
    if (timeSinceLastAttack < this.attackCooldown) {
      return null;
    }

    // Choose attack based on health phase
    if (healthPercent > 0.66) {
      // Phase 1: Basic attacks
      return Math.random() < 0.3 ? 'missile_swarm' : null;
    } else if (healthPercent > 0.33) {
      // Phase 2: More aggressive
      const attacks = ['laser_barrage', 'missile_swarm', 'teleport_strike'];
      return Math.random() < 0.5 ? attacks[Math.floor(Math.random() * attacks.length)] : null;
    } else {
      // Phase 3: Desperate, all attacks
      const attacks = ['laser_barrage', 'missile_swarm', 'teleport_strike', 'ground_slam', 'energy_shield'];
      return Math.random() < 0.7 ? attacks[Math.floor(Math.random() * attacks.length)] : null;
    }
  }

  /**
   * Cleanup all active attacks
   */
  cleanup() {
    this.activeAttacks = [];
  }
}

export default BossAttackSystem;
