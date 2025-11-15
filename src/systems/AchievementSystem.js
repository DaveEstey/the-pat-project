/**
 * Achievement System
 * Tracks player progress and unlocks achievements
 */

export const AchievementCategory = {
  COMBAT: 'combat',
  PUZZLE: 'puzzle',
  SECRET: 'secret',
  PROGRESSION: 'progression',
  MASTERY: 'mastery'
};

let achievementSystemInstance = null;

export function initializeAchievementSystem() {
  if (achievementSystemInstance) {
    return achievementSystemInstance;
  }
  achievementSystemInstance = new AchievementSystem();
  return achievementSystemInstance;
}

export function getAchievementSystem() {
  return achievementSystemInstance;
}

export class AchievementSystem {
  constructor() {
    this.achievements = this.initializeAchievements();
    this.unlockedAchievements = new Set();
    this.progress = new Map(); // Track progress towards achievements
    this.stats = this.initializeStats();

    this.loadProgress();
  }

  initializeStats() {
    return {
      totalKills: 0,
      headshots: 0,
      weakpointHits: 0,
      combosReached: 0,
      maxCombo: 0,
      puzzlesSolved: 0,
      secretsFound: 0,
      levelsCompleted: 0,
      bossesDefeated: 0,
      destructiblesDestroyed: 0,
      powerUpsCollected: 0,
      dodgesPerformed: 0,
      damageTaken: 0,
      perfectLevels: 0,
      totalScore: 0
    };
  }

  initializeAchievements() {
    return {
      // Combat Achievements
      first_blood: {
        id: 'first_blood',
        name: 'First Blood',
        description: 'Defeat your first enemy',
        category: AchievementCategory.COMBAT,
        requirement: { stat: 'totalKills', value: 1 },
        icon: '🩸',
        points: 10
      },
      sharpshooter: {
        id: 'sharpshooter',
        name: 'Sharpshooter',
        description: 'Land 100 headshots',
        category: AchievementCategory.COMBAT,
        requirement: { stat: 'headshots', value: 100 },
        icon: '🎯',
        points: 50
      },
      combo_master: {
        id: 'combo_master',
        name: 'Combo Master',
        description: 'Reach a 25x combo',
        category: AchievementCategory.COMBAT,
        requirement: { stat: 'maxCombo', value: 25 },
        icon: '🔥',
        points: 75
      },
      untouchable: {
        id: 'untouchable',
        name: 'Untouchable',
        description: 'Complete a level without taking damage',
        category: AchievementCategory.COMBAT,
        requirement: { stat: 'perfectLevels', value: 1 },
        icon: '💫',
        points: 100
      },
      slayer: {
        id: 'slayer',
        name: 'Slayer',
        description: 'Defeat 500 enemies',
        category: AchievementCategory.COMBAT,
        requirement: { stat: 'totalKills', value: 500 },
        icon: '⚔️',
        points: 100
      },
      legendary_slayer: {
        id: 'legendary_slayer',
        name: 'Legendary Slayer',
        description: 'Defeat 2000 enemies',
        category: AchievementCategory.COMBAT,
        requirement: { stat: 'totalKills', value: 2000 },
        icon: '👑',
        points: 200
      },

      // Puzzle Achievements
      puzzle_novice: {
        id: 'puzzle_novice',
        name: 'Puzzle Novice',
        description: 'Solve your first puzzle',
        category: AchievementCategory.PUZZLE,
        requirement: { stat: 'puzzlesSolved', value: 1 },
        icon: '🧩',
        points: 10
      },
      puzzle_master: {
        id: 'puzzle_master',
        name: 'Puzzle Master',
        description: 'Solve 20 puzzles',
        category: AchievementCategory.PUZZLE,
        requirement: { stat: 'puzzlesSolved', value: 20 },
        icon: '🎓',
        points: 75
      },
      big_brain: {
        id: 'big_brain',
        name: 'Big Brain',
        description: 'Solve all puzzles perfectly',
        category: AchievementCategory.PUZZLE,
        requirement: { stat: 'perfectPuzzles', value: 12 },
        icon: '🧠',
        points: 150
      },

      // Secret Achievements
      treasure_hunter: {
        id: 'treasure_hunter',
        name: 'Treasure Hunter',
        description: 'Find 5 secrets',
        category: AchievementCategory.SECRET,
        requirement: { stat: 'secretsFound', value: 5 },
        icon: '🗝️',
        points: 50
      },
      master_explorer: {
        id: 'master_explorer',
        name: 'Master Explorer',
        description: 'Find all secrets',
        category: AchievementCategory.SECRET,
        requirement: { stat: 'secretsFound', value: 25 },
        icon: '🏆',
        points: 200
      },

      // Progression Achievements
      getting_started: {
        id: 'getting_started',
        name: 'Getting Started',
        description: 'Complete Level 1',
        category: AchievementCategory.PROGRESSION,
        requirement: { stat: 'levelsCompleted', value: 1 },
        icon: '🚀',
        points: 10
      },
      halfway_there: {
        id: 'halfway_there',
        name: 'Halfway There',
        description: 'Complete Level 6',
        category: AchievementCategory.PROGRESSION,
        requirement: { stat: 'levelsCompleted', value: 6 },
        icon: '🎯',
        points: 50
      },
      campaign_complete: {
        id: 'campaign_complete',
        name: 'Campaign Complete',
        description: 'Complete all 12 levels',
        category: AchievementCategory.PROGRESSION,
        requirement: { stat: 'levelsCompleted', value: 12 },
        icon: '🏅',
        points: 150
      },
      boss_slayer: {
        id: 'boss_slayer',
        name: 'Boss Slayer',
        description: 'Defeat 5 bosses',
        category: AchievementCategory.PROGRESSION,
        requirement: { stat: 'bossesDefeated', value: 5 },
        icon: '💀',
        points: 100
      },

      // Mastery Achievements
      demolition_expert: {
        id: 'demolition_expert',
        name: 'Demolition Expert',
        description: 'Destroy 100 destructible objects',
        category: AchievementCategory.MASTERY,
        requirement: { stat: 'destructiblesDestroyed', value: 100 },
        icon: '💥',
        points: 50
      },
      power_collector: {
        id: 'power_collector',
        name: 'Power Collector',
        description: 'Collect 50 power-ups',
        category: AchievementCategory.MASTERY,
        requirement: { stat: 'powerUpsCollected', value: 50 },
        icon: '⚡',
        points: 50
      },
      dodge_master: {
        id: 'dodge_master',
        name: 'Dodge Master',
        description: 'Perform 100 successful dodges',
        category: AchievementCategory.MASTERY,
        requirement: { stat: 'dodgesPerformed', value: 100 },
        icon: '🌀',
        points: 75
      },
      high_score: {
        id: 'high_score',
        name: 'High Score',
        description: 'Reach 100,000 total score',
        category: AchievementCategory.MASTERY,
        requirement: { stat: 'totalScore', value: 100000 },
        icon: '📊',
        points: 100
      },
      legendary_score: {
        id: 'legendary_score',
        name: 'Legendary Score',
        description: 'Reach 500,000 total score',
        category: AchievementCategory.MASTERY,
        requirement: { stat: 'totalScore', value: 500000 },
        icon: '🌟',
        points: 250
      }
    };
  }

