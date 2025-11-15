/**
 * Path Configurations for Levels
 * Defines branching path choices for each level
 */

import { PathTypes } from '../systems/PathSystem.js';

/**
 * Get path choices for a specific level
 * @param {number} levelNumber - Level number (1-12)
 * @returns {Array} Array of path choice configurations
 */
export function getPathChoicesForLevel(levelNumber) {
  return pathChoicesByLevel[levelNumber] || [];
}

/**
 * Path choice definitions
 * Each path choice triggers between rooms and affects subsequent content
 */
const pathChoicesByLevel = {
  // Level 1 - No branching (tutorial)
  1: [],

  // Level 2 - Simple binary choice
  2: [
    {
      position: { x: 0, y: 0, z: -20 }, // Trigger point
      timeLimit: 8000,
      autoSelect: PathTypes.CENTER,
      paths: [
        {
          type: PathTypes.LEFT,
          label: 'Stealth Route',
          description: 'Fewer enemies, less ammo',
          difficulty: 'easy',
          rewards: { enemyCount: -2, ammoBonus: -20, secretChance: 0.3 }
        },
        {
          type: PathTypes.RIGHT,
          label: 'Combat Route',
          description: 'More enemies, better rewards',
          difficulty: 'hard',
          rewards: { enemyCount: +3, scoreBonus: 100, ammoBonus: +30 }
        }
      ]
    }
  ],

  // Level 3 - Three-way choice
  3: [
    {
      position: { x: 0, y: 0, z: -18 },
      timeLimit: 10000,
      autoSelect: PathTypes.CENTER,
      paths: [
        {
          type: PathTypes.LEFT,
          label: 'Lower Path',
          description: 'Ground level, more cover',
          difficulty: 'medium',
          rewards: { destructibles: +2, coverBonus: true }
        },
        {
          type: PathTypes.CENTER,
          label: 'Main Path',
          description: 'Balanced encounter',
          difficulty: 'medium',
          rewards: { balanced: true }
        },
        {
          type: PathTypes.RIGHT,
          label: 'Upper Path',
          description: 'Elevated, open space',
          difficulty: 'medium',
          rewards: { enemyCount: -1, hazards: +1 }
        }
      ]
    }
  ],

  // Continue with other levels...
  4: [],
  5: [],
  6: [],
  7: [],
  8: [],
  9: [],
  10: [],
  11: [],
  12: []
};

/**
 * Get total path choices in a level
 */
export function getPathChoiceCount(levelNumber) {
  const choices = pathChoicesByLevel[levelNumber];
  return choices ? choices.length : 0;
}

/**
 * Check if level has branching paths
 */
export function hasPathChoices(levelNumber) {
  return getPathChoiceCount(levelNumber) > 0;
}
