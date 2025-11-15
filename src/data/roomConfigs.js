import { EnemyTypes } from '../types/enemies.js';

// Room configuration data
export const RoomConfigs = {
  // Level 1 Rooms
  room_1_1: {
    id: 'room_1_1',
    name: 'Entry Corridor',
    duration: 60,
    cameraPosition: { x: 0, y: 2, z: 5 },
    cameraTarget: { x: 0, y: 1, z: -10 },
    environment: 'urban_corridor',
    dimensions: { width: 8, depth: 12, height: 4 },
    cover: [
      { type: 'destructible_boxes', position: { x: -2, y: 0, z: -3 }, health: 50 },
      { type: 'metal_pillar', position: { x: 3, y: 0, z: -6 }, health: 200 }
    ],
    spawnConfig: {
      waves: [
        {
          delay: 0, // Spawn immediately on room entry
          enemies: [
            { type: EnemyTypes.BASIC_SHOOTER, count: 2, formation: 'line' }
          ]
        }
      ]
    },
    items: [
      { type: 'health', subType: 'small', position: { x: 2, y: 0.5, z: -8 }, value: 25 }
    ],
    exits: [
      { direction: 'forward', unlocked: true, leadsTo: 'room_1_2' }
    ]
  },

  room_1_2: {
    id: 'room_1_2',
    name: 'Urban Plaza',
    duration: 75,
    cameraPosition: { x: 0, y: 3, z: 8 },
    cameraTarget: { x: 0, y: 1, z: -5 },
    environment: 'urban_plaza',
    dimensions: { width: 15, depth: 12, height: 6 },
    cover: [
      { type: 'destructible_wall', position: { x: -5, y: 0, z: -2 }, health: 100 },
      { type: 'stone_pillar', position: { x: 5, y: 0, z: -4 }, health: 300 },
      { type: 'destructible_boxes', position: { x: 0, y: 0, z: -1 }, health: 50 }
    ],
    spawnConfig: {
      waves: [
        {
          delay: 0, // Spawn immediately on room entry
          enemies: [
            { type: EnemyTypes.BASIC_SHOOTER, count: 3, formation: 'triangle' }
          ]
        },
        {
          delay: 15, // 15 seconds later
          enemies: [
            { type: EnemyTypes.ARMORED, count: 1, formation: 'center' },
            { type: EnemyTypes.BASIC_SHOOTER, count: 2, formation: 'flanking' }
          ]
        }
      ]
    },
    items: [
      { type: 'ammo', subType: 'shotgun', position: { x: -4, y: 0.5, z: -6 }, value: 8 },
      { type: 'coin', position: { x: 4, y: 1, z: -3 }, value: 5 }
    ],
    exits: [
      { direction: 'forward', unlocked: true, leadsTo: 'room_1_3' },
      { direction: 'left', unlocked: false, requirement: { type: 'item', itemId: 'red_key' }, leadsTo: 'room_1_secret_A' }
    ]
  },

  room_1_3: {
    id: 'room_1_3',
    name: 'Warehouse Interior',
    duration: 90,
    cameraPosition: { x: -2, y: 2, z: 6 },
    cameraTarget: { x: 0, y: 2, z: -8 },
    environment: 'warehouse_floor',
    dimensions: { width: 15, depth: 12, height: 6 },
    cover: [
      { type: 'fixed_crates', position: { x: -6, y: 0, z: -4 }, health: 150 },
      { type: 'elevated_platform', position: { x: 6, y: 2, z: -6 }, health: 100 },
      { type: 'destructible_wall', position: { x: 0, y: 0, z: -2 }, health: 80 }
    ],
    spawnConfig: {
      waves: [
        {
          delay: 3,
          enemies: [
            { type: EnemyTypes.BASIC_SHOOTER, count: 2, formation: 'cover' }
          ]
        },
        {
          delay: 25,
          enemies: [
            { type: EnemyTypes.NINJA, count: 1, formation: 'flanking' }
          ]
        },
        {
          delay: 45,
          enemies: [
            { type: EnemyTypes.BOMB_THROWER, count: 1, formation: 'back' },
            { type: EnemyTypes.BASIC_SHOOTER, count: 3, formation: 'spread' }
          ]
        }
      ]
    },
    items: [
      { type: 'powerup', subType: 'damage', position: { x: 0, y: 3, z: -8 }, value: 1 },
      { type: 'health', subType: 'large', position: { x: -3, y: 0.5, z: -9 }, value: 50 },
      { type: 'key_item', subType: 'blue_key', position: { x: 6, y: 2.5, z: -6 }, value: 1 }
    ],
    exits: [
      { direction: 'forward', unlocked: true, leadsTo: 'room_1_4' }
    ]
  },

  room_1_4: {
    id: 'room_1_4',
    name: 'Rooftop Encounter',
    duration: 120,
    cameraPosition: { x: 0, y: 4, z: 10 },
    cameraTarget: { x: 0, y: 2, z: -5 },
    environment: 'rooftop',
    dimensions: { width: 12, depth: 15, height: 8 },
    cover: [
      { type: 'air_duct', position: { x: -4, y: 0, z: -3 }, health: 75 },
      { type: 'water_tower', position: { x: 4, y: 0, z: -8 }, health: 250 },
      { type: 'destructible_fence', position: { x: 0, y: 0, z: 0 }, health: 30 }
    ],
    spawnConfig: {
      waves: [
        {
          delay: 2,
          enemies: [
            { type: EnemyTypes.FAST_DEBUFFER, count: 2, formation: 'scattered' }
          ]
        },
        {
          delay: 30,
          enemies: [
            { type: EnemyTypes.ARMORED, count: 2, formation: 'line' }
          ]
        },
        {
          delay: 60,
          enemies: [
            { type: EnemyTypes.BOSS, count: 1, formation: 'center' }
          ]
        }
      ]
    },
    items: [
      { type: 'upgrade', subType: 'enhanced_grip', position: { x: -2, y: 1, z: -10 }, value: 1 },
      { type: 'ammo', subType: 'rapidfire', position: { x: 3, y: 0.5, z: -4 }, value: 30 }
    ],
    exits: [
      { direction: 'forward', unlocked: true, leadsTo: 'level_complete' }
    ],
    isBoss: true
  },

  // Secret Room
  room_1_secret_A: {
    id: 'room_1_secret_A',
    name: 'Hidden Armory',
    duration: 45,
    cameraPosition: { x: 0, y: 1.5, z: 4 },
    cameraTarget: { x: 0, y: 1, z: -6 },
    environment: 'secret_armory',
    dimensions: { width: 6, depth: 8, height: 4 },
    cover: [],
    spawnConfig: {
      waves: [
        {
          delay: 5,
          enemies: [
            { type: EnemyTypes.NINJA, count: 2, formation: 'ambush' }
          ]
        }
      ]
    },
    items: [
      { type: 'upgrade', subType: 'reinforced_armor', position: { x: 0, y: 0.5, z: -6 }, value: 1 },
      { type: 'ammo', subType: 'bomb', position: { x: -2, y: 0.5, z: -4 }, value: 5 },
      { type: 'health', subType: 'large', position: { x: 2, y: 0.5, z: -4 }, value: 50 }
    ],
    exits: [
      { direction: 'back', unlocked: true, leadsTo: 'room_1_2' }
    ],
    isSecret: true,
    rewards: ['max_health_upgrade', 'rare_weapon']
  },

  // Level 2 Rooms (Jungle Theme)
  room_2_1: {
    id: 'room_2_1',
    name: 'Jungle Clearing',
    duration: 70,
    cameraPosition: { x: 0, y: 2.5, z: 7 },
    cameraTarget: { x: 0, y: 1, z: -8 },
    environment: 'jungle_clearing',
    dimensions: { width: 12, depth: 10, height: 5 },
    cover: [
      { type: 'large_tree', position: { x: -4, y: 0, z: -3 }, health: 300 },
      { type: 'rock_formation', position: { x: 4, y: 0, z: -5 }, health: 200 },
      { type: 'fallen_log', position: { x: 0, y: 0, z: -1 }, health: 100 }
    ],
    spawnConfig: {
      waves: [
        {
          delay: 1,
          enemies: [
            { type: EnemyTypes.BASIC_SHOOTER, count: 3, formation: 'forest_spread' }
          ]
        },
        {
          delay: 25,
          enemies: [
            { type: EnemyTypes.FAST_DEBUFFER, count: 2, formation: 'hit_and_run' }
          ]
        }
      ]
    },
    items: [
      { type: 'health', subType: 'small', position: { x: -3, y: 0.5, z: -6 }, value: 25 },
      { type: 'key_item', subType: 'vine_rope', position: { x: 3, y: 2, z: -4 }, value: 1 }
    ],
    exits: [
      { direction: 'forward', unlocked: true, leadsTo: 'room_2_2' },
      { direction: 'up', unlocked: false, requirement: { type: 'item', itemId: 'vine_rope' }, leadsTo: 'room_2_canopy' }
    ]
  }
};

