# Core Game Systems Documentation

## 1. Game Engine System
**File:** `src/systems/GameEngine.js`
**Status:** ✅ Fully Implemented
**Purpose:** Core Three.js renderer and scene manager

### Features
- Three.js scene initialization
- Camera setup and management
- WebGL renderer configuration
- Lighting system (ambient + directional + point lights)
- Event emitter system for inter-system communication
- Window resize handling
- Frame timing (deltaTime calculation)

### Key Methods
- `initialize(canvas)` - Sets up Three.js scene
- `update()` - Main update loop, emits update events
- `render()` - Renders scene with camera
- `on(event, callback)` - Event listener registration
- `emit(event, data)` - Event broadcasting
- `setupRoomCamera()` - Positions camera for room-based combat
- `pauseMovement()` / `resumeMovement()` - Movement control

### Current Configuration
- Camera FOV: 60 degrees
- Camera Position: (0, 2, 3)
- Look At: (0, 0, -6)
- Enemies positioned at z: -5 to -25

### Events Emitted
- `update` - Every frame with deltaTime
- `positionUpdate` - Player position changes
- `enemyKilled` - Enemy defeated
- `enemyHit` - Enemy takes damage
- `enemyAttack` - Enemy damages player
- `weaponFired` - Weapon fired
- `itemCollected` - Item picked up
- `itemEffect` - Item effect applied

---

## 2. Environment System
**File:** `src/systems/EnvironmentSystem.js`
**Status:** ⚠️ Partially Implemented
**Purpose:** Manages level themes, lighting, and environment

### Features
- Dynamic environment generation
- Theme-based lighting
- Fog configuration
- Skybox support (not implemented)
- Environment cleanup between levels

### Supported Themes
1. **Urban** - City environments (fog: 0x87CEEB)
2. **Jungle** - Dense vegetation (fog: 0x228B22)
3. **Space** - Space stations (fog: 0x000011)
4. **Haunted** - Gothic/horror (fog: 0x2F2F2F)
5. **Western** - Frontier towns (fog: 0xDEB887)

### Missing Features
- Actual 3D environment models
- Skybox textures
- Dynamic weather effects
- Interactive environment objects
- Destructible terrain

---

## 3. Enemy AI System
**File:** `src/systems/EnemyAISystem.js`
**Status:** ⚠️ Partially Implemented
**Purpose:** Enemy behavior, attacks, and AI logic

### Enemy Types Implemented
1. **Basic Shooter** - Standard ranged enemy
   - Health: 50-85
   - Attack: Projectile shooting
   - Behavior: Stationary, periodic attacks

2. **Armored Enemy** - Heavy tank unit
   - Health: 120-320
   - Attack: Heavy projectiles
   - Behavior: Slow fire rate, high damage

3. **Ninja** - Fast melee unit
   - Health: 40-135
   - Attack: Dash attacks
   - Behavior: Quick movement, stealth

4. **Bomb Thrower** - Area damage specialist
   - Health: 70-220
   - Attack: Explosive projectiles
   - Behavior: Arc trajectory attacks

5. **Fast Debuffer** - Speed-based debuff enemy
   - Health: 30-105
   - Attack: Rapid weak shots + debuff
   - Behavior: Fast movement, debuff application

6. **Boss** - Level boss encounters
   - Health: 350-800
   - Attack: Multiple attack patterns
   - Behavior: Phase-based combat

### AI Behaviors
- Shooting intervals (2.5s - 5.5s based on enemy type)
- Target tracking (player position)
- Attack pattern variations
- Health regeneration (bosses only)
- Aggro management

### Missing Features
- Path navigation
- Cover system
- Squad tactics
- Dynamic difficulty adjustment
- Stealth detection for ninjas
- Boss multi-phase attacks

---

## 4. Weapon System
**File:** `src/systems/WeaponSystem.js`
**Status:** ✅ Mostly Complete
**Purpose:** Weapon stats, projectile physics, damage calculation

### Weapons Implemented
1. **Pistol** (Default)
   - Damage: 25
   - Fire Rate: 2.0/sec
   - Reload: 1.5s
   - Accuracy: 0.9
   - Ammo: Infinite

2. **Shotgun**
   - Damage: 80 (8 pellets x 10 each)
   - Fire Rate: 0.8/sec
   - Reload: 2.5s
   - Spread: 15 degrees
   - Ammo: 50

3. **Rapid Fire**
   - Damage: 15
   - Fire Rate: 8.0/sec
   - Reload: 2.0s
   - Overheat: 3.0s sustained fire
   - Ammo: 200

4. **Grappling Arm**
   - Damage: 50
   - Fire Rate: 1.0/sec
   - Pull Force: 100
   - Special: Can pull enemies
   - Ammo: Infinite

5. **Bomb Weapons** (Partial)
   - Explosive, Ice, Water, Fire variants
   - Single use per bomb
   - Area damage
   - Ammo: 3 total

