export const EnemyTypes = {
  BASIC_SHOOTER: 'basic_shooter',
  ARMORED: 'armored',
  NINJA: 'ninja',
  BOMB_THROWER: 'bomb_thrower',
  FAST_DEBUFFER: 'fast_debuffer',
  BOSS: 'boss'
};

export const EnemyStats = {
  basic_shooter: {
    health: 50,
    damage: 20,
    speed: 1.0,
    fireRate: 1.5,
    accuracy: 0.7,
    points: 100
  },
  armored: {
    health: 120,
    damage: 35,
    speed: 0.6,
    fireRate: 2.0,
    accuracy: 0.8,
    points: 200,
    armor: 0.5
  },
  ninja: {
    health: 30,
    damage: 40,
    speed: 2.5,
    fireRate: 0.8,
    accuracy: 0.9,
    points: 150,
    stealth: true
  },
  bomb_thrower: {
    health: 80,
    damage: 50,
    speed: 0.8,
    fireRate: 3.0,
    accuracy: 0.6,
    points: 175,
    areaEffect: true
  },
  fast_debuffer: {
    health: 40,
    damage: 15,
    speed: 3.0,
    fireRate: 0.5,
    accuracy: 0.5,
    points: 125,
    debuffType: 'speed'
  },
  boss: {
    health: 500,
    damage: 75,
    speed: 1.2,
    fireRate: 2.5,
    accuracy: 0.9,
    points: 1000,
    armor: 0.3,
    multiPhase: true
  }
};

export const EnemyStates = {
  IDLE: 'idle',
  PATROL: 'patrol',
  ALERT: 'alert',
  ATTACKING: 'attacking',
  STUNNED: 'stunned',
  DEAD: 'dead'
};