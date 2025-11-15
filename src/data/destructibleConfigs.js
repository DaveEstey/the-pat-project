/**
 * Destructible Configurations for Levels
 * Defines placement and configuration of destructible objects per level/room
 */

import { DestructibleTypes } from '../systems/DestructibleSystem.js';

/**
 * Get destructible placements for a specific level and room
 * @param {number} levelNumber - Level number (1-12)
 * @param {number} roomIndex - Room index within level
 * @returns {Array} Array of destructible configurations
 */
export function getDestructiblesForRoom(levelNumber, roomIndex) {
  const key = `level${levelNumber}_room${roomIndex}`;
  return destructiblePlacements[key] || [];
}

/**
 * Destructible placement definitions
 * Each destructible has: type, position, and optional config overrides
 */
const destructiblePlacements = {
  // Level 1 - Tutorial (basic crates and boxes)
  'level1_room0': [
    {
      type: DestructibleTypes.WOODEN_CRATE,
      position: { x: -3, y: 0, z: -8 }
    },
    {
      type: DestructibleTypes.WOODEN_CRATE,
      position: { x: 3, y: 0, z: -8 }
    },
    {
      type: DestructibleTypes.METAL_BOX,
      position: { x: 0, y: 0, z: -12 }
    }
  ],
  'level1_room1': [
    {
      type: DestructibleTypes.WOODEN_CRATE,
      position: { x: -4, y: 0, z: -10 }
    },
    {
      type: DestructibleTypes.WOODEN_CRATE,
      position: { x: 4, y: 0, z: -10 }
    },
    {
      type: DestructibleTypes.SANDBAG_WALL,
      position: { x: 0, y: 0, z: -15 }
    }
  ],

  // Level 2 - Urban (diverse urban objects)
  'level2_room0': [
    {
      type: DestructibleTypes.METAL_BOX,
      position: { x: -5, y: 0, z: -10 }
    },
    {
      type: DestructibleTypes.OIL_DRUM,
      position: { x: -2, y: 0, z: -12 }
    },
    {
      type: DestructibleTypes.CONCRETE_BARRIER,
      position: { x: 2, y: 0, z: -14 }
    },
    {
      type: DestructibleTypes.VEHICLE_WRECK,
      position: { x: 6, y: 0, z: -10 }
    }
  ],
  'level2_room1': [
    {
      type: DestructibleTypes.GLASS_PANEL,
      position: { x: -4, y: 0, z: -12 }
    },
    {
      type: DestructibleTypes.FURNITURE,
      position: { x: -1, y: 0, z: -14 }
    },
    {
      type: DestructibleTypes.METAL_BOX,
      position: { x: 3, y: 0, z: -16 }
    }
  ],

  // Level 3 - Jungle (natural/makeshift cover)
  'level3_room0': [
    {
      type: DestructibleTypes.WOODEN_CRATE,
      position: { x: -5, y: 0, z: -9 }
    },
    {
      type: DestructibleTypes.WOODEN_CRATE,
      position: { x: -3, y: 0, z: -9 }
    },
    {
      type: DestructibleTypes.OIL_DRUM,
      position: { x: 5, y: 0, z: -11 }
    }
  ],
  'level3_room1': [
    {
      type: DestructibleTypes.SANDBAG_WALL,
      position: { x: -6, y: 0, z: -10 }
    },
    {
      type: DestructibleTypes.METAL_BOX,
      position: { x: 0, y: 0, z: -13 }
    },
    {
      type: DestructibleTypes.WOODEN_CRATE,
      position: { x: 6, y: 0, z: -10 }
    }
  ],

  // Level 4 - Space Station (tech/futuristic objects)
  'level4_room0': [
    {
      type: DestructibleTypes.METAL_BOX,
      position: { x: -4, y: 0, z: -12 }
    },
    {
      type: DestructibleTypes.METAL_BOX,
      position: { x: 4, y: 0, z: -12 }
    },
    {
      type: DestructibleTypes.GLASS_PANEL,
      position: { x: 0, y: 0, z: -15 }
    }
  ],
  'level4_room1': [
    {
      type: DestructibleTypes.CONCRETE_BARRIER,
      position: { x: -5, y: 0, z: -11 }
    },
    {
      type: DestructibleTypes.METAL_BOX,
      position: { x: 0, y: 0, z: -14 }
    },
    {
      type: DestructibleTypes.CONCRETE_BARRIER,
      position: { x: 5, y: 0, z: -11 }
    }
  ],

  // Level 5 - Haunted House (old furniture and debris)
  'level5_room0': [
    {
      type: DestructibleTypes.FURNITURE,
      position: { x: -6, y: 0, z: -10 }
    },
    {
      type: DestructibleTypes.FURNITURE,
      position: { x: -3, y: 0, z: -12 }
    },
    {
      type: DestructibleTypes.WOODEN_CRATE,
      position: { x: 3, y: 0, z: -12 }
    },
    {
      type: DestructibleTypes.FURNITURE,
      position: { x: 6, y: 0, z: -10 }
    }
  ],
  'level5_room1': [
    {
      type: DestructibleTypes.FURNITURE,
      position: { x: -4, y: 0, z: -13 }
    },
    {
      type: DestructibleTypes.GLASS_PANEL,
      position: { x: 0, y: 0, z: -15 }
    },
    {
      type: DestructibleTypes.FURNITURE,
      position: { x: 4, y: 0, z: -13 }
    }
  ],

  // Level 6 - Western Town (barrels, crates, and wagons)
  'level6_room0': [
    {
      type: DestructibleTypes.WOODEN_CRATE,
      position: { x: -6, y: 0, z: -10 }
    },
    {
      type: DestructibleTypes.OIL_DRUM,
      position: { x: -3, y: 0, z: -12 }
    },
    {
      type: DestructibleTypes.WOODEN_CRATE,
      position: { x: 0, y: 0, z: -14 }
    },
    {
      type: DestructibleTypes.OIL_DRUM,
      position: { x: 3, y: 0, z: -12 }
    },
    {
      type: DestructibleTypes.WOODEN_CRATE,
      position: { x: 6, y: 0, z: -10 }
    }
  ],
  'level6_room1': [
    {
      type: DestructibleTypes.SANDBAG_WALL,
      position: { x: -5, y: 0, z: -12 }
    },
    {
      type: DestructibleTypes.VEHICLE_WRECK,
      position: { x: 0, y: 0, z: -15 }
    },
    {
      type: DestructibleTypes.SANDBAG_WALL,
      position: { x: 5, y: 0, z: -12 }
    }
  ],

  // Level 7-12 - Progressive difficulty with more cover options
  'level7_room0': [
    {
      type: DestructibleTypes.CONCRETE_BARRIER,
      position: { x: -6, y: 0, z: -10 }
    },
    {
      type: DestructibleTypes.METAL_BOX,
      position: { x: -2, y: 0, z: -13 }
    },
    {
      type: DestructibleTypes.METAL_BOX,
      position: { x: 2, y: 0, z: -13 }
    },
    {
      type: DestructibleTypes.CONCRETE_BARRIER,
      position: { x: 6, y: 0, z: -10 }
    }
  ],
  'level7_room1': [
    {
      type: DestructibleTypes.VEHICLE_WRECK,
      position: { x: -4, y: 0, z: -12 }
    },
    {
      type: DestructibleTypes.SANDBAG_WALL,
      position: { x: 0, y: 0, z: -15 }
    },
    {
      type: DestructibleTypes.VEHICLE_WRECK,
      position: { x: 4, y: 0, z: -12 }
    }
  ],

  'level8_room0': [
    {
      type: DestructibleTypes.METAL_BOX,
      position: { x: -5, y: 0, z: -10 }
    },
    {
      type: DestructibleTypes.CONCRETE_BARRIER,
      position: { x: -2, y: 0, z: -13 }
    },
    {
      type: DestructibleTypes.OIL_DRUM,
      position: { x: 0, y: 0, z: -15 }
    },
    {
      type: DestructibleTypes.CONCRETE_BARRIER,
      position: { x: 2, y: 0, z: -13 }
    },
    {
      type: DestructibleTypes.METAL_BOX,
      position: { x: 5, y: 0, z: -10 }
    }
  ],

  'level9_room0': [
    {
      type: DestructibleTypes.VEHICLE_WRECK,
      position: { x: -6, y: 0, z: -11 }
    },
    {
      type: DestructibleTypes.CONCRETE_BARRIER,
      position: { x: -3, y: 0, z: -13 }
    },
    {
      type: DestructibleTypes.SANDBAG_WALL,
      position: { x: 0, y: 0, z: -15 }
    },
    {
      type: DestructibleTypes.CONCRETE_BARRIER,
      position: { x: 3, y: 0, z: -13 }
    },
    {
      type: DestructibleTypes.VEHICLE_WRECK,
      position: { x: 6, y: 0, z: -11 }
    }
  ],

  'level10_room0': [
    {
      type: DestructibleTypes.CONCRETE_BARRIER,
      position: { x: -7, y: 0, z: -10 }
    },
    {
      type: DestructibleTypes.METAL_BOX,
      position: { x: -4, y: 0, z: -12 }
    },
    {
      type: DestructibleTypes.VEHICLE_WRECK,
      position: { x: 0, y: 0, z: -15 }
    },
    {
      type: DestructibleTypes.METAL_BOX,
      position: { x: 4, y: 0, z: -12 }
    },
    {
      type: DestructibleTypes.CONCRETE_BARRIER,
      position: { x: 7, y: 0, z: -10 }
    },
    {
      type: DestructibleTypes.OIL_DRUM,
      position: { x: -2, y: 0, z: -18 }
    },
    {
      type: DestructibleTypes.OIL_DRUM,
      position: { x: 2, y: 0, z: -18 }
    }
  ],

  'level11_room0': [
    {
      type: DestructibleTypes.VEHICLE_WRECK,
      position: { x: -6, y: 0, z: -10 }
    },
    {
      type: DestructibleTypes.CONCRETE_BARRIER,
      position: { x: -3, y: 0, z: -12 }
    },
    {
      type: DestructibleTypes.SANDBAG_WALL,
      position: { x: -1, y: 0, z: -14 }
    },
    {
      type: DestructibleTypes.METAL_BOX,
      position: { x: 1, y: 0, z: -16 }
    },
    {
      type: DestructibleTypes.CONCRETE_BARRIER,
      position: { x: 3, y: 0, z: -12 }
    },
    {
      type: DestructibleTypes.VEHICLE_WRECK,
      position: { x: 6, y: 0, z: -10 }
    }
  ],

  'level12_room0': [
    {
      type: DestructibleTypes.CONCRETE_BARRIER,
      position: { x: -7, y: 0, z: -10 }
    },
    {
      type: DestructibleTypes.VEHICLE_WRECK,
      position: { x: -4, y: 0, z: -12 }
    },
    {
      type: DestructibleTypes.CONCRETE_BARRIER,
      position: { x: -2, y: 0, z: -14 }
    },
    {
      type: DestructibleTypes.SANDBAG_WALL,
      position: { x: 0, y: 0, z: -16 }
    },
    {
      type: DestructibleTypes.CONCRETE_BARRIER,
      position: { x: 2, y: 0, z: -14 }
    },
    {
      type: DestructibleTypes.VEHICLE_WRECK,
      position: { x: 4, y: 0, z: -12 }
    },
    {
      type: DestructibleTypes.CONCRETE_BARRIER,
      position: { x: 7, y: 0, z: -10 }
    }
  ],
  'level12_room1': [
    {
      type: DestructibleTypes.VEHICLE_WRECK,
      position: { x: -6, y: 0, z: -13 }
    },
    {
      type: DestructibleTypes.CONCRETE_BARRIER,
      position: { x: -3, y: 0, z: -15 }
    },
    {
      type: DestructibleTypes.METAL_BOX,
      position: { x: -1, y: 0, z: -17 }
    },
    {
      type: DestructibleTypes.OIL_DRUM,
      position: { x: 0, y: 0, z: -19 }
    },
    {
      type: DestructibleTypes.METAL_BOX,
      position: { x: 1, y: 0, z: -17 }
    },
    {
      type: DestructibleTypes.CONCRETE_BARRIER,
      position: { x: 3, y: 0, z: -15 }
    },
    {
      type: DestructibleTypes.VEHICLE_WRECK,
      position: { x: 6, y: 0, z: -13 }
    }
  ]
};

/**
 * Get all unique destructible types used in a level
 * @param {number} levelNumber - Level number
 * @returns {Set} Set of destructible types
 */
export function getDestructibleTypesForLevel(levelNumber) {
  const types = new Set();

  Object.keys(destructiblePlacements).forEach(key => {
    if (key.startsWith(`level${levelNumber}_`)) {
      destructiblePlacements[key].forEach(destructible => {
        types.add(destructible.type);
      });
    }
  });

  return types;
}

/**
 * Get total destructible count for a level
 * @param {number} levelNumber - Level number
 * @returns {number} Total destructible count
 */
export function getDestructibleCountForLevel(levelNumber) {
  let count = 0;

  Object.keys(destructiblePlacements).forEach(key => {
    if (key.startsWith(`level${levelNumber}_`)) {
      count += destructiblePlacements[key].length;
    }
  });

  return count;
}
