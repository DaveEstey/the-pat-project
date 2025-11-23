extends Node
## CinematicSystem - Cutscene and story sequence manager
##
## Features:
## - Camera control
## - Dialogue sequences
## - Event triggers
## - Skippable cinematics

signal cinematic_started(cinematic_id: String)
signal cinematic_completed(cinematic_id: String)
signal dialogue_line_shown(speaker: String, text: String)

var is_playing: bool = false
var current_cinematic: Dictionary = {}
var current_sequence_index: int = 0
var can_skip: bool = true

# Cinematic definitions
const CINEMATICS: Dictionary = {
	"intro": {
		"name": "Game Intro",
		"skippable": true,
		"sequences": [
			{
				"type": "dialogue",
				"speaker": "System",
				"text": "Welcome to the PAT Project...",
				"duration": 3.0
			},
			{
				"type": "dialogue",
				"speaker": "System",
				"text": "Your mission: Infiltrate and eliminate all threats.",
				"duration": 3.0
			}
		]
	},
	"boss_3_intro": {
		"name": "Underground Guardian Introduction",
		"skippable": false,
		"sequences": [
			{
				"type": "camera_focus",
				"target": "boss",
				"duration": 2.0
			},
			{
				"type": "dialogue",
				"speaker": "Guardian",
				"text": "You dare enter my domain?",
				"duration": 2.5
			},
			{
				"type": "dialogue",
				"speaker": "Guardian",
				"text": "Prepare to face your doom!",
				"duration": 2.0
			},
			{
				"type": "camera_return",
				"duration": 1.0
			}
		]
	},
	"victory": {
		"name": "Victory Sequence",
		"skippable": true,
		"sequences": [
			{
				"type": "dialogue",
				"speaker": "System",
				"text": "Mission Complete!",
				"duration": 2.0
			},
			{
				"type": "dialogue",
				"speaker": "System",
				"text": "All threats neutralized.",
				"duration": 2.0
			}
		]
	}
}


## Play cinematic
func play_cinematic(cinematic_id: String) -> void:
	if cinematic_id not in CINEMATICS:
		return

	is_playing = true
	current_cinematic = CINEMATICS[cinematic_id]
	current_sequence_index = 0
	can_skip = current_cinematic["skippable"]

	cinematic_started.emit(cinematic_id)

	# Pause gameplay
	var game_manager = get_node_or_null("/root/GameManager")
	if game_manager:
		game_manager.set_game_state(game_manager.GameState.STORY_DIALOGUE)

	play_next_sequence()


## Play next sequence in cinematic
func play_next_sequence() -> void:
	if current_sequence_index >= current_cinematic["sequences"].size():
		complete_cinematic()
		return

	var sequence = current_cinematic["sequences"][current_sequence_index]
	current_sequence_index += 1

	execute_sequence(sequence)


## Execute sequence
func execute_sequence(sequence: Dictionary) -> void:
	match sequence["type"]:
		"dialogue":
			show_dialogue(sequence)

		"camera_focus":
			focus_camera(sequence)

		"camera_return":
			return_camera(sequence)

		"event":
			trigger_event(sequence)


## Show dialogue
func show_dialogue(sequence: Dictionary) -> void:
	dialogue_line_shown.emit(sequence["speaker"], sequence["text"])

	print("[Cinematic] %s: %s" % [sequence["speaker"], sequence["text"]])

	# Wait for duration
	await get_tree().create_timer(sequence["duration"]).timeout

	play_next_sequence()


## Focus camera on target
func focus_camera(sequence: Dictionary) -> void:
	# TODO: Move camera to focus on target

	await get_tree().create_timer(sequence["duration"]).timeout

	play_next_sequence()


## Return camera to player
func return_camera(sequence: Dictionary) -> void:
	# TODO: Return camera to player

	await get_tree().create_timer(sequence["duration"]).timeout

	play_next_sequence()


## Trigger custom event
func trigger_event(sequence: Dictionary) -> void:
	# TODO: Trigger custom game event

	play_next_sequence()


## Complete cinematic
func complete_cinematic() -> void:
	is_playing = false

	cinematic_completed.emit(current_cinematic.get("name", ""))

	# Resume gameplay
	var game_manager = get_node_or_null("/root/GameManager")
	if game_manager:
		game_manager.set_game_state(game_manager.GameState.PLAYING)


## Skip cinematic
func skip_cinematic() -> void:
	if not can_skip or not is_playing:
		return

	complete_cinematic()


## Check if cinematic is playing
func is_cinematic_playing() -> bool:
	return is_playing
