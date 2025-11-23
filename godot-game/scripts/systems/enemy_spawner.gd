extends Node3D
## EnemySpawner - Spawns enemies at spawn points
##
## Features:
## - Multiple spawn points
## - Wave-based spawning
## - Enemy type variety
## - Difficulty scaling
## - Max enemy limits

signal wave_started(wave_number: int)
signal wave_completed(wave_number: int)
signal enemy_spawned(enemy: Node3D)
signal all_waves_completed()

@export var max_concurrent_enemies: int = 10
@export var spawn_radius: float = 2.0
@export var time_between_spawns: float = 1.0
@export var start_on_ready: bool = false

var current_wave: int = 0
var enemies_to_spawn: Array[Dictionary] = []
var active_enemies: Array[Node3D] = []
var spawn_timer: float = 0.0
var is_spawning: bool = false

# Wave configurations
var waves: Array[Dictionary] = [
	{
		"wave_number": 1,
		"enemies": [
			{"type": "basic_shooter", "count": 5}
		],
		"delay_before_next": 5.0
	},
	{
		"wave_number": 2,
		"enemies": [
			{"type": "basic_shooter", "count": 7},
			{"type": "ninja_enemy", "count": 2}
		],
		"delay_before_next": 5.0
	},
	{
		"wave_number": 3,
		"enemies": [
			{"type": "basic_shooter", "count": 5},
			{"type": "armored_enemy", "count": 3},
			{"type": "ninja_enemy", "count": 2}
		],
		"delay_before_next": 10.0
	}
]

# Enemy type scenes (paths to enemy scenes)
var enemy_scenes: Dictionary = {
	"basic_shooter": "res://scenes/enemies/basic_shooter.tscn",
	"armored_enemy": "res://scenes/enemies/armored_enemy.tscn",
	"ninja_enemy": "res://scenes/enemies/ninja_enemy.tscn",
	"bomb_thrower": "res://scenes/enemies/bomb_thrower.tscn",
	"shield_enemy": "res://scenes/enemies/shield_enemy.tscn",
	"sniper_enemy": "res://scenes/enemies/sniper_enemy.tscn"
}

# Spawn points (child Node3D markers)
var spawn_points: Array[Node3D] = []


func _ready() -> void:
	# Collect spawn points from children
	for child in get_children():
		if child is Node3D and child.has_meta("spawn_point"):
			spawn_points.append(child)

	# If no spawn points, use self as spawn point
	if spawn_points.is_empty():
		spawn_points.append(self)

	if start_on_ready:
		start_waves()


func _process(delta: float) -> void:
	if not is_spawning:
		return

	# Update spawn timer
	spawn_timer -= delta

	if spawn_timer <= 0 and not enemies_to_spawn.is_empty():
		spawn_next_enemy()
		spawn_timer = time_between_spawns

	# Check if wave is complete
	if enemies_to_spawn.is_empty() and active_enemies.is_empty():
		complete_current_wave()


## Start wave spawning
func start_waves() -> void:
	current_wave = 0
	start_next_wave()


## Start next wave
func start_next_wave() -> void:
	if current_wave >= waves.size():
		all_waves_completed.emit()
		print("[Spawner] All waves completed!")
		return

	var wave = waves[current_wave]
	current_wave += 1

	# Build spawn queue
	enemies_to_spawn.clear()

	for enemy_group in wave["enemies"]:
		for i in range(enemy_group["count"]):
			enemies_to_spawn.append({
				"type": enemy_group["type"]
			})

	# Shuffle spawn order
	enemies_to_spawn.shuffle()

	is_spawning = true
	spawn_timer = 0.0

	wave_started.emit(current_wave)

	print("[Spawner] Wave %d started (%d enemies)" % [current_wave, enemies_to_spawn.size()])


## Spawn next enemy from queue
func spawn_next_enemy() -> void:
	if enemies_to_spawn.is_empty():
		return

	# Check concurrent limit
	if active_enemies.size() >= max_concurrent_enemies:
		return

	var enemy_data = enemies_to_spawn.pop_front()
	spawn_enemy(enemy_data["type"])


## Spawn specific enemy type
func spawn_enemy(enemy_type: String) -> Node3D:
	if enemy_type not in enemy_scenes:
		print("[Spawner] Unknown enemy type: %s" % enemy_type)
		return null

	# TODO: Load and instantiate enemy scene
	# For now, create placeholder
	var enemy = Node3D.new()
	enemy.name = enemy_type

	# Choose random spawn point
	var spawn_point = spawn_points[randi() % spawn_points.size()]

	# Add random offset within radius
	var random_offset = Vector3(
		randf_range(-spawn_radius, spawn_radius),
		0,
		randf_range(-spawn_radius, spawn_radius)
	)

	enemy.global_position = spawn_point.global_position + random_offset

	# Add to scene
	get_tree().root.add_child(enemy)

	# Add to active enemies
	active_enemies.append(enemy)

	# Connect to enemy death signal
	if enemy.has_signal("died"):
		enemy.died.connect(_on_enemy_died.bind(enemy))

	enemy_spawned.emit(enemy)

	print("[Spawner] Spawned %s at %s" % [enemy_type, enemy.global_position])

	return enemy


## Handle enemy death
func _on_enemy_died(enemy: Node3D) -> void:
	active_enemies.erase(enemy)


## Complete current wave
func complete_current_wave() -> void:
	if not is_spawning:
		return

	is_spawning = false

	wave_completed.emit(current_wave)

	print("[Spawner] Wave %d completed!" % current_wave)

	# Start next wave after delay
	if current_wave < waves.size():
		var delay = waves[current_wave - 1].get("delay_before_next", 5.0)
		await get_tree().create_timer(delay).timeout
		start_next_wave()
	else:
		all_waves_completed.emit()


## Stop spawning
func stop_spawning() -> void:
	is_spawning = false
	enemies_to_spawn.clear()


## Clear all active enemies
func clear_all_enemies() -> void:
	for enemy in active_enemies.duplicate():
		if is_instance_valid(enemy):
			enemy.queue_free()

	active_enemies.clear()


## Add wave
func add_wave(wave_config: Dictionary) -> void:
	waves.append(wave_config)


## Get current wave number
func get_current_wave() -> int:
	return current_wave


## Get remaining enemies in wave
func get_remaining_enemies() -> int:
	return enemies_to_spawn.size() + active_enemies.size()


## Check if spawning is active
func is_wave_active() -> bool:
	return is_spawning
