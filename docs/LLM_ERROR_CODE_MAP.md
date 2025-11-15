# LLM Error-Code Map - Machine-Readable

**PURPOSE:** Instant error-to-solution mapping for LLM debugging
**FORMAT:** Structured error patterns with exact file paths and line numbers
**LAST_UPDATED:** 2025-11-05

---

## ERROR_PATTERN_DATABASE

### ENEMY_NOT_SPAWNING
```
ERROR_SIGNATURE: ["enemy not appearing", "no enemies in level", "empty room", "enemies missing"]
COMPONENT_CHAIN: [UnifiedRoomManager.jsx, levelRooms.js, LevelManager.jsx]

CHECK_1: {
  file: "src/components/Game/UnifiedRoomManager.jsx",
  line: 50,
  method: "loadRoom()",
  verify: "console.log('Loading enemies:', roomConfig.enemyLayout)",
  expected: "Array with enemy objects"
}

CHECK_2: {
  file: "src/data/levelRooms.js",
  line_level_1: 14,
  line_level_2: 44,
  line_level_3: 76,
  verify: "enemyLayout array exists and has objects",
  expected: "[{type, position, health, shootInterval}, ...]"
}

CHECK_3: {
  file: "src/components/Game/LevelManager.jsx",
  line: 80,
  method: "loadRoom()",
  verify: "Room config passed to UnifiedRoomManager",
  expected: "Valid room object"
}

COMMON_CAUSES: [
  "Level number doesn't exist in levelRooms.js",
  "enemyLayout array is empty",
  "position values are undefined",
  "UnifiedRoomManager not receiving room config"
]

QUICK_FIX: "Add console.log to UnifiedRoomManager.jsx line ~50"
```

### ENEMY_SPAWNS_AT_WRONG_POSITION
```
ERROR_SIGNATURE: ["enemy in wrong place", "enemy position incorrect", "enemy too close/far"]
FILE: "src/data/levelRooms.js"

LEVEL_LINES: {
  level_1_room_1: 14,
  level_1_room_2: 27,
  level_2_room_1: 44,
  level_2_room_2: 58,
  level_3_room_1: 76,
  level_3_room_2: 92
}

FIX_PATTERN: {
  locate_enemy: "Find enemy in levelRooms.js enemyLayout array",
  change_position: "Edit {x, y, z} values",
  verify_spacing: "Check min 2 units from other enemies",
  verify_bounds: "x:[-10,10], y:[0,6], z:[-25,-8]"
}

EXAMPLE: "{ type: 'basic', position: { x: -2, y: 0, z: -10 }, health: 50 }"
```

### ENEMY_NOT_SHOOTING
```
ERROR_SIGNATURE: ["enemy doesn't attack", "no enemy fire", "enemy passive"]

CHECK_1: {
  file: "src/systems/EnemyAISystem.js",
  line: 50,
  method: "update()",
  verify: "shootInterval logic executing"
}

CHECK_2: {
  file: "src/data/levelRooms.js",
  verify: "shootInterval property exists",
  example: "shootInterval: 4500 (milliseconds)"
}

CHECK_3: {
  file: "src/components/Game/ProjectileSystemBridge.jsx",
  verify: "Projectiles being rendered"
}

QUICK_FIX: "Add to EnemyAISystem.js: console.log('Enemy shooting:', enemy.id, enemy.shootInterval)"
```

### ENEMY_NOT_TAKING_DAMAGE
```
ERROR_SIGNATURE: ["enemy invincible", "shots don't damage", "health not decreasing"]

CHECK_1: {
  file: "src/components/Game/UnifiedCombatSystem.jsx",
  line: 80,
  method: "handleShoot()",
  verify: "Raycasting detecting hits",
  debug: "console.log('Intersects:', intersects.length)"
}

CHECK_2: {
  file: "src/components/Game/UnifiedCombatSystem.jsx",
  line: 130,
  verify: "takeDamage() being called",
  debug: "console.log('Damage dealt:', damage)"
}

CHECK_3: {
  file: "src/components/Game/UnifiedRoomManager.jsx",
  verify: "Enemy has takeDamage() method",
  verify: "health property is set"
}

CHECK_4: {
  file: "src/systems/WeaponSystem.js",
  verify: "Weapon damage > 0"
}

CHECK_5: {
  file: "src/data/weaponStats.js",
  line: 10,
  verify: "damage property exists and > 0"
}

COMMON_CAUSES: [
  "Raycaster not detecting collision",
  "Enemy mesh not in intersectable objects",
  "Weapon damage is 0",
  "takeDamage() not implemented"
]
```

