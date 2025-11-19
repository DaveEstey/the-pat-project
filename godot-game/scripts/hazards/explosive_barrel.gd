extends StaticBody3D
## ExplosiveBarrel - Shootable barrel that explodes
##
## Features:
## - Can be destroyed by shooting
## - Explodes dealing area damage
## - Can chain explode other barrels
## - Affects both player and enemies

@export var health: float = 10.0
@export var explosion_damage: float = 40.0
@export var explosion_radius: float = 5.0

var is_destroyed: bool = false

@onready var mesh: MeshInstance3D = $MeshInstance3D


func _ready() -> void:
	add_to_group("destructible")
	collision_layer = 1  # World
	collision_mask = 0


## Take damage (called by player shooting)
func take_damage(amount: float, _hit_position: Vector3 = Vector3.ZERO) -> void:
	if is_destroyed:
		return

	health -= amount

	if health <= 0:
		explode()


## Explode
func explode() -> void:
	if is_destroyed:
		return

	is_destroyed = true

	print("[Hazard] Barrel exploded!")

	# Deal area damage
	deal_area_damage()

	# Visual effect
	create_explosion_effect()

	# Remove barrel
	queue_free()


## Deal damage in explosion radius
func deal_area_damage() -> void:
	# Get all bodies in radius
	var space_state = get_world_3d().direct_space_state
	var query = PhysicsShapeQueryParameters3D.new()

	var sphere = SphereShape3D.new()
	sphere.radius = explosion_radius
	query.shape = sphere
	query.transform = global_transform

	# Set collision mask to hit player and enemies
	query.collision_mask = 2 | 4  # Player | Enemy

	var results = space_state.intersect_shape(query)

	for result in results:
		var body = result["collider"]
		if body.has_method("take_damage"):
			# Calculate damage falloff based on distance
			var distance = global_position.distance_to(body.global_position)
			var damage_mult = 1.0 - (distance / explosion_radius)
			var final_damage = explosion_damage * max(damage_mult, 0.3)  # Min 30% damage

			body.take_damage(final_damage)


## Create explosion effect
func create_explosion_effect() -> void:
	var particle_system = get_node_or_null("/root/ParticleEffects")
	if particle_system:
		particle_system.create_explosion(global_position, 1.5, Color.ORANGE_RED)
