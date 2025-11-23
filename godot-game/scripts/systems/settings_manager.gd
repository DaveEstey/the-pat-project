extends Node
## SettingsManager - Game settings and configuration
##
## Features:
## - Graphics settings (resolution, quality, vsync, etc.)
## - Audio settings (master, music, sfx volumes)
## - Control settings (sensitivity, key bindings)
## - Gameplay settings (difficulty, accessibility)
## - Save/load settings to file

signal setting_changed(setting_name: String, value: Variant)
signal settings_loaded()
signal settings_saved()

const SETTINGS_FILE: String = "user://settings.json"

# Default settings
var settings: Dictionary = {
	# Graphics
	"resolution": Vector2i(1920, 1080),
	"fullscreen": true,
	"vsync": true,
	"max_fps": 0,  # 0 = unlimited
	"quality_preset": "high",  # low, medium, high, ultra
	"shadow_quality": 2,  # 0-3
	"texture_quality": 2,  # 0-3
	"anti_aliasing": "msaa_2x",  # none, fxaa, msaa_2x, msaa_4x, msaa_8x
	"motion_blur": false,
	"bloom": true,
	"screen_shake": true,
	"fov": 75,

	# Audio
	"master_volume": 1.0,
	"music_volume": 0.7,
	"sfx_volume": 0.8,
	"voice_volume": 1.0,
	"mute_on_focus_loss": true,

	# Controls
	"mouse_sensitivity": 0.5,
	"aim_sensitivity_multiplier": 0.6,
	"invert_y_axis": false,
	"toggle_aim": false,
	"toggle_crouch": false,

	# Gameplay
	"difficulty": "normal",  # easy, normal, hard, nightmare
	"show_damage_numbers": true,
	"show_crosshair": true,
	"show_tutorial_hints": true,
	"auto_reload": true,
	"aim_assist": false,

	# Accessibility
	"colorblind_mode": "none",  # none, protanopia, deuteranopia, tritanopia
	"subtitle_size": 1.0,
	"ui_scale": 1.0,
	"reduce_flashing": false,
	"screen_reader": false
}


func _ready() -> void:
	load_settings()
	apply_all_settings()


## Load settings from file
func load_settings() -> bool:
	if not FileAccess.file_exists(SETTINGS_FILE):
		print("[Settings] No settings file found, using defaults")
		save_settings()
		return false

	var file = FileAccess.open(SETTINGS_FILE, FileAccess.READ)
	if not file:
		print("[Settings] Failed to open settings file")
		return false

	var json = JSON.new()
	var parse_result = json.parse(file.get_as_text())

	if parse_result != OK:
		print("[Settings] Failed to parse settings file")
		return false

	var loaded_settings = json.data

	# Merge with defaults (in case new settings were added)
	for key in loaded_settings:
		if key in settings:
			settings[key] = loaded_settings[key]

	print("[Settings] Loaded from file")
	settings_loaded.emit()
	return true


## Save settings to file
func save_settings() -> bool:
	var file = FileAccess.open(SETTINGS_FILE, FileAccess.WRITE)
	if not file:
		print("[Settings] Failed to create settings file")
		return false

	var json_string = JSON.stringify(settings, "\t")
	file.store_string(json_string)
	file.close()

	print("[Settings] Saved to file")
	settings_saved.emit()
	return true


## Apply all settings
func apply_all_settings() -> void:
	apply_graphics_settings()
	apply_audio_settings()
	apply_control_settings()
	apply_gameplay_settings()


## Apply graphics settings
func apply_graphics_settings() -> void:
	# Resolution and fullscreen
	var resolution = settings["resolution"]
	var fullscreen = settings["fullscreen"]

	if fullscreen:
		DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_FULLSCREEN)
	else:
		DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
		DisplayServer.window_set_size(resolution)

	# VSync
	if settings["vsync"]:
		DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_ENABLED)
	else:
		DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_DISABLED)

	# Max FPS
	Engine.max_fps = settings["max_fps"]

	# Quality preset
	apply_quality_preset(settings["quality_preset"])

	# FOV
	var camera = get_viewport().get_camera_3d()
	if camera:
		camera.fov = settings["fov"]

	print("[Settings] Graphics settings applied")


## Apply quality preset
func apply_quality_preset(preset: String) -> void:
	match preset:
		"low":
			apply_low_quality()
		"medium":
			apply_medium_quality()
		"high":
			apply_high_quality()
		"ultra":
			apply_ultra_quality()


func apply_low_quality() -> void:
	# Reduce render quality
	get_viewport().scaling_3d_scale = 0.75

	# Disable expensive effects
	var env = get_viewport().world_3d.environment
	if env:
		env.ssao_enabled = false
		env.ssil_enabled = false
		env.glow_enabled = false

	settings["shadow_quality"] = 0
	settings["texture_quality"] = 0