### WEAPON_NOT_UNLOCKING
```
ERROR_SIGNATURE: ["weapon pickup doesn't work", "can't unlock weapon", "weapon not available"]

CHECK_1: {
  file: "src/components/Game/WeaponPickup.jsx",
  line: 30,
  method: "onCollect()",
  verify: "dispatch({ type: 'UNLOCK_WEAPON' }) called",
  debug: "console.log('Weapon collected:', weaponType)"
}

CHECK_2: {
  file: "src/contexts/GameContext.jsx",
  line: 100,
  case: "UNLOCK_WEAPON",
  verify: "Weapon added to player.unlockedWeapons[]"
}

CHECK_3: {
  file: "src/data/levelRooms.js",
  line_L1: 32,
  line_L2: 63,
  line_L3: 81,
  verify: "weaponPickups array exists",
  bug_status: "FIXED - Was overlapping at (-8,6,-50), now separated"
}

CURRENT_POSITIONS: {
  level_1_shotgun: {x: -8, y: 6, z: -50},
  level_2_rapidfire: {x: 8, y: 5, z: -55},
  level_3_grappling: {x: 0, y: 7, z: -48}
}

QUICK_FIX: "Check WeaponPickup.jsx line 30 for dispatch call"
```

### WEAPON_NOT_SWITCHING
```
ERROR_SIGNATURE: ["can't change weapon", "weapon switch broken", "stuck on one weapon"]

CHECK_1: {
  file: "src/components/Game/WeaponController.jsx",
  line: 20,
  verify: "Keyboard event listeners bound (keys 1-9)",
  debug: "console.log('Key pressed:', event.key)"
}

CHECK_2: {
  file: "src/contexts/GameContext.jsx",
  case: "SWITCH_WEAPON",
  verify: "currentWeapon state updates"
}

CHECK_3: {
  verify: "Weapon in player.unlockedWeapons array",
  debug: "console.log('Unlocked weapons:', player.unlockedWeapons)"
}

COMMON_CAUSES: [
  "Weapon not unlocked yet",
  "Key binding not working",
  "Reducer not updating state",
  "Already on selected weapon"
]
```

### SHOOTING_NOT_DETECTING_HITS
```
ERROR_SIGNATURE: ["shots miss", "raycasting not working", "can't hit enemies"]

CHECK_1: {
  file: "src/components/Game/UnifiedCombatSystem.jsx",
  line: 80,
  method: "handleShoot()",
  verify: "Raycaster setup correct",
  debug: "console.log('Ray origin:', raycaster.ray.origin, 'Direction:', raycaster.ray.direction)"
}

CHECK_2: {
  verify: "Mouse position normalized (-1 to 1)",
  debug: "console.log('Mouse coords:', mouse.x, mouse.y)"
}

CHECK_3: {
  verify: "Enemy meshes in scene",
  verify: "Enemy meshes have correct layers",
  debug: "console.log('Intersectable objects:', scene.children.length)"
}

COMMON_CAUSES: [
  "Mouse coordinates not normalized",
  "Raycaster not set from camera",
  "Enemy meshes not in scene",
  "Enemy meshes on wrong layer"
]
```

### CAMERA_NOT_MOVING
```
ERROR_SIGNATURE: ["camera stuck", "no movement", "static view"]

CHECK_1: {
  file: "src/components/Game/UnifiedMovementController.jsx",
  line: 30,
  method: "update()",
  verify: "paused === false",
  debug: "console.log('Camera progress:', progress, 'paused:', paused)"
}

CHECK_2: {
  file: "src/data/roomConfigs.js",
  line: 20,
  verify: "cameraPath defined",
  verify: "Path not empty"
}

CHECK_3: {
  file: "src/contexts/GameContext.jsx",
  verify: "gameState === 'PLAYING'",
  debug: "console.log('Game state:', gameState)"
}

COMMON_CAUSES: [
  "Game paused",
  "Camera path undefined",
  "Speed set to 0",
  "Game state not PLAYING"
]
```

