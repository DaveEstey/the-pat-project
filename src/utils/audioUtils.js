// Audio system disabled for development - placeholder implementation
// This logs what sounds WOULD play, making it easy to add real sounds later

export const AudioSystem = {
  init: () => {
    return Promise.resolve();
  },

  playSound: (soundName, volume = 1) => {
    // Audio disabled - do nothing
  },

  playMusic: (musicName, loop = true) => {
    // Audio disabled - do nothing
  },

  stopSound: (soundName) => {
    // Audio disabled - do nothing
  },

  stopAllSounds: () => {
    // Audio disabled - do nothing
  },

  setMasterVolume: (volume) => {
    // Audio disabled - do nothing
  },

  setSFXVolume: (volume) => {
    // Audio disabled - do nothing
  },

  setMusicVolume: (volume) => {
    // Audio disabled - do nothing
  }
};

export const playSound = AudioSystem.playSound;
export const playMusic = AudioSystem.playMusic;
export const stopSound = AudioSystem.stopSound;