func apply_medium_quality() -> void:
	get_viewport().scaling_3d_scale = 0.9

	var env = get_viewport().world_3d.environment
	if env:
		env.ssao_enabled = false
		env.ssil_enabled = false
		env.glow_enabled = true
		env.glow_intensity = 0.3

	settings["shadow_quality"] = 1
	settings["texture_quality"] = 1


func apply_high_quality() -> void:
	get_viewport().scaling_3d_scale = 1.0

	var env = get_viewport().world_3d.environment
	if env:
		env.ssao_enabled = true
		env.ssil_enabled = false
		env.glow_enabled = true
		env.glow_intensity = 0.5

	settings["shadow_quality"] = 2
	settings["texture_quality"] = 2


func apply_ultra_quality() -> void:
	get_viewport().scaling_3d_scale = 1.0

	var env = get_viewport().world_3d.environment
	if env:
		env.ssao_enabled = true
		env.ssil_enabled = true
		env.glow_enabled = true
		env.glow_intensity = 0.8

	settings["shadow_quality"] = 3
	settings["texture_quality"] = 3


## Apply audio settings
func apply_audio_settings() -> void:
	# Set bus volumes
	var master_bus = AudioServer.get_bus_index("Master")
	var music_bus = AudioServer.get_bus_index("Music")
	var sfx_bus = AudioServer.get_bus_index("SFX")

	if master_bus != -1:
		AudioServer.set_bus_volume_db(master_bus, linear_to_db(settings["master_volume"]))

	if music_bus != -1:
		AudioServer.set_bus_volume_db(music_bus, linear_to_db(settings["music_volume"]))

	if sfx_bus != -1:
		AudioServer.set_bus_volume_db(sfx_bus, linear_to_db(settings["sfx_volume"]))

	print("[Settings] Audio settings applied")


## Apply control settings
func apply_control_settings() -> void:
	# Mouse sensitivity will be checked by player controller
	# Key bindings would be applied here if we had a remapping system

	print("[Settings] Control settings applied")


## Apply gameplay settings
func apply_gameplay_settings() -> void:
	# Difficulty affects enemy health/damage
	var game_manager = get_node_or_null("/root/GameManager")
	if game_manager:
		# game_manager.set_difficulty(settings["difficulty"])
		pass

	print("[Settings] Gameplay settings applied")


## Get setting value
func get_setting(setting_name: String, default = null):
	return settings.get(setting_name, default)


## Set setting value
func set_setting(setting_name: String, value: Variant) -> void:
	if setting_name not in settings:
		print("[Settings] Warning: Unknown setting '%s'" % setting_name)
		return

	settings[setting_name] = value
	setting_changed.emit(setting_name, value)

	# Apply immediately
	match setting_name:
		"resolution", "fullscreen", "vsync", "max_fps", "quality_preset", "fov":
			apply_graphics_settings()

		"master_volume", "music_volume", "sfx_volume":
			apply_audio_settings()

		"mouse_sensitivity", "invert_y_axis":
			apply_control_settings()

	# Auto-save
	save_settings()


## Convert linear volume to dB
func linear_to_db(linear: float) -> float:
	if linear <= 0.0:
		return -80.0
	return 20.0 * log(linear) / log(10.0)


## Get available resolutions
func get_available_resolutions() -> Array[Vector2i]:
	var resolutions: Array[Vector2i] = [
		Vector2i(1280, 720),
		Vector2i(1920, 1080),
		Vector2i(2560, 1440),
		Vector2i(3840, 2160)
	]
	return resolutions


## Reset to defaults
func reset_to_defaults() -> void:
	settings = {
		"resolution": Vector2i(1920, 1080),
		"fullscreen": true,
		"vsync": true,
		"max_fps": 0,
		"quality_preset": "high",
		"shadow_quality": 2,
		"texture_quality": 2,
		"anti_aliasing": "msaa_2x",
		"motion_blur": false,
		"bloom": true,
		"screen_shake": true,
		"fov": 75,
		"master_volume": 1.0,
		"music_volume": 0.7,
		"sfx_volume": 0.8,
		"voice_volume": 1.0,
		"mute_on_focus_loss": true,
		"mouse_sensitivity": 0.5,
		"aim_sensitivity_multiplier": 0.6,
		"invert_y_axis": false,
		"toggle_aim": false,
		"toggle_crouch": false,
		"difficulty": "normal",
		"show_damage_numbers": true,
		"show_crosshair": true,
		"show_tutorial_hints": true,
		"auto_reload": true,
		"aim_assist": false,
		"colorblind_mode": "none",
		"subtitle_size": 1.0,
		"ui_scale": 1.0,
		"reduce_flashing": false,
		"screen_reader": false
	}

	apply_all_settings()
	save_settings()

	print("[Settings] Reset to defaults")


## Export settings as dictionary
func export_settings() -> Dictionary:
	return settings.duplicate()


## Import settings from dictionary
func import_settings(imported_settings: Dictionary) -> void:
	settings = imported_settings.duplicate()
	apply_all_settings()
	save_settings()
