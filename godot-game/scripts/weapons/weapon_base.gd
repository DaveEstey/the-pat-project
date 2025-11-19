extends Node3D
## WeaponBase - Base class for weapon visuals and behavior
##
## Features:
## - Recoil animation
## - Muzzle flash
## - Reload animation
## - Weapon bob/sway

class_name WeaponBase

signal weapon_fired()
signal reload_started()
signal reload_complete()

@export var weapon_type: String = "pistol"
@export var recoil_amount: float = 0.1
@export var recoil_recovery: float = 5.0
@export var bob_amount: float = 0.02
@export var sway_amount: float = 0.01

var current_recoil: float = 0.0
var bob_time: float = 0.0

@onready var mesh: MeshInstance3D = $Mesh
@onready var muzzle_point: Marker3D = $MuzzlePoint


func _process(delta: float) -> void:
	# Recover from recoil
	if current_recoil > 0:
		current_recoil = max(0, current_recoil - recoil_recovery * delta)

	# Apply recoil to rotation
	if mesh:
		mesh.rotation.x = -current_recoil

	# Weapon bob (when moving)
	bob_time += delta
	var bob_offset = sin(bob_time * 10.0) * bob_amount
	position.y = bob_offset


## Fire weapon
func fire() -> void:
	# Apply recoil
	current_recoil += recoil_amount

	# Spawn muzzle flash
	spawn_muzzle_flash()

	weapon_fired.emit()


## Spawn muzzle flash
func spawn_muzzle_flash() -> void:
	if not muzzle_point:
		return

	var particle_system = get_node_or_null("/root/ParticleEffects")
	if particle_system:
		particle_system.create_muzzle_flash(
			muzzle_point.global_position,
			Color.YELLOW
		)


## Start reload animation
func start_reload() -> void:
	reload_started.emit()

	# TODO: Play reload animation

	print("[Weapon] Reloading...")


## Complete reload
func complete_reload() -> void:
	reload_complete.emit()
	print("[Weapon] Reload complete!")
