# On-Rails Shooter - Completion Plan

## Definition: "Complete Game"

A complete on-rails shooter must have:

### Core Features (MUST HAVE)
1. ✅ **Playable Combat** - Shoot, reload, switch weapons
2. ⚠️ **All 12 Levels** - Currently 3 tested, 9 untested
3. ⚠️ **4 Base Weapons** - Pistol, Shotgun, Rapid Fire, Grappling (partial)
4. ⚠️ **6 Enemy Types** - Basic, Armored, Ninja, Bomber, Debuffer, Boss (partial AI)
5. ❌ **Weapon Progression** - Unlock weapons through levels
6. ❌ **Basic Puzzles** - At least 1-2 puzzle types working
7. ❌ **Upgrade System** - Permanent stat upgrades
8. ❌ **Save/Load** - Progress persistence
9. ❌ **Secret Rooms** - Hidden bonus areas (2-3 per level)
10. ⚠️ **Boss Fights** - 2-3 bosses with phases

### Polish Features (SHOULD HAVE)
11. ❌ **Visual Effects** - Particles, explosions, muzzle flash
12. ❌ **UI Feedback** - Damage numbers, hit markers, combos
13. ⚠️ **Performance** - Solid 60 FPS (needs optimization)
14. ❌ **Audio** - SFX and music (currently disabled)
15. ❌ **Difficulty Balance** - Tested and tuned

### Optional Features (NICE TO HAVE)
16. ❌ **Achievement System**
17. ❌ **Challenge Modes**
18. ❌ **Multiple Endings**

---

## Current State Audit

### What's Working (35% complete)
- Core Three.js rendering
- Basic shooting mechanics
- Room-based progression
- Weapon switching
- Enemy spawning
- Level 1-3 playable
- Basic UI (health, score, ammo)

### What's Broken/Missing (65% incomplete)
- Ninja dash attacks don't work
- Bomb thrower has no arc trajectory
- Grappling arm doesn't pull
- Fast debuffer doesn't move
- No boss phase transitions
- No damage falloff on shotgun
- No rapid fire overheat
- No puzzles implemented
- No upgrade system
- No secret rooms
- No save system integration
- Levels 4-12 untested
- No visual polish
- No audio

---

## Achievable Completion Scope (Token-Limited)

Given token constraints (~96k remaining), we'll focus on:

### PRIORITY 1: Make Levels 1-3 PERFECT (30% of work)
- Fix all weapon mechanics
- Complete all enemy AI behaviors
- Polish boss fight
- Add visual feedback
- Test and balance

### PRIORITY 2: Make Levels 4-6 PLAYABLE (25% of work)
- Test existing configs
- Fix any spawn bugs
- Add weapon pickups
- Balance difficulty

### PRIORITY 3: Core Systems (25% of work)
- Implement basic upgrade system (3-5 upgrades)
- Add 1 puzzle type (Switch Sequence)
- Implement save/load properly
- Add 1 secret room per level

### PRIORITY 4: Polish (20% of work)
- Visual effects improvements
- UI feedback (hit markers, damage numbers)
- Performance optimization basics
- Final balance pass

### DEFERRED (Not in Scope)
- Audio system (leave disabled)
- Levels 7-12 (leave configured)
- Multiple puzzle types
- Challenge modes
- Achievements
- Complex boss mechanics

---

## Execution Plan (12 Major Tasks)

### Phase 1: Weapon Systems (Tasks 1-3)
1. **Fix Shotgun** - Add damage falloff with distance
2. **Fix Rapid Fire** - Add overheat mechanic
3. **Fix Grappling Arm** - Implement pull physics

### Phase 2: Enemy AI (Tasks 4-6)
4. **Fix Ninja** - Implement dash attack
5. **Fix Bomb Thrower** - Add arc trajectory
6. **Fix Debuffer** - Add movement and debuff effect

### Phase 3: Boss & Visual Effects (Tasks 7-8)
7. **Boss Phases** - Implement 3-phase system for Level 3 boss
8. **Visual Feedback** - Hit markers, damage numbers, particles

### Phase 4: Progression (Tasks 9-10)
9. **Upgrade System** - 5 permanent upgrades (damage, health, reload, etc.)
10. **Save System** - Proper integration with GameContext

### Phase 5: Content & Balance (Tasks 11-12)
11. **Test Levels 4-6** - Playtest and fix issues
12. **Balance Pass** - Tune all weapons, enemies, difficulty

---

## Implementation File Map

### Files to Modify:
1. `src/systems/WeaponSystem.js` - Weapon mechanics
2. `src/data/weaponStats.js` - Weapon balance
3. `src/components/Game/UnifiedCombatSystem.jsx` - Combat logic
4. `src/systems/EnemyAISystem.js` - Enemy behaviors
5. `src/systems/BossAttackSystem.js` - Boss phases
6. `src/components/Game/VisualFeedbackSystem.jsx` - Effects
7. `src/systems/ProgressionSystem.js` - Upgrades
8. `src/components/UI/` - Various UI components
9. `src/data/levelRooms.js` - Level balance

### New Files to Create:
1. `src/components/UI/UpgradeMenu.jsx` - Upgrade purchase UI
2. `src/components/UI/DamageNumbers.jsx` - Floating damage text
3. `src/components/Game/Puzzles/SwitchSequence.jsx` - First puzzle
4. `src/data/upgradeDefinitions.js` - Upgrade configs

---

## Success Criteria

### Minimum Viable Complete Game:
- [ ] 6 levels fully playable (1-6)
- [ ] All weapons working as designed
- [ ] All enemy AI functional
- [ ] 1 boss with phases
- [ ] 5 permanent upgrades
- [ ] Save/load working
- [ ] Visual feedback present
- [ ] 60 FPS on mid-range hardware
- [ ] Balanced and fun

### Time Estimate:
- Each major task: ~8-10 interactions
- 12 tasks total: ~100-120 interactions
- With testing: ~150 interactions
- Current tokens: ~96k
- Should be achievable!

---

## Let's Begin!

Starting with Task 1: Fix Shotgun Damage Falloff
