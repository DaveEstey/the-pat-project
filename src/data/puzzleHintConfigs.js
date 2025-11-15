/**
 * Puzzle Hint Configurations
 * Defines progressive hints for each puzzle type
 */

import { HintLevel } from '../systems/PuzzleHintSystem.js';

/**
 * Sequence Puzzle Hints
 */
export const sequencePuzzleHints = {
  hints: [
    {
      level: HintLevel.SUBTLE,
      text: "Pay attention to the pattern. The order matters.",
      type: 'text'
    },
    {
      level: HintLevel.MODERATE,
      text: "Shoot the switches in the correct sequence. Watch for visual cues.",
      type: 'text'
    },
    {
      level: HintLevel.OBVIOUS,
      text: "The switches light up to show the sequence. Memorize it and repeat.",
      type: 'text',
      direction: 'Watch the demonstration'
    },
    {
      level: HintLevel.SOLUTION,
      text: "The exact sequence will be shown with numbers. Follow them precisely.",
      type: 'text'
    }
  ],
  visualTargets: [
    {
      minLevel: HintLevel.MODERATE,
      targetType: 'switch',
      highlightColor: 0xffff00,
      pulseSpeed: 1.0
    },
    {
      minLevel: HintLevel.OBVIOUS,
      targetType: 'switch',
      highlightColor: 0xff8800,
      pulseSpeed: 2.0,
      showNumbers: true
    }
  ],
  allowSolution: true
};

/**
 * Simon Says Puzzle Hints
 */
export const simonSaysPuzzleHints = {
  hints: [
    {
      level: HintLevel.SUBTLE,
      text: "Watch the pattern carefully before shooting.",
      type: 'text'
    },
    {
      level: HintLevel.MODERATE,
      text: "The targets flash in a specific order. Repeat the exact sequence.",
      type: 'text'
    },
    {
      level: HintLevel.OBVIOUS,
      text: "Memorize the flashing order: watch closely, then shoot in the same order.",
      type: 'text',
      direction: 'Watch for flashes'
    },
    {
      level: HintLevel.SOLUTION,
      text: "Each target is numbered. Shoot them in numerical order after the demonstration.",
      type: 'text'
    }
  ],
  visualTargets: [
    {
      minLevel: HintLevel.MODERATE,
      targetType: 'simon_target',
      highlightColor: 0x00ffff,
      pulseSpeed: 1.5
    }
  ],
  allowSolution: true
};

/**
 * Memory Match Puzzle Hints
 */
export const memoryMatchPuzzleHints = {
  hints: [
    {
      level: HintLevel.SUBTLE,
      text: "Find matching pairs. Remember what you've seen.",
      type: 'text'
    },
    {
      level: HintLevel.MODERATE,
      text: "Shoot two targets to reveal them. Match symbols to clear pairs.",
      type: 'text'
    },
    {
      level: HintLevel.OBVIOUS,
      text: "Focus on one symbol at a time. Keep track of positions as you reveal.",
      type: 'text',
      direction: 'Match the symbols'
    },
    {
      level: HintLevel.SOLUTION,
      text: "Matching pairs are highlighted. Shoot pairs with the same color glow.",
      type: 'text'
    }
  ],
  visualTargets: [
    {
      minLevel: HintLevel.OBVIOUS,
      targetType: 'memory_card',
      highlightColor: 0xff00ff,
      pulseSpeed: 0.8
    }
  ],
  allowSolution: true
};

/**
 * Rhythm Puzzle Hints
 */
export const rhythmPuzzleHints = {
  hints: [
    {
      level: HintLevel.SUBTLE,
      text: "Timing is everything. Shoot on the beat.",
      type: 'text'
    },
    {
      level: HintLevel.MODERATE,
      text: "Watch for the beat markers. Shoot when they align with the target zone.",
      type: 'text'
    },
    {
      level: HintLevel.OBVIOUS,
      text: "Shoot when the moving indicator enters the green zone. Follow the rhythm.",
      type: 'text',
      direction: 'Shoot in the green zone'
    },
    {
      level: HintLevel.SOLUTION,
      text: "The beat zones flash brighter when it's time to shoot. Fire on each flash.",
      type: 'text'
    }
  ],
  visualTargets: [
    {
      minLevel: HintLevel.MODERATE,
      targetType: 'rhythm_zone',
      highlightColor: 0x00ff00,
      pulseSpeed: 2.0
    }
  ],
  allowSolution: true
};

/**
 * Door Mechanism Puzzle Hints
 */
