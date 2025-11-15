# LLM Position Database - Machine-Readable

**PURPOSE:** Instant 3D coordinate lookup for all game objects
**FORMAT:** Structured position data optimized for LLM parsing
**COORDINATE_SYSTEM:** Right-handed (X: left/right, Y: up/down, Z: depth)
**LAST_UPDATED:** 2025-11-05

---

## COORDINATE_SYSTEM_SPEC

```
AXIS_X: {min: -10, max: 10, meaning: "horizontal", direction: "left(-) to right(+)"}
AXIS_Y: {min: 0, max: 6, meaning: "vertical", direction: "ground(0) to elevated(+)"}
AXIS_Z: {min: -25, max: 10, meaning: "depth", direction: "away(-) to toward(+)"}

PLAYER_CAMERA: {x: 0, y: 1.6, z: 0}
GROUND_LEVEL: 0
ENEMY_ZONE: {z_min: -25, z_max: -8}
PUZZLE_ZONE: {z_min: 5, z_max: 10}
ITEM_ZONE: {z_min: -195, z_max: -10}
```

---

## SPACING_RULES

```
ENEMY_TO_ENEMY: {min_distance: 2, unit: "units"}
ENEMY_TO_ITEM: {min_distance: 1.5, unit: "units"}
ENEMY_TO_PUZZLE: {min_distance: 8, unit: "units"}
ITEM_TO_ITEM: {min_distance: 1, unit: "units"}
WEAPON_PICKUP_TO_WEAPON_PICKUP: {min_distance: 10, unit: "units"}
CAMERA_TO_ENEMY: {min_distance: 8, unit: "units"}
PUZZLE_TARGET_TO_PUZZLE_TARGET: {min_distance: 1.5, unit: "units"}
```

---

## ENEMY_POSITIONS_DATABASE

### LEVEL_1_ROOM_1
```
FILE: src/data/levelRooms.js
LINE: 14-16

ENEMY_1: {type: "basic", x: -2, y: 0, z: -10, health: 50, shootInterval: 4500, notes: "left_flank"}
ENEMY_2: {type: "basic", x: 2, y: 0, z: -10, health: 50, shootInterval: 5000, notes: "right_flank"}
ENEMY_3: {type: "basic", x: 0, y: 1, z: -12, health: 50, shootInterval: 5500, notes: "center_elevated"}

FORMATION: "line_with_elevated_center"
HORIZONTAL_SPREAD: 4
DEPTH_SPREAD: 2
ENEMY_COUNT: 3
```

### LEVEL_1_ROOM_2
```
FILE: src/data/levelRooms.js
LINE: 27-29

ENEMY_1: {type: "basic", x: -3, y: 0, z: -10, health: 60, shootInterval: 4300, notes: "left_flank"}
ENEMY_2: {type: "armored", x: 0, y: 0.5, z: -12, health: 120, shootInterval: 5000, notes: "center_tank"}
ENEMY_3: {type: "basic", x: 3, y: 0, z: -10, health: 60, shootInterval: 4700, notes: "right_flank"}

FORMATION: "protected_center"
HORIZONTAL_SPREAD: 6
DEPTH_SPREAD: 2
ENEMY_COUNT: 3
```

### LEVEL_2_ROOM_1
```
FILE: src/data/levelRooms.js
LINE: 44-48

ENEMY_1: {type: "fast_debuffer", x: -3, y: 0, z: -9, health: 45, shootInterval: 2500, notes: "left_speedster"}
ENEMY_2: {type: "armored", x: 0, y: 1.5, z: -12, health: 140, shootInterval: 3500, notes: "center_tank_elevated"}
ENEMY_3: {type: "fast_debuffer", x: 3, y: 0, z: -9, health: 45, shootInterval: 2500, notes: "right_speedster"}

FORMATION: "flanking_fast_with_elevated_tank"
HORIZONTAL_SPREAD: 6
DEPTH_SPREAD: 3
ELEVATION_MAX: 1.5
ENEMY_COUNT: 3
```

