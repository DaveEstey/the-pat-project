extends "res://scripts/enemies/enemy_base.gd"
## ArmoredEnemy - Tanky enemy with high health
##
## Behavior:
## - Slow movement
## - High health pool
## - Seeks cover when damaged
## - Slower fire rate but higher damage

@export var armor_reduction: float = 0.5  # Takes 50% less damage
@export var shoot_interval: float = 2.0

var shoot_timer: float = 0.0
var projectile_scene: PackedScene


func _ready() -> void:
	super._ready()
	enemy_type = "armored"
	max_health = 80.0  # High health
	current_health = max_health
	move_speed = 1.5  # Slow
	damage = 20.0  # High damage
	points = 250
	currency_reward = 25


func update_ai(delta: float) -> void:
	super.update_ai(delta)

	if target == null:
		return

	# Update shoot timer
	shoot_timer += delta
	if shoot_timer >= shoot_interval:
		shoot_at_player()
		shoot_timer = 0.0


func apply_movement(delta: float) -> void:
	if target == null:
		return

	# Always advance slowly toward player
	var direction = (target.global_position - global_position).normalized()
	velocity = direction * move_speed
	move_and_slide()


## Take damage with armor reduction
func take_damage(amount: float, hit_position: Vector3) -> void:
	var reduced_damage = amount * armor_reduction
	super.take_damage(reduced_damage, hit_position)


func shoot_at_player() -> void:
	if target == null or projectile_scene == null:
		return

	var direction = (target.global_position - global_position).normalized()
	var spawn_pos = global_position + Vector3(0, 1.3, 0) + direction * 0.8

	var projectile = projectile_scene.instantiate()
	get_parent().add_child(projectile)
	projectile.global_position = spawn_pos
	projectile.setup(direction, 15.0, damage)

	print("[Enemy] ArmoredEnemy fired heavy shot!")
