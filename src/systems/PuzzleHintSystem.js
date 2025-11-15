/**
 * Puzzle Hint System
 * Provides progressive hints for puzzles with visual telegraphing
 * Tracks puzzle attempts and adjusts hint visibility based on difficulty
 */

export const HintLevel = {
  NONE: 0,
  SUBTLE: 1,
  MODERATE: 2,
  OBVIOUS: 3,
  SOLUTION: 4
};

export const HintType = {
  VISUAL: 'visual',          // Visual highlighting
  TEXT: 'text',              // Text-based hint
  AUDIO: 'audio',            // Audio cue (placeholder)
  DIRECTIONAL: 'directional' // Arrow/pointer to objective
};

class PuzzleHintSystem {
  constructor() {
    this.hints = new Map(); // puzzleId -> hint config
    this.activeHints = new Map(); // puzzleId -> current hint level
    this.attemptCounts = new Map(); // puzzleId -> attempt count
    this.hintTimers = new Map(); // puzzleId -> timer info

    // Configuration
    this.config = {
      initialHintDelay: 15000,        // 15 seconds before first hint
      subsequentHintDelay: 10000,     // 10 seconds between hint escalation
      attemptsBeforeHint: 2,          // Failed attempts before hint appears
      maxHintLevel: HintLevel.OBVIOUS, // Don't give away complete solution by default
      allowSolutionHints: false       // Can be enabled in accessibility settings
    };

    this.enabled = true;
    console.log('[PuzzleHintSystem] Initialized');
  }

  /**
   * Register a puzzle with its hint progression
   */
  registerPuzzle(puzzleId, hintConfig) {
    this.hints.set(puzzleId, {
      puzzleId,
      hints: hintConfig.hints || [],
      visualTargets: hintConfig.visualTargets || [],
      allowSolution: hintConfig.allowSolution || false
    });

    this.activeHints.set(puzzleId, HintLevel.NONE);
    this.attemptCounts.set(puzzleId, 0);

    console.log(`[PuzzleHintSystem] Registered puzzle: ${puzzleId}`);
  }

  /**
   * Start hint timer when puzzle becomes active
   */
  startPuzzle(puzzleId) {
    if (!this.hints.has(puzzleId)) {
      console.warn(`[PuzzleHintSystem] Puzzle not registered: ${puzzleId}`);
      return;
    }

    // Clear any existing timer
    this.stopPuzzle(puzzleId);

    // Start timer for first hint
    const timer = setTimeout(() => {
      this.escalateHint(puzzleId);
    }, this.config.initialHintDelay);

    this.hintTimers.set(puzzleId, {
      timer,
      startTime: Date.now(),
      level: HintLevel.NONE
    });

    console.log(`[PuzzleHintSystem] Started puzzle: ${puzzleId}`);
  }

  /**
   * Record a puzzle attempt (success or failure)
   */
  recordAttempt(puzzleId, success = false) {
    if (!this.hints.has(puzzleId)) return;

    if (success) {
      // Puzzle solved - clear hints
      this.stopPuzzle(puzzleId);
      this.activeHints.set(puzzleId, HintLevel.NONE);

      window.dispatchEvent(new CustomEvent('puzzleHintHidden', {
        detail: { puzzleId }
      }));

      console.log(`[PuzzleHintSystem] Puzzle solved: ${puzzleId}`);
      return;
    }

    // Failed attempt - increment counter
    const attempts = this.attemptCounts.get(puzzleId) + 1;
    this.attemptCounts.set(puzzleId, attempts);

    // Escalate hint if threshold reached
    if (attempts >= this.config.attemptsBeforeHint) {
      this.escalateHint(puzzleId);
    }

    console.log(`[PuzzleHintSystem] Attempt recorded for ${puzzleId}: ${attempts} attempts`);
  }

  /**
   * Escalate to next hint level
   */
  escalateHint(puzzleId) {
    if (!this.enabled || !this.hints.has(puzzleId)) return;

    const currentLevel = this.activeHints.get(puzzleId);
    const hintConfig = this.hints.get(puzzleId);

    // Calculate max allowed level
    let maxLevel = this.config.maxHintLevel;
    if (this.config.allowSolutionHints && hintConfig.allowSolution) {
      maxLevel = HintLevel.SOLUTION;
    }

    // Don't escalate past max level
    if (currentLevel >= maxLevel) {
      console.log(`[PuzzleHintSystem] Max hint level reached for ${puzzleId}`);
      return;
    }

    const newLevel = currentLevel + 1;
    this.activeHints.set(puzzleId, newLevel);

    // Get hint for this level
    const hint = this.getHintForLevel(puzzleId, newLevel);

    if (hint) {
      // Emit hint event
      window.dispatchEvent(new CustomEvent('puzzleHintShown', {
        detail: {
          puzzleId,
          level: newLevel,
          hint
        }
      }));

      console.log(`[PuzzleHintSystem] Escalated hint for ${puzzleId} to level ${newLevel}:`, hint);
    }

    // Schedule next escalation
    if (newLevel < maxLevel) {
      const timer = setTimeout(() => {
        this.escalateHint(puzzleId);
      }, this.config.subsequentHintDelay);

      const timerInfo = this.hintTimers.get(puzzleId);
      if (timerInfo) {
        clearTimeout(timerInfo.timer);
        timerInfo.timer = timer;
        timerInfo.level = newLevel;
      }
    }
  }