### LEVEL_2_ROOM_2
```
FILE: src/data/levelRooms.js
LINE: 58-60

ENEMY_1: {type: "bomb_thrower", x: -2, y: 1, z: -13, health: 90, shootInterval: 4500, notes: "left_bomber_elevated"}
ENEMY_2: {type: "armored", x: 0, y: 0, z: -11, health: 180, shootInterval: 3800, notes: "center_tank_forward"}
ENEMY_3: {type: "bomb_thrower", x: 2, y: 1, z: -13, health: 90, shootInterval: 4700, notes: "right_bomber_elevated"}

FORMATION: "forward_tank_with_rear_bombers"
HORIZONTAL_SPREAD: 4
DEPTH_SPREAD: 2
ENEMY_COUNT: 3
```

### LEVEL_3_ROOM_1
```
FILE: src/data/levelRooms.js
LINE: 76-78

ENEMY_1: {type: "ninja", x: -2, y: 0, z: -8, health: 40, shootInterval: 2500, notes: "left_ninja_close"}
ENEMY_2: {type: "armored", x: 0, y: 0, z: -11, health: 200, shootInterval: 3500, notes: "center_tank"}
ENEMY_3: {type: "ninja", x: 2, y: 0, z: -8, health: 40, shootInterval: 2500, notes: "right_ninja_close"}

FORMATION: "close_ninjas_with_rear_tank"
HORIZONTAL_SPREAD: 4
DEPTH_SPREAD: 3
ENEMY_COUNT: 3
```

### LEVEL_3_ROOM_2_BOSS
```
FILE: src/data/levelRooms.js
LINE: 92-94

ENEMY_1: {type: "ninja", x: -3, y: 0, z: -8, health: 50, shootInterval: 2500, notes: "left_add"}
ENEMY_2: {type: "boss", x: 0, y: 1, z: -11, health: 350, shootInterval: 3500, isBoss: true, notes: "TITAN_ENFORCER"}
ENEMY_3: {type: "ninja", x: 3, y: 0, z: -8, health: 50, shootInterval: 2500, notes: "right_add"}

FORMATION: "boss_with_ninja_guards"
HORIZONTAL_SPREAD: 6
DEPTH_SPREAD: 3
BOSS_ELEVATION: 1
ENEMY_COUNT: 3
BOSS_PRESENT: true
```

### LEVEL_4_ROOM_1
```
FILE: src/data/levelRooms.js
LINE: 107-110

ENEMY_1: {type: "ninja", x: -4, y: 0, z: -10, health: 70, shootInterval: 2500}
ENEMY_2: {type: "basic", x: 0, y: 0, z: -13, health: 65, shootInterval: 3800}
ENEMY_3: {type: "ninja", x: 4, y: 0, z: -10, health: 70, shootInterval: 2500}
ENEMY_4: {type: "bomb_thrower", x: 0, y: 2, z: -17, health: 90, shootInterval: 4500}

FORMATION: "wide_front_with_elevated_rear"
HORIZONTAL_SPREAD: 8
DEPTH_SPREAD: 7
ELEVATION_MAX: 2
ENEMY_COUNT: 4
```

### LEVEL_4_ROOM_2
```
FILE: src/data/levelRooms.js
LINE: 121-123

ENEMY_1: {type: "armored", x: -3, y: 1, z: -12, health: 150, shootInterval: 2500}
ENEMY_2: {type: "ninja", x: 3, y: 0, z: -9, health: 75, shootInterval: 2500}
ENEMY_3: {type: "fast_debuffer", x: 0, y: 0.5, z: -15, health: 55, shootInterval: 2500}

FORMATION: "asymmetric_spread"
HORIZONTAL_SPREAD: 6
DEPTH_SPREAD: 6
ENEMY_COUNT: 3
```

