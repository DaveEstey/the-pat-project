import { useCallback } from 'react';
import { AudioSystem } from '../utils/audioUtils.js';

export function useAudio() {
  const playSound = useCallback((soundName, volume = 1) => {
    AudioSystem.playSound(soundName, volume);
  }, []);

  const playMusic = useCallback((musicName, loop = true) => {
    AudioSystem.playMusic(musicName, loop);
  }, []);

  const stopSound = useCallback((soundName) => {
    AudioSystem.stopSound(soundName);
  }, []);

  const setVolume = useCallback((volume) => {
    AudioSystem.setMasterVolume(volume);
  }, []);

  const setSFXVolume = useCallback((volume) => {
    AudioSystem.setSFXVolume(volume);
  }, []);

  const setMusicVolume = useCallback((volume) => {
    AudioSystem.setMusicVolume(volume);
  }, []);

  return {
    playSound,
    playMusic,
    stopSound,
    setVolume,
    setSFXVolume,
    setMusicVolume,
    isReady: true, // Always ready since audio is disabled
    isInitialized: true
  };
}