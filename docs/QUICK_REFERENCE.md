# Quick Reference - Error-to-Code Mapping

Fast debugging guide for common errors and issues. Find the exact file and line number to fix problems quickly without searching the entire codebase.

**Last Updated:** 2025-11-05
**Purpose:** Instant problem → solution mapping

---

## Table of Contents

1. [Enemy Issues](#enemy-issues)
2. [Weapon Issues](#weapon-issues)
3. [UI Issues](#ui-issues)
4. [Level Loading Issues](#level-loading-issues)
5. [Puzzle Issues](#puzzle-issues)
6. [Item/Pickup Issues](#item-pickup-issues)
7. [Combat/Shooting Issues](#combatshooting-issues)
8. [Camera/Movement Issues](#cameramovement-issues)
9. [Performance Issues](#performance-issues)
10. [Audio Issues](#audio-issues)
11. [Common Error Messages](#common-error-messages)

---

## Enemy Issues

### ❌ "Enemies not spawning"

**Check these files in order:**

1. **UnifiedRoomManager.jsx** (src/components/Game/)
   - Line ~50-100: `loadRoom()` method
   - Line ~150-200: Enemy creation logic
   - Console log: `enemyLayout` array

2. **levelRooms.js** (src/data/)
   - Line 14-16: Level 1, Room 1 enemy layout
   - Verify `enemyLayout` array exists for your level
   - Check `position: { x, y, z }` values

3. **LevelManager.jsx** (src/components/Game/)
   - Line ~80-120: `loadRoom()` call to UnifiedRoomManager

**Quick Test:**
```javascript
// Add to UnifiedRoomManager.jsx line ~50
console.log('Loading enemies:', roomConfig.enemyLayout);
```

**Common Causes:**
- Level number doesn't exist in levelRooms.js
- enemyLayout array is empty
- Position values are `undefined`

---

### ❌ "Enemies spawn but don't appear on screen"

**Check:**

1. **Enemy Position Values** (src/data/levelRooms.js)
   - Verify Z is negative (e.g., `z: -10`, not `z: 10`)
   - Verify Y is reasonable (0 to 5)
   - Verify X is within -10 to +10

2. **Camera Position** (UnifiedMovementController.jsx)
   - Check camera isn't too far from enemies
   - Console log: `camera.position`

3. **Enemy Mesh Creation** (UnifiedRoomManager.jsx)
   - Line ~150: Verify `scene.add(enemyGroup)` is called
   - Check enemy mesh has visible geometry

**Quick Fix:**
```javascript
// Verify enemy position in UnifiedRoomManager.jsx
console.log('Enemy created at:', enemyGroup.position);
```

---

### ❌ "Enemies spawn at wrong position"

**File:** `src/data/levelRooms.js`

**Find Your Level:**
- Level 1: Lines 5-34
- Level 2: Lines 36-66
- Level 3: Lines 67-97
- Level 4: Lines 98-126
- Levels 5-12: Lines 127-384

**Fix Position:**
```javascript
// Example: Level 1, Room 1, First Enemy (line 14)
{ type: 'basic', position: { x: -2, y: 0, z: -10 }, health: 50, shootInterval: 4500 }
//                           ^^^^^^^^ Change these ^^^^^^^^
```

**Spacing Guide:** See POSITIONING_GUIDE.md for proper distances

---

### ❌ "Enemies not shooting"

**Check:**

1. **EnemyAISystem.js** (src/systems/)
   - Line ~50-100: `update()` method
   - Verify `shootInterval` logic

2. **Enemy Data** (src/data/levelRooms.js)
   - Check `shootInterval` property exists (e.g., `shootInterval: 4500`)
   - Value in milliseconds (4500 = 4.5 seconds)

3. **ProjectileSystemBridge.jsx** (src/components/Game/)
   - Verify projectiles are being rendered

**Quick Test:**
```javascript
// Add to EnemyAISystem.js
console.log('Enemy shooting at interval:', enemy.shootInterval);
```

---

### ❌ "Enemies not taking damage"

**Check:**

1. **UnifiedCombatSystem.jsx** (src/components/Game/)
   - Line ~80-120: Raycasting logic
   - Line ~130-150: `takeDamage()` call

2. **UnifiedRoomManager.jsx**
   - Verify enemies have `takeDamage()` method
   - Check `health` property is set

3. **WeaponSystem.js** (src/systems/)
   - Verify weapon damage values
   - Check `weaponStats.js` for weapon config

**Quick Test:**
```javascript
// Add to UnifiedCombatSystem.jsx after hit detection
console.log('Hit enemy:', hitEnemy.userData.id, 'damage:', damage);
```

---

### ❌ "Boss not appearing / Boss health bar not showing"

**Check:**

1. **levelRooms.js** (src/data/)
   - Level 3, Line 93: `isBoss: true` property
   - Level 6, 9, 12: Boss rooms

2. **BossHealthBar.jsx** (src/components/UI/)
   - Conditional rendering in HUD.jsx
   - Check `GameContext.currentBoss` state

3. **HUD.jsx** (src/components/UI/)
   - Line ~40-60: Boss health bar conditional
   - Verify `boss` prop is passed

**Fix:**
```javascript
// In HUD.jsx
{boss && boss.isBoss && (
  <BossHealthBar
    bossName={boss.name}
    current={boss.health}
    max={boss.maxHealth}
    phase={boss.currentPhase}
  />
)}
```

---

## Weapon Issues

### ❌ "Weapon not unlocking after pickup"

**Check in order:**

1. **WeaponPickup.jsx** (src/components/Game/)
   - Line ~30-50: `onCollect()` method
   - Verify `dispatch({ type: 'UNLOCK_WEAPON' })`

2. **GameContext.jsx** (src/contexts/)
   - Line ~100-150: UNLOCK_WEAPON reducer case
   - Check `player.unlockedWeapons` array

3. **levelRooms.js** (src/data/)
   - Line 32: Level 1 shotgun pickup
   - Line 63: Level 2 rapidfire pickup
   - Line 81: Level 3 grappling pickup
   - **⚠️ WARNING:** All at same position (-8, 6, -50) - OVERLAP BUG!

**Quick Fix - Weapon Pickup Overlap:**
```javascript
// Level 1, Room 2 (line 32) - KEEP
weaponPickups: [{ weaponType: 'shotgun', position: { x: -8, y: 6, z: -50 } }]

// Level 2, Room 2 (line 63) - CHANGE
weaponPickups: [{ weaponType: 'rapidfire', position: { x: 8, y: 5, z: -55 } }]

// Level 3, Room 1 (line 81) - CHANGE
weaponPickups: [{ weaponType: 'grappling', position: { x: 0, y: 7, z: -48 } }]
```

---

### ❌ "Can't switch weapons"

**Check:**

1. **WeaponController.jsx** (src/components/Game/)
   - Line ~20-40: Keyboard event listeners
   - Verify keys 1-9 are bound

2. **GameContext.jsx**
   - SWITCH_WEAPON reducer case
   - Check `player.currentWeapon` state

3. **Player State**
   - Verify weapon is in `player.unlockedWeapons` array
   - Check weapon isn't already selected

**Quick Test:**
```javascript
// Add to WeaponController.jsx
console.log('Weapon switch requested:', weaponKey);
console.log('Unlocked weapons:', player.unlockedWeapons);
```

---

### ❌ "Weapon not firing / No muzzle flash"

**Check:**

1. **UnifiedCombatSystem.jsx** (src/components/Game/)
   - Line ~50-70: Mouse click handler
   - Verify `handleShoot()` is called

2. **WeaponEffects.jsx** (src/components/Game/)
   - Line ~20-40: Muzzle flash creation
   - Check ParticleSystem integration

3. **weaponStats.js** (src/data/)
   - Verify weapon has `fireRate`, `damage`, `accuracy`
   - Check weapon isn't on cooldown

**Quick Test:**
```javascript
// Add to UnifiedCombatSystem.jsx handleShoot()
console.log('Firing weapon:', currentWeapon, 'ammo:', ammo.current);
```

---

### ❌ "Weapon damage too low/high"

**File:** `src/data/weaponStats.js`

**Find Weapon:**
```javascript
export const WeaponStats = {
  pistol: {
    damage: 25,           // ← Change this
    fireRate: 0.5,
    reloadTime: 1.5,
    // ...
  },
  shotgun: {
    damage: 15,           // ← Per pellet (8 pellets = 120 total)
    pelletCount: 8,
    // ...
  }
  // etc.
};
```

**Headshot Multiplier:** See `gameConfig.js` line ~45 (`headShotMultiplier: 2.0`)

---

### ❌ "Out of ammo but weapon should be infinite"

**Check:**

1. **weaponStats.js** (src/data/)
   - Line ~10: Pistol should have `ammo: Infinity`
   - Line ~90: Grappling should have `ammo: Infinity`

2. **WeaponController.jsx**
   - Verify ammo decrement logic skips infinite weapons

**Fix:**
```javascript
// In weaponStats.js
pistol: {
  damage: 25,
  ammo: Infinity,      // ← Ensure this
  reloadTime: 1.5,
  // ...
}
```

---

## UI Issues

### ❌ "HUD not showing / UI elements missing"

**Check:**

1. **HUD.jsx** (src/components/UI/)
   - Line ~1-20: Verify all imports
   - Line ~30-100: Check conditional rendering
   - Verify component is rendered in GameCanvas.jsx

2. **GameCanvas.jsx** (src/components/Game/)
   - Line ~150-200: `<HUD />` component
   - Check props being passed

3. **CSS Styling**
   - Check `src/styles/components.css`
   - Verify z-index values (UI should be >100)

**Quick Test:**
```javascript
// Add to HUD.jsx
console.log('HUD rendering with player:', player);
```

---

### ❌ "Health bar not updating"

**Check:**

1. **HealthBar.jsx** (src/components/UI/)
   - Line ~10-30: Verify `current` and `max` props
   - Check percentage calculation

2. **GameContext State**
   - Verify `player.health` is updating
   - Check PLAYER_DAMAGED action in reducer

3. **HUD.jsx**
   - Line ~50: Check props passed to HealthBar
   - `<HealthBar current={player.health} max={player.maxHealth} />`

**Quick Test:**
```javascript
// Add to HealthBar.jsx
console.log('Health:', current, '/', max, '=', (current/max)*100 + '%');
```

---

### ❌ "Score not incrementing"

**Check:**

1. **ScoreDisplay.jsx** (src/components/UI/)
   - Verify `score` prop is being passed

2. **UnifiedCombatSystem.jsx** (src/components/Game/)
   - Line ~150-180: Score calculation on enemy kill
   - Verify `dispatch({ type: 'UPDATE_SCORE' })`

3. **GameContext.jsx**
   - UPDATE_SCORE reducer case
   - Check `player.score` state

**Quick Test:**
```javascript
// Add to UnifiedCombatSystem.jsx after kill
console.log('Enemy killed, adding score:', scoreToAdd);
```

---

### ❌ "Ammo counter shows wrong values"

**Check:**

1. **AmmoCounter.jsx** (src/components/UI/)
   - Line ~10-20: Props `current`, `reserve`, `weaponType`

2. **WeaponController.jsx**
   - Ammo state management
   - Check `player.ammo[currentWeapon]`

3. **weaponStats.js**
   - Verify magazine size and reserve ammo values

**Quick Test:**
```javascript
// Add to AmmoCounter.jsx
console.log('Ammo display:', current, '/', reserve, 'for', weaponType);
```

---

### ❌ "Pause menu not appearing"

**Check:**

1. **PauseMenu.jsx** (src/components/UI/)
   - Verify component exists and is imported

2. **GameCanvas.jsx**
   - Line ~50-70: ESC key listener
   - Check `gameState === 'PAUSED'` conditional

3. **GameContext.jsx**
   - PAUSE_GAME action
   - Verify `gameState` changes to 'PAUSED'

**Quick Test:**
```javascript
// Add to GameCanvas.jsx ESC handler
console.log('ESC pressed, setting paused state');
```

---

### ❌ "Boss health bar showing when it shouldn't"

**Check:**

1. **HUD.jsx** (src/components/UI/)
   - Line ~40-60: Boss health bar conditional
   - Verify `boss` object is null when no boss

2. **UnifiedRoomManager.jsx**
   - Check boss enemy has `isBoss: true` property
   - Verify boss is removed from state on death

**Fix:**
```javascript
// In HUD.jsx - Ensure proper null check
{boss && boss.isBoss && boss.health > 0 && (
  <BossHealthBar {...bossProps} />
)}
```

---

## Level Loading Issues

### ❌ "Level not loading / Black screen"

**Check in order:**

1. **LevelManager.jsx** (src/components/Game/)
   - Line ~30-50: `loadLevel()` method
   - Console log current level number

2. **levelRooms.js** (src/data/)
   - Line ~387: Check fallback for invalid levels
   - Verify your level number exists (1-12 only)

3. **GameContext State**
   - Check `currentLevel` value
   - Verify `gameState === 'PLAYING'`

4. **GameCanvas.jsx**
   - Line ~80-100: LevelManager component rendering
   - Check Three.js scene/camera/renderer setup

**Quick Test:**
```javascript
// Add to LevelManager.jsx loadLevel()
console.log('Loading level:', levelNumber);
console.log('Level rooms:', getLevelRooms(levelNumber));
```

---

### ❌ "Wrong level loading / Stuck on Level 1"

**Check:**

1. **GameContext.jsx**
   - SET_LEVEL action
   - Verify `currentLevel` state updates

2. **LevelSelect.jsx** (src/components/UI/)
   - Line ~40-60: Level button click handlers
   - Check `dispatch({ type: 'SET_LEVEL', level: X })`

3. **Progression System**
   - Check `progression.unlockedLevels` array
   - Verify level is unlocked

**Quick Test:**
```javascript
// Add to LevelSelect.jsx button click
console.log('Loading level:', levelNumber);
dispatch({ type: 'SET_LEVEL', level: levelNumber });
```

---

### ❌ "Room transition not working"

**Check:**

1. **LevelManager.jsx**
   - Line ~120-150: `onRoomComplete()` method
   - Check `currentRoom++` logic

2. **UnifiedRoomManager.jsx**
   - Enemy clear condition
   - Verify all enemies defeated before transition

3. **RoomTransition.jsx** (src/components/Game/)
   - Transition animation/effect
   - Check if component is rendering

**Quick Test:**
```javascript
// Add to LevelManager.jsx onRoomComplete()
console.log('Room complete, transitioning to room:', currentRoom + 1);
```

---

### ❌ "Level complete but next level not unlocking"

**Check:**

1. **ProgressionSystem.js** (src/systems/)
   - Level unlock logic
   - Verify completion triggers unlock

2. **GameContext.jsx**
   - LEVEL_COMPLETE action
   - Check `progression.unlockedLevels` array

3. **MultiSlotSaveSystem.js** (src/systems/)
   - Save data persistence
   - Verify unlocked levels are saved

**Quick Test:**
```javascript
// Add to GameContext.jsx LEVEL_COMPLETE case
console.log('Level complete, unlocking next level');
console.log('Unlocked levels:', state.progression.unlockedLevels);
```

---

## Puzzle Issues

### ❌ "Puzzle not appearing"

**Check:**

1. **puzzleConfigs.js** (src/data/)
   - Line ~4-93: Verify your level has a puzzle config
   - Check `levelHasPuzzle(levelNumber)`

2. **InteractivePuzzle.jsx** (src/components/Game/)
   - Line ~20-40: Puzzle initialization
   - Console log puzzle config

3. **PuzzleManager.jsx**
   - Line ~30-50: Puzzle loading logic

**Levels with Puzzles:**
- Level 1: Room 1 (switch_sequence)
- Level 4: Room 0 (timed_targets)
- Level 5: Room 1 (color_match)
- Levels 6-12: Various

**Quick Test:**
```javascript
// Add to InteractivePuzzle.jsx
console.log('Puzzle config:', getPuzzleForLevel(currentLevel));
```

---

### ❌ "Puzzle targets not shootable"

**Check:**

1. **puzzleConfigs.js** (src/data/)
   - Line ~136-150: TargetPuzzleConfigs
   - Verify target positions are **POSITIVE Z** (e.g., `z: 5`)

2. **UnifiedCombatSystem.jsx**
   - Raycasting must include puzzle targets
   - Check `intersectObjects` includes puzzle meshes

3. **Puzzle Component** (src/components/Game/Puzzles/)
   - **⚠️ WARNING:** All 4 puzzle components are EMPTY frameworks
   - SwitchSequence.jsx, TerrainModifier.jsx, DoorMechanism.jsx, PathSelector.jsx
   - **Status:** Need implementation!

**Quick Fix:**
Puzzle components need full implementation. See COMPONENT_REFERENCE.md for details.

---

### ❌ "Puzzle timer not counting down"

**Check:**

1. **puzzleConfigs.js** (src/data/)
   - Verify `timeLimit` property (in milliseconds)
   - Example: `timeLimit: 45000` = 45 seconds

2. **PuzzleManager.jsx**
   - Timer logic
   - Check `useEffect` for countdown

3. **PuzzleDisplay.jsx** (src/components/UI/)
   - Timer UI rendering
   - Verify `timeRemaining` prop

**Quick Test:**
```javascript
// Add to PuzzleManager.jsx
console.log('Puzzle time remaining:', timeRemaining, 'ms');
```

---

## Item/Pickup Issues

### ❌ "Items not appearing"

**Check:**

1. **levelItems.js** (src/data/)
   - Line 3-687: Item configs for all levels
   - Verify `LevelItems.level1` exists

2. **Item Rendering** (WeaponPickup.jsx or item system)
   - Check item meshes are created
   - Verify `scene.add()` is called

3. **Position Values**
   - Items should have negative Z (e.g., `z: -25`)
   - Y should be 0.5 to 6

**Quick Test:**
```javascript
// Add to item rendering code
console.log('Spawning items for level:', LevelItems['level' + levelNumber]);
```

---

### ❌ "Items not collectible / Pickup not working"

**Check:**

1. **WeaponPickup.jsx** (src/components/Game/)
   - Line ~40-60: Collision detection
   - Check distance calculation to player

2. **Collection Radius**
   - Typical: 2-3 units from camera
   - Too small = hard to collect

3. **GameContext Dispatch**
   - Verify `COLLECT_ITEM` action
   - Check item is added to inventory

**Quick Fix:**
```javascript
// In WeaponPickup.jsx
const distanceToPlayer = itemPosition.distanceTo(camera.position);
if (distanceToPlayer < 3) { // Collection radius
  onCollect();
}
```

---

### ❌ "Key item collected but path not unlocking"

**Check:**

1. **levelItems.js** (src/data/)
   - Line 132-137: Level 3 glider key item
   - Verify `unlocks: ['aerial_path_level4']` property

2. **ProgressionSystem.js** (src/systems/)
   - Path unlocking logic
   - Check `unlockedPaths` array

3. **pathConfigs.js** (src/data/)
   - Verify path requirements
   - Check key item ID matches

**Quick Test:**
```javascript
// Add to key item collection
console.log('Key item collected:', item.subType, 'unlocks:', item.unlocks);
```

---

## Combat/Shooting Issues

### ❌ "Shooting not detecting hits"

**Check:**

1. **UnifiedCombatSystem.jsx** (src/components/Game/)
   - Line ~80-120: Raycasting logic
   - Check `raycaster.setFromCamera()`

2. **Mouse Position**
   - Verify mouse coordinates are normalized (-1 to 1)
   - Check `mouse.x`, `mouse.y` calculation

3. **Enemy Meshes**
   - Verify enemies are in scene
   - Check enemy meshes have correct layers

**Quick Test:**
```javascript
// Add to UnifiedCombatSystem.jsx handleShoot()
console.log('Raycaster intersects:', intersects.length);
console.log('Hit objects:', intersects.map(i => i.object.name));
```

---

### ❌ "Shots hitting but no damage dealt"

**Check:**

1. **Weapon Damage** (weaponStats.js)
   - Verify weapon has `damage` property
   - Check damage value isn't 0

2. **Enemy Health** (levelRooms.js)
   - Verify enemy has `health` property
   - Check health isn't set to Infinity

3. **takeDamage() Method** (UnifiedRoomManager.jsx)
   - Verify damage is applied to enemy.health
   - Check health doesn't reset immediately

**Quick Test:**
```javascript
// Add to enemy takeDamage() method
console.log('Enemy taking damage:', damage, 'health before:', this.health);
```

---

### ❌ "Headshots not working"

**Check:**

1. **Headshot Detection** (UnifiedCombatSystem.jsx)
   - Line ~130-140: Y-coordinate check
   - Typical: `intersect.point.y > enemyHeight * 0.8`

2. **Headshot Multiplier** (gameConfig.js)
   - Line ~45: `headShotMultiplier: 2.0`

3. **Enemy Height**
   - Check enemy mesh height
   - Verify headshot threshold is reasonable

**Quick Fix:**
```javascript
// In UnifiedCombatSystem.jsx
const isHeadshot = intersects[0].point.y > enemy.position.y + 1.5; // Top 1.5 units
const damage = weaponDamage * (isHeadshot ? 2.0 : 1.0);
```

---

### ❌ "Combo not increasing"

**Check:**

1. **ComboSystem** (UnifiedCombatSystem.jsx or separate system)
   - Verify combo counter increments on hit
   - Check combo timeout (typically 3 seconds)

2. **ComboDisplay.jsx** (src/components/UI/)
   - Check `combo` prop is passed
   - Verify UI is rendering

3. **GameContext State**
   - Check `comboCount`, `comboMultiplier` state

**Quick Test:**
```javascript
// Add to hit detection
console.log('Combo:', comboCount, 'Multiplier:', comboMultiplier);
```

---

## Camera/Movement Issues

### ❌ "Camera not moving"

**Check:**

1. **UnifiedMovementController.jsx** (src/components/Game/)
   - Line ~30-50: Movement update loop
   - Check `paused` state

2. **Camera Path** (roomConfigs.js)
   - Verify room has `cameraPath` defined
   - Check path isn't empty

3. **Game State**
   - Verify `gameState === 'PLAYING'`
   - Camera paused during menus

**Quick Test:**
```javascript
// Add to UnifiedMovementController.jsx update()
console.log('Camera progress:', progress, 'paused:', paused);
```

---

### ❌ "Camera moving too fast/slow"

**Check:**

1. **Movement Speed** (UnifiedMovementController.jsx)
   - Line ~20: `speed` property (units per second)
   - Typical: 0.1 to 0.5

2. **Time Delta**
   - Check `delta` is being calculated correctly
   - Verify `clock.getDelta()` in GameCanvas.jsx

**Quick Fix:**
```javascript
// In UnifiedMovementController.jsx
const speed = 0.2; // Adjust this value (lower = slower)
progress += speed * delta;
```

---

### ❌ "Camera looking wrong direction"

**Check:**

1. **Look Target** (UnifiedMovementController.jsx)
   - Line ~60: `camera.lookAt(lookTarget)`
   - Verify lookTarget is forward (negative Z)

2. **Camera Rotation**
   - Check camera rotation isn't being overridden
   - Verify no conflicting camera controls

**Quick Fix:**
```javascript
// In UnifiedMovementController.jsx
const lookTarget = new THREE.Vector3(0, 1, -10); // Look forward
camera.lookAt(lookTarget);
```

---

## Performance Issues

### ❌ "Low FPS / Stuttering"

**Check:**

1. **Performance Monitor**
   - Check browser dev tools (Shift+Ctrl+I → Performance tab)
   - Look for long frames (>16ms)

2. **Enemy Count** (gameConfig.js)
   - Line ~15: `maxEnemies: 50`
   - Reduce if FPS drops below 30

3. **Particle System**
   - Too many particles can tank FPS
   - Check ParticleSystem.js settings

4. **Post-Processing**
   - Disable effects in Settings → Graphics
   - Turn off dynamic lighting

**Quick Fixes:**
```javascript
// In gameConfig.js
performance: {
  targetFPS: 60,
  maxEnemies: 30,        // Reduce from 50
  maxParticles: 100,     // Reduce from 200
  particleDensity: 0.5   // Reduce from 1.0
}
```

---

### ❌ "Memory leak / FPS decreases over time"

**Check:**

1. **Enemy Cleanup** (UnifiedRoomManager.jsx)
   - Verify enemies are removed from scene on death
   - Check `scene.remove(enemyMesh)`
   - Dispose of geometries and materials

2. **Particle Cleanup** (ParticleSystem.js)
   - Remove expired particles
   - Dispose of old particle systems

3. **Event Listeners**
   - Remove listeners in `componentWillUnmount`
   - Check for memory leaks in listeners

**Quick Fix:**
```javascript
// In UnifiedRoomManager.jsx handleEnemyDeath()
scene.remove(enemyMesh);
enemyMesh.geometry.dispose();
enemyMesh.material.dispose();
```

---

## Audio Issues

### ❌ "No sound playing"

**STATUS:** Audio is **INTENTIONALLY DISABLED** per CLAUDE.md specification

**Files:**
- `src/utils/audioUtils.js` - Placeholder functions
- `src/hooks/useAudio.js` - No-op functions
- `src/components/Game/SoundManager.jsx` - Logs only

**Expected Behavior:** All audio calls log to console but don't play sound

**To Re-Enable Audio:**
1. Implement Web Audio API in audioUtils.js
2. Load audio files
3. Update SoundManager.jsx
4. Update useAudio.js hook
5. Remove placeholder functions

**Quick Check:**
```javascript
// Audio should log, not play
import { playSound } from '../utils/audioUtils.js';
playSound('shoot'); // Logs: [Audio Disabled] Would play: shoot
```

---

## Common Error Messages

### `Cannot read property 'position' of undefined`

**Likely Cause:** Enemy or item object not created properly

**Check:**
- UnifiedRoomManager.jsx enemy creation
- levelRooms.js enemy data
- Item rendering code

**Quick Fix:**
```javascript
// Add null check
if (enemy && enemy.position) {
  // Use enemy.position
}
```

---

### `Uncaught TypeError: getLevelRooms is not a function`

**Likely Cause:** Import issue with levelRooms.js

**Check:**
- Import statement: `import { getLevelRooms } from '../data/levelRooms.js';`
- File path is correct
- Function is exported

**Quick Fix:**
```javascript
// In levelRooms.js - Ensure export
export function getLevelRooms(levelNumber) { ... }
export default getLevelRooms; // Add default export too
```

---

### `THREE.WebGLRenderer: Context Lost`

**Likely Cause:** Too many Three.js objects or GPU crash

**Check:**
- Dispose of old meshes/materials/geometries
- Reduce maxEnemies in gameConfig.js
- Check for infinite loops creating objects

**Quick Fix:**
- Refresh browser
- Reduce graphics quality in Settings
- Check console for error before context loss

---

### `Maximum update depth exceeded`

**Likely Cause:** Infinite re-render loop in React

**Check:**
- `useEffect` dependencies
- State updates causing re-renders
- Props changing on every render

**Quick Fix:**
```javascript
// Add dependency array to useEffect
useEffect(() => {
  // Your code
}, []); // Empty array = run once
```

---

### `Failed to compile: Module not found`

**Likely Cause:** Missing import or wrong file path

**Check:**
- File path is correct (case-sensitive)
- File extension is included (.jsx, .js)
- Relative path starts with ./ or ../

**Quick Fix:**
```javascript
// Correct import
import { Component } from './components/Component.jsx'; // ✅

// Wrong imports
import { Component } from 'components/Component.jsx';  // ❌
import { Component } from './components/Component';    // ❌ (missing .jsx)
```

---

### `ReferenceError: dispatch is not defined`

**Likely Cause:** GameContext not available in component

**Check:**
- Component wrapped in GameContext.Provider (in App.jsx)
- useContext hook is used
- Import: `import { useContext } from 'react';`

**Quick Fix:**
```javascript
// In component
import { useContext } from 'react';
import { GameContext } from '../contexts/GameContext.jsx';

function MyComponent() {
  const { state, dispatch } = useContext(GameContext);
  // Now dispatch is available
}
```

---

## Quick Diagnostic Checklist

Use this when something breaks and you don't know where to start:

### 1. Check Browser Console (F12)
- [ ] Read error message
- [ ] Note file path and line number
- [ ] Check for warnings

### 2. Verify Game State
```javascript
// Add to GameCanvas.jsx
console.log('Game State:', {
  level: currentLevel,
  room: currentRoom,
  enemies: enemies.length,
  player: player.health,
  gameState: gameState
});
```

### 3. Check Component Rendering
- [ ] Component appears in React DevTools
- [ ] Props are being passed correctly
- [ ] No conditional hiding component

### 4. Verify Data Files
- [ ] Level exists in levelRooms.js
- [ ] Items exist in levelItems.js
- [ ] Config values are valid (not undefined)

### 5. Check Three.js Scene
```javascript
// Add to GameCanvas.jsx
console.log('Scene children:', scene.children.length);
console.log('Camera position:', camera.position);
```

---

## File Quick Finder

**"I need to change enemy spawn positions"**
→ `src/data/levelRooms.js`

**"I need to fix weapon damage"**
→ `src/data/weaponStats.js`

**"I need to adjust UI layout"**
→ `src/components/UI/HUD.jsx` + `src/styles/components.css`

**"I need to fix shooting mechanics"**
→ `src/components/Game/UnifiedCombatSystem.jsx`

**"I need to change camera movement"**
→ `src/components/Game/UnifiedMovementController.jsx`

**"I need to add new game state"**
→ `src/contexts/GameContext.jsx`

**"I need to fix level loading"**
→ `src/components/Game/LevelManager.jsx`

**"I need to change game rules"**
→ `src/data/gameConfig.js`

**"I need to fix puzzle system"**
→ `src/components/Game/InteractivePuzzle.jsx` + `src/data/puzzleConfigs.js`

**"I need to understand component relationships"**
→ `docs/COMPONENT_REFERENCE.md`

**"I need to check 3D positions"**
→ `docs/POSITIONING_GUIDE.md`

**"I need to understand data flow"**
→ `docs/DATA_STRUCTURE_MAP.md` (to be created)

---

## Emergency Debugging Code Snippets

### Add to GameCanvas.jsx for full state dump:
```javascript
useEffect(() => {
  const debugState = () => {
    console.log('=== GAME STATE DEBUG ===');
    console.log('Game State:', gameState);
    console.log('Current Level:', currentLevel);
    console.log('Current Room:', currentRoom);
    console.log('Player:', player);
    console.log('Enemies:', enemies.length);
    console.log('Camera:', camera.position);
    console.log('Scene Children:', scene.children.length);
  };

  window.debugGame = debugState; // Call window.debugGame() in console
}, [gameState, currentLevel, player, enemies, camera, scene]);
```

### Add to UnifiedCombatSystem.jsx for hit detection debug:
```javascript
const handleShoot = (event) => {
  console.log('=== SHOOT DEBUG ===');
  console.log('Mouse:', mouse);
  console.log('Raycaster:', raycaster);
  console.log('Intersects:', intersects.length);
  if (intersects.length > 0) {
    console.log('Hit:', intersects[0].object.name, intersects[0].point);
  }
};
```

### Add to UnifiedRoomManager.jsx for enemy debug:
```javascript
const loadRoom = (roomConfig) => {
  console.log('=== LOAD ROOM DEBUG ===');
  console.log('Room Config:', roomConfig);
  console.log('Enemy Layout:', roomConfig.enemyLayout);
  roomConfig.enemyLayout.forEach((enemy, i) => {
    console.log(`Enemy ${i}:`, enemy.type, 'at', enemy.position);
  });
};
```

---

**End of Quick Reference Guide**

**See Also:**
- COMPONENT_REFERENCE.md - Component locations and details
- POSITIONING_GUIDE.md - 3D coordinate reference
- DATA_STRUCTURE_MAP.md - Config file relationships
- ARCHITECTURE_DECISIONS.md - Design choices explained
