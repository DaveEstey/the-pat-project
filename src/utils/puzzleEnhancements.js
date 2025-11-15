/**
 * Enhanced puzzle mechanics and utilities
 * Provides improved puzzle interactions, hints, and feedback
 */

/**
 * Puzzle difficulty modifiers
 */
export const PuzzleDifficulty = {
  EASY: {
    hintDelay: 10000,      // Show hint after 10s
    timeLimit: null,        // No time limit
    resetOnFail: false,     // Don't reset on wrong target
    showSequence: true      // Show sequence numbers
  },
  MEDIUM: {
    hintDelay: 20000,      // Show hint after 20s
    timeLimit: 60000,      // 60 second limit
    resetOnFail: true,     // Reset on wrong target
    showSequence: true      // Show sequence numbers
  },
  HARD: {
    hintDelay: 30000,      // Show hint after 30s
    timeLimit: 45000,      // 45 second limit
    resetOnFail: true,     // Reset on wrong target
    showSequence: false    // Hide sequence numbers
  },
  EXPERT: {
    hintDelay: null,       // No hints
    timeLimit: 30000,      // 30 second limit
    resetOnFail: true,     // Reset on wrong target
    showSequence: false    // Hide sequence numbers
  }
};

/**
 * Puzzle hint system
 */
export class PuzzleHintSystem {
  constructor(puzzle, difficulty) {
    this.puzzle = puzzle;
    this.difficulty = difficulty;
    this.hintTimer = null;
    this.hintsShown = 0;
  }

  start() {
    const delay = PuzzleDifficulty[this.difficulty]?.hintDelay;
    if (!delay) return;

    this.hintTimer = setTimeout(() => {
      this.showHint();
    }, delay);
  }

  showHint() {
    this.hintsShown++;
    const nextTarget = this.puzzle.getNextTarget();

    if (nextTarget) {
      // Emit hint event
      window.dispatchEvent(new CustomEvent('puzzleHint', {
        detail: {
          targetId: nextTarget.targetId,
          hintNumber: this.hintsShown,
          message: `Try shooting the ${this.getColorName(nextTarget.color)} target`
        }
      }));
    }
  }

  getColorName(hexColor) {
    const colorMap = {
      0x00ff00: 'green',
      0xffff00: 'yellow',
      0xff0000: 'red',
      0x0000ff: 'blue',
      0x00ffff: 'cyan',
      0xff00ff: 'magenta'
    };
    return colorMap[hexColor] || 'glowing';
  }

  stop() {
    if (this.hintTimer) {
      clearTimeout(this.hintTimer);
      this.hintTimer = null;
    }
  }
}

/**
 * Puzzle timer system
 */
export class PuzzleTimer {
  constructor(timeLimit, onTimeout) {
    this.timeLimit = timeLimit;
    this.onTimeout = onTimeout;
    this.startTime = Date.now();
    this.timer = null;
    this.isPaused = false;
  }

  start() {
    if (!this.timeLimit) return;

    this.timer = setInterval(() => {
      if (this.isPaused) return;

      const elapsed = Date.now() - this.startTime;
      const remaining = this.timeLimit - elapsed;

      if (remaining <= 0) {
        this.stop();
        if (this.onTimeout) {
          this.onTimeout();
        }
      }

      // Emit time update
      window.dispatchEvent(new CustomEvent('puzzleTimeUpdate', {
        detail: {
          remaining: Math.max(0, remaining),
          total: this.timeLimit,
          percentage: (remaining / this.timeLimit) * 100
        }
      }));
    }, 100);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  getRemaining() {
    const elapsed = Date.now() - this.startTime;
    return Math.max(0, this.timeLimit - elapsed);
  }
}

/**
 * Target highlighting effect
 */
export function highlightTarget(targetMesh, duration = 1000) {
  if (!targetMesh || !targetMesh.material) return;

  const originalIntensity = targetMesh.material.emissiveIntensity || 0.5;

  // Pulse effect
  let elapsed = 0;
  const interval = setInterval(() => {
    elapsed += 50;
    const progress = elapsed / duration;
    const pulse = Math.sin(progress * Math.PI * 4) * 0.3;

    if (targetMesh.material) {
      targetMesh.material.emissiveIntensity = originalIntensity + pulse;
    }

    if (elapsed >= duration) {
      clearInterval(interval);
      if (targetMesh.material) {
        targetMesh.material.emissiveIntensity = originalIntensity;
      }
    }
  }, 50);
}

/**
 * Create combo system for puzzle solving
 */
export class PuzzleComboSystem {
  constructor() {
    this.combo = 0;
    this.maxCombo = 0;
    this.comboTimer = null;
    this.comboTimeout = 3000; // 3 seconds to maintain combo
  }

