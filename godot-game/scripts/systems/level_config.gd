extends Node
## LevelConfig - Configuration data for all 12 levels
##
## Features:
## - Enemy compositions per level
## - Room counts
## - Boss definitions
## - Environmental themes
## - Difficulty scaling

# Level configuration database
const LEVEL_DATA: Array[Dictionary] = [
	# LEVEL 1 - Tutorial/Easy
	{
		"level_number": 1,
		"name": "The Entrance",
		"theme": "fortress",
		"num_rooms": 3,
		"enemy_types": ["basic_shooter"],
		"max_enemies_per_wave": 3,
		"waves_per_room": 2,
		"boss": null,
		"difficulty_multiplier": 1.0,
		"currency_multiplier": 1.0
	},

	# LEVEL 2 - Introduction to variety
	{
		"level_number": 2,
		"name": "Armory Halls",
		"theme": "fortress",
		"num_rooms": 4,
		"enemy_types": ["basic_shooter", "armored"],
		"max_enemies_per_wave": 4,
		"waves_per_room": 2,
		"boss": null,
		"difficulty_multiplier": 1.2,
		"currency_multiplier": 1.2,
		"special_features": ["weapon_pickup_shotgun"]
	},

	# LEVEL 3 - First Boss
	{
		"level_number": 3,
		"name": "Guardian's Chamber",
		"theme": "fortress_boss",
		"num_rooms": 5,
		"enemy_types": ["basic_shooter", "armored", "ninja"],
		"max_enemies_per_wave": 5,
		"waves_per_room": 3,
		"boss": {
			"type": "underground_guardian",
			"name": "THE UNDERGROUND GUARDIAN",
			"room": 5
		},
		"difficulty_multiplier": 1.5,
		"currency_multiplier": 1.5
	},

	# LEVEL 4 - Speed and precision
	{
		"level_number": 4,
		"name": "Rapid Assault",
		"theme": "industrial",
		"num_rooms": 5,
		"enemy_types": ["ninja", "fast_debuffer", "basic_shooter"],
		"max_enemies_per_wave": 6,
		"waves_per_room": 3,
		"boss": null,
		"difficulty_multiplier": 1.7,
		"currency_multiplier": 1.6,
		"special_features": ["weapon_pickup_rapid_fire"]
	},

	# LEVEL 5 - Tactical challenge
	{
		"level_number": 5,
		"name": "Sniper's Nest",
		"theme": "industrial",
		"num_rooms": 6,
		"enemy_types": ["sniper", "shield", "armored"],
		"max_enemies_per_wave": 5,
		"waves_per_room": 3,
		"boss": null,
		"difficulty_multiplier": 2.0,
		"currency_multiplier": 1.8,
		"special_features": ["hazard_laser_grids"]
	},

	# LEVEL 6 - Second Boss
	{
		"level_number": 6,
		"name": "Phantom Realm",
		"theme": "haunted_boss",
		"num_rooms": 6,
		"enemy_types": ["ninja", "fast_debuffer", "sniper"],
		"max_enemies_per_wave": 7,
		"waves_per_room": 3,
		"boss": {
			"type": "phantom_lord",
			"name": "HAUNTED PHANTOM LORD",
			"room": 6
		},
		"difficulty_multiplier": 2.3,
		"currency_multiplier": 2.0
	},

	# LEVEL 7 - Explosive chaos
	{
		"level_number": 7,
		"name": "Bombardment",
		"theme": "warzone",
		"num_rooms": 6,
		"enemy_types": ["bomb_thrower", "armored", "basic_shooter"],
		"max_enemies_per_wave": 6,
		"waves_per_room": 4,
		"boss": null,
		"difficulty_multiplier": 2.5,
		"currency_multiplier": 2.2,
		"special_features": ["hazard_explosive_barrels"]
	},

	# LEVEL 8 - All enemy types
	{
		"level_number": 8,
		"name": "Full Assault",
		"theme": "warzone",
		"num_rooms": 7,
		"enemy_types": ["basic_shooter", "armored", "ninja", "bomb_thrower", "fast_debuffer", "sniper", "shield"],
		"max_enemies_per_wave": 8,
		"waves_per_room": 4,
		"boss": null,
		"difficulty_multiplier": 2.8,
		"currency_multiplier": 2.5,
		"special_features": ["weapon_pickup_grappling_hook"]
	},

	# LEVEL 9 - Third Boss
	{
		"level_number": 9,
		"name": "Temple of Trials",
		"theme": "temple_boss",
		"num_rooms": 7,
		"enemy_types": ["shield", "armored", "sniper"],
		"max_enemies_per_wave": 7,
		"waves_per_room": 4,
		"boss": {
			"type": "ancient_one",
			"name": "TEMPLE ANCIENT ONE",
			"room": 7
		},
		"difficulty_multiplier": 3.2,
		"currency_multiplier": 2.8,
		"special_features": ["puzzle_switch_sequence"]
	},

	# LEVEL 10 - Endurance
	{
		"level_number": 10,
		"name": "Endless Siege",
		"theme": "apocalypse",
		"num_rooms": 8,
		"enemy_types": ["basic_shooter", "armored", "ninja", "bomb_thrower", "fast_debuffer", "sniper", "shield"],
		"max_enemies_per_wave": 10,
		"waves_per_room": 5,
		"boss": null,
		"difficulty_multiplier": 3.6,
		"currency_multiplier": 3.0
	},

	# LEVEL 11 - Chaos
	{
		"level_number": 11,
		"name": "Pandemonium",
		"theme": "apocalypse",
		"num_rooms": 8,
		"enemy_types": ["basic_shooter", "armored", "ninja", "bomb_thrower", "fast_debuffer", "sniper", "shield"],
		"max_enemies_per_wave": 12,
		"waves_per_room": 5,
		"boss": null,
		"difficulty_multiplier": 4.0,
		"currency_multiplier": 3.5,
		"special_features": ["hazard_turrets", "hazard_laser_grids"]
	},

	# LEVEL 12 - Final Boss
	{
		"level_number": 12,
		"name": "The Ultimate Trial",
		"theme": "final_boss",
		"num_rooms": 10,
		"enemy_types": ["basic_shooter", "armored", "ninja", "bomb_thrower", "fast_debuffer", "sniper", "shield"],
		"max_enemies_per_wave": 10,
		"waves_per_room": 5,
		"boss": {
			"type": "ultimate_adversary",
			"name": "THE ULTIMATE ADVERSARY",
			"room": 10
		},
		"difficulty_multiplier": 5.0,
		"currency_multiplier": 5.0,
		"special_features": ["all_hazards", "puzzle_final"]
	}
]


## Get configuration for specific level
static func get_level_config(level_number: int) -> Dictionary:
	for level_data in LEVEL_DATA:
		if level_data["level_number"] == level_number:
			return level_data

	# Return default if not found
	return LEVEL_DATA[0]


## Get enemy count for level and wave
static func get_enemy_count_for_wave(level_number: int, wave_number: int) -> int:
	var config = get_level_config(level_number)
	var base_count = 3 + wave_number

	# Scale by level difficulty
	var scaled_count = int(base_count * config["difficulty_multiplier"])

	# Cap at max
	return min(scaled_count, config["max_enemies_per_wave"])


## Get random enemy type for level
static func get_random_enemy_type(level_number: int) -> String:
	var config = get_level_config(level_number)
	var enemy_types: Array = config["enemy_types"]

	if enemy_types.is_empty():
		return "basic_shooter"

	return enemy_types[randi() % enemy_types.size()]


## Check if level has boss
static func has_boss(level_number: int) -> bool:
	var config = get_level_config(level_number)
	return config.get("boss", null) != null


## Get boss config for level
static func get_boss_config(level_number: int) -> Dictionary:
	var config = get_level_config(level_number)
	return config.get("boss", {})
