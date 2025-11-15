/**
 * Dodge System - Player dodge roll with invincibility frames
 *
 * Features:
 * - Quick dodge roll in movement direction
 * - Invincibility frames during dodge
 * - Cooldown management
 * - Stamina/energy cost
 * - Visual feedback (blur/dash effect)
 */

import * as THREE from 'three';

export class DodgeSystem {
  constructor() {
    this.isDodging = false;
    this.dodgeStartTime = 0;
    this.dodgeDuration = 400; // 0.4 seconds dodge
    this.dodgeCooldown = 1500; // 1.5 second cooldown
    this.lastDodgeTime = 0;
    this.dodgeDirection = new THREE.Vector3(0, 0, 0);
    this.dodgeDistance = 8; // Distance to travel during dodge
    this.invulnerabilityFrames = 350; // Invulnerable for 350ms of the 400ms dodge

    // Stamina system
    this.maxStamina = 100;
    this.currentStamina = 100;
    this.dodgeCost = 25;
    this.staminaRegenRate = 15; // Stamina per second
    this.staminaRegenDelay = 1000; // Delay before regen starts after dodge
    this.lastStaminaUseTime = 0;

    // Dodge upgrades (can be unlocked)
    this.upgrades = {
      reducedCooldown: false, // 20% faster cooldown
      reducedCost: false, // 30% less stamina cost
      longerInvuln: false, // 100ms extra invulnerability
      fasterDodge: false, // 15% more distance
      phaseThrough: false // Can dodge through enemies
    };
  }

  /**
   * Attempt to perform a dodge
   */
  tryDodge(movementDirection = { x: 0, z: 1 }) {
    const currentTime = Date.now();

    // Check if already dodging
    if (this.isDodging) {
      return { success: false, reason: 'already_dodging' };
    }

    // Check cooldown
    const timeSinceLastDodge = currentTime - this.lastDodgeTime;
    const effectiveCooldown = this.upgrades.reducedCooldown
      ? this.dodgeCooldown * 0.8
      : this.dodgeCooldown;

    if (timeSinceLastDodge < effectiveCooldown) {
      return {
        success: false,
        reason: 'on_cooldown',
        remainingCooldown: effectiveCooldown - timeSinceLastDodge
      };
    }

    // Check stamina
    const effectiveCost = this.upgrades.reducedCost
      ? this.dodgeCost * 0.7
      : this.dodgeCost;

    if (this.currentStamina < effectiveCost) {
      return {
        success: false,
        reason: 'insufficient_stamina',
        requiredStamina: effectiveCost
      };
    }

    // Execute dodge
    this.isDodging = true;
    this.dodgeStartTime = currentTime;
    this.lastDodgeTime = currentTime;
    this.lastStaminaUseTime = currentTime;

    // Set dodge direction (normalize and scale)
    const magnitude = Math.sqrt(movementDirection.x * movementDirection.x +
                                 movementDirection.z * movementDirection.z);

    if (magnitude > 0) {
      this.dodgeDirection.set(
        movementDirection.x / magnitude,
        0,
        movementDirection.z / magnitude
      );
    } else {
      // Default to forward if no direction
      this.dodgeDirection.set(0, 0, 1);
    }

    // Apply dodge distance upgrade
    const effectiveDistance = this.upgrades.fasterDodge
      ? this.dodgeDistance * 1.15
      : this.dodgeDistance;
    this.dodgeDirection.multiplyScalar(effectiveDistance);

    // Consume stamina
    this.currentStamina -= effectiveCost;

    // Emit dodge start event
    this.emitDodgeEvent('dodgeStart', {
      direction: this.dodgeDirection,
      duration: this.dodgeDuration,
      distance: effectiveDistance
    });

    return { success: true };
  }

