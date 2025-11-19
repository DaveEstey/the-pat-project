extends Node
## PuzzleSystem - Manages interactive puzzles
##
## Features:
## - Switch sequences
## - Timed challenges
## - Shooting targets
## - Pattern matching
## - Rewards on completion

signal puzzle_started(puzzle_id: String)
signal puzzle_progress(puzzle_id: String, progress: float)
signal puzzle_completed(puzzle_id: String)
signal puzzle_failed(puzzle_id: String)

# Active puzzles
var active_puzzles: Dictionary = {}

# Puzzle completion tracking
var completed_puzzles: Array[String] = []


## Register a new puzzle
func register_puzzle(puzzle_id: String, puzzle_data: Dictionary) -> void:
	active_puzzles[puzzle_id] = puzzle_data
	puzzle_started.emit(puzzle_id)


## Update puzzle progress
func update_puzzle_progress(puzzle_id: String, current: float, total: float) -> void:
	if puzzle_id not in active_puzzles:
		return

	var progress = current / total
	puzzle_progress.emit(puzzle_id, progress)


## Complete puzzle
func complete_puzzle(puzzle_id: String) -> void:
	if puzzle_id in completed_puzzles:
		return

	completed_puzzles.append(puzzle_id)
	puzzle_completed.emit(puzzle_id)

	# Award rewards
	if puzzle_id in active_puzzles:
		var puzzle_data = active_puzzles[puzzle_id]
		award_puzzle_rewards(puzzle_data)

	print("[Puzzle] Completed: ", puzzle_id)


## Fail puzzle
func fail_puzzle(puzzle_id: String) -> void:
	puzzle_failed.emit(puzzle_id)
	print("[Puzzle] Failed: ", puzzle_id)


## Award puzzle completion rewards
func award_puzzle_rewards(puzzle_data: Dictionary) -> void:
	var game_manager = get_node_or_null("/root/GameManager")
	if not game_manager:
		return

	# Currency reward
	if "currency_reward" in puzzle_data:
		game_manager.add_currency(puzzle_data["currency_reward"])

	# Score reward
	if "score_reward" in puzzle_data:
		game_manager.add_score(puzzle_data["score_reward"])

	# Unlock weapon
	if "weapon_unlock" in puzzle_data:
		var weapon_system = get_node_or_null("/root/WeaponSystem")
		if weapon_system:
			weapon_system.unlock_weapon(puzzle_data["weapon_unlock"])


## Check if puzzle is completed
func is_completed(puzzle_id: String) -> bool:
	return puzzle_id in completed_puzzles


## Reset all puzzles
func reset_puzzles() -> void:
	completed_puzzles.clear()
	active_puzzles.clear()
