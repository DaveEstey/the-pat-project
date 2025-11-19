extends "res://scripts/pickups/pickup_base.gd"
## PowerUpPickup - Grants temporary power-up

@export var power_up_id: String = "damage_boost"


func _ready() -> void:
	pickup_type = "power_up"
	super._ready()


func apply_effect(player: Node3D) -> void:
	var power_up_system = get_node_or_null("/root/PowerUpSystem")
	if power_up_system:
		power_up_system.collect_power_up(power_up_id)
