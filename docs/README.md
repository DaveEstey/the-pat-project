# Documentation Directory - The PAT Project

Complete documentation for the on-rails shooter game. Start here to find what you need.

**Last Updated:** 2025-11-05
**Project:** On-Rails Shooter with Puzzle Elements

---

## 🚀 Quick Start - Where to Look First

### New to the Project?
1. **ARCHITECTURE.md** - Understand the overall system design
2. **COMPONENT_REFERENCE.md** - See all components and their relationships
3. **QUICK_REFERENCE.md** - Common debugging scenarios

### Debugging an Issue?
1. **QUICK_REFERENCE.md** - Error-to-code mapping
2. **COMPONENT_REFERENCE.md** - Find which component handles what
3. **DATA_STRUCTURE_MAP.md** - Find which data file to change

### Adding New Content?
1. **DATA_STRUCTURE_MAP.md** - How to add levels, enemies, weapons
2. **POSITIONING_GUIDE.md** - Where to place objects in 3D space
3. **LEVEL_DESIGN.md** - Level design principles

### Understanding Design Choices?
1. **ARCHITECTURE_DECISIONS.md** - Why things are built this way
2. **ARCHITECTURE.md** - System overview
3. **OPTIMIZATION.md** - Performance considerations

---

## 📚 Documentation Categories

### 🔧 Essential Reference Guides (START HERE)

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **COMPONENT_REFERENCE.md** | Complete component mapping (38 components) | "Where is the code for X?" |
| **POSITIONING_GUIDE.md** | All 3D coordinates and spacing rules | "Where should I place this enemy/item?" |
| **QUICK_REFERENCE.md** | Error-to-code debugging guide | "Enemy not spawning - how do I fix?" |
| **DATA_STRUCTURE_MAP.md** | All config files and relationships | "Which file controls weapon damage?" |
| **ARCHITECTURE_DECISIONS.md** | Why implementation differs from spec | "Why aren't enemies separate components?" |

**These 5 documents are your primary references - use them daily!**

---

### 🏗️ Architecture & Design

| Document | Purpose |
|----------|---------|
| **ARCHITECTURE.md** | System overview, tech stack, patterns |
| **ARCHITECTURE_DECISIONS.md** | Design rationale and trade-offs |
| **CORE_SYSTEMS.md** | 36 game systems documentation |
| **OPTIMIZATION.md** | Performance optimization strategies |

---

### 🎮 Game Systems

| Document | Purpose |
|----------|---------|
| **ENEMY_AI.md** | Enemy behavior and AI systems |
| **WEAPONS_SYSTEMS.md** | Weapon mechanics and stats |
| **PUZZLE_SYSTEMS.md** | Puzzle design and implementation |
| **PROGRESSION_SYSTEMS.md** | Unlocks, saves, achievements |
| **AUDIO_SYSTEM.md** | Audio (currently disabled) |

---

### 🗺️ Level Design

| Document | Purpose |
|----------|---------|
| **LEVEL_DESIGN.md** | All 12 levels documented |
| **POSITIONING_GUIDE.md** | Enemy/item placement coordinates |
| **COMPONENTS_MAP.md** | Component inventory and status |

---

### 📋 Progress & Planning

| Document | Status | Purpose |
|----------|--------|---------|
| **MASTER_TODO.md** | ⚠️ Outdated | Original task list |
| **COMPLETION_PLAN.md** | ⚠️ Outdated | Development roadmap |
| **NEXT_PHASE_ROADMAP.md** | ✅ Current | Future features |
| **GAME_IMPROVEMENT_PLAN.md** | ✅ Current | Enhancement proposals |

---

### ✅ Completion Reports

| Document | Date | Purpose |
|----------|------|---------|
| **ALL_PRIORITIES_COMPLETE.md** | Oct 29 | Final milestone report |
| **FEATURES_IMPLEMENTED.md** | Nov 1 | Feature completion list |
| **PRIORITIES_4_5_COMPLETE.md** | Oct 29 | Milestone tracking |
| **PRIORITY_FIXES_COMPLETE.md** | Oct 29 | Bug fix tracking |

