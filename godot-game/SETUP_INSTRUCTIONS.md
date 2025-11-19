# Godot Project Setup Instructions

## Quick Start

### 1. Open Project in Godot

```bash
cd godot-game
godot project.godot
```

Or open the `project.godot` file through the Godot Project Manager.

### 2. Configure Autoloads (REQUIRED)

The game uses several singleton systems that must be set up as autoloads.

**In Godot Editor:**
1. Go to **Project → Project Settings**
2. Click the **Autoload** tab
3. Add these autoloads in order:

| Name | Path | Enabled |
|------|------|---------|
| `GameManager` | `res://scripts/systems/game_manager.gd` | ✅ |
| `ComboSystem` | `res://scripts/systems/combo_system.gd` | ✅ |
| `WeaponSystem` | `res://scripts/systems/weapon_system.gd` | ✅ |
| `ScreenShake` | `res://scripts/systems/screen_shake.gd` | ✅ |

**How to add an autoload:**
1. Click "Add" button (or click the folder icon)
2. Navigate to the script file
3. Set the "Node Name" field (e.g., "GameManager")
4. Check "Enable"
5. Click "Add"

### 3. Create Required Scenes

The scripts reference scene files that need to be created. Here's what to build:

#### A. Player Scene (`scenes/player/player.tscn`)

```
Player (CharacterBody3D)
├── CollisionShape3D
├── Camera3D
│   ├── WeaponHolder (Node3D)
│   │   └── (weapon meshes will go here)
│   └── RayCast3D
└── Script: res://scripts/player_controller.gd
```

**Player Setup:**
- Add `player_controller.gd` script
- Set collision layer to 2 (Player)
- Set collision mask to 1, 4 (World, Enemy)
- Add to group "player"
- RayCast3D: target_position = (0, 0, -100)

#### B. Enemy Scenes

**Basic Shooter** (`scenes/enemies/basic_shooter.tscn`)
```
BasicShooter (CharacterBody3D)
├── CollisionShape3D
├── MeshInstance3D (body)
│   ├── MeshInstance3D (head)
│   └── MeshInstance3D (weapon)
└── Script: res://scripts/enemies/basic_shooter.gd
```

**Armored Enemy** (`scenes/enemies/armored_enemy.tscn`)
- Same structure as BasicShooter
- Script: `res://scripts/enemies/armored_enemy.gd`
- Larger collision shape

**Ninja Enemy** (`scenes/enemies/ninja_enemy.tscn`)
- Same structure
- Script: `res://scripts/enemies/ninja_enemy.gd`
- Smaller, faster

**Enemy Setup (all types):**
- Collision layer: 4 (Enemy)
- Collision mask: 1, 2 (World, Player)
- Add to group "enemy"

#### C. Projectile Scene (`scenes/projectile.tscn`)

```
Projectile (Area3D)
├── CollisionShape3D (small sphere)
├── MeshInstance3D (sphere or capsule)
└── Script: res://scripts/projectile.gd
```

**Projectile Setup:**
- Small sphere collision shape (radius: 0.1)
- Mesh: CSGSphere or simple sphere mesh
- Monitoring enabled

#### D. UI Scenes

**HUD** (`scenes/ui/hud.tscn`)
```
HUD (Control)
├── MarginContainer
│   ├── VBoxContainer (Bottom Left)
│   │   ├── HealthBar (ProgressBar)
│   │   │   └── HealthLabel (Label)
│   │   ├── WeaponNameLabel (Label)
│   │   └── AmmoLabel (Label)
│   └── TopRight (VBoxContainer)
│       ├── ComboLabel (Label)
│       ├── ScoreLabel (Label)
│       └── CurrencyLabel (Label)
└── Crosshair (TextureRect, centered)
```
- Script: `res://scripts/ui/hud.gd`

**Main Menu** (`scenes/ui/main_menu.tscn`)
```
MainMenu (Control)
└── VBoxContainer (centered)
    ├── StartButton (Button)
    ├── LevelSelectButton (Button)
    ├── SettingsButton (Button)
    └── QuitButton (Button)
```
- Script: `res://scripts/ui/main_menu.gd`

