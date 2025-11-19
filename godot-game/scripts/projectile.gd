extends Area3D
## Projectile - Moving projectile for weapons and enemies
##
## Features:
## - Directional movement
## - Hit detection
## - Damage dealing
## - Lifetime management

@export var damage: float = 10.0
@export var speed: float = 20.0
@export var lifetime: float = 5.0
@export var is_player_projectile: bool = true  # false for enemy projectiles

var direction: Vector3 = Vector3.FORWARD
var time_alive: float = 0.0

@onready var mesh: MeshInstance3D = $MeshInstance3D


func _ready() -> void:
	# Set collision layers based on projectile type
	if is_player_projectile:
		collision_layer = 8  # Projectile layer
		collision_mask = 4   # Can hit enemies
	else:
		collision_layer = 8  # Projectile layer
		collision_mask = 2   # Can hit player

	# Connect hit detection
	body_entered.connect(_on_body_entered)
	area_entered.connect(_on_area_entered)


func _physics_process(delta: float) -> void:
	# Move projectile
	global_position += direction * speed * delta

	# Update lifetime
	time_alive += delta
	if time_alive >= lifetime:
		queue_free()


## Setup projectile
func setup(dir: Vector3, proj_speed: float, proj_damage: float) -> void:
	direction = dir.normalized()
	speed = proj_speed
	damage = proj_damage

	# Rotate to face direction
	look_at(global_position + direction, Vector3.UP)


## Handle collision with bodies
func _on_body_entered(body: Node) -> void:
	if is_player_projectile:
		# Player projectile hit something
		if body.is_in_group("enemy"):
			# Hit enemy
			if body.has_method("take_damage"):
				body.take_damage(damage, global_position)

			# Spawn hit effect
			spawn_hit_effect()

			# Destroy projectile
			queue_free()

		elif body.is_in_group("world"):
			# Hit wall/environment
			queue_free()

	else:
		# Enemy projectile
		if body.is_in_group("player"):
			# Hit player
			if body.has_method("take_damage"):
				body.take_damage(damage)

			queue_free()


## Handle collision with areas
func _on_area_entered(area: Area3D) -> void:
	# Can hit other projectiles, shields, etc.
	pass


## Spawn hit effect particles
func spawn_hit_effect() -> void:
	# TODO: Instantiate hit particle effect
	pass
