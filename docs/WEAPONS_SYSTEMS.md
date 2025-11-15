# Weapons Systems Documentation

## Overview
The weapons system provides diverse combat options with distinct mechanics, stats, and visual effects. Each weapon has unique characteristics for different combat scenarios.

## Weapon Data Files
- **Configuration:** `src/data/weaponStats.js`
- **Type Definitions:** `src/types/weapons.js`
- **System Logic:** `src/systems/WeaponSystem.js`
- **Controller:** `src/components/Game/WeaponController.jsx`
- **Combat Integration:** `src/components/Game/UnifiedCombatSystem.jsx`

---

## Weapon Types

### 1. Pistol (Default Weapon)
**Type:** `WeaponTypes.PISTOL`
**Status:** ✅ Fully Implemented

#### Stats
```javascript
{
  damage: 25,
  fireRate: 2.0,          // shots per second
  reloadTime: 1.5,        // seconds
  accuracy: 0.9,          // 90% accuracy
  range: 100,             // units
  ammo: Infinity          // never runs out
}
```

#### Mechanics
- **Infinite ammo** - Never needs ammo pickups
- **Reliable accuracy** - High hit consistency
- **Moderate damage** - Balanced for all scenarios
- **Quick reload** - 1.5s downtime
- **Medium fire rate** - 2 shots per second max

#### Use Cases
- Starting weapon for all levels
- Backup weapon when out of special ammo
- Long-range precision shots
- Consistent damage output

#### Visual Effects
- Muzzle flash (orange)
- Hit sparks on impact
- Shell casing ejection (not implemented)

---

### 2. Shotgun
**Type:** `WeaponTypes.SHOTGUN`
**Status:** ✅ Fully Implemented
**Unlock:** Level 1 - Room 2

#### Stats
```javascript
{
  damage: 80,             // total (8 pellets × 10 damage each)
  fireRate: 0.8,          // shots per second
  reloadTime: 2.5,        // seconds
  accuracy: 0.7,          // 70% accuracy
  range: 30,              // short range
  spread: 15,             // degrees
  pellets: 8              // projectiles per shot
}
```

#### Mechanics
- **Spread pattern** - 8 pellets in cone
- **Close-range devastation** - Massive damage up close
- **Damage falloff** - Reduced effectiveness at distance
- **Slow fire rate** - 0.8 shots/second
- **Longer reload** - 2.5s downtime
- **Limited ammo** - 50 shells total

#### Use Cases
- Close-quarters combat
- High-health enemies (armored units)
- Grouped enemies
- Emergency situations

#### Visual Effects
- Large muzzle flash
- Multiple hit markers
- Pump action animation (planned)
- Smoke cloud

#### Balancing Notes
- Effective range: 0-15 units (full damage)
- Damage drops to 50% at 20 units
- Damage drops to 25% at 30+ units
- All 8 pellets hit at point-blank

---

### 3. Rapid Fire
**Type:** `WeaponTypes.RAPIDFIRE`
**Status:** ✅ Mostly Implemented
**Unlock:** Level 2 - Room 2

#### Stats
```javascript
{
  damage: 15,             // per shot
  fireRate: 8.0,          // shots per second
  reloadTime: 2.0,        // seconds
  accuracy: 0.8,          // 80% accuracy
  range: 80,              // units
  overheat: true,         // unique mechanic
  overheatTime: 3.0       // continuous fire limit
}
```

#### Mechanics
- **High fire rate** - 8 shots/second
- **Overheat system** - Can't fire continuously forever
- **Accuracy degradation** - Less accurate when overheated (not implemented)
- **Suppression** - Pin down fast enemies
- **Moderate damage** - Lower per-shot, high DPS
- **Large ammo pool** - 200 rounds

#### Overheat Mechanic (Planned)
```
Fire continuously for 3 seconds → Overheat
Wait 2 seconds to cool down → Can fire again
Short bursts prevent overheating
```

#### Use Cases
- Fast-moving enemies (ninjas, debuffers)
- Sustained fire on bosses
- Suppression tactics
- High DPS situations

#### Visual Effects
- Rapid muzzle flashes
- Tracer rounds (not implemented)
- Heat distortion when overheating (not implemented)
- Smoke trail

#### Missing Features
- Overheat gauge UI
- Accuracy penalty when overheated
- Visual heat glow on weapon
- Cooling sound effects

---

### 4. Grappling Arm
**Type:** `WeaponTypes.GRAPPLING`
**Status:** ⚠️ Partially Implemented
**Unlock:** Level 3 - Room 1

