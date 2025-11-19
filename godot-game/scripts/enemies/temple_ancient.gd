extends "res://scripts/enemies/boss_base.gd"
## TempleAncient - Level 9 Boss
##
## Phases:
## - Phase 1: Summons elemental attacks, pillars
## - Phase 2: Creates hazard zones, more elementals
## - Phase 3: Massive AOE attacks, constant hazards

@export var summon_interval: float = 5.0
@export var hazard_spawn_interval: float = 7.0
@export var elemental_count: int = 3

var summon_timer: float = 0.0
var hazard_timer: float = 0.0
var active_elementals: Array[Node3D] = []
var active_hazards: Array[Node3D] = []

var elemental_scene: PackedScene
var hazard_zone_scene: PackedScene
var projectile_scene: PackedScene


func _ready() -> void:
	boss_name = "TEMPLE ANCIENT ONE"
	boss_subtitle = "Keeper of Sacred Knowledge"
	num_phases = 3
	max_health = 900.0
	intro_duration = 5.0

	super._ready()


func update_ai(delta: float) -> void:
	super.update_ai(delta)

	if target == null or is_intro_playing:
		return

	# Update summon timer
	summon_timer += delta
	if summon_timer >= summon_interval:
		summon_elementals()
		summon_timer = 0.0

	# Update hazard timer (phase 2+)
	if current_phase >= 2:
		hazard_timer += delta
		if hazard_timer >= hazard_spawn_interval:
			spawn_hazard_zone()
			hazard_timer = 0.0


func apply_movement(delta: float) -> void:
	# Temple Ancient is stationary, levitating in place
	velocity = Vector3.ZERO

	# Levitation animation (optional - modify y position)
	var hover_offset = sin(Time.get_ticks_msec() * 0.001) * 0.3
	# position.y = base_y + hover_offset


## Summon elemental minions
func summon_elementals() -> void:
	if elemental_scene == null:
		return

	var num_to_summon = elemental_count + (current_phase - 1)

	for i in range(num_to_summon):
		var elemental = elemental_scene.instantiate()
		get_parent().add_child(elemental)

		# Random position around boss
		var angle = randf() * TAU
		var radius = randf_range(5.0, 10.0)
		var offset = Vector3(cos(angle) * radius, 0, sin(angle) * radius)
		elemental.global_position = global_position + offset

		active_elementals.append(elemental)

	print("[Boss] Summoned %d elementals" % num_to_summon)


## Spawn hazard zone on ground
func spawn_hazard_zone() -> void:
	if hazard_zone_scene == null or target == null:
		return

	# Spawn at player's current position
	var hazard = hazard_zone_scene.instantiate()
	get_parent().add_child(hazard)
	hazard.global_position = target.global_position

	active_hazards.append(hazard)

	print("[Boss] Spawned hazard zone")


## Special attack - Pillar crash
func trigger_special_attack() -> void:
	special_attack_started.emit("pillar_crash")
	pillar_crash_attack()


## Pillar crash attack
func pillar_crash_attack() -> void:
	print("[Boss] PILLAR CRASH!")

	# Spawn multiple falling pillars
	var num_pillars = 3 + current_phase

	for i in range(num_pillars):
		# Random position in arena
		var pos = Vector3(
			randf_range(-15.0, 15.0),
			0,
			randf_range(-15.0, 15.0)
		)

		# Create warning indicator
		create_pillar_warning(pos)

		# Schedule pillar impact
		get_tree().create_timer(1.5).timeout.connect(
			func(): pillar_impact(pos)
		)


## Create warning indicator for pillar
func create_pillar_warning(position: Vector3) -> void:
	# TODO: Create visual warning (red circle on ground)
	print("[Boss] Pillar warning at ", position)


## Pillar impacts ground
func pillar_impact(position: Vector3) -> void:
	# Deal damage in area
	var damage_radius = 3.0

	if target and global_position.distance_to(target.global_position) <= damage_radius:
		if target.has_method("take_damage"):
			target.take_damage(damage * 1.5)

	# Visual effect
	var particle_system = get_node_or_null("/root/ParticleEffects")
	if particle_system:
		particle_system.create_explosion(position, 1.2, Color.SADDLE_BROWN)


func update_phase_behavior() -> void:
	match current_phase:
		2:
			summon_interval = 4.0
			hazard_spawn_interval = 5.0
			elemental_count = 4
		3:
			summon_interval = 3.0
			hazard_spawn_interval = 3.0
			elemental_count = 5
			special_attack_cooldown = 6.0


func phase_transition_effects() -> void:
	# Clear all elementals and hazards
	for elemental in active_elementals:
		if is_instance_valid(elemental):
			elemental.queue_free()
	active_elementals.clear()

	for hazard in active_hazards:
		if is_instance_valid(hazard):
			hazard.queue_free()
	active_hazards.clear()

	# Massive shockwave
	var particle_system = get_node_or_null("/root/ParticleEffects")
	if particle_system:
		particle_system.create_explosion(global_position, 3.0, Color.GOLD)
