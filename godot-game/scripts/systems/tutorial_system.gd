extends Node
## TutorialSystem - Manages tutorial hints and prompts
##
## Features:
## - Context-sensitive hints
## - Progressive tutorials
## - Can be disabled by player
## - Triggered by game events

signal tutorial_shown(tutorial_id: String)
signal tutorial_completed(tutorial_id: String)

var tutorials_enabled: bool = true
var shown_tutorials: Array[String] = []
var active_tutorial: String = ""

# Tutorial definitions
const TUTORIALS: Dictionary = {
	"movement": {
		"title": "Movement",
		"text": "Use WASD to move. You can strafe left and right to dodge enemy fire.",
		"trigger": "game_start",
		"one_time": true
	},
	"shooting": {
		"title": "Shooting",
		"text": "Left-click to shoot. Aim at enemies and fire!",
		"trigger": "first_enemy_spawn",
		"one_time": true
	},
	"reload": {
		"title": "Reloading",
		"text": "Press R to reload your weapon. Don't get caught with an empty magazine!",
		"trigger": "ammo_low",
		"one_time": true
	},
	"combo": {
		"title": "Combo System",
		"text": "Chain kills together for score multipliers! Don't let the combo timeout.",
		"trigger": "first_kill",
		"one_time": true
	},
	"weapon_switch": {
		"title": "Weapon Switching",
		"text": "Press E to switch weapons. Different weapons work better for different situations.",
		"trigger": "second_weapon_unlocked",
		"one_time": true
	},
	"power_ups": {
		"title": "Power-Ups",
		"text": "Collect power-ups for temporary boosts! Look for glowing pickups.",
		"trigger": "first_power_up_spawn",
		"one_time": true
	},
	"shop": {
		"title": "Weapon Shop",
		"text": "Between levels, visit the shop to upgrade your arsenal!",
		"trigger": "first_level_complete",
		"one_time": true
	},
	"boss_fight": {
		"title": "Boss Fight!",
		"text": "This is a boss! Watch for attack patterns and phase changes.",
		"trigger": "boss_intro",
		"one_time": false  # Show for each boss
	},
	"puzzle": {
		"title": "Puzzle",
		"text": "Shoot the switches in the correct order to solve this puzzle!",
		"trigger": "puzzle_start",
		"one_time": false
	},
	"hazard": {
		"title": "Environmental Hazard",
		"text": "Watch out! Some environmental elements can damage you.",
		"trigger": "hazard_encounter",
		"one_time": true
	}
}


func _ready() -> void:
	# Connect to game events
	connect_to_game_events()


## Connect to game events that trigger tutorials
func connect_to_game_events() -> void:
	var game_manager = get_node_or_null("/root/GameManager")
	if game_manager:
		game_manager.game_state_changed.connect(_on_game_state_changed)
		game_manager.enemy_killed.connect(_on_enemy_killed)

	var weapon_system = get_node_or_null("/root/WeaponSystem")
	if weapon_system:
		weapon_system.weapon_unlocked.connect(_on_weapon_unlocked)
		weapon_system.ammo_changed.connect(_on_ammo_changed)

	var power_up_system = get_node_or_null("/root/PowerUpSystem")
	if power_up_system:
		power_up_system.power_up_collected.connect(_on_power_up_collected)


## Show tutorial by ID
func show_tutorial(tutorial_id: String) -> void:
	if not tutorials_enabled:
		return

	if tutorial_id not in TUTORIALS:
		return

	var tutorial = TUTORIALS[tutorial_id]

	# Check if one-time and already shown
	if tutorial["one_time"] and tutorial_id in shown_tutorials:
		return

	# Show tutorial
	active_tutorial = tutorial_id
	shown_tutorials.append(tutorial_id)

	tutorial_shown.emit(tutorial_id)

	print("[Tutorial] %s: %s" % [tutorial["title"], tutorial["text"]])


## Complete tutorial
func complete_tutorial(tutorial_id: String) -> void:
	if active_tutorial == tutorial_id:
		active_tutorial = ""

	tutorial_completed.emit(tutorial_id)


## Check if tutorial should be shown
func should_show_tutorial(tutorial_id: String) -> bool:
	if not tutorials_enabled:
		return false

	if tutorial_id not in TUTORIALS:
		return false

	var tutorial = TUTORIALS[tutorial_id]

	if tutorial["one_time"] and tutorial_id in shown_tutorials:
		return false

	return true


## Event handlers
func _on_game_state_changed(new_state: int) -> void:
	if new_state == 2:  # PLAYING state
		show_tutorial("movement")
		show_tutorial("shooting")


func _on_enemy_killed(_enemy_type: String, _combo: int) -> void:
	if not "shooting" in shown_tutorials:
		return

	show_tutorial("combo")


func _on_weapon_unlocked(weapon_name: String) -> void:
	if weapon_name != "pistol":  # Not the starting weapon
		show_tutorial("weapon_switch")


func _on_ammo_changed(current: int, max_ammo: int) -> void:
	if float(current) / max_ammo <= 0.2:  # 20% ammo remaining
		show_tutorial("reload")


func _on_power_up_collected(_power_up_type: String) -> void:
	show_tutorial("power_ups")


## Enable/disable tutorials
func set_tutorials_enabled(enabled: bool) -> void:
	tutorials_enabled = enabled


## Reset all tutorials
func reset_tutorials() -> void:
	shown_tutorials.clear()
	active_tutorial = ""


## Get tutorial text
func get_tutorial_text(tutorial_id: String) -> String:
	if tutorial_id in TUTORIALS:
		return TUTORIALS[tutorial_id]["text"]
	return ""


## Get tutorial title
func get_tutorial_title(tutorial_id: String) -> String:
	if tutorial_id in TUTORIALS:
		return TUTORIALS[tutorial_id]["title"]
	return ""
