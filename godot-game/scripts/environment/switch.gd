extends StaticBody3D
## Switch - Activatable switch for puzzles
##
## Features:
## - Toggle or one-time activation
## - Linked to other objects (doors, platforms, etc.)
## - Visual feedback
## - Can be shot or interacted with

signal switch_activated()
signal switch_deactivated()

@export var switch_type: String = "toggle"  # toggle, one_time, timed
@export var requires_shooting: bool = false
@export var timed_duration: float = 5.0
@export var can_reactivate: bool = true

var is_active: bool = false
var is_locked: bool = false
var timer: float = 0.0

var linked_objects: Array[Node] = []

@onready var mesh: MeshInstance3D = $Mesh
@onready var light: OmniLight3D = $Light
@onready var interact_area: Area3D = $InteractArea


func _ready() -> void:
	update_visual_state()

	if interact_area:
		interact_area.body_entered.connect(_on_body_entered)


func _process(delta: float) -> void:
	# Timed switch countdown
	if switch_type == "timed" and is_active and timer > 0:
		timer -= delta

		if timer <= 0:
			deactivate()


## Activate switch
func activate() -> void:
	if is_locked:
		return

	if switch_type == "one_time" and is_active:
		return

	is_active = true

	# Start timer for timed switches
	if switch_type == "timed":
		timer = timed_duration

	# Lock one-time switches
	if switch_type == "one_time":
		is_locked = true

	update_visual_state()

	# Activate linked objects
	activate_linked_objects()

	switch_activated.emit()

	print("[Switch] Activated")


## Deactivate switch
func deactivate() -> void:
	if not is_active:
		return

	if switch_type == "one_time":
		return  # Can't deactivate one-time switches

	is_active = false
	timer = 0.0

	update_visual_state()

	# Deactivate linked objects
	deactivate_linked_objects()

	switch_deactivated.emit()

	print("[Switch] Deactivated")


## Toggle switch state
func toggle() -> void:
	if is_active:
		deactivate()
	else:
		activate()


## Update visual state
func update_visual_state() -> void:
	if not light:
		return

	if is_active:
		light.light_color = Color.GREEN
		light.light_energy = 2.0
	else:
		light.light_color = Color.RED
		light.light_energy = 0.5

	# TODO: Update mesh material color


## Link object to switch
func link_object(object: Node) -> void:
	if object not in linked_objects:
		linked_objects.append(object)


## Unlink object
func unlink_object(object: Node) -> void:
	linked_objects.erase(object)


## Activate all linked objects
func activate_linked_objects() -> void:
	for obj in linked_objects:
		if obj.has_method("activate"):
			obj.activate()
		elif obj.has_method("open_door"):
			obj.open_door()


## Deactivate all linked objects
func deactivate_linked_objects() -> void:
	for obj in linked_objects:
		if obj.has_method("deactivate"):
			obj.deactivate()
		elif obj.has_method("close_door"):
			obj.close_door()


## Handle damage (for shootable switches)
func take_damage(amount: float, hit_position: Vector3) -> void:
	if requires_shooting:
		if switch_type == "toggle":
			toggle()
		else:
			activate()


## Handle body entered
func _on_body_entered(body: Node3D) -> void:
	if body.is_in_group("player") and not requires_shooting:
		if switch_type == "toggle":
			toggle()
		else:
			activate()


## Get remaining time (for timed switches)
func get_remaining_time() -> float:
	return timer


## Check if switch is on
func is_switch_active() -> bool:
	return is_active
