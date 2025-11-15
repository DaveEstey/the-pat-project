# Level Design Documentation

## Overview
The game features 12 levels across 5 environmental themes, with multi-room progression and escalating difficulty. Each level contains 2+ rooms with unique enemy layouts, weapon pickups, and optional puzzles.

## Core Files
- **Level Rooms:** `src/data/levelRooms.js` (397 lines)
- **Level Manager:** `src/components/Game/LevelManager.jsx`
- **Room Manager:** `src/components/Game/UnifiedRoomManager.jsx`
- **Environment System:** `src/systems/EnvironmentSystem.js`

---

## Level Structure

### Multi-Room System
```
Level → Room 1 → Room 2 → (Room 3) → Level Complete
         ↓         ↓          ↓
      Enemies   Enemies   Boss/Puzzle
```

### Room Progression Flow
1. Player enters room
2. Enemies spawn at predefined positions
3. Player defeats all enemies
4. Room marked complete
5. Transition to next room
6. Repeat until level complete

### Room Configuration Schema
```javascript
{
  id: 'level_1_room_1',
  name: 'Entry Chamber',
  description: 'First combat encounter',
  theme: 'urban_entry',
  enemyCount: 3,
  difficulty: 'easy',
  enemyLayout: [
    {
      type: 'basic',
      position: { x: -2, y: 0, z: -15 },
      health: 50,
      shootInterval: 4500
    }
  ],
  weaponPickups: [
    {
      weaponType: 'shotgun',
      position: { x: -8, y: 6, z: -50 }
    }
  ]
}
```

---

## Level Breakdown

### **Level 1: Urban Outskirts**
**Theme:** Urban City
**Rooms:** 2
**Status:** ✅ Fully Playable
**Difficulty:** Easy → Medium

#### Room 1: Entry Chamber
- **Enemies:** 3 Basic Shooters
- **Difficulty:** Easy (tutorial level)
- **Purpose:** Teach basic combat
- **Layout:** Spread formation (-2, 0, 2 on X-axis)
- **Health:** 50 HP each
- **Shoot Interval:** 4500-5500ms
- **Completion Time:** ~30-45 seconds

#### Room 2: Guard Post
- **Enemies:** 2 Basic + 1 Armored
- **Difficulty:** Medium
- **Purpose:** Introduce armored enemies
- **Layout:** Flanking + center tank
- **Special:** First weapon pickup (Shotgun)
- **Weapon Unlock:** Shotgun at position (-8, 6, -50)
- **Completion Time:** ~45-60 seconds

**Total Level Time:** 1.5-2 minutes
**Score Potential:** 400-600 points

---

### **Level 2: Industrial Complex**
**Theme:** Urban Industrial
**Rooms:** 2
**Status:** ✅ Fully Playable
**Difficulty:** Medium → Hard

#### Room 1: Factory Floor
- **Enemies:** 2 Fast Debuffer + 1 Armored
- **Difficulty:** Medium
- **Purpose:** Introduce fast enemies
- **Layout:** Fast enemies flanking, armored center
- **Challenge:** Tracking fast-moving targets
- **Health:** Fast: 45 HP, Armored: 140 HP
- **Completion Time:** ~45-60 seconds

#### Room 2: Power Core Chamber
- **Enemies:** 2 Bomb Thrower + 1 Armored
- **Difficulty:** Hard
- **Purpose:** Area denial combat
- **Layout:** Throwers on sides, heavy armored center
- **Special:** Rapid Fire weapon pickup
- **Weapon Unlock:** Rapid Fire at (-8, 6, -50)
- **Completion Time:** ~60-75 seconds

**Total Level Time:** 2-2.5 minutes
**Score Potential:** 700-1000 points

---

### **Level 3: Underground Fortress**
**Theme:** Underground/Cave
**Rooms:** 2
**Status:** ✅ Fully Playable (First Boss Level)
**Difficulty:** Hard → Boss

