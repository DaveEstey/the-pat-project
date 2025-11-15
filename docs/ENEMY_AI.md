# Enemy AI Systems Documentation

## Overview
The enemy AI system manages all hostile entity behaviors, attack patterns, and difficulty scaling. Currently implements 6 enemy types with room-based spawning and progression.

## Core Files
- **AI System:** `src/systems/EnemyAISystem.js`
- **Enemy Stats:** `src/data/gameConfig.js` (lines 91-137)
- **Enemy Types:** `src/types/enemies.js`
- **Room Manager:** `src/components/Game/UnifiedRoomManager.jsx`
- **Level Spawns:** `src/data/levelRooms.js`

---

## Enemy Type Roster

### 1. Basic Shooter
**Type:** `basic`
**Status:** ✅ Fully Implemented
**Role:** Standard infantry unit

#### Base Stats
```javascript
{
  health: 50-85,           // scales with level
  damage: 15,
  fireRate: 1.5,           // shots per second
  accuracy: 0.6,           // 60% hit chance
  speed: 2.0,              // movement speed
  score: 100               // kill reward
}
```

#### Behavior
- **Positioning:** Stationary at spawn point
- **Attack Pattern:** Periodic projectile shooting
- **Targeting:** Always aims at player position
- **Movement:** None (room-based combat)
- **Special:** None

#### Combat Tactics
- Predictable attack timing (3.8s - 5.5s intervals)
- Medium-range threat
- Easy to eliminate with any weapon
- Often used in groups of 2-3

#### Spawn Locations
- Levels 1-12 (all levels)
- Front-line positions
- Elevated platforms
- Cover positions

#### Visual Design (Planned)
- Basic armor (red/brown)
- Standard rifle weapon
- Humanoid shape
- Alert animations

---

### 2. Armored Enemy
**Type:** `armored`
**Status:** ✅ Fully Implemented
**Role:** Tank unit, bullet sponge

#### Base Stats
```javascript
{
  health: 120-320,         // very high, scales dramatically
  damage: 25,
  fireRate: 1.0,           // slower than basic
  accuracy: 0.7,           // 70% hit chance
  speed: 1.5,              // slow movement
  armor: 0.5,              // 50% damage reduction
  score: 200               // high reward
}
```

#### Behavior
- **Positioning:** Central defensive positions
- **Attack Pattern:** Heavy slow projectiles
- **Targeting:** Player focus
- **Movement:** Minimal
- **Special:** Damage reduction

#### Combat Tactics
- Requires sustained fire or shotgun bursts
- Priority target in mixed groups
- Often paired with faster enemies
- Can tank 4-13 pistol shots depending on level

#### Armor Mechanic (Partial)
- Takes 50% less damage from all sources
- No weak points currently
- Can be bypassed with grappling (planned)
- Fire bomb ignores armor (planned)

#### Spawn Locations
- Levels 1-12 (all levels)
- Center positions (0, y, z)
- Defensive chokepoints
- Boss support units

#### Visual Design (Planned)
- Heavy armor plating (metallic silver/gray)
- Large weapon (cannon or heavy MG)
- Bulky silhouette
- Slow, heavy animations

---

### 3. Ninja Enemy
**Type:** `ninja`
**Status:** ⚠️ Partially Implemented
**Role:** Fast melee assassin

#### Base Stats
```javascript
{
  health: 40-135,          // low-medium health
  damage: 35,              // high melee damage
  fireRate: 0,             // no ranged attack
  accuracy: 0.8,           // dash accuracy
  speed: 6.0,              // very fast
  stealth: true,           // stealth capability (not implemented)
  dashDistance: 10,        // dash range
  score: 150               // good reward
}
```

#### Behavior
- **Positioning:** Flanking positions
- **Attack Pattern:** Dash + melee strike
- **Targeting:** Closes distance rapidly
- **Movement:** Erratic, fast
- **Special:** Stealth phases (not implemented)

#### Combat Tactics
- Rushes player position
- High damage on contact
- Difficult to hit due to speed
- Best countered with rapid fire or shotgun

#### Dash Mechanic (Planned)
```
1. Start position (side or back)
2. Brief charge-up (0.3s)
3. Dash toward player (10 units)
4. Melee strike on arrival
5. Retreat if miss (planned)
6. Cooldown before next dash
```

