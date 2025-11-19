extends Node3D
## SwitchSequencePuzzle - Shoot switches in correct order
##
## Features:
## - Multiple switches to shoot in sequence
## - Visual feedback on activation
## - Failure on wrong order
## - Reward on completion

signal puzzle_completed()
signal puzzle_failed()

@export var puzzle_id: String = "switch_sequence_1"
@export var correct_sequence: Array[int] = [0, 1, 2, 3]
@export var allow_retries: bool = true
@export var time_limit: float = 30.0  # 0 = no limit

var current_sequence: Array[int] = []
var switches: Array[Node3D] = []
var is_active: bool = false
var time_remaining: float = 0.0

@onready var switch_container: Node3D = $Switches


func _ready() -> void:
	# Find all switches
	for child in switch_container.get_children():
		if child.is_in_group("puzzle_switch"):
			switches.append(child)
			child.connect("switch_activated", _on_switch_activated)

	# Register with puzzle system
	var puzzle_system = get_node_or_null("/root/PuzzleSystem")
	if puzzle_system:
		puzzle_system.register_puzzle(puzzle_id, {
			"type": "switch_sequence",
			"currency_reward": 200,
			"score_reward": 500
		})


func _process(delta: float) -> void:
	if not is_active:
		return

	if time_limit > 0:
		time_remaining -= delta

		if time_remaining <= 0:
			fail_puzzle()


## Start the puzzle
func start_puzzle() -> void:
	is_active = true
	current_sequence.clear()
	time_remaining = time_limit

	print("[Puzzle] Switch sequence started")


## Handle switch activation
func _on_switch_activated(switch_index: int) -> void:
	if not is_active:
		start_puzzle()

	# Add to current sequence
	current_sequence.append(switch_index)

	# Check if correct so far
	if not is_sequence_correct():
		if allow_retries:
			# Reset and try again
			current_sequence.clear()
			print("[Puzzle] Wrong order, try again!")
		else:
			# Fail permanently
			fail_puzzle()
		return

	# Update progress
	var puzzle_system = get_node_or_null("/root/PuzzleSystem")
	if puzzle_system:
		puzzle_system.update_puzzle_progress(
			puzzle_id,
			current_sequence.size(),
			correct_sequence.size()
		)

	# Check if complete
	if current_sequence.size() >= correct_sequence.size():
		complete_puzzle()


## Check if current sequence matches correct sequence so far
func is_sequence_correct() -> bool:
	for i in range(current_sequence.size()):
		if i >= correct_sequence.size():
			return false
		if current_sequence[i] != correct_sequence[i]:
			return false
	return true


## Complete the puzzle
func complete_puzzle() -> void:
	is_active = false

	var puzzle_system = get_node_or_null("/root/PuzzleSystem")
	if puzzle_system:
		puzzle_system.complete_puzzle(puzzle_id)

	puzzle_completed.emit()

	print("[Puzzle] Switch sequence completed!")


## Fail the puzzle
func fail_puzzle() -> void:
	is_active = false

	var puzzle_system = get_node_or_null("/root/PuzzleSystem")
	if puzzle_system:
		puzzle_system.fail_puzzle(puzzle_id)

	puzzle_failed.emit()