#### Room 1: Maintenance Tunnels
- **Enemies:** 2 Ninja + 1 Armored
- **Difficulty:** Hard
- **Purpose:** Close-quarters ninja combat
- **Layout:** Ninjas flanking, armored center
- **Challenge:** Fast melee enemies
- **Special:** Grappling Arm pickup
- **Weapon Unlock:** Grappling Arm at (-8, 6, -50)
- **Health:** Ninja: 40 HP, Armored: 200 HP
- **Completion Time:** ~60 seconds

#### Room 2: Underground Fortress (Boss Fight)
- **Enemies:** 2 Ninja + 1 BOSS
- **Difficulty:** Boss
- **Purpose:** First boss encounter
- **Boss Health:** 350 HP
- **Layout:** Boss center elevated, ninjas as adds
- **Mechanics:** Basic boss patterns (planned multi-phase)
- **Completion Time:** ~90-120 seconds

**Total Level Time:** 2.5-3 minutes
**Score Potential:** 1200-1800 points

---

### **Level 4: Dense Jungle**
**Theme:** Jungle
**Rooms:** 2
**Status:** ⚠️ Configured, Untested
**Difficulty:** Medium → Hard

#### Room 1: Jungle Entrance
- **Enemies:** 2 Ninja + 1 Basic + 1 Bomb Thrower
- **Count:** 4 enemies
- **Difficulty:** Medium
- **Purpose:** Multi-threat management
- **Layout:** Ninjas flanking wide, thrower elevated
- **Challenge:** Jungle visibility, mixed threats
- **Health:** Ninja: 70 HP, Basic: 65 HP, Thrower: 90 HP

#### Room 2: Ancient Ruins
- **Enemies:** 1 Armored + 1 Ninja + 1 Fast Debuffer
- **Count:** 3 enemies
- **Difficulty:** Hard
- **Purpose:** Elite enemy composition
- **Layout:** Armored elevated, ninja + debuffer mobile
- **Health:** Armored: 150 HP, Others: 75-55 HP

**Estimated Level Time:** 2.5-3.5 minutes

---

### **Level 5: Space Station Alpha**
**Theme:** Space/Sci-Fi
**Rooms:** 2
**Status:** ⚠️ Configured, Untested
**Difficulty:** Medium → Hard

#### Room 1: Docking Bay
- **Enemies:** 1 Fast Debuffer + 1 Armored + 1 Ninja + 1 Bomb Thrower
- **Count:** 4 enemies
- **Difficulty:** Medium
- **Purpose:** Zero-G combat feel (simulated)
- **Layout:** Vertical spread, elevated positions
- **Challenge:** Multi-height combat

#### Room 2: Command Center
- **Enemies:** 2 Fast Debuffer + 1 Armored + 2 Ninja
- **Count:** 5 enemies
- **Difficulty:** Hard
- **Purpose:** High-intensity mixed combat
- **Layout:** Debuffers on perimeter, ninjas aggressive
- **Health:** Armored: 170 HP, Others: 60-85 HP

**Estimated Level Time:** 3-4 minutes

---

### **Level 6: Haunted Mansion**
**Theme:** Gothic Horror
**Rooms:** 2
**Status:** ⚠️ Configured, Untested
**Difficulty:** Medium → Hard

#### Room 1: Grand Foyer
- **Enemies:** 2 Ninja + 1 Bomb Thrower
- **Count:** 3 enemies
- **Difficulty:** Medium
- **Purpose:** Atmospheric horror combat
- **Layout:** Ninjas in shadows, thrower elevated
- **Challenge:** Visibility and stealth enemies

#### Room 2: Library of Horrors
- **Enemies:** 2 Ninja + 1 Armored + 1 Fast Debuffer
- **Count:** 4 enemies
- **Difficulty:** Hard
- **Purpose:** Multi-threat in confined space
- **Layout:** Vertical library stacks
- **Planned Boss:** Mid-game boss encounter

**Estimated Level Time:** 3-4 minutes

---

