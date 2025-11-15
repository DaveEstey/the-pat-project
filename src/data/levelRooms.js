// Level room configurations - defines multiple rooms per level with enemy layouts

export function getLevelRooms(levelNumber) {
  const levelConfigs = {
    1: [ // Level 1 - Urban Outskirts
      {
        id: 'level_1_room_1',
        name: 'Entry Chamber',
        description: 'First combat encounter - Learn the basics',
        theme: 'urban_entry',
        enemyCount: 3,
        difficulty: 'easy',
        enemyLayout: [
          { type: 'basic', position: { x: -2, y: 0, z: -10 }, health: 50, shootInterval: 4500 },
          { type: 'basic', position: { x: 2, y: 0, z: -10 }, health: 50, shootInterval: 5000 },
          { type: 'basic', position: { x: 0, y: 1, z: -12 }, health: 50, shootInterval: 5500 }
        ]
      },
      {
        id: 'level_1_room_2',
        name: 'Guard Post',
        description: 'Introduction to armored enemies',
        theme: 'urban_checkpoint',
        enemyCount: 3,
        difficulty: 'medium',
        enemyLayout: [
          { type: 'basic', position: { x: -3, y: 0, z: -10 }, health: 60, shootInterval: 4300 },
          { type: 'armored', position: { x: 0, y: 0.5, z: -12 }, health: 120, shootInterval: 5000 },
          { type: 'basic', position: { x: 3, y: 0, z: -10 }, health: 60, shootInterval: 4700 }
        ],
        weaponPickups: [
          { weaponType: 'shotgun', position: { x: -8, y: 6, z: -50 } } // Far distance, top left corner - tiny visual
        ]
      }
    ],
    2: [ // Level 2 - Industrial Complex
      {
        id: 'level_2_room_1',
        name: 'Factory Floor',
        description: 'Fast-paced industrial combat',
        theme: 'industrial_factory',
        enemyCount: 3,
        difficulty: 'medium',
        enemyLayout: [
          { type: 'fast_debuffer', position: { x: -3, y: 0, z: -9 }, health: 45, shootInterval: 2500 },
          { type: 'armored', position: { x: 0, y: 1.5, z: -12 }, health: 140, shootInterval: 3500 },
          { type: 'fast_debuffer', position: { x: 3, y: 0, z: -9 }, health: 45, shootInterval: 2500 }
        ]
      },
      {
        id: 'level_2_room_2',
        name: 'Power Core Chamber',
        description: 'Heavy armored defense with bomb threats',
        theme: 'industrial_core',
        enemyCount: 3,
        difficulty: 'hard',
        enemyLayout: [
          { type: 'bomb_thrower', position: { x: -2, y: 1, z: -13 }, health: 90, shootInterval: 4500 },
          { type: 'armored', position: { x: 0, y: 0, z: -11 }, health: 180, shootInterval: 3800 },
          { type: 'bomb_thrower', position: { x: 2, y: 1, z: -13 }, health: 90, shootInterval: 4700 }
        ],
        weaponPickups: [
          { weaponType: 'rapidfire', position: { x: 8, y: 5, z: -55 } } // Far distance, top right corner - separated from L1 pickup
        ]
      }
    ],
    3: [ // Level 3 - Underground Fortress (Final Level)
      {
        id: 'level_3_room_1',
        name: 'Maintenance Tunnels',
        description: 'Close-quarters ninja encounters',
        theme: 'underground_tunnel',
        enemyCount: 3,
        difficulty: 'hard',
        enemyLayout: [
          { type: 'ninja', position: { x: -2, y: 0, z: -8 }, health: 40, shootInterval: 2500 },
          { type: 'armored', position: { x: 0, y: 0, z: -11 }, health: 200, shootInterval: 3500 },
          { type: 'ninja', position: { x: 2, y: 0, z: -8 }, health: 40, shootInterval: 2500 }
        ],
        weaponPickups: [
          { weaponType: 'grappling', position: { x: 0, y: 7, z: -48 } } // Far distance, center high - separated from L1 & L2 pickups
        ]
      },
      {
        id: 'level_3_room_2',
        name: 'Underground Fortress',
        description: 'Final boss encounter!',
        theme: 'underground_fortress',
        enemyCount: 3,
        difficulty: 'boss',
        enemyLayout: [
          { type: 'ninja', position: { x: -3, y: 0, z: -8 }, health: 50, shootInterval: 2500 },
          { type: 'boss', position: { x: 0, y: 1, z: -11 }, health: 350, shootInterval: 3500, isBoss: true },
          { type: 'ninja', position: { x: 3, y: 0, z: -8 }, health: 50, shootInterval: 2500 }
        ]
      }
    ],
    4: [ // Level 4 - Dense Jungle
      {
        id: 'level_4_room_1',
        name: 'Jungle Entrance',
        description: 'Thick vegetation and hidden enemies',
        theme: 'jungle_canopy',
        enemyCount: 4,
        difficulty: 'medium',
        enemyLayout: [
          { type: 'ninja', position: { x: -4, y: 0, z: -10 }, health: 70, shootInterval: 2500 },
          { type: 'basic', position: { x: 0, y: 0, z: -13 }, health: 65, shootInterval: 3800 },
          { type: 'ninja', position: { x: 4, y: 0, z: -10 }, health: 70, shootInterval: 2500 },
          { type: 'bomb_thrower', position: { x: 0, y: 2, z: -17 }, health: 90, shootInterval: 4500 }
        ]
      },
      {
        id: 'level_4_room_2',
        name: 'Ancient Ruins',
        description: 'Mysterious structures with deadly guardians',
        theme: 'jungle_ruins',
        enemyCount: 3,
        difficulty: 'hard',
        enemyLayout: [
          { type: 'armored', position: { x: -3, y: 1, z: -12 }, health: 150, shootInterval: 2500 },
          { type: 'ninja', position: { x: 3, y: 0, z: -9 }, health: 75, shootInterval: 2500 },
          { type: 'fast_debuffer', position: { x: 0, y: 0.5, z: -15 }, health: 55, shootInterval: 2500 }
        ]
      }
    ],
    5: [ // Level 5 - Space Station Alpha
      {
        id: 'level_5_room_1',
        name: 'Docking Bay',
        description: 'Zero gravity combat zone',
        theme: 'space_dock',
        enemyCount: 4,
        difficulty: 'medium',
        enemyLayout: [
          { type: 'fast_debuffer', position: { x: -3, y: 1, z: -11 }, health: 60, shootInterval: 2500 },
          { type: 'armored', position: { x: 3, y: 1, z: -11 }, health: 160, shootInterval: 2500 },
          { type: 'ninja', position: { x: 0, y: 2, z: -14 }, health: 80, shootInterval: 2500 },
          { type: 'bomb_thrower', position: { x: 0, y: 0, z: -17 }, health: 95, shootInterval: 4000 }
        ]
      },
      {
        id: 'level_5_room_2',
        name: 'Command Center',
        description: 'High-tech security systems activate',
        theme: 'space_command',
        enemyCount: 5,
        difficulty: 'hard',
        enemyLayout: [
          { type: 'fast_debuffer', position: { x: -4, y: 0, z: -10 }, health: 65, shootInterval: 2500 },
          { type: 'fast_debuffer', position: { x: 4, y: 0, z: -10 }, health: 65, shootInterval: 2500 },
          { type: 'armored', position: { x: 0, y: 1, z: -13 }, health: 170, shootInterval: 2500 },
          { type: 'ninja', position: { x: -2, y: 2, z: -15 }, health: 85, shootInterval: 2500 },
          { type: 'ninja', position: { x: 2, y: 2, z: -15 }, health: 85, shootInterval: 2500 }
        ]
      }
    ],
    6: [ // Level 6 - Haunted Mansion
      {
        id: 'level_6_room_1',
        name: 'Grand Foyer',
        description: 'Gothic halls with supernatural enemies',
        theme: 'haunted_entrance',
        enemyCount: 3,
        difficulty: 'medium',
        enemyLayout: [
          { type: 'ninja', position: { x: -5, y: 0, z: -12 }, health: 90, shootInterval: 2500 },
          { type: 'bomb_thrower', position: { x: 0, y: 1.5, z: -15 }, health: 110, shootInterval: 3500 },
          { type: 'ninja', position: { x: 5, y: 0, z: -12 }, health: 90, shootInterval: 2500 }
        ]
      },
      {
        id: 'level_6_room_2',
        name: 'Library of Horrors',
        description: 'Ancient tomes and ghostly defenders',
        theme: 'haunted_library',
        enemyCount: 4,
        difficulty: 'hard',
        enemyLayout: [
          { type: 'ninja', position: { x: -3, y: 2, z: -11 }, health: 95, shootInterval: 2500 },
          { type: 'armored', position: { x: 0, y: 0, z: -14 }, health: 180, shootInterval: 2500 },
          { type: 'ninja', position: { x: 3, y: 2, z: -11 }, health: 95, shootInterval: 2500 },
          { type: 'fast_debuffer', position: { x: 0, y: 1, z: -17 }, health: 70, shootInterval: 2500 }
        ]
      }
    ],
    7: [ // Level 7 - Western Frontier
      {
        id: 'level_7_room_1',
        name: 'Dusty Saloon',
        description: 'Wild west shootout begins',
        theme: 'western_saloon',
        enemyCount: 4,
        difficulty: 'medium',
        enemyLayout: [
          { type: 'basic', position: { x: -4, y: 0, z: -11 }, health: 80, shootInterval: 2500 },
          { type: 'bomb_thrower', position: { x: 0, y: 1, z: -14 }, health: 120, shootInterval: 3800 },
          { type: 'basic', position: { x: 4, y: 0, z: -11 }, health: 80, shootInterval: 2500 },
          { type: 'armored', position: { x: 0, y: 0, z: -17 }, health: 190, shootInterval: 2500 }
        ]
      },
      {
        id: 'level_7_room_2',
        name: 'Desert Outpost',
        description: 'Final frontier defense',
        theme: 'western_desert',
        enemyCount: 5,
        difficulty: 'hard',
        enemyLayout: [
          { type: 'basic', position: { x: -5, y: 0, z: -10 }, health: 85, shootInterval: 2500 },
          { type: 'ninja', position: { x: -2, y: 0, z: -12 }, health: 100, shootInterval: 2500 },
          { type: 'armored', position: { x: 0, y: 0.5, z: -15 }, health: 200, shootInterval: 2500 },
          { type: 'ninja', position: { x: 2, y: 0, z: -12 }, health: 100, shootInterval: 2500 },
          { type: 'basic', position: { x: 5, y: 0, z: -10 }, health: 85, shootInterval: 2500 }
        ]
      }
    ],
    8: [ // Level 8 - Urban Rooftops
      {
        id: 'level_8_room_1',
        name: 'Skyline Chase',
        description: 'High-rise building combat',
        theme: 'urban_rooftop',
        enemyCount: 5,
        difficulty: 'hard',
        enemyLayout: [
          { type: 'fast_debuffer', position: { x: -4, y: 1, z: -10 }, health: 75, shootInterval: 2500 },
          { type: 'ninja', position: { x: -1, y: 2, z: -13 }, health: 105, shootInterval: 2500 },
          { type: 'armored', position: { x: 0, y: 0, z: -16 }, health: 210, shootInterval: 2500 },
          { type: 'ninja', position: { x: 1, y: 2, z: -13 }, health: 105, shootInterval: 2500 },
          { type: 'fast_debuffer', position: { x: 4, y: 1, z: -10 }, health: 75, shootInterval: 2500 }
        ]
      },
      {
        id: 'level_8_room_2',
        name: 'Corporate Tower',
        description: 'Executive floor security',
        theme: 'urban_corporate',
        enemyCount: 4,
        difficulty: 'very_hard',
        enemyLayout: [
          { type: 'armored', position: { x: -3, y: 1, z: -13 }, health: 220, shootInterval: 2500 },
          { type: 'bomb_thrower', position: { x: 0, y: 2, z: -17 }, health: 140, shootInterval: 2500 },
          { type: 'armored', position: { x: 3, y: 1, z: -13 }, health: 220, shootInterval: 2500 },
          { type: 'fast_debuffer', position: { x: 0, y: 0, z: -20 }, health: 80, shootInterval: 2500 }
        ]
      }
    ],
    9: [ // Level 9 - Deep Jungle Temple
      {
        id: 'level_9_room_1',
        name: 'Temple Entrance',
        description: 'Ancient guardians awaken',
        theme: 'jungle_temple',
        enemyCount: 4,
        difficulty: 'hard',
        enemyLayout: [
          { type: 'ninja', position: { x: -4, y: 0, z: -11 }, health: 110, shootInterval: 2500 },
          { type: 'bomb_thrower', position: { x: 0, y: 3, z: -15 }, health: 150, shootInterval: 2500 },
          { type: 'ninja', position: { x: 4, y: 0, z: -11 }, health: 110, shootInterval: 2500 },
          { type: 'armored', position: { x: 0, y: 0, z: -18 }, health: 240, shootInterval: 2500 }
        ]
      },
      {
        id: 'level_9_room_2',
        name: 'Sacred Chamber',
        description: 'Heart of the temple defenses',
        theme: 'jungle_sacred',
        enemyCount: 6,
        difficulty: 'very_hard',
        enemyLayout: [
          { type: 'ninja', position: { x: -5, y: 0, z: -10 }, health: 115, shootInterval: 2500 },
          { type: 'fast_debuffer', position: { x: -2, y: 1, z: -13 }, health: 85, shootInterval: 2500 },
          { type: 'armored', position: { x: 0, y: 1, z: -16 }, health: 250, shootInterval: 2500 },
          { type: 'fast_debuffer', position: { x: 2, y: 1, z: -13 }, health: 85, shootInterval: 2500 },
          { type: 'ninja', position: { x: 5, y: 0, z: -10 }, health: 115, shootInterval: 2500 },
          { type: 'bomb_thrower', position: { x: 0, y: 3, z: -20 }, health: 160, shootInterval: 2500 }
        ]
      }
    ],
    10: [ // Level 10 - Space Station Beta
      {
        id: 'level_10_room_1',
        name: 'Reactor Core',
        description: 'Critical systems under attack',
        theme: 'space_reactor',
        enemyCount: 5,
        difficulty: 'very_hard',
        enemyLayout: [
          { type: 'fast_debuffer', position: { x: -4, y: 2, z: -11 }, health: 90, shootInterval: 2500 },
          { type: 'armored', position: { x: -1, y: 0, z: -14 }, health: 260, shootInterval: 2500 },
          { type: 'bomb_thrower', position: { x: 0, y: 3, z: -18 }, health: 170, shootInterval: 2500 },
          { type: 'armored', position: { x: 1, y: 0, z: -14 }, health: 260, shootInterval: 2500 },
          { type: 'fast_debuffer', position: { x: 4, y: 2, z: -11 }, health: 90, shootInterval: 2500 }
        ]
      },
      {
        id: 'level_10_room_2',
        name: 'AI Core Chamber',
        description: 'Artificial intelligence defense grid',
        theme: 'space_ai_core',
        enemyCount: 6,
        difficulty: 'extreme',
        enemyLayout: [
          { type: 'fast_debuffer', position: { x: -5, y: 1, z: -10 }, health: 95, shootInterval: 2500 },
          { type: 'ninja', position: { x: -2, y: 2, z: -12 }, health: 120, shootInterval: 2500 },
          { type: 'armored', position: { x: 0, y: 0, z: -15 }, health: 280, shootInterval: 2500 },
          { type: 'ninja', position: { x: 2, y: 2, z: -12 }, health: 120, shootInterval: 2500 },
          { type: 'fast_debuffer', position: { x: 5, y: 1, z: -10 }, health: 95, shootInterval: 2500 },
          { type: 'bomb_thrower', position: { x: 0, y: 4, z: -20 }, health: 180, shootInterval: 2500 }
        ]
      }
    ],
    11: [ // Level 11 - Haunted Cathedral
      {
        id: 'level_11_room_1',
        name: 'Cathedral Nave',
        description: 'Gothic spires hide deadly spirits',
        theme: 'haunted_cathedral',
        enemyCount: 5,
        difficulty: 'very_hard',
        enemyLayout: [
          { type: 'ninja', position: { x: -6, y: 0, z: -12 }, health: 125, shootInterval: 2500 },
          { type: 'armored', position: { x: -2, y: 1, z: -15 }, health: 290, shootInterval: 2500 },
          { type: 'bomb_thrower', position: { x: 0, y: 4, z: -19 }, health: 190, shootInterval: 2500 },
          { type: 'armored', position: { x: 2, y: 1, z: -15 }, health: 290, shootInterval: 2500 },
          { type: 'ninja', position: { x: 6, y: 0, z: -12 }, health: 125, shootInterval: 2500 }
        ]
      },
      {
        id: 'level_11_room_2',
        name: 'Bell Tower Summit',
        description: 'Final approach to the ultimate challenge',
        theme: 'haunted_tower',
        enemyCount: 7,
        difficulty: 'extreme',
        enemyLayout: [
          { type: 'ninja', position: { x: -6, y: 0, z: -11 }, health: 130, shootInterval: 2500 },
          { type: 'fast_debuffer', position: { x: -3, y: 2, z: -13 }, health: 100, shootInterval: 2500 },
          { type: 'armored', position: { x: 0, y: 0, z: -16 }, health: 300, shootInterval: 2500 },
          { type: 'bomb_thrower', position: { x: 0, y: 5, z: -21 }, health: 200, shootInterval: 2500 },
          { type: 'fast_debuffer', position: { x: 3, y: 2, z: -13 }, health: 100, shootInterval: 2500 },
          { type: 'ninja', position: { x: 6, y: 0, z: -11 }, health: 130, shootInterval: 2500 },
          { type: 'armored', position: { x: 0, y: 1, z: -25 }, health: 320, shootInterval: 2500 }
        ]
      }
    ],
    12: [ // Level 12 - Final Boss Arena (All Themes)
      {
        id: 'level_12_room_1',
        name: 'Convergence Chamber',
        description: 'All environments merge for the final battle',
        theme: 'final_convergence',
        enemyCount: 6,
        difficulty: 'extreme',
        enemyLayout: [
          { type: 'armored', position: { x: -5, y: 1, z: -13 }, health: 320, shootInterval: 2500 },
          { type: 'ninja', position: { x: -2, y: 2, z: -11 }, health: 135, shootInterval: 2500 },
          { type: 'fast_debuffer', position: { x: 0, y: 3, z: -17 }, health: 105, shootInterval: 2500 },
          { type: 'ninja', position: { x: 2, y: 2, z: -11 }, health: 135, shootInterval: 2500 },
          { type: 'armored', position: { x: 5, y: 1, z: -13 }, health: 320, shootInterval: 2500 },
          { type: 'bomb_thrower', position: { x: 0, y: 5, z: -23 }, health: 220, shootInterval: 2500 }
        ]
      },
      {
        id: 'level_12_room_2',
        name: 'Ultimate Showdown',
        description: 'The final boss awaits - everything depends on this',
        theme: 'final_boss',
        enemyCount: 1,
        difficulty: 'boss',
        enemyLayout: [
          {
            type: 'boss',
            position: { x: 0, y: 2, z: -20 },
            health: 800,
            shootInterval: 2500,
            isBoss: true,
            phases: 3,
            specialAttacks: ['laser_barrage', 'missile_swarm', 'teleport_strike']
          }
        ]
      }
    ]
  };

  return levelConfigs[levelNumber] || [
    {
      id: `level_${levelNumber}_room_1`,
      name: 'Unknown Room',
      description: 'Procedural room',
      enemyCount: 3,
      difficulty: 'medium'
    }
  ];
}

export default getLevelRooms;