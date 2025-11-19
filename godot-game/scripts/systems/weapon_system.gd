extends Node
## WeaponSystem - Manages weapon stats, unlocks, and switching
##
## Features:
## - Multiple weapon types with unique stats
## - Weapon unlocking system
## - Ammo management
## - Reload system
## - Weapon switching

signal weapon_switched(weapon_name: String)
signal weapon_fired(weapon_name: String, ammo_remaining: int)
signal weapon_reload_started(weapon_name: String, reload_time: float)
signal weapon_reload_complete(weapon_name: String)
signal weapon_unlocked(weapon_name: String)
signal ammo_changed(current_ammo: int, max_ammo: int)

# Weapon definitions
const WEAPON_DATA: Dictionary = {
	"pistol": {
		"damage": 10,
		"fire_rate": 0.15,  # Seconds between shots
		"reload_time": 1.0,
		"max_ammo": 15,
		"projectile_speed": 100.0,
		"spread": 0.0,
		"auto_fire": false,
		"unlocked": true
	},
	"shotgun": {
		"damage": 8,
		"pellets": 8,  # Multi-projectile
		"fire_rate": 0.8,
		"reload_time": 2.0,
		"max_ammo": 6,
		"projectile_speed": 80.0,
		"spread": 0.15,
		"auto_fire": false,
		"unlocked": false
	},
	"rapid_fire": {
		"damage": 6,
		"fire_rate": 0.08,
		"reload_time": 1.5,
		"max_ammo": 50,
		"projectile_speed": 120.0,
		"spread": 0.05,
		"auto_fire": true,
		"unlocked": false
	},
	"grappling_hook": {
		"damage": 15,
		"fire_rate": 1.2,
		"reload_time": 0.5,
		"max_ammo": 10,
		"projectile_speed": 150.0,
		"spread": 0.0,
		"auto_fire": false,
		"special": "pull_enemy",
		"unlocked": false
	}
}

# Current weapon state
var current_weapon: String = "pistol"
var unlocked_weapons: Array[String] = ["pistol"]
var weapon_ammo: Dictionary = {}
var is_reloading: bool = false
var can_fire: bool = true
var fire_cooldown: float = 0.0


func _ready() -> void:
	# Initialize ammo for all weapons
	for weapon_name in WEAPON_DATA.keys():
		weapon_ammo[weapon_name] = WEAPON_DATA[weapon_name]["max_ammo"]


func _process(delta: float) -> void:
	# Update fire cooldown
	if fire_cooldown > 0:
		fire_cooldown -= delta
		if fire_cooldown <= 0:
			can_fire = true


## Try to fire current weapon
func try_fire() -> bool:
	if not can_fire or is_reloading:
		return false

	var weapon = WEAPON_DATA[current_weapon]
	var current_ammo = weapon_ammo[current_weapon]

	# Check ammo
	if current_ammo <= 0:
		# Auto-reload if empty
		reload()
		return false

	# Consume ammo
	weapon_ammo[current_weapon] -= 1
	current_ammo = weapon_ammo[current_weapon]

	# Start cooldown
	fire_cooldown = weapon["fire_rate"]
	can_fire = false

	# Emit signals
	weapon_fired.emit(current_weapon, current_ammo)
	ammo_changed.emit(current_ammo, weapon["max_ammo"])

	return true


## Reload current weapon
func reload() -> void:
	if is_reloading:
		return

	var weapon = WEAPON_DATA[current_weapon]

	# Check if already full
	if weapon_ammo[current_weapon] >= weapon["max_ammo"]:
		return

	is_reloading = true
	weapon_reload_started.emit(current_weapon, weapon["reload_time"])

	# Start reload timer
	await get_tree().create_timer(weapon["reload_time"]).timeout

	# Complete reload
	weapon_ammo[current_weapon] = weapon["max_ammo"]
	is_reloading = false

	weapon_reload_complete.emit(current_weapon)
	ammo_changed.emit(weapon_ammo[current_weapon], weapon["max_ammo"])


## Switch to next weapon
func switch_weapon(weapon_name: String) -> bool:
	if weapon_name == current_weapon:
		return false

	if weapon_name not in WEAPON_DATA:
		return false

	if not WEAPON_DATA[weapon_name]["unlocked"]:
		return false

	# Cancel current reload
	is_reloading = false
	fire_cooldown = 0.3  # Small delay when switching

	current_weapon = weapon_name
	weapon_switched.emit(current_weapon)
	ammo_changed.emit(weapon_ammo[current_weapon], WEAPON_DATA[current_weapon]["max_ammo"])

	return true


## Switch to next unlocked weapon
func next_weapon() -> void:
	var current_index = unlocked_weapons.find(current_weapon)
	var next_index = (current_index + 1) % unlocked_weapons.size()
	switch_weapon(unlocked_weapons[next_index])


## Unlock weapon
func unlock_weapon(weapon_name: String) -> bool:
	if weapon_name not in WEAPON_DATA:
		return false

	if WEAPON_DATA[weapon_name]["unlocked"]:
		return false  # Already unlocked

	WEAPON_DATA[weapon_name]["unlocked"] = true
	unlocked_weapons.append(weapon_name)
	weapon_unlocked.emit(weapon_name)

	return true


## Get current weapon stats
func get_current_weapon_stats() -> Dictionary:
	return WEAPON_DATA[current_weapon].duplicate()


## Get current ammo
func get_current_ammo() -> int:
	return weapon_ammo[current_weapon]


## Get max ammo for current weapon
func get_max_ammo() -> int:
	return WEAPON_DATA[current_weapon]["max_ammo"]


## Check if weapon can fire
func can_fire_weapon() -> bool:
	return can_fire and not is_reloading and weapon_ammo[current_weapon] > 0


## Add ammo to current weapon
func add_ammo(amount: int) -> void:
	var weapon = WEAPON_DATA[current_weapon]
	weapon_ammo[current_weapon] = min(
		weapon_ammo[current_weapon] + amount,
		weapon["max_ammo"]
	)
	ammo_changed.emit(weapon_ammo[current_weapon], weapon["max_ammo"])
