# LLM Component Index - Machine-Readable

**PURPOSE:** Fast LLM lookup for component locations, dependencies, and relationships
**FORMAT:** Structured data optimized for parsing
**LAST_UPDATED:** 2025-11-05

---

## COMPONENT_REGISTRY

```
COMPONENT_COUNT: 38
UI_COMPONENTS: 19
GAME_COMPONENTS: 19
PUZZLE_COMPONENTS: 4
```

---

## UI_COMPONENTS_INDEX

### HUD.jsx
```
PATH: src/components/UI/HUD.jsx
TYPE: Container
STATUS: COMPLETE
LINES: ~150
IMPORTS: [HealthBar, ScoreDisplay, AmmoCounter, ComboDisplay, PuzzleDisplay, BossHealthBar]
USED_BY: [GameCanvas.jsx]
PROPS: {player, enemies, boss, combo, puzzleActive}
RENDERS_AT: Full screen overlay
CRITICAL: true
```

### HealthBar.jsx
```
PATH: src/components/UI/HealthBar.jsx
TYPE: Display
STATUS: COMPLETE
LINES: ~80
IMPORTS: []
USED_BY: [HUD.jsx]
PROPS: {current: number, max: number, lives: number}
POSITION: Top-left
DATA_SOURCE: GameContext.player.health
```

### ScoreDisplay.jsx
```
PATH: src/components/UI/ScoreDisplay.jsx
TYPE: Display
STATUS: COMPLETE
LINES: ~60
IMPORTS: []
USED_BY: [HUD.jsx]
PROPS: {score: number, combo: number, accuracy: number}
POSITION: Top-right
DATA_SOURCE: GameContext.player.score
```

### AmmoCounter.jsx
```
PATH: src/components/UI/AmmoCounter.jsx
TYPE: Display
STATUS: COMPLETE
LINES: ~70
IMPORTS: []
USED_BY: [HUD.jsx]
PROPS: {current: number, reserve: number, weaponType: string, isReloading: boolean}
POSITION: Bottom-right
DATA_SOURCE: WeaponController.ammo
```

### MainMenu.jsx
```
PATH: src/components/UI/MainMenu.jsx
TYPE: Navigation
STATUS: COMPLETE
LINES: ~120
IMPORTS: [LevelSelect, Settings]
USED_BY: [App.jsx]
DISPATCHES: [START_GAME, LOAD_GAME, OPEN_LEVEL_SELECT, OPEN_SETTINGS]
```

### LevelSelect.jsx
```
PATH: src/components/UI/LevelSelect.jsx
TYPE: Navigation
STATUS: COMPLETE
LINES: ~150
IMPORTS: []
USED_BY: [MainMenu.jsx]
DATA_SOURCE: GameContext.progression.unlockedLevels
DISPATCHES: [SET_LEVEL]
```

### Settings.jsx
```
PATH: src/components/UI/Settings.jsx
TYPE: Configuration
STATUS: COMPLETE
LINES: ~200
IMPORTS: [TutorialSettings, PostProcessingSettings, DynamicLightingSettings]
USED_BY: [MainMenu.jsx, PauseMenu.jsx]
STORAGE: localStorage via SettingsSystem
```

### PauseMenu.jsx
```
PATH: src/components/UI/PauseMenu.jsx
TYPE: Navigation
STATUS: COMPLETE
LINES: ~100
IMPORTS: [Settings]
TRIGGER: ESC key
USED_BY: [GameCanvas.jsx]
```

### GameOverScreen.jsx
```
PATH: src/components/UI/GameOverScreen.jsx
TYPE: Display
STATUS: COMPLETE
LINES: ~130
IMPORTS: []
USED_BY: [GameCanvas.jsx]
SHOWS: {finalScore, enemiesDefeated, accuracy, timeSurvived}
```

### Inventory.jsx
```
PATH: src/components/UI/Inventory.jsx
TYPE: Display
STATUS: PARTIAL
LINES: ~90
IMPORTS: []
TRIGGER: Tab key
CATEGORIES: [weapons, keyItems, upgrades, collectibles]
NEEDS: Item grid layout, item descriptions
```

