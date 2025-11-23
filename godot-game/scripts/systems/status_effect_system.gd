extends Node
## StatusEffectSystem - Manages status effects on entities
##
## Features:
## - Damage over time
## - Movement debuffs
## - Stuns and freezes
## - Buff/debuff stacking
## - Visual indicators

signal status_applied(entity: Node3D, effect_type: String)
signal status_removed(entity: Node3D, effect_type: String)
signal status_tick(entity: Node3D, effect_type: String, damage: float)

# Active status effects: entity -> [effects]
var active_effects: Dictionary = {}

# Status effect definitions
const STATUS_EFFECTS: Dictionary = {
	"burn": {
		"name": "Burning",
		"type": "dot",  # damage over time
		"damage_per_second": 5.0,
		"duration": 5.0,
		"tick_rate": 0.5,
		"color": Color.ORANGE_RED,
		"stackable": true,
		"max_stacks": 3
	},
	"poison": {
		"name": "Poisoned",
		"type": "dot",
		"damage_per_second": 3.0,
		"duration": 8.0,
		"tick_rate": 1.0,
		"color": Color.GREEN,
		"stackable": true,
		"max_stacks": 5
	},
	"freeze": {
		"name": "Frozen",
		"type": "disable",
		"duration": 2.0,
		"movement_multiplier": 0.0,
		"color": Color.CYAN,
		"stackable": false
	},
	"slow": {
		"name": "Slowed",
		"type": "debuff",
		"duration": 4.0,
		"movement_multiplier": 0.5,
		"fire_rate_multiplier": 0.7,
		"color": Color.BLUE,
		"stackable": false
	},
	"stun": {
		"name": "Stunned",
		"type": "disable",
		"duration": 1.5,
		"movement_multiplier": 0.0,
		"color": Color.YELLOW,
		"stackable": false
	},
	"weakness": {
		"name": "Weakened",
		"type": "debuff",
		"duration": 6.0,
		"damage_multiplier": 0.7,
		"color": Color.PURPLE,
		"stackable": false
	},
	"armor_break": {
		"name": "Armor Broken",
		"type": "debuff",
		"duration": 5.0,
		"defense_multiplier": 0.5,
		"color": Color.DARK_GRAY,
		"stackable": false
	},
	"bleed": {
		"name": "Bleeding",
		"type": "dot",
		"damage_per_second": 8.0,
		"duration": 4.0,
		"tick_rate": 0.5,
		"color": Color.DARK_RED,
		"stackable": true,
		"max_stacks": 3
	}
}


func _process(delta: float) -> void:
	# Update all active effects
	for entity in active_effects.keys():
		if not is_instance_valid(entity):
			active_effects.erase(entity)
			continue

		var effects = active_effects[entity]
		var effects_to_remove: Array[Dictionary] = []

		for effect in effects:
			effect["elapsed"] += delta
			effect["tick_timer"] += delta

			# Check if effect expired
			if effect["elapsed"] >= effect["duration"]:
				effects_to_remove.append(effect)
				continue

			# Process effect ticks
			if effect["type"] == "dot":
				if effect["tick_timer"] >= effect["tick_rate"]:
					apply_dot_tick(entity, effect)
					effect["tick_timer"] = 0.0

		# Remove expired effects
		for effect in effects_to_remove:
			remove_effect(entity, effect)


## Apply status effect to entity
func apply_status(entity: Node3D, effect_type: String, source: Node3D = null) -> void:
	if effect_type not in STATUS_EFFECTS:
		return

	var effect_data = STATUS_EFFECTS[effect_type]

	# Initialize entity effects array
	if entity not in active_effects:
		active_effects[entity] = []

	# Check if stackable
	if not effect_data.get("stackable", false):
		# Check if already has this effect
		for effect in active_effects[entity]:
			if effect["type"] == effect_type:
				# Refresh duration instead
				effect["elapsed"] = 0.0
				return

	# Check stack limit
	if effect_data.get("stackable", false):
		var stack_count = 0
		for effect in active_effects[entity]:
			if effect["type"] == effect_type:
				stack_count += 1

		if stack_count >= effect_data.get("max_stacks", 1):
			return  # Max stacks reached

	# Create new effect instance
	var new_effect = {
		"type": effect_type,
		"name": effect_data["name"],
		"duration": effect_data["duration"],
		"elapsed": 0.0,
		"tick_timer": 0.0,
		"source": source,
		"data": effect_data.duplicate()
	}

	active_effects[entity].append(new_effect)

	status_applied.emit(entity, effect_type)

	# Apply immediate effects
	apply_effect_modifiers(entity, new_effect)

	print("[StatusEffect] Applied %s to entity" % effect_data["name"])