### Weapon Mechanics
- Raycasting for hit detection
- Reload system with timing
- Ammo management per weapon
- Weapon switching (1-4 keys)
- Muzzle flash effects
- Hit markers and feedback

### Missing Features
- Weapon upgrade system
- Weapon skins/cosmetics
- Advanced grappling mechanics (swing, terrain interaction)
- Bomb element interactions (fire melts ice, etc.)
- Weapon durability system
- Dual-wielding

---

## 5. Combat System
**File:** `src/components/Game/UnifiedCombatSystem.jsx`
**Status:** ✅ Fully Implemented
**Purpose:** Player shooting, hit detection, damage application

### Features
- Mouse click shooting
- Three.js raycasting for hit detection
- Damage calculation with multipliers
- Hit/miss accuracy tracking
- Score calculation
- Ammo consumption
- Reload enforcement
- Visual feedback (particles, hit markers)

### Combat Flow
```
1. Mouse Click Event
2. Get current weapon
3. Check ammo availability
4. Check reload status
5. Perform raycast from camera
6. Check enemy intersections
7. Apply damage to nearest enemy
8. Update ammo/accuracy
9. Trigger visual effects
10. Emit combat events
```

### Damage Calculation
- Base weapon damage
- Critical hit chance (15%)
- Headshot multiplier (2.0x)
- Armor reduction (enemies)
- Distance falloff (shotgun)

### Missing Features
- Penetration shots (multi-enemy hits)
- Ricochet mechanics
- Weak point targeting (beyond headshots)
- Environmental damage (shoot explosive barrels)
- Combo system integration

---

## 6. Particle System
**Files:** `src/systems/ParticleSystem.js`, `src/systems/EnhancedParticleSystem.js`
**Status:** ⚠️ Partially Implemented
**Purpose:** Visual effects for combat, explosions, impacts

### Effect Types
- Muzzle flash
- Hit sparks
- Blood splatter (stylized)
- Explosions
- Smoke trails
- Debris particles
- Energy effects

### Particle Properties
- Position, velocity, acceleration
- Lifetime and fade
- Color and opacity
- Size and scale
- Gravity and physics

### Performance
- Max particles: 1000
- Particle pooling (not yet implemented)
- Instanced rendering (not yet implemented)
- Culling for off-screen particles

### Missing Features
- Particle pooling for performance
- GPU particle simulation
- Advanced particle shaders
- Weather effects (rain, snow)
- Persistent environmental particles

---

## 7. Progression System
**File:** `src/systems/ProgressionSystem.js`
**Status:** ✅ Fully Implemented
**Purpose:** Persistent unlocks, level completion, achievements

### Features
- Weapon unlock tracking
- Level completion tracking
- Key item collection
- Secret room discovery
- localStorage persistence
- Progression summary API

### Tracked Data
- Unlocked weapons (Set)
- Completed levels (Set)
- Collected key items (Set)
- Secret rooms found (Set)
- Last saved timestamp

### Methods
- `unlockWeapon(type)` - Unlock new weapon
- `isWeaponUnlocked(type)` - Check weapon availability
- `completeLevel(number)` - Mark level complete
- `isLevelUnlocked(number)` - Check level availability
- `collectKeyItem(id)` - Add key item
- `discoverSecretRoom(id)` - Mark secret found
- `resetProgression()` - Clear all progress
- `saveProgression()` / `loadProgression()` - Persistence

### Missing Features
- Cloud save backup
- Cross-device sync
- Achievement system
- Stat tracking (total kills, accuracy %, etc.)
- Leaderboards
- Progression rewards (cosmetics, bonuses)

---

## 8. Save System
**File:** `src/systems/SaveSystem.js`
**Status:** ✅ Basic Implementation
**Purpose:** Save/load game state to localStorage

### Features
- Auto-save on level complete
- Manual save slots (not UI-exposed)
- localStorage-based storage
- State serialization/deserialization
- Save metadata (timestamp, version)

### Saved Data
- Current level
- Player stats (health, score, accuracy)
- Room progression (visited, completed)
- Inventory state
- Settings

### Methods
- `saveGame(state, slotName)` - Save to slot
- `loadGame(slotName)` - Load from slot
- `getSaveSlots()` - List available saves
- `deleteSave(slotName)` - Remove save

### Missing Features
- Multiple save slots UI
- Save file naming
- Save file thumbnails
- Cloud backup
- Checkpoint system within levels
- Quick save/quick load hotkeys

---

## 9. Item System
**File:** `src/systems/ItemSystem.js`
**Status:** ⚠️ Partially Implemented
**Purpose:** Collectible items, powerups, key items

### Item Types
1. **Health Packs** - Restore health
2. **Ammo Crates** - Refill weapon ammo
3. **Powerups** - Temporary buffs (speed, damage, accuracy)
4. **Key Items** - Unlock doors/paths
5. **Collectibles** - Score bonuses

### Item Effects
- Health restoration
- Ammo replenishment
- Temporary stat boosts
- Permanent upgrades
- Score bonuses

