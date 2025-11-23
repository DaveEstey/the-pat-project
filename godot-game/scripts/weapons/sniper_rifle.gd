extends Node3D
## SniperRifle - High-damage precision weapon
##
## Features:
## - Very high damage per shot
## - Perfect accuracy when scoped
## - Slow fire rate and reload
## - Zoom/scope functionality
## - Bullet penetration

signal scope_toggled(is_scoped: bool)
signal shot_fired(hit_position: Vector3, is_headshot: bool)

@export var damage: float = 75.0
@export var headshot_multiplier: float = 2.5
@export var fire_rate: float = 1.2  # Seconds between shots
@export var reload_time: float = 2.5
@export var max_ammo: int = 5
@export var max_reserve_ammo: int = 30

@export var scope_zoom_fov: float = 20.0  # FOV when scoped
@export var scope_time: float = 0.3  # Time to scope in/out
@export var bullet_penetration: int = 2  # Can hit multiple enemies

@export var recoil_amount: float = 15.0
@export var accuracy_standing: float = 0.98
@export var accuracy_moving: float = 0.85
@export var accuracy_scoped: float = 1.0

var current_ammo: int = 5
var reserve_ammo: int = 30
var is_reloading: bool = false
var can_fire: bool = true
var is_scoped: bool = false

var fire_timer: float = 0.0

@onready var raycast: RayCast3D = $RayCast3D
@onready var muzzle_position: Marker3D = $MuzzlePosition


func _ready() -> void:
	current_ammo = max_ammo
	reserve_ammo = max_reserve_ammo

	if raycast:
		raycast.enabled = true
		raycast.target_position = Vector3(0, 0, -1000)  # Very long range


func _process(delta: float) -> void:
	# Update fire timer
	if fire_timer > 0:
		fire_timer -= delta
		if fire_timer <= 0:
			can_fire = true


## Toggle scope
func toggle_scope() -> void:
	is_scoped = not is_scoped
	scope_toggled.emit(is_scoped)

	# Get camera to adjust FOV
	var camera = get_viewport().get_camera_3d()
	if camera:
		if is_scoped:
			# Zoom in
			var tween = create_tween()
			tween.tween_property(camera, "fov", scope_zoom_fov, scope_time)
		else:
			# Zoom out
			var tween = create_tween()
			tween.tween_property(camera, "fov", 75.0, scope_time)


## Fire weapon
func fire() -> bool:
	if not can_fire or current_ammo <= 0 or is_reloading:
		return false

	current_ammo -= 1
	can_fire = false
	fire_timer = fire_rate

	# Calculate accuracy based on state
	var accuracy = accuracy_standing
	if is_scoped:
		accuracy = accuracy_scoped
	else:
		# Check if player is moving
		var player = get_node_or_null("/root/GameManager/Player")
		if player and player.velocity.length() > 0.1:
			accuracy = accuracy_moving

	# Perform raycast
	if raycast:
		raycast.force_raycast_update()

		# Apply spread based on accuracy
		var spread = (1.0 - accuracy) * 0.1
		var random_spread = Vector3(
			randf_range(-spread, spread),
			randf_range(-spread, spread),
			0
		)

		raycast.target_position = Vector3(0, 0, -1000) + random_spread
		raycast.force_raycast_update()

		if raycast.is_colliding():
			handle_hit(raycast.get_collider(), raycast.get_collision_point())

	# Apply recoil
	apply_recoil()

	# Create muzzle flash
	create_muzzle_flash()

	# Check auto-reload
	if current_ammo <= 0 and reserve_ammo > 0:
		reload()

	return true


## Handle hit with penetration
func handle_hit(collider: Node3D, hit_position: Vector3) -> void:
	var hits_remaining = bullet_penetration
	var current_collider = collider
	var current_hit_pos = hit_position

	while hits_remaining > 0 and current_collider:
		if current_collider.is_in_group("enemy"):
			var final_damage = damage

			# Check for headshot
			var is_headshot = check_headshot(current_collider, current_hit_pos)
			if is_headshot:
				final_damage *= headshot_multiplier

			# Apply damage
			current_collider.take_damage(final_damage, current_hit_pos)

			shot_fired.emit(current_hit_pos, is_headshot)

			# Notify combo system
			if is_headshot:
				var combo_system = get_node_or_null("/root/ComboSystem")
				if combo_system:
					# Headshot bonus
					pass

			hits_remaining -= 1
		else:
			# Hit environment, stop penetration
			break

		# Continue raycast for penetration
		if hits_remaining > 0:
			raycast.add_exception(current_collider)
			raycast.force_raycast_update()

			if raycast.is_colliding():
				current_collider = raycast.get_collider()
				current_hit_pos = raycast.get_collision_point()
			else:
				break

	# Clear exceptions
	raycast.clear_exceptions()


## Check if hit is a headshot
func check_headshot(enemy: Node3D, hit_position: Vector3) -> bool:
	if not enemy.has_method("get_headshot_area"):
		# Approximate: check if hit is in upper portion of enemy
		var enemy_top = enemy.global_position.y + 1.5  # Approximate head height
		return hit_position.y >= enemy_top - 0.3

	return enemy.get_headshot_area().overlaps_point(hit_position)


## Reload weapon
func reload() -> void:
	if is_reloading or reserve_ammo <= 0 or current_ammo >= max_ammo:
		return

	is_reloading = true

	# If scoped, unscope
	if is_scoped:
		toggle_scope()

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

	print("[SniperRifle] Reloaded: %d/%d (Reserve: %d)" % [current_ammo, max_ammo, reserve_ammo])


## Apply recoil
func apply_recoil() -> void:
	var camera = get_viewport().get_camera_3d()
	if camera:
		# Strong upward recoil
		camera.rotation_degrees.x -= recoil_amount

		# Create recovery tween
		var tween = create_tween()
		tween.tween_property(camera, "rotation_degrees:x", camera.rotation_degrees.x + recoil_amount * 0.7, 0.3)


## Create muzzle flash
func create_muzzle_flash() -> void:
	# TODO: Add visual muzzle flash effect
	pass


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
