/**
 * Dynamic Lighting System
 * Manages dynamic lights for muzzle flashes, explosions, and other effects
 */

import * as THREE from 'three';

export const LightTypes = {
  MUZZLE_FLASH: 'muzzle_flash',
  EXPLOSION: 'explosion',
  FIRE: 'fire',
  SPARK: 'spark',
  POWER_UP: 'power_up',
  DAMAGE: 'damage',
  HEAL: 'heal'
};

let dynamicLightingSystemInstance = null;

export function initializeDynamicLightingSystem(scene) {
  if (dynamicLightingSystemInstance) {
    return dynamicLightingSystemInstance;
  }
  dynamicLightingSystemInstance = new DynamicLightingSystem(scene);
  return dynamicLightingSystemInstance;
}

export function getDynamicLightingSystem() {
  if (!dynamicLightingSystemInstance) {
    console.warn('[DynamicLightingSystem] Not initialized');
    return null;
  }
  return dynamicLightingSystemInstance;
}

class DynamicLight {
  constructor(light, config) {
    this.light = light;
    this.config = config;
    this.age = 0;
    this.lifetime = config.lifetime || 500;
    this.initialIntensity = light.intensity;
    this.flickerSpeed = config.flickerSpeed || 0;
    this.flickerAmount = config.flickerAmount || 0;
    this.fadeIn = config.fadeIn || 0;
    this.fadeOut = config.fadeOut || true;
  }

  update(deltaTime) {
    this.age += deltaTime;

    const progress = this.age / this.lifetime;

    // Fade in
    if (this.fadeIn > 0 && this.age < this.fadeIn) {
      const fadeProgress = this.age / this.fadeIn;
      this.light.intensity = this.initialIntensity * fadeProgress;
    }
    // Fade out
    else if (this.fadeOut && progress > 0.7) {
      const fadeProgress = (progress - 0.7) / 0.3;
      this.light.intensity = this.initialIntensity * (1 - fadeProgress);
    }
    // Steady with flicker
    else {
      this.light.intensity = this.initialIntensity;

      // Add flicker
      if (this.flickerSpeed > 0) {
        const flicker = Math.sin(this.age * this.flickerSpeed) * this.flickerAmount;
        this.light.intensity += this.initialIntensity * flicker;
      }
    }

    return this.age < this.lifetime;
  }
}

export class DynamicLightingSystem {
  constructor(scene) {
    this.scene = scene;
    this.activeLights = [];
    this.lightPool = [];
    this.maxLights = 20; // Limit for performance
    this.pendingTimeouts = []; // Track setTimeout IDs for cleanup

    // Settings
    this.enabled = true;
    this.intensity = 1.0; // Global intensity multiplier

    this.loadSettings();

    console.log('[DynamicLightingSystem] Initialized');
  }

  createLight(type, position, config = {}) {
    if (!this.enabled) return null;

    // Remove oldest light if at max
    if (this.activeLights.length >= this.maxLights) {
      const oldest = this.activeLights.shift();
      this.scene.remove(oldest.light);
      oldest.light.dispose();
    }

    const lightConfig = this.getLightConfig(type, config);
    const light = this.createThreeLight(lightConfig);

    light.position.copy(position);
    this.scene.add(light);

    const dynamicLight = new DynamicLight(light, lightConfig);
    this.activeLights.push(dynamicLight);

    return dynamicLight;
  }

  getLightConfig(type, overrides) {
    const configs = {
      [LightTypes.MUZZLE_FLASH]: {
        color: 0xffff88,
        intensity: 3.0,
        distance: 5,
        decay: 2,
        lifetime: 100,
        fadeIn: 20,
        fadeOut: true,
        flickerSpeed: 0,
        flickerAmount: 0
      },

      [LightTypes.EXPLOSION]: {
        color: 0xff6600,
        intensity: 5.0,
        distance: 10,
        decay: 2,
        lifetime: 800,
        fadeIn: 50,
        fadeOut: true,
        flickerSpeed: 0.2,
        flickerAmount: 0.3
      },

      [LightTypes.FIRE]: {
        color: 0xff4400,
        intensity: 2.0,
        distance: 6,
        decay: 2,
        lifetime: 2000,
        fadeIn: 100,
        fadeOut: true,
        flickerSpeed: 0.3,
        flickerAmount: 0.5
      },

      [LightTypes.SPARK]: {
        color: 0xffffaa,
        intensity: 1.5,
        distance: 3,
        decay: 2,
        lifetime: 300,
        fadeIn: 0,
        fadeOut: true,
        flickerSpeed: 0.5,
        flickerAmount: 0.8
      },

      [LightTypes.POWER_UP]: {
        color: 0xffff00,
        intensity: 2.5,
        distance: 8,
        decay: 1.5,
        lifetime: 1000,
        fadeIn: 200,
        fadeOut: true,
        flickerSpeed: 0.1,
        flickerAmount: 0.2
      },

      [LightTypes.DAMAGE]: {
        color: 0xff0000,
        intensity: 2.0,
        distance: 5,
        decay: 2,
        lifetime: 400,
        fadeIn: 50,
        fadeOut: true,
        flickerSpeed: 0,
        flickerAmount: 0
      },

      [LightTypes.HEAL]: {
        color: 0x00ff88,
        intensity: 2.5,
        distance: 7,
        decay: 1.5,
        lifetime: 800,
        fadeIn: 150,
        fadeOut: true,
        flickerSpeed: 0.15,
        flickerAmount: 0.3
      }
    };

    const baseConfig = configs[type] || configs[LightTypes.EXPLOSION];
    return { ...baseConfig, ...overrides };
  }

