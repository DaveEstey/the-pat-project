# Game Architecture Overview

## Current Implementation Status
**Last Updated:** 2025-10-28
**Version:** 0.1.0 Alpha
**Completion:** ~35%

## Technology Stack
- **Frontend:** React 18.2.0 + JavaScript (ES6+)
- **3D Engine:** Three.js r0.168.0
- **3D React Bridge:** @react-three/fiber 8.15.11 + @react-three/drei 9.88.13
- **Build Tool:** Vite 4.5.0
- **Styling:** Tailwind CSS 3.3.5
- **Audio:** Tone.js 14.7.77 (Currently disabled)
- **State Management:** React Context + useReducer

## Project Structure

### Core Directories
```
/src
├── components/       # React components (UI + Game elements)
├── contexts/         # React contexts for state management
├── data/            # Game configuration and level data
├── hooks/           # Custom React hooks
├── systems/         # Core game systems (non-React)
├── types/           # Type definitions (JS constants)
└── utils/           # Utility functions
```

## Architecture Patterns

### 1. **Unified System Architecture**
- Single source of truth for game state (GameContext)
- Centralized event emitter system (GameEngine)
- Unified enemy management (UnifiedRoomManager)
- Unified combat system (UnifiedCombatSystem)
- Unified movement controller (UnifiedMovementController)

### 2. **React Context Pattern**
- **GameContext:** Player state, level state, room state
- **AudioContext:** Sound management (disabled)
- **SettingsContext:** User preferences and graphics settings

### 3. **Component Hierarchy**
```
App
└── GameContent
    ├── MainMenu
    ├── LevelSelect
    ├── Settings
    └── GameCanvasWrapper
        ├── GameCanvas (Main game container)
        │   ├── LevelManager (Multi-room progression)
        │   ├── UnifiedCombatSystem (Shooting mechanics)
        │   ├── WeaponController (Weapon switching)
        │   ├── VisualFeedbackSystem (Particles/effects)
        │   ├── InteractivePuzzle (Puzzle mechanics)
        │   └── WeaponPickup (Collectibles)
        └── HUD Components
            ├── HealthBar
            ├── ScoreDisplay
            ├── AmmoCounter
            ├── Inventory
            └── [Other UI elements]
```

### 4. **System Layer Architecture**
- **GameEngine:** Core Three.js renderer, scene manager, event bus
- **EnvironmentSystem:** Level environments and visual themes
- **EnemyAISystem:** Enemy behavior and attack patterns
- **WeaponSystem:** Weapon stats and projectile physics
- **ParticleSystem:** Visual effects for combat/damage
- **ProgressionSystem:** Persistent unlocks and level completion
- **SaveSystem:** localStorage-based save/load
- **ItemSystem:** Collectibles and powerups
- **PuzzleSystem:** Interactive puzzle logic

## Data Flow

### Game State Flow
```
User Input → React Components → GameContext Actions → GameEngine Events → System Updates → Visual Rendering
```

### Combat Flow
```
Mouse Click → UnifiedCombatSystem → Raycasting → Enemy Hit Detection → Damage Application → GameContext State Update → UI Update
```

### Level Progression Flow
```
LevelManager → Room Configuration → Enemy Spawning → Combat → Room Completion → Next Room/Level
```

## Key Design Decisions

### ✅ Implemented
1. **Room-based combat** instead of rail-shooting (easier to implement)
2. **Multi-room progression** with configurable enemy layouts
3. **Persistent progression system** with localStorage
4. **Unified enemy state** to prevent duplicate renders
5. **Event-driven architecture** for loose coupling
6. **Component composition** for flexible UI
7. **Disabled audio system** for faster initial development

### ⚠️ Partially Implemented
1. Rail movement system (exists but not used)
2. Puzzle integration (structure exists, needs content)
3. Boss battle mechanics (basic implementation)
4. Special weapon effects (grappling arm incomplete)
5. Item collection system (basic structure)

### ❌ Not Implemented
1. Full rail-shooting movement with auto-progression
2. Branching path selection
3. Secret rooms and alternate routes
4. Complete audio system with sound effects
5. Mobile touch controls (UI exists, needs testing)
6. Difficulty scaling system
7. Achievement/trophy system
8. Story cutscenes and narrative integration
9. Advanced visual effects (post-processing)
10. Performance optimization and LOD system

## Current Game Loop

```javascript
// Main game loop (GameCanvas.jsx:117-134)
1. Update deltaTime and totalTime
2. Update GameEngine
3. Update EnemyProjectileSystem
4. Update ItemSystem
5. Render scene
6. Request next animation frame
```

## State Management

### GameContext State Structure
```javascript
{
  gameState: 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'LEVEL_COMPLETE',
  currentLevel: number,
  player: {
    health, maxHealth, lives, score, accuracy,
    position: {x, y, z},
    currentWeapon: index,
    weapons: [{type, name, reloading}],
    ammo: {pistol, shotgun, rapidfire, grappling, bomb},
    inventory: {items, keyItems, powerups, upgrades},
    activePowerups: {speed, damage, accuracy},
    permanentUpgrades: {enhanced_grip, reinforced_armor, eagle_eye}
  },
  level: {
    enemies, items, puzzles, progress, timeRemaining
  },
  rooms: {
    currentRoom, visitedRooms, roomHistory, completedRooms, unlockedSecrets
  }
}
```

## Performance Targets
- **Target FPS:** 60 FPS
- **Max Enemies:** 50 (per GameConfig.js:7)
- **Max Particles:** 1000 (per GameConfig.js:6)
- **Draw Distance:** 200 units
- **LOD Distance:** 100 units

## Critical File References
- **Main Entry:** `src/main.jsx`
- **App Root:** `src/App.jsx`
- **Game Canvas:** `src/components/Game/GameCanvas.jsx`
- **Game Engine:** `src/systems/GameEngine.js`
- **Game Context:** `src/contexts/GameContext.jsx`
- **Level Rooms:** `src/data/levelRooms.js`
- **Game Config:** `src/data/gameConfig.js`

## Known Issues & Limitations
1. Audio system is placeholder-only (no actual sound)
2. Only 3 levels are fully playable (Levels 1-3)
3. Levels 4-12 exist in config but not tested
4. Rail movement disabled in favor of stationary combat
5. Mobile controls not fully tested
6. No performance optimization for low-end devices
7. Puzzle system exists but minimal puzzle content
8. Boss mechanics are basic (need multi-phase system)
9. No difficulty selection (hardcoded to 'normal')
10. Save system doesn't backup to cloud

## Next Architecture Improvements
1. Implement object pooling for enemies/projectiles
2. Add LOD system for distant enemies
3. Implement frustum culling for off-screen entities
4. Add worker threads for AI calculations
5. Implement proper state machine for game states
6. Add replay system for post-game analysis
7. Implement achievement/trophy tracking
8. Add telemetry for balancing feedback
