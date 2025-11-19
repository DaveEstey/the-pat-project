extends Node
## DailyChallenge - Daily randomized challenges
##
## Features:
## - New challenge each day
## - Unique modifiers and goals
## - Leaderboard for each challenge
## - Bonus rewards

signal challenge_started(challenge_data: Dictionary)
signal challenge_completed(challenge_id: String, score: int)
signal challenge_failed()

var current_challenge: Dictionary = {}
var is_active: bool = false
var challenge_seed: int = 0

# Challenge types
const CHALLENGE_TYPES: Array[String] = [
	"survival_waves",      # Survive X waves
	"score_target",        # Reach score target
	"time_limit",          # Complete level in time
	"accuracy_challenge",  # Maintain X% accuracy
	"combo_challenge",     # Achieve X combo
	"weapon_locked",       # Complete with specific weapon
	"no_damage",          # Complete without taking damage
	"limited_ammo"        # Complete with limited ammo
]

# Challenge modifiers
const MODIFIERS: Array[String] = [
	"double_speed",        # Enemies move 2x speed
	"half_health",         # Start with 50% health
	"random_power_ups",    # Random power-ups spawn
	"elite_enemies",       # All enemies are elite variants
	"no_shop",            # Shop disabled
	"fog_of_war"          # Limited visibility
]


func _ready() -> void:
	generate_daily_challenge()


## Generate daily challenge based on current date
func generate_daily_challenge() -> void:
	# Use date as seed for reproducibility
	var date = Time.get_date_dict_from_system()
	challenge_seed = date["year"] * 10000 + date["month"] * 100 + date["day"]

	seed(challenge_seed)

	# Generate challenge
	var challenge_type = CHALLENGE_TYPES[randi() % CHALLENGE_TYPES.size()]
	var num_modifiers = randi() % 3 + 1  # 1-3 modifiers

	var selected_modifiers: Array[String] = []
	for i in range(num_modifiers):
		var modifier = MODIFIERS[randi() % MODIFIERS.size()]
		if modifier not in selected_modifiers:
			selected_modifiers.append(modifier)

	current_challenge = {
		"id": "daily_%d" % challenge_seed,
		"type": challenge_type,
		"modifiers": selected_modifiers,
		"goal": generate_challenge_goal(challenge_type),
		"reward_currency": 500 + (num_modifiers * 100),
		"reward_score": 1000 + (num_modifiers * 500)
	}

	print("[DailyChallenge] Generated: ", current_challenge["type"])


## Generate goal based on challenge type
func generate_challenge_goal(challenge_type: String) -> Dictionary:
	match challenge_type:
		"survival_waves":
			return {"waves": randi() % 10 + 10}  # 10-20 waves

		"score_target":
			return {"score": (randi() % 20 + 10) * 1000}  # 10k-30k

		"time_limit":
			return {"time": randi() % 120 + 60}  # 60-180 seconds

		"accuracy_challenge":
			return {"accuracy": randi() % 20 + 80}  # 80-100%

		"combo_challenge":
			return {"combo": randi() % 30 + 20}  # 20-50

		"weapon_locked":
			var weapons = ["pistol", "shotgun", "rapid_fire"]
			return {"weapon": weapons[randi() % weapons.size()]}

		"no_damage":
			return {"max_damage": 0}

		"limited_ammo":
			return {"total_ammo": randi() % 50 + 50}  # 50-100 total shots

	return {}


## Start daily challenge
func start_challenge() -> void:
	is_active = true

	# Apply modifiers
	apply_challenge_modifiers()

	challenge_started.emit(current_challenge)

	print("[DailyChallenge] Challenge started!")


## Apply challenge modifiers to game
func apply_challenge_modifiers() -> void:
	for modifier in current_challenge["modifiers"]:
		match modifier:
			"double_speed":
				# TODO: Increase enemy speed
				print("[Modifier] Double speed activated")

			"half_health":
				var game_manager = get_node_or_null("/root/GameManager")
				if game_manager:
					game_manager.player_max_health *= 0.5
					game_manager.set_player_health(game_manager.player_max_health)

			"random_power_ups":
				# TODO: Enable random power-up spawning
				print("[Modifier] Random power-ups activated")

			"elite_enemies":
				# TODO: Buff all enemies
				print("[Modifier] Elite enemies activated")

			"no_shop":
				# TODO: Disable shop
				print("[Modifier] Shop disabled")

			"fog_of_war":
				# TODO: Reduce visibility
				print("[Modifier] Fog of war activated")


## Check challenge progress
func check_challenge_progress() -> void:
	if not is_active:
		return

	var goal_met = false

	match current_challenge["type"]:
		"score_target":
			var game_manager = get_node_or_null("/root/GameManager")
			if game_manager and game_manager.player_score >= current_challenge["goal"]["score"]:
				goal_met = true

		"combo_challenge":
			var combo_system = get_node_or_null("/root/ComboSystem")
			if combo_system and combo_system.get_max_combo() >= current_challenge["goal"]["combo"]:
				goal_met = true

		# ... other challenge types

	if goal_met:
		complete_challenge()


## Complete challenge
func complete_challenge() -> void:
	if not is_active:
		return

	is_active = false

	var game_manager = get_node_or_null("/root/GameManager")
	var final_score = game_manager.player_score if game_manager else 0

	# Award rewards
	if game_manager:
		game_manager.add_currency(current_challenge["reward_currency"])
		game_manager.add_score(current_challenge["reward_score"])

	challenge_completed.emit(current_challenge["id"], final_score)

	print("[DailyChallenge] Challenge completed! Score: %d" % final_score)


## Fail challenge
func fail_challenge() -> void:
	is_active = false
	challenge_failed.emit()

	print("[DailyChallenge] Challenge failed!")


## Get challenge description
func get_challenge_description() -> String:
	var desc = "Daily Challenge: "

	match current_challenge["type"]:
		"survival_waves":
			desc += "Survive %d waves" % current_challenge["goal"]["waves"]
		"score_target":
			desc += "Reach %d points" % current_challenge["goal"]["score"]
		"time_limit":
			desc += "Complete in %d seconds" % current_challenge["goal"]["time"]
		# ... etc

	desc += "\nModifiers: " + ", ".join(current_challenge["modifiers"])

	return desc


## Get current challenge data
func get_challenge_data() -> Dictionary:
	return current_challenge
