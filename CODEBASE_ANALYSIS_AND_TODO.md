# Codebase Analysis & Improvement Todo List
**Generated:** 2025-11-18
**Project:** The PAT Project - On-Rails Shooter
**Current State:** 35% Complete, Levels 1-3 Playable

---

## Executive Summary

This analysis reviewed the entire codebase with focus on MD documentation files for rapid understanding, then examined actual code for issues. **Key findings: The game has solid architecture and documentation, but suffers from UI overlap issues, inconsistent state management patterns, and incomplete features.**

### Critical Issues Found
1. **Overlapping UI Components** - Multiple absolutely positioned elements conflict
2. **Mixed State Management** - Global window objects mixed with React Context
3. **115+ console.log statements** - Debug code left in production files
4. **Incomplete Features** - Only 3/12 levels tested, puzzles are frameworks only
5. **Sloppy Build Practices** - Unused dependencies, no code splitting, no optimization

---

## 🔴 CRITICAL: Overlapping UI Components

### The Problem
Multiple UI components use `absolute` positioning without proper z-index management or responsive design, causing overlaps especially on smaller screens.

### Components with Positioning Issues:

| Component | Position | Z-Index | Potential Conflicts |
|-----------|----------|---------|---------------------|
| **ComboDisplay** | `top-24 right-4` | `z-50` | ScoreDisplay milestone popup |
| **ScoreDisplay** | `top-4 right-4` | (from HUD) | ComboDisplay when combo active |
| **AmmoCounter** | `bottom-4 right-4` | `z-50` | Progress bar, crosshair |
| **PuzzleDisplay** | `bottom-24 left-4` | `z-50` | AmmoCounter on narrow screens |
| **HitMarker** | Center screen | (via HUD) | Crosshair, notifications |
| **BossHealthBar** | Top center | (via HUD) | ScoreDisplay, HealthBar |
| **NotificationDisplay** | `top-1/2 left-1/2` | (via HUD) | All centered elements |

### Specific Code Issues:

**ComboDisplay.jsx:72**
```jsx
<div className="absolute top-24 right-4 text-right z-50">
```
- Too close to ScoreDisplay (`top-4`)
- Milestone popup at `top-12 right-4` conflicts with ScoreDisplay

**AmmoCounter.jsx:58**
```jsx
<div className="absolute bottom-4 right-4 z-50 select-none">
```
- Large UI element (200px+) overlaps crosshair center
- No responsive adjustments for mobile

**PuzzleDisplay.jsx:83**
```jsx
<div className="absolute bottom-24 left-4 z-50">
```
- At 280px wide, overlaps AmmoCounter on screens < 768px
- Timer and progress bars add vertical height

**HUD.jsx:72** (Crosshair)
```jsx
<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
```
- Notifications also use center positioning, causing overlap

### Recommended Fixes:

#### 1. Create UI Layout System
```jsx
// src/components/UI/UILayout.jsx
const UI_ZONES = {
  TOP_LEFT: 'top-4 left-4',
  TOP_CENTER: 'top-4 left-1/2 -translate-x-1/2',
  TOP_RIGHT: 'top-4 right-4',

  MIDDLE_LEFT: 'top-1/2 left-4 -translate-y-1/2',
  CENTER: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  MIDDLE_RIGHT: 'top-1/2 right-4 -translate-y-1/2',

  BOTTOM_LEFT: 'bottom-4 left-4',
  BOTTOM_CENTER: 'bottom-4 left-1/2 -translate-x-1/2',
  BOTTOM_RIGHT: 'bottom-4 right-4',

  // Special zones
  RIGHT_STACK: 'top-24 right-4 flex flex-col gap-2', // For ScoreDisplay + ComboDisplay
};

const Z_LAYERS = {
  BACKGROUND: 'z-0',
  GAME: 'z-10',
  HUD: 'z-20',
  NOTIFICATIONS: 'z-30',
  MODALS: 'z-40',
  TOOLTIPS: 'z-50'
};
```

#### 2. Fix Specific Components

**Fix ComboDisplay:**
```jsx
// Move to RIGHT_STACK zone with proper spacing
<div className="absolute top-32 right-4 z-20"> {/* Moved down from top-24 */}
```

**Fix AmmoCounter:**
```jsx
// Add responsive positioning
<div className="absolute bottom-4 right-4 md:bottom-4 md:right-4 sm:bottom-2 sm:right-2 z-20">
```