// Room layout definitions for tactical positioning
export const RoomLayouts = {
  tight_corridor: {
    dimensions: { width: 6, depth: 8, height: 4 },
    cover: ['destructible_boxes', 'narrow_pillars'],
    lighting: 'dim',
    acoustics: 'echo'
  },
  
  warehouse_floor: {
    dimensions: { width: 15, depth: 12, height: 6 },
    cover: ['fixed_crates', 'elevated_platforms'],
    lighting: 'bright',
    acoustics: 'ambient'
  },
  
  multi_level: {
    dimensions: { width: 10, depth: 10, height: 8 },
    cover: ['hanging_platforms', 'destructible_bridges'],
    lighting: 'varied',
    acoustics: 'reverb'
  },
  
  underwater: {
    dimensions: { width: 12, depth: 10, height: 5 },
    cover: ['coral_formations', 'sunken_debris'],
    lighting: 'filtered_blue',
    restrictions: ['fire_weapons_disabled'],
    special: ['scuba_required', 'different_movement']
  }
};

// Level room graph for navigation
export const LevelRoomGraph = {
  level1: {
    start: 'room_1_1',
    rooms: {
      room_1_1: {
        exits: [
          { to: 'room_1_2', condition: 'always' }
        ]
      },
      room_1_2: {
        exits: [
          { to: 'room_1_3', condition: 'always' },
          { to: 'room_1_secret_A', condition: 'has_red_key' }
        ]
      },
      room_1_3: {
        exits: [
          { to: 'room_1_4', condition: 'always' }
        ]
      },
      room_1_4: {
        exits: [
          { to: 'level_complete', condition: 'boss_defeated' }
        ]
      },
      room_1_secret_A: {
        exits: [
          { to: 'room_1_2', condition: 'always' }
        ],
        rewards: ['max_health_upgrade', 'rare_weapon']
      }
    }
  },
  
  level2: {
    start: 'room_2_1',
    rooms: {
      room_2_1: {
        exits: [
          { to: 'room_2_2', condition: 'always' },
          { to: 'room_2_canopy', condition: 'has_vine_rope' }
        ]
      }
    }
  }
};

