extends Control
## Leaderboard - Display high scores and rankings
##
## Features:
## - Local leaderboard
## - Category filtering (score, time, waves)
## - Personal best highlighting

@export var max_entries: int = 10
@export var leaderboard_type: String = "score"  # score, time, survival

@onready var entry_container: VBoxContainer = $Panel/ScrollContainer/EntryContainer
@onready var category_label: Label = $Panel/VBoxContainer/CategoryLabel

var leaderboard_data: Array[Dictionary] = []


func _ready() -> void:
	load_leaderboard()
	display_leaderboard()


## Load leaderboard data
func load_leaderboard() -> void:
	# TODO: Load from save file or server
	# For now, using placeholder data
	leaderboard_data = [
		{"rank": 1, "name": "Player1", "score": 50000, "date": "2024-01-01"},
		{"rank": 2, "name": "Player2", "score": 45000, "date": "2024-01-02"},
		{"rank": 3, "name": "Player3", "score": 40000, "date": "2024-01-03"},
	]


## Display leaderboard
func display_leaderboard() -> void:
	# Clear existing entries
	for child in entry_container.get_children():
		child.queue_free()

	# Update category label
	category_label.text = get_category_name()

	# Create entry for each leaderboard item
	for entry in leaderboard_data:
		create_leaderboard_entry(entry)


## Create single leaderboard entry
func create_leaderboard_entry(data: Dictionary) -> void:
	var entry_panel = PanelContainer.new()
	var hbox = HBoxContainer.new()

	# Rank
	var rank_label = Label.new()
	rank_label.text = "#%d" % data["rank"]
	rank_label.custom_minimum_size = Vector2(50, 0)

	# Name
	var name_label = Label.new()
	name_label.text = data["name"]
	name_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL

	# Score/Time
	var score_label = Label.new()
	match leaderboard_type:
		"score":
			score_label.text = "%d pts" % data["score"]
		"time":
			score_label.text = format_time(data.get("time", 0.0))
		"survival":
			score_label.text = "Wave %d" % data.get("wave", 0)

	# Date
	var date_label = Label.new()
	date_label.text = data.get("date", "")
	date_label.custom_minimum_size = Vector2(100, 0)

	hbox.add_child(rank_label)
	hbox.add_child(name_label)
	hbox.add_child(score_label)
	hbox.add_child(date_label)

	entry_panel.add_child(hbox)
	entry_container.add_child(entry_panel)


## Add new entry to leaderboard
func add_entry(player_name: String, score: int) -> int:
	var new_entry = {
		"name": player_name,
		"score": score,
		"date": Time.get_date_string_from_system()
	}

	# Find insertion position
	var insert_pos = leaderboard_data.size()
	for i in range(leaderboard_data.size()):
		if score > leaderboard_data[i]["score"]:
			insert_pos = i
			break

	# Insert entry
	leaderboard_data.insert(insert_pos, new_entry)

	# Update ranks
	for i in range(leaderboard_data.size()):
		leaderboard_data[i]["rank"] = i + 1

	# Trim to max entries
	if leaderboard_data.size() > max_entries:
		leaderboard_data.resize(max_entries)

	# Save leaderboard
	save_leaderboard()

	# Return rank achieved
	return insert_pos + 1


## Save leaderboard data
func save_leaderboard() -> void:
	# TODO: Save to file
	pass


## Format time display
func format_time(time: float) -> String:
	var minutes = int(time) / 60
	var seconds = int(time) % 60
	return "%02d:%02d" % [minutes, seconds]


## Get category display name
func get_category_name() -> String:
	match leaderboard_type:
		"score":
			return "High Scores"
		"time":
			return "Best Times"
		"survival":
			return "Survival Records"
		_:
			return "Leaderboard"