**Shop UI** (`scenes/ui/shop_ui.tscn`)
```
ShopUI (Control)
└── Panel (centered)
    └── VBoxContainer
        ├── CurrencyLabel (Label)
        ├── ScrollContainer
        │   └── ItemList (VBoxContainer)
        └── CloseButton (Button)
```
- Script: `res://scripts/ui/shop_ui.gd`

#### E. Main Game Scene (`scenes/game.tscn`)

```
Game (Node3D)
├── Player (instance of player.tscn)
├── RoomManager (Node3D)
│   ├── Floor (CSGBox3D or MeshInstance3D)
│   ├── Walls (CSGBox3D or MeshInstance3D)
│   ├── Lighting (DirectionalLight3D, etc.)
│   └── SpawnPoint1-5 (Marker3D, group: "spawn_point")
├── WorldEnvironment
└── HUD (CanvasLayer → instance of hud.tscn)
```
- RoomManager script: `res://scripts/systems/room_manager.gd`

#### F. Main Menu Scene (`scenes/main.tscn`)

```
Main (Control)
└── MainMenu (instance of main_menu.tscn)
```

Set this as the main scene in Project Settings.

### 4. Test the Project

**Basic Test Flow:**
1. Press F5 (or Play button)
2. Should load main menu
3. Click "Start Game"
4. Should load game scene
5. Enemies should spawn
6. Shooting should work
7. Combo system should track kills

**If errors occur:**
- Check Output console for missing references
- Verify all autoloads are configured
- Ensure all scene paths are correct
- Check that groups are assigned ("player", "enemy")

### 5. Physics Layers Reference

Configure in Project Settings → Layer Names → 3D Physics:

| Layer # | Name | Purpose |
|---------|------|---------|
| 1 | World | Static environment |
| 2 | Player | Player character |
| 3 | Enemy | Enemy characters |
| 4 | Projectile | Bullets/projectiles |
| 5 | Pickup | Items to collect |
| 6 | Puzzle | Puzzle elements |

### 6. Recommended Settings

**Display Settings:**
- Window Size: 1920×1080
- Mode: Exclusive Fullscreen or Windowed
- Stretch Mode: canvas_items

**Rendering:**
- Renderer: Forward+
- MSAA 3D: 2x or 4x (for better quality)
- Anti-Aliasing: TAA or FXAA

**Input Map:**
Already configured in `project.godot`, but verify:
- WASD for movement
- Mouse button 1 for shoot
- R for reload
- E for weapon switch
- Space for dodge
- ESC for pause

## Common Issues & Fixes

### "Invalid get index 'player_health' (on base: 'null instance')"
- **Fix**: Autoloads not configured. Follow step 2.

### "Cannot call method 'try_fire' on a null value"
- **Fix**: WeaponSystem autoload missing or player script can't find it.

### Enemies not spawning
- **Fix**:
  - Check enemy scene paths in `room_manager.gd`
  - Ensure spawn points exist (Marker3D with group "spawn_point")
  - Check RoomManager's `start_room()` is being called

### Player can't shoot
- **Fix**:
  - Verify RayCast3D is child of Camera3D
  - Check RayCast3D is enabled and target_position is set
  - Ensure enemies have collision layer 4 (Enemy)

### No HUD visible
- **Fix**:
  - HUD should be in CanvasLayer
  - Check HUD scene is instanced in game scene
  - Verify HUD script can find autoloads

## Next Steps

After basic setup:
1. Create proper 3D models for enemies
2. Add particle effects
3. Add sound effects
4. Create more levels
5. Add boss fights
6. Implement puzzles
7. Add story dialogue system

## Help & Resources

- **Godot Documentation**: https://docs.godotengine.org/
- **GDScript Reference**: https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/
- **Godot Q&A**: https://ask.godotengine.org/
