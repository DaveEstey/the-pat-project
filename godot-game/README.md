# PAT Project - Godot Edition

A complete reimagining of the original Three.js/React web game in Godot 4.

## 📋 Overview

This is a **first-person shooter** with room-based progression, featuring:
- Multiple weapon types with unique characteristics
- Diverse enemy AI with different behaviors
- Combo system with score multipliers
- Shop for upgrades between levels
- Boss fights with special mechanics
- Puzzle elements
- Polish effects (screen shake, particles, etc.)

## 🎮 Game Features

### Core Gameplay
- **First-person shooter controls** - WASD movement, mouse aim, left-click to shoot
- **On-rails progression** - Auto-advance through rooms with enemy waves
- **Weapon variety** - Pistol, Shotgun, Rapid Fire, Grappling Hook
- **Enemy types** - Basic Shooter, Armored, Ninja, and more
- **Combo system** - Chain kills for score multipliers and bonuses
- **Currency system** - Earn money from kills, spend in shop

### Systems Implemented

#### ✅ Core Systems (Complete)
1. **GameManager** (`scripts/systems/game_manager.gd`)
   - Global game state management
   - Level and room progression
   - Player stats tracking
   - Currency and score management

2. **ComboSystem** (`scripts/systems/combo_system.gd`)
   - Kill chain tracking
   - Timeout management
   - Score multipliers (1x to 10x)
   - Milestone bonuses (5, 10, 25, 50, 100 kills)

3. **WeaponSystem** (`scripts/systems/weapon_system.gd`)
   - 4 weapon types with unique stats
   - Ammo management
   - Reload system
   - Weapon unlocking

4. **ScreenShake** (`scripts/systems/screen_shake.gd`)
   - Trauma-based camera shake
   - Multiple intensity levels
   - Smooth decay

5. **RoomManager** (`scripts/systems/room_manager.gd`)
   - Enemy wave spawning
   - Room progression
   - Boss room support
   - Puzzle integration hooks

#### 🎯 Player & Combat
- **PlayerController** (`scripts/player_controller.gd`)
  - FPS controls with mouse look
  - Raycast-based shooting
  - Health management
  - Damage feedback

- **Projectile** (`scripts/projectile.gd`)
  - Weapon and enemy projectiles
  - Hit detection
  - Damage application

#### 👾 Enemies
- **EnemyBase** (`scripts/enemies/enemy_base.gd`) - Base class with health, AI hooks, death
- **BasicShooter** - Strafing shooter with periodic fire
- **ArmoredEnemy** - Tanky, high health, slow movement
- **NinjaEnemy** - Fast zigzag rusher with melee attack

#### 🎨 UI Systems
- **HUD** (`scripts/ui/hud.gd`)
  - Health bar
  - Ammo counter
  - Combo display
  - Score and currency
  - Crosshair

- **MainMenu** (`scripts/ui/main_menu.gd`)
  - Start game
  - Level select
  - Settings
  - Quit

- **ShopUI** (`scripts/ui/shop_ui.gd`)
  - Weapon unlocks
  - Health restoration
  - Max health upgrades
  - Ammo refills

## 🗂️ Project Structure

```
godot-game/
├── project.godot          # Godot project configuration
├── README.md             # This file
│
├── scripts/
│   ├── systems/          # Core game systems (singletons)
│   │   ├── game_manager.gd
│   │   ├── combo_system.gd
│   │   ├── weapon_system.gd
│   │   ├── screen_shake.gd
│   │   └── room_manager.gd
│   │
│   ├── enemies/          # Enemy scripts
│   │   ├── enemy_base.gd
│   │   ├── basic_shooter.gd
│   │   ├── armored_enemy.gd
│   │   └── ninja_enemy.gd
│   │
│   ├── ui/              # UI scripts
│   │   ├── hud.gd
│   │   ├── main_menu.gd
│   │   └── shop_ui.gd
│   │
│   ├── player_controller.gd
│   └── projectile.gd
│
├── scenes/              # Godot scene files (.tscn)
│   ├── main.tscn       # Main menu scene
│   ├── game.tscn       # Main game scene
│   ├── player/         # Player scenes
│   ├── enemies/        # Enemy scenes
│   ├── ui/            # UI scenes
│   ├── levels/        # Level scenes
│   └── rooms/         # Room scenes
│
└── assets/            # Game assets
    ├── models/        # 3D models
    ├── textures/      # Textures
    ├── sounds/        # Sound effects
    └── particles/     # Particle effects
```