export const doorMechanismHints = {
  hints: [
    {
      level: HintLevel.SUBTLE,
      text: "This door needs something to open it.",
      type: 'text'
    },
    {
      level: HintLevel.MODERATE,
      text: "Look for a way to unlock the mechanism. You may need a specific item.",
      type: 'text'
    },
    {
      level: HintLevel.OBVIOUS,
      text: "Check your inventory. Use the correct key item or tool on the door.",
      type: 'text',
      direction: 'Check inventory (Tab)'
    },
    {
      level: HintLevel.SOLUTION,
      text: "The door lock glows when you have the right item equipped. Use it now.",
      type: 'text'
    }
  ],
  visualTargets: [
    {
      minLevel: HintLevel.OBVIOUS,
      targetType: 'door_lock',
      highlightColor: 0xffd700,
      pulseSpeed: 1.2
    }
  ],
  allowSolution: true
};

/**
 * Terrain Modifier Puzzle Hints
 */
export const terrainModifierHints = {
  hints: [
    {
      level: HintLevel.SUBTLE,
      text: "The environment can be altered. Look for interactive objects.",
      type: 'text'
    },
    {
      level: HintLevel.MODERATE,
      text: "Shoot or use items on glowing objects to change the terrain.",
      type: 'text'
    },
    {
      level: HintLevel.OBVIOUS,
      text: "Create a path by modifying highlighted terrain elements. Experiment with different weapons.",
      type: 'text',
      direction: 'Shoot glowing objects'
    },
    {
      level: HintLevel.SOLUTION,
      text: "The correct targets pulse brighter. Shoot all pulsing objects to complete the path.",
      type: 'text'
    }
  ],
  visualTargets: [
    {
      minLevel: HintLevel.MODERATE,
      targetType: 'terrain_target',
      highlightColor: 0x00ff88,
      pulseSpeed: 1.0
    }
  ],
  allowSolution: true
};

/**
 * Path Selector Puzzle Hints
 */
export const pathSelectorHints = {
  hints: [
    {
      level: HintLevel.SUBTLE,
      text: "Choose your path wisely. Each route has different challenges.",
      type: 'text'
    },
    {
      level: HintLevel.MODERATE,
      text: "Shoot the arrow pointing to your chosen path before time runs out.",
      type: 'text'
    },
    {
      level: HintLevel.OBVIOUS,
      text: "Look at the difficulty and rewards for each path. Shoot your choice quickly!",
      type: 'text',
      direction: 'Shoot an arrow'
    },
    {
      level: HintLevel.SOLUTION,
      text: "The recommended path for your skill level is highlighted. Shoot it now!",
      type: 'text'
    }
  ],
  visualTargets: [
    {
      minLevel: HintLevel.OBVIOUS,
      targetType: 'path_arrow',
      highlightColor: 0xffffff,
      pulseSpeed: 3.0
    }
  ],
  allowSolution: false // Path choice is player preference
};

/**
 * Boss Weakpoint Puzzle Hints
 */
export const bossWeakpointHints = {
  hints: [
    {
      level: HintLevel.SUBTLE,
      text: "The boss has a weakness. Look for vulnerable spots.",
      type: 'text'
    },
    {
      level: HintLevel.MODERATE,
      text: "Target glowing areas for maximum damage. Avoid armored sections.",
      type: 'text'
    },
    {
      level: HintLevel.OBVIOUS,
      text: "Aim for the brightly glowing weakpoints. They take significantly more damage.",
      type: 'text',
      direction: 'Shoot glowing spots'
    },
    {
      level: HintLevel.SOLUTION,
      text: "The critical weakpoint is marked with a pulsing red glow. Focus all fire there!",
      type: 'text'
    }
  ],
  visualTargets: [
    {
      minLevel: HintLevel.MODERATE,
      targetType: 'boss_weakpoint',
      highlightColor: 0xff0000,
      pulseSpeed: 2.5
    }
  ],
  allowSolution: true
};

/**
 * Get hint config by puzzle type
 */
export function getHintConfigForPuzzleType(puzzleType) {
  const configs = {
    'sequence': sequencePuzzleHints,
    'simon_says': simonSaysPuzzleHints,
    'memory_match': memoryMatchPuzzleHints,
    'rhythm': rhythmPuzzleHints,
    'door_mechanism': doorMechanismHints,
    'terrain_modifier': terrainModifierHints,
    'path_selector': pathSelectorHints,
    'boss_weakpoint': bossWeakpointHints
  };

  return configs[puzzleType] || sequencePuzzleHints; // Default to sequence hints
}

/**
 * Create hint config for specific puzzle instance
 */
export function createPuzzleHintConfig(puzzleType, customHints = null) {
  const baseConfig = getHintConfigForPuzzleType(puzzleType);

  if (customHints) {
    return {
      ...baseConfig,
      hints: customHints
    };
  }

  return baseConfig;
}

export default {
  sequencePuzzleHints,
  simonSaysPuzzleHints,
  memoryMatchPuzzleHints,
  rhythmPuzzleHints,
  doorMechanismHints,
  terrainModifierHints,
  pathSelectorHints,
  bossWeakpointHints,
  getHintConfigForPuzzleType,
  createPuzzleHintConfig
};
