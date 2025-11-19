extends Control
## ShopUI - Weapon shop between levels
##
## Features:
## - Buy weapon unlocks
## - Buy upgrades
## - Buy ammo
## - Buy health

signal shop_closed()

@onready var currency_label: Label = $Panel/VBoxContainer/CurrencyLabel
@onready var item_list: VBoxContainer = $Panel/VBoxContainer/ScrollContainer/ItemList
@onready var close_button: Button = $Panel/VBoxContainer/CloseButton

var game_manager: Node
var weapon_system: Node

# Shop items
const SHOP_ITEMS: Array[Dictionary] = [
	{
		"name": "Shotgun Unlock",
		"type": "weapon_unlock",
		"weapon": "shotgun",
		"cost": 500,
		"description": "Unlock the devastating shotgun"
	},
	{
		"name": "Rapid Fire Unlock",
		"type": "weapon_unlock",
		"weapon": "rapid_fire",
		"cost": 800,
		"description": "Unlock the rapid fire weapon"
	},
	{
		"name": "Grappling Hook Unlock",
		"type": "weapon_unlock",
		"weapon": "grappling_hook",
		"cost": 1000,
		"description": "Unlock the grappling hook weapon"
	},
	{
		"name": "Health Restore",
		"type": "health",
		"amount": 50,
		"cost": 200,
		"description": "Restore 50 HP"
	},
	{
		"name": "Max Health Upgrade",
		"type": "max_health",
		"amount": 25,
		"cost": 500,
		"description": "Increase max health by 25"
	},
	{
		"name": "Ammo Refill",
		"type": "ammo",
		"cost": 100,
		"description": "Refill current weapon ammo"
	}
]


func _ready() -> void:
	game_manager = get_node_or_null("/root/GameManager")
	weapon_system = get_node_or_null("/root/WeaponSystem")

	if close_button:
		close_button.pressed.connect(_on_close_pressed)

	populate_shop()
	update_currency_display()


## Populate shop with items
func populate_shop() -> void:
	if not item_list:
		return

	# Clear existing items
	for child in item_list.get_children():
		child.queue_free()

	# Add shop items
	for item in SHOP_ITEMS:
		var item_button = Button.new()
		item_button.text = "%s - $%d\n%s" % [item["name"], item["cost"], item["description"]]
		item_button.custom_minimum_size = Vector2(400, 60)
		item_button.pressed.connect(_on_item_pressed.bind(item))

		# Disable if already owned or can't afford
		if not can_purchase(item):
			item_button.disabled = true

		item_list.add_child(item_button)


## Check if player can purchase item
func can_purchase(item: Dictionary) -> bool:
	if not game_manager:
		return false

	# Check currency
	if game_manager.player_currency < item["cost"]:
		return false

	# Check if weapon already unlocked
	if item["type"] == "weapon_unlock":
		if weapon_system and weapon_system.WEAPON_DATA[item["weapon"]]["unlocked"]:
			return false

	return true


## Handle item purchase
func _on_item_pressed(item: Dictionary) -> void:
	if not game_manager or not can_purchase(item):
		return

	# Deduct cost
	if game_manager.spend_currency(item["cost"]):
		# Apply item effect
		match item["type"]:
			"weapon_unlock":
				if weapon_system:
					weapon_system.unlock_weapon(item["weapon"])
					print("Unlocked weapon: ", item["weapon"])

			"health":
				game_manager.heal_player(item["amount"])

			"max_health":
				game_manager.player_max_health += item["amount"]
				game_manager.set_player_health(game_manager.player_health + item["amount"])

			"ammo":
				if weapon_system:
					weapon_system.add_ammo(weapon_system.get_max_ammo())

		# Refresh shop
		populate_shop()
		update_currency_display()


## Update currency display
func update_currency_display() -> void:
	if currency_label and game_manager:
		currency_label.text = "Currency: $%d" % game_manager.player_currency


## Close shop
func _on_close_pressed() -> void:
	shop_closed.emit()
	queue_free()