#### Stealth Mechanic (Not Implemented)
- Becomes semi-transparent
- Reduced detection range
- Surprise attacks deal bonus damage
- Visual shimmer effect

#### Spawn Locations
- Levels 3-12 (mid to late game)
- Side positions for flanking
- Close-range spawn points
- Boss fight adds

#### Visual Design (Planned)
- Dark clothing (black/purple)
- Agile humanoid
- Katana or dual blades
- Fast, fluid animations
- Smoke effects on dash

---

### 4. Bomb Thrower
**Type:** `bomb_thrower`
**Status:** ⚠️ Basic Implementation
**Role:** Area denial, artillery

#### Base Stats
```javascript
{
  health: 70-220,          // medium-high health
  damage: 40,              // base explosion damage
  fireRate: 0.5,           // slow, deliberate attacks
  accuracy: 0.5,           // 50% (arc trajectory)
  speed: 1.8,              // slow movement
  explosionRadius: 8,      // area of effect
  score: 175               // good reward
}
```

#### Behavior
- **Positioning:** Back lines, elevated
- **Attack Pattern:** Lobbed explosive projectiles
- **Targeting:** Predictive aim (lead player movement)
- **Movement:** Minimal
- **Special:** Area damage

#### Combat Tactics
- Dangerous in confined spaces
- Telegraph attack (visible wind-up)
- Can damage multiple players (co-op planned)
- Explosion affects nearby enemies (planned)

#### Explosion Mechanic
```
1. Throw animation (1s)
2. Projectile arc
3. Impact or timer detonation
4. Explosion radius: 8 units
5. Damage falloff: 100% center, 25% edge
6. Visual explosion effect
```

#### Missing Features
- Arc trajectory not properly implemented
- No damage falloff
- Explosion radius not visualized
- Can't damage other enemies (friendly fire)
- No environmental damage

#### Spawn Locations
- Levels 2-12
- Elevated positions (y: 1-5)
- Back of formations
- Area denial positions

#### Visual Design (Planned)
- Bulky build
- Explosive packs visible
- Grenade launcher or catapult weapon
- Slow, deliberate animations
- Fuse-lit projectiles

---

### 5. Fast Debuffer
**Type:** `fast_debuffer`
**Status:** ⚠️ Basic Implementation
**Role:** Speed-based harassment

#### Base Stats
```javascript
{
  health: 30-105,          // low-medium health
  damage: 10,              // low direct damage
  fireRate: 3.0,           // very rapid fire
  accuracy: 0.4,           // 40% (spray and pray)
  speed: 8.0,              // fastest enemy
  debuffDuration: 5.0,     // debuff lasts 5 seconds
  score: 125               // medium reward
}
```

#### Behavior
- **Positioning:** Highly mobile, circling
- **Attack Pattern:** Rapid weak shots + debuff
- **Targeting:** Strafing attacks
- **Movement:** Constant motion
- **Special:** Player debuff application

#### Combat Tactics
- Hard to hit due to speed
- Low threat individually
- Dangerous in groups
- Disrupts player aim

#### Debuff Effects (Planned)
1. **Movement Slow** - Player moves 50% slower
2. **Reload Penalty** - Reload takes 50% longer
3. **Accuracy Loss** - Player accuracy reduced by 25%
4. **Visual Distortion** - Screen blur/shake

Current Implementation: No debuffs active

#### Missing Features
- Actual debuff application
- Debuff UI indicators
- Debuff cleansing mechanics
- Movement patterns (currently stationary)
- Speed-based evasion

#### Spawn Locations
- Levels 2-12
- Side positions
- Mixed with slower enemies
- Paired with armored units

#### Visual Design (Planned)
- Sleek, thin build
- Rapid-fire SMG or dual pistols
- Fast, twitchy animations
- Motion blur effects
- Neon/energy accents

---

### 6. Boss Enemies
**Type:** `boss`
**Status:** ⚠️ Minimal Implementation
**Role:** Major threat, level finale

#### Base Stats
```javascript
{
  health: 350-800,         // massive health pool
  damage: varies,          // per attack type
  fireRate: varies,        // per attack type
  accuracy: 0.8,           // generally high
  speed: varies,           // per phase
  phases: 3,               // multi-phase combat
  specialAttacks: [...]    // unique abilities
}
```

