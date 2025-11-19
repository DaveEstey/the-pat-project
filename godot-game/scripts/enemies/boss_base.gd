extends "res://scripts/enemies/enemy_base.gd"
## BossBase - Base class for all boss enemies
##
## Features:
## - Multi-phase health system
## - Phase transitions with invulnerability
## - Special attacks
## - Boss health bar integration
## - Intro sequence support

class_name BossBase

signal phase_changed(new_phase: int)
signal boss_intro_complete()
signal boss_defeated()
signal special_attack_started(attack_name: String)

@export var boss_name: String = "UNKNOWN BOSS"
@export var boss_subtitle: String = "Prepare for Battle"
@export var num_phases: int = 3
@export var intro_duration: float = 3.0

# Phase system
var current_phase: int = 1
var phase_health_thresholds: Array[float] = [1.0, 0.66, 0.33]  # 100%, 66%, 33%
var is_transitioning: bool = false
var is_intro_playing: bool = true

# Boss-specific
var special_attack_cooldown: float = 10.0
var special_attack_timer: float = 0.0

# Rage mode (final phase)
var is_enraged: bool = false


func _ready() -> void:
	# Set boss-specific defaults
	max_health = 500.0
	current_health = max_health
	move_speed = 2.0
	damage = 20.0
	points = 5000
	currency_reward = 500
	enemy_type = "boss"

	# Add to boss group
	add_to_group("boss")

	super._ready()

	# Play intro
	play_intro_sequence()


## Play boss intro sequence
func play_intro_sequence() -> void:
	is_intro_playing = true

	# Spawn animation
	await get_tree().create_timer(intro_duration).timeout

	is_intro_playing = false
	is_spawning = false
	boss_intro_complete.emit()

	print("[Boss] %s - %s" % [boss_name, boss_subtitle])


func update_ai(delta: float) -> void:
	if is_intro_playing or is_transitioning:
		return

	super.update_ai(delta)

	# Check for phase transitions
	check_phase_transition()

	# Update special attack timer
	special_attack_timer += delta
	if special_attack_timer >= special_attack_cooldown:
		trigger_special_attack()
		special_attack_timer = 0.0


## Check if boss should transition to next phase
func check_phase_transition() -> void:
	var health_percent = current_health / max_health

	for i in range(phase_health_thresholds.size()):
		if current_phase == i + 1 and health_percent <= phase_health_thresholds[i]:
			if i < num_phases - 1:
				transition_to_phase(i + 2)
			break


## Transition to new phase
func transition_to_phase(new_phase: int) -> void:
	if is_transitioning:
		return

	is_transitioning = true
	current_phase = new_phase

	print("[Boss] Entering phase ", current_phase)

	# Become invulnerable during transition
	var invuln_duration = 2.0

	# Phase transition effects
	phase_transition_effects()

	await get_tree().create_timer(invuln_duration).timeout

	is_transitioning = false
	phase_changed.emit(current_phase)

	# Final phase = enrage
	if current_phase >= num_phases:
		enter_enrage_mode()

	# Update behavior for new phase
	update_phase_behavior()


## Phase transition visual effects
func phase_transition_effects() -> void:
	# Override in subclasses
	print("[Boss] Phase transition effects!")


## Enter enrage mode (final phase)
func enter_enrage_mode() -> void:
	is_enraged = true
	move_speed *= 1.5
	damage *= 1.3
	special_attack_cooldown *= 0.7

	print("[Boss] ENRAGED!")


## Update behavior based on current phase
func update_phase_behavior() -> void:
	# Override in subclasses
	pass


## Trigger special attack
func trigger_special_attack() -> void:
	# Override in subclasses
	var attack_name = "generic_attack"
	special_attack_started.emit(attack_name)


## Take damage (with phase invulnerability)
func take_damage(amount: float, hit_position: Vector3) -> void:
	if is_transitioning or is_intro_playing:
		# Invulnerable during transitions
		return

	super.take_damage(amount, hit_position)


## Boss death
func die() -> void:
	if not is_alive:
		return

	boss_defeated.emit()

	# Bigger rewards
	if game_manager:
		game_manager.add_currency(currency_reward)
		game_manager.add_score(points)

	# Play death animation
	print("[Boss] %s defeated!" % boss_name)

	super.die()
