extends Node
## ProgressionSystem - Player leveling and progression
##
## Features:
## - XP and leveling
## - Skill points and skill trees
## - Stat upgrades (health, damage, speed)
## - Prestige system
## - Unlock achievements

signal level_up(new_level: int)
signal xp_gained(amount: int, total_xp: int)
signal skill_unlocked(skill_id: String)
signal stat_upgraded(stat_name: String, new_value: float)
signal prestige_unlocked()

# Player stats
var current_level: int = 1
var current_xp: int = 0
var skill_points: int = 0
var prestige_level: int = 0

# XP curve (level -> XP required)
var xp_curve: Array[int] = []
var max_level: int = 50

# Base stats
var base_stats: Dictionary = {
	"max_health": 100.0,
	"damage_multiplier": 1.0,
	"move_speed_multiplier": 1.0,
	"reload_speed_multiplier": 1.0,
	"critical_chance": 0.05,
	"critical_damage": 1.5,
	"armor": 0.0,
	"health_regen": 0.0
}

# Current stats (with upgrades applied)
var current_stats: Dictionary = {}

# Unlocked skills
var unlocked_skills: Array[String] = []

# Skill tree
const SKILLS: Dictionary = {
	# Combat skills
	"increased_damage_1": {
		"name": "Damage I",
		"description": "+10% weapon damage",
		"cost": 1,
		"requires": [],
		"stat_bonus": {"damage_multiplier": 0.1}
	},
	"increased_damage_2": {
		"name": "Damage II",
		"description": "+15% weapon damage",
		"cost": 1,
		"requires": ["increased_damage_1"],
		"stat_bonus": {"damage_multiplier": 0.15}
	},
	"increased_damage_3": {
		"name": "Damage III",
		"description": "+20% weapon damage",
		"cost": 2,
		"requires": ["increased_damage_2"],
		"stat_bonus": {"damage_multiplier": 0.2}
	},

	# Health skills
	"increased_health_1": {
		"name": "Vitality I",
		"description": "+25 max health",
		"cost": 1,
		"requires": [],
		"stat_bonus": {"max_health": 25.0}
	},
	"increased_health_2": {
		"name": "Vitality II",
		"description": "+50 max health",
		"cost": 1,
		"requires": ["increased_health_1"],
		"stat_bonus": {"max_health": 50.0}
	},
	"health_regen": {
		"name": "Regeneration",
		"description": "Regenerate 1 HP per second",
		"cost": 2,
		"requires": ["increased_health_2"],
		"stat_bonus": {"health_regen": 1.0}
	},

	# Speed skills
	"increased_speed_1": {
		"name": "Fleet-Footed I",
		"description": "+10% movement speed",
		"cost": 1,
		"requires": [],
		"stat_bonus": {"move_speed_multiplier": 0.1}
	},
	"increased_speed_2": {
		"name": "Fleet-Footed II",
		"description": "+15% movement speed",
		"cost": 1,
		"requires": ["increased_speed_1"],
		"stat_bonus": {"move_speed_multiplier": 0.15}
	},

	# Critical skills
	"increased_crit_chance": {
		"name": "Sharp Eye",
		"description": "+10% critical hit chance",
		"cost": 2,
		"requires": [],
		"stat_bonus": {"critical_chance": 0.1}
	},
	"increased_crit_damage": {
		"name": "Deadly Precision",
		"description": "+50% critical hit damage",
		"cost": 2,
		"requires": ["increased_crit_chance"],
		"stat_bonus": {"critical_damage": 0.5}
	},

	# Reload skills
	"fast_reload_1": {
		"name": "Quick Hands I",
		"description": "-15% reload time",
		"cost": 1,
		"requires": [],
		"stat_bonus": {"reload_speed_multiplier": -0.15}
	},
	"fast_reload_2": {
		"name": "Quick Hands II",
		"description": "-25% reload time",
		"cost": 2,
		"requires": ["fast_reload_1"],
		"stat_bonus": {"reload_speed_multiplier": -0.25}
	},

	# Armor skills
	"armor_plating_1": {
		"name": "Armor Plating I",
		"description": "+10 armor (damage reduction)",
		"cost": 1,
		"requires": [],
		"stat_bonus": {"armor": 10.0}
	},
	"armor_plating_2": {
		"name": "Armor Plating II",
		"description": "+20 armor",
		"cost": 2,
		"requires": ["armor_plating_1"],
		"stat_bonus": {"armor": 20.0}
	},

	# Special skills
	"double_jump": {
		"name": "Double Jump",
		"description": "Unlock ability to jump in mid-air",
		"cost": 3,
		"requires": ["increased_speed_1"],
		"special": "unlock_double_jump"
	},
	"bullet_time": {
		"name": "Bullet Time",
		"description": "Unlock slow-motion ability",
		"cost": 3,
		"requires": ["increased_crit_chance"],
		"special": "unlock_bullet_time"
	},
	"combo_master": {
		"name": "Combo Master",
		"description": "+50% combo timer duration",
		"cost": 2,
		"requires": ["increased_damage_2"],
		"special": "extend_combo_timer"
	},
	"treasure_hunter": {
		"name": "Treasure Hunter",
		"description": "Increased rare item drop rate",
		"cost": 2,
		"requires": [],
		"special": "increase_drop_rate"
	}
}