#### Stats
```javascript
{
  damage: 50,             // grab damage
  fireRate: 1.0,          // shots per second
  reloadTime: 1.0,        // seconds
  accuracy: 0.95,         // 95% accuracy (hook aim)
  range: 50,              // hook range
  pullForce: 100,         // pull strength
  ammo: Infinity          // infinite uses
}
```

#### Mechanics
- **Pull enemies** - Drag enemies toward player
- **Environmental interaction** - Grapple to objects (planned)
- **Melee combo** - Pull + shoot for bonus damage (planned)
- **Stun effect** - Briefly stuns grabbed enemies (not implemented)
- **No ammo limit** - Infinite uses

#### Planned Features
1. **Enemy Pull**
   - Hook connects to enemy
   - Pull enemy forward 5-10 units
   - Enemy is stunned for 0.5s
   - Deals 50 damage on connection

2. **Terrain Grappling** (Not Implemented)
   - Grapple to designated anchor points
   - Swing across gaps
   - Reach high platforms
   - Puzzle solving mechanic

3. **Object Interaction** (Not Implemented)
   - Pull explosive barrels
   - Move heavy objects
   - Activate distant switches
   - Puzzle integration

#### Use Cases
- Repositioning enemies
- Environmental puzzles
- Accessing secret areas
- Breaking enemy formations
- Boss mechanic disruption

#### Visual Effects
- Hook projectile with chain
- Pull motion blur
- Impact effect on connection
- Chain physics (not implemented)

#### Missing Features
- Complete pull physics
- Terrain anchor point system
- Object grappling
- Chain visualization
- Stun effect on enemies

---

### 5. Bomb Weapons
**Type:** `WeaponTypes.BOMB`
**Status:** ⚠️ Basic Structure Only
**Unlock:** Various locations

#### Bomb Types

##### 5a. Explosive Bomb
```javascript
{
  damage: 100,            // base damage
  radius: 8,              // explosion radius
  ammo: 1,                // single use
  effect: 'explosion',    // damage all in radius
  falloff: true           // less damage at edge
}
```
- **Area damage** - Hits all enemies in radius
- **Destructible environment** - Break objects (planned)
- **Knockback** - Pushes enemies away (planned)

##### 5b. Ice Bomb
```javascript
{
  damage: 40,             // lower damage
  radius: 10,             // larger radius
  ammo: 1,                // single use
  effect: 'freeze',       // slow effect
  duration: 5.0           // slow duration
}
```
- **Freeze effect** - Slows enemies by 75%
- **No terrain damage** - Pure crowd control
- **Visual freeze** - Ice crystal effect (not implemented)

##### 5c. Water Bomb
```javascript
{
  damage: 30,             // minimal damage
  radius: 12,             // very large radius
  ammo: 1,                // single use
  effect: 'extinguish',   // put out fires
  special: 'terrain'      // modifies environment
}
```
- **Fire extinguisher** - Removes fire hazards
- **Terrain modification** - Creates water puddles (planned)
- **Electric synergy** - Water + electricity = bonus (planned)

##### 5d. Fire Bomb
```javascript
{
  damage: 60,             // moderate damage
  radius: 6,              // medium radius
  ammo: 1,                // single use
  effect: 'burn',         // damage over time
  duration: 3.0           // burn duration
}
```
- **Damage over time** - 20 damage/second for 3s
- **Area denial** - Leaves fire patch (planned)
- **Ice synergy** - Melts ice obstacles (planned)

#### Bomb Mechanics (Planned)
1. Select bomb type from inventory
2. Aim and throw (arc trajectory)
3. Explodes on impact or timer
4. Area effect applies to all in radius
5. Returns to inventory after use
6. Can be found as pickups in levels

#### Use Cases
- **Explosive:** Boss damage, grouped enemies
- **Ice:** Fast enemies, crowd control
- **Water:** Fire puzzles, electric setups
- **Fire:** Damage over time, area denial

#### Missing Features
- Complete bomb throw physics
- Arc trajectory visualization
- Bomb selection UI
- Elemental interaction system
- Terrain modification
- Area denial patches
- Damage over time system

---

## Weapon Switching System

### Controls
- **Keyboard:** Number keys 1-4 (5-9 for bombs)
- **Mouse Wheel:** Scroll through weapons (not implemented)
- **Mobile:** Swipe gestures

### Switching Logic
```javascript
// src/components/Game/WeaponController.jsx
1. Detect key press (1-4)
2. Check if weapon is unlocked (ProgressionSystem)
3. Check if weapon has ammo (GameContext)
4. Switch weapon (GameContext.switchWeapon)
5. Update UI (HUD re-renders)
6. Play switch animation (not implemented)
```

