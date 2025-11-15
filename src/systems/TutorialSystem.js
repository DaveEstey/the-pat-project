/**
 * Tutorial System
 * Manages interactive tutorials and pop-up tips for new players
 */

export const TutorialSteps = {
  // Basic Controls
  MOVEMENT: 'movement',
  AIMING: 'aiming',
  SHOOTING: 'shooting',
  RELOADING: 'reloading',

  // Weapons
  WEAPON_SWITCH: 'weapon_switch',
  SPECIAL_WEAPONS: 'special_weapons',
  WEAPON_UPGRADES: 'weapon_upgrades',

  // Combat
  ENEMY_TYPES: 'enemy_types',
  WEAK_POINTS: 'weak_points',
  COVER_SYSTEM: 'cover_system',
  DODGE_ROLL: 'dodge_roll',
  COMBOS: 'combos',

  // Puzzles
  PUZZLE_INTRO: 'puzzle_intro',
  PUZZLE_HINTS: 'puzzle_hints',

  // Items
  COLLECTIBLES: 'collectibles',
  POWER_UPS: 'power_ups',

  // Systems
  CURRENCY: 'currency',
  SKILL_TREE: 'skill_tree',
  ACHIEVEMENTS: 'achievements',

  // Advanced
  BRANCHING_PATHS: 'branching_paths',
  HAZARDS: 'hazards',
  DESTRUCTIBLES: 'destructibles'
};

export const TutorialTriggers = {
  MANUAL: 'manual',           // Manually triggered
  LOCATION: 'location',       // Player reaches a location
  EVENT: 'event',             // Specific event occurs
  FIRST_TIME: 'first_time',   // First time doing something
  TIMER: 'timer'              // After a certain time
};

let tutorialSystemInstance = null;

export function initializeTutorialSystem() {
  if (tutorialSystemInstance) {
    return tutorialSystemInstance;
  }
  tutorialSystemInstance = new TutorialSystem();
  return tutorialSystemInstance;
}

export function getTutorialSystem() {
  if (!tutorialSystemInstance) {
    console.warn('[TutorialSystem] Not initialized, creating new instance');
    return initializeTutorialSystem();
  }
  return tutorialSystemInstance;
}

export class TutorialSystem {
  constructor() {
    this.enabled = true;
    this.completedSteps = new Set();
    this.activeStep = null;
    this.tutorialData = this.initializeTutorialData();
    this.tutorialProgress = new Map(); // Track progress for multi-part tutorials
    this.skipAllTutorials = false;

    // Load completed steps from storage
    this.loadFromStorage();

    console.log('[TutorialSystem] Initialized');
  }