// Formation position calculations for room-based enemies
export function calculateRoomFormationPositions(formation, count, roomDimensions) {
  const positions = [];
  const { width, depth } = roomDimensions;
  
  switch (formation) {
    case 'line':
      for (let i = 0; i < count; i++) {
        positions.push({
          x: (i - (count - 1) / 2) * 2,
          y: 0,
          z: -depth * 0.9 - 12 // MUCH further back
        });
      }
      break;

    case 'triangle':
      for (let i = 0; i < count; i++) {
        if (i === 0) {
          positions.push({ x: 0, y: 0, z: -depth * 0.95 - 12 }); // MUCH further back
        } else {
          const side = (i % 2 === 1) ? -1 : 1;
          const row = Math.floor(i / 2);
          positions.push({
            x: side * (row + 1) * 2,
            y: 0,
            z: -depth * 0.8 - 12 + row * 2 // MUCH further back
          });
        }
      }
      break;

    case 'cover':
      // Position enemies near available cover
      for (let i = 0; i < count; i++) {
        positions.push({
          x: ((i % 2) * 2 - 1) * width * 0.3,
          y: 0,
          z: -depth * 0.7 - 12 - (Math.floor(i / 2) * 3) // MUCH further back
        });
      }
      break;

    case 'scattered':
      for (let i = 0; i < count; i++) {
        positions.push({
          x: (Math.random() - 0.5) * width * 0.6,
          y: 0,
          z: -depth * 0.6 - 12 - Math.random() * depth * 0.4 // MUCH further back
        });
      }
      break;

    case 'flanking':
      for (let i = 0; i < count; i++) {
        const side = (i % 2) * 2 - 1;
        positions.push({
          x: side * width * 0.4,
          y: 0,
          z: -depth * 0.8 - 12 - (Math.floor(i / 2) * 2) // MUCH further back
        });
      }
      break;

    case 'back':
      for (let i = 0; i < count; i++) {
        positions.push({
          x: (i - (count - 1) / 2) * 2,
          y: 0,
          z: -depth * 0.95 - 12 // MUCH further back
        });
      }
      break;

    case 'center':
      for (let i = 0; i < count; i++) {
        positions.push({
          x: 0,
          y: 0,
          z: -depth * 0.8 - 12 // MUCH further back
        });
      }
      break;

    default:
      // Default line formation
      for (let i = 0; i < count; i++) {
        positions.push({
          x: (i - (count - 1) / 2) * 2,
          y: 0,
          z: -depth * 0.8 - 12 // MUCH further back
        });
      }
  }
  
  return positions;
}

// Helper functions
export function getRoomConfig(roomId) {
  return RoomConfigs[roomId];
}

export function validateRoomConfig(config) {
  if (!config.id || !config.cameraPosition || !config.cameraTarget) {
    console.error('Invalid room config: missing required fields');
    return false;
  }
  
  if (!config.spawnConfig || !config.spawnConfig.waves) {
    console.error('Invalid room config: missing spawn configuration');
    return false;
  }
  
  return true;
}

export default RoomConfigs;