# Data Structure Map - Configuration File Reference

Complete mapping of all data/configuration files, their relationships, and which components consume them. Use this as your reference for understanding data flow in the application.

**Last Updated:** 2025-11-05
**Total Data Files:** 14 (src/data/) + 5 (src/types/)

---

## Table of Contents

1. [Data File Overview](#data-file-overview)
2. [Level Data Files](#level-data-files)
3. [Game Configuration Files](#game-configuration-files)
4. [Type Definition Files](#type-definition-files)
5. [Data Flow Diagrams](#data-flow-diagrams)
6. [File Dependency Graph](#file-dependency-graph)
7. [Quick Lookup Tables](#quick-lookup-tables)

---

## Data File Overview

### Data Directory Structure

```
src/data/
├── levelRooms.js            (397 lines) - Enemy layouts, weapon pickups
├── levelSpawns.js           (500 lines) - Legacy trigger-based spawns (UNUSED)
├── levelItems.js            (687 lines) - Item placements for all levels
├── roomConfigs.js           (437 lines) - Detailed room configurations
├── weaponStats.js           (216 lines) - Weapon stats and upgrades
├── gameConfig.js            (217 lines) - Global game settings
├── puzzleConfigs.js         (292 lines) - Puzzle definitions and targets
├── bossConfigs.js           (~150 lines) - Boss enemy configurations
├── storyData.js             - Narrative content
├── secretRoomConfigs.js     - Hidden room definitions
├── hazardConfigs.js         - Environmental hazard data
├── destructibleConfigs.js   - Breakable object data
├── pathConfigs.js           - Branching path choices
└── puzzleHintConfigs.js     - Puzzle assistance data

src/types/
├── game.js                  - Game state constants
├── enemies.js               - Enemy type definitions
├── weapons.js               - Weapon type constants
├── items.js                 - Item type constants
└── levels.js                - Level type constants
```

---

## Level Data Files

### 1. levelRooms.js

**Path:** `src/data/levelRooms.js`
**Lines:** 397
**Purpose:** Defines multiple rooms per level with enemy layouts and weapon pickups

#### Structure
```javascript
export function getLevelRooms(levelNumber) {
  return {
    1: [  // Level 1 has 2 rooms
      {
        id: 'level_1_room_1',
        name: 'Entry Chamber',
        description: 'First combat encounter',
        theme: 'urban_entry',
        enemyCount: 3,
        difficulty: 'easy',
        enemyLayout: [
          {
            type: 'basic',
            position: { x: -2, y: 0, z: -10 },
            health: 50,
            shootInterval: 4500
          }
          // ... more enemies
        ],
        weaponPickups: []  // Optional
      },
      {
        id: 'level_1_room_2',
        // ... room 2 data
        weaponPickups: [
          { weaponType: 'shotgun', position: { x: -8, y: 6, z: -50 } }
        ]
      }
    ],
    2: [ /* Level 2 rooms */ ],
    // ... levels 3-12
  };
}
```

#### Data Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique room identifier |
| `name` | string | Yes | Room display name |
| `description` | string | Yes | Room lore/context |
| `theme` | string | Yes | Environment theme (urban, jungle, etc.) |
| `enemyCount` | number | Yes | Total enemies in room |
| `difficulty` | string | Yes | easy/medium/hard/boss/very_hard/extreme |
| `enemyLayout` | array | Yes | Array of enemy objects |
| `weaponPickups` | array | No | Array of weapon pickup objects |

#### Enemy Object Structure
```javascript
{
  type: 'basic' | 'armored' | 'ninja' | 'bomb_thrower' | 'fast_debuffer' | 'boss',
  position: { x: number, y: number, z: number },
  health: number,
  shootInterval: number,  // Milliseconds between shots
  isBoss: boolean,        // Optional, for boss enemies
  phases: number,         // Optional, for multi-phase bosses
  specialAttacks: array   // Optional, boss attack patterns
}
```

#### Weapon Pickup Object Structure
```javascript
{
  weaponType: 'shotgun' | 'rapidfire' | 'grappling',
  position: { x: number, y: number, z: number }
}
```

#### Consumed By
- **LevelManager.jsx** (line ~80): Loads rooms for current level
- **UnifiedRoomManager.jsx** (line ~50): Spawns enemies from layout
- **WeaponPickup.jsx** (line ~30): Renders weapon pickups

#### Key Points
- Each level has exactly 2 rooms
- Total: 12 levels × 2 rooms = 24 rooms
- Boss enemies marked with `isBoss: true`
- **⚠️ Fixed Issue:** Weapon pickups at unique positions (was overlapping)

---

### 2. levelItems.js

**Path:** `src/data/levelItems.js`
**Lines:** 687
**Purpose:** Item placements for all 12 levels (health, ammo, powerups, etc.)

#### Structure
```javascript
export const LevelItems = {
  level1: [
    {
      type: 'health',
      subType: 'small',
      position: { x: 5, y: 1, z: -25 },
      value: 25
    },
    {
      type: 'ammo',
      subType: 'shotgun',
      position: { x: -3, y: 0.5, z: -45 },
      value: 8
    },
    // ... 4 more items
  ],
  level2: [ /* 8 items */ ],
  level3: [ /* 8 items, includes key_item */ ],
  // ... levels 4-12
};

export const ItemTypes = {
  health: {
    small: { value: 25, color: 0x00ff00, description: 'Small health pack' },
    large: { value: 50, color: 0x00aa00, description: 'Large health pack' }
  },
  ammo: {
    shotgun: { description: 'Shotgun shells' },
    rapidfire: { description: 'Rapid fire rounds' },
    bomb: { description: 'Explosive bombs' }
  },
  powerup: {
    damage: { duration: 10000, multiplier: 1.5 },
    speed: { duration: 8000, multiplier: 1.3 },
    accuracy: { duration: 12000, bonus: 0.2 }
  },
  coin: { /* Currency */ },
  key_item: { /* Special unlocks */ },
  upgrade: { /* Permanent bonuses */ }
};
```

#### Item Object Structure
```javascript
{
  type: 'health' | 'ammo' | 'powerup' | 'coin' | 'key_item' | 'upgrade',
  subType: string,           // Specific variant
  position: { x, y, z },     // 3D coordinates
  value: number,             // Amount to give player
  unlocks: array,            // Optional, for key items (e.g., ['aerial_path_level4'])
  description: string        // Optional, item lore
}
```

#### Item Counts by Level
| Level | Items | Contains Key Item |
|-------|-------|-------------------|
| 1 | 6 | No |
| 2 | 8 | No |
| 3 | 8 | Yes (glider) |
| 4 | 7 | No |
| 5 | 9 | No |
| 6-12 | 7-10 each | Some levels |

#### Special Items
**Level 3 - Glider Key Item:**
```javascript
{
  type: 'key_item',
  subType: 'glider',
  position: { x: -3, y: 4, z: -150 },
  value: 1,
  unlocks: ['aerial_path_level4']
}
```

#### Consumed By
- **WeaponPickup.jsx** (or ItemManager): Renders items in 3D space
- **ItemSystem.js**: Handles collection logic
- **ProgressionSystem.js**: Unlocks paths based on key items

#### Key Points
- Total: ~80+ items across all levels
- Items placed throughout level (z: -10 to -195)
- Key items unlock alternate paths/endings
- Powerups are temporary buffs

---

### 3. roomConfigs.js

**Path:** `src/data/roomConfigs.js`
**Lines:** 437
**Purpose:** Detailed room configurations including camera paths, cover, and formations

#### Structure
```javascript
export const RoomConfigs = {
  room_1_1: {
    id: 'room_1_1',
    level: 1,
    roomNumber: 1,
    name: 'Entry Chamber',

    // Camera configuration
    cameraPath: {
      start: { x: 0, y: 1.6, z: 0 },
      end: { x: 0, y: 1.6, z: -20 },
      lookAt: { x: 0, y: 1, z: -10 },
      duration: 30000  // 30 seconds
    },

    // Environment
    environment: {
      theme: 'urban_entry',
      lighting: 'day',
      fog: { near: 10, far: 100, color: 0x87ceeb }
    },

    // Cover objects
    cover: [
      {
        type: 'crate',
        position: { x: -3, y: 0, z: -8 },
        size: { width: 2, height: 1.5, depth: 2 },
        destructible: false
      }
    ],

    // Multi-wave spawning
    enemyWaves: [
      {
        waveNumber: 1,
        delay: 0,
        enemies: [
          { type: 'basic', position: {...}, health: 50 }
        ]
      },
      {
        waveNumber: 2,
        delay: 15000,  // 15 seconds after wave 1
        enemies: [...]
      }
    ],

    // Room completion
    exitCondition: 'all_enemies_defeated',
    nextRoom: 'room_1_2',

    // Branching paths (optional)
    branchingPaths: [
      { id: 'left_path', requirement: null, leads_to: 'room_1_2' },
      { id: 'right_path', requirement: 'has_key_item_glider', leads_to: 'room_1_2_alt' }
    ]
  },
  room_1_2: { /* Room 2 config */ },
  // ... more rooms
};

// Formation calculator
export function calculateRoomFormationPositions(formation, count, roomDimensions) {
  const positions = [];
  const { width, height, depth } = roomDimensions;

  switch(formation) {
    case 'line':
      // Horizontal line formation
      const spacing = width / (count + 1);
      for (let i = 0; i < count; i++) {
        positions.push({
          x: -width/2 + spacing * (i + 1),
          y: 0,
          z: -depth * 0.9 - 12  // MUCH further back to avoid camera overlap
        });
      }
      break;

    case 'triangle':
      // Triangle formation logic
      break;

    case 'scattered':
      // Random scatter logic
      break;

    // ... more formations
  }

  return positions;
}
```

#### Consumed By
- **LevelManager.jsx**: Loads room configs for transitions
- **UnifiedMovementController.jsx**: Uses camera path data
- **EnvironmentSystem.js**: Loads environment theme
- **RoomTransition.jsx**: Handles room-to-room transitions

#### Key Points
- Only 2-3 complete room configs currently defined
- Most rooms use simplified config from levelRooms.js
- Formation calculator adds -12 offset to prevent camera overlap (historical bug fix)

---

### 4. levelSpawns.js (LEGACY - UNUSED)

**Path:** `src/data/levelSpawns.js`
**Lines:** 500
**Purpose:** **DEPRECATED** Trigger-based enemy spawning system

#### Structure
```javascript
export const LevelSpawns = {
  level1: {
    duration: 60000,
    spawns: [
      {
        triggerProgress: 0.1,  // 10% through level
        enemies: [
          { type: 'basic', position: {...} }
        ]
      },
      {
        triggerProgress: 0.5,  // 50% through level
        enemies: [...]
      }
    ]
  }
};
```

#### Status
**⚠️ NOT USED** - Replaced by room-based system in levelRooms.js

#### Why It Exists
Original design used continuous movement with progress-based spawns.
Current design uses discrete rooms with scripted spawns.

#### Should It Be Deleted?
**Maybe** - Kept for potential "endless mode" or "challenge mode" in future.

---

### 5. puzzleConfigs.js

**Path:** `src/data/puzzleConfigs.js`
**Lines:** 292
**Purpose:** Puzzle definitions for each level and shootable target sequences

#### Structure - Part 1: Basic Puzzles
```javascript
export const PuzzleConfigs = {
  1: {
    room: 1,
    type: 'switch_sequence',
    timeLimit: 45000,
    bonusMultiplier: 1.0,
    description: 'Activate switches in order'
  },
  4: {
    room: 0,
    type: 'timed_targets',
    timeLimit: 35000,
    bonusMultiplier: 1.2,
    description: 'Shoot all glowing markers before time runs out!'
  },
  5: {
    room: 1,
    type: 'color_match',
    timeLimit: 25000,
    bonusMultiplier: 1.3
  },
  // ... levels 6-12
};

export const PuzzleTypes = {
  SWITCH_SEQUENCE: 'switch_sequence',
  TIMED_TARGETS: 'timed_targets',
  COLOR_MATCH: 'color_match'
};
```

#### Structure - Part 2: Target Puzzles
```javascript
export const TargetPuzzleConfigs = {
  level1_targets: {
    levelNumber: 1,
    type: 'sequence',
    difficulty: 'easy',
    targets: [
      {
        targetId: 'target_1_1',
        position: { x: -3, y: 2, z: 5 },  // POSITIVE Z (in front of camera)
        color: 0x00ff00,  // Green
        size: 0.8,
        requiresSequence: true,
        sequenceNumber: 1
      },
      {
        targetId: 'target_1_2',
        position: { x: 0, y: 2.5, z: 5 },
        color: 0xffff00,  // Yellow
        size: 0.8,
        requiresSequence: true,
        sequenceNumber: 2
      },
      {
        targetId: 'target_1_3',
        position: { x: 3, y: 2, z: 5 },
        color: 0xff0000,  // Red
        size: 0.8,
        requiresSequence: true,
        sequenceNumber: 3
      }
    ]
  },
  level2_targets: {
    // 4-target diamond formation
  },
  level3_targets: {
    // 5-target pentagon formation
  }
};
```

#### Puzzle Fields
| Field | Type | Description |
|-------|------|-------------|
| `room` | number | Which room (0 or 1) |
| `type` | string | Puzzle mechanic type |
| `timeLimit` | number | Milliseconds to solve |
| `bonusMultiplier` | number | Score multiplier on success |
| `description` | string | Player-facing instructions |

#### Target Fields
| Field | Type | Description |
|-------|------|-------------|
| `position` | object | **POSITIVE Z** (e.g., z: 5) |
| `color` | hex | Three.js color code |
| `size` | number | Radius in units |
| `sequenceNumber` | number | Order to shoot |

#### Consumed By
- **InteractivePuzzle.jsx**: Loads puzzle config
- **PuzzleManager.jsx**: Manages puzzle state
- **PuzzleDisplay.jsx**: Shows UI timer and instructions
- **PuzzleHintDisplay.jsx**: Shows hints if stuck

#### Key Points
- Not all levels have puzzles (only levels 1, 4-12)
- Puzzle targets at **POSITIVE Z** (opposite of enemies)
- Failure has no penalty (no damage)
- Success awards score bonus

---

## Game Configuration Files

### 6. weaponStats.js

**Path:** `src/data/weaponStats.js`
**Lines:** 216
**Purpose:** Complete weapon statistics and upgrade tiers

#### Structure
```javascript
export const WeaponStats = {
  pistol: {
    name: 'Standard Pistol',
    damage: 25,
    fireRate: 0.5,           // Seconds between shots
    reloadTime: 1.5,
    accuracy: 0.85,          // 0.0 to 1.0
    range: 100,
    ammo: Infinity,          // Magazine size
    reserve: Infinity,       // Reserve ammo
    unlocked: true,          // Default weapon

    // Upgrade tiers
    upgrades: {
      damage: {
        tier1: { cost: 100, value: 30 },
        tier2: { cost: 250, value: 35 },
        tier3: { cost: 500, value: 40 }
      },
      fireRate: {
        tier1: { cost: 150, value: 0.4 },
        tier2: { cost: 300, value: 0.3 },
        tier3: { cost: 600, value: 0.2 }
      },
      accuracy: {
        tier1: { cost: 100, value: 0.90 },
        tier2: { cost: 200, value: 0.95 },
        tier3: { cost: 400, value: 0.98 }
      }
    }
  },

  shotgun: {
    name: 'Combat Shotgun',
    damage: 15,              // Per pellet
    pelletCount: 8,          // Total damage: 15 × 8 = 120
    fireRate: 1.0,
    reloadTime: 2.5,
    accuracy: 0.6,           // Wide spread
    range: 30,
    spread: 0.3,             // Pellet spread angle
    ammo: 8,
    reserve: 32,
    unlocked: false,         // Needs pickup
    // ... upgrades
  },

  rapidfire: {
    name: 'Rapid Fire Rifle',
    damage: 10,
    fireRate: 0.1,           // Very fast
    reloadTime: 2.0,
    accuracy: 0.75,
    range: 80,
    ammo: 50,
    reserve: 200,
    heatMechanic: true,      // Special mechanic
    overheatThreshold: 30,   // Shots before overheat
    cooldownTime: 3.0,
    unlocked: false
  },

  grappling: {
    name: 'Grappling Arm',
    damage: 0,               // No damage, utility
    fireRate: 2.0,
    pullForce: 50,           // Pull strength
    range: 40,
    ammo: Infinity,
    unlocked: false,
    special: 'pull_enemies_and_terrain'
  },

  bomb_explosive: {
    name: 'Explosive Bomb',
    damage: 100,
    explosionRadius: 8,
    fireRate: 3.0,
    ammo: 1,                 // Single use per level
    reserve: 1,
    unlocked: false,
    special: 'area_damage'
  },

  // bomb_ice, bomb_water, bomb_fire (similar structure)
};

export const WeaponTypes = {
  PISTOL: 'pistol',
  SHOTGUN: 'shotgun',
  RAPIDFIRE: 'rapidfire',
  GRAPPLING: 'grappling',
  BOMB_EXPLOSIVE: 'bomb_explosive',
  BOMB_ICE: 'bomb_ice',
  BOMB_WATER: 'bomb_water',
  BOMB_FIRE: 'bomb_fire'
};
```

#### Consumed By
- **WeaponController.jsx**: Switches weapons, manages ammo
- **UnifiedCombatSystem.jsx**: Calculates damage on hit
- **WeaponSystem.js**: Weapon behavior logic
- **WeaponUpgradeShop.jsx**: Shows upgrade costs and benefits
- **AmmoCounter.jsx**: Displays current/reserve ammo

#### Key Points
- Pistol and Grappling have infinite ammo
- Shotgun damage is per-pellet (multiply by pelletCount)
- Rapidfire has overheat mechanic
- Bombs are single-use per level
- Upgrades cost currency earned from levels

---

### 7. gameConfig.js

**Path:** `src/data/gameConfig.js`
**Lines:** 217
**Purpose:** Global game settings, difficulty modifiers, environment themes

#### Structure
```javascript
export const gameConfig = {
  // Performance
  performance: {
    targetFPS: 60,
    maxEnemies: 50,
    maxParticles: 200,
    particleDensity: 1.0
  },

  // Player stats
  player: {
    maxHealth: 100,
    maxLives: 3,
    startingWeapon: 'pistol',
    baseSpeed: 1.0
  },

  // Combat settings
  combat: {
    baseAccuracy: 0.85,
    headShotMultiplier: 2.0,
    criticalHitChance: 0.1,
    criticalHitMultiplier: 1.5,
    comboTimeout: 3000,      // Milliseconds
    comboMultipliers: [1, 2, 3, 5, 10]  // 1x, 2x, 3x, 5x, 10x
  },

  // Scoring
  scoring: {
    enemyKill: 100,
    headshot: 50,
    combo: 25,
    accuracyBonus: 0.5,      // Per percentage point
    timeBonus: 1.0,          // Per second remaining
    puzzleBonus: 500
  },

  // Environment themes
  environments: {
    urban: {
      name: 'Urban City',
      skybox: 'urban_sky',
      lighting: 'day',
      fogColor: 0x87ceeb,
      groundColor: 0x666666
    },
    jungle: {
      name: 'Dense Jungle',
      skybox: 'jungle_sky',
      lighting: 'dusk',
      fogColor: 0x3a5f3a,
      groundColor: 0x2d4a2d
    },
    space: {
      name: 'Space Station',
      skybox: 'space_sky',
      lighting: 'artificial',
      fogColor: 0x000011,
      groundColor: 0x222244
    },
    haunted: {
      name: 'Haunted Mansion',
      skybox: 'night_sky',
      lighting: 'dark',
      fogColor: 0x2a1a3a,
      groundColor: 0x1a0a1a
    },
    western: {
      name: 'Western Town',
      skybox: 'desert_sky',
      lighting: 'sunset',
      fogColor: 0xff6644,
      groundColor: 0xccaa66
    }
  },

  // Difficulty modifiers
  difficulty: {
    easy: {
      enemyHealthMultiplier: 0.7,
      enemyDamageMultiplier: 0.5,
      playerDamageMultiplier: 1.5,
      timeLimitMultiplier: 1.5
    },
    normal: {
      enemyHealthMultiplier: 1.0,
      enemyDamageMultiplier: 1.0,
      playerDamageMultiplier: 1.0,
      timeLimitMultiplier: 1.0
    },
    hard: {
      enemyHealthMultiplier: 1.5,
      enemyDamageMultiplier: 1.5,
      playerDamageMultiplier: 0.7,
      timeLimitMultiplier: 0.75
    }
  },

  // Audio settings (currently disabled)
  audio: {
    masterVolume: 0,         // Disabled
    sfxVolume: 0,
    musicVolume: 0,
    enabled: false
  },

  // Debug flags
  debug: {
    showEnemyHealth: false,
    showHitboxes: false,
    showCameraPath: false,
    godMode: false,
    unlockAllLevels: false
  }
};
```

#### Consumed By
- **GameEngine.js**: Uses performance settings
- **GameContext.jsx**: Initializes player stats
- **UnifiedCombatSystem.jsx**: Uses combat settings (headshot multiplier, combo)
- **ScoringSystem.js**: Calculates score based on scoring config
- **EnvironmentSystem.js**: Loads environment themes
- **SettingsSystem.js**: Saves/loads settings
- **DifficultySelector.jsx**: Applies difficulty modifiers

#### Key Points
- Single source of truth for game constants
- Easy to balance game (change values here)
- Debug flags for development
- Audio disabled (as per spec)

---

### 8. bossConfigs.js

**Path:** `src/data/bossConfigs.js`
**Lines:** ~150
**Purpose:** Boss enemy definitions with phases and special attacks

#### Structure
```javascript
export const BossConfigs = {
  level3_boss: {
    id: 'titan_enforcer',
    name: 'TITAN ENFORCER',
    level: 3,
    health: 350,
    maxHealth: 350,

    phases: [
      {
        phaseNumber: 1,
        healthThreshold: 1.0,
        attackPattern: ['basic_shot', 'heavy_shot'],
        attackInterval: 3500,
        moveSpeed: 0.5
      }
    ],

    specialAttacks: [
      {
        name: 'heavy_shot',
        damage: 30,
        cooldown: 8000,
        animation: 'windup_shot'
      }
    ],

    weakpoints: [
      {
        position: { x: 0, y: 2, z: 0 },  // Relative to boss
        damageMultiplier: 1.5,
        size: 0.5
      }
    ],

    introSequence: {
      duration: 5000,
      cameraAnimation: 'pan_to_boss',
      dialogue: 'Face the might of the Titan Enforcer!'
    },

    defeatRewards: {
      score: 5000,
      currency: 500,
      unlocks: ['level_4']
    }
  },

  level6_boss: {
    id: 'shadow_reaper',
    name: 'SHADOW REAPER',
    level: 6,
    health: 500,
    phases: [
      {
        phaseNumber: 1,
        healthThreshold: 1.0,
        attackPattern: ['basic_shot', 'teleport', 'clone']
      },
      {
        phaseNumber: 2,
        healthThreshold: 0.5,
        attackPattern: ['rapid_shot', 'teleport_strike', 'clone_army']
      }
    ],
    // ... more config
  },

  level9_boss: {
    id: 'plasma_warden',
    name: 'PLASMA WARDEN',
    level: 9,
    health: 750,
    phases: 3  // 3-phase boss
  },

  level12_boss: {
    id: 'the_architect',
    name: 'THE ARCHITECT',
    level: 12,
    health: 1000,
    phases: 4,  // Final boss, 4 phases
    specialAttacks: ['laser_barrage', 'missile_swarm', 'teleport_strike']
  }
};
```

#### Consumed By
- **UnifiedRoomManager.jsx**: Spawns boss with special properties
- **BossSystem.js**: Manages boss AI and phases
- **BossHealthBar.jsx**: Displays boss health and phases
- **BossIntroSequence.jsx**: Plays intro cinematic
- **LevelManager.jsx**: Unlocks next level on boss defeat

#### Key Points
- 4 boss levels: 3, 6, 9, 12
- Multi-phase bosses get harder as health decreases
- Each boss has unique special attacks
- Weakpoints take extra damage

---

## Type Definition Files

### 9. game.js (Types)

**Path:** `src/types/game.js`
**Purpose:** Game state constants and type definitions

```javascript
export const GameStates = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER',
  LEVEL_COMPLETE: 'LEVEL_COMPLETE',
  LOADING: 'LOADING'
};

export const PlayerStats = {
  health: 100,
  maxHealth: 100,
  lives: 3,
  score: 0,
  accuracy: 0,
  level: 1
};

export const DifficultyLevels = {
  EASY: 'easy',
  NORMAL: 'normal',
  HARD: 'hard',
  NIGHTMARE: 'nightmare'
};
```

**Consumed By:** All components that use game state

---

### 10. enemies.js (Types)

**Path:** `src/types/enemies.js`
**Purpose:** Enemy type constants

```javascript
export const EnemyTypes = {
  BASIC: 'basic',
  ARMORED: 'armored',
  NINJA: 'ninja',
  BOMB_THROWER: 'bomb_thrower',
  FAST_DEBUFFER: 'fast_debuffer',
  BOSS: 'boss'
};

export const EnemyStats = {
  basic: {
    baseHealth: 50,
    baseDamage: 10,
    speed: 1.0,
    size: 1.0
  },
  armored: {
    baseHealth: 150,
    baseDamage: 15,
    speed: 0.5,
    size: 1.5
  },
  // ... etc
};
```

**Consumed By:** UnifiedRoomManager, EnemyAISystem

---

### 11. weapons.js, items.js, levels.js (Types)

Similar constant definitions for weapons, items, and levels.

---

## Data Flow Diagrams

### Level Loading Flow

```
User Selects Level
       ↓
GameContext.dispatch({ type: 'SET_LEVEL', level: 3 })
       ↓
LevelManager.loadLevel(3)
       ↓
       ├─→ getLevelRooms(3)  ← levelRooms.js
       │    └─→ Returns: [room_1, room_2]
       │
       ├─→ LevelItems.level3  ← levelItems.js
       │    └─→ Returns: [item1, item2, ...]
       │
       └─→ getPuzzleForLevel(3)  ← puzzleConfigs.js
            └─→ Returns: puzzle config or null
       ↓
LevelManager.loadRoom(room_1)
       ↓
       ├─→ UnifiedRoomManager.loadRoom(room_1)
       │    ├─→ room.enemyLayout → spawn enemies
       │    └─→ room.weaponPickups → spawn pickups
       │
       ├─→ EnvironmentSystem.loadEnvironment(room.theme)
       │    └─→ gameConfig.environments[theme] → set skybox/fog
       │
       ├─→ UnifiedMovementController.setPath(room.cameraPath)
       │    └─→ roomConfigs.cameraPath → camera movement
       │
       └─→ ItemManager.spawnItems(LevelItems.level3)
            └─→ Place items in scene
```

### Combat/Shooting Flow

```
Player Clicks Mouse
       ↓
UnifiedCombatSystem.handleShoot()
       ↓
       ├─→ Get current weapon from GameContext
       │    └─→ player.currentWeapon → 'pistol'
       │
       ├─→ Get weapon stats
       │    └─→ WeaponStats[currentWeapon]  ← weaponStats.js
       │         └─→ damage: 25, fireRate: 0.5, accuracy: 0.85
       │
       ├─→ Perform raycasting
       │    └─→ Detect enemy hit
       │
       ├─→ Calculate damage
       │    ├─→ Base damage from weaponStats.js
       │    ├─→ Headshot multiplier from gameConfig.js (2.0x)
       │    └─→ Combo multiplier from ComboSystem
       │         └─→ gameConfig.combat.comboMultipliers
       │
       └─→ Apply damage to enemy
            ├─→ enemy.takeDamage(finalDamage)
            ├─→ Update score (ScoringSystem.calculate())
            │    └─→ gameConfig.scoring.enemyKill + bonuses
            └─→ If enemy dead, dispatch ENEMY_DEFEATED
```

### Weapon Unlock Flow

```
Player Collects Weapon Pickup
       ↓
WeaponPickup.onCollect()
       ↓
GameContext.dispatch({ type: 'UNLOCK_WEAPON', weapon: 'shotgun' })
       ↓
GameContext Reducer
       ↓
       ├─→ Add 'shotgun' to player.unlockedWeapons[]
       ├─→ Set initial ammo from weaponStats.js
       │    └─→ WeaponStats.shotgun.ammo → 8
       │    └─→ WeaponStats.shotgun.reserve → 32
       └─→ Show notification
            └─→ NotificationDisplay: "Shotgun Unlocked!"
       ↓
WeaponController updates UI
       └─→ Shotgun now selectable (key 2)
```

---

## File Dependency Graph

```
gameConfig.js (root config)
    ↓
    ├─→ Used by: GameEngine.js
    ├─→ Used by: DifficultySelector.jsx
    ├─→ Used by: EnvironmentSystem.js
    ├─→ Used by: ScoringSystem.js
    └─→ Used by: CombatSystem

weaponStats.js
    ↓
    ├─→ Used by: WeaponController.jsx
    ├─→ Used by: UnifiedCombatSystem.jsx
    ├─→ Used by: WeaponSystem.js
    ├─→ Used by: WeaponUpgradeShop.jsx
    └─→ Used by: AmmoCounter.jsx

levelRooms.js (CRITICAL)
    ↓
    ├─→ Used by: LevelManager.jsx
    ├─→ Used by: UnifiedRoomManager.jsx (enemy spawning)
    └─→ Used by: WeaponPickup.jsx

levelItems.js
    ↓
    ├─→ Used by: ItemManager (spawning items)
    ├─→ Used by: ItemSystem.js
    └─→ Used by: ProgressionSystem.js (key items)

puzzleConfigs.js
    ↓
    ├─→ Used by: InteractivePuzzle.jsx
    ├─→ Used by: PuzzleManager.jsx
    ├─→ Used by: PuzzleDisplay.jsx
    └─→ Used by: PuzzleHintDisplay.jsx

bossConfigs.js
    ↓
    ├─→ Used by: UnifiedRoomManager.jsx (boss spawning)
    ├─→ Used by: BossSystem.js
    ├─→ Used by: BossHealthBar.jsx
    └─→ Used by: BossIntroSequence.jsx

roomConfigs.js
    ↓
    ├─→ Used by: LevelManager.jsx
    ├─→ Used by: UnifiedMovementController.jsx (camera paths)
    └─→ Used by: EnvironmentSystem.js

Types (game.js, enemies.js, etc.)
    ↓
    └─→ Used by: ALL components (type checking)
```

---

## Quick Lookup Tables

### "I need to change enemy spawn positions"
**File:** `src/data/levelRooms.js`
**Line:** Level 1 = 14-16, Level 2 = 44-48, etc.
**Structure:** `enemyLayout[].position = { x, y, z }`

### "I need to change weapon damage"
**File:** `src/data/weaponStats.js`
**Line:** Pistol = ~10, Shotgun = ~30, etc.
**Field:** `WeaponStats[weaponType].damage`

### "I need to change enemy health"
**Option 1 (Per-enemy):** `src/data/levelRooms.js` → `enemyLayout[].health`
**Option 2 (Global):** `src/data/gameConfig.js` → `difficulty.easy.enemyHealthMultiplier`

### "I need to add a new item to a level"
**File:** `src/data/levelItems.js`
**Section:** `LevelItems.level3 = [ ... ]`
**Add:** `{ type: 'health', subType: 'small', position: {...}, value: 25 }`

### "I need to change puzzle time limit"
**File:** `src/data/puzzleConfigs.js`
**Section:** `PuzzleConfigs[levelNumber]`
**Field:** `timeLimit` (in milliseconds)

### "I need to change headshot multiplier"
**File:** `src/data/gameConfig.js`
**Line:** ~45
**Field:** `combat.headShotMultiplier`

### "I need to change max enemies on screen"
**File:** `src/data/gameConfig.js`
**Line:** ~15
**Field:** `performance.maxEnemies`

### "I need to add a new boss"
**File:** `src/data/bossConfigs.js`
**Add:** New boss config object
**Also Update:** `src/data/levelRooms.js` → Add boss to level's enemyLayout with `isBoss: true`

---

## Data File Maintenance Checklist

When adding new content:

### Adding a New Level
- [ ] Add to `levelRooms.js` (2 rooms)
- [ ] Add to `levelItems.js` (6-10 items)
- [ ] (Optional) Add to `puzzleConfigs.js`
- [ ] (Optional) Add boss to `bossConfigs.js`
- [ ] Update `gameConfig.environments` if new theme

### Adding a New Enemy Type
- [ ] Add to `types/enemies.js` constants
- [ ] Add to `levelRooms.js` enemy layouts
- [ ] Add behavior to `EnemyAISystem.js`

### Adding a New Weapon
- [ ] Add to `weaponStats.js` with full stats
- [ ] Add to `types/weapons.js` constants
- [ ] Add pickup to `levelRooms.js` weapon pickups
- [ ] Update `WeaponController.jsx` key bindings

### Balancing the Game
- [ ] Adjust enemy health in `levelRooms.js`
- [ ] Adjust weapon damage in `weaponStats.js`
- [ ] Adjust difficulty multipliers in `gameConfig.js`
- [ ] Adjust scoring in `gameConfig.scoring`

---

**End of Data Structure Map**

**See Also:**
- COMPONENT_REFERENCE.md - Which components read which data
- POSITIONING_GUIDE.md - Position values explained
- QUICK_REFERENCE.md - Debugging based on data issues
- ARCHITECTURE_DECISIONS.md - Why data-driven design