---

### 🐛 Bug Fixes & Sessions

| Document | Date | Purpose |
|----------|------|---------|
| **BUGFIX_ROOM_TRANSITION.md** | Oct 29 | Room transition fix |
| **PUZZLE_SYSTEM_IMPLEMENTATION.md** | Oct 29 | Puzzle dev notes |
| **SESSION_COMPLETE_SUMMARY.md** | Oct 29 | Session summary |
| **SESSION_FINAL_REPORT.md** | Oct 28 | Session report |
| **SESSION_PROGRESS.md** | Oct 28 | Session logs |

---

## 🔍 Finding What You Need

### "Enemy not spawning?"
→ **QUICK_REFERENCE.md** → Enemy Issues section
→ Files to check: `UnifiedRoomManager.jsx`, `levelRooms.js`

### "Weapon not unlocking?"
→ **QUICK_REFERENCE.md** → Weapon Issues section
→ Files to check: `WeaponPickup.jsx`, `WeaponController.jsx`, `levelRooms.js` (line 32, 63, 81)

### "How do I add a new level?"
→ **DATA_STRUCTURE_MAP.md** → "Adding a New Level" section
→ Files to edit: `levelRooms.js`, `levelItems.js`, `puzzleConfigs.js`

### "Where are enemy positions stored?"
→ **POSITIONING_GUIDE.md** → Enemy Positions section
→ File: `levelRooms.js`

### "Why aren't enemies separate components?"
→ **ARCHITECTURE_DECISIONS.md** → Enemy System Architecture
→ Answer: Performance - procedural enemies are 5x faster

### "How do I change weapon damage?"
→ **DATA_STRUCTURE_MAP.md** → weaponStats.js section
→ File: `src/data/weaponStats.js` → `WeaponStats[weaponType].damage`

### "What's the coordinate system?"
→ **POSITIONING_GUIDE.md** → Coordinate System Explained
→ Answer: Right-handed (X: left/right, Y: up/down, Z: depth)

### "Which component handles shooting?"
→ **COMPONENT_REFERENCE.md** → Game Components → UnifiedCombatSystem
→ File: `src/components/Game/UnifiedCombatSystem.jsx`

---

## 📊 Documentation Statistics

- **Total Documents:** 29 files
- **Essential Guides:** 5 files (★ prioritize these)
- **System Documentation:** 9 files
- **Progress Reports:** 8 files
- **Bug/Session Logs:** 7 files

**Total Documentation Words:** ~100,000+

---

## 🎯 Recommended Reading Order

### For New Developers:
1. **ARCHITECTURE.md** (30 min) - Understand the big picture
2. **COMPONENT_REFERENCE.md** (60 min) - Learn component structure
3. **QUICK_REFERENCE.md** (30 min) - Know how to debug
4. **ARCHITECTURE_DECISIONS.md** (45 min) - Understand design choices
5. **DATA_STRUCTURE_MAP.md** (45 min) - Learn data flow

**Total: ~3.5 hours to become productive**

### For Quick Fixes:
1. **QUICK_REFERENCE.md** - Find your error, get solution immediately

### For Adding Content:
1. **DATA_STRUCTURE_MAP.md** - Understand config files
2. **POSITIONING_GUIDE.md** - Place objects correctly
3. **LEVEL_DESIGN.md** - Follow design principles

---

## 🔄 Document Relationships

