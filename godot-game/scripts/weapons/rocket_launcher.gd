extends Node3D
## RocketLauncher - Explosive area damage weapon
##
## Features:
## - High splash damage
## - Slow projectile with physics
## - Self-damage if too close
## - Lock-on targeting system
## - Ammo scarcity (low max ammo)

signal rocket_fired(target_position: Vector3)
signal rocket_exploded(explosion_position: Vector3, damage: float)
signal target_locked(target: Node3D)

@export var direct_damage: float = 100.0
@export var splash_damage: float = 60.0
@export var explosion_radius: float = 8.0
@export var self_damage_multiplier: float = 0.5

@export var fire_rate: float = 2.0  # Seconds between shots
@export var reload_time: float = 3.0
@export var max_ammo: int = 1  # One rocket at a time
@export var max_reserve_ammo: int = 12

@export var rocket_speed: float = 30.0
@export var rocket_acceleration: float = 10.0  # Accelerates over time
@export var rocket_lifetime: float = 5.0

@export var lock_on_time: float = 1.5  # Time to lock onto target
@export var lock_on_range: float = 50.0
@export var homing_strength: float = 5.0

var current_ammo: int = 1
var reserve_ammo: int = 12
var is_reloading: bool = false
var can_fire: bool = true
var fire_timer: float = 0.0

var is_locking_on: bool = false
var lock_on_timer: float = 0.0
var locked_target: Node3D = null

var rocket_scene: PackedScene  # TODO: Create rocket projectile scene

@onready var muzzle_position: Marker3D = $MuzzlePosition
@onready var lock_on_raycast: RayCast3D = $LockOnRaycast


func _ready() -> void:
	current_ammo = max_ammo
	reserve_ammo = max_reserve_ammo

	if lock_on_raycast:
		lock_on_raycast.enabled = true
		lock_on_raycast.target_position = Vector3(0, 0, -lock_on_range)


func _process(delta: float) -> void:
	# Update fire timer
	if fire_timer > 0:
		fire_timer -= delta
		if fire_timer <= 0:
			can_fire = true

	# Update lock-on
	if is_locking_on:
		update_lock_on(delta)


## Start lock-on
func start_lock_on() -> void:
	if is_reloading or current_ammo <= 0:
		return

	is_locking_on = true
	lock_on_timer = 0.0
	locked_target = null


## Stop lock-on
func stop_lock_on() -> void:
	is_locking_on = false
	lock_on_timer = 0.0
	locked_target = null


## Update lock-on system
func update_lock_on(delta: float) -> void:
	if not lock_on_raycast:
		return

	lock_on_raycast.force_raycast_update()

	if lock_on_raycast.is_colliding():
		var collider = lock_on_raycast.get_collider()

		if collider and collider.is_in_group("enemy"):
			# Increment lock-on progress
			lock_on_timer += delta

			if lock_on_timer >= lock_on_time:
				# Target locked!
				locked_target = collider
				target_locked.emit(locked_target)
		else:
			# Lost target
			lock_on_timer = 0.0
			locked_target = null
	else:
		# No target
		lock_on_timer = 0.0
		locked_target = null


## Fire weapon
func fire() -> bool:
	if not can_fire or current_ammo <= 0 or is_reloading:
		return false

	current_ammo -= 1
	can_fire = false
	fire_timer = fire_rate
	is_locking_on = false

	# Spawn rocket projectile
	spawn_rocket()

	# Auto-reload
	if current_ammo <= 0:
		reload()

	return true


## Spawn rocket projectile
func spawn_rocket() -> void:
	var rocket = create_rocket_instance()

	if not rocket:
		return

	# Set position and rotation
	if muzzle_position:
		rocket.global_position = muzzle_position.global_position
		rocket.global_rotation = muzzle_position.global_rotation
	else:
		rocket.global_position = global_position
		rocket.global_rotation = global_rotation

	# Configure rocket
	rocket.configure(
		direct_damage,
		splash_damage,
		explosion_radius,
		rocket_speed,
		rocket_acceleration,
		locked_target,
		homing_strength
	)

	# Add to scene
	get_tree().root.add_child(rocket)

	rocket_fired.emit(rocket.global_position)

	# Clear locked target
	locked_target = null
	lock_on_timer = 0.0


## Create rocket instance
func create_rocket_instance() -> Node3D:
	# TODO: Instantiate from rocket_scene when available
	# For now, create a basic rocket
	var rocket = Node3D.new()
	rocket.set_script(load("res://scripts/projectiles/rocket_projectile.gd"))
	return rocket


## Reload weapon
func reload() -> void:
	if is_reloading or reserve_ammo <= 0 or current_ammo >= max_ammo:
		return

	is_reloading = true
	stop_lock_on()

	# Wait for reload time
	await get_tree().create_timer(reload_time).timeout

	# Calculate ammo to reload
	var ammo_needed = max_ammo - current_ammo
	var ammo_to_reload = min(ammo_needed, reserve_ammo)

	current_ammo += ammo_to_reload
	reserve_ammo -= ammo_to_reload

	is_reloading = false
	can_fire = true
	fire_timer = 0.0

	print("[RocketLauncher] Reloaded: %d/%d (Reserve: %d)" % [current_ammo, max_ammo, reserve_ammo])


## Add ammo
func add_ammo(amount: int) -> void:
	reserve_ammo = min(reserve_ammo + amount, max_reserve_ammo)


## Get ammo info
func get_ammo_info() -> Dictionary:
	return {
		"current": current_ammo,
		"reserve": reserve_ammo,
		"max": max_ammo
	}


## Get lock-on progress (0.0 to 1.0)
func get_lock_on_progress() -> float:
	if not is_locking_on:
		return 0.0
	return min(lock_on_timer / lock_on_time, 1.0)


## Check if target is locked
func is_target_locked() -> bool:
	return locked_target != null
