extends Node
## InventorySystem - Item and resource management
##
## Features:
## - Grid-based inventory
## - Item stacking
## - Item categories (weapons, consumables, keys, collectibles)
## - Item rarity
## - Weight/capacity limits

signal item_added(item_id: String, quantity: int)
signal item_removed(item_id: String, quantity: int)
signal item_used(item_id: String)
signal inventory_full()

# Item categories
enum ItemCategory {
	WEAPON,
	AMMO,
	CONSUMABLE,
	KEY,
	COLLECTIBLE,
	QUEST_ITEM,
	UPGRADE
}

# Item rarity
enum ItemRarity {
	COMMON,
	UNCOMMON,
	RARE,
	EPIC,
	LEGENDARY
}

# Inventory data
var inventory: Dictionary = {}  # item_id -> quantity
var max_capacity: int = 100
var current_weight: float = 0.0
var max_weight: float = 50.0

# Item database
const ITEMS: Dictionary = {
	# Ammo
	"pistol_ammo": {
		"name": "Pistol Ammo",
		"category": ItemCategory.AMMO,
		"rarity": ItemRarity.COMMON,
		"stack_size": 50,
		"weight": 0.5,
		"description": "Standard 9mm ammunition"
	},
	"shotgun_shells": {
		"name": "Shotgun Shells",
		"category": ItemCategory.AMMO,
		"rarity": ItemRarity.COMMON,
		"stack_size": 25,
		"weight": 0.8,
		"description": "12-gauge shotgun shells"
	},
	"energy_cell": {
		"name": "Energy Cell",
		"category": ItemCategory.AMMO,
		"rarity": ItemRarity.UNCOMMON,
		"stack_size": 100,
		"weight": 0.3,
		"description": "Power cell for energy weapons"
	},
	"rocket": {
		"name": "Rocket",
		"category": ItemCategory.AMMO,
		"rarity": ItemRarity.RARE,
		"stack_size": 10,
		"weight": 2.0,
		"description": "High-explosive rocket"
	},

	# Consumables
	"medkit": {
		"name": "Medkit",
		"category": ItemCategory.CONSUMABLE,
		"rarity": ItemRarity.COMMON,
		"stack_size": 5,
		"weight": 1.0,
		"description": "Restores 50 health",
		"effect": "heal",
		"effect_value": 50.0
	},
	"armor_plate": {
		"name": "Armor Plate",
		"category": ItemCategory.CONSUMABLE,
		"rarity": ItemRarity.UNCOMMON,
		"stack_size": 3,
		"weight": 2.0,
		"description": "Adds 50 armor",
		"effect": "armor",
		"effect_value": 50.0
	},
	"adrenaline_shot": {
		"name": "Adrenaline Shot",
		"category": ItemCategory.CONSUMABLE,
		"rarity": ItemRarity.RARE,
		"stack_size": 2,
		"weight": 0.5,
		"description": "Increases damage and speed for 30 seconds",
		"effect": "buff",
		"effect_duration": 30.0
	},
	"shield_generator": {
		"name": "Shield Generator",
		"category": ItemCategory.CONSUMABLE,
		"rarity": ItemRarity.EPIC,
		"stack_size": 1,
		"weight": 3.0,
		"description": "Creates temporary shield absorbing 100 damage",
		"effect": "shield",
		"effect_value": 100.0
	},

	# Keys
	"red_keycard": {
		"name": "Red Keycard",
		"category": ItemCategory.KEY,
		"rarity": ItemRarity.UNCOMMON,
		"stack_size": 1,
		"weight": 0.1,
		"description": "Opens red security doors"
	},
	"blue_keycard": {
		"name": "Blue Keycard",
		"category": ItemCategory.KEY,
		"rarity": ItemRarity.UNCOMMON,
		"stack_size": 1,
		"weight": 0.1,
		"description": "Opens blue security doors"
	},
	"master_key": {
		"name": "Master Key",
		"category": ItemCategory.KEY,
		"rarity": ItemRarity.LEGENDARY,
		"stack_size": 1,
		"weight": 0.2,
		"description": "Opens all doors"
	},

	# Collectibles
	"intel_document": {
		"name": "Intel Document",
		"category": ItemCategory.COLLECTIBLE,
		"rarity": ItemRarity.RARE,
		"stack_size": 1,
		"weight": 0.1,
		"description": "Classified intel about the enemy"
	},
	"artifact_shard": {
		"name": "Artifact Shard",
		"category": ItemCategory.COLLECTIBLE,
		"rarity": ItemRarity.EPIC,
		"stack_size": 10,
		"weight": 0.5,
		"description": "Ancient artifact piece"
	},

	# Quest items
	"access_codes": {
		"name": "Access Codes",
		"category": ItemCategory.QUEST_ITEM,
		"rarity": ItemRarity.RARE,
		"stack_size": 1,
		"weight": 0.1,
		"description": "Codes needed to access the mainframe"
	},

	# Upgrades
	"weapon_mod_slot": {
		"name": "Weapon Mod Slot",
		"category": ItemCategory.UPGRADE,
		"rarity": ItemRarity.RARE,
		"stack_size": 5,
		"weight": 0.5,
		"description": "Adds an extra mod slot to a weapon"
	},
	"health_upgrade": {
		"name": "Health Upgrade",
		"category": ItemCategory.UPGRADE,
		"rarity": ItemRarity.EPIC,
		"stack_size": 1,
		"weight": 1.0,
		"description": "Permanently increases max health by 25"
	}
}