### LEVEL_NOT_LOADING
```
ERROR_SIGNATURE: ["black screen", "level won't load", "stuck on loading"]

CHECK_1: {
  file: "src/components/Game/LevelManager.jsx",
  line: 80,
  method: "loadLevel()",
  debug: "console.log('Loading level:', levelNumber)"
}

CHECK_2: {
  file: "src/data/levelRooms.js",
  line: 387,
  verify: "Level number 1-12 exists",
  fallback: "Returns default room if invalid"
}

CHECK_3: {
  file: "src/contexts/GameContext.jsx",
  verify: "currentLevel set",
  verify: "gameState === 'PLAYING'",
  debug: "console.log('Current level:', currentLevel, 'Game state:', gameState)"
}

CHECK_4: {
  file: "src/components/Game/GameCanvas.jsx",
  line: 80,
  verify: "Three.js scene/camera/renderer initialized",
  debug: "console.log('Scene children:', scene.children.length)"
}

COMMON_CAUSES: [
  "Invalid level number",
  "Three.js not initialized",
  "Game state not set to PLAYING",
  "Room config not found"
]
```

### UI_NOT_SHOWING
```
ERROR_SIGNATURE: ["HUD missing", "UI disappeared", "no interface"]

CHECK_1: {
  file: "src/components/UI/HUD.jsx",
  line: 1,
  verify: "All imports present",
  verify: "Component rendering"
}

CHECK_2: {
  file: "src/components/Game/GameCanvas.jsx",
  line: 150,
  verify: "<HUD /> component rendered",
  verify: "Props passed correctly"
}

CHECK_3: {
  file: "src/styles/components.css",
  verify: "z-index > 100 for UI elements",
  verify: "No display:none"
}

QUICK_FIX: "Add to HUD.jsx: console.log('HUD rendering with player:', player)"
```

### HEALTH_BAR_NOT_UPDATING
```
ERROR_SIGNATURE: ["health stuck", "health bar frozen", "damage not showing"]

CHECK_1: {
  file: "src/components/UI/HealthBar.jsx",
  line: 10,
  verify: "current and max props received",
  debug: "console.log('Health:', current, '/', max)"
}

CHECK_2: {
  file: "src/contexts/GameContext.jsx",
  case: "PLAYER_DAMAGED",
  verify: "player.health updated in reducer"
}

CHECK_3: {
  file: "src/components/UI/HUD.jsx",
  line: 50,
  verify: "Passing player.health to HealthBar",
  check: "<HealthBar current={player.health} max={player.maxHealth} />"
}

COMMON_CAUSES: [
  "Props not passed to HealthBar",
  "GameContext not updating health",
  "Component not re-rendering"
]
```

### PUZZLE_NOT_APPEARING
```
ERROR_SIGNATURE: ["no puzzle", "puzzle missing", "puzzle doesn't show"]

CHECK_1: {
  file: "src/data/puzzleConfigs.js",
  line: 4,
  verify: "Level has puzzle config",
  method: "levelHasPuzzle(levelNumber)"
}

CHECK_2: {
  file: "src/components/Game/InteractivePuzzle.jsx",
  line: 20,
  verify: "Puzzle initialized",
  debug: "console.log('Puzzle config:', getPuzzleForLevel(currentLevel))"
}

CHECK_3: {
  file: "src/components/Game/Puzzles/",
  warning: "ALL 4 PUZZLE COMPONENTS ARE EMPTY FRAMEWORKS",
  status: "SwitchSequence.jsx, TerrainModifier.jsx, DoorMechanism.jsx, PathSelector.jsx need implementation"
}

CRITICAL_NOTE: "Puzzle components exist but have no logic implemented"
```

