/**
 * Sound Effects System
 * Provides hooks for audio integration with placeholder support
 * Ready for open-source sound effects integration
 */

export class SoundEffectsSystem {
  constructor() {
    this.sounds = new Map();
    this.enabled = true;
    this.volume = 1.0;
    this.initialized = false;

    // Sound effect definitions (ready for audio file URLs)
    this.soundDefinitions = {
      // Weapon sounds
      'weapon_pistol_fire': { url: null, volume: 0.6, pitch: 1.0 },
      'weapon_shotgun_fire': { url: null, volume: 0.8, pitch: 0.9 },
      'weapon_rapidfire_fire': { url: null, volume: 0.5, pitch: 1.1 },
      'weapon_grappling_fire': { url: null, volume: 0.7, pitch: 1.0 },
      'weapon_reload': { url: null, volume: 0.5, pitch: 1.0 },
      'weapon_empty': { url: null, volume: 0.4, pitch: 1.0 },
      'weapon_switch': { url: null, volume: 0.3, pitch: 1.0 },

      // Impact sounds
      'impact_flesh': { url: null, volume: 0.6, pitch: 1.0 },
      'impact_headshot': { url: null, volume: 0.7, pitch: 1.2 },
      'impact_armor': { url: null, volume: 0.6, pitch: 0.8 },
      'impact_metal': { url: null, volume: 0.7, pitch: 1.0 },

      // Enemy sounds
      'enemy_death': { url: null, volume: 0.7, pitch: 1.0 },
      'enemy_hit': { url: null, volume: 0.5, pitch: 1.0 },
      'enemy_shoot': { url: null, volume: 0.6, pitch: 1.0 },
      'boss_intro': { url: null, volume: 0.8, pitch: 0.9 },
      'boss_death': { url: null, volume: 1.0, pitch: 0.8 },

      // Player sounds
      'player_damage': { url: null, volume: 0.7, pitch: 1.0 },
      'player_death': { url: null, volume: 0.9, pitch: 0.8 },
      'player_heal': { url: null, volume: 0.6, pitch: 1.1 },

      // UI sounds
      'ui_menu_select': { url: null, volume: 0.4, pitch: 1.0 },
      'ui_menu_back': { url: null, volume: 0.4, pitch: 0.9 },
      'ui_button_click': { url: null, volume: 0.3, pitch: 1.0 },
      'ui_notification': { url: null, volume: 0.5, pitch: 1.0 },

      // Puzzle sounds
      'puzzle_switch_activate': { url: null, volume: 0.5, pitch: 1.0 },
      'puzzle_correct': { url: null, volume: 0.6, pitch: 1.2 },
      'puzzle_wrong': { url: null, volume: 0.6, pitch: 0.7 },
      'puzzle_complete': { url: null, volume: 0.8, pitch: 1.0 },

      // Combo sounds
      'combo_hit': { url: null, volume: 0.4, pitch: 1.0 },
      'combo_milestone': { url: null, volume: 0.7, pitch: 1.1 },
      'combo_break': { url: null, volume: 0.5, pitch: 0.8 },

      // Pickups
      'pickup_ammo': { url: null, volume: 0.5, pitch: 1.0 },
      'pickup_health': { url: null, volume: 0.6, pitch: 1.1 },
      'pickup_weapon': { url: null, volume: 0.7, pitch: 1.0 },
      'pickup_coin': { url: null, volume: 0.4, pitch: 1.2 },

      // Explosions
      'explosion_small': { url: null, volume: 0.8, pitch: 1.0 },
      'explosion_large': { url: null, volume: 1.0, pitch: 0.8 },

      // Ambient
      'ambient_alarm': { url: null, volume: 0.3, pitch: 1.0, loop: true },
      'ambient_wind': { url: null, volume: 0.2, pitch: 1.0, loop: true }
    };
  }

