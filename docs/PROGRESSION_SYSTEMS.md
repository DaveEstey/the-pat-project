# Progression Systems Documentation

## Overview
Player progression spans multiple systems: weapon unlocks, permanent upgrades, level completion, achievements, and score-based mastery. Provides long-term goals and replayability.

## Core Files
- **Progression System:** `src/systems/ProgressionSystem.js`
- **Save System:** `src/systems/SaveSystem.js`
- **Game Context:** `src/contexts/GameContext.jsx`
- **Game Config:** `src/data/gameConfig.js`

---

## Weapon Unlock System

### Status: ✅ Fully Implemented

### Unlock Progression Path
```
Start → Pistol (default)
Level 1, Room 2 → Shotgun
Level 2, Room 2 → Rapid Fire
Level 3, Room 1 → Grappling Arm
Levels 4-12 → Bomb Weapons (planned)
```

### Unlock Mechanics
**File:** `src/systems/ProgressionSystem.js`

```javascript
// Unlock a weapon
unlockWeapon(weaponType, source = 'unknown') {
  if (this.unlockedWeapons.has(weaponType)) {
    return false; // Already unlocked
  }

  this.unlockedWeapons.add(weaponType);
  this.saveProgression();
  this.notifyListeners('weaponUnlocked', { weaponType, source });
  return true;
}

// Check if weapon is unlocked
isWeaponUnlocked(weaponType) {
  return this.unlockedWeapons.has(weaponType);
}
```

### Weapon Pickup System
**File:** `src/components/Game/WeaponPickup.jsx`
- 3D collectible in world
- Position defined in room config
- Collected on proximity or shoot
- Triggers progression system unlock
- Prevents duplicate pickups

### Persistence
- Stored in localStorage
- Survives browser close
- Shared across all saves
- Reset only on "New Game" option

---

## Level Completion System

### Status: ✅ Fully Implemented

### Completion Tracking
```javascript
// Mark level complete
completeLevel(levelNumber, stats = {}) {
  this.completedLevels.add(levelNumber);
  this.saveProgression();
  this.notifyListeners('levelCompleted', { levelNumber, stats });
  return true;
}

// Check if level is completed
isLevelCompleted(levelNumber) {
  return this.completedLevels.has(levelNumber);
}
```

### Level Unlocking
```javascript
// Level 1 always unlocked, others require previous completion
isLevelUnlocked(levelNumber) {
  if (levelNumber === 1) return true;
  return this.completedLevels.has(levelNumber - 1);
}
```

### Completion Stats (Planned)
- Time taken to complete
- Accuracy percentage
- Enemies defeated
- Deaths count
- Score achieved
- Secrets found

### Star Rating System (Planned)
```javascript
// Based on accuracy thresholds (gameConfig.js:47)
starRequirements: [0.6, 0.8, 0.95]

// 1 Star:  60% accuracy
// 2 Stars: 80% accuracy
// 3 Stars: 95% accuracy
```

---

## Score System

### Status: ✅ Basic Implementation

### Score Sources
```javascript
// From gameConfig.js:31-41
scoring: {
  baseKillScore: 100,
  accuracyBonus: 50,
  speedBonus: 25,
  comboMultiplier: 1.5,
  comboTimeWindow: 3.0,
  itemCollectionScore: 50,
  puzzleCompletionScore: 200,
  timeBonus: 10 // per second remaining
}
```

### Score Calculation
```javascript
// Kill Score
basicKillScore = enemyType.score (50-200 base)
comboMultiplier = 1.5x for consecutive kills
finalKillScore = basicKillScore * comboMultiplier

// Level Completion Bonus
timeBonus = remainingSeconds * 10
accuracyBonus = (accuracy >= 0.8) ? 50 : 0
speedBonus = (completionTime < target) ? 25 : 0
puzzleBonus = puzzlesCompleted * 200

totalScore = killScore + timeBonus + accuracyBonus + speedBonus + puzzleBonus
```

### Leaderboards (Planned)
- Per-level high scores
- Global ranking
- Friend comparisons
- Time-based categories (daily, weekly, all-time)
- Speedrun leaderboards

---

## Permanent Upgrades System

### Status: ⚠️ Structure Exists, Not Implemented

### Upgrade Categories

#### 1. Combat Upgrades
```javascript
// Damage increases
{
  id: 'enhanced_damage_1',
  name: 'Weapon Training I',
  description: '+10% damage with all weapons',
  cost: 1000,
  effect: { damageMultiplier: 1.1 },
  unlockRequirement: null // always available
}

{
  id: 'enhanced_damage_2',
  name: 'Weapon Training II',
  description: '+20% damage with all weapons',
  cost: 2500,
  effect: { damageMultiplier: 1.2 },
  unlockRequirement: 'enhanced_damage_1'
}

{
  id: 'enhanced_damage_3',
  name: 'Weapon Mastery',
  description: '+35% damage with all weapons',
  cost: 5000,
  effect: { damageMultiplier: 1.35 },
  unlockRequirement: 'enhanced_damage_2'
}
```

