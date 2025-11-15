import * as THREE from 'three';

/**
 * Enhanced enemy visual utilities
 * Provides improved materials, effects, and animations for enemies
 */

/**
 * Create enhanced material with glow effect
 */
export function createEnemyMaterial(color, options = {}) {
  const {
    opacity = 1.0,
    emissiveIntensity = 0.3,
    metalness = 0.2,
    roughness = 0.8,
    spawning = false
  } = options;

  return new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: spawning ? 0 : emissiveIntensity,
    metalness: metalness,
    roughness: roughness,
    transparent: true,
    opacity: spawning ? 0 : opacity
  });
}

/**
 * Add glowing outline effect to enemy mesh
 */
export function addGlowOutline(mesh, color, intensity = 0.5) {
  const outlineGeometry = mesh.geometry.clone();
  const outlineMaterial = new THREE.MeshBasicMaterial({
    color: color,
    side: THREE.BackSide,
    transparent: true,
    opacity: intensity
  });

  const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
  outline.scale.multiplyScalar(1.05); // Slightly larger
  outline.userData.isDebug = true; // Non-hittable

  return outline;
}

/**
 * Create eye glow effect for enemies
 */
export function createEyeGlow(position, color = 0xff0000, size = 0.1) {
  const eyeGeometry = new THREE.SphereGeometry(size, 8, 8);
  const eyeMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.9
  });

  const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye.position.copy(position);
  eye.userData.isDebug = true; // Non-hittable

  return eye;
}

/**
 * Create floating health indicator above enemy
 */
export function createFloatingIndicator(enemyGroup, type = 'health') {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);

  sprite.scale.set(1, 0.25, 1);
  sprite.position.y = 3; // Above enemy
  sprite.userData.isDebug = true; // Non-hittable

  return sprite;
}

/**
 * Enhanced enemy type configurations with visual styles
 */
export const EnemyVisualConfigs = {
  basic: {
    primaryColor: 0xff4444,
    secondaryColor: 0xff6666,
    emissiveIntensity: 0.3,
    glowColor: 0xff0000,
    eyeColor: 0xff0000,
    scale: 1.0,
    animations: ['idle', 'attack']
  },
  armored: {
    primaryColor: 0x666666,
    secondaryColor: 0x888888,
    emissiveIntensity: 0.2,
    glowColor: 0x00ffff,
    eyeColor: 0x00ffff,
    scale: 1.2,
    animations: ['idle', 'heavy_attack'],
    armorPlates: true
  },
  ninja: {
    primaryColor: 0x220044,
    secondaryColor: 0x440088,
    emissiveIntensity: 0.5,
    glowColor: 0xff00ff,
    eyeColor: 0xff00ff,
    scale: 0.9,
    animations: ['idle', 'dash', 'attack'],
    stealth: true
  },
  bomb_thrower: {
    primaryColor: 0xff8800,
    secondaryColor: 0xffaa00,
    emissiveIntensity: 0.4,
    glowColor: 0xff8800,
    eyeColor: 0xff8800,
    scale: 1.1,
    animations: ['idle', 'throw'],
    bombPouch: true
  },
  fast_debuffer: {
    primaryColor: 0x00ff88,
    secondaryColor: 0x00ffaa,
    emissiveIntensity: 0.6,
    glowColor: 0x00ff88,
    eyeColor: 0x00ff88,
    scale: 0.85,
    animations: ['idle', 'speed_boost'],
    trailEffect: true
  },
  boss: {
    primaryColor: 0xff0000,
    secondaryColor: 0xaa0000,
    emissiveIntensity: 0.7,
    glowColor: 0xff0000,
    eyeColor: 0xff0000,
    scale: 2.0,
    animations: ['idle', 'attack', 'special'],
    crown: true,
    aura: true
  }
};

/**
 * Animate enemy idle breathing effect
 */
export function applyBreathingAnimation(mesh, time, speed = 1.0) {
  const breathe = Math.sin(time * speed) * 0.02 + 1;
  mesh.scale.y = breathe;
}

/**
 * Apply hit flash effect
 */
export function applyHitFlash(mesh, duration = 200) {
  if (!mesh || !mesh.material) return;

  const originalColor = mesh.material.color.clone();
  const originalEmissive = mesh.material.emissive.clone();

  // Flash white
  mesh.material.color.setHex(0xffffff);
  mesh.material.emissive.setHex(0xffffff);
  mesh.material.emissiveIntensity = 1.0;

  setTimeout(() => {
    if (mesh.material) {
      mesh.material.color.copy(originalColor);
      mesh.material.emissive.copy(originalEmissive);
      mesh.material.emissiveIntensity = 0.3;
    }
  }, duration);
}

/**
 * Create particle trail effect for fast enemies
 */
export function createTrailParticle(position, color = 0x00ff88) {
  const particleGeometry = new THREE.SphereGeometry(0.1, 4, 4);
  const particleMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.6
  });

  const particle = new THREE.Mesh(particleGeometry, particleMaterial);
  particle.position.copy(position);
  particle.userData.isParticle = true;
  particle.userData.lifetime = 0;
  particle.userData.maxLifetime = 500; // 0.5 seconds

  return particle;
}

/**
 * Update particle trail
 */
export function updateTrailParticle(particle, deltaTime) {
  if (!particle.userData.isParticle) return false;

  particle.userData.lifetime += deltaTime;
  const lifeRatio = particle.userData.lifetime / particle.userData.maxLifetime;

  // Fade out
  particle.material.opacity = 0.6 * (1 - lifeRatio);

  // Shrink
  const scale = 1 - lifeRatio * 0.5;
  particle.scale.set(scale, scale, scale);

  return particle.userData.lifetime < particle.userData.maxLifetime;
}

/**
 * Create boss aura effect
 */
export function createBossAura(position, radius = 3) {
  const auraGeometry = new THREE.RingGeometry(radius - 0.2, radius, 32);
  const auraMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  });

  const aura = new THREE.Mesh(auraGeometry, auraMaterial);
  aura.rotation.x = -Math.PI / 2;
  aura.position.copy(position);
  aura.position.y = 0.1;
  aura.userData.isDebug = true; // Non-hittable

  return aura;
}

/**
 * Animate boss aura pulsing
 */
export function animateBossAura(aura, time) {
  if (!aura) return;

  const pulse = Math.sin(time * 2) * 0.1 + 0.3;
  aura.material.opacity = pulse;

  const scale = Math.sin(time * 2) * 0.1 + 1;
  aura.scale.set(scale, scale, 1);
}

export default {
  createEnemyMaterial,
  addGlowOutline,
  createEyeGlow,
  createFloatingIndicator,
  EnemyVisualConfigs,
  applyBreathingAnimation,
  applyHitFlash,
  createTrailParticle,
  updateTrailParticle,
  createBossAura,
  animateBossAura
};
