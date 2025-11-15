/**
 * Multi-Slot Save System
 * 3 save slots with comprehensive statistics tracking
 */

export const MAX_SAVE_SLOTS = 3;

let saveSystemInstance = null;

export function initializeSaveSystem() {
  if (saveSystemInstance) {
    return saveSystemInstance;
  }
  saveSystemInstance = new MultiSlotSaveSystem();
  return saveSystemInstance;
}

export function getSaveSystem() {
  if (!saveSystemInstance) {
    console.warn('[MultiSlotSaveSystem] Not initialized, creating new instance');
    return initializeSaveSystem();
  }
  return saveSystemInstance;
}

export class MultiSlotSaveSystem {
  constructor() {
    this.currentSlot = null;
    this.autoSaveEnabled = true;
    this.lastAutoSave = Date.now();
  }

  createNewSave(slotNumber, playerName = 'Player') {
    const saveData = {
      version: '1.0.0',
      slotNumber,
      playerName,
      createdAt: Date.now(),
      lastPlayed: Date.now(),
      playtime: 0,
      currentLevel: 1,
      levelsCompleted: [],
      highestLevelReached: 1,
      stats: {
        totalKills: 0,
        totalDeaths: 0,
        totalShots: 0,
        totalHits: 0,
        headshots: 0,
        accuracy: 0,
        maxCombo: 0,
        puzzlesSolved: 0,
        secretsFound: 0,
        totalScore: 0
      },
      weaponUpgrades: {},
      currency: 0,
      achievements: [],
      levelStats: {},
      difficulty: 'normal'
    };

    try {
      localStorage.setItem(`gameSave_slot${slotNumber}`, JSON.stringify(saveData));
      return true;
    } catch (error) {
      console.error('[SaveSystem] Failed:', error);
      return false;
    }
  }

  loadSave(slotNumber) {
    try {
      const saved = localStorage.getItem(`gameSave_slot${slotNumber}`);
      if (!saved) return null;

      const saveData = JSON.parse(saved);
      saveData.lastPlayed = Date.now();
      this.saveTo(slotNumber, saveData);
      this.currentSlot = slotNumber;
      return saveData;
    } catch (error) {
      return null;
    }
  }

  saveTo(slotNumber, gameState) {
    try {
      gameState.lastPlayed = Date.now();
      localStorage.setItem(`gameSave_slot${slotNumber}`, JSON.stringify(gameState));
      return true;
    } catch (error) {
      return false;
    }
  }

  hasSave(slotNumber) {
    try {
      // Check if the specified slot has save data
      const slotKey = `gameSave_slot${slotNumber}`;
      const saved = localStorage.getItem(slotKey);
      return saved !== null;
    } catch (error) {
      return false;
    }
  }

  getAllSaves() {
    const saves = [];
    for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
      try {
        const saved = localStorage.getItem(`gameSave_slot${i}`);
        if (saved) {
          const data = JSON.parse(saved);
          saves.push({
            slotNumber: i,
            exists: true,
            playerName: data.playerName,
            currentLevel: data.currentLevel,
            playtime: data.playtime,
            lastPlayed: data.lastPlayed,
            totalScore: data.stats.totalScore
          });
        } else {
          saves.push({ slotNumber: i, exists: false });
        }
      } catch (error) {
        saves.push({ slotNumber: i, exists: false, error: true });
      }
    }
    return saves;
  }

  deleteSave(slotNumber) {
    try {
      localStorage.removeItem(`gameSave_slot${slotNumber}`);
      if (this.currentSlot === slotNumber) {
        this.currentSlot = null;
      }
      return true;
    } catch (error) {
      return false;
    }
  }
}
