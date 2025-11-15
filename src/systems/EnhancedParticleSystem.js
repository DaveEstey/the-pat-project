import * as THREE from 'three';

/**
 * Enhanced Particle System - Creates advanced particle effects for enemy deaths and critical hits
 */
export class EnhancedParticleSystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.particles = [];
  }

  /**
   * Create explosion particle effect for enemy death
   */
  createDeathExplosion(position, enemyType = 'basic') {
    const scene = this.gameEngine?.getScene();
    if (!scene) return;

    const particleCount = enemyType === 'boss' ? 50 : 30;
    const colors = this.getEnemyColors(enemyType);

    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.2);
      const material = new THREE.MeshBasicMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        transparent: true,
        opacity: 1.0
      });
      const particle = new THREE.Mesh(geometry, material);

      // Random explosion direction
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.5;
      const elevation = (Math.random() - 0.5) * Math.PI;

      particle.position.set(
        position.x,
        position.y,
        position.z
      );

      particle.velocity = {
        x: Math.cos(angle) * Math.cos(elevation) * speed,
        y: Math.sin(elevation) * speed * 2,
        z: Math.sin(angle) * Math.cos(elevation) * speed
      };

      particle.gravity = -0.02;
      particle.lifetime = 60 + Math.random() * 40; // 60-100 frames
      particle.age = 0;

      scene.add(particle);
      this.particles.push(particle);
    }

    // Create expanding shockwave ring
    this.createShockwave(position, colors[0]);
  }

  /**
   * Create shockwave ring effect
   */
  createShockwave(position, color) {
    const scene = this.gameEngine?.getScene();
    if (!scene) return;

    const geometry = new THREE.RingGeometry(0.1, 0.3, 32);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(geometry, material);

    ring.position.set(position.x, position.y, position.z);
    ring.rotation.x = Math.PI / 2;

    scene.add(ring);

    // Animate shockwave expansion
    let scale = 1;
    let opacity = 0.8;
    const animate = () => {
      scale += 0.3;
      opacity -= 0.03;

      ring.scale.set(scale, scale, 1);
      material.opacity = Math.max(0, opacity);

      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        scene.remove(ring);
        geometry.dispose();
        material.dispose();
      }
    };
    animate();
  }

  /**
   * Create critical hit star burst effect
   */
  createCriticalHitEffect(position) {
    const scene = this.gameEngine?.getScene();
    if (!scene) return;

    // Create star particles
    for (let i = 0; i < 12; i++) {
      const starGeometry = this.createStarGeometry();
      const material = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xffff00 : 0xff8800,
        transparent: true,
        opacity: 1.0
      });
      const star = new THREE.Mesh(starGeometry, material);

      const angle = (i / 12) * Math.PI * 2;
      const speed = 0.8;

      star.position.set(position.x, position.y, position.z);
      star.velocity = {
        x: Math.cos(angle) * speed,
        y: 0.5,
        z: Math.sin(angle) * speed
      };
      star.rotation.z = angle;
      star.rotationSpeed = 0.2;
      star.lifetime = 50;
      star.age = 0;

      scene.add(star);
      this.particles.push(star);
    }

    // Create flash
    this.createFlash(position, 0xffff00);
  }

  /**
   * Create hit spark effect
   */
  createHitSparks(position, count = 8) {
    const scene = this.gameEngine?.getScene();
    if (!scene) return;

    for (let i = 0; i < count; i++) {
      const geometry = new THREE.ConeGeometry(0.05, 0.3, 4);
      const material = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 1.0
      });
      const spark = new THREE.Mesh(geometry, material);

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 0.5;

      spark.position.set(position.x, position.y, position.z);
      spark.velocity = {
        x: Math.cos(angle) * speed,
        y: Math.random() * 0.5,
        z: Math.sin(angle) * speed
      };
      spark.gravity = -0.03;
      spark.lifetime = 30;
      spark.age = 0;

      scene.add(spark);
      this.particles.push(spark);
    }
  }

  /**
   * Create muzzle flash effect when weapon fires
   */
  createMuzzleFlash(position, direction) {
    const scene = this.gameEngine?.getScene();
    if (!scene) return;

    // Create bright flash sphere
    const geometry = new THREE.SphereGeometry(0.3);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffff88,
      transparent: true,
      opacity: 1.0
    });
    const flash = new THREE.Mesh(geometry, material);
    flash.position.copy(position);

    // Add directional cone
    const coneGeometry = new THREE.ConeGeometry(0.2, 0.5, 8);
    const coneMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa44,
      transparent: true,
      opacity: 0.8
    });
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.position.copy(position);

    // Orient cone in firing direction
    if (direction) {
      cone.lookAt(
        position.x + direction.x,
        position.y + direction.y,
        position.z + direction.z
      );
      cone.rotateX(Math.PI / 2);
    }

    flash.lifetime = 8;
    flash.age = 0;
    cone.lifetime = 8;
    cone.age = 0;

    scene.add(flash);
    scene.add(cone);
    this.particles.push(flash, cone);
  }

  /**
   * Create bullet impact effect with material-specific particles
   */
  createBulletImpact(position, surfaceType = 'default') {
    const scene = this.gameEngine?.getScene();
    if (!scene) return;

    let color, particleCount;
    switch (surfaceType) {
      case 'metal':
        color = 0xcccccc;
        particleCount = 15;
        this.createHitSparks(position, 12);
        break;
      case 'wood':
        color = 0x8B4513;
        particleCount = 10;
        break;
      case 'concrete':
        color = 0x888888;
        particleCount = 12;
        break;
      case 'flesh':
        color = 0xff0000;
        particleCount = 8;
        break;
      default:
        color = 0xccaa66;
        particleCount = 8;
    }

    // Create impact particles
    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.BoxGeometry(0.08, 0.08, 0.08);
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 1.0
      });
      const particle = new THREE.Mesh(geometry, material);

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.3 + Math.random() * 0.7;

      particle.position.set(position.x, position.y, position.z);
      particle.velocity = {
        x: Math.cos(angle) * speed,
        y: Math.random() * 0.8,
        z: Math.sin(angle) * speed
      };
      particle.gravity = -0.04;
      particle.lifetime = 25 + Math.random() * 15;
      particle.age = 0;
      particle.rotationSpeed = (Math.random() - 0.5) * 0.3;

      scene.add(particle);
      this.particles.push(particle);
    }

    // Create impact flash
    this.createSmallFlash(position, color);
  }

  /**
   * Create small flash effect
   */
  createSmallFlash(position, color) {
    const scene = this.gameEngine?.getScene();
    if (!scene) return;

    const geometry = new THREE.SphereGeometry(0.5);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.6
    });
    const flash = new THREE.Mesh(geometry, material);

    flash.position.set(position.x, position.y, position.z);
    scene.add(flash);

    let scale = 1;
    let opacity = 0.6;
    const animate = () => {
      scale += 0.3;
      opacity -= 0.1;

      flash.scale.set(scale, scale, scale);
      material.opacity = Math.max(0, opacity);

      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        scene.remove(flash);
        geometry.dispose();
        material.dispose();
      }
    };
    animate();
  }

  /**
   * Create smoke trail effect
   */
  createSmokeTrail(position, duration = 60) {
    const scene = this.gameEngine?.getScene();
    if (!scene) return;

    for (let i = 0; i < 5; i++) {
      const geometry = new THREE.SphereGeometry(0.2 + i * 0.1);
      const material = new THREE.MeshBasicMaterial({
        color: 0x444444,
        transparent: true,
        opacity: 0.3
      });
      const smoke = new THREE.Mesh(geometry, material);

      smoke.position.set(
        position.x + (Math.random() - 0.5) * 0.3,
        position.y + (Math.random() - 0.5) * 0.3,
        position.z + (Math.random() - 0.5) * 0.3
      );

      smoke.velocity = {
        x: (Math.random() - 0.5) * 0.05,
        y: 0.02 + Math.random() * 0.03,
        z: (Math.random() - 0.5) * 0.05
      };
      smoke.lifetime = duration + i * 10;
      smoke.age = i * 5;
      smoke.scaleSpeed = 0.02;

      scene.add(smoke);
      this.particles.push(smoke);
    }
  }

  /**
   * Create fire particles
   */
  createFireEffect(position, duration = 100) {
    const scene = this.gameEngine?.getScene();
    if (!scene) return;

    for (let i = 0; i < 15; i++) {
      const geometry = new THREE.SphereGeometry(0.15 + Math.random() * 0.1);
      const material = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xff4400 : 0xffaa00,
        transparent: true,
        opacity: 0.8
      });
      const fire = new THREE.Mesh(geometry, material);

      fire.position.set(
        position.x + (Math.random() - 0.5) * 0.5,
        position.y + Math.random() * 0.3,
        position.z + (Math.random() - 0.5) * 0.5
      );

      fire.velocity = {
        x: (Math.random() - 0.5) * 0.1,
        y: 0.1 + Math.random() * 0.1,
        z: (Math.random() - 0.5) * 0.1
      };
      fire.lifetime = 30 + Math.random() * 20;
      fire.age = 0;

      scene.add(fire);
      this.particles.push(fire);
    }
  }

  /**
   * Create dust cloud effect
   */
  createDustCloud(position, size = 1.0) {
    const scene = this.gameEngine?.getScene();
    if (!scene) return;

    for (let i = 0; i < 10; i++) {
      const geometry = new THREE.SphereGeometry(0.3 * size);
      const material = new THREE.MeshBasicMaterial({
        color: 0xccaa88,
        transparent: true,
        opacity: 0.4
      });
      const dust = new THREE.Mesh(geometry, material);

      const angle = (i / 10) * Math.PI * 2;
      const radius = 0.5 * size;

      dust.position.set(
        position.x + Math.cos(angle) * radius,
        position.y,
        position.z + Math.sin(angle) * radius
      );

      dust.velocity = {
        x: Math.cos(angle) * 0.1,
        y: 0.05,
        z: Math.sin(angle) * 0.1
      };
      dust.lifetime = 40 + Math.random() * 20;
      dust.age = 0;
      dust.scaleSpeed = 0.03;

      scene.add(dust);
      this.particles.push(dust);
    }
  }

  /**
   * Create explosion with fire and smoke
   */
  createLargeExplosion(position, size = 1.0) {
    // Create main explosion particles
    this.createDeathExplosion(position, 'boss');

    // Add fire particles
    this.createFireEffect(position, 80);

    // Add smoke trail
    this.createSmokeTrail(position, 100);

    // Add dust cloud
    this.createDustCloud(position, size);

    // Create large flash
    this.createFlash(position, 0xff6600);
  }

  /**
   * Create heal/pickup sparkle effect
   */
  createSparkleEffect(position, color = 0xffff00) {
    const scene = this.gameEngine?.getScene();
    if (!scene) return;

    for (let i = 0; i < 12; i++) {
      const starGeometry = this.createStarGeometry();
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 1.0
      });
      const star = new THREE.Mesh(starGeometry, material);

      const angle = (i / 12) * Math.PI * 2;

      star.position.set(
        position.x + Math.cos(angle) * 0.3,
        position.y + (Math.random() - 0.5) * 0.2,
        position.z + Math.sin(angle) * 0.3
      );

      star.velocity = {
        x: Math.cos(angle) * 0.15,
        y: 0.1 + Math.random() * 0.1,
        z: Math.sin(angle) * 0.15
      };
      star.rotation.z = angle;
      star.rotationSpeed = 0.15;
      star.lifetime = 40;
      star.age = 0;

      scene.add(star);
      this.particles.push(star);
    }
  }

  /**
   * Create flash effect
   */
  createFlash(position, color) {
    const scene = this.gameEngine?.getScene();
    if (!scene) return;

    const geometry = new THREE.SphereGeometry(1.5);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.8
    });
    const flash = new THREE.Mesh(geometry, material);

    flash.position.set(position.x, position.y, position.z);
    scene.add(flash);

    let scale = 1;
    let opacity = 0.8;
    const animate = () => {
      scale += 0.5;
      opacity -= 0.08;

      flash.scale.set(scale, scale, scale);
      material.opacity = Math.max(0, opacity);

      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        scene.remove(flash);
        geometry.dispose();
        material.dispose();
      }
    };
    animate();
  }

  /**
   * Update all particles
   */
  update() {
    const scene = this.gameEngine?.getScene();
    if (!scene) return;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.age++;

      // Apply physics
      if (particle.velocity) {
        particle.position.x += particle.velocity.x;
        particle.position.y += particle.velocity.y;
        particle.position.z += particle.velocity.z;

        if (particle.gravity) {
          particle.velocity.y += particle.gravity;
        }
      }

      // Rotation
      if (particle.rotationSpeed) {
        particle.rotation.z += particle.rotationSpeed;
        particle.rotation.x += particle.rotationSpeed * 0.5;
      }

      // Scale over time (for smoke/dust effects)
      if (particle.scaleSpeed) {
        const newScale = 1 + (particle.age * particle.scaleSpeed);
        particle.scale.set(newScale, newScale, newScale);
      }

      // Fade out
      if (particle.material) {
        particle.material.opacity = 1 - (particle.age / particle.lifetime);
      }

      // Remove old particles
      if (particle.age >= particle.lifetime) {
        scene.remove(particle);
        if (particle.geometry) particle.geometry.dispose();
        if (particle.material) particle.material.dispose();
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Get enemy type colors
   */
  getEnemyColors(enemyType) {
    switch (enemyType) {
      case 'basic':
        return [0xff4444, 0xff8888, 0xffaa44];
      case 'armored':
        return [0x888888, 0xaaaaaa, 0xcccccc];
      case 'ninja':
        return [0x2222aa, 0x4444cc, 0x8888ff];
      case 'bomb_thrower':
        return [0xff8800, 0xffaa00, 0xffcc44];
      case 'fast_debuffer':
        return [0x00cc88, 0x00ffaa, 0x44ffcc];
      case 'boss':
        return [0xaa0066, 0xff0088, 0xff44aa];
      default:
        return [0xff4444, 0xff8888, 0xffaa44];
    }
  }

  /**
   * Create star geometry
   */
  createStarGeometry() {
    const shape = new THREE.Shape();
    const outerRadius = 0.3;
    const innerRadius = 0.15;
    const points = 5;

    for (let i = 0; i < points * 2; i++) {
      const angle = (i / (points * 2)) * Math.PI * 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }
    shape.closePath();

    const geometry = new THREE.ShapeGeometry(shape);
    return geometry;
  }

  /**
   * Cleanup all particles
   */
  cleanup() {
    const scene = this.gameEngine?.getScene();
    if (!scene) return;

    this.particles.forEach(particle => {
      scene.remove(particle);
      if (particle.geometry) particle.geometry.dispose();
      if (particle.material) particle.material.dispose();
    });

    this.particles = [];
  }
}

export default EnhancedParticleSystem;
