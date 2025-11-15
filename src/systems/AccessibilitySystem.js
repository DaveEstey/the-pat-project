/**
 * Accessibility System
 * Colorblind modes, aim assist, and accessibility features
 */

let accessibilitySystemInstance = null;

export const ColorblindMode = {
  NONE: 'none',
  PROTANOPIA: 'protanopia',       // Red-blind
  DEUTERANOPIA: 'deuteranopia',   // Green-blind
  TRITANOPIA: 'tritanopia'        // Blue-blind
};

export function initializeAccessibilitySystem() {
  if (accessibilitySystemInstance) {
    return accessibilitySystemInstance;
  }
  accessibilitySystemInstance = new AccessibilitySystem();
  return accessibilitySystemInstance;
}

export function getAccessibilitySystem() {
  return accessibilitySystemInstance;
}

export class AccessibilitySystem {
  constructor() {
    this.settings = {
      // Visual
      colorblindMode: ColorblindMode.NONE,
      highContrast: false,
      reducedMotion: false,
      textSize: 1.0, // Multiplier
      subtitlesEnabled: true,
      screenFlashReduction: false,

      // Aim Assist
      aimAssistEnabled: false,
      aimAssistStrength: 0.5,
      aimAssistRange: 10,
      stickyTargeting: false,

      // Gameplay
      autoAim: false,
      slowerEnemies: false,
      damageReduction: 1.0,
      longerPuzzleTime: false,

      // Controls
      holdToAim: false,
      toggleCrouch: true,
      vibrationEnabled: true,

      // Audio
      audioDescriptions: false,
      visualSoundCues: true
    };

    this.loadSettings();
  }

  /**
   * Apply colorblind filter
   */
  applyColorblindFilter(color) {
    if (this.settings.colorblindMode === ColorblindMode.NONE) {
      return color;
    }

    // Extract RGB from hex
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;

    let newR, newG, newB;

    switch (this.settings.colorblindMode) {
      case ColorblindMode.PROTANOPIA:
        // Simulate red-blindness
        newR = 0.567 * r + 0.433 * g;
        newG = 0.558 * r + 0.442 * g;
        newB = 0.242 * g + 0.758 * b;
        break;

      case ColorblindMode.DEUTERANOPIA:
        // Simulate green-blindness
        newR = 0.625 * r + 0.375 * g;
        newG = 0.7 * r + 0.3 * g;
        newB = 0.3 * g + 0.7 * b;
        break;

      case ColorblindMode.TRITANOPIA:
        // Simulate blue-blindness
        newR = 0.95 * r + 0.05 * g;
        newG = 0.433 * g + 0.567 * b;
        newB = 0.475 * g + 0.525 * b;
        break;

      default:
        return color;
    }

    // Reconstruct hex color
    newR = Math.round(Math.max(0, Math.min(255, newR)));
    newG = Math.round(Math.max(0, Math.min(255, newG)));
    newB = Math.round(Math.max(0, Math.min(255, newB)));

    return (newR << 16) | (newG << 8) | newB;
  }

  /**
   * Apply aim assist to target
   */
  applyAimAssist(playerPosition, aimDirection, enemies) {
    if (!this.settings.aimAssistEnabled) {
      return { direction: aimDirection, target: null };
    }

    let closestEnemy = null;
    let closestDistance = Infinity;
    let closestAngle = Infinity;

    enemies.forEach(enemy => {
      if (!enemy.mesh || enemy.health <= 0) return;

      const enemyPos = enemy.mesh.position;
      const toEnemy = {
        x: enemyPos.x - playerPosition.x,
        y: enemyPos.y - playerPosition.y,
        z: enemyPos.z - playerPosition.z
      };

      const distance = Math.sqrt(toEnemy.x ** 2 + toEnemy.y ** 2 + toEnemy.z ** 2);

      if (distance > this.settings.aimAssistRange) return;

      // Calculate angle between aim direction and enemy direction
      const dotProduct =
        aimDirection.x * toEnemy.x +
        aimDirection.y * toEnemy.y +
        aimDirection.z * toEnemy.z;

      const aimMag = Math.sqrt(aimDirection.x ** 2 + aimDirection.y ** 2 + aimDirection.z ** 2);
      const enemyMag = distance;

      const angle = Math.acos(dotProduct / (aimMag * enemyMag));

      // Consider both distance and angle
      const score = angle + (distance / this.settings.aimAssistRange);

      if (score < closestAngle) {
        closestAngle = score;
        closestDistance = distance;
        closestEnemy = enemy;
      }
    });

    if (closestEnemy && closestAngle < 0.3) { // Within ~17 degrees
      const enemyPos = closestEnemy.mesh.position;
      const toEnemy = {
        x: enemyPos.x - playerPosition.x,
        y: enemyPos.y - playerPosition.y,
        z: enemyPos.z - playerPosition.z
      };

      // Normalize
      const mag = Math.sqrt(toEnemy.x ** 2 + toEnemy.y ** 2 + toEnemy.z ** 2);
      toEnemy.x /= mag;
      toEnemy.y /= mag;
      toEnemy.z /= mag;

      // Blend with original aim direction
      const strength = this.settings.aimAssistStrength;
      const assistedDirection = {
        x: aimDirection.x * (1 - strength) + toEnemy.x * strength,
        y: aimDirection.y * (1 - strength) + toEnemy.y * strength,
        z: aimDirection.z * (1 - strength) + toEnemy.z * strength
      };

      return { direction: assistedDirection, target: closestEnemy };
    }

    return { direction: aimDirection, target: null };
  }

