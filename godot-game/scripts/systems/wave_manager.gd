extends Node
## WaveManager - Global wave-based enemy management
##
## Features:
## - Coordinates multiple spawners
## - Dynamic difficulty scaling
## - Boss waves
## - Endless mode support
## - Wave rewards

signal wave_started(wave_number: int, wave_data: Dictionary)
signal wave_completed(wave_number: int, rewards: Dictionary)
signal boss_wave_started(boss_type: String)
signal endless_mode_started()

var current_wave: int = 0
var is_endless_mode: bool = false
var difficulty_multiplier: float = 1.0

# Wave templates for procedural generation
const WAVE_TEMPLATES: Dictionary = {
	"easy": {
		"total_enemies": 8,
		"enemy_types": ["basic_shooter"],
		"elite_chance": 0.0
	},
	"medium": {
		"total_enemies": 12,
		"enemy_types": ["basic_shooter", "ninja_enemy", "armored_enemy"],
		"elite_chance": 0.1
	},
	"hard": {
		"total_enemies": 16,
		"enemy_types": ["basic_shooter", "ninja_enemy", "armored_enemy", "bomb_thrower"],
		"elite_chance": 0.2
	},
	"very_hard": {
		"total_enemies": 20,
		"enemy_types": ["armored_enemy", "bomb_thrower", "shield_enemy", "sniper_enemy"],
		"elite_chance": 0.3
	}
}

# Boss waves (every 5 waves)
const BOSS_WAVES: Dictionary = {
	5: "underground_guardian",
	10: "phantom_lord",
	15: "temple_ancient",
	20: "ultimate_adversary"
}

# Active spawners
var spawners: Array[Node] = []


## Start wave system
func start_waves(p_endless_mode: bool = false) -> void:
	is_endless_mode = p_endless_mode
	current_wave = 0

	if is_endless_mode:
		endless_mode_started.emit()
		print("[WaveManager] Endless mode started")

	start_next_wave()


## Start next wave
func start_next_wave() -> void:
	current_wave += 1

	# Check for boss wave
	if current_wave in BOSS_WAVES and not is_endless_mode:
		start_boss_wave(BOSS_WAVES[current_wave])
		return

	# Generate wave
	var wave_data = generate_wave(current_wave)

	# Distribute enemies to spawners
	distribute_wave_to_spawners(wave_data)

	wave_started.emit(current_wave, wave_data)

	print("[WaveManager] Wave %d started" % current_wave)


## Generate wave configuration
func generate_wave(wave_number: int) -> Dictionary:
	# Calculate difficulty
	var template_name = get_difficulty_template(wave_number)
	var template = WAVE_TEMPLATES[template_name]

	# Scale with difficulty multiplier
	var total_enemies = int(template["total_enemies"] * difficulty_multiplier)

	# Generate enemy composition
	var enemy_composition: Dictionary = {}

	for i in range(total_enemies):
		# Random enemy type from template
		var enemy_type = template["enemy_types"][randi() % template["enemy_types"].size()]

		# Check for elite variant
		if randf() < template["elite_chance"]:
			enemy_type += "_elite"

		# Add to composition
		if enemy_type not in enemy_composition:
			enemy_composition[enemy_type] = 0
		enemy_composition[enemy_type] += 1

	return {
		"wave_number": wave_number,
		"total_enemies": total_enemies,
		"enemy_composition": enemy_composition,
		"template": template_name
	}


## Get difficulty template based on wave number
func get_difficulty_template(wave_number: int) -> String:
	if wave_number <= 3:
		return "easy"
	elif wave_number <= 7:
		return "medium"
	elif wave_number <= 12:
		return "hard"
	else:
		return "very_hard"


## Distribute wave to spawners
func distribute_wave_to_spawners(wave_data: Dictionary) -> void:
	if spawners.is_empty():
		print("[WaveManager] No spawners registered!")
		return

	var enemy_composition = wave_data["enemy_composition"]

	# Evenly distribute enemies to spawners
	var spawner_index = 0

	for enemy_type in enemy_composition:
		var count = enemy_composition[enemy_type]

		for i in range(count):
			var spawner = spawners[spawner_index % spawners.size()]

			# Queue enemy spawn
			if spawner.has_method("queue_enemy_spawn"):
				spawner.queue_enemy_spawn(enemy_type)

			spawner_index += 1


## Start boss wave
func start_boss_wave(boss_type: String) -> void:
	print("[WaveManager] Boss wave! %s incoming!" % boss_type)

	boss_wave_started.emit(boss_type)

	# Spawn boss
	spawn_boss(boss_type)


## Spawn boss
func spawn_boss(boss_type: String) -> void:
	# TODO: Instantiate boss from scene

	var game_manager = get_node_or_null("/root/GameManager")
	if game_manager:
		# game_manager.spawn_boss(boss_type)
		pass

	print("[WaveManager] Spawning boss: %s" % boss_type)


## Complete wave
func complete_wave() -> void:
	# Calculate rewards
	var rewards = calculate_wave_rewards()

	wave_completed.emit(current_wave, rewards)

	# Give rewards to player
	give_wave_rewards(rewards)

	print("[WaveManager] Wave %d completed! Rewards: %s" % [current_wave, rewards])

	# Start next wave after delay
	await get_tree().create_timer(5.0).timeout

	if is_endless_mode or current_wave < 20:
		start_next_wave()


## Calculate wave rewards
func calculate_wave_rewards() -> Dictionary:
	var base_currency = 50 * current_wave
	var base_xp = 25 * current_wave

	# Bonus for difficulty
	var currency_bonus = int(base_currency * (difficulty_multiplier - 1.0))
	var xp_bonus = int(base_xp * (difficulty_multiplier - 1.0))

	return {
		"currency": base_currency + currency_bonus,
		"xp": base_xp + xp_bonus
	}


## Give wave rewards
func give_wave_rewards(rewards: Dictionary) -> void:
	var game_manager = get_node_or_null("/root/GameManager")

	if game_manager:
		if "currency" in rewards:
			game_manager.add_currency(rewards["currency"])

	var progression_system = get_node_or_null("/root/ProgressionSystem")

	if progression_system:
		if "xp" in rewards:
			progression_system.gain_xp(rewards["xp"])


## Register spawner
func register_spawner(spawner: Node) -> void:
	if spawner not in spawners:
		spawners.append(spawner)
		print("[WaveManager] Registered spawner: %s" % spawner.name)


## Unregister spawner
func unregister_spawner(spawner: Node) -> void:
	spawners.erase(spawner)


## Set difficulty multiplier
func set_difficulty_multiplier(multiplier: float) -> void:
	difficulty_multiplier = clamp(multiplier, 0.5, 3.0)
	print("[WaveManager] Difficulty multiplier set to: %.1fx" % difficulty_multiplier)


## Get current wave number
func get_current_wave() -> int:
	return current_wave


## Check if endless mode
func is_in_endless_mode() -> bool:
	return is_endless_mode


## Stop waves
func stop_waves() -> void:
	# Stop all spawners
	for spawner in spawners:
		if spawner.has_method("stop_spawning"):
			spawner.stop_spawning()

	print("[WaveManager] Waves stopped")
