extends "res://scripts/enemies/enemy_base.gd"
## FastDebuffer - Speedy enemy that applies debuffs
##
## Behavior:
## - Erratic circular movement
## - Never stops moving
## - Applies debuffs on hit (slow, damage over time)
## - Low health, high evasion

@export var circle_radius: float = 12.0
@export var circle_speed: float = 6.0
@export var debuff_duration: float = 3.0
@export var shoot_interval: float = 1.0

var circle_angle: float = 0.0
var circle_center: Vector3
var shoot_timer: float = 0.0
var projectile_scene: PackedScene


func _ready() -> void:
	super._ready()
	enemy_type = "fast_debuffer"
	max_health = 25.0
	current_health = max_health
	move_speed = circle_speed
	damage = 5.0
	points = 175
	currency_reward = 25

	# Set random starting angle
	circle_angle = randf() * TAU


func update_ai(delta: float) -> void:
	super.update_ai(delta)

	if target == null:
		return

	# Always in attack mode (circling)
	ai_state = "attack"

	# Update circle center (player position)
	circle_center = target.global_position

	# Update shoot timer
	shoot_timer += delta
	if shoot_timer >= shoot_interval:
		shoot_debuff_projectile()
		shoot_timer = 0.0


func apply_movement(delta: float) -> void:
	if target == null:
		return

	# Circular movement around player
	circle_angle += (circle_speed / circle_radius) * delta

	# Calculate position on circle
	var offset_x = cos(circle_angle) * circle_radius
	var offset_z = sin(circle_angle) * circle_radius
	var target_pos = circle_center + Vector3(offset_x, 0, offset_z)

	# Move toward circle position
	var direction = (target_pos - global_position).normalized()
	velocity = direction * move_speed
	move_and_slide()


## Shoot debuff projectile
func shoot_debuff_projectile() -> void:
	if target == null or projectile_scene == null:
		return

	var direction = (target.global_position - global_position).normalized()
	var spawn_pos = global_position + Vector3(0, 1.3, 0) + direction * 0.8

	var projectile = projectile_scene.instantiate()
	get_parent().add_child(projectile)
	projectile.global_position = spawn_pos
	projectile.setup(direction, 25.0, damage)

	# Mark as debuff projectile
	projectile.set_meta("is_debuff", true)
	projectile.set_meta("debuff_type", "slow")

	print("[Enemy] FastDebuffer fired debuff shot!")
