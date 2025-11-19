extends "res://scripts/enemies/boss_base.gd"
## UndergroundGuardian - Level 3 Boss
##
## Phases:
## - Phase 1: Standard shooting with spawns
## - Phase 2: Faster movement, more minions
## - Phase 3: Enraged, rapid fire, constant spawns

@export var minion_spawn_interval: float = 8.0
@export var shoot_interval: float = 1.0

var minion_timer: float = 0.0
var shoot_timer: float = 0.0
var projectile_scene: PackedScene

# Minion enemy scenes
var basic_shooter_scene: PackedScene


func _ready() -> void:
	boss_name = "THE UNDERGROUND GUARDIAN"
	boss_subtitle = "Defender of the Fortress Depths"
	num_phases = 3
	max_health = 600.0
	intro_duration = 4.0

	super._ready()


func update_ai(delta: float) -> void:
	super.update_ai(delta)

	if target == null or is_intro_playing:
		return

	# Shoot periodically
	shoot_timer += delta
	var current_shoot_interval = shoot_interval / (1.0 if not is_enraged else 0.5)
	if shoot_timer >= current_shoot_interval:
		shoot_triple_burst()
		shoot_timer = 0.0

	# Spawn minions
	minion_timer += delta
	var current_minion_interval = minion_spawn_interval / current_phase
	if minion_timer >= current_minion_interval:
		spawn_minions()
		minion_timer = 0.0


func apply_movement(delta: float) -> void:
	if target == null:
		return

	var distance = global_position.distance_to(target.global_position)

	if distance > 15.0:
		# Move toward player
		var direction = (target.global_position - global_position).normalized()
		velocity = direction * move_speed
		move_and_slide()
	else:
		# Circle strafe
		var to_player = (target.global_position - global_position).normalized()
		var perpendicular = Vector3(-to_player.z, 0, to_player.x)
		velocity = perpendicular * move_speed * 1.5
		move_and_slide()


func trigger_special_attack() -> void:
	special_attack_started.emit("ground_slam")
	ground_slam_attack()


## Shoot triple burst
func shoot_triple_burst() -> void:
	if target == null or projectile_scene == null:
		return

	for i in range(3):
		await get_tree().create_timer(0.1 * i).timeout

		var direction = (target.global_position - global_position).normalized()
		var spawn_pos = global_position + Vector3(0, 1.8, 0) + direction * 1.0

		var projectile = projectile_scene.instantiate()
		get_parent().add_child(projectile)
		projectile.global_position = spawn_pos
		projectile.setup(direction, 22.0, damage)


## Spawn support minions
func spawn_minions() -> void:
	if basic_shooter_scene == null:
		return

	var num_minions = current_phase
	for i in range(num_minions):
		var offset = Vector3(randf_range(-5, 5), 0, randf_range(-5, 5))
		var spawn_pos = global_position + offset

		var minion = basic_shooter_scene.instantiate()
		get_parent().add_child(minion)
		minion.global_position = spawn_pos

	print("[Boss] Spawned %d minions" % num_minions)


## Ground slam area attack
func ground_slam_attack() -> void:
	print("[Boss] GROUND SLAM!")

	# Deal damage to player if in range
	if target and global_position.distance_to(target.global_position) < 8.0:
		if target.has_method("take_damage"):
			target.take_damage(damage * 1.5)


func update_phase_behavior() -> void:
	match current_phase:
		2:
			move_speed = 3.0
			minion_spawn_interval = 6.0
		3:
			move_speed = 4.0
			minion_spawn_interval = 4.0
			shoot_interval = 0.7
