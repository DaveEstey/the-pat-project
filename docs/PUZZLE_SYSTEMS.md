# Puzzle Systems Documentation

## Overview
Interactive puzzles provide gameplay variety, reward skilled players, and pace the action. All puzzles are time-sensitive and failure does not cause damage - only loss of bonus rewards.

## Core Files
- **Puzzle System:** `src/systems/PuzzleSystem.js`
- **Puzzle Manager:** `src/components/Game/PuzzleManager.jsx`
- **Interactive Puzzle:** `src/components/Game/InteractivePuzzle.jsx`
- **Puzzle Configs:** `src/data/puzzleConfigs.js`
- **Individual Puzzles:** `src/components/Game/Puzzles/`

---

## Puzzle Design Philosophy

### Core Principles
1. **No Damage Penalties** - Failure never hurts player
2. **Time Pressure** - All puzzles are timed
3. **Optional Rewards** - Bonus score, items, shortcuts
4. **Shooting-Based** - Uses primary combat mechanic
5. **Clear Feedback** - Visual/audio cues for progress
6. **Fair Challenge** - Always telegraphed and learnable

### Reward Structure
```
Perfect Completion:  500-1000 bonus points + secret room
Good Completion:     200-500 bonus points
Failed:              0 points, progress continues
```

---

## Puzzle Types

### 1. Switch Sequence Puzzle
**File:** `src/components/Game/Puzzles/SwitchSequence.jsx`
**Status:** ⚠️ Structure Only
**Difficulty:** Easy → Medium

#### Mechanic
- Multiple switches placed in environment
- Player must shoot them in correct order
- Visual indicators show sequence (numbers, colors, flashes)
- Time limit: 10-15 seconds
- Wrong shot resets sequence or adds time penalty

#### Example Configurations

**Level 2 - Simple Sequence**
```javascript
{
  type: 'switch_sequence',
  timeLimit: 12,
  sequence: [1, 2, 3],
  switches: [
    { id: 1, position: {x: -5, y: 2, z: -10}, color: 'red' },
    { id: 2, position: {x: 0, y: 2, z: -10}, color: 'blue' },
    { id: 3, position: {x: 5, y: 2, z: -10}, color: 'green' }
  ],
  reward: 'bonus_score',
  bonusPoints: 300
}
```

**Level 5 - Complex Sequence**
```javascript
{
  type: 'switch_sequence',
  timeLimit: 15,
  sequence: [3, 1, 4, 2, 5],
  switches: 5, // more switches
  penaltyReset: true,
  reward: 'secret_room_access',
  bonusPoints: 500
}
```

#### Visual Design
- **Inactive:** Gray cube with number
- **Active:** Glowing, animated pulse
- **Hit:** Flash bright, play sound, change color
- **Wrong:** Red flash, shake effect
- **Complete:** All switches glow, victory effect

#### Implementation Needs
- Switch 3D models
- Hit detection for switches
- Sequence tracking logic
- Visual feedback animations
- Timer UI display
- Sound effects (currently disabled)

---

### 2. Terrain Modifier Puzzle
**File:** `src/components/Game/Puzzles/TerrainModifier.jsx`
**Status:** ⚠️ Structure Only
**Difficulty:** Medium

#### Mechanic
- Shoot specific objects to change environment
- Create platforms, open paths, reveal items
- Physics-based interactions
- Time limit: 20-30 seconds
- Environmental storytelling

#### Example Scenarios

**Jungle Level - Bridge Building**
```javascript
{
  type: 'terrain_modifier',
  objective: 'shoot_vines',
  timeLimit: 20,
  targets: [
    { type: 'vine', position: {x: -3, y: 4, z: -15}, effect: 'drop_platform' },
    { type: 'vine', position: {x: 3, y: 4, z: -15}, effect: 'drop_platform' }
  ],
  result: 'bridge_forms',
  reward: 'shortcut_path',
  bonusPoints: 400
}
```

**Space Level - Gravity Manipulation**
```javascript
{
  type: 'terrain_modifier',
  objective: 'activate_gravity_panels',
  timeLimit: 25,
  targets: 4,
  effect: 'rotate_room_90_degrees',
  reward: 'secret_item',
  bonusPoints: 600
}
```

**Urban Level - Explosive Demolition**
```javascript
{
  type: 'terrain_modifier',
  objective: 'shoot_structural_weakpoints',
  timeLimit: 15,
  targets: 3,
  effect: 'collapse_wall',
  reward: 'new_path_opens',
  bonusPoints: 350
}
```

