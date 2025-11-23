extends Node
## SpecialAbilitySystem - Player special abilities
##
## Features:
## - Cooldown-based abilities
## - Energy/resource costs
## - Ultimate abilities
## - Ability upgrades

signal ability_used(ability_name: String)
signal ability_ready(ability_name: String)
signal ultimate_charged()

# Abilities
const ABILITIES: Dictionary = {
	"dash": {
		"name": "Combat Dash",
		"description": "Quick dodge in movement direction with i-frames",
		"cooldown": 3.0,
		"energy_cost": 0,
		"type": "mobility"
	},
	"grenade": {
		"name": "Frag Grenade",
		"description": "Throw explosive grenade",
		"cooldown": 8.0,
		"energy_cost": 25,
		"damage": 50.0,
		"radius": 5.0,
		"type": "offensive"
	},
	"shield_burst": {
		"name": "Shield Burst",
		"description": "Create temporary shield that absorbs damage",
		"cooldown": 12.0,
		"energy_cost": 50,
		"shield_amount": 100.0,
		"duration": 5.0,
		"type": "defensive"
	},
	"time_slow": {
		"name": "Tactical Slowdown",
		"description": "Slow down time for enemies",
		"cooldown": 15.0,
		"energy_cost": 75,
		"duration": 4.0,
		"slow_amount": 0.5,
		"type": "tactical"
	},
	"healing_burst": {
		"name": "Medkit",
		"description": "Instant heal + regeneration",
		"cooldown": 20.0,
		"energy_cost": 50,
		"instant_heal": 30.0,
		"regen_amount": 20.0,
		"regen_duration": 5.0,
		"type": "support"
	},
	"ultimate_barrage": {
		"name": "Bullet Storm",
		"description": "ULTIMATE: Rapid fire all weapons simultaneously",
		"cooldown": 0.0,  # Charged by kills
		"energy_cost": 100,
		"duration": 10.0,
		"type": "ultimate"
	}
}

# Ability states
var ability_cooldowns: Dictionary = {}
var ability_unlocked: Dictionary = {
	"dash": true,  # Start with dash
	"grenade": false,
	"shield_burst": false,
	"time_slow": false,
	"healing_burst": false,
	"ultimate_barrage": false
}

# Energy system
var max_energy: float = 100.0
var current_energy: float = 100.0
var energy_regen_rate: float = 5.0  # Per second

# Ultimate charge
var ultimate_charge: float = 0.0
var ultimate_charge_per_kill: float = 10.0


func _process(delta: float) -> void:
	# Update cooldowns
	for ability_name in ability_cooldowns.keys():
		ability_cooldowns[ability_name] = max(0.0, ability_cooldowns[ability_name] - delta)

		if ability_cooldowns[ability_name] <= 0.0:
			ability_ready.emit(ability_name)
			ability_cooldowns.erase(ability_name)

	# Regenerate energy
	if current_energy < max_energy:
		current_energy = min(max_energy, current_energy + energy_regen_rate * delta)


## Use ability
func use_ability(ability_name: String) -> bool:
	if not can_use_ability(ability_name):
		return false

	var ability = ABILITIES[ability_name]

	# Consume energy
	current_energy -= ability["energy_cost"]

	# Start cooldown
	ability_cooldowns[ability_name] = ability["cooldown"]

	# Execute ability
	execute_ability(ability_name, ability)

	ability_used.emit(ability_name)

	print("[Ability] Used: %s" % ability["name"])
	return true


## Check if ability can be used
func can_use_ability(ability_name: String) -> bool:
	if ability_name not in ABILITIES:
		return false

	if not ability_unlocked.get(ability_name, false):
		return false

	if ability_name in ability_cooldowns and ability_cooldowns[ability_name] > 0:
		return false

	var ability = ABILITIES[ability_name]
	if current_energy < ability["energy_cost"]:
		return false

	# Check ultimate charge
	if ability["type"] == "ultimate" and ultimate_charge < 100.0:
		return false

	return true


## Execute ability effect
func execute_ability(ability_name: String, ability: Dictionary) -> void:
	match ability_name:
		"dash":
			execute_dash()

		"grenade":
			execute_grenade(ability)

		"shield_burst":
			execute_shield_burst(ability)

		"time_slow":
			execute_time_slow(ability)

		"healing_burst":
			execute_healing_burst(ability)

		"ultimate_barrage":
			execute_ultimate_barrage(ability)


## Execute dash ability
func execute_dash() -> void:
	# TODO: Trigger dodge system
	var dodge_system = get_node_or_null("/root/DodgeSystem")
	if dodge_system:
		# dodge_system.perform_dash()
		pass

	print("[Ability] Dash executed!")


## Execute grenade ability
func execute_grenade(ability: Dictionary) -> void:
	# TODO: Spawn grenade projectile
	print("[Ability] Grenade thrown!")


## Execute shield burst
func execute_shield_burst(ability: Dictionary) -> void:
	var power_up_system = get_node_or_null("/root/PowerUpSystem")
	if power_up_system:
		power_up_system.collect_power_up("shield")

	print("[Ability] Shield activated!")


## Execute time slow
func execute_time_slow(ability: Dictionary) -> void:
	# Slow down enemy time
	Engine.time_scale = ability["slow_amount"]

	# Restore after duration
	await get_tree().create_timer(ability["duration"]).timeout
	Engine.time_scale = 1.0

	print("[Ability] Time slowdown activated!")


## Execute healing burst
func execute_healing_burst(ability: Dictionary) -> void:
	var game_manager = get_node_or_null("/root/GameManager")
	if game_manager:
		game_manager.heal_player(ability["instant_heal"])

	# TODO: Add regeneration over time

	print("[Ability] Healing burst activated!")


## Execute ultimate barrage
func execute_ultimate_barrage(ability: Dictionary) -> void:
	ultimate_charge = 0.0

	# TODO: Activate bullet storm mode

	print("[Ability] ULTIMATE - Bullet Storm!")


## Charge ultimate by kills
func charge_ultimate() -> void:
	ultimate_charge = min(100.0, ultimate_charge + ultimate_charge_per_kill)

	if ultimate_charge >= 100.0:
		ultimate_charged.emit()


## Unlock ability
func unlock_ability(ability_name: String) -> void:
	if ability_name in ability_unlocked:
		ability_unlocked[ability_name] = true
		print("[Ability] Unlocked: %s" % ABILITIES[ability_name]["name"])


## Get cooldown remaining
func get_cooldown_remaining(ability_name: String) -> float:
	return ability_cooldowns.get(ability_name, 0.0)


## Get energy percentage
func get_energy_percentage() -> float:
	return (current_energy / max_energy) * 100.0


## Get ultimate charge percentage
func get_ultimate_percentage() -> float:
	return ultimate_charge