  /**
   * Get hint data for specific level
   */
  getHintForLevel(puzzleId, level) {
    const config = this.hints.get(puzzleId);
    if (!config) return null;

    const hints = config.hints;
    if (level > hints.length) return null;

    return hints[level - 1]; // Level 1 = index 0
  }

  /**
   * Get current hint for puzzle
   */
  getCurrentHint(puzzleId) {
    const level = this.activeHints.get(puzzleId);
    if (level === HintLevel.NONE) return null;

    return this.getHintForLevel(puzzleId, level);
  }

  /**
   * Get visual targets that should be highlighted
   */
  getVisualTargets(puzzleId) {
    const level = this.activeHints.get(puzzleId);
    if (level === HintLevel.NONE) return [];

    const config = this.hints.get(puzzleId);
    if (!config || !config.visualTargets) return [];

    // Return targets appropriate for current hint level
    return config.visualTargets.filter(target => target.minLevel <= level);
  }

  /**
   * Manually request hint (player pressed hint button)
   */
  requestHint(puzzleId) {
    if (!this.hints.has(puzzleId)) return;

    // Skip to next hint level immediately
    this.escalateHint(puzzleId);

    console.log(`[PuzzleHintSystem] Manual hint requested for ${puzzleId}`);
  }

  /**
   * Stop puzzle and clear hints
   */
  stopPuzzle(puzzleId) {
    const timerInfo = this.hintTimers.get(puzzleId);
    if (timerInfo) {
      clearTimeout(timerInfo.timer);
      this.hintTimers.delete(puzzleId);
    }

    console.log(`[PuzzleHintSystem] Stopped puzzle: ${puzzleId}`);
  }

  /**
   * Reset puzzle hints (for level restart)
   */
  resetPuzzle(puzzleId) {
    this.stopPuzzle(puzzleId);
    this.activeHints.set(puzzleId, HintLevel.NONE);
    this.attemptCounts.set(puzzleId, 0);

    window.dispatchEvent(new CustomEvent('puzzleHintHidden', {
      detail: { puzzleId }
    }));

    console.log(`[PuzzleHintSystem] Reset puzzle: ${puzzleId}`);
  }

  /**
   * Update system configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('[PuzzleHintSystem] Config updated:', this.config);
  }

  /**
   * Enable/disable hint system
   */
  setEnabled(enabled) {
    this.enabled = enabled;

    if (!enabled) {
      // Hide all active hints
      this.activeHints.forEach((level, puzzleId) => {
        if (level > HintLevel.NONE) {
          window.dispatchEvent(new CustomEvent('puzzleHintHidden', {
            detail: { puzzleId }
          }));
        }
      });
    }

    console.log(`[PuzzleHintSystem] ${enabled ? 'Enabled' : 'Disabled'}`);
  }

  /**
   * Get hint statistics for a puzzle
   */
  getPuzzleStats(puzzleId) {
    return {
      attempts: this.attemptCounts.get(puzzleId) || 0,
      currentLevel: this.activeHints.get(puzzleId) || HintLevel.NONE,
      maxLevel: this.config.maxHintLevel,
      timeElapsed: this.hintTimers.has(puzzleId)
        ? Date.now() - this.hintTimers.get(puzzleId).startTime
        : 0
    };
  }

  /**
   * Clean up all resources
   */
  cleanup() {
    // Clear all timers
    this.hintTimers.forEach((timerInfo) => {
      clearTimeout(timerInfo.timer);
    });

    this.hints.clear();
    this.activeHints.clear();
    this.attemptCounts.clear();
    this.hintTimers.clear();

    console.log('[PuzzleHintSystem] Cleaned up');
  }
}

// Singleton instance
let hintSystemInstance = null;

export function initializePuzzleHintSystem() {
  if (hintSystemInstance) {
    console.warn('[PuzzleHintSystem] Already initialized');
    return hintSystemInstance;
  }

  hintSystemInstance = new PuzzleHintSystem();
  return hintSystemInstance;
}

export function getPuzzleHintSystem() {
  if (!hintSystemInstance) {
    console.warn('[PuzzleHintSystem] Not initialized, creating new instance');
    return initializePuzzleHintSystem();
  }
  return hintSystemInstance;
}

export default PuzzleHintSystem;