  /**
   * Initialize audio system
   */
  initialize() {
    if (this.initialized) return;

    // Check Web Audio API support
    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.initialized = true;
        console.log('[SoundEffects] Audio system initialized');
      } catch (error) {
        console.warn('[SoundEffects] Failed to initialize audio:', error);
      }
    }
  }

  /**
   * Load sound from URL
   * @param {string} soundId - Sound identifier
   * @param {string} url - Audio file URL
   */
  async loadSound(soundId, url) {
    if (!this.initialized) {
      console.warn('[SoundEffects] System not initialized');
      return false;
    }

    const definition = this.soundDefinitions[soundId];
    if (!definition) {
      console.warn(`[SoundEffects] Unknown sound: ${soundId}`);
      return false;
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      this.sounds.set(soundId, {
        buffer: audioBuffer,
        definition: definition
      });

      console.log(`[SoundEffects] Loaded: ${soundId}`);
      return true;
    } catch (error) {
      console.error(`[SoundEffects] Failed to load ${soundId}:`, error);
      return false;
    }
  }

  /**
   * Play sound effect
   * @param {string} soundId - Sound to play
   * @param {object} options - Playback options (volume, pitch, pan)
   */
  play(soundId, options = {}) {
    if (!this.enabled) return null;

    // Placeholder behavior when no audio loaded
    if (!this.initialized || !this.sounds.has(soundId)) {
      console.log(`[SoundEffects] 🔊 ${soundId}`);

      // Dispatch event for debugging/testing
      window.dispatchEvent(new CustomEvent('soundEffect', {
        detail: { soundId, options }
      }));

      return null;
    }

    const sound = this.sounds.get(soundId);
    const definition = sound.definition;

    try {
      const source = this.audioContext.createBufferSource();
      source.buffer = sound.buffer;

      // Volume control
      const gainNode = this.audioContext.createGain();
      const volume = (options.volume ?? definition.volume) * this.volume;
      gainNode.gain.value = volume;

      // Pitch/speed control
      const playbackRate = options.pitch ?? definition.pitch;
      source.playbackRate.value = playbackRate;

      // Panning (3D positioning)
      let panNode;
      if (options.pan !== undefined) {
        panNode = this.audioContext.createStereoPanner();
        panNode.pan.value = options.pan; // -1 (left) to 1 (right)
        source.connect(panNode);
        panNode.connect(gainNode);
      } else {
        source.connect(gainNode);
      }

      gainNode.connect(this.audioContext.destination);

      // Loop if specified
      source.loop = options.loop ?? definition.loop ?? false;

      source.start(0);

      return {
        stop: () => source.stop(),
        source: source,
        gain: gainNode
      };
    } catch (error) {
      console.error(`[SoundEffects] Playback error for ${soundId}:`, error);
      return null;
    }
  }

  /**
   * Play weapon fire sound based on type
   */
  playWeaponFire(weaponType) {
    const soundMap = {
      'pistol': 'weapon_pistol_fire',
      'shotgun': 'weapon_shotgun_fire',
      'rapidfire': 'weapon_rapidfire_fire',
      'grappling': 'weapon_grappling_fire'
    };

    const soundId = soundMap[weaponType] || 'weapon_pistol_fire';
    return this.play(soundId);
  }

  /**
   * Play impact sound based on hit type
   */
  playImpact(isHeadshot = false, isArmor = false) {
    let soundId = 'impact_flesh';
    if (isHeadshot) soundId = 'impact_headshot';
    else if (isArmor) soundId = 'impact_armor';

    return this.play(soundId);
  }

  /**
   * Set master volume
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Enable/disable sound effects
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Stop all sounds
   */
  stopAll() {
    // Implementation would stop all active sources
    console.log('[SoundEffects] Stopping all sounds');
  }

  /**
   * Get sound effect URLs for batch loading
   * Returns object with soundId -> URL mappings
   */
  getSoundURLs() {
    const urls = {};
    for (const [soundId, definition] of Object.entries(this.soundDefinitions)) {
      if (definition.url) {
        urls[soundId] = definition.url;
      }
    }
    return urls;
  }

  /**
   * Load sounds from URL mapping
   * Example: { 'weapon_pistol_fire': '/sounds/pistol.mp3' }
   */
  async loadSoundsFromURLs(urlMap) {
    const promises = [];

    for (const [soundId, url] of Object.entries(urlMap)) {
      if (this.soundDefinitions[soundId]) {
        promises.push(this.loadSound(soundId, url));
      }
    }

    const results = await Promise.allSettled(promises);
    const loaded = results.filter(r => r.status === 'fulfilled' && r.value).length;

    console.log(`[SoundEffects] Loaded ${loaded}/${promises.length} sounds`);
    return loaded;
  }
}

// Singleton instance
let soundEffectsInstance = null;

export function getSoundEffects() {
  if (!soundEffectsInstance) {
    soundEffectsInstance = new SoundEffectsSystem();
    soundEffectsInstance.initialize();

    // Make globally available
    window.soundEffects = soundEffectsInstance;
  }
  return soundEffectsInstance;
}

export function resetSoundEffects() {
  if (soundEffectsInstance) {
    soundEffectsInstance.stopAll();
    soundEffectsInstance = null;
    window.soundEffects = null;
  }
}

// Default export
export default SoundEffectsSystem;
