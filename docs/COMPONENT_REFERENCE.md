# Component Reference Guide

Complete mapping of all React components in the on-rails shooter game. Use this as your quick reference for understanding component locations, purposes, and relationships.

**Last Updated:** 2025-11-05
**Total Components:** 38 (19 UI + 19 Game)

---

## Table of Contents

1. [UI Components (19)](#ui-components)
2. [Game Components (19)](#game-components)
3. [Puzzle Components (4)](#puzzle-components)
4. [Component Dependency Graph](#component-dependency-graph)
5. [Component Status Matrix](#component-status-matrix)
6. [Quick Component Finder](#quick-component-finder)

---

## UI Components

All UI components located in: `src/components/UI/`

### Core HUD Components

#### 1. HUD.jsx
**Path:** `src/components/UI/HUD.jsx`
**Purpose:** Main heads-up display container that orchestrates all UI elements
**Imports:**
- HealthBar
- ScoreDisplay
- AmmoCounter
- WeaponSelector (via WeaponController)
- ComboDisplay
- PuzzleDisplay
- BossHealthBar (conditional)

**Used By:** GameCanvas.jsx
**State:** ✅ Fully Functional
**Props:**
```javascript
{
  player: { health, maxHealth, score, ammo, currentWeapon },
  enemies: [],
  boss: { health, maxHealth, phase } | null,
  combo: { count, multiplier },
  puzzleActive: boolean
}
```

**Key Features:**
- Responsive layout (desktop/mobile)
- Conditional boss health bar
- Real-time stat updates
- Combo system integration

---

#### 2. HealthBar.jsx
**Path:** `src/components/UI/HealthBar.jsx`
**Purpose:** Visual player health display with smooth transitions
**Position:** Top-left corner
**State:** ✅ Fully Functional
**Props:**
```javascript
{
  current: number,    // Current health (0-100)
  max: number,        // Max health (typically 100)
  lives: number       // Remaining lives (0-3)
}
```

**Styling:**
- Green health bar (>60%)
- Yellow health bar (30-60%)
- Red health bar (<30%)
- Heart icons for lives

**Referenced In:**
- HUD.jsx
- GameContext (player.health)

---

#### 3. ScoreDisplay.jsx
**Path:** `src/components/UI/ScoreDisplay.jsx`
**Purpose:** Real-time score tracking with combo multipliers
**Position:** Top-right corner
**State:** ✅ Fully Functional
**Props:**
```javascript
{
  score: number,
  combo: number,
  accuracy: number    // 0.0 to 1.0
}
```

**Features:**
- Animated score increments
- Combo multiplier indicator
- Accuracy percentage display

---

#### 4. AmmoCounter.jsx
**Path:** `src/components/UI/AmmoCounter.jsx`
**Purpose:** Current weapon ammunition display
**Position:** Bottom-right corner
**State:** ✅ Fully Functional
**Props:**
```javascript
{
  current: number,    // Bullets in mag
  reserve: number,    // Bullets in reserve
  weaponType: string, // 'pistol', 'shotgun', etc.
  isReloading: boolean
}
```

**Special Cases:**
- Infinite ammo weapons show "∞"
- Reload progress bar
- Color coding (red when low)

---

#### 5. WeaponSelector.jsx (integrated into WeaponController.jsx)
**Path:** `src/components/Game/WeaponController.jsx`
**Purpose:** Weapon switching UI with keyboard shortcuts
**Position:** Bottom-center (weapon wheel)
**State:** ✅ Integrated
**Controls:**
- Keys 1-9: Select weapon
- Mouse scroll: Cycle weapons
- Mobile: Swipe gestures

**Displays:**
- Unlocked weapons
- Current weapon highlighted
- Ammo counts per weapon

---

#### 6. ComboDisplay.jsx
**Path:** `src/components/UI/ComboDisplay.jsx`
**Purpose:** Shows active combo count and multiplier
**Position:** Center-right edge
**State:** ⚠️ Partially Implemented
**Props:**
```javascript
{
  comboCount: number,
  multiplier: number,
  timeRemaining: number  // Combo timeout
}
```

**Features:**
- Pulse animation on combo increase
- Timeout bar
- Multiplier text (e.g., "x4 COMBO!")

---

#### 7. PuzzleDisplay.jsx
**Path:** `src/components/UI/PuzzleDisplay.jsx`
**Purpose:** Shows active puzzle status and timer
**Position:** Center-top
**State:** ⚠️ Framework Only
**Props:**
```javascript
{
  puzzleType: string,
  timeRemaining: number,
  progress: number,     // 0.0 to 1.0
  instructions: string
}
```

**Puzzle Types:**
- 'switch_sequence' - Button order puzzle
- 'timed_targets' - Shoot targets puzzle
- 'color_match' - Color sequence puzzle

**Needs Implementation:**
- Puzzle-specific UI
- Progress indicators
- Hint system integration

---

#### 8. BossHealthBar.jsx
**Path:** `src/components/UI/BossHealthBar.jsx`
**Purpose:** Large boss enemy health display
**Position:** Top-center
**State:** ⚠️ Missing Phase Indicators
**Props:**
```javascript
{
  bossName: string,
  current: number,
  max: number,
  phase: number        // Boss phase (1-3)
}
```

**Features:**
- Large centered health bar
- Boss name display
- Phase segmentation (needs implementation)

**Boss Phases:**
- Level 3: TITAN ENFORCER (1 phase)
- Level 6: SHADOW REAPER (2 phases)
- Level 9: PLASMA WARDEN (3 phases)
- Level 12: THE ARCHITECT (4 phases)

---

### Menu & Navigation Components

#### 9. MainMenu.jsx
**Path:** `src/components/UI/MainMenu.jsx`
**Purpose:** Title screen with game start options
**State:** ✅ Fully Functional
**Buttons:**
- Start Game (New Game)
- Continue (Load Save)
- Level Select
- Settings
- Collectibles Library
- Quit

**Dispatches:**
- START_GAME
- LOAD_GAME
- OPEN_LEVEL_SELECT
- OPEN_SETTINGS

---

#### 10. LevelSelect.jsx
**Path:** `src/components/UI/LevelSelect.jsx`
**Purpose:** Level selection screen with unlock status
**State:** ✅ Fully Functional
**Features:**
- Shows unlocked levels only
- Displays best scores per level
- Shows completion percentage
- Star rating system
- Secret level indicators

**Data Source:** GameContext.progression.unlockedLevels

**Level Format:**
```javascript
{
  level: number,
  name: string,
  theme: string,
  unlocked: boolean,
  completed: boolean,
  bestScore: number,
  stars: number  // 0-3
}
```

---

#### 11. Settings.jsx
**Path:** `src/components/UI/Settings.jsx`
**Purpose:** Game settings and preferences
**State:** ✅ Fully Functional
**Settings Categories:**
1. **Gameplay**
   - Difficulty (Easy/Normal/Hard)
   - Auto-aim assist
   - Crosshair style
2. **Graphics**
   - Visual quality (Low/Medium/High/Ultra)
   - Post-processing effects
   - Dynamic lighting
   - Particle density
3. **Audio** (Currently Disabled)
   - Master volume
   - SFX volume
   - Music volume
4. **Controls**
   - Mouse sensitivity
   - Keyboard bindings
   - Mobile touch controls
5. **Accessibility**
   - Colorblind mode
   - Screen shake intensity
   - Tutorial hints

**Storage:** localStorage via SettingsSystem

---

#### 12. PauseMenu.jsx
**Path:** `src/components/UI/PauseMenu.jsx`
**Purpose:** In-game pause overlay
**Trigger:** ESC key
**State:** ✅ Fully Functional
**Options:**
- Resume
- Restart Level
- Settings
- Quit to Menu

**Behavior:**
- Pauses game loop
- Dims background
- Shows current level stats

---

#### 13. GameOverScreen.jsx
**Path:** `src/components/UI/GameOverScreen.jsx`
**Purpose:** Death/failure screen with stats
**State:** ✅ Fully Functional
**Displays:**
- Final score
- Enemies defeated
- Accuracy percentage
- Time survived
- Continue options (retry/menu)

---

#### 14. Inventory.jsx
**Path:** `src/components/UI/Inventory.jsx`
**Purpose:** Shows collected items and key items
**Trigger:** Tab key
**State:** ⚠️ Basic Structure, Needs Item Display Logic
**Categories:**
- Weapons (unlocked weapons)
- Key Items (puzzle items)
- Upgrades (permanent bonuses)
- Collectibles (lore items)

**Needs Implementation:**
- Item grid layout
- Item descriptions
- Item usage mechanics

---

### Advanced UI Components

#### 15. WeaponUpgradeShop.jsx
**Path:** `src/components/UI/WeaponUpgradeShop.jsx`
**Purpose:** Between-level weapon upgrade screen
**State:** 🆕 Additional Feature
**Features:**
- Upgrade weapon stats (damage, fire rate, accuracy)
- Uses currency earned from levels
- Unlock alternate fire modes
- Visual weapon preview

**Referenced In:** LevelManager.jsx (between rooms)

---

#### 16. AltFireIndicator.jsx
**Path:** `src/components/UI/AltFireIndicator.jsx`
**Purpose:** Shows alternate fire mode availability
**Position:** Bottom-left of AmmoCounter
**State:** 🆕 Additional Feature
**Props:**
```javascript
{
  weaponType: string,
  altFireReady: boolean,
  cooldown: number
}
```

---

#### 17. WeakpointIndicator.jsx
**Path:** `src/components/UI/WeakpointIndicator.jsx`
**Purpose:** Highlights enemy weak points
**State:** 🆕 Additional Feature
**Features:**
- Red targeting reticle on weak spots
- Distance indicator
- Damage multiplier display

---

#### 18. DodgeIndicator.jsx
**Path:** `src/components/UI/DodgeIndicator.jsx`
**Purpose:** Shows incoming projectile warnings
**Position:** Edge of screen (direction-based)
**State:** 🆕 Additional Feature
**Visual:**
- Arrow pointing to threat
- Color intensity = urgency
- Sound cue integration

---

#### 19. PathChoiceUI.jsx
**Path:** `src/components/UI/PathChoiceUI.jsx`
**Purpose:** Branching path selection overlay
**State:** 🆕 Additional Feature
**Props:**
```javascript
{
  choices: [
    { path: 'left', description: 'Combat Route', difficulty: 'Hard' },
    { path: 'right', description: 'Stealth Route', difficulty: 'Easy' }
  ],
  timeToChoose: number
}
```

---

### Notification & Feedback Components

#### 20. NotificationDisplay.jsx
**Path:** `src/components/UI/NotificationDisplay.jsx`
**Purpose:** Toast notifications for game events
**Position:** Top-center
**State:** ⚠️ Needs Queue System
**Notification Types:**
- Item collected
- Achievement unlocked
- Weapon unlocked
- Puzzle solved
- Enemy defeated (boss)

**Current Issue:** Doesn't handle multiple simultaneous notifications

---

#### 21. AchievementNotification.jsx
**Path:** `src/components/UI/AchievementNotification.jsx`
**Purpose:** Achievement unlock popup
**Position:** Center screen (temporary overlay)
**State:** 🆕 Additional Feature
**Animation:** Slide in from top, hold 3s, slide out

---

#### 22. TutorialPopup.jsx
**Path:** `src/components/UI/TutorialPopup.jsx`
**Purpose:** Contextual gameplay hints
**State:** 🆕 Additional Feature
**Features:**
- First-time action hints
- Dismissable
- Can be disabled in settings

---

#### 23. MissionBriefing.jsx
**Path:** `src/components/UI/MissionBriefing.jsx`
**Purpose:** Pre-level story and objectives
**State:** 🆕 Additional Feature
**Displays:**
- Level name
- Story text
- Primary objectives
- Optional objectives
- Skip button

---

### Mobile-Specific Components

#### 24. MobileControls.jsx
**Path:** `src/components/UI/MobileControls.jsx`
**Purpose:** Touch controls for mobile devices
**State:** ⚠️ Untested on Mobile
**Controls:**
- Tap to shoot
- Virtual joystick (movement)
- Weapon switch buttons
- Pause button

**Layout:**
- Left: Virtual joystick
- Right: Shoot button
- Top-right: Weapon selector
- Top-left: Pause

---

### Informational Components

#### 25. StoryDialogue.jsx
**Path:** `src/components/UI/StoryDialogue.jsx`
**Purpose:** In-game story exposition
**Position:** Bottom-center overlay
**State:** ⚠️ Minimal Content
**Features:**
- Character portraits
- Dialogue text
- Auto-advance option
- Skip button

**Data Source:** src/data/storyData.js

---

#### 26. CollectiblesLibrary.jsx
**Path:** `src/components/UI/CollectiblesLibrary.jsx`
**Purpose:** View collected lore items and artifacts
**State:** 🆕 Additional Feature
**Categories:**
- Enemy intel
- Weapon schematics
- Story fragments
- Concept art

---

#### 27. CurrencyDisplay.jsx
**Path:** `src/components/UI/CurrencyDisplay.jsx`
**Purpose:** Shows collected coins/currency
**Position:** Top-right (below score)
**State:** 🆕 Additional Feature
**Props:**
```javascript
{
  coins: number,
  recentlyCollected: boolean  // Pulse animation
}
```

---

### Settings Sub-Components

#### 28. TutorialSettings.jsx
**Path:** `src/components/UI/TutorialSettings.jsx`
**Purpose:** Tutorial hint preferences
**State:** 🆕 Additional Feature

#### 29. PostProcessingSettings.jsx
**Path:** `src/components/UI/PostProcessingSettings.jsx`
**Purpose:** Graphics post-processing controls
**State:** 🆕 Additional Feature

#### 30. DynamicLightingSettings.jsx
**Path:** `src/components/UI/DynamicLightingSettings.jsx`
**Purpose:** Lighting quality settings
**State:** 🆕 Additional Feature

---

### Puzzle-Specific UI

#### 31. PuzzleHintDisplay.jsx
**Path:** `src/components/UI/PuzzleHintDisplay.jsx`
**Purpose:** Shows puzzle hints after time delay
**State:** 🆕 Additional Feature
**Props:**
```javascript
{
  puzzleId: string,
  hintLevel: number,  // 1-3 (progressive hints)
  timeUntilHint: number
}
```

**Data Source:** src/data/puzzleHintConfigs.js

---

### Additional UI Components

#### 32. EnemyWarningIndicator.jsx
**Path:** `src/components/UI/EnemyWarningIndicator.jsx`
**Purpose:** Off-screen enemy position indicators
**Position:** Screen edges
**State:** ⚠️ Basic Implementation
**Visual:** Arrows pointing to enemies outside view

#### 33. PowerUpIndicator.jsx
**Path:** `src/components/UI/PowerUpIndicator.jsx`
**Purpose:** Active power-up status icons
**Position:** Bottom-left
**State:** 🆕 Additional Feature
**Shows:**
- Active power-ups
- Duration timers
- Stack counts

#### 34. ComboIndicator.jsx
**Path:** `src/components/UI/ComboIndicator.jsx`
**Purpose:** Alternate combo display style
**State:** 🆕 Duplicate of ComboDisplay?

---

## Game Components

All game components located in: `src/components/Game/`

### Core Game Systems

#### 35. GameCanvas.jsx
**Path:** `src/components/Game/GameCanvas.jsx`
**Purpose:** Main Three.js canvas container and game loop orchestrator
**State:** ✅ Fully Functional
**Responsibilities:**
- Initialize Three.js scene, camera, renderer
- Game loop (60 FPS target)
- Component mounting and lifecycle
- Event listener setup

**Children Components:**
- LevelManager
- UnifiedCombatSystem
- WeaponController
- VisualFeedbackSystem
- InteractivePuzzle
- WeaponPickup
- UnifiedMovementController
- ProjectileSystemBridge
- SoundManager
- HUD

**Key Three.js Objects:**
```javascript
scene: THREE.Scene
camera: THREE.PerspectiveCamera
renderer: THREE.WebGLRenderer
clock: THREE.Clock
```

**Game Loop:**
```javascript
animate() {
  requestAnimationFrame(animate)
  delta = clock.getDelta()

  // Update all systems
  LevelManager.update(delta)
  UnifiedCombatSystem.update(delta)
  UnifiedMovementController.update(delta)
  EnemyAISystem.update(delta)
  ParticleSystem.update(delta)

  renderer.render(scene, camera)
}
```

**Referenced By:** App.jsx

---

#### 36. GameCanvasWrapper.jsx
**Path:** `src/components/Game/GameCanvasWrapper.jsx`
**Purpose:** Error boundary wrapper for GameCanvas
**State:** ✅ Fully Functional
**Features:**
- Catches rendering errors
- Displays fallback UI
- Provides recovery options

---

### Enemy & Combat Systems

#### 37. UnifiedRoomManager.jsx
**Path:** `src/components/Game/UnifiedRoomManager.jsx`
**Purpose:** **CRITICAL** - Manages enemy spawning, state, and lifecycle
**State:** ✅ Fully Functional
**Responsibilities:**
- Load room enemy layouts from levelRooms.js
- Create THREE.Group meshes for enemies
- Track enemy health, position, state
- Handle enemy death
- Trigger room completion events

**Key Methods:**
```javascript
loadRoom(roomConfig) {
  // Spawns enemies from roomConfig.enemyLayout[]
  enemies.forEach(enemyData => {
    const enemyGroup = createEnemyMesh(enemyData)
    scene.add(enemyGroup)
  })
}

updateEnemies(delta) {
  // Update enemy AI, animations, projectiles
  enemies.forEach(enemy => {
    EnemyAISystem.update(enemy, delta, playerPosition)
  })
}

handleEnemyDeath(enemyId) {
  // Remove from scene, update state
  scene.remove(enemyMesh)
  dispatch({ type: 'ENEMY_DEFEATED', enemyId })
}
```

**Data Source:** src/data/levelRooms.js → getLevelRooms(level)

**Important Notes:**
- Enemies are NOT separate component files
- Enemies created procedurally as THREE.Group objects
- Enemy types: basic_shooter, armored, ninja, bomb_thrower, fast_debuffer, boss
- Position format: `{ x, y, z }`

**Enemy State Tracking:**
```javascript
{
  id: string,
  type: string,
  health: number,
  maxHealth: number,
  position: { x, y, z },
  state: 'idle' | 'attacking' | 'hurt' | 'dying',
  mesh: THREE.Group,
  behavior: EnemyBehavior
}
```

---

#### 38. UnifiedCombatSystem.jsx
**Path:** `src/components/Game/UnifiedCombatSystem.jsx`
**Purpose:** Player shooting mechanics and hit detection
**State:** ✅ Fully Functional
**Responsibilities:**
- Mouse click handling
- Raycasting for hit detection
- Damage calculation
- Visual feedback triggering
- Score/combo updates

**Key Methods:**
```javascript
handleShoot(mousePosition) {
  // Convert mouse position to 3D ray
  raycaster.setFromCamera(mousePosition, camera)

  // Check intersections with enemy meshes
  const intersects = raycaster.intersectObjects(enemyMeshes)

  if (intersects.length > 0) {
    const hitEnemy = intersects[0].object
    const isHeadshot = intersects[0].point.y > enemyHeight * 0.8

    const damage = calculateDamage(currentWeapon, isHeadshot)
    enemyRef.takeDamage(damage)

    // Trigger effects
    ParticleSystem.createHitEffect(intersects[0].point)
    updateCombo()
    updateScore(damage * comboMultiplier)
  }
}
```

**Weapon Integration:** Uses WeaponSystem for weapon stats

**Combo System:**
- 3 seconds between hits to maintain combo
- Multiplier: 1x → 2x → 3x → 5x → 10x
- Resets on miss or timeout

---

### Movement & Camera Systems

#### 39. UnifiedMovementController.jsx
**Path:** `src/components/Game/UnifiedMovementController.jsx`
**Purpose:** On-rails camera movement along predefined path
**State:** ✅ Fully Functional
**Movement Types:**
- Linear path movement
- Bezier curve movement (smooth turns)
- Pause at combat encounters
- Speed variation (slow during puzzles, fast during transitions)

**Key Properties:**
```javascript
{
  progress: number,        // 0.0 to 1.0 along path
  speed: number,           // Units per second
  path: THREE.CurvePath,   // Movement spline
  lookTarget: THREE.Vector3, // Camera look-at point
  paused: boolean          // Combat/puzzle pause
}
```

**Camera Update:**
```javascript
update(delta) {
  if (!paused) {
    progress += speed * delta

    const position = path.getPointAt(progress)
    camera.position.copy(position)
    camera.lookAt(lookTarget)
  }
}
```

**Path Configuration:** Defined in src/data/roomConfigs.js

---

### Weapon Systems

#### 40. WeaponController.jsx
**Path:** `src/components/Game/WeaponController.jsx`
**Purpose:** Weapon switching and state management
**State:** ✅ Fully Functional
**Controls:**
- Keyboard: 1-9 keys
- Mouse: Scroll wheel
- Mobile: Swipe gestures

**Weapon State:**
```javascript
{
  currentWeapon: string,     // 'pistol', 'shotgun', etc.
  unlockedWeapons: string[], // Available weapons
  ammo: {
    pistol: { current: Infinity, reserve: Infinity },
    shotgun: { current: 8, reserve: 32 },
    rapidfire: { current: 50, reserve: 200 },
    grappling: { current: Infinity, reserve: Infinity },
    bomb_explosive: { current: 1, reserve: 1 },
    // ...etc
  },
  isReloading: boolean,
  reloadProgress: number
}
```

**Data Source:** src/data/weaponStats.js

**Dispatches:**
- SWITCH_WEAPON
- RELOAD_WEAPON
- FIRE_WEAPON
- UNLOCK_WEAPON

---

### Visual & Effects Systems

#### 41. VisualFeedbackSystem.jsx
**Path:** `src/components/Game/VisualFeedbackSystem.jsx`
**Purpose:** Particle effects and visual feedback
**State:** ⚠️ Basic Particle Effects Only
**Effects:**
- Muzzle flash (implemented)
- Hit sparks (implemented)
- Explosions (basic)
- Blood splatter (placeholder)
- Smoke trails (placeholder)

**Uses:** src/systems/ParticleSystem.js

---

#### 42. WeaponEffects.jsx
**Path:** `src/components/Game/WeaponEffects.jsx`
**Purpose:** Weapon-specific visual effects
**State:** ⚠️ Muzzle Flash Only
**Effects:**
- Muzzle flash positioning
- Tracer rounds (not implemented)
- Shell ejection (not implemented)

---

#### 43. ProjectileSystemBridge.jsx
**Path:** `src/components/Game/ProjectileSystemBridge.jsx`
**Purpose:** Renders enemy projectiles in Three.js scene
**State:** ✅ Functional
**Responsibilities:**
- Visualize enemy bullets/bombs
- Update projectile positions
- Handle projectile collisions with player
- Remove expired projectiles

**Projectile Types:**
- Bullet (basic shooter)
- Heavy bullet (armored enemy)
- Bomb (bomb thrower)
- Shuriken (ninja)

---

### Level Management Systems

#### 44. LevelManager.jsx
**Path:** `src/components/Game/LevelManager.jsx`
**Purpose:** **CRITICAL** - Multi-room level progression and environment loading
**State:** ✅ Fully Functional
**Responsibilities:**
- Load level configuration
- Manage room transitions
- Spawn environments
- Track level completion
- Handle level end conditions

**Key Methods:**
```javascript
loadLevel(levelNumber) {
  const rooms = getLevelRooms(levelNumber)
  currentRoom = 0
  loadRoom(rooms[currentRoom])
}

loadRoom(roomConfig) {
  // Clear previous room
  clearRoom()

  // Load environment
  EnvironmentSystem.loadEnvironment(roomConfig.environment)

  // Spawn enemies
  UnifiedRoomManager.loadRoom(roomConfig)

  // Set camera path
  UnifiedMovementController.setPath(roomConfig.cameraPath)

  // Spawn items
  spawnRoomItems(roomConfig.items)
}

onRoomComplete() {
  currentRoom++
  if (currentRoom < rooms.length) {
    loadRoom(rooms[currentRoom])
  } else {
    onLevelComplete()
  }
}
```

**Data Sources:**
- src/data/levelRooms.js (room configs)
- src/data/levelItems.js (item placements)
- src/data/roomConfigs.js (detailed room data)

**Important:** Levels have 2 rooms each (total 12 levels = 24 rooms)

---

#### 45. RoomTransition.jsx
**Path:** `src/components/Game/RoomTransition.jsx`
**Purpose:** Visual transition effect between rooms
**State:** 🆕 Additional Feature
**Effects:**
- Fade to black
- Loading indicator
- Room name display

---

### Pickup & Collectible Systems

#### 46. WeaponPickup.jsx
**Path:** `src/components/Game/WeaponPickup.jsx`
**Purpose:** Collectible weapon items in 3D space
**State:** ⚠️ Basic Collectibles
**Pickup Types:**
- Weapon unlocks (shotgun, rapidfire, grappling)
- Ammo refills
- Weapon upgrades

**Position Data:** src/data/levelRooms.js → room.weaponPickups[]

**⚠️ CRITICAL OVERLAP ISSUE:**
All weapon pickups currently at same position: `{ x: -8, y: 6, z: -50 }`
See POSITIONING_GUIDE.md for fix details.

**Collection:**
- Automatic when camera moves close
- Triggers UNLOCK_WEAPON action
- Visual: Floating spinning weapon model
- Effect: Particle burst on collection

---

#### 47. PowerUpPickup.jsx
**Path:** `src/components/Game/PowerUpPickup.jsx`
**Purpose:** Temporary power-up items
**State:** 🆕 Additional Feature
**Power-Up Types:**
- Speed boost
- Damage boost
- Shield
- Rapid fire
- Multi-shot

**Position Data:** src/data/levelItems.js

---

### Puzzle Systems

#### 48. InteractivePuzzle.jsx
**Path:** `src/components/Game/InteractivePuzzle.jsx`
**Purpose:** Main puzzle system integrator
**State:** ⚠️ Framework Only
**Responsibilities:**
- Load puzzle configuration
- Manage puzzle state
- Track player input
- Trigger puzzle completion events

**Puzzle Types:**
- Switch sequence (shoot switches in order)
- Timed targets (shoot all targets quickly)
- Color match (shoot matching colors)
- Terrain modifier (not implemented)

**Data Source:** src/data/puzzleConfigs.js

---

#### 49. PuzzleManager.jsx
**Path:** `src/components/Game/PuzzleManager.jsx`
**Purpose:** Puzzle lifecycle and state management
**State:** ⚠️ Basic Structure
**Methods:**
```javascript
startPuzzle(puzzleId) {
  // Load puzzle config
  // Initialize puzzle UI
  // Start timer
}

checkSolution(playerInput) {
  // Validate solution
  // Award points if correct
  // Trigger completion event
}

onPuzzleTimeout() {
  // No penalty, just move on
}
```

---

#### 50. SequencePuzzleManager.jsx
**Path:** `src/components/Game/SequencePuzzleManager.jsx`
**Purpose:** Manages sequence-based puzzles
**State:** 🆕 Additional Feature

---

#### 51. PathSelector.jsx (Game Component)
**Path:** `src/components/Game/PathSelector.jsx`
**Purpose:** Branching path selection arrows in 3D space
**State:** ⚠️ Not Integrated
**Concept:**
- Shoot left/right arrows at junctions
- Chooses path through level
- Affects narrative and loot

**Data Source:** src/data/pathConfigs.js

---

### Advanced Game Features

#### 52. SecretRoomManager.jsx
**Path:** `src/components/Game/SecretRoomManager.jsx`
**Purpose:** Hidden room discovery and access
**State:** 🆕 Additional Feature
**Data Source:** src/data/secretRoomConfigs.js

---

#### 53. BossIntroSequence.jsx
**Path:** `src/components/Game/BossIntroSequence.jsx`
**Purpose:** Cinematic boss introduction
**State:** 🆕 Additional Feature
**Features:**
- Camera pan to boss
- Boss name reveal
- Health bar animation

**Data Source:** src/data/bossConfigs.js

---

#### 54. DestructibleManager.jsx
**Path:** `src/components/Game/DestructibleManager.jsx`
**Purpose:** Manages breakable environment objects
**State:** 🆕 Additional Feature
**Data Source:** src/data/destructibleConfigs.js

---

#### 55. HazardManager.jsx
**Path:** `src/components/Game/HazardManager.jsx`
**Purpose:** Environmental hazards (fire, spikes, lasers)
**State:** 🆕 Additional Feature
**Data Source:** src/data/hazardConfigs.js

---

#### 56. TutorialManager.jsx
**Path:** `src/components/Game/TutorialManager.jsx`
**Purpose:** In-game tutorial system
**State:** 🆕 Additional Feature
**Features:**
- First-time action detection
- Contextual hints
- Progress tracking

---

#### 57. PuzzleHintVisual.jsx
**Path:** `src/components/Game/PuzzleHintVisual.jsx`
**Purpose:** 3D visual hints for puzzles
**State:** 🆕 Additional Feature
**Examples:**
- Glowing switch indicators
- Arrows pointing to targets
- Number displays

---

### Utility Components

#### 58. SoundManager.jsx
**Path:** `src/components/Game/SoundManager.jsx`
**Purpose:** Audio system integration
**State:** ⚠️ Placeholder (Audio Disabled)
**Functions:**
- playSound() - logs to console
- playMusic() - logs to console
- stopSound() - no-op

**Note:** Audio disabled per CLAUDE.md specification. Re-enable in future phase.

---

## Puzzle Components

All puzzle components located in: `src/components/Game/Puzzles/`

**⚠️ ALL PUZZLE COMPONENTS ARE EMPTY FRAMEWORKS**

#### 59. SwitchSequence.jsx
**Path:** `src/components/Game/Puzzles/SwitchSequence.jsx`
**Purpose:** Shoot switches in correct order puzzle
**State:** ❌ Structure Only, No Implementation
**Needs:** Switch mesh creation, order validation, visual feedback

---

#### 60. TerrainModifier.jsx
**Path:** `src/components/Game/Puzzles/TerrainModifier.jsx`
**Purpose:** Shoot to alter terrain (raise platforms, lower walls)
**State:** ❌ Structure Only, No Implementation
**Needs:** Terrain interaction, collision updates, animation

---

#### 61. DoorMechanism.jsx
**Path:** `src/components/Game/Puzzles/DoorMechanism.jsx`
**Purpose:** Key items and tool interactions to open doors
**State:** ❌ Structure Only, No Implementation
**Needs:** Door models, key validation, opening animations

---

#### 62. PathSelector.jsx (Puzzle Component)
**Path:** `src/components/Game/Puzzles/PathSelector.jsx`
**Purpose:** Shoot arrows to choose level paths
**State:** ❌ Structure Only, No Implementation
**Note:** Duplicate of Game/PathSelector.jsx?

---

## Component Dependency Graph

```
App.jsx
 └─→ GameContext.Provider
      ├─→ MainMenu.jsx
      │    ├─→ LevelSelect.jsx
      │    └─→ Settings.jsx
      │         ├─→ TutorialSettings.jsx
      │         ├─→ PostProcessingSettings.jsx
      │         └─→ DynamicLightingSettings.jsx
      │
      └─→ GameCanvas.jsx (THREE.js root)
           ├─→ HUD.jsx
           │    ├─→ HealthBar.jsx
           │    ├─→ ScoreDisplay.jsx
           │    ├─→ AmmoCounter.jsx
           │    ├─→ ComboDisplay.jsx
           │    ├─→ PuzzleDisplay.jsx
           │    └─→ BossHealthBar.jsx (conditional)
           │
           ├─→ LevelManager.jsx
           │    ├─→ EnvironmentSystem (from systems/)
           │    ├─→ UnifiedRoomManager.jsx
           │    │    ├─→ EnemyAISystem (from systems/)
           │    │    └─→ WeaponUpgradeSystem (from systems/)
           │    │
           │    ├─→ RoomTransition.jsx
           │    ├─→ SecretRoomManager.jsx
           │    ├─→ BossIntroSequence.jsx
           │    ├─→ DestructibleManager.jsx
           │    └─→ HazardManager.jsx
           │
           ├─→ UnifiedCombatSystem.jsx
           │    ├─→ WeaponSystem (from systems/)
           │    ├─→ ParticleSystem (from systems/)
           │    └─→ THREE.Raycaster
           │
           ├─→ WeaponController.jsx
           │    └─→ weaponStats.js (data)
           │
           ├─→ UnifiedMovementController.jsx
           │    └─→ roomConfigs.js (data)
           │
           ├─→ InteractivePuzzle.jsx
           │    ├─→ PuzzleManager.jsx
           │    ├─→ SequencePuzzleManager.jsx
           │    └─→ puzzleConfigs.js (data)
           │
           ├─→ WeaponPickup.jsx
           │    └─→ levelRooms.js (data)
           │
           ├─→ PowerUpPickup.jsx
           │    └─→ levelItems.js (data)
           │
           ├─→ VisualFeedbackSystem.jsx
           │    └─→ ParticleSystem (from systems/)
           │
           ├─→ WeaponEffects.jsx
           ├─→ ProjectileSystemBridge.jsx
           ├─→ TutorialManager.jsx
           ├─→ PuzzleHintVisual.jsx
           └─→ SoundManager.jsx (disabled)
```

---

## Component Status Matrix

| Component | Status | Functionality | Testing | Priority |
|-----------|--------|---------------|---------|----------|
| **UI Components** |
| HUD | ✅ Complete | 100% | Tested | - |
| HealthBar | ✅ Complete | 100% | Tested | - |
| ScoreDisplay | ✅ Complete | 100% | Tested | - |
| AmmoCounter | ✅ Complete | 100% | Tested | - |
| MainMenu | ✅ Complete | 100% | Tested | - |
| LevelSelect | ✅ Complete | 100% | Tested | - |
| Settings | ✅ Complete | 100% | Tested | - |
| GameOverScreen | ✅ Complete | 100% | Tested | - |
| PauseMenu | ✅ Complete | 100% | Tested | - |
| BossHealthBar | ⚠️ Partial | 70% | Tested | Medium |
| ComboDisplay | ⚠️ Partial | 60% | Tested | Low |
| PuzzleDisplay | ⚠️ Partial | 30% | Untested | High |
| Inventory | ⚠️ Partial | 40% | Untested | Medium |
| NotificationDisplay | ⚠️ Partial | 50% | Untested | Medium |
| MobileControls | ⚠️ Partial | 80% | Untested | High |
| StoryDialogue | ⚠️ Partial | 30% | Untested | Low |
| EnemyWarningIndicator | ⚠️ Partial | 60% | Tested | Low |
| WeaponUpgradeShop | 🆕 New | 90% | Untested | Low |
| PathChoiceUI | 🆕 New | 80% | Untested | Medium |
| **Game Components** |
| GameCanvas | ✅ Complete | 100% | Tested | - |
| LevelManager | ✅ Complete | 100% | Tested L1-3 | - |
| UnifiedRoomManager | ✅ Complete | 100% | Tested L1-3 | - |
| UnifiedCombatSystem | ✅ Complete | 100% | Tested | - |
| UnifiedMovementController | ✅ Complete | 100% | Tested | - |
| WeaponController | ✅ Complete | 100% | Tested | - |
| ProjectileSystemBridge | ✅ Complete | 100% | Tested | - |
| VisualFeedbackSystem | ⚠️ Partial | 50% | Tested | Medium |
| WeaponEffects | ⚠️ Partial | 40% | Tested | Low |
| InteractivePuzzle | ⚠️ Partial | 20% | Untested | High |
| PuzzleManager | ⚠️ Partial | 30% | Untested | High |
| WeaponPickup | ⚠️ Partial | 70% | Has Bug | **🔴 CRITICAL** |
| PathSelector | ⚠️ Partial | 30% | Untested | Medium |
| SoundManager | ⚠️ Disabled | 0% | N/A | Low |
| **Puzzle Components** |
| SwitchSequence | ❌ Empty | 0% | Untested | High |
| TerrainModifier | ❌ Empty | 0% | Untested | Medium |
| DoorMechanism | ❌ Empty | 0% | Untested | Medium |
| PathSelector (puzzle) | ❌ Empty | 0% | Untested | Low |

**Legend:**
- ✅ Complete: Fully functional
- ⚠️ Partial: Implemented but incomplete
- 🆕 New: Additional feature (not in original spec)
- ❌ Empty: Framework only, no logic

---

## Quick Component Finder

**"Enemy not spawning?"**
→ Check: UnifiedRoomManager.jsx (src/components/Game/)
→ Data: src/data/levelRooms.js
→ System: src/systems/EnemyAISystem.js

**"Weapon not unlocking?"**
→ Check: WeaponController.jsx (src/components/Game/)
→ Data: src/data/weaponStats.js
→ Pickup: WeaponPickup.jsx
→ Context: GameContext (player.unlockedWeapons)

**"UI element not showing?"**
→ Check: HUD.jsx (src/components/UI/)
→ Conditional: Verify props being passed
→ State: GameContext state values

**"Level not loading?"**
→ Check: LevelManager.jsx (src/components/Game/)
→ Data: src/data/levelRooms.js → getLevelRooms(level)
→ Context: GameContext.currentLevel

**"Puzzle not working?"**
→ Check: InteractivePuzzle.jsx (src/components/Game/)
→ Manager: PuzzleManager.jsx
→ Data: src/data/puzzleConfigs.js
→ **Warning:** Puzzle components are empty frameworks

**"Shooting not detecting hits?"**
→ Check: UnifiedCombatSystem.jsx (src/components/Game/)
→ System: src/systems/WeaponSystem.js
→ Raycasting: THREE.Raycaster intersection logic

**"Items not collectible?"**
→ Check: WeaponPickup.jsx (src/components/Game/)
→ Data: src/data/levelItems.js
→ **⚠️ Known Bug:** Weapon pickups overlap at (-8, 6, -50)

**"Camera not moving?"**
→ Check: UnifiedMovementController.jsx (src/components/Game/)
→ Data: src/data/roomConfigs.js (cameraPath)
→ System: Check `paused` state

**"Boss health bar not showing?"**
→ Check: HUD.jsx conditional rendering
→ Component: BossHealthBar.jsx
→ Data: GameContext.currentBoss
→ Config: src/data/bossConfigs.js

**"Mobile controls not responding?"**
→ Check: MobileControls.jsx (src/components/UI/)
→ Status: ⚠️ UNTESTED ON MOBILE DEVICES
→ Priority: HIGH

**"Audio not playing?"**
→ Status: **AUDIO DISABLED BY DESIGN**
→ Check: SoundManager.jsx (placeholder functions)
→ Util: src/utils/audioUtils.js (all no-ops)

---

## Component File Locations Quick Reference

```
src/components/
├── UI/
│   ├── HUD.jsx ✅
│   ├── HealthBar.jsx ✅
│   ├── ScoreDisplay.jsx ✅
│   ├── AmmoCounter.jsx ✅
│   ├── MainMenu.jsx ✅
│   ├── LevelSelect.jsx ✅
│   ├── Settings.jsx ✅
│   ├── GameOverScreen.jsx ✅
│   ├── PauseMenu.jsx ✅
│   ├── Inventory.jsx ⚠️
│   ├── BossHealthBar.jsx ⚠️
│   ├── ComboDisplay.jsx ⚠️
│   ├── PuzzleDisplay.jsx ⚠️
│   ├── NotificationDisplay.jsx ⚠️
│   ├── MobileControls.jsx ⚠️
│   ├── StoryDialogue.jsx ⚠️
│   ├── EnemyWarningIndicator.jsx ⚠️
│   ├── WeaponUpgradeShop.jsx 🆕
│   ├── PathChoiceUI.jsx 🆕
│   ├── [... 16 more UI components]
│
└── Game/
    ├── GameCanvas.jsx ✅
    ├── GameCanvasWrapper.jsx ✅
    ├── LevelManager.jsx ✅
    ├── UnifiedRoomManager.jsx ✅
    ├── UnifiedCombatSystem.jsx ✅
    ├── UnifiedMovementController.jsx ✅
    ├── WeaponController.jsx ✅
    ├── ProjectileSystemBridge.jsx ✅
    ├── VisualFeedbackSystem.jsx ⚠️
    ├── WeaponEffects.jsx ⚠️
    ├── InteractivePuzzle.jsx ⚠️
    ├── PuzzleManager.jsx ⚠️
    ├── WeaponPickup.jsx ⚠️🔴
    ├── PathSelector.jsx ⚠️
    ├── SoundManager.jsx ⚠️ (disabled)
    ├── [... 14 more game components]
    │
    └── Puzzles/
        ├── SwitchSequence.jsx ❌
        ├── TerrainModifier.jsx ❌
        ├── DoorMechanism.jsx ❌
        └── PathSelector.jsx ❌
```

---

## Notes

### Component Architecture Deviation
The original CLAUDE.md specification called for separate component files for:
- 6 Enemy types (BasicShooter.jsx, ArmoredEnemy.jsx, etc.)
- 5 Weapon types (Pistol.jsx, Shotgun.jsx, etc.)
- 4 Item types (Collectible.jsx, PowerUp.jsx, etc.)

**Actual Implementation:**
These are NOT separate components. Instead:
- **Enemies:** Created procedurally in UnifiedRoomManager.jsx as THREE.Group meshes
- **Weapons:** Managed through WeaponController.jsx + WeaponSystem.js
- **Items:** Managed through WeaponPickup.jsx + ItemSystem.js

**Reason:** See ARCHITECTURE_DECISIONS.md for justification

### System Over-Delivery
Original spec: 8 systems
Actual: 36 systems (450% increase)

This is a POSITIVE deviation showing extensive feature development.

### Missing Hooks
Only 1 of 7 planned hooks implemented (useAudio.js)
State management handled through GameContext instead

### Critical Issues
1. **Weapon Pickup Overlap** - All pickups at same coordinates
2. **Puzzle Components Empty** - Need implementation
3. **Mobile Untested** - MobileControls.jsx not verified
4. **Levels 4-12 Untested** - Only L1-3 confirmed working

---

**End of Component Reference Guide**
For positioning data, see: POSITIONING_GUIDE.md
For debugging errors, see: QUICK_REFERENCE.md
For data structures, see: DATA_STRUCTURE_MAP.md
