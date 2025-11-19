extends "res://scripts/enemies/enemy_base.gd"
## BasicShooter - Standard enemy with strafing behavior
##
## Behavior:
## - Strafes side-to-side
## - Shoots at player periodically
## - Seeks cover when damaged

@export var strafe_speed: float = 3.0
@export var shoot_interval: float = 1.5
@export var projectile_speed: float = 20.0

var strafe_direction: int = 1  # 1 = right, -1 = left
var shoot_timer: float = 0.0
var strafe_timer: float = 0.0
var strafe_duration: float = 2.0

# Projectile scene (set in editor or code)
var projectile_scene: PackedScene


func _ready() -> void:
	super._ready()
	enemy_type = "basic_shooter"
	max_health = 30.0
	current_health = max_health
	move_speed = 2.0
	damage = 10.0
	points = 100
	currency_reward = 10

	# Randomize initial strafe direction
	strafe_direction = 1 if randf() > 0.5 else -1


func update_ai(delta: float) -> void:
	super.update_ai(delta)

	if target == null:
		return

	# Update shoot timer
	shoot_timer += delta
	if shoot_timer >= shoot_interval:
		shoot_at_player()
		shoot_timer = 0.0

	# Update strafe behavior
	strafe_timer += delta
	if strafe_timer >= strafe_duration:
		# Change strafe direction
		strafe_direction *= -1
		strafe_timer = 0.0
		strafe_duration = randf_range(1.5, 3.0)


func apply_movement(delta: float) -> void:
	if target == null:
		return

	match ai_state:
		"chase":
			# Move toward player
			var direction = (target.global_position - global_position).normalized()
			velocity.x = direction.x * move_speed
			velocity.z = direction.z * move_speed
			move_and_slide()

		"attack":
			# Strafe side-to-side
			velocity.x = strafe_direction * strafe_speed
			velocity.z = 0
			move_and_slide()


## Shoot projectile at player
func shoot_at_player() -> void:
	if target == null or projectile_scene == null:
		return

	# Calculate direction to player
	var direction = (target.global_position - global_position).normalized()

	# Spawn projectile at shoulder height
	var spawn_pos = global_position + Vector3(0, 1.3, 0) + direction * 0.8

	# Instantiate projectile
	var projectile = projectile_scene.instantiate()
	get_parent().add_child(projectile)
	projectile.global_position = spawn_pos
	projectile.setup(direction, projectile_speed, damage)

	# Play shoot sound
	print("[Enemy] BasicShooter fired!")
