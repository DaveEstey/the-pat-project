import * as THREE from 'three';

/**
 * ParticleSystem - Handles all particle effects and visual feedback
 */
export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.particleGeometry = new THREE.BufferGeometry();
    this.particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      alphaTest: 0.1
    });

    // Pre-create geometries for performance
    this.boxGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
    this.sphereGeometry = new THREE.SphereGeometry(0.03, 8, 8);

    this.activeEffects = [];
  }

  /**
   * Create hit effect when enemy is damaged
   */
  createHitEffect(position, color = 0xff0000, intensity = 'normal') {
    const particleCount = intensity === 'critical' ? 20 : 10;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(this.boxGeometry.clone(), new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.8
      }));

      particle.position.copy(position);
      particle.position.add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      ));

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        Math.random() * 0.02 + 0.01,
        (Math.random() - 0.5) * 0.02
      );

      this.scene.add(particle);

      const effect = {
        mesh: particle,
        velocity: velocity,
        life: 1.0,
        decay: 0.02,
        type: 'hit'
      };

      this.activeEffects.push(effect);
    }
  }

  /**
   * Create muzzle flash effect when weapon fires
   */
  createMuzzleFlash(position, weaponType = 'pistol') {
    const flash = new THREE.Mesh(
      this.sphereGeometry.clone(),
      new THREE.MeshBasicMaterial({
        color: weaponType === 'shotgun' ? 0xffff00 : 0xffa500,
        transparent: true,
        opacity: 0.9
      })
    );

    flash.position.copy(position);
    flash.scale.set(
      weaponType === 'shotgun' ? 0.5 : 0.3,
      weaponType === 'shotgun' ? 0.5 : 0.3,
      weaponType === 'shotgun' ? 0.5 : 0.3
    );

    this.scene.add(flash);

    const effect = {
      mesh: flash,
      velocity: new THREE.Vector3(0, 0, 0),
      life: 1.0,
      decay: 0.1,
      type: 'muzzle',
      initialScale: flash.scale.clone()
    };

    this.activeEffects.push(effect);
  }

  /**
   * Create explosion effect when enemy dies
   */
  createExplosion(position, size = 'normal') {
    const particleCount = size === 'boss' ? 30 : 15;
    const colors = [0xff4444, 0xffaa00, 0xffff44, 0xff8800];

    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(
        this.sphereGeometry.clone(),
        new THREE.MeshBasicMaterial({
          color: colors[Math.floor(Math.random() * colors.length)],
          transparent: true,
          opacity: 0.8
        })
      );

      particle.position.copy(position);
      particle.position.add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3
      ));

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.03,
        (Math.random() - 0.5) * 0.03,
        (Math.random() - 0.5) * 0.03
      );

      this.scene.add(particle);

      const effect = {
        mesh: particle,
        velocity: velocity,
        life: 1.0,
        decay: 0.015,
        type: 'explosion'
      };

      this.activeEffects.push(effect);
    }

    // Add shockwave effect
    this.createShockwave(position, size === 'boss' ? 1.0 : 0.5);
  }

  /**
   * Create shockwave ring effect
   */
  createShockwave(position, scale = 0.5) {
    const ringGeometry = new THREE.RingGeometry(0.1, 0.15, 16);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });

    const shockwave = new THREE.Mesh(ringGeometry, ringMaterial);
    shockwave.position.copy(position);
    shockwave.lookAt(position.x, position.y + 1, position.z);

    this.scene.add(shockwave);

    const effect = {
      mesh: shockwave,
      velocity: new THREE.Vector3(0, 0, 0),
      life: 1.0,
      decay: 0.03,
      type: 'shockwave',
      baseScale: scale
    };

    this.activeEffects.push(effect);
  }

  /**
   * Create damage number floating text effect
   */
  createDamageNumber(position, damage, isCritical = false) {
    // Create a simple colored cube to represent damage number
    const numberIndicator = new THREE.Mesh(
      this.boxGeometry.clone(),
      new THREE.MeshBasicMaterial({
        color: isCritical ? 0xffff00 : 0xff6666,
        transparent: true,
        opacity: 1.0
      })
    );

    numberIndicator.position.copy(position);
    numberIndicator.position.y += 0.5;

    // Scale based on damage amount
    const scale = Math.min(damage / 25, 2) * (isCritical ? 1.5 : 1);
    numberIndicator.scale.set(scale, scale, scale);

    this.scene.add(numberIndicator);

    const effect = {
      mesh: numberIndicator,
      velocity: new THREE.Vector3(0, 0.02, 0),
      life: 1.0,
      decay: 0.02,
      type: 'damage_number'
    };

    this.activeEffects.push(effect);
  }

  /**
   * Create weapon-specific projectile trail
   */
  createProjectileTrail(startPos, endPos, weaponType = 'pistol') {
    const direction = new THREE.Vector3().subVectors(endPos, startPos).normalize();
    const distance = startPos.distanceTo(endPos);

    // Create line geometry for trail
    const points = [startPos.clone(), endPos.clone()];
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

    let color = 0xffffff;
    let width = 2;

    switch (weaponType) {
      case 'shotgun':
        color = 0xffff00;
        width = 4;
        break;
      case 'rapidfire':
        color = 0xff4444;
        width = 1;
        break;
      case 'grappling':
        color = 0x44ff44;
        width = 3;
        break;
    }

    const lineMaterial = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.8
    });

    const trail = new THREE.Line(lineGeometry, lineMaterial);
    this.scene.add(trail);

    const effect = {
      mesh: trail,
      velocity: new THREE.Vector3(0, 0, 0),
      life: 1.0,
      decay: 0.08,
      type: 'projectile_trail'
    };

    this.activeEffects.push(effect);
  }

  /**
   * Update all active particle effects
   */
  update(deltaTime) {
    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const effect = this.activeEffects[i];

      // Update position
      effect.mesh.position.add(
        effect.velocity.clone().multiplyScalar(deltaTime * 60)
      );

      // Update life
      effect.life -= effect.decay;

      // Update opacity
      if (effect.mesh.material.opacity !== undefined) {
        effect.mesh.material.opacity = effect.life;
      }

      // Special updates per type
      switch (effect.type) {
        case 'muzzle':
          effect.mesh.scale.copy(effect.initialScale);
          effect.mesh.scale.multiplyScalar(effect.life * 2);
          break;

        case 'shockwave':
          const expansionScale = (1 - effect.life) * effect.baseScale * 3;
          effect.mesh.scale.set(expansionScale, expansionScale, 1);
          break;

        case 'explosion':
          // Add gravity to explosion particles
          effect.velocity.y -= 0.001;
          break;
      }

      // Remove dead effects
      if (effect.life <= 0) {
        this.scene.remove(effect.mesh);
        this.activeEffects.splice(i, 1);
      }
    }
  }

  /**
   * Clean up all effects
   */
  cleanup() {
    for (const effect of this.activeEffects) {
      this.scene.remove(effect.mesh);
    }
    this.activeEffects = [];
  }

  /**
   * Create weapon reload effect
   */
  createReloadEffect(position) {
    const reloadRing = new THREE.Mesh(
      new THREE.RingGeometry(0.2, 0.25, 12),
      new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
      })
    );

    reloadRing.position.copy(position);
    reloadRing.position.y += 0.3;

    this.scene.add(reloadRing);

    const effect = {
      mesh: reloadRing,
      velocity: new THREE.Vector3(0, 0.01, 0),
      life: 1.0,
      decay: 0.025,
      type: 'reload',
      rotationSpeed: 0.1
    };

    this.activeEffects.push(effect);

    // Add rotation
    const animate = () => {
      if (effect.life > 0) {
        effect.mesh.rotation.z += effect.rotationSpeed;
        requestAnimationFrame(animate);
      }
    };
    animate();
  }
}

export default ParticleSystem;