### **Level 7: Western Frontier**
**Theme:** Wild West
**Rooms:** 2
**Status:** ⚠️ Configured, Untested
**Difficulty:** Medium → Hard

#### Room 1: Dusty Saloon
- **Enemies:** 2 Basic + 1 Bomb Thrower + 1 Armored
- **Count:** 4 enemies
- **Difficulty:** Medium
- **Purpose:** Classic western shootout
- **Layout:** Bar room brawl setup
- **Challenge:** Mixed ranges and threats

#### Room 2: Desert Outpost
- **Enemies:** 2 Basic + 2 Ninja + 1 Armored
- **Count:** 5 enemies
- **Difficulty:** Hard
- **Purpose:** Frontier defense scenario
- **Layout:** Defensive formation
- **Health:** Armored: 200 HP, Others: 85-100 HP

**Estimated Level Time:** 3-4 minutes

---

### **Level 8: Urban Rooftops**
**Theme:** Urban High-Rise
**Rooms:** 2
**Status:** ⚠️ Configured, Untested
**Difficulty:** Hard → Very Hard

#### Room 1: Skyline Chase
- **Enemies:** 2 Fast Debuffer + 2 Ninja + 1 Armored
- **Count:** 5 enemies
- **Difficulty:** Hard
- **Purpose:** Verticality and speed
- **Layout:** Multi-level rooftops
- **Challenge:** Fast enemies at height

#### Room 2: Corporate Tower
- **Enemies:** 2 Armored + 1 Bomb Thrower + 1 Fast Debuffer
- **Count:** 4 enemies
- **Difficulty:** Very Hard
- **Purpose:** Heavy resistance
- **Layout:** Two heavy tanks + artillery
- **Health:** Armored: 220 HP each

**Estimated Level Time:** 4-5 minutes

---

### **Level 9: Deep Jungle Temple**
**Theme:** Ancient Temple
**Rooms:** 2
**Status:** ⚠️ Configured, Untested
**Difficulty:** Hard → Very Hard

#### Room 1: Temple Entrance
- **Enemies:** 2 Ninja + 1 Bomb Thrower + 1 Armored
- **Count:** 4 enemies
- **Difficulty:** Hard
- **Purpose:** Temple guardian defense
- **Layout:** Ritual positions
- **Challenge:** Ancient defenses

#### Room 2: Sacred Chamber
- **Enemies:** 2 Ninja + 2 Fast Debuffer + 1 Armored + 1 Bomb Thrower
- **Count:** 6 enemies
- **Difficulty:** Very Hard
- **Purpose:** Maximum threat density
- **Layout:** Chamber arena
- **Planned Boss:** Temple guardian boss
- **Health:** Armored: 250 HP

**Estimated Level Time:** 5-6 minutes

---

### **Level 10: Space Station Beta**
**Theme:** Space/Sci-Fi
**Rooms:** 2
**Status:** ⚠️ Configured, Untested
**Difficulty:** Very Hard → Extreme

#### Room 1: Reactor Core
- **Enemies:** 2 Fast Debuffer + 2 Armored + 1 Bomb Thrower
- **Count:** 5 enemies
- **Difficulty:** Very Hard
- **Purpose:** Critical system defense
- **Layout:** Reactor protection formation
- **Challenge:** Heavy armor concentration
- **Health:** Armored: 260 HP each

#### Room 2: AI Core Chamber
- **Enemies:** 2 Fast Debuffer + 2 Ninja + 1 Armored + 1 Bomb Thrower
- **Count:** 6 enemies
- **Difficulty:** Extreme
- **Purpose:** AI defense grid
- **Layout:** Maximum threat composition
- **Planned Boss:** Rogue AI boss
- **Health:** Armored: 280 HP

**Estimated Level Time:** 6-7 minutes

---

### **Level 11: Haunted Cathedral**
**Theme:** Gothic Cathedral
**Rooms:** 2
**Status:** ⚠️ Configured, Untested
**Difficulty:** Very Hard → Extreme