### BossHealthBar.jsx
```
PATH: src/components/UI/BossHealthBar.jsx
TYPE: Display
STATUS: PARTIAL
LINES: ~85
IMPORTS: []
USED_BY: [HUD.jsx]
PROPS: {bossName: string, current: number, max: number, phase: number}
POSITION: Top-center
NEEDS: Phase segmentation indicators
```

### ComboDisplay.jsx
```
PATH: src/components/UI/ComboDisplay.jsx
TYPE: Display
STATUS: PARTIAL
LINES: ~70
IMPORTS: []
USED_BY: [HUD.jsx]
PROPS: {comboCount: number, multiplier: number, timeRemaining: number}
POSITION: Center-right edge
```

### PuzzleDisplay.jsx
```
PATH: src/components/UI/PuzzleDisplay.jsx
TYPE: Display
STATUS: PARTIAL
LINES: ~75
IMPORTS: []
USED_BY: [HUD.jsx]
PROPS: {puzzleType: string, timeRemaining: number, progress: number, instructions: string}
POSITION: Center-top
NEEDS: Puzzle-specific UI implementation
```

### MobileControls.jsx
```
PATH: src/components/UI/MobileControls.jsx
TYPE: Input
STATUS: UNTESTED
LINES: ~180
IMPORTS: []
USED_BY: [GameCanvas.jsx]
CONTROLS: [tap_shoot, virtual_joystick, weapon_switch, pause]
WARNING: Not tested on mobile devices
```

### NotificationDisplay.jsx
```
PATH: src/components/UI/NotificationDisplay.jsx
TYPE: Display
STATUS: PARTIAL
LINES: ~65
IMPORTS: []
POSITION: Top-center
TYPES: [item_collected, achievement_unlocked, weapon_unlocked, puzzle_solved, enemy_defeated]
NEEDS: Queue system for multiple notifications
```

### StoryDialogue.jsx
```
PATH: src/components/UI/StoryDialogue.jsx
TYPE: Display
STATUS: PARTIAL
LINES: ~90
IMPORTS: []
POSITION: Bottom-center overlay
DATA_SOURCE: src/data/storyData.js
NEEDS: More content
```

### EnemyWarningIndicator.jsx
```
PATH: src/components/UI/EnemyWarningIndicator.jsx
TYPE: Display
STATUS: PARTIAL
LINES: ~55
IMPORTS: []
POSITION: Screen edges
SHOWS: Off-screen enemy positions
```

### WeaponUpgradeShop.jsx
```
PATH: src/components/UI/WeaponUpgradeShop.jsx
TYPE: Interactive
STATUS: NEW_FEATURE
LINES: ~220
IMPORTS: []
DATA_SOURCE: src/data/weaponStats.js (upgrades)
CURRENCY_SOURCE: GameContext.player.currency
```

### PathChoiceUI.jsx
```
PATH: src/components/UI/PathChoiceUI.jsx
TYPE: Interactive
STATUS: NEW_FEATURE
LINES: ~110
IMPORTS: []
DATA_SOURCE: src/data/pathConfigs.js
SHOWS: Branching path choices with descriptions
```

---

## GAME_COMPONENTS_INDEX

### GameCanvas.jsx
```
PATH: src/components/Game/GameCanvas.jsx
TYPE: Container
STATUS: COMPLETE
LINES: ~350
ROLE: Main Three.js orchestrator
IMPORTS: [LevelManager, UnifiedCombatSystem, WeaponController, VisualFeedbackSystem, InteractivePuzzle, WeaponPickup, UnifiedMovementController, ProjectileSystemBridge, SoundManager, HUD]
THREE_OBJECTS: {scene, camera, renderer, clock}
GAME_LOOP: 60 FPS target
CRITICAL: true
```

### GameCanvasWrapper.jsx
```
PATH: src/components/Game/GameCanvasWrapper.jsx
TYPE: Error Boundary
STATUS: COMPLETE
LINES: ~60
WRAPS: GameCanvas.jsx
CATCHES: Rendering errors
```

### UnifiedRoomManager.jsx
```
PATH: src/components/Game/UnifiedRoomManager.jsx
TYPE: Manager
STATUS: COMPLETE
LINES: ~450
ROLE: Enemy lifecycle management
IMPORTS: [EnemyAISystem, WeaponUpgradeSystem]
DATA_SOURCE: src/data/levelRooms.js
MANAGES: Enemy spawning, health, death, state
METHOD_loadRoom: line ~50
METHOD_updateEnemies: line ~150
METHOD_handleEnemyDeath: line ~300
CRITICAL: true
```

