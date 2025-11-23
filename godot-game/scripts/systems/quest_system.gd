extends Node
## QuestSystem - Mission and objective tracking
##
## Features:
## - Multi-objective quests
## - Side missions
## - Quest rewards (currency, items, unlocks)
## - Progression tracking
## - Quest chains

signal quest_started(quest_id: String)
signal quest_completed(quest_id: String, rewards: Dictionary)
signal quest_failed(quest_id: String)
signal objective_completed(quest_id: String, objective_id: String)
signal objective_updated(quest_id: String, objective_id: String, progress: int, target: int)

# Quest states
enum QuestState {
	LOCKED,
	AVAILABLE,
	ACTIVE,
	COMPLETED,
	FAILED
}

# Objective types
enum ObjectiveType {
	KILL_ENEMIES,
	KILL_SPECIFIC_ENEMY,
	REACH_LOCATION,
	COLLECT_ITEMS,
	SURVIVE_TIME,
	PROTECT_TARGET,
	USE_ABILITY,
	COMPLETE_WITHOUT_DAMAGE
}

# Active quests
var active_quests: Dictionary = {}

# Quest states
var quest_states: Dictionary = {}

# Quest definitions
const QUESTS: Dictionary = {
	# Main story quests
	"main_1": {
		"name": "First Blood",
		"description": "Eliminate your first enemies in the facility",
		"type": "main",
		"objectives": [
			{
				"id": "kill_5",
				"type": ObjectiveType.KILL_ENEMIES,
				"description": "Eliminate 5 enemies",
				"target": 5,
				"current": 0
			}
		],
		"rewards": {
			"currency": 100,
			"xp": 50
		},
		"next_quest": "main_2"
	},

	"main_2": {
		"name": "Arsenal Expansion",
		"description": "Visit the shop and purchase a new weapon",
		"type": "main",
		"objectives": [
			{
				"id": "buy_weapon",
				"type": ObjectiveType.COLLECT_ITEMS,
				"description": "Purchase any weapon from the shop",
				"target": 1,
				"current": 0
			}
		],
		"rewards": {
			"currency": 150,
			"xp": 75
		},
		"requires": ["main_1"],
		"next_quest": "main_3"
	},

	"main_3": {
		"name": "Combo Master",
		"description": "Learn to chain kills for bonus points",
		"type": "main",
		"objectives": [
			{
				"id": "combo_10",
				"type": ObjectiveType.KILL_ENEMIES,
				"description": "Achieve a 10-kill combo",
				"target": 10,
				"combo_required": true,
				"current": 0
			}
		],
		"rewards": {
			"currency": 200,
			"xp": 100,
			"unlock": "rapid_fire"
		},
		"requires": ["main_2"],
		"next_quest": "main_4"
	},

	"main_4": {
		"name": "Boss Battle: Guardian",
		"description": "Defeat the Underground Guardian",
		"type": "main",
		"objectives": [
			{
				"id": "defeat_boss_3",
				"type": ObjectiveType.KILL_SPECIFIC_ENEMY,
				"description": "Defeat the Underground Guardian boss",
				"target_enemy": "underground_guardian",
				"target": 1,
				"current": 0
			}
		],
		"rewards": {
			"currency": 500,
			"xp": 300,
			"unlock": "grappling_hook"
		},
		"requires": ["main_3"]
	},

	# Side quests
	"side_marksman": {
		"name": "Sharpshooter",
		"description": "Prove your accuracy with precision kills",
		"type": "side",
		"objectives": [
			{
				"id": "headshots",
				"type": ObjectiveType.KILL_ENEMIES,
				"description": "Get 20 headshot kills",
				"target": 20,
				"headshot_required": true,
				"current": 0
			}
		],
		"rewards": {
			"currency": 300,
			"xp": 150,
			"unlock": "sniper_rifle"
		}
	},

	"side_survivor": {
		"name": "Against All Odds",
		"description": "Complete a level without taking damage",
		"type": "side",
		"objectives": [
			{
				"id": "no_damage",
				"type": ObjectiveType.COMPLETE_WITHOUT_DAMAGE,
				"description": "Complete any level without taking damage",
				"target": 1,
				"current": 0
			}
		],
		"rewards": {
			"currency": 500,
			"xp": 250,
			"unlock": "achievement_untouchable"
		}
	},

	"side_speed": {
		"name": "Speed Demon",
		"description": "Complete level 1 in under 3 minutes",
		"type": "side",
		"objectives": [
			{
				"id": "time_trial",
				"type": ObjectiveType.SURVIVE_TIME,
				"description": "Complete level 1 in under 180 seconds",
				"target": 180,
				"level_required": 1,
				"current": 0
			}
		],
		"rewards": {
			"currency": 250,
			"xp": 125
		}
	},

	"side_collector": {
		"name": "Power Collector",
		"description": "Collect 50 power-ups",
		"type": "side",
		"objectives": [
			{
				"id": "collect_powerups",
				"type": ObjectiveType.COLLECT_ITEMS,
				"description": "Collect 50 power-ups",
				"target": 50,
				"current": 0
			}
		],
		"rewards": {
			"currency": 200,
			"xp": 100
		}
	},

	"side_arsenal": {
		"name": "Weapon Master",
		"description": "Get kills with every weapon type",
		"type": "side",
		"objectives": [
			{
				"id": "pistol_kills",
				"type": ObjectiveType.KILL_ENEMIES,
				"description": "Get 10 kills with pistol",
				"weapon_required": "pistol",
				"target": 10,
				"current": 0
			},
			{
				"id": "shotgun_kills",
				"type": ObjectiveType.KILL_ENEMIES,
				"description": "Get 10 kills with shotgun",
				"weapon_required": "shotgun",
				"target": 10,
				"current": 0
			},
			{
				"id": "rapid_kills",
				"type": ObjectiveType.KILL_ENEMIES,
				"description": "Get 10 kills with rapid fire",
				"weapon_required": "rapid_fire",
				"target": 10,
				"current": 0
			}
		],
		"rewards": {
			"currency": 400,
			"xp": 200,
			"unlock": "weapon_upgrade_system"
		}
	},

	# Challenge quests
	"challenge_pacifist": {
		"name": "Pacifist Run",
		"description": "Complete a level using only abilities (no weapons)",
		"type": "challenge",
		"objectives": [
			{
				"id": "no_weapon_kills",
				"type": ObjectiveType.COMPLETE_WITHOUT_DAMAGE,
				"description": "Complete a level without firing weapons",
				"no_weapons_allowed": true,
				"target": 1,
				"current": 0
			}
		],
		"rewards": {
			"currency": 1000,
			"xp": 500,
			"unlock": "achievement_pacifist"
		}
	}
}


