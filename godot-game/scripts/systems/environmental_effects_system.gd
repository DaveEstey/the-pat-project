extends Node
## EnvironmentalEffectsSystem - Dynamic weather, lighting, and atmosphere
##
## Features:
## - Weather system (rain, fog, sandstorm)
## - Dynamic lighting (day/night, flickering)
## - Environmental hazards
## - Atmospheric effects per level

signal weather_changed(weather_type: String)
signal lighting_changed(lighting_type: String)
signal hazard_activated(hazard_type: String)

# Weather types
enum WeatherType {
	CLEAR,
	RAIN,
	FOG,
	SANDSTORM,
	SNOW,
	TOXIC_MIST
}

# Lighting presets
enum LightingPreset {
	DAY,
	SUNSET,
	NIGHT,
	UNDERGROUND,
	CORRUPTED,
	FLICKERING
}

var current_weather: WeatherType = WeatherType.CLEAR
var current_lighting: LightingPreset = LightingPreset.DAY

var weather_intensity: float = 1.0
var transition_time: float = 2.0

# Level-specific environmental configs
const LEVEL_ENVIRONMENTS: Dictionary = {
	1: {
		"weather": WeatherType.CLEAR,
		"lighting": LightingPreset.DAY,
		"fog_enabled": false
	},
	2: {
		"weather": WeatherType.RAIN,
		"lighting": LightingPreset.SUNSET,
		"fog_enabled": false
	},
	3: {
		"weather": WeatherType.CLEAR,
		"lighting": LightingPreset.UNDERGROUND,
		"fog_enabled": true,
		"fog_density": 0.05
	},
	6: {
		"weather": WeatherType.FOG,
		"lighting": LightingPreset.NIGHT,
		"fog_enabled": true,
		"fog_density": 0.1
	},
	9: {
		"weather": WeatherType.TOXIC_MIST,
		"lighting": LightingPreset.CORRUPTED,
		"fog_enabled": true,
		"fog_density": 0.08,
		"periodic_damage": true
	},
	12: {
		"weather": WeatherType.SANDSTORM,
		"lighting": LightingPreset.FLICKERING,
		"fog_enabled": true,
		"fog_density": 0.15,
		"reduced_visibility": true
	}
}

# Weather effect data
const WEATHER_DATA: Dictionary = {
	"clear": {
		"particle_count": 0,
		"visibility_multiplier": 1.0,
		"movement_multiplier": 1.0
	},
	"rain": {
		"particle_count": 1000,
		"visibility_multiplier": 0.8,
		"movement_multiplier": 0.95,
		"sound": "rain_loop"
	},
	"fog": {
		"particle_count": 500,
		"visibility_multiplier": 0.5,
		"movement_multiplier": 1.0,
		"fog_density": 0.1
	},
	"sandstorm": {
		"particle_count": 2000,
		"visibility_multiplier": 0.4,
		"movement_multiplier": 0.8,
		"periodic_damage": 2.0,
		"sound": "wind_loop"
	},
	"snow": {
		"particle_count": 800,
		"visibility_multiplier": 0.7,
		"movement_multiplier": 0.9,
		"sound": "wind_soft"
	},
	"toxic_mist": {
		"particle_count": 600,
		"visibility_multiplier": 0.6,
		"movement_multiplier": 0.95,
		"periodic_damage": 5.0,
		"damage_interval": 2.0,
		"color": Color(0.2, 0.8, 0.2, 0.3)
	}
}

# Lighting data
const LIGHTING_DATA: Dictionary = {
	"day": {
		"sun_energy": 1.0,
		"sun_color": Color(1.0, 0.98, 0.95),
		"ambient_energy": 0.3,
		"ambient_color": Color(0.8, 0.9, 1.0)
	},
	"sunset": {
		"sun_energy": 0.8,
		"sun_color": Color(1.0, 0.6, 0.3),
		"ambient_energy": 0.2,
		"ambient_color": Color(0.8, 0.5, 0.4)
	},
	"night": {
		"sun_energy": 0.1,
		"sun_color": Color(0.5, 0.6, 0.8),
		"ambient_energy": 0.1,
		"ambient_color": Color(0.2, 0.2, 0.4)
	},
	"underground": {
		"sun_energy": 0.0,
		"ambient_energy": 0.15,
		"ambient_color": Color(0.3, 0.3, 0.35),
		"requires_lights": true
	},
	"corrupted": {
		"sun_energy": 0.5,
		"sun_color": Color(0.8, 0.2, 0.2),
		"ambient_energy": 0.15,
		"ambient_color": Color(0.4, 0.1, 0.1),
		"tint": Color(0.9, 0.5, 0.5)
	},
	"flickering": {
		"sun_energy": 0.3,
		"ambient_energy": 0.1,
		"flicker_enabled": true,
		"flicker_speed": 0.2
	}
}

var weather_particles: GPUParticles3D = null
var directional_light: DirectionalLight3D = null
var environment: Environment = null

var is_flickering: bool = false
var flicker_timer: float = 0.0

var damage_timer: float = 0.0


func _ready() -> void:
	# Get world environment nodes
	setup_environment_nodes()


func _process(delta: float) -> void:
	# Update flickering lights
	if is_flickering:
		update_flickering(delta)

	# Update weather damage
	if has_weather_damage():
		update_weather_damage(delta)


## Setup environment nodes
func setup_environment_nodes() -> void:
	# Find or create directional light
	directional_light = get_node_or_null("/root/GameWorld/DirectionalLight3D")

	# Find or create environment
	var world_env = get_node_or_null("/root/GameWorld/WorldEnvironment")
	if world_env and world_env.environment:
		environment = world_env.environment