**Fix PuzzleDisplay:**
```jsx
// Use left-center zone instead of bottom-left
<div className="absolute top-1/2 left-4 -translate-y-1/2 z-20">
```

**Fix Notifications:**
```jsx
// Stack notifications instead of centering all
<div className="absolute top-20 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-30">
```

#### 3. Add Responsive Breakpoints
```jsx
// src/hooks/useResponsiveUI.js
export function useResponsiveUI() {
  const [layout, setLayout] = useState('desktop');

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      if (width < 640) setLayout('mobile');
      else if (width < 1024) setLayout('tablet');
      else setLayout('desktop');
    };

    window.addEventListener('resize', updateLayout);
    updateLayout();

    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  return layout;
}
```

---

## 🟠 HIGH PRIORITY: State Management Issues

### The Problem
Inconsistent state management mixing window globals, React Context, and event emitters.

### Examples of Bad Patterns:

**AmmoCounter.jsx:21** - Window Global
```jsx
if (window.weaponSystem && window.weaponSystem.getWeaponInfo) {
  const info = window.weaponSystem.getWeaponInfo();
  setWeaponInfo(info);
}
```
❌ **Issue:** Bypasses React state management, causes race conditions

**ComboDisplay.jsx:18** - Polling Instead of State
```jsx
const interval = setInterval(handleComboUpdate, 100);
```
❌ **Issue:** Checks every 100ms instead of reactive updates

**GameCanvas.jsx:62** - Window Event Listeners
```jsx
engineRef.current.on('positionUpdate', (data) => {
  updatePlayerPosition(data.position);
});
```
✅ **Better:** But should use Context subscriptions, not custom event emitter

### Recommended Fixes:

#### 1. Create Unified Game State Context
```jsx
// src/contexts/UnifiedGameContext.jsx
const GameStateContext = createContext();

export function GameStateProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Expose subscriptions instead of window globals
  const weaponSystem = useMemo(() => new WeaponSystem(dispatch), []);
  const comboSystem = useMemo(() => new ComboSystem(dispatch), []);

  return (
    <GameStateContext.Provider value={{ state, weaponSystem, comboSystem }}>
      {children}
    </GameStateContext.Provider>
  );
}
```

#### 2. Replace Window Globals
```diff
- if (window.weaponSystem && window.weaponSystem.getWeaponInfo) {
-   const info = window.weaponSystem.getWeaponInfo();
+ const { weaponSystem } = useGameState();
+ const weaponInfo = weaponSystem.getWeaponInfo();
```

#### 3. Remove Polling, Use Reactive State
```diff
- const interval = setInterval(handleComboUpdate, 100);
+ const { comboSystem } = useGameState();
+ const comboState = comboSystem.useComboState(); // Hook that subscribes to changes
```

---

## 🟡 MEDIUM PRIORITY: Sloppy Build Practices

### 1. Console Log Pollution

**Found:** 115+ `console.log/warn/error` statements across 20 files

**Files with most console statements:**
- `src/systems/PathSystem.js` - 10 statements
- `src/systems/CollectibleSystem.js` - 8 statements
- `src/systems/DestructibleSystem.js` - 7 statements
- `src/data/levelSpawns.js` - 6 statements

**Recommended Fix:**
```bash
# Create utility logger
// src/utils/logger.js
export const logger = {
  log: (...args) => import.meta.env.DEV && console.log(...args),
  warn: (...args) => import.meta.env.DEV && console.warn(...args),
  error: (...args) => console.error(...args), // Always log errors
};

# Replace all console.* with logger.*
# Production builds will strip out DEV logs
```

### 2. Unused Dependencies

**package.json:18**
```json
"tone": "^14.7.77"
```
❌ **Issue:** Audio system completely disabled, but Tone.js (large library) still included

**Recommended:** Remove until audio system implemented
```bash
npm uninstall tone
```

### 3. No Code Splitting

**Issue:** All 66 components and 37 systems load on initial page load

**Recommended Fix:**
```jsx
// Lazy load heavy components
const GameCanvas = lazy(() => import('./components/Game/GameCanvas'));
const LevelManager = lazy(() => import('./components/Game/LevelManager'));

// Split by route
<Suspense fallback={<LoadingScreen />}>
  {gameState === 'PLAYING' && <GameCanvas />}
  {gameState === 'MENU' && <MainMenu />}
</Suspense>
```

### 4. Mixed Export Styles

**Issue:** Some files use `export default`, others use named exports, causing confusion

