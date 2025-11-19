extends "res://scripts/pickups/pickup_base.gd"
## CurrencyPickup - Grants currency/money

@export var currency_value: int = 50


func _ready() -> void:
	pickup_type = "currency"
	super._ready()


func apply_effect(player: Node3D) -> void:
	var game_manager = get_node_or_null("/root/GameManager")
	var power_up_system = get_node_or_null("/root/PowerUpSystem")

	if game_manager:
		var multiplier = 1.0
		if power_up_system:
			multiplier = power_up_system.get_currency_multiplier()

		var final_value = int(currency_value * multiplier)
		game_manager.add_currency(final_value)
		print("[Pickup] Collected $%d" % final_value)
