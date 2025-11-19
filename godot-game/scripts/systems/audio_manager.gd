extends Node
## AudioManager - Centralized audio playback
##
## Features:
## - Background music management
## - Sound effect playback
## - Volume control
## - Audio ducking
## - Crossfading

signal music_changed(track_name: String)

# Audio buses
const MUSIC_BUS: String = "Music"
const SFX_BUS: String = "SFX"

# Volume settings
var master_volume: float = 1.0
var music_volume: float = 0.7
var sfx_volume: float = 0.8

# Current music
var current_music: AudioStreamPlayer = null
var next_music: AudioStreamPlayer = null
var is_crossfading: bool = false
var crossfade_duration: float = 2.0

# Music tracks
const MUSIC_TRACKS: Dictionary = {
	"menu": "res://assets/sounds/music/menu_theme.ogg",
	"gameplay": "res://assets/sounds/music/gameplay_theme.ogg",
	"boss": "res://assets/sounds/music/boss_theme.ogg",
	"victory": "res://assets/sounds/music/victory_theme.ogg",
	"game_over": "res://assets/sounds/music/game_over_theme.ogg"
}

# Sound effects
const SOUND_EFFECTS: Dictionary = {
	"weapon_fire": "res://assets/sounds/sfx/weapon_fire.ogg",
	"reload": "res://assets/sounds/sfx/reload.ogg",
	"explosion": "res://assets/sounds/sfx/explosion.ogg",
	"pickup": "res://assets/sounds/sfx/pickup.ogg",
	"enemy_death": "res://assets/sounds/sfx/enemy_death.ogg",
	"player_hit": "res://assets/sounds/sfx/player_hit.ogg",
	"ui_click": "res://assets/sounds/sfx/ui_click.ogg",
	"achievement": "res://assets/sounds/sfx/achievement.ogg"
}


func _ready() -> void:
	# Setup audio buses
	setup_audio_buses()

	# Apply volume settings
	apply_volume_settings()


## Setup audio buses
func setup_audio_buses() -> void:
	# Check if buses exist, create if not
	var bus_count = AudioServer.get_bus_count()

	# Music bus
	if AudioServer.get_bus_index(MUSIC_BUS) == -1:
		AudioServer.add_bus()
		AudioServer.set_bus_name(bus_count, MUSIC_BUS)

	# SFX bus
	if AudioServer.get_bus_index(SFX_BUS) == -1:
		AudioServer.add_bus()
		AudioServer.set_bus_name(bus_count + 1, SFX_BUS)


## Apply volume settings
func apply_volume_settings() -> void:
	AudioServer.set_bus_volume_db(
		AudioServer.get_bus_index("Master"),
		linear_to_db(master_volume)
	)

	if AudioServer.get_bus_index(MUSIC_BUS) != -1:
		AudioServer.set_bus_volume_db(
			AudioServer.get_bus_index(MUSIC_BUS),
			linear_to_db(music_volume)
		)

	if AudioServer.get_bus_index(SFX_BUS) != -1:
		AudioServer.set_bus_volume_db(
			AudioServer.get_bus_index(SFX_BUS),
			linear_to_db(sfx_volume)
		)


## Play music track
func play_music(track_name: String, crossfade: bool = true) -> void:
	if track_name not in MUSIC_TRACKS:
		print("[Audio] Music track not found: ", track_name)
		return

	# TODO: Load and play actual audio file
	# For now, just log
	print("[Audio] Playing music: ", track_name)

	music_changed.emit(track_name)


## Stop music
func stop_music(fade_out: bool = true) -> void:
	if current_music:
		if fade_out:
			fade_out_music()
		else:
			current_music.stop()
			current_music.queue_free()
			current_music = null


## Fade out current music
func fade_out_music() -> void:
	if not current_music:
		return

	var tween = create_tween()
	tween.tween_property(current_music, "volume_db", -80.0, 1.0)
	tween.tween_callback(func(): current_music.queue_free())


## Play sound effect
func play_sfx(sfx_name: String, volume_db: float = 0.0) -> void:
	if sfx_name not in SOUND_EFFECTS:
		print("[Audio] SFX not found: ", sfx_name)
		return

	# TODO: Load and play actual audio file
	print("[Audio] Playing SFX: ", sfx_name)


## Play 3D positional sound
func play_sfx_3d(sfx_name: String, position: Vector3, volume_db: float = 0.0) -> void:
	if sfx_name not in SOUND_EFFECTS:
		return

	# TODO: Create AudioStreamPlayer3D at position
	print("[Audio] Playing 3D SFX at: ", position)


## Set master volume
func set_master_volume(volume: float) -> void:
	master_volume = clamp(volume, 0.0, 1.0)
	apply_volume_settings()


## Set music volume
func set_music_volume(volume: float) -> void:
	music_volume = clamp(volume, 0.0, 1.0)
	apply_volume_settings()


## Set SFX volume
func set_sfx_volume(volume: float) -> void:
	sfx_volume = clamp(volume, 0.0, 1.0)
	apply_volume_settings()


## Get current volume settings
func get_volume_settings() -> Dictionary:
	return {
		"master": master_volume,
		"music": music_volume,
		"sfx": sfx_volume
	}


## Linear to decibel conversion
func linear_to_db(linear: float) -> float:
	if linear <= 0:
		return -80.0
	return 20.0 * log(linear) / log(10)