#### Behavior
- **Positioning:** Center stage, dramatic entrance
- **Attack Pattern:** Phase-based variety
- **Targeting:** Complex threat assessment
- **Movement:** Teleportation, charges
- **Special:** Multiple unique abilities

#### Boss Phases
```
Phase 1 (100%-66% HP): Basic attack patterns
- Standard projectiles
- Slow movement
- Telegraphed attacks
- Learning phase for player

Phase 2 (66%-33% HP): Advanced mechanics
- Faster attacks
- New attack types introduced
- Movement increases
- Summons adds (planned)

Phase 3 (33%-0% HP): Desperation
- Maximum aggression
- All attacks unlocked
- Enrage mechanics
- Last stand abilities
```

#### Special Attacks (Planned)
1. **Laser Barrage**
   - Continuous sweeping laser beam
   - High damage, tracks player
   - Must hide behind cover
   - 3-second duration

2. **Missile Swarm**
   - Launches 10+ homing missiles
   - Must shoot down or dodge
   - Explosions on impact
   - Area denial

3. **Teleport Strike**
   - Disappears briefly
   - Reappears near player
   - Melee attack immediately
   - Short vulnerability window

4. **Shield Phase**
   - Invulnerable for 5 seconds
   - Summons minions
   - Player must survive
   - Shield breaks with damage threshold (planned)

5. **Ground Slam**
   - Massive area attack
   - Must jump or grapple away
   - Stuns if hit
   - Environmental damage

#### Boss Fight Structure
```
1. Cinematic entrance (planned)
2. Phase 1 combat
3. Phase transition (health gates)
4. Phase 2 with new mechanics
5. Phase transition
6. Phase 3 desperation
7. Defeat sequence (planned)
8. Reward distribution
```

#### Current Bosses
- **Level 3 - Room 2:** Underground Fortress Boss (Health: 350)
- **Level 12 - Room 2:** Final Boss (Health: 800)

