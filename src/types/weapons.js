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

export const WeaponStats = {
  pistol: {
    damage: 25,
    fireRate: 0.5,
    reloadTime: 1.5,
    ammo: Infinity,
    maxAmmo: 12,
    accuracy: 0.9
  },
  shotgun: {
    damage: 60,
    fireRate: 1.0,
    reloadTime: 2.0,
    ammo: 50,
    maxAmmo: 8,
    accuracy: 0.7,
    spread: 5
  },
  rapidfire: {
    damage: 15,
    fireRate: 0.1,
    reloadTime: 2.5,
    ammo: 200,
    maxAmmo: 30,
    accuracy: 0.6
  },
  grappling: {
    damage: 30,
    fireRate: 0.8,
    reloadTime: 0,
    ammo: Infinity,
    maxAmmo: 1,
    accuracy: 1.0,
    range: 15
  }
};

export const BombStats = {
  [WeaponTypes.BOMB_EXPLOSIVE]: {
    damage: 100,
    radius: 10,
    effect: 'explosion'
  },
  [WeaponTypes.BOMB_ICE]: {
    damage: 50,
    radius: 8,
    effect: 'freeze',
    duration: 3000
  },
  [WeaponTypes.BOMB_WATER]: {
    damage: 30,
    radius: 12,
    effect: 'slow',
    duration: 5000
  },
  [WeaponTypes.BOMB_FIRE]: {
    damage: 80,
    radius: 6,
    effect: 'burn',
    duration: 4000
  }
};