### UnifiedCombatSystem.jsx
```
PATH: src/components/Game/UnifiedCombatSystem.jsx
TYPE: System
STATUS: COMPLETE
LINES: ~280
ROLE: Player shooting mechanics
IMPORTS: [WeaponSystem, ParticleSystem]
THREE: Raycaster
METHOD_handleShoot: line ~80
DAMAGE_CALC: line ~130
HIT_DETECTION: Raycasting
CRITICAL: true
```

### UnifiedMovementController.jsx
```
PATH: src/components/Game/UnifiedMovementController.jsx
TYPE: System
STATUS: COMPLETE
LINES: ~200
ROLE: On-rails camera movement
DATA_SOURCE: src/data/roomConfigs.js (cameraPath)
MOVEMENT_TYPES: [linear, bezier, pause]
METHOD_update: line ~30
CRITICAL: true
```

### LevelManager.jsx
```
PATH: src/components/Game/LevelManager.jsx
TYPE: Manager
STATUS: COMPLETE
LINES: ~350
ROLE: Multi-room level progression
IMPORTS: [EnvironmentSystem, UnifiedRoomManager]
DATA_SOURCES: [levelRooms.js, levelItems.js, puzzleConfigs.js]
METHOD_loadLevel: line ~80
METHOD_loadRoom: line ~150
METHOD_onRoomComplete: line ~250
ROOMS_PER_LEVEL: 2
CRITICAL: true
```

### WeaponController.jsx
```
PATH: src/components/Game/WeaponController.jsx
TYPE: Manager
STATUS: COMPLETE
LINES: ~220
ROLE: Weapon switching and state
DATA_SOURCE: src/data/weaponStats.js
CONTROLS: [keyboard_1-9, mouse_scroll, mobile_swipe]
STATE: {currentWeapon, unlockedWeapons, ammo, isReloading}
DISPATCHES: [SWITCH_WEAPON, RELOAD_WEAPON, FIRE_WEAPON, UNLOCK_WEAPON]
```

### VisualFeedbackSystem.jsx
```
PATH: src/components/Game/VisualFeedbackSystem.jsx
TYPE: System
STATUS: PARTIAL
LINES: ~150
ROLE: Particle effects
IMPORTS: [ParticleSystem]
EFFECTS: [muzzle_flash:DONE, hit_sparks:DONE, explosions:BASIC, blood_splatter:TODO, smoke_trails:TODO]
```

### WeaponEffects.jsx
```
PATH: src/components/Game/WeaponEffects.jsx
TYPE: System
STATUS: PARTIAL
LINES: ~90
ROLE: Weapon-specific visuals
EFFECTS: [muzzle_flash:DONE, tracer_rounds:TODO, shell_ejection:TODO]
```

### ProjectileSystemBridge.jsx
```
PATH: src/components/Game/ProjectileSystemBridge.jsx
TYPE: System
STATUS: COMPLETE
LINES: ~180
ROLE: Enemy projectile rendering
PROJECTILE_TYPES: [bullet, heavy_bullet, bomb, shuriken]
HANDLES: Position updates, collision, removal
```

### WeaponPickup.jsx
```
PATH: src/components/Game/WeaponPickup.jsx
TYPE: Manager
STATUS: PARTIAL_BUG_FIXED
LINES: ~140
ROLE: Collectible weapons and items
DATA_SOURCES: [levelRooms.js.weaponPickups, levelItems.js]
BUG_FIXED: Weapon pickup overlap at (-8,6,-50)
NEW_POSITIONS: L1(-8,6,-50), L2(8,5,-55), L3(0,7,-48)
COLLECTION: Automatic on proximity (3 unit radius)
```

### InteractivePuzzle.jsx
```
PATH: src/components/Game/InteractivePuzzle.jsx
TYPE: System
STATUS: PARTIAL
LINES: ~120
ROLE: Puzzle integration
DATA_SOURCE: src/data/puzzleConfigs.js
PUZZLE_TYPES: [switch_sequence, timed_targets, color_match]
NEEDS: Full implementation
```

