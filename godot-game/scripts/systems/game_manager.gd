extends Node
## GameManager - Global game state and progression
##
## Singleton that manages:
## - Current level and room
## - Player stats (health, currency, score)
## - Game state (menu, playing, paused, game over)
## - Level progression
## - Save/load system hooks

signal game_state_changed(new_state)
signal level_changed(level_number)
signal room_changed(room_number)
signal player_health_changed(health, max_health)
signal currency_changed(amount)
signal score_changed(score)
signal enemy_killed(enemy_type, combo_count)
signal level_complete(level_number)
signal game_over()

enum GameState {
	MENU,
	PLAYING,
	PAUSED,
	LEVEL_COMPLETE,
	GAME_OVER,
	SHOP,
	STORY_DIALOGUE
}

# Current game state
var current_state: GameState = GameState.MENU

# Level progression
var current_level: int = 1
var current_room: int = 1
var max_level: int = 12
var completed_levels: Array[int] = []

# Player stats
var player_health: float = 100.0
var player_max_health: float = 100.0
var player_currency: int = 0
var player_score: int = 0

# Level stats
var current_level_kills: int = 0
var current_level_accuracy: float = 0.0
var shots_fired: int = 0
var shots_hit: int = 0

# Combo tracking
var current_combo: int = 0
var max_combo: int = 0

# Settings
var difficulty: String = "normal"  # easy, normal, hard
var audio_enabled: bool = true
var music_volume: float = 0.7
var sfx_volume: float = 0.8


func _ready() -> void:
	# Make this a singleton
	if not get_tree().root.has_node("GameManager"):
		name = "GameManager"
		get_tree().root.call_deferred("add_child", self)


## Change game state
func set_game_state(new_state: GameState) -> void:
	if current_state != new_state:
		current_state = new_state
		game_state_changed.emit(new_state)

		match new_state:
			GameState.PLAYING:
				get_tree().paused = false
			GameState.PAUSED, GameState.SHOP, GameState.STORY_DIALOGUE:
				get_tree().paused = true
			GameState.GAME_OVER:
				_on_game_over()


## Start new game
func start_new_game() -> void:
	current_level = 1
	current_room = 1
	player_health = player_max_health
	player_currency = 0
	player_score = 0
	current_combo = 0
	max_combo = 0
	shots_fired = 0
	shots_hit = 0
	current_level_kills = 0
	completed_levels.clear()

	set_game_state(GameState.PLAYING)
	level_changed.emit(current_level)


## Advance to next level
func advance_level() -> void:
	if current_level < max_level:
		completed_levels.append(current_level)
		current_level += 1
		current_room = 1
		current_level_kills = 0
		shots_fired = 0
		shots_hit = 0

		level_changed.emit(current_level)
	else:
		# Game complete!
		set_game_state(GameState.GAME_OVER)


## Advance to next room
func advance_room() -> void:
	current_room += 1
	room_changed.emit(current_room)


## Complete current level
func complete_level() -> void:
	set_game_state(GameState.LEVEL_COMPLETE)
	level_complete.emit(current_level)


## Update player health
func set_player_health(health: float) -> void:
	player_health = clamp(health, 0.0, player_max_health)
	player_health_changed.emit(player_health, player_max_health)

	if player_health <= 0:
		set_game_state(GameState.GAME_OVER)


## Damage player
func damage_player(amount: float) -> void:
	set_player_health(player_health - amount)


## Heal player
func heal_player(amount: float) -> void:
	set_player_health(player_health + amount)


## Add currency
func add_currency(amount: int) -> void:
	player_currency += amount
	currency_changed.emit(player_currency)


## Spend currency (returns true if successful)
func spend_currency(amount: int) -> bool:
	if player_currency >= amount:
		player_currency -= amount
		currency_changed.emit(player_currency)
		return true
	return false


## Add score
func add_score(points: int) -> void:
	player_score += points
	score_changed.emit(player_score)


## Record shot for accuracy tracking
func record_shot(hit: bool) -> void:
	shots_fired += 1
	if hit:
		shots_hit += 1

	if shots_fired > 0:
		current_level_accuracy = float(shots_hit) / float(shots_fired)


## Register enemy kill
func register_enemy_kill(enemy_type: String, combo: int) -> void:
	current_level_kills += 1
	current_combo = combo
	max_combo = max(max_combo, combo)

	enemy_killed.emit(enemy_type, combo)


## Get current accuracy
func get_accuracy() -> float:
	if shots_fired == 0:
		return 0.0
	return float(shots_hit) / float(shots_fired) * 100.0


## Get level stats
func get_level_stats() -> Dictionary:
	return {
		"kills": current_level_kills,
		"accuracy": get_accuracy(),
		"max_combo": max_combo,
		"score": player_score
	}


## Handle game over
func _on_game_over() -> void:
	game_over.emit()


## Reset combo (called when timeout or player hit)
func reset_combo() -> void:
	current_combo = 0
