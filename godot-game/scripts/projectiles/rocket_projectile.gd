extends RigidBody3D
## RocketProjectile - Physics-based explosive projectile
##
## Features:
## - Accelerates over time
## - Homing capability when locked on
## - Explodes on impact or after lifetime
## - Area damage with falloff

signal exploded(position: Vector3, damage: float)

var direct_damage: float = 100.0
var splash_damage: float = 60.0
var explosion_radius: float = 8.0
var rocket_speed: float = 30.0
var acceleration: float = 10.0

var homing_target: Node3D = null
var homing_strength: float = 5.0

var lifetime: float = 5.0
var time_alive: float = 0.0

var has_exploded: bool = false

@onready var collision_shape: CollisionShape3D = $CollisionShape3D
@onready var mesh: MeshInstance3D = $Mesh
@onready var trail_particles: GPUParticles3D = $TrailParticles


func _ready() -> void:
	# Set initial velocity
	linear_velocity = -global_transform.basis.z * rocket_speed

	# Enable continuous collision detection
	continuous_cd = true
	contact_monitor = true
	max_contacts_reported = 5

	# Connect collision signal
	body_entered.connect(_on_body_entered)


func _physics_process(delta: float) -> void:
	if has_exploded:
		return

	time_alive += delta

	# Check lifetime
	if time_alive >= lifetime:
		explode()
		return

	# Accelerate
	var current_speed = linear_velocity.length()
	var target_speed = rocket_speed + (acceleration * time_alive)
	var forward = -global_transform.basis.z

	# Apply homing
	if homing_target and is_instance_valid(homing_target):
		var to_target = (homing_target.global_position - global_position).normalized()
		forward = forward.lerp(to_target, homing_strength * delta).normalized()

	# Set velocity
	linear_velocity = forward * min(current_speed + (acceleration * delta), target_speed)

	# Rotate to face direction
	look_at(global_position + linear_velocity.normalized(), Vector3.UP)


## Configure rocket
func configure(
	p_direct_damage: float,
	p_splash_damage: float,
	p_explosion_radius: float,
	p_speed: float,
	p_acceleration: float,
	p_homing_target: Node3D,
	p_homing_strength: float
) -> void:
	direct_damage = p_direct_damage
	splash_damage = p_splash_damage
	explosion_radius = p_explosion_radius
	rocket_speed = p_speed
	acceleration = p_acceleration
	homing_target = p_homing_target
	homing_strength = p_homing_strength


## Handle collision
func _on_body_entered(body: Node) -> void:
	if has_exploded:
		return

	# Direct hit damage
	if body.is_in_group("enemy"):
		if body.has_method("take_damage"):
			body.take_damage(direct_damage, global_position)

	# Explode
	explode()


## Explode
func explode() -> void:
	if has_exploded:
		return

	has_exploded = true

	# Deal area damage
	deal_area_damage()

	# Create explosion effect
	create_explosion_effect()

	# Emit signal
	exploded.emit(global_position, splash_damage)

	# Remove rocket
	queue_free()


## Deal area damage
func deal_area_damage() -> void:
	# Get physics space
	var space_state = get_world_3d().direct_space_state

	# Create sphere query
	var query = PhysicsShapeQueryParameters3D.new()
	var sphere = SphereShape3D.new()
	sphere.radius = explosion_radius
	query.shape = sphere
	query.transform = Transform3D(Basis(), global_position)
	query.collision_mask = 0b0000_0000_0000_0100  # Enemy layer

	# Query for enemies in radius
	var results = space_state.intersect_shape(query)

	for result in results:
		var body = result["collider"]

		if body.has_method("take_damage"):
			# Calculate distance falloff
			var distance = global_position.distance_to(body.global_position)
			var falloff = 1.0 - (distance / explosion_radius)
			falloff = max(falloff, 0.3)  # Minimum 30% damage

			var damage = splash_damage * falloff

			# Apply damage
			body.take_damage(damage, body.global_position)

	# Check for player damage (self-damage)
	var player = get_node_or_null("/root/GameManager")
	if player:
		var distance_to_player = global_position.distance_to(player.global_position)
		if distance_to_player <= explosion_radius:
			var falloff = 1.0 - (distance_to_player / explosion_radius)
			var player_damage = splash_damage * falloff * 0.5  # 50% self-damage
			# TODO: Apply player damage


## Create explosion effect
func create_explosion_effect() -> void:
	# TODO: Spawn explosion particle effect

	# Screen shake
	var screen_shake = get_node_or_null("/root/ScreenShake")
	if screen_shake:
		screen_shake.add_trauma(0.6)

	# Camera shake based on distance
	var camera = get_viewport().get_camera_3d()
	if camera:
		var distance = global_position.distance_to(camera.global_position)
		if distance <= explosion_radius * 2:
			var shake_strength = 1.0 - (distance / (explosion_radius * 2))
			# Apply camera shake
			pass

	print("[Rocket] Exploded at %s (Radius: %f)" % [global_position, explosion_radius])
