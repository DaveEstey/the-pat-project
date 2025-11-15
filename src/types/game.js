export const GameStates = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER',
  LEVEL_COMPLETE: 'LEVEL_COMPLETE',
  LOADING: 'LOADING',
  SETTINGS: 'SETTINGS',
  LEVEL_SELECT: 'LEVEL_SELECT'
};

export const PlayerStats = {
  health: 100,
  maxHealth: 100,
  lives: 3,
  score: 0,
  accuracy: 0,
  level: 1,
  experience: 0,
  upgradePoints: 0,
  shotsFired: 0,
  shotsHit: 0
};

export const GameDifficulty = {
  EASY: 'easy',
  NORMAL: 'normal',
  HARD: 'hard',
  NIGHTMARE: 'nightmare'
};

export const GameModes = {
  STORY: 'story',
  ARCADE: 'arcade',
  TIME_ATTACK: 'time_attack'
};