  /**
   * Update dodge state and stamina regeneration
   */
  update(deltaTime) {
    const currentTime = Date.now();

    // Update dodge state
    if (this.isDodging) {
      const dodgeProgress = (currentTime - this.dodgeStartTime) / this.dodgeDuration;

      if (dodgeProgress >= 1.0) {
        // Dodge complete
        this.isDodging = false;
        this.emitDodgeEvent('dodgeEnd', {});
      }
    }

    // Regenerate stamina
    const timeSinceStaminaUse = currentTime - this.lastStaminaUseTime;
    if (timeSinceStaminaUse > this.staminaRegenDelay && this.currentStamina < this.maxStamina) {
      const regenAmount = (this.staminaRegenRate * deltaTime) / 1000;
      this.currentStamina = Math.min(this.maxStamina, this.currentStamina + regenAmount);
    }
  }

  /**
   * Check if player is currently invulnerable
   */
  isInvulnerable() {
    if (!this.isDodging) return false;

    const dodgeElapsed = Date.now() - this.dodgeStartTime;
    const effectiveInvuln = this.upgrades.longerInvuln
      ? this.invulnerabilityFrames + 100
      : this.invulnerabilityFrames;

    return dodgeElapsed < effectiveInvuln;
  }

  /**
   * Get current dodge progress (0.0 to 1.0)
   */
  getDodgeProgress() {
    if (!this.isDodging) return 0;

    const elapsed = Date.now() - this.dodgeStartTime;
    return Math.min(elapsed / this.dodgeDuration, 1.0);
  }

  /**
   * Get dodge position offset at current time
   */
  getDodgeOffset() {
    if (!this.isDodging) {
      return new THREE.Vector3(0, 0, 0);
    }

    const progress = this.getDodgeProgress();

    // Use ease-out curve for smooth deceleration
    const easedProgress = 1 - Math.pow(1 - progress, 3);

    return new THREE.Vector3(
      this.dodgeDirection.x * easedProgress,
      0,
      this.dodgeDirection.z * easedProgress
    );
  }

  /**
   * Get cooldown progress (0.0 to 1.0, where 1.0 = ready)
   */
  getCooldownProgress() {
    const timeSinceLastDodge = Date.now() - this.lastDodgeTime;
    const effectiveCooldown = this.upgrades.reducedCooldown
      ? this.dodgeCooldown * 0.8
      : this.dodgeCooldown;

    return Math.min(timeSinceLastDodge / effectiveCooldown, 1.0);
  }

  /**
   * Get stamina percentage (0.0 to 1.0)
   */
  getStaminaPercent() {
    return this.currentStamina / this.maxStamina;
  }

  /**
   * Check if dodge is ready
   */
  canDodge() {
    if (this.isDodging) return false;

    const cooldownReady = this.getCooldownProgress() >= 1.0;
    const effectiveCost = this.upgrades.reducedCost
      ? this.dodgeCost * 0.7
      : this.dodgeCost;
    const staminaReady = this.currentStamina >= effectiveCost;

    return cooldownReady && staminaReady;
  }

  /**
   * Unlock an upgrade
   */
  unlockUpgrade(upgradeType) {
    if (this.upgrades.hasOwnProperty(upgradeType)) {
      this.upgrades[upgradeType] = true;
      this.emitDodgeEvent('upgradeUnlocked', { upgrade: upgradeType });
      return true;
    }
    return false;
  }

  /**
   * Reset dodge system (for testing or level restart)
   */
  reset() {
    this.isDodging = false;
    this.currentStamina = this.maxStamina;
    this.lastDodgeTime = 0;
    this.lastStaminaUseTime = 0;
  }

  /**
   * Emit dodge-related events
   */
  emitDodgeEvent(eventName, data) {
    window.dispatchEvent(new CustomEvent(eventName, {
      detail: data
    }));
  }

  /**
   * Get system state for UI
   */
  getState() {
    return {
      isDodging: this.isDodging,
      isInvulnerable: this.isInvulnerable(),
      canDodge: this.canDodge(),
      cooldownProgress: this.getCooldownProgress(),
      staminaPercent: this.getStaminaPercent(),
      stamina: this.currentStamina,
      maxStamina: this.maxStamina,
      upgrades: { ...this.upgrades }
    };
  }
}

// Singleton instance
let dodgeSystemInstance = null;

export function getDodgeSystem() {
  if (!dodgeSystemInstance) {
    dodgeSystemInstance = new DodgeSystem();
  }
  return dodgeSystemInstance;
}

export default DodgeSystem;
