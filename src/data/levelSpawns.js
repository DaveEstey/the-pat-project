import { EnemyTypes } from '../types/enemies.js';

// Level spawn configurations
export const LevelSpawns = {
  level1: [
    {
      triggerProgress: 0.2,
      position: { x: 0, y: 0, z: -30 },
      enemies: [
        {
          type: EnemyTypes.BASIC_SHOOTER,
          count: 2,
          formation: 'line',
          delay: 0
        }
      ]
    },
    {
      triggerProgress: 0.4,
      position: { x: 5, y: 1, z: -60 },
      enemies: [
        {
          type: EnemyTypes.BASIC_SHOOTER,
          count: 3,
          formation: 'triangle',
          delay: 0
        }
      ]
    },
    {
      triggerProgress: 0.6,
      position: { x: -8, y: 0, z: -90 },
      enemies: [
        {
          type: EnemyTypes.BASIC_SHOOTER,
          count: 2,
          formation: 'line',
          delay: 0
        },
        {
          type: EnemyTypes.ARMORED,
          count: 1,
          formation: 'line',
          delay: 2000
        }
      ]
    },
    {
      triggerProgress: 0.8,
      position: { x: 0, y: 2, z: -120 },
      enemies: [
        {
          type: EnemyTypes.NINJA,
          count: 1,
          formation: 'scattered',
          delay: 0
        },
        {
          type: EnemyTypes.BASIC_SHOOTER,
          count: 4,
          formation: 'circle',
          delay: 1000
        }
      ]
    }
  ],

  level2: [
    {
      triggerProgress: 0.15,
      position: { x: -5, y: 0, z: -25 },
      enemies: [
        {
          type: EnemyTypes.BASIC_SHOOTER,
          count: 3,
          formation: 'line',
          delay: 0
        }
      ]
    },
    {
      triggerProgress: 0.3,
      position: { x: 8, y: 1, z: -50 },
      enemies: [
        {
          type: EnemyTypes.ARMORED,
          count: 1,
          formation: 'line',
          delay: 0
        },
        {
          type: EnemyTypes.BASIC_SHOOTER,
          count: 2,
          formation: 'line',
          delay: 1500
        }
      ]
    },
    {
      triggerProgress: 0.45,
      position: { x: -10, y: 2, z: -70 },
      enemies: [
        {
          type: EnemyTypes.BOMB_THROWER,
          count: 1,
          formation: 'line',
          delay: 0
        }
      ]
    },
    {
      triggerProgress: 0.6,
      position: { x: 3, y: 0, z: -95 },
      enemies: [
        {
          type: EnemyTypes.FAST_DEBUFFER,
          count: 2,
          formation: 'scattered',
          delay: 0
        },
        {
          type: EnemyTypes.NINJA,
          count: 1,
          formation: 'scattered',
          delay: 2000
        }
      ]
    },
    {
      triggerProgress: 0.75,
      position: { x: 0, y: 1, z: -115 },
      enemies: [
        {
          type: EnemyTypes.ARMORED,
          count: 2,
          formation: 'line',
          delay: 0
        },
        {
          type: EnemyTypes.BASIC_SHOOTER,
          count: 4,
          formation: 'circle',
          delay: 1000
        }
      ]
    },
    {
      triggerProgress: 0.9,
      position: { x: -5, y: 3, z: -135 },
      enemies: [
        {
          type: EnemyTypes.BOMB_THROWER,
          count: 2,
          formation: 'line',
          delay: 0
        },
        {
          type: EnemyTypes.NINJA,
          count: 2,
          formation: 'scattered',
          delay: 1500
        }
      ]
    }
  ],

  level3: [
    {
      triggerProgress: 0.1,
      position: { x: -8, y: 0, z: -20 },
      enemies: [
        {
          type: EnemyTypes.FAST_DEBUFFER,
          count: 3,
          formation: 'scattered',
          delay: 0
        }
      ]
    },
    {
      triggerProgress: 0.25,
      position: { x: 6, y: 2, z: -45 },
      enemies: [
        {
          type: EnemyTypes.ARMORED,
          count: 2,
          formation: 'line',
          delay: 0
        }
      ]
    },
    {
      triggerProgress: 0.4,
      position: { x: -3, y: 1, z: -65 },
      enemies: [
        {
          type: EnemyTypes.NINJA,
          count: 2,
          formation: 'scattered',
          delay: 0
        },
        {
          type: EnemyTypes.BOMB_THROWER,
          count: 1,
          formation: 'line',
          delay: 2500
        }
      ]
    },
    {
      triggerProgress: 0.55,
      position: { x: 10, y: 0, z: -85 },
      enemies: [
        {
          type: EnemyTypes.BASIC_SHOOTER,
          count: 6,
          formation: 'circle',
          delay: 0
        }
      ]
    },
    {
      triggerProgress: 0.7,
      position: { x: 0, y: 3, z: -105 },
      enemies: [
        {
          type: EnemyTypes.ARMORED,
          count: 1,
          formation: 'line',
          delay: 0
        },
        {
          type: EnemyTypes.FAST_DEBUFFER,
          count: 2,
          formation: 'scattered',
          delay: 1000
        },
        {
          type: EnemyTypes.NINJA,
          count: 1,
          formation: 'scattered',
          delay: 2000
        }
      ]
    },
    {
      triggerProgress: 0.85,
      position: { x: -7, y: 1, z: -125 },
      enemies: [
        {
          type: EnemyTypes.BOMB_THROWER,
          count: 3,
          formation: 'triangle',
          delay: 0
        },
        {
          type: EnemyTypes.ARMORED,
          count: 2,
          formation: 'line',
          delay: 2000
        }
      ]
    }
  ],

  // Boss level example
  level4: [
    {
      triggerProgress: 0.2,
      position: { x: 0, y: 0, z: -40 },
      enemies: [
        {
          type: EnemyTypes.BASIC_SHOOTER,
          count: 4,
          formation: 'circle',
          delay: 0
        }
      ]
    },
    {
      triggerProgress: 0.4,
      position: { x: -5, y: 1, z: -70 },
      enemies: [
        {
          type: EnemyTypes.ARMORED,
          count: 2,
          formation: 'line',
          delay: 0
        },
        {
          type: EnemyTypes.NINJA,
          count: 2,
          formation: 'scattered',
          delay: 1500
        }
      ]
    },
    {
      triggerProgress: 0.6,
      position: { x: 8, y: 2, z: -100 },
      enemies: [
        {
          type: EnemyTypes.BOMB_THROWER,
          count: 2,
          formation: 'line',
          delay: 0
        },
        {
          type: EnemyTypes.FAST_DEBUFFER,
          count: 3,
          formation: 'scattered',
          delay: 2000
        }
      ]
    },
    {
      triggerProgress: 0.8,
      position: { x: 0, y: 3, z: -130 },
      enemies: [
        {
          type: EnemyTypes.BOSS,
          count: 1,
          formation: 'line',
          delay: 0
        }
      ]
    }
  ],

  // More varied spawn example
  level5: [
    {
      triggerProgress: 0.05,
      position: { x: 12, y: 0, z: -15 },
      enemies: [
        {
          type: EnemyTypes.FAST_DEBUFFER,
          count: 1,
          formation: 'line',
          delay: 0
        }
      ]
    },
    {
      triggerProgress: 0.18,
      position: { x: -8, y: 2, z: -35 },
      enemies: [
        {
          type: EnemyTypes.BASIC_SHOOTER,
          count: 3,
          formation: 'triangle',
          delay: 0
        }
      ]
    },
    {
      triggerProgress: 0.32,
      position: { x: 5, y: 1, z: -55 },
      enemies: [
        {
          type: EnemyTypes.NINJA,
          count: 1,
          formation: 'scattered',
          delay: 0
        },
        {
          type: EnemyTypes.ARMORED,
          count: 1,
          formation: 'line',
          delay: 1000
        }
      ]
    },
    {
      triggerProgress: 0.48,
      position: { x: -10, y: 0, z: -75 },
      enemies: [
        {
          type: EnemyTypes.BOMB_THROWER,
          count: 1,
          formation: 'line',
          delay: 0
        },
        {
          type: EnemyTypes.BASIC_SHOOTER,
          count: 2,
          formation: 'line',
          delay: 2000
        }
      ]
    },
    {
      triggerProgress: 0.62,
      position: { x: 7, y: 3, z: -95 },
      enemies: [
        {
          type: EnemyTypes.FAST_DEBUFFER,
          count: 2,
          formation: 'scattered',
          delay: 0
        },
        {
          type: EnemyTypes.NINJA,
          count: 1,
          formation: 'scattered',
          delay: 1500
        }
      ]
    },
    {
      triggerProgress: 0.78,
      position: { x: 0, y: 1, z: -115 },
      enemies: [
        {
          type: EnemyTypes.ARMORED,
          count: 3,
          formation: 'triangle',
          delay: 0
        }
      ]
    },
    {
      triggerProgress: 0.92,
      position: { x: -6, y: 2, z: -140 },
      enemies: [
        {
          type: EnemyTypes.BOMB_THROWER,
          count: 2,
          formation: 'line',
          delay: 0
        },
        {
          type: EnemyTypes.NINJA,
          count: 2,
          formation: 'scattered',
          delay: 1000
        },
        {
          type: EnemyTypes.BASIC_SHOOTER,
          count: 4,
          formation: 'circle',
          delay: 2500
        }
      ]
    }
  ]
};

