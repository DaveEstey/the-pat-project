import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

const defaultSettings = {
  graphics: {
    quality: 'medium', // low, medium, high
    shadows: true,
    particles: true,
    antiAliasing: true,
    fxaa: true
  },
  audio: {
    masterVolume: 0.7,
    sfxVolume: 0.8,
    musicVolume: 0.6,
    ambientVolume: 0.4
  },
  controls: {
    mouseSensitivity: 1.0,
    invertY: false,
    keyBindings: {
      shoot: 'Mouse0',
      weapon1: 'Digit1',
      weapon2: 'Digit2',
      weapon3: 'Digit3',
      weapon4: 'Digit4',
      weapon5: 'Digit5',
      weapon6: 'Digit6',
      weapon7: 'Digit7',
      weapon8: 'Digit8',
      weapon9: 'Digit9',
      pause: 'Escape',
      inventory: 'Tab'
    }
  },
  gameplay: {
    difficulty: 'normal',
    autoAim: false,
    showCrosshair: true,
    showHitMarkers: true,
    showDamageNumbers: true,
    cameraShake: true
  },
  accessibility: {
    colorBlind: false,
    highContrast: false,
    reducedMotion: false,
    fontSize: 'normal' // small, normal, large
  }
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    // Load settings from localStorage on initialization
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
      try {
        return { ...defaultSettings, ...JSON.parse(savedSettings) };
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('gameSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (category, newSettings) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], ...newSettings }
    }));
  };

  const resetSettings = (category) => {
    if (category) {
      setSettings(prev => ({
        ...prev,
        [category]: defaultSettings[category]
      }));
    } else {
      setSettings(defaultSettings);
    }
  };

  const getSetting = (category, key) => {
    return settings[category]?.[key];
  };

  const exportSettings = () => {
    return JSON.stringify(settings, null, 2);
  };

  const importSettings = (settingsString) => {
    try {
      const importedSettings = JSON.parse(settingsString);
      setSettings({ ...defaultSettings, ...importedSettings });
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  };

  const value = {
    settings,
    updateSettings,
    resetSettings,
    getSetting,
    exportSettings,
    importSettings,
    defaultSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}