### PuzzleManager.jsx
```
PATH: src/components/Game/PuzzleManager.jsx
TYPE: Manager
STATUS: PARTIAL
LINES: ~110
ROLE: Puzzle lifecycle
METHOD_startPuzzle: line ~30
METHOD_checkSolution: line ~60
METHOD_onPuzzleTimeout: line ~90
NEEDS: Implementation
```

### PathSelector.jsx
```
PATH: src/components/Game/PathSelector.jsx
TYPE: Interactive
STATUS: NOT_INTEGRATED
LINES: ~80
ROLE: Branching path selection
DATA_SOURCE: src/data/pathConfigs.js
CONCEPT: Shoot arrows at junctions to choose path
```

### SoundManager.jsx
```
PATH: src/components/Game/SoundManager.jsx
TYPE: System
STATUS: DISABLED
LINES: ~50
ROLE: Audio placeholder
ALL_METHODS: No-op (console.log only)
REASON: Audio disabled per specification
```

### RoomTransition.jsx
```
PATH: src/components/Game/RoomTransition.jsx
TYPE: Effect
STATUS: NEW_FEATURE
LINES: ~95
ROLE: Visual transition between rooms
EFFECTS: [fade_to_black, loading_indicator, room_name_display]
```

### SecretRoomManager.jsx
```
PATH: src/components/Game/SecretRoomManager.jsx
TYPE: Manager
STATUS: NEW_FEATURE
LINES: ~130
DATA_SOURCE: src/data/secretRoomConfigs.js
ROLE: Hidden room discovery
```

### BossIntroSequence.jsx
```
PATH: src/components/Game/BossIntroSequence.jsx
TYPE: Cinematic
STATUS: NEW_FEATURE
LINES: ~120
DATA_SOURCE: src/data/bossConfigs.js
FEATURES: [camera_pan, boss_name_reveal, health_bar_animation]
```

### PowerUpPickup.jsx
```
PATH: src/components/Game/PowerUpPickup.jsx
TYPE: Interactive
STATUS: NEW_FEATURE
LINES: ~100
DATA_SOURCE: src/data/levelItems.js
TYPES: [speed_boost, damage_boost, shield, rapid_fire, multi_shot]
```

### DestructibleManager.jsx
```
PATH: src/components/Game/DestructibleManager.jsx
TYPE: Manager
STATUS: NEW_FEATURE
LINES: ~140
DATA_SOURCE: src/data/destructibleConfigs.js
ROLE: Breakable environment objects
```

### HazardManager.jsx
```
PATH: src/components/Game/HazardManager.jsx
TYPE: Manager
STATUS: NEW_FEATURE
LINES: ~125
DATA_SOURCE: src/data/hazardConfigs.js
HAZARDS: [fire, spikes, lasers]
```

### TutorialManager.jsx
```
PATH: src/components/Game/TutorialManager.jsx
TYPE: System
STATUS: NEW_FEATURE
LINES: ~160
ROLE: In-game tutorial
FEATURES: [first_time_detection, contextual_hints, progress_tracking]
```

### PuzzleHintVisual.jsx
```
PATH: src/components/Game/PuzzleHintVisual.jsx
TYPE: Display
STATUS: NEW_FEATURE
LINES: ~85
ROLE: 3D visual puzzle hints
EXAMPLES: [glowing_switches, arrows_to_targets, number_displays]
```

---

## PUZZLE_COMPONENTS_INDEX

### SwitchSequence.jsx
```
PATH: src/components/Game/Puzzles/SwitchSequence.jsx
TYPE: Puzzle
STATUS: EMPTY_FRAMEWORK
LINES: ~30
PURPOSE: Shoot switches in correct order
NEEDS: Switch mesh creation, order validation, visual feedback
```

### TerrainModifier.jsx
```
PATH: src/components/Game/Puzzles/TerrainModifier.jsx
TYPE: Puzzle
STATUS: EMPTY_FRAMEWORK
LINES: ~30
PURPOSE: Shoot to alter terrain (raise platforms, lower walls)
NEEDS: Terrain interaction, collision updates, animation
```

### DoorMechanism.jsx
```
PATH: src/components/Game/Puzzles/DoorMechanism.jsx
TYPE: Puzzle
STATUS: EMPTY_FRAMEWORK
LINES: ~30
PURPOSE: Key items and tool interactions to open doors
NEEDS: Door models, key validation, opening animations
```

