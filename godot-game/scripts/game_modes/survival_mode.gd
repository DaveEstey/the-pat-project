extends Node
## SurvivalMode - Endless wave survival game mode
##
## Features:
## - Infinite waves with increasing difficulty
## - Wave breaks for shopping
## - Leaderboard integration
## - Escalating enemy counts and types

signal wave_started(wave_number: int)
signal wave_completed(wave_number: int)
signal survival_ended(final_wave: int, final_score: int)

var is_active: bool = false
var current_wave: int = 0
var enemies_remaining: int = 0
var wave_break_duration: float = 15.0
var in_wave_break: bool = false
var break_timer: float = 0.0

# Difficulty scaling
var base_enemies_per_wave: int = 5
var enemy_increase_per_wave: int = 2
var max_enemies_per_wave: int = 50


func _process(delta: float) -> void:
	if not is_active:
		return

	if in_wave_break:
		break_timer -= delta

		if break_timer <= 0:
			start_next_wave()


## Start survival mode
func start_survival() -> void:
	is_active = true
	current_wave = 0
	in_wave_break = false

	# Reset player stats
	var game_manager = get_node_or_null("/root/GameManager")
	if game_manager:
		game_manager.player_health = game_manager.player_max_health
		game_manager.player_score = 0

	print("[Survival] Starting survival mode!")

	start_next_wave()


## Start next wave
func start_next_wave() -> void:
	current_wave += 1
	in_wave_break = false

	# Calculate enemies for this wave
	var enemy_count = min(
		base_enemies_per_wave + (enemy_increase_per_wave * (current_wave - 1)),
		max_enemies_per_wave
	)

	enemies_remaining = enemy_count

	wave_started.emit(current_wave)

	print("[Survival] Wave %d started! %d enemies" % [current_wave, enemy_count])

	# Spawn enemies
	spawn_wave_enemies(enemy_count)


## Spawn enemies for current wave
func spawn_wave_enemies(count: int) -> void:
	# Get available enemy types based on wave number
	var available_enemies = get_enemy_types_for_wave(current_wave)

	# Spawn enemies with delays
	for i in range(count):
		await get_tree().create_timer(0.5).timeout

		var enemy_type = available_enemies[randi() % available_enemies.size()]
		spawn_enemy(enemy_type)


## Get enemy types available for current wave
func get_enemy_types_for_wave(wave: int) -> Array[String]:
	var types: Array[String] = ["basic_shooter"]

	if wave >= 2:
		types.append("armored")
	if wave >= 3:
		types.append("ninja")
	if wave >= 5:
		types.append("fast_debuffer")
	if wave >= 7:
		types.append("bomb_thrower")
	if wave >= 10:
		types.append("sniper")
	if wave >= 12:
		types.append("shield")

	return types


## Spawn single enemy
func spawn_enemy(enemy_type: String) -> void:
	# TODO: Actually spawn enemy node
	print("[Survival] Spawned: ", enemy_type)


## Enemy killed (called externally)
func on_enemy_killed() -> void:
	if not is_active:
		return

	enemies_remaining -= 1

	if enemies_remaining <= 0:
		complete_wave()


## Complete current wave
func complete_wave() -> void:
	wave_completed.emit(current_wave)

	print("[Survival] Wave %d completed!" % current_wave)

	# Start wave break
	in_wave_break = true
	break_timer = wave_break_duration

	# Award bonus currency
	var game_manager = get_node_or_null("/root/GameManager")
	if game_manager:
		var bonus = 100 * current_wave
		game_manager.add_currency(bonus)


## End survival (player died)
func end_survival() -> void:
	if not is_active:
		return

	var game_manager = get_node_or_null("/root/GameManager")
	var final_score = game_manager.player_score if game_manager else 0

	survival_ended.emit(current_wave, final_score)

	is_active = false

	print("[Survival] Survival ended! Reached wave %d" % current_wave)


## Get current wave info
func get_wave_info() -> Dictionary:
	return {
		"wave": current_wave,
		"enemies_remaining": enemies_remaining,
		"in_break": in_wave_break,
		"break_time": break_timer
	}
