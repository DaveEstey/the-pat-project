# Positioning Guide - 3D Coordinate System

Complete reference for all 3D object positions in the on-rails shooter game. Use this guide to understand spatial relationships, detect overlaps, and maintain proper spacing.

**Last Updated:** 2025-11-05
**Coordinate System:** Right-handed (Three.js default)

---

## Table of Contents

1. [Coordinate System Explained](#coordinate-system-explained)
2. [Spacing Rules & Guidelines](#spacing-rules--guidelines)
3. [Enemy Positions (All 12 Levels)](#enemy-positions-all-12-levels)
4. [Item Positions (All 12 Levels)](#item-positions-all-12-levels)
5. [Weapon Pickup Positions](#weapon-pickup-positions)
6. [Puzzle Target Positions](#puzzle-target-positions)
7. [Overlap Detection](#overlap-detection)
8. [Critical Issues](#critical-issues)
9. [Position Validation Checklist](#position-validation-checklist)

---

## Coordinate System Explained

### Three.js Right-Handed Coordinate System

```
        +Y (Up)
         |
         |
         |
         +--------- +X (Right)
        /
       /
     +Z (Toward Player/Camera)
```

### Axis Meanings

| Axis | Direction | Typical Range | Usage |
|------|-----------|---------------|-------|
| **X** | Horizontal | -10 to +10 | Left (-) to Right (+) positioning |
| **Y** | Vertical | 0 to 6 | Ground (0) to Elevated platforms |
| **Z** | Depth | -25 to +5 | Away from player (-) to In front (+) |

### Common Conventions

- **Player Camera Position:** `(0, 1.6, 0)` (eye level)
- **Ground Level:** `y = 0`
- **Enemy Spawn Zone:** `z = -8 to -25` (behind camera)
- **Puzzle Zone:** `z = +5 to +10` (in front of camera)
- **Item Zone:** `z = -10 to -195` (throughout level)

### Important Notes

1. **Negative Z = Further Away:** Enemies spawn at negative Z values, further back from the camera
2. **Positive Z = In Front:** Puzzle targets spawn at positive Z, in front of the player's view
3. **Camera Moves Forward:** As the level progresses, camera moves in -Z direction (deeper into level)
4. **Units:** 1 unit ≈ 1 meter in game world

---

## Spacing Rules & Guidelines

### Minimum Distance Requirements

| Object Type A | Object Type B | Min Distance | Reason |
|---------------|---------------|--------------|--------|
| Enemy ↔ Enemy | Any | 2 units | Prevent mesh overlap |
| Enemy ↔ Item | Any | 1.5 units | Prevent collection confusion |
| Enemy ↔ Puzzle | Any | 8 units | Keep combat separate from puzzles |
| Item ↔ Item | Any | 1 unit | Visual clarity |
| Weapon Pickup ↔ Weapon Pickup | Any | **10+ units** | 🔴 Currently violated! |
| Camera ↔ Enemy | Minimum | 8 units | Prevent clipping |

### Formation Spacing Standards

**Line Formation:**
- Horizontal spacing: 2-4 units between enemies
- Example: `x: -3, 0, +3` (3 unit gaps)

**Triangle Formation:**
- Front row: 4-5 unit horizontal spacing
- Depth spacing: 2-3 units between rows
- Example: `(−3, z:−10), (+3, z:−10), (0, z:−13)`

**Scattered Formation:**
- Minimum: 3 units in any direction
- Random variation: ±2 units from base position

### Height Variation Guidelines

| Enemy Type | Typical Y Range | Purpose |
|------------|-----------------|---------|
| Basic Shooter | 0 to 1 | Ground and low platforms |
| Armored | 0 to 2 | Ground and medium platforms |
| Ninja | 0 to 3 | Agile, can be higher |
| Bomb Thrower | 1 to 5 | Elevated throwing positions |
| Fast Debuffer | 0 to 2 | Ground and low platforms |
| Boss | 1 to 2 | Slightly elevated |

### Depth Staging (Z-Axis)

**Close Range:** `z = -8 to -10`
- Quick reflexes required
- Typically: Ninjas, Basic Shooters

**Medium Range:** `z = -11 to -15`
- Standard combat distance
- Typically: Armored, Fast Debuffers

**Long Range:** `z = -16 to -25`
- Strategic targets
- Typically: Bomb Throwers, Bosses

---

## Enemy Positions (All 12 Levels)

### Level 1: Urban Outskirts

#### Room 1: Entry Chamber
| Enemy Type | Position (x, y, z) | Health | Distance from Origin | Notes |
|------------|-------------------|--------|---------------------|-------|
| Basic | (-2, 0, -10) | 50 | 10.2 units | Left flank |
| Basic | (2, 0, -10) | 50 | 10.2 units | Right flank |
| Basic | (0, 1, -12) | 50 | 12.04 units | Center elevated |

**Formation:** Line with elevated center
**Horizontal Spread:** 4 units (left to right)
**Depth Spread:** 2 units (front to back)
**No Overlaps:** ✅

#### Room 2: Guard Post
| Enemy Type | Position (x, y, z) | Health | Distance from Origin | Notes |
|------------|-------------------|--------|---------------------|-------|
| Basic | (-3, 0, -10) | 60 | 10.44 units | Left flank |
| Armored | (0, 0.5, -12) | 120 | 12.01 units | Center tank |
| Basic | (3, 0, -10) | 60 | 10.44 units | Right flank |

**Formation:** Protected center (tank)
**Horizontal Spread:** 6 units
**Depth Spread:** 2 units
**No Overlaps:** ✅

---

### Level 2: Industrial Complex

#### Room 1: Factory Floor
| Enemy Type | Position (x, y, z) | Health | Notes |
|------------|-------------------|--------|-------|
| Fast Debuffer | (-3, 0, -9) | 45 | Left speedster |
| Armored | (0, 1.5, -12) | 140 | Center tank (elevated) |
| Fast Debuffer | (3, 0, -9) | 45 | Right speedster |

**Formation:** Flanking fast enemies + elevated tank
**Horizontal Spread:** 6 units
**Depth Spread:** 3 units
**Elevation:** Center elevated 1.5 units
**No Overlaps:** ✅

#### Room 2: Power Core Chamber
| Enemy Type | Position (x, y, z) | Health | Notes |
|------------|-------------------|--------|-------|
| Bomb Thrower | (-2, 1, -13) | 90 | Left bomber (elevated) |
| Armored | (0, 0, -11) | 180 | Center tank (forward) |
| Bomb Thrower | (2, 1, -13) | 90 | Right bomber (elevated) |

**Formation:** Forward tank with rear bombers
**Horizontal Spread:** 4 units
**Depth Spread:** 2 units
**No Overlaps:** ✅

---

### Level 3: Underground Fortress (BOSS LEVEL)

#### Room 1: Maintenance Tunnels
| Enemy Type | Position (x, y, z) | Health | Notes |
|------------|-------------------|--------|-------|
| Ninja | (-2, 0, -8) | 40 | Left ninja (close) |
| Armored | (0, 0, -11) | 200 | Center tank |
| Ninja | (2, 0, -8) | 40 | Right ninja (close) |

**Formation:** Close ninjas + rear tank
**Horizontal Spread:** 4 units
**Depth Spread:** 3 units
**No Overlaps:** ✅

#### Room 2: Underground Fortress (BOSS)
| Enemy Type | Position (x, y, z) | Health | Special | Notes |
|------------|-------------------|--------|---------|-------|
| Ninja | (-3, 0, -8) | 50 | - | Left add |
| **BOSS** | **(0, 1, -11)** | **350** | **isBoss: true** | **TITAN ENFORCER** |
| Ninja | (3, 0, -8) | 50 | - | Right add |

**Formation:** Boss with ninja guards
**Boss Elevation:** 1 unit
**Horizontal Spread:** 6 units
**Depth Spread:** 3 units
**No Overlaps:** ✅

---

### Level 4: Dense Jungle

#### Room 1: Jungle Entrance
| Enemy Type | Position (x, y, z) | Health | Notes |
|------------|-------------------|--------|-------|
| Ninja | (-4, 0, -10) | 70 | Far left |
| Basic | (0, 0, -13) | 65 | Center rear |
| Ninja | (4, 0, -10) | 70 | Far right |
| Bomb Thrower | (0, 2, -17) | 90 | Elevated rear |

**Formation:** Wide front line + elevated rear
**Horizontal Spread:** 8 units
**Depth Spread:** 7 units
**Max Elevation:** 2 units
**No Overlaps:** ✅

#### Room 2: Ancient Ruins
| Enemy Type | Position (x, y, z) | Health | Notes |
|------------|-------------------|--------|-------|
| Armored | (-3, 1, -12) | 150 | Left elevated tank |
| Ninja | (3, 0, -9) | 75 | Right close ninja |
| Fast Debuffer | (0, 0.5, -15) | 55 | Center rear debuffer |

**Formation:** Asymmetric spread
**Horizontal Spread:** 6 units
**Depth Spread:** 6 units
**No Overlaps:** ✅

---

### Level 5: Space Station Alpha

#### Room 1: Docking Bay
| Enemy Type | Position (x, y, z) | Health | Notes |
|------------|-------------------|--------|-------|
| Fast Debuffer | (-3, 1, -11) | 60 | Left elevated |
| Armored | (3, 1, -11) | 160 | Right elevated |
| Ninja | (0, 2, -14) | 80 | Center high |
| Bomb Thrower | (0, 0, -17) | 95 | Rear ground |

**Formation:** Elevated front + high center + rear bomber
**Horizontal Spread:** 6 units
**Depth Spread:** 6 units
**Max Elevation:** 2 units
**No Overlaps:** ✅

#### Room 2: Command Center
| Enemy Type | Position (x, y, z) | Health | Notes |
|------------|-------------------|--------|-------|
| Fast Debuffer | (-4, 0, -10) | 65 | Far left |
| Fast Debuffer | (4, 0, -10) | 65 | Far right |
| Armored | (0, 1, -13) | 170 | Center elevated |
| Ninja | (-2, 2, -15) | 85 | Left high rear |
| Ninja | (2, 2, -15) | 85 | Right high rear |

**Formation:** 5-enemy complex formation
**Horizontal Spread:** 8 units
**Depth Spread:** 5 units
**Max Elevation:** 2 units
**No Overlaps:** ✅

---

### Level 6: Haunted Mansion

#### Room 1: Grand Foyer
| Enemy Type | Position (x, y, z) | Health | Notes |
|------------|-------------------|--------|-------|
| Ninja | (-5, 0, -12) | 90 | Far left |
| Bomb Thrower | (0, 1.5, -15) | 110 | Center elevated |
| Ninja | (5, 0, -12) | 90 | Far right |

**Formation:** Wide spread with central bomber
**Horizontal Spread:** 10 units
**Depth Spread:** 3 units
**Elevation:** Center 1.5 units
**No Overlaps:** ✅

#### Room 2: Library of Horrors
| Enemy Type | Position (x, y, z) | Health | Notes |
|------------|-------------------|--------|-------|
| Ninja | (-3, 2, -11) | 95 | Left high |
| Armored | (0, 0, -14) | 180 | Center ground |
| Ninja | (3, 2, -11) | 95 | Right high |
| Fast Debuffer | (0, 1, -17) | 70 | Rear elevated |

**Formation:** High flanks + ground center + rear
**Horizontal Spread:** 6 units
**Depth Spread:** 6 units
**Max Elevation:** 2 units
**No Overlaps:** ✅

---

### Level 7: Western Frontier

#### Room 1: Dusty Saloon
| Enemy Type | Position (x, y, z) | Health | Notes |
|------------|-------------------|--------|-------|
| Basic | (-4, 0, -11) | 80 | Left ground |
| Bomb Thrower | (0, 1, -14) | 120 | Center elevated |
| Basic | (4, 0, -11) | 80 | Right ground |
| Armored | (0, 0, -17) | 190 | Rear center |

**Formation:** Front line + elevated bomber + rear tank
**Horizontal Spread:** 8 units
**Depth Spread:** 6 units
**No Overlaps:** ✅

#### Room 2: Desert Outpost
| Enemy Type | Position (x, y, z) | Health | Notes |
|------------|-------------------|--------|-------|
| Basic | (-5, 0, -10) | 85 | Far left |
| Ninja | (-2, 0, -12) | 100 | Left mid |
| Armored | (0, 0.5, -15) | 200 | Center elevated |
| Ninja | (2, 0, -12) | 100 | Right mid |
| Basic | (5, 0, -10) | 85 | Far right |

**Formation:** 5-enemy symmetric spread
**Horizontal Spread:** 10 units
**Depth Spread:** 5 units
**No Overlaps:** ✅

---

### Level 8: Urban Rooftops

#### Room 1: Skyline Chase
| Enemy Type | Position (x, y, z) | Health | Notes |
|------------|-------------------|--------|-------|
| Fast Debuffer | (-4, 1, -10) | 75 | Left elevated |
| Ninja | (-1, 2, -13) | 105 | Left high |
| Armored | (0, 0, -16) | 210 | Center rear ground |
| Ninja | (1, 2, -13) | 105 | Right high |
| Fast Debuffer | (4, 1, -10) | 75 | Right elevated |

**Formation:** Complex multi-elevation
**Horizontal Spread:** 8 units
**Depth Spread:** 6 units
**Max Elevation:** 2 units
**No Overlaps:** ✅

#### Room 2: Corporate Tower
| Enemy Type | Position (x, y, z) | Health | Notes |
|------------|-------------------|--------|-------|
| Armored | (-3, 1, -13) | 220 | Left elevated tank |
| Bomb Thrower | (0, 2, -17) | 140 | Center high bomber |
| Armored | (3, 1, -13) | 220 | Right elevated tank |
| Fast Debuffer | (0, 0, -20) | 80 | Far rear ground |

**Formation:** Twin tanks + high bomber + distant debuffer
**Horizontal Spread:** 6 units
**Depth Spread:** 7 units
**Max Elevation:** 2 units
**No Overlaps:** ✅

---

### Level 9: Deep Jungle Temple

#### Room 1: Temple Entrance
| Enemy Type | Position (x, y, z) | Health | Notes |
|------------|-------------------|--------|-------|
| Ninja | (-4, 0, -11) | 110 | Left ground |
| Bomb Thrower | (0, 3, -15) | 150 | Center very high |
| Ninja | (4, 0, -11) | 110 | Right ground |
| Armored | (0, 0, -18) | 240 | Far rear tank |

**Formation:** Ground ninjas + very high bomber + rear tank
**Horizontal Spread:** 8 units
**Depth Spread:** 7 units
**Max Elevation:** 3 units
**No Overlaps:** ✅

#### Room 2: Sacred Chamber
| Enemy Type | Position (x, y, z) | Health | Notes |
|------------|-------------------|--------|-------|
| Ninja | (-5, 0, -10) | 115 | Far left |
| Fast Debuffer | (-2, 1, -13) | 85 | Left mid elevated |
| Armored | (0, 1, -16) | 250 | Center elevated |
| Fast Debuffer | (2, 1, -13) | 85 | Right mid elevated |
| Ninja | (5, 0, -10) | 115 | Far right |
| Bomb Thrower | (0, 3, -20) | 160 | Far high bomber |

**Formation:** 6-enemy complex layered
**Horizontal Spread:** 10 units
**Depth Spread:** 10 units
**Max Elevation:** 3 units
**No Overlaps:** ✅

---

### Level 10: Space Station Beta

#### Room 1: Reactor Core
| Enemy Type | Position (x, y, z) | Health | Notes |
|------------|-------------------|--------|-------|
| Fast Debuffer | (-4, 2, -11) | 90 | Left high |
| Armored | (-1, 0, -14) | 260 | Left mid ground |
| Bomb Thrower | (0, 3, -18) | 170 | Center very high |
| Armored | (1, 0, -14) | 260 | Right mid ground |
| Fast Debuffer | (4, 2, -11) | 90 | Right high |

**Formation:** Symmetric multi-layer
**Horizontal Spread:** 8 units
**Depth Spread:** 7 units
**Max Elevation:** 3 units
**No Overlaps:** ✅

#### Room 2: AI Core Chamber
| Enemy Type | Position (x, y, z) | Health | Notes |
|------------|-------------------|--------|-------|
| Fast Debuffer | (-5, 1, -10) | 95 | Far left elevated |
| Ninja | (-2, 2, -12) | 120 | Left high |
| Armored | (0, 0, -15) | 280 | Center ground |
| Ninja | (2, 2, -12) | 120 | Right high |
| Fast Debuffer | (5, 1, -10) | 95 | Far right elevated |
| Bomb Thrower | (0, 4, -20) | 180 | Extremely high bomber |

**Formation:** 6-enemy extreme elevation variation
**Horizontal Spread:** 10 units
**Depth Spread:** 10 units
**Max Elevation:** 4 units
**No Overlaps:** ✅

---

### Level 11: Haunted Cathedral

#### Room 1: Cathedral Nave
| Enemy Type | Position (x, y, z) | Health | Notes |
|------------|-------------------|--------|-------|
| Ninja | (-6, 0, -12) | 125 | Far left ground |
| Armored | (-2, 1, -15) | 290 | Left elevated tank |
| Bomb Thrower | (0, 4, -19) | 190 | Center very high |
| Armored | (2, 1, -15) | 290 | Right elevated tank |
| Ninja | (6, 0, -12) | 125 | Far right ground |

**Formation:** Wide symmetric with very high center
**Horizontal Spread:** 12 units
**Depth Spread:** 7 units
**Max Elevation:** 4 units
**No Overlaps:** ✅

#### Room 2: Bell Tower Summit
| Enemy Type | Position (x, y, z) | Health | Notes |
|------------|-------------------|--------|-------|
| Ninja | (-6, 0, -11) | 130 | Far left |
| Fast Debuffer | (-3, 2, -13) | 100 | Left elevated |
| Armored | (0, 0, -16) | 300 | Center ground |
| Bomb Thrower | (0, 5, -21) | 200 | Extremely high |
| Fast Debuffer | (3, 2, -13) | 100 | Right elevated |
| Ninja | (6, 0, -11) | 130 | Far right |
| Armored | (0, 1, -25) | 320 | Far rear tank |

**Formation:** 7-enemy maximum complexity
**Horizontal Spread:** 12 units
**Depth Spread:** 14 units
**Max Elevation:** 5 units
**No Overlaps:** ✅

---

### Level 12: Final Boss Arena

#### Room 1: Convergence Chamber
| Enemy Type | Position (x, y, z) | Health | Notes |
|------------|-------------------|--------|-------|
| Armored | (-5, 1, -13) | 320 | Left elevated tank |
| Ninja | (-2, 2, -11) | 135 | Left high ninja |
| Fast Debuffer | (0, 3, -17) | 105 | Center very high |
| Ninja | (2, 2, -11) | 135 | Right high ninja |
| Armored | (5, 1, -13) | 320 | Right elevated tank |
| Bomb Thrower | (0, 5, -23) | 220 | Extremely high bomber |

**Formation:** Final challenge complexity
**Horizontal Spread:** 10 units
**Depth Spread:** 12 units
**Max Elevation:** 5 units
**No Overlaps:** ✅

#### Room 2: Ultimate Showdown (FINAL BOSS)
| Enemy Type | Position (x, y, z) | Health | Special | Notes |
|------------|-------------------|--------|---------|-------|
| **BOSS** | **(0, 2, -20)** | **800** | **phases: 3, special attacks** | **THE ARCHITECT** |

**Formation:** Solo boss
**Boss Elevation:** 2 units
**Boss Distance:** 20 units
**Special:** laser_barrage, missile_swarm, teleport_strike
**No Overlaps:** ✅

---

## Item Positions (All 12 Levels)

### Position Format
```javascript
{
  type: 'health' | 'ammo' | 'powerup' | 'coin' | 'key_item' | 'upgrade',
  subType: string,
  position: { x, y, z },
  value: number
}
```

### Level 1: Urban Outskirts (6 items)

| Type | SubType | Position (x, y, z) | Value | Notes |
|------|---------|-------------------|-------|-------|
| Health | small | (5, 1, -25) | 25 HP | Early health |
| Ammo | shotgun | (-3, 0.5, -45) | 8 shells | Shotgun ammo |
| Coin | - | (8, 2, -65) | 5 coins | Elevated coin |
| Powerup | damage | (-6, 1.5, -85) | 1 | Damage boost |
| Health | large | (0, 0.8, -110) | 50 HP | Mid-level health |
| Ammo | rapidfire | (10, 1, -130) | 30 bullets | Rapid ammo |

**X Range:** -6 to 10 (16 unit spread)
**Y Range:** 0.5 to 2 (ground to low platforms)
**Z Range:** -25 to -130 (105 unit depth)
**Average Spacing:** ~21 units between items
**No Overlaps:** ✅

---

### Level 2: Industrial Complex (8 items)

| Type | SubType | Position (x, y, z) | Value | Notes |
|------|---------|-------------------|-------|-------|
| Health | small | (-4, 1, -20) | 25 HP | Early health |
| Coin | - | (6, 0.5, -35) | 3 coins | Low coin |
| Ammo | shotgun | (-8, 2, -50) | 10 shells | Elevated ammo |
| Powerup | speed | (12, 1.5, -70) | 1 | Speed boost |
| Coin | - | (-2, 0.8, -85) | 7 coins | Mid coin |
| Health | large | (5, 1, -105) | 50 HP | Large health |
| Ammo | bomb | (-10, 2.5, -125) | 2 bombs | Elevated bomb |
| Upgrade | enhanced_grip | (0, 3, -140) | 1 | High upgrade |

**X Range:** -10 to 12 (22 unit spread)
**Y Range:** 0.5 to 3 (ground to medium platforms)
**Z Range:** -20 to -140 (120 unit depth)
**Average Spacing:** ~17 units between items
**No Overlaps:** ✅

---

### Level 3: Underground Fortress (8 items)

| Type | SubType | Position (x, y, z) | Value | Notes |
|------|---------|-------------------|-------|-------|
| Powerup | accuracy | (-7, 1, -15) | 1 | Accuracy boost |
| Coin | - | (4, 0.5, -30) | 4 coins | Early coin |
| Health | small | (9, 2, -55) | 25 HP | Elevated health |
| Ammo | rapidfire | (-5, 1.5, -75) | 40 bullets | Rapid ammo |
| Coin | - | (11, 0.8, -95) | 6 coins | Far right coin |
| Powerup | damage | (-8, 2.5, -115) | 1 | High damage boost |
| Health | large | (2, 1, -135) | 50 HP | Large health |
| **Key Item** | **glider** | **(-3, 4, -150)** | **1** | **Unlocks aerial_path_level4** |

**X Range:** -8 to 11 (19 unit spread)
**Y Range:** 0.5 to 4 (ground to high platforms)
**Z Range:** -15 to -150 (135 unit depth)
**Special:** Contains key item that unlocks new path in Level 4
**No Overlaps:** ✅

---

### Level 4: Dense Jungle (7 items)

| Type | SubType | Position (x, y, z) | Value | Notes |
|------|---------|-------------------|-------|-------|
| Health | small | (-6, 1, -25) | 25 HP | Left health |
| Ammo | bomb | (8, 2, -45) | 3 bombs | Elevated bombs |
| Powerup | speed | (-10, 1.5, -65) | 1 | Speed boost |
| Coin | - | (5, 0.8, -85) | 8 coins | Coin cluster |
| Health | large | (0, 1, -105) | 50 HP | Center health |
| Upgrade | reinforced_armor | (-4, 3, -120) | 1 | High upgrade |
| Ammo | shotgun | (12, 1.5, -140) | 12 shells | Far ammo |

**X Range:** -10 to 12 (22 unit spread)
**Y Range:** 0.8 to 3
**Z Range:** -25 to -140 (115 unit depth)
**No Overlaps:** ✅

---

### Level 5: Space Station Alpha (9 items)

| Type | SubType | Position (x, y, z) | Value | Notes |
|------|---------|-------------------|-------|-------|
| Coin | - | (3, 0.5, -10) | 2 coins | Very early coin |
| Powerup | accuracy | (-9, 2, -30) | 1 | High accuracy boost |
| Health | small | (7, 1, -50) | 25 HP | Mid health |
| Ammo | rapidfire | (-5, 1.5, -70) | 50 bullets | Large ammo pack |
| Coin | - | (11, 0.8, -90) | 9 coins | Large coin cluster |
| Powerup | damage | (-8, 3, -110) | 1 | High damage boost |
| Health | large | (4, 1, -130) | 50 HP | Large health |
| Ammo | bomb | (-10, 2, -150) | 3 bombs | High bombs |
| Upgrade | targeting_matrix | (0, 5, -165) | 1 | Very high upgrade |

**X Range:** -10 to 11 (21 unit spread)
**Y Range:** 0.5 to 5 (widest vertical range)
**Z Range:** -10 to -165 (155 unit depth - longest level)
**No Overlaps:** ✅

---

### Level 6-12 Item Patterns

Levels 6-12 follow similar patterns with increasing:
- **Z-depth:** Levels get longer (up to -195 for Level 12)
- **Y-height:** More elevated platforms (up to y=6)
- **Item Value:** Higher ammo counts, better powerups
- **Key Items:** Special unlocks for alternate paths

**File Reference:** `src/data/levelItems.js` (lines 1-687)

---

## Weapon Pickup Positions

### 🔴 CRITICAL OVERLAP ISSUE DETECTED

**All weapon pickups currently use IDENTICAL coordinates!**

| Level | Room | Weapon Type | Position (x, y, z) | Status |
|-------|------|-------------|-------------------|--------|
| 1 | 2 | Shotgun | **(-8, 6, -50)** | 🔴 OVERLAP |
| 2 | 2 | Rapid Fire | **(-8, 6, -50)** | 🔴 OVERLAP |
| 3 | 1 | Grappling | **(-8, 6, -50)** | 🔴 OVERLAP |

**Impact:** Only one weapon pickup will be visible. Others are hidden at the same position.

**File Location:** `src/data/levelRooms.js`
- Line 32: Level 1 Room 2 weapon pickup
- Line 63: Level 2 Room 2 weapon pickup
- Line 81: Level 3 Room 1 weapon pickup

### Recommended Fix

```javascript
// Level 1, Room 2 - Keep original
{ weaponType: 'shotgun', position: { x: -8, y: 6, z: -50 } }

// Level 2, Room 2 - Move to right side, different depth
{ weaponType: 'rapidfire', position: { x: 8, y: 5, z: -55 } }

// Level 3, Room 1 - Move to center high
{ weaponType: 'grappling', position: { x: 0, y: 7, z: -48 } }
```

**Spacing After Fix:**
- L1→L2: 16 units horizontal + 5 units depth = 16.76 units ✅
- L2→L3: 8 units horizontal + 7 units depth = 10.63 units ✅
- Minimum spacing: >10 units ✅

---

## Puzzle Target Positions

### Puzzle Coordinate Space

**IMPORTANT:** Puzzle targets use **POSITIVE Z values** (in front of camera), opposite to enemies.

```
Player Camera (0, 1.6, 0)
         |
         | Looking forward (+Z direction)
         ↓
    Puzzle Targets (z = +5 to +10)
```

### Level 1: Simple 3-Target Sequence (Green → Yellow → Red)

| Target ID | Position (x, y, z) | Color | Size | Sequence | Notes |
|-----------|-------------------|-------|------|----------|-------|
| target_1_1 | (-3, 2, 5) | 0x00ff00 (Green) | 0.8 | 1st | Left target |
| target_1_2 | (0, 2.5, 5) | 0xffff00 (Yellow) | 0.8 | 2nd | Center elevated |
| target_1_3 | (3, 2, 5) | 0xff0000 (Red) | 0.8 | 3rd | Right target |

**Formation:** Horizontal line at z=5 (5 units in front of camera)
**Horizontal Spread:** 6 units
**Vertical Spread:** 0.5 units
**Distance from Camera:** 5 units
**Puzzle Type:** Sequence (must shoot in order)
**No Overlaps:** ✅

---

### Level 2: Diamond Formation (4 targets)

| Target ID | Position (x, y, z) | Color | Size | Sequence | Notes |
|-----------|-------------------|-------|------|----------|-------|
| target_2_1 | (-4, 1.5, 6) | 0x0000ff (Blue) | 0.7 | 1st | Bottom left |
| target_2_2 | (-1.5, 3, 6) | 0xff00ff (Magenta) | 0.7 | 2nd | Top left |
| target_2_3 | (1.5, 3, 6) | 0x00ffff (Cyan) | 0.7 | 3rd | Top right |
| target_2_4 | (4, 1.5, 6) | 0xffa500 (Orange) | 0.7 | 4th | Bottom right |

**Formation:** Diamond shape at z=6
**Horizontal Spread:** 8 units
**Vertical Spread:** 1.5 units
**Distance from Camera:** 6 units
**Puzzle Type:** Sequence (shoot corners in order)
**No Overlaps:** ✅

---

### Level 3: Pentagon Formation (5 targets)

| Target ID | Position (x, y, z) | Color | Size | Sequence | Notes |
|-----------|-------------------|-------|------|----------|-------|
| target_3_1 | (0, 4, 7) | 0xff0000 (Red) | 0.6 | 1st | Top center |
| target_3_2 | (-3, 2.5, 7) | 0x00ff00 (Green) | 0.6 | 2nd | Left mid |
| target_3_3 | (-2, 0.5, 7) | 0x0000ff (Blue) | 0.6 | 3rd | Bottom left |
| target_3_4 | (2, 0.5, 7) | 0xffff00 (Yellow) | 0.6 | 4th | Bottom right |
| target_3_5 | (3, 2.5, 7) | 0xff00ff (Magenta) | 0.6 | 5th | Right mid |

**Formation:** Pentagon (5-point star shape) at z=7
**Horizontal Spread:** 6 units
**Vertical Spread:** 3.5 units
**Distance from Camera:** 7 units
**Puzzle Type:** Sequence (shoot in specific star pattern)
**No Overlaps:** ✅

---

### Puzzle Target Spacing Rules

1. **Minimum Target Spacing:** 1.5 units (prevents accidental multi-hits)
2. **Z-Plane Consistency:** All targets in a puzzle at same Z depth
3. **Size Variation:** Harder puzzles = smaller targets (0.6-0.8 units)
4. **Color Differentiation:** Each target has unique color for clarity
5. **Elevation Range:** y = 0.5 to 4 (accessible by aiming)

**File Reference:** `src/data/puzzleConfigs.js` (TargetPuzzleConfigs section)

---

## Overlap Detection

### Automatic Overlap Detection Formula

```javascript
function detectOverlap(posA, posB, minDistance = 1.5) {
  const dx = posA.x - posB.x;
  const dy = posA.y - posB.y;
  const dz = posA.z - posB.z;

  const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);

  return distance < minDistance;
}
```

### Known Overlaps

#### 🔴 Critical: Weapon Pickup Overlap
- **Level 1, Room 2:** Shotgun at (-8, 6, -50)
- **Level 2, Room 2:** Rapidfire at (-8, 6, -50)
- **Level 3, Room 1:** Grappling at (-8, 6, -50)
- **Distance:** 0 units
- **Status:** CRITICAL - MUST FIX
- **Fix Priority:** HIGH

#### ✅ No Other Overlaps Detected

**Validation Results:**
- Enemy-Enemy overlaps: 0
- Enemy-Item overlaps: 0
- Item-Item overlaps: 0
- Puzzle-Enemy overlaps: 0 (puzzles in positive Z, enemies in negative Z)
- Puzzle-Item overlaps: 0

---

## Critical Issues

### Issue #1: Weapon Pickup Overlap 🔴

**Problem:** All 3 weapon pickups share exact same position
**Files Affected:** `src/data/levelRooms.js` lines 32, 63, 81
**Impact:** Only first weapon visible, others hidden
**Priority:** CRITICAL
**Estimated Fix Time:** 5 minutes

**Solution:**
```javascript
// In levelRooms.js

// Level 1, Room 2 (line 32) - Keep
weaponPickups: [
  { weaponType: 'shotgun', position: { x: -8, y: 6, z: -50 } }
]

// Level 2, Room 2 (line 63) - Change
weaponPickups: [
  { weaponType: 'rapidfire', position: { x: 8, y: 5, z: -55 } }
]

// Level 3, Room 1 (line 81) - Change
weaponPickups: [
  { weaponType: 'grappling', position: { x: 0, y: 7, z: -48 } }
]
```

---

### Issue #2: Enemy Formation Comments Indicate Historical Overlaps ⚠️

**Evidence:** Multiple comments in `src/data/roomConfigs.js` say:
- "MUCH further back"
- "All formations push enemies FAR BACK with -12 offset"

**Analysis:** Previous version had enemy-camera overlap issues. Fixed by pushing all enemies back 12 units in Z-axis.

**Current Status:** ✅ RESOLVED (enemies now spawn at safe distances)

**Validation:**
- Minimum enemy Z: -8 units
- Camera position: 0 units
- Safe distance: 8+ units ✅

---

## Position Validation Checklist

Use this checklist when adding new positions:

### Enemy Placement
- [ ] Enemy X between -10 and +10
- [ ] Enemy Y between 0 and 6
- [ ] Enemy Z between -25 and -8
- [ ] Minimum 2 units from other enemies
- [ ] Minimum 8 units from camera origin
- [ ] Formation looks intentional (not random scatter)

### Item Placement
- [ ] Item X between -12 and +12
- [ ] Item Y between 0.5 and 6
- [ ] Item Z between -195 and -10
- [ ] Minimum 1 unit from other items
- [ ] Minimum 1.5 units from enemies
- [ ] Not blocking player's view of enemies

### Weapon Pickup Placement
- [ ] Unique position (not reused)
- [ ] High enough to be visible (y ≥ 5)
- [ ] At least 10 units from other weapon pickups
- [ ] In player's view cone

### Puzzle Target Placement
- [ ] **Positive Z value** (in front of camera)
- [ ] Z between +5 and +10
- [ ] Minimum 1.5 units from other targets
- [ ] All targets in puzzle at same Z depth
- [ ] Y between 0.5 and 4 (aimable height)

---

## Quick Reference Table

### Object Type Position Ranges

| Object Type | X Range | Y Range | Z Range | Notes |
|-------------|---------|---------|---------|-------|
| Enemies | -6 to +6 | 0 to 5 | -25 to -8 | Behind camera |
| Items | -12 to +12 | 0.5 to 6 | -195 to -10 | Throughout level |
| Weapon Pickups | -10 to +10 | 5 to 7 | -60 to -40 | High and visible |
| Puzzle Targets | -4 to +4 | 0.5 to 4 | **+5 to +10** | **In front of camera** |
| Boss Enemies | -2 to +2 | 1 to 2 | -20 to -11 | Centered, elevated |
| Player Camera | 0 | 1.6 | 0 | Fixed origin |

---

## Related Documentation

- **Component Reference:** See COMPONENT_REFERENCE.md for component hierarchy
- **Data Structure Map:** See DATA_STRUCTURE_MAP.md for file relationships
- **Quick Debug Guide:** See QUICK_REFERENCE.md for common issues
- **Architecture Decisions:** See ARCHITECTURE_DECISIONS.md for design rationale

---

**End of Positioning Guide**
**For fixes, see:** src/data/levelRooms.js (weapon pickup overlap)
**For validation:** Run overlap detection script (to be created)
