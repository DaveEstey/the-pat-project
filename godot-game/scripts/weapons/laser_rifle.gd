extends Node3D
## LaserRifle - Energy-based continuous beam weapon
##
## Features:
## - Continuous damage beam (no individual shots)
## - Overheat mechanic instead of ammo
## - Perfect accuracy
## - Damage ramps up over time on same target
## - Energy cells for "ammo"

signal beam_started()
signal beam_stopped()
signal weapon_overheated()
signal target_vaporized(target: Node3D)

@export var damage_per_second: float = 35.0
@export var damage_ramp_rate: float = 1.5  # Multiplier increase per second
@export var max_damage_multiplier: float = 3.0

@export var max_heat: float = 100.0
@export var heat_per_second: float = 25.0  # Heat generated while firing
@export var cooling_rate: float = 40.0  # Heat dissipated per second
@export var overheat_threshold: float = 100.0
@export var overheat_penalty_time: float = 3.0  # Forced cooldown

@export var max_energy_cells: int = 300
@export var energy_drain_per_second: float = 10.0

@export var beam_range: float = 100.0
@export var beam_width: float = 0.1

var current_heat: float = 0.0
var is_overheated: bool = false
var is_firing: bool = false
var current_energy: int = 300

var current_target: Node3D = null
var time_on_target: float = 0.0
var current_damage_multiplier: float = 1.0

@onready var raycast: RayCast3D = $RayCast3D
@onready var beam_visual: MeshInstance3D = $BeamVisual
@onready var beam_particles: GPUParticles3D = $BeamParticles


func _ready() -> void:
	current_energy = max_energy_cells

	if raycast:
		raycast.enabled = true
		raycast.target_position = Vector3(0, 0, -beam_range)

	if beam_visual:
		beam_visual.visible = false


func _process(delta: float) -> void:
	if is_firing and not is_overheated:
		fire_beam(delta)
	else:
		stop_beam()

	# Update heat
	update_heat(delta)

	# Update beam visual
	update_beam_visual()


## Start firing beam
func start_firing() -> bool:
	if is_overheated or current_energy <= 0:
		return false

	if not is_firing:
		is_firing = true
		beam_started.emit()

	return true


## Stop firing beam
func stop_firing() -> void:
	if is_firing:
		is_firing = false
		current_target = null
		time_on_target = 0.0
		current_damage_multiplier = 1.0
		beam_stopped.emit()


## Fire continuous beam
func fire_beam(delta: float) -> void:
	# Drain energy
	var energy_cost = energy_drain_per_second * delta
	current_energy -= energy_cost

	if current_energy <= 0:
		current_energy = 0
		stop_firing()
		return

	# Generate heat
	current_heat += heat_per_second * delta

	if current_heat >= overheat_threshold:
		trigger_overheat()
		return

	# Perform raycast
	if raycast:
		raycast.force_raycast_update()

		if raycast.is_colliding():
			var collider = raycast.get_collider()
			var hit_position = raycast.get_collision_point()

			if collider and collider.is_in_group("enemy"):
				apply_beam_damage(collider, hit_position, delta)
			else:
				# Lost target
				reset_target()


## Apply beam damage to target
func apply_beam_damage(target: Node3D, hit_position: Vector3, delta: float) -> void:
	# Check if same target
	if current_target != target:
		current_target = target
		time_on_target = 0.0
		current_damage_multiplier = 1.0

	# Increase time on target
	time_on_target += delta

	# Ramp up damage
	current_damage_multiplier = min(
		1.0 + (damage_ramp_rate * time_on_target),
		max_damage_multiplier
	)

	# Calculate damage
	var damage_this_frame = damage_per_second * current_damage_multiplier * delta

	# Apply damage
	if target.has_method("take_damage"):
		target.take_damage(damage_this_frame, hit_position)

		# Check if target died (vaporized)
		if not is_instance_valid(target) or (target.has_method("is_alive") and not target.is_alive()):
			target_vaporized.emit(target)
			reset_target()


## Stop beam
func stop_beam() -> void:
	if beam_visual:
		beam_visual.visible = false

	if beam_particles:
		beam_particles.emitting = false


## Reset current target
func reset_target() -> void:
	current_target = null
	time_on_target = 0.0
	current_damage_multiplier = 1.0


## Update heat
func update_heat(delta: float) -> void:
	if is_overheated:
		# Forced cooling during overheat
		current_heat -= cooling_rate * 1.5 * delta

		if current_heat <= 0:
			current_heat = 0
			is_overheated = false
	elif not is_firing:
		# Passive cooling
		current_heat -= cooling_rate * delta
		current_heat = max(0.0, current_heat)


## Trigger overheat
func trigger_overheat() -> void:
	is_overheated = true
	stop_firing()
	weapon_overheated.emit()

	print("[LaserRifle] OVERHEATED! Cooling down...")

	# Force cooldown period
	await get_tree().create_timer(overheat_penalty_time).timeout

	# Can start cooling normally now
	# (is_overheated flag will be cleared when heat reaches 0)


## Update beam visual
func update_beam_visual() -> void:
	if not beam_visual or not raycast:
		return

	if is_firing and raycast.is_colliding():
		beam_visual.visible = true

		# Set beam length to hit distance
		var hit_distance = raycast.get_collision_point().distance_to(global_position)
		beam_visual.scale.z = hit_distance

		# Position beam
		beam_visual.position.z = -hit_distance / 2

		# Beam particles at impact point
		if beam_particles:
			beam_particles.emitting = true
			beam_particles.global_position = raycast.get_collision_point()
	else:
		beam_visual.visible = false

		if beam_particles:
			beam_particles.emitting = false


## Add energy cells
func add_energy(amount: int) -> void:
	current_energy = min(current_energy + amount, max_energy_cells)


## Get heat percentage
func get_heat_percentage() -> float:
	return (current_heat / max_heat) * 100.0


## Get energy percentage
func get_energy_percentage() -> float:
	return (float(current_energy) / float(max_energy_cells)) * 100.0


## Get damage multiplier for UI
func get_current_damage_multiplier() -> float:
	return current_damage_multiplier


## Get ammo info (for UI compatibility)
func get_ammo_info() -> Dictionary:
	return {
		"current": current_energy,
		"reserve": 0,  # No reserve for energy weapon
		"max": max_energy_cells
	}


## Check if can fire
func can_fire() -> bool:
	return not is_overheated and current_energy > 0
