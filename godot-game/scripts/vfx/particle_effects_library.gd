extends Node
## ParticleEffectsLibrary - Centralized particle effect management
##
## Features:
## - Object pooling for performance
## - Pre-configured effect templates
## - One-shot and looping effects
## - Automatic cleanup

var effect_pool: Dictionary = {}  # effect_name -> Array of instances
var max_pool_size: int = 50

# Effect definitions (templates)
const EFFECTS: Dictionary = {
	"muzzle_flash": {
		"lifetime": 0.1,
		"amount": 10,
		"color": Color(1.0, 0.9, 0.5, 1.0),
		"scale": 0.5,
		"spread": 15.0
	},
	"bullet_impact": {
		"lifetime": 0.3,
		"amount": 20,
		"color": Color(0.8, 0.8, 0.8, 1.0),
		"scale": 0.3,
		"spread": 30.0
	},
	"blood_splatter": {
		"lifetime": 0.5,
		"amount": 30,
		"color": Color(0.8, 0.0, 0.0, 1.0),
		"scale": 0.4,
		"gravity": true
	},
	"explosion_small": {
		"lifetime": 1.0,
		"amount": 50,
		"color_start": Color(1.0, 0.8, 0.3, 1.0),
		"color_end": Color(0.5, 0.1, 0.0, 0.0),
		"scale_start": 1.0,
		"scale_end": 3.0,
		"spread": 180.0
	},
	"explosion_large": {
		"lifetime": 1.5,
		"amount": 100,
		"color_start": Color(1.0, 0.6, 0.1, 1.0),
		"color_end": Color(0.3, 0.0, 0.0, 0.0),
		"scale_start": 2.0,
		"scale_end": 5.0,
		"spread": 180.0,
		"force": 10.0
	},
	"smoke_puff": {
		"lifetime": 2.0,
		"amount": 20,
		"color_start": Color(0.5, 0.5, 0.5, 0.8),
		"color_end": Color(0.3, 0.3, 0.3, 0.0),
		"scale_start": 0.5,
		"scale_end": 2.0,
		"velocity": Vector3(0, 1, 0)
	},
	"fire_burst": {
		"lifetime": 0.8,
		"amount": 40,
		"color_start": Color(1.0, 0.5, 0.0, 1.0),
		"color_end": Color(1.0, 0.0, 0.0, 0.0),
		"scale": 0.6,
		"spread": 90.0
	},
	"electric_spark": {
		"lifetime": 0.4,
		"amount": 25,
		"color": Color(0.5, 0.8, 1.0, 1.0),
		"scale": 0.2,
		"spread": 45.0,
		"flicker": true
	},
	"heal_particles": {
		"lifetime": 1.0,
		"amount": 30,
		"color": Color(0.0, 1.0, 0.3, 0.8),
		"scale": 0.4,
		"velocity": Vector3(0, 2, 0),
		"looping": true
	},
	"level_up": {
		"lifetime": 1.5,
		"amount": 50,
		"color_start": Color(1.0, 1.0, 0.0, 1.0),
		"color_end": Color(1.0, 0.5, 0.0, 0.0),
		"scale": 0.5,
		"velocity": Vector3(0, 3, 0),
		"spiral": true
	},
	"pickup_collect": {
		"lifetime": 0.5,
		"amount": 20,
		"color": Color(1.0, 1.0, 0.8, 1.0),
		"scale": 0.3,
		"implode": true
	},
	"dash_trail": {
		"lifetime": 0.3,
		"amount": 15,
		"color": Color(0.5, 0.8, 1.0, 0.6),
		"scale": 0.4,
		"trail": true
	},
	"teleport_in": {
		"lifetime": 0.6,
		"amount": 40,
		"color_start": Color(0.5, 0.0, 1.0, 1.0),
		"color_end": Color(0.0, 0.0, 0.5, 0.0),
		"scale": 0.5,
		"implode": true
	},
	"teleport_out": {
		"lifetime": 0.6,
		"amount": 40,
		"color_start": Color(0.5, 0.0, 1.0, 1.0),
		"color_end": Color(0.0, 0.0, 0.5, 0.0),
		"scale": 0.5,
		"explode": true
	},
	"freeze_impact": {
		"lifetime": 0.8,
		"amount": 30,
		"color": Color(0.5, 0.8, 1.0, 1.0),
		"scale": 0.4,
		"spread": 60.0,
		"icicle": true
	},
	"poison_cloud": {
		"lifetime": 3.0,
		"amount": 50,
		"color_start": Color(0.2, 0.8, 0.2, 0.6),
		"color_end": Color(0.0, 0.4, 0.0, 0.0),
		"scale": 1.0,
		"looping": true
	},
	"shield_break": {
		"lifetime": 0.5,
		"amount": 30,
		"color": Color(0.3, 0.6, 1.0, 1.0),
		"scale": 0.5,
		"spread": 180.0,
		"shatter": true
	},
	"rocket_trail": {
		"lifetime": 0.4,
		"amount": 10,
		"color": Color(1.0, 0.6, 0.2, 0.8),
		"scale": 0.6,
		"trail": true,
		"looping": true
	},
	"laser_impact": {
		"lifetime": 0.2,
		"amount": 15,
		"color": Color(1.0, 0.2, 0.2, 1.0),
		"scale": 0.3,
		"spread": 30.0,
		"glow": true
	}
}