**Example - ComboDisplay.jsx:**
```jsx
export function ComboDisplay() { } // Named export (line 7)
export default ComboDisplay;        // Default export (line 165)
```

**Recommended:** Pick one style and enforce it
- Use **named exports** for utilities/systems
- Use **default exports** for React components

### 5. No Production Build Optimization

**vite.config.js** missing optimization settings

**Recommended:**
```js
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs
      }
    }
  }
});
```

---

## 🟢 GAMEPLAY IMPROVEMENTS

### From GAME_IMPROVEMENT_PLAN.md Analysis

#### 1. Auto-Progression System ⭐⭐⭐⭐⭐
**Current State:** Kicks to menu after each level
**Impact:** Game feels like 12 mini-games, not one cohesive experience

**Implementation:**
```jsx
// src/components/Game/LevelManager.jsx
const handleLevelComplete = () => {
  // Show results for 5 seconds
  dispatch({ type: 'SHOW_LEVEL_RESULTS' });

  setTimeout(() => {
    // Auto-advance to next level
    const nextLevel = currentLevel + 1;
    if (nextLevel <= 12) {
      dispatch({ type: 'START_LEVEL', level: nextLevel });
    } else {
      dispatch({ type: 'GAME_COMPLETE' });
    }
  }, 5000);
};
```

**Files to Modify:**
- `src/components/Game/LevelManager.jsx`
- `src/contexts/GameContext.jsx` (add SHOW_LEVEL_RESULTS action)
- `src/components/UI/LevelResultsScreen.jsx` (create new)

#### 2. Staggered Enemy Spawns ⭐⭐⭐⭐⭐
**Current State:** All enemies spawn instantly, combat is chaotic
**Impact:** No time to aim, feels frantic not tactical

**Implementation:**
```jsx
// src/components/Game/UnifiedRoomManager.jsx
const loadRoom = (roomConfig) => {
  const enemies = roomConfig.enemyLayout;

  // Group enemies into waves
  const waves = [
    enemies.slice(0, 2),  // Wave 1: First 2 enemies
    enemies.slice(2, 4),  // Wave 2: Next 2 enemies
    enemies.slice(4),     // Wave 3: Remaining
  ];

  // Spawn with delays
  waves.forEach((wave, index) => {
    setTimeout(() => {
      // Show 0.5s warning
      showSpawnWarning(wave);

      setTimeout(() => {
        spawnEnemies(wave);
      }, 500);
    }, index * 5000); // 5 second gaps
  });
};
```

**Files to Modify:**
- `src/components/Game/UnifiedRoomManager.jsx:50` (loadRoom method)
- `src/systems/EnemyAISystem.js` (add spawn delay logic)

#### 3. Fix Enemy Projectile Bug ⭐⭐⭐⭐
**Current State:** Projectiles not reaching player (Z-axis issue)
**Impact:** Enemies can't damage player, game is broken

**Root Cause Analysis:**
```jsx
// src/systems/EnemyProjectileSystem.js
// Current: Projectile spawns at enemy center
const projectile = {
  position: enemy.position.clone() // ❌ Spawns at enemy body center
};

// Should: Spawn from muzzle/weapon position
const muzzleOffset = new THREE.Vector3(0, 0.5, 0.8); // Forward and up
const projectile = {
  position: enemy.position.clone().add(muzzleOffset) // ✅ Spawns from weapon
};
```

**Additional Fixes:**
- Increase projectile speed if still not reaching
- Add projectile trail for visibility
- Ensure Z-axis direction is correct (+Z toward player)

**Files to Modify:**
- `src/systems/EnemyProjectileSystem.js:59` (createProjectile)
- `src/systems/EnemyAISystem.js` (enemy shoot method)

#### 4. Boss Introduction Sequences ⭐⭐⭐
**Current State:** Bosses appear like regular enemies
**Impact:** No dramatic moment, bosses feel unimportant

**Implementation:**
```jsx
// src/components/Game/BossIntroSequence.jsx
export function BossIntroSequence({ bossData, onComplete }) {
  useEffect(() => {
    const sequence = async () => {
      // 1. Darken room
      dispatch({ type: 'SET_AMBIENT_LIGHT', intensity: 0.2 });
      await delay(500);

      // 2. Boss drops from ceiling / breaks wall
      playAnimation('boss_entrance');
      await delay(1500);

      // 3. Boss dramatic pose
      playAnimation('boss_taunt');
      await delay(2000);

      // 4. Show health bar with name
      dispatch({ type: 'SHOW_BOSS_UI', bossData });
      await delay(1000);

      // 5. Restore light, begin combat
      dispatch({ type: 'SET_AMBIENT_LIGHT', intensity: 1.0 });
      onComplete();
    };

    sequence();
  }, []);

  return <BossNameReveal name={bossData.name} />;
}
```