### LEVEL_5_ROOM_1
```
FILE: src/data/levelRooms.js
LINE: 136-139

ENEMY_1: {type: "fast_debuffer", x: -3, y: 1, z: -11, health: 60, shootInterval: 2500}
ENEMY_2: {type: "armored", x: 3, y: 1, z: -11, health: 160, shootInterval: 2500}
ENEMY_3: {type: "ninja", x: 0, y: 2, z: -14, health: 80, shootInterval: 2500}
ENEMY_4: {type: "bomb_thrower", x: 0, y: 0, z: -17, health: 95, shootInterval: 4000}

FORMATION: "elevated_front_high_center_rear_bomber"
HORIZONTAL_SPREAD: 6
DEPTH_SPREAD: 6
ELEVATION_MAX: 2
ENEMY_COUNT: 4
```

### LEVEL_5_ROOM_2
```
FILE: src/data/levelRooms.js
LINE: 150-154

ENEMY_1: {type: "fast_debuffer", x: -4, y: 0, z: -10, health: 65, shootInterval: 2500}
ENEMY_2: {type: "fast_debuffer", x: 4, y: 0, z: -10, health: 65, shootInterval: 2500}
ENEMY_3: {type: "armored", x: 0, y: 1, z: -13, health: 170, shootInterval: 2500}
ENEMY_4: {type: "ninja", x: -2, y: 2, z: -15, health: 85, shootInterval: 2500}
ENEMY_5: {type: "ninja", x: 2, y: 2, z: -15, health: 85, shootInterval: 2500}

FORMATION: "5_enemy_complex"
HORIZONTAL_SPREAD: 8
DEPTH_SPREAD: 5
ELEVATION_MAX: 2
ENEMY_COUNT: 5
```

### LEVEL_6_ROOM_1
```
FILE: src/data/levelRooms.js
LINE: 167-169

ENEMY_1: {type: "ninja", x: -5, y: 0, z: -12, health: 90, shootInterval: 2500}
ENEMY_2: {type: "bomb_thrower", x: 0, y: 1.5, z: -15, health: 110, shootInterval: 3500}
ENEMY_3: {type: "ninja", x: 5, y: 0, z: -12, health: 90, shootInterval: 2500}

FORMATION: "wide_spread_central_bomber"
HORIZONTAL_SPREAD: 10
DEPTH_SPREAD: 3
ELEVATION_CENTER: 1.5
ENEMY_COUNT: 3
```

### LEVEL_6_ROOM_2
```
FILE: src/data/levelRooms.js
LINE: 180-183

ENEMY_1: {type: "ninja", x: -3, y: 2, z: -11, health: 95, shootInterval: 2500}
ENEMY_2: {type: "armored", x: 0, y: 0, z: -14, health: 180, shootInterval: 2500}
ENEMY_3: {type: "ninja", x: 3, y: 2, z: -11, health: 95, shootInterval: 2500}
ENEMY_4: {type: "fast_debuffer", x: 0, y: 1, z: -17, health: 70, shootInterval: 2500}

FORMATION: "high_flanks_ground_center_rear"
HORIZONTAL_SPREAD: 6
DEPTH_SPREAD: 6
ELEVATION_MAX: 2
ENEMY_COUNT: 4
```

### LEVEL_7_ROOM_1
```
FILE: src/data/levelRooms.js
LINE: 196-199

ENEMY_1: {type: "basic", x: -4, y: 0, z: -11, health: 80, shootInterval: 2500}
ENEMY_2: {type: "bomb_thrower", x: 0, y: 1, z: -14, health: 120, shootInterval: 3800}
ENEMY_3: {type: "basic", x: 4, y: 0, z: -11, health: 80, shootInterval: 2500}
ENEMY_4: {type: "armored", x: 0, y: 0, z: -17, health: 190, shootInterval: 2500}

FORMATION: "front_line_elevated_bomber_rear_tank"
HORIZONTAL_SPREAD: 8
DEPTH_SPREAD: 6
ENEMY_COUNT: 4
```