#### Room 1: Cathedral Nave
- **Enemies:** 2 Ninja + 2 Armored + 1 Bomb Thrower
- **Count:** 5 enemies
- **Difficulty:** Very Hard
- **Purpose:** Gothic atmosphere + challenge
- **Layout:** Cathedral architecture
- **Health:** Armored: 290 HP, Ninja: 125 HP

#### Room 2: Bell Tower Summit
- **Enemies:** 2 Ninja + 2 Fast Debuffer + 2 Armored + 1 Bomb Thrower
- **Count:** 7 enemies
- **Difficulty:** Extreme
- **Purpose:** Pre-final boss gauntlet
- **Layout:** Tower defense scenario
- **Health:** Maximum scaling
- **Challenge:** Most enemies in any room

**Estimated Level Time:** 7-8 minutes

---

### **Level 12: Final Boss Arena**
**Theme:** All Themes Combined
**Rooms:** 2
**Status:** ⚠️ Configured, Untested
**Difficulty:** Extreme → Final Boss

#### Room 1: Convergence Chamber
- **Enemies:** 2 Armored + 2 Ninja + 1 Fast Debuffer + 1 Bomb Thrower
- **Count:** 6 enemies
- **Difficulty:** Extreme
- **Purpose:** Final approach
- **Layout:** All environment elements
- **Health:** Maximum values (Armored: 320 HP)
- **Challenge:** Everything you've learned

#### Room 2: Ultimate Showdown (FINAL BOSS)
- **Enemies:** 1 FINAL BOSS
- **Count:** 1 (possibly adds)
- **Difficulty:** Final Boss
- **Boss Health:** 800 HP
- **Phases:** 3 distinct phases
- **Special Attacks:** All boss abilities
- **Layout:** Dynamic arena
- **Mechanics:** Environment transformation per phase
- **Purpose:** Ultimate test of player skill

**Estimated Level Time:** 10-15 minutes

---

## Environmental Themes

### 1. Urban City
**Levels:** 1, 2, 8
**Visual Style:** Industrial, concrete, metal
**Color Palette:** Gray, orange, rust
**Fog Color:** 0x87CEEB (light blue)
**Lighting:** Harsh industrial lights
**Atmosphere:** Gritty, industrial warfare

**Planned Elements:**
- Rooftop helipad
- Concrete barriers
- Industrial machinery
- Neon signs
- Graffiti walls

---

### 2. Dense Jungle
**Levels:** 4, 9
**Visual Style:** Overgrown vegetation, ancient ruins
**Color Palette:** Green, brown, gold
**Fog Color:** 0x228B22 (forest green)
**Lighting:** Dappled sunlight through canopy
**Atmosphere:** Mysterious, ancient

**Planned Elements:**
- Vine-covered pillars
- Ancient statues
- Crumbling stone platforms
- Jungle flora
- Hidden pathways

---

### 3. Space Station
**Levels:** 5, 10
**Visual Style:** Futuristic, metallic, high-tech
**Color Palette:** Blue, white, cyan
**Fog Color:** 0x000011 (deep space)
**Lighting:** Cool fluorescent
**Atmosphere:** Sterile, alien, isolated

**Planned Elements:**
- Control panels
- Glass observation windows
- Floating platforms (zero-G simulation)
- Laser grids
- Holographic interfaces

---

### 4. Haunted House/Cathedral
**Levels:** 6, 11
**Visual Style:** Gothic, decrepit, supernatural
**Color Palette:** Purple, black, crimson
**Fog Color:** 0x2F2F2F (dark gray)
**Lighting:** Dim, flickering candles
**Atmosphere:** Eerie, oppressive, horror

**Planned Elements:**
- Stained glass windows
- Gothic arches
- Cobwebs and dust
- Ghostly apparitions
- Crumbling architecture

---

### 5. Western Town
**Levels:** 7
**Visual Style:** Frontier, wooden, dusty
**Color Palette:** Brown, tan, orange
**Fog Color:** 0xDEB887 (burlywood)
**Lighting:** Warm sunset glow
**Atmosphere:** Rustic, lawless, desert