## Remove status effect from entity
func remove_status(entity: Node3D, effect_type: String) -> void:
	if entity not in active_effects:
		return

	var effects_to_remove: Array[Dictionary] = []

	for effect in active_effects[entity]:
		if effect["type"] == effect_type:
			effects_to_remove.append(effect)

	for effect in effects_to_remove:
		remove_effect(entity, effect)


## Remove specific effect instance
func remove_effect(entity: Node3D, effect: Dictionary) -> void:
	if entity not in active_effects:
		return

	active_effects[entity].erase(effect)

	# Remove modifiers
	remove_effect_modifiers(entity, effect)

	status_removed.emit(entity, effect["type"])


## Apply DOT tick
func apply_dot_tick(entity: Node3D, effect: Dictionary) -> void:
	if not entity.has_method("take_damage"):
		return

	var damage = effect["data"]["damage_per_second"] * effect["data"]["tick_rate"]
	entity.take_damage(damage)

	status_tick.emit(entity, effect["type"], damage)

	# Spawn damage particle
	spawn_status_particle(entity, effect)


## Apply effect modifiers to entity
func apply_effect_modifiers(entity: Node3D, effect: Dictionary) -> void:
	# Visual indicator
	apply_visual_indicator(entity, effect)


## Remove effect modifiers from entity
func remove_effect_modifiers(entity: Node3D, effect: Dictionary) -> void:
	# Remove visual indicator
	remove_visual_indicator(entity, effect)


## Apply visual indicator for status effect
func apply_visual_indicator(entity: Node3D, effect: Dictionary) -> void:
	# TODO: Create visual particle effect on entity
	pass


## Remove visual indicator
func remove_visual_indicator(entity: Node3D, effect: Dictionary) -> void:
	# TODO: Remove visual particle effect
	pass


## Spawn status particle
func spawn_status_particle(entity: Node3D, effect: Dictionary) -> void:
	var particle_system = get_node_or_null("/root/ParticleEffects")
	if particle_system and entity:
		var color = effect["data"].get("color", Color.WHITE)
		# Create small status effect particle
		# TODO: particle_system.create_status_particle(entity.global_position, color)


## Get active effects for entity
func get_active_effects(entity: Node3D) -> Array:
	if entity in active_effects:
		return active_effects[entity]
	return []


## Check if entity has specific effect
func has_effect(entity: Node3D, effect_type: String) -> bool:
	if entity not in active_effects:
		return false

	for effect in active_effects[entity]:
		if effect["type"] == effect_type:
			return true

	return false


## Get movement multiplier from effects
func get_movement_multiplier(entity: Node3D) -> float:
	if entity not in active_effects:
		return 1.0

	var multiplier = 1.0

	for effect in active_effects[entity]:
		if "movement_multiplier" in effect["data"]:
			multiplier *= effect["data"]["movement_multiplier"]

	return multiplier


## Get damage multiplier from effects
func get_damage_multiplier(entity: Node3D) -> float:
	if entity not in active_effects:
		return 1.0

	var multiplier = 1.0

	for effect in active_effects[entity]:
		if "damage_multiplier" in effect["data"]:
			multiplier *= effect["data"]["damage_multiplier"]

	return multiplier


## Clear all effects from entity
func clear_all_effects(entity: Node3D) -> void:
	if entity not in active_effects:
		return

	for effect in active_effects[entity].duplicate():
		remove_effect(entity, effect)

	active_effects.erase(entity)