### LEVEL_7_ROOM_2
```
FILE: src/data/levelRooms.js
LINE: 210-214

ENEMY_1: {type: "basic", x: -5, y: 0, z: -10, health: 85, shootInterval: 2500}
ENEMY_2: {type: "ninja", x: -2, y: 0, z: -12, health: 100, shootInterval: 2500}
ENEMY_3: {type: "armored", x: 0, y: 0.5, z: -15, health: 200, shootInterval: 2500}
ENEMY_4: {type: "ninja", x: 2, y: 0, z: -12, health: 100, shootInterval: 2500}
ENEMY_5: {type: "basic", x: 5, y: 0, z: -10, health: 85, shootInterval: 2500}

FORMATION: "5_enemy_symmetric"
HORIZONTAL_SPREAD: 10
DEPTH_SPREAD: 5
ENEMY_COUNT: 5
```

### LEVEL_8_ROOM_1
```
FILE: src/data/levelRooms.js
LINE: 227-231

ENEMY_1: {type: "fast_debuffer", x: -4, y: 1, z: -10, health: 75, shootInterval: 2500}
ENEMY_2: {type: "ninja", x: -1, y: 2, z: -13, health: 105, shootInterval: 2500}
ENEMY_3: {type: "armored", x: 0, y: 0, z: -16, health: 210, shootInterval: 2500}
ENEMY_4: {type: "ninja", x: 1, y: 2, z: -13, health: 105, shootInterval: 2500}
ENEMY_5: {type: "fast_debuffer", x: 4, y: 1, z: -10, health: 75, shootInterval: 2500}

FORMATION: "complex_multi_elevation"
HORIZONTAL_SPREAD: 8
DEPTH_SPREAD: 6
ELEVATION_MAX: 2
ENEMY_COUNT: 5
```

### LEVEL_8_ROOM_2
```
FILE: src/data/levelRooms.js
LINE: 242-245

ENEMY_1: {type: "armored", x: -3, y: 1, z: -13, health: 220, shootInterval: 2500}
ENEMY_2: {type: "bomb_thrower", x: 0, y: 2, z: -17, health: 140, shootInterval: 2500}
ENEMY_3: {type: "armored", x: 3, y: 1, z: -13, health: 220, shootInterval: 2500}
ENEMY_4: {type: "fast_debuffer", x: 0, y: 0, z: -20, health: 80, shootInterval: 2500}

FORMATION: "twin_tanks_high_bomber_distant_debuffer"
HORIZONTAL_SPREAD: 6
DEPTH_SPREAD: 7
ELEVATION_MAX: 2
ENEMY_COUNT: 4
```

### LEVEL_9_ROOM_1
```
FILE: src/data/levelRooms.js
LINE: 258-261

ENEMY_1: {type: "ninja", x: -4, y: 0, z: -11, health: 110, shootInterval: 2500}
ENEMY_2: {type: "bomb_thrower", x: 0, y: 3, z: -15, health: 150, shootInterval: 2500}
ENEMY_3: {type: "ninja", x: 4, y: 0, z: -11, health: 110, shootInterval: 2500}
ENEMY_4: {type: "armored", x: 0, y: 0, z: -18, health: 240, shootInterval: 2500}

FORMATION: "ground_ninjas_very_high_bomber_rear_tank"
HORIZONTAL_SPREAD: 8
DEPTH_SPREAD: 7
ELEVATION_MAX: 3
ENEMY_COUNT: 4
```

### LEVEL_9_ROOM_2
```
FILE: src/data/levelRooms.js
LINE: 272-277

ENEMY_1: {type: "ninja", x: -5, y: 0, z: -10, health: 115, shootInterval: 2500}
ENEMY_2: {type: "fast_debuffer", x: -2, y: 1, z: -13, health: 85, shootInterval: 2500}
ENEMY_3: {type: "armored", x: 0, y: 1, z: -16, health: 250, shootInterval: 2500}
ENEMY_4: {type: "fast_debuffer", x: 2, y: 1, z: -13, health: 85, shootInterval: 2500}
ENEMY_5: {type: "ninja", x: 5, y: 0, z: -10, health: 115, shootInterval: 2500}
ENEMY_6: {type: "bomb_thrower", x: 0, y: 3, z: -20, health: 160, shootInterval: 2500}

FORMATION: "6_enemy_complex_layered"
HORIZONTAL_SPREAD: 10
DEPTH_SPREAD: 10
ELEVATION_MAX: 3
ENEMY_COUNT: 6
```