func _ready() -> void:
	# Initialize quest states
	for quest_id in QUESTS:
		quest_states[quest_id] = QuestState.LOCKED

	# Make initial quests available
	quest_states["main_1"] = QuestState.AVAILABLE

	# Check for unlocked side quests
	for quest_id in QUESTS:
		var quest = QUESTS[quest_id]
		if quest["type"] == "side" and not quest.has("requires"):
			quest_states[quest_id] = QuestState.AVAILABLE


## Start a quest
func start_quest(quest_id: String) -> bool:
	if quest_id not in QUESTS:
		return false

	if quest_states[quest_id] != QuestState.AVAILABLE:
		return false

	# Check requirements
	var quest = QUESTS[quest_id]
	if quest.has("requires"):
		for required_quest in quest["requires"]:
			if quest_states[required_quest] != QuestState.COMPLETED:
				return false

	# Activate quest
	quest_states[quest_id] = QuestState.ACTIVE

	# Copy quest data to active quests
	active_quests[quest_id] = quest.duplicate(true)

	quest_started.emit(quest_id)

	print("[Quest] Started: %s" % quest["name"])
	return true


## Update quest progress
func update_quest_progress(quest_id: String, objective_id: String, amount: int = 1) -> void:
	if quest_id not in active_quests:
		return

	var quest = active_quests[quest_id]

	# Find objective
	for objective in quest["objectives"]:
		if objective["id"] == objective_id:
			objective["current"] = min(objective["current"] + amount, objective["target"])

			objective_updated.emit(quest_id, objective_id, objective["current"], objective["target"])

			# Check if objective complete
			if objective["current"] >= objective["target"]:
				complete_objective(quest_id, objective_id)

			break

	# Check if all objectives complete
	check_quest_completion(quest_id)