## Spawn particle effect at position
func spawn_effect(effect_name: String, position: Vector3, rotation: Vector3 = Vector3.ZERO) -> Node3D:
	if effect_name not in EFFECTS:
		print("[VFX] Unknown effect: %s" % effect_name)
		return null

	var effect_data = EFFECTS[effect_name]

	# Create particle system
	var particles = create_particle_system(effect_data)

	if not particles:
		return null

	# Set position and rotation
	particles.global_position = position
	particles.global_rotation = rotation

	# Add to scene
	get_tree().root.add_child(particles)

	# Start emitting
	particles.emitting = true

	# Auto-cleanup if not looping
	if not effect_data.get("looping", false):
		var lifetime = effect_data.get("lifetime", 1.0)
		await get_tree().create_timer(lifetime + 0.5).timeout
		if is_instance_valid(particles):
			particles.queue_free()

	return particles


## Create particle system from template
func create_particle_system(effect_data: Dictionary) -> GPUParticles3D:
	var particles = GPUParticles3D.new()

	# Basic properties
	particles.amount = effect_data.get("amount", 20)
	particles.lifetime = effect_data.get("lifetime", 1.0)
	particles.one_shot = not effect_data.get("looping", false)
	particles.explosiveness = effect_data.get("explosiveness", 0.8)

	# Process material
	var material = ParticleProcessMaterial.new()

	# Emission
	material.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_SPHERE
	material.emission_sphere_radius = effect_data.get("spread", 1.0) * 0.1

	# Initial velocity
	if effect_data.has("velocity"):
		var vel = effect_data["velocity"]
		material.initial_velocity_min = vel.length()
		material.initial_velocity_max = vel.length() * 1.2
		material.direction = vel.normalized()
	else:
		material.initial_velocity_min = 1.0
		material.initial_velocity_max = 3.0

	# Spread
	material.spread = effect_data.get("spread", 45.0)

	# Gravity
	if effect_data.get("gravity", false):
		material.gravity = Vector3(0, -9.8, 0)
	else:
		material.gravity = Vector3.ZERO

	# Color
	if effect_data.has("color"):
		material.color = effect_data["color"]
	elif effect_data.has("color_start"):
		material.color = effect_data["color_start"]
		# TODO: Add color ramp for gradient

	# Scale
	if effect_data.has("scale"):
		material.scale_min = effect_data["scale"]
		material.scale_max = effect_data["scale"] * 1.2
	elif effect_data.has("scale_start"):
		material.scale_min = effect_data["scale_start"]
		material.scale_max = effect_data["scale_end"]

	# Special effects
	if effect_data.get("implode", false):
		material.radial_accel_min = -5.0
		material.radial_accel_max = -10.0

	if effect_data.get("explode", false):
		material.radial_accel_min = 5.0
		material.radial_accel_max = 10.0

	if effect_data.get("spiral", false):
		material.angular_velocity_min = 45.0
		material.angular_velocity_max = 90.0

	particles.process_material = material

	# Draw pass (simple quad mesh)
	var quad_mesh = QuadMesh.new()
	quad_mesh.size = Vector2(0.5, 0.5)
	particles.draw_pass_1 = quad_mesh

	return particles