#### Implementation Needs
- Destructible environment system
- Physics simulation for falling objects
- Particle effects for destruction
- Animation system for terrain changes
- Multiple terrain types per theme
- Path-finding updates after changes

---

### 3. Door Mechanism Puzzle
**File:** `src/components/Game/Puzzles/DoorMechanism.jsx`
**Status:** ⚠️ Structure Only
**Difficulty:** Medium → Hard

#### Mechanic
- Complex multi-step door unlocking
- Requires specific weapons or items
- May involve sequence + tool combination
- Time limit: 30-45 seconds
- Teaches weapon utility beyond combat

#### Example Configurations

**Basic Door - Key Item**
```javascript
{
  type: 'door_mechanism',
  requirement: 'key_item',
  keyItem: 'red_keycard',
  timeLimit: 10,
  reward: 'door_opens',
  bonusPoints: 200
}
```

**Grappling Hook Door**
```javascript
{
  type: 'door_mechanism',
  steps: [
    { action: 'grapple_lever', position: {x: -5, y: 5, z: -10} },
    { action: 'shoot_release_button', position: {x: 5, y: 2, z: -10} }
  ],
  timeLimit: 20,
  requiredWeapon: 'grappling',
  reward: 'heavy_door_opens',
  bonusPoints: 450
}
```

**Bomb Puzzle Door**
```javascript
{
  type: 'door_mechanism',
  steps: [
    { action: 'freeze_water_leak', weapon: 'ice_bomb', position: {x: 0, y: 3, z: -12} },
    { action: 'explosive_open_door', weapon: 'explosive_bomb', position: {x: 0, y: 1, z: -10} }
  ],
  timeLimit: 35,
  reward: 'secret_treasure_room',
  bonusPoints: 800
}
```

#### Door Types
1. **Locked Door** - Needs key item
2. **Mechanism Door** - Pull levers/grapple
3. **Reinforced Door** - Requires explosive
4. **Energy Door** - Power puzzle
5. **Timed Door** - Opens briefly, maintain open

#### Implementation Needs
- Door 3D models and animations
- Key item system integration
- Weapon-specific interactions
- Multi-step puzzle logic
- Visual progress indicators
- Door physics and collision

---

### 4. Path Selector Puzzle
**File:** `src/components/Game/Puzzles/PathSelector.jsx`
**Status:** ⚠️ Structure Only
**Difficulty:** Easy (decision-based)

#### Mechanic
- Shoot arrow markers to choose path
- Branches lead to different rooms/rewards
- Can't return after choice
- Time limit: 10 seconds (decision pressure)
- Affects level progression

#### Example Configuration
```javascript
{
  type: 'path_selector',
  timeLimit: 10,
  paths: [
    {
      id: 'left',
      marker: { position: {x: -5, y: 2, z: -15}, color: 'blue' },
      destination: 'easy_combat_room',
      reward: 'safe_path',
      description: 'Lower difficulty, standard rewards'
    },
    {
      id: 'right',
      marker: { position: {x: 5, y: 2, z: -15}, color: 'red' },
      destination: 'challenge_room',
      reward: 'high_risk_high_reward',
      description: 'Higher difficulty, better rewards'
    }
  ],
  defaultPath: 'center', // if no choice made
  bonusPoints: 0 // no bonus for making choice, but path affects rewards
}
```

#### Path Types
1. **Easy vs Hard** - Risk/reward choice
2. **Combat vs Puzzle** - Playstyle preference
3. **Fast vs Thorough** - Time vs completion
4. **Secret Path** - Hidden third option

#### Strategic Depth
- Easy path: Faster, less score
- Hard path: Slower, more score
- Secret path: Requires discovery, best rewards
- Speedrun optimization
- Replayability factor

#### Implementation Needs
- Arrow/marker 3D models
- Branching room system
- Path visualization
- Timer UI with urgency
- Room loading based on choice
- Path analytics tracking

---

### 5. Memory Pattern Puzzle (Planned)
**Status:** ❌ Not Implemented
**Difficulty:** Medium → Hard

#### Mechanic
- Sequence of switches lights up
- Player must memorize and repeat
- Sequence gets longer each round
- Failure resets to start
- Time limit per round: 5-10 seconds

#### Example Configuration
```javascript
{
  type: 'memory_pattern',
  rounds: 3,
  startingSequence: 3,
  sequenceIncrease: 2, // +2 switches per round
  timePerSwitch: 2, // seconds to shoot each
  switches: 6,
  reward: 'weapon_upgrade',
  bonusPoints: 700
}
```

---

### 6. Timed Target Sequence (Planned)
**Status:** ❌ Not Implemented
**Difficulty:** Medium

#### Mechanic
- Targets appear and disappear quickly
- Must hit all before time expires
- Tests reaction time and accuracy
- Moving targets (later levels)
- Combo multiplier for consecutive hits

#### Example Configuration
```javascript
{
  type: 'timed_targets',
  targetCount: 10,
  timeLimit: 15,
  targetDuration: 2, // each target visible for 2s
  targetSize: 'small',
  moving: false, // static for early levels
  reward: 'accuracy_bonus',
  bonusPoints: 500
}
```

---

### 7. Reflection/Mirror Puzzle (Planned)
**Status:** ❌ Not Implemented
**Difficulty:** Hard

#### Mechanic
- Shoot mirrors to redirect projectile beams
- Hit target that's not in direct line of sight
- Physics-based reflection angles
- Multiple mirrors in sequence
- Laser beam visualization

#### Example Configuration
```javascript
{
  type: 'reflection_puzzle',
  mirrors: [
    { id: 1, position: {x: -3, y: 2, z: -12}, angle: 45, rotatable: false },
    { id: 2, position: {x: 3, y: 3, z: -15}, angle: 90, rotatable: true }
  ],
  target: { position: {x: 0, y: 1, z: -20} },
  timeLimit: 30,
  reward: 'energy_weapon_unlock',
  bonusPoints: 900
}
```

---

### 8. Pressure Plate Puzzle (Planned)
**Status:** ❌ Not Implemented
**Difficulty:** Medium

#### Mechanic
- Shoot objects onto pressure plates
- All plates must be pressed simultaneously
- Use environment (boxes, barrels)
- May require specific weapon (grappling to pull objects)
- Physics-based weight system

---

### 9. Elemental Combination Puzzle (Planned)
**Status:** ❌ Not Implemented
**Difficulty:** Hard

#### Mechanic
- Use bomb elements in combination
- Ice + Water = freeze mechanism
- Fire + Explosive = clear obstacles
- Water + Electric = overload circuits
- Requires inventory management

#### Example
```javascript
{
  type: 'elemental_combo',
  steps: [
    { action: 'extinguish_fire', weapon: 'water_bomb', target: 'fire_barrier' },
    { action: 'freeze_steam', weapon: 'ice_bomb', target: 'steam_vent' },
    { action: 'cross_frozen_path', description: 'Walk across frozen steam' }
  ],
  timeLimit: 40,
  reward: 'elemental_mastery_achievement',
  bonusPoints: 1000
}
```

---

## Puzzle Integration in Levels

### Current Level Puzzle Plans

| Level | Puzzle Type | Location | Status |
|-------|-------------|----------|--------|
| 1 | None | - | Tutorial level |
| 2 | Switch Sequence | Room 2 | Planned |
| 3 | Door Mechanism | Before Boss | Planned |
| 4 | Terrain Modifier | Room 1 | Planned |
| 5 | Memory Pattern | Room 2 | Planned |
| 6 | Path Selector | Between Rooms | Planned |
| 7 | Timed Targets | Room 1 | Planned |
| 8 | Reflection | Room 2 | Planned |
| 9 | Elemental Combo | Room 2 | Planned |
| 10 | Multiple Types | Both Rooms | Planned |
| 11 | Advanced Sequence | Room 2 | Planned |
| 12 | Boss Mechanic Puzzle | Boss Room | Planned |

---

## Puzzle Configuration System

### PuzzleConfig Structure
```javascript
// src/data/puzzleConfigs.js
{
  level: number,
  room: number,
  type: 'switch_sequence' | 'terrain_modifier' | etc.,
  timeLimit: number (seconds),
  bonusMultiplier: number (score modifier),
  required: boolean (blocks progress if true),
  difficulty: 'easy' | 'medium' | 'hard',
  hints: [...], // optional hint system
  ...typeSpecificConfig
}
```

### Dynamic Puzzle Loading
```javascript
// src/components/Game/InteractivePuzzle.jsx
const puzzleConfig = getPuzzleForLevel(currentLevel);
if (puzzleConfig && puzzleConfig.room === currentRoom) {
  return <InteractivePuzzle {...puzzleConfig} />;
}
```

---

## Puzzle UI Components

### Timer Display
- Circular countdown timer
- Color-coded urgency (green → yellow → red)
- Pulse animation when low
- Freeze effect when paused

### Objective Display
- Clear text description
- Step-by-step for multi-part puzzles
- Checkmarks for completed steps
- Highlighted current objective

### Hint System (Planned)
- Optional hints after failure
- Hint cooldown (30 seconds)
- Subtle visual cues
- Tutorial tooltips for first encounter

### Progress Indicator
- Visual feedback for partial completion
- Sequence position tracker
- Success/failure visual effects
- Celebration animation on completion

---

## Puzzle Difficulty Balancing

### Difficulty Factors
1. **Time Limit** - Less time = harder
2. **Complexity** - More steps = harder
3. **Precision** - Small targets = harder
4. **Sequence Length** - Longer = harder
5. **Visibility** - Hidden switches = harder

### Difficulty Progression
```
Level 2-3:  Simple sequences, generous timing
Level 4-6:  Multi-step puzzles, moderate timing
Level 7-9:  Complex mechanics, tight timing
Level 10-12: Mastery-level challenges, extreme precision
```

### Adaptive Difficulty (Planned)
- Track puzzle failures
- Extend time limit after 3+ failures
- Provide additional hints
- Reduce complexity slightly
- Ensure player can progress

---

## Puzzle Rewards

### Reward Types
1. **Bonus Score** - 200-1000 points
2. **Secret Room Access** - Hidden areas
3. **Item Unlocks** - Weapons, powerups
4. **Shortcut Paths** - Skip difficult sections
5. **Story Content** - Lore collectibles
6. **Achievements** - Completion tracking

### Reward Scaling
```javascript
Perfect Time (< 50% time used):  100% bonus + extra reward
Good Time (50-75% time used):    100% bonus
Decent Time (75-99% time used):  75% bonus
Barely Made It (>99% time):      50% bonus
Failed:                          0% bonus, no extras
```

---

## Accessibility Considerations

### Difficulty Options
- **Extended Time Mode** - 50% more time
- **Hint System** - More frequent hints
- **Visual Assist** - Larger targets, brighter colors
- **Audio Cues** - Sound indicators for sequences
- **Skip Puzzle** - Option after 5 failures (lower rewards)

### Colorblind Support
- Use shapes + colors for switches
- High contrast modes
- Pattern-based identification
- Text labels option

---

## Puzzle Testing Checklist

### For Each Puzzle Type:
- [ ] Can be completed within time limit by average player
- [ ] Failure doesn't block level progression
- [ ] Visual feedback is clear and immediate
- [ ] Tutorial/hint explains mechanic
- [ ] Rewards are satisfying
- [ ] Difficulty matches level position
- [ ] No softlock scenarios possible
- [ ] Works with all weapon loadouts
- [ ] Performance impact is minimal

---

## Puzzle Development Priorities

### Phase 1: Core Implementation (HIGH PRIORITY)
1. Implement SwitchSequence puzzle fully
2. Create puzzle timer UI component
3. Add puzzle objective display
4. Implement basic reward system
5. Add 1-2 puzzles to Levels 2-3

### Phase 2: Expand Variety (MEDIUM PRIORITY)
6. Implement TerrainModifier puzzle
7. Implement DoorMechanism puzzle
8. Create PathSelector branching system
9. Add puzzles to Levels 4-6
10. Implement hint system

### Phase 3: Advanced Puzzles (LOW PRIORITY)
11. Implement MemoryPattern puzzle
12. Implement ReflectionPuzzle
13. Implement ElementalCombo system
14. Add puzzles to Levels 7-12
15. Create puzzle achievement system

---

## Puzzle Analytics (Planned)

### Metrics to Track
- Completion rate per puzzle type
- Average time to complete
- Failure rate and reasons
- Hint usage frequency
- Reward claim rate
- Player preference (combat vs puzzle)

### Balancing Tools
- Adjust time limits based on data
- Identify frustrating puzzles
- Reward tuning
- Difficulty curve validation

---

## Integration with Boss Fights

### Boss Mechanic Puzzles
Some boss fights incorporate puzzle elements:

**Level 3 Boss - Shield Puzzle**
- Boss has energy shield
- Must shoot generators in sequence
- Shield drops briefly after correct sequence
- Adds strategy to boss fight

**Level 12 Final Boss - Phase Puzzles**
- Each phase has puzzle to weaken boss
- Environmental interactions required
- Combines combat + puzzle solving
- Tests all skills learned

---

## Future Puzzle Expansion

### Co-op Puzzle Ideas (If Multiplayer Added)
- One player holds switch, other progresses
- Synchronized shooting sequences
- Player-specific paths that rejoin
- Cooperative grappling mechanics

### Procedural Puzzles
- Randomly generated switch sequences
- Variable target positions
- Replayability without memorization
- Difficulty adapts to player skill

### Narrative Puzzles
- Puzzles that reveal story
- Collectible pieces form larger picture
- Optional deep lore for dedicated players
- Environmental storytelling through mechanics