## Add item to inventory
func add_item(item_id: String, quantity: int = 1) -> bool:
	if item_id not in ITEMS:
		return false

	var item_data = ITEMS[item_id]

	# Check weight limit
	var total_weight = item_data["weight"] * quantity
	if current_weight + total_weight > max_weight:
		inventory_full.emit()
		return false

	# Check if item exists in inventory
	if item_id in inventory:
		# Check stack limit
		var stack_size = item_data.get("stack_size", 1)
		var new_total = inventory[item_id] + quantity

		if new_total > stack_size:
			# Can't add all, add what we can
			var can_add = stack_size - inventory[item_id]
			if can_add <= 0:
				inventory_full.emit()
				return false

			inventory[item_id] = stack_size
			current_weight += item_data["weight"] * can_add
			item_added.emit(item_id, can_add)
			return false  # Couldn't add full amount

		inventory[item_id] = new_total
	else:
		inventory[item_id] = quantity

	current_weight += total_weight
	item_added.emit(item_id, quantity)

	print("[Inventory] Added: %dx %s" % [quantity, item_data["name"]])
	return true


## Remove item from inventory
func remove_item(item_id: String, quantity: int = 1) -> bool:
	if item_id not in inventory:
		return false

	if inventory[item_id] < quantity:
		return false

	inventory[item_id] -= quantity

	var item_data = ITEMS[item_id]
	current_weight -= item_data["weight"] * quantity

	if inventory[item_id] <= 0:
		inventory.erase(item_id)

	item_removed.emit(item_id, quantity)

	print("[Inventory] Removed: %dx %s" % [quantity, item_data["name"]])
	return true


## Use consumable item
func use_item(item_id: String) -> bool:
	if item_id not in inventory:
		return false

	if item_id not in ITEMS:
		return false

	var item_data = ITEMS[item_id]

	# Only consumables can be used
	if item_data["category"] != ItemCategory.CONSUMABLE:
		return false

	# Apply effect
	apply_item_effect(item_data)

	# Remove one from inventory
	remove_item(item_id, 1)

	item_used.emit(item_id)

	return true


## Apply item effect
func apply_item_effect(item_data: Dictionary) -> void:
	var game_manager = get_node_or_null("/root/GameManager")
	if not game_manager:
		return

	match item_data.get("effect", ""):
		"heal":
			game_manager.heal_player(item_data["effect_value"])
			print("[Inventory] Healed: +%d HP" % item_data["effect_value"])

		"armor":
			# TODO: Add armor system
			print("[Inventory] Added armor: +%d" % item_data["effect_value"])

		"shield":
			var power_up_system = get_node_or_null("/root/PowerUpSystem")
			if power_up_system:
				power_up_system.collect_power_up("shield")
			print("[Inventory] Activated shield")

		"buff":
			# TODO: Apply temporary buff
			print("[Inventory] Buff activated for %ds" % item_data.get("effect_duration", 0))


## Check if has item
func has_item(item_id: String, quantity: int = 1) -> bool:
	if item_id not in inventory:
		return false

	return inventory[item_id] >= quantity


## Get item quantity
func get_item_quantity(item_id: String) -> int:
	return inventory.get(item_id, 0)


## Get item data
func get_item_data(item_id: String) -> Dictionary:
	return ITEMS.get(item_id, {})


## Get all items in category
func get_items_by_category(category: ItemCategory) -> Array[String]:
	var items: Array[String] = []

	for item_id in inventory:
		if item_id not in ITEMS:
			continue

		if ITEMS[item_id]["category"] == category:
			items.append(item_id)

	return items


## Get inventory as array of items
func get_inventory_items() -> Array:
	var items: Array = []

	for item_id in inventory:
		items.append({
			"id": item_id,
			"quantity": inventory[item_id],
			"data": ITEMS.get(item_id, {})
		})

	return items


## Check if inventory is full
func is_inventory_full() -> bool:
	return current_weight >= max_weight


## Get weight percentage
func get_weight_percentage() -> float:
	return (current_weight / max_weight) * 100.0


## Clear inventory
func clear_inventory() -> void:
	inventory.clear()
	current_weight = 0.0


## Sort inventory by category
func get_sorted_inventory() -> Array:
	var items = get_inventory_items()

	items.sort_custom(func(a, b):
		var cat_a = a["data"].get("category", 0)
		var cat_b = b["data"].get("category", 0)
		return cat_a < cat_b
	)

	return items


## Get rarity color
static func get_rarity_color(rarity: ItemRarity) -> Color:
	match rarity:
		ItemRarity.COMMON:
			return Color.WHITE
		ItemRarity.UNCOMMON:
			return Color.GREEN
		ItemRarity.RARE:
			return Color.BLUE
		ItemRarity.EPIC:
			return Color.PURPLE
		ItemRarity.LEGENDARY:
			return Color.ORANGE
		_:
			return Color.WHITE


## Save inventory to dictionary
func save_to_dict() -> Dictionary:
	return {
		"inventory": inventory.duplicate(),
		"current_weight": current_weight
	}


## Load inventory from dictionary
func load_from_dict(data: Dictionary) -> void:
	inventory = data.get("inventory", {})
	current_weight = data.get("current_weight", 0.0)
