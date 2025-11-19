extends "res://scripts/pickups/pickup_base.gd"
## HealthPickup - Restores player health

@export var heal_amount: float = 25.0


func _ready() -> void:
	pickup_type = "health"
	super._ready()


func apply_effect(player: Node3D) -> void:
	var game_manager = get_node_or_null("/root/GameManager")
	if game_manager:
		game_manager.heal_player(heal_amount)
		print("[Pickup] Healed for %d HP" % heal_amount)
