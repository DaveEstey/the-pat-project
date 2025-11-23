extends Control
## DialogueBox - UI for displaying dialogue
##
## Features:
## - Text animation (typewriter effect)
## - Speaker name and portrait
## - Choice buttons
## - Skip functionality

signal choice_selected(choice_index: int)
signal dialogue_skipped()

@export var text_speed: float = 0.05  # Seconds per character
@export var allow_skip: bool = true

var current_text: String = ""
var current_speaker: String = ""
var displayed_characters: int = 0
var is_animating: bool = false
var current_choices: Array = []

@onready var dialogue_panel: Panel = $Panel
@onready var speaker_label: Label = $Panel/SpeakerLabel
@onready var portrait: TextureRect = $Panel/Portrait
@onready var text_label: RichTextLabel = $Panel/TextLabel
@onready var choices_container: VBoxContainer = $Panel/ChoicesContainer
@onready var continue_indicator: Label = $Panel/ContinueIndicator


func _ready() -> void:
	hide_dialogue()

	# Connect to dialogue system
	var dialogue_system = get_node_or_null("/root/DialogueSystem")
	if dialogue_system:
		dialogue_system.dialogue_started.connect(_on_dialogue_started)
		dialogue_system.dialogue_ended.connect(_on_dialogue_ended)
		dialogue_system.dialogue_line_shown.connect(_on_dialogue_line_shown)


func _input(event: InputEvent) -> void:
	if not visible or not is_animating:
		return

	# Skip text animation
	if event.is_action_pressed("ui_accept") or event.is_action_pressed("interact"):
		if allow_skip:
			complete_text_animation()


## Show dialogue
func show_dialogue() -> void:
	visible = true


## Hide dialogue
func hide_dialogue() -> void:
	visible = false
	clear_choices()


## Display dialogue line
func display_line(speaker: String, text: String, choices: Array = []) -> void:
	current_speaker = speaker
	current_text = text
	current_choices = choices

	# Set speaker
	if speaker_label:
		speaker_label.text = speaker

	# Start text animation
	start_text_animation(text)

	# Setup choices
	if not choices.is_empty():
		await get_tree().create_timer(text_speed * text.length() + 0.5).timeout
		show_choices(choices)
	else:
		clear_choices()


## Start text animation
func start_text_animation(text: String) -> void:
	if not text_label:
		return

	is_animating = true
	displayed_characters = 0

	text_label.visible_characters = 0
	text_label.text = text

	# Animate
	while displayed_characters < text.length():
		displayed_characters += 1
		text_label.visible_characters = displayed_characters

		await get_tree().create_timer(text_speed).timeout

	is_animating = false

	# Show continue indicator if no choices
	if current_choices.is_empty() and continue_indicator:
		continue_indicator.visible = true


## Complete text animation immediately
func complete_text_animation() -> void:
	if not text_label:
		return

	is_animating = false
	displayed_characters = current_text.length()
	text_label.visible_characters = -1  # Show all

	if continue_indicator:
		continue_indicator.visible = true


## Show choice buttons
func show_choices(choices: Array) -> void:
	clear_choices()

	if not choices_container:
		return

	for i in range(choices.size()):
		var choice = choices[i]
		var button = Button.new()
		button.text = choice["text"]
		button.custom_minimum_size = Vector2(0, 40)

		# Connect button
		button.pressed.connect(_on_choice_button_pressed.bind(i))

		choices_container.add_child(button)

	if continue_indicator:
		continue_indicator.visible = false


## Clear choice buttons
func clear_choices() -> void:
	if not choices_container:
		return

	for child in choices_container.get_children():
		child.queue_free()


## Handle choice button pressed
func _on_choice_button_pressed(choice_index: int) -> void:
	choice_selected.emit(choice_index)

	# Forward to dialogue system
	var dialogue_system = get_node_or_null("/root/DialogueSystem")
	if dialogue_system:
		dialogue_system.select_choice(choice_index)


## Handle dialogue system signals
func _on_dialogue_started(dialogue_id: String) -> void:
	show_dialogue()


func _on_dialogue_ended(dialogue_id: String) -> void:
	hide_dialogue()


func _on_dialogue_line_shown(speaker: String, text: String, choices: Array) -> void:
	display_line(speaker, text, choices)


## Set speaker portrait
func set_portrait(texture: Texture2D) -> void:
	if portrait:
		portrait.texture = texture
		portrait.visible = texture != null


## Clear portrait
func clear_portrait() -> void:
	if portrait:
		portrait.texture = null
		portrait.visible = false
