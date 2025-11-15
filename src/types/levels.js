export const LevelThemes = {
  URBAN_CITY: 'urban_city',
  DENSE_JUNGLE: 'dense_jungle',
  SPACE_STATION: 'space_station',
  HAUNTED_HOUSE: 'haunted_house',
  WESTERN_TOWN: 'western_town'
};

export const LevelStates = {
  LOCKED: 'locked',
  UNLOCKED: 'unlocked',
  COMPLETED: 'completed',
  PERFECT: 'perfect'
};

export const PuzzleTypes = {
  SWITCH_SEQUENCE: 'switch_sequence',
  TERRAIN_MODIFIER: 'terrain_modifier',
  DOOR_MECHANISM: 'door_mechanism',
  PATH_SELECTOR: 'path_selector',
  TIMED_CHALLENGE: 'timed_challenge'
};

export const LevelStructure = {
  1: {
    id: 1,
    name: 'Urban Awakening',
    theme: LevelThemes.URBAN_CITY,
    difficulty: LevelDifficulty.EASY,
    duration: 300, // 5 minutes in seconds
    paths: [PathTypes.STRAIGHT, PathTypes.LEFT_BRANCH],
    enemies: ['basic_shooter', 'fast_debuffer'],
    items: ['health_pack', 'shotgun_shells'],
    puzzles: [PuzzleTypes.SWITCH_SEQUENCE],
    unlocks: ['level_2']
  },
  2: {
    id: 2,
    name: 'Concrete Jungle',
    theme: LevelThemes.URBAN_CITY,
    difficulty: LevelDifficulty.EASY,
    duration: 360,
    paths: [PathTypes.STRAIGHT, PathTypes.RIGHT_BRANCH, PathTypes.LEFT_BRANCH],
    enemies: ['basic_shooter', 'bomb_thrower'],
    items: ['red_keycard', 'rapid_fire_ammo'],
    puzzles: [PuzzleTypes.DOOR_MECHANISM],
    unlocks: ['level_3']
  },
  3: {
    id: 3,
    name: 'Jungle Infiltration',
    theme: LevelThemes.DENSE_JUNGLE,
    difficulty: LevelDifficulty.NORMAL,
    duration: 420,
    paths: [PathTypes.STRAIGHT, PathTypes.UP_BRANCH, PathTypes.DOWN_BRANCH],
    enemies: ['ninja', 'basic_shooter', 'fast_debuffer'],
    items: ['grappling_arm', 'damage_boost'],
    puzzles: [PuzzleTypes.TERRAIN_MODIFIER, PuzzleTypes.SWITCH_SEQUENCE],
    unlocks: ['level_4', 'secret_level_a']
  },
  4: {
    id: 4,
    name: 'Canopy Chase',
    theme: LevelThemes.DENSE_JUNGLE,
    difficulty: LevelDifficulty.NORMAL,
    duration: 480,
    paths: [PathTypes.STRAIGHT, PathTypes.LEFT_BRANCH],
    enemies: ['ninja', 'armored_enemy', 'bomb_thrower'],
    items: ['blue_keycard', 'health_boost'],
    puzzles: [PuzzleTypes.PATH_SELECTOR],
    unlocks: ['level_5']
  },
  5: {
    id: 5,
    name: 'Space Dock',
    theme: LevelThemes.SPACE_STATION,
    difficulty: LevelDifficulty.NORMAL,
    duration: 420,
    paths: [PathTypes.STRAIGHT, PathTypes.UP_BRANCH],
    enemies: ['armored_enemy', 'basic_shooter'],
    items: ['shield', 'rapid_fire_ammo'],
    puzzles: [PuzzleTypes.DOOR_MECHANISM, PuzzleTypes.TIME_GATE],
    unlocks: ['level_6']
  },
  6: {
    id: 6,
    name: 'Zero Gravity',
    theme: LevelThemes.SPACE_STATION,
    difficulty: LevelDifficulty.HARD,
    duration: 540,
    paths: [PathTypes.STRAIGHT, PathTypes.LEFT_BRANCH, PathTypes.RIGHT_BRANCH],
    enemies: ['fast_debuffer', 'bomb_thrower', 'armored_enemy'],
    items: ['double_damage', 'full_heal'],
    puzzles: [PuzzleTypes.TERRAIN_MODIFIER, PuzzleTypes.SWITCH_SEQUENCE],
    unlocks: ['level_7']
  },
  7: {
    id: 7,
    name: 'Haunted Entrance',
    theme: LevelThemes.HAUNTED_HOUSE,
    difficulty: LevelDifficulty.HARD,
    duration: 480,
    paths: [PathTypes.STRAIGHT, PathTypes.DOWN_BRANCH],
    enemies: ['ninja', 'fast_debuffer', 'basic_shooter'],
    items: ['health_pack', 'shotgun_shells'],
    puzzles: [PuzzleTypes.DOOR_MECHANISM],
    unlocks: ['level_8']
  },
  8: {
    id: 8,
    name: 'Manor of Shadows',
    theme: LevelThemes.HAUNTED_HOUSE,
    difficulty: LevelDifficulty.HARD,
    duration: 600,
    paths: [PathTypes.STRAIGHT, PathTypes.LEFT_BRANCH, PathTypes.UP_BRANCH],
    enemies: ['ninja', 'bomb_thrower', 'armored_enemy'],
    items: ['damage_boost', 'shield'],
    puzzles: [PuzzleTypes.PATH_SELECTOR, PuzzleTypes.TIME_GATE],
    unlocks: ['level_9']
  },
  9: {
    id: 9,
    name: 'Wild West Arrival',
    theme: LevelThemes.WESTERN_TOWN,
    difficulty: LevelDifficulty.HARD,
    duration: 420,
    paths: [PathTypes.STRAIGHT, PathTypes.RIGHT_BRANCH],
    enemies: ['basic_shooter', 'bomb_thrower'],
    items: ['rapid_fire_ammo', 'health_boost'],
    puzzles: [PuzzleTypes.SWITCH_SEQUENCE],
    unlocks: ['level_10']
  },
  10: {
    id: 10,
    name: 'Showdown Street',
    theme: LevelThemes.WESTERN_TOWN,
    difficulty: LevelDifficulty.HARD,
    duration: 540,
    paths: [PathTypes.STRAIGHT, PathTypes.LEFT_BRANCH, PathTypes.RIGHT_BRANCH],
    enemies: ['armored_enemy', 'ninja', 'fast_debuffer'],
    items: ['double_damage', 'full_heal'],
    puzzles: [PuzzleTypes.TERRAIN_MODIFIER, PuzzleTypes.DOOR_MECHANISM],
    unlocks: ['level_11']
  },
  11: {
    id: 11,
    name: 'Final Approach',
    theme: LevelThemes.SPACE_STATION,
    difficulty: LevelDifficulty.HARD,
    duration: 600,
    paths: [PathTypes.STRAIGHT],
    enemies: ['boss_enemy', 'armored_enemy', 'ninja'],
    items: ['shield', 'double_damage', 'full_heal'],
    puzzles: [PuzzleTypes.TIME_GATE, PuzzleTypes.SWITCH_SEQUENCE],
    unlocks: ['level_12']
  },
  12: {
    id: 12,
    name: 'Ultimate Confrontation',
    theme: LevelThemes.URBAN_CITY,
    difficulty: LevelDifficulty.HARD,
    duration: 720,
    paths: [PathTypes.STRAIGHT],
    enemies: ['boss_enemy'],
    items: ['all_available'],
    puzzles: [PuzzleTypes.PATH_SELECTOR, PuzzleTypes.TERRAIN_MODIFIER],
    unlocks: ['ending_a', 'ending_b', 'ending_c']
  }
};