#### 2. Defense Upgrades
```javascript
{
  id: 'reinforced_armor',
  name: 'Reinforced Armor',
  description: '+20% max health',
  cost: 1500,
  effect: { maxHealthMultiplier: 1.2 }
}

{
  id: 'damage_reduction',
  name: 'Combat Hardened',
  description: 'Take 15% less damage',
  cost: 2000,
  effect: { damageReduction: 0.15 }
}

{
  id: 'extra_life',
  name: 'Second Wind',
  description: '+1 extra life',
  cost: 3000,
  effect: { extraLives: 1 }
}
```

#### 3. Accuracy Upgrades
```javascript
{
  id: 'eagle_eye',
  name: 'Eagle Eye',
  description: '+15% accuracy with all weapons',
  cost: 1200,
  effect: { accuracyBonus: 0.15 }
}

{
  id: 'critical_hit',
  name: 'Critical Eye',
  description: '+10% critical hit chance',
  cost: 2500,
  effect: { criticalChance: 0.10 }
}

{
  id: 'headshot_bonus',
  name: 'Marksman',
  description: 'Headshots deal 3x damage (up from 2x)',
  cost: 3500,
  effect: { headshotMultiplier: 3.0 }
}
```

#### 4. Reload & Ammo Upgrades
```javascript
{
  id: 'fast_reload',
  name: 'Speed Loader',
  description: '-25% reload time',
  cost: 1500,
  effect: { reloadSpeedMultiplier: 0.75 }
}

{
  id: 'extended_magazine',
  name: 'Extended Mags',
  description: '+50% ammo capacity',
  cost: 2000,
  effect: { ammoCapacityMultiplier: 1.5 }
}

{
  id: 'ammo_efficiency',
  name: 'Ammo Conservation',
  description: '25% chance not to consume ammo',
  cost: 2500,
  effect: { ammoEfficiencyChance: 0.25 }
}
```

#### 5. Utility Upgrades
```javascript
{
  id: 'quick_swap',
  name: 'Quick Swap',
  description: 'Instant weapon switching',
  cost: 1800,
  effect: { instantWeaponSwitch: true }
}

{
  id: 'grapple_range',
  name: 'Extended Grapple',
  description: '+50% grappling arm range',
  cost: 2200,
  effect: { grappleRangeMultiplier: 1.5 }
}

{
  id: 'bomb_radius',
  name: 'Demolition Expert',
  description: '+35% bomb explosion radius',
  cost: 2800,
  effect: { bombRadiusMultiplier: 1.35 }
}
```

#### 6. Passive Abilities
```javascript
{
  id: 'life_steal',
  name: 'Vampiric',
  description: 'Restore 5 HP per kill',
  cost: 3500,
  effect: { healthPerKill: 5 }
}

{
  id: 'score_multiplier',
  name: 'Fortune Favored',
  description: '+25% score from all sources',
  cost: 4000,
  effect: { scoreMultiplier: 1.25 }
}

{
  id: 'invulnerability_frames',
  name: 'Combat Reflexes',
  description: '2 seconds invulnerability after hit',
  cost: 5000,
  effect: { invulnerabilityTime: 2.0 }
}
```

### Upgrade Purchasing
```javascript
// Cost is score points
currentScore >= upgradeCost → Can purchase
Purchase → Deduct cost from score
Upgrade activates permanently
Save to progression system
```

### Upgrade Tree Visualization (Planned)
- Node-based upgrade UI
- Show dependencies (unlock requirements)
- Highlight affordable upgrades
- Display current bonuses
- Reset option (refund 50% cost)

---

## Key Item System

### Status: ⚠️ Basic Structure

### Key Item Types
1. **Keycards** - Opens specific doors
2. **Ancient Keys** - Unlocks secrets in themed levels
3. **Security Badges** - Access restricted areas
4. **Special Tools** - Environmental interactions

### Key Item Tracking
```javascript
// Collect a key item
collectKeyItem(itemId, source = 'unknown') {
  if (this.collectedKeyItems.has(itemId)) {
    return false; // Already collected
  }

  this.collectedKeyItems.add(itemId);
  this.saveProgression();
  this.notifyListeners('keyItemCollected', { itemId, source });
  return true;
}

// Check possession
hasKeyItem(itemId) {
  return this.collectedKeyItems.has(itemId);
}
```

### Key Item Usage
- Permanent collection (never consumed)
- Used for door puzzles
- Unlocks secret rooms
- Required for alternate endings
- Some are optional, others required

