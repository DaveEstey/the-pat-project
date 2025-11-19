extends Node
## TimeAttackMode - Complete levels as fast as possible
##
## Features:
## - Timer tracking
## - Best time records
## - Time bonuses for quick kills
## - Leaderboard integration

signal time_attack_started()
signal time_attack_completed(time: float, score: int)
signal time_bonus_earned(bonus: int)

var is_active: bool = false
var start_time: float = 0.0
var current_time: float = 0.0
var target_level: int = 1

# Time attack records
var best_times: Dictionary = {}  # level -> best time

# Time bonuses
const FAST_KILL_BONUS: int = 50  # Bonus for quick kills
const FAST_KILL_WINDOW: float = 1.0  # Seconds to count as "fast"
const SPEED_RUN_THRESHOLDS: Dictionary = {
	1: 120.0,  # Level 1: 2 minutes
	2: 150.0,  # Level 2: 2.5 minutes
	3: 240.0,  # Level 3: 4 minutes (boss)
	# ... etc
}


func _process(delta: float) -> void:
	if not is_active:
		return

	current_time = Time.get_ticks_msec() / 1000.0 - start_time


## Start time attack
func start_time_attack(level: int) -> void:
	is_active = true
	target_level = level
	start_time = Time.get_ticks_msec() / 1000.0
	current_time = 0.0

	time_attack_started.emit()

	print("[TimeAttack] Time attack started for level %d" % level)


## Complete time attack
func complete_time_attack() -> void:
	if not is_active:
		return

	var final_time = current_time
	var game_manager = get_node_or_null("/root/GameManager")
	var final_score = game_manager.player_score if game_manager else 0

	# Check if new best time
	if target_level not in best_times or final_time < best_times[target_level]:
		best_times[target_level] = final_time
		print("[TimeAttack] NEW BEST TIME: %.2f seconds!" % final_time)

	# Check for speed run achievement
	check_speed_run_achievement(target_level, final_time)

	time_attack_completed.emit(final_time, final_score)

	is_active = false

	print("[TimeAttack] Completed in %.2f seconds" % final_time)


## Check speed run achievement
func check_speed_run_achievement(level: int, time: float) -> void:
	if level in SPEED_RUN_THRESHOLDS:
		if time <= SPEED_RUN_THRESHOLDS[level]:
			var achievement_system = get_node_or_null("/root/AchievementSystem")
			if achievement_system:
				achievement_system.update_stat("level_speedrun", true)

			print("[TimeAttack] Speed run achievement!")


## Award time bonus for fast kill
func award_fast_kill_bonus() -> void:
	var game_manager = get_node_or_null("/root/GameManager")
	if game_manager:
		game_manager.add_score(FAST_KILL_BONUS)

	time_bonus_earned.emit(FAST_KILL_BONUS)


## Get current time
func get_current_time() -> float:
	return current_time


## Get best time for level
func get_best_time(level: int) -> float:
	return best_times.get(level, 0.0)


## Format time as string
func format_time(time: float) -> String:
	var minutes = int(time) / 60
	var seconds = int(time) % 60
	var milliseconds = int((time - int(time)) * 100)

	return "%02d:%02d.%02d" % [minutes, seconds, milliseconds]


## Save best times
func save_best_times() -> void:
	var save_system = get_node_or_null("/root/SaveSystem")
	if save_system:
		# TODO: Add best_times to save data
		pass


## Load best times
func load_best_times() -> void:
	var save_system = get_node_or_null("/root/SaveSystem")
	if save_system:
		# TODO: Load best_times from save data
		pass
