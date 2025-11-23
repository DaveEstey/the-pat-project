extends StaticBody3D
## InteractiveDoor - Doors that can be opened/closed
##
## Features:
## - Key requirements
## - Automatic or manual opening
## - Slide or swing animations
## - One-way or two-way

signal door_opened()
signal door_closed()
signal door_locked_tried()

@export var door_type: String = "slide"  # slide, swing, vertical
@export var requires_key: bool = false
@export var required_key_id: String = ""
@export var auto_open: bool = true
@export var auto_close: bool = true
@export var auto_close_delay: float = 3.0
@export var one_way: bool = false
@export var open_distance: float = 3.0
@export var open_time: float = 1.0

var is_open: bool = false
var is_animating: bool = false
var auto_close_timer: float = 0.0

var initial_position: Vector3
var initial_rotation: Vector3

@onready var collision_shape: CollisionShape3D = $CollisionShape3D
@onready var mesh: MeshInstance3D = $Mesh
@onready var interact_area: Area3D = $InteractArea


func _ready() -> void:
	initial_position = position
	initial_rotation = rotation

	if interact_area:
		interact_area.body_entered.connect(_on_body_entered)
		interact_area.body_exited.connect(_on_body_exited)


func _process(delta: float) -> void:
	# Auto-close timer
	if is_open and auto_close and auto_close_timer > 0:
		auto_close_timer -= delta

		if auto_close_timer <= 0:
			close_door()


## Try to interact with door
func interact(player: Node3D) -> bool:
	# Check key requirement
	if requires_key:
		var inventory = get_node_or_null("/root/InventorySystem")
		if inventory:
			if not inventory.has_item(required_key_id):
				door_locked_tried.emit()
				print("[Door] Locked! Requires: %s" % required_key_id)
				return false

	# Toggle door
	if is_open:
		close_door()
	else:
		open_door()

	return true


## Open door
func open_door() -> void:
	if is_open or is_animating:
		return

	is_animating = true

	match door_type:
		"slide":
			slide_open()
		"swing":
			swing_open()
		"vertical":
			vertical_open()

	is_open = true
	is_animating = false

	# Disable collision
	if collision_shape:
		collision_shape.disabled = true

	# Start auto-close timer
	if auto_close:
		auto_close_timer = auto_close_delay

	door_opened.emit()

	print("[Door] Opened")


## Close door
func close_door() -> void:
	if not is_open or is_animating:
		return

	is_animating = true

	# Return to initial state
	var tween = create_tween()
	tween.set_parallel(true)
	tween.tween_property(self, "position", initial_position, open_time)
	tween.tween_property(self, "rotation", initial_rotation, open_time)

	await tween.finished

	is_open = false
	is_animating = false

	# Enable collision
	if collision_shape:
		collision_shape.disabled = false

	door_closed.emit()

	print("[Door] Closed")


## Slide door open
func slide_open() -> void:
	var target_position = initial_position + (transform.basis.x * open_distance)

	var tween = create_tween()
	tween.tween_property(self, "position", target_position, open_time)

	await tween.finished


## Swing door open
func swing_open() -> void:
	var target_rotation = initial_rotation + Vector3(0, deg_to_rad(90), 0)

	var tween = create_tween()
	tween.tween_property(self, "rotation", target_rotation, open_time)

	await tween.finished


## Vertical door open (like elevator door)
func vertical_open() -> void:
	var target_position = initial_position + Vector3(0, open_distance, 0)

	var tween = create_tween()
	tween.tween_property(self, "position", target_position, open_time)

	await tween.finished


## Handle body entered interact area
func _on_body_entered(body: Node3D) -> void:
	if not auto_open:
		return

	if body.is_in_group("player"):
		open_door()


## Handle body exited interact area
func _on_body_exited(body: Node3D) -> void:
	# Stop auto-close timer when player leaves
	pass
