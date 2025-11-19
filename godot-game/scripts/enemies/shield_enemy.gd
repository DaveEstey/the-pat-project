extends "res://scripts/enemies/enemy_base.gd"
## ShieldEnemy - Defensive enemy with frontal shield
##
## Behavior:
## - Has frontal shield that blocks damage
## - Must be shot from behind or sides
## - Rotates to face player
## - Medium health, medium damage

@export var shield_active: bool = true
@export var shield_health: float = 50.0
@export var rotation_speed: float = 3.0
@export var shoot_interval: float = 2.0

var current_shield_health: float
var shoot_timer: float = 0.0
var projectile_scene: PackedScene


func _ready() -> void:
	super._ready()
	enemy_type = "shield"
	max_health = 50.0
	current_health = max_health
	current_shield_health = shield_health
	move_speed = 1.8
	damage = 12.0
	points = 250
	currency_reward = 30


func update_ai(delta: float) -> void:
	super.update_ai(delta)

	if target == null:
		return

	# Always face player
	rotate_toward_player(delta)

	# Shoot periodically
	shoot_timer += delta
	if shoot_timer >= shoot_interval:
		shoot_at_player()
		shoot_timer = 0.0


func apply_movement(delta: float) -> void:
	if target == null:
		return

	var distance = global_position.distance_to(target.global_position)

	if distance > 12.0:
		# Advance slowly
		var direction = (target.global_position - global_position).normalized()
		velocity = direction * move_speed
		move_and_slide()
	else:
		# At good range, just rotate to track player
		velocity = Vector3.ZERO


## Rotate to face player
func rotate_toward_player(delta: float) -> void:
	if target == null:
		return

	var direction = target.global_position - global_position
	var target_angle = atan2(direction.x, direction.z)
	var current_angle = rotation.y

	# Smoothly rotate toward target
	rotation.y = lerp_angle(current_angle, target_angle, rotation_speed * delta)


## Take damage with shield protection
func take_damage(amount: float, hit_position: Vector3) -> void:
	if not is_alive or is_spawning:
		return

	# Check if hit from front (shield protects)
	if shield_active and current_shield_health > 0:
		var to_hit = (hit_position - global_position).normalized()
		var forward = -transform.basis.z
		var dot = forward.dot(to_hit)

		if dot > 0.5:  # Hit from front
			# Shield absorbs damage
			current_shield_health -= amount

			if current_shield_health <= 0:
				shield_active = false
				print("[Enemy] Shield destroyed!")

			show_damage_feedback(hit_position)
			return

	# Hit from behind/side or shield down
	super.take_damage(amount, hit_position)


func shoot_at_player() -> void:
	if target == null or projectile_scene == null:
		return

	var direction = (target.global_position - global_position).normalized()
	var spawn_pos = global_position + Vector3(0, 1.3, 0) + direction * 0.8

	var projectile = projectile_scene.instantiate()
	get_parent().add_child(projectile)
	projectile.global_position = spawn_pos
	projectile.setup(direction, 18.0, damage)

	print("[Enemy] ShieldEnemy fired!")
