# Codebase Cleanup Execution Plan

## Instructions
Since automated bash/cmd execution isn't working, please run these commands manually or I can guide you through using Node.js/npm scripts.

---

## Phase 1: Delete Debug/Test Components ✅ ZERO RISK

```bash
# Navigate to project root
cd /path/to/the-pat-project

# Delete debug components
del src\components\Game\RenderingTest.jsx
del src\components\Game\EmergencyVisibilityTest.jsx
del src\components\Game\CameraDebugger.jsx
del src\components\Game\SceneGraphAnalyzer.jsx
del src\components\Game\MinimalGameMode.jsx
del src\components\Game\ForceEnemySpawner.jsx
```

**Files to Delete:**
- `src/components/Game/RenderingTest.jsx`
- `src/components/Game/EmergencyVisibilityTest.jsx`
- `src/components/Game/CameraDebugger.jsx`
- `src/components/Game/SceneGraphAnalyzer.jsx`
- `src/components/Game/MinimalGameMode.jsx`
- `src/components/Game/ForceEnemySpawner.jsx`

**Impact:** None - these are debug-only files

---

## Phase 2: Delete Unused Hooks ✅ LOW RISK

```bash
del src\hooks\useBalancedRoomTimer.js
del src\hooks\useRoomProgression.js
del src\hooks\useControls.js
```

**Files to Delete:**
- `src/hooks/useBalancedRoomTimer.js`
- `src/hooks/useRoomProgression.js`
- `src/hooks/useControls.js`

**Impact:** None - not imported anywhere

---

## Phase 3: Investigate Data Files 🔍 NEED TO CHECK

Before deleting, need to verify what's actually used:

**Check these files:**
1. `src/data/levelSpawns.js` - Is this used by LevelManager?
2. `src/data/roomConfigs.js` - Is this used by LevelManager?
3. `src/data/weaponStats.js` - Duplicate of gameConfig.js?

**Action:** Search for imports before deletion

---

## Phase 4: Delete Legacy Combat Systems ⚠️ MEDIUM RISK

```bash
del src\components\Game\EmergencyCombatSystem.jsx
del src\hooks\useCombatClicks.js
```

**Files to Delete:**
- `src/components/Game/EmergencyCombatSystem.jsx`
- `src/hooks/useCombatClicks.js`

**Testing Required:**
- ✅ Verify shooting enemies still works
- ✅ Verify damage calculation works
- ✅ Verify weapon switching works

---

## Phase 5: Delete Legacy Room/Spawn Systems ⚠️ MEDIUM RISK

```bash
del src\components\Game\RoomManager.jsx
del src\components\Game\RoomEnemySpawner.jsx
del src\systems\EnemySpawnSystem.js
del src\systems\RoomSystem.js
del src\components\Game\MovementController.jsx
del src\components\Game\MultiRoomManager.jsx
```

**Files to Delete:**
- `src/components/Game/RoomManager.jsx`
- `src/components/Game/RoomEnemySpawner.jsx`
- `src/systems/EnemySpawnSystem.js`
- `src/systems/RoomSystem.js`
- `src/components/Game/MovementController.jsx` (old one, NOT UnifiedMovementController)
- `src/components/Game/MultiRoomManager.jsx`

**Testing Required:**
- ✅ Verify enemy spawning works in rooms
- ✅ Verify room progression works
- ✅ Verify level completion works
- ✅ Verify multi-room progression works

---

## Phase 6: Delete Legacy UI Components ⚠️ LOW RISK

```bash
del src\components\UI\EnhancedContinuePrompt.jsx
del src\components\UI\EnemyCounter.jsx
del src\components\UI\RoomCompletionUI.jsx
del src\components\UI\RoomTimer.jsx
del src\components\UI\WeaponSelector.jsx
```

**Files to Delete:**
- `src/components/UI/EnhancedContinuePrompt.jsx`
- `src/components/UI/EnemyCounter.jsx`
- `src/components/UI/RoomCompletionUI.jsx`
- `src/components/UI/RoomTimer.jsx`
- `src/components/UI/WeaponSelector.jsx`

**Testing Required:**
- ✅ Verify UI displays correctly
- ✅ Verify weapon UI works (WeaponController should handle it)

---

## Phase 7: Delete Transitional Components ⚠️ LOW RISK

```bash
del src\components\Game\MovementTransition.jsx
del src\components\Game\LevelCompleteUI.jsx
del src\components\Game\GameErrorBoundary.jsx
```

**Files to Delete:**
- `src/components/Game/MovementTransition.jsx`
- `src/components/Game/LevelCompleteUI.jsx`
- `src/components/Game/GameErrorBoundary.jsx`

**Testing Required:**
- ✅ Verify error handling still works (ErrorBoundary.jsx should handle it)
- ✅ Verify level complete screen shows (App.jsx handles it)

---

## Phase 8: Clean Up GameCanvas.jsx Imports 🔨 AFTER DELETIONS

After all files are deleted, clean up GameCanvas.jsx:

**Remove these imports:**
```javascript
// DELETE these lines from GameCanvas.jsx
import { EnemySpawnSystem } from '../../systems/EnemySpawnSystem.js';
import { WeaponSystem } from '../../systems/WeaponSystem.js';  // CAREFUL - check if used
import { RoomSystem } from '../../systems/RoomSystem.js';
import { getLevelSpawns } from '../../data/levelSpawns.js';
import { getRoomConfig } from '../../data/roomConfigs.js';
import RoomManager from './RoomManager.jsx';
import RoomCompletionUI from '../UI/RoomCompletionUI.jsx';
import RoomTimer from '../UI/RoomTimer.jsx';
import { useCombatClicks } from '../../hooks/useCombatClicks.js';
import EmergencyCombatSystem from './EmergencyCombatSystem.jsx';
import MovementController from './MovementController.jsx';
import RoomEnemySpawner from './RoomEnemySpawner.jsx';
import EnhancedContinuePrompt from '../UI/EnhancedContinuePrompt.jsx';
import EnemyCounter from '../UI/EnemyCounter.jsx';
```

---

## Phase 9: Major Refactor of GameCanvas.jsx 🔨 MAJOR CHANGES

**Remove these state variables:**
```javascript
const [isRoomBased, setIsRoomBased] = useState(true);
const [useUnifiedSystem, setUseUnifiedSystem] = useState(true);
const [useMultiRoom, setUseMultiRoom] = useState(true);
```

**Delete all conditional blocks:**
- Delete lines 62-65 (useCombatClicks conditional)
- Delete lines 67-72 (handleRoomContinue - not used)
- Delete lines 74-79 (handleRoomComplete - not used)
- Delete lines 81-93 (handleEnemiesSpawned - not used)
- Delete lines 95-110 (movement lock check - not used)
- Delete lines 112-123 (handleRoomAdvancement - not used)
- Delete lines 136-166 (legacy weapon/spawn system initialization)
- Delete lines 167-188 (legacy room system setup)
- Delete lines 234-271 (legacy room system events)
- Delete lines 282-285 (legacy system updates in game loop)
- Delete lines 286-290 (legacy weapon system update)
- Delete lines 360-373 (legacy mouse click handler)
- Delete lines 375-417 (legacy handleShoot function)
- Delete lines 432-435 (legacy weapon switching)
- Delete lines 505-513 (legacy RoomManager render)
- Delete lines 515-524 (legacy combat/debug renders)
- Delete lines 581-587 (single-room system render - keep or delete based on preference)
- Delete lines 624-658 (legacy movement/spawning system renders)
- Delete lines 660-678 (legacy room timer/completion UI)

**This will reduce GameCanvas.jsx from ~700 lines to ~400 lines**

---

## Alternative: Use Node.js Script

Create `cleanup.js`:
```javascript
const fs = require('fs');
const path = require('path');

const filesToDelete = [
  // Phase 1
  'src/components/Game/RenderingTest.jsx',
  'src/components/Game/EmergencyVisibilityTest.jsx',
  'src/components/Game/CameraDebugger.jsx',
  'src/components/Game/SceneGraphAnalyzer.jsx',
  'src/components/Game/MinimalGameMode.jsx',
  'src/components/Game/ForceEnemySpawner.jsx',
  // Phase 2
  'src/hooks/useBalancedRoomTimer.js',
  'src/hooks/useRoomProgression.js',
  'src/hooks/useControls.js',
  // Add more phases...
];

filesToDelete.forEach(file => {
  const fullPath = path.join(__dirname, file);
  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`✅ Deleted: ${file}`);
    } else {
      console.log(`⚠️  Not found: ${file}`);
    }
  } catch (err) {
    console.error(`❌ Error deleting ${file}:`, err.message);
  }
});

console.log('\n✨ Cleanup complete!');
```

Run with: `node cleanup.js`

---

## Testing Checklist After Each Phase

### Phase 1-2 (Debug/Hooks)
- [ ] Project still builds (`npm run dev`)
- [ ] No import errors in console

### Phase 4 (Combat)
- [ ] Can shoot enemies
- [ ] Enemies take damage
- [ ] Enemies die when health reaches 0
- [ ] Weapon switching works

### Phase 5 (Room/Spawn)
- [ ] Enemies spawn in rooms
- [ ] Can progress through multiple rooms
- [ ] Level progression works
- [ ] Movement works correctly

### Phase 6-7 (UI/Transitional)
- [ ] UI displays correctly
- [ ] No visual glitches
- [ ] Error handling works

### Phase 9 (Major Refactor)
- [ ] Full gameplay test
- [ ] All features work end-to-end

---

## Rollback Plan

If anything breaks:
1. Use Git to revert: `git checkout -- <file>`
2. Or restore from the proposal document (files listed there)
3. Test incrementally to find the breaking change

---

## Estimated Timeline

- **Phase 1-2**: 5 minutes (safe deletions)
- **Phase 3**: 10 minutes (investigation)
- **Phase 4-7**: 30 minutes (careful deletion + testing)
- **Phase 8-9**: 45 minutes (major refactor + full testing)

**Total**: ~90 minutes for complete cleanup

---

## Next Steps

**Option A**: Manual execution
- Run the delete commands above one phase at a time
- Test after each phase

**Option B**: Node.js script
- Create the cleanup.js file
- Run `node cleanup.js`
- Test thoroughly

**Option C**: Let me try alternative file operations
- I can attempt to delete files using alternative methods

**Which approach would you like?**
