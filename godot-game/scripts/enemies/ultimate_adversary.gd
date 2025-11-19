extends "res://scripts/enemies/boss_base.gd"
## UltimateAdversary - Level 12 Final Boss
##
## Phases:
## - Phase 1: All previous boss abilities combined
## - Phase 2: Enhanced versions, summons mini-bosses
## - Phase 3: Ultimate form, reality-bending attacks
## - Phase 4: Desperate final stand, all mechanics

@export var attack_cycle_duration: float = 10.0
@export var current_attack_phase: int = 0

var attack_timer: float = 0.0
var minion_spawn_timer: float = 0.0
var reality_distortion_active: bool = false

var projectile_scene: PackedScene


func _ready() -> void:
	boss_name = "THE ULTIMATE ADVERSARY"
	boss_subtitle = "Final Test of Skill and Courage"
	num_phases = 4  # 4 phases!
	max_health = 1500.0  # Massive health
	intro_duration = 6.0

	super._ready()


func update_ai(delta: float) -> void:
	super.update_ai(delta)

	if target == null or is_intro_playing:
		return

	# Cycle through attack patterns
	attack_timer += delta
	if attack_timer >= attack_cycle_duration:
		cycle_attack_pattern()
		attack_timer = 0.0

	# Constant minion spawning in phase 2+
	if current_phase >= 2:
		minion_spawn_timer += delta
		if minion_spawn_timer >= 8.0:
			spawn_mini_boss()
			minion_spawn_timer = 0.0

	# Reality distortion in phase 3+
	if current_phase >= 3 and not reality_distortion_active:
		activate_reality_distortion()


func apply_movement(delta: float) -> void:
	if target == null:
		return

	# Aggressive pursuit in phase 4
	if current_phase >= 4:
		var direction = (target.global_position - global_position).normalized()
		velocity = direction * move_speed * 2.0
		move_and_slide()
	else:
		# Strategic positioning
		var distance = global_position.distance_to(target.global_position)

		if distance < 10.0:
			# Back away
			var direction = (global_position - target.global_position).normalized()
			velocity = direction * move_speed
			move_and_slide()
		elif distance > 20.0:
			# Close distance
			var direction = (target.global_position - global_position).normalized()
			velocity = direction * move_speed * 0.5
			move_and_slide()


## Cycle through different attack patterns
func cycle_attack_pattern() -> void:
	current_attack_phase = (current_attack_phase + 1) % 4

	match current_attack_phase:
		0:
			attack_pattern_barrage()
		1:
			attack_pattern_wave()
		2:
			attack_pattern_tracking()
		3:
			attack_pattern_spiral()


## Attack Pattern 1: Rapid barrage
func attack_pattern_barrage() -> void:
	print("[Boss] Barrage attack!")

	for i in range(20):
		await get_tree().create_timer(0.1).timeout

		if target and projectile_scene:
			var direction = (target.global_position - global_position).normalized()
			var spread = Vector3(randf_range(-0.2, 0.2), 0, randf_range(-0.2, 0.2))
			var final_dir = (direction + spread).normalized()

			var projectile = projectile_scene.instantiate()
			get_parent().add_child(projectile)
			projectile.global_position = global_position + Vector3(0, 2.0, 0)
			projectile.setup(final_dir, 25.0, damage)


## Attack Pattern 2: Wave pattern
func attack_pattern_wave() -> void:
	print("[Boss] Wave attack!")

	var num_waves = 3
	for wave in range(num_waves):
		await get_tree().create_timer(0.5).timeout

		var num_projectiles = 12
		for i in range(num_projectiles):
			var angle = (float(i) / num_projectiles) * TAU
			var direction = Vector3(cos(angle), 0, sin(angle))

			if projectile_scene:
				var projectile = projectile_scene.instantiate()
				get_parent().add_child(projectile)
				projectile.global_position = global_position + Vector3(0, 2.0, 0)
				projectile.setup(direction, 18.0, damage)


## Attack Pattern 3: Tracking missiles
func attack_pattern_tracking() -> void:
	print("[Boss] Tracking missiles!")

	for i in range(8):
		await get_tree().create_timer(0.3).timeout

		# TODO: Create tracking projectile variant
		if target and projectile_scene:
			var direction = (target.global_position - global_position).normalized()
			var projectile = projectile_scene.instantiate()
			get_parent().add_child(projectile)
			projectile.global_position = global_position + Vector3(0, 2.0, 0)
			projectile.setup(direction, 30.0, damage * 1.2)


## Attack Pattern 4: Spiral
func attack_pattern_spiral() -> void:
	print("[Boss] Spiral attack!")

	var num_spirals = 40
	var angle_offset = 0.0

	for i in range(num_spirals):
		await get_tree().create_timer(0.05).timeout

		angle_offset += 0.3
		var direction = Vector3(cos(angle_offset), 0, sin(angle_offset))

		if projectile_scene:
			var projectile = projectile_scene.instantiate()
			get_parent().add_child(projectile)
			projectile.global_position = global_position + Vector3(0, 2.0, 0)
			projectile.setup(direction, 20.0, damage)


## Spawn mini-boss enemy
func spawn_mini_boss() -> void:
	# TODO: Spawn random previous boss as mini-boss
	print("[Boss] Spawned mini-boss!")


## Activate reality distortion
func activate_reality_distortion() -> void:
	reality_distortion_active = true

	# Visual effect - screen distortion
	# TODO: Apply post-processing effect

	# Slow player movement
	# TODO: Apply debuff to player

	print("[Boss] Reality distortion activated!")


## Special attack - Cataclysm
func trigger_special_attack() -> void:
	special_attack_started.emit("cataclysm")
	cataclysm_attack()


## Ultimate attack - Cataclysm
func cataclysm_attack() -> void:
	print("[Boss] CATACLYSM!")

	# Screen shake
	var screen_shake = get_node_or_null("/root/ScreenShake")
	if screen_shake:
		screen_shake.shake_massive()

	# Massive explosion
	var particle_system = get_node_or_null("/root/ParticleEffects")
	if particle_system:
		particle_system.create_explosion(global_position, 5.0, Color.RED)

	# Damage everything in large radius
	var damage_radius = 15.0
	if target and global_position.distance_to(target.global_position) <= damage_radius:
		if target.has_method("take_damage"):
			target.take_damage(damage * 2.0)


func update_phase_behavior() -> void:
	match current_phase:
		2:
			move_speed = 3.0
			attack_cycle_duration = 8.0
			special_attack_cooldown = 15.0
		3:
			move_speed = 4.0
			attack_cycle_duration = 6.0
			special_attack_cooldown = 12.0
		4:
			move_speed = 5.0
			attack_cycle_duration = 5.0
			special_attack_cooldown = 10.0
			damage *= 1.3


func phase_transition_effects() -> void:
	# Massive screen shake
	var screen_shake = get_node_or_null("/root/ScreenShake")
	if screen_shake:
		screen_shake.shake_massive()

	# Giant explosion
	var particle_system = get_node_or_null("/root/ParticleEffects")
	if particle_system:
		particle_system.create_explosion(global_position, 4.0, Color.DARK_RED)

	# Heal a bit
	current_health = min(current_health + (max_health * 0.1), max_health)

	print("[Boss] Phase %d - POWER SURGE!" % current_phase)