### BOSS_HEALTH_BAR_NOT_SHOWING
```
ERROR_SIGNATURE: ["no boss health", "boss health bar missing"]

CHECK_1: {
  file: "src/components/UI/HUD.jsx",
  line: 40,
  verify: "boss && boss.isBoss condition",
  verify: "BossHealthBar rendered conditionally"
}

CHECK_2: {
  file: "src/data/levelRooms.js",
  line_L3: 93,
  line_L6: 173,
  line_L9: 265,
  line_L12: 374,
  verify: "isBoss: true property exists"
}

CHECK_3: {
  file: "src/contexts/GameContext.jsx",
  verify: "currentBoss state set",
  debug: "console.log('Boss:', boss)"
}

FIX: "Ensure boss enemy has isBoss: true in levelRooms.js"
```

### ITEMS_NOT_APPEARING
```
ERROR_SIGNATURE: ["no items in level", "pickups missing", "collectibles not showing"]

CHECK_1: {
  file: "src/data/levelItems.js",
  line_L1: 3,
  line_L2: 40,
  line_L3: 90,
  verify: "LevelItems.level1 array exists"
}

CHECK_2: {
  file: "src/components/Game/WeaponPickup.jsx OR ItemManager",
  verify: "Items being rendered from levelItems.js"
}

CHECK_3: {
  verify: "Item positions have negative Z (e.g., z: -25)",
  verify: "Y values between 0.5 and 6"
}

COMMON_CAUSES: [
  "Level items array empty",
  "Items not rendered in scene",
  "Items outside camera view"
]
```

### AUDIO_NOT_PLAYING
```
ERROR_SIGNATURE: ["no sound", "audio broken", "music not playing"]

STATUS: "EXPECTED_BEHAVIOR"
REASON: "Audio intentionally disabled per CLAUDE.md specification"

FILE: "src/utils/audioUtils.js"
IMPLEMENTATION: "Placeholder functions (no-ops, console.log only)"

FILES: [
  "src/utils/audioUtils.js - All no-op",
  "src/hooks/useAudio.js - Returns no-op functions",
  "src/components/Game/SoundManager.jsx - Logs only"
]

TO_ENABLE: [
  "Implement Web Audio API in audioUtils.js",
  "Load audio files",
  "Update SoundManager.jsx",
  "Remove placeholder functions"
]

NOT_A_BUG: "Audio disabled by design during development"
```

### PERFORMANCE_LAG_LOW_FPS
```
ERROR_SIGNATURE: ["low FPS", "stuttering", "lag", "slow performance"]

CHECK_1: {
  file: "src/data/gameConfig.js",
  line: 15,
  parameter: "maxEnemies",
  current: 50,
  reduce_to: 30,
  verify: "Lower enemy count improves FPS"
}

CHECK_2: {
  file: "src/data/gameConfig.js",
  parameter: "maxParticles",
  current: 200,
  reduce_to: 100
}

CHECK_3: {
  file: "src/components/Game/UnifiedRoomManager.jsx",
  line: 300,
  method: "handleEnemyDeath()",
  verify: "scene.remove(enemyMesh) called",
  verify: "geometry.dispose() and material.dispose() called"
}

CHECK_4: {
  verify: "Post-processing effects disabled in Settings",
  verify: "Dynamic lighting reduced"
}

COMMON_CAUSES: [
  "Too many enemies (>50)",
  "Too many particles (>200)",
  "Memory leak (not disposing meshes)",
  "Post-processing enabled"
]

QUICK_FIX: "Reduce maxEnemies to 30 in gameConfig.js"
```

### MEMORY_LEAK_FPS_DEGRADES
```
ERROR_SIGNATURE: ["FPS decreases over time", "memory growing", "game slows down after playing"]

CHECK_1: {
  file: "src/components/Game/UnifiedRoomManager.jsx",
  line: 300,
  method: "handleEnemyDeath()",
  required_calls: [
    "scene.remove(enemyMesh)",
    "enemyMesh.geometry.dispose()",
    "enemyMesh.material.dispose()"
  ]
}

CHECK_2: {
  file: "src/systems/ParticleSystem.js",
  verify: "Expired particles removed",
  verify: "Old particle systems disposed"
}

CHECK_3: {
  verify: "Event listeners removed in componentWillUnmount",
  pattern: "useEffect cleanup functions"
}

FIX_PATTERN: "Always dispose Three.js geometries and materials when removing objects"
```

---

## REACT_ERROR_PATTERNS

