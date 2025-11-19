extends "res://scripts/enemies/enemy_base.gd"
## BombThrower - Ranged enemy that throws explosive projectiles
##
## Behavior:
## - Keeps distance from player
## - Backs away if player gets too close
## - Throws arcing explosive projectiles
## - Area damage on explosion

@export var safe_distance: float = 15.0
@export var flee_distance: float = 8.0
@export var throw_interval: float = 2.5
@export var bomb_damage: float = 25.0
@export var explosion_radius: float = 4.0

var throw_timer: float = 0.0
var bomb_scene: PackedScene


func _ready() -> void:
	super._ready()
	enemy_type = "bomb_thrower"
	max_health = 40.0
	current_health = max_health
	move_speed = 2.5
	damage = bomb_damage
	points = 200
	currency_reward = 30


func update_ai(delta: float) -> void:
	super.update_ai(delta)

	if target == null:
		return

	var distance = global_position.distance_to(target.global_position)

	# Determine behavior based on distance
	if distance < flee_distance:
		ai_state = "flee"
	elif distance > safe_distance + 5.0:
		ai_state = "chase"
	else:
		ai_state = "attack"

	# Update throw timer
	throw_timer += delta
	if throw_timer >= throw_interval and ai_state == "attack":
		throw_bomb()
		throw_timer = 0.0


func apply_movement(delta: float) -> void:
	if target == null:
		return

	var direction = (target.global_position - global_position).normalized()

	match ai_state:
		"flee":
			# Run away from player
			velocity = -direction * move_speed * 1.5
			move_and_slide()

		"chase":
			# Move toward safe distance
			velocity = direction * move_speed
			move_and_slide()

		"attack":
			# Strafe slightly while maintaining distance
			var perpendicular = Vector3(-direction.z, 0, direction.x)
			velocity = perpendicular * move_speed * 0.5
			move_and_slide()


## Throw explosive bomb at player
func throw_bomb() -> void:
	if target == null:
		return

	print("[Enemy] BombThrower threw bomb!")

	# Calculate arc trajectory
	var direction = (target.global_position - global_position).normalized()
	var distance = global_position.distance_to(target.global_position)

	# Spawn bomb (arcing projectile)
	# TODO: Create special bomb projectile with arc and explosion
	# For now, use regular projectile
	pass