  /**
   * Get damage multiplier based on difficulty settings
   */
  getDamageMultiplier() {
    return this.settings.damageReduction;
  }

  /**
   * Get puzzle time extension
   */
  getPuzzleTimeMultiplier() {
    return this.settings.longerPuzzleTime ? 1.5 : 1.0;
  }

  /**
   * Get enemy speed multiplier
   */
  getEnemySpeedMultiplier() {
    return this.settings.slowerEnemies ? 0.75 : 1.0;
  }

  /**
   * Get high contrast colors
   */
  getHighContrastColor(baseColor, type) {
    if (!this.settings.highContrast) {
      return baseColor;
    }

    // High contrast replacements
    const highContrastColors = {
      enemy: 0xff0000,      // Bright red
      player: 0x00ff00,     // Bright green
      neutral: 0xffff00,    // Bright yellow
      ui: 0xffffff,         // White
      background: 0x000000  // Black
    };

    return highContrastColors[type] || baseColor;
  }

  /**
   * Check if motion should be reduced
   */
  shouldReduceMotion() {
    return this.settings.reducedMotion;
  }

  /**
   * Get text size multiplier
   */
  getTextSizeMultiplier() {
    return this.settings.textSize;
  }

  /**
   * Show visual sound cue
   */
  showSoundCue(soundType, direction) {
    if (!this.settings.visualSoundCues) return;

    window.dispatchEvent(new CustomEvent('visualSoundCue', {
      detail: { soundType, direction }
    }));
  }

  /**
   * Update setting
   */
  setSetting(key, value) {
    if (this.settings[key] === undefined) {
      console.warn('[AccessibilitySystem] Unknown setting:', key);
      return false;
    }

    this.settings[key] = value;
    this.saveSettings();

    // Emit event for UI updates
    window.dispatchEvent(new CustomEvent('accessibilitySettingChanged', {
      detail: { key, value }
    }));

    return true;
  }

  /**
   * Get all settings
   */
  getSettings() {
    return { ...this.settings };
  }

  /**
   * Reset to defaults
   */
  resetToDefaults() {
    this.settings = {
      colorblindMode: ColorblindMode.NONE,
      highContrast: false,
      reducedMotion: false,
      textSize: 1.0,
      subtitlesEnabled: true,
      screenFlashReduction: false,
      aimAssistEnabled: false,
      aimAssistStrength: 0.5,
      aimAssistRange: 10,
      stickyTargeting: false,
      autoAim: false,
      slowerEnemies: false,
      damageReduction: 1.0,
      longerPuzzleTime: false,
      holdToAim: false,
      toggleCrouch: true,
      vibrationEnabled: true,
      audioDescriptions: false,
      visualSoundCues: true
    };

    this.saveSettings();
  }

  /**
   * Save settings to localStorage
   */
  saveSettings() {
    try {
      localStorage.setItem('accessibilitySettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('[AccessibilitySystem] Failed to save settings:', error);
    }
  }

  /**
   * Load settings from localStorage
   */
  loadSettings() {
    try {
      const saved = localStorage.getItem('accessibilitySettings');
      if (saved) {
        const loaded = JSON.parse(saved);
        this.settings = { ...this.settings, ...loaded };
      }
    } catch (error) {
      console.error('[AccessibilitySystem] Failed to load settings:', error);
    }
  }

  /**
   * Apply screen flash reduction
   */
  shouldReduceFlash() {
    return this.settings.screenFlashReduction;
  }

  /**
   * Get auto-aim state
   */
  isAutoAimEnabled() {
    return this.settings.autoAim;
  }
}