### Planned Key Items
```javascript
// Level-specific keys
'level_1_security_card'
'level_3_ancient_stone'
'level_5_space_station_pass'
'level_6_cursed_amulet'
'level_7_sheriff_badge'
'level_9_temple_crystal'

// Global keys (work across levels)
'master_keycard'
'ancient_universal_key'
'hacking_device'
```

---

## Secret Room System

### Status: ⚠️ Framework Only

### Secret Discovery
```javascript
// Discover a secret room
discoverSecretRoom(roomId, source = 'unknown') {
  if (this.secretRoomsFound.has(roomId)) {
    return false; // Already found
  }

  this.secretRoomsFound.add(roomId);
  this.saveProgression();
  this.notifyListeners('secretRoomDiscovered', { roomId, source });
  return true;
}
```

### Secret Room Types

#### 1. Treasure Rooms
- High score bonuses (500-1000 points)
- Rare items
- Ammo caches
- Health restoration

#### 2. Challenge Rooms
- Optional difficult encounter
- Better rewards for success
- No penalty for skipping
- Tests specific skills

#### 3. Story Rooms
- Lore collectibles
- Audio logs (when audio implemented)
- Environmental storytelling
- Character backstory

#### 4. Shortcut Rooms
- Skip difficult sections
- Faster completion time
- May bypass combat
- Trade thoroughness for speed

### Discovery Methods
- Shoot hidden switches
- Use grappling arm on suspicious objects
- Complete puzzles perfectly
- Find and use key items
- Explore off the beaten path

### Secret Tracking
- Per-level secret count (0/3, 1/3, 2/3, 3/3)
- Global secret completion percentage
- Achievement for finding all secrets
- Unlocks achievement room (100% secrets)

---

## Achievement System

### Status: ❌ Not Implemented (Planned)

### Achievement Categories

#### Combat Achievements
```javascript
'first_blood'          // Kill first enemy
'sharpshooter'         // 100% accuracy in a level
'headhunter'           // Get 50 headshots
'arsenal_master'       // Kill enemies with every weapon type
'boss_slayer'          // Defeat first boss
'boss_speedrun'        // Defeat boss in under 1 minute
'pacifist_puzzle'      // Complete level using only puzzles (planned)
'no_damage'            // Complete level without taking damage
'flawless_victory'     // Complete game without dying
```

#### Collection Achievements
```javascript
'weapon_collector'     // Unlock all weapons
'key_finder'           // Find all key items
'secret_seeker'        // Find 10 secret rooms
'secret_master'        // Find all secret rooms
'treasure_hunter'      // Collect all collectibles in a level
```

#### Score Achievements
```javascript
'score_rookie'         // Reach 10,000 total score
'score_veteran'        // Reach 50,000 total score
'score_master'         // Reach 100,000 total score
'score_legend'         // Reach 250,000 total score
'perfect_level'        // Get 3 stars on a level
'perfect_game'         // Get 3 stars on all levels
```

#### Speed Achievements
```javascript
'speedrunner_1'        // Complete Level 1 in under 1 minute
'speedrunner_3'        // Complete Level 3 in under 2 minutes
'speed_demon'          // Complete any level in half target time
'marathon_runner'      // Complete all levels in under 1 hour
```

#### Challenge Achievements
```javascript
'pistol_only'          // Complete level using only pistol
'one_shot_one_kill'    // Complete level with no misses
'glass_cannon'         // Complete level with 1 HP
'minimalist'           // Complete level without picking up items
'rambo'                // Complete level without reloading (glitch?)
```

#### Discovery Achievements
```javascript
'explorer'             // Visit all rooms in all levels
'archaeologist'        // Find all story collectibles
'hacker'               // Solve all door puzzles
'puzzle_master'        // Complete all puzzles perfectly
```

### Achievement Rewards
- Unlock special weapon skins
- Grant score multipliers
- Unlock challenge modes
- Grant cosmetic rewards
- Steam/platform achievements (if published)

---

## Challenge Modes

### Status: ❌ Not Implemented (Planned)

### Mode Types

#### 1. Time Attack
- Complete level as fast as possible
- No score bonuses, pure speed
- Leaderboard rankings
- Ghost replay system

#### 2. Score Attack
- Maximum score focus
- Extended time limits
- Combo emphasis
- Style points for creative kills

#### 3. Survival Mode
- Endless enemy waves
- Increasing difficulty
- Survive as long as possible
- Leaderboard based on wave count

#### 4. Boss Rush
- Fight all bosses consecutively
- No breaks between fights
- Limited continues
- Ultimate skill test

#### 5. Ironman Mode
- One life, no continues
- Complete entire game
- No saves/checkpoints
- For hardcore players

#### 6. Randomizer Mode
- Random enemy placements
- Random weapon pickups
- Random puzzle types
- High replayability