  initializeTutorialData() {
    return new Map([
      // Basic Controls
      [TutorialSteps.MOVEMENT, {
        id: TutorialSteps.MOVEMENT,
        title: 'Movement',
        description: 'Your character moves automatically along the rails. Focus on aiming and shooting!',
        icon: '🏃',
        duration: 5000,
        priority: 1,
        canSkip: true,
        trigger: TutorialTriggers.FIRST_TIME
      }],

      [TutorialSteps.AIMING, {
        id: TutorialSteps.AIMING,
        title: 'Aiming',
        description: 'Move your mouse to aim. The crosshair shows where you\'ll shoot.',
        icon: '🎯',
        duration: 4000,
        priority: 2,
        canSkip: true,
        trigger: TutorialTriggers.FIRST_TIME
      }],

      [TutorialSteps.SHOOTING, {
        id: TutorialSteps.SHOOTING,
        title: 'Shooting',
        description: 'Left click to shoot. Watch your ammo count and reload when needed!',
        icon: '🔫',
        duration: 5000,
        priority: 3,
        canSkip: true,
        trigger: TutorialTriggers.FIRST_TIME,
        requirements: { shots: 5 }
      }],

      [TutorialSteps.RELOADING, {
        id: TutorialSteps.RELOADING,
        title: 'Reloading',
        description: 'Press R to reload your weapon manually, or wait for automatic reload.',
        icon: '🔄',
        duration: 4000,
        priority: 4,
        canSkip: true,
        trigger: TutorialTriggers.EVENT
      }],

      // Weapons
      [TutorialSteps.WEAPON_SWITCH, {
        id: TutorialSteps.WEAPON_SWITCH,
        title: 'Weapon Switching',
        description: 'Press 1-5 to switch between weapons. Each weapon has unique properties!',
        icon: '🔀',
        duration: 5000,
        priority: 5,
        canSkip: true,
        trigger: TutorialTriggers.FIRST_TIME
      }],

      [TutorialSteps.SPECIAL_WEAPONS, {
        id: TutorialSteps.SPECIAL_WEAPONS,
        title: 'Special Weapons',
        description: 'Some weapons have special abilities. Right click to use alt-fire modes!',
        icon: '⚡',
        duration: 6000,
        priority: 6,
        canSkip: true,
        trigger: TutorialTriggers.EVENT
      }],

      [TutorialSteps.WEAPON_UPGRADES, {
        id: TutorialSteps.WEAPON_UPGRADES,
        title: 'Weapon Upgrades',
        description: 'Spend currency to upgrade your weapons for more damage and faster fire rate.',
        icon: '⬆️',
        duration: 5000,
        priority: 15,
        canSkip: true,
        trigger: TutorialTriggers.MANUAL
      }],

      // Combat
      [TutorialSteps.ENEMY_TYPES, {
        id: TutorialSteps.ENEMY_TYPES,
        title: 'Enemy Types',
        description: 'Different enemies have unique behaviors. Learn their patterns to survive!',
        icon: '👾',
        duration: 5000,
        priority: 7,
        canSkip: true,
        trigger: TutorialTriggers.FIRST_TIME
      }],

      [TutorialSteps.WEAK_POINTS, {
        id: TutorialSteps.WEAK_POINTS,
        title: 'Weak Points',
        description: 'Aim for enemy weak points (glowing spots) for bonus damage!',
        icon: '🎯',
        duration: 5000,
        priority: 8,
        canSkip: true,
        trigger: TutorialTriggers.EVENT
      }],

      [TutorialSteps.COVER_SYSTEM, {
        id: TutorialSteps.COVER_SYSTEM,
        title: 'Cover System',
        description: 'Use cover to avoid enemy fire. Shoot destructible cover to expose enemies!',
        icon: '🛡️',
        duration: 6000,
        priority: 10,
        canSkip: true,
        trigger: TutorialTriggers.FIRST_TIME
      }],

      [TutorialSteps.DODGE_ROLL, {
        id: TutorialSteps.DODGE_ROLL,
        title: 'Dodge Roll',
        description: 'Press Space to dodge roll. You\'re invincible during the roll!',
        icon: '🤸',
        duration: 5000,
        priority: 9,
        canSkip: true,
        trigger: TutorialTriggers.FIRST_TIME
      }],

      [TutorialSteps.COMBOS, {
        id: TutorialSteps.COMBOS,
        title: 'Combo System',
        description: 'Chain kills quickly to build combos! Higher combos = more score and damage!',
        icon: '🔥',
        duration: 6000,
        priority: 11,
        canSkip: true,
        trigger: TutorialTriggers.EVENT
      }],

      // Puzzles
      [TutorialSteps.PUZZLE_INTRO, {
        id: TutorialSteps.PUZZLE_INTRO,
        title: 'Puzzles',
        description: 'Solve puzzles by shooting switches in the correct order. Watch for visual clues!',
        icon: '🧩',
        duration: 6000,
        priority: 12,
        canSkip: true,
        trigger: TutorialTriggers.FIRST_TIME
      }],

      [TutorialSteps.PUZZLE_HINTS, {
        id: TutorialSteps.PUZZLE_HINTS,
        title: 'Puzzle Hints',
        description: 'Stuck on a puzzle? Wait for hints or press H to request one.',
        icon: '💡',
        duration: 5000,
        priority: 13,
        canSkip: true,
        trigger: TutorialTriggers.TIMER
      }],

      // Items
      [TutorialSteps.COLLECTIBLES, {
        id: TutorialSteps.COLLECTIBLES,
        title: 'Collectibles',
        description: 'Shoot or touch items to collect them. Some unlock new areas!',
        icon: '💎',
        duration: 5000,
        priority: 14,
        canSkip: true,
        trigger: TutorialTriggers.FIRST_TIME
      }],

      [TutorialSteps.POWER_UPS, {
        id: TutorialSteps.POWER_UPS,
        title: 'Power-Ups',
        description: 'Collect power-ups for temporary boosts like double damage or rapid fire!',
        icon: '⚡',
        duration: 5000,
        priority: 16,
        canSkip: true,
        trigger: TutorialTriggers.FIRST_TIME
      }],

      // Systems
      [TutorialSteps.CURRENCY, {
        id: TutorialSteps.CURRENCY,
        title: 'Currency',
        description: 'Earn Credits, Gems, and Scrap by defeating enemies and completing objectives.',
        icon: '💰',
        duration: 5000,
        priority: 17,
        canSkip: true,
        trigger: TutorialTriggers.EVENT
      }],

      [TutorialSteps.SKILL_TREE, {
        id: TutorialSteps.SKILL_TREE,
        title: 'Skill Tree',
        description: 'Spend skill points to unlock permanent upgrades in Combat, Survival, and Utility trees.',
        icon: '🌳',
        duration: 6000,
        priority: 18,
        canSkip: true,
        trigger: TutorialTriggers.MANUAL
      }],

      [TutorialSteps.ACHIEVEMENTS, {
        id: TutorialSteps.ACHIEVEMENTS,
        title: 'Achievements',
        description: 'Complete achievements to earn rewards and show off your skills!',
        icon: '🏆',
        duration: 5000,
        priority: 19,
        canSkip: true,
        trigger: TutorialTriggers.MANUAL
      }],

      // Advanced
      [TutorialSteps.BRANCHING_PATHS, {
        id: TutorialSteps.BRANCHING_PATHS,
        title: 'Branching Paths',
        description: 'Shoot arrows to choose your path. Different routes have unique challenges!',
        icon: '🔀',
        duration: 6000,
        priority: 20,
        canSkip: true,
        trigger: TutorialTriggers.FIRST_TIME
      }],

      [TutorialSteps.HAZARDS, {
        id: TutorialSteps.HAZARDS,
        title: 'Environmental Hazards',
        description: 'Watch out for explosive barrels, fire traps, and other hazards!',
        icon: '⚠️',
        duration: 5000,
        priority: 21,
        canSkip: true,
        trigger: TutorialTriggers.FIRST_TIME
      }],

      [TutorialSteps.DESTRUCTIBLES, {
        id: TutorialSteps.DESTRUCTIBLES,
        title: 'Destructible Objects',
        description: 'Shoot objects to destroy them. Some contain items or reveal secrets!',
        icon: '💥',
        duration: 5000,
        priority: 22,
        canSkip: true,
        trigger: TutorialTriggers.FIRST_TIME
      }]
    ]);
  }

