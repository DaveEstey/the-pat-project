extends Node
## ScreenShake - Camera shake effects for combat feedback
##
## Features:
## - Multiple shake intensities
## - Smooth shake decay
## - Position and rotation shake
## - Trauma-based system

var camera: Camera3D = null
var trauma: float = 0.0  # 0.0 to 1.0
var trauma_decay: float = 1.0  # Trauma reduction per second

# Shake parameters
var max_shake_offset: float = 0.5
var max_shake_rotation: float = 0.1

# Noise for randomness
var noise: FastNoiseLite
var noise_seed: int = 0


func _ready() -> void:
	# Initialize noise
	noise = FastNoiseLite.new()
	noise.seed = randi()
	noise.frequency = 4.0


func _process(delta: float) -> void:
	if camera == null:
		return

	# Decay trauma over time
	if trauma > 0:
		trauma = max(trauma - trauma_decay * delta, 0.0)

		# Apply shake
		apply_shake()
	else:
		# Reset camera position when shake stops
		camera.position = Vector3.ZERO
		camera.rotation_degrees = Vector3.ZERO


## Set the camera to shake
func set_camera(cam: Camera3D) -> void:
	camera = cam


## Apply shake to camera
func apply_shake() -> void:
	if camera == null:
		return

	# Calculate shake amount (squared for better feel)
	var shake_amount: float = trauma * trauma

	# Get noise values for randomness
	var time: float = Time.get_ticks_msec() / 1000.0
	var offset_x: float = noise.get_noise_1d(time * 100.0) * max_shake_offset * shake_amount
	var offset_y: float = noise.get_noise_1d(time * 100.0 + 100.0) * max_shake_offset * shake_amount
	var offset_z: float = noise.get_noise_1d(time * 100.0 + 200.0) * max_shake_offset * shake_amount

	var rotation_x: float = noise.get_noise_1d(time * 100.0 + 300.0) * max_shake_rotation * shake_amount
	var rotation_y: float = noise.get_noise_1d(time * 100.0 + 400.0) * max_shake_rotation * shake_amount
	var rotation_z: float = noise.get_noise_1d(time * 100.0 + 500.0) * max_shake_rotation * shake_amount

	# Apply to camera
	camera.position = Vector3(offset_x, offset_y, offset_z)
	camera.rotation_degrees = Vector3(
		rotation_x * 5.0,
		rotation_y * 5.0,
		rotation_z * 5.0
	)


## Add trauma (shake intensity)
func add_trauma(amount: float) -> void:
	trauma = min(trauma + amount, 1.0)


## Small shake (hit enemy)
func shake_small() -> void:
	add_trauma(0.15)


## Medium shake (player hit, enemy killed)
func shake_medium() -> void:
	add_trauma(0.35)


## Large shake (explosion, boss attack)
func shake_large() -> void:
	add_trauma(0.6)


## Massive shake (boss death)
func shake_massive() -> void:
	add_trauma(1.0)
