extends Control
## Minimap - Real-time minimap with fog of war
##
## Features:
## - Top-down view of current level
## - Player position and rotation indicator
## - Enemy markers (only if in line of sight)
## - Objective markers
## - Fog of war (explored/unexplored areas)
## - Zoom controls

signal marker_clicked(marker_id: String)

@export var minimap_size: Vector2 = Vector2(200, 200)
@export var zoom_level: float = 1.0
@export var min_zoom: float = 0.5
@export var max_zoom: float = 3.0

@export var update_rate: float = 0.1  # Update every 0.1 seconds
@export var fog_reveal_radius: float = 15.0  # Radius around player to reveal

@export var show_enemies: bool = true
@export var show_objectives: bool = true
@export var show_pickups: bool = false

var world_size: Vector2 = Vector2(100, 100)
var world_offset: Vector2 = Vector2.ZERO

var fog_of_war_texture: ImageTexture
var fog_of_war_image: Image
var fog_resolution: Vector2i = Vector2i(200, 200)

var player_node: Node3D = null
var update_timer: float = 0.0

# UI nodes
@onready var minimap_panel: Panel = $Panel
@onready var minimap_viewport: SubViewport = $Panel/SubViewport
@onready var minimap_camera: Camera3D = $Panel/SubViewport/Camera3D
@onready var player_marker: TextureRect = $Panel/PlayerMarker
@onready var fog_overlay: TextureRect = $Panel/FogOverlay
@onready var markers_container: Control = $Panel/Markers


func _ready() -> void:
	# Setup minimap panel
	custom_minimum_size = minimap_size

	# Initialize fog of war
	initialize_fog_of_war()

	# Setup camera for top-down view
	setup_minimap_camera()

	# Find player
	player_node = get_tree().get_first_node_in_group("player")


func _process(delta: float) -> void:
	update_timer += delta

	if update_timer >= update_rate:
		update_timer = 0.0
		update_minimap()


## Initialize fog of war texture
func initialize_fog_of_war() -> void:
	# Create fog image (black = unexplored, transparent = explored)
	fog_of_war_image = Image.create(fog_resolution.x, fog_resolution.y, false, Image.FORMAT_RGBA8)
	fog_of_war_image.fill(Color(0, 0, 0, 1))  # Start fully fogged

	fog_of_war_texture = ImageTexture.create_from_image(fog_of_war_image)

	if fog_overlay:
		fog_overlay.texture = fog_of_war_texture


## Setup minimap camera
func setup_minimap_camera() -> void:
	if not minimap_camera:
		return

	minimap_camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	minimap_camera.size = 50.0  # Orthographic size
	minimap_camera.rotation_degrees = Vector3(-90, 0, 0)  # Look down


## Update minimap
func update_minimap() -> void:
	if not player_node:
		player_node = get_tree().get_first_node_in_group("player")
		if not player_node:
			return

	# Update camera position to follow player
	if minimap_camera:
		minimap_camera.global_position = player_node.global_position + Vector3(0, 30, 0)
		minimap_camera.size = 50.0 / zoom_level

	# Update player marker rotation
	if player_marker:
		var player_rotation = player_node.global_rotation.y
		player_marker.rotation = -player_rotation

	# Update fog of war
	update_fog_of_war()

	# Update enemy markers
	if show_enemies:
		update_enemy_markers()

	# Update objective markers
	if show_objectives:
		update_objective_markers()


## Update fog of war
func update_fog_of_war() -> void:
	if not player_node or not fog_of_war_image:
		return

	var player_pos_2d = world_to_fog_coordinates(player_node.global_position)

	# Reveal area around player
	var radius_pixels = int(fog_reveal_radius * (fog_resolution.x / world_size.x))

	for x in range(-radius_pixels, radius_pixels + 1):
		for y in range(-radius_pixels, radius_pixels + 1):
			var distance = sqrt(x * x + y * y)
			if distance <= radius_pixels:
				var pixel_x = int(player_pos_2d.x) + x
				var pixel_y = int(player_pos_2d.y) + y

				if pixel_x >= 0 and pixel_x < fog_resolution.x and pixel_y >= 0 and pixel_y < fog_resolution.y:
					# Calculate fade based on distance
					var fade = 1.0 - (distance / radius_pixels)
					var current_alpha = fog_of_war_image.get_pixel(pixel_x, pixel_y).a

					# Make less foggy (reduce alpha)
					var new_alpha = max(0.0, current_alpha - (fade * 0.1))

					fog_of_war_image.set_pixel(pixel_x, pixel_y, Color(0, 0, 0, new_alpha))

	# Update texture
	fog_of_war_texture.update(fog_of_war_image)


