extends Node3D
## RoomManager - Manages room-based progression and enemy spawning
##
## Features:
## - Enemy wave spawning
## - Room completion detection
## - Door/progression control
## - Puzzle integration
## - Boss room handling

signal room_started()
signal room_cleared()
signal wave_started(wave_number: int)
signal wave_cleared()
signal all_enemies_killed()

@export var room_number: int = 1
@export var is_boss_room: bool = false
@export var has_puzzle: bool = false

# Room state
var is_active: bool = false
var is_cleared: bool = false
var current_wave: int = 0
var total_waves: int = 3

# Enemy spawning
var enemies_in_room: Array[Node] = []
var spawn_points: Array[Vector3] = []
var wave_in_progress: bool = false

# Enemy types per wave
var wave_configs: Array[Dictionary] = [
	# Wave 1
	{
		"enemies": [
			{"type": "basic_shooter", "count": 3},
		],
		"delay_between_spawns": 0.5
	},
	# Wave 2
	{
		"enemies": [
			{"type": "basic_shooter", "count": 2},
			{"type": "ninja", "count": 2},
		],
		"delay_between_spawns": 0.5
	},
	# Wave 3
	{
		"enemies": [
			{"type": "basic_shooter", "count": 2},
			{"type": "armored", "count": 1},
			{"type": "ninja", "count": 3},
		],
		"delay_between_spawns": 0.3
	}
]

# Systems
var game_manager: Node

# Enemy scenes
var enemy_scenes: Dictionary = {
	"basic_shooter": preload("res://scenes/enemies/basic_shooter.tscn"),
	"armored": preload("res://scenes/enemies/armored_enemy.tscn"),
	"ninja": preload("res://scenes/enemies/ninja_enemy.tscn")
}


func _ready() -> void:
	game_manager = get_node_or_null("/root/GameManager")

	# Find spawn points (Marker3D nodes with group "spawn_point")
	for child in get_children():
		if child is Marker3D and child.is_in_group("spawn_point"):
			spawn_points.append(child.global_position)

	# If no spawn points defined, create default positions
	if spawn_points.is_empty():
		create_default_spawn_points()


## Create default spawn points
func create_default_spawn_points() -> void:
	spawn_points = [
		Vector3(-8, 0, -20),
		Vector3(-4, 0, -20),
		Vector3(0, 0, -20),
		Vector3(4, 0, -20),
		Vector3(8, 0, -20),
	]


## Start the room
func start_room() -> void:
	if is_active:
		return

	is_active = true
	current_wave = 0
	is_cleared = false

	room_started.emit()

	# Start first wave
	start_next_wave()


## Start next enemy wave
func start_next_wave() -> void:
	if current_wave >= wave_configs.size():
		# All waves complete
		complete_room()
		return

	wave_in_progress = true
	wave_started.emit(current_wave + 1)

	# Spawn enemies for this wave
	var wave_config = wave_configs[current_wave]
	spawn_wave(wave_config)

	current_wave += 1


## Spawn enemies for a wave
func spawn_wave(wave_config: Dictionary) -> void:
	var delay = wave_config["delay_between_spawns"]
	var spawn_index = 0

	for enemy_config in wave_config["enemies"]:
		var enemy_type = enemy_config["type"]
		var count = enemy_config["count"]

		for i in range(count):
			# Spawn enemy after delay
			await get_tree().create_timer(delay * spawn_index).timeout

			spawn_enemy(enemy_type)
			spawn_index += 1


## Spawn a single enemy
func spawn_enemy(enemy_type: String) -> void:
	if enemy_type not in enemy_scenes:
		print("Warning: Unknown enemy type: ", enemy_type)
		return

	# Get random spawn point
	var spawn_pos = spawn_points[randi() % spawn_points.size()]

	# Instantiate enemy
	var enemy_scene = enemy_scenes[enemy_type]
	var enemy = enemy_scene.instantiate()

	add_child(enemy)
	enemy.global_position = spawn_pos

	# Track enemy
	enemies_in_room.append(enemy)

	# Connect to enemy death
	enemy.tree_exited.connect(_on_enemy_died.bind(enemy))


## Handle enemy death
func _on_enemy_died(enemy: Node) -> void:
	enemies_in_room.erase(enemy)

	# Check if wave cleared
	if enemies_in_room.is_empty() and wave_in_progress:
		wave_in_progress = false
		wave_cleared.emit()
		all_enemies_killed.emit()

		# Start next wave after delay
		await get_tree().create_timer(2.0).timeout
		start_next_wave()


## Complete room
func complete_room() -> void:
	if is_cleared:
		return

	is_cleared = true
	is_active = false

	room_cleared.emit()

	# Notify game manager
	if game_manager:
		game_manager.complete_level()

	print("[Room] Room ", room_number, " cleared!")


## Get active enemy count
func get_enemy_count() -> int:
	return enemies_in_room.size()
