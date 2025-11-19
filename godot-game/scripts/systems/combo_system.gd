extends Node
## ComboSystem - Tracks and rewards kill combos
##
## Features:
## - Tracks consecutive kills without missing
## - Timeout system (combo breaks if no kill within time)
## - Score multipliers based on combo level
## - Visual feedback triggers

signal combo_increased(combo_count: int, multiplier: float)
signal combo_milestone(milestone: int, bonus_points: int)
signal combo_broken(final_combo: int)

# Combo state
var current_combo: int = 0
var max_combo: int = 0
var combo_multiplier: float = 1.0

# Timing
var combo_timeout: float = 3.0  # Seconds before combo breaks
var time_since_last_kill: float = 0.0
var combo_active: bool = false

# Milestones
const COMBO_MILESTONES: Dictionary = {
	5: 500,    # 5 kills = 500 bonus points
	10: 1500,  # 10 kills = 1500 bonus points
	25: 5000,  # 25 kills = 5000 bonus points
	50: 15000, # 50 kills = 15000 bonus points
	100: 50000 # 100 kills = 50000 bonus points
}

# Score multipliers per combo level
const MULTIPLIER_THRESHOLDS: Array[Dictionary] = [
	{"combo": 0, "multiplier": 1.0},
	{"combo": 3, "multiplier": 1.5},
	{"combo": 5, "multiplier": 2.0},
	{"combo": 10, "multiplier": 2.5},
	{"combo": 15, "multiplier": 3.0},
	{"combo": 25, "multiplier": 4.0},
	{"combo": 50, "multiplier": 5.0},
	{"combo": 100, "multiplier": 10.0}
]


func _process(delta: float) -> void:
	if combo_active:
		time_since_last_kill += delta

		# Check for combo timeout
		if time_since_last_kill >= combo_timeout:
			break_combo()


## Register a kill
func register_kill() -> void:
	current_combo += 1
	max_combo = max(max_combo, current_combo)
	time_since_last_kill = 0.0
	combo_active = true

	# Update multiplier
	update_multiplier()

	# Emit combo increased
	combo_increased.emit(current_combo, combo_multiplier)

	# Check for milestones
	if current_combo in COMBO_MILESTONES:
		var bonus: int = COMBO_MILESTONES[current_combo]
		combo_milestone.emit(current_combo, bonus)

		# Award bonus points through GameManager
		if has_node("/root/GameManager"):
			get_node("/root/GameManager").add_score(bonus)


## Break the combo (timeout or player hit)
func break_combo() -> void:
	if current_combo > 0:
		combo_broken.emit(current_combo)

	current_combo = 0
	combo_multiplier = 1.0
	combo_active = false
	time_since_last_kill = 0.0


## Reset combo and stats
func reset() -> void:
	current_combo = 0
	max_combo = 0
	combo_multiplier = 1.0
	combo_active = false
	time_since_last_kill = 0.0


## Update score multiplier based on combo
func update_multiplier() -> void:
	# Find the highest threshold we've passed
	for threshold in MULTIPLIER_THRESHOLDS:
		if current_combo >= threshold["combo"]:
			combo_multiplier = threshold["multiplier"]


## Get current combo count
func get_combo() -> int:
	return current_combo


## Get current multiplier
func get_multiplier() -> float:
	return combo_multiplier


## Get max combo achieved
func get_max_combo() -> int:
	return max_combo


## Extend combo timeout (for perks/powerups)
func extend_timeout(additional_time: float) -> void:
	combo_timeout += additional_time


## Reset timeout to default
func reset_timeout() -> void:
	combo_timeout = 3.0