  addHit() {
    this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);

    // Reset combo timer
    if (this.comboTimer) {
      clearTimeout(this.comboTimer);
    }

    this.comboTimer = setTimeout(() => {
      this.resetCombo();
    }, this.comboTimeout);

    // Emit combo event
    window.dispatchEvent(new CustomEvent('puzzleCombo', {
      detail: {
        combo: this.combo,
        maxCombo: this.maxCombo,
        multiplier: this.getMultiplier()
      }
    }));

    return this.combo;
  }

  getMultiplier() {
    if (this.combo >= 5) return 2.0;
    if (this.combo >= 3) return 1.5;
    return 1.0;
  }

  resetCombo() {
    this.combo = 0;
    if (this.comboTimer) {
      clearTimeout(this.comboTimer);
      this.comboTimer = null;
    }
  }

  getCombo() {
    return this.combo;
  }
}

/**
 * Puzzle reward calculator with bonuses
 */
export function calculatePuzzleReward(baseReward, options = {}) {
  const {
    timeBonus = false,
    timeRemaining = 0,
    timeLimit = 0,
    combo = 1,
    hintsUsed = 0,
    difficulty = 'EASY'
  } = options;

  let reward = baseReward;

  // Time bonus
  if (timeBonus && timeLimit > 0) {
    const timeRatio = timeRemaining / timeLimit;
    const timeBonusMultiplier = 1 + (timeRatio * 0.5); // Up to 50% bonus
    reward *= timeBonusMultiplier;
  }

  // Combo multiplier
  const comboMultiplier = combo >= 5 ? 2.0 : combo >= 3 ? 1.5 : 1.0;
  reward *= comboMultiplier;

  // Hint penalty
  const hintPenalty = Math.max(0, 1 - (hintsUsed * 0.1)); // -10% per hint
  reward *= hintPenalty;

  // Difficulty bonus
  const difficultyBonus = {
    EASY: 1.0,
    MEDIUM: 1.25,
    HARD: 1.5,
    EXPERT: 2.0
  };
  reward *= (difficultyBonus[difficulty] || 1.0);

  return Math.floor(reward);
}

/**
 * Enhanced puzzle types
 */
export const EnhancedPuzzleTypes = {
  SEQUENCE: 'sequence',           // Shoot targets in order
  SIMON_SAYS: 'simon_says',      // Watch and repeat pattern
  TIME_TRIAL: 'time_trial',      // Shoot all targets quickly
  COLOR_MATCH: 'color_match',    // Match color patterns
  RHYTHM: 'rhythm',              // Hit targets to rhythm
  MEMORY: 'memory'               // Remember and repeat
};

/**
 * Generate random puzzle pattern
 */
export function generateRandomPattern(targetCount, colors) {
  const pattern = [];
  for (let i = 0; i < targetCount; i++) {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    pattern.push({
      targetId: `target_random_${i}`,
      color: randomColor,
      sequenceNumber: i + 1
    });
  }
  return pattern;
}

/**
 * Validate puzzle completion with scoring
 */
export function validatePuzzleSolution(solution, options = {}) {
  const {
    correctSolution,
    timeSpent,
    mistakesMade,
    hintsUsed
  } = options;

  const isCorrect = JSON.stringify(solution) === JSON.stringify(correctSolution);

  const score = {
    correct: isCorrect,
    accuracy: 1 - (mistakesMade / Math.max(solution.length, 1)),
    speed: Math.max(0, 1 - (timeSpent / 60000)), // Normalized to 60s
    efficiency: 1 - (hintsUsed * 0.15),
    overall: 0
  };

  score.overall = (score.accuracy * 0.4) + (score.speed * 0.3) + (score.efficiency * 0.3);

  return score;
}

export default {
  PuzzleDifficulty,
  PuzzleHintSystem,
  PuzzleTimer,
  highlightTarget,
  PuzzleComboSystem,
  calculatePuzzleReward,
  EnhancedPuzzleTypes,
  generateRandomPattern,
  validatePuzzleSolution
};
