/**
 * Secret Room configurations for different levels
 * Unlocked by completing puzzles or finding hidden triggers
 */

export const SecretRoomConfigs = {
  // Level 1 - Basic secret room with bonus points
  level1_secret: {
    id: 'level1_secret',
    levelNumber: 1,
    unlockCondition: 'puzzle_complete', // Unlocked by completing puzzle
    doorPosition: { x: 8, y: 1.75, z: 5 }, // Right side of room 2
    doorRotation: -Math.PI / 2, // Face left
    roomCenter: { x: 12, y: 0, z: 5 },
    description: 'Hidden Bonus Cache',
    rewards: [
      {
        type: 'points',
        value: 500,
        message: '+500 Bonus Points!'
      },
      {
        type: 'health',
        value: 25,
        message: 'Health restored!'
      }
    ]
  },

  // Level 2 - Weapon upgrade room
  level2_secret: {
    id: 'level2_secret',
    levelNumber: 2,
    unlockCondition: 'puzzle_complete',
    doorPosition: { x: -8, y: 1.75, z: 6 }, // Left side of room 2
    doorRotation: Math.PI / 2, // Face right
    roomCenter: { x: -12, y: 0, z: 6 },
    description: 'Armory Cache',
    rewards: [
      {
        type: 'weapon',
        weaponType: 'shotgun',
        ammo: 20,
        message: 'Shotgun acquired!'
      },
      {
        type: 'points',
        value: 750,
        message: '+750 Bonus Points!'
      }
    ]
  },

  // Level 3 - Special ability room
  level3_secret: {
    id: 'level3_secret',
    levelNumber: 3,
    unlockCondition: 'puzzle_complete',
    doorPosition: { x: 0, y: 1.75, z: 10 }, // Back wall of room 2
    doorRotation: Math.PI, // Face forward
    roomCenter: { x: 0, y: 0, z: 14 },
    description: 'Power Chamber',
    rewards: [
      {
        type: 'weapon',
        weaponType: 'rapidfire',
        ammo: 100,
        message: 'Rapid Fire unlocked!'
      },
      {
        type: 'health',
        value: 50,
        message: 'Full health restored!'
      },
      {
        type: 'points',
        value: 1000,
        message: '+1000 Bonus Points!'
      }
    ]
  },

  // Level 4 - Jungle treasure room
  level4_secret: {
    id: 'level4_secret',
    levelNumber: 4,
    unlockCondition: 'hidden_trigger',
    doorPosition: { x: 5, y: 1.75, z: -3 }, // Hidden behind foliage
    doorRotation: 0,
    roomCenter: { x: 5, y: 0, z: -7 },
    description: 'Ancient Ruins',
    rewards: [
      {
        type: 'points',
        value: 1200,
        message: 'Ancient treasure found!'
      },
      {
        type: 'passive_upgrade',
        upgradeType: 'damage_boost',
        value: 1.2,
        message: 'Damage increased by 20%!'
      }
    ]
  },

  // Level 5 - Space station research lab
  level5_secret: {
    id: 'level5_secret',
    levelNumber: 5,
    unlockCondition: 'puzzle_complete',
    doorPosition: { x: -6, y: 1.75, z: 8 },
    doorRotation: Math.PI / 4,
    roomCenter: { x: -10, y: 0, z: 12 },
    description: 'Research Laboratory',
    rewards: [
      {
        type: 'weapon',
        weaponType: 'grappling',
        message: 'Grappling Arm acquired!'
      },
      {
        type: 'points',
        value: 1500,
        message: 'Research data bonus!'
      }
    ]
  }
};

/**
 * Get secret room configuration for a level
 */
export function getSecretRoomConfig(levelNumber) {
  const configKey = `level${levelNumber}_secret`;
  return SecretRoomConfigs[configKey] || null;
}

/**
 * Check if level has a secret room
 */
export function levelHasSecretRoom(levelNumber) {
  return SecretRoomConfigs.hasOwnProperty(`level${levelNumber}_secret`);
}

/**
 * Get unlock condition for secret room
 */
export function getSecretRoomUnlockCondition(levelNumber) {
  const config = getSecretRoomConfig(levelNumber);
  return config ? config.unlockCondition : null;
}

/**
 * Reward types available in secret rooms
 */
export const SecretRoomRewardTypes = {
  POINTS: 'points',
  HEALTH: 'health',
  WEAPON: 'weapon',
  PASSIVE_UPGRADE: 'passive_upgrade',
  KEY_ITEM: 'key_item'
};

export default SecretRoomConfigs;
