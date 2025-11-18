import * as THREE from 'three';

/**
 * Screen Shake System
 * Adds camera shake effects for combat feedback
 */
export class ScreenShakeSystem {
  constructor(camera) {
    this.camera = camera;
    this.originalPosition = new THREE.Vector3();
    this.originalRotation = new THREE.Euler();
    this.shakeIntensity = 0;
    this.shakeDecay = 0.95;
    this.shaking = false;
    this.shakeOffset = new THREE.Vector3();
    this.rotationOffset = new THREE.Euler();
  }

  /**
   * Trigger screen shake
   * @param {number} intensity - Shake strength (0.01 - 1.0)
   * @param {number} duration - Shake duration in ms
   */
  shake(intensity = 0.1, duration = 300) {
    // Add to current shake instead of replacing
    this.shakeIntensity = Math.min(1.0, this.shakeIntensity + intensity);

    if (!this.shaking) {
      this.shaking = true;
      this.originalPosition.copy(this.camera.position);
      this.originalRotation.copy(this.camera.rotation);
      this.startShake(duration);
    }
  }

  /**
   * Small shake (hit enemy)
   */
  shakeSmall() {
    this.shake(0.05, 150);
  }

  /**
   * Medium shake (player hit)
   */
  shakeMedium() {
    this.shake(0.15, 250);
  }

  /**
   * Large shake (explosion, boss hit)
   */
  shakeLarge() {
    this.shake(0.3, 400);
  }

  /**
   * Massive shake (boss death, big explosion)
   */
  shakeMassive() {
    this.shake(0.5, 600);
  }

  /**
   * Start shake animation
   */
  startShake(duration) {
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;

      if (elapsed < duration && this.shakeIntensity > 0.001) {
        // Random offset based on intensity
        this.shakeOffset.set(
          (Math.random() - 0.5) * this.shakeIntensity,
          (Math.random() - 0.5) * this.shakeIntensity,
          (Math.random() - 0.5) * this.shakeIntensity * 0.3
        );

        // Apply position offset
        this.camera.position.copy(this.originalPosition).add(this.shakeOffset);

        // Small rotation offset for more dynamic shake
        this.rotationOffset.set(
          (Math.random() - 0.5) * this.shakeIntensity * 0.05,
          (Math.random() - 0.5) * this.shakeIntensity * 0.05,
          (Math.random() - 0.5) * this.shakeIntensity * 0.02
        );

        this.camera.rotation.set(
          this.originalRotation.x + this.rotationOffset.x,
          this.originalRotation.y + this.rotationOffset.y,
          this.originalRotation.z + this.rotationOffset.z
        );

        // Decay shake intensity
        this.shakeIntensity *= this.shakeDecay;

        requestAnimationFrame(animate);
      } else {
        // Reset to original position
        this.camera.position.copy(this.originalPosition);
        this.camera.rotation.copy(this.originalRotation);
        this.shaking = false;
        this.shakeIntensity = 0;
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Update camera reference (if camera changes)
   */
  setCamera(camera) {
    this.camera = camera;
    this.originalPosition.copy(camera.position);
    this.originalRotation.copy(camera.rotation);
  }

  /**
   * Stop all shaking immediately
   */
  stop() {
    if (this.shaking && this.camera) {
      this.camera.position.copy(this.originalPosition);
      this.camera.rotation.copy(this.originalRotation);
    }
    this.shaking = false;
    this.shakeIntensity = 0;
  }
}

// Singleton instance
let screenShakeInstance = null;

export function getScreenShake(camera) {
  if (!screenShakeInstance && camera) {
    screenShakeInstance = new ScreenShakeSystem(camera);
  } else if (screenShakeInstance && camera) {
    screenShakeInstance.setCamera(camera);
  }
  return screenShakeInstance;
}

export function resetScreenShake() {
  if (screenShakeInstance) {
    screenShakeInstance.stop();
    screenShakeInstance = null;
  }
}