#### Missing Features
- Phase transitions
- Special attack implementations
- Health gates (can't reduce below phase threshold)
- Boss UI (phase indicators)
- Cinematic sequences
- Unique boss models
- Boss music (audio disabled)
- Enrage mechanics

#### Spawn Locations
- Level 3 (first boss)
- Level 6 (mid-game boss - planned)
- Level 9 (late-game boss - planned)
- Level 12 (final boss)

#### Visual Design (Planned)
- Massive size (3-5x player size)
- Unique silhouette per boss
- Glowing weak points
- Dramatic animations
- Phase-specific visual changes
- Particle effects and auras

---

## Enemy Spawn System

### Room-Based Spawning
**File:** `src/data/levelRooms.js`

#### Spawn Configuration
```javascript
{
  type: 'basic',                    // enemy type
  position: { x: -2, y: 0, z: -15 }, // 3D position
  health: 50,                       // override base health
  shootInterval: 4500               // milliseconds between shots
}
```

#### Spawn Rules
1. All enemies spawn at room start
2. Enemies are stationary (no patrol)
3. Enemies activate immediately
4. No enemy reinforcements
5. Room clears when all enemies defeated

#### Position Guidelines
- **X-axis:** -6 to 6 (left to right)
- **Y-axis:** 0 to 5 (ground to elevated)
- **Z-axis:** -5 to -25 (close to far)
- Camera at: (0, 2, 3)
- Camera looks at: (0, 0, -6)

#### Enemy Count Per Room
- **Easy:** 3 enemies
- **Medium:** 3-4 enemies
- **Hard:** 4-5 enemies
- **Very Hard:** 5-6 enemies
- **Extreme:** 6-7 enemies
- **Boss:** 1 boss + 0-2 adds

---

## AI Behavior System

### Current Implementation
**File:** `src/systems/EnemyAISystem.js`

#### Behavior States
1. **Idle** - Waiting for room start
2. **Active** - Shooting at intervals
3. **Dead** - Destroyed, awaiting cleanup

#### Missing States
- **Alert** - Detected player
- **Searching** - Lost sight of player
- **Retreating** - Low health fallback
- **Flanking** - Positioning for advantage
- **Cover** - Taking defensive position

### Attack Patterns

#### Basic Attack Pattern
```javascript
setInterval(() => {
  if (enemy.isAlive && playerInRange) {
    shootProjectile(playerPosition);
  }
}, enemy.shootInterval);
```

#### Advanced Patterns (Planned)
- **Burst Fire:** 3 shots rapid, long cooldown
- **Suppression:** Continuous fire for 2-3 seconds
- **Ambush:** Wait for player proximity
- **Coordinated:** Multiple enemies fire simultaneously
- **Adaptive:** Change pattern based on player behavior

---

## Difficulty Scaling

### Level-Based Scaling
```javascript
// Health scaling formula (example)
baseHealth + (levelNumber * 15)

// Examples:
Basic Shooter L1: 50 HP
Basic Shooter L6: 125 HP
Basic Shooter L12: 215 HP

Armored Enemy L1: 120 HP
Armored Enemy L6: 195 HP
Armored Enemy L12: 300 HP
```

### Shoot Interval Scaling
```javascript
// Later levels = faster attacks
baseInterval - (levelNumber * 100ms)

// Minimum interval: 2000ms (2 seconds)
```

### Enemy Count Scaling
- Levels 1-3: 3 enemies per room
- Levels 4-6: 3-4 enemies per room
- Levels 7-9: 4-5 enemies per room
- Levels 10-12: 5-7 enemies per room

### Enemy Type Distribution
```
Levels 1-2:  Basic, Armored
Levels 3-5:  + Ninja
Levels 6-8:  + Bomb Thrower
Levels 9-12: + Fast Debuffer, Boss
```

---

## Projectile System
**File:** `src/systems/EnemyProjectileSystem.js`

### Projectile Properties
```javascript
{
  position: Vector3,       // current position
  velocity: Vector3,       // movement vector
  damage: number,          // hit damage
  owner: enemyReference,   // which enemy fired
  lifetime: number,        // seconds before despawn
  visualMesh: THREE.Mesh   // Three.js sphere
}
```

### Projectile Physics
- **Speed:** 20 units/second
- **Gravity:** None (straight line)
- **Collision:** Sphere-based
- **Lifetime:** 5 seconds max
- **Visual:** Red glowing sphere

### Collision Detection
```javascript
// Check distance to player each frame
distance = projectile.position.distanceTo(playerPosition);
if (distance < hitRadius) {
  applyDamage(projectile.damage);
  removeProjectile();
}
```

### Missing Features
- Projectile trails
- Different projectile types (homing, explosive)
- Projectile deflection
- Bullet time slowdown
- Predictive aiming (lead targets)

---

## Enemy Visual Representation

### Current Implementation
- Simple colored cubes/spheres
- Different colors per enemy type
- Basic size differences
- No animations

### Planned Improvements
1. **3D Models**
   - Unique model per enemy type
   - Rigged and animated
   - Multiple LOD levels
   - Texture variations

2. **Animations**
   - Idle breathing
   - Walking/running
   - Attack wind-up
   - Taking damage reaction
   - Death sequences
   - Special ability animations

3. **Visual Feedback**
   - Damage numbers
   - Health bars above enemies
   - Status effect indicators
   - Alert icons
   - Targeting reticles

4. **Effects**
   - Muzzle flash
   - Impact effects
   - Death explosions
   - Ability charge-ups
   - Environmental interaction

---

## Enemy Audio (Disabled)

### Planned Sound Effects
- **Spawn:** Enemy arrival sound
- **Alert:** Detection vocalization
- **Attack:** Weapon firing sounds
- **Hurt:** Damage grunt/scream
- **Death:** Destruction sound
- **Special:** Ability-specific sounds

### Audio Features (Planned)
- 3D spatial audio
- Distinct voice per enemy type
- Dynamic mixing based on threat level
- Environmental sound occlusion

---

## AI Development Priorities

### Phase 1: Fix Core Issues (HIGH PRIORITY)
1. Implement ninja dash attacks
2. Add bomb thrower arc trajectory
3. Enable fast debuffer movement
4. Add debuff status effects
5. Fix boss phase transitions

### Phase 2: Add Depth (MEDIUM PRIORITY)
6. Implement cover system
7. Add flanking behaviors
8. Create coordinated attacks
9. Add enemy callouts
10. Implement retreat logic

### Phase 3: Polish (LOW PRIORITY)
11. Add enemy 3D models
12. Implement animations
13. Add visual feedback effects
14. Create unique boss designs
15. Add audio system

---

## Boss Design Reference

### Boss 1: Underground Fortress Commander (Level 3)
**Theme:** Industrial Military
**Health:** 350
**Phases:** 3

#### Attacks
- **Phase 1:** Standard turret fire
- **Phase 2:** Mortar barrage
- **Phase 3:** Melee charge + explosive mines

#### Strategy
- Stay mobile to avoid mortars
- Target weak points (glowing joints)
- Use grappling arm to pull off armor plates

---

### Boss 2: Jungle Temple Guardian (Level 6 - Planned)
**Theme:** Ancient Mystical
**Health:** 500
**Phases:** 3

#### Attacks
- **Phase 1:** Vine whips, poison darts
- **Phase 2:** Summon jungle enemies, stone pillars
- **Phase 3:** Berserk charge, earthquake slam

#### Strategy
- Shoot vines to prevent entanglement
- Destroy summoned adds quickly
- Dodge earthquake by staying airborne (grapple)

---

### Boss 3: Space Station AI (Level 9 - Planned)
**Theme:** Sci-Fi Technology
**Health:** 650
**Phases:** 3

#### Attacks
- **Phase 1:** Laser grid, drone swarm
- **Phase 2:** Teleportation, hacking (debuff)
- **Phase 3:** Core overload, system shutdown

#### Strategy
- Disable drones to reduce threat
- Predict teleport locations
- Shoot cooling vents during overload

---

### Final Boss: [REDACTED] (Level 12)
**Theme:** All Themes Combined
**Health:** 800
**Phases:** 3

#### Attacks
- All previous boss abilities
- Environment transformation per phase
- Summons elite enemies from all levels
- Ultimate desperation attack

#### Strategy
- Requires mastery of all weapons
- Environmental hazards increase each phase
- Must defeat adds while damaging boss
- Final phase is bullet hell + melee

---

## Enemy Balancing

### Damage Balance
| Enemy Type | Damage/Shot | Shots to Kill Player |
|------------|-------------|----------------------|
| Basic | 15 | 7 shots |
| Armored | 25 | 4 shots |
| Ninja | 35 | 3 hits |
| Bomb Thrower | 40 | 3 explosions |
| Fast Debuffer | 10 | 10 shots |
| Boss | varies | varies |

*Assuming player has 100 health*

### Time to Kill (Player → Enemy)
| Enemy | Pistol | Shotgun | Rapid Fire | Grappling |
|-------|--------|---------|------------|-----------|
| Basic (50 HP) | 2 shots | 1 shot | 4 shots | 1 shot |
| Armored (120 HP) | 5 shots | 2 shots | 8 shots | 3 shots |
| Ninja (40 HP) | 2 shots | 1 shot | 3 shots | 1 shot |
| Bomb Thrower (70 HP) | 3 shots | 1 shot | 5 shots | 2 shots |
| Fast Debuffer (30 HP) | 2 shots | 1 shot | 2 shots | 1 shot |
| Boss (350-800 HP) | 14-32 shots | 5-10 shots | 24-54 shots | 7-16 shots |

*Assuming all shots hit*

---

## Future Expansions

### Additional Enemy Types (Planned)
1. **Shieldbearer** - Mobile cover, must flank
2. **Sniper** - Long-range laser sight, one-shot danger
3. **Medic** - Heals other enemies, priority target
4. **Berserker** - Enrages when hurt, high damage
5. **Summoner** - Spawns weak minions continuously
6. **Elite** - Stronger versions with unique abilities
7. **Mini-Boss** - Mid-level threat with special mechanics

### Co-op Specific Enemies (If Implemented)
- **Splitter** - Divides when damaged
- **Linker** - Chains to ally, shares damage
- **Controller** - Mind controls one player
- **Mirror** - Copies player weapons/abilities

---

## Enemy Lore & Story Integration

### Faction Structure (Planned)
1. **Urban Syndicate** - Criminal organization
2. **Jungle Cultists** - Ancient temple guardians
3. **Space Pirates** - Galactic raiders
4. **Haunted Spirits** - Supernatural entities
5. **Western Outlaws** - Frontier bandits

### Enemy Narrative Purpose
- Enemies have lore reasons for presence
- Environment tells enemy backstory
- Boss defeats advance plot
- Enemy designs reflect themes
- Optional lore collectibles
