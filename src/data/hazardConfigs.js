/**
 * Hazard Configurations for Levels
 * Defines placement and configuration of environmental hazards per level/room
 */

import { HazardTypes } from '../systems/HazardSystem.js';

/**
 * Get hazard placements for a specific level and room
 * @param {number} levelNumber - Level number (1-12)
 * @param {number} roomIndex - Room index within level
 * @returns {Array} Array of hazard configurations
 */
export function getHazardsForRoom(levelNumber, roomIndex) {
  const key = `level${levelNumber}_room${roomIndex}`;
  return hazardPlacements[key] || [];
}

/**
 * Hazard placement definitions
 * Each hazard has: type, position, and optional config overrides
 */
const hazardPlacements = {
  // Level 1 - Tutorial hazards
  'level1_room0': [
    {
      type: HazardTypes.EXPLOSIVE_BARREL,
      position: { x: -5, y: 1, z: -8 },
      config: { explosionRadius: 8 } // Slightly larger for tutorial
    },
    {
      type: HazardTypes.EXPLOSIVE_BARREL,
      position: { x: 5, y: 1, z: -10 },
      config: { explosionRadius: 8 }
    }
  ],
  'level1_room1': [
    {
      type: HazardTypes.FLOOR_SPIKES,
      position: { x: 0, y: 0, z: -12 },
      config: { warningDuration: 1500 } // Longer warning for tutorial
    },
    {
      type: HazardTypes.EXPLOSIVE_BARREL,
      position: { x: -3, y: 1, z: -15 }
    }
  ],

  // Level 2 - Urban hazards
  'level2_room0': [
    {
      type: HazardTypes.EXPLOSIVE_BARREL,
      position: { x: -4, y: 1, z: -10 }
    },
    {
      type: HazardTypes.EXPLOSIVE_BARREL,
      position: { x: 4, y: 1, z: -10 }
    },
    {
      type: HazardTypes.LASER_GRID,
      position: { x: 0, y: 0, z: -15 },
      config: {
        orientation: 'horizontal',
        activeDuration: 2000,
        inactiveDuration: 3000
      }
    }
  ],
  'level2_room1': [
    {
      type: HazardTypes.FLAME_JET,
      position: { x: -6, y: 0, z: -12 },
      config: { direction: { x: 1, y: 0, z: 0 } }
    },
    {
      type: HazardTypes.FLAME_JET,
      position: { x: 6, y: 0, z: -12 },
      config: { direction: { x: -1, y: 0, z: 0 } }
    },
    {
      type: HazardTypes.EXPLOSIVE_BARREL,
      position: { x: 0, y: 1, z: -18 }
    }
  ],

  // Level 3 - Jungle hazards
  'level3_room0': [
    {
      type: HazardTypes.TOXIC_GAS,
      position: { x: -5, y: 1, z: -10 },
      config: { radius: 5, duration: 15000 }
    },
    {
      type: HazardTypes.FLOOR_SPIKES,
      position: { x: 5, y: 0, z: -12 }
    },
    {
      type: HazardTypes.EXPLOSIVE_BARREL,
      position: { x: 0, y: 1, z: -8 }
    }
  ],
  'level3_room1': [
    {
      type: HazardTypes.FALLING_DEBRIS,
      position: { x: -3, y: 15, z: -10 },
      config: { warningDuration: 2000 }
    },
    {
      type: HazardTypes.FALLING_DEBRIS,
      position: { x: 3, y: 15, z: -14 },
      config: { warningDuration: 2000 }
    },
    {
      type: HazardTypes.TOXIC_GAS,
      position: { x: 0, y: 1, z: -16 },
      config: { radius: 6 }
    }
  ],

  // Level 4 - Space station hazards
  'level4_room0': [
    {
      type: HazardTypes.LASER_GRID,
      position: { x: 0, y: 0, z: -12 },
      config: {
        orientation: 'vertical',
        activeDuration: 2500,
        inactiveDuration: 2500
      }
    },
    {
      type: HazardTypes.ELECTRIC_FLOOR,
      position: { x: -6, y: 0, z: -15 },
      config: { radius: 4 }
    },
    {
      type: HazardTypes.ELECTRIC_FLOOR,
      position: { x: 6, y: 0, z: -15 },
      config: { radius: 4 }
    }
  ],
  'level4_room1': [
    {
      type: HazardTypes.LASER_GRID,
      position: { x: -5, y: 0, z: -10 },
      config: { orientation: 'horizontal' }
    },
    {
      type: HazardTypes.LASER_GRID,
      position: { x: 5, y: 0, z: -14 },
      config: { orientation: 'horizontal' }
    },
    {
      type: HazardTypes.EXPLOSIVE_BARREL,
      position: { x: 0, y: 1, z: -18 }
    }
  ],

  // Level 5 - Haunted house hazards
  'level5_room0': [
    {
      type: HazardTypes.FLOOR_SPIKES,
      position: { x: -4, y: 0, z: -10 }
    },
    {
      type: HazardTypes.FLOOR_SPIKES,
      position: { x: 4, y: 0, z: -10 }
    },
    {
      type: HazardTypes.FALLING_DEBRIS,
      position: { x: 0, y: 12, z: -15 }
    },
    {
      type: HazardTypes.EXPLOSIVE_BARREL,
      position: { x: -6, y: 1, z: -12 }
    }
  ],
  'level5_room1': [
    {
      type: HazardTypes.TOXIC_GAS,
      position: { x: 0, y: 1, z: -14 },
      config: { radius: 7, duration: 20000 }
    },
    {
      type: HazardTypes.FLOOR_SPIKES,
      position: { x: -5, y: 0, z: -8 }
    },
    {
      type: HazardTypes.FLOOR_SPIKES,
      position: { x: 5, y: 0, z: -8 }
    }
  ],

  // Level 6 - Western town hazards
  'level6_room0': [
    {
      type: HazardTypes.EXPLOSIVE_BARREL,
      position: { x: -5, y: 1, z: -10 }
    },
    {
      type: HazardTypes.EXPLOSIVE_BARREL,
      position: { x: 5, y: 1, z: -10 }
    },
    {
      type: HazardTypes.FLAME_JET,
      position: { x: 0, y: 0, z: -15 },
      config: { direction: { x: 0, y: 1, z: 0 } }
    }
  ],
  'level6_room1': [
    {
      type: HazardTypes.FALLING_DEBRIS,
      position: { x: -4, y: 15, z: -12 }
    },
    {
      type: HazardTypes.FALLING_DEBRIS,
      position: { x: 4, y: 15, z: -12 }
    },
    {
      type: HazardTypes.EXPLOSIVE_BARREL,
      position: { x: 0, y: 1, z: -18 }
    }
  ],

  // Level 7-12 - Progressive difficulty
  'level7_room0': [
    {
      type: HazardTypes.ELECTRIC_FLOOR,
      position: { x: -5, y: 0, z: -10 },
      config: { radius: 5 }
    },
    {
      type: HazardTypes.LASER_GRID,
      position: { x: 0, y: 0, z: -14 }
    },
    {
      type: HazardTypes.EXPLOSIVE_BARREL,
      position: { x: 5, y: 1, z: -12 }
    }
  ],
  'level7_room1': [
    {
      type: HazardTypes.FLAME_JET,
      position: { x: -6, y: 0, z: -10 }
    },
    {
      type: HazardTypes.FLAME_JET,
      position: { x: 6, y: 0, z: -10 }
    },
    {
      type: HazardTypes.TOXIC_GAS,
      position: { x: 0, y: 1, z: -16 }
    }
  ],

  'level8_room0': [
    {
      type: HazardTypes.LASER_GRID,
      position: { x: -4, y: 0, z: -10 }
    },
    {
      type: HazardTypes.LASER_GRID,
      position: { x: 4, y: 0, z: -10 }
    },
    {
      type: HazardTypes.FLOOR_SPIKES,
      position: { x: 0, y: 0, z: -15 }
    }
  ],

  'level9_room0': [
    {
      type: HazardTypes.FALLING_DEBRIS,
      position: { x: -5, y: 15, z: -10 }
    },
    {
      type: HazardTypes.FALLING_DEBRIS,
      position: { x: 0, y: 15, z: -12 }
    },
    {
      type: HazardTypes.FALLING_DEBRIS,
      position: { x: 5, y: 15, z: -14 }
    },
    {
      type: HazardTypes.EXPLOSIVE_BARREL,
      position: { x: -3, y: 1, z: -16 }
    },
    {
      type: HazardTypes.EXPLOSIVE_BARREL,
      position: { x: 3, y: 1, z: -16 }
    }
  ],

  'level10_room0': [
    {
      type: HazardTypes.ELECTRIC_FLOOR,
      position: { x: -6, y: 0, z: -10 },
      config: { radius: 6 }
    },
    {
      type: HazardTypes.ELECTRIC_FLOOR,
      position: { x: 6, y: 0, z: -10 },
      config: { radius: 6 }
    },
    {
      type: HazardTypes.LASER_GRID,
      position: { x: 0, y: 0, z: -15 }
    },
    {
      type: HazardTypes.TOXIC_GAS,
      position: { x: 0, y: 1, z: -18 },
      config: { radius: 8 }
    }
  ],

  'level11_room0': [
    {
      type: HazardTypes.FLAME_JET,
      position: { x: -7, y: 0, z: -10 }
    },
    {
      type: HazardTypes.FLAME_JET,
      position: { x: 7, y: 0, z: -10 }
    },
    {
      type: HazardTypes.FLOOR_SPIKES,
      position: { x: -3, y: 0, z: -14 }
    },
    {
      type: HazardTypes.FLOOR_SPIKES,
      position: { x: 3, y: 0, z: -14 }
    },
    {
      type: HazardTypes.EXPLOSIVE_BARREL,
      position: { x: 0, y: 1, z: -18 }
    }
  ],

  'level12_room0': [
    {
      type: HazardTypes.LASER_GRID,
      position: { x: -5, y: 0, z: -10 }
    },
    {
      type: HazardTypes.LASER_GRID,
      position: { x: 5, y: 0, z: -10 }
    },
    {
      type: HazardTypes.ELECTRIC_FLOOR,
      position: { x: -4, y: 0, z: -14 },
      config: { radius: 5 }
    },
    {
      type: HazardTypes.ELECTRIC_FLOOR,
      position: { x: 4, y: 0, z: -14 },
      config: { radius: 5 }
    },
    {
      type: HazardTypes.FALLING_DEBRIS,
      position: { x: 0, y: 15, z: -16 }
    },
    {
      type: HazardTypes.TOXIC_GAS,
      position: { x: 0, y: 1, z: -20 },
      config: { radius: 10, duration: 30000 }
    }
  ],
  'level12_room1': [
    {
      type: HazardTypes.FLAME_JET,
      position: { x: -8, y: 0, z: -12 }
    },
    {
      type: HazardTypes.FLAME_JET,
      position: { x: 8, y: 0, z: -12 }
    },
    {
      type: HazardTypes.FLOOR_SPIKES,
      position: { x: -4, y: 0, z: -16 }
    },
    {
      type: HazardTypes.FLOOR_SPIKES,
      position: { x: 4, y: 0, z: -16 }
    },
    {
      type: HazardTypes.EXPLOSIVE_BARREL,
      position: { x: -6, y: 1, z: -18 }
    },
    {
      type: HazardTypes.EXPLOSIVE_BARREL,
      position: { x: 6, y: 1, z: -18 }
    }
  ]
};

/**
 * Get all unique hazard types used in a level
 * @param {number} levelNumber - Level number
 * @returns {Set} Set of hazard types
 */
export function getHazardTypesForLevel(levelNumber) {
  const types = new Set();

  Object.keys(hazardPlacements).forEach(key => {
    if (key.startsWith(`level${levelNumber}_`)) {
      hazardPlacements[key].forEach(hazard => {
        types.add(hazard.type);
      });
    }
  });

  return types;
}

/**
 * Get total hazard count for a level
 * @param {number} levelNumber - Level number
 * @returns {number} Total hazard count
 */
export function getHazardCountForLevel(levelNumber) {
  let count = 0;

  Object.keys(hazardPlacements).forEach(key => {
    if (key.startsWith(`level${levelNumber}_`)) {
      count += hazardPlacements[key].length;
    }
  });

  return count;
}
