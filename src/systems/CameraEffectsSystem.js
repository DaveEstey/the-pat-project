/**
 * Camera Effects System
 * Screen shake, recoil, and other camera feedback
 */

import * as THREE from 'three';

let cameraEffectsInstance = null;

export function initializeCameraEffects(camera) {
  if (cameraEffectsInstance) {
    return cameraEffectsInstance;
  }
  cameraEffectsInstance = new CameraEffectsSystem(camera);
  return cameraEffectsInstance;
}

export function getCameraEffects() {
  return cameraEffectsInstance;
}

export class CameraEffectsSystem {
  constructor(camera) {
    this.camera = camera;
    this.originalPosition = new THREE.Vector3();
    this.originalRotation = new THREE.Euler();

    // Shake parameters
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeElapsed = 0;
    this.shakeOffset = new THREE.Vector3();

    // Recoil parameters
    this.recoilIntensity = 0;
    this.recoilDecay = 0.9;
    this.recoilOffset = new THREE.Euler();

    // FOV effects
    this.targetFOV = 75;
    this.currentFOV = 75;
    this.fovSpeed = 5;

    this.isActive = false;
  }

  /**
   * Add screen shake
   * @param {number} intensity - Shake intensity (0-1)
   * @param {number} duration - Duration in ms
   */
  addScreenShake(intensity, duration) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeDuration = duration;
    this.shakeElapsed = 0;
    this.isActive = true;

    // Store original position if not shaking
    if (!this.isActive) {
      this.originalPosition.copy(this.camera.position);
      this.originalRotation.copy(this.camera.rotation);
    }
  }

  /**
   * Add weapon recoil effect
   * @param {number} intensity - Recoil intensity
   * @param {string} weaponType - Type of weapon for different recoil patterns
   */
  addRecoil(intensity, weaponType = 'default') {
    const patterns = {
      pistol: { x: -0.015, y: 0.005, z: 0 },
      shotgun: { x: -0.03, y: 0.01, z: 0 },
      rapidfire: { x: -0.01, y: 0.003, z: 0 },
      default: { x: -0.02, y: 0.007, z: 0 }
    };

    const pattern = patterns[weaponType] || patterns.default;

    this.recoilOffset.x += pattern.x * intensity;
    this.recoilOffset.y += pattern.y * intensity;
    this.recoilOffset.z += pattern.z * intensity;
  }

  /**
   * Add FOV kick (zoom effect)
   * @param {number} fovChange - FOV change amount
   * @param {number} duration - Duration in ms
   */
  addFOVKick(fovChange, duration) {
    this.targetFOV = this.currentFOV + fovChange;

    setTimeout(() => {
      this.targetFOV = 75; // Return to normal
    }, duration);
  }

  /**
   * Add hit impact effect
   */
  addHitImpact() {
    this.addScreenShake(0.3, 150);
    this.addFOVKick(-5, 100);
  }

  /**
   * Add explosion effect
   * @param {number} distance - Distance from explosion
   */
  addExplosionEffect(distance) {
    const intensity = Math.max(0, 1 - distance / 10);
    this.addScreenShake(intensity * 0.8, 500);
    this.addFOVKick(intensity * 10, 300);
  }

  /**
   * Add damage vignette pulse
   */
  addDamageVignette() {
    // This would integrate with post-processing
    window.dispatchEvent(new CustomEvent('cameraVignetteEffect', {
      detail: { intensity: 0.5, duration: 200 }
    }));
  }

  /**
   * Update camera effects
   * @param {number} deltaTime - Time since last frame (seconds)
   */
  update(deltaTime) {
    // Update screen shake
    if (this.shakeElapsed < this.shakeDuration) {
      this.shakeElapsed += deltaTime * 1000;

      const progress = this.shakeElapsed / this.shakeDuration;
      const currentIntensity = this.shakeIntensity * (1 - progress);

      // Random shake offset
      this.shakeOffset.set(
        (Math.random() - 0.5) * currentIntensity * 2,
        (Math.random() - 0.5) * currentIntensity * 2,
        (Math.random() - 0.5) * currentIntensity * 0.5
      );

      // Apply shake to camera
      this.camera.position.copy(this.originalPosition).add(this.shakeOffset);

      // Rotational shake
      const rotShake = currentIntensity * 0.1;
      this.camera.rotation.set(
        this.originalRotation.x + (Math.random() - 0.5) * rotShake,
        this.originalRotation.y + (Math.random() - 0.5) * rotShake,
        this.originalRotation.z + (Math.random() - 0.5) * rotShake * 0.5
      );
    } else if (this.isActive) {
      // Reset to original position
      this.camera.position.copy(this.originalPosition);
      this.camera.rotation.copy(this.originalRotation);
      this.isActive = false;
      this.shakeIntensity = 0;
    }

    // Update recoil (smooth recovery)
    if (Math.abs(this.recoilOffset.x) > 0.0001 || Math.abs(this.recoilOffset.y) > 0.0001) {
      this.recoilOffset.x *= this.recoilDecay;
      this.recoilOffset.y *= this.recoilDecay;
      this.recoilOffset.z *= this.recoilDecay;

      // Apply recoil to camera rotation
      this.camera.rotation.x += this.recoilOffset.x;
      this.camera.rotation.y += this.recoilOffset.y;
      this.camera.rotation.z += this.recoilOffset.z;
    }

    // Update FOV smoothly
    if (Math.abs(this.currentFOV - this.targetFOV) > 0.1) {
      this.currentFOV += (this.targetFOV - this.currentFOV) * this.fovSpeed * deltaTime;
      this.camera.fov = this.currentFOV;
      this.camera.updateProjectionMatrix();
    }

    // Store current position as original for next frame (if not shaking)
    if (!this.isActive) {
      this.originalPosition.copy(this.camera.position);
      this.originalRotation.copy(this.camera.rotation);
    }
  }

  /**
   * Apply weapon-specific firing effect
   */
  applyWeaponFiringEffect(weaponType) {
    const effects = {
      pistol: { shake: 0.05, duration: 50, recoil: 0.8 },
      shotgun: { shake: 0.15, duration: 150, recoil: 1.5 },
      rapidfire: { shake: 0.03, duration: 30, recoil: 0.5 },
      grappling: { shake: 0.08, duration: 100, recoil: 0.6 }
    };

    const effect = effects[weaponType] || effects.pistol;

    this.addScreenShake(effect.shake, effect.duration);
    this.addRecoil(effect.recoil, weaponType);
  }

  /**
   * Reset all effects
   */
  reset() {
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeElapsed = 0;
    this.recoilOffset.set(0, 0, 0);
    this.currentFOV = 75;
    this.targetFOV = 75;
    this.isActive = false;
  }
}