func _ready() -> void:
	generate_xp_curve()
	reset_stats()


## Generate XP curve
func generate_xp_curve() -> void:
	xp_curve.clear()

	for level in range(1, max_level + 1):
		# Exponential curve: base * (level ^ exponent)
		var xp_required = int(100 * pow(level, 1.5))
		xp_curve.append(xp_required)


## Reset stats to base values
func reset_stats() -> void:
	current_stats = base_stats.duplicate()


## Gain XP
func gain_xp(amount: int) -> void:
	current_xp += amount
	xp_gained.emit(amount, current_xp)

	# Check for level up
	check_level_up()


## Check if player should level up
func check_level_up() -> void:
	if current_level >= max_level:
		return

	var xp_needed = get_xp_for_next_level()

	while current_xp >= xp_needed and current_level < max_level:
		level_up_player()
		xp_needed = get_xp_for_next_level()


## Level up player
func level_up_player() -> void:
	current_level += 1
	skill_points += 1

	# Heal player on level up
	var game_manager = get_node_or_null("/root/GameManager")
	if game_manager:
		game_manager.heal_player(game_manager.max_health * 0.5)

	level_up.emit(current_level)

	# Spawn VFX
	var vfx_library = get_node_or_null("/root/ParticleEffectsLibrary")
	if vfx_library:
		# vfx_library.spawn_effect("level_up", player_position)
		pass

	print("[Progression] Level up! Now level %d" % current_level)


## Unlock skill
func unlock_skill(skill_id: String) -> bool:
	if skill_id not in SKILLS:
		return false

	var skill = SKILLS[skill_id]

	# Check if already unlocked
	if skill_id in unlocked_skills:
		return false

	# Check skill points
	if skill_points < skill["cost"]:
		return false

	# Check requirements
	for required_skill in skill["requires"]:
		if required_skill not in unlocked_skills:
			return false

	# Unlock skill
	unlocked_skills.append(skill_id)
	skill_points -= skill["cost"]

	# Apply skill effects
	apply_skill(skill_id, skill)

	skill_unlocked.emit(skill_id)

	print("[Progression] Unlocked skill: %s" % skill["name"])
	return true


## Apply skill effects
func apply_skill(skill_id: String, skill: Dictionary) -> void:
	# Apply stat bonuses
	if skill.has("stat_bonus"):
		for stat_name in skill["stat_bonus"]:
			var bonus = skill["stat_bonus"][stat_name]
			current_stats[stat_name] += bonus

			stat_upgraded.emit(stat_name, current_stats[stat_name])

	# Apply special effects
	if skill.has("special"):
		apply_special_skill(skill["special"])


