// Puzzle configurations for each level
// Each puzzle has a type, timing, and reward

export const PuzzleConfigs = {
  // Level 1 already has puzzle in room 2
  1: {
    room: 1,
    type: 'switch_sequence',
    timeLimit: 45000,
    bonusMultiplier: 1.0
  },

  // Level 4 - Jungle themed puzzles
  4: {
    room: 0,
    type: 'timed_targets',
    timeLimit: 35000,
    bonusMultiplier: 1.2,
    description: 'Shoot all glowing markers before time runs out!'
  },

  // Level 5 - Space station color matching
  5: {
    room: 1,
    type: 'color_match',
    timeLimit: 25000,
    bonusMultiplier: 1.3,
    description: 'Shoot the correct colored panel!'
  },

  // Level 6 - Haunted mansion switch sequence
  6: {
    room: 0,
    type: 'switch_sequence',
    timeLimit: 40000,
    bonusMultiplier: 1.2,
    description: 'Activate the switches in the right order!'
  },

  // Level 7 - Western quick draw
  7: {
    room: 1,
    type: 'timed_targets',
    timeLimit: 30000,
    bonusMultiplier: 1.4,
    description: 'Quick draw! Hit all targets!'
  },

  // Level 8 - Urban rooftop sequence
  8: {
    room: 0,
    type: 'switch_sequence',
    timeLimit: 35000,
    bonusMultiplier: 1.3,
    description: 'Hack the security system!'
  },

  // Level 9 - Temple color puzzle
  9: {
    room: 1,
    type: 'color_match',
    timeLimit: 20000,
    bonusMultiplier: 1.5,
    description: 'Match the ancient symbol color!'
  },

  // Level 10 - AI Core sequence
  10: {
    room: 0,
    type: 'switch_sequence',
    timeLimit: 30000,
    bonusMultiplier: 1.4,
    description: 'Override the AI security protocol!'
  },

  // Level 11 - Cathedral timed challenge
  11: {
    room: 1,
    type: 'timed_targets',
    timeLimit: 25000,
    bonusMultiplier: 1.6,
    description: 'Ring all the bells before the hour!'
  },

  // Level 12 - Final convergence puzzle
  12: {
    room: 0,
    type: 'switch_sequence',
    timeLimit: 40000,
    bonusMultiplier: 2.0,
    description: 'Unlock the final chamber - be precise!'
  }
};

/**
 * Get puzzle config for a specific level
 */
export function getPuzzleForLevel(levelNumber) {
  return PuzzleConfigs[levelNumber] || null;
}

/**
 * Check if level has a puzzle
 */
export function levelHasPuzzle(levelNumber) {
  return PuzzleConfigs.hasOwnProperty(levelNumber);
}

/**
 * Get all puzzle types
 */
export const PuzzleTypes = {
  SWITCH_SEQUENCE: 'switch_sequence',
  TIMED_TARGETS: 'timed_targets',
  COLOR_MATCH: 'color_match'
};

/**
 * Puzzle difficulty scaling
 */
export function getAdjustedTimeLimit(baseTime, difficulty = 'normal') {
  const multipliers = {
    easy: 1.5,
    normal: 1.0,
    hard: 0.75,
    nightmare: 0.5
  };

  return baseTime * (multipliers[difficulty] || 1.0);
}

/**
 * Target-based puzzle configurations
 * These define shootable target sequences for environmental puzzles
 */
export const TargetPuzzleConfigs = {
  // Level 1 - Simple 3-target sequence (Green → Yellow → Red)
  level1_targets: {
    levelNumber: 1,
    type: 'sequence',
    difficulty: 'easy',
    targets: [
      {
        targetId: 'target_1_1',
        position: { x: -3, y: 2, z: 5 },
        color: 0x00ff00, // Green
        size: 0.8,
        requiresSequence: true,
        sequenceNumber: 1
      },
      {
        targetId: 'target_1_2',
        position: { x: 0, y: 2.5, z: 5 },
        color: 0xffff00, // Yellow
        size: 0.8,
        requiresSequence: true,
        sequenceNumber: 2
      },
      {
        targetId: 'target_1_3',
        position: { x: 3, y: 2, z: 5 },
        color: 0xff0000, // Red
        size: 0.8,
        requiresSequence: true,
        sequenceNumber: 3
      }
    ],
    reward: {
      type: 'bonus_points',
      points: 300,
      message: 'Puzzle solved! +300 points'
    }
  },

  // Level 2 - Medium 4-target sequence
  level2_targets: {
    levelNumber: 2,
    type: 'sequence',
    difficulty: 'medium',
    targets: [
      {
        targetId: 'target_2_1',
        position: { x: -4, y: 1.5, z: 6 },
        color: 0x00ff00, // Green
        size: 0.7,
        requiresSequence: true,
        sequenceNumber: 1
      },
      {
        targetId: 'target_2_2',
        position: { x: -1.5, y: 3, z: 6 },
        color: 0x00ffff, // Cyan
        size: 0.7,
        requiresSequence: true,
        sequenceNumber: 2
      },
      {
        targetId: 'target_2_3',
        position: { x: 1.5, y: 3, z: 6 },
        color: 0xffff00, // Yellow
        size: 0.7,
        requiresSequence: true,
        sequenceNumber: 3
      },
      {
        targetId: 'target_2_4',
        position: { x: 4, y: 1.5, z: 6 },
        color: 0xff0000, // Red
        size: 0.7,
        requiresSequence: true,
        sequenceNumber: 4
      }
    ],
    reward: {
      type: 'bonus_points',
      points: 500,
      message: 'Puzzle solved! +500 points'
    }
  },

  // Level 3 - Complex 5-target sequence
  level3_targets: {
    levelNumber: 3,
    type: 'sequence',
    difficulty: 'hard',
    targets: [
      {
        targetId: 'target_3_1',
        position: { x: 0, y: 3, z: 7 },
        color: 0x0000ff, // Blue
        size: 0.6,
        requiresSequence: true,
        sequenceNumber: 1
      },
      {
        targetId: 'target_3_2',
        position: { x: -3, y: 2, z: 7 },
        color: 0x00ff00, // Green
        size: 0.6,
        requiresSequence: true,
        sequenceNumber: 2
      },
      {
        targetId: 'target_3_3',
        position: { x: 3, y: 2, z: 7 },
        color: 0x00ff00, // Green
        size: 0.6,
        requiresSequence: true,
        sequenceNumber: 3
      },
      {
        targetId: 'target_3_4',
        position: { x: -1.5, y: 1, z: 7 },
        color: 0xffff00, // Yellow
        size: 0.6,
        requiresSequence: true,
        sequenceNumber: 4
      },
      {
        targetId: 'target_3_5',
        position: { x: 1.5, y: 1, z: 7 },
        color: 0xff0000, // Red
        size: 0.6,
        requiresSequence: true,
        sequenceNumber: 5
      }
    ],
    reward: {
      type: 'bonus_points',
      points: 800,
      message: 'Puzzle solved! +800 points'
    }
  }
};

/**
 * Get target puzzle configuration for a specific level
 */
export function getTargetPuzzleConfig(levelNumber) {
  const configKey = `level${levelNumber}_targets`;
  return TargetPuzzleConfigs[configKey] || null;
}

/**
 * Check if a level has target puzzles
 */
export function levelHasTargetPuzzle(levelNumber) {
  return TargetPuzzleConfigs.hasOwnProperty(`level${levelNumber}_targets`);
}

export default PuzzleConfigs;
