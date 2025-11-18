# Critical Issues to Fix
**Based on user feedback - 2025-11-18**

## Issues Identified:

### 1. ✅ FIXED: Enemies shooting from crotch area
**Problem:** Projectiles spawn from enemy center/groin instead of weapon/shoulder
**Status:** FIXED - Changed weaponHeight to 1.3 (shoulder level)
**File:** `src/systems/EnemyProjectileSystem.js:87`

### 2. ⚠️ IN PROGRESS: Shop doesn't pause game
**Problem:**
- Can't access shop from level results
- When in shop, enemies still spawn and can kill player
- Auto-advance doesn't pause for shop

**Solution:**
- Add "Weapon Shop" button to LevelResultsScreen ✅ DONE
- Pause auto-advance timer when shop is open ✅ DONE
- Need to wire up shop to App.jsx/GameContext ⚠️ TODO

**Files Modified:**
- `src/components/UI/LevelResultsScreen.jsx` - Added shop button and pause logic

**Still Need:**
- Connect shop to App.jsx
- Test that shop actually pauses enemies

### 3. ❌ TODO: Polish features don't actually work
**Problem:** Created systems but they're not triggering in-game

**Screen Shake Issues:**
- System created but not actually shaking camera
- Need to verify camera reference is correct
- Need to test shake triggers

**Particle Effects Issues:**
- System created but particles not appearing
- Scene reference may be wrong
- Need to verify integration with combat system

**Status:** Need to test in actual game and debug

### 4. ❌ TODO: Enemies look terrible
**Problem:** Basic box models, not visually appealing

**Current:**
- Simple boxes/cylinders
- Basic colors
- No detail

**Need:**
- Better proportions
- More detailed meshes
- Visual variety between types
- Maybe add simple texture/patterns

### 5. ❌ TODO: Enemies just stand there
**Problem:** No movement, just static shooting

**Need:**
- Strafing/dodging behavior
- Movement patterns
- React to player position
- Make combat more dynamic

### 6. ❌ TODO: No actual sound
**Problem:** Sound system created but no audio files

**Status:** System is ready, just need free sound files
**Next:** Find and integrate open-source sounds

---

## Priority Order:

1. **[IN PROGRESS]** Fix shop pause/access
2. **[CRITICAL]** Test and fix polish features (shake/particles)
3. **[HIGH]** Improve enemy visuals
4. **[MEDIUM]** Add enemy movement
5. **[LOW]** Add sound files

---

## Current Status:

**Working:**
- ✅ Enemy projectiles now shoot from shoulder
- ✅ Shop button added to level results
- ✅ Timer pauses when shop is opened

**Not Working:**
- ❌ Shop not connected to game state
- ❌ Screen shake not visible
- ❌ Particles not visible
- ❌ Enemies look bad
- ❌ Enemies don't move
- ❌ No sound

**Game Completion:** ~70% (not 99% as previously claimed)

Need to actually test these features in-game and fix them properly.
