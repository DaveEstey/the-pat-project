// Main game configuration
export const GameConfig = {
  // Performance settings
  performance: {
    targetFPS: 60,
    maxParticles: 1000,
    maxEnemies: 50,
    drawDistance: 200,
    lodDistance: 100
  },
  
  // Player settings
  player: {
    maxHealth: 100,
    maxLives: 3,
    movementSpeed: 5.0,
    aimSensitivity: 1.0,
    reloadSpeed: 1.0
  },
  
  
  // Combat settings
  combat: {
    baseAccuracy: 0.85,
    headShotMultiplier: 2.0,
    criticalHitChance: 0.15,
    invulnerabilityTime: 1.5, // seconds after taking damage
    enemyDamageReduction: 0.1 // per difficulty level
  },
  
  // Scoring system
  scoring: {
    baseKillScore: 100,
    accuracyBonus: 50,
    speedBonus: 25,
    comboMultiplier: 1.5,
    comboTimeWindow: 3.0, // seconds
    itemCollectionScore: 50,
    puzzleCompletionScore: 200,
    timeBonus: 10 // per second remaining
  },
  
  // Level progression
  levels: {
    totalLevels: 12,
    unlockThreshold: 0.7, // completion percentage to unlock next level
    starRequirements: [0.6, 0.8, 0.95], // accuracy thresholds for stars
    branchingPoints: [0.25, 0.5, 0.75] // progress points where branching occurs
  },
  
  // Weapon balance
  weapons: {
    pistol: {
      damage: 25,
      fireRate: 2.0, // shots per second
      reloadTime: 1.5,
      accuracy: 0.9,
      range: 100,
      ammo: Infinity
    },
    shotgun: {
      damage: 80,
      fireRate: 0.8,
      reloadTime: 2.5,
      accuracy: 0.7,
      range: 30,
      spread: 15, // degrees
      pellets: 8
    },
    rapidfire: {
      damage: 15,
      fireRate: 8.0,
      reloadTime: 2.0,
      accuracy: 0.8,
      range: 80,
      overheat: true,
      overheatTime: 3.0
    },
    grappling: {
      damage: 50,
      fireRate: 1.0,
      reloadTime: 1.0,
      accuracy: 0.95,
      range: 50,
      pullForce: 100,
      ammo: Infinity
    }
  },
  
  // Enemy types
  enemies: {
    basicShooter: {
      health: 50,
      damage: 15,
      fireRate: 1.5,
      accuracy: 0.6,
      speed: 2.0,
      score: 100
    },
    armoredEnemy: {
      health: 120,
      damage: 25,
      fireRate: 1.0,
      accuracy: 0.7,
      speed: 1.5,
      armor: 0.5, // damage reduction
      score: 200
    },
    ninja: {
      health: 40,
      damage: 35,
      fireRate: 0,
      accuracy: 0.8,
      speed: 6.0,
      stealth: true,
      dashDistance: 10,
      score: 150
    },
    bombThrower: {
      health: 70,
      damage: 40,
      fireRate: 0.5,
      accuracy: 0.5,
      speed: 1.8,
      explosionRadius: 8,
      score: 175
    },
    fastDebuffer: {
      health: 30,
      damage: 10,
      fireRate: 3.0,
      accuracy: 0.4,
      speed: 8.0,
      debuffDuration: 5.0,
      score: 125
    }
  },
  
  // Environment themes
  themes: {
    urban: {
      fogColor: 0x87CEEB,
      ambientColor: 0x404040,
      directionalColor: 0xffffff,
      skyboxUrl: '/models/environments/urban_skybox.hdr'
    },
    jungle: {
      fogColor: 0x228B22,
      ambientColor: 0x2F4F2F,
      directionalColor: 0xFFFFE0,
      skyboxUrl: '/models/environments/jungle_skybox.hdr'
    },
    space: {
      fogColor: 0x000011,
      ambientColor: 0x111133,
      directionalColor: 0xFFFFFF,
      skyboxUrl: '/models/environments/space_skybox.hdr'
    },
    haunted: {
      fogColor: 0x2F2F2F,
      ambientColor: 0x1a1a1a,
      directionalColor: 0x8B4513,
      skyboxUrl: '/models/environments/haunted_skybox.hdr'
    },
    western: {
      fogColor: 0xDEB887,
      ambientColor: 0x8B4513,
      directionalColor: 0xFFD700,
      skyboxUrl: '/models/environments/western_skybox.hdr'
    }
  },
  
  // Audio settings
  audio: {
    maxSimultaneousSounds: 32,
    dopplerEffect: true,
    spatialAudio: true,
    compressionThreshold: 0.8,
    masterVolume: 0.7,
    categories: {
      sfx: 0.8,
      music: 0.6,
      ambient: 0.4,
      ui: 0.9
    }
  },
  
  // UI settings
  ui: {
    hudScale: 1.0,
    crosshairSize: 24,
    hitMarkerDuration: 0.5,
    damageNumberDuration: 1.0,
    notificationDuration: 3.0,
    fadeTransitionTime: 0.3
  },
  
  // Input settings
  input: {
    mouseDeadZone: 0.05,
    analogStickDeadZone: 0.15,
    touchSensitivity: 1.2,
    gestureThreshold: 50, // pixels
    doubleTapTime: 300 // milliseconds
  },
  
  // Debug settings (development only)
  debug: {
    showFPS: false,
    showCollisionBoxes: false,
    showEnemyAI: false,
    godMode: false,
    unlockAllLevels: false,
    infiniteAmmo: false
  }
};

export default GameConfig;