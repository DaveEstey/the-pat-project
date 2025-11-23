extends Control
## MinimapMarker - Individual marker on minimap
##
## Features:
## - Different marker types (enemy, objective, pickup, etc.)
## - Custom colors and icons
## - Tooltips on hover

@export var marker_type: String = "enemy"
@export var marker_color: Color = Color.RED
@export var marker_size: Vector2 = Vector2(6, 6)
@export var show_tooltip: bool = true
@export var tooltip_text: String = ""

@onready var marker_rect: ColorRect = $MarkerRect
@onready var tooltip_label: Label = $Tooltip


func _ready() -> void:
	# Setup marker appearance
	if marker_rect:
		marker_rect.color = marker_color
		marker_rect.custom_minimum_size = marker_size

	# Setup tooltip
	if tooltip_label:
		tooltip_label.text = tooltip_text
		tooltip_label.visible = false


func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
			_on_marker_clicked()


func _on_mouse_entered() -> void:
	if show_tooltip and tooltip_label and not tooltip_text.is_empty():
		tooltip_label.visible = true


func _on_mouse_exited() -> void:
	if tooltip_label:
		tooltip_label.visible = false


func _on_marker_clicked() -> void:
	# Emit signal or perform action
	print("[MinimapMarker] Clicked: %s" % marker_type)


## Update marker position (called by minimap)
func update_position(minimap_pos: Vector2) -> void:
	position = minimap_pos - (marker_size / 2)


## Set marker color
func set_marker_color(color: Color) -> void:
	marker_color = color
	if marker_rect:
		marker_rect.color = color


## Set tooltip
func set_tooltip(text: String) -> void:
	tooltip_text = text
	if tooltip_label:
		tooltip_label.text = text
