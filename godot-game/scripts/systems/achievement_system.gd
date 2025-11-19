extends Node
## AchievementSystem - Tracks and unlocks achievements
##
## Features:
## - Progress tracking
## - Unlocking notifications
## - Persistent save data
## - Statistics tracking

signal achievement_unlocked(achievement_id: String)
signal achievement_progress(achievement_id: String, current: int, total: int)

# Achievement database
const ACHIEVEMENTS: Dictionary = {
	# Combat achievements
	"first_kill": {
		"name": "First Blood",
		"description": "Kill your first enemy",
		"type": "counter",
		"requirement": 1,
		"stat": "total_kills"
	},
	"kill_100": {
		"name": "Centurion",
		"description": "Kill 100 enemies",
		"type": "counter",
		"requirement": 100,
		"stat": "total_kills"
	},
	"kill_1000": {
		"name": "Legendary Warrior",
		"description": "Kill 1000 enemies",
		"type": "counter",
		"requirement": 1000,
		"stat": "total_kills"
	},

	# Combo achievements
	"combo_10": {
		"name": "Combo Starter",
		"description": "Reach a 10x combo",
		"type": "threshold",
		"requirement": 10,
		"stat": "max_combo"
	},
	"combo_50": {
		"name": "Combo Master",
		"description": "Reach a 50x combo",
		"type": "threshold",
		"requirement": 50,
		"stat": "max_combo"
	},
	"combo_100": {
		"name": "Unstoppable Force",
		"description": "Reach a 100x combo",
		"type": "threshold",
		"requirement": 100,
		"stat": "max_combo"
	},

	# Accuracy achievements
	"marksman": {
		"name": "Marksman",
		"description": "Complete a level with 80% accuracy",
		"type": "threshold",
		"requirement": 80,
		"stat": "level_accuracy"
	},
	"sharpshooter": {
		"name": "Sharpshooter",
		"description": "Complete a level with 95% accuracy",
		"type": "threshold",
		"requirement": 95,
		"stat": "level_accuracy"
	},

	# Level achievements
	"level_3": {
		"name": "Guardian Slayer",
		"description": "Defeat the Underground Guardian",
		"type": "unlock",
		"requirement": true,
		"stat": "level_3_complete"
	},
	"level_6": {
		"name": "Phantom Hunter",
		"description": "Defeat the Haunted Phantom Lord",
		"type": "unlock",
		"requirement": true,
		"stat": "level_6_complete"
	},
	"level_9": {
		"name": "Temple Conqueror",
		"description": "Defeat the Temple Ancient One",
		"type": "unlock",
		"requirement": true,
		"stat": "level_9_complete"
	},
	"level_12": {
		"name": "Ultimate Victor",
		"description": "Defeat the Ultimate Adversary",
		"type": "unlock",
		"requirement": true,
		"stat": "level_12_complete"
	},
	"all_levels": {
		"name": "Campaign Complete",
		"description": "Complete all 12 levels",
		"type": "counter",
		"requirement": 12,
		"stat": "levels_completed"
	},

	# Weapon achievements
	"pistol_kills_100": {
		"name": "Pistol Pro",
		"description": "Get 100 kills with the pistol",
		"type": "counter",
		"requirement": 100,
		"stat": "pistol_kills"
	},
	"all_weapons": {
		"name": "Arsenal Master",
		"description": "Unlock all weapons",
		"type": "counter",
		"requirement": 4,
		"stat": "weapons_unlocked"
	},

	# Special achievements
	"no_damage": {
		"name": "Untouchable",
		"description": "Complete a level without taking damage",
		"type": "unlock",
		"requirement": true,
		"stat": "level_no_damage"
	},
	"speedrun": {
		"name": "Speed Demon",
		"description": "Complete a level in under 2 minutes",
		"type": "unlock",
		"requirement": true,
		"stat": "level_speedrun"
	},
	"big_spender": {
		"name": "Big Spender",
		"description": "Spend 10,000 currency in the shop",
		"type": "counter",
		"requirement": 10000,
		"stat": "currency_spent"
	}
}

