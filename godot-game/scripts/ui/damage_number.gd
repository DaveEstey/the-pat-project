extends Node3D
## DamageNumber - Floating damage number display
##
## Features:
## - Floats upward from hit position
## - Color-coded by damage type
## - Fades out over time
## - Critical hit styling

@export var float_speed: float = 2.0
@export var lifetime: float = 1.5
@export var spread_amount: float = 0.5

var damage_amount: float = 0.0
var is_critical: bool = false
var is_heal: bool = false
var time_alive: float = 0.0

@onready var label_3d: Label3D = $Label3D


func _ready() -> void:
	# Random horizontal spread
	var random_offset = Vector3(
		randf_range(-spread_amount, spread_amount),
		0,
		randf_range(-spread_amount, spread_amount)
	)
	global_position += random_offset

	# Setup label
	update_label()


func _process(delta: float) -> void:
	time_alive += delta

	# Float upward
	global_position.y += float_speed * delta

	# Fade out
	var fade = 1.0 - (time_alive / lifetime)
	if label_3d:
		label_3d.modulate.a = fade

	# Scale up for critical
	if is_critical and time_alive < 0.3:
		var scale_factor = 1.0 + (sin(time_alive * 20.0) * 0.2)
		scale = Vector3.ONE * scale_factor

	# Remove when done
	if time_alive >= lifetime:
		queue_free()


## Setup damage number
func setup(damage: float, critical: bool = false, heal: bool = false) -> void:
	damage_amount = damage
	is_critical = critical
	is_heal = heal

	update_label()


## Update label appearance
func update_label() -> void:
	if not label_3d:
		return

	# Set text
	if is_heal:
		label_3d.text = "+%d" % int(damage_amount)
	else:
		label_3d.text = "%d" % int(damage_amount)

	# Set color
	if is_heal:
		label_3d.modulate = Color.GREEN
	elif is_critical:
		label_3d.modulate = Color.YELLOW
	else:
		label_3d.modulate = Color.WHITE

	# Set size
	if is_critical:
		label_3d.font_size = 32
	else:
		label_3d.font_size = 24

	# Billboard mode
	label_3d.billboard = BaseMaterial3D.BILLBOARD_ENABLED
