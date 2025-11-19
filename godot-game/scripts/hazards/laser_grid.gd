extends "res://scripts/hazards/hazard_base.gd"
## LaserGrid - Laser beam hazard that toggles on/off
##
## Features:
## - Intermittent activation
## - Visual warning before activation
## - Instant high damage
## - Can be oriented in any direction

@export var active_duration: float = 2.0
@export var inactive_duration: float = 3.0
@export var laser_damage: float = 50.0  # High instant damage

var state_timer: float = 0.0
var is_warning: bool = false

@onready var laser_mesh: MeshInstance3D = $LaserMesh
@onready var warning_mesh: MeshInstance3D = $WarningMesh


func _ready() -> void:
	damage_per_second = laser_damage
	super._ready()

	# Start inactive
	deactivate()


func _process(delta: float) -> void:
	super._process(delta)

	state_timer += delta

	if is_warning:
		# Warning period
		if state_timer >= warning_time:
			activate()
			is_warning = false
			state_timer = 0.0
	elif is_active:
		# Active period
		if state_timer >= active_duration:
			deactivate()
			state_timer = 0.0
	else:
		# Inactive period
		if state_timer >= inactive_duration:
			start_warning()
			state_timer = 0.0


func start_warning() -> void:
	is_warning = true
	if warning_mesh:
		warning_mesh.visible = true


func activate() -> void:
	super.activate()
	if laser_mesh:
		laser_mesh.visible = true
	if warning_mesh:
		warning_mesh.visible = false


func deactivate() -> void:
	super.deactivate()
	if laser_mesh:
		laser_mesh.visible = false
	if warning_mesh:
		warning_mesh.visible = false
