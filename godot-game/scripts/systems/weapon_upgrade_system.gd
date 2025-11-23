extends Node
## WeaponUpgradeSystem - Upgrade weapons with mods
##
## Features:
## - Weapon mod slots
## - Stat upgrades
## - Special effects
## - Rarity tiers

signal weapon_upgraded(weapon_name: String, mod_name: String)
signal mod_unlocked(mod_name: String)

# Weapon mods database
const WEAPON_MODS: Dictionary = {
	# Damage mods
	"damage_boost_1": {
		"name": "Damage Amplifier I",
		"rarity": "common",
		"stat_changes": {"damage": 1.2},
		"cost": 200
	},
	"damage_boost_2": {
		"name": "Damage Amplifier II",
		"rarity": "rare",
		"stat_changes": {"damage": 1.5},
		"cost": 500
	},
	"damage_boost_3": {
		"name": "Damage Amplifier III",
		"rarity": "epic",
		"stat_changes": {"damage": 2.0},
		"cost": 1000
	},

	# Fire rate mods
	"rapid_fire_1": {
		"name": "Quick Trigger I",
		"rarity": "common",
		"stat_changes": {"fire_rate": 0.9},
		"cost": 250
	},
	"rapid_fire_2": {
		"name": "Quick Trigger II",
		"rarity": "rare",
		"stat_changes": {"fire_rate": 0.75},
		"cost": 600
	},

	# Ammo mods
	"extended_mag_1": {
		"name": "Extended Magazine I",
		"rarity": "common",
		"stat_changes": {"max_ammo": 1.5},
		"cost": 150
	},
	"extended_mag_2": {
		"name": "Extended Magazine II",
		"rarity": "rare",
		"stat_changes": {"max_ammo": 2.0},
		"cost": 400
	},

	# Reload mods
	"fast_reload": {
		"name": "Speed Loader",
		"rarity": "common",
		"stat_changes": {"reload_time": 0.7},
		"cost": 200
	},

	# Special effect mods
	"explosive_rounds": {
		"name": "Explosive Rounds",
		"rarity": "epic",
		"special_effect": "explosion_on_hit",
		"cost": 800
	},
	"piercing_rounds": {
		"name": "Armor Piercing",
		"rarity": "rare",
		"special_effect": "pierce_armor",
		"cost": 600
	},
	"incendiary_rounds": {
		"name": "Incendiary Ammo",
		"rarity": "rare",
		"special_effect": "burn_on_hit",
		"cost": 500
	},
	"cryo_rounds": {
		"name": "Cryo Rounds",
		"rarity": "epic",
		"special_effect": "freeze_on_hit",
		"cost": 700
	},
	"vampire_rounds": {
		"name": "Life Steal",
		"rarity": "legendary",
		"special_effect": "heal_on_hit",
		"cost": 1500
	}
}

# Installed mods: weapon -> [mods]
var installed_mods: Dictionary = {}
var unlocked_mods: Array[String] = []


## Install mod on weapon
func install_mod(weapon_name: String, mod_name: String) -> bool:
	if mod_name not in WEAPON_MODS:
		return false

	var mod_data = WEAPON_MODS[mod_name]

	# Check currency
	var game_manager = get_node_or_null("/root/GameManager")
	if game_manager:
		if not game_manager.spend_currency(mod_data["cost"]):
			return false

	# Initialize weapon mods array
	if weapon_name not in installed_mods:
		installed_mods[weapon_name] = []

	# Check if already installed
	if mod_name in installed_mods[weapon_name]:
		return false

	# Install mod
	installed_mods[weapon_name].append(mod_name)

	weapon_upgraded.emit(weapon_name, mod_name)

	print("[WeaponUpgrade] Installed %s on %s" % [mod_data["name"], weapon_name])
	return true


## Remove mod from weapon
func remove_mod(weapon_name: String, mod_name: String) -> void:
	if weapon_name not in installed_mods:
		return

	installed_mods[weapon_name].erase(mod_name)


## Get total stat multiplier for weapon
func get_stat_multiplier(weapon_name: String, stat_name: String) -> float:
	if weapon_name not in installed_mods:
		return 1.0

	var multiplier = 1.0

	for mod_name in installed_mods[weapon_name]:
		if mod_name not in WEAPON_MODS:
			continue

		var mod_data = WEAPON_MODS[mod_name]
		if "stat_changes" in mod_data and stat_name in mod_data["stat_changes"]:
			multiplier *= mod_data["stat_changes"][stat_name]

	return multiplier


## Get special effects for weapon
func get_special_effects(weapon_name: String) -> Array[String]:
	if weapon_name not in installed_mods:
		return []

	var effects: Array[String] = []

	for mod_name in installed_mods[weapon_name]:
		if mod_name not in WEAPON_MODS:
			continue

		var mod_data = WEAPON_MODS[mod_name]
		if "special_effect" in mod_data:
			effects.append(mod_data["special_effect"])

	return effects


## Check if weapon has specific effect
func has_effect(weapon_name: String, effect_name: String) -> bool:
	var effects = get_special_effects(weapon_name)
	return effect_name in effects


## Unlock mod for purchase
func unlock_mod(mod_name: String) -> void:
	if mod_name not in unlocked_mods:
		unlocked_mods.append(mod_name)
		mod_unlocked.emit(mod_name)


## Get installed mods for weapon
func get_installed_mods(weapon_name: String) -> Array:
	return installed_mods.get(weapon_name, [])


## Get mod info
func get_mod_info(mod_name: String) -> Dictionary:
	return WEAPON_MODS.get(mod_name, {})