### MODULE_NOT_FOUND
```
ERROR_MESSAGE: "Module not found: Can't resolve 'X'"
CAUSES: [
  "Wrong file path (case-sensitive)",
  "Missing file extension (.jsx, .js)",
  "Incorrect relative path (../ vs ./)"
]

FIX_EXAMPLES: [
  "WRONG: import { X } from 'components/X'",
  "RIGHT: import { X } from './components/X.jsx'",
  "",
  "WRONG: import { X } from './components/x.jsx'",
  "RIGHT: import { X } from './components/X.jsx' (case-sensitive)"
]
```

### MAXIMUM_UPDATE_DEPTH_EXCEEDED
```
ERROR_MESSAGE: "Maximum update depth exceeded"
CAUSE: "Infinite re-render loop in React"

CHECK: {
  pattern: "useEffect with missing dependencies",
  fix: "Add dependency array to useEffect",
  example: "useEffect(() => { ... }, []) // Empty array = run once"
}

COMMON_PATTERN: "State update inside render causing re-render"
```

### DISPATCH_NOT_DEFINED
```
ERROR_MESSAGE: "ReferenceError: dispatch is not defined"

CHECK: {
  file: "Component using dispatch",
  verify: "GameContext imported",
  verify: "useContext(GameContext) called",
  example: "const { state, dispatch } = useContext(GameContext);"
}

FIX: "Import and use GameContext in component"
```

### THREE_WEBGLRENDERER_CONTEXT_LOST
```
ERROR_MESSAGE: "THREE.WebGLRenderer: Context Lost"

CAUSES: [
  "Too many Three.js objects",
  "GPU crash",
  "Memory exhausted"
]

FIXES: [
  "Dispose old meshes/materials/geometries",
  "Reduce maxEnemies in gameConfig.js",
  "Reduce graphics quality in Settings",
  "Refresh browser"
]
```

---

## QUICK_DEBUG_SNIPPETS

### DEBUG_ENEMY_SPAWNING
```javascript
// Add to UnifiedRoomManager.jsx line ~50
console.log('=== LOAD ROOM DEBUG ===');
console.log('Room Config:', roomConfig);
console.log('Enemy Layout:', roomConfig.enemyLayout);
roomConfig.enemyLayout.forEach((enemy, i) => {
  console.log(`Enemy ${i}:`, enemy.type, 'at', enemy.position);
});
```

### DEBUG_SHOOTING
```javascript
// Add to UnifiedCombatSystem.jsx handleShoot()
console.log('=== SHOOT DEBUG ===');
console.log('Mouse:', mouse);
console.log('Raycaster:', raycaster);
console.log('Intersects:', intersects.length);
if (intersects.length > 0) {
  console.log('Hit:', intersects[0].object.name, intersects[0].point);
}
```

### DEBUG_GAME_STATE
```javascript
// Add to GameCanvas.jsx
useEffect(() => {
  window.debugGame = () => {
    console.log('=== GAME STATE ===');
    console.log('Game State:', gameState);
    console.log('Current Level:', currentLevel);
    console.log('Player:', player);
    console.log('Enemies:', enemies.length);
    console.log('Camera:', camera.position);
    console.log('Scene Children:', scene.children.length);
  };
}, [gameState, currentLevel, player, enemies]);
// Call in console: window.debugGame()
```

---

## ERROR_PRIORITY_LEVELS

```
CRITICAL: [
  "ENEMY_NOT_SPAWNING",
  "LEVEL_NOT_LOADING",
  "SHOOTING_NOT_DETECTING_HITS",
  "CAMERA_NOT_MOVING"
]

HIGH: [
  "WEAPON_NOT_UNLOCKING",
  "ENEMY_NOT_TAKING_DAMAGE",
  "UI_NOT_SHOWING"
]

MEDIUM: [
  "WEAPON_NOT_SWITCHING",
  "HEALTH_BAR_NOT_UPDATING",
  "BOSS_HEALTH_BAR_NOT_SHOWING"
]

LOW: [
  "PUZZLE_NOT_APPEARING (puzzles not implemented)",
  "ITEMS_NOT_APPEARING",
  "PERFORMANCE_LAG_LOW_FPS"
]

NOT_A_BUG: [
  "AUDIO_NOT_PLAYING (disabled by design)"
]
```

---

END LLM_ERROR_CODE_MAP
