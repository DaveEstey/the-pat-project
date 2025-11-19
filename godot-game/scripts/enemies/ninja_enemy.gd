extends "res://scripts/enemies/enemy_base.gd"
## NinjaEnemy - Fast, agile melee enemy
##
## Behavior:
## - Rushes toward player in zigzag pattern
## - High speed
## - Low health
## - Melee damage on contact

@export var rush_speed: float = 8.0
@export var zigzag_intensity: float = 3.0
@export var melee_range: float = 2.0

var zigzag_timer: float = 0.0
var zigzag_direction: int = 1


func _ready() -> void:
	super._ready()
	enemy_type = "ninja"
	max_health = 20.0  # Low health
	current_health = max_health
	move_speed = rush_speed
	damage = 15.0
	points = 150
	currency_reward = 20

	ai_state = "chase"  # Always chasing


func update_ai(delta: float) -> void:
	super.update_ai(delta)

	if target == null:
		return

	# Update zigzag pattern
	zigzag_timer += delta
	if zigzag_timer >= 0.5:
		zigzag_direction *= -1
		zigzag_timer = 0.0

	# Check if in melee range
	var distance = global_position.distance_to(target.global_position)
	if distance <= melee_range:
		attack_player()


func apply_movement(delta: float) -> void:
	if target == null:
		return

	# Fast zigzag rush toward player
	var direction = (target.global_position - global_position).normalized()

	# Add zigzag perpendicular movement
	var perpendicular = Vector3(-direction.z, 0, direction.x)
	var zigzag_offset = perpendicular * zigzag_direction * zigzag_intensity

	velocity = (direction * rush_speed) + zigzag_offset
	move_and_slide()


## Melee attack player on contact
func attack_player() -> void:
	if target and target.has_method("take_damage"):
		target.take_damage(damage)

		# Die after attacking (suicide enemy)
		die()
