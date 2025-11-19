extends Control
## AchievementNotification - Popup notification for unlocked achievements
##
## Features:
## - Slide-in animation
## - Auto-dismiss after duration
## - Queue multiple achievements

@export var display_duration: float = 4.0
@export var slide_speed: float = 300.0

@onready var achievement_name: Label = $Panel/VBoxContainer/AchievementName
@onready var achievement_description: Label = $Panel/VBoxContainer/AchievementDescription
@onready var panel: Panel = $Panel

var is_showing: bool = false
var show_timer: float = 0.0
var initial_position: Vector2
var target_position: Vector2
var achievement_queue: Array[Dictionary] = []


func _ready() -> void:
	# Connect to achievement system
	var achievement_system = get_node_or_null("/root/AchievementSystem")
	if achievement_system:
		achievement_system.achievement_unlocked.connect(_on_achievement_unlocked)

	# Setup positions for slide-in
	initial_position = position
	target_position = position
	position.x = get_viewport_rect().size.x  # Start off-screen right

	hide()


func _process(delta: float) -> void:
	if is_showing:
		# Update timer
		show_timer += delta

		# Slide in/out animation
		if show_timer < 0.5:
			# Slide in
			position.x = lerp(get_viewport_rect().size.x, target_position.x, show_timer / 0.5)
		elif show_timer >= display_duration - 0.5:
			# Slide out
			var out_progress = (show_timer - (display_duration - 0.5)) / 0.5
			position.x = lerp(target_position.x, get_viewport_rect().size.x, out_progress)

		# Dismiss after duration
		if show_timer >= display_duration:
			dismiss()


## Handle achievement unlocked
func _on_achievement_unlocked(achievement_id: String) -> void:
	var achievement_system = get_node("/root/AchievementSystem")
	if not achievement_system:
		return

	var achievement = achievement_system.ACHIEVEMENTS[achievement_id]

	# Add to queue
	achievement_queue.append({
		"name": achievement["name"],
		"description": achievement["description"]
	})

	# Show if not currently showing
	if not is_showing:
		show_next()


## Show next achievement in queue
func show_next() -> void:
	if achievement_queue.is_empty():
		return

	var achievement = achievement_queue.pop_front()

	achievement_name.text = "🏆 " + achievement["name"]
	achievement_description.text = achievement["description"]

	is_showing = true
	show_timer = 0.0
	show()


## Dismiss current achievement
func dismiss() -> void:
	is_showing = false
	hide()

	# Show next in queue after brief delay
	if not achievement_queue.is_empty():
		await get_tree().create_timer(0.5).timeout
		show_next()