## Update enemy markers
func update_enemy_markers() -> void:
	if not markers_container:
		return

	# Clear old markers
	for child in markers_container.get_children():
		if child.has_meta("marker_type") and child.get_meta("marker_type") == "enemy":
			child.queue_free()

	# Get all enemies
	var enemies = get_tree().get_nodes_in_group("enemy")

	for enemy in enemies:
		if not enemy.has_method("is_alive") or not enemy.is_alive():
			continue

		# Check if player can see enemy (optional: only show visible enemies)
		if not is_enemy_visible_to_player(enemy):
			continue

		# Create marker
		create_enemy_marker(enemy)


## Check if enemy is visible to player
func is_enemy_visible_to_player(enemy: Node3D) -> bool:
	if not player_node:
		return false

	# Check distance
	var distance = player_node.global_position.distance_to(enemy.global_position)
	if distance > fog_reveal_radius * 2:
		return false

	# TODO: Add line-of-sight check with raycast
	return true


## Create enemy marker on minimap
func create_enemy_marker(enemy: Node3D) -> void:
	if not markers_container:
		return

	var marker = ColorRect.new()
	marker.color = Color.RED
	marker.custom_minimum_size = Vector2(6, 6)
	marker.set_meta("marker_type", "enemy")
	marker.set_meta("target_node", enemy)

	# Position marker
	var screen_pos = world_to_minimap_position(enemy.global_position)
	marker.position = screen_pos - (marker.custom_minimum_size / 2)

	markers_container.add_child(marker)


## Update objective markers
func update_objective_markers() -> void:
	# TODO: Get objectives from quest system
	pass


## World position to fog of war coordinates
func world_to_fog_coordinates(world_pos: Vector3) -> Vector2:
	var normalized_x = (world_pos.x - world_offset.x + world_size.x / 2) / world_size.x
	var normalized_z = (world_pos.z - world_offset.y + world_size.y / 2) / world_size.y

	var fog_x = int(normalized_x * fog_resolution.x)
	var fog_y = int(normalized_z * fog_resolution.y)

	return Vector2(fog_x, fog_y)


## World position to minimap UI position
func world_to_minimap_position(world_pos: Vector3) -> Vector2:
	var normalized_x = (world_pos.x - world_offset.x + world_size.x / 2) / world_size.x
	var normalized_z = (world_pos.z - world_offset.y + world_size.y / 2) / world_size.y

	var map_x = normalized_x * minimap_size.x
	var map_y = normalized_z * minimap_size.y

	return Vector2(map_x, map_y)


## Zoom in
func zoom_in(amount: float = 0.1) -> void:
	zoom_level = min(zoom_level + amount, max_zoom)


## Zoom out
func zoom_out(amount: float = 0.1) -> void:
	zoom_level = max(zoom_level - amount, min_zoom)


## Reset fog of war (for new level)
func reset_fog_of_war() -> void:
	if fog_of_war_image:
		fog_of_war_image.fill(Color(0, 0, 0, 1))
		fog_of_war_texture.update(fog_of_war_image)


## Set world boundaries
func set_world_size(size: Vector2, offset: Vector2 = Vector2.ZERO) -> void:
	world_size = size
	world_offset = offset


## Toggle minimap visibility
func toggle_minimap() -> void:
	visible = !visible


## Create objective marker
func create_objective_marker(world_pos: Vector3, marker_name: String, color: Color = Color.YELLOW) -> void:
	if not markers_container:
		return

	var marker = ColorRect.new()
	marker.color = color
	marker.custom_minimum_size = Vector2(8, 8)
	marker.set_meta("marker_type", "objective")
	marker.set_meta("marker_name", marker_name)

	var screen_pos = world_to_minimap_position(world_pos)
	marker.position = screen_pos - (marker.custom_minimum_size / 2)

	markers_container.add_child(marker)


## Remove objective marker
func remove_objective_marker(marker_name: String) -> void:
	if not markers_container:
		return

	for child in markers_container.get_children():
		if child.has_meta("marker_type") and child.get_meta("marker_type") == "objective":
			if child.get_meta("marker_name") == marker_name:
				child.queue_free()


## Clear all markers
func clear_all_markers() -> void:
	if not markers_container:
		return

	for child in markers_container.get_children():
		child.queue_free()