**Planned Elements:**
- Saloon interiors
- Wooden walkways
- Cactus and tumbleweeds
- Wanted posters
- Desert landscape

---

### 6. Final Arena (Level 12 Only)
**Visual Style:** All themes merged
**Color Palette:** Dynamic, changes per phase
**Lighting:** Dramatic, phase-specific
**Atmosphere:** Epic, climactic, surreal

**Planned Elements:**
- Environment morphs between themes
- Urban → Jungle → Space → Haunted → Western
- Each boss phase changes the arena
- Ultimate visual spectacle

---

## Difficulty Progression

### Difficulty Curve
```
Level 1-2:   ████░░░░░░░░ (Easy)    - Tutorial + basics
Level 3:     █████░░░░░░░ (Medium)  - First boss
Level 4-5:   ██████░░░░░░ (Medium)  - Skill building
Level 6-7:   ███████░░░░░ (Hard)    - Challenge increase
Level 8-9:   ████████░░░░ (Hard)    - Expert territory
Level 10-11: █████████░░░ (V.Hard)  - Pre-final test
Level 12:    ████████████ (Extreme) - Final gauntlet
```

### Difficulty Scaling Factors
1. **Enemy Health** - Increases ~15 HP per level
2. **Enemy Count** - More enemies in later levels
3. **Enemy Types** - More dangerous types appear
4. **Enemy Speed** - Faster attacks (shorter intervals)
5. **Mixed Threats** - Complex enemy compositions
6. **Room Size** - Less cover in later levels (planned)

---

## Level Unlocking System

### Unlock Requirements
```javascript
Level 1:  Always unlocked
Level 2:  Complete Level 1
Level 3:  Complete Level 2
Level 4:  Complete Level 3
// ...pattern continues
Level 12: Complete Level 11
```

### Progression Tracking
- **File:** `src/systems/ProgressionSystem.js`
- **Storage:** localStorage
- **Method:** `isLevelUnlocked(levelNumber)`
- **Unlock Logic:** Sequential (must complete previous level)

### Level Select UI
- **File:** `src/components/UI/LevelSelect.jsx`
- **Features:**
  - Shows unlocked levels only
  - Displays completion status
  - Shows best score per level (planned)
  - Indicates star rating (planned)

---

## Secret Rooms & Branching Paths

### Status: ❌ Not Implemented
### Planned Design

#### Secret Room Types
1. **Weapon Rooms** - Rare weapon pickups
2. **Treasure Rooms** - Score bonuses, collectibles
3. **Challenge Rooms** - Optional hard encounter for rewards
4. **Story Rooms** - Lore and narrative content
5. **Shortcut Rooms** - Skip difficult sections

#### Discovery Methods
- Shoot hidden switches
- Use specific weapons (grappling arm)
- Collect key items
- Solve environmental puzzles
- Find easter eggs

#### Branching Path System
```
Room A
  ├─→ Path 1 (Easy)  → Room B1 → Lower rewards
  └─→ Path 2 (Hard)  → Room B2 → Better rewards
```

#### Path Selection
- Shoot arrows/markers to choose path
- Timed decision windows
- Can't backtrack after choice
- Affects level ending (planned)

---

## Puzzle Integration

### Status: ⚠️ Framework Exists, Minimal Content

### Puzzle Locations
- **Level 1:** None (tutorial)
- **Level 2:** Switch sequence in Room 2 (planned)
- **Level 3:** Door mechanism before boss (planned)
- **Level 4-12:** 1-2 puzzles per level (planned)

### Puzzle Types Per Level
- **Urban:** Tech-based (switch sequences, terminals)
- **Jungle:** Ancient mechanisms (stone pillars, pressure plates)
- **Space:** Advanced tech (hacking, redirecting power)
- **Haunted:** Occult puzzles (ritual circles, ghost hunting)
- **Western:** Mechanical (safes, train switches)