## Complete an objective
func complete_objective(quest_id: String, objective_id: String) -> void:
	objective_completed.emit(quest_id, objective_id)
	print("[Quest] Objective completed: %s" % objective_id)


## Check if quest is complete
func check_quest_completion(quest_id: String) -> void:
	if quest_id not in active_quests:
		return

	var quest = active_quests[quest_id]

	# Check all objectives
	for objective in quest["objectives"]:
		if objective["current"] < objective["target"]:
			return

	# All objectives complete!
	complete_quest(quest_id)


## Complete a quest
func complete_quest(quest_id: String) -> void:
	if quest_id not in active_quests:
		return

	var quest = active_quests[quest_id]

	# Mark as completed
	quest_states[quest_id] = QuestState.COMPLETED

	# Give rewards
	give_rewards(quest["rewards"])

	# Remove from active
	active_quests.erase(quest_id)

	quest_completed.emit(quest_id, quest["rewards"])

	print("[Quest] Completed: %s" % quest["name"])

	# Unlock next quest
	if quest.has("next_quest"):
		quest_states[quest["next_quest"]] = QuestState.AVAILABLE


## Fail a quest
func fail_quest(quest_id: String) -> void:
	if quest_id not in active_quests:
		return

	quest_states[quest_id] = QuestState.FAILED
	active_quests.erase(quest_id)

	quest_failed.emit(quest_id)


## Give quest rewards
func give_rewards(rewards: Dictionary) -> void:
	var game_manager = get_node_or_null("/root/GameManager")

	if "currency" in rewards:
		if game_manager:
			game_manager.add_currency(rewards["currency"])
		print("[Quest] Reward: %d currency" % rewards["currency"])

	if "xp" in rewards:
		# TODO: Add XP system
		print("[Quest] Reward: %d XP" % rewards["xp"])

	if "unlock" in rewards:
		# Unlock weapon/ability/achievement
		unlock_content(rewards["unlock"])
		print("[Quest] Unlocked: %s" % rewards["unlock"])


## Unlock content
func unlock_content(unlock_id: String) -> void:
	# Check what type of unlock
	if unlock_id.begins_with("achievement_"):
		var achievement_system = get_node_or_null("/root/AchievementSystem")
		if achievement_system:
			achievement_system.unlock_achievement(unlock_id.replace("achievement_", ""))

	elif unlock_id in ["pistol", "shotgun", "rapid_fire", "grappling_hook", "sniper_rifle", "rocket_launcher", "laser_rifle"]:
		var weapon_system = get_node_or_null("/root/WeaponSystem")
		if weapon_system:
			weapon_system.unlock_weapon(unlock_id)

	elif unlock_id == "weapon_upgrade_system":
		# Enable weapon upgrades
		pass


## Get available quests
func get_available_quests() -> Array[String]:
	var available: Array[String] = []

	for quest_id in quest_states:
		if quest_states[quest_id] == QuestState.AVAILABLE:
			available.append(quest_id)

	return available


## Get active quests
func get_active_quests() -> Array[String]:
	return active_quests.keys()


## Get quest data
func get_quest_data(quest_id: String) -> Dictionary:
	if quest_id in active_quests:
		return active_quests[quest_id]
	elif quest_id in QUESTS:
		return QUESTS[quest_id]
	return {}


## Get quest state
func get_quest_state(quest_id: String) -> QuestState:
	return quest_states.get(quest_id, QuestState.LOCKED)


## Check if quest is active
func is_quest_active(quest_id: String) -> bool:
	return quest_id in active_quests
