# On-Rails Shooter Game - Complete Development Specification

## Project Overview

Create a 3D on-rails shooter game with puzzle elements, item collection, and branching narratives. Players navigate through levels automatically while aiming and shooting enemies, solving time-sensitive puzzles, and collecting items that unlock new areas and endings.

## Technology Stack

- **Frontend**: React 18 with JavaScript
- **3D Engine**: Three.js (r128)
- **Build Tool**: Vite
- **Package Manager**: npm
- **Node Version**: 20.17
- **Styling**: Tailwind CSS
- **State Management**: React Context + useReducer
- **Audio**: Disabled Web Audio API / Placeholder functions only
- **Storage**: localStorage for saves/settings

## Project Structure

```
game-project/
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── nginx.conf
├── docs/
│   ├── README.md
│   ├── GAME_DESIGN.md
│   ├── API_DOCUMENTATION.md
│   └── DEPLOYMENT.md
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── models/
│       ├── environments/
│       ├── characters/
│       ├── weapons/
│       └── items/
├── src/
│   ├── components/
│   │   ├── UI/
│   │   │   ├── HUD.jsx
│   │   │   ├── MainMenu.jsx
│   │   │   ├── LevelSelect.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── HealthBar.jsx
│   │   │   ├── ScoreDisplay.jsx
│   │   │   ├── WeaponSelector.jsx
│   │   │   └── PauseMenu.jsx
│   │   ├── Game/
│   │   │   ├── GameCanvas.jsx
│   │   │   ├── Player.jsx
│   │   │   ├── Camera.jsx
│   │   │   ├── Environment.jsx
│   │   │   ├── Enemies/
│   │   │   │   ├── BasicShooter.jsx
│   │   │   │   ├── ArmoredEnemy.jsx
│   │   │   │   ├── Ninja.jsx
│   │   │   │   ├── BombThrower.jsx
│   │   │   │   ├── FastDebuffer.jsx
│   │   │   │   └── BossEnemy.jsx
│   │   │   ├── Weapons/
│   │   │   │   ├── Pistol.jsx
│   │   │   │   ├── Shotgun.jsx
│   │   │   │   ├── RapidFire.jsx
│   │   │   │   ├── GrapplingArm.jsx
│   │   │   │   └── BombWeapons.jsx
│   │   │   ├── Items/
│   │   │   │   ├── Collectible.jsx
│   │   │   │   ├── PowerUp.jsx
│   │   │   │   ├── SpecialItem.jsx
│   │   │   │   └── KeyItem.jsx
│   │   │   ├── Puzzles/
│   │   │   │   ├── SwitchSequence.jsx
│   │   │   │   ├── TerrainModifier.jsx
│   │   │   │   ├── DoorMechanism.jsx
│   │   │   │   └── PathSelector.jsx
│   │   │   ├── Effects/
│   │   │   │   ├── ParticleSystem.jsx
│   │   │   │   ├── Explosions.jsx
│   │   │   │   ├── MuzzleFlash.jsx
│   │   │   │   └── HitEffects.jsx
│   │   │   └── Levels/
│   │   │       ├── Level01.jsx
│   │   │       ├── Level02.jsx
│   │   │       └── [... through Level12.jsx]
│   ├── hooks/
│   │   ├── useGameState.js
│   │   ├── useControls.js
│   │   ├── useAudio.js
│   │   ├── useInventory.js
│   │   ├── useScore.js
│   │   ├── useSaveSystem.js
│   │   └── useSettings.js
│   ├── systems/
│   │   ├── GameEngine.js
│   │   ├── PhysicsSystem.js
│   │   ├── CollisionSystem.js
│   │   ├── AISystem.js
│   │   ├── AudioSystem.js
│   │   ├── ParticleSystem.js
│   │   ├── SaveSystem.js
│   │   └── SettingsSystem.js
│   ├── data/
│   │   ├── levels/
│   │   │   ├── levelConfigs.js
│   │   │   ├── enemySpawns.js
│   │   │   ├── itemPlacements.js
│   │   │   └── puzzleDefinitions.js
│   │   ├── gameConfig.js
│   │   ├── weaponStats.js
│   │   ├── enemyStats.js
│   │   └── itemDefinitions.js
│   ├── utils/
│   │   ├── mathUtils.js
│   │   ├── gameUtils.js
│   │   ├── storageUtils.js
│   │   └── performanceUtils.js
│   ├── types/
│   │   ├── game.js
│   │   ├── enemies.js
│   │   ├── weapons.js
│   │   ├── items.js
│   │   └── levels.js
│   ├── contexts/
│   │   ├── GameContext.jsx
│   │   ├── AudioContext.jsx
│   │   └── SettingsContext.jsx
│   ├── styles/
│   │   ├── globals.css
│   │   └── components.css
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .gitignore
```

