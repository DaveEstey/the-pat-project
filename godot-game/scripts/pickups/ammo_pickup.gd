extends "res://scripts/pickups/pickup_base.gd"
## AmmoPickup - Restores weapon ammo

@export var ammo_amount: int = 10


func _ready() -> void:
	pickup_type = "ammo"
	super._ready()


func apply_effect(player: Node3D) -> void:
	var weapon_system = get_node_or_null("/root/WeaponSystem")
	if weapon_system:
		weapon_system.add_ammo(ammo_amount)
		print("[Pickup] Added %d ammo" % ammo_amount)