  createThreeLight(config) {
    const light = new THREE.PointLight(
      config.color,
      config.intensity * this.intensity,
      config.distance,
      config.decay
    );

    // Enable shadows for larger lights
    if (config.intensity > 3.0 && config.distance > 8) {
      light.castShadow = true;
      light.shadow.mapSize.width = 512;
      light.shadow.mapSize.height = 512;
      light.shadow.camera.near = 0.5;
      light.shadow.camera.far = config.distance;
    }

    return light;
  }

  // Create muzzle flash light
  createMuzzleFlash(position) {
    return this.createLight(LightTypes.MUZZLE_FLASH, position);
  }

  // Create explosion light
  createExplosion(position, size = 1.0) {
    return this.createLight(LightTypes.EXPLOSION, position, {
      intensity: 5.0 * size,
      distance: 10 * size,
      lifetime: 800 * Math.sqrt(size)
    });
  }

  // Create fire light
  createFire(position, duration = 2000) {
    return this.createLight(LightTypes.FIRE, position, {
      lifetime: duration
    });
  }

  // Create spark light
  createSpark(position) {
    return this.createLight(LightTypes.SPARK, position);
  }

  // Create power-up collection light
  createPowerUpLight(position, color = 0xffff00) {
    return this.createLight(LightTypes.POWER_UP, position, {
      color: color
    });
  }

  // Create damage flash light
  createDamageFlash(position) {
    return this.createLight(LightTypes.DAMAGE, position);
  }

  // Create heal light
  createHealLight(position) {
    return this.createLight(LightTypes.HEAL, position);
  }

  // Create multiple lights for more complex effects
  createExplosionWithSparks(position, size = 1.0) {
    // Main explosion light
    this.createExplosion(position, size);

    // Add spark lights around the explosion
    const sparkCount = Math.floor(4 * size);
    for (let i = 0; i < sparkCount; i++) {
      const angle = (i / sparkCount) * Math.PI * 2;
      const radius = 0.5 * size;
      const sparkPos = new THREE.Vector3(
        position.x + Math.cos(angle) * radius,
        position.y + (Math.random() - 0.5) * radius,
        position.z + Math.sin(angle) * radius
      );

      // Delay spark creation slightly
      const timeoutId = setTimeout(() => {
        this.createSpark(sparkPos);
        // Remove from pending after execution
        const index = this.pendingTimeouts.indexOf(timeoutId);
        if (index > -1) {
          this.pendingTimeouts.splice(index, 1);
        }
      }, Math.random() * 200);
      this.pendingTimeouts.push(timeoutId);
    }
  }

  // Create flickering fire with multiple lights
  createFireCluster(position, count = 3, duration = 2000) {
    for (let i = 0; i < count; i++) {
      const offset = new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        Math.random() * 0.3,
        (Math.random() - 0.5) * 0.5
      );
      const firePos = position.clone().add(offset);

      // Stagger the fire lights
      const timeoutId = setTimeout(() => {
        this.createFire(firePos, duration);
        // Remove from pending after execution
        const index = this.pendingTimeouts.indexOf(timeoutId);
        if (index > -1) {
          this.pendingTimeouts.splice(index, 1);
        }
      }, i * 100);
      this.pendingTimeouts.push(timeoutId);
    }
  }

  // Update all lights
  update(deltaTime) {
    for (let i = this.activeLights.length - 1; i >= 0; i--) {
      const dynamicLight = this.activeLights[i];
      const stillActive = dynamicLight.update(deltaTime);

      if (!stillActive) {
        this.scene.remove(dynamicLight.light);
        dynamicLight.light.dispose();
        this.activeLights.splice(i, 1);
      }
    }
  }

  // Enable/disable dynamic lighting
  setEnabled(enabled) {
    this.enabled = enabled;
    this.saveSettings();

    // Remove all active lights if disabled
    if (!enabled) {
      this.cleanup();
    }
  }

  // Set global intensity multiplier
  setIntensity(intensity) {
    this.intensity = Math.max(0, Math.min(2, intensity));
    this.saveSettings();

    // Update existing lights
    this.activeLights.forEach(dl => {
      dl.light.intensity = dl.initialIntensity * this.intensity;
    });
  }

  // Get current settings
  getSettings() {
    return {
      enabled: this.enabled,
      intensity: this.intensity,
      activeLightCount: this.activeLights.length,
      maxLights: this.maxLights
    };
  }

  // Save settings to localStorage
  saveSettings() {
    try {
      const settings = {
        enabled: this.enabled,
        intensity: this.intensity
      };
      localStorage.setItem('dynamicLightingSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('[DynamicLightingSystem] Failed to save settings:', error);
    }
  }

  // Load settings from localStorage
  loadSettings() {
    try {
      const saved = localStorage.getItem('dynamicLightingSettings');
      if (saved) {
        const settings = JSON.parse(saved);
        this.enabled = settings.enabled ?? true;
        this.intensity = settings.intensity ?? 1.0;
        console.log('[DynamicLightingSystem] Settings loaded');
      }
    } catch (error) {
      console.error('[DynamicLightingSystem] Failed to load settings:', error);
    }
  }

  // Cleanup all lights
  cleanup() {
    this.activeLights.forEach(dl => {
      this.scene.remove(dl.light);
      dl.light.dispose();
    });
    this.activeLights = [];
  }

  // Dispose system
  dispose() {
    // Clear all pending timeouts
    this.pendingTimeouts.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    this.pendingTimeouts = [];

    this.cleanup();
    dynamicLightingSystemInstance = null;
  }
}

export default DynamicLightingSystem;