### LEVEL_10_ROOM_1
```
FILE: src/data/levelRooms.js
LINE: 290-294

ENEMY_1: {type: "fast_debuffer", x: -4, y: 2, z: -11, health: 90, shootInterval: 2500}
ENEMY_2: {type: "armored", x: -1, y: 0, z: -14, health: 260, shootInterval: 2500}
ENEMY_3: {type: "bomb_thrower", x: 0, y: 3, z: -18, health: 170, shootInterval: 2500}
ENEMY_4: {type: "armored", x: 1, y: 0, z: -14, health: 260, shootInterval: 2500}
ENEMY_5: {type: "fast_debuffer", x: 4, y: 2, z: -11, health: 90, shootInterval: 2500}

FORMATION: "symmetric_multi_layer"
HORIZONTAL_SPREAD: 8
DEPTH_SPREAD: 7
ELEVATION_MAX: 3
ENEMY_COUNT: 5
```

### LEVEL_10_ROOM_2
```
FILE: src/data/levelRooms.js
LINE: 305-310

ENEMY_1: {type: "fast_debuffer", x: -5, y: 1, z: -10, health: 95, shootInterval: 2500}
ENEMY_2: {type: "ninja", x: -2, y: 2, z: -12, health: 120, shootInterval: 2500}
ENEMY_3: {type: "armored", x: 0, y: 0, z: -15, health: 280, shootInterval: 2500}
ENEMY_4: {type: "ninja", x: 2, y: 2, z: -12, health: 120, shootInterval: 2500}
ENEMY_5: {type: "fast_debuffer", x: 5, y: 1, z: -10, health: 95, shootInterval: 2500}
ENEMY_6: {type: "bomb_thrower", x: 0, y: 4, z: -20, health: 180, shootInterval: 2500}

FORMATION: "6_enemy_extreme_elevation"
HORIZONTAL_SPREAD: 10
DEPTH_SPREAD: 10
ELEVATION_MAX: 4
ENEMY_COUNT: 6
```

### LEVEL_11_ROOM_1
```
FILE: src/data/levelRooms.js
LINE: 323-327

ENEMY_1: {type: "ninja", x: -6, y: 0, z: -12, health: 125, shootInterval: 2500}
ENEMY_2: {type: "armored", x: -2, y: 1, z: -15, health: 290, shootInterval: 2500}
ENEMY_3: {type: "bomb_thrower", x: 0, y: 4, z: -19, health: 190, shootInterval: 2500}
ENEMY_4: {type: "armored", x: 2, y: 1, z: -15, health: 290, shootInterval: 2500}
ENEMY_5: {type: "ninja", x: 6, y: 0, z: -12, health: 125, shootInterval: 2500}

FORMATION: "wide_symmetric_very_high_center"
HORIZONTAL_SPREAD: 12
DEPTH_SPREAD: 7
ELEVATION_MAX: 4
ENEMY_COUNT: 5
```

### LEVEL_11_ROOM_2
```
FILE: src/data/levelRooms.js
LINE: 338-344

ENEMY_1: {type: "ninja", x: -6, y: 0, z: -11, health: 130, shootInterval: 2500}
ENEMY_2: {type: "fast_debuffer", x: -3, y: 2, z: -13, health: 100, shootInterval: 2500}
ENEMY_3: {type: "armored", x: 0, y: 0, z: -16, health: 300, shootInterval: 2500}
ENEMY_4: {type: "bomb_thrower", x: 0, y: 5, z: -21, health: 200, shootInterval: 2500}
ENEMY_5: {type: "fast_debuffer", x: 3, y: 2, z: -13, health: 100, shootInterval: 2500}
ENEMY_6: {type: "ninja", x: 6, y: 0, z: -11, health: 130, shootInterval: 2500}
ENEMY_7: {type: "armored", x: 0, y: 1, z: -25, health: 320, shootInterval: 2500}

FORMATION: "7_enemy_maximum_complexity"
HORIZONTAL_SPREAD: 12
DEPTH_SPREAD: 14
ELEVATION_MAX: 5
ENEMY_COUNT: 7
```

