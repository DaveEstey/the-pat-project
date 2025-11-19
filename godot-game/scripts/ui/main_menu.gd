extends Control
## MainMenu - Main menu UI
##
## Features:
## - Start new game
## - Level select
## - Settings
## - Quit

@onready var start_button: Button = $VBoxContainer/StartButton
@onready var level_select_button: Button = $VBoxContainer/LevelSelectButton
@onready var settings_button: Button = $VBoxContainer/SettingsButton
@onready var quit_button: Button = $VBoxContainer/QuitButton

var game_manager: Node


func _ready() -> void:
	game_manager = get_node_or_null("/root/GameManager")

	# Connect buttons
	if start_button:
		start_button.pressed.connect(_on_start_pressed)
	if level_select_button:
		level_select_button.pressed.connect(_on_level_select_pressed)
	if settings_button:
		settings_button.pressed.connect(_on_settings_pressed)
	if quit_button:
		quit_button.pressed.connect(_on_quit_pressed)


func _on_start_pressed() -> void:
	if game_manager:
		game_manager.start_new_game()

	# Load game scene
	get_tree().change_scene_to_file("res://scenes/game.tscn")


func _on_level_select_pressed() -> void:
	# TODO: Load level select scene
	print("Level Select not yet implemented")


func _on_settings_pressed() -> void:
	# TODO: Load settings scene
	print("Settings not yet implemented")


func _on_quit_pressed() -> void:
	get_tree().quit()
