extends Control
## BossHealthBar - Special health bar for boss enemies
##
## Features:
## - Large prominent display
## - Phase indicators
## - Boss name display
## - Smooth health transition

@export var boss_name_text: String = "BOSS"
@export var current_phase: int = 1
@export var max_phases: int = 3

@onready var health_bar: ProgressBar = $Panel/VBoxContainer/HealthBar
@onready var boss_name_label: Label = $Panel/VBoxContainer/BossNameLabel
@onready var phase_label: Label = $Panel/VBoxContainer/PhaseLabel

var target_health: float = 100.0
var displayed_health: float = 100.0
var max_health: float = 100.0
var boss_node: Node3D = null


func _ready() -> void:
	hide()


func _process(delta: float) -> void:
	if not visible or not boss_node or not is_instance_valid(boss_node):
		return

	# Update health from boss
	if boss_node.has_method("get") and boss_node.get("current_health") != null:
		target_health = boss_node.current_health
		max_health = boss_node.max_health

	# Smooth health transition
	displayed_health = lerp(displayed_health, target_health, 5.0 * delta)

	# Update UI
	health_bar.max_value = max_health
	health_bar.value = displayed_health

	# Update phase if boss has phase system
	if boss_node.has_method("get") and boss_node.get("current_phase") != null:
		current_phase = boss_node.current_phase
		phase_label.text = "Phase %d/%d" % [current_phase, max_phases]


## Show boss health bar
func show_boss_health(boss: Node3D) -> void:
	boss_node = boss

	# Get boss info
	if boss.has_method("get"):
		if boss.get("boss_name") != null:
			boss_name_text = boss.boss_name
		if boss.get("num_phases") != null:
			max_phases = boss.num_phases
		if boss.get("max_health") != null:
			max_health = boss.max_health
			target_health = boss.current_health if boss.get("current_health") != null else max_health
			displayed_health = target_health

	# Update labels
	boss_name_label.text = boss_name_text
	phase_label.text = "Phase 1/%d" % max_phases

	# Show
	show()

	# Connect to boss death
	if boss.has_signal("boss_defeated"):
		boss.boss_defeated.connect(_on_boss_defeated)


## Hide boss health bar
func hide_boss_health() -> void:
	boss_node = null
	hide()


## Handle boss defeat
func _on_boss_defeated() -> void:
	# Animate out
	await get_tree().create_timer(2.0).timeout
	hide_boss_health()