```
ARCHITECTURE.md (overview)
    ↓
    ├─→ ARCHITECTURE_DECISIONS.md (design rationale)
    ├─→ CORE_SYSTEMS.md (system details)
    └─→ OPTIMIZATION.md (performance)

COMPONENT_REFERENCE.md (all components)
    ↓
    ├─→ COMPONENTS_MAP.md (legacy component list)
    └─→ QUICK_REFERENCE.md (debugging components)

DATA_STRUCTURE_MAP.md (all data files)
    ↓
    ├─→ LEVEL_DESIGN.md (level data)
    ├─→ WEAPONS_SYSTEMS.md (weapon data)
    ├─→ ENEMY_AI.md (enemy data)
    └─→ POSITIONING_GUIDE.md (position data)

QUICK_REFERENCE.md (debugging)
    ↓
    ├─→ COMPONENT_REFERENCE.md (component locations)
    ├─→ DATA_STRUCTURE_MAP.md (data file locations)
    └─→ POSITIONING_GUIDE.md (position issues)
```

---

## ⚠️ Important Notes

### Critical Bug Fixed
**Weapon Pickup Overlap** - All 3 weapon pickups were at the same position.
**Status:** ✅ FIXED in `src/data/levelRooms.js`
**Details:** See POSITIONING_GUIDE.md → Critical Issues

### Audio System
**Status:** ⚠️ INTENTIONALLY DISABLED
**Reason:** Per CLAUDE.md specification, audio is placeholder-only during development
**Details:** See AUDIO_SYSTEM.md

### Puzzle Components
**Status:** ⚠️ EMPTY FRAMEWORKS
**Location:** `src/components/Game/Puzzles/` (4 files)
**Details:** See COMPONENT_REFERENCE.md → Puzzle Components

### Legacy Files
- **levelSpawns.js** - Unused (replaced by room system)
- **MASTER_TODO.md** - Outdated (tasks completed)
- **COMPLETION_PLAN.md** - Outdated (project evolved)

---

## 🛠️ Maintenance

### When to Update Documentation

**After adding a new component:**
- Update: COMPONENT_REFERENCE.md

**After adding a new level:**
- Update: LEVEL_DESIGN.md, POSITIONING_GUIDE.md, DATA_STRUCTURE_MAP.md

**After changing data structure:**
- Update: DATA_STRUCTURE_MAP.md

**After fixing a common bug:**
- Update: QUICK_REFERENCE.md

**After making architectural change:**
- Update: ARCHITECTURE_DECISIONS.md

---

## 📞 Quick Contact Reference

**File Locations:**
- Components: `src/components/` (UI/ and Game/)
- Data: `src/data/` (14 config files)
- Systems: `src/systems/` (36 system files)
- Types: `src/types/` (5 type definition files)
- Documentation: `docs/` (this directory)

**Key Files:**
- Enemy Spawns: `src/data/levelRooms.js`
- Item Placements: `src/data/levelItems.js`
- Weapon Stats: `src/data/weaponStats.js`
- Game Config: `src/data/gameConfig.js`
- Puzzle Configs: `src/data/puzzleConfigs.js`

---

## 🎓 Learning Resources

### Understanding the Codebase
1. Read ARCHITECTURE.md
2. Explore COMPONENT_REFERENCE.md
3. Study DATA_STRUCTURE_MAP.md

### Debugging Issues
1. Check QUICK_REFERENCE.md first
2. Use browser console (F12)
3. Check component in React DevTools

### Adding Features
1. Review NEXT_PHASE_ROADMAP.md for planned features
2. Check GAME_IMPROVEMENT_PLAN.md for enhancement ideas
3. Follow patterns in DATA_STRUCTURE_MAP.md

---

## ✨ Documentation Best Practices

### When Reading:
- Start with **Essential Reference Guides** (top 5 docs)
- Use Ctrl+F to search within documents
- Check "Last Updated" dates for currency

### When Writing:
- Update relevant docs when changing code
- Include file paths and line numbers
- Provide code examples
- Cross-reference related documents

### When Debugging:
- Check QUICK_REFERENCE.md first
- Then check component in COMPONENT_REFERENCE.md
- Then check data in DATA_STRUCTURE_MAP.md

---

**End of Documentation Index**

**Need help?** Start with QUICK_REFERENCE.md for specific issues or ARCHITECTURE.md for general understanding.

**Last Full Documentation Audit:** 2025-11-05
