extends Control
## TutorialPopup - Shows tutorial hints to player
##
## Features:
## - Appears on screen with tutorial text
## - Can be dismissed
## - Auto-dismiss after duration

@export var auto_dismiss_duration: float = 8.0

@onready var tutorial_title: Label = $Panel/VBoxContainer/TitleLabel
@onready var tutorial_text: Label = $Panel/VBoxContainer/TextLabel
@onready var dismiss_button: Button = $Panel/VBoxContainer/DismissButton

var dismiss_timer: float = 0.0
var auto_dismiss: bool = true


func _ready() -> void:
	hide()

	if dismiss_button:
		dismiss_button.pressed.connect(_on_dismiss_pressed)

	# Connect to tutorial system
	var tutorial_system = get_node_or_null("/root/TutorialSystem")
	if tutorial_system:
		tutorial_system.tutorial_shown.connect(_on_tutorial_shown)


func _process(delta: float) -> void:
	if not visible or not auto_dismiss:
		return

	dismiss_timer += delta

	if dismiss_timer >= auto_dismiss_duration:
		dismiss()


## Show tutorial
func _on_tutorial_shown(tutorial_id: String) -> void:
	var tutorial_system = get_node("/root/TutorialSystem")
	if not tutorial_system:
		return

	tutorial_title.text = tutorial_system.get_tutorial_title(tutorial_id)
	tutorial_text.text = tutorial_system.get_tutorial_text(tutorial_id)

	dismiss_timer = 0.0
	show()


## Dismiss tutorial
func dismiss() -> void:
	hide()


## Handle dismiss button
func _on_dismiss_pressed() -> void:
	dismiss()