**Files to Create:**
- `src/components/Game/BossIntroSequence.jsx`
- `src/components/UI/BossNameReveal.jsx`

**Files to Modify:**
- `src/components/Game/UnifiedRoomManager.jsx` (detect boss spawn)

#### 5. Basic Puzzle System ⭐⭐⭐⭐
**Current State:** Puzzle components are empty frameworks
**Impact:** Game is 100% shooting, gets repetitive

**Implementation Priority: Target Sequence Puzzle**
```jsx
// src/components/Game/Puzzles/SwitchSequence.jsx
export function SwitchSequence({ config, onComplete }) {
  const [sequence] = useState(config.sequence || [1, 3, 2, 4]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [switches, setSwitches] = useState([]);

  // Create 4 switches in scene
  useEffect(() => {
    const switchMeshes = sequence.map((_, i) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x00ff00 })
      );
      mesh.position.set(i * 2 - 3, 2, 5); // Positive Z (in front of camera)
      mesh.userData = { id: i + 1, active: i === 0 }; // First switch glows
      scene.add(mesh);
      return mesh;
    });
    setSwitches(switchMeshes);
  }, []);

  const handleSwitchShot = (switchId) => {
    const nextExpected = sequence[playerSequence.length];

    if (switchId === nextExpected) {
      // Correct!
      const newSequence = [...playerSequence, switchId];
      setPlayerSequence(newSequence);

      if (newSequence.length === sequence.length) {
        // Puzzle complete
        onComplete({ success: true, timeBonus: 1000 });
      } else {
        // Activate next switch
        switches.forEach(s => {
          s.userData.active = (s.userData.id === sequence[newSequence.length]);
        });
      }
    } else {
      // Wrong! Reset
      setPlayerSequence([]);
      playSound('puzzle_fail');
    }
  };

  return <PuzzleTargets switches={switches} onShot={handleSwitchShot} />;
}
```

**Files to Complete:**
- `src/components/Game/Puzzles/SwitchSequence.jsx`
- `src/data/puzzleConfigs.js` (add sequences for each level)

**Integration:**
- Add to Level 2, Room 2 (after combat)
- Reward: Weapon upgrade or extra lives

---

## 📊 Component Architecture Issues

### Problem: Too Many Files

**Current State:**
- 66 React components
- 37 game systems
- For a 35% complete project

**Duplicate/Overlapping Components:**
| Duplicate Set | Files | Issue |
|--------------|-------|-------|
| **HUD System** | `HUD.jsx`, `EnhancedHUD.jsx` | Two HUD implementations |
| **Combo Display** | `ComboDisplay.jsx`, `ComboIndicator.jsx` | Same functionality |
| **Damage Indicators** | `DamageIndicator.jsx`, `SoundVisualFeedback.jsx` | Overlap |

### Recommended Consolidation:

#### 1. Merge Duplicate Components
```bash
# Remove duplicates
rm src/components/UI/EnhancedHUD.jsx     # Keep HUD.jsx
rm src/components/UI/ComboIndicator.jsx  # Keep ComboDisplay.jsx
```

#### 2. Combine Related Systems
```jsx
// Instead of:
// - WeaponSystem.js
// - WeaponUpgradeSystem.js
// - WeaponController.jsx

// Create unified:
// src/systems/weapon/index.js
export { WeaponSystem } from './WeaponSystem';
export { WeaponUpgrades } from './WeaponUpgrades';
export { useWeaponController } from './useWeaponController';
```

---

## 🔧 Build & Development Improvements

### 1. Add ESLint Rules

**Create .eslintrc.json:**
```json
{
  "extends": ["react-app"],
  "rules": {
    "no-console": ["warn", { "allow": ["error"] }],
    "no-debugger": "error",
    "prefer-const": "warn",
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
  }
}
```

### 2. Add Pre-commit Hooks

**package.json:**
```json
{
  "scripts": {
    "lint:fix": "eslint . --ext js,jsx --fix",
    "pre-commit": "npm run lint:fix"
  }
}
```

### 3. Add TypeScript Support (Optional)