### Puzzle Rewards
- Bonus score (200-500 points)
- Secret room access
- Weapon/ammo pickups
- Shortcut to next area
- Story revelations

---

## Level Pacing & Flow

### Ideal Level Structure (5-10 minutes)
```
00:00 - 00:30  Room 1 (warm-up)
00:30 - 01:30  Room 2 (main combat)
01:30 - 02:00  Puzzle (optional)
02:00 - 03:00  Room 3 (challenge)
03:00 - 04:00  Boss or final room
04:00 - 04:30  Completion sequence
```

### Combat Intensity Curve
```
High │     ╱╲              ╱╲
     │    ╱  ╲            ╱  ╲
     │   ╱    ╲          ╱    ╲     ╱╲
     │  ╱      ╲        ╱      ╲   ╱  ╲
Low  │─╱        ╲──────╱        ╲─╱    ╲───
     └─────────────────────────────────────
     Start  R1   Puzzle  R2   R3  Boss  End
```

### Breathing Room
- Brief pauses between rooms (2-3 seconds)
- Puzzle sections provide combat break
- Weapon pickup moments are safe zones
- Post-boss victory sequence

---

## Level Design Principles

### 1. Clear Readability
- Enemies are visually distinct
- Cover is clearly marked
- Hazards are telegraphed
- Objectives are obvious

### 2. Fair Challenge
- Enemies spawn at safe distance
- Player has time to assess threats
- No instant-death scenarios
- Generous checkpoint system (planned)

### 3. Variety
- Each room feels unique
- Enemy compositions change
- Multiple solutions to encounters
- Optional challenges for skilled players

### 4. Escalation
- Difficulty increases gradually
- New mechanics introduced safely
- Mastery is rewarded
- Late-game assumes player competence

### 5. Visual Storytelling
- Environment tells level narrative
- Enemy types match theme
- Visual progression through level
- Environmental details enrich lore

---

## Level Development Status

### ✅ Complete (Playable)
- Level 1 (Urban Outskirts)
- Level 2 (Industrial Complex)
- Level 3 (Underground Fortress)

### ⚠️ Configured (Needs Testing)
- Levels 4-12 (all rooms defined, untested)

### ❌ Missing Features
- Secret rooms
- Branching paths
- Environmental hazards
- Destructible objects
- Interactive puzzles
- Dynamic events
- Multiple endings
- Level-specific mechanics

---

## Level Design Priorities

### Phase 1: Core Levels (HIGH PRIORITY)
1. Test and balance Levels 4-6
2. Implement Level 6 boss
3. Polish Level 3 boss mechanics
4. Add environmental visuals to all levels
5. Implement puzzle content for Levels 2-4

### Phase 2: Advanced Features (MEDIUM PRIORITY)
6. Add secret rooms to Levels 1-6
7. Implement branching paths in Levels 3, 6, 9
8. Create mid-game boss (Level 6)
9. Add environmental hazards
10. Implement shortcut unlocks

### Phase 3: Late Game (LOW PRIORITY)
11. Test and balance Levels 7-11
12. Implement Level 9 boss
13. Polish Level 12 final boss
14. Add multiple endings
15. Create speedrun routes

---

## Level Analytics (Planned)

### Metrics to Track
- Average completion time per level
- Death locations (heatmap)
- Weapon usage statistics
- Most killed-by enemy types
- Puzzle completion rates
- Secret room discovery rates
- Path selection distribution
- Accuracy per level

### Balancing Tools
- Difficulty adjustment based on deaths
- Enemy spawn tuning
- Weapon effectiveness per level
- Time bonus thresholds
- Score balance for rewards

---

## Future Expansion Levels (DLC)

### Planned Additional Content
- **Level 13-15:** New campaign arc
- **Challenge Levels:** Time trials, survival modes
- **Remix Levels:** Harder versions with modifiers
- **Community Levels:** User-created content
- **Boss Rush Mode:** Fight all bosses consecutively