### Switch Timing
- Instant switch (no delay)
- Can't switch during reload
- Can't switch while firing (rapid fire)

---

## Ammunition System

### Ammo Types
| Weapon | Ammo Type | Max Ammo | Refill Amount |
|--------|-----------|----------|---------------|
| Pistol | Infinite | ∞ | N/A |
| Shotgun | Shells | 50 | 10 per pickup |
| Rapid Fire | Bullets | 200 | 50 per pickup |
| Grappling | Infinite | ∞ | N/A |
| Bombs | Single Use | 3 | 1 per pickup |

### Ammo Management
- **Per-weapon ammo** - Each weapon has separate ammo pool
- **Ammo persistence** - Ammo carries between levels
- **Ammo reset** - Option to reset on new game (not implemented)
- **Ammo pickups** - Scattered throughout levels (minimal implementation)
- **Ammo UI** - Displayed in HUD AmmoCounter component

### Ammo Pickup System (Planned)
- Visual ammo crates in levels
- Automatic pickup on proximity
- Notification display
- Refills specific weapon type
- Generic ammo refills current weapon

---

## Reload System

### Reload Mechanics
```javascript
// Reload triggers:
1. Ammo reaches 0
2. Manual reload (R key) - not implemented
3. Automatic after firing last shot

// Reload process:
1. Enter reload state (weapon.reloading = true)
2. Wait for weapon.reloadTime seconds
3. Refill magazine (not clip system - refills all)
4. Exit reload state (weapon.reloading = false)
5. Can fire again
```

### Reload Times
- **Pistol:** 1.5 seconds
- **Shotgun:** 2.5 seconds
- **Rapid Fire:** 2.0 seconds
- **Grappling:** 1.0 seconds (cooldown, not reload)
- **Bombs:** N/A (single use)

### Reload Interruption
- Cannot cancel reload (tactical choice)
- Cannot switch weapons during reload
- Taking damage doesn't interrupt reload
- Movement is allowed during reload

### Reload UI
- Reload indicator (not implemented)
- Reload progress bar (not implemented)
- Reload animation (not implemented)
- Sound effects (disabled)

---

## Weapon Upgrades System (Planned)

### Upgrade Categories

#### 1. Damage Upgrades
- **+10% Damage** (3 tiers)
- **Critical Hit Chance** (+5% per tier)
- **Armor Piercing** (ignore 25% armor)

#### 2. Reload Upgrades
- **Fast Reload** (-20% reload time per tier)
- **Quick Draw** (instant weapon switch)
- **Tactical Reload** (reload on weapon switch)

#### 3. Ammo Upgrades
- **Extended Magazine** (+25% ammo capacity)
- **Ammo Efficiency** (25% chance not to consume ammo)
- **Scavenger** (enemies drop more ammo)

#### 4. Accuracy Upgrades
- **Steady Aim** (+10% accuracy)
- **Long Shot** (+20% range)
- **No Sway** (perfect aim while moving)

#### 5. Weapon-Specific Upgrades

**Pistol:**
- Dual wielding (double fire rate)
- Armor-piercing rounds
- Burst fire mode (3-round burst)

**Shotgun:**
- Tighter spread (more range)
- Incendiary shells (fire damage)
- Slug rounds (single high-damage projectile)

**Rapid Fire:**
- Improved cooling (longer before overheat)
- Belt feed (no reload, just overheat)
- Explosive rounds (area damage)

**Grappling:**
- Longer range (+50% range)
- Multi-hook (grapple 3 enemies at once)
- Electric shock (stun on pull)

**Bombs:**
- Bigger blast (+50% radius)
- Cluster bombs (splits into 3)
- Remote detonation (manual trigger)

### Upgrade Acquisition
- Purchase with score points
- Find in secret rooms
- Boss defeat rewards
- Level completion bonuses

---

## Weapon Balance

### Damage Per Second (DPS)
| Weapon | Damage/Shot | Fire Rate | DPS | Range |
|--------|-------------|-----------|-----|-------|
| Pistol | 25 | 2.0/s | 50 | Long |
| Shotgun (all pellets) | 80 | 0.8/s | 64 | Short |
| Rapid Fire | 15 | 8.0/s | 120 | Medium |
| Grappling | 50 | 1.0/s | 50 | Medium |

### Balance Philosophy
- **Pistol:** Reliable, always available
- **Shotgun:** High burst, close range
- **Rapid Fire:** Highest DPS, ammo management
- **Grappling:** Utility + damage hybrid
- **Bombs:** Situational power