## Apply level environment
func apply_level_environment(level_number: int) -> void:
	if level_number not in LEVEL_ENVIRONMENTS:
		return

	var env_config = LEVEL_ENVIRONMENTS[level_number]

	# Apply weather
	set_weather(env_config["weather"], env_config.get("weather_intensity", 1.0))

	# Apply lighting
	set_lighting(env_config["lighting"])

	# Apply fog
	if env_config.get("fog_enabled", false):
		set_fog_density(env_config.get("fog_density", 0.05))
	else:
		disable_fog()

	print("[Environment] Applied level %d environment" % level_number)


## Set weather
func set_weather(weather_type: WeatherType, intensity: float = 1.0) -> void:
	if current_weather == weather_type:
		return

	current_weather = weather_type
	weather_intensity = intensity

	# Get weather key
	var weather_key = WeatherType.keys()[weather_type].to_lower()

	# Apply weather effects
	apply_weather_effects(weather_key)

	weather_changed.emit(weather_key)

	print("[Environment] Weather changed to: %s" % weather_key)


## Apply weather effects
func apply_weather_effects(weather_key: String) -> void:
	if weather_key not in WEATHER_DATA:
		return

	var weather_config = WEATHER_DATA[weather_key]

	# Update particle system
	update_weather_particles(weather_key, weather_config)

	# Apply visibility changes
	if environment and "visibility_multiplier" in weather_config:
		var vis = weather_config["visibility_multiplier"]
		# Adjust fog/view distance based on visibility
		pass

	# Play weather sounds
	if "sound" in weather_config:
		play_weather_sound(weather_config["sound"])


## Update weather particles
func update_weather_particles(weather_key: String, config: Dictionary) -> void:
	# TODO: Create/update particle system for weather
	# This would involve spawning GPUParticles3D with appropriate settings
	pass


## Set lighting
func set_lighting(lighting_type: LightingPreset) -> void:
	if current_lighting == lighting_type:
		return

	current_lighting = lighting_type

	# Get lighting key
	var lighting_key = LightingPreset.keys()[lighting_type].to_lower()

	# Apply lighting
	apply_lighting_preset(lighting_key)

	lighting_changed.emit(lighting_key)

	print("[Environment] Lighting changed to: %s" % lighting_key)


## Apply lighting preset
func apply_lighting_preset(preset_key: String) -> void:
	if preset_key not in LIGHTING_DATA:
		return

	var lighting_config = LIGHTING_DATA[preset_key]

	# Apply to directional light
	if directional_light:
		if "sun_energy" in lighting_config:
			directional_light.light_energy = lighting_config["sun_energy"]

		if "sun_color" in lighting_config:
			directional_light.light_color = lighting_config["sun_color"]

	# Apply to environment
	if environment:
		if "ambient_energy" in lighting_config:
			environment.ambient_light_energy = lighting_config["ambient_energy"]

		if "ambient_color" in lighting_config:
			environment.ambient_light_color = lighting_config["ambient_color"]

		if "tint" in lighting_config:
			environment.tonemap_white = lighting_config["tint"].r

	# Handle flickering
	is_flickering = lighting_config.get("flicker_enabled", false)


## Update flickering effect
func update_flickering(delta: float) -> void:
	if not directional_light:
		return

	flicker_timer += delta

	var flicker_speed = 10.0  # Flickers per second
	var flicker_amount = 0.3

	var base_energy = 0.3
	var flicker = sin(flicker_timer * flicker_speed * TAU) * flicker_amount

	directional_light.light_energy = base_energy + flicker


## Set fog density
func set_fog_density(density: float) -> void:
	if not environment:
		return

	environment.fog_enabled = true
	environment.fog_density = density
	environment.fog_aerial_perspective = 0.5


## Disable fog
func disable_fog() -> void:
	if not environment:
		return

	environment.fog_enabled = false


## Check if current weather deals damage
func has_weather_damage() -> bool:
	var weather_key = WeatherType.keys()[current_weather].to_lower()
	if weather_key not in WEATHER_DATA:
		return false

	return "periodic_damage" in WEATHER_DATA[weather_key]


## Update weather damage
func update_weather_damage(delta: float) -> void:
	damage_timer += delta

	var weather_key = WeatherType.keys()[current_weather].to_lower()
	var weather_config = WEATHER_DATA[weather_key]

	var damage_interval = weather_config.get("damage_interval", 1.0)

	if damage_timer >= damage_interval:
		damage_timer = 0.0

		# Deal damage to player
		var game_manager = get_node_or_null("/root/GameManager")
		if game_manager:
			var damage = weather_config["periodic_damage"]
			game_manager.damage_player(damage)

			print("[Environment] Weather damage: %f" % damage)


## Play weather sound
func play_weather_sound(sound_name: String) -> void:
	var audio_manager = get_node_or_null("/root/AudioManager")
	if audio_manager:
		# audio_manager.play_ambient_loop(sound_name)
		pass


## Create lightning strike (for special events)
func create_lightning_strike(position: Vector3) -> void:
	# TODO: Create lightning visual + sound effect
	# Screen flash
	# Thunder sound delayed by distance

	print("[Environment] Lightning strike at %s" % position)


## Get current visibility multiplier
func get_visibility_multiplier() -> float:
	var weather_key = WeatherType.keys()[current_weather].to_lower()
	if weather_key not in WEATHER_DATA:
		return 1.0

	return WEATHER_DATA[weather_key].get("visibility_multiplier", 1.0)


## Get movement multiplier (for player/enemies)
func get_movement_multiplier() -> float:
	var weather_key = WeatherType.keys()[current_weather].to_lower()
	if weather_key not in WEATHER_DATA:
		return 1.0

	return WEATHER_DATA[weather_key].get("movement_multiplier", 1.0)
