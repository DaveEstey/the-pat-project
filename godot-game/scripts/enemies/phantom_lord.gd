extends "res://scripts/enemies/boss_base.gd"
## PhantomLord - Level 6 Boss
##
## Phases:
## - Phase 1: Teleportation attacks, creates clones
## - Phase 2: Faster teleports, more clones, area attacks
## - Phase 3: Enraged, constant teleportation, clone swarm

@export var teleport_interval: float = 3.0
@export var clone_count: int = 2
@export var area_attack_cooldown: float = 8.0

var teleport_timer: float = 0.0
var area_attack_timer: float = 0.0
var active_clones: Array[Node3D] = []
var teleport_positions: Array[Vector3] = []

var phantom_clone_scene: PackedScene
var projectile_scene: PackedScene


func _ready() -> void:
	boss_name = "HAUNTED PHANTOM LORD"
	boss_subtitle = "Master of Dark Spirits"
	num_phases = 3
	max_health = 750.0
	intro_duration = 4.5

	super._ready()

	# Generate teleport positions
	generate_teleport_positions()


## Generate teleport positions around arena
func generate_teleport_positions() -> void:
	teleport_positions.clear()

	# Create positions in a circle
	var radius = 15.0
	var num_positions = 8

	for i in range(num_positions):
		var angle = (float(i) / num_positions) * TAU
		var pos = Vector3(
			cos(angle) * radius,
			0,
			sin(angle) * radius
		)
		teleport_positions.append(pos)


func update_ai(delta: float) -> void:
	super.update_ai(delta)

	if target == null or is_intro_playing:
		return

	# Update teleport timer
	teleport_timer += delta
	if teleport_timer >= teleport_interval:
		teleport_to_random_position()
		teleport_timer = 0.0

	# Update area attack timer
	area_attack_timer += delta
	if area_attack_timer >= area_attack_cooldown:
		trigger_special_attack()
		area_attack_timer = 0.0


func apply_movement(delta: float) -> void:
	# Phantom Lord doesn't move normally, only teleports
	velocity = Vector3.ZERO


## Teleport to random position
func teleport_to_random_position() -> void:
	if teleport_positions.is_empty():
		return

	# Pick random teleport position
	var new_pos = teleport_positions[randi() % teleport_positions.size()]

	# Teleport effect (before)
	create_teleport_effect(global_position, false)

	# Teleport
	global_position = new_pos

	# Teleport effect (after)
	create_teleport_effect(global_position, true)

	# Spawn clones on teleport in later phases
	if current_phase >= 2:
		spawn_clones()

	print("[Boss] Phantom teleported!")


## Create teleport visual effect
func create_teleport_effect(position: Vector3, is_arrival: bool) -> void:
	var particle_system = get_node_or_null("/root/ParticleEffects")
	if particle_system:
		var color = Color.PURPLE if is_arrival else Color.BLACK
		particle_system.create_explosion(position, 0.8, color)


## Spawn phantom clones
func spawn_clones() -> void:
	if phantom_clone_scene == null:
		return

	# Clear old clones
	for clone in active_clones:
		if is_instance_valid(clone):
			clone.queue_free()
	active_clones.clear()

	# Spawn new clones
	var clones_to_spawn = clone_count + (current_phase - 1)

	for i in range(clones_to_spawn):
		var clone = phantom_clone_scene.instantiate()
		get_parent().add_child(clone)

		# Position around boss
		var angle = (float(i) / clones_to_spawn) * TAU
		var offset = Vector3(cos(angle) * 3.0, 0, sin(angle) * 3.0)
		clone.global_position = global_position + offset

		active_clones.append(clone)

	print("[Boss] Spawned %d clones" % clones_to_spawn)


## Special attack - Dark wave
func trigger_special_attack() -> void:
	special_attack_started.emit("dark_wave")
	dark_wave_attack()


## Dark wave area attack
func dark_wave_attack() -> void:
	print("[Boss] DARK WAVE!")

	# Send out expanding wave of projectiles
	var num_projectiles = 16
	for i in range(num_projectiles):
		var angle = (float(i) / num_projectiles) * TAU
		var direction = Vector3(cos(angle), 0, sin(angle))

		if projectile_scene:
			var projectile = projectile_scene.instantiate()
			get_parent().add_child(projectile)
			projectile.global_position = global_position + Vector3(0, 1.5, 0)
			projectile.setup(direction, 15.0, damage)


func update_phase_behavior() -> void:
	match current_phase:
		2:
			teleport_interval = 2.0
			clone_count = 3
			area_attack_cooldown = 6.0
		3:
			teleport_interval = 1.5
			clone_count = 4
			area_attack_cooldown = 4.0


func phase_transition_effects() -> void:
	# Massive explosion during phase change
	var particle_system = get_node_or_null("/root/ParticleEffects")
	if particle_system:
		particle_system.create_explosion(global_position, 2.0, Color.DARK_VIOLET)

	# Clear all clones
	for clone in active_clones:
		if is_instance_valid(clone):
			clone.queue_free()
	active_clones.clear()
