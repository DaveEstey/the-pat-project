import React, { createContext, useContext } from 'react';
import { AudioSystem } from '../utils/audioUtils.js';

const AudioContext = createContext();

export function AudioProvider({ children }) {
  const initializeAudio = async () => {
    return AudioSystem.init();
  };

  const playSound = (category, sound, options = {}) => {
    const { volume = 0.5 } = options;
    const soundName = `${category}_${sound}`;
    AudioSystem.playSound(soundName, volume);
  };

  const playSynth = (synthType, note, duration = '8n', options = {}) => {
    const { volume = 0.3 } = options;
    const synthName = `synth_${synthType}_${note}_${duration}`;
    AudioSystem.playSound(synthName, volume);
  };

  const setMasterVolume = (volume) => {
    AudioSystem.setMasterVolume(volume);
  };

  const stopAllSounds = () => {
    AudioSystem.stopAllSounds();
  };

  return (
    <AudioContext.Provider value={{
      initializeAudio,
      playSound,
      playSynth,
      setMasterVolume,
      stopAllSounds,
      isInitialized: true // Always ready since audio is disabled
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}