## Core Game Systems

### 1. Movement System
- **Auto-movement**: Variable speed based on context (exploration/combat/puzzle)
- **Path Selection**: Shoot arrows to choose branching paths
- **No manual movement**: Pure aiming and shooting focus

### 2. Weapon System
- **Basic Pistol**: Infinite ammo, reload mechanic
- **Special Weapons**: Finite ammo, resets per level
- **Grappling Arm**: Infinite use, interacts with enemies and terrain
- **Bomb Types**: Explosive, Ice, Water, Fire (single use, returns to inventory)
- **Weapon Switching**: Keyboard controls

### 3. Enemy AI System
- **Basic Shooter**: Standard ranged combat
- **Armored Enemy**: High health, heavy weapons
- **Ninja**: Fast, melee attacks, stealth
- **Bomb Thrower**: Area damage attacks
- **Fast Debuffer**: Speed-based passive debuffs
- **Boss Enemies**: Complex attack patterns, multiple phases
- **Spawn Triggers**: Location-based enemy activation

### 4. Puzzle System
- **Switch Sequences**: Timed button combinations
- **Terrain Modification**: Shoot/use items to alter environment
- **Door Mechanisms**: Key items and tool interactions
- **Time Pressure**: All puzzles have time constraints
- **No Penalties**: Wrong solutions don't cause damage

### 5. Item Collection System
- **Collection Methods**: Shoot items or automatic pickup
- **Inventory Types**:
  - Basic ammo (resets per level)
  - Special weapons (carry between levels)
  - Key items (permanent, unlock new areas)
  - Passive bonuses (permanent upgrades)
  - Situational items (used at specific moments)
- **Unlimited Storage**: No inventory limits

### 6. Level Structure System
- **Total Levels**: 12 levels
- **Duration**: 5-10 minutes each
- **Branching Paths**: Multiple routes through each level
- **Multiple Endings**: Based on player actions and items
- **Progressive Unlock**: Items unlock new areas and outcomes
- **Hidden Levels**: Don't show locked levels in selection

### 7. Progression System
- **Health System**: Health bar with lives and checkpoints
- **Scoring**: Accuracy + Speed + Items collected
- **Difficulty Scaling**: More enemies, faster movement, complex puzzles
- **Permanent Upgrades**: Character improvements between levels
- **Auto-save**: Automatic progress saving

## Environment Themes

1. **Urban City**: Skyscrapers, streets, rooftops
2. **Dense Jungle**: Vegetation, wildlife, ancient ruins
3. **Space Station**: Sci-fi corridors, zero-gravity sections
4. **Haunted House**: Gothic architecture, supernatural elements
5. **Western Town**: Saloon, desert, frontier buildings

## Visual Style Guidelines

- **Art Style**: Low-poly with cel-shading for clarity
- **Color Palette**: Bright, vibrant, cartoonish
- **UI Theme**: Colorful cartoon aesthetic matching game world
- **Clarity Focus**: Visual effects that enhance gameplay readability
- **Performance Target**: 60 FPS on modern devices

## Audio Requirements (DISABLED FOR DEVELOPMENT)

**IMPORTANT**: Audio system should be completely disabled for initial development phase. All audio-related functionality should use placeholder functions that do nothing.