## 🎯 Input Mapping

| Action | Key/Button |
|--------|------------|
| Move Forward | W |
| Move Back | S |
| Strafe Left | A |
| Strafe Right | D |
| Shoot | Left Mouse Button |
| Reload | R |
| Next Weapon | E |
| Dodge | Space |
| Pause | ESC |

## 🚀 Getting Started

### Requirements
- **Godot 4.2+** (Forward+ renderer)
- Modern GPU with OpenGL 4.3+ or Vulkan support

### Setup Instructions

1. **Open in Godot**
   ```bash
   # Navigate to the godot-game folder
   cd godot-game

   # Open with Godot Editor
   godot project.godot
   ```

2. **Configure Autoloads**
   In Godot Editor:
   - Go to Project → Project Settings → Autoload
   - Add the following singletons:
     - `GameManager` → `res://scripts/systems/game_manager.gd`
     - `ComboSystem` → `res://scripts/systems/combo_system.gd`
     - `WeaponSystem` → `res://scripts/systems/weapon_system.gd`
     - `ScreenShake` → `res://scripts/systems/screen_shake.gd`

3. **Create Scene Files** (TODO)
   - Player scene with Camera3D, RayCast3D
   - Enemy scenes with mesh and collision
   - UI scenes for HUD, menus
   - Room/level scenes

4. **Run the Game**
   - Press F5 or click the Play button in Godot Editor

## 🎨 Weapon Stats

| Weapon | Damage | Fire Rate | Ammo | Special |
|--------|--------|-----------|------|---------|
| **Pistol** | 10 | 0.15s | 15 | Default weapon |
| **Shotgun** | 8×8 | 0.8s | 6 | 8 pellets, spread |
| **Rapid Fire** | 6 | 0.08s | 50 | Auto-fire, high RoF |
| **Grappling Hook** | 15 | 1.2s | 10 | Pull enemies toward you |

## 👾 Enemy Types

| Enemy | Health | Speed | Behavior |
|-------|--------|-------|----------|
| **Basic Shooter** | 30 | Medium | Strafe side-to-side, periodic fire |
| **Armored** | 80 | Slow | Tank, 50% damage reduction |
| **Ninja** | 20 | Fast | Zigzag rush, melee attack |

## 💰 Combo System

- **Combo Timeout**: 3 seconds
- **Multipliers**:
  - 0-2 kills: 1.0x
  - 3-4 kills: 1.5x
  - 5-9 kills: 2.0x
  - 10-14 kills: 2.5x
  - 15-24 kills: 3.0x
  - 25-49 kills: 4.0x
  - 50-99 kills: 5.0x
  - 100+ kills: 10.0x

- **Milestone Bonuses**:
  - 5 kills: +500 points
  - 10 kills: +1,500 points
  - 25 kills: +5,000 points
  - 50 kills: +15,000 points
  - 100 kills: +50,000 points

## 🛠️ Development Notes

### Differences from Original Web Game
- **Godot native physics** instead of Three.js custom collision
- **GDScript** instead of JavaScript
- **Scene-based architecture** instead of React components
- **Built-in animation** instead of custom tweens
- **Godot particles** instead of custom particle system

### Original Game Features (To Implement)
- [ ] Boss fights with intro sequences
- [ ] Puzzle switch sequences
- [ ] Story dialogue system
- [ ] Multiple levels (12 total)
- [ ] Secret rooms
- [ ] Achievements
- [ ] Skill tree
- [ ] New Game+ mode

### Polish To Add
- [ ] Particle effects (muzzle flash, blood, explosions)
- [ ] Sound effects and music
- [ ] Advanced enemy AI behaviors
- [ ] Improved 3D models
- [ ] Post-processing effects
- [ ] Damage indicators
- [ ] Boss health bars

## 📝 License

This is a reimagining of the original web game project.

## 🤝 Credits

- **Original Game**: Three.js/React web version
- **Godot Port**: Complete reimplementation in Godot 4
- **Engine**: Godot Engine 4.2+
