extends Node
## DamageNumberSpawner - Spawns floating damage numbers
##
## Features:
## - Pooling for performance
## - Batch spawning
## - Multiple damage types

var damage_number_scene: PackedScene
var number_pool: Array[Node3D] = []
var max_pool_size: int = 50


## Spawn damage number
func spawn_damage_number(position: Vector3, damage: float, critical: bool = false) -> void:
	var number = get_pooled_number()

	if not number:
		# TODO: Create from scene when available
		# number = damage_number_scene.instantiate()
		return

	number.global_position = position
	number.setup(damage, critical, false)

	get_tree().root.add_child(number)


## Spawn heal number
func spawn_heal_number(position: Vector3, heal_amount: float) -> void:
	var number = get_pooled_number()

	if not number:
		return

	number.global_position = position
	number.setup(heal_amount, false, true)

	get_tree().root.add_child(number)


## Get number from pool
func get_pooled_number() -> Node3D:
	if number_pool.is_empty():
		return null

	return number_pool.pop_back()


## Return number to pool
func return_to_pool(number: Node3D) -> void:
	if number_pool.size() >= max_pool_size:
		number.queue_free()
		return

	number.get_parent().remove_child(number)
	number_pool.append(number)
