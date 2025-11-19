extends StaticBody3D
## PuzzleSwitch - Individual switch for puzzles
##
## Features:
## - Shootable to activate
## - Visual state (on/off)
## - Can be one-time or toggleable

signal switch_activated(switch_index: int)

@export var switch_index: int = 0
@export var is_toggleable: bool = false
@export var starts_active: bool = false

var is_active: bool = false

@onready var mesh: MeshInstance3D = $MeshInstance3D
@onready var light: OmniLight3D = $Light


func _ready() -> void:
	add_to_group("puzzle_switch")
	is_active = starts_active

	update_visual_state()


## Called when shot by player
func on_shot() -> void:
	if is_toggleable:
		is_active = not is_active
	else:
		if is_active:
			return  # Already activated
		is_active = true

	update_visual_state()
	switch_activated.emit(switch_index)

	# Play activation sound
	print("[Switch] Switch %d activated" % switch_index)


## Update visual state
func update_visual_state() -> void:
	if mesh:
		if is_active:
			mesh.material_override = create_active_material()
		else:
			mesh.material_override = create_inactive_material()

	if light:
		light.visible = is_active


## Create active material (green)
func create_active_material() -> StandardMaterial3D:
	var mat = StandardMaterial3D.new()
	mat.albedo_color = Color.GREEN
	mat.emission_enabled = true
	mat.emission = Color.GREEN
	mat.emission_energy_multiplier = 2.0
	return mat


## Create inactive material (red)
func create_inactive_material() -> StandardMaterial3D:
	var mat = StandardMaterial3D.new()
	mat.albedo_color = Color.DARK_RED
	return mat


## Reset switch
func reset() -> void:
	is_active = starts_active
	update_visual_state()
