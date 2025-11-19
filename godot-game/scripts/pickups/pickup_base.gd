extends Area3D
## PickupBase - Base class for all collectible pickups
##
## Features:
## - Automatic collection on player contact
## - Bobbing animation
## - Rotation animation
## - Lifetime/despawn

class_name PickupBase

signal collected(player: Node3D)

@export var pickup_type: String = "generic"
@export var bob_height: float = 0.3
@export var bob_speed: float = 2.0
@export var rotation_speed: float = 2.0
@export var lifetime: float = 30.0  # Despawn after 30 seconds
@export var auto_collect_radius: float = 1.5

var time_alive: float = 0.0
var initial_y: float = 0.0

@onready var mesh: MeshInstance3D = $MeshInstance3D


func _ready() -> void:
	initial_y = global_position.y

	# Set up collision
	collision_layer = 16  # Pickup layer
	collision_mask = 2     # Can be collected by player

	add_to_group("pickup")

	# Connect signals
	body_entered.connect(_on_body_entered)


func _process(delta: float) -> void:
	time_alive += delta

	# Bobbing animation
	var bob_offset = sin(time_alive * bob_speed) * bob_height
	global_position.y = initial_y + bob_offset

	# Rotation animation
	if mesh:
		mesh.rotation.y += rotation_speed * delta

	# Lifetime check
	if lifetime > 0 and time_alive >= lifetime:
		despawn()


## Handle collection
func _on_body_entered(body: Node) -> void:
	if body.is_in_group("player"):
		collect(body)


## Collect pickup
func collect(player: Node3D) -> void:
	# Override in subclasses
	collected.emit(player)
	apply_effect(player)

	# Visual/audio feedback
	play_collect_effect()

	# Remove pickup
	queue_free()


## Apply pickup effect (override in subclasses)
func apply_effect(player: Node3D) -> void:
	pass


## Play collection effect
func play_collect_effect() -> void:
	# TODO: Particle effect and sound
	print("[Pickup] Collected: ", pickup_type)


## Despawn pickup
func despawn() -> void:
	queue_free()
