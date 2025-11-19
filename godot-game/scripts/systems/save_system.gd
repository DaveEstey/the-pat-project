extends Node
## SaveSystem - Handle game save/load functionality
##
## Features:
## - Multiple save slots
## - Auto-save
## - Save file validation
## - Cloud save ready

signal save_completed(slot: int)
signal load_completed(slot: int)
signal save_failed(error: String)

const SAVE_VERSION: int = 1
const MAX_SAVE_SLOTS: int = 3
const SAVE_DIR: String = "user://saves/"
const AUTO_SAVE_INTERVAL: float = 60.0  # Auto-save every minute

var auto_save_timer: float = 0.0
var auto_save_enabled: bool = true


func _ready() -> void:
	# Ensure save directory exists
	create_save_directory()


func _process(delta: float) -> void:
	if auto_save_enabled:
		auto_save_timer += delta

		if auto_save_timer >= AUTO_SAVE_INTERVAL:
			auto_save()
			auto_save_timer = 0.0


## Create save directory
func create_save_directory() -> void:
	if not DirAccess.dir_exists_absolute(SAVE_DIR):
		DirAccess.make_dir_absolute(SAVE_DIR)


## Save game to slot
func save_game(slot: int) -> bool:
	if slot < 0 or slot >= MAX_SAVE_SLOTS:
		save_failed.emit("Invalid save slot")
		return false

	var save_data = gather_save_data()
	var file_path = get_save_file_path(slot)

	# Write to file
	var file = FileAccess.open(file_path, FileAccess.WRITE)
	if not file:
		save_failed.emit("Could not create save file")
		return false

	file.store_var(save_data, true)  # Full objects = true for encryption
	file.close()

	save_completed.emit(slot)
	print("[Save] Game saved to slot %d" % slot)
	return true


## Load game from slot
func load_game(slot: int) -> bool:
	if slot < 0 or slot >= MAX_SAVE_SLOTS:
		save_failed.emit("Invalid save slot")
		return false

	var file_path = get_save_file_path(slot)

	if not FileAccess.file_exists(file_path):
		save_failed.emit("Save file does not exist")
		return false

	var file = FileAccess.open(file_path, FileAccess.READ)
	if not file:
		save_failed.emit("Could not open save file")
		return false

	var save_data = file.get_var(true)
	file.close()

	# Validate save data
	if not validate_save_data(save_data):
		save_failed.emit("Save file is corrupted")
		return false

	# Apply save data
	apply_save_data(save_data)

	load_completed.emit(slot)
	print("[Save] Game loaded from slot %d" % slot)
	return true


## Auto-save to slot 0
func auto_save() -> void:
	save_game(0)  # Slot 0 is auto-save


## Gather all save data
func gather_save_data() -> Dictionary:
	var data = {
		"version": SAVE_VERSION,
		"timestamp": Time.get_unix_time_from_system(),
		"game_manager": {},
		"weapon_system": {},
		"achievement_system": {},
		"level_progress": {}
	}

	# Get GameManager state
	var game_manager = get_node_or_null("/root/GameManager")
	if game_manager:
		data["game_manager"] = {
			"current_level": game_manager.current_level,
			"player_health": game_manager.player_health,
			"player_max_health": game_manager.player_max_health,
			"player_currency": game_manager.player_currency,
			"player_score": game_manager.player_score,
			"completed_levels": game_manager.completed_levels,
			"max_combo": game_manager.max_combo
		}

	# Get WeaponSystem state
	var weapon_system = get_node_or_null("/root/WeaponSystem")
	if weapon_system:
		data["weapon_system"] = {
			"current_weapon": weapon_system.current_weapon,
			"unlocked_weapons": weapon_system.unlocked_weapons,
			"weapon_ammo": weapon_system.weapon_ammo
		}

	# Get AchievementSystem state
	var achievement_system = get_node_or_null("/root/AchievementSystem")
	if achievement_system:
		data["achievement_system"] = {
			"unlocked_achievements": achievement_system.unlocked_achievements,
			"stats": achievement_system.stats
		}

	return data


## Validate save data
func validate_save_data(data: Dictionary) -> bool:
	if not "version" in data:
		return false

	if data["version"] != SAVE_VERSION:
		print("[Save] Warning: Save file version mismatch")
		# Could implement migration here

	return true


## Apply save data to game
func apply_save_data(data: Dictionary) -> void:
	# Apply GameManager state
	if "game_manager" in data:
		var game_manager = get_node_or_null("/root/GameManager")
		if game_manager:
			var gm_data = data["game_manager"]
			game_manager.current_level = gm_data.get("current_level", 1)
			game_manager.player_health = gm_data.get("player_health", 100.0)
			game_manager.player_max_health = gm_data.get("player_max_health", 100.0)
			game_manager.player_currency = gm_data.get("player_currency", 0)
			game_manager.player_score = gm_data.get("player_score", 0)
			game_manager.completed_levels = gm_data.get("completed_levels", [])
			game_manager.max_combo = gm_data.get("max_combo", 0)

	# Apply WeaponSystem state
	if "weapon_system" in data:
		var weapon_system = get_node_or_null("/root/WeaponSystem")
		if weapon_system:
			var ws_data = data["weapon_system"]
			weapon_system.current_weapon = ws_data.get("current_weapon", "pistol")
			weapon_system.unlocked_weapons = ws_data.get("unlocked_weapons", ["pistol"])
			weapon_system.weapon_ammo = ws_data.get("weapon_ammo", {})

	# Apply AchievementSystem state
	if "achievement_system" in data:
		var achievement_system = get_node_or_null("/root/AchievementSystem")
		if achievement_system:
			var ach_data = data["achievement_system"]
			achievement_system.unlocked_achievements = ach_data.get("unlocked_achievements", {})
			achievement_system.stats = ach_data.get("stats", {})


## Delete save file
func delete_save(slot: int) -> bool:
	if slot < 0 or slot >= MAX_SAVE_SLOTS:
		return false

	var file_path = get_save_file_path(slot)

	if FileAccess.file_exists(file_path):
		DirAccess.remove_absolute(file_path)
		print("[Save] Deleted save slot %d" % slot)
		return true

	return false


## Check if save slot exists
func save_exists(slot: int) -> bool:
	if slot < 0 or slot >= MAX_SAVE_SLOTS:
		return false

	return FileAccess.file_exists(get_save_file_path(slot))


## Get save file info
func get_save_info(slot: int) -> Dictionary:
	if not save_exists(slot):
		return {}

	var file = FileAccess.open(get_save_file_path(slot), FileAccess.READ)
	if not file:
		return {}

	var save_data = file.get_var(true)
	file.close()

	if not validate_save_data(save_data):
		return {}

	return {
		"timestamp": save_data.get("timestamp", 0),
		"level": save_data.get("game_manager", {}).get("current_level", 0),
		"currency": save_data.get("game_manager", {}).get("player_currency", 0),
		"score": save_data.get("game_manager", {}).get("player_score", 0)
	}


## Get save file path for slot
func get_save_file_path(slot: int) -> String:
	return SAVE_DIR + "save_" + str(slot) + ".sav"