# Unlocked achievements
var unlocked_achievements: Dictionary = {}

# Statistics tracking
var stats: Dictionary = {
	"total_kills": 0,
	"max_combo": 0,
	"levels_completed": 0,
	"weapons_unlocked": 1,  # Start with pistol
	"pistol_kills": 0,
	"currency_spent": 0,
	"level_accuracy": 0.0,
	"level_3_complete": false,
	"level_6_complete": false,
	"level_9_complete": false,
	"level_12_complete": false,
	"level_no_damage": false,
	"level_speedrun": false
}


func _ready() -> void:
	# Load saved achievements
	load_achievements()


## Update a stat and check for achievements
func update_stat(stat_name: String, value) -> void:
	if stat_name not in stats:
		stats[stat_name] = value
		return

	# Update stat
	var old_value = stats[stat_name]
	stats[stat_name] = value

	# Check for relevant achievements
	check_achievements_for_stat(stat_name, old_value, value)


## Increment a counter stat
func increment_stat(stat_name: String, amount: int = 1) -> void:
	if stat_name not in stats:
		stats[stat_name] = 0

	var old_value = stats[stat_name]
	stats[stat_name] += amount

	check_achievements_for_stat(stat_name, old_value, stats[stat_name])


## Check achievements related to a specific stat
func check_achievements_for_stat(stat_name: String, old_value, new_value) -> void:
	for achievement_id in ACHIEVEMENTS.keys():
		if achievement_id in unlocked_achievements:
			continue  # Already unlocked

		var achievement = ACHIEVEMENTS[achievement_id]

		if achievement["stat"] == stat_name:
			check_achievement(achievement_id, achievement, old_value, new_value)


## Check if achievement should be unlocked
func check_achievement(achievement_id: String, achievement: Dictionary, old_value, new_value) -> void:
	var should_unlock: bool = false

	match achievement["type"]:
		"counter":
			# Counter type: unlock when reaching requirement
			if new_value >= achievement["requirement"] and old_value < achievement["requirement"]:
				should_unlock = true

		"threshold":
			# Threshold type: unlock when exceeding threshold
			if new_value >= achievement["requirement"]:
				should_unlock = true

		"unlock":
			# Binary unlock
			if new_value == achievement["requirement"]:
				should_unlock = true

	if should_unlock:
		unlock_achievement(achievement_id)


## Unlock an achievement
func unlock_achievement(achievement_id: String) -> void:
	if achievement_id in unlocked_achievements:
		return  # Already unlocked

	unlocked_achievements[achievement_id] = {
		"unlocked_at": Time.get_unix_time_from_system(),
		"name": ACHIEVEMENTS[achievement_id]["name"],
		"description": ACHIEVEMENTS[achievement_id]["description"]
	}

	achievement_unlocked.emit(achievement_id)

	print("[Achievement] Unlocked: %s" % ACHIEVEMENTS[achievement_id]["name"])

	# Save achievements
	save_achievements()


## Get unlock status
func is_unlocked(achievement_id: String) -> bool:
	return achievement_id in unlocked_achievements


## Get unlock progress for achievement
func get_progress(achievement_id: String) -> Dictionary:
	if achievement_id not in ACHIEVEMENTS:
		return {}

	var achievement = ACHIEVEMENTS[achievement_id]
	var stat_value = stats.get(achievement["stat"], 0)

	return {
		"current": stat_value,
		"requirement": achievement["requirement"],
		"percent": float(stat_value) / float(achievement["requirement"]) * 100.0
	}


## Save achievements to file
func save_achievements() -> void:
	var save_data = {
		"unlocked": unlocked_achievements,
		"stats": stats
	}

	# TODO: Implement actual save file
	print("[Achievements] Saved")


## Load achievements from file
func load_achievements() -> void:
	# TODO: Implement actual load file
	print("[Achievements] Loaded")
