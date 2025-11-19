extends StaticBody3D
## Turret - Stationary automated turret hazard
##
## Features:
## - Rotates to track target
## - Shoots periodically
## - Can be destroyed
## - Only attacks player (not enemies)

@export var health: float = 50.0
@export var detection_range: float = 20.0
@export var shoot_interval: float = 2.0
@export var turret_damage: float = 15.0
@export var projectile_speed: float = 25.0

var is_destroyed: bool = false
var shoot_timer: float = 0.0
var target: Node3D = null

var projectile_scene: PackedScene

@onready var turret_head: Node3D = $TurretHead
@onready var barrel: Node3D = $TurretHead/Barrel


func _ready() -> void:
	add_to_group("turret")
	collision_layer = 1
	collision_mask = 0


func _process(delta: float) -> void:
	if is_destroyed:
		return

	# Find player if not targeting
	if target == null:
		find_target()

	# Track target
	if target and is_instance_valid(target):
		track_target(delta)

		# Check if in range
		var distance = global_position.distance_to(target.global_position)
		if distance <= detection_range:
			shoot_timer += delta

			if shoot_timer >= shoot_interval:
				shoot()
				shoot_timer = 0.0
		else:
			target = null


## Find player target
func find_target() -> void:
	var player = get_tree().get_first_node_in_group("player")
	if player:
		target = player


## Track target with rotation
func track_target(delta: float) -> void:
	if not turret_head or not target:
		return

	var direction = target.global_position - turret_head.global_position
	var target_angle = atan2(direction.x, direction.z)

	# Rotate turret head
	turret_head.rotation.y = lerp_angle(turret_head.rotation.y, target_angle, 3.0 * delta)


## Shoot at target
func shoot() -> void:
	if not target or not barrel or projectile_scene == null:
		return

	var direction = (target.global_position - barrel.global_position).normalized()
	var spawn_pos = barrel.global_position + direction * 0.5

	var projectile = projectile_scene.instantiate()
	get_tree().root.add_child(projectile)
	projectile.global_position = spawn_pos
	projectile.setup(direction, projectile_speed, turret_damage)
	projectile.is_player_projectile = false  # Turret attacks player

	print("[Turret] Fired at player!")


## Take damage
func take_damage(amount: float, _hit_position: Vector3 = Vector3.ZERO) -> void:
	if is_destroyed:
		return

	health -= amount

	if health <= 0:
		destroy()


## Destroy turret
func destroy() -> void:
	is_destroyed = true

	# Explosion effect
	var particle_system = get_node_or_null("/root/ParticleEffects")
	if particle_system:
		particle_system.create_explosion(global_position, 1.0, Color.ORANGE)

	queue_free()