### LEVEL_12_ROOM_1
```
FILE: src/data/levelRooms.js
LINE: 357-362

ENEMY_1: {type: "armored", x: -5, y: 1, z: -13, health: 320, shootInterval: 2500}
ENEMY_2: {type: "ninja", x: -2, y: 2, z: -11, health: 135, shootInterval: 2500}
ENEMY_3: {type: "fast_debuffer", x: 0, y: 3, z: -17, health: 105, shootInterval: 2500}
ENEMY_4: {type: "ninja", x: 2, y: 2, z: -11, health: 135, shootInterval: 2500}
ENEMY_5: {type: "armored", x: 5, y: 1, z: -13, health: 320, shootInterval: 2500}
ENEMY_6: {type: "bomb_thrower", x: 0, y: 5, z: -23, health: 220, shootInterval: 2500}

FORMATION: "final_challenge_complexity"
HORIZONTAL_SPREAD: 10
DEPTH_SPREAD: 12
ELEVATION_MAX: 5
ENEMY_COUNT: 6
```

### LEVEL_12_ROOM_2_FINAL_BOSS
```
FILE: src/data/levelRooms.js
LINE: 374-381

ENEMY_1: {type: "boss", x: 0, y: 2, z: -20, health: 800, shootInterval: 2500, isBoss: true, phases: 3, specialAttacks: ["laser_barrage", "missile_swarm", "teleport_strike"], notes: "THE_ARCHITECT"}

FORMATION: "solo_final_boss"
BOSS_ELEVATION: 2
BOSS_DISTANCE: 20
ENEMY_COUNT: 1
BOSS_PRESENT: true
FINAL_BOSS: true
```

---

## WEAPON_PICKUP_POSITIONS

```
LEVEL_1_ROOM_2: {weaponType: "shotgun", x: -8, y: 6, z: -50, file: "levelRooms.js", line: 32, status: "FIXED"}
LEVEL_2_ROOM_2: {weaponType: "rapidfire", x: 8, y: 5, z: -55, file: "levelRooms.js", line: 63, status: "FIXED"}
LEVEL_3_ROOM_1: {weaponType: "grappling", x: 0, y: 7, z: -48, file: "levelRooms.js", line: 81, status: "FIXED"}

SPACING_L1_TO_L2: 16.79
SPACING_L2_TO_L3: 10.82
SPACING_L1_TO_L3: 8.31

BUG_FIXED: "All pickups were at (-8,6,-50), now properly separated"
```

---

## PUZZLE_TARGET_POSITIONS

### LEVEL_1_TARGETS
```
FILE: src/data/puzzleConfigs.js
LINE: 143-149

TARGET_1: {id: "target_1_1", x: -3, y: 2, z: 5, color: 0x00ff00, size: 0.8, sequence: 1, notes: "green_left"}
TARGET_2: {id: "target_1_2", x: 0, y: 2.5, z: 5, color: 0xffff00, size: 0.8, sequence: 2, notes: "yellow_center_elevated"}
TARGET_3: {id: "target_1_3", x: 3, y: 2, z: 5, color: 0xff0000, size: 0.8, sequence: 3, notes: "red_right"}

FORMATION: "horizontal_line"
Z_DISTANCE_FROM_CAMERA: 5
HORIZONTAL_SPREAD: 6
VERTICAL_SPREAD: 0.5
WARNING: "POSITIVE_Z_VALUES (in front of camera, opposite of enemies)"
```

### LEVEL_2_TARGETS
```
FILE: src/data/puzzleConfigs.js

TARGET_1: {x: -4, y: 1.5, z: 6, color: 0x0000ff, size: 0.7, sequence: 1, notes: "blue_bottom_left"}
TARGET_2: {x: -1.5, y: 3, z: 6, color: 0xff00ff, size: 0.7, sequence: 2, notes: "magenta_top_left"}
TARGET_3: {x: 1.5, y: 3, z: 6, color: 0x00ffff, size: 0.7, sequence: 3, notes: "cyan_top_right"}
TARGET_4: {x: 4, y: 1.5, z: 6, color: 0xffa500, size: 0.7, sequence: 4, notes: "orange_bottom_right"}

FORMATION: "diamond"
Z_DISTANCE_FROM_CAMERA: 6
HORIZONTAL_SPREAD: 8
VERTICAL_SPREAD: 1.5
```