### Audio System Implementation
- Create disabled audio utilities that log intended actions but don't play sounds
- Use placeholder functions for all audio calls
- Remove any actual audio file loading or Web Audio API usage
- Audio can be re-enabled later in development

## Control Scheme

### Desktop
- **Mouse**: Aim and shoot (left click)
- **Keyboard**: Weapon/item switching (1-9 keys)
- **ESC**: Pause menu
- **Tab**: Inventory display

### Mobile
- **Touch**: Tap to aim and shoot
- **Swipe**: Weapon switching
- **UI Buttons**: Settings and inventory access

## Performance Requirements

- **Target FPS**: 60 FPS
- **Platform Support**: Desktop and mobile browsers
- **Optimization**: Efficient 3D rendering and asset management
- **Loading**: Progressive asset loading for smooth gameplay

## Docker Configuration

- **Base Image**: Node 20.17-alpine
- **Ports**: 3000 (development), 80 (production)
- **Volumes**: Source code, assets, node_modules
- **Environment**: Development and production configurations

## Development Priorities

1. **Core Movement**: Rail system and camera following
2. **Basic Shooting**: Mouse aim, projectile physics
3. **Enemy AI**: Basic enemy types and behaviors
4. **Level Loading**: Environment rendering and progression
5. **Item System**: Collection and inventory management
6. **Puzzle Integration**: Time-sensitive interactive elements
7. **Audio Integration**: Sound effects and music
8. **UI Polish**: HUD, menus, and mobile optimization
9. **Save System**: Progress persistence
10. **Performance Optimization**: 60 FPS maintenance

## Critical Implementation Notes

### Audio System - DISABLED
**IMPORTANT**: All audio functionality must be disabled during development:

1. **Create Placeholder Audio Utils** (`src/utils/audioUtils.js`):
```javascript
// Audio system disabled for development
export const AudioSystem = {
  init: () => Promise.resolve(),
  playSound: (soundName, volume = 1) => {
    // console.log(`[Audio Disabled] Would play: ${soundName}`);
  },
  playMusic: (musicName, loop = true) => {
    // console.log(`[Audio Disabled] Would play music: ${musicName}`);
  },
  stopSound: (soundName) => {},
  stopAllSounds: () => {},
  setMasterVolume: (volume) => {},
  setSFXVolume: (volume) => {},
  setMusicVolume: (volume) => {}
};

export const playSound = AudioSystem.playSound;
export const playMusic = AudioSystem.playMusic;
```

2. **Audio Hook Implementation** (`src/hooks/useAudio.js`):
```javascript
import { useCallback } from 'react';
import { AudioSystem } from '../utils/audioUtils.js';

export function useAudio() {
  const playSound = useCallback((soundName, volume = 1) => {
    AudioSystem.playSound(soundName, volume);
  }, []);

  const playMusic = useCallback((musicName, loop = true) => {
    AudioSystem.playMusic(musicName, loop);
  }, []);

  const stopSound = useCallback((soundName) => {
    AudioSystem.stopSound(soundName);
  }, []);

  const setVolume = useCallback((volume) => {
    AudioSystem.setMasterVolume(volume);
  }, []);

  return {
    playSound,
    playMusic,
    stopSound,
    setVolume,
    isReady: true // Always ready since audio is disabled
  };
}
```

3. **Remove Audio Context**: Do not implement any actual Web Audio API or Tone.js functionality

### Type Definitions Required
Create the following type definition files to prevent import errors:

1. **src/types/game.js**:
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
```

2. **src/types/weapons.js**:
```javascript
export const WeaponTypes = {
  PISTOL: 'pistol',
  SHOTGUN: 'shotgun',
  RAPIDFIRE: 'rapidfire',
  GRAPPLING: 'grappling',
  BOMB: 'bomb'
};
```

3. **src/types/enemies.js**, **src/types/items.js**, **src/types/levels.js**: Create similar constant exports for each type category.

This specification provides Claude Code with everything needed to create a complete, playable on-rails shooter game with the depth and features you've outlined.