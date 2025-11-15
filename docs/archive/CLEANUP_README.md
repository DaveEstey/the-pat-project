# Codebase Cleanup Scripts

## Quick Start

### Option 1: Automated Cleanup (Recommended)

```bash
# Step 1: Verify what will be deleted
node verify-cleanup.js

# Step 2: Run the cleanup
node cleanup-codebase.js

# Step 3: Test the game
npm run dev
```

### Option 2: Manual Cleanup

Follow the instructions in `CLEANUP_EXECUTION_PLAN.md`

---

## Scripts Overview

### 1. `verify-cleanup.js` - Pre-flight Check
- **Purpose**: Checks which files exist and scans for imports
- **Safety**: READ-ONLY, doesn't delete anything
- **Use**: Run this BEFORE cleanup to verify safety

```bash
node verify-cleanup.js
```

**Output:**
- ✅ Lists all files that will be deleted
- ⚠️  Shows which files are imported elsewhere
- 📊 Provides statistics

### 2. `cleanup-codebase.js` - Automated Deletion
- **Purpose**: Deletes all legacy/unused files
- **Safety**: DESTRUCTIVE, cannot be undone (without git)
- **Use**: Run this AFTER verifying

```bash
node cleanup-codebase.js
```

**What it deletes:**
- Phase 1: Debug/test components (6 files)
- Phase 2: Unused hooks (3 files)
- Phase 4: Legacy combat systems (2 files)
- Phase 5: Legacy room/spawn systems (6 files)
- Phase 6: Legacy UI components (5 files)
- Phase 7: Transitional components (3 files)

**Total: 25 files deleted**

### 3. `cleanup-phase1.bat` - Windows Batch Script
- **Purpose**: Windows-specific cleanup script
- **Use**: Alternative if Node.js scripts don't work

```cmd
cleanup-phase1.bat
```

---

## What Gets Deleted

### ✅ Safe to Delete (No Risk)
- Debug components (RenderingTest, CameraDebugger, etc.)
- Unused hooks (useBalancedRoomTimer, useRoomProgression, etc.)

### ⚠️ Legacy Systems (Medium Risk - requires testing)
- Old combat systems (EmergencyCombatSystem, useCombatClicks)
- Old room managers (RoomManager, RoomEnemySpawner, etc.)
- Old UI components (EnhancedContinuePrompt, EnemyCounter, etc.)

### 🚨 NOT Deleted (Stays Active)
- UnifiedRoomManager.jsx
- UnifiedCombatSystem.jsx
- UnifiedMovementController.jsx
- LevelManager.jsx
- WeaponController.jsx
- VisualFeedbackSystem.jsx
- All core systems (GameEngine, WeaponSystem, etc.)

---

## After Cleanup

### Phase 8-9: Manual Refactoring Required

The scripts handle automatic file deletion, but you'll need to manually:

1. **Clean up GameCanvas.jsx imports**
   - Remove imports for deleted files
   - See `CLEANUP_EXECUTION_PLAN.md` Phase 8

2. **Refactor GameCanvas.jsx logic**
   - Remove `useUnifiedSystem`, `isRoomBased`, `useMultiRoom` state variables
   - Delete all conditional blocks for legacy systems
   - See `CLEANUP_EXECUTION_PLAN.md` Phase 9

**Estimated time**: 30-45 minutes

---

## Testing Checklist

After running cleanup, test these features:

### Core Gameplay
- [ ] Game starts without errors
- [ ] Enemies spawn in rooms
- [ ] Can shoot enemies
- [ ] Enemies take damage and die
- [ ] Weapon switching works (1-4 keys)
- [ ] Movement between rooms works
- [ ] Level progression works

### UI
- [ ] HUD displays correctly
- [ ] Health bar works
- [ ] Score displays
- [ ] Weapon UI shows correct info

### Effects
- [ ] Particle effects show on hits
- [ ] Explosions show on enemy death
- [ ] Muzzle flash appears when shooting

---

## Rollback Plan

If something breaks:

### Option 1: Git (if you have git initialized)
```bash
git status                    # See what was deleted
git checkout -- <filename>    # Restore specific file
git reset --hard HEAD         # Restore everything (nuclear option)
```

### Option 2: Manual Restore
1. Check `CODEBASE_OPTIMIZATION_PROPOSAL.md` for list of deleted files
2. Recreate files from backup or previous version
3. Run `npm install` to ensure dependencies are correct

### Option 3: Selective Restoration
If only one feature broke, restore just those files:
- **Combat broken?** → Restore EmergencyCombatSystem.jsx
- **Room progression broken?** → Restore RoomManager.jsx
- **UI broken?** → Restore specific UI components

---

## Troubleshooting

### "Module not found" errors after cleanup
**Cause**: Import statement still referencing deleted file

**Fix**:
1. Find the file with the import error
2. Remove the import line
3. Remove any code using that import

### Game doesn't start
**Cause**: Deleted file was actually needed

**Fix**:
1. Check console for specific error
2. Restore that specific file
3. Report which file was needed

### Build warnings
**Cause**: Unused imports or variables

**Fix**: Safe to ignore initially, clean up later

---

## File Size Reduction

**Before cleanup:**
- ~70 source files
- ~15,000 lines of code

**After cleanup:**
- ~45 source files (-35%)
- ~10,000 lines of code (-33%)

**Benefits:**
- Faster build times
- Clearer code structure
- Easier maintenance
- Less confusion about what's active

---

## Need Help?

1. **Before cleanup**: Run `node verify-cleanup.js` to see what will happen
2. **After cleanup**: Check the testing checklist above
3. **If broken**: Follow the rollback plan
4. **Still stuck**: Check `CLEANUP_EXECUTION_PLAN.md` for detailed info

---

## Next Steps After Successful Cleanup

1. ✅ Test thoroughly
2. 🔨 Refactor GameCanvas.jsx (Phases 8-9)
3. 🧹 Clean up any remaining unused imports
4. 📝 Update documentation if needed
5. 🎮 Continue with game development features!

---

**Ready to clean up? Run:**
```bash
node verify-cleanup.js    # Check first
node cleanup-codebase.js  # Then clean
npm run dev               # Then test
```

Good luck! 🚀
