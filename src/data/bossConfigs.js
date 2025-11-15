/**
 * Boss configurations for dramatic introductions
 * Each level can have a boss enemy with special intro sequence
 */

export const BossConfigs = {
  // Level 3 - First boss encounter
  level3_boss: {
    id: 'level3_boss',
    levelNumber: 3,
    roomIndex: 2, // Appears in final room (room 3)
    enemyType: 'boss',
    name: 'TITAN ENFORCER',
    subtitle: 'Heavy Assault Unit',
    category: 'MINI-BOSS',
    position: { x: 0, y: 0, z: 10 },
    health: 300,
    damage: 30,
    introEnabled: true
  },

  // Level 6 - Mid-game boss
  level6_boss: {
    id: 'level6_boss',
    levelNumber: 6,
    roomIndex: 2,
    enemyType: 'boss',
    name: 'SHADOW REAPER',
    subtitle: 'Elite Assassination Unit',
    category: 'BOSS',
    position: { x: 0, y: 0, z: 12 },
    health: 500,
    damage: 40,
    introEnabled: true
  },

  // Level 9 - Advanced boss
  level9_boss: {
    id: 'level9_boss',
    levelNumber: 9,
    roomIndex: 2,
    enemyType: 'boss',
    name: 'PLASMA WARDEN',
    subtitle: 'Advanced Combat AI',
    category: 'ELITE BOSS',
    position: { x: 0, y: 0, z: 15 },
    health: 750,
    damage: 50,
    introEnabled: true
  },

  // Level 12 - Final boss
  level12_boss: {
    id: 'level12_boss',
    levelNumber: 12,
    roomIndex: 2,
    enemyType: 'boss',
    name: 'THE ARCHITECT',
    subtitle: 'Supreme Commander',
    category: 'FINAL BOSS',
    position: { x: 0, y: 0, z: 20 },
    health: 1000,
    damage: 60,
    introEnabled: true
  }
};

/**
 * Get boss configuration for a specific level
 */
export function getBossConfig(levelNumber) {
  const configKey = `level${levelNumber}_boss`;
  return BossConfigs[configKey] || null;
}

/**
 * Check if level has a boss
 */
export function levelHasBoss(levelNumber) {
  return BossConfigs.hasOwnProperty(`level${levelNumber}_boss`);
}

/**
 * Get boss config for specific level and room
 */
export function getBossForRoom(levelNumber, roomIndex) {
  const boss = getBossConfig(levelNumber);
  if (boss && boss.roomIndex === roomIndex) {
    return boss;
  }
  return null;
}

/**
 * Boss intro animation settings
 */
export const BossIntroSettings = {
  ZOOM_DURATION: 2000,        // 2 seconds zoom in
  HOLD_DURATION: 2500,        // 2.5 seconds hold on boss
  RETURN_DURATION: 1500,      // 1.5 seconds return to player
  TOTAL_DURATION: 6000        // 6 seconds total intro
};

export default BossConfigs;