### Missing Features
- Item placement in levels (minimal content)
- Item interaction animations
- Item descriptions/tooltips
- Consumable inventory management
- Crafting system
- Item rarity tiers

---

## 10. Puzzle System
**File:** `src/systems/PuzzleSystem.js`
**Status:** ⚠️ Basic Structure Only
**Purpose:** Interactive puzzles, time-sensitive challenges

### Puzzle Types Planned
1. **Switch Sequence** - Shoot switches in order
2. **Terrain Modifier** - Shoot to change environment
3. **Door Mechanism** - Use key items + tools
4. **Path Selector** - Shoot arrows to choose route

### Puzzle Features
- Time limits
- No damage penalties
- Bonus score rewards
- Visual indicators
- Reset capability

### Current Implementation
- Basic puzzle framework
- Timer system
- Completion detection
- Minimal puzzle content

### Missing Features
- Complete puzzle designs for all levels
- Visual puzzle tutorials
- Puzzle difficulty scaling
- Puzzle achievements
- Optional vs required puzzles
- Environmental puzzles (shoot to reveal paths)

---

## 11. Room Management System
**Files:** `src/components/Game/UnifiedRoomManager.jsx`, `src/components/Game/LevelManager.jsx`
**Status:** ✅ Fully Implemented
**Purpose:** Multi-room level progression, enemy spawning

### Features
- Room-based level structure
- Sequential room progression
- Enemy spawning per room
- Room completion detection
- Transition between rooms
- Level configuration loading

### Room Flow
```
1. Load level configuration
2. Load first room
3. Spawn enemies for room
4. Wait for all enemies defeated
5. Mark room complete
6. Load next room
7. Repeat until level complete
```

### Room Data Structure
```javascript
{
  id: 'level_1_room_1',
  name: 'Entry Chamber',
  theme: 'urban_entry',
  enemyCount: 3,
  difficulty: 'easy',
  enemyLayout: [{type, position, health, shootInterval}],
  weaponPickups: [{weaponType, position}]
}
```

### Missing Features
- Branching paths between rooms
- Secret room entrances
- Room hazards and traps
- Dynamic room generation
- Room-specific music/ambience

---

## 12. Projectile System
**File:** `src/systems/EnemyProjectileSystem.js`
**Status:** ⚠️ Basic Implementation
**Purpose:** Enemy projectile physics and damage

### Features
- Projectile spawning
- Physics simulation
- Collision detection with player
- Damage application
- Visual representation (spheres)
- Lifetime management

### Projectile Properties
- Position and velocity
- Damage value
- Visual size and color
- Collision radius
- Owner (enemy) reference

### Missing Features
- Projectile pooling
- Advanced projectile types (homing, explosive, bouncing)
- Player projectile visualization
- Projectile trails
- Hitbox accuracy improvements

---

## 13. Boss Attack System
**File:** `src/systems/BossAttackSystem.js`
**Status:** ⚠️ Minimal Implementation
**Purpose:** Boss-specific attack patterns

### Planned Boss Attacks
1. **Laser Barrage** - Continuous beam attack
2. **Missile Swarm** - Multiple homing projectiles
3. **Teleport Strike** - Instant position change + melee
4. **Shield Phase** - Temporary invulnerability
5. **Summon Minions** - Spawn adds

### Boss Phases
- Phase 1: Basic attacks (100%-66% health)
- Phase 2: Advanced attacks (66%-33% health)
- Phase 3: Desperate attacks (33%-0% health)

### Missing Features
- Complete boss attack implementations
- Boss phase transitions
- Boss health gates
- Boss enrage mechanics
- Cinematic boss intros

---

## 14. Combo System
**File:** `src/systems/ComboSystem.js`
**Status:** ⚠️ Basic Structure
**Purpose:** Reward consecutive kills with score multipliers

### Features
- Combo counter
- Time window (3 seconds)
- Score multiplier (1.5x)
- Combo break detection
- Visual combo UI

### Missing Features
- Combo tiers (2x, 3x, 5x, etc.)
- Combo rewards beyond score
- Combo preservation powerups
- Combo challenges
- Sound effects and feedback

---

## System Integration Status

### ✅ Working Integrations
- GameEngine ↔ GameContext (event-driven updates)
- UnifiedCombatSystem ↔ EnemyAISystem (damage application)
- WeaponSystem ↔ GameContext (ammo management)
- ProgressionSystem ↔ SaveSystem (persistent data)
- LevelManager ↔ RoomManager (level flow)

### ⚠️ Partial Integrations
- ItemSystem ↔ GameContext (basic effects only)
- PuzzleSystem ↔ LevelManager (structure only)
- ParticleSystem ↔ Combat (basic effects)
- BossSystem ↔ EnemyAI (minimal boss features)

### ❌ Missing Integrations
- Audio system integration (completely disabled)
- Achievement system (not implemented)
- Telemetry/analytics
- Difficulty scaling system
- Weather/environment effects