## Spawn explosion with screen shake
func spawn_explosion(position: Vector3, size: String = "small") -> void:
	var effect_name = "explosion_%s" % size
	spawn_effect(effect_name, position)

	# Add screen shake
	var screen_shake = get_node_or_null("/root/ScreenShake")
	if screen_shake:
		match size:
			"small":
				screen_shake.add_trauma(0.3)
			"large":
				screen_shake.add_trauma(0.8)


## Spawn muzzle flash on weapon
func spawn_muzzle_flash(weapon_position: Vector3, weapon_forward: Vector3) -> void:
	spawn_effect("muzzle_flash", weapon_position, weapon_forward)


## Spawn bullet impact
func spawn_bullet_impact(position: Vector3, normal: Vector3, is_enemy: bool = false) -> void:
	if is_enemy:
		spawn_effect("blood_splatter", position, normal)
	else:
		spawn_effect("bullet_impact", position, normal)


## Spawn continuous effect (returns handle for stopping)
func spawn_continuous_effect(effect_name: String, position: Vector3) -> Node3D:
	if effect_name not in EFFECTS:
		return null

	var effect_data = EFFECTS[effect_name]

	# Force looping
	var modified_data = effect_data.duplicate()
	modified_data["looping"] = true

	var particles = create_particle_system(modified_data)
	particles.global_position = position

	get_tree().root.add_child(particles)
	particles.emitting = true

	return particles


## Stop continuous effect
func stop_continuous_effect(particles: Node3D) -> void:
	if not is_instance_valid(particles):
		return

	if particles is GPUParticles3D:
		particles.emitting = false

		# Wait for particles to die out
		await get_tree().create_timer(particles.lifetime).timeout

		if is_instance_valid(particles):
			particles.queue_free()


## Spawn trail effect (follows object)
func create_trail(tracked_object: Node3D, effect_name: String = "dash_trail") -> Node3D:
	var particles = spawn_continuous_effect(effect_name, tracked_object.global_position)

	if particles:
		# Parent to tracked object so it follows
		tracked_object.add_child(particles)
		particles.position = Vector3.ZERO

	return particles


## Create effect at multiple positions (burst pattern)
func spawn_burst_pattern(effect_name: String, center: Vector3, count: int = 8, radius: float = 2.0) -> void:
	var angle_step = TAU / count

	for i in range(count):
		var angle = angle_step * i
		var offset = Vector3(cos(angle) * radius, 0, sin(angle) * radius)
		spawn_effect(effect_name, center + offset)


## Spawn line of effects (beam impact, etc.)
func spawn_line_effect(effect_name: String, start: Vector3, end: Vector3, spacing: float = 0.5) -> void:
	var direction = (end - start).normalized()
	var distance = start.distance_to(end)
	var steps = int(distance / spacing)

	for i in range(steps):
		var position = start + (direction * spacing * i)
		spawn_effect(effect_name, position)


## Cleanup all active effects
func cleanup_all_effects() -> void:
	var particles_nodes = get_tree().get_nodes_in_group("vfx_particles")

	for node in particles_nodes:
		if is_instance_valid(node):
			node.queue_free()