### PathSelector.jsx
```
PATH: src/components/Game/Puzzles/PathSelector.jsx
TYPE: Puzzle
STATUS: EMPTY_FRAMEWORK
LINES: ~30
PURPOSE: Shoot arrows to choose level paths
NOTE: Duplicate of Game/PathSelector.jsx - needs consolidation
```

---

## COMPONENT_DEPENDENCY_GRAPH

```
App.jsx
 └─ GameContext.Provider
     ├─ MainMenu.jsx
     │   ├─ LevelSelect.jsx
     │   └─ Settings.jsx
     │       ├─ TutorialSettings.jsx
     │       ├─ PostProcessingSettings.jsx
     │       └─ DynamicLightingSettings.jsx
     │
     └─ GameCanvas.jsx
         ├─ HUD.jsx
         │   ├─ HealthBar.jsx
         │   ├─ ScoreDisplay.jsx
         │   ├─ AmmoCounter.jsx
         │   ├─ ComboDisplay.jsx
         │   ├─ PuzzleDisplay.jsx
         │   └─ BossHealthBar.jsx (conditional)
         │
         ├─ LevelManager.jsx
         │   ├─ UnifiedRoomManager.jsx
         │   ├─ RoomTransition.jsx
         │   ├─ SecretRoomManager.jsx
         │   ├─ BossIntroSequence.jsx
         │   ├─ DestructibleManager.jsx
         │   └─ HazardManager.jsx
         │
         ├─ UnifiedCombatSystem.jsx
         ├─ WeaponController.jsx
         ├─ UnifiedMovementController.jsx
         ├─ InteractivePuzzle.jsx
         │   ├─ PuzzleManager.jsx
         │   └─ SequencePuzzleManager.jsx
         │
         ├─ WeaponPickup.jsx
         ├─ PowerUpPickup.jsx
         ├─ VisualFeedbackSystem.jsx
         ├─ WeaponEffects.jsx
         ├─ ProjectileSystemBridge.jsx
         ├─ TutorialManager.jsx
         ├─ PuzzleHintVisual.jsx
         └─ SoundManager.jsx (disabled)
```

---

## CRITICAL_COMPONENTS_LIST

```
COMPONENT: GameCanvas.jsx
REASON: Main game loop orchestrator
FAILURE_IMPACT: Total game failure

COMPONENT: LevelManager.jsx
REASON: Level/room loading
FAILURE_IMPACT: Cannot progress through game

COMPONENT: UnifiedRoomManager.jsx
REASON: Enemy spawning and management
FAILURE_IMPACT: No enemies = no gameplay

COMPONENT: UnifiedCombatSystem.jsx
REASON: Player shooting mechanics
FAILURE_IMPACT: Cannot damage enemies

COMPONENT: UnifiedMovementController.jsx
REASON: Camera movement (on-rails)
FAILURE_IMPACT: Static camera = broken game

COMPONENT: HUD.jsx
REASON: All UI display
FAILURE_IMPACT: No feedback to player
```

---

## COMPONENT_STATUS_SUMMARY

```
COMPLETE: 24
PARTIAL: 10
EMPTY_FRAMEWORK: 4
NEW_FEATURE: 8
DISABLED: 1
UNTESTED: 1
---
TOTAL: 38
```

---

## QUICK_LOOKUP_PATTERNS

```
PATTERN: "Enemy not spawning"
CHECK: [UnifiedRoomManager.jsx:50, levelRooms.js:14, LevelManager.jsx:80]

PATTERN: "Weapon not unlocking"
CHECK: [WeaponPickup.jsx:30, WeaponController.jsx:40, levelRooms.js:32,63,81]

PATTERN: "Shooting not working"
CHECK: [UnifiedCombatSystem.jsx:80, WeaponSystem.js:30, weaponStats.js:10]

PATTERN: "Camera not moving"
CHECK: [UnifiedMovementController.jsx:30, roomConfigs.js:20, LevelManager.jsx:150]

PATTERN: "Level not loading"
CHECK: [LevelManager.jsx:80, levelRooms.js:387, GameContext.jsx:100]

PATTERN: "UI not showing"
CHECK: [HUD.jsx:30, GameCanvas.jsx:150, GameContext.jsx:50]
```

---

END LLM_COMPONENT_INDEX