### LEVEL_3_TARGETS
```
FILE: src/data/puzzleConfigs.js

TARGET_1: {x: 0, y: 4, z: 7, color: 0xff0000, size: 0.6, sequence: 1, notes: "red_top_center"}
TARGET_2: {x: -3, y: 2.5, z: 7, color: 0x00ff00, size: 0.6, sequence: 2, notes: "green_left_mid"}
TARGET_3: {x: -2, y: 0.5, z: 7, color: 0x0000ff, size: 0.6, sequence: 3, notes: "blue_bottom_left"}
TARGET_4: {x: 2, y: 0.5, z: 7, color: 0xffff00, size: 0.6, sequence: 4, notes: "yellow_bottom_right"}
TARGET_5: {x: 3, y: 2.5, z: 7, color: 0xff00ff, size: 0.6, sequence: 5, notes: "magenta_right_mid"}

FORMATION: "pentagon"
Z_DISTANCE_FROM_CAMERA: 7
HORIZONTAL_SPREAD: 6
VERTICAL_SPREAD: 3.5
```

---

## CRITICAL_POSITION_ISSUES

```
ISSUE_1: {
  name: "Weapon Pickup Overlap",
  status: "FIXED",
  file: "src/data/levelRooms.js",
  lines: [32, 63, 81],
  before: "All at (-8, 6, -50)",
  after: "L1(-8,6,-50), L2(8,5,-55), L3(0,7,-48)",
  spacing: "8-17 units"
}

ISSUE_2: {
  name: "Enemy Formation Offset",
  status: "ALREADY_FIXED",
  file: "src/data/roomConfigs.js",
  note: "All formations add -12 Z offset to prevent camera overlap",
  reason: "Historical bug fix"
}
```

---

## POSITION_VALIDATION_QUERIES

```
QUERY: "Is position valid for enemy?"
CHECK: {x: [-10,10], y: [0,6], z: [-25,-8], min_distance_to_others: 2}

QUERY: "Is position valid for item?"
CHECK: {x: [-12,12], y: [0.5,6], z: [-195,-10], min_distance_to_others: 1}

QUERY: "Is position valid for weapon pickup?"
CHECK: {x: [-10,10], y: [5,7], z: [-60,-40], min_distance_to_others: 10}

QUERY: "Is position valid for puzzle target?"
CHECK: {x: [-4,4], y: [0.5,4], z: [5,10], min_distance_to_others: 1.5, WARNING: "MUST_BE_POSITIVE_Z"}

QUERY: "Calculate distance between two positions"
FORMULA: "sqrt((x2-x1)^2 + (y2-y1)^2 + (z2-z1)^2)"
```

---

## POSITION_LOOKUP_SHORTCUTS

```
GET_ALL_ENEMIES_LEVEL_1: "levelRooms.js lines 14-29"
GET_ALL_ENEMIES_LEVEL_2: "levelRooms.js lines 44-60"
GET_ALL_ENEMIES_LEVEL_3: "levelRooms.js lines 76-94"
GET_ALL_ITEMS_LEVEL_1: "levelItems.js lines 3-38"
GET_ALL_ITEMS_LEVEL_2: "levelItems.js lines 40-87"
GET_ALL_ITEMS_LEVEL_3: "levelItems.js lines 90-137"
GET_WEAPON_PICKUPS: "levelRooms.js lines 32, 63, 81"
GET_PUZZLE_TARGETS_L1: "puzzleConfigs.js lines 143-149"
GET_BOSS_POSITIONS: "levelRooms.js lines 93 (L3), 173 (L6), 265 (L9), 374 (L12)"
```

---

END LLM_POSITION_DATABASE
