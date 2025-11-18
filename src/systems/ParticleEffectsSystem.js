import * as THREE from 'three';

/**
 * Particle Effects System
 * Handles all visual effects: muzzle flash, hit effects, explosions, trails
 */
export class ParticleEffectsSystem {
  constructor(scene) {
    this.scene = scene;
    this.activeParticles = [];
    this.particlePool = [];
    this.maxParticles = 1000;
  }

  /**
   * Create muzzle flash effect at weapon position
   */
  createMuzzleFlash(position, color = 0xffff00) {
    const geometry = new THREE.SphereGeometry(0.3, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 1.0
    });

    const flash = new THREE.Mesh(geometry, material);
    flash.position.copy(position);

    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.5,
      side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    flash.add(glow);

    this.scene.add(flash);

    // Animate flash
    const startTime = Date.now();
    const duration = 100; // 100ms flash

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress < 1) {
        const scale = 1 + progress * 0.5;
        flash.scale.setScalar(scale);
        material.opacity = 1 - progress;
        glowMaterial.opacity = 0.5 - progress * 0.5;
        requestAnimationFrame(animate);
      } else {
        this.scene.remove(flash);
        geometry.dispose();
        material.dispose();
        glowGeometry.dispose();
        glowMaterial.dispose();
      }
    };

    animate();
  }

  /**
   * Create hit effect with particles
   */
  createHitEffect(position, normal = new THREE.Vector3(0, 1, 0), color = 0xff0000) {
    const particleCount = 15;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.05, 4, 4);
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 1.0
      });

      const particle = new THREE.Mesh(geometry, material);
      particle.position.copy(position);

      // Random velocity in hemisphere around normal
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random(),
        (Math.random() - 0.5) * 2
      ).normalize().multiplyScalar(Math.random() * 3 + 1);

      particle.userData = {
        velocity: velocity,
        gravity: -9.8,
        life: 1.0,
        decay: 0.02
      };

      this.scene.add(particle);
      particles.push(particle);
    }

    // Animate particles
    const animate = () => {
      let allDead = true;

      particles.forEach(particle => {
        if (particle.userData.life > 0) {
          allDead = false;

          // Update position
          particle.position.add(particle.userData.velocity.clone().multiplyScalar(0.016));

          // Apply gravity
          particle.userData.velocity.y += particle.userData.gravity * 0.016;

          // Update life and opacity
          particle.userData.life -= particle.userData.decay;
          particle.material.opacity = particle.userData.life;

          // Shrink over time
          const scale = particle.userData.life;
          particle.scale.setScalar(scale);
        }
      });

      if (!allDead) {
        requestAnimationFrame(animate);
      } else {
        // Cleanup
        particles.forEach(particle => {
          this.scene.remove(particle);
          particle.geometry.dispose();
          particle.material.dispose();
        });
      }
    };

    animate();
  }

  /**
   * Create explosion effect
   */
  createExplosion(position, size = 1.0, color = 0xff6600) {
    // Central flash
    const flashGeometry = new THREE.SphereGeometry(size * 0.5, 16, 16);
    const flashMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 1.0
    });

    const flash = new THREE.Mesh(flashGeometry, flashMaterial);
    flash.position.copy(position);
    this.scene.add(flash);

    // Shockwave ring
    const ringGeometry = new THREE.RingGeometry(size * 0.2, size * 0.4, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });

    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.copy(position);
    ring.rotation.x = -Math.PI / 2;
    this.scene.add(ring);

    // Debris particles
    const particleCount = 30;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.1 * size, 4, 4);
      const material = new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? 0xff0000 : color,
        transparent: true,
        opacity: 1.0
      });

      const particle = new THREE.Mesh(geometry, material);
      particle.position.copy(position);

      // Random outward velocity
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 5 + Math.random() * 3;
      const velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.random() * 3,
        Math.sin(angle) * speed
      );

      particle.userData = {
        velocity: velocity,
        gravity: -9.8,
        life: 1.0,
        decay: 0.015
      };

      this.scene.add(particle);
      particles.push(particle);
    }

    // Animate explosion
    const startTime = Date.now();
    const duration = 500;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress < 1) {
        // Flash
        const flashScale = 1 + progress * 2;
        flash.scale.setScalar(flashScale);
        flashMaterial.opacity = 1 - progress;

        // Ring expansion
        const ringScale = 1 + progress * 3;
        ring.scale.setScalar(ringScale);
        ringMaterial.opacity = 0.8 - progress * 0.8;

        // Particles
        particles.forEach(particle => {
          if (particle.userData.life > 0) {
            particle.position.add(particle.userData.velocity.clone().multiplyScalar(0.016));
            particle.userData.velocity.y += particle.userData.gravity * 0.016;
            particle.userData.life -= particle.userData.decay;
            particle.material.opacity = particle.userData.life;
            particle.scale.setScalar(particle.userData.life);
          }
        });

        requestAnimationFrame(animate);
      } else {
        // Cleanup
        this.scene.remove(flash);
        this.scene.remove(ring);
        flashGeometry.dispose();
        flashMaterial.dispose();
        ringGeometry.dispose();
        ringMaterial.dispose();

        particles.forEach(particle => {
          this.scene.remove(particle);
          particle.geometry.dispose();
          particle.material.dispose();
        });
      }
    };

    animate();
  }

  /**
   * Create bullet trail effect
   */
  createBulletTrail(start, end, color = 0xffff00) {
    const points = [start.clone(), end.clone()];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 1.0,
      linewidth: 2
    });

    const line = new THREE.Line(geometry, material);
    this.scene.add(line);

    // Fade out
    const startTime = Date.now();
    const duration = 150;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress < 1) {
        material.opacity = 1 - progress;
        requestAnimationFrame(animate);
      } else {
        this.scene.remove(line);
        geometry.dispose();
        material.dispose();
      }
    };

    animate();
  }

  /**
   * Create smoke puff effect
   */
  createSmokePuff(position, color = 0x666666) {
    const geometry = new THREE.SphereGeometry(0.3, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.5
    });

    const smoke = new THREE.Mesh(geometry, material);
    smoke.position.copy(position);
    this.scene.add(smoke);

    const startTime = Date.now();
    const duration = 1000;
    const velocity = new THREE.Vector3(0, 0.5, 0);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress < 1) {
        smoke.position.add(velocity.clone().multiplyScalar(0.016));
        smoke.scale.setScalar(1 + progress * 2);
        material.opacity = 0.5 - progress * 0.5;
        requestAnimationFrame(animate);
      } else {
        this.scene.remove(smoke);
        geometry.dispose();
        material.dispose();
      }
    };

    animate();
  }

  /**
   * Create shield hit effect (for deflecting bullets)
   */
  createShieldEffect(position, color = 0x00ffff) {
    const geometry = new THREE.SphereGeometry(1.0, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.6,
      wireframe: true
    });

    const shield = new THREE.Mesh(geometry, material);
    shield.position.copy(position);
    this.scene.add(shield);

    const startTime = Date.now();
    const duration = 300;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress < 1) {
        const scale = 0.5 + progress * 0.5;
        shield.scale.setScalar(scale);
        material.opacity = 0.6 - progress * 0.6;
        requestAnimationFrame(animate);
      } else {
        this.scene.remove(shield);
        geometry.dispose();
        material.dispose();
      }
    };

    animate();
  }

  /**
   * Create blood spatter effect
   */
  createBloodEffect(position, direction, intensity = 1.0) {
    const particleCount = Math.floor(10 * intensity);
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.08, 4, 4);
      const material = new THREE.MeshBasicMaterial({
        color: 0x880000,
        transparent: true,
        opacity: 0.8
      });

      const particle = new THREE.Mesh(geometry, material);
      particle.position.copy(position);

      // Velocity based on direction
      const spread = 0.5;
      const velocity = direction.clone()
        .multiplyScalar(-2)
        .add(new THREE.Vector3(
          (Math.random() - 0.5) * spread,
          (Math.random() - 0.5) * spread,
          (Math.random() - 0.5) * spread
        ));

      particle.userData = {
        velocity: velocity,
        gravity: -5,
        life: 1.0,
        decay: 0.02
      };

      this.scene.add(particle);
      particles.push(particle);
    }

    // Animate
    const animate = () => {
      let allDead = true;

      particles.forEach(particle => {
        if (particle.userData.life > 0) {
          allDead = false;
          particle.position.add(particle.userData.velocity.clone().multiplyScalar(0.016));
          particle.userData.velocity.y += particle.userData.gravity * 0.016;
          particle.userData.life -= particle.userData.decay;
          particle.material.opacity = particle.userData.life * 0.8;
        }
      });

      if (!allDead) {
        requestAnimationFrame(animate);
      } else {
        particles.forEach(particle => {
          this.scene.remove(particle);
          particle.geometry.dispose();
          particle.material.dispose();
        });
      }
    };

    animate();
  }

  /**
   * Cleanup all active particles
   */
  cleanup() {
    this.activeParticles.forEach(particle => {
      if (particle.parent) {
        this.scene.remove(particle);
      }
      if (particle.geometry) particle.geometry.dispose();
      if (particle.material) particle.material.dispose();
    });

    this.activeParticles = [];
    this.particlePool = [];
  }
}

// Singleton instance
let particleSystemInstance = null;

export function getParticleSystem(scene) {
  if (!particleSystemInstance && scene) {
    particleSystemInstance = new ParticleEffectsSystem(scene);
  }
  return particleSystemInstance;
}

export function resetParticleSystem() {
  if (particleSystemInstance) {
    particleSystemInstance.cleanup();
    particleSystemInstance = null;
  }
}