  /**
   * Update a stat and check for achievements
   */
  updateStat(statName, value) {
    if (this.stats[statName] === undefined) {
      console.warn('[AchievementSystem] Unknown stat:', statName);
      return;
    }

    this.stats[statName] += value;
    this.checkAchievements();
    this.saveProgress();
  }

  /**
   * Set a stat to a specific value
   */
  setStat(statName, value) {
    if (this.stats[statName] === undefined) {
      console.warn('[AchievementSystem] Unknown stat:', statName);
      return;
    }

    this.stats[statName] = value;
    this.checkAchievements();
    this.saveProgress();
  }

  /**
   * Check all achievements for unlock conditions
   */
  checkAchievements() {
    Object.values(this.achievements).forEach(achievement => {
      if (this.unlockedAchievements.has(achievement.id)) {
        return; // Already unlocked
      }

      const { stat, value } = achievement.requirement;
      if (this.stats[stat] >= value) {
        this.unlockAchievement(achievement.id);
      }
    });
  }

  /**
   * Unlock an achievement
   */
  unlockAchievement(achievementId) {
    if (this.unlockedAchievements.has(achievementId)) {
      return false;
    }

    const achievement = this.achievements[achievementId];
    if (!achievement) {
      console.error('[AchievementSystem] Unknown achievement:', achievementId);
      return false;
    }

    this.unlockedAchievements.add(achievementId);

    // Emit unlock event
    window.dispatchEvent(new CustomEvent('achievementUnlocked', {
      detail: { achievement }
    }));

    console.log(`[AchievementSystem] Unlocked: ${achievement.name}`);
    this.saveProgress();
    return true;
  }

  /**
   * Get all achievements
   */
  getAllAchievements() {
    return Object.values(this.achievements).map(achievement => ({
      ...achievement,
      unlocked: this.unlockedAchievements.has(achievement.id),
      progress: this.getAchievementProgress(achievement.id)
    }));
  }

  /**
   * Get achievement progress
   */
  getAchievementProgress(achievementId) {
    const achievement = this.achievements[achievementId];
    if (!achievement) return 0;

    const { stat, value } = achievement.requirement;
    const current = this.stats[stat] || 0;
    return Math.min((current / value) * 100, 100);
  }

  /**
   * Get achievements by category
   */
  getAchievementsByCategory(category) {
    return this.getAllAchievements().filter(a => a.category === category);
  }

  /**
   * Get total achievement points
   */
  getTotalPoints() {
    let total = 0;
    this.unlockedAchievements.forEach(id => {
      const achievement = this.achievements[id];
      if (achievement) {
        total += achievement.points;
      }
    });
    return total;
  }

  /**
   * Get completion percentage
   */
  getCompletionPercentage() {
    const total = Object.keys(this.achievements).length;
    const unlocked = this.unlockedAchievements.size;
    return (unlocked / total) * 100;
  }

  /**
   * Save progress to localStorage
   */
  saveProgress() {
    const saveData = {
      unlockedAchievements: Array.from(this.unlockedAchievements),
      stats: this.stats
    };

    try {
      localStorage.setItem('gameAchievements', JSON.stringify(saveData));
    } catch (error) {
      console.error('[AchievementSystem] Failed to save:', error);
    }
  }

  /**
   * Load progress from localStorage
   */
  loadProgress() {
    try {
      const saved = localStorage.getItem('gameAchievements');
      if (saved) {
        const data = JSON.parse(saved);
        this.unlockedAchievements = new Set(data.unlockedAchievements || []);
        this.stats = { ...this.stats, ...data.stats };
      }
    } catch (error) {
      console.error('[AchievementSystem] Failed to load:', error);
    }
  }

  /**
   * Reset all progress
   */
  reset() {
    this.unlockedAchievements.clear();
    this.stats = this.initializeStats();
    this.saveProgress();
  }
}