// Helper function to get spawn config for a level
export function getLevelSpawns(levelNumber) {
  const levelKey = `level${levelNumber}`;
  return LevelSpawns[levelKey] || LevelSpawns.level1; // Default to level 1 if not found
}

// Helper function to validate spawn configuration
export function validateSpawnConfig(spawns) {
  if (!Array.isArray(spawns)) {
    console.error('Spawn configuration must be an array');
    return false;
  }

  for (let i = 0; i < spawns.length; i++) {
    const spawn = spawns[i];
    
    if (typeof spawn.triggerProgress !== 'number' || 
        spawn.triggerProgress < 0 || spawn.triggerProgress > 1) {
      console.error(`Invalid triggerProgress at spawn ${i}: ${spawn.triggerProgress}`);
      return false;
    }
    
    if (!spawn.position || typeof spawn.position.x !== 'number' ||
        typeof spawn.position.y !== 'number' || typeof spawn.position.z !== 'number') {
      console.error(`Invalid position at spawn ${i}`);
      return false;
    }
    
    if (!Array.isArray(spawn.enemies) || spawn.enemies.length === 0) {
      console.error(`No enemies defined at spawn ${i}`);
      return false;
    }
    
    for (let j = 0; j < spawn.enemies.length; j++) {
      const enemy = spawn.enemies[j];
      
      if (!Object.values(EnemyTypes).includes(enemy.type)) {
        console.error(`Invalid enemy type at spawn ${i}, enemy ${j}: ${enemy.type}`);
        return false;
      }
      
      if (typeof enemy.count !== 'number' || enemy.count <= 0) {
        console.error(`Invalid enemy count at spawn ${i}, enemy ${j}: ${enemy.count}`);
        return false;
      }
    }
  }
  
  return true;
}

export default LevelSpawns;