---

## Progression Summary UI

### Status: ⚠️ Basic Data Structure

### Summary Data Structure
```javascript
getProgressionSummary() {
  return {
    weapons: {
      unlocked: ['pistol', 'shotgun'],
      locked: ['rapidfire', 'grappling'],
      total: 4
    },
    levels: {
      completed: [1, 2],
      count: 2,
      total: 12
    },
    keyItems: {
      collected: ['level_1_keycard'],
      count: 1
    },
    secretRooms: {
      found: ['level_1_secret_1'],
      count: 1
    },
    stats: { // Planned
      totalKills: 145,
      totalScore: 12500,
      totalPlaytime: '2h 34m',
      averageAccuracy: 76.5,
      fastestLevel: { level: 1, time: '1:24' }
    }
  };
}
```

### UI Display (Planned)
- Overall completion percentage
- Circular progress indicators
- Weapon collection grid
- Level completion checklist
- Achievement showcase
- Stat cards with icons

---

## Save System Integration

### Status: ✅ Basic Implementation

### Save Data Structure
```javascript
{
  version: '1.0',
  timestamp: Date.now(),
  progression: {
    weapons: [...],
    levels: [...],
    keyItems: [...],
    secretRooms: [...],
    upgrades: [...]
  },
  currentGame: {
    level: 3,
    score: 1250,
    health: 75,
    ammo: {...}
  },
  settings: {...}
}
```

### Save System Methods
```javascript
// Save game
saveGame(state, slotName = 'autosave') {
  const saveData = prepareSaveData(state);
  localStorage.setItem(`save_${slotName}`, JSON.stringify(saveData));
  return true;
}

// Load game
loadGame(slotName = 'autosave') {
  const data = localStorage.getItem(`save_${slotName}`);
  if (!data) return null;
  return JSON.parse(data);
}

// Auto-save triggers
- Level completion
- Boss defeat
- Secret room discovery
- Major milestone (every 5 minutes)
```

### Multiple Save Slots (Planned)
- Slot 1, 2, 3 (manual saves)
- Autosave slot (automatic)
- Quick save (F5)
- Cloud sync (Steam, Epic, etc.)

---

## Respec System (Planned)

### Upgrade Reset
- Reset all permanent upgrades
- Refund 75% of spent score
- Option in settings menu
- Cooldown: Once per week
- Allows build experimentation

---

## Progression Analytics

### Tracked Metrics (Planned)
- Weapon usage frequency
- Kill/death ratio per level
- Most failed rooms
- Average completion time per level
- Secret discovery rate
- Puzzle completion rate
- Upgrade purchase patterns
- Popular builds

### Purpose
- Balance weapons and enemies
- Adjust difficulty curves
- Identify pain points
- Reward active players
- Guide future content

---

## Progression Development Priorities

### Phase 1: Core Systems (HIGH PRIORITY)
1. Implement permanent upgrade system
2. Create upgrade purchase UI
3. Implement upgrade effects on gameplay
4. Add star rating system to levels
5. Implement score-based rewards

### Phase 2: Depth & Rewards (MEDIUM PRIORITY)
6. Implement secret room system
7. Create achievement system
8. Add achievement notifications
9. Implement key item usage
10. Create progression summary UI

### Phase 3: Challenge Content (LOW PRIORITY)
11. Implement challenge modes
12. Create time attack mode
13. Add boss rush mode
14. Implement leaderboards
15. Add daily/weekly challenges

---

## Monetization Considerations (If Applicable)

### Ethical Monetization
- **NO pay-to-win** - Only cosmetics
- **NO loot boxes** - Direct purchases only
- **NO progression skips** - Skill-based progression

### Acceptable Monetization
- Weapon skins (visual only)
- Character costumes
- UI themes
- Sound packs
- Supporter pack (cosmetics + early access)
- Expansion DLC (new levels, story)

### Never Monetize
- Weapons
- Upgrades
- Difficulty adjustments
- Lives/continues
- Progression boosters

---

## Long-Term Engagement

### Daily/Weekly Challenges (Planned)
- Rotate daily challenge levels
- Unique modifiers
- Special rewards
- Leaderboard reset cycles

### Seasonal Content
- Themed events (Halloween, etc.)
- Limited-time challenges
- Exclusive cosmetics
- Community goals

### Community Features
- Level sharing (if custom levels)
- Replay sharing
- Screenshot mode
- Speedrun tools

---

## Progression Reset Options

### New Game
- Resets all progress
- Keeps settings
- Confirmation prompt
- Can't undo

### New Game+
- Keep upgrades
- Enemies are harder
- Better rewards
- Prestige system (planned)

### Practice Mode
- Any level, any loadout
- No progression saved
- Experiment freely
- Training mode