**Benefits:**
- Catch state management bugs at compile time
- Better IDE autocomplete
- Safer refactoring

**Migration Path:**
1. Install TypeScript: `npm install -D typescript @types/three`
2. Rename `.jsx` → `.tsx` incrementally
3. Start with type definitions: `src/types/game.ts`

---

## 📋 Complete Todo List

### Phase 1: Fix Critical Issues (Week 1)

#### UI Overlapping Fixes
- [ ] Create `UILayout.jsx` with zone definitions
- [ ] Move ComboDisplay to `top-32` (from `top-24`)
- [ ] Make AmmoCounter responsive with breakpoints
- [ ] Move PuzzleDisplay to middle-left zone
- [ ] Add z-index layer constants
- [ ] Test on mobile (320px), tablet (768px), desktop (1920px)

#### State Management Cleanup
- [ ] Create `UnifiedGameContext.jsx`
- [ ] Remove `window.weaponSystem` global
- [ ] Replace polling intervals with reactive hooks
- [ ] Migrate event listeners to Context subscriptions
- [ ] Test state updates are working

#### Enemy Projectile Bug
- [ ] Fix projectile spawn position (add muzzle offset)
- [ ] Adjust Z-axis direction (toward player)
- [ ] Increase projectile speed if needed
- [ ] Add projectile trail visual
- [ ] Test projectiles hit player consistently

### Phase 2: Gameplay Improvements (Week 2)

#### Auto-Progression
- [ ] Create `LevelResultsScreen.jsx`
- [ ] Add `SHOW_LEVEL_RESULTS` action to GameContext
- [ ] Implement 5-second auto-advance in LevelManager
- [ ] Add "Continue" button for manual advance
- [ ] Test full playthrough Levels 1-3

#### Staggered Enemy Spawns
- [ ] Implement wave spawning system
- [ ] Add spawn warning visual (flash/glow)
- [ ] Add 0.5s delay before spawn
- [ ] Configure wave groups in `levelRooms.js`
- [ ] Test pacing feels tactical not chaotic

#### Boss Introductions
- [ ] Create `BossIntroSequence.jsx`
- [ ] Create `BossNameReveal.jsx` UI
- [ ] Add boss entrance animations
- [ ] Darken room during intro
- [ ] Test boss fights feel dramatic

#### Basic Puzzles
- [ ] Complete `SwitchSequence.jsx`
- [ ] Add puzzle to Level 2, Room 2
- [ ] Create target meshes with glow effect
- [ ] Implement correct/wrong feedback
- [ ] Add puzzle rewards (points, upgrades)

### Phase 3: Code Quality (Week 3)

#### Remove Console Logs
- [ ] Create `logger.js` utility
- [ ] Replace `console.log` with `logger.log` (115 instances)
- [ ] Replace `console.warn` with `logger.warn`
- [ ] Keep `console.error` as `logger.error`
- [ ] Verify production build strips DEV logs

#### Build Optimization
- [ ] Remove Tone.js dependency
- [ ] Add code splitting for GameCanvas
- [ ] Add lazy loading for LevelManager
- [ ] Configure Vite minification
- [ ] Add `drop_console: true` to terser
- [ ] Test bundle size reduction

#### Component Cleanup
- [ ] Remove `EnhancedHUD.jsx` (use `HUD.jsx`)
- [ ] Remove `ComboIndicator.jsx` (use `ComboDisplay.jsx`)
- [ ] Consolidate weapon systems
- [ ] Standardize export style (default vs named)
- [ ] Update imports after cleanup

#### Error Handling
- [ ] Add ErrorBoundary to App root
- [ ] Add ErrorBoundary to GameCanvas
- [ ] Create fallback UI for errors
- [ ] Add error logging
- [ ] Test error recovery

### Phase 4: Content & Testing (Week 4)

#### Level Testing
- [ ] Playtest Level 4 (Jungle)
- [ ] Playtest Level 5 (Space Station)
- [ ] Playtest Level 6 (Haunted Mansion)
- [ ] Fix spawn/progression bugs found
- [ ] Balance enemy counts
- [ ] Adjust difficulty curve

#### Performance Testing
- [ ] Profile FPS on all levels
- [ ] Test on low-end hardware
- [ ] Verify 60 FPS target met
- [ ] Check memory usage over time
- [ ] Optimize bottlenecks found