  // Check if a tutorial step has been completed
  isCompleted(stepId) {
    return this.completedSteps.has(stepId);
  }

  // Check if tutorials are enabled
  isEnabled() {
    return this.enabled && !this.skipAllTutorials;
  }

  // Enable/disable all tutorials
  setEnabled(enabled) {
    this.enabled = enabled;
    this.saveToStorage();
  }

  // Skip all tutorials (for experienced players)
  setSkipAll(skip) {
    this.skipAllTutorials = skip;
    this.saveToStorage();
  }

  // Trigger a tutorial step
  showTutorial(stepId, force = false) {
    if (!this.isEnabled() && !force) {
      return false;
    }

    if (this.isCompleted(stepId) && !force) {
      return false;
    }

    const tutorial = this.tutorialData.get(stepId);
    if (!tutorial) {
      console.warn(`[TutorialSystem] Unknown tutorial step: ${stepId}`);
      return false;
    }

    // Don't show if another tutorial is active (unless higher priority)
    if (this.activeStep) {
      const activeTutorial = this.tutorialData.get(this.activeStep);
      if (activeTutorial && activeTutorial.priority < tutorial.priority) {
        return false;
      }
    }

    this.activeStep = stepId;

    // Dispatch event for UI to display
    window.dispatchEvent(new CustomEvent('tutorialShow', {
      detail: {
        stepId,
        title: tutorial.title,
        description: tutorial.description,
        icon: tutorial.icon,
        duration: tutorial.duration,
        canSkip: tutorial.canSkip,
        priority: tutorial.priority
      }
    }));

    console.log(`[TutorialSystem] Showing tutorial: ${tutorial.title}`);

    // Auto-complete after duration if no requirements
    if (!tutorial.requirements) {
      setTimeout(() => {
        if (this.activeStep === stepId) {
          this.completeTutorial(stepId);
        }
      }, tutorial.duration);
    }

    return true;
  }