### Enemy Matchups
| Enemy Type | Best Weapon | Reason |
|------------|-------------|--------|
| Basic Shooter | Pistol | Reliable, efficient |
| Armored | Shotgun | Burst through armor |
| Ninja | Rapid Fire | Track fast movement |
| Bomb Thrower | Pistol | Long-range accuracy |
| Fast Debuffer | Rapid Fire | Sustained fire |
| Boss | Rapid Fire / Shotgun | High DPS |

---

## Weapon Visual Effects

### Current Implementation
- Muzzle flash (basic)
- Hit sparks
- Crosshair feedback
- Hit markers

### Planned Effects
- **Muzzle Flash:**
  - Weapon-specific colors
  - Light source emission
  - Smoke puff

- **Projectile Trails:**
  - Bullet tracers (rapid fire)
  - Hook chain (grappling)
  - Bomb arc indicator

- **Impact Effects:**
  - Blood splatter (stylized)
  - Metal sparks
  - Concrete dust
  - Enemy-specific reactions

- **Weapon Animations:**
  - Recoil
  - Reload animations
  - Weapon bob/sway
  - Aim down sights (not planned)

---

## Weapon Audio (Disabled)

### Planned Sound Effects
- **Pistol:** Sharp crack
- **Shotgun:** Deep boom
- **Rapid Fire:** Machine gun rattle
- **Grappling:** Chain clinking + whoosh
- **Bombs:** Explosion + environmental reverb

### Audio Features (Planned)
- 3D positional audio
- Distance attenuation
- Environment reverb
- Layered sounds (shot + casing + echo)
- Dynamic mixing based on combat intensity

---

## Weapon Unlock Progression

### Progression Path
```
Level 1 - Start: Pistol (default)
Level 1 - Room 2: Shotgun
Level 2 - Room 2: Rapid Fire
Level 3 - Room 1: Grappling Arm
Levels 4-12: Bomb variants (planned)
```

### Unlock Conditions
- **Pistol:** Always unlocked
- **Shotgun:** Complete Level 1 Room 1
- **Rapid Fire:** Complete Level 2 Room 1
- **Grappling:** Complete Level 3 Room 1 (currently just pickup)
- **Bombs:** Find in levels or defeat bosses

### Persistent Unlocks
- Weapons stay unlocked between games
- Stored in ProgressionSystem
- Saved to localStorage
- Reset only on "New Game"

---

## Future Weapon Additions

### Planned Weapons
1. **Sniper Rifle**
   - High damage single shots
   - Perfect accuracy
   - Zoom mechanic
   - Slow fire rate

2. **Rocket Launcher**
   - Massive damage
   - Large explosion radius
   - Limited ammo (3 shots)
   - Self-damage risk

3. **Energy Weapon**
   - Continuous beam
   - No ammo, battery drain
   - Overheats quickly
   - Pierces enemies

4. **Melee Weapon**
   - Close-range only
   - Instant kill on weak enemies
   - Parry mechanic
   - No ammo

5. **Turret**
   - Deployable auto-turret
   - Limited duration
   - Draws enemy aggro
   - Strategic placement

---

## Technical Implementation

### Weapon System Architecture
```
WeaponSystem (JS class)
  ├── Weapon Stats Database
  ├── Damage Calculation
  ├── Ammo Management
  ├── Reload Logic
  └── Upgrade System (planned)

WeaponController (React component)
  ├── Input Handling
  ├── Weapon Switching
  ├── UI Updates
  └── Animation Triggers

UnifiedCombatSystem (React component)
  ├── Raycasting
  ├── Hit Detection
  ├── Damage Application
  └── Visual Feedback

GameContext
  ├── Current Weapon State
  ├── Ammo State
  └── Weapon Unlock State
```

### Performance Considerations
- No weapon models currently (just visual effects)
- Raycasting is performant (single ray per shot)
- Particle system needs optimization
- Weapon switching is instant (no animation delay)

---

## Weapon Development Priorities

### Phase 1: Polish Existing (HIGH PRIORITY)
1. Complete grappling arm pull physics
2. Implement bomb throw system
3. Add reload UI indicators
4. Improve muzzle flash effects
5. Add weapon switch animations

### Phase 2: Add Depth (MEDIUM PRIORITY)
6. Implement overheat mechanic (rapid fire)
7. Add weapon upgrade system
8. Create ammo pickup objects
9. Implement damage falloff (shotgun)
10. Add critical hit system

### Phase 3: Expand Arsenal (LOW PRIORITY)
11. Add new weapon types (sniper, rocket, energy)
12. Implement weapon skin system
13. Add weapon challenge system
14. Create weapon mastery progression
15. Add weapon combination attacks
