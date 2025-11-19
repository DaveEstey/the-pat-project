extends Control
## PauseMenu - In-game pause menu
##
## Features:
## - Resume game
## - Settings access
## - Save game
## - Quit to menu

@onready var resume_button: Button = $Panel/VBoxContainer/ResumeButton
@onready var settings_button: Button = $Panel/VBoxContainer/SettingsButton
@onready var save_button: Button = $Panel/VBoxContainer/SaveButton
@onready var quit_button: Button = $Panel/VBoxContainer/QuitButton


func _ready() -> void:
	hide()

	if resume_button:
		resume_button.pressed.connect(_on_resume_pressed)
	if settings_button:
		settings_button.pressed.connect(_on_settings_pressed)
	if save_button:
		save_button.pressed.connect(_on_save_pressed)
	if quit_button:
		quit_button.pressed.connect(_on_quit_pressed)


func _input(event: InputEvent) -> void:
	if event.is_action_pressed("pause"):
		toggle_pause()


## Toggle pause menu
func toggle_pause() -> void:
	if visible:
		resume_game()
	else:
		pause_game()


## Pause game
func pause_game() -> void:
	get_tree().paused = true
	show()
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE


## Resume game
func resume_game() -> void:
	get_tree().paused = false
	hide()
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED


func _on_resume_pressed() -> void:
	resume_game()


func _on_settings_pressed() -> void:
	# TODO: Open settings menu
	print("[UI] Opening settings")


func _on_save_pressed() -> void:
	var save_system = get_node_or_null("/root/SaveSystem")
	if save_system:
		save_system.save_game(0)  # Quick save to slot 0
		print("[UI] Game saved!")


func _on_quit_pressed() -> void:
	resume_game()
	get_tree().change_scene_to_file("res://scenes/main.tscn")