  // Complete a tutorial step
  completeTutorial(stepId) {
    this.completedSteps.add(stepId);

    if (this.activeStep === stepId) {
      this.activeStep = null;
    }

    window.dispatchEvent(new CustomEvent('tutorialComplete', {
      detail: { stepId }
    }));

    console.log(`[TutorialSystem] Completed tutorial: ${stepId}`);
    this.saveToStorage();
  }

  // Skip current tutorial
  skipCurrentTutorial() {
    if (this.activeStep) {
      const stepId = this.activeStep;
      this.completeTutorial(stepId);

      window.dispatchEvent(new CustomEvent('tutorialSkipped', {
        detail: { stepId }
      }));
    }
  }

  // Update progress for multi-step tutorials
  updateProgress(stepId, progressData) {
    const tutorial = this.tutorialData.get(stepId);
    if (!tutorial || !tutorial.requirements) {
      return;
    }

    // Store progress
    this.tutorialProgress.set(stepId, progressData);

    // Check if requirements are met
    let requirementsMet = true;
    for (const [key, value] of Object.entries(tutorial.requirements)) {
      if (!progressData[key] || progressData[key] < value) {
        requirementsMet = false;
        break;
      }
    }

    // Complete if requirements met
    if (requirementsMet) {
      this.completeTutorial(stepId);
    }
  }

  // Get tutorial progress
  getProgress(stepId) {
    return this.tutorialProgress.get(stepId) || {};
  }

  // Reset all tutorials
  resetAllTutorials() {
    this.completedSteps.clear();
    this.tutorialProgress.clear();
    this.activeStep = null;
    this.saveToStorage();

    window.dispatchEvent(new CustomEvent('tutorialsReset'));
    console.log('[TutorialSystem] All tutorials reset');
  }

  // Reset a specific tutorial
  resetTutorial(stepId) {
    this.completedSteps.delete(stepId);
    this.tutorialProgress.delete(stepId);
    if (this.activeStep === stepId) {
      this.activeStep = null;
    }
    this.saveToStorage();
  }

  // Get all tutorial data
  getAllTutorials() {
    return Array.from(this.tutorialData.values()).map(tutorial => ({
      ...tutorial,
      completed: this.isCompleted(tutorial.id),
      active: this.activeStep === tutorial.id
    }));
  }

  // Get tutorial statistics
  getStatistics() {
    const total = this.tutorialData.size;
    const completed = this.completedSteps.size;
    const percentage = Math.round((completed / total) * 100);

    return {
      total,
      completed,
      remaining: total - completed,
      percentage,
      enabled: this.isEnabled()
    };
  }

  // Save to localStorage
  saveToStorage() {
    try {
      const data = {
        enabled: this.enabled,
        skipAllTutorials: this.skipAllTutorials,
        completedSteps: Array.from(this.completedSteps),
        tutorialProgress: Array.from(this.tutorialProgress.entries())
      };
      localStorage.setItem('tutorialSystem', JSON.stringify(data));
    } catch (error) {
      console.error('[TutorialSystem] Failed to save:', error);
    }
  }

  // Load from localStorage
  loadFromStorage() {
    try {
      const saved = localStorage.getItem('tutorialSystem');
      if (saved) {
        const data = JSON.parse(saved);
        this.enabled = data.enabled ?? true;
        this.skipAllTutorials = data.skipAllTutorials ?? false;
        this.completedSteps = new Set(data.completedSteps || []);
        this.tutorialProgress = new Map(data.tutorialProgress || []);

        console.log(`[TutorialSystem] Loaded ${this.completedSteps.size} completed tutorials`);
      }
    } catch (error) {
      console.error('[TutorialSystem] Failed to load:', error);
    }
  }
}
