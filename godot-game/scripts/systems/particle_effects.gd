extends Node
## ParticleEffects - Centralized particle effect spawning system
##
## Features:
## - Muzzle flash
## - Hit effects (blood, sparks)
## - Explosion effects
## - Trails
## - Environmental effects

# Particle scene cache
var particle_scenes: Dictionary = {}

# Effect pools for performance
var effect_pool: Array[GPUParticles3D] = []
var max_pool_size: int = 50


func _ready() -> void:
	# Preload or generate particle scenes
	setup_particle_scenes()


## Setup particle scene references
func setup_particle_scenes() -> void:
	# TODO: Load actual particle scenes when created
	# For now, we'll generate them procedurally
	pass


## Create muzzle flash effect
func create_muzzle_flash(position: Vector3, color: Color = Color.YELLOW) -> void:
	var particles = get_pooled_particles()
	if not particles:
		particles = create_basic_particles()

	particles.global_position = position
	particles.emitting = true
	particles.amount = 20
	particles.lifetime = 0.2
	particles.one_shot = true

	# Configure for muzzle flash
	var material = particles.process_material as ParticleProcessMaterial
	if material:
		material.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_SPHERE
		material.emission_sphere_radius = 0.3
		material.initial_velocity_min = 2.0
		material.initial_velocity_max = 4.0
		material.color = color

	get_tree().root.add_child(particles)

	# Auto-cleanup
	await get_tree().create_timer(particles.lifetime).timeout
	return_to_pool(particles)


## Create blood splatter effect
func create_blood_effect(position: Vector3, direction: Vector3, intensity: float = 1.0) -> void:
	var particles = get_pooled_particles()
	if not particles:
		particles = create_basic_particles()

	particles.global_position = position
	particles.emitting = true
	particles.amount = int(15 * intensity)
	particles.lifetime = 0.5
	particles.one_shot = true

	var material = particles.process_material as ParticleProcessMaterial
	if material:
		material.direction = direction
		material.spread = 30.0
		material.initial_velocity_min = 3.0
		material.initial_velocity_max = 6.0
		material.color = Color.DARK_RED
		material.gravity = Vector3(0, -9.8, 0)

	get_tree().root.add_child(particles)

	await get_tree().create_timer(particles.lifetime).timeout
	return_to_pool(particles)


## Create hit spark effect
func create_hit_effect(position: Vector3, normal: Vector3, color: Color = Color.ORANGE) -> void:
	var particles = get_pooled_particles()
	if not particles:
		particles = create_basic_particles()

	particles.global_position = position
	particles.emitting = true
	particles.amount = 10
	particles.lifetime = 0.3
	particles.one_shot = true

	var material = particles.process_material as ParticleProcessMaterial
	if material:
		material.direction = normal
		material.spread = 45.0
		material.initial_velocity_min = 4.0
		material.initial_velocity_max = 8.0
		material.color = color

	get_tree().root.add_child(particles)

	await get_tree().create_timer(particles.lifetime).timeout
	return_to_pool(particles)


## Create explosion effect
func create_explosion(position: Vector3, intensity: float = 1.0, color: Color = Color.ORANGE) -> void:
	var particles = get_pooled_particles()
	if not particles:
		particles = create_basic_particles()

	particles.global_position = position
	particles.emitting = true
	particles.amount = int(50 * intensity)
	particles.lifetime = 0.8
	particles.one_shot = true

	var material = particles.process_material as ParticleProcessMaterial
	if material:
		material.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_SPHERE
		material.emission_sphere_radius = 0.5 * intensity
		material.initial_velocity_min = 5.0 * intensity
		material.initial_velocity_max = 12.0 * intensity
		material.color = color
		material.gravity = Vector3(0, -5.0, 0)

	get_tree().root.add_child(particles)

	# Screen shake for explosions
	var screen_shake = get_node_or_null("/root/ScreenShake")
	if screen_shake:
		if intensity > 1.5:
			screen_shake.shake_large()
		else:
			screen_shake.shake_medium()

	await get_tree().create_timer(particles.lifetime).timeout
	return_to_pool(particles)


## Create bullet trail effect
func create_bullet_trail(start_pos: Vector3, end_pos: Vector3, duration: float = 0.1) -> void:
	# Create line renderer for bullet trail
	var trail = MeshInstance3D.new()
	var mesh = ImmediateMesh.new()
	trail.mesh = mesh

	get_tree().root.add_child(trail)

	# Draw line
	mesh.surface_begin(Mesh.PRIMITIVE_LINES)
	mesh.surface_add_vertex(start_pos)
	mesh.surface_add_vertex(end_pos)
	mesh.surface_end()

	# Fade out and remove
	await get_tree().create_timer(duration).timeout
	trail.queue_free()


## Create shell casing ejection
func create_shell_casing(position: Vector3, direction: Vector3) -> void:
	# TODO: Create actual shell casing mesh
	pass


## Get particles from pool
func get_pooled_particles() -> GPUParticles3D:
	if effect_pool.is_empty():
		return null

	return effect_pool.pop_back()


## Return particles to pool
func return_to_pool(particles: GPUParticles3D) -> void:
	if effect_pool.size() >= max_pool_size:
		particles.queue_free()
		return

	particles.get_parent().remove_child(particles)
	effect_pool.append(particles)


## Create basic particle system
func create_basic_particles() -> GPUParticles3D:
	var particles = GPUParticles3D.new()

	# Create material
	var material = ParticleProcessMaterial.new()
	particles.process_material = material

	# Basic mesh (small sphere)
	var mesh = SphereMesh.new()
	mesh.radius = 0.05
	mesh.height = 0.1
	particles.draw_pass_1 = mesh

	return particles
