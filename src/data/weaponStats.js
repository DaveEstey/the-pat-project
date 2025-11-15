// Weapon statistics and configuration
export const WeaponStats = {
  pistol: {
    id: 'pistol',
    name: 'Standard Pistol',
    type: 'primary',
    damage: 25,
    fireRate: 2.0, // shots per second
    reloadTime: 1.5, // seconds
    accuracy: 0.90,
    range: 100, // meters
    ammoType: 'pistol',
    maxAmmo: Infinity,
    recoil: {
      horizontal: 0.5,
      vertical: 1.0,
      recovery: 0.8
    },
    projectile: {
      speed: 500, // m/s
      drop: 0.1,
      penetration: 1
    },
    upgrade: {
      damage: [25, 30, 35, 45],
      accuracy: [0.90, 0.92, 0.95, 0.98],
      fireRate: [2.0, 2.2, 2.5, 3.0],
      reloadTime: [1.5, 1.3, 1.1, 0.9]
    }
  },

  shotgun: {
    id: 'shotgun',
    name: 'Combat Shotgun',
    type: 'primary',
    damage: 80, // per pellet
    fireRate: 0.8,
    reloadTime: 2.5,
    accuracy: 0.70,
    range: 30,
    ammoType: 'shotgun',
    maxAmmo: 50,
    special: {
      pelletCount: 8,
      spread: 15, // degrees
      damageDropoff: 0.8 // per 10 meters
    },
    recoil: {
      horizontal: 2.0,
      vertical: 3.0,
      recovery: 0.6
    },
    upgrade: {
      damage: [80, 90, 100, 120],
      pelletCount: [8, 9, 10, 12],
      spread: [15, 13, 11, 8],
      reloadTime: [2.5, 2.2, 1.9, 1.5]
    }
  },

  rapidfire: {
    id: 'rapidfire',
    name: 'Rapid Fire Rifle',
    type: 'primary',
    damage: 15,
    fireRate: 8.0,
    reloadTime: 2.0,
    accuracy: 0.80,
    range: 80,
    ammoType: 'rapidfire',
    maxAmmo: 200,
    special: {
      overheat: true,
      overheatThreshold: 30, // shots before overheat
      overheatCooldown: 3.0, // seconds
      accuracyDegradation: 0.02 // per shot in burst
    },
    recoil: {
      horizontal: 0.3,
      vertical: 0.5,
      recovery: 0.9,
      climb: 0.1 // per shot
    },
    upgrade: {
      damage: [15, 18, 22, 28],
      fireRate: [8.0, 9.0, 10.5, 12.0],
      overheatThreshold: [30, 35, 40, 50],
      accuracy: [0.80, 0.82, 0.85, 0.88]
    }
  },

  grappling: {
    id: 'grappling',
    name: 'Grappling Arm',
    type: 'special',
    damage: 50,
    fireRate: 1.0,
    reloadTime: 1.0,
    accuracy: 0.95,
    range: 50,
    ammoType: 'grappling',
    maxAmmo: Infinity,
    special: {
      pullForce: 100,
      hookSpeed: 20, // m/s
      maxPullTime: 2.0, // seconds
      enemyStun: 1.5, // seconds
      terrainInteraction: true
    },
    upgrade: {
      damage: [50, 60, 75, 100],
      range: [50, 60, 75, 100],
      pullForce: [100, 120, 150, 200],
      enemyStun: [1.5, 1.8, 2.2, 3.0]
    }
  },

  bombExplosive: {
    id: 'bombExplosive',
    name: 'Explosive Bomb',
    type: 'consumable',
    damage: 150,
    fireRate: 0.5,
    reloadTime: 0,
    accuracy: 0.75,
    range: 25,
    ammoType: 'bomb',
    maxAmmo: 3,
    special: {
      explosionRadius: 8, // meters
      splashDamage: 0.7, // multiplier for splash damage
      timer: 2.0, // seconds before explosion
      bounces: 1
    }
  },

  bombIce: {
    id: 'bombIce',
    name: 'Ice Bomb',
    type: 'consumable',
    damage: 75,
    fireRate: 0.5,
    reloadTime: 0,
    accuracy: 0.75,
    range: 25,
    ammoType: 'bomb',
    maxAmmo: 3,
    special: {
      explosionRadius: 10,
      freezeDuration: 5.0, // seconds
      slowEffect: 0.3, // movement speed multiplier
      shatterDamage: 100 // extra damage to frozen enemies
    }
  },

  bombWater: {
    id: 'bombWater',
    name: 'Water Bomb',
    type: 'consumable',
    damage: 50,
    fireRate: 0.5,
    reloadTime: 0,
    accuracy: 0.75,
    range: 25,
    ammoType: 'bomb',
    maxAmmo: 3,
    special: {
      explosionRadius: 12,
      extinguishFire: true,
      shortCircuit: true, // extra damage to electronic enemies
      conductivity: 2.0, // chain lightning effect
      cleansingEffect: true // removes debuffs from player
    }
  },

  bombFire: {
    id: 'bombFire',
    name: 'Fire Bomb',
    type: 'consumable',
    damage: 100,
    fireRate: 0.5,
    reloadTime: 0,
    accuracy: 0.75,
    range: 25,
    ammoType: 'bomb',
    maxAmmo: 3,
    special: {
      explosionRadius: 6,
      burnDuration: 8.0, // seconds
      burnDamage: 15, // damage per second
      spreadRadius: 3, // fire spread to nearby enemies
      meltIce: true // melts ice obstacles
    }
  }
};

// Weapon unlock requirements
export const WeaponUnlocks = {
  pistol: { level: 1, required: true },
  shotgun: { level: 2, accuracy: 0.6 },
  rapidfire: { level: 4, kills: 100 },
  grappling: { level: 3, puzzlesSolved: 5 },
  bombExplosive: { level: 5, bossesKilled: 1 },
  bombIce: { level: 6, secretsFound: 3 },
  bombWater: { level: 7, perfectLevels: 2 },
  bombFire: { level: 8, comboRecord: 50 }
};

// Weapon upgrade costs (in game currency/points)
export const WeaponUpgradeCosts = {
  tier1: 1000,
  tier2: 2500,
  tier3: 5000
};

export default WeaponStats;