#### Final Polish
- [ ] Add responsive UI for mobile
- [ ] Test on Chrome, Firefox, Safari
- [ ] Fix any remaining bugs
- [ ] Update documentation
- [ ] Prepare for demo/release

---

## 🎯 Quick Wins (Do First)

These have **high impact** with **low effort**:

1. **Remove console.logs** (30 min)
   - Create logger, find/replace all

2. **Fix ComboDisplay positioning** (15 min)
   - Change `top-24` to `top-32`

3. **Remove Tone.js** (5 min)
   - `npm uninstall tone`

4. **Fix projectile spawn** (1 hour)
   - Add muzzle offset vector

5. **Add boss intro delay** (30 min)
   - Add 2-second setTimeout before boss spawns

**Total: ~2-3 hours for 5 major improvements**

---

## 📈 Success Metrics

### UI/UX
- [ ] No overlapping UI elements on any screen size
- [ ] All UI components have proper z-index layering
- [ ] Responsive design works on mobile (320px+)

### Code Quality
- [ ] Zero console.log statements in production build
- [ ] All state managed through React Context (no window globals)
- [ ] Bundle size < 500KB gzipped
- [ ] Build time < 30 seconds

### Gameplay
- [ ] Auto-progression works Levels 1-12
- [ ] Enemy spawns feel tactical (3-5 second gaps)
- [ ] Enemy projectiles consistently hit player
- [ ] Boss fights feel epic with intro sequences
- [ ] At least 1 puzzle type fully implemented

### Performance
- [ ] 60 FPS on mid-range desktop
- [ ] 30 FPS on mobile
- [ ] < 5 second initial load
- [ ] No memory leaks after 30 min play

---

## 🔗 Key Files Reference

### UI Components to Fix:
- `src/components/UI/HUD.jsx` - Main HUD container
- `src/components/UI/ComboDisplay.jsx:72` - Positioning issue
- `src/components/UI/AmmoCounter.jsx:58` - Positioning issue
- `src/components/UI/PuzzleDisplay.jsx:83` - Positioning issue

### State Management to Refactor:
- `src/contexts/GameContext.jsx` - Main game state
- `src/components/Game/GameCanvas.jsx` - Uses window globals
- `src/components/UI/AmmoCounter.jsx:21` - window.weaponSystem

### Gameplay Systems to Enhance:
- `src/components/Game/LevelManager.jsx:80` - Add auto-progression
- `src/components/Game/UnifiedRoomManager.jsx:50` - Add wave spawns
- `src/systems/EnemyProjectileSystem.js:59` - Fix projectile spawn
- `src/components/Game/Puzzles/SwitchSequence.jsx` - Implement puzzle

### Build Configuration:
- `package.json` - Remove Tone.js, add scripts
- `vite.config.js` - Add optimization settings
- `.eslintrc.json` - Create linting rules

---

## 📚 Additional Resources

### Documentation Already Created (Excellent!)
- `docs/LLM_CONTEXT_MASTER.md` - Rapid project understanding ✅
- `docs/LLM_COMPONENT_INDEX.md` - Component locations ✅
- `docs/LLM_POSITION_DATABASE.md` - 3D positioning ✅
- `docs/ARCHITECTURE.md` - System overview ✅
- `docs/GAME_IMPROVEMENT_PLAN.md` - Feature roadmap ✅

### Recommended Reading Order for Implementation:
1. Start with `LLM_CONTEXT_MASTER.md` for overview
2. Check `LLM_COMPONENT_INDEX.md` for file locations
3. Reference `GAME_IMPROVEMENT_PLAN.md` for priorities
4. Use `LLM_POSITION_DATABASE.md` for 3D changes
5. Follow this document for implementation todos

---

## 💡 Final Recommendations

### Immediate Actions (Today):
1. Fix overlapping UI (ComboDisplay position)
2. Remove console.logs with logger utility
3. Fix enemy projectile spawn bug

### This Week:
4. Implement auto-progression
5. Add staggered enemy spawns
6. Create boss intro sequences
7. Complete one puzzle type

### Next Week:
8. Remove unused dependencies
9. Add code splitting
10. Consolidate duplicate components
11. Test Levels 4-6

### Long Term:
12. Full responsive UI system
13. Complete all 12 levels
14. Implement all puzzle types
15. Performance optimization pass

---

**This analysis provides a clear roadmap from current state (35% complete, buggy) to production-ready (100% complete, polished).** Focus on Quick Wins first, then tackle gameplay improvements, then code quality, then content expansion.

Good luck! 🎮🚀
