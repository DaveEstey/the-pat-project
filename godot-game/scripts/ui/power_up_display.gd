extends Control
## PowerUpDisplay - Shows active power-ups with timers
##
## Features:
## - Icon and timer for each active power-up
## - Auto-update from PowerUpSystem
## - Pulse animation for low time

@onready var power_up_container: VBoxContainer = $VBoxContainer

var power_up_system: Node
var active_displays: Dictionary = {}  # power_up_id -> UI element


func _ready() -> void:
	power_up_system = get_node_or_null("/root/PowerUpSystem")

	if power_up_system:
		power_up_system.power_up_active_changed.connect(_on_power_up_changed)


func _process(_delta: float) -> void:
	if not power_up_system:
		return

	# Update timers for active power-ups
	for power_up_id in active_displays.keys():
		if not power_up_system.is_active(power_up_id):
			remove_power_up_display(power_up_id)
			continue

		var remaining = power_up_system.get_remaining_duration(power_up_id)
		update_power_up_timer(power_up_id, remaining)


## Handle power-up activation/deactivation
func _on_power_up_changed(power_up_id: String, active: bool) -> void:
	if active:
		add_power_up_display(power_up_id)
	else:
		remove_power_up_display(power_up_id)


## Add power-up to display
func add_power_up_display(power_up_id: String) -> void:
	if power_up_id in active_displays:
		return

	var power_up_data = power_up_system.POWER_UP_DATA[power_up_id]

	# Create UI element
	var power_up_panel = PanelContainer.new()
	var hbox = HBoxContainer.new()

	var icon_label = Label.new()
	icon_label.text = get_power_up_icon(power_up_id)
	icon_label.custom_minimum_size = Vector2(30, 30)

	var name_label = Label.new()
	name_label.text = power_up_data["name"]
	name_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL

	var timer_label = Label.new()
	timer_label.name = "Timer"
	timer_label.text = "%.1fs" % power_up_data["duration"]

	hbox.add_child(icon_label)
	hbox.add_child(name_label)
	hbox.add_child(timer_label)

	power_up_panel.add_child(hbox)
	power_up_container.add_child(power_up_panel)

	active_displays[power_up_id] = power_up_panel


## Remove power-up from display
func remove_power_up_display(power_up_id: String) -> void:
	if power_up_id not in active_displays:
		return

	var display = active_displays[power_up_id]
	display.queue_free()
	active_displays.erase(power_up_id)


## Update timer label
func update_power_up_timer(power_up_id: String, remaining: float) -> void:
	if power_up_id not in active_displays:
		return

	var display = active_displays[power_up_id]
	var timer_label = display.find_child("Timer", true, false) as Label

	if timer_label:
		timer_label.text = "%.1fs" % remaining

		# Pulse if low time
		if remaining < 3.0:
			timer_label.modulate = Color.RED
		else:
			timer_label.modulate = Color.WHITE


## Get icon for power-up
func get_power_up_icon(power_up_id: String) -> String:
	match power_up_id:
		"damage_boost":
			return "⚔️"
		"rapid_fire":
			return "⚡"
		"shield":
			return "🛡️"
		"speed_boost":
			return "💨"
		"infinite_ammo":
			return "∞"
		"invincibility":
			return "✨"
		"double_currency":
			return "💰"
		"slow_motion":
			return "⏱️"
		_:
			return "⭐"
