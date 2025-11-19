extends CharacterBody3D
## PlayerController - First-person shooter controls
##
## Features:
## - WASD movement on rails (Z-axis only in this game)
## - Mouse look
## - Weapon firing via WeaponSystem
## - Health management
## - Damage feedback

@export var mouse_sensitivity: float = 0.003
@export var movement_speed: float = 5.0
@export var movement_bounds: Vector2 = Vector2(-10, 10)  # Left/Right bounds

# Movement (on rails, primarily X-axis strafe)
var movement_direction: Vector2 = Vector2.ZERO
var forward_progress: float = 0.0  # Automatic forward movement

# Camera
@onready var camera: Camera3D = $Camera3D
@onready var weapon_holder: Node3D = $Camera3D/WeaponHolder
@onready var raycast: RayCast3D = $Camera3D/RayCast3D

# Systems
var weapon_system: Node
var screen_shake: Node
var game_manager: Node

# State
var can_shoot: bool = true
var is_alive: bool = true

# Hit detection
var crosshair_position: Vector2


func _ready() -> void:
	# Capture mouse
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED

	# Get systems
	weapon_system = get_node("/root/WeaponSystem")
	screen_shake = get_node("/root/ScreenShake")
	game_manager = get_node("/root/GameManager")

	# Setup screen shake camera
	if screen_shake:
		screen_shake.set_camera(camera)

	# Setup raycast
	raycast.enabled = true
	raycast.target_position = Vector3(0, 0, -100)  # Shoot forward


func _input(event: InputEvent) -> void:
	# Mouse look
	if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		rotate_y(-event.relative.x * mouse_sensitivity)
		camera.rotate_x(-event.relative.y * mouse_sensitivity)

		# Clamp camera rotation
		camera.rotation.x = clamp(camera.rotation.x, -PI/2, PI/2)

	# Escape to pause
	if event.is_action_pressed("pause"):
		if Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
			Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
			game_manager.set_game_state(game_manager.GameState.PAUSED)
		else:
			Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
			game_manager.set_game_state(game_manager.GameState.PLAYING)


func _physics_process(delta: float) -> void:
	if not is_alive:
		return

	# Get input
	movement_direction = Input.get_vector("move_left", "move_right", "move_forward", "move_back")

	# Apply movement (primarily strafe left/right)
	velocity.x = movement_direction.x * movement_speed

	# Clamp position to bounds
	position.x = clamp(position.x, movement_bounds.x, movement_bounds.y)

	# Auto-forward movement (on rails)
	velocity.z = -movement_direction.y * movement_speed * 0.5

	move_and_slide()

	# Handle shooting
	if Input.is_action_pressed("shoot") and can_shoot:
		fire_weapon()

	# Handle reload
	if Input.is_action_just_pressed("reload"):
		weapon_system.reload()

	# Handle weapon switch
	if Input.is_action_just_pressed("next_weapon"):
		weapon_system.next_weapon()


## Fire current weapon
func fire_weapon() -> void:
	if not weapon_system:
		return

	if not weapon_system.try_fire():
		return

	# Get weapon stats
	var weapon_stats = weapon_system.get_current_weapon_stats()

	# Cast ray to detect hit
	raycast.force_raycast_update()

	if raycast.is_colliding():
		var collider = raycast.get_collider()
		var hit_point = raycast.get_collision_point()
		var hit_normal = raycast.get_collision_normal()

		# Check what we hit
		if collider.is_in_group("enemy"):
			# Hit enemy
			if collider.has_method("take_damage"):
				collider.take_damage(weapon_stats["damage"], hit_point)

				# Record hit
				if game_manager:
					game_manager.record_shot(true)

				# Small screen shake
				if screen_shake:
					screen_shake.shake_small()

				# Spawn hit particles
				spawn_hit_effect(hit_point, hit_normal)

		elif collider.is_in_group("puzzle"):
			# Hit puzzle element
			if collider.has_method("on_shot"):
				collider.on_shot()

		# Record shot
		if game_manager:
			if not collider.is_in_group("enemy"):
				game_manager.record_shot(false)  # Missed
	else:
		# Missed completely
		if game_manager:
			game_manager.record_shot(false)

	# Spawn muzzle flash
	spawn_muzzle_flash()

	# Play sound effect
	play_weapon_sound(weapon_system.current_weapon)


## Spawn muzzle flash effect
func spawn_muzzle_flash() -> void:
	# TODO: Instantiate muzzle flash particle scene
	pass


## Spawn hit effect at impact point
func spawn_hit_effect(position: Vector3, normal: Vector3) -> void:
	# TODO: Instantiate hit particle scene
	pass


## Play weapon sound
func play_weapon_sound(weapon_name: String) -> void:
	# TODO: Play appropriate weapon sound
	print("[Sound] Weapon fired: ", weapon_name)


## Take damage
func take_damage(amount: float) -> void:
	if not is_alive:
		return

	# Apply damage through game manager
	game_manager.damage_player(amount)

	# Medium screen shake
	if screen_shake:
		screen_shake.shake_medium()

	# Break combo
	if has_node("/root/ComboSystem"):
		get_node("/root/ComboSystem").break_combo()

	# Show damage indicator
	show_damage_indicator()

	# Check if dead
	if game_manager.player_health <= 0:
		die()


## Show damage indicator UI
func show_damage_indicator() -> void:
	# TODO: Trigger damage vignette effect
	pass


## Player death
func die() -> void:
	is_alive = false
	can_shoot = false

	# TODO: Death animation/effect
	print("[Player] Died!")


## Heal player
func heal(amount: float) -> void:
	if game_manager:
		game_manager.heal_player(amount)
