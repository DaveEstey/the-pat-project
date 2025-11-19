extends CharacterBody3D
## EnemyBase - Base class for all enemy types
##
## Features:
## - Health system
## - Death handling
## - AI behavior hooks
## - Damage feedback

class_name EnemyBase

@export var enemy_type: String = "basic"
@export var max_health: float = 30.0
@export var move_speed: float = 2.0
@export var damage: float = 10.0
@export var points: int = 100
@export var currency_reward: int = 10

# State
var current_health: float
var is_alive: bool = true
var is_spawning: bool = true
var spawn_timer: float = 0.0
var spawn_duration: float = 0.5

# AI state
var target: Node3D = null  # Player
var ai_state: String = "idle"  # idle, chase, attack, cover
var behavior_timer: float = 0.0

# Systems
var game_manager: Node
var combo_system: Node

# Visual
@onready var mesh_instance: MeshInstance3D = $MeshInstance3D


func _ready() -> void:
	current_health = max_health
	add_to_group("enemy")

	# Get systems
	game_manager = get_node_or_null("/root/GameManager")
	combo_system = get_node_or_null("/root/ComboSystem")

	# Find player
	await get_tree().process_frame
	target = get_tree().get_first_node_in_group("player")

	# Start spawn animation
	if mesh_instance:
		mesh_instance.transparency = 1.0  # Fully transparent


func _process(delta: float) -> void:
	# Handle spawn animation
	if is_spawning:
		spawn_timer += delta
		if spawn_timer >= spawn_duration:
			is_spawning = false
			if mesh_instance:
				mesh_instance.transparency = 0.0
		else:
			# Fade in
			if mesh_instance:
				mesh_instance.transparency = 1.0 - (spawn_timer / spawn_duration)
		return

	if not is_alive:
		return

	# Update AI behavior
	update_ai(delta)


func _physics_process(delta: float) -> void:
	if is_spawning or not is_alive:
		return

	# Apply AI movement (overridden in subclasses)
	apply_movement(delta)


## Update AI behavior (override in subclasses)
func update_ai(delta: float) -> void:
	behavior_timer += delta

	if target == null:
		return

	# Basic AI: Move toward player and shoot
	var distance_to_player = global_position.distance_to(target.global_position)

	if distance_to_player > 15.0:
		ai_state = "chase"
	elif distance_to_player < 10.0:
		ai_state = "attack"


## Apply movement based on AI state (override in subclasses)
func apply_movement(delta: float) -> void:
	if target == null:
		return

	match ai_state:
		"chase":
			# Move toward player
			var direction = (target.global_position - global_position).normalized()
			velocity = direction * move_speed
			move_and_slide()

		"attack":
			# Stay relatively still, strafe occasionally
			pass


## Take damage
func take_damage(amount: float, hit_position: Vector3) -> void:
	if not is_alive or is_spawning:
		return

	current_health -= amount

	# Damage feedback
	show_damage_feedback(hit_position)

	if current_health <= 0:
		die()


## Show damage feedback
func show_damage_feedback(hit_position: Vector3) -> void:
	# Flash material
	if mesh_instance:
		flash_damage()

	# Spawn blood particles
	# TODO: Instantiate blood particle effect


## Flash damage effect
func flash_damage() -> void:
	if not mesh_instance:
		return

	# Create a tween to flash the material
	var material = mesh_instance.get_active_material(0)
	if material:
		var tween = create_tween()
		# TODO: Flash material color to white and back


## Die
func die() -> void:
	if not is_alive:
		return

	is_alive = false

	# Register kill with combo system
	if combo_system:
		combo_system.register_kill()

	# Register kill with game manager
	if game_manager:
		var combo = combo_system.get_combo() if combo_system else 0
		game_manager.register_enemy_kill(enemy_type, combo)

		# Award points with combo multiplier
		var multiplier = combo_system.get_multiplier() if combo_system else 1.0
		var score = int(points * multiplier)
		game_manager.add_score(score)

		# Award currency
		game_manager.add_currency(currency_reward)

	# Spawn death effects
	spawn_death_effects()

	# Remove from scene
	queue_free()


## Spawn death effects
func spawn_death_effects() -> void:
	# TODO: Spawn explosion particles
	# TODO: Play death sound
	print("[Enemy] ", enemy_type, " died!")


## Get player reference
func get_player() -> Node3D:
	return target