## Apply special skill effects
func apply_special_skill(special_id: String) -> void:
	match special_id:
		"unlock_double_jump":
			# Enable double jump in player controller
			var player = get_tree().get_first_node_in_group("player")
			if player and player.has_method("enable_double_jump"):
				player.enable_double_jump()

		"unlock_bullet_time":
			# Unlock bullet time ability
			var ability_system = get_node_or_null("/root/SpecialAbilitySystem")
			if ability_system:
				ability_system.unlock_ability("bullet_time")

		"extend_combo_timer":
			# Increase combo timer duration
			var combo_system = get_node_or_null("/root/ComboSystem")
			if combo_system:
				combo_system.combo_timeout *= 1.5

		"increase_drop_rate":
			# Increase drop rates
			pass


## Get stat value
func get_stat(stat_name: String) -> float:
	return current_stats.get(stat_name, 0.0)


## Get XP for next level
func get_xp_for_next_level() -> int:
	if current_level >= max_level:
		return 0

	return xp_curve[current_level - 1]


## Get XP progress percentage
func get_xp_progress_percentage() -> float:
	var xp_needed = get_xp_for_next_level()
	if xp_needed <= 0:
		return 100.0

	var xp_for_current_level = 0
	if current_level > 1:
		xp_for_current_level = xp_curve[current_level - 2]

	var xp_into_level = current_xp - xp_for_current_level
	var xp_for_this_level = xp_needed - xp_for_current_level

	return (float(xp_into_level) / float(xp_for_this_level)) * 100.0


## Check if can unlock skill
func can_unlock_skill(skill_id: String) -> bool:
	if skill_id not in SKILLS:
		return false

	if skill_id in unlocked_skills:
		return false

	var skill = SKILLS[skill_id]

	if skill_points < skill["cost"]:
		return false

	for required_skill in skill["requires"]:
		if required_skill not in unlocked_skills:
			return false

	return true


## Get available skills (not unlocked but requirements met)
func get_available_skills() -> Array[String]:
	var available: Array[String] = []

	for skill_id in SKILLS:
		if skill_id in unlocked_skills:
			continue

		var skill = SKILLS[skill_id]

		# Check requirements
		var requirements_met = true
		for required_skill in skill["requires"]:
			if required_skill not in unlocked_skills:
				requirements_met = false
				break

		if requirements_met:
			available.append(skill_id)

	return available


## Reset skills (refund points)
func reset_skills() -> bool:
	# Refund all skill points
	for skill_id in unlocked_skills:
		skill_points += SKILLS[skill_id]["cost"]

	unlocked_skills.clear()

	# Reset stats
	reset_stats()

	print("[Progression] Skills reset, %d points refunded" % skill_points)
	return true


## Prestige (reset progress for bonus)
func prestige() -> bool:
	if current_level < max_level:
		return false

	prestige_level += 1
	current_level = 1
	current_xp = 0
	skill_points = prestige_level  # Bonus starting points

	reset_skills()

	# Apply prestige bonuses
	for stat in base_stats:
		base_stats[stat] *= 1.1  # 10% stat increase per prestige

	reset_stats()

	prestige_unlocked.emit()

	print("[Progression] Prestige level %d!" % prestige_level)
	return true


## Save progression to dictionary
func save_to_dict() -> Dictionary:
	return {
		"level": current_level,
		"xp": current_xp,
		"skill_points": skill_points,
		"prestige_level": prestige_level,
		"unlocked_skills": unlocked_skills.duplicate(),
		"base_stats": base_stats.duplicate(),
		"current_stats": current_stats.duplicate()
	}


## Load progression from dictionary
func load_from_dict(data: Dictionary) -> void:
	current_level = data.get("level", 1)
	current_xp = data.get("xp", 0)
	skill_points = data.get("skill_points", 0)
	prestige_level = data.get("prestige_level", 0)
	unlocked_skills = data.get("unlocked_skills", [])
	base_stats = data.get("base_stats", base_stats.duplicate())
	current_stats = data.get("current_stats", current_stats.duplicate())
