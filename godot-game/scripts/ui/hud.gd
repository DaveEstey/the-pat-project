extends Control
## HUD - Heads-up display for player info
##
## Displays:
## - Health bar
## - Ammo count
## - Combo counter
## - Score
## - Currency
## - Crosshair

@onready var health_bar: ProgressBar = $MarginContainer/VBoxContainer/HealthBar
@onready var health_label: Label = $MarginContainer/VBoxContainer/HealthBar/HealthLabel

@onready var ammo_label: Label = $MarginContainer/VBoxContainer/AmmoLabel
@onready var weapon_name_label: Label = $MarginContainer/VBoxContainer/WeaponNameLabel

@onready var combo_label: Label = $MarginContainer/TopRight/VBoxContainer/ComboLabel
@onready var score_label: Label = $MarginContainer/TopRight/VBoxContainer/ScoreLabel
@onready var currency_label: Label = $MarginContainer/TopRight/VBoxContainer/CurrencyLabel

@onready var crosshair: TextureRect = $Crosshair

# Systems
var game_manager: Node
var weapon_system: Node
var combo_system: Node


func _ready() -> void:
	# Get systems
	game_manager = get_node_or_null("/root/GameManager")
	weapon_system = get_node_or_null("/root/WeaponSystem")
	combo_system = get_node_or_null("/root/ComboSystem")

	# Connect signals
	if game_manager:
		game_manager.player_health_changed.connect(_on_health_changed)
		game_manager.currency_changed.connect(_on_currency_changed)
		game_manager.score_changed.connect(_on_score_changed)

	if weapon_system:
		weapon_system.weapon_switched.connect(_on_weapon_switched)
		weapon_system.ammo_changed.connect(_on_ammo_changed)

	if combo_system:
		combo_system.combo_increased.connect(_on_combo_changed)
		combo_system.combo_broken.connect(_on_combo_broken)

	# Initial update
	update_all()


func _process(_delta: float) -> void:
	# Update combo display
	if combo_system:
		var combo = combo_system.get_combo()
		var multiplier = combo_system.get_multiplier()

		if combo > 0:
			combo_label.text = "COMBO: %d (x%.1f)" % [combo, multiplier]
			combo_label.visible = true
		else:
			combo_label.visible = false


## Update all HUD elements
func update_all() -> void:
	if game_manager:
		_on_health_changed(game_manager.player_health, game_manager.player_max_health)
		_on_currency_changed(game_manager.player_currency)
		_on_score_changed(game_manager.player_score)

	if weapon_system:
		_on_weapon_switched(weapon_system.current_weapon)
		_on_ammo_changed(weapon_system.get_current_ammo(), weapon_system.get_max_ammo())


## Health changed callback
func _on_health_changed(health: float, max_health: float) -> void:
	if health_bar:
		health_bar.max_value = max_health
		health_bar.value = health

	if health_label:
		health_label.text = "%d / %d HP" % [int(health), int(max_health)]

	# Change color based on health percentage
	var health_percent = health / max_health
	if health_bar:
		if health_percent > 0.5:
			health_bar.modulate = Color.GREEN
		elif health_percent > 0.25:
			health_bar.modulate = Color.YELLOW
		else:
			health_bar.modulate = Color.RED


## Ammo changed callback
func _on_ammo_changed(current: int, max_ammo: int) -> void:
	if ammo_label:
		ammo_label.text = "AMMO: %d / %d" % [current, max_ammo]

		# Change color if low
		if current <= max_ammo * 0.25:
			ammo_label.modulate = Color.RED
		else:
			ammo_label.modulate = Color.WHITE


## Weapon switched callback
func _on_weapon_switched(weapon_name: String) -> void:
	if weapon_name_label:
		weapon_name_label.text = weapon_name.to_upper()


## Currency changed callback
func _on_currency_changed(amount: int) -> void:
	if currency_label:
		currency_label.text = "$%d" % amount


## Score changed callback
func _on_score_changed(score: int) -> void:
	if score_label:
		score_label.text = "SCORE: %d" % score


## Combo changed callback
func _on_combo_changed(combo: int, multiplier: float) -> void:
	# Handled in _process for smooth updates
	pass


## Combo broken callback
func _on_combo_broken(final_combo: int) -> void:
	if combo_label:
		combo_label.visible = false
