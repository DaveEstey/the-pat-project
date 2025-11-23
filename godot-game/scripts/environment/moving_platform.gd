extends AnimatableBody3D
## MovingPlatform - Platform that moves between waypoints
##
## Features:
## - Multiple waypoint support
## - Speed control
## - Wait time at waypoints
## - Loop or ping-pong movement
## - Can be activated by switches

signal waypoint_reached(waypoint_index: int)
signal platform_started()
signal platform_stopped()

@export var waypoints: Array[Vector3] = []
@export var move_speed: float = 2.0
@export var wait_time: float = 1.0
@export var loop_type: String = "loop"  # loop, ping_pong, one_way
@export var start_automatically: bool = true
@export var carry_objects: bool = true

var is_moving: bool = false
var current_waypoint_index: int = 0
var direction: int = 1  # 1 = forward, -1 = backward
var wait_timer: float = 0.0
var is_waiting: bool = false

var initial_position: Vector3
var carried_bodies: Array[Node3D] = []

@onready var detection_area: Area3D = $DetectionArea


func _ready() -> void:
	initial_position = global_position

	# If no waypoints defined, create default ones
	if waypoints.is_empty():
		waypoints.append(initial_position)
		waypoints.append(initial_position + Vector3(0, 5, 0))

	# Make waypoints global
	for i in range(waypoints.size()):
		waypoints[i] += initial_position

	if detection_area:
		detection_area.body_entered.connect(_on_body_entered)
		detection_area.body_exited.connect(_on_body_exited)

	if start_automatically:
		start_moving()


func _physics_process(delta: float) -> void:
	if not is_moving:
		return

	# Handle wait time
	if is_waiting:
		wait_timer -= delta

		if wait_timer <= 0:
			is_waiting = false
			advance_waypoint()

		return

	# Move towards current waypoint
	var target_position = waypoints[current_waypoint_index]
	var distance_to_target = global_position.distance_to(target_position)

	if distance_to_target < 0.1:
		# Reached waypoint
		global_position = target_position
		waypoint_reached.emit(current_waypoint_index)

		# Start waiting
		is_waiting = true
		wait_timer = wait_time

		return

	# Move towards target
	var direction_to_target = (target_position - global_position).normalized()
	var velocity = direction_to_target * move_speed * delta

	# Move platform
	var previous_position = global_position
	global_position += velocity

	# Move carried objects
	if carry_objects:
		var movement = global_position - previous_position
		move_carried_bodies(movement)


## Start moving
func start_moving() -> void:
	if is_moving:
		return

	is_moving = true
	platform_started.emit()

	print("[Platform] Started moving")


## Stop moving
func stop_moving() -> void:
	if not is_moving:
		return

	is_moving = false
	platform_stopped.emit()

	print("[Platform] Stopped")


## Advance to next waypoint
func advance_waypoint() -> void:
	match loop_type:
		"loop":
			current_waypoint_index = (current_waypoint_index + 1) % waypoints.size()

		"ping_pong":
			current_waypoint_index += direction

			if current_waypoint_index >= waypoints.size():
				current_waypoint_index = waypoints.size() - 2
				direction = -1
			elif current_waypoint_index < 0:
				current_waypoint_index = 1
				direction = 1

		"one_way":
			current_waypoint_index += 1

			if current_waypoint_index >= waypoints.size():
				stop_moving()
				return


## Move carried bodies
func move_carried_bodies(movement: Vector3) -> void:
	for body in carried_bodies:
		if is_instance_valid(body):
			body.global_position += movement


## Handle body entered detection area
func _on_body_entered(body: Node3D) -> void:
	if carry_objects and body.is_in_group("player"):
		if body not in carried_bodies:
			carried_bodies.append(body)


## Handle body exited detection area
func _on_body_exited(body: Node3D) -> void:
	carried_bodies.erase(body)


## Activate (for switch control)
func activate() -> void:
	start_moving()


## Deactivate (for switch control)
func deactivate() -> void:
	stop_moving()


## Reset to initial position
func reset_platform() -> void:
	global_position = initial_position
	current_waypoint_index = 0
	direction = 1
	is_waiting = false
	wait_timer = 0.0
