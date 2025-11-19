extends Node
## PowerUpSystem - Manages temporary power-ups and pickups
##
## Features:
## - Various power-up types
## - Duration-based effects
## - Stacking rules
## - Visual indicators

signal power_up_collected(power_up_type: String)
signal power_up_expired(power_up_type: String)
signal power_up_active_changed(power_up_type: String, active: bool)

# Active power-ups with remaining duration
var active_power_ups: Dictionary = {}

# Power-up definitions
const POWER_UP_DATA: Dictionary = {
	"damage_boost": {
		"name": "Damage Boost",
		"duration": 10.0,
		"multiplier": 2.0,
		"stackable": false
	},
	"rapid_fire": {
		"name": "Rapid Fire",
		"duration": 8.0,
		"fire_rate_mult": 0.5,  # 50% faster
		"stackable": false
	},
	"shield": {
		"name": "Shield",
		"duration": 15.0,
		"absorb_damage": 50.0,
		"stackable": true
	},
	"speed_boost": {
		"name": "Speed Boost",
		"duration": 12.0,
		"speed_mult": 1.5,
		"stackable": false
	},
	"infinite_ammo": {
		"name": "Infinite Ammo",
		"duration": 15.0,
		"stackable": false
	},
	"invincibility": {
		"name": "Invincibility",
		"duration": 5.0,
		"stackable": false
	},
	"double_currency": {
		"name": "Double Currency",
		"duration": 20.0,
		"currency_mult": 2.0,
		"stackable": false
	},
	"slow_motion": {
		"name": "Slow Motion",
		"duration": 6.0,
		"time_scale": 0.5,
		"stackable": false
	}
}


func _process(delta: float) -> void:
	# Update active power-up durations
	var expired_power_ups: Array[String] = []

	for power_up_type in active_power_ups.keys():
		active_power_ups[power_up_type] -= delta

		if active_power_ups[power_up_type] <= 0:
			expired_power_ups.append(power_up_type)

	# Remove expired power-ups
	for power_up_type in expired_power_ups:
		expire_power_up(power_up_type)


## Collect a power-up
func collect_power_up(power_up_type: String) -> bool:
	if power_up_type not in POWER_UP_DATA:
		return false

	var power_up = POWER_UP_DATA[power_up_type]

	# Check if stackable
	if power_up_type in active_power_ups and not power_up.get("stackable", false):
		# Refresh duration instead
		active_power_ups[power_up_type] = power_up["duration"]
		return true

	# Activate power-up
	active_power_ups[power_up_type] = power_up["duration"]

	# Apply effect
	apply_power_up_effect(power_up_type)

	power_up_collected.emit(power_up_type)
	power_up_active_changed.emit(power_up_type, true)

	print("[PowerUp] Collected: %s" % power_up["name"])
	return true


## Apply power-up effect when activated
func apply_power_up_effect(power_up_type: String) -> void:
	match power_up_type:
		"slow_motion":
			# Slow down time (affects enemies)
			Engine.time_scale = POWER_UP_DATA[power_up_type]["time_scale"]


## Expire a power-up
func expire_power_up(power_up_type: String) -> void:
	if power_up_type not in active_power_ups:
		return

	active_power_ups.erase(power_up_type)

	# Remove effect
	remove_power_up_effect(power_up_type)

	power_up_expired.emit(power_up_type)
	power_up_active_changed.emit(power_up_type, false)

	print("[PowerUp] Expired: %s" % POWER_UP_DATA[power_up_type]["name"])


## Remove power-up effect
func remove_power_up_effect(power_up_type: String) -> void:
	match power_up_type:
		"slow_motion":
			Engine.time_scale = 1.0


## Check if power-up is active
func is_active(power_up_type: String) -> bool:
	return power_up_type in active_power_ups


## Get remaining duration for power-up
func get_remaining_duration(power_up_type: String) -> float:
	if power_up_type in active_power_ups:
		return active_power_ups[power_up_type]
	return 0.0


## Get damage multiplier from active power-ups
func get_damage_multiplier() -> float:
	if is_active("damage_boost"):
		return POWER_UP_DATA["damage_boost"]["multiplier"]
	return 1.0


## Get fire rate multiplier
func get_fire_rate_multiplier() -> float:
	if is_active("rapid_fire"):
		return POWER_UP_DATA["rapid_fire"]["fire_rate_mult"]
	return 1.0


## Get speed multiplier
func get_speed_multiplier() -> float:
	if is_active("speed_boost"):
		return POWER_UP_DATA["speed_boost"]["speed_mult"]
	return 1.0


## Check if player has infinite ammo
func has_infinite_ammo() -> bool:
	return is_active("infinite_ammo")


## Check if player is invincible
func is_invincible() -> bool:
	return is_active("invincibility")


## Get currency multiplier
func get_currency_multiplier() -> float:
	if is_active("double_currency"):
		return POWER_UP_DATA["double_currency"]["currency_mult"]
	return 1.0


## Clear all power-ups
func clear_all() -> void:
	for power_up_type in active_power_ups.keys():
		remove_power_up_effect(power_up_type)

	active_power_ups.clear()
