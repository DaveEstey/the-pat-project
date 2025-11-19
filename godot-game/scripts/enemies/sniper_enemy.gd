extends "res://scripts/enemies/enemy_base.gd"
## SniperEnemy - Long-range precision enemy
##
## Behavior:
## - Stays at maximum range
## - Aims carefully before shooting (laser sight)
## - High damage, low fire rate
## - Repositions after each shot

@export var preferred_range: float = 30.0
@export var aim_duration: float = 1.5
@export var shoot_cooldown: float = 4.0
@export var sniper_damage: float = 35.0

var is_aiming: bool = false
var aim_timer: float = 0.0
var cooldown_timer: float = 0.0
var reposition_timer: float = 0.0
var projectile_scene: PackedScene


func _ready() -> void:
	super._ready()
	enemy_type = "sniper"
	max_health = 25.0
	current_health = max_health
	move_speed = 1.5
	damage = sniper_damage
	points = 225
	currency_reward = 35


func update_ai(delta: float) -> void:
	super.update_ai(delta)

	if target == null:
		return

	var distance = global_position.distance_to(target.global_position)

	# Update cooldown
	if cooldown_timer > 0:
		cooldown_timer -= delta

	# Update reposition timer
	if reposition_timer > 0:
		reposition_timer -= delta
		ai_state = "reposition"
	elif is_aiming:
		ai_state = "aiming"
		aim_timer += delta

		if aim_timer >= aim_duration:
			# Fire!
			shoot_sniper_shot()
			is_aiming = false
			aim_timer = 0.0
			cooldown_timer = shoot_cooldown
			reposition_timer = 2.0  # Reposition after shooting
	elif distance < preferred_range - 5.0:
		ai_state = "retreat"
	elif distance > preferred_range + 5.0:
		ai_state = "chase"
	else:
		# At good range, start aiming
		if cooldown_timer <= 0 and not is_aiming:
			is_aiming = true
			aim_timer = 0.0
			ai_state = "aiming"


func apply_movement(delta: float) -> void:
	if target == null:
		return

	var direction = (target.global_position - global_position).normalized()

	match ai_state:
		"retreat":
			velocity = -direction * move_speed
			move_and_slide()

		"chase":
			velocity = direction * move_speed * 0.7
			move_and_slide()

		"aiming":
			# Don't move while aiming
			velocity = Vector3.ZERO

		"reposition":
			# Strafe to new position
			var perpendicular = Vector3(-direction.z, 0, direction.x)
			var strafe_dir = 1 if randf() > 0.5 else -1
			velocity = perpendicular * strafe_dir * move_speed
			move_and_slide()


## Fire high-damage sniper shot
func shoot_sniper_shot() -> void:
	if target == null or projectile_scene == null:
		return

	# Very accurate shot directly at player
	var direction = (target.global_position - global_position).normalized()
	var spawn_pos = global_position + Vector3(0, 1.3, 0) + direction * 0.8

	var projectile = projectile_scene.instantiate()
	get_parent().add_child(projectile)
	projectile.global_position = spawn_pos
	projectile.setup(direction, 40.0, damage)  # Fast projectile

	print("[Enemy] Sniper